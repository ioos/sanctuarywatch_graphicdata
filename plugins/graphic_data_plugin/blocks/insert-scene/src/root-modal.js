import { configureSceneFigureControls } from './figure-controls';
import apiFetch from '@wordpress/api-fetch';
import { render_tab_info, render_interactive_plots } from '@graphic-data/figure-render';

let closeActiveModal;
let nextInstance = 0;

let stylesReady;

function installStyles(doc, config) {
	if (stylesReady) return stylesReady;
	stylesReady = new Promise((resolve, reject) => {
		const link = doc.createElement('link');
		link.rel = 'stylesheet';
		link.id = 'graphic-data-scene-root-modal-styles';
		link.href = new URL('admin/css/modal_desktop_modal-dialog.css', new URL(config.pluginUrl, window.location.origin)).href;
		link.onload = resolve;
		link.onerror = () => {
			link.remove();
			stylesReady = undefined;
			reject(new Error('Unable to load the shared modal stylesheet. Please close and try again.'));
		};
		doc.head.appendChild(link);
	});
	return stylesReady;
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
	const item = doc.createElement('div'); item.className = 'accordion-item';
	const heading = doc.createElement('h2'); heading.className = 'accordion-header';
	const button = doc.createElement('button');
	button.type = 'button'; button.className = 'accordion-button collapsed'; button.textContent = title;
	button.id = container.id + '-' + prefix + '-button';
	const panel = doc.createElement('div'); panel.className = 'accordion-collapse collapse';
	panel.id = container.id + '-' + prefix;
	panel.setAttribute('role', 'region'); panel.setAttribute('aria-labelledby', button.id);
	button.setAttribute('aria-controls', panel.id); button.setAttribute('aria-expanded', 'false');
	const body = doc.createElement('div'); body.className = 'accordion-body'; body.appendChild(list);
	button.addEventListener('click', () => {
		const expanded = button.getAttribute('aria-expanded') !== 'true';
		button.setAttribute('aria-expanded', String(expanded));
		button.classList.toggle('collapsed', !expanded); panel.classList.toggle('show', expanded);
	});
	heading.appendChild(button); panel.appendChild(body); item.append(heading, panel); container.appendChild(item);
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
	const controller = new AbortController();
	const id = `scene-root-modal-${++nextInstance}`;
	const previousFocus = doc.activeElement;
	const dialog = doc.createElement('dialog');
	dialog.className = 'graphic-data-scene-root-modal';
	dialog.setAttribute('aria-labelledby', `${id}-title`);
	dialog.innerHTML = `<div class="modal-dialog modal-lg"><div class="modal-content">
		<header class="modal-header"><h2 id="${id}-title" class="modal-title"></h2>
		<button type="button" class="btn-close scene-modal-close" aria-label="Close modal"></button></header>
		<div class="modal-body"><p class="scene-modal-status graphic-data-loading-circle" role="status" aria-label="Loading modal"></p>
		<div class="row"><div class="graphic-data-modal-tagline"></div>
		<aside id="${id}-accordion" class="graphic-data-modal-accordion accordion"></aside></div>
		<ul class="graphic-data-modal-tabs nav nav-tabs" role="tablist" aria-label="Modal tabs"></ul>
		<div class="graphic-data-modal-panes tab-content"></div></div></div></div>`;

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
		// The dialog is the full-screen scroll surface; only its empty area closes it.
		if (event.target === dialog) close();
	});

	(async () => {
		await installStyles(doc, config);
		if (controller.signal.aborted) return;
		dialog.showModal();
		const modalId = Number(child.modal_id);
		const [modal, figures] = await Promise.all([
			apiFetch({ path: `/wp/v2/modal/${modalId}`, signal: controller.signal }),
			fetchFigures(modalId, controller.signal),
		]);
		if (controller.signal.aborted) return;
		dialog.querySelector('.graphic-data-modal-tagline').innerHTML = modal.modal_tagline || '';
		const links = dialog.querySelector('.graphic-data-modal-accordion');
		appendLinks(doc, links, 'More Info', modal, 'modal_info', config.newTabByDefault);
		appendLinks(doc, links, 'Media', modal, 'modal_photo', true);
		links.hidden = !links.children.length;
		const tabs = dialog.querySelector('.graphic-data-modal-tabs');
		const panes = dialog.querySelector('.graphic-data-modal-panes');
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
			const item = doc.createElement('li'); item.className = 'nav-item'; item.setAttribute('role', 'presentation');
			item.appendChild(button); panes.appendChild(pane); tabs.appendChild(item);
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
		if (tabs.querySelector('button')) activate(tabs.querySelector('button'));
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
				// Restore the separator omitted by the figure renderer's inline-block mode.
				if (index > 0) {
					const separator = doc.createElement('div');
					separator.className = 'separator';
					separator.innerHTML = '<hr style="border: 1px solid #a2a2a2">';
					pane.appendChild(separator);
				}
				const target = await render_tab_info(pane, panes, info, index, true, tab, child.title, group.length);
				configureSceneFigureControls(pane, close);
				if (controller.signal.aborted) return;
				await render_interactive_plots(pane, info, doc, target);
			}
		}
		if (controller.signal.aborted) return;
		const status = dialog.querySelector('.scene-modal-status');
		status.classList.remove('graphic-data-loading-circle');
		status.removeAttribute('aria-label');
		status.textContent = tabFigures.length ? '' : 'This modal has no published figures.';
		status.hidden = Boolean(tabFigures.length);
		resizeVisiblePlots();
	})().catch(error => {
		if (!controller.signal.aborted) {
			if (!dialog.open) dialog.showModal();
			dialog.querySelector('.scene-modal-status').classList.remove('graphic-data-loading-circle');
			dialog.querySelector('.scene-modal-status').removeAttribute('aria-label');
			dialog.querySelector('.scene-modal-status').textContent = error.message || 'Unable to load this modal.';
		}
	});
}
