import { test, expect } from '../../fixtures/playground';
import type { Page } from '@playwright/test';

/**
 * Tier 2: admin-scene.js behavior tests.
 *
 * These pin down specific behaviors currently implemented as free-floating
 * functions in admin/js/admin-scene.js, so that the planned refactor into
 * a class-based SceneAdmin can proceed with confidence.
 */

async function openFirstScene(adminPage: Page): Promise<void> {
    await adminPage.goto('/wp-admin/edit.php?post_type=scene');
    const firstRowTitle = adminPage.locator('#the-list tr:first-child .row-title');
    await firstRowTitle.click();
    await adminPage.waitForURL(/post\.php\?post=\d+/);
    await expect(
        adminPage.locator('[data-depend-id="scene_toc_style"]'),
    ).toBeVisible({ timeout: 30_000 });
}

test.describe('Scene admin: TOC style visibility rules', () => {
    test('setting TOC style to "list" hides section-number and per-section hover fields', async ({
        adminPage,
    }) => {
        await openFirstScene(adminPage);

        const tocSelect = adminPage.locator('[data-depend-id="scene_toc_style"]');
        await tocSelect.selectOption('list');
        await adminPage.waitForTimeout(250);

        const sectionNumberRow = adminPage
            .locator('[data-depend-id="scene_section_number"]')
            .locator('xpath=ancestor::*[contains(@class,"exopite-sof-field")][1]');
        await expect(sectionNumberRow).toBeHidden();

        const hoverToggleRow = adminPage
            .locator('[data-depend-id="scene_same_hover_color_sections"]')
            .locator('xpath=ancestor::*[contains(@class,"exopite-sof-field")][1]');
        await expect(hoverToggleRow).toBeHidden();
    });

    test('setting TOC style away from "list" re-shows the section-number field', async ({
        adminPage,
    }) => {
        await openFirstScene(adminPage);

        const tocSelect = adminPage.locator('[data-depend-id="scene_toc_style"]');

        await tocSelect.selectOption('list');
        await adminPage.waitForTimeout(150);

        const allValues = await tocSelect
            .locator('option')
            .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));
        const other = allValues.find((v) => v !== 'list');
        test.skip(!other, 'Only "list" option exists on this install — cannot toggle.');

        await tocSelect.selectOption(other!);
        await adminPage.waitForTimeout(250);

        const sectionNumberRow = adminPage
            .locator('[data-depend-id="scene_section_number"]')
            .locator('xpath=ancestor::*[contains(@class,"exopite-sof-field")][1]');
        await expect(sectionNumberRow).toBeVisible();
    });
});

test.describe('Scene admin: orphan icon color visibility', () => {
    test('orphan color field visibility tracks the orphan-icon-action select', async ({
        adminPage,
    }) => {
        await openFirstScene(adminPage);

        const actionSelect = adminPage.locator('[data-depend-id="scene_orphan_icon_action"]');
        await expect(actionSelect).toBeVisible();

        const values = await actionSelect
            .locator('option')
            .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));
        test.skip(values.length < 2, 'Need at least two action values to verify toggle.');

        const colorField = adminPage.locator(
            '[data-depend-id="scene_orphan_icon_color"], [data-depend-id*="orphan_color"]',
        );

        const visibilities: Record<string, boolean> = {};
        for (const v of values) {
            await actionSelect.selectOption(v);
            await adminPage.waitForTimeout(200);
            visibilities[v] = await colorField.first().isVisible().catch(() => false);
        }

        const trueCount = Object.values(visibilities).filter(Boolean).length;
        const falseCount = Object.values(visibilities).length - trueCount;
        expect(
            trueCount > 0 && falseCount > 0,
            `Expected orphan color visibility to toggle with action value, got ${JSON.stringify(
                visibilities,
            )}`,
        ).toBe(true);
    });
});

test.describe('Scene admin: red asterisk decoration (utility.js redText)', () => {
    // redText() in utility.js finds every <h4 class="exopite-sof-title">,
    // checks whether the first text node ends with an asterisk, and if so
    // replaces that text node with a <span style="color: red">.
    //
    // Earlier version of this test queried the <h4> itself and got the
    // <h4>'s computed color (the default near-black). The red styling is
    // on the inner <span> only.

    test('inline spans inside asterisked titles are colored red', async ({ adminPage }) => {
        await openFirstScene(adminPage);

        // Query for spans WITH inline color:red ANYWHERE inside exopite titles.
        // redText injects these via span.style.color = 'red'.
        const redSpans = adminPage.locator(
            '.exopite-sof-title span[style*="color: red"], .exopite-sof-title span[style*="color:red"]',
        );

        const count = await redSpans.count();
        expect(
            count,
            'Expected redText() to have colored at least one required-field span.',
        ).toBeGreaterThan(0);

        // Sanity-check one: computed color should be red.
        const color = await redSpans.first().evaluate(
            (el) => window.getComputedStyle(el).color,
        );
        expect(color).toMatch(/rgb\(255,\s*0,\s*0\)|rgb\(2[0-5]\d,\s*\d+,\s*\d+\)/);
    });
});

test.describe('Scene admin: no JS errors on load', () => {
    // This spec exists specifically to fail loudly during refactor. The
    // adminPage fixture asserts no console errors at teardown, so the body
    // is mostly navigation and interaction.

    test('opening a scene and toggling fields produces no JS errors', async ({ adminPage }) => {
        await openFirstScene(adminPage);

        const tocSelect = adminPage.locator('[data-depend-id="scene_toc_style"]');
        const allValues = await tocSelect
            .locator('option')
            .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));

        for (const v of allValues) {
            await tocSelect.selectOption(v);
            await adminPage.waitForTimeout(150);
        }

        // Section number is rendered as a <select> by Exopite, not an <input>.
        // Exercise it via selectOption() instead of fill(). Some values of
        // TOC style hide this field, so skip silently if not visible.
        const sectionNumber = adminPage.locator('[name="scene_section_number"]');
        if (await sectionNumber.isVisible().catch(() => false)) {
            const options = await sectionNumber
                .locator('option')
                .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));
            const nonZero = options.find((v) => v !== '0');
            if (nonZero) {
                await sectionNumber.selectOption(nonZero);
                await adminPage.waitForTimeout(150);
            }
        }

        // Teardown asserts zero JS errors occurred.
    });
});