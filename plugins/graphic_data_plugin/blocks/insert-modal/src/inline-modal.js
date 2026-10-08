import apiFetch from '@wordpress/api-fetch';

/** Keep asynchronously rendered charts transparent, including subsequent redraws. */
function maintainTransparentPlots(frame, signal, reportError) {
	const frameWindow = frame.contentWindow;
	const frameDocument = frame.contentDocument;
	const transparent = 'rgba(0, 0, 0, 0)';
	const plots = new Map();
	const updating = new WeakSet();
	let scheduledFrame = null;

	function scheduleUpdate() {
		if (signal.aborted || scheduledFrame !== null) return;
		scheduledFrame = frameWindow.requestAnimationFrame(updatePlots);
	}

	function updatePlots() {
		scheduledFrame = null;
		if (signal.aborted) return;
		for (const [plot, handler] of plots) {
			if (!plot.isConnected) {
				plot.removeListener?.('plotly_afterplot', handler);
				plots.delete(plot);
			}
		}
		frameDocument.querySelectorAll('.js-plotly-plot').forEach((plot) => {
			if (!plots.has(plot) && typeof plot.on === 'function') {
				plot.on('plotly_afterplot', scheduleUpdate);
				plots.set(plot, scheduleUpdate);
			}
			const layout = plot.layout;
			if (!layout || !frameWindow.Plotly?.relayout || updating.has(plot)) return;
			if (layout.paper_bgcolor === transparent && layout.plot_bgcolor === transparent) return;

			// Do not resize or change chart heights here: each figure owns its layout.
			// Only update changed colors, preventing an afterplot/relayout loop.
			updating.add(plot);
			Promise.resolve().then(() => {
				if (signal.aborted || !plot.isConnected) return;
				return frameWindow.Plotly.relayout(plot, {
					paper_bgcolor: transparent,
					plot_bgcolor: transparent,
				});
			}).catch((error) => {
				if (!signal.aborted) reportError(error);
			}).finally(() => updating.delete(plot));
		});
	}

	// Tabs and figures finish after render_modal returns; watch for their charts.
	const observer = new frameWindow.MutationObserver(scheduleUpdate);
	observer.observe(frameDocument.body, { childList: true, subtree: true });
	frameDocument.addEventListener('shown.bs.tab', scheduleUpdate);
	frameWindow.addEventListener('resize', scheduleUpdate);
	signal.addEventListener('abort', () => {
		observer.disconnect();
		if (scheduledFrame !== null) frameWindow.cancelAnimationFrame(scheduledFrame);
		frameDocument.removeEventListener('shown.bs.tab', scheduleUpdate);
		frameWindow.removeEventListener('resize', scheduleUpdate);
		plots.forEach((handler, plot) => plot.removeListener?.('plotly_afterplot', handler));
		plots.clear();
	}, { once: true });
	scheduleUpdate();
}

export function stripHTML(value = '') {
	return String(value).replace(/(<([^>]+)>)/gi, '');
}

/**
 * render_modal and its figure renderers use document-wide IDs. Give each preview
 * its own document so asynchronous tab/figure work cannot affect another block.
 * The content itself is an inline div, with no Bootstrap Modal or backdrop.
 */
async function populatePreview(frame, modal, reportError, signal, pluginUrl, selectedTabBackgroundColor, unselectedTabBackgroundColor, previewMode) {
	const previewWindow = frame.contentWindow;
	const previewDocument = frame.contentDocument;
	// These overrides belong only to this disposable editor iframe. The shared
	// renderer also checks device type and innerWidth when formatting figures.
	if (previewMode !== 'responsive') {
		previewWindow.mobileBool = previewMode === 'mobile';
		if (previewMode === 'desktop') {
			Object.defineProperty(previewWindow.navigator, 'userAgent', {
				configurable: true, value: 'Graphic Data desktop preview',
			});
		}
		const nativeWidth = Object.getOwnPropertyDescriptor(previewWindow, 'innerWidth');
		Object.defineProperty(previewWindow, 'innerWidth', {
			configurable: true,
			get: () => {
				const width = nativeWidth?.get?.call(previewWindow) ?? frame.clientWidth;
				return previewMode === 'desktop' ? Math.max(1024, width) : Math.min(768, width);
			},
		});
	}
	const pluginRoot = new URL(pluginUrl || '/wp-content/plugins/graphic_data_plugin/', window.location.origin);
	const base = previewDocument.createElement('base');
	base.href = window.location.origin + '/';
	base.target = '_blank';
	previewDocument.head.appendChild(base);
	const modulePaths = {
		'modal-render': 'includes/modals/js/modal-render.js',
		'figure-render': 'includes/figures/js/figure-render.js',
		'scene-shared': 'includes/scenes/js/scene-shared.js',
		...Object.fromEntries([
			'plotly-timeseries-line', 'plotly-bar', 'plotly-map',
			'plotly-utility', 'tabulator-table',
		].map((name) => [name, `includes/figures/js/interactive/${name}.js`])),
	};
	const importMap = previewDocument.createElement('script');
	importMap.type = 'importmap';
	importMap.textContent = JSON.stringify({ imports: Object.fromEntries(
		Object.entries(modulePaths).map(([name, path]) => [
			`@graphic-data/${name}`, new URL(path, pluginRoot).href,
		])
	) });
	previewDocument.head.appendChild(importMap);

	// Preserve server-provided chart defaults in the isolated document.
	document.querySelectorAll('script[id^="wp-script-module-data-"], #graphic-data-scene-data')
		.forEach((element) => previewDocument.head.appendChild(element.cloneNode(true)));

	const nativeFetch = previewWindow.fetch.bind(previewWindow);
	const requests = new Map();
	previewWindow.fetch = async (input, options) => {
		const url = typeof input === 'string' ? input : input.url;
		const restIndex = url.indexOf('/wp-json/');
		if (restIndex === -1) {
			return nativeFetch(new URL(url, window.location.origin).href, { ...options, signal });
		}

		// about:blank has no host. Route the renderer's REST calls through WP's
		// authenticated client, and fetch every page instead of its 24-item cap.
		const path = url.slice(restIndex + '/wp-json'.length);
		try {
			if (!requests.has(path)) {
				requests.set(path, (async () => {
					if (path.split('?')[0] === `/wp/v2/modal/${modal.id}`) return modal;
					const restURL = new URL(path, window.location.origin);
					if (restURL.pathname !== '/wp/v2/figure') {
						return apiFetch({ path, signal });
					}
					restURL.searchParams.set('per_page', '100');
					const figures = [];
					let pages = 1;
					for (let page = 1; page <= pages; page++) {
						restURL.searchParams.set('page', String(page));
						const response = await apiFetch({
							path: restURL.pathname + restURL.search, parse: false, signal,
						});
						pages = Number(response.headers.get('X-WP-TotalPages')) || 1;
						figures.push(...await response.json());
					}
					return figures;
				})());
			}
			return new previewWindow.Response(JSON.stringify(await requests.get(path)), {
				headers: { 'Content-Type': 'application/json' },
			});
		} catch (error) {
			if (!signal.aborted) reportError(error);
			throw error;
		}
	};

	const loadAsset = (tagName, url, media) => new Promise((resolve, reject) => {
		const element = previewDocument.createElement(tagName);
		if (tagName === 'link') {
			element.rel = 'stylesheet';
			element.href = url;
			if (media) element.media = media;
		} else {
			element.src = url;
		}
		element.onload = () => resolve(element);
		element.onerror = () => reject(new Error(`Unable to load modal preview asset: ${url}`));
		previewDocument.head.appendChild(element);
	});
	const [, , desktopStyles] = await Promise.all([
		loadAsset('link', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'),
		loadAsset('script', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'),
		loadAsset('link', new URL('admin/css/modal_desktop_modal-dialog.css', pluginRoot).href),
		...(previewMode === 'desktop' ? [] : [
			loadAsset('link', new URL('admin/css/modal_mobile_modal-dialog.css', pluginRoot).href,
				previewMode === 'mobile' ? 'all' : '(max-width: 768px)'),
		]),
	]);
	if (signal.aborted) return;

	if (previewMode === 'desktop') {
		// The desktop stylesheet itself stacks columns below 900px. Evaluate its
		// width-only media rules at a desktop breakpoint without widening the block.
		for (const rule of desktopStyles.sheet.cssRules) {
			if (!rule.media) continue;
			const match = rule.media.mediaText.match(/^\((min|max)-width:\s*([\d.]+)px\)$/);
			if (!match) continue;
			const matches = match[1] === 'min' ? 1024 >= Number(match[2]) : 1024 <= Number(match[2]);
			rule.media.mediaText = matches ? 'all' : 'not all';
		}
	}

	previewDocument.documentElement.style.setProperty('--modal-selected-tab-background', selectedTabBackgroundColor);
	previewDocument.documentElement.style.setProperty('--modal-unselected-tab-background', unselectedTabBackgroundColor);
	const style = previewDocument.createElement('style');
	style.textContent = `
		html, body { margin: 0; background: transparent; overflow-x: hidden; }
		#inline-modal { display: flow-root; width: 100%; }
		#inline-modal #myTab.nav-tabs .nav-link {
			background-color: var(--modal-unselected-tab-background) !important;
		}
		#inline-modal #myTab.nav-tabs .nav-link.active,
		#inline-modal #myTab.nav-tabs .nav-item.show .nav-link {
			background-color: var(--modal-selected-tab-background) !important;
		}
		#inline-modal #myTab.nav-tabs .nav-link.active::after,
		#inline-modal #myTab.nav-tabs .nav-item.show .nav-link::after {
			content: '▼';
			font-size: .9em;
			margin-left: 0.3rem;
		}
		#inline-modal .modal-content { border: 0; box-shadow: none; background: transparent; }
		#inline-modal .modal-body { overflow: visible; }
		#inline-modal #myTabContent.tab-content { background: transparent !important; }
		#accordion-container { position: static !important; max-height: none !important; }
		#inline-modal .js-plotly-plot,
		#inline-modal .js-plotly-plot .plot-container,
		#inline-modal .js-plotly-plot .svg-container,
		#inline-modal .js-plotly-plot .modebar-group {
			background-color: transparent !important;
		}
		#inline-modal .js-plotly-plot .modebar-btn .icon path {
			fill: rgba(68, 68, 68, 0.7) !important;
		}
		/* A close/share/embed action applies to an overlay or public page, not this inline block. */
		.figure > div > div:has(> details) { display: none !important; }
	`;
	previewDocument.head.appendChild(style);

	// Satisfy the legacy focus-trap lookup with an empty, hidden host. Actual
	// content is its sibling, so no focusable element is trapped or auto-focused.
	previewDocument.body.innerHTML = `
		<div id="myModal" hidden><div></div></div>
		<div id="inline-modal">
			<div class="modal-content">
				<div class="modal-header"><h2 id="modal-title" class="modal-title"></h2></div>
				<div class="modal-body">
					<div class="row"><div id="tagline-container"></div><div id="accordion-container"></div></div>
					<ul id="myTab" class="nav nav-tabs" role="tablist"></ul>
					<div id="myTabContent" class="tab-content"></div>
				</div>
			</div>
		</div>`;

	await new Promise((resolve, reject) => {
		previewWindow.addEventListener('graphic-data:rendererReady', resolve, { once: true });
		const script = previewDocument.createElement('script');
		script.type = 'module';
		script.textContent = `
			import { render_modal } from '@graphic-data/modal-render';
			window.graphicDataRenderModal = render_modal;
			window.dispatchEvent(new Event('graphic-data:rendererReady'));
		`;
		script.onerror = () => reject(new Error('Unable to load the modal renderer.'));
		previewDocument.head.appendChild(script);
	});
	if (signal.aborted) return;

	maintainTransparentPlots(frame, signal, reportError);

	await new Promise((resolve) => {
		previewDocument.addEventListener('graphic-data:modalWindowLoaded', resolve, { once: true });
		previewWindow.graphicDataRenderModal('block', {
			block: { modal_id: modal.id, title: stripHTML(modal.title?.rendered || `Modal ${modal.id}`) },
		}, modal);
	});
}


/** Mount an inline modal and return a cleanup function for the owning block. */
export function mountInlineModal(host, modalId, {
	selectedTabBackgroundColor = '#ffffff', unselectedTabBackgroundColor = 'transparent',
	previewMode = 'responsive',
	height = 0, pluginUrl, onLoading = () => {}, onError = () => {},
} = {}) {
	const controller = new AbortController();
	let observer;
	let frame;
	let timeout;
	const reportError = (error) => {
		if (controller.signal.aborted) return;
		onError(error?.message || 'Unable to render the selected modal.');
		onLoading(false);
	};
	host.replaceChildren();
	onError('');
	onLoading(Boolean(modalId));

	if (modalId) {
		(async () => {
			try {
				const modal = await apiFetch({ path: `/wp/v2/modal/${modalId}`, signal: controller.signal });
				if (controller.signal.aborted) return;
				frame = host.ownerDocument.createElement('iframe');
				frame.title = stripHTML(modal.title?.rendered || `Modal ${modalId}`);
				frame.style.cssText = 'display:block;width:100%;border:0;height:200px;';
				const loaded = new Promise((resolve) => { frame.onload = resolve; });
				frame.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"></head><body></body></html>';
				host.appendChild(frame);
				await loaded;
				if (controller.signal.aborted) return;
				frame.contentWindow.addEventListener('unhandledrejection', (event) => reportError(event.reason));
				frame.contentWindow.addEventListener('error', (event) => reportError(event.error || new Error(event.message)));
				timeout = window.setTimeout(() => reportError(new Error('The modal took too long to load. Please try again.')), 60000);
				// Observe content rather than the viewport, allowing automatic height to shrink.
				observer = new ResizeObserver(() => {
					const content = frame.contentDocument?.getElementById('inline-modal');
					if (content) frame.style.height = `${height || Math.max(1, Math.ceil(content.getBoundingClientRect().height))}px`;
				});
				observer.observe(frame.contentDocument.body);
				await populatePreview(frame, {
					modal_tagline: '', modal_info_entries: 0, modal_photo_entries: 0,
					modal_tab_number: 0, ...modal,
				}, reportError, controller.signal, pluginUrl, selectedTabBackgroundColor, unselectedTabBackgroundColor, previewMode);
				if (!controller.signal.aborted) onLoading(false);
			} catch (error) {
				reportError(error);
			} finally {
				window.clearTimeout(timeout);
			}
		})();
	}
	return () => {
		controller.abort();
		window.clearTimeout(timeout);
		observer?.disconnect();
		frame?.contentDocument?.querySelectorAll('.js-plotly-plot').forEach((plot) => {
			frame.contentWindow.Plotly?.purge?.(plot);
		});
		frame?.remove();
	};
}
