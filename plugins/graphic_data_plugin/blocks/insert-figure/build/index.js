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
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4__ = __webpack_require__(/*! @wordpress/components */ "@wordpress/components");
/* harmony import */ var _wordpress_components__WEBPACK_IMPORTED_MODULE_4___default = /*#__PURE__*/__webpack_require__.n(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__);
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__ = __webpack_require__(/*! @wordpress/i18n */ "@wordpress/i18n");
/* harmony import */ var _wordpress_i18n__WEBPACK_IMPORTED_MODULE_5___default = /*#__PURE__*/__webpack_require__.n(_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__);
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__ = __webpack_require__(/*! react/jsx-runtime */ "react/jsx-runtime");
/* harmony import */ var react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6___default = /*#__PURE__*/__webpack_require__.n(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__);







// import './editor.scss';

function TinyMCEControl({
  id,
  label,
  value,
  onChange,
  height = 180
}) {
  const editorIdRef = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useRef)(id);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
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
        toolbar1: 'bold italic underline | bullist numlist | link unlink | undo redo',
        setup(editor) {
          editor.on('change keyup blur', () => {
            onChange(editor.getContent());
          });
        }
      },
      quicktags: true,
      mediaButtons: false
    });
    return () => {
      if (window.wp?.editor?.remove) {
        window.wp.editor.remove(editorId);
      } else if (window.tinymce?.get(editorId)) {
        window.tinymce.get(editorId).remove();
      }
    };
  }, []);
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    const editorId = editorIdRef.current;
    const editor = window.tinymce?.get(editorId);
    if (editor && value !== editor.getContent()) {
      editor.setContent(value || '');
    }
  }, [value]);
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    className: "graphic-data-tinymce-control",
    style: {
      width: '100%',
      marginTop: '16px',
      marginBottom: '16px'
    },
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("label", {
      htmlFor: editorIdRef.current,
      style: {
        display: 'block',
        fontWeight: '600',
        marginBottom: '6px'
      },
      children: label
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("textarea", {
      id: editorIdRef.current,
      value: value || '',
      onChange: event => onChange(event.target.value),
      style: {
        width: '100%',
        minHeight: `${height}px`
      }
    })]
  });
}
function Edit({
  attributes,
  setAttributes
}) {
  const {
    figureId,
    figureMode = 'existing'
  } = attributes;
  const blockProps = (0,_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.useBlockProps)();
  const [meta, setMeta] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)({});
  const [isSaving, setIsSaving] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [isCreating, setIsCreating] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)(false);
  const [newFigureTitle, setNewFigureTitle] = (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useState)('');
  const figures = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    return select('core').getEntityRecords('postType', 'figure', {
      per_page: -1,
      status: 'publish',
      orderby: 'title',
      order: 'asc'
    });
  }, []);
  const figure = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useSelect)(select => {
    if (!figureId) return null;
    return select('core').getEntityRecord('postType', 'figure', figureId);
  }, [figureId]);
  const {
    saveEntityRecord
  } = (0,_wordpress_data__WEBPACK_IMPORTED_MODULE_1__.useDispatch)('core');
  (0,_wordpress_element__WEBPACK_IMPORTED_MODULE_0__.useEffect)(() => {
    if (!figureId) return;
    _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
      path: `/graphic-data/v1/figure/${figureId}`,
      method: 'GET'
    }).then(response => {
      console.log('Loaded custom figure meta:', response);
      setMeta(response || {});
    }).catch(e => {
      console.error('Failed to load custom figure meta:', e);
    });
  }, [figureId]);
  function updateMeta(key, value) {
    setMeta(currentMeta => ({
      ...currentMeta,
      [key]: value
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
        figure_interactive_arguments: meta.figure_interactive_arguments || '',
        figure_caption_short: meta.figure_caption_short || '',
        figure_caption_long: meta.figure_caption_long || '',
        figure_science_link_text: meta.figure_science_link_text || '',
        figure_science_link_url: meta.figure_science_link_url || '',
        figure_data_link_text: meta.figure_data_link_text || '',
        figure_data_link_url: meta.figure_data_link_url || ''
      };
      const response = await _wordpress_api_fetch__WEBPACK_IMPORTED_MODULE_3___default()({
        path: `/graphic-data/v1/figure/${figureId}`,
        method: 'POST',
        data: payload
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
          figure_caption_long: ''
        }
      });
      if (newFigure?.id) {
        setAttributes({
          figureId: Number(newFigure.id),
          figureMode: 'existing'
        });
        setNewFigureTitle('');
      }
    } catch (e) {
      console.error('Figure creation failed:', e);
    }
    setIsCreating(false);
  }
  const figureOptions = [{
    label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Select a figure', 'graphic-data-plugin'),
    value: 0
  }, ...(Array.isArray(figures) ? figures.map(fig => ({
    label: fig.title?.rendered ? fig.title.rendered.replace(/(<([^>]+)>)/gi, '') : `Figure ${fig.id}`,
    value: fig.id
  })) : [])];
  const figureModeOptions = [{
    label: 'Select Existing Figure',
    value: 'existing'
  }, {
    label: 'Create New Figure',
    value: 'new'
  }];
  return /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
    ...blockProps,
    children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_block_editor__WEBPACK_IMPORTED_MODULE_2__.InspectorControls, {
      children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.PanelBody, {
        title: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Figure Settings', 'graphic-data-plugin'),
        initialOpen: true,
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, {
          label: "Figure Mode",
          value: figureMode,
          options: figureModeOptions,
          onChange: value => {
            setAttributes({
              figureMode: value,
              figureId: value === 'new' ? 0 : figureId
            });
          }
        }), figureMode === 'existing' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, {
          label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Figure', 'graphic-data-plugin'),
          value: figureId,
          options: figureOptions,
          onChange: value => setAttributes({
            figureId: Number(value)
          })
        })]
      })
    }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Placeholder, {
      label: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Graphic Data Figure', 'graphic-data-plugin'),
      instructions: (0,_wordpress_i18n__WEBPACK_IMPORTED_MODULE_5__.__)('Create a new figure or select an existing one.', 'graphic-data-plugin'),
      children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, {
        label: "What would you like to do?",
        value: figureMode,
        options: figureModeOptions,
        onChange: value => {
          setAttributes({
            figureMode: value,
            figureId: value === 'new' ? 0 : figureId
          });
        }
      }), figureMode === 'new' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        className: "graphic-data-create-figure",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
          label: "New Figure Title",
          value: newFigureTitle,
          onChange: setNewFigureTitle,
          placeholder: "New Graphic Data Figure"
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
          variant: "primary",
          onClick: createNewFigure,
          disabled: isCreating,
          children: isCreating ? 'Creating...' : 'Create Figure'
        })]
      }), figureMode === 'existing' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
        children: [!figures && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Spinner, {}), figures && figures.length === 0 && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Notice, {
          status: "warning",
          isDismissible: false,
          children: "No figures found."
        }), figures && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, {
          label: "Figure",
          value: figureId,
          options: figureOptions,
          onChange: value => setAttributes({
            figureId: Number(value)
          })
        })]
      }), figureId && !figure && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Spinner, {}), figureId && figure && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("div", {
        className: "graphic-data-figure-editor",
        children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("hr", {}), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)("h3", {
          children: ["Editing Figure:", ' ', figure.title.rendered.replace(/(<([^>]+)>)/gi, '')]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.ToggleControl, {
          label: "Published",
          checked: meta.figure_published === 'published',
          onChange: value => updateMeta('figure_published', value ? 'published' : 'draft')
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.SelectControl, {
          label: "Figure Type",
          value: meta.figure_path || 'Internal',
          options: [{
            label: 'Internal Image',
            value: 'Internal'
          }, {
            label: 'External Image',
            value: 'External'
          }, {
            label: 'Interactive',
            value: 'Interactive'
          }, {
            label: 'Code',
            value: 'Code'
          }],
          onChange: value => updateMeta('figure_path', value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
          label: "Figure Title",
          value: meta.figure_title || '',
          onChange: value => updateMeta('figure_title', value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
          label: "Monitoring Program Text",
          value: meta.figure_science_link_text || '',
          onChange: value => updateMeta('figure_science_link_text', value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
          label: "Monitoring Program URL",
          value: meta.figure_science_link_url || '',
          onChange: value => updateMeta('figure_science_link_url', value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
          label: "Data Link Text",
          value: meta.figure_data_link_text || '',
          onChange: value => updateMeta('figure_data_link_text', value)
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
          label: "Data Link URL",
          value: meta.figure_data_link_url || '',
          onChange: value => updateMeta('figure_data_link_url', value)
        }), meta.figure_path === 'Internal' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
          label: "Internal Image URL",
          value: meta.figure_image || '',
          onChange: value => updateMeta('figure_image', value)
        }), meta.figure_path === 'External' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
            label: "External Image URL",
            value: meta.figure_external_url || '',
            onChange: value => updateMeta('figure_external_url', value)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
            label: "External Alt Text",
            value: meta.figure_external_alt || '',
            onChange: value => updateMeta('figure_external_alt', value)
          })]
        }), meta.figure_path === 'Code' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextareaControl, {
          label: "Custom Code",
          value: meta.figure_code || '',
          onChange: value => updateMeta('figure_code', value),
          rows: 10
        }), meta.figure_path === 'Interactive' && /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsxs)(react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.Fragment, {
          children: [/*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextControl, {
            label: "Interactive File",
            value: meta.figure_upload_file || '',
            onChange: value => updateMeta('figure_upload_file', value)
          }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.TextareaControl, {
            label: "Interactive Arguments",
            value: meta.figure_interactive_arguments || '',
            onChange: value => updateMeta('figure_interactive_arguments', value),
            rows: 8
          })]
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(TinyMCEControl, {
          id: `figure-caption-short-${figureId}`,
          label: "Short Caption",
          value: meta.figure_caption_short || '',
          onChange: value => updateMeta('figure_caption_short', value),
          height: 160
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(TinyMCEControl, {
          id: `figure-caption-long-${figureId}`,
          label: "Extended Caption",
          value: meta.figure_caption_long || '',
          onChange: value => updateMeta('figure_caption_long', value),
          height: 240
        }), /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)("div", {
          style: {
            marginTop: '20px'
          },
          children: /*#__PURE__*/(0,react_jsx_runtime__WEBPACK_IMPORTED_MODULE_6__.jsx)(_wordpress_components__WEBPACK_IMPORTED_MODULE_4__.Button, {
            variant: "primary",
            onClick: saveFigureMeta,
            disabled: isSaving,
            children: isSaving ? 'Saving...' : 'Save Figure Fields'
          })
        })]
      })]
    })]
  });
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

module.exports = /*#__PURE__*/JSON.parse('{"$schema":"https://schemas.wp.org/trunk/block.json","apiVersion":3,"name":"create-block/graphic-data-insert-figure","version":"0.1.0","title":"Graphic Data Insert Figure Data","category":"media","description":"Insert a figure into a post","example":{},"attributes":{"figureId":{"type":"number","default":0},"figureMode":{"type":"string","default":"existing"}},"supports":{"color":{"background":false,"text":true},"html":false,"typography":{"fontSize":true}},"textdomain":"graphic-data-insert-figure","editorScript":"file:./index.js","editorStyle":"file:./index.css","style":"file:./style-index.css","render":"file:./render.php"}');

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	const __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		const cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		const module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			const e = new Error("Cannot find module '" + moduleId + "'");
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
/******/ 			const getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter/value functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			if(Array.isArray(definition)) {
/******/ 				var i = 0;
/******/ 				while(i < definition.length) {
/******/ 					var key = definition[i++];
/******/ 					var binding = definition[i++];
/******/ 					if(!__webpack_require__.o(exports, key)) {
/******/ 						if(binding === 0) {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, value: definition[i++] });
/******/ 						} else {
/******/ 							Object.defineProperty(exports, key, { enumerable: true, get: binding });
/******/ 						}
/******/ 					} else if(binding === 0) { i++; }
/******/ 				}
/******/ 			} else {
/******/ 				for(var key in definition) {
/******/ 					if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 						Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 					}
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.hasOwn(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
let __webpack_exports__ = {};
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
 * Registers a new block provided a unique name and an object defining its behavior.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */


/**
 * Internal dependencies
 */




/**
 * Define a custom SVG icon for the block. This icon will appear in
 * the Inserter and when the user selects the block in the Editor.
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
 * Every block starts by registering a new block type definition.
 *
 * @see https://developer.wordpress.org/block-editor/developers/block-api/#registering-a-block
 */
(0,_wordpress_blocks__WEBPACK_IMPORTED_MODULE_0__.registerBlockType)(_block_json__WEBPACK_IMPORTED_MODULE_3__.name, {
  icon: figureIcon,
  /**
   * @see ./edit.js
   */
  edit: _edit__WEBPACK_IMPORTED_MODULE_1__["default"],
  /**
   * @see ./save.js
   */
  save: _save__WEBPACK_IMPORTED_MODULE_2__["default"]
});
})();

/******/ })()
;
//# sourceMappingURL=index.js.map