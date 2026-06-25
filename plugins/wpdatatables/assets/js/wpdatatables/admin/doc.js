var activeTab = '';
var step = '';
var docsHomeUrl = 'https://wpdatatables.com';

var tableSettingsLinks = {
    'main-table-settings': '#table-settings-data-source',
    'display-settings': '#table-settings-display',
    'table-sorting-filtering-settings': '#table-settings-sorting-filtering',
    'editing-settings': '#table-settings-editing',
    'table-tools-settings': '#table-settings-tools',
    'placeholders-settings': '#table-settings-placeholders',
    'customize-table-settings': '#customize-table-settings',
    'advanced-table-settings' : '#advanced-table-settings'
};

var columnSettingsLinks = {
    'column-display-settings': '#column-settings-display',
    'column-data-settings': '#columns-settings-data',
    'column-sorting-settings': '#columns-settings-sorting',
    'column-filtering-settings': '#columns-settings-filtering',
    'column-editing-settings': '#columns-settings-editing',
    'column-conditional-formatting-settings': '#columns-settings-conditional-formatting'
};

var browsePageLinks = {
    'wpDataTables': '#wpdatatables-page',
    'wpDataCharts': '#wpdatacharts-page'
};

var settingsPageLinks = {
    'main-plugin-settings': '#main-settings',
    'separate-connection': '#separate-connection',
    'color-and-font-settings': '#color-font-settings',
    'custom-js-and-css': '#custom-js-css',
    'google-sheet-api-settings': '#google-sheet-api-settings',
    'cache-settings': '#cache-settings',
    'wdt-charts': '#charts',
};

var constructorLinks = {
    '1': '/documentation/general/table-creation-wizard-overview/#step-1',
    '1-1': '/documentation/creating-new-wpdatatables-with-table-constructor/building-and-filling-in-the-tables-manually/',
    '1-2': '/documentation/creating-new-wpdatatables-with-table-constructor/importing-data-to-editable-mysql-table-from-excel-or-csv-with-table-constructor/',
    '2-2': '/documentation/creating-new-wpdatatables-with-table-constructor/importing-data-to-editable-mysql-table-from-excel-or-csv-with-table-constructor/',
    '1-3': '/documentation/creating-new-wpdatatables-with-table-constructor/generating-wordpress-db-queries-with-table-constructor/',
    '1-4': '/documentation/creating-new-wpdatatables-with-table-constructor/building-mysql-queries-with-table-constructor/',
    '2-3': '/documentation/general/table-creation-wizard-overview/#step-3-preview'
};

var chartWizardLinks = {
    'step1': '#chart-title-and-type',
    'step2': '#data-source',
    'step3': '#data-range',
    'step4': '#formatting-preview',
    'step5': '#save-and-get-shortcode'
};

jQuery('.wdt-documentation').click(function (e) {
    e.preventDefault();
    switch (jQuery(this).data('doc-page')) {
        case 'table_settings':
            activeTab = jQuery('div.wdt-table-settings div.tab-content div.tab-pane.active:not(.main-customize-table-settings)').prop('id');
            window.open(docsHomeUrl + '/documentation/general/table-configuration-page-overview/' + tableSettingsLinks[activeTab]);
            break;
        case 'simple_table_settings':
            window.open(docsHomeUrl + '/documentation/creating-new-wpdatatables-with-table-constructor/creating-a-simple-table-with-wpdatatables/');
            break;
        case 'column_settings':
            activeTab = jQuery('div.column-settings-panel div.tab-content div.tab-pane.active').prop('id');
            window.open(docsHomeUrl + '/documentation/general/table-configuration-page-overview/' + columnSettingsLinks[activeTab]);
            break;
        case 'table_preview':
            window.open(docsHomeUrl + '/documentation/general/table-configuration-page-overview/#table-settings-preview');
            break;
        case 'browse_page':
            var activePage = jQuery('.card-header h2 span').text();
            window.open(docsHomeUrl + '/documentation/general/other-back-end-pages/' + browsePageLinks[activePage]);
            break;
        case 'settings_page':
            activeTab = jQuery('div.plugin-settings div.tab-content div.tab-pane.active').prop('id');
            window.open(docsHomeUrl + '/documentation/general/configuration/' + settingsPageLinks[activeTab]);
            break;
        case 'constructor':
            step = jQuery('div.wdt-constructor-step:visible:eq(0)').data('step');
            window.open(docsHomeUrl + constructorLinks[step]);
            break;
        case 'chart_wizard':
            step = jQuery('.chart-wizard-breadcrumb .active').prop('id');
            window.open(docsHomeUrl + '/documentation/wpdatacharts/creating-charts-wordpress-wpdatachart-wizard/' + chartWizardLinks[step]);
            break;
        case 'dashboard_page':
        case 'support_page':
        case 'getting_started_page':
        case 'lite_vs_premium_page':
        case 'system_info_page':
            window.open(docsHomeUrl + '/documentation/general/features-overview/');
            break;
        default:
            break;
    }
});