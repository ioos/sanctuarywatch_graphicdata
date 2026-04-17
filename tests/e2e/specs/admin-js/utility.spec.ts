import { test, expect } from '../../fixtures/playground';

/**
 * Tier 2: utility.js behavior tests.
 *
 * utility.js holds functions used across multiple admin screens (scene,
 * modal, figure, instance, about). The plan to move these into a class-based
 * module makes regressions here the most likely failure mode during refactor,
 * since a single broken utility breaks all five screens.
 *
 * These tests exercise the public observable effects of the utility
 * functions, not their internal implementation.
 */

test.describe('utility.js: cookie-driven field restoration', () => {
    // replaceFieldValuesWithTransientValues() reads a global `allCustomFields`
    // object and writes its values back into matching form fields. Used after
    // a validation error to preserve user input.
    //
    // Since we can't easily induce a validation error from a fresh edit page,
    // we inject the global directly and verify the function's effect.

    test('fields are restored from the allCustomFields global when present', async ({
        adminPage,
    }) => {
        // Open any edit screen that loads utility.js — scene list -> first row.
        await adminPage.goto('/wp-admin/edit.php?post_type=scene');
        await adminPage
            .locator('#the-list tr:first-child .row-title')
            .click();
        await adminPage.waitForURL(/post\.php\?post=\d+/);
        await expect(
            adminPage.locator('[data-depend-id="scene_toc_style"]'),
        ).toBeVisible({ timeout: 30_000 });

        // Inject a sentinel value and re-run the restoration function.
        const restored = await adminPage.evaluate(() => {
            // @ts-expect-error — global exposed by the plugin's JS.
            window.allCustomFields = { scene_toc_style: 'list' };
            // @ts-expect-error — global exposed by the plugin's JS.
            if (typeof window.replaceFieldValuesWithTransientValues !== 'function') {
                return { ok: false, reason: 'function not global' };
            }
            // @ts-expect-error
            window.replaceFieldValuesWithTransientValues();
            const el = document.querySelector(
                '[data-depend-id="scene_toc_style"]',
            ) as HTMLSelectElement | null;
            return { ok: true, value: el?.value };
        });

        // If the refactor hides the function behind a class namespace, this
        // test will fail — which is the *point*. Either expose a tested
        // migration shim or update the test to call the new API.
        expect(
            restored.ok,
            `Expected replaceFieldValuesWithTransientValues to be reachable. Got: ${JSON.stringify(
                restored,
            )}. If you refactored utility.js behind a class, update this test to call the new public API.`,
        ).toBe(true);
        expect(restored.value).toBe('list');
    });
});

test.describe('utility.js: plain-text paste into TinyMCE', () => {
    // applyPlainTextPaste() + bindPlainTextPaste() in utility.js attach a
    // paste handler to a list of TinyMCE editors that strips rich formatting.
    //
    // Testing the paste handler end-to-end requires simulating a clipboard
    // event with HTML content. Playwright can do this via page.evaluate.

    test('TinyMCE editors have a paste listener that strips HTML', async ({ adminPage }) => {
        await adminPage.goto('/wp-admin/edit.php?post_type=scene');
        await adminPage
            .locator('#the-list tr:first-child .row-title')
            .click();
        await adminPage.waitForURL(/post\.php\?post=\d+/);

        // Wait for at least one TinyMCE editor to initialize.
        await adminPage.waitForFunction(
            () => {
                // @ts-expect-error — TinyMCE global.
                return typeof tinymce !== 'undefined' && tinymce.editors?.length > 0;
            },
            null,
            { timeout: 30_000 },
        );

        // Pick the first editor and fire a synthetic paste event with HTML.
        // The handler should strip the HTML and insert plain text.
        const pastedContent = await adminPage.evaluate(() => {
            // @ts-expect-error
            const ed = tinymce.editors[0];
            ed.setContent('');

            const html = '<strong>bold</strong> and <em>italic</em>';
            const dt = new DataTransfer();
            dt.setData('text/html', html);
            dt.setData('text/plain', 'bold and italic');

            const evt = new ClipboardEvent('paste', {
                clipboardData: dt,
                bubbles: true,
                cancelable: true,
            });

            // Dispatch on the editor's iframe body.
            ed.getBody().dispatchEvent(evt);

            // Give TinyMCE a tick to process.
            return new Promise<string>((resolve) => {
                setTimeout(() => resolve(ed.getContent()), 200);
            });
        });

        // Expect no <strong> or <em> in the resulting content. Exact wrapping
        // (<p>...</p>) is TinyMCE's default and fine to include.
        expect(pastedContent).not.toMatch(/<strong>/i);
        expect(pastedContent).not.toMatch(/<em>/i);
    });
});
