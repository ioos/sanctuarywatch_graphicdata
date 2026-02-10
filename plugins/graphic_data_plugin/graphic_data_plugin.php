<?php
/**
 * The plugin bootstrap file
 *
 * This file is read by WordPress to generate the plugin information in the plugin
 * admin area. This file also includes all of the dependencies used by the plugin,
 * registers the activation and deactivation functions, and defines a function
 * that starts the plugin.
 *
 * @link              https://github.com/ioos/sanctuarywatch_graphicdata
 * @package           Graphic_Data_Plugin
 *
 * @wordpress-plugin
 * Plugin Name:       Graphic Data Plugin
 * Plugin URI:        hhttps://github.com/ioos/sanctuarywatch_graphicdata
 * Description:       This plugin customizes a Wordpress installation for the requirements of the Graphic Data framework.
 * Version:           1.2.1
 * Author:            Graphic Data Team
 * Author URI:        https://www.noaa.gov
 * License:           GPL-2.0+
 * License URI:       http://www.gnu.org/licenses/gpl-2.0.txt
 * Text Domain:       graphic_data_plugin
 * Requires Plugins:  svg-support
 * Domain Path:       /languages
 */

// If this file is called directly, abort.
if ( ! defined( 'WPINC' ) ) {
	die;
}

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

// Get plugin version from header.
if ( ! defined( 'GRAPHIC_DATA_PLUGIN_VERSION' ) ) {
	$graphic_data_plugin_data = get_file_data( __FILE__, array( 'Version' => 'Version' ) );
	define( 'GRAPHIC_DATA_PLUGIN_VERSION', $graphic_data_plugin_data['Version'] );
}

/**
 * The core plugin class that is used to define
 * admin-specific hooks, and public-facing site hooks.
 */
require plugin_dir_path( __FILE__ ) . 'includes/admin.php';

/**
 * The directory path of the plugin.
 */
define( 'GRAPHIC_DATA_PLUGIN_DIR', plugin_dir_path( __FILE__ ) );

/**
 * The data directory inside of wp-content
 */
define( 'GRAPHIC_DATA_DATA_DIR', WP_CONTENT_DIR . '/data' );
define( 'GRAPHIC_DATA_DATA_URL', content_url( 'data' ) );


/**
 * Plugin activation callback.
 *
 * Ensures the public data directory exists when the plugin is activated.
 *
 * @see graphic_data_ensure_public_data_dir()
 */
function graphic_data_activate() {
	graphic_data_ensure_public_data_dir();
}
register_activation_hook( __FILE__, 'graphic_data_activate' );

add_action( 'admin_init', 'graphic_data_ensure_public_data_dir' ); // fallback after migrations.

/**
 * Ensure the public data directory exists with correct permissions.
 *
 * Creates GRAPHIC_DATA_DATA_DIR if it does not already exist, sets directory
 * permissions to 0755, and drops an index.php guard file to prevent directory
 * browsing while still allowing direct file access.
 *
 * On failure the error is persisted to the 'graphic_data_data_dir_error' option
 * so it can be surfaced via admin notices; on success that option is deleted.
 *
 * @since 1.0.0
 *
 * @return void
 */
function graphic_data_ensure_public_data_dir() {
	// Create dir if missing.
	if ( ! is_dir( GRAPHIC_DATA_DATA_DIR ) ) {
		if ( ! wp_mkdir_p( GRAPHIC_DATA_DATA_DIR ) ) {
			update_option( 'graphic_data_data_dir_error', 'Could not create ' . GRAPHIC_DATA_DATA_DIR . '. Check permissions.' );
			return;
		}
	}

	// Ensure perms (drwxr-xr-x).
	@chmod( GRAPHIC_DATA_DATA_DIR, 0755 );

	// Create index.php to block directory access (but not file access).
	$index = GRAPHIC_DATA_DATA_DIR . '/index.php';
	if ( ! file_exists( $index ) ) {
		$contents = "<?php\nhttp_response_code(403); exit; // Block directory browsing\n";
		@file_put_contents( $index, $contents );
		@chmod( $index, 0644 );
	}

	delete_option( 'graphic_data_data_dir_error' );
}

/**
 * Begins execution of the plugin.
 *
 * Since everything within the plugin is registered via hooks,
 * then kicking off the plugin from this point in the file does
 * not affect the page life cycle.
 */
function graphic_data_plugin_run() {

	$plugin = new Graphic_Data_Plugin();
	$plugin->run();
}
graphic_data_plugin_run();
