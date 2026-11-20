<?php
/**
 * Bulk import from tab-delimited spreadsheets (TSV) for the Content Transfer
 * tool.
 *
 * A bulk import is a zip holding one TSV file per content type
 * (instance_types.tsv, instances.tsv, scenes.tsv, modals.tsv, figures.tsv),
 * plus media/ and data/ folders for the files the rows refer to. Pages and
 * the About content are not part of a bulk import.
 *
 * The zip is converted into an ordinary Content Transfer package (see
 * Graphic_Data_Transfer_Exporter) and imported by
 * Graphic_Data_Transfer_Importer, so a bulk import is checked, linked,
 * undone and gets its figure HTML exactly like any other import.
 *
 * The columns are the fields of each content type's edit screen (from its
 * create_*_fields() definition), limited to the fields that the transfer
 * tool moves (Graphic_Data_Transfer_Schema::get_meta_keys()). Values are
 * cleaned the way the edit screen cleans them, blank cells take the field's
 * default, and fixed choices are checked. The template download and its
 * README.tsv are generated from the same definitions.
 *
 * Cells that point at other content:
 *   - Links to Instances, Scenes and Modals take ref:<name> (the `ref` of a
 *     row in this bulk import), or id:<ID> / slug:<slug> of existing content.
 *     Links to existing content are offered as the suggested link on the
 *     import screen.
 *   - Image cells take media/<file> (a file in the zip), an https:// address
 *     (downloaded) or attachment:<ID> (already in the Media Library).
 *   - figure_upload_file takes data/<file>: a CSV (converted to JSON as on
 *     the Figure edit screen), JSON or GeoJSON file.
 *   - figure_interactive_arguments takes an Interactive figure's settings as
 *     JSON (the edit screen's "Copy settings for bulk import" button). The
 *     settings are checked against the data; a figure whose settings cannot
 *     be used is imported with its Status set to Draft and listed. The saved
 *     figure is built in the browser after the import, like its HTML (see
 *     Graphic_Data_Figure_Html_Rebuild).
 *
 * @package Graphic_Data_Plugin
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

require_once plugin_dir_path( __DIR__ ) . 'admin/class-transfer-schema.php';

/**
 * Class Graphic_Data_Transfer_Tsv.
 *
 * @since 1.10.0
 */
class Graphic_Data_Transfer_Tsv {

	/**
	 * TSV file of each content type, in the order they are read.
	 */
	const FILES = array(
		'instance_type' => 'instance_types.tsv',
		'instance'      => 'instances.tsv',
		'scene'         => 'scenes.tsv',
		'modal'         => 'modals.tsv',
		'figure'        => 'figures.tsv',
	);

	/**
	 * Reference file in the template.
	 */
	const README_FILE = 'README.tsv';

	/**
	 * Package type recorded for a converted bulk import.
	 */
	const PACKAGE_TYPE = 'bulk';

	/**
	 * Start of the source "site" recorded for a converted bulk import. The
	 * rest is a hash of the uploaded zip, so importing the same zip again is
	 * recognised as importing copies.
	 */
	const SOURCE_PREFIX = 'bulk-import:';

	/**
	 * Rows are given source IDs from here up, so they never match the ID of
	 * existing content that the rows link to.
	 */
	const ID_OFFSET = 1000000000;

	/**
	 * Stand-in address for a media file until it is added to the Media
	 * Library; the importer replaces it with the new address.
	 */
	const MEDIA_PLACEHOLDER = 'https://graphic-data-bulk-import.invalid/media/';

	/**
	 * Stop listing problems after this many.
	 */
	const MAX_ERRORS = 200;

	/**
	 * Interactive figure types a bulk import can build.
	 */
	const GRAPH_TYPES = array(
		'Plotly bar graph',
		'Plotly line graph (time series)',
		'Tabulator table',
		'Leaflet map',
		'Image Carousel',
		'Image Comparison Slider',
	);

	/**
	 * Interactive figure types that have no data file.
	 */
	const NO_DATA_GRAPH_TYPES = array( 'Image Carousel', 'Image Comparison Slider' );

	/**
	 * Class holding each content type's field definitions.
	 */
	const FIELD_CLASSES = array(
		'instance' => array( 'Graphic_Data_Instance', 'includes/admin-instance.php' ),
		'scene'    => array( 'Graphic_Data_Scene', 'includes/admin-scene.php' ),
		'modal'    => array( 'Graphic_Data_Modal', 'includes/admin-modal.php' ),
		'figure'   => array( 'Graphic_Data_Figure', 'includes/admin-figure.php' ),
	);

	/**
	 * Fields that are generated rather than imported.
	 */
	const SKIPPED_FIELDS = array( 'figure_interactive_args_rendered' );

	/**
	 * Fields that cannot be left blank (the edit screens refuse to save
	 * without them).
	 */
	const REQUIRED_FIELDS = array(
		'instance' => array( 'instance_short_title', 'instance_slug' ),
	);

	/**
	 * Uploaded zip.
	 *
	 * @var ZipArchive|null
	 */
	private $zip = null;

	/**
	 * Folder inside the zip that holds the TSV files ('' or ending in /).
	 *
	 * @var string
	 */
	private $base = '';

	/**
	 * Folder for temporary files.
	 *
	 * @var string
	 */
	private $work_dir = '';

	/**
	 * Problems that stop the import.
	 *
	 * @var string[]
	 */
	private $errors = array();

	/**
	 * Problems the import is shown with.
	 *
	 * @var string[]
	 */
	private $warnings = array();

	/**
	 * Rows by content type: line (record number), source ID and cells.
	 *
	 * @var array<string, array[]>
	 */
	private $rows = array();

	/**
	 * Source ID of each row, by content type and ref.
	 *
	 * @var array<string, array<string, int>>
	 */
	private $refs = array();

	/**
	 * Next source ID.
	 *
	 * @var int
	 */
	private $next_id = self::ID_OFFSET;

	/**
	 * Package terms.
	 *
	 * @var array[]
	 */
	private $terms = array();

	/**
	 * Package posts.
	 *
	 * @var array[]
	 */
	private $posts = array();

	/**
	 * Links from package posts to existing content, with its title and slug.
	 *
	 * @var array[]
	 */
	private $references = array();

	/**
	 * Package media files.
	 *
	 * @var array[]
	 */
	private $media = array();

	/**
	 * Package figure data files.
	 *
	 * @var array[]
	 */
	private $data_files = array();

	/**
	 * Existing term ID => package source ID.
	 *
	 * @var array<int, int>
	 */
	private $existing_terms = array();

	/**
	 * Media source (zip path or URL) => placeholder address.
	 *
	 * @var array<string, string>
	 */
	private $media_sources = array();

	/**
	 * Links to existing content: target key => post ID.
	 *
	 * @var array<string, int>
	 */
	private $local_links = array();

	/**
	 * Source IDs of the Figures whose saved figure is built after import.
	 *
	 * @var int[]
	 */
	private $render = array();

	/**
	 * Files to write into the package: zip path => string content, or an
	 * array with the path of a local file.
	 *
	 * @var array<string, string|array{path: string}>
	 */
	private $files = array();

	/**
	 * Temporary files to delete.
	 *
	 * @var string[]
	 */
	private $temp_files = array();

	/**
	 * Column definitions, by content type.
	 *
	 * @var array<string, array>
	 */
	private static $columns = array();

	// ---------------------------------------------------------------------
	// Columns
	// ---------------------------------------------------------------------

	/**
	 * The columns of a content type's TSV file, in template order.
	 *
	 * Each column has a kind ('ref', 'title', 'slug', 'text', 'html', 'code',
	 * 'number', 'color', 'choice', 'post', 'term', 'tab', 'media', 'data' or
	 * 'settings'), a label, help text, whether it is required, its allowed
	 * values, its default, the post type it links to, the fieldset it
	 * belongs to and the edit screen's field definition.
	 *
	 * @param string $type Content type: a key of FILES.
	 * @return array<string, array>
	 */
	public static function get_columns( $type ) {
		if ( isset( self::$columns[ $type ] ) ) {
			return self::$columns[ $type ];
		}

		if ( 'instance_type' === $type ) {
			$columns = array(
				'ref'                  => self::column( 'ref', 'Ref', 'Your own short name for this row, for linking to it from instances.tsv as ref:<name>.' ),
				'name'                 => self::column( 'title', 'Name', 'Name of the Instance Type.', true ),
				'slug'                 => self::column( 'slug', 'Slug', 'An existing Instance Type with this slug is used instead of creating a new one. Blank: made from the name.' ),
				'description'          => self::column( 'text', 'Description', '' ),
				'instance_order'       => self::column( 'number', 'Order', 'Position of this type in the site navigation.' ),
				'instance_navbar_name' => self::column( 'text', 'Navigation bar name', 'Name of this type in the site navigation.' ),
			);
			self::$columns[ $type ] = $columns;
			return $columns;
		}

		$label   = ucfirst( $type );
		$columns = array(
			'ref'        => self::column( 'ref', 'Ref', sprintf( 'Your own short name for this row (letters, numbers, - and _), for linking to this %s from other rows as ref:<name>.', $label ) ),
			'post_title' => self::column( 'title', 'Title', sprintf( 'Title of the %s.', $label ), true ),
			'post_name'  => self::column( 'slug', 'Slug', sprintf( 'URL slug. Blank: made from the title. If a %s with this slug already exists, the row is imported as a copy with its Status set to Draft.', $label ) ),
		);

		$meta_keys = array_flip( Graphic_Data_Transfer_Schema::get_meta_keys( $type ) );
		foreach ( self::get_fields( $type ) as $field ) {
			$id = (string) ( $field['id'] ?? '' );
			if ( ! isset( $meta_keys[ $id ] ) || in_array( $id, self::SKIPPED_FIELDS, true ) ) {
				continue;
			}
			if ( 'fieldset' === ( $field['type'] ?? '' ) ) {
				$group = trim( wp_strip_all_tags( (string) ( $field['title'] ?? '' ) ), " *\t\n" );
				foreach ( (array) ( $field['fields'] ?? array() ) as $sub_field ) {
					$column           = self::describe_field( $sub_field, $type, $group . ': ' );
					$column['parent'] = $id;
					$columns[ (string) $sub_field['id'] ] = $column;
				}
				continue;
			}
			$columns[ $id ] = self::describe_field( $field, $type, '' );
		}

		self::$columns[ $type ] = $columns;
		return $columns;
	}

	/**
	 * A column definition.
	 *
	 * @param string $kind        Kind.
	 * @param string $label       Label.
	 * @param string $help        Help text.
	 * @param bool   $required    Whether the cell must be filled in.
	 * @return array
	 */
	private static function column( $kind, $label, $help, $required = false ) {
		return array(
			'kind'     => $kind,
			'label'    => $label,
			'help'     => $help,
			'required' => $required,
			'allowed'  => array(),
			'default'  => null,
			'target'   => '',
			'parent'   => '',
			'field'    => array(),
		);
	}

	/**
	 * Describe an edit screen field as a column.
	 *
	 * @param array  $field  Field definition.
	 * @param string $type   Content type.
	 * @param string $prefix Label prefix (the fieldset's title).
	 * @return array
	 */
	private static function describe_field( $field, $type, $prefix ) {
		$id         = (string) $field['id'];
		$field_type = (string) ( $field['type'] ?? 'text' );
		$label      = $prefix . trim( wp_strip_all_tags( (string) ( $field['title'] ?? $id ) ), " *\t\n" );
		$help       = trim( wp_strip_all_tags( (string) ( $field['description'] ?? '' ) ) );
		$post_refs  = Graphic_Data_Transfer_Schema::get_post_references( $type );
		$term_refs  = Graphic_Data_Transfer_Schema::get_term_references( $type );

		if ( isset( $post_refs[ $id ] ) ) {
			$kind = 'post';
		} elseif ( isset( $term_refs[ $id ] ) ) {
			$kind = 'term';
		} elseif ( 'figure_interactive_arguments' === $id ) {
			$kind = 'settings';
		} elseif ( 'figure_tab' === $id ) {
			$kind = 'tab';
		} elseif ( 'image' === $field_type ) {
			$kind = 'media';
		} elseif ( 'upload' === $field_type ) {
			$kind = 'data';
		} elseif ( 'checkbox' === $field_type || ( 'select' === $field_type && ! empty( $field['options'] ) && is_array( $field['options'] ) ) ) {
			$kind = 'choice';
		} elseif ( 'number' === $field_type || 'range' === $field_type ) {
			$kind = 'number';
		} elseif ( 'color' === $field_type ) {
			$kind = 'color';
		} elseif ( 'editor' === $field_type ) {
			$kind = 'html';
		} elseif ( 'ace_editor' === $field_type ) {
			$kind = 'code';
		} else {
			$kind = 'text';
		}

		$column          = self::column( $kind, $label, $help, in_array( $id, self::REQUIRED_FIELDS[ $type ] ?? array(), true ) );
		$column['field'] = $field;
		if ( isset( $field['default'] ) && '' !== (string) $field['default'] ) {
			$column['default'] = (string) $field['default'];
		}
		if ( 'tab' === $kind ) {
			$column['default'] = '1';
		} elseif ( 'post' === $kind ) {
			$column['target'] = $post_refs[ $id ];
		} elseif ( 'choice' === $kind ) {
			$column['allowed'] = 'checkbox' === $field_type ? array( 'yes', 'no' ) : array_map( 'strval', array_keys( $field['options'] ) );
			if ( 'checkbox' === $field_type ) {
				$column['default'] = 'no';
			}
		}
		return $column;
	}

	/**
	 * The edit screen field definitions of a content type, with tabs
	 * flattened.
	 *
	 * @param string $type Content type.
	 * @return array[]
	 */
	private static function get_fields( $type ) {
		if ( ! isset( self::FIELD_CLASSES[ $type ] ) ) {
			return array();
		}
		list( $class, $file ) = self::FIELD_CLASSES[ $type ];
		if ( ! class_exists( $class ) ) {
			require_once plugin_dir_path( __DIR__ ) . $file;
		}
		$method = 'create_' . $type . '_fields';
		$fields = ( new $class() )->$method( true );

		$flat = array();
		foreach ( (array) $fields as $field ) {
			if ( ! isset( $field['id'] ) && ! empty( $field['fields'] ) ) {
				// A tab of fields (the Figure edit screen).
				$flat = array_merge( $flat, $field['fields'] );
			} else {
				$flat[] = $field;
			}
		}
		return $flat;
	}

	// ---------------------------------------------------------------------
	// Template
	// ---------------------------------------------------------------------

	/**
	 * Write the template zip: an empty TSV file per content type (header row
	 * only) and README.tsv describing every column.
	 *
	 * @param string $path Zip path.
	 * @return true|WP_Error
	 */
	public static function write_template( $path ) {
		if ( ! class_exists( 'ZipArchive' ) ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'The PHP ZipArchive extension is required.' );
		}
		$zip = new ZipArchive();
		if ( true !== $zip->open( $path, ZipArchive::CREATE | ZipArchive::OVERWRITE ) ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'Could not create the template.' );
		}

		$readme = array( array( 'File', 'Column', 'Required', 'Allowed values', 'Blank means', 'Description' ) );
		foreach ( self::get_general_notes() as $note ) {
			$readme[] = array( '(all files)', '', '', '', '', $note );
		}
		foreach ( self::FILES as $type => $file ) {
			$columns = self::get_columns( $type );
			$zip->addFromString( $file, self::to_tsv( array( array_keys( $columns ) ) ) );
			foreach ( $columns as $name => $column ) {
				$readme[] = array(
					$file,
					$name,
					$column['required'] ? 'yes' : '',
					implode( ', ', $column['allowed'] ),
					null === $column['default'] ? '' : $column['default'],
					self::get_column_help( $name, $column ),
				);
			}
		}
		$zip->addFromString( self::README_FILE, self::to_tsv( $readme ) );
		$zip->addEmptyDir( 'media' );
		$zip->addEmptyDir( 'data' );
		return $zip->close() ? true : new WP_Error( 'graphic_data_transfer_zip', 'Could not create the template.' );
	}

	/**
	 * General rules, listed at the top of README.tsv.
	 *
	 * @return string[]
	 */
	private static function get_general_notes() {
		return array(
			'Fill in one row per item, under the header row, and save each file as tab-delimited text in UTF-8 (in Excel: "Unicode Text"; in Google Sheets: Download > Tab-separated values). Leave out files you do not need.',
			'Zip the TSV files together with a media folder (images) and a data folder (Interactive figure data), then upload the zip in the Import section of Graphic Data > Content Transfer.',
			'Pages and the About content cannot be bulk imported. Columns you leave out of a file, and blank cells, take the default that a new item gets on its edit screen.',
			'A cell can hold line breaks if it is quoted (spreadsheet programs do this for you). In a hand-written file you can also type \n for a line break, \t for a tab and \\ for a backslash.',
			'Everything is created new and assigned to you. Rows whose slug matches existing content are imported as copies with their Status set to Draft. Links to existing content can be checked and changed before the import runs, and the whole import can be undone.',
		);
	}

	/**
	 * Description of a column for README.tsv.
	 *
	 * @param string $name   Column name.
	 * @param array  $column Column definition.
	 * @return string
	 */
	private static function get_column_help( $name, $column ) {
		$parts = array( preg_match( '/[.?!]$/', $column['label'] ) ? $column['label'] : $column['label'] . '.' );
		if ( '' !== $column['help'] ) {
			$parts[] = $column['help'];
		}
		switch ( $column['kind'] ) {
			case 'post':
				$target  = $column['target'];
				$parts[] = 'page' === $target
					? 'id:<ID> or slug:<slug> of an existing page.'
					: sprintf( 'ref:<name> of a row in %1$s, or id:<ID> or slug:<slug> of an existing %2$s.', self::FILES[ $target ], ucfirst( $target ) );
				break;
			case 'term':
				$parts[] = 'ref:<name> of a row in instance_types.tsv, or id:<ID> or slug:<slug> of an existing Instance Type.';
				break;
			case 'tab':
				$parts[] = 'Number of the Modal tab, 1 to 6.';
				break;
			case 'media':
				$parts[] = sprintf( 'media/<file> for a file in the zip\'s media folder, an https:// address (the file is downloaded), or attachment:<ID> for an item in this site\'s Media Library. Optional extra columns %1$s_alt and %1$s_caption set the image\'s alt text and caption.', $name );
				break;
			case 'data':
				$parts[] = 'data/<file> for a .csv, .json or .geojson file in the zip\'s data folder. A CSV file is converted to JSON as on the Figure edit screen.';
				break;
			case 'settings':
				$parts[] = 'Interactive figure settings as JSON. On the edit screen of an Interactive figure of the same kind, click "Copy settings for bulk import" and paste the result here, then change the column names and labels to match this figure\'s data. Types: ' . implode( ', ', self::GRAPH_TYPES ) . '.';
				break;
			case 'number':
				$parts[] = 'A number.';
				break;
			case 'color':
				$parts[] = 'A color such as #1a6b8f.';
				break;
			case 'html':
				$parts[] = 'Text with HTML formatting.';
				break;
			case 'code':
				$parts[] = 'Code is imported exactly as written.';
				break;
		}
		return implode( ' ', $parts );
	}

	/**
	 * Format rows as TSV, quoting cells that need it.
	 *
	 * @param array[] $rows Rows of cells.
	 * @return string
	 */
	private static function to_tsv( $rows ) {
		$lines = array();
		foreach ( $rows as $row ) {
			$cells = array();
			foreach ( $row as $cell ) {
				$cell    = (string) $cell;
				$cells[] = preg_match( '/[\t\n\r"]/', $cell ) ? '"' . str_replace( '"', '""', $cell ) . '"' : $cell;
			}
			$lines[] = implode( "\t", $cells );
		}
		return implode( "\r\n", $lines ) . "\r\n";
	}

	// ---------------------------------------------------------------------
	// Conversion
	// ---------------------------------------------------------------------

	/**
	 * Whether a zip is a bulk import: it has no manifest.json and holds at
	 * least one of the TSV files.
	 *
	 * @param string $path Zip path.
	 * @return bool
	 */
	public static function is_bulk_zip( $path ) {
		if ( ! class_exists( 'ZipArchive' ) ) {
			return false;
		}
		$zip = new ZipArchive();
		if ( true !== $zip->open( $path ) ) {
			return false;
		}
		$is_bulk = false === $zip->locateName( 'manifest.json' ) && null !== self::find_base( $zip );
		$zip->close();
		return $is_bulk;
	}

	/**
	 * Folder in the zip that holds the TSV files: the top level, or a single
	 * folder (as when a folder is zipped).
	 *
	 * @param ZipArchive $zip Zip.
	 * @return string|null Folder ('' or ending in /), or null if there are
	 *                     no TSV files.
	 */
	private static function find_base( $zip ) {
		$names = array_flip( self::FILES );
		for ( $i = 0; $i < $zip->numFiles; $i++ ) { // phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase -- ZipArchive property.
			$entry = (string) $zip->getNameIndex( $i );
			if ( 0 === strpos( $entry, '__MACOSX/' ) ) {
				continue;
			}
			$base = dirname( $entry );
			if ( isset( $names[ wp_basename( $entry ) ] ) && ( '.' === $base || false === strpos( $base, '/' ) ) ) {
				return '.' === $base ? '' : $base . '/';
			}
		}
		return null;
	}

	/**
	 * Convert a bulk import zip into a Content Transfer package.
	 *
	 * @param string $source_path  Uploaded zip.
	 * @param string $package_path Package to write.
	 * @return true|WP_Error The error's data holds every problem found
	 *                       ('errors').
	 */
	public function convert( $source_path, $package_path ) {
		require_once ABSPATH . 'wp-admin/includes/file.php';
		$this->zip = new ZipArchive();
		if ( true !== $this->zip->open( $source_path ) ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'The file is not a valid zip file.' );
		}
		$this->base     = (string) self::find_base( $this->zip );
		$this->work_dir = trailingslashit( dirname( $package_path ) );

		try {
			foreach ( array_keys( self::FILES ) as $type ) {
				$this->read_table( $type );
			}
			if ( ! $this->errors && ! array_filter( $this->rows ) ) {
				$this->error( 'The TSV files have no rows under their header rows.' );
			}
			// Once the files can be read, every row is checked so that all the
			// problems are listed together.
			if ( ! $this->errors ) {
				$this->assign_ids();
				$this->build_terms();
				foreach ( array( 'instance', 'scene', 'modal', 'figure' ) as $type ) {
					foreach ( $this->rows[ $type ] ?? array() as $row ) {
						$this->build_post( $type, $row );
					}
				}
			}
			if ( $this->errors ) {
				$count = count( $this->errors );
				return new WP_Error(
					'graphic_data_transfer_tsv',
					sprintf(
						1 === $count ? 'The bulk import has a problem. Fix it in the spreadsheet and upload the zip again.' : 'The bulk import has %d problems. Fix them in the spreadsheets and upload the zip again.',
						$count
					),
					array( 'errors' => array_slice( $this->errors, 0, self::MAX_ERRORS ) )
				);
			}
			return $this->write_package( $package_path, substr( (string) hash_file( 'sha256', $source_path ), 0, 16 ) );
		} finally {
			$this->zip->close();
			foreach ( $this->temp_files as $file ) {
				if ( file_exists( $file ) ) {
					wp_delete_file( $file );
				}
			}
		}
	}

	/**
	 * Record a problem that stops the import.
	 *
	 * @param string $message Problem.
	 * @return void
	 */
	private function error( $message ) {
		$this->errors[] = $message;
	}

	/**
	 * Whether a problem has already been recorded for a cell, so that a cell
	 * whose value was rejected is not also reported as blank.
	 *
	 * @param string $where Location (file and row).
	 * @param string $name  Column name.
	 * @return bool
	 */
	private function has_error( $where, $name ) {
		foreach ( $this->errors as $error ) {
			if ( 0 === strpos( $error, $where . ': ' . $name . ' ' ) ) {
				return true;
			}
		}
		return false;
	}

	/**
	 * Read one TSV file into $rows.
	 *
	 * @param string $type Content type.
	 * @return void
	 */
	private function read_table( $type ) {
		$file = self::FILES[ $type ];
		$raw  = $this->zip->getFromName( $this->base . $file );
		if ( false === $raw ) {
			return;
		}
		$text = $this->to_utf8( (string) $raw, $file );
		if ( null === $text ) {
			return;
		}

		$columns = self::get_columns( $type );
		$handle  = fopen( 'php://temp', 'r+' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
		fwrite( $handle, $text ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fwrite
		rewind( $handle );

		$header = null;
		$record = 0;
		while ( false !== ( $cells = fgetcsv( $handle, 0, "\t", '"', '' ) ) ) { // phpcs:ignore WordPress.CodeAnalysis.AssignmentInCondition.FoundInWhileCondition
			++$record;
			if ( null === $header ) {
				$header = $this->read_header( $cells, $columns, $file );
				if ( null === $header ) {
					break;
				}
				continue;
			}
			if ( '' === trim( implode( '', array_map( 'strval', $cells ) ) ) ) {
				continue;
			}
			$row = array();
			foreach ( $cells as $index => $cell ) {
				if ( isset( $header[ $index ] ) ) {
					$row[ $header[ $index ] ] = (string) $cell;
				} elseif ( '' !== trim( (string) $cell ) ) {
					$this->error( sprintf( '%s row %d: the row has more cells than the header row has columns.', $file, $record ) );
					break;
				}
			}
			$this->rows[ $type ][] = array(
				'line'  => $record,
				'id'    => 0,
				'cells' => $row,
			);
		}
		fclose( $handle ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
	}

	/**
	 * Check a header row.
	 *
	 * @param array  $cells   Header cells.
	 * @param array  $columns Column definitions.
	 * @param string $file    File name.
	 * @return array<int, string>|null Column name by position ('' to skip),
	 *                                 or null if the header is unusable.
	 */
	private function read_header( $cells, $columns, $file ) {
		$header  = array();
		$seen    = array();
		$unknown = array();
		foreach ( $cells as $index => $cell ) {
			$name = trim( (string) $cell );
			if ( '' === $name ) {
				$header[ $index ] = '';
				continue;
			}
			if ( isset( $seen[ $name ] ) ) {
				$this->error( sprintf( '%s: the column %s appears twice in the header row.', $file, $name ) );
				return null;
			}
			$seen[ $name ] = true;
			if ( ! isset( $columns[ $name ] ) && ! $this->is_media_extra_column( $name, $columns ) ) {
				$unknown[]        = $name;
				$header[ $index ] = '';
				continue;
			}
			$header[ $index ] = $name;
		}
		if ( ! array_filter( $header ) ) {
			$this->error( sprintf( '%s: the first row must be the header row, with the column names from the template.', $file ) );
			return null;
		}
		if ( $unknown ) {
			$this->warnings[] = sprintf( '%s: these columns are not used by the import and were skipped: %s.', $file, implode( ', ', $unknown ) );
		}
		return $header;
	}

	/**
	 * Whether a column name is <media column>_alt or <media column>_caption.
	 *
	 * @param string $name    Column name.
	 * @param array  $columns Column definitions.
	 * @return bool
	 */
	private function is_media_extra_column( $name, $columns ) {
		if ( ! preg_match( '/^(.+)_(alt|caption)$/', $name, $match ) ) {
			return false;
		}
		return isset( $columns[ $match[1] ] ) && 'media' === $columns[ $match[1] ]['kind'];
	}

	/**
	 * Text of a TSV file as UTF-8 without a byte order mark.
	 *
	 * @param string $raw  File contents.
	 * @param string $file File name.
	 * @return string|null Null (with an error recorded) if the file is not
	 *                     UTF-8 or UTF-16 text.
	 */
	private function to_utf8( $raw, $file ) {
		if ( 0 === strncmp( $raw, "\xEF\xBB\xBF", 3 ) ) {
			$raw = substr( $raw, 3 );
		} elseif ( function_exists( 'mb_convert_encoding' ) && ( 0 === strncmp( $raw, "\xFF\xFE", 2 ) || 0 === strncmp( $raw, "\xFE\xFF", 2 ) ) ) {
			// Excel's "Unicode Text" is UTF-16.
			$raw = mb_convert_encoding( substr( $raw, 2 ), 'UTF-8', "\xFF" === $raw[0] ? 'UTF-16LE' : 'UTF-16BE' );
		}
		if ( ! preg_match( '//u', $raw ) ) {
			$this->error( sprintf( '%s is not saved as UTF-8 text. Save it again as tab-delimited text in UTF-8 (in Excel: "Unicode Text").', $file ) );
			return null;
		}
		return $raw;
	}

	/**
	 * Check every row's ref and give every row its source ID.
	 *
	 * @return void
	 */
	private function assign_ids() {
		foreach ( self::FILES as $type => $file ) {
			foreach ( $this->rows[ $type ] ?? array() as $index => $row ) {
				$id                                      = ++$this->next_id;
				$this->rows[ $type ][ $index ]['id'] = $id;
				$ref                                     = trim( $row['cells']['ref'] ?? '' );
				if ( '' === $ref ) {
					continue;
				}
				if ( ! preg_match( '/^[A-Za-z0-9_-]+$/', $ref ) ) {
					$this->error( sprintf( '%s row %d: the ref "%s" can only use letters, numbers, - and _.', $file, $row['line'], $ref ) );
				} elseif ( isset( $this->refs[ $type ][ $ref ] ) ) {
					$this->error( sprintf( '%s row %d: the ref "%s" is already used by another row.', $file, $row['line'], $ref ) );
				} else {
					$this->refs[ $type ][ $ref ] = $id;
				}
			}
		}
	}

	/**
	 * Build the package terms from instance_types.tsv.
	 *
	 * @return void
	 */
	private function build_terms() {
		$columns = self::get_columns( 'instance_type' );
		foreach ( $this->rows['instance_type'] ?? array() as $row ) {
			$where = sprintf( '%s row %d', self::FILES['instance_type'], $row['line'] );
			$name  = sanitize_text_field( $this->cell( $row, 'name', $columns['name'] ) );
			if ( '' === $name ) {
				$this->error( $where . ': the name cannot be blank.' );
				continue;
			}
			$slug = sanitize_title( $this->cell( $row, 'slug', $columns['slug'] ) );
			$meta = array();
			$order = $this->cell( $row, 'instance_order', $columns['instance_order'] );
			if ( '' !== $order ) {
				if ( ! is_numeric( $order ) ) {
					$this->error( $where . ': instance_order must be a number.' );
				}
				$meta['instance_order'] = (string) absint( $order );
			}
			$navbar = sanitize_text_field( $this->cell( $row, 'instance_navbar_name', $columns['instance_navbar_name'] ) );
			if ( '' !== $navbar ) {
				$meta['instance_navbar_name'] = $navbar;
			}
			$this->terms[] = array(
				'source_id'   => $row['id'],
				'taxonomy'    => Graphic_Data_Transfer_Schema::INSTANCE_TYPE_TAXONOMY,
				'name'        => $name,
				'slug'        => '' === $slug ? sanitize_title( $name ) : $slug,
				'description' => sanitize_textarea_field( $this->cell( $row, 'description', $columns['description'] ) ),
				'meta'        => $meta,
			);
		}
	}

	/**
	 * Build a package post from a row.
	 *
	 * @param string $type Content type.
	 * @param array  $row  Row.
	 * @return void
	 */
	private function build_post( $type, $row ) {
		$columns = self::get_columns( $type );
		$where   = sprintf( '%s row %d', self::FILES[ $type ], $row['line'] );
		$title   = sanitize_text_field( $this->cell( $row, 'post_title', $columns['post_title'] ) );
		if ( '' === $title ) {
			$this->error( $where . ': the title cannot be blank.' );
		}
		$slug = sanitize_title( $this->cell( $row, 'post_name', $columns['post_name'] ) );

		$meta      = array();
		$fieldsets = array();
		$data      = null;
		foreach ( $columns as $name => $column ) {
			if ( in_array( $column['kind'], array( 'ref', 'title', 'slug' ), true ) ) {
				continue;
			}
			$value = $this->cell( $row, $name, $column );
			if ( 'data' === $column['kind'] ) {
				$data = '' === $value ? null : $this->add_data_file( $value, $row['id'], $where );
				continue;
			}
			if ( $column['required'] && '' === $value ) {
				$this->error( sprintf( '%s: %s cannot be blank.', $where, $name ) );
			}
			$value = $this->convert_value( $value, $name, $column, $row, $where );
			if ( '' !== $column['parent'] ) {
				$fieldsets[ $column['parent'] ][ $name ] = $value;
			} else {
				$meta[ $name ] = $value;
			}
		}
		$meta = array_merge( $meta, $fieldsets );

		$entry = array(
			'source_id'   => $row['id'],
			'post_type'   => $type,
			'post_title'  => $title,
			'post_name'   => '' === $slug ? sanitize_title( $title ) : $slug,
			'post_status' => 'publish',
			'meta'        => $meta,
		);

		$this->check_post( $entry, $where );
		if ( 'figure' === $type ) {
			$entry = $this->finish_figure( $entry, $data, $where );
		}
		$this->posts[] = $entry;
	}

	/**
	 * A cell's value: trimmed, with the escapes \n, \t and \\ turned into a
	 * line break, tab and backslash in text cells.
	 *
	 * @param array  $row    Row.
	 * @param string $name   Column name.
	 * @param array  $column Column definition.
	 * @return string
	 */
	private function cell( $row, $name, $column ) {
		$value = trim( (string) ( $row['cells'][ $name ] ?? '' ) );
		if ( in_array( $column['kind'], array( 'title', 'text', 'html' ), true ) ) {
			$value = preg_replace_callback(
				'/\\\\([nt\\\\])/',
				function ( $match ) {
					$map = array(
						'n'  => "\n",
						't'  => "\t",
						'\\' => '\\',
					);
					return $map[ $match[1] ];
				},
				$value
			);
		}
		return $value;
	}

	/**
	 * Check and convert a cell into the value saved in the post's meta.
	 *
	 * @param string $value  Cell value.
	 * @param string $name   Column name.
	 * @param array  $column Column definition.
	 * @param array  $row    Row.
	 * @param string $where  Location for messages.
	 * @return string
	 */
	private function convert_value( $value, $name, $column, $row, $where ) {
		if ( '' === $value ) {
			if ( null === $column['default'] || in_array( $column['kind'], array( 'post', 'term' ), true ) ) {
				return '';
			}
			$value = $column['default'];
		}

		switch ( $column['kind'] ) {
			case 'post':
				return $this->resolve_post_cell( $value, $column['target'], $row['id'], $name, $where );

			case 'term':
				return $this->resolve_term_cell( $value, $where );

			case 'media':
				return $this->resolve_media_cell( $value, $name, $row, $where );

			case 'tab':
				if ( ! ctype_digit( $value ) || (int) $value < 1 || (int) $value > 6 ) {
					$this->error( sprintf( '%s: %s must be a tab number from 1 to 6.', $where, $name ) );
				}
				return (string) absint( $value );

			case 'choice':
				foreach ( $column['allowed'] as $allowed ) {
					if ( 0 === strcasecmp( $allowed, $value ) ) {
						return $this->sanitize( $column['field'], $allowed );
					}
				}
				$this->error( sprintf( '%s: %s must be one of: %s (not "%s").', $where, $name, implode( ', ', $column['allowed'] ), $value ) );
				return '';

			case 'number':
				if ( ! is_numeric( $value ) ) {
					$this->error( sprintf( '%s: %s must be a number (not "%s").', $where, $name, $value ) );
					return '';
				}
				break;

			case 'color':
				if ( ! sanitize_hex_color( $value ) ) {
					$this->error( sprintf( '%s: %s must be a color such as #1a6b8f (not "%s").', $where, $name, $value ) );
					return '';
				}
				break;

			case 'code':
				// Saved exactly as written, as the edit screen saves it.
				return $value;

			case 'settings':
				// Checked and cleaned by finish_figure().
				return $value;
		}
		return (string) $this->sanitize( $column['field'], $value );
	}

	/**
	 * Clean a value the way the edit screen does when it saves the field.
	 *
	 * @param array  $field Field definition.
	 * @param string $value Value.
	 * @return mixed
	 */
	private function sanitize( $field, $value ) {
		if ( ! class_exists( 'Exopite_Simple_Options_Framework_Sanitize' ) ) {
			require_once plugin_dir_path( __DIR__ ) . 'admin/exopite-simple-options/sanitize-class.php';
		}
		$sanitizer = new Exopite_Simple_Options_Framework_Sanitize( false, '', array(), array() );
		return $sanitizer->sanitize( $field, $value );
	}

	/**
	 * Resolve a link to an Instance, Scene, Modal or page.
	 *
	 * @param string $value       Cell value.
	 * @param string $target_type Post type linked to.
	 * @param int    $source_id   Source ID of the row.
	 * @param string $name        Column name.
	 * @param string $where       Location for messages.
	 * @return string Source ID of a row, ID of existing content, or ''.
	 */
	private function resolve_post_cell( $value, $target_type, $source_id, $name, $where ) {
		list( $kind, $key ) = $this->split_reference( $value, $this->refs[ $target_type ] ?? array() );
		$label              = 'page' === $target_type ? 'page' : ucfirst( $target_type );

		if ( 'ref' === $kind ) {
			if ( 'page' === $target_type ) {
				$this->error( sprintf( '%s: %s must link to an existing page with id:<ID> or slug:<slug>; pages cannot be bulk imported.', $where, $name ) );
				return '';
			}
			if ( ! isset( $this->refs[ $target_type ][ $key ] ) ) {
				$this->error( sprintf( '%s: %s links to ref:%s, but no row in %s has that ref.', $where, $name, $key, self::FILES[ $target_type ] ) );
				return '';
			}
			return (string) $this->refs[ $target_type ][ $key ];
		}

		$post = null;
		if ( 'id' === $kind ) {
			$post = get_post( (int) $key );
		} elseif ( 'slug' === $kind ) {
			$found = get_posts(
				array(
					'post_type'        => $target_type,
					'name'             => $key,
					'post_status'      => Graphic_Data_Transfer_Schema::get_exportable_statuses(),
					'posts_per_page'   => 1,
					'suppress_filters' => true,
				)
			);
			$post  = $found ? $found[0] : null;
		} else {
			$this->error( sprintf( '%s: %s must be ref:<name>, id:<ID> or slug:<slug> (not "%s").', $where, $name, $value ) );
			return '';
		}
		if ( ! $post || $target_type !== $post->post_type || ! in_array( $post->post_status, Graphic_Data_Transfer_Schema::get_exportable_statuses(), true ) ) {
			$this->error( sprintf( '%s: %s links to %s, but there is no %s with that %s on this site.', $where, $name, $value, $label, 'id' === $kind ? 'ID' : 'slug' ) );
			return '';
		}

		$this->local_links[ $target_type . ':' . $post->ID ] = (int) $post->ID;
		$this->references[]                                    = array(
			'post'         => $source_id,
			'location'     => 'meta',
			'block'        => '',
			'key'          => $name,
			'target_type'  => $target_type,
			'target_id'    => (int) $post->ID,
			'in_package'   => false,
			'target_title' => $post->post_title,
			'target_slug'  => $post->post_name,
		);
		return (string) $post->ID;
	}

	/**
	 * Split a link cell into its kind and key. A value without a prefix is a
	 * ref when a row has it, otherwise an ID when it is a number.
	 *
	 * @param string             $value Cell value.
	 * @param array<string, int> $refs  Refs of the rows that can be linked to.
	 * @return array{0: string, 1: string} Kind ('ref', 'id', 'slug' or '') and key.
	 */
	private function split_reference( $value, $refs ) {
		if ( preg_match( '/^(ref|id|slug):\s*(.+)$/i', $value, $match ) ) {
			$kind = strtolower( $match[1] );
			$key  = trim( $match[2] );
			if ( 'id' === $kind && ! ctype_digit( $key ) ) {
				return array( '', $key );
			}
			return array( $kind, $key );
		}
		if ( isset( $refs[ $value ] ) ) {
			return array( 'ref', $value );
		}
		return ctype_digit( $value ) ? array( 'id', $value ) : array( '', $value );
	}

	/**
	 * Resolve an Instance Type cell.
	 *
	 * @param string $value Cell value.
	 * @param string $where Location for messages.
	 * @return string Source ID of the package term, or ''.
	 */
	private function resolve_term_cell( $value, $where ) {
		list( $kind, $key ) = $this->split_reference( $value, $this->refs['instance_type'] ?? array() );
		if ( 'ref' === $kind ) {
			if ( ! isset( $this->refs['instance_type'][ $key ] ) ) {
				$this->error( sprintf( '%s: instance_type links to ref:%s, but no row in instance_types.tsv has that ref.', $where, $key ) );
				return '';
			}
			return (string) $this->refs['instance_type'][ $key ];
		}

		$term = null;
		if ( 'id' === $kind ) {
			$term = get_term( (int) $key, Graphic_Data_Transfer_Schema::INSTANCE_TYPE_TAXONOMY );
		} elseif ( 'slug' === $kind ) {
			$term = get_term_by( 'slug', $key, Graphic_Data_Transfer_Schema::INSTANCE_TYPE_TAXONOMY );
		}
		if ( ! $term || is_wp_error( $term ) ) {
			$this->error( sprintf( '%s: instance_type must be ref:<name>, or id:<ID> or slug:<slug> of an existing Instance Type (not "%s").', $where, $value ) );
			return '';
		}

		// Existing terms travel by slug, which the importer reuses.
		if ( ! isset( $this->existing_terms[ $term->term_id ] ) ) {
			$id                                       = ++$this->next_id;
			$this->existing_terms[ $term->term_id ] = $id;
			$this->terms[]                            = array(
				'source_id'   => $id,
				'taxonomy'    => $term->taxonomy,
				'name'        => $term->name,
				'slug'        => $term->slug,
				'description' => $term->description,
				'meta'        => array(),
			);
		}
		return (string) $this->existing_terms[ $term->term_id ];
	}

	/**
	 * Resolve an image cell.
	 *
	 * @param string $value Cell value.
	 * @param string $name  Column name.
	 * @param array  $row   Row.
	 * @param string $where Location for messages.
	 * @return string Address of the image (a placeholder for files added by
	 *                the import).
	 */
	private function resolve_media_cell( $value, $name, $row, $where ) {
		$alt     = sanitize_text_field( (string) ( $row['cells'][ $name . '_alt' ] ?? '' ) );
		$caption = sanitize_text_field( (string) ( $row['cells'][ $name . '_caption' ] ?? '' ) );

		if ( preg_match( '/^attachment:\s*(\d+)$/i', $value, $match ) ) {
			$url = 'attachment' === get_post_type( (int) $match[1] ) ? wp_get_attachment_url( (int) $match[1] ) : false;
			if ( ! $url ) {
				$this->error( sprintf( '%s: %s links to %s, but there is no Media Library item with that ID.', $where, $name, $value ) );
				return '';
			}
			return $url;
		}

		if ( preg_match( '#^https?://#i', $value ) ) {
			// Files already in this site's uploads folder are used as they are.
			$uploads = preg_replace( '#^https?:#i', '', wp_get_upload_dir()['baseurl'] );
			if ( 0 === stripos( preg_replace( '#^https?:#i', '', $value ), trailingslashit( $uploads ) ) ) {
				return esc_url_raw( $value );
			}
			return $this->add_media( $value, '', $alt, $caption, $where, $name );
		}

		$path = $this->get_zip_path( $value, 'media' );
		if ( '' === $path ) {
			$this->error( sprintf( '%s: %s must be media/<file>, an https:// address or attachment:<ID> (not "%s").', $where, $name, $value ) );
			return '';
		}
		if ( false === $this->zip->locateName( $this->base . $path ) ) {
			$this->error( sprintf( '%s: %s is %s, but the zip has no such file.', $where, $name, $value ) );
			return '';
		}
		return $this->add_media( '', $path, $alt, $caption, $where, $name );
	}

	/**
	 * A path inside a folder of the zip, or '' if it is not one.
	 *
	 * @param string $value  Cell value.
	 * @param string $folder 'media' or 'data'.
	 * @return string
	 */
	private function get_zip_path( $value, $folder ) {
		$path = ltrim( str_replace( '\\', '/', $value ), '/' );
		if ( 0 !== strpos( $path, $folder . '/' ) || preg_match( '#(^|/)\.\.?(/|$)#', $path ) || '' === wp_basename( $path ) ) {
			return '';
		}
		return $path;
	}

	/**
	 * Add a media file to the package (once, however many rows use it).
	 *
	 * @param string $url     Address to download from, or ''.
	 * @param string $path    Path inside the zip, or ''.
	 * @param string $alt     Alt text.
	 * @param string $caption Caption.
	 * @param string $where   Location for messages.
	 * @param string $name    Column name.
	 * @return string Placeholder address.
	 */
	private function add_media( $url, $path, $alt, $caption, $where, $name ) {
		$source = '' !== $url ? $url : 'zip:' . $path;
		if ( isset( $this->media_sources[ $source ] ) ) {
			return $this->media_sources[ $source ];
		}

		$file_name = sanitize_file_name( wp_basename( '' !== $url ? (string) wp_parse_url( $url, PHP_URL_PATH ) : $path ) );
		$file_type = wp_check_filetype( $file_name );
		if ( '' === $file_name || ! $file_type['type'] ) {
			$this->error( sprintf( '%s: %s is not a file type the Media Library accepts.', $where, $name ) );
			return '';
		}

		if ( '' !== $url ) {
			$local = download_url( $url, 30 );
			if ( is_wp_error( $local ) ) {
				$this->error( sprintf( '%s: %s could not be downloaded from %s: %s', $where, $name, $url, $local->get_error_message() ) );
				return '';
			}
			$this->temp_files[] = $local;
		} else {
			$local = $this->extract( $path );
		}

		$number      = count( $this->media ) + 1;
		$zip_name    = 'media/' . $number . '/' . $file_name;
		$placeholder = self::MEDIA_PLACEHOLDER . $number;

		$this->files[ $zip_name ] = array( 'path' => $local );
		$this->media[]            = array(
			'key'                  => 'b' . $number,
			'source_attachment_id' => $number,
			'file'                 => $zip_name,
			'mime'                 => $file_type['type'],
			'title'                => pathinfo( $file_name, PATHINFO_FILENAME ),
			'alt'                  => $alt,
			'caption'              => $caption,
			'description'          => '',
			'source_urls'          => array( $placeholder => 'full' ),
		);
		$this->media_sources[ $source ] = $placeholder;
		return $placeholder;
	}

	/**
	 * Copy a file out of the uploaded zip into a temporary file.
	 *
	 * @param string $path Path inside the zip, relative to the TSV folder.
	 * @return string Temporary file.
	 */
	private function extract( $path ) {
		$local              = wp_tempnam( wp_basename( $path ), $this->work_dir );
		$this->temp_files[] = $local;
		$in                 = $this->zip->getStream( $this->base . $path );
		$out                = fopen( $local, 'wb' ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fopen
		if ( $in && $out ) {
			stream_copy_to_stream( $in, $out );
		}
		if ( $in ) {
			fclose( $in ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		}
		if ( $out ) {
			fclose( $out ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_system_operations_fclose
		}
		return $local;
	}

	/**
	 * Add a figure's data file to the package, as the Figure edit screen's
	 * upload does: a CSV file is kept and converted to JSON; a JSON file
	 * must have the structure the converter writes; a GeoJSON file is the
	 * figure's data as it is.
	 *
	 * @param string $value     Cell value (data/<file>).
	 * @param int    $source_id Source ID of the figure.
	 * @param string $where     Location for messages.
	 * @return array|null Meta to save and the data's column names, or null.
	 */
	private function add_data_file( $value, $source_id, $where ) {
		$path      = $this->get_zip_path( $value, 'data' );
		$extension = strtolower( pathinfo( $path, PATHINFO_EXTENSION ) );
		if ( '' === $path || ! in_array( $extension, Graphic_Data_Transfer_Schema::get_data_file_extensions(), true ) ) {
			$this->error( sprintf( '%s: figure_upload_file must be data/<file> with a .csv, .json or .geojson file (not "%s").', $where, $value ) );
			return null;
		}
		$contents = $this->zip->getFromName( $this->base . $path );
		if ( false === $contents ) {
			$this->error( sprintf( '%s: figure_upload_file is %s, but the zip has no such file.', $where, $value ) );
			return null;
		}
		$contents = 0 === strncmp( $contents, "\xEF\xBB\xBF", 3 ) ? substr( $contents, 3 ) : $contents;
		$name     = wp_basename( $path );
		$folder   = 'data/figure_' . $source_id . '/';
		$meta     = array( 'uploaded_file' => $name );
		$columns  = array();

		if ( 'csv' === $extension ) {
			$json = self::csv_to_json( $contents );
			$data = json_decode( $json, true );
			if ( ! is_array( $data ) || ! isset( $data['data'] ) ) {
				$this->error( sprintf( '%s: %s could not be converted to JSON. Check that it is a comma-separated file whose cells contain no double quotes or backslashes.', $where, $value ) );
				return null;
			}
			// The edit screen names the JSON file after the CSV file in lower case.
			$json_name = preg_replace( '/\.csv/', '.json', strtolower( $name ), 1 );
			$this->add_data_entry( $source_id, 'uploaded_path_csv', $folder . $name, $contents );
			$this->add_data_entry( $source_id, 'uploaded_path_json', $folder . $json_name, $json );
			$meta['uploaded_path_csv']  = $name;
			$meta['uploaded_path_json'] = $json_name;
			$columns                    = array_keys( (array) $data['data'] );
		} elseif ( 'json' === $extension ) {
			$data = json_decode( $contents, true );
			if ( ! self::is_valid_data_json( $data ) ) {
				$this->error( sprintf( '%s: %s is not a figure data file: it must be JSON with a "metadata" object and a "data" object of columns, as the Figure edit screen makes from a CSV file.', $where, $value ) );
				return null;
			}
			$this->add_data_entry( $source_id, 'uploaded_path_json', $folder . $name, $contents );
			$meta['uploaded_path_json'] = $name;
			$columns                    = array_keys( $data['data'] );
		} else {
			if ( null === json_decode( $contents ) ) {
				$this->error( sprintf( '%s: %s is not valid GeoJSON.', $where, $value ) );
				return null;
			}
			$this->add_data_entry( $source_id, 'uploaded_path_geojson', $folder . $name, $contents );
			$this->add_data_entry( $source_id, 'uploaded_path_json', $folder . $name, $contents );
			$meta['uploaded_path_geojson'] = $name;
			$meta['uploaded_path_json']    = $name;
		}

		return array(
			'meta'      => $meta,
			'extension' => $extension,
			'columns'   => array_map( 'strval', $columns ),
		);
	}

	/**
	 * Add a data file entry and its file.
	 *
	 * @param int    $source_id Source ID of the figure.
	 * @param string $field     Meta key holding the file's path.
	 * @param string $zip_name  Path in the package.
	 * @param string $contents  File contents.
	 * @return void
	 */
	private function add_data_entry( $source_id, $field, $zip_name, $contents ) {
		$this->files[ $zip_name ] = $contents;
		$this->data_files[]       = array(
			'post'  => $source_id,
			'field' => $field,
			'file'  => $zip_name,
		);
	}

	/**
	 * Whether decoded JSON has the structure of a figure data file (the
	 * Figure edit screen's validateJson()).
	 *
	 * @param mixed $data Decoded JSON.
	 * @return bool
	 */
	private static function is_valid_data_json( $data ) {
		if ( ! is_array( $data ) || ! isset( $data['metadata'], $data['data'] ) || ! is_array( $data['metadata'] ) || ! is_array( $data['data'] ) ) {
			return false;
		}
		foreach ( $data['data'] as $column ) {
			if ( ! is_array( $column ) || ( $column && ! array_is_list( $column ) ) ) {
				return false;
			}
		}
		return true;
	}

	/**
	 * The checks the edit screens make when a post is saved.
	 *
	 * @param array  $entry Package post.
	 * @param string $where Location for messages.
	 * @return void
	 */
	private function check_post( $entry, $where ) {
		$meta  = $entry['meta'];
		$value = function ( $key, $sub = '' ) use ( $meta ) {
			$item = $meta[ $key ] ?? '';
			if ( '' !== $sub ) {
				$item = is_array( $item ) ? ( $item[ $sub ] ?? '' ) : '';
			}
			return trim( (string) $item );
		};

		switch ( $entry['post_type'] ) {
			case 'instance':
				if ( 'yes' === $value( 'instance_legacy_content' ) && '' === $value( 'instance_legacy_content_url' ) ) {
					$this->error( $where . ': instance_legacy_content_url cannot be blank when instance_legacy_content is yes.' );
				}
				for ( $i = 1; $i <= min( 3, absint( $value( 'instance_footer_columns' ) ) ); $i++ ) {
					if ( '' === $value( 'instance_footer_column' . $i, 'instance_footer_column_title' . $i ) || '' === $value( 'instance_footer_column' . $i, 'instance_footer_column_content' . $i ) ) {
						$this->error( sprintf( '%1$s: footer column %2$d needs instance_footer_column_title%2$d and instance_footer_column_content%2$d.', $where, $i ) );
					}
				}
				break;

			case 'scene':
				if ( '' === $value( 'scene_infographic' ) && ! $this->has_error( $where, 'scene_infographic' ) ) {
					$this->error( $where . ': scene_infographic cannot be blank.' );
				}
				if ( 'list' !== $value( 'scene_toc_style' ) ) {
					$sections = absint( $value( 'scene_section_number' ) );
					if ( ! $sections ) {
						$this->error( $where . ': scene_section_number must be at least 1 unless scene_toc_style is list.' );
					}
					for ( $i = 1; $i <= min( 6, $sections ); $i++ ) {
						if ( '' === $value( 'scene_section' . $i, 'scene_section_title' . $i ) ) {
							$this->error( sprintf( '%s: scene_section_title%d cannot be blank.', $where, $i ) );
						}
					}
				}
				$this->check_links( 'scene', $value, $where );
				break;

			case 'modal':
				if ( '' === $value( 'modal_icons' ) ) {
					$this->error( $where . ': modal_icons (the ID of the icon in the Scene\'s infographic) cannot be blank.' );
				}
				$function = $value( 'icon_function' );
				if ( 'External URL' === $function && '' === $value( 'icon_external_url' ) ) {
					$this->error( $where . ': icon_external_url cannot be blank when icon_function is External URL.' );
				} elseif ( 'Scene' === $function && '' === $value( 'icon_scene_out' ) ) {
					$this->error( $where . ': icon_scene_out cannot be blank when icon_function is Scene.' );
				} elseif ( 'Page' === $function && '' === $value( 'icon_page_out' ) ) {
					$this->error( $where . ': icon_page_out cannot be blank when icon_function is Page.' );
				} elseif ( 'Modal' === $function ) {
					$tabs = absint( $value( 'modal_tab_number' ) );
					if ( ! $tabs ) {
						$this->error( $where . ': modal_tab_number must be at least 1 when icon_function is Modal.' );
					}
					for ( $i = 1; $i <= min( 6, $tabs ); $i++ ) {
						if ( '' === $value( 'modal_tab_title' . $i ) ) {
							$this->error( sprintf( '%s: modal_tab_title%d cannot be blank.', $where, $i ) );
						}
					}
				}
				$this->check_links( 'modal', $value, $where );
				break;

			case 'figure':
				$path = $value( 'figure_path' );
				if ( 'Internal' === $path && '' === $value( 'figure_image' ) && ! $this->has_error( $where, 'figure_image' ) ) {
					$this->error( $where . ': figure_image cannot be blank when figure_path is Internal.' );
				}
				if ( 'External' === $path && ( '' === $value( 'figure_external_url' ) || '' === $value( 'figure_external_alt' ) ) ) {
					$this->error( $where . ': figure_external_url and figure_external_alt cannot be blank when figure_path is External.' );
				}
				foreach ( array( 'science', 'data' ) as $link ) {
					$text = $value( 'figure_' . $link . '_info', 'figure_' . $link . '_link_text' );
					$url  = $value( 'figure_' . $link . '_info', 'figure_' . $link . '_link_url' );
					if ( ( '' === $text ) !== ( '' === $url ) ) {
						$this->error( sprintf( '%1$s: figure_%2$s_link_text and figure_%2$s_link_url must both be filled in, or both left blank.', $where, $link ) );
					}
				}
				break;
		}
	}

	/**
	 * Check a Scene's or Modal's info and media links: each one counted by
	 * its *_entries field needs its text and its URL (or, for media, its
	 * image).
	 *
	 * @param string   $type  'scene' or 'modal'.
	 * @param callable $value Reads a meta value.
	 * @param string   $where Location for messages.
	 * @return void
	 */
	private function check_links( $type, $value, $where ) {
		for ( $i = 1; $i <= min( 6, absint( $value( $type . '_info_entries' ) ) ); $i++ ) {
			if ( '' === $value( $type . '_info' . $i, $type . '_info_text' . $i ) || '' === $value( $type . '_info' . $i, $type . '_info_url' . $i ) ) {
				$this->error( sprintf( '%1$s: info link %2$d needs %3$s_info_text%2$d and %3$s_info_url%2$d.', $where, $i, $type ) );
			}
		}
		for ( $i = 1; $i <= min( 6, absint( $value( $type . '_photo_entries' ) ) ); $i++ ) {
			$set = $type . '_photo' . $i;
			if ( '' === $value( $set, $type . '_photo_text' . $i ) || ( '' === $value( $set, $type . '_photo_url' . $i ) && '' === $value( $set, $type . '_photo_internal' . $i ) ) ) {
				$this->error( sprintf( '%1$s: media link %2$d needs %3$s_photo_text%2$d and either %3$s_photo_url%2$d or %3$s_photo_internal%2$d.', $where, $i, $type ) );
			}
		}
	}

	/**
	 * Add a figure's data file and check its interactive settings. A figure
	 * whose settings cannot be used is imported with its Status set to Draft,
	 * with a warning; one whose settings are good has its saved figure built
	 * after the import.
	 *
	 * @param array      $entry Package post.
	 * @param array|null $data  Data file from add_data_file().
	 * @param string     $where Location for messages.
	 * @return array Package post.
	 */
	private function finish_figure( $entry, $data, $where ) {
		if ( $data ) {
			$entry['meta'] = array_merge( $entry['meta'], $data['meta'] );
		}

		$raw      = (string) ( $entry['meta']['figure_interactive_arguments'] ?? '' );
		$settings = '' === $raw ? null : self::parse_settings( $raw );
		$field    = array(
			'id'   => 'figure_interactive_arguments',
			'type' => 'textarea',
		);
		if ( null !== $settings ) {
			$pairs = array();
			foreach ( $settings as $key => $setting ) {
				$pairs[] = array( (string) $key, $setting );
			}
			// As saved by the edit screen: JSON.stringify() of the settings.
			$entry['meta']['figure_interactive_arguments'] = $this->sanitize( $field, (string) wp_json_encode( $pairs, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE ) );
			$entry['meta']['plotFields']                   = (string) ( $settings['graphType'] ?? '' );
		} else {
			$entry['meta']['figure_interactive_arguments'] = $this->sanitize( $field, $raw );
		}

		if ( 'Interactive' !== ( $entry['meta']['figure_path'] ?? '' ) ) {
			return $entry;
		}

		$problem = '';
		if ( '' === $raw ) {
			$problem = 'it has no figure_interactive_arguments';
		} elseif ( null === $settings ) {
			$problem = 'its figure_interactive_arguments are not valid JSON settings';
		} else {
			$graph_type = (string) ( $settings['graphType'] ?? '' );
			if ( ! in_array( $graph_type, self::GRAPH_TYPES, true ) ) {
				$problem = sprintf( 'its graph type "%s" is not one of: %s', $graph_type, implode( ', ', self::GRAPH_TYPES ) );
			} elseif ( ! in_array( $graph_type, self::NO_DATA_GRAPH_TYPES, true ) && ! $data ) {
				$problem = 'it has no data file (figure_upload_file)';
			} elseif ( 'Leaflet map' === $graph_type && 'geojson' !== $data['extension'] ) {
				$problem = 'a map needs a .geojson data file';
			} elseif ( 'Leaflet map' !== $graph_type && $data && 'geojson' === $data['extension'] ) {
				$problem = 'a .geojson data file can only be used by a map';
			} else {
				$missing = self::get_missing_columns( $settings, $data ? $data['columns'] : array() );
				if ( $missing ) {
					$problem = sprintf( 'its settings use columns that are not in its data file: %s', implode( ', ', $missing ) );
				}
			}
		}

		if ( '' !== $problem ) {
			$entry['meta']['figure_published'] = 'draft';
			$this->warnings[]                  = sprintf( 'The Figure "%s" (%s) is imported with its Status set to Draft because %s. Open it to finish its interactive settings, then publish it.', $entry['post_title'], $where, $problem );
		} else {
			$this->render[] = $entry['source_id'];
		}
		return $entry;
	}

	/**
	 * Decode interactive settings: the edit screen's array of [name, value]
	 * pairs, or an object of the same.
	 *
	 * @param string $raw Settings JSON.
	 * @return array<string, mixed>|null Settings by name, or null if invalid.
	 */
	private static function parse_settings( $raw ) {
		$decoded = json_decode( $raw, true );
		if ( ! is_array( $decoded ) ) {
			return null;
		}
		if ( ! array_is_list( $decoded ) ) {
			return array_filter( $decoded, 'is_scalar' ) === $decoded ? $decoded : null;
		}
		$settings = array();
		foreach ( $decoded as $pair ) {
			if ( ! is_array( $pair ) || 2 !== count( $pair ) || ! isset( $pair[0] ) || ! is_scalar( $pair[0] ) || ! ( is_scalar( $pair[1] ) || null === $pair[1] ) ) {
				return null;
			}
			$settings[ (string) $pair[0] ] = $pair[1];
		}
		return $settings;
	}

	/**
	 * Data columns used by bar and line graph settings that the data file
	 * does not have.
	 *
	 * @param array<string, mixed> $settings Settings.
	 * @param string[]             $columns  Data columns.
	 * @return string[]
	 */
	private static function get_missing_columns( $settings, $columns ) {
		$graph_type = $settings['graphType'] ?? '';
		$series     = array(
			'Plotly bar graph'                => array( 'Bar', 'NumberOfBars' ),
			'Plotly line graph (time series)' => array( 'Line', 'NumberOfLines' ),
		);
		if ( ! isset( $series[ $graph_type ] ) ) {
			return array();
		}
		list( $prefix, $count_key ) = $series[ $graph_type ];

		$used = array();
		if ( isset( $settings['XAxis'] ) && ! in_array( (string) $settings['XAxis'], array( '', 'None' ), true ) ) {
			$used[] = (string) $settings['XAxis'];
		}
		$count = absint( $settings[ $count_key ] ?? 0 );
		foreach ( $settings as $key => $setting ) {
			if ( ! preg_match( '/^' . $prefix . '(\d+)(|MeanField|StdDevInputValues|ErrorBarsInputValues|ErrorBarsUpperInputValues|ErrorBarsLowerInputValues)$/', (string) $key, $match ) || (int) $match[1] > $count ) {
				continue;
			}
			$setting = (string) $setting;
			if ( '' !== $setting && 'auto' !== $setting ) {
				$used[] = $setting;
			}
		}
		return array_values( array_diff( array_unique( $used ), $columns ) );
	}

	/**
	 * Write the package: manifest.json, content.json, media and data files.
	 *
	 * @param string $path Package path.
	 * @param string $hash Hash of the uploaded zip.
	 * @return true|WP_Error
	 */
	private function write_package( $path, $hash ) {
		$zip = new ZipArchive();
		if ( true !== $zip->open( $path, ZipArchive::CREATE | ZipArchive::OVERWRITE ) ) {
			return new WP_Error( 'graphic_data_transfer_zip', 'Could not prepare the bulk import.' );
		}

		$checksums = array();
		foreach ( $this->files as $name => $file ) {
			if ( is_array( $file ) ) {
				$zip->addFile( $file['path'], $name );
				$checksums[ $name ] = hash_file( 'sha256', $file['path'] );
			} else {
				$zip->addFromString( $name, $file );
				$checksums[ $name ] = hash( 'sha256', $file );
			}
		}

		$content = (string) wp_json_encode(
			array(
				'terms'       => $this->terms,
				'posts'       => $this->posts,
				'references'  => $this->references,
				'media'       => $this->media,
				'data_files'  => $this->data_files,
				'local_links' => $this->local_links,
				'render'      => $this->render,
				'warnings'    => $this->warnings,
			)
		);
		$checksums['content.json'] = hash( 'sha256', $content );
		$zip->addFromString( 'content.json', $content );

		$counts = array();
		foreach ( $this->posts as $post ) {
			$counts[ $post['post_type'] ] = ( $counts[ $post['post_type'] ] ?? 0 ) + 1;
		}
		$manifest = array(
			'format'            => Graphic_Data_Transfer_Schema::PACKAGE_FORMAT,
			'schema_version'    => Graphic_Data_Transfer_Schema::SCHEMA_VERSION,
			'plugin_version'    => defined( 'GRAPHIC_DATA_PLUGIN_VERSION' ) ? GRAPHIC_DATA_PLUGIN_VERSION : '',
			'wordpress_version' => get_bloginfo( 'version' ),
			'package_type'      => self::PACKAGE_TYPE,
			'exported_at'       => gmdate( 'c' ),
			'source'            => array( 'site_url' => self::SOURCE_PREFIX . $hash ),
			'selection'         => array(),
			'counts'            => $counts,
			'checksums'         => $checksums,
		);
		$zip->addFromString( 'manifest.json', (string) wp_json_encode( $manifest ) );

		return $zip->close() ? true : new WP_Error( 'graphic_data_transfer_zip', 'Could not prepare the bulk import.' );
	}

	// ---------------------------------------------------------------------
	// CSV to JSON
	// ---------------------------------------------------------------------

	/**
	 * Convert CSV to the JSON the Figure edit screen makes from an uploaded
	 * CSV file: a port of csvToJson() and formatJsonCompact() in
	 * admin/exopite-simple-options/fields/upload.php, giving the same text.
	 *
	 * Lines before the header row (the first line whose cells are all filled
	 * in) become metadata. Values are split on commas without quoting; blank,
	 * NA, NaN and "null" become "NA"; numbers become numbers.
	 *
	 * @param string $csv CSV text.
	 * @return string JSON text (not valid JSON if a value holds a double
	 *                quote or backslash, as on the edit screen), or '' for
	 *                an empty file, which the edit screen rejects.
	 */
	public static function csv_to_json( $csv ) {
		$lines = array();
		foreach ( explode( "\n", $csv ) as $line ) {
			$line = self::js_trim( $line );
			if ( '' !== $line ) {
				$lines[] = $line;
			}
		}
		if ( ! $lines ) {
			return '';
		}

		$header_index = 0;
		foreach ( $lines as $index => $line ) {
			$values = array_map( array( __CLASS__, 'js_trim' ), explode( ',', $line ) );
			if ( count( $values ) > 1 && ! in_array( '', $values, true ) ) {
				$header_index = $index;
				break;
			}
		}

		$metadata = array();
		foreach ( array_slice( $lines, 0, $header_index ) as $index => $line ) {
			if ( false !== strpos( $line, ':' ) ) {
				$parts                                   = explode( ':', $line );
				$metadata[ self::js_trim( $parts[0] ) ] = self::js_trim( $parts[1] );
			} else {
				$metadata[ 'meta' . ( $index + 1 ) ] = $line;
			}
		}

		$headers = array_map( array( __CLASS__, 'js_trim' ), explode( ',', $lines[ $header_index ] ) );
		$columns = array();
		foreach ( $headers as $header ) {
			$columns[ 'k' . $header ] = array();
		}
		$count = count( $lines );
		for ( $i = $header_index + 1; $i < $count; $i++ ) {
			$values = array_map( array( __CLASS__, 'js_trim' ), explode( ',', $lines[ $i ] ) );
			foreach ( $headers as $index => $header ) {
				$columns[ 'k' . $header ][] = self::parse_csv_value( $values[ $index ] ?? '' );
			}
		}

		// JavaScript objects list integer-like keys first, in numeric order.
		$keys    = array_map(
			function ( $key ) {
				return (string) substr( $key, 1 );
			},
			array_keys( $columns )
		);
		$numeric = array_values(
			array_filter(
				$keys,
				function ( $key ) {
					return (bool) preg_match( '/^(0|[1-9]\d{0,8})$/', $key );
				}
			)
		);
		sort( $numeric, SORT_NUMERIC );
		$ordered  = array_merge( $numeric, array_values( array_diff( $keys, $numeric ) ) );
		$meta_raw = array_keys( $metadata );
		$meta_num = array_values(
			array_filter(
				array_map( 'strval', $meta_raw ),
				function ( $key ) {
					return (bool) preg_match( '/^(0|[1-9]\d{0,8})$/', $key );
				}
			)
		);
		sort( $meta_num, SORT_NUMERIC );
		$meta_order = array_merge( $meta_num, array_values( array_diff( array_map( 'strval', $meta_raw ), $meta_num ) ) );

		$json  = "{\n    \"metadata\": {\n";
		$parts = array();
		foreach ( $meta_order as $key ) {
			$parts[] = '        "' . $key . '": "' . $metadata[ $key ] . '"';
		}
		$json .= implode( ",\n", $parts );
		$json .= "\n    },\n    \"data\": {\n";
		$parts = array();
		foreach ( $ordered as $key ) {
			$values = array();
			foreach ( $columns[ 'k' . $key ] as $value ) {
				$values[] = is_string( $value ) ? '"' . $value . '"' : self::js_number( $value );
			}
			$parts[] = '        "' . $key . '": [' . implode( ',', $values ) . ']';
		}
		$json .= implode( ",\n", $parts );
		$json .= "\n    }\n}";
		return $json;
	}

	/**
	 * Trim whitespace as JavaScript's String.prototype.trim() does.
	 *
	 * @param string $text Text.
	 * @return string
	 */
	public static function js_trim( $text ) {
		return (string) preg_replace( '/^[\s\x{00A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}]+|[\s\x{00A0}\x{1680}\x{2000}-\x{200A}\x{2028}\x{2029}\x{202F}\x{205F}\x{3000}\x{FEFF}]+$/u', '', (string) $text );
	}

	/**
	 * One CSV value as csvToJson() parses it: "NA" for missing values, a
	 * number (float) for numeric text, otherwise the text.
	 *
	 * @param string $value Trimmed value.
	 * @return string|float
	 */
	private static function parse_csv_value( $value ) {
		$upper = strtoupper( $value );
		if ( '' === $value || 'NA' === $upper || 'NAN' === $upper || 'null' === $value ) {
			return 'NA';
		}
		if ( ! self::is_js_number( $value ) ) {
			return $value;
		}
		if ( false !== strpos( $value, '.' ) ) {
			// parseFloat() of a numeric string is its value.
			return (float) $value;
		}
		// parseInt( value, 10 ): the leading decimal digits.
		if ( preg_match( '/^[+-]?\d+/', $value, $match ) ) {
			return (float) $match[0];
		}
		return NAN;
	}

	/**
	 * Whether JavaScript's Number() reads text as a number (isNaN() is false).
	 *
	 * @param string $value Trimmed, non-empty text.
	 * @return bool
	 */
	private static function is_js_number( $value ) {
		return (bool) preg_match( '/^([+-]?((\d+\.?\d*|\.\d+)([eE][+-]?\d+)?|Infinity)|0[xX][0-9a-fA-F]+|0[bB][01]+|0[oO][0-7]+)$/', $value );
	}

	/**
	 * A number as JavaScript writes it (String( number )).
	 *
	 * @param float $number Number.
	 * @return string
	 */
	public static function js_number( $number ) {
		if ( is_nan( $number ) ) {
			return 'NaN';
		}
		if ( is_infinite( $number ) ) {
			return $number > 0 ? 'Infinity' : '-Infinity';
		}
		if ( 0.0 === (float) $number ) {
			return '0';
		}
		$abs = abs( $number );
		// Whole numbers are exact up to 2^53; larger ones take the shortest
		// digits below, as in JavaScript.
		if ( floor( $number ) === $number && $abs < 9007199254740992 ) {
			return sprintf( '%.0f', $number );
		}

		// Shortest text that reads back as the same number.
		$text = '';
		for ( $precision = 0; $precision <= 16; $precision++ ) {
			$text = sprintf( '%.' . $precision . 'e', $number );
			if ( (float) $text === $number ) {
				break;
			}
		}
		list( $mantissa, $exponent ) = explode( 'e', $text );
		$exponent                    = (int) $exponent;
		$negative                    = '-' === $mantissa[0];
		$digits                      = rtrim( str_replace( array( '-', '.' ), '', $mantissa ), '0' );
		$sign                        = $negative ? '-' : '';

		if ( $exponent >= 21 || $exponent <= -7 ) {
			$text = $digits[0] . ( strlen( $digits ) > 1 ? '.' . substr( $digits, 1 ) : '' );
			return $sign . $text . 'e' . ( $exponent > 0 ? '+' : '-' ) . abs( $exponent );
		}
		if ( $exponent < 0 ) {
			return $sign . '0.' . str_repeat( '0', -$exponent - 1 ) . $digits;
		}
		$integer = substr( str_pad( $digits, $exponent + 1, '0' ), 0, $exponent + 1 );
		$decimal = substr( $digits, $exponent + 1 );
		return $sign . $integer . ( '' !== $decimal ? '.' . $decimal : '' );
	}
}
