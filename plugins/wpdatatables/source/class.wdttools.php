<?php

defined('ABSPATH') or die("Cannot access pages directly.");

class WDTTools
{

    public static $jsVars = array();

    /**
     * Helper function that returns array of possible column types
     * @return array
     */
    public static function getPossibleColumnTypes()
    {
        return array(
            'input' => __('One line string', 'wpdatatables'),
            'memo' => __('Multi-line string', 'wpdatatables'),
            'select' => __('One-line selectbox', 'wpdatatables'),
            'multiselect' => __('Multi-line selectbox', 'wpdatatables'),
            'int' => __('Integer', 'wpdatatables'),
            'float' => __('Float', 'wpdatatables'),
            'date' => __('Date', 'wpdatatables'),
            'datetime' => __('Datetime', 'wpdatatables'),
            'time' => __('Time', 'wpdatatables'),
            'link' => __('URL Link', 'wpdatatables'),
            'email' => __('E-mail', 'wpdatatables'),
            'image' => __('Image', 'wpdatatables'),
            'file' => __('Attachment', 'wpdatatables')
        );
    }

    /**
     * Helper function that sanitize column header
     * @param $header
     * @return mixed
     */
    public static function sanitizeHeader($header)
    {
        return
            str_replace(
                range('0', '9'),
                range('a', 'j'),
                str_replace(
                    array('$', '_', '&', ' '),
                    '',
                    $header
                )
            );
    }


    /**
     * Helper function that returns curl data
     * @param $url
     * @return mixed|null
     * @throws Exception
     */
	public static function curlGetData($url)
	{
		$ch = curl_init();
		$timeout = 100;
		$agent = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36';

		curl_setopt($ch, CURLOPT_URL, $url);
		curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
		curl_setopt($ch, CURLOPT_CONNECTTIMEOUT, $timeout);
		curl_setopt($ch, CURLOPT_USERAGENT, $agent);
		curl_setopt($ch, CURLOPT_REFERER, site_url());
		curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);

		$data = apply_filters('wpdatatables_curl_get_data', null, $ch, $url);
		if( null === $data ) {
			$data = curl_exec($ch);
			if (curl_error($ch)) {
				$error = curl_error($ch);
				curl_close($ch);

				throw new Exception($error);
			}
			if (strpos($data, '<TITLE>Moved Temporarily</TITLE>') ||
			    strpos($data, 'Error 400 (Bad Request)')) {
				throw new Exception(__('wpDataTables was unable to read your Google Spreadsheet, as it\'s not been published correctly. <br/> You can publish it by going to <b>File ->Share -> Publish to the web</b> ', 'wpdatatables'));
			}
			$info = curl_getinfo($ch);
			curl_close($ch);

			if ($info['http_code'] === 404) {
				return NULL;
			}
			if ($info['http_code'] === 401) {
				throw new Exception(__('wpDataTables was unable to access data. Unauthorized access. Please make file accessible.', 'wpdatatables'));
			}

			$data = apply_filters('wpdatatables_curl_get_data_complete', $data, $url);
		}

		return $data;
	}


    /**
     * Helper function to find CSV delimiter
     * @param $csv_url
     * @return string
     */
    public static function detectCSVDelimiter($csv_url)
    {

        if (!file_exists($csv_url) || !is_readable($csv_url)) {
            throw new WDTException('Could not open ' . $csv_url . ' for reading! File does not exist.');
        }
        $fileResurce = fopen($csv_url, 'r');

        $delimiterList = [',', ':', ';', "\t", '|'];
        $counts = [];
        foreach ($delimiterList as $delimiter) {
            $counts[$delimiter] = [];
        }

        $lineNumber = 0;
        while (($line = fgets($fileResurce)) !== false && (++$lineNumber < 1000)) {
            $lineCount = [];
            for ($i = strlen($line) - 1; $i >= 0; --$i) {
                $character = $line[$i];
                if (isset($counts[$character])) {
                    if (!isset($lineCount[$character])) {
                        $lineCount[$character] = 0;
                    }
                    ++$lineCount[$character];
                }
            }
            foreach ($delimiterList as $delimiter) {
                $counts[$delimiter][] = isset($lineCount[$delimiter])
                    ? $lineCount[$delimiter]
                    : 0;
            }
        }

        $RMSD = [];
        $middleIdx = floor(($lineNumber - 1) / 2);

        foreach ($delimiterList as $delimiter) {
            $series = $counts[$delimiter];
            sort($series);

            $median = ($lineNumber % 2)
                ? $series[$middleIdx]
                : ($series[$middleIdx] + $series[$middleIdx + 1]) / 2;

            if ($median === 0) {
                continue;
            }

            $RMSD[$delimiter] = array_reduce(
                    $series,
                    function ($sum, $value) use ($median) {
                        return $sum + pow($value - $median, 2);
                    }
                ) / count($series);
        }

        $min = INF;
        foreach ($delimiterList as $delimiter) {
            if (!isset($RMSD[$delimiter])) {
                continue;
            }

            if ($RMSD[$delimiter] < $min) {
                $min = $RMSD[$delimiter];
                $finalDelimiter = $delimiter;
            }
        }

        if ($delimiter === null) {
            $finalDelimiter = reset($delimiterList);
        }

        return $finalDelimiter;
    }


    /**
     * Helper function that convert CSV file to Array
     * @param $csv
     * @return array
     */
    public static function csvToArray($csv)
    {
        $arr = array();
        $lines = explode("\n", $csv);
        foreach ($lines as $row) {
            $arr[] = str_getcsv($row, ",");
        }
        $count = count($arr) - 1;
        $labels = array_shift($arr);
        $countLabels = count($labels);
        $keys = array();
        foreach ($labels as $label) {
            $keys[] = trim(preg_replace('/\s\s+/', ' ', str_replace("\n", " ", $label)));
        }
        $keys = array_map('trim', $keys);
        $returnArray = array();
        for ($j = 0; $j < $count; $j++) {
            if (count($arr[$j]) < $countLabels){
                for ($k = 0; $k < $countLabels; $k++){
                    if(!isset($arr[$j][$k])){
                        $arr[$j][$k] = '';
                    }
                }
            }
            if (count($keys) == count($arr[$j])) {
                $d = array_combine($keys, $arr[$j]);
                $returnArray[$j] = $d;
            }
        }
        return $returnArray;
    }

    public static function getTranslationStringsPlugin()
    {
        return array(
            'success' => __('Success!', 'wpdatatables'),
            'error' => __('Error!', 'wpdatatables'),
        );
    }
    /**
     * Helper function that returns array of translation strings used for localization of JavaScript files
     * @return array
     */
    public static function getTranslationStrings()
    {
        return array(
            'back_to_date' => __('Back to date', 'wpdatatables'),
            'browse_file' => __('Browse', 'wpdatatables'),
            'cancel' => __('Cancel', 'wpdatatables'),
            'cannot_be_empty' => __(' field cannot be empty!', 'wpdatatables'),
            'choose_file' => __('Use selected file', 'wpdatatables'),
            'chooseFile' => __('Choose file', 'wpdatatables'),
            'close' => __('Close', 'wpdatatables'),
            'columnAdded' => __('Column has been added!', 'wpdatatables'),
            'columnHeaderEmpty' => __('Column header cannot be empty!', 'wpdatatables'),
            'columnRemoveConfirm' => __('Please confirm column deletion!', 'wpdatatables'),
            'columnRemoved' => __('Column has been removed!', 'wpdatatables'),
            'columnsEmpty' => __('Please select columns that you want to use in table', 'wpdatatables'),
            'copy' => __('Copy', 'wpdatatables'),
            'databaseInsertError' => __('There was an error trying to insert a new row!', 'wpdatatables'),
            'dataSaved' => __('Data has been saved!', 'wpdatatables'),
            'detach_file' => __('detach', 'wpdatatables'),
            'delete' => __('Delete', 'wpdatatables'),
            'deleteSelected' => __('Delete selected', 'wpdatatables'),
            'error' => __('Error!', 'wpdatatables'),
            'fileUploadEmptyFile' => __('Please upload or choose a file from Media Library!', 'wpdatatables'),
            'from' => __('From', 'wpdatatables'),
            'invalid_email' => __('Please provide a valid e-mail address for field', 'wpdatatables'),
            'invalid_link' => __('Please provide a valid URL link for field', 'wpdatatables'),
            'invalid_value' => __('You have entered invalid value. Press ESC to cancel.', 'wpdatatables'),
            'lengthMenu' => __('Show _MENU_ entries', 'wpdatatables'),
            'merge' => __('Merge', 'wpdatatables'),
            'newColumnName' => __('New column', 'wpdatatables'),
            'numberOfColumnsError' => __('Number of columns can not be empty or 0', 'wpdatatables'),
            'numberOfRowsError' => __('Number of rows can not be empty or 0', 'wpdatatables'),
            'oAria' => array(
                'sSortAscending' => __(': activate to sort column ascending', 'wpdatatables'),
                'sSortDescending' => __(': activate to sort column descending', 'wpdatatables')
            ),
            'ok' => __('Ok', 'wpdatatables'),
            'oPaginate' => array(
                'sFirst' => __('First', 'wpdatatables'),
                'sLast' => __('Last', 'wpdatatables'),
                'sNext' => __('Next', 'wpdatatables'),
                'sPrevious' => __('Previous', 'wpdatatables')
            ),
            'replace' => __('Replace', 'wpdatatables'),
            'rowDeleted' => __('Row has been deleted!', 'wpdatatables'),
            'saveChart' => __('Save chart', 'wpdatatables'),
            'select_upload_file' => __('Select a file to use in table', 'wpdatatables'),
            'selectExcelCsv' => __('Select an Excel or CSV file', 'wpdatatables'),
            'sEmptyTable' => __('No data available in table', 'wpdatatables'),
            'settings_saved_successful' => __('Plugin settings saved successfully', 'wpdatatables'),
            'settings_saved_error' => __('Unable to save settings of plugin. Please try again or contact us over Support page.', 'wpdatatables'),
            'shortcodeSaved' => __('Shortcode has been copied to the clipboard.', 'wpdatatables'),
            'sInfo' => __('Showing _START_ to _END_ of _TOTAL_ entries', 'wpdatatables'),
            'sInfoEmpty' => __('Showing 0 to 0 of 0 entries', 'wpdatatables'),
            'sInfoFiltered' => __('(filtered from _MAX_ total entries)', 'wpdatatables'),
            'sInfoPostFix' => '',
            'sInfoThousands' => __(',', 'wpdatatables'),
            'sLengthMenu' => __('Show _MENU_ entries', 'wpdatatables'),
            'sLoadingRecords' => __('Loading...', 'wpdatatables'),
            'sProcessing' => __('Processing...', 'wpdatatables'),
            'sqlError' => __('SQL error', 'wpdatatables'),
            'sSearch' => __('Search: ', 'wpdatatables'),
            'success' => __('Success!', 'wpdatatables'),
            'sZeroRecords' => __('No matching records found', 'wpdatatables'),
            'systemInfoSaved' => __('System info data has been copied to the clipboard. You can now paste it in file or in support topic.', 'wpdatatables'),
            'tableSaved' => __('Table saved successfully!', 'wpdatatables'),
            'to' => __('To', 'wpdatatables'),
            'clear_table_data' => __('Clear table data', 'wpdatatables'),
            'star_rating' => __('Star rating', 'wpdatatables'),
            'shortcode' => __('Shortcode', 'wpdatatables'),
            'html_code' => __('HTML code', 'wpdatatables'),
            'media' => __('Media', 'wpdatatables'),
            'link' => __('Link', 'wpdatatables'),
            'clip' => __('Clip', 'wpdatatables'),
            'overflow' => __('Overflow', 'wpdatatables'),
            'wrap' => __('Wrap', 'wpdatatables'),
            'left' => __('Left', 'wpdatatables'),
            'center' => __('Center', 'wpdatatables'),
            'right' => __('Right', 'wpdatatables'),
            'justify' => __('Justify', 'wpdatatables'),
            'top' => __('Top', 'wpdatatables'),
            'middle' => __('Middle', 'wpdatatables'),
            'bottom' => __('Bottom', 'wpdatatables'),
            'insert_row_above' => __('Insert row above', 'wpdatatables'),
            'insert_row_below' => __('Insert row below', 'wpdatatables'),
            'remove_row' => __('Remove row', 'wpdatatables'),
            'insert_col_left' => __('Insert column left', 'wpdatatables'),
            'insert_col_right' => __('Insert column right', 'wpdatatables'),
            'remove_column' => __('Remove column', 'wpdatatables'),
            'alignment' => __('Alignment', 'wpdatatables'),
            'cut' => __('Cut', 'wpdatatables'),
            'insert_custom' => __('Insert custom', 'wpdatatables'),
            'undo' => __('Undo', 'wpdatatables'),
            'redo' => __('Redo', 'wpdatatables'),
            'text_wrapping' => __('Text wrapping', 'wpdatatables'),
            'merge_cells' => __('Merge cells', 'wpdatatables'),
            'firstPageWCAG' => __('First page', 'wpdatatables'),
            'lastPageWCAG' => __('Last page', 'wpdatatables'),
            'nextPageWCAG' => __('Next page', 'wpdatatables'),
            'previousPageWCAG' => __('Previous page', 'wpdatatables'),
            'pageWCAG' => __('wpDataTable Page ', 'wpdatatables'),
            'spacerWCAG' => __('Spacer', 'wpdatatables'),
            'printTableWCAG' => __('Print table', 'wpdatatables'),
            'exportTableWCAG' => __('Export table', 'wpdatatables'),
            'clearFiltersWCAG' => __('Clear filters', 'wpdatatables'),
            'colvisWCAG' => __('Column visibility', 'wpdatatables'),
            'invalidResponseServer' => __('Invalid response from server', 'wpdatatables'),
            'failedToLoadFormFields' => __('Failed to load form fields', 'wpdatatables'),
        );
    }

    /**
     * Helper function that returns all update info
     * @return array
     */
    public static function getDeactivationInfo()
    {
        return array(
            'version'  => get_option('wdtVersion'),
            'wdt_nonce' => wp_nonce_field('wdtDeactivationNonce', 'wdtNonce'),
            'titleDeactivation' => __('QUICK FEEDBACK', 'wpdatatables'),
            'captionDeactivation' => __('If you have a moment, please let us know why you are deactivating the wpDataTables plugin:', 'wpdatatables'),
            'captionDeactivationError' => __('Please select one option from the following list: ', 'wpdatatables'),
            'deactivate_reasons' => [
                0 => [
                    'id' => 'feature_needed',
                    'title' => esc_html__( 'The plugin doesn’t have a feature that I need' ),
                    'input_placeholder' => esc_html__('Please explain your use case and the feature you need: '),
                    'alert' => '',
                ],
                1 => [
                    'id' => 'premium_version',
                    'title' => esc_html__( 'I bought the premium version' ),
                    'input_placeholder' => '',
                    'alert' => '',
                ],
                2 => [
                    'id' => 'stopped_working',
                    'title' => esc_html__( 'The plugin suddenly stopped working' ),
                    'input_placeholder' => esc_html__('Tell us more… '),
                    'alert' => esc_html__('Have you reached out to our support team?'),
                ],
                3 => [
                    'id' => 'broke_my_site',
                    'title' => esc_html__( 'The plugin broke my site' ),
                    'input_placeholder' => esc_html__('Tell us more… '),
                    'alert' => esc_html__('Have you reached out to our support team?'),
                ],
                4 => [
                    'id' => 'better_plugin',
                    'title' => esc_html__( 'I found a better plugin' ),
                    'input_placeholder' => esc_html__('Please share which plugin: '),
                    'alert' => '',
                ],
                5 => [
                    'id' => 'temporary_deactivation',
                    'title' => esc_html__( 'It is a temporary deactivation - I’m troubleshooting an issue' ),
                    'input_placeholder' => '',
                    'alert' => '',
                ],
                6 => [
                    'id' => 'able_to_work',
                    'title' => esc_html__( 'I haven’t been able to get the plugin to work' ),
                    'input_placeholder' => esc_html__('Tell us more… '),
                    'alert' => esc_html__('Have you reached out to our support team?'),
                ],
                7 => [
                    'id' => 'no_longer_needed',
                    'title' => esc_html__( 'I no longer need the plugin' ),
                    'input_placeholder' => esc_html__('Please share more about your use case: '),
                    'alert' => '',
                ],
                8 => [
                    'id' => 'conflict',
                    'title' => esc_html__( 'The plugin has a conflict with the theme or other plugin' ),
                    'input_placeholder' => esc_html__('Please share which plugin/theme: '),
                    'alert' => esc_html__('Have you reached out to our support team?'),
                ],
                9 => [
                    'id' => 'other',
                    'title' => esc_html__( 'Other' ),
                    'input_placeholder' => esc_html__('How could we improve? '),
                    'alert' => '',
                ],
            ]
        );
    }

    /**
     * Helper function that returns an array with date and time settings from wp_options
     * @return array
     */
    public static function getDateTimeSettings()
    {
        return array(
            'wdtDateFormat' => get_option('wdtDateFormat'),
            'wdtTimeFormat' => get_option('wdtTimeFormat')
        );
    }

    /**
     * Helper function that returns an array with wpDataTables admin pages
     * @return array
     */
    public static function getWpDataTablesAdminPages()
    {
        return array(
            'dashboardUrl'         => menu_page_url('wpdatatables-dashboard', false),
            'browseTablesUrl'      => menu_page_url('wpdatatables-administration', false),
            'browseChartsUrl'      => menu_page_url('wpdatatables-charts', false),
            'liteVSPremiumUrl'     => menu_page_url('wpdatatables-lite-vs-premium', false)
        );
    }
    /**
     * Helper function that returns an array with wpDataTables popover strings
     * @return array
     */
    public static function getWpDataTablesPopoverStrings()
    {
        return array(
            'title'             => __('This is a premium feature', 'wpdatatables'),
            'description'       => __('This feature is available only in premium version of wpDataTables', 'wpdatatables'),
            'compare_link'      => __('Compare and View Pricing', 'wpdatatables'),
        );
    }


    /**
     * Helper function that returns an array of strings for tutorials
     * @return array
     */
    public static function getTutorialsTranslationStrings()
    {
        $guideTeacherIMG = '<img class="wdt-emoji-title" src="'. WDT_ROOT_URL . 'assets/img/male-teacher.png">';
        $waveIMG = '<img class="wdt-emoji-body" src="'. WDT_ROOT_URL . 'assets/img/wave.png">';
        $partyTitleIMG = '<img class="wdt-emoji-title" src="'. WDT_ROOT_URL . 'assets/img/party-popper.png">';
        $hourglassIMG = '<img class="wdt-emoji-title" src="'. WDT_ROOT_URL . 'assets/img/hourglass-not-done.png">';
        $raisedHandsIMG = '<img class="wdt-emoji-title m-l-5" src="'. WDT_ROOT_URL . 'assets/img/raising-hands.png">';
        $chartIMG = '<img class="wdt-emoji-title" src="'. WDT_ROOT_URL . 'assets/img/chart-increasing.png">';

        return array(
            'cannot_be_empty_field' => __('Field cannot be empty!', 'wpdatatables'),
            'cannot_be_empty_chart_type' => __('Please choose chart type.', 'wpdatatables'),
            'cannot_be_empty_chart_table' => __('Please select wpDataTable from dropdown.', 'wpdatatables'),
            'cannot_be_empty_chart_table_columns' => __('Columns field cannot be empty', 'wpdatatables'),
            'cancel_button' => __('Cancel', 'wpdatatables'),
            'cancel_tour' => __('Tutorial is not canceled,  closed or end properly. Please cancel it by clicking on Cancel button.', 'wpdatatables'),
            'finish_button' => __('Finish Tutorial', 'wpdatatables'),
            'next_button' => __('Continue', 'wpdatatables'),
            'start_button' => __('Start', 'wpdatatables'),
            'skip_button' => __('Skip Tutorial', 'wpdatatables'),
            'tour0' => array(
                'step0' => array(
                    'title' => $guideTeacherIMG . __('Welcome to the tutorial!', 'wpdatatables'),
                    'content' => __('Hello ', 'wpdatatables') . $waveIMG  .  __(', in this tutorial, we will show you how to create a simple table from scratch by choosing a custom number of columns and rows. How to customize each cell, merge cells and a lot more.', 'wpdatatables'),
                ),
                'step1' => array(
                    'title' => __(' Let\'s create a new wpDataTable from scratch!', 'wpdatatables'),
                    'content' => __('Click on \'Create a Table\' to access the wpDataTables Table Wizard.', 'wpdatatables'),
                ),
                'step2' => array(
                    'title' => __('Choose this option', 'wpdatatables'),
                    'content' => __('Please select \'Create a simple table from scratch\'.', 'wpdatatables'),
                ),
                'step3' => array(
                    'title' => __('Click Next', 'wpdatatables'),
                    'content' => __('Please click the \'Next\' button to continue.', 'wpdatatables'),
                ),
                'step4' => array(
                    'title' => __('Welcome to the Simple table wizard!', 'wpdatatables'),
                    'content' => __('Please click \'Continue\' button to move on.', 'wpdatatables'),
                ),
                'step5' => array(
                    'title' => __('Choose a name for your table', 'wpdatatables'),
                    'content' => __('After inserting table name, click \'Continue\' to move on.', 'wpdatatables'),
                ),
                'step6' => array(
                    'title' => __('Choose the number of columns for your table', 'wpdatatables'),
                    'content' => __('Please choose how many columns it will have. Remember that you can always add or reduce the number of columns later. Click \'Continue\' when you finish.', 'wpdatatables'),
                ),
                'step7' => array(
                    'title' => __('Choose the number of rows for your table.', 'wpdatatables'),
                    'content' => __('Please choose how many rows it will have. Remember that you can always add or reduce the number of rows later. Click \'Continue\' when you finish.', 'wpdatatables'),
                ),
                'step8' => array(
                    'title' => __('Click on the \'Generate Table\' button', 'wpdatatables'),
                    'content' => __('When you click on the button, the empty table will be ready for you. ', 'wpdatatables'),
                ),
                'step9' => array(
                    'title' => $hourglassIMG .__('We are generating the table...', 'wpdatatables'),
                    'content' => __('Please, when you see the table, click \'Continue\' to move on.', 'wpdatatables'),
                ),
                'step10' => array(
                    'title' => __('Nice job! You just configured your table and it is ready to fill it with data.', 'wpdatatables') . $raisedHandsIMG,
                    'content' => __('Now we will guide you on how to insert data and check table layout throw Simple table editor, table toolbar and table preview. Please click \'Continue\' to move on.', 'wpdatatables'),
                ),
                'step11' => array(
                    'title' => __('This is Simple table editor', 'wpdatatables'),
                    'content' => __('Here you can populate your table with data. <br><br>You can move around the cells using keyboard arrows and the Tab button. <br><br>Rearrange columns or rows by drag and drop column or row headers. Easily resize column width and row height by dragging the right corner of the column header, or the bottom line of the row header. Click \'Continue\' to move on.', 'wpdatatables'),
                ),
                'step12' => array(
                    'title' => __('Check out the Simple table toolbar', 'wpdatatables'),
                    'content' => __('Here you can style and insert custom data for each cell or range of cells. You can add or delete columns and rows, merge cells, customize sections by colors, background, alignment, insert custom links, media, shortcodes, star ratings or custom HTML code.', 'wpdatatables'),
                ),
                'step13' => array(
                    'title' => __('Responsive table views', 'wpdatatables'),
                    'content' => __('You can switch between Desktop, Tablet or Mobile devices by clicking on the tab that you need, so you can make sure your table looks excellent across all devices. ', 'wpdatatables'),
                ),
                'step14' => array(
                    'title' => __('Real-time preview', 'wpdatatables'),
                    'content' => __('Here you will see how your table will look like on the page. Please click \'Continue\' to move on.', 'wpdatatables'),
                ),
                'step15' => array(
                    'title' =>$partyTitleIMG .  __('Congrats! Your table is ready.', 'wpdatatables'),
                    'content' => __('Now you can copy the shortcode for this table, and check out how it looks on your website when you paste it to a post or page. You can always come back and edit the table as you like.', 'wpdatatables'),
                )
            ),
            'tour1' => array(
                'step0' => array(
                    'title' => $guideTeacherIMG . __('Welcome to the tutorial!', 'wpdatatables'),
                    'content' => __('Hello ', 'wpdatatables') . $waveIMG  .  __(', in this tutorial we will show you how to create a wpDataTable linked to an existing data source. "Linked" in this context means that if you create a table, for example, based on an Excel file, it will read the data from this file every time it loads, making sure all table values changes are instantly reflected in the table.', 'wpdatatables'),
                ),
                'step1' => array(
                    'title' => __('Let\'s create a new wpDataTable!', 'wpdatatables'),
                    'content' => __('Click on \'Create a Table\' to access the wpDataTables Table Wizard.', 'wpdatatables'),
                ),
                'step2' => array(
                    'title' => __('Choose this option.', 'wpdatatables'),
                    'content' => __('Please select \'Create a table linked to an existing data source\'.', 'wpdatatables'),
                ),
                'step3' => array(
                    'title' => __('Click Next', 'wpdatatables'),
                    'content' => __('Please click the \'Next\' button to continue.', 'wpdatatables'),
                ),
                'step4' => array(
                    'title' => __('Input data source type', 'wpdatatables'),
                    'content' => __('Please select a data source type that you need.', 'wpdatatables'),
                ),
                'step5' => array(
                    'title' => __('Select Data source type', 'wpdatatables'),
                    'content' => __('Please choose the data source that you need ( Excel, CSV, JSON, XML or PHP array) and then click \'Continue\' button.<br><br>(SQL and Google Spreadsheet are available in Premium version)', 'wpdatatables'),
                ),
                'step6' => array(
                    'title' => __('Input file path or URL', 'wpdatatables'),
                    'content' => __('Upload your file or provide the full URL here. When you finish click \'Continue\' button.', 'wpdatatables'),
                ),
                'step7' => array(
                    'title' => __('Click Save Changes', 'wpdatatables'),
                    'content' => __('Please click on the \'Save Changes\' button to create a table.<br><br> If you get an error message after button click and you are not able to solve it, please contact us on our support platform and provide us this data source that you use for creating this table and copy error message as well and click Skip tutorial.', 'wpdatatables'),
                ),
                'step8' => array(
                    'title' => $hourglassIMG .__('The table is creating...', 'wpdatatables'),
                    'content' => __('Now the table is creating. Wait until you see it in the background and then click \'Continue\'.', 'wpdatatables'),
                ),
                'step9' => array(
                    'title' => $partyTitleIMG . __('Nice job! You just created your first wpDataTable!', 'wpdatatables') . $raisedHandsIMG,
                    'content' => __('Now you can copy the shortcode for this table, and check out how it looks on your website when you paste it to a post or page.', 'wpdatatables'),
                )
            ),
            'tour2' => array(
                'step0' => array(
                    'title' => $guideTeacherIMG . __('Welcome to the tutorial!', 'wpdatatables'),
                    'content' => __('Hello ', 'wpdatatables') . $waveIMG . __(', in this tutorial we will show you how to create a chart in wpDataTables plugin.', 'wpdatatables'),
                ),
                'step1' => array(
                    'title' => __('Let\'s create a new wpDataTables Chart!', 'wpdatatables'),
                    'content' => __('Click on \'Create a Chart\' to access the wpDataTables Chart Wizard.', 'wpdatatables'),
                ),
                'step2' => array(
                    'title' => $chartIMG . __('Welcome to the Chart Wizard!', 'wpdatatables'),
                    'content' => __('You are at the first step now; we will introduce you the wpDataTables Chart Wizard section by section.<br><br> Click \'Continue\' button to move forward.', 'wpdatatables'),
                ),
                'step3' => array(
                    'title' => __('Follow the steps in the Chart Wizard', 'wpdatatables'),
                    'content' => __('By following these steps, you will finish building your chart in the Chart Wizard. The current step will always be highlighted in blue.<br><br> Click \'Continue\' button to move forward.', 'wpdatatables'),
                ),
                'step4' => array(
                    'title' => __('Choose a name for your Chart', 'wpdatatables'),
                    'content' => __('Click \'Continue\' button when you’re ready to move forward.', 'wpdatatables'),
                ),
                'step5' => array(
                    'title' => __('In wpDataTables you can find several charts render engines.', 'wpdatatables'),
                    'content' => __('Click on the dropdown, and you will see several options that you can choose from.(Google charts nad Chart.js are only available) <br><br>To continue, click on the dropdown.', 'wpdatatables'),
                ),
                'step6' => array(
                    'title' => __('Choose chart engine.', 'wpdatatables'),
                    'content' => __('By clicking on chart engine options, you will choose the engine that will render your chart.<br><br> When you finish, please click \'Continue\' button to move forward.', 'wpdatatables'),
                ),
                'step7' => array(
                    'title' => __('Different charts types. ', 'wpdatatables'),
                    'content' => __('Here you can choose a chart type. Please, click on the chart type that you prefer.<br><br> When you finish, please click \'Continue\' button to move forward.', 'wpdatatables'),
                ),
                'step10' => array(
                    'title' => __('The first step is finished!', 'wpdatatables'),
                    'content' => __('Let\'s move on. Please, click \'Next\' to continue.', 'wpdatatables'),
                ),
                'step11' => array(
                    'title' => __('Now you need to choose a wpDataTable based on which we will build a chart for you', 'wpdatatables'),
                    'content' => __('Click on the dropdown, and all your tables will be listed. The columns of the table that you choose will be used for creating the chart.<br><br>If you didn\'t create a wpDataTable yet, then please click on the \'Skip Tutorial\' button and create wpDataTable that would contain the data to visualize first.', 'wpdatatables'),
                ),
                'step12' => array(
                    'title' => __('Pick your wpDataTable', 'wpdatatables'),
                    'content' => __('Pick a wpDataTable from which you want to render a chart and when you finish, please click \'Continue\' to move on.', 'wpdatatables'),
                ),
                'step13' => array(
                    'title' => __('The second step is finished!', 'wpdatatables') . $raisedHandsIMG,
                    'content' => __('Let\'s see what is coming up next. <br><br> Please, click \'Next\' to continue.', 'wpdatatables'),
                ),
                'step14' => array(
                    'title' => __('Just a heads up!', 'wpdatatables'),
                    'content' => __('Here you will choose from which columns you will create a chart.<br><br> Please click \'Continue\' button to move forward.', 'wpdatatables'),
                ),
                'step15' => array(
                    'title' => __('Meet the wpDataTable Column Blocks', 'wpdatatables'),
                    'content' => __('Here you will choose columns you want to use in the chart. Drag and drop it, or click on the arrow to move the desired column to the \'Columns used in the chart\' section.<br><br> When you finish please, click \'Continue.\'', 'wpdatatables'),
                ),
                'step16' => array(
                    'title' => __('Well done!', 'wpdatatables') . $raisedHandsIMG,
                    'content' => __('Just two more steps to go. Please click \'Next\' to continue.', 'wpdatatables'),
                ),
                'step17' => array(
                    'title' => __('Chart settings and chart preview.', 'wpdatatables'),
                    'content' => __('Here you can adjust chart settings, different parameters are grouped in section; adjusting the parameters will be reflected in the preview of your chart in real-time on the right-hand side.<br><br> Please click \'Continue\' button to move forward.', 'wpdatatables'),
                ),
                'step18' => array(
                    'title' => __('In this sidebar, you can find the chart settings section.', 'wpdatatables'),
                    'content' => __('By clicking on each section, you can set your desired parameters per section.<br><br> Please click \'Continue\' button to move on.', 'wpdatatables'),
                ),
                'step19' => array(
                    'title' => __('Here are the available chart options', 'wpdatatables'),
                    'content' => __('Set different chart options for the chosen section to get your desired chart look.<br><br> Please click \'Continue\' button to move on.', 'wpdatatables'),
                ),
                'step27' => array(
                    'title' => __('How your chart will look like on the page of your website', 'wpdatatables'),
                    'content' => __('Here you can see a preview of your chart based on the settings you have chosen.<br><br> Please click \'Continue\' button to move on.', 'wpdatatables'),
                ),
                'step28' => array(
                    'title' => __('You can save your chart now', 'wpdatatables'),
                    'content' => __('If you are satisfied with your chart appearance, click on the \'Save chart\' button and all your settings for this chart will be saved in the database.', 'wpdatatables'),
                ),
                'step29' => array(
                    'title' => $partyTitleIMG . __('Congrats! Your first chart is ready!', 'wpdatatables') . $raisedHandsIMG,
                    'content' => __('Now you can copy the shortcode for this chart and paste it in any WP post or page. <br><br>You may now finish this tutorial. ', 'wpdatatables'),
                )
            )
        );
    }

    /**
     * Helper function that define default value
     * @param $possible
     * @param $index
     * @param string $default
     * @return string
     */
    public static function defineDefaultValue($possible, $index, $default = '')
    {
        return isset($possible[$index]) ? $possible[$index] : $default;
    }

    /**
     * Helper function that extract column headers in array
     * @param $rawDataArr
     * @return array
     * @throws WDTException
     */
    public static function extractHeaders($rawDataArr)
    {
        reset($rawDataArr);
        if (!is_array($rawDataArr[key($rawDataArr)])) {
            throw new WDTException('Please provide a valid 2-dimensional array.');
        }
        return array_keys($rawDataArr[key($rawDataArr)]);
    }

    /**
     * Helper function that detect columns data type
     * @param $rawDataArr
     * @param $headerArr
     * @return array
     * @throws WDTException
     */
    public static function detectColumnDataTypes($rawDataArr, $headerArr)
    {
        $autodetectData = array();
        $autodetectRowsCount = (10 > count($rawDataArr)) ? count($rawDataArr) - 1 : 9;
        $wdtColumnTypes = array();
        for ($i = 0; $i <= $autodetectRowsCount; $i++) {
            foreach ($headerArr as $key) {
                $cur_val = current($rawDataArr);
                if (!is_array($cur_val[$key])) {
                    $autodetectData[$key][] = $cur_val[$key];
                } else {
                    if (array_key_exists('value', $cur_val[$key])) {
                        $autodetectData[$key][] = $cur_val[$key]['value'];
                    } else {
                        throw new WDTException('Please provide a correct format for the cell.');
                    }
                }
            }
            next($rawDataArr);
        }
        foreach ($headerArr as $key) {
            $wdtColumnTypes[$key] = self::wdtDetectColumnType($autodetectData[$key]);
        }
        return $wdtColumnTypes;
    }

    /**
     * Helper function that convert XML to Array
     * @param $xml SimpleXMLElement
     * @param bool $root
     * @return array|string
     */
    public static function convertXMLtoArr($xml, $root = true)
    {
        if (!$xml->children()) {
            return (string)$xml;
        }

        $array = array();
        foreach ($xml->children() as $element => $node) {
            $totalElement = count($xml->{$element});

            // Has attributes
            if ($attributes = $node->attributes()) {
                $data = array(
                    'attributes' => array(),
                    'value' => (count($node) > 0) ? self::xmlToArray($node, false) : (string)$node
                );

                foreach ($attributes as $attr => $value) {
                    $data['attributes'][$attr] = (string)$value;
                }

                $array[] = $data['attributes'];
            } else {
                if ($totalElement > 1) {
                    $array[][] = self::convertXMLtoArr($node, false);
                } else {
                    $array[$element] = self::convertXMLtoArr($node, false);
                }
            }
        }

        return $array;
    }

    /**
     * Helper function that check if the array is associative
     * @param $arr
     * @return bool
     */
    public static function isArrayAssoc($arr)
    {
        return array_keys($arr) !== range(0, count($arr) - 1);
    }

    /**
     * Helper function that detect single column type
     * @param $values
     * @return string
     */
    private static function wdtDetectColumnType($values)
    {
        if (self::_detect($values, 'WDTTools::wdtIsIP')) {
            return 'string';
        }
        if (self::_detect($values, 'WDTTools::wdtIsInteger')) {
            return 'int';
        }
        if (self::_detect($values, 'preg_match', WDT_TIME_12H_REGEX) || self::_detect($values, 'preg_match', WDT_TIME_24H_REGEX)) {
            return 'time';
        }
        if (self::_detect($values, 'WDTTools::wdtIsDateTime')) {
            return 'datetime';
        }
        if (self::_detect($values, 'WDTTools::wdtIsDate')) {
            return 'date';
        }
        if (self::_detect($values, 'preg_match', WDT_CURRENCY_REGEX) || self::wdtIsFloat($values)) {
            return 'float';
        }
        if (self::_detect($values, 'preg_match', WDT_EMAIL_REGEX)) {
            return 'email';
        }
        if (self::_detect($values, 'preg_match', WDT_URL_REGEX)) {
            return 'link';
        }
        return 'string';
    }


    /** @noinspection PhpUnusedPrivateMethodInspection
     * Function that checks if the passed value is integer
     * wdtIsInteger(23); //bool(true)
     * wdtIsInteger("23"); //bool(true)
     * @param $input
     * @return bool
     */
    private static function wdtIsInteger($input)
    {
        return ctype_digit((string)$input);
    }

    /**
     * Function that checks if the passed values are IP's
     * @param $input
     * @return bool
     */
    private static function wdtIsIP($input)
    {
        return (bool)filter_var($input, FILTER_VALIDATE_IP);
    }

    /**
     * Function that checks if the passed values are float
     * @param $values
     * @return bool
     */
    private static function wdtIsFloat($values)
    {
        $count = 0;
        for ($i = 0; $i < count($values); $i++) {
            if (is_null($values[$i])) continue;
            if (is_numeric(str_replace(array('.', ','), '', $values[$i]))) {
                $count++;
            }
        }

        return $count == count($values);
    }


    /** @noinspection PhpUnusedPrivateMethodInspection
     * Function that checks if the passed value is date
     * @param $input
     * @return bool
     */
    private static function wdtIsDate($input)
    {
        return strlen($input) > 5 &&
            (
                strtotime($input) ||
                strtotime(str_replace('/', '-', $input)) ||
                strtotime(str_replace(array('.', '-'), '/', $input))
            );
    }

    /** @noinspection PhpUnusedPrivateMethodInspection
     * Function that checks if the passed values is datetime
     * @param $input
     * @return bool
     */
    private static function wdtIsDateTime($input)
    {
        return (
                strtotime($input) ||
                strtotime(str_replace('/', '-', $input)) ||
                strtotime(str_replace(array('.', '-'), '/', $input))
            ) &&
            (
                call_user_func('preg_match', WDT_TIME_12H_REGEX, substr($input, strpos($input, ':') - 2, 5)) ||
                call_user_func('preg_match', WDT_TIME_24H_REGEX, substr($input, strpos($input, ':') - 2, 5))

            );
    }

    /**
     * @param $valuesArray
     * @param $checkFunction
     * @param string $regularExpression
     * @return bool
     * @throws WDTException
     */
    private static function _detect($valuesArray, $checkFunction, $regularExpression = '')
    {
        if (!is_callable($checkFunction)) {
            throw new WDTException('Please provide a valid type detection function for wpDataTables');
        }
        $count = 0;
        for ($i = 0; $i < count($valuesArray); $i++) {
            if ($regularExpression != '') {
                if ($valuesArray[$i] == null || call_user_func($checkFunction, $regularExpression, $valuesArray[$i])) {
                    $count++;
                } else {
                    return false;
                }
            } else {
                if ($valuesArray[$i] == null || call_user_func($checkFunction, $valuesArray[$i])) {
                    $count++;
                } else {
                    return false;
                }
            }
        }
        if ($count == count($valuesArray)) {
            return true;
        }
        return false;
    }

    /**
     * Helper function that converts PHP to Moment Date Format
     * @param $dateFormat
     * @return string
     */
    public static function convertPhpToMomentDateFormat($dateFormat)
    {
        $replacements = array(
            'd' => 'DD',
            'D' => 'ddd',
            'j' => 'D',
            'l' => 'dddd',
            'N' => 'E',
            'S' => 'o',
            'w' => 'e',
            'z' => 'DDD',
            'W' => 'W',
            'F' => 'MMMM',
            'm' => 'MM',
            'M' => 'MMM',
            'n' => 'M',
            't' => '', // no equivalent
            'L' => '', // no equivalent
            'o' => 'YYYY',
            'Y' => 'YYYY',
            'y' => 'YY',
            'a' => 'a',
            'A' => 'A',
            'B' => '', // no equivalent
            'g' => 'h',
            'G' => 'H',
            'h' => 'hh',
            'H' => 'HH',
            'i' => 'mm',
            's' => 'ss',
            'u' => 'SSS',
            'e' => 'zz', // deprecated since version 1.6.0 of moment.js
            'I' => '', // no equivalent
            'O' => '', // no equivalent
            'P' => '', // no equivalent
            'T' => '', // no equivalent
            'Z' => '', // no equivalent
            'c' => '', // no equivalent
            'r' => '', // no equivalent
            'U' => 'X',
        );

        return strtr($dateFormat, $replacements);
    }

    /**
     * Helper method to wrap values in quotes for DB
     */
    public static function wrapQuotes($value)
    {
        $valueQuote = get_option('wdtUseSeparateCon') ? "'" : '';
        return $valueQuote . $value . $valueQuote;
    }

    /**
     * Helper method to detect the headers that are present in formula
     * @param $formula
     * @param $headers
     * @return array
     */
    public static function getColHeadersInFormula($formula, $headers)
    {
        $headersInFormula = array();
        foreach ($headers as $header) {
            if (strpos($formula, $header) !== false) {
                $headersInFormula[] = $header;
            }
        }
        return $headersInFormula;
    }

    /**
     * Helper function which converts WP upload URL to Path
     * @param $uploadUrl
     * @return mixed
     */
    public static function urlToPath($uploadUrl)
    {
        $uploadsDir = wp_upload_dir();
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $uploadPath = str_replace($uploadsDir['baseurl'], str_replace('\\', '/', $uploadsDir['basedir']), $uploadUrl);
        } else {
            $uploadPath = str_replace($uploadsDir['baseurl'], $uploadsDir['basedir'], $uploadUrl);
        }
        return $uploadPath;
    }

    /**
     * Helper function which converts upload path to URL
     * @param $uploadPath
     * @return mixed
     */
    public static function pathToUrl($uploadPath)
    {
        $uploadsDir = wp_upload_dir();
        if (strtoupper(substr(PHP_OS, 0, 3)) === 'WIN') {
            $uploadUrl = str_replace(str_replace('\\', '/', $uploadsDir['basedir']), $uploadsDir['baseurl'], $uploadPath);
        } else {
            $uploadUrl = str_replace($uploadsDir['basedir'], $uploadsDir['baseurl'], $uploadPath);
        }
        return $uploadUrl;
    }


    /**
     * Helper function that convert hex color to rgba
     * @param $color
     * @param bool $opacity
     * @return string
     */
    public static function hex2rgba($color, $opacity = false)
    {

        $default = 'rgb(0,0,0)';

        //Return default if no color provided
        if (empty($color))
            return $default;

        //Sanitize $color if "#" is provided
        if ($color[0] == '#') {
            $color = substr($color, 1);
        }

        //Check if color has 6 or 3 characters and get values
        if (strlen($color) == 6) {
            $hex = array($color[0] . $color[1], $color[2] . $color[3], $color[4] . $color[5]);
        } elseif (strlen($color) == 3) {
            $hex = array($color[0] . $color[0], $color[1] . $color[1], $color[2] . $color[2]);
        } else {
            return $default;
        }

        //Convert hexadec to rgb
        $rgb = array_map('hexdec', $hex);

        //Check if opacity is set(rgba or rgb)
        if ($opacity) {
            if (abs($opacity) > 1)
                $opacity = 1.0;
            $output = 'rgba(' . implode(",", $rgb) . ',' . $opacity . ')';
        } else {
            $output = 'rgb(' . implode(",", $rgb) . ')';
        }

        //Return rgb(a) color string
        return $output;
    }

    /**
     * Sanitizes the cell string and wraps it with quotes
     * @param $string
     *
     * @return string
     */
    public static function prepareStringCell($string)
    {

        if (self::isHtml($string)) {
            $string = self::stripJsAttributes($string);
        }
        $string = self::wrapQuotes($string);
        return $string;
    }

    /**
     * Check if passed string is HTML element
     * @param $string
     * @return bool
     */
    public static function isHtml($string)
    {
        return preg_match("/<[^<]+>/", $string, $m) != 0;
    }

    /**
     * Function that strip JS attributes to prevent XSS attacks
     * @param $htmlString
     * @return bool|string
     */
    public static function stripJsAttributes($htmlString)
    {
        $htmlString = stripcslashes($htmlString);
        $htmlString = '<div>' . $htmlString . '</div>';
        if ( function_exists( 'mb_convert_encoding' ) ) {
            $domd = new DOMDocument();
            $domd_status = @$domd->loadHTML(mb_convert_encoding($htmlString, 'HTML-ENTITIES', 'UTF-8'), LIBXML_HTML_NOIMPLIED | LIBXML_HTML_NODEFDTD | LIBXML_NOERROR | LIBXML_NOWARNING);
            if ($domd_status) {
                foreach ($domd->getElementsByTagName('*') as $node) {
                    $remove = array();
                    foreach ($node->attributes as $attributeName => $attribute) {
                        if (substr($attributeName, 0, 2) == 'on') {
                            $remove[] = $attributeName;
                        }
                    }
                    foreach ($remove as $i) {
                        $node->removeAttribute($i);
                    }
                }
                return substr($domd->saveHTML($domd->documentElement), 5, -6);
            }
        }
        return $htmlString;
    }

    /**
     * Enqueue JS and CSS UI Kit files
     */
    public static function wdtUIKitEnqueue()
    {
        wp_enqueue_style('wdt-bootstrap', WDT_CSS_PATH . 'bootstrap/wpdatatables-bootstrap.min.css');
        wp_enqueue_style('wdt-bootstrap-select', WDT_CSS_PATH . 'bootstrap/bootstrap-select/bootstrap-select.min.css');
        wp_enqueue_style('wdt-bootstrap-tagsinput', WDT_CSS_PATH . 'bootstrap/bootstrap-tagsinput/bootstrap-tagsinput.css');
        wp_enqueue_style('wdt-bootstrap-datetimepicker', WDT_CSS_PATH . 'bootstrap/bootstrap-datetimepicker/bootstrap-datetimepicker.min.css');
        wp_enqueue_style('wdt-wp-bootstrap-datetimepicker', WDT_CSS_PATH . 'bootstrap/bootstrap-datetimepicker/wdt-bootstrap-datetimepicker.css');
        wp_enqueue_style('wdt-animate', WDT_CSS_PATH . 'animate/animate.min.css');
        wp_enqueue_style('wdt-uikit', WDT_CSS_PATH . 'uikit/uikit.css');
        wp_enqueue_style('wdt-wpdt-icons', WDT_ROOT_URL . 'assets/css/style.min.css', array(), WDT_CURRENT_VERSION);
        if (is_admin()) {
            wp_enqueue_style('wdt-bootstrap-tour-css', WDT_CSS_PATH . 'bootstrap/bootstrap-tour/bootstrap-tour.css', array(), WDT_CURRENT_VERSION);
            wp_enqueue_style('wdt-bootstrap-tour-guide-css', WDT_CSS_PATH . 'bootstrap/bootstrap-tour/bootstrap-tour-guide.css', array(), WDT_CURRENT_VERSION);
        }

        if (!is_admin() && get_option('wdtIncludeBootstrap') == 1) {
            wp_enqueue_script('wdt-bootstrap', WDT_JS_PATH . 'bootstrap/bootstrap.min.js', array('jquery'), WDT_CURRENT_VERSION, true);
        } else if (is_admin() && get_option('wdtIncludeBootstrapBackEnd') == 1) {
            wp_enqueue_script('wdt-bootstrap', WDT_JS_PATH . 'bootstrap/bootstrap.min.js', array('jquery'), WDT_CURRENT_VERSION, true);
        } else {
            wp_enqueue_script('wdt-bootstrap', WDT_JS_PATH . 'bootstrap/noconf.bootstrap.min.js', array('jquery'), WDT_CURRENT_VERSION, true);
        }
        if (is_admin()) {
            wp_enqueue_script('wdt-bootstrap-tour', WDT_JS_PATH . 'bootstrap/bootstrap-tour/bootstrap-tour.js', array('jquery'), WDT_CURRENT_VERSION, true);
            wp_enqueue_script('wdt-bootstrap-tour-guide', WDT_JS_PATH . 'bootstrap/bootstrap-tour/bootstrap-tour-guide.js', array('jquery'), WDT_CURRENT_VERSION, true);
            wp_localize_script('wdt-bootstrap-tour-guide', 'wpdtTutorialStrings', WDTTools::getTutorialsTranslationStrings());
        }
        wp_enqueue_script('wdt-bootstrap-tagsinput', WDT_JS_PATH . 'bootstrap/bootstrap-tagsinput/bootstrap-tagsinput.js', array(), false, true);
        wp_enqueue_script('wdt-moment', WDT_JS_PATH . 'moment/moment.js', array(), false, true);
        wp_enqueue_script('wdt-bootstrap-datetimepicker', WDT_JS_PATH . 'bootstrap/bootstrap-datetimepicker/bootstrap-datetimepicker.min.js', array(), false, true);
        wp_enqueue_script('wdt-bootstrap-growl', WDT_JS_PATH . 'bootstrap/bootstrap-growl/bootstrap-growl.min.js', array(), false, true);
        wp_enqueue_script('wdt-bootstrap-select', WDT_JS_PATH . 'bootstrap/bootstrap-select/bootstrap-select.min.js', array('jquery', 'wdt-bootstrap'), WDT_CURRENT_VERSION, true);
    }

    /**
     * Helper method to add PHP vars to JS vars
     * @param $varName
     * @param $phpVar
     */
    public static function exportJSVar($varName, $phpVar)
    {
        self::$jsVars[$varName] = $phpVar;
    }

    /**
     * Helper method to print PHP vars to JS vars
     */
    public static function printJSVars()
    {
        if (!empty(self::$jsVars)) {
            $jsBlock = '<script type="text/javascript">';
            foreach (self::$jsVars as $varName => $jsVar) {
                $jsBlock .= "var {$varName} = " . json_encode($jsVar) . ";";
            }
            $jsBlock .= '</script>';
            echo $jsBlock;
        }
    }

    /**
     * Helper method that converts provided String to Unix Timestamp
     * based on provided date format
     * @param $dateString
     * @param $dateFormat
     * @return false|int
     */
    public static function wdtConvertStringToUnixTimestamp($dateString, $dateFormat)
    {
        if ($dateString == '') return null;
        if (!$dateFormat) $dateFormat = get_option('wdtDateFormat');

        if (null !== $dateFormat && substr($dateFormat, 0,5) === 'd/m/Y') {
            $returnDate = strtotime(str_replace('/', '-', $dateString));
        } else if (null !== $dateFormat && in_array($dateFormat, ['m.d.Y', 'm-d-Y', 'm-d-y','d.m.y','Y.m.d','d-m-Y'])) {
            $returnDate = strtotime(str_replace(['.', '-'], '/', $dateString));
        } else if (null !== $dateFormat && $dateFormat == 'm/Y') {
            $dateObject = DateTime::createFromFormat($dateFormat, $dateString);
            if (!$dateObject) return strtotime($dateString);
            $returnDate = $dateObject->getTimestamp();
        } else {
            $returnDate = strtotime($dateString);
        }

        return $returnDate ?: '';
    }

    /**
     * Show error message
     * @param $errorMessage
     * @return string
     */
    public static function wdtShowError($errorMessage)
    {
        self::wdtUIKitEnqueue();
        ob_start();
        include WDT_ROOT_PATH . 'templates/common/error.inc.php';
        $errorBlock = ob_get_contents();
        ob_end_clean();
        return $errorBlock;
    }

    /**
     * Helper function to generate unique MySQL column headers
     * @param $header
     * @param $existing_headers
     * @return mixed|string
     */
    public static function generateMySQLColumnName($header, $existing_headers)
    {
        // Prepare the column MySQL title
        $column_header = self::slugify($header);

        // Add index until column header becomes unique
        if (in_array($column_header, $existing_headers)) {
            $index = 0;
            do {
                $index++;
                $try_column_header = $column_header . $index;
            } while (in_array($try_column_header, $existing_headers));
            $column_header = $try_column_header;
        }

        return $column_header;
    }

    /**
     * Helper function to translate special UTF-8 to latin for MySQL
     * @param $text
     * @return mixed|string
     */
    public static function slugify($text)
    {
        // replace non letter or digits by _
        $text = preg_replace('#[^\\pL\d]+#u', '_', $text);

        // trim
        $text = trim($text, '_');

        // transliterate
        if (function_exists('iconv')) {
            $text = iconv('UTF-8', 'ASCII//TRANSLIT//IGNORE', $text);
        }

        // lowercase
        $text = strtolower($text);

        // remove unwanted characters
        $text = preg_replace('#[^-\w]+#', '', $text);

        // WP sanitize
        $text = str_replace(array('-', '_'), '', sanitize_title($text));

        if (empty($text) || is_numeric($text)) {
            return 'wdtcolumn';
        }

        return $text;
    }

    /**
     * Get table count from database
     *
     * @param $filter
     * @return null|string
     */
    public static function getTablesCount($filter)
    {
        global $wpdb;
        $filter === 'table' ? $tableFromDB = 'wpdatatables' : $tableFromDB = 'wpdatacharts';
        $query = "SELECT COUNT(*) FROM {$wpdb->prefix}$tableFromDB";
        return (int)$wpdb->get_var($query);
    }

    /**
     * Get data for last insert table from database
     *
     * @param $filter
     * @return stdClass
     */
    public static function getLastTableData($filter)
    {
        global $wpdb;
        $filter === 'table' ? $tableFromDB = 'wpdatatables' : $tableFromDB = 'wpdatacharts';
        $query = "SELECT MAX(id) FROM {$wpdb->prefix}$tableFromDB";
        $lastID = $wpdb->get_var($query);
        $chartQuery = $wpdb->prepare(
            "SELECT * 
                        FROM " . $wpdb->prefix . "wpdatacharts 
                        WHERE id = %d",
            $lastID
        );

        if ($filter === 'table') {
            return WDTConfigController::loadTableFromDB($lastID);
        } else if ($filter === 'chart') {
            return $wpdb->get_row($chartQuery);
        }

    }

    /**
     * Convert Table type for readable content
     *
     * @param $tableType
     * @return string
     */
    public static function getConvertedTableType($tableType)
    {
        switch ($tableType) {
            case 'xls':
                return 'Excel';
                break;
            case 'csv':
                return 'CSV';
                break;
            case 'xml':
                return 'XML';
                break;
            case 'json':
                return 'JSON';
                break;
	        case 'nested_json':
		        return 'Nested JSON';
		        break;
            case 'serialized':
                return 'Serialized PHP array';
                break;
            case 'ivyforms':
                if (!class_exists('IvyForms\\Services\\API\\IvyFormsAPI')) {
                    return 'Unknown';
                }
                return 'IvyForms';
            default:
                if (in_array($tableType, WPDataTable::$allowedTableTypes)) {
                    return ucfirst($tableType);
                }
                return 'Unknown';
                break;
        }

    }
}

add_action('admin_footer', array('WDTTools', 'printJSVars'), 100);
