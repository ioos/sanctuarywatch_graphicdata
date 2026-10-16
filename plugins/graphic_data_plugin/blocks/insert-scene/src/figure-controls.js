/** Keep embeds available while scene-block figure links are unsupported. */
export function configureSceneFigureControls(host, closeModal) {
	host.querySelectorAll('.figure-share-dropdown').forEach((dropdown) => {
		if (dropdown.dataset.sceneControls === 'true') return;
		dropdown.dataset.sceneControls = 'true';
		const originalClose = dropdown.previousElementSibling;
		if (originalClose?.tagName === 'A') {
			const close = host.ownerDocument.createElement('button');
			close.type = 'button';
			close.className = 'scene-figure-close';
			close.textContent = '× Close';
			close.setAttribute('aria-label', 'Close modal');
			close.style.cssText = 'border:0;padding:0;background:transparent;color:rgba(68,68,68,.55);font-size:.8em;cursor:pointer;';
			close.addEventListener('click', closeModal);
			originalClose.replaceWith(close);
		}
		const copyLink = Array.from(dropdown.querySelectorAll('.figure-share-dropdown-menu a'))
			.find((link) => link.textContent.trim() === 'Copy Figure Link');
		if (copyLink) {
			const disabled = host.ownerDocument.createElement('button');
			disabled.type = 'button';
			disabled.disabled = true;
			disabled.textContent = 'Copy Figure Link';
			disabled.title = 'Figure links are not yet available in scene blocks.';
			disabled.style.cssText = copyLink.style.cssText;
			disabled.style.cssText += ';border:0;background:transparent;text-align:left;opacity:.5;cursor:not-allowed;';
			copyLink.replaceWith(disabled);
		}
	});
}
