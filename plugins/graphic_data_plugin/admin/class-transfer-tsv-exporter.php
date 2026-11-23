<?php
/**
 * Export to tab-delimited spreadsheets (TSV) for the Content Transfer tool.
 *
 * Writes the content that Graphic_Data_Transfer_Exporter collects as a bulk
 * import zip (see Graphic_Data_Transfer_Tsv): one TSV file per content type,
 * README.tsv, and media/ and data/ folders. The files can be edited in a
 * spreadsheet and uploaded again in the Import section.
 *
 * Each cell is written so that the bulk import reads back the value that
 * was exported:
 *   - Every row gets a ref (<type>-<source ID>, or type-<term ID> for
 *     Instance Types). Links to exported rows are ref:<ref>; links to other
 *     content are slug:<slug>, which also finds it on another site.
 *   - Images in the Media Library or uploads folder are written to media/;
 *     other image addresses are kept, and the import downloads them.
 *   - A figure's data file is written to data/: its CSV file when that
 *     converts to the JSON the figure uses, otherwise the JSON (or GeoJSON).
 *   - Backslashes in text cells are doubled, since the import reads \n, \t
 *     and \\ there as escapes.
 *
 * Spreadsheets carry less than a package. Pages and the About content are
 * left out, images inside formatted text are not included, an Interactive
 * figure's chart is rebuilt from its settings on import, and an import
 * creates new content rather than updating what was exported. The preview
 * lists what applies to the selection.
 *
 * @package Graphic_Data_Plugin
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __DIR__ ) . 'admin/class-transfer-exporter.php';
require_once plugin_dir_path( __DIR__ ) . 'admin/class-transfer-tsv.php';

/**
 * Class Graphic_Data_Transfer_Tsv_Exporter.
 *
 * @since 1.10.0
 */
class Graphic_Data_Transfer_Tsv_Exporter {

	/**
	 * Longest cell Excel can hold.
	 */
	const EXCEL_CELL_LIMIT = 32767;

	/**
	 * List at most this many cells that are too long for Excel.
	 */
	const MAX_LONG_CELLS = 10;

	/**
	 * Package exporter that collects the content.
	 *
	 * @var Graphic_Data_Transfer_Exporter
	 */
	private $exporter;

	/**
	 * Whether build() has run.
	 *
	 * @var bool
	 */
	private $built = false;

	/**
	 * Rows of each TSV file (column name => cell), by content type.
	 *
	 * @var array<string, array[]>
	 */
	private $rows = array();

	/**
	 * Media columns that have alt text or a caption, by content type.
	 *
	 * @var array<string, array<string, true>>
	 */
	private $media_extras = array();

	/**
	 * Files to add to the zip: zip path => local path.
	 *
	 * @var array<string, string>
	 */
	private $files = array();

	/**
	 * Ref of each exported post, by source ID.
	 *
	 * @var array<int, string>
	 */
	private $post_refs = array();

	/**
	 * Ref of each exported Instance Type, by term ID.
	 *
	 * @var array<int, string>
	 */
	private $term_refs = array();

	/**
	 * Media entry of each exported address.
	 *
	 * @var array<string, array>
	 */
	private $media_by_url = array();

	/**
	 * What build() collected (see Graphic_Data_Transfer_Exporter::get_collected()).
	 *
	 * @var array
	 */
	private $collected = array();

	/**
	 * Titles of the items whose formatted text links to files in uploads.
	 *
	 * @var string[]
	 */
	private $embedded_files = array();

	/**
	 * Cells too long for Excel: file, row and column.
	 *
	 * @var string[]
	 */
	private $long_cells = array();

	/**
	 * Problems the export is shown with.
	 *
	 * @var string[]
	 */
	private $warnings = array();

	/**
	 * Constructor.
	 *
	 * @param Graphic_Data_Transfer_Exporter $exporter Exporter for the selection.
	 */
	public function __construct( Graphic_Data_Transfer_Exporter $exporter ) {
		$this->exporter = $exporter;
	}

	/**
	 * Collect the content and turn it into rows.
	 *
	 * @return true|WP_Error
	 */
	public function build() {
		if ( $this->built ) {
			return true;
		}
		$result = $this->exporter->build();
		if ( is_wp_error( $result ) ) {
			return $result;
		}
		$this->collected = $this->exporter->get_collected();

		foreach ( $this->collected['media'] as $entry ) {
			foreach ( array_keys( $entry['source_urls'] ) as $url ) {
				$this->media_by_url[ $url ] = $entry;
			}
		}
		foreach ( $this->collected['terms'] as $term_id => $term ) {
			$this->term_refs[ $term_id ] = 'type-' . $term_id;
		}
		$skipped = array();
		foreach ( $this->collected['posts'] as $source_id => $entry ) {
			if ( isset( Graphic_Data_Transfer_Tsv::FILES[ $entry['post_type'] ] ) ) {
				$this->post_refs[ $source_id ] = $entry['post_type'] . '-' . $source_id;
			} else {
				$skipped[ $entry['post_type'] ] = ( $skipped[ $entry['post_type'] ] ?? 0 ) + 1;
			}
		}

		foreach ( $this->collected['terms'] as $term_id => $term ) {
			$this->add_row(
				'instance_type',
				array(
					'ref'                  => $this->term_refs[ $term_id ],
					'name'                 => self::escape( $term['name'] ),
					'slug'                 => $term['slug'],
					'description'          => self::escape( $term['description'] ),
					'instance_order'       => (string) ( $term['meta']['instance_order'] ?? '' ),
					'instance_navbar_name' => self::escape( (string) ( $term['meta']['instance_navbar_name'] ?? '' ) ),
				),
				$term['name']
			);
		}
		foreach ( $this->collected['posts'] as $source_id => $entry ) {
			if ( isset( $this->post_refs[ $source_id ] ) ) {
				$this->add_row( $entry['post_type'], $this->get_post_row( $source_id, $entry ), $entry['post_title'] );
			}
		}

		$this->add_warnings( $skipped );
		$this->built = true;
		return true;
	}

	/**
	 * What the spreadsheets will contain, for the preview: the package
	 * summary without the pages and About content, with this format's files
	 * and warnings.
	 *
	 * @return array
	 */
	public function get_summary() {
		$summary = $this->exporter->get_summary();
		$kept    = function ( $type ) {
			return isset( Graphic_Data_Transfer_Tsv::FILES[ $type ] );
		};

		foreach ( array_keys( $summary['counts'] ) as $type ) {
			if ( ! $kept( $type ) ) {
				$summary['counts'][ $type ] = 0;
			}
		}
		$summary['items']    = array_values(
			array_filter(
				$summary['items'],
				function ( $item ) use ( $kept ) {
					return $kept( $item['type'] );
				}
			)
		);
		$summary['external'] = array_values(
			array_filter(
				$summary['external'],
				function ( $reference ) use ( $kept ) {
					return $kept( $reference['from_type'] );
				}
			)
		);

		$sizes = array(
			'media' => array( 0, 0 ),
			'data'  => array( 0, 0 ),
		);
		foreach ( $this->files as $zip_name => $path ) {
			$folder              = strtok( $zip_name, '/' );
			$sizes[ $folder ][0] += 1;
			$sizes[ $folder ][1] += (int) filesize( $path );
		}
		$summary['media_count'] = $sizes['media'][0];
		$summary['media_size']  = size_format( $sizes['media'][1] );
		$summary['data_count']  = $sizes['data'][0];
		$summary['data_size']   = size_format( $sizes['data'][1] );

		$summary['format']   = 'tsv';
		$summary['warnings'] = array_values( array_unique( array_merge( $this->warnings, $summary['warnings'] ) ) );
		return $summary;
	}

	/**
	 * Write the zip: the TSV files (every content type, so that rows can be
	 * added to any of them), README.tsv, and the media and data files.
	 *
	 * @param string $zip_path Zip to create (overwritten).
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

		foreach ( Graphic_Data_Transfer_Tsv::FILES as $type => $file ) {
			$header = $this->get_header( $type );
			$table  = array( $header );
			foreach ( $this->rows[ $type ] ?? array() as $row ) {
				$cells = array();
				foreach ( $header as $name ) {
					$cells[] = $row[ $name ] ?? '';
				}
				$table[] = $cells;
			}
			// The byte order mark tells Excel the file is UTF-8.
			$zip->addFromString( $file, "\xEF\xBB\xBF" . Graphic_Data_Transfer_Tsv::to_tsv( $table ) );
		}
		$zip->addFromString( Graphic_Data_Transfer_Tsv::README_FILE, "\xEF\xBB\xBF" . Graphic_Data_Transfer_Tsv::to_tsv( Graphic_Data_Transfer_Tsv::get_readme_rows() ) );
		$zip->addEmptyDir( 'media' );
		$zip->addEmptyDir( 'data' );
		foreach ( $this->files as $zip_name => $path ) {
			$zip->addFile( $path, $zip_name );
		}

		if ( ! $zip->close() ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'Could not finish writing the export file.' );
		}
		return true;
	}

	/**
	 * Suggested download file name, for example
	 * graphic-data-spreadsheets-instances-2026-11-21.zip.
	 *
	 * @return string
	 */
	public function get_file_name() {
		return preg_replace( '/^graphic-data-/', 'graphic-data-spreadsheets-', $this->exporter->get_file_name() );
	}

	// ---------------------------------------------------------------------
	// Rows
	// ---------------------------------------------------------------------

	/**
	 * Add a row, noting cells that are too long for Excel.
	 *
	 * @param string $type  Content type.
	 * @param array  $row   Cells by column name.
	 * @param string $title Title of the item, for messages.
	 * @return void
	 */
	private function add_row( $type, $row, $title ) {
		$this->rows[ $type ][] = $row;
		foreach ( $row as $name => $cell ) {
			if ( strlen( $cell ) > self::EXCEL_CELL_LIMIT && ( ! function_exists( 'mb_strlen' ) || mb_strlen( $cell ) > self::EXCEL_CELL_LIMIT ) ) {
				$this->long_cells[] = sprintf( '%s "%s" (%s)', Graphic_Data_Transfer_Tsv::FILES[ $type ], $title, $name );
			}
		}
	}

	/**
	 * Header row of a TSV file: the template's columns, with the alt text
	 * and caption columns of any image that has them.
	 *
	 * @param string $type Content type.
	 * @return string[]
	 */
	private function get_header( $type ) {
		$header = array();
		foreach ( array_keys( Graphic_Data_Transfer_Tsv::get_columns( $type ) ) as $name ) {
			$header[] = $name;
			if ( isset( $this->media_extras[ $type ][ $name ] ) ) {
				$header[] = $name . '_alt';
				$header[] = $name . '_caption';
			}
		}
		return $header;
	}

	/**
	 * Cells of a post's row.
	 *
	 * @param int   $source_id Post ID.
	 * @param array $entry     Post entry.
	 * @return array<string, string>
	 */
	private function get_post_row( $source_id, $entry ) {
		$type = $entry['post_type'];
		$row  = array();
		foreach ( Graphic_Data_Transfer_Tsv::get_columns( $type ) as $name => $column ) {
			if ( 'ref' === $column['kind'] ) {
				$row[ $name ] = $this->post_refs[ $source_id ];
				continue;
			}
			if ( 'title' === $column['kind'] ) {
				$row[ $name ] = self::escape( $entry['post_title'] );
				continue;
			}
			if ( 'slug' === $column['kind'] ) {
				$row[ $name ] = $entry['post_name'];
				continue;
			}

			$value = '' !== $column['parent'] ? ( $entry['meta'][ $column['parent'] ][ $name ] ?? '' ) : ( $entry['meta'][ $name ] ?? '' );
			$value = is_scalar( $value ) ? (string) $value : '';

			switch ( $column['kind'] ) {
				case 'post':
					$row[ $name ] = $this->get_link_cell( $value, $column['target'] );
					break;
				case 'term':
					$row[ $name ] = ctype_digit( $value ) && isset( $this->term_refs[ (int) $value ] ) ? 'ref:' . $this->term_refs[ (int) $value ] : '';
					break;
				case 'media':
					$row = array_merge( $row, $this->get_media_cells( $type, $name, $value ) );
					break;
				case 'data':
					$row[ $name ] = $this->get_data_cell( $source_id );
					break;
				case 'text':
				case 'html':
					$row[ $name ] = self::escape( $value );
					break;
				default:
					$row[ $name ] = $value;
			}
			if ( in_array( $column['kind'], array( 'text', 'html', 'code' ), true ) && preg_match( $this->get_uploads_url_pattern(), $value ) ) {
				$this->embedded_files[ $source_id ] = $entry['post_title'];
			}
		}
		return $row;
	}

	/**
	 * Link to another post: ref:<ref> if it is exported, slug:<slug> if it
	 * is not (so that the import can find it on this or another site).
	 *
	 * @param string $value       Stored post ID.
	 * @param string $target_type Post type linked to.
	 * @return string
	 */
	private function get_link_cell( $value, $target_type ) {
		$target_id = ctype_digit( $value ) ? (int) $value : 0;
		if ( ! $target_id ) {
			return '';
		}
		if ( isset( $this->post_refs[ $target_id ] ) && $target_type === $this->collected['posts'][ $target_id ]['post_type'] ) {
			return 'ref:' . $this->post_refs[ $target_id ];
		}
		$target = get_post( $target_id );
		if ( ! $target || $target_type !== $target->post_type || '' === $target->post_name || ! in_array( $target->post_status, Graphic_Data_Transfer_Schema::get_exportable_statuses(), true ) ) {
			return '';
		}
		return 'slug:' . $target->post_name;
	}

	/**
	 * Cells of an image: media/<file> for a file in the export (with its alt
	 * text and caption), otherwise the address as it is.
	 *
	 * @param string $type  Content type.
	 * @param string $name  Column name.
	 * @param string $value Stored address.
	 * @return array<string, string>
	 */
	private function get_media_cells( $type, $name, $value ) {
		$entry = $this->media_by_url[ $value ] ?? null;
		if ( '' === $value || ! $entry || ! isset( $this->collected['media_files'][ $entry['file'] ] ) ) {
			return array( $name => $value );
		}
		$this->files[ $entry['file'] ] = $this->collected['media_files'][ $entry['file'] ];

		$cells = array(
			$name              => $entry['file'],
			$name . '_alt'     => self::escape( (string) ( $entry['alt'] ?? '' ) ),
			$name . '_caption' => self::escape( (string) ( $entry['caption'] ?? '' ) ),
		);
		if ( '' !== $cells[ $name . '_alt' ] || '' !== $cells[ $name . '_caption' ] ) {
			$this->media_extras[ $type ][ $name ] = true;
		}
		return $cells;
	}

	/**
	 * A figure's data file: its GeoJSON file, its CSV file if that converts
	 * to exactly the JSON the figure uses (an older CSV may be left over
	 * from before a JSON file was uploaded), otherwise its JSON file.
	 *
	 * @param int $source_id Figure ID.
	 * @return string data/<path>, or '' if it has none.
	 */
	private function get_data_cell( $source_id ) {
		$files = array();
		foreach ( $this->collected['data_files'] as $data_file ) {
			if ( $source_id === $data_file['post'] ) {
				$files[ $data_file['field'] ] = $data_file;
			}
		}

		if ( isset( $files['uploaded_path_geojson'] ) ) {
			$file = $files['uploaded_path_geojson'];
		} elseif ( isset( $files['uploaded_path_csv'], $files['uploaded_path_json'] ) ) {
			// phpcs:disable WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents -- Local data files.
			$csv  = (string) file_get_contents( $files['uploaded_path_csv']['path'] );
			$json = (string) file_get_contents( $files['uploaded_path_json']['path'] );
			// phpcs:enable WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
			$csv  = 0 === strncmp( $csv, "\xEF\xBB\xBF", 3 ) ? substr( $csv, 3 ) : $csv;
			$file = trim( Graphic_Data_Transfer_Tsv::csv_to_json( $csv ) ) === trim( $json ) ? $files['uploaded_path_csv'] : $files['uploaded_path_json'];
		} elseif ( $files ) {
			$file = $files['uploaded_path_json'] ?? $files['uploaded_path_csv'];
		} else {
			return '';
		}
		$this->files[ $file['file'] ] = $file['path'];
		return $file['file'];
	}

	/**
	 * Double the backslashes in a text cell, which the import reads as
	 * escapes.
	 *
	 * @param string $value Text.
	 * @return string
	 */
	private static function escape( $value ) {
		return str_replace( '\\', '\\\\', (string) $value );
	}

	/**
	 * Regular expression matching addresses in this site's uploads folder.
	 *
	 * @return string
	 */
	private function get_uploads_url_pattern() {
		$base = preg_replace( '#^https?:#i', '', untrailingslashit( wp_get_upload_dir()['baseurl'] ) );
		return '#(?:https?:)?' . preg_quote( $base, '#' ) . '/#i';
	}

	// ---------------------------------------------------------------------
	// Warnings
	// ---------------------------------------------------------------------

	/**
	 * Warn about what these spreadsheets lose compared with a package.
	 *
	 * @param array<string, int> $skipped Items left out, by post type.
	 * @return void
	 */
	private function add_warnings( $skipped ) {
		if ( $skipped ) {
			$left_out = array();
			if ( ! empty( $skipped['page'] ) ) {
				$left_out[] = 1 === $skipped['page'] ? '1 page' : $skipped['page'] . ' pages';
			}
			if ( ! empty( $skipped['about'] ) ) {
				$left_out[] = 'the About content';
			}
			$this->warnings[] = sprintf( 'Spreadsheets cannot hold pages or the About content, so %s will not be included. Export a package to move them.', implode( ' and ', $left_out ) );
		}

		foreach ( $this->collected['posts'] as $source_id => $entry ) {
			if ( 'figure' !== $entry['post_type'] || 'Interactive' !== ( $entry['meta']['figure_path'] ?? '' ) ) {
				continue;
			}
			$settings   = Graphic_Data_Transfer_Tsv::parse_settings( (string) ( $entry['meta']['figure_interactive_arguments'] ?? '' ) );
			$graph_type = (string) ( $settings['graphType'] ?? '' );
			$problem    = '';
			if ( ! in_array( $graph_type, Graphic_Data_Transfer_Tsv::GRAPH_TYPES, true ) ) {
				$problem = '' === $graph_type ? 'it has no interactive settings' : sprintf( 'a bulk import cannot build its graph type (%s)', $graph_type );
			} elseif ( ! in_array( $graph_type, Graphic_Data_Transfer_Tsv::NO_DATA_GRAPH_TYPES, true ) && '' === $this->get_data_cell( $source_id ) ) {
				$problem = 'its data file is missing';
			}
			if ( '' !== $problem ) {
				$this->warnings[] = sprintf( 'The Interactive figure "%s" will be imported from the spreadsheets with its Status set to Draft, because %s.', $entry['post_title'], $problem );
			}
		}

		if ( $this->embedded_files ) {
			$this->warnings[] = sprintf(
				'Images and files linked inside the text of %s are not included in the spreadsheets; those links keep pointing to this site.',
				self::list_titles( $this->embedded_files )
			);
		}

		if ( $this->long_cells ) {
			$this->warnings[] = sprintf(
				'Some cells are longer than the %s characters that Excel can hold, so Excel would cut them short: %s. Edit these files in another program, such as Google Sheets or a text editor.',
				number_format_i18n( self::EXCEL_CELL_LIMIT ),
				implode( '; ', array_slice( $this->long_cells, 0, self::MAX_LONG_CELLS ) ) . ( count( $this->long_cells ) > self::MAX_LONG_CELLS ? '; …' : '' )
			);
		}
	}

	/**
	 * Quoted titles, shortened after five.
	 *
	 * @param string[] $titles Titles.
	 * @return string
	 */
	private static function list_titles( $titles ) {
		$quoted = array_map(
			function ( $title ) {
				return '"' . ( '' === $title ? '(no title)' : $title ) . '"';
			},
			array_values( $titles )
		);
		$count  = count( $quoted );
		if ( $count > 5 ) {
			return implode( ', ', array_slice( $quoted, 0, 5 ) ) . sprintf( ' and %d more', $count - 5 );
		}
		return $count > 1 ? implode( ', ', array_slice( $quoted, 0, -1 ) ) . ' and ' . end( $quoted ) : $quoted[0];
	}
}
