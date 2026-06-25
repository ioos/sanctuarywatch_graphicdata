<?php

defined('ABSPATH') or die("Cannot access pages directly.");

/**
 * Main wpDataTables functions
 * @package wpDataTables
 * @since 1.6.0
 */
?>
<?php

global $wp_version;


function wdtActivationInsertTemplates()
{
    WPDataTablesTemplates::importStandardSimpleTemplates();
}

/**
 * The installation/activation method, installs the plugin table
 */
function wdtActivationCreateTables()
{
    global $wpdb;

    $tablesTemplateTableName = $wpdb->prefix . 'wpdatatables_templates';
    $tablesTemplateSql = "CREATE TABLE {$tablesTemplateTableName} (
                        id bigint(20) NOT NULL AUTO_INCREMENT,
				table_type varchar(55) NULL,
				table_id bigint(20) NOT NULL,
                        data text NOT NULL,
                        content text NOT NULL,
                        settings text NOT NULL,
                        UNIQUE KEY id (id)
				) DEFAULT CHARSET=utf8 COLLATE utf8_general_ci";
    $tablesTableName = $wpdb->prefix . 'wpdatatables';
    $tablesSql = "CREATE TABLE {$tablesTableName} (
				id bigint(20) NOT NULL AUTO_INCREMENT,
				title varchar(255) NOT NULL,
                        show_title tinyint(1) NOT NULL default '1',
				table_type varchar(55) NOT NULL,
				file_location varchar(15) NOT NULL default '',
				content text NOT NULL,
				filtering tinyint(1) NOT NULL default '1',
				filtering_form tinyint(1) NOT NULL default '0',
				sorting tinyint(1) NOT NULL default '1',
				tools tinyint(1) NOT NULL default '1',
				server_side tinyint(1) NOT NULL default '0',
				editable tinyint(1) NOT NULL default '0',
				inline_editing tinyint(1) NOT NULL default '0',
				popover_tools tinyint(1) NOT NULL default '0',
				editor_roles varchar(255) NOT NULL default '',
				mysql_table_name varchar(255) NOT NULL default '',
                        edit_only_own_rows tinyint(1) NOT NULL default 0,
                        userid_column_id int( 11 ) NOT NULL default 0,
				display_length int(3) NOT NULL default '10',
                        auto_refresh int(3) NOT NULL default 0,
				fixed_columns tinyint(1) NOT NULL default '-1',
				fixed_layout tinyint(1) NOT NULL default '0',
				responsive tinyint(1) NOT NULL default '0',
				cache_source_data tinyint(1) NOT NULL default '0',
				auto_update_cache tinyint(1) NOT NULL default '0',
				scrollable tinyint(1) NOT NULL default '0',
				word_wrap tinyint(1) NOT NULL default '0',
				hide_before_load tinyint(1) NOT NULL default '0',
                        var1 VARCHAR( 255 ) NOT NULL default '',
                        var2 VARCHAR( 255 ) NOT NULL default '',
                        var3 VARCHAR( 255 ) NOT NULL default '',
                        tabletools_config VARCHAR( 255 ) NOT NULL default '',
				advanced_settings TEXT NOT NULL,
				UNIQUE KEY id (id)
				) DEFAULT CHARSET=utf8 COLLATE utf8_general_ci";

    $columnsTableName = $wpdb->prefix . 'wpdatatables_columns';
    $columnsSql = "CREATE TABLE {$columnsTableName} (
				id bigint(20) NOT NULL AUTO_INCREMENT,
				table_id bigint(20) NOT NULL,
				orig_header varchar(255) NOT NULL,
				display_header varchar(255) NOT NULL,
				filter_type enum('none','null_str','text','number','number-range','date-range','datetime-range','time-range','select','checkbox') NOT NULL,
				column_type enum('autodetect','string','int','float','date','link','email','image','formula','datetime','time') NOT NULL,
				input_type enum('none','text','textarea','mce-editor','date','datetime','time','link','email','selectbox','multi-selectbox','attachment') NOT NULL default 'text',
				input_mandatory tinyint(1) NOT NULL default '0',
                        id_column tinyint(1) NOT NULL default '0',
				group_column tinyint(1) NOT NULL default '0',
				sort_column tinyint(1) NOT NULL default '0',
				hide_on_phones tinyint(1) NOT NULL default '0',
				hide_on_tablets tinyint(1) NOT NULL default '0',
				visible tinyint(1) NOT NULL default '1',
				sum_column tinyint(1) NOT NULL default '0',
				skip_thousands_separator tinyint(1) NOT NULL default '0',
				width VARCHAR( 4 ) NOT NULL default '',
				possible_values TEXT NOT NULL,
				default_value VARCHAR(100) NOT NULL default '',
				css_class VARCHAR(255) NOT NULL default '',
				text_before VARCHAR(255) NOT NULL default '',
				text_after VARCHAR(255) NOT NULL default '',
                        formatting_rules TEXT NOT NULL,
                        calc_formula TEXT NOT NULL,
				color VARCHAR(255) NOT NULL default '',
				advanced_settings TEXT NOT NULL,
				pos int(11) NOT NULL default '0',
				UNIQUE KEY id (id)
				) DEFAULT CHARSET=utf8 COLLATE utf8_general_ci";
    $chartsTableName = $wpdb->prefix . 'wpdatacharts';
    $chartsSql = "CREATE TABLE {$chartsTableName} (
                                  id bigint(20) NOT NULL AUTO_INCREMENT,
                                  wpdatatable_id bigint(20) NOT NULL,
                                  title varchar(255) NOT NULL,
                                  engine enum('google','highcharts','chartjs') NOT NULL,
                                  type varchar(255) NOT NULL,
                                  json_render_data text NOT NULL,
                                  UNIQUE KEY id (id)
                                ) DEFAULT CHARSET=utf8 COLLATE utf8_general_ci";
    $rowsTableName = $wpdb->prefix . 'wpdatatables_rows';
    $rowsSql = "CREATE TABLE {$rowsTableName} (
                                  id bigint(20) NOT NULL AUTO_INCREMENT,
                                  table_id bigint(20) NOT NULL,
                                  data TEXT NOT NULL,
                                  UNIQUE KEY id (id)
                                ) DEFAULT CHARSET=utf8 COLLATE utf8_general_ci";
    $cacheTableName = $wpdb->prefix . 'wpdatatables_cache';
    $cacheSql = "CREATE TABLE {$cacheTableName} (
                                  id bigint(20) NOT NULL AUTO_INCREMENT,
                                  table_id bigint(20) NOT NULL,
                                  table_type varchar(55) NOT NULL default '',
                                  table_content text NOT NULL,
                                  auto_update tinyint(1) NOT NULL default 0,
                                  updated_time TIMESTAMP NOT NULL default CURRENT_TIMESTAMP,
                                  data LONGTEXT NOT NULL,
                                  log_errors text NOT NULL,
                                  UNIQUE KEY id (id)
                                ) DEFAULT CHARSET=utf8 COLLATE utf8_general_ci";
    require_once(ABSPATH . 'wp-admin/includes/upgrade.php');
    dbDelta($tablesSql);
    dbDelta($columnsSql);
    dbDelta($chartsSql);
    dbDelta($rowsSql);
    dbDelta($cacheSql);
    dbDelta($tablesTemplateSql);
    if (!get_option('wdtUseSeparateCon')) {
        update_option('wdtUseSeparateCon', false);
    }
    if (!get_option('wdtMySqlHost')) {
        update_option('wdtMySqlHost', '');
    }
    if (!get_option('wdtMySqlDB')) {
        update_option('wdtMySqlDB', '');
    }
    if (!get_option('wdtMySqlUser')) {
        update_option('wdtMySqlUser', '');
    }
    if (!get_option('wdtMySqlPwd')) {
        update_option('wdtMySqlPwd', '');
    }
    if (!get_option('wdtMySqlPort')) {
        update_option('wdtMySqlPort', '3306');
    }
    if (!get_option('wdtRenderCharts')) {
        update_option('wdtRenderCharts', 'below');
    }
    if (!get_option('wdtRenderFilter')) {
        update_option('wdtRenderFilter', 'footer');
    }
    if (!get_option('wdtRenderFilter')) {
        update_option('wdtTopOffset', '0');
    }
    if (!get_option('wdtLeftOffset')) {
        update_option('wdtLeftOffset', '0');
    }
    if (!get_option('wdtBaseSkin')) {
        update_option('wdtBaseSkin', 'skin1');
    }
    if (!get_option('wdtTimeFormat')) {
        update_option('wdtTimeFormat', 'h:i A');
    }
    if (!get_option('wdtTimeFormat')) {
        update_option('wdtTimeFormat', 'h:i A');
    }
    if (!get_option('wdtInterfaceLanguage')) {
        update_option('wdtInterfaceLanguage', '');
    }
    if (!get_option('wdtTablesPerPage')) {
        update_option('wdtTablesPerPage', 10);
    }
    if (!get_option('wdtNumberFormat')) {
        update_option('wdtNumberFormat', 1);
    }
    if (!get_option('wdtDecimalPlaces')) {
        update_option('wdtDecimalPlaces', 2);
    }
    if (!get_option('wdtCSVDelimiter')) {
        update_option('wdtCSVDelimiter', ',');
    }
    if (!get_option('wdtSortingOrderBrowseTables')) {
        update_option('wdtSortingOrderBrowseTables', 'ASC');
    }
    if (!get_option('wdtDateFormat')) {
        update_option('wdtDateFormat', 'd/m/Y');
    }
    if (get_option('wdtAutoUpdateOption') === false) {
        update_option('wdtAutoUpdateOption', 0);
    }
    if (!get_option('wdtAutoUpdateHash')) {
        update_option('wdtAutoUpdateHash', bin2hex(random_bytes(22)));
    }
    if (get_option('wdtParseShortcodes') === false) {
        update_option('wdtParseShortcodes', false);
    }
    if (get_option('wdtNumbersAlign') === false) {
        update_option('wdtNumbersAlign', true);
    }
    if (get_option('wdtBorderRemoval') === false) {
        update_option('wdtBorderRemoval', 0);
    }
    if (get_option('wdtBorderRemovalHeader') === false) {
        update_option('wdtBorderRemovalHeader', 0);
    }
    if (!get_option('wdtFontColorSettings')) {
        update_option('wdtFontColorSettings', '');
    }
    if (!get_option('wdtCustomJs')) {
        update_option('wdtCustomJs', '');
    }
    if (!get_option('wdtCustomCss')) {
        update_option('wdtCustomCss', '');
    }
    if (!get_option('wdtMinifiedJs')) {
        update_option('wdtMinifiedJs', true);
    }
    if (!get_option('wdtTabletWidth')) {
        update_option('wdtTabletWidth', 1024);
    }
    if (!get_option('wdtMobileWidth')) {
        update_option('wdtMobileWidth', 480);
    }
    if (!get_option('wdtPurchaseCode')) {
        update_option('wdtPurchaseCode', '');
    }
    if (get_option('wdtGettingStartedPageStatus') === false) {
        update_option('wdtGettingStartedPageStatus', 0);
    }

    if (get_option('wdtIncludeBootstrap') === false) {
        update_option('wdtIncludeBootstrap', true);
    }
    if (get_option('wdtIncludeBootstrapBackEnd') === false) {
        update_option('wdtIncludeBootstrapBackEnd', true);
    }
    if (get_option('wdtPreventDeletingTables') === false) {
        update_option('wdtPreventDeletingTables', true);
    }
    if (get_option('wdtSiteLink') === false) {
        update_option('wdtSiteLink', true);
    }
    if (get_option('wdtInstallDate') === false) {
        update_option('wdtInstallDate', date('Y-m-d'));
    }
    if (get_option('wdtRatingDiv') === false) {
        update_option('wdtRatingDiv', 'no');
    }
    if (get_option('wdtShowForminatorNotice') === false) {
        update_option('wdtShowForminatorNotice', 'yes');
    }
    if (get_option('wdtShowPromoNotice') === false) {
        delete_option('wdtShowPromoNotice');
    }
    if (get_option('wdtShowPromoDiscountNotice') === false) {
        update_option('wdtShowPromoDiscountNotice', 'yes');
    }
    if (get_option('wdtShowBundlesNotice') === false) {
        update_option('wdtShowBundlesNotice', 'yes');
    }
    if (get_option('wdtSimpleTableAlert') === false) {
        update_option('wdtSimpleTableAlert', true);
    }
    if (get_option('wdtTempFutureDate') === false) {
        update_option('wdtTempFutureDate', date('Y-m-d'));
    }
    if (get_option('wdtGoogleStableVersion') === false) {
        update_option('wdtGoogleStableVersion', 1);
    }
    if (!get_option('wdtActivationSimpleTableTemplates')) {
        update_option('wdtActivationSimpleTableTemplates', 'no');
    }
}

/**
 * Add rating massage on all admin pages after 2 weeks of using
 */
function wdtAdminRatingMessages()
{
    global $wpdb;
    $query = "SELECT COUNT(*) FROM {$wpdb->prefix}wpdatatables ORDER BY id";

    $allTables = $wpdb->get_var($query);
    $wpdtPage = isset($_GET['page']) ? $_GET['page'] : '';
    $installDate = get_option('wdtInstallDate');
    $currentDate = date('Y-m-d');
    $tempIgnoreDate = get_option('wdtTempFutureDate');

    $tempIgnore = strtotime($currentDate) >= strtotime($tempIgnoreDate) ? true : false;
    $datetimeInstallDate = new DateTime($installDate);
    $datetimeCurrentDate = new DateTime($currentDate);
    $diffIntrval = round(($datetimeCurrentDate->format('U') - $datetimeInstallDate->format('U')) / (60 * 60 * 24));
    if (is_admin() && strpos($wpdtPage, 'wpdatatables') !== false &&
        $diffIntrval >= 14 && get_option('wdtRatingDiv') == "no" && $tempIgnore && isset($allTables) && $allTables > 5) {
        include WDT_TEMPLATE_PATH . 'admin/common/ratingDiv.inc.php';
    }

    if (is_admin() && strpos($wpdtPage, 'wpdatatables') !== false &&
        get_option('wdtShowForminatorNotice') == "yes" && defined('FORMINATOR_PLUGIN_BASENAME')
        && !defined('WDT_FRF_ROOT_PATH')) {
        echo '<div class="notice notice-info is-dismissible wpdt-forminator-news-notice">
             <p class="wpdt-forminator-news"><strong style="color: #ff8c00">NEWS!</strong> wpDataTables just launched a new <strong style="color: #ff8c00">FREE</strong> addon - <strong style="color: #ff8c00">Forminator Forms integration for wpDataTables</strong>. You can download it and read more about it on wp.org on this <a class="wdt-forminator-link" href="https://wordpress.org/plugins/wpdatatables-forminator/" style="color: #ff8c00" target="_blank">link</a>.</p>
         </div>';
    }
//    //Notice bar for Lite promo
//    if( is_admin() && (strpos($wpdtPage,'wpdatatables-dashboard') !== false || strpos($wpdtPage,'wpdatatables-lite-vs-premium') !== false) &&
//        get_option( 'wdtShowPromoDiscountNotice' ) == "yes" ) {
//        include WDT_TEMPLATE_PATH . 'admin/common/promo.inc.php';
//	    wp_enqueue_style('wdt-promo-css', WDT_CSS_PATH . 'admin/promo.css');
//    }

    if (is_admin() && strpos($wpdtPage, 'wpdatatables') !== false && !($wpdtPage == 'wpdatatables-add-ons') &&
        get_option('wdtShowBundlesNotice') == "yes") {
        include WDT_TEMPLATE_PATH . 'admin/common/bundles_banner.inc.php';
        wp_enqueue_style('wdt-bundles-css', WDT_CSS_PATH . 'admin/bundles.css');
    }
}

add_action('admin_notices', 'wdtAdminRatingMessages');

/**
 * Remove rating message
 */
function wdtHideRating()
{
    update_option('wdtRatingDiv', 'yes');
    echo json_encode(array("success"));
    exit;
}

add_action('wp_ajax_wdtHideRating', 'wdtHideRating');

/**
 * Remove Forminator notice message
 */
function wdtRemoveForminatorNotice()
{
    update_option('wdtShowForminatorNotice', 'no');
    echo json_encode(array("success"));
    exit;
}

add_action('wp_ajax_wdt_remove_forminator_notice', 'wdtRemoveForminatorNotice');
/**
 * Remove Promo notice message
 */
function wdtRemovePromoNotice()
{
    update_option('wdtShowPromoDiscountNotice', 'no');
    echo json_encode(array("success"));
    exit;
}

add_action('wp_ajax_wdt_remove_promo_notice', 'wdtRemovePromoNotice');
/**
 * Remove Bundles notice message
 */
function wdtRemoveBundlesNotice()
{
    update_option('wdtShowBundlesNotice', 'no');
    echo json_encode(array("success"));
    exit;
}

add_action('wp_ajax_wdt_remove_bundles_notice', 'wdtRemoveBundlesNotice');

/**
 * Remove Simple Table alert message
 */
function wdtHideSimpleTableAlert()
{
    update_option('wdtSimpleTableAlert', false);
    echo json_encode(array("success"));
    exit;
}

add_action('wp_ajax_wdtHideSimpleTableAlert', 'wdtHideSimpleTableAlert');

/**
 * Temperary hide rating message for 7 days
 */
function wpdtTempHideRatingDiv()
{
    $date = strtotime("+7 day");
    update_option('wdtTempFutureDate', date('Y-m-d', $date));
    echo json_encode(array("success"));
    exit;
}

add_action('wp_ajax_wdtTempHideRating', 'wpdtTempHideRatingDiv');

function wdtDeactivation()
{

}

/**
 * Table and option deleting upon plugin deleting
 */
function wdtUninstallDelete()
{
    global $wpdb;
    if (get_option('wdtPreventDeletingTables') == false) {
        delete_option('wdtUseSeparateCon');
        delete_option('wdtTimepickerRange');
        delete_option('wdtTimeFormat');
        delete_option('wdtTabletWidth');
        delete_option('wdtTablesPerPage');
        delete_option('wdtSumFunctionsLabel');
        delete_option('wdtRenderFilter');
        delete_option('wdtRenderCharts');
        delete_option('wdtPurchaseCode');
        delete_option('wdtGettingStartedPageStatus');
        delete_option('wdtIncludeBootstrap');
        delete_option('wdtIncludeBootstrapBackEnd');
        delete_option('wdtPreventDeletingTables');
        delete_option('wdtParseShortcodes');
        delete_option('wdtNumbersAlign');
        delete_option('wdtNumberFormat');
        delete_option('wdtMySqlUser');
        delete_option('wdtMySqlPwd');
        delete_option('wdtMySqlPort');
        delete_option('wdtMySqlHost');
        delete_option('wdtMySqlDB');
        delete_option('wdtMobileWidth');
        delete_option('wdtMinifiedJs');
        delete_option('wdtMinFunctionsLabel');
        delete_option('wdtMaxFunctionsLabel');
        delete_option('wdtLeftOffset');
        delete_option('wdtTopOffset');
        delete_option('wdtInterfaceLanguage');
        delete_option('wdtGeneratedTablesCount');
        delete_option('wdtFontColorSettings');
        delete_option('wdtDecimalPlaces');
        delete_option('wdtCSVDelimiter');
        delete_option('wdtSortingOrderBrowseTables');
        delete_option('wdtDateFormat');
        delete_option('wdtAutoUpdateOption');
        delete_option('wdtAutoUpdateHash');
        delete_option('wdtCustomJs');
        delete_option('wdtCustomCss');
        delete_option('wdtBaseSkin');
        delete_option('wdtAvgFunctionsLabel');
        delete_option('wdtInstallDate');
        delete_option('wdtRatingDiv');
        delete_option('wdtShowForminatorNotice');
        delete_option('wdtShowPromoNotice');
        delete_option('wdtShowPromoDiscountNotice');
        delete_option('wdtShowBundlesNotice');
        delete_option('wdtSimpleTableAlert');
        delete_option('wdtTempFutureDate');
        delete_option('wdtVersion');
        delete_option('wdtBorderRemoval');
        delete_option('wdtBorderRemovalHeader');
        delete_option('wdtGoogleStableVersion');
        delete_option('wdtActivationSimpleTableTemplates');
        delete_option('wdtSiteLink');

        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wpdatatables");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wpdatatables_columns");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wpdatacharts");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wpdatatables_rows");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wpdatatables_cache");
        $wpdb->query("DROP TABLE IF EXISTS {$wpdb->prefix}wpdatatables_templates");
    }
}

/**
 * Activation hook
 * @param $networkWide
 */
function wdtActivation($networkWide)
{
    global $wpdb;

    if (function_exists('is_multisite') && is_multisite()) {
        //check if it is network activation if so run the activation function for each id
        if ($networkWide) {
            $oldBlog = $wpdb->blogid;
            //Get all blog ids
            $blogIds = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");

            foreach ($blogIds as $blogId) {
                switch_to_blog($blogId);
                //Create database table if not exists
                wdtActivationCreateTables();
                //Insert standard templates if not exists
                $tableName = $wpdb->prefix . 'wpdatatables_templates';
                $rowCount = $wpdb->get_var("SELECT COUNT(*) FROM {$tableName}");
                wdtCheckSimpleTemplatesActivation($rowCount, $tableName);
            }
            switch_to_blog($oldBlog);

            return;
        }
    }
    //Create database table if not exists
    wdtActivationCreateTables();
    //Insert standard templates if not exists
    $tableName = $wpdb->prefix . 'wpdatatables_templates';
    $rowCount = $wpdb->get_var("SELECT COUNT(*) FROM {$tableName}");
    wdtCheckSimpleTemplatesActivation($rowCount, $tableName);
}

function wdtCheckSimpleTemplatesActivation($rowCount, $tableName)
{
    global $wpdb;
    if (get_option('wdtActivationSimpleTableTemplates') !== 'yes') {
        if ((int)$rowCount !== 0) {
            $wpdb->query("TRUNCATE TABLE {$tableName}");
        }
        wdtActivationInsertTemplates();
        update_option('wdtActivationSimpleTableTemplates', 'yes');
    }
}

/**
 * Uninstall hook
 */
function wdtUninstall()
{
    if (function_exists('is_multisite') && is_multisite()) {
        global $wpdb;
        $oldBlog = $wpdb->blogid;
        //Get all blog ids
        $blogIds = $wpdb->get_col("SELECT blog_id FROM $wpdb->blogs");
        foreach ($blogIds as $blogId) {
            switch_to_blog($blogId);
            wdtUninstallDelete();
        }
        switch_to_blog($oldBlog);
    } else {
        wdtUninstallDelete();
    }
}

/**
 * Create tables on every new site (multisite)
 * @param $blogId
 */
function wdtOnCreateSiteOnMultisiteNetwork($blogId)
{
    global $wpdb;
    if (is_plugin_active_for_network('wpdatatables/wpdatatables.php')) {
        switch_to_blog($blogId);
        wdtActivationCreateTables();
        //Insert standard templates if not exists
        $tableName = $wpdb->prefix . 'wpdatatables_templates';
        $rowCount = $wpdb->get_var("SELECT COUNT(*) FROM {$tableName}");
        wdtCheckSimpleTemplatesActivation($rowCount, $tableName);
        restore_current_blog();
    }
}

add_action('wpmu_new_blog', 'wdtOnCreateSiteOnMultisiteNetwork');

/**
 * Delete table on site delete (multisite)
 * @param $tables
 * @return array
 */
function wdtOnDeleteSiteOnMultisiteNetwork($tables)
{
    global $wpdb;
    $tables[] = $wpdb->prefix . 'wpdatatables';
    $tables[] = $wpdb->prefix . 'wpdatatables_columns';
    $tables[] = $wpdb->prefix . 'wpdatacharts';
    $tables[] = $wpdb->prefix . 'wpdatatables_rows';
    $tables[] = $wpdb->prefix . 'wpdatatables_cache';
    $tables[] = $wpdb->prefix . 'wpdatatables_templates';

    return $tables;
}

add_filter('wpmu_drop_tables', 'wdtOnDeleteSiteOnMultisiteNetwork');

function wdtAddBodyClass($classes)
{

    $classes .= ' wpdt-c';

    return $classes;
}

// Make sure we don't expose any info if called directly
if (!function_exists('add_action')) {
    echo "Hi there!  I'm just a plugin, not much I can do when called directly.";
    exit;
}

/**
 * Helper func that prints out the table
 * @param $id
 */
function wdtOutputTable($id)
{
    echo wdtWpDataTableShortcodeHandler(array('id' => $id));
}

/**
 * Handler for the chart shortcode
 * @param $atts
 * @param null $content
 * @return bool|string
 */
function wdtWpDataChartShortcodeHandler($atts, $content = null)
{
    extract(shortcode_atts(array(
        'id' => '0'
    ), $atts));

    $id = absint($id);

    if (is_admin() && defined('AVADA_VERSION') && is_plugin_active('fusion-builder/fusion-builder.php') &&
        class_exists('Fusion_Element') && class_exists('WPDataTables_Fusion_Elements') &&
        isset($_POST['action']) && $_POST['action'] === 'get_shortcode_render') {
        return WPDataTables_Fusion_Elements::get_content_for_avada_live_builder($atts, 'chart');
    }

    /** @var mixed $id */
    if (!$id) {
        return false;
    }

    // Check permissions - user must have access to view this chart
    if (!WDTPermissionsEnforcer::canUserViewChart($id)) {
        return esc_html__('You do not have permission to view this chart.', 'wpdatatables');
    }

    try {
        $dbChartData = WPDataChart::getChartDataById($id);
        if (!$dbChartData) {
            return esc_html__('wpDataChart with provided ID not found!', 'wpdatatables');
        }
        $chartData = [
            'id' => $id,
            'engine' => $dbChartData->engine
        ];
        $wpDataChart = WPDataChart::build($chartData, true);
        $chartExists = $wpDataChart->getwpDataTableId();
        if (empty($chartExists)) {
            return esc_html__('wpDataChart with provided ID not found!', 'wpdatatables');
        }

        do_action('wpdatatables_before_render_chart', $wpDataChart->getId());

        return $wpDataChart->render();
    } catch (Exception $e) {
        return esc_html__('There was an issue displaying the chart. Please edit the chart in the admin area for more details.');
    }
}

/**
 * Handler for the table cell shortcode
 * @param $atts
 * @param null $content
 * @return mixed|string
 * @throws Exception
 */
function wdtWpDataTableCellShortcodeHandler($atts, $content = null)
{
    global $wpdb;
    extract(shortcode_atts(array(
        'table_id' => '0',
        'row_id' => '0',
        'column_key' => '%%no_val%%',
        'column_id' => '%%no_val%%',
        'column_id_value' => '%%no_val%%',
        'sort' => '1'
    ), $atts));

    $table_id = absint($table_id);
    $row_id = absint($row_id);
    $sort = absint($sort);

    if (!$table_id)
        return esc_html__('wpDataTable with provided ID not found!', 'wpdatatables');

    // Check permissions - user must have access to view this table cell content
    if (!WDTPermissionsEnforcer::canUserViewTable($table_id)) {
        return esc_html__('You do not have permission to view this content.', 'wpdatatables');
    }

    /** @var int $row_id */
    $rowID = !$row_id ? 0 : $row_id;

    /** @var int $sort */
    $includeSort = $sort == 1;

    /** @var mixed $column_key */
    $columnKey = $column_key !== '%%no_val%%' ? $column_key : '';

    /** @var mixed $column_id */
    $columnID = $column_id !== '%%no_val%%' ? $column_id : '';

    /** @var mixed $column_id_value */
    $columnIDValue = $column_id_value !== '%%no_val%%' ? $column_id_value : '';

    $rowID = apply_filters('wpdatatables_cell_filter_row_id', $rowID, $columnKey, $columnID, $columnIDValue, $table_id);
    $columnKey = apply_filters('wpdatatables_cell_filter_column_key', $columnKey, $rowID, $columnID, $columnIDValue, $table_id);
    $columnID = apply_filters('wpdatatables_cell_filter_column_id', $columnID, $columnKey, $rowID, $columnIDValue, $table_id);
    $columnIDValue = apply_filters('wpdatatables_cell_filter_column_id_value', $columnIDValue, $columnKey, $rowID, $columnID, $table_id);

    if ($columnKey == '')
        return esc_html__('Column key for provided table ID not found!', 'wpdatatables');

    $tableData = WDTConfigController::loadTableFromDB($table_id, false);

    if (empty($tableData->content))
        return esc_html__('wpDataTable with provided ID not found!', 'wpdatatables');

    if ($tableData->table_type === 'simple') {

        if ($columnIDValue != '' || $columnID != '')
            return esc_html__('For getting cell value from simple table, column_id and column_id_value are not supported. Please use row_id.', 'wpdatatables');

        if ($rowID == 0)
            return esc_html__('Row ID for provided table ID not found!', 'wpdatatables');

        try {
            $wpDataTableRows = WPDataTableRows::loadWpDataTableRows($table_id);
            $rowsData = $wpDataTableRows->getRowsData();
            $columnHeaders = array_flip($wpDataTableRows->getColHeaders());
            $columnKey = strtoupper($columnKey);
            if (isset($columnHeaders[$columnKey])) {
                $rowID = $rowID - 1;
                if (isset($rowsData[$rowID])) {
                    $columnKey = $columnHeaders[$columnKey];
                    $cellMetaClasses = array_unique($wpDataTableRows->getCellClassesByIndexes($rowsData, $rowID, $columnKey));
                    $cellValue = $wpDataTableRows->getCellDataByIndexes($rowsData, $rowID, $columnKey);
                    $cellValue = apply_filters('wpdatatables_cell_value_filter', $cellValue, $columnKey, $rowID, $columnID, $columnIDValue, $table_id);
                    $cellValueOutput = WPDataTableRows::prepareCellDataOutput($cellValue, $cellMetaClasses, $rowID, $columnKey, $table_id);
                } else {
                    return esc_html__('Row ID for provided table ID not found!', 'wpdatatables');
                }
            } else {
                return esc_html__('Column key for provided table ID not found!', 'wpdatatables');
            }
        } catch (Exception $e) {
            return ltrim($e->getMessage(), '<br/><br/>');
        }
    } else {
        try {
            $wpDataTable = WPDataTable::loadWpDataTable($table_id);

            if (!isset($wpDataTable->getWdtColumnTypes()[$columnKey]))
                return esc_html__('Column key for provided table ID not found!', 'wpdatatables');

            if ($columnIDValue != '' || $columnID != '') {
                if ($columnID == '')
                    return esc_html__('Column ID for provided table ID not found!', 'wpdatatables');

                if ($columnIDValue == '')
                    return esc_html__('Column ID value for provided table ID not found!', 'wpdatatables');

                if (!isset($wpDataTable->getWdtColumnTypes()[$columnID]))
                    return esc_html__('Column ID for provided table ID not found!', 'wpdatatables');

                if (in_array($wpDataTable->getWdtColumnTypes()[$columnID], ['date', 'datetime', 'time', 'float']))
                    return esc_html__('At the moment float, date, datetime and time columns can not be used as column_id. Please use other column that contains unique identifiers.', 'wpdatatables');

                if ($columnKey == $columnID)
                    return esc_html__('Column Key an Column ID can not be the same!', 'wpdatatables');
            }

            $isTableSortable = $wpDataTable->sortEnabled();
            if ($includeSort && $isTableSortable) {
                $sortDirection = $wpDataTable->getDefaultSortDirection();
                if ($wpDataTable->getDefaultSortColumn()) {
                    $sortColumn = $wpDataTable->getColumns()[$wpDataTable->getDefaultSortColumn()]->getOriginalHeader();
                    $columnType = $wpDataTable->getColumns()[$wpDataTable->getDefaultSortColumn()]->getDataType();
                } else {
                    $sortColumn = $wpDataTable->getColumns()[0]->getOriginalheader();
                    $columnType = $wpDataTable->getColumns()[0]->getDataType();
                }
            }

            $dataRows = $wpDataTable->getDataRows();
            if ($dataRows == [])
                return esc_html__('Table do not have data for provided table ID!', 'wpdatatables');
            if ($includeSort && $isTableSortable) {
                $sortDirection = $sortDirection == 'ASC' ? SORT_ASC : SORT_DESC;
                $sortingType = in_array($columnType, array('float', 'int')) ? SORT_NUMERIC : SORT_REGULAR;
                array_multisort(
                    array_column($dataRows, $sortColumn),
                    $sortDirection,
                    $sortingType,
                    $dataRows
                );
            }

            $dataRows = apply_filters('wpdatatables_cell_data_rows_filter', $dataRows, $columnKey, $rowID, $columnID, $columnIDValue, $table_id);

            if ($columnIDValue != '' || $columnID != '') {
                $filteredData = array_filter($dataRows, function ($item) use ($columnIDValue, $columnID) {
                    if ($item[$columnID] == $columnIDValue) {
                        return true;
                    }
                    return false;
                });
                if ($filteredData == [])
                    return esc_html__('Column ID value for provided table ID not found!', 'wpdatatables');
                $dataRows = array_values($filteredData);
                $dataRows = apply_filters('wpdatatables_cell_filtered_data_rows_filter', $dataRows, $columnKey, $rowID, $columnID, $columnIDValue, $table_id);
                $cellValue = $dataRows[0][$columnKey];
            } else {
                if ($tableData->table_type == 'forminator') {
                    $entryIdName = 'entryid';
                    if (!isset($dataRows[0][$entryIdName]))
                        return esc_html__('Entry ID not found! Please provide existing entry id from form.', 'wpdatatables');
                    $rowID = str_replace(array('.', ','), '', $rowID);
                    $filteredData = array_filter($dataRows, function ($item) use ($rowID, $entryIdName) {
                        if ($item[$entryIdName] == $rowID) {
                            return true;
                        }
                        return false;
                    });
                    if ($filteredData == [])
                        return esc_html__('Entry ID value for provided table ID not found!', 'wpdatatables');
                    $dataRows = array_values($filteredData);
                    $dataRows = apply_filters('wpdatatables_cell_filtered_data_rows_filter', $dataRows, $columnKey, $rowID, $columnID, $columnIDValue, $table_id);
                    $cellValue = $dataRows[0][$columnKey];
                } else {
                    $rowID = $rowID != 0 ? $rowID - 1 : 0;
                    $wpDataTable->setDataRows($dataRows);
                    $cellValue = $wpDataTable->getCell($columnKey, $rowID);
                }

            }

            $cellValue = apply_filters('wpdatatables_cell_value_filter', $cellValue, $columnKey, $rowID, $columnID, $columnIDValue, $table_id);
            $cellValueOutput = $wpDataTable->getColumn($columnKey)->prepareCellOutput($cellValue);
        } catch (Exception $e) {
            return ltrim($e->getMessage(), '<br/><br/>');
        }
    }

    return apply_filters('wpdatatables_cell_output_filter', $cellValueOutput, $cellValue, $columnKey, $rowID, $columnID, $columnIDValue, $table_id);
}

/**
 * Handler for the table shortcode
 * @param $atts
 * @param null $content
 * @return mixed|string
 */
function wdtWpDataTableShortcodeHandler($atts, $content = null)
{
    global $wdtVar1, $wdtVar2, $wdtVar3, $wdtExportFileName;

    extract(shortcode_atts(array(
        'id' => '0',
        'var1' => '%%no_val%%',
        'var2' => '%%no_val%%',
        'var3' => '%%no_val%%',
        'export_file_name' => '%%no_val%%',
        'table_view' => 'regular'
    ), $atts));

    $id = absint($id);

    if (is_admin() && defined('AVADA_VERSION') && is_plugin_active('fusion-builder/fusion-builder.php') &&
        class_exists('Fusion_Element') && class_exists('WPDataTables_Fusion_Elements') &&
        isset($_POST['action']) && $_POST['action'] === 'get_shortcode_render') {
        return WPDataTables_Fusion_Elements::get_content_for_avada_live_builder($atts, 'table');
    }

    if (!$id) {
        return false;
    }

    // Check permissions - user must have access to view this table
    if (!WDTPermissionsEnforcer::canUserViewTable($id)) {
        return esc_html__('You do not have permission to view this table.', 'wpdatatables');
    }

    do_action('wpdatatables_before_render_table_config_data', $id);

    $tableData = WDTConfigController::loadTableFromDB($id);
    if (empty($tableData->content)) {
        return esc_html__('wpDataTable with provided ID not found!', 'wpdatatables');
    }

    do_action('wpdatatables_before_render_table', $id);

    /** @var mixed $var1 */
    $wdtVar1 = $var1 !== '%%no_val%%' ? $var1 : $tableData->var1;
    /** @var mixed $var2 */
    $wdtVar2 = $var2 !== '%%no_val%%' ? $var2 : $tableData->var2;
    /** @var mixed $var3 */
    $wdtVar3 = $var3 !== '%%no_val%%' ? $var3 : $tableData->var3;

    /** @var mixed $export_file_name */
    $wdtExportFileName = $export_file_name !== '%%no_val%%' ? $export_file_name : '';

    if ($tableData->table_type === 'simple') {
        try {
            $wpDataTableRows = WPDataTableRows::loadWpDataTableRows($id);
            $output = $wpDataTableRows->generateTable($id);
        } catch (Exception $e) {
            $output = ltrim($e->getMessage(), '<br/><br/>');
        }
    } else {

        $wpDataTable = new WPDataTable();

        $wpDataTable->setWpId($id);

        $columnDataPrepared = $wpDataTable->prepareColumnData($tableData);

        try {
            $wpDataTable->fillFromData($tableData, $columnDataPrepared);
            $wpDataTable = apply_filters('wpdatatables_filter_initial_table_construct', $wpDataTable);

            $output = '';
            if ($tableData->show_title && $tableData->title) {
                $output .= apply_filters('wpdatatables_filter_table_title', (empty($tableData->title) ? '' : '<h3 class="wpdt-c" id="wdt-table-title-' . $id . '">' . $tableData->title . '</h3>'), $id);
            }
            if ($tableData->show_table_description && $tableData->table_description) {
                $output .= apply_filters('wpdatatables_filter_table_description_text', (empty($tableData->table_description) ? '' : '<p class="wpdt-c" id="wdt-table-description-' . $id . '">' . $tableData->table_description . '</p>'), $id);
            }
            $output .= $wpDataTable->generateTable();
        } catch (Exception $e) {
            $output = WDTTools::wdtShowError($e->getMessage());
        }
    }
    $output = apply_filters('wpdatatables_filter_rendered_table', $output, $id);

    return $output;
}


function wdtRenderScriptStyleBlock($tableID)
{
    $customJs = get_option('wdtCustomJs');
    $scriptBlockHtml = '';
    $styleBlockHtml = '';
    $wpDataTable = WDTConfigController::loadTableFromDB($tableID, false);

    if ($customJs) {
        $scriptBlockHtml .= '<script type="text/javascript">' . stripslashes_deep(html_entity_decode($customJs)) . '</script>';
    }
    $returnHtml = $scriptBlockHtml;

    // Color and font settings
    $wdtFontColorSettings = get_option('wdtFontColorSettings');
    if (!empty($wdtFontColorSettings)) {
        ob_start();
        include WDT_TEMPLATE_PATH . 'frontend/style_block.inc.php';
        $styleBlockHtml = ob_get_contents();
        ob_end_clean();
        $styleBlockHtml = apply_filters('wpdatatables_filter_style_block', $styleBlockHtml, $wpDataTable->id);
    }

    $returnHtml .= $styleBlockHtml;
    return $returnHtml;
}

function wdt_sanitize_multi_upload($fields)
{
    return array_map(function ($field) {
        return array_map('sanitize_file_name', $field);
    }, $fields);
}

function wdt_get_super_global_value($super_global, $key)
{
    if (!isset($super_global[$key])) {
        return null;
    }

    if ($_FILES === $super_global) {
        return isset($super_global[$key]['name']) ?
            sanitize_file_name($super_global[$key]) :
            wdt_sanitize_multi_upload($super_global[$key]);
    }

    return wp_kses_post_deep(wp_unslash($super_global[$key]));
}

function wdtSaveDeactivationinfo()
{
    if (!is_admin() || !wp_verify_nonce($_POST['wdtNonce'], 'wdtDeactivationNonce')) {
        wp_send_json_error();
    }

    if (!current_user_can('activate_plugins')) {
        wp_send_json_error();
    }

    $reason = wdt_get_super_global_value($_POST, 'choice') ?? '';
    $reason_caption = wdt_get_super_global_value($_POST, "textareaDescription") ?? '';

    $reason = sanitize_key($reason);
    $reason_caption = sanitize_textarea_field($reason_caption);

    WPDataTablesFeedback::wdtSendFeedback($reason, $reason_caption);

    wp_send_json_success();
}

add_action('wp_ajax_wdtSaveDeactivationinfo', 'wdtSaveDeactivationinfo');

function wdtEnqueueDeactivationModal()
{
    if ((strpos($_SERVER['REQUEST_URI'], 'plugins.php') !== false)) {
        wp_enqueue_script('wdt-deactivate-info-js', WDT_ROOT_URL . 'assets/js/deactivation/deactivation-modal.js', array(), WDT_CURRENT_VERSION, true);
        wp_localize_script('wdt-deactivate-info-js', 'wpdatatables_deactivate_info', WDTTools::getDeactivationInfo());
    }
}

add_action('admin_enqueue_scripts', 'wdtEnqueueDeactivationModal');

/**
 * Checks if current user can edit table on the front-end
 * @param $tableEditorRoles
 * @param $id
 * @return bool|mixed
 */
function wdtCurrentUserCanEdit($tableEditorRoles, $id)
{
    $wpRoles = new WP_Roles();
    $userCanEdit = false;

    $tableEditorRoles = strtolower($tableEditorRoles);
    $editorRoles = array();

    if (empty($tableEditorRoles)) {
        $userCanEdit = true;
    } else {
        $editorRoles = explode(',', $tableEditorRoles);

        $allRoles = $wpRoles->get_names();

        $currentUser = wp_get_current_user();
        if (!($currentUser instanceof WP_User)) {
            return false;
        }

        foreach ($currentUser->roles as $userRole) {
            if (in_array(strtolower($allRoles[$userRole]), $editorRoles)) {
                $userCanEdit = true;
                break;
            }
        }
    }

    return apply_filters('wpdatatables_allow_edit_table', $userCanEdit, $editorRoles, $id);
}

/**
 * Removes all dangerous strings from query
 * @param $query
 * @return mixed|string
 */
function wdtSanitizeQuery($query)
{
    $query = str_replace('DELETE', '', $query);
    $query = str_replace('DROP', '', $query);
    $query = str_replace('INSERT', '', $query);
    $query = stripslashes($query);

    return $query;
}

/**
 * Buttons for "insert wpDataTable" and "insert wpDataCharts" in WP MCE editor
 */
function wdtMCEButtons()
{
    add_filter("mce_external_plugins", "wdtAddButtons");
    add_filter('mce_buttons', 'wdtRegisterButtons');
}

add_action('init', 'wdtMCEButtons');

/**
 * Function that add buttons for MCE editor
 * @param $pluginArray
 * @return mixed
 */
function wdtAddButtons($pluginArray)
{
    $pluginArray['wpdatatables'] = WDT_JS_PATH . '/wpdatatables/wdt.mce.js';

    return $pluginArray;
}

/**
 * Function that register buttons for MCE editor
 * @param $buttons
 * @return mixed
 */
function wdtRegisterButtons($buttons)
{
    $buttons[] = 'wpdatatable';
    $buttons[] = 'wpdatachart';

    return $buttons;
}

/**
 * Loads the translations
 */
function wdtLoadTextdomain()
{
    WDTGutenbergBlocks::getInstance();

    load_plugin_textdomain('wpdatatables', false, dirname(plugin_basename(dirname(__FILE__))) . '/languages/' . get_locale() . '/');
}

/**
 * Redirect on Welcome page after activate plugin
 */
function welcome_page_activation_redirect($plugin)
{
    $filePath = plugin_basename(__FILE__);
    $filePathArr = explode('/', $filePath);
    $wdtPluginSlug = $filePathArr[0] . '/wpdatatables.php';

    if ($plugin == plugin_basename($wdtPluginSlug) && (isset($_GET['action']) && $_GET['action'] == 'activate')) {
        exit(wp_redirect(admin_url('admin.php?page=wpdatatables-welcome-page')));
    }
}

add_action('activated_plugin', 'welcome_page_activation_redirect');

/**
 * Workaround for NULLs in WP
 */
if ($wp_version < 4.4) {
    add_filter('query', 'wdtSupportNulls');

    function wdtSupportNulls($query)
    {
        $query = str_ireplace("'NULL'", "NULL", $query);
        $query = str_replace('null_str', 'null', $query);

        return $query;
    }
}

/**
 *  Add plugin action links Plugins page
 */
function wpdt_add_plugin_action_links($links)
{

    // Settings link.
    $settings_links = '<a href="' . admin_url('admin.php?page=wpdatatables-settings') . '" aria-label="' . esc_attr(__('Go to Settings', 'wpdatatables')) . '">' . esc_html__('Settings', 'wpdatatables') . '</a>';

    array_unshift($links, $settings_links);

    // Go Premium link.
    $links['go_premium'] = '<a href="' . esc_url('https://wpdatatables.com/pricing/?utm_source=lite&utm_medium=plugin&utm_campaign=wpdtlite') . '" aria-label="' . esc_attr(__('Go Premium', 'wpdatatables')) . '" style="color: #ff8c00;font-weight:700" target="_blank">' . esc_html__('Go Premium', 'wpdatatables') . '</a>';

    return $links;
}

add_filter('plugin_action_links_' . WDT_BASENAME, 'wpdt_add_plugin_action_links');

/**
 *  Add links next to plugin details on Plugins page
 */
function wpdt_plugin_row_meta($links, $file, $plugin_data)
{

    if (WDT_BASENAME === $file) {
        // Show network meta links only when activated network wide.
        if (is_network_admin()) {
            return $links;
        }

        // Change AuthorURI link.
        if (isset($links[1])) {
            $author_uri = sprintf(
                '<a href="%s" target="_blank">%s</a>',
                $plugin_data['AuthorURI'],
                $plugin_data['Author']
            );
            $links[1] = sprintf(__('By %s'), $author_uri);
        }

        // Documentation link.
        $row_meta['docs'] = '<a href="' . esc_url('https://wpdatatables.com/documentation/general/features-overview/') . '" aria-label="' . esc_attr(__('Docs', 'wpdatatables')) . '" target="_blank">' . esc_html__('Docs', 'wpdatatables') . '</a>';

        // Add Support Center page link
        $row_meta['support'] = '<a href="' . admin_url('admin.php?page=wpdatatables-support') . '" aria-label="' . esc_attr__('Support Center', 'wpdatatables') . '" target="_blank">' . esc_html__('Support Center', 'wpdatatables') . '</a>';

        return array_merge($links, $row_meta);
    }

    return $links;

}

add_filter('plugin_row_meta', 'wpdt_plugin_row_meta', 10, 3);
