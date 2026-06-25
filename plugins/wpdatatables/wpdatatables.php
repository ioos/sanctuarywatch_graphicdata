<?php
/*
Plugin Name: wpDataTables - Tables & Table Charts
Plugin URI: https://wpdatatables.com
Description: Create responsive, sortable tables & charts from Excel, CSV or PHP. Add tables & charts to any post in minutes with DataTables.
Version: 6.5.0.7
Author: TMS-Plugins
Author URI: https://tmsproducts.io
Text Domain: wpdatatables
Domain Path: /languages
*/

?>
<?php

defined('ABSPATH') or die("Cannot access pages directly.");

/******************************
 * Includes and configuration *
 ******************************/

define('WDT_ROOT_PATH', plugin_dir_path(__FILE__)); // full path to the wpDataTables root directory
define('WDT_ROOT_URL', plugin_dir_url(__FILE__)); // URL of wpDataTables plugin
if (!defined('WDT_BASENAME')) {
    define('WDT_BASENAME', plugin_basename(__FILE__));
}
// Config file
require_once(WDT_ROOT_PATH . 'config/config.inc.php');

// Check PHP version
if (version_compare(WDT_PHP_SERVER_VERSION, WDT_REQUIRED_PHP_VERSION, '<')) {

    if (!function_exists('is_plugin_active')) {
        require_once ABSPATH . 'wp-admin/includes/plugin.php';
    }

    if (is_plugin_active(WDT_BASENAME)) {
        deactivate_plugins(WDT_BASENAME);
    }
    add_action('admin_notices',
            function () {
                $message = sprintf(
                        esc_attr__('Our plugin requires %1$s PHP Version or higher. Your Version: %2$s. See %3$s for details.', 'wpdatatables'),
                        WDT_REQUIRED_PHP_VERSION,
                        WDT_PHP_SERVER_VERSION,
                        '<a href="https://wordpress.org/about/requirements/" target="_blank">' . esc_html__('WordPress Requirements', 'wpdatatables') . '</a>'
                );
                ?>
                <div class="notice notice-error">
                    <p>
                        <strong> <?php esc_html_e('Warning:', 'wpdatatables') ?></strong>
                        <?php
                        esc_html_e('Your site is running an insecure version of PHP that is no longer supported.', 'wpdatatables')
                        ?>
                        <br><br>
                        <?php
                        echo $message;
                        ?>
                        <br><br><strong> <?php esc_html_e('Note:', 'wpdatatables') ?></strong>
                        <?php
                        esc_html_e('The wpDataTables plugin is disabled on your site until you fix the issue.', 'wpdatatables')
                        ?>
                    </p>
                </div>
                <?php
            });
    return;
}

// Plugin functions
require_once(WDT_ROOT_PATH . 'controllers/wdt_functions.php');

// Load dependencies
require_once WDT_ROOT_PATH . 'lib/autoload.php';

function wpdatatables_load()
{
    if (is_admin()) {
        // Admin panel controller
        require_once(WDT_ROOT_PATH . 'controllers/wdt_admin.php');
        // Admin panel AJAX actions
        require_once(WDT_ROOT_PATH . 'controllers/wdt_admin_ajax_actions.php');

    }
    require_once(WDT_ROOT_PATH . 'source/class.wdttools.php');
    require_once(WDT_ROOT_PATH . 'source/class.wdtconfigcontroller.php');
    require_once(WDT_ROOT_PATH . 'source/class.wdtsettingscontroller.php');
    require_once(WDT_ROOT_PATH . 'source/class.wdtexception.php');
    require_once(WDT_ROOT_PATH . 'source/class.sql.php');
    require_once(WDT_ROOT_PATH . 'source/class.wpdatatable.php');
    require_once(WDT_ROOT_PATH . 'source/class.wpdatacolumn.php');
    require_once(WDT_ROOT_PATH . 'source/class.wpdatatablerows.php');
    require_once(WDT_ROOT_PATH . 'source/class.wpdatatablecache.php');
    require_once(WDT_ROOT_PATH . 'source/class.wdtnestedjson.php');
    require_once(WDT_ROOT_PATH . 'source/class.wpdatachart.php');
    require_once(WDT_ROOT_PATH . 'source/class.wdtbrowsetable.php');
    require_once(WDT_ROOT_PATH . 'source/class.wdtbrowsechartstable.php');
    require_once(WDT_ROOT_PATH . 'source/class.feedback.php');
    require_once(WDT_ROOT_PATH . 'source/class.permissions.admin.php');
    require_once(WDT_ROOT_PATH . 'source/class.permissions.enforcer.php');
    require_once(WDT_ROOT_PATH . 'integrations/page_builders/gutenberg/WDTGutenbergBlocks.php');
    require_once(WDT_ROOT_PATH . 'integrations/page_builders/elementor/class.wdtelementorblock.php');
    require_once(WDT_ROOT_PATH . 'integrations/page_builders/divi-wpdt/divi-wpdt.php');
    require_once(WDT_ROOT_PATH . 'integrations/page_builders/avada/class.wdtavadaelements.php');
    require_once(WDT_ROOT_PATH . 'integrations/page_builders/wpbakery/wdtBakeryBlock.php');
    require_once(WDT_ROOT_PATH . 'source/class.wpdatatablestemplates.php');
    require_once(WDT_ROOT_PATH . 'integrations/ivyforms/ivyforms-integration.php');

    add_action('plugins_loaded', 'wdtLoadTextdomain');
    if (is_admin()) {

        if (WDT_CURRENT_VERSION !== get_option('wdtVersion')) {
            if (!function_exists('is_plugin_active_for_network')) {
                include_once(ABSPATH . 'wp-admin/includes/plugin.php');
            }

            wdtActivation(is_plugin_active_for_network(__FILE__));
            update_option('wdtVersion', WDT_CURRENT_VERSION);
        }
    }

}


/********
 * Hooks *
 ********/
register_activation_hook(__FILE__, 'wdtActivation');
register_deactivation_hook(__FILE__, 'wdtDeactivation');
register_uninstall_hook(__FILE__, 'wdtUninstall');

add_shortcode('wpdatatable', 'wdtWpDataTableShortcodeHandler');
add_shortcode('wpdatachart', 'wdtWpDataChartShortcodeHandler');
add_shortcode('wpdatatable_cell', 'wdtWpDataTableCellShortcodeHandler');

wpdatatables_load();
?>
