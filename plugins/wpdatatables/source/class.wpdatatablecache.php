<?php

use PhpOffice\PhpSpreadsheet\Shared\Date;

defined('ABSPATH') or die('Access denied.');

class WPDataTableCache
{

	public static function maybeCache($createCache, $tableID)
	{
		if ($tableID) {

			if (!$createCache) {
				self::delete($tableID);
				return false;
			}

			$cache = self::isCacheDataExist($tableID);

			if (!$cache) {
				return false;
			}

			if (isset($_POST['action']) && $_POST['action'] === 'wpdatatables_save_table_config') {
				self::delete($tableID);
				return false;
			}

			if (!isset($cache->data))
				return false;

			return json_decode($cache->data, true);
		}

		return false;
	}

	private static function updateData($tableID, $sourceData)
	{
		global $wpdb;
		if ($tableID) {
			$sourceData = self::filterUserData($sourceData, $tableID);
			$wpdb->update(
				$wpdb->prefix . "wpdatatables_cache",
				array(
					'data'         => json_encode($sourceData, JSON_NUMERIC_CHECK),
					'updated_time' => current_time('mysql'),
				),
				array('table_id' => $tableID)
			);
			if ($wpdb->last_error !== '') {
				self::_logErrors(
					'Update cache error:',
					$wpdb->last_error,
					1,
					$tableID
				);
			}
		} else {
			self::_logErrors(
				'Update cache error:',
				'Table ID is not set for auto update data.',
				1,
				$tableID
			);
		}
	}
	private static function filterUserData ($sourceData, $tableID){
		$filterSourceData= apply_filters('wpdatatables_filter_source_data_on_auto_update_cache', true, $tableID);
		if (!current_user_can('unfiltered_html') && $filterSourceData) {
			$tempSourceData = $sourceData;
			$sourceData = [];
			foreach ($tempSourceData as $index => $tempData) {
				foreach ($tempData as $key => $data) {
                    $sourceData[$index][wp_kses_post($key)] = is_null($data) ? sanitize_text_field($data) : wp_kses_post($data);
				}
			}
			return $sourceData;
		}
		return $sourceData;
	}

	public static function maybeSaveData($tableID, $tableType, $tableContent, $autoUpdate, $sourceData, $isCache)
	{
		global $wpdb;
		if ($tableID && $isCache) {
			if (!empty($sourceData)) {
				$sourceData = self::filterUserData($sourceData, $tableID);
				$wpdb->insert(
					$wpdb->prefix . "wpdatatables_cache",
					array(
						'table_id'      => $tableID,
						'table_type'    => $tableType,
						'table_content' => $tableContent,
						'auto_update'   => $autoUpdate,
						'data'          => json_encode($sourceData, JSON_NUMERIC_CHECK)
					)
				);
				if ($wpdb->last_error !== '')
					self::_logErrors('Save cache error:', $wpdb->last_error, 0, $tableID);

			}
		}
	}

	private static function delete($tableID)
	{
		if ($tableID) {
			global $wpdb;
			$wpdb->delete(
				$wpdb->prefix . "wpdatatables_cache",
				array(
					'table_id' => $tableID
				),
				array(
					'%d'
				)
			);
			if ($wpdb->last_error !== '')
				self::_logErrors('Delete cache error:', $wpdb->last_error, 0, $tableID);
		}
	}

	private static function isCacheDataExist($tableID)
	{
		global $wpdb;
		$cacheQuery = $wpdb->prepare(
			"SELECT data
                        FROM " . $wpdb->prefix . "wpdatatables_cache 
                        WHERE table_id = %d",
			$tableID
		);

		$cache = $wpdb->get_row($cacheQuery);

		if ($wpdb->last_error !== '') {
			self::_logErrors('Get cache data error:', $wpdb->last_error, 0, $tableID);
			return false;
		}

		if ($cache === null) {
			return false;
		}

		return $cache;
	}

	private static function getTablesWithCacheForAutoUpdate()
	{
		global $wpdb;
		$tablesForAutoUpdateQuery = "SELECT table_id, table_type, table_content, updated_time, data
                                              FROM " . $wpdb->prefix . "wpdatatables_cache 
                                              WHERE auto_update = 1
                                              ORDER BY id";

		$tablesForAutoUpdate = $wpdb->get_results($tablesForAutoUpdateQuery, ARRAY_A);

		if ($wpdb->last_error !== '') {
			self::_logErrors('Error get tables with cache:', $wpdb->last_error, 0, 0);
			return false;
		}

		if ($tablesForAutoUpdate === null) {
			return false;
		}

		return $tablesForAutoUpdate;
	}

	public static function addAutoUpdateHooks()
	{
		add_action('wp_ajax_wdtable_update_cache', array(__CLASS__, 'maybeAutoUpdate'));
		add_action('wp_ajax_nopriv_wdtable_update_cache', array(__CLASS__, 'maybeAutoUpdate'));
	}

	private static function _logErrors($title, $log, $autoUpdate, $tableID)
	{
		global $wpdb;
		$logMessage = 'wpDataTables - ';

		if ($title) {
			$logMessage = $logMessage . $title;
		}
		$logMessage = $logMessage . ' ' . $log;

		if ($tableID) {
			$logMessage = $logMessage . ' Table ID=' . $tableID;
			if ($autoUpdate) {
				$logError = current_time('mysql') . ' - ' . $title . ' ' . $log;
				$wpdb->query(
					$wpdb->prepare(
						"UPDATE " . $wpdb->prefix . "wpdatatables_cache
                           SET log_errors = %s WHERE table_id = %d",
						$logError,
						$tableID
					)
				);
			}
		}

		error_log($logMessage);
	}

	public static function maybeAutoUpdate()
	{
		$autoUpdateHash = get_option('wdtAutoUpdateHash');

		if ($autoUpdateHash !== $_GET['wdtable_cache_verify']) return;

		$cacheTables = self::getTablesWithCacheForAutoUpdate();

		if (!$cacheTables) {
			return;
		}

		foreach ($cacheTables as $cacheTable) {

			$result = self::_renderDataFromSource(
				$cacheTable['table_id'],
				$cacheTable['table_type'],
				$cacheTable['table_content']
			);

			if (isset($result['status']) && $result['status'] === 'success') {
				if (!isset($result['data'])) {
					self::_logErrors(
						'Auto update error message:',
						'Data array from source is not rendered.',
						1,
						$cacheTable['table_id']
					);
					continue;
				}

				$cacheData = json_decode($cacheTable['data'], true);

				if (!isset($cacheData[0])) {
					self::_logErrors(
						'Auto update error message:',
						'Data array from cache is empty.',
						1,
						$cacheTable['table_id']
					);
					continue;
				}

				if (!isset($result['data'][0])) {
					self::_logErrors(
						'Auto update error message:',
						'Data array from source is not rendered.',
						1,
						$cacheTable['table_id']
					);
					continue;
				}

				if (count($cacheData[0]) !== count($result['data'][0])) {
					self::_logErrors(
						'Auto update error message:',
						'Data array from source and cache do not have same number of keys(columns).',
						1,
						$cacheTable['table_id']
					);
					continue;
				}

				if (array_keys($cacheData[0]) !== array_keys($result['data'][0])) {
					self::_logErrors(
						'Auto update error message:',
						'Data array from source and cache do not have same keys(columns).',
						1,
						$cacheTable['table_id']
					);
					continue;
				}

				if ($cacheTable['data'] === json_encode($result['data'], JSON_NUMERIC_CHECK)) continue;

				self::updateData($cacheTable['table_id'], $result['data']);
			}
		}
	}

	private static function _renderDataFromSource($table_id, $source_type, $source)
	{
		if (empty($source)) {
			return [
				'status' => 'error',
				'error' => 'Source is empty.',
				'data' => []
			];
		}
		try {
			if (in_array($source_type, ['xlsx','ods', 'xls', 'csv'])) {
				$tableData = WDTConfigController::loadTableFromDB($table_id);
				$params = array(
					'dateInputFormat' => array(),
					'data_types' => array(),
				);
				if ($tableData) {
					foreach ($tableData->columns as $column) {
						if ($column->type !== 'autodetect') {
							$params['data_types'][$column->orig_header] = $column->type;
						}
						$params['dateInputFormat'][$column->orig_header] =
							isset($column->dateInputFormat) ? $column->dateInputFormat : null;
					}
				}

			}
			$dataArray = array();
			switch ($source_type) {
				case 'ods':
				case 'xlsx':
				case 'xls':
				case 'csv':
					ini_set('memory_limit', '2048M');
                    if (isset($tableData) && $tableData->file_location == 'wp_media_lib' && !file_exists($source)) {
						self::_logErrors(
							'Error message:',
							'Provided file ' . stripcslashes($source) . ' does not exist!',
							1,
							$table_id
						);
					}
					$format = substr(strrchr($source, "."), 1);
					$objReader = WPDataTable::createObjectReader($source);
                if (isset($tableData) && $tableData->file_location == 'wp_any_url'){
                    // Security Fix: Validate URL before file_get_contents to prevent SSRF/LFI
                    if (!filter_var($source, FILTER_VALIDATE_URL)) {
                        throw new Exception('Invalid URL format!');
                    }

                    // Prevent access to local files via file:// protocol
                    $parsedUrl = parse_url($source);
                    if (!isset($parsedUrl['scheme']) || !in_array(strtolower($parsedUrl['scheme']), array('http', 'https'), true)) {
                        throw new Exception('Only HTTP and HTTPS protocols are allowed!');
                    }

                    $file = @file_get_contents($source);
                    if ($file === false){
                        throw new Exception('There is an error opening the file!');
                    }
                    $tempFileName = 'tempfile.' . $format;
                    file_put_contents($tempFileName, $file);
                    $source = $tempFileName;
                }
					$objPHPExcel = $objReader->load($source);
					$objWorksheet = $objPHPExcel->getActiveSheet();
					$highestRow = $objWorksheet->getHighestRow();
					$highestColumn = $objWorksheet->getHighestDataColumn();

					$headingsArray = $objWorksheet->rangeToArray('A1:' . $highestColumn . '1', null, true, true, true);
					$headingsArray = array_map('trim', $headingsArray[1]);

					$r = -1;

					$dataRows = $objWorksheet->rangeToArray('A2:' . $highestColumn . $highestRow, null, true, true, true);
					for ($row = 2; $row <= $highestRow; ++$row) {
						if (max($dataRows[$row]) !== null) {
							++$r;
							foreach ($headingsArray as $dataColumnIndex => $dataColumnHeading) {
								$dataColumnHeading = trim(preg_replace('/\s\s+/', ' ', str_replace("\n", " ", $dataColumnHeading)));
								$dataArray[$r][$dataColumnHeading] = $dataRows[$row][$dataColumnIndex];
								$currentDateFormat = isset($params['dateInputFormat'][$dataColumnHeading]) ? $params['dateInputFormat'][$dataColumnHeading] : null;
								if (!empty($params['data_types'][$dataColumnHeading]) && in_array($params['data_types'][$dataColumnHeading], array('date', 'datetime', 'time'))) {
									if ($format === 'xls' || $format === 'ods') {
										$cell = $objPHPExcel->getActiveSheet()->getCell($dataColumnIndex . '' . $row);
										if (Date::isDateTime($cell) && $cell->getValue() !== null) {
											$dataArray[$r][$dataColumnHeading] = Date::excelToTimestamp($cell->getValue());
										} else {
											$dataArray[$r][$dataColumnHeading] = WDTTools::wdtConvertStringToUnixTimestamp($dataRows[$row][$dataColumnIndex], $currentDateFormat);
										}
									} elseif ($format === 'csv') {
										$dataArray[$r][$dataColumnHeading] = WDTTools::wdtConvertStringToUnixTimestamp($dataRows[$row][$dataColumnIndex], $currentDateFormat);
									}
								}
							}
						}
					}
					break;
				case 'xml':
					$dataArray = WPDataTable::xmlRenderData($source, $table_id);
					break;
				case 'json':
					$dataArray = WPDataTable::jsonRenderData($source, $table_id);
					break;
				case 'nested_json':
					$dataArray = WPDataTable::nestedJsonRenderData($source, $table_id);
					break;
				case 'serialized':
					$dataArray = WPDataTable::serializedPhpRenderData($source, $table_id);
					break;
				default:
					self::_logErrors('Error message:', 'Source type is unknown', 1, $table_id);
					return [
						'status' => 'error',
						'error' => 'Source type is unknown',
						'data' => []
					];
			}
		} catch (Exception $e) {
			self::_logErrors('Error message:', $e->getMessage(), 1, $table_id);
			return [
				'status' => 'error',
				'error' => $e->getMessage(),
				'data' => []
			];
		}

		if (empty($dataArray)) {
			self::_logErrors('Error message:', 'Data from source is empty', 1, $table_id);
			return [
				'status' => 'error',
				'error' => 'Data from source is empty',
				'data' => []
			];
		}

		return [
			'status' => 'success',
			'error' => '',
			'data' => $dataArray
		];
	}
}
WPDataTableCache::addAutoUpdateHooks();