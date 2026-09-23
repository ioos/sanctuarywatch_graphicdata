import apiFetch from '@wordpress/api-fetch';

export function stripHTML(value = '') {
	return String(value).replace(/(<([^>]+)>)/gi, '');
}

/**
 * render_modal and its figure renderers use document-wide IDs. Give each preview
 * its own document so asynchronous tab/figure work cannot affect another block.
 * The content itself is an inline div, with no Bootstrap Modal or backdrop.
 */
async function populatePreview(frame, modal, reportError, signal, pluginUrl) {
	const previewWindow = frame.contentWindow;
	const previewDocument = frame.contentDocument;
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
		element.onload = resolve;
		element.onerror = () => reject(new Error(`Unable to load modal preview asset: ${url}`));
		previewDocument.head.appendChild(element);
	});
	await Promise.all([
		loadAsset('link', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'),
		loadAsset('script', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'),
		loadAsset('link', new URL('admin/css/modal_desktop_modal-dialog.css', pluginRoot).href),
		loadAsset('link', new URL('admin/css/modal_mobile_modal-dialog.css', pluginRoot).href, '(max-width: 768px)'),
	]);
	if (signal.aborted) return;

	const style = previewDocument.createElement('style');
	style.textContent = `
		html, body { margin: 0; background: transparent; overflow-x: hidden; }
		#inline-modal { display: flow-root; width: 100%; }
		#inline-modal .modal-content { border: 0; box-shadow: none; background: transparent; }
		#inline-modal .modal-body { overflow: visible; }
		#accordion-container { position: static !important; max-height: none !important; }
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

	await new Promise((resolve) => {
		previewDocument.addEventListener('graphic-data:modalWindowLoaded', resolve, { once: true });
		previewWindow.graphicDataRenderModal('block', {
			block: { modal_id: modal.id, title: stripHTML(modal.title?.rendered || `Modal ${modal.id}`) },
		}, modal);
	});
}


/** Mount an inline modal and return a cleanup function for the owning block. */
export function mountInlineModal(host, modalId, {
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
				}, reportError, controller.signal, pluginUrl);
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
