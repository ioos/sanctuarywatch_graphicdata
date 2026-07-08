<?php
/**
 * Tabulator Table integration for the Graphic Data plugin.
 *
 * Registers the Tabulator ESM vendor module and a plugin-owned wrapper
 * module under the `@graphic-data/` prefix, plus a `[graphic_data_table]`
 * shortcode that renders a mount point on the page.
 *
 * Enqueue path uses the WordPress Script Modules API — no build step,
 * no jQuery, consistent with the Phase 0–5 ES Modules migration.
 *
 * @package Graphic_Data_Plugin
 * @since   1.0
 */

namespace Graphic_Data\Table;

defined( 'ABSPATH' ) || exit;

const TABULATOR_VERSION = '6.3.1';
const WRAPPER_VERSION   = '1.0.0';

/**
 * Register script modules and stylesheet on init.
 *
 * @return void
 */
function register_assets() {
	// Vendor: Tabulator's ESM build served from jsDelivr.
	// For production you may prefer to vendor this file inside assets/js/vendor/
	// and point plugins_url() at it instead — the CDN is used here only for the demo.
	wp_register_script_module(
		'@graphic-data/tabulator-vendor',
		'https://cdn.jsdelivr.net/npm/tabulator-tables@' . TABULATOR_VERSION . '/dist/js/tabulator_esm.min.js',
		array(),
		TABULATOR_VERSION
	);

	// Plugin-owned wrapper. Static-imports the vendor module above; the
	// Script Modules API emits the corresponding import-map entry.
	wp_register_script_module(
		'@graphic-data/tabulator-table',
		plugins_url( 'assets/js/tabulator-table.js', GRAPHIC_DATA_PLUGIN_DIR ),
		array( '@graphic-data/tabulator-vendor' ),
		WRAPPER_VERSION
	);

	// Bootstrap 5 theme so the table sits cleanly next to the existing
	// navbar/card layout the theme uses.
	wp_register_style(
		'graphic-data-tabulator',
		'https://cdn.jsdelivr.net/npm/tabulator-tables@' . TABULATOR_VERSION . '/dist/css/tabulator_bootstrap5.min.css',
		array(),
		TABULATOR_VERSION
	);
}
add_action( 'init', __NAMESPACE__ . '\\register_assets' );

/**
 * Render the `[graphic_data_table]` shortcode.
 *
 * Accepted attributes:
 *   - source: URL to a JSON file. Defaults to the bundled sample dataset.
 *   - height: CSS min-height for the mount element. Default '480px'.
 *
 * @param array $atts Shortcode attributes.
 * @return string HTML mount point.
 */
function render_shortcode( $atts ) {
	$atts = shortcode_atts(
		array(
			'source' => plugins_url( 'assets/data/sample-people.json', GRAPHIC_DATA_PLUGIN_DIR ),
			'height' => '480px',
		),
		$atts,
		'graphic_data_table'
	);

	// Unique per-shortcode DOM id so multiple tables can coexist on one page.
	static $counter = 0;
	++$counter;
	$dom_id = sprintf( 'graphic-data-table-%d', $counter );

	// Register-only on init; enqueue-only when the shortcode actually renders.
	wp_enqueue_script_module( '@graphic-data/tabulator-table' );
	wp_enqueue_style( 'graphic-data-tabulator' );

	return sprintf(
		'<div id="%1$s" class="graphic-data-table" data-source="%2$s" style="min-height:%3$s"></div>',
		esc_attr( $dom_id ),
		esc_url( $atts['source'] ),
		esc_attr( $atts['height'] )
	);
}
add_shortcode( 'graphic_data_table', __NAMESPACE__ . '\\render_shortcode' );
