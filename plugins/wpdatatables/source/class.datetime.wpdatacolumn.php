<?php

defined('ABSPATH') or die("Cannot access pages directly.");

/**
 * Class IntColumn is a child column class used
 * to describe columns with float numeric content
 *
 * @author Alexander Gilmanov
 *
 * @since May 2012
 */
class DateTimeWDTColumn extends WDTColumn {

    protected $_jsDataType = 'date-custom';
    protected $_dataType = 'datetime';

    /**
     * DateTimeWDTColumn constructor.
     * @param array $properties
     */
    public function __construct($properties = array()) {
        parent::__construct($properties);
        $this->_dataType = 'datetime';
    }

    /**
     * @param $content
     * @return false|mixed|string
     */
    public function prepareCellOutput($content) {

        $content = apply_filters('wpdatatables_filter_datetime_cell_before_formatting', $content, $this->getParentTable()->getWpId());

        if (!is_array($content)) {
            if (!empty($content) && ($content != '0000-00-00')) {
                $timestamp = is_numeric($content) ? $content : strtotime(str_replace('/', '-', $content));
                $formattedValue = date(get_option('wdtDateFormat') . ' ' . get_option('wdtTimeFormat'), $timestamp);
            } else {
                $formattedValue = '';
            }
        } else {
            if (!is_null($content['value'])) {
                $content['value'] = str_replace('/', '-', $content['value']);
                $formattedValue = date(get_option('wdtDateFormat') . ' ' . get_option('wdtTimeFormat'), strtotime($content['value']));
            } else {
                $formattedValue = '';
            }
        }
        return apply_filters('wpdatatables_filter_datetime_cell', $formattedValue, $this->getParentTable()->getWpId());
    }

    /**
     * @return string
     */
    public function getGoogleChartColumnType() {
        return 'datetime';
    }

}
