import { mountInlineModal } from './inline-modal';

function renderGraphicDataInsertModals() {
	document.querySelectorAll('.graphic-data-frontend-modal[data-modal-id]').forEach((block) => {
		if (block.dataset.initialized === 'true') return;
		const modalId = Number(block.dataset.modalId);
		const target = block.querySelector('.graphic-data-block-modal-target');
		if (!modalId || !target) return;
		block.dataset.initialized = 'true';

		const notice = document.createElement('p');
		notice.setAttribute('role', 'status');
		block.prepend(notice);
		let failed = false;
		mountInlineModal(target, modalId, {
			height: Math.max(Number(block.dataset.modalHeight) || 0, 0),
			pluginUrl: block.dataset.pluginUrl,
			onLoading(loading) {
				block.setAttribute('aria-busy', String(loading));
				if (!failed) {
					notice.textContent = loading ? 'Loading modal content and figures...' : '';
					notice.hidden = !loading;
				}
			},
			onError(message) {
				failed = Boolean(message);
				notice.textContent = message;
				notice.hidden = !message;
			},
		});
	});
}

if (document.readyState === 'loading') {
	document.addEventListener('DOMContentLoaded', renderGraphicDataInsertModals, { once: true });
} else {
	renderGraphicDataInsertModals();
}
