

// Needed to ensure Plotly is only loaded once
let plotlyScriptPromise = null;


/**
 * Loads the Plotly.js library dynamically if it is not already loaded.
 * 
 * This function ensures that the Plotly.js library is loaded and available for use.
 * If the library is already loaded, it resolves immediately. If the loading process
 * has already started, it reuses the same Promise to avoid multiple simultaneous loads.
 * 
 * @returns {Promise<void>} A Promise that resolves when the Plotly.js library is successfully loaded.
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
    if (window.Plotly) return Promise.resolve();

    // Reuse the same Promise if already started
    if (plotlyScriptPromise) return plotlyScriptPromise;

    plotlyScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://cdn.plot.ly/plotly-3.0.0.min.js"]');
        if (existingScript) {
            existingScript.onload = () => {
                if (window.Plotly) resolve();
                else reject(new Error("Plotly failed to initialize."));
            };
            existingScript.onerror = reject;
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.plot.ly/plotly-3.0.0.min.js';
        script.onload = () => {
            if (window.Plotly) resolve();
            else reject(new Error("Plotly failed to initialize."));
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
 * @param {string} id - The ID of the HTML element to wait for.
 * @param {number} [timeout=1000] - The maximum time (in milliseconds) to wait for the element to appear. Defaults to 1000ms.
 * @returns {Promise<HTMLElement>} A promise that resolves with the found HTML element if it appears within the timeout period.
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
 *                          Must be a non-empty array. If the array is empty or not an array,
 *                          the function will return 0.
 * @returns {number} The standard deviation of the numbers in the array. Returns 0 if the input
 *                   is not a valid array or is empty.
 */
function computeStandardDeviation(arr) {
    if (!Array.isArray(arr) || arr.length === 0) return 0;

    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
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
 * @param {number[]} arr - The array of numbers from which to compute the percentile. Should be non-empty.
 * @param {number} percentile - The percentile to compute (between 0 and 100).
 * @returns {number|undefined} The value at the specified percentile, or `undefined` if the array is empty.
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
    if (arr.length === 0) return undefined;
    if (arr.length === 1) return arr[0];
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
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
 * @returns {Promise<void>} A promise that resolves when the script is loaded
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
    const allFields = document.getElementsByName("plotFields");
    let fieldValues = [];
    allFields.forEach((uniqueField) => {
        //console.log([uniqueField.id, uniqueField.value]);
        fieldValues.push([uniqueField.id, uniqueField.value]);
    });
    //console.log('logformfieldvalues', JSON.stringify(fieldValues));
    document.getElementsByName("figure_interactive_arguments")[0].value = JSON.stringify(fieldValues); 
}


/**
 * Fills in the values of form fields associated with JavaScript figure
 * parameters. It retrieves the values from the hidden
 * "figure_interactive_arguments" field and populates the corresponding
 * form fields.
 *
 * @function fillFormFieldValues
 * @param {string} elementID - The ID of the form field to fill.
 * @returns {string|undefined} The value of the form field if found, or
 *   `undefined` if the field or its value is not found.
 * @example
 * // Assuming you have the following HTML:
 * // <input type="text" name="plotFields" id="xAxisTitle" value="">
 * // <input type="hidden" name="figure_interactive_arguments" value="[['xAxisTitle', 'Date'], ['yAxisTitle', 'Value']]">
 * const xAxisTitle = fillFormFieldValues('xAxisTitle'); // xAxisTitle will be set to "Date"
 */
function fillFormFieldValues(elementID){
    const interactiveFields = document.getElementsByName("figure_interactive_arguments")[0].value;

    if (interactiveFields != ""  && interactiveFields != null) {
        const resultJSON = Object.fromEntries(JSON.parse(interactiveFields));

        if (resultJSON[elementID] != undefined && resultJSON[elementID] != ""){
            return resultJSON[elementID];
        }
    }
}