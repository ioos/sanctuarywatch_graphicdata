<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

defined('ABSPATH') or die('Access denied.');

/**
 * Chart engine of wpDataTables plugin
 */
class WPDataChart
{
    protected $_id = NULL;
    protected $_wpdatatable_id = NULL;
    protected $_engine = '';
    protected $_type = '';
    protected $_range_type = 'all';
    protected $_selected_columns = array();
    protected $_row_range = array();
    protected $_follow_filtering = false;
    protected $_wpdatatable = NULL;
    protected $_user_defined_series_data = array();
    protected $_render_data = NULL;
    protected $_type_counters;
    // Chart
    protected $_width = 400;
    protected $_responsiveWidth = false;
    protected $_height = 400;
    protected $_group_chart = false;
    protected $_background_color = '#FFFFFF';
    // Series
    protected $_series = array();
    protected $_series_type = '';
    // Axes
    protected $_show_grid = true;
    protected $_vertical_axis_min;
    protected $_vertical_axis_max;
    protected $_axes = array(
        'major' => array(
            'label' => ''
        ),
        'minor' => array(
            'label' => ''
        )
    );
    // Title
    protected $_title = '';
    protected $_show_title = true;
    // Tooltip
    protected $_tooltip_enabled = true;
    // Render data
    protected $_json_chart_render_data = null;

    public function setId($id)
    {
        $this->_id = $id;
    }

    public function getId()
    {
        return $this->_id;
    }

    // Chart

    public function setWidth($width)
    {
        $this->_width = $width;
    }

    public function getWidth()
    {
        return $this->_width;
    }

    /**
     * @return bool
     */
    public function isResponsiveWidth()
    {
        return $this->_responsiveWidth;
    }

    /**
     * @param bool $responsiveWidth
     */
    public function setResponsiveWidth($responsiveWidth)
    {
        $this->_responsiveWidth = $responsiveWidth;
    }

    public function setHeight($height)
    {
        $this->_height = $height;
    }

    public function getHeight()
    {
        return $this->_height;
    }

    /**
     * @param bool $group_chart
     */
    public function setGroupChart($group_chart)
    {
        $this->_group_chart = $group_chart;
    }

    /**
     * @return bool
     */
    public function isGroupChart()
    {
        return $this->_group_chart;
    }

    /**
     * @param $background_color
     */
    public function setBackgroundColor($background_color)
    {
        $this->_background_color = $background_color;
    }

    /**
     * @return string
     */
    public function getBackgroundColor()
    {
        return $this->_background_color;
    }

    // Axes

    /**
     * @param $show_grid
     */
    public function setShowGrid($show_grid)
    {
        $this->_show_grid = (bool)$show_grid;
    }

    /**
     * @return bool
     */
    public function isShowGrid()
    {
        return $this->_show_grid;
    }

    /**
     * @param $label
     */
    public function setMajorAxisLabel($label)
    {
        $this->_axes['major']['label'] = $label;
    }

    /**
     * @return mixed
     */
    public function getMajorAxisLabel()
    {
        return $this->_axes['major']['label'];
    }

    /**
     * @param $label
     */
    public function setMinorAxisLabel($label)
    {
        $this->_axes['minor']['label'] = $label;
    }

    /**
     * @return mixed
     */
    public function getMinorAxisLabel()
    {
        return $this->_axes['minor']['label'];
    }

    /**
     * @param mixed $vertical_axis_min
     */
    public function setVerticalAxisMin($vertical_axis_min)
    {
        $this->_vertical_axis_min = $vertical_axis_min;
    }

    /**
     * @return mixed
     */
    public function getVerticalAxisMin()
    {
        return $this->_vertical_axis_min;
    }

    /**
     * @param mixed $vertical_axis_max
     */
    public function setVerticalAxisMax($vertical_axis_max)
    {
        $this->_vertical_axis_max = $vertical_axis_max;
    }

    /**
     * @return mixed
     */
    public function getVerticalAxisMax()
    {
        return $this->_vertical_axis_max;
    }

    // Title

    /**
     * @param string $title
     */
    public function setTitle($title)
    {
        $this->_title = $title;
    }

    /**
     * @return string
     */
    public function getTitle()
    {
        return $this->_title;
    }


    /**
     * @param bool $show_title
     */
    public function setShowTitle($show_title)
    {
        $this->_show_title = $show_title;
    }

    /**
     * @return bool
     */
    public function isShowTitle()
    {
        return $this->_show_title;
    }

    /**
     * @return bool
     */
    public function isTooltipEnabled()
    {
        return $this->_tooltip_enabled;
    }

    /**
     * @param bool $tooltip_enabled
     */
    public function setTooltipEnabled($tooltip_enabled)
    {
        $this->_tooltip_enabled = (bool)$tooltip_enabled;
    }


    /**
     * @param $series_data
     */
    public function setUserDefinedSeriesData($series_data)
    {
        if (is_array($series_data)) {
            $this->_user_defined_series_data = $series_data;
        }
    }

    /**
     * @return array
     */
    public function getUserDefinedSeriesData()
    {
        return $this->_user_defined_series_data;
    }


    /**
     * @param $engine
     */
    public function setEngine($engine)
    {
        $this->_engine = $engine;
    }

    /**
     * @return string
     */
    public function getEngine()
    {
        return $this->_engine;
    }

    /**
     * @param $type
     */
    public function setType($type)
    {
        $this->_type = $type;
    }

    /**
     * @return string
     */
    public function getType()
    {
        return $this->_type;
    }

    /**
     * @return string
     */
    public function getSeriesType()
    {
        return $this->_series_type;
    }

    /**
     * @param string $series_type
     */
    public function setSeriesType($series_type)
    {
        $this->_series_type = $series_type;
    }

    /**
     * @param $row_range
     */
    public function setRowRange($row_range)
    {
        $this->_row_range = $row_range;
    }

    /**
     * @return array
     */
    public function getRowRange()
    {
        return $this->_row_range;
    }

    /**
     * @param $selected_columns
     */
    public function setSelectedColumns($selected_columns)
    {
        $this->_selected_columns = $selected_columns;
    }

    /**
     * @return array
     */
    public function getSelectedColumns()
    {
        return $this->_selected_columns;
    }

    /**
     * @param $wdt_id
     */
    public function setwpDataTableId($wdt_id)
    {
        $this->_wpdatatable_id = $wdt_id;
    }

    /**
     * @return null
     */
    public function getwpDataTableId()
    {
        return $this->_wpdatatable_id;
    }

    /**
     * @param $range_type
     */
    public function setRangeType($range_type)
    {
        $this->_range_type = $range_type;
    }

    /**
     * @return string
     */
    public function getRangeType()
    {
        return $this->_range_type;
    }

    /**
     * @return null
     */
    public function getJsonChartRenderData()
    {
        return $this->_json_chart_render_data;
    }

    /**
     * @param null $json_chart_render_data
     */
    public function setJsonChartRenderData($json_chart_render_data)
    {
        $this->_json_chart_render_data = $json_chart_render_data;
    }

    /**
     * @param $constructedChartData
     * @param bool $loadFromDB
     * @throws WDTException
     */
    public function __construct($constructedChartData, $loadFromDB)
    {
        if (isset($constructedChartData['id'])) {
            $this->setId((int)$constructedChartData['id']);
        }
        $this->setwpDataTableId((int)$constructedChartData['wpdatatable_id']);
        $this->loadChildWPDataTable();
        $this->setTitle(sanitize_text_field($constructedChartData['title']));
        $this->setType(sanitize_text_field($constructedChartData['type']));
        if (isset($constructedChartData['series_type'])) {
            $this->setSeriesType(sanitize_text_field($constructedChartData['series_type']));
        }
        $this->setSelectedColumns(array_map('sanitize_text_field', (array)$constructedChartData['selected_columns']));
        $this->setRangeType(sanitize_text_field($constructedChartData['range_type']));
        if (isset($constructedChartData['range_data'])) {
            $this->setRowRange(array_map('intval', $constructedChartData['range_data']));
        }

        // Series
        if (!empty($constructedChartData['series_data'])) {
            array_walk_recursive(
                $constructedChartData['series_data'],
                function ($value) {
                    sanitize_text_field($value);
                }
            );
            $this->setUserDefinedSeriesData($constructedChartData['series_data']);
        }

        $this->setWidth((int)WDTTools::defineDefaultValue($constructedChartData, 'width', 0));
        $this->setResponsiveWidth((bool)WDTTools::defineDefaultValue($constructedChartData, 'responsive_width', 0));
        $this->setHeight((int)WDTTools::defineDefaultValue($constructedChartData, 'height', 400));
        $this->setGroupChart((bool)(WDTTools::defineDefaultValue($constructedChartData, 'group_chart', false)));
        $this->setBackgroundColor(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'background_color', '#FFFFFF')));
        $this->setShowGrid((bool)(WDTTools::defineDefaultValue($constructedChartData, 'show_grid', true)));
        $this->setMajorAxisLabel(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'horizontal_axis_label')));
        $this->setMinorAxisLabel(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'vertical_axis_label')));
        $this->setVerticalAxisMin(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'vertical_axis_min')));
        $this->setVerticalAxisMax(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'vertical_axis_max')));
        $this->setTooltipEnabled((bool)(WDTTools::defineDefaultValue($constructedChartData, 'tooltip_enabled', true)));
    }

    /**
     *
     * Creates a new WPDataChart based on the chart engine
     * @param $constructedChartData
     * @param bool $loadFromDB
     * @return mixed
     */
    public static function build($constructedChartData, $loadFromDB = false)
    {
        // Security Fix: Whitelist valid chart engines to prevent LFI
        $validEngines = array('google', 'chartjs', 'highcharts', 'apexcharts');

        $engine = isset($constructedChartData['engine']) ? strtolower(sanitize_text_field($constructedChartData['engine'])) : 'google';

        if (!in_array($engine, $validEngines, true)) {
            // Invalid engine, default to google
            $engine = 'google';
        }

        $wdtChart = 'Wdt' . ucfirst($engine) . 'Chart' . '\Wdt' . ucfirst($engine) . 'Chart';
        $chartClassFileName = 'class.' . $engine . '.wpdatachart.php';
        require_once(WDT_ROOT_PATH . 'source/' . $chartClassFileName);
        return new $wdtChart($constructedChartData, $loadFromDB);
    }

    /**
     *
     * Sets the corresponding wpDataTable
     *
     * @throws WDTException
     */
    public function loadChildWPDataTable()
    {
        if (empty($this->getwpDataTableId())) {
            return false;
        }
        $this->_wpdatatable = WPDataTable::loadWpDataTable($this->_wpdatatable_id, null, empty($this->_follow_filtering));
        return true;
    }

    /**
     * @return void
     */
    public function shiftXAxisColumnUp()
    {
        /**
         * Check if the string column is not in the beginning and move it up
         */
        if (count($this->_render_data['columns']) > 1) {
            $shiftNeeded = false;
            $shiftIndex = 0;
            for ($i = 1; $i < count($this->_render_data['columns']); $i++) {
                if ($this->_render_data['columns'][$i]['type'] == 'string') {
                    $shiftNeeded = true;
                    $shiftIndex = $i;
                    break;
                }
            }

            if ($shiftNeeded) {
                $this->shiftColumns($shiftIndex);
            }
        }

        $this->formatShiftedAxes();
    }

    public function shiftColumns($shiftIndex)
    {
        // Shift columns
        $strColumn = $this->_render_data['columns'][$shiftIndex];
        unset($this->_render_data['columns'][$shiftIndex]);
        array_unshift($this->_render_data['columns'], $strColumn);
        // Shift rows
        for ($j = 0; $j < count($this->_render_data['rows']); $j++) {
            $strCell = $this->_render_data['rows'][$j][$shiftIndex];
            unset($this->_render_data['rows'][$j][$shiftIndex]);
            array_unshift($this->_render_data['rows'][$j], $strCell);
        }
        // Shift column indexes
        if (isset($this->_render_data['column_indexes'])) {
            $shiftedIndex = $this->_render_data['column_indexes'][$shiftIndex];
            unset($this->_render_data['column_indexes'][$shiftIndex]);
            array_unshift($this->_render_data['column_indexes'], $shiftedIndex);
        }
    }

    public function formatShiftedAxes()
    {
        // Format axes
        $this->_render_data['axes']['major'] = array(
            'type' => $this->_render_data['columns'][0]['type'],
            'label' => !empty($this->_render_data['hAxis']['title']) ?
                $this->_render_data['hAxis']['title'] : $this->_render_data['columns'][0]['label']
        );
        $this->_render_data['axes']['minor'] = array(
            'type' => $this->_render_data['columns'][1]['type'],
            'label' => !empty($this->_render_data['vAxis']['title']) ?
                $this->_render_data['vAxis']['title'] : ''
        );

        // Get all series names
        if (empty($this->_render_data['series'])) {
            for ($i = 1; $i < count($this->_render_data['columns']); $i++) {
                $this->_render_data['series'][] = array(
                    'label' => $this->_render_data['columns'][$i]['label'],
                    'color' => '',
                    'orig_header' => $this->_render_data['columns'][$i]['orig_header']
                );
            }
        }
    }

    /**
     * @return void
     */
    public function prepareSeriesData()
    {
        // Init render data if it is empty
        if (empty($this->_render_data)) {
            $this->_render_data = array(
                'columns' => array(),
                'rows' => array(),
                'axes' => array(),
                'options' => array(
                    'title' => $this->_show_title ? $this->_title : '',
                    'series' => array(),
                    'width' => $this->_width,
                    'height' => $this->_height
                ),
                'vAxis' => array(),
                'hAxis' => array(),
                'errors' => array(),
                'series' => array()
            );
        }

        if ($this->isResponsiveWidth()) {
            unset($this->_render_data['options']['width']);
            $this->_render_data['options']['responsive_width'] = 1;
        }

        $this->_type_counters = array(
            'date' => 0,
            'datetime' => 0,
            'string' => 0,
            'number' => 0
        );

        // Define columns
        foreach ($this->getSelectedColumns() as $columnKey) {
            $columnType = $this->_wpdatatable->getColumn($columnKey)->getGoogleChartColumnType();
            $this->_render_data['columns'][] = array(
                'type' => $columnType,
                'label' => isset($this->_user_defined_series_data[$columnKey]['label']) ?
                    $this->_user_defined_series_data[$columnKey]['label'] : $this->_wpdatatable->getColumn($columnKey)->getTitle(),
                'orig_header' => $columnKey
            );
            $this->_type_counters[$columnType]++;
        }

        // Define axes titles
        if (isset($this->_axes['major']['label'])) {
            $this->_render_data['options']['hAxis']['title'] = $this->_axes['major']['label'];
        }
        if (isset($this->_axes['minor']['label'])) {
            $this->_render_data['options']['vAxis']['title'] = $this->_axes['minor']['label'];
        }

        $this->defineSeries();

        // Group chart data
        if ($this->isGroupChart()) {
            $this->_render_data['group_chart'] = true;
        } else {
            $this->_render_data['group_chart'] = false;
        }

        // Define grid settings
        if (!$this->isShowGrid()) {
            if (!isset($this->_render_data['options']['hAxis'])) {
                $this->_render_data['options']['hAxis'] = array();
            }
            $this->_render_data['options']['hAxis']['gridlines'] = array(
                'color' => 'transparent'
            );
            if (!isset($this->_render_data['options']['vAxis'])) {
                $this->_render_data['options']['vAxis'] = array();
            }
            $this->_render_data['options']['vAxis']['gridlines'] = array(
                'color' => 'transparent'
            );
            $this->_render_data['show_grid'] = false;
        } else {
            $this->_render_data['show_grid'] = true;
        }

        // Detect errors
        if ($this->_type_counters['string'] > 1) {
            $this->_render_data['errors'][] = __('Only one column can be of type String', 'wpdatatables');
        }
        if (($this->_type_counters['number'] > 1) && ($this->_type_counters['date'] > 1)) {
            $this->_render_data['errors'][] = __('You are mixing data types (several date axes and several number)', 'wpdatatables');
        }
        if (empty($this->_render_data)) {
            $this->_render_data = array();
        }

    }

    /**
     * @return mixed|null
     * @throws WDTException
     */
    public function prepareData()
    {

        // Prepare series and columns
        if (empty($this->_render_data['columns'])) {
            $this->prepareSeriesData();
        }

        $dateFormat = $this->getDateFormat();
        $timeFormat = $this->getDateTimeFormat();

        // The data itself
        if (empty($this->_render_data['rows'])) {
            if ($this->getRangeType() == 'all_rows') {
                foreach ($this->_wpdatatable->getDataRows() as $row) {
                    $return_data_row = array();
                    foreach ($this->getSelectedColumns() as $columnKey) {
                        if (!$this->_wpdatatable->getColumn($columnKey))
                            throw new WDTException('In chart, selected column "' . $columnKey . '" does not exist anymore in source table with ID =' . $this->_wpdatatable->getWpId() . '.<br> Please check your source that you use for creating this table or create new chart from that table and replace new chart shortcode with old one on the front page.');
                        $dataType = $this->_wpdatatable->getColumn($columnKey)->getDataType();
                        $decimalPlaces = $this->_wpdatatable->getColumn($columnKey)->getDecimalPlaces();
                        $thousandsSeparator = $this->_wpdatatable->getColumn($columnKey)->isShowThousandsSeparator();
                        switch ($dataType) {
                            case 'date':
                                $timestamp = is_numeric($row[$columnKey]) ? $row[$columnKey] : strtotime(str_replace('/', '-', $row[$columnKey]));
                                $return_data_row[] = date(
                                    $dateFormat,
                                    $timestamp
                                );
                                break;
                            case 'datetime':
                                $timestamp = is_numeric($row[$columnKey]) ? $row[$columnKey] : strtotime(str_replace('/', '-', $row[$columnKey]));
                                if ($this->getEngine() == 'google') {
                                    $return_data_row[] = date(
                                        $dateFormat,
                                        $timestamp
                                    );
                                } else {
                                    $return_data_row[] = date(
                                        $dateFormat . ' ' . $timeFormat,
                                        $timestamp
                                    );
                                }
                                break;
                            case 'time':
                                $timestamp = $row[$columnKey];
                                $return_data_row[] = date(
                                    $timeFormat,
                                    $timestamp
                                );
                                break;
                            case 'int':
                                if (has_filter('wpdatatables_filter_int_cell_data_in_charts')) {
                                    $row[$columnKey] = apply_filters('wpdatatables_filter_int_cell_data_in_charts', $row[$columnKey], $columnKey, $this->getId(), $this->_wpdatatable->getWpId());
                                    if (!is_null($row[$columnKey])) {
                                        $return_data_row[] = (float)$row[$columnKey];
                                    } else {
                                        $return_data_row[] = null;
                                    }
                                } else {
                                    $return_data_row[] = (float)$row[$columnKey];
                                }
                                break;
                            case 'float':
                                if (has_filter('wpdatatables_filter_float_cell_data_in_charts')) {
                                    $row[$columnKey] = apply_filters('wpdatatables_filter_float_cell_data_in_charts', $row[$columnKey], $columnKey, $this->getId(), $this->_wpdatatable->getWpId());
                                    if (!is_null($row[$columnKey])) {
                                        if ($decimalPlaces != -1) {
                                            $return_data_row[] = (float)number_format(
                                                (float)($row[$columnKey]),
                                                $decimalPlaces,
                                                '.',
                                                $thousandsSeparator ? '' : '.');
                                        } else {
                                            $return_data_row[] = (float)$row[$columnKey];
                                        }
                                    } else {
                                        $return_data_row[] = null;
                                    }
                                } else {
                                    if ($decimalPlaces != -1) {
                                        $return_data_row[] = (float)number_format(
                                            (float)($row[$columnKey]),
                                            $decimalPlaces,
                                            '.',
                                            $thousandsSeparator ? '' : '.');
                                    } else {
                                        $return_data_row[] = (float)$row[$columnKey];
                                    }
                                }
                                break;
                            case 'link':
                                if (!in_array($this->getEngine(), ['google', 'chartjs'])) {
                                    if (strpos($row[$columnKey], '||') !== false) {
                                        list($link, $row[$columnKey]) = explode('||', $row[$columnKey]);
                                        $return_data_row[] = '<a href="' . $link . '">' . $row[$columnKey] . '</a>';
                                    } else {
                                        $return_data_row[] = '<a href="' . $row[$columnKey] . '">' . $row[$columnKey] . '</a>';
                                    }
                                } else {
                                    $return_data_row[] = $row[$columnKey];
                                }
                                break;
                            case 'string':
                            default:
                                if ($this->getEngine() == 'apexcharts') {
                                    $return_data_row[] = $row[$columnKey] === null ? '' : $row[$columnKey];
                                } else {
                                    $return_data_row[] = $row[$columnKey];
                                }
                                break;
                        }
                    }
                    $this->_render_data['rows'][] = $return_data_row;
                }
            } else {
                foreach ($this->getRowRange() as $rowIndex) {
                    $return_data_row = array();
                    foreach ($this->getSelectedColumns() as $columnKey) {

                        $dataType = $this->_wpdatatable->getColumn($columnKey)->getDataType();
                        $decimalPlaces = $this->_wpdatatable->getColumn($columnKey)->getDecimalPlaces();
                        switch ($dataType) {
                            case 'date':
                                $timestamp = is_int($this->_wpdatatable->getCell($columnKey, $rowIndex)) ?
                                    $this->_wpdatatable->getCell($columnKey, $rowIndex)
                                    : strtotime(str_replace('/', '-', $this->_wpdatatable->getCell($columnKey, $rowIndex)));
                                $return_data_row[] = date(
                                    $dateFormat,
                                    $timestamp
                                );
                                break;
                            case 'datetime':
                                $timestamp = is_int($this->_wpdatatable->getCell($columnKey, $rowIndex)) ?
                                    $this->_wpdatatable->getCell($columnKey, $rowIndex) : strtotime(str_replace('/', '-', $this->_wpdatatable->getCell($columnKey, $rowIndex)));
                                if ($this->getEngine() == 'google') {
                                    $return_data_row[] = date(
                                        $dateFormat,
                                        $timestamp
                                    );
                                } else {
                                    $return_data_row[] = date(
                                        $dateFormat . ' ' . $timeFormat,
                                        $timestamp
                                    );
                                }
                                break;
                            case 'time':
                                $timestamp = $this->_wpdatatable->getCell($columnKey, $rowIndex);
                                $return_data_row[] = date(
                                    $timeFormat,
                                    $timestamp
                                );
                                break;
                            case 'int':
                                if (has_filter('wpdatatables_filter_int_cell_data_in_charts')) {
                                    $cellData = apply_filters('wpdatatables_filter_int_cell_data_in_charts', $this->_wpdatatable->getCell($columnKey, $rowIndex), $columnKey, $this->getId(), $this->_wpdatatable->getWpId());
                                    if (!is_null($cellData)) {
                                        $return_data_row[] = (float)$cellData;
                                    } else {
                                        $return_data_row[] = null;
                                    }
                                } else {
                                    $return_data_row[] = (float)$this->_wpdatatable->getCell($columnKey, $rowIndex);
                                }
                                break;
                            case 'float':
                                if (has_filter('wpdatatables_filter_float_cell_data_in_charts')) {
                                    $floatNumber = apply_filters('wpdatatables_filter_float_cell_data_in_charts', $this->_wpdatatable->getCell($columnKey, $rowIndex), $columnKey, $this->getId(), $this->_wpdatatable->getWpId());
                                    if (!is_null($floatNumber)) {
                                        if ($decimalPlaces != -1) {
                                            $return_data_row[] = (float)number_format($floatNumber, $decimalPlaces);
                                        } else {
                                            $return_data_row[] = $floatNumber;
                                        }
                                    } else {
                                        $return_data_row[] = null;
                                    }
                                } else {
                                    $floatNumber = (float)$this->_wpdatatable->getCell($columnKey, $rowIndex);
                                    if ($decimalPlaces != -1) {
                                        $return_data_row[] = (float)number_format($floatNumber, $decimalPlaces);
                                    } else {
                                        $return_data_row[] = $floatNumber;
                                    }
                                }
                                break;
                            case 'link':
                                $cellData = $this->_wpdatatable->getCell($columnKey, $rowIndex);
                                if (!in_array($this->getEngine(), ['google', 'chartjs'])) {
                                    if (strpos($cellData, '||') !== false) {
                                        list($link, $cellData) = explode('||', $cellData);
                                        $return_data_row[] = '<a href="' . $link . '">' . $cellData . '</a>';
                                    } else {
                                        $return_data_row[] = '<a href="' . $cellData . '">' . $cellData . '</a>';
                                    }
                                } else {
                                    $return_data_row[] = $cellData;
                                }
                                break;
                            case 'string':
                            default:
                                $return_data_row[] = $this->_wpdatatable->getCell($columnKey, $rowIndex);
                                break;
                        }

                    }
                    $this->_render_data['rows'][] = $return_data_row;
                }
            }

        }
        $this->_render_data['type'] = $this->_type;
        return $this->_render_data;
    }

    /**
     * @return void
     */
    public function groupData()
    {
        if (isset($this->_render_data['group_chart'])) {
            if ($this->isGroupChart() || $this->_render_data['group_chart']) {
                $output = array();
                foreach ($this->_render_data['rows'] as $row) {
                    if (!empty($output)) {
                        $value_key = 'none';
                        foreach ($output as $key => $value) {
                            if ($value_key === 'none') {
                                if ($value[0] == $row[0]) {
                                    $value_key = $key;
                                }
                            }
                        }
                        if ($value_key === 'none') {
                            $output[] = $row;
                        } else {
                            for ($n = 1; $n <= count($row) - 1; $n++) {
                                $output[$value_key][$n] += $row[$n];
                            }
                        }
                    } else {
                        $output[] = $row;
                    }
                }
                $this->_group_chart = 1;
                $this->_render_data['rows'] = $output;
            } else {
                $this->_group_chart = 0;
            }
        } else {
            $this->_group_chart = 0;
        }
    }

    /**
     * @return void
     */
    public function prepareRender()
    {

    }

    /**
     * @return mixed|null
     * @throws WDTException
     */
    public function returnData()
    {
        $this->prepareData();
        $this->groupData();
        $this->shiftXAxisColumnUp();
        $this->prepareRender();
        return $this->returnRenderData();
    }

    /**
     * Saves the chart data to DB
     * @global WPDB $wpdb
     */
    public function save()
    {
        global $wpdb;

        $this->prepareSeriesData();
        $this->shiftXAxisColumnUp();
        $this->prepareRender();

        $render_data = $this->formRenderDataForDb();

        if (empty($this->getId())) {
            // This is a new chart
            $wpdb->insert(
                $wpdb->prefix . "wpdatacharts",
                array(
                    'wpdatatable_id' => $this->getwpDataTableId(),
                    'title' => $this->getTitle(),
                    'engine' => $this->getEngine(),
                    'type' => $this->getType(),
                    'json_render_data' => json_encode($render_data)
                )
            );

            $this->_id = $wpdb->insert_id;

        } else {
            // Updating the chart
            $wpdb->update(
                $wpdb->prefix . "wpdatacharts",
                array(
                    'wpdatatable_id' => $this->getwpDataTableId(),
                    'title' => $this->getTitle(),
                    'engine' => $this->getEngine(),
                    'type' => $this->getType(),
                    'json_render_data' => json_encode($render_data)
                ),
                array(
                    'id' => $this->_id
                )
            );

        }

    }

    /**
     * @return void
     */
    public function getColumnIndexes()
    {
        foreach ($this->getSelectedColumns() as $columnKey) {
            $this->_render_data['column_indexes'][] = $this->_wpdatatable->getColumnHeaderOffset($columnKey);
        }
    }

    /**
     * Return the shortcode
     */
    public function getShortCode()
    {
        if (!empty($this->_id)) {
            return '[wpdatachart id=' . $this->_id . ']';
        }
        return '';
    }

    /**
     * Load chart from the database
     * @return bool
     * @throws WDTException
     */
    public function loadFromDB()
    {
        $chartData = $this->getChartDataById($this->getId());

        $renderData = $this->setChartRenderData($chartData);

        $this->setGeneralChartProperties($chartData, $renderData);

        $this->setSpecificChartProperties($renderData);

        $this->loadChildWPDataTable();

        return true;
    }

    /**
     * @param $chartId
     * @return array|false|object|stdClass
     */
    public static function getChartDataById($chartId)
    {
        global $wpdb;

        if (empty($chartId)) {
            return false;
        }

        // Load json data from DB
        $chartQuery = $wpdb->prepare(
            "SELECT * 
                        FROM " . $wpdb->prefix . "wpdatacharts 
                        WHERE id = %d",
            $chartId
        );
        $chartData = $wpdb->get_row($chartQuery);

        if ($chartData === null) {
            return false;
        }

        return $chartData;
    }

    /**
     * Render Chart
     * @throws WDTException
     */
    public function render()
    {
        $minified_js = get_option('wdtMinifiedJs');

        $this->prepareData();
        if ($this->_follow_filtering) {
            $this->getColumnIndexes();
        }

        $this->groupData();

        $this->shiftXAxisColumnUp();

        $js_ext = $minified_js ? '.min.js' : '.js';

        wp_enqueue_script('wpdatatables-render-chart', WDT_JS_PATH . 'wdtcharts/wdt.chartsRender' . $js_ext, array('jquery'), WDT_CURRENT_VERSION);
        $this->setJsonChartRenderData($this->enqueueChartSpecificScripts($js_ext));
        return $this->enqueueScriptsAfterChartRender();
    }

    /**
     * @param $js_ext
     * @return false|string
     */
    public function enqueueChartSpecificScripts($js_ext)
    {
        return json_encode($this->_render_data);
    }

    /**
     * @return false|string
     */
    public function enqueueScriptsAfterChartRender()
    {
        do_action_deprecated(
            'wdt-enqueue-scripts-after-chart-render',
            array(),
            WDT_INITIAL_LITE_VERSION,
            'wpdatatables_enqueue_scripts_after_chart_render'
        );
        do_action('wpdatatables_enqueue_scripts_after_chart_render');


        $id = $this->_id;
        ob_start();
        include(WDT_TEMPLATE_PATH . 'wpdatachart.inc.php');
        $chart_html = ob_get_contents();
        ob_end_clean();
        return $chart_html;
    }

    /**
     * Delete chart by ID
     * @param $chartId
     * @return bool
     */
    public static function delete($chartId)
    {
        global $wpdb;

        if (!isset($_REQUEST['wdtNonce']) || empty($chartId) || !current_user_can('manage_options')
            || !wp_verify_nonce($_REQUEST['wdtNonce'], 'wdtDeleteChartNonce')) {
            return false;
        }

        $wpdb->delete(
            $wpdb->prefix . "wpdatacharts",
            array(
                'id' => (int)$chartId
            )
        );

        do_action('wpdatatables_after_delete_charts', (int)$chartId, 'chart');

        return true;

    }

    /**
     * Get all charts non-paged for the MCE editor
     * @return array|null|object
     */
    public static function getAll()
    {
        global $wpdb;
        $query = "SELECT id, title FROM {$wpdb->prefix}wpdatacharts ";
        return $wpdb->get_results($query, ARRAY_A);
    }

    /**
     * @param $renderData
     * @return void
     */
    public function setSpecificChartProperties($renderData)
    {

    }

    /**
     * @param $chartData
     * @param $renderData
     * @return void
     */
    public function setGeneralChartProperties($chartData, $renderData)
    {
        $this->setEngine($chartData->engine);
        $this->setId($chartData->id);
        $this->setwpDataTableId($chartData->wpdatatable_id);
        $this->setTitle($chartData->title);
        $this->setType($chartData->type);
        if (!empty($renderData['series_type'])) {
            $this->setSeriesType($renderData['series_type']);
        }
        $this->setSelectedColumns($renderData['selected_columns']);
        $this->setRangeType($renderData['range_type']);
        $this->setRowRange($renderData['row_range']);
        $this->setShowGrid($renderData['show_grid'] ?: false);
        $this->setShowTitle($renderData['show_title'] ?: false);
        $this->setResponsiveWidth(isset($renderData['render_data']['options']['responsive_width']) ? (bool)$renderData['render_data']['options']['responsive_width'] : false);
        if (!empty($renderData['render_data']['options']['width'])) {
            $this->setWidth($renderData['render_data']['options']['width']);
        }
        $this->setHeight($renderData['render_data']['options']['height']);
    }

    /**
     * @return void
     */
    public function defineSeries()
    {
        if (!empty($this->getUserDefinedSeriesData())) {
            $seriesIndex = 0;
            foreach ($this->_user_defined_series_data as $series_data) {
                if (!empty($series_data['color']) || !empty($series_data['type']) || !empty($series_data['label'])) {
                    $this->_render_data['options']['series'][$seriesIndex] = array(
                        'color' => $series_data['color'],
                        'label' => $series_data['label']
                    );
                }
                $seriesIndex++;
            }
        }
    }

    /**
     * @return false|mixed|null
     */
    public function getDateFormat()
    {
        return get_option('wdtDateFormat');
    }


    /**
     * @return false|mixed|null
     */
    public function getDateTimeFormat()
    {
        return get_option('wdtTimeFormat');
    }

    /**
     * @return mixed|null
     */
    public function returnRenderData()
    {
        return $this->_render_data;
    }

    /**
     * @return mixed|null
     */
    public function getRenderData()
    {
        return $this->_render_data;
    }

    /**
     * @return array
     */
    public function formRenderDataForDb()
    {
        return array(
            'selected_columns' => $this->getSelectedColumns(),
            'range_type' => $this->getRangeType(),
            'row_range' => $this->getRowRange(),
            'render_data' => $this->_render_data,
            'show_grid' => $this->_show_grid,
            'show_title' => $this->_show_title,
            'series_type' => $this->getSeriesType()
        );
    }

    /**
     * @param $chartData
     * @return mixed|null
     */
    public function setChartRenderData($chartData)
    {
        $renderData = json_decode($chartData->json_render_data, true);
        if (!empty($renderData['render_data'])) {
            $this->_render_data = $renderData['render_data'];
        }
        return $renderData;
    }

}