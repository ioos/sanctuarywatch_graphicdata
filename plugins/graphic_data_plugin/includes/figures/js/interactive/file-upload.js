/**
 * Checks if an uploaded file exists and loads its JSON content.
 * Handles the removal of existing interactive settings and dynamically updates the UI
 * based on the presence of the uploaded file.
 */
async function checkIfFileExistsAndLoadJson() {
	try {
		// Remove the existing "Interactive Settings" button if it exists
		const button = document.querySelector(
			'.exopite-sof-btn.figure_interactive_settings'
		);
		if (button) {
			button.remove();
		}

		// Construct the REST API URL to fetch the uploaded file path
		const rootURL = window.location.origin;
		const figureID = document.getElementsByName('post_ID')[0].value;
		const figureRestCall = `${rootURL}/wp-json/wp/v2/figure/${figureID}?_fields=uploaded_path_json`;

		// Fetch the uploaded file path from the REST API
		//const response = await fetch(figureRestCall);
		const response = await fetch(figureRestCall, {
			headers: {
				'X-WP-Nonce': wpApiSettings.nonce,
			},
		});

		if (response.ok) {
			const data = await response.json();
			const uploaded_path_json = data.uploaded_path_json;

			// Find the target div inside "exopite-sof-field-button"
			const targetContainer = document.querySelector(
				'.exopite-sof-field.exopite-sof-field-button .exopite-sof-fieldset'
			);

			// Check if the post meta variable exists (assuming it's in the "meta" field)
			if (uploaded_path_json != '') {
				if (targetContainer) {
					// Call the loadJson function and populate its contents inside the div
					loadJson(targetContainer); // Call function with meta value
				}
			}

			// If no uploaded file path exists, remove the container and display a message
			if (uploaded_path_json == '') {
				const divContainer = document.querySelector(
					'.exopite-sof-field.exopite-sof-field-button'
				);
				if (divContainer) {
					divContainer.remove();
				}
				//targetContainer.innerHTML = "Please upload a valid 'Interactive Figure File' and click  the 'Update' button in the top right of the page to access this feature.";
			}
		} else {
			// If the response is not OK, log an error message
			const uploaded_path_json = '';
		}
	} catch (error) {
		// Log any errors that occur during the fetch or processing
		console.error('Error fetching post meta:', error.message);
	}
}

/**
 * Loads JSON data from the uploaded file and dynamically updates the UI.
 * Handles metadata extraction, graph configuration, and UI updates based on the JSON content.
 *
 * @param {HTMLElement} targetContainer - The container element where the graph configuration UI will be appended.
 */
async function loadJson(targetContainer) {
	const postPageType = window.location.href.includes('post-new.php');

	if (!postPageType) {
		try {
			const rootURL = window.location.origin;
			// REST API call to get the uploaded JSON file path
			const figureID = document.getElementsByName('post_ID')[0].value;
			const figureRestCall = `${rootURL}/wp-json/wp/v2/figure/${figureID}?_fields=uploaded_path_json`;
			const response = await fetch(figureRestCall);

			if (response.ok) {
				const data = await response.json();
				const uploaded_path_json = data.uploaded_path_json;
				const restOfURL =
					'/wp-content' + uploaded_path_json.split('wp-content')[1];

				// Check if the uploaded file path is empty and alert the user
				if (uploaded_path_json == '') {
					alert('Please upload a file before creating a graph');
					console.error('Error loading JSON:', error);
				}

				const finalURL = rootURL + restOfURL;
				try {
					// Fetch the actual JSON file using the constructed URL
					const response = await fetch(finalURL);
					if (!response.ok) {
						throw new Error('Network response was not ok');
					}
					const data = await response.json();

					// Convert metadata keys into an array of key-value pairs for display
					let metadataRows = [];
					if (
						data.metadata &&
						Object.keys(data.metadata).length > 0
					) {
						metadataRows = Object.keys(data.metadata).map(
							(key) => ({
								key,
								value: data.metadata[key],
							})
						);
					}

					// Initialize jsonColumns to read .geojson ot regular .json files
					if (!uploaded_path_json.includes('.geojson')) {
						// Map data columns into an object with index-based keys
						jsonColumns = Object.fromEntries(
							Object.keys(data.data).map((key, index) => [
								index,
								key,
							])
						);
						jsonColumns;
					}
					if (uploaded_path_json.includes('.geojson')) {
						function extractJsonColumnsFromGeojson(geojson) {
							if (
								!geojson ||
								!geojson.features ||
								geojson.features.length === 0
							) {
								return {};
							}

							const props = geojson.features[0].properties;
							return Object.fromEntries(
								Object.keys(props).map((key, index) => [
									index,
									key,
								])
							);
						}

						jsonColumns = extractJsonColumnsFromGeojson(data);
					}

					// Check the number of columns in the JSON data
					const lengthJsonColumns =
						Object.entries(jsonColumns).length;
					if (lengthJsonColumns > 1) {
						// Remove the existing graph GUI if it exists
						const graphGUI = document.getElementById('graphGUI');
						if (graphGUI) {
							// Remove the scene window
							graphGUI.parentNode.removeChild(graphGUI);
						}

						// Create a new container for the graph GUI
						const targetElement = targetContainer;
						const newDiv = document.createElement('div');
						newDiv.id = 'graphGUI';
						newDiv.classList.add('container', 'graphGUI');

						// If metadata exists, display it in a floating box
						displayMetadataBox(metadataRows, newDiv);

						// Create a label and dropdown for selecting the graph type
						const labelGraphType = document.createElement('label');
						labelGraphType.for = 'graphType';
						labelGraphType.innerHTML = 'Graph Type';
						const selectGraphType =
							document.createElement('select');
						selectGraphType.id = 'graphType';
						selectGraphType.name = 'plotFields';

						// Add options to the dropdown for different graph types
						const graphType1 = document.createElement('option');
						graphType1.value = 'None';
						graphType1.innerHTML = 'None';
						const graphType2 = document.createElement('option');
						graphType2.value = 'Plotly bar graph';
						graphType2.innerHTML = 'Plotly bar graph';
						const graphType3 = document.createElement('option');
						graphType3.value = 'Plotly line graph (time series)';
						graphType3.innerHTML =
							'Plotly line graph (time series)';
						// let graphType4 = document.createElement("option");
						// graphType4.value = "Plotly map";
						// graphType4.innerHTML = "Plotly map";
						selectGraphType.appendChild(graphType1);
						selectGraphType.appendChild(graphType2);
						selectGraphType.appendChild(graphType3);
						// selectGraphType.appendChild(graphType4);

						//Admin is able to call to the interactive_arguments using document.getElementsByName("figure_interactive_arguments")[0].value;
						//interactive_arguments is for the theme side, it is blank here because it is a place holder variable
						let interactive_arguments = document.getElementsByName(
							'figure_interactive_arguments'
						)[0].value;

						// CHECK FOR "\" AND REMOVE IF EXISTS, This is to fix escaping issues for existing figures
						if (interactive_arguments.includes('\\')) {
							interactive_arguments =
								interactive_arguments.replace(/\\/g, '');
						}
						fieldValueSaved = fillFormFieldValues(
							selectGraphType.id
						);

						// Add event listeners to handle changes in the dropdown selection
						if (fieldValueSaved != undefined) {
							selectGraphType.value = fieldValueSaved;
						}
						selectGraphType.addEventListener('change', function () {
							secondaryGraphFields(
								this.value,
								interactive_arguments
							);
						});
						selectGraphType.addEventListener('change', function () {
							logFormFieldValues();
						});

						// Create a new row and columns for the dropdown and label
						const newRow = document.createElement('div');
						newRow.classList.add('row', 'fieldPadding');
						const newColumn1 = document.createElement('div');
						newColumn1.classList.add('col-3');
						const newColumn2 = document.createElement('div');
						newColumn2.classList.add('col');

						// Append the label and dropdown to the columns
						newColumn1.appendChild(labelGraphType);
						newColumn2.appendChild(selectGraphType);
						newRow.append(newColumn1, newColumn2);
						newDiv.append(newRow);

						// Append the row to the new graph GUI container
						targetElement.appendChild(newDiv);

						// Trigger secondary graph fields if a saved value exists
						if (fieldValueSaved != undefined) {
							secondaryGraphFields(
								selectGraphType.value,
								interactive_arguments
							);
						}
					}
				} catch (error) {
					// Log any errors that occur during the JSON loading process
					console.error('Error loading JSON:', error);
					targetContainer.innerHTML =
						'The file formatting is incorrect. Please fix the error and reupload your file.';
				}
			}
		} catch (error) {
			console.log('Error fetching uploaded file path:', error);
		}
	}
}

/**
 * Displays metadata in a formatted box within the provided container.
 * Converts metadata key-value pairs into readable text and appends it to the container.
 *
 * @param {Array}       metadataRows - An array of objects containing metadata key-value pairs.
 * @param {HTMLElement} newDiv       - The container element where the metadata will be displayed.
 */
function displayMetadataBox(metadataRows, newDiv) {
	// Convert metadata object to readable text with both key and value
	let metadataText = 'Current Metadata:<br><br>';

	// Check if metadata rows exist
	if (metadataRows.length >= 1) {
		// Iterate over each metadata row and format it as key-value pairs
		metadataRows.forEach((row) => {
			// Remove any commas from the metadata value for cleaner display
			const cleanedValue = row.value.replace(/,/g, '');
			metadataText += `<span style="font-size: 13px;">${row.key}: ${cleanedValue}</span><br>`;
		});
	} else {
		// Display a message if no metadata is found
		metadataText += `<span style="font-size: 13px;">No metadata found.</span><br>`;
	}

	// Add a light grey horizontal line at the bottom after all metadata rows
	metadataText += `<br><hr style="border: 0.5px solid lightgrey; margin-top: 8px;">`;
	// Insert the formatted metadata text into the existing div
	newDiv.innerHTML = metadataText;
	// Ensure it's visible
	newDiv.style.display = 'block';
}

/**
 * Dynamically creates or clears parameter fields based on the selected graph type.
 * Handles the removal of existing fields and updates the UI with new fields as needed.
 *
 * @param {string} graphType             - The type of graph selected by the user (e.g., "None", "Plotly bar graph", "Plotly line graph (time series)").
 * @param {string} interactive_arguments - A string containing saved interactive arguments for pre-filling fields.
 */
function secondaryGraphFields(graphType, interactive_arguments) {
	// Get the container for secondary graph fields
	const secondaryGraphDiv = document.getElementById('secondaryGraphFields');
	// If the element exists
	if (secondaryGraphDiv) {
		// Remove the scene window
		secondaryGraphDiv.parentNode.removeChild(secondaryGraphDiv);
	}

	// Handle different graph types and update the UI accordingly
	switch (graphType) {
		case 'None':
			// Clear any previously created graph fields
			clearPreviousGraphFields();
			break;
		case 'Plotly map':
			// Clear any previously created graph fields
			clearPreviousGraphFields();
			plotlyMapParameterFields(jsonColumns, interactive_arguments);
			break;
		case 'Plotly bar graph':
			// Clear any previously created graph fields
			clearPreviousGraphFields();
			plotlyBarParameterFields(jsonColumns, interactive_arguments);
			break;
		case 'Plotly line graph (time series)':
			// Clear previous fields and create new fields specific to line graphs
			clearPreviousGraphFields();
			plotlyLineParameterFields(jsonColumns, interactive_arguments);
			break;
	}
}

/**
 * Clears out any previously created form fields used for indicating figure preferences.
 * Removes the container element for assigning columns to plots if it exists.
 */
function clearPreviousGraphFields() {
	const assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
	// If the element exists
	if (assignColumnsToPlot) {
		// Remove the scene window
		assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
	}
}
