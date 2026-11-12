import { useSelect } from '@wordpress/data';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import ServerSideRender from '@wordpress/server-side-render';
import { decodeEntities } from '@wordpress/html-entities';

import {
	SelectControl,
	Spinner,
	Notice,
	PanelBody,
	TextControl,
	Button,
	Disabled,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';

const STATUS_LABELS = {
	Published: __('Published', 'graphic-data-plugin'),
	Soon: __('Coming soon', 'graphic-data-plugin'),
	Draft: __('Draft', 'graphic-data-plugin'),
};

export default function Edit({ attributes, setAttributes, name }) {
	const {
		instancePostId = 0,
		instanceWidth = 100,
		instanceWidthUnit = '%',
		instanceMaxWidth = 360,
		instanceAlignment = 'center',
	} = attributes;

	const normalizedWidth = Math.max(Number(instanceWidth) || 0, 0);
	const normalizedMaxWidth = Math.max(Number(instanceMaxWidth) || 0, 0);

	const blockProps = useBlockProps({ className: 'graphic-data-insert-instance-block' });
	const instances = useSelect((select) => select('core').getEntityRecords('postType', 'instance', {
		per_page: -1, status: 'publish', orderby: 'title', order: 'asc',
	}), []);
	const instancesAreLoading = instances == null;
	const instanceOptions = [
		{ label: __('Select an Instance...', 'graphic-data-plugin'), value: 0 },
		...(Array.isArray(instances) ? instances.map((instance) => {
			const title = decodeEntities(instance.title?.rendered || '') || __('Untitled instance', 'graphic-data-plugin');
			const status = STATUS_LABELS[instance.instance_status] || STATUS_LABELS.Draft;
			return { label: `(id:${instance.id}) - ${title} [${status}]`, value: instance.id };
		}) : []),
	];
	const selectedInstance = Array.isArray(instances)
		? instances.find((instance) => instance.id === Number(instancePostId))
		: null;
	const selectedStatus = selectedInstance?.instance_status || 'Draft';

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody
					title={__('Tile dimensions', 'graphic-data-plugin')}
					initialOpen={true}
				>
					<TextControl
						label={__('Width', 'graphic-data-plugin')}
						type="number"
						min="0"
						value={normalizedWidth}
						onChange={(value) =>
							setAttributes({ instanceWidth: Math.max(Number(value) || 0, 0) })
						}
					/>

					<SelectControl
						label={__('Width unit', 'graphic-data-plugin')}
						value={instanceWidthUnit}
						options={[
							{ label: '%', value: '%' },
							{ label: 'px', value: 'px' },
							{ label: 'rem', value: 'rem' },
							{ label: 'vw', value: 'vw' },
						]}
						onChange={(value) => setAttributes({ instanceWidthUnit: value })}
					/>

					<TextControl
						label={__('Maximum width (px)', 'graphic-data-plugin')}
						help={__('Use 0 for no maximum.', 'graphic-data-plugin')}
						type="number"
						min="0"
						value={normalizedMaxWidth}
						onChange={(value) =>
							setAttributes({ instanceMaxWidth: Math.max(Number(value) || 0, 0) })
						}
					/>

					<SelectControl
						label={__('Horizontal alignment', 'graphic-data-plugin')}
						value={instanceAlignment}
						options={[
							{ label: __('Left', 'graphic-data-plugin'), value: 'left' },
							{ label: __('Center', 'graphic-data-plugin'), value: 'center' },
							{ label: __('Right', 'graphic-data-plugin'), value: 'right' },
						]}
						onChange={(value) => setAttributes({ instanceAlignment: value })}
					/>

					<Button
						variant="secondary"
						onClick={() =>
							setAttributes({
								instanceWidth: 100,
								instanceWidthUnit: '%',
								instanceMaxWidth: 360,
								instanceAlignment: 'center',
							})
						}
					>
						{__('Reset dimensions', 'graphic-data-plugin')}
					</Button>
				</PanelBody>
			</InspectorControls>
			<SelectControl
				label={__('Graphic Data - Instance', 'graphic-data-plugin')}
				value={Number(instancePostId)}
				options={instanceOptions}
				onChange={(value) => setAttributes({ instancePostId: Number(value) })}
			/>
			{instancesAreLoading && <Spinner />}
			{Array.isArray(instances) && instances.length === 0 && (
				<Notice status="warning" isDismissible={false}>
					{__('No instances found.', 'graphic-data-plugin')}
				</Notice>
			)}
			{!instancePostId && !instancesAreLoading && (
				<Notice status="info" isDismissible={false}>
					{__('Select an instance to display its tile.', 'graphic-data-plugin')}{' '}
					<a href="/wp-admin/post-new.php?post_type=instance" target="_blank" rel="noreferrer">
						{__('Create a New Instance', 'graphic-data-plugin')}
					</a>
				</Notice>
			)}
			{selectedInstance && selectedStatus === 'Draft' && (
				<Notice status="warning" isDismissible={false}>
					{__('This instance is a draft, so its tile is hidden on the published page. Set the instance status to "Coming soon" or "Published" to show it.', 'graphic-data-plugin')}
				</Notice>
			)}
			{!!instancePostId && selectedStatus !== 'Draft' && (
				<Disabled>
					<ServerSideRender
						block={name}
						attributes={attributes}
						skipBlockSupportAttributes
					/>
				</Disabled>
			)}
		</div>
	);
}
