// Needed to ensure Plotly is only loaded once
export let plotlyScriptPromise = null;

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
export function loadPlotlyScript() {
	if (window.Plotly) {
		return Promise.resolve();
	}

	// Reuse the same Promise if already started
	if (plotlyScriptPromise) {
		return plotlyScriptPromise;
	}

	plotlyScriptPromise = new Promise((resolve, reject) => {
		const existingScript = document.querySelector(
			'script[src="https://cdn.plot.ly/plotly-3.0.0.min.js"]'
		);
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
export function waitForElementById(id, timeout = 1000) {
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
				reject(
					new Error(
						`Element with id ${id} not found after ${timeout}ms`
					)
				);
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
export function computeStandardDeviation(arr) {
	if (!Array.isArray(arr) || arr.length === 0) {
		return 0;
	}

	// Filter out invalid or "NA" values
	const numericValues = arr
		.filter(
			(val) =>
				val !== null &&
				val !== undefined &&
				val !== '' &&
				!(
					typeof val === 'string' && val.trim().toUpperCase() === 'NA'
				) &&
				!isNaN(val)
		)
		.map((val) => parseFloat(val));

	if (numericValues.length === 0) {
		return 0;
	}

	const n = numericValues.length;
	const mean = numericValues.reduce((a, b) => a + b, 0) / n;
	const variance =
		numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;

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
export function computePercentile(arr, percentile) {
	if (arr.length === 0) {
		return undefined;
	}
	if (arr.length === 1) {
		return arr[0];
	}
	const sorted = [...arr].sort((a, b) => a - b);
	const index = (percentile / 100) * (sorted.length - 1);
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
export function loadExternalScript(url) {
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
export function logFormFieldValues() {
	const allFields = document.getElementsByName('plotFields');
	const fieldValues = [];
	allFields.forEach((uniqueField) => {
		fieldValues.push([uniqueField.id, uniqueField.value]);
	});
	document.getElementsByName('figure_interactive_arguments')[0].value =
		JSON.stringify(fieldValues);
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
export function fillFormFieldValues(elementID) {
	let interactiveFields = document.getElementsByName(
		'figure_interactive_arguments'
	)[0].value;

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
export function createFigureIframeHtml(savedFigure, figureID, rootURL) {

	function buildStandalonePlotlyEmbedCode(savedFigure, figureID) {
		const cleanFigure = {
		data: savedFigure.data || [],
		layout: JSON.parse(JSON.stringify(savedFigure.layout || {})),
		config: savedFigure.config || {}
		};
	
		delete cleanFigure.layout.width;
		delete cleanFigure.layout.height;
		cleanFigure.layout.autosize = true;
	
		const jsonString = JSON
		.stringify(cleanFigure)
		.replace(/<\/script/gi, "<\\/script");
	
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

	const figIframeHtmlFileName = `plotly-${figureID}`
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
export function buildPlotlySnippetEmbedCode(savedFigure, embedID) {
	const cleanFigure = {
	  data: savedFigure.data || [],
	  layout: JSON.parse(JSON.stringify(savedFigure.layout || {})),
	  config: savedFigure.config || {}
	};
  
	delete cleanFigure.layout.width;
	delete cleanFigure.layout.height;
  
	cleanFigure.layout.autosize = true;
	cleanFigure.config.responsive = true;
  
	const jsonString = JSON
	  .stringify(cleanFigure)
	  .replace(/<\/script/gi, "<\\/script");
  
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
export function saveHtmlToServer(htmlContent, fileName, postId) {
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

