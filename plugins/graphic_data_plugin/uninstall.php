<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * @package    Graphic_Data_Plugin
 * @link       https://www.noaa.gov
 * @since      1.0.0
 */

// If uninstall not called from WordPress, then exit.
if (!defined('WP_UNINSTALL_PLUGIN')) {
	exit;
}

// Simple cleanup of options.
if (function_exists('delete_option')) {
	delete_option('graphic_data_settings');
}

// Find and delete custom post types.
if (function_exists('get_posts') && function_exists('wp_delete_post')) {
	// Use get_posts with 'fields' => 'ids' for performance and simplicity.
	$graphic_data_posts = get_posts(
		array(
			'post_type' => array('figure', 'about', 'modal', 'scene', 'instance'),
			'numberposts' => -1,
			'post_status' => 'any',
			'fields' => 'ids',
		)
	);

	if (!empty($graphic_data_posts)) {
		foreach ($graphic_data_posts as $graphic_data_post_id) {
			wp_delete_post($graphic_data_post_id, true);
		}
	}
}
