<?php /** @noinspection PhpMultipleClassDeclarationsInspection */

namespace WdtGoogleChart;

use DateTime;
use WDTException;
use WDTTools;
use WPDataChart;

class WdtGoogleChart extends WPDataChart
{
    //Chart
    protected $_border_width = 0;
    protected $_border_color = '#4572A7';
    protected $_border_radius = 0;
    protected $_plot_background_color = 'undefined';
    protected $_plot_border_width = 0;
    protected $_plot_border_color = '#C0C0C0';
    protected $_font_size = NULL;
    protected $_font_name = 'Arial';
    protected $_three_d = false;
    //Series
    protected $_curve_type = 'none';
    //Axes
    protected $_horizontal_axis_crosshair = false;
    protected $_horizontal_axis_direction = 1;
    protected $_vertical_axis_crosshair = false;
    protected $_vertical_axis_direction = 1;
    protected $_inverted = false;
    //Title
    protected $_title_floating = false;
    //Tooltip
    protected $_tooltip_enabled = true;
    //Legend
    protected $_legend_position = 'right';
    protected $_legend_vertical_align = 'bottom';
    protected $_region = 'world';
    protected $_colors = '#267114';
    protected $_dataless_region_color = '#F5F5F5';

    /**
     * @return string
     */
    public function getRegion()
    {
        return $this->_region;
    }

    /**
     * @param string $region
     */
    public function setRegion($region)
    {
        $this->_region = $region;
    }
    /**
     * @return string
     */
    public function getRegionColors()
    {
        return $this->_colors;
    }

    /**
     * @param string $colors
     */
    public function setRegionColors($colors)
    {
        $this->_colors = $colors;
    }
    /**
     * @return string
     */
    public function getDatalessRegionColors()
    {
        return $this->_dataless_region_color;
    }

    /**
     * @param string $dataless_colors
     */
    public function setDatalessRegionColors($dataless_colors)
    {
        $this->_dataless_region_color = $dataless_colors;
    }

    /**
     * @return int
     */
    public function getBorderWidth()
    {
        return $this->_border_width;
    }

    /**
     * @param int $border_width
     */
    public function setBorderWidth($border_width)
    {
        $this->_border_width = $border_width;
    }

    /**
     * @return string
     */
    public function getBorderColor()
    {
        return $this->_border_color;
    }

    /**
     * @param string $border_color
     */
    public function setBorderColor($border_color)
    {
        $this->_border_color = $border_color;
    }

    /**
     * @return int
     */
    public function getBorderRadius()
    {
        return $this->_border_radius;
    }

    /**
     * @param int $border_radius
     */
    public function setBorderRadius($border_radius)
    {
        $this->_border_radius = $border_radius;
    }

    /**
     * @return string
     */
    public function getPlotBackgroundColor()
    {
        return $this->_plot_background_color;
    }

    /**
     * @param string $plot_background_color
     */
    public function setPlotBackgroundColor($plot_background_color)
    {
        $this->_plot_background_color = $plot_background_color;
    }

    /**
     * @return int
     */
    public function getPlotBorderWidth()
    {
        return $this->_plot_border_width;
    }

    /**
     * @param int $plot_border_width
     */
    public function setPlotBorderWidth($plot_border_width)
    {
        $this->_plot_border_width = $plot_border_width;
    }

    /**
     * @return string
     */
    public function getPlotBorderColor()
    {
        return $this->_plot_border_color;
    }

    /**
     * @param string $plot_border_color
     */
    public function setPlotBorderColor($plot_border_color)
    {
        $this->_plot_border_color = $plot_border_color;
    }

    /**
     * @return null
     */
    public function getFontSize()
    {
        return $this->_font_size;
    }

    /**
     * @param null $font_size
     */
    public function setFontSize($font_size)
    {
        $this->_font_size = $font_size;
    }

    /**
     * @return string
     */
    public function getFontName()
    {
        return $this->_font_name;
    }

    /**
     * @param string $font_name
     */
    public function setFontName($font_name)
    {
        $this->_font_name = $font_name;
    }

    /**
     * @return bool
     */
    public function isThreeD()
    {
        return $this->_three_d;
    }

    /**
     * @param bool $three_d
     */
    public function setThreeD($three_d)
    {
        $this->_three_d = (bool)$three_d;
    }

    /**
     * @return string
     */
    public function isCurveType()
    {
        return $this->_curve_type;
    }

    /**
     * @param bool $curve_type
     */
    public function setCurveType($curve_type)
    {
        $this->_curve_type = (bool)$curve_type;
    }

    /**
     * @return bool
     */
    public function isHorizontalAxisCrosshair()
    {
        return $this->_horizontal_axis_crosshair;
    }

    /**
     * @param bool $horizontal_axis_crosshair
     */
    public function setHorizontalAxisCrosshair($horizontal_axis_crosshair)
    {
        $this->_horizontal_axis_crosshair = (bool)$horizontal_axis_crosshair;
    }

    /**
     * @return int
     */
    public function getHorizontalAxisDirection()
    {
        return $this->_horizontal_axis_direction;
    }

    /**
     * @param int $horizontal_axis_direction
     */
    public function setHorizontalAxisDirection($horizontal_axis_direction)
    {
        $this->_horizontal_axis_direction = $horizontal_axis_direction;
    }

    /**
     * @return bool
     */
    public function isVerticalAxisCrosshair()
    {
        return $this->_vertical_axis_crosshair;
    }

    /**
     * @param bool $vertical_axis_crosshair
     */
    public function setVerticalAxisCrosshair($vertical_axis_crosshair)
    {
        $this->_vertical_axis_crosshair = (bool)$vertical_axis_crosshair;
    }

    /**
     * @return int
     */
    public function getVerticalAxisDirection()
    {
        return $this->_vertical_axis_direction;
    }

    /**
     * @param int $vertical_axis_direction
     */
    public function setVerticalAxisDirection($vertical_axis_direction)
    {
        $this->_vertical_axis_direction = $vertical_axis_direction;
    }

    /**
     * @return bool
     */
    public function isInverted()
    {
        return $this->_inverted;
    }

    /**
     * @param bool $inverted
     */
    public function setInverted($inverted)
    {
        $this->_inverted = (bool)$inverted;
    }

    /**
     * @return bool
     */
    public function isTitleFloating()
    {
        return $this->_title_floating;
    }

    /**
     * @param bool $title_floating
     */
    public function setTitleFloating($title_floating)
    {
        $this->_title_floating = (bool)$title_floating;
    }

    /**
     * @return string
     */
    public function getLegendPosition()
    {
        return $this->_legend_position;
    }

    /**
     * @param string $legend_position
     */
    public function setLegendPosition($legend_position)
    {
        $this->_legend_position = $legend_position;
    }

    /**
     * @return string
     */
    public function getLegendVerticalAlign()
    {
        return $this->_legend_vertical_align;
    }

    /**
     * @param string $legend_vertical_align
     */
    public function setLegendVerticalAlign($legend_vertical_align)
    {
        $this->_legend_vertical_align = $legend_vertical_align;
    }

    /**
     * WPDT GoogleChart constructor.
     *
     * @param array $constructedChartData
     * @param bool $loadFromDB
     * @throws WDTException
     */
    public function __construct(array $constructedChartData, $loadFromDB = false)
    {
        if ($loadFromDB) {
            if (isset($constructedChartData['id'])) {
                $this->setId((int)$constructedChartData['id']);
            }
            $this->loadFromDB();
        } else {
            parent::__construct($constructedChartData, $loadFromDB);

            $this->setEngine('google');

            // Chart
            $this->setBorderWidth((int)WDTTools::defineDefaultValue($constructedChartData, 'border_width', 0));
            $this->setBorderColor(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'border_color', '#FFFFFF')));
            $this->setBorderRadius((int)WDTTools::defineDefaultValue($constructedChartData, 'border_radius', 0));
            $this->setPlotBackgroundColor(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'plot_background_color', '#FFFFFF')));
            $this->setPlotBorderWidth((int)WDTTools::defineDefaultValue($constructedChartData, 'plot_border_width', 0));
            $this->setPlotBorderColor(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'plot_border_color', '#C0C0C0')));
            $this->setFontSize(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'font_size', null)));
            $this->setFontName(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'font_name', 'Arial')));
            $this->setThreeD((bool)(WDTTools::defineDefaultValue($constructedChartData, 'three_d', false)));

            // Series
            $this->setCurveType((bool)(WDTTools::defineDefaultValue($constructedChartData, 'curve_type', false)));

            // Axes
            $this->setHorizontalAxisCrosshair((bool)(WDTTools::defineDefaultValue($constructedChartData, 'horizontal_axis_crosshair', false)));
            $this->setHorizontalAxisDirection(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'horizontal_axis_direction', 1)));
            $this->setVerticalAxisCrosshair((bool)(WDTTools::defineDefaultValue($constructedChartData, 'vertical_axis_crosshair', false)));
            $this->setVerticalAxisDirection(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'vertical_axis_direction', 1)));
            $this->setInverted((bool)(WDTTools::defineDefaultValue($constructedChartData, 'inverted', false)));

            // Title
            $this->setShowTitle((bool)(WDTTools::defineDefaultValue($constructedChartData, 'show_title', true)));
            $this->setTitleFloating((bool)(WDTTools::defineDefaultValue($constructedChartData, 'title_floating', false)));

            // Legend
            $this->setLegendPosition(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'legend_position', 'right')));
            $this->setLegendVerticalAlign(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'legend_vertical_align', 'bottom')));

            // Region
            $this->setRegion(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'region', 'world')));
            $this->setRegionColors(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'colors', '#267114')));
            $this->setDatalessRegionColors(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'datalessRegionColor', '#F5F5F5')));
        }
    }

    /**
     * @return void
     */
    public function prepareRender()
    {

        $colors = array(
            '#3366CC',
            '#DC3912',
            '#FF9900',
            '#109618',
            '#990099',
            '#3B3EAC',
            '#0099C6',
            '#DD4477',
            '#66AA00',
            '#B82E2E',
            '#316395',
            '#994499',
            '#22AA99',
            '#AAAA11',
            '#6633CC',
            '#E67300',
            '#8B0707',
            '#329262',
            '#5574A6',
            '#3B3EAC',
        );

        // Chart
        if (!$this->_responsiveWidth) {
            $this->_render_data['width'] = $this->getWidth();
        }
        foreach ($this->_render_data['series'] as $key=>$series){
            if ($series['color']== '')
                $this->_render_data['series'][$key]['color'] = $colors[$key];
        }
        $this->_render_data['options']['backgroundColor']['fill'] = $this->getBackgroundColor();
        $this->_render_data['options']['backgroundColor']['strokeWidth'] = $this->getBorderWidth();
        $this->_render_data['options']['backgroundColor']['stroke'] = $this->getBorderColor();
        $this->_render_data['options']['backgroundColor']['rx'] = $this->getBorderRadius();
        $this->_render_data['options']['chartArea']['backgroundColor']['fill'] = $this->getPlotBackgroundColor();
        $this->_render_data['options']['chartArea']['backgroundColor']['strokeWidth'] = $this->getPlotBorderWidth();
        $this->_render_data['options']['chartArea']['backgroundColor']['stroke'] = $this->getPlotBorderColor();
        $this->_render_data['options']['fontSize'] = $this->getFontSize();
        $this->_render_data['options']['fontName'] = $this->getFontName();
        if ($this->_type == 'google_pie_chart') {
            $this->_render_data['options']['is3D'] = $this->isThreeD();
        }

        if ($this->_type == 'google_geo_chart' || $this->_type == 'google_marker_geo_chart' || $this->_type == 'google_text_geo_chart'){
            $this->_render_data['options']['region'] = $this->getRegion();
            $this->_render_data['options']['colors'] = $this->getRegionColors();
            $this->_render_data['options']['datalessRegionColor'] = $this->getDatalessRegionColors();
        } else {
            $this->_render_data['options']['colors'] = $colors;
        }

        // Series
        if ($this->_type == 'google_line_chart') {
            if ($this->isCurveType()) {
                $this->_render_data['options']['curveType'] = 'function';
            } else {
                $this->_render_data['options']['curveType'] = 'none';
            }
        }

        // Axes
        if ($this->isHorizontalAxisCrosshair() && !$this->isVerticalAxisCrosshair()) {
            $this->_render_data['options']['crosshair']['trigger'] = 'both';
            $this->_render_data['options']['crosshair']['orientation'] = 'horizontal';
        } elseif (!$this->isHorizontalAxisCrosshair() && $this->isVerticalAxisCrosshair()) {
            $this->_render_data['options']['crosshair']['trigger'] = 'both';
            $this->_render_data['options']['crosshair']['orientation'] = 'vertical';
        } elseif ($this->isHorizontalAxisCrosshair() && $this->isVerticalAxisCrosshair()) {
            $this->_render_data['options']['crosshair']['trigger'] = 'both';
            $this->_render_data['options']['crosshair']['orientation'] = 'both';
        } else {
            $this->_render_data['options']['crosshair']['trigger'] = '';
            $this->_render_data['options']['crosshair']['orientation'] = '';
        }
        $this->_render_data['options']['hAxis']['direction'] = $this->getHorizontalAxisDirection();
        $this->_render_data['options']['vAxis']['direction'] = $this->getVerticalAxisDirection();
        $this->_render_data['options']['vAxis']['viewWindow']['min'] = $this->getVerticalAxisMin();
        $this->_render_data['options']['vAxis']['viewWindow']['max'] = $this->getVerticalAxisMax();
        if ($this->isInverted()) {
            $this->_render_data['options']['orientation'] = 'vertical';
        } else {
            $this->_render_data['options']['orientation'] = 'horizontal';
        }

        // Title
        if ($this->isTitleFloating()) {
            $this->_render_data['options']['titlePosition'] = 'in';
        } else {
            $this->_render_data['options']['titlePosition'] = 'out';
        }

        // Tooltip
        if ($this->isTooltipEnabled()) {
            $this->_render_data['options']['tooltip']['trigger'] = 'focus';
        } else {
            $this->_render_data['options']['tooltip']['trigger'] = 'none';
        }

        // Legend
        $this->_render_data['options']['legend']['position'] = $this->getLegendPosition();
        if ($this->getLegendVerticalAlign() == 'bottom' || $this->getLegendVerticalAlign() == 'end') {
            $this->_render_data['options']['legend']['alignment'] = 'end';
        } elseif ($this->getLegendVerticalAlign() == 'middle' || $this->getLegendVerticalAlign() == 'center') {
            $this->_render_data['options']['legend']['alignment'] = 'center';
        } else {
            $this->_render_data['options']['legend']['alignment'] = 'start';
        }

        $this->_render_data = apply_filters('wpdatatables_filter_google_charts_render_data', $this->_render_data, $this->getId(), $this);
    }

    /**
     * @param $js_ext
     * @return false|string
     */
    public function enqueueChartSpecificScripts($js_ext)
    {
        // Google Chart JS
        $googleLibSource = get_option('wdtGoogleStableVersion') ? WDT_JS_PATH . 'wdtcharts/googlecharts/googlecharts.js' : '//www.gstatic.com/charts/loader.js';
        wp_enqueue_script('wdt-google-charts', $googleLibSource, array(), WDT_CURRENT_VERSION);
        wp_enqueue_script('wpdatatables-google-chart', WDT_JS_PATH . 'wdtcharts/googlecharts/wdt.googleCharts' . $js_ext, array('jquery'), WDT_CURRENT_VERSION);
        return json_encode($this->_render_data);
    }

    /**
     * @param $renderData
     * @return void
     */
    public function setSpecificChartProperties($renderData)
    {
        // Chart
        $this->setBackgroundColor(isset($renderData['render_data']['options']['backgroundColor']['fill']) ? $renderData['render_data']['options']['backgroundColor']['fill'] : '');
        $this->setBorderWidth(isset($renderData['render_data']['options']['backgroundColor']['strokeWidth']) ? $renderData['render_data']['options']['backgroundColor']['strokeWidth'] : 0);
        $this->setBorderColor(isset($renderData['render_data']['options']['backgroundColor']['stroke']) ? $renderData['render_data']['options']['backgroundColor']['stroke'] : '#FFFFFF');
        $this->setBorderRadius(isset($renderData['render_data']['options']['backgroundColor']['rx']) ? $renderData['render_data']['options']['backgroundColor']['rx'] : 0);
        $this->setPlotBackgroundColor(isset($renderData['render_data']['options']['chartArea']['backgroundColor']['fill']) ? $renderData['render_data']['options']['chartArea']['backgroundColor']['fill'] : '#FFFFFF');
        $this->setPlotBorderWidth(isset($renderData['render_data']['options']['chartArea']['backgroundColor']['strokeWidth']) ? $renderData['render_data']['options']['chartArea']['backgroundColor']['strokeWidth'] : '#FFFFFF');
        $this->setPlotBorderColor(isset($renderData['render_data']['options']['chartArea']['backgroundColor']['stroke']) ? $renderData['render_data']['options']['chartArea']['backgroundColor']['stroke'] : '');
        $this->setFontSize(isset($renderData['render_data']['options']['fontSize']) ? $renderData['render_data']['options']['fontSize'] : null);
        $this->setFontName(isset($renderData['render_data']['options']['fontName']) ? $renderData['render_data']['options']['fontName'] : 'Arial');
        if ($this->_type == 'google_pie_chart') {
            $this->setThreeD(isset($renderData['render_data']['options']['is3D']) ? $renderData['render_data']['options']['is3D'] : false);
        }
        if ($this->_type == 'google_geo_chart' || $this->_type == 'google_marker_geo_chart' || $this->_type == 'google_text_geo_chart'){
            $this->setRegion(isset($renderData['render_data']['options']['region']) ? $renderData['render_data']['options']['region'] : 'world');
            $this->setRegionColors(isset($renderData['render_data']['options']['colors']) ? $renderData['render_data']['options']['colors'] : '#267114');
            $this->setDatalessRegionColors(isset($renderData['render_data']['options']['datalessRegionColor']) ? $renderData['render_data']['options']['datalessRegionColor'] : '#F5F5F5');
        }
        // Series
        if ($this->_type == 'google_line_chart') {
            $this->setCurveType(isset($renderData['render_data']['options']['curveType']) ? $renderData['render_data']['options']['curveType'] !== 'none' : false);
        }

        // Axes
        if ($renderData['render_data']['options']['crosshair']['trigger'] == 'both') {
            if ($renderData['render_data']['options']['crosshair']['orientation'] == 'horizontal') {
                $this->setHorizontalAxisCrosshair(true);
                $this->setVerticalAxisCrosshair(false);
            } elseif ($renderData['render_data']['options']['crosshair']['orientation'] == 'vertical') {
                $this->setHorizontalAxisCrosshair(false);
                $this->setVerticalAxisCrosshair(true);
            } elseif ($renderData['render_data']['options']['crosshair']['orientation'] == 'both') {
                $this->setHorizontalAxisCrosshair(true);
                $this->setVerticalAxisCrosshair(true);
            }
        }

        $this->setHorizontalAxisDirection(isset($renderData['render_data']['options']['hAxis']['direction']) ? $renderData['render_data']['options']['hAxis']['direction'] : 1);
        $this->setVerticalAxisDirection(isset($renderData['render_data']['options']['vAxis']['direction']) ? $renderData['render_data']['options']['vAxis']['direction'] : 1);
        $this->setVerticalAxisMin(isset($renderData['render_data']['options']['vAxis']['viewWindow']['min']) ? $renderData['render_data']['options']['vAxis']['viewWindow']['min'] : '');
        $this->setVerticalAxisMax(isset($renderData['render_data']['options']['vAxis']['viewWindow']['max']) ? $renderData['render_data']['options']['vAxis']['viewWindow']['max'] : '');

        if ($renderData['render_data']['options']['orientation'] == 'vertical') {
            $this->setInverted(true);
        } else {
            $this->setInverted(false);
        }

        // Title
        if ($renderData['render_data']['options']['titlePosition'] == 'in') {
            $this->setTitleFloating(true);
        } else {
            $this->setTitleFloating(false);
        }

        // Tooltip
        if ($renderData['render_data']['options']['tooltip']['trigger'] == 'focus') {
            $this->setTooltipEnabled(true);
        } else {
            $this->setTooltipEnabled(false);
        }

        // Legend
        $this->setLegendPosition(isset($renderData['render_data']['options']['legend']['position']) ? $renderData['render_data']['options']['legend']['position'] : 'right');
        $this->setLegendVerticalAlign(isset($renderData['render_data']['options']['legend']['alignment']) ? $renderData['render_data']['options']['legend']['alignment'] : 'bottom');

    }

    /**
     * @return string
     */
    public function getDateFormat()
    {
        return DateTime::RFC2822;
    }
}