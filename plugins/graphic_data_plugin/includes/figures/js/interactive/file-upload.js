import { COMPARISON_TYPE } from './image-comparison.js';
import { comparisonParameterFields } from './image-comparison-settings.js';
import { TABULATOR_GRAPH_TYPE } from '@graphic-data/tabulator-table';
import { tabulatorTableParameterFields } from '@graphic-data/tabulator-table-settings';
import { CAROUSEL_TYPE, carouselSettings } from './image-carousel.js';
import { carouselParameterFields } from './image-carousel-settings.js';
import { LEAFLET_MAP_GRAPH_TYPE } from './leaflet-map.js';
import { leafletMapParameterFields } from './leaflet-map-settings.js';

const DEFAULT_UPLOAD_ACCEPT = '.json, .csv, .geojson';

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
	label.textContent = 'Interactive Type: ';
	const select = document.createElement('select');
	select.id = 'graphType';
	select.name = 'plotFields';
	// [stored value, label]. Labels are what authors see; values are saved with the figure.
	const types = [
		['Plotly bar graph', 'Bar chart'],
		['Plotly line graph (time series)', 'Timeseries / line / scatter plot'],
		[TABULATOR_GRAPH_TYPE, 'Table'],
		[LEAFLET_MAP_GRAPH_TYPE, 'Map'],
		[CAROUSEL_TYPE, 'Image Carousel'],
		[COMPARISON_TYPE, 'Image Comparison Slider'],
	];
	// Older figures may use the retired Plotly map; offer it only to them.
	if (saved.graphType === 'Plotly map') {
		types.push(['Plotly map', 'Map (legacy Plotly)']);
	}
	// The prompt stays first; the types follow in alphabetical order of their labels.
	[
		['None', 'Choose an interactive type'],
		...types.sort(([, a], [, b]) =>
			a.localeCompare(b, undefined, { sensitivity: 'base' })
		),
	].forEach(([value, text]) => select.add(new Option(text, value)));
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
		const isMap = select.value === LEAFLET_MAP_GRAPH_TYPE;
		// Maps take a single GeoJSON file; the other data-driven types take CSV or JSON.
		const fileInput = document.getElementById('uploaded-file');
		if (fileInput) {
			fileInput.accept = isMap ? '.geojson' : DEFAULT_UPLOAD_ACCEPT;
		}
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
		notice.textContent = isMap
			? 'Upload a GeoJSON (.geojson) file and save the figure to configure its map layers.'
			: 'Upload a CSV or JSON file and save the figure to configure its data columns.';
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
			// A replaced file keeps its URL when the new file has the same name, so always
			// check with the server rather than reuse a cached copy of the old file.
			const dataResponse = await fetch(path, { cache: 'no-cache' });
			if (!dataResponse.ok) throw new Error('Could not load the data file.');
			const data = await dataResponse.json();
			if (version !== requestVersion) return;
			if (isMap) {
				if (!/\.geojson$/i.test(meta.uploaded_path_json.trim())) {
					notice.textContent =
						'Maps need a GeoJSON (.geojson) file. Delete the current file and upload a GeoJSON file.';
					return;
				}
				notice.textContent = '';
				showMetadata(data);
				secondaryGraphFields(select.value, argsField.value, {}, data);
				return;
			}
			const columnNames = meta.uploaded_path_json.includes('.geojson')
				? Object.keys(data.features?.[0]?.properties || {})
				: Object.keys(data.data || {});
			if (columnNames.length < 2) {
				notice.textContent = 'The data file must contain at least two columns.';
				return;
			}
			notice.textContent = '';
			showMetadata(data);
			secondaryGraphFields(
				select.value,
				argsField.value,
				Object.fromEntries(columnNames.map((name, i) => [i, name])),
			);
		} catch (error) {
			if (version === requestVersion) notice.textContent = error.message;
		}
	}
	/** Shows the data file's top-level "metadata" object (CSV/JSON and GeoJSON files alike). */
	function showMetadata(data) {
		const metadata = document.createElement('div');
		metadata.className = 'gd-data-metadata';
		// Restore the original layout without interpreting uploaded text as HTML.
		metadata.style.display = 'block';
		metadata.append(
			'Current Metadata:',
			document.createElement('br'),
			document.createElement('br')
		);
		const metadataRows = Object.entries(data?.metadata || {});
		const rows = metadataRows.length
			? metadataRows
			: [[null, 'No metadata found.']];
		rows.forEach(([key, value]) => {
			const row = document.createElement('span');
			row.style.fontSize = '13px';
			const cleanedValue = String(value ?? '').replace(/,/g, '');
			row.textContent =
				key === null ? cleanedValue : `${key}: ${cleanedValue}`;
			metadata.append(row, document.createElement('br'));
		});
		const divider = document.createElement('hr');
		divider.style.cssText = 'border:0.5px solid lightgrey;margin-top:8px';
		metadata.append(document.createElement('br'), divider);
		gui.append(metadata);
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
 * @param {Object} jsonColumns           - Column names keyed by position.
 * @param {*}      [fileContents]        - Parsed data file; used by map figures, which need the whole GeoJSON.
 */
function secondaryGraphFields(
	graphType,
	interactive_arguments,
	jsonColumns,
	fileContents
) {
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
		case LEAFLET_MAP_GRAPH_TYPE:
			// Clear any previously created graph fields and build the map layer settings
			clearPreviousGraphFields();
			leafletMapParameterFields(fileContents);
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
