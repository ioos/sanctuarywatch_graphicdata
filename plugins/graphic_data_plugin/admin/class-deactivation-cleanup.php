<?php
/**
 * Handles the optional deletion of all Graphic Data plugin data on deactivation.
 *
 * @package Graphic_Data_Plugin
 */

/**
 * Prompts for and performs a full data wipe when the plugin is deactivated.
 *
 * The confirmation and the deletion both happen on the Plugins screen, before
 * the deactivate link is followed. A deactivated plugin's PHP is no longer
 * loaded on subsequent requests, so any admin_notices/admin-post flow tried
 * after deactivation would never run.
 *
 * @see Graphic_Data_Plugin::define_admin_hooks()
 */
class Graphic_Data_Deactivation_Cleanup {

	/**
	 * Nonce action used to authorize the deletion AJAX request.
	 */
	const NONCE_ACTION = 'graphic_data_delete_all_data';

	/**
	 * Enqueue the deactivation confirmation script on the Plugins screen.
	 *
	 * @param string $hook_suffix Current admin page hook.
	 * @return void
	 */
	public function enqueue_deactivation_script( $hook_suffix ) {
		if ( 'plugins.php' !== $hook_suffix ) {
			return;
		}

		wp_enqueue_script(
			'graphic-data-deactivation-cleanup',
			plugin_dir_url( __FILE__ ) . 'js/deactivation-cleanup.js',
			array(),
			GRAPHIC_DATA_PLUGIN_VERSION,
			true
		);

		wp_localize_script(
			'graphic-data-deactivation-cleanup',
			'graphicDataDeactivation',
			array(
				'ajaxUrl'     => admin_url( 'admin-ajax.php' ),
				'nonce'       => wp_create_nonce( self::NONCE_ACTION ),
				'pluginFile'  => plugin_basename( GRAPHIC_DATA_PLUGIN_DIR . 'graphic_data_plugin.php' ),
				/* translators: confirmation shown when deactivating the plugin. */
				'confirmText' => 'The Graphic Data plugin is being deactivated. Do you also want to permanently delete all data and images associated with the plugin? This cannot be undone.',
				'errorText'   => 'Something went wrong while deleting Graphic Data plugin data. The plugin has still been deactivated.',
			)
		);
	}

	/**
	 * AJAX handler that deletes all data associated with the plugin.
	 *
	 * Runs while the plugin is still active (triggered before the deactivate
	 * link is followed), so it must be safe to call independently of
	 * deactivation actually completing afterward.
	 *
	 * @return void
	 */
	public function ajax_delete_all_data() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );

		if ( ! current_user_can( 'activate_plugins' ) ) {
			wp_send_json_error( 'Insufficient permissions.', 403 );
		}

		$this->delete_data_directory();
		$this->delete_custom_post_type_posts();
		$this->delete_instance_type_taxonomy();
		delete_option( 'graphic_data_settings' );
		$this->delete_instance_associated_images();

		wp_send_json_success();
	}

	/**
	 * Recursively delete the wp-content/data directory.
	 *
	 * @return void
	 */
	private function delete_data_directory() {
		if ( ! defined( 'GRAPHIC_DATA_DATA_DIR' ) || ! is_dir( GRAPHIC_DATA_DATA_DIR ) ) {
			return;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';

		global $wp_filesystem;
		if ( empty( $wp_filesystem ) ) {
			WP_Filesystem();
		}

		if ( $wp_filesystem ) {
			$wp_filesystem->delete( GRAPHIC_DATA_DATA_DIR, true );
		}
	}

	/**
	 * Delete every post of the about, instance, scene, modal, and figure post types.
	 *
	 * @return void
	 */
	private function delete_custom_post_type_posts() {
		$post_ids = get_posts(
			array(
				'post_type'   => array( 'about', 'instance', 'scene', 'modal', 'figure' ),
				'post_status' => 'any',
				'numberposts' => -1,
				'fields'      => 'ids',
			)
		);

		foreach ( $post_ids as $post_id ) {
			wp_delete_post( $post_id, true );
		}
	}

	/**
	 * Delete every instance_type taxonomy term, along with its term meta and
	 * term relationships. Taxonomy registration itself is code-based and has
	 * nothing persisted in the database beyond its terms.
	 *
	 * @return void
	 */
	private function delete_instance_type_taxonomy() {
		$terms = get_terms(
			array(
				'taxonomy'   => 'instance_type',
				'hide_empty' => false,
			)
		);

		if ( is_wp_error( $terms ) ) {
			return;
		}

		foreach ( $terms as $term ) {
			wp_delete_term( $term->term_id, 'instance_type' );
		}
	}

	/**
	 * Delete every attachment that has a graphic_data_instance_id postmeta value.
	 *
	 * @return void
	 */
	private function delete_instance_associated_images() {
		$attachment_ids = get_posts(
			array(
				'post_type'   => 'attachment',
				'post_status' => 'any',
				'numberposts' => -1,
				'fields'      => 'ids',
				'meta_key'    => 'graphic_data_instance_id', // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			)
		);

		foreach ( $attachment_ids as $attachment_id ) {
			wp_delete_attachment( $attachment_id, true );
		}
	}
}
