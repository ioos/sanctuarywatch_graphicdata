/* global wp */
(function () {
	'use strict';

	const { createElement: el, useEffect } = wp.element;
	const { useSelect, useDispatch } = wp.data;
	const { SelectControl, TextControl, Button } = wp.components;
	const { PluginDocumentSettingPanel } = wp.editor;
	const { __ } = wp.i18n;
	const prefix = '_graphic_data_page_title_';

	function paddingValue(value) {
		if (value === '' || value === undefined || value === null || !Number.isFinite(Number(value))) return '';
		return String(Math.max(0, Math.min(200, Math.trunc(Number(value)))));
	}

	// Support both the classic editor canvas and Gutenberg's iframe canvas.
	// A document stylesheet also covers title elements recreated by React.
	function previewTitle(css) {
		if (!css) return undefined;
		const styles = new Map();
		const frames = new Map();
		function apply(doc) {
			if (!doc?.head || styles.has(doc)) return;
			const style = doc.createElement('style');
			style.textContent = '.editor-styles-wrapper .editor-post-title__input{' + css + '}';
			doc.head.appendChild(style);
			styles.set(doc, style);
		}
		function scan() {
			apply(document);
			document.querySelectorAll('iframe[name="editor-canvas"]').forEach((frame) => {
				if (!frames.has(frame)) {
					const onLoad = () => apply(frame.contentDocument);
					frames.set(frame, onLoad);
					frame.addEventListener('load', onLoad);
				}
				apply(frame.contentDocument);
			});
			frames.forEach((onLoad, frame) => {
				if (!frame.isConnected) {
					frame.removeEventListener('load', onLoad);
					frames.delete(frame);
				}
			});
			styles.forEach((style, doc) => {
				if (doc !== document && !Array.from(frames.keys()).some((frame) => frame.contentDocument === doc)) {
					style.remove();
					styles.delete(doc);
				}
			});
		}
		scan();
		const observer = new MutationObserver(scan);
		observer.observe(document.body, { childList: true, subtree: true });
		return () => {
			observer.disconnect();
			frames.forEach((onLoad, frame) => frame.removeEventListener('load', onLoad));
			styles.forEach((style) => style.remove());
		};
	}

	function TitleAppearance() {
		const { postType, meta } = useSelect((select) => {
			const editor = select('core/editor');
			return {
				postType: editor.getCurrentPostType(),
				meta: editor.getEditedPostAttribute('meta') || {},
			};
		}, []);
		const { editPost } = useDispatch('core/editor');
		const align = ['left', 'center', 'right'].includes(meta[prefix + 'align']) ? meta[prefix + 'align'] : '';
		const left = paddingValue(meta[prefix + 'padding_left']);
		const right = paddingValue(meta[prefix + 'padding_right']);
		let css = '';
		if (align) css += 'text-align:' + align + ' !important;';
		if (left !== '') css += 'padding-left:' + left + 'px !important;';
		if (right !== '') css += 'padding-right:' + right + 'px !important;';
		if (css) css = 'box-sizing:border-box;' + css;
		useEffect(() => postType === 'page' ? previewTitle(css) : undefined, [postType, css]);
		if (postType !== 'page') return null;

		function update(field, value) {
			editPost({ meta: { [prefix + field]: value } });
		}
		return el(PluginDocumentSettingPanel, {
			name: 'title-appearance',
			title: __('Title Appearance', 'graphic_data_plugin'),
		},
		el(SelectControl, {
			label: __('Alignment', 'graphic_data_plugin'),
			value: align,
			options: [
				{ label: __('Theme default', 'graphic_data_plugin'), value: '' },
				{ label: __('Left', 'graphic_data_plugin'), value: 'left' },
				{ label: __('Center', 'graphic_data_plugin'), value: 'center' },
				{ label: __('Right', 'graphic_data_plugin'), value: 'right' },
			],
			onChange: (value) => update('align', value),
		}),
		...['left', 'right'].map((side) => el(TextControl, {
			key: side,
			type: 'number', min: 0, max: 200, step: 1,
			label: side === 'left' ? __('Left padding (px)', 'graphic_data_plugin') : __('Right padding (px)', 'graphic_data_plugin'),
			value: side === 'left' ? left : right,
			placeholder: __('Theme default', 'graphic_data_plugin'),
			help: __('Leave blank to use the theme spacing. Range: 0–200 px.', 'graphic_data_plugin'),
			onChange: (value) => update('padding_' + side, paddingValue(value)),
		})),
		el(Button, {
			variant: 'secondary',
			disabled: !align && left === '' && right === '',
			onClick: () => editPost({ meta: {
				[prefix + 'align']: '',
				[prefix + 'padding_left']: '',
				[prefix + 'padding_right']: '',
			} }),
		}, __('Reset to theme defaults', 'graphic_data_plugin')));
	}

	wp.plugins.registerPlugin('graphic-data-page-title', { render: TitleAppearance });
})();
