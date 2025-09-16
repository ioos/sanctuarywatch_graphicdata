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