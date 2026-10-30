import { logFormFieldValues } from '@graphic-data/plotly-utility';
import { carouselSettings } from './image-carousel.js';
import { COMPARISON_POSITIONS } from './image-comparison.js';
import { createImageForm, addLibraryImageFields } from './image-figure-settings.js';

export function comparisonParameterFields(argumentsValue) {
	const root = document.createElement('div');
	root.id = 'secondaryGraphFields';
	const { field, explain } = createImageForm(carouselSettings(argumentsValue));
	const help = document.createElement('p');
	help.textContent =
		'For the best comparison, use coregistered images: both images should show the same area or subject at the same scale, orientation, and alignment, so matching features line up as the divider moves. Use matching aspect ratios and crops. This tool does not align images automatically. Display copies are resized to a maximum of 2,048 pixels on the longest edge; originals are preserved.';
	root.append(help);
	const count = field(
		root,
		'ComparisonCount',
		'Number of image comparison sliders',
		'text',
		'1',
		Array.from({ length: 16 }, (_, i) => [String(i + 1), String(i + 1)]),
	);
	explain(
		count,
		'Reducing this number hides extra pairs without deleting their images, labels, positions, or alt text, even after saving.',
	);
	const rows = [];
	for (let i = 1; i <= 16; i++) {
		const row = document.createElement('fieldset');
		row.style.cssText = 'border:1px solid #ccd0d4;padding:12px;margin:12px 0';
		const legend = document.createElement('legend');
		legend.textContent = `Image set ${i}`;
		legend.style.cssText = 'display:block;width:auto;padding:0 6px;color:#1d2327;font-size:16px;font-weight:600;text-align:left';
		row.append(legend);
		const columns = document.createElement('div');
		columns.style.cssText =
			'display:grid;grid-template-columns:repeat(auto-fit,minmax(min(100%,260px),1fr));gap:20px';
		for (const side of ['Left', 'Right']) {
			const panel = document.createElement('div');
			const title = document.createElement('h4');
			title.textContent = `${side} image`;
			title.id = `Comparison${i}${side}Heading`;
			title.style.cssText = 'display:block;visibility:visible;color:#1d2327;font-size:15px;font-weight:600;line-height:1.5;text-align:left;margin:0 0 10px';
			panel.setAttribute('role', 'group');
			panel.setAttribute('aria-labelledby', title.id);
			panel.append(title);
			addLibraryImageFields(
				root,
				panel,
				`Comparison${i}${side}`,
				{ field, explain },
				{
					title: `Choose ${side.toLowerCase()} image for comparison ${i}`,
					positions: COMPARISON_POSITIONS,
					defaultPosition: 'center',
				},
			);
			columns.append(panel);
		}
		row.append(columns);
		root.append(row);
		rows.push(row);
	}
	function showRows() {
		rows.forEach((row, i) => {
			row.hidden = i >= Number(count.value);
		});
	}
	count.addEventListener('change', showRows);
	showRows();
	document.getElementById('graphGUI').append(root);
	logFormFieldValues();
}
