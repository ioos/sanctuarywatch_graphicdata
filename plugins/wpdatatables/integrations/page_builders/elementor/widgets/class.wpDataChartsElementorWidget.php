<?php

namespace Elementor;

use WDTConfigController;

class WPDataCharts_Elementor_Widget extends Widget_Base {

    private $_allCharts;

    public function get_name() {
        return 'wpdatacharts';
    }

    public function get_title() {
        return 'wpDataCharts';
    }

    public function get_icon() {
        return 'wpdt-chart-logo';
    }

    public function get_categories() {
        return [ 'wpdatatables-elementor' ];
    }

    /**
     * @return mixed
     */
    public function getAllCharts()
    {
        return $this->_allCharts;
    }

    /**
     * @param mixed $allCharts
     */
    public function setAllCharts($allCharts)
    {
        $this->_allCharts = $allCharts;
    }

    protected function register_controls() {

        $this->start_controls_section(
            'wpdatacharts_section',
            [
                'label' => __( 'wpDataChart content', 'wpdatatables' ),
            ]
        );

        $this->add_control(
            'wpdt-chart-id',
            [
                'label' => __( 'Select wpDataChart:', 'wpdatatables' ),
                'type' => Controls_Manager::SELECT,
                'options' => WDTConfigController::getAllTablesAndChartsForPageBuilders('elementor', 'charts'),
                'default' => 0
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        self::setAllCharts(WDTConfigController::getAllTablesAndChartsForPageBuilders('elementor', 'charts'));
        $settings = $this->get_settings_for_display();
        $chartShortcodeParams = '[wpdatachart id=' . $settings['wpdt-chart-id'] . ']';

        $chartShortcodeParams = apply_filters('wpdatatables_filter_elementor_chart_shortcode', $chartShortcodeParams);

        if (count(self::getAllCharts()) == 1) {
            $result = WDTConfigController::wdt_create_chart_notice();
        } elseif (!(int)$settings['wpdt-chart-id']) {
            $result = WDTConfigController::wdt_select_chart_notice();
        } else {
            $result = $chartShortcodeParams;
        }
        echo __($result);

    }

}



