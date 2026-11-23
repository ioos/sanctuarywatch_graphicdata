<?php
/**
 * Package builder for the Content Transfer tool.
 *
 * Gathers Graphic Data content (and everything it depends on) for a given
 * selection and writes it to a zip package:
 *
 *   manifest.json          Format/schema/plugin versions, source site, counts, checksums.
 *   content.json           Terms, posts (core fields + allowlisted meta), references,
 *                          media and data-file indexes. Source IDs are kept as-is so
 *                          the importer can remap them.
 *   media/<id>/<file>      Original files of referenced Media Library attachments.
 *   media/files/<path>     Files under uploads that are not registered attachments.
 *   data/figure_<id>/...   Figure source data files (CSV / JSON / GeoJSON).
 *
 * Generated figure HTML is not packaged; it is rebuilt on the target site.
 *
 * @package Graphic_Data_Plugin
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __DIR__ ) . 'admin/class-transfer-schema.php';

/**
 * Class Graphic_Data_Transfer_Exporter.
 *
 * @since 1.10.0
 */
class Graphic_Data_Transfer_Exporter {

	/**
	 * Normalised selection (see Graphic_Data_Content_Transfer::get_selection_from_request()).
	 *
	 * @var array
	 */
	private $selection;

	/**
	 * Exported posts keyed by source post ID.
	 *
	 * @var array<int, array>
	 */
	private $posts = array();

	/**
	 * Exported Instance Type terms keyed by source term ID.
	 *
	 * @var array<int, array>
	 */
	private $terms = array();

	/**
	 * References from exported content to other posts.
	 *
	 * @var array[]
	 */
	private $references = array();

	/**
	 * Media entries keyed by media key ('a<attachment id>' or 'f<hash>').
	 *
	 * @var array<string, array>
	 */
	private $media = array();

	/**
	 * Absolute paths of media files to add to the zip, keyed by zip path.
	 *
	 * @var array<string, string>
	 */
	private $media_files = array();

	/**
	 * Figure data files to add to the zip.
	 *
	 * @var array[]
	 */
	private $data_files = array();

	/**
	 * Non-fatal problems found while building the package.
	 *
	 * @var string[]
	 */
	private $warnings = array();

	/**
	 * Whether build() has run.
	 *
	 * @var bool
	 */
	private $built = false;

	/**
	 * Constructor.
	 *
	 * @param array $selection Normalised selection: scope ('instances' | 'selected'),
	 *                         plus instance_ids, include_pages and include_about for
	 *                         'instances', or post_ids for 'selected'.
	 */
	public function __construct( array $selection ) {
		$this->selection = $selection;
	}

	/**
	 * Collect all content, references, media and data files for the selection.
	 *
	 * @return true|WP_Error
	 */
	public function build() {
		if ( $this->built ) {
			return true;
		}

		if ( 'instances' === $this->selection['scope'] ) {
			if ( empty( $this->selection['instance_ids'] ) ) {
				return new WP_Error( 'graphic_data_transfer_empty', 'Select at least one Instance to export.' );
			}
			foreach ( $this->selection['instance_ids'] as $instance_id ) {
				$this->collect_instance( $instance_id );
			}
			if ( $this->selection['include_about'] ) {
				foreach ( $this->query_posts( 'about' ) as $about_id ) {
					$this->add_post( $about_id );
				}
			}
		} else {
			foreach ( $this->selection['post_ids'] as $post_id ) {
				if ( in_array( get_post_type( $post_id ), array( 'scene', 'modal', 'figure' ), true ) ) {
					$this->add_post( $post_id );
				} else {
					$this->warnings[] = sprintf( 'Item %d could not be found and was skipped.', $post_id );
				}
			}
		}

		if ( empty( $this->posts ) ) {
			return new WP_Error( 'graphic_data_transfer_empty', 'Nothing was found to export.' );
		}

		foreach ( $this->posts as $source_id => $entry ) {
			$this->collect_references( $source_id, $entry );
			$this->collect_media( $entry );
			if ( 'figure' === $entry['post_type'] ) {
				$this->collect_data_files( $source_id, $entry );
			}
		}

		$this->built = true;
		return true;
	}

	/**
	 * Everything build() collected, for writing it in another format (see
	 * Graphic_Data_Transfer_Tsv_Exporter).
	 *
	 * @return array{posts: array<int, array>, terms: array<int, array>, media: array<string, array>, media_files: array<string, string>, data_files: array[]}
	 *         Posts and terms keyed by source ID, media keyed by media key,
	 *         media file paths keyed by zip path, and data files with their
	 *         figure ('post'), meta key ('field'), zip path ('file') and
	 *         path ('path').
	 */
	public function get_collected() {
		return array(
			'posts'       => $this->posts,
			'terms'       => $this->terms,
			'media'       => $this->media,
			'media_files' => $this->media_files,
			'data_files'  => $this->data_files,
		);
	}

	/**
	 * Package type recorded in the manifest.
	 *
	 * 'figure' marks a single-figure package, the only kind Editors may import.
	 *
	 * @return string 'instances', 'selection' or 'figure'.
	 */
	public function get_package_type() {
		if ( 'instances' === $this->selection['scope'] ) {
			return 'instances';
		}
		if ( 1 === count( $this->posts ) && 'figure' === reset( $this->posts )['post_type'] ) {
			return 'figure';
		}
		return 'selection';
	}

	/**
	 * Human-readable summary of what the package will contain, for the
	 * preview shown before downloading.
	 *
	 * @return array
	 */
	public function get_summary() {
		$counts = array_fill_keys( array_merge( Graphic_Data_Transfer_Schema::get_post_types(), array( 'page' ) ), 0 );
		$items  = array();
		foreach ( $this->posts as $entry ) {
			++$counts[ $entry['post_type'] ];
			// Graphic Data types are shown or hidden by their own status field.
			$status_key = Graphic_Data_Transfer_Schema::get_publication_meta_key( $entry['post_type'] );
			$status     = $entry['post_status'];
			if ( $status_key ) {
				$status = isset( $entry['meta'][ $status_key ] ) ? $entry['meta'][ $status_key ] : 'draft';
			}
			$items[] = array(
				'type'   => $entry['post_type'],
				'id'     => $entry['source_id'],
				'title'  => $entry['post_title'],
				'status' => $status,
			);
		}

		$media_bytes = 0;
		foreach ( $this->media_files as $path ) {
			$media_bytes += (int) filesize( $path );
		}
		$data_bytes = 0;
		foreach ( $this->get_unique_data_files() as $path ) {
			$data_bytes += (int) filesize( $path );
		}

		$external = array();
		foreach ( $this->references as $reference ) {
			if ( $reference['in_package'] ) {
				continue;
			}
			$external[] = array(
				'from_type'    => $this->posts[ $reference['post'] ]['post_type'],
				'from_title'   => $this->posts[ $reference['post'] ]['post_title'],
				'field'        => 'block' === $reference['location'] ? $reference['block'] . ' → ' . $reference['key'] : $reference['key'],
				'target_type'  => $reference['target_type'],
				'target_title' => $reference['target_title'],
			);
		}

		$unassigned = array();
		foreach ( $this->posts as $entry ) {
			$missing = $this->get_missing_parents( $entry );
			if ( $missing ) {
				$unassigned[] = array(
					'type'    => $entry['post_type'],
					'title'   => $entry['post_title'],
					'missing' => $missing,
				);
			}
		}

		return array(
			'package_type' => $this->get_package_type(),
			'counts'       => $counts,
			'terms'        => array_values( wp_list_pluck( $this->terms, 'name' ) ),
			'items'        => $items,
			'media_count'  => count( $this->media_files ),
			'media_size'   => size_format( $media_bytes ),
			'data_count'   => count( $this->get_unique_data_files() ),
			'data_size'    => size_format( $data_bytes ),
			'external'     => $external,
			'unassigned'   => $unassigned,
			'warnings'     => array_values( array_unique( $this->warnings ) ),
		);
	}

	/**
	 * Required parents (Instance, Scene, Modal) that a post will not have
	 * from this package alone. Such a post is imported as published with a
	 * Graphic Data status of Draft unless the parent is linked on import.
	 *
	 * @param array $entry Post entry.
	 * @return array<int, array{type: string, linkable: bool}> Missing parent
	 *         types. `linkable` is true when the parent exists on this site
	 *         but is outside the package, so it can be linked on import; false
	 *         when the post has no parent at all.
	 */
	private function get_missing_parents( $entry ) {
		$missing = array();
		foreach ( Graphic_Data_Transfer_Schema::get_required_references( $entry['post_type'] ) as $key => $target_type ) {
			$value     = isset( $entry['meta'][ $key ] ) ? $entry['meta'][ $key ] : '';
			$target_id = is_scalar( $value ) && ctype_digit( (string) $value ) ? (int) $value : 0;
			if ( isset( $this->posts[ $target_id ] ) && $target_type === $this->posts[ $target_id ]['post_type'] ) {
				continue;
			}
			$missing[] = array(
				'type'     => $target_type,
				'linkable' => $target_id > 0 && get_post_type( $target_id ) === $target_type,
			);
		}
		return $missing;
	}

	/**
	 * Write the package to a zip file.
	 *
	 * @param string $zip_path Absolute path of the zip file to create (overwritten).
	 * @return true|WP_Error
	 */
	public function write_zip( $zip_path ) {
		$result = $this->build();
		if ( is_wp_error( $result ) ) {
			return $result;
		}

		if ( ! class_exists( 'ZipArchive' ) ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'The PHP ZipArchive extension is required to export content.' );
		}

		$zip = new ZipArchive();
		if ( true !== $zip->open( $zip_path, ZipArchive::CREATE | ZipArchive::OVERWRITE ) ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'Could not create the export file.' );
		}

		$checksums = array();

		$files = $this->media_files;
		foreach ( $this->data_files as $data_file ) {
			$files[ $data_file['file'] ] = $data_file['path'];
		}
		foreach ( $files as $zip_name => $path ) {
			$zip->addFile( $path, $zip_name );
			$checksums[ $zip_name ] = hash_file( 'sha256', $path );
		}

		$content = wp_json_encode( $this->get_content(), JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE );
		$zip->addFromString( 'content.json', $content );
		$checksums['content.json'] = hash( 'sha256', $content );

		$zip->addFromString(
			'manifest.json',
			wp_json_encode( $this->get_manifest( $checksums ), JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE )
		);

		if ( ! $zip->close() ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'Could not finish writing the export file.' );
		}
		return true;
	}

	/**
	 * Suggested download file name, for example graphic-data-instances-2026-11-18.zip,
	 * graphic-data-selection-2026-11-18.zip or graphic-data-figure-sea-temps-2026-11-18.zip.
	 * A selection of one item is named after that item.
	 *
	 * @return string
	 */
	public function get_file_name() {
		$type = $this->get_package_type();
		$name = 'graphic-data-' . $type;
		if ( 'instances' !== $type && 1 === count( $this->posts ) ) {
			$first = reset( $this->posts );
			$slug  = sanitize_title( $first['post_title'] );
			if ( '' !== $slug ) {
				$name .= '-' . $slug;
			}
		}
		return $name . '-' . gmdate( 'Y-m-d' ) . '.zip';
	}

	// ---------------------------------------------------------------------
	// Collection
	// ---------------------------------------------------------------------

	/**
	 * Add an Instance, its Instance Type, and everything assigned to it.
	 *
	 * @param int $instance_id Instance post ID.
	 * @return void
	 */
	private function collect_instance( $instance_id ) {
		$instance = get_post( $instance_id );
		if ( ! $instance || 'instance' !== $instance->post_type ) {
			$this->warnings[] = sprintf( 'Instance %d could not be found and was skipped.', $instance_id );
			return;
		}
		$this->add_post( $instance_id );

		$term_id = (int) get_post_meta( $instance_id, 'instance_type', true );
		if ( $term_id ) {
			$this->add_term( $term_id );
		}

		$types = array( 'scene', 'modal', 'figure' );
		if ( $this->selection['include_pages'] ) {
			$types[] = 'page';
		}
		foreach ( $types as $type ) {
			$meta_key = Graphic_Data_Transfer_Schema::get_instance_meta_key( $type );
			foreach ( $this->query_posts( $type, $meta_key, $instance_id ) as $post_id ) {
				$this->add_post( $post_id );
			}
		}
	}

	/**
	 * Find posts of a type, optionally filtered by a meta value.
	 *
	 * @param string     $post_type  Post type.
	 * @param string     $meta_key   Optional meta key to match.
	 * @param int|string $meta_value Value the meta key must equal.
	 * @return int[] Post IDs.
	 */
	private function query_posts( $post_type, $meta_key = '', $meta_value = '' ) {
		$args = array(
			'post_type'        => $post_type,
			'post_status'      => Graphic_Data_Transfer_Schema::get_exportable_statuses(),
			'posts_per_page'   => -1,
			'fields'           => 'ids',
			'orderby'          => 'ID',
			'order'            => 'ASC',
			'suppress_filters' => true,
		);
		if ( '' !== $meta_key ) {
			$args['meta_key']   = $meta_key; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
			$args['meta_value'] = (string) $meta_value; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
		}
		return array_map( 'intval', get_posts( $args ) );
	}

	/**
	 * Add a post's core fields and allowlisted meta to the package.
	 *
	 * @param int $post_id Post ID.
	 * @return void
	 */
	private function add_post( $post_id ) {
		if ( isset( $this->posts[ $post_id ] ) ) {
			return;
		}
		$post = get_post( $post_id );
		if ( ! $post ) {
			return;
		}

		$meta = array();
		foreach ( Graphic_Data_Transfer_Schema::get_meta_keys( $post->post_type ) as $key ) {
			if ( metadata_exists( 'post', $post_id, $key ) ) {
				$meta[ $key ] = get_post_meta( $post_id, $key, true );
			}
		}

		$this->posts[ $post_id ] = array(
			'source_id'      => (int) $post_id,
			'post_type'      => $post->post_type,
			'post_title'     => $post->post_title,
			'post_name'      => $post->post_name,
			'post_status'    => $post->post_status,
			'post_content'   => $post->post_content,
			'post_excerpt'   => $post->post_excerpt,
			'post_date_gmt'  => $post->post_date_gmt,
			'menu_order'     => (int) $post->menu_order,
			'comment_status' => $post->comment_status,
			'ping_status'    => $post->ping_status,
			'page_template'  => 'page' === $post->post_type ? get_page_template_slug( $post ) : '',
			'meta'           => $meta,
		);
	}

	/**
	 * Add an Instance Type term to the package.
	 *
	 * @param int $term_id Term ID.
	 * @return void
	 */
	private function add_term( $term_id ) {
		if ( isset( $this->terms[ $term_id ] ) ) {
			return;
		}
		$term = get_term( $term_id, Graphic_Data_Transfer_Schema::INSTANCE_TYPE_TAXONOMY );
		if ( ! $term || is_wp_error( $term ) ) {
			$this->warnings[] = sprintf( 'Instance Type %d could not be found; Instances using it will need a new type on import.', $term_id );
			return;
		}

		$meta = array();
		foreach ( Graphic_Data_Transfer_Schema::get_term_meta_keys() as $key ) {
			if ( metadata_exists( 'term', $term_id, $key ) ) {
				$meta[ $key ] = get_term_meta( $term_id, $key, true );
			}
		}

		$this->terms[ $term_id ] = array(
			'source_id'   => (int) $term_id,
			'taxonomy'    => $term->taxonomy,
			'name'        => $term->name,
			'slug'        => $term->slug,
			'description' => $term->description,
			'meta'        => $meta,
		);
	}

	/**
	 * Record every reference from a post to another post, noting whether the
	 * target is in the package. Targets outside the package are described by
	 * title so the importer can ask the user what to link them to.
	 *
	 * @param int   $source_id Source post ID.
	 * @param array $entry     Post entry.
	 * @return void
	 */
	private function collect_references( $source_id, $entry ) {
		foreach ( Graphic_Data_Transfer_Schema::get_post_references( $entry['post_type'] ) as $key => $target_type ) {
			if ( isset( $entry['meta'][ $key ] ) ) {
				$this->add_reference( $source_id, 'meta', $key, '', $entry['meta'][ $key ], $target_type );
			}
		}

		if ( 'page' === $entry['post_type'] && has_blocks( $entry['post_content'] ) ) {
			$this->collect_block_references( $source_id, parse_blocks( $entry['post_content'] ) );
		}
	}

	/**
	 * Record references held in Graphic Data block attributes, including
	 * blocks nested inside groups or columns.
	 *
	 * @param int   $source_id Source page ID.
	 * @param array $blocks    Parsed blocks.
	 * @return void
	 */
	private function collect_block_references( $source_id, $blocks ) {
		$block_refs = Graphic_Data_Transfer_Schema::get_block_references();
		foreach ( $blocks as $block ) {
			if ( isset( $block_refs[ $block['blockName'] ] ) ) {
				foreach ( $block_refs[ $block['blockName'] ] as $attr => $target_type ) {
					if ( isset( $block['attrs'][ $attr ] ) ) {
						$this->add_reference( $source_id, 'block', $attr, $block['blockName'], $block['attrs'][ $attr ], $target_type );
					}
				}
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$this->collect_block_references( $source_id, $block['innerBlocks'] );
			}
		}
	}

	/**
	 * Record one reference if its value is a post ID.
	 *
	 * @param int    $source_id   Post holding the reference.
	 * @param string $location    'meta' or 'block'.
	 * @param string $key         Meta key or block attribute.
	 * @param string $block       Block name, for block references.
	 * @param mixed  $value       Stored value.
	 * @param string $target_type Post type the value points at.
	 * @return void
	 */
	private function add_reference( $source_id, $location, $key, $block, $value, $target_type ) {
		if ( ! is_scalar( $value ) || ! ctype_digit( (string) $value ) || 0 === (int) $value ) {
			return;
		}
		$target_id = (int) $value;
		$target    = get_post( $target_id );

		$this->references[] = array(
			'post'         => (int) $source_id,
			'location'     => $location,
			'block'        => $block,
			'key'          => $key,
			'target_type'  => $target_type,
			'target_id'    => $target_id,
			'in_package'   => isset( $this->posts[ $target_id ] ),
			'target_title' => $target ? $target->post_title : '',
			'target_slug'  => $target ? $target->post_name : '',
		);
	}

	/**
	 * Find every Media Library or uploads URL in a post's fields (including
	 * URLs embedded in rich-text HTML) and queue the files for the package.
	 *
	 * @param array $entry Post entry.
	 * @return void
	 */
	private function collect_media( $entry ) {
		$strings = array( $entry['post_content'], $entry['post_excerpt'] );
		array_walk_recursive(
			$entry['meta'],
			function ( $value ) use ( &$strings ) {
				if ( is_string( $value ) ) {
					$strings[] = $value;
				}
			}
		);

		$pattern = $this->get_uploads_url_pattern();
		foreach ( $strings as $string ) {
			if ( '' === $string || ! preg_match_all( $pattern, $string, $matches ) ) {
				continue;
			}
			foreach ( $matches[0] as $url ) {
				$this->add_media_url( rtrim( $url, '.,;:' ) );
			}
		}
	}

	/**
	 * Regular expression matching URLs inside this site's uploads folder,
	 * whether written as http, https or protocol-relative.
	 *
	 * @return string
	 */
	private function get_uploads_url_pattern() {
		$uploads = wp_get_upload_dir();
		$base    = preg_replace( '#^https?:#i', '', untrailingslashit( $uploads['baseurl'] ) );
		return '#(?:https?:)?' . preg_quote( $base, '#' ) . '/[^\s"\'<>()\\\\]+#i';
	}

	/**
	 * Queue the file behind an uploads URL, preferring the original file of
	 * the attachment it belongs to so that all image sizes can be regenerated
	 * on the target site.
	 *
	 * @param string $url URL found in content.
	 * @return void
	 */
	private function add_media_url( $url ) {
		$uploads  = wp_get_upload_dir();
		$base     = preg_replace( '#^(?:https?:)?//#i', '', untrailingslashit( $uploads['baseurl'] ) );
		$relative = preg_replace( '#^(?:https?:)?//' . preg_quote( $base, '#' ) . '/#i', '', $url );
		$relative = rawurldecode( strtok( $relative, '?#' ) );
		$full_url = trailingslashit( $uploads['baseurl'] ) . $relative;

		$attachment_id = $this->find_attachment_id( $full_url );
		if ( $attachment_id ) {
			$key = 'a' . $attachment_id;
			if ( ! isset( $this->media[ $key ] ) && ! $this->add_attachment( $attachment_id ) ) {
				return;
			}
			$this->media[ $key ]['source_urls'][ $url ] = $this->get_size_name( $attachment_id, $relative );
			return;
		}

		$path = $this->resolve_inside( $uploads['basedir'], $relative );
		if ( ! $path ) {
			$this->warnings[] = sprintf( 'Linked file not found in uploads: %s', $url );
			return;
		}
		$key = 'f' . md5( $relative );
		if ( ! isset( $this->media[ $key ] ) ) {
			$zip_name                       = 'media/files/' . $relative;
			$this->media_files[ $zip_name ] = $path;
			$this->media[ $key ]            = array(
				'key'                  => $key,
				'source_attachment_id' => 0,
				'file'                 => $zip_name,
				'mime'                 => wp_check_filetype( $path )['type'],
				'source_urls'          => array(),
			);
		}
		$this->media[ $key ]['source_urls'][ $url ] = 'full';
	}

	/**
	 * Look up the attachment for an uploads URL, including URLs of resized
	 * (-300x200) and big-image (-scaled) variants.
	 *
	 * @param string $url Absolute uploads URL.
	 * @return int Attachment ID, or 0.
	 */
	private function find_attachment_id( $url ) {
		$candidates = array(
			$url,
			preg_replace( '#-\d+x\d+(\.[a-z0-9]+)$#i', '$1', $url ),
			preg_replace( '#(?:-\d+x\d+)?(\.[a-z0-9]+)$#i', '-scaled$1', $url ),
		);
		foreach ( array_unique( $candidates ) as $candidate ) {
			$id = attachment_url_to_postid( $candidate );
			if ( $id ) {
				return (int) $id;
			}
		}
		return 0;
	}

	/**
	 * Queue an attachment's original file and its library details.
	 *
	 * @param int $attachment_id Attachment ID.
	 * @return bool False if the file is missing.
	 */
	private function add_attachment( $attachment_id ) {
		$path = function_exists( 'wp_get_original_image_path' ) ? wp_get_original_image_path( $attachment_id ) : false;
		if ( ! $path || ! file_exists( $path ) ) {
			$path = get_attached_file( $attachment_id );
		}
		if ( ! $path || ! file_exists( $path ) ) {
			$this->warnings[] = sprintf( 'The file for media item %d (%s) is missing and was not included.', $attachment_id, get_the_title( $attachment_id ) );
			return false;
		}

		$attachment = get_post( $attachment_id );
		$zip_name   = 'media/' . $attachment_id . '/' . wp_basename( $path );

		$this->media_files[ $zip_name ]      = $path;
		$this->media[ 'a' . $attachment_id ] = array(
			'key'                  => 'a' . $attachment_id,
			'source_attachment_id' => (int) $attachment_id,
			'file'                 => $zip_name,
			'mime'                 => $attachment->post_mime_type,
			'title'                => $attachment->post_title,
			'alt'                  => (string) get_post_meta( $attachment_id, '_wp_attachment_image_alt', true ),
			'caption'              => $attachment->post_excerpt,
			'description'          => $attachment->post_content,
			'source_urls'          => array(),
		);
		return true;
	}

	/**
	 * Name of the image size a URL refers to ('full' for the main file), so
	 * the importer can point it at the same size of the new attachment.
	 *
	 * @param int    $attachment_id Attachment ID.
	 * @param string $relative      Path of the URL relative to the uploads folder.
	 * @return string
	 */
	private function get_size_name( $attachment_id, $relative ) {
		$basename = wp_basename( $relative );
		// Checked first because some file types (SVG) list the main file under every size.
		if ( wp_basename( (string) get_attached_file( $attachment_id ) ) === $basename ) {
			return 'full';
		}
		$metadata = wp_get_attachment_metadata( $attachment_id );
		if ( ! empty( $metadata['sizes'] ) ) {
			foreach ( $metadata['sizes'] as $size => $info ) {
				if ( isset( $info['file'] ) && $info['file'] === $basename ) {
					return $size;
				}
			}
		}
		return 'full';
	}

	/**
	 * Queue a figure's source data files.
	 *
	 * The stored paths are absolute and may come from another server (for
	 * example after a site migration), so if a path does not exist the file
	 * of the same name in this figure's data folder is used instead.
	 *
	 * @param int   $source_id Figure post ID.
	 * @param array $entry     Post entry.
	 * @return void
	 */
	private function collect_data_files( $source_id, $entry ) {
		$data_dir = WP_CONTENT_DIR . '/data';
		foreach ( Graphic_Data_Transfer_Schema::get_data_path_keys() as $key ) {
			if ( empty( $entry['meta'][ $key ] ) || ! is_string( $entry['meta'][ $key ] ) ) {
				continue;
			}
			$basename = wp_basename( $entry['meta'][ $key ] );
			$path     = $this->resolve_inside( $data_dir, ltrim( str_replace( wp_normalize_path( $data_dir ), '', wp_normalize_path( $entry['meta'][ $key ] ) ), '/' ) );
			if ( ! $path ) {
				$path = $this->resolve_inside( $data_dir, 'figure_' . $source_id . '/' . $basename );
			}
			if ( ! $path ) {
				$this->warnings[] = sprintf( 'Data file "%s" for figure "%s" is missing and was not included.', $basename, $entry['post_title'] );
				continue;
			}
			$this->data_files[] = array(
				'post'  => (int) $source_id,
				'field' => $key,
				'file'  => 'data/figure_' . $source_id . '/' . wp_basename( $path ),
				'path'  => $path,
			);
		}
	}

	/**
	 * Resolve a relative path inside a base directory, refusing anything that
	 * escapes it (for example via ../).
	 *
	 * @param string $base     Base directory.
	 * @param string $relative Relative path.
	 * @return string|false Real path of an existing file, or false.
	 */
	private function resolve_inside( $base, $relative ) {
		$base_real = realpath( $base );
		$path      = realpath( trailingslashit( $base ) . $relative );
		if ( ! $base_real || ! $path || ! is_file( $path ) ) {
			return false;
		}
		if ( 0 !== strpos( wp_normalize_path( $path ), trailingslashit( wp_normalize_path( $base_real ) ) ) ) {
			return false;
		}
		return $path;
	}

	/**
	 * Data file paths with duplicates removed (a GeoJSON upload is stored
	 * under two meta keys).
	 *
	 * @return string[]
	 */
	private function get_unique_data_files() {
		return array_unique( wp_list_pluck( $this->data_files, 'path', 'file' ) );
	}

	// ---------------------------------------------------------------------
	// Package documents
	// ---------------------------------------------------------------------

	/**
	 * Build content.json.
	 *
	 * @return array
	 */
	private function get_content() {
		$data_files = array();
		foreach ( $this->data_files as $data_file ) {
			unset( $data_file['path'] );
			$data_files[] = $data_file;
		}

		return array(
			'terms'      => array_values( $this->terms ),
			'posts'      => array_values( $this->posts ),
			'references' => $this->references,
			'media'      => array_values( $this->media ),
			'data_files' => $data_files,
		);
	}

	/**
	 * Build manifest.json.
	 *
	 * @param array<string, string> $checksums SHA-256 of every file in the package, keyed by zip path.
	 * @return array
	 */
	private function get_manifest( $checksums ) {
		$uploads = wp_get_upload_dir();
		$summary = $this->get_summary();

		return array(
			'format'            => Graphic_Data_Transfer_Schema::PACKAGE_FORMAT,
			'schema_version'    => Graphic_Data_Transfer_Schema::SCHEMA_VERSION,
			'plugin_version'    => GRAPHIC_DATA_PLUGIN_VERSION,
			'wordpress_version' => get_bloginfo( 'version' ),
			'package_type'      => $summary['package_type'],
			'exported_at'       => gmdate( 'c' ),
			'source'            => array(
				'site_url'    => site_url(),
				'home_url'    => home_url(),
				'uploads_url' => $uploads['baseurl'],
				'data_url'    => content_url( 'data' ),
			),
			'selection'         => $this->selection,
			'counts'            => array_merge(
				$summary['counts'],
				array(
					'instance_type' => count( $this->terms ),
					'media'         => count( $this->media ),
					'data_files'    => count( $this->get_unique_data_files() ),
				)
			),
			'checksums'         => $checksums,
		);
	}
}
