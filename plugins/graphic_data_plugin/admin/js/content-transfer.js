/**
 * Graphic Data Content Transfer admin module.
 *
 * Loaded on the "Content Transfer" submenu page under `graphic-data-search`.
 * Handles the export form:
 *
 *   1. Shows the panel for the chosen scope (whole Instances, or selected
 *      Scenes, Modals and Figures) and keeps the selection tree's checkboxes
 *      in step: ticking an item ticks everything beneath it.
 *   2. "Preview export" posts the form to admin-ajax.php
 *      (`graphic_data_transfer_preview`) and renders what the package will
 *      contain, including references that will need relinking on import.
 *      Administrators can export spreadsheets (TSV) for a bulk import instead
 *      of a package; choosing them shows what spreadsheets cannot carry and
 *      turns off the page and About options.
 *
 * The download itself is a normal form submission to admin-post.php so the
 * browser handles the zip file.
 *
 * The Import section (Editors may import a single Figure only):
 *
 *   3. Uploads a package in chunks (`graphic_data_transfer_import_upload`),
 *      so packages larger than the server's upload limit still arrive, and
 *      shows the dry-run report.
 *   4. Asks what each link to content outside the package should point to
 *      on this site (and which Modal tab each Figure goes in), narrowing the
 *      choices to what belongs to the chosen Instance and Scene, and lists
 *      the items that will be left without their Instance, Scene or Modal.
 *   5. Runs the import one step at a time (`graphic_data_transfer_import_run`)
 *      with a progress bar, sending the choices with the first step, then
 *      shows the report.
 *   6. Undoes an import from the history table (`graphic_data_transfer_import_undo`).
 *
 * Standalone figure HTML:
 *
 *   7. Builds the standalone HTML files of imported Figures straight after
 *      an import, and from the "Standalone figure HTML" panel (which
 *      administrators can also use to rebuild every Figure, or an
 *      Instance's). Each Figure's saved content is fetched
 *      (`graphic_data_transfer_html_figure`), turned into HTML in the browser
 *      by createFigureHtml(), exactly as the Figure edit screen does, and
 *      saved (`graphic_data_transfer_html_save`).
 *
 *   8. Interactive figures from a bulk import (a zip of TSV spreadsheets,
 *      uploaded like a package) arrive with settings but no saved figure.
 *      Before their HTML is built, their saved figure is built from the
 *      settings with the Figure edit screen's chart, table and map code
 *      (renderSavedFigure()) and saved (`graphic_data_transfer_render_save`).
 *
 * Communicates with the PHP class `Graphic_Data_Content_Transfer`.
 *
 * @module @graphic-data/content-transfer
 * @package
 */

import { createFigureHtml } from '@graphic-data/figure-html';
import { producePlotlyBarFigure } from '@graphic-data/plotly-bar';
import { producePlotlyLineFigure } from '@graphic-data/plotly-timeseries-line';
import {
	TABULATOR_GRAPH_TYPE,
	buildTabulatorSpecForFigure,
	parseInteractiveArguments as parseTableSettings,
} from '@graphic-data/tabulator-table';
import {
	LEAFLET_MAP_GRAPH_TYPE,
	buildLeafletMapSpecForFigure,
	parseInteractiveArguments as parseMapSettings,
} from '../../includes/figures/js/interactive/leaflet-map.js';
import {
	CAROUSEL_TYPE,
	buildCarouselSpec,
	carouselSettings,
} from '../../includes/figures/js/interactive/image-carousel.js';
import {
	COMPARISON_TYPE,
	buildComparisonSpec,
} from '../../includes/figures/js/interactive/image-comparison.js';

/**
 * package_type of a bulk import from spreadsheets.
 */
const BULK_PACKAGE_TYPE = 'bulk';

/**
 * Summary returned by the preview endpoint.
 *
 * @typedef {Object} ExportSummary
 * @property {string}                                                                                                   package_type 'instances', 'selection' or 'figure'.
 * @property {Object<string, number>}                                                                                   counts       Number of posts per post type.
 * @property {string[]}                                                                                                 terms        Instance Type names.
 * @property {Array<{type: string, id: number, title: string, status: string}>}                                         items        Exported posts.
 * @property {number}                                                                                                   media_count  Number of media files.
 * @property {string}                                                                                                   media_size   Formatted total size of media files.
 * @property {number}                                                                                                   data_count   Number of figure data files.
 * @property {string}                                                                                                   data_size    Formatted total size of data files.
 * @property {Array<{from_type: string, from_title: string, field: string, target_type: string, target_title: string}>} external
 *                                                                                                                                   References to content outside the package.
 * @property {Array<{type: string, title: string, missing: Array<{type: string, linkable: boolean}>}>}                  unassigned
 *                                                                                                                                   Scenes, Modals and Figures missing a required parent within the package.
 * @property {string[]}                                                                                                 warnings     Non-fatal problems.
 * @property {string}                                                                                                   [format]     'tsv' for spreadsheets.
 */

const TYPE_LABELS = {
	instance: ['Instance', 'Instances'],
	scene: ['Scene', 'Scenes'],
	modal: ['Modal', 'Modals'],
	figure: ['Figure', 'Figures'],
	about: ['About', 'About'],
	page: ['Page', 'Pages'],
};

const form = document.getElementById('graphic-data-transfer-export-form');
const previewButton = document.getElementById('graphic-data-transfer-preview');
const status = document.getElementById('graphic-data-transfer-status');
const output = document.getElementById('graphic-data-transfer-preview-output');

const importSection = document.getElementById('graphic-data-transfer-import');

const TOGGLE_ALL_CLASS = 'graphic-data-content-transfer__toggle-all-input';
const TREE_GROUP_SELECTOR = '.graphic-data-content-transfer__tree-group';

if (form && previewButton && status && output) {
	form.addEventListener('change', (event) => {
		const target = event.target;
		if (target.name === 'scope' || target.name === 'format') {
			updateVisibility();
		} else if (target.name === 'post_ids[]') {
			// Ticking or unticking an item applies to everything beneath it.
			target
				.closest('li')
				.querySelectorAll(':scope > ul input[name="post_ids[]"]')
				.forEach((input) => {
					input.checked = target.checked;
				});
			updateTreeState();
		} else if (target.classList.contains(TOGGLE_ALL_CLASS)) {
			target
				.closest(TREE_GROUP_SELECTOR)
				.querySelectorAll('input[name="post_ids[]"]')
				.forEach((input) => {
					input.checked = target.checked;
				});
			updateTreeState();
		}
		output.hidden = true;
	});
	previewButton.addEventListener('click', runPreview);
	updateVisibility();
	updateTreeState();
}

if (importSection) {
	setUpImport(importSection);
}

const rebuildSection = document.getElementById('graphic-data-transfer-rebuild');
if (rebuildSection) {
	setUpRebuild(rebuildSection);
}

/**
 * Show only the panel for the selected scope, and the notice and button
 * text for the selected format. Inputs in hidden panels, and the page and
 * About options when exporting spreadsheets, are disabled so they are not
 * submitted.
 */
function updateVisibility() {
	const scopeInput =
		form.querySelector('[name="scope"]:checked') ||
		form.querySelector('[name="scope"]');
	const scope = scopeInput ? scopeInput.value : 'single';
	const formatInput = form.querySelector('[name="format"]:checked');
	const format = formatInput ? formatInput.value : 'package';

	form.querySelectorAll('.graphic-data-content-transfer__panel').forEach(
		(panel) => {
			panel.hidden = panel.dataset.scope !== scope;
			panel.querySelectorAll('input, select').forEach((input) => {
				input.disabled =
					panel.hidden ||
					(format === 'tsv' &&
						['include_pages', 'include_about'].includes(
							input.name
						));
			});
		}
	);
	form.querySelectorAll('[data-format]').forEach((element) => {
		element.hidden = element.dataset.format !== format;
	});
	const download = document.getElementById('graphic-data-transfer-download');
	if (download) {
		download.textContent =
			format === 'tsv'
				? 'Download spreadsheets'
				: 'Download export package';
	}
}

/**
 * Sync each group's "select everything" checkbox (checked, unchecked or
 * mixed) and the count of selected items.
 */
function updateTreeState() {
	form.querySelectorAll(TREE_GROUP_SELECTOR).forEach((group) => {
		const inputs = group.querySelectorAll('input[name="post_ids[]"]');
		const checked = group.querySelectorAll(
			'input[name="post_ids[]"]:checked'
		).length;
		const toggle = group.querySelector('.' + TOGGLE_ALL_CLASS);
		toggle.checked = checked > 0 && checked === inputs.length;
		toggle.indeterminate = checked > 0 && checked < inputs.length;
	});

	const count = document.getElementById(
		'graphic-data-transfer-selected-count'
	);
	if (count) {
		const total = form.querySelectorAll(
			'input[name="post_ids[]"]:checked'
		).length;
		count.textContent =
			total === 1 ? '1 item selected' : total + ' items selected';
	}
}

/**
 * Ask the server what the current selection would export and render it.
 */
async function runPreview() {
	const body = new FormData(form);
	body.set('action', 'graphic_data_transfer_preview');

	previewButton.disabled = true;
	status.hidden = false;
	output.hidden = true;

	try {
		const response = await fetch(window.ajaxurl, {
			method: 'POST',
			credentials: 'same-origin',
			body,
		});
		const json = await response.json();
		if (!json.success) {
			renderError(
				json.data && json.data.message
					? json.data.message
					: 'The preview could not be created.'
			);
		} else {
			renderSummary(json.data);
		}
	} catch (error) {
		renderError('The preview could not be created: ' + error.message);
	} finally {
		previewButton.disabled = false;
		status.hidden = true;
		output.hidden = false;
	}
}

/**
 * Render an error message in the preview area.
 *
 * @param {string} message Error message.
 */
function renderError(message) {
	output.replaceChildren(notice('error', message));
}

/**
 * Render the export summary.
 *
 * @param {ExportSummary} summary Preview data.
 */
function renderSummary(summary) {
	const parts = [];

	const spreadsheets = summary.format === 'tsv';
	const heading = document.createElement('h3');
	heading.textContent = spreadsheets
		? 'These spreadsheets will contain'
		: 'This package will contain';
	parts.push(heading);

	const counts = document.createElement('ul');
	counts.className = 'graphic-data-content-transfer__counts';
	Object.entries(summary.counts).forEach(([type, count]) => {
		if (count > 0) {
			counts.append(
				listItem(count + ' ' + TYPE_LABELS[type][count === 1 ? 0 : 1])
			);
		}
	});
	if (summary.terms.length) {
		counts.append(listItem('Instance Type: ' + summary.terms.join(', ')));
	}
	counts.append(
		listItem(
			summary.media_count +
				' media file' +
				(summary.media_count === 1 ? '' : 's') +
				' (' +
				summary.media_size +
				')'
		)
	);
	counts.append(
		listItem(
			summary.data_count +
				' figure data file' +
				(summary.data_count === 1 ? '' : 's') +
				' (' +
				summary.data_size +
				')'
		)
	);
	parts.push(counts);

	const details = document.createElement('details');
	const detailsSummary = document.createElement('summary');
	detailsSummary.textContent = 'Show all ' + summary.items.length + ' items';
	details.append(
		detailsSummary,
		table(
			['Type', 'Title', 'Status'],
			summary.items.map((item) => [
				TYPE_LABELS[item.type][0],
				item.title || '(no title)',
				item.status,
			])
		)
	);
	parts.push(details);

	if (summary.external.length) {
		const externalHeading = document.createElement('h3');
		externalHeading.textContent =
			'Links to content that is not in this package';
		const explanation = document.createElement('p');
		explanation.textContent = spreadsheets
			? 'These links are written as slug:<slug>. The site you import the spreadsheets into must have content with that slug, or the import stops and lists the row; before the import runs, you can point each link at something else.'
			: 'When this package is imported, you will be asked what each of these should link to on the destination site. Page blocks that are left unlinked keep their place on the page but show nothing.';
		parts.push(
			externalHeading,
			explanation,
			table(
				['From', 'Field', 'Links to'],
				summary.external.map((ref) => [
					TYPE_LABELS[ref.from_type][0] +
						': ' +
						(ref.from_title || '(no title)'),
					ref.field,
					TYPE_LABELS[ref.target_type][0] +
						': ' +
						(ref.target_title || '(missing)'),
				])
			)
		);
	}

	if (summary.unassigned.length) {
		const unassignedHeading = document.createElement('h3');
		unassignedHeading.textContent =
			'Items that may import with a status of Draft';
		const explanation = document.createElement('p');
		explanation.textContent =
			'A Scene needs an Instance, a Modal needs an Instance and Scene, and a Figure needs an Instance, Scene and Modal. If the destination site has no match for a missing parent, the item is imported as published but its Status field is set to Draft, so it does not appear on the site, and the import lists it as needing attention. Parents marked "none" are not set on this site, so the item will always import this way unless it is linked during import.';
		parts.push(
			unassignedHeading,
			explanation,
			table(
				['Item', 'Missing'],
				summary.unassigned.map((item) => [
					TYPE_LABELS[item.type][0] +
						': ' +
						(item.title || '(no title)'),
					item.missing
						.map(
							(parent) =>
								TYPE_LABELS[parent.type][0] +
								(parent.linkable
									? ' (not in package)'
									: ' (none)')
						)
						.join(', '),
				])
			)
		);
	}

	summary.warnings.forEach((warning) =>
		parts.push(notice('warning', warning))
	);

	output.replaceChildren(...parts);
}

/**
 * Create a list item with text content.
 *
 * @param {string} text Item text.
 * @return {HTMLLIElement} List item.
 */
function listItem(text) {
	const li = document.createElement('li');
	li.textContent = text;
	return li;
}

/**
 * Create a WordPress-styled inline notice.
 *
 * @param {string} type    'error', 'warning', 'success' or 'info'.
 * @param {string} message Notice text.
 * @return {HTMLDivElement} Notice element.
 */
function notice(type, message) {
	const div = document.createElement('div');
	div.className = 'notice inline notice-' + type;
	const p = document.createElement('p');
	p.textContent = message;
	div.append(p);
	return div;
}

/**
 * Create a WordPress-styled table.
 *
 * @param {string[]}                  headers Column headings.
 * @param {Array<Array<string|Node>>} rows    Cell text (or content) per row.
 * @return {HTMLTableElement} Table element.
 */
function table(headers, rows) {
	const tableEl = document.createElement('table');
	tableEl.className = 'widefat striped';
	const headRow = tableEl.createTHead().insertRow();
	headers.forEach((header) => {
		const th = document.createElement('th');
		th.textContent = header;
		headRow.append(th);
	});
	const tbody = tableEl.createTBody();
	rows.forEach((cells) => {
		const row = tbody.insertRow();
		cells.forEach((cell) => {
			if (cell instanceof Node) {
				row.insertCell().append(cell);
			} else {
				row.insertCell().textContent = cell;
			}
		});
	});
	return tableEl;
}

// ---------------------------------------------------------------------
// Import
// ---------------------------------------------------------------------

/**
 * A link from the package to content outside it, which the user points at a
 * post on this site.
 *
 * @typedef {Object} LinkTarget
 * @property {string}                                                        key       "<type>:<source ID>", or "empty:<post>:<field>" for a parent not set on the source site.
 * @property {string}                                                        type      Post type linked to.
 * @property {number}                                                        source_id Source post ID (0 when not set).
 * @property {string}                                                        title     Source post title.
 * @property {boolean}                                                       required  Whether it is a required Instance, Scene or Modal.
 * @property {string}                                                        parent    Key of the target above it (Instance above Scene above Modal), or ''.
 * @property {number}                                                        suggested Post ID chosen by default, or 0.
 * @property {Array<{from_type: string, from_title: string, field: string}>} used_by   Package posts holding the link.
 */

/**
 * A post on this site that a link can point at.
 *
 * @typedef {Object} LinkOption
 * @property {number}                                 id            Post ID.
 * @property {string}                                 title         Label.
 * @property {number}                                 [instance]    Instance of a Scene, Modal or Figure.
 * @property {number}                                 [scene]       Scene of a Modal.
 * @property {boolean}                                [opens_modal] Whether a Modal can hold Figures.
 * @property {Array<{number: number, title: string}>} [tabs]        Tabs of a Modal.
 */

/**
 * Dry-run report returned once a package has been uploaded and checked.
 *
 * @typedef {Object} ImportPlan
 * @property {string}                                                                              package_type 'instances', 'selection' or 'figure'.
 * @property {{site_url: string, plugin_version: string, exported_at: string, same_site: boolean}} source       Where the package came from.
 * @property {Object<string, {create: number, copy: number, overwrite: number}>}                   counts       Per post type.
 * @property {{reuse: number, create: number}}                                                     terms        Instance Types.
 * @property {{reuse: number, create: number}}                                                     media        Media files.
 * @property {number}                                                                              data_count   Figure data files.
 * @property {LinkTarget[]}                                                                        links        Links to content outside the package.
 * @property {Array<{figure: number, title: string, tab: number, modal: string}>}                  tabs         Figures whose Modal is chosen on import.
 * @property {Array<{type: string, title: string, refs: Array<{type: string, key: string}>}>}      required     Posts' required parents ('' in the package, 'none' missing, else a link key).
 * @property {Object<string, LinkOption[]>}                                                        options      Posts on this site by type.
 * @property {string[]}                                                                            warnings     Problems with the package.
 */

/**
 * Wire up the Import section.
 *
 * @param {HTMLElement} section Import section element.
 */
function setUpImport(section) {
	const fileInput = document.getElementById(
		'graphic-data-transfer-import-file'
	);
	const checkButton = document.getElementById(
		'graphic-data-transfer-import-check'
	);
	const importStatus = document.getElementById(
		'graphic-data-transfer-import-status'
	);
	const statusText = document.getElementById(
		'graphic-data-transfer-import-status-text'
	);
	const progressBar = document.getElementById(
		'graphic-data-transfer-import-progress'
	);
	const importOutput = document.getElementById(
		'graphic-data-transfer-import-output'
	);
	const nonce = section.dataset.nonce;
	const chunkSize = Math.max(
		parseInt(section.dataset.chunkSize, 10) || 0,
		256 * 1024
	);

	/**
	 * Post an import request.
	 *
	 * @param {string}              action AJAX action.
	 * @param {Object<string, any>} fields Form fields (Blobs allowed).
	 * @return {Promise<any>} Response data.
	 */
	function request(action, fields) {
		return ajaxRequest(nonce, action, fields);
	}

	/**
	 * Show or hide the spinner line.
	 *
	 * @param {string|null} text    Status text, or null to hide.
	 * @param {number}      [done]  Progress so far.
	 * @param {number}      [total] Progress total.
	 */
	function setStatus(text, done, total) {
		importStatus.hidden = text === null;
		statusText.textContent = text || '';
		progressBar.hidden = total === undefined;
		if (total !== undefined) {
			progressBar.max = total;
			progressBar.value = done;
		}
	}

	/**
	 * Show content in the output area.
	 *
	 * @param {...Node} nodes Content.
	 */
	function show(...nodes) {
		importOutput.replaceChildren(...nodes);
		importOutput.hidden = false;
	}

	checkButton.addEventListener('click', async () => {
		const file = fileInput.files && fileInput.files[0];
		if (!file) {
			show(notice('error', 'Choose a package file to import.'));
			return;
		}

		checkButton.disabled = true;
		fileInput.disabled = true;
		importOutput.hidden = true;
		let token = '';
		try {
			let data;
			for (let offset = 0; offset < file.size; offset += chunkSize) {
				setStatus(
					offset === 0
						? 'Uploading…'
						: 'Uploading… ' +
								Math.round((offset / file.size) * 100) +
								'%',
					offset,
					file.size
				);
				data = await request('graphic_data_transfer_import_upload', {
					token,
					offset,
					size: file.size,
					chunk: file.slice(offset, offset + chunkSize),
				});
				token = data.token;
			}
			setStatus(null);
			showPlan(token, data.plan);
		} catch (error) {
			setStatus(null);
			const message = notice('error', error.message);
			// A bulk import lists every problem in its spreadsheets.
			if (error.details && error.details.length) {
				const list = document.createElement('ul');
				error.details.forEach((detail) =>
					list.append(listItem(detail))
				);
				message.append(list);
			}
			show(message);
			checkButton.disabled = false;
			fileInput.disabled = false;
		}
	});

	/**
	 * Show the dry-run report with Import and Cancel buttons.
	 *
	 * @param {string}     token Job token.
	 * @param {ImportPlan} plan  Dry-run report.
	 */
	function showPlan(token, plan) {
		const parts = [];

		const heading = document.createElement('h3');
		heading.textContent = 'Ready to import';
		parts.push(heading);

		const source = document.createElement('p');
		if (plan.package_type === BULK_PACKAGE_TYPE) {
			source.textContent =
				'Bulk import from spreadsheets. Links to existing content named in the spreadsheets are chosen below; check them before importing.';
		} else {
			source.textContent =
				'Exported from ' +
				(plan.source.site_url || 'an unknown site') +
				(plan.source.exported_at
					? ' on ' +
						new Date(plan.source.exported_at).toLocaleString()
					: '') +
				(plan.source.plugin_version
					? ' (Graphic Data ' + plan.source.plugin_version + ')'
					: '') +
				'.' +
				(plan.source.same_site ? ' That is this site.' : '');
		}
		parts.push(source);

		const counts = document.createElement('ul');
		counts.className = 'graphic-data-content-transfer__counts';
		Object.entries(plan.counts).forEach(([type, count]) => {
			const phrases = [];
			if (count.create) {
				phrases.push(count.create + ' new');
			}
			if (count.copy) {
				phrases.push(
					count.copy +
						(count.copy === 1 ? ' copy' : ' copies') +
						' of existing content (Status set to Draft)'
				);
			}
			if (count.overwrite) {
				phrases.push('replaces the existing About content');
			}
			const total = count.create + count.copy + count.overwrite;
			counts.append(
				listItem(
					TYPE_LABELS[type][total === 1 ? 0 : 1] +
						': ' +
						phrases.join(', ')
				)
			);
		});
		if (plan.terms.reuse + plan.terms.create) {
			counts.append(
				listItem(
					'Instance Types: ' +
						plan.terms.create +
						' new, ' +
						plan.terms.reuse +
						' already on this site'
				)
			);
		}
		counts.append(
			listItem(
				'Media files: ' +
					plan.media.create +
					' to add, ' +
					plan.media.reuse +
					' already on this site'
			),
			listItem('Figure data files: ' + plan.data_count)
		);
		parts.push(counts);

		const chooser = plan.links.length ? linkChooser(plan) : null;
		if (chooser) {
			parts.push(chooser.element);
		}

		plan.warnings.forEach((warning) =>
			parts.push(notice('warning', warning))
		);

		const actions = document.createElement('p');
		actions.className = 'graphic-data-content-transfer__actions';
		const importButton = document.createElement('button');
		importButton.type = 'button';
		importButton.className = 'button button-primary';
		importButton.textContent = 'Import';
		const cancelButton = document.createElement('button');
		cancelButton.type = 'button';
		cancelButton.className = 'button';
		cancelButton.textContent = 'Cancel';
		actions.append(importButton, cancelButton);
		parts.push(actions);

		show(...parts);

		cancelButton.addEventListener('click', async () => {
			importButton.disabled = true;
			cancelButton.disabled = true;
			try {
				await request('graphic_data_transfer_import_cancel', { token });
			} catch (error) {
				// The job expires on its own; nothing else to do.
			}
			importOutput.hidden = true;
			checkButton.disabled = false;
			fileInput.disabled = false;
			fileInput.value = '';
		});

		importButton.addEventListener('click', () => {
			importButton.disabled = true;
			cancelButton.disabled = true;
			runImport(
				token,
				chooser ? chooser.getChoices() : { links: {}, tabs: {} }
			);
		});
	}

	/**
	 * Run import steps until the import finishes or fails.
	 *
	 * @param {string} token   Job token.
	 * @param {Object} choices Link and tab choices, sent with the first step.
	 */
	async function runImport(token, choices) {
		setStatus('Starting import…', 0, 1);
		let fields = { token, choices: JSON.stringify(choices) };
		try {
			for (;;) {
				const data = await request(
					'graphic_data_transfer_import_run',
					fields
				);
				fields = { token };
				if (data.done) {
					setStatus(null);
					showReport(data.report);
					return;
				}
				setStatus(
					data.step === 'content'
						? 'Creating content…'
						: 'Adding media files (' +
								data.progress +
								' of ' +
								(data.total - 1) +
								')…',
					data.progress,
					data.total
				);
			}
		} catch (error) {
			setStatus(null);
			show(notice('error', error.message), reloadLink());
		}
	}

	/**
	 * Show the final report.
	 *
	 * @param {Object} report Import report.
	 */
	function showReport(report) {
		const parts = [];
		const created = report.created.length;
		parts.push(
			notice(
				'success',
				'Import complete: ' +
					created +
					' item' +
					(created === 1 ? '' : 's') +
					' created' +
					(report.about ? ', About content replaced' : '') +
					(report.linked
						? ', ' +
							report.linked +
							' link' +
							(report.linked === 1 ? '' : 's') +
							' to existing content'
						: '') +
					', ' +
					report.media.create +
					' media file' +
					(report.media.create === 1 ? '' : 's') +
					' added (' +
					report.media.reuse +
					' already here), ' +
					report.data_count +
					' figure data file' +
					(report.data_count === 1 ? '' : 's') +
					' copied.'
			)
		);

		if (report.unassigned.length) {
			const error = notice(
				'error',
				report.unassigned.length +
					' imported item' +
					(report.unassigned.length === 1 ? ' is' : 's are') +
					' missing associated content on this site. ' +
					(report.unassigned.length === 1 ? 'It was' : 'They were') +
					' published with Status set to Draft, so ' +
					(report.unassigned.length === 1 ? 'it does' : 'they do') +
					' not appear on the site. Open each one to choose its Instance, Scene and Modal, then set its Status to Published.'
			);
			const list = document.createElement('ul');
			report.unassigned.forEach((item) => {
				const li = document.createElement('li');
				li.append(
					TYPE_LABELS[item.type][0] + ': ',
					link(item.edit, item.title || '(no title)'),
					' — missing ' +
						item.missing
							.map((type) => TYPE_LABELS[type][0])
							.join(', ')
				);
				list.append(li);
			});
			error.append(list);
			parts.push(error);
		}

		if (report.copies.length) {
			const copiesHeading = document.createElement('h3');
			copiesHeading.textContent =
				'Copies of existing content (Status set to Draft)';
			const list = document.createElement('ul');
			report.copies.forEach((item) => {
				const li = document.createElement('li');
				li.append(
					TYPE_LABELS[item.type][0] + ': ',
					link(item.edit, item.title || '(no title)'),
					' (copy of ',
					link(item.existing, 'existing'),
					')'
				);
				list.append(li);
			});
			parts.push(copiesHeading, list);
		}

		const emptied = report.unlinked.concat(report.cleared);
		if (emptied.length) {
			const emptiedHeading = document.createElement('h3');
			emptiedHeading.textContent = 'Links left empty';
			parts.push(
				emptiedHeading,
				table(
					['From', 'Field', 'Linked to on the source site'],
					emptied.map((ref) => [
						TYPE_LABELS[ref.from_type][0] +
							': ' +
							(ref.from_title || '(no title)'),
						ref.field,
						TYPE_LABELS[ref.target_type][0] +
							': ' +
							(ref.target_title || '(unknown)'),
					])
				)
			);
		}

		// Filled in once the imported Figures' standalone HTML is built.
		const rebuildResult = document.createElement('div');
		if (report.rebuild.length) {
			parts.push(rebuildResult);
		}

		report.warnings.forEach((warning) =>
			parts.push(notice('warning', warning))
		);

		const details = document.createElement('details');
		const summary = document.createElement('summary');
		summary.textContent = 'Show all ' + created + ' created items';
		const list = document.createElement('ul');
		report.created.forEach((item) => {
			const li = document.createElement('li');
			li.append(
				TYPE_LABELS[item.type][0] + ': ',
				link(item.edit, item.title || '(no title)')
			);
			list.append(li);
		});
		details.append(summary, list);
		parts.push(details, reloadLink());

		show(...parts);

		if (report.rebuild.length) {
			const figures = report.created.filter((item) =>
				report.rebuild.includes(item.id)
			);
			buildFigureHtml(nonce, figures, (done, total) =>
				setStatus(
					'Building standalone figure HTML (' +
						done +
						' of ' +
						total +
						')…',
					done,
					total
				)
			).then((result) => {
				setStatus(null);
				rebuildResult.replaceChildren(...describeBuild(result));
			});
		}
	}

	section.addEventListener('click', async (event) => {
		const button = event.target.closest(
			'.graphic-data-content-transfer__undo'
		);
		if (!button) {
			return;
		}
		// eslint-disable-next-line no-alert
		const confirmed = window.confirm(
			'Undo this import? Everything it created (posts, media files, Instance Types and figure data) will be permanently deleted, and any About content it replaced will be restored.'
		);
		if (!confirmed) {
			return;
		}
		button.disabled = true;
		setStatus('Undoing import…');
		try {
			await request('graphic_data_transfer_import_undo', {
				batch: button.dataset.batch,
			});
			window.location.reload();
		} catch (error) {
			setStatus(null);
			button.disabled = false;
			show(notice('error', error.message));
		}
	});
}

/**
 * Build the table for choosing what each link outside the package points to
 * on this site, plus the Modal tab for Figures, and a list of the items that
 * the current choices leave without their Instance, Scene or Modal.
 *
 * Choices cascade: a Scene's list shows only Scenes of the Instance chosen
 * above it, and a Modal's only Modals of the chosen Scene. Choosing a Scene
 * or Modal also chooses the Instance (and Scene) it belongs to.
 *
 * @param {ImportPlan} plan Dry-run report.
 * @return {{element: HTMLElement, getChoices: function(): {links: Object<string, number>, tabs: Object<string, number>}}} Controls and a reader for the choices.
 */
function linkChooser(plan) {
	const element = document.createElement('div');
	const targets = new Map(plan.links.map((target) => [target.key, target]));
	const optionsById = {};
	Object.entries(plan.options).forEach(([type, list]) => {
		optionsById[type] = new Map(list.map((option) => [option.id, option]));
	});
	const selects = new Map();
	const tabSelects = new Map();
	const held = document.createElement('div');

	const isFigure = plan.package_type === 'figure';
	const heading = document.createElement('h3');
	heading.textContent = isFigure
		? 'Where should this Figure go?'
		: 'Links to content that is not in this package';
	const explanation = document.createElement('p');
	explanation.textContent = isFigure
		? 'Choose the Instance, Scene, Modal and tab for the Figure on this site.'
		: 'Choose what each one should point to on this site. Matches found on this site are already chosen. Choosing a Scene or Modal also chooses the Instance and Scene it belongs to.';

	const rows = plan.links.map((target) => {
		const select = document.createElement('select');
		select.addEventListener('change', () => choose(target));
		selects.set(target.key, select);

		const label = document.createElement('span');
		label.textContent = target.source_id
			? TYPE_LABELS[target.type][0] +
				': ' +
				(target.title || '(missing on the source site)')
			: TYPE_LABELS[target.type][0] + ' (not set on the source site)';
		select.setAttribute('aria-label', label.textContent);
		const labelCell = document.createElement('div');
		labelCell.append(label);
		if (target.suggested) {
			const hint = document.createElement('div');
			hint.className = 'description';
			hint.textContent = 'Match found on this site';
			labelCell.append(hint);
		}
		return [labelCell, usedBy(target.used_by), select];
	});

	plan.tabs.forEach((entry) => {
		const select = document.createElement('select');
		select.addEventListener('change', updateHeld);
		tabSelects.set(entry.figure, select);
		const label = 'Tab for Figure: ' + (entry.title || '(no title)');
		select.setAttribute('aria-label', label);
		rows.push([label, '', select]);
	});

	element.append(
		heading,
		explanation,
		table(['On the source site', 'Used by', 'On this site'], rows),
		held
	);
	refresh();

	/**
	 * Apply a choice: fill in the Instance and Scene above it, then refresh.
	 *
	 * @param {LinkTarget} target Target whose choice changed.
	 */
	function choose(target) {
		const option = optionsById[target.type].get(
			Number(selects.get(target.key).value)
		);
		const ancestors = [];
		for (let key = target.parent; key; key = targets.get(key).parent) {
			ancestors.unshift(targets.get(key));
		}
		ancestors.forEach((ancestor) => {
			if (option && option[ancestor.type]) {
				fill(ancestor);
				const select = selects.get(ancestor.key);
				if (
					[...select.options].some(
						(item) => Number(item.value) === option[ancestor.type]
					)
				) {
					select.value = String(option[ancestor.type]);
				}
			}
		});
		refresh();
	}

	/**
	 * Refill every list, keeping choices that are still on offer.
	 */
	function refresh() {
		plan.links.forEach(fill);
		plan.tabs.forEach(fillTabs);
		updateHeld();
	}

	/**
	 * Fill a target's list with the posts that belong to the nearest choice
	 * above it (its Scene, or failing that its Instance).
	 *
	 * @param {LinkTarget} target Target.
	 */
	function fill(target) {
		const select = selects.get(target.key);
		const current = select.options.length
			? Number(select.value)
			: target.suggested;
		let list = plan.options[target.type] || [];
		for (let key = target.parent; key; key = targets.get(key).parent) {
			const ancestor = targets.get(key);
			const value = Number(selects.get(key).value);
			if (value) {
				list = list.filter((option) => option[ancestor.type] === value);
				break;
			}
		}
		if (
			target.type === 'modal' &&
			target.used_by.some((use) => use.field === 'figure_modal')
		) {
			list = list.filter((option) => option.opens_modal);
		}

		select.replaceChildren(
			new Option(
				target.required
					? '— Leave empty (Status set to Draft) —'
					: '— Leave empty —',
				'0'
			)
		);
		if (target.type === 'instance' || target.type === 'page') {
			list.forEach((option) =>
				select.append(new Option(option.title, option.id))
			);
		} else {
			const groups = new Map();
			list.forEach((option) => {
				const instance =
					optionsById.instance &&
					optionsById.instance.get(option.instance);
				const group = instance ? instance.title : 'No Instance';
				if (!groups.has(group)) {
					groups.set(group, []);
				}
				groups.get(group).push(option);
			});
			[...groups.keys()]
				.sort((a, b) => a.localeCompare(b))
				.forEach((group) => {
					const optgroup = document.createElement('optgroup');
					optgroup.label = group;
					groups
						.get(group)
						.forEach((option) =>
							optgroup.append(new Option(option.title, option.id))
						);
					select.append(optgroup);
				});
		}
		select.value = list.some((option) => option.id === current)
			? String(current)
			: '0';
	}

	/**
	 * Fill a Figure's tab list from the chosen Modal.
	 *
	 * @param {{figure: number, tab: number, modal: string}} entry Tab entry.
	 */
	function fillTabs(entry) {
		const select = tabSelects.get(entry.figure);
		const modal =
			optionsById.modal &&
			optionsById.modal.get(Number(selects.get(entry.modal).value));
		const tabs = modal ? modal.tabs : [];
		const current = select.options.length
			? Number(select.value)
			: entry.tab;
		select.replaceChildren(
			...tabs.map((tab) => new Option(tab.title, tab.number))
		);
		if (!tabs.length) {
			select.append(
				new Option(
					modal ? 'This Modal has no tabs' : '— Choose a Modal —',
					'0'
				)
			);
		}
		select.disabled = !tabs.length;
		if (tabs.some((tab) => tab.number === current)) {
			select.value = String(current);
		}
	}

	/**
	 * List the items the current choices leave without a required parent.
	 */
	function updateHeld() {
		const items = plan.required
			.map((item) => ({
				item,
				missing: item.refs
					.filter(
						(ref) =>
							ref.key === 'none' ||
							(ref.key &&
								Number(selects.get(ref.key).value) === 0)
					)
					.map((ref) => TYPE_LABELS[ref.type][0]),
			}))
			.filter((entry) => entry.missing.length);
		if (!items.length) {
			held.replaceChildren();
			return;
		}
		held.replaceChildren(
			notice(
				'warning',
				items.length +
					' item' +
					(items.length === 1 ? '' : 's') +
					' will be missing an Instance, Scene or Modal on this site, so ' +
					(items.length === 1 ? 'it' : 'they') +
					' will be imported with Status set to Draft:'
			),
			table(
				['Item', 'Missing'],
				items.map(({ item, missing }) => [
					TYPE_LABELS[item.type][0] +
						': ' +
						(item.title || '(no title)'),
					missing.join(', '),
				])
			)
		);
	}

	return {
		element,
		getChoices() {
			const links = {};
			selects.forEach((select, key) => {
				links[key] = Number(select.value);
			});
			const tabs = {};
			tabSelects.forEach((select, figure) => {
				if (!select.disabled) {
					tabs[figure] = Number(select.value);
				}
			});
			return { links, tabs };
		},
	};
}

/**
 * Describe the package items that hold a link, naming up to three.
 *
 * @param {Array<{from_type: string, from_title: string}>} uses Items.
 * @return {string} Description.
 */
function usedBy(uses) {
	const names = [
		...new Set(
			uses.map(
				(use) =>
					TYPE_LABELS[use.from_type][0] +
					': ' +
					(use.from_title || '(no title)')
			)
		),
	];
	return (
		names.slice(0, 3).join('; ') +
		(names.length > 3 ? ' and ' + (names.length - 3) + ' more' : '')
	);
}

/**
 * Post to admin-ajax.php and return the `data` of a successful response.
 *
 * @param {string}              nonce  Content Transfer nonce.
 * @param {string}              action AJAX action.
 * @param {Object<string, any>} fields Form fields (Blobs allowed).
 * @return {Promise<any>} Response data.
 */
async function ajaxRequest(nonce, action, fields) {
	const body = new FormData();
	body.set('action', action);
	body.set('_ajax_nonce', nonce);
	Object.entries(fields).forEach(([name, value]) => {
		if (value instanceof Blob) {
			body.set(name, value, name + '.bin');
		} else {
			body.set(name, String(value));
		}
	});
	const response = await fetch(window.ajaxurl, {
		method: 'POST',
		credentials: 'same-origin',
		body,
	});
	let json;
	try {
		json = await response.json();
	} catch (error) {
		throw new Error(
			'The server returned an unexpected response (HTTP ' +
				response.status +
				').'
		);
	}
	if (!json.success) {
		const error = new Error(
			json.data && json.data.message
				? json.data.message
				: 'The request failed.'
		);
		error.details = (json.data && json.data.errors) || [];
		throw error;
	}
	return json.data;
}

/**
 * Build an Interactive figure's saved figure (figure_interactive_args_rendered)
 * from its settings, with the same code and in the same form as the Figure
 * edit screen's preview.
 *
 * @param {number} figureId Figure ID.
 * @param {string} settings Settings (figure_interactive_arguments).
 * @return {Promise<string>} The saved figure, as the edit screen writes it.
 */
async function renderSavedFigure(figureId, settings) {
	const graphType = carouselSettings(settings).graphType;

	if (
		graphType === 'Plotly bar graph' ||
		graphType === 'Plotly line graph (time series)'
	) {
		// Plotly needs a laid-out element to draw in; keep it off screen.
		const holder = document.createElement('div');
		holder.id = 'graphic-data-transfer-render-' + figureId;
		holder.className = 'graphic-data-content-transfer__render';
		document.body.append(holder);
		try {
			const produce =
				graphType === 'Plotly bar graph'
					? producePlotlyBarFigure
					: producePlotlyLineFigure;
			const savedFigure = await produce(
				holder.id,
				settings,
				figureId,
				document,
				holder.id + '-plot'
			);
			if (!savedFigure) {
				throw new Error(
					'The chart could not be drawn from its settings and data.'
				);
			}
			return JSON.stringify(savedFigure, null, 2);
		} finally {
			// The chart builders finish drawing overlays after they return,
			// so remove the chart a little later.
			setTimeout(() => {
				const plot = document.getElementById(holder.id + '-plot');
				if (plot && window.Plotly) {
					window.Plotly.purge(plot);
				}
				holder.remove();
			}, 5000);
		}
	}
	if (graphType === TABULATOR_GRAPH_TYPE) {
		const { spec } = await buildTabulatorSpecForFigure(
			figureId,
			parseTableSettings(settings)
		);
		return JSON.stringify(spec, null, 2);
	}
	if (graphType === LEAFLET_MAP_GRAPH_TYPE) {
		const { spec } = await buildLeafletMapSpecForFigure(
			figureId,
			parseMapSettings(settings)
		);
		return JSON.stringify(spec, null, 2);
	}
	if (graphType === CAROUSEL_TYPE) {
		return JSON.stringify(buildCarouselSpec(carouselSettings(settings)))
			.replace(/</g, '\\u003c')
			.replace(/>/g, '\\u003e');
	}
	if (graphType === COMPARISON_TYPE) {
		return JSON.stringify(buildComparisonSpec(carouselSettings(settings)));
	}
	throw new Error(
		'Interactive figures of type "' +
			graphType +
			'" cannot be built here. Open the figure and preview it.'
	);
}

/**
 * Build and save the standalone HTML of Figures, one at a time, with the
 * same generator as the Figure edit screen. A Figure that fails is
 * reported and the rest carry on.
 *
 * @param {string}                             nonce      Content Transfer nonce.
 * @param {Array<{id: number, title: string}>} figures    Figures to build.
 * @param {function(number, number): void}     onProgress Called before each Figure.
 * @return {Promise<{built: number, failed: Array<{title: string, message: string}>}>} Outcome.
 */
async function buildFigureHtml(nonce, figures, onProgress) {
	const result = { built: 0, failed: [] };
	const rootURL = window.location.origin;
	for (let i = 0; i < figures.length; i++) {
		const figure = figures[i];
		onProgress(i, figures.length);
		try {
			let data = await ajaxRequest(
				nonce,
				'graphic_data_transfer_html_figure',
				{ figure: figure.id }
			);
			if (data.render) {
				// A bulk-imported Interactive figure: build and save its saved
				// figure first, then build the HTML from what was saved.
				const rendered = await renderSavedFigure(
					figure.id,
					data.render.arguments
				);
				await ajaxRequest(nonce, 'graphic_data_transfer_render_save', {
					figure: figure.id,
					rendered: new Blob([rendered], {
						type: 'application/json',
					}),
				});
				data = await ajaxRequest(
					nonce,
					'graphic_data_transfer_html_figure',
					{ figure: figure.id }
				);
			}
			const full = await createFigureHtml(
				data.saved_figure,
				figure.id,
				rootURL,
				data.info_full,
				data.figure_type
			);
			const figureOnly = await createFigureHtml(
				data.saved_figure,
				figure.id,
				rootURL,
				data.info_figure_only,
				data.figure_type
			);
			// Sent as files, so the browser keeps the line breaks as they are.
			await ajaxRequest(nonce, 'graphic_data_transfer_html_save', {
				figure: figure.id,
				full_html: new Blob([full.figIframeHtml], {
					type: 'text/html',
				}),
				figure_only_html: new Blob([figureOnly.figIframeHtml], {
					type: 'text/html',
				}),
			});
			result.built++;
		} catch (error) {
			result.failed.push({
				title: figure.title || '(no title)',
				message: error.message,
			});
		}
	}
	onProgress(figures.length, figures.length);
	return result;
}

/**
 * Notices describing a standalone HTML build.
 *
 * @param {{built: number, failed: Array<{title: string, message: string}>}} result Outcome.
 * @return {HTMLElement[]} Notices.
 */
function describeBuild(result) {
	const parts = [];
	if (result.built) {
		parts.push(
			notice(
				'success',
				'Standalone HTML built for ' +
					result.built +
					' Figure' +
					(result.built === 1 ? '' : 's') +
					'.'
			)
		);
	}
	if (result.failed.length) {
		const error = notice(
			'error',
			'The standalone HTML of ' +
				result.failed.length +
				' Figure' +
				(result.failed.length === 1 ? '' : 's') +
				' could not be built. ' +
				(result.failed.length === 1 ? 'It stays' : 'They stay') +
				' in the queue in the Standalone figure HTML section below, or ' +
				(result.failed.length === 1 ? 'its' : 'their') +
				' HTML is built when ' +
				(result.failed.length === 1 ? 'it is' : 'they are') +
				' next updated.'
		);
		const list = document.createElement('ul');
		result.failed.forEach((item) =>
			list.append(listItem(item.title + ': ' + item.message))
		);
		error.append(list);
		parts.push(error);
	}
	return parts;
}

/**
 * Wire up the Standalone figure HTML panel.
 *
 * @param {HTMLElement} section Panel element.
 */
function setUpRebuild(section) {
	const nonce = section.dataset.nonce;
	const statusLine = document.getElementById(
		'graphic-data-transfer-rebuild-status'
	);
	const statusText = document.getElementById(
		'graphic-data-transfer-rebuild-status-text'
	);
	const progressBar = document.getElementById(
		'graphic-data-transfer-rebuild-progress'
	);
	const rebuildOutput = document.getElementById(
		'graphic-data-transfer-rebuild-output'
	);
	const queueLine = document.getElementById(
		'graphic-data-transfer-rebuild-queue'
	);
	const scopeSelect = document.getElementById(
		'graphic-data-transfer-rebuild-scope'
	);

	section.addEventListener('click', async (event) => {
		const button = event.target.closest('[data-rebuild]');
		if (!button) {
			return;
		}
		const scope =
			button.dataset.rebuild === 'queue' ? 'queue' : scopeSelect.value;
		const buttons = section.querySelectorAll('[data-rebuild]');
		buttons.forEach((item) => {
			item.disabled = true;
		});
		rebuildOutput.hidden = true;
		statusLine.hidden = false;
		statusText.textContent = 'Finding Figures…';
		try {
			const figures = await ajaxRequest(
				nonce,
				'graphic_data_transfer_html_list',
				{ scope }
			);
			const result = await buildFigureHtml(
				nonce,
				figures,
				(done, total) => {
					statusText.textContent =
						'Building standalone figure HTML (' +
						done +
						' of ' +
						total +
						')…';
					progressBar.max = Math.max(total, 1);
					progressBar.value = done;
				}
			);
			const parts = describeBuild(result);
			if (!figures.length) {
				parts.push(notice('info', 'There are no Figures to build.'));
			}
			rebuildOutput.replaceChildren(...parts);
			if (scope === 'queue' && !result.failed.length) {
				queueLine.textContent =
					'No imported Figures are waiting for their standalone HTML.';
			}
		} catch (error) {
			rebuildOutput.replaceChildren(notice('error', error.message));
		} finally {
			statusLine.hidden = true;
			rebuildOutput.hidden = false;
			buttons.forEach((item) => {
				item.disabled = false;
			});
		}
	});
}

/**
 * Create a link.
 *
 * @param {string} href URL.
 * @param {string} text Link text.
 * @return {HTMLAnchorElement|Text} Link, or plain text without a URL.
 */
function link(href, text) {
	if (!href) {
		return document.createTextNode(text);
	}
	const a = document.createElement('a');
	a.href = href;
	a.textContent = text;
	return a;
}

/**
 * Paragraph with a link that reloads the page to show the import history.
 *
 * @return {HTMLParagraphElement} Paragraph.
 */
function reloadLink() {
	const p = document.createElement('p');
	p.append(link(window.location.href, 'Refresh the page'));
	p.append(' to see this import in the history, where it can be undone.');
	return p;
}
