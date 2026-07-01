<?php

defined('ABSPATH') or die('Access denied.');

class WDTNestedJson
{
	private $_url = '';
	private $_method = 'get';
	private $_authOption = '';
	private $_username = '';
	private $_password = '';
	private $_customHeaders = [];
	private $_root = '';

	public function __construct($params = null)
	{
		if (isset($params->url))
			$this->setUrl($params->url);
		if (isset($params->method))
			$this->setMethod($params->method);
		if (isset($params->authOption))
			$this->setAuthOption($params->authOption);
		if (isset($params->username))
			$this->setUsername($params->username);
		if (isset($params->password))
			$this->setPassword($params->password);
		if (isset($params->customHeaders))
			$this->setCustomHeaders($params->customHeaders);
		if (isset($params->root))
			$this->setRoot($params->root);
	}

	/**
	 * @return mixed
	 */
	public function getUrl()
	{
		return $this->_url;
	}

	/**
	 * @param mixed $url
	 */
	public function setUrl($url)
	{
		$this->_url = $url;
	}

	/**
	 * @return string
	 */
	public function getMethod()
	{
		return $this->_method;
	}

	/**
	 * @param string $method
	 */
	public function setMethod($method)
	{
		$this->_method = $method;
	}

	/**
	 * @return string
	 */
	public function getAuthOption()
	{
		return $this->_authOption;
	}

	/**
	 * @param string $authOption
	 */
	public function setAuthOption($authOption)
	{
		$this->_authOption = $authOption;
	}

	/**
	 * @return string
	 */
	public function getUsername()
	{
		return $this->_username;
	}

	/**
	 * @param string $username
	 */
	public function setUsername($username)
	{
		$this->_username = $username;
	}

	/**
	 * @return string
	 */
	public function getPassword()
	{
		return $this->_password;
	}

	/**
	 * @param string $password
	 */
	public function setPassword($password)
	{
		$this->_password = $password;
	}

	/**
	 * @return array
	 */
	public function getCustomHeaders()
	{
		return $this->_customHeaders;
	}

	/**
	 * @param mixed $customHeaders
	 */
	public function setCustomHeaders($customHeaders)
	{
		$this->_customHeaders = $customHeaders;
	}

	/**
	 * @return string
	 */
	public function getRoot()
	{
		return $this->_root;
	}

	/**
	 * @param string $root
	 */
	public function setRoot($root)
	{
		$this->_root = $root;
	}

	/**
	 * Prepare Endpoint arguments
	 * @return array
	 */
	public function prepareEndPointArgs($tableID)
	{
		$endPointArgs = array(
			'method'    => strtoupper($this->getMethod()),
			'sslverify' => false,
			'timeout'   => 100
		);

		if ($this->getUsername() !== '' && $this->getPassword() !== '') {
			$endPointArgs['headers'] = array('Authorization' => 'Basic ' . base64_encode($this->getUsername() . ':' . $this->getPassword()));
		}

		if ($this->getCustomHeaders() !== []) {
			$customHeaders =  $this->getCustomHeaders();
			if (!empty($customHeaders)) {
				foreach ($customHeaders as $customHeader) {
					$headerKey   = $customHeader->setKeyName;
					$headerValue = $customHeader->setKeyValue;
					$endPointArgs['headers'][$headerKey] = $headerValue;
				}
			}
		}

		return apply_filters('wpdatatables_filter_nested_json_endpoint_args', $endPointArgs, $this->getAllArgs(), $tableID);
	}

	/**
	 * Get all JSON arguments
	 */
	public function getAllArgs()
	{
		$args = new stdClass();

		$args->url = $this->getUrl();
		$args->method = $this->getMethod();
		$args->authOption = $this->getAuthOption();
		$args->username = $this->getUsername();
		$args->password = $this->getPassword();
		$args->customHeaders = $this->getCustomHeaders();
		$args->root = $this->getRoot();

		return $args;
	}

	/**
	 * Get data from JSON
	 *
	 * @throws Exception
	 */
	public function getData($tableID)
	{
		$response = $this->getResponse($tableID);
		if ($response === '' || $response === null) {
			throw new Exception('Response is empty. Please check is valid URL.');
		}
		if (!is_array($response)) {
			throw new Exception($response);
		}

		return $this->getRowsByRootPath($response, $tableID);
	}

	/**
	 * Get response from JSON API
	 */
	public function getResponse($tableID)
	{
		$endPointArgs = $this->prepareEndPointArgs($tableID);
		$response = wp_remote_request($this->getUrl(), $endPointArgs);;
		if (is_wp_error($response) || !in_array(intval($response['response']['code']), array(200, 201), true)) {
			return wp_remote_retrieve_response_message($response);
		}
		$response_body = wp_remote_retrieve_body($response);

		return json_decode($response_body, true);
	}

	/**
	 * Get data by filtering array with root path
	 */
	private function getDataByRootPath($response, $root)
	{
		$filteredDataByChosenRoot = $response;
		foreach ($root as $tag) {
			if (array_key_exists($tag, $filteredDataByChosenRoot)) {
				$filteredDataByChosenRoot = $filteredDataByChosenRoot[$tag];
			} else {
				$temp = array();
				for ($depth = 0; $depth < count($filteredDataByChosenRoot); $depth++) {
					if (!isset($filteredDataByChosenRoot[$depth][$tag])) {
						continue;
					}
					$temp[] = $filteredDataByChosenRoot[$depth][$tag];
				}
				$filteredDataByChosenRoot = $temp;
			}
		}

		if (empty($filteredDataByChosenRoot)) {
			$filteredDataByChosenRoot = $response;
		}

		return $filteredDataByChosenRoot;
	}

	/**
	 * Get rows by filtering array with root path
	 * @throws Exception
	 */
	private function getRowsByRootPath($response, $tableID)
	{
		$root = explode('->', $this->getRoot());
		if (count($root) > 1) {
			array_shift($root);
		}
		$filteredDataByChosenRoot = $this->getDataByRootPath($response, $root);
		$data = $this->getFinalArray($filteredDataByChosenRoot, $tableID);
		$rows = $this->prepareFinalArrayWithSameStructure($data);

		return apply_filters('wpdatatables_filter_nested_json_rows_by_root_path', $rows, $this->getRoot(), $response);
	}

	/**
	 * Get final array data from response
	 */
	private function getFinalArray($filteredDataByChosenRoot, $tableID)
	{
		$oneLevelDeepArrayValues = apply_filters('wpdatatables_get_one_level_deep_json_data_from_array_as_string', false, $this->getUrl(), $tableID);
		$arrayValuesSeparator = apply_filters('wpdatatables_set_one_level_deep_json_data_separator', '<br>', $this->getUrl(), $tableID);
		$isArrayContainsOnlyArrays = array_filter($filteredDataByChosenRoot, 'is_array') === $filteredDataByChosenRoot;
		$data = [];
		if (!$isArrayContainsOnlyArrays) {
			$tempData = array();
			foreach ($filteredDataByChosenRoot as $filteredDataKey => $value) {
				if (is_array($value)) {
					if ($oneLevelDeepArrayValues) {
						foreach ($value as $keyVal => $val) {
							if (is_array($val)) {
								unset($value[$keyVal]);
							} else {
								if (!is_numeric($keyVal)) {
									$value[$keyVal] = $keyVal . ' = ' . $val;
								}
							}
						}
						$value = implode($arrayValuesSeparator, $value);
					} else {
						continue;
					}
				}
				$tempData[$filteredDataKey] = $value;
			}
			if(!empty($tempData))
				$data[] = $tempData;
		} else {
			foreach ($filteredDataByChosenRoot as $filteredData) {
				$tempData = array();
				foreach ($filteredData as $key => $value) {
					if (is_array($value)) {
						if ($oneLevelDeepArrayValues) {
							foreach ($value as $keyVal => $val) {
								if (is_array($val)) {
									unset($value[$keyVal]);
								} else {
									if (!is_numeric($keyVal)) {
										$value[$keyVal] = $keyVal . ' = ' . $val;
									}
								}
							}
							$value = implode($arrayValuesSeparator, $value);
						} else {
							continue;
						}
					}
					$tempData[$key] = $value;
				}
				if(!empty($tempData))
					$data[] = $tempData;
			}
		}
		return apply_filters('wpdatatables_filter_nested_json_final_array', $data, $filteredDataByChosenRoot, $tableID);
	}

	/**
	 * Prepare final array with same structure
	 * @throws Exception
	 */
	private function prepareFinalArrayWithSameStructure($data)
	{
		$keys = array();
		$rows = array();
		foreach ($data as $el) {
			if (empty($el)) return $rows;
			if (empty($keys)) {
				$keys = array_keys($el);
				continue;
			}
			$keys = array_intersect($keys, array_keys($el));
		}

		foreach ($data as $el) {
			$row = array();
			foreach ($el as $key => $value) {
				if (in_array($key, $keys, true)) {
					$row[$key] = $value;
				}
			}
			$rows[] = $row;
		}

		if (empty($rows[0]) || isset($rows[0][0]))
			throw new Exception('Unable to retrieve data for chosen root path.');

		return $rows;
	}

	/**
	 * Get root elements from JSON URL
	 */
	public function prepareRoots($parent, $now, $root, $array)
	{
		if (is_null($array)) {
			return null;
		}

		$root[] = $parent;
		foreach ($array as $key => $value) {
			if (is_array($value) && !empty($value)) {
				if (!is_numeric($key)) {
					$now = sprintf('%s%s%s', $parent, '->', $key);
					$root[] = $now;
				} else {
					$now = $parent;
				}
				$root = $this->prepareRoots($now, $key, $root, $value);
			}
		}

		return array_unique($root);
	}
}

