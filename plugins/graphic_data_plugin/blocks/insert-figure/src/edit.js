import { useState, useEffect, useRef } from '@wordpress/element';
import { useSelect } from '@wordpress/data';
import { useBlockProps } from '@wordpress/block-editor';
import apiFetch from '@wordpress/api-fetch';
import { producePlotlyLineFigure } from '@graphic-data/plotly-timeseries-line';
import { producePlotlyBarFigure } from '@graphic-data/plotly-bar';

import {
	SelectControl,
	Spinner,
	Notice,
} from '@wordpress/components';

import { __ } from '@wordpress/i18n';

/**
 * Small helper to remove HTML from WP-rendered post titles.
 *
 * WordPress REST titles often come back as:
 * {
 *   rendered: "My <em>Title</em>"
 * }
 *
 * The dropdown needs plain text.
 */
function stripHTML(value = '') {
	return String(value).replace(/(<([^>]+)>)/gi, '');
}

/**
 * The Plotly function expects interactive_arguments.
 *
 * In your current setup, figure_interactive_arguments is probably a JSON string
 * saved in post meta. This helper allows it to work whether REST returns a
 * string or an object.
 */
function normalizeInteractiveArguments(value) {
	if (!value) {
		return '';
	}

	if (typeof value === 'string') {
		return value;
	}

	return JSON.stringify(value);
}


function ensurePlotlyEditorLayerStyles(rootDocument) {
	if (!rootDocument) return;

	const styleId = 'graphic-data-plotly-editor-layer-fix';

	if (rootDocument.getElementById(styleId)) {
		return;
	}

	const style = rootDocument.createElement('style');
	style.id = styleId;
	style.textContent = `
		.graphic-data-block-plotly-target,
		.graphic-data-block-plotly-target .js-plotly-plot,
		.graphic-data-block-plotly-target .plot-container,
		.graphic-data-block-plotly-target .plot-container.plotly,
		.graphic-data-block-plotly-target .svg-container {
			position: relative !important;
		}

		.graphic-data-block-plotly-target .svg-container {
			overflow: hidden !important;
		}

		.graphic-data-block-plotly-target .svg-container > .main-svg {
			position: absolute !important;
			top: 0 !important;
			left: 0 !important;
		}

		.graphic-data-block-plotly-target .svg-container > .main-svg {
			width: 100% !important;
		}

		.graphic-data-block-plotly-target .modebar-container {
			position: absolute !important;
			top: 0 !important;
			right: 0 !important;
			left: auto !important;
			width: 100% !important;
			height: 100% !important;
			z-index: 1001 !important;
			pointer-events: none !important;
		}

		.graphic-data-block-plotly-target .modebar {
			position: absolute !important;
			top: 2px !important;
			right: 2px !important;
			left: auto !important;

			display: flex !important;
			flex-direction: row !important;
			flex-wrap: nowrap !important;
			align-items: center !important;
			justify-content: flex-end !important;

			width: auto !important;
			height: auto !important;
			white-space: nowrap !important;
			pointer-events: all !important;
		}

		.graphic-data-block-plotly-target .modebar-group {
			position: relative !important;

			display: flex !important;
			flex-direction: row !important;
			flex-wrap: nowrap !important;
			align-items: center !important;

			float: none !important;
			clear: none !important;

			width: auto !important;
			height: 22px !important;
			min-width: 0 !important;
			min-height: 0 !important;

			margin: 0 0 0 8px !important;
			padding: 0 !important;

			white-space: nowrap !important;
			vertical-align: middle !important;
			box-sizing: border-box !important;
		}

		.graphic-data-block-plotly-target .modebar-group:first-child {
			margin-left: 0 !important;
		}

		.graphic-data-block-plotly-target .modebar-btn {
			position: relative !important;

			display: inline-flex !important;
			flex: 0 0 auto !important;
			align-items: center !important;
			justify-content: center !important;

			float: none !important;
			clear: none !important;

			width: 22px !important;
			height: 22px !important;
			min-width: 22px !important;
			min-height: 22px !important;

			margin: 0 !important;
			padding: 3px 4px !important;

			line-height: 1 !important;
			box-sizing: border-box !important;
			vertical-align: middle !important;
			text-decoration: none !important;
			pointer-events: all !important;
		}

		.graphic-data-block-plotly-target .modebar-btn svg {
			position: static !important;
			display: block !important;
			width: 1em !important;
			height: 1em !important;
			margin: 0 !important;
			padding: 0 !important;
			flex: 0 0 auto !important;
		}

		.graphic-data-block-plotly-target .modebar-btn svg path {
			pointer-events: none !important;
		}
	`;

	rootDocument.head.appendChild(style);
}

/**
 * Edit component
 *
 * This controls what appears inside the Gutenberg editor.
 *
 * Flow:
 * 1. Load available Figure CPT posts for the dropdown.
 * 2. When the user selects a figure, save its ID into block attributes.
 * 3. Fetch that figure's custom REST metadata.
 * 4. Create a real DOM target div inside the block.
 * 5. Pass that target div ID, interactive arguments, and figure ID into
 *    producePlotlyLineFigure().
 */
export default function Edit({ attributes, setAttributes, clientId }) {
	/**
	 * figureId is the only block attribute this editor really needs now.
	 *
	 * The saved page should use this same figureId later to render the frontend
	 * Plotly figure.
	 */
	const { figureId = 0, instanceId = '' } = attributes;

	/**
	 * useBlockProps adds the standard WordPress block classes and editor props.
	 */
	const blockProps = useBlockProps({
		className: 'graphic-data-insert-figure-block',
		// style: {
		// 	width: '100%',
		// 	maxWidth: 'none',
		// },
	});

	/**
	 * previewRef points to the empty div where we inject the Plotly target div.
	 *
	 * React renders the outer container.
	 * producePlotlyLineFigure renders into the inner target div.
	 */
	const previewRef = useRef(null);

	/**
	 * Local React state.
	 *
	 * meta: the selected figure's REST metadata.
	 * isLoadingMeta: true while fetching /graphic-data/v1/figure/{id}.
	 * isRenderingPlot: true while producePlotlyLineFigure is running.
	 * errorMessage: shown in the block if REST or Plotly rendering fails.
	 */
	const [meta, setMeta] = useState(null);
	const [isLoadingMeta, setIsLoadingMeta] = useState(false);
	const [isRenderingPlot, setIsRenderingPlot] = useState(false);
	const [errorMessage, setErrorMessage] = useState('');
	const [figurePathFilter, setFigurePathFilter] = useState(0);

	/**
	 * Load published Figure CPT posts for the dropdown.
	 *
	 * This does not load the full custom meta.
	 * It only loads enough information to build the dropdown list.
	 */
	const figures = useSelect((select) => {
		return select('core').getEntityRecords('postType', 'figure', {
			per_page: -1,
			status: 'publish',
			orderby: 'title',
			order: 'asc',
		});
	}, []);

	const figuresAreLoading =
		figures === null || typeof figures === 'undefined';

	const selectedFigure = Array.isArray(figures)
		? figures.find((figure) => Number(figure.id) === Number(figureId))
		: null;

	const selectedFigureTitle = selectedFigure?.title?.rendered
		? stripHTML(selectedFigure.title.rendered)
		: figureId
			? `Figure ${figureId}`
			: '';



	/**
	 * Convert Figure CPT posts into SelectControl options.
	 */

	const figurePathOptions = [
		{
			label: __('Filter by Figure Type...', 'graphic-data-plugin'),
			value: 0,
		},
		{
			label: __('Interactive', 'graphic-data-plugin'),
			value: 'Interactive',
		},
		{
			label: __('External Image', 'graphic-data-plugin'),
			value: 'External',
		},
		{
			label: __('Code', 'graphic-data-plugin'),
			value: 'Code',
		},
		{
			label: __('Internal Image', 'graphic-data-plugin'),
			value: 'Internal',
		},
	];

	const figureOptions = [
		{
			label: __('Select a Figure...', 'graphic-data-plugin'),
			value: 0,
		},
		...(Array.isArray(figures)
			? figures
				.filter((figure) => {
					if (figurePathFilter === 0 || figurePathFilter === '0') {
						return true;
					}
				
					return figure.figure_path === figurePathFilter;
				})
				.map((figure) => {
					const figureTitle = figure.title?.rendered
						? stripHTML(figure.title.rendered)
						: 'Untitled figure';
					
					return {
							label: `${figure.figure_path} (id:${figure.id}) - ${figureTitle}`,
						value: figure.id,
					};
					
				})
			: []),
	];


	useEffect(() => {
		if (instanceId) return;
	
		const cleanClientId = String(clientId || '')
			.replace(/[^a-zA-Z0-9_-]/g, '');
	
		setAttributes({
			instanceId:
				cleanClientId ||
				`instance-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`,
		});
	}, [instanceId, clientId, setAttributes]);

	/**
	 * When figureId changes, fetch the full figure metadata from your custom
	 * REST endpoint.
	 *
	 * This replaces the old behavior where the meta populated a second edit form.
	 * Now the meta is used only to render the selected figure.
	 */
	useEffect(() => {
		let isCurrentRequest = true;

		/**
		 * No selected figure:
		 * - clear metadata
		 * - clear errors
		 * - clear the Plotly preview area
		 */
		if (!figureId) {
			setMeta(null);
			setErrorMessage('');

			if (previewRef.current) {
				previewRef.current.innerHTML = '';
			}

			return () => {
				isCurrentRequest = false;
			};
		}

		setIsLoadingMeta(true);
		setMeta(null);
		setErrorMessage('');

		apiFetch({
			path: `/graphic-data/v1/figure/${figureId}`,
			method: 'GET',
		})
			.then((response) => {
				if (!isCurrentRequest) return;

				console.log('Loaded selected figure REST meta:', response);
				setMeta(response || {});
			})
			.catch((error) => {
				if (!isCurrentRequest) return;

				console.error('Failed to load selected figure REST meta:', error);
				setErrorMessage(
					error?.message ||
						'Failed to load the selected figure metadata.'
				);
			})
			.finally(() => {
				if (!isCurrentRequest) return;

				setIsLoadingMeta(false);
			});

		return () => {
			isCurrentRequest = false;
		};
	}, [figureId]);

	/**
	 * When REST meta is available, inject a Plotly target div and call your
	 * existing Plotly rendering function.
	 *
	 * producePlotlyLineFigure wants:
	 *
	 * producePlotlyLineFigure(
	 *   targetFigureElement,
	 *   interactive_arguments,
	 *   postID
	 * )
	 *
	 * In this block:
	 * - targetFigureElement = "targetFigureElement_{figureId}"
	 * - interactive_arguments = meta.figure_interactive_arguments
	 * - postID = figureId
	 */
	useEffect(() => {
		let isCurrentRender = true;

		const previewElement = previewRef.current;

		if (!previewElement) {
			return () => {
				isCurrentRender = false;
			};
		}

		/**
		 * Clear any previous Plotly render before rendering the newly selected
		 * figure. This prevents duplicate charts when the dropdown changes.
		 */
		previewElement.innerHTML = '';
		setIsRenderingPlot(false);

		if (!figureId || !meta) {
			return () => {
				isCurrentRender = false;
			};
		}

		if (meta.figure_path !== 'Interactive') {
			setErrorMessage(
				'The selected figure is not marked as Interactive, so the Plotly renderer was not run.'
			);

			return () => {
				isCurrentRender = false;
			};
		}

		const interactiveArguments = normalizeInteractiveArguments(
			meta.figure_interactive_arguments
		);

		if (!interactiveArguments) {
			setErrorMessage(
				'The selected figure does not have figure_interactive_arguments.'
			);

			return () => {
				isCurrentRender = false;
			};
		}

		/**
		 * This ID intentionally ends with the figure ID.
		 *
		 * Your existing frontend code has used IDs like:
		 * targetFigureElement_295
		 *
		 * So we keep that same pattern.
		 */
		const safeInstanceId = String(instanceId || clientId || '').replace(/[^a-zA-Z0-9_-]/g, '');
		const targetFigureElement = `targetFigureElement_${figureId}_${safeInstanceId}`;


		/**
		 * Important:
		 * Do not assume global document is the same document as the block editor canvas.
		 * In the block editor, previewElement may live inside an editor iframe.
		 */


		const targetDocument = previewElement.ownerDocument;

		ensurePlotlyEditorLayerStyles(targetDocument);

		const targetDiv = targetDocument.createElement('div');
		targetDiv.id = targetFigureElement;
		targetDiv.className =
			'targetFigureElement graphic-data-block-plotly-target';
		targetDiv.dataset.figureId = String(figureId);
		targetDiv.style.width = '100%';

		previewElement.appendChild(targetDiv);


		async function renderPlotlyFigure() {
			setIsRenderingPlot(true);
			setErrorMessage('');

			try {

				const rawArgs = meta?.figure_interactive_arguments;

				const parsedArgs =
					typeof rawArgs === 'string'
						? JSON.parse(rawArgs)
						: rawArgs;

				const graphType = Array.isArray(parsedArgs)
					? Object.fromEntries(parsedArgs).graphType
					: parsedArgs?.graphType;


				if (graphType === 'Plotly line graph (time series)') {
					await Promise.resolve(
						producePlotlyLineFigure(
							targetFigureElement,
							interactiveArguments,
							Number(figureId),
							targetDocument
						)
					);
				}
				if (graphType === 'Plotly bar graph') {
					await Promise.resolve(
						producePlotlyBarFigure(
							targetFigureElement,
							interactiveArguments,
							Number(figureId),
							targetDocument
						)
					);
				}


				/**
				 * Gutenberg may finish sizing the block after Plotly initially renders.
				 * Wait two animation frames, then force Plotly to use the actual parent width.
				 */
				await new Promise((resolve) => {
					window.requestAnimationFrame(() => {
						window.requestAnimationFrame(resolve);
					});
				});
				
				const targetElement = targetDocument.getElementById(targetFigureElement);
				
				const plotDiv =
					targetElement?.querySelector('.js-plotly-plot') ||
					targetElement?.querySelector('.plotly') ||
					targetElement;
				
				if (plotDiv && window.Plotly?.Plots?.resize) {
					window.Plotly.Plots.resize(plotDiv);
				}
				
				if (plotDiv && window.Plotly?.relayout) {
					await window.Plotly.relayout(plotDiv, {
						autosize: true,
						width: targetElement.clientWidth,
					});
				}

			} catch (error) {
				if (!isCurrentRender) return;

				console.error('Failed to render Plotly figure in block:', error);
				setErrorMessage(
					error?.message ||
						'Failed to render the selected Plotly figure.'
				);
			} finally {
				if (!isCurrentRender) return;

				setIsRenderingPlot(false);
			}
		}

		renderPlotlyFigure();



		return () => {
			isCurrentRender = false;

		// 	/**
		// 	 * Optional cleanup if Plotly is available on window.
		// 	 * This helps avoid stale Plotly instances inside the editor.
		// 	 */
			if (window.Plotly?.purge && document.getElementById(targetFigureElement)) {
				window.Plotly.purge(targetFigureElement);
			}
		};
	}, [
		figureId,
		meta?.figure_path,
		meta?.figure_interactive_arguments,
	]);

	return (
		<div {...blockProps}>
			<div
				className="graphic-data-figure-path-selector"
				style={{
					marginBottom: '16px',
				}}
			>
				<label
					className="graphic-data-figure-path-selector"
					style={{
						display: 'block',
						marginBottom: '8px',
						// textTransform: 'uppercase',
						// textDecoration: 'underline',
						fontSize: '14px',
						fontWeight: '600',
						lineHeight: '1.4',
						fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif',
						}}
				>
					{__('Graphic Data - Figure', 'graphic-data-plugin')}
				</label>
			</div>

			<div
				className="graphic-data-figure-path-selector"
				style={{
					marginBottom: '16px',
				}}
			>
				<SelectControl
					// label={__('Select Figure Type:', 'graphic-data-plugin')}
					value={figurePathFilter}
					options={figurePathOptions}
					onChange={(value) => {
						setFigurePathFilter(value);

						/**
						 * Clear the selected figure when changing figure type.
						 * This prevents an old selected figure from staying active
						 * after the dropdown category changes.
						 */
						setAttributes({
							figureId: 0,
						});

						setMeta(null);
						setErrorMessage('');

						if (previewRef.current) {
							previewRef.current.innerHTML = '';
						}
					}}
				/>
			</div>
			<div
				className="graphic-data-figure-selector"
				style={{
					marginBottom: '16px',
				}}
			>
				{figuresAreLoading && <Spinner />}

				{Array.isArray(figures) && figures.length === 0 && (
					<Notice status="warning" isDismissible={false}>
						No published figures found.
					</Notice>
				)}

				{Array.isArray(figures) && figures.length > 0 && (

					
					<SelectControl
						// label={__('Select Existing Figure:', 'graphic-data-plugin')}
						value={Number(figureId)}
						options={figureOptions}
						onChange={(value) => {
							const nextFigureId = Number(value);

							setAttributes({
								figureId: nextFigureId,
							});

							/**
							 * Clear old data immediately so the old chart does not stay
							 * visible while the next REST request is loading.
							 */
							setMeta(null);
							setErrorMessage('');

							if (previewRef.current) {
								previewRef.current.innerHTML = '';
							}
						}}
					/>
				)}
			</div>

			{isLoadingMeta && (
				<div className="graphic-data-figure-loading">
					<Spinner />
					<span>Loading figure metadata...</span>
				</div>
			)}

			{isRenderingPlot && (
				<div className="graphic-data-figure-rendering">
					<Spinner />
					<span>Rendering Plotly figure...</span>
				</div>
			)}

			{errorMessage && (
				<Notice status="error" isDismissible={false}>
					{errorMessage}
				</Notice>
			)}

			{!figureId && !figuresAreLoading && (
				<Notice status="info" isDismissible={false}>
					Select a Graphic Data "Figure" to render it in this block. If you
					filter by figure type and do not see any figures listed in the drop
					down menu above, you will need to{' '}
					<a
						href="/wp-admin/post-new.php?post_type=figure"
						target="_blank"
						rel="noreferrer"
					>
						Create a New Figure
					</a>{' '}
					of that type.
				</Notice>
			)}

			<div
				ref={previewRef}
				className="graphic-data-figure-preview"
				// style={{
				// 	width: '100%',
				// 	maxWidth: 'none',
				// 	minHeight: figureId ? '360px' : '0',
				// }}
				// style={{
				// 	width: '100%',
				// 	maxWidth: '100%',
				// 	// minHeight: figureId ? `500px` : '0',
				// 	// overflow: 'hidden',
				// }}
			/>
		</div>
	);
}

//____________________________________________________________________________

//THIS WAS THE WORKING FORM AND FIELDS AND THE ABILITY TO CREATE A NEW FIGURE.

// import { useState, useEffect, useRef } from '@wordpress/element';
// import { useSelect, useDispatch } from '@wordpress/data';
// import { InspectorControls, useBlockProps } from '@wordpress/block-editor';
// import apiFetch from '@wordpress/api-fetch';
// // import { producePlotlyLineFigure } from '.plugins/graphic_data_plugin/includes/figures/js/interactive/plotly-timeseries-line.js';

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

// import './editor.scss';

// function TinyMCEControl({
// 	id,
// 	label,
// 	value,
// 	onChange,
// 	height = 180,
// }) {
// 	const editorIdRef = useRef(id);

// 	useEffect(() => {
// 		const editorId = editorIdRef.current;

// 		if (!window.wp?.editor?.initialize) {
// 			console.warn('wp.editor.initialize is not available. Falling back to textarea.');
// 			return;
// 		}

// 		if (window.tinymce?.get(editorId)) {
// 			window.wp.editor.remove(editorId);
// 		}

// 		window.wp.editor.initialize(editorId, {
// 			tinymce: {
// 				wpautop: true,
// 				menubar: false,
// 				height,
// 				toolbar1:
// 					'bold italic underline | bullist numlist | link unlink | undo redo',
// 				setup(editor) {
// 					editor.on('change keyup blur', () => {
// 						onChange(editor.getContent());
// 					});
// 				},
// 			},
// 			quicktags: true,
// 			mediaButtons: false,
// 		});

// 		return () => {
// 			if (window.wp?.editor?.remove) {
// 				window.wp.editor.remove(editorId);
// 			} else if (window.tinymce?.get(editorId)) {
// 				window.tinymce.get(editorId).remove();
// 			}
// 		};
// 	}, []);

// 	useEffect(() => {
// 		const editorId = editorIdRef.current;
// 		const editor = window.tinymce?.get(editorId);

// 		if (editor && value !== editor.getContent()) {
// 			editor.setContent(value || '');
// 		}
// 	}, [value]);

// 	return (
// 		<div
// 			className="graphic-data-tinymce-control"
// 			style={{
// 				width: '100%',
// 				marginTop: '16px',
// 				marginBottom: '16px',
// 			}}
// 		>
// 			<label
// 				htmlFor={editorIdRef.current}
// 				style={{
// 					display: 'block',
// 					fontWeight: '600',
// 					marginBottom: '6px',
// 				}}
// 			>
// 				{label}
// 			</label>

// 			<textarea
// 				id={editorIdRef.current}
// 				value={value || ''}
// 				onChange={(event) => onChange(event.target.value)}
// 				style={{
// 					width: '100%',
// 					minHeight: `${height}px`,
// 				}}
// 			/>
// 		</div>
// 	);
// }

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

// 						<TinyMCEControl
// 							id={`figure-caption-short-${figureId}`}
// 							label="Short Caption"
// 							value={meta.figure_caption_short || ''}
// 							onChange={(value) =>
// 								updateMeta('figure_caption_short', value)
// 							}
// 							height={160}
// 						/>

// 						<TinyMCEControl
// 							id={`figure-caption-long-${figureId}`}
// 							label="Extended Caption"
// 							value={meta.figure_caption_long || ''}
// 							onChange={(value) =>
// 								updateMeta('figure_caption_long', value)
// 							}
// 							height={240}
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


