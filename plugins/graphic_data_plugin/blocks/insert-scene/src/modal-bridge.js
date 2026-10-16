/** Native ES module loaded only by frontend scene iframes. */
export function render_modal(key, children) {
	// The scene renderer reveals its local shell before invoking render_modal.
	// Hide that shell immediately; the actual modal belongs to the root page.
	const localModal = document.getElementById('myModal');
	if (localModal) localModal.style.display = 'none';
	window.openSceneRootModal?.(key, children);
}
