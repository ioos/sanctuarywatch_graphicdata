<?php
/**
 * Theme Functionality File
 *
 * This file is part of a WordPress theme and is responsible for defining and handling the loading of all theme-specific
 * scripts, styles, and custom post types. The functions are designed to enhance the theme's capabilities, ensuring
 * proper style, script management, and custom post type functionalities. Each function is hooked to an appropriate action or filter within WordPress to ensure they execute at the right time
 * during page load or admin panel interactions. Proper use of actions and filters follows WordPress best practices,
 * aiming to extend the functionality of WordPress themes without modifying core files.
 *
 * @package Graphic_Data
 */

/**
 * Get the current theme version number from style.css
 *
 * Retrieves the version string from the theme's style.css header.
 * Used for cache-busting enqueued styles and scripts.
 *
 * @since 1.0.0
 *
 * @return string The theme version number (e.g., '1.0.0')
 */
function graphic_data_get_theme_asset_version() {
	$theme = wp_get_theme();
	return $theme->get( 'Version' );
}

// Customizer functions - first let's load the customizer class.
include_once get_template_directory() . '/customizer.php';
$graphic_data_customizer_settings = new Customizer_Settings();

// Now let's call the customizer functions.
add_action( 'customize_register', array( $graphic_data_customizer_settings, 'sanctuary_watch_customize_register' ) );
add_action( 'wp_head', array( $graphic_data_customizer_settings, 'sanctuary_watch_customizer_css' ) );
add_action( 'customize_register', array( $graphic_data_customizer_settings, 'remove_customizer_sections' ), 20 );
add_action( 'customize_controls_print_footer_scripts', array( $graphic_data_customizer_settings, 'header_row_customizer_inline_script' ) );
add_action(
	'after_setup_theme',
	function () {
		$graphic_data_customizer_settings = new Customizer_Settings();
		add_action( 'admin_init', array( $graphic_data_customizer_settings, 'validate_header_settings_on_save' ) );
	}
);

/**
 * Redirects the front page to a specific scene if single instance mode is enabled.
 *
 * This function is hooked to the 'template_redirect' action. It checks if the current
 * page is the front page and if the "Single Instance View" setting is enabled in the
 * Customizer. If both conditions are met, it calls graphic_data_single_instance_check() to determine
 * the target scene. If a valid scene post ID is returned, it performs a 301 permanent
 * redirect to that scene's permalink.
 *
 * @since 1.0.0
 *
 * @uses is_front_page() To check if the current page is the front page.
 * @uses is_admin() To prevent execution in the admin area.
 * @uses graphic_data_single_instance_check() To determine if a redirect is needed and get the target post ID.
 * @uses get_permalink() To get the URL of the target scene.
 * @uses wp_redirect() To perform the browser redirect.
 */
function graphic_data_single_instance_front_page_redirect() {
	// Only run on the front page.
	if ( ! is_front_page() || is_admin() ) {
		return;
	}

	$single_instance = graphic_data_single_instance_check();
	if ( false != $single_instance ) {
		// Get the permalink for the page.
		$redirect_url = get_permalink( $single_instance['sceneID'] );

		// Make sure the page exists and we have a valid URL.
		if ( $redirect_url && get_permalink() !== $redirect_url ) {
			// Perform the redirect.
			wp_redirect( $redirect_url, 301 ); // 301 = permanent redirect.
			exit;
		}
	}
}

// Hook the function to run early in the WordPress loading process.
add_action( 'template_redirect', 'graphic_data_single_instance_front_page_redirect' );

/**
 * Determines whether Single Instance settings should be applied to the theme and returns the target post ID.
 *
 * This function checks if the single instance mode is enabled in the customizer, verifies that exactly
 * one instance exists in the database, and returns the instance post ID and the appropriate scene post ID to display. It prioritizes
 * the overview scene if available, otherwise returns the first scene in the instance.
 *
 * @since 1.0.0
 *
 * @global wpdb $wpdb WordPress database abstraction object.
 *
 * @return array|false Returns, as an associative array, the post ID of the instance and the post ID of the target scene
 *                   if single instance mode should be applied,
 *                   false if single instance mode is disabled, multiple instances exist, or no scenes
 *                   are found in the instance.
 *
 * @example
 * ```php
 * $target_scene = graphic_data_single_instance_check();
 * if ($target_scene !== false) {
 *     // Single instance mode is active, redirect to scene
 *     wp_redirect(get_permalink($target_scene));
 * }
 * ```
 */
function graphic_data_single_instance_check() {
	$single_instance_info = false;
	// Get the customizer setting value.
	$single_instance_enable = get_theme_mod( 'single_instance_enable', '' );

	// Check if the setting is enabled (checkbox returns '1' when checked).
	if ( $single_instance_enable ) {

		global $wpdb;

		// Get the number of instances.
		$row_count = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT COUNT(*) FROM {$wpdb->prefix}postmeta WHERE meta_key = %s",
				'instance_short_title'
			)
		);

		if ( 1 == $row_count ) { // We know that there is only instance.
			// Get the post id of the instance.
			$instance_id = $wpdb->get_var(
				$wpdb->prepare(
					'SELECT `post_id` FROM `wp_postmeta` WHERE `meta_key` = %s',
					'instance_short_title'
				)
			);

			// Get the number of scenes in the instance.
			$num_scenes_in_instance = $wpdb->get_var(
				$wpdb->prepare(
					'SELECT COUNT(*) FROM `wp_postmeta` WHERE `meta_key` = %s AND `meta_value` = %s',
					'scene_location',
					$instance_id
				)
			);

			if ( $num_scenes_in_instance > 0 ) {
				$overview_scene = get_post_meta( $instance_id, 'instance_overview_scene', true );
				// Return the value if found, otherwise return false.
				if ( '' == $overview_scene ) {

					$target_scene = $wpdb->get_var(
						$wpdb->prepare(
							'SELECT post_id FROM `wp_postmeta` WHERE `meta_key` = %s AND `meta_value` = %s ORDER BY post_id ASC LIMIT 1',
							'scene_location',
							$instance_id
						)
					);
					$single_instance_info = array(
						'instanceID' => $instance_id,
						'sceneID' => $target_scene,
					);
				} else {
					$single_instance_info = array(
						'instanceID' => $instance_id,
						'sceneID' => $overview_scene,
					);
				}
			}
		}
	}
	return $single_instance_info;
}

/**
 * Enqueues the Font Awesome icon library stylesheet.
 *
 * Loads Font Awesome 6.6.0 from the cdnjs CDN to provide icon support
 * throughout the theme.
 *
 * @since 1.0.0
 *
 * @return void
 */
function graphic_data_enqueue_font_awesome() {
	wp_enqueue_style(
		'font-awesome',
		'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
		array(),
		'6.6.0',
		'all',
	);
}
add_action( 'wp_enqueue_scripts', 'graphic_data_enqueue_font_awesome' );

/**
 * Enqueues the theme's main stylesheet.
 *
 * This function utilizes `wp_enqueue_style` to register the theme's main
 * stylesheet using the current theme's stylesheet URI. Used to ensure
 * that the main stylesheet is properly added to the HTML output of the WordPress theme.
 *
 * @return void
 */
function graphic_data_enqueue_main_css() {
	wp_enqueue_style( 'style', get_stylesheet_uri(), array(), graphic_data_get_theme_asset_version() ); // ADD NEW VERSION NUMBER.
}
add_action( 'wp_enqueue_scripts', 'graphic_data_enqueue_main_css' );

/**
 * Enqueues Bootstrap's JavaScript library with dependency management.
 *
 * This function registers and enqueues the Bootstrap JavaScript library from a CDN. It specifies jQuery as a dependency,
 * meaning jQuery will be loaded before the Bootstrap JavaScript. The script is added to the footer of the HTML document
 * and is set to defer loading until after the HTML parsing has completed.
 *
 * @return void
 */
function graphic_data_enqueue_bootstrap_scripts() {
	wp_enqueue_script(
		'bootstrap-js',
		'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js',
		array( 'jquery' ),
		null,
		array( 'strategy' => 'defer' ) // Corrected the 'strategy' syntax.
	);
}
add_action( 'wp_enqueue_scripts', 'graphic_data_enqueue_bootstrap_scripts' );

/**
 * Enqueues the WordPress REST API JavaScript client.
 *
 * Loads the built-in wp-api script which provides a Backbone.js client
 * for interacting with the WordPress REST API.
 *
 * @since 1.0.0
 *
 * @return void
 */
function graphic_data_enqueue_api_script() {
	wp_enqueue_script( 'wp-api' );
}
add_action( 'wp_enqueue_scripts', 'graphic_data_enqueue_api_script' );

/**
 * Sets a default site icon if none is configured.
 *
 * Checks if a site icon (favicon) is already set. If not, attempts to use
 * the theme's default ONMS logo image located in the assets/images directory.
 * The image is uploaded to the media library if not already present, then
 * set as the site icon.
 *
 * @since 1.0.0
 *
 * @return void
 */
function graphic_data_set_theme_default_site_icon() {
	// Only set if no site icon is already configured.
	if ( ! has_site_icon() ) {
		$icon_url = get_stylesheet_directory_uri() . '/assets/images/onms-logo-no-text-800.png';
		$icon_path = get_stylesheet_directory() . '/assets/images/onms-logo-no-text-800.png';

		// Check if the file exists.
		if ( file_exists( $icon_path ) ) {
			// Upload the image to media library and set as site icon.
			$attachment_id = attachment_url_to_postid( $icon_url );

			if ( ! $attachment_id ) {
				// If not in media library, add it.
				require_once ABSPATH . 'wp-admin/includes/file.php';
				require_once ABSPATH . 'wp-admin/includes/media.php';
				require_once ABSPATH . 'wp-admin/includes/image.php';

				$attachment_id = media_sideload_image( $icon_url, 0, 'Site Icon', 'id' );
			}

			if ( ! is_wp_error( $attachment_id ) ) {
				update_option( 'site_icon', $attachment_id );
			}
		}
	}
}
add_action( 'after_setup_theme', 'graphic_data_set_theme_default_site_icon' );


// Include the GitHub Updater class if not already included by the plugin.
if ( is_plugin_active( 'graphic_data_plugin/graphic_data_plugin.php' ) ) {
	// Include the GitHub Updater class if not already included by the plugin.
	if ( ! class_exists( 'Graphic_Data_GitHub_Updater' ) ) {
		require_once get_template_directory() . '/admin/class-github-updater.php';
	}

	// Initialize the theme updater (only if not in development environment).
	new Graphic_Data_GitHub_Updater(
		get_template_directory() . '/style.css',
		'ioos', // GitHub username.
		'sanctuarywatch_graphicdata', // Repository name.
		true, // This is a theme, not a plugin.
		'themes/graphic_data_theme' // Subdirectory path in the repository.
	);
}

/**
 * Constructs a query argument array for retrieving posts with a specific meta key value.
 *
 * This function generates an array of arguments tailored for a WordPress query. It targets
 * any post type and filters posts based on a meta key `modal_icons` matching the provided
 * icon name. The function ensures that only the IDs of the matching posts are retrieved.
 *
 * @param string $icon_name The value to be matched against the `modal_icons` meta key.
 * @return array The argument array to be used with a WordPress query.
 */
function graphic_data_post_query( $icon_name ) {
	$args = array(
		'post_type' => 'any',
		'meta_query' => array(
			'relation' => 'AND', // Ensures both conditions must be met.
			array(
				'key'     => 'modal_icons',
				'value'   => $icon_name,
				'compare' => '=',
			),
			array(
				'key'     => 'modal_published',
				'value'   => 'published',
				'compare' => '=',
			),
		),
		'fields' => 'ids',
	);
	return $args;
}

/**
 * Processes a modal post and adds its data to the child IDs array.
 *
 * Helper function that retrieves metadata for a modal post (icon type, title,
 * external URL, scene link, etc.) and adds the processed data to the child_ids
 * array. Handles duplicate child IDs by appending an index suffix.
 *
 * @since 1.0.0
 *
 * @param int    $child_post_id The post ID of the modal to process.
 * @param array  $child_ids     The existing array of processed child data.
 * @param string $child_id      The SVG element ID associated with this modal.
 * @param int    $idx           Optional. Index suffix for duplicate IDs. Default 0.
 * @return array The updated child_ids array with the new modal data added.
 */
function graphic_data_modal_helper( $child_post_id, $child_ids, $child_id, $idx = 0 ) {
	// Get icon_type to check if modal.
	$icon_type = get_post_meta( $child_post_id, 'icon_function' );
	$icon_title = get_post_meta( $child_post_id, 'post_title' );
	$modal = false;
	$external_url = '';
	$external_scene_id = '';
	$is_modal = get_post_meta( $child_post_id, 'post_type' ); // [0]; error here?
	$icon_order = get_post_meta( $child_post_id, 'modal_icon_order' );
	// Create array/map from child id to different attributes (ie hyperlinks).
	if ( $is_modal ) {
		if ( 'Modal' === $icon_type[0] ) {
			$modal = true;
		} elseif ( 'External URL' === $icon_type[0] ) {
			$external_url = get_post_meta( $child_post_id, 'icon_external_url' )[0];
		} elseif ( 'Scene' === $icon_type[0] ) {
			$external_scene_id = get_post_meta( $child_post_id, 'icon_scene_out' );
			$external_url = get_permalink( $external_scene_id[0] );

		}
		$scene_id = get_post_meta( $child_post_id, 'modal_scene' );
		$scene_post = get_post( $scene_id[0] );

		$section_name = isset( get_post_meta( $child_post_id, 'icon_toc_section' )[0] ) ? get_post_meta( $child_post_id, 'icon_toc_section' )[0] : '';
		$child = $child_id;

		if ( array_key_exists( $child_id, $child_ids ) ) {
			$child = ( $child_id . $idx );
		}

		if ( count( $icon_order ) == 0 ) {
			$modal_icon_order = 1;
		} elseif ( null == $icon_order[0] ) {
			$modal_icon_order = 1;
		} else {
			$modal_icon_order = (int) $icon_order[0];
		}

		$child_ids[ $child ] = array(
			'title' => $icon_title[0],
			'modal_id' => $child_post_id,
			'external_url' => $external_url,
			'modal' => $modal,
			'scene' => $scene_post,
			'section_name' => $section_name,
			'original_name' => $child_id,
			'modal_icon_order' => $modal_icon_order,
		);
	}
	return $child_ids;
}

/**
 * Builds an array of modal data from SVG icon elements.
 *
 * Parses an SVG file to find elements within the "icons" group, then queries
 * WordPress for associated modal posts. Returns an associative array mapping
 * each icon ID to its modal metadata (title, URLs, scene links, etc.).
 *
 * @since 1.0.0
 *
 * @param string $svg_url The URL of the SVG file to be processed.
 * @return array|null Associative array of modal data keyed by icon ID,
 *                    or null if the SVG URL is empty or file cannot be processed.
 */
function graphic_data_get_modal_array( $svg_url ) {
	// From original function - just preprocessing of the svg url, etc.
	if ( $svg_url ) {
		// Find the path to the SVG file.
		$relative_path = ltrim( parse_url( $svg_url )['path'], '/' );
		$full_path = ABSPATH . $relative_path;

		// Get the contents from the SVG file.
		$svg_content = file_get_contents( $full_path );

		// If the SVG content could not be loaded, terminate with an error message.
		if ( ! $svg_content ) {
			die( 'Fail to load SVG file' );
			return null;
		}
		// Load the SVG content into a DOMDocument.
		$dom  = new DOMDocument();
		libxml_use_internal_errors( true );
		$dom->loadXML( $svg_content );
		libxml_clear_errors();

		// Create a DOMXPath object for querying the DOMDocument.
		$xpath = new DOMXPath( $dom );

		// Find the element with ID "icons".
		$icons_element = $xpath->query( '//*[@id="icons"]' )->item( 0 );

		// If the element with ID "icons" is not found, terminate with an error message.
		if ( null === $icons_element ) {
			die( 'Element with ID "icons" not found' );
			return null;
		}

		// Get the child nodes of the "icons" element. The phpcs ignore command on the next line is needed to suppress a php code sniffer error.
		// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
		$child_elements = $icons_element->childNodes;
		$child_ids = array();

		foreach ( $child_elements as $child ) {
			if ( $child instanceof DOMElement && $child->hasAttribute( 'id' ) ) {
				// Add the "id" attribute to the array. The phpcs ignore command on the next line is needed to suppress a php code sniffer error.
				// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				$child_id = $child->getAttribute( 'id' );
				// This is a WP_query object for the current child ID.
				$query = new WP_Query( graphic_data_post_query( $child_id ) ); // Here, the query produces all the modals with that ID.

				$child_post_id_list = $query->posts;
				if ( count( $child_post_id_list ) > 1 ) {
					$idx = 1;
					foreach ( $child_post_id_list as $cid ) {
						$child_ids = graphic_data_modal_helper( $cid, $child_ids, $child_id, $idx );
						$idx++;
					}
					continue;
				}
				if ( ! empty( $query->posts ) ) {
					$child_post_id = $query->posts[0]; // Should not always be 0th index; want to loop through all the posts and select the one that is found on this scene.
					$child_ids = graphic_data_modal_helper( $child_post_id, $child_ids, $child_id );
				}
			}
		}
		// Reset global $Post object.
		wp_reset_postdata();
		return $child_ids;
	}
	return null;
}

  /**
   * Check if the Graphic Data plugin is active and display an admin notice if not.
   *
   * This function verifies whether the Graphic Data plugin required by the theme
   * is currently active. If the plugin is not active, it displays a dismissible
   * warning notice in the WordPress admin panel with a link to activate the plugin.
   *
   * @since 1.0.0
   * @access public
   *
   * @uses is_plugin_active()   To check if the plugin is active
   * @uses admin_url()          To generate the URL to the plugins page
   * @uses add_action()         Hooked into 'admin_notices' action
   *
   * @return void
   */
function graphic_data_theme_check_required_plugin() {
	// Check if the is_plugin_active function is available.
	if ( ! function_exists( 'is_plugin_active' ) ) {
		include_once ABSPATH . 'wp-admin/includes/plugin.php';
	}

	// Check if the required plugin is active.
	if ( ! is_plugin_active( 'graphic_data_plugin/graphic_data_plugin.php' ) ) {
		$message = sprintf(
			'Warning: This theme requires the <strong>Graphic Data</strong> plugin to function properly. Please %1$s the plugin.',
			'<a href="' . esc_url( admin_url( 'plugins.php' ) ) . '">activate</a>'
		);
		echo '<div class="notice notice-warning is-dismissible"><p>' . wp_kses_post( $message ) . '</p></div>';
	}
}
add_action( 'admin_notices', 'graphic_data_theme_check_required_plugin' );


/**
 * Enqueue JavaScript files for the theme.
 *
 * Registers and enqueues all JavaScript files required by the theme, including:
 * - Core theme scripts (script.js, index.js)
 * - Scene, modal, and figure rendering scripts from the graphic_data_plugin
 * - Plotly interactive chart scripts (line, bar, map)
 * - Google Tag Manager tracking script
 *
 * All scripts are loaded with the 'defer' strategy and use versioning
 * from graphic_data_get_theme_asset_version() for cache busting.
 *
 * @since 1.0.0
 *
 * @see wp_enqueue_script()
 * @see graphic_data_get_theme_asset_version()
 *
 * @return void
 */
function graphic_data_enqueue_scripts() {
	// Enqueue the theme's script.js file, but don't run on the main index page or on the about page.
	if ( ! is_home() && ! is_front_page() && 'about' !== get_post_type() ) {
		wp_enqueue_script(
			'script-js',
			get_template_directory_uri() . '/assets/js/script.js',
			array(),
			graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
			array( 'strategy' => 'defer' )
		);
	}

	// Enqueue the theme's index.js file, but don't run on the about page.
	if ( 'about' !== get_post_type() ) {
		wp_enqueue_script(
			'index-js',
			get_template_directory_uri() . '/assets/js/index.js',
			array(),
			graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
			array( 'strategy' => 'defer' )
		);
	}

	// Enqueue the scene render script.
	wp_enqueue_script(
		'scene-render',
		content_url() . '/plugins/graphic_data_plugin/includes/scenes/js/scene-render.js',
		array(),
		graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
		array( 'strategy'  => 'defer' )
	);

	// Enqueue the modal render script.
	wp_enqueue_script(
		'modal-render',
		content_url() . '/plugins/graphic_data_plugin/includes/modals/js/modal-render.js',
		array(),
		graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
		array( 'strategy'  => 'defer' )
	);

	// Enqueue the figure render script.
	wp_enqueue_script(
		'figure-render',
		content_url() . '/plugins/graphic_data_plugin/includes/figures/js/figure-render.js',
		array(),
		graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
		array( 'strategy'  => 'defer' )
	);

	// Enqueue the interactive figure script.
	wp_enqueue_script(
		'figure-code',
		content_url() . '/plugins/graphic_data_plugin/includes/figures/js/code/figure-code.js',
		array(),
		graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
		array( 'strategy'  => 'defer' )
	);

	// Enqueue the plotly utility script used for interactive figures.
	wp_enqueue_script(
		'utility',
		content_url() . '/plugins/graphic_data_plugin/includes/figures/js/interactive/plotly-utility.js',
		array(),
		graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
		array( 'strategy'  => 'defer' )
	);

	// Enqueue the plotly line chart script used in interactive figures.
	wp_enqueue_script(
		'plotly-timeseries-line',
		content_url() . '/plugins/graphic_data_plugin/includes/figures/js/interactive/plotly-timeseries-line.js',
		array(),
		graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
		array( 'strategy'  => 'defer' )
	);

	// Enqueue the plotly bar chart script used in interactive figures.
	wp_enqueue_script(
		'plotly-bar',
		content_url() . '/plugins/graphic_data_plugin/includes/figures/js/interactive/plotly-bar.js',
		array(),
		graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
		array( 'strategy'  => 'defer' )
	);

	// Enqueue the plotly map script used in interactive figures.
	wp_enqueue_script(
		'plotly-map',
		content_url() . '/plugins/graphic_data_plugin/includes/figures/js/interactive/plotly-map.js',
		array(),
		graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
		array( 'strategy'  => 'defer' )
	);

	// Enqueue the google tag script used to log user behavior with tag manager.
	wp_enqueue_script(
		'googletags',
		get_template_directory_uri() . '/assets/js/googletags.js',
		array(),
		graphic_data_get_theme_asset_version(), // ADD NEW VERSION NUMBER.
		array( 'strategy' => 'defer' )
	);
}
add_action( 'wp_enqueue_scripts', 'graphic_data_enqueue_scripts' );
