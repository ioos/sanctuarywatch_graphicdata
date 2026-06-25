<?php

defined('ABSPATH') or die("Cannot access pages directly.");



/**
 * Method to save the config for the table and columns
 */
function wdtSaveTableWithColumns() {

    if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtEditNonce')) {
        exit();
    }

    $table = apply_filters(
        'wpdatatables_before_save_table',
        json_decode(
            stripslashes_deep($_POST['table'])
        )
    );

    WDTConfigController::saveTableConfig($table);
}

add_action('wp_ajax_wpdatatables_save_table_config', 'wdtSaveTableWithColumns');

/**
 * Save plugin settings
 */
function wdtSavePluginSettings() {

    if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtSettingsNonce')) {
        exit();
    }

    WDTSettingsController::saveSettings(apply_filters('wpdatatables_before_save_settings', $_POST['settings']));
    exit();
}

add_action('wp_ajax_wpdatatables_save_plugin_settings', 'wdtSavePluginSettings');

/**
 * Duplicate the table
 */
function wdtDuplicateTable() {
    global $wpdb;

    if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtDuplicateTableNonce')) {
        exit();
    }

    $tableId = (int)$_POST['table_id'];
    if (empty($tableId)) {
        return false;
    }
    $manualDuplicateInput = (int)$_POST['manual_duplicate_input'];
    $newTableName = sanitize_text_field($_POST['new_table_name']);

    // Getting the table data
    $tableData = WDTConfigController::loadTableFromDB($tableId);
    $mySqlTableName = $tableData->mysql_table_name;
    $content = $tableData->content;

    if ($tableData->table_type != 'simple') {

        // Create duplicate version of input table if checkbox is selected
        if ($manualDuplicateInput) {

            // Generating new input table name
            $cnt = 1;
            $newNameGenerated = false;
            while (!$newNameGenerated) {
                $newName = $tableData->mysql_table_name . '_' . $cnt;
                $checkTableQuery = "SHOW TABLES LIKE '{$newName}'";
                if (!get_option('wdtUseSeparateCon')) {
                    $res = $wpdb->get_results($checkTableQuery);
                } else {
                    $sql = new PDTSql(WDT_MYSQL_HOST, WDT_MYSQL_DB, WDT_MYSQL_USER, WDT_MYSQL_PASSWORD, WDT_MYSQL_PORT);
                    $res = $sql->getRow($checkTableQuery);
                }
                if (!empty($res)) {
                    $cnt++;
                } else {
                    $newNameGenerated = true;
                }
            }

            // Input table queries
            $query1 = "CREATE TABLE {$newName} LIKE {$tableData->mysql_table_name};";
            $query2 = "INSERT INTO {$newName} SELECT * FROM {$tableData->mysql_table_name};";

            if (!get_option('wdtUseSeparateCon')) {
                $wpdb->query($query1);
                $wpdb->query($query2);
            } else {
                $sql->doQuery($query1);
                $sql->doQuery($query2);
            }
            $mySqlTableName = $newName;
            $content = str_replace($tableData->mysql_table_name, $newName, $tableData->content);
        }
    }

    // Creating new table
    $wpdb->insert(
        $wpdb->prefix . 'wpdatatables',
        array(
            'title' => $newTableName,
            'show_title' => $tableData->show_title,
            'table_type' => $tableData->table_type,
            'file_location' => $tableData->file_location,
            'content' => $content,
            'filtering' => $tableData->filtering,
            'filtering_form' => $tableData->filtering_form,
            'sorting' => $tableData->sorting,
            'cache_source_data' => $tableData->cache_source_data,
            'auto_update_cache' => $tableData->auto_update_cache,
            'tools' => $tableData->tools,
            'server_side' => $tableData->server_side,
            'editable' => $tableData->editable,
            'inline_editing' => $tableData->inline_editing,
            'popover_tools' => $tableData->popover_tools,
            'editor_roles' => $tableData->editor_roles,
            'mysql_table_name' => $mySqlTableName,
            'edit_only_own_rows' => $tableData->edit_only_own_rows,
            'userid_column_id' => $tableData->userid_column_id,
            'display_length' => $tableData->display_length,
            'auto_refresh' => $tableData->auto_refresh,
            'fixed_columns' => $tableData->fixed_columns,
            'fixed_layout' => $tableData->fixed_layout,
            'responsive' => $tableData->responsive,
            'scrollable' => $tableData->scrollable,
            'word_wrap' => $tableData->word_wrap,
            'hide_before_load' => $tableData->hide_before_load,
            'var1' => $tableData->var1,
            'var2' => $tableData->var2,
            'var3' => $tableData->var3,
            'tabletools_config' => serialize($tableData->tabletools_config),
            'advanced_settings' => $tableData->advanced_settings
        )
    );

    $newTableId = $wpdb->insert_id;

    if ($tableData->table_type != 'simple') {

        // Getting the column data
        $columns = WDTConfigController::loadColumnsFromDB($tableId);

        // Creating new columns
        foreach ($columns as $column) {
            $wpdb->insert(
                $wpdb->prefix . 'wpdatatables_columns',
                array(
                    'table_id' => $newTableId,
                    'orig_header' => $column->orig_header,
                    'display_header' => $column->display_header,
                    'filter_type' => $column->filter_type,
                    'column_type' => $column->column_type,
                    'input_type' => $column->input_type,
                    'input_mandatory' => $column->input_mandatory,
                    'id_column' => $column->id_column,
                    'group_column' => $column->group_column,
                    'sort_column' => $column->sort_column,
                    'hide_on_phones' => $column->hide_on_phones,
                    'hide_on_tablets' => $column->hide_on_tablets,
                    'visible' => $column->visible,
                    'sum_column' => $column->sum_column,
                    'skip_thousands_separator' => $column->skip_thousands_separator,
                    'width' => $column->width,
                    'possible_values' => $column->possible_values,
                    'default_value' => $column->default_value,
                    'css_class' => $column->css_class,
                    'text_before' => $column->text_before,
                    'text_after' => $column->text_after,
                    'formatting_rules' => $column->formatting_rules,
                    'calc_formula' => $column->calc_formula,
                    'color' => $column->color,
                    'pos' => $column->pos,
                    'advanced_settings' => $column->advanced_settings
                )
            );

            if ($column->id == $tableData->userid_column_id) {
                $userIdColumnNewId = $wpdb->insert_id;

                $wpdb->update(
                    $wpdb->prefix . 'wpdatatables',
                    array('userid_column_id' => $userIdColumnNewId),
                    array('id' => $newTableId)
                );
            }

        }
    } else {
        $rows = WDTConfigController::loadRowsDataFromDB($tableId);
        foreach ($rows as $row) {
            $wpdb->insert(
                $wpdb->prefix . "wpdatatables_rows",
                array(
                    'table_id' => $newTableId,
                    'data' => json_encode($row)
                )
            );
        }
    }

    exit();

}

add_action('wp_ajax_wpdatatables_duplicate_table', 'wdtDuplicateTable');

function wdtCreateSimpleTable()
{
    if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtConstructorNonce')) {
        exit();
    }
    $tableTemplateID = 0;
    if($_POST['templateId']){
        $tableTemplateID = (int)$_POST['templateId'];
    }
    $tableData = apply_filters(
        'wpdatatables_before_create_simple_table',
        json_decode(
            stripslashes_deep(
                $_POST['tableData']
            )
        )
    );
    if($tableTemplateID){
        $wpDataTableRowsAll = WDTConfigController::loadRowsDataFromDBTemplateAll($tableTemplateID);
        $tableData->content = $wpDataTableRowsAll[0]->content;
        $tableData = WDTConfigController::sanitizeTableSettingsSimpleTable($tableData);
    } else {
        $tableData = WDTConfigController::sanitizeTableSettingsSimpleTable($tableData);
    }
    $wpDataTableRows = new WPDataTableRows($tableData);

    // Generate new id and save settings in wpdatatables table in DB
    if($tableTemplateID){
        $newTableId = generateSimpleTableID($wpDataTableRows, $wpDataTableRowsAll[0]->settings, $tableTemplateID);
        for ($i = 0; $i < count($wpDataTableRowsAll); $i++) {
            WDTConfigController::saveRowData($wpDataTableRowsAll[$i]->data, $newTableId);
        }
    } else {
        $newTableId = generateSimpleTableID($wpDataTableRows);
        // Save table with empty data
        $wpDataTableRows->saveTableWithEmptyData($newTableId);
    }

    // Generate a link for new table
    echo admin_url('admin.php?page=wpdatatables-constructor&source&simple&table_id=' . $newTableId);

    exit();
}

add_action('wp_ajax_wpdatatables_create_simple_table', 'wdtCreateSimpleTable');

function wdtGetHandsontableData()
{
    if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtEditNonce')) {
        exit();
    }

    $tableID = (int)$_POST['tableID'];
    $res = new stdClass();

    try {
        $wpDataTableRows = WPDataTableRows::loadWpDataTableRows($tableID);
        $res->tableData = $wpDataTableRows->getRowsData();
        $res->tableMeta = $wpDataTableRows->getTableSettingsData()->content;
    } catch (Exception $e) {
        $res->error = ltrim($e->getMessage(), '<br/><br/>');
    }
    echo json_encode($res);
    exit();
}

add_action('wp_ajax_wpdatatables_get_handsontable_data', 'wdtGetHandsontableData');

function generateSimpleTableID($wpDataTableRows, $wpDataTableRowsSettings = null, $tableTemplateID = 0)
{
    global $wpdb;
    $tableContent = new stdClass();
    $tableContent->rowNumber = $wpDataTableRows->getRowNumber();
    $tableContent->colNumber = $wpDataTableRows->getColNumber();
    $tableContent->colWidths = $wpDataTableRows->getColWidths();
    $tableContent->colHeaders = $wpDataTableRows->getColHeaders();
    $tableContent->reloadCounter = $wpDataTableRows->getReloadCounter();
    $tableContent->mergedCells = $wpDataTableRows->getMergeCells();
    if($wpDataTableRowsSettings !== null) {
        $tableContent->settings = $wpDataTableRowsSettings;
    }
    // Create the wpDataTable metadata
    $wpdb->insert(
        $wpdb->prefix . "wpdatatables",
        array(
            'title' => ($tableTemplateID === 0) ? sanitize_text_field($wpDataTableRows->getTableName()) : $wpDataTableRowsSettings->name,
            'table_type' => $wpDataTableRows->getTableType(),
            'content' => json_encode($tableContent),
            'server_side' => 0,
            'mysql_table_name' => '',
            'tabletools_config' => serialize(array(
                'print' => 1,
                'copy' => 1,
                'excel' => 1,
                'csv' => 1,
                'pdf' => 0
            )),
            'advanced_settings' => json_encode(array(
                    'simpleResponsive' => ($tableTemplateID === 0) ? 0 : $wpDataTableRowsSettings->simpleResponsive,
                    'simpleHeader' => ($tableTemplateID === 0) ? 0 : $wpDataTableRowsSettings->simpleHeader,
                    'stripeTable' => ($tableTemplateID === 0) ? 0 : $wpDataTableRowsSettings->stripeTable,
                    'cellPadding' => ($tableTemplateID === 0) ? 10 : $wpDataTableRowsSettings->cellPadding,
                    'removeBorders' => ($tableTemplateID === 0) ? 0 : $wpDataTableRowsSettings->removeBorders,
                    'borderCollapse' => ($tableTemplateID === 0) ? 'collapse' : $wpDataTableRowsSettings->borderCollapse,
                    'borderSpacing' => ($tableTemplateID === 0) ? 0 : $wpDataTableRowsSettings->borderSpacing,
                    'verticalScroll' => ($tableTemplateID === 0) ? 0 : $wpDataTableRowsSettings->verticalScroll,
                    'verticalScrollHeight' => ($tableTemplateID === 0) ? 600 : $wpDataTableRowsSettings->verticalScrollHeight,
                    'show_table_description' => false,
                    'table_description' => '',
                    'simple_template_id' => $tableTemplateID
                )
            )
        )
    );

    // Store the new table metadata ID
    return $wpdb->insert_id;
}
/**
 * Save data in database for Simple table
 */
function wdtSaveDataSimpleTable()
{
    global $wpdb;

    if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtEditNonce')) {
        exit();
    }
    $turnOffSimpleHeader = 0;
    $tableSettings = json_decode(stripslashes_deep($_POST['tableSettings']));
    $tableSettings = WDTConfigController::sanitizeTableConfig($tableSettings);
    $tableID = intval($tableSettings->id);
    $rowsData = json_decode(stripslashes_deep($_POST['rowsData']));
    $rowsData = WDTConfigController::sanitizeRowDataSimpleTable($rowsData, $tableID);
    $result = new stdClass();

    if ($tableSettings->content->mergedCells){
        $mergedCells = $tableSettings->content->mergedCells;
        foreach ($mergedCells as $mergedCell){
            if($mergedCell->row == 0 && $mergedCell->rowspan > 1){
                $turnOffSimpleHeader = 1;
            }
        }
    }

    $wpdb->update(
        $wpdb->prefix . "wpdatatables",
        array(
            'content' => json_encode($tableSettings->content),
            'scrollable' => $tableSettings->scrollable,
            'fixed_layout' => $tableSettings->fixed_layout,
            'word_wrap' => $tableSettings->word_wrap,
            'show_title' => $tableSettings->show_title,
            'title' => $tableSettings->title,
            'advanced_settings' => json_encode(
                array(
                    'simpleResponsive' => $tableSettings->simpleResponsive,
                    'simpleHeader' => $turnOffSimpleHeader ? 0 : $tableSettings->simpleHeader,
                    'stripeTable' => $tableSettings->stripeTable,
                    'cellPadding' => $tableSettings->cellPadding,
                    'removeBorders' => $tableSettings->removeBorders,
                    'borderCollapse' => $tableSettings->borderCollapse,
                    'borderSpacing' => $tableSettings->borderSpacing,
                    'verticalScroll' => $tableSettings->verticalScroll,
                    'verticalScrollHeight' => $tableSettings->verticalScrollHeight,
                    'show_table_description' => $tableSettings->show_table_description,
                    'table_description' => $tableSettings->table_description,
                    'simple_template_id' => $tableSettings->simple_template_id
                )
            )
        ),
        array('id' => $tableID)
    );

    if ($wpdb->last_error == '') {
        try {
            $wpDataTableRows = new WPDataTableRows($tableSettings);

            if ($wpDataTableRows->checkIsExistTableID($tableID)) {
                $wpDataTableRows->deleteRowsData($tableID);
            }
            foreach ($rowsData as $rowData){
                WDTConfigController::saveRowData($rowData, $tableID);
            }
            $wpDataTableRows = WPDataTableRows::loadWpDataTableRows($tableID);
            $result->reload =  $wpDataTableRows->getTableSettingsData()->content->reloadCounter;
            $result->tableHTML = $wpDataTableRows->generateTable($tableID);
            do_action('wpdatatables_after_save_table', $tableID);
        } catch (Exception $e) {
            $result->error = ltrim($e->getMessage(), '<br/><br/>');
        }
    } else {
        $result->error = $wpdb->last_error;
    }

    echo json_encode($result);
    exit();
}

add_action('wp_ajax_wpdatatables_save_simple_table_data', 'wdtSaveDataSimpleTable');

/**
 * Return all columns for a provided table
 */
function wdtGetColumnsDataByTableId() {
    if (!current_user_can('manage_options') ||
        !(wp_verify_nonce($_POST['wdtNonce'], 'wdtChartWizardNonce') ||
            wp_verify_nonce($_POST['wdtNonce'], 'wdtEditNonce'))
    ) {
        exit();
    }

    $tableId = (int)$_POST['table_id'];

    echo json_encode(WDTConfigController::loadColumnsFromDB($tableId));
    exit();
}

add_action('wp_ajax_wpdatatables_get_columns_data_by_table_id', 'wdtGetColumnsDataByTableId');

/**
 * Delete log_errors in cache table
 */
function wdtDeleteLogErrorsCache()
{
	global $wpdb;

	if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtSettingsNonce')) {
		exit();
	}
	$result = '';

	$wpdb->query("UPDATE " . $wpdb->prefix . "wpdatatables_cache SET log_errors = ''");

	if ($wpdb->last_error != '') {
		$result = 'Database error: ' . $wpdb->last_error;
	}

	echo $result;
	exit();
}

add_action('wp_ajax_wpdatatables_delete_log_errors_cache', 'wdtDeleteLogErrorsCache');

/**
 * List all tables in JSON
 */
function wdtListAllTables() {
    if (!current_user_can('manage_options')) {
        exit();
    }

    echo json_encode(WPDataTable::getAllTables());
    exit();
}

add_action('wp_ajax_wpdatatable_list_all_tables', 'wdtListAllTables');


function wdtShowChartFromData()
{
    if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtChartWizardNonce')) {
        exit();
    }

    $chartData = stripslashes_deep($_POST['chart_data']);
    $wpDataChart = WPDataChart::build($chartData);

    echo json_encode($wpDataChart->returnData());
    exit();
}

add_action('wp_ajax_wpdatatable_show_chart_from_data', 'wdtShowChartFromData');

function wdtSaveChart()
{
    if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtChartWizardNonce')) {
        exit();
    }

    $chartData = stripslashes_deep($_POST['chart_data']);
    $wpDataChart = WPDataChart::build($chartData);
    $wpDataChart->save();

    echo json_encode(array('id' => $wpDataChart->getId(), 'shortcode' => $wpDataChart->getShortCode()));
    exit();
}

add_action('wp_ajax_wpdatatable_save_chart_get_shortcode', 'wdtSaveChart');

/**
 * List all charts in JSON
 */
function wdtListAllCharts()
{
    if (!current_user_can('manage_options')) {
        exit();
    }

    echo json_encode(WPDataChart::getAll());
    exit();
}

add_action('wp_ajax_wpdatatable_list_all_charts', 'wdtListAllCharts');

/**
 * Duplicate the chart
 */

function wdtDuplicateChart()
{
    global $wpdb;

    if (!current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtDuplicateChartNonce')) {
        exit();
    }

    $chartId = (int)$_POST['chart_id'];
    if (empty($chartId)) {
        return false;
    }
    $newChartName = sanitize_text_field($_POST['new_chart_name']);

    $chartQuery = $wpdb->prepare(
        'SELECT * FROM ' . $wpdb->prefix . 'wpdatacharts WHERE id = %d',
        $chartId
    );

    $wpDataChart = $wpdb->get_row($chartQuery);

    // Creating new table
    $wpdb->insert(
        $wpdb->prefix . "wpdatacharts",
        array(
            'wpdatatable_id' => $wpDataChart->wpdatatable_id,
            'title' => $newChartName,
            'engine' => $wpDataChart->engine,
            'type' => $wpDataChart->type,
            'json_render_data' => $wpDataChart->json_render_data
        )
    );

    exit();
}

add_action('wp_ajax_wpdatatables_duplicate_chart', 'wdtDuplicateChart');

/**
 * Get Roots from Nested JSON url
 */
function wdtGetNestedJsonRoots()
{
	if ( !current_user_can('manage_options') || !wp_verify_nonce($_POST['wdtNonce'], 'wdtEditNonce') ) {
		exit();
	}
	global $wdtVar1, $wdtVar2, $wdtVar3, $wdtVar4, $wdtVar5, $wdtVar6, $wdtVar7, $wdtVar8, $wdtVar9;
	$tableConfig = json_decode(stripslashes_deep($_POST['tableConfig']));
	// Set placeholders
	$wdtVar1 = $wdtVar1 === '' ? $tableConfig->var1 : $wdtVar1;
	$wdtVar2 = $wdtVar2 === '' ? $tableConfig->var2 : $wdtVar2;
	$wdtVar3 = $wdtVar3 === '' ? $tableConfig->var3 : $wdtVar3;
	$wdtVar4 = $wdtVar4 === '' ? $tableConfig->var4 : $wdtVar4;
	$wdtVar5 = $wdtVar5 === '' ? $tableConfig->var5 : $wdtVar5;
	$wdtVar6 = $wdtVar6 === '' ? $tableConfig->var6 : $wdtVar6;
	$wdtVar7 = $wdtVar7 === '' ? $tableConfig->var7 : $wdtVar7;
	$wdtVar8 = $wdtVar8 === '' ? $tableConfig->var8 : $wdtVar8;
	$wdtVar9 = $wdtVar9 === '' ? $tableConfig->var9 : $wdtVar9;

	$tableID = (int)$tableConfig->id;

	$params = json_decode(stripslashes_deep($_POST['params']));
	$params = WDTConfigController::sanitizeNestedJsonParams($params);
	$nestedJSON = new WDTNestedJson($params);
	$response = $nestedJSON->getResponse($tableID);

	if (!is_array($response)) {
		wp_send_json_error( array( 'msg' => $response ) );
	}

	$roots = $nestedJSON->prepareRoots( 'root', '', array(), $response);

	if ( empty( $roots ) ) {
		wp_send_json_error( array( 'msg' => esc_html__("Unable to retrieve data. Roots empty.", 'wpdatatables') ) );
	}

	wp_send_json_success( array( 'url' => $nestedJSON->getUrl(), 'roots' => $roots ) );
}

add_action('wp_ajax_wpdatatables_get_nested_json_roots', 'wdtGetNestedJsonRoots');