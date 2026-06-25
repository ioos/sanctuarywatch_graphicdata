<?php

defined('ABSPATH') or die("Cannot access pages directly.");

class StringWDTColumn extends WDTColumn
{

    protected $_dataType = 'string';
    protected $_jsDataType = 'string';

    public function __construct($properties = array())
    {
        parent::__construct($properties);
        $this->_dataType = 'string';
        $this->_foreignKeyRule = WDTTools::defineDefaultValue($properties, 'foreignKeyRule', null);
    }

    public function prepareCellOutput($content)
    {
        $content = apply_filters('wpdatatables_filter_string_cell_before_formatting', $content, $this->getParentTable()->getWpId());

        if (get_option('wdtParseShortcodes')) {
            if(!is_null($content))
                $content = do_shortcode($content);
        }
        return apply_filters('wpdatatables_filter_string_cell', $content, $this->getParentTable()->getWpId());
    }

}