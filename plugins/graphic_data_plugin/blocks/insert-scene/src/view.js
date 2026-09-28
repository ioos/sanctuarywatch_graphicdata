import { __ } from '@wordpress/i18n';
import { mountInlineScene } from './inline-scene';
import { openSceneModal } from './root-modal';

/** Render each saved scene with the same content and chart styling as edit.js. */
function renderSceneBlock(block) {
	if (block.dataset.initialized === 'true') return;
	const sceneId = Number(block.dataset.sceneId);
	const target = block.querySelector('.graphic-data-block-scene-target');
	if (!sceneId || !target) return;
	const data = block.querySelector('.graphic-data-scene-config');
	if (!data) return;
	let config;
	try { config = JSON.parse(data.textContent); } catch { return; }
	block.dataset.initialized = 'true';

	const notice = document.createElement('p');
	notice.className = 'graphic-data-scene-status';
	notice.setAttribute('role', 'status');
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.textContent = __('Retry loading scene', 'graphic-data-plugin');
	retry.hidden = true;
	block.prepend(notice, retry);
	let cleanup;

	function render() {
		cleanup?.();
		let failed = false;
		cleanup = mountInlineScene(target, config, {
			height: Math.max(Number(block.dataset.sceneHeight) || 0, 0),
			onOpenModal: (key, children) => openSceneModal(children[key], config),
			onLoading(loading) {
				block.setAttribute('aria-busy', String(loading));
				if (!failed) {
					notice.textContent = loading ? __('Loading scene content and icons...', 'graphic-data-plugin') : '';
					notice.hidden = !loading;
				}
			},
			onError(message) {
				failed = Boolean(message);
				notice.textContent = message;
				notice.hidden = !message;
				retry.hidden = !message;
			},
		});
	}

	retry.addEventListener('click', render);
	render();
}

function renderGraphicDataInsertScenes() {
	document.querySelectorAll('.graphic-data-frontend-scene[data-scene-id]').forEach(renderSceneBlock);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', renderGraphicDataInsertScenes, { once: true });
} else {
	renderGraphicDataInsertScenes();
}
