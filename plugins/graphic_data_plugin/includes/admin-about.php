<?php
/**
 * Register class that defines the About custom content post type as well as associated functions.
 *
 * @package    Graphic_Data_Plugin
 */
class Graphic_Data_About {

	/**
	 * Create About custom content type.
	 *
	 * @since    1.0.0
	 */
	public function custom_content_type_about() {
		$labels = array(
			'name'                  => 'About Page',
			'singular_name'         => 'About Page',
			'menu_name'             => 'About Page',
			'name_admin_bar'        => 'About',
			'add_new'               => 'Add New About Page',
			'add_new_item'          => 'Add New About Page',
			'new_item'              => 'About Page',
			'edit_item'             => 'Edit About Page',
			'view_item'             => 'View About Page',
			'all_items'             => 'All About Pages',
			'search_items'          => 'Search About Pages',
			'parent_item_colon'     => 'Parent About Page:',
			'not_found'             => 'No About Pages found.',
			'not_found_in_trash'    => 'No About Pages found in Trash.',
			'featured_image'        => 'About Page Cover Image',
			'set_featured_image'    => 'Set cover image',
			'remove_featured_image' => 'Remove cover image',
			'use_featured_image'    => 'Use as cover image',
			'archives'              => 'About Page archives',
			'insert_into_item'      => 'Insert into About Page',
			'uploaded_to_this_item' => 'Uploaded to this About Page',
			'filter_items_list'     => 'Filter About Page list',
			'items_list_navigation' => 'About Page list navigation',
			'items_list'            => 'About Page list',
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
			'type'              => 'metabox',                       // Required, menu or metabox.
			'id'                => 'graphic_data_plugin',              // Required, meta box id, unique, for saving meta: id[field-id].
			'post_types'        => array( 'about' ),                 // Post types to display meta box.
			'context'           => 'advanced',                      // The context within the screen where the boxes should display: 'normal', 'side', and 'advanced'.
			'priority'          => 'default',                       // The priority within the context where the boxes should show ('high', 'low').
			'title'             => 'About Fields',                  // The title of the metabox.
			'capability'        => 'edit_posts',                    // The capability needed to view the page.
			'tabbed'            => true,
			'options'           => 'simple',                        // Only for metabox, options is stored az induvidual meta key, value pair.
		);

		// Step 1: Create an array to hold the About Box info.
		$about_box_array = array();

		for ( $i = 1; $i <= 10; $i++ ) {
			$about_box_array[] = array(
				'type' => 'fieldset',
				'id' => 'aboutBox' . $i,
				'title'   => 'About Box ' . $i,
				'fields' => array(
					array(
						'id'          => 'aboutBoxTitle' . $i,
						'type'        => 'text',
						'title'       => 'Box title',
						'class'       => 'text-class',
						'sanitize' => 'sanitize_text_field',
					),
					array(
						'id'          => 'aboutBoxMain' . $i,
						'type'        => 'editor',
						'title'       => 'Box content: main',
						'editor' => 'trumbowyg',
						'sanitize' => 'wp_kses_post',
					),
					array(
						'id'          => 'aboutBoxDetail' . $i,
						'type'        => 'editor',
						'title'       => 'Box content: detail',
						'editor' => 'trumbowyg',
						'sanitize' => 'wp_kses_post',
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
				'sanitize' => 'sanitize_text_field',
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
						'sanitize' => 'wp_kses_post',
					),
					array(
						'id'          => 'aboutDetail',
						'type'        => 'editor',
						'title'       => 'Central content: detail',
						'editor' => 'trumbowyg',
						'sanitize' => 'wp_kses_post',
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
				'sanitize' => 'absint',
			),
		];

		// Step 3: Insert the new sub-arrays after the second element in the original 'fields' array.
		$fields = array_merge( $fields, $about_box_array );

		// If we're just running this function to get the custom field list for field validation, return early.
		if ( $return_fields_only ) {
			return $fields;
		}

		$fields_holder[] = array(
			'name'   => 'basic',
			'title'  => 'Basic',
			'icon'   => 'dashicons-admin-generic',
			'fields' => $fields,
		);

		// instantiate the admin page.
		$options_panel = new Exopite_Simple_Options_Framework( $config_metabox, $fields_holder );
	}

	/**
	 * Counts existing About posts across all post statuses.
	 *
	 * Queries the database for all About custom post type entries regardless
	 * of their status (publish, draft, pending, private, future, or trash).
	 * Used to enforce the single About page limitation.
	 *
	 * @since 1.0.0
	 *
	 * @return int The total number of existing About posts.
	 */
	public function check_existing_about_posts() {
		$args = array(
			'post_type' => 'about',
			'post_status' => array( 'publish', 'draft', 'pending', 'private', 'future', 'trash' ),
			'posts_per_page' => -1,
			'fields' => 'ids', // Only get post IDs for efficiency.
		);

		$existing_about = get_posts( $args );
		$count = count( $existing_about );
		return $count;
	}

	/**
	 * Displays an admin notice when About page creation limit is reached.
	 *
	 * Shows a dismissible error notice in the WordPress admin when a user
	 * attempts to create a second About page. The notice is triggered by
	 * the 'about_limit_reached' query parameter in the URL.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function display_about_limit_notice() {
		if ( isset( $_GET['about_limit_reached'] ) ) {
			?>
			<div class="notice notice-error is-dismissible">
				<p>Only one About page can exist. Your new About page was not created.</p>
			</div>
			<?php
		}
	}

	/**
	 * Prevents creation of multiple About posts.
	 *
	 * Filter callback for 'wp_insert_post_data' that enforces a single About page
	 * limitation. Allows updates to existing About posts but blocks creation of
	 * new ones if an About post already exists. Redirects to the About posts list
	 * with an error notification when blocked.
	 *
	 * @since 1.0.0
	 *
	 * @param array $data    An array of slashed, sanitized, and processed post data.
	 * @param array $postarr An array of sanitized (and slashed) but otherwise unmodified post data.
	 * @return array The unmodified post data if allowed, or redirects and exits if blocked.
	 */
	public function prevent_multiple_about_posts( $data, $postarr ) {
		// Only run this check for About post type.
		if ( 'about' !== $data['post_type'] ) {
			return $data;
		}

		// Allow updates to existing About posts.
		if ( ! empty( $postarr['ID'] ) ) {
			return $data;
		}

		// Check if an About post already exists.
		$existing_count = $this->check_existing_about_posts();

		if ( $existing_count > 0 ) {
			// Store the redirect URL with query parameter.
			$redirect_url = add_query_arg(
				'about_limit_reached',
				'1',
				admin_url( 'edit.php?post_type=about' )
			);

			// Redirect and stop post creation.
			wp_safe_redirect( $redirect_url );
			exit();
		}
		return $data;
	}

	/**
	 * Hides the "Add New" button when an About post already exists.
	 *
	 * Outputs inline CSS to hide the page title action button on the About
	 * post type admin screens when at least one About post exists. This
	 * provides a visual enforcement of the single About page limitation.
	 *
	 * @since 1.0.0
	 *
	 * @global WP_Screen $current_screen WordPress current screen object.
	 * @return void
	 */
	public function modify_about_add_new_button() {
		global $current_screen;

		if ( 'about' === $current_screen->post_type ) {
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

	/**
	 * Handles template loading for the About page at the /about URL.
	 *
	 * Intercepts requests to the /about URL and manually sets up the WordPress
	 * query to display the About custom post type using single-about.php template.
	 * Configures global query variables, prevents 404 status, and loads the
	 * appropriate template file before exiting.
	 *
	 * @since 1.0.0
	 *
	 * @global WP_Query $wp_query WordPress Query object.
	 * @global WP_Post  $post     Current post object.
	 * @return void Exits after loading template if on /about URL with published post.
	 */
	public function handle_about_template() {
		$request_uri = isset( $_SERVER['REQUEST_URI'] ) ? sanitize_text_field( wp_unslash( $_SERVER['REQUEST_URI'] ) ) : '';
		if ( '/about/' === $request_uri || '/about' === $request_uri ) {
			$about_posts = get_posts(
				array(
					'post_type'      => 'about',
					'posts_per_page' => 1,
					'post_status'    => 'publish',
				)
			);

			if ( ! empty( $about_posts ) ) {
				global $wp_query;

				$wp_query->is_404 = false;
				status_header( 200 );
				$wp_query->is_single = true;
				$wp_query->is_page = false;
				$wp_query->posts = array( $about_posts[0] );
				$wp_query->post = $about_posts[0];
				$wp_query->post_count = 1;
				$wp_query->queried_object = $about_posts[0];
				$wp_query->queried_object_id = $about_posts[0]->ID;
				setup_postdata( $about_posts[0] );
				include get_template_directory() . '/single-about.php';
				exit;
			}
		}
	}

	/**
	 * Modifies the permalink structure for About post type.
	 *
	 * Filter callback for 'post_type_link' that changes the permalink for About
	 * posts to use a clean /about URL instead of the default custom post type
	 * permalink structure.
	 *
	 * @since 1.0.0
	 *
	 * @param string  $post_link The post's permalink.
	 * @param WP_Post $post      The post object.
	 * @return string Modified permalink (/about) for About posts, original permalink otherwise.
	 */
	public function custom_about_permalink( $post_link, $post ) {
		if ( 'about' === $post->post_type ) {
			return home_url( 'about' );
		}
		return $post_link;
	}
}