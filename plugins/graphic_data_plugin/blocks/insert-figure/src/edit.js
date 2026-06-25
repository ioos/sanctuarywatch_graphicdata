import { useState, useEffect, useRef } from '@wordpress/element';
import { useSelect, useDispatch } from '@wordpress/data';
import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';

import {
	PanelBody,
	SelectControl,
	TextControl,
	TextareaControl,
	Button,
	Placeholder,
	ToggleControl,
	Spinner,
	Notice,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';

// import './editor.scss';

function TinyMCEControl({
	id,
	label,
	value,
	onChange,
	height = 180,
}) {
	const editorIdRef = useRef(id);

	useEffect(() => {
		const editorId = editorIdRef.current;

		if (!window.wp?.editor?.initialize) {
			console.warn('wp.editor.initialize is not available. Falling back to textarea.');
			return;
		}

		if (window.tinymce?.get(editorId)) {
			window.wp.editor.remove(editorId);
		}

		window.wp.editor.initialize(editorId, {
			tinymce: {
				wpautop: true,
				menubar: false,
				height,
				toolbar1:
					'bold italic underline | bullist numlist | link unlink | undo redo',
				setup(editor) {
					editor.on('change keyup blur', () => {
						onChange(editor.getContent());
					});
				},
			},
			quicktags: true,
			mediaButtons: false,
		});

		return () => {
			if (window.wp?.editor?.remove) {
				window.wp.editor.remove(editorId);
			} else if (window.tinymce?.get(editorId)) {
				window.tinymce.get(editorId).remove();
			}
		};
	}, []);

	useEffect(() => {
		const editorId = editorIdRef.current;
		const editor = window.tinymce?.get(editorId);

		if (editor && value !== editor.getContent()) {
			editor.setContent(value || '');
		}
	}, [value]);

	return (
		<div
			className="graphic-data-tinymce-control"
			style={{
				width: '100%',
				marginTop: '16px',
				marginBottom: '16px',
			}}
		>
			<label
				htmlFor={editorIdRef.current}
				style={{
					display: 'block',
					fontWeight: '600',
					marginBottom: '6px',
				}}
			>
				{label}
			</label>

			<textarea
				id={editorIdRef.current}
				value={value || ''}
				onChange={(event) => onChange(event.target.value)}
				style={{
					width: '100%',
					minHeight: `${height}px`,
				}}
			/>
		</div>
	);
}

export default function Edit({ attributes, setAttributes }) {
	const { figureId, figureMode = 'existing' } = attributes;

	const blockProps = useBlockProps();

	const [meta, setMeta] = useState({});
	const [isSaving, setIsSaving] = useState(false);
	const [isCreating, setIsCreating] = useState(false);
	const [newFigureTitle, setNewFigureTitle] = useState('');

	const figures = useSelect((select) => {
		return select('core').getEntityRecords('postType', 'figure', {
			per_page: -1,
			status: 'publish',
			orderby: 'title',
			order: 'asc',
		});
	}, []);

	const figure = useSelect(
		(select) => {
			if (!figureId) return null;

			return select('core').getEntityRecord(
				'postType',
				'figure',
				figureId
			);
		},
		[figureId]
	);

	const { saveEntityRecord } = useDispatch('core');

	useEffect(() => {
		if (!figureId) return;

		apiFetch({
			path: `/graphic-data/v1/figure/${figureId}`,
			method: 'GET',
		})
			.then((response) => {
				console.log('Loaded custom figure meta:', response);
				setMeta(response || {});
			})
			.catch((e) => {
				console.error('Failed to load custom figure meta:', e);
			});
	}, [figureId]);

	function updateMeta(key, value) {
		setMeta((currentMeta) => ({
			...currentMeta,
			[key]: value,
		}));
	}

	async function saveFigureMeta() {
		if (!figureId) return;

		setIsSaving(true);

		try {
			const payload = {
				figure_published: meta.figure_published || 'draft',
				location: meta.location || '',
				figure_scene: meta.figure_scene || '',
				figure_modal: meta.figure_modal || '',
				figure_tab: meta.figure_tab || '',
				figure_order: Number(meta.figure_order || 1),

				figure_path: meta.figure_path || 'Internal',
				figure_title: meta.figure_title || '',
				figure_image: meta.figure_image || '',
				figure_external_url: meta.figure_external_url || '',
				figure_external_alt: meta.figure_external_alt || '',
				figure_code: meta.figure_code || '',
				figure_upload_file: meta.figure_upload_file || '',
				figure_interactive_arguments:
					meta.figure_interactive_arguments || '',
				figure_caption_short: meta.figure_caption_short || '',
				figure_caption_long: meta.figure_caption_long || '',

				figure_science_link_text:
					meta.figure_science_link_text || '',
				figure_science_link_url:
					meta.figure_science_link_url || '',
				figure_data_link_text:
					meta.figure_data_link_text || '',
				figure_data_link_url:
					meta.figure_data_link_url || '',
			};

			const response = await apiFetch({
				path: `/graphic-data/v1/figure/${figureId}`,
				method: 'POST',
				data: payload,
			});

			console.log('Saved custom figure meta:', response);
			setMeta(response || payload);
		} catch (e) {
			console.error('Figure meta save failed:', e);
		}

		setIsSaving(false);
	}

	async function createNewFigure() {
		const title = newFigureTitle.trim() || 'New Graphic Data Figure';

		setIsCreating(true);

		try {
			const newFigure = await saveEntityRecord('postType', 'figure', {
				title,
				status: 'publish',
				meta: {
					figure_published: 'draft',
					figure_modal: '',
					figure_tab: '',
					figure_order: 1,

					figure_path: 'Internal',
					figure_title: title,

					figure_science_info: ['', ''],
					figure_data_info: ['', ''],

					figure_image: '',
					figure_external_url: '',
					figure_external_alt: '',
					figure_code: '',
					figure_upload_file: '',
					figure_interactive_arguments: '',
					figure_caption_short: '',
					figure_caption_long: '',
				},
			});

			if (newFigure?.id) {
				setAttributes({
					figureId: Number(newFigure.id),
					figureMode: 'existing',
				});

				setNewFigureTitle('');
			}
		} catch (e) {
			console.error('Figure creation failed:', e);
		}

		setIsCreating(false);
	}

	const figureOptions = [
		{
			label: __('Select a figure', 'graphic-data-plugin'),
			value: 0,
		},
		...(Array.isArray(figures)
			? figures.map((fig) => ({
					label: fig.title?.rendered
						? fig.title.rendered.replace(/(<([^>]+)>)/gi, '')
						: `Figure ${fig.id}`,
					value: fig.id,
				}))
			: []),
	];

	const figureModeOptions = [
		{
			label: 'Select Existing Figure',
			value: 'existing',
		},
		{
			label: 'Create New Figure',
			value: 'new',
		},
	];

	return (
		<div {...blockProps}>
			<InspectorControls>
				<PanelBody
					title={__('Figure Settings', 'graphic-data-plugin')}
					initialOpen={true}
				>
					<SelectControl
						label="Figure Mode"
						value={figureMode}
						options={figureModeOptions}
						onChange={(value) => {
							setAttributes({
								figureMode: value,
								figureId: value === 'new' ? 0 : figureId,
							});
						}}
					/>

					{figureMode === 'existing' && (
						<SelectControl
							label={__('Figure', 'graphic-data-plugin')}
							value={figureId}
							options={figureOptions}
							onChange={(value) =>
								setAttributes({
									figureId: Number(value),
								})
							}
						/>
					)}
				</PanelBody>
			</InspectorControls>

			<Placeholder
				label={__('Graphic Data Figure', 'graphic-data-plugin')}
				instructions={__(
					'Create a new figure or select an existing one.',
					'graphic-data-plugin'
				)}
			>
				<SelectControl
					label="What would you like to do?"
					value={figureMode}
					options={figureModeOptions}
					onChange={(value) => {
						setAttributes({
							figureMode: value,
							figureId: value === 'new' ? 0 : figureId,
						});
					}}
				/>

				{figureMode === 'new' && (
					<div className="graphic-data-create-figure">
						<TextControl
							label="New Figure Title"
							value={newFigureTitle}
							onChange={setNewFigureTitle}
							placeholder="New Graphic Data Figure"
						/>

						<Button
							variant="primary"
							onClick={createNewFigure}
							disabled={isCreating}
						>
							{isCreating ? 'Creating...' : 'Create Figure'}
						</Button>
					</div>
				)}

				{figureMode === 'existing' && (
					<>
						{!figures && <Spinner />}

						{figures && figures.length === 0 && (
							<Notice status="warning" isDismissible={false}>
								No figures found.
							</Notice>
						)}

						{figures && (
							<SelectControl
								label="Figure"
								value={figureId}
								options={figureOptions}
								onChange={(value) =>
									setAttributes({
										figureId: Number(value),
									})
								}
							/>
						)}
					</>
				)}

				{figureId && !figure && <Spinner />}

				{figureId && figure && (
					<div className="graphic-data-figure-editor">
						<hr />

						<h3>
							Editing Figure:{' '}
							{figure.title.rendered.replace(/(<([^>]+)>)/gi, '')}
						</h3>

						<ToggleControl
							label="Published"
							checked={meta.figure_published === 'published'}
							onChange={(value) =>
								updateMeta(
									'figure_published',
									value ? 'published' : 'draft'
								)
							}
						/>

						<SelectControl
							label="Figure Type"
							value={meta.figure_path || 'Internal'}
							options={[
								{ label: 'Internal Image', value: 'Internal' },
								{ label: 'External Image', value: 'External' },
								{ label: 'Interactive', value: 'Interactive' },
								{ label: 'Code', value: 'Code' },
							]}
							onChange={(value) => updateMeta('figure_path', value)}
						/>

						<TextControl
							label="Figure Title"
							value={meta.figure_title || ''}
							onChange={(value) => updateMeta('figure_title', value)}
						/>

						<TextControl
							label="Monitoring Program Text"
							value={meta.figure_science_link_text || ''}
							onChange={(value) =>
								updateMeta('figure_science_link_text', value)
							}
						/>

						<TextControl
							label="Monitoring Program URL"
							value={meta.figure_science_link_url || ''}
							onChange={(value) =>
								updateMeta('figure_science_link_url', value)
							}
						/>

						<TextControl
							label="Data Link Text"
							value={meta.figure_data_link_text || ''}
							onChange={(value) =>
								updateMeta('figure_data_link_text', value)
							}
						/>

						<TextControl
							label="Data Link URL"
							value={meta.figure_data_link_url || ''}
							onChange={(value) =>
								updateMeta('figure_data_link_url', value)
							}
						/>

						{meta.figure_path === 'Internal' && (
							<TextControl
								label="Internal Image URL"
								value={meta.figure_image || ''}
								onChange={(value) =>
									updateMeta('figure_image', value)
								}
							/>
						)}

						{meta.figure_path === 'External' && (
							<>
								<TextControl
									label="External Image URL"
									value={meta.figure_external_url || ''}
									onChange={(value) =>
										updateMeta('figure_external_url', value)
									}
								/>

								<TextControl
									label="External Alt Text"
									value={meta.figure_external_alt || ''}
									onChange={(value) =>
										updateMeta('figure_external_alt', value)
									}
								/>
							</>
						)}

						{meta.figure_path === 'Code' && (
							<TextareaControl
								label="Custom Code"
								value={meta.figure_code || ''}
								onChange={(value) =>
									updateMeta('figure_code', value)
								}
								rows={10}
							/>
						)}

						{meta.figure_path === 'Interactive' && (
							<>
								<TextControl
									label="Interactive File"
									value={meta.figure_upload_file || ''}
									onChange={(value) =>
										updateMeta('figure_upload_file', value)
									}
								/>

								<TextareaControl
									label="Interactive Arguments"
									value={meta.figure_interactive_arguments || ''}
									onChange={(value) =>
										updateMeta(
											'figure_interactive_arguments',
											value
										)
									}
									rows={8}
								/>
							</>
						)}

						<TinyMCEControl
							id={`figure-caption-short-${figureId}`}
							label="Short Caption"
							value={meta.figure_caption_short || ''}
							onChange={(value) =>
								updateMeta('figure_caption_short', value)
							}
							height={160}
						/>

						<TinyMCEControl
							id={`figure-caption-long-${figureId}`}
							label="Extended Caption"
							value={meta.figure_caption_long || ''}
							onChange={(value) =>
								updateMeta('figure_caption_long', value)
							}
							height={240}
						/>

						<div style={{ marginTop: '20px' }}>
							<Button
								variant="primary"
								onClick={saveFigureMeta}
								disabled={isSaving}
							>
								{isSaving
									? 'Saving...'
									: 'Save Figure Fields'}
							</Button>
						</div>
					</div>
				)}
			</Placeholder>
		</div>
	);
}

//____________________________________________________________________________

// import { useState, useEffect } from '@wordpress/element';
// import { useSelect, useDispatch } from '@wordpress/data';
// import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
// import apiFetch from '@wordpress/api-fetch';
// import { RichText } from '@wordpress/block-editor';

// import {
// 	PanelBody,
// 	SelectControl,
// 	TextControl,
// 	TextareaControl,
// 	Button,
// 	Placeholder,
// 	ToggleControl,
// 	Spinner,
// 	Notice,
// } from '@wordpress/components';

// import { __ } from '@wordpress/i18n';

// // import './editor.scss';

// export default function Edit({ attributes, setAttributes }) {
// 	const { figureId, figureMode = 'existing' } = attributes;

// 	const blockProps = useBlockProps();

// 	const [meta, setMeta] = useState({});
// 	const [isSaving, setIsSaving] = useState(false);
// 	const [isCreating, setIsCreating] = useState(false);
// 	const [newFigureTitle, setNewFigureTitle] = useState('');

// 	const figures = useSelect((select) => {
// 		return select('core').getEntityRecords('postType', 'figure', {
// 			per_page: -1,
// 			status: 'publish',
// 			orderby: 'title',
// 			order: 'asc',
// 		});
// 	}, []);

// 	const figure = useSelect(
// 		(select) => {
// 			if (!figureId) return null;

// 			return select('core').getEntityRecord(
// 				'postType',
// 				'figure',
// 				figureId
// 			);
// 		},
// 		[figureId]
// 	);

// 	const { saveEntityRecord } = useDispatch('core');

// 	useEffect(() => {
// 		if (!figureId) return;
	
// 		apiFetch({
// 			path: `/graphic-data/v1/figure/${figureId}`,
// 			method: 'GET',
// 		})
// 			.then((response) => {
// 				console.log('Loaded custom figure meta:', response);
// 				setMeta(response || {});
// 			})
// 			.catch((e) => {
// 				console.error('Failed to load custom figure meta:', e);
// 			});
// 	}, [figureId]);

// 	function updateMeta(key, value) {
// 		setMeta((currentMeta) => ({
// 			...currentMeta,
// 			[key]: value,
// 		}));
// 	}

// 	async function saveFigureMeta() {
// 		if (!figureId) return;
	
// 		setIsSaving(true);
	
// 		try {
// 			const payload = {
// 				figure_published: meta.figure_published || 'draft',
// 				location: meta.location || '',
// 				figure_scene: meta.figure_scene || '',
// 				figure_modal: meta.figure_modal || '',
// 				figure_tab: meta.figure_tab || '',
// 				figure_order: Number(meta.figure_order || 1),
	
// 				figure_path: meta.figure_path || 'Internal',
// 				figure_title: meta.figure_title || '',
// 				figure_image: meta.figure_image || '',
// 				figure_external_url: meta.figure_external_url || '',
// 				figure_external_alt: meta.figure_external_alt || '',
// 				figure_code: meta.figure_code || '',
// 				figure_upload_file: meta.figure_upload_file || '',
// 				figure_interactive_arguments:
// 					meta.figure_interactive_arguments || '',
// 				figure_caption_short: meta.figure_caption_short || '',
// 				figure_caption_long: meta.figure_caption_long || '',
	
// 				// These are flattened in React but saved as Exopite-compatible arrays in PHP.
// 				figure_science_link_text:
// 					meta.figure_science_link_text || '',
// 				figure_science_link_url:
// 					meta.figure_science_link_url || '',
// 				figure_data_link_text:
// 					meta.figure_data_link_text || '',
// 				figure_data_link_url:
// 					meta.figure_data_link_url || '',
// 			};
	
// 			const response = await apiFetch({
// 				path: `/graphic-data/v1/figure/${figureId}`,
// 				method: 'POST',
// 				data: payload,
// 			});
	
// 			console.log('Saved custom figure meta:', response);
// 			setMeta(response || payload);
// 		} catch (e) {
// 			console.error('Figure meta save failed:', e);
// 		}
	
// 		setIsSaving(false);
// 	}

// 	async function createNewFigure() {
// 		const title = newFigureTitle.trim() || 'New Graphic Data Figure';

// 		setIsCreating(true);

// 		try {
// 			const newFigure = await saveEntityRecord('postType', 'figure', {
// 				title,
// 				status: 'publish',
// 				meta: {
// 					figure_published: 'draft',
// 					figure_modal: '',
// 					figure_tab: '',
// 					figure_order: 1,

// 					figure_path: 'Internal',
// 					figure_title: title,

// 					// Registered as array meta in PHP.
// 					figure_science_info: ['', ''],
// 					figure_data_info: ['', ''],

// 					figure_image: '',
// 					figure_external_url: '',
// 					figure_external_alt: '',
// 					figure_code: '',
// 					figure_upload_file: '',
// 					figure_interactive_arguments: '',
// 					figure_caption_short: '',
// 					figure_caption_long: '',
// 				},
// 			});

// 			if (newFigure?.id) {
// 				setAttributes({
// 					figureId: Number(newFigure.id),
// 					figureMode: 'existing',
// 				});

// 				setNewFigureTitle('');
// 			}
// 		} catch (e) {
// 			console.error('Figure creation failed:', e);
// 		}

// 		setIsCreating(false);
// 	}

// 	const figureOptions = [
// 		{
// 			label: __('Select a figure', 'graphic-data-plugin'),
// 			value: 0,
// 		},
// 		...(Array.isArray(figures)
// 			? figures.map((fig) => ({
// 					label: fig.title?.rendered
// 						? fig.title.rendered.replace(/(<([^>]+)>)/gi, '')
// 						: `Figure ${fig.id}`,
// 					value: fig.id,
// 				}))
// 			: []),
// 	];

// 	const figureModeOptions = [
// 		{
// 			label: 'Select Existing Figure',
// 			value: 'existing',
// 		},
// 		{
// 			label: 'Create New Figure',
// 			value: 'new',
// 		},
// 	];

// 	return (
// 		<div {...blockProps}>
// 			<InspectorControls>
// 				<PanelBody
// 					title={__('Figure Settings', 'graphic-data-plugin')}
// 					initialOpen={true}
// 				>
// 					<SelectControl
// 						label="Figure Mode"
// 						value={figureMode}
// 						options={figureModeOptions}
// 						onChange={(value) => {
// 							setAttributes({
// 								figureMode: value,
// 								figureId: value === 'new' ? 0 : figureId,
// 							});
// 						}}
// 					/>

// 					{figureMode === 'existing' && (
// 						<SelectControl
// 							label={__('Figure', 'graphic-data-plugin')}
// 							value={figureId}
// 							options={figureOptions}
// 							onChange={(value) =>
// 								setAttributes({
// 									figureId: Number(value),
// 								})
// 							}
// 						/>
// 					)}
// 				</PanelBody>
// 			</InspectorControls>

// 			<Placeholder
// 				label={__('Graphic Data Figure', 'graphic-data-plugin')}
// 				instructions={__(
// 					'Create a new figure or select an existing one.',
// 					'graphic-data-plugin'
// 				)}
// 			>
// 				<SelectControl
// 					label="What would you like to do?"
// 					value={figureMode}
// 					options={figureModeOptions}
// 					onChange={(value) => {
// 						setAttributes({
// 							figureMode: value,
// 							figureId: value === 'new' ? 0 : figureId,
// 						});
// 					}}
// 				/>

// 				{figureMode === 'new' && (
// 					<div className="graphic-data-create-figure">
// 						<TextControl
// 							label="New Figure Title"
// 							value={newFigureTitle}
// 							onChange={setNewFigureTitle}
// 							placeholder="New Graphic Data Figure"
// 						/>

// 						<Button
// 							variant="primary"
// 							onClick={createNewFigure}
// 							disabled={isCreating}
// 						>
// 							{isCreating ? 'Creating...' : 'Create Figure'}
// 						</Button>
// 					</div>
// 				)}

// 				{figureMode === 'existing' && (
// 					<>
// 						{!figures && <Spinner />}

// 						{figures && figures.length === 0 && (
// 							<Notice status="warning" isDismissible={false}>
// 								No figures found.
// 							</Notice>
// 						)}

// 						{figures && (
// 							<SelectControl
// 								label="Figure"
// 								value={figureId}
// 								options={figureOptions}
// 								onChange={(value) =>
// 									setAttributes({
// 										figureId: Number(value),
// 									})
// 								}
// 							/>
// 						)}
// 					</>
// 				)}

// 				{figureId && !figure && <Spinner />}

// 				{figureId && figure && (
// 					<div className="graphic-data-figure-editor">
// 						<hr />

// 						<h3>
// 							Editing Figure:{' '}
// 							{figure.title.rendered.replace(/(<([^>]+)>)/gi, '')}
// 						</h3>

// 						<ToggleControl
// 							label="Published"
// 							checked={meta.figure_published === 'published'}
// 							onChange={(value) =>
// 								updateMeta(
// 									'figure_published',
// 									value ? 'published' : 'draft'
// 								)
// 							}
// 						/>

// 						<SelectControl
// 							label="Figure Type"
// 							value={meta.figure_path || 'Internal'}
// 							options={[
// 								{ label: 'Internal Image', value: 'Internal' },
// 								{ label: 'External Image', value: 'External' },
// 								{ label: 'Interactive', value: 'Interactive' },
// 								{ label: 'Code', value: 'Code' },
// 							]}
// 							onChange={(value) => updateMeta('figure_path', value)}
// 						/>

// 						<TextControl
// 							label="Figure Title"
// 							value={meta.figure_title || ''}
// 							onChange={(value) => updateMeta('figure_title', value)}
// 						/>

// 						<TextControl
// 							label="Monitoring Program Text"
// 							value={meta.figure_science_link_text || ''}
// 							onChange={(value) =>
// 								updateMeta('figure_science_link_text', value)
// 							}
// 						/>

// 						<TextControl
// 							label="Monitoring Program URL"
// 							value={meta.figure_science_link_url || ''}
// 							onChange={(value) =>
// 								updateMeta('figure_science_link_url', value)
// 							}
// 						/>

// 						<TextControl
// 							label="Data Link Text"
// 							value={meta.figure_data_link_text || ''}
// 							onChange={(value) =>
// 								updateMeta('figure_data_link_text', value)
// 							}
// 						/>

// 						<TextControl
// 							label="Data Link URL"
// 							value={meta.figure_data_link_url || ''}
// 							onChange={(value) =>
// 								updateMeta('figure_data_link_url', value)
// 							}
// 						/>

// 						{meta.figure_path === 'Internal' && (
// 							<TextControl
// 								label="Internal Image URL"
// 								value={meta.figure_image || ''}
// 								onChange={(value) =>
// 									updateMeta('figure_image', value)
// 								}
// 							/>
// 						)}

// 						{meta.figure_path === 'External' && (
// 							<>
// 								<TextControl
// 									label="External Image URL"
// 									value={meta.figure_external_url || ''}
// 									onChange={(value) =>
// 										updateMeta('figure_external_url', value)
// 									}
// 								/>

// 								<TextControl
// 									label="External Alt Text"
// 									value={meta.figure_external_alt || ''}
// 									onChange={(value) =>
// 										updateMeta('figure_external_alt', value)
// 									}
// 								/>
// 							</>
// 						)}

// 						{meta.figure_path === 'Code' && (
// 							<TextareaControl
// 								label="Custom Code"
// 								value={meta.figure_code || ''}
// 								onChange={(value) =>
// 									updateMeta('figure_code', value)
// 								}
// 								rows={10}
// 							/>
// 						)}

// 						{meta.figure_path === 'Interactive' && (
// 							<>
// 								<TextControl
// 									label="Interactive File"
// 									value={meta.figure_upload_file || ''}
// 									onChange={(value) =>
// 										updateMeta('figure_upload_file', value)
// 									}
// 								/>

// 								<TextareaControl
// 									label="Interactive Arguments"
// 									value={meta.figure_interactive_arguments || ''}
// 									onChange={(value) =>
// 										updateMeta(
// 											'figure_interactive_arguments',
// 											value
// 										)
// 									}
// 									rows={8}
// 								/>
// 							</>
// 						)}

// 						<TextareaControl
// 							label="Short Caption"
// 							value={meta.figure_caption_short || ''}
// 							onChange={(value) =>
// 								updateMeta('figure_caption_short', value)
// 							}
// 							rows={4}
// 						/>

// 						<TextareaControl
// 							label="Extended Caption"
// 							value={meta.figure_caption_long || ''}
// 							onChange={(value) =>
// 								updateMeta('figure_caption_long', value)
// 							}
// 							rows={8}
// 						/>

// 						<div style={{ marginTop: '20px' }}>
// 							<Button
// 								variant="primary"
// 								onClick={saveFigureMeta}
// 								disabled={isSaving}
// 							>
// 								{isSaving
// 									? 'Saving...'
// 									: 'Save Figure Fields'}
// 							</Button>
// 						</div>
// 					</div>
// 				)}
// 			</Placeholder>
// 		</div>
// 	);
// }


//_________________________________________________1

//WORKS FOR UPDATING THIS SPECIFIC POST
// export default function Edit({ attributes, setAttributes }) {
// 	const blockProps = useBlockProps();

// 	const [meta, setMeta] = useState({});
// 	const [isSaving, setIsSaving] = useState(false);

// 	const { postId, postType, currentMeta } = useSelect((select) => {
// 		const editor = select('core/editor');

// 		const currentPostType = editor.getCurrentPostType();
// 		const currentPostId = editor.getCurrentPostId();
// 		const editedMeta = editor.getEditedPostAttribute('meta') || {};

// 		return {
// 			postId: currentPostId,
// 			postType: currentPostType,
// 			currentMeta: editedMeta,
// 		};
// 	}, []);

// 	const { editPost, savePost } = useDispatch('core/editor');

// 	useEffect(() => {
// 		setMeta(currentMeta || {});
// 	}, [currentMeta]);

// 	function updateMeta(key, value) {
// 		const updatedMeta = {
// 			...meta,
// 			[key]: value,
// 		};

// 		setMeta(updatedMeta);

// 		editPost({
// 			meta: updatedMeta,
// 		});
// 	}

// 	async function saveFigureMeta() {
// 		setIsSaving(true);

// 		try {
// 			await savePost();
// 		} catch (e) {
// 			console.error('Current post meta save failed:', e);
// 		}

// 		setIsSaving(false);
// 	}

// 	return (
// 		<div {...blockProps}>
// 			<InspectorControls>
// 				<PanelBody
// 					title={__('Figure Settings', 'graphic-data-plugin')}
// 					initialOpen={true}
// 				>
// 					<p>
// 						<strong>Post ID:</strong> {postId || 'Not saved yet'}
// 					</p>

// 					<p>
// 						<strong>Post Type:</strong> {postType || 'Unknown'}
// 					</p>
// 				</PanelBody>
// 			</InspectorControls>

// 			<Placeholder
// 				label={__('Graphic Data Figure', 'graphic-data-plugin')}
// 				instructions={__(
// 					'Configure figure data for the current post.',
// 					'graphic-data-plugin'
// 				)}
// 			>
// 				<div className="graphic-data-figure-editor">
// 					<h3>Editing Figure Fields On Current Post</h3>

// 					<p>
// 						<strong>Current Post ID:</strong> {postId || 'Not saved yet'}
// 					</p>

// 					<ToggleControl
// 						label="Published"
// 						checked={meta.figure_published === 'true'}
// 						onChange={(value) =>
// 							updateMeta(
// 								'figure_published',
// 								value ? 'true' : 'false'
// 							)
// 						}
// 					/>

// 					<SelectControl
// 						label="Figure Type"
// 						value={meta.figure_path || 'Internal'}
// 						options={[
// 							{ label: 'Internal Image', value: 'Internal' },
// 							{ label: 'External Image', value: 'External' },
// 							{ label: 'Interactive', value: 'Interactive' },
// 							{ label: 'Code', value: 'Code' },
// 						]}
// 						onChange={(value) =>
// 							updateMeta('figure_path', value)
// 						}
// 					/>

// 					<TextControl
// 						label="Figure Title"
// 						value={meta.figure_title || ''}
// 						onChange={(value) =>
// 							updateMeta('figure_title', value)
// 						}
// 					/>

// 					<TextControl
// 						label="Monitoring Program Text"
// 						value={meta.figure_science_link_text || ''}
// 						onChange={(value) =>
// 							updateMeta('figure_science_link_text', value)
// 						}
// 					/>

// 					<TextControl
// 						label="Monitoring Program URL"
// 						value={meta.figure_science_link_url || ''}
// 						onChange={(value) =>
// 							updateMeta('figure_science_link_url', value)
// 						}
// 					/>

// 					<TextControl
// 						label="Data Link Text"
// 						value={meta.figure_data_link_text || ''}
// 						onChange={(value) =>
// 							updateMeta('figure_data_link_text', value)
// 						}
// 					/>

// 					<TextControl
// 						label="Data Link URL"
// 						value={meta.figure_data_link_url || ''}
// 						onChange={(value) =>
// 							updateMeta('figure_data_link_url', value)
// 						}
// 					/>

// 					{meta.figure_path === 'External' && (
// 						<>
// 							<TextControl
// 								label="External Image URL"
// 								value={meta.figure_external_url || ''}
// 								onChange={(value) =>
// 									updateMeta('figure_external_url', value)
// 								}
// 							/>

// 							<TextControl
// 								label="External Alt Text"
// 								value={meta.figure_external_alt || ''}
// 								onChange={(value) =>
// 									updateMeta('figure_external_alt', value)
// 								}
// 							/>
// 						</>
// 					)}

// 					{meta.figure_path === 'Code' && (
// 						<TextareaControl
// 							label="Custom Code"
// 							value={meta.figure_code || ''}
// 							onChange={(value) =>
// 								updateMeta('figure_code', value)
// 							}
// 							rows={10}
// 						/>
// 					)}

// 					{meta.figure_path === 'Interactive' && (
// 						<>
// 							<TextControl
// 								label="Interactive File"
// 								value={meta.figure_upload_file || ''}
// 								onChange={(value) =>
// 									updateMeta('figure_upload_file', value)
// 								}
// 							/>

// 							<TextareaControl
// 								label="Interactive Arguments"
// 								value={meta.figure_interactive_arguments || ''}
// 								onChange={(value) =>
// 									updateMeta(
// 										'figure_interactive_arguments',
// 										value
// 									)
// 								}
// 								rows={8}
// 							/>
// 						</>
// 					)}

// 					<TextareaControl
// 						label="Short Caption"
// 						value={meta.figure_caption_short || ''}
// 						onChange={(value) =>
// 							updateMeta('figure_caption_short', value)
// 						}
// 						rows={4}
// 					/>

// 					<TextareaControl
// 						label="Extended Caption"
// 						value={meta.figure_caption_long || ''}
// 						onChange={(value) =>
// 							updateMeta('figure_caption_long', value)
// 						}
// 						rows={8}
// 					/>

// 					<div style={{ marginTop: '20px' }}>
// 						<Button
// 							variant="primary"
// 							onClick={saveFigureMeta}
// 							disabled={isSaving}
// 						>
// 							{isSaving ? 'Saving...' : 'Save Current Post Fields'}
// 						</Button>
// 					</div>
// 				</div>
// 			</Placeholder>
// 		</div>
// 	);
// }


