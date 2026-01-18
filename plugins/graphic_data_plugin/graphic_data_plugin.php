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
 * Plugin URI:        hhttps://github.com/ioos/sanctuarywatch_graphicdata
 * Description:       This plugin customizes a Wordpress installation for the requirements of the Graphic Data framework.
 * Version:           1.2.0
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

// Include the GitHub Updater class.
require_once plugin_dir_path( __FILE__ ) . 'admin/class-github-updater.php';

// Initialize the GitHub Updater.
	new Graphic_Data_GitHub_Updater(
		__FILE__,
		'ioos', // the GitHub username.
		'sanctuarywatch_graphicdata', // the repository name.
		false, // This is a plugin, not a theme.
		'plugins/graphic_data_plugin' // Subdirectory path in the repository.
	);

	/**
	 * The core plugin class that is used to define
	 * admin-specific hooks, and public-facing site hooks.
	 */
	require plugin_dir_path( __FILE__ ) . 'includes/admin.php';

	/**
	 * The data directory inside of wp-content
	 */
	define( 'GRAPHIC_DATA_DATA_DIR', WP_CONTENT_DIR . '/data' );
	define( 'GRAPHIC_DATA_DATA_URL', content_url( 'data' ) );

	register_activation_hook( __FILE__, 'myplugin_activate' );
	function myplugin_activate() {
		myplugin_ensure_public_data_dir();
	}

	add_action( 'admin_init', 'myplugin_ensure_public_data_dir' ); // fallback after migrations.
	function myplugin_ensure_public_data_dir() {
		// Create dir if missing.
		if ( ! is_dir( GRAPHIC_DATA_DATA_DIR ) ) {
			if ( ! wp_mkdir_p( GRAPHIC_DATA_DATA_DIR ) ) {
				update_option( 'myplugin_data_dir_error', 'Could not create ' . GRAPHIC_DATA_DATA_DIR . '. Check permissions.' );
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

		delete_option( 'myplugin_data_dir_error' );
	}

	add_action(
		'admin_notices',
		function () {
			if ( $msg = get_option( 'myplugin_data_dir_error' ) ) {
				echo '<div class=\"notice notice-error\"><p>' . esc_html( $msg ) . '</p></div>';
			}
		}
	);


	/**
	 * Run the cleanup after WP moves the file into the uploads dir.
	 * This catches standard media modal uploads (what Exopite uses).
	 */
	add_filter( 'wp_handle_upload', 'my_svg_cleanup_on_upload', 10, 2 );
	function my_svg_cleanup_on_upload( array $upload, string $context ) {
		if ( ! isset( $upload['type'], $upload['file'] ) ) {
			return $upload;
		}

		// Only touch SVGs.
		if ( $upload['type'] !== 'image/svg+xml' && ! preg_match( '/\.svg$/i', $upload['file'] ) ) {
			return $upload;
		}

		$path = $upload['file'];
		$svg  = @file_get_contents( $path );
		if ( $svg === false ) {
			return $upload; // couldn't read; bail without breaking the upload
		}

		// Only process if it looks like an Inkscape SVG.
		if ( strpos( $svg, 'inkscape:' ) === false ) {
			return $upload; // no inkscape tags → leave untouched
		}

		$clean = my_transform_svg_inkscape( $svg );

		// Write back in-place
		// You may also want to preserve permissions; WP handles that normally.
		@file_put_contents( $path, $clean );

		return $upload;
	}

	/**
	 * Your transformation rules:
	 * - Remove only the inkscape:groupmode="layer" attribute (keep the rest of the tag).
	 * - If a start tag has id + inkscape:label:
	 *     * If equal → keep id, drop label.
	 *     * If different → set id to label value, drop label.
	 * - Drop any remaining inkscape:label attributes.
	 * - (Optional) Drop xmlns:inkscape if you’ve removed all inkscape:* attributes.
	 */
	function my_transform_svg_inkscape( string $svg ): string {
		// Safety: work only on the text; do not touch binary (SVGs are text).
		// 1) Remove the specific layer marker, but NOT the whole tag.
		// $svg = preg_replace('/\s+inkscape:groupmode="layer"(?=\s|>)/', '', $svg);

		// 2a) If label then id → set id to label, drop label (keeps other attrs)
		// <g inkscape:label="v2" id="v1" ...> → <g id="v2" ...>
		// $svg = preg_replace('/inkscape:label="([^"]+)"\s+id="([^"]+)"/', 'id="$1"', $svg);

		// <g inkscape:label="v2" id="v1" ...> → <g inkscape:label="v2" id="v2" ...>
		// $svg = preg_replace('/inkscape:label="([^"]+)"\s+id="([^"]+)"/', 'inkscape:label="$1" id="$1"', $svg);

		// 2b) If id then label → same
		// <g id="v1" inkscape:label="v2" ...> → <g id="v2" ...>
		$svg = preg_replace( '/id="([^"]+)"\s+inkscape:label="([^"]+)"/', 'id="$2" inkscape:label="$2"', $svg );

		// 2c) If there’s a leftover inkscape:label (without a paired id in that same tag), drop it.
		// (Matches only the attribute; keeps spacing/tag intact.)
		// $svg = preg_replace('/\s+inkscape:label="[^"]*"(?=\s|>)/', '', $svg);

		// (Optional) If you want to drop the namespace decl too:
		// Only do this if you’re confident there are no remaining inkscape:* attrs.
		// if (strpos($svg, 'inkscape:') === false) {
		// $svg = preg_replace('/\s+xmlns:inkscape="[^"]*"/', '', $svg);
		// }

		return $svg;
	}


	/**
	 * Begins execution of the plugin.
	 *
	 * Since everything within the plugin is registered via hooks,
	 * then kicking off the plugin from this point in the file does
	 * not affect the page life cycle.
	 */
	function run_graphic_data_plugin() {

		$plugin = new Graphic_Data_Plugin();
		$plugin->run();
	}
	run_graphic_data_plugin();
