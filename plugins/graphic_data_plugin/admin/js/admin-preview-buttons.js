import { render_modal } from '@graphic-data/modal-render';
import { render_interactive_plots, render_tab_info } from '@graphic-data/figure-render';
import { make_title, loadSVG } from '@graphic-data/scene-render';

// graphicDataSceneData is used by the preview handlers to pass form data to
// make_title() / scene-render.js. Keep on window so scene-render can read it.
if ( typeof window.graphicDataSceneData === 'undefined' ) {
    window.graphicDataSceneData = {};
}
const graphicDataSceneData = window.graphicDataSceneData;

// FIGURES Admin error handling for missing figure data in preview mode. Operates in figure-render.js
document.addEventListener( 'graphic-data:figurePreviewError', ( e ) => {
    const { tabContentElement: divID, figureType } = e.detail;
	if (figureType === 'Interactive') {
		//Preview error message in admin

		let fileInputElement;
		let graphTypeInputElement;
		let lineTypeInputElement;
		let barTypeInputElement;
		let existingFileInputElement;

		try {
			fileInputElement = document.getElementById('file-label').value;
		} catch {}
		try {
			existingFileInputElement =
				document.getElementById('existing-file-name').value;
		} catch {}
		try {
			graphTypeInputElement = document.getElementById('graphType').value;
		} catch {}
		try {
			lineTypeInputElement = document.getElementById('Line1').value;
		} catch {}
		try {
			barTypeInputElement = document.getElementById('Bar1').value;
		} catch {}

		if (
			( (window.location.href.includes('post.php') || window.location.href.includes('post-new.php')) &&
				(fileInputElement === '' ||
					graphTypeInputElement === 'None')) ||
			lineTypeInputElement === 'None' ||
			barTypeInputElement === 'None' ||
			existingFileInputElement === ''
		) {
			const errorMessageSummary = document.createElement('div');
			errorMessageSummary.id = 'errorMessageSummary';
			errorMessageSummary.style.textAlign = 'center';
			errorMessageSummary.style.color = 'red';
			errorMessageSummary.style.fontWeight = 'bold';
			errorMessageSummary.style.margin = '5%';
			// Clear any previous error messages if necessary
			errorMessageSummary.textContent =
				'Please upload a file, choose a graph type, and make data selections to preview an interactive figure. Be sure to check all options.';

			// Avoid appending multiple error messages repeatedly
			if (!divID.contains(errorMessageSummary)) {
				divID.appendChild(errorMessageSummary);
			}
		}
	} else if (window.location.href.includes('post.php') || window.location.href.includes('post-new.php')) {
		setTimeout(() => {
			const figure = document.querySelector('#myTabContent .figure');
			figure.remove();
		}, 50);

		const errorMessageSummary = document.createElement('div');
		errorMessageSummary.style.textAlign = 'center';
		errorMessageSummary.style.color = 'red';
		errorMessageSummary.style.fontWeight = 'bold';
		errorMessageSummary.style.margin = '5%';
		// Clear any previous error messages if necessary
		errorMessageSummary.textContent =
			'Please make an image selection or input code to preview your figure.  Be sure to check all options.';
		// Avoid appending multiple error messages repeatedly
		if (!divID.contains(errorMessageSummary)) {
			divID.appendChild(errorMessageSummary);
		}
		if (figureType === 'Code') {
			const codeDiv = document.getElementById('code_display_window');
			codeDiv.remove();
		}
	}
} );



/**
 * Waits for a Plotly graph to finish rendering in the WordPress admin.
 *
 * The promise resolves with the Plotly element when the
 * `plotly_afterplot` event fires.
 *
 * The promise rejects when:
 * - The figure validation error appears.
 * - Plotly does not finish rendering before the timeout expires.
 *
 * @param {number} timeoutMs Maximum time to wait in milliseconds.
 * @return {Promise<HTMLElement>} Resolves with the rendered Plotly element.
 */
function waitForPlotlyToFinish(timeoutMs = 10000) {
	return new Promise((resolve, reject) => {
		const expectedErrorMessage =
			'Please upload a file, choose a graph type, and make data selections to preview an interactive figure. Be sure to check all options.';

		let observer = null;
		let plotDiv = null;
		let plotListenerAdded = false;
		let settled = false;

		const cleanup = () => {
			if (observer) {
				observer.disconnect();
			}

			clearTimeout(timeoutId);
		};

		const finishWithError = (message) => {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			reject(new Error(message));
		};

		const handleAfterPlot = () => {
			if (settled) {
				return;
			}

			settled = true;
			cleanup();
			resolve(plotDiv);
		};

		const checkForErrorMessage = () => {
			const errorMessageSummary = document.querySelector(
				'#errorMessageSummary'
			);

			if (
				errorMessageSummary &&
				errorMessageSummary.textContent.trim() === expectedErrorMessage
			) {
				finishWithError(expectedErrorMessage);
				return true;
			}

			return false;
		};

		const checkForPlot = () => {
			if (plotListenerAdded) {
				return;
			}

			plotDiv = document.querySelector('.js-plotly-plot');

			if (!plotDiv) {
				return;
			}

			plotListenerAdded = true;
			plotDiv.once('plotly_afterplot', handleAfterPlot);
		};

		const timeoutId = setTimeout(() => {
			finishWithError(
				`Plotly did not finish rendering within ${timeoutMs}ms.`
			);
		}, timeoutMs);

		// Check whether either element already exists.
		if (checkForErrorMessage()) {
			return;
		}

		checkForPlot();

		// Continue watching for either the plot or the error message.
		observer = new MutationObserver(() => {
			if (checkForErrorMessage()) {
				return;
			}

			checkForPlot();
		});

		observer.observe(document.body, {
			childList: true,
			subtree: true,
			characterData: true
		});
	});
}

//PREVIEW BUTTON LOGIC FOR MODALS AND FIGURES
/**
 * Handles the click event for the modal preview button, generating a live preview of the modal.
 *
 * - Removes any existing preview window.
 * - Gathers info and photo entries to display as accordions if present.
 * - Displays the tagline and tab navigation if configured.
 * - Appends the constructed preview to the DOM.
 *
 * @modifies
 * - The DOM by removing and creating the modal preview window.
 */
// let previewFigureOrModalElements = document.querySelectorAll(
// 	'[data-depend-id="modal_preview"], [data-depend-id="modal_preview_mobile"],[data-depend-id="figure_preview_mobile"],[data-depend-id="figure_preview"]'
// );

// We're going to iterate through all the types of buttons (preview and save) on the admin screen and have different behaviors when a button is clicked
let postID = document.querySelector('[name="post_id"], [name="post_ID"]').value;
let postType = document.querySelector('[name="post_type"]').value;
let previewFigureOrModalElements; 

//Define our post type and the id so we can use it later in the save process for the html
if (postType === 'figure') {
	//with publish included in the list for saving graphs. 
	previewFigureOrModalElements = document.querySelectorAll('[data-depend-id="modal_preview"], [data-depend-id="modal_preview_mobile"],[data-depend-id="figure_preview_mobile"],[data-depend-id="figure_preview"],[id="publish"]');
} 
if (postType === 'modal') {
    previewFigureOrModalElements = document.querySelectorAll('[data-depend-id="modal_preview"], [data-depend-id="modal_preview_mobile"]');
} 
// If no button exist then previewFigureOrModalElements is an empty list.
if (!previewFigureOrModalElements) {
	previewFigureOrModalElements = [];
}

//console.log('previewFigureOrModalElements', previewFigureOrModalElements);

// If the number of elements in previewFigureOrModalElements list is greater than 0, let's iterate through these options.
if (previewFigureOrModalElements.length > 0) {
	previewFigureOrModalElements.forEach((el) => {
		el.addEventListener('click', async function (event) {
			window.mobileBool =
				el.getAttribute('data-depend-id') === 'scene_preview_mobile';


			// Prevent duplicate injection, remove existing to make way for new.
			if (
				document.getElementById('myModal') ||
				document.getElementById('mobileModal')
			) {
				const modalEl = document.getElementById('myModal');
				const mobileModal = document.getElementById('mobileModal');
				if (modalEl) {
					modalEl.remove();
				}
				if (mobileModal) {
					mobileModal.remove();
				}
			}

			// --- INJECT MODAL HTML MARKUP to wpcontent---
			const markup = `
                    <!-- for the mobile image stuff -->
                    <div class="modal fade" id="mobileModal" tabindex="-1">
                    <div class="modal-dialog modal-lg" style="margin-top: 5%; max-width: 95%;">
                        <div class="modal-content">
                        <div class="modal-header">
                            <h4 id="modal-title1" class="modal-title"> Full Scene Image</h4>
                            <button id="close1" type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>
                        <div class="modal-body"></div>
                        </div>
                    </div>
                    </div>

                    <div class="modal fade" id="myModal" tabindex="-1">
                    <div class="modal-dialog modal-lg" style="margin: 5% auto;">
                        <div class="modal-content" aria-labelledby="modal-title">
                        <div class="modal-header">
                            <h4 id="modal-title" class="modal-title"></h4>
                            <button id="close1" type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body">
                            <div class="row">
                            <div id="tagline-container"></div>
                            <div id="accordion-container"></div>
                            </div>
                        </div>

                        <ul class="nav nav-tabs" id="myTab" role="tablist" style="margin-left: 1%;"></ul>
                        <div class="tab-content" id="myTabContent" style="margin-top: 2%; margin-left: 1%; margin-right: 1%;"></div>
                        </div>
                    </div>
                    </div>`;

			document.body.insertAdjacentHTML('beforeend', markup);


			const modalEl2 = document.getElementById('myModal');
			const dialog2 = modalEl2?.querySelector('.modal-dialog');
			
			//if we hit the save button, we do not want to show the modal window with the graph.
			if (el.id === 'publish') {
				dialog2.style.setProperty('visibility', 'hidden', 'important');
			}
			
			// Apply mobile preview sizing ONLY for mobile preview trigger
			if (
				el.getAttribute('data-depend-id') === 'modal_preview_mobile' ||
				el.getAttribute('data-depend-id') === 'figure_preview_mobile'
			) {
				window.mobileBool = true; // render_modal() reads layout from is_mobile() → mobileBool
				if (dialog2) {
					dialog2.style.minWidth = '22%';
					dialog2.style.width = '350px';
					dialog2.style.paddingTop = '2%';
				}
			}

			//remove mobile css if present
			if (
				el.getAttribute('data-depend-id') === 'modal_preview' ||
				el.getAttribute('data-depend-id') === 'figure_preview'
			) {
				window.mobileBool = false;
				document.getElementById('sw-modal-accordion-btn-css')?.remove();
			}


			// Wait for DOM update, then show the modal (Bootstrap 5 API)
			setTimeout(() => {
				const modalEl = document.getElementById('myModal');
				if (modalEl && typeof bootstrap !== 'undefined') {
					const modalInstance = new bootstrap.Modal(modalEl);
					modalInstance.show();
				} else {
					console.warn(
						'Bootstrap not found — modal injected but not activated.'
					);
				}
			}, 100);

			const hasModalPreview = document.querySelectorAll(
				'[data-depend-id="modal_preview"],[data-depend-id="modal_preview_mobile"]'
			);
			const hasFigurePreview = document.querySelectorAll(
				'[data-depend-id="figure_preview"],[data-depend-id="figure_preview_mobile"]'
			);

			// --- GATHER MODAL DATA FROM FORM FIELDS AND PRODUCE A MODAL PREVIEW---
			if (hasModalPreview !== null && hasModalPreview.length > 0) {
				// --- ICON + TITLE ---
				const iconSelected =
					document.getElementsByName('modal_icons')[0]?.value ||
					'no_icon_selected';
				const modalTitle = document.getElementById('title').value || '';
				const modalTagline =
					document.getElementsByName('modal_tagline')[0]?.value || '';
				const modalTabNumber = Number(
					document.getElementsByName('modal_tab_number')[0]?.value ||
						0
				);

				// --- COUNT INFO + PHOTO ENTRIES ---
				let modal_info_entries = 0;
				let modal_photo_entries = 0;
				const modal_info_elements = [];
				const modal_photo_elements = [];

				for (let i = 1; i < 7; i++) {
					const photo_text =
						document.getElementsByName(
							`modal_photo${i}[modal_photo_text${i}]`
						)[0]?.value || '';
					const photo_url =
						document.getElementsByName(
							`modal_photo${i}[modal_photo_url${i}]`
						)[0]?.value || '';
					const info_text =
						document.getElementsByName(
							`modal_info${i}[modal_info_text${i}]`
						)[0]?.value || '';
					const info_url =
						document.getElementsByName(
							`modal_info${i}[modal_info_url${i}]`
						)[0]?.value || '';

					if (photo_text !== '' || photo_url !== '') {
						modal_photo_entries++;
						modal_photo_elements.push(i);
					}
					if (info_text !== '' || info_url !== '') {
						modal_info_entries++;
						modal_info_elements.push(i);
					}
				}

				// --- BUILD STRUCTURED OBJECT ---
				const modal_data = {
					id: 0, // you can fill in dynamically later
					slug: modalTitle.toLowerCase().replace(/\s+/g, '-'),
					type: 'modal',
					title: { rendered: modalTitle },
					modal_tagline: modalTagline,
					modal_info_entries,
					modal_photo_entries,
					modal_tab_number: modalTabNumber,
					icon_function: 'Modal',
					modal_icon_order: '1',
					icon_toc_section: '1',
					modal_published: 'published',
					modal_scene: '',
					class_list: [],
					_links: {},
				};

				// --- ADD INFO + PHOTO OBJECTS ---
				for (let i = 1; i <= 6; i++) {
					const info_text =
						document.getElementsByName(
							`modal_info${i}[modal_info_text${i}]`
						)[0]?.value || '';
					const info_url =
						document.getElementsByName(
							`modal_info${i}[modal_info_url${i}]`
						)[0]?.value || '';
					modal_data[`modal_info${i}`] = {
						[`modal_info_text${i}`]: info_text,
						[`modal_info_url${i}`]: info_url,
					};

					const photo_text =
						document.getElementsByName(
							`modal_photo${i}[modal_photo_text${i}]`
						)[0]?.value || '';
					const photo_url =
						document.getElementsByName(
							`modal_photo${i}[modal_photo_url${i}]`
						)[0]?.value || '';
					const photo_internal =
						document.getElementsByName(
							`modal_photo${i}[modal_photo_internal${i}]`
						)[0]?.value || '';
					const photo_loc =
						document.getElementsByName(
							`modal_photo${i}[modal_photo_location${i}]`
						)[0]?.value || 'External';

					modal_data[`modal_photo${i}`] = {
						[`modal_photo_location${i}`]: photo_loc,
						[`modal_photo_text${i}`]: photo_text,
						[`modal_photo_url${i}`]: photo_url,
						[`modal_photo_internal${i}`]: photo_internal,
					};
				}

				// --- ADD TAB TITLES ---
				for (let i = 1; i <= modalTabNumber; i++) {
					const tab_title =
						document.getElementsByName(`modal_tab_title${i}`)[0]
							?.value || '';
					modal_data[`modal_tab_title${i}`] = tab_title;
				}

				// --- WRAP IN OUTER OBJECT USING ICON AS KEY ---
				const child_obj = {
					[iconSelected]: {
						title: modalTitle,
						modal: true,
						original_name: iconSelected,
						modal_id: 0,
						modal_data,
					},
				};


				render_modal(iconSelected, child_obj, modal_data);

			}

			// --- GATHER FIGURE DATA FROM FORM FIELDS ---
			if (hasFigurePreview !== null && hasFigurePreview.length > 0) {

				// we're going to pause the save if we're saving a figure to allow for it to load.
				const figureType = document.getElementsByName('figure_path')[0]?.value;
				if (el.id === 'publish' && figureType === "Interactive") {
					event.preventDefault();
				}

				//MODAL PREVIEW LOGIC
				const iconSelected = 'ExampleKey';
				const modal_data = {
					id: 0,
					slug: 'Example Modal Title',
					type: 'modal',
					title: { rendered: 'Example Modal Title' },
					modal_tagline: 'Example Tagline',
					modal_info_entries: 1,
					modal_photo_entries: 1,
					modal_tab_number: 1,
					icon_function: 'Modal',
					modal_icon_order: '1',
					icon_toc_section: '1',
					modal_published: 'published',
					modal_scene: '',
					class_list: [],
					_links: {},
					modal_info1: {
						modal_info_text1: 'Example Information Link',
						modal_info_url1: '',
					},
					modal_photo1: {
						modal_photo_location1: 'External',
						modal_photo_text1: 'Example Photo Link',
						modal_photo_url1: '',
						modal_photo_internal1: '',
					},
					modal_info2: { modal_info_text2: '', modal_info_url2: '' },
					modal_photo2: {
						modal_photo_location2: 'External',
						modal_photo_text2: '',
						modal_photo_url2: '',
						modal_photo_internal2: '',
					},
					modal_info3: { modal_info_text3: '', modal_info_url3: '' },
					modal_photo3: {
						modal_photo_location3: 'External',
						modal_photo_text3: '',
						modal_photo_url3: '',
						modal_photo_internal3: '',
					},
					modal_info4: { modal_info_text4: '', modal_info_url4: '' },
					modal_photo4: {
						modal_photo_location4: 'External',
						modal_photo_text4: '',
						modal_photo_url4: '',
						modal_photo_internal4: '',
					},
					modal_info5: { modal_info_text5: '', modal_info_url5: '' },
					modal_photo5: {
						modal_photo_location5: 'External',
						modal_photo_text5: '',
						modal_photo_url5: '',
						modal_photo_internal5: '',
					},
					modal_info6: { modal_info_text6: '', modal_info_url6: '' },
					modal_photo6: {
						modal_photo_location6: 'External',
						modal_photo_text6: '',
						modal_photo_url6: '',
						modal_photo_internal6: '',
					},
					modal_tab_title1: 'Example Modal Tab',
				};

				const child_obj = {
					[iconSelected]: {
						title: 'Example Modal Title',
						modal: true,
						original_name: 'Example Modal Title',
						modal_id: 0,
						modal_data,
					},
				};

				render_modal(iconSelected, child_obj, modal_data);

				//FIGURE PREVIEW LOGIC
				const info_obj = {
					figure_published:
						document.getElementsByName('figure_published')[0]
							?.value,
					postID: document.getElementsByName('post_ID')[0]?.value,
					status: 'full_figure',
					scienceLink: document.getElementsByName(
						'figure_science_info[figure_science_link_url]'
					)[0]?.value,
					scienceText: document.getElementsByName(
						'figure_science_info[figure_science_link_text]'
					)[0]?.value,

					dataLink: document.getElementsByName(
						'figure_data_info[figure_data_link_url]'
					)[0]?.value,
					dataText: document.getElementsByName(
						'figure_data_info[figure_data_link_text]'
					)[0]?.value,

					imageLink: (function () {
						const type =
							document.getElementsByName('figure_path')[0]?.value;
						if (type === 'Internal') {
							return document.getElementsByName('figure_image')[0]
								?.value;
						}
						if (type === 'External') {
							return document.getElementsByName(
								'figure_external_url'
							)[0]?.value;
						}
						return ''; // no image for Interactive/Code
					})(),

					code: document.getElementsByName('figure_code')[0]?.value,

					externalAlt:
						document.getElementsByName('figure_external_alt')[0]
							?.value ?? '',

					shortCaption: document.getElementById(
						'figure_caption_short'
					)?.value,
					longCaption: document.getElementById('figure_caption_long')
						?.value,

					figureType:
						document.getElementsByName('figure_path')[0]?.value,
					figureTitle:
						document.getElementsByName('figure_title')[0]?.value,

					figure_interactive_arguments: document.getElementsByName(
						'figure_interactive_arguments'
					)[0]?.value,

					figure_interactive_args_rendered: document.getElementsByName(
						'figure_interactive_args_rendered'
					)[0]?.value,
				};

				info_obj.shortCaption = getWordPressEditorContent('figure_caption_short');
				info_obj.longCaption = getWordPressEditorContent('figure_caption_long');

				const info_obj_figure_only = {
					figure_published:
						document.getElementsByName('figure_published')[0]?.value ?? '',
				
					postID:
						document.getElementsByName('post_ID')[0]?.value ?? '',
				
					status: 'figure_only',
				
					scienceLink: '',
					scienceText: '',
					dataLink: '',
					dataText: '',
				
					imageLink: (function () {
						const type =
							document.getElementsByName('figure_path')[0]?.value ?? '';
				
						if (type === 'Internal') {
							return (
								document.getElementsByName('figure_image')[0]?.value ?? ''
							);
						}
				
						if (type === 'External') {
							return (
								document.getElementsByName('figure_external_url')[0]?.value ?? ''
							);
						}
				
						return ''; // No image for Interactive or Code
					})(),
				
					code:
						document.getElementsByName('figure_code')[0]?.value ?? '',
				
					externalAlt:
						document.getElementsByName('figure_external_alt')[0]?.value ?? '',
				
					shortCaption: '',
					longCaption: '',
				
					figureType:
						document.getElementsByName('figure_path')[0]?.value ?? '',
				
					figureTitle:
						document.getElementsByName('figure_title')[0]?.value ?? '',
				
					figure_interactive_arguments:
						document.getElementsByName('figure_interactive_arguments')[0]?.value ??
						'',
				
					figure_interactive_args_rendered:
						document.getElementsByName('figure_interactive_args_rendered')[0]
							?.value ?? '',
				};

				const tabContentContainer =
					document.getElementById('myTabContent');
				const tabContentElement = document.getElementById(
					'example-modal-title-1-pane'
				);
				const idx = 0; // Since we are only rendering one figure here, index is 0
				(async () => {


					//When saving a form on the admin side, have the save wait until the graph is loaded.	
					const tabInfoResult = await render_tab_info(
						tabContentElement,
						tabContentContainer,
						info_obj,
						idx
					);

					//Render the interactive plots, this function also saves the figure_interactive_args_rendered to the field
					await render_interactive_plots(tabContentContainer, info_obj, null, tabInfoResult);


					if (el.id === 'publish') {
						generateAndSaveFigureFromPreview(el, info_obj, info_obj_figure_only);
					}
							
				})();
			}
		});
	});
}

//INJECT CSS FOR THE THEME WHEN MODAL, or FIGURE PREVIEW IS CLICKED
if (previewFigureOrModalElements.length > 0) {
	previewFigureOrModalElements.forEach((el) => {
		el.addEventListener('click', async function () {
			window.mobileBool =
				el.getAttribute('data-depend-id') === 'scene_preview_mobile';

			// Only inject CSS if not already loaded
			if (
				!document.getElementById('theme-css1') &&
				!document.getElementById('theme-css2')
			) {
				if (
					el.getAttribute('data-depend-id') === 'modal_preview' ||
					el.getAttribute('data-depend-id') === 'figure_preview'
				) {
					const css1 = document.createElement('link');
					css1.id = 'theme-css1';
					css1.rel = 'stylesheet';
					//css1.href = `${window.location.origin}/wp-content/themes/graphic_data_theme/assets/css/bootstrap.css`;
					css1.href = `${window.location.origin}/wp-content/plugins/graphic_data_plugin/admin/css/modal_desktop_modal-dialog.css`;
					document.head.appendChild(css1);
				}

				if (
					el.getAttribute('data-depend-id') ===
						'modal_preview_mobile' ||
					el.getAttribute('data-depend-id') ===
						'figure_preview_mobile'
				) {
					const css2 = document.createElement('link');
					css2.id = 'theme-css2';
					css2.rel = 'stylesheet';
					//css2.href = `${window.location.origin}/wp-content/themes/graphic_data_theme/style.css`;
					css2.href = `${window.location.origin}/wp-content/plugins/graphic_data_plugin/admin/css/modal_mobile_modal-dialog.css`;
					document.head.appendChild(css2);
				}

			}
		});
	});
}

//_________________________________________________________________________________________________________________

//LOGIC FOR SCENE PREVIEW MODE
function buildScenePayloadFromForm() {
	// Helpers
	const byIdVal = (id) => document.getElementById(id)?.value ?? '';
	const byNameVal = (name) =>
		document.getElementsByName(name)?.[0]?.value ?? '';

	const payload = {};

	// --- Top-level scene fields from your snippet ---
	payload.post_title = byIdVal('title'); // your h1 uses #title
	payload.scene_tagline = byNameVal('scene_tagline');
	payload.scene_location = byNameVal('scene_location');
	payload.scene_infographic = byNameVal('scene_infographic');
	payload.scene_hover_color = byNameVal('scene_hover_color');
	payload.scene_hover_text_color = byNameVal('scene_hover_text_color');
	payload.scene_text_toggle = byNameVal('scene_text_toggle');
	payload.scene_full_screen_button = byNameVal('scene_full_screen_button');
	payload.scene_toc_style = byNameVal('scene_toc_style');
	payload.scene_toc_style = 'list';

	// --- scene_info_entries + scene_info1..6 (nested objects) ---
	let infoCount = 0;
	for (let i = 1; i < 7; i++) {
		const textName = `scene_info${i}[scene_info_text${i}]`;
		const urlName = `scene_info${i}[scene_info_url${i}]`;

		const textVal = byNameVal(textName);
		const urlVal = byNameVal(urlName);

		// Match your example shape exactly
		payload[`scene_info${i}`] = {
			[`scene_info_text${i}`]: textVal,
			[`scene_info_url${i}`]: urlVal,
		};

		// Count "valid" entries the same way your accordion detection does
		if (textVal !== '' && urlVal !== '') {
			infoCount++;
		}
	}
	payload.scene_info_entries = String(infoCount);

	// --- scene_photo_entries + scene_photo1..6 (nested objects) ---
	let photoCount = 0;
	for (let i = 1; i < 7; i++) {
		const locName = `scene_photo${i}[scene_photo_location${i}]`;
		const textName = `scene_photo${i}[scene_photo_text${i}]`;
		const urlName = `scene_photo${i}[scene_photo_url${i}]`;
		const internalName = `scene_photo${i}[scene_photo_internal${i}]`;

		const locVal = byNameVal(locName) || 'External'; // your example defaults to External
		const textVal = byNameVal(textName);
		const urlVal = byNameVal(urlName);
		const internalVal = byNameVal(internalName);

		payload[`scene_photo${i}`] = {
			[`scene_photo_location${i}`]: locVal,
			[`scene_photo_text${i}`]: textVal,
			[`scene_photo_url${i}`]: urlVal,
			[`scene_photo_internal${i}`]: internalVal,
		};

		if (textVal !== '' && urlVal !== '') {
			photoCount++;
		}
	}
	payload.scene_photo_entries = String(photoCount);

	return payload;
}

function openSceneInModal(el) {
	// Obtain the modal body element injected by the click handler
	const sceneModalBody = document.getElementById('sceneModalBody');
	if (!sceneModalBody) {
		console.error('openSceneInModal: #sceneModalBody not found in DOM');
		return;
	}

	// -- INJECT MODAL HTML MARKUP to sceneModalBody---
	let markup;
	markup = `
        <div id="entire_thing">  
        <div id="title-container" ></div>
        <div id="mobile-view-image"></div>
        <div class="container-fluid" id="scene-fluid">
        <div class="row" id="scene-row">
            <div class="col-md-10" >
            <div id="svg1" class="responsive-image-container">
                
            </div>
            </div>

            <div class="col-md-2" id="toc-container" >

                <!-- TABLE OF CONTENTS WILL GO HERE -->

            </div>
        </div>
        </div>
        </div>           
    `;

	// Inject as the first child of #wpcontent
	sceneModalBody.insertAdjacentHTML('afterbegin', markup);
}

/**
 * Handles the click event for the "Scene preview" button, generating a live preview of the scene.
 *
 * This event listener dynamically creates a scene preview window that displays the scene title, tagline,
 * info and photo accordions, and a preview of the SVG infographic with highlighted icons. It ensures that
 * any previous preview is removed before generating a new one. The preview includes:
 * - Scene title (from the "title" field)
 * - Tagline (from the "scene_tagline" field)
 * - Accordions for info and photo links if any are present
 * - SVG infographic preview (if a valid SVG path is provided), with clickable icons highlighted using the scene's hover color
 * - A table of contents (TOC) listing the IDs of the SVG's icon layers, if present
 *
 * @event scene_preview_click
 *
 * @description
 * - Removes any existing preview window.
 * - Collects info and photo entries with both text and URL fields populated.
 * - Builds and appends accordions for info and photo links if present.
 * - Displays the tagline and scene title.
 * - Loads and displays the SVG infographic, highlights icon layers, and lists their IDs in a TOC.
 * - Handles errors in fetching or processing the SVG.
 *
 * @modifies
 * - The DOM by removing and creating the scene preview window, and by updating the SVG preview and TOC.
 *
 * @example
 * // This code is typically run on page load to enable scene preview functionality:
 * document.querySelector('[data-depend-id="scene_preview"]').addEventListener('click', ...);
 *
 * @global
 * - Assumes the existence of form fields named "title", "scene_tagline", "scene_info{n}[scene_info_text{n}]", "scene_info{n}[scene_info_url{n}]",
 *   "scene_photo{n}[scene_photo_text{n}]", "scene_photo{n}[scene_photo_url{n}]", "scene_infographic", "scene_hover_color", and "scene_location" in the DOM.
 * - Assumes the existence of the helper functions createAccordion and resizeSvg.
 * - Requires the SVG to have a group with id="icons" for icon highlighting and TOC generation.
 */
// Create scene preview from clicking on the "Scene preview button"
let previewSceneElements = document.querySelectorAll(
	'[data-depend-id="scene_preview"], [data-depend-id="scene_preview_mobile"]'
);
if (!previewSceneElements) {
	previewSceneElements = [];
}
if (previewSceneElements.length > 0) {
	previewSceneElements.forEach((el) => {
		el.addEventListener('click', async function () {
			window.mobileBool =
				el.getAttribute('data-depend-id') === 'scene_preview_mobile';

			// Remove any previous scene preview modal and clean up Bootstrap state
			const existingModal = document.getElementById('sceneModal');
			if (existingModal) {
				bootstrap.Modal.getInstance(existingModal)?.dispose();
				existingModal.remove();
			}
			document
				.querySelectorAll('.modal-backdrop')
				.forEach((b) => b.remove());
			document.body.classList.remove('modal-open');
			document.body.style.removeProperty('overflow');
			document.body.style.removeProperty('padding-right');

			// --- INJECT MODAL HTML MARKUP to wpcontent---
			const markup = `
                    <div class="modal fade" id="sceneModal" tabindex="-1">
                    <div class="modal-dialog modal-xl modal-dialog-scrollable">
                        <div class="modal-content">

                        <div class="modal-header">
                            <h5 class="modal-title1"></h5>
                            <button id="close1" type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body" id="sceneModalBody" style="padding: 0%;">
                        </div>

                        </div>
                    </div>
                    </div>
                `;

			document.body.insertAdjacentHTML('beforeend', markup);

			// Scope everything to the newly injected modal (critical)
			const modalEl = document.getElementById('sceneModal');
			const dialog = modalEl?.querySelector('.modal-dialog');

			// Reset inline styles every time (desktop baseline)
			if (dialog) {
				dialog.style.removeProperty('min-width');
				dialog.style.removeProperty('width');
				dialog.style.removeProperty('padding-top');
			}

			// Apply mobile preview sizing ONLY for mobile preview trigger
			if (el.getAttribute('data-depend-id') === 'scene_preview_mobile') {
				if (dialog) {
					dialog.style.minWidth = '27%';
					dialog.style.width = '450px';
					dialog.style.paddingTop = '2%'; // if you need this
				}
			}

			// Wait for DOM update, then show the modal (Bootstrap 5 API)
			setTimeout(() => {
				if (modalEl && typeof bootstrap !== 'undefined') {
					const modalInstance =
						bootstrap.Modal.getOrCreateInstance(modalEl);
					modalInstance.show();
				} else {
					console.warn(
						'Bootstrap not found — modal injected but not activated.'
					);
				}
			}, 0);

			//_____________________________________________________________________________________________________

			let url;
			try {
				openSceneInModal(el);
				graphicDataSceneData.titleArr = buildScenePayloadFromForm();
				if (graphicDataSceneData.titleArr.post_title == '') {
					graphicDataSceneData.titleArr.post_title =
						'No Scene Title Entered.';
				}
				await make_title();
				url = graphicDataSceneData.titleArr.scene_infographic;
			} catch (e) {
				console.error('Preview error:', e);
			}

			if (url != '') {
				loadSVG(url, 'svg1');
			}
			if (url === '') {
				const svgContainer = document.getElementById('svg1');
				svgContainer.innerText =
					"Please select/up an SVG image in the 'Infographic' field to preview the scene.";
				svgContainer.style.textAlign = 'center';
				svgContainer.style.margin = '5%';
				svgContainer.style.fontWeight = 'bold';
				svgContainer.style.color = 'red';
			}
		});
	});
}

//INJECT CSS FOR THE THEME WHEN SCENE IS CLICKED
if (previewSceneElements.length > 0) {
	previewSceneElements.forEach((el) => {
		el.addEventListener('click', async function () {
			// Only inject CSS if not already loaded
			if (
				!document.getElementById('theme-css1') &&
				!document.getElementById('theme-css2')
			) {
				if (el.getAttribute('data-depend-id') === 'scene_preview') {
					const css1 = document.createElement('link');
					css1.id = 'theme-css1';
					css1.rel = 'stylesheet';
					//css1.href = `${window.location.origin}/wp-content/themes/graphic_data_theme/assets/css/bootstrap.css`;
					css1.href = `${window.location.origin}/wp-content/plugins/graphic_data_plugin/admin/css/scene_desktop_entire_thing.css`;
					document.head.appendChild(css1);
				}

				if (
					el.getAttribute('data-depend-id') === 'scene_preview_mobile'
				) {
					const css2 = document.createElement('link');
					css2.id = 'theme-css2';
					css2.rel = 'stylesheet';
					//css2.href = `${window.location.origin}/wp-content/themes/graphic_data_theme/style.css`;
					css2.href = `${window.location.origin}/wp-content/plugins/graphic_data_plugin/admin/css/scene_mobile_title_container.css`;
					document.head.appendChild(css2);
				}
			}
		});
	});
}

//________________________________________________________________________________________

//Applies to  Scene, Figure, and Modals previews
// When the modal close button is clicked, remove both CSS files
document.addEventListener('click', function (e) {
	if (e.target && e.target.id === 'close1') {
		const css1 = document.getElementById('theme-css1');
		const css2 = document.getElementById('theme-css2');
		if (css1) {
			css1.remove();
		}
		if (css2) {
			css2.remove();
		}

		// const css3 = document.createElement('link');
		// css3.id = 'theme-css3';
		// css3.rel = 'stylesheet';
		// css3.href = `${window.location.origin}/wp-content/themes/graphic_data_theme/assets/css/bootstrap.min.css`;
		// document.head.appendChild(css3);
	}
});


//________________________________________________________________________________________

/**
 * Gets the current content from a WordPress TinyMCE editor.
 *
 * Uses TinyMCE directly when Visual mode is active and falls back
 * to the original textarea when Text mode is active.
 *
 * @param {string} editorID WordPress editor/textarea ID.
 *
 * @return {string} Current editor HTML.
 */
function getWordPressEditorContent(editorID) {
	const editor =
		window.tinymce?.get(editorID);

	if (
		editor &&
		editor.initialized &&
		!editor.isHidden()
	) {
		return editor.getContent({
			format: 'html'
		});
	}

	return (
		document.getElementById(editorID)?.value ??
		''
	);
}

//________________________________________________________________________________________

const pendingFigureHtmlSaveKey =
	'graphic-data-pending-figure-html-save';

/**
 * Checks whether the current page is the new Figure screen.
 *
 * @return {boolean}
 */
function isNewFigurePostPage() {
	const url = new URL(window.location.href);

	return (
		url.pathname.endsWith('/post-new.php') &&
		url.searchParams.get('post_type') === 'figure'
	);
}

/**
 * Gets the figure post ID from an existing-post URL.
 *
 * Expected URL:
 * post.php?post=379&action=edit
 *
 * @return {number|null}
 */
function getFigurePostIDFromURL() {
	const url = new URL(window.location.href);

	if (!url.pathname.endsWith('/post.php')) {
		return null;
	}

	const postID = Number.parseInt(
		url.searchParams.get('post'),
		10
	);

	if (!Number.isInteger(postID) || postID <= 0) {
		return null;
	}

	return postID;
}

/**
 * Prepares a figure and saves its standalone HTML file.
 *
 * New figures use a two-stage save:
 *
 * 1. Render and save the WordPress post so an ID is assigned.
 * 2. After WordPress reloads to post.php?post=NUMBER, generate the
 *    standalone HTML file and submit the post a second time.
 *
 * Existing figures generate the HTML immediately before saving.
 *
 * @param {HTMLElement} el WordPress publish/update button.
 * @param {Object} info_obj Figure information.
 *
 * @return {Promise<void>}
 */
async function generateAndSaveFigureFromPreview(
	el,
	info_obj,
	info_obj2
) {
	const publishButton = el;
	const figureType = info_obj['figureType'];
	const postForm = document.getElementById('post');

	// const newPostPage = isNewFigurePostPage();
	// const postID = getFigurePostIDFromURL();

	// const isFinishingInitialSave =
	// 	Boolean(
	// 		sessionStorage.getItem(
	// 			pendingFigureHtmlSaveKey
	// 		)
	// 	) &&
	// 	Boolean(postID);

	const newPostPage = isNewFigurePostPage();
	const postID = getFigurePostIDFromURL();

	const pendingFigureHtmlSave =
		sessionStorage.getItem(
			pendingFigureHtmlSaveKey
		);

	const isFinishingInitialSave =
		Boolean(pendingFigureHtmlSave) &&
		Boolean(postID);

	/*
	* Restore the objects saved before WordPress redirected from
	* post-new.php to post.php.
	*/
	if (isFinishingInitialSave) {
		try {
			const pendingData =
				JSON.parse(pendingFigureHtmlSave);

			info_obj =
				pendingData.info_obj ?? info_obj;

			info_obj2 =
				pendingData.info_obj2 ?? info_obj2;
		} catch (error) {
			throw new Error(
				'The pending figure information could not be restored.',
				{
					cause: error
				}
			);
		}
	}

	function setButtonText(button, text) {
		if (button.tagName === 'INPUT') {
			button.value = text;
		} else {
			button.textContent = text;
		}
	}

	function getButtonText(button) {
		if (button.tagName === 'INPUT') {
			return button.value;
		}

		return button.textContent;
	}

	function restorePublishButton(
		button,
		originalText,
		spinner
	) {
		button.disabled = false;

		setButtonText(
			button,
			originalText
		);

		spinner.classList.remove('is-active');
	}

	if (!postForm) {
		throw new Error(
			'The WordPress post form was not found.'
		);
	}

	const originalButtonText =
		getButtonText(publishButton);

	/*
	 * Use the existing WordPress spinner or create one.
	 */
	let spinner =
		publishButton.parentElement
			?.querySelector('.spinner');

	if (!spinner) {
		spinner = document.createElement('span');
		spinner.className = 'spinner';

		publishButton.insertAdjacentElement(
			'afterend',
			spinner
		);
	}

	publishButton.disabled = true;

	setButtonText(
		publishButton,
		isFinishingInitialSave
			? 'Generating figure HTML…'
			: 'Preparing figure…'
	);

	spinner.classList.add('is-active');

	try {
		let renderedValueJSON = null;

		/*
		 * Interactive figures need the Plotly JSON.
		 */
		if (figureType === 'Interactive') {
			const renderedTextarea =
				document.querySelector(
					'textarea[data-depend-id="' +
					'figure_interactive_args_rendered"]'
				);

			if (!renderedTextarea) {
				throw new Error(
					'figure_interactive_args_rendered ' +
					'was not found.'
				);
			}

			/*
			 * During the initial click, wait for the preview listener
			 * to finish rendering Plotly.
			 *
			 * After the first WordPress save and reload, the rendered
			 * JSON should already be stored in the textarea, so there
			 * is no need to render Plotly again.
			 */
			if (!isFinishingInitialSave) {
				await waitForPlotlyToFinish();
			}

			const renderedValue =
				renderedTextarea.value?.trim();

			if (!renderedValue) {
				throw new Error(
					'No rendered Plotly JSON was found.'
				);
			}

			try {
				renderedValueJSON =
					JSON.parse(renderedValue);
			} catch (error) {
				throw new Error(
					'The rendered Plotly JSON could not ' +
					'be parsed.',
					{
						cause: error
					}
				);
			}
		}

		/*
		 * FIRST SAVE
		 *
		 * The new-post URL has no post ID. Save the info object and
		 * submit WordPress normally. WordPress will reload the browser
		 * at post.php?post=NUMBER&action=edit.
		 */
		if (newPostPage && !postID) {
			sessionStorage.setItem(
				pendingFigureHtmlSaveKey,
				JSON.stringify({
					info_obj,
					info_obj2
				})
			);


			restorePublishButton(
				publishButton,
				originalButtonText,
				spinner
			);

			/*
			 * requestSubmit() submits the form without generating
			 * another click event.
			 */
			postForm.requestSubmit(
				publishButton
			);

			return;
		}

		/*
		 * The HTML file must never be created without a valid post ID.
		 */
		if (!postID) {
			throw new Error(
				'The figure post ID could not be determined.'
			);
		}

		/*
		 * SECOND SAVE OR NORMAL EXISTING-POST SAVE
		 *
		 * The post ID now exists, so generate and save the standalone
		 * figure HTML.
		 */
		const rootURL = window.location.origin;


		//First object file with full figure context

		const figureIframeGenerator =
			await createFigureHtml(
				renderedValueJSON,
				postID,
				rootURL,
				info_obj,
				figureType
			);

		const iframeCodeBox =
			document.querySelector(
				'textarea[data-depend-id="' +
				'figure_iframe_code"]'
			);

		if (!iframeCodeBox) {
			throw new Error(
				'figure_iframe_code was not found.'
			);
		}

		iframeCodeBox.value =
			figureIframeGenerator.figIframeHtmlPath;

		/*
		 * Notify any input/change listeners that the field changed.
		 */
		iframeCodeBox.dispatchEvent(
			new Event('input', {
				bubbles: true
			})
		);

		iframeCodeBox.dispatchEvent(
			new Event('change', {
				bubbles: true
			})
		);

		await saveHtmlToServer(
			figureIframeGenerator.figIframeHtml,
			`${figureIframeGenerator.figIframeHtmlFileName}.html`,
			figureIframeGenerator.figIframeHtmlPath,
			postID
		);

		//Second object with figure and title only

		const figureIframeGenerator2 =
			await createFigureHtml(
				renderedValueJSON,
				postID,
				rootURL,
				info_obj2,
				figureType
			);

			const iframeCodeBox2 =
			document.querySelector(
				'textarea[data-depend-id="' +
				'figure_iframe_code"]'
			);

		if (!iframeCodeBox2) {
			throw new Error(
				'figure_iframe_code was not found.'
			);
		}

		iframeCodeBox2.value =
			figureIframeGenerator2.figIframeHtmlPath;

		/*
		 * Notify any input/change listeners that the field changed.
		 */
		iframeCodeBox2.dispatchEvent(
			new Event('input', {
				bubbles: true
			})
		);

		iframeCodeBox2.dispatchEvent(
			new Event('change', {
				bubbles: true
			})
		);

		await saveHtmlToServer(
			figureIframeGenerator2.figIframeHtml,
			`${figureIframeGenerator2.figIframeHtmlFileName}.html`,
			figureIframeGenerator2.figIframeHtmlPath,
			postID
		);


		/*
		 * Remove the flag before the second submission. Otherwise,
		 * the next reload would trigger another save.
		 */
		sessionStorage.removeItem(
			pendingFigureHtmlSaveKey
		);

		/*
		 * Allow input/change handlers to finish.
		 */
		await new Promise((resolve) => {
			setTimeout(resolve, 0);
		});

		restorePublishButton(
			publishButton,
			originalButtonText,
			spinner
		);

		/*
		 * Submit without creating another click event.
		 */
		postForm.requestSubmit(
			publishButton
		);
	} catch (error) {
		console.error(
			'Figure preparation failed:',
			error
		);

		restorePublishButton(
			publishButton,
			originalButtonText,
			spinner
		);

		if (!window.location.href.includes('post-new.php')) {
			alert(
				'The figure could not be prepared for saving.'
			);
		}
	}
}

/**
 * Finishes the second stage of a new Figure save.
 *
 * WordPress has now redirected from:
 *
 * post-new.php?post_type=figure
 *
 * to:
 *
 * post.php?post=NUMBER&action=edit
 */
window.addEventListener('load', async function () {
	const pendingSaveJSON =
		sessionStorage.getItem(
			pendingFigureHtmlSaveKey
		);

	if (!pendingSaveJSON) {
		return;
	}

	const postID = getFigurePostIDFromURL();

	if (!postID) {
		return;
	}

	let pendingSave;

	try {
		pendingSave =
			JSON.parse(pendingSaveJSON);
	} catch (error) {
		console.error(
			'The pending figure-save information ' +
			'could not be parsed:',
			error
		);

		sessionStorage.removeItem(
			pendingFigureHtmlSaveKey
		);

		return;
	}

	const publishButton =
		document.getElementById('publish');

	if (
		!publishButton ||
		!pendingSave.info_obj
	) {
		return;
	}

	await generateAndSaveFigureFromPreview(
		publishButton,
		pendingSave.info_obj
	);
});



/**
 * Creates a standalone HTML document for a complete figure.
 *
 * Supported figure types:
 * - Interactive: renders a saved Plotly figure.
 * - Internal: renders an image stored in WordPress.
 * - External: renders an externally hosted image.
 * - Code: injects trusted HTML, CSS, and JavaScript.
 *
 * The generated document also includes:
 * - Science/source and data links
 * - Figure title
 * - Short caption
 * - Expandable long caption
 * - Primary-site and Graphic Data footer links
 * - Responsive iframe-height communication
 *
 * Rich-text captions, custom CSS, and code figures are inserted as HTML.
 * These values should be sanitized or restricted appropriately in WordPress.
 *
 * @param {Object|null} savedFigure Saved Plotly figure data.
 * @param {number|string} figureID WordPress figure post ID.
 * @param {string} rootURL Primary website root URL.
 * @param {Object} info_obj Figure content and metadata.
 * @param {string} figureType Interactive, Internal, External, or Code.
 *
 * @return {Promise<Object>} Generated HTML and iframe information.
 */
export async function createFigureHtml(
	savedFigure,
	figureID,
	rootURL,
	info_obj = {},
	figureType = 'Interactive'
) {
	/**
	 * Returns the first populated property found in info_obj.
	 *
	 * @param {string[]} keys Property names to check.
	 * @param {*} fallback Default value.
	 *
	 * @return {*} First populated value or fallback.
	 */
	function getInfoValue(keys, fallback = '') {
		for (const key of keys) {
			if (
				Object.prototype.hasOwnProperty.call(info_obj, key) &&
				info_obj[key] !== null &&
				info_obj[key] !== undefined &&
				info_obj[key] !== ''
			) {
				return info_obj[key];
			}
		}

		return fallback;
	}

	/**
	 * Escapes text before inserting it into HTML.
	 *
	 * @param {*} value Value to escape.
	 *
	 * @return {string} Escaped HTML.
	 */
	function escapeHtml(value) {
		return String(value ?? '')
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;');
	}

	/**
	 * Validates a URL before inserting it into an href attribute.
	 *
	 * @param {*} value URL value.
	 * @param {string} fallback Fallback URL.
	 *
	 * @return {string} Escaped safe URL.
	 */
	function safeUrl(value, fallback = '#') {
		const url = String(value ?? '').trim();

		if (!url) {
			return escapeHtml(fallback);
		}

		const allowedUrl =
			/^(https?:|mailto:|tel:|\/|#|\.\/|\.\.\/)/i.test(url);

		return escapeHtml(
			allowedUrl
				? url
				: fallback
		);
	}

	/**
	 * Validates a URL before inserting it into an image src attribute.
	 *
	 * @param {*} value Image URL.
	 * @param {string} fallback Fallback image URL.
	 *
	 * @return {string} Escaped safe image URL.
	 */
	function safeImageUrl(value, fallback = '') {
		const url = String(value ?? '').trim();

		if (!url) {
			return escapeHtml(fallback);
		}

		const allowedUrl =
			/^(https?:|\/\/|blob:|data:image\/|\/|\.\/|\.\.\/)/i.test(
				url
			);

		return escapeHtml(
			allowedUrl
				? url
				: fallback
		);
	}

	/**
	 * Makes a value safe for placement inside an inline script.
	 *
	 * @param {*} value Value to serialize.
	 *
	 * @return {string} Serialized JavaScript value.
	 */
	function serializeForScript(value) {
		return JSON
			.stringify(value)
			.replace(/<\/script/gi, '<\\/script');
	}

	/**
	 * Creates an optional source or data link.
	 *
	 * @param {Object} options Link options.
	 * @param {string} options.url Link URL.
	 * @param {string} options.text Link text.
	 * @param {string} options.icon Display icon.
	 * @param {string} options.className Additional CSS class.
	 *
	 * @return {string} Link HTML or an empty string.
	 */
	function buildInformationLink({
		url,
		text,
		icon,
		className
	}) {
		if (!url) {
			return '';
		}

		return `
			<a
				href="${safeUrl(url)}"
				target="_blank"
				rel="noopener noreferrer"
				class="figure-information-link ${escapeHtml(className)}"
			>
				<span aria-hidden="true">${escapeHtml(icon)}</span>
				<span>${escapeHtml(text)}</span>
			</a>
		`;
	}

	const normalizedFigureID = String(figureID);

	const normalizedRootURL = String(rootURL ?? '')
		.trim()
		.replace(/\/+$/, '');


	let figIframeHtmlFileName;
	let figIframeHtmlPath;
	if (info_obj['status'] === 'full_figure') {
		figIframeHtmlFileName = `figure-${normalizedFigureID}`;
		figIframeHtmlPath =
			`${normalizedRootURL}/wp-content/data/` +
			`figure_${normalizedFigureID}/` +
			`${figIframeHtmlFileName}.html`;
	}
	if (info_obj['status'] === 'figure_only') {
		figIframeHtmlFileName = `figure-${normalizedFigureID}_figure_only`;
		figIframeHtmlPath =
			`${normalizedRootURL}/wp-content/data/` +
			`figure_${normalizedFigureID}/` +
			`${figIframeHtmlFileName}.html`;
	}

	const figureContentElementID =
		`figure-content-${normalizedFigureID}`;

	const iframeElementID =
		`figure-iframe-${normalizedFigureID}`;

	/*
	 * General figure information.
	 */
	const figureTitle = getInfoValue(
		[
			'figureTitle',
			'figure_title',
			'title'
		],
		``
	);

	const requestedFigureType = getInfoValue(
		[
			'figureType',
			'figure_type'
		],
		figureType
	);

	const supportedFigureTypes = {
		interactive: 'Interactive',
		internal: 'Internal',
		external: 'External',
		code: 'Code'
	};

	const normalizedFigureType =
		supportedFigureTypes[
			String(requestedFigureType)
				.trim()
				.toLowerCase()
		] || String(requestedFigureType).trim();

	/*
	 * Science/source link.
	 */
	const sourceURL = getInfoValue([
		'scienceLink',
		'scienceURL',
		'sourceLink',
		'sourceURL',
		'figureScienceLink',
		'figure_science_link_url'
	]);

	const sourceText = getInfoValue(
		[
			'scienceText',
			'sourceText',
			'figureScienceLinkText',
			'figure_science_link_text'
		],
		'Source'
	);

	/*
	 * Data link.
	 */
	const dataURL = getInfoValue([
		'dataLink',
		'dataURL',
		'figureDataLink',
		'figure_data_link_url'
	]);

	const dataText = getInfoValue(
		[
			'dataText',
			'figureDataLinkText',
			'figure_data_link_text'
		],
		'Data'
	);

	/*
	 * Captions.
	 */
	const shortCaption = getInfoValue([
		'caption',
		'shortCaption',
		'captionShort',
		'figureCaptionShort',
		'figure_caption_short'
	]);

	const longCaption = getInfoValue([
		'extendedCaption',
		'longCaption',
		'captionLong',
		'figureCaptionLong',
		'figure_caption_long'
	]);

	/*
	 * Internal and external image values.
	 */
	const imageURL = getInfoValue([
		'imageLink',
		'imageURL',
		'imageUrl',
		'image_link',
		'figureImage',
		'figure_image',
		'externalURL',
		'externalUrl',
		'figureExternalURL',
		'figure_external_url'
	]);

	const imageAlt = getInfoValue([
		'externalAlt',
		'external_alt',
		'imageAlt',
		'image_alt',
		'figureExternalAlt',
		'figure_external_alt'
	]);

	/*
	 * Code figure value.
	 */
	const embedCode = getInfoValue([
		'code',
		'embedCode',
		'embed_code',
		'figureCode',
		'figure_code'
	]);

	/*
	 * Optional CSS generated by the preview system.
	 */
	const desktopCSS = getInfoValue([
		'desktopCSS',
		'desktopCss',
		'desktop_css'
	]);

	const mobileCSS = getInfoValue([
		'mobileCSS',
		'mobileCss',
		'mobile_css'
	]);

	/**
	 * Creates the image markup for Internal and External figures.
	 *
	 * Internal figures request WordPress media alt text when no explicit
	 * alt text was supplied. External figures use an empty alt attribute
	 * when no alt text was supplied.
	 *
	 * @param {string} imageType Internal or External.
	 *
	 * @return {string} Image markup and supporting script.
	 */
	function buildImageFigureHTML(imageType) {
		const imageElementID =
			`img_${normalizedFigureID}`;

		const errorElementID =
			`${imageElementID}-error`;

		if (!imageURL) {
			return `
				<div
					class="figure-error"
					role="alert"
				>
					No image URL was supplied for this
					${escapeHtml(imageType)} figure.
				</div>
			`;
		}

		const shouldRetrieveAltText =
			imageType === 'Internal' &&
			!imageAlt;

		return `
			<div class="figure-image-container">
				<img
					id="${escapeHtml(imageElementID)}"
					class="figure-image"
					src="${safeImageUrl(imageURL)}"
					alt="${escapeHtml(imageAlt)}"
					loading="lazy"
					decoding="async"
				>

				<p
					id="${escapeHtml(errorElementID)}"
					class="figure-error"
					role="alert"
					hidden
				>
					The figure image could not be loaded.
				</p>
			</div>

			<script>
				(function () {
					"use strict";

					const imageElementID =
						${serializeForScript(imageElementID)};

					const errorElementID =
						${serializeForScript(errorElementID)};

					const image =
						document.getElementById(
							imageElementID
						);

					const errorElement =
						document.getElementById(
							errorElementID
						);

					const sendDocumentHeight =
						window.graphicDataFigureEmbed &&
						window.graphicDataFigureEmbed.sendHeight;

					if (!image) {
						console.error(
							"Figure image element was not found:",
							imageElementID
						);

						if (sendDocumentHeight) {
							sendDocumentHeight();
						}

						return;
					}

					function handleImageLoaded() {
						image.hidden = false;

						if (errorElement) {
							errorElement.hidden = true;
						}

						if (sendDocumentHeight) {
							sendDocumentHeight();

							requestAnimationFrame(
								sendDocumentHeight
							);
						}
					}

					function handleImageError() {
						console.error(
							"Unable to load figure image:",
							image.src
						);

						image.hidden = true;

						if (errorElement) {
							errorElement.hidden = false;
						}

						if (sendDocumentHeight) {
							sendDocumentHeight();
						}
					}

					image.addEventListener(
						"load",
						handleImageLoaded
					);

					image.addEventListener(
						"error",
						handleImageError
					);

					${
						shouldRetrieveAltText
							? `
								const siteRoot =
									${serializeForScript(
										normalizedRootURL
									)};

								const altTextEndpoint =
									siteRoot +
									"/wp-json/graphic_data/v1/" +
									"media/alt-text-by-url?image_url=" +
									encodeURIComponent(image.src);

								fetch(
									altTextEndpoint,
									{
										credentials: "same-origin"
									}
								)
									.then(function (response) {
										if (!response.ok) {
											throw new Error(
												"Alt-text request failed " +
												"with status " +
												response.status
											);
										}

										return response.json();
									})
									.then(function (data) {
										if (
											data &&
											data.alt_text
										) {
											image.alt =
												data.alt_text;
										}
									})
									.catch(function (error) {
										console.error(
											"Unable to retrieve image alt text:",
											error
										);
									});
							`
							: ''
					}

					if (image.complete) {
						if (image.naturalWidth > 0) {
							handleImageLoaded();
						} else {
							handleImageError();
						}
					}
				})();
			</script>
		`;
	}

	/**
	 * Creates the Plotly markup for an Interactive figure.
	 *
	 * @return {string} Plotly markup and rendering script.
	 */
	function buildInteractiveFigureHTML() {
		const cleanFigure = {
			data: savedFigure?.data || [],
			layout: JSON.parse(
				JSON.stringify(
					savedFigure?.layout || {}
				)
			),
			config: {
				...(savedFigure?.config || {}),
				responsive: true
			}
		};

		delete cleanFigure.layout.width;
		delete cleanFigure.layout.height;

		cleanFigure.layout.autosize = true;

		const figureJSON =
			serializeForScript(cleanFigure);

		const targetIDJSON =
			serializeForScript(
				figureContentElementID
			);

		return `
			<div
				id="${escapeHtml(figureContentElementID)}"
				class="plotly-figure"
				role="img"
				aria-label="${escapeHtml(figureTitle)}"
			></div>

			<script>
				(function () {
					"use strict";

					const chartID = ${targetIDJSON};

					const chart =
						document.getElementById(chartID);

					const fig = ${figureJSON};

					const sendDocumentHeight =
						window.graphicDataFigureEmbed &&
						window.graphicDataFigureEmbed.sendHeight;

					if (!chart) {
						console.error(
							"Plotly figure target was not found:",
							chartID
						);

						if (sendDocumentHeight) {
							sendDocumentHeight();
						}

						return;
					}

					function resizePlot() {
						if (
							typeof Plotly === "undefined" ||
							!chart.classList.contains(
								"js-plotly-plot"
							)
						) {
							return;
						}

						Plotly.Plots.resize(chart);

						if (sendDocumentHeight) {
							sendDocumentHeight();
						}
					}

					function renderPlot() {
						Plotly.react(
							chart,
							fig.data || [],
							fig.layout || {},
							fig.config || {}
						)
							.then(function () {
								resizePlot();

								requestAnimationFrame(
									resizePlot
								);
							})
							.catch(function (error) {
								console.error(
									"Unable to render Plotly figure:",
									error
								);

								chart.innerHTML =
									'<p class="figure-error">' +
									'The interactive figure ' +
									'could not be loaded.' +
									'</p>';

								if (sendDocumentHeight) {
									sendDocumentHeight();
								}
							});
					}

					function loadPlotly() {
						if (
							typeof Plotly !== "undefined"
						) {
							renderPlot();
							return;
						}

						const existingScript =
							document.querySelector(
								'script[data-plotly-library="true"]'
							);

						if (existingScript) {
							existingScript.addEventListener(
								"load",
								renderPlot,
								{ once: true }
							);

							return;
						}

						const plotlyScript =
							document.createElement(
								"script"
							);

						plotlyScript.src =
							"https://cdn.plot.ly/" +
							"plotly-2.35.2.min.js";

						plotlyScript.async = true;

						plotlyScript.dataset.plotlyLibrary =
							"true";

						plotlyScript.addEventListener(
							"load",
							renderPlot,
							{ once: true }
						);

						plotlyScript.addEventListener(
							"error",
							function () {
								chart.innerHTML =
									'<p class="figure-error">' +
									'The Plotly library ' +
									'could not be loaded.' +
									'</p>';

								if (sendDocumentHeight) {
									sendDocumentHeight();
								}
							},
							{ once: true }
						);

						document.head.appendChild(
							plotlyScript
						);
					}

					let resizeTimer = null;

					window.addEventListener(
						"resize",
						function () {
							window.clearTimeout(
								resizeTimer
							);

							resizeTimer =
								window.setTimeout(
									resizePlot,
									100
								);
						}
					);

					loadPlotly();

					if (sendDocumentHeight) {
						sendDocumentHeight();
					}
				})();
			</script>
		`;
	}

	/**
	 * Creates a Code figure.
	 *
	 * Script elements are recreated because scripts inserted through
	 * innerHTML do not execute automatically.
	 *
	 * External scripts are loaded sequentially so their original order
	 * is preserved.
	 *
	 * @return {string} Code target and executable injection script.
	 */
	function buildCodeFigureHTML() {
		const codeElementID =
			`code-display-window-${normalizedFigureID}`;

		const codeJSON =
			serializeForScript(embedCode || '');

		return `
			<div
				id="${escapeHtml(codeElementID)}"
				class="code-display-window"
			></div>

			<script>
				(async function () {
					"use strict";

					const codeElementID =
						${serializeForScript(codeElementID)};

					const codeDisplay =
						document.getElementById(
							codeElementID
						);

					const suppliedCode = ${codeJSON};

					const sendDocumentHeight =
						window.graphicDataFigureEmbed &&
						window.graphicDataFigureEmbed.sendHeight;

					if (!codeDisplay) {
						console.error(
							"Code figure target was not found:",
							codeElementID
						);

						if (sendDocumentHeight) {
							sendDocumentHeight();
						}

						return;
					}

					if (!suppliedCode.trim()) {
						codeDisplay.innerHTML =
							'<p class="figure-error">' +
							'No embed code was supplied ' +
							'for this figure.' +
							'</p>';

						if (sendDocumentHeight) {
							sendDocumentHeight();
						}

						return;
					}

					/**
					 * Appends a parsed node to the document.
					 *
					 * Script elements are recreated so they execute.
					 *
					 * @param {Node} parent Parent DOM element.
					 * @param {Node} sourceNode Parsed source node.
					 *
					 * @return {Promise<void>}
					 */
					async function appendExecutableNode(
						parent,
						sourceNode
					) {
						if (
							sourceNode.nodeType ===
								Node.ELEMENT_NODE &&
							sourceNode.tagName === "SCRIPT"
						) {
							const executableScript =
								document.createElement(
									"script"
								);

							Array.from(
								sourceNode.attributes
							).forEach(function (attribute) {
								if (
									attribute.name === "src" ||
									attribute.name === "async"
								) {
									return;
								}

								executableScript.setAttribute(
									attribute.name,
									attribute.value
								);
							});

							const scriptSource =
								sourceNode.getAttribute("src");

							if (scriptSource) {
								await new Promise(
									function (resolve) {
										executableScript.async =
											false;

										executableScript.addEventListener(
											"load",
											resolve,
											{ once: true }
										);

										executableScript.addEventListener(
											"error",
											function () {
												console.error(
													"Unable to load " +
													"code-figure script:",
													scriptSource
												);

												resolve();
											},
											{ once: true }
										);

										executableScript.src =
											scriptSource;

										parent.appendChild(
											executableScript
										);
									}
								);

								return;
							}

							executableScript.textContent =
								sourceNode.textContent;

							parent.appendChild(
								executableScript
							);

							return;
						}

						if (
							sourceNode.nodeType ===
							Node.ELEMENT_NODE
						) {
							const clonedElement =
								sourceNode.cloneNode(false);

							parent.appendChild(
								clonedElement
							);

							const childNodes =
								Array.from(
									sourceNode.childNodes
								);

							for (
								const childNode of childNodes
							) {
								await appendExecutableNode(
									clonedElement,
									childNode
								);
							}

							return;
						}

						parent.appendChild(
							sourceNode.cloneNode(true)
						);
					}

					try {
						const template =
							document.createElement(
								"template"
							);

						template.innerHTML = suppliedCode;

						codeDisplay.replaceChildren();

						const sourceNodes =
							Array.from(
								template.content.childNodes
							);

						for (
							const sourceNode of sourceNodes
						) {
							await appendExecutableNode(
								codeDisplay,
								sourceNode
							);
						}

						if (sendDocumentHeight) {
							sendDocumentHeight();

							requestAnimationFrame(
								sendDocumentHeight
							);
						}
					} catch (error) {
						console.error(
							"Unable to render code figure:",
							error
						);

						codeDisplay.innerHTML =
							'<p class="figure-error">' +
							'The code figure could not ' +
							'be rendered.' +
							'</p>';

						if (sendDocumentHeight) {
							sendDocumentHeight();
						}
					}
				})();
			</script>
		`;
	}

	/**
	 * Selects the correct figure renderer.
	 *
	 * @return {string} Figure-specific HTML.
	 */
	function insertTheFigureIntoHTML() {
		switch (normalizedFigureType) {
			case 'Internal':
				return buildImageFigureHTML(
					'Internal'
				);

			case 'External':
				return buildImageFigureHTML(
					'External'
				);

			case 'Code':
				return buildCodeFigureHTML();

			case 'Interactive':
				return buildInteractiveFigureHTML();

			default:
				return `
					<div
						class="figure-error"
						role="alert"
					>
						Unsupported figure type:
						${escapeHtml(normalizedFigureType)}
					</div>
				`;
		}
	}

	const sourceLinkHTML =
		buildInformationLink({
			url: sourceURL,
			text: sourceText,
			icon: '\u{1F4CB}',
			className: 'source-link'
		});

	const dataLinkHTML =
		buildInformationLink({
			url: dataURL,
			text: dataText,
			icon: '\u{1F4C1}',
			className: 'data-link'
		});

	const informationBarHTML =
		sourceLinkHTML || dataLinkHTML
			? `
				<div class="figure-information-bar">
					<div class="figure-information-left">
						${sourceLinkHTML}
					</div>

					<div class="figure-information-right">
						${dataLinkHTML}
					</div>
				</div>
			`
			: '';

	const shortCaptionHTML =
		shortCaption
			? `
				<div class="caption figure-caption-short">
					${shortCaption}
				</div>
			`
			: '';

	const longCaptionHTML =
		longCaption
			? `
				<div class="caption figure-caption-long">
					${longCaption}
				</div>
			`
			: '';

	const longCaptionContainerHTML =
		longCaptionHTML
			? `
				<details class="figure-long-caption-container">
					<summary class="figure-long-caption-toggle">
						More Details
					</summary>

					<div class="figure-long-caption-content">
						${longCaptionHTML}
					</div>
				</details>
			`
			: '';

	const figureContentHTML =
		insertTheFigureIntoHTML();

	const figureTypeClass =
		String(normalizedFigureType)
			.toLowerCase()
			.replace(/[^a-z0-9_-]/g, '-');

	const figIframeHtml = `
		<!doctype html>

		<html lang="en">
			<head>
				<meta charset="utf-8">

				<meta
					name="viewport"
					content="width=device-width, initial-scale=1"
				>

				<title>${escapeHtml(figureTitle)}</title>

				<style>
					* {
						box-sizing: border-box;
					}

					html,
					body {
						width: 100%;
						min-height: 100%;
						margin: 0;
						padding: 0;
					}

					body {
						overflow-x: hidden;
						background: #ffffff;
						color: #222222;
						font-family:
							Arial,
							Helvetica,
							sans-serif;
					}

					a {
						color: inherit;
					}

					img,
					svg,
					canvas,
					video,
					iframe {
						max-width: 100%;
					}

					.figure-embed-document {
						width: 100%;
						max-width: none;
						margin: 0 auto;
						padding: 12px;
					}

					.figure-information-bar {
						display: flex;
						justify-content: space-between;
						align-items: center;
						gap: 16px;
						width: 100%;
						margin: 0 auto;
						padding: 10px;
						border: 1px solid lightgrey;
						border-radius: 6px;
						background: rgba(227, 227, 227, 0.33);
						font-size: 1.2rem;
					}

					.figure-information-left,
					.figure-information-right {
						display: flex;
						align-items: center;
						min-width: 0;
					}

					.figure-information-right {
						margin-left: auto;
						text-align: right;
					}

					.figure-information-link {
						display: inline-flex;
						align-items: center;
						gap: 6px;
						text-decoration: none;
					}

					.figure-information-link:hover,
					.figure-information-link:focus {
						text-decoration: underline;
					}

					.figureTitle {
						margin-top: 15px;
						margin-bottom: 28px;
						text-align: center;
						font-size: 1rem;
						font-weight: 500;
					}

					.figure-type {
						position: absolute;
						width: 1px;
						height: 1px;
						padding: 0;
						margin: -1px;
						overflow: hidden;
						clip: rect(0, 0, 0, 0);
						white-space: nowrap;
						border: 0;
					}

					.figure-content-wrapper {
						position: relative;
						display: block;
						width: 100%;
						margin-top: 2%;
					}

					.figure-content-interactive {
						min-height: 400px;
					}

					.figure-image-container {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 100%;
					}

					.figure-image {
						display: block;
						width: auto;
						max-width: 100%;
						height: auto;
						margin: 0 auto;
					}

					.plotly-figure {
						position: relative;
						display: block;
						width: 100%;
						height: 450px;
						min-height: 400px;
						margin: 0;
					}

					.plotly-figure .plot-container,
					.plotly-figure .svg-container,
					.plotly-figure .main-svg {
						width: 100% !important;
						max-width: none !important;
					}

					.modebar-container {
						top: -28px !important;
					}

					.code-display-window {
						display: flex;
						justify-content: center;
						align-items: center;
						width: 100%;
						min-height: 300px;
						padding: 10px;
						overflow: auto;
						background: #ffffff;
					}

					.code-display-window > * {
						max-width: 100%;
					}

					.figure-error {
						margin: 1rem;
						padding: 1rem;
						border: 1px solid #b32d2e;
						border-radius: 4px;
						color: #b32d2e;
						text-align: center;
					}

					.figure-short-caption-container {
						width: 100%;
						margin-top: 10px;
						margin-bottom: 10px;
					}

					.figure-short-caption-container:empty {
						display: none;
					}

					.caption {
						width: 100%;
						line-height: 1.5;
						font-size: 1.1rem !important;
					}

					.figure-caption-short {
						margin-top: 0;
						margin-left: 1%;
						font-size: 1.1rem !important;
					}

					.figure-caption-long {
						margin-top: 0;
					}

					.figure-long-caption-container {
						width: 100%;
						margin-top: 12px;

					}

					.figure-long-caption-toggle {
						padding: 10px 12px;
						color: rgba(0, 0, 0, 0.8);
						font-size: 1.1rem;
						font-weight: 550;
						cursor: pointer;
						user-select: none;
					}

					.figure-long-caption-toggle:hover,
					.figure-long-caption-toggle:focus {
						color: rgba(68, 68, 68, 1);
						background: rgba(227, 227, 227, 0.3);
					}

					.figure-long-caption-content {
						padding: 0 12px 12px;
						line-height: 1.5;
					}

					.figure-long-caption-content > :first-child {
						margin-top: 0;
					}

					.figure-long-caption-content > :last-child {
						margin-bottom: 0;
					}

					.figure-footer {
						width: 100%;
						margin-top: 24px;
						padding-top: 12px;
					}

					.figure-footer-links {
						display: flex;
						justify-content: flex-end;
						align-items: center;
						flex-wrap: wrap;
						gap: 16px;
					}

					.figure-footer-link {
						color: rgba(68, 68, 68, 0.55);
						font-size: 0.8rem;
						text-decoration: none;
					}

					.figure-footer-link:hover,
					.figure-footer-link:focus {
						color: rgba(68, 68, 68, 0.9);
						text-decoration: underline;
					}

					${desktopCSS}

					@media screen and (max-width: 767px) {
						.figure-embed-document {
							padding: 8px;
						}

						${mobileCSS}
					}
				</style>
			</head>

			<body>
				<script>
					(function () {
						"use strict";

						const figureID =
							${serializeForScript(normalizedFigureID)};

						function sendHeight() {
							const documentHeight = Math.max(
								document.body.scrollHeight,
								document.body.offsetHeight,
								document.documentElement.clientHeight,
								document.documentElement.scrollHeight,
								document.documentElement.offsetHeight
							);

							window.parent.postMessage(
								{
									type: "figure-embed-resize",
									figureID: figureID,
									height: documentHeight
								},
								"*"
							);
						}

						window.graphicDataFigureEmbed = {
							sendHeight: sendHeight
						};

						if (
							typeof ResizeObserver !== "undefined"
						) {
							const documentResizeObserver =
								new ResizeObserver(
									function () {
										sendHeight();
									}
								);

							documentResizeObserver.observe(
								document.body
							);
						}

						window.addEventListener(
							"load",
							function () {
								sendHeight();

								requestAnimationFrame(
									sendHeight
								);
							}
						);

						window.addEventListener(
							"resize",
							sendHeight
						);

						sendHeight();
					})();
				</script>

				<main
					class="figure-embed-document"
					data-figure-id="${escapeHtml(normalizedFigureID)}"
					data-figure-type="${escapeHtml(normalizedFigureType)}"
				>
					${informationBarHTML}

					<header>
						<div class="figureTitle">
							${escapeHtml(figureTitle)}
						</div>

						<span class="figure-type">
							${escapeHtml(normalizedFigureType)}
						</span>
					</header>

					<section
						class="figure-content-wrapper figure-content-${escapeHtml(
							figureTypeClass
						)}"
						aria-label="${escapeHtml(
							`${normalizedFigureType} figure`
						)}"
					>
						${figureContentHTML}
					</section>

					<div class="figure-short-caption-container">
						${shortCaptionHTML}
					</div>

					${longCaptionContainerHTML}

					<footer class="figure-footer">
						<nav
							class="figure-footer-links"
							aria-label="Figure resources"
						>
							<a
								href="${safeUrl(normalizedRootURL)}"
								target="_blank"
								rel="noopener noreferrer"
								class="figure-footer-link"
							>
								${escapeHtml(normalizedRootURL)}
							</a>

							<a
								href="https://ioos.github.io/sanctuarywatch_graphicdata/"
								target="_blank"
								rel="noopener noreferrer"
								class="figure-footer-link"
							>
								Graphic Data
							</a>
						</nav>
					</footer>
				</main>
			</body>
		</html>
	`;

	/*
	 * The iframe uses a fallback height. The embedded HTML sends its
	 * actual document height to the parent page after content changes.
	 */
	const figIframeCode = `
		<iframe
			id="${escapeHtml(iframeElementID)}"
			src="${safeUrl(figIframeHtmlPath)}"
			title="${escapeHtml(figureTitle)}"
			width="100%"
			height="650"
			loading="lazy"
			style="
				display: block;
				width: 100%;
				min-height: 400px;
				border: 0;
			"
		></iframe>

		<script>
			(function () {
				"use strict";

				const iframe =
					document.getElementById(
						${serializeForScript(iframeElementID)}
					);

				const figureID =
					${serializeForScript(normalizedFigureID)};

				if (!iframe) {
					return;
				}

				window.addEventListener(
					"message",
					function (event) {
						if (
							event.source !==
							iframe.contentWindow
						) {
							return;
						}

						if (
							!event.data ||
							event.data.type !==
								"figure-embed-resize" ||
							String(event.data.figureID) !==
								figureID
						) {
							return;
						}

						const requestedHeight =
							Number(event.data.height);

						if (
							!Number.isFinite(
								requestedHeight
							) ||
							requestedHeight < 100
						) {
							return;
						}

						iframe.style.height =
							Math.ceil(
								requestedHeight + 2
							) + "px";
					}
				);
			})();
		</script>
	`;

	return {
		figIframeHtml,
		figIframeHtmlFileName,
		figIframeHtmlPath,
		figIframeCode
	};
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
export async function saveHtmlToServer(htmlContent, fileName, filePath, postId) {
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
	formData.append("figure_nonce", figureNonceInput.value);
	formData.append("uploaded_file", htmlFile);

	const ajaxUrl = window.location.origin + "/wp-admin/admin-ajax.php";

	return fetch(ajaxUrl, {
		method: "POST",
		body: formData,
		credentials: "same-origin"
	})
		.then((response) => response.json())
		.then((result) => {
		if (!result.success) {
			console.error("HTML upload failed:", result.data);
			return result;
		}

		console.log("HTML uploaded successfully:", result.data);
		return result;
		})
		.catch((error) => {
		console.error("AJAX error uploading HTML:", error);
		throw error;
		});
}