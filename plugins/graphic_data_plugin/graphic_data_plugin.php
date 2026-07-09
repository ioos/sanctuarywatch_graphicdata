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
 * Plugin URI:        https://github.com/ioos/sanctuarywatch_graphicdata
 * Description:       This plugin customizes a Wordpress installation for the requirements of the Graphic Data framework.
 * Version:           1.4.6
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
 * Determine whether the Graphic Data Theme is the active theme.
 */
define( 'GRAPHIC_DATA_IS_ACTIVE_THEME', get_template() === 'graphic_data_theme' );

/**
 * Plugin activation callback.
 *
 * Ensures the public data directory exists when the plugin is activated. Creates figure, modal, and
 * scene publishing capabilities for the Author role.
 *
 * @see graphic_data_ensure_public_data_dir()
 */
function graphic_data_activate() {
	graphic_data_ensure_public_data_dir();

	$author_role = get_role( 'author' );
	$author_role->add_cap( 'edit_figures' );
	$author_role->add_cap( 'edit_published_figures' );
	$author_role->add_cap( 'publish_figures' );
	$author_role->add_cap( 'delete_figures' );
	$author_role->add_cap( 'delete_published_figures' );

	$author_role->add_cap( 'edit_modals' );
	$author_role->add_cap( 'edit_published_modals' );
	$author_role->add_cap( 'publish_modals' );
	$author_role->add_cap( 'delete_modals' );
	$author_role->add_cap( 'delete_published_modals' );

	$author_role->add_cap( 'edit_scenes' );
	$author_role->add_cap( 'edit_published_scenes' );
	$author_role->add_cap( 'publish_scenes' );
	$author_role->add_cap( 'delete_scenes' );
	$author_role->add_cap( 'delete_published_scenes' );
}
register_activation_hook( __FILE__, 'graphic_data_activate' );

/**
 * Plugin deactivation callback.
 *
 * Removes figure, modal, and scene publishing capabilities from the Author role
 * that were granted on activation.
 *
 * @see graphic_data_activate()
 */
function graphic_data_deactivate() {
	$author_role = get_role( 'author' );
	$author_role->remove_cap( 'edit_figures' );
	$author_role->remove_cap( 'edit_published_figures' );
	$author_role->remove_cap( 'publish_figures' );
	$author_role->remove_cap( 'delete_figures' );
	$author_role->remove_cap( 'delete_published_figures' );

	$author_role->remove_cap( 'edit_modals' );
	$author_role->remove_cap( 'edit_published_modals' );
	$author_role->remove_cap( 'publish_modals' );
	$author_role->remove_cap( 'delete_modals' );
	$author_role->remove_cap( 'delete_published_modals' );

	$author_role->remove_cap( 'edit_scenes' );
	$author_role->remove_cap( 'edit_published_scenes' );
	$author_role->remove_cap( 'publish_scenes' );
	$author_role->remove_cap( 'delete_scenes' );
	$author_role->remove_cap( 'delete_published_scenes' );
}
register_deactivation_hook( __FILE__, 'graphic_data_deactivate' );

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

	// Copy README file into data directory if it does not already exist.
	$readme_source      = GRAPHIC_DATA_PLUGIN_DIR . 'example_files/readme_about_data.md';
	$readme_destination = GRAPHIC_DATA_DATA_DIR . '/readme_about_data.md';

	if ( file_exists( $readme_source ) && ! file_exists( $readme_destination ) ) {
		if ( ! copy( $readme_source, $readme_destination ) ) {
			update_option( 'graphic_data_data_dir_error', 'Could not copy readme_about_data.md into ' . GRAPHIC_DATA_DATA_DIR . '.' );
			return;
		}

		@chmod( $readme_destination, 0644 );
	}

	delete_option( 'graphic_data_data_dir_error' );
}

/**
 * Register the blocks in the plugin.
 *
 * Ensures the public data directory exists when the plugin is activated.
 *
 * @see graphic_data_ensure_public_data_dir()
 */
function graphic_data_register_blocks() {
	register_block_type( __DIR__ . '/blocks/copyright-date-block/build' );
	register_block_type( __DIR__ . '/blocks/insert-figure/build' );
}

add_action( 'init', 'graphic_data_register_blocks' );

add_action(
	'enqueue_block_editor_assets',
	function () {
		wp_enqueue_editor();
	}
);

/**
 * Register the figure fields for posts.
 *
 * Ensures the public data directory exists when the plugin is activated.
 *
 * @see graphic_data_ensure_public_data_dir()
 */
function graphic_data_register_figure_block_meta() {

	$post_types = array( 'post', 'page' );

	$fields = array(
		'figure_published',
		'figure_path',
		'figure_title',
		'figure_science_link_text',
		'figure_science_link_url',
		'figure_data_link_text',
		'figure_data_link_url',
		'figure_external_url',
		'figure_external_alt',
		'figure_code',
		'figure_upload_file',
		'figure_interactive_arguments',
		'figure_caption_short',
		'figure_caption_long',
	);

	foreach ( $post_types as $post_type ) {
		foreach ( $fields as $field ) {
			register_post_meta(
				$post_type,
				$field,
				array(
					'show_in_rest'      => true,
					'single'            => true,
					'type'              => 'string',
					'sanitize_callback' => 'wp_kses_post',
					'auth_callback'     => function () {
						return current_user_can( 'edit_posts' );
					},
				)
			);
		}
	}
}

add_action( 'init', 'graphic_data_register_figure_block_meta' );

add_action( 'rest_api_init', 'graphic_data_register_figure_block_routes' );

/**
 * Registers REST API routes for the figure block.
 *
 * Registers a route at `graphic-data/v1/figure/<id>` supporting:
 * - GET: retrieves figure block meta via {@see graphic_data_get_figure_block_meta()}
 * - POST/PUT/PATCH: saves figure block meta via {@see graphic_data_save_figure_block_meta()}
 *
 * Both endpoints require the current user to have `edit_post` capability for the
 * requested post ID.
 *
 * Hooked to `rest_api_init`.
 *
 * @return void
 */
function graphic_data_register_figure_block_routes() {
	register_rest_route(
		'graphic-data/v1',
		'/figure/(?P<id>\d+)',
		array(
			array(
				'methods'             => WP_REST_Server::READABLE,
				'callback'            => 'graphic_data_get_figure_block_meta',
				'permission_callback' => function ( $request ) {
					$post_id = absint( $request['id'] );
					return current_user_can( 'edit_post', $post_id );
				},
			),
			array(
				'methods'             => WP_REST_Server::EDITABLE,
				'callback'            => 'graphic_data_save_figure_block_meta',
				'permission_callback' => function ( $request ) {
					$post_id = absint( $request['id'] );
					return current_user_can( 'edit_post', $post_id );
				},
			),
		)
	);
}


/**
 * Retrieves figure block meta fields for a given post via the REST API.
 *
 * Handles GET requests to `graphic-data/v1/figure/<id>`. Returns a flat object
 * of all figure-related post meta, including fields from the `figure_science_info`
 * and `figure_data_info` Exopite fieldsets which are unpacked into top-level keys
 * for easier consumption by React.
 *
 * @param WP_REST_Request $request The REST request. Must contain a numeric `id` param
 *                                 matching a post of type `figure`.
 * @return WP_REST_Response|WP_Error Response containing figure meta on success, or a
 *                                   400 WP_Error if the post is not of type `figure`.
 */
function graphic_data_get_figure_block_meta( WP_REST_Request $request ) {
	$post_id = absint( $request['id'] );

	if ( 'figure' !== get_post_type( $post_id ) ) {
		return new WP_Error(
			'invalid_post_type',
			'This endpoint only supports figure posts.',
			array( 'status' => 400 )
		);
	}

	$science_info = get_post_meta( $post_id, 'figure_science_info', true );
	$data_info    = get_post_meta( $post_id, 'figure_data_info', true );

	if ( ! is_array( $science_info ) ) {
		$science_info = array();
	}

	if ( ! is_array( $data_info ) ) {
		$data_info = array();
	}

	return rest_ensure_response(
		array(
			'figure_published'             => get_post_meta( $post_id, 'figure_published', true ),
			'location'                     => get_post_meta( $post_id, 'location', true ),
			'figure_scene'                 => get_post_meta( $post_id, 'figure_scene', true ),
			'figure_modal'                 => get_post_meta( $post_id, 'figure_modal', true ),
			'figure_tab'                   => get_post_meta( $post_id, 'figure_tab', true ),
			'figure_order'                 => get_post_meta( $post_id, 'figure_order', true ),
			'figure_path'                  => get_post_meta( $post_id, 'figure_path', true ),
			'figure_title'                 => get_post_meta( $post_id, 'figure_title', true ),
			'figure_image'                 => get_post_meta( $post_id, 'figure_image', true ),
			'figure_external_url'          => get_post_meta( $post_id, 'figure_external_url', true ),
			'figure_external_alt'          => get_post_meta( $post_id, 'figure_external_alt', true ),
			'figure_code'                  => get_post_meta( $post_id, 'figure_code', true ),
			'figure_upload_file'           => get_post_meta( $post_id, 'figure_upload_file', true ),
			'uploaded_file'                => get_post_meta( $post_id, 'uploaded_file', true ),
			'figure_interactive_arguments' => get_post_meta( $post_id, 'figure_interactive_arguments', true ),
			'figure_caption_short'         => get_post_meta( $post_id, 'figure_caption_short', true ),
			'figure_caption_long'          => get_post_meta( $post_id, 'figure_caption_long', true ),

			// Flatten Exopite fieldsets for React.
			'figure_science_link_text'     => isset( $science_info['figure_science_link_text'] ) ? $science_info['figure_science_link_text'] : '',
			'figure_science_link_url'      => isset( $science_info['figure_science_link_url'] ) ? $science_info['figure_science_link_url'] : '',
			'figure_data_link_text'        => isset( $data_info['figure_data_link_text'] ) ? $data_info['figure_data_link_text'] : '',
			'figure_data_link_url'         => isset( $data_info['figure_data_link_url'] ) ? $data_info['figure_data_link_url'] : '',
		)
	);
}

/**
 * Saves figure block meta fields for a given post via the REST API.
 *
 * Handles POST/PUT/PATCH requests to `graphic-data/v1/figure/<id>`. Reads a flat
 * JSON body from the request, sanitizes each field, and persists them as post meta.
 * The `figure_science_link_*` and `figure_data_link_*` fields are re-wrapped into
 * Exopite-compatible associative arrays before saving.
 *
 * On success, delegates to {@see graphic_data_get_figure_block_meta()} to return
 * the full, updated meta object.
 *
 * @param WP_REST_Request $request The REST request. Must contain a numeric `id` param
 *                                 matching a post of type `figure`, and a JSON body
 *                                 with any combination of the supported figure meta keys.
 * @return WP_REST_Response|WP_Error Updated figure meta response on success, or a
 *                                   400 WP_Error if the post is not of type `figure`.
 */
function graphic_data_save_figure_block_meta( WP_REST_Request $request ) {
	$post_id = absint( $request['id'] );

	if ( 'figure' !== get_post_type( $post_id ) ) {
		return new WP_Error(
			'invalid_post_type',
			'This endpoint only supports figure posts.',
			array( 'status' => 400 )
		);
	}

	$params = $request->get_json_params();

	update_post_meta( $post_id, 'figure_published', sanitize_text_field( $params['figure_published'] ?? 'draft' ) );
	update_post_meta( $post_id, 'location', sanitize_text_field( $params['location'] ?? '' ) );
	update_post_meta( $post_id, 'figure_scene', sanitize_text_field( $params['figure_scene'] ?? '' ) );
	update_post_meta( $post_id, 'figure_modal', sanitize_text_field( $params['figure_modal'] ?? '' ) );
	update_post_meta( $post_id, 'figure_tab', sanitize_text_field( $params['figure_tab'] ?? '' ) );
	update_post_meta( $post_id, 'figure_order', absint( $params['figure_order'] ?? 1 ) );

	update_post_meta( $post_id, 'figure_path', sanitize_text_field( $params['figure_path'] ?? 'Internal' ) );
	update_post_meta( $post_id, 'figure_title', sanitize_text_field( $params['figure_title'] ?? '' ) );
	update_post_meta( $post_id, 'figure_image', esc_url_raw( $params['figure_image'] ?? '' ) );
	update_post_meta( $post_id, 'figure_external_url', esc_url_raw( $params['figure_external_url'] ?? '' ) );
	update_post_meta( $post_id, 'figure_external_alt', sanitize_text_field( $params['figure_external_alt'] ?? '' ) );
	update_post_meta( $post_id, 'figure_code', wp_kses_post( $params['figure_code'] ?? '' ) );
	update_post_meta( $post_id, 'figure_upload_file', sanitize_text_field( $params['figure_upload_file'] ?? '' ) );
	update_post_meta( $post_id, 'figure_interactive_arguments', wp_kses_post( $params['figure_interactive_arguments'] ?? '' ) );
	update_post_meta( $post_id, 'figure_caption_short', wp_kses_post( $params['figure_caption_short'] ?? '' ) );
	update_post_meta( $post_id, 'figure_caption_long', wp_kses_post( $params['figure_caption_long'] ?? '' ) );

	// Save fieldsets in Exopite-compatible associative array shape.
	update_post_meta(
		$post_id,
		'figure_science_info',
		array(
			'figure_science_link_text' => sanitize_text_field( $params['figure_science_link_text'] ?? '' ),
			'figure_science_link_url'  => esc_url_raw( $params['figure_science_link_url'] ?? '' ),
		)
	);

	update_post_meta(
		$post_id,
		'figure_data_info',
		array(
			'figure_data_link_text' => sanitize_text_field( $params['figure_data_link_text'] ?? '' ),
			'figure_data_link_url'  => esc_url_raw( $params['figure_data_link_url'] ?? '' ),
		)
	);

	return graphic_data_get_figure_block_meta( $request );
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
