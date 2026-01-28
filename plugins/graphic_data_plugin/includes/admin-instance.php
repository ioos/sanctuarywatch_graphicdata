<?php
/**
 * Instance custom content type registration and administration.
 *
 * @package Graphic_Data_Plugin
 */

include_once plugin_dir_path( __DIR__ ) . 'admin/class-utility.php';

/**
 * Registers the Instance custom post type and manages its admin interface.
 *
 * Handles post type registration, custom field creation via metaboxes, REST API
 * field exposure, admin list table column customization, and removal of bulk/quick
 * edit actions for the Instance and related post types.
 *
 * @since   1.0.0
 * @package Graphic_Data_Plugin
 */
class Graphic_Data_Instance {

	/**
	 * Registers the 'instance' custom post type with WordPress.
	 *
	 * Configures labels, REST API support, rewrite slug ('instances'), and the
	 * dashicons-admin-site menu icon. Supports only the 'title' field.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function custom_content_type_instance() {
		$labels = array(
			'name'                  => 'Instances',
			'singular_name'         => 'Instance',
			'menu_name'             => 'Instances',
			'name_admin_bar'        => 'Instance',
			'add_new'               => 'Add New Instance',
			'add_new_item'          => 'Add New Instance',
			'new_item'              => 'New Instance',
			'edit_item'             => 'Edit Instance',
			'view_item'             => 'View Instance',
			'all_items'             => 'All Instances',
			'search_items'          => 'Search Instances',
			'parent_item_colon'     => 'Parent Instances:',
			'not_found'             => 'No Instances found.',
			'not_found_in_trash'    => 'No Instances found in Trash.',
			'featured_image'        => 'Instance Cover Image',
			'set_featured_image'    => 'Set cover image',
			'remove_featured_image' => 'Remove cover image',
			'use_featured_image'    => 'Use as cover image',
			'archives'              => 'Instance archives',
			'insert_into_item'      => 'Insert into Instance',
			'uploaded_to_this_item' => 'Uploaded to this Instance',
			'filter_items_list'     => 'Filter Instances list',
			'items_list_navigation' => 'Instances list navigation',
			'items_list'            => 'Instances list',
		);

		$args = array(
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_rest'       => true,
			'query_var'          => true,
			'rewrite'            => array( 'slug' => 'instances' ),
			'capability_type'    => 'post',
			'menu_icon'          => 'dashicons-admin-site',
			'has_archive'        => true,
			'hierarchical'       => false,
			'menu_position'      => null,
			'supports'           => array( 'title' ), // array( 'title', 'revisions' ),.
		);

		register_post_type( 'instance', $args );
	}


	/**
	 * Creates the Instance metabox and registers its custom fields and REST API meta.
	 *
	 * Defines fields for short title, slug, type, overview scene, status, tile image,
	 * legacy content, colors, and footer columns. Uses the Exopite Simple Options Framework
	 * to render the metabox. Also registers non-array and array meta fields for the REST API.
	 *
	 * @since 1.0.0
	 *
	 * @param bool $return_fields_only If true, returns the fields array without registering
	 *                                 the metabox or REST meta. Used for field validation.
	 * @return array|void The fields array when $return_fields_only is true, void otherwise.
	 */
	public function create_instance_fields( $return_fields_only = false ) {

		$config_metabox = array(
			'type'              => 'metabox',                       // Required, menu or metabox.
			'id'                => 'graphic_data_plugin',              // Required, meta box id, unique, for saving meta: id[field-id].
			'post_types'        => array( 'instance' ),                 // Post types to display meta box.
			'context'           => 'advanced',                      // The context within the screen where the boxes should display: 'normal', 'side', and 'advanced'.
			'priority'          => 'default',                       // The priority within the context where the boxes should show ('high', 'low').
			'title'             => 'Instance Fields',                  // The title of the metabox.
			'capability'        => 'edit_posts',                    // The capability needed to view the page.
			'tabbed'            => true,
			'options'           => 'simple',                        // Only for metabox, options is stored az induvidual meta key, value pair.
		);

		// get list of locations, which is saved as a taxonomy.
		$function_utilities = new Graphic_Data_Utility();

		$scene_titles = array( '' => 'Scenes' );

		// used by both scene and icon dropdowns.
		if ( array_key_exists( 'post', $_GET ) ) {
			$instance_id = intval( $_GET['post'] );
			$scene_titles = $function_utilities->return_instance_scenes( $instance_id );
		}

		// create an array containing all instance types and ids from the taxonomy table.
		$instance_type_terms = get_terms(
			array(
				'taxonomy' => 'instance_type',
				'hide_empty' => false,
			)
		);

		$instance_type_array = [];
		if ( ! is_wp_error( $instance_type_terms ) && ! empty( $instance_type_terms ) ) {
			foreach ( $instance_type_terms as $term ) {
				$instance_type_array[ $term->term_id ] = ucwords( $term->slug );
			}
		}

		$fields = array(
			array(
				'id'          => 'instance_short_title',
				'type'        => 'text',
				'title'       => 'Short title*',
				'description' => 'What should the instance short title be?',
				'class'       => 'text-class',
				'sanitize'    => 'sanitize_text_field',
			),
			array(
				'id'          => 'instance_slug',
				'type'        => 'text',
				'title'       => 'URL component*',
				'description' => 'What should the URL component (or slug) of the instance be? The slug is used to determine the url of the instance. (e.g. https://yourwebsite/url-component)',
				'class'       => 'text-class',
				'sanitize'    => 'sanitize_text_field',
			),
			array(
				'id'          => 'instance_type',
				'type'        => 'select',
				'title'       => 'Instance type*',
				'options'     => $instance_type_array,
				'description' => 'What is the instance type?',
				'sanitize'    => 'absint',
			),
			array(
				'id'          => 'instance_overview_scene',
				'type'        => 'select',
				'title'       => 'Overview scene',
				'options'     => $scene_titles,
				'description' => 'What is the overview scene for the Instance?',
				'sanitize'    => 'absint',
			),
			array(
				'id'            => 'instance_status',
				'type'          => 'select',
				'title'         => 'Status*',
				'options'       => array(
					'Draft'     => 'Draft',
					'Soon'      => 'Coming soon',
					'Published' => 'Published',
				),
				'default'       => 'Draft',
				'description'  => 'Is the instance live?',
				'sanitize'      => 'sanitize_text_field',
			),
			array(
				'id'          => 'instance_tile',
				'type'        => 'image',
				'title'       => 'Tile image',
				'description' => 'What is the instance image for the front page tile? The image must be 25% wider than it is tall. Our recommendation for the image is that it is 500 pixels wide and 400 pixels tall. The minumum width is 250 pixels and the maximum is 1000 pixels.',
				'sanitize'    => 'sanitize_url',
			),
			array(
				'id'          => 'instance_legacy_content',
				'type'        => 'select',
				'title'       => 'Legacy content',
				'options'     => array(
					'no'      => 'No',
					'yes'     => 'Yes',
				),
				'default'     => 'no',
				'description' => 'Should the instance tile point to legacy content?',
				'sanitize'    => 'sanitize_text_field',
			),
			array(
				'id'          => 'instance_legacy_content_url',
				'type'        => 'text',
				'title'       => 'Legacy content URL',
				'description' => 'What is the URL of the legacy content?',
				'class'       => 'text-class',
				'sanitize'    => 'sanitize_url',
			),
			array(
				'id'          => 'instance_mobile_tile_background_color',
				'type'        => 'color',
				'title'       => 'Tile background color',
				'picker'      => 'html5',
				'default'     => '#f0f0f0',
				'description' => 'What should the background color of each tile be in mobile view?',
				'sanitize'    => 'sanitize_hex_color',
			),
			array(
				'id'          => 'instance_mobile_tile_text_color',
				'type'        => 'color',
				'title'       => 'Tile text color',
				'picker'      => 'html5',
				'default'     => '#000000',
				'description' => 'What should the text color within each tile be in mobile view?',
				'sanitize'    => 'sanitize_hex_color',
			),
			array(
				'id'          => 'instance_footer_columns',
				'type'        => 'range',
				'title'       => 'Number of instance footer columns',
				'description' => 'How many instance-specific columns should there be in the footer?',
				'min'         => 0,
				'max'         => 3,
				'step'        => 1,
				'default'     => 0,
				'sanitize'    => 'absint',
			),
		);

		// Step 1: Create an array to hold the new info sub-arrays.
		$footer_instance_fields = array();

		// Step 2: Use a loop to generate the new info sub-arrays.
		for ( $i = 1; $i <= 3; $i++ ) {
			$footer_instance_fields[] = array(
				'type' => 'fieldset',
				'id' => 'instance_footer_column' . $i,
				'title'   => 'Footer column ' . $i,
				'fields' => array(
					array(
						'id'          => 'instance_footer_column_title' . $i,
						'type'        => 'text',
						'title'       => 'Column header',
						'class'       => 'text-class',
						'sanitize'    => 'sanitize_text_field',
					),
					array(
						'id'     => 'instance_footer_column_content' . $i,
						'type'   => 'editor',
						'editor' => 'trumbowyg',
						'title'  => 'Column content',
						'sanitize'    => 'wp_kses_post',
					),
				),
			);
		}

		array_splice( $fields, 11, 0, $footer_instance_fields );

		$fields_holder[] = array(
			'name'   => 'basic',
			'title'  => 'Basic',
			'icon'   => 'dashicons-admin-generic',
			'fields' => $fields,
		);

		// If we're just running this function to get the custom field list for field validation, return early.
		if ( $return_fields_only ) {
			return $fields;
		}

		// instantiate the admin page.
		$options_panel = new Exopite_Simple_Options_Framework( $config_metabox, $fields_holder );

		// make several of the instance custom fields available to the REST API.
		$instance_rest_fields = array(
			array( 'instance_short_title', 'string' ),
			array( 'instance_slug', 'string' ),
			array( 'instance_type', 'string' ),
			array( 'instance_status', 'string' ),
			array( 'instance_tile', 'string' ),
			array( 'instance_toc_style', 'string' ),
			array( 'instance_colored_sections', 'string' ),
			array( 'instance_hover_color', 'string' ),
			array( 'instance_full_screen_button', 'string' ),
			array( 'instance_overview_scene', 'integer' ),
			array( 'instance_footer_columns', 'integer' ),
			array( 'instance_mobile_tile_background_color', 'string' ),
			array( 'instance_mobile_tile_text_color', 'string' ),
		);

		// register non-array fields for the REST API.
		$this->register_meta_nonarray_fields( $instance_rest_fields );

		// register array fields for the REST API.
		$this->register_meta_array_fields();
	}

	/**
	 * Registers non-array post meta fields for the REST API.
	 *
	 * Iterates over the provided field definitions and registers each as a single-value,
	 * read-only post meta field exposed via the REST API.
	 *
	 * @since 1.0.0
	 *
	 * @param array $rest_fields An array of field definitions, where each element is an
	 *                           indexed array with [0] as the meta key and [1] as the data type.
	 * @return void
	 */
	public function register_meta_nonarray_fields( $rest_fields ) {
		foreach ( $rest_fields as $target_field ) {
			register_meta(
				'post', // Object type. In this case, 'post' refers to custom post type 'Figure'.
				$target_field[0], // Meta key name.
				array(
					'show_in_rest' => true, // Make the field available in REST API.
					'single' => true, // Indicates whether the meta key has one single value.
					'type' => $target_field[1], // Data type of the meta value.
					'auth_callback' => '__return_false', // Return false to disallow writing.
				)
			);
		}
	}

	/**
	 * Registers the instance footer column meta fields for the REST API.
	 *
	 * Registers `instance_footer_column1` through `instance_footer_column3` as read-only,
	 * single post meta fields. Each field stores an array of strings and is exposed via
	 * the REST API with the appropriate array schema.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function register_meta_array_fields() {
		for ( $i = 1; $i < 4; $i++ ) {
			$target_field = 'instance_footer_column' . $i;
			$target_description = 'Instance footer column ' . $i;
			register_meta(
				'post',
				$target_field,
				array(
					'auth_callback'     => '__return_false',
					'single'            => true, // The field contains a single array.
					'description' => $target_description, // Description of the meta key.
					'show_in_rest'      => array(
						'schema' => array(
							'type'  => 'array', // The meta field is an array.
							'items' => array(
								'type' => 'string', // Each item in the array is a string.
							),
						),
					),
				)
			);
		}
	}

	/**
	 * Registers Instance custom fields as REST API response fields.
	 *
	 * Delegates to {@see Graphic_Data_Utility::register_custom_rest_fields()} to expose
	 * instance meta fields (short title, slug, type, status, tile, overview scene, footer
	 * columns, and color settings) on the 'instance' post type REST endpoint.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function register_instance_rest_fields() {
		$instance_rest_fields = array(
			'instance_short_title',
			'instance_slug',
			'instance_type',
			'instance_status',
			'instance_tile',
			'instance_overview_scene',
			'instance_footer_columns',
			'instance_mobile_tile_background_color',
			'instance_mobile_tile_text_color',
			'instance_footer_column1',
			'instance_footer_column2',
			'instance_footer_column3',
		);
			$function_utilities = new Graphic_Data_Utility();
			$function_utilities->register_custom_rest_fields( 'instance', $instance_rest_fields );
	}

	/**
	 * Defines the columns displayed on the Instance post type admin list table.
	 *
	 * Replaces the default columns with Title, Tile, Type, Overview, State, and Status.
	 * Intended for use with the 'manage_instance_posts_columns' filter.
	 *
	 * @link  https://www.smashingmagazine.com/2017/12/customizing-admin-columns-wordpress/
	 * @since 1.0.0
	 *
	 * @param array $columns The default columns array.
	 * @return array The replacement columns array.
	 */
	public function change_instance_columns( $columns ) {
		$columns = array(
			'title' => 'Title',
			'tile' => 'Tile',
			'type' => 'Type',
			'overview_scene' => 'Overview',
			'state' => 'State',
			'status' => 'Status',
		);
		return $columns;
	}

	/**
	 * Renders the content for custom columns on the Instance admin list table.
	 *
	 * Outputs the appropriate value for each custom column: type (taxonomy term slug),
	 * tile (thumbnail image), state (instance status meta), overview_scene (linked scene
	 * title), and status (last modified timestamp and author name). Intended for use
	 * with the 'manage_instance_posts_custom_column' action.
	 *
	 * @since 1.0.0
	 *
	 * @param string $column  The column slug being rendered.
	 * @param int    $post_id The ID of the current Instance post.
	 * @return void
	 */
	public function custom_instance_column( $column, $post_id ) {

		if ( 'type' === $column ) {
			global $wpdb;
			$instance_type_id = get_post_meta( $post_id, 'instance_type', true );
			$instance_type_slug = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT slug FROM {$wpdb->terms} WHERE term_id = %d",
					$instance_type_id
				)
			);
			if ( ! empty( $instance_type_slug ) ) {
				echo esc_html( ucwords( $instance_type_slug ) );
			}
		}

		if ( 'tile' === $column ) {
			$instance_tile = get_post_meta( $post_id, 'instance_tile', true );
			if ( ! empty( $instance_tile ) ) {
					echo '<img src="' . esc_url( $instance_tile ) . '" style="max-width:100px; max-height:100px;" /><br>';
			}
		}

		if ( 'state' === $column ) {
			echo esc_html( get_post_meta( $post_id, 'instance_status', true ) );
		}

		if ( 'overview_scene' === $column ) {
			$instance_overview_scene = get_post_meta( $post_id, 'instance_overview_scene', true );
			if ( ! empty( $instance_overview_scene ) ) {
				echo esc_html( get_the_title( $instance_overview_scene ) );
			}
		}

		if ( 'status' === $column ) {
			$last_modified_timestamp = get_post_modified_time( 'U', false, $post_id );
			$last_modified_time_str = wp_date( get_option( 'time_format' ), $last_modified_timestamp );
			$last_modified_date_str = wp_date( get_option( 'date_format' ), $last_modified_timestamp );

			$last_modified_user_id = get_post_field( 'post_author', $post_id );
			$last_modified_user = get_userdata( $last_modified_user_id );
			$last_modified_name = $last_modified_user->first_name . ' ' . $last_modified_user->last_name;

			echo 'Last updated at ' . esc_html( $last_modified_time_str ) . ' on ' . esc_html( $last_modified_date_str ) . ' by ' . esc_html( $last_modified_name );
		}
	}


	/**
	 * Removes bulk action options from custom post type admin list tables.
	 *
	 * Strips bulk-edit, edit, trash, spam, unspam, and delete actions for the scene,
	 * modal, figure, and instance post types. Intended for use with the
	 * 'bulk_actions-edit-{post_type}' filter.
	 *
	 * @since 1.0.0
	 *
	 * @param array $actions Associative array of available bulk actions.
	 * @return array The filtered bulk actions array.
	 */
	public function remove_bulk_actions( $actions ) {
		global $post_type;

		if ( 'scene' === $post_type || 'modal' === $post_type || 'figure' === $post_type || 'instance' === $post_type ) {
			unset( $actions['bulk-edit'] );
			unset( $actions['edit'] );
			unset( $actions['trash'] );
			unset( $actions['spam'] );
			unset( $actions['unspam'] );
			unset( $actions['delete'] );
		}
		return $actions;
	}

	/**
	 * Removes the Quick Edit row action from custom post type admin list tables.
	 *
	 * Unconditionally removes Quick Edit for instance, figure, and modal post types.
	 * For the scene post type, Quick Edit is preserved for administrators and content
	 * managers but removed for all other roles.
	 *
	 * @since 1.0.0
	 *
	 * @param string[] $actions Associative array of row action links.
	 * @param WP_Post  $post    The post object for the current row.
	 * @return string[] The filtered row actions array.
	 */
	public function custom_content_remove_quick_edit_link( $actions, $post ) {
		global $current_screen;
		$current_post_type = $current_screen->post_type;
		if ( 'instance' == $current_post_type || 'figure' == $current_post_type || 'modal' == $current_post_type ) {
			unset( $actions['inline hide-if-no-js'] );
		}
		if ( 'scene' == $current_post_type ) {
			$remove_quick_edit = true;
			$current_user = wp_get_current_user();
			if ( gettype( $current_user ) == 'object' && property_exists( $current_user, 'roles' ) ) {
				$current_user_role = $current_user->roles[0];
				if ( 'administrator' == $current_user_role || 'content_manager' == $current_user_role ) {
					$remove_quick_edit = false;
				}
			}
			if ( $remove_quick_edit ) {
				unset( $actions['inline hide-if-no-js'] );
			}
		}
		return $actions;
	}
}
