import { logFormFieldValues } from '@graphic-data/plotly-utility';

/** Initialize only visible caption editors and remove instances when the settings UI is replaced. */
export function attachCarouselCaptionEditors(root, rows, captions) {
	let disposed = false;
	const initialized = new Set();
	function initialize() {
		if (disposed || !root.isConnected || !window.wp?.editor?.initialize) return;
		captions.forEach((caption, index) => {
			if (rows[index].hidden || initialized.has(caption.id)) return;
			initialized.add(caption.id);
			window.wp.editor.initialize(caption.id, {
				mediaButtons: false,
				quicktags: { buttons: 'strong,em,link,block,del,ins,ul,ol,li,close' },
				tinymce: {
					wpautop: true,
					height: 160,
					menubar: false,
					toolbar1: 'bold italic bullist numlist blockquote link unlink undo redo removeformat',
					toolbar2: '',
					setup(editor) {
						editor.on('init input change undo redo SetContent', () => {
							// Initial SetContent fires before TinyMCE is ready to serialize.
							if (disposed || !editor.initialized) return;
							caption.value = editor.getContent();
							logFormFieldValues();
						});
					},
				},
			});
		});
	}
	root.initializeCaptionEditors = initialize;
	root.syncCaptionEditors = logFormFieldValues;
	root.cleanupCaptionEditors = () => {
		logFormFieldValues();
		disposed = true;
		document.removeEventListener('DOMContentLoaded', initialize);
		window.removeEventListener('load', initialize);
		initialized.forEach(id => window.wp?.editor?.remove?.(id));
	};
	document.addEventListener('DOMContentLoaded', initialize, { once: true });
	window.addEventListener('load', initialize, { once: true });
	initialize();
}
