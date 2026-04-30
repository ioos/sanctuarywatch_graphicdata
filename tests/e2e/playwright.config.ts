import { defineConfig, devices } from '@playwright/test';

/**
 * Playwright config for the Graphic Data plugin/theme.
 *
 * Notes on the tuning choices:
 *  - Timeouts are generous. WordPress Playground boots PHP in a WASM VM and
 *    executes the blueprint (which installs svg-support, mounts our plugin,
 *    activates the theme, and runs create_playground_tutorial_content) on
 *    every `beforeAll`. On a cold run this can take 30-60s.
 *  - Workers are capped at 1 by default because specs spin up their own
 *    Playground instance in beforeAll. Running them in parallel is possible
 *    (Playground picks random ports) but multiplies CPU/memory cost.
 *    Override locally with PW_WORKERS=2 for speed.
 *  - `trace: 'on-first-retry'` rather than 'retain-on-failure' so CI
 *    artifacts stay small on green runs.
 */
export default defineConfig({
  testDir: './specs',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.PW_WORKERS ? Number(process.env.PW_WORKERS) : 1,
  reporter: process.env.CI
    ? [['github'], ['html', { open: 'never' }]]
    : [['list'], ['html', { open: 'never' }]],

  // Per-test timeout. Individual assertions can still be faster.
  timeout: 120_000,
  expect: {
    timeout: 20_000,
  },

  use: {
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    // baseURL is set per-project via the Playground fixture — each spec file
    // boots its own Playground and receives a unique serverUrl.
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    // Uncomment to add cross-browser coverage. Playground works on all three.
    // { name: 'firefox',  use: { ...devices['Desktop Firefox']  } },
    // { name: 'webkit',   use: { ...devices['Desktop Safari']   } },
  ],
});
