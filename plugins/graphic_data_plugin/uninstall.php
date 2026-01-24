<?php
/**
 * Fired when the plugin is uninstalled.
 *
 * When populating this file, consider the following flow
 * of control:
 *
 * - This method should be static
 * - Check if the $_REQUEST content actually is the plugin name
 * - Run an admin referrer check to make sure it goes through authentication
 * - Verify the output of $_GET makes sense
 * - Repeat with other user roles. Best directly by using the links/query string parameters.
 * - Repeat things for multisite. Once for a single site in the network, once sitewide.
 *
 * This file may be updated more in future version of the Boilerplate; however, this is the
 * general skeleton and outline for how the file should work.
 *
 * For more information, see the following discussion:
 * https://github.com/tommcfarlin/WordPress-Plugin-Boilerplate/pull/123#issuecomment-28541913
 *
 * @link       https://github.com/ioos/sanctuarywatch_graphicdata
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
