<?php

defined('ABSPATH') or die('Access denied.');

/**
 * Class WDTGutenbergBlocks
 */
class WDTGutenbergBlocks
{
    private static $instance;

    /**
     * Returns an instance of this class.
     */
    public static function getInstance()
    {
        if (null === self::$instance) {
            self::$instance = new WDTGutenbergBlocks();
        }
        return self::$instance;
    }

    /**
     * Initializes the plugin by setting filters
     */
    private function __construct()
    {
        add_action('enqueue_block_editor_assets', array($this, 'registerBlockScripts'));
        add_action('init', array($this, 'registerBlockTypes'));
        add_filter('block_categories_all', array($this, 'addWpDataTablesBlockCategory'), 10, 2);
    }

    /**
     * Creating wpDataTables block category in Gutenberg
     */
    public function addWpDataTablesBlockCategory ($categories, $post)
    {
        return array_merge(
            array(
                array(
                    'slug' => 'wpdatatables-blocks',
                    'title' => 'wpDataTables',
                ),
            ),
            $categories
        );
    }

    /**
     * Register Gutenberg Blocks for wpDataTables.
     */
    public function registerBlockTypes()
    {
        if (is_admin() && function_exists('register_block_type')) {
            if (substr($_SERVER['PHP_SELF'], '-8') == 'post.php' ||
                substr($_SERVER['PHP_SELF'], '-12') == 'post-new.php'
            ) {
                if ($this->isGutenbergActive()) {
                    register_block_type(
                        'wpdatatables/wpdatatables-gutenberg-block',
                        array('editor_script' => 'wpdatatables-block')
                    );
                    register_block_type(
                        'wpdatatables/wpdatacharts-gutenberg-block',
                        array('editor_script' => 'wpdatacharts-block')
                    );
                }
            }
        }
    }

    /**
     * Check if Block Editor is active.
     *
     * @return bool
     */
    public function isGutenbergActive(): bool
    {
        // Gutenberg plugin is installed and activated.
        $gutenberg = !(false === has_filter('replace_editor', 'gutenberg_init'));

        // Block editor since 5.0.
        $block_editor = version_compare($GLOBALS['wp_version'], '5.0-beta', '>');

        if (!$gutenberg && !$block_editor) {
            return false;
        }

        if ($this->isClassicEditorPluginActive()) {
            $editor_option = get_option('classic-editor-replace');
            $block_editor_active = array('no-replace', 'block');

            return in_array($editor_option, $block_editor_active, true);
        }

        // Fix for conflict with Avada - Fusion builder and gutenberg blocks
        if (class_exists('FusionBuilder') && !(isset($_GET['gutenberg-editor']))) {
            $postTypes = FusionBuilder::allowed_post_types();
            return count(array_intersect(['page', 'post'], $postTypes)) < 2;
        }

        // Fix for conflict with WooCommerce product page
        if (class_exists('WooCommerce') && (isset($_GET['post_type'])) && ($_GET['post_type']) == "product") {
            return false;
        }

        // Fix for conflict with Disable Gutenberg plugin
        if (class_exists('DisableGutenberg')) {
            return false;
        }

        return true;
    }

    /**
     * Check if Classic Editor plugin is active
     *
     * @return bool
     */
    public function isClassicEditorPluginActive(): bool
    {

        if (!function_exists('is_plugin_active')) {

            include_once ABSPATH . 'wp-admin/includes/plugin.php';
        }

        if (is_plugin_active('classic-editor/classic-editor.php')) {

            return true;
        }

        return false;
    }
    public function registerBlockScripts(){

        wp_enqueue_script(
            'wpdatatables-block',
            WDT_ROOT_URL . 'integrations/page_builders/gutenberg/js/wpdatatables-gutenberg-block.js',
            array( 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element', 'wp-editor')
        );

        wp_localize_script(
            'wpdatatables-block',
            'wpdatatables',
            array(
                'title' => 'wpDataTables',
                'description' => __('Choose the table that you’ve just created in the dropdown below, and the shortcode will be inserted automatically. You are able to provide values for placeholders and also for Export file name.','wpdatatables'),
                'data' => WDTConfigController::getAllTablesAndChartsForPageBuilders('gutenberg', 'tables')
            )
        );

        wp_enqueue_script(
            'wpdatacharts-block',
            WDT_ROOT_URL . 'integrations/page_builders/gutenberg/js/wpdatacharts-gutenberg-block.js',
            array( 'wp-blocks', 'wp-block-editor', 'wp-components', 'wp-element', 'wp-editor')
        );

        wp_localize_script(
            'wpdatacharts-block',
            'wpdatacharts',
            array(
                'title' => 'wpDataCharts',
                'description' => __('Choose the chart that you’ve just created in the dropdown below, and the shortcode will be inserted automatically.','wpdatatables'),
                'data' => WDTConfigController::getAllTablesAndChartsForPageBuilders('gutenberg', 'charts')
            )
        );
    }
}