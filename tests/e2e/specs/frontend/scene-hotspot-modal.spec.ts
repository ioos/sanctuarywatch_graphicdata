import { test, expect } from '../../fixtures/playground';

/**
 * Exercises the central scene→hotspot→modal flow:
 *   1. Load a seeded scene page on the public frontend
 *   2. Click a hotspot inside the Interactive-Bar-Chart SVG group
 *   3. Verify the modal opens with the expected title
 *
 * This is the single most important frontend test in the suite — if this
 * flow breaks, the theme's primary purpose is broken.
 */

test.describe('Frontend: scene hotspot opens the correct modal', () => {
	test('clicking inside Interactive-Bar-Chart opens the Interactive Bar Chart modal', async ({
		browser,
		serverUrl,
	}) => {
		// Fresh context — public frontend, no admin cookies. Matches what a
		// real visitor sees.
		const ctx = await browser.newContext({ baseURL: serverUrl });
		const page = await ctx.newPage();

		// Track JS errors inline for this test rather than via the fixture,
		// since we're using browser/serverUrl directly instead of adminPage.
		const jsErrors: string[] = [];
		page.on('pageerror', (err) => jsErrors.push(err.message));
		page.on('console', (msg) => {
			if (msg.type() === 'error') {
				jsErrors.push(`console.error: ${msg.text()}`);
			}
		});

		await page.goto('/example-instance-1/example-scene-3-space/');

		// Step 1: the scene rendered at all.
		// If the custom rewrite rules didn't flush, we'd 404 here with a
		// "Page not found" title. Assert the SVG container is present as a
		// quick reality check.
		await expect(page.locator('#svg1')).toBeVisible({ timeout: 15_000 });

		// Step 2: the specific hotspot group exists. The SVG is fetched and
		// injected dynamically, so this is our signal that the SVG has loaded.
		await expect(page.locator('#Interactive-Bar-Chart')).toBeAttached({
			timeout: 15_000,
		});

		// Step 3: wait for theme JS to finish wiring the scene.
		//
		// The theme's add_modal() function iterates child_obj and attaches a
		// click handler to each SVG group. If we click before child_obj is
		// populated and add_modal() has run, the click fires on a naked <g>
		// with no handler and nothing happens.
		await page.waitForFunction(
			() => {
				return (
					typeof child_obj !== 'undefined' &&
					// @ts-expect-error
					Object.keys(child_obj).length > 0
				);
			},
			null,
			{ timeout: 15_000 }
		);
		await page.waitForLoadState('networkidle');

		// Step 4: dispatch click on the group.
		//
		// <g> elements don't have native click hitboxes, so Playwright's .click()
		// is intercepted by overlay paths. The theme's own handleHashNavigation
		// uses dispatchEvent for this same reason (script.js line 544).
		const hotspotGroup = page.locator('#Interactive-Bar-Chart');
		await expect(hotspotGroup).toBeAttached({ timeout: 5_000 });
		await hotspotGroup.dispatchEvent('click');

		// Step 5: modal opens.
		//
		// The theme opens modals by setting modal.style.display = "block", NOT
		// by adding Bootstrap's .show class. (scene-render.js line 2244)
		const modal = page.locator('#myModal');
		await expect(modal).toHaveCSS('display', 'block', { timeout: 5_000 });

		// Step 6: correct modal content.
		const modalTitle = modal.locator('#modal-title');
		await expect(modalTitle).toHaveText('Interactive Bar Chart');

		// Step 7: the Plotly chart inside the modal has rendered.
		//
		// render_modal() in scene-render.js invokes Plotly.newPlot() to draw
		// the interactive chart, which creates a .plot-container.plotly wrapper
		// containing an SVG. This is asynchronous — Plotly fetches config,
		// initializes, and then renders the SVG in a subsequent tick. We wait
		// for the SVG to appear rather than assume it's there immediately.
		const plotlyContainer = modal.locator('.plot-container.plotly');
		await expect(plotlyContainer).toBeVisible({ timeout: 10_000 });

		// The container exists early (Plotly creates it before drawing), so
		// the more meaningful assertion is that the SVG inside has been
		// drawn. That's the signal that the chart actually rendered.
		const plotlySvg = plotlyContainer.locator('svg').first();
		await expect(plotlySvg).toBeVisible({ timeout: 10_000 });

		// Sanity: no JS errors during the whole flow.
		expect(
			jsErrors,
			`JavaScript errors check (${jsErrors.length} found): ${jsErrors.join('\n')}`
		).toEqual([]);

		await ctx.close();
	});
});
