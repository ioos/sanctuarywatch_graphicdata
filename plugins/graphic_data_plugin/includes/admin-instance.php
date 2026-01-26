<?php
/**
 * Register class that defines the Instance custom content type as well as associated Instance functions 
 * 
 */
include_once plugin_dir_path(dirname(__FILE__)) . 'admin/class-utility.php';
class Instance
{

	/**
	 * Create Instance custom content type.
	 *
	 * @since    1.0.0
	 */
	function custom_content_type_instance()
	{
		$labels = array(
			'name' => _x('Instances', 'Post type general name', 'textdomain'),
			'singular_name' => _x('Instance', 'Post type singular name', 'textdomain'),
			'menu_name' => _x('Instances', 'Admin Menu text', 'textdomain'),
			'name_admin_bar' => _x('Instance', 'Add New on Toolbar', 'textdomain'),
			'add_new' => __('Add New Instance', 'textdomain'),
			'add_new_item' => __('Add New Instance', 'textdomain'),
			'new_item' => __('New Instance', 'textdomain'),
			'edit_item' => __('Edit Instance', 'textdomain'),
			'view_item' => __('View Instance', 'textdomain'),
			'all_items' => __('All Instances', 'textdomain'),
			'search_items' => __('Search Instances', 'textdomain'),
			'parent_item_colon' => __('Parent Instances:', 'textdomain'),
			'not_found' => __('No Instances found.', 'textdomain'),
			'not_found_in_trash' => __('No Instances found in Trash.', 'textdomain'),
			'featured_image' => _x('Instance Cover Image', 'Overrides the “Featured Image” phrase for this post type. Added in 4.3', 'textdomain'),
			'set_featured_image' => _x('Set cover image', 'Overrides the “Set featured image” phrase for this post type. Added in 4.3', 'textdomain'),
			'remove_featured_image' => _x('Remove cover image', 'Overrides the “Remove featured image” phrase for this post type. Added in 4.3', 'textdomain'),
			'use_featured_image' => _x('Use as cover image', 'Overrides the “Use as featured image” phrase for this post type. Added in 4.3', 'textdomain'),
			'archives' => _x('Instance archives', 'The post type archive label used in nav menus. Default “Post Archives”. Added in 4.4', 'textdomain'),
			'insert_into_item' => _x('Insert into Instance', 'Overrides the “Insert into post”/”Insert into page” phrase (used when inserting media into a post). Added in 4.4', 'textdomain'),
			'uploaded_to_this_item' => _x('Uploaded to this Instance', 'Overrides the “Uploaded to this post”/”Uploaded to this page” phrase (used when viewing media attached to a post). Added in 4.4', 'textdomain'),
			'filter_items_list' => _x('Filter Instances list', 'Screen reader text for the filter links heading on the post type listing screen. Default “Filter posts list”/”Filter pages list”. Added in 4.4', 'textdomain'),
			'items_list_navigation' => _x('Instances list navigation', 'Screen reader text for the pagination heading on the post type listing screen. Default “Posts list navigation”/”Pages list navigation”. Added in 4.4', 'textdomain'),
			'items_list' => _x('Instances list', 'Screen reader text for the items list heading on the post type listing screen. Default “Posts list”/”Pages list”. Added in 4.4', 'textdomain'),
		);

		$args = array(
			'labels' => $labels,
			'public' => true,
			'publicly_queryable' => true,
			'show_ui' => true,
			'show_in_menu' => true,
			'show_in_rest' => true,
			'query_var' => true,
			'rewrite' => array('slug' => 'instances'),
			'capability_type' => 'post',
			'menu_icon' => 'dashicons-admin-site',
			'has_archive' => true,
			'hierarchical' => false,
			'menu_position' => null,
			'supports' => array('title'), //array( 'title', 'revisions' ), 
		);

		register_post_type('instance', $args);
	}


	/**
	 * Create custom fields, using metaboxes, for Instance custom content type.
	 * 
	 * @param bool $return_fields_only If true, only return the custom fields array without registering the metabox (used as part of field validation).
	 * @since    1.0.0
	 */
	function create_instance_fields($return_fields_only = false)
	{

		$config_metabox = array(

			/*
			 * METABOX
			 */
			'type' => 'metabox',                       // Required, menu or metabox
			'id' => 'graphic_data_plugin',              // Required, meta box id, unique, for saving meta: id[field-id]
			'post_types' => array('instance'),                 // Post types to display meta box
			'context' => 'advanced',                      // 	The context within the screen where the boxes should display: 'normal', 'side', and 'advanced'.
			'priority' => 'default',                       // 	The priority within the context where the boxes should show ('high', 'low').
			'title' => 'Instance Fields',                  // The title of the metabox
			'capability' => 'edit_posts',                    // The capability needed to view the page
			'tabbed' => true,
			'options' => 'simple',                        // Only for metabox, options is stored az induvidual meta key, value pair.
		);


		// get list of locations, which is saved as a taxonomy
		$function_utilities = new Utility();

		$scene_titles = array("" => "Scenes");

		// used by both scene and icon dropdowns
		if (array_key_exists("post", $_GET)) {
			$instance_id = intval($_GET["post"]);
			$scene_titles = $function_utilities->returnInstanceScenes($instance_id);
		}

		// create an array containing all instance types and ids from the taxonomy table
		$instance_type_terms = get_terms(array(
			'taxonomy' => 'instance_type',
			'hide_empty' => false,
		));

		$instance_type_array = [];
		if (!is_wp_error($instance_type_terms) && !empty($instance_type_terms)) {
			foreach ($instance_type_terms as $term) {
				$instance_type_array[$term->term_id] = ucwords($term->slug);
			}
		}

		$fields = array(
			array(
				'id' => 'instance_short_title',
				'type' => 'text',
				'title' => 'Short title*',
				'description' => 'What should the instance short title be?',
				'class' => 'text-class',
			),
			array(
				'id' => 'instance_slug',
				'type' => 'text',
				'title' => 'URL component*',
				'description' => 'What should the URL component (or slug) of the instance be? The slug is used to determine the url of the instance. (e.g. https://yourwebsite/url-component)',
				'class' => 'text-class',
			),
			array(
				'id' => 'instance_latitude',
				'type' => 'text',
				'title' => 'Latitude',
				'description' => 'Latitude of the sanctuary for the map.',
				'class' => 'text-class',
			),
			array(
				'id' => 'instance_longitude',
				'type' => 'text',
				'title' => 'Longitude',
				'description' => 'Longitude of the sanctuary for the map.',
				'class' => 'text-class',
			),
			array(
				'id' => 'instance_type',
				'type' => 'select',
				'title' => 'Instance type*',
				'options' => $instance_type_array,
				'description' => 'What is the instance type?',
			),
			array(
				'id' => 'instance_overview_scene',
				'type' => 'select',
				'title' => 'Overview scene',
				'options' => $scene_titles,
				'description' => 'What is the overview scene for the Instance?',
			),
			array(
				'id' => 'instance_status',
				'type' => 'select',
				'title' => 'Status*',
				'options' => array("Draft" => "Draft", "Soon" => "Coming soon", "Published" => "Published"),
				'default' => 'Draft',
				'description' => 'Is the instance live?',
				//    'class'      => 'chosen', 
			),
			array(
				'id' => 'instance_tile',
				'type' => 'image',
				'title' => 'Tile image',
				'description' => 'What is the instance image for the front page tile? The image must be 25% wider than it is tall. Our recommendation for the image is that it is 500 pixels wide and 400 pixels tall. The minumum width is 250 pixels and the maximum is 1000 pixels.'
			),
			array(
				'id' => 'instance_legacy_content',
				'type' => 'select',
				'title' => 'Legacy content',
				'options' => array("no" => "No", "yes" => "Yes"),
				'default' => 'no',
				'description' => 'Should the instance tile point to legacy content?',
			),
			array(
				'id' => 'instance_legacy_content_url',
				'type' => 'text',
				'title' => 'Legacy content URL',
				'description' => 'What is the URL of the legacy content?',
				'class' => 'text-class',
			),
			array(
				'id' => 'instance_mobile_tile_background_color',
				'type' => 'color',
				'title' => 'Tile background color',
				'picker' => 'html5',
				'default' => '#f0f0f0',
				'description' => 'What should the background color of each tile be in mobile view?',
			),
			array(
				'id' => 'instance_mobile_tile_text_color',
				'type' => 'color',
				'title' => 'Tile text color',
				'picker' => 'html5',
				'default' => '#000000',
				'description' => 'What should the text color within each tile be in mobile view?',
			),
			array(
				'id' => 'instance_footer_columns',
				'type' => 'range',
				'title' => 'Number of instance footer columns',
				'description' => 'How many instance-specific columns should there be in the footer?',
				'min' => 0,
				'max' => 3,
				'step' => 1,
				'default' => 0,
			),
		);

		// Step 1: Create an array to hold the new info sub-arrays
		$footerInstanceFields = array();

		// Step 2: Use a loop to generate the new info sub-arrays
		for ($i = 1; $i <= 3; $i++) {
			$footerInstanceFields[] = array(
				'type' => 'fieldset',
				'id' => 'instance_footer_column' . $i,
				'title' => 'Footer column ' . $i,
				'fields' => array(
					array(
						'id' => 'instance_footer_column_title' . $i,
						'type' => 'text',
						'title' => 'Column header',
						'class' => 'text-class',
					),
					array(
						'id' => 'instance_footer_column_content' . $i,
						'type' => 'editor',
						'editor' => 'trumbowyg',
						'title' => 'Column content',
					),
				),
			);
		}

		array_splice($fields, 11, 0, $footerInstanceFields);

		$fieldsHolder[] = array(
			'name' => 'basic',
			'title' => 'Basic',
			'icon' => 'dashicons-admin-generic',
			'fields' => $fields,
		);

		// If we're just running this function to get the custom field list for field validation, return early
		if ($return_fields_only) {
			return $fields;
		}

		// instantiate the admin page
		$options_panel = new Exopite_Simple_Options_Framework($config_metabox, $fieldsHolder);

		// make several of the instance custom fields available to the REST API
		$instance_rest_fields = array(
			array('instance_short_title', 'string'),
			array('instance_slug', 'string'),
			array('instance_latitude', 'string'),
			array('instance_longitude', 'string'),
			array('instance_type', 'string'),
			array('instance_status', 'string'),
			array('instance_tile', 'string'),
			array('instance_toc_style', 'string'),
			array('instance_colored_sections', 'string'),
			array('instance_hover_color', 'string'),
			array('instance_full_screen_button', 'string'),
			array('instance_overview_scene', 'integer'),
			array('instance_footer_columns', 'integer'),
			array('instance_mobile_tile_background_color', 'string'),
			array('instance_mobile_tile_text_color', 'string')
		);


		//register non-array fields for the REST API
		$this->register_meta_nonarray_fields($instance_rest_fields);

		// register array fields for the REST API
		$this->register_meta_array_fields();
	}

	function register_meta_nonarray_fields($rest_fields)
	{
		foreach ($rest_fields as $target_field) {
			register_meta(
				'post', // Object type. In this case, 'post' refers to custom post type 'Figure'
				$target_field[0], // Meta key name
				array(
					'show_in_rest' => true, // Make the field available in REST API
					'single' => true, // Indicates whether the meta key has one single value
					'type' => $target_field[1], // Data type of the meta value
					'auth_callback' => '__return_false' //Return false to disallow writing
				)
			);
		}
	}

	function register_meta_array_fields()
	{
		for ($i = 1; $i < 4; $i++) {
			$target_field = "instance_footer_column" . $i;
			$target_description = "Instance footer column " . $i;
			register_meta(
				'post',
				$target_field,
				array(
					'auth_callback' => '__return_false',
					'single' => true, // The field contains a single array
					'description' => $target_description, // Description of the meta key
					'show_in_rest' => array(
						'schema' => array(
							'type' => 'array', // The meta field is an array
							'items' => array(
								'type' => 'string', // Each item in the array is a string
							),
						),
					),
				)
			);
		}
	}

	/**
	 * Register Instance custom fields for use by REST API.
	 *
	 * @since    1.0.0
	 */
	function register_instance_rest_fields()
	{
		$instance_rest_fields = array(
			'instance_short_title',
			'instance_slug',
			'instance_latitude',
			'instance_longitude',
			'instance_type',
			'instance_status',
			'instance_tile',
			'instance_overview_scene',
			'instance_footer_columns',
			'instance_mobile_tile_background_color',
			'instance_mobile_tile_text_color',
			'instance_footer_column1',
			'instance_footer_column2',
			'instance_footer_column3'
		);
		$function_utilities = new Utility();
		$function_utilities->register_custom_rest_fields("instance", $instance_rest_fields);
	}

	/**
	 * Set columns in admin screen for Scene custom content type.
	 *
	 * @link https://www.smashingmagazine.com/2017/12/customizing-admin-columns-wordpress/
	 * @since    1.0.0
	 */
	public function change_instance_columns($columns)
	{
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

	// Populate columns for admin screen for Instance custom content type
	public function custom_instance_column($column, $post_id)
	{

		if ($column === 'type') {
			global $wpdb;
			$instance_type_id = get_post_meta($post_id, 'instance_type', true);
			$instance_type_slug = $wpdb->get_var($wpdb->prepare(
				"SELECT slug FROM {$wpdb->terms} WHERE term_id = %d",
				$instance_type_id
			));
			if (!empty($instance_type_slug)) {
				echo ucwords($instance_type_slug);
			}
		}

		if ($column === 'tile') {
			$instance_tile = get_post_meta($post_id, 'instance_tile', true);
			if (!empty($instance_tile)) {
				echo '<img src="' . esc_url($instance_tile) . '" style="max-width:100px; max-height:100px;" /><br>';
			}
		}

		if ($column === 'state') {
			echo get_post_meta($post_id, 'instance_status', true);
		}

		if ($column === 'overview_scene') {
			$instance_overview_scene = get_post_meta($post_id, 'instance_overview_scene', true);
			if (!empty($instance_overview_scene)) {
				echo get_the_title($instance_overview_scene);
			}
		}

		if ($column === "status") {
			$last_modified_timestamp = get_post_modified_time('U', false, $post_id);
			$last_modified_time_str = wp_date(get_option('time_format'), $last_modified_timestamp);
			$last_modified_date_str = wp_date(get_option('date_format'), $last_modified_timestamp);

			$last_modified_user_id = get_post_field('post_author', $post_id);
			$last_modified_user = get_userdata($last_modified_user_id);
			$last_modified_name = $last_modified_user->first_name . " " . $last_modified_user->last_name;

			echo "Last updated at " . esc_html($last_modified_time_str) . " on " . esc_html($last_modified_date_str) . " by " . esc_html($last_modified_name);
		}
	}


	/**
	 * Remove Bulk Actions dropdown from Scene, Modal, Figure, and Instance admin screens.
	 *
	 * @param array $actions An array of the available bulk actions.
	 * @since    1.0.0
	 */
	function remove_bulk_actions($actions)
	{
		global $post_type;

		if ($post_type === 'scene' || $post_type === 'modal' || $post_type === 'figure' || $post_type === 'instance') {
			unset($actions['bulk-edit']);
			unset($actions['edit']);
			unset($actions['trash']);
			unset($actions['spam']);
			unset($actions['unspam']);
			unset($actions['delete']);
		}
		return $actions;
	}

	/**
	 * Remove Quick Edit links from most custom content admin screens.
	 *
	 * @param string[] $actions An array of row action links.
	 * @param int $post The database id of the post.
	 * @since    1.0.0
	 */
	function custom_content_remove_quick_edit_link($actions, $post)
	{
		global $current_screen;
		$current_post_type = $current_screen->post_type;
		if ($current_post_type == 'instance' || $current_post_type == 'figure' || $current_post_type == 'modal') {
			unset($actions['inline hide-if-no-js']);
		}
		if ($current_post_type == 'scene') {
			$remove_quick_edit = true;
			$current_user = wp_get_current_user();
			if (gettype($current_user) == "object" && property_exists($current_user, 'roles')) {
				$current_user_role = $current_user->roles[0];
				if ($current_user_role == 'administrator' || $current_user_role == 'content_manager') {
					$remove_quick_edit = false;
				}
			}
			if ($remove_quick_edit) {
				unset($actions['inline hide-if-no-js']);
			}
		}
		return $actions;
	}

}