<?php
/**
 * Utility functions used across the plugin
 *
 * @link       https://github.com/ioos/sanctuarywatch_graphicdata
 * @since      1.0.0
 */
class Graphic_Data_Utility {

	/**
	 * Shorten string without cutting words midword.
	 *
	 * @param string $string The string to be shortened.
	 * @param int    $your_desired_width The number of characters in the shortened string.
	 * @return string The shortened string
	 * @since    1.0.0
	 */
	public function string_truncate( $string, $your_desired_width ) {
		$parts = preg_split( '/([\s\n\r]+)/', $string, -1, PREG_SPLIT_DELIM_CAPTURE );
		$parts_count = count( $parts );

		$length = 0;
		for ( $last_part = 0; $last_part < $parts_count; ++$last_part ) {
			$length += strlen( $parts[ $last_part ] );
			if ( $length > $your_desired_width ) {
				break;
			}
		}
		return implode( array_slice( $parts, 0, $last_part ) );
	}

	/**
	 * Add nonce field to about, modal, scene, instance, and figure custom post types.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_Post $post Current post object.
	 */
	public function render_nonce_field( $post ) {
		$custom_post_type = $post->post_type;
		switch ( $custom_post_type ) {
			case 'about':
				$action = 'save_about_fields';
				$name   = 'about_nonce';
				break;
			case 'modal':
				$action = 'save_modal_fields';
				$name   = 'modal_nonce';
				break;
			case 'scene':
				$action = 'save_scene_fields';
				$name   = 'scene_nonce';
				break;
			case 'instance':
				$action = 'save_instance_fields';
				$name   = 'instance_nonce';
				break;
			case 'figure':
				$action = 'save_figure_fields';
				$name   = 'figure_nonce';
				break;
			default:
				return; // No nonce for other post types.
		}
		wp_nonce_field( $action, $name );
	}

	/**
	 * Output transient data as JavaScript for field validation.
	 *
	 * Retrieves user-specific transient data containing custom field values
	 * and outputs it as a JavaScript variable on post edit pages. Only runs
	 * for specific custom post types (modal, scene, instance, figure, about).
	 * The transient is deleted after being output.
	 *
	 * @return void
	 * @since 1.0.0
	 */
	public function output_transient_to_js() {
		// Only run on edit post pages for certain custom content post types.
		global $pagenow, $post;

		if ( 'post.php' !== $pagenow ) {
			return;
		}

		$acceptable_post_types = [ 'modal', 'scene', 'instance', 'figure', 'about' ];
		$current_post_type = isset( $post->post_type ) ? $post->post_type : '';

		if ( ! $post || ! in_array( $current_post_type, $acceptable_post_types ) ) {
			return;
		}

		// Get current user ID.
		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			return;
		}

		// Check if transient exists for this user.
		$transient_name = $current_post_type . "_error_all_fields_user_{$user_id}";

		$transient_data = get_transient( $transient_name );

		if ( false !== $transient_data ) {
			// Output the transient data as JavaScript.
			?>
			<script type="text/javascript">
				const allCustomFields = <?php echo wp_json_encode( $transient_data ); ?>;
			</script>
			<?php

			// Delete the transient after outputting it.
			delete_transient( $transient_name );
		}
	}

	/**
	 * Store field values in a user-specific transient.
	 *
	 * Writes field configuration data to a transient for later retrieval during
	 * field validation. Handles both array and string data types. For arrays with
	 * keys ending in 'error_all_fields', extracts nested field values; otherwise
	 * stores the data as-is. Cleans up expired transients before storing new ones.
	 *
	 * @param string       $key_name      The base key for the transient (e.g., 'modal_error_all_fields').
	 * @param array|string $fields_config The fields configuration array or string value to store.
	 * @param int          $expiration    Optional. Time until expiration in seconds. Default 1800 (30 minutes).
	 * @return void
	 * @since 1.0.0
	 */
	public function fields_to_transient( $key_name, $fields_config, $expiration = 1800 ) {
		delete_expired_transients(); // Ensure expired transients are cleaned up before storing new ones.
		$all_fields = array();

		$variable_type = gettype( $fields_config );

		if ( 'array' == $variable_type ) {
			if ( substr( $key_name, -16 ) === 'error_all_fields' ) {
				$this->extract_field_values( $fields_config, $all_fields );
			} else {
				$all_fields = $fields_config;
			}
		} else if ( 'string' === $variable_type ) {
			$all_fields = $fields_config;
		}
		// Create a unique transient key for this user and content type.
		$transient_key = $this->get_user_transient_key( $key_name );

		// Store in transient instead of session.
		set_transient( $transient_key, $all_fields, $expiration );
	}

	/**
	 * Helper function to create a unique transient key for the current user, based on the user ID.
	 *
	 * This function is used as part of the field validation process in multiple places.
	 *
	 * @param string $base_key The base key for the transient
	 * @return string The user-specific transient key
	 */
	public function get_user_transient_key( $base_key ) {
		$user_id = get_current_user_id();
		return $base_key . '_user_' . $user_id;
	}

	/**
	 * Helper function to retrieve field values from transients.
	 *
	 * @param string $content_type The custom content type
	 * @return array|false The stored field values or false if not found
	 */
	public function get_fields_from_transient( $content_type ) {
		$transient_key = $this->get_user_transient_key( $content_type . '_error_all_fields' );
		return get_transient( $transient_key );
	}

	/**
	 * Dummy sanitize function that returns the value as is.
	 * .
	 * This sanitize function is used to prevent automatic sanitization of
	 * URL fields. What is causing the automatic sanitization is unknown but
	 * exists somewhere deep in the Exopite Framework options. The problem comes up
	 * with URL escape codes which are not interpreted correctly by whatever
	 * is doing the automatic sanitization. This function, in contrast, ensures that
	 * the user input is preserved.
	 *
	 * @param string $value The URL field to be returned.
	 * @return string The URL field.
	 */
	public function dummy_sanitize( $value ) {
		return $value;
	}

	/**
	 * Helper function to delete field values from transients
	 *
	 * @param string $content_type The custom content type
	 * @return bool True if successful, false otherwise
	 */
	public function delete_fields_transient( $content_type ) {
		$transient_key = $this->get_user_transient_key( $content_type . '_error_all_fields' );
		return delete_transient( $transient_key );
	}

	/**
	 * Recursively extract field values from POST data based on field configuration
	 *
	 * @param array $fields The fields configuration array
	 * @param array &$all_fields Reference to array where field values will be stored
	 */
	public function extract_field_values( $fields, &$all_fields ) {
		foreach ( $fields as $field ) {
			// Skip button type fields.
			if ( isset( $field['type'] ) && 'button' === $field['type'] ) {
				continue;
			}

			// Handle fieldsets (nested fields).
			if ( isset( $field['type'] ) && 'fieldset' === $field['type'] ) {
				$fieldset_id = $field['id'];

				// Process each field within the fieldset.
				if ( isset( $field['fields'] ) && is_array( $field['fields'] ) ) {
					foreach ( $field['fields'] as $nested_field ) {
						if ( isset( $nested_field['id'] ) && isset( $nested_field['type'] ) && 'button' !== $nested_field['type'] ) {
							$nested_field_id = $nested_field['id'];
							// For fieldsets, data is nested: $_POST[fieldset_id][field_id].
							if ( isset( $_POST[ $fieldset_id ][ $nested_field_id ] ) ) {
								$all_fields[ $nested_field_id ] = $_POST[ $fieldset_id ][ $nested_field_id ];
							}
						}
					}
				}
			} elseif ( isset( $field['id'] ) && isset( $field['type'] ) ) {
				// Handle regular fields.
				$field_id = $field['id'];
				// For regular fields, data is direct: $_POST[field_id].
				if ( isset( $_POST[ $field_id ] ) ) {
					$all_fields[ $field_id ] = $_POST[ $field_id ];
				}
			}

			// Handle nested field arrays (like your tabFields).
			if ( isset( $field['fields'] ) && is_array( $field['fields'] ) ) {
				$this->extract_field_values( $field['fields'], $all_fields );
			}
		}
	}

	/**
	 * Checks if a scene is the overview scene for an instance and - if so - if the scene has been set to draft (hint: it shouldn't be)
	 *
	 * The overview scene for an instance should not be in draft status, unless the instance is itself not published.
	 * The reason is that the front page tile for the instance will just redirect back to the front page of the site
	 * (if the the overview scene is set to draft). If the overview scene is set to draft then an admin notice is posted
	 * in the edit screen for the relevant scene and instance.
	 *
	 * @return void Outputs the appropriate admin notice if necessary.
	 */
	public function check_draft_overview_scene() {

		if ( function_exists( 'get_current_screen' ) ) {
			$current_screen = get_current_screen();
			if ( $current_screen ) {
				$post_type = $current_screen->post_type;
				if ( 'post' == $current_screen->base && $current_screen->id == $post_type && ! ( 'add' == $current_screen->action ) ) {
					if ( 'scene' == $post_type || 'instance' == $post_type ) {
						if ( 'scene' == $post_type ) {
							$current_scene_id = get_the_ID();
							$instance_id = get_post_meta( $current_scene_id, 'scene_location', true );
							if ( '' == $instance_id ) {
								return;
							}
						} else {
							$instance_id = get_the_ID();
						}

						$instance_overview_scene = get_post_meta( $instance_id, 'instance_overview_scene', true );

						if ( '' == $instance_overview_scene ) {
							return;
						}

						$instance_overview_scene_status = get_post_meta( $instance_overview_scene, 'scene_published', true );

						if ( 'draft' != $instance_overview_scene_status ) {
							return;
						}

						if ( 'scene' == $post_type && ( $current_scene_id != $instance_overview_scene ) ) {
							return;
						}

						if ( 'scene' == $post_type ) {
							$warning_message = "Warning: this scene has a scene status of 'Draft'. This will cause the front page tile for the instance to not work.";
						} else {
							$warning_message = "Warning: the overview scene for this instance has a scene status of 'Draft'. This will cause the front page tile for the instance to not work.";
						}

						wp_admin_notice(
							$warning_message,
							array(
								'type'               => 'warning',
								'additional_classes' => array( 'updated' ),
								'dismissible'        => true,
							)
						);
					}
				}
			}
		}
	}

	/**
	 * Displays admin notices for the following kind of custom content posts: about, instance, scene, modal, and figure.
	 *
	 * Shows informational, error, or warning messages based on the status of the post.
	 * Notices are displayed only on the post type edit screen after a post has been updated.
	 *
	 * @return void Outputs the appropriate admin notice.
	 */
	public function post_admin_notice() {
		// First let's determine where we are. We only want to show admin notices in the right places. Namely in one of our custom
		// posts after it has been updated. The if statement is looking for three things: 1. Right post type? 2. An individual post (as opposed to the scene
		// admin screen)? 3. A new post.

		if ( function_exists( 'get_current_screen' ) ) {
			$current_screen = get_current_screen();
			if ( $current_screen ) {
				$post_type = $current_screen->post_type;
				if ( 'post' == $current_screen->base && $current_screen->id == $post_type && ! ( 'add' == $current_screen->action ) ) {
					$current_post_status = $this->retrieve_post_status( $post_type );
					if ( 'none' == $current_post_status ) {
						return;
					}
					if ( 'post_good' == $current_post_status ) {
						echo '<div class="notice notice-info is-dismissible"><p>' . esc_html( ucfirst( $post_type ) ) . ' created or updated.</p></div>';
					} else if ( 'post_error' == $current_post_status ) {
						$error_message = '<p>Error or errors in ' . $post_type . '</p>';
						$error_list_array = $this->retrieve_post_errors_warnings( $post_type, '_errors' );
						if ( 'none' != $error_list_array ) {
							$error_array_length = count( $error_list_array );
							$error_message = $error_message . '<p><ul>';
							for ( $i = 0; $i < $error_array_length; $i++ ) {
								$error_message = $error_message . '<li>' . $error_list_array[ $i ] . '</li>';
							}
							$error_message = $error_message . '</ul></p>';
						}

						echo '<div class="notice notice-error is-dismissible">' . esc_html( $error_message ) . '</div>';
					}
					$warning_list_array = $this->retrieve_post_errors_warnings( $post_type, '_warnings' );
					if ( 'none' != $warning_list_array ) {
						$warning_message = '<p>Warning or warnings in ' . $post_type . '</p>';
						$warning_array_length = count( $warning_list_array );
						$warning_message = $warning_message . '<p><ul>';
						for ( $i = 0; $i < $warning_array_length; $i++ ) {
							$warning_message = $warning_message . '<li>' . $warning_list_array[ $i ] . '</li>';
						}
						$warning_message = $warning_message . '</ul></p>';
						echo '<div class="notice notice-warning is-dismissible">' . esc_html( $warning_message ) . '</div>';
					}
				}
			}
		}
	}

	/**
	 * Return post status for custom posts.
	 *
	 * This function the post status associated with custom
	 * posts of type about, instance, scene, modal, and figure. The retrieval
	 * occurs from a WordPress transient, which is recorded at the moment
	 * that the post in question was saved. This function is used after that
	 * posts reloads after the save.
	 *
	 * @param string $post_type The custom post type.
	 */
	public function retrieve_post_status( $post_type ) {
		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			return 'none';
		}

		// Check if transient exists for this user.
		$transient_name = $post_type . "_post_status_user_{$user_id}";

		// Retrieve transient, if it's there.
		$transient_data = get_transient( $transient_name );
		// Post status.
		if ( false == $transient_data ) {
			return 'none';
		} else {
			return $transient_data;
			delete_transient( $transient_name );
		}
	}

	/**
	 * Return data entry errors and warnings associated with custom posts.
	 *
	 * This function retrieves errors and warnings associated with custom
	 * posts of type about, instance, scene, modal, and figure. The retrieval
	 * occurs from WordPress transients, which are recorded at the moment
	 * that the post in question was saved. This function is used after that
	 * posts reloads after the save.
	 *
	 * @param string $post_type The custom post type.
	 * @param string $issue_type Either 'errors' or 'warnings'.
	 */
	public function retrieve_post_errors_warnings( $post_type, $issue_type ) {
		$user_id = get_current_user_id();

		if ( ! $user_id ) {
			return 'none';
		}

		// Check if transient exists for this user.
		$transient_name = $post_type . $issue_type . "_user_{$user_id}";

		// Retrieve transient, if it's there.
		$transient_data = get_transient( $transient_name );
		// Post status.
		if ( false == $transient_data ) {
			return 'none';
		} else {
			return $transient_data;
			delete_transient( $transient_name );
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
	public function get_filter_value( $meta_key ) {
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
	 * Create Instance filter dropdown shown in the Scene, Modal, and Figure admin column screens.
	 *
	 * Generates a dropdown filter for selecting instances with role-based access control.
	 * Content editors see only their assigned instances, while administrators and content managers see all published instances.
	 * The dropdown maintains the selected value across page loads via GET parameter or stored filter value.
	 *
	 * @since 1.0.0
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 *
	 * @param string $element_name The name and ID attribute for the select element.
	 *                             Used for form submission and DOM targeting.
	 *
	 * @return void Outputs the HTML select element directly to the buffer.
	 *
	 * @uses wp_get_current_user()     Retrieves the current user object.
	 * @uses current_user_can()        Checks user capabilities for role-based filtering.
	 * @uses get_user_meta()            Fetches assigned instances for content editors.
	 * @uses selected()                 WordPress helper for marking selected options.
	 * @uses esc_attr()                 Escapes attribute values for security.
	 * @uses esc_html()                 Escapes output text for security.
	 * @uses esc_html__()               Translates and escapes text.
	 * @uses $this->get_filter_value()  Retrieves stored filter value (custom method).
	 *
	 * @example
	 * // Display instance filter with custom element name
	 * $this->create_instance_dropdown_filter('scene_instance');
	 *
	 * @security
	 * - Sanitizes instance IDs using absint() before SQL queries
	 * - Escapes all output using esc_attr() and esc_html()
	 * - Validates user permissions before showing filtered results
	 * - Prepares SQL safely by using sanitized, imploded integer arrays
	 *
	 * @access public
	 */
	public function create_instance_dropdown_filter( $element_name ) {
		global $wpdb;
		$instances = array(); // Initialize as empty array.

		$current_user = wp_get_current_user();

		// Check if user is content editor but not administrator.
		if ( current_user_can( 'content_editor' ) && ! current_user_can( 'manage_options' ) ) {
			// Get assigned instances for the content editor.
			$user_instances = get_user_meta( $current_user->ID, 'assigned_instances', true );

			// Ensure user_instances is a non-empty array before querying.
			if ( ! empty( $user_instances ) && is_array( $user_instances ) ) {
				// Sanitize instance IDs.
				$instance_ids = array_map( 'absint', $user_instances );
				$instance_ids_sql = implode( ',', $instance_ids );

				// Query only the assigned instances.
				$instances = $wpdb->get_results(
					"
					SELECT ID, post_title
					FROM {$wpdb->posts}
					WHERE post_type = 'instance'
					AND post_status = 'publish'
					AND ID IN ({$instance_ids_sql})
					ORDER BY post_title ASC"
				);
			}
			// If content editor has no assigned instances, $instances remains empty, so only "All Instances" shows.

		} else {
			// Administrators or other roles see all instances.
			$instances = $wpdb->get_results(
				"
				SELECT ID, post_title
				FROM {$wpdb->posts}
				WHERE post_type = 'instance'
				AND post_status = 'publish'
				ORDER BY post_title ASC"
			);
		}

		// Get selected instance from URL or from stored value.
		$current_selection = isset( $_GET[ $element_name ] ) ? absint( $_GET[ $element_name ] ) : $this->get_filter_value( "{$element_name}" );

		// Generate the dropdown HTML.
		echo '<select name="' . esc_attr( $element_name ) . '" id="' . esc_attr( $element_name ) . '">';
		echo '<option value="">All Instances</option>';

		// Check if $instances is not null and is an array before looping.
		if ( is_array( $instances ) ) {
			foreach ( $instances as $instance ) {
				// Ensure $instance is an object with ID and post_title properties.
				if ( is_object( $instance ) && isset( $instance->ID ) && isset( $instance->post_title ) ) {
					$selected = selected( $current_selection, $instance->ID, false ); // Use selected() helper.
					echo '<option value="' . esc_attr( $instance->ID ) . '" ' . esc_attr( $selected ) . '>' . esc_html( $instance->post_title ) . '</option>';
				}
			}
		}
		echo '</select>';
	}


	/**
	 * Get a list of all instances, filtered for 'content_editor' role.
	 *
	 * @return array An associative array of instance IDs and titles.
	 */
	public function return_all_instances() {
		// Initialize the result array with a default empty option.
		$instances_array = array( ' ' => '' );

		// Get the current user.
		$current_user = wp_get_current_user();
		if ( ! $current_user || 0 === $current_user->ID ) {
			// If no user is logged in, return just the empty option (or handle as needed).
			return $instances_array;
		}

		// Default query arguments to get all published instances.
		$args = array(
			'post_type'      => 'instance',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
			'post_status'    => 'publish', // Ensure only published instances are fetched.
			'fields'         => 'ids',     // Only retrieve IDs initially.
		);

		// --- Role-Based Filtering Logic ---
		// Check if the current user is a 'content_editor' BUT NOT an 'administrator'.
		if ( user_can( $current_user, 'content_editor' ) && ! user_can( $current_user, 'administrator' ) ) {
			// Get the instances assigned to this content editor.
			$user_assigned_instances = get_user_meta( $current_user->ID, 'assigned_instances', true );

			// Ensure it's a non-empty array.
			if ( ! empty( $user_assigned_instances ) && is_array( $user_assigned_instances ) ) {
				// Modify the query to only include posts with these IDs.
				$args['post__in'] = array_map( 'absint', $user_assigned_instances ); // Sanitize IDs just in case.
			} else {
				// If the content editor has no assigned instances, return only the default empty option.
				return $instances_array;
			}
		}
		// --- End Role-Based Filtering Logic ---
		// Administrators and other roles will use the default $args (fetching all instances).

		// Execute the query.
		$query = new WP_Query( $args );

		// Build the associative array of ID => Title.
		if ( $query->have_posts() ) {
			foreach ( $query->posts as $post_id ) {
				$title = get_the_title( $post_id );
				// Add to array only if title is not empty.
				if ( $title ) {
					$instances_array[ $post_id ] = $title;
				}
			}
		}
		// WP_Query already handled the 'orderby' => 'title', so no need to sort again here.

		return $instances_array;
	}

	/**
	 * Get a list of all scenes associated with an instance.
	 *
	 * @param int $instance_id The instance ID to find scenes for.
	 * @return array Associative array of scene IDs to scene titles, sorted alphabetically.
	 */
	public function return_instance_scenes( $instance_id ) {

		$scene_titles = array();
		$args = array(
			'post_type' => 'scene',  // Your custom post type.
			'posts_per_page' => -1,  // Retrieve all matching posts (-1 means no limit).
			'meta_query' => array(
				array(
					'key' => 'scene_location',      // The custom field key.
					'value' => $instance_id, // The value you are searching for.
					'compare' => '=',         // Comparison operator.
				),
			),
			'fields' => 'ids',            // Only return post IDs.
		);

		// Execute the query.
		$query = new WP_Query( $args );

		// Get the array of post IDs.
		$scene_post_ids = $query->posts;
		foreach ( $scene_post_ids as $target_id ) {
			$target_title = get_post_meta( $target_id, 'post_title', true );
			$scene_titles[ $target_id ] = $target_title;
		}
		asort( $scene_titles );
		return $scene_titles;
	}

	/**
	 * Get scene titles for scenes sharing the same instance as a modal.
	 *
	 * @param int $scene_id The scene ID to get the title for.
	 * @param int $modal_id The modal ID to determine the scene instance.
	 * @return array Associative array of scene IDs to titles with an empty option first, sorted alphabetically.
	 */
	public function return_scene_titles( $scene_id, $modal_id ) {
		$final_scene_titles = array( ' ' => '' );
		if ( array_key_exists( 'post', $_GET ) ) {
			$scene_location = get_post_meta( $modal_id, 'modal_location', true );
			$scene_name = get_post_meta( $scene_id, 'post_title', true );
			$scenes[ $scene_id ] = $scene_name;

			$args = array(
				'post_type' => 'scene',  // Your custom post type.
				'posts_per_page' => -1,  // Retrieve all matching posts (-1 means no limit).
				'meta_query' => array(
					array(
						'key' => 'scene_location',      // The custom field key.
						'value' => $scene_location, // The value you are searching for.
						'compare' => '=',         // Comparison operator.
					),
				),
				'fields' => 'ids',            // Only return post IDs.
			);

			// Execute the query.
			$query = new WP_Query( $args );

			// Get the array of post IDs.
			$scene_post_ids = $query->posts;

			$scene_titles = array();
			foreach ( $scene_post_ids as $target_id ) {
				$target_title = get_post_meta( $target_id, 'post_title', true );
				$scene_titles[ $target_id ] = $target_title;
			}
			asort( $scene_titles );

			// Create the final array starting with the desired empty option.
			$final_scene_titles = array( ' ' => '' );

			// Use the union operator (+) to add the sorted scenes after the empty option.
			// This preserves the keys from $scene_titles.
			$final_scene_titles += $scene_titles;
		}
		return $final_scene_titles;
	}

	/**
	 * Retrieves icon IDs from an SVG infographic associated with a scene.
	 *
	 * Parses the SVG file linked to the scene's infographic meta field and extracts
	 * the IDs of all child elements within the 'icons' group element.
	 *
	 * @param int $scene_id The post ID of the scene.
	 * @return array Associative array of icon IDs where both key and value are the icon ID.
	 *               Returns array with single empty key/value pair if no infographic exists
	 *               or if the 'icons' element is not found in the SVG.
	 */
	public function return_icons( $scene_id ) {
		$modal_icons = array( '' => '' );
		$scene_infographic = get_post_meta( $scene_id, 'scene_infographic', true );
		if ( true == $scene_infographic ) {
			$relative_path = ltrim( parse_url( $scene_infographic )['path'], '/' );

			$full_path = get_home_path() . $relative_path;

			$svg_content = file_get_contents( $full_path );

			if ( false === $svg_content ) {
				die( 'Failed to load SVG file.' );
			}

			// Create a new DOMDocument instance and load the SVG content.
			$dom = new DOMDocument();
			libxml_use_internal_errors( true ); // Suppress errors related to invalid XML.
			$dom->loadXML( $svg_content );
			libxml_clear_errors();

			// Create a new DOMXPath instance.
			$xpath = new DOMXPath( $dom );

			// Find the element with the ID "icons" (case-insensitive).
			// XPath 1.0 doesn't have lower-case(), so we use translate().
			$query = "//*[translate(@id, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'icons']";
			$icons_element = $xpath->query( $query )->item( 0 );

			if ( null === $icons_element ) {
				error_log( "Utility::return_icons - Element with ID 'icons' (case-insensitive) not found in SVG: " . $full_path );
				return $modal_icons; // Element not found.
			}

			// Get all child elements of the "icons" element.
			// The phpcs ignore command on the next line is needed to suppress a php code sniffer error.
			// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
			$child_elements = $icons_element->childNodes;

			// Initialize an array to hold the IDs.
			$child_ids = array();

			// Loop through the child elements and extract their IDs.
			foreach ( $child_elements as $child ) {
				// The phpcs ignore command on the next two lines is needed to suppress a php code sniffer error.
				// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
				if ( XML_ELEMENT_NODE === $child->nodeType && $child instanceof DOMElement && $child->hasAttribute( 'id' ) ) {
					// phpcs:ignore WordPress.NamingConventions.ValidVariableName.UsedPropertyNotSnakeCase
					$child_ids[] = $child->getAttribute( 'id' );
				}
			}
			asort( $child_ids );
			foreach ( $child_ids as $single_icon ) {
				$modal_icons[ $single_icon ] = $single_icon;
			}
		}
		return $modal_icons;
	}

	/**
	 * Return an array of scenes, other than the current scene, for a given location.
	 *
	 * @param int $scene_id The current scene ID to exclude from results.
	 * @return array Associative array of scene IDs to titles with an empty option first, sorted alphabetically.
	 */
	public function returnScenesExceptCurrent( $scene_id ) {
		$potential_scenes = array();
		$scene_location = get_post_meta( $scene_id, 'scene_location', true );
		if ( $scene_location == true ) {
			$args = array(
				'post_type' => 'scene',  // Your custom post type.
				'posts_per_page' => -1,       // Retrieve all matching posts (-1 means no limit).
				'meta_query' => array(
					array(
						'key' => 'scene_location',      // The custom field key.
						'value' => $scene_location, // The value you are searching for.
						'compare' => '=',         // Comparison operator.
					),
				),
				'fields' => 'ids',            // Only return post IDs.
			);

			// Execute the query.
			$query = new WP_Query( $args );

			// Get the array of post IDs.
			$scene_post_ids = $query->posts;
			foreach ( $scene_post_ids as $target_id ) {
				if ( $target_id != $scene_id ) {
					$target_title = get_post_meta( $target_id, 'post_title', true );
					$potential_scenes[ $target_id ] = $target_title;
				}
			}
			asort( $potential_scenes );
			$potential_scenes = array( '' => '' ) + $potential_scenes;
		}
		return $potential_scenes;
	}

	// Potential section headers for icons.
	public function returnModalSections( $scene_id ) {
		$modal_sections = array();
		for ( $i = 1; $i < 7; $i++ ) {
			$field_target = 'scene_section' . $i;
			$target_section = get_post_meta( $scene_id, $field_target, true );
			if ( $target_section != null && $target_section != '' & is_array( $target_section ) ) {
				$target_title = $target_section[ 'scene_section_title' . $i ];
				if ( $target_title != null && $target_title != '' ) {
					$modal_sections[ $field_target ] = $target_title;
				}
			}
		}
		asort( $modal_sections );
		$modal_sections = array_merge( array( '' => '' ), $modal_sections );
		return $modal_sections;
	}

	// Dropdown options for Scene in figure content type.
	public function returnScenesFigure( $location ) {
		$potential_scenes[''] = '';

		if ( $location != '' ) {
			$args = array(
				'post_type' => 'scene',  // Your custom post type.
				'posts_per_page' => -1,   // Retrieve all matching posts (-1 means no limit).
				'meta_query' => array(
					array(
						'key' => 'scene_location',      // The custom field key.
						'value' => $location, // The value you are searching for.
						'compare' => '=',         // Comparison operator.
					),
				),
				'fields' => 'ids',            // Only return post IDs.
			);
			// Execute the query.
			$query = new WP_Query( $args );

			// Get the array of post IDs.
			$scene_post_ids = $query->posts;
			foreach ( $scene_post_ids as $target_id ) {
				$target_title = get_post_meta( $target_id, 'post_title', true );
				$potential_scenes[ $target_id ] = $target_title;
			}
			// asort($potential_scenes);
		}
		return $potential_scenes;
	}

	public function returnModalTabs( $modal_id ) {
		$potential_tabs[''] = '';
		if ( $modal_id != '' ) {
			for ( $i = 1; $i < 7; $i++ ) {
				$target_field = 'modal_tab_title' . $i;
				$target_title = get_post_meta( $modal_id, $target_field, true );
				if ( $target_title != '' && $target_title != null ) {
					$potential_tabs[ $i ] = $target_title;
				}
			}
			// asort($potential_tabs);
		}
		return $potential_tabs;
	}

	// Dropdown options for Icon in figure content type.
	public function returnFigureIcons( $scene_id ) {
		$potential_icons[''] = '';
		if ( $scene_id != '' ) {

			$args = array(
				'post_type' => 'modal',  // Your custom post type.
				'fields' => 'ids',           // Only return post IDs.
				'posts_per_page' => -1,       // Retrieve all matching posts.
				'meta_query' => array(
					array(
						'key' => 'modal_scene',      // The custom field key.
						'value' => $scene_id, // The value you are searching for.
						'compare' => '=',         // Comparison operator.
					),
					array(
						'key' => 'icon_function',
						'value' => 'Modal',
						'compare' => '=',
					),
				),
			);

			// Execute the query.
			$query = new WP_Query( $args );

			// Get the array of post IDs.
			$modal_post_ids = $query->posts;

			$modal_titles = array();
			foreach ( $modal_post_ids as $target_id ) {
				$target_title = get_post_meta( $target_id, 'post_title', true );
				$potential_icons[ $target_id ] = $target_title;
			}
			// asort($potential_icons);
		}

		return $potential_icons;
	}

	// Register rest fields for when rest api hook is called.
	public function register_custom_rest_fields( $post_type, $rest_fields ) {
		foreach ( $rest_fields as $target_field ) {
			register_rest_field(
				$post_type, // Custom post type name.
				$target_field, // Name of the custom field.
				array(
					'get_callback' => array( $this, 'meta_get_callback' ),
					'schema' => null,
				)
			);
		}
	}

	// Used by register_custom_rest_fields.
	public function meta_get_callback( $object, $field_name, $request ) {
		return get_post_meta( $object['id'], $field_name, true );
	}


	/**
	 * Display warning message if add new post is not possible for custom content post type.
	 *
	 * This function display a warning message on the admin screen for a custom content type, if the underlying data necessary
	 * to create a new post of that content type is not present. This function is only currently
	 * implemented for the instance content type, but is intended to be generalized for use with scene, modal, and figure content types as well.
	 *
	 * @global string $pagenow  The current admin page filename.
	 * @global string $typenow  The current post type being viewed.
	 *
	 * @return void  Outputs HTML directly to the admin screen. No return value.
	 * @since    1.0.0
	 */
	function display_warning_message_if_new_post_impossible() {

		global $pagenow, $typenow;

		// Check if we're on the instance post type admin page.
		if ( $pagenow == 'edit.php' && $typenow == 'instance' ) {
			// Check if there are no terms.
			$terms = get_terms(
				array(
					'taxonomy' => 'instance_type',
					'hide_empty' => false,
					'number' => 1,
					'fields' => 'ids',
				)
			);

			if ( is_wp_error( $terms ) || empty( $terms ) ) {
				?>
				<div class="notice notice-error is-dismissible">
					<p><strong>Cannot create Instance posts.</strong> You must create at least one <a href="<?php echo admin_url( 'edit-tags.php?taxonomy=instance_type&post_type=instance' ); ?>">Instance Type</a> before you can add an Instance post. </p>
				</div>
				<?php
			}
		}
	}
}

