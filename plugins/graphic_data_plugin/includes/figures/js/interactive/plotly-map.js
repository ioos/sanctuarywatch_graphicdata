import { loadPlotlyScript } from '@graphic-data/plotly-utility';

// === 1. Wait for Target Element ===
/**
 * Polls the DOM until an element with the given ID appears, or the timeout is reached.
 *
 * Uses recursive `setTimeout` so each poll waits a full `interval` ms after the
 * previous check completes.
 *
 * @async
 * @param {string} id - The ID of the element to wait for.
 * @param {number} [timeout=10000] - Maximum time in milliseconds to wait before rejecting.
 * @param {number} [interval=100] - Milliseconds between each DOM poll.
 * @returns {Promise<HTMLElement>} Resolves with the element once it appears in the DOM.
 * @throws {Error} Rejects if the element is not found within `timeout` milliseconds.
 */
async function waitForElementById(id, timeout = 10000, interval = 100) {
	const start = Date.now();

	return new Promise((resolve, reject) => {
		(function poll() {
			const element = document.getElementById(id);
			if (element) {
				return resolve(element);
			}

			if (Date.now() - start >= timeout) {
				return reject(
					new Error(
						`Element with id ${id} not found after ${timeout}ms`
					)
				);
			}

			setTimeout(poll, interval);
		})();
	});
}

// === 2. Value Classification Function (equal interval) ===
/**
 * Assigns each value to a class index using equal-interval classification.
 *
 * Divides the range `[min, max]` into `numClasses` equal-width buckets and returns
 * the zero-based class index for each input value. The last class index
 * (`numClasses - 1`) is clamped so that the maximum value doesn't overflow into a
 * non-existent class.
 *
 * @param {number[]} values - Array of numeric values to classify.
 * @param {number} numClasses - Number of equal-interval classes to divide the range into.
 * @returns {number[]} Array of zero-based class indices, one per input value, in the range
 *   `[0, numClasses - 1]`.
 */
function classifyValues(values, numClasses) {
	const min = Math.min(...values);
	const max = Math.max(...values);
	const interval = (max - min) / numClasses;
	return values.map((v) =>
		Math.min(numClasses - 1, Math.floor((v - min) / interval))
	);
}

/**
 * Dynamically builds and injects the map parameter UI into the `#graphGUI` element.
 *
 * Fetches the GeoJSON file associated with the current figure post, inspects the geometry
 * types present (`Point`, `LineString`, `Polygon`, etc.), and renders per-geometry setting
 * fields (color, thickness, visibility, classification classes, tooltip options). Also renders
 * global controls for graph type (scattermapbox / densitymapbox / choroplethmapbox), map style,
 * and an optional Mapbox access token.
 *
 * @async
 * @param {Object} jsonColumns - Key/value map of available data columns, used to populate
 *   the "Field for Tooltip Hover" dropdowns for each geometry type.
 * @param {string|null} interactive_arguments - JSON-encoded string containing at minimum a
 *   `postID` property, used to look up the figure's GeoJSON path via the WP REST API.
 *   Falls back to the `post_ID` hidden input in the DOM if `null`.
 * @returns {Promise<void>}
 */
async function plotlyMapParameterFields(jsonColumns, interactive_arguments) {
	const targetElement = document.getElementById('graphGUI');
	const newDiv = document.createElement('div');
	newDiv.id = 'secondaryGraphFields';

	// Graph Type
	const graphTypes = ['scattermapbox', 'densitymapbox', 'choroplethmapbox'];
	const graphRow = document.createElement('div');
	graphRow.className = 'row fieldPadding';
	const graphCol1 = document.createElement('div');
	graphCol1.className = 'col-3';
	const graphCol2 = document.createElement('div');
	graphCol2.className = 'col';
	const labelGraph = document.createElement('label');
	labelGraph.for = 'GraphType';
	labelGraph.textContent = 'Graph Type';
	const selectGraph = document.createElement('select');
	selectGraph.id = 'GraphType';
	selectGraph.name = 'plotFields';
	graphTypes.forEach((type) => {
		const opt = document.createElement('option');
		opt.value = type;
		opt.textContent = type;
		selectGraph.appendChild(opt);
	});
	graphCol1.appendChild(labelGraph);
	graphCol2.appendChild(selectGraph);
	graphRow.appendChild(graphCol1);
	graphRow.appendChild(graphCol2);
	newDiv.appendChild(graphRow);

	// Map Style (Expandable container for Map Type and Mapbox Style)
	const mapOptions = {
		scattermapbox: [
			'open-street-map',
			'white-bg',
			'carto-positron',
			'stamen-terrain',
			'stamen-toner',
		],
		densitymapbox: ['light', 'dark', 'satellite', 'streets'],
		choroplethmapbox: ['light', 'dark', 'carto-positron'],
	};

	const styleContainer = document.createElement('div');
	styleContainer.id = 'mapStyleContainer';

	const selectedGraphType = selectGraph.value;
	const styles = mapOptions[selectedGraphType] || [];
	const styleRow = document.createElement('div');
	styleRow.className = 'row fieldPadding';
	const styleCol1 = document.createElement('div');
	styleCol1.className = 'col-3';
	const styleCol2 = document.createElement('div');
	styleCol2.className = 'col';
	const labelStyle = document.createElement('label');
	labelStyle.for = 'MapStyle';
	labelStyle.textContent = 'Map Style';
	const selectStyle = document.createElement('select');
	selectStyle.id = 'MapStyle';
	selectStyle.name = 'plotFields';
	styles.forEach((style) => {
		const opt = document.createElement('option');
		opt.value = style;
		opt.textContent = style;
		selectStyle.appendChild(opt);
	});
	styleCol1.appendChild(labelStyle);
	styleCol2.appendChild(selectStyle);
	styleRow.appendChild(styleCol1);
	styleRow.appendChild(styleCol2);
	styleContainer.appendChild(styleRow);

	// Token field
	const tokenRow = document.createElement('div');
	tokenRow.className = 'row fieldPadding';
	const tokenCol1 = document.createElement('div');
	tokenCol1.className = 'col-3';
	const tokenCol2 = document.createElement('div');
	tokenCol2.className = 'col';
	const labelToken = document.createElement('label');
	labelToken.for = 'MapboxToken';
	labelToken.textContent = 'Mapbox Access Token (if required)';
	const inputToken = document.createElement('input');
	inputToken.id = 'MapboxToken';
	inputToken.name = 'plotFields';
	inputToken.type = 'text';
	tokenCol1.appendChild(labelToken);
	tokenCol2.appendChild(inputToken);
	tokenRow.appendChild(tokenCol1);
	tokenRow.appendChild(tokenCol2);
	styleContainer.appendChild(tokenRow);

	newDiv.appendChild(styleContainer);

	// Detect geometry types in GeoJSON
	const rootURL = window.location.origin;
	const postID = interactive_arguments
		? JSON.parse(interactive_arguments).postID
		: null;
	const figureID = postID || document.getElementsByName('post_ID')[0]?.value;
	const res = await fetch(
		`${rootURL}/wp-json/wp/v2/figure/${figureID}?_fields=uploaded_path_json`
	);
	const data = await res.json();
	const geojsonURL = `${rootURL}/wp-content${data.uploaded_path_json.split('wp-content')[1]}`;
	const geoData = await fetch(geojsonURL).then((r) => r.json());
	const geometrySet = new Set(geoData.features.map((f) => f.geometry.type));

	// Create UI for each present geometry
	geometrySet.forEach((type) => {
		const container = document.createElement('div');
		container.className = 'row';

		// === Add separator line ===
		const separator = document.createElement('hr');
		separator.style.border = 'none';
		separator.style.borderTop = '2px solid #ccc';
		separator.style.margin = '20px 0';
		container.appendChild(separator);

		const label = document.createElement('label');
		label.innerText = `${type} Settings`;
		label.style.fontWeight = 'bold';
		label.style.marginTop = '10px';
		container.appendChild(label);

		const fields = [
			{ id: `${type}Color`, label: 'Color', type: 'color' },
			{
				id: `${type}Thickness`,
				label: type === 'Point' ? 'Marker Size' : 'Line/Border Width',
				type: 'number',
			},
			{ id: `${type}Visible`, label: 'Visible', type: 'checkbox' },
		];

		fields.forEach((f) => {
			const row = document.createElement('div');
			row.className = 'row fieldPadding';
			const col1 = document.createElement('div');
			col1.className = 'col-3';
			const col2 = document.createElement('div');
			col2.className = 'col';

			const fieldLabel = document.createElement('label');
			fieldLabel.for = f.id;
			fieldLabel.textContent = f.label;

			const input = document.createElement('input');
			input.id = f.id;
			input.name = 'plotFields';
			input.type = f.type;
			if (f.type === 'number') {
				input.min = '0';
			}

			col1.appendChild(fieldLabel);
			col2.appendChild(input);
			row.appendChild(col1);
			row.appendChild(col2);
			container.appendChild(row);
		});

		// Classification
		const classRow = document.createElement('div');
		classRow.className = 'row fieldPadding';
		const classCol1 = document.createElement('div');
		classCol1.className = 'col-3';
		const classCol2 = document.createElement('div');
		classCol2.className = 'col';
		const classLabel = document.createElement('label');
		classLabel.for = `${type}NumClasses`;
		classLabel.textContent = 'Classification Classes';
		const classInput = document.createElement('input');
		classInput.type = 'number';
		classInput.id = `${type}NumClasses`;
		classInput.name = 'plotFields';
		classInput.value = '5';
		classInput.min = '2';
		classCol1.appendChild(classLabel);
		classCol2.appendChild(classInput);
		classRow.appendChild(classCol1);
		classRow.appendChild(classCol2);
		container.appendChild(classRow);

		// ShowToolTips
		const tooltipRow = document.createElement('div');
		tooltipRow.className = 'row fieldPadding';
		const tipCol1 = document.createElement('div');
		tipCol1.className = 'col-3';
		const tipCol2 = document.createElement('div');
		tipCol2.className = 'col';
		const tipLabel = document.createElement('label');
		tipLabel.for = `${type}ShowTooltip`;
		tipLabel.textContent = 'Show Tooltips';
		const tipCheckbox = document.createElement('input');
		tipCheckbox.type = 'checkbox';
		tipCheckbox.id = `${type}ShowTooltip`;
		tipCheckbox.name = 'plotFields';
		tipCol1.appendChild(tipLabel);
		tipCol2.appendChild(tipCheckbox);
		tooltipRow.appendChild(tipCol1);
		tooltipRow.appendChild(tipCol2);
		container.appendChild(tooltipRow);

		// Tooltip data dropdown
		const hoverRow = document.createElement('div');
		hoverRow.className = 'row fieldPadding';
		const hoverCol1 = document.createElement('div');
		hoverCol1.className = 'col-3';
		const hoverCol2 = document.createElement('div');
		hoverCol2.className = 'col';
		const hoverLabel = document.createElement('label');
		hoverLabel.for = `${type}HoverField`;
		hoverLabel.textContent = 'Field for Tooltip Hover';
		const selectHover = document.createElement('select');
		selectHover.id = `${type}HoverField`;
		selectHover.name = 'plotFields';
		Object.values(jsonColumns).forEach((val) => {
			const opt = document.createElement('option');
			opt.value = val;
			opt.textContent = val;
			selectHover.appendChild(opt);
		});
		hoverCol1.appendChild(hoverLabel);
		hoverCol2.appendChild(selectHover);
		hoverRow.appendChild(hoverCol1);
		hoverRow.appendChild(hoverCol2);
		container.appendChild(hoverRow);

		newDiv.appendChild(container);
	});

	targetElement.appendChild(newDiv);
}

// === 6. Produce Plotly Map with UI-controlled Styles ===
/**
 * Renders a Plotly geographic map into the target figure container.
 *
 * Loads Plotly if not already available, fetches the GeoJSON file associated with the
 * figure post via the WP REST API, applies classification and tooltip settings from
 * `interactive_arguments`, creates a `<div>` inside `targetFigureElement`, and calls
 * `Plotly.newPlot` to render the chart.
 *
 * Only renders if the figure ID derived from `postID` (or the DOM `post_ID` input) matches
 * the post ID embedded in `targetFigureElement`.
 *
 * @async
 * @param {string} targetFigureElement - The DOM element ID of the figure container,
 *   expected to end with `_<postID>` (e.g. `"figure_interactive_42"`).
 * @param {string} interactive_arguments - JSON-encoded array of `[key, value]` pairs
 *   containing figure settings such as `GeometryType`, `ValueProperty`, `ShowTooltip`,
 *   and `NumClasses`.
 * @param {string|number|null} postID - WordPress post ID for the figure. Falls back to
 *   the `post_ID` hidden input in the DOM if `null` or `undefined`.
 * @returns {Promise<void>}
 */
export async function producePlotlyMap(
	targetFigureElement,
	interactive_arguments,
	postID
) {
	await loadPlotlyScript();
	const args = Object.fromEntries(JSON.parse(interactive_arguments));
	const rootURL = window.location.origin;
	const figureID = postID || document.getElementsByName('post_ID')[0]?.value;

	const res = await fetch(
		`${rootURL}/wp-json/wp/v2/figure/${figureID}?_fields=uploaded_path_json`
	);
	const data = await res.json();
	const geojsonURL = `${rootURL}/wp-content${data.uploaded_path_json.split('wp-content')[1]}`;

	const geoData = await fetch(geojsonURL).then((r) => r.json());
	const geometryType = args.GeometryType || geoData.features[0].geometry.type;
	const valueField = args.ValueProperty || null;
	const showTooltip = args.ShowTooltip === 'on';
	const numClasses = parseInt(args.NumClasses || 5);

	const values = valueField
		? geoData.features.map((f) =>
				parseFloat(f.properties?.[valueField] || 0)
			)
		: [];
	const classIndices = valueField ? classifyValues(values, numClasses) : [];

	const plotlyDivID = `plotlyFigure${figureID}`;
	const newDiv = document.createElement('div');
	newDiv.id = plotlyDivID;
	newDiv.classList.add('container', `figure_interactive${figureID}`);

	const targetElementparts = targetFigureElement.split('_');
	const targetElementpostID =
		targetElementparts[targetElementparts.length - 1];

	if (figureID == targetElementpostID) {
		console.log(
			`Figure ID ${figureID} matches target element post ID ${targetElementpostID}`
		);
		console.log('targetFigureElement', targetFigureElement);

		const targetElement = await waitForElementById(targetFigureElement); // ✅ await here
		console.log('targetElement', targetElement);
		targetElement.appendChild(newDiv);

		const thisdata = [
			{
				type: 'scattergeo',
				mode: 'markers+text',
				text: [
					'Montreal',
					'Toronto',
					'Vancouver',
					'Calgary',
					'Edmonton',
					'Ottawa',
					'Halifax',
					'Victoria',
					'Winnepeg',
					'Regina',
				],
				lon: [
					-73.57, -79.24, -123.06, -114.1, -113.28, -75.43, -63.57,
					-123.21, -97.13, -104.6,
				],
				lat: [
					45.5, 43.4, 49.13, 51.1, 53.34, 45.24, 44.64, 48.25, 49.89,
					50.45,
				],
				marker: {
					size: 7,
					color: [
						'#bebada',
						'#fdb462',
						'#fb8072',
						'#d9d9d9',
						'#bc80bd',
						'#b3de69',
						'#8dd3c7',
						'#80b1d3',
						'#fccde5',
						'#ffffb3',
					],
					line: {
						width: 1,
					},
				},
				name: 'Canadian cities',
				textposition: [
					'top right',
					'top left',
					'top center',
					'bottom right',
					'top right',
					'top left',
					'bottom right',
					'bottom left',
					'top right',
					'top right',
				],
			},
		];

		const layout = {
			title: {
				text: 'Canadian cities',
				font: {
					family: 'Droid Serif, serif',
					size: 16,
				},
			},
			geo: {
				scope: 'north america',
				resolution: 50,
				lonaxis: {
					range: [-130, -55],
				},
				lataxis: {
					range: [40, 70],
				},
				showrivers: true,
				rivercolor: '#fff',
				showlakes: true,
				lakecolor: '#fff',
				showland: true,
				landcolor: '#EAEAAE',
				countrycolor: '#d3d3d3',
				countrywidth: 1.5,
				subunitcolor: '#d3d3d3',
			},
			margin: { t: 60, b: 60, l: 60, r: 60 },
		};

		const config = { responsive: true, displaylogo: false };

		// Set up the plotlyDiv (The div the the plot will be rendered in)
		const plotDiv = document.getElementById(plotlyDivID);
		plotDiv.style.setProperty('width', '100%', 'important');
		plotDiv.style.setProperty('max-width', 'none', 'important');
		// Plotly.newPlot(plotlyDivID, trace, layout, config);
		Plotly.newPlot(plotlyDivID, thisdata, layout, config);
	}
}
