/**
 * @graphic-data/tabulator-table
 *
 * Mounts Tabulator on every `.graphic-data-table` element on the page.
 * Each mount element carries a `data-source` attribute pointing at the
 * JSON file to load.
 *
 * Plugin → theme boundary:
 *   On successful build, dispatches a `graphic-data:table-ready`
 *   CustomEvent that the theme can listen for (analytics, downstream
 *   interactions). The plugin never imports from the theme.
 */

import { TabulatorFull as Tabulator } from '@graphic-data/tabulator-vendor';

const SELECTOR = '.graphic-data-table';

/**
 * Column definitions for the sample-people dataset.
 *
 * The source data is deliberately messy — ages are strings, `cheese` is
 * variously `1`, `true`, `"true"`, or absent, `gender` is missing on some
 * rows, and `dob` is either dd/MM/yyyy or an empty string. Formatters
 * and mutators below normalize on the way in.
 */
const columns = [
  {
    title: 'ID',
    field: 'id',
    width: 70,
    sorter: 'number',
    hozAlign: 'right',
  },
  {
    title: 'Name',
    field: 'name',
    sorter: 'string',
    headerFilter: 'input',
    minWidth: 160,
  },
  {
    title: 'Age',
    field: 'age',
    sorter: 'number',
    hozAlign: 'right',
    // Coerce string ages to numbers so sort and filter behave numerically.
    mutator: (value) => (value === undefined || value === '' ? null : Number(value)),
  },
  {
    title: 'Gender',
    field: 'gender',
    sorter: 'string',
    headerFilter: 'list',
    headerFilterParams: {
      values: { '': 'All', male: 'Male', female: 'Female' },
      clearable: true,
    },
    formatter: (cell) => cell.getValue() ?? '—',
  },
  {
    title: 'Height',
    field: 'height',
    sorter: 'number',
    hozAlign: 'right',
  },
  {
    title: 'Colour',
    field: 'col',
    formatter: (cell) => {
      const v = cell.getValue();
      if (!v) return '';
      // Small inline swatch + label. Kept as inline style so it renders
      // without needing an additional stylesheet.
      const swatch =
        `<span aria-hidden="true" style="` +
          `display:inline-block;width:0.9em;height:0.9em;border-radius:2px;` +
          `background:${v};margin-right:0.4em;vertical-align:middle;` +
          `border:1px solid rgba(0,0,0,0.15)"></span>`;
      return `${swatch}${v}`;
    },
  },
  {
    title: 'DOB',
    field: 'dob',
    sorter: 'date',
    sorterParams: {
      format: 'dd/MM/yyyy',
      alignEmptyValues: 'bottom',
    },
    formatter: (cell) => cell.getValue() || '—',
  },
  {
    title: 'Cheese',
    field: 'cheese',
    hozAlign: 'center',
    sorter: (a, b) => Number(isTruthy(a)) - Number(isTruthy(b)),
    formatter: (cell) => (isTruthy(cell.getValue()) ? '✓' : '—'),
  },
];

/** Normalizes the mixed truthy representations used in the sample data. */
function isTruthy(v) {
  return v === 1 || v === true || v === 'true';
}

/**
 * Initialize a single mount element.
 * @param {HTMLElement} mount
 */
async function initTable(mount) {
  const source = mount.dataset.source;
  if (!source) {
    console.warn('[graphic-data/table] mount is missing data-source', mount);
    return;
  }

  let data;
  try {
    const response = await fetch(source, { credentials: 'same-origin' });
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    data = await response.json();
  } catch (err) {
    console.error('[graphic-data/table] failed to load', source, err);
    mount.innerHTML =
      '<p role="alert" class="graphic-data-table__error">Unable to load table data.</p>';
    return;
  }

  const table = new Tabulator(mount, {
    data,
    columns,
    layout: 'fitColumns',
    responsiveLayout: 'collapse',
    pagination: true,
    paginationSize: 10,
    paginationSizeSelector: [10, 25, 50],
    movableColumns: true,
    placeholder: 'No data available',
  });

  table.on('tableBuilt', () => {
    mount.dispatchEvent(
      new CustomEvent('graphic-data:table-ready', {
        bubbles: true,
        detail: { source, rowCount: data.length },
      })
    );
  });
}

// Mount everything present on first paint. The `gdTableInit` guard prevents
// double-initialization if this module happens to be evaluated more than once.
document.querySelectorAll(SELECTOR).forEach((el) => {
  if (el.dataset.gdTableInit === '1') return;
  el.dataset.gdTableInit = '1';
  initTable(el);
});
