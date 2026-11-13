<?php
/**
 * Authenticated edit links for frontend figures and modals.
 *
 * @package Graphic_Data_Plugin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_action( 'wp_head', 'graphic_data_figure_edit_link_config' );

/** Expose the permission lookup only on signed-in frontend pages. */
function graphic_data_figure_edit_link_config() {
	if ( ! is_user_logged_in() ) {
		return;
	}
	wp_print_inline_script_tag(
		wp_json_encode( array(
			'url'   => admin_url( 'admin-ajax.php' ),
			'nonce' => wp_create_nonce( 'graphic_data_figure_edit_link' ),
		) ),
		array( 'type' => 'application/json', 'id' => 'graphic-data-figure-edit-config' )
	);
}

add_action( 'wp_ajax_graphic_data_figure_edit_link', 'graphic_data_figure_edit_link' );
add_action( 'wp_ajax_graphic_data_modal_edit_link', 'graphic_data_modal_edit_link' );

/** Use the same access checks for modal edit links. */
function graphic_data_modal_edit_link() {
	graphic_data_send_post_edit_link( 'modal' );
}

/** Set the figure type explicitly rather than accepting AJAX hook arguments. */
function graphic_data_figure_edit_link() {
	graphic_data_send_post_edit_link( 'figure' );
}

/** Return an edit URL only when both capabilities and instance access allow it. */
function graphic_data_send_post_edit_link( $post_type ) {
	check_ajax_referer( 'graphic_data_figure_edit_link', 'nonce' );
	$post_id = isset( $_GET['post_id'] ) ? absint( $_GET['post_id'] ) : 0;
	if ( $post_type !== get_post_type( $post_id ) || ! current_user_can( 'edit_post', $post_id ) ) {
		wp_send_json_success( array( 'url' => '' ) );
	}

	$user = wp_get_current_user();
	if ( in_array( 'author', $user->roles, true ) ) {
		$instances = get_user_meta( $user->ID, 'assigned_instances', true );
		$location_key = 'modal' === $post_type ? 'modal_location' : 'location';
		$instance = absint( get_post_meta( $post_id, $location_key, true ) );
		if ( ! $instance || ! is_array( $instances ) || ! in_array( $instance, array_map( 'absint', $instances ), true ) ) {
			wp_send_json_success( array( 'url' => '' ) );
		}
	}

	wp_send_json_success( array( 'url' => get_edit_post_link( $post_id, 'raw' ) ) );
}
