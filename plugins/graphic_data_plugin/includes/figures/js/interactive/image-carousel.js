import { sanitizeCarouselCaption } from './carousel-caption.js';
/** Shared carousel specification and renderer. No import map is required by exports. */
export const CAROUSEL_TYPE = 'Image Carousel';
export const CAROUSEL_TEXT_POSITIONS = [
	['top-left', 'Top left'],
	['top-center', 'Top center'],
	['top-right', 'Top right'],
	['bottom-left', 'Bottom left'],
	['bottom-center', 'Bottom center'],
	['bottom-right', 'Bottom right'],
];
const textPosition = (value) =>
	CAROUSEL_TEXT_POSITIONS.some(([position]) => position === value) ? value : 'top-right';
export const CAROUSEL_MODULE_URL = new URL(import.meta.url).pathname;
export const isCarouselSpec = (value) =>
	value?.type === 'image-carousel' && value.version === 1 && Array.isArray(value.slides);
export function carouselSettings(value) {
	let parsed = value;
	if (typeof value === 'string') {
		try {
			parsed = JSON.parse(value || '[]');
		} catch {
			// Older data-backed figures may contain escaped JSON quotes.
			try {
				parsed = JSON.parse(value.replace(/\\(["\\])/g, '$1'));
			} catch {
				return {};
			}
		}
	}
	return Array.isArray(parsed) ? Object.fromEntries(parsed) : parsed || {};
}
const bounded = (value, fallback, min, max) =>
	Number.isFinite(Number(value)) && value !== '' && value != null
		? Math.max(min, Math.min(max, Number(value)))
		: fallback;
export function buildCarouselSpec(argumentsValue) {
	const fields = carouselSettings(argumentsValue);
	const count = Math.trunc(bounded(fields.CarouselImageCount, 1, 1, 16));
	const slides = Array.from({ length: count }, (_, index) => {
		const prefix = `CarouselImage${index + 1}`;
		const src = String(fields[`${prefix}Url`] || '');
		if (!src || !/^(https?:\/\/|\/(?!\/))/.test(src))
			throw new Error(`Choose a Media Library image for slide ${index + 1}.`);
		return {
			attachmentId: Number(fields[`${prefix}AttachmentId`]) || null,
			src,
			srcset: fields[`${prefix}Srcset`] || '',
			width: Number(fields[`${prefix}Width`]) || undefined,
			height: Number(fields[`${prefix}Height`]) || undefined,
			text: String(fields[`${prefix}Text`] || ''),
			caption: fields[`${prefix}CaptionFormat`] === 'html'
                ? sanitizeCarouselCaption(fields[`${prefix}Caption`])
                : String(fields[`${prefix}Caption`] || '').trim(),
            captionPadding: bounded(fields[`${prefix}CaptionPadding`], 0, 0, 100),
            captionFormat: fields[`${prefix}CaptionFormat`] === 'html' ? 'html' : 'text',
			textPosition: textPosition(fields[`${prefix}TextPosition`]),
			alt: String(fields[`${prefix}Alt`] || ''),
		};
	});
	return {
		type: 'image-carousel',
		version: 1,
		playback: {
			autoplay: fields.CarouselAutoplay === 'Yes',
			visibleDurationMs: bounded(fields.CarouselVisibleSeconds, 3.5, 1, 120) * 1000,
			fadeDurationMs: bounded(fields.CarouselFadeSeconds, 1, 0, 10) * 1000,
		},
		slides,
	};
}

/** Mount independent instances, including when Gutenberg moves them between documents. */
export async function mountImageCarousel(target, spec, { label = 'Image carousel' } = {}) {
	if (!target || !isCarouselSpec(spec) || !spec.slides.length || spec.slides.length > 16)
		throw new Error('The carousel settings are invalid.');
	target.querySelectorAll('.gd-carousel').forEach((node) => node.graphicDataCarousel?.destroy());
	const doc = target.ownerDocument;
	const root = doc.createElement('section');
	root.className = 'gd-carousel';
	root.setAttribute('aria-label', label || 'Image carousel');
	root.setAttribute('aria-roledescription', 'carousel');
	const style = doc.createElement('style');
	style.textContent = `
	.gd-carousel{width:100%;min-width:0}.gd-carousel *{box-sizing:border-box}.gd-carousel [hidden]{display:none!important}
	.gd-carousel .gd-controls{display:flex;gap:10px;align-items:center;justify-content:center;flex-wrap:wrap;margin:10px 0}
	.gd-carousel button{min-width:36px;min-height:36px;border:1px solid #888;border-radius:6px;background:#fff;color:#222;cursor:pointer}
	.gd-carousel button:focus-visible{outline:3px solid #1675b6;outline-offset:2px}
	.gd-carousel button[aria-current=true]{background:#234b68;color:white}
	.gd-carousel .gd-stage{position:relative;aspect-ratio:16/9;width:100%;background:#111;overflow:hidden;border-radius:10px}
	.gd-carousel .gd-slide{position:absolute;inset:0;opacity:0;pointer-events:none;transition:opacity var(--gd-fade,1000ms) ease-in-out}
	.gd-carousel .gd-slide[aria-hidden=false]{opacity:1;z-index:2;pointer-events:auto}
	.gd-carousel .gd-slide img{width:100%;height:100%;object-fit:contain;display:block}
	.gd-carousel .gd-text{position:absolute;max-width:calc(100% - 20px);max-height:45%;overflow:auto;white-space:pre-wrap;overflow-wrap:anywhere;background:rgba(0,0,0,.88);color:white;padding:8px 12px;border-radius:6px;font-size:clamp(12px,2vw,16px)}
	.gd-carousel .gd-caption{margin:2% 1.5% 1.5%;text-align:left;overflow-wrap:anywhere;line-height:1.5}
	.gd-carousel .gd-caption[data-format=text]{white-space:pre-wrap}
	.gd-carousel .gd-caption > :first-child{margin-top:0}
	.gd-carousel .gd-caption > :last-child{margin-bottom:0}
	.gd-carousel .gd-status{text-align:center;font-size:14px;margin:6px 0}
	.gd-carousel .gd-text[data-position^="top-"]{top:10px}
	.gd-carousel .gd-text[data-position^="bottom-"]{bottom:10px}
	.gd-carousel .gd-text[data-position$="-right"]{right:10px}
	.gd-carousel .gd-text[data-position$="-left"]{left:10px}
	.gd-carousel .gd-text[data-position$="-center"]{left:50%;transform:translateX(-50%);width:max-content}

	@media(prefers-reduced-motion:reduce){.gd-carousel .gd-slide{transition:none}}
	`;
	root.append(style);
	const controls = doc.createElement('div');
	controls.className = 'gd-controls';
	root.append(controls);
	const stage = doc.createElement('div');
	stage.className = 'gd-stage';
	root.append(stage);
	const caption = doc.createElement('div');
	caption.className = 'gd-caption';
	caption.hidden = true;
	caption.setAttribute('aria-atomic', 'true');
	root.append(caption);
	const status = doc.createElement('p');
	status.className = 'gd-status';
	status.hidden = true;
	status.setAttribute('aria-live', 'polite');
	root.append(status);
	const motion = doc.defaultView.matchMedia('(prefers-reduced-motion: reduce)');
	let index = 0,
		timer,
		transitionTimer,
		lifecycle,
		destroyed = false,
		busy = false;
	let playing = Boolean(spec.playback?.autoplay) && !motion.matches;
	let visible = false,
		ready = false;
	const visibleDuration = bounded(spec.playback?.visibleDurationMs, 3500, 1000, 120000);
	const fadeDuration = () =>
		motion.matches ? 0 : bounded(spec.playback?.fadeDurationMs, 1000, 0, 10000);
	root.style.setProperty('--gd-fade', `${fadeDuration()}ms`);
	function button(text, labelText, action) {
		const el = doc.createElement('button');
		el.type = 'button';
		el.textContent = text;
		el.setAttribute('aria-label', labelText);
		el.addEventListener('click', action);
		controls.append(el);
		return el;
	}
	const previous = button('❮', 'Previous image', () => change(index - 1, true));
	const dots = [];
	const loads = [];
	const loadTimeouts = [];
	const finishLoads = [];
	const slides = spec.slides.map((slide, i) => {
		const el = doc.createElement('div');
		el.className = 'gd-slide';
		el.setAttribute('role', 'group');
		el.setAttribute('aria-roledescription', 'slide');
		el.setAttribute('aria-label', `${i + 1} of ${spec.slides.length}`);
		el.setAttribute('aria-hidden', String(i !== 0));
		el.inert = i !== 0;
		const img = doc.createElement('img');
		img.alt = slide.alt || '';
		img.decoding = 'async';
		el.append(img);
		if (slide.text) {
			const text = doc.createElement('div');
			text.className = 'gd-text';
			text.dataset.position = textPosition(slide.textPosition);
			text.textContent = slide.text;
			el.append(text);
		}
		stage.append(el);
		dots.push(button(String(i + 1), `Go to image ${i + 1}`, () => change(i, true)));
		return { el, img };
	});
	const next = button('❯', 'Next image', () => change(index + 1, true));
	const play = button(playing ? 'Pause' : 'Play', 'Toggle automatic playback', () => {
		playing = !playing;
		update();
		schedule();
	});
	if (slides.length === 1) controls.hidden = true;
	function load(i) {
		if (!loads[i])
			loads[i] = new Promise((resolve) => {
				const { img } = slides[i];
				const done = () => {
					clearTimeout(loadTimeouts[i]);
					img.onload = img.onerror = null;
					resolve();
				};
				finishLoads[i] = done;
				loadTimeouts[i] = setTimeout(done, 15000);
				img.onload = done;
				img.onerror = done;
				if (spec.slides[i].srcset) {
					img.srcset = spec.slides[i].srcset;
					img.sizes = '(max-width: 2048px) 100vw, 2048px';
				}
				img.src = spec.slides[i].src;
				if (img.complete) done();
			});
		return loads[i];
	}
	function update() {
		caption.style.padding = `${bounded(spec.slides[index].captionPadding, 0, 0, 100)}px`;
		caption.dataset.format = spec.slides[index].captionFormat === 'html' ? 'html' : 'text';
        if (caption.dataset.format === 'html') caption.innerHTML = sanitizeCarouselCaption(spec.slides[index].caption, caption.ownerDocument);
        else caption.textContent = String(spec.slides[index].caption || '').trim();
        caption.hidden = !caption.textContent.replace(/[\s\u00a0\u200b\ufeff]/g, '');
		caption.setAttribute('aria-live', playing ? 'off' : 'polite');
		dots.forEach((dot, i) => dot.setAttribute('aria-current', String(i === index)));
		play.textContent = playing ? 'Pause' : 'Play';
		play.setAttribute(
			'aria-label',
			playing ? 'Pause automatic playback' : 'Start automatic playback',
		);
		status.setAttribute('aria-live', playing ? 'off' : 'polite');
		status.textContent = slides[index].img.complete && !slides[index].img.naturalWidth
			? 'This image is unavailable.' : '';
		status.hidden = !status.textContent;
	}
	function isVisible() {
		if (!root.isConnected || root.ownerDocument.hidden || !root.getClientRects().length)
			return false;
		if (root.closest('[aria-hidden="true"], [hidden]')) return false;
		const view = root.ownerDocument.defaultView;
		return view.getComputedStyle(root).visibility !== 'hidden';
	}
	function schedule() {
		clearTimeout(timer);
		if (
			!destroyed &&
			ready &&
			playing &&
			!busy &&
			visible &&
			slides.length > 1
		)
			timer = setTimeout(() => change(index + 1), visibleDuration);
	}
	async function change(nextIndex, manual = false) {
		if (destroyed || busy) return;
		if (manual) playing = false;
		nextIndex = (nextIndex + slides.length) % slides.length;
		if (nextIndex === index) {
			update();
			schedule();
			return;
		}
		clearTimeout(timer);
		busy = true;
		await load(nextIndex);
		if (destroyed) return;
		const old = slides[index].el;
		// Keep the outgoing image visible beneath the incoming fade.
		old.style.opacity = '1';
		old.style.zIndex = '1';
		old.setAttribute('aria-hidden', 'true');
		old.inert = true;
		index = nextIndex;
		slides[index].el.setAttribute('aria-hidden', 'false');
		slides[index].el.inert = false;
		update();
		transitionTimer = setTimeout(() => {
			old.style.opacity = '';
			old.style.zIndex = '';
			busy = false;
			schedule();
		}, fadeDuration());
		load((index + 1) % slides.length);
	}
	// Focusing Play must not cancel the playback it explicitly requests. Hovering
	// never silently pauses; other keyboard controls stop rotation for navigation.
	root.addEventListener('focusin', (event) => {
		if (event.target === play) return;
		playing = false;
		update();
		schedule();
	});
	root.addEventListener('keydown', (event) => {
		if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
			event.preventDefault();
			change(index + (event.key === 'ArrowLeft' ? -1 : 1), true);
		}
	});
	const onMotion = () => {
		if (motion.matches) playing = false;
		root.style.setProperty('--gd-fade', `${fadeDuration()}ms`);
		update();
		schedule();
	};
	motion.addEventListener('change', onMotion);
	const handle = {
		setHeight(height) {
			stage.style.height = `${height}px`;
			stage.style.aspectRatio = 'auto';
		},
		destroy() {
			destroyed = true;
			clearTimeout(timer);
			clearTimeout(transitionTimer);
			clearInterval(lifecycle);
			motion.removeEventListener('change', onMotion);
			finishLoads.forEach((finish) => finish());
			slides.forEach(({ img }) => {
				img.onload = img.onerror = null;
			});
			root.remove();
		},
	};
	root.graphicDataCarousel = handle;
	target.append(root);
	// Poll visibility as well as removal: modal/tab visibility changes may happen on ancestors.
	// This also tolerates Gutenberg moving the live node into its editor iframe.
	lifecycle = setInterval(() => {
		if (!root.isConnected) {
			handle.destroy();
			return;
		}
		const now = isVisible();
		if (now !== visible) {
			visible = now;
			schedule();
		}
	}, 250);
	await load(0);
	if (!destroyed) {
		ready = true;
		update();
		visible = isVisible();
		schedule();
		if (slides.length > 1) load(1);
	}
	return handle;
}

export async function renderCarouselFigure({
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
	if (!(editor ? fields.graphType === CAROUSEL_TYPE : isCarouselSpec(savedSpec))) return false;
	const rendered = document.getElementsByName('figure_interactive_args_rendered')[0];
	try {
		if (
			editor &&
			Number(document.getElementById('secondaryGraphFields')?.dataset.preparingImages || 0) > 0
		)
			throw new Error('Please wait for the image display copies to finish preparing.');
		const spec = editor ? buildCarouselSpec(fields) : savedSpec;
		if (editor && rendered) rendered.value = JSON.stringify(spec).replace(/</g, '\\u003c').replace(/>/g, '\\u003e');
		const target =
			(targetDocument || document).getElementById(targetId) || document.getElementById(targetId);
		await mountImageCarousel(target, spec, { label });
		return true;
	} catch (error) {
		if (editor && rendered) rendered.value = '';
		throw error;
	}
}
