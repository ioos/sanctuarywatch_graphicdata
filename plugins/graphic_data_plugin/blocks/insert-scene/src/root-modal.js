import apiFetch from '@wordpress/api-fetch';
import { render_tab_info, render_interactive_plots } from '@graphic-data/figure-render';

let closeActiveModal;
let nextInstance = 0;

function installStyles(doc) {
	if (doc.getElementById('graphic-data-scene-root-modal-styles')) return;
	const style = doc.createElement('style');
	style.id = 'graphic-data-scene-root-modal-styles';
	style.textContent = `
		.graphic-data-scene-root-modal { width:min(1100px,95vw); max-width:95vw;
			max-height:90dvh; padding:0; border:0; border-radius:6px; color:#333;
			background:white; overflow:auto; box-shadow:0 12px 28px #0005; }
		.graphic-data-scene-root-modal::backdrop { background:rgba(0,0,0,.65); }
		.graphic-data-scene-root-modal .scene-modal-header { display:flex; align-items:center;
			justify-content:space-between; gap:1rem; padding:14px 16px; border-bottom:1px solid #ddd; }
		.graphic-data-scene-root-modal .scene-modal-header h2 { margin:0; color:#024880; font-size:1.5rem; }
		.graphic-data-scene-root-modal .scene-modal-close { background:transparent; border:0;
			font-size:1.7rem; color:inherit; cursor:pointer; }
		.graphic-data-scene-root-modal .scene-modal-body { padding:16px; }
		.graphic-data-scene-root-modal .scene-modal-intro { display:flex; gap:16px; align-items:flex-start; }
		.graphic-data-scene-root-modal .scene-modal-tagline { flex:1; min-width:0; }
		.graphic-data-scene-root-modal .scene-modal-links { flex:0 0 25%; }
		.graphic-data-scene-root-modal .scene-modal-links summary { cursor:pointer; padding:10px; background:#003b71; color:white; }
		.graphic-data-scene-root-modal .scene-modal-links ul { padding:12px 12px 12px 30px; }
		.graphic-data-scene-root-modal .scene-modal-tabs { display:flex; flex-wrap:wrap; gap:4px;
			margin:16px 0; border-bottom:1px solid #ccc; }
		.graphic-data-scene-root-modal .scene-modal-tabs button { padding:10px 14px; border:1px solid #ddd;
			border-radius:4px 4px 0 0; color:#003b71; background:#eee; cursor:pointer; }
		.graphic-data-scene-root-modal .scene-modal-tabs button.active { background:white; font-weight:600; }
		.graphic-data-scene-root-modal .scene-modal-tabs button.active::after { content:'▼'; font-size:.9em; margin-left:.3rem; }
		.graphic-data-scene-root-modal [hidden] { display:none !important; }
		.graphic-data-scene-root-modal img,.graphic-data-scene-root-modal video { max-width:100%; }
		@media(max-width:768px) { .graphic-data-scene-root-modal .scene-modal-intro { flex-direction:column; }
			.graphic-data-scene-root-modal .scene-modal-links { width:100%; } }
	`;
	doc.head.appendChild(style);
}

function appendLinks(doc, container, title, modal, prefix, newTab) {
	const list = doc.createElement('ul');
	for (let i = 1; i <= 6; i++) {
		const group = modal[`${prefix}${i}`] || {};
		const label = group[`${prefix}_text${i}`];
		const url = prefix === 'modal_photo' && group[`modal_photo_location${i}`] !== 'External'
			? group[`modal_photo_internal${i}`] : group[`${prefix}_url${i}`];
		if (!label || !url) continue;
		const link = doc.createElement('a');
		const resolved = new URL(url, window.location.href);
		if (!['http:', 'https:', 'mailto:'].includes(resolved.protocol)) continue;
		link.href = resolved.href;
		link.textContent = label;
		if (newTab) { link.target = '_blank'; link.rel = 'noopener noreferrer'; }
		const item = doc.createElement('li'); item.appendChild(link); list.appendChild(item);
	}
	if (!list.children.length) return;
	const details = doc.createElement('details');
	const summary = doc.createElement('summary'); summary.textContent = title;
	details.append(summary, list); container.appendChild(details);
}

async function fetchFigures(modalId, signal) {
	const figures = [];
	let pages = 1;
	for (let page = 1; page <= pages; page++) {
		const response = await apiFetch({
			path: `/wp/v2/figure?figure_modal=${modalId}&per_page=100&page=${page}&status=publish`,
			parse: false, signal,
		});
		pages = Number(response.headers.get('X-WP-TotalPages')) || 1;
		figures.push(...await response.json());
	}
	return figures.filter(figure => Number(figure.figure_modal) === modalId && figure.figure_published === 'published')
		.sort((a,b) => (Number(a.figure_order) || 0) - (Number(b.figure_order) || 0) ||
			String(a.figure_title || '').localeCompare(String(b.figure_title || '')));
}

/** Frontend only: the modal and all its figures are in the root document. */
export function openSceneModal(child, config) {
	if (!child?.modal || !Number(child.modal_id)) return;
	closeActiveModal?.();
	const doc = document;
	installStyles(doc);
	const controller = new AbortController();
	const id = `scene-root-modal-${++nextInstance}`;
	const previousFocus = doc.activeElement;
	const dialog = doc.createElement('dialog');
	dialog.className = 'graphic-data-scene-root-modal';
	dialog.setAttribute('aria-labelledby', `${id}-title`);
	dialog.innerHTML = `<header class="scene-modal-header"><h2 id="${id}-title"></h2>
		<button type="button" class="scene-modal-close" aria-label="Close modal">×</button></header>
		<div class="scene-modal-body"><p class="scene-modal-status" role="status">Loading modal content…</p>
		<div class="scene-modal-intro"><div class="scene-modal-tagline"></div><aside class="scene-modal-links"></aside></div>
		<div class="scene-modal-tabs" role="tablist" aria-label="Modal tabs"></div><div class="scene-modal-panes"></div></div>`;
	dialog.querySelector('h2').textContent = child.title || 'Scene details';
	doc.body.appendChild(dialog);
	let closed = false;
	const resizeVisiblePlots = () => dialog.querySelectorAll('.tab-pane.active .js-plotly-plot').forEach(plot => {
		if (window.Plotly?.Plots?.resize) Promise.resolve(window.Plotly.Plots.resize(plot)).catch(() => {});
	});
	const observer = new ResizeObserver(resizeVisiblePlots);
	observer.observe(dialog);
	const close = () => {
		if (closed) return;
		closed = true;
		controller.abort(); observer.disconnect();
		dialog.querySelectorAll('.js-plotly-plot').forEach(plot => window.Plotly?.purge?.(plot));
		if (dialog.open) dialog.close();
		dialog.remove();
		if (closeActiveModal === close) closeActiveModal = null;
		if (previousFocus?.isConnected) previousFocus.focus();
	};
	closeActiveModal = close;
	dialog.querySelector('.scene-modal-close').addEventListener('click', close);
	dialog.addEventListener('cancel', event => { event.preventDefault(); close(); });
	dialog.addEventListener('close', close);
	dialog.addEventListener('click', event => {
		if (event.target !== dialog) return;
		const box = dialog.getBoundingClientRect();
		if (event.clientX < box.left || event.clientX > box.right || event.clientY < box.top || event.clientY > box.bottom) close();
	});
	dialog.showModal();

	(async () => {
		const modalId = Number(child.modal_id);
		const [modal, figures] = await Promise.all([
			apiFetch({ path: `/wp/v2/modal/${modalId}`, signal: controller.signal }),
			fetchFigures(modalId, controller.signal),
		]);
		if (controller.signal.aborted) return;
		dialog.querySelector('.scene-modal-tagline').innerHTML = modal.modal_tagline || '';
		const links = dialog.querySelector('.scene-modal-links');
		appendLinks(doc, links, 'More Info', modal, 'modal_info', config.newTabByDefault);
		appendLinks(doc, links, 'Media', modal, 'modal_photo', true);
		links.hidden = !links.children.length;
		const tabs = dialog.querySelector('.scene-modal-tabs');
		const panes = dialog.querySelector('.scene-modal-panes');
		function activate(button, focus = false) {
			tabs.querySelectorAll('button').forEach(tab => {
				const active = tab === button;
				tab.classList.toggle('active', active); tab.setAttribute('aria-selected', String(active)); tab.tabIndex = active ? 0 : -1;
				const pane = doc.getElementById(tab.getAttribute('aria-controls'));
				pane.hidden = !active; pane.classList.toggle('active', active);
			});
			if (focus) button.focus();
			button.dispatchEvent(new CustomEvent('shown.bs.tab', { bubbles: true }));
			resizeVisiblePlots();
		}
		const tabFigures = [];
		for (let tab = 1; tab <= Number(modal.modal_tab_number || 0); tab++) {
			const group = figures.filter(figure => Number(figure.figure_tab) === tab);
			if (!group.length) continue;
			const button = doc.createElement('button'); button.type = 'button'; button.id = `${id}-tab-${tab}`;
			button.className = 'nav-link tab-title'; button.setAttribute('role','tab'); button.setAttribute('data-bs-toggle','tab');
			button.setAttribute('aria-controls',`${id}-pane-${tab}`);
			button.textContent = modal[`modal_tab_title${tab}`] || `Tab ${tab}`;
			const pane = doc.createElement('div'); pane.id = `${id}-pane-${tab}`; pane.className = 'tab-pane';
			pane.setAttribute('role','tabpanel'); pane.setAttribute('aria-labelledby',button.id); pane.tabIndex = 0;
			panes.appendChild(pane); tabs.appendChild(button);
			button.addEventListener('click', event => { event.preventDefault(); event.stopPropagation(); activate(button); });
			tabFigures.push({ pane, group, tab });
		}
		tabs.addEventListener('keydown', event => {
			const buttons = Array.from(tabs.querySelectorAll('button'));
			const index = buttons.indexOf(event.target); if (index < 0) return;
			let next;
			if (event.key === 'ArrowRight') next = (index + 1) % buttons.length;
			else if (event.key === 'ArrowLeft') next = (index + buttons.length - 1) % buttons.length;
			else if (event.key === 'Home') next = 0;
			else if (event.key === 'End') next = buttons.length - 1;
			else return;
			event.preventDefault(); activate(buttons[next], true);
		});
		if (tabs.firstElementChild) activate(tabs.firstElementChild);
		for (const {pane, group, tab} of tabFigures) {
			for (const [index, figure] of group.entries()) {
				if (controller.signal.aborted) return;
				const info = {
					postID: figure.id, figure_published: figure.figure_published,
					figureTitle: figure.figure_title, figureType: figure.figure_path,
					imageLink: figure.figure_path === 'External' ? figure.figure_external_url : figure.figure_image,
					externalAlt: figure.figure_external_alt, code: figure.figure_code, iframeCode: figure.figure_iframe_code,
					shortCaption: figure.figure_caption_short, longCaption: figure.figure_caption_long,
					scienceLink: figure.figure_science_info?.figure_science_link_url,
					scienceText: figure.figure_science_info?.figure_science_link_text,
					dataLink: figure.figure_data_info?.figure_data_link_url, dataText: figure.figure_data_info?.figure_data_link_text,
					figure_interactive_arguments: figure.figure_interactive_arguments,
					figure_interactive_args_rendered: figure.figure_interactive_args_rendered,
				};
				const target = await render_tab_info(pane, panes, info, index, true, tab, child.title, group.length);
				if (controller.signal.aborted) return;
				await render_interactive_plots(pane, info, doc, target);
			}
		}
		if (controller.signal.aborted) return;
		const status = dialog.querySelector('.scene-modal-status');
		status.textContent = tabFigures.length ? '' : 'This modal has no published figures.';
		status.hidden = Boolean(tabFigures.length);
		resizeVisiblePlots();
	})().catch(error => {
		if (!controller.signal.aborted) dialog.querySelector('.scene-modal-status').textContent = error.message || 'Unable to load this modal.';
	});
}
