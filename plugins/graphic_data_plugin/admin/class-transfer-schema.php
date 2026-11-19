<?php
/**
 * Field registry for the Content Transfer tool.
 *
 * Single source of truth for which data belongs to each Graphic Data content
 * type and which of those values point at other content. The exporter, the
 * importer, and the bulk-import template all read from this class, so when a
 * field is added, renamed, or removed elsewhere in the plugin, this is the
 * one place that must be updated (and SCHEMA_VERSION bumped if the change
 * alters the package format).
 *
 * Meta keys are listed explicitly (an allowlist) rather than exporting all
 * postmeta, because some posts carry stray form-submission values such as
 * `_wpnonce` or `hidden_mm` that must not travel to another site.
 *
 * @package Graphic_Data_Plugin
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Graphic_Data_Transfer_Schema.
 *
 * @since 1.10.0
 */
class Graphic_Data_Transfer_Schema {

	/**
	 * Version of the package format written by the exporter.
	 *
	 * Independent of the plugin version. Increment whenever the structure of
	 * manifest.json / content.json or the meaning of a field changes, and add
	 * a matching upgrade step to get_upgrades() so older packages remain
	 * importable. Adding a field does not need a new version: packages made
	 * before it simply do not have it, as posts saved before it do not.
	 */
	const SCHEMA_VERSION = 1;

	/**
	 * Identifier written to manifest.json so packages can be recognised.
	 */
	const PACKAGE_FORMAT = 'graphic-data-content-transfer';

	/**
	 * Taxonomy that classifies Instances.
	 */
	const INSTANCE_TYPE_TAXONOMY = 'instance_type';

	/**
	 * Hidden meta key recording where an imported post, attachment or term
	 * came from ("<source site URL>#<source ID>"). Used to recognise content
	 * that was imported before.
	 */
	const SOURCE_META_KEY = '_graphic_data_transfer_source';

	/**
	 * Hidden meta key holding the ID of the import that created a post,
	 * attachment or term, so the import can be undone.
	 */
	const BATCH_META_KEY = '_graphic_data_transfer_batch';

	/**
	 * Graphic Data post types, in the order they must be created on import
	 * so that every reference points at something that already exists.
	 *
	 * @return string[]
	 */
	public static function get_post_types() {
		return array( 'instance', 'scene', 'modal', 'figure', 'about' );
	}

	/**
	 * Post statuses that are included in an export.
	 *
	 * Trash and auto-drafts are deliberately left out.
	 *
	 * @return string[]
	 */
	public static function get_exportable_statuses() {
		return array( 'publish', 'draft', 'pending', 'private', 'future' );
	}

	/**
	 * Meta keys exported for each post type.
	 *
	 * Repeating fieldsets are stored by Exopite as one serialized array per
	 * numbered key (for example `scene_info3` holds `scene_info_text3` and
	 * `scene_info_url3`), so each numbered key is listed.
	 *
	 * @param string $post_type Post type slug (including 'page').
	 * @return string[]
	 */
	public static function get_meta_keys( $post_type ) {
		switch ( $post_type ) {
			case 'about':
				return array_merge(
					array( 'about_published', 'numberAboutBoxes', 'centralAbout' ),
					self::numbered( 'aboutBox', 10 )
				);

			case 'instance':
				return array_merge(
					array(
						'instance_short_title',
						'instance_slug',
						'instance_type',
						'instance_overview_scene',
						'instance_status',
						'instance_tile',
						'instance_legacy_content',
						'instance_legacy_content_url',
						'instance_mobile_tile_background_color',
						'instance_mobile_tile_text_color',
						'instance_footer_columns',
					),
					self::numbered( 'instance_footer_column', 3 )
				);

			case 'scene':
				return array_merge(
					array(
						'scene_published',
						'scene_location',
						'scene_infographic',
						'scene_tagline',
						'scene_info_entries',
						'scene_photo_entries',
						'scene_order',
						'scene_full_screen_button',
						'scene_text_toggle',
						'scene_orphan_icon_action',
						'scene_orphan_icon_color',
						'scene_toc_style',
						'scene_same_hover_color_sections',
						'scene_hover_color',
						'scene_hover_text_color',
						'scene_section_number',
					),
					self::numbered( 'scene_info', 6 ),
					self::numbered( 'scene_photo', 6 ),
					self::numbered( 'scene_section', 6 )
				);

			case 'modal':
				return array_merge(
					array(
						'modal_published',
						'modal_location',
						'modal_scene',
						'modal_icons',
						'modal_icon_order',
						'icon_toc_section',
						'icon_function',
						'icon_external_url',
						'icon_page_out',
						'icon_scene_out',
						'modal_tagline',
						'modal_info_entries',
						'modal_photo_entries',
						'modal_tab_number',
					),
					self::numbered( 'modal_info', 6 ),
					self::numbered( 'modal_photo', 6 ),
					self::numbered( 'modal_tab_title', 6 )
				);

			case 'figure':
				return array_merge(
					array(
						'figure_published',
						'location',
						'figure_scene',
						'figure_modal',
						'figure_tab',
						'figure_order',
						'figure_science_info',
						'figure_data_info',
						'figure_path',
						'figure_title',
						'figure_internal_url_checkbox',
						'figure_internal_url',
						'figure_image',
						'figure_external_url',
						'figure_external_alt',
						'figure_code',
						'figure_upload_file',
						'figure_interactive_arguments',
						'figure_interactive_args_rendered',
						'figure_caption_short',
						'figure_caption_long',
						'plotFields',
						'uploaded_file',
					),
					self::get_data_path_keys()
				);

			case 'page':
				return array(
					Graphic_Data_Page_Options::INSTANCE_META_KEY,
					Graphic_Data_Page_Options::NAVBAR_META_KEY,
					Graphic_Data_Page_Options::ORDER_META_KEY,
				);
		}

		return array();
	}

	/**
	 * Meta keys whose values are the ID of another post, mapped to the post
	 * type they point at. These are rewritten to new IDs on import.
	 *
	 * Values that are not positive integers (for example a page's
	 * `scene_location` of "global") are literal and are left untouched.
	 *
	 * @param string $post_type Post type slug (including 'page').
	 * @return array<string, string> Meta key => target post type.
	 */
	public static function get_post_references( $post_type ) {
		switch ( $post_type ) {
			case 'instance':
				return array( 'instance_overview_scene' => 'scene' );

			case 'scene':
				return array( 'scene_location' => 'instance' );

			case 'modal':
				return array(
					'modal_location' => 'instance',
					'modal_scene'    => 'scene',
					'icon_scene_out' => 'scene',
					'icon_page_out'  => 'page',
				);

			case 'figure':
				return array(
					'location'     => 'instance',
					'figure_scene' => 'scene',
					'figure_modal' => 'modal',
				);

			case 'page':
				return array( Graphic_Data_Page_Options::INSTANCE_META_KEY => 'instance' );
		}

		return array();
	}

	/**
	 * References a post must have to be placed on the site: a Scene needs its
	 * Instance; a Modal its Instance and Scene; a Figure its Instance, Scene
	 * and Modal. On import, a post whose required reference is empty, points
	 * at content that no longer exists, or is left unlinked on the
	 * destination site is held (see get_import_status()).
	 *
	 * @param string $post_type Post type slug.
	 * @return array<string, string> Meta key => target post type.
	 */
	public static function get_required_references( $post_type ) {
		switch ( $post_type ) {
			case 'scene':
				return array( 'scene_location' => 'instance' );

			case 'modal':
				return array(
					'modal_location' => 'instance',
					'modal_scene'    => 'scene',
				);

			case 'figure':
				return array(
					'location'     => 'instance',
					'figure_scene' => 'scene',
					'figure_modal' => 'modal',
				);
		}

		return array();
	}

	/**
	 * Meta key holding the Graphic Data status that controls whether a post
	 * is shown on the site.
	 *
	 * @param string $post_type Post type slug.
	 * @return string Meta key, or an empty string if the type has none.
	 */
	public static function get_publication_meta_key( $post_type ) {
		$keys = array(
			'about'    => 'about_published',
			'instance' => 'instance_status',
			'scene'    => 'scene_published',
			'modal'    => 'modal_published',
			'figure'   => 'figure_published',
		);
		return isset( $keys[ $post_type ] ) ? $keys[ $post_type ] : '';
	}

	/**
	 * Value of the get_publication_meta_key() field that keeps a post off
	 * the site: 'Draft' for Instances, 'draft' for the other types.
	 *
	 * Given on import to a copy of a post that already exists on the
	 * destination, and to a Scene, Modal or Figure missing a required parent
	 * (see get_required_references()). The importer lists every post missing
	 * a parent in an error message.
	 *
	 * @param string $post_type Post type slug.
	 * @return string
	 */
	public static function get_held_publication_status( $post_type ) {
		return 'instance' === $post_type ? 'Draft' : 'draft';
	}

	/**
	 * Statuses to give an imported post.
	 *
	 * Graphic Data post types are always published in WordPress terms: their
	 * edit screens have no Save Draft button, and the admin only offers
	 * published posts as parents. Whether one appears on the site is set by
	 * its Graphic Data status field instead, so a held post (or one that was
	 * not published in WordPress on the source site) keeps post status
	 * 'publish' and has that field set to get_held_publication_status().
	 * Pages use ordinary WordPress statuses.
	 *
	 * @param string $post_type     Post type slug (including 'page').
	 * @param string $source_status WordPress post status on the source site.
	 * @param bool   $hold          True for a copy of an existing post or a
	 *                              post missing a required parent.
	 * @return array{post_status: string, publication_status: string} An
	 *         empty publication_status means keep the exported value.
	 */
	public static function get_import_status( $post_type, $source_status, $hold ) {
		if ( 'page' === $post_type ) {
			return array(
				'post_status'        => $hold ? 'draft' : $source_status,
				'publication_status' => '',
			);
		}

		$held = $hold || 'publish' !== $source_status;
		return array(
			'post_status'        => 'publish',
			'publication_status' => $held && self::get_publication_meta_key( $post_type ) ? self::get_held_publication_status( $post_type ) : '',
		);
	}

	/**
	 * Meta keys whose values are the ID of a taxonomy term, mapped to the
	 * taxonomy they point at.
	 *
	 * @param string $post_type Post type slug.
	 * @return array<string, string> Meta key => taxonomy.
	 */
	public static function get_term_references( $post_type ) {
		if ( 'instance' === $post_type ) {
			return array( 'instance_type' => self::INSTANCE_TYPE_TAXONOMY );
		}
		return array();
	}

	/**
	 * Meta key that ties each post type to its Instance.
	 *
	 * Used to find everything belonging to an Instance during export, and to
	 * group items by Instance in the admin selectors.
	 *
	 * @param string $post_type Post type slug (including 'page').
	 * @return string Meta key, or an empty string if the type has none.
	 */
	public static function get_instance_meta_key( $post_type ) {
		$keys = array(
			'scene'  => 'scene_location',
			'modal'  => 'modal_location',
			'figure' => 'location',
			'page'   => Graphic_Data_Page_Options::INSTANCE_META_KEY,
		);
		return isset( $keys[ $post_type ] ) ? $keys[ $post_type ] : '';
	}

	/**
	 * Block attributes that hold the ID of Graphic Data content, keyed by
	 * block name. Found in page content; rewritten (or cleared) on import.
	 *
	 * Note that the `instanceId` attribute of the Figure, Modal and Scene
	 * blocks is not an Instance: it is the block's editor clientId, used to
	 * give each copy of the block a unique frontend target, so it is copied
	 * unchanged.
	 *
	 * @return array<string, array<string, string>> Block name => attribute => target post type.
	 */
	public static function get_block_references() {
		return array(
			'create-block/graphic-data-insert-figure'   => array( 'figureId' => 'figure' ),
			'create-block/graphic-data-insert-modal'    => array( 'modalId' => 'modal' ),
			'create-block/graphic-data-insert-scene'    => array( 'sceneId' => 'scene' ),
			'create-block/graphic-data-insert-instance' => array(
				'instancePostId' => 'instance',
			),
		);
	}

	/**
	 * Figure meta keys that hold an absolute server path to a source data
	 * file in wp-content/data/figure_<ID>/. The files are bundled in the
	 * package and the paths are rebuilt for the target site on import.
	 *
	 * @return string[]
	 */
	public static function get_data_path_keys() {
		return array( 'uploaded_path_csv', 'uploaded_path_json', 'uploaded_path_geojson' );
	}

	/**
	 * Term meta keys exported for Instance Type terms.
	 *
	 * @return string[]
	 */
	public static function get_term_meta_keys() {
		return array( 'instance_order', 'instance_navbar_name' );
	}

	/**
	 * Figure values that are not exported because they are tied to the
	 * source site's figure ID and URL and are regenerated on import by the
	 * figure HTML rebuild. Listed for reference; they are already absent
	 * from get_meta_keys().
	 *
	 * @return string[]
	 */
	public static function get_rebuilt_keys() {
		return array( 'figure_iframe_code', 'uploaded_path_html', 'uploaded_html_file' );
	}

	/**
	 * Extensions accepted for figure data files in a package.
	 *
	 * @return string[]
	 */
	public static function get_data_file_extensions() {
		return array( 'csv', 'json', 'geojson' );
	}

	/**
	 * Meta keys that must be unique across posts of a type. A copy gets a
	 * numbered suffix (for example example-instance-2), as WordPress does
	 * for slugs.
	 *
	 * @param string $post_type Post type slug.
	 * @return string[]
	 */
	public static function get_unique_meta_keys( $post_type ) {
		return 'instance' === $post_type ? array( 'instance_slug' ) : array();
	}

	/**
	 * Steps that bring an older package's content.json up to SCHEMA_VERSION.
	 *
	 * Keyed by the version each step produces: the step for 2 turns version
	 * 1 content into version 2 content. A step receives the decoded content
	 * array and returns it changed, for example with rename_meta_key() when
	 * a field is renamed. Steps must never be edited or removed once
	 * released, because packages made with that version may still exist.
	 *
	 * @return array<int, callable>
	 */
	public static function get_upgrades() {
		return array();
	}

	/**
	 * Bring a package's content up to the current format.
	 *
	 * @param array $content Decoded content.json.
	 * @param int   $version The package's schema_version.
	 * @return array|WP_Error Upgraded content.
	 */
	public static function upgrade_content( $content, $version ) {
		return self::run_upgrades( $content, (int) $version, self::SCHEMA_VERSION, self::get_upgrades() );
	}

	/**
	 * Apply upgrade steps in order, from one version to another.
	 *
	 * @param array                $content Decoded content.json.
	 * @param int                  $from    Version of the content.
	 * @param int                  $to      Version to reach.
	 * @param array<int, callable> $steps   Steps keyed by the version they
	 *                                      produce (see get_upgrades()).
	 * @return array|WP_Error Upgraded content.
	 */
	public static function run_upgrades( $content, $from, $to, $steps ) {
		for ( $version = $from + 1; $version <= $to; $version++ ) {
			if ( ! isset( $steps[ $version ] ) || ! is_callable( $steps[ $version ] ) ) {
				return new WP_Error(
					'graphic_data_transfer_upgrade',
					sprintf( 'This package uses an older format (version %1$d) that this version of Graphic Data cannot upgrade to version %2$d.', $from, $to )
				);
			}
			$content = call_user_func( $steps[ $version ], $content );
			if ( ! is_array( $content ) ) {
				return new WP_Error(
					'graphic_data_transfer_upgrade',
					sprintf( 'The package could not be upgraded to format version %d.', $version )
				);
			}
		}
		return $content;
	}

	/**
	 * Upgrade helper: rename a meta key on every package post of a type.
	 *
	 * A value already stored under the new key is kept.
	 *
	 * @param array  $content   Decoded content.json.
	 * @param string $post_type Post type slug.
	 * @param string $old_key   Key used by the older format.
	 * @param string $new_key   Key used by the newer format.
	 * @return array
	 */
	public static function rename_meta_key( $content, $post_type, $old_key, $new_key ) {
		foreach ( (array) ( $content['posts'] ?? array() ) as $index => $entry ) {
			if ( ! is_array( $entry ) || ( $entry['post_type'] ?? '' ) !== $post_type || ! isset( $entry['meta'] ) || ! is_array( $entry['meta'] ) || ! array_key_exists( $old_key, $entry['meta'] ) ) {
				continue;
			}
			if ( ! array_key_exists( $new_key, $entry['meta'] ) ) {
				$content['posts'][ $index ]['meta'][ $new_key ] = $entry['meta'][ $old_key ];
			}
			unset( $content['posts'][ $index ]['meta'][ $old_key ] );
		}
		return $content;
	}

	/**
	 * Build a list of numbered meta keys, for example scene_info1..scene_info6.
	 *
	 * @param string $prefix Key prefix.
	 * @param int    $count  Highest number.
	 * @return string[]
	 */
	private static function numbered( $prefix, $count ) {
		$keys = array();
		for ( $i = 1; $i <= $count; $i++ ) {
			$keys[] = $prefix . $i;
		}
		return $keys;
	}
}
