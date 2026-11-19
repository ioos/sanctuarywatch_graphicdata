<?php
/**
 * Rebuild of standalone figure HTML.
 *
 * Each published Figure has two standalone HTML files in
 * wp-content/data/figure_<ID>/: figure-<ID>.html (with title, links and
 * captions; its URL is stored in figure_iframe_code) and
 * figure-<ID>_figure_only.html. The Figure edit screen writes them in the
 * browser when a Figure is saved (createFigureHtml() in
 * admin/js/figure-html.js).
 *
 * Figures created by the Content Transfer importer never pass through the
 * edit screen, so they are queued here and the Content Transfer page builds
 * their HTML in the browser with the same createFigureHtml(), from each
 * Figure's saved content (for Interactive figures, the saved Plotly JSON in
 * figure_interactive_args_rendered, as on the frontend). Administrators can
 * also rebuild every Figure, or every Figure in an Instance, for example
 * after the site moves to a new domain.
 *
 * Which Figures get HTML follows the edit screen: only Figures whose Status
 * is Published, and Interactive figures only once they have saved JSON.
 *
 * Interactive figures from a bulk import (Graphic_Data_Transfer_Tsv) have
 * settings and data but no saved JSON yet. They are marked with
 * RENDER_META_KEY, and the browser first builds their saved JSON from the
 * settings with the edit screen's chart, table and map code (see
 * save_render()), then their HTML.
 *
 * @package Graphic_Data_Plugin
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Graphic_Data_Figure_Html_Rebuild.
 *
 * @since 1.10.0
 */
class Graphic_Data_Figure_Html_Rebuild {

	/**
	 * Option listing the IDs of Figures waiting for their HTML.
	 */
	const QUEUE_OPTION = 'graphic_data_figure_html_queue';

	/**
	 * Figure types that have standalone HTML.
	 */
	const FIGURE_TYPES = array( 'Interactive', 'Internal', 'External', 'Code' );

	/**
	 * Hidden meta key marking an Interactive figure whose saved JSON
	 * (figure_interactive_args_rendered) is still to be built from its
	 * settings.
	 */
	const RENDER_META_KEY = '_graphic_data_render_pending';

	/**
	 * Add Figures to the queue. Figures that cannot have HTML are skipped.
	 *
	 * @param int[] $figure_ids Figure IDs.
	 * @return int[] The IDs that were queued.
	 */
	public static function enqueue( $figure_ids ) {
		$queued = array_values( array_filter( array_map( 'intval', $figure_ids ), array( __CLASS__, 'is_buildable' ) ) );
		if ( $queued ) {
			update_option( self::QUEUE_OPTION, array_values( array_unique( array_merge( self::get_queue(), $queued ) ) ), false );
		}
		return $queued;
	}

	/**
	 * Remove a Figure from the queue.
	 *
	 * @param int $figure_id Figure ID.
	 * @return void
	 */
	public static function dequeue( $figure_id ) {
		$queue = self::get_queue();
		$index = array_search( (int) $figure_id, $queue, true );
		if ( false !== $index ) {
			unset( $queue[ $index ] );
			update_option( self::QUEUE_OPTION, array_values( $queue ), false );
		}
	}

	/**
	 * IDs of the Figures waiting for their HTML. Figures that were deleted,
	 * or can no longer have HTML (for example their Status was set to Draft),
	 * are dropped.
	 *
	 * @return int[]
	 */
	public static function get_queue() {
		$queue = array_map( 'intval', (array) get_option( self::QUEUE_OPTION, array() ) );
		$valid = array_values( array_filter( $queue, array( __CLASS__, 'is_buildable' ) ) );
		if ( $valid !== $queue ) {
			update_option( self::QUEUE_OPTION, $valid, false );
		}
		return $valid;
	}

	/**
	 * Whether a Figure gets standalone HTML, by the edit screen's rules.
	 *
	 * @param int $figure_id Figure ID.
	 * @return bool
	 */
	public static function is_buildable( $figure_id ) {
		if ( 'figure' !== get_post_type( $figure_id ) || 'trash' === get_post_status( $figure_id ) ) {
			return false;
		}
		if ( 'published' !== get_post_meta( $figure_id, 'figure_published', true ) ) {
			return false;
		}
		$type = (string) get_post_meta( $figure_id, 'figure_path', true );
		if ( ! in_array( $type, self::FIGURE_TYPES, true ) ) {
			return false;
		}
		return 'Interactive' !== $type || '' !== trim( (string) get_post_meta( $figure_id, 'figure_interactive_args_rendered', true ) ) || self::needs_render( $figure_id );
	}

	/**
	 * Whether an Interactive figure's saved JSON is still to be built from
	 * its settings.
	 *
	 * @param int $figure_id Figure ID.
	 * @return bool
	 */
	public static function needs_render( $figure_id ) {
		return 'Interactive' === get_post_meta( $figure_id, 'figure_path', true )
			&& (bool) get_post_meta( $figure_id, self::RENDER_META_KEY, true )
			&& '' === trim( (string) get_post_meta( $figure_id, 'figure_interactive_args_rendered', true ) )
			&& '' !== trim( (string) get_post_meta( $figure_id, 'figure_interactive_arguments', true ) );
	}

	/**
	 * Save an Interactive figure's saved JSON, built in the browser from its
	 * settings, cleaned as the edit screen cleans the field when it saves.
	 *
	 * @param int    $figure_id Figure ID.
	 * @param string $rendered  JSON.
	 * @return true|WP_Error
	 */
	public static function save_render( $figure_id, $rendered ) {
		if ( ! self::needs_render( $figure_id ) ) {
			return new WP_Error( 'graphic_data_figure_html', 'This Figure already has its saved interactive figure.' );
		}
		if ( ! is_array( json_decode( $rendered, true ) ) ) {
			return new WP_Error( 'graphic_data_figure_html', 'The interactive figure could not be built from its settings.' );
		}
		if ( ! class_exists( 'Exopite_Simple_Options_Framework_Sanitize' ) ) {
			require_once plugin_dir_path( __DIR__ ) . 'admin/exopite-simple-options/sanitize-class.php';
		}
		$sanitizer = new Exopite_Simple_Options_Framework_Sanitize( false, '', array(), array() );
		$field     = array(
			'id'   => 'figure_interactive_args_rendered',
			'type' => 'textarea',
		);
		update_post_meta( $figure_id, 'figure_interactive_args_rendered', wp_slash( $sanitizer->sanitize( $field, $rendered ) ) );
		delete_post_meta( $figure_id, self::RENDER_META_KEY );
		return true;
	}

	/**
	 * Every Figure that gets HTML, optionally only those in one Instance.
	 *
	 * @param int $instance_id Instance ID, or 0 for every Figure.
	 * @return int[]
	 */
	public static function get_buildable_figures( $instance_id = 0 ) {
		$args = array(
			'post_type'        => 'figure',
			'post_status'      => 'publish',
			'posts_per_page'   => -1,
			'fields'           => 'ids',
			'orderby'          => 'ID',
			'order'            => 'ASC',
			'suppress_filters' => true,
		);
		if ( $instance_id ) {
			$args['meta_key']   = 'location'; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			$args['meta_value'] = (string) $instance_id; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
		}
		return array_values( array_filter( array_map( 'intval', get_posts( $args ) ), array( __CLASS__, 'is_buildable' ) ) );
	}

	/**
	 * What createFigureHtml() needs to build a Figure's two files: the info
	 * objects that the edit screen collects from its form, and the saved
	 * figure for Interactive figures.
	 *
	 * When the figure's saved JSON is still to be built, `render` holds its
	 * settings and `saved_figure` is null.
	 *
	 * @param int $figure_id Figure ID.
	 * @return array{figure_type: string, saved_figure: mixed, render: array|null, info_full: array, info_figure_only: array}
	 */
	public static function get_build_data( $figure_id ) {
		$meta = function ( $key ) use ( $figure_id ) {
			return get_post_meta( $figure_id, $key, true );
		};
		$type    = (string) $meta( 'figure_path' );
		$science = is_array( $meta( 'figure_science_info' ) ) ? $meta( 'figure_science_info' ) : array();
		$data    = is_array( $meta( 'figure_data_info' ) ) ? $meta( 'figure_data_info' ) : array();
		$image   = '';
		if ( 'Internal' === $type ) {
			$image = (string) $meta( 'figure_image' );
		} elseif ( 'External' === $type ) {
			$image = (string) $meta( 'figure_external_url' );
		}
		$checkbox = (string) $meta( 'figure_internal_url_checkbox' );

		// The edit screen reads captions from the visual editor, which adds
		// paragraphs the way wpautop() does.
		$caption = function ( $key ) use ( $meta ) {
			$value = (string) $meta( $key );
			return '' === trim( $value ) ? '' : trim( wpautop( $value ) );
		};

		$info = array(
			'figure_published'                 => (string) $meta( 'figure_published' ),
			'postID'                           => (string) $figure_id,
			'status'                           => 'full_figure',
			'scienceLink'                      => (string) ( $science['figure_science_link_url'] ?? '' ),
			'scienceText'                      => (string) ( $science['figure_science_link_text'] ?? '' ),
			'dataLink'                         => (string) ( $data['figure_data_link_url'] ?? '' ),
			'dataText'                         => (string) ( $data['figure_data_link_text'] ?? '' ),
			'figureInternalUrlCheckbox'        => '' !== $checkbox && 'no' !== $checkbox ? 'yes' : '',
			'figureInternalUrl'                => (string) $meta( 'figure_internal_url' ),
			'imageLink'                        => $image,
			'code'                             => (string) $meta( 'figure_code' ),
			'externalAlt'                      => (string) $meta( 'figure_external_alt' ),
			'shortCaption'                     => $caption( 'figure_caption_short' ),
			'longCaption'                      => $caption( 'figure_caption_long' ),
			'figureType'                       => $type,
			'figureTitle'                      => (string) $meta( 'figure_title' ),
			'figure_interactive_arguments'     => (string) $meta( 'figure_interactive_arguments' ),
			'figure_interactive_args_rendered' => (string) $meta( 'figure_interactive_args_rendered' ),
		);

		// The figure-only file leaves out the links and captions.
		$figure_only = array_merge(
			$info,
			array(
				'status'       => 'figure_only',
				'scienceLink'  => '',
				'scienceText'  => '',
				'dataLink'     => '',
				'dataText'     => '',
				'shortCaption' => '',
				'longCaption'  => '',
			)
		);

		$saved_figure = null;
		if ( 'Interactive' === $type ) {
			$saved_figure = json_decode( $info['figure_interactive_args_rendered'], true );
		}

		return array(
			'title'            => get_the_title( $figure_id ),
			'figure_type'      => $type,
			'saved_figure'     => $saved_figure,
			'render'           => self::needs_render( $figure_id ) ? array( 'arguments' => $info['figure_interactive_arguments'] ) : null,
			'info_full'        => $info,
			'info_figure_only' => $figure_only,
		);
	}

	/**
	 * Write a Figure's two HTML files and point its meta at them, as the
	 * edit screen's save does, then remove it from the queue.
	 *
	 * @param int    $figure_id        Figure ID.
	 * @param string $full_html        figure-<ID>.html content.
	 * @param string $figure_only_html figure-<ID>_figure_only.html content.
	 * @return true|WP_Error
	 */
	public static function save( $figure_id, $full_html, $figure_only_html ) {
		if ( ! self::is_buildable( $figure_id ) ) {
			return new WP_Error( 'graphic_data_figure_html', 'This Figure cannot have standalone HTML.' );
		}
		if ( '' === trim( $full_html ) || '' === trim( $figure_only_html ) ) {
			return new WP_Error( 'graphic_data_figure_html', 'The generated HTML was empty.' );
		}

		$dir = WP_CONTENT_DIR . '/data/figure_' . (int) $figure_id;
		if ( ! wp_mkdir_p( $dir ) ) {
			return new WP_Error( 'graphic_data_figure_html', 'Could not create the figure data folder.' );
		}
		$name  = 'figure-' . (int) $figure_id;
		$files = array(
			$dir . '/' . $name . '.html'             => $full_html,
			$dir . '/' . $name . '_figure_only.html' => $figure_only_html,
		);
		foreach ( $files as $path => $html ) {
			// phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			if ( false === file_put_contents( $path, $html ) ) {
				return new WP_Error( 'graphic_data_figure_html', sprintf( 'Could not write %s.', wp_basename( $path ) ) );
			}
		}

		// The edit screen records the full file under both keys (see
		// custom_file_upload_handler()), and its URL as the iframe code.
		update_post_meta( $figure_id, 'uploaded_path_html', $dir . '/' . $name . '.html' );
		update_post_meta( $figure_id, 'uploaded_html_file', $name . '.html' );
		update_post_meta( $figure_id, 'figure_iframe_code', content_url( 'data/figure_' . (int) $figure_id . '/' . $name . '.html' ) );

		self::dequeue( $figure_id );
		return true;
	}
}
