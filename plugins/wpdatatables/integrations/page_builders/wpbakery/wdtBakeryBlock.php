<?php

/**
 * Optional Visual Composer integration
 */
if (function_exists('vc_map')) {

    /**
     * Insert wpDataTable button
     */
    vc_map(
        array(
            'name' => 'wpDataTable',
            'base' => 'wpdatatable',
            'description' => __('Interactive Responsive Table', 'wpdatatable'),
            'category' => __('Content'),
            'icon' => plugin_dir_url( dirname(__FILE__) ) . 'wpbakery/assets/img/vc-icon.png',
            'params' => array(
                array(
                    'type' => 'dropdown',
                    'class' => '',
                    'heading' => __('wpDataTable', 'wpdatatables'),
                    'admin_label' => true,
                    'param_name' => 'id',
                    'value' => WDTConfigController::getAllTablesAndChartsForPageBuilders('bakery', 'tables'),
                    'description' => __('Choose the wpDataTable from a dropdown', 'wpdatatables')
                ),
                array(
                    'type' => 'textfield',
                    'heading' => __('Export file name', 'wpdatatables'),
                    'param_name' => 'export_file_name',
                    'value' => '',
                    'group' => __('Export file', 'wpdatatables'),
                    'description' => __('If you use export buttons like CSV or Excel, you can set custom export file name here', 'wpdatatables')
                )
            )
        )
    );

    /**
     * Insert wpDataChart button
     */
    vc_map(
        array(
            'name' => 'wpDataChart',
            'base' => 'wpdatachart',
            'description' => __('Google, Chart.js, Highcharts or Apexcharts chart based on a wpDataTable', 'wpdatatable'),
            'category' => __('Content'),
            'icon' => plugin_dir_url( dirname(__FILE__) ) . 'wpbakery/assets/img/vc-charts-icon.png',
            "params" => array(
                array(
                    "type" => "dropdown",
                    "class" => "",
                    "heading" => __('wpDataChart', 'wpdatatables'),
                    "param_name" => "id",
                    'admin_label' => true,
                    "value" => WDTConfigController::getAllTablesAndChartsForPageBuilders('bakery', 'charts'),
                    "description" => __("Choose one of wpDataCharts from the list", 'wpdatatables')
                )
            )
        )
    );

}
