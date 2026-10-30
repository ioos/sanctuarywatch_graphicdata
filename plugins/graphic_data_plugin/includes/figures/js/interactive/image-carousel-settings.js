import { sanitizeCarouselCaption, plainCarouselCaptionToHtml } from './carousel-caption.js';
import { attachCarouselCaptionEditors } from './carousel-caption-editor.js';
import { createImageForm, addLibraryImageFields } from './image-figure-settings.js';
import { logFormFieldValues } from '@graphic-data/plotly-utility';
import { carouselSettings, CAROUSEL_TEXT_POSITIONS } from './image-carousel.js';

/** All sixteen rows remain in the form, including when hidden by the active count. */
export function carouselParameterFields(argumentsValue) {
	const values = carouselSettings(argumentsValue);
	const root = document.createElement('div');
	root.id = 'secondaryGraphFields';
	const help = document.createElement('p');
	help.textContent =
		'Choose images with uniform aspect ratios for a consistent presentation. Images retain their proportions. Display copies are resized to a maximum of 2,048 pixels on the longest edge; original uploads are preserved.';
	root.append(help);
	const { field, explain } = createImageForm(values);
	const autoplay = field(root, 'CarouselAutoplay', 'Autoplay', 'text', 'No', [
		['No', 'Off'],
		['Yes', 'On'],
	]);
	explain(
		autoplay,
		'Automatically advance through images. Readers can pause playback. Reduced-motion preferences disable automatic playback initially.',
	);
	const visible = field(
		root,
		'CarouselVisibleSeconds',
		'Time fully visible (seconds)',
		'number',
		'3.5',
	);
	visible.min = '1';
	visible.max = '120';
	visible.step = '0.5';
	explain(
		visible,
		'How long each image remains fully visible before the next fade. Applies only to autoplay.',
	);
	const fade = field(root, 'CarouselFadeSeconds', 'Fade duration (seconds)', 'number', '1');
	fade.min = '0';
	fade.max = '10';
	fade.step = '0.1';
	explain(fade, 'Duration of the transition between images. Set to 0 for an instant change.');
	const count = field(
		root,
		'CarouselImageCount',
		'Number of images',
		'text',
		'1',
		Array.from({ length: 16 }, (_, i) => [String(i + 1), String(i + 1)]),
	);
	explain(
		count,
		'Reducing this number hides extra rows without deleting their images or text, even after saving.',
	);
	const rows = [];
	const captions = [];
	for (let i = 1; i <= 16; i++) {
		const row = document.createElement('fieldset');
		row.style.cssText = 'border:1px solid #ccd0d4;padding:12px;margin:12px 0';
		const legend = document.createElement('legend');
		legend.textContent = `Image ${i}`;
		row.append(legend);
		const prefix = `CarouselImage${i}`;
		addLibraryImageFields(
			root,
			row,
			prefix,
			{ field, explain },
			{
				title: `Choose carousel image ${i}`,
				positions: CAROUSEL_TEXT_POSITIONS,
				defaultPosition: 'top-right',
			},
		);
		const caption = field(row, prefix + 'Caption', 'Caption below image (optional)', 'textarea');
        caption.dataset.carouselRichCaption = 'true';
        caption.value = values[prefix + 'CaptionFormat'] === 'html'
            ? sanitizeCarouselCaption(caption.value)
            : plainCarouselCaptionToHtml(caption.value);
        field(row, prefix + 'CaptionFormat', '', 'hidden', 'html').value = 'html';
        captions.push(caption);
        caption.addEventListener('input', logFormFieldValues);
        explain(caption, 'Formatted context shown below this image. Use bold, italic, lists, links, or the alignment buttons. Leave blank to hide the caption area.');
        const padding = field(row, prefix + 'CaptionPadding', 'Caption padding (pixels)', 'number', '0');
        padding.parentElement.style.textAlign = 'left';
        padding.style.textAlign = 'left';
        padding.min = '0';
        padding.max = '100';
        padding.step = '1';
        explain(padding, 'Extra space inside the caption on all sides (0–100 pixels). Applies only when this image has a caption.');
		root.append(row);
		rows.push(row);
	}
	function showRows() {
		rows.forEach((row, i) => {
			row.hidden = i >= Number(count.value);
		});
		root.initializeCaptionEditors?.();
	}
	count.addEventListener('change', showRows);
	showRows();
	document.getElementById('graphGUI').append(root);
	attachCarouselCaptionEditors(root, rows, captions);
	logFormFieldValues();
}
