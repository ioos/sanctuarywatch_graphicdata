<?php
/**
 * Stable modal links that open the modal in its parent scene.
 *
 * @package Graphic_Data_Plugin
 */

if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

add_filter( 'rewrite_rules_array', 'graphic_data_add_modal_shortlink_rewrite', 9999 );

/** Keep modal shortlinks ahead of generic instance/scene rules. */
function graphic_data_add_modal_shortlink_rewrite( $rules ) {
	return array( '^m/([0-9]+)/?$' => 'index.php?graphic_data_modal_id=$matches[1]' ) + $rules;
}

add_filter( 'query_vars', 'graphic_data_add_modal_query_var' );

/** Register the modal shortlink query variable. */
function graphic_data_add_modal_query_var( $vars ) {
	$vars[] = 'graphic_data_modal_id';
	return $vars;
}

add_action( 'parse_request', 'graphic_data_parse_modal_shortlink' );

/** Support existing installations before their next rewrite-rule refresh. */
function graphic_data_parse_modal_shortlink( $wp ) {
	if ( preg_match( '~^m/([0-9]+)/?$~', $wp->request, $matches ) ) {
		$wp->query_vars = array( 'graphic_data_modal_id' => $matches[1] );
	}
}

/** Resolve a publicly available modal and its parent scene. */
function graphic_data_get_modal_shortlink_destination( $modal_id ) {
	$modal = get_post( $modal_id );
	if ( ! $modal || 'modal' !== $modal->post_type || ! is_post_publicly_viewable( $modal ) || '' !== $modal->post_password ) {
		return '';
	}

	$scene = get_post( absint( get_post_meta( $modal->ID, 'modal_scene', true ) ) );
	if ( ! $scene || 'scene' !== $scene->post_type || ! is_post_publicly_viewable( $scene ) || '' !== $scene->post_password ) {
		return '';
	}

	$instance = get_post( absint( get_post_meta( $scene->ID, 'scene_location', true ) ) );
	if ( ! $instance || 'instance' !== $instance->post_type ) {
		return '';
	}
	$instance_slug = get_post_meta( $instance->ID, 'instance_slug', true );
	$modal_slug = sanitize_title( wp_specialchars_decode( get_the_title( $modal->ID ), ENT_QUOTES ) );
	if ( ! $instance_slug || ! $scene->post_name || ! $modal_slug ) {
		return '';
	}

	return home_url( '/' . trim( $instance_slug, '/' ) . '/' . $scene->post_name . '/' ) . '#' . $modal_slug;
}

add_action( 'template_redirect', 'graphic_data_redirect_modal_shortlink', 1 );

/** Redirect before WordPress attempts to canonicalize the shortlink. */
function graphic_data_redirect_modal_shortlink() {
	$raw_id = get_query_var( 'graphic_data_modal_id' );
	if ( is_admin() || '' === $raw_id || ! is_scalar( $raw_id ) ) {
		return;
	}
	$destination = graphic_data_get_modal_shortlink_destination( absint( $raw_id ) );
	if ( ! $destination ) {
		wp_die(
			esc_html__( 'This modal is unavailable or does not have a published parent scene and valid instance assignment.', 'graphic_data_plugin' ),
			esc_html__( 'Modal unavailable', 'graphic_data_plugin' ),
			array( 'response' => 404, 'back_link' => true )
		);
	}
	wp_safe_redirect( $destination, 302 );
	exit;
}

add_action( 'admin_bar_menu', 'graphic_data_admin_bar_content_shortlink', 100 );

/** Point the editor toolbar's View action at the frontend scene. */
function graphic_data_admin_bar_content_shortlink( $admin_bar ) {
	if ( ! is_admin() ) {
		return;
	}
	$post = get_post();
	if ( ! $post || ! in_array( $post->post_type, array( 'figure', 'modal' ), true ) ) {
		return;
	}
	$node = $admin_bar->get_node( 'view' );
	if ( ! $node ) {
		return;
	}
	$prefix = 'figure' === $post->post_type ? 'f' : 'm';
	$node->href = home_url( '/' . $prefix . '/' . $post->ID . '/' );
	$admin_bar->add_node( (array) $node );
}
