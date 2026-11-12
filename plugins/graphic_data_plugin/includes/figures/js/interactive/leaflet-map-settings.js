/**
 * Admin settings for Leaflet map figures.
 *
 * Builds the map controls inside the Figure edit screen's graph settings
 * area (#graphGUI). Every control is named "plotFields", so the shared
 * logFormFieldValues() / fillFormFieldValues() helpers save and restore it
 * through figure_interactive_arguments, exactly like the other figure types.
 */

// Resolved by the WordPress script module import map, which ESLint cannot see.
/* eslint-disable import/no-unresolved */
import {
	logFormFieldValues,
	fillFormFieldValues,
} from '@graphic-data/plotly-utility';
/* eslint-enable import/no-unresolved */
import {
	BASEMAPS,
	LINE_STYLES,
	MAP_FIELD,
	MAP_DEFAULTS,
	mapLayerField,
	defaultLayerStyle,
	defaultLayerTitle,
	defaultHoverTitle,
	findFeatureCollections,
	resolveLayerOrder,
	resolveBasemapKey,
} from './leaflet-map.js';

function savedOrDefault(id, fallback) {
	const saved = fillFormFieldValues(id);
	if (saved !== undefined) {
		return String(saved);
	}
	return fallback !== undefined ? String(fallback) : (MAP_DEFAULTS[id] ?? '');
}

function makeRow(labelText, labelFor) {
	const row = document.createElement('div');
	row.classList.add('row', 'fieldPadding');

	const labelColumn = document.createElement('div');
	labelColumn.classList.add('col-3');
	const fieldColumn = document.createElement('div');
	fieldColumn.classList.add('col');

	const label = document.createElement('label');
	label.textContent = labelText;
	if (labelFor) {
		label.htmlFor = labelFor;
	}
	labelColumn.appendChild(label);

	row.append(labelColumn, fieldColumn);
	return { row, fieldColumn };
}

function makeSelect(id, options, fallback) {
	const select = document.createElement('select');
	select.id = id;
	select.name = 'plotFields';
	options.forEach(([value, text]) => {
		select.add(new Option(text, value));
	});
	const saved = savedOrDefault(id, fallback);
	// A saved value that is no longer offered falls back to the default.
	const value = [saved, fallback, MAP_DEFAULTS[id]].find((candidate) =>
		options.some(([option]) => option === String(candidate))
	);
	if (value !== undefined) {
		select.value = String(value);
	}
	select.addEventListener('change', logFormFieldValues);
	return select;
}

function makeInput(id, { type = 'text', fallback = '', min, max, step } = {}) {
	const input = document.createElement('input');
	input.id = id;
	input.name = 'plotFields';
	input.type = type;
	input.value = savedOrDefault(id, fallback);
	if (min !== undefined) {
		input.min = String(min);
	}
	if (max !== undefined) {
		input.max = String(max);
	}
	if (step !== undefined) {
		input.step = String(step);
	}
	input.addEventListener('change', logFormFieldValues);
	return input;
}

function addOption(container, labelText, control, helpText) {
	const { row, fieldColumn } = makeRow(labelText, control.id);
	fieldColumn.appendChild(control);
	if (helpText) {
		fieldColumn.appendChild(helpElement(helpText));
	}
	container.appendChild(row);
}

function helpElement(text) {
	const help = document.createElement('div');
	help.style.cssText = 'font-size:12px;color:#646970;margin-top:2px;';
	help.textContent = text;
	return help;
}

function makeMoveButton(symbol, label) {
	const button = document.createElement('button');
	button.type = 'button';
	button.className = 'button button-small';
	button.textContent = symbol;
	button.setAttribute('aria-label', label);
	button.title = label;
	button.style.cssText = 'min-width:28px;padding:0 6px;';
	return button;
}

/**
 * A small labelled control inside a layer card.
 *
 * @param {string}      text    Label text.
 * @param {HTMLElement} control Form control to label.
 * @return {HTMLLabelElement} Label wrapping the caption and control.
 */
function labelled(text, control) {
	const label = document.createElement('label');
	label.style.cssText =
		'display:flex;flex-direction:column;gap:2px;font-size:12px;color:#3c434a;';
	label.htmlFor = control.id;
	const caption = document.createElement('span');
	caption.textContent = text;
	label.append(caption, control);
	return label;
}

function describeCollection(collection) {
	const count = `${collection.featureCount} feature${collection.featureCount === 1 ? '' : 's'}`;
	const kinds = collection.geometryKinds.length
		? collection.geometryKinds.map((kind) => `${kind}s`).join(', ')
		: 'no geometry';
	return `${count} · ${kinds}`;
}

function buildLayerCard(collection, onMove) {
	const index = collection.index;
	const defaults = defaultLayerStyle(index);
	const displayName = defaultLayerTitle(collection.name);
	const hasFill = collection.geometryKinds.some((kind) => kind !== 'line');
	const hasPoints = collection.geometryKinds.includes('point');

	const card = document.createElement('fieldset');
	card.dataset.layerIndex = String(index);
	card.dataset.layerName = displayName;
	card.style.cssText =
		'border:1px solid #c3c4c7;border-radius:4px;padding:8px 12px 12px;margin:0 0 8px;background:#fff;';

	// Header: order buttons, show/hide, collection name.
	const header = document.createElement('legend');
	header.style.cssText =
		'display:flex;flex-wrap:wrap;align-items:center;gap:8px;padding:0 4px;font-weight:600;';
	const up = makeMoveButton('↑', `Move ${displayName} up`);
	up.dataset.move = 'up';
	const down = makeMoveButton('↓', `Move ${displayName} down`);
	down.dataset.move = 'down';
	up.addEventListener('click', () => onMove(card, -1, up));
	down.addEventListener('click', () => onMove(card, 1, down));

	const show = makeSelect(
		mapLayerField.show(index),
		[
			['Show', 'Show'],
			['Hide', 'Hide'],
		],
		'Show'
	);
	show.setAttribute('aria-label', `Show ${displayName} on the map`);
	show.style.minWidth = '5.5em';

	const title = document.createElement('span');
	title.textContent = displayName;
	const details = document.createElement('span');
	details.style.cssText = 'font-weight:400;color:#646970;font-size:12px;';
	details.textContent = describeCollection(collection);

	header.append(up, down, show, title, details);
	card.appendChild(header);

	// Style controls.
	const controls = document.createElement('div');
	controls.style.cssText =
		'display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-end;';

	const name = makeInput(mapLayerField.name(index), {
		fallback: displayName,
	});
	name.style.minWidth = '14em';
	controls.appendChild(labelled('Legend label', name));

	if (hasFill) {
		const fillColor = makeInput(mapLayerField.fillColor(index), {
			type: 'color',
			fallback: defaults.fillColor,
		});
		controls.appendChild(labelled('Fill color', fillColor));
		const fillOpacity = makeInput(mapLayerField.fillOpacity(index), {
			type: 'number',
			fallback: defaults.fillOpacity,
			min: 0,
			max: 100,
			step: 5,
		});
		fillOpacity.style.width = '5.5em';
		controls.appendChild(labelled('Fill opacity (%)', fillOpacity));
	}

	const strokeColor = makeInput(mapLayerField.strokeColor(index), {
		type: 'color',
		fallback: defaults.strokeColor,
	});
	controls.appendChild(
		labelled(hasFill ? 'Outline color' : 'Line color', strokeColor)
	);

	const strokeWidth = makeInput(mapLayerField.strokeWidth(index), {
		type: 'number',
		fallback: defaults.strokeWidth,
		min: 0,
		max: 20,
		step: 0.5,
	});
	strokeWidth.style.width = '5.5em';
	controls.appendChild(
		labelled(
			hasFill ? 'Outline width (px)' : 'Line width (px)',
			strokeWidth
		)
	);

	const strokeOpacity = makeInput(mapLayerField.strokeOpacity(index), {
		type: 'number',
		fallback: defaults.strokeOpacity,
		min: 0,
		max: 100,
		step: 5,
	});
	strokeOpacity.style.width = '5.5em';
	controls.appendChild(
		labelled(
			hasFill ? 'Outline opacity (%)' : 'Line opacity (%)',
			strokeOpacity
		)
	);

	controls.appendChild(
		labelled(
			'Line style',
			makeSelect(
				mapLayerField.lineStyle(index),
				LINE_STYLES,
				defaults.lineStyle
			)
		)
	);

	if (hasPoints) {
		const pointRadius = makeInput(mapLayerField.pointRadius(index), {
			type: 'number',
			fallback: defaults.pointRadius,
			min: 1,
			max: 40,
			step: 1,
		});
		pointRadius.style.width = '5.5em';
		controls.appendChild(labelled('Point radius (px)', pointRadius));
	}

	// Hover tooltip.
	const titleOptions = [
		['(none)', 'No title'],
		...collection.properties.map((key) => [key, key]),
	];
	controls.appendChild(
		labelled(
			'Hover title',
			makeSelect(
				mapLayerField.hoverTitle(index),
				titleOptions,
				defaultHoverTitle(collection.properties) || '(none)'
			)
		)
	);
	controls.appendChild(
		labelled(
			'Hover details',
			makeSelect(
				mapLayerField.hoverDetails(index),
				[
					['all', 'All feature properties'],
					['title', 'Title only'],
				],
				'all'
			)
		)
	);

	card.appendChild(controls);
	return card;
}

function buildLayerList(collections) {
	const wrapper = document.createElement('div');

	// Stores the drawing order, top layer first, e.g. "2,0,1". Saved with the other plotFields.
	const orderInput = document.createElement('input');
	orderInput.type = 'hidden';
	orderInput.id = MAP_FIELD.layerOrder;
	orderInput.name = 'plotFields';
	wrapper.appendChild(orderInput);

	// Announces moves to screen reader users.
	const announcer = document.createElement('div');
	announcer.setAttribute('aria-live', 'polite');
	announcer.className = 'screen-reader-text';
	wrapper.appendChild(announcer);

	const list = document.createElement('div');

	function syncOrder({ save = true } = {}) {
		const cards = [...list.children];
		orderInput.value = cards
			.map((card) => card.dataset.layerIndex)
			.join(',');
		cards.forEach((card, position) => {
			card.querySelector('[data-move="up"]').disabled = position === 0;
			card.querySelector('[data-move="down"]').disabled =
				position === cards.length - 1;
		});
		if (save) {
			logFormFieldValues();
		}
	}

	function moveCard(card, direction, button) {
		if (direction < 0 && card.previousElementSibling) {
			list.insertBefore(card, card.previousElementSibling);
		} else if (direction > 0 && card.nextElementSibling) {
			list.insertBefore(card.nextElementSibling, card);
		} else {
			return;
		}
		syncOrder();

		// Keep keyboard focus on the moved layer.
		const target = button.disabled
			? card.querySelector(
					`[data-move="${direction < 0 ? 'down' : 'up'}"]`
				)
			: button;
		target.focus();

		const position = [...list.children].indexOf(card) + 1;
		announcer.textContent = `${card.dataset.layerName} moved to position ${position} of ${list.children.length}.`;
	}

	resolveLayerOrder(
		savedOrDefault(MAP_FIELD.layerOrder, ''),
		collections.length
	).forEach((index) => {
		list.appendChild(buildLayerCard(collections[index], moveCard));
	});
	wrapper.appendChild(list);

	syncOrder({ save: false });
	return wrapper;
}

/** The preview map on this screen, if one has been drawn and is visible. */
function findPreviewMap() {
	const handles = [...document.querySelectorAll('.graphic-data-leaflet-map')]
		.map((element) => element.graphicDataMap)
		.filter(Boolean);
	return (
		handles.find((handle) => handle.element.offsetWidth > 0) ||
		handles[0] ||
		null
	);
}

/**
 * The "Map extent" setting: fit to the layers, or a custom bounding box that
 * can be typed in or captured from the preview map.
 */
function buildExtentSettings() {
	const mode = makeSelect(MAP_FIELD.extent, [
		['fit', 'Fit to the visible layers'],
		['custom', 'Custom extent'],
	]);
	const { row, fieldColumn } = makeRow('Map extent', mode.id);
	fieldColumn.appendChild(mode);

	const custom = document.createElement('div');
	custom.style.cssText = 'margin-top:8px;';

	const boxes = document.createElement('div');
	boxes.style.cssText =
		'display:flex;flex-wrap:wrap;gap:10px 16px;align-items:flex-end;';
	const inputs = {};
	[
		['West', MAP_FIELD.extentWest, -180, 360],
		['South', MAP_FIELD.extentSouth, -85, 85],
		['East', MAP_FIELD.extentEast, -180, 540],
		['North', MAP_FIELD.extentNorth, -85, 85],
	].forEach(([text, id, min, max]) => {
		const input = makeInput(id, { type: 'number', min, max, step: 'any' });
		input.style.width = '8em';
		input.placeholder =
			text === 'West' || text === 'East' ? 'Longitude' : 'Latitude';
		inputs[id] = input;
		boxes.appendChild(labelled(text, input));
	});

	const capture = document.createElement('button');
	capture.type = 'button';
	capture.className = 'button';
	capture.textContent = 'Use the current preview view';
	boxes.appendChild(capture);
	custom.appendChild(boxes);

	const status = document.createElement('div');
	status.setAttribute('aria-live', 'polite');
	status.style.cssText = 'font-size:12px;color:#646970;margin-top:4px;';
	status.textContent =
		'Longitude and latitude in decimal degrees. To set the extent visually, click Preview, pan and zoom the map, then click "Use the current preview view".';
	custom.appendChild(status);

	capture.addEventListener('click', () => {
		const preview = findPreviewMap();
		if (!preview) {
			status.textContent =
				'No map preview is open. Click Preview, pan and zoom the map, then try again.';
			return;
		}
		const extent = preview.getExtent();
		inputs[MAP_FIELD.extentWest].value = extent.west;
		inputs[MAP_FIELD.extentSouth].value = extent.south;
		inputs[MAP_FIELD.extentEast].value = extent.east;
		inputs[MAP_FIELD.extentNorth].value = extent.north;
		logFormFieldValues();
		status.textContent = `Map extent set to the preview view (west ${extent.west}, south ${extent.south}, east ${extent.east}, north ${extent.north}). Click Preview to check it.`;
	});

	const sync = () => {
		custom.style.display = mode.value === 'custom' ? 'block' : 'none';
	};
	mode.addEventListener('change', () => {
		sync();
		// Start a new custom extent from the preview, when one is open.
		const empty = Object.values(inputs).every(
			(input) => input.value === ''
		);
		if (mode.value === 'custom' && empty && findPreviewMap()) {
			capture.click();
		}
	});
	sync();

	fieldColumn.appendChild(custom);
	return row;
}

/**
 * Creates the map settings for the uploaded GeoJSON file.
 *
 * Called by file-upload.js when the interactive type is "Leaflet map".
 *
 * @param {*} geojson Parsed contents of the figure's GeoJSON file.
 */
export function leafletMapParameterFields(geojson) {
	const targetElement = document.getElementById('graphGUI');
	if (!targetElement) {
		return;
	}

	const container = document.createElement('div');
	container.id = 'secondaryGraphFields';

	const collections = findFeatureCollections(geojson);
	if (!collections.length) {
		const message = document.createElement('p');
		message.style.color = '#b32d2e';
		message.textContent =
			'No feature collections were found in this GeoJSON file. Delete it and upload a GeoJSON file that contains features.';
		container.appendChild(message);
		targetElement.appendChild(container);
		return;
	}

	addOption(
		container,
		'Base map',
		makeSelect(
			MAP_FIELD.basemap,
			Object.entries(BASEMAPS).map(([key, basemap]) => [
				key,
				basemap.label,
			]),
			// Saved figures may use a retired base map key.
			resolveBasemapKey(fillFormFieldValues(MAP_FIELD.basemap))
		)
	);

	addOption(
		container,
		'Map height (px)',
		makeInput(MAP_FIELD.height, {
			type: 'number',
			min: 200,
			max: 1200,
			step: 10,
		}),
		'The map always fills the available width.'
	);

	addOption(
		container,
		'Legend',
		makeSelect(MAP_FIELD.legend, [
			['toggle', 'Legend with show/hide checkboxes'],
			['static', 'Legend only'],
			['none', 'No legend'],
		])
	);

	addOption(
		container,
		'Zoom with mouse wheel',
		makeSelect(MAP_FIELD.scrollZoom, [
			['No', 'No (zoom with the + / − buttons)'],
			['Yes', 'Yes'],
		]),
		'Leaving this off stops the map from capturing page scrolling.'
	);

	container.appendChild(buildExtentSettings());

	addOption(
		container,
		'Limit to map extent',
		makeSelect(MAP_FIELD.lockExtent, [
			['No', 'No (readers can pan and zoom anywhere)'],
			['Yes', 'Yes (readers stay within the map extent)'],
		]),
		'When on, readers can zoom in but cannot pan or zoom out beyond the map extent.'
	);

	const { row: layersRow, fieldColumn: layersField } = makeRow('Layers');
	layersField.appendChild(
		helpElement(
			`Each feature collection in the file is one layer. Choose which layers to show, and use the arrows to set the drawing order: the first layer is drawn on top. Hovering over a feature shows its properties.`
		)
	);
	const layerList = buildLayerList(collections);
	layerList.style.marginTop = '8px';
	layersField.appendChild(layerList);
	container.appendChild(layersRow);

	targetElement.appendChild(container);

	// Store the defaults right away, so a map can be previewed without changing anything.
	logFormFieldValues();
}
