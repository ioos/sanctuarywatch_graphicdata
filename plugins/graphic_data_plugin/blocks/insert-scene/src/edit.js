import { useState, useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';
import { mountInlineScene, stripHTML } from './inline-scene';

import {
	SelectControl,
	Spinner,
	Notice,
	PanelBody,
	TextControl,
	Button,
	ColorPalette,
	ToggleControl,
	RangeControl,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';


export default function Edit({ attributes, setAttributes, clientId }) {
	const {
		sceneId = 0,
		instanceId = '',
		sceneWidth = 100,
		sceneWidthUnit = '%',
		sceneMaxWidth = 0,
		sceneHeight = 0,
		sceneAlignment = 'center',
		sceneBackgroundColor = 'transparent',
		sceneBorderEnabled = false,
		sceneBorderColor = '#000000',
		sceneBorderWidth = 1,
		sceneBorderRadius = 0,
		scenePadding = 0,
	} = attributes;

	const normalizedWidth = Math.max(Number(sceneWidth) || 0, 0);
	const normalizedMaxWidth = Math.max(Number(sceneMaxWidth) || 0, 0);
	const normalizedHeight = Math.max(Number(sceneHeight) || 0, 0);
	const normalizedBorderWidth = Math.max(Number(sceneBorderWidth) || 0, 0);
	const normalizedBorderRadius = Math.max(Number(sceneBorderRadius) || 0, 0);
	const normalizedPadding = Math.max(Number(scenePadding) || 0, 0);
	const horizontalMargins = {
		left: { marginLeft: '0', marginRight: 'auto' },
		center: { marginLeft: 'auto', marginRight: 'auto' },
		right: { marginLeft: 'auto', marginRight: '0' },
	}[sceneAlignment] || { marginLeft: 'auto', marginRight: 'auto' };


	const blockProps = useBlockProps({ className: 'graphic-data-insert-scene-block' });
	const previewRef = useRef(null);
	const [isLoading, setIsLoading] = useState(false);
	const [mobilePreview, setMobilePreview] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const scenes = useSelect((select) => select('core').getEntityRecords('postType', 'scene', {
		per_page: -1, status: 'publish', orderby: 'title', order: 'asc',
	}), []);
	const scenesAreLoading = scenes == null;
	const sceneOptions = [
		{ label: __('Select a Scene...', 'graphic-data-plugin'), value: 0 },
		...(Array.isArray(scenes) ? scenes.map((scene) => ({
			label: `(id:${scene.id}) - ${stripHTML(scene.title?.rendered || 'Untitled scene')}`,
			value: scene.id,
		})) : []),
	];

	useEffect(() => {
		if (!instanceId) setAttributes({ instanceId: clientId });
	}, [instanceId, clientId, setAttributes]);

	useEffect(() => {
		const controller = new AbortController();
		let cleanup;
		setErrorMessage('');
		setIsLoading(Boolean(sceneId));
		previewRef.current.replaceChildren();
		if (sceneId) {
			apiFetch({
				path: '/wp/v2/block-renderer/create-block/graphic-data-insert-scene?context=edit',
				method: 'POST', data: { attributes: { sceneId } }, signal: controller.signal,
			}).then(({ rendered }) => {
				if (controller.signal.aborted) return;
				const doc = new DOMParser().parseFromString(rendered, 'text/html');
				const data = doc.querySelector('.graphic-data-scene-config');
				if (!data) throw new Error('This scene is unavailable or is not published.');
				cleanup = mountInlineScene(previewRef.current, JSON.parse(data.textContent), {
					height: normalizedHeight, previewMode: mobilePreview ? 'mobile' : 'desktop',
					onLoading: setIsLoading, onError: setErrorMessage,
				});
			}).catch((error) => {
				if (controller.signal.aborted) return;
				setErrorMessage(error.message || 'Unable to load this scene.');
				setIsLoading(false);
			});
		}
		return () => { controller.abort(); cleanup?.(); };
	}, [sceneId, normalizedHeight, mobilePreview]);

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody title={__('Scene preview', 'graphic-data-plugin')} initialOpen={true}>
					<ToggleControl
						label={__('Mobile preview', 'graphic-data-plugin')}
						checked={mobilePreview}
						onChange={setMobilePreview}
						help={mobilePreview
							? __('Shows mobile styling at the current block width. Preview only.', 'graphic-data-plugin')
							: __('Keeps desktop styling even in a narrow editor. The published page stays responsive.', 'graphic-data-plugin')}
					/>
				</PanelBody>
				<PanelBody
					title={__('Scene dimensions', 'graphic-data-plugin')}
					initialOpen={true}
				>
					<TextControl
						label={__('Width', 'graphic-data-plugin')}
						type="number"
						min="0"
						value={normalizedWidth}
						onChange={(value) =>
							setAttributes({ sceneWidth: Math.max(Number(value) || 0, 0) })
						}
					/>

					<SelectControl
						label={__('Width unit', 'graphic-data-plugin')}
						value={sceneWidthUnit}
						options={[
							{ label: '%', value: '%' },
							{ label: 'px', value: 'px' },
							{ label: 'rem', value: 'rem' },
							{ label: 'vw', value: 'vw' },
						]}
						onChange={(value) => setAttributes({ sceneWidthUnit: value })}
					/>

					<TextControl
						label={__('Maximum width (px)', 'graphic-data-plugin')}
						help={__('Use 0 for no maximum.', 'graphic-data-plugin')}
						type="number"
						min="0"
						value={normalizedMaxWidth}
						onChange={(value) =>
							setAttributes({ sceneMaxWidth: Math.max(Number(value) || 0, 0) })
						}
					/>

					<TextControl
						label={__('Height (px)', 'graphic-data-plugin')}
						help={__('Use 0 for automatic height.', 'graphic-data-plugin')}
						type="number"
						min="0"
						value={normalizedHeight}
						onChange={(value) =>
							setAttributes({ sceneHeight: Math.max(Number(value) || 0, 0) })
						}
					/>

					<SelectControl
						label={__('Horizontal alignment', 'graphic-data-plugin')}
						value={sceneAlignment}
						options={[
							{ label: __('Left', 'graphic-data-plugin'), value: 'left' },
							{ label: __('Center', 'graphic-data-plugin'), value: 'center' },
							{ label: __('Right', 'graphic-data-plugin'), value: 'right' },
						]}
						onChange={(value) => setAttributes({ sceneAlignment: value })}
					/>

					<Button
						variant="secondary"
						onClick={() =>
							setAttributes({
								sceneWidth: 100,
								sceneWidthUnit: '%',
								sceneMaxWidth: 0,
								sceneHeight: 0,
								sceneAlignment: 'center',
							})
						}
					>
						{__('Reset dimensions', 'graphic-data-plugin')}
					</Button>
				</PanelBody>

				<PanelBody
					title={__('Scene appearance', 'graphic-data-plugin')}
					initialOpen={false}
				>
					<p>{__('Background color', 'graphic-data-plugin')}</p>
					<ColorPalette
						value={sceneBackgroundColor}
						onChange={(value) =>
							setAttributes({ sceneBackgroundColor: value || 'transparent' })
						}
						clearable
					/>

					<ToggleControl
						label={__('Show border', 'graphic-data-plugin')}
						checked={sceneBorderEnabled}
						onChange={(value) => setAttributes({ sceneBorderEnabled: value })}
					/>

					{sceneBorderEnabled && (
						<>
							<p>{__('Border color', 'graphic-data-plugin')}</p>
							<ColorPalette
								value={sceneBorderColor}
								onChange={(value) =>
									setAttributes({ sceneBorderColor: value || '#000000' })
								}
							/>

							<RangeControl
								label={__('Border thickness (px)', 'graphic-data-plugin')}
								value={normalizedBorderWidth}
								onChange={(value) =>
									setAttributes({ sceneBorderWidth: Math.max(Number(value) || 0, 0) })
								}
								min={0}
								max={20}
							/>
						</>
					)}

					<RangeControl
						label={__('Corner radius (px)', 'graphic-data-plugin')}
						value={normalizedBorderRadius}
						onChange={(value) =>
							setAttributes({ sceneBorderRadius: Math.max(Number(value) || 0, 0) })
						}
						min={0}
						max={100}
					/>

					<RangeControl
						label={__('Inner padding (px)', 'graphic-data-plugin')}
						value={normalizedPadding}
						onChange={(value) =>
							setAttributes({ scenePadding: Math.max(Number(value) || 0, 0) })
						}
						min={0}
						max={100}
					/>

					<Button
						variant="secondary"
						onClick={() =>
							setAttributes({
								sceneBackgroundColor: 'transparent',
								sceneBorderEnabled: false,
								sceneBorderColor: '#000000',
								sceneBorderWidth: 1,
								sceneBorderRadius: 0,
								scenePadding: 0,
							})
						}
					>
						{__('Reset appearance', 'graphic-data-plugin')}
					</Button>
				</PanelBody>
			</InspectorControls>
			<SelectControl
				label={__('Graphic Data - Scene', 'graphic-data-plugin')}
				value={Number(sceneId)}
				options={sceneOptions}
				onChange={(value) => setAttributes({ sceneId: Number(value) })}
			/>
			{scenesAreLoading && <Spinner />}
			{Array.isArray(scenes) && scenes.length === 0 && (
				<Notice status="warning" isDismissible={false}>
					{__('No published scenes found.', 'graphic-data-plugin')}
				</Notice>
			)}
			{isLoading && <span className="graphic-data-loading-circle" role="status" aria-label={__('Loading', 'graphic-data-plugin')} />}
			{errorMessage && <Notice status="error" isDismissible={false}>{errorMessage}</Notice>}
			{!sceneId && !scenesAreLoading && (
				<Notice status="info" isDismissible={false}>
					{__('Select a scene to display its content and icons inline.', 'graphic-data-plugin')}{' '}
					<a href="/wp-admin/post-new.php?post_type=scene" target="_blank" rel="noreferrer">
						{__('Create a New Scene', 'graphic-data-plugin')}
					</a>
				</Notice>
			)}

				<div
					ref={previewRef}
					className="graphic-data-scene-preview"
					style={{
						width: `${normalizedWidth}${sceneWidthUnit}`,
						maxWidth:
							normalizedMaxWidth > 0 ? `${normalizedMaxWidth}px` : 'none',
						backgroundColor: sceneBackgroundColor || 'transparent',
						border: sceneBorderEnabled
							? `${normalizedBorderWidth}px solid ${sceneBorderColor || '#000000'}`
							: 'none',
						borderRadius: `${normalizedBorderRadius}px`,
						padding: `${normalizedPadding}px`,
						boxSizing: 'border-box',
						overflow: normalizedBorderRadius > 0 ? 'hidden' : 'visible',
						...horizontalMargins,
					}}
			/>
		</div>
	);
}

