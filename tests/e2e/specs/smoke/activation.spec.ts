import { test, expect } from '../../fixtures/playground';

/**
 * Tier 1: smoke tests.
 *
 * Purpose: catch catastrophic breakage — plugin didn't activate, PHP fatal on
 * admin page load, custom post types not registered, tutorial content didn't
 * seed. These run in a few seconds and should be the pre-commit / fast-CI
 * check.
 */

test.describe('Smoke: plugin activation and seeding', () => {
    test('blueprint endpoint reports successful setup', async ({ adminPage, serverUrl }) => {
        const res = await adminPage.request.get(`${serverUrl}/?graphic_data_test_status=1`);
        expect(res.ok()).toBe(true);
        const status = await res.json();
        expect(status.setup).toBe('success');
        // The Graphic Data plugin should be in the active list.
        expect(status.active_plugins).toEqual(
            expect.arrayContaining([expect.stringContaining('graphic_data_plugin')]),
        );
        // And the theme should be active.
        expect(status.stylesheet).toBe('graphic_data_theme');
    });

    test('wp-admin dashboard loads without fatals', async ({ adminPage }) => {
        await adminPage.goto('/wp-admin/');
        // No PHP fatal. WP_DEBUG_DISPLAY is on in the test mu-plugin, so any
        // fatal would render as "Fatal error:" HTML in the body.
        await expect(adminPage.locator('body')).not.toContainText('Fatal error');
        await expect(adminPage.locator('body')).not.toContainText('Parse error');
        // WP dashboard sanity.
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
            // WP's list-table container should exist on every CPT archive.
            await expect(
                adminPage.locator('.wp-list-table, .no-items'),
                `post type ${pt} list table`,
            ).toBeVisible();
        }
    });

    test('tutorial content was seeded — at least one scene and one figure exist', async ({
        adminPage,
    }) => {
        await adminPage.goto('/wp-admin/edit.php?post_type=scene');
        // Either we see rows in the list table, or the "no items" message.
        // Seeding should have produced rows.
        await expect(adminPage.locator('#the-list tr')).not.toHaveCount(0);

        await adminPage.goto('/wp-admin/edit.php?post_type=figure');
        await expect(adminPage.locator('#the-list tr')).not.toHaveCount(0);
    });

    test('graphic data settings page loads', async ({ adminPage }) => {
        // Adjust the page slug if your settings page uses a different one.
        await adminPage.goto('/wp-admin/admin.php?page=graphic_data_settings');
        await expect(adminPage.locator('body')).not.toContainText('Fatal error');
        // Page renders *something* identifiable. If you add a data-testid to
        // the settings page root, tighten this assertion.
        await expect(adminPage.locator('#wpbody-content')).toBeVisible();
    });
});
