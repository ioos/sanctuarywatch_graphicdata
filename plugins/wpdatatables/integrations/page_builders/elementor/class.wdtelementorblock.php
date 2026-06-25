<?php

defined('ABSPATH') or die('Access denied.');

use Elementor\WPDataTables_Elementor_Widget;
use Elementor\WPDataCharts_Elementor_Widget;
use Elementor\Plugin;

final class WPDataTables_Elementor_Widgets {

    private static $_instance = null;

    public static function instance() {
        if ( is_null( self::$_instance ) ) {
            self::$_instance = new self();
        }
        return self::$_instance;
    }

    public function init() {
        if ($this->check_version()) {
            add_action('elementor/widgets/widgets_registered', [$this, 'register_widgets']);
        } else {
            add_action('elementor/widgets/register', [$this, 'register_widgets']);
        }
        add_action('elementor/editor/before_enqueue_scripts', [$this, 'widget_styles']);
        add_action('elementor/frontend/after_enqueue_styles', [$this, 'widget_styles']);
        add_action('elementor/elements/categories_registered', [$this, 'register_widget_categories']);
    }

    public function is_compatible() {
        return defined('ELEMENTOR_VERSION');
    }

    public function check_version() {
        return version_compare(ELEMENTOR_VERSION, '3.5.0', '<');
    }

    protected function __construct()
    {
        if ( $this->is_compatible() ) {
            add_action( 'elementor/init', [ $this, 'init' ] );
        }
    }

    public function includes()
    {
        require_once(WDT_ROOT_PATH . 'integrations/page_builders/elementor/widgets/class.wpDataTablesElementorWidget.php');
        require_once(WDT_ROOT_PATH . 'integrations/page_builders/elementor/widgets/class.wpDataChartsElementorWidget.php');
    }

    public function register_widgets($widgets_manager)
    {
        $this->includes();
        if ($this->check_version()){
            Plugin::instance()->widgets_manager->register_widget_type(new WPDataTables_Elementor_Widget());
            Plugin::instance()->widgets_manager->register_widget_type(new WPDataCharts_Elementor_Widget());
        } else {
            $widgets_manager->register(new WPDataTables_Elementor_Widget());
            $widgets_manager->register(new WPDataCharts_Elementor_Widget());
        }
    }

    public function widget_styles()
    {
        wp_register_style('wpdt-elementor-widget-font', WDT_ROOT_URL . 'integrations/page_builders/elementor/css/style.css', array(), WDT_CURRENT_VERSION);
        wp_enqueue_style('wpdt-elementor-widget-font');
    }

    public function register_widget_categories($elements_manager)
    {
        $elements_manager->add_category(
            'wpdatatables-elementor',
            [
                'title' => 'wpDataTables',
                'icon' => 'wpdt-table-logo',
            ], 1);
    }

}

\WPDataTables_Elementor_Widgets::instance();




