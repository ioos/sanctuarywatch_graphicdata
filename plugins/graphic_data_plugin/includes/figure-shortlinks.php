<?php

/**
 * Force figure shortlinks to the beginning of WordPress rewrite rules.
 *
 * This prevents the generic:
 *
 * ([^/]+)/([^/]+)/?$
 *
 * rule from capturing:
 *
 * /f/127/
 *
 * before the figure shortlink rule can process it.
 *
 * @param array $rules Existing WordPress rewrite rules.
 *
 * @return array
 */
function graphic_data_add_figure_shortlink_rewrite( $rules ) {

	$figure_rules = array(
		'^f/([0-9]+)/?$' =>
			'index.php?graphic_data_figure_id=$matches[1]',
	);

	return $figure_rules + $rules;

    error_log(
		'FIGURE SHORTLINK: First rewrite rule after filter = ' .
		array_key_first( $rules )
	);

	return $rules;
}
add_filter(
	'rewrite_rules_array',
	'graphic_data_add_figure_shortlink_rewrite',
    9999
);


/**
 * Register the custom figure shortlink query variable.
 *
 * @param array $vars Existing WordPress query variables.
 *
 * @return array
 */
function graphic_data_add_figure_query_var( $vars ) {

	error_log( 'FIGURE SHORTLINK: Registering graphic_data_figure_id query var.' );

	$vars[] = 'graphic_data_figure_id';

	return $vars;
}
add_filter(
	'query_vars',
	'graphic_data_add_figure_query_var'
);


/**
 * Redirect a figure shortlink to its actual location.
 *
 * @return void
 */
function graphic_data_redirect_figure_shortlink() {

    global $wp;

	error_log(
		'FIGURE SHORTLINK DEBUG request = ' .
		print_r( $wp->request, true )
	);

	error_log(
		'FIGURE SHORTLINK DEBUG matched_rule = ' .
		print_r( $wp->matched_rule, true )
	);

	$raw_figure_id = get_query_var(
		'graphic_data_figure_id'
	);

	error_log(
		'FIGURE SHORTLINK DEBUG figure ID = ' .
		print_r( $raw_figure_id, true )
	);

	error_log( 'FIGURE SHORTLINK: Redirect function fired.' );

	/*
	 * ---------------------------------------------------------
	 * FIGURE
	 * ---------------------------------------------------------
	 */

	$raw_figure_id = get_query_var(
		'graphic_data_figure_id'
	);

	error_log(
		'FIGURE SHORTLINK: Raw figure ID = ' .
		print_r( $raw_figure_id, true )
	);

	$figure_id = absint(
		$raw_figure_id
	);

	error_log(
		'FIGURE SHORTLINK: Sanitized figure ID = ' .
		$figure_id
	);

	if ( ! $figure_id ) {
		error_log(
			'FIGURE SHORTLINK STOPPED: No valid figure ID found.'
		);
		return;
	}

	$figure_post_type = get_post_type(
		$figure_id
	);

	error_log(
		'FIGURE SHORTLINK: Figure post type = ' .
		print_r( $figure_post_type, true )
	);

	if ( 'figure' !== $figure_post_type ) {
		error_log(
			'FIGURE SHORTLINK STOPPED: Post is not a figure CPT.'
		);
		return;
	}

	$figure_modal_number = absint(
		get_post_meta(
			$figure_id,
			'figure_modal',
			true
		)
	);

	$figure_tab = absint(
		get_post_meta(
			$figure_id,
			'figure_tab',
			true
		)
	);

	error_log(
		'FIGURE SHORTLINK: figure_modal = ' .
		$figure_modal_number
	);

	error_log(
		'FIGURE SHORTLINK: figure_tab = ' .
		$figure_tab
	);

	if (
		! $figure_modal_number ||
		! $figure_tab
	) {
		error_log(
			'FIGURE SHORTLINK STOPPED: Missing figure_modal or figure_tab.'
		);
		return;
	}


	/*
	 * ---------------------------------------------------------
	 * MODAL
	 * ---------------------------------------------------------
	 */

	$modal_id = $figure_modal_number;

	error_log(
		'FIGURE SHORTLINK: Modal ID = ' .
		$modal_id
	);

	$modal_post_type = get_post_type(
		$modal_id
	);

	error_log(
		'FIGURE SHORTLINK: Modal post type = ' .
		print_r( $modal_post_type, true )
	);

	if ( 'modal' !== $modal_post_type ) {
		error_log(
			'FIGURE SHORTLINK STOPPED: Related post is not a modal CPT.'
		);
		return;
	}

	$modal_title = get_the_title(
		$modal_id
	);

	error_log(
		'FIGURE SHORTLINK: Raw modal title = ' .
		$modal_title
	);

	$modal_title = wp_specialchars_decode(
		$modal_title,
		ENT_QUOTES
	);

	error_log(
		'FIGURE SHORTLINK: Decoded modal title = ' .
		$modal_title
	);

	$modal_slug = sanitize_title(
		$modal_title
	);

	error_log(
		'FIGURE SHORTLINK: Modal slug = ' .
		$modal_slug
	);

	$modal_scene_number = absint(
		get_post_meta(
			$modal_id,
			'modal_scene',
			true
		)
	);

	error_log(
		'FIGURE SHORTLINK: modal_scene = ' .
		$modal_scene_number
	);

	if (
		empty( $modal_slug ) ||
		! $modal_scene_number
	) {
		error_log(
			'FIGURE SHORTLINK STOPPED: Missing modal slug or modal_scene.'
		);
		return;
	}


	/*
	 * ---------------------------------------------------------
	 * SCENE
	 * ---------------------------------------------------------
	 */

	$scene_id = $modal_scene_number;

	error_log(
		'FIGURE SHORTLINK: Scene ID = ' .
		$scene_id
	);

	$scene_post_type = get_post_type(
		$scene_id
	);

	error_log(
		'FIGURE SHORTLINK: Scene post type = ' .
		print_r( $scene_post_type, true )
	);

	if ( 'scene' !== $scene_post_type ) {
		error_log(
			'FIGURE SHORTLINK STOPPED: Related post is not a scene CPT.'
		);
		return;
	}

	$scene_slug = get_post_field(
		'post_name',
		$scene_id
	);

	error_log(
		'FIGURE SHORTLINK: Scene slug = ' .
		print_r( $scene_slug, true )
	);

	$scene_instance_number = absint(
		get_post_meta(
			$scene_id,
			'scene_location',
			true
		)
	);

	error_log(
		'FIGURE SHORTLINK: scene_location = ' .
		$scene_instance_number
	);

	if (
		empty( $scene_slug ) ||
		! $scene_instance_number
	) {
		error_log(
			'FIGURE SHORTLINK STOPPED: Missing scene slug or scene_location.'
		);
		return;
	}


	/*
	 * ---------------------------------------------------------
	 * INSTANCE
	 * ---------------------------------------------------------
	 */

	$instance_id = $scene_instance_number;

	error_log(
		'FIGURE SHORTLINK: Instance ID = ' .
		$instance_id
	);

	$instance_post_type = get_post_type(
		$instance_id
	);

	error_log(
		'FIGURE SHORTLINK: Instance post type = ' .
		print_r( $instance_post_type, true )
	);

	if ( 'instance' !== $instance_post_type ) {
		error_log(
			'FIGURE SHORTLINK STOPPED: Related post is not an instance CPT.'
		);
		return;
	}

	$instance_slug = get_post_meta(
		$instance_id,
		'instance_slug',
		true
	);

	error_log(
		'FIGURE SHORTLINK: instance_slug = ' .
		print_r( $instance_slug, true )
	);

	if ( empty( $instance_slug ) ) {
		error_log(
			'FIGURE SHORTLINK STOPPED: instance_slug is empty.'
		);
		return;
	}


	/*
	 * ---------------------------------------------------------
	 * CONSTRUCT URL
	 * ---------------------------------------------------------
	 */

	$base_url = home_url(
		'/' .
		trim( $instance_slug, '/' ) .
		'/' .
		trim( $scene_slug, '/' ) .
		'/'
	);

	error_log(
		'FIGURE SHORTLINK: Base URL = ' .
		$base_url
	);

	$constructed_figure_url =
		$base_url .
		'#' .
		$modal_slug .
		'/' .
		$figure_tab .
		'?figure=' .
		$figure_id;

	error_log(
		'FIGURE SHORTLINK: Constructed URL = ' .
		$constructed_figure_url
	);


	/*
	 * ---------------------------------------------------------
	 * REDIRECT
	 * ---------------------------------------------------------
	 */

	error_log(
		'FIGURE SHORTLINK: Redirecting now.'
	);

	wp_redirect(
		$constructed_figure_url,
		302
	);

	exit;
}
add_action(
	'template_redirect',
	'graphic_data_redirect_figure_shortlink'
);