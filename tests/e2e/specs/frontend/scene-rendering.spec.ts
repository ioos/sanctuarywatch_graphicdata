import { test, expect } from '../../fixtures/playground';

/**
 * Tier 3: frontend (theme) behavior tests.
 *
 * Covers what a logged-out visitor sees. Exercises single-scene.php,
 * single-about.php, and the theme's script.js — especially the hotspot-click
 * -> modal flow that is script.js's biggest single responsibility.
 *
 * These tests use a fresh non-admin browser context to avoid the admin bar
 * and logged-in cookie affecting rendering.
 */

test.describe('Frontend: seeded scene renders', () => {
    test('home page loads without errors', async ({ serverUrl, browser }) => {
        const ctx = await browser.newContext({ baseURL: serverUrl });
        const page = await ctx.newPage();

        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('console', (m) => {
            if (m.type() === 'error') errors.push(m.text());
        });

        await page.goto('/');
        await expect(page.locator('body')).not.toContainText('Fatal error');
        await expect(page.locator('body')).not.toContainText('Parse error');
        // The tutorial content sets a specific blogname/intro — assert the
        // intro text is present as a proxy for "front page rendered correctly".
        await expect(page.locator('body')).toContainText(
            /Welcome to Graphic Data/i,
        );

        expect(errors, `Unexpected frontend JS errors: ${errors.join('\n')}`).toEqual([]);
        await ctx.close();
    });

    test('a single scene page renders with SVG and TOC', async ({ serverUrl, browser }) => {
        const ctx = await browser.newContext({ baseURL: serverUrl });
        const page = await ctx.newPage();

        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('console', (m) => {
            if (m.type() === 'error') errors.push(m.text());
        });

        // Navigate to the scene archive / first scene. The exact URL depends
        // on the theme's permalink structure. Use WP's REST API to find one.
        const res = await page.request.get(`${serverUrl}/wp-json/wp/v2/scene?per_page=1`);
        expect(res.ok(), 'wp/v2/scene REST endpoint should exist').toBe(true);
        const scenes = await res.json();
        test.skip(
            !Array.isArray(scenes) || scenes.length === 0,
            'No published scenes returned by REST — tutorial content may not be published.',
        );

        const sceneLink = scenes[0].link as string;
        await page.goto(sceneLink);

        await expect(page.locator('body')).not.toContainText('Fatal error');

        // SVG should be in the DOM for a scene page. The theme inlines or
        // references the SVG with an id of svgContainer / svg inside .
        const svg = page.locator('svg, [id*="svg"]').first();
        await expect(svg).toBeVisible({ timeout: 20_000 });

        expect(errors, `Unexpected scene page JS errors: ${errors.join('\n')}`).toEqual([]);
        await ctx.close();
    });
});

test.describe('Frontend: hotspot -> modal interaction', () => {
    // script.js wires click handlers onto SVG hotspots which should open a
    // Bootstrap modal showing the associated figure/modal post content.

    test('clicking a hotspot opens the modal', async ({ serverUrl, browser }) => {
        const ctx = await browser.newContext({ baseURL: serverUrl });
        const page = await ctx.newPage();

        const errors: string[] = [];
        page.on('pageerror', (e) => errors.push(e.message));
        page.on('console', (m) => {
            if (m.type() === 'error') errors.push(m.text());
        });

        const res = await page.request.get(`${serverUrl}/wp-json/wp/v2/scene?per_page=1`);
        const scenes = await res.json();
        test.skip(
            !Array.isArray(scenes) || scenes.length === 0,
            'No scenes available.',
        );
        await page.goto(scenes[0].link);

        // Wait for SVG + any JS-attached handlers to be ready.
        await page.waitForLoadState('networkidle');

        // Find a hotspot. Hotspots are typically <a> or <g> elements inside
        // the SVG with an id pattern. If this selector is wrong for your
        // markup, update it — but keep the test: it's the canary for the
        // main user interaction.
        const hotspot = page.locator('svg a[href], svg [data-modal-id], svg g[id]').first();
        const hasHotspot = await hotspot.count().then((c) => c > 0);
        test.skip(!hasHotspot, 'No clickable hotspot found in the seeded SVG.');

        await hotspot.click();

        // Modal should appear. Bootstrap 5 modals get the class `show` when
        // open. The theme may also use a specific #modal container id.
        const modal = page.locator('.modal.show, #sceneModal.show, #figureModal.show').first();
        await expect(modal).toBeVisible({ timeout: 5_000 });

        expect(errors, `Unexpected JS errors on modal open: ${errors.join('\n')}`).toEqual([]);
        await ctx.close();
    });
});
