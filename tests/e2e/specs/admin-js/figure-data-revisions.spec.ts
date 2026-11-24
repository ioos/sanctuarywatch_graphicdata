import { test, expect } from '../../fixtures/playground';

/**
 * Tier 2: a Figure's data file across revisions.
 *
 * Data files stay on the server while the Figure or one of its revisions
 * uses them (Graphic_Data_Figure::custom_file_delete_handler(),
 * get_unique_data_file_name() and admin/class-revisions.php):
 *   - Update the Figure (the first revision, with line_chart.json)
 *   - Delete File takes the file off the Figure but leaves it on the server
 *   - Uploading a file of the same name saves it as line_chart-1.json
 *   - Restoring the first revision gives the Figure line_chart.json again
 *   - A CSV upload gets a name whose JSON (made from it in the browser) is
 *     also free, and that JSON is saved next to it
 *
 * Uses the Interactive Line Chart figure in Example Scene 2 (Table), which no
 * other test touches.
 */

test.describe('Revisions: Figure data files', () => {
    test('a replaced data file is kept and comes back with its revision', async ({ adminPage, allowConsoleErrors }) => {
        // Saving an Interactive figure without a file (as Delete File does) logs this.
        allowConsoleErrors([/has no uploaded JSON file path/]);
        // Upload and delete report through alert() and confirm().
        adminPage.on('dialog', (dialog) => dialog.accept());

        await adminPage.goto('/wp-admin/edit.php?post_type=figure&s=Interactive+Line+Chart');
        const row = adminPage.locator('#the-list tr').filter({
            has: adminPage.locator('.row-title', { hasText: /^Interactive Line Chart$/ }),
        }).filter({ hasText: 'Example Scene 2 (Table)' });
        await expect(row).toHaveCount(1);
        await row.locator('.row-title').click();
        await adminPage.waitForURL(/post\.php\?post=\d+/);
        const figureId = new URL(adminPage.url()).searchParams.get('post');
        const dataUrl = (name: string) => `/wp-content/data/figure_${figureId}/${name}`;

        const fileName = adminPage.locator('#existing-file-name');
        await expect(fileName).toHaveValue('line_chart.json');
        const original = await adminPage.request.get(dataUrl('line_chart.json'));
        expect(original.status()).toBe(200);
        const json = await original.body();

        /**
         * Click something that ends in a save, and wait for the edit screen to
         * load again. The URL alone is no signal: it already matches, and the
         * figure preview changes its hash before the form is submitted.
         */
        const saveWith = async (selector: string) => {
            await adminPage.waitForLoadState('networkidle');
            const loaded = adminPage.waitForEvent('load', { timeout: 90_000 });
            await adminPage.locator(selector).click();
            await loaded;
            await adminPage.waitForLoadState('networkidle');
            await expect(adminPage.locator('body')).not.toContainText('Fatal error');
        };

        // First revision: the Figure as it is.
        await saveWith('#publish');

        // Delete File saves the Figure without its file; the file stays.
        await saveWith('#delete-btn');
        await expect(adminPage.locator('#upload-btn')).toBeVisible();
        expect((await adminPage.request.get(dataUrl('line_chart.json'))).status()).toBe(200);

        // The same name uploaded again does not replace the kept file.
        await adminPage.locator('#uploaded-file').setInputFiles({
            name: 'line_chart.json',
            mimeType: 'application/json',
            buffer: json,
        });
        await saveWith('#upload-btn');
        await expect(fileName).toHaveValue('line_chart-1.json');
        expect((await adminPage.request.get(dataUrl('line_chart-1.json'))).status()).toBe(200);
        expect((await adminPage.request.get(dataUrl('line_chart.json'))).status()).toBe(200);

        // Restore the first revision: two steps back (file, no file, new file).
        await adminPage.locator('.misc-pub-revisions a').click();
        await adminPage.waitForURL(/revision\.php/);
        await adminPage.locator('.revisions-previous .button').click();
        await adminPage.locator('.revisions-previous .button').click();
        await expect(adminPage.locator('.revisions-diff')).toContainText('line_chart-1.json');
        await adminPage.locator('.restore-revision').click();
        await adminPage.waitForURL(/post\.php\?post=\d+.*revision=\d+/, { timeout: 30_000 });
        await adminPage.waitForLoadState('networkidle');
        await expect(adminPage.locator('body')).toContainText('restored');
        await expect(fileName).toHaveValue('line_chart.json');
        await expect(adminPage.locator('.custom-div a', { hasText: 'Download Your File' })).toHaveAttribute(
            'href',
            new RegExp(`figure_${figureId}/line_chart\\.json$`),
        );

        // A CSV: line_chart.csv is taken, and so is line_chart-1.json.
        const csv = await adminPage.request.get(dataUrl('line_chart.csv'));
        expect(csv.status()).toBe(200);
        await saveWith('#delete-btn');
        await adminPage.locator('#uploaded-file').setInputFiles({
            name: 'line_chart.csv',
            mimeType: 'text/csv',
            buffer: await csv.body(),
        });
        await saveWith('#upload-btn');
        await expect(fileName).toHaveValue('line_chart-2.csv');
        expect((await adminPage.request.get(dataUrl('line_chart-2.csv'))).status()).toBe(200);
        expect((await adminPage.request.get(dataUrl('line_chart-2.json'))).status()).toBe(200);
        expect((await adminPage.request.get(dataUrl('line_chart-1.json'))).status()).toBe(200);
    });
});
