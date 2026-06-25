<?php

defined('ABSPATH') or die("Cannot access pages directly.");

class ImageWDTColumn extends WDTColumn
{

    protected $_jsDataType = 'string';
    protected $_dataType = 'string';

    /**
     * ImageWDTColumn constructor.
     * @param array $properties
     */
    public function __construct($properties = array())
    {
        parent::__construct($properties);
        $this->_dataType = 'icon';
    }

    /**
     * @param $content
     * @return mixed|string
     */
    public function prepareCellOutput($content)
    {
        $content = apply_filters('wpdatatables_filter_image_cell_before_formatting', $content, $this->getParentTable()->getWpId());

        if (empty($content)) {
            return '';
        }

        if (false !== strpos($content, '||')) {
            $parts = explode('||', $content, 2);
            $image = isset($parts[0]) ? trim($parts[0]) : '';
            $link = isset($parts[1]) ? trim($parts[1]) : '';
            $image = esc_url($image);
            $link = esc_url($link);
            if ($image === '' && $link === '') {
                $formattedValue = '';
            } elseif ($image !== '' && $link !== '') {
                $formattedValue = '<a href="' . $link . '" target="_blank" rel="lightbox[-1] noopener noreferrer">'
                    . '<img src="' . $image . '" alt="" /></a>';
            } elseif ($image !== '') {
                $formattedValue = '<img src="' . $image . '" alt="" />';
            } else {
                $formattedValue = '';
            }
        } else {
            $src = esc_url(trim($content));
            $formattedValue = $src !== '' ? '<img src="' . $src . '" alt="" />' : '';
        }
        return apply_filters('wpdatatables_filter_image_cell', $formattedValue, $this->getParentTable()->getWpId());
    }

}
