import { __ } from '@wordpress/i18n';
import { mountInlineModal } from './inline-modal';

/** Render each saved modal with the same content and chart styling as edit.js. */
function renderModalBlock(block) {
	if (block.dataset.initialized === 'true') return;
	const modalId = Number(block.dataset.modalId);
	const target = block.querySelector('.graphic-data-block-modal-target');
	if (!modalId || !target) return;
	block.dataset.initialized = 'true';

	const notice = document.createElement('p');
	notice.className = 'graphic-data-modal-status';
	notice.setAttribute('role', 'status');
	const retry = document.createElement('button');
	retry.type = 'button';
	retry.textContent = __('Retry loading modal', 'graphic-data-plugin');
	retry.hidden = true;
	block.prepend(notice, retry);
	let cleanup;

	function render() {
		cleanup?.();
		let failed = false;
		cleanup = mountInlineModal(target, modalId, {
			height: Math.max(Number(block.dataset.modalHeight) || 0, 0),
			pluginUrl: block.dataset.pluginUrl,
			selectedTabBackgroundColor: block.dataset.selectedTabBackgroundColor,
			unselectedTabBackgroundColor: block.dataset.unselectedTabBackgroundColor,
			onLoading(loading) {
				block.setAttribute('aria-busy', String(loading));
				if (!failed) {
					notice.textContent = loading ? __('Loading modal content and figures...', 'graphic-data-plugin') : '';
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

function renderGraphicDataInsertModals() {
	document.querySelectorAll('.graphic-data-frontend-modal[data-modal-id]').forEach(renderModalBlock);
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', renderGraphicDataInsertModals, { once: true });
} else {
	renderGraphicDataInsertModals();
}
