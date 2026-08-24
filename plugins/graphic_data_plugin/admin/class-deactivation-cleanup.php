<?php
/**
 * Handles the optional deletion of all Graphic Data plugin data on uninstall.
 *
 * @package Graphic_Data_Plugin
 */

/**
 * Asks, on deactivation, whether all Graphic Data plugin data should be
 * permanently deleted if the plugin is later deleted, and performs that wipe
 * from uninstall.php if the answer was yes.
 *
 * The question is asked on the Plugins screen, before the deactivate link is
 * followed, because a deactivated plugin's PHP is no longer loaded on
 * subsequent requests — including the request where the "Delete" link is
 * clicked, since WordPress only shows that link once a plugin is inactive.
 * That means this plugin cannot interactively ask anything at the actual
 * moment of deletion, so deactivation is used as a stand-in: the answer is
 * stored in the graphic_data_delete_on_uninstall option and read back by
 * uninstall.php when the plugin is eventually removed. Answering the
 * question again on a later deactivation overwrites the stored answer.
 *
 * @see Graphic_Data_Plugin::define_admin_hooks()
 * @see uninstall.php
 */
class Graphic_Data_Deactivation_Cleanup {

	/**
	 * Nonce action used to authorize the preference-saving AJAX request.
	 */
	const NONCE_ACTION = 'graphic_data_set_uninstall_preference';

	/**
	 * Option storing whether uninstall.php should wipe all plugin data.
	 * Absent (falsy) by default, so deleting the plugin leaves its data in
	 * place unless the admin opted in on a prior deactivation.
	 */
	const PREFERENCE_OPTION = 'graphic_data_delete_on_uninstall';

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
				'ajaxUrl'    => admin_url( 'admin-ajax.php' ),
				'nonce'      => wp_create_nonce( self::NONCE_ACTION ),
				'pluginFile' => plugin_basename( GRAPHIC_DATA_PLUGIN_DIR . 'graphic_data_plugin.php' ),
				/* translators: asked when deactivating the plugin, to decide the data-wipe behavior of a later deletion. */
				'confirmText' => 'The Graphic Data plugin is being deactivated. If this plugin is deleted later, should all of its data and images be permanently deleted too? Choose OK to delete the data on a future deletion, or Cancel to keep it.',
				/* translators: shown if saving that preference fails; deactivation still proceeds either way. */
				'errorText'   => 'Something went wrong while saving your Graphic Data deletion preference. The plugin has still been deactivated, and its data will be kept if it is deleted.',
			)
		);
	}

	/**
	 * AJAX handler that stores whether the plugin's data should be wiped the
	 * next time it is deleted.
	 *
	 * Runs while the plugin is still active (triggered before the deactivate
	 * link is followed), so it must be safe to call independently of
	 * deactivation actually completing afterward.
	 *
	 * @return void
	 */
	public function ajax_set_uninstall_preference() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );

		if ( ! current_user_can( 'activate_plugins' ) ) {
			wp_send_json_error( 'Insufficient permissions.', 403 );
		}

		$delete_on_uninstall = ! empty( $_POST['delete_on_uninstall'] );
		update_option( self::PREFERENCE_OPTION, $delete_on_uninstall );

		wp_send_json_success();
	}

	/**
	 * Delete all data and images associated with the plugin.
	 *
	 * Called from uninstall.php once it has confirmed the admin opted in via
	 * the PREFERENCE_OPTION; performs no capability or nonce checks of its
	 * own.
	 *
	 * @return void
	 */
	public function delete_all_data() {
		$this->delete_data_directory();
		$this->delete_custom_post_type_posts();
		$this->delete_instance_type_taxonomy();
		delete_option( 'graphic_data_settings' );
		$this->delete_instance_associated_images();
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
