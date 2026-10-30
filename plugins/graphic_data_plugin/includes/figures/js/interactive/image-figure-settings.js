import { logFormFieldValues } from '@graphic-data/plotly-utility';

/** Consistent labeled controls for image-based interactive figures. */
export function createImageForm(values) {
	function field(parent, id, label, type = 'text', fallback = '', choices) {
		const wrapper = document.createElement('div');
		wrapper.style.margin = '10px 0';
		const caption = document.createElement('label');
		caption.htmlFor = id;
		caption.textContent = label;
		caption.className = 'gd-carousel-field-label';
		caption.style.cssText =
			'display:block;visibility:visible;color:#1d2327;font-size:14px;font-weight:600;line-height:1.5;margin-bottom:4px;text-align:left;float:none;width:100%';
		const input = document.createElement(choices ? 'select' : type === 'textarea' ? 'textarea' : 'input');
		input.id = id;
		input.name = 'plotFields';
		if (choices) choices.forEach(([value, text]) => input.add(new Option(text, value)));
		else if (type === 'textarea') {
			input.rows = 3;
			input.style.cssText = 'display:block;width:100%;max-width:600px';
		} else input.type = type;
		input.value = values[id] ?? fallback;
		input.addEventListener('change', logFormFieldValues);
		if (type !== 'hidden') wrapper.append(caption);
		wrapper.append(input);
		if (type === 'hidden') wrapper.hidden = true;
		parent.append(wrapper);
		return input;
	}
	function explain(input, text) {
		const p = document.createElement('p');
		p.className = 'description';
		p.id = `${input.id}Description`;
		input.setAttribute('aria-describedby', p.id);
		p.textContent = text;
		input.parentElement.append(p);
	}
	return { field, explain };
}

/** Media Library fields share the existing 2,048-pixel display-copy endpoint. */
export function addLibraryImageFields(
	root,
	row,
	prefix,
	{ field, explain },
	{ title, positions, defaultPosition },
) {
	const hidden = {};
	for (const suffix of ['AttachmentId', 'Url', 'Srcset', 'Width', 'Height'])
		hidden[suffix] = field(row, prefix + suffix, '', 'hidden');
	const thumbnail = document.createElement('img');
	thumbnail.style.cssText =
		'max-width:160px;max-height:100px;object-fit:contain;display:block;margin-bottom:8px';
	thumbnail.hidden = !hidden.Url.value;
	if (hidden.Url.value) thumbnail.src = hidden.Url.value;
	row.append(thumbnail);
	const choose = document.createElement('button');
	choose.type = 'button';
	choose.className = 'button';
	choose.textContent = 'Choose image';
	choose.setAttribute('aria-label', title);
	row.append(choose);
	const message = document.createElement('p');
	message.setAttribute('role', 'status');
	row.append(message);
	const text = field(row, prefix + 'Text', 'Image text (optional)');
	explain(text, 'Plain text displayed over this image.');
	field(row, prefix + 'TextPosition', 'Text position', 'text', defaultPosition, positions);
	const alt = field(row, prefix + 'Alt', 'Image alt text');
	explain(
		alt,
		'Describe the image for readers who cannot see it. This is separate from the visible overlay.',
	);
	choose.addEventListener('click', () => {
		if (!window.wp?.media) {
			message.textContent = 'The Media Library is unavailable. Reload the editor and try again.';
			return;
		}
		const picker = window.wp.media({
			title: title,
			library: { type: 'image' },
			multiple: false,
		});
		picker.on('select', async () => {
			const attachment = picker.state().get('selection').first().toJSON();
			root.dataset.preparingImages = String(Number(root.dataset.preparingImages || 0) + 1);
			choose.disabled = true;
			message.textContent = 'Preparing display-size image…';
			try {
				const moduleData = JSON.parse(
					document.getElementById('wp-script-module-data-@graphic-data/file-upload')?.textContent ||
						'{}',
				);
				const body = new URLSearchParams({
					action: 'graphic_data_carousel_image',
					nonce: moduleData.carouselNonce || '',
					attachment_id: String(attachment.id),
				});
				const response = await fetch(window.ajaxurl, { method: 'POST', body });
				const result = await response.json();
				if (!response.ok || !result.success)
					throw new Error(result.data?.message || 'Unable to prepare image.');
				const image = result.data;
				hidden.AttachmentId.value = String(attachment.id);
				hidden.Url.value = image.src;
				hidden.Srcset.value = image.srcset || '';
				hidden.Width.value = image.width;
				hidden.Height.value = image.height;
				alt.value = attachment.alt || '';
				thumbnail.src = image.src;
				thumbnail.hidden = false;
				message.textContent = `Display size: ${image.width} × ${image.height} pixels. Original preserved.`;
				logFormFieldValues();
			} catch (error) {
				message.textContent = error.message;
			} finally {
				choose.disabled = false;
				root.dataset.preparingImages = String(Number(root.dataset.preparingImages || 1) - 1);
			}
		});
		picker.open();
	});
}
