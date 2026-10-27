/** Small, explicit rich-text vocabulary for captions; no scripts or media; only validated text alignment styles. */
export function sanitizeCarouselCaption(html, doc = document) {
	const template = doc.createElement('template');
	template.innerHTML = String(html || '');
	const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'DEL', 'INS', 'UL', 'OL', 'LI', 'BLOCKQUOTE', 'A']);
	const drop = new Set(['SCRIPT', 'STYLE', 'IFRAME', 'OBJECT', 'EMBED', 'SVG', 'MATH', 'TEMPLATE']);
	function copy(node, parent) {
		if (node.nodeType === 3) { parent.append(doc.createTextNode(node.textContent)); return; }
		if (node.nodeType !== 1 || drop.has(node.tagName)) return;
		let target = parent;
		if (allowed.has(node.tagName)) {
			target = doc.createElement(node.tagName.toLowerCase());
            // Keep TinyMCE paragraph alignment without allowing arbitrary inline CSS.
            const alignment = node.style.textAlign;
            if (['left', 'center', 'right', 'justify'].includes(alignment)) {
                target.style.textAlign = alignment;
            }
			if (node.tagName === 'A') {
				const href = (node.getAttribute('href') || '').trim();
				// Reject encoded control-character protocol tricks as well as executable URLs.
				if (!/[\u0000-\u0020\u007f]/.test(href) && /^(https?:\/\/|mailto:|tel:|\/(?!\/)|#)/i.test(href)) target.setAttribute('href', href);
				if (node.getAttribute('title')) target.setAttribute('title', node.getAttribute('title'));
				if (node.getAttribute('target') === '_blank') { target.setAttribute('target', '_blank'); target.setAttribute('rel', 'noopener noreferrer'); }
			}
			parent.append(target);
		}
		Array.from(node.childNodes).forEach(child => copy(child, target));
	}
	const result = doc.createElement('div');
	Array.from(template.content.childNodes).forEach(node => copy(node, result));
	return result.textContent.replace(/[\s\u00a0\u200b\ufeff]/g, '') ? result.innerHTML : '';
}

/** Preserve the literal meaning and line breaks of captions written before rich text existed. */
export function plainCarouselCaptionToHtml(text, doc = document) {
	const div = doc.createElement('div'); div.textContent = String(text || '');
	return div.innerHTML.replace(/\r?\n/g, '<br>');
}
