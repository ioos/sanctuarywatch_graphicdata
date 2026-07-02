/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./blocks/insert-figure/src/edit.js"
/*!******************************************!*\
  !*** ./blocks/insert-figure/src/edit.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ Edit)
/* harmony export */ });
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/element */ "@wordpress/element");
/* harmony import */ var _wordpress_element__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_element__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @wordpress/data */ "@wordpress/data");
/* harmony import */ var _wordpress_data__WEBPACK_IMPORTED_MODULE_1___default = /*#__PURE__*/__webpack_require__.n(_wordpress_data__WEBPACK_IMPORTED_MODULE_1__);
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__);
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! @wordpress/api-fetch */ "@wordpress/api-fetch");
/* harmony import */ var _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default = /*#__PURE__*/__webpack_require__.n(_wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3__);
/* harmony import */ var _graphic_data_plotly_timeseries_line__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @graphic-data/plotly-timeseries-line */ "./includes/figures/js/interactive/plotly-timeseries-line.js");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__);








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
function Edit({
  attributes,
  setAttributes,
  clientId
}) {
  /**
   * figureId is the only block attribute this editor really needs now.
   *
   * The saved page should use this same figureId later to render the frontend
   * Plotly figure.
   */
  const {
    figureId = 0,
    instanceId = ''
  } = attributes;

  /**
   * useBlockProps adds the standard WordPress block classes and editor props.
   */
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)({
    className: 'graphic-data-insert-figure-block'
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
  const previewRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(null);

  /**
   * Local React state.
   *
   * meta: the selected figure's REST metadata.
   * isLoadingMeta: true while fetching /graphic-data/v1/figure/{id}.
   * isRenderingPlot: true while producePlotlyLineFigure is running.
   * errorMessage: shown in the block if REST or Plotly rendering fails.
   */
  const [meta, setMeta] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(null);
  const [isLoadingMeta, setIsLoadingMeta] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isRenderingPlot, setIsRenderingPlot] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [errorMessage, setErrorMessage] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('');

  /**
   * Load published Figure CPT posts for the dropdown.
   *
   * This does not load the full custom meta.
   * It only loads enough information to build the dropdown list.
   */
  const figures = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    return select('core').getEntityRecords('postType', 'figure', {
      per_page: -1,
      status: 'publish',
      orderby: 'title',
      order: 'asc'
    });
  }, []);
  const figuresAreLoading = figures === null || typeof figures === 'undefined';
  const selectedFigure = Array.isArray(figures) ? figures.find(figure => Number(figure.id) === Number(figureId)) : null;
  const selectedFigureTitle = selectedFigure?.title?.rendered ? stripHTML(selectedFigure.title.rendered) : figureId ? `Figure ${figureId}` : '';

  /**
   * Convert Figure CPT posts into SelectControl options.
   */
  const figureOptions = [{
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Select a figure', 'graphic-data-plugin'),
    value: 0
  }, ...(Array.isArray(figures) ? figures.map(figure => {
    const figureTitle = figure.title?.rendered ? stripHTML(figure.title.rendered) : 'Untitled figure';
    return {
      label: `${figureTitle} (Figure ${figure.id})`,
      value: figure.id
    };
  }) : [])];
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (instanceId) return;
    const cleanClientId = String(clientId || '').replace(/[^a-zA-Z0-9_-]/g, '');
    setAttributes({
      instanceId: cleanClientId || `instance-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`
    });
  }, [instanceId, clientId, setAttributes]);

  /**
   * When figureId changes, fetch the full figure metadata from your custom
   * REST endpoint.
   *
   * This replaces the old behavior where the meta populated a second edit form.
   * Now the meta is used only to render the selected figure.
   */
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
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
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
      path: `/graphic-data/v1/figure/${figureId}`,
      method: 'GET'
    }).then(response => {
      if (!isCurrentRequest) return;
      console.log('Loaded selected figure REST meta:', response);
      setMeta(response || {});
    }).catch(error => {
      if (!isCurrentRequest) return;
      console.error('Failed to load selected figure REST meta:', error);
      setErrorMessage(error?.message || 'Failed to load the selected figure metadata.');
    }).finally(() => {
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
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
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
      setErrorMessage('The selected figure is not marked as Interactive, so the Plotly renderer was not run.');
      return () => {
        isCurrentRender = false;
      };
    }
    const interactiveArguments = normalizeInteractiveArguments(meta.figure_interactive_arguments);
    if (!interactiveArguments) {
      setErrorMessage('The selected figure does not have figure_interactive_arguments.');
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
    targetDiv.className = 'targetFigureElement graphic-data-block-plotly-target';
    targetDiv.dataset.figureId = String(figureId);
    targetDiv.style.width = '100%';
    previewElement.appendChild(targetDiv);
    async function renderPlotlyFigure() {
      setIsRenderingPlot(true);
      setErrorMessage('');
      try {
        await Promise.resolve((0,_graphic_data_plotly_timeseries_line__WEBPACK_IMPORTED_MODULE_4__.producePlotlyLineFigure)(targetFigureElement, interactiveArguments, Number(figureId), targetDocument));

        /**
         * Gutenberg may finish sizing the block after Plotly initially renders.
         * Wait two animation frames, then force Plotly to use the actual parent width.
         */
        await new Promise(resolve => {
          window.requestAnimationFrame(() => {
            window.requestAnimationFrame(resolve);
          });
        });
        const targetElement = targetDocument.getElementById(targetFigureElement);
        const plotDiv = targetElement?.querySelector('.js-plotly-plot') || targetElement?.querySelector('.plotly') || targetElement;
        if (plotDiv && window.Plotly?.Plots?.resize) {
          window.Plotly.Plots.resize(plotDiv);
        }
        if (plotDiv && window.Plotly?.relayout) {
          await window.Plotly.relayout(plotDiv, {
            autosize: true,
            width: targetElement.clientWidth
          });
        }
      } catch (error) {
        if (!isCurrentRender) return;
        console.error('Failed to render Plotly figure in block:', error);
        setErrorMessage(error?.message || 'Failed to render the selected Plotly figure.');
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
  }, [figureId, meta?.figure_path, meta?.figure_interactive_arguments]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "graphic-data-figure-selector",
      style: {
        marginBottom: '16px'
      },
      children: [figuresAreLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Spinner, {}), Array.isArray(figures) && figures.length === 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Notice, {
        status: "warning",
        isDismissible: false,
        children: "No published figures found."
      }), Array.isArray(figures) && figures.length > 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.SelectControl, {
        label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_6__.__)('Graphic Data - Insert Interactive Figure', 'graphic-data-plugin'),
        value: Number(figureId),
        options: figureOptions,
        onChange: value => {
          const nextFigureId = Number(value);
          setAttributes({
            figureId: nextFigureId
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
        }
      })]
    }), isLoadingMeta && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "graphic-data-figure-loading",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Spinner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
        children: "Loading figure metadata..."
      })]
    }), isRenderingPlot && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsxs)("div", {
      className: "graphic-data-figure-rendering",
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Spinner, {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("span", {
        children: "Rendering Plotly figure..."
      })]
    }), errorMessage && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Notice, {
      status: "error",
      isDismissible: false,
      children: errorMessage
    }), !figureId && !figuresAreLoading && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_5__.Notice, {
      status: "info",
      isDismissible: false,
      children: "Select a figure to render it in this block."
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_7__.jsx)("div", {
      ref: previewRef,
      className: "graphic-data-figure-preview"
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
    })]
  });
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

/***/ },

/***/ "./blocks/insert-figure/src/save.js"
/*!******************************************!*\
  !*** ./blocks/insert-figure/src/save.js ***!
  \******************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   "default": () => (/* binding */ save)
/* harmony export */ });
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/block-editor */ "@wordpress/block-editor");
/* harmony import */ var _wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_0__);
/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */


/**
 * The save function defines the way in which the different attributes should
 * be combined into the final markup, which is then serialized by the block
 * editor into `post_content`.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#save
 *
 * @return {Element} Element to render.
 */
// export default function save() {
// 	return (
// 		<p { ...useBlockProps.save() }>
// 			{ 'Figures – hello from the saved content!' }
// 		</p>
// 	);
// }

//Dynamic block means frontend HTML comes from PHP, not saved static HTML.
function save() {
  return null;
}

/***/ },

/***/ "./includes/figures/js/interactive/plotly-timeseries-line.js"
/*!*******************************************************************!*\
  !*** ./includes/figures/js/interactive/plotly-timeseries-line.js ***!
  \*******************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   producePlotlyLineFigure: () => (/* binding */ producePlotlyLineFigure)
/* harmony export */ });
/* harmony import */ var _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @graphic-data/plotly-utility */ "./includes/figures/js/interactive/plotly-utility.js");

const _lineDataEl = document.getElementById('wp-script-module-data-@graphic-data/plotly-timeseries-line');
let _lineDefaults = {};
if (_lineDataEl?.textContent) {
  try {
    _lineDefaults = JSON.parse(_lineDataEl.textContent);
  } catch {}
}

/**
 * Adds overlay elements (such as evaluation periods and event markers) to a Plotly time series line chart.
 *
 * This function modifies the provided Plotly layout and data by injecting overlays that visually represent
 * special periods (e.g., evaluation periods) and event markers (vertical or horizontal lines) on the chart.
 * Overlays are constructed based on the configuration in `figureArguments` and the data in `dataToBePlotted`.
 * The function supports both shaded regions (for evaluation periods) and lines (for event markers on x or y axes).
 * After constructing the overlays, the function calls `Plotly.react` to update the chart with the overlays and main data traces.
 *
 * @function injectOverlays
 * @param {HTMLElement} plotDiv         - The DOM element where the Plotly chart is rendered.
 * @param {Object}      layout          - The Plotly layout object, which will be modified to include overlay settings.
 * @param {Array}       mainDataTraces  - The main data traces to be plotted (typically lines).
 * @param {Object}      figureArguments - An object containing user-specified arguments for overlays, such as:
 *                                      - 'EvaluationPeriod': 'on' to enable evaluation period overlay.
 *                                      - 'EvaluationPeriodStartDate', 'EvaluationPeriodEndDate': Date strings for the evaluation period.
 *                                      - 'EvaluationPeriodFillColor': Color for the evaluation period overlay.
 *                                      - 'EvaluationPeriodText': Label for the evaluation period.
 *                                      - 'EventMarkers': 'on' to enable event markers.
 *                                      - 'EventMarkersField': Number of event markers.
 *                                      - 'EventMarkersEventAxis{n}': 'x' or 'y' for each marker.
 *                                      - 'EventMarkersEventText{n}': Label for each marker.
 *                                      - 'EventMarkersEventColor{n}': Color for each marker.
 *                                      - 'EventMarkersEventDate{n}': Date for x-axis marker.
 *                                      - 'EventMarkersEventYValue{n}': Y value for y-axis marker.
 * @param {Object}      dataToBePlotted - The data object containing arrays for each column, used for plotting overlays.
 *
 * @description
 * - If the evaluation period is enabled, a shaded region is added to the chart between the specified start and end dates.
 * - If event markers are enabled, vertical or horizontal lines are added at specified positions, with labels and colors.
 * - The function ensures overlays are drawn using the current y-axis range and x-axis data.
 * - The overlays are combined with the main data traces and rendered using `Plotly.react`.
 *
 * @modifies
 * - Modifies the `layout` object to ensure correct axis types.
 * - Updates the chart in `plotDiv` by calling `Plotly.react`.
 *
 * @example
 * injectOverlays(plotDiv, layout, mainDataTraces, figureArguments, dataToBePlotted);
 *
 * @return {void}
 */
function injectOverlays(plotDiv, layout, mainDataTraces, figureArguments, dataToBePlotted) {
  if (!plotDiv || !layout || !layout.yaxis || !layout.yaxis.range) {
    console.warn("[Overlay] Missing layout or y-axis range");
    return;
  }
  const columnXHeader = figureArguments['XAxis'];
  const plotlyX = dataToBePlotted[columnXHeader];
  layout.xaxis = layout.xaxis || {};
  layout.xaxis.type = 'date';
  layout.yaxis = layout.yaxis || {};
  layout.yaxis.type = 'linear';
  const [yMin, yMax] = layout.yaxis.range || [0, 1];
  const overlays = [];
  const dateFormat = figureArguments['XAxisFormat'];
  let xHoverFormat = '';
  switch (dateFormat) {
    case 'YYYY':
      xHoverFormat = '%Y';
      break;
    case 'YYYY-MM':
      xHoverFormat = '%Y-%m';
      break;
    case 'YYYY-MM-DD':
      xHoverFormat = '%Y-%m-%d';
      break;
    default:
      xHoverFormat = '';
    // fallback to raw
  }

  // Then build your hovertemplate:
  const xHoverValue = xHoverFormat ? `%{x|${xHoverFormat}}` : `%{x}`;

  // === Evaluation Period ===
  if (figureArguments['EvaluationPeriod'] === 'on') {
    let start = figureArguments['EvaluationPeriodStartDate'];
    let end = figureArguments['EvaluationPeriodEndDate'];
    const startDate = new Date(start).toLocaleDateString();
    const endDate = new Date(end).toLocaleDateString();
    const fillColor = (figureArguments['EvaluationPeriodFillColor'] || '#999') + '15';
    const EvalDisplayText = figureArguments['EvaluationPeriodText'];
    overlays.push({
      x: [start, end, end, start],
      y: [yMax, yMax, yMin, yMin],
      fill: 'toself',
      fillcolor: fillColor,
      type: 'scatter',
      mode: 'lines',
      line: {
        color: fillColor,
        width: 0
      },
      // hoverinfo: EvalDisplayText,
      // hovertemplate:
      // `${startDate}<br>` +
      // `${endDate}<extra></extra>`,
      name: EvalDisplayText,
      showlegend: true,
      yaxis: 'y',
      xaxis: 'x'
    });
  }
  for (let i = 0; i <= Number(figureArguments['EventMarkersField']); i++) {
    // === Event Markers ===
    if (figureArguments[`EventMarkers`] === 'on') {
      let axisType = figureArguments[`EventMarkersEventAxis${i}`];
      const label = figureArguments[`EventMarkersEventText${i}`];
      const color = figureArguments[`EventMarkersEventColor${i}`] || '#000';
      if (axisType === 'x') {
        let date = figureArguments[`EventMarkersEventDate${i}`];
        overlays.push({
          x: [date, date],
          y: [yMin, yMax],
          type: 'scatter',
          mode: 'lines',
          line: {
            color,
            width: 2
          },
          name: label,
          showlegend: true,
          yaxis: 'y',
          xaxis: 'x',
          //hoverinfo: `x`,
          hovertemplate: `${label}: ${xHoverValue}<extra></extra>`
        });
      }
      if (axisType === 'y') {
        let yValue = parseFloat(figureArguments[`EventMarkersEventYValue${i}`], 10);
        const yArray = Array(plotlyX.length).fill(yValue);
        overlays.push({
          x: plotlyX,
          y: yArray,
          type: 'scatter',
          mode: 'lines',
          line: {
            color,
            width: 2
          },
          name: label,
          showlegend: true,
          yaxis: 'y',
          xaxis: 'x',
          //hoverinfo: `${label} y`,
          hovertemplate: `${label}: %{y}<extra></extra>`
        });
      }
      if (axisType === 'x') {
        let date = figureArguments[`EventMarkersEventDate${i}`];
        layout.shapes = layout.shapes || [];
        layout.shapes.push({
          type: 'line',
          xref: 'x',
          yref: 'paper',
          // "paper" makes it stretch top-to-bottom
          x0: date,
          x1: date,
          y0: 0,
          // bottom edge of the plotting area
          y1: 1,
          // top edge of the plotting area
          line: {
            color: color,
            width: 2,
            dash: 'solid'
          }
        });
      }
      if (axisType === 'y') {
        let yValue = parseFloat(figureArguments[`EventMarkersEventYValue${i}`], 10);
        // const yArray = Array(plotlyX.length).fill(yValue);
        layout.shapes = layout.shapes || [];
        layout.shapes.push({
          type: 'line',
          xref: 'paper',
          // "paper" means 0–1 relative to full width
          yref: 'y',
          x0: 0,
          // start at left edge of plot
          x1: 1,
          // end at right edge of plot
          y0: yValue,
          y1: yValue,
          line: {
            color: color,
            width: 2
          }
        });
      }
    }
  }
  // Plotly.react(plotDiv, [...overlays, ...mainDataTraces], layout);
}

/**
 * Asynchronously generates and renders a Plotly time series line chart with interactive features and overlays.
 *
 * This function loads the necessary Plotly library, retrieves figure configuration and data via REST API calls,
 * constructs the chart's data traces and layout based on user-specified arguments, and injects overlays such as
 * evaluation periods, event markers, standard deviation fills, error bars, mean and percentile lines. It supports
 * both admin and theme contexts for retrieving the figure's post ID.
 *
 * @async
 * @function producePlotlyLineFigure
 * @param {string}             targetFigureElement   - The ID of the DOM element where the chart should be rendered.
 * @param {string}             interactive_arguments - A JSON string (array of key-value pairs) representing user-specified chart configuration.
 * @param {string|number|null} postID                - The WordPress post ID for the figure. If null, the function attempts to retrieve it from the admin page.
 *
 * @description
 * - Ensures Plotly.js is loaded before proceeding.
 * - Retrieves the figure's configuration and data file path via a REST API call.
 * - Fetches the actual data to be plotted from the resolved file URL.
 * - Dynamically creates a container div for the Plotly chart and appends it to the target element.
 * - Constructs Plotly data traces for each line, including options for error bars, standard deviation fills, mean and percentile lines, and legend visibility.
 * - Configures the chart layout, including axis titles, bounds, grid lines, tick settings, and legend position.
 * - Renders the chart using Plotly.newPlot, then injects overlays (evaluation periods and event markers) using the `injectOverlays` function.
 * - Handles both admin and theme contexts for post ID resolution.
 * - Catches and logs errors related to script loading or network requests.
 *
 * @modifies
 * - Appends a new div to the target DOM element for rendering the chart.
 * - Updates the chart in the DOM with Plotly.
 *
 * @requires
 * - loadPlotlyScript: Ensures Plotly.js is loaded.
 * - waitForElementById: Waits for the target DOM element to be available.
 * - computeStandardDeviation: Computes standard deviation for error bars and fills.
 * - computePercentile: Computes percentiles for percentile lines.
 * - injectOverlays: Adds overlays such as evaluation periods and event markers to the chart.
 *
 * @example
 * // Render a Plotly line chart in the element with ID 'figure_123' using saved arguments and post ID 123:
 * producePlotlyLineFigure('figure_123', '[["XAxisTitle","Date"],["YAxisTitle","Value"],...]', 123);
 *
 * @throws {Error} Logs errors to the console if Plotly fails to load, network requests fail, or data cannot be parsed.
 *
 * @variables
 * - figureID: The resolved post ID for the figure.
 * - figureArguments: Object containing parsed chart configuration.
 * - rootURL: The root URL of the current site.
 * - figureRestCall: REST API endpoint for retrieving the figure's data file path.
 * - uploaded_path_json: Path to the uploaded data file.
 * - finalURL: Full URL to the data file.
 * - dataToBePlotted: The parsed data object used for plotting.
 * - plotlyDivID: The ID assigned to the Plotly chart container div.
 * - allLinesPlotly: Array of Plotly trace objects for each line and overlay.
 * - layout: Plotly layout object for axis, legend, and display settings.
 * - config: Plotly configuration object for rendering options.
 */
async function producePlotlyLineFigure(targetFigureElement, interactive_arguments, postID, targetDocument = document) {
  // try {

  const renderDocument = targetDocument || document;
  await (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.loadPlotlyScript)(); // ensures Plotly is ready

  const rawField = interactive_arguments;
  const figureArguments = Object.fromEntries(JSON.parse(rawField));
  const rootURL = window.location.origin;
  let figureID = '';

  //Rest call to get uploaded_path_json
  if (postID == null) {
    // ADMIN SIDE POST ID GRAB
    figureID = document.getElementsByName("post_ID")[0].value;
    //console.log("figureID ADMIN:", figureID);
  }
  if (postID != null) {
    // THEME SIDE POST ID GRAB
    figureID = postID;
    //console.log("figureID THEME:", figureID);
  }

  // in fetch_tab_info in script.js, await render_tab_info & await new Promise were added to give each run of producePlotlyLineFigure a chance to finish running before the next one kicked off
  // producePlotlyLineFigure used to fail here because the script was running before the previous iteration finished. 
  const figureRestCall = `${rootURL}/wp-json/wp/v2/figure/${figureID}?_fields=uploaded_path_json`;
  const response = await fetch(figureRestCall);
  const data = await response.json();
  const uploaded_path_json = data.uploaded_path_json;
  const restOfURL = "/wp-content" + uploaded_path_json.split("wp-content")[1];
  const finalURL = rootURL + restOfURL;
  const rawResponse = await fetch(finalURL);
  if (!rawResponse.ok) {
    throw new Error('Network response was not ok');
  }
  const responseJson = await rawResponse.json();
  //console.log('[GD] responseJson keys:', Object.keys(responseJson), 'type:', Array.isArray(responseJson) ? 'array' : typeof responseJson);

  const dataToBePlotted = responseJson.data;
  //console.log('[GD] dataToBePlotted:', dataToBePlotted?.length, 'rows, first row:', JSON.stringify(dataToBePlotted?.[0]));

  //Important for blocks to work - We need one to work with the document from the block and one for the regular document the function normally runs in.
  let newDiv;
  if (!targetDocument) {
    newDiv = document.createElement('div');
  }
  if (targetDocument) {
    newDiv = renderDocument.createElement('div');
  }

  // considerations for unique hashing for multiple uses vs onetime use. 
  let plotlyDivID;
  const uniqueHash = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
  plotlyDivID = `plotlyFigure${figureID}_${uniqueHash}`;
  newDiv.id = plotlyDivID;
  newDiv.classList.add("container", `figure_interactive${figureID}`);
  const targetElementparts = targetFigureElement.split("_");
  const targetElementpostID = targetElementparts[targetElementparts.length - 1];

  // if (figureID == targetElementpostID) {

  //Important for blocks to work - We need one to work with the document from the block and one for the regular document the function normally runs in.
  let targetElement;
  if (!targetDocument) {
    targetElement = await (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.waitForElementById)(targetFigureElement);
    targetElement.appendChild(newDiv);
  }
  if (targetDocument) {
    targetElement = renderDocument.getElementById(targetFigureElement);
    targetElement.appendChild(newDiv);
  }
  const numLines = figureArguments['NumberOfLines'];
  let plotlyX;
  let plotlyY;
  let columnXHeader;
  let columnYHeader;
  let targetLineColumn;
  let singleLinePlotly;
  let allLinesPlotly = [];
  let shapesForLayout = [];

  //Shows the grid lines if it is set to 'on' in the figure arguments
  const showGrid = figureArguments['showGrid'];
  if (showGrid === 'on') {
    var showGridBool = true;
  } else {
    var showGridBool = false;
  }

  //Shows the graph ticks on the outside if it is set to 'on' in the figure arguments
  const graphTicks = figureArguments['graphTicks'];
  if (graphTicks === 'on') {
    var graphTickModeBool = '';
    var graphTickPositionBool = '';
  } else {
    var graphTickModeBool = 'auto';
    var graphTickPositionBool = 'outside';
  }
  //console.log('graphTicks', graphTicks);            
  //console.log('graphTickModeBool', graphTickModeBool);
  //console.log('graphTickPositionBool', graphTickPositionBool);

  // Plotly figure production logic
  for (let i = 1; i <= figureArguments['NumberOfLines']; i++) {
    const targetLineColumn = 'Line' + i;
    const columnXHeader = figureArguments['XAxis'];
    const columnYHeader = figureArguments[targetLineColumn];
    const plotlyX = dataToBePlotted[columnXHeader];
    const plotlyY = dataToBePlotted[columnYHeader];
    const stdDev = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.computeStandardDeviation)(plotlyY);
    const dateFormat = figureArguments['XAxisFormat'];
    let xHoverFormat = '';
    switch (dateFormat) {
      case 'YYYY':
        xHoverFormat = '%Y';
        break;
      case 'YYYY-MM':
        xHoverFormat = '%Y-%m';
        break;
      case 'YYYY-MM-DD':
        xHoverFormat = '%Y-%m-%d';
        break;
      default:
        xHoverFormat = '';
      // fallback to raw
    }

    // Then build your hovertemplate:
    const xHoverValue = xHoverFormat ? `%{x|${xHoverFormat}}` : `%{x}`;

    // Line type, marker type, and marker size
    const lineType = figureArguments[targetLineColumn + 'LineType'];
    if (lineType === undefined) {
      const lineType = 'solid';
    }
    //console.log('lineType', lineType);
    const markerType = figureArguments[targetLineColumn + 'MarkerType'];
    const markerSize = parseInt(figureArguments[targetLineColumn + 'MarkerSize'], 10);

    //Shows the legend if it is set to 'on' in the figure arguments
    const showLegend = figureArguments[targetLineColumn + 'Legend'];
    if (showLegend === 'on') {
      var showLegendBool = true;
    } else {
      var showLegendBool = false;
    }

    //Connects gaps in line where there is missing data
    const connectGapsOpt = figureArguments[targetLineColumn + 'ConnectGaps'] === 'on';

    //Show Standard error bars
    const showError = figureArguments[targetLineColumn + 'ErrorBars'];
    const showError_InputValuesOpt = figureArguments[targetLineColumn + 'ErrorBarsInputValues'];
    if (showError === 'on') {
      //Error bars using Standard Deviation based on dataset Y-axis values (Auto Calculated)
      if (showError_InputValuesOpt === 'auto') {
        var errorBarY = {
          type: 'data',
          array: new Array(plotlyY.length).fill(stdDev),
          visible: true,
          color: figureArguments[targetLineColumn + 'ErrorBarsColor'],
          thickness: 1.5,
          width: 8
        };
      }
      //Error bars (values imported from spreadsheet per point in dataset)
      //Do we want high and low bounds here?
      if (showError_InputValuesOpt != 'auto') {
        const showError_InputValue = dataToBePlotted[showError_InputValuesOpt].filter(item => item !== "");
        var errorBarY = {
          type: 'data',
          array: showError_InputValue.map(val => parseFloat(val)),
          // Convert to number if needed
          visible: true,
          color: figureArguments[targetLineColumn + 'ErrorBarsColor'],
          thickness: 1.5,
          width: 8
        };
      }
    }
    if (showError != 'on') {
      var errorBarY = {};
    }

    // Main line with or w/o error bars
    const singleLinePlotly = {
      x: plotlyX,
      y: plotlyY,
      mode: 'lines+markers',
      type: 'scatter',
      name: `${figureArguments[targetLineColumn + 'Title']}`,
      showlegend: showLegendBool,
      line: {
        dash: lineType // e.g., 'dash', 'dot', etc.
      },
      marker: {
        color: figureArguments[targetLineColumn + 'Color'],
        symbol: markerType,
        size: markerSize // Convert markerSize to integer
      },
      error_y: errorBarY,
      connectgaps: connectGapsOpt,
      hovertemplate: `${figureArguments['XAxisTitle']}: ${xHoverValue}<br>` + `${figureArguments['YAxisTitle']}: %{y}<extra></extra>`
      //figureArguments['XAxisTitle'] + ': %{x}<br>' +
      //figureArguments['YAxisTitle'] + ': %{y}'
    };
    allLinesPlotly.push(singleLinePlotly);

    //Show Standard Deviation Lines
    const showSD = figureArguments[targetLineColumn + 'StdDev'];
    const showSD_InputValuesOpt = figureArguments[targetLineColumn + 'StdDevInputValues'];
    //Standard Deviation of dataset based on dataset Y-axis values (AutoCalculated)
    if (showSD == 'on' && showSD_InputValuesOpt === 'auto') {
      const plotlyYSanitized = plotlyY.map(val => {
        if (val === null || val === undefined || val === "" || typeof val === "string" && val.trim().toUpperCase() === "NA" || isNaN(val)) {
          return 0;
        }
        return parseFloat(val);
      });
      let plotlyYSafeArrayLength = plotlyY.filter(value => value !== null && value !== "NA").length;
      const mean = plotlyYSanitized.reduce((a, b) => a + b, 0) / plotlyYSafeArrayLength;
      //console.log('mean', mean);
      //console.log('stdDev', stdDev);
      const upperY = plotlyY.map(y => mean + stdDev);
      const lowerY = plotlyY.map(y => mean - stdDev);
      const filteredX = plotlyX.filter(item => item !== "");
      // Shared legend group name
      const legendGroupName = `${figureArguments[targetLineColumn + 'Title']} ±1 SD`;

      // Upper SD line
      const stdUpperLine = {
        x: filteredX,
        y: upperY,
        type: 'scatter',
        mode: 'lines',
        name: legendGroupName,
        legendgroup: legendGroupName,
        line: {
          dash: 'dash',
          color: figureArguments[targetLineColumn + 'StdDevColor']
        },
        hoverinfo: 'skip',
        showlegend: showLegendBool,
        // only the first one shows in legend
        visible: true
      };

      // Lower SD line
      const stdLowerLine = {
        x: filteredX,
        y: lowerY,
        type: 'scatter',
        mode: 'lines',
        name: legendGroupName,
        // same name, but hidden in legend
        legendgroup: legendGroupName,
        line: {
          dash: 'dash',
          color: figureArguments[targetLineColumn + 'StdDevColor']
        },
        hoverinfo: 'skip',
        showlegend: false,
        // hides duplicate legend entry
        visible: true
      };

      // Push both to plot
      allLinesPlotly.push(stdUpperLine, stdLowerLine);
    }
    //Standard Deviation (values imported from spreadsheet per point in dataset)
    //Do we want high and low bounds here?
    if (showSD == 'on' && showSD_InputValuesOpt != 'auto') {
      const stdSingleValue = dataToBePlotted[showSD_InputValuesOpt].filter(item => item !== "NA").reduce((a, b) => a + b, 0) / dataToBePlotted[showSD_InputValuesOpt].length;
      //console.log('stdSingleValue', stdSingleValue);
      const plotlyYSanitized = plotlyY.map(val => {
        if (val === null || val === undefined || val === "" || typeof val === "string" && val.trim().toUpperCase() === "NA" || isNaN(val)) {
          return 0;
        }
        return parseFloat(val);
      });
      let plotlyYSafeArrayLength = plotlyY.filter(value => value !== null && value !== "NA").length;
      const mean = plotlyYSanitized.reduce((a, b) => a + b, 0) / plotlyYSafeArrayLength;
      const upperY = plotlyY.map(y => mean + stdSingleValue);
      const lowerY = plotlyY.map(y => mean - stdSingleValue);
      const filteredX = plotlyX.filter(item => item !== "");
      // Shared legend group name
      const legendGroupName = `${figureArguments[targetLineColumn + 'Title']} ±1 SD`;

      // Upper SD line
      const stdUpperLine = {
        x: filteredX,
        y: upperY,
        type: 'scatter',
        mode: 'lines',
        name: legendGroupName,
        legendgroup: legendGroupName,
        line: {
          dash: 'dash',
          color: figureArguments[targetLineColumn + 'StdDevColor']
        },
        hoverinfo: 'skip',
        showlegend: showLegendBool,
        // only the first one shows in legend
        visible: true
      };

      // Lower SD line
      const stdLowerLine = {
        x: filteredX,
        y: lowerY,
        type: 'scatter',
        mode: 'lines',
        name: legendGroupName,
        // same name, but hidden in legend
        legendgroup: legendGroupName,
        line: {
          dash: 'dash',
          color: figureArguments[targetLineColumn + 'StdDevColor']
        },
        hoverinfo: 'skip',
        showlegend: false,
        // hides duplicate legend entry
        visible: true
      };

      // Push both to plot
      allLinesPlotly.push(stdUpperLine, stdLowerLine);
    }

    //Percentiles and Mean lines
    const showPercentiles = figureArguments[targetLineColumn + 'Percentiles'];
    const showMean = figureArguments[targetLineColumn + 'Mean'];
    const showMean_ValuesOpt = figureArguments[targetLineColumn + 'MeanField'];
    if (showPercentiles === 'on' || showMean === 'on') {
      //Calculate Percentiles (Auto Calculated) based on dataset Y-axis values
      //Do we want to be able to set high and low bounds per point here? (That wouldn't make sense to me)
      const p10 = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.computePercentile)(plotlyY, 10);
      const p90 = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.computePercentile)(plotlyY, 90);
      const filteredX = plotlyX.filter(item => item !== "");
      const xMinPercentile = Math.min(...filteredX);
      const xMaxPercentile = Math.max(...filteredX);
      if (showPercentiles === 'on') {
        allLinesPlotly.push({
          x: [xMinPercentile, xMaxPercentile],
          y: [p10, p10],
          mode: 'lines',
          line: {
            dash: 'dot',
            color: figureArguments[targetLineColumn + 'Color'] + '60'
          },
          name: `${figureArguments[targetLineColumn + 'Title']} 10th Percentile (Bottom)`,
          type: 'scatter',
          visible: true,
          showlegend: false
        });
        allLinesPlotly.push({
          x: [xMinPercentile, xMaxPercentile],
          y: [p90, p90],
          mode: 'lines',
          line: {
            dash: 'dot',
            color: figureArguments[targetLineColumn + 'Color'] + '60'
          },
          name: `${figureArguments[targetLineColumn + 'Title']} 10th & 90th Percentile`,
          type: 'scatter',
          visible: true,
          showlegend: showLegendBool
        });
      }

      // Calculate mean

      //Calculate mean (Auto Calculated) based on dataset Y-axis values
      if (showMean_ValuesOpt === 'auto' && showMean === 'on') {
        let plotlyYSafeArray = plotlyY.map(value => value === "NA" ? 0 : value);
        let plotlyYSafeArrayLength = plotlyY.filter(value => value !== null && value !== "NA").length;
        const mean = plotlyYSafeArray.reduce((a, b) => a + b, 0) / plotlyYSafeArrayLength;
        //console.log('mean', mean);
        //console.log('plotlyY', plotlyY);
        const filteredX = plotlyX.filter(item => item !== "");
        //console.log('filteredX', filteredX);

        let xMin;
        let xMax;
        xMin = Math.min(...filteredX);
        xMax = Math.max(...filteredX);
        if (isNaN(xMin) || isNaN(xMax)) {
          xMin = new Date(filteredX[0]);
          xMax = new Date(filteredX[filteredX.length - 1]);
        }
        allLinesPlotly.push({
          x: [xMin, xMax],
          y: [mean, mean],
          mode: 'lines',
          line: {
            dash: 'solid',
            color: figureArguments[targetLineColumn + 'Color'] + '60'
          },
          name: `${figureArguments[targetLineColumn + 'Title']} Mean`,
          type: 'scatter',
          visible: true,
          showlegend: showLegendBool
        });
      }
      //Get mean from the spreadsheet (values imported from spreadsheet per point in dataset)
      if (showMean_ValuesOpt != 'auto' && showMean === 'on') {
        const ExistingMeanValue = dataToBePlotted[showMean_ValuesOpt].filter(item => item !== "");
        const mean = ExistingMeanValue.reduce((a, b) => a + b, 0) / ExistingMeanValue.length;
        const filteredX = plotlyX.filter(item => item !== "");
        let xMin;
        let xMax;
        xMin = Math.min(...filteredX);
        xMax = Math.max(...filteredX);
        if (isNaN(xMin) || isNaN(xMax)) {
          xMin = new Date(filteredX[0]);
          xMax = new Date(filteredX[filteredX.length - 1]);
        }
        allLinesPlotly.push({
          x: [xMin, xMax],
          y: [mean, mean],
          mode: 'lines',
          line: {
            dash: 'solid',
            color: figureArguments[targetLineColumn + 'Color'] + '60'
          },
          name: `${figureArguments[targetLineColumn + 'Title']} Mean`,
          type: 'scatter',
          visible: true,
          showlegend: showLegendBool
        });
      }
    }
  }

  //const container = document.getElementById(plotlyDivID); 

  //GRAPH DISPLAY SETTINGS
  var layout = {
    xaxis: {
      title: {
        text: figureArguments['XAxisTitle']
      },
      linecolor: 'black',
      linewidth: 1,
      range: [figureArguments['XAxisLowBound'], figureArguments['XAxisHighBound']],
      tickmode: graphTickModeBool,
      ticks: graphTickPositionBool,
      showgrid: showGridBool
    },
    yaxis: {
      title: {
        text: figureArguments['YAxisTitle']
      },
      linecolor: 'black',
      linewidth: 1,
      range: [figureArguments['YAxisLowBound'], figureArguments['YAxisHighBound']],
      tickmode: graphTickModeBool,
      ticks: graphTickPositionBool,
      showgrid: showGridBool
    },
    legend: {
      orientation: 'h',
      // horizontal layout
      y: 1.1,
      // position legend above the plot
      x: 0.5,
      // center the legend
      xanchor: 'center',
      yanchor: 'bottom'
    },
    autosize: true,
    margin: {
      t: 60,
      b: 60,
      l: 60,
      r: 60
    },
    hovermode: 'closest',
    //width: container.clientWidth, 
    //height: container.clientHeight,
    cliponaxis: true
  };
  const config = {
    responsive: true,
    // This makes the plot resize with the browser window
    renderer: 'svg',
    displayModeBar: true,
    displaylogo: false,
    modeBarButtonsToRemove: ['zoom2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian' //'toImage', 'resetScale2d', 'select2d'
    ]
  };

  // Set up the plotlyDiv (The div the the plot will be rendered in)
  //Important for blocks to work - We need one to work with the document from the block and one for the regular document the function normally runs in.
  let plotDiv;
  if (!targetDocument) {
    plotDiv = document.getElementById(plotlyDivID);
  }
  if (targetDocument) {
    plotDiv = renderDocument.getElementById(plotlyDivID);
  }
  plotDiv.style.setProperty("width", "100%", "important");
  plotDiv.style.setProperty("max-width", "none", "important");

  // Create the plot with all lines
  // await Plotly.newPlot(plotlyDivID, allLinesPlotly, layout, config);

  await Plotly.newPlot(plotDiv, allLinesPlotly, layout, config).then(() => {
    // After the plot is created, inject overlays if any, this is here because you can only get overlays that span the entire yaxis after the graph has been rendered.
    // You need the specific values for the entire yaxis
    injectOverlays(plotDiv, layout, allLinesPlotly, figureArguments, dataToBePlotted);
  });
  Plotly.Plots.resize(plotDiv);
  if (window.location.href.includes('post.php')) {
    //Save the plotly figure as an html file. 
    const savedFigure = {
      data: plotDiv.data,
      layout: plotDiv.layout,
      config: {
        responsive: true
      }
    };
    const figureiframeGenerator = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.createFigureIframeHtml)(savedFigure, figureID, rootURL);
  }

  // if () {
  // 	document.querySelector('[data-depend-id="figure_preview"]').addEventListener('click', function() {
  // 		saveHtmlFileToServer(figureiframeGenerator.figIframeHtml, figureiframeGenerator.figIframeHtmlFileName, figureiframeGenerator.figIframeHtmlPath, postId);
  // 	});
  // }	

  //STANDALONE CODE TO INJECT INTO CODE BLOCK> WORKS INTERMITTENTLY
  // const snippet = buildPlotlySnippetEmbedCode(
  // 	savedFigure,
  // 	`plotly-snippet-${figureID}`
  // );

  // console.log("snippet", snippet);

  // } else {}

  // } catch (error) {
  //     console.error('Error loading scripts:', error);
  // }
}

/**
 * Loads and merges default interactive line arguments with the current arguments,
 * ensuring proper handling of line-specific keys and other configuration options.
 * Updates the value of the "figure_interactive_arguments" field and displays
 * the line fields accordingly.
 *
 * @function loadDefaultInteractiveLineArguments
 * @param {Object} jsonColumns - JSON object representing the columns of the line chart.
 *
 * @description
 * This function is designed to handle the merging of default and current arguments
 * for an interactive line chart. It ensures that line-specific keys are updated based
 * on the number of lines specified, while also preserving the original order of keys
 * in the current arguments. Non-line-specific keys are always updated with default values.
 * The merged arguments are written back to the "figure_interactive_arguments" field
 * as a JSON string and used to display the line fields.
 *
 * The function uses several helper functions:
 * - `safeParseJSON(s)`: Safely parses a JSON string, returning `null` if parsing fails.
 * - `pairsToObject(pairs)`: Converts an array of key-value pairs to an object.
 * - `kvStringToObject(str)`: Converts a key-value string to an object.
 * - `toObjectFlexible(s)`: Converts a string to an object, supporting JSON and key-value formats.
 * - `toPairsFlexible(s)`: Converts a string to an array of key-value pairs, supporting JSON and key-value formats.
 * - `objectToPairsPreserveOrder(obj, currentPairs)`: Converts an object to an array of key-value pairs,
 *    preserving the order of keys from the current pairs.
 *
 * @modifies
 * - Reads and updates the value of the "figure_interactive_arguments" field in the DOM.
 * - Reads the value of the "NumberOfLines" input field to determine the number of lines.
 * - Calls `displayLineFields` to update the line fields in the UI.
 *
 * @variables
 * - `field`: The DOM element representing the "figure_interactive_arguments" field.
 * - `currentStr`: The current value of the "figure_interactive_arguments" field.
 * - `defaultsStr`: The default arguments for the interactive line chart.
 * - `currentPairs`: The current arguments as an array of key-value pairs.
 * - `currentObj`: The current arguments as an object.
 * - `defaultsObj`: The default arguments as an object.
 * - `numEl`: The DOM element representing the "NumberOfLines" input field.
 * - `numberOfLines`: The number of lines specified in the "NumberOfLines" input field.
 * - `mergedPairs`: The merged arguments as an array of key-value pairs.
 * - `mergedPairs_string`: The merged arguments as a JSON string.
 *
 * @return {void}
 *
 * @example
 * // Assuming `argumentsDefaultsLine.interactive_line_arguments` contains default arguments
 * // and the "figure_interactive_arguments" field exists in the DOM:
 * loadDefaultInteractiveLineArguments(jsonColumns);
 *
 * @throws {Error} This function does not throw errors but may fail silently if
 * required DOM elements are not present.
 *
 * @global
 * - `argumentsDefaultsLine` (optional): A global object containing default arguments
 *   for the interactive line chart.
 */
function loadDefaultInteractiveLineArguments(jsonColumns) {
  // ---------- helpers ----------
  function safeParseJSON(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }
  function pairsToObject(pairs) {
    const o = {};
    if (Array.isArray(pairs)) {
      for (const p of pairs) {
        if (Array.isArray(p) && p.length >= 2) {
          o[String(p[0])] = String(p[1] ?? '');
        }
      }
    }
    return o;
  }
  function kvStringToObject(str) {
    const o = {};
    if (!str) {
      return o;
    }
    for (const part of str.split(/[;,]/)) {
      const [k, v] = part.split(/[:=]/).map(s => (s || '').trim());
      if (k) {
        o[k] = v ?? '';
      }
    }
    return o;
  }
  function toObjectFlexible(s) {
    if (!s) {
      return {};
    }
    const asJSON = safeParseJSON(s);
    if (asJSON && typeof asJSON === 'object') {
      return Array.isArray(asJSON) ? pairsToObject(asJSON) : asJSON;
    }
    return kvStringToObject(s);
  }
  function toPairsFlexible(s) {
    const asJSON = safeParseJSON(s);
    if (Array.isArray(asJSON)) {
      return asJSON;
    }
    const obj = toObjectFlexible(s);
    return Object.entries(obj).map(([k, v]) => [k, v]);
  }
  // preserve original order from currentPairs; append unseen keys at the end
  function objectToPairsPreserveOrder(obj, currentPairs) {
    const seen = new Set();
    const out = [];
    for (const [k] of currentPairs) {
      if (!seen.has(k) && k in obj) {
        out.push([k, String(obj[k] ?? '')]);
        seen.add(k);
      }
    }
    // append any remaining keys (e.g., required keys not in original)
    for (const k of Object.keys(obj)) {
      if (!seen.has(k)) {
        out.push([k, String(obj[k] ?? '')]);
      }
    }
    return out;
  }

  // ---------- main ----------
  // Use the passed interactive_arguments parameter (works in preview modal context
  // where the form field may not be in the document). Fall back to DOM read for
  // the settings-page context where the parameter is not passed.
  const field = document.getElementsByName('figure_interactive_arguments')[0];
  const currentStr = interactive_arguments || (field ? field.value : '') || '';
  console.log('[GD] currentStr length:', currentStr.length, 'preview:', currentStr.substring(0, 100));
  if (!currentStr) {
    console.log('[GD] EARLY RETURN — no currentStr');
    return;
  }
  const defaultsStr = _lineDefaults.interactive_line_arguments || '';

  // Parse both to objects and keep original pair order from current
  const currentPairs = toPairsFlexible(currentStr);
  const currentObj = toObjectFlexible(currentStr);
  const defaultsObj = toObjectFlexible(defaultsStr);

  // How many lines should be considered?
  const numEl = document.getElementById('NumberOfLines');
  const numberOfLines = numEl && numEl.value ? parseInt(numEl.value, 10) : 0;
  if (numberOfLines > 0) {
    currentObj.NumberOfLines = String(numberOfLines);
  }

  // Overwrite ONLY keys that:
  //  - start with Line1..Line{N}, AND
  //  - already exist in currentObj, AND
  //  - also exist in defaultsObj
  if (numberOfLines > 0) {
    const linePrefixes = Array.from({
      length: numberOfLines
    }, (_, i) => `Line${i + 1}`);
    for (const key of Object.keys(currentObj)) {
      const isWithinLines = linePrefixes.some(prefix => key.startsWith(prefix));
      if (isWithinLines && key in defaultsObj) {
        currentObj[key] = defaultsObj[key];
      }
    }
  }

  // Ensure/overwrite these non-line keys regardless of line count
  currentObj.showGrid = defaultsObj.showGrid ?? 'on';
  currentObj.graphTicks = defaultsObj.graphTicks ?? 'on';
  currentObj.XAxisFormat = defaultsObj.XAxisFormat ?? 'YYYY';

  // Convert back to array-of-pairs, preserving the original order from currentPairs
  const mergedPairs = objectToPairsPreserveOrder(currentObj, currentPairs);

  // Write back EXACTLY as array-of-pairs JSON
  const mergedPairs_string = JSON.stringify(mergedPairs);

  // console.log('interactive_arguments', currentStr);
  // console.log('default_interactive_line_arguments', defaultsStr);
  // console.log('mergedPairs_string', mergedPairs_string);

  document.getElementsByName('figure_interactive_arguments')[0].value = mergedPairs_string;
  displayLineFields(numberOfLines, jsonColumns, mergedPairs_string);
}

/**
 * Dynamically generates and appends form fields for configuring Plotly time series line chart parameters in the UI.
 *
 * This function creates a set of HTML form controls (checkboxes, text inputs, color pickers, and select dropdowns)
 * for customizing various aspects of a Plotly time series line chart, such as grid lines, axis titles, axis bounds,
 * number of lines, axis date format, and line-specific options (color, type, marker, error bars, standard deviation, mean, percentiles, legend, etc.).
 * The generated fields are appended to the element with ID 'graphGUI'.
 * The function also prepopulates field values using the provided interactive arguments and attaches event listeners
 * to update the underlying data model when fields are changed.
 *
 * @function plotlyLineParameterFields
 * @param {Object}        jsonColumns           - An object representing available data columns, where keys are column identifiers and values are column names.
 * @param {Object|string} interactive_arguments - An object or JSON string containing previously saved form field values, used to prepopulate the GUI fields.
 *
 * @description
 * The function performs the following steps:
 * 1. Creates a container div for the parameter fields.
 * 2. Adds checkboxes for toggling grid lines and graph ticks.
 * 3. Adds input fields for X and Y axis titles and their low/high bounds.
 * 4. Adds a select dropdown for the number of lines to be plotted (1–14).
 * 5. Adds a select dropdown for the X axis date format.
 * 6. Appends all generated fields to the 'graphGUI' element in the DOM.
 * 7. Calls `displayLineFields` to generate additional line-specific configuration fields based on the selected number of lines.
 * 8. Attaches event listeners to all fields to update the hidden input storing the configuration as a JSON string.
 *
 * @modifies
 * - Appends a new div with ID 'secondaryGraphFields' to the element with ID 'graphGUI'.
 * - Updates the value of the hidden input field named 'figure_interactive_arguments' when any field is changed.
 * - Calls `displayLineFields` to update line-specific fields dynamically.
 *
 * @requires
 * - fillFormFieldValues: Function to retrieve saved values for form fields.
 * - logFormFieldValues: Function to update the hidden input with current form values.
 * - displayLineFields: Function to generate line-specific configuration fields.
 *
 * @listens change - Updates the hidden input and UI when any field is changed.
 *
 * @example
 * // Example usage:
 * const jsonColumns = { col1: "Column 1", col2: "Column 2" };
 * const interactive_arguments = { XAxisTitle: "Year", NumberOfLines: 2 };
 * plotlyLineParameterFields(jsonColumns, interactive_arguments);
 *
 * @global
 * - Assumes the existence of a DOM element with ID 'graphGUI'.
 * - Assumes the existence of a hidden input named 'figure_interactive_arguments'.
 */
function plotlyLineParameterFields(jsonColumns, interactive_arguments) {
  let newDiv = document.createElement("div");
  newDiv.id = 'secondaryGraphFields';
  const targetElement = document.getElementById('graphGUI');
  let newRow;
  let newColumn1;
  let newColumn2;

  //Add checkboxes for showgrid and graphTicks
  const features = ["showGrid", "graphTicks"];
  const featureNames = ["Show X&Y Lines on Grid", "Remove Outside Graph Ticks"];
  for (let i = 0; i < features.length; i++) {
    const feature = features[i];
    const featureName = featureNames[i];
    let newRow = document.createElement("div");
    newRow.classList.add("row", "fieldPadding");
    let newColumn1 = document.createElement("div");
    newColumn1.classList.add("col-3");
    let newColumn2 = document.createElement("div");
    newColumn2.classList.add("col");
    let label = document.createElement("label");
    label.for = feature;
    label.innerHTML = `${featureName}`;
    let checkbox = document.createElement("input");
    checkbox.type = "checkbox";
    checkbox.id = feature;
    checkbox.name = "plotFields";
    let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkbox.id, interactive_arguments);
    checkbox.value = fieldValueSaved === 'on' ? 'on' : "";
    checkbox.checked = fieldValueSaved === 'on';

    // Toggle visibility dynamically
    checkbox.addEventListener('change', function () {
      checkbox.value = checkbox.checked ? 'on' : "";
      (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
    });
    newColumn1.appendChild(label);
    newColumn2.appendChild(checkbox);
    newRow.append(newColumn1, newColumn2);
    newDiv.append(newRow);
    newRow.style.display = "none";
  }

  // Create input fields for X and Y Axis Titles
  const axisTitleArray = ["X", "Y"];
  axisTitleArray.forEach(axisTitle => {
    newRow = document.createElement("div");
    newRow.classList.add("row", "fieldPadding");
    newColumn1 = document.createElement("div");
    newColumn1.classList.add("col-3");
    newColumn2 = document.createElement("div");
    newColumn2.classList.add("col");
    let labelInputAxisTitle = document.createElement("label");
    labelInputAxisTitle.for = axisTitle + "AxisTitle";
    labelInputAxisTitle.innerHTML = axisTitle + " Axis Title";
    let inputAxisTitle = document.createElement("input");
    inputAxisTitle.id = axisTitle + "AxisTitle";
    inputAxisTitle.name = "plotFields";
    inputAxisTitle.size = "70";
    let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputAxisTitle.id, interactive_arguments);
    if (fieldValueSaved != undefined) {
      inputAxisTitle.value = fieldValueSaved;
    }
    inputAxisTitle.addEventListener('change', function () {
      (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
    });
    newColumn1.appendChild(labelInputAxisTitle);
    newColumn2.appendChild(inputAxisTitle);
    newRow.append(newColumn1, newColumn2);
    newDiv.append(newRow);
    const rangeBound = ["Low", "High"];
    rangeBound.forEach(bound => {
      newRow = document.createElement("div");
      newRow.classList.add("row", "fieldPadding");
      newColumn1 = document.createElement("div");
      newColumn1.classList.add("col-3");
      newColumn2 = document.createElement("div");
      newColumn2.classList.add("col");
      let labelBound = document.createElement("label");
      labelBound.for = axisTitle + bound + "Bound";
      labelBound.innerHTML = axisTitle + " Axis, " + bound + " Bound";
      let inputBound = document.createElement("input");
      inputBound.id = axisTitle + "Axis" + bound + "Bound";
      inputBound.name = "plotFields";
      inputBound.type = "number";
      fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputBound.id, interactive_arguments);
      if (fieldValueSaved != undefined) {
        inputBound.value = fieldValueSaved;
      }
      inputBound.addEventListener('change', function () {
        (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
      });
      newColumn1.appendChild(labelBound);
      newColumn2.appendChild(inputBound);
      newRow.append(newColumn1, newColumn2);
      newDiv.append(newRow);
    });
  });

  // Create select field for number of lines to be plotted
  let labelSelectNumberLines = document.createElement("label");
  labelSelectNumberLines.for = "NumberOfLines";
  labelSelectNumberLines.innerHTML = "Number of Lines to Be Plotted";
  let selectNumberLines = document.createElement("select");
  selectNumberLines.id = "NumberOfLines";
  selectNumberLines.name = "plotFields";
  selectNumberLines.addEventListener('change', function () {
    displayLineFields(selectNumberLines.value, jsonColumns, interactive_arguments);
  });
  selectNumberLines.addEventListener('change', function () {
    (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
  });
  for (let i = 1; i < 15; i++) {
    let selectNumberLinesOption = document.createElement("option");
    selectNumberLinesOption.value = i;
    selectNumberLinesOption.innerHTML = i;
    selectNumberLines.appendChild(selectNumberLinesOption);
  }
  let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectNumberLines.id, interactive_arguments);
  if (fieldValueSaved != undefined) {
    selectNumberLines.value = fieldValueSaved;
  }
  newRow = document.createElement("div");
  newRow.classList.add("row", "fieldPadding");
  newColumn1 = document.createElement("div");
  newColumn1.classList.add("col-3");
  newColumn2 = document.createElement("div");
  newColumn2.classList.add("col");
  newColumn1.appendChild(labelSelectNumberLines);
  newColumn2.appendChild(selectNumberLines);
  newRow.append(newColumn1, newColumn2);
  newDiv.append(newRow);

  //X Axis Date Format
  let labelSelectXAxisFormat = document.createElement("label");
  labelSelectXAxisFormat.for = "XAxisFormat";
  labelSelectXAxisFormat.innerHTML = "X Axis Date Format";
  let selectXAxisFormat = document.createElement("select");
  selectXAxisFormat.id = "XAxisFormat";
  selectXAxisFormat.name = "plotFields";
  selectXAxisFormat.addEventListener('change', function () {
    (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
  });
  const dateFormats = ["None", "YYYY", "YYYY-MM", "YYYY-MM-DD"];
  dateFormats.forEach(dateFormat => {
    let selectXAxisFormatOption = document.createElement("option");
    selectXAxisFormatOption.value = dateFormat;
    selectXAxisFormatOption.innerHTML = dateFormat;
    selectXAxisFormat.appendChild(selectXAxisFormatOption);
  });
  fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectXAxisFormat.id, interactive_arguments);
  if (fieldValueSaved != undefined) {
    selectXAxisFormat.value = fieldValueSaved;
  }
  newRow = document.createElement("div");
  newRow.classList.add("row", "fieldPadding");
  newColumn1 = document.createElement("div");
  newColumn1.classList.add("col-3");
  newColumn2 = document.createElement("div");
  newColumn2.classList.add("col");
  newColumn1.appendChild(labelSelectXAxisFormat);
  newColumn2.appendChild(selectXAxisFormat);
  newRow.append(newColumn1, newColumn2);
  newDiv.append(newRow);
  let newHR = document.createElement("hr");
  newHR.style = "margin-top:15px";
  newDiv.append(newHR);
  targetElement.appendChild(newDiv);

  // Run display line fields
  displayLineFields(selectNumberLines.value, jsonColumns, interactive_arguments);
}

/**
 * Dynamically generates and appends form fields for configuring line-specific and overlay parameters
 * for a Plotly time series line chart in the UI.
 *
 * This function creates a set of HTML form controls for each line to be plotted, including dropdowns for
 * selecting data columns, line and marker styles, and checkboxes for enabling features such as legend display,
 * connecting gaps, mean lines, standard deviation fills, error bars, and percentile lines. It also generates
 * controls for overlays such as evaluation periods and event markers, including their specific configuration fields.
 * The generated fields are appended to the element with ID 'graphGUI'.
 * The function prepopulates field values using the provided interactive arguments and attaches event listeners
 * to update the underlying data model when fields are changed.
 *
 * @function displayLineFields
 * @param {number}        numLines              - The number of lines to generate configuration fields for.
 * @param {Object}        jsonColumns           - An object representing available data columns, where keys are column identifiers and values are column names.
 * @param {Object|string} interactive_arguments - An object or JSON string containing previously saved form field values, used to prepopulate the GUI fields.
 *
 * @description
 * The function performs the following steps:
 * 1. Removes any existing line assignment container from the DOM.
 * 2. For each line, generates dropdowns for selecting the data column, line title, color, line type, marker type, and marker size.
 * 3. Adds checkboxes for enabling/disabling legend, connecting gaps, mean line, standard deviation fill, error bars, and percentile lines.
 * 4. For features that require additional configuration (mean, error bars, standard deviation), generates dropdowns for selecting the source column and color pickers.
 * 5. Generates controls for overlays, including evaluation period and event markers, with their own configuration fields (dates, colors, labels, axis, etc.).
 * 6. Adds a button to apply default line styles to all lines.
 * 7. Appends all generated fields to the 'graphGUI' element in the DOM.
 * 8. Prepopulates all fields using the provided interactive arguments and attaches event listeners to update the hidden input storing the configuration as a JSON string.
 *
 * @modifies
 * - Appends a new div with ID 'assignColumnsToPlot' to the element with ID 'graphGUI'.
 * - Updates the value of the hidden input field named 'figure_interactive_arguments' when any field is changed.
 *
 * @requires
 * - fillFormFieldValues: Function to retrieve saved values for form fields.
 * - logFormFieldValues: Function to update the hidden input with current form values.
 * - loadDefaultInteractiveLineArguments: Function to apply default line styles.
 *
 * @listens change - Updates the hidden input and UI when any field is changed.
 *
 * @example
 * // Example usage:
 * const jsonColumns = { col1: "Column 1", col2: "Column 2" };
 * const interactive_arguments = { XAxisTitle: "Year", NumberOfLines: 2 };
 * displayLineFields(2, jsonColumns, interactive_arguments);
 *
 * @global
 * - Assumes the existence of a DOM element with ID 'graphGUI'.
 * - Assumes the existence of a hidden input named 'figure_interactive_arguments'.
 */
function displayLineFields(numLines, jsonColumns, interactive_arguments) {
  const assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
  // If the element exists
  if (assignColumnsToPlot) {
    // Remove the scene window
    assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
  }
  if (numLines > 0) {
    const newDiv = document.createElement('div');
    newDiv.id = 'assignColumnsToPlot';

    //"EvaluationPeriod" & "EventMarkers"
    const features = ['EvaluationPeriod', 'EventMarkers'];
    const featureNames = ['Evaluation Period', 'Event Markers'];
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      const featureName = featureNames[i];
      const newRow = document.createElement('div');
      newRow.classList.add('row', 'fieldPadding');
      const newColumn1 = document.createElement('div');
      newColumn1.classList.add('col-3');
      const newColumn2 = document.createElement('div');
      newColumn2.classList.add('col');
      const label = document.createElement('label');
      label.for = feature;
      label.innerHTML = `${featureName}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = feature;
      checkbox.name = 'plotFields';
      const fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkbox.id, interactive_arguments);
      checkbox.value = fieldValueSaved === 'on' ? 'on' : '';
      checkbox.checked = fieldValueSaved === 'on';
      newColumn1.appendChild(label);
      newColumn2.appendChild(checkbox);
      newRow.append(newColumn1, newColumn2);
      newRow.style.marginTop = '20px';
      newRow.style.marginBottom = '20px';
      newDiv.append(newRow);

      // === Add dropdowns for feature-specific data ===
      if (['EvaluationPeriod', 'EventMarkers'].includes(feature)) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('row', 'fieldPadding');
        const dropdownLabelCol = document.createElement('div');
        dropdownLabelCol.classList.add('col-3');
        const dropdownInputCol = document.createElement('div');
        dropdownInputCol.classList.add('col');
        function createDropdown(labelText, selectId) {
          const label = document.createElement('label');
          label.innerHTML = labelText;
          const select = document.createElement('select');
          select.id = selectId;
          select.name = 'plotFields';
          if (feature === 'EventMarkers') {
            for (const col of [1, 2, 3, 4, 5, 6]) {
              const opt = document.createElement('option');
              opt.value = col;
              opt.innerHTML = col;
              select.appendChild(opt);
            }
            const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(select.id, interactive_arguments);
            if (saved) {
              select.value = saved;
            }
            select.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
            return {
              label,
              select
            };
          }
        }
        function createDatefield(labelText, inputId) {
          const label = document.createElement('label');
          label.textContent = labelText;
          label.htmlFor = inputId; // Link label to input

          const input = document.createElement('input'); // Correct element
          input.type = 'date';
          input.id = inputId;
          input.name = 'plotFields';
          const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
          if (saved) {
            input.value = saved;
          }
          input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
          return {
            label,
            input
          };
        }
        function createTextfield(labelText, inputId) {
          const label = document.createElement('label');
          label.textContent = labelText;
          label.htmlFor = inputId; // Link label to input

          const input = document.createElement('input'); // Correct element
          input.type = 'text';
          input.id = inputId;
          input.name = 'plotFields';
          input.style.width = '200px';
          const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
          if (saved) {
            input.value = saved;
          }
          input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
          return {
            label,
            input
          };
        }
        function createColorfield(labelText, inputId) {
          const label = document.createElement('label');
          label.textContent = labelText;
          label.htmlFor = inputId; // Link label to input

          const input = document.createElement('input'); // Correct element
          input.type = 'color';
          input.id = inputId;
          input.name = 'plotFields';
          const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
          if (saved) {
            input.value = saved;
          }
          input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
          return {
            label,
            input
          };
        }
        const controls = [];
        if (feature === 'EvaluationPeriod') {
          const {
            label: labelStartDate,
            input: StartDateValues
          } = createDatefield(`Start Date`, feature + 'StartDate');
          const {
            label: labelEndDate,
            input: EndDateValues
          } = createDatefield('End Date', feature + 'EndDate');
          const {
            label: labelColor,
            input: ColorValue
          } = createColorfield(`Fill Color`, feature + 'FillColor');
          const {
            label: textLabel,
            input: textInput
          } = createTextfield(`Display Text`, feature + 'Text');
          controls.push(labelStartDate, document.createElement('br'), StartDateValues, document.createElement('br'), document.createElement('br'), labelEndDate, document.createElement('br'), EndDateValues, document.createElement('br'), document.createElement('br'), labelColor, document.createElement('br'), ColorValue, document.createElement('br'), document.createElement('br'), textLabel, document.createElement('br'), textInput, document.createElement('br'));
        }
        if (feature === 'EventMarkers') {
          const {
            label,
            select
          } = createDropdown('Number of Event Markers', feature + 'Field');
          controls.push(label, select);

          // A wrapper that we'll (re)fill with the N sets of fields
          const wrapper = document.createElement('div');
          wrapper.id = feature + 'FieldsWrapper';
          controls.push(wrapper);
          const renderEventMarkerFields = n => {
            wrapper.innerHTML = ''; // Clear previous

            for (let i = 0; i < n; i++) {
              // === Axis Selector ===
              const axisLabel = document.createElement('label');
              axisLabel.textContent = `Event Marker Axis ${i + 1}`;
              const axisSelect = document.createElement('select');
              axisSelect.id = `${feature}EventAxis${i}`;
              axisSelect.name = 'plotFields';
              ['x', 'y'].forEach(axis => {
                const opt = document.createElement('option');
                opt.value = axis;
                opt.textContent = axis.toUpperCase() + ' Axis';
                axisSelect.appendChild(opt);
              });
              const savedAxis = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(axisSelect.id, interactive_arguments);
              if (savedAxis) {
                axisSelect.value = savedAxis;
              }

              // === Shared Inputs ===
              const {
                label: textLabel,
                input: textInput
              } = createTextfield(`Display Text ${i + 1}`, `${feature}EventText${i}`);
              const {
                label: colorLabel,
                input: colorInput
              } = createColorfield(`Line Color ${i + 1}`, `${feature}EventColor${i}`);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(textInput.id, interactive_arguments);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(colorInput.id, interactive_arguments);

              // === X-axis Fields ===
              const xWrapper = document.createElement('div');
              const {
                label: dateLabel,
                input: dateInput
              } = createDatefield(`Event Date ${i + 1} (X-Axis)`, `${feature}EventDate${i}`);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(dateInput.id, interactive_arguments);
              xWrapper.append(dateLabel, document.createElement('br'), dateInput, document.createElement('br'));

              // === Y-axis Fields ===
              const yWrapper = document.createElement('div');
              const {
                label: yLabel,
                input: yInput
              } = createTextfield(`Event Y Value ${i + 1}`, `${feature}EventYValue${i}`);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(yInput.id, interactive_arguments);
              yWrapper.append(yLabel, document.createElement('br'), yInput, document.createElement('br'));

              // === Container & Toggle Logic ===
              const block = document.createElement('div');
              block.append(document.createElement('hr'), axisLabel, document.createElement('br'), axisSelect, document.createElement('br'), document.createElement('br'), xWrapper, yWrapper, document.createElement('br'), textLabel, document.createElement('br'), textInput, document.createElement('br'), document.createElement('br'), colorLabel, document.createElement('br'), colorInput, document.createElement('br'));

              // Handle visibility
              const toggleAxisFields = val => {
                xWrapper.style.display = val === 'x' ? 'block' : 'none';
                yWrapper.style.display = val === 'y' ? 'block' : 'none';
              };
              toggleAxisFields(axisSelect.value); // Initial state
              axisSelect.addEventListener('change', e => {
                toggleAxisFields(e.target.value);
                (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
              });
              wrapper.appendChild(block);
            }
          };

          // Initial render using saved or current value
          const initialN = parseInt(select.value, 10) || 0;
          renderEventMarkerFields(initialN);

          // Re-render on change
          select.addEventListener('change', e => {
            const n = parseInt(e.target.value, 10) || 0;
            renderEventMarkerFields(n);
          });
        }

        // Initially hide the dropdown container
        dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
        controls.forEach(control => dropdownInputCol.appendChild(control));
        dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
        newDiv.append(dropdownContainer);

        // Toggle visibility dynamically
        checkbox.addEventListener('change', function () {
          checkbox.value = checkbox.checked ? 'on' : '';
          dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
      } else {
        checkbox.addEventListener('change', function () {
          checkbox.value = checkbox.checked ? 'on' : '';
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
      }
    }
    const newHR = document.createElement('hr');
    newHR.style = 'margin-top:15px';
    newDiv.append(newHR);

    // Create the button for default styles
    const labelApplyDefaults = document.createElement('label');
    labelApplyDefaults.for = 'ApplyLineDefaults';
    labelApplyDefaults.innerHTML = 'Apply Custom Line Styles to All Lines';
    const btnApplyDefaults = document.createElement('button');
    btnApplyDefaults.id = 'ApplyLineDefaults';
    btnApplyDefaults.type = 'button'; // prevent accidental form submit
    btnApplyDefaults.classList.add('button', 'button-primary'); // WP admin button style
    btnApplyDefaults.innerHTML = 'Click to Apply Styles';

    // Add event listener
    btnApplyDefaults.addEventListener('click', function () {
      // Call your function here
      loadDefaultInteractiveLineArguments(jsonColumns, interactive_arguments);
    });

    // Wrap in row/col just like your select
    const newRowBtn = document.createElement('div');
    newRowBtn.classList.add('row', 'fieldPadding');
    const newColumn1Btn = document.createElement('div');
    newColumn1Btn.classList.add('col-3');
    const newColumn2Btn = document.createElement('div');
    newColumn2Btn.classList.add('col');
    newColumn1Btn.appendChild(labelApplyDefaults);
    newColumn2Btn.appendChild(btnApplyDefaults);
    newRowBtn.append(newColumn1Btn, newColumn2Btn);
    newDiv.append(newRowBtn);
    const fieldLabels = [['XAxis', 'X Axis Column']];
    for (let i = 1; i <= numLines; i++) {
      fieldLabels.push(['Line' + i, 'Line ' + i + ' Column']);
    }
    fieldLabels.forEach(fieldLabel => {
      //Select the data source from dropdown menu
      const labelSelectColumn = document.createElement('label');
      labelSelectColumn.for = fieldLabel[0];
      labelSelectColumn.innerHTML = fieldLabel[1];
      const selectColumn = document.createElement('select');
      selectColumn.id = fieldLabel[0];
      selectColumn.name = 'plotFields';
      selectColumn.addEventListener('change', function () {
        (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
      });
      let selectColumnOption = document.createElement('option');
      selectColumnOption.value = 'None';
      selectColumnOption.innerHTML = 'None';
      selectColumn.appendChild(selectColumnOption);
      Object.entries(jsonColumns).forEach(([jsonColumnsKey, jsonColumnsValue]) => {
        selectColumnOption = document.createElement('option');
        selectColumnOption.value = jsonColumnsValue; // jsonColumnsKey;
        selectColumnOption.innerHTML = jsonColumnsValue;
        selectColumn.appendChild(selectColumnOption);
      });
      let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectColumn.id, interactive_arguments);
      if (fieldValueSaved != undefined) {
        selectColumn.value = fieldValueSaved;
      }
      let newRow = document.createElement('div');
      newRow.classList.add('row', 'fieldPadding');
      let fieldLabelNumber = '';
      if (fieldLabel[0] != 'XAxis') {
        fieldLabelNumber = parseInt(fieldLabel[0].slice(-1));
        if (fieldLabelNumber % 2 != 0) {
          newRow.classList.add('row', 'fieldBackgroundColor');
        }
      }
      let newColumn1 = document.createElement('div');
      newColumn1.classList.add('col-3');
      let newColumn2 = document.createElement('div');
      newColumn2.classList.add('col');
      newColumn1.appendChild(labelSelectColumn);
      newColumn2.appendChild(selectColumn);
      newRow.append(newColumn1, newColumn2);
      newDiv.append(newRow);

      // Add line label and color fields, line type, marker type, and marker size
      if (fieldLabel[0] != 'XAxis') {
        // Add line label field
        newRow = document.createElement('div');
        newRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          newRow.classList.add('row', 'fieldBackgroundColor');
        }
        newColumn1 = document.createElement('div');
        newColumn1.classList.add('col-3');
        newColumn2 = document.createElement('div');
        newColumn2.classList.add('col');
        const labelInputTitle = document.createElement('label');
        labelInputTitle.for = fieldLabel[0] + 'Title';
        labelInputTitle.innerHTML = fieldLabel[1] + ' Title';
        const inputTitle = document.createElement('input');
        inputTitle.id = fieldLabel[0] + 'Title';
        inputTitle.size = '70';
        inputTitle.name = 'plotFields';
        inputTitle.addEventListener('change', function () {
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
        fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputTitle.id, interactive_arguments);
        if (fieldValueSaved != undefined) {
          inputTitle.value = fieldValueSaved;
        }
        if (fieldValueSaved === undefined) {
          // Make each line's default title set to the name of the column name that is selected for that line. Only if the line title is not already set.
          //const DropdownValueSaved = fillFormFieldValues(selectColumn.id, interactive_arguments);
          if (fieldLabel[0].includes('Line')) {
            selectColumn.addEventListener('change', function () {
              DropdownValueSaved = selectColumn.value;
              if (DropdownValueSaved != 'None' && fieldValueSaved === undefined) {
                //console.log('fieldValueSaved2', fieldValueSaved);
                inputTitle.value = DropdownValueSaved;
                //console.log('DropdownValueSaved2', DropdownValueSaved);
              }
            });
          }
        }
        newColumn1.appendChild(labelInputTitle);
        newColumn2.appendChild(inputTitle);
        newRow.append(newColumn1, newColumn2);
        newDiv.append(newRow);

        // Add color field
        newRow = document.createElement('div');
        newRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          newRow.classList.add('row', 'fieldBackgroundColor');
        }
        newColumn1 = document.createElement('div');
        newColumn1.classList.add('col-3');
        newColumn2 = document.createElement('div');
        newColumn2.classList.add('col');
        const labelInputColor = document.createElement('label');
        labelInputColor.for = fieldLabel[0] + 'Color';
        labelInputColor.innerHTML = fieldLabel[1] + ' Color';
        const inputColor = document.createElement('input');
        inputColor.id = fieldLabel[0] + 'Color';
        inputColor.name = 'plotFields';
        inputColor.type = 'color';
        fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputColor.id, interactive_arguments);
        if (fieldValueSaved != undefined) {
          inputColor.value = fieldValueSaved;
        }
        inputColor.addEventListener('change', function () {
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
        newColumn1.appendChild(labelInputColor);
        newColumn2.appendChild(inputColor);
        newRow.append(newColumn1, newColumn2);
        newDiv.append(newRow);

        // Add lineType type dropdown
        const lineTypeRow = document.createElement('div');
        lineTypeRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          lineTypeRow.classList.add('fieldBackgroundColor');
        }
        const lineTypeCol1 = document.createElement('div');
        lineTypeCol1.classList.add('col-3');
        const lineTypeCol2 = document.createElement('div');
        lineTypeCol2.classList.add('col');
        const lineTypeLabel = document.createElement('label');
        lineTypeLabel.textContent = fieldLabel[1] + ' Line Type';
        lineTypeLabel.htmlFor = fieldLabel[0] + 'LineType';
        const lineTypeSelect = document.createElement('select');
        lineTypeSelect.id = fieldLabel[0] + 'LineType';
        lineTypeSelect.name = 'plotFields';

        //line types
        ['solid', 'dash', 'dot', 'dashdot', 'longdash', 'longdashdot'].forEach(type => {
          const opt = document.createElement('option');
          opt.value = type;
          opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
          lineTypeSelect.appendChild(opt);
        });
        const lineTypeSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(lineTypeSelect.id, interactive_arguments);
        if (lineTypeSaved) {
          lineTypeSelect.value = lineTypeSaved;
        }
        lineTypeSelect.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
        lineTypeCol1.appendChild(lineTypeLabel);
        lineTypeCol2.appendChild(lineTypeSelect);
        lineTypeRow.append(lineTypeCol1, lineTypeCol2);
        newDiv.append(lineTypeRow);

        // Add marker type dropdown
        const markerRow = document.createElement('div');
        markerRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          markerRow.classList.add('fieldBackgroundColor');
        }
        const markerCol1 = document.createElement('div');
        markerCol1.classList.add('col-3');
        const markerCol2 = document.createElement('div');
        markerCol2.classList.add('col');
        const markerLabel = document.createElement('label');
        markerLabel.textContent = fieldLabel[1] + ' Marker Type';
        markerLabel.htmlFor = fieldLabel[0] + 'MarkerType';
        const markerSelect = document.createElement('select');
        markerSelect.id = fieldLabel[0] + 'MarkerType';
        markerSelect.name = 'plotFields';
        ['circle', 'square', 'diamond', 'x', 'triangle-up', 'triangle-down', 'pentagon', 'hexagon', 'star', 'hourglass', 'bowtie', 'cross'].forEach(type => {
          const opt = document.createElement('option');
          opt.value = type;
          opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
          markerSelect.appendChild(opt);
        });
        const markerSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(markerSelect.id, interactive_arguments);
        if (markerSaved) {
          markerSelect.value = markerSaved;
        }
        markerSelect.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
        markerCol1.appendChild(markerLabel);
        markerCol2.appendChild(markerSelect);
        markerRow.append(markerCol1, markerCol2);
        newDiv.append(markerRow);

        // Add markerSize type dropdown
        const markerSizeRow = document.createElement('div');
        markerSizeRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          markerSizeRow.classList.add('fieldBackgroundColor');
        }
        const markerSizeCol1 = document.createElement('div');
        markerSizeCol1.classList.add('col-3');
        const markerSizeCol2 = document.createElement('div');
        markerSizeCol2.classList.add('col');
        const markerSizeLabel = document.createElement('label');
        markerSizeLabel.textContent = fieldLabel[1] + ' Marker Size';
        markerSizeLabel.htmlFor = fieldLabel[0] + 'MarkerSize';
        const markerSizeSelect = document.createElement('select');
        markerSizeSelect.id = fieldLabel[0] + 'MarkerSize';
        markerSizeSelect.name = 'plotFields';

        // Sizes 1 through 20
        [0, 1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20].forEach(size => {
          const opt = document.createElement('option');
          opt.value = size;
          opt.innerHTML = size + ' px';
          markerSizeSelect.appendChild(opt);
        });
        markerSizeSelect.value = 10;
        const markerSizeSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(markerSizeSelect.id, interactive_arguments);
        if (markerSizeSaved) {
          markerSizeSelect.value = markerSizeSaved;
        }
        markerSizeSelect.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
        markerSizeCol1.appendChild(markerSizeLabel);
        markerSizeCol2.appendChild(markerSizeSelect);
        markerSizeRow.append(markerSizeCol1, markerSizeCol2);
        newDiv.append(markerSizeRow);

        //Add checkboxes for error bars, standard deviation, mean, and percentiles
        const features = ['Legend', 'ConnectGaps', 'Mean', 'StdDev', 'ErrorBars', 'Percentiles'];
        const featureNames = ['Add Line to Legend', 'Connect Missing Data Gaps', 'Mean Line', '+-1 Std Dev Lines ', 'Symmetric Error Bars', '90th & 10th Percentile Lines'];
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          const featureName = featureNames[i];
          const newRow = document.createElement('div');
          newRow.classList.add('row', 'fieldPadding');
          if (fieldLabelNumber % 2 != 0) {
            newRow.classList.add('row', 'fieldBackgroundColor');
          }
          const newColumn1 = document.createElement('div');
          newColumn1.classList.add('col-3');
          const newColumn2 = document.createElement('div');
          newColumn2.classList.add('col');
          const label = document.createElement('label');
          label.for = fieldLabel[0] + feature;
          label.innerHTML = `${featureName}`;
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = fieldLabel[0] + feature;
          checkbox.name = 'plotFields';
          const fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkbox.id, interactive_arguments);
          checkbox.value = fieldValueSaved === 'on' ? 'on' : '';
          checkbox.checked = fieldValueSaved === 'on';
          newColumn1.appendChild(label);
          newColumn2.appendChild(checkbox);
          newRow.append(newColumn1, newColumn2);
          newDiv.append(newRow);

          // === Add dropdowns for feature-specific data ===
          if (['Mean', 'ErrorBars', 'StdDev'].includes(feature)) {
            const dropdownContainer = document.createElement('div');
            dropdownContainer.classList.add('row', 'fieldPadding');
            if (fieldLabelNumber % 2 != 0) {
              dropdownContainer.classList.add('row', 'fieldBackgroundColor');
            }
            const dropdownLabelCol = document.createElement('div');
            dropdownLabelCol.classList.add('col-3');
            const dropdownInputCol = document.createElement('div');
            dropdownInputCol.classList.add('col');

            //---------------------------------------------------------------- START FUNCTIONS

            function createDropdown(labelText, selectId) {
              const label = document.createElement('label');
              label.innerHTML = labelText;
              const select = document.createElement('select');
              select.id = selectId;
              select.name = 'plotFields';
              if (feature === 'Mean' || feature === 'ErrorBars' || feature === 'StdDev') {
                const autoOpt = document.createElement('option');
                if (feature != 'ErrorBars') {
                  autoOpt.value = 'auto';
                  autoOpt.innerHTML = 'Auto Calculate Based on Line Column Selection';
                  select.appendChild(autoOpt);
                }
                if (feature === 'ErrorBars') {
                  autoOpt.value = 'auto';
                  autoOpt.innerHTML = 'Example Error Bars';
                  select.appendChild(autoOpt);
                }
                for (const col of Object.values(jsonColumns)) {
                  const opt = document.createElement('option');
                  opt.value = col;
                  opt.innerHTML = col;
                  select.appendChild(opt);
                }
                const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(select.id, interactive_arguments);
                if (saved) {
                  select.value = saved;
                }
                select.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
                return {
                  label,
                  select
                };
              }
            }
            function createColorfield(labelText, inputId) {
              const label = document.createElement('label');
              label.textContent = labelText;
              label.htmlFor = inputId; // Link label to input

              const input = document.createElement('input'); // Correct element
              input.type = 'color';
              input.id = inputId;
              input.name = 'plotFields';
              const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
              if (saved) {
                input.value = saved;
              }
              input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
              return {
                label,
                input
              };
            }

            //---------------------------------------------------------------- END FUNCTIONS

            const controls = [];

            // Add features for Mean
            if (feature === 'Mean') {
              const {
                label,
                select
              } = createDropdown('Mean Source Column', fieldLabel[0] + feature + 'Field');
              controls.push(label, select);
            }

            // Add features for ErrorBars
            if (feature === 'ErrorBars' || feature === 'StdDev') {
              const {
                label: labelValues,
                select: selectValues
              } = createDropdown(`${featureName} Input Column Values`, fieldLabel[0] + feature + 'InputValues');
              const {
                label: labelColor,
                input: ColorValue
              } = createColorfield(`Color`, fieldLabel[0] + feature + 'Color');
              controls.push(labelValues, document.createElement('br'), selectValues, document.createElement('br'), labelColor, document.createElement('br'), ColorValue);
            }

            // Initially hide the dropdown container becasue the box hasnt been checked
            dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
            controls.forEach(control => dropdownInputCol.appendChild(control));
            dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
            newDiv.append(dropdownContainer);

            // Toggle visibility dynamically
            checkbox.addEventListener('change', function () {
              checkbox.value = checkbox.checked ? 'on' : '';
              dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
            });
          } else {
            checkbox.addEventListener('change', function () {
              checkbox.value = checkbox.checked ? 'on' : '';
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
            });
          }
        }
      }
      const targetElement = document.getElementById('graphGUI');
      targetElement.appendChild(newDiv);
    });
  }
}
// Bridge for classic scripts until they are modularized.
window.plotlyLineParameterFields = plotlyLineParameterFields;

/***/ },

/***/ "./includes/figures/js/interactive/plotly-utility.js"
/*!***********************************************************!*\
  !*** ./includes/figures/js/interactive/plotly-utility.js ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildPlotlySnippetEmbedCode: () => (/* binding */ buildPlotlySnippetEmbedCode),
/* harmony export */   computePercentile: () => (/* binding */ computePercentile),
/* harmony export */   computeStandardDeviation: () => (/* binding */ computeStandardDeviation),
/* harmony export */   createFigureIframeHtml: () => (/* binding */ createFigureIframeHtml),
/* harmony export */   fillFormFieldValues: () => (/* binding */ fillFormFieldValues),
/* harmony export */   loadExternalScript: () => (/* binding */ loadExternalScript),
/* harmony export */   loadPlotlyScript: () => (/* binding */ loadPlotlyScript),
/* harmony export */   logFormFieldValues: () => (/* binding */ logFormFieldValues),
/* harmony export */   plotlyScriptPromise: () => (/* binding */ plotlyScriptPromise),
/* harmony export */   saveHtmlToServer: () => (/* binding */ saveHtmlToServer),
/* harmony export */   waitForElementById: () => (/* binding */ waitForElementById)
/* harmony export */ });
// Needed to ensure Plotly is only loaded once
let plotlyScriptPromise = null;

/**
 * Loads the Plotly.js library dynamically if it is not already loaded.
 *
 * This function ensures that the Plotly.js library is loaded and available for use.
 * If the library is already loaded, it resolves immediately. If the loading process
 * has already started, it reuses the same Promise to avoid multiple simultaneous loads.
 *
 * @return {Promise<void>} A Promise that resolves when the Plotly.js library is successfully loaded.
 *                          If the library fails to load or initialize, the Promise is rejected with an error.
 *
 * @throws {Error} If the Plotly.js library fails to initialize after loading.
 *
 * @example
 * loadPlotlyScript()
 *   .then(() => {
 *     console.log('Plotly.js is ready to use.');
 *     // You can now use Plotly to create charts
 *   })
 *   .catch((error) => {
 *     console.error('Failed to load Plotly.js:', error);
 *   });
 */
function loadPlotlyScript() {
  if (window.Plotly) {
    return Promise.resolve();
  }

  // Reuse the same Promise if already started
  if (plotlyScriptPromise) {
    return plotlyScriptPromise;
  }
  plotlyScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://cdn.plot.ly/plotly-3.0.0.min.js"]');
    if (existingScript) {
      existingScript.onload = () => {
        if (window.Plotly) {
          resolve();
        } else {
          reject(new Error('Plotly failed to initialize.'));
        }
      };
      existingScript.onerror = reject;
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-3.0.0.min.js';
    script.onload = () => {
      if (window.Plotly) {
        resolve();
      } else {
        reject(new Error('Plotly failed to initialize.'));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return plotlyScriptPromise;
}

/**
 * Waits for an HTML element with the specified ID to appear in the DOM within a given timeout period.
 * Polls the DOM at regular intervals to check for the presence of the element.
 *
 * @function
 * @param {string} id             - The ID of the HTML element to wait for.
 * @param {number} [timeout=1000] - The maximum time (in milliseconds) to wait for the element to appear. Defaults to 1000ms.
 * @return {Promise<HTMLElement>} A promise that resolves with the found HTML element if it appears within the timeout period.
 * @throws {Error} If the element with the specified ID is not found within the timeout period.
 *
 * @example
 * waitForElementById('my-element', 2000)
 *   .then(element => {
 *     console.log('Element found:', element);
 *   })
 *   .catch(error => {
 *     console.error(error.message);
 *   });
 */
function waitForElementById(id, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const intervalTime = 50;
    let elapsedTime = 0;
    const interval = setInterval(() => {
      const element = document.getElementById(id);
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
      elapsedTime += intervalTime;
      if (elapsedTime >= timeout) {
        clearInterval(interval);
        reject(new Error(`Element with id ${id} not found after ${timeout}ms`));
      }
    }, intervalTime);
  });
}

/**
 * Computes the standard deviation of an array of numbers.
 *
 * The standard deviation is a measure of the amount of variation or dispersion
 * in a set of values. This function calculates the population standard deviation,
 * which divides by the number of elements (n) rather than (n - 1).
 *
 * @param {number[]} arr - The array of numbers for which to compute the standard deviation.
 *                       Must be a non-empty array. If the array is empty or not an array,
 *                       the function will return 0.
 * @return {number} The standard deviation of the numbers in the array. Returns 0 if the input
 *                   is not a valid array or is empty.
 */
function computeStandardDeviation(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }

  // Filter out invalid or "NA" values
  const numericValues = arr.filter(val => val !== null && val !== undefined && val !== '' && !(typeof val === 'string' && val.trim().toUpperCase() === 'NA') && !isNaN(val)).map(val => parseFloat(val));
  if (numericValues.length === 0) {
    return 0;
  }
  const n = numericValues.length;
  const mean = numericValues.reduce((a, b) => a + b, 0) / n;
  const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return Math.sqrt(variance);
}

/**
 * Computes the percentile value from an array of numbers.
 *
 * This function calculates the value at a given percentile in a numeric array.
 * The array is first sorted in ascending order. The percentile is specified as a number between 0 and 100.
 * If the array is empty, the function returns `undefined`. If the array contains only one element,
 * that element is returned. For arrays with more than one element, the function uses linear interpolation
 * between the two nearest ranks if the desired percentile falls between them.
 *
 * @param {number[]} arr        - The array of numbers from which to compute the percentile. Should be non-empty.
 * @param {number}   percentile - The percentile to compute (between 0 and 100).
 * @return {number|undefined} The value at the specified percentile, or `undefined` if the array is empty.
 *
 * @example
 * // For arr = [1, 2, 3, 4, 5], percentile = 50
 * // Returns 3 (the median)
 * computePercentile([1, 2, 3, 4, 5], 50);
 *
 * @example
 * // For arr = [10, 20, 30], percentile = 75
 * // Returns 25 (interpolated between 20 and 30)
 * computePercentile([10, 20, 30], 75);
 *
 * @example
 * // For arr = [], percentile = 90
 * // Returns undefined
 * computePercentile([], 90);
 */
function computePercentile(arr, percentile) {
  if (arr.length === 0) {
    return undefined;
  }
  if (arr.length === 1) {
    return arr[0];
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const index = percentile / 100 * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sorted[lower];
  }
  return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
}

/**
 * @file This file contains utility functions used for creating javascript figures - both in the display of those figures,
 * as well in getting the figure parameter values from the WordPress user
 * @version 1.0.0
 */

/**
 * Loads an external JavaScript file into the document.
 *
 * @async
 * @function loadExternalScript
 * @param {string} url - The URL of the external JavaScript file.
 * @return {Promise<void>} A promise that resolves when the script is loaded
 *   and appended to the document, or rejects if there's an error.
 * @throws {Error} Throws an error if the script fails to load.
 * @example
 * loadExternalScript('https://cdn.plot.ly/plotly-3.0.0.min.js')
 *   .then(() => console.log('Plotly loaded!'))
 *   .catch((error) => console.error('Failed to load Plotly:', error));
 */
function loadExternalScript(url) {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`));
    };
    document.head.appendChild(script);
  });
}

/**
 * Logs the values of form fields (inputs, selects, etc.) associated with
 * JavaScript figure parameters to a hidden input field, so that they are saved in the WordPress database.
 * This function finds all elements with the name "plotFields",
 * extracts their ID and value, and stores them as a JSON string in the
 * "figure_interactive_arguments" field.
 *
 * @function logFormFieldValues
 * @listens change
 * @example
 * // Assuming you have the following HTML:
 * // <input type="text" name="plotFields" id="xAxisTitle" value="Date">
 * // <input type="hidden" name="figure_interactive_arguments" value="">
 * logFormFieldValues(); // After a change to one of the above plotFields, the hidden input will be updated
 */
function logFormFieldValues() {
  const allFields = document.getElementsByName('plotFields');
  const fieldValues = [];
  allFields.forEach(uniqueField => {
    fieldValues.push([uniqueField.id, uniqueField.value]);
  });
  document.getElementsByName('figure_interactive_arguments')[0].value = JSON.stringify(fieldValues);
}

/**
 * Fills in the values of form fields associated with JavaScript figure
 * parameters. It retrieves the values from the hidden
 * "figure_interactive_arguments" field and populates the corresponding
 * form fields.
 *
 * @function fillFormFieldValues
 * @param {string} elementID - The ID of the form field to fill.
 * @return {string|undefined} The value of the form field if found, or
 *   `undefined` if the field or its value is not found.
 * @example
 * // Assuming you have the following HTML:
 * // <input type="text" name="plotFields" id="xAxisTitle" value="">
 * // <input type="hidden" name="figure_interactive_arguments" value="[['xAxisTitle', 'Date'], ['yAxisTitle', 'Value']]">
 * const xAxisTitle = fillFormFieldValues('xAxisTitle'); // xAxisTitle will be set to "Date"
 */
function fillFormFieldValues(elementID) {
  let interactiveFields = document.getElementsByName('figure_interactive_arguments')[0].value;

  // CHECK FOR "\" AND REMOVE IF EXISTS, This is to fix escaping issues for existing figures
  if (interactiveFields.includes('\\')) {
    interactiveFields = interactiveFields.replace(/\\/g, '');
  }
  if (interactiveFields != '' && interactiveFields != null) {
    const resultJSON = Object.fromEntries(JSON.parse(interactiveFields));
    if (resultJSON[elementID] != undefined && resultJSON[elementID] != '') {
      return resultJSON[elementID];
    }
  }
}

/**
 * Generates the HTML document and embed metadata needed to display a Plotly figure in an iframe.
 *
 * Builds a self-contained HTML page that loads Plotly from CDN (if not already present) and
 * renders the figure responsively. Width/height are stripped from the layout so the chart fills
 * its container automatically.
 *
 * @param {Object} savedFigure - Plotly figure object with `data`, `layout`, and `config` properties.
 * @param {string|number} figureID - Unique identifier for the figure, used in element IDs and the output filename.
 * @param {string} rootURL - WordPress site root URL (no trailing slash), used to construct the iframe `src` path.
 * @returns {{
 *   figIframeHtml: string,
 *   figIframeHtmlFileName: string,
 *   figIframeHtmlPath: string,
 *   figIframeCode: string
 * }} Object containing the full HTML document string, the filename (without extension), the
 *    expected server path, and a ready-to-insert `<iframe>` tag.
 */
function createFigureIframeHtml(savedFigure, figureID, rootURL) {
  function buildStandalonePlotlyEmbedCode(savedFigure, figureID) {
    const cleanFigure = {
      data: savedFigure.data || [],
      layout: JSON.parse(JSON.stringify(savedFigure.layout || {})),
      config: savedFigure.config || {}
    };
    delete cleanFigure.layout.width;
    delete cleanFigure.layout.height;
    cleanFigure.layout.autosize = true;
    const jsonString = JSON.stringify(cleanFigure).replace(/<\/script/gi, "<\\/script");
    return `
	<script>
	(function () {
		const currentScript = document.currentScript;
	
		const chart = document.createElement("div");
		chart.id = "${figureID}";
		chart.style.position = "absolute";
		chart.style.width = "100%";
		chart.style.height = "100%";
		chart.style.minHeight = "400px";

		currentScript.parentNode.insertBefore(chart, currentScript);
	
		const fig = ${jsonString};
	
		function renderPlot() {
		Plotly.react(
			chart,
			fig.data || [],
			fig.layout || {},
			fig.config || {}
		).then(function () {
			Plotly.Plots.resize(chart);
		});
	
		window.addEventListener("resize", function () {
			Plotly.Plots.resize(chart);
		});
		}
	
		if (typeof Plotly !== "undefined") {
		renderPlot();
		return;
		}
	
		const script = document.createElement("script");
		script.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
		script.onload = renderPlot;
		document.head.appendChild(script);
	})();
	</script>
	`;
  }
  const figIframeHtml = `
				<!doctype html>
				<html>
				<head>
				<meta charset="utf-8">
				<title>Plotly Embed</title>
				<style>
					html, body {
					width: 100%;
					min-height: 400px;
					margin: 0;
					padding: 0;
					}

					body {
					overflow: hidden;
					}

					#plotly-embed-${figureID} {
					width: 100%;
					height: 100%;
					min-height: 400px;
					}
				</style>
				</head>
				<body>
				${buildStandalonePlotlyEmbedCode(savedFigure, `plotly-embed-${figureID}`)}
				</body>
				</html>
	`;
  const figIframeHtmlFileName = `plotly-${figureID}`;
  const figIframeHtmlPath = `${rootURL}/wp-content/data/figure_${figureID}/${figIframeHtmlFileName}.html`;
  const figIframeCode = `<iframe src="${figIframeHtmlPath}" width="100%" height="400px !important" min-height="400px !important"></iframe>`;
  return {
    figIframeHtml,
    figIframeHtmlFileName,
    figIframeHtmlPath,
    figIframeCode
  };
}

/**
 * Builds an inline HTML snippet that renders a Plotly figure directly in a page (not inside an iframe).
 *
 * Produces a `<div>` wrapper and an immediately-invoked `<script>` block. The script inlines the
 * figure JSON, loads Plotly from CDN if needed (reusing any already-loading CDN script to avoid
 * duplicate requests), and calls `Plotly.react` once the library is ready. Width/height are removed
 * from the layout so the chart fills its container responsively.
 *
 * @param {Object} savedFigure - Plotly figure object with `data`, `layout`, and `config` properties.
 * @param {string} embedID - Unique element ID for the chart `<div>`. A wrapper `<div>` with ID
 *   `${embedID}-wrap` is also created around it.
 * @returns {string} An HTML string containing the wrapper div and self-executing script tag, ready
 *   to be injected into a page.
 */
function buildPlotlySnippetEmbedCode(savedFigure, embedID) {
  const cleanFigure = {
    data: savedFigure.data || [],
    layout: JSON.parse(JSON.stringify(savedFigure.layout || {})),
    config: savedFigure.config || {}
  };
  delete cleanFigure.layout.width;
  delete cleanFigure.layout.height;
  cleanFigure.layout.autosize = true;
  cleanFigure.config.responsive = true;
  const jsonString = JSON.stringify(cleanFigure).replace(/<\/script/gi, "<\\/script");
  return `
	<div id="${embedID}-wrap" style="width:100%; min-height:400px; height:500px; position:relative;">
		<div id="${embedID}" style="width:100%; height:100%; min-height:400px;"></div>
	</div>
	
	<script>
	(function () {
		const fig = ${jsonString};
		const target = document.getElementById("${embedID}");
	
		function renderPlot() {
		const target2 = document.getElementById("${embedID}");

		if (!target || typeof Plotly === "undefined") return;

		Plotly.react(
		  target,
		  fig.data || [],
		  fig.layout || {},
		  fig.config || {}
		).then(function () {
		  Plotly.Plots.resize(target2);
		});

		window.addEventListener("resize", function () {
		  Plotly.Plots.resize(target);
		});
	  }

	  if (typeof Plotly !== "undefined") {
		renderPlot();
		return;
	  }

	  const existing = document.querySelector('script[src*="cdn.plot.ly"]');

	  if (existing) {
		const waitForPlotly = setInterval(function () {
		  if (typeof Plotly !== "undefined") {
			clearInterval(waitForPlotly);
			renderPlot();
		  }
		}, 50);

		setTimeout(function () {
		  clearInterval(waitForPlotly);
		}, 10000);

		return;
	  }

	  const script = document.createElement("script");
	  script.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
	  script.onload = renderPlot;
	  document.head.appendChild(script);
	})();
	</script>
	`;
}

/**
 * Uploads an HTML string to the server as a file via the WordPress AJAX API.
 *
 * Wraps `htmlContent` in a `File` object and POSTs it to `wp-admin/admin-ajax.php` using
 * the `custom_file_upload` action. Requires a `[name="figure_nonce"]` input to be present
 * in the DOM; alerts and returns early if it is missing.
 *
 * @param {string} htmlContent - The raw HTML string to save.
 * @param {string} fileName - The filename (including extension) to use when creating the uploaded file.
 * @param {string|number} postId - The WordPress post ID to associate the uploaded file with.
 * @returns {Promise<Object>|undefined} Resolves with the parsed JSON response from the server on
 *   success or failure (`result.success` indicates outcome), or `undefined` if the nonce is missing.
 * @throws {Error} Rejects if the `fetch` call itself fails (network error, etc.).
 */
function saveHtmlToServer(htmlContent, fileName, postId) {
  // Send the HTML content and filename to the server via AJAX

  const htmlBlob = new Blob([htmlContent], {
    type: "text/html"
  });
  const htmlFile = new File([htmlBlob], fileName, {
    type: "text/html"
  });
  const figureNonceInput = document.querySelector('[name="figure_nonce"]');
  if (!figureNonceInput || !figureNonceInput.value) {
    alert("Error: figure_nonce is missing in the form!");
    return;
  }
  const formData = new FormData();

  // Must match your WP AJAX action hook
  formData.append("action", "custom_file_upload");

  // Must match your PHP expected fields
  formData.append("post_id", postId);
  formData.append("figure_nonce", figureNonce);
  formData.append("uploaded_file", htmlFile);
  const ajaxUrl = window.location.origin + "/wp-admin/admin-ajax.php";
  return fetch(ajaxUrl, {
    method: "POST",
    body: formData,
    credentials: "same-origin"
  }).then(response => response.json()).then(result => {
    if (!result.success) {
      console.error("HTML upload failed:", result.data);
      return result;
    }
    console.log("HTML uploaded successfully:", result.data);
    return result;
  }).catch(error => {
    console.error("AJAX error uploading HTML:", error);
    throw error;
  });
}

// Bridge for classic scripts (admin-preview-buttons.js) until they are modularized.
window.fillFormFieldValues = fillFormFieldValues;

/***/ },

/***/ "react/jsx-runtime"
/*!**********************************!*\
  !*** external "ReactJSXRuntime" ***!
  \**********************************/
(module) {

module.exports = window["ReactJSXRuntime"];

/***/ },

/***/ "@wordpress/api-fetch"
/*!**********************************!*\
  !*** external ["wp","apiFetch"] ***!
  \**********************************/
(module) {

module.exports = window["wp"]["apiFetch"];

/***/ },

/***/ "@wordpress/block-editor"
/*!*************************************!*\
  !*** external ["wp","blockEditor"] ***!
  \*************************************/
(module) {

module.exports = window["wp"]["blockEditor"];

/***/ },

/***/ "@wordpress/blocks"
/*!********************************!*\
  !*** external ["wp","blocks"] ***!
  \********************************/
(module) {

module.exports = window["wp"]["blocks"];

/***/ },

/***/ "@wordpress/components"
/*!************************************!*\
  !*** external ["wp","components"] ***!
  \************************************/
(module) {

module.exports = window["wp"]["components"];

/***/ },

/***/ "@wordpress/data"
/*!******************************!*\
  !*** external ["wp","data"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["data"];

/***/ },

/***/ "@wordpress/element"
/*!*********************************!*\
  !*** external ["wp","element"] ***!
  \*********************************/
(module) {

module.exports = window["wp"]["element"];

/***/ },

/***/ "@wordpress/i18n"
/*!******************************!*\
  !*** external ["wp","i18n"] ***!
  \******************************/
(module) {

module.exports = window["wp"]["i18n"];

/***/ },

/***/ "./blocks/insert-figure/src/block.json"
/*!*********************************************!*\
  !*** ./blocks/insert-figure/src/block.json ***!
  \*********************************************/
(module) {

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"create-block/graphic-data-insert-figure","version":"0.1.0","title":"Graphic Data Insert Figure Data","category":"media","description":"Insert a figure into a post","example":{},"attributes":{"figureId":{"type":"number","default":0},"figureMode":{"type":"string","default":"existing"},"instanceId":{"type":"string","default":""}},"supports":{"color":{"background":false,"text":true},"html":false,"typography":{"fontSize":true}},"textdomain":"graphic-data-insert-figure","editorScript":"file:./index.js","viewScript":"file:./view.js","render":"file:./render.php"}');

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!*******************************************!*\
  !*** ./blocks/insert-figure/src/index.js ***!
  \*******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @wordpress/blocks */ "@wordpress/blocks");
/* harmony import */ var _wordpress_blocks__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__);
/* harmony import */ var _edit__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! ./edit */ "./blocks/insert-figure/src/edit.js");
/* harmony import */ var _save__WEBPACK_IMPORTED_MODULE_2__ = __webpack_require__(/*! ./save */ "./blocks/insert-figure/src/save.js");
/* harmony import */ var _block_json__WEBPACK_IMPORTED_MODULE_3__ = __webpack_require__(/*! ./block.json */ "./blocks/insert-figure/src/block.json");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__);
/**
 * Registers the Graphic Data Figure block in the editor.
 *
 * Important:
 * - This file is for the Gutenberg editor bundle.
 * - Do not import ./view here.
 * - The frontend view script should be declared in block.json with "viewScript": "file:./view.js".
 */


/**
 * Internal dependencies
 */




/**
 * Define a custom SVG icon for the block.
 */

const figureIcon = /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsxs)("svg", {
  viewBox: "0 0 24 24",
  xmlns: "http://www.w3.org/2000/svg",
  "aria-hidden": "true",
  focusable: "false",
  children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("path", {
    d: "M4 19.5h16v1.5H3V3h1.5v16.5z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("path", {
    d: "M7 17h2.5v-6H7v6z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("path", {
    d: "M11 17h2.5V7H11v10z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("path", {
    d: "M15 17h2.5v-4H15v4z"
  }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_4__.jsx)("path", {
    d: "M6.5 9.5l4-3 3.5 3 4-5 .9.8-4.8 6-3.6-3.1-3.3 2.5-.7-1.2z"
  })]
});

/**
 * Register the block for the editor.
 *
 * Spread metadata so the editor receives attributes/supports from block.json.
 * Frontend rendering still comes from render.php + view.js, not from this file.
 */
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  ..._block_json__WEBPACK_IMPORTED_MODULE_3__,
  icon: figureIcon,
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  save: _save__WEBPACK_IMPORTED_MODULE_2__["default"]
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map