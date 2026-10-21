/**
 * Tabulator table figures.
 *
 * A table figure is described by a small JSON "spec" that is saved in the
 * figure_interactive_args_rendered post meta field:
 *
 *   {
 *     type: 'tabulator',
 *     version: 1,
 *     figureId: 123,
 *     dataUrl: '/wp-content/data/figure_123/data.json',
 *     columns: [ { field, title, format, decimals, headerFilter, frozen } ],
 *     table:   { pageSize, layout, narrow, download }
 *   }
 *
 * The same three steps are used everywhere a table is shown:
 *
 *   buildTabulatorSpec()  settings + column names  -> spec   (pure, no DOM)
 *   mountTabulatorTable() spec + element           -> table  (admin, frontend, standalone HTML)
 *   renderTabulatorFigure() glue used by figure-render.js
 *
 * Rows are not copied into the spec. They are read from the figure's uploaded
 * data file each time the table is shown, so post meta stays small.
 *
 * IMPORTANT: this module has no bare-specifier imports on purpose. The
 * standalone figure HTML files import it directly by URL, where no import
 * map is available.
 */

export const TABULATOR_GRAPH_TYPE = 'Tabulator table';
export const TABULATOR_SPEC_TYPE = 'tabulator';
export const TABULATOR_SPEC_VERSION = 1;

/** Site-relative URL of this module, used by the standalone HTML files. */
export const TABULATOR_MODULE_URL = (() => {
	try {
		const url = new URL(import.meta.url);
		return url.pathname + url.search;
	} catch {
		return import.meta.url;
	}
})();

const TABULATOR_VERSION = '6.6.1';
const TABULATOR_CDN = `https://cdn.jsdelivr.net/npm/tabulator-tables@${TABULATOR_VERSION}/dist`;
const TABULATOR_JS_URL = `${TABULATOR_CDN}/js/tabulator.min.js`;
const TABULATOR_CSS_URL = `${TABULATOR_CDN}/css/tabulator_simple.min.css`;

/** Tables with at most this many rows render every row, so screen readers can reach them. */
const BASIC_RENDER_ROW_LIMIT = 1000;

/*
 * IDs of the admin settings fields. They are stored as [id, value] pairs in
 * figure_interactive_arguments, the same storage the Plotly figures use.
 */
export const TABLE_FIELD = {
	pageSize: 'TablePageSize',
	layout: 'TableLayout',
	narrow: 'TableNarrowScreens',
	// Display order of the data columns: comma-separated positions in the data file, e.g. "2,0,1".
	columnOrder: 'TableColumnOrder',
	headerFilters: 'TableHeaderFilters',
	freezeFirst: 'TableFreezeFirstColumn',
	download: 'TableDownload',
};

/** Per-column field IDs. `index` is the column's position in the data file. */
export const tableColumnField = {
	show: (index) => `TableCol${index}Show`,
	title: (index) => `TableCol${index}Title`,
	format: (index) => `TableCol${index}Format`,
	decimals: (index) => `TableCol${index}Decimals`,
};

export const TABLE_DEFAULTS = {
	[TABLE_FIELD.pageSize]: 'All',
	[TABLE_FIELD.layout]: 'fitDataStretch',
	[TABLE_FIELD.narrow]: 'scroll',
	[TABLE_FIELD.columnOrder]: '',
	[TABLE_FIELD.headerFilters]: 'No',
	[TABLE_FIELD.freezeFirst]: 'No',
	[TABLE_FIELD.download]: 'No',
};

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

/** Turns "Proxima_Centuri_B" into "Proxima Centuri B". */
export function defaultColumnTitle(columnName) {
	return String(columnName).replace(/_/g, ' ').trim();
}

function isNumericValue(value) {
	if (typeof value === 'number') {
		return Number.isFinite(value);
	}
	if (typeof value !== 'string' || value.trim() === '') {
		return false;
	}
	return Number.isFinite(Number(value));
}

/**
 * Parses figure_interactive_arguments, a JSON array of [id, value] pairs,
 * into a plain object. Accepts an object as well.
 *
 * @param {string|Array|Object} interactiveArguments
 * @return {Object}
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
		return Array.isArray(parsed) ? Object.fromEntries(parsed) : parsed || {};
	} catch {
		return {};
	}
}

/**
 * True when a parsed figure_interactive_args_rendered value is a table spec.
 *
 * @param {*} spec
 * @return {boolean}
 */
export function isTabulatorSpec(spec) {
	return Boolean(
		spec &&
			typeof spec === 'object' &&
			spec.type === TABULATOR_SPEC_TYPE &&
			Array.isArray(spec.columns)
	);
}

/**
 * Converts an uploaded file path (a server path or URL containing
 * "wp-content") into a site-relative URL.
 *
 * @param {string} uploadedPath
 * @return {string}
 */
export function uploadedPathToUrl(uploadedPath) {
	const path = String(uploadedPath || '');
	if (!path.includes('wp-content')) {
		return path;
	}
	return '/wp-content' + path.split('wp-content')[1];
}

/**
 * Turns the parsed contents of an uploaded data file into Tabulator rows.
 *
 * Supported shapes:
 * - Graphic Data JSON: { metadata, data: { column: [values...] } }
 * - An array of row objects
 * - GeoJSON FeatureCollection: one row per feature, from its properties
 *
 * @param {*} fileContents
 * @return {Object[]}
 */
export function dataFileToRows(fileContents) {
	if (Array.isArray(fileContents)) {
		return fileContents;
	}
	if (fileContents?.type === 'FeatureCollection' && Array.isArray(fileContents.features)) {
		return fileContents.features.map((feature) => ({ ...(feature?.properties || {}) }));
	}

	const columns = fileContents?.data;
	if (Array.isArray(columns)) {
		return columns;
	}
	if (!columns || typeof columns !== 'object') {
		return [];
	}

	const keys = Object.keys(columns);
	const rowCount = Math.max(
		0,
		...keys.map((key) => (Array.isArray(columns[key]) ? columns[key].length : 0))
	);

	const rows = new Array(rowCount);
	for (let i = 0; i < rowCount; i++) {
		const row = {};
		keys.forEach((key) => {
			const value = Array.isArray(columns[key]) ? columns[key][i] : undefined;
			row[key] = value === undefined ? null : value;
		});
		rows[i] = row;
	}
	return rows;
}

/** Fetches and parses the data file for a table. */
async function fetchTableRows(dataUrl) {
	const url = new URL(dataUrl, window.location.origin);
	const response = await fetch(url.toString());
	if (!response.ok) {
		throw new Error(`Unable to load table data (${response.status}): ${url}`);
	}
	return dataFileToRows(await response.json());
}

/** REST nonce for editor screens, when one is available. */
function getRestNonce() {
	try {
		const moduleData = JSON.parse(
			document.getElementById('wp-script-module-data-@graphic-data/file-upload')?.textContent ?? '{}'
		);
		if (moduleData.nonce) {
			return moduleData.nonce;
		}
	} catch {}
	return window.wpApiSettings?.nonce || '';
}

/**
 * Looks up the uploaded data file for a figure.
 *
 * @param {number|string} figureId
 * @return {Promise<string>} Site-relative URL of the data file.
 */
export async function fetchFigureDataUrl(figureId) {
	const nonce = getRestNonce();
	const response = await fetch(
		`${window.location.origin}/wp-json/wp/v2/figure/${figureId}?_fields=uploaded_path_json`,
		{ headers: nonce ? { 'X-WP-Nonce': nonce } : {} }
	);
	const body = await response.json();
	if (!response.ok) {
		throw new Error(body?.message || `Unable to load figure ${figureId} (${response.status}).`);
	}
	if (typeof body.uploaded_path_json !== 'string' || body.uploaded_path_json.trim() === '') {
		throw new Error(`Figure ${figureId} has no uploaded data file.`);
	}
	return uploadedPathToUrl(body.uploaded_path_json);
}

/* ------------------------------------------------------------------------ */
/* Library loading                                                           */
/* ------------------------------------------------------------------------ */

let tabulatorPromise = null;
const stylePromises = new WeakMap();

/**
 * Adds the Tabulator stylesheet to a document once.
 *
 * Call this for any document a table is moved into, for example the block
 * editor's canvas iframe. Tables are drawn in one document and can be moved
 * into another, and the stylesheet does not travel with them.
 *
 * @param {Document} [targetDocument] Document that will display tables.
 * @return {Promise<void>} Resolves when the stylesheet has loaded (or failed).
 */
export function ensureTabulatorStyles(targetDocument = document) {
	if (!targetDocument?.head) {
		return Promise.resolve();
	}
	if (stylePromises.has(targetDocument)) {
		return stylePromises.get(targetDocument);
	}

	let link = targetDocument.querySelector('link[data-graphic-data-tabulator]');
	let promise;
	if (link) {
		promise = Promise.resolve();
	} else {
		link = targetDocument.createElement('link');
		link.rel = 'stylesheet';
		link.href = TABULATOR_CSS_URL;
		link.dataset.graphicDataTabulator = 'true';
		promise = new Promise((resolve) => {
			link.addEventListener('load', () => resolve(), { once: true });
			link.addEventListener('error', () => resolve(), { once: true });
		});
		targetDocument.head.appendChild(link);
	}

	stylePromises.set(targetDocument, promise);
	return promise;
}

/**
 * Loads the Tabulator script and stylesheet once per page.
 *
 * @return {Promise<Function>} The Tabulator constructor.
 */
export function loadTabulator() {
	if (window.Tabulator) {
		return Promise.resolve(window.Tabulator);
	}
	if (tabulatorPromise) {
		return tabulatorPromise;
	}

	ensureTabulatorStyles(document);

	tabulatorPromise = new Promise((resolve, reject) => {
		const script = document.createElement('script');
		script.src = TABULATOR_JS_URL;
		script.async = true;
		script.dataset.graphicDataTabulator = 'true';
		script.addEventListener('load', () => {
			if (window.Tabulator) {
				resolve(window.Tabulator);
			} else {
				reject(new Error('Tabulator failed to initialize.'));
			}
		});
		script.addEventListener('error', () => {
			tabulatorPromise = null;
			reject(new Error('The Tabulator library could not be loaded.'));
		});
		document.head.appendChild(script);
	});

	return tabulatorPromise;
}

/* ------------------------------------------------------------------------ */
/* Build: settings -> spec                                                   */
/* ------------------------------------------------------------------------ */

/**
 * Resolves the saved column order into a full list of data-file positions.
 *
 * Positions that are invalid or repeated are ignored. Columns the saved
 * order does not mention, such as columns added by a new data file, follow
 * in data-file order.
 *
 * @param {string} savedOrder  Comma-separated positions, e.g. "2,0,1".
 * @param {number} columnCount Number of columns in the data file.
 * @return {number[]} Every position from 0 to columnCount - 1, once each.
 */
export function resolveColumnOrder(savedOrder, columnCount) {
	const order = [];
	String(savedOrder || '')
		.split(',')
		.map((part) => Number.parseInt(part, 10))
		.forEach((position) => {
			if (Number.isInteger(position) && position >= 0 && position < columnCount && !order.includes(position)) {
				order.push(position);
			}
		});
	for (let position = 0; position < columnCount; position++) {
		if (!order.includes(position)) {
			order.push(position);
		}
	}
	return order;
}

/**
 * Builds a table spec from the admin settings.
 *
 * @param {Object|string|Array} settings     Parsed or raw figure_interactive_arguments.
 * @param {string[]}            columnNames  Column names in data-file order.
 * @param {Object}              context
 * @param {string}              context.dataUrl   Site-relative URL of the data file.
 * @param {number|string}       context.figureId  Figure post ID.
 * @param {Object[]}            [context.rows]    Rows, used to detect numeric columns.
 * @return {Object} Table spec.
 */
export function buildTabulatorSpec(settings, columnNames, { dataUrl, figureId, rows = [] } = {}) {
	const values = { ...TABLE_DEFAULTS, ...parseInteractiveArguments(settings) };
	const valueOf = (id, fallback = '') => {
		const value = values[id];
		return value === undefined || value === null || value === '' ? fallback : String(value);
	};

	const sample = rows.slice(0, 200);
	const freezeFirst = valueOf(TABLE_FIELD.freezeFirst) === 'Yes';
	const headerFilters = valueOf(TABLE_FIELD.headerFilters) === 'Yes';

	const columns = [];
	resolveColumnOrder(valueOf(TABLE_FIELD.columnOrder), columnNames.length).forEach((index) => {
		const field = columnNames[index];
		if (valueOf(tableColumnField.show(index), 'Show') === 'Hide') {
			return;
		}

		const present = sample.map((row) => row?.[field]).filter((v) => v !== null && v !== undefined && v !== '');
		const numeric = present.length > 0 && present.every(isNumericValue);

		let format = valueOf(tableColumnField.format(index), 'auto');
		if (format === 'auto') {
			format = numeric ? 'number' : 'text';
		}

		const decimalsText = valueOf(tableColumnField.decimals(index));
		const decimals = decimalsText === '' ? null : Math.max(0, Math.min(10, parseInt(decimalsText, 10) || 0));

		columns.push({
			field,
			title: valueOf(tableColumnField.title(index), defaultColumnTitle(field)),
			format,
			decimals: format === 'number' ? decimals : null,
			headerFilter: headerFilters,
			frozen: freezeFirst && columns.length === 0,
		});
	});

	const pageSizeText = valueOf(TABLE_FIELD.pageSize, 'All');
	const pageSize = pageSizeText === 'All' ? 0 : Math.max(1, parseInt(pageSizeText, 10) || 25);

	return {
		type: TABULATOR_SPEC_TYPE,
		version: TABULATOR_SPEC_VERSION,
		figureId: Number(figureId) || 0,
		dataUrl: String(dataUrl || ''),
		columns,
		table: {
			pageSize,
			layout: valueOf(TABLE_FIELD.layout) === 'fitColumns' ? 'fitColumns' : 'fitDataStretch',
			narrow: valueOf(TABLE_FIELD.narrow) === 'collapse' ? 'collapse' : 'scroll',
			download: valueOf(TABLE_FIELD.download) === 'Yes',
		},
	};
}

/* ------------------------------------------------------------------------ */
/* Mount: spec -> Tabulator                                                  */
/* ------------------------------------------------------------------------ */

function numberFormatter(decimals) {
	// No thousands separators, so values such as years display as stored.
	const formatter =
		decimals === null || decimals === undefined
			? null
			: new Intl.NumberFormat(undefined, {
					minimumFractionDigits: decimals,
					maximumFractionDigits: decimals,
					useGrouping: false,
			  });

	return (cell) => {
		const value = cell.getValue();
		if (value === null || value === undefined || value === '') {
			return '';
		}
		if (formatter && isNumericValue(value)) {
			return formatter.format(Number(value));
		}
		return escapeHtml(value);
	};
}

function toTabulatorColumns(spec) {
	const collapse = spec.table?.narrow === 'collapse';

	return spec.columns.map((column, index) => {
		const definition = {
			field: column.field,
			title: column.title || defaultColumnTitle(column.field),
			headerSort: true,
			// All cells and headers are left justified, including numbers.
			hozAlign: 'left',
			headerHozAlign: 'left',
			// Field names may contain dots; never treat them as nested paths.
			formatter: column.format === 'number' ? numberFormatter(column.decimals) : 'plaintext',
		};

		if (column.format === 'number') {
			definition.sorter = 'number';
		} else {
			definition.sorter = 'alphanum';
		}

		if (column.headerFilter) {
			definition.headerFilter = 'input';
			definition.headerFilterPlaceholder = 'Filter';
		}

		// Frozen columns are not compatible with collapsing columns.
		if (column.frozen && !collapse) {
			definition.frozen = true;
		}

		if (collapse) {
			// Keep the first column visible; collapse the others from right to left.
			definition.responsive = index === 0 ? 0 : spec.columns.length - index;
		}

		return definition;
	});
}

function resolveDataUrl(spec, figureId) {
	let dataUrl = spec.dataUrl || '';
	// A duplicated figure keeps the original spec until it is saved again,
	// but its data file has been copied into its own folder.
	const currentId = Number(figureId) || 0;
	if (currentId && spec.figureId && currentId !== spec.figureId) {
		dataUrl = dataUrl.replace(`/figure_${spec.figureId}/`, `/figure_${currentId}/`);
	}
	return dataUrl;
}

/**
 * Renders a table spec into an element.
 *
 * @param {HTMLElement|string} target          Element, or the ID of the element, to render into.
 * @param {Object}             spec            Table spec from buildTabulatorSpec().
 * @param {Object}             [options]
 * @param {Object[]}           [options.rows]      Rows, if already loaded.
 * @param {string}             [options.dataUrl]   Overrides spec.dataUrl.
 * @param {number|string}      [options.figureId]  Current figure ID, used for duplicated figures.
 * @param {string}             [options.label]     Accessible name for the table.
 * @return {Promise<Object>} Handle with table, resize(), setHeight() and destroy().
 */
export async function mountTabulatorTable(target, spec, options = {}) {
	const host = typeof target === 'string' ? document.getElementById(target) : target;
	if (!host) {
		throw new Error('Table target element was not found.');
	}
	if (!isTabulatorSpec(spec)) {
		throw new Error('The saved table settings are missing or invalid.');
	}

	const [Tabulator, rows] = await Promise.all([
		loadTabulator(),
		options.rows
			? Promise.resolve(options.rows)
			: fetchTableRows(options.dataUrl || resolveDataUrl(spec, options.figureId)),
	]);

	// The host may live in another document, such as an iframe.
	ensureTabulatorStyles(host.ownerDocument);

	const wrapper = document.createElement('div');
	wrapper.className = 'graphic-data-tabulator';
	wrapper.style.width = '100%';

	let downloadButton = null;
	if (spec.table?.download) {
		const toolbar = document.createElement('div');
		toolbar.className = 'graphic-data-tabulator-toolbar';
		toolbar.style.cssText = 'display:flex;justify-content:flex-end;margin-bottom:6px;';
		downloadButton = document.createElement('button');
		downloadButton.type = 'button';
		downloadButton.className = 'graphic-data-tabulator-download';
		downloadButton.textContent = 'Download CSV';
		downloadButton.style.cssText =
			'font-size:0.85em;padding:4px 10px;border:1px solid #ccc;border-radius:4px;background:#fff;cursor:pointer;';
		toolbar.appendChild(downloadButton);
		wrapper.appendChild(toolbar);
	}

	const tableElement = document.createElement('div');
	tableElement.className = 'graphic-data-tabulator-table';
	if (options.label) {
		tableElement.setAttribute('aria-label', options.label);
	}
	wrapper.appendChild(tableElement);
	host.appendChild(wrapper);

	const pageSize = Number(spec.table?.pageSize) || 0;

	const tabulatorOptions = {
		data: rows,
		columns: toTabulatorColumns(spec),
		layout: spec.table?.layout || 'fitDataStretch',
		nestedFieldSeparator: false,
		placeholder: 'No data available',
		// Render every row for small tables so all of them are in the DOM for assistive technology.
		renderVertical: rows.length <= BASIC_RENDER_ROW_LIMIT ? 'basic' : 'virtual',
	};

	if (pageSize > 0) {
		tabulatorOptions.pagination = true;
		tabulatorOptions.paginationSize = pageSize;
		tabulatorOptions.paginationCounter = 'rows';
	}
	if (spec.table?.narrow === 'collapse') {
		tabulatorOptions.responsiveLayout = 'collapse';
	}

	const table = new Tabulator(tableElement, tabulatorOptions);

	await new Promise((resolve) => {
		table.on('tableBuilt', resolve);
	});

	if (downloadButton) {
		const fileName = `figure-${options.figureId || spec.figureId || 'table'}.csv`;
		downloadButton.addEventListener('click', () => table.download('csv', fileName));
	}

	// Tables built inside a hidden tab have no width. Redraw whenever the
	// available width changes, which also covers a tab becoming visible.
	let resizeObserver = null;
	if (typeof ResizeObserver !== 'undefined') {
		let previousWidth = wrapper.clientWidth;
		let frame = 0;
		resizeObserver = new ResizeObserver(() => {
			const width = wrapper.clientWidth;
			if (!width || width === previousWidth) {
				return;
			}
			previousWidth = width;
			cancelAnimationFrame(frame);
			frame = requestAnimationFrame(() => table.redraw(true));
		});
		resizeObserver.observe(wrapper);
	}

	const handle = {
		table,
		element: wrapper,
		resize: () => table.redraw(true),
		setHeight: (height) => table.setHeight(height),
		destroy: () => {
			resizeObserver?.disconnect();
			table.destroy();
			wrapper.remove();
		},
	};
	wrapper.graphicDataTable = handle;
	return handle;
}

/* ------------------------------------------------------------------------ */
/* Glue for figure-render.js                                                 */
/* ------------------------------------------------------------------------ */

async function waitForElement(id, timeout = 15000, interval = 100) {
	const start = Date.now();
	while (Date.now() - start < timeout) {
		const element = document.getElementById(id);
		if (element) {
			return element;
		}
		await new Promise((resolve) => setTimeout(resolve, interval));
	}
	throw new Error(`Element with id ${id} not found after ${timeout}ms`);
}

function writeRenderedField(value) {
	const field = document.getElementsByName('figure_interactive_args_rendered')[0];
	if (field) {
		field.value = value;
	}
}

/**
 * Builds a table spec from saved settings by loading the figure's data file.
 *
 * @param {number|string} figureId
 * @param {string|Object} interactiveArguments
 * @return {Promise<{spec: Object, rows: Object[]}>}
 */
export async function buildTabulatorSpecForFigure(figureId, interactiveArguments) {
	const dataUrl = await fetchFigureDataUrl(figureId);
	const response = await fetch(new URL(dataUrl, window.location.origin).toString());
	if (!response.ok) {
		throw new Error(`Unable to load table data (${response.status}).`);
	}
	const fileContents = await response.json();
	const rows = dataFileToRows(fileContents);

	let columnNames;
	if (fileContents?.data && !Array.isArray(fileContents.data)) {
		columnNames = Object.keys(fileContents.data);
	} else {
		columnNames = Object.keys(rows[0] || {});
	}

	const spec = buildTabulatorSpec(interactiveArguments, columnNames, { dataUrl, figureId, rows });
	return { spec, rows };
}

/**
 * Renders a table figure if the figure is a table. Called by
 * render_interactive_plots() before any Plotly handling.
 *
 * - On editor screens, when the settings choose a table, the spec is rebuilt
 *   from the current settings and written to figure_interactive_args_rendered.
 * - Everywhere else, a saved table spec is rendered as is.
 *
 * @param {Object}      args
 * @param {string}      args.targetId              ID of the element to render into.
 * @param {number}      args.postID                Figure post ID.
 * @param {string}      args.interactiveArguments  figure_interactive_arguments.
 * @param {Object|null} args.savedSpec             Parsed figure_interactive_args_rendered.
 * @param {string}      [args.label]               Accessible name for the table.
 * @return {Promise<boolean>} True when the figure is a table and was handled.
 */
export async function renderTabulatorFigure({ targetId, postID, interactiveArguments, savedSpec, label }) {
	const settings = parseInteractiveArguments(interactiveArguments);
	const editor = isEditorScreen();
	const rebuildFromSettings = editor && settings.graphType === TABULATOR_GRAPH_TYPE;

	if (!rebuildFromSettings && !(!editor && isTabulatorSpec(savedSpec))) {
		return false;
	}

	let target = null;
	try {
		target = await waitForElement(targetId);

		let spec = savedSpec;
		let rows;
		if (rebuildFromSettings) {
			({ spec, rows } = await buildTabulatorSpecForFigure(postID, settings));
			writeRenderedField(JSON.stringify(spec, null, 2));
		}

		await mountTabulatorTable(target, spec, { rows, figureId: postID, label });

		if (!editor) {
			document.dispatchEvent(
				new CustomEvent('graphic-data:figureTableLoaded', { detail: { title: label, postID } })
			);
		}
	} catch (error) {
		console.error('Table figure error:', error);
		if (rebuildFromSettings) {
			// Never leave a stale spec (or an older Plotly figure) behind for the save step.
			writeRenderedField('');
		}
		if (target) {
			const message = document.createElement('p');
			message.className = 'figure-error';
			message.textContent = 'The table could not be loaded.';
			target.appendChild(message);
		}
	}

	return true;
}
