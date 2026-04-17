import { test as base, expect, Page, ConsoleMessage } from '@playwright/test';
import { runCLI } from '@wp-playground/cli';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/**
 * Absolute paths to the plugin and theme on the host filesystem.
 * This file lives at <repo-root>/tests/e2e/fixtures/playground.ts, so the
 * plugin is two directories up, and the theme is a sibling of the plugin's
 * parent directory.
 *
 * Adjust these if you restructure the repo.
 */
const REPO_ROOT = path.resolve(__dirname, '..', '..', '..');
const PLUGIN_HOST_PATH = REPO_ROOT;                                  // /.../sanctuarywatch_graphicdata
const THEME_HOST_PATH = path.resolve(REPO_ROOT, '..', 'graphic_data_theme');

/**
 * Extended test with Playground-aware fixtures.
 *
 * Fixtures exposed:
 *   - serverUrl: base URL of the Playground HTTP server for this worker.
 *   - adminPage: a Page already logged in as admin, with console/pageerror
 *                listeners attached. Any JS error or `console.error` fails
 *                the test at teardown unless explicitly allowed.
 *   - allowConsoleErrors: call to opt out of strict JS-error assertion for
 *                         known-noisy tests (e.g. tests that intentionally
 *                         trigger an error).
 *
 * Scope: all fixtures are `worker`-scoped where possible so Playground boots
 * once per worker, not once per test. Individual tests get fresh pages.
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
     * The blueprint mounts the local plugin and theme directories so edits
     * to PHP/JS are picked up on the next test run (no rebuild needed).
     */
    playgroundServer: [
        async ({}, use) => {
            const blueprintPath = path.resolve(
                __dirname,
                '..',
                'blueprints',
                'blueprint.test.json',
            );

            const cli = await runCLI({
                command: 'server',
                blueprint: blueprintPath,
                // Mount local working tree into Playground filesystem. Paths on
                // the left are host paths; paths on the right are inside the
                // Playground's virtual /wordpress tree.
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
                // Bind to a random free port; runCLI returns the actual URL.
                port: 0,
            });

            // Sanity-check blueprint success before running any tests. If
            // tutorial content seeding failed, every downstream test will fail
            // mysteriously — better to catch it here with a clear message.
            const statusUrl = `${cli.serverUrl}/?graphic_data_test_status=1`;
            const res = await fetch(statusUrl);
            const status = await res.json();
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

    /**
     * Test-scoped: expose just the URL string for convenience.
     */
    serverUrl: async ({ playgroundServer }, use) => {
        await use(playgroundServer.serverUrl);
    },

    /**
     * Test-scoped: a Page that's already logged in as admin and wired with
     * JS error listeners. At teardown we assert zero console errors and zero
     * uncaught page errors — unless the test called `allowConsoleErrors`.
     *
     * This is the single most important feature of the harness for catching
     * the "small JS change produces an unanticipated bug" pattern mentioned
     * in the planning discussion.
     */
    adminPage: async ({ browser, serverUrl }, use, testInfo) => {
        const context = await browser.newContext({ baseURL: serverUrl });
        const page = await context.newPage();

        const errors: string[] = [];
        const allowedPatterns: RegExp[] = [
            // Known WordPress-core admin noise that isn't our bug. Add to taste.
            /heartbeat\.php/i,
            /wp-emoji-release/i,
            // Playground-specific warnings about missing wp-cron etc.
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

        // Attach a helper on the page for tests that want to opt out of strict
        // checking. Tests call: allowConsoleErrors([/expected noise/]).
        const allowConsoleErrors = (patterns: RegExp[] = []) => {
            allowedPatterns.push(...patterns);
            // Retroactively clear matches that were captured before opt-out.
            for (let i = errors.length - 1; i >= 0; i--) {
                if (patterns.some((re) => re.test(errors[i]))) errors.splice(i, 1);
            }
        };
        (page as any).__allowConsoleErrors = allowConsoleErrors;

        // Log in through wp-login.php so the session cookie is real.
        await loginAsAdmin(page, serverUrl);

        await use(page);

        // Teardown assertion. Attach errors to the test report before throwing
        // so the Playwright HTML report shows them cleanly.
        if (errors.length > 0) {
            await testInfo.attach('js-errors.txt', {
                body: errors.join('\n'),
                contentType: 'text/plain',
            });
            // Throw only if the test didn't explicitly allow errors. We signal
            // that by checking for a known flag on the page object.
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
 * Log in as admin via wp-login.php. The blueprint's `login: true` flag
 * creates a logged-in session only in the initial request used to apply the
 * blueprint; tests launch fresh browser contexts so we re-auth here.
 *
 * Default Playground credentials are admin/password.
 */
async function loginAsAdmin(page: Page, serverUrl: string): Promise<void> {
    await page.goto(`${serverUrl}/wp-login.php`);
    // If already logged in (unlikely but possible if cookies carried over),
    // wp-login redirects to /wp-admin/ and the form won't be present.
    const loginForm = page.locator('#loginform');
    if (await loginForm.isVisible().catch(() => false)) {
        await page.locator('#user_login').fill('admin');
        await page.locator('#user_pass').fill('password');
        await page.locator('#wp-submit').click();
        await page.waitForURL(/wp-admin/);
    }
}
