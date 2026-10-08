import { configureSceneFigureControls } from './figure-controls';
import apiFetch from '@wordpress/api-fetch';

export function stripHTML(value = '') {
	return String(value).replace(/(<([^>]+)>)/gi, '');
}

/** Route external scene links out of the iframe, preserving modal handlers. */
function installExternalSceneLinks(doc, children, slugify, openLink, signal) {
	const destinations = new Map();
	for (const [key, child] of Object.entries(children)) {
		if (child.modal || !child.external_url) continue;
		destinations.set(key, child.external_url);
		destinations.set(slugify(key), child.external_url);
		destinations.set(key + '-mobile', child.external_url);
		destinations.set(key + '-container', child.external_url);
		destinations.set(slugify(key) + '-container', child.external_url);
	}
	const handleClick = (event) => {
		if (event.button != null && event.button !== 0) return;
		const target = event.target;
		// mobile_helper removes #entire_thing and moves these containers into body.
		if (!target?.closest?.('#svg1, #scene-fluid, #toc-container, #mobileModal')) return;
		const link = target.closest('#toc-container a[href], #mobileModal a[href]');
		if (link?.classList.contains('modal-link')) return;
		const href = link?.getAttribute('href');
		let destination = href && !href.startsWith('#') ? href : undefined;
		if (!destination) {
			for (let node = target; node && node.id !== 'entire_thing'; node = node.parentElement) {
				if (destinations.has(node.id)) {
					destination = destinations.get(node.id);
					break;
				}
			}
		}
		if (!destination) return;
		event.preventDefault();
		event.stopImmediatePropagation(); // Bypass the renderer's iframe location assignment.
		const url = new URL(destination, doc.baseURI);
		if (['http:', 'https:', 'mailto:', 'tel:'].includes(url.protocol)) openLink(url.href);
	};
	doc.addEventListener('click', handleClick, true);
	signal.addEventListener('abort', () => doc.removeEventListener('click', handleClick, true), { once: true });
}

/** Content-driven iframe height must not become a simulated phone rotation. */
function keepMobilePreviewPortrait(win) {
	Object.defineProperty(win, 'innerHeight', {
		configurable: true,
		get: () => Math.max(800, win.innerWidth + 1),
	});
	const matchMedia = win.matchMedia.bind(win);
	win.matchMedia = (query) => {
		// Keep the renderer's orientation checks consistent with innerHeight.
		if (/^\(orientation:\s*landscape\)$/.test(query)) return matchMedia('not all');
		if (/^\(orientation:\s*portrait\)$/.test(query)) return matchMedia('all');
		return matchMedia(query);
	};
}

/** Each scene gets isolated globals/IDs, including its modal and figure renderers. */
async function renderScene(frame, config, mode, signal, reportError, onOpenModal) {
	const win = frame.contentWindow;
	const doc = frame.contentDocument;
	const pluginRoot = new URL(config.pluginUrl, window.location.origin);
	const base = doc.createElement('base');
	base.href = window.location.origin + '/';
	base.target = '_blank';
	doc.head.appendChild(base);
	if (mode !== 'responsive') {
		win.mobileBool = mode === 'mobile';
		Object.defineProperty(win.navigator, 'userAgent', {
			configurable: true, value: mode === 'mobile' ? 'iPhone' : 'Graphic Data desktop preview',
		});
	}

	if (mode === 'mobile') keepMobilePreviewPortrait(win);

	const nativeFetch = win.fetch.bind(win);
	win.fetch = async (input, options = {}) => {
		const url = typeof input === 'string' ? input : input.url;
		const restIndex = url.indexOf('/wp-json/');
		if (restIndex < 0) {
			const response = await nativeFetch(new URL(url, base.href).href, { ...options, signal });
			if (!response.ok) throw new Error(`Scene resource could not be loaded (${response.status}).`);
			return response;
		}
		try {
			const path = url.slice(restIndex + '/wp-json'.length);
			const rest = new URL(path, base.href);
			let data;
			if (rest.pathname === '/wp/v2/figure') {
				data = [];
				rest.searchParams.set('per_page', '100');
				let pages = 1;
				for (let page = 1; page <= pages; page++) {
					rest.searchParams.set('page', String(page));
					const response = await apiFetch({ path: rest.pathname + rest.search, parse: false, signal });
					pages = Number(response.headers.get('X-WP-TotalPages')) || 1;
					data.push(...await response.json());
				}
			} else {
				data = await apiFetch({ path, signal });
			}
			return new win.Response(JSON.stringify(data), { headers: { 'Content-Type': 'application/json' } });
		} catch (error) { reportError(error); throw error; }
	};

	if (!config.svgUrl) throw new Error('The selected scene has no infographic SVG.');
	const svgResponse = await win.fetch(config.svgUrl);
	const svgText = await svgResponse.text();
	const svgDocument = new win.DOMParser().parseFromString(svgText, 'image/svg+xml');
	const svg = svgDocument.documentElement;
	if (svg.localName !== 'svg' || svgDocument.querySelector('parsererror')) {
		throw new Error('The scene infographic is not a valid SVG.');
	}
	if (!svg.getAttribute('viewBox')) {
		const width = parseFloat(svg.getAttribute('width'));
		const height = parseFloat(svg.getAttribute('height'));
		if (!(width > 0 && height > 0)) throw new Error('The scene SVG needs a viewBox or numeric width and height.');
		svg.setAttribute('viewBox', `0 0 ${width} ${height}`);
	}
	const validIcons = new Set(Array.from(svg.querySelectorAll('g[id]'), (icon) => icon.id));
	config.childIds = Object.fromEntries(Object.entries(config.childIds || {}).filter(([key]) => validIcons.has(key)));
	config.visibleModals = Object.keys(config.childIds);
	if (!svg.querySelector('[id="text"]')) config.sceneTextToggle = 'none';
	// loadSVG fetches the validated SVG through its normal public API.
	const fetchResource = win.fetch;
	win.fetch = (input, options) => typeof input === 'string' && input === config.svgUrl
		? Promise.resolve(new win.Response(new win.XMLSerializer().serializeToString(svg), { headers: { 'Content-Type': 'image/svg+xml' } }))
		: fetchResource(input, options);

	if (onOpenModal) {
		win.openSceneRootModal = (key, children) => {
			if (!signal.aborted) onOpenModal(key, children);
		};
	}
	const modulePaths = {
		'scene-render': 'includes/scenes/js/scene-render.js',
		'scene-shared': 'includes/scenes/js/scene-shared.js',
		'modal-render': onOpenModal ? 'blocks/insert-scene/src/modal-bridge.js' : 'includes/modals/js/modal-render.js',
		'figure-render': 'includes/figures/js/figure-render.js',
		...Object.fromEntries(['plotly-timeseries-line', 'plotly-bar', 'plotly-map', 'plotly-utility', 'tabulator-table']
			.map((name) => [name, `includes/figures/js/interactive/${name}.js`])),
	};
	const imports = doc.createElement('script');
	imports.type = 'importmap';
	imports.textContent = JSON.stringify({ imports: Object.fromEntries(Object.entries(modulePaths)
		.map(([name, path]) => [`@graphic-data/${name}`, new URL(path, pluginRoot).href])) });
	doc.head.appendChild(imports);
	const data = doc.createElement('script');
	data.id = 'graphic-data-scene-data';
	data.type = 'application/json';
	data.textContent = JSON.stringify(config);
	doc.head.appendChild(data);
	document.querySelectorAll('script[id^="wp-script-module-data-"]').forEach((node) => doc.head.appendChild(node.cloneNode(true)));

	const loadAsset = (tag, url, media) => new Promise((resolve, reject) => {
		const element = doc.createElement(tag);
		if (tag === 'link') { element.rel = 'stylesheet'; element.href = url; if (media) element.media = media; }
		else element.src = url;
		element.onload = () => resolve(element);
		element.onerror = () => reject(new Error(`Unable to load scene asset: ${url}`));
		doc.head.appendChild(element);
	});
	const [, , desktop] = await Promise.all([
		loadAsset('link', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css'),
		loadAsset('script', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js'),
		loadAsset('link', new URL('admin/css/scene_desktop_entire_thing.css', pluginRoot).href),
		loadAsset('link', new URL('admin/css/modal_desktop_modal-dialog.css', pluginRoot).href),
		...(mode === 'desktop' ? [] : [
			loadAsset('link', new URL('admin/css/scene_mobile_title_container.css', pluginRoot).href, mode === 'mobile' ? 'all' : '(max-width: 768px)'),
			loadAsset('link', new URL('admin/css/modal_mobile_modal-dialog.css', pluginRoot).href, mode === 'mobile' ? 'all' : '(max-width: 768px)'),
		]),
	]);
	if (signal.aborted) return;
	if (mode === 'desktop') {
		for (const rule of desktop.sheet.cssRules) {
			const match = rule.media?.mediaText.match(/^\((min|max)-width:\s*([\d.]+)px\)$/);
			if (match) rule.media.mediaText = (match[1] === 'min' ? 1024 >= Number(match[2]) : 1024 <= Number(match[2])) ? 'all' : 'not all';
		}
	}
	const style = doc.createElement('style');
	style.textContent = `html,body{margin:0;background:transparent;} body{display:flow-root;}
		#entire_thing{width:100%;margin:0;padding:0;} #svg1 svg{width:100%;height:auto;}
		#title-container{margin:0;} #toc-container{overflow-wrap:anywhere;}
		#myModal,#mobileModal{background:rgba(0,0,0,.6);}
		#myModal .modal-dialog,#mobileModal .modal-dialog{max-width:95%;}
		${mode === 'desktop' ? '#title-container .row{flex-wrap:nowrap;} #title-container .col-md-10{width:83.333%;} #title-container .col-md-2{width:16.667%;}' : ''}`;
	doc.head.appendChild(style);
	doc.body.innerHTML = `
		<div id="myModal" class="modal"><div class="modal-dialog modal-lg"><div class="modal-content">
			<div class="modal-header"><h2 id="modal-title" class="modal-title"></h2><button id="close" type="button" class="btn-close" aria-label="Close"></button></div>
			<div class="modal-body"><div class="row"><div id="tagline-container"></div><div id="accordion-container"></div></div>
			<ul id="myTab" class="nav nav-tabs" role="tablist"></ul><div id="myTabContent" class="tab-content"></div></div>
		</div></div></div>
		<div id="mobileModal" class="modal"><div class="modal-dialog modal-lg"><div class="modal-content">
			<div class="modal-header"><h2 class="modal-title">Full Scene Image</h2><button id="close1" type="button" class="btn-close" aria-label="Close"></button></div><div class="modal-body"></div>
		</div></div></div>
		<div id="entire_thing"><div id="title-container"></div><div id="mobile-view-image"></div>
			<div id="scene-fluid" class="container-fluid"><div id="scene-row" class="row">
				<div class="col-md-10"><div id="svg1"></div></div><div id="toc-container" class="col-md-2"></div>
			</div></div>
		</div>`;
	// The editor uses the original iframe renderer, which adds figures asynchronously.
	const modalHost = doc.getElementById('myModal');
	const controlsObserver = new win.MutationObserver(() => {
		configureSceneFigureControls(modalHost, () => doc.getElementById('close')?.click());
	});
	controlsObserver.observe(modalHost, { childList: true, subtree: true });
	signal.addEventListener('abort', () => controlsObserver.disconnect(), { once: true });
	// The renderer's TOC links use href="#" and handle clicks on their parent li.
	// Cancel only navigation: the iframe base otherwise opens the site root in a
	// new tab. Keep bubbling so loadSVG's existing child_obj handlers still run.
	const preventModalLinkNavigation = (event) => {
		if (event.target?.closest?.('#toc-container a.modal-link[href="#"]')) {
			event.preventDefault();
		}
	};
	doc.addEventListener('click', preventModalLinkNavigation, true);
	signal.addEventListener('abort', () => {
		doc.removeEventListener('click', preventModalLinkNavigation, true);
	}, { once: true });
	await new Promise((resolve, reject) => {
		win.sceneBlockReady = (message) => message ? reject(new Error(message)) : resolve();
		win.sceneBlockExternalLinks = (children, slugify) => {
			if (signal.aborted) return;
			installExternalSceneLinks(doc, children, slugify,
				(url) => window.open(url, '_blank', 'noopener,noreferrer'), signal);
		};
		const script = doc.createElement('script');
		script.type = 'module';
		script.textContent = `
			import { make_title, loadSVG } from '@graphic-data/scene-render';
			import { getSceneData, setChildObj, setSortedChildObjs, slugify } from '@graphic-data/scene-shared';
			const data = getSceneData();
			setChildObj(data.childIds);
			window.sceneBlockExternalLinks(data.childIds, slugify);
			const children = Object.values(data.childIds);
			const allOne = children.every(child => Number(child.modal_icon_order) === 1);
			children.sort((a,b) => allOne ? a.title.localeCompare(b.title) : Number(a.modal_icon_order) - Number(b.modal_icon_order));
			setSortedChildObjs(children);
			const errors = [];
			const originalError = console.error.bind(console);
			console.error = (...args) => { errors.push(args.map(arg => arg?.message || String(arg)).join(' ')); originalError(...args); };
			try {
				await make_title();
				await loadSVG(data.svgUrl, 'svg1');
				if (errors.length) throw new Error(errors[0]);
				// loadSVG installs load handlers after this iframe has already loaded.
				document.querySelector('#svg1 #mobile')?.setAttribute('display', 'none');
				window.sceneBlockReady();
			} catch (error) { window.sceneBlockReady(error.message); }
			finally { console.error = originalError; }
		`;
		script.onerror = () => reject(new Error('Unable to import the scene renderer.'));
		doc.head.appendChild(script);
	});
}

/** Start a scene render; return cleanup immediately for selection changes/unmounts. */
export function mountInlineScene(host, config, { height = 0, previewMode = 'responsive', onOpenModal, onLoading = () => {}, onError = () => {} } = {}) {
	const controller = new AbortController();
	let observer;
	let timeout;
	const frame = host.ownerDocument.createElement('iframe');
	const fail = (error) => { if (!controller.signal.aborted) { onError(error?.message || 'Unable to render the scene.'); onLoading(false); } };
	host.replaceChildren();
	onError('');
	onLoading(true);
	frame.title = stripHTML(config.titleArr?.post_title || 'Graphic Data scene');
	frame.setAttribute('allow', 'fullscreen');
	frame.style.cssText = `display:block;width:100%;border:0;height:${height || 400}px;`;
	frame.onload = async () => {
		frame.onload = null;
		if (controller.signal.aborted) return;
		const win = frame.contentWindow;
		win.addEventListener('error', (event) => fail(event.error || new Error(event.message)));
		win.addEventListener('unhandledrejection', (event) => fail(event.reason));
		observer = new ResizeObserver(() => {
			if (controller.signal.aborted || height) return;
			const contentHeight = `${Math.max(1, Math.ceil(frame.contentDocument.body.getBoundingClientRect().height))}px`;
			if (frame.style.height !== contentHeight) frame.style.height = contentHeight;
		});
		observer.observe(frame.contentDocument.body);
		timeout = setTimeout(() => { fail(new Error('The scene took too long to load. Please try again.')); controller.abort(); }, 60000);
		try { await renderScene(frame, config, previewMode, controller.signal, fail, onOpenModal); if (!controller.signal.aborted) onLoading(false); }
		catch (error) { fail(error); }
		finally { clearTimeout(timeout); }
	};
	frame.srcdoc = '<!doctype html><html><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"></head><body></body></html>';
	host.appendChild(frame);
	return () => {
		controller.abort(); clearTimeout(timeout); observer?.disconnect();
		frame.contentDocument?.querySelectorAll('.js-plotly-plot').forEach(plot => frame.contentWindow.Plotly?.purge?.(plot));
		frame.remove();
	};
}
