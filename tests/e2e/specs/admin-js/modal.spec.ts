import { test, expect } from '../../fixtures/playground';

/**
 * Tier 2: modal post-type edit form.
 *
 * Walks through the full edit-and-save flow for a Modal post:
 *   - Open modal list, find the right row by instance + scene + title
 *   - Edit, capture initial preview SVG
 *   - Change Instance, Scene, Icons selects
 *   - Verify preview SVG updates after Instance + Scene change
 *   - Update the modal_tagline TinyMCE field
 *   - Save and verify success
 *
 * Notes from reading admin-modal.js:
 *
 * Field names: Instance is "modal_location", Scene is "modal_scene",
 * Icons is "modal_icons". The Exopite framework wraps these in divs
 * with data-depend-id attributes; the compound selectors below cover
 * both wrapper-on-div and direct-on-select rendering.
 *
 * Page-load grace period: modal_location_change() and modal_scene_change()
 * both silently no-op while window.isPageLoad is true. That flag flips
 * to false 1 second after window.onload (admin-modal.js lines 31-39).
 * If we change the Instance dropdown before that, the Scene dropdown
 * never gets repopulated. We wait on isPageLoad === false before
 * making any field changes.
 *
 * If the modal admin form's wiring breaks during a refactor, this test
 * fails and tells you which step regressed.
 */

test.describe('Modal admin: edit form full flow', () => {
    test('edit Interactive Line Chart modal in Example Instance 3 / Space Dome', async ({
        adminPage,
    }) => {
        // Step 1: open the modals admin screen.
        await adminPage.goto('/wp-admin/edit.php?post_type=modal');
        await expect(adminPage.locator('.wp-list-table')).toBeVisible();

        // Step 2: find the right row.
        //
        // The list has Instance and Scene as columns. We can't just match
        // the title "Interactive Line Chart" because it likely exists in
        // multiple scenes. We need a row whose title cell, instance cell,
        // AND scene cell all match.
        const targetRow = adminPage.locator('#the-list tr').filter({
            has: adminPage.locator('.row-title', { hasText: /^Interactive Line Chart$/ }),
        }).filter({
            hasText: 'Example Instance 3',
        }).filter({
            hasText: 'Space Dome',
        });

        await expect(
            targetRow,
            'Expected exactly one row matching title=Interactive Line Chart, ' +
                'instance=Example Instance 3, scene=Space Dome.',
        ).toHaveCount(1);

        await targetRow.locator('.row-title').click();
        await adminPage.waitForURL(/post\.php\?post=\d+/);

        // Step 3: capture the initial preview SVG.
        const previewWindow = adminPage.locator('#preview_window');
        await expect(previewWindow).toBeVisible({ timeout: 30_000 });

        const initialSvg = previewWindow.locator('svg');
        await expect(
            initialSvg,
            'Preview window should contain an SVG when the modal edit screen loads.',
        ).toBeAttached({ timeout: 15_000 });

        const initialSvgHtml = await initialSvg.evaluate((el) => el.outerHTML);

        // Wait for the isPageLoad grace period to elapse.
        //
        // admin-modal.js sets a module-scoped `isPageLoad = true` and
        // flips it to false 1 second after window.onload via setTimeout.
        // Because the variable is module-scoped (not on window), we
        // can't read it from page.evaluate — we just wait the time.
        await adminPage.waitForLoadState('load');
        await adminPage.waitForTimeout(1200);

        // Step 4: change Instance to "Example Instance 1".
        const modalLocation = adminPage.locator(
            '[data-depend-id="modal_location"] select, select[data-depend-id="modal_location"]',
        ).first();
        await expect(modalLocation).toBeVisible();

        const locationOptionsCount = await modalLocation.locator('option').count();
        expect(
            locationOptionsCount,
            'Instance field should have multiple options to choose between.',
        ).toBeGreaterThan(1);

        await modalLocation.selectOption({ label: 'Example Instance 1' });

        // Step 5: change Scene to "Example Scene 3 (Space)".
        //
        // Field name is "modal_scene". modal_location_change() repopulates
        // this dropdown via REST fetch when Instance changes; we poll
        // until "Example Scene 3 (Space)" appears as an option.
        const modalScene = adminPage.locator(
            '[data-depend-id="modal_scene"] select, select[data-depend-id="modal_scene"]',
        ).first();

        await expect(async () => {
            const labels = await modalScene
                .locator('option')
                .evaluateAll((opts) =>
                    (opts as HTMLOptionElement[]).map((o) => o.textContent?.trim() ?? ''),
                );
            expect(labels).toContain('Example Scene 3 (Space)');
        }).toPass({ timeout: 10_000 });

        await modalScene.selectOption({ label: 'Example Scene 3 (Space)' });

        // Step 6: verify the preview SVG changed.
        //
        // The preview is regenerated asynchronously after Instance + Scene
        // change. Poll until the SVG's outerHTML differs from what we
        // captured in step 3.
        await expect(async () => {
            const currentSvgHtml = await previewWindow
                .locator('svg')
                .evaluate((el) => el.outerHTML);
            expect(
                currentSvgHtml,
                'Preview SVG should have changed after updating Instance and Scene.',
            ).not.toBe(initialSvgHtml);
        }).toPass({ timeout: 15_000 });

        // Step 7: change Icons to "Interactive-Line-Chart".
        //
        // This dropdown also depends on Instance + Scene (it lists icons
        // available in the chosen scene). Wait for the option to become
        // available before selecting.
        const modalIcons = adminPage.locator(
            '[data-depend-id="modal_icons"] select, select[data-depend-id="modal_icons"]',
        ).first();
        await expect(modalIcons).toBeVisible();

        await expect(async () => {
            const values = await modalIcons
                .locator('option')
                .evaluateAll((opts) =>
                    (opts as HTMLOptionElement[]).map((o) => o.value),
                );
            expect(values).toContain('Interactive-Line-Chart');
        }).toPass({ timeout: 10_000 });

        await modalIcons.selectOption('Interactive-Line-Chart');

        // Step 8: change modal_tagline TinyMCE content to "Ipsum lorem".
        //
        // Wait for the editor to be fully initialized — checking just
        // editors.length isn't enough since getBody() can be null while
        // length > 0.
        await adminPage.waitForFunction(
            () => {
                // @ts-expect-error — TinyMCE global
                if (typeof tinymce === 'undefined') return false;
                // @ts-expect-error
                const ed = tinymce.get('modal_tagline');
                return ed && ed.initialized === true && ed.getBody() !== null;
            },
            null,
            { timeout: 30_000 },
        );

        await adminPage.evaluate(() => {
            // @ts-expect-error
            const ed = tinymce.get('modal_tagline');
            ed.setContent('<p>Ipsum lorem</p>');
            // ed.save() flushes TinyMCE's internal model to the underlying
            // textarea so the new content is included in the form payload.
            ed.save();
        });

        // Verify it actually took. Useful diagnostic if save then fails.
        const taglineContent = await adminPage.evaluate(() => {
            // @ts-expect-error
            return tinymce.get('modal_tagline').getContent({ format: 'text' }).trim();
        });
        expect(taglineContent).toBe('Ipsum lorem');

        // Step 9: save the post.
        await adminPage.locator('#publish').click();

        await adminPage.waitForURL(/post\.php\?post=\d+.*action=edit/, { timeout: 30_000 });

        await expect(adminPage.locator('body')).not.toContainText('Fatal error');
        await expect(adminPage.locator('body')).not.toContainText('Parse error');

        // Verify save success by checking for the confirmation text.
        // We don't use toBeVisible on #message because WordPress sometimes
        // renders the notice wrapper as hidden (CSS or transition state)
        // even though the message paragraph inside it is rendered. The
        // text content is the meaningful signal.
        await expect(adminPage.locator('body')).toContainText(
            /Modal (created|updated|published)/i,
            { timeout: 10_000 },
        );
    });
});
