<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * Deletes all data and images associated with the plugin, but only if the
 * site admin opted in via the deactivation-time prompt (WordPress only shows
 * the "Delete" link for an already-inactive plugin, and never loads an
 * inactive plugin's PHP, so this code cannot ask anything interactively at
 * the actual moment of deletion). By default the plugin's data is left in
 * place so it survives a reinstall.
 *
 * @see Graphic_Data_Deactivation_Cleanup::ajax_set_uninstall_preference()
 * @see Graphic_Data_Deactivation_Cleanup::delete_all_data()
 * @link       https://github.com/ioos/sanctuarywatch_graphicdata
 * @since      1.0.0
 * @package    Graphic_Data_Plugin
 */

// If uninstall not called from WordPress, then exit.
if ( ! defined( 'WP_UNINSTALL_PLUGIN' ) ) {
	exit;
}

$graphic_data_delete_on_uninstall = get_option( 'graphic_data_delete_on_uninstall' );
delete_option( 'graphic_data_delete_on_uninstall' );

if ( empty( $graphic_data_delete_on_uninstall ) ) {
	return;
}

if ( ! defined( 'GRAPHIC_DATA_DATA_DIR' ) ) {
	define( 'GRAPHIC_DATA_DATA_DIR', WP_CONTENT_DIR . '/data' );
}

require_once __DIR__ . '/admin/class-deactivation-cleanup.php';

$graphic_data_uninstall_cleanup = new Graphic_Data_Deactivation_Cleanup();
$graphic_data_uninstall_cleanup->delete_all_data();
