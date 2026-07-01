<?php

namespace WdtChartjsChart;

use WDTException;
use WDTTools;
use WPDataChart;

class WdtChartjsChart extends WPDataChart
{
    //Chart
    protected $_border_width = 0;
    protected $_border_color = '#4572A7';
    protected $_border_radius = 0;
    protected $_font_size = NULL;
    protected $_font_name = 'Arial';
    protected $_font_weight = 'bold';
    protected $_title_font_weight = 'bold';
    protected $_font_style = 'normal';
    protected $_font_color = '#666';

    //Series
    protected $_curve_type = 'none';

    //Title
    protected $_title_position = 'top';
    protected $_title_font_name = 'Arial';
    protected $_title_font_style = 'bold';
    protected $_title_font_color = '#666';

    //Tooltip
    protected $_tooltip_background_color = 'rgba(255, 255, 255, 0.85)';
    protected $_tooltip_border_radius = 3;
    protected $_tooltip_shared = false;

    //Legend
    protected $_show_legend = true;
    protected $_legend_position_cjs = 'top';

    //Render data
    protected $_chartjs_render_data = NULL;

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
     * @return string
     */
    public function getFontWeight()
    {
        return $this->_font_weight;
    }

    /**
     * @param string $font_weight
     */
    public function setFontWeight($font_weight)
    {
        $this->_font_weight = $font_weight;
    }


    /**
     * @return string
     */
    public function getTitleFontColor()
    {
        return $this->_title_font_color;
    }

    /**
     * @param string $title_font_color
     */
    public function setTitleFontColor($title_font_color)
    {
        $this->_title_font_color = $title_font_color;
    }

    /**
     * @return string
     */
    public function getFontStyle()
    {
        return $this->_font_style;
    }

    /**
     * @param string $font_style
     */
    public function setFontStyle($font_style)
    {
        $this->_font_style = $font_style;
    }

    /**
     * @return string
     */
    public function getFontColor()
    {
        return $this->_font_color;
    }

    /**
     * @param string $font_color
     */
    public function setFontColor($font_color)
    {
        $this->_font_color = $font_color;
    }

    /**
     * @return string
     */
    public function getRealFontStyle()
    {
        if (isset($this->_chartjs_render_data['options']['globalOptions']['defaultFontStyle'])) {
            $oldFontStyle = $this->_chartjs_render_data['options']['globalOptions']['defaultFontStyle'];
            if (strpos($oldFontStyle, 'bold italic') !== false ||
                strpos($oldFontStyle, 'italic') !== false
            ) {
                return 'italic';
            }

            if (strpos($oldFontStyle, 'bold') !== false) {
                return 'normal';
            }
        }

        return $this->getFontStyle();
    }

    /**
     * @return string
     */
    public function getRealFontWeight()
    {
        if (isset($this->_chartjs_render_data['options']['globalOptions']['defaultFontStyle'])) {
            $oldFontStyle = $this->_chartjs_render_data['options']['globalOptions']['defaultFontStyle'];
            if (strpos($oldFontStyle, 'bold italic') !== false ||
                strpos($oldFontStyle, 'bold') !== false
            ) {
                return 'bold';
            }

            if (strpos($oldFontStyle, 'italic') !== false) {
                return 'normal';
            }
        }

        return $this->getFontWeight();
    }

    /**
     * @return string
     */
    public function getRealTitleFontStyle()
    {
        if (isset($this->_chartjs_render_data['options']['options']['title'])) {
            $oldTitleFontStyle = $this->_chartjs_render_data['options']['options']['title']['fontStyle'];
            if (strpos($oldTitleFontStyle, 'bold italic') !== false ||
                strpos($oldTitleFontStyle, 'italic') !== false
            ) {
                return 'italic';
            }

            if (strpos($oldTitleFontStyle, 'bold') !== false ||
                strpos($oldTitleFontStyle, 'normal') !== false
            ) {
                return 'normal';
            }
        }

        return $this->getTitleFontStyle();
    }

    /**
     * @return string
     */
    public function getRealTitleFontWeight()
    {
        if (isset($this->_chartjs_render_data['options']['options']['title'])) {
            $oldTitleFontStyle = $this->_chartjs_render_data['options']['options']['title']['fontStyle'];
            if (strpos($oldTitleFontStyle, 'bold italic') !== false ||
                strpos($oldTitleFontStyle, 'bold') !== false
            ) {
                return 'bold';
            }

            if (strpos($oldTitleFontStyle, 'italic') !== false ||
                strpos($oldTitleFontStyle, 'normal') !== false
            ) {
                return 'normal';
            }
        }

        return $this->getTitleFontWeight();
    }

    /**
     * @return string
     */
    public function getCurveType()
    {
        return $this->_curve_type;
    }

    /**
     * @param string $curve_type
     */
    public function setCurveType($curve_type)
    {
        $this->_curve_type = $curve_type;
    }

    /**
     * @return string
     */
    public function getTitlePosition()
    {
        return $this->_title_position;
    }

    /**
     * @param string $title_position
     */
    public function setTitlePosition($title_position)
    {
        $this->_title_position = $title_position;
    }

    /**
     * @return string
     */
    public function getTitleFontName()
    {
        return $this->_title_font_name;
    }

    /**
     * @param string $title_font_name
     */
    public function setTitleFontName($title_font_name)
    {
        $this->_title_font_name = $title_font_name;
    }

    /**
     * @return string
     */
    public function getTitleFontStyle()
    {
        return $this->_title_font_style;
    }

    /**
     * @param string $title_font_style
     */
    public function setTitleFontStyle($title_font_style)
    {
        $this->_title_font_style = $title_font_style;
    }

    /**
     * @return string
     */
    public function getTitleFontWeight()
    {
        return $this->_title_font_weight;
    }

    /**
     * @param string $title_font_weight
     */
    public function setTitleFontWeight($title_font_weight)
    {
        $this->_title_font_weight = $title_font_weight;
    }

    /**
     * @return string
     */
    public function getTooltipBackgroundColor()
    {
        return $this->_tooltip_background_color;
    }

    /**
     * @param string $tooltip_background_color
     */
    public function setTooltipBackgroundColor($tooltip_background_color)
    {
        $this->_tooltip_background_color = $tooltip_background_color;
    }

    /**
     * @return int
     */
    public function getTooltipBorderRadius()
    {
        return $this->_tooltip_border_radius;
    }

    /**
     * @param int $tooltip_border_radius
     */
    public function setTooltipBorderRadius($tooltip_border_radius)
    {
        $this->_tooltip_border_radius = $tooltip_border_radius;
    }

    /**
     * @return bool
     */
    public function isTooltipShared()
    {
        return $this->_tooltip_shared;
    }

    /**
     * @param bool $tooltip_shared
     */
    public function setTooltipShared($tooltip_shared)
    {
        $this->_tooltip_shared = $tooltip_shared;
    }

    /**
     * @return bool
     */
    public function isShowLegend()
    {
        return $this->_show_legend;
    }

    /**
     * @param bool $show_legend
     */
    public function setShowLegend($show_legend)
    {
        $this->_show_legend = $show_legend;
    }

    /**
     * @return string
     */
    public function getLegendPosition()
    {
        return $this->_legend_position_cjs;
    }

    /**
     * @param string $legend_position_cjs
     */
    public function setLegendPosition($legend_position_cjs)
    {
        $this->_legend_position_cjs = $legend_position_cjs;
    }


    /**
     * WPDT Chart.js constructor.
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

            $this->setEngine('chartjs');

            // Chart
            $this->setBorderWidth((int)WDTTools::defineDefaultValue($constructedChartData, 'border_width', 0));
            $this->setBorderColor(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'border_color', '#FFFFFF')));
            $this->setBorderRadius((int)WDTTools::defineDefaultValue($constructedChartData, 'border_radius', 0));
            $this->setFontSize(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'font_size', null)));
            $this->setFontName(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'font_name', 'Arial')));
            $this->setFontStyle(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'font_style', 'normal')));
            $this->setFontWeight(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'font_weight', 'bold')));
            $this->setFontColor(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'font_color', '#666')));

            //Series
            $this->setCurveType(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'curve_type', 'none')));

            // Axes
            $this->setShowGrid((bool)(WDTTools::defineDefaultValue($constructedChartData, 'show_grid', true)));
            $this->setMajorAxisLabel(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'horizontal_axis_label')));
            $this->setMinorAxisLabel(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'vertical_axis_label')));
            $this->setVerticalAxisMin(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'vertical_axis_min')));
            $this->setVerticalAxisMax(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'vertical_axis_max')));

            // Title
            $this->setShowTitle((bool)(WDTTools::defineDefaultValue($constructedChartData, 'show_title', true)));
            $this->setTitlePosition(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'title_position', 'top')));
            $this->setTitleFontName(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'title_font_name', 'Arial')));
            $this->setTitleFontStyle(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'title_font_style', 'normal')));
            $this->setTitleFontWeight(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'title_font_weight', 'bold')));
            $this->setTitleFontColor(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'title_font_color', '#666')));

            // Tooltip
            $this->setTooltipBackgroundColor(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'tooltip_background_color', 'rgba(255, 255, 255, 0.85)')));
            $this->setTooltipBorderRadius(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'tooltip_border_radius', 3)));
            $this->setTooltipShared((bool)(WDTTools::defineDefaultValue($constructedChartData, 'tooltip_shared', false)));

            // Legend
            $this->setShowLegend((bool)(WDTTools::defineDefaultValue($constructedChartData, 'show_legend', true)));
            $this->setLegendPosition(sanitize_text_field(WDTTools::defineDefaultValue($constructedChartData, 'legend_position_cjs', 'right')));
        }

    }

    /**
     * @return void
     */
    public function prepareRender()
    {

        $seriesEntry = array();

        $chartToSetOptionBeginAtZero = array(
            'chartjs_pie_chart',
            'chartjs_radar_chart',
            'chartjs_doughnut_chart',
            'chartjs_polar_area_chart',
            'chartjs_bubble_chart'
        );

        $colors = array(
            '#ff6384',
            '#36a2eb',
            '#ffce56',
            '#4bc0c0',
            '#9966ff',
            '#ff9f40',
            '#a6cee3',
            '#6a3d9a',
            '#b15928',
            '#fb9a99',
            '#0476e8',
            '#49C172',
            '#EA5E57',
            '#FFF458',
            '#BFEB54',
        );

        if ($this->_render_data['series']) {
            if (!empty($this->_chartjs_render_data['options']['data']['datasets'])) {
                $this->_chartjs_render_data['options']['data']['datasets'] = array();
            }
            if (in_array(
                $this->_type,
                array(
                    'chartjs_line_chart',
                    'chartjs_area_chart',
                    'chartjs_stacked_area_chart',
                    'chartjs_column_chart',
                    'chartjs_stacked_column_chart',
                    'chartjs_bar_chart',
                    'chartjs_stacked_bar_chart',
                    'chartjs_radar_chart'
                )
            )) {
                // Series and Categories
                for ($i = 0; $i < count($this->_render_data['columns']); $i++) {
                    if ($i == 0) {
                        $this->_chartjs_render_data['options']['data']['labels'] = array();
                    } else {
                        $seriesEntry = array(
                            'label' => $this->_render_data['series'][$i - 1]['label'],
                            'orig_header' => $this->_render_data['series'][$i - 1]['orig_header'],
                            'backgroundColor' => isset($this->_render_data['options']['series'][$i - 1]) ?
                                WDTTools::hex2rgba($this->_render_data['options']['series'][$i - 1]['color'], 0.2) : WDTTools::hex2rgba($colors[($i - 1) % 10], 0.2),
                            'borderColor' => isset($this->_render_data['options']['series'][$i - 1]) ?
                                $this->_render_data['options']['series'][$i - 1]['color'] : $colors[($i - 1) % 10],
                            'borderWidth' => 1,
                            'data' => array(),
                            'lineTension' => ($this->getCurveType()) ? 0.4 : 0,
                            'fill' => $this->_type != 'chartjs_line_chart'
                        );
                    }
                    foreach ($this->_render_data['rows'] as $row) {
                        if ($i == 0) {
                            $this->_chartjs_render_data['options']['data']['labels'][] = $row[$i];
                        } else {
                            $seriesEntry['data'][] = $row[$i];
                        }
                    }
                    if ($i != 0) {
                        $this->_chartjs_render_data['options']['data']['datasets'][] = $seriesEntry;
                    }
                }
            } else if (in_array(
                $this->_type,
                array(
                    'chartjs_polar_area_chart',
                    'chartjs_pie_chart',
                    'chartjs_doughnut_chart'
                )
            )) {
                // Series and Categories
                for ($i = 0; $i < count($this->_render_data['columns']); $i++) {
                    if ($i == 0) {
                        $this->_chartjs_render_data['options']['data']['labels'] = array();
                    } else {
                        $seriesEntry = array(
                            'label' => $this->_render_data['series'][$i - 1]['label'],
                            'backgroundColor' => isset($this->_render_data['options']['series'][$i - 1]) ?
                                $this->_render_data['options']['series'][$i - 1]['color'] : $colors,
                            'borderWidth' => 1,
                            'data' => array()
                        );
                    }
                    foreach ($this->_render_data['rows'] as $row) {
                        if ($i == 0) {
                            $this->_chartjs_render_data['options']['data']['labels'][] = $row[$i];
                        } else {
                            $seriesEntry['data'][] = $row[$i];
                        }
                    }
                    if ($i != 0) {
                        $this->_chartjs_render_data['options']['data']['datasets'][] = $seriesEntry;
                    }
                }
            } else if ($this->_type = 'chartjs_bubble_chart') {
                // Series and Categories
                for ($i = 0; $i < 2; $i++) {
                    foreach ($this->_render_data['rows'] as $key => $row) {
                        if ($i == 0) {
                            $this->_chartjs_render_data['options']['data']['datasets'][$key]['label'] = $row[$i];
                        }
                        if ($i == 1) {
                            $seriesEntry = array(
                                'data' => array()
                            );
                            $seriesEntry['backgroundColor'] = $colors[$key % 10];
                            $seriesEntry['hoverBackgroundColor'] = $colors[$key % 10];
                            $seriesEntry['data'][0]['x'] = $row[$i];
                            $seriesEntry['data'][0]['y'] = $row[$i + 1];
                            $seriesEntry['data'][0]['r'] = $row[$i + 2];
                            $this->_chartjs_render_data['options']['data']['datasets'][$key] = array_merge($this->_chartjs_render_data['options']['data']['datasets'][$key], $seriesEntry);
                        }
                    }
                }
            }
        }

        // Column Indexes


        // Chart
        $this->_chartjs_render_data['configurations']['type'] = $this->getType();
        $this->_chartjs_render_data['configurations']['container']['height'] = $this->getHeight();
        if ($this->isResponsiveWidth()) {
            $this->_chartjs_render_data['configurations']['container']['width'] = 0;
            $this->_chartjs_render_data['options']['options']['maintainAspectRatio'] = true;
        } else {
            $this->_chartjs_render_data['configurations']['container']['width'] = $this->getWidth();
            $this->_chartjs_render_data['options']['options']['maintainAspectRatio'] = false;
        }
        $this->_chartjs_render_data['configurations']['canvas']['backgroundColor'] = $this->getBackgroundColor();
        $this->_chartjs_render_data['configurations']['canvas']['borderWidth'] = $this->getBorderWidth();
        $this->_chartjs_render_data['configurations']['canvas']['borderColor'] = $this->getBorderColor();
        $this->_chartjs_render_data['configurations']['canvas']['borderRadius'] = $this->getBorderRadius();
        $this->_chartjs_render_data['options']['globalOptions']['font']['size'] = $this->getFontSize() != '' ? (int)$this->getFontSize() : 12;
        $this->_chartjs_render_data['options']['globalOptions']['font']['family'] = $this->getFontName();
        $this->_chartjs_render_data['options']['globalOptions']['font']['style'] = $this->getRealFontStyle();
        $this->_chartjs_render_data['options']['globalOptions']['font']['weight'] = $this->getRealFontWeight();
        $this->_chartjs_render_data['options']['globalOptions']['color'] = $this->getFontColor() == '' ? '#666' : $this->getFontColor();

        // Axes
        if (!$this->_show_grid) {
            $this->_chartjs_render_data['options']['options']['scales']['x']['display'] = false;
            $this->_chartjs_render_data['options']['options']['scales']['y']['display'] = false;
        }
        $this->_chartjs_render_data['options']['options']['scales']['x']['title']['display'] = true;
        $this->_chartjs_render_data['options']['options']['scales']['x']['title']['text'] = $this->getMajorAxisLabel();
        $this->_chartjs_render_data['options']['options']['scales']['x']['title']['font']['size'] = $this->getFontSize() != '' ? (int)$this->getFontSize() : 12;
        $this->_chartjs_render_data['options']['options']['scales']['x']['title']['font']['weight'] = $this->getRealFontWeight();
        $this->_chartjs_render_data['options']['options']['scales']['x']['title']['font']['style'] = $this->getRealFontStyle();
        $this->_chartjs_render_data['options']['options']['scales']['x']['title']['font']['family'] = $this->getFontName();
        $this->_chartjs_render_data['options']['options']['scales']['x']['title']['color'] = $this->getFontColor() == '' ? '#666' : $this->getFontColor();
        $this->_chartjs_render_data['options']['options']['scales']['y']['title']['display'] = true;
        $this->_chartjs_render_data['options']['options']['scales']['y']['title']['text'] = $this->getMinorAxisLabel();
        $this->_chartjs_render_data['options']['options']['scales']['y']['title']['font']['size'] = $this->getFontSize() != '' ? (int)$this->getFontSize() : 12;
        $this->_chartjs_render_data['options']['options']['scales']['y']['title']['font']['weight'] = $this->getRealFontWeight();
        $this->_chartjs_render_data['options']['options']['scales']['y']['title']['font']['style'] = $this->getRealFontStyle();
        $this->_chartjs_render_data['options']['options']['scales']['y']['title']['font']['family'] = $this->getFontName();
        $this->_chartjs_render_data['options']['options']['scales']['y']['title']['color'] = $this->getFontColor() == '' ? '#666' : $this->getFontColor();
        if ($this->getVerticalAxisMin() != '') {
            $this->_chartjs_render_data['options']['options']['scales']['y']['min'] = intval($this->getVerticalAxisMin());
        } else {
            if (in_array($this->_type, $chartToSetOptionBeginAtZero)) {
                $this->_chartjs_render_data['options']['options']['scales']['y']['beginAtZero'] = true;
                $this->_chartjs_render_data['options']['options']['scales']['y']['min'] = 0;
            } else {
                $this->_chartjs_render_data['options']['options']['scales']['y']['beginAtZero'] = false;
            }
        }
        $this->_chartjs_render_data['options']['options']['scales']['y']['ticks']['color'] = $this->getFontColor() == '' ? '#666' : $this->getFontColor();
        $this->_chartjs_render_data['options']['options']['scales']['y']['ticks']['font']['size'] = $this->getFontSize() != '' ? (int)$this->getFontSize() : 12;
        $this->_chartjs_render_data['options']['options']['scales']['y']['ticks']['font']['weight'] = $this->getRealFontWeight();
        $this->_chartjs_render_data['options']['options']['scales']['y']['ticks']['font']['style'] = $this->getRealFontStyle();
        $this->_chartjs_render_data['options']['options']['scales']['y']['ticks']['font']['family'] = $this->getFontName();
        $this->_chartjs_render_data['options']['options']['scales']['x']['ticks']['color'] = $this->getFontColor() == '' ? '#666' : $this->getFontColor();
        $this->_chartjs_render_data['options']['options']['scales']['x']['ticks']['font']['size'] = $this->getFontSize() != '' ? (int)$this->getFontSize() : 12;
        $this->_chartjs_render_data['options']['options']['scales']['x']['ticks']['font']['weight'] = $this->getRealFontWeight();
        $this->_chartjs_render_data['options']['options']['scales']['x']['ticks']['font']['style'] = $this->getRealFontStyle();
        $this->_chartjs_render_data['options']['options']['scales']['x']['ticks']['font']['family'] = $this->getFontName();
        if (in_array($this->_type, array('chartjs_polar_area_chart', 'chartjs_radar_chart'))) {
            $this->_chartjs_render_data['options']['options']['scales']['r']['ticks']['font']['size'] = $this->getFontSize() != '' ? (int)$this->getFontSize() : 12;
            $this->_chartjs_render_data['options']['options']['scales']['r']['ticks']['font']['weight'] = $this->getRealFontWeight();
            $this->_chartjs_render_data['options']['options']['scales']['r']['ticks']['font']['style'] = $this->getRealFontStyle();
            $this->_chartjs_render_data['options']['options']['scales']['r']['ticks']['font']['family'] = $this->getFontName();
            $this->_chartjs_render_data['options']['options']['scales']['r']['ticks']['color'] = $this->getFontColor() == '' ? '#666' : $this->getFontColor();

            $this->_chartjs_render_data['options']['options']['scales']['r']['pointLabels']['font']['size'] = $this->getFontSize() != '' ? (int)$this->getFontSize() : 12;
            $this->_chartjs_render_data['options']['options']['scales']['r']['pointLabels']['font']['weight'] = $this->getRealFontWeight();
            $this->_chartjs_render_data['options']['options']['scales']['r']['pointLabels']['font']['style'] = $this->getRealFontStyle();
            $this->_chartjs_render_data['options']['options']['scales']['r']['pointLabels']['font']['family'] = $this->getFontName();
            $this->_chartjs_render_data['options']['options']['scales']['r']['pointLabels']['color'] = $this->getFontColor() == '' ? '#666' : $this->getFontColor();
        }
        if ($this->getVerticalAxisMax() != '') {
            $this->_chartjs_render_data['options']['options']['scales']['y']['max'] = intval($this->getVerticalAxisMax());
        }

        // Title
        if ($this->isShowTitle()) {
            $this->_chartjs_render_data['options']['options']['plugins']['title']['display'] = true;
            $this->_chartjs_render_data['options']['options']['plugins']['title']['text'] = $this->getTitle();
        } else {
            $this->_chartjs_render_data['options']['options']['plugins']['title']['display'] = false;
        }
        $this->_chartjs_render_data['options']['options']['plugins']['title']['position'] = $this->getTitlePosition();
        $this->_chartjs_render_data['options']['options']['plugins']['title']['font']['family'] = $this->getTitleFontName();
        $this->_chartjs_render_data['options']['options']['plugins']['title']['font']['weight'] = $this->getRealTitleFontWeight();
        $this->_chartjs_render_data['options']['options']['plugins']['title']['font']['style'] = $this->getRealTitleFontStyle();
        $this->_chartjs_render_data['options']['options']['plugins']['title']['font']['size'] = $this->getFontSize() != '' ? (int)$this->getFontSize() : 12;
        $this->_chartjs_render_data['options']['options']['plugins']['title']['color'] = ($this->getTitleFontColor() != '') ? $this->getTitleFontColor() : '#666';

        // Tooltip
        $this->_chartjs_render_data['options']['options']['plugins']['tooltip']['enabled'] = $this->isTooltipEnabled();
        if ($this->isTooltipShared()) {
            $this->_chartjs_render_data['options']['options']['plugins']['tooltip']['mode'] = 'index';
        } else {
            $this->_chartjs_render_data['options']['options']['plugins']['tooltip']['mode'] = 'nearest';
            $this->_chartjs_render_data['options']['options']['plugins']['tooltip']['intersect'] = true;
        }
        $this->_chartjs_render_data['options']['options']['plugins']['tooltip']['backgroundColor'] = strpos($this->getTooltipBackgroundColor(), 'rgba') !== false ? $this->getTooltipBackgroundColor() : WDTTools::hex2rgba($this->getTooltipBackgroundColor(), 0.8);
        $this->_chartjs_render_data['options']['options']['plugins']['tooltip']['cornerRadius'] = $this->getTooltipBorderRadius();
        $this->_chartjs_render_data['options']['options']['plugins']['tooltip']['titleFont']['size'] = 12;
        $this->_chartjs_render_data['options']['options']['plugins']['tooltip']['bodyFont']['size'] = 12;
        $this->_chartjs_render_data['options']['options']['plugins']['tooltip']['footerFont']['size'] = 12;

        // Legend
        $this->_chartjs_render_data['options']['options']['plugins']['legend']['display'] = $this->isShowLegend();
        $this->_chartjs_render_data['options']['options']['plugins']['legend']['position'] = $this->getLegendPosition();
        $this->_chartjs_render_data['options']['options']['plugins']['legend']['labels']['color'] = $this->getFontColor() == '' ? '#666' : $this->getFontColor();
        $this->_chartjs_render_data['options']['options']['plugins']['legend']['labels']['font']['size'] = $this->getFontSize() != '' ? (int)$this->getFontSize() : 12;
        $this->_chartjs_render_data['options']['options']['plugins']['legend']['labels']['font']['weight'] = $this->getRealFontWeight();
        $this->_chartjs_render_data['options']['options']['plugins']['legend']['labels']['font']['style'] = $this->getRealFontStyle();

        // Compatibility with Chartjs 4.x version for old charts
        if (isset($this->_chartjs_render_data['options']['options']['title']))
            unset($this->_chartjs_render_data['options']['options']['title']);
        if (isset($this->_chartjs_render_data['options']['options']['legend']))
            unset($this->_chartjs_render_data['options']['options']['legend']);
        if (isset($this->_chartjs_render_data['options']['options']['tooltips']))
            unset($this->_chartjs_render_data['options']['options']['tooltips']);
        if (isset($this->_chartjs_render_data['options']['options']['scales']['xAxes']))
            unset($this->_chartjs_render_data['options']['options']['scales']['xAxes']);
        if (isset($this->_chartjs_render_data['options']['options']['scales']['yAxes']))
            unset($this->_chartjs_render_data['options']['options']['scales']['yAxes']);
        if (isset($this->_chartjs_render_data['options']['globalOptions']['defaultFontSize']))
            unset($this->_chartjs_render_data['options']['globalOptions']['defaultFontSize']);
        if (isset($this->_chartjs_render_data['options']['globalOptions']['defaultFontFamily']))
            unset($this->_chartjs_render_data['options']['globalOptions']['defaultFontFamily']);
        if (isset($this->_chartjs_render_data['options']['globalOptions']['defaultFontStyle']))
            unset($this->_chartjs_render_data['options']['globalOptions']['defaultFontStyle']);
        if (isset($this->_chartjs_render_data['options']['globalOptions']['defaultFontColor']))
            unset($this->_chartjs_render_data['options']['globalOptions']['defaultFontColor']);
        if (isset($this->_chartjs_render_data['options']['globalOptions']['defaultFontColor']))
            unset($this->_chartjs_render_data['options']['globalOptions']['defaultFontColor']);
        if (isset($this->_chartjs_render_data['options']['title']['fontFamily']))
            unset($this->_chartjs_render_data['options']['title']['fontFamily']);
        if (isset($this->_chartjs_render_data['options']['title']['fontStyle']))
            unset($this->_chartjs_render_data['options']['title']['fontStyle']);
        if (isset($this->_chartjs_render_data['options']['title']['fontColor']))
            unset($this->_chartjs_render_data['options']['title']['fontColor']);

        $this->_chartjs_render_data = apply_filters('wpdatatables_filter_chartjs_render_data', $this->_chartjs_render_data, $this->getId(), $this);

    }

    /**
     * @param $js_ext
     * @return false|string
     */
    public function enqueueChartSpecificScripts($js_ext)
    {
        $this->prepareRender();
        wp_enqueue_script('wdt-chartjs', WDT_JS_PATH . 'wdtcharts/chartjs/Chart.js', array(), WDT_CURRENT_VERSION);
        // ChartJS wpDataTable JS library
        wp_enqueue_script('wpdatatables-chartjs', WDT_JS_PATH . 'wdtcharts/chartjs/wdt.chartJS' . $js_ext, array('jquery'), WDT_CURRENT_VERSION);
        return json_encode($this->_chartjs_render_data);
    }

    /**
     * @param $renderData
     * @return void
     */
    public function setSpecificChartProperties($renderData)
    {
        // Chart
        $this->setBackgroundColor($renderData['chartjs_render_data']['configurations']['canvas']['backgroundColor']);
        $this->setBorderWidth($renderData['chartjs_render_data']['configurations']['canvas']['borderWidth']);
        $this->setBorderColor($renderData['chartjs_render_data']['configurations']['canvas']['borderColor']);
        $this->setBorderRadius($renderData['chartjs_render_data']['configurations']['canvas']['borderRadius']);
        if (isset($renderData['chartjs_render_data']['options']['globalOptions']['defaultFontSize'])) {
            $this->setFontSize($renderData['chartjs_render_data']['options']['globalOptions']['defaultFontSize']);
        } else {
            $this->setFontSize($renderData['chartjs_render_data']['options']['globalOptions']['font']['size']);
        }
        if (isset($renderData['chartjs_render_data']['options']['globalOptions']['defaultFontFamily'])) {
            $this->setFontName($renderData['chartjs_render_data']['options']['globalOptions']['defaultFontFamily']);
        } else {
            $this->setFontName($renderData['chartjs_render_data']['options']['globalOptions']['font']['family']);
        }
        if (isset($renderData['chartjs_render_data']['options']['globalOptions']['defaultFontStyle'])) {
            $this->setFontStyle($renderData['chartjs_render_data']['options']['globalOptions']['defaultFontStyle']);
        } else {
            $this->setFontStyle($renderData['chartjs_render_data']['options']['globalOptions']['font']['style']);
            $this->setFontWeight($renderData['chartjs_render_data']['options']['globalOptions']['font']['weight']);
        }
        if (isset($renderData['chartjs_render_data']['options']['globalOptions']['defaultFontColor'])) {
            $this->setFontColor($renderData['chartjs_render_data']['options']['globalOptions']['defaultFontColor']);
        } else {
            $this->setFontColor($renderData['chartjs_render_data']['options']['globalOptions']['color']);
        }
        // Series
        isset($renderData['chartjs_render_data']['options']['data']['datasets'][0]['lineTension']) ?
            $this->setCurveType($renderData['chartjs_render_data']['options']['data']['datasets'][0]['lineTension']) : null;
        // Axes
        if (isset($renderData['chartjs_render_data']['options']['options']['scales']['xAxes'][0]['scaleLabel']['labelString'])) {
            $this->setMajorAxisLabel($renderData['chartjs_render_data']['options']['options']['scales']['xAxes'][0]['scaleLabel']['labelString']);
        } else {
            $this->setMajorAxisLabel($renderData['chartjs_render_data']['options']['options']['scales']['x']['title']['text']);
        }
        if (isset($renderData['chartjs_render_data']['options']['options']['scales']['yAxes'][0]['scaleLabel']['labelString'])) {
            $this->setMinorAxisLabel($renderData['chartjs_render_data']['options']['options']['scales']['yAxes'][0]['scaleLabel']['labelString']);
        } else {
            $this->setMinorAxisLabel($renderData['chartjs_render_data']['options']['options']['scales']['y']['title']['text']);
        }
        if (isset($renderData['chartjs_render_data']['options']['options']['scales']['yAxes'][0]['ticks']['min']))
            $this->setVerticalAxisMin($renderData['chartjs_render_data']['options']['options']['scales']['yAxes'][0]['ticks']['min']);
        if (isset($renderData['chartjs_render_data']['options']['options']['scales']['yAxes'][0]['ticks']['max']))
            $this->setVerticalAxisMax($renderData['chartjs_render_data']['options']['options']['scales']['yAxes'][0]['ticks']['max']);
        if (isset($renderData['chartjs_render_data']['options']['options']['scales']['y']['min']))
            $this->setVerticalAxisMin($renderData['chartjs_render_data']['options']['options']['scales']['y']['min']);
        if (isset($renderData['chartjs_render_data']['options']['options']['scales']['y']['max']))
            $this->setVerticalAxisMax($renderData['chartjs_render_data']['options']['options']['scales']['y']['max']);

        if (isset($renderData['chartjs_render_data']['options']['options']['plugins'])) {
            // Title
            $this->setTitlePosition($renderData['chartjs_render_data']['options']['options']['plugins']['title']['position']);
            $this->setTitleFontName($renderData['chartjs_render_data']['options']['options']['plugins']['title']['font']['family']);
            $this->setTitleFontStyle($renderData['chartjs_render_data']['options']['options']['plugins']['title']['font']['style']);
            $this->setTitleFontWeight($renderData['chartjs_render_data']['options']['options']['plugins']['title']['font']['weight']);
            $this->setTitleFontColor($renderData['chartjs_render_data']['options']['options']['plugins']['title']['color']);
            // Tooltip
            $this->setTooltipEnabled($renderData['chartjs_render_data']['options']['options']['plugins']['tooltip']['enabled']);
            if ($renderData['chartjs_render_data']['options']['options']['plugins']['tooltip']['mode'] == 'nearest') {
                $this->setTooltipShared(false);
            } else {
                $this->setTooltipShared(true);
            }
            $this->setTooltipBackgroundColor($renderData['chartjs_render_data']['options']['options']['plugins']['tooltip']['backgroundColor']);
            $this->setTooltipBorderRadius($renderData['chartjs_render_data']['options']['options']['plugins']['tooltip']['cornerRadius']);
            // Legend
            $this->setShowLegend($renderData['chartjs_render_data']['options']['options']['plugins']['legend']['display']);
            $this->setLegendPosition($renderData['chartjs_render_data']['options']['options']['plugins']['legend']['position']);
        } else {
            // Title
            $this->setTitlePosition($renderData['chartjs_render_data']['options']['options']['title']['position']);
            $this->setTitleFontName($renderData['chartjs_render_data']['options']['options']['title']['fontFamily']);
            $this->setTitleFontStyle($renderData['chartjs_render_data']['options']['options']['title']['fontStyle']);
            $this->setTitleFontColor($renderData['chartjs_render_data']['options']['options']['title']['fontColor']);
            // Tooltip
            $this->setTooltipEnabled($renderData['chartjs_render_data']['options']['options']['tooltips']['enabled']);
            if ($renderData['chartjs_render_data']['options']['options']['tooltips']['mode'] == 'single') {
                $this->setTooltipShared(false);
            } else {
                $this->setTooltipShared(true);
            }
            $this->setTooltipBackgroundColor($renderData['chartjs_render_data']['options']['options']['tooltips']['backgroundColor']);
            $this->setTooltipBorderRadius($renderData['chartjs_render_data']['options']['options']['tooltips']['cornerRadius']);
            // Legend
            $this->setShowLegend($renderData['chartjs_render_data']['options']['options']['legend']['display']);
            $this->setLegendPosition($renderData['chartjs_render_data']['options']['options']['legend']['position']);
        }
    }

    /**
     * @return mixed|null
     */
    public function returnRenderData()
    {
        return $this->_chartjs_render_data;
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
            'chartjs_render_data' => $this->_chartjs_render_data,
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
        if (!empty($renderData['chartjs_render_data'])) {
            $this->_chartjs_render_data = $renderData['chartjs_render_data'];
        }
        return parent::setChartRenderData($chartData);
    }
}