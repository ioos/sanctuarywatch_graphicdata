<?php
/**
 * Per-page title positioning, supplied entirely by the plugin.
 *
 * @package Graphic_Data_Plugin
 */

defined( 'ABSPATH' ) || exit;

/** Validate alignment without allowing arbitrary CSS. */
function graphic_data_sanitize_page_title_align( $value ) {
	return in_array( $value, array( 'left', 'center', 'right' ), true ) ? $value : '';
}

/** Empty means theme default; otherwise accept whole pixels from 0 to 200. */
function graphic_data_sanitize_page_title_padding( $value ) {
	if ( ! is_scalar( $value ) || '' === (string) $value || ! is_numeric( $value ) ) {
		return '';
	}
	return (string) max( 0, min( 200, (int) $value ) );
}

/** Register REST metadata so settings participate in the normal editor save. */
function graphic_data_register_page_title_meta() {
	$fields = array(
		'align'         => array( 'enum' => array( '', 'left', 'center', 'right' ) ),
		'padding_left'  => array( 'pattern' => '^(|[0-9]|[1-9][0-9]|1[0-9]{2}|200)$' ),
		'padding_right' => array( 'pattern' => '^(|[0-9]|[1-9][0-9]|1[0-9]{2}|200)$' ),
	);
	foreach ( $fields as $field => $schema ) {
		register_post_meta(
			'page',
			'_graphic_data_page_title_' . $field,
			array(
				'type'              => 'string',
				'single'            => true,
				'default'           => '',
				'show_in_rest'      => array( 'schema' => array_merge( array( 'type' => 'string' ), $schema ) ),
				'revisions_enabled' => true,
				'sanitize_callback' => 'align' === $field ? 'graphic_data_sanitize_page_title_align' : 'graphic_data_sanitize_page_title_padding',
				'auth_callback'     => function ( $allowed, $meta_key, $post_id ) {
					return current_user_can( 'edit_post', $post_id );
				},
			)
		);
	}
}
add_action( 'init', 'graphic_data_register_page_title_meta' );

/** Native WordPress components; this script does not need a build step. */
function graphic_data_enqueue_page_title_editor() {
	$screen = get_current_screen();
	if ( ! $screen || 'page' !== $screen->post_type ) {
		return;
	}
	$file = dirname( __DIR__ ) . '/admin/js/page-title-appearance.js';
	wp_enqueue_script(
		'graphic-data-page-title-appearance',
		plugins_url( '../admin/js/page-title-appearance.js', __FILE__ ),
		array( 'wp-plugins', 'wp-editor', 'wp-element', 'wp-components', 'wp-data', 'wp-i18n' ),
		(string) filemtime( $file ),
		true
	);
}
add_action( 'enqueue_block_editor_assets', 'graphic_data_enqueue_page_title_editor' );

/** Build only explicitly selected overrides; empty values preserve theme CSS. */
function graphic_data_page_title_declarations( $post_id ) {
	$css   = '';
	$align = graphic_data_sanitize_page_title_align( get_post_meta( $post_id, '_graphic_data_page_title_align', true ) );
	if ( '' !== $align ) {
		$css .= 'text-align:' . $align . ' !important;';
	}
	foreach ( array( 'left', 'right' ) as $side ) {
		$padding = graphic_data_sanitize_page_title_padding( get_post_meta( $post_id, '_graphic_data_page_title_padding_' . $side, true ) );
		if ( '' !== $padding ) {
			$css .= 'padding-' . $side . ':' . $padding . 'px !important;';
		}
	}
	return $css;
}

/** Target only the main Page title, never navigation, scenes, or modal titles. */
function graphic_data_enqueue_page_title_style() {
	if ( ! is_page() ) {
		return;
	}
	$post_id = get_queried_object_id();
	$css     = graphic_data_page_title_declarations( $post_id );
	if ( '' === $css ) {
		return;
	}
	$selector = 'body.page-id-' . (int) $post_id . ' .graphic-data-page-header > .graphic-data-page-title';
	wp_register_style( 'graphic-data-page-title-appearance', false, array(), GRAPHIC_DATA_PLUGIN_VERSION );
	wp_enqueue_style( 'graphic-data-page-title-appearance' );
	wp_add_inline_style( 'graphic-data-page-title-appearance', $selector . '{box-sizing:border-box;' . $css . '}' );
}
add_action( 'wp_enqueue_scripts', 'graphic_data_enqueue_page_title_style', 100 );
