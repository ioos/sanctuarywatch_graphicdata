import { test, expect } from '../../fixtures/playground';
import type { Page } from '@playwright/test';

/**
 * Tier 2: admin-scene.js behavior tests.
 *
 * These tests pin down specific behaviors currently implemented as
 * free-floating functions in admin/js/admin-scene.js. They exist as the
 * safety net for the planned refactor into a class-based `SceneAdmin`.
 *
 * Strategy: for each test, open the edit screen for an existing scene post
 * (seeded by the blueprint), perform a UI interaction, and assert the DOM
 * state that the current code produces. After the refactor, the same tests
 * must still pass unchanged — that's the contract.
 *
 * If any of these tests seem wrong against the current code, either:
 *   (a) adjust the selector/expected state to match observed behavior, or
 *   (b) treat it as a latent bug and file an issue. The tests encode what
 *       the refactored code should do, not what the current code does.
 */

async function openFirstScene(adminPage: Page): Promise<void> {
    await adminPage.goto('/wp-admin/edit.php?post_type=scene');
    // Click the title link of the first scene row in the list table.
    const firstRowTitle = adminPage.locator('#the-list tr:first-child .row-title');
    await firstRowTitle.click();
    await adminPage.waitForURL(/post\.php\?post=\d+/);
    // Wait for the Exopite metabox scaffolding to render.
    await expect(
        adminPage.locator('[data-depend-id="scene_toc_style"]'),
    ).toBeVisible({ timeout: 30_000 });
}

test.describe('Scene admin: TOC style visibility rules', () => {
    // tableOfContentsFieldOptions() contract from admin-scene.js:
    //  - TOC style = "list": hide section fields, set section_number=0,
    //    hide per-section hover color, show global hover color.
    //  - Other TOC styles: show section fields, respect
    //    scene_same_hover_color_sections to pick global vs per-section.

    test('setting TOC style to "list" hides section-number and per-section hover fields', async ({
        adminPage,
    }) => {
        await openFirstScene(adminPage);

        const tocSelect = adminPage.locator('[data-depend-id="scene_toc_style"]');
        await tocSelect.selectOption('list');
        // Give the change handler a moment to run.
        await adminPage.waitForTimeout(250);

        // Section number field should be hidden.
        const sectionNumberRow = adminPage
            .locator('[data-depend-id="scene_section_number"]')
            .locator('xpath=ancestor::*[contains(@class,"exopite-sof-field")][1]');
        await expect(sectionNumberRow).toBeHidden();

        // scene_same_hover_color_sections container should be hidden.
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

        // First switch to list to hide it...
        await tocSelect.selectOption('list');
        await adminPage.waitForTimeout(150);

        // ...then switch to something that isn't list.
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
    // orphanColorFieldVisibility() in admin-scene.js toggles the orphan color
    // field based on the value of scene_orphan_icon_action.

    test('orphan color field visibility tracks the orphan-icon-action select', async ({
        adminPage,
    }) => {
        await openFirstScene(adminPage);

        const actionSelect = adminPage.locator('[data-depend-id="scene_orphan_icon_action"]');
        await expect(actionSelect).toBeVisible();

        // Capture all available values, then toggle between them and snapshot
        // the orphan-color field visibility for each. The point of the test
        // isn't to hard-code which value shows the color field; it's to prove
        // that *some* deterministic toggling behavior exists and is preserved
        // after refactor. If you know the intended rule, tighten this.
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

        // Assert the toggle is *not* a constant — i.e. at least one value
        // shows and at least one hides. Without this assertion, a refactor
        // that accidentally hard-codes visibility would pass.
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
    // redText() in utility.js scans .exopite-sof-title elements whose text
    // ends with '*' and colors them red, prepending a legend at top of form.

    test('title elements ending with * are colored red', async ({ adminPage }) => {
        await openFirstScene(adminPage);

        // Find at least one title that ends with a literal '*'.
        const asteriskTitles = adminPage.locator(
            '.exopite-sof-title:has-text("*")',
        );
        const count = await asteriskTitles.count();
        test.skip(count === 0, 'No required-field titles on this scene — cannot verify.');

        // At least one such title should have a red color applied inline or
        // via a red class. The current implementation sets element.style.color
        // directly, so check computed style.
        const firstAsteriskTitle = asteriskTitles.first();
        const color = await firstAsteriskTitle.evaluate(
            (el) => window.getComputedStyle(el).color,
        );
        // Match any reasonable "red". rgb(255,0,0), rgb(220,...), etc.
        expect(color).toMatch(/rgb\((?:2[0-5]\d|1\d\d),\s*(?:[0-5]?\d),\s*(?:[0-5]?\d)\)/);
    });
});

test.describe('Scene admin: no JS errors on load', () => {
    // This spec exists specifically to fail loudly during refactor. The
    // adminPage fixture already asserts no console errors at teardown, so
    // the body of the test is mostly navigation.

    test('opening a scene, toggling TOC style, and changing section count produces no JS errors', async ({
        adminPage,
    }) => {
        await openFirstScene(adminPage);

        const tocSelect = adminPage.locator('[data-depend-id="scene_toc_style"]');
        const allValues = await tocSelect
            .locator('option')
            .evaluateAll((opts) => opts.map((o) => (o as HTMLOptionElement).value));

        for (const v of allValues) {
            await tocSelect.selectOption(v);
            await adminPage.waitForTimeout(150);
        }

        // Try changing section number, if the field is visible.
        const sectionNumber = adminPage.locator('[name="scene_section_number"]');
        if (await sectionNumber.isVisible().catch(() => false)) {
            await sectionNumber.fill('3');
            await sectionNumber.dispatchEvent('change');
            await adminPage.waitForTimeout(150);
        }

        // Teardown will assert no JS errors occurred.
    });
});
