/**
 * Admin settings for Tabulator table figures.
 *
 * Builds the table controls inside the Figure edit screen's graph settings
 * area (#graphGUI). Every control is named "plotFields", so the shared
 * logFormFieldValues() / fillFormFieldValues() helpers save and restore it
 * through figure_interactive_arguments, exactly like the Plotly settings.
 */

import { logFormFieldValues, fillFormFieldValues } from '@graphic-data/plotly-utility';
import {
	TABLE_FIELD,
	TABLE_DEFAULTS,
	tableColumnField,
	defaultColumnTitle,
	resolveColumnOrder,
} from '@graphic-data/tabulator-table';

function savedOrDefault(id, fallback) {
	const saved = fillFormFieldValues(id);
	if (saved !== undefined) {
		return saved;
	}
	return fallback !== undefined ? fallback : TABLE_DEFAULTS[id] ?? '';
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
		const option = document.createElement('option');
		option.value = value;
		option.textContent = text;
		select.appendChild(option);
	});
	const saved = savedOrDefault(id, fallback);
	if (options.some(([value]) => value === saved)) {
		select.value = saved;
	}
	select.addEventListener('change', logFormFieldValues);
	return select;
}

function makeInput(id, { type = 'text', fallback = '', placeholder = '', size, min, max } = {}) {
	const input = document.createElement('input');
	input.id = id;
	input.name = 'plotFields';
	input.type = type;
	input.value = savedOrDefault(id, fallback);
	if (placeholder) {
		input.placeholder = placeholder;
	}
	if (size) {
		input.size = size;
	}
	if (min !== undefined) {
		input.min = String(min);
	}
	if (max !== undefined) {
		input.max = String(max);
	}
	input.addEventListener('change', logFormFieldValues);
	return input;
}

function addTableOption(container, labelText, control, helpText) {
	const { row, fieldColumn } = makeRow(labelText, control.id);
	fieldColumn.appendChild(control);
	if (helpText) {
		const help = document.createElement('div');
		help.style.cssText = 'font-size:12px;color:#646970;margin-top:2px;';
		help.textContent = helpText;
		fieldColumn.appendChild(help);
	}
	container.appendChild(row);
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

function buildColumnsGrid(columnNames) {
	const wrapper = document.createElement('div');
	wrapper.style.cssText = 'overflow-x:auto;';

	// Stores the display order, e.g. "2,0,1". Saved with the other plotFields.
	const orderInput = document.createElement('input');
	orderInput.type = 'hidden';
	orderInput.id = TABLE_FIELD.columnOrder;
	orderInput.name = 'plotFields';
	wrapper.appendChild(orderInput);

	// Announces moves to screen reader users.
	const announcer = document.createElement('div');
	announcer.setAttribute('aria-live', 'polite');
	announcer.className = 'screen-reader-text';
	wrapper.appendChild(announcer);

	const grid = document.createElement('table');
	grid.className = 'widefat striped';
	grid.style.cssText = 'margin-top:4px;';

	const head = document.createElement('thead');
	head.innerHTML =
		'<tr><th scope="col">Order</th><th scope="col">Data column</th><th scope="col">Show</th>' +
		'<th scope="col">Header label</th><th scope="col">Format</th>' +
		'<th scope="col">Decimal places</th></tr>';
	grid.appendChild(head);

	const body = document.createElement('tbody');

	function syncOrder({ save = true } = {}) {
		const rows = [...body.children];
		orderInput.value = rows.map((row) => row.dataset.columnIndex).join(',');
		rows.forEach((row, position) => {
			row.querySelector('[data-move="up"]').disabled = position === 0;
			row.querySelector('[data-move="down"]').disabled = position === rows.length - 1;
		});
		if (save) {
			logFormFieldValues();
		}
	}

	function moveRow(row, direction, button) {
		if (direction < 0 && row.previousElementSibling) {
			body.insertBefore(row, row.previousElementSibling);
		} else if (direction > 0 && row.nextElementSibling) {
			body.insertBefore(row.nextElementSibling, row);
		} else {
			return;
		}
		syncOrder();

		// Keep keyboard focus on the moved row.
		const target = button.disabled
			? row.querySelector(`[data-move="${direction < 0 ? 'down' : 'up'}"]`)
			: button;
		target.focus();

		const position = [...body.children].indexOf(row) + 1;
		announcer.textContent = `${row.dataset.columnName} moved to position ${position} of ${body.children.length}.`;
	}

	const order = resolveColumnOrder(savedOrDefault(TABLE_FIELD.columnOrder, ''), columnNames.length);

	order.forEach((index) => {
		const columnName = columnNames[index];
		const tr = document.createElement('tr');
		tr.dataset.columnIndex = String(index);
		tr.dataset.columnName = columnName;

		const orderCell = document.createElement('td');
		orderCell.style.whiteSpace = 'nowrap';
		const up = makeMoveButton('\u2191', `Move ${columnName} up`);
		up.dataset.move = 'up';
		const down = makeMoveButton('\u2193', `Move ${columnName} down`);
		down.dataset.move = 'down';
		down.style.marginLeft = '4px';
		up.addEventListener('click', () => moveRow(tr, -1, up));
		down.addEventListener('click', () => moveRow(tr, 1, down));
		orderCell.append(up, down);
		tr.appendChild(orderCell);

		const nameCell = document.createElement('td');
		nameCell.textContent = columnName;
		tr.appendChild(nameCell);

		const show = makeSelect(tableColumnField.show(index), [
			['Show', 'Show'],
			['Hide', 'Hide'],
		], 'Show');
		show.setAttribute('aria-label', `Show column ${columnName}`);
		// Wide enough for "Show" / "Hide" plus the dropdown arrow.
		show.style.minWidth = '5.5em';

		const title = makeInput(tableColumnField.title(index), {
			fallback: defaultColumnTitle(columnName),
		});
		title.setAttribute('aria-label', `Header label for ${columnName}`);
		// The text input flexes, so the dropdowns keep their full width.
		title.style.width = '100%';
		title.style.minWidth = '6em';

		const format = makeSelect(tableColumnField.format(index), [
			['auto', 'Automatic'],
			['text', 'Text'],
			['number', 'Number'],
		], 'auto');
		format.setAttribute('aria-label', `Format for ${columnName}`);
		// Wide enough for "Automatic" plus the dropdown arrow.
		format.style.minWidth = '7.5em';

		const decimals = makeInput(tableColumnField.decimals(index), {
			type: 'number',
			min: 0,
			max: 10,
			placeholder: 'As is',
		});
		decimals.style.width = '6em';
		decimals.setAttribute('aria-label', `Decimal places for ${columnName}`);

		[show, title, format, decimals].forEach((control) => {
			const td = document.createElement('td');
			td.appendChild(control);
			tr.appendChild(td);
		});

		body.appendChild(tr);
	});
	grid.appendChild(body);
	wrapper.appendChild(grid);

	// Set the initial order and button states; the caller saves all fields.
	syncOrder({ save: false });
	return wrapper;
}

/**
 * Creates the table settings for the selected data file.
 *
 * Called by secondaryGraphFields() in file-upload.js when the graph type is
 * "Tabulator table".
 *
 * @param {Object} jsonColumns Column names keyed by position, e.g. { 0: 'Year', 1: 'Value' }.
 */
export function tabulatorTableParameterFields(jsonColumns) {
	const targetElement = document.getElementById('graphGUI');
	if (!targetElement) {
		return;
	}

	const columnNames = Object.keys(jsonColumns)
		.sort((a, b) => Number(a) - Number(b))
		.map((key) => jsonColumns[key]);

	const container = document.createElement('div');
	container.id = 'secondaryGraphFields';

	// Columns.
	const { row: columnsRow, fieldColumn: columnsField } = makeRow('Columns');
	columnsField.appendChild(buildColumnsGrid(columnNames));
	container.appendChild(columnsRow);

	// Table-wide options.
	addTableOption(
		container,
		'Rows per page',
		makeSelect(TABLE_FIELD.pageSize, [
			['All', 'Show all rows'],
			['10', '10'],
			['25', '25'],
			['50', '50'],
			['100', '100'],
		])
	);

	addTableOption(
		container,
		'Column widths',
		makeSelect(TABLE_FIELD.layout, [
			['fitDataStretch', 'Fit to content'],
			['fitColumns', 'Fill the available width'],
		])
	);

	addTableOption(
		container,
		'Narrow screens',
		makeSelect(TABLE_FIELD.narrow, [
			['scroll', 'Scroll sideways'],
			['collapse', 'Collapse extra columns into rows'],
		])
	);

	addTableOption(
		container,
		'Freeze first column',
		makeSelect(TABLE_FIELD.freezeFirst, [
			['No', 'No'],
			['Yes', 'Yes'],
		]),
		'Ignored when narrow screens collapse extra columns.'
	);

	addTableOption(
		container,
		'Column filters',
		makeSelect(TABLE_FIELD.headerFilters, [
			['No', 'No'],
			['Yes', 'Yes'],
		])
	);

	addTableOption(
		container,
		'Download button',
		makeSelect(TABLE_FIELD.download, [
			['No', 'No'],
			['Yes', 'Yes'],
		]),
		'Lets readers download the table as a CSV file.'
	);

	targetElement.appendChild(container);

	// Store the defaults right away, so a table can be previewed without changing anything.
	logFormFieldValues();
}
