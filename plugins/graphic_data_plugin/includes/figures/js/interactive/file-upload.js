import { COMPARISON_TYPE } from './image-comparison.js';
import { comparisonParameterFields } from './image-comparison-settings.js';
import { TABULATOR_GRAPH_TYPE } from '@graphic-data/tabulator-table';
import { tabulatorTableParameterFields } from '@graphic-data/tabulator-table-settings';
import { CAROUSEL_TYPE, carouselSettings } from './image-carousel.js';
import { carouselParameterFields } from './image-carousel-settings.js';

const moduleData = JSON.parse(
	document.getElementById('wp-script-module-data-@graphic-data/file-upload')?.textContent || '{}',
);
let requestVersion = 0;

/** Kept as the public entry point for the existing editor/upload integration. */
export async function checkIfFileExistsAndLoadJson() {
	const upload = document.querySelector('.exopite-sof-field-upload');
	const button = document.querySelector('.figure_interactive_settings');
	const settingsRow =
		button?.closest('.exopite-sof-field') ||
		document.getElementById('graphGUI')?.closest('.exopite-sof-field');
	if (!upload || !settingsRow) return;
	button?.remove();
	const container = settingsRow.querySelector('.exopite-sof-fieldset');
	if (!container) return;
	if (document.getElementById('graphType')) {
		document.getElementById('graphType').dispatchEvent(new Event('change'));
		return;
	}
	const argsField = document.getElementsByName('figure_interactive_arguments')[0];
	let saved;
	try {
		saved = carouselSettings(argsField.value);
	} catch {
		saved = {};
	}
	container.replaceChildren();
	const gui = document.createElement('div');
	gui.id = 'graphGUI';
	gui.className = 'container graphGUI';
	container.append(gui);
	const label = document.createElement('label');
	label.htmlFor = 'graphType';
	label.textContent = 'Interactive type';
	const select = document.createElement('select');
	select.id = 'graphType';
	select.name = 'plotFields';
	[
		['None', 'Choose an interactive type'],
		['Plotly bar graph', 'Bar chart'],
		['Plotly line graph (time series)', 'Timeseries / line / scatter plot'],
		[TABULATOR_GRAPH_TYPE, 'Table (Tabulator)'],
		[CAROUSEL_TYPE, 'Image Carousel'],
		[COMPARISON_TYPE, 'Image Comparison Slider'],
	].forEach(([value, text]) => select.add(new Option(text, value)));
	if (saved.graphType === 'Plotly map') select.add(new Option('Map', 'Plotly map'));
	select.value = saved.graphType || 'None';
	gui.append(label, select);
	// Keep settings together; put the type choice before its conditional upload control.
	settingsRow.parentNode.insertBefore(settingsRow, upload);
	const notice = document.createElement('p');
	gui.append(notice);
	async function configure() {
		const version = ++requestVersion;
		document.getElementById('secondaryGraphFields')?.cleanupCaptionEditors?.();
		document.getElementById('secondaryGraphFields')?.remove();
		clearPreviousGraphFields();
		gui.querySelector('.gd-data-metadata')?.remove();
		const interactive = document.getElementsByName('figure_path')[0]?.value === 'Interactive';
		settingsRow.style.display = interactive ? 'block' : 'none';
		upload.style.display =
			interactive && ![CAROUSEL_TYPE, COMPARISON_TYPE, 'None'].includes(select.value)
				? 'block'
				: 'none';
		notice.textContent = '';
		// Preserve settings until their controls have been restored.
		const stored = carouselSettings(argsField.value);
		stored.graphType = select.value;
		argsField.value = JSON.stringify(Object.entries(stored));
		if (select.value === COMPARISON_TYPE) {
			comparisonParameterFields(argsField.value);
			return;
		}
		if (select.value === CAROUSEL_TYPE) {
			carouselParameterFields(argsField.value);
			return;
		}
		if (select.value === 'None') return;
		notice.textContent =
			'Upload a CSV or JSON file and save the figure to configure its data columns.';
		const id = document.getElementsByName('post_ID')[0]?.value;
		if (!id) return;
		try {
			const response = await fetch(
				`${location.origin}/wp-json/wp/v2/figure/${id}?_fields=uploaded_path_json`,
				{ headers: { 'X-WP-Nonce': moduleData.nonce || '' } },
			);
			if (!response.ok) throw new Error('Could not read the uploaded data path.');
			const meta = await response.json();
			if (!meta.uploaded_path_json) return;
			const path = '/wp-content' + meta.uploaded_path_json.split('wp-content')[1];
			const dataResponse = await fetch(path);
			if (!dataResponse.ok) throw new Error('Could not load the data file.');
			const data = await dataResponse.json();
			if (version !== requestVersion) return;
			const columnNames = meta.uploaded_path_json.includes('.geojson')
				? Object.keys(data.features?.[0]?.properties || {})
				: Object.keys(data.data || {});
			if (columnNames.length < 2) {
				notice.textContent = 'The data file must contain at least two columns.';
				return;
			}
			notice.textContent = '';
			const metadata = document.createElement('div');
			metadata.className = 'gd-data-metadata';
			// Metadata is plain text, not executable markup.
			if (data.metadata)
				metadata.textContent =
					'Current metadata: ' +
					Object.entries(data.metadata)
						.map(([key, value]) => `${key}: ${value}`)
						.join(' · ');
			gui.append(metadata);
			secondaryGraphFields(
				select.value,
				argsField.value,
				Object.fromEntries(columnNames.map((name, i) => [i, name])),
			);
		} catch (error) {
			if (version === requestVersion) notice.textContent = error.message;
		}
	}
	select.addEventListener('change', configure);
	document.getElementsByName('figure_path')[0]?.addEventListener('change', configure);
	await configure();
}

/**
 * Dynamically creates or clears parameter fields based on the selected graph type.
 * Handles the removal of existing fields and updates the UI with new fields as needed.
 *
 * @param {string} graphType             - The type of graph selected by the user (e.g., "None", "Plotly bar graph", "Plotly line graph (time series)").
 * @param {string} interactive_arguments - A string containing saved interactive arguments for pre-filling fields.
 */
function secondaryGraphFields(graphType, interactive_arguments, jsonColumns) {
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
		case TABULATOR_GRAPH_TYPE:
			// Clear any previously created graph fields and build the table settings
			clearPreviousGraphFields();
			tabulatorTableParameterFields(jsonColumns);
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
