<?php
/**
 * WordPress revisions for the Graphic Data post types.
 *
 * About, Instance, Scene, Modal and Figure posts keep almost all of their
 * content in post meta (saved by Exopite in "simple" mode), while core
 * revisions only cover the title, content and excerpt. This class makes each
 * type's fields part of its revisions:
 *
 *   - The fields are those the Content Transfer tool moves
 *     (Graphic_Data_Transfer_Schema::get_meta_keys()). They are added through
 *     core's `wp_post_revision_meta_keys` filter, so core copies them into
 *     every revision, saves a revision when only a field changed, and puts
 *     them back when a revision is restored.
 *   - The Revisions screen compares the fields too, one row per field.
 *   - After a restore, the latest revision is brought in line with the
 *     restored fields, and a restored Figure is queued for its standalone
 *     HTML (Graphic_Data_Figure_Html_Rebuild).
 *
 * Figure data files in wp-content/data/figure_<ID>/ stay on the server while
 * the Figure or any of its revisions uses them: uploads never replace a file,
 * and Delete File only takes the file off the Figure (see
 * Graphic_Data_Figure::custom_file_delete_handler()). So a restored Figure
 * gets its earlier data back. When a revision is deleted, the data files only
 * it used are removed.
 *
 * @package Graphic_Data_Plugin
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Class Graphic_Data_Revisions.
 *
 * @since 1.10.0
 */
class Graphic_Data_Revisions {

	/**
	 * Post types whose fields are revisioned.
	 */
	const POST_TYPES = array( 'about', 'instance', 'scene', 'modal', 'figure' );

	/**
	 * Start of the names given to the fields on the Revisions screen. Kept
	 * apart from the meta keys themselves, which are also form fields on the
	 * edit screen and so would be copied into autosaves as post fields.
	 */
	const FIELD_PREFIX = 'graphic_data_field__';

	/**
	 * Revision saved since the current restore began, by post ID.
	 *
	 * @var array<int, int>
	 */
	private $saved_revisions = array();

	/**
	 * Figure and data file names of each Figure revision being deleted, by
	 * revision ID.
	 *
	 * @var array<int, array{0: int, 1: string[]}>
	 */
	private $deleted_revision_files = array();

	/**
	 * Field labels and fieldset item labels, by post type.
	 *
	 * @var array<string, array{fields: array<string, string>, items: array<string, string>}>
	 */
	private $labels = array();

	/**
	 * Add each Graphic Data type's fields to the meta keys core revisions.
	 *
	 * Filter callback for `wp_post_revision_meta_keys`.
	 *
	 * @param string[] $keys      Revisioned meta keys.
	 * @param string   $post_type Post type.
	 * @return string[]
	 */
	public function add_revisioned_meta_keys( $keys, $post_type ) {
		if ( ! in_array( $post_type, self::POST_TYPES, true ) ) {
			return $keys;
		}
		return array_values( array_unique( array_merge( (array) $keys, Graphic_Data_Transfer_Schema::get_meta_keys( $post_type ) ) ) );
	}

	/**
	 * Add each field to the fields the Revisions screen compares.
	 *
	 * Filter callback for `_wp_post_revision_fields`. Core reads these fields
	 * from the post object, where they are always empty, so they never count
	 * as a change or get written to a post; get_field_text() supplies what the
	 * Revisions screen shows.
	 *
	 * wp_restore_post_revision() is the only caller that passes a revision,
	 * just before it updates the post, so that call also marks the start of a
	 * restore for finish_restore().
	 *
	 * @param array<string, string> $fields Field name => label.
	 * @param array|WP_Post|null    $post   Post whose revisions are compared.
	 * @return array<string, string>
	 */
	public function add_revision_fields( $fields, $post = null ) {
		$post_type = is_array( $post ) ? ( $post['post_type'] ?? '' ) : ( $post->post_type ?? '' );
		if ( 'revision' === $post_type ) {
			$this->saved_revisions = array();
			return $fields;
		}
		if ( ! in_array( $post_type, self::POST_TYPES, true ) ) {
			return $fields;
		}

		$labels = $this->get_labels( $post_type );
		foreach ( Graphic_Data_Transfer_Schema::get_meta_keys( $post_type ) as $key ) {
			$field            = self::FIELD_PREFIX . $key;
			$fields[ $field ] = $labels['fields'][ $key ] ?? ucfirst( str_replace( '_', ' ', $key ) );
			add_filter( "_wp_post_revision_field_{$field}", array( $this, 'get_field_text' ), 10, 3 );
		}
		return $fields;
	}

	/**
	 * Text of a field for the Revisions screen.
	 *
	 * Filter callback for `_wp_post_revision_field_{$field}`.
	 *
	 * @param string  $value    Value read from the post object (unused).
	 * @param string  $field    Field name (FIELD_PREFIX plus the meta key).
	 * @param WP_Post $revision Revision, or the post itself.
	 * @return string
	 */
	public function get_field_text( $value, $field, $revision ) {
		$key       = substr( $field, strlen( self::FIELD_PREFIX ) );
		$meta      = get_post_meta( $revision->ID, $key, true );
		$post_type = get_post_type( $revision->post_parent ? $revision->post_parent : $revision->ID );

		if ( '' === $meta || null === $meta || array() === $meta ) {
			return '';
		}

		if ( 'figure_interactive_args_rendered' === $key ) {
			// The generated chart is too long to compare; show whether it changed.
			return sprintf( 'Generated from the chart settings: %s characters (fingerprint %s)', number_format_i18n( strlen( (string) $meta ) ), substr( md5( (string) $meta ), 0, 8 ) );
		}

		if ( 'figure_interactive_arguments' === $key ) {
			$settings = json_decode( (string) $meta, true );
			if ( is_array( $settings ) ) {
				$lines = array();
				foreach ( $settings as $setting ) {
					if ( is_array( $setting ) && 2 === count( $setting ) ) {
						$lines[] = $setting[0] . ': ' . ( is_scalar( $setting[1] ) ? $setting[1] : wp_json_encode( $setting[1] ) );
					}
				}
				return implode( "\n", $lines );
			}
		}

		if ( is_array( $meta ) ) {
			// A fieldset, stored as one array.
			$labels = $this->get_labels( (string) $post_type );
			$lines  = array();
			foreach ( $meta as $item => $item_value ) {
				$label   = $labels['items'][ $item ] ?? $item;
				$lines[] = $label . ': ' . ( is_scalar( $item_value ) ? $item_value : wp_json_encode( $item_value ) );
			}
			return implode( "\n", $lines );
		}

		$references = Graphic_Data_Transfer_Schema::get_post_references( (string) $post_type );
		if ( isset( $references[ $key ] ) && ctype_digit( (string) $meta ) && get_post( (int) $meta ) ) {
			return sprintf( '%s (ID %d)', get_the_title( (int) $meta ), (int) $meta );
		}

		return (string) $meta;
	}

	/**
	 * Note the revision saved for a post during this request.
	 *
	 * Action callback for `_wp_put_post_revision`, after core has copied the
	 * fields into the revision.
	 *
	 * @param int $revision_id Revision ID.
	 * @param int $post_id     Post ID.
	 * @return void
	 */
	public function record_saved_revision( $revision_id, $post_id ) {
		$this->saved_revisions[ (int) $post_id ] = (int) $revision_id;
	}

	/**
	 * Finish restoring a revision.
	 *
	 * Action callback for `wp_restore_post_revision`, after core has restored
	 * the fields. Core saves a revision while it restores the title, before
	 * the fields, so that revision holds the fields as they were before the
	 * restore. It is given the restored fields; if no revision was saved,
	 * one is saved now, so the latest revision always matches the post.
	 *
	 * @param int $post_id     Post ID.
	 * @param int $revision_id ID of the revision that was restored.
	 * @return void
	 */
	public function finish_restore( $post_id, $revision_id ) {
		$post_type = get_post_type( $post_id );
		if ( ! in_array( $post_type, self::POST_TYPES, true ) ) {
			return;
		}

		if ( isset( $this->saved_revisions[ $post_id ] ) ) {
			$latest_id = $this->saved_revisions[ $post_id ];
			unset( $this->saved_revisions[ $post_id ] );
			// delete_post_meta() and add_post_meta() would act on the post, not the revision.
			foreach ( wp_post_revision_meta_keys( $post_type ) as $key ) {
				delete_metadata( 'post', $latest_id, $key );
				foreach ( get_post_meta( $post_id, $key ) as $value ) {
					add_metadata( 'post', $latest_id, $key, wp_slash( $value ) );
				}
			}
		} else {
			wp_save_post_revision( $post_id );
		}

		if ( 'figure' === $post_type ) {
			Graphic_Data_Figure_Html_Rebuild::enqueue( array( $post_id ) );
		}
	}

	/**
	 * Note the data files of a Figure revision that is about to be deleted.
	 *
	 * Action callback for `before_delete_post`, while the revision's fields
	 * can still be read.
	 *
	 * @param int $post_id ID of the post being deleted.
	 * @return void
	 */
	public function remember_revision_data_files( $post_id ) {
		$post = get_post( $post_id );
		if ( ! $post || 'revision' !== $post->post_type || 'figure' !== get_post_type( $post->post_parent ) ) {
			return;
		}
		$this->deleted_revision_files[ (int) $post_id ] = array( (int) $post->post_parent, Graphic_Data_Figure::get_data_file_names( $post_id ) );
	}

	/**
	 * Remove the data files that only a deleted Figure revision used.
	 *
	 * Action callback for `deleted_post`.
	 *
	 * @param int $post_id ID of the deleted post.
	 * @return void
	 */
	public function remove_revision_data_files( $post_id ) {
		if ( ! isset( $this->deleted_revision_files[ $post_id ] ) ) {
			return;
		}
		list( $figure_id, $file_names ) = $this->deleted_revision_files[ $post_id ];
		unset( $this->deleted_revision_files[ $post_id ] );
		Graphic_Data_Figure::remove_unused_data_files( $figure_id, $file_names );
	}

	/**
	 * Edit screen labels of a post type's fields, from the bulk import
	 * column definitions (Graphic_Data_Transfer_Tsv::get_columns()).
	 *
	 * @param string $post_type Post type.
	 * @return array{fields: array<string, string>, items: array<string, string>}
	 */
	private function get_labels( $post_type ) {
		if ( isset( $this->labels[ $post_type ] ) ) {
			return $this->labels[ $post_type ];
		}

		$labels = array(
			'fields' => array(
				'figure_interactive_args_rendered' => 'Saved chart',
			),
			'items'  => array(),
		);
		$columns = isset( Graphic_Data_Transfer_Tsv::FIELD_CLASSES[ $post_type ] ) ? Graphic_Data_Transfer_Tsv::get_columns( $post_type ) : array();
		foreach ( $columns as $name => $column ) {
			if ( '' === $column['parent'] ) {
				$labels['fields'][ $name ] = $column['label'];
				continue;
			}
			// Fieldset item labels are "<fieldset title>: <item title>".
			$parts                                       = explode( ': ', $column['label'], 2 );
			$labels['fields'][ $column['parent'] ]       = $parts[0];
			$labels['items'][ $name ]                    = $parts[1] ?? $parts[0];
		}

		$this->labels[ $post_type ] = $labels;
		return $labels;
	}
}
