<?php


class DIVI_wpDataChart extends ET_Builder_Module
{

    public $slug       = 'DIVI_wpDataChart';
    public $vb_support = 'on';

    private $_allCharts;

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



    protected $module_credits = array(
        'module_uri' => '',
        'author'     => '',
        'author_uri' => '',
    );

    public function init()
    {
        $this->name = esc_html__('wpDataChart', 'wpdatatables');
        $this->setAllCharts(WDTConfigController::getAllTablesAndChartsForPageBuilders('divi', 'charts'));
    }

    /**
     * Advanced Fields Config
     *
     * @return array
     */
    public function get_advanced_fields_config()
    {
        return array(
            'button' => false,
            'link_options' => false
        );
    }

    public function get_fields()
    {
        return array(
            'id' => array(
                'label' => __('Choose a wpDataChart', 'wpdatatables'),
                'type' => 'select',
                'default_on_front' => $this->getAllCharts()[0],
                'options' => $this->getAllCharts()
            ),
            'chart_array_length' => array(
                'type' => 'text',
                'default_on_front' => count($this->getAllCharts()),
                'show_if' => array(
                    'id' => -1
                )
            )
        );
    }

    public function render($attrs, $content = null, $render_slug = null)
    {
        $shortcode = '[wpdatachart ';
        $chartId =  $this->props['id'];

        //Fix for Divi not recognizing chart ID as an int when only one chart is created
        if (!is_numeric($chartId)) {
            $chartId = substr($chartId, strrpos($chartId, "(id:") + 4);
            $chartId = substr($chartId, 0,strrpos($chartId, ')') );
            $chartId = (int)$chartId;
        }

        if(count($this->getAllCharts()) == 1) {
            return __(WDTConfigController::wdt_create_chart_notice());
        }

        if (!(int)$chartId) {
            return __(WDTConfigController::wdt_select_chart_notice());
        }

        $shortcode .= 'id=' . $chartId;
        $shortcode .= ']';

        return do_shortcode($shortcode);

    }
}

new DIVI_wpDataChart;