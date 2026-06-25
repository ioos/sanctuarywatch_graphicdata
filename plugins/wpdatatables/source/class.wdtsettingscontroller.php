<?php

defined('ABSPATH') or die("Cannot access pages directly.");

/**
 * Created by PhpStorm.
 * User: miljkomilosevic
 * Date: 12/2/16
 * Time: 4:12 PM
 */
class WDTSettingsController {

	public static function sanitizeSettings( $settings ){
		foreach( $settings as $key=>&$setting ){
			if( is_array( $setting )){
				foreach( $setting as &$childSetting ){
					$childSetting = sanitize_text_field( $childSetting );
				}
			} elseif (function_exists('sanitize_textarea_field') && ($key === "wdtCustomJs" || $key === "wdtCustomCss")) {
                if ($key === "wdtCustomJs" && ! current_user_can( 'unfiltered_html' ) ) {
                    $setting = '';
                } else {
                    $setting = sanitize_textarea_field($setting);
                }
            } elseif ($key === 'wdtInterfaceLanguage') {
                // Security Fix: Prevent Path Traversal / LFI for language file (CVE-2026-28039)
                if (!empty($setting)) {
                    // Only allow basename (no directory traversal)
                    $setting = basename(sanitize_text_field($setting));

                    // Verify it's a valid language file
                    if (substr($setting, -8) !== '.inc.php') {
                        $setting = ''; // Invalid format, reject it
                    } else {
                        // Double-check the file exists in the lang directory
                        $langPath = WDT_ROOT_PATH . 'source/lang/' . $setting;
                        if (!file_exists($langPath) || !is_file($langPath)) {
                            $setting = ''; // File doesn't exist, reject it
                        }
                    }
                }
            } else{
				$setting = sanitize_text_field( $setting );
			}
		}

		return $settings;

	}

	public static function saveSettings( $settings ){
		$settings = self::sanitizeSettings( stripslashes_deep( $settings ) );
		$autoUpdateOption = (int)$settings['wdtAutoUpdateOption'];

		if (!$autoUpdateOption){
			global $wpdb;
			$wpdb->query(
				$wpdb->prepare(
					"UPDATE " . $wpdb->prefix . "wpdatatables_cache
                           SET auto_update = %d",
					$autoUpdateOption
				)
			);
			$wpdb->query(
				$wpdb->prepare(
					"UPDATE " . $wpdb->prefix . "wpdatatables
                           SET auto_update_cache = %d",
					$autoUpdateOption
				)
			);

		}

		foreach($settings as $key=>$value) {
            update_option($key, $value);
		}

        do_action('wpdatatables_after_save_settings');
	}

	public static function getCurrentPluginConfig() {
		return array(

		    'wdtSiteLink'               => get_option('wdtSiteLink'),

			'wdtInterfaceLanguage'      => get_option('wdtInterfaceLanguage'),
			'wdtTablesPerPage'          => get_option('wdtTablesPerPage'),
			'wdtDateFormat'             => get_option('wdtDateFormat'),
			'wdtTimeFormat'             => get_option('wdtTimeFormat'),
			'wdtBaseSkin'               => get_option('wdtBaseSkin'),
			'wdtNumberFormat'           => get_option('wdtNumberFormat'),
			'wdtRenderFilter'           => get_option('wdtRenderFilter'),
			'wdtDecimalPlaces'          => get_option('wdtDecimalPlaces'),
            'wdtCSVDelimiter'           => get_option('wdtCSVDelimiter'),
            'wdtSortingOrderBrowseTables'=> get_option('wdtSortingOrderBrowseTables'),
			'wdtTabletWidth'            => get_option('wdtTabletWidth'),
			'wdtMobileWidth'            => get_option('wdtMobileWidth'),
			'wdtPurchaseCode'           => get_option('wdtPurchaseCode'),
            'wdtGettingStartedPageStatus'=> get_option('wdtGettingStartedPageStatus'),
			'wdtIncludeBootstrap'       => get_option('wdtIncludeBootstrap'),
            'wdtIncludeBootstrapBackEnd'=> get_option('wdtIncludeBootstrapBackEnd'),
            'wdtPreventDeletingTables'  => get_option('wdtPreventDeletingTables'),
			'wdtParseShortcodes'        => get_option('wdtParseShortcodes'),
			'wdtNumbersAlign'           => get_option('wdtNumbersAlign'),
            'wdtBorderRemoval'          => get_option('wdtBorderRemoval'),
            'wdtBorderRemovalHeader'    => get_option('wdtBorderRemovalHeader'),
			'wdtUseSeparateCon'         => get_option('wdtUseSeparateCon'),
			'wdtMySQLHost'              => get_option('wdtMySqlHost'),
			'wdtMySqlDB'                => get_option('wdtMySqlDB'),
			'wdtMySqlUser'              => get_option('wdtMySqlUser'),
			'wdtMySqlPwd'               => get_option('wdtMySqlPwd'),
			'wdtMySqlPort'              => get_option('wdtMySqlPort'),
			'wdtCustomCss'              => get_option('wdtCustomCss'),
			'wdtCustomJs'               => get_option('wdtCustomJs'),
			'wdtMinifiedJs'             => get_option('wdtMinifiedJs'),
			'wdtSumFunctionsLabel'      => get_option('wdtSumFunctionsLabel'),
			'wdtAvgFunctionsLabel'      => get_option('wdtAvgFunctionsLabel'),
			'wdtMinFunctionsLabel'      => get_option('wdtMinFunctionsLabel'),
			'wdtMaxFunctionsLabel'      => get_option('wdtMaxFunctionsLabel'),
            'wdtFontColorSettings'      => get_option('wdtFontColorSettings') ? get_option('wdtFontColorSettings') : new stdClass(),
		    'wdtAutoUpdateOption'       => get_option('wdtAutoUpdateOption'),
            'wdtGoogleStableVersion' => get_option('wdtGoogleStableVersion'),
		);
	}

	/**
	 * Returns languages
	 */

	public static function getInterfaceLanguages(){

		$languages = array();

		foreach (glob(WDT_ROOT_PATH . 'source/lang/*.inc.php') as $lang_filename) {
			$lang_filename = str_replace(WDT_ROOT_PATH . 'source/lang/', '', $lang_filename);
			$name = ucwords(str_replace('_', ' ', $lang_filename));
			$name = str_replace('.inc.php', '', $name);
			$languages[] = array('file' => $lang_filename, 'name' => $name);
		}

		return $languages;
	}

	/**
	 * Returns system fonts
	 */
	public static function wdtGetSystemFonts() {
		$systemFonts = array(
			'Georgia, serif',
			'Palatino Linotype, Book Antiqua, Palatino, serif',
			'Times New Roman, Times, serif',
			'Arial, Helvetica, sans-serif',
			'Impact, Charcoal, sans-serif',
			'Lucida Sans Unicode, Lucida Grande, sans-serif',
			'Tahoma, Geneva, sans-serif',
			'Verdana, Geneva, sans-serif',
			'Courier New, Courier, monospace',
			'Lucida Console, Monaco, monospace'
		);

		$systemFonts = apply_filters('wpdatatables_get_system_fonts', $systemFonts);

		return $systemFonts;
	}

}
