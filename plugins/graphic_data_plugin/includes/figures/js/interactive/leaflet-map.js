/**
 * Leaflet map figures.
 *
 * A map figure is described by a small JSON "spec" that is saved in the
 * figure_interactive_args_rendered post meta field:
 *
 *   {
 *     type: 'leaflet-map',
 *     version: 1,
 *     figureId: 123,
 *     dataUrl: '/wp-content/data/figure_123/places.geojson',
 *     basemap: 'usgs-topo',
 *     map:    { height, legend, scrollZoom, extent, lockExtent },   // extent: { west, south, east, north } or null (fit to layers)
 *     layers: [ { index, name, geometry, style: {...}, hover: {...} } ]   // top layer first
 *   }
 *
 * The same three steps are used everywhere a map is shown:
 *
 *   buildLeafletMapSpec()   settings + feature collections -> spec  (pure, no DOM)
 *   mountLeafletMap()       spec + element                 -> map   (admin, frontend, standalone HTML)
 *   renderLeafletMapFigure() glue used by figure-render.js
 *
 * Features are not copied into the spec. They are read from the figure's
 * uploaded GeoJSON file each time the map is shown, so post meta stays small.
 *
 * Each feature collection in the GeoJSON file becomes one map layer. A file
 * can hold a single FeatureCollection, an array of them, an object whose
 * values are FeatureCollections, or a FeatureCollection whose features are
 * themselves FeatureCollections. findFeatureCollections() always visits them
 * in the same order, and layers refer to collections by that position.
 *
 * IMPORTANT: this module has no bare-specifier imports on purpose. The
 * standalone figure HTML files import it directly by URL, where no import
 * map is available.
 */

export const LEAFLET_MAP_GRAPH_TYPE = 'Leaflet map';
export const LEAFLET_MAP_SPEC_TYPE = 'leaflet-map';
export const LEAFLET_MAP_SPEC_VERSION = 1;

const LEAFLET_VERSION = '1.9.4';
const LEAFLET_CDN = `https://cdn.jsdelivr.net/npm/leaflet@${LEAFLET_VERSION}/dist`;
const LEAFLET_JS_URL = `${LEAFLET_CDN}/leaflet.js`;
const LEAFLET_CSS_URL = `${LEAFLET_CDN}/leaflet.css`;

/** Collections with more features than this are drawn on canvas instead of SVG. */
const CANVAS_FEATURE_THRESHOLD = 5000;
/** Most properties listed in one hover tooltip. */
const MAX_TOOLTIP_ROWS = 25;

/**
 * Base maps. Only the key is saved in the spec, so tile URLs cannot be
 * injected through figure settings.
 */
export const BASEMAPS = {
	'usgs-topo': {
		label: 'USGS National Map (topographic)',
		url: 'https://basemap.nationalmap.gov/arcgis/rest/services/USGSTopo/MapServer/tile/{z}/{y}/{x}',
		options: {
			maxNativeZoom: 16,
			maxZoom: 18,
			attribution:
				'Tiles courtesy of the <a href="https://www.usgs.gov/programs/national-geospatial-program/national-map">U.S. Geological Survey</a>',
		},
	},
	'esri-ocean': {
		label: 'Esri Ocean (bathymetry)',
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Ocean/World_Ocean_Base/MapServer/tile/{z}/{y}/{x}',
		options: {
			maxNativeZoom: 13,
			maxZoom: 16,
			attribution:
				'Tiles &copy; Esri &mdash; Sources: GEBCO, NOAA, CHS, OSU, UNH, CSUMB, National Geographic, DeLorme, NAVTEQ, and Esri',
		},
	},
	'esri-imagery': {
		label: 'Esri World Imagery (satellite)',
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
		options: {
			maxNativeZoom: 18,
			maxZoom: 19,
			attribution:
				'Tiles &copy; Esri &mdash; Source: Esri, Maxar, Earthstar Geographics, and the GIS User Community',
		},
	},
	'esri-light-gray': {
		label: 'Esri Light Gray Canvas (light gray)',
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
		options: {
			maxNativeZoom: 16,
			maxZoom: 18,
			attribution:
				'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community',
		},
	},
	'esri-dark-gray': {
		label: 'Esri Dark Gray Canvas (dark)',
		url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}',
		options: {
			maxNativeZoom: 16,
			maxZoom: 18,
			attribution:
				'Tiles &copy; Esri &mdash; Esri, HERE, Garmin, &copy; OpenStreetMap contributors, and the GIS user community',
		},
	},
	none: {
		label: 'None (plain background)',
		url: '',
		options: { maxZoom: 20, attribution: '' },
	},
};
export const DEFAULT_BASEMAP = 'usgs-topo';

/**
 * Retired base map keys and their replacements. CARTO's free tiles now
 * return an "API key required" image, so maps saved with them use the
 * matching Esri canvas instead.
 */
const BASEMAP_ALIASES = {
	'carto-light': 'esri-light-gray',
	'carto-dark': 'esri-dark-gray',
};

/**
 * The current key for a saved base map choice, or the default.
 *
 * @param {string} [key] Saved base map key, possibly a retired one.
 * @return {string} A key of BASEMAPS.
 */
export function resolveBasemapKey(key) {
	const current = BASEMAP_ALIASES[key] || key;
	return BASEMAPS[current] ? current : DEFAULT_BASEMAP;
}

/** Default layer colors (Tableau 10), assigned by collection position. */
export const LAYER_PALETTE = [
	'#1f77b4',
	'#ff7f0e',
	'#2ca02c',
	'#d62728',
	'#9467bd',
	'#8c564b',
	'#e377c2',
	'#7f7f7f',
	'#bcbd22',
	'#17becf',
];

export const LINE_STYLES = [
	['solid', 'Solid'],
	['dashed', 'Dashed'],
	['dotted', 'Dotted'],
];
const DASH_ARRAYS = { solid: null, dashed: '8 6', dotted: '2 6' };

/*
 * IDs of the admin settings fields. They are stored as [id, value] pairs in
 * figure_interactive_arguments, the same storage the other figures use.
 */
export const MAP_FIELD = {
	basemap: 'MapBasemap',
	height: 'MapHeight',
	legend: 'MapLegend',
	scrollZoom: 'MapScrollZoom',
	// Initial view: 'fit' (fit to the visible layers) or 'custom' (the extent below).
	extent: 'MapExtent',
	extentWest: 'MapExtentWest',
	extentSouth: 'MapExtentSouth',
	extentEast: 'MapExtentEast',
	extentNorth: 'MapExtentNorth',
	// 'Yes' keeps readers from panning or zooming out beyond the initial view.
	lockExtent: 'MapLockExtent',
	// Drawing order of the layers, top first: comma-separated collection positions, e.g. "2,0,1".
	layerOrder: 'MapLayerOrder',
};

/** Per-layer field IDs. `index` is the collection's position in the GeoJSON file. */
export const mapLayerField = {
	show: (index) => `MapLayer${index}Show`,
	name: (index) => `MapLayer${index}Name`,
	fillColor: (index) => `MapLayer${index}FillColor`,
	fillOpacity: (index) => `MapLayer${index}FillOpacity`,
	strokeColor: (index) => `MapLayer${index}StrokeColor`,
	strokeWidth: (index) => `MapLayer${index}StrokeWidth`,
	strokeOpacity: (index) => `MapLayer${index}StrokeOpacity`,
	lineStyle: (index) => `MapLayer${index}LineStyle`,
	pointRadius: (index) => `MapLayer${index}PointRadius`,
	hoverTitle: (index) => `MapLayer${index}HoverTitle`,
	hoverDetails: (index) => `MapLayer${index}HoverDetails`,
};

export const MAP_DEFAULTS = {
	[MAP_FIELD.basemap]: DEFAULT_BASEMAP,
	[MAP_FIELD.height]: '500',
	[MAP_FIELD.legend]: 'toggle',
	[MAP_FIELD.scrollZoom]: 'No',
	[MAP_FIELD.extent]: 'fit',
	[MAP_FIELD.lockExtent]: 'No',
	[MAP_FIELD.layerOrder]: '',
};

/** Latitude limit of the Web Mercator base maps. */
const MAX_LATITUDE = 85;

/**
 * Validates a custom extent.
 *
 * Longitudes may be given in either -180..180 or 0..360. When east is not
 * greater than west, the extent is taken to cross the antimeridian.
 *
 * @param {Object}        extent       Bounding box; values may be numbers or numeric strings.
 * @param {number|string} extent.west  West edge, longitude in degrees.
 * @param {number|string} extent.south South edge, latitude in degrees.
 * @param {number|string} extent.east  East edge, longitude in degrees.
 * @param {number|string} extent.north North edge, latitude in degrees.
 * @return {{west:number, south:number, east:number, north:number}} Normalized extent.
 * @throws {Error} When a value is missing or the box is empty.
 */
export function normalizeExtent({ west, south, east, north }) {
	const values = [west, south, east, north].map((value) =>
		value === '' || value === null || value === undefined
			? NaN
			: Number(value)
	);
	if (!values.every(Number.isFinite)) {
		throw new Error(
			'Enter a west, south, east and north value for the custom map extent.'
		);
	}
	let [w, s, e, n] = values;
	s = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, s));
	n = Math.max(-MAX_LATITUDE, Math.min(MAX_LATITUDE, n));
	if (s >= n) {
		throw new Error(
			'The south edge of the custom map extent must be less than the north edge.'
		);
	}
	// Bring west into -180..180, moving east by the same amount.
	const turns = Math.floor((w + 180) / 360);
	w -= turns * 360;
	e -= turns * 360;
	while (e <= w) {
		e += 360;
	}
	if (e - w > 360) {
		e = w + 360;
	}
	const round = (value) => Math.round(value * 1e5) / 1e5;
	return { west: round(w), south: round(s), east: round(e), north: round(n) };
}

/**
 * Default style values for the layer at a collection position.
 *
 * @param {number} index Collection position in the GeoJSON file.
 * @return {Object} Style values, with opacities in percent.
 */
export function defaultLayerStyle(index) {
	const color = LAYER_PALETTE[index % LAYER_PALETTE.length];
	return {
		fillColor: color,
		fillOpacity: 35,
		strokeColor: color,
		strokeWidth: 2,
		strokeOpacity: 100,
		lineStyle: 'solid',
		pointRadius: 6,
	};
}

/* ------------------------------------------------------------------------ */
/* Small helpers                                                             */
/* ------------------------------------------------------------------------ */

function isEditorScreen() {
	const href = window.location.href;
	return href.includes('post.php') || href.includes('post-new.php');
}

function escapeHtml(value) {
	return String(value ?? '')
		.replace(/&/g, '&amp;')
		.replace(/</g, '&lt;')
		.replace(/>/g, '&gt;')
		.replace(/"/g, '&quot;')
		.replace(/'/g, '&#39;');
}

/**
 * Turns "national_marine_sanctuaries" into "national marine sanctuaries".
 *
 * @param {*} name Collection or property name.
 * @return {string} The name with underscores replaced by spaces.
 */
export function defaultLayerTitle(name) {
	return String(name ?? '')
		.replace(/_/g, ' ')
		.trim();
}

function clampNumber(value, min, max, fallback) {
	const number = Number.parseFloat(value);
	if (!Number.isFinite(number)) {
		return fallback;
	}
	return Math.min(max, Math.max(min, number));
}

function validColor(value, fallback) {
	return /^#[0-9a-f]{6}$/i.test(String(value || ''))
		? String(value).toLowerCase()
		: fallback;
}

/**
 * Parses figure_interactive_arguments, a JSON array of [id, value] pairs,
 * into a plain object. Accepts an object as well.
 *
 * @param {string|Array|Object} interactiveArguments Saved settings.
 * @return {Object} Setting values keyed by field ID.
 */
export function parseInteractiveArguments(interactiveArguments) {
	if (!interactiveArguments) {
		return {};
	}
	if (Array.isArray(interactiveArguments)) {
		return Object.fromEntries(interactiveArguments);
	}
	if (typeof interactiveArguments === 'object') {
		return { ...interactiveArguments };
	}
	let text = String(interactiveArguments);
	// Older figures were saved with escaped quotes; see fillFormFieldValues().
	if (text.includes('\\')) {
		text = text.replace(/\\/g, '');
	}
	try {
		const parsed = JSON.parse(text);
		return Array.isArray(parsed)
			? Object.fromEntries(parsed)
			: parsed || {};
	} catch {
		return {};
	}
}

/**
 * True when a parsed figure_interactive_args_rendered value is a map spec.
 *
 * @param {*} spec Parsed figure_interactive_args_rendered.
 * @return {boolean} True for a map spec.
 */
export function isLeafletMapSpec(spec) {
	return Boolean(
		spec &&
		typeof spec === 'object' &&
		spec.type === LEAFLET_MAP_SPEC_TYPE &&
		Array.isArray(spec.layers)
	);
}

/**
 * Converts an uploaded file path (a server path or URL containing
 * "wp-content") into a site-relative URL.
 *
 * @param {string} uploadedPath Server path or URL of the uploaded file.
 * @return {string} Site-relative URL, e.g. "/wp-content/data/figure_1/a.geojson".
 */
export function uploadedPathToUrl(uploadedPath) {
	const path = String(uploadedPath || '');
	if (!path.includes('wp-content')) {
		return path;
	}
	return '/wp-content' + path.split('wp-content')[1];
}

/**
 * Resolves the saved layer order into a full list of collection positions.
 *
 * Positions that are invalid or repeated are ignored. Collections the saved
 * order does not mention, such as collections added by a new file, follow
 * in file order.
 *
 * @param {string} savedOrder Comma-separated positions, top layer first, e.g. "2,0,1".
 * @param {number} count      Number of collections in the file.
 * @return {number[]} Every position from 0 to count - 1, once each.
 */
export function resolveLayerOrder(savedOrder, count) {
	const order = [];
	String(savedOrder || '')
		.split(',')
		.map((part) => Number.parseInt(part, 10))
		.forEach((position) => {
			if (
				Number.isInteger(position) &&
				position >= 0 &&
				position < count &&
				!order.includes(position)
			) {
				order.push(position);
			}
		});
	for (let position = 0; position < count; position++) {
		if (!order.includes(position)) {
			order.push(position);
		}
	}
	return order;
}

/* ------------------------------------------------------------------------ */
/* GeoJSON: finding the feature collections                                  */
/* ------------------------------------------------------------------------ */

const GEOMETRY_TYPES = new Set([
	'Point',
	'MultiPoint',
	'LineString',
	'MultiLineString',
	'Polygon',
	'MultiPolygon',
	'GeometryCollection',
]);

const GEOMETRY_KIND = {
	Point: 'point',
	MultiPoint: 'point',
	LineString: 'line',
	MultiLineString: 'line',
	Polygon: 'polygon',
	MultiPolygon: 'polygon',
};

function addGeometryKinds(geometry, kinds) {
	if (!geometry) {
		return;
	}
	if (geometry.type === 'GeometryCollection') {
		(geometry.geometries || []).forEach((child) =>
			addGeometryKinds(child, kinds)
		);
		return;
	}
	if (GEOMETRY_KIND[geometry.type]) {
		kinds.add(GEOMETRY_KIND[geometry.type]);
	}
}

function isFeature(node) {
	return node?.type === 'Feature';
}

/**
 * Finds every feature collection in a parsed GeoJSON file.
 *
 * @param {*} geojson Parsed file contents.
 * @return {Array<{index:number, name:string, features:Object[], featureCount:number, geometryKinds:string[], properties:string[]}>}
 *   Collections in file order. `index` is the collection's position.
 */
export function findFeatureCollections(geojson) {
	const found = [];

	const add = (features, source, fallbackName) => {
		const kinds = new Set();
		const properties = [];
		const seen = new Set();
		features.forEach((feature, i) => {
			addGeometryKinds(feature.geometry, kinds);
			// Property names come from the first features; enough for settings menus.
			if (i < 500) {
				Object.keys(feature.properties || {}).forEach((key) => {
					if (!seen.has(key)) {
						seen.add(key);
						properties.push(key);
					}
				});
			}
		});
		const position = found.length;
		const name =
			source?.name ||
			source?.title ||
			source?.properties?.name ||
			source?.properties?.title ||
			fallbackName ||
			`Layer ${position + 1}`;
		found.push({
			index: position,
			name: String(name),
			features,
			featureCount: features.length,
			// Polygons first, then lines, then points: used for the legend swatch.
			geometryKinds: ['polygon', 'line', 'point'].filter((kind) =>
				kinds.has(kind)
			),
			properties,
		});
	};

	const visit = (node, fallbackName, depth) => {
		if (!node || typeof node !== 'object' || depth > 8) {
			return;
		}
		if (Array.isArray(node)) {
			node.forEach((item) => visit(item, '', depth + 1));
			return;
		}
		if (node.type === 'FeatureCollection' && Array.isArray(node.features)) {
			const plain = node.features.filter(isFeature);
			const nested = node.features.filter(
				(child) => child?.type === 'FeatureCollection'
			);
			if (plain.length || !nested.length) {
				add(plain, node, fallbackName);
			}
			nested.forEach((child) => visit(child, '', depth + 1));
			return;
		}
		if (isFeature(node)) {
			add([node], node, fallbackName);
			return;
		}
		if (GEOMETRY_TYPES.has(node.type)) {
			add(
				[{ type: 'Feature', properties: {}, geometry: node }],
				null,
				fallbackName
			);
			return;
		}
		// A plain wrapper object: each value may hold collections.
		Object.entries(node).forEach(([key, value]) => {
			if (value && typeof value === 'object') {
				visit(value, defaultLayerTitle(key), depth + 1);
			}
		});
	};

	visit(geojson, '', 0);
	return found;
}

/**
 * Picks the longitude convention that keeps the data together.
 *
 * Data that crosses the antimeridian (for example Pacific islands stored at
 * both -179 and 179 degrees) spans the whole world in the usual -180..180
 * range. In that case longitudes are shifted into 0..360, which Leaflet can
 * draw directly over the wrapped base map.
 *
 * @param {Object[][]} featureLists Features of the layers being drawn.
 * @return {boolean} True when negative longitudes should have 360 added.
 */
export function shouldShiftLongitudes(featureLists) {
	let min = Infinity;
	let max = -Infinity;
	let minShifted = Infinity;
	let maxShifted = -Infinity;

	const visitCoordinates = (coordinates) => {
		if (!Array.isArray(coordinates)) {
			return;
		}
		if (typeof coordinates[0] === 'number') {
			const lon = coordinates[0];
			if (!Number.isFinite(lon)) {
				return;
			}
			const shifted = lon < 0 ? lon + 360 : lon;
			if (lon < min) {
				min = lon;
			}
			if (lon > max) {
				max = lon;
			}
			if (shifted < minShifted) {
				minShifted = shifted;
			}
			if (shifted > maxShifted) {
				maxShifted = shifted;
			}
			return;
		}
		coordinates.forEach(visitCoordinates);
	};
	const visitGeometry = (geometry) => {
		if (!geometry) {
			return;
		}
		if (geometry.type === 'GeometryCollection') {
			(geometry.geometries || []).forEach(visitGeometry);
		} else {
			visitCoordinates(geometry.coordinates);
		}
	};

	featureLists.forEach((features) =>
		features.forEach((feature) => visitGeometry(feature.geometry))
	);

	if (!Number.isFinite(min)) {
		return false;
	}
	return maxShifted - minShifted < max - min;
}

/* ------------------------------------------------------------------------ */
/* Library loading                                                           */
/* ------------------------------------------------------------------------ */

let leafletPromise = null;
const stylePromises = new WeakMap();

const MAP_CSS = `
.graphic-data-leaflet-map{position:relative;width:100%}
.graphic-data-leaflet-map .gd-map-canvas{width:100%;height:100%;border-radius:4px;font:inherit}
.graphic-data-leaflet-map .gd-map-canvas.gd-map-plain{background:#e9eef2}
/*
 * Page styles such as "svg{max-width:100%;height:auto}" (used by the admin
 * preview and some themes) collapse Leaflet's vector layers. Leaflet only
 * guards its default overlay pane, and every layer here has its own pane.
 * Width and height are also pinned inline; see pinRendererSize().
 */
.graphic-data-leaflet-map .leaflet-pane > svg,.graphic-data-leaflet-map .leaflet-pane > canvas{max-width:none!important;max-height:none!important}
/* Every layer has its own pane; let pointer events reach layers below a pane's empty areas. */
.graphic-data-leaflet-map .leaflet-pane > svg{pointer-events:none}
.graphic-data-leaflet-map .leaflet-pane > svg path.leaflet-interactive{pointer-events:visiblePainted;pointer-events:auto}
/*
 * Tooltips sit in a zero-width pane, so a shrink-to-fit width collapses to the
 * narrowest content. Size them to their content instead, up to the cap.
 */
.graphic-data-leaflet-map .gd-map-tooltip{box-sizing:border-box;width:max-content;max-width:min(320px,80vw);white-space:normal;font-size:13px;line-height:1.35;padding:6px 8px}
.graphic-data-leaflet-map .gd-map-tooltip strong{display:block;font-size:14px;margin-bottom:2px}
.graphic-data-leaflet-map .gd-map-tooltip table{border-collapse:collapse;margin:0}
.graphic-data-leaflet-map .gd-map-tooltip th,.graphic-data-leaflet-map .gd-map-tooltip td{padding:1px 0;vertical-align:top;text-align:left;border:0;background:none;font-size:12px}
.graphic-data-leaflet-map .gd-map-tooltip th{font-weight:600;padding-right:8px;color:#444;white-space:nowrap}
/* Wrap values between words; break inside a word only when it cannot fit at all. */
.graphic-data-leaflet-map .gd-map-tooltip td{overflow-wrap:break-word;word-break:normal}
.graphic-data-leaflet-map .gd-map-legend{background:rgba(255,255,255,.94);color:#1d2327;padding:6px 10px;border-radius:4px;box-shadow:0 1px 4px rgba(0,0,0,.3);font-size:13px;line-height:1.3;max-height:45%;max-width:min(280px,70vw);overflow:auto}
.graphic-data-leaflet-map .gd-map-legend ul{list-style:none;margin:0;padding:0}
.graphic-data-leaflet-map .gd-map-legend li{display:flex;align-items:center;gap:6px;margin:3px 0}
.graphic-data-leaflet-map .gd-map-legend label{display:flex;align-items:center;gap:6px;cursor:pointer;margin:0}
.graphic-data-leaflet-map .gd-map-legend input{margin:0}
.graphic-data-leaflet-map .gd-map-swatch{flex:0 0 auto;width:16px;height:16px;display:inline-block;box-sizing:border-box}
.graphic-data-leaflet-map .gd-map-error{color:#b32d2e;margin:8px 0}
`;

/**
 * Adds the Leaflet stylesheet and the map figure styles to a document once.
 *
 * Call this for any document a map is moved into, for example the block
 * editor's canvas iframe. Maps are drawn in one document and can be moved
 * into another, and the stylesheet does not travel with them.
 *
 * @param {Document} [targetDocument] Document that will display maps.
 * @return {Promise<void>} Resolves when the stylesheet has loaded (or failed).
 */
export function ensureLeafletStyles(targetDocument = document) {
	if (!targetDocument?.head) {
		return Promise.resolve();
	}
	if (stylePromises.has(targetDocument)) {
		return stylePromises.get(targetDocument);
	}

	if (!targetDocument.querySelector('style[data-graphic-data-leaflet-map]')) {
		const style = targetDocument.createElement('style');
		style.dataset.graphicDataLeafletMap = 'true';
		style.textContent = MAP_CSS;
		targetDocument.head.appendChild(style);
	}

	let link = targetDocument.querySelector('link[data-graphic-data-leaflet]');
	let promise;
	if (link) {
		promise = Promise.resolve();
	} else {
		link = targetDocument.createElement('link');
		link.rel = 'stylesheet';
		link.href = LEAFLET_CSS_URL;
		link.dataset.graphicDataLeaflet = 'true';
		promise = new Promise((resolve) => {
			link.addEventListener('load', () => resolve(), { once: true });
			link.addEventListener('error', () => resolve(), { once: true });
		});
		// Before other styles, so theme rules can still override Leaflet's.
		targetDocument.head.prepend(link);
	}

	stylePromises.set(targetDocument, promise);
	return promise;
}

/**
 * Loads the Leaflet script and stylesheet once per page.
 *
 * @return {Promise<Object>} The Leaflet namespace (window.L).
 */
export function loadLeaflet() {
	ensureLeafletStyles(document);

	if (window.L?.map && window.L?.geoJSON) {
		return Promise.resolve(window.L);
	}
	if (leafletPromise) {
		return leafletPromise;
	}

	leafletPromise = new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = LEAFLET_JS_URL;
		script.async = true;
		script.dataset.graphicDataLeaflet = 'true';
		script.addEventListener('load', () => {
			if (window.L?.map) {
				resolve(window.L);
			} else {
				reject(new Error('Leaflet failed to initialize.'));
			}
		});
		script.addEventListener('error', () => {
			leafletPromise = null;
			reject(new Error('The Leaflet library could not be loaded.'));
		});
		document.head.appendChild(script);
	});

	return leafletPromise;
}

/* ------------------------------------------------------------------------ */
/* Build: settings -> spec                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Property used as the tooltip title when none has been chosen.
 *
 * @param {string[]} properties Property names of a collection.
 * @return {string} A name/title/label property if present, else the first property, else ''.
 */
export function defaultHoverTitle(properties) {
	const preferred = properties.find((key) =>
		/^(name|title|label)$/i.test(key)
	);
	return preferred || properties[0] || '';
}

/**
 * Builds a map spec from the admin settings.
 *
 * @param {Object|string|Array} settings         Parsed or raw figure_interactive_arguments.
 * @param {Object[]}            collections      Result of findFeatureCollections().
 * @param {Object}              context
 * @param {string}              context.dataUrl  Site-relative URL of the GeoJSON file.
 * @param {number|string}       context.figureId Figure post ID.
 * @return {Object} Map spec.
 */
export function buildLeafletMapSpec(
	settings,
	collections,
	{ dataUrl, figureId } = {}
) {
	const values = { ...MAP_DEFAULTS, ...parseInteractiveArguments(settings) };
	const valueOf = (id, fallback = '') => {
		const value = values[id];
		return value === undefined || value === null || value === ''
			? fallback
			: String(value);
	};

	const layers = [];
	resolveLayerOrder(
		valueOf(MAP_FIELD.layerOrder),
		collections.length
	).forEach((index) => {
		const collection = collections[index];
		if (valueOf(mapLayerField.show(index), 'Show') === 'Hide') {
			return;
		}
		const defaults = defaultLayerStyle(index);
		const hoverTitle = valueOf(
			mapLayerField.hoverTitle(index),
			defaultHoverTitle(collection.properties)
		);

		layers.push({
			index,
			name: valueOf(
				mapLayerField.name(index),
				defaultLayerTitle(collection.name)
			),
			geometry: collection.geometryKinds[0] || 'polygon',
			style: {
				fillColor: validColor(
					valueOf(mapLayerField.fillColor(index)),
					defaults.fillColor
				),
				fillOpacity:
					clampNumber(
						valueOf(mapLayerField.fillOpacity(index)),
						0,
						100,
						defaults.fillOpacity
					) / 100,
				strokeColor: validColor(
					valueOf(mapLayerField.strokeColor(index)),
					defaults.strokeColor
				),
				strokeWidth: clampNumber(
					valueOf(mapLayerField.strokeWidth(index)),
					0,
					20,
					defaults.strokeWidth
				),
				strokeOpacity:
					clampNumber(
						valueOf(mapLayerField.strokeOpacity(index)),
						0,
						100,
						defaults.strokeOpacity
					) / 100,
				lineStyle:
					DASH_ARRAYS[valueOf(mapLayerField.lineStyle(index))] !==
					undefined
						? valueOf(mapLayerField.lineStyle(index))
						: defaults.lineStyle,
				pointRadius: clampNumber(
					valueOf(mapLayerField.pointRadius(index)),
					1,
					40,
					defaults.pointRadius
				),
			},
			hover: {
				// '(none)' means no title line.
				title: hoverTitle === '(none)' ? '' : hoverTitle,
				details:
					valueOf(mapLayerField.hoverDetails(index), 'all') ===
					'title'
						? 'title'
						: 'all',
			},
		});
	});

	const basemap = valueOf(MAP_FIELD.basemap, DEFAULT_BASEMAP);
	const legend = valueOf(MAP_FIELD.legend, 'toggle');
	const extent =
		valueOf(MAP_FIELD.extent, 'fit') === 'custom'
			? normalizeExtent({
					west: valueOf(MAP_FIELD.extentWest),
					south: valueOf(MAP_FIELD.extentSouth),
					east: valueOf(MAP_FIELD.extentEast),
					north: valueOf(MAP_FIELD.extentNorth),
				})
			: null;

	return {
		type: LEAFLET_MAP_SPEC_TYPE,
		version: LEAFLET_MAP_SPEC_VERSION,
		figureId: Number(figureId) || 0,
		dataUrl: String(dataUrl || ''),
		basemap: resolveBasemapKey(basemap),
		map: {
			height: Math.round(
				clampNumber(valueOf(MAP_FIELD.height), 200, 1200, 500)
			),
			legend: ['toggle', 'static', 'none'].includes(legend)
				? legend
				: 'toggle',
			scrollZoom: valueOf(MAP_FIELD.scrollZoom) === 'Yes',
			// null: fit the view to the visible layers.
			extent,
			lockExtent: valueOf(MAP_FIELD.lockExtent) === 'Yes',
		},
		layers,
	};
}

/* ------------------------------------------------------------------------ */
/* Mount: spec -> Leaflet                                                    */
/* ------------------------------------------------------------------------ */

const numberFormat = new Intl.NumberFormat(undefined, {
	maximumFractionDigits: 4,
	// No thousands separators, so values such as years display as stored.
	useGrouping: false,
});

function formatPropertyValue(value) {
	if (value === null || value === undefined || value === '') {
		return '';
	}
	if (typeof value === 'number') {
		return Number.isFinite(value)
			? numberFormat.format(value)
			: String(value);
	}
	if (typeof value === 'object') {
		try {
			return JSON.stringify(value);
		} catch {
			return String(value);
		}
	}
	return String(value);
}

/**
 * HTML for a feature's hover tooltip. All values are escaped.
 *
 * @param {Object} properties Feature properties.
 * @param {Object} hover      Layer hover settings: { title, details }.
 * @return {string} Tooltip HTML, or '' when there is nothing to show.
 */
function tooltipHtml(properties, hover) {
	const props = properties || {};
	const parts = [];
	const title = hover.title ? formatPropertyValue(props[hover.title]) : '';
	if (title) {
		parts.push(`<strong>${escapeHtml(title)}</strong>`);
	}
	if (hover.details === 'all') {
		const rows = Object.entries(props)
			.filter(
				([key, value]) =>
					key !== hover.title && formatPropertyValue(value) !== ''
			)
			.slice(0, MAX_TOOLTIP_ROWS)
			.map(
				([key, value]) =>
					`<tr><th scope="row">${escapeHtml(defaultLayerTitle(key))}</th><td>${escapeHtml(formatPropertyValue(value))}</td></tr>`
			);
		if (rows.length) {
			parts.push(`<table>${rows.join('')}</table>`);
		}
	}
	return parts.join('');
}

function pathStyle(layerSpec, kind) {
	const style = layerSpec.style;
	return {
		color: style.strokeColor,
		weight: style.strokeWidth,
		opacity: style.strokeWidth > 0 ? style.strokeOpacity : 0,
		dashArray: DASH_ARRAYS[style.lineStyle] || null,
		fillColor: style.fillColor,
		fillOpacity: style.fillOpacity,
		fill: kind !== 'line',
	};
}

function swatchElement(doc, layerSpec) {
	const swatch = doc.createElement('span');
	swatch.className = 'gd-map-swatch';
	swatch.setAttribute('aria-hidden', 'true');
	const { style, geometry } = layerSpec;
	const stroke = `${Math.max(1, Math.min(4, style.strokeWidth))}px ${style.lineStyle === 'solid' ? 'solid' : style.lineStyle} ${style.strokeColor}`;
	if (geometry === 'line') {
		swatch.style.height = '0';
		swatch.style.borderTop = stroke;
		swatch.style.width = '18px';
	} else {
		swatch.style.background = hexToRgba(style.fillColor, style.fillOpacity);
		swatch.style.border = style.strokeWidth > 0 ? stroke : 'none';
		if (geometry === 'point') {
			swatch.style.borderRadius = '50%';
			swatch.style.width = swatch.style.height = '14px';
		}
	}
	return swatch;
}

function hexToRgba(hex, alpha) {
	const channel = (start) =>
		Number.parseInt(String(hex).slice(start, start + 2), 16);
	return `rgba(${channel(1)}, ${channel(3)}, ${channel(5)}, ${alpha})`;
}

/**
 * Keeps a vector renderer's element at the size Leaflet gives it.
 *
 * Leaflet sizes its SVG with width/height attributes, which any stylesheet
 * rule such as "svg{height:auto}" overrides, collapsing every shape in the
 * layer to nothing. Inline styles take precedence over those rules.
 *
 * @param {Object}      renderer Leaflet SVG or canvas renderer.
 * @param {HTMLElement} pane     Pane the renderer draws into.
 */
function pinRendererSize(renderer, pane) {
	renderer.on('update', () => {
		const element = pane.querySelector(':scope > svg, :scope > canvas');
		if (element?.tagName.toLowerCase() !== 'svg') {
			// Canvas renderers already set an inline size.
			return;
		}
		const width = element.getAttribute('width');
		const height = element.getAttribute('height');
		if (width && height) {
			element.style.width = `${width}px`;
			element.style.height = `${height}px`;
		}
	});
}

function resolveDataUrl(spec, figureId) {
	let dataUrl = spec.dataUrl || '';
	// A duplicated figure keeps the original spec until it is saved again,
	// but its data file has been copied into its own folder.
	const currentId = Number(figureId) || 0;
	if (currentId && spec.figureId && currentId !== spec.figureId) {
		dataUrl = dataUrl.replace(
			`/figure_${spec.figureId}/`,
			`/figure_${currentId}/`
		);
	}
	return dataUrl;
}

async function fetchGeoJson(dataUrl) {
	const url = new URL(dataUrl, window.location.origin);
	// A replaced file keeps its URL when the new file has the same name, and many
	// servers send no caching headers for .geojson. Always check with the server;
	// an unchanged file costs only a "not modified" reply.
	const response = await fetch(url.toString(), { cache: 'no-cache' });
	if (!response.ok) {
		throw new Error(`Unable to load map data (${response.status}): ${url}`);
	}
	return response.json();
}

/**
 * Renders a map spec into an element.
 *
 * @param {HTMLElement|string} target             Element, or the ID of the element, to render into.
 * @param {Object}             spec               Map spec from buildLeafletMapSpec().
 * @param {Object}             [options]
 * @param {*}                  [options.geojson]  Parsed GeoJSON, if already loaded.
 * @param {string}             [options.dataUrl]  Overrides spec.dataUrl.
 * @param {number|string}      [options.figureId] Current figure ID, used for duplicated figures.
 * @param {string}             [options.label]    Accessible name for the map.
 * @return {Promise<Object>} Handle with map, resize(), setHeight() and destroy().
 */
export async function mountLeafletMap(target, spec, options = {}) {
	const host =
		typeof target === 'string' ? document.getElementById(target) : target;
	if (!host) {
		throw new Error('Map target element was not found.');
	}
	if (!isLeafletMapSpec(spec)) {
		throw new Error('The saved map settings are missing or invalid.');
	}

	const [L, geojson] = await Promise.all([
		loadLeaflet(),
		options.geojson !== undefined
			? Promise.resolve(options.geojson)
			: fetchGeoJson(
					options.dataUrl || resolveDataUrl(spec, options.figureId)
				),
	]);

	// The host may live in another document, such as an iframe.
	const doc = host.ownerDocument;
	await ensureLeafletStyles(doc);

	const collections = findFeatureCollections(geojson);
	const drawn = spec.layers.filter(
		(layerSpec) => collections[layerSpec.index]
	);
	const shiftLongitudes = shouldShiftLongitudes(
		drawn.map((layerSpec) => collections[layerSpec.index].features)
	);
	const coordsToLatLng = (coords) =>
		L.latLng(
			coords[1],
			shiftLongitudes && coords[0] < 0 ? coords[0] + 360 : coords[0],
			coords[2]
		);

	const wrapper = doc.createElement('div');
	wrapper.className = 'graphic-data-leaflet-map';
	wrapper.style.height = `${Number(spec.map?.height) || 500}px`;

	const canvas = doc.createElement('div');
	canvas.className = 'gd-map-canvas';
	canvas.setAttribute('role', 'region');
	canvas.setAttribute(
		'aria-label',
		options.label ? `Map: ${options.label}` : 'Map'
	);
	wrapper.appendChild(canvas);
	host.appendChild(wrapper);

	const basemap = BASEMAPS[resolveBasemapKey(spec.basemap)];
	const map = L.map(canvas, {
		scrollWheelZoom: Boolean(spec.map?.scrollZoom),
		maxZoom: basemap.options.maxZoom || 19,
		// Whole zoom levels: scaled tiles at fractional zooms show hairline seams.
		zoomSnap: 1,
		worldCopyJump: false,
		// Added below, only when there is a base map to credit.
		attributionControl: false,
	});

	if (basemap.url) {
		// The attribution row credits the base map only, without Leaflet's own prefix.
		L.control.attribution({ prefix: false }).addTo(map);
		L.tileLayer(basemap.url, basemap.options).addTo(map);
	} else {
		canvas.classList.add('gd-map-plain');
	}

	// One pane per layer, so the drawing order holds when layers are toggled.
	const leafletLayers = [];
	drawn.forEach((layerSpec, position) => {
		const collection = collections[layerSpec.index];
		const paneName = `gd-map-layer-${position}`;
		const pane = map.createPane(paneName);
		pane.style.zIndex = String(450 + drawn.length - position);

		const renderer =
			collection.featureCount > CANVAS_FEATURE_THRESHOLD
				? L.canvas({ pane: paneName })
				: L.svg({ pane: paneName });
		pinRendererSize(renderer, pane);

		const layer = L.geoJSON(
			{ type: 'FeatureCollection', features: collection.features },
			{
				pane: paneName,
				renderer,
				coordsToLatLng,
				style: (feature) =>
					pathStyle(
						layerSpec,
						GEOMETRY_KIND[feature?.geometry?.type] ||
							layerSpec.geometry
					),
				pointToLayer: (feature, latlng) =>
					L.circleMarker(latlng, {
						...pathStyle(layerSpec, 'point'),
						radius: layerSpec.style.pointRadius,
						pane: paneName,
						renderer,
					}),
				onEachFeature: (feature, featureLayer) => {
					const html = tooltipHtml(
						feature.properties,
						layerSpec.hover
					);
					if (html) {
						featureLayer.bindTooltip(html, {
							sticky: true,
							direction: 'top',
							offset: [0, -8],
							className: 'gd-map-tooltip',
						});
						// Touch screens have no hover; open the tooltip on tap instead.
						featureLayer.on('click', (event) =>
							featureLayer.openTooltip(event.latlng)
						);
					}
					featureLayer.on('mouseover', () => {
						if (featureLayer.setStyle) {
							featureLayer.setStyle({
								weight: layerSpec.style.strokeWidth + 2,
							});
						}
					});
					featureLayer.on('mouseout', () => {
						if (featureLayer.setStyle) {
							featureLayer.setStyle({
								weight: layerSpec.style.strokeWidth,
							});
						}
					});
				},
			}
		).addTo(map);

		leafletLayers.push({ spec: layerSpec, layer });
	});

	// Legend, optionally with show/hide checkboxes.
	const legendMode = spec.map?.legend || 'toggle';
	if (legendMode !== 'none' && leafletLayers.length) {
		const legend = L.control({ position: 'topright' });
		legend.onAdd = () => {
			const box = doc.createElement('div');
			box.className = 'gd-map-legend leaflet-control';
			const list = doc.createElement('ul');
			leafletLayers.forEach(({ spec: layerSpec, layer }) => {
				const item = doc.createElement('li');
				const name = doc.createElement('span');
				name.textContent = layerSpec.name;
				if (legendMode === 'toggle') {
					const label = doc.createElement('label');
					const checkbox = doc.createElement('input');
					checkbox.type = 'checkbox';
					checkbox.checked = true;
					checkbox.addEventListener('change', () => {
						if (checkbox.checked) {
							map.addLayer(layer);
						} else {
							map.removeLayer(layer);
						}
					});
					label.append(checkbox, swatchElement(doc, layerSpec), name);
					item.appendChild(label);
				} else {
					item.append(swatchElement(doc, layerSpec), name);
				}
				list.appendChild(item);
			});
			box.appendChild(list);
			L.DomEvent.disableClickPropagation(box);
			L.DomEvent.disableScrollPropagation(box);
			return box;
		};
		legend.addTo(map);
	}

	// Fit the view to the data until the reader moves the map.
	let readerMovedMap = false;
	['mousedown', 'touchstart', 'wheel', 'keydown'].forEach((type) =>
		canvas.addEventListener(
			type,
			() => {
				readerMovedMap = true;
			},
			{ passive: true }
		)
	);

	// The initial view: the custom extent, or the extent of the visible layers.
	let initialBounds = null;
	let padding = [0, 0];
	if (spec.map?.extent) {
		let { west, south, east, north } = spec.map.extent;
		// Match the data's longitude convention (see shouldShiftLongitudes()).
		if (shiftLongitudes && west < 0) {
			west += 360;
			east += 360;
		}
		initialBounds = L.latLngBounds([south, west], [north, east]);
	} else {
		const bounds = L.latLngBounds([]);
		leafletLayers.forEach(({ layer }) => {
			const layerBounds = layer.getBounds?.();
			if (layerBounds?.isValid()) {
				bounds.extend(layerBounds);
			}
		});
		if (bounds.isValid()) {
			initialBounds = bounds;
			padding = [16, 16];
		}
	}

	const lockExtent = Boolean(spec.map?.lockExtent && initialBounds);
	if (lockExtent) {
		// Allow a little slack so features on the edge are not cut off.
		map.setMaxBounds(initialBounds.pad(0.05));
		map.options.maxBoundsViscosity = 1;
	}

	const fitInitialView = () => {
		if (!initialBounds) {
			map.setView([39, -98], 4, { animate: false });
			return;
		}
		if (lockExtent && canvas.clientWidth) {
			// Readers cannot zoom out past the whole extent.
			map.setMinZoom(0);
			map.setMinZoom(
				map.getBoundsZoom(initialBounds, false, L.point(padding))
			);
		}
		map.fitBounds(initialBounds, { padding, animate: false });
	};
	fitInitialView();

	// Maps built inside a hidden tab have no size. Recalculate whenever the
	// available size changes, which also covers a tab becoming visible.
	let resizeObserver = null;
	const resize = () => {
		map.invalidateSize({ animate: false });
		if (!readerMovedMap) {
			fitInitialView();
		} else if (lockExtent) {
			// Keep the zoom-out limit right for the new size.
			map.setMinZoom(0);
			map.setMinZoom(
				map.getBoundsZoom(initialBounds, false, L.point(padding))
			);
		}
	};
	if (typeof ResizeObserver !== 'undefined') {
		let previous = `${wrapper.clientWidth}x${wrapper.clientHeight}`;
		let frame = 0;
		resizeObserver = new ResizeObserver(() => {
			const size = `${wrapper.clientWidth}x${wrapper.clientHeight}`;
			if (!wrapper.clientWidth || size === previous) {
				return;
			}
			previous = size;
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(resize);
		});
		resizeObserver.observe(wrapper);
	}

	const handle = {
		map,
		element: wrapper,
		resize,
		/**
		 * The area currently shown, as a normalized { west, south, east, north }.
		 * Used by the admin settings to capture the preview's view as the extent.
		 */
		getExtent: () => {
			const bounds = map.getBounds();
			return normalizeExtent({
				west: bounds.getWest(),
				south: bounds.getSouth(),
				east: bounds.getEast(),
				north: bounds.getNorth(),
			});
		},
		setHeight: (height) => {
			const value = Number(height);
			if (value > 0) {
				wrapper.style.height = `${value}px`;
				resize();
			}
		},
		destroy: () => {
			resizeObserver?.disconnect();
			map.remove();
			wrapper.remove();
		},
	};
	wrapper.graphicDataMap = handle;
	return handle;
}

/* ------------------------------------------------------------------------ */
/* Glue for figure-render.js                                                 */
/* ------------------------------------------------------------------------ */

async function waitForElement(id, doc, timeout = 15000, interval = 100) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const element = doc?.getElementById(id) || document.getElementById(id);
		if (element) {
			return element;
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
	throw new Error(`Element with id ${id} not found after ${timeout}ms`);
}

function writeRenderedField(value) {
	const field = document.getElementsByName(
		'figure_interactive_args_rendered'
	)[0];
	if (field) {
		field.value = value;
	}
}

/** REST nonce for editor screens, when one is available. */
function getRestNonce() {
	try {
		const moduleData = JSON.parse(
			document.getElementById(
				'wp-script-module-data-@graphic-data/file-upload'
			)?.textContent ?? '{}'
		);
		if (moduleData.nonce) {
			return moduleData.nonce;
		}
	} catch {}
	return window.wpApiSettings?.nonce || '';
}

/**
 * Looks up the uploaded GeoJSON file for a figure.
 *
 * @param {number|string} figureId
 * @return {Promise<string>} Site-relative URL of the data file.
 */
export async function fetchFigureGeoJsonUrl(figureId) {
	const nonce = getRestNonce();
	const response = await fetch(
		`${window.location.origin}/wp-json/wp/v2/figure/${figureId}?_fields=uploaded_path_json`,
		{ headers: nonce ? { 'X-WP-Nonce': nonce } : {} }
	);
	const body = await response.json();
	if (!response.ok) {
		throw new Error(
			body?.message ||
				`Unable to load figure ${figureId} (${response.status}).`
		);
	}
	if (
		typeof body.uploaded_path_json !== 'string' ||
		body.uploaded_path_json.trim() === ''
	) {
		throw new Error(`Figure ${figureId} has no uploaded GeoJSON file.`);
	}
	if (!/\.geojson$/i.test(body.uploaded_path_json.trim())) {
		throw new Error('Map figures need a GeoJSON (.geojson) file.');
	}
	return uploadedPathToUrl(body.uploaded_path_json);
}

/**
 * Builds a map spec from saved settings by loading the figure's GeoJSON file.
 *
 * @param {number|string} figureId             Figure post ID.
 * @param {string|Object} interactiveArguments Saved settings.
 * @return {Promise<{spec: Object, geojson: *}>} The spec and the parsed file.
 */
export async function buildLeafletMapSpecForFigure(
	figureId,
	interactiveArguments
) {
	const dataUrl = await fetchFigureGeoJsonUrl(figureId);
	const geojson = await fetchGeoJson(dataUrl);
	const collections = findFeatureCollections(geojson);
	if (!collections.length) {
		throw new Error('The GeoJSON file does not contain any features.');
	}
	const spec = buildLeafletMapSpec(interactiveArguments, collections, {
		dataUrl,
		figureId,
	});
	if (!spec.layers.length) {
		throw new Error('Choose at least one layer to show on the map.');
	}
	return { spec, geojson };
}

/**
 * Renders a map figure if the figure is a map. Called by
 * render_interactive_plots() before any Plotly handling.
 *
 * - On editor screens, when the settings choose a map, the spec is rebuilt
 *   from the current settings and written to figure_interactive_args_rendered.
 * - Everywhere else, a saved map spec is rendered as is.
 *
 * @param {Object}      args
 * @param {string}      args.targetId             ID of the element to render into.
 * @param {number}      args.postID               Figure post ID.
 * @param {string}      args.interactiveArguments figure_interactive_arguments.
 * @param {Object|null} args.savedSpec            Parsed figure_interactive_args_rendered.
 * @param {string}      [args.label]              Accessible name for the map.
 * @param {Document}    [args.targetDocument]     Document that holds the target element.
 * @return {Promise<boolean>} True when the figure is a map and was handled.
 */
export async function renderLeafletMapFigure({
	targetId,
	postID,
	interactiveArguments,
	savedSpec,
	label,
	targetDocument,
}) {
	const settings = parseInteractiveArguments(interactiveArguments);
	const editor =
		isEditorScreen() &&
		Boolean(document.getElementsByName('figure_interactive_arguments')[0]);
	const rebuildFromSettings =
		editor && settings.graphType === LEAFLET_MAP_GRAPH_TYPE;

	if (!rebuildFromSettings && !(!editor && isLeafletMapSpec(savedSpec))) {
		return false;
	}

	let target = null;
	try {
		target = await waitForElement(targetId, targetDocument);

		let spec = savedSpec;
		let geojson;
		if (rebuildFromSettings) {
			({ spec, geojson } = await buildLeafletMapSpecForFigure(
				postID,
				settings
			));
			writeRenderedField(JSON.stringify(spec, null, 2));
		}

		await mountLeafletMap(target, spec, {
			geojson,
			figureId: postID,
			label,
		});
	} catch (error) {
		console.error('Map figure error:', error);
		if (rebuildFromSettings) {
			// Never leave a stale spec (or an older Plotly figure) behind for the save step.
			writeRenderedField('');
		}
		if (target) {
			const message = target.ownerDocument.createElement('p');
			message.className = 'figure-error gd-map-error';
			message.textContent = rebuildFromSettings
				? `The map could not be loaded: ${error.message}`
				: 'The map could not be loaded.';
			target.appendChild(message);
		}
	}

	return true;
}
