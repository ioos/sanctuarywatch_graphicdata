import { carouselSettings } from './image-carousel.js';

export const COMPARISON_TYPE = 'Image Comparison Slider';
export const COMPARISON_MODULE_URL = new URL(import.meta.url).pathname;
export const COMPARISON_POSITIONS = [
	['top', 'Top'],
	['center', 'Center'],
	['bottom', 'Bottom'],
];
export const isComparisonSpec = (spec) =>
	spec?.type === 'image-comparison' && spec.version === 1 && Array.isArray(spec.comparisons);
const position = (value) =>
	COMPARISON_POSITIONS.some(([key]) => key === value) ? value : 'center';

export function buildComparisonSpec(argumentsValue) {
	const fields = carouselSettings(argumentsValue);
	const count = Math.max(1, Math.min(16, Math.trunc(Number(fields.ComparisonCount) || 1)));
	const comparisons = Array.from({ length: count }, (_, i) => {
		const images = ['Left', 'Right'].map((side) => {
			const prefix = `Comparison${i + 1}${side}`;
			const src = String(fields[`${prefix}Url`] || '');
			if (!/^(https?:\/\/|\/(?!\/))/.test(src))
				throw new Error(`Choose the ${side.toLowerCase()} image for comparison ${i + 1}.`);
			return {
				attachmentId: Number(fields[`${prefix}AttachmentId`]) || null,
				src,
				srcset: fields[`${prefix}Srcset`] || '',
				width: Number(fields[`${prefix}Width`]) || 0,
				height: Number(fields[`${prefix}Height`]) || 0,
				text: String(fields[`${prefix}Text`] || ''),
				alt: String(fields[`${prefix}Alt`] || ''),
				textPosition: position(fields[`${prefix}TextPosition`]),
			};
		});
		return { left: images[0], right: images[1] };
	});
	return { type: 'image-comparison', version: 1, comparisons };
}

/** Native range control provides keyboard access; dragging the image moves the same divider. */
export async function mountImageComparison(target, spec, { label = 'Image comparison' } = {}) {
	if (
		!target ||
		!isComparisonSpec(spec) ||
		!spec.comparisons.length ||
		spec.comparisons.length > 16
	)
		throw new Error('The image comparison settings are invalid.');
	target
		.querySelectorAll('.gd-comparison-stack')
		.forEach((node) => node.graphicDataComparison?.destroy());
	const doc = target.ownerDocument;
	const root = doc.createElement('section');
	root.className = 'gd-comparison-stack';
	root.setAttribute('aria-label', label || 'Image comparison');
	const style = doc.createElement('style');
	style.textContent = `
	.gd-comparison-stack{display:flex;flex-direction:column;gap:24px;width:100%;min-width:0}
	.gd-comparison-stack *{box-sizing:border-box}
	.gd-comparison-stack .gd-comparison-stage{position:relative;width:100%;aspect-ratio:16/9;overflow:hidden;background:#111;border-radius:10px;touch-action:pan-y;cursor:ew-resize;--gd-divider:50%}
	.gd-comparison-stack .gd-comparison-image{position:absolute;inset:0;margin:0;width:100%;height:100%;background:#111}
	.gd-comparison-stack .gd-comparison-image img{display:block;width:100%;height:100%;object-fit:contain;user-select:none;-webkit-user-drag:none}
	.gd-comparison-stack .gd-comparison-left{z-index:2;clip-path:inset(0 calc(100% - var(--gd-divider)) 0 0)}
	.gd-comparison-stack .gd-comparison-right{z-index:1}
	.gd-comparison-stack figcaption{position:absolute;max-width:calc(100% - 24px);max-height:45%;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;margin:0;background:#000;color:#fff;padding:10px 12px;border-radius:8px;font-size:clamp(12px,2vw,16px);line-height:1.35}
	.gd-comparison-stack .gd-comparison-left figcaption{left:12px;text-align:left}
	.gd-comparison-stack .gd-comparison-right figcaption{right:12px;text-align:right}
	.gd-comparison-stack figcaption[data-position=top]{top:12px}
	.gd-comparison-stack figcaption[data-position=center]{top:50%;transform:translateY(-50%)}
	.gd-comparison-stack figcaption[data-position=bottom]{bottom:12px}
	.gd-comparison-stack .gd-comparison-divider{position:absolute;z-index:3;top:0;bottom:0;left:var(--gd-divider);width:3px;transform:translateX(-50%);background:white;box-shadow:0 0 3px #222;pointer-events:none}
	.gd-comparison-stack .gd-comparison-divider span{position:absolute;top:50%;left:50%;transform:translate(-50%,-50%);border-radius:50%;background:#111;color:#fff;border:2px solid white;padding:8px;white-space:nowrap;font-size:20px;line-height:1}
	.gd-comparison-stack .gd-comparison-control{display:block;margin-top:8px;color:inherit;font-size:14px;text-align:left}
	.gd-comparison-stack input[type=range]{display:block;width:100%;margin:6px 0;min-height:32px;cursor:ew-resize;accent-color:#234b68}
	.gd-comparison-stack input[type=range]:focus-visible{outline:3px solid #1675b6;outline-offset:3px}
	.gd-comparison-stack .gd-comparison-error{color:#b32d2e;margin:8px 0}
	`;
	root.append(style);
	const stages = [];
	for (const [index, pair] of spec.comparisons.entries()) {
		if (!pair.left?.src || !pair.right?.src)
			throw new Error(`Comparison ${index + 1} is missing an image.`);
		const item = doc.createElement('div');
		item.className = 'gd-comparison-item';
		const stage = doc.createElement('div');
		stage.className = 'gd-comparison-stage';
		if (pair.left.width > 0 && pair.left.height > 0)
			stage.style.aspectRatio = `${pair.left.width} / ${pair.left.height}`;
		const error = doc.createElement('p');
		error.className = 'gd-comparison-error';
		error.setAttribute('role', 'status');
		error.hidden = true;
		for (const side of ['right', 'left']) {
			const data = pair[side];
			const figure = doc.createElement('figure');
			figure.className = `gd-comparison-image gd-comparison-${side}`;
			const img = doc.createElement('img');
			img.alt = data.alt || '';
			img.draggable = false;
			img.decoding = 'async';
			img.loading = index === 0 ? 'eager' : 'lazy';
			img.addEventListener('error', () => {
				error.textContent = `The ${side} image in comparison ${index + 1} could not be loaded.`;
				error.hidden = false;
			});
			if (data.srcset) {
				img.srcset = data.srcset;
				img.sizes = '(max-width: 2048px) 100vw, 2048px';
			}
			img.src = data.src;
			figure.append(img);
			if (data.text) {
				const caption = doc.createElement('figcaption');
				caption.textContent = data.text;
				caption.dataset.position = position(data.textPosition);
				figure.append(caption);
			}
			stage.append(figure);
		}
		const divider = doc.createElement('div');
		divider.className = 'gd-comparison-divider';
		divider.setAttribute('aria-hidden', 'true');
		const arrows = doc.createElement('span');
		arrows.textContent = '‹ ›';
		divider.append(arrows);
		stage.append(divider);
		const control = doc.createElement('label');
		control.className = 'gd-comparison-control';
		// control.append(`Comparison ${index + 1}: drag the divider or use the slider below.`);
		const range = doc.createElement('input');
		range.type = 'range';
		range.min = '0';
		range.max = '100';
		range.step = '1';
		range.value = '50';
		range.setAttribute('aria-label', `Comparison ${index + 1}: amount of left image visible`);
		function update(value) {
			const percent = Math.round(Math.max(0, Math.min(100, Number(value) || 0)));
			range.value = String(percent);
			stage.style.setProperty('--gd-divider', `${percent}%`);
			range.setAttribute('aria-valuetext', `${percent}% left image, ${100 - percent}% right image`);
		}
		range.addEventListener('input', () => update(range.value));
		update(50);
		let pointer = null;
		function move(event) {
			const rect = stage.getBoundingClientRect();
			if (rect.width) update(((event.clientX - rect.left) / rect.width) * 100);
		}
		stage.addEventListener('pointerdown', (event) => {
			if (event.isPrimary === false || (event.button !== undefined && event.button !== 0)) return;
			pointer = event.pointerId;
			range.focus({ preventScroll: true });
			stage.setPointerCapture?.(pointer);
			move(event);
		});
		stage.addEventListener('pointermove', (event) => {
			if (pointer !== null && event.pointerId === pointer) move(event);
		});
		const release = (event) => {
			if (event.pointerId !== pointer) return;
			if (stage.hasPointerCapture?.(pointer)) stage.releasePointerCapture(pointer);
			pointer = null;
		};
		stage.addEventListener('pointerup', release);
		stage.addEventListener('pointercancel', release);
		stage.addEventListener('lostpointercapture', () => {
			pointer = null;
		});
		control.append(range);
		item.append(stage, control, error);
		root.append(item);
		stages.push(stage);
	}
	const handle = {
		setHeight(height) {
			stages.forEach((stage) => {
				stage.style.height = `${height}px`;
				stage.style.aspectRatio = 'auto';
			});
		},
		destroy() {
			root.remove();
		},
	};
	root.graphicDataComparison = handle;
	target.append(root);
	return handle;
}

export async function renderComparisonFigure({
	targetId,
	interactiveArguments,
	savedSpec,
	label,
	targetDocument,
}) {
	const fields = carouselSettings(interactiveArguments);
	const editor =
		Boolean(document.getElementsByName('figure_interactive_arguments')[0]) &&
		/post(?:-new)?\.php/.test(location.pathname);
	if (!(editor ? fields.graphType === COMPARISON_TYPE : isComparisonSpec(savedSpec))) return false;
	const rendered = document.getElementsByName('figure_interactive_args_rendered')[0];
	try {
		if (
			editor &&
			Number(document.getElementById('secondaryGraphFields')?.dataset.preparingImages || 0) > 0
		)
			throw new Error('Please wait for the image display copies to finish preparing.');
		const spec = editor ? buildComparisonSpec(fields) : savedSpec;
		if (editor && rendered) rendered.value = JSON.stringify(spec);
		const target =
			(targetDocument || document).getElementById(targetId) || document.getElementById(targetId);
		await mountImageComparison(target, spec, { label });
		return true;
	} catch (error) {
		if (editor && rendered) rendered.value = '';
		throw error;
	}
}
