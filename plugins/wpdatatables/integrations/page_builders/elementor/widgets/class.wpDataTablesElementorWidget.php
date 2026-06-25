<?php

namespace Elementor;

use WDTConfigController;

class WPDataTables_Elementor_Widget extends Widget_Base {

    private $_allTables;

    public function get_name() {
        return 'wpdatatables';
    }

    public function get_title() {
        return 'wpDataTables';
    }

    public function get_icon() {
        return 'wpdt-table-logo';
    }

    public function get_categories() {
        return [ 'wpdatatables-elementor' ];
    }

    /**
     * @return mixed
     */
    public function getAllTables()
    {
        return $this->_allTables;
    }

    /**
     * @param mixed $allTables
     */
    public function setAllTables($allTables)
    {
        $this->_allTables = $allTables;
    }

    protected function register_controls() {

        $this->start_controls_section(
            'wpdatatables_section',
            [
                'label' => __( 'wpDataTable content', 'wpdatatables' ),
            ]
        );

        $this->add_control(
            'wpdt-table-id',
            [
                'label' => __( 'Select wpDataTable:', 'wpdatatables' ),
                'type' => Controls_Manager::SELECT,
                'options' => WDTConfigController::getAllTablesAndChartsForPageBuilders('elementor', 'tables'),
                'default' => 0
            ]
        );

        $this->add_control(
            'wpdt-file-name',
            [
                'label' => __( 'Set name for export file:', 'wpdatatables' ),
                'label_block' => true,
                'type' => Controls_Manager::TEXT,
                'placeholder' => __( 'Insert name for export file', 'wpdatatables' ),
            ]
        );

        $this->end_controls_section();
    }

    protected function render() {
        self::setAllTables(WDTConfigController::getAllTablesAndChartsForPageBuilders('elementor', 'tables'));
        $settings = $this->get_settings_for_display();
        $tableShortcodeParams = '[wpdatatable id=' . $settings['wpdt-table-id'];
        $tableShortcodeParams .= $settings['wpdt-file-name'] != '' ? ' export_file_name=' . $settings['wpdt-file-name'] : '';
        $tableShortcodeParams .= ']';

        $tableShortcodeParams = apply_filters('wpdatatables_filter_elementor_table_shortcode', $tableShortcodeParams);

        if (count(self::getAllTables()) == 1) {
            $result = WDTConfigController::wdt_create_table_notice();
        } elseif (!(int)$settings['wpdt-table-id']) {
            $result = WDTConfigController::wdt_select_table_notice();
        } else {
            $result = $tableShortcodeParams;
        }
        echo __($result);

    }

}



