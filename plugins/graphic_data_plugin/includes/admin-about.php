<?php
/**
 * Register class that defines the Figure custom content type as well as associated Modal functions
 */

class About {

	/**
	 * Create About custom content type.
	 *
	 * @since    1.0.0
	 */
	function custom_content_type_about() {
		$labels = array(
			'name'                  => _x( 'About Page', 'Post type general name', 'textdomain' ),
			'singular_name'         => _x( 'About Page', 'Post type singular name', 'textdomain' ),
			'menu_name'             => _x( 'About Page', 'Admin Menu text', 'textdomain' ),
			'name_admin_bar'        => _x( 'About', 'Add New on Toolbar', 'textdomain' ),
			'add_new'               => __( 'Add New About Page', 'textdomain' ),
			'add_new_item'          => __( 'Add New About Page', 'textdomain' ),
			'new_item'              => __( 'About Page', 'textdomain' ),
			'edit_item'             => __( 'Edit About Page', 'textdomain' ),
			'view_item'             => __( 'View About Page', 'textdomain' ),
			'all_items'             => __( 'All About Pages', 'textdomain' ),
			'search_items'          => __( 'Search About Pages', 'textdomain' ),
			'parent_item_colon'     => __( 'Parent About Page:', 'textdomain' ),
			'not_found'             => __( 'No About Pages found.', 'textdomain' ),
			'not_found_in_trash'    => __( 'No About Pages found in Trash.', 'textdomain' ),
			'featured_image'        => _x( 'About Page Cover Image', 'Overrides the “Featured Image” phrase for this post type. Added in 4.3', 'textdomain' ),
			'set_featured_image'    => _x( 'Set cover image', 'Overrides the “Set featured image” phrase for this post type. Added in 4.3', 'textdomain' ),
			'remove_featured_image' => _x( 'Remove cover image', 'Overrides the “Remove featured image” phrase for this post type. Added in 4.3', 'textdomain' ),
			'use_featured_image'    => _x( 'Use as cover image', 'Overrides the “Use as featured image” phrase for this post type. Added in 4.3', 'textdomain' ),
			'archives'              => _x( 'About Page archives', 'The post type archive label used in nav menus. Default “Post Archives”. Added in 4.4', 'textdomain' ),
			'insert_into_item'      => _x( 'Insert into About Page', 'Overrides the “Insert into post”/”Insert into page” phrase (used when inserting media into a post). Added in 4.4', 'textdomain' ),
			'uploaded_to_this_item' => _x( 'Uploaded to this About Page', 'Overrides the “Uploaded to this post”/”Uploaded to this page” phrase (used when viewing media attached to a post). Added in 4.4', 'textdomain' ),
			'filter_items_list'     => _x( 'Filter About Page list', 'Screen reader text for the filter links heading on the post type listing screen. Default “Filter posts list”/”Filter pages list”. Added in 4.4', 'textdomain' ),
			'items_list_navigation' => _x( 'About Page list navigation', 'Screen reader text for the pagination heading on the post type listing screen. Default “Posts list navigation”/”Pages list navigation”. Added in 4.4', 'textdomain' ),
			'items_list'            => _x( 'About Page list', 'Screen reader text for the items list heading on the post type listing screen. Default “Posts list”/”Pages list”. Added in 4.4', 'textdomain' ),
		);

		$args = array(
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_rest'       => true,
			'query_var'          => true,
			'rewrite'            => false,
			'capability_type'    => 'post',
			'menu_icon'          => 'dashicons-admin-site-alt3',
			'has_archive'        => false, 
			'hierarchical'       => false,
			'menu_position'      => 20,
			'supports'           => array( 'title' ), // array( 'title', 'revisions' ).
		);

		register_post_type( 'about', $args );
	}

	/**
	 * Create custom fields, using metaboxes, for About custom content type.
	 *
	 * @param bool $return_fields_only If true, only return the custom fields array without registering the metabox (used as part of field validation).
	 * @since    1.0.0
	 */
	public function create_about_fields( $return_fields_only = false ) {

		$config_metabox = array(

			/*
			* METABOX
			*/
			'type'              => 'metabox',                       // Required, menu or metabox
			'id'                => 'graphic_data_plugin',              // Required, meta box id, unique, for saving meta: id[field-id]
			'post_types'        => array( 'about' ),                 // Post types to display meta box
			'context'           => 'advanced',                      // The context within the screen where the boxes should display: 'normal', 'side', and 'advanced'.
			'priority'          => 'default',                       // The priority within the context where the boxes should show ('high', 'low').
			'title'             => 'About Fields',                  // The title of the metabox
			'capability'        => 'edit_posts',                    // The capability needed to view the page
			'tabbed'            => true,
			'options'           => 'simple',                        // Only for metabox, options is stored az induvidual meta key, value pair.
		);

			// Step 1: Create an array to hold the About Box info
			$aboutBoxArray = array();

		for ( $i = 1; $i <= 10; $i++ ) {
			$aboutBoxArray[] = array(
				'type' => 'fieldset',
				'id' => 'aboutBox' . $i,
				'title'   => 'About Box ' . $i,
				'fields' => array(
					array(
						'id'          => 'aboutBoxTitle' . $i,
						'type'        => 'text',
						'title'       => 'Box title',
						'class'       => 'text-class',
					),
					array(
						'id'          => 'aboutBoxMain' . $i,
						'type'        => 'editor',
						'title'       => 'Box content: main',
						'editor' => 'trumbowyg',
					),
					array(
						'id'          => 'aboutBoxDetail' . $i,
						'type'        => 'editor',
						'title'       => 'Box content: detail',
						'editor' => 'trumbowyg',
					),
				),
			);
		}

		$fields = [
			array(
				'id'             => 'about_published',
				'type'           => 'select',
				'title'          => 'Status',
				'options'        => array(
					'draft' => 'Draft',
					'published' => 'Published',
				),
				'default'        => 'draft',
				'description' => 'Should the About page be live? If set to Published, the page will be visible.',
			),
			array(
				'type' => 'fieldset',
				'id' => 'centralAbout',
				'title'   => 'Central About Content',
				'fields' => array(
					array(
						'id'          => 'aboutMain',
						'type'        => 'editor',
						'title'       => 'Central content: main',
						'editor' => 'trumbowyg',
					),
					array(
						'id'          => 'aboutDetail',
						'type'        => 'editor',
						'title'       => 'Central content: detail',
						'editor' => 'trumbowyg',
					),
				),
			),
			array(
				'id'      => 'numberAboutBoxes',
				'type'    => 'range',
				'title'   => 'Number of About Boxes',
				'min'     => 0,
				'default' => 1,
				'max'     => 10,
				'step'    => 1,
			),
		];

		// Step 3: Insert the new sub-arrays after the second element in the original 'fields' array
		$fields = array_merge( $fields, $aboutBoxArray );

		// If we're just running this function to get the custom field list for field validation, return early
		if ( $return_fields_only ) {
			return $fields;
		}

		$fieldsHolder[] = array(
			'name'   => 'basic',
			'title'  => 'Basic',
			'icon'   => 'dashicons-admin-generic',
			'fields' => $fields,
		);

		// instantiate the admin page
		$options_panel = new Exopite_Simple_Options_Framework( $config_metabox, $fieldsHolder );
	}

	// Modified About post check function with debugging - CLAUDE FUNCTION
	function check_existing_about_posts() {
		$args = array(
			'post_type' => 'about',
			'post_status' => array( 'publish', 'draft', 'pending', 'private', 'future', 'trash' ),
			'posts_per_page' => -1,
			'fields' => 'ids', // Only get post IDs for efficiency
		);

		$existing_about = get_posts( $args );
		$count = count( $existing_about );

		// Optional debugging - remove in production
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG === true ) {
			error_log( 'About Posts Check - Count: ' . $count );
			error_log( 'About Posts IDs: ' . print_r( $existing_about, true ) );
		}

		return $count;
	}

	// Add admin notice functionality
	function display_about_limit_notice() {
		if ( isset( $_GET['about_limit_reached'] ) ) {
			?>
			<div class="notice notice-error is-dismissible">
				<p><?php _e( 'Only one About page can exist. Your new About page was not created.', 'your-text-domain' ); ?></p>
			</div>
			<?php
		}
	}

	// Modified prevention function with better handling
	function prevent_multiple_about_posts( $data, $postarr ) {
		// Only run this check for About post type
		if ( $data['post_type'] !== 'about' ) {
			return $data;
		}

		// Allow updates to existing About posts
		if ( ! empty( $postarr['ID'] ) ) {
			return $data;
		}

		// Check if an About post already exists
		$existing_count = $this->check_existing_about_posts();

		// Optional debugging - remove in production
		if ( defined( 'WP_DEBUG' ) && WP_DEBUG === true ) {
			error_log( 'Attempting to create About post' );
			error_log( 'Existing count: ' . $existing_count );
		}

		if ( $existing_count > 0 ) {
			// Store the redirect URL with query parameter
			$redirect_url = add_query_arg(
				'about_limit_reached',
				'1',
				admin_url( 'edit.php?post_type=about' )
			);

			// Redirect and stop post creation
			wp_safe_redirect( $redirect_url );
			exit();
		}

		return $data;
	}

	// Modified button visibility function - CLAUDE FUNCTION
	function modify_about_add_new_button() {
		global $current_screen;

		if ( $current_screen->post_type === 'about' ) {
			$existing_count = $this->check_existing_about_posts();

			if ( $existing_count > 0 ) {
				?>
				<style>
					.page-title-action {
						display: none !important;
					}
				</style>
				<?php
			}
		}
	}

	// Force use of single-about.php file for about posts - CLAUDE FUNCTION
	function handle_about_template() {
		// Check if we're on the /about URL
		if ( $_SERVER['REQUEST_URI'] === '/about/' || $_SERVER['REQUEST_URI'] === '/about' ) {
			// Get the about post
			$about_posts = get_posts(
				array(
					'post_type' => 'about',
					'posts_per_page' => 1,
					'post_status' => 'publish',
				)
			);

			if ( ! empty( $about_posts ) ) {
				// Set up the global post object
				global $wp_query, $post;
				$wp_query->is_single = true;
				$wp_query->is_page = false;
				$wp_query->is_404 = false;
				$post = $about_posts[0];
				$wp_query->posts = array( $post );
				$wp_query->post = $post;
				$wp_query->post_count = 1;
				$wp_query->is_posts_page = false;
				$wp_query->queried_object = $post;
				$wp_query->queried_object_id = $post->ID;
				setup_postdata( $post );

				// Load the single-about.php template
				include get_template_directory() . '/single-about.php';
				exit;
			}
		}
	}

	// Modify the permalink structure for About post type - CLAUDE function
	function custom_about_permalink( $post_link, $post ) {
		if ( $post->post_type === 'about' ) {
			return home_url( 'about' );
		}
		return $post_link;
	}
}