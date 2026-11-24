import { test, expect } from '../../fixtures/playground';

/**
 * Tier 2: WordPress revisions for the Graphic Data post types.
 *
 * Almost everything in a Scene, Modal or Figure is post meta, so a revision
 * is only useful if it carries those fields (admin/class-revisions.php).
 * This walks the whole flow on a Modal:
 *   - Update it unchanged (the first revision, holding the original tagline)
 *   - Change the modal_tagline field and update again (the second revision)
 *   - The Publish box offers "Revisions: 2"
 *   - The Revisions screen shows the tagline change as its own row
 *   - Restoring the first revision puts the original tagline back
 *
 * Uses the Code Block modal in Example Scene 2 (Table), which no other test
 * touches and whose scene has no sections (so no Icon Section to wait for),
 * and leaves its tagline as it found it.
 */

/** Wait for the modal_tagline TinyMCE editor to be ready. */
async function waitForTagline(page) {
    await page.waitForFunction(
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
}

/** Text of the modal_tagline field. */
async function readTagline(page): Promise<string> {
    await waitForTagline(page);
    return page.evaluate(() =>
        // @ts-expect-error
        tinymce.get('modal_tagline').getContent({ format: 'text' }).trim(),
    );
}

/**
 * Click Update and wait for the edit screen to come back. Waits for the
 * modal preview's REST requests first, which fail noisily if the page is
 * left while they are running.
 */
async function update(page) {
    await page.waitForLoadState('networkidle');
    await page.locator('#publish').click();
    await page.waitForURL(/post\.php\?post=\d+.*action=edit/, { timeout: 30_000 });
    await expect(page.locator('body')).not.toContainText('Fatal error');
    await expect(page.locator('body')).toContainText('updated');
}

test.describe('Revisions: Graphic Data fields', () => {
    test('a Modal field change is revisioned, compared and restored', async ({ adminPage }) => {
        // The list runs over several pages; search narrows it to the Code Blocks.
        await adminPage.goto('/wp-admin/edit.php?post_type=modal&s=Code+Block');
        const row = adminPage.locator('#the-list tr').filter({
            has: adminPage.locator('.row-title', { hasText: /^Code Block$/ }),
        }).filter({ hasText: 'Example Scene 2 (Table)' });
        await expect(row).toHaveCount(1);
        await row.locator('.row-title').click();
        await adminPage.waitForURL(/post\.php\?post=\d+/);
        const editUrl = adminPage.url();

        const original = await readTagline(adminPage);
        expect(original.length).toBeGreaterThan(0);

        // First revision: the post as it is.
        await adminPage.waitForTimeout(1200); // admin-modal.js page-load grace period.
        await update(adminPage);

        // Second revision: only a field changes, not the title.
        await waitForTagline(adminPage);
        await adminPage.evaluate(() => {
            // @ts-expect-error
            const ed = tinymce.get('modal_tagline');
            ed.setContent('<p>Revision test tagline</p>');
            ed.save();
        });
        await update(adminPage);
        expect(await readTagline(adminPage)).toBe('Revision test tagline');

        const revisions = adminPage.locator('.misc-pub-revisions');
        await expect(revisions).toContainText('Revisions: 2');
        await adminPage.waitForLoadState('networkidle');
        await revisions.locator('a').click();
        await adminPage.waitForURL(/revision\.php/);

        // Latest revision against the one before: the tagline row, labelled.
        const diff = adminPage.locator('.revisions-diff');
        await expect(diff).toContainText('Revision test tagline', { timeout: 15_000 });
        await expect(diff).toContainText(original.slice(0, 40));
        // Title, which is always shown, and the tagline; unchanged fields are left out.
        await expect(diff.locator('h2, h3')).toHaveText(['Title', 'Modal Tagline']);

        // Step back to the first revision and restore it.
        await adminPage.locator('.revisions-previous .button').click();
        const restore = adminPage.locator('.restore-revision');
        await expect(restore).toBeEnabled();
        await restore.click();
        await adminPage.waitForURL(/post\.php\?post=\d+.*revision=\d+/, { timeout: 30_000 });
        await expect(adminPage.locator('body')).toContainText('restored');
        expect(await readTagline(adminPage)).toBe(original);

        // The latest revision now matches the restored Modal.
        await adminPage.waitForLoadState('networkidle');
        await adminPage.goto(editUrl);
        await expect(adminPage.locator('.misc-pub-revisions')).toContainText('Revisions: 3');
        await adminPage.waitForLoadState('networkidle');
    });
});
