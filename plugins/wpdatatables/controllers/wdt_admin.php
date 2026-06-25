<?php

defined('ABSPATH') or die("Cannot access pages directly.");

/**
 * Add submenus and menu options
 */
function wdtAdminMenu()
{
    add_menu_page(
            'wpDataTables',
            'wpDataTables',
            'manage_options',
            'wpdatatables-dashboard',
            'wdtMainDashboard',
            'none'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('Dashboard', 'wpdatatables'),
            __('Dashboard', 'wpdatatables'),
            'manage_options',
            'wpdatatables-dashboard',
            'wdtMainDashboard'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('wpDataTables', 'wpdatatables'),
            __('wpDataTables', 'wpdatatables'),
            'manage_options',
            'wpdatatables-administration',
            'wdtBrowseTables'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('Create a Table', 'wpdatatables'),
            __('Create a Table', 'wpdatatables'),
            'manage_options',
            'wpdatatables-constructor',
            'wdtConstructor'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('wpDataCharts', 'wpdatatables'),
            __('wpDataCharts', 'wpdatatables'),
            'manage_options',
            'wpdatatables-charts',
            'wdtBrowseCharts'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('Create a Chart', 'wpdatatables'),
            __('Create a Chart', 'wpdatatables'),
            'manage_options',
            'wpdatatables-chart-wizard',
            'wdtChartWizard'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('Settings', 'wpdatatables'),
            __('Settings', 'wpdatatables'),
            'manage_options',
            'wpdatatables-settings',
            'wdtSettings'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('System info', 'wpdatatables'),
            __('System info', 'wpdatatables'),
            'manage_options',
            'wpdatatables-system-info',
            'wdtSystemInfo'
    );
    if (current_user_can('manage_options')) {
        add_submenu_page(
                'wpdatatables-dashboard',
                __('Permissions', 'wpdatatables'),
                __('Permissions', 'wpdatatables'),
                'manage_options',
                'wpdatatables_permissions',
                ['WDTPermissionsAdmin', 'renderPage']
        );
    }
    add_submenu_page(
            get_option('wdtGettingStartedPageStatus') ? '' : 'wpdatatables-dashboard',
            __('Getting Started', 'wpdatatables'),
            __('Getting Started', 'wpdatatables'),
            'manage_options',
            'wpdatatables-getting-started',
            'wdtGettingStarted'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('Get Help', 'wpdatatables'),
            __('Get Help', 'wpdatatables'),
            'manage_options',
            'wpdatatables-support',
            'wdtSupport'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('Lite vs Premium', 'wpdatatables'),
            __('Lite vs Premium', 'wpdatatables'),
            'manage_options',
            'wpdatatables-lite-vs-premium',
            'wdtLiteVSPremium'
    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('Add-ons', 'wpdatatables'),
            __('Addons', 'wpdatatables'),
            'manage_options',
            'wpdatatables-add-ons',
            'wdtAddOns'
    );
    add_submenu_page(
            'wpdatatables-welcome-page',
            __('Welcome page', 'wpdatatables'),
            __('Welcome page', 'wpdatatables'),
            'manage_options',
            'wpdatatables-welcome-page',
            'wdtWelcomePAge'
    );
//    add_submenu_page(
//        'wpdatatables-dashboard',
//        __('Go Premium', 'wpdatatables'),
//        '<span class="dashicons dashicons-star-filled" style="color: #ff8c00"></span><span id="wpdatatables-lite-go-premium-link" style="color: #ff8c00;font-weight: 500;display: inline-block;margin-left: 5px;margin-top: 2px;">' . __('Go Premium', 'wpdatatables') . '</span>',
//        'manage_options',
//        'https://wpdatatables.com/pricing/?utm_source=lite&utm_medium=plugin&utm_campaign=wpdtlite'
//    );
    add_submenu_page(
            'wpdatatables-dashboard',
            __('Go Premium', 'wpdatatables'),
            '<span class="dashicons dashicons-star-filled" style="color: #ff8c00"></span><span id="wpdatatables-lite-go-premium-link" style="color: #ff8c00;font-weight: 500;display: inline-block;margin-left: 5px;margin-top: 2px;">' . __('Go Premium', 'wpdatatables') . '</span>',
            'manage_options',
            'wpdatatables-lite-vs-premium'
    );

}

add_action('admin_menu', 'wdtAdminMenu');
function wpdatatables_lite_go_premium_link_add_jquery()
{
    ?>
    <script type="text/javascript">
        jQuery(document).ready(function ($) {
            $('#wpdatatables-lite-go-premium-link').parent().attr('target', '_blank');
        });
    </script>
    <?php
}

add_action('admin_head', 'wpdatatables_lite_go_premium_link_add_jquery');
/**
 * Enqueue JS and CSS files for the Admin pages
 *
 * @param $hook
 */
function wdtAdminEnqueue($hook)
{
    if (in_array($hook, array(
            'toplevel_page_wpdatareports',
            'report-builder_page_wpdatareports-wizard',
            'toplevel_page_wpdatatables-dashboard',
            'wpdatatables_page_wpdatatables-administration',
            'wpdatatables_page_wpdatatables-constructor',
            'wpdatatables_page_wpdatatables-charts',
            'wpdatatables_page_wpdatatables-chart-wizard',
            'wpdatatables_page_wpdatatables-settings',
            'wpdatatables_page_wpdatatables-support',
            'wpdatatables_page_wpdatatables-system-info',
            'wpdatatables_page_wpdatatables_permissions',
            'admin_page_wpdatatables-getting-started',
            'wpdatatables_page_wpdatatables-getting-started',
            'admin_page_wpdatatables-welcome-page',
            'admin_page_wpdatatables-lite-vs-premium',
            'wpdatatables_page_wpdatatables-lite-vs-premium',
            'wpdatatables_page_wpdatatables-add-ons'))) {

        add_filter('admin_body_class', 'wdtAddBodyClass');

        wp_enqueue_style('wdt-color-pickr-classic', WDT_CSS_PATH . 'color-pickr/classic-theme.min.css', array(), WDT_CURRENT_VERSION);

        wp_enqueue_script('media-upload');
        wp_enqueue_media();
    }

    wp_register_style('wdt-dragula', WDT_CSS_PATH . 'dragula/dragula.min.css');
    wp_register_style('wdt-browse-css', WDT_CSS_PATH . 'admin/browse.css');
    wp_register_style('wdt-wpdatatables', WDT_CSS_PATH . 'wpdatatables.min.css');
    wp_register_style('wdt-permissions-css', WDT_CSS_PATH . 'admin/permissions.css', array(), WDT_CURRENT_VERSION);

    wp_register_script('wdt-jsrender', WDT_JS_PATH . 'jsrender/jsrender.min.js', array(), false, true);
    wp_register_script('wdt-dragula', WDT_JS_PATH . 'dragula/dragula.min.js', array(), false, true);
    wp_register_script('wdt-ace', WDT_JS_PATH . 'ace/ace.js', array(), false, true);
    wp_register_script('wdt-color-pickr', WDT_JS_PATH . 'color-pickr/pickr.min.js', array(), WDT_CURRENT_VERSION, true);
    wp_register_script('wdt-color-pickr-init', WDT_ROOT_URL . 'assets/js/wpdatatables/admin/wdt.color-picker-init.js', array(), WDT_CURRENT_VERSION, true);
    wp_register_script('wdt-common', WDT_ROOT_URL . 'assets/js/wpdatatables/admin/common.js', array(), false, true);
    wp_register_script('wdt-funcs-js', WDT_JS_PATH . 'wpdatatables/wdt.funcs.js', array('jquery', 'wdt-common'), false, true);
    wp_register_script('wdt-doc-js', WDT_JS_PATH . 'wpdatatables/admin/doc.js', array('jquery', 'wdt-common'), false, true);

    wp_enqueue_style('wdt-admin', WDT_CSS_PATH . 'admin/admin.css');

    wp_enqueue_script('wdt-rating', WDT_JS_PATH . 'wpdatatables/admin/wdtRating.js', array('jquery'), 1.12, true);

    wp_localize_script('wdt-common', 'wpdatatables_edit_strings', WDTTools::getTranslationStrings());
    wp_localize_script('wdt-common', 'wpdatatables_settings', WDTTools::getDateTimeSettings());
    wp_localize_script('wdt-common', 'wdtWpDataTablesPage', WDTTools::getWpDataTablesAdminPages());
    wp_localize_script('wdt-common', 'wdtWpDataTablesPopoverStrings', WDTTools::getWpDataTablesPopoverStrings());

    switch ($hook) {
        case 'toplevel_page_wpdatatables-dashboard':
            wdtDashboardEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-administration':
            wdtBrowseTablesEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-constructor':
            isset($_REQUEST['source']) ? wdtEditEnqueue() : wdtConstructorEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-charts':
            wdtBrowseChartsEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-chart-wizard':
            wdtChartWizardEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables_permissions':
            wdtPermissionsEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-settings':
            wdtSettingsEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-support':
            wdtSupportEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-system-info':
            wdtSystemInfoEnqueue();
            break;
        case 'admin_page_wpdatatables-getting-started':
        case 'wpdatatables_page_wpdatatables-getting-started':
            wdtGettingStartedEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-welcome-page':
        case 'admin_page_wpdatatables-welcome-page':
            wdtWelcomePageEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-lite-vs-premium':
            wdtLiteVSPremiumEnqueue();
            break;
        case 'wpdatatables_page_wpdatatables-add-ons':
            wdtAddOnsEnqueue();
            break;
    }
    do_action('wpdatatables_enqueue_on_admin_pages');
}

add_action('admin_enqueue_scripts', 'wdtAdminEnqueue');

/**
 * + * Fix conflict with Gravity forms tooltips on back-end
 * + */
function wdtDeregisterGravityTooltipScriptLite()
{
    if (defined('GF_MIN_WP_VERSION') && isset($_GET['page']) &&
            ((strpos($_GET['page'], 'wpdatatables') !== false)))
        wp_deregister_script('gform_tooltip_init');
}

add_action('wpdatatables_enqueue_on_admin_pages', 'wdtDeregisterGravityTooltipScriptLite');

/**
 * Enqueue JS and CSS files for the Browse (wpDataTables) Page
 */
function wdtBrowseTablesEnqueue()
{
    WDTTools::wdtUIKitEnqueue();

    wp_enqueue_style('wdt-browse-css');

    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-browse-js', WDT_JS_PATH . 'wpdatatables/admin/browse/wdt.browse.js', array(), false, true);
    wp_enqueue_script('wdt-doc-js');

    wp_localize_script('wdt-browse-js', 'wpdatatablesStrings', WDTTools::getTranslationStrings());
}

/**
 * Enqueue JS and CSS files for the Edit (Add from data source) Page
 */
function wdtEditEnqueue()
{

    $jsExt = get_option('wdtMinifiedJs') ? '.min.js' : '.js';

    WDTTools::wdtUIKitEnqueue();

    wp_enqueue_style('wdt-wpdatatables');
    wp_enqueue_style('wdt-edit-table-css', WDT_CSS_PATH . 'admin/edit_table.css');
    if (isset($_GET['table_id']) && isset($_GET['simple'])) {
        wp_enqueue_style('wdt-handsontable-css', WDT_CSS_PATH . 'handsontable.full.min.css');
    }
    wp_enqueue_style('wdt-table-tools', WDT_CSS_PATH . 'TableTools.css');
    wp_enqueue_style('wdt-datatables-responsive', WDT_CSS_PATH . 'datatables.responsive.css', array(), WDT_CURRENT_VERSION);


    wp_enqueue_style('wdt-dragula');

    $skin = get_option('wdtBaseSkin');
    if (empty($skin)) {
        $skin = 'skin1';
    }
    switch ($skin) {
        case "skin0":
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/material.css';
            break;
        case "skin1":
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/light.css';
            break;
        case "skin2":
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/graphite.css';
            break;
        case "aqua":
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/aqua.css';
            break;
        case "purple":
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/purple.css';
            break;
        case "dark":
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/dark.css';
            break;
        case "mojito":
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/mojito.css';
            break;
        case "raspberry-cream":
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/raspberry-cream.css';
            break;
        case "dark-mojito":
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/darkmojito.css';
            break;
        default:
            $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/material.css';
            break;
    }
    wp_enqueue_style('wdt-skin', $renderSkin, array(), WDT_CURRENT_VERSION);

    wp_enqueue_script('wdt-datatables', WDT_JS_PATH . 'jquery-datatables/jquery.dataTables.min.js', array(), false, true);


    wp_enqueue_script('wdt-row-grouping', WDT_JS_PATH . 'jquery-datatables/jquery.dataTables.rowGrouping.js', array('jquery', 'wdt-datatables'), false, true);
    wp_enqueue_script('wdt-buttons', WDT_JS_PATH . 'export-tools/dataTables.buttons.min.js', array('jquery', 'wdt-datatables'), false, true);
    wp_enqueue_script('wdt-buttons-html5', WDT_JS_PATH . 'export-tools/buttons.html5.min.js', array('jquery', 'wdt-datatables'), false, true);
    wp_enqueue_script('wdt-js-zip', WDT_JS_PATH . 'export-tools/jszip.min.js', array('jquery', 'wdt-datatables'), false, true);
    wp_enqueue_script('wdt-pdf-make', WDT_JS_PATH . 'export-tools/pdfmake.min.js', array('jquery', 'wdt-datatables'), false, true);
    wp_enqueue_script('wdt-vfs-fonts', WDT_JS_PATH . 'export-tools/vfs_fonts.js', array('jquery', 'wdt-datatables'), false, true);
    wp_enqueue_script('wdt-button-print', WDT_JS_PATH . 'export-tools/buttons.print.min.js', array('jquery', 'wdt-datatables'), false, true);
    wp_enqueue_script('wdt-button-vis', WDT_JS_PATH . 'export-tools/buttons.colVis.min.js', array('jquery', 'wdt-datatables'), false, true);
    wp_enqueue_script('wdt-funcs-js');


    wp_enqueue_script('wdt-wpdatatables', WDT_JS_PATH . 'wpdatatables/wpdatatables.js', array('jquery', 'wdt-datatables'), false, true);
    wp_enqueue_script('wdt-responsive', WDT_JS_PATH . 'responsive/datatables.responsive.js', array(), WDT_CURRENT_VERSION, true);


    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-color-pickr');
    wp_enqueue_script('wdt-color-pickr-init');
    wp_enqueue_script('wdt-column-config', WDT_JS_PATH . 'wpdatatables/admin/table-settings/column_config_object.js', array(), false, true);
    wp_enqueue_script('wdt-table-config', WDT_JS_PATH . 'wpdatatables/admin/table-settings/table_config_object.js', array(), false, true);
    wp_enqueue_script('wdt-edit-main-js', WDT_JS_PATH . 'wpdatatables/admin/table-settings/main.js', array(), false, true);
    if (isset($_GET['table_id']) && isset($_GET['simple'])) {
        wp_enqueue_style('wdt-star-rating-css', WDT_CSS_PATH . 'admin/starRating.min.css', array(), WDT_CURRENT_VERSION);
        wp_register_script('handsontable-6.2.2', WDT_JS_PATH . 'handsontable/handsontable.full.6.2.2' . $jsExt, array('jquery'), WDT_CURRENT_VERSION);
        wp_enqueue_script('handsontable-6.2.2');
        wp_enqueue_script('underscore');
        wp_enqueue_script('wdt-star-rating-js', WDT_JS_PATH . 'wpdatatables/admin/starRating.min.js', array('jquery'), WDT_CURRENT_VERSION, true);
        wp_enqueue_script('wdt-simple-table-js', WDT_JS_PATH . 'wpdatatables/admin/constructor/wdt.simpleTable.js', array('jquery'), WDT_CURRENT_VERSION, true);
        wp_enqueue_script('wdt-simple-table-responsive-min-js', WDT_JS_PATH . 'responsive/wdt.simpleTable.responsive.min.js', array('jquery'), WDT_CURRENT_VERSION, true);
        wp_enqueue_script('wdt-simple-table-responsive-js', WDT_JS_PATH . 'responsive/wdt.simpleTable.responsive.init.js', array('jquery'), WDT_CURRENT_VERSION, true);
        wp_dequeue_style('wdt-skin');
    }


    wp_enqueue_script('wdt-add-remove-column', WDT_JS_PATH . 'wpdatatables/wdt.addRemoveColumn.js', array(), false, true);
    wp_enqueue_script('jquery-effects-core');
    wp_enqueue_script('jquery-effects-fade');
    wp_enqueue_script('wdt-dragula');
    wp_enqueue_script('wdt-ace');
    wp_enqueue_script('wdt-doc-js');

    wp_localize_script('wdt-add-remove-column', 'wdtFrontendStrings', WDTTools::getTranslationStrings());
    wp_localize_script('wdt-wpdatatables', 'wpdatatables_frontend_strings', WDTTools::getTranslationStrings());
    wp_localize_script('wdt-advanced-filter', 'wpdatatables_frontend_strings', WDTTools::getTranslationStrings());

    do_action_deprecated('wdt_enqueue_on_edit_page', array(), WDT_INITIAL_LITE_VERSION, 'wpdatatables_enqueue_on_edit_page');
    do_action('wpdatatables_enqueue_on_edit_page');
}

/**
 * Enqueue JS and CSS files for the Constructor (wpDataTable Constructor) Page
 */
function wdtConstructorEnqueue()
{
    WDTTools::wdtUIKitEnqueue();

    wp_enqueue_style('wdt-wpdatatables');
    wp_enqueue_style('wdt-constructor-css', WDT_CSS_PATH . 'admin/constructor.css');
    wp_enqueue_style('wdt-dragula');

    wp_enqueue_script('wdt-ace');
    wp_enqueue_script('wdt-jsrender');
    wp_enqueue_script('wdt-dragula');
    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-color-pickr');
    wp_enqueue_script('wdt-color-pickr-init');
    wp_enqueue_script('wdt-funcs-js');
    wp_enqueue_script('wdt-constructor-main-js', WDT_JS_PATH . 'wpdatatables/admin/constructor/wdt.constructor.js', array(), false, true);
    wp_enqueue_script('wdt-doc-js');

    wp_localize_script('wdt-constructor-main-js', 'wdtConstructorStrings', WDTTools::getTranslationStrings());
}

/**
 * Enqueue JS and CSS files for the Browse Charts (wpDataCharts) Page
 */
function wdtBrowseChartsEnqueue()
{
    WDTTools::wdtUIKitEnqueue();

    wp_enqueue_style('wdt-browse-css');

    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-browse-js', WDT_JS_PATH . 'wpdatatables/admin/browse/wdt.browse.js', array(), WDT_CURRENT_VERSION, true);
    wp_enqueue_script('wdt-doc-js');

    wp_localize_script('wdt-browse-js', 'wpdatatablesStrings', WDTTools::getTranslationStrings());
}

/**
 * Enqueue JS and CSS files for the Chart Wizard (Create Chart Wizard) Page
 */
function wdtChartWizardEnqueue()
{

    $googleLibSource = get_option('wdtGoogleStableVersion') ? WDT_JS_PATH . 'wdtcharts/googlecharts/googlecharts.js' : '//www.gstatic.com/charts/loader.js';

    WDTTools::wdtUIKitEnqueue();

    wp_enqueue_style('wdt-dragula');
    wp_enqueue_style('wdt-chart-wizard-css', WDT_CSS_PATH . 'admin/chart_wizard.css');

    wp_enqueue_script('wdt-jsrender');
    wp_enqueue_script('wdt-dragula');

    wp_enqueue_script('wdt-google-charts', $googleLibSource, array(), WDT_CURRENT_VERSION, true);

    wp_enqueue_script('wdt-chart-js', WDT_JS_PATH . 'wdtcharts/chartjs/Chart.js', array(), WDT_CURRENT_VERSION, true);
    wp_enqueue_script('wdt-wp-chart-js', WDT_JS_PATH . 'wdtcharts/chartjs/wdt.chartJS.js', array(), WDT_CURRENT_VERSION, true);

    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-color-pickr');
    wp_enqueue_script('wdt-color-pickr-init');
    wp_enqueue_script('wdt-chart-wizard', WDT_JS_PATH . 'wdtcharts/wdt.chartWizard.js', array(), false, true);
    wp_enqueue_script('wdt-wp-google-chart', WDT_JS_PATH . 'wdtcharts/googlecharts/wdt.googleCharts.js', array(), WDT_CURRENT_VERSION, true);
    wp_enqueue_script('wdt-doc-js');

    wp_localize_script('wdt-chart-wizard', 'wpdatatablesEditStrings', WDTTools::getTranslationStrings());
}

/**
 * Enqueue JS and CSS files for the Settings Page
 */
function wdtSettingsEnqueue()
{
    WDTTools::wdtUIKitEnqueue();

    wp_enqueue_style('wdt-settings-css', WDT_CSS_PATH . 'admin/settings.css');

    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-color-pickr');
    wp_enqueue_script('wdt-color-pickr-init');
    wp_enqueue_script('wdt-plugin-config', WDT_ROOT_URL . 'assets/js/wpdatatables/admin/plugin-settings/plugin_config_object.js', array(), false, true);
    wp_enqueue_script('wdt-settings-main-js', WDT_ROOT_URL . 'assets/js/wpdatatables/admin/plugin-settings/main.js', array(), false, true);
    wp_enqueue_script('wdt-doc-js');
    wp_enqueue_script('wdt-ace');
    wp_enqueue_script('wdt-funcs-js');

    wp_localize_script('wdt-plugin-config', 'wdt_current_config', WDTSettingsController::getCurrentPluginConfig());
}

/**
 * Enqueue JS and CSS files for the Permissions Page
 */
function wdtPermissionsEnqueue()
{
    WDTTools::wdtUIKitEnqueue();

    wp_enqueue_style('wdt-permissions-css');
    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-doc-js');
    wp_enqueue_script('wdt-funcs-js');
}

/**
 * Enqueue JS and CSS files for the Dashboard Page
 */
function wdtDashboardEnqueue()
{
    wdtStoreEnqueue();
    WDTTools::wdtUIKitEnqueue();
    wp_enqueue_style('wdt-dashboard-css', WDT_CSS_PATH . 'admin/dashboard.css', array(), WDT_CURRENT_VERSION);
    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-doc-js');

    do_action_deprecated('wdt_enqueue_on_dashboard_page', array(), WDT_INITIAL_LITE_VERSION, 'wpdatatables_enqueue_on_dashboard_page');
    do_action('wpdatatables_enqueue_on_dashboard_page');
}

/**
 * Enqueue JS and CSS files for the Support Page
 */
function wdtSupportEnqueue()
{
    WDTTools::wdtUIKitEnqueue();
    wp_enqueue_style('wdt-support-css', WDT_CSS_PATH . 'admin/support.css', array(), WDT_CURRENT_VERSION);
    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-doc-js');
}

/**
 * Enqueue JS and CSS files for the Welcome Page
 */
function wdtWelcomePageEnqueue()
{
    WDTTools::wdtUIKitEnqueue();
    wp_enqueue_style('wdt-welcome-page-css', WDT_CSS_PATH . 'admin/welcome-page.css', array(), WDT_CURRENT_VERSION);
    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-doc-js');
    wp_enqueue_script('wdt-bootstrap-back', WDT_JS_PATH . 'bootstrap/bootstrap.min.js', array('jquery'), WDT_CURRENT_VERSION, true);
    wp_enqueue_script('wdt-welcome-page-js', WDT_ROOT_URL . 'assets/js/dashboard/welcome-page.js', array(), WDT_CURRENT_VERSION, true);
}

/**
 * Enqueue JS and CSS files for the Getting Started Page
 */
function wdtGettingStartedEnqueue()
{
    WDTTools::wdtUIKitEnqueue();
    wp_enqueue_style('wdt-getting-started-css', WDT_CSS_PATH . 'admin/getting-started.css', array(), WDT_CURRENT_VERSION);
    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-doc-js');
}

/**
 * Enqueue JS and CSS files for the System Info Page
 */
function wdtSystemInfoEnqueue()
{
    WDTTools::wdtUIKitEnqueue();
    wp_enqueue_style('wdt-system-info-css', WDT_CSS_PATH . 'admin/system-info.css', array(), WDT_CURRENT_VERSION);
    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-doc-js');
    wp_enqueue_script('wdt-system-info-js', WDT_ROOT_URL . 'assets/js/dashboard/system-info.js', array(), WDT_CURRENT_VERSION, true);
}

/**
 * Enqueue JS and CSS files for the Lite VS Premium Page
 */
function wdtLiteVSPremiumEnqueue()
{
    wdtStoreEnqueue();
    WDTTools::wdtUIKitEnqueue();
    wp_enqueue_style('wdt-lite-vs-premium-css', WDT_CSS_PATH . 'admin/lite-vs-premium.css', array(), WDT_CURRENT_VERSION);
    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-doc-js');
}

/**
 * Enqueue JS and CSS files for the Addons Page
 */
function wdtAddOnsEnqueue()
{
    WDTTools::wdtUIKitEnqueue();

    wp_enqueue_style('wdt-add-ons-css', WDT_CSS_PATH . 'admin/addons.css');

    wp_enqueue_script('wdt-common');
    wp_enqueue_script('wdt-doc-js');

    wp_enqueue_style('wdt-bundles-css', WDT_CSS_PATH . 'admin/bundles.css');
}

/**
 * Enqueue JS and CSS from store
 */
function wdtStoreEnqueue()
{
    //Enqueue JS and CSS from store for promo
    wp_enqueue_style('tms-store-checkout', WDT_STORE_URL . '/static/css/checkout/checkout.css');
    //wp_enqueue_style('tms-store-wpdatatables', WDT_STORE_URL . '/static/css/checkout/wpdatatables.css');
    wp_enqueue_style('tms-store-wpdatatables', WDT_STORE_URL . '/static/css/checkout/wpdatatables-promo.css');

    wp_enqueue_script('tms-store-checkout-config', WDT_STORE_URL . '/static/js/checkout/config.js', array('jquery'), 1.12, true);
    //wp_enqueue_script('tms-store-checkout', WDT_STORE_URL . '/static/js/checkout/checkout.js', array('jquery'), 1.12, true);
    wp_enqueue_script('tms-store-checkout', WDT_STORE_URL . '/static/js/checkout/checkout-promo.js', array('jquery'), 1.12, true);
    //wp_enqueue_script('tms-store-checkout-wpdatatables', WDT_STORE_URL . '/static/js/checkout/wpdatatables.js', array('jquery'), 1.12, true);
}

/**
 * Renders Browse Tables (wpDataTables) Page and handle wpDataTable delete
 */
function wdtBrowseTables()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    $action = '';
    if (isset($_REQUEST['action']) && -1 != $_REQUEST['action']) {
        $action = $_REQUEST['action'];
    }
    if (isset($_REQUEST['action2']) && -1 != $_REQUEST['action2']) {
        $action = $_REQUEST['action2'];
    }

    if ($action === 'delete') {
        $tableId = $_REQUEST['table_id'];

        if (!is_array($tableId)) {
            WPDataTable::deleteTable((int)$tableId);
        } else {
            foreach ($tableId as $singleTableId) {
                WPDataTable::deleteTable((int)$singleTableId);
            }
        }
    }

    $wdtBrowseTable = new WDTBrowseTable();
    $wdtBrowseTable->prepare_items();

    ob_start();
    $wdtBrowseTable->display();
    /** @noinspection PhpUnusedLocalVariableInspection */
    $tableHTML = ob_get_contents();
    ob_end_clean();

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/browse/table/browse.inc.php';
    $browseTablesPage = ob_get_contents();
    ob_end_clean();

    $browseTablesPage = apply_filters('wpdatatables_filter_browse_page', $browseTablesPage);

    echo $browseTablesPage;

    do_action('wpdatatables_browse_page');
}

/**
 * Render Edit (Add from data source) Page
 */
function wdtEdit()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    if (isset($_GET['table_id'])) {
        if (isset($_GET['simple'])) {
            $tableID = (int)$_GET['table_id'];
            $tableData = WDTConfigController::loadSimpleTableConfig($tableID);
        } else if (isset($_GET['table_view'])) {
            $tableData = WDTConfigController::loadTableConfig((int)$_GET['table_id'], $_GET['table_view']);
        } else {
            $tableData = WDTConfigController::loadTableConfig((int)$_GET['table_id']);
        }
        if (isset($tableData->error)) {
            echo WDTTools::wdtShowError($tableData->error);
            return;
        }
        WDTTools::exportJSVar('wpdatatable_init_config', $tableData->table);
    }

    if (isset($_GET['table_id']) && isset($_GET['simple'])) {
        ob_start();
        include WDT_ROOT_PATH . 'templates/admin/table-settings/edit_simple_table.inc.php';
        $editPage = ob_get_contents();
        ob_end_clean();

        $editPage = apply_filters('wpdatatables_filter_edit_page_simple_table', $editPage);
        echo $editPage;
    } else {
        ob_start();
        include WDT_ROOT_PATH . 'templates/admin/table-settings/edit_table.inc.php';
        $editPage = ob_get_contents();
        ob_end_clean();

        $editPage = apply_filters('wpdatatables_filter_edit_page', $editPage);
        echo $editPage;
    }
}

/**
 * Render Constructor (Create a Table) Page
 */
function wdtConstructor()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    if (isset($_GET['source'])) {
        wdtEdit();
    } else {
        ob_start();
        include WDT_ROOT_PATH . 'templates/admin/constructor/constructor.inc.php';
        $constructorPage = ob_get_contents();
        ob_end_clean();

        $constructorPage = apply_filters('wpdatatables_filter_constructor_page', $constructorPage);
        echo $constructorPage;
    }
}

/**
 * Render Browse Charts (wpDataTables Charts) Page
 */
function wdtBrowseCharts()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    $action = '';
    if (isset($_REQUEST['action']) && -1 != $_REQUEST['action']) {
        $action = $_REQUEST['action'];
    }
    if (isset($_REQUEST['action2']) && -1 != $_REQUEST['action2']) {
        $action = $_REQUEST['action2'];
    }

    if ($action === 'delete') {
        $chartId = $_REQUEST['chart_id'];

        if (!is_array($chartId)) {
            WPDataChart::delete((int)$chartId);
        } else {
            foreach ($chartId as $singleChartId) {
                WPDataChart::delete((int)$singleChartId);
            }
        }
    }

    $wdtBrowseChartsTable = new WDTBrowseChartsTable();
    $wdtBrowseChartsTable->prepare_items();

    ob_start();
    $wdtBrowseChartsTable->display();
    /** @noinspection PhpUnusedLocalVariableInspection */
    $tableHTML = ob_get_contents();
    ob_end_clean();

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/browse/chart/browse.inc.php';
    $browseChartsPage = ob_get_contents();
    ob_end_clean();

    $browseChartsPage = apply_filters('wpdatatables_filter_charts_table_page', $browseChartsPage);

    echo $browseChartsPage;
}

/**
 * Render Chart Wizard (Create a Chart) Page
 */
function wdtChartWizard()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    $chartId = isset($_GET['chart_id']) ? (int)$_GET['chart_id'] : false;
    $chartEngine = isset($_GET['engine']) ? sanitize_text_field($_GET['engine']) : '';
    if (!empty($chartId)) {
        try {
            $chartData = [
                    'id' => $chartId,
                    'engine' => $chartEngine
            ];
            $chartObj = WPDataChart::build($chartData, true);
            $chartObj->prepareData();
            $chartObj->shiftXAxisColumnUp();
            $chartObj->prepareRender();
        } catch (Exception $e) {
            echo $e->getMessage();
            exit;
        }
    }

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/chart_wizard/chart_wizard.inc.php';
    $chartWizardPage = ob_get_contents();
    ob_end_clean();

    $chartWizardPage = apply_filters('wpdatatables_filter_chart_wizard_page', $chartWizardPage);
    echo $chartWizardPage;
}

/**
 * Render Dashboard page
 */
function wdtMainDashboard()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/dashboard/dashboard.inc.php';
    $dashboardPage = ob_get_contents();
    ob_end_clean();

    $dashboardPage = apply_filters('wpdatatables_filter_dashboard_page', $dashboardPage);
    echo $dashboardPage;

    do_action('wpdatatables_dashboard_page');
}

/**
 * Render Settings page
 */
function wdtSettings()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/settings/settings.inc.php';
    $settingsPage = ob_get_contents();
    ob_end_clean();

    $settingsPage = apply_filters('wpdatatables_filter_settings_page', $settingsPage);
    echo $settingsPage;

    do_action('wpdatatables_settings_page');
}

/**
 * Render Support Center page
 */
function wdtSupport()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/support/support.inc.php';
    $settingsPage = ob_get_contents();
    ob_end_clean();

    $settingsPage = apply_filters('wpdatatables_filter_support_page', $settingsPage);
    echo $settingsPage;

    do_action('wpdatatables_support_page');
}

/**
 * Render Welcome page
 */
function wdtWelcomePage()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/welcome_page/welcome_page.inc.php';
    $welcomePage = ob_get_contents();
    ob_end_clean();

    $settingsPage = apply_filters('wpdatatables_filter_welcome_page', $welcomePage);
    echo $welcomePage;

    do_action('wpdatatables_welcome_page');
}

/**
 * Render System Info page
 */
function wdtSystemInfo()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/system-info/system_info.inc.php';
    $settingsPage = ob_get_contents();
    ob_end_clean();

    $settingsPage = apply_filters('wpdatatables_filter_system_info_page', $settingsPage);
    echo $settingsPage;

    do_action('wpdatatables_system_info_page');
}

/**
 * Render Getting Started page
 */
function wdtGettingStarted()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/getting-started/getting_started.inc.php';
    $settingsPage = ob_get_contents();
    ob_end_clean();

    $settingsPage = apply_filters('wpdatatables_filter_getting_started_page', $settingsPage);
    echo $settingsPage;

    do_action('wpdatatables_getting_started_page');
}

/**
 * Render Lite VS Premium page
 */
function wdtLiteVSPremium()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/lite-vs-premium/lite_vs_premium.inc.php';
    $settingsPage = ob_get_contents();
    ob_end_clean();

    $settingsPage = apply_filters('wpdatatables_filter_lite_vs_premium_page', $settingsPage);
    echo $settingsPage;

    do_action('wpdatatables_lite_vs_premium_page');
}

/**
 * Render Addons page
 */
function wdtAddOns()
{
    if (!current_user_can('manage_options')) {
        wp_die(__('You do not have sufficient permissions to access this page.'));
    }

    ob_start();
    include WDT_ROOT_PATH . 'templates/admin/addons/addons.inc.php';
    $addonsPage = ob_get_contents();
    ob_end_clean();

    $addonsPage = apply_filters('wpdatatables_filter_addons_page', $addonsPage);
    echo $addonsPage;
}
