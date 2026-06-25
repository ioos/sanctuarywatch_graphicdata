<?php

defined('ABSPATH') or die("Cannot access pages directly.");

class IntWDTColumn extends WDTColumn
{

    protected $_dataType = 'int';
    protected $_jsDataType = 'numeric';

    /**
     * IntWDTColumn constructor.
     * @param array $properties
     */
    public function __construct($properties = array())
    {
        parent::__construct($properties);
        $this->_dataType = 'int';
        $this->_jsDataType = 'formatted-num';
        $this->_filterType = 'number';
        $this->addCSSClass('numdata integer');
    }

    /**
     * @param $content
     * @return mixed|string
     */
    public function prepareCellOutput($content)
    {
        $content = apply_filters('wpdatatables_filter_int_cell_before_formatting', $content, $this->getParentTable()->getWpId());

        if ($content === '' || $content === null) {
            $content = '';
            return $content;
        }

        $number_format = get_option('wdtNumberFormat') ? get_option('wdtNumberFormat') : 1;
        if ($number_format == 1) {
            $content = number_format(
                (int)$content,
                0,
                ',',
                $this->isShowThousandsSeparator() ? '.' : ''
            );
        } else {
            $content = number_format(
                (int)$content,
                0,
                '.',
                $this->isShowThousandsSeparator() ? ',' : ''
            );
        }
        return apply_filters('wpdatatables_filter_int_cell', $content, $this->getParentTable()->getWpId());
    }

    /**
     * @return string
     */
    public function getGoogleChartColumnType()
    {
        return 'number';
    }
}
