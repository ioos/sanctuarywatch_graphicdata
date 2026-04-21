import { test as base, expect, Page, ConsoleMessage } from '@playwright/test';
import { runCLI } from '@wp-playground/cli';
import fs from 'node:fs';
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
    playgroundServer: { serverUrl: string; close: () => Promise<void> };
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
            const blueprintPath = path.resolve(
                __dirname,
                '..',
                'blueprints',
                'blueprint.test.json',
            );
            const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8'));

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

            const cli = await runCLI({
                command: 'server',
                php: '8.3',
                wp: '6.8',
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

            // Sanity-check blueprint success before running any tests.
            //
            // We disable redirect-following so an infinite redirect loop
            // (which previously happened when the helper hooked `init`
            // instead of `muplugins_loaded`) surfaces as a clear HTTP
            // status rather than a 20-deep "redirect count exceeded" from
            // undici.
            const statusUrl = `${cli.serverUrl}/?graphic_data_test_status=1`;
            const res = await fetch(statusUrl, { redirect: 'manual' });

            if (res.status !== 200) {
                await cli.server?.close();
                throw new Error(
                    `Status endpoint returned HTTP ${res.status} (expected 200). ` +
                        `Location header: ${res.headers.get('location') ?? 'none'}. ` +
                        `This usually means the helper mu-plugin isn't being loaded, ` +
                        `or WordPress is canonicalizing the URL before our handler runs.`,
                );
            }

            const status: any = await res.json();
            if (status.setup !== 'success') {
                await cli.server?.close();
                throw new Error(
                    `Blueprint setup did not complete cleanly. ` +
                        `Status endpoint returned: ${JSON.stringify(status)}`,
                );
            }

            await use({
                serverUrl: cli.serverUrl,
                close: async () => {
                    await cli.server?.close();
                },
            });

            await cli.server?.close();
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

/**
 * Log in as admin via wp-login.php. The blueprint's `login: true` creates
 * a session only for the request that applied the blueprint; test pages
 * launch fresh browser contexts with no cookies, so we re-auth here.
 */
async function loginAsAdmin(page: Page, serverUrl: string): Promise<void> {
    await page.goto(`${serverUrl}/wp-login.php`);
    const loginForm = page.locator('#loginform');
    if (await loginForm.isVisible().catch(() => false)) {
        await page.locator('#user_login').fill('admin');
        await page.locator('#user_pass').fill('password');
        await page.locator('#wp-submit').click();
        await page.waitForURL(/wp-admin/);
    }
}
