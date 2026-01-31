<?php
/**
 * Register class that defines the Figure custom content type as well as associated Figure functions
 */
include_once plugin_dir_path( __DIR__ ) . 'admin/class-utility.php';

/**
 * Handles the Figure custom post type for the Graphic Data plugin.
 *
 * Registers the Figure post type, its custom fields and metaboxes,
 * admin list table columns, filter dropdowns, REST API fields and routes,
 * and file upload/delete handlers for interactive figure data.
 *
 * @since 1.0.0
 */
class Graphic_Data_Figure {
	/**
	 * Enqueue admin scripts for the Figure post type edit screen.
	 *
	 * Loads the admin-figure.js script with REST API credentials for
	 * interactive graph data retrieval, and localizes default line and
	 * bar chart arguments from the plugin settings page for use by the
	 * Plotly charting scripts.
	 *
	 * Only enqueued on the post.php and post-new.php screens for the
	 * 'figure' post type.
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook The current admin page hook suffix.
	 * @return void
	 */
	public function enqueue_admin_interactive_graph_script( $hook ) {
		if ( 'post.php' !== $hook && 'post-new.php' !== $hook ) {
			return;
		}
		$current_post_type = get_post_type();
		if ( 'figure' == $current_post_type ) {

			// AJAX action for handling interactive graph data retrieval.
			wp_enqueue_script(
				'admin-figure',
				plugin_dir_url( __FILE__ ) . '../admin/js/admin-figure.js',
				[], // <-- no jquery needed.
				GRAPHIC_DATA_PLUGIN_VERSION,
				true
			);
			wp_localize_script(
				'admin-figure',
				'wpApiSettings',
				[
					'nonce' => wp_create_nonce( 'wp_rest' ),
					'root'  => esc_url_raw( rest_url() ),
				]
			);

			// default_interactive_arguments for line and bar charts from graphic_data_plugin/includes/admin-settings-page.php.
			$settings = get_option( 'graphic_data_settings' );
			$default_interactive_line_arguments = isset( $settings['interactive_line_arguments'] ) ? $settings['interactive_line_arguments'] : '';
			wp_localize_script(
				'plotly-timeseries-line',  // MUST match the enqueued handle in graphic_data_plugin/admin/class-admin.php.
				'argumentsDefaultsLine',           // global object name.
				[ 'interactive_line_arguments' => $default_interactive_line_arguments ]
			);

			$settings = get_option( 'graphic_data_settings' );
			$default_interactive_bar_arguments = isset( $settings['interactive_bar_arguments'] ) ? $settings['interactive_bar_arguments'] : '';
			wp_localize_script(
				'plotly-bar',  // MUST match the enqueued handle in graphic_data_plugin/admin/class-admin.php.
				'argumentsDefaultsBar',           // global object name.
				[ 'interactive_bar_arguments' => $default_interactive_bar_arguments ]
			);
		}
	}

	/**
	 * Set custom columns for the Figure post type admin list table.
	 *
	 * Replaces the default WordPress admin columns with custom columns
	 * specific to the Figure custom post type, including instance, scene,
	 * icon, tab, order, image location, and status information.
	 *
	 * Intended as a callback for the 'manage_figure_posts_columns' filter.
	 *
	 * @since 1.0.0
	 * @link  https://www.smashingmagazine.com/2017/12/customizing-admin-columns-wordpress/
	 *
	 * @param array $columns Default WordPress admin columns array where
	 *                       keys are column IDs and values are column labels.
	 * @return array Modified columns array with custom Figure-specific columns.
	 */
	public function change_figure_columns( $columns ) {
		$columns = array(
			'title' => 'Title',
			'figure_instance' => 'Instance',
			'figure_scene' => 'Scene',
			'figure_modal' => 'Icon',
			'figure_tab' => 'Tab',
			'figure_order' => 'Order',
			'figure_image_location' => 'Image Location',
			'status' => 'Status',
		);
		return $columns;
	}

	/**
	 * Populate custom fields for Figure content type in the admin screen.
	 *
	 * @param string $column The name of the column.
	 * @param int    $post_id The database id of the post.
	 * @since    1.0.0
	 */
	public function custom_figure_column( $column, $post_id ) {

		$modal_id = get_post_meta( $post_id, 'figure_modal', true );

		if ( 'figure_instance' === $column ) {
			$instance_id = get_post_meta( $post_id, 'location', true );
			echo esc_html( get_the_title( $instance_id ) );
		}

		if ( 'figure_scene' === $column ) {
			$scene_id = get_post_meta( $post_id, 'figure_scene', true );
			$scene_title = get_the_title( $scene_id );
			echo esc_html( $scene_title );
		}

		if ( 'figure_modal' === $column ) {
			echo esc_html( get_the_title( $modal_id ) );
		}

		if ( 'figure_tab' === $column ) {
			$tab_number = get_post_meta( $post_id, 'figure_tab', true );
			$tab_meta_key = 'modal_tab_title' . $tab_number;
			echo esc_html( get_post_meta( $modal_id, $tab_meta_key, true ) );
		}

		if ( 'figure_order' === $column ) {
			echo esc_html( get_post_meta( $post_id, 'figure_order', true ) );
		}

		if ( 'figure_image_location' === $column ) {
			echo esc_html( get_post_meta( $post_id, 'figure_path', true ) );
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
	 * Store figure filter values in user metadata with 20-minute expiration.
	 *
	 * This function captures the current Figure filter selections from the URL parameters
	 * and stores them in user metadata with a 20-minute expiration timestamp.
	 * It handles all three filter types: instance, scene, and icon.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function store_figure_filter_values() {
		$screen = get_current_screen();
		if ( 'edit-figure' != $screen->id ) {
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

		// Store figure_instance filter value if it exists.
		if ( isset( $_GET['figure_instance'] ) && ! empty( $_GET['figure_instance'] ) ) {
			update_user_meta( $user_id, 'figure_instance', absint( $_GET['figure_instance'] ) );
			update_user_meta( $user_id, 'figure_instance_expiration', $expiration_time );
		}

		// Store figure_scene filter value if it exists.
		if ( isset( $_GET['figure_scene'] ) && ! empty( $_GET['figure_scene'] ) ) {
			update_user_meta( $user_id, 'figure_scene', absint( $_GET['figure_scene'] ) );
			update_user_meta( $user_id, 'figure_scene_expiration', $expiration_time );
		}

		// Store figure_icon filter value if it exists.
		if ( isset( $_GET['figure_icon'] ) && ! empty( $_GET['figure_icon'] ) ) {
			update_user_meta( $user_id, 'figure_icon', absint( $_GET['figure_icon'] ) );
			update_user_meta( $user_id, 'figure_icon_expiration', $expiration_time );
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
	public function get_figure_filter_value( $meta_key ) {
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
	 * Clean up expired figure filter values in user metadata.
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
	public function cleanup_expired_figure_filters() {
		$screen = get_current_screen();
		if ( ! $screen || 'edit-figure' != $screen->id ) {
			return;
		}

		$user_id = get_current_user_id();
		if ( ! $user_id ) {
			return;
		}

		$current_time = time();

		// Check and clean up figure_instance.
		$expiration_time = get_user_meta( $user_id, 'figure_instance_expiration', true );
		if ( $expiration_time && $current_time > $expiration_time ) {
			delete_user_meta( $user_id, 'figure_instance' );
			delete_user_meta( $user_id, 'figure_instance_expiration' );
		}

		// Check and clean up figure_scene.
		$expiration_time = get_user_meta( $user_id, 'figure_scene_expiration', true );
		if ( $expiration_time && $current_time > $expiration_time ) {
			delete_user_meta( $user_id, 'figure_scene' );
			delete_user_meta( $user_id, 'figure_scene_expiration' );
		}

		// Check and clean up figure_icon.
		$expiration_time = get_user_meta( $user_id, 'figure_icon_expiration', true );
		if ( $expiration_time && $current_time > $expiration_time ) {
			delete_user_meta( $user_id, 'figure_icon' );
			delete_user_meta( $user_id, 'figure_icon_expiration' );
		}
	}

	/**
	 * Add filter dropdowns for the Figure admin screen with persistent selection support.
	 *
	 * This function creates and outputs filter dropdowns for instance, scene, and icon
	 * on the Figure post type admin screen. It first checks for filter values in the URL
	 * parameters, then falls back to stored user metadata values if they haven't expired.
	 * After displaying the dropdowns, it stores the current selections for future use.
	 * The dropdowns are hierarchical - scene options depend on instance selection, and
	 * icon options depend on scene selection.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @return   void
	 */
	public function figure_filter_dropdowns() {
		$screen = get_current_screen();
		if ( 'edit-figure' == $screen->id ) {
			// Run cleanup of expired filters.
			$this->cleanup_expired_figure_filters();

			// Get current filter values from URL or stored metadata.
			$current_instance = isset( $_GET['figure_instance'] ) ? absint( $_GET['figure_instance'] ) : $this->get_figure_filter_value( 'figure_instance' );
			$current_scene = isset( $_GET['figure_scene'] ) ? absint( $_GET['figure_scene'] ) : $this->get_figure_filter_value( 'figure_scene' );
			$current_icon = isset( $_GET['figure_icon'] ) ? absint( $_GET['figure_icon'] ) : $this->get_figure_filter_value( 'figure_icon' );

			// Instances dropdown.
			$function_utilities = new Graphic_Data_Utility();
			$function_utilities->create_instance_dropdown_filter( 'figure_instance' );

			global $wpdb;
			// Scene dropdown.
			echo '<select name="figure_scene" id="figure_scene">';
			echo '<option value="">All Scenes</option>';

			// If we have an instance selected (either from URL or stored value).
			if ( $current_instance ) {
				$scenes = $wpdb->get_results(
					$wpdb->prepare(
						"
                    SELECT p.ID, p.post_title 
                    FROM $wpdb->posts p
                    INNER JOIN $wpdb->postmeta pm ON p.ID = pm.post_id
                    WHERE p.post_type = 'scene' 
                    AND p.post_status = 'publish'
                    AND pm.meta_key = 'scene_location' 
                    AND pm.meta_value = %d",
						$current_instance
					)
				);

				foreach ( $scenes as $scene ) {
					$selected = $current_scene == $scene->ID ? 'selected="selected"' : '';
					echo '<option value="' . esc_attr( $scene->ID ) . '" ' . esc_attr( $selected ) . '>' . esc_html( $scene->post_title ) . '</option>';
				}
			}
			echo '</select>';

			// Icon dropdown.
			echo '<select name="figure_icon" id="figure_icon">';
			echo '<option value="">All Icons</option>';

			// If we have a scene selected (either from URL or stored value).
			if ( $current_scene ) {
				$icons = $wpdb->get_results(
					$wpdb->prepare(
						"
                    SELECT p.ID, p.post_title 
                    FROM $wpdb->posts p
                    INNER JOIN $wpdb->postmeta pm1 ON p.ID = pm1.post_id
                    INNER JOIN $wpdb->postmeta pm2 ON p.ID = pm2.post_id
                    WHERE p.post_type = 'modal'  
                    AND p.post_status = 'publish' 
                    AND pm1.meta_key = 'modal_scene' AND pm1.meta_value = %d
                    AND pm2.meta_key = 'icon_function' AND pm2.meta_value = 'Modal'",
						$current_scene
					)
				);

				foreach ( $icons as $icon ) {
					$selected = $current_icon == $icon->ID ? 'selected="selected"' : '';
					echo '<option value="' . esc_attr( $icon->ID ) . '" ' . esc_attr( $selected ) . '>' . esc_html( $icon->post_title ) . '</option>';
				}
			}
			echo '</select>';

			// Store the filter values after displaying the dropdowns.
			$this->store_figure_filter_values();
		}
	}

	/**
	 * Filter the Figure admin screen results based on selected or stored filter values.
	 *
	 * This function modifies the WordPress query to filter Figure posts based on the
	 * selected instance, scene, or icon values. It first checks for values in the URL parameters,
	 * then falls back to stored user metadata values that haven't expired. This ensures
	 * filter persistence for 20 minutes across page loads. The filtering logic follows a
	 * hierarchical approach where icon takes precedence over scene, which takes precedence
	 * over instance.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @param    WP_Query $query  The WordPress Query instance being filtered.
	 * @return   void
	 */
	public function figure_location_filter_results( $query ) {
		global $pagenow;
		$type = 'figure';

		if ( 'edit.php' == $pagenow && isset( $_GET['post_type'] ) && $_GET['post_type'] == $type ) {
			// Get current filter values from URL or stored metadata.
			$instance = isset( $_GET['figure_instance'] ) ? absint( $_GET['figure_instance'] ) : $this->get_figure_filter_value( 'figure_instance' );
			$scene = isset( $_GET['figure_scene'] ) ? absint( $_GET['figure_scene'] ) : $this->get_figure_filter_value( 'figure_scene' );
			$icon = isset( $_GET['figure_icon'] ) ? absint( $_GET['figure_icon'] ) : $this->get_figure_filter_value( 'figure_icon' );

			if ( $instance ) {
				if ( $icon ) {
					$meta_query = array(
						array(
							'key' => 'figure_modal', // The custom field storing the icon ID.
							'value' => $icon,
							'compare' => '=',
						),
					);
				} elseif ( $scene ) {
					$meta_query = array(
						array(
							'key' => 'figure_scene', // The custom field storing the scene ID.
							'value' => $scene,
							'compare' => '=',
						),
					);
				} else {
					$meta_query = array(
						array(
							'key' => 'location', // The custom field storing the instance ID.
							'value' => $instance,
							'compare' => '=',
						),
					);
				}
				$query->set( 'meta_query', $meta_query );
			}
		}
	}

	/**
	 * Create Figure custom content type.
	 *
	 * @since    1.0.0
	 */
	public function custom_content_type_figure() {
		$labels = array(
			'name'                  => 'Figures',
			'singular_name'         => 'Figure',
			'menu_name'             => 'Figures',
			'name_admin_bar'        => 'Figure',
			'add_new'               => 'Add New Figure',
			'add_new_item'          => 'Add New Figure',
			'new_item'              => 'New Figure',
			'edit_item'             => 'Edit Figure',
			'view_item'             => 'View Figure',
			'all_items'             => 'All Figures',
			'search_items'          => 'Search Figures',
			'parent_item_colon'     => 'Parent Figures:',
			'not_found'             => 'No Figures found.',
			'not_found_in_trash'    => 'No Figures found in Trash.',
			'featured_image'        => 'Figure Cover Image',
			'set_featured_image'    => 'Set cover image',
			'remove_featured_image' => 'Remove cover image',
			'use_featured_image'    => 'Use as cover image',
			'archives'              => 'Figure archives',
			'insert_into_item'      => 'Insert into Figure',
			'uploaded_to_this_item' => 'Uploaded to this Figure',
			'filter_items_list'     => 'Filter Figures list',
			'items_list_navigation' => 'Figures list navigation',
			'items_list'            => 'Figures list',
		);

		$args = array(
			'labels'             => $labels,
			'public'             => true,
			'publicly_queryable' => true,
			'show_ui'            => true,
			'show_in_menu'       => true,
			'show_in_rest'       => true,
			'query_var'          => true,
			'rewrite'            => array( 'slug' => 'figures' ),
			'capability_type'    => 'post',
			'menu_icon'          => 'dashicons-admin-comments',
			'has_archive'        => true,
			'hierarchical'       => false,
			'menu_position'      => 40,
			'supports'           => array( 'title' ), // array( 'title', 'revisions' ),.
		);

		register_post_type( 'figure', $args );
	}


	/**
	 * Create custom fields, using metaboxes, for Figure custom content type.
	 *
	 * @param bool $return_fields_only If true, only return the custom fields array without registering the metabox (used as part of field validation).
	 * @since    1.0.0
	 */
	public function create_figure_fields( $return_fields_only = false ) {

		$config_metabox = array(

			/*
			* METABOX
			*/
			'type'              => 'metabox',                       // Required, menu or metabox.
			'id'                => 'graphic_data_plugin',              // Required, meta box id, unique, for saving meta: id[field-id].
			'post_types'        => array( 'figure' ),                 // Post types to display meta box.
			'context'           => 'advanced',                      // The context within the screen where the boxes should display: 'normal', 'side', and 'advanced'.
			'priority'          => 'default',                       // The priority within the context where the boxes should show ('high', 'low').
			'title'             => 'Figure Fields',                  // The title of the metabox.
			'capability'        => 'edit_posts',                    // The capability needed to view the page.
			'tabbed'            => true,
			'options'           => 'simple',                        // Only for metabox, options is stored az induvidual meta key, value pair.
		);

		// get list of locations.
		$function_utilities = new Graphic_Data_Utility();
		$locations = $function_utilities->return_all_instances();

		$transient_fields_exist = false;

		// Get current user ID.
		$user_id = get_current_user_id();

		// Check if transient exists for this user.
		$transient_name = "figure_error_all_fields_user_{$user_id}";
		$transient_fields = get_transient( $transient_name );

		if ( false !== $transient_fields ) {
			$transient_fields_exist = true;
		}

		$scene_titles = [];
		$modal_icons = [];
		$modal_tabs = [];

		// used by both scene and icon dropdowns.
		if ( array_key_exists( 'post', $_GET ) ) {
			$figure_id = intval( $_GET['post'] );
			$location = get_post_meta( $figure_id, 'location', true );
			if ( $transient_fields_exist ) {
				$scene_titles = $function_utilities->returnScenesFigure( $transient_fields['location'] );
			} else {
				$scene_titles = $function_utilities->returnScenesFigure( $location );
			}

			$scene_id = get_post_meta( $figure_id, 'figure_scene', true );
			if ( $transient_fields_exist ) {
				$modal_icons = $function_utilities->returnFigureIcons( $transient_fields['figure_scene'] );
			} else {
				$modal_icons = $function_utilities->returnFigureIcons( $scene_id );
			}

			$modal_id = get_post_meta( $figure_id, 'figure_modal', true );

			if ( $transient_fields_exist ) {
				$modal_tabs = $function_utilities->returnModalTabs( $transient_fields['figure_modal'] );
			} else {
				$modal_tabs = $function_utilities->returnModalTabs( $modal_id );
			}
		}

		$fields[] = array(
			'name'   => 'basic',
			'title'  => 'Basic',
			'icon'   => 'dashicons-admin-generic',
			'fields' => array(
				array(
					'id'             => 'figure_published',
					'type'           => 'select',
					'title'          => 'Status*',
					'options'        => array(
						'draft' => 'Draft',
						'published' => 'Published',
					),
					'default'        => 'draft',
					'description' => 'Should the figure be live? If set to Published, the figure will be visible.',
					'sanitize'      => 'sanitize_text_field',
				),
				array(
					'id'             => 'location',
					'type'           => 'select',
					'title'          => 'Instance*',
					'options'        => $locations,
					'description' => 'What instance is this figure part of?',
					'sanitize'    => [ $function_utilities, 'sanitize_number_or_quotes_field' ],
				),
				array(
					'id'             => 'figure_scene',
					'type'           => 'select',
					'title'          => 'Scene*',
					'options'        => $scene_titles,
					'description' => 'What scene is this figure part of?',
					'sanitize'    => [ $function_utilities, 'sanitize_number_or_quotes_field' ],
				),
				array(
					'id'             => 'figure_modal',
					'type'           => 'select',
					'title'          => 'Icon*',
					'options'        => $modal_icons,
					'description' => 'What modal is this figure part of?',
					'sanitize'    => [ $function_utilities, 'sanitize_number_or_quotes_field' ],
				),
				array(
					'id'             => 'figure_tab',
					'type'           => 'select',
					'title'          => 'Tab*',
					'options'        => $modal_tabs,
					'description' => 'What tab in the modal is this figure part of?',
					'sanitize'    => [ $function_utilities, 'sanitize_number_or_quotes_field' ],
				),
				array(
					'id'      => 'figure_order',
					'type'    => 'number',
					'title'   => 'Order',
					'description' => 'If there are multiple figures in this modal tab, in what order should this figure appear?',
					'default' => '1',
					'min'     => '1',
					'max'     => '5',
					'step'    => '1',
					'sanitize'    => 'absint',
				),
				array(
					'type' => 'fieldset',
					'id' => 'figure_science_info',
					'title'   => 'Monitoring program link',
					'description' => 'What should the monitoring program icon link to, if anything?',
					'fields' => array(
						array(
							'id'          => 'figure_science_link_text',
							'type'        => 'text',
							'title'       => 'Text',
							'class'       => 'text-class',
							'sanitize'      => 'sanitize_text_field',
						),
						array(
							'id'          => 'figure_science_link_url',
							'type'        => 'text',
							'title'       => 'URL',
							'class'       => 'text-class',
							'sanitize'      => 'sanitize_url',
						),
					),
				),
				array(
					'type' => 'fieldset',
					'id' => 'figure_data_info',
					'title'   => 'Data link',
					'description' => 'What should the data icon link to, if anything?',
					'fields' => array(
						array(
							'id'          => 'figure_data_link_text',
							'type'        => 'text',
							'title'       => 'Text',
							'class'       => 'text-class',
							'sanitize'      => 'sanitize_text_field',
						),
						array(
							'id'          => 'figure_data_link_url',
							'type'        => 'text',
							'title'       => 'URL',
							'class'       => 'text-class',
							'sanitize'      => 'sanitize_url',
						),
					),
				),
				array(
					'id'             => 'figure_path',
					'type'           => 'select',
					'title'          => 'Figure type*',
					'options'        => array(
						'Internal' => 'Internal image',
						'External' => 'External image',
						'Interactive' => 'Interactive',
						'Code' => 'Code',
					),
					'default'        => 'Internal',
					'description' => 'Is the figure type an image stored within this website, or at some external location, is it piece a code, or does it need to be an interactive figure generated from data?',
					'sanitize'      => 'sanitize_text_field',
				),
				array(
					'id'          => 'figure_title',
					'type'        => 'text',
					'title'       => 'Figure Title',
					'description' => 'Should the figure have a title in the modal window? If this field is left blank than no title will be shown.',
					'sanitize'      => 'sanitize_text_field',
				),
				array(
					'id'    => 'figure_image',
					'type'  => 'image',
					'title' => 'Figure image*',
					'description' => 'What is the figure image?',
					'sanitize'      => 'sanitize_url',
				),
				array(
					'id'          => 'figure_external_url',
					'type'        => 'text',
					'title'       => 'External URL*',
					'class'       => 'text-class',
					'description' => 'This external URL should link just to the image itself (that is the URL should end in .png .jpeg .jpg or .tiff)',
					'sanitize'      => 'sanitize_url',
				),
				array(
					'id'          => 'figure_external_alt',
					'type'        => 'text',
					'title'       => 'Alt text for external image*',
					'class'       => 'text-class',
					'description' => 'What is the "alternative text" that should be associated with this image for accessibility?',
					'sanitize'      => 'sanitize_text_field',
				),
				// New HTML/JS Code Editor Field.
				array(
					'id'          => 'figure_code',
					'type'        => 'ace_editor',
					'title'       => 'HTML/JavaScript Code',
					'class'       => 'text-class',
					'description' => 'Insert your custom HTML or JavaScript code here.',
					'options' => array(
						'theme'                     => 'ace/theme/chrome',
						'mode'                      => 'ace/mode/javascript',
						'showGutter'                => true,
						'showPrintMargin'           => false,
						'enableBasicAutocompletion' => true,
						'enableSnippets'            => true,
						'enableLiveAutocompletion'  => true,
					),
					'attributes'    => array(
						'style'        => 'height: 150px; max-width: 100%;',
					),
				),
				// FILE UPLOAD ARRAY BOX
				// This is a custom programmed upload box, the call for this field uses the Exopite_Simple_Options_Framework_Field_upload class.
				// The functionality inside upload.php has been drastically reprogrammed to the current upload file functionality.
				// See the functions below: custom_file_upload_handler, custom_file_delete_handler.
				// It also ties into the action at the top of this script: add_action('wp_ajax_custom_file_upload'), add_action('wp_ajax_custom_file_delete').
				array(
					'id'      => 'figure_upload_file',
					'type'    => 'upload',
					'title'   => 'Upload Interactive Figure File',
					'options' => array(
						'maxsize'                   => 10485760, // Keeping for future development.
					),
				),
				array(
					'id'          => 'figure_interactive_arguments',
					'type'        => 'textarea',
					'title'       => 'Figure: interactive arguments',
				),
				array(
					'id'          => 'figure_interactive_settings',
					'type'        => 'button',
					'title'       => 'Interactive Figure Settings',
					'class'        => 'figure_interactive_settings',
					'options'     => array(
						'href'  => '#nowhere',
						'target' => '_self',
						'value' => 'Run',
						'btn-class' => 'exopite-sof-btn',
					),
				),
				array(
					'id'     => 'figure_caption_short',
					'type'   => 'editor',
					'editor' => 'tinymce',
					'title'  => 'Short figure caption',
					'description' => 'What is the short version of the figure caption?',
					'sanitize'      => 'wp_kses_post',
				),
				array(
					'id'     => 'figure_caption_long',
					'type'   => 'editor',
					'editor' => 'tinymce',
					'title'  => 'Extended caption',
					'description' => 'This caption appears in the "Click for Details" section under the short caption. If nothing is provided in this field, then the "Click for Details" section will be be blank for this figure.',
					'sanitize'      => 'wp_kses_post',
				),
				// Preview button for displaying the internal or external images at the bottom of form.
				array(
					'id'          => 'figure_preview',
					'type'        => 'button',
					'title'       => 'Preview Figure',
					'class'        => 'figure_preview',
					'options'     => array(
						'href'  => '#nowhere',
						'target' => '_self',
						'value' => 'Preview',
						'btn-class' => 'exopite-sof-btn',
					),
				),
			),
		);

		// If we're just running this function to get the custom field list for field validation, return early.
		if ( $return_fields_only ) {
			return $fields;
		}

		// instantiate the admin page.
		$options_panel = new Exopite_Simple_Options_Framework( $config_metabox, $fields );

		// make several of the modal custom fields available to the REST API.
		$fields_to_be_registered = array(
			array( 'figure_published', 'string', 'The figure published status' ),
			array( 'figure_modal', 'string', 'The figure modal' ),
			array( 'figure_tab', 'string', 'The figure tab' ),
			array( 'figure_order', 'integer', 'The figure order' ),
			array( 'figure_path', 'string', 'The figure path' ),
			array( 'figure_image', 'string', 'The figure image url, internal' ),
			array( 'figure_external_url', 'string', 'The figure external url' ),
			array( 'figure_external_alt', 'string', 'The alt text for external figure' ),
			array( 'figure_code', 'string', 'HTML or JS code' ),
			array( 'figure_upload_file', 'string', 'Upload the .csv or .json file for an interactive figure' ),
			array( 'figure_caption_short', 'string', 'The short figure caption' ),
			array( 'figure_caption_long', 'string', 'The long figure caption' ),
			array( 'figure_interactive_arguments', 'string', 'Arguments used in interactive figures' ),
			array( 'figure_title', 'string', 'The title of the figure, for any figure type.' ),
		);
		// Register fields in REST API.
		foreach ( $fields_to_be_registered as $target_fields_to_be_registered ) {
			register_meta(
				'post', // Object type. In this case, 'post' refers to custom post type 'Figure'.
				$target_fields_to_be_registered[0], // Meta key name.
				array(
					'show_in_rest' => true, // Make the field available in REST API.
					'single' => true, // Indicates whether the meta key has one single value.
					'type' => $target_fields_to_be_registered[1], // Data type of the meta value.
					'description' => $target_fields_to_be_registered[2], // Description of the meta key.
					'auth_callback' => '__return_false', // Return false to disallow writing.
				)
			);
		}

		$fields_to_be_registered2 = array(
			array( 'figure_science_info', 'URL for figure info' ),
			array( 'figure_data_info', 'URL for figure data' ),
		);

		foreach ( $fields_to_be_registered2 as $target_fields_to_be_registered2 ) {
			register_meta(
				'post',
				$target_fields_to_be_registered2[0], // Meta key name.
				array(
					'auth_callback'     => '__return_false',
					'single'            => true, // The field contains a single array.
					'description' => $target_fields_to_be_registered2[1], // Description of the meta key.
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
	 * Register Figure custom fields for use by REST API.
	 *
	 * @since    1.0.0
	 */
	public function register_figure_rest_fields() {
		$figure_rest_fields = array( 'figure_published', 'figure_modal', 'figure_tab', 'figure_order', 'figure_science_info', 'figure_data_info', 'figure_path', 'figure_image', 'figure_external_url', 'figure_external_alt', 'figure_code', 'figure_upload_file', 'figure_caption_short', 'figure_caption_long', 'figure_interactive_arguments', 'uploaded_path_json', 'figure_title' ); // figure_temp_filepath.
		$function_utilities = new Graphic_Data_Utility();
		$function_utilities->register_custom_rest_fields( 'figure', $figure_rest_fields );
	}

	/**
	 * Filter REST API query arguments to support filtering figure custom posts by meta fields.
	 *
	 * Appends meta_query clauses to the WP_Query arguments when the REST request
	 * includes 'figure_modal', 'figure_published', or 'id' parameters. Intended
	 * to be hooked into the 'rest_figure_query' filter.
	 *
	 * @since 1.0.0
	 *
	 * @param array           $args    The WP_Query arguments for the REST API request.
	 * @param WP_REST_Request $request The current REST API request object.
	 * @return array Modified query arguments with additional meta_query clauses.
	 */
	public function filter_figure_by_figure_modal( $args, $request ) {
		if ( isset( $request['figure_modal'] ) ) {
			$args['meta_query'][] = [
				[
					'key'   => 'figure_modal',
					'value' => (int) $request['figure_modal'],
					'compare' => '=',
				],
			];
		}

		if ( isset( $request['figure_published'] ) ) {
			$args['meta_query'][] = [
				[
					'key'   => 'figure_published',
					'value' => $request['figure_published'],
					'compare' => '=',
				],
			];
		}

		if ( isset( $request['id'] ) ) {
			$args['meta_query'][] = [
				[
					'key'   => 'id',
					'value' => (int) $request['id'],
					'compare' => '=',
				],
			];
		}
		return $args;
	}

	/**
	 * Handles the custom file upload process for the Graphic Data plugin.
	 * Validates the uploaded file, ensures it is of an allowed type, and stores it in the appropriate directory.
	 * Updates the post metadata with the file path upon successful upload.
	 *
	 * @return void Outputs a JSON response indicating success or failure.
	 */
	public static function custom_file_upload_handler() {
		ob_clean(); // Ensure no unwanted output.

		// First, verify nonce.
		if ( ! isset( $_POST['figure_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['figure_nonce'] ) ), 'save_figure_fields' ) ) {
			wp_die( 'Security check failed for post of Figure custom post type.' );
		}

		// Error if no post ID.
		if ( ! isset( $_POST['post_id'] ) || empty( $_POST['post_id'] ) ) {
			wp_send_json_error( [ 'message' => 'Missing post ID.' ], 400 );
		}
		$post_id = intval( $_POST['post_id'] );

		// From file, get the ['name'] and the ['tmp_name'].
		if ( isset( $_FILES['uploaded_file'] ) ) {
			// Sanitize and validate the uploaded file data.
			$file_name = isset( $_FILES['uploaded_file']['name'] ) ? sanitize_file_name( wp_unslash( $_FILES['uploaded_file']['name'] ) ) : '';
			$file_tmp_name = isset( $_FILES['uploaded_file']['tmp_name'] ) ? sanitize_text_field( wp_unslash( $_FILES['uploaded_file']['tmp_name'] ) ) : '';

			// Validate that we have both required values.
			if ( empty( $file_name ) || empty( $file_tmp_name ) ) {
				wp_send_json_error( array( 'message' => 'Invalid file upload data.' ), 400 );
			}
		} else {
			wp_send_json_error( array( 'message' => 'No file uploaded.' ), 400 );
		}

		// Get the file extension and check it to make sure it is of the type that are allowed.
		$file_ext = pathinfo( $file_name, PATHINFO_EXTENSION );
		$allowed_types = [ 'json', 'csv', 'geojson' ];
		if ( ! in_array( $file_ext, $allowed_types ) ) {
			wp_send_json_error( [ 'message' => 'Invalid file type.' ], 400 );
		}

		// Retrieve existing file paths from post metadata.
		$csv_path = get_post_meta( $post_id, 'uploaded_path_csv', true );
		$json_path = get_post_meta( $post_id, 'uploaded_path_json', true );
		$geojson_path = get_post_meta( $post_id, 'uploaded_path_geojson', true );

		// Define the directory where the file is to be uploaded.
		$upload_dir = ABSPATH . 'wp-content/data/figure_' . $post_id . '/';

		// Create the folders in which the file will be stored if they don't exist.
		if ( ! file_exists( $upload_dir ) ) {
			mkdir( $upload_dir, 0775, true );
		}

		// Move the file to the upload folder and update the database fields.
		$destination = $upload_dir . basename( $file_name );
		$destination_json = $upload_dir . basename( preg_replace( '/\.csv$/', '.json', $file_name ) );

		// Move the uploaded file to the destination directory.
		if ( move_uploaded_file( $file_tmp_name, $destination ) ) {
			// Store file path in post metadata.
			if ( pathinfo( $file_name, PATHINFO_EXTENSION ) === 'csv' ) {
				update_post_meta( $post_id, 'uploaded_path_csv', $destination );
				update_post_meta( $post_id, 'uploaded_file', $file_name );
			}

			if ( pathinfo( $file_name, PATHINFO_EXTENSION ) === 'json' && '' == $csv_path ) {
				update_post_meta( $post_id, 'uploaded_path_json', $destination );
				update_post_meta( $post_id, 'uploaded_file', $file_name );
			}

			if ( pathinfo( $file_name, PATHINFO_EXTENSION ) === 'json' && '' != $csv_path ) {
				update_post_meta( $post_id, 'uploaded_path_json', $destination );
			}

			if ( pathinfo( $file_name, PATHINFO_EXTENSION ) === 'geojson' ) {
				update_post_meta( $post_id, 'uploaded_path_geojson', $destination );
				update_post_meta( $post_id, 'uploaded_path_json', $destination );
				update_post_meta( $post_id, 'uploaded_file', $file_name );
			}
			// Send a success response with the file path.
			wp_send_json_success(
				[
					'message' => 'File uploaded successfully.',
					'path' => $destination,
				]
			);

		} else {
			// Send an error response if the file upload fails.
			wp_send_json_error( [ 'message' => 'File upload failed.' ], 500 );
		}
	}


	/**
	 * Handles the custom file deletion process for the Graphic Data plugin.
	 * Validates the provided post ID and file name, deletes the specified file, and updates the post metadata.
	 *
	 * @return void Outputs a JSON response indicating success or failure.
	 */
	public static function custom_file_delete_handler() {
		ob_clean(); // Ensure no unwanted output.

		// First, verify nonce.
		if ( ! isset( $_POST['figure_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['figure_nonce'] ) ), 'save_figure_fields' ) ) {
			wp_die( 'Security check failed for post of Figure custom post type.' );
		}

		// Get the post's ID.
		if ( ! isset( $_POST['post_id'] ) || empty( $_POST['post_id'] ) ) {
			wp_send_json_error( [ 'message' => 'Missing post ID.' ], 400 );
		}

		// Get the file to be deleted's name.
		if ( ! isset( $_POST['file_name'] ) || empty( $_POST['file_name'] ) ) {
			wp_send_json_error( [ 'message' => 'Missing file name.' ], 400 );
		}

		// Variable-ize the post's ID & the file's name..
		$post_id = intval( $_POST['post_id'] );
		$file_name = basename( urldecode( sanitize_text_field( wp_unslash( $_POST['file_name'] ) ) ) );

		// Define the directory where the file is to be deleted.
		$delete_dir = ABSPATH . 'wp-content/data/figure_' . $post_id . '/';
		$file_path = $delete_dir . $file_name;
		$file_path_json = $delete_dir . basename( preg_replace( '/\.csv$/', '.json', $file_name ) );

		// Check if file exists.
		if ( ! file_exists( $file_path ) ) {
			update_post_meta( $post_id, 'uploaded_path_geojson', '' );
			update_post_meta( $post_id, 'uploaded_path_json', '' );
			update_post_meta( $post_id, 'uploaded_file', '' );
			wp_send_json_error( [ 'message' => 'File does not exist.' ], 404 );
		}

		// Delete the converted json file if it was originally a csv. file.
		if ( pathinfo( $file_name, PATHINFO_EXTENSION ) === 'csv' ) {
			update_post_meta( $post_id, 'uploaded_path_csv', '' );
			update_post_meta( $post_id, 'uploaded_path_json', '' );
			update_post_meta( $post_id, 'uploaded_file', '' );
		}

		// Delete the converted json file if it was originally a csv. file.
		if ( pathinfo( $file_name, PATHINFO_EXTENSION ) === 'geojson' ) {
			unlink( $file_path_json );
			update_post_meta( $post_id, 'uploaded_path_geojson', '' );
			update_post_meta( $post_id, 'uploaded_path_json', '' );
			update_post_meta( $post_id, 'uploaded_file', '' );
		}

		// Delete the uploaded file.
		if ( unlink( $file_path ) ) {
			// Update the metadata instead of deleting it.
			update_post_meta( $post_id, 'uploaded_path_csv', '' );
			update_post_meta( $post_id, 'uploaded_path_json', '' );
			update_post_meta( $post_id, 'uploaded_file', '' );
			update_post_meta( $post_id, 'plotFields', '' );

			wp_send_json_success(
				[
					'message' => 'File deleted successfully.',
					'path' => $file_path,
				]
			);
		} else {
			wp_send_json_error( [ 'message' => 'Failed to delete the file.' ], 500 );
		}
	}


	/**
	 * Registers a custom REST API route to get alt text by image URL.
	 *
	 * @since 1.0.1
	 */
	public function register_get_alt_text_by_url_route() {
		register_rest_route(
			'graphic_data/v1', // Your plugin's namespace.
			'/media/alt-text-by-url', // The route.
			array(
				'methods'             => WP_REST_Server::READABLE, // This will be a GET request.
				'callback'            => array( $this, 'get_alt_text_by_url_callback' ),
				'args'                => array(
					'image_url' => array(
						'required'    => true,
						'type'        => 'string',
						'description' => 'The URL of the image in the WordPress media library.',
						'validate_callback' => function ( $param, $request, $key ) {
							// Basic URL validation.
							return filter_var( $param, FILTER_VALIDATE_URL ) !== false;
						},
					),
				),
				'permission_callback' => '__return_true',
			)
		);
	}

	/**
	 * Callback function for the /media/alt-text-by-url REST route.
	 * Retrieves the alt text for an image given its URL.
	 *
	 * @since 1.0.1
	 * @param WP_REST_Request $request The REST API request object.
	 * @return WP_REST_Response The REST API response.
	 */
	public function get_alt_text_by_url_callback( WP_REST_Request $request ) {
		$image_url = $request->get_param( 'image_url' );

		// Sanitize the URL.
		$sanitized_image_url = esc_url_raw( $image_url );

		if ( empty( $sanitized_image_url ) ) {
			return new WP_REST_Response( array( 'error' => 'Invalid image URL provided.' ), 400 );
		}

		// Get the attachment ID from the URL.
		$attachment_id = attachment_url_to_postid( $sanitized_image_url );

		if ( ! $attachment_id ) {
			// If no attachment ID is found, return a 404 with an empty alt_text.
			return new WP_REST_Response(
				array(
					'message' => 'Attachment ID not found for the given URL. The URL might be for a non-library image or a resized version not directly mapped.',
					'alt_text' => '',
					'attachment_id' => 0,
				),
				404
			);
		}

		// Get the alt text (stored in post meta).
		$alt_text = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );

		// Default to an empty string if alt text is not set or explicitly empty.
		if ( false === $alt_text || null === $alt_text ) {
			$alt_text = '';
		}

		return new WP_REST_Response(
			array(
				'alt_text' => $alt_text,
				'attachment_id' => $attachment_id,
			),
			200
		);
	}
}
