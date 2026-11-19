import { test as base, expect, Page, ConsoleMessage } from '@playwright/test';
import { runCLI } from '@wp-playground/cli';
import fs from 'node:fs';
import net from 'node:net';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Host-side paths for the plugin and theme.
 *
 * The sanctuarywatch_graphicdata repo is organized as a wp-content overlay:
 * the repo root contains `plugins/`, `themes/`, `tests/`, etc. side-by-side,
 * exactly as a WordPress wp-content directory is laid out. This file lives
 * at <repo-root>/tests/e2e/fixtures/playground.ts, so three directories up
 * from __dirname is the repo root (= the virtual wp-content).
 */
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const PLUGIN_HOST_PATH = path.resolve(REPO_ROOT, 'plugins', 'graphic_data_plugin');
const THEME_HOST_PATH = path.resolve(REPO_ROOT, 'themes', 'graphic_data_theme');

/**
 * Extended test with Playground-aware fixtures.
 *
 * Fixtures exposed:
 *   - serverUrl:          Base URL of the Playground HTTP server.
 *   - adminPage:          Logged-in admin Page with console/pageerror
 *                         listeners attached. Any JS error or
 *                         console.error fails the test at teardown.
 *   - allowConsoleErrors: Opt out of strict JS-error assertion for
 *                         known-noisy tests.
 */

type PlaygroundFixtures = {
    serverUrl: string;
    adminPage: Page;
    allowConsoleErrors: (patterns?: RegExp[]) => void;
};

type WorkerFixtures = {
    playgroundServer: PlaygroundSite;
};

export const test = base.extend<PlaygroundFixtures, WorkerFixtures>({
    /**
     * Worker-scoped: one Playground server per parallel worker.
     *
     * @wp-playground/cli v3.x API notes:
     *   - `blueprint` is a parsed JSON object (NOT a filepath).
     *   - `mount` is an ARRAY of { hostPath, vfsPath } pairs. (In v2.x it
     *     was an object; they flipped it.)
     *   - `php` and `wp` must be passed as top-level options; the CLI
     *     does NOT read preferredVersions from the blueprint at boot.
     *   - `wp: 'latest'` worked on a 2.x CLI bug where it resolved to
     *     the 2014 7.0-RC2 beta. Pinning a real version is more reliable
     *     across CLI updates anyway.
     */
    playgroundServer: [
        async ({}, use) => {
            const site = await startPlayground();
            await use(site);
            await site.close();
        },
        { scope: 'worker', timeout: 180_000 },
    ],

    /** Convenience: just the URL string. */
    serverUrl: async ({ playgroundServer }, use) => {
        await use(playgroundServer.serverUrl);
    },

    /**
     * Test-scoped: a Page that's already logged in as admin and wired with
     * JS error listeners. At teardown we assert zero console errors and
     * zero uncaught page errors — unless the test opted out.
     */
    adminPage: async ({ browser, serverUrl }, use, testInfo) => {
        const context = await browser.newContext({ baseURL: serverUrl });
        const page = await context.newPage();

        const errors: string[] = [];
        const allowedPatterns: RegExp[] = [
            /heartbeat\.php/i,
            /wp-emoji-release/i,
            /cron\.php/i,
        ];

        page.on('console', (msg: ConsoleMessage) => {
            if (msg.type() !== 'error') return;
            const text = msg.text();
            if (allowedPatterns.some((re) => re.test(text))) return;
            errors.push(`console.error: ${text}`);
        });
        page.on('pageerror', (err) => {
            const text = err.message;
            if (allowedPatterns.some((re) => re.test(text))) return;
            errors.push(`pageerror: ${text}`);
        });

        const allowConsoleErrors = (patterns: RegExp[] = []) => {
            allowedPatterns.push(...patterns);
            for (let i = errors.length - 1; i >= 0; i--) {
                if (patterns.some((re) => re.test(errors[i]))) errors.splice(i, 1);
            }
        };
        (page as any).__allowConsoleErrors = allowConsoleErrors;

        await loginAsAdmin(page, serverUrl);

        await use(page);

        if (errors.length > 0) {
            await testInfo.attach('js-errors.txt', {
                body: errors.join('\n'),
                contentType: 'text/plain',
            });
            if (!(page as any).__consoleErrorsAllowedAll) {
                throw new Error(
                    `Test produced ${errors.length} unexpected JS error(s):\n` +
                        errors.join('\n'),
                );
            }
        }

        await context.close();
    },

    allowConsoleErrors: async ({ adminPage }, use) => {
        const fn = (patterns?: RegExp[]) => {
            if (!patterns || patterns.length === 0) {
                (adminPage as any).__consoleErrorsAllowedAll = true;
            } else {
                (adminPage as any).__allowConsoleErrors?.(patterns);
            }
        };
        await use(fn);
    },
});

export { expect };

export type PlaygroundSite = {
    serverUrl: string;
    /** Playground's PHP API, for running PHP against the site (`run({ code })`). */
    playground: any;
    close: () => Promise<void>;
};

/**
 * Boot a Playground server with the local plugin and theme mounted.
 *
 * Specs that need more than one site (for example the Content Transfer
 * round trip) call this directly; other specs use the playgroundServer
 * fixture.
 *
 * @wp-playground/cli API notes:
 *   - `blueprint` is a parsed JSON object (NOT a filepath).
 *   - `mount` is an ARRAY of { hostPath, vfsPath } pairs.
 *   - `php` and `wp` must be passed as top-level options; the CLI
 *     does NOT read preferredVersions from the blueprint at boot.
 *   - Pinning a real `wp` version is more reliable across CLI updates
 *     than 'latest'.
 *   - v3.x returns `serverUrl`; the locked v1.x only returns the HTTP
 *     server, so the URL is built from its port.
 *
 * @param options.tutorialContent Seed the tutorial content (default true).
 *                                Without it the site has the plugin and
 *                                theme but no Graphic Data content.
 */
export async function startPlayground(
    { tutorialContent = true }: { tutorialContent?: boolean } = {},
): Promise<PlaygroundSite> {
    const blueprintPath = path.resolve(
        __dirname,
        '..',
        'blueprints',
        'blueprint.test.json',
    );
    const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));
    if (!tutorialContent) {
        blueprint.steps = blueprint.steps.filter(
            (step: any) =>
                !(step.step === 'runPHP' && step.code.includes('create_playground_tutorial_content')) &&
                !(step.step === 'setSiteOptions' && step.options?.graphic_data_settings),
        );
        blueprint.steps.push({
            step: 'setSiteOptions',
            options: { blueprint_setup_notice: 'success' },
        });
    }

    // Fail fast with a clear error if either host path is missing.
    if (!fs.existsSync(PLUGIN_HOST_PATH)) {
        throw new Error(
            `Plugin directory not found at ${PLUGIN_HOST_PATH}. ` +
                `Edit PLUGIN_HOST_PATH in fixtures/playground.ts if your ` +
                `graphic_data_plugin lives somewhere else.`,
        );
    }
    if (!fs.existsSync(THEME_HOST_PATH)) {
        throw new Error(
            `Theme directory not found at ${THEME_HOST_PATH}. ` +
                `Edit THEME_HOST_PATH in fixtures/playground.ts if your ` +
                `graphic_data_theme lives somewhere else.`,
        );
    }

    const cli: any = await runCLI({
        command: 'server',
        php: '8.3',
        wp: '6.8',
        // Without a port every site asks for 9400; a second site then
        // listens elsewhere but its WordPress address still says 9400.
        port: await getFreePort(),
        blueprint,
        mount: [
            {
                hostPath: PLUGIN_HOST_PATH,
                vfsPath: '/wordpress/wp-content/plugins/graphic_data_plugin',
            },
            {
                hostPath: THEME_HOST_PATH,
                vfsPath: '/wordpress/wp-content/themes/graphic_data_theme',
            },
        ],
    });
    const serverUrl: string =
        cli.serverUrl ?? `http://127.0.0.1:${cli.server.address().port}`;
    const close = async () => {
        await new Promise((resolve) => cli.server?.close(resolve));
    };

    // Sanity-check blueprint success before running any tests.
    //
    // We disable redirect-following so an infinite redirect loop
    // (which previously happened when the helper hooked `init`
    // instead of `muplugins_loaded`) surfaces as a clear HTTP
    // status rather than a 20-deep "redirect count exceeded" from
    // undici.
    const statusUrl = `${serverUrl}/?graphic_data_test_status=1`;
    const res = await fetch(statusUrl, { redirect: 'manual' });

    if (res.status !== 200) {
        await close();
        throw new Error(
            `Status endpoint returned HTTP ${res.status} (expected 200). ` +
                `Location header: ${res.headers.get('location') ?? 'none'}. ` +
                `This usually means the helper mu-plugin isn't being loaded, ` +
                `or WordPress is canonicalizing the URL before our handler runs.`,
        );
    }

    const status: any = await res.json();
    if (status.setup !== 'success') {
        await close();
        throw new Error(
            `Blueprint setup did not complete cleanly. ` +
                `Status endpoint returned: ${JSON.stringify(status)}`,
        );
    }

    return { serverUrl, playground: cli.playground, close };
}

/** A port nothing is listening on. */
function getFreePort(): Promise<number> {
    return new Promise((resolve, reject) => {
        const server = net.createServer();
        server.unref();
        server.on('error', reject);
        server.listen(0, '127.0.0.1', () => {
            const { port } = server.address() as net.AddressInfo;
            server.close(() => resolve(port));
        });
    });
}

/**
 * Log in as admin via wp-login.php. The blueprint's `login: true` creates
 * a session only for the request that applied the blueprint; test pages
 * launch fresh browser contexts with no cookies, so we re-auth here.
 */
export async function loginAsAdmin(page: Page, serverUrl: string): Promise<void> {
    // Visiting the form sets WordPress's test cookie. The form is then
    // posted directly: typing into it races wp-login.php's own script,
    // which can empty the password field as it starts.
    await page.goto(`${serverUrl}/wp-login.php`);
    if (await page.locator('#loginform').isVisible().catch(() => false)) {
        await page.request.post(`${serverUrl}/wp-login.php`, {
            form: {
                log: 'admin',
                pwd: 'password',
                'wp-submit': 'Log In',
                redirect_to: `${serverUrl}/wp-admin/`,
                testcookie: '1',
            },
        });
        await page.goto(`${serverUrl}/wp-admin/`);
        await page.waitForURL(/wp-admin/);
        await expect(page.locator('#loginform')).toHaveCount(0);
    }
}
