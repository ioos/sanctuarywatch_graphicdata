# Graphic Data E2E Tests

Playwright end-to-end tests for the Graphic Data WordPress plugin and theme, running against [WordPress Playground](https://wordpress.github.io/wordpress-playground/). No Docker, no MySQL, no `wp-env`.

## Why this exists

The JavaScript in `admin/js/` and the theme's `script.js` uses a lot of free-floating functions in the global scope. The refactor target is a class-based architecture per admin screen (`SceneAdmin`, `ModalAdmin`, etc.) plus a shared `GraphicDataUtils` module. That refactor is risky without tests — this harness is the safety net.

There are three tiers:

1. **Smoke** (`specs/smoke/`): plugin activates, admin loads, tutorial content seeded, no PHP fatals. Seconds.
2. **Admin JS** (`specs/admin-js/`): specific behaviors in `admin-scene.js`, `admin-modal.js`, `utility.js`, etc. These pin down the public contract so a refactored class has to produce the same DOM effects. This is the main reason this harness exists.
3. **Frontend** (`specs/frontend/`): single-scene page rendering, hotspot-to-modal flow in `script.js`.

Every test runs with console/pageerror listeners attached. Any uncaught JS error or `console.error` fails the test at teardown. That's the single most valuable feature for catching the "small JS change, unanticipated bug" pattern.

## Setup

From the `tests/e2e/` directory:

```bash
npm install
npm run install:browsers
```

## Running

```bash
npm test                 # all tiers
npm run test:smoke       # tier 1 only (fast)
npm run test:admin-js    # tier 2 — the refactor safety net
npm run test:frontend    # tier 3
npm run test:ui          # interactive UI mode — best for iterating
npm run test:debug       # step through a test with the inspector
npm run test:report      # open the HTML report from the last run
```

## How it works

```
┌───────────────────┐       ┌───────────────────────┐        ┌────────┐
│ playwright.config │──────▶│ fixtures/playground.ts│───────▶│  tests │
└───────────────────┘       └───────────┬───────────┘        └────────┘
                                        │
                                        │ runCLI({ blueprint, mount })
                                        ▼
                            ┌──────────────────────┐
                            │ WP Playground server │
                            │  (WASM PHP, SQLite)  │
                            └──────────────────────┘
```

The `playgroundServer` worker-scoped fixture in `fixtures/playground.ts` calls `@wp-playground/cli`'s `runCLI` once per worker. It:

- Applies `blueprints/blueprint.test.json`, which installs `svg-support`, activates our plugin and theme, and runs `create_playground_tutorial_content()` to seed scenes/modals/figures/instances.
- **Mounts the local plugin and theme directories** into the Playground filesystem. Edits to PHP/JS in your working tree are picked up on the next test run — no rebuild.
- Writes a test-only mu-plugin that exposes `/?graphic_data_test_status=1` for the harness to verify setup succeeded, and enables `WP_DEBUG_DISPLAY` so PHP errors show up in the DOM where Playwright can see them.

The `adminPage` test-scoped fixture gives you a logged-in page with JS-error listeners pre-attached.

## Differences from the production `blueprint.json`

The repo's top-level `blueprint.json` is what users click to launch the public Playground demo. It downloads the plugin and theme from GitHub release zips. That's wrong for testing — you'd be testing the last released version, not your working copy.

`blueprints/blueprint.test.json` is a test-variant that **omits the `installPlugin` / `installTheme` steps** for our plugin and theme. Instead, they're mounted via `runCLI({ mount: [...] })` from the host filesystem. The two blueprints should otherwise stay in sync.

## Directory layout expected by the fixture

```
sanctuarywatch_graphicdata/     <-- PLUGIN_HOST_PATH in fixture
  graphic_data_plugin.php
  includes/
  admin/
  tests/
    e2e/                        <-- you are here
      fixtures/
      specs/
      blueprints/

graphic_data_theme/             <-- THEME_HOST_PATH (sibling of the plugin repo)
  functions.php
  ...
```

If your theme lives somewhere else on disk, edit `THEME_HOST_PATH` near the top of `fixtures/playground.ts`.

## Writing new tests

For admin-screen behaviors, use the `adminPage` fixture. The pattern:

```ts
import { test, expect } from '../../fixtures/playground';

test('my feature', async ({ adminPage }) => {
    await adminPage.goto('/wp-admin/edit.php?post_type=scene');
    // ...interact...
    // teardown: zero console errors asserted automatically
});
```

For tests that intentionally trigger errors, opt out:

```ts
test('handles bad input gracefully', async ({ adminPage, allowConsoleErrors }) => {
    allowConsoleErrors([/expected warning about .*/]);
    // ...
});
```

### Selector strategy

- Prefer `data-testid` for elements owned by our plugin/theme.
- For Exopite Simple Options markup, use `[data-depend-id="..."]`.
- For WP core admin markup, CSS selectors like `#wpbody-content` are fine (WP core often lacks ARIA roles, this is the [official guide's recommendation](https://wordpress.github.io/wordpress-playground/guides/e2e-testing-with-playwright/)).
- Avoid selectors that depend on text copy — they break when the tutorial content changes.

### Adding `data-testid` hooks to plugin markup

The starter tests work without this, but adding a few `data-testid` attrs to key UI elements makes tests dramatically more stable. Reasonable targets:

- The root container of each admin settings page
- The orphan-icon color field wrapper
- Frontend modal containers
- Hotspot elements on the SVG

A `data-testid` is invisible to end users, adds no runtime cost, and is a recognized Playwright first-class selector (`page.getByTestId(...)`).

## Refactor workflow

The intended use during your class-based refactor:

1. Before touching `admin-scene.js`: `npm run test:admin-js -- scene.spec.ts`. All green.
2. Refactor into `SceneAdmin` class.
3. Run again. Any red is an unintended behavior change. Either fix the refactor or — if the old behavior was wrong — update the test deliberately and commit the test change with a note in the message.
4. Repeat per JS file.

## Troubleshooting

**"Blueprint setup did not complete cleanly"** — the mu-plugin's status endpoint returned something other than `success`. Check the error detail in the test output. Most common cause: a PHP fatal in `create_playground_tutorial_content()` after you changed something in the plugin.

**Tests hang on first run** — the first `runCLI` call downloads PHP/WP WASM blobs. Expect 30-60s. Subsequent runs use cached blobs.

**Port conflicts** — `port: 0` tells Playground to pick a random free port. If you're seeing bind errors, some other process is likely holding ports at the OS level; restarting your shell usually clears it.

**JS errors from unrelated code (Heartbeat, emoji)** — add patterns to `allowedPatterns` in `fixtures/playground.ts`.

## What this harness deliberately does NOT do

- **Visual regression** — premature before the JS refactor is stable. Add later with [`@playwright/test` screenshot comparisons](https://playwright.dev/docs/test-snapshots) if needed.
- **Unit tests for JS** — Playwright is for E2E. For isolated unit tests of utility functions post-refactor, add Vitest or Jest separately.
- **PHP unit tests** — you already have PHPUnit; no overlap intended.
- **Cross-browser by default** — only Chromium is enabled. Uncomment Firefox/WebKit projects in `playwright.config.ts` if needed.
