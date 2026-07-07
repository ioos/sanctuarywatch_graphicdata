/**
 * @graphic-data/search-dialog
 *
 * Wires the navbar's search-trigger button to the native <dialog> element.
 * The <dialog> element handles focus trapping, escape-to-close, backdrop
 * click, and the `inert` behavior for siblings — so this module is
 * intentionally thin: open, close, and restore focus to the trigger.
 */

const trigger = document.getElementById('graphic-data-search-trigger');
const dialog = document.getElementById('graphic-data-search-dialog');
const cancel = document.getElementById('graphic-data-search-cancel');
const input = document.getElementById('graphic-data-search');

if (trigger && dialog && cancel && input) {
	trigger.addEventListener('click', () => {
		dialog.showModal();
		// Give the browser one frame to set up the dialog before we focus.
		// Focusing synchronously inside showModal() works in most browsers
		// but occasionally races the default-focus assignment in Safari.
		requestAnimationFrame(() => input.focus());
	});

	cancel.addEventListener('click', () => {
		dialog.close();
	});

	// Native <dialog> restores focus to the previously-focused element
	// (the trigger) on close automatically. Nothing to do here.

	// Clicking the backdrop closes the dialog. The dialog element itself
	// fills only its own box; clicks outside land on the ::backdrop, which
	// in the DOM registers as clicks on the <dialog> element with the
	// target being the dialog itself (not a child).
	dialog.addEventListener('click', (event) => {
		if (event.target === dialog) {
			dialog.close();
		}
	});
}
