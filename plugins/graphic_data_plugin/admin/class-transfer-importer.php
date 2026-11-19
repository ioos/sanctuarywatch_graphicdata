<?php
/**
 * Content Transfer importer.
 *
 * Imports a package written by Graphic_Data_Transfer_Exporter. An import is
 * a job that runs over several requests so that large packages stay clear
 * of upload and request time limits:
 *
 *   1. The zip is uploaded in chunks into a private work folder.
 *   2. The package is validated (format, schema version, checksums) and a
 *      dry run works out what will happen on this site, including every
 *      link to content outside the package (see get_link_targets()).
 *   3. The user chooses what each of those links points at on this site
 *      (and, for Figures, which Modal tab), then the import runs in steps:
 *      media files a few at a time, then all terms, posts, data files and
 *      references in one step.
 *
 * Everything an import creates is tagged with a batch ID so it can be
 * undone, automatically when a step fails or later from the Content
 * Transfer page. An About post that is overwritten is backed up first.
 *
 * Rules (see Graphic_Data_Transfer_Schema for the fields involved):
 *   - Every post is created new and assigned to the importing user. A post
 *     that already exists here is imported as a copy and held (Status set to
 *     Draft). The About post is the exception: it overwrites the existing one.
 *   - Graphic Data post types are always published in WordPress terms; a
 *     held post has its Graphic Data Status field set to Draft.
 *   - Instance Type terms with the same slug are reused.
 *   - References are remapped to the imported posts. A reference to content
 *     outside the package goes to the post the user chose. The suggested
 *     choice is the same post (when this site is the source site), an
 *     earlier import of it, or a post of the same type with the same slug.
 *     A link left empty is cleared (page block references to 0). A Scene,
 *     Modal or Figure left without a required parent is held and reported
 *     as an error.
 *   - Editors may import packages holding a single Figure only.
 *
 * Administrators can also upload a bulk import: a zip of TSV spreadsheets,
 * which is converted into a package first (Graphic_Data_Transfer_Tsv). Its
 * links to existing content become the suggested link choices, and its
 * Interactive figures are marked for their saved figure to be built in the
 * browser with their HTML.
 *
 * @package Graphic_Data_Plugin
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __DIR__ ) . 'admin/class-transfer-schema.php';
require_once plugin_dir_path( __DIR__ ) . 'admin/class-graphic-data-SVGValidator.php';
require_once plugin_dir_path( __DIR__ ) . 'admin/class-figure-html-rebuild.php';
require_once plugin_dir_path( __DIR__ ) . 'admin/class-transfer-tsv.php';

/**
 * Class Graphic_Data_Transfer_Importer.
 *
 * @since 1.10.0
 */
class Graphic_Data_Transfer_Importer {

	/**
	 * Prefix of the option holding each import job's state.
	 */
	const JOB_OPTION_PREFIX = 'graphic_data_transfer_job_';

	/**
	 * Option listing open jobs (token => creation time), for clean-up.
	 */
	const JOBS_OPTION = 'graphic_data_transfer_jobs';

	/**
	 * Option holding the record of each import, keyed by batch ID.
	 */
	const BATCHES_OPTION = 'graphic_data_transfer_batches';

	/**
	 * Folder inside uploads that holds packages while they are imported.
	 */
	const WORK_FOLDER = 'graphic-data-transfer';

	/**
	 * Seconds of media work to do per request.
	 */
	const TIME_BUDGET = 10;

	/**
	 * Jobs older than this many seconds are deleted.
	 */
	const JOB_LIFETIME = DAY_IN_SECONDS;

	/**
	 * Number of imports kept in the import history.
	 */
	const HISTORY_SIZE = 20;

	/**
	 * Job state.
	 *
	 * @var array
	 */
	private $job;

	/**
	 * Decoded manifest.json.
	 *
	 * @var array
	 */
	private $manifest;

	/**
	 * Decoded content.json.
	 *
	 * @var array
	 */
	private $content;

	/**
	 * Open package.
	 *
	 * @var ZipArchive|null
	 */
	private $zip;

	/**
	 * Package posts keyed by source ID.
	 *
	 * @var array<int, array>
	 */
	private $posts = array();

	/**
	 * Source post ID => new post ID, filled while importing.
	 *
	 * @var array<int, int>
	 */
	private $id_map = array();

	/**
	 * Source term ID => term ID on this site.
	 *
	 * @var array<int, int>
	 */
	private $term_map = array();

	/**
	 * Report of the import being run.
	 *
	 * @var array
	 */
	private $report = array();

	/**
	 * Source URL => new URL, built on first use.
	 *
	 * @var array<string, string>|null
	 */
	private $url_map = null;

	/**
	 * Links to content outside the package, built on first use. See
	 * get_link_targets().
	 *
	 * @var array<string, array>|null
	 */
	private $targets = null;

	/**
	 * Required references of each package post, keyed by source ID, built
	 * with $targets. See get_link_targets().
	 *
	 * @var array<int, array>
	 */
	private $required_refs = array();

	/**
	 * Source target ID => title and slug, from the package's references.
	 *
	 * @var array<int, array{title: string, slug: string}>|null
	 */
	private $reference_info = null;

	// ---------------------------------------------------------------------
	// Jobs
	// ---------------------------------------------------------------------

	/**
	 * Start a new import job for the current user.
	 *
	 * @param int  $size        Total size of the package in bytes.
	 * @param bool $figure_only Only accept a package holding a single Figure
	 *                          (imports by Editors).
	 * @return string|WP_Error Job token.
	 */
	public static function create_job( $size, $figure_only = false ) {
		self::delete_stale_jobs();

		$token = strtolower( wp_generate_password( 32, false ) );
		$dir   = self::get_work_root() . $token;
		if ( ! wp_mkdir_p( $dir ) ) {
			return new WP_Error( 'graphic_data_transfer_dir', 'Could not create a folder for the upload.' );
		}

		$job = array(
			'token'       => $token,
			'user_id'     => get_current_user_id(),
			'created'     => time(),
			'size'        => (int) $size,
			'received'    => 0,
			'figure_only' => (bool) $figure_only,
			'status'      => 'uploading',
			'step'        => '',
			'batch_id'    => '',
			'media'       => array(),
			'url_map'     => array(),
			'plan'        => array(),
			'links'       => array(),
			'tabs'        => array(),
		);
		update_option( self::JOB_OPTION_PREFIX . $token, $job, false );

		$jobs           = get_option( self::JOBS_OPTION, array() );
		$jobs[ $token ] = time();
		update_option( self::JOBS_OPTION, $jobs, false );

		return $token;
	}

	/**
	 * Load an existing job belonging to the current user.
	 *
	 * @param string $token Job token.
	 * @return Graphic_Data_Transfer_Importer|WP_Error
	 */
	public static function load( $token ) {
		$token = preg_replace( '/[^a-z0-9]/', '', (string) $token );
		$job   = '' !== $token ? get_option( self::JOB_OPTION_PREFIX . $token ) : false;
		if ( ! is_array( $job ) || get_current_user_id() !== (int) $job['user_id'] ) {
			return new WP_Error( 'graphic_data_transfer_job', 'This import could not be found. It may have expired; please upload the package again.' );
		}
		$importer      = new self();
		$importer->job = $job;
		return $importer;
	}

	/**
	 * Append an uploaded chunk to the package.
	 *
	 * @param string $chunk_path Uploaded temporary file.
	 * @param int    $offset     Byte offset of the chunk in the package.
	 * @return true|WP_Error
	 */
	public function append_chunk( $chunk_path, $offset ) {
		if ( 'uploading' !== $this->job['status'] ) {
			return new WP_Error( 'graphic_data_transfer_state', 'This package has already been uploaded.' );
		}
		if ( (int) $offset !== (int) $this->job['received'] ) {
			return new WP_Error( 'graphic_data_transfer_chunk', 'Part of the upload is missing; please try again.' );
		}

		$in  = fopen( $chunk_path, 'rb' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
		$out = fopen( $this->get_package_path(), 0 === (int) $offset ? 'wb' : 'ab' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
		if ( ! $in || ! $out ) {
			return new WP_Error( 'graphic_data_transfer_chunk', 'Could not save the upload.' );
		}
		$written = stream_copy_to_stream( $in, $out );
		fclose( $in ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		fclose( $out ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		if ( false === $written ) {
			return new WP_Error( 'graphic_data_transfer_chunk', 'Could not save the upload.' );
		}

		$this->job['received'] += $written;
		if ( $this->job['received'] > $this->job['size'] ) {
			return new WP_Error( 'graphic_data_transfer_chunk', 'The upload is larger than expected.' );
		}
		$this->save_job();
		return true;
	}

	/**
	 * Whether every chunk has arrived.
	 *
	 * @return bool
	 */
	public function is_uploaded() {
		return $this->job['received'] === $this->job['size'];
	}

	/**
	 * Job token.
	 *
	 * @return string
	 */
	public function get_token() {
		return $this->job['token'];
	}

	/**
	 * Validate the uploaded package and work out what importing it will do.
	 *
	 * @return array|WP_Error Dry-run report.
	 */
	public function check() {
		$converted = $this->convert_bulk_import();
		if ( is_wp_error( $converted ) ) {
			return $converted;
		}
		$opened = $this->open();
		if ( is_wp_error( $opened ) ) {
			return $opened;
		}
		$plan               = $this->make_plan();
		$this->job['plan']  = $plan;
		$this->job['status'] = 'ready';
		$this->save_job();
		return $this->describe_plan( $plan );
	}

	/**
	 * Run the next step of the import.
	 *
	 * @param array|null $choices Used by the first step only: 'links'
	 *                            (target key => post ID on this site, 0 to
	 *                            leave empty) and 'tabs' (source Figure ID =>
	 *                            Modal tab number). Missing choices take the
	 *                            dry run's suggestion.
	 * @return array|WP_Error Progress: done (bool), progress, total, and the
	 *                        report when done.
	 */
	public function run_step( $choices = null ) {
		if ( ! in_array( $this->job['status'], array( 'ready', 'running' ), true ) ) {
			return new WP_Error( 'graphic_data_transfer_state', 'This package is not ready to import.' );
		}
		$opened = $this->open();
		if ( is_wp_error( $opened ) ) {
			return $opened;
		}

		if ( 'ready' === $this->job['status'] ) {
			$chosen = $this->set_choices( is_array( $choices ) ? $choices : array() );
			if ( is_wp_error( $chosen ) ) {
				return $chosen;
			}
			$this->job['status']   = 'running';
			$this->job['step']     = 'media';
			$this->job['batch_id'] = $this->start_batch();
			$this->save_job();
		}

		try {
			if ( 'media' === $this->job['step'] ) {
				$this->import_media_step();
				if ( count( $this->job['media'] ) < count( $this->content['media'] ) ) {
					$this->save_job();
					return $this->get_progress( false );
				}
				$this->job['step'] = 'content';
				$this->save_job();
				return $this->get_progress( false );
			}

			$this->import_content();
		} catch ( Throwable $e ) {
			$message = 'The import failed and everything it had created was removed. ' . $e->getMessage();
			self::undo( $this->job['batch_id'], $message );
			$this->finish();
			return new WP_Error( 'graphic_data_transfer_failed', $message );
		}

		$this->complete_batch();
		$this->finish();
		$progress           = $this->get_progress( true );
		$progress['report'] = $this->report;
		return $progress;
	}

	/**
	 * Abandon the job and delete the uploaded package.
	 *
	 * @return void
	 */
	public function cancel() {
		$this->finish();
	}

	// ---------------------------------------------------------------------
	// Package
	// ---------------------------------------------------------------------

	/**
	 * If the upload is a bulk import (a zip of TSV files), replace it with
	 * the package it converts into. Bulk imports are for administrators.
	 *
	 * @return true|WP_Error The error's data lists every problem found in
	 *                       the spreadsheets ('errors').
	 */
	private function convert_bulk_import() {
		$path = $this->get_package_path();
		if ( ! Graphic_Data_Transfer_Tsv::is_bulk_zip( $path ) ) {
			return true;
		}
		if ( ! empty( $this->job['figure_only'] ) ) {
			return new WP_Error( 'graphic_data_transfer_forbidden', 'Only administrators can make bulk imports from spreadsheets.' );
		}

		$converted = $path . '.package';
		$result    = ( new Graphic_Data_Transfer_Tsv() )->convert( $path, $converted );
		if ( is_wp_error( $result ) ) {
			if ( file_exists( $converted ) ) {
				wp_delete_file( $converted );
			}
			return $result;
		}
		if ( ! rename( $converted, $path ) ) { // phpcs:ignore WordPress.WP.AlternativeFunctions.rename_rename
			return new WP_Error( 'graphic_data_transfer_tsv', 'Could not prepare the bulk import.' );
		}
		return true;
	}

	/**
	 * Open and validate the package.
	 *
	 * @return true|WP_Error
	 */
	private function open() {
		if ( $this->zip ) {
			return true;
		}
		if ( ! class_exists( 'ZipArchive' ) ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'The PHP ZipArchive extension is required to import content.' );
		}

		$zip = new ZipArchive();
		if ( true !== $zip->open( $this->get_package_path() ) ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'The file is not a valid zip file.' );
		}

		$manifest = json_decode( (string) $zip->getFromName( 'manifest.json' ), true );
		if ( ! is_array( $manifest ) || Graphic_Data_Transfer_Schema::PACKAGE_FORMAT !== ( $manifest['format'] ?? '' ) ) {
			return new WP_Error( 'graphic_data_transfer_format', 'This is not a Graphic Data Content Transfer package.' );
		}
		if ( (int) ( $manifest['schema_version'] ?? 0 ) < 1 ) {
			return new WP_Error( 'graphic_data_transfer_format', 'The package does not say which format version it uses.' );
		}

		$content_json = (string) $zip->getFromName( 'content.json' );
		$checksums    = isset( $manifest['checksums'] ) && is_array( $manifest['checksums'] ) ? $manifest['checksums'] : array();
		if ( ! isset( $checksums['content.json'] ) || ! hash_equals( (string) $checksums['content.json'], hash( 'sha256', $content_json ) ) ) {
			return new WP_Error( 'graphic_data_transfer_checksum', 'The package is damaged: content.json does not match its checksum.' );
		}
		$content = json_decode( $content_json, true );
		if ( ! is_array( $content ) ) {
			return new WP_Error( 'graphic_data_transfer_format', 'The package content could not be read.' );
		}
		// Packages from older versions are brought up to the current format.
		// Newer ones are imported as they are; get_package_warnings() lists
		// the fields this version skips.
		$version = (int) $manifest['schema_version'];
		$newer   = $version > Graphic_Data_Transfer_Schema::SCHEMA_VERSION;
		if ( $version < Graphic_Data_Transfer_Schema::SCHEMA_VERSION ) {
			$content = Graphic_Data_Transfer_Schema::upgrade_content( $content, $version );
			if ( is_wp_error( $content ) ) {
				return $content;
			}
		}
		$content = wp_parse_args(
			$content,
			array(
				'terms'      => array(),
				'posts'      => array(),
				'media'      => array(),
				'data_files' => array(),
			)
		);

		$allowed_types = array_merge( Graphic_Data_Transfer_Schema::get_post_types(), array( 'page' ) );
		foreach ( $content['posts'] as $entry ) {
			if ( ! is_array( $entry ) || ! in_array( $entry['post_type'] ?? '', $allowed_types, true ) || empty( $entry['source_id'] ) ) {
				return new WP_Error(
					'graphic_data_transfer_format',
					$newer
						? sprintf( 'The package contains a type of content that this version of Graphic Data does not have. It was made by a newer version (%s); update Graphic Data on this site and try again.', $manifest['plugin_version'] ?? '?' )
						: 'The package contains an item of an unknown type.'
				);
			}
			$this->posts[ (int) $entry['source_id'] ] = wp_parse_args(
				$entry,
				array(
					'post_title'     => '',
					'post_name'      => '',
					'post_status'    => 'publish',
					'post_content'   => '',
					'post_excerpt'   => '',
					'post_date_gmt'  => '',
					'menu_order'     => 0,
					'comment_status' => 'closed',
					'ping_status'    => 'closed',
					'page_template'  => '',
					'meta'           => array(),
				)
			);
		}
		if ( empty( $this->posts ) ) {
			return new WP_Error( 'graphic_data_transfer_empty', 'The package contains no content.' );
		}
		if ( ! empty( $this->job['figure_only'] ) && ( 1 !== count( $this->posts ) || 'figure' !== reset( $this->posts )['post_type'] || ! empty( $content['terms'] ) ) ) {
			return new WP_Error( 'graphic_data_transfer_forbidden', 'Editors can only import packages that contain a single Figure. Ask an administrator to import this package.' );
		}

		// Every file the content refers to must be present and intact.
		$files = array_merge( wp_list_pluck( $content['media'], 'file' ), wp_list_pluck( $content['data_files'], 'file' ) );
		foreach ( array_unique( $files ) as $file ) {
			$stream = isset( $checksums[ $file ] ) ? $zip->getStream( $file ) : false;
			if ( ! $stream ) {
				return new WP_Error( 'graphic_data_transfer_checksum', sprintf( 'The package is damaged: %s is missing.', $file ) );
			}
			$context = hash_init( 'sha256' );
			hash_update_stream( $context, $stream );
			fclose( $stream ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
			if ( ! hash_equals( (string) $checksums[ $file ], hash_final( $context ) ) ) {
				return new WP_Error( 'graphic_data_transfer_checksum', sprintf( 'The package is damaged: %s does not match its checksum.', $file ) );
			}
		}

		$this->zip      = $zip;
		$this->manifest = $manifest;
		$this->content  = $content;
		return true;
	}

	/**
	 * Copy a file out of the package.
	 *
	 * The destination is always chosen by the importer, never taken from the
	 * zip, so entries cannot be written outside their folder.
	 *
	 * @param string $file        Path inside the zip.
	 * @param string $destination Absolute destination path.
	 * @return void
	 * @throws RuntimeException When the file cannot be written.
	 */
	private function extract_to( $file, $destination ) {
		$in  = $this->zip->getStream( $file );
		$out = fopen( $destination, 'wb' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
		if ( ! $in || ! $out || false === stream_copy_to_stream( $in, $out ) ) {
			self::fail( sprintf( 'Could not write %s.', wp_basename( $destination ) ) );
		}
		fclose( $in ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		fclose( $out ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
	}

	/**
	 * Checksum of a file in the package.
	 *
	 * @param string $file Path inside the zip.
	 * @return string
	 */
	private function get_checksum( $file ) {
		return (string) $this->manifest['checksums'][ $file ];
	}

	/**
	 * Source site URL recorded in the package.
	 *
	 * @return string
	 */
	private function get_source_site() {
		return untrailingslashit( (string) ( $this->manifest['source']['site_url'] ?? '' ) );
	}

	/**
	 * Whether the package was exported from this site.
	 *
	 * @return bool
	 */
	private function is_same_site() {
		return '' !== $this->get_source_site() && untrailingslashit( site_url() ) === $this->get_source_site();
	}

	/**
	 * Value stored in SOURCE_META_KEY for an item from this package.
	 *
	 * @param int|string $source_id Source post, attachment or term ID.
	 * @return string
	 */
	private function get_source_key( $source_id ) {
		return $this->get_source_site() . '#' . $source_id;
	}

	// ---------------------------------------------------------------------
	// Dry run
	// ---------------------------------------------------------------------

	/**
	 * Decide what will happen to each item.
	 *
	 * @return array
	 */
	private function make_plan() {
		$plan = array(
			'posts' => array(),
			'terms' => array(),
			'media' => array(),
		);

		foreach ( $this->content['terms'] as $term ) {
			$existing                                     = get_term_by( 'slug', (string) $term['slug'], Graphic_Data_Transfer_Schema::INSTANCE_TYPE_TAXONOMY );
			$plan['terms'][ (int) $term['source_id'] ] = $existing ? (int) $existing->term_id : 0;
		}

		foreach ( $this->content['media'] as $media ) {
			$plan['media'][ $media['key'] ] = $this->find_existing_media( $media );
		}

		foreach ( $this->posts as $source_id => $entry ) {
			if ( 'about' === $entry['post_type'] ) {
				$about                      = $this->find_about();
				$plan['posts'][ $source_id ] = array(
					'action'   => $about ? 'overwrite' : 'create',
					'existing' => $about,
				);
				continue;
			}
			$existing                    = $this->find_existing_post( $entry['post_type'], $source_id, $entry['post_name'] );
			$plan['posts'][ $source_id ] = array(
				'action'   => $existing ? 'copy' : 'create',
				'existing' => $existing,
			);
		}

		return $plan;
	}

	/**
	 * Summarise the plan for the dry-run screen.
	 *
	 * @param array $plan Plan from make_plan().
	 * @return array
	 */
	private function describe_plan( $plan ) {
		$counts = array();
		$items  = array();
		foreach ( $this->posts as $source_id => $entry ) {
			$type   = $entry['post_type'];
			$action = $plan['posts'][ $source_id ]['action'];
			if ( ! isset( $counts[ $type ] ) ) {
				$counts[ $type ] = array(
					'create'    => 0,
					'copy'      => 0,
					'overwrite' => 0,
				);
			}
			++$counts[ $type ][ $action ];
			$items[] = array(
				'type'   => $type,
				'title'  => $entry['post_title'],
				'action' => $action,
			);
		}

		$targets = $this->get_link_targets();
		$required = array();
		foreach ( $this->required_refs as $source_id => $refs ) {
			if ( array_filter( wp_list_pluck( $refs, 'key' ) ) ) {
				$required[] = array(
					'type'  => $this->posts[ $source_id ]['post_type'],
					'title' => $this->posts[ $source_id ]['post_title'],
					'refs'  => $refs,
				);
			}
		}

		return array(
			'package_type' => (string) ( $this->manifest['package_type'] ?? '' ),
			'source'      => array(
				'site_url'       => $this->get_source_site(),
				'plugin_version' => (string) ( $this->manifest['plugin_version'] ?? '' ),
				'exported_at'    => (string) ( $this->manifest['exported_at'] ?? '' ),
				'same_site'      => $this->is_same_site(),
			),
			'counts'      => $counts,
			'items'       => $items,
			'terms'       => array(
				'reuse'  => count( array_filter( $plan['terms'] ) ),
				'create' => count( $plan['terms'] ) - count( array_filter( $plan['terms'] ) ),
			),
			'media'       => array(
				'reuse'  => count( array_filter( $plan['media'] ) ),
				'create' => count( $plan['media'] ) - count( array_filter( $plan['media'] ) ),
			),
			'data_count'  => count( array_unique( wp_list_pluck( $this->content['data_files'], 'file' ) ) ),
			'links'       => array_values( $targets ),
			'tabs'        => $this->get_tab_targets(),
			'required'    => $required,
			'options'     => $this->get_link_options( array_unique( wp_list_pluck( $targets, 'type' ) ) ),
			'warnings'    => $this->get_package_warnings(),
		);
	}

	/**
	 * Warnings about the package itself.
	 *
	 * @return string[]
	 */
	private function get_package_warnings() {
		// Problems a bulk import found in its spreadsheets.
		$warnings = array_values( array_filter( (array) ( $this->content['warnings'] ?? array() ), 'is_string' ) );
		$unknown = $this->get_unknown_fields();
		if ( (int) $this->manifest['schema_version'] > Graphic_Data_Transfer_Schema::SCHEMA_VERSION ) {
			$warnings[] = sprintf(
				'This package was made by a newer version of Graphic Data (%s). Fields this version does not have will be skipped%s.',
				$this->manifest['plugin_version'] ?? '?',
				$unknown ? ': ' . $unknown : ''
			);
		} elseif ( $unknown ) {
			$warnings[] = 'These fields in the package are not used by Graphic Data and will be skipped: ' . $unknown . '.';
		}
		return $warnings;
	}

	/**
	 * Package fields that this version does not import, as text for a
	 * warning (for example "Figure: figure_new, figure_other; Scene: x"), or
	 * '' if there are none.
	 *
	 * @return string
	 */
	private function get_unknown_fields() {
		$unknown = array();
		foreach ( $this->content['posts'] as $entry ) {
			$type  = $entry['post_type'];
			$known = Graphic_Data_Transfer_Schema::get_meta_keys( $type );
			foreach ( array_keys( (array) ( $entry['meta'] ?? array() ) ) as $key ) {
				if ( ! in_array( (string) $key, $known, true ) ) {
					$unknown[ ucfirst( $type ) ][ (string) $key ] = true;
				}
			}
		}
		$known = Graphic_Data_Transfer_Schema::get_term_meta_keys();
		foreach ( $this->content['terms'] as $term ) {
			foreach ( array_keys( (array) ( $term['meta'] ?? array() ) ) as $key ) {
				if ( ! in_array( (string) $key, $known, true ) ) {
					$unknown['Instance Type'][ (string) $key ] = true;
				}
			}
		}

		$parts = array();
		foreach ( $unknown as $label => $keys ) {
			$parts[] = $label . ': ' . implode( ', ', array_keys( $keys ) );
		}
		return implode( '; ', $parts );
	}

	// ---------------------------------------------------------------------
	// Links to content outside the package
	// ---------------------------------------------------------------------

	/**
	 * Every link from a package post to content outside the package, each of
	 * which the user points at a post on this site (or leaves empty).
	 *
	 * A target is keyed "<type>:<source ID>", so every post linking to the
	 * same source post follows one choice. A required parent that was not
	 * set on the source site gets its own target, "empty:<post>:<meta key>",
	 * so it can be chosen too, unless the post's higher parent is in the
	 * package (that parent will be new, so nothing here can belong to it).
	 *
	 * Required parents form a chain (Instance, then Scene, then Modal), and
	 * each target records the target above it as `parent` so the choices on
	 * offer can be narrowed to what belongs to the chosen parent.
	 *
	 * Also fills $required_refs: for each post with required parents, one
	 * entry per parent whose `key` is the target key, '' when the parent is
	 * in the package, or 'none' when it is missing and cannot be chosen.
	 *
	 * @return array<string, array> Target key => key, type, source_id,
	 *         title, required, parent, used_by and suggested (post ID or 0).
	 */
	private function get_link_targets() {
		if ( null !== $this->targets ) {
			return $this->targets;
		}
		$this->targets       = array();
		$this->required_refs = array();

		foreach ( $this->posts as $source_id => $entry ) {
			$required = Graphic_Data_Transfer_Schema::get_required_references( $entry['post_type'] );

			// '' at the top of the chain; null once a parent is in the package.
			$parent = '';
			foreach ( $required as $key => $target_type ) {
				$value = $entry['meta'][ $key ] ?? '';
				if ( self::is_id( $value ) && $this->is_package_post( (int) $value, $target_type ) ) {
					$this->required_refs[ $source_id ][] = array(
						'type' => $target_type,
						'key'  => '',
					);
					$parent                              = null;
					continue;
				}
				if ( ! self::is_id( $value ) && null === $parent ) {
					$this->required_refs[ $source_id ][] = array(
						'type' => $target_type,
						'key'  => 'none',
					);
					continue;
				}
				$target_key = self::is_id( $value ) ? $target_type . ':' . (int) $value : 'empty:' . $source_id . ':' . $key;
				$this->add_link_target( $target_key, $target_type, self::is_id( $value ) ? (int) $value : 0, $entry, $key, true, (string) $parent );
				$this->required_refs[ $source_id ][] = array(
					'type' => $target_type,
					'key'  => $target_key,
				);
				$parent                              = $target_key;
			}

			foreach ( Graphic_Data_Transfer_Schema::get_post_references( $entry['post_type'] ) as $key => $target_type ) {
				$value = $entry['meta'][ $key ] ?? '';
				if ( ! isset( $required[ $key ] ) && self::is_id( $value ) && ! $this->is_package_post( (int) $value, $target_type ) ) {
					$this->add_link_target( $target_type . ':' . (int) $value, $target_type, (int) $value, $entry, $key, false, '' );
				}
			}

			if ( has_blocks( $entry['post_content'] ) ) {
				$this->walk_block_references(
					parse_blocks( $entry['post_content'] ),
					function ( $block, $attr, $value, $target_type ) use ( $entry ) {
						if ( ! $this->is_package_post( (int) $value, $target_type ) ) {
							$this->add_link_target( $target_type . ':' . (int) $value, $target_type, (int) $value, $entry, $block . ' → ' . $attr, false, '' );
						}
						return $value;
					}
				);
			}
		}

		// Parents first, so they are listed (and chosen) before their children.
		$order = array_flip( array( 'instance', 'scene', 'modal', 'figure', 'page' ) );
		uasort(
			$this->targets,
			function ( $a, $b ) use ( $order ) {
				return $order[ $a['type'] ] <=> $order[ $b['type'] ];
			}
		);
		return $this->targets;
	}

	/**
	 * Add a link target, or record another use of an existing one.
	 *
	 * @param string $key         Target key.
	 * @param string $type        Target post type.
	 * @param int    $source_id   Source target ID (0 for an unset parent).
	 * @param array  $entry       Package post holding the link.
	 * @param string $field       Meta key or block attribute.
	 * @param bool   $required    Whether the link is a required parent.
	 * @param string $parent      Key of the parent target, or ''.
	 * @return void
	 */
	private function add_link_target( $key, $type, $source_id, $entry, $field, $required, $parent ) {
		if ( ! isset( $this->targets[ $key ] ) ) {
			$info                  = $this->get_reference_info( $source_id );
			$this->targets[ $key ] = array(
				'key'       => $key,
				'type'      => $type,
				'source_id' => $source_id,
				'title'     => $info['title'],
				'required'  => false,
				'parent'    => '',
				'used_by'   => array(),
				'suggested' => $source_id ? $this->suggest_link( $type, $source_id, $info['slug'] ) : 0,
			);
			// Bulk imports name the existing content they link to.
			if ( isset( $this->content['local_links'][ $key ] ) ) {
				$this->targets[ $key ]['suggested'] = (int) $this->content['local_links'][ $key ];
			}
		}
		$this->targets[ $key ]['required'] = $this->targets[ $key ]['required'] || $required;
		if ( '' === $this->targets[ $key ]['parent'] ) {
			$this->targets[ $key ]['parent'] = $parent;
		}
		$this->targets[ $key ]['used_by'][] = array(
			'from_type'  => $entry['post_type'],
			'from_title' => $entry['post_title'],
			'field'      => $field,
		);
	}

	/**
	 * Figures whose Modal is outside the package: once the Modal is chosen,
	 * the user picks which of its tabs the Figure goes in.
	 *
	 * @return array[] Figure source ID, title, its tab on the source site and
	 *                 the key of its Modal's target.
	 */
	private function get_tab_targets() {
		$tabs = array();
		foreach ( $this->required_refs as $source_id => $refs ) {
			if ( 'figure' !== $this->posts[ $source_id ]['post_type'] ) {
				continue;
			}
			foreach ( $refs as $ref ) {
				if ( 'modal' === $ref['type'] && isset( $this->targets[ $ref['key'] ] ) ) {
					$tabs[] = array(
						'figure' => (int) $source_id,
						'title'  => $this->posts[ $source_id ]['post_title'],
						'tab'    => (int) ( $this->posts[ $source_id ]['meta']['figure_tab'] ?? 0 ),
						'modal'  => $ref['key'],
					);
				}
			}
		}
		return $tabs;
	}

	/**
	 * The posts on this site that links can point at, by type. Scenes,
	 * Modals and Figures carry their Instance (and Scene) so the choices can
	 * be narrowed; Modals also carry their tabs.
	 *
	 * @param string[] $types Post types that are linked to.
	 * @return array<string, array[]>
	 */
	private function get_link_options( $types ) {
		if ( array_intersect( $types, array( 'scene', 'modal', 'figure' ) ) ) {
			$types[] = 'instance';
		}
		$options = array();
		foreach ( array_unique( $types ) as $type ) {
			$options[ $type ] = array();
			$posts            = get_posts(
				array(
					'post_type'        => $type,
					'post_status'      => Graphic_Data_Transfer_Schema::get_exportable_statuses(),
					'posts_per_page'   => -1,
					'orderby'          => 'title',
					'order'            => 'ASC',
					'suppress_filters' => true,
				)
			);
			foreach ( $posts as $post ) {
				$option = array(
					'id'    => (int) $post->ID,
					'title' => $this->get_option_label( $post ),
				);
				if ( 'scene' === $type || 'modal' === $type || 'figure' === $type ) {
					$option['instance'] = (int) get_post_meta( $post->ID, Graphic_Data_Transfer_Schema::get_instance_meta_key( $type ), true );
				}
				if ( 'modal' === $type ) {
					$option['scene'] = (int) get_post_meta( $post->ID, 'modal_scene', true );
					// Figures can only go in Modals whose icon opens a modal window.
					$option['opens_modal'] = 'Modal' === get_post_meta( $post->ID, 'icon_function', true );
					$option['tabs']        = array();
					for ( $i = 1; $i <= 6; $i++ ) {
						$tab_title = (string) get_post_meta( $post->ID, 'modal_tab_title' . $i, true );
						if ( '' !== $tab_title ) {
							$option['tabs'][] = array(
								'number' => $i,
								'title'  => $tab_title,
							);
						}
					}
				}
				$options[ $type ][] = $option;
			}
		}
		return $options;
	}

	/**
	 * A post's title for a link choice, noting when it is not shown on the
	 * site.
	 *
	 * @param WP_Post $post Post.
	 * @return string
	 */
	private function get_option_label( $post ) {
		$title      = '' === $post->post_title ? '(no title)' : $post->post_title;
		$status_key = Graphic_Data_Transfer_Schema::get_publication_meta_key( $post->post_type );
		$status     = $status_key ? (string) get_post_meta( $post->ID, $status_key, true ) : $post->post_status;
		$shown      = $status_key ? in_array( strtolower( $status ), array( 'published', 'publish' ), true ) : 'publish' === $status;
		return $shown || '' === $status ? $title : $title . ' (' . ucfirst( $status ) . ')';
	}

	/**
	 * Validate and save the user's link and tab choices. A choice that is
	 * not given takes the suggestion.
	 *
	 * @param array $choices 'links' and 'tabs'; see run_step().
	 * @return true|WP_Error
	 */
	private function set_choices( $choices ) {
		$links = isset( $choices['links'] ) && is_array( $choices['links'] ) ? $choices['links'] : array();
		$tabs  = isset( $choices['tabs'] ) && is_array( $choices['tabs'] ) ? $choices['tabs'] : array();

		$this->job['links'] = array();
		foreach ( $this->get_link_targets() as $key => $target ) {
			$post_id = array_key_exists( $key, $links ) ? absint( $links[ $key ] ) : $target['suggested'];
			if ( $post_id && ( get_post_type( $post_id ) !== $target['type'] || ! in_array( get_post_status( $post_id ), Graphic_Data_Transfer_Schema::get_exportable_statuses(), true ) ) ) {
				return new WP_Error( 'graphic_data_transfer_choice', 'One of the chosen links points at content that no longer exists. Please check the package again.' );
			}
			$this->job['links'][ $key ] = $post_id;
		}

		$this->job['tabs'] = array();
		foreach ( $this->get_tab_targets() as $tab_target ) {
			$modal_id = $this->job['links'][ $tab_target['modal'] ];
			if ( ! $modal_id ) {
				continue;
			}
			$tab = isset( $tabs[ $tab_target['figure'] ] ) ? absint( $tabs[ $tab_target['figure'] ] ) : $tab_target['tab'];
			if ( '' === (string) get_post_meta( $modal_id, 'modal_tab_title' . $tab, true ) ) {
				// Not a tab of the chosen Modal: use its first tab.
				$tab = 0;
				for ( $i = 1; $i <= 6 && ! $tab; $i++ ) {
					$tab = '' !== (string) get_post_meta( $modal_id, 'modal_tab_title' . $i, true ) ? $i : 0;
				}
			}
			if ( $tab ) {
				$this->job['tabs'][ $tab_target['figure'] ] = $tab;
			}
		}
		return true;
	}

	/**
	 * Title and slug of a source post that the package links to, as
	 * recorded by the exporter.
	 *
	 * @param int $source_id Source post ID.
	 * @return array{title: string, slug: string}
	 */
	private function get_reference_info( $source_id ) {
		if ( null === $this->reference_info ) {
			$this->reference_info = array();
			foreach ( $this->content['references'] ?? array() as $reference ) {
				$this->reference_info[ (int) $reference['target_id'] ] = array(
					'title' => (string) ( $reference['target_title'] ?? '' ),
					'slug'  => (string) ( $reference['target_slug'] ?? '' ),
				);
			}
		}
		return $this->reference_info[ $source_id ] ?? array(
			'title' => '',
			'slug'  => '',
		);
	}

	/**
	 * Suggest a post on this site for a link: the same post (when this is
	 * the source site), an earlier import of it, or a post of the same type
	 * with the same slug.
	 *
	 * @param string $type      Target post type.
	 * @param int    $source_id Source target ID.
	 * @param string $slug      Source target slug.
	 * @return int Post ID, or 0.
	 */
	private function suggest_link( $type, $source_id, $slug ) {
		$found = $this->find_post_by_source( $type, $source_id );
		return $found ? $found : $this->find_post_by_slug( $type, $slug );
	}

	/**
	 * Whether a source post ID is a package post of the given type.
	 *
	 * @param int    $source_id Source post ID.
	 * @param string $type      Post type.
	 * @return bool
	 */
	private function is_package_post( $source_id, $type ) {
		return isset( $this->posts[ $source_id ] ) && $type === $this->posts[ $source_id ]['post_type'];
	}

	// ---------------------------------------------------------------------
	// Matching content on this site
	// ---------------------------------------------------------------------

	/**
	 * Find a post on this site that is the same as a package post: the
	 * original (when importing into the source site), an earlier import of
	 * it, or a post of the same type with the same slug.
	 *
	 * @param string $post_type Post type.
	 * @param int    $source_id Source post ID.
	 * @param string $slug      Source slug.
	 * @return int Post ID, or 0.
	 */
	private function find_existing_post( $post_type, $source_id, $slug ) {
		$found = $this->find_post_by_source( $post_type, $source_id );
		return $found ? $found : $this->find_post_by_slug( $post_type, $slug );
	}

	/**
	 * Find a post of a type by slug.
	 *
	 * @param string $post_type Post type.
	 * @param string $slug      Slug.
	 * @return int Post ID, or 0.
	 */
	private function find_post_by_slug( $post_type, $slug ) {
		if ( '' === (string) $slug ) {
			return 0;
		}
		$posts = get_posts(
			array(
				'post_type'        => $post_type,
				'name'             => $slug,
				'post_status'      => Graphic_Data_Transfer_Schema::get_exportable_statuses(),
				'posts_per_page'   => 1,
				'fields'           => 'ids',
				'suppress_filters' => true,
			)
		);
		return $posts ? (int) $posts[0] : 0;
	}

	/**
	 * Find the post on this site that a source post ID refers to: the
	 * original itself when this is the source site, or an earlier import.
	 *
	 * @param string $post_type Post type.
	 * @param int    $source_id Source post ID.
	 * @return int Post ID, or 0.
	 */
	private function find_post_by_source( $post_type, $source_id ) {
		if ( $this->is_same_site() ) {
			$post = get_post( $source_id );
			if ( $post && $post_type === $post->post_type && in_array( $post->post_status, Graphic_Data_Transfer_Schema::get_exportable_statuses(), true ) ) {
				return (int) $post->ID;
			}
		}
		$posts = get_posts(
			array(
				'post_type'        => $post_type,
				'post_status'      => Graphic_Data_Transfer_Schema::get_exportable_statuses(),
				'meta_key'         => Graphic_Data_Transfer_Schema::SOURCE_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value'       => $this->get_source_key( $source_id ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				'posts_per_page'   => 1,
				'fields'           => 'ids',
				'orderby'          => 'ID',
				'order'            => 'DESC',
				'suppress_filters' => true,
			)
		);
		return $posts ? (int) $posts[0] : 0;
	}

	/**
	 * The existing About post, if there is one.
	 *
	 * @return int Post ID, or 0.
	 */
	private function find_about() {
		$posts = get_posts(
			array(
				'post_type'        => 'about',
				'post_status'      => Graphic_Data_Transfer_Schema::get_exportable_statuses(),
				'posts_per_page'   => 1,
				'fields'           => 'ids',
				'orderby'          => 'ID',
				'order'            => 'ASC',
				'suppress_filters' => true,
			)
		);
		return $posts ? (int) $posts[0] : 0;
	}

	/**
	 * Resolve a reference to a source post: the imported copy of a package
	 * post, otherwise the post the user chose for it.
	 *
	 * @param int    $source_id   Source post ID.
	 * @param string $target_type Post type the reference points at.
	 * @return int Post ID on this site, or 0 to leave the reference empty.
	 */
	private function resolve_post( $source_id, $target_type ) {
		if ( $this->is_package_post( $source_id, $target_type ) ) {
			return $this->id_map[ $source_id ] ?? 0;
		}
		return (int) ( $this->job['links'][ $target_type . ':' . $source_id ] ?? 0 );
	}

	/**
	 * Find an attachment (or uploads file) on this site identical to a
	 * package media file, so it is not uploaded twice.
	 *
	 * @param array $media Package media entry.
	 * @return int|string Attachment ID, uploads-relative path for a plain
	 *                    file, or 0.
	 */
	private function find_existing_media( $media ) {
		$checksum = $this->get_checksum( $media['file'] );

		if ( empty( $media['source_attachment_id'] ) ) {
			$relative = $this->get_plain_media_path( $media['file'] );
			$path     = $relative ? trailingslashit( wp_get_upload_dir()['basedir'] ) . $relative : '';
			return $path && is_file( $path ) && hash_equals( $checksum, hash_file( 'sha256', $path ) ) ? $relative : 0;
		}

		$candidates = array();
		if ( $this->is_same_site() ) {
			$candidates[] = (int) $media['source_attachment_id'];
		}
		$candidates = array_merge(
			$candidates,
			get_posts(
				array(
					'post_type'        => 'attachment',
					'post_status'      => 'inherit',
					'meta_key'         => Graphic_Data_Transfer_Schema::SOURCE_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
					'meta_value'       => $this->get_source_key( 'a' . $media['source_attachment_id'] ), // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
					'posts_per_page'   => 5,
					'fields'           => 'ids',
					'suppress_filters' => true,
				)
			)
		);
		foreach ( $candidates as $attachment_id ) {
			if ( 'attachment' !== get_post_type( $attachment_id ) ) {
				continue;
			}
			$path = function_exists( 'wp_get_original_image_path' ) ? wp_get_original_image_path( $attachment_id ) : false;
			if ( ! $path || ! is_file( $path ) ) {
				$path = get_attached_file( $attachment_id );
			}
			if ( $path && is_file( $path ) && hash_equals( $checksum, hash_file( 'sha256', $path ) ) ) {
				return (int) $attachment_id;
			}
		}
		return 0;
	}

	/**
	 * Uploads-relative path of a plain (non-library) media file, with each
	 * part of the path made safe.
	 *
	 * @param string $file Path inside the zip (media/files/...).
	 * @return string Relative path, or '' if it is not a plain media file.
	 */
	private function get_plain_media_path( $file ) {
		if ( 0 !== strpos( $file, 'media/files/' ) ) {
			return '';
		}
		$parts = array();
		foreach ( explode( '/', substr( $file, strlen( 'media/files/' ) ) ) as $part ) {
			$part = sanitize_file_name( $part );
			if ( '' === $part || '.' === $part[0] ) {
				return '';
			}
			$parts[] = $part;
		}
		return implode( '/', $parts );
	}

	// ---------------------------------------------------------------------
	// Import steps
	// ---------------------------------------------------------------------

	/**
	 * Import media files until the time budget runs out.
	 *
	 * @return void
	 */
	private function import_media_step() {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$start = microtime( true );
		foreach ( $this->content['media'] as $media ) {
			if ( isset( $this->job['media'][ $media['key'] ] ) ) {
				continue;
			}
			if ( microtime( true ) - $start > self::TIME_BUDGET ) {
				return;
			}
			$this->job['media'][ $media['key'] ] = $this->import_media( $media );
			$this->save_job();
		}
	}

	/**
	 * Import one media file and record its new URLs.
	 *
	 * @param array $media Package media entry.
	 * @return array{id: int, reused: bool, warning: string} Result.
	 */
	private function import_media( $media ) {
		$existing = $this->job['plan']['media'][ $media['key'] ] ?? 0;
		$uploads  = wp_get_upload_dir();

		// Plain file in the uploads folder, not in the Media Library.
		if ( empty( $media['source_attachment_id'] ) ) {
			$relative = $existing ? $existing : $this->get_plain_media_path( $media['file'] );
			if ( ! $relative || ! wp_check_filetype( $relative )['type'] ) {
				return $this->media_result( 0, false, sprintf( 'Skipped %s: this file type is not allowed.', wp_basename( $media['file'] ) ) );
			}
			if ( ! $existing ) {
				$dir = trailingslashit( $uploads['basedir'] ) . dirname( $relative );
				if ( ! wp_mkdir_p( $dir ) ) {
					return $this->media_result( 0, false, sprintf( 'Could not create a folder for %s.', wp_basename( $relative ) ) );
				}
				$name     = wp_unique_filename( $dir, wp_basename( $relative ) );
				$relative = ltrim( dirname( $relative ) . '/' . $name, './' );
				$path     = trailingslashit( $uploads['basedir'] ) . $relative;
				$this->extract_to( $media['file'], $path );
				$svg_error = $this->get_svg_error( $path );
				if ( $svg_error ) {
					wp_delete_file( $path );
					return $this->media_result( 0, false, $svg_error );
				}
				$this->record_batch_file( $path );
			}
			foreach ( array_keys( $media['source_urls'] ) as $url ) {
				$this->job['url_map'][ $url ] = trailingslashit( $uploads['baseurl'] ) . str_replace( '%2F', '/', rawurlencode( $relative ) );
			}
			return $this->media_result( 0, (bool) $existing, '' );
		}

		$attachment_id = (int) $existing;
		if ( ! $attachment_id ) {
			$attachment_id = $this->sideload( $media );
			if ( is_wp_error( $attachment_id ) ) {
				return $this->media_result( 0, false, $attachment_id->get_error_message() );
			}
		}

		foreach ( $media['source_urls'] as $url => $size ) {
			$src = 'full' === $size ? false : wp_get_attachment_image_src( $attachment_id, $size );
			$this->job['url_map'][ $url ] = $src ? $src[0] : wp_get_attachment_url( $attachment_id );
		}
		return $this->media_result( $attachment_id, (bool) $existing, '' );
	}

	/**
	 * Add a package file to the Media Library.
	 *
	 * @param array $media Package media entry.
	 * @return int|WP_Error Attachment ID.
	 */
	private function sideload( $media ) {
		$name = sanitize_file_name( wp_basename( $media['file'] ) );
		if ( ! wp_check_filetype( $name )['type'] ) {
			return new WP_Error( 'graphic_data_transfer_media', sprintf( 'Skipped %s: this file type is not allowed.', $name ) );
		}

		// Keep the real file name so type checks see the right extension.
		$tmp_dir = trailingslashit( $this->get_work_dir() ) . 'tmp-' . wp_generate_password( 8, false );
		wp_mkdir_p( $tmp_dir );
		$tmp = trailingslashit( $tmp_dir ) . $name;
		$this->extract_to( $media['file'], $tmp );

		$svg_error = $this->get_svg_error( $tmp );
		if ( $svg_error ) {
			wp_delete_file( $tmp );
			@rmdir( $tmp_dir ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
			return new WP_Error( 'graphic_data_transfer_media', $svg_error );
		}

		$attachment_id = media_handle_sideload(
			array(
				'name'     => $name,
				'tmp_name' => $tmp,
			),
			0,
			null,
			array(
				'post_title'   => (string) ( $media['title'] ?? '' ),
				'post_excerpt' => (string) ( $media['caption'] ?? '' ),
				'post_content' => (string) ( $media['description'] ?? '' ),
				'post_author'  => get_current_user_id(),
			)
		);
		if ( file_exists( $tmp ) ) {
			wp_delete_file( $tmp );
		}
		@rmdir( $tmp_dir ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_operations_rmdir

		if ( is_wp_error( $attachment_id ) ) {
			return new WP_Error( 'graphic_data_transfer_media', sprintf( 'Could not add %s to the Media Library: %s', $name, $attachment_id->get_error_message() ) );
		}

		if ( ! empty( $media['alt'] ) ) {
			update_post_meta( $attachment_id, '_wp_attachment_image_alt', wp_slash( (string) $media['alt'] ) );
		}
		update_post_meta( $attachment_id, Graphic_Data_Transfer_Schema::SOURCE_META_KEY, $this->get_source_key( 'a' . $media['source_attachment_id'] ) );
		update_post_meta( $attachment_id, Graphic_Data_Transfer_Schema::BATCH_META_KEY, $this->job['batch_id'] );
		return (int) $attachment_id;
	}

	/**
	 * Run an SVG through the plugin's SVG validator.
	 *
	 * @param string $path File path.
	 * @return string Error message, or '' if the file is not an SVG or is valid.
	 */
	private function get_svg_error( $path ) {
		if ( 'svg' !== strtolower( pathinfo( $path, PATHINFO_EXTENSION ) ) ) {
			return '';
		}
		$result = Graphic_Data_SVG_Validator::validate_svg_file( $path );
		return empty( $result['valid'] ) ? sprintf( 'Skipped %s: %s', wp_basename( $path ), $result['error'] ) : '';
	}

	/**
	 * Build a media result.
	 *
	 * @param int    $id      Attachment ID (0 for plain files or failures).
	 * @param bool   $reused  Whether an existing file was used.
	 * @param string $warning Problem, if any.
	 * @return array
	 */
	private function media_result( $id, $reused, $warning ) {
		return array(
			'id'      => (int) $id,
			'reused'  => $reused,
			'warning' => $warning,
		);
	}

	/**
	 * Import terms, posts, data files and references.
	 *
	 * @return void
	 * @throws RuntimeException When a post cannot be created.
	 */
	private function import_content() {
		$plan         = $this->job['plan'];
		$this->report = array(
			'batch_id'   => $this->job['batch_id'],
			'created'    => array(),
			'copies'     => array(),
			'unassigned' => array(),
			'linked'     => count( array_filter( $this->job['links'] ) ),
			'unlinked'   => array(),
			'cleared'    => array(),
			'about'      => '',
			'terms'      => array(
				'reuse'  => 0,
				'create' => 0,
			),
			'media'      => array(
				'reuse'  => 0,
				'create' => 0,
			),
			'data_count' => 0,
			'rebuild'    => array(),
			'warnings'   => $this->get_package_warnings(),
		);
		foreach ( $this->job['media'] as $result ) {
			if ( '' !== $result['warning'] ) {
				$this->report['warnings'][] = $result['warning'];
			} else {
				++$this->report['media'][ $result['reused'] ? 'reuse' : 'create' ];
			}
		}

		$this->import_terms();

		// Create every post first so that references can point at any of them.
		$order = array_flip( array_merge( Graphic_Data_Transfer_Schema::get_post_types(), array( 'page' ) ) );
		$posts = $this->posts;
		uasort(
			$posts,
			function ( $a, $b ) use ( $order ) {
				return $order[ $a['post_type'] ] <=> $order[ $b['post_type'] ];
			}
		);
		foreach ( $posts as $source_id => $entry ) {
			$this->id_map[ $source_id ] = $this->create_post( $entry, $plan['posts'][ $source_id ] );
		}

		$data_paths = $this->import_data_files();

		foreach ( $posts as $source_id => $entry ) {
			$this->finish_post( $source_id, $entry, $plan['posts'][ $source_id ], $data_paths[ $source_id ] ?? array() );
		}

		// Published Figures need their standalone HTML, which is built in the
		// browser once the import finishes (see Graphic_Data_Figure_Html_Rebuild).
		$figures = wp_list_pluck( wp_list_filter( $this->report['created'], array( 'type' => 'figure' ) ), 'id' );
		$this->report['rebuild'] = Graphic_Data_Figure_Html_Rebuild::enqueue( $figures );

		$this->report['warnings'] = array_values( array_unique( $this->report['warnings'] ) );
	}

	/**
	 * Reuse or create the package's Instance Type terms.
	 *
	 * @return void
	 * @throws RuntimeException When a term cannot be created.
	 */
	private function import_terms() {
		foreach ( $this->content['terms'] as $term ) {
			$source_id = (int) $term['source_id'];
			$existing  = get_term_by( 'slug', (string) $term['slug'], Graphic_Data_Transfer_Schema::INSTANCE_TYPE_TAXONOMY );
			if ( $existing ) {
				$this->term_map[ $source_id ] = (int) $existing->term_id;
				++$this->report['terms']['reuse'];
				continue;
			}

			$created = wp_insert_term(
				wp_slash( (string) $term['name'] ),
				Graphic_Data_Transfer_Schema::INSTANCE_TYPE_TAXONOMY,
				array(
					'slug'        => (string) $term['slug'],
					'description' => wp_slash( (string) ( $term['description'] ?? '' ) ),
				)
			);
			if ( is_wp_error( $created ) ) {
				self::fail( sprintf( 'Could not create the Instance Type "%s": %s', $term['name'], $created->get_error_message() ) );
			}
			$term_id = (int) $created['term_id'];
			add_term_meta( $term_id, Graphic_Data_Transfer_Schema::BATCH_META_KEY, $this->job['batch_id'] );
			add_term_meta( $term_id, Graphic_Data_Transfer_Schema::SOURCE_META_KEY, $this->get_source_key( 't' . $source_id ) );
			foreach ( Graphic_Data_Transfer_Schema::get_term_meta_keys() as $key ) {
				if ( isset( $term['meta'][ $key ] ) ) {
					update_term_meta( $term_id, $key, wp_slash( $term['meta'][ $key ] ) );
				}
			}
			$this->term_map[ $source_id ] = $term_id;
			++$this->report['terms']['create'];
		}
	}

	/**
	 * Create a post (or overwrite the About post) with its core fields.
	 * Meta and references are written by finish_post().
	 *
	 * @param array $entry Package post.
	 * @param array $plan  Planned action.
	 * @return int New post ID.
	 * @throws RuntimeException When the post cannot be saved.
	 */
	private function create_post( $entry, $plan ) {
		$postarr = array(
			'post_type'      => $entry['post_type'],
			'post_title'     => (string) $entry['post_title'],
			'post_name'      => (string) $entry['post_name'],
			'post_content'   => (string) $entry['post_content'],
			'post_excerpt'   => (string) $entry['post_excerpt'],
			'menu_order'     => (int) $entry['menu_order'],
			'comment_status' => (string) $entry['comment_status'],
			'ping_status'    => (string) $entry['ping_status'],
			'post_author'    => get_current_user_id(),
		);
		if ( $entry['post_date_gmt'] && '0000-00-00 00:00:00' !== $entry['post_date_gmt'] ) {
			$postarr['post_date_gmt'] = $entry['post_date_gmt'];
			$postarr['post_date']     = get_date_from_gmt( $entry['post_date_gmt'] );
		}

		if ( 'overwrite' === $plan['action'] ) {
			$this->backup_about( $plan['existing'] );
			// Replace the content but keep this site's About URL and date.
			unset( $postarr['post_name'], $postarr['post_date'], $postarr['post_date_gmt'] );
			$postarr['ID']          = $plan['existing'];
			$postarr['post_status'] = 'publish';
			$post_id                = wp_update_post( wp_slash( $postarr ), true );
		} else {
			$status                 = Graphic_Data_Transfer_Schema::get_import_status( $entry['post_type'], $entry['post_status'], 'copy' === $plan['action'] );
			$postarr['post_status'] = $status['post_status'];
			$post_id                = wp_insert_post( wp_slash( $postarr ), true );
		}

		if ( is_wp_error( $post_id ) || ! $post_id ) {
			self::fail(
				sprintf(
					'Could not save "%s": %s',
					$entry['post_title'],
					is_wp_error( $post_id ) ? $post_id->get_error_message() : 'unknown error'
				)
			);
		}

		if ( 'overwrite' !== $plan['action'] ) {
			update_post_meta( $post_id, Graphic_Data_Transfer_Schema::BATCH_META_KEY, $this->job['batch_id'] );
			update_post_meta( $post_id, Graphic_Data_Transfer_Schema::SOURCE_META_KEY, $this->get_source_key( $entry['source_id'] ) );
		}
		return (int) $post_id;
	}

	/**
	 * Copy figure data files into each new figure's data folder.
	 *
	 * @return array<int, array<string, string>> Source figure ID => meta key => new absolute path.
	 */
	private function import_data_files() {
		$paths   = array();
		$written = array();
		foreach ( $this->content['data_files'] as $data_file ) {
			$source_id = (int) $data_file['post'];
			$key       = (string) $data_file['field'];
			$basename  = wp_basename( (string) $data_file['file'] );
			if ( ! isset( $this->id_map[ $source_id ] ) || ! in_array( $key, Graphic_Data_Transfer_Schema::get_data_path_keys(), true ) ) {
				continue;
			}
			if ( '' === $basename || '.' === $basename[0] || ! in_array( strtolower( pathinfo( $basename, PATHINFO_EXTENSION ) ), Graphic_Data_Transfer_Schema::get_data_file_extensions(), true ) ) {
				$this->report['warnings'][] = sprintf( 'Skipped data file %s: this file type is not allowed.', $basename );
				continue;
			}

			$dir  = WP_CONTENT_DIR . '/data/figure_' . $this->id_map[ $source_id ];
			$path = $dir . '/' . $basename;
			if ( ! isset( $written[ $path ] ) ) {
				if ( ! wp_mkdir_p( $dir ) ) {
					self::fail( 'Could not create the figure data folder.' );
				}
				$this->extract_to( $data_file['file'], $path );
				$written[ $path ] = true;
				++$this->report['data_count'];
			}
			$paths[ $source_id ][ $key ] = $path;
		}
		return $paths;
	}

	/**
	 * Write a post's meta and fix every reference, URL and status.
	 *
	 * @param int   $source_id  Source post ID.
	 * @param array $entry      Package post.
	 * @param array $plan       Planned action.
	 * @param array $data_paths Meta key => new data file path, for figures.
	 * @return void
	 */
	private function finish_post( $source_id, $entry, $plan, $data_paths ) {
		$post_id = $this->id_map[ $source_id ];
		$type    = $entry['post_type'];
		$meta    = array_intersect_key( (array) $entry['meta'], array_flip( Graphic_Data_Transfer_Schema::get_meta_keys( $type ) ) );

		// Post references.
		foreach ( Graphic_Data_Transfer_Schema::get_post_references( $type ) as $key => $target_type ) {
			if ( ! isset( $meta[ $key ] ) || ! self::is_id( $meta[ $key ] ) ) {
				continue;
			}
			$target = $this->resolve_post( (int) $meta[ $key ], $target_type );
			if ( ! $target ) {
				$this->report['unlinked'][] = $this->describe_unlinked( $entry, $post_id, $key, $target_type, (int) $meta[ $key ] );
			}
			$meta[ $key ] = $target ? (string) $target : '';
		}

		// Required parents that were not set on the source site but were
		// chosen on import, and the Modal tab chosen for a Figure.
		foreach ( Graphic_Data_Transfer_Schema::get_required_references( $type ) as $key => $target_type ) {
			$chosen = (int) ( $this->job['links'][ 'empty:' . $source_id . ':' . $key ] ?? 0 );
			if ( $chosen ) {
				$meta[ $key ] = (string) $chosen;
			}
		}
		if ( isset( $this->job['tabs'][ $source_id ] ) ) {
			$meta['figure_tab'] = (string) $this->job['tabs'][ $source_id ];
		}

		// Term references.
		foreach ( Graphic_Data_Transfer_Schema::get_term_references( $type ) as $key => $taxonomy ) {
			if ( isset( $meta[ $key ] ) && self::is_id( $meta[ $key ] ) ) {
				$source_term  = (int) $meta[ $key ];
				$meta[ $key ] = isset( $this->term_map[ $source_term ] ) ? (string) $this->term_map[ $source_term ] : ( $this->is_same_site() && term_exists( $source_term, $taxonomy ) ? (string) $source_term : '' );
			}
		}

		// Figure data files and references to the figure's own data folder.
		if ( 'figure' === $type ) {
			foreach ( Graphic_Data_Transfer_Schema::get_data_path_keys() as $key ) {
				if ( isset( $meta[ $key ] ) && '' !== $meta[ $key ] ) {
					$meta[ $key ] = $data_paths[ $key ] ?? '';
				}
			}
			$meta = $this->rewrite_figure_id( $meta, (int) $source_id, $post_id );
		}

		// Unique values, such as instance_slug.
		foreach ( Graphic_Data_Transfer_Schema::get_unique_meta_keys( $type ) as $key ) {
			if ( isset( $meta[ $key ] ) && '' !== $meta[ $key ] ) {
				$meta[ $key ] = $this->get_unique_meta_value( $type, $key, (string) $meta[ $key ], $post_id );
			}
		}

		// Status: held copies and posts without their parents stay off the
		// site. References are remapped by now, so check the new IDs.
		$missing = array();
		foreach ( Graphic_Data_Transfer_Schema::get_required_references( $type ) as $key => $target_type ) {
			if ( empty( $meta[ $key ] ) || get_post_type( (int) $meta[ $key ] ) !== $target_type ) {
				$missing[] = $target_type;
			}
		}
		if ( 'overwrite' !== $plan['action'] ) {
			$status     = Graphic_Data_Transfer_Schema::get_import_status( $type, $entry['post_status'], 'copy' === $plan['action'] || $missing );
			$status_key = Graphic_Data_Transfer_Schema::get_publication_meta_key( $type );
			if ( $status_key && '' !== $status['publication_status'] ) {
				$meta[ $status_key ] = $status['publication_status'];
			}
		}

		// Media and site URLs, everywhere.
		$meta = $this->rewrite_urls( $meta );

		$this->write_meta( $post_id, $type, $meta, 'overwrite' === $plan['action'] );

		// Bulk-imported Interactive figures come with settings but no saved
		// figure; it is built in the browser along with their HTML.
		if ( 'figure' === $type && in_array( (int) $source_id, array_map( 'intval', (array) ( $this->content['render'] ?? array() ) ), true ) ) {
			update_post_meta( $post_id, Graphic_Data_Figure_Html_Rebuild::RENDER_META_KEY, '1' );
		}

		// Content: block references and URLs.
		$content = $entry['post_content'];
		if ( has_blocks( $content ) ) {
			$changed = false;
			$blocks  = $this->walk_block_references(
				parse_blocks( $content ),
				function ( $block, $attr, $value, $target_type ) use ( $entry, $post_id, &$changed ) {
					$target  = $this->resolve_post( (int) $value, $target_type );
					$changed = true;
					if ( ! $target ) {
						$this->report['cleared'][] = $this->describe_unlinked( $entry, $post_id, $block . ' → ' . $attr, $target_type, (int) $value );
					}
					return is_int( $value ) ? $target : (string) $target;
				}
			);
			if ( $changed ) {
				$content = serialize_blocks( $blocks );
			}
		}
		$content = $this->rewrite_urls( $content );
		$excerpt = $this->rewrite_urls( $entry['post_excerpt'] );
		if ( $content !== $entry['post_content'] || $excerpt !== $entry['post_excerpt'] ) {
			wp_update_post(
				wp_slash(
					array(
						'ID'           => $post_id,
						'post_content' => $content,
						'post_excerpt' => $excerpt,
					)
				)
			);
		}

		if ( 'page' === $type && '' !== $entry['page_template'] ) {
			if ( isset( wp_get_theme()->get_page_templates( null, 'page' )[ $entry['page_template'] ] ) ) {
				update_post_meta( $post_id, '_wp_page_template', $entry['page_template'] );
			} else {
				$this->report['warnings'][] = sprintf( 'The page template "%s" used by "%s" does not exist on this site.', $entry['page_template'], $entry['post_title'] );
			}
		}

		// Report.
		$item = array(
			'type'  => $type,
			'title' => $entry['post_title'],
			'id'    => $post_id,
			'edit'  => get_edit_post_link( $post_id, 'raw' ),
		);
		if ( 'overwrite' === $plan['action'] ) {
			$this->report['about'] = $item['edit'];
		} else {
			$this->report['created'][] = $item;
		}
		if ( 'copy' === $plan['action'] ) {
			$this->report['copies'][] = array_merge( $item, array( 'existing' => get_edit_post_link( $plan['existing'], 'raw' ) ) );
		}
		if ( $missing ) {
			$this->report['unassigned'][] = array_merge( $item, array( 'missing' => $missing ) );
		}
	}

	/**
	 * Save a post's meta. When overwriting (the About post), fields the
	 * package does not include are removed so the result matches the source.
	 *
	 * @param int    $post_id   Post ID.
	 * @param string $type      Post type.
	 * @param array  $meta      Meta key => value.
	 * @param bool   $overwrite Whether an existing post is being replaced.
	 * @return void
	 */
	private function write_meta( $post_id, $type, $meta, $overwrite ) {
		if ( $overwrite ) {
			foreach ( Graphic_Data_Transfer_Schema::get_meta_keys( $type ) as $key ) {
				if ( ! array_key_exists( $key, $meta ) ) {
					delete_post_meta( $post_id, $key );
				}
			}
		}
		foreach ( $meta as $key => $value ) {
			update_post_meta( $post_id, $key, wp_slash( $value ) );
		}
	}

	/**
	 * Describe a reference left empty, for the report.
	 *
	 * @param array  $entry       Package post holding the reference.
	 * @param int    $post_id     New post ID.
	 * @param string $field       Field or block attribute.
	 * @param string $target_type Target post type.
	 * @param int    $target_id   Source target ID.
	 * @return array
	 */
	private function describe_unlinked( $entry, $post_id, $field, $target_type, $target_id ) {
		$target_title = '';
		foreach ( $this->content['references'] ?? array() as $reference ) {
			if ( (int) $reference['target_id'] === $target_id && (int) $reference['post'] === (int) $entry['source_id'] ) {
				$target_title = (string) $reference['target_title'];
				break;
			}
		}
		return array(
			'from_type'    => $entry['post_type'],
			'from_title'   => $entry['post_title'],
			'edit'         => get_edit_post_link( $post_id, 'raw' ),
			'field'        => $field,
			'target_type'  => $target_type,
			'target_title' => $target_title,
		);
	}

	/**
	 * Call a function for every Graphic Data reference in a block tree and
	 * replace the attribute with its return value.
	 *
	 * @param array    $blocks   Parsed blocks.
	 * @param callable $callback Receives block name, attribute, value and
	 *                           target post type; returns the new value.
	 * @return array Blocks.
	 */
	private function walk_block_references( $blocks, $callback ) {
		$block_refs = Graphic_Data_Transfer_Schema::get_block_references();
		foreach ( $blocks as &$block ) {
			if ( isset( $block_refs[ $block['blockName'] ] ) ) {
				foreach ( $block_refs[ $block['blockName'] ] as $attr => $target_type ) {
					if ( isset( $block['attrs'][ $attr ] ) && self::is_id( $block['attrs'][ $attr ] ) ) {
						$block['attrs'][ $attr ] = $callback( $block['blockName'], $attr, $block['attrs'][ $attr ], $target_type );
					}
				}
			}
			if ( ! empty( $block['innerBlocks'] ) ) {
				$block['innerBlocks'] = $this->walk_block_references( $block['innerBlocks'], $callback );
			}
		}
		return $blocks;
	}

	/**
	 * Point a figure's own references (its data folder and the figureId in
	 * its saved rendering) at the new figure ID.
	 *
	 * @param mixed $value  Meta value or array of meta values.
	 * @param int   $old_id Source figure ID.
	 * @param int   $new_id New figure ID.
	 * @return mixed
	 */
	private function rewrite_figure_id( $value, $old_id, $new_id ) {
		if ( is_array( $value ) ) {
			foreach ( $value as $key => $item ) {
				$value[ $key ] = $this->rewrite_figure_id( $item, $old_id, $new_id );
			}
			return $value;
		}
		if ( ! is_string( $value ) || false === strpos( $value, (string) $old_id ) ) {
			return $value;
		}
		$value = str_replace(
			array( 'figure_' . $old_id . '/', 'figure_' . $old_id . '\/' ),
			array( 'figure_' . $new_id . '/', 'figure_' . $new_id . '\/' ),
			$value
		);
		return preg_replace( '/("figureId"\s*:\s*"?)' . $old_id . '(?!\d)/', '${1}' . $new_id, $value );
	}

	/**
	 * Replace source-site URLs (media, figure data and internal links) with
	 * their equivalents on this site.
	 *
	 * @param mixed $value String or array.
	 * @return mixed
	 */
	private function rewrite_urls( $value ) {
		if ( null === $this->url_map ) {
			$this->url_map = $this->get_url_map();
		}
		if ( is_array( $value ) ) {
			foreach ( $value as $key => $item ) {
				$value[ $key ] = $this->rewrite_urls( $item );
			}
			return $value;
		}
		return is_string( $value ) && '' !== $value && $this->url_map ? strtr( $value, $this->url_map ) : $value;
	}

	/**
	 * Source URL => new URL. strtr() replaces the longest match first, so
	 * media URLs win over the site URL they start with.
	 *
	 * @return array<string, string>
	 */
	private function get_url_map() {
		$map = array();
		foreach ( $this->job['url_map'] as $from => $to ) {
			$map[ $from ] = $to;
		}

		$source = $this->manifest['source'] ?? array();
		$pairs  = array(
			array( $source['data_url'] ?? '', content_url( 'data' ) ),
			array( $source['uploads_url'] ?? '', wp_get_upload_dir()['baseurl'] ),
			array( $source['home_url'] ?? '', home_url() ),
			array( $source['site_url'] ?? '', site_url() ),
		);
		foreach ( $pairs as $pair ) {
			list( $from, $to ) = array_map( 'untrailingslashit', $pair );
			if ( '' === $from || $from === $to ) {
				continue;
			}
			$host = preg_replace( '#^https?:#i', '', $from );
			foreach ( array( 'https:' . $host, 'http:' . $host ) as $variant ) {
				if ( ! isset( $map[ $variant ] ) ) {
					$map[ $variant ] = $to;
				}
			}
		}

		// Figure renderings refer to their data by path alone (/wp-content/data/...).
		$from_path = wp_parse_url( $source['data_url'] ?? '', PHP_URL_PATH );
		$to_path   = wp_parse_url( content_url( 'data' ), PHP_URL_PATH );
		if ( $from_path && $to_path && $from_path !== $to_path ) {
			$map[ '"' . untrailingslashit( $from_path ) . '/figure_' ] = '"' . untrailingslashit( $to_path ) . '/figure_';
		}

		// Values saved as JSON may escape slashes.
		foreach ( $map as $from => $to ) {
			$map[ str_replace( '/', '\/', $from ) ] = str_replace( '/', '\/', $to );
		}
		unset( $map[''] );
		return $map;
	}

	/**
	 * Make a meta value unique among posts of a type by adding -2, -3, ...
	 *
	 * @param string $type    Post type.
	 * @param string $key     Meta key.
	 * @param string $value   Wanted value.
	 * @param int    $post_id Post being saved.
	 * @return string
	 */
	private function get_unique_meta_value( $type, $key, $value, $post_id ) {
		global $wpdb;
		$candidate = $value;
		for ( $i = 2; $i < 1000; $i++ ) {
			// phpcs:ignore WordPress.DB.DirectDatabaseQuery.DirectQuery, WordPress.DB.DirectDatabaseQuery.NoCaching
			$taken = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT pm.post_id FROM $wpdb->postmeta pm INNER JOIN $wpdb->posts p ON p.ID = pm.post_id
					WHERE pm.meta_key = %s AND pm.meta_value = %s AND p.post_type = %s AND p.post_status <> 'trash' AND p.ID <> %d LIMIT 1",
					$key,
					$candidate,
					$type,
					$post_id
				)
			);
			if ( ! $taken ) {
				return $candidate;
			}
			$candidate = $value . '-' . $i;
		}
		return $candidate;
	}

	// ---------------------------------------------------------------------
	// Batches (import history and undo)
	// ---------------------------------------------------------------------

	/**
	 * Record the start of an import.
	 *
	 * @return string Batch ID.
	 */
	private function start_batch() {
		$batch_id = gmdate( 'YmdHis' ) . '-' . strtolower( wp_generate_password( 6, false ) );
		$batches  = get_option( self::BATCHES_OPTION, array() );

		$batches[ $batch_id ] = array(
			'id'           => $batch_id,
			'status'       => 'running',
			'started'      => time(),
			'user_id'      => get_current_user_id(),
			'source'       => $this->get_source_site(),
			'package_type' => (string) ( $this->manifest['package_type'] ?? '' ),
			'files'        => array(),
			'about_backup' => null,
			'report'       => null,
			'message'      => '',
		);

		// Keep the most recent imports only. Older ones can no longer be undone.
		if ( count( $batches ) > self::HISTORY_SIZE ) {
			$batches = array_slice( $batches, -self::HISTORY_SIZE, null, true );
		}
		update_option( self::BATCHES_OPTION, $batches, false );
		return $batch_id;
	}

	/**
	 * Update the current batch record.
	 *
	 * @param array $changes Fields to set.
	 * @return void
	 */
	private function update_batch( $changes ) {
		$batches  = get_option( self::BATCHES_OPTION, array() );
		$batch_id = $this->job['batch_id'];
		if ( isset( $batches[ $batch_id ] ) ) {
			$batches[ $batch_id ] = array_merge( $batches[ $batch_id ], $changes );
			update_option( self::BATCHES_OPTION, $batches, false );
		}
	}

	/**
	 * Remember a plain file written to uploads, so undo can remove it.
	 *
	 * @param string $path Absolute path.
	 * @return void
	 */
	private function record_batch_file( $path ) {
		$batches = get_option( self::BATCHES_OPTION, array() );
		$files   = $batches[ $this->job['batch_id'] ]['files'] ?? array();
		$files[] = $path;
		$this->update_batch( array( 'files' => $files ) );
	}

	/**
	 * Back up the About post before it is overwritten.
	 *
	 * @param int $about_id About post ID.
	 * @return void
	 */
	private function backup_about( $about_id ) {
		$post = get_post( $about_id );
		$meta = array();
		foreach ( Graphic_Data_Transfer_Schema::get_meta_keys( 'about' ) as $key ) {
			if ( metadata_exists( 'post', $about_id, $key ) ) {
				$meta[ $key ] = get_post_meta( $about_id, $key, true );
			}
		}
		$this->update_batch(
			array(
				'about_backup' => array(
					'ID'           => (int) $about_id,
					'post_title'   => $post->post_title,
					'post_content' => $post->post_content,
					'post_excerpt' => $post->post_excerpt,
					'post_status'  => $post->post_status,
					'meta'         => $meta,
				),
			)
		);
	}

	/**
	 * Mark the current batch as finished and save its report.
	 *
	 * @return void
	 */
	private function complete_batch() {
		$this->update_batch(
			array(
				'status'   => 'done',
				'finished' => time(),
				'report'   => $this->report,
			)
		);
	}

	/**
	 * Import history, most recent first.
	 *
	 * @return array[]
	 */
	public static function get_batches() {
		return array_reverse( get_option( self::BATCHES_OPTION, array() ) );
	}

	/**
	 * Remove everything an import created and restore the About post.
	 *
	 * @param string $batch_id Batch ID.
	 * @param string $message  Optional note saved with the batch.
	 * @return array|WP_Error Counts of removed items.
	 */
	public static function undo( $batch_id, $message = '' ) {
		$batches = get_option( self::BATCHES_OPTION, array() );
		if ( ! isset( $batches[ $batch_id ] ) || 'undone' === $batches[ $batch_id ]['status'] ) {
			return new WP_Error( 'graphic_data_transfer_batch', 'This import could not be found or has already been undone.' );
		}
		$batch   = $batches[ $batch_id ];
		$removed = array(
			'posts'       => 0,
			'attachments' => 0,
			'terms'       => 0,
		);

		$ids = get_posts(
			array(
				'post_type'        => array_merge( Graphic_Data_Transfer_Schema::get_post_types(), array( 'page' ) ),
				'post_status'      => 'any',
				'meta_key'         => Graphic_Data_Transfer_Schema::BATCH_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value'       => $batch_id, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				'posts_per_page'   => -1,
				'fields'           => 'ids',
				'suppress_filters' => true,
			)
		);
		$attachments = get_posts(
			array(
				'post_type'        => 'attachment',
				'post_status'      => 'inherit',
				'meta_key'         => Graphic_Data_Transfer_Schema::BATCH_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value'       => $batch_id, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				'posts_per_page'   => -1,
				'fields'           => 'ids',
				'suppress_filters' => true,
			)
		);
		foreach ( array_unique( array_merge( $ids, $attachments ) ) as $post_id ) {
			if ( 'attachment' === get_post_type( $post_id ) ) {
				wp_delete_attachment( $post_id, true );
				++$removed['attachments'];
				continue;
			}
			if ( 'figure' === get_post_type( $post_id ) ) {
				self::delete_folder( WP_CONTENT_DIR . '/data/figure_' . $post_id );
			}
			wp_delete_post( $post_id, true );
			++$removed['posts'];
		}

		$terms = get_terms(
			array(
				'taxonomy'   => Graphic_Data_Transfer_Schema::INSTANCE_TYPE_TAXONOMY,
				'hide_empty' => false,
				'fields'     => 'ids',
				'meta_key'   => Graphic_Data_Transfer_Schema::BATCH_META_KEY, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
				'meta_value' => $batch_id, // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
			)
		);
		foreach ( is_wp_error( $terms ) ? array() : $terms as $term_id ) {
			wp_delete_term( $term_id, Graphic_Data_Transfer_Schema::INSTANCE_TYPE_TAXONOMY );
			++$removed['terms'];
		}

		foreach ( $batch['files'] as $path ) {
			if ( is_file( $path ) ) {
				wp_delete_file( $path );
			}
		}

		if ( ! empty( $batch['about_backup'] ) && get_post( $batch['about_backup']['ID'] ) ) {
			$backup = $batch['about_backup'];
			wp_update_post(
				wp_slash(
					array(
						'ID'           => $backup['ID'],
						'post_title'   => $backup['post_title'],
						'post_content' => $backup['post_content'],
						'post_excerpt' => $backup['post_excerpt'],
						'post_status'  => $backup['post_status'],
					)
				)
			);
			foreach ( Graphic_Data_Transfer_Schema::get_meta_keys( 'about' ) as $key ) {
				if ( array_key_exists( $key, $backup['meta'] ) ) {
					update_post_meta( $backup['ID'], $key, wp_slash( $backup['meta'][ $key ] ) );
				} else {
					delete_post_meta( $backup['ID'], $key );
				}
			}
		}

		$batches                         = get_option( self::BATCHES_OPTION, array() );
		$batches[ $batch_id ]['status']  = 'undone';
		$batches[ $batch_id ]['undone']  = time();
		$batches[ $batch_id ]['message'] = $message;
		update_option( self::BATCHES_OPTION, $batches, false );

		return $removed;
	}

	// ---------------------------------------------------------------------
	// Helpers
	// ---------------------------------------------------------------------

	/**
	 * Progress for the browser.
	 *
	 * @param bool $done Whether the import has finished.
	 * @return array
	 */
	private function get_progress( $done ) {
		$total = count( $this->content['media'] ) + 1;
		return array(
			'done'     => $done,
			'progress' => $done ? $total : count( $this->job['media'] ),
			'total'    => $total,
			'step'     => $this->job['step'],
		);
	}

	/**
	 * Save the job state.
	 *
	 * @return void
	 */
	private function save_job() {
		update_option( self::JOB_OPTION_PREFIX . $this->job['token'], $this->job, false );
	}

	/**
	 * Delete the job and its uploaded package.
	 *
	 * @return void
	 */
	private function finish() {
		if ( $this->zip ) {
			$this->zip->close();
			$this->zip = null;
		}
		self::delete_job( $this->job['token'] );
	}

	/**
	 * Delete a job's state and folder.
	 *
	 * @param string $token Job token.
	 * @return void
	 */
	private static function delete_job( $token ) {
		delete_option( self::JOB_OPTION_PREFIX . $token );
		self::delete_folder( self::get_work_root() . $token );
		$jobs = get_option( self::JOBS_OPTION, array() );
		unset( $jobs[ $token ] );
		update_option( self::JOBS_OPTION, $jobs, false );
	}

	/**
	 * Delete jobs that were abandoned.
	 *
	 * @return void
	 */
	private static function delete_stale_jobs() {
		foreach ( get_option( self::JOBS_OPTION, array() ) as $token => $created ) {
			if ( time() - (int) $created > self::JOB_LIFETIME ) {
				self::delete_job( $token );
			}
		}
	}

	/**
	 * Folder that holds all import jobs, protected from direct access.
	 *
	 * @return string Path with trailing slash.
	 */
	private static function get_work_root() {
		$root = trailingslashit( wp_get_upload_dir()['basedir'] ) . self::WORK_FOLDER . '/';
		if ( ! is_dir( $root ) && wp_mkdir_p( $root ) ) {
			// phpcs:disable WordPress.WP.AlternativeFunctions.file_system_operations_file_put_contents
			file_put_contents( $root . 'index.php', "<?php\n// Silence is golden.\n" );
			file_put_contents( $root . '.htaccess', "Require all denied\nDeny from all\n" );
			// phpcs:enable
		}
		return $root;
	}

	/**
	 * This job's folder.
	 *
	 * @return string
	 */
	private function get_work_dir() {
		return self::get_work_root() . $this->job['token'];
	}

	/**
	 * Path of the uploaded package.
	 *
	 * @return string
	 */
	private function get_package_path() {
		return $this->get_work_dir() . '/package.zip';
	}

	/**
	 * Delete a folder and the files in it.
	 *
	 * @param string $dir Folder path.
	 * @return void
	 */
	private static function delete_folder( $dir ) {
		if ( ! is_dir( $dir ) ) {
			return;
		}
		$items = new RecursiveIteratorIterator(
			new RecursiveDirectoryIterator( $dir, FilesystemIterator::SKIP_DOTS ),
			RecursiveIteratorIterator::CHILD_FIRST
		);
		foreach ( $items as $item ) {
			if ( $item->isDir() ) {
				@rmdir( $item->getPathname() ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
			} else {
				wp_delete_file( $item->getPathname() );
			}
		}
		@rmdir( $dir ); // phpcs:ignore WordPress.PHP.NoSilencedErrors.Discouraged, WordPress.WP.AlternativeFunctions.file_system_operations_rmdir
	}

	/**
	 * Stop the import step. run_step() catches this, undoes the import and
	 * reports the message.
	 *
	 * @param string $message Plain-text message (shown with textContent).
	 * @return void
	 * @throws RuntimeException Always.
	 */
	private static function fail( $message ) {
		throw new RuntimeException( $message ); // phpcs:ignore WordPress.Security.EscapeOutput.ExceptionNotEscaped -- Returned as JSON and shown as plain text.
	}

	/**
	 * Whether a value is a positive whole number (a post or term ID).
	 *
	 * @param mixed $value Value.
	 * @return bool
	 */
	private static function is_id( $value ) {
		return is_scalar( $value ) && ctype_digit( (string) $value ) && (int) $value > 0;
	}
}
