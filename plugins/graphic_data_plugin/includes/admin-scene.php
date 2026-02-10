<?php
/**
 * Register class that defines the Scene custom content type as well as associated Scene functions
 */

include_once plugin_dir_path( __DIR__ ) . 'admin/class-utility.php';

/**
 * Manages the Scene custom post type and its admin interface.
 *
 * Handles registration of the Scene post type, custom meta fields, REST API
 * integration, admin list table columns and filters, permalink rewriting,
 * Quick Edit validation, and bulk/row action customization.
 *
 * @since 1.0.0
 */
class Graphic_Data_Scene {

	/**
	 * Display an admin notice if the current scene is the overview scene for its instance.
	 *
	 * @since    1.0.0
	 */
	public function display_overview_scene_notice() {
		// 1. Check if we are on the correct screen (Scene edit page for an existing post)
		$screen = get_current_screen();
		if ( ! $screen || 'post' !== $screen->base || 'scene' !== $screen->id || 'add' === $screen->action ) {
			return; // Exit if not on the scene edit screen for an existing post.
		}

		// 2. Get the current Scene's ID.
		$current_scene_id = get_the_ID();
		if ( ! $current_scene_id ) {
			return; // Exit if we can't get the current post ID.
		}

		// 3. Get the associated Instance ID from the Scene's meta field 'scene_location'.
		$instance_id = get_post_meta( $current_scene_id, 'scene_location', true );

		// 4. Check if we have a valid Instance ID
		if ( empty( $instance_id ) || ! is_numeric( $instance_id ) ) {
			// If the scene_location isn't set, we can't determine if it's the overview scene.
			return;
		}
		$instance_id = (int) $instance_id; // Ensure it's an integer.

		// 5. Get the Overview Scene ID from the Instance's meta field 'instance_overview_scene'.
		$overview_scene_id = get_post_meta( $instance_id, 'instance_overview_scene', true );

		// 6. Check if the Instance has designated an overview scene.
		if ( empty( $overview_scene_id ) || ! is_numeric( $overview_scene_id ) ) {
			// If the instance hasn't set an overview scene, the current scene cannot be it.
			return;
		}
		$overview_scene_id = (int) $overview_scene_id; // Ensure it's an integer.

		// 7. Compare the current Scene ID with the Instance's Overview Scene ID.
		if ( $current_scene_id === $overview_scene_id ) {
			// 8. Display the notice if they match.
			wp_admin_notice(
				'This is the overview scene for ' . get_the_title( $instance_id ) . '.',
				array(
					'additional_classes' => array( 'updated' ),
					'dismissible'        => true,
				)
			);
		}
	}

	/**
	 * Clean up Inkscape-generated SVGs after WordPress handles the upload.
	 *
	 * Hooked to `wp_handle_upload`, this function reads the uploaded file,
	 * checks whether it is an SVG containing Inkscape-specific markup, and
	 * if so, transforms it in-place using {@see graphic_data_transform_svg_inkscape()}.
	 * Non-SVG files and SVGs without Inkscape attributes are returned untouched.
	 *
	 * @param array  $upload  {
	 *     Array of upload data from WordPress.
	 *
	 *     @type string $file Full path to the uploaded file.
	 *     @type string $url  URL of the uploaded file.
	 *     @type string $type MIME type of the uploaded file.
	 * }
	 * @param string $context The type of upload action. Accepts 'upload' or 'sideload'.
	 * @return array The (possibly modified) upload data array.
	 */
	public function graphic_data_svg_cleanup_on_upload( array $upload, string $context ) {
		if ( ! isset( $upload['type'], $upload['file'] ) ) {
			return $upload;
		}

		// Only touch SVGs.
		if ( 'image/svg+xml' !== $upload['type'] && ! preg_match( '/\.svg$/i', $upload['file'] ) ) {
			return $upload;
		}

		$path = $upload['file'];
		$svg  = @file_get_contents( $path );
		if ( false === $svg ) {
			return $upload; // couldn't read; bail without breaking the upload.
		}

		// Only process if it looks like an Inkscape SVG.
		if ( strpos( $svg, 'inkscape:' ) === false ) {
			return $upload; // no inkscape tags → leave untouched.
		}

		$clean = graphic_data_transform_svg_inkscape( $svg );

		// Write back in-place
		// You may also want to preserve permissions; WP handles that normally.
		@file_put_contents( $path, $clean );

		return $upload;
	}

	/**
	 * Transform Inkscape-specific attributes in an SVG string.
	 *
	 * Replaces the id attribute value with the inkscape:label value
	 * on elements that have both attributes.
	 *
	 * @param string $svg The raw SVG markup.
	 * @return string The transformed SVG markup.
	 */
	public function graphic_data_transform_svg_inkscape( string $svg ): string {
		$svg = preg_replace( '/id="([^"]+)"\s+inkscape:label="([^"]+)"/', 'id="$2" inkscape:label="$2"', $svg );
		return $svg;
	}

	/**
	 * Enqueues the Quick Edit slug validation script on the Scene list table screen.
	 *
	 * Loads `scene-quick-edit-validation.js` (dependent on `inline-edit-post`) and
	 * localizes it with the AJAX URL, a nonce for slug validation, and user-facing
	 * messages. Only enqueued on the `edit.php` screen for the 'scene' post type.
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook The current admin page hook suffix.
	 * @return void
	 */
	public function scene_enqueue_quick_edit_validation( $hook ) {
		// Only load on the scene post type edit screen.
		if ( 'edit.php' !== $hook || ! isset( $_GET['post_type'] ) || 'scene' !== $_GET['post_type'] ) {
			return;
		}

		wp_enqueue_script(
			'scene-quick-edit-validation',
			plugin_dir_url( __DIR__ ) . 'admin/js/scene-quick-edit-validation.js',
			array( 'inline-edit-post' ),
			GRAPHIC_DATA_PLUGIN_VERSION,
			true
		);

		wp_localize_script(
			'scene-quick-edit-validation',
			'sceneQuickEdit',
			array(
				'ajax_url' => admin_url( 'admin-ajax.php' ),
				'nonce' => wp_create_nonce( 'scene_validate_slug_nonce' ),
				'messages' => array(
					'slug_exists' => 'Warning: A post with this slug already exists. WordPress will automatically modify it to make it unique.',
					'checking' => 'Checking slug...',
				),
			)
		);
	}

	/**
	 * AJAX handler that checks whether a scene post slug is already in use.
	 *
	 * Validates the nonce from the Quick Edit validation script, then queries the
	 * database for an existing scene post with the given slug (excluding the current
	 * post and trashed posts). Returns a JSON success response with `exists: true`
	 * and the conflicting post's ID and title if a duplicate is found, or
	 * `exists: false` if the slug is available. Sends a JSON error if the slug is empty.
	 *
	 * Expects `$_POST['slug']` (the slug to check) and `$_POST['post_id']` (the
	 * current post ID to exclude from the check).
	 *
	 * @since 1.0.0
	 *
	 * @return void Outputs JSON response and terminates execution.
	 */
	public function scene_validate_slug_ajax() {
		check_ajax_referer( 'scene_validate_slug_nonce', 'nonce' );

		$slug    = isset( $_POST['slug'] ) ? sanitize_title( wp_unslash( $_POST['slug'] ) ) : '';
		$post_id = isset( $_POST['post_id'] ) ? absint( $_POST['post_id'] ) : 0;

		if ( empty( $slug ) ) {
			wp_send_json_error( array( 'message' => 'Invalid slug' ) );
		}

		// Check if a post with this slug exists (excluding the current post).
		global $wpdb;
		$existing = $wpdb->get_var(
			$wpdb->prepare(
				"SELECT ID FROM {$wpdb->posts} 
            WHERE post_name = %s 
            AND post_type = 'scene' 
            AND ID != %d 
            AND post_status != 'trash'",
				$slug,
				$post_id
			)
		);

		if ( $existing ) {
			// Get the post title.
			$existing_post = get_post( $existing );
			$post_title = $existing_post ? $existing_post->post_title : 'Unknown';

			wp_send_json_success(
				array(
					'exists' => true,
					'message' => sprintf(
						'A scene with slug "%s" already exists (Post ID: %d, Scene Title: "%s").',
						$slug,
						$existing,
						$post_title
					),
				)
			);
		} else {
			wp_send_json_success( array( 'exists' => false ) );
		}
	}

	/**
	 * Renames the Quick Edit row action link for the Scene post type.
	 *
	 * Replaces the default "Quick Edit" label with "Edit Scene Title or URL" in the
	 * row actions on the Scene admin list table. Intended for use with the
	 * 'post_row_actions' filter.
	 *
	 * @since 1.0.0
	 *
	 * @param string[] $actions Associative array of row action links.
	 * @param WP_Post  $post    The post object for the current row.
	 * @return string[] The modified row actions array.
	 */
	public function modify_scene_quick_edit_link( $actions, $post ) {
		// Check if the post type is 'scene'.
		if ( 'scene' === $post->post_type ) {
			// Check if the 'quick edit' action exists.
			if ( isset( $actions['inline hide-if-no-js'] ) ) {
				// Modify the link text to "Edit Scene Name".
				$actions['inline hide-if-no-js'] = str_replace(
					'Quick&nbsp;Edit', // The original "Quick Edit" text.
					'Edit Scene Title or URL', // The new text.
					$actions['inline hide-if-no-js'] // The existing action link.
				);
			}
		}
		return $actions;
	}

	/**
	 * Enqueues custom CSS for scene admin columns on the post type edit screen.
	 *
	 * This function conditionally loads CSS styling for the admin columns display
	 * when viewing the list of 'scene' custom post type entries in the WordPress admin.
	 * The CSS is only enqueued when on the edit.php screen for the modal post type.
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook The current admin page hook suffix.
	 *
	 * @return void
	 */
	public function enqueue_scene_admin_columns_css( $hook ) {
		// Get the current screen object.
		$screen = get_current_screen();

		// Check if we are on the edit screen for the custom post type 'scene'.
		if ( 'scene' === $screen->post_type && 'edit' === $screen->base ) {
			// Enqueue CSS file.
			wp_enqueue_style(
				'scene-admin-columns-css', // Handle of the CSS file.
				plugin_dir_url( __DIR__ ) . 'admin/css/scene-admin-columns.css',
				array(),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
		}
	}

	/**
	 * Store filter values in user metadata with 20-minute expiration.
	 *
	 * This function captures the current Scene filter selections from the URL parameters
	 * and stores them in user metadata with a 20-minute expiration timestamp.
	 * It only runs on the Scene post type admin screen and requires a logged-in user.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function store_scene_filter_values() {
		$screen = get_current_screen();
		if ( 'edit-scene' != $screen->id ) {
			return;
		}

		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return;
		}

		// Get current timestamp.
		$current_time = time();

		// Store the expiration time (20 minutes = 1200 seconds).
		$expiration_time = $current_time + 1200;

		// Store field_length filter value if it exists.
		if ( isset( $_GET['field_length'] ) && ! empty( $_GET['field_length'] ) ) {
			update_user_meta( $user_id, 'scene_field_length', sanitize_key( $_GET['field_length'] ) );
			update_user_meta( $user_id, 'scene_field_length_expiration', $expiration_time );
		}

		// Store scene_instance filter value if it exists.
		if ( isset( $_GET['scene_instance'] ) && ! empty( $_GET['scene_instance'] ) ) {
			update_user_meta( $user_id, 'scene_instance', absint( $_GET['scene_instance'] ) );
			update_user_meta( $user_id, 'scene_instance_expiration', $expiration_time );
		}
	}

	/**
	 * Check if stored filter values are still valid and retrieve them if they are.
	 *
	 * This function retrieves a stored filter value from user metadata and verifies
	 * if it has exceeded its expiration time. If the value has expired, it cleans up
	 * the metadata entries and returns false. Otherwise, it returns the stored value.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @param    string $meta_key  The meta key to check expiration for.
	 * @return   bool|string|int    False if expired or not found, the value if still valid.
	 */
	public function get_scene_filter_value( $meta_key ) {
		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return false;
		}

		$value = get_user_meta( $user_id, $meta_key, true );
		if ( empty( $value ) ) {
			return false;
		}

		// Check if the value has expired.
		$expiration_time = get_user_meta( $user_id, $meta_key . '_expiration', true );
		$current_time = time();

		if ( $current_time > $expiration_time ) {
			// Delete expired values.
			delete_user_meta( $user_id, $meta_key );
			delete_user_meta( $user_id, $meta_key . '_expiration' );
			return false;
		}

		return $value;
	}

	/**
	 * Clean up expired scene filter values in user metadata.
	 *
	 * This function runs on admin page load and checks if any stored filter values
	 * have exceeded their 20-minute expiration time. Any expired values are removed
	 * from the database to maintain clean user metadata and prevent stale filters
	 * from being applied.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function cleanup_expired_scene_filters() {
		$screen = get_current_screen();
		if ( ! $screen || 'edit-scene' != $screen->id ) {
			return;
		}

		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return;
		}

		$current_time = time();

		// Check and clean up field_length.
		$expiration_time = get_user_meta( $user_id, 'scene_field_length_expiration', true );
		if ( $expiration_time && $current_time > $expiration_time ) {
			delete_user_meta( $user_id, 'scene_field_length' );
			delete_user_meta( $user_id, 'scene_field_length_expiration' );
		}

		// Check and clean up scene_instance.
		$expiration_time = get_user_meta( $user_id, 'scene_instance_expiration', true );
		if ( $expiration_time && $current_time > $expiration_time ) {
			delete_user_meta( $user_id, 'scene_instance' );
			delete_user_meta( $user_id, 'scene_instance_expiration' );
		}
	}

	/**
	 * Add filter dropdowns for the Scene admin screen with persistent selection support.
	 *
	 * This function creates and outputs filter dropdowns for field length and instance
	 * on the Scene post type admin screen. It first checks for filter values in the URL
	 * parameters, then falls back to stored user metadata values if they haven't expired.
	 * After displaying the dropdowns, it stores the current selections for future use.
	 * This function handles proper user capability checks to show only assigned instances
	 * for content editors.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function scene_filter_dropdowns() {
		$screen = get_current_screen();
		// Only proceed if we are on the 'scene' edit screen.
		if ( ! $screen || 'edit-scene' !== $screen->id ) {
			return;
		}

		// Run cleanup of expired filters.
		$this->cleanup_expired_scene_filters();

		// --- Field Length Dropdown ---
		$field_options = array(
			array( '', 'large', 'Full tagline' ),
			array( '', 'medium', 'Medium tagline' ),
			array( '', 'small', 'Short tagline' ),
		);

		// Check for filter in URL first, then check for stored value.
		$field_length = isset( $_GET['field_length'] ) ? sanitize_key( $_GET['field_length'] ) : $this->get_scene_filter_value( 'scene_field_length' );

		if ( $field_length ) {
			switch ( $field_length ) {
				case 'large':
					$field_options[0][0] = 'selected ';
					break;
				case 'medium':
					$field_options[1][0] = 'selected ';
					break;
				case 'small':
					$field_options[2][0] = 'selected ';
					break;
			}
		} else {
			$field_options[2][0] = 'selected ';
		}

		$field_length_dropdown = '<select name="field_length" id="field_length">';
		for ( $i = 0; $i < 3; $i++ ) {
			$field_length_dropdown .= '<option ' . $field_options[ $i ][0] . 'value="' . esc_attr( $field_options[ $i ][1] ) . '">' . esc_html( $field_options[ $i ][2] ) . '</option>';
		}
		$field_length_dropdown .= '</select>';

		echo wp_kses(
			$field_length_dropdown,
			array(
				'select' => array(
					'name' => array(),
					'id'   => array(),
				),
				'option' => array(
					'value'    => array(),
					'selected' => array(),
				),
			)
		);

		$function_utilities = new Graphic_Data_Utility();
		$function_utilities->create_instance_dropdown_filter( 'scene_instance' );

		// Store the filter values after displaying the dropdowns.
		$this->store_scene_filter_values();
	}

	/**
	 * Filter the Scene admin screen results based on selected or stored filter values.
	 *
	 * This function modifies the WordPress query to filter Scene posts based on the
	 * selected location (instance) values. It first checks for values in the URL parameters,
	 * then falls back to stored user metadata values that haven't expired. This ensures
	 * filter persistence for 20 minutes across page loads.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @param    WP_Query $query  The WordPress Query instance being filtered.
	 * @return   void
	 */
	public function scene_location_filter_results( $query ) {
		global $pagenow;
		$type = 'scene';

		if ( 'edit.php' == $pagenow && isset( $_GET['post_type'] ) && $type == $_GET['post_type'] ) {
			// Check URL params first, then check stored values.
			$instance = isset( $_GET['scene_instance'] ) ? absint( $_GET['scene_instance'] ) : $this->get_scene_filter_value( 'scene_instance' );

			if ( $instance ) {
				$meta_query = array(
					array(
						'key' => 'scene_location', // The custom field storing the instance ID.
						'value' => $instance,
						'compare' => '=',
					),
				);
				$query->set( 'meta_query', $meta_query );
			}
		}
	}

	/**
	 * Set custom columns for the Scene post type admin list table.
	 *
	 * Replaces the default WordPress admin columns with custom columns
	 * specific to the Scene custom post type, including scene location,
	 * infographic, tagline, order, and overview information.
	 *
	 * @since 1.0.0
	 * @link https://www.smashingmagazine.com/2017/12/customizing-admin-columns-wordpress/
	 *
	 * @param array $columns Default WordPress admin columns array where
	 *                      keys are column IDs and values are column labels.
	 *
	 * @return array Modified columns array with custom Scene-specific columns:
	 *               - 'title': Scene title
	 *               - 'scene_location': Associated instance/location
	 *               - 'scene_infographic': Linked infographic
	 *               - 'scene_tagline': Scene tagline text
	 *               - 'scene_order': Display order number
	 *               - 'scene_overview': Scene overview content
	 *               - 'status': Publication status
	 */
	public function change_scene_columns( $columns ) {
		$columns = array(
			// 'cb' => $columns['cb'],
			'title' => 'Title',
			'scene_location' => 'Instance',
			'scene_infographic' => 'Infographic',
			'scene_tagline' => 'Tagline',
			'scene_order' => 'Order',
			'scene_overview' => 'Overview',
			'status' => 'Status',
		);
		return $columns;
	}

	/**
	 * Populate custom fields for Scene content type in the admin screen.
	 *
	 * @param string $column The name of the column.
	 * @param int    $post_id The database id of the post.
	 * @since    1.0.0
	 */
	public function custom_scene_column( $column, $post_id ) {

		if ( isset( $_GET['field_length'] ) ) {
			$field_length = sanitize_key( $_GET['field_length'] );
		} else {
			$stored_field_length = $this->get_scene_filter_value( 'scene_field_length' );
			$field_length = $stored_field_length ? $stored_field_length : 'small'; // Default to "small" if no stored value or expired.
		}

		// Populate columns based on the determined field_length.
		if ( 'scene_location' === $column ) {
			$instance_id = get_post_meta( $post_id, 'scene_location', true );
			echo esc_html( get_the_title( $instance_id ) );
		}

		if ( 'scene_infographic' === $column ) {
				$scene_infographic = get_post_meta( $post_id, 'scene_infographic', true );
			if ( ! empty( $scene_infographic ) ) {
					echo '<img src="' . esc_url( $scene_infographic ) . '" style="max-width:100px; max-height:100px;" /><br>';
			}
		}

		if ( 'scene_tagline' === $column ) {
			$scene_tagline = get_post_meta( $post_id, 'scene_tagline', true );
			switch ( $field_length ) {
				case 'large':
					echo wp_kses_post( $scene_tagline );
					break;
				case 'medium':
					echo wp_kses_post( $this->string_truncate( $scene_tagline, 75 ) );
					break;
				case 'small':
					if ( null != $scene_tagline ) {
						echo '<span class="dashicons dashicons-yes"></span>';
					}
					break;
			}
		}

		if ( 'scene_order' === $column ) {
			echo intval( get_post_meta( $post_id, 'scene_order', true ) );
		}

		if ( 'scene_overview' === $column ) {
			$instance_id = get_post_meta( $post_id, 'scene_location', true );
			$instance_overview_scene = get_post_meta( $instance_id, 'instance_overview_scene', true );
			if ( $instance_overview_scene == $post_id ) {
				echo '<span class="dashicons dashicons-yes"></span>';
			}
		}

		if ( 'status' === $column ) {
			$last_modified_time = get_post_modified_time( 'g:i A', false, $post_id, true );
			$last_modified_date = get_post_modified_time( 'F j, Y', false, $post_id, true );
			$last_modified_user_id = get_post_meta( $post_id, '_edit_last', true );
			if ( empty( $last_modified_user_id ) ) {
				 $last_modified_user_id = get_post_field( 'post_author', $post_id );
			}
			$last_modified_user = get_userdata( $last_modified_user_id );
			$last_modified_name = $last_modified_user->first_name . ' ' . $last_modified_user->last_name;

			echo 'Last updated at ' . esc_html( $last_modified_time ) . ' on ' . esc_html( $last_modified_date ) . ' by ' . esc_html( $last_modified_name );
		}
	}

	/**
	 * Shorten string without cutting words midword.
	 *
	 * @param string $string The string to be shortened.
	 * @param int    $your_desired_width The number of characters in the shortened string.
	 * @since    1.0.0
	 */
	public function string_truncate( $string, $your_desired_width ) {
		$parts = preg_split( '/([\s\n\r]+)/', $string, null, PREG_SPLIT_DELIM_CAPTURE );
		$parts_count = count( $parts );

		$length = 0;
		// $last_part = 0;
		for ( $last_part = 0; $last_part < $parts_count; ++$last_part ) {
			$length += strlen( $parts[ $last_part ] );
			if ( $length > $your_desired_width ) {
				break; }
		}

		return implode( array_slice( $parts, 0, $last_part ) );
	}

	/**
	 * Remove Bulk Actions dropdown from Scene, Modal, Figure, and Instance admin screens.
	 *
	 * @param array $actions An array of the available bulk actions.
	 * @since    1.0.0
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
	 * Remove Quick Edit links from Scene admin screen.
	 *
	 * @param string[] $actions An array of row action links.
	 * @param int      $post The database id of the post.
	 * @since    1.0.0
	 */
	public function scene_remove_quick_edit_link( $actions, $post ) {
		global $current_screen;

		if ( 'scene' === $current_screen->post_type ) {
			unset( $actions['inline hide-if-no-js'] );
		}
		return $actions;
	}

	/**
	 * Create Scene custom content type.
	 *
	 * @since    1.0.0
	 */
	public function custom_content_type_scene() {
		$labels = array(
			'name'                  => 'Scenes',
			'singular_name'         => 'Scene',
			'menu_name'             => 'Scenes',
			'name_admin_bar'        => 'Scene',
			'add_new'               => 'Add New Scene',
			'add_new_item'          => 'Add New Scene',
			'new_item'              => 'New Scene',
			'edit_item'             => 'Edit Scene',
			'view_item'             => 'View Scene',
			'all_items'             => 'All Scenes',
			'search_items'          => 'Search Scenes',
			'parent_item_colon'     => 'Parent Scenes:',
			'not_found'             => 'No Scenes found.',
			'not_found_in_trash'    => 'No Scenes found in Trash.',
			'featured_image'        => 'Scene Cover Image',
			'set_featured_image'    => 'Set cover image',
			'remove_featured_image' => 'Remove cover image',
			'use_featured_image'    => 'Use as cover image',
			'archives'              => 'Scene archives',
			'insert_into_item'      => 'Insert into Scene',
			'uploaded_to_this_item' => 'Uploaded to this Scene',
			'filter_items_list'     => 'Filter Scenes list',
			'items_list_navigation' => 'Scenes list navigation',
			'items_list'            => 'Scenes list',
		);

		$args = array(
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_rest'       => true,
			'query_var'          => true,
			'rewrite'            => array( 'slug' => 'scenes' ),
			'capability_type'    => 'post',
			'menu_icon'          => 'dashicons-tag',
			'has_archive'        => true,
			'hierarchical'       => false,
			'menu_position'      => null,
			'supports'           => array( 'title' ), // array( 'title', 'revisions' ),.
		);

		register_post_type( 'scene', $args );
	}

	/**
	 * Create custom fields, using metaboxes, for Scene custom content type.
	 *
	 * @param bool $return_fields_only If true, only return the custom fields array without registering the metabox (used as part of field validation).
	 * @since    1.0.0
	 */
	public function create_scene_fields( $return_fields_only = false ) {
		$config_metabox = array(
			'type'              => 'metabox',                       // Required, menu or metabox.
			'id'                => 'graphic_data_plugin',              // Required, meta box id, unique, for saving meta: id[field-id].
			'post_types'        => array( 'scene' ),                 // Post types to display meta box.
			'context'           => 'advanced',                      // The context within the screen where the boxes should display: 'normal', 'side', and 'advanced'.
			'priority'          => 'default',                       // The priority within the context where the boxes should show ('high', 'low').
			'title'             => 'Scene Fields',                  // The title of the metabox.
			'capability'        => 'edit_posts',                    // The capability needed to view the page.
			'tabbed'            => true,
			'options'           => 'simple',                        // Only for metabox, options is stored az induvidual meta key, value pair.
		);

		$function_utilities = new Graphic_Data_Utility();
		$instances = $function_utilities->return_all_instances();

		$fields = array(
			array(
				'id'             => 'scene_published',
				'type'           => 'select',
				'title'          => 'Scene status*',
				'options'        => array(
					'draft'      => 'Draft',
					'published'  => 'Published',
				),
				'default'        => 'draft',
				'description'    => 'Should the Scene be live?',
				'sanitize'       => 'sanitize_text_field',
			),
			array(
				'id'          => 'scene_location',
				'type'        => 'select',
				'title'       => 'Instance*',
				'options'     => $instances,
				'description' => 'What instance is the scene part of? ',
				'sanitize' => [ $function_utilities, 'sanitize_number_or_quotes_field' ],
			),
			array(
				'id'          => 'scene_infographic',
				'type'        => 'image',
				'title'       => 'Infographic*',
				'description' => 'What is the image for the scene? Only properly-formatted SVG-type images are allowed.',
				'sanitize'    => 'sanitize_url',
			),
			array(
				'id'          => 'scene_tagline',
				'type'        => 'editor',
				'editor'      => 'tinymce',
				'title'       => 'Tagline',
				'description' => 'What is the tagline for the scene?',
				'sanitize'    => 'wp_kses_post',
			),
			array(
				'id'          => 'scene_info_entries',
				'type'        => 'range',
				'title'       => 'Number of info entries',
				'description' => 'How many info links are there for the scene?',
				'min'         => 0,
				'default'     => 0,
				'max'         => 6,
				'step'        => 1,
				'sanitize'    => 'absint',
			),
			array(
				'id'          => 'scene_photo_entries',
				'type'        => 'range',
				'title'       => 'Number of photo entries',
				'description' => 'How many photo links are there for the scene?',
				'min'         => 0,
				'default'     => 0,
				'max'         => 6,
				'step'        => 1,
				'sanitize'    => 'absint',
			),
			array(
				'id'          => 'scene_order',
				'type'        => 'number',
				'title'       => 'Order',
				'description' => 'What is the order of the scene in the menu bar?',
				'default'     => '1',
				'min'         => '1',
				'max'         => '10',
				'step'        => '1',
				'sanitize'    => 'absint',
			),
			array(
				'id'          => 'scene_full_screen_button',
				'type'        => 'select',
				'title'       => 'Full Screen Button',
				'description' => 'Should there be a button to allow full screen access to the scene?',
				'options'     => array(
					'no'      => 'No',
					'yes'     => 'Yes',
				),
				'default'     => 'yes',
				'sanitize'    => 'sanitize_text_field',
			),
			array(
				'id'             => 'scene_text_toggle',
				'type'           => 'select',
				'title'          => 'Text Toggle',
				'options'        => array(
					'none'       => 'No Toggle',
					'toggle_off' => 'Toggle, Default Off',
					'toggle_on'  => 'Toggle, Default On',
				),
				'default'        => 'toggle_on',
				'description'    => 'Should there be a button to toggle text on and off?',
				'sanitize'       => 'sanitize_text_field',
			),
			array(
				'id'              => 'scene_orphan_icon_action',
				'type'            => 'select',
				'title'           => 'Icon visibility in scene, if no associated modal',
				'options'         => array(
					'visible'     => 'Keep icons as they are',
					'hide'        => 'Hide icons',
					'translucent' => 'Make icons semi-transparent',
					'color'       => 'Color in icons with specific color',
				),
				'description'     => 'What should happen to clickable icons in the scene that have no associated modal or a modal that is a draft?',
				'default'         => 'visible',
				'sanitize'        => 'sanitize_text_field',
			),
			array(
				'id'          => 'scene_orphan_icon_color',
				'type'        => 'color',
				'title'       => 'Color for icons with no associated modal',
				'description' => 'What should the icon color be?',
				'picker'      => 'html5',
				'default'     => '#808080',
				'sanitize'    => 'sanitize_hex_color',
			),
			array(
				'id'                 => 'scene_toc_style',
				'type'               => 'select',
				'title'              => 'Table of contents style*',
				'options'            => array(
					'accordion'      => 'Accordion (Sections Required)',
					'list'           => 'List (default option, No Sections)',
					'sectioned_list' => 'Sectioned List (Sections Required)',
				),
				'default'            => 'list',
				'description'        => 'What should the table of contents to the right of the scene look like? Should the icons be in sections? If so, the sections can be created here. However, you will need to assign your modals to them.',
				'sanitize'           => 'sanitize_text_field',
			),
			array(
				'id'          => 'scene_same_hover_color_sections',
				'type'        => 'select',
				'title'       => 'Single color for sections',
				'options'     => array(
					'no'      => 'No',
					'yes'     => 'Yes',
				),
				'description' => 'Should all sections have the same hover color?',
				'default'     => 'yes',
				'sanitize'    => 'sanitize_text_field',
			),
			array(
				'id'          => 'scene_hover_color',
				'type'        => 'color',
				'title'       => 'Scene Hover color',
				'description' => 'What should the hover color be?',
				'picker'      => 'html5',
				'default'     => '#FFFF00',
				'sanitize'    => 'sanitize_hex_color',
			),
			array(
				'id'          => 'scene_hover_text_color',
				'type'        => 'color',
				'title'       => 'Scene Hover Text Color',
				'description' => 'What should the hover text color be?',
				'picker'      => 'html5',
				'default'     => '#000',
				'sanitize'    => 'sanitize_hex_color',
			),
			array(
				'id'          => 'scene_section_number',
				'type'        => 'select',
				'title'       => 'Number of scene sections*',
				'description' => 'How many scene sections are there?',
				'options'     => array(
					0         => '0',
					1         => '1',
					2         => '2',
					3         => '3',
					4         => '4',
					5         => '5',
					6         => '6',
				),
				'default'     => 0,
				'sanitize'    => 'absint',
			),
			array(
				'id'          => 'scene_preview',
				'type'        => 'button',
				'title'       => 'Preview Scene (Desktop Mode)',
				'class'        => 'scene_preview',
				'options'     => array(
					'href'  => '#nowhere',
					'target' => '_self',
					'value' => 'Preview',
					'btn-class' => 'exopite-sof-btn',
				),
			),
			array(
				'id'          => 'scene_preview_mobile',
				'type'        => 'button',
				'title'       => 'Preview Scene (Mobile Mode)',
				'class'        => 'scene_preview_mobile',
				'options'     => array(
					'href'  => '#nowhere',
					'target' => '_self',
					'value' => 'Preview',
					'btn-class' => 'exopite-sof-btn',
				),
			),
		);

		// Step 1: Create an array to hold the new info sub-arrays.
		$info_fields = array();

		// Step 2: Use a loop to generate the new info sub-arrays.
		for ( $i = 1; $i <= 6; $i++ ) {
			$info_fields[] = array(
				'type' => 'fieldset',
				'id' => 'scene_info' . $i,
				'title'   => 'Info Link ' . $i,
				// 'description' => 'Scene Info Link 1 description',
					'fields' => array(
						array(
							'id'          => 'scene_info_text' . $i,
							'type'        => 'text',
							'title'       => 'Text',
							'class'       => 'text-class',
							'sanitize'    => 'sanitize_text_field',
						),
						array(
							'id'          => 'scene_info_url' . $i,
							'type'        => 'text',
							'title'       => 'URL',
							'class'       => 'text-class',
							'sanitize'    => 'sanitize_url',
						),
					),
			);
		}
		// Step 1: Create an array to hold the new info sub-arrays.
		$photo_fields = array();

		// Step 2: Use a loop to generate the new info sub-arrays.
		for ( $i = 1; $i <= 6; $i++ ) {
			$photo_fields[] = array(
				'type' => 'fieldset',
				'id' => 'scene_photo' . $i,
				'title'   => 'Photo Link ' . $i,
				'fields' => array(
					array(
						'id'             => 'scene_photo_location' . $i,
						'type'           => 'select',
						'title'          => 'Image Location',
						'options'        => array(
							'Internal' => 'Within this site',
							'External' => 'Outside of this site',
						),
						'default'     => 'External',
						'sanitize'    => 'sanitize_url',
					),
					array(
						'id'          => 'scene_photo_text' . $i,
						'type'        => 'text',
						'title'       => 'Link Text',
						'class'       => 'text-class',
						'sanitize'    => 'sanitize_text_field',
					),
					array(
						'id'          => 'scene_photo_url' . $i,
						'type'        => 'text',
						'title'       => 'URL',
						'class'       => 'text-class',
						'sanitize'    => 'sanitize_url',
					),
					array(
						'id'       => 'scene_photo_internal' . $i,
						'type'     => 'image',
						'title'    => 'Image',
						'sanitize' => 'sanitize_url',
					),
				),
			);
		}

		// Step 1: Create an array to hold the new info sub-arrays.
		$section_fields = array();

		// Step 2: Use a loop to generate the new info sub-arrays.
		for ( $i = 1; $i <= 6; $i++ ) {
			$section_fields[] = array(
				'type' => 'fieldset',
				'id' => 'scene_section' . $i,
				'title'   => 'Scene Section ' . $i . '*',
				'fields' => array(
					array(
						'id'          => 'scene_section_title' . $i,
						'type'        => 'text',
						'title'       => 'Section Title',
						'class'       => 'text-class',
						'sanitize'    => 'sanitize_text_field',
					),
					array(
						'id'       => 'scene_section_hover_color' . $i,
						'type'     => 'color',
						'title'    => 'Section Hover Color',
						'picker'   => 'html5',
						'default'  => '#FFFF00',
						'sanitize' => 'sanitize_hex_color',
					),
					array(
						'id'       => 'scene_section_hover_text_color' . $i,
						'type'     => 'color',
						'title'    => 'Section Hover Text Color',
						'picker'   => 'html5',
						'default'  => '#00000',
						'sanitize' => 'sanitize_hex_color',
					),
				),
			);
		}

		// Step 3: Insert the new sub-arrays after the second element in the original 'fields' array.

		array_splice( $fields, 5, 0, $info_fields );
		array_splice( $fields, 12, 0, $photo_fields );
		array_splice( $fields, 28, 0, $section_fields );

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
		$options_panel = new Exopite_Simple_Options_Framework( $config_metabox, $fields_holder ); // $fields.

		// Create array of fields to be registered with register_meta.
		$fields_to_be_registered = array(
			array( 'scene_location', 'string', 'The location of the scene' ),
			array( 'scene_tagline', 'string', 'The scene tagline' ),
			array( 'scene_infographic', 'string', 'The url of the infographic' ),
			array( 'scene_info_entries', 'integer', 'The number of info links' ),
			array( 'scene_section_number', 'integer', 'The number of scene sections' ),
			array( 'scene_hover_color', 'string', 'The hover color for the icons' ),
			array( 'scene_hover_text_color', 'string', 'The hover text color for the icons' ),
			array( 'scene_photo_entries', 'integer', 'The number of scene links' ),
			array( 'scene_published', 'string', 'Is the scene live' ),
			array( 'scene_toc_style', 'string', 'Table of contents style' ),
		);

		foreach ( $fields_to_be_registered as $target_sub_array ) {
			register_meta(
				'post', // Object type. In this case, 'post' refers to custom post type 'Scene'.
				$target_sub_array[0], // Meta key name.
				array(
					'show_in_rest' => true, // Make the field available in REST API.
					'single' => true, // Indicates whether the meta key has one single value.
					'type' => $target_sub_array[1], // Data type of the meta value.
					'description' => $target_sub_array[2], // Description of the meta key.
					'auth_callback' => '__return_false',
				)
			);
		}

		$field_and_description = array(
			array( 'scene_info', 'Info link ' ),
			array( 'scene_photo', 'Photo link ' ),
			array( 'scene_photo_internal', 'Internal photo link ' ),
			array( 'scene_section', 'Scene section ' ),
		);

		for ( $i = 1; $i < 7; $i++ ) {
			foreach ( $field_and_description as $target_field_and_description ) {
				$target_field = $target_field_and_description[0] . $i;
				$target_description = $target_field_and_description[1] . $i;
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
	}

	/**
	 * Register Scene custom fields for use by REST API.
	 *
	 * @since    1.0.0
	 */
	public function register_scene_rest_fields() {
		$scene_rest_fields = array(
			'scene_location',
			'scene_infographic',
			'scene_tagline',

			'scene_info_entries',
			'scene_photo_entries',
			'scene_section_number',
			'scene_hover_color',
			'scene_hover_text_color',
			'scene_published',
			'scene_toc_style',
		);

		for ( $i = 1; $i < 7; $i++ ) {
			array_push( $scene_rest_fields, 'scene_info' . $i, 'scene_photo' . $i, 'scene_photo_internal' . $i, 'scene_section' . $i );
		}
		$function_utilities = new Graphic_Data_Utility();
		$function_utilities->register_custom_rest_fields( 'scene', $scene_rest_fields );
	}

	/**
	 * Filter REST API queries for scenes by the "scene_location" meta field.
	 *
	 * Appends a LIKE meta_query clause to the WP_Query arguments when the
	 * 'scene_location' parameter is present in the REST request, enabling
	 * partial-match filtering on the scene_location post meta value.
	 *
	 * Intended as a callback for the 'rest_scene_query' filter.
	 *
	 * @since 1.0.0
	 *
	 * @param array           $args    The WP_Query arguments for the REST request.
	 * @param WP_REST_Request $request The current REST API request object.
	 * @return array Modified query arguments with the meta_query clause appended
	 *               when the scene_location parameter is set.
	 */
	public function filter_scene_by_scene_location( $args, $request ) {
		if ( isset( $request['scene_location'] ) ) {
			$args['meta_query'][] = array(
				'key' => 'scene_location',
				'value' => $request['scene_location'],
				'compare' => 'LIKE', // Change comparison method as needed.
			);
		}
		return $args;
	}

	/**
	 * Add custom rewrite rules for scene permalinks.
	 *
	 * Prepends a rewrite rule that maps a two-segment URL structure
	 * ({instance_slug}/{scene_slug}) to the scene post type. The new rule
	 * is added before the existing rules so it takes priority.
	 *
	 * Intended as a callback for the 'rewrite_rules_array' filter.
	 *
	 * @since 1.0.0
	 *
	 * @param array $rules The existing WordPress rewrite rules.
	 * @return array Modified rewrite rules with the scene rule prepended.
	 */
	public function add_scene_rewrite_rules( $rules ) {
		$new_rules = array(
			'([^/]+)/([^/]+)/?$' => 'index.php?post_type=scene&name=$matches[2]&instance_slug=$matches[1]', // Map URL structure to scene post type.
		);
		return $new_rules + $rules;
	}

	/**
	 * Rewrite the permalink for scene posts to use the instance slug.
	 *
	 * Replaces the default scene permalink with a custom structure:
	 * {home_url}/{instance_slug}/{scene_slug}/
	 *
	 * The instance slug is derived from the 'instance_slug' meta field of
	 * the instance post assigned via the scene's 'scene_location' meta.
	 * Returns the original link unchanged if the post is not a published
	 * scene or the associated instance data is missing.
	 *
	 * Intended as a callback for the 'post_type_link' filter.
	 *
	 * @since 1.0.0
	 *
	 * @param string  $post_link  The default permalink for the post.
	 * @param WP_Post $post       The current post object.
	 * @param bool    $leavename  Whether to keep the post name or use a placeholder.
	 * @return string The modified permalink, or the original if conditions are not met.
	 */
	public function remove_scene_slug( $post_link, $post, $leavename ) {
		if ( 'scene' != $post->post_type || 'publish' != $post->post_status ) {
			return $post_link;
		}

		$instance_id = get_post_meta( $post->ID, 'scene_location', true );
		$instance = get_post( $instance_id );
		$web_slug = get_post_meta( $instance_id, 'instance_slug', true );

		if ( ! $instance || ! $web_slug ) {
			return $post_link;
		}

		return home_url( '/' . $web_slug . '/' . $post->post_name . '/' );
	}

	/**
	 * Registers the "status" column as sortable in the Scene, Modal, and Figure custom post admin lists.
	 *
	 * @param array $sortable_columns An array of sortable columns.
	 * @return array Modified array with the "status" column set as sortable by "modified".
	 */
	public function register_status_as_sortable_column( $sortable_columns ) {
		$sortable_columns['status'] = 'modified'; // Sorting by post_modified column.
		return $sortable_columns;
	}

	/**
	 * Modifies the main WordPress query to enable sorting by the last modified date.
	 *
	 * This function ensures that when sorting is triggered by the "status" column,
	 * WordPress orders the Scene, Modal, or Figure posts based on the `post_modified` field in ascending
	 * or descending order, depending on user selection.
	 *
	 * @param WP_Query $query The current query instance.
	 * @return void
	 */
	public function orderby_status_column( $query ) {
		// Ensure we are in the admin area and working with the main query.
		if ( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}

		// Retrieve the sorting parameters.
		$orderby = $query->get( 'orderby' );
		$order = strtoupper( $query->get( 'order' ) ) === 'ASC' ? 'ASC' : 'DESC'; // Default to DESC if not set.

		// Apply sorting if the "modified" column is selected.
		if ( 'modified' == $orderby ) {
			$query->set( 'orderby', 'modified' );
			$query->set( 'order', $order );
		}
	}
}
