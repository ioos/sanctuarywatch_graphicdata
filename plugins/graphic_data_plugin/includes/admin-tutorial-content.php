<?php
/**
 * Register class that defines the tutorial content
 *
 * @package Graphic_Data_Plugin
 */

/**
 * Class Graphic_Data_Tutorial_Content
 *
 * Defines methods that creates or deletes tutorial content.
 *
 * @since 1.0.0
 */
class Graphic_Data_Tutorial_Content {

	/**
	 * Synchronize tutorial content based on plugin settings.
	 *
	 * Checks the 'tutorial_content' setting and takes action accordingly:
	 * - If set to 0 and tutorial content hasn't been deleted, deletes all tutorial instance types.
	 * - If set to 1 and tutorial content doesn't exist, creates tutorial instance types.
	 *
	 * Updates the 'tutorial_content_present' flag to track the current state.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function check_tutorial_content_status() {
		$options = get_option( 'graphic_data_settings' );
		$tutorial_content = isset( $options['tutorial_content'] ) ? $options['tutorial_content'] : 0;
		switch ( $tutorial_content ) {
			// no tutorial content wanted. If it hasn't been done already, delete all existing tutorial content.
			case 0:
				if ( ( ! isset( $options['tutorial_content_present'] ) ) || 0 == $options['tutorial_content_present'] ) {
					$this->delete_tutorial_instance_types();
					$options['tutorial_content'] = 0;
					update_option( 'graphic_data_settings', $options );
					$this->delete_tutorial_images();
					$this->delete_tutorial_posts();
					$this->delete_graphic_data_settings_content();
				}
				break;
			// Tutorial content wanted. If it hasn't been done already, create tutorial content.
			case 1:
				if ( ( ! isset( $options['tutorial_content_present'] ) ) || 0 == $options['tutorial_content_present'] ) {
					$this->create_tutorial_instance_types();
					$options['tutorial_content_present'] = 1;
					update_option( 'graphic_data_settings', $options );
					$this->create_tutorial_instances();
					$this->create_graphic_data_settings_content();
				}
				break;
		}
	}

	/**
	 * Create example instance type taxonomy terms for the tutorial.
	 *
	 * Creates two sample instance type terms with predefined names, slugs,
	 * and descriptions. Sets appropriate term meta including display order
	 * and navbar names.
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 * @return void
	 */
	public function create_tutorial_instance_types() {
		global $wpdb;

		$term_name = [ 'Instance Type Example 1', 'Instance Type Example 2' ];
		$term_slug = [ 'tutorial-instance-example-1', 'tutorial-instance-example-2' ];
		$term_description = [
			'This is an example instance type. ' .
			'You must have at least one instance type and each instance type contains one or more instances.',
			'This is a second example instance type.',
		];
		$instance_navbar_name = [ 'Example 1', 'Example 2' ];
		// Find current max value of instance order in the database (which really should be called instance type order).
		$max_instance_order = $wpdb->get_var(
			"SELECT MAX(CAST(meta_value AS UNSIGNED)) 
			FROM {$wpdb->termmeta} 
			WHERE meta_key = 'instance_order'"
		);
		$processed_max_order = null !== $max_instance_order ? (int) $max_instance_order : 0;

		for ( $i = 0; $i < 2; $i++ ) {
			$args = array(
				'slug' => $term_slug[ $i ],
				'description' => $term_description[ $i ],
			);

			$term = wp_insert_term( $term_name[ $i ], 'instance_type', $args );
			if ( ! is_wp_error( $term ) ) {
				update_term_meta( $term['term_id'], 'instance_order', $processed_max_order + $i + 1 );
				update_term_meta( $term['term_id'], 'instance_navbar_name', $instance_navbar_name [ $i ] );
				update_term_meta( $term['term_id'], 'tutorial_instance_type_id', $i + 1 );
			}
		}
	}

	/**
	 * Deletes all tutorial instance type terms from the database.
	 *
	 * Finds all taxonomy terms that have the 'tutorial_instance_type_id' meta key
	 * and removes them along with their associated metadata. Uses wp_delete_term()
	 * which handles cleanup of wp_terms, wp_term_taxonomy, and wp_termmeta tables.
	 *
	 * @since 1.0.0
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 *
	 * @return void
	 */
	public function delete_tutorial_instance_types() {
		global $wpdb;

		// Step 1: Get all term IDs associated with the tutorial (they'll have a value for tutorial_instance_type_id).
		$term_ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT term_id 
				FROM {$wpdb->termmeta} 
				WHERE meta_key = %s",
				'tutorial_instance_type_id'
			)
		);

		// Step 2: Delete each term (this also deletes associated metadata).
		if ( ! empty( $term_ids ) ) {
			foreach ( $term_ids as $term_id ) {
				// wp_delete_term() handles wp_terms, wp_term_taxonomy, and wp_termmeta.
				// But we need the taxonomy, so we need to find it first.
				$term = get_term( $term_id );

				if ( $term && ! is_wp_error( $term ) ) {
					wp_delete_term( $term_id, $term->taxonomy );
				}
			}
		}
	}

	/**
	 * Deletes all tutorial images from the media library.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function delete_tutorial_images() {

		// Get all attachments with the image_tutorial_id meta key.
		$attachments = get_posts(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'meta_query'     => array(
					array(
						'key'     => 'image_tutorial_id',
						'compare' => 'EXISTS',
					),
				),
			)
		);

		// Delete each attachment.
		foreach ( $attachments as $attachment ) {
			wp_delete_attachment( $attachment->ID, true );
		}
	}

	/**
	 * Deletes all tutorial posts.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function delete_tutorial_posts() {

		// Get all posts with the tutorial_id meta key.
		$posts_to_be_deleted = get_posts(
			array(
				'post_type'      => array( 'instance', 'scene', 'modal', 'figure' ),
				'post_status'    => 'any',
				'posts_per_page' => -1,
				'meta_query'     => array(
					array(
						'key'     => 'tutorial_id',
						'compare' => 'EXISTS',
					),
				),
			)
		);

		// Delete each post.
		foreach ( $posts_to_be_deleted as $deleted_post ) {
			wp_delete_post( $deleted_post->ID, true );
		}
	}

	/**
	 * Create Front Page Intro and Sitewide Footer content for the tutorial.
	 *
	 * These two content types are normally entered via the Settings page for the tutorial.
	 *
	 * @return void
	 */
	public function create_graphic_data_settings_content() {
		$options = get_option( 'graphic_data_settings' );
		$options['intro_text'] = 'Ipsum lorem';
		$options['sitewide_footer_title'] = 'SiteWide Footer Title';
		$options['sitewide_footer'] = 'SiteWide Footer Content';
		update_option( 'graphic_data_settings', $options );
	}

	/**
	 * Delete Front Page Intro and Sitewide Footer content for the tutorial.
	 *
	 * These two content types are normally edited via the Settings page for the tutorial.
	 *
	 * @return void
	 */
	public function delete_graphic_data_settings_content() {
		$options = get_option( 'graphic_data_settings' );
		$options['intro_text'] = '';
		$options['sitewide_footer_title'] = '';
		$options['sitewide_footer'] = '';
		update_option( 'graphic_data_settings', $options );
	}

	/**
	 * Create example instances for the tutorial.
	 *
	 * @return void
	 */
	public function create_tutorial_instances() {
		global $wpdb;
		// get current user ID or default to first user if no user is logged in.
		$current_user_id = get_current_user_id();
		if ( 0 === $current_user_id ) {

			$users = get_users(
				array(
					'number'  => 1,
					'orderby' => 'ID',
					'order'   => 'ASC',
				)
			);

			if ( ! empty( $users ) ) {
				$current_user_id = $users[0]->ID;
			}
		}

		// set up information to be saved as the three tutorial instances.
		$post_title = [ 'Example Instance 1', 'Example Instance 2', 'Example Instance 3' ];
		$instance_short_title = [ 'Example 1', 'Example 2', 'Example 3' ];
		$instance_slug = [ 'example-instance-1', 'example-instance-2', 'example-instance-3' ];
		$instance_type = [ 1, 1, 2 ];
		$tutorial_id = [ 3, 4, 5 ];
		$instance_status = 'Published';
		$instance_tile  = [ 'example_files/tutorial/balloon_instance_tile.jpg', 'example_files/tutorial/bird_instance_tile.jpg', 'example_files/tutorial/bishwa_instance_tile.jpg' ];
		$instance_mobile_tile_background_color = '#f0f0f0';
		$instance_mobile_tile_text_color = '#000000';
		$instance_footer_columns = 3;
		$instance_footer_column1 = array(
			'instance_footer_column_title1' => 'First column',
			'instance_footer_column_content1' => 'You can have between zero and three footer columns that are unique to each instance. Here is an example of the first column.',
		);
		$instance_footer_column2 = array(
			'instance_footer_column_title2' => 'Second column',
			'instance_footer_column_content2' => 'Here is an example of the second column.',
		);
		$instance_footer_column3 = array(
			'instance_footer_column_title3' => 'Third column',
			'instance_footer_column_content3' => 'Here is an example of the third column.',
		);

		// create the three tutorial instances.
		for ( $i = 0; $i < 3; $i++ ) {
			$post_data = array(
				'post_title'   => $post_title[ $i ],
				'post_type'    => 'instance',
				'post_status'  => 'publish',
				'post_author'  => $current_user_id,
			);

			// Insert the post and get its ID.
			$post_id = wp_insert_post( $post_data );

			// Check if post was created successfully.
			if ( ! is_wp_error( $post_id ) ) {
				update_post_meta( $post_id, 'instance_short_title', $instance_short_title[ $i ] );
				update_post_meta( $post_id, 'instance_slug', $instance_slug[ $i ] );

				$tutorial_instance_type_id = $wpdb->get_var(
					$wpdb->prepare(
						"SELECT term_id FROM {$wpdb->termmeta} WHERE meta_key = %s AND meta_value = %s",
						'tutorial_instance_type_id',
						$instance_type[ $i ],
					)
				);
				update_post_meta( $post_id, 'instance_type', $tutorial_instance_type_id );
				update_post_meta( $post_id, 'instance_status', 'Published' );

				$instance_tile_url = $this->copy_image_to_media_library( $instance_tile [ $i ], $tutorial_id [ $i ] );
				update_post_meta( $post_id, 'instance_tile', $instance_tile_url );
				update_post_meta( $post_id, 'instance_legacy_content', 'no' );
				update_post_meta( $post_id, 'instance_mobile_tile_background_color', '#f0f0f0' );
				update_post_meta( $post_id, 'instance_mobile_tile_text_color', '#000000' );
				update_post_meta( $post_id, 'instance_footer_columns', 3 );
				update_post_meta( $post_id, 'instance_footer_column1', $instance_footer_column1 );
				update_post_meta( $post_id, 'instance_footer_column2', $instance_footer_column2 );
				update_post_meta( $post_id, 'instance_footer_column3', $instance_footer_column3 );
				update_post_meta( $post_id, 'tutorial_id', $tutorial_id [ $i ] );
			}
		};
	}

	/**
	 * Create example scenes for the tutorial.
	 *
	 * @return void
	 */
	public function create_tutorial_scenes() {
		global $wpdb;
		// get current user ID or default to first user if no user is logged in.
		$current_user_id = get_current_user_id();
		if ( 0 === $current_user_id ) {

			$users = get_users(
				array(
					'number'  => 1,
					'orderby' => 'ID',
					'order'   => 'ASC',
				)
			);

			if ( ! empty( $users ) ) {
				$current_user_id = $users[0]->ID;
			}
		}

		// set up information to be saved as the three tutorial instances.
		$post_title = [ 'Example Instance 1', 'Example Instance 2', 'Example Instance 3' ];
		$instance_short_title = [ 'Example 1', 'Example 2', 'Example 3' ];
		$instance_slug = [ 'example-instance-1', 'example-instance-2', 'example-instance-3' ];
		$instance_type = [ 1, 1, 2 ];
		$tutorial_id = [ 3, 4, 5 ];
		$instance_status = 'Published';
		$instance_tile  = [ 'example_files/tutorial/balloon_instance_tile.jpg', 'example_files/tutorial/bird_instance_tile.jpg', 'example_files/tutorial/bishwa_instance_tile.jpg' ];
		$instance_mobile_tile_background_color = '#f0f0f0';
		$instance_mobile_tile_text_color = '#000000';
		$instance_footer_columns = 3;
		$instance_footer_column1 = array(
			'instance_footer_column_title1' => 'First column',
			'instance_footer_column_content1' => 'You can have between zero and three footer columns that are unique to each instance. Here is an example of the first column.',
		);
		$instance_footer_column2 = array(
			'instance_footer_column_title2' => 'Second column',
			'instance_footer_column_content2' => 'Here is an example of the second column.',
		);
		$instance_footer_column3 = array(
			'instance_footer_column_title3' => 'Third column',
			'instance_footer_column_content3' => 'Here is an example of the third column.',
		);

		// create the three tutorial instances.
		for ( $i = 0; $i < 3; $i++ ) {
			$post_data = array(
				'post_title'   => $post_title[ $i ],
				'post_type'    => 'instance',
				'post_status'  => 'publish',
				'post_author'  => $current_user_id,
			);

			// Insert the post and get its ID.
			$post_id = wp_insert_post( $post_data );

			// Check if post was created successfully.
			if ( ! is_wp_error( $post_id ) ) {
				update_post_meta( $post_id, 'instance_short_title', $instance_short_title[ $i ] );
				update_post_meta( $post_id, 'instance_slug', $instance_slug[ $i ] );

				$tutorial_instance_type_id = $wpdb->get_var(
					$wpdb->prepare(
						"SELECT term_id FROM {$wpdb->termmeta} WHERE meta_key = %s AND meta_value = %s",
						'tutorial_instance_type_id',
						$instance_type[ $i ],
					)
				);
				update_post_meta( $post_id, 'instance_type', $tutorial_instance_type_id );
				update_post_meta( $post_id, 'instance_status', 'Published' );

				$instance_tile_url = $this->copy_image_to_media_library( $instance_tile [ $i ], $tutorial_id [ $i ] );
				update_post_meta( $post_id, 'instance_tile', $instance_tile_url );
				update_post_meta( $post_id, 'instance_legacy_content', 'no' );
				update_post_meta( $post_id, 'instance_mobile_tile_background_color', '#f0f0f0' );
				update_post_meta( $post_id, 'instance_mobile_tile_text_color', '#000000' );
				update_post_meta( $post_id, 'instance_footer_columns', 3 );
				update_post_meta( $post_id, 'instance_footer_column1', $instance_footer_column1 );
				update_post_meta( $post_id, 'instance_footer_column2', $instance_footer_column2 );
				update_post_meta( $post_id, 'instance_footer_column3', $instance_footer_column3 );
				update_post_meta( $post_id, 'tutorial_id', $tutorial_id [ $i ] );
			}
		};
	}

	/**
	 * Copies an image file from the plugin directory to the WordPress media library.
	 *
	 * This method takes an image file from within the plugin's directory structure,
	 * uploads it to the WordPress media library, generates the necessary attachment
	 * metadata (including image sizes), and associates it with a tutorial ID for
	 * later reference or cleanup.
	 *
	 * @since 1.0.0
	 *
	 * @param string $plugin_relative_path The relative path to the image file from the plugin's includes directory.
	 *                                     Example: '../example_files/tutorial/image.jpg'
	 * @param int    $tutorial_id          The tutorial ID to associate with this media library item.
	 *                                     This is stored in post meta to keep track of tutorial media.
	 *
	 * @return string|false The URL of the uploaded attachment on success, false on failure.
	 *                      Failure can occur if the source file doesn't exist or if
	 *                      the upload process encounters an error.
	 */
	public function copy_image_to_media_library( $plugin_relative_path, $tutorial_id ) {
		$plugin_image_path = GRAPHIC_DATA_PLUGIN_DIR . $plugin_relative_path;

		if ( ! file_exists( $plugin_image_path ) ) {
			return false;
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$filename = basename( $plugin_image_path );
		$upload_file = wp_upload_bits( $filename, null, file_get_contents( $plugin_image_path ) );

		if ( $upload_file['error'] ) {
			return false;
		}

		$attachment_data = array(
			'post_mime_type' => $upload_file['type'],
			'post_title'     => sanitize_file_name( pathinfo( $filename, PATHINFO_FILENAME ) ),
			'post_content'   => '',
			'post_status'    => 'inherit',
		);

		$attachment_id = wp_insert_attachment( $attachment_data, $upload_file['file'] );
		$attachment_metadata = wp_generate_attachment_metadata( $attachment_id, $upload_file['file'] );
		wp_update_attachment_metadata( $attachment_id, $attachment_metadata );

		// Add a flag to the post meta table so that we can find this media library item if we need to delete it later.
		update_post_meta( $attachment_id, 'image_tutorial_id', $tutorial_id );

		// Return the URL associated with the media library item.
		return wp_get_attachment_url( $attachment_id );
	}
}
