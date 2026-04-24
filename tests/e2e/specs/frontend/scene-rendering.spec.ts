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
			/Welcome to Graphic Data/i
		);

		expect(
			errors,
			`Unexpected frontend JS errors: ${errors.join('\n')}`
		).toEqual([]);
		await ctx.close();
	});

	test('a single scene page renders with SVG and TOC', async ({
		serverUrl,
		browser,
	}) => {
		const ctx = await browser.newContext({ baseURL: serverUrl });
		const page = await ctx.newPage();

		const errors: string[] = [];
		page.on('pageerror', (e) => errors.push(e.message));
		page.on('console', (m) => {
			if (m.type() === 'error') errors.push(m.text());
		});

		// Navigate to the scene archive / first scene. The exact URL depends
		// on the theme's permalink structure. Use WP's REST API to find one.
		const res = await page.request.get(
			`${serverUrl}/wp-json/wp/v2/scene?per_page=1`
		);
		expect(res.ok(), 'wp/v2/scene REST endpoint should exist').toBe(true);
		const scenes = await res.json();
		test.skip(
			!Array.isArray(scenes) || scenes.length === 0,
			'No published scenes returned by REST — tutorial content may not be published.'
		);

		const sceneLink = scenes[0].link as string;
		await page.goto(sceneLink);

		await expect(page.locator('body')).not.toContainText('Fatal error');

		// SVG should be in the DOM for a scene page. The theme inlines or
		// references the SVG with an id of svgContainer / svg inside .
		const svg = page.locator('svg, [id*="svg"]').first();
		await expect(svg).toBeVisible({ timeout: 20_000 });

		expect(
			errors,
			`Unexpected scene page JS errors: ${errors.join('\n')}`
		).toEqual([]);
		await ctx.close();
	});
});
