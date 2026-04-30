import { test, expect } from '../../fixtures/playground';

/**
 * Tier 2: utility.js behavior tests.
 *
 * utility.js holds functions used across multiple admin screens (scene,
 * modal, figure, instance, about). A single broken utility breaks all five
 * screens, so these are the highest-value safety net during the refactor.
 */

test.describe('utility.js: cookie-driven field restoration', () => {
    test('fields are restored from the allCustomFields global when present', async ({
        adminPage,
    }) => {
        await adminPage.goto('/wp-admin/edit.php?post_type=scene');
        await adminPage
            .locator('#the-list tr:first-child .row-title')
            .click();
        await adminPage.waitForURL(/post\.php\?post=\d+/);
        await expect(
            adminPage.locator('[data-depend-id="scene_toc_style"]'),
        ).toBeVisible({ timeout: 30_000 });

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

        expect(
            restored.ok,
            `Expected replaceFieldValuesWithTransientValues to be reachable. ` +
                `Got: ${JSON.stringify(restored)}. ` +
                `If you refactored utility.js behind a class, update this test ` +
                `to call the new public API.`,
        ).toBe(true);
        expect(restored.value).toBe('list');
    });
});

test.describe('utility.js: plain-text paste into TinyMCE', () => {
    // applyPlainTextPaste() + bindPlainTextPaste() in utility.js attach a
    // paste handler to a list of TinyMCE editors that strips rich formatting
    // from pasted HTML.

    test('TinyMCE editors have a paste listener that strips HTML', async ({ adminPage }) => {
        await adminPage.goto('/wp-admin/edit.php?post_type=scene');
        await adminPage
            .locator('#the-list tr:first-child .row-title')
            .click();
        await adminPage.waitForURL(/post\.php\?post=\d+/);

        // Wait for TinyMCE to be fully initialized — not just registered.
        // Previously the test checked `editors.length > 0`, but that's true
        // early in the init cycle, before the editor's internal DOM exists,
        // so `getBody()` returned null. `initialized === true` is the right
        // readiness flag.
        await adminPage.waitForFunction(
            () => {
                // @ts-expect-error — TinyMCE global.
                return (
                    typeof tinymce !== 'undefined' &&
                    tinymce.editors?.length > 0 &&
                    tinymce.editors[0].initialized === true &&
                    tinymce.editors[0].getBody() !== null
                );
            },
            null,
            { timeout: 30_000 },
        );

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

            ed.getBody().dispatchEvent(evt);

            return new Promise<string>((resolve) => {
                setTimeout(() => resolve(ed.getContent()), 250);
            });
        });

        // Expect no <strong> or <em> in the resulting content. Wrapping <p>
        // tags are TinyMCE's default and fine.
        expect(pastedContent).not.toMatch(/<strong>/i);
        expect(pastedContent).not.toMatch(/<em>/i);
    });
});