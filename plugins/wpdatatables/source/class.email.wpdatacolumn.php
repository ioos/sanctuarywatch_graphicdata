<?php

defined('ABSPATH') or die("Cannot access pages directly.");

class EmailWDTColumn extends WDTColumn
{

    protected $_jsDataType = 'html';
    protected $_dataType = 'string';

    /**
     * EmailWDTColumn constructor.
     * @param array $properties
     */
    public function __construct($properties = array())
    {
        parent::__construct($properties);
        $this->_dataType = 'email';
    }

    /**
     * @param $content
     * @return mixed|string
     */
    public function prepareCellOutput($content)
    {
        $content = apply_filters('wpdatatables_filter_email_cell_before_formatting', $content, $this->getParentTable()->getWpId());

        if (is_null($content) || '' === $content) {
            $formattedValue = '';
        } else {
            if (strpos($content, '||') !== false) {
                $parts = explode('||', $content, 2);
                $email_raw = isset($parts[0]) ? trim($parts[0]) : '';
                $label = isset($parts[1]) ? $parts[1] : '';
                $email = sanitize_email($email_raw);
                if (empty($email)) {
                    $formattedValue = esc_html($content);
                } else {
                    $mailto_href = 'mailto:' . $email;
                    $display = ( $label !== '' && $label !== null ) ? $label : $email;
                    $formattedValue = '<a href="' . esc_url($mailto_href) . '">' . esc_html($display) . '</a>';
                }
            } else {
                $trimmed = trim($content);
                $email = sanitize_email($trimmed);
                if (empty($email)) {
                    $formattedValue = esc_html($content);
                } else {
                    $formattedValue = '<a href="' . esc_url('mailto:' . $email) . '">' . esc_html($trimmed) . '</a>';
                }
            }
        }
        return apply_filters('wpdatatables_filter_email_cell', $formattedValue, $this->getParentTable()->getWpId());
    }

}
