<?php

defined('ABSPATH') or die('Access denied.');

class WPDataTables_Fusion_Elements
{

    public function __construct()
    {
        $this->add_wpdatatables_fusion_element();
        $this->add_wpdatacharts_fusion_element();
        add_action( 'fusion_builder_before_init', [$this,'add_wpdatatables_fusion_element'] );
        add_action( 'fusion_builder_before_init', [$this,'add_wpdatacharts_fusion_element'] );
        if (function_exists( 'fusion_is_builder_frame' ) && fusion_is_builder_frame()) {
            add_action('wp_enqueue_scripts', [$this,'elements_frontend_css'], 999);
        }
    }

    /**
     * Include CSS for wpDataTables elements
     */
    function elements_frontend_css() {
        wp_enqueue_style(
            'wpdatatable_avada_frontend_css',
            WDT_INTEGRATIONS_URL . 'page_builders/avada/assets/css/style.css'
        );
    }

    /**
     * Add wpDataTables Fusion element
     */
    public function add_wpdatatables_fusion_element()
    {
        fusion_builder_map(
            array(
                'name'              => esc_attr__( 'wpDataTable', 'wpdatatables' ),
                'shortcode'         => 'wpdatatable',
                'icon'              => 'wpdatatable-fusion-icon',
                'admin_enqueue_css' => WDT_INTEGRATIONS_URL . 'page_builders/avada/assets/css/style.css',
                'preview'           => WDT_ROOT_PATH . 'integrations/page_builders/avada/includes/wpdatatable_preview.inc.php',
                'preview_id'        => 'fusion_builder_block_wpdatatable_preview_template',
                'params'            => array(
                    array(
                        'type'        => 'select',
                        'heading'     => __('Choose a wpDataTable:', 'wpdatatables'),
                        'description' => __('Select the wpDataTable ID to display on the page.', 'wpdatatables'),
                        'param_name'  => 'id',
                        'value'       => WDTConfigController::getAllTablesAndChartsForPageBuilders('avada', 'tables')
                    ),
                    array(
                        'type'        => 'textfield',
                        'heading'     => __('Export file name', 'wpdatatables'),
                        'description' => __('Set the name for the export file.', 'wpdatatables'),
                        'param_name'  => 'export_file_name',
                        'value'       => '',
                        'group'       => esc_attr__('File', 'wpdatatables'),
                    ),
                )
            )
        );
    }

    /**
     * ADD wpDataCharts Fusion element
     */
    public function add_wpdatacharts_fusion_element()
    {
        fusion_builder_map(
            array(
                'name'              => esc_attr__( 'wpDataChart', 'wpdatatables' ),
                'shortcode'         => 'wpdatachart',
                'icon'              => 'wpdatachart-fusion-icon',
                'allow_generator'   => true,
                'inline_editor'     => true,
                'admin_enqueue_css' => WDT_INTEGRATIONS_URL . 'page_builders/avada/assets/css/style.css',
                'preview'           => WDT_ROOT_PATH . 'integrations/page_builders/avada/includes/wpdatachart_preview.inc.php',
                'preview_id'        => 'fusion_builder_block_wpdatachart_preview_template',
                'params'            => array(
                    array(
                        'type'        => 'select',
                        'heading'     => __('Choose a wpDataChart:', 'wpdatatables'),
                        'description' => __('Select the wpDataChart ID to display on the page.', 'wpdatatables'),
                        'param_name'  => 'id',
                        'value'       => WDTConfigController::getAllTablesAndChartsForPageBuilders('avada', 'charts')
                    ),
                )
            )
        );
    }

    /**
     * Helper func that render content for Avada Live builder
     */
    public static function get_content_for_avada_live_builder($atts, $type) {
        $elementImage = 'vc-icon.png';
        $elementName = 'wpDataTable';
        $elementMessage = __('Please select wpDataTable ID.', 'wpdatatables');
        if ($type == 'chart'){
            $elementImage = 'vc-charts-icon.png';
            $elementName = 'wpDataChart';
            $elementMessage = __('Please select wpDataChart ID.', 'wpdatatables');
        }

        if ($atts['id'] != ''){
            $shortcode = '';
            $ID = (int)$atts['id'];
            if ($type == 'table'){
                $tableData = WDTConfigController::loadTableFromDB($ID);
                $title = __('Table: ', 'wpdatatables') . $tableData->title . ' (ID:' . $ID . ')';
                $shortcode = 'wpdatatable id=' . $ID;
                if ($atts['export_file_name'] != '') $shortcode .= ' export_file_name=' . $atts['export_file_name'];
            } else if ($type == 'chart'){
                $dbChartData = WPDataChart::getChartDataById($ID);
                $chartData = [
                    'id' => $ID,
                    'engine' => $dbChartData->engine
                ];
                $wpDataChart = WPDataChart::build($chartData, true);
                $title = __('Chart: ', 'wpdatatables') . $wpDataChart->getTitle() . ' (ID:' . $ID . ')';
                $shortcode ='wpdatachart id=' . $ID;
            }
            $content = '<div class="wpdt-placeholder" style="text-align: center; display:block; margin: 20px auto;" >';
            $content .='<img alt="" src="' . esc_url(WDT_INTEGRATIONS_URL . 'page_builders/avada/assets/img/' . $elementImage) . '"
            style="background: no-repeat scroll center center; border-radius: 2px;">';
            $content .='<span style="font-weight: bold;font-size: 20px;margin-left: 5px;">' . esc_html($elementName) . '</span>';
            $content .='<p style="font-size: 16px;margin-top:10px;margin-bottom: 5px; text-align: center;">' . esc_html($title) . '</p>';
            $content .='<p style="font-size: 16px; text-align: center;"><span>&#91;</span>' . esc_html($shortcode) . '<span>&#93;</span></p></div>';
        } else {
            $content = '<div class="wpdt-placeholder" style="text-align: center; display:block; margin: 20px auto;">';
            $content .='<img alt="" src="' . esc_url(WDT_INTEGRATIONS_URL . 'page_builders/avada/assets/img/' . $elementImage) . '"
            style="background: no-repeat scroll center center; border-radius: 2px;">';
            $content .='<span style="font-weight: bold;font-size: 20px;margin-left: 5px;">' . esc_html($elementName) . '</span>';
            $content .='<p style="font-size: 16px;margin-top:10px; text-align: center;">' . esc_html($elementMessage) . '</p></div>';
        }

        return $content;
    }
}

/**
 * Create elements if Fusion builder is active
 */
function is_fusion_builder_active()
{
    if (!function_exists('is_plugin_active')) {
        include_once(ABSPATH . 'wp-admin/includes/plugin.php');
    }
    if (is_plugin_active('fusion-builder/fusion-builder.php') &&
        function_exists('fusion_is_element_enabled') &&
        class_exists('Fusion_Element'))
    {
        new WPDataTables_Fusion_Elements;
    }
}
add_action('init', 'is_fusion_builder_active');