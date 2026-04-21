import { test, expect } from '../../fixtures/playground';

/**
 * Tier 1: smoke tests.
 */

test.describe('Smoke: plugin activation and seeding', () => {
    test('blueprint endpoint reports successful setup', async ({ adminPage, serverUrl }) => {
        const res = await adminPage.request.get(`${serverUrl}/?graphic_data_test_status=1`);
        expect(res.ok()).toBe(true);
        const status = await res.json();
        expect(status.setup).toBe('success');
        expect(status.active_plugins).toEqual(
            expect.arrayContaining([expect.stringContaining('graphic_data_plugin')]),
        );
        expect(status.stylesheet).toBe('graphic_data_theme');
    });

    test('wp-admin dashboard loads without fatals', async ({ adminPage }) => {
        await adminPage.goto('/wp-admin/');
        await expect(adminPage.locator('body')).not.toContainText('Fatal error');
        await expect(adminPage.locator('body')).not.toContainText('Parse error');
        await expect(adminPage.locator('#wpbody-content')).toBeVisible();
    });

    test('custom post type list screens load: scene, modal, figure, instance, about', async ({
        adminPage,
    }) => {
        const postTypes = ['scene', 'modal', 'figure', 'instance', 'about'];
        for (const pt of postTypes) {
            await adminPage.goto(`/wp-admin/edit.php?post_type=${pt}`);
            await expect(adminPage.locator('body'), `post type ${pt} list`).not.toContainText(
                'Fatal error',
            );
            // Just match the table. The "no items" row is INSIDE the table
            // when it's empty, so matching both gave a strict-mode violation.
            await expect(
                adminPage.locator('.wp-list-table'),
                `post type ${pt} list table`,
            ).toBeVisible();
        }
    });

    test('tutorial content was seeded — at least one scene and one figure exist', async ({
        adminPage,
    }) => {
        await adminPage.goto('/wp-admin/edit.php?post_type=scene');
        await expect(adminPage.locator('#the-list tr')).not.toHaveCount(0);

        await adminPage.goto('/wp-admin/edit.php?post_type=figure');
        await expect(adminPage.locator('#the-list tr')).not.toHaveCount(0);
    });

    test('graphic data settings page loads', async ({ adminPage }) => {
        // Menu slug is `theme_settings`, registered in
        // includes/admin-settings-page.php via add_menu_page.
        await adminPage.goto('/wp-admin/admin.php?page=theme_settings');
        await expect(adminPage.locator('body')).not.toContainText('Fatal error');
        await expect(adminPage.locator('#wpbody-content')).toBeVisible();
    });
});