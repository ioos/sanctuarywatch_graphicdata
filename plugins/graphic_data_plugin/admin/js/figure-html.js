/**
 * Standalone figure HTML.
 *
 * Builds the self-contained HTML documents that show a Figure on its own
 * (figure-<ID>.html, with its title, links and captions, and
 * figure-<ID>_figure_only.html), which are opened directly or embedded in an
 * iframe. Used by the Figure edit screen when a Figure is saved
 * (admin-preview-buttons.js) and by the Content Transfer page to rebuild the
 * files for imported Figures.
 *
 * This module has no side effects on import, so it can be loaded on any
 * admin page.
 *
 * @module @graphic-data/figure-html
 * @package
 */

import { enableFigureImageViewer } from '../../includes/figures/js/image-viewer.js';
import {
	COMPARISON_MODULE_URL,
	isComparisonSpec,
} from '../../includes/figures/js/interactive/image-comparison.js';
import {
	CAROUSEL_MODULE_URL,
	isCarouselSpec,
} from '../../includes/figures/js/interactive/image-carousel.js';
import {
	TABULATOR_MODULE_URL,
	isTabulatorSpec,
} from '@graphic-data/tabulator-table';
import { isLeafletMapSpec } from '../../includes/figures/js/interactive/leaflet-map.js';

/*
 * Site-relative URL of the map module, imported by the standalone figure HTML.
 * Resolved here rather than inside leaflet-map.js, because that module is also
 * bundled into the blocks, where import.meta.url would be a build-time path.
 */
const LEAFLET_MAP_MODULE_URL = new URL(
	'../../includes/figures/js/interactive/leaflet-map.js',
	import.meta.url
).pathname;

/**
 * Site title shown in the footer of the standalone figure, read from the
 * admin bar.
 *
 * @return {string} Site title, or an empty string.
 */
function getSiteTitle() {
	return (
		document
			.querySelector('#wp-admin-bar-site-name > .ab-item')
			?.textContent.trim() ?? ''
	);
}

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


	const normalizedFigureURL = `${rootURL}/f/${figureID}`
		.trim()
		.replace(/\/+$/, '');


	const siteTitle = getSiteTitle();


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

        // Include the optional website link in both saved HTML variants.
        let imageDestination = '';
        if (imageType === 'Internal' && info_obj.figureInternalUrlCheckbox === 'yes') {
            try {
                const destination = new URL(String(info_obj.figureInternalUrl || '').trim());
                if (['https:', 'http:'].includes(destination.protocol)) {
                    imageDestination = destination.href;
                }
            } catch { /* Leave an invalid or missing destination unlinked. */ }
        }

        const useImageViewer = imageType === 'External' ||
            (imageType === 'Internal' && info_obj.figureInternalUrlCheckbox !== 'yes');

		const shouldRetrieveAltText =
			imageType === 'Internal' &&
			!imageAlt;

		return `
			<div class="figure-image-container">
                ${imageDestination ? '<a href="' + escapeHtml(imageDestination) + '" target="_blank" rel="noopener noreferrer" style="display:block;max-width:100%">' : ''}
				<img
					id="${escapeHtml(imageElementID)}"
					class="figure-image"
					src="${safeImageUrl(imageURL)}"
					alt="${escapeHtml(imageAlt)}"
					loading="lazy"
					decoding="async"
				>
                ${imageDestination ? '</a>' : ''}

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

                    ${useImageViewer ? '(' + enableFigureImageViewer.toString() + ')(image);' : ''}

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

    /** Export the native comparison renderer without external script dependencies. */
    function buildComparisonFigureHTML() {
        return `<div id="${escapeHtml(figureContentElementID)}"></div>
            <script type="module">
                import { mountImageComparison } from ${serializeForScript(COMPARISON_MODULE_URL)};
                const target = document.getElementById(${serializeForScript(figureContentElementID)});
                mountImageComparison(target, ${serializeForScript(savedFigure)}, { label: ${serializeForScript(figureTitle)} })
                    .catch(error => { target.textContent = 'The image comparison could not be loaded.'; console.error(error); })
                    .finally(() => window.graphicDataFigureEmbed?.sendHeight?.());
            </script>`;
    }

    /** Export the same carousel renderer used by blocks and previews. */
    function buildCarouselFigureHTML() {
        return `<div id="${escapeHtml(figureContentElementID)}"></div>
            <script type="module">
                import { mountImageCarousel } from ${serializeForScript(CAROUSEL_MODULE_URL)};
                const target = document.getElementById(${serializeForScript(figureContentElementID)});
                mountImageCarousel(target, ${serializeForScript(savedFigure)}, { label: ${serializeForScript(figureTitle)} })
                    .catch(error => { target.textContent = 'The image carousel could not be loaded.'; console.error(error); })
                    .finally(() => window.graphicDataFigureEmbed?.sendHeight?.());
            </script>`;
    }


	/**
	 * Creates the markup for a Tabulator table figure.
	 *
	 * The page imports the same tabulator-table.js module used by the
	 * admin preview and the frontend, and passes it the saved table spec.
	 * Rows are read from the figure's data file when the page loads.
	 *
	 * @return {string} Table markup and module script.
	 */

	function buildTabulatorFigureHTML() {
		const targetIDJSON =
			serializeForScript(
				figureContentElementID
			);

		return `
			<div
				id="${escapeHtml(figureContentElementID)}"
				class="tabulator-figure"
			></div>

			<script type="module">
				import { mountTabulatorTable } from ${serializeForScript(TABULATOR_MODULE_URL)};

				const target = document.getElementById(${targetIDJSON});
				const sendDocumentHeight =
					window.graphicDataFigureEmbed &&
					window.graphicDataFigureEmbed.sendHeight;

				mountTabulatorTable(target, ${serializeForScript(savedFigure)}, {
					figureId: ${serializeForScript(normalizedFigureID)},
					label: ${serializeForScript(figureTitle)}
				})
					.catch(function (error) {
						console.error("Unable to render table figure:", error);
						if (target) {
							target.innerHTML =
								'<p class="figure-error">' +
								'The table could not be loaded.' +
								'</p>';
						}
					})
					.finally(function () {
						if (sendDocumentHeight) {
							sendDocumentHeight();
						}
					});
			</script>
		`;
	}

	/**
	 * Creates the markup for a Leaflet map figure.
	 *
	 * The page imports the same leaflet-map.js module used by the admin
	 * preview and the frontend, and passes it the saved map spec. Features
	 * are read from the figure's GeoJSON file when the page loads.
	 *
	 * @return {string} Map markup and module script.
	 */
	function buildLeafletMapFigureHTML() {
		return `
			<div
				id="${escapeHtml(figureContentElementID)}"
				class="leaflet-map-figure"
			></div>

			<script type="module">
				import { mountLeafletMap } from ${serializeForScript(LEAFLET_MAP_MODULE_URL)};

				const target = document.getElementById(${serializeForScript(figureContentElementID)});
				const sendDocumentHeight =
					window.graphicDataFigureEmbed &&
					window.graphicDataFigureEmbed.sendHeight;

				mountLeafletMap(target, ${serializeForScript(savedFigure)}, {
					figureId: ${serializeForScript(normalizedFigureID)},
					label: ${serializeForScript(figureTitle)}
				})
					.catch(function (error) {
						console.error("Unable to render map figure:", error);
						if (target) {
							target.innerHTML =
								'<p class="figure-error">' +
								'The map could not be loaded.' +
								'</p>';
						}
					})
					.finally(function () {
						if (sendDocumentHeight) {
							sendDocumentHeight();
						}
					});
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
				if (isComparisonSpec(savedFigure)) {
                    return buildComparisonFigureHTML();
                }
				if (isCarouselSpec(savedFigure)) {
                    return buildCarouselFigureHTML();
                }
				if (isTabulatorSpec(savedFigure)) {
					return buildTabulatorFigureHTML();
				}
				if (isLeafletMapSpec(savedFigure)) {
					return buildLeafletMapFigureHTML();
				}
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
						margin-top: 10px !important;
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
						margin-bottom: 10px;
					}

					.figure-footer-links {
						display: flex;
						justify-content: space-between;
						align-items: center;
						width: 100%;
						gap: 1rem;
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

						.figure-footer-link {
							color: rgba(68, 68, 68, 0.55);
							font-size: 0.65rem;
							text-decoration: none;
						}

						.figure-footer-links {
							display: flex;
							justify-content: space-between;
							align-items: center;
							width: 100%;
							gap: 1rem;
						}

						.caption {
							width: 100%;
							line-height: 1.3;
							font-size: .9rem !important;
						}

						.figure-caption-short {
							margin-top: 0;
							margin-left: 1%;
							font-size: .9rem !important;
						}


						.figure-long-caption-toggle {
							padding: 10px 12px;
							color: rgba(0, 0, 0, 0.8);
							font-size: .9rem;
							font-weight: 550;
							cursor: pointer;
							user-select: none;
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
							font-size: .9rem;
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
					<div class="figure-footer">
						<nav
							class="figure-footer-links"
							aria-label="Figure resources"
						>
							<a
								href="https://ioos.github.io/sanctuarywatch_graphicdata/"
								target="_blank"
								rel="noopener noreferrer"
								class="figure-footer-link"
							>
								 Get GraphicData
							</a>

							<a
								href="${safeUrl(normalizedFigureURL)}"
								target="_blank"
								rel="noopener noreferrer"
								class="figure-footer-link"
							>
								Visit @ ${siteTitle}
							</a>
						</nav>
					</div>
				
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
