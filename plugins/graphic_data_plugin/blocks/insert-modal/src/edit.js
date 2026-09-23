import { useState, useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import { mountInlineModal, stripHTML } from './inline-modal';

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
		modalId = 0,
		instanceId = '',
		modalWidth = 100,
		modalWidthUnit = '%',
		modalMaxWidth = 0,
		modalHeight = 0,
		modalAlignment = 'center',
		modalBackgroundColor = 'transparent',
		modalBorderEnabled = false,
		modalBorderColor = '#000000',
		modalBorderWidth = 1,
		modalBorderRadius = 0,
		modalPadding = 0,
	} = attributes;

	const normalizedWidth = Math.max(Number(modalWidth) || 0, 0);
	const normalizedMaxWidth = Math.max(Number(modalMaxWidth) || 0, 0);
	const normalizedHeight = Math.max(Number(modalHeight) || 0, 0);
	const normalizedBorderWidth = Math.max(Number(modalBorderWidth) || 0, 0);
	const normalizedBorderRadius = Math.max(Number(modalBorderRadius) || 0, 0);
	const normalizedPadding = Math.max(Number(modalPadding) || 0, 0);
	const horizontalMargins = {
		left: { marginLeft: '0', marginRight: 'auto' },
		center: { marginLeft: 'auto', marginRight: 'auto' },
		right: { marginLeft: 'auto', marginRight: '0' },
	}[modalAlignment] || { marginLeft: 'auto', marginRight: 'auto' };


	const blockProps = useBlockProps({ className: 'graphic-data-insert-modal-block' });
	const previewRef = useRef(null);
	const [isLoading, setIsLoading] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const modals = useSelect((select) => select('core').getEntityRecords('postType', 'modal', {
		per_page: -1, status: 'publish', orderby: 'title', order: 'asc',
	}), []);
	const modalsAreLoading = modals == null;
	const modalOptions = [
		{ label: __('Select a Modal...', 'graphic-data-plugin'), value: 0 },
		...(Array.isArray(modals) ? modals.map((modal) => ({
			label: `(id:${modal.id}) - ${stripHTML(modal.title?.rendered || 'Untitled modal')}`,
			value: modal.id,
		})) : []),
	];

	useEffect(() => {
		if (!instanceId) setAttributes({ instanceId: clientId });
	}, [instanceId, clientId, setAttributes]);

	useEffect(() => mountInlineModal(previewRef.current, modalId, {
		height: normalizedHeight,
		onLoading: setIsLoading,
		onError: setErrorMessage,
	}), [modalId, normalizedHeight]);

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody
					title={__('Modal dimensions', 'graphic-data-plugin')}
					initialOpen={true}
				>
					<TextControl
						label={__('Width', 'graphic-data-plugin')}
						type="number"
						min="0"
						value={normalizedWidth}
						onChange={(value) =>
							setAttributes({ modalWidth: Math.max(Number(value) || 0, 0) })
						}
					/>

					<SelectControl
						label={__('Width unit', 'graphic-data-plugin')}
						value={modalWidthUnit}
						options={[
							{ label: '%', value: '%' },
							{ label: 'px', value: 'px' },
							{ label: 'rem', value: 'rem' },
							{ label: 'vw', value: 'vw' },
						]}
						onChange={(value) => setAttributes({ modalWidthUnit: value })}
					/>

					<TextControl
						label={__('Maximum width (px)', 'graphic-data-plugin')}
						help={__('Use 0 for no maximum.', 'graphic-data-plugin')}
						type="number"
						min="0"
						value={normalizedMaxWidth}
						onChange={(value) =>
							setAttributes({ modalMaxWidth: Math.max(Number(value) || 0, 0) })
						}
					/>

					<TextControl
						label={__('Height (px)', 'graphic-data-plugin')}
						help={__('Use 0 for automatic height.', 'graphic-data-plugin')}
						type="number"
						min="0"
						value={normalizedHeight}
						onChange={(value) =>
							setAttributes({ modalHeight: Math.max(Number(value) || 0, 0) })
						}
					/>

					<SelectControl
						label={__('Horizontal alignment', 'graphic-data-plugin')}
						value={modalAlignment}
						options={[
							{ label: __('Left', 'graphic-data-plugin'), value: 'left' },
							{ label: __('Center', 'graphic-data-plugin'), value: 'center' },
							{ label: __('Right', 'graphic-data-plugin'), value: 'right' },
						]}
						onChange={(value) => setAttributes({ modalAlignment: value })}
					/>

					<Button
						variant="secondary"
						onClick={() =>
							setAttributes({
								modalWidth: 100,
								modalWidthUnit: '%',
								modalMaxWidth: 0,
								modalHeight: 0,
								modalAlignment: 'center',
							})
						}
					>
						{__('Reset dimensions', 'graphic-data-plugin')}
					</Button>
				</PanelBody>

				<PanelBody
					title={__('Modal appearance', 'graphic-data-plugin')}
					initialOpen={false}
				>
					<p>{__('Background color', 'graphic-data-plugin')}</p>
					<ColorPalette
						value={modalBackgroundColor}
						onChange={(value) =>
							setAttributes({ modalBackgroundColor: value || 'transparent' })
						}
						clearable
					/>

					<ToggleControl
						label={__('Show border', 'graphic-data-plugin')}
						checked={modalBorderEnabled}
						onChange={(value) => setAttributes({ modalBorderEnabled: value })}
					/>

					{modalBorderEnabled && (
						<>
							<p>{__('Border color', 'graphic-data-plugin')}</p>
							<ColorPalette
								value={modalBorderColor}
								onChange={(value) =>
									setAttributes({ modalBorderColor: value || '#000000' })
								}
							/>

							<RangeControl
								label={__('Border thickness (px)', 'graphic-data-plugin')}
								value={normalizedBorderWidth}
								onChange={(value) =>
									setAttributes({ modalBorderWidth: Math.max(Number(value) || 0, 0) })
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
							setAttributes({ modalBorderRadius: Math.max(Number(value) || 0, 0) })
						}
						min={0}
						max={100}
					/>

					<RangeControl
						label={__('Inner padding (px)', 'graphic-data-plugin')}
						value={normalizedPadding}
						onChange={(value) =>
							setAttributes({ modalPadding: Math.max(Number(value) || 0, 0) })
						}
						min={0}
						max={100}
					/>

					<Button
						variant="secondary"
						onClick={() =>
							setAttributes({
								modalBackgroundColor: 'transparent',
								modalBorderEnabled: false,
								modalBorderColor: '#000000',
								modalBorderWidth: 1,
								modalBorderRadius: 0,
								modalPadding: 0,
							})
						}
					>
						{__('Reset appearance', 'graphic-data-plugin')}
					</Button>
				</PanelBody>
			</InspectorControls>
			<SelectControl
				label={__('Graphic Data - Modal', 'graphic-data-plugin')}
				value={Number(modalId)}
				options={modalOptions}
				onChange={(value) => setAttributes({ modalId: Number(value) })}
			/>
			{modalsAreLoading && <Spinner />}
			{Array.isArray(modals) && modals.length === 0 && (
				<Notice status="warning" isDismissible={false}>
					{__('No published modals found.', 'graphic-data-plugin')}
				</Notice>
			)}
			{isLoading && <p><Spinner /> {__('Loading modal content and figures...', 'graphic-data-plugin')}</p>}
			{errorMessage && <Notice status="error" isDismissible={false}>{errorMessage}</Notice>}
			{!modalId && !modalsAreLoading && (
				<Notice status="info" isDismissible={false}>
					{__('Select a modal to display its content and figures inline.', 'graphic-data-plugin')}{' '}
					<a href="/wp-admin/post-new.php?post_type=modal" target="_blank" rel="noreferrer">
						{__('Create a New Modal', 'graphic-data-plugin')}
					</a>
				</Notice>
			)}

				<div
					ref={previewRef}
					className="graphic-data-modal-preview"
					style={{
						width: `${normalizedWidth}${modalWidthUnit}`,
						maxWidth:
							normalizedMaxWidth > 0 ? `${normalizedMaxWidth}px` : 'none',
						backgroundColor: modalBackgroundColor || 'transparent',
						border: modalBorderEnabled
							? `${normalizedBorderWidth}px solid ${modalBorderColor || '#000000'}`
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

