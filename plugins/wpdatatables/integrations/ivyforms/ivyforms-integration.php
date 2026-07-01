<?php

use IvyForms\Services\API\IvyFormsAPI;
use IvyForms\Services\Entry\Managers\EntryManager;

if ( ! defined( 'ABSPATH' ) ) {
	exit; // Exit if accessed directly.
}

class WdtIvyFormsIntegration {

	/**
	 * In-memory cache for signature data, keyed by md5 hash.
	 * Avoids passing the huge base64 string through wp_kses_post which can mangle it.
	 *
	 * @var array<string, string>
	 */
	private static $signature_cache = [];

	/**
	 * In-memory cache for rating options by field id.
	 *
	 * @var array<int, array>
	 */
	private static $rating_options_cache = [];

	/**
	 * Whether a wpDataTable ID is an IvyForms-backed table (cached per request).
	 *
	 * @var array<int, bool>
	 */
	private static $ivyforms_table_type_cache = [];

	/**
	 * True only while WPDataTable::arrayBasedConstruct runs for IvyForms (wp_kses_post + safecss).
	 *
	 * @var bool
	 */
	private static $relax_safecss_for_ivy_html = false;

	public static function init() {
		// Add ivyforms to allowed table types
		if (class_exists('WPDataTable')) {
			WPDataTable::$allowedTableTypes[] = 'ivyforms';
		}

		add_action( 'wpdatatables_enqueue_on_edit_page', array( __CLASS__, 'enqueueAssets' ) );
		add_action( 'wp_ajax_wpdatatables_get_ivy_forms_form_fields', array( __CLASS__, 'getIvyFormsFormFields' ) );
		add_action( 'wpdatatables_add_table_type_option', array( __CLASS__, 'addIvyFormsTableTypeOption' ) );
		add_action( 'wpdatatables_add_data_source_elements', array( __CLASS__, 'addIvyFormsOnDataSourceTab' ) );
		add_action('wp_ajax_wpdatatables_save_ivyforms_table_config', array('WdtIvyFormsIntegration', 'saveTableConfig'));
		add_action('wpdatatables_generate_ivyforms', array('WdtIvyFormsIntegration', 'ivyformsBasedConstruct'), 10, 3);
		add_action('wpdatatables_add_table_configuration_tab', array('WdtIvyFormsIntegration', 'addIvyformsTab'));
		add_action('wpdatatables_add_table_configuration_tabpanel', array('WdtIvyFormsIntegration', 'addIvyformsTabPanel'));
		add_filter('wpdatatables_filter_insert_table_array', array('WdtIvyFormsIntegration', 'extendTableConfig'));
		add_action('wp_ajax_ivyforms_one_click_install', array('WdtIvyFormsIntegration', 'oneClickInstallIvyForms'));
		add_filter( 'wpdatatables_filter_cell_output', array( __CLASS__, 'filterIvyFormsCellOutput' ), 10, 3 );
		add_filter( 'wpdatatables_filter_cell_val', array( __CLASS__, 'filterIvyFormsCellVal' ), 10, 2 );
		add_filter( 'safecss_filter_attr_allow_css', array( __CLASS__, 'allowIvyformsRichTextInlineCss' ), 10, 2 );
	}

    /**
     * Enqueue assets for table creation wizard
     *
     * @return void
     */
    public static function enqueueAssets() {
		wp_enqueue_script(
			'wdt-ivyforms-table-creation',
			plugin_dir_url( __FILE__ ) . 'assets/js/table_creation_wizard.js',
			array( 'jquery', 'wdt-common' ),
			null,
			true
		);
		wp_enqueue_script(
			'wdt-ivyforms-table-config',
			plugin_dir_url( __FILE__ ) . 'assets/js/ivyforms_table_config_object.js',
			array( 'jquery', 'wdt-common' ),
			null,
			true
		);
	}

    /**
     * AJAX handler to get form fields for a given form ID
     *
     * @return void
     */
    public static function getIvyFormsFormFields() {
        $formId = intval($_POST['form_id'] ?? 0);
        if ($formId) {
            $fields = IvyFormsAPI::getFields($formId);
            $field_columns = [];
            $field_ids = [];
            foreach ($fields as $field) {
                $field_id = $field->getId();
                $field_columns[] = [
                    'id' => $field_id,
                    'label' => $field->getFieldGeneralSettings()->getLabel()
                ];
                $field_ids[] = $field_id;
            }
            $entry_columns = EntryManager::getAllEntryColumns();
            $entry_data = [];
            foreach ($entry_columns as $key => $label) {
                if (!in_array($key, $field_ids, true)) {
                    $entry_data[] = [
                        'id' => $key,
                        'label' => $label
                    ];
                }
            }
            wp_send_json_success([
                'fields' => $field_columns,
                'entry_data' => $entry_data
            ]);
        } else {
            wp_send_json_error(esc_html__('No form ID.', 'wpdatatables') );
        }
    }

    /**
     * Add IvyForms option to table type dropdown
     *
     * @return void
     */
    public static function addIvyFormsTableTypeOption() {
        if (isset($_GET['source']) && $_GET['source'] === 'ivyforms') {
            echo '<option value="ivyforms">IvyForms Form</option>';
        }
    }

    /**
     * Add IvyForms specific fields to data source tab
     *
     * @return void
     */
    public static function addIvyFormsOnDataSourceTab() {
        $ivyforms_installed = class_exists('IvyForms\Services\API\IvyFormsAPI') && method_exists('IvyForms\Services\API\IvyFormsAPI', 'isPluginActive') && \IvyForms\Services\API\IvyFormsAPI::isPluginActive();
        $ivyforms_needs_update = false;
        $integration_enabled = false;
        $forms_for_template = [];

        if ($ivyforms_installed) {
            if (defined('IVYFORMS_VERSION') && version_compare(IVYFORMS_VERSION, '0.5', '<')) {
                $ivyforms_needs_update = true;
            }
            if (method_exists('IvyForms\Services\API\IvyFormsAPI', 'isIntegrationEnabled')) {
                $integration_enabled = IvyFormsAPI::isIntegrationEnabled('wpdatatables');
            }
            if ($integration_enabled && method_exists('IvyForms\Services\API\IvyFormsAPI', 'getFormsWithIntegrationEnabled')) {
                $forms_for_template = IvyFormsAPI::getFormsWithIntegrationEnabled('wpdatatables');
                if (is_wp_error($forms_for_template)) {
                    $forms_for_template = [];
                }
            }
        }
        include __DIR__ . '/templates/data_source_block.inc.php';
        include __DIR__ . '/templates/fields_block.inc.php';
    }

    /**
     * Save IvyForms table config
     *
     * @return void
     */
    public static function saveTableConfig() {
        $nonce = sanitize_text_field($_POST['nonce'] ?? '');

        if (!current_user_can('manage_options') || !wp_verify_nonce($nonce, 'wdtEditNonce')) {
            wp_send_json_error(esc_html__('Permission denied.', 'wpdatatables') );
            exit();
        }

        $ivyFormsData = self::sanitizeIvyformsConfig(json_decode(
            stripslashes_deep($_POST['ivyforms'] ?? '{}')
        ));

        if ($ivyFormsData->formId) {
            $table = json_decode(stripslashes_deep($_POST['table']));
            $table->content = json_encode(
                array(
                    'formId' => $ivyFormsData->formId,
                    'fieldIds' => $ivyFormsData->fields
                )
            );

            WDTConfigController::saveTableConfig($table);
        } else {
            echo json_encode(array('error' => esc_html__('Form data could not be read!', 'wpdatatables') ));
        }
        exit();
    }

    /**
     * Sanitize IvyForms config
     *
     * @param object $ivyFormsData
     * @return object
     */
    public static function sanitizeIvyformsConfig(object $ivyFormsData) {
        $sanitized = new stdClass();

        if (isset($ivyFormsData->fields)) {
            $sanitized->fields = array_map('sanitize_text_field', (array)$ivyFormsData->fields);
        } else {
            $sanitized->fields = [];
        }

        if (isset($ivyFormsData->formId)) {
            $sanitized->formId = (int)$ivyFormsData->formId;
        } else {
            $sanitized->formId = null;
        }

        if (isset($ivyFormsData->dateFrom)) {
            $sanitized->dateFrom = sanitize_text_field($ivyFormsData->dateFrom);
        } else {
            $sanitized->dateFrom = null;
        }

        if (isset($ivyFormsData->dateTo)) {
            $sanitized->dateTo = sanitize_text_field($ivyFormsData->dateTo);
        } else {
            $sanitized->dateTo = null;
        }

        if (isset($ivyFormsData->filterByUser)) {
            $sanitized->filterByUser = (int)$ivyFormsData->filterByUser;
        } else {
            $sanitized->filterByUser = null;
        }

        if (isset($ivyFormsData->filterByStarred)) {
            $sanitized->filterByStarred = (bool)$ivyFormsData->filterByStarred;
        } else {
            $sanitized->filterByStarred = false;
        }

        if (isset($ivyFormsData->filterByRead)) {
            $sanitized->filterByRead = sanitize_text_field($ivyFormsData->filterByRead);
        } else {
            $sanitized->filterByRead = null;
        }

        return $sanitized;
    }

    /**
     * Construct table data from IvyForms entries
     * @throws Exception
     */
    public static function ivyformsBasedConstruct($wpDataTable, $content, $params) {
        // Check if IvyFormsAPI exists and global integration is enabled
        if (!class_exists('IvyForms\Services\API\IvyFormsAPI') || !IvyFormsAPI::isIntegrationEnabled('wpdatatables')) {
            throw new WDTException(__('IvyForms must be active and wpDataTables integration must be enabled to display data.', 'wpdatatables'));
        }
        $content = json_decode($content);
        // Per-form integration check
        $formId = isset($content->formId) ? (int)$content->formId : 0;
        $isFormIntegrationEnabled = IvyFormsAPI::isIntegrationEnabledForForm($formId, 'wpdatatables');
        if (is_wp_error($isFormIntegrationEnabled)) {
            throw new WDTException(__('Error checking form integration settings: ', 'wpdatatables') . $isFormIntegrationEnabled->get_error_message());
        }
        if (!$isFormIntegrationEnabled) {
            throw new WDTException(__('wpDataTables integration is not enabled for this form. Please enable it in the form settings.', 'wpdatatables'));
        }
        /** @var WPDataTable $wpDataTable */
        if ($wpDataTable->getWpId()) {
            $table = WDTConfigController::loadTableFromDB($wpDataTable->getWpId());
            $ivyFormsData = isset($table->advanced_settings) ? json_decode($table->advanced_settings)->ivyforms : null;
        } else {
            $ivyFormsData = null;
        }
        if (empty($params['columnTitles'])) {
            $params['columnTitles'] = self::getColumnHeaders($content->formId, $content->fieldIds);
        }
        $form_array = self::generateFormArray( $content, $ivyFormsData );
        self::$relax_safecss_for_ivy_html = true;
        try {
            $wpDataTable->arrayBasedConstruct( $form_array, $params );
        } finally {
            self::$relax_safecss_for_ivy_html = false;
        }
    }

	/**
	 * Allow IvyForms HTML field inline styles through safecss while arrayBasedConstruct runs wp_kses_post.
	 *
	 * Core safecss rejects declarations containing "(" (e.g. color: rgb(...)) or "&" (e.g. font-family),
	 * which IvyForms/Vue commonly emit.
	 *
	 * @param bool   $allow Whether the CSS fragment passed core's character checks.
	 * @param string $css_test_string Single declaration under test (e.g. "color: rgb(1, 2, 3)").
	 * @return bool
	 */
	public static function allowIvyformsRichTextInlineCss( $allow, $css_test_string ) {
		if ( $allow || ! self::$relax_safecss_for_ivy_html ) {
			return $allow;
		}

		if ( ! is_string( $css_test_string ) ) {
			return false;
		}

		$t = trim( $css_test_string );
		if ( '' === $t ) {
			return false;
		}

		if ( preg_match( '/\b(?:url|expression|javascript|@import|behavior|-moz-binding)\s*\(/i', $t ) ) {
			return false;
		}

		if ( preg_match(
			'/^(?:color|background-color|border-color)\s*:\s*rgba?\(\s*\d{1,3}\s*,\s*\d{1,3}\s*,\s*\d{1,3}(?:\s*,\s*(?:0?\.\d+|1(?:\.0)?))?\s*\)\s*$/i',
			$t
		) ) {
			return true;
		}

		if ( preg_match(
			'/^(?:color|background-color|border-color)\s*:\s*hsla?\(\s*[\d.]+\s*,\s*[\d.]+%\s*,\s*[\d.]+%(?:\s*,\s*(?:0?\.\d+|1(?:\.0)?))?\s*\)\s*$/i',
			$t
		) ) {
			return true;
		}

		if ( preg_match( '/^font-family\s*:/iu', $t ) && false !== strpos( $t, '&' ) ) {
			if ( preg_match(
				'/^font-family\s*:\s*(?:[\p{L}\p{N}\s\-_,.\'"]|&(?:#(?:x[0-9a-f]+|[0-9]+)|[a-z]+);)+$/iu',
				$t
			) ) {
				return true;
			}
		}

		return false;
	}

    /**
     * Get form entries from IvyFormsAPI
     *
     * @param int $formId
     * @param array $criteria
     * @return array
     */
    public static function getFormEntriesFromAPI(int $formId, array $criteria = []): array
    {
        $entries = IvyFormsAPI::getFormEntries($formId, $criteria);
        return is_wp_error($entries) ? [] : $entries;
    }

    /**
     * Generate form array for wpDataTables
     */
    public static function generateFormArray($content, $ivyFormsData): array
    {
        $tableArray = [];
        $origHeaders = [];

        // Allow perPage to be set in $ivyFormsData, default to 'all' for all entries
        // Will be implemented with server-side processing later
        if (!empty($ivyFormsData) && !isset($ivyFormsData->perPage)) {
            $ivyFormsData->perPage = 'all';
        }
        $searchCriteria = self::prepareSearchCriteria($ivyFormsData);
        $entries = self::getFormEntriesFromAPI($content->formId, $searchCriteria);

        if (empty($entries)) {
            return [];
        }

        // Get form fields
        $fields = IvyFormsAPI::getFields($content->formId);
        if (is_wp_error($fields)) {
            return [];
        }
        $usedOrigHeaders = [];

        foreach ($fields as $field) {
            $fieldId = $field->getId();
            if (in_array($fieldId, $content->fieldIds)) {
                // Generate MySQL-safe column name from field ID
                $origHeader = WDTTools::generateMySQLColumnName($fieldId, $usedOrigHeaders);
                $usedOrigHeaders[] = $origHeader;
                $origHeaders[$fieldId] = $origHeader;
            }
        }

        $entryColumns = EntryManager::getAllEntryColumns();
        foreach ($entryColumns as $key => $label) {
            if (in_array($key, $content->fieldIds)) {
                $origHeader = WDTTools::generateMySQLColumnName($key, $usedOrigHeaders);
                $usedOrigHeaders[] = $origHeader;
                $origHeaders[$key] = $origHeader;
            }
        }

        // Get entry fields for all entries
        $entriesWithFields = IvyFormsAPI::getEntryFields($entries);

        // Group fields by entryId
        $fieldsByEntryId = [];
        foreach ($entriesWithFields as $field) {
            $fieldsByEntryId[$field['entryId']][] = $field;
        }

        // Process each entry
        foreach ($entries as $entry) {
            $tableArrayEntry = [];

            // Attach fields to entry
            $entry['fields'] = $fieldsByEntryId[$entry['id']] ?? [];

            // Process form fields - only selected fields
            foreach ($fields as $field) {
                $fieldId = $field->getId();
                if (in_array($fieldId, $content->fieldIds)) {
                    $fieldData = self::prepareFieldsData($field, $entry);
                    $tableArrayEntry[$origHeaders[$fieldId]] = $fieldData;
                }
            }

            // Process entry metadata columns - only selected fields
            foreach ($entryColumns as $key => $label) {
                if (in_array($key, $content->fieldIds)) {
                    $value = '';
                    switch ($key) {
                        case 'id':
                            $value = $entry['id'] ?? '';
                            break;
                        case 'dateCreated':
                            $value = $entry['dateCreated'] ?? '';
                            break;
                        case 'formId':
                            $value = $entry['formId'] ?? '';
                            break;
                        case 'userId':
                            $value = $entry['userId'] ?? '';
                            break;
                        case 'ipAddress':
                            $value = $entry['ipAddress'] ?? '';
                            break;
                        case 'userAgent':
                            $value = $entry['userAgent'] ?? '';
                            break;
                        case 'sourceURL':
                            $value = $entry['sourceURL'] ?? '';
                            break;
                        case 'starred':
                            $value = !empty($entry['starred']) ? 'Yes' : 'No';
                            break;
                        case 'status':
                            $value = $entry['status'] ?? '';
                            break;
                    }
                    $tableArrayEntry[$origHeaders[$key]] = $value;
                }
            }

            $tableArray[] = $tableArrayEntry;
        }

        return $tableArray;
    }

    /**
     * Normalize a date string to YYYY-MM-DD format
     */
    private static function normalizeDate($dateStr) {
        // Try ISO first
        if (preg_match('/^\d{4}-\d{2}-\d{2}$/', $dateStr)) {
            return $dateStr;
        }
        // Try DD/MM/YYYY
        if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dateStr, $matches)) {
            return $matches[3] . '-' . $matches[2] . '-' . $matches[1];
        }
        // Try MM/DD/YYYY
        if (preg_match('/^(\d{2})\/(\d{2})\/(\d{4})$/', $dateStr, $matches)) {
            // This will be ambiguous, but fallback to DD/MM/YYYY above
            return $matches[3] . '-' . $matches[1] . '-' . $matches[2];
        }
        // Try YYYY/MM/DD
        if (preg_match('/^(\d{4})\/(\d{2})\/(\d{2})$/', $dateStr, $matches)) {
            return $matches[1] . '-' . $matches[2] . '-' . $matches[3];
        }
        // Fallback: try strtotime
        $ts = strtotime($dateStr);
        if ($ts !== false) {
            return date('Y-m-d', $ts);
        }
        // If all fails, return as is
        return $dateStr;
    }

    /**
     * Prepare search criteria for API queries
     */
    public static function prepareSearchCriteria($ivyFormsData): array
    {
        $criteria = [];
        if ($ivyFormsData === null) {
            return $criteria;
        }
        // Build filters for EntryRepository
        $filters = [];
        // Date filtering: build dateRange
        if (!empty($ivyFormsData->dateFrom) || !empty($ivyFormsData->dateTo)) {
            $dateFrom = !empty($ivyFormsData->dateFrom) ? self::normalizeDate($ivyFormsData->dateFrom) : null;
            $dateTo = !empty($ivyFormsData->dateTo) ? self::normalizeDate($ivyFormsData->dateTo) : null;
            $criteria['dateRange'] = [$dateFrom, $dateTo];
        }
        // User filtering
        if (!empty($ivyFormsData->filterByUser)) {
            $filters['userId'] = $ivyFormsData->filterByUser;
        }
        // Starred filtering
        if (!empty($ivyFormsData->filterByStarred)) {
            $filters['starred'] = true;
        }
        // Read/Unread filtering
        if (!empty($ivyFormsData->filterByRead)) {
            $filters['status'] = $ivyFormsData->filterByRead;
        }
        $criteria['filters'] = $filters;

        // Add perPage if set in ivyFormsData
        if (isset($ivyFormsData->perPage)) {
            $criteria['perPage'] = $ivyFormsData->perPage;
        }
        return $criteria;
    }

    /**
     * Add Ivyforms tab to table config UI
     */
    public static function addIvyformsTab() {
        ob_start();
        include __DIR__ . '/templates/ivyforms_tab.inc.php';
        $ivyTabpanel = apply_filters('wpdatatables_ivyforms_tabpanel', ob_get_contents());
        ob_end_clean();

        echo $ivyTabpanel;
    }

    /**
     * Add Ivyforms tab panel to table config UI
     */
    public static function addIvyformsTabPanel() {
        if (file_exists(__DIR__ . '/templates/ivyforms_tab_panel.inc.php')) {
            include __DIR__ . '/templates/ivyforms_tab_panel.inc.php';
        }
    }

    /**
     * Extend table config before saving
     */
    public static function extendTableConfig($tableArray) {
        if ($tableArray['table_type'] !== 'ivyforms') {
            return $tableArray;
        }

        $ivyFormsData = self::sanitizeIvyformsConfig(json_decode(
            stripslashes_deep($_POST['ivyforms'] ?? '{}')
        ));

        $advancedSettings = json_decode($tableArray['advanced_settings'] ?? '{}');
        $advancedSettings->ivyforms = array(
            'dateFrom' => $ivyFormsData->dateFrom,
            'dateTo' => $ivyFormsData->dateTo,
            'filterByUser' => $ivyFormsData->filterByUser,
            'filterByStarred' => $ivyFormsData->filterByStarred,
            'filterByRead' => $ivyFormsData->filterByRead
        );

        $tableArray['advanced_settings'] = json_encode($advancedSettings);

        return $tableArray;
    }

    /**
     * One-click install and activate IvyForms plugin
     */
    public static function oneClickInstallIvyForms()
    {
        check_ajax_referer('ivyforms_install', 'nonce');

        if (!current_user_can('install_plugins')) {
            wp_send_json_error(esc_html__('Permission denied.', 'wpdatatables') );
        }

        include_once ABSPATH . 'wp-admin/includes/plugin-install.php';
        include_once ABSPATH . 'wp-admin/includes/file.php';
        include_once ABSPATH . 'wp-admin/includes/misc.php';
        include_once ABSPATH . 'wp-admin/includes/plugin.php';

        $plugin_slug = 'ivyforms';
        $plugin_file = $plugin_slug . '/' . $plugin_slug . '.php';
        $plugin_path = WP_PLUGIN_DIR . '/' . $plugin_file;

        // Check if plugin is already installed
        if (file_exists($plugin_path)) {
            // Plugin is installed, just activate it
            $activate = activate_plugin($plugin_file);

            if (is_wp_error($activate)) {
                wp_send_json_error(esc_html__('Activation failed: ', 'wpdatatables') . $activate->get_error_message());
            }

            wp_send_json_success(['message' => 'Plugin activated successfully']);
        } else {
            // Plugin is not installed, install and activate it
            include_once ABSPATH . 'wp-admin/includes/class-wp-upgrader.php';

            $api = plugins_api('plugin_information', array('slug' => $plugin_slug, 'fields' => array('sections' => false)));

            if (is_wp_error($api)) {
                wp_send_json_error(esc_html__('Could not fetch plugin info', 'wpdatatables') );
            }

            $upgrader = new Plugin_Upgrader();
            $result = $upgrader->install($api->download_link);

            if (is_wp_error($result)) {
                wp_send_json_error(esc_html__('Install failed: ', 'wpdatatables') . $result->get_error_message());
            }

            $activate = activate_plugin($plugin_file);

            if (is_wp_error($activate)) {
                wp_send_json_error(esc_html__('Activation failed: ', 'wpdatatables') . $activate->get_error_message());
            }

            wp_send_json_success(['message' => esc_html__('Plugin installed and activated successfully', 'wpdatatables') ]);
        }
    }

    /**
     * Get column headers from Ivyforms form fields
     *
     * @param int $formId
     * @param array $fieldIds
     * @return array
     */
    public static function getColumnHeaders(int $formId, array $fieldIds): array
    {
        $columnHeaders = [];

        $fields = IvyFormsAPI::getFields($formId);
        if (is_wp_error($fields)) {
            return $columnHeaders;
        }

        $usedOrigHeaders = [];

        // Process form fields - only for selected fields
        foreach ($fields as $field) {
            $fieldId = $field->getId();
            if (in_array($fieldId, $fieldIds)) {
                $label = $field->getFieldGeneralSettings()->getLabel();
                $origHeader = WDTTools::generateMySQLColumnName($fieldId, $usedOrigHeaders);
                $usedOrigHeaders[] = $origHeader;
                $columnHeaders[$origHeader] = $label;
            }
        }

        // Process entry columns - only for selected fields
        $entryColumns = EntryManager::getAllEntryColumns();
        foreach ($entryColumns as $key => $label) {
            if (in_array($key, $fieldIds)) {
                $origHeader = WDTTools::generateMySQLColumnName($key, $usedOrigHeaders);
                $usedOrigHeaders[] = $origHeader;
                $columnHeaders[$origHeader] = $label;
            }
        }

        return $columnHeaders;
    }

	/**
	 * Check if a string is a valid data-URI image with base64 payload.
	 *
	 * @param string $data The data to check (may omit leading `data:` if it starts with `image/`).
	 * @return bool
	 */
	private static function is_valid_base64_image( $data ): bool {
		if ( ! is_string( $data ) ) {
			return false;
		}

		$normalized = trim( $data );
		if ( '' === $normalized ) {
			return false;
		}

		if ( 0 !== stripos( $normalized, 'data:' ) && 0 === stripos( $normalized, 'image/' ) ) {
			$normalized = 'data:' . $normalized;
		}

		if ( false === strpos( $normalized, ',' ) ) {
			return false;
		}

		list($header, $base64_string) = explode( ',', $normalized, 2 );
		$header       = trim( $header );
		$base64_string = trim( $base64_string );

		if ( '' === $header || '' === $base64_string ) {
			return false;
		}

		if ( ! preg_match( '/^data:image\/[^;]+;base64/i', $header ) ) {
			return false;
		}

		return false !== base64_decode( $base64_string, true );
	}

	/**
	 * Extract raw image source from possible signature value formats.
	 *
	 * @param mixed $value Entry field value.
	 * @return string
	 */
	private static function extract_signature_image_source( $value ): string {
		if ( ! is_string( $value ) ) {
			return '';
		}

		$decoded_value = html_entity_decode( $value, ENT_QUOTES | ENT_HTML5, 'UTF-8' );
		$trimmed_value = trim( $decoded_value );

		if ( '' === $trimmed_value ) {
			return '';
		}

		if ( preg_match( '/^<img\\b[^>]*\\bsrc\\s*=\\s*(["\'])(.*?)\\1/i', $trimmed_value, $matches ) ) {
			return trim( $matches[2] );
		}

		if ( preg_match( '/^<img\\b[^>]*\\bsrc\\s*=\\s*([^\s>]+)/i', $trimmed_value, $matches ) ) {
			return trim( $matches[1], " \t\n\r\0\x0B\"'" );
		}

		return $trimmed_value;
	}

	/**
	 * Normalize signature data to proper data URL format.
	 *
	 * @param string $value The signature value.
	 * @return string
	 */
	private static function normalize_signature_data_url( string $value ): string {
		$value = trim( $value );

		if ( 0 === stripos( $value, 'data:' ) ) {
			return $value;
		}

		if ( preg_match( '/^image\/[^;]+;base64,/i', $value ) ) {
			return 'data:' . $value;
		}

		return $value;
	}

	/**
	 * IvyForms HTML block field type (slug is `html` in FieldType / builder).
	 *
	 * @param mixed $field_type Raw type from Field::getType().
	 * @return bool
	 */
	private static function is_html_field_type( $field_type ): bool {
		return is_string( $field_type ) && 0 === strcasecmp( trim( $field_type ), 'html' );
	}

	/**
	 * IvyForms signature field type.
	 *
	 * @param mixed $field_type Raw type from Field::getType().
	 * @return bool
	 */
	private static function is_signature_field_type( $field_type ): bool {
		return is_string( $field_type ) && 'signature' === strtolower( trim( $field_type ) );
	}

	/**
	 * Read htmlContent from field settings for HTML field type.
	 *
	 * @param object $field Field object.
	 * @return string
	 */
	private static function get_html_field_content( $field ): string {
		if ( ! is_object( $field ) ) {
			return '';
		}

		if ( method_exists( $field, 'getFieldGeneralSettings' ) ) {
			$general_settings = $field->getFieldGeneralSettings();

			if ( is_object( $general_settings ) && method_exists( $general_settings, 'getHtmlContent' ) ) {
				return (string) $general_settings->getHtmlContent();
			}

			if ( is_object( $general_settings ) && method_exists( $general_settings, 'toArray' ) ) {
				$settings_arr = $general_settings->toArray();
				if ( isset( $settings_arr['htmlContent'] ) && is_string( $settings_arr['htmlContent'] ) ) {
					return $settings_arr['htmlContent'];
				}
			}
		}

		if ( method_exists( $field, 'toArray' ) ) {
			$field_arr = $field->toArray();

			if ( isset( $field_arr['htmlContent'] ) && is_string( $field_arr['htmlContent'] ) ) {
				return $field_arr['htmlContent'];
			}

			if ( isset( $field_arr['settings'] ) ) {
				$settings = is_array( $field_arr['settings'] )
					? $field_arr['settings']
					: json_decode( (string) $field_arr['settings'], true );

				if ( is_array( $settings ) && isset( $settings['htmlContent'] ) && is_string( $settings['htmlContent'] ) ) {
					return $settings['htmlContent'];
				}
			}
		}

		return '';
	}

	/**
	 * Resolve rating meta from field settings and options.
	 *
	 * @param object $field Field object.
	 * @return array{max: float, icon: string}
	 */
	private static function get_rating_meta( $field ): array {
		$meta = array(
			'max'  => 5.0,
			'icon' => 'star',
		);

		if ( ! is_object( $field ) ) {
			return $meta;
		}

		if ( method_exists( $field, 'getFieldAdvancedSettings' ) ) {
			$advanced_settings = $field->getFieldAdvancedSettings();
			if ( is_object( $advanced_settings ) && method_exists( $advanced_settings, 'toArray' ) ) {
				$advanced_arr = $advanced_settings->toArray();
				if ( isset( $advanced_arr['ratingIcon'] ) && is_string( $advanced_arr['ratingIcon'] ) && '' !== $advanced_arr['ratingIcon'] ) {
					$meta['icon'] = strtolower( trim( $advanced_arr['ratingIcon'] ) );
				}
			}
		}

		if ( method_exists( $field, 'getFieldGeneralSettings' ) ) {
			$general_settings = $field->getFieldGeneralSettings();
			if ( is_object( $general_settings ) && method_exists( $general_settings, 'getMaxValue' ) ) {
				$configured_max = $general_settings->getMaxValue();
				if ( is_numeric( $configured_max ) && (float) $configured_max > 0 ) {
					$meta['max'] = (float) $configured_max;
				}
			}
		}

		$field_id = method_exists( $field, 'getId' ) ? (int) $field->getId() : 0;
		if ( $field_id > 0 ) {
			if ( ! array_key_exists( $field_id, self::$rating_options_cache ) ) {
				$options                                = IvyFormsAPI::getFieldOptions( $field_id );
				self::$rating_options_cache[ $field_id ] = is_wp_error( $options ) || ! is_array( $options ) ? array() : $options;
			}

			$options = self::$rating_options_cache[ $field_id ];

			if ( ! empty( $options ) ) {
				$numeric_values = array();

				foreach ( $options as $option ) {
					if ( is_object( $option ) && method_exists( $option, 'getValue' ) ) {
						$option_value = $option->getValue();
					} elseif ( is_array( $option ) && isset( $option['value'] ) ) {
						$option_value = $option['value'];
					} else {
						$option_value = null;
					}

					if ( is_numeric( $option_value ) ) {
						$numeric_values[] = (float) $option_value;
					}
				}

				if ( ! empty( $numeric_values ) ) {
					$max_from_options = max( $numeric_values );
					if ( $max_from_options > 0 ) {
						$meta['max'] = $max_from_options;
					}
				} else {
					$meta['max'] = (float) count( $options );
				}
			}
		}

		return $meta;
	}

	/**
	 * Resolve display markup by rating icon type.
	 *
	 * @param string $icon Icon slug.
	 * @param bool   $filled Whether the icon is filled.
	 * @return string
	 */
	private static function get_rating_icon_markup( string $icon, bool $filled ): string {
		$normalized = strtolower( trim( $icon ) );

		if ( in_array( $normalized, array( 'heart', 'hearts' ), true ) ) {
			return $filled ? '&#9829;' : '&#9825;';
		}

		if ( in_array( $normalized, array( 'like', 'likes', 'thumb', 'thumbs', 'thumbs-up', 'thumbs_up', 'thumb-up', 'thumb_up' ), true ) ) {
			return '<span class="dashicons dashicons-thumbs-up" aria-hidden="true"></span>';
		}

		return $filled ? '&#9733;' : '&#9734;';
	}

	/**
	 * Build rating placeholder marker from numeric value and field settings.
	 *
	 * @param mixed $value Stored rating value.
	 * @param object $field Field object.
	 * @return string
	 */
	private static function build_rating_placeholder( $value, $field ): string {
		if ( ! is_numeric( $value ) ) {
			return '';
		}

		$rating   = (float) $value;
		$meta     = self::get_rating_meta( $field );
		$icon_slug = preg_replace( '/[^a-z0-9_-]/', '', strtolower( $meta['icon'] ) );
		if ( '' === $icon_slug ) {
			$icon_slug = 'star';
		}

		return 'WDTRTG:' . $rating . ':' . $meta['max'] . ':' . $icon_slug;
	}

	/**
	 * Check if field type should be treated as rating.
	 *
	 * @param mixed $field_type Raw type string.
	 * @return bool
	 */
	private static function is_rating_field_type( $field_type ): bool {
		if ( ! is_string( $field_type ) ) {
			return false;
		}

		return 'rating' === strtolower( trim( $field_type ) );
	}

	/**
	 * Convert a rating marker to star-based HTML output.
	 *
	 * @param string $marker Placeholder marker.
	 * @return string
	 */
	private static function render_rating_placeholder( $marker ): string {
		if ( ! is_string( $marker ) || ! preg_match( '/^WDTRTG:([0-9]+(?:\.[0-9]+)?):([0-9]+(?:\.[0-9]+)?):([a-z0-9_-]+)$/', trim( $marker ), $matches ) ) {
			return $marker;
		}

		$rating    = (float) $matches[1];
		$max_rating = (float) $matches[2];
		$icon      = $matches[3];

		if ( $max_rating <= 0 ) {
			$max_rating = 5.0;
		}

		if ( $rating < 0 ) {
			$rating = 0.0;
		}

		if ( $rating > $max_rating ) {
			$rating = $max_rating;
		}

		$rounded_max = (int) round( $max_rating );
		if ( $rounded_max < 1 ) {
			$rounded_max = 1;
		}

		$filled = (int) round( $rating );
		if ( $filled < 0 ) {
			$filled = 0;
		}

		if ( $filled > $rounded_max ) {
			$filled = $rounded_max;
		}

		$rating_label = rtrim( rtrim( number_format( $rating, 2, '.', '' ), '0' ), '.' );
		$max_label    = rtrim( rtrim( number_format( $max_rating, 2, '.', '' ), '0' ), '.' );

		$icons_html = '';
		for ( $i = 1; $i <= $rounded_max; $i++ ) {
			$is_filled  = $i <= $filled;
			$symbols    = self::get_rating_icon_markup( $icon, $is_filled );
			$icon_class = $is_filled ? 'wdt-ivy-rating-icon-filled' : 'wdt-ivy-rating-icon-empty';
			$icon_style = $is_filled ? 'color:#FFD700;' : 'color:#CCCCCC;opacity:0.35;';
			$icons_html .= '<span class="wdt-ivy-rating-icon ' . esc_attr( $icon_class ) . '" style="' . esc_attr( $icon_style ) . '">' . $symbols . '</span>';
		}

		return '<span class="wdt-ivy-rating" title="' . esc_attr( $rating_label . '/' . $max_label ) . '">'
			. '<span class="wdt-ivy-rating-icons">' . $icons_html . '</span>'
			. ' <span class="wdt-ivy-rating-value">(' . esc_html( $rating_label . '/' . $max_label ) . ')</span>'
			. '</span>';
	}

	/**
	 * Convert a WDTSIG:<hash> cell string to an <img> tag using the in-request cache.
	 *
	 * @param string $trimmed_output Trimmed cell value matching WDTSIG pattern.
	 * @return string
	 */
	private static function render_signature_placeholder_from_marker( $trimmed_output ) {
		if ( ! preg_match( '/^WDTSIG:([a-f0-9]{32})$/', $trimmed_output, $matches ) ) {
			return $trimmed_output;
		}

		$hash = $matches[1];

		if ( ! isset( self::$signature_cache[ $hash ] ) ) {
			return '';
		}

		$data_url = self::normalize_signature_data_url( self::$signature_cache[ $hash ] );

		return '<img src="' . esc_attr( $data_url ) . '" alt="Signature" class="wdt-signature-image" style="max-width:100%;height:auto;max-height:200px;border:1px solid #ddd;border-radius:4px;" />';
	}

	/**
	 * Whether the table is IvyForms-backed (cached). Used so global cell filters skip non-Ivy tables cheaply.
	 *
	 * @param int $table_id Table ID from the filter.
	 * @return bool
	 */
	private static function is_ivyforms_data_table_id( $table_id ) {
		$table_id = absint( $table_id );
		if ( ! $table_id ) {
			return false;
		}

		if ( array_key_exists( $table_id, self::$ivyforms_table_type_cache ) ) {
			return self::$ivyforms_table_type_cache[ $table_id ];
		}

		if ( ! class_exists( 'WDTConfigController' ) ) {
			self::$ivyforms_table_type_cache[ $table_id ] = false;
			return false;
		}

		try {
			$table = WDTConfigController::loadTableFromDB( $table_id, true );
		} catch ( Exception $e ) {
			self::$ivyforms_table_type_cache[ $table_id ] = false;
			return false;
		}

		$is_ivyforms = is_object( $table ) && isset( $table->table_type ) && 'ivyforms' === $table->table_type;
		self::$ivyforms_table_type_cache[ $table_id ] = $is_ivyforms;

		return $is_ivyforms;
	}

	/**
	 * Replace WDTRTG / WDTSIG markers for IvyForms tables only.
	 *
	 * @param mixed $cell_content Raw or formatted cell string.
	 * @param int   $table_id wpDataTable ID.
	 * @return mixed
	 */
	private static function resolve_ivyforms_placeholder_markers( $cell_content, $table_id ) {
		if ( ! is_string( $cell_content ) ) {
			return $cell_content;
		}

		$trimmed          = trim( $cell_content );
		$is_rating_marker = ( 0 === strpos( $trimmed, 'WDTRTG:' ) );
		$is_signature_marker = (bool) preg_match( '/^WDTSIG:[a-f0-9]{32}$/', $trimmed );

		if ( ! $is_rating_marker && ! $is_signature_marker ) {
			return $cell_content;
		}

		if ( ! self::is_ivyforms_data_table_id( $table_id ) ) {
			return $cell_content;
		}

		if ( $is_rating_marker ) {
			return self::render_rating_placeholder( $cell_content );
		}

		return self::render_signature_placeholder_from_marker( $trimmed );
	}

	/**
	 * Prepare fields data for table display
	 *
	 * @param object $field Field instance.
	 * @param array  $entry Entry row.
	 * @return string
	 */
	public static function prepareFieldsData( $field, $entry ) {
		$field_id   = $field->getId();
		$field_type = $field->getType();

		if ( isset( $entry['fields'] ) && is_array( $entry['fields'] ) ) {
			foreach ( $entry['fields'] as $entry_field ) {
				if ( isset( $entry_field['fieldId'] ) && $entry_field['fieldId'] == $field_id ) {
					$field_value = $entry_field['fieldValue'] ?? '';

					if ( self::is_html_field_type( $field_type ) ) {
						$trimmed_html = is_string( $field_value ) ? trim( $field_value ) : '';
						if ( '' !== $trimmed_html ) {
							return $field_value;
						}

						return self::get_html_field_content( $field );
					}

					if ( self::is_rating_field_type( $field_type ) ) {
						$rating_placeholder = self::build_rating_placeholder( $field_value, $field );
						return '' !== $rating_placeholder ? $rating_placeholder : $field_value;
					}

					if ( self::is_signature_field_type( $field_type ) ) {
						$signature_source = self::extract_signature_image_source( $field_value );
						if ( self::is_valid_base64_image( $signature_source ) ) {
							$normalized_source = self::normalize_signature_data_url( $signature_source );
							$hash              = md5( $normalized_source );
							self::$signature_cache[ $hash ] = $normalized_source;

							return 'WDTSIG:' . $hash;
						}
					}

					return $field_value;
				}
			}
		}

		if ( self::is_html_field_type( $field_type ) ) {
			return self::get_html_field_content( $field );
		}

		return '';
	}

	/**
	 * Replace IvyForms rating/signature placeholders with HTML (cell output).
	 *
	 * @param mixed       $cell_output Cell content after column formatting.
	 * @param int         $table_id wpDataTable ID.
	 * @param string|null $column_name Column key (unused; kept for filter arity).
	 * @return mixed
	 */
	public static function filterIvyFormsCellOutput( $cell_output, $table_id, $column_name = null ) {
		return self::resolve_ivyforms_placeholder_markers( $cell_output, $table_id );
	}

	/**
	 * Same placeholder resolution for code paths that only apply cell_val.
	 *
	 * @param mixed $cell_value Cell value after prepareCellOutput.
	 * @param int   $table_id wpDataTable ID.
	 * @return mixed
	 */
	public static function filterIvyFormsCellVal( $cell_value, $table_id ) {
		return self::resolve_ivyforms_placeholder_markers( $cell_value, $table_id );
	}
}

add_action( 'init', array( 'WdtIvyFormsIntegration', 'init' ) );
