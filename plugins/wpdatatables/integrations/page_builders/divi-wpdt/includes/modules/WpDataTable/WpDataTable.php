<?php


class DIVI_wpDataTable extends ET_Builder_Module
{

    public $slug       = 'DIVI_wpDataTable';
    public $vb_support = 'on';

    private $_allTables;

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

    protected $module_credits = array(
        'module_uri' => '',
        'author'     => '',
        'author_uri' => '',
    );

    public function init()
    {
        $this->name = esc_html__('wpDataTable', 'wpdatatables');
        $this->setAllTables(WDTConfigController::getAllTablesAndChartsForPageBuilders('divi', 'tables'));
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
                'label' => __('Choose a wpDataTable', 'wpdatatables'),
                'type' => 'select',
                'default_on_front' => $this->getAllTables()[0],
                'options' => $this->getAllTables()
            ),
            'export_file_name' => array(
                'label' => __( 'Set the name for the export file', 'wpdatatables' ),
                'type' => 'text',
                'default_on_front' => ''
            ),
            'table_array_length' => array(
                'type' => 'text',
                'default_on_front' => count($this->getAllTables()),
                'show_if' => array(
                    'id' => -1
                )
            )
        );
    }

    public function render($attrs, $content = null, $render_slug = null)
    {
        $shortcode = '[wpdatatable ';
        $tableId =  $this->props['id'];
        $export_file_name = $this->props['export_file_name'];

        //Fix for Divi not recognizing table ID as an int when only one table is created
        if (!is_numeric($tableId)) {
            $tableId = substr($tableId, strrpos($tableId, "(id:") + 4);
            $tableId = substr($tableId, 0,strrpos($tableId, ')') );
            $tableId = (int)$tableId;
        }

        if (count($this->getAllTables()) == 1) {
            return __(WDTConfigController::wdt_create_table_notice());
        }
        if (!(int)$tableId) {
            return __(WDTConfigController::wdt_select_table_notice());
        }

        $shortcode .= 'id=' . $tableId;
        if($export_file_name) {
            $shortcode .= ' export_file_name=' . $export_file_name;
        }
        $shortcode .= ']';

        return do_shortcode($shortcode);
    }
}

new DIVI_wpDataTable;