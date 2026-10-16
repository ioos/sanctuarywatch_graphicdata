<?php
/**
 * Register class that defines Graphic Data plugin only content
 *
 * @package Graphic_Data_Plugin
 */

/**
 * Class Graphic_Data_Plugin_Only_Content
 *
 * Defines methods that content when the Graphic Data plugin is used without the theme.
 *
 * @since 1.0.0
 */
class Graphic_Data_Plugin_Only_Content {

	/**
	 * Autoloaded option set once all placeholders exist, so the existence checks can be skipped.
	 *
	 * @var string
	 */
	const PLACEHOLDERS_READY_OPTION = 'graphic_data_placeholders_ready';

	/**
	 * Creates a placeholder instance type term if the Graphic Data theme is not active.
	 *
	 * Inserts a new term into the `instance_type` taxonomy with a predefined name, slug,
	 * and description. Sets its `instance_order` to one greater than the current maximum,
	 * assigns a navbar name of "Placeholder", and marks it with the
	 * `graphic_data_instance_type_placeholder_id` meta flag.
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 * @return void
	 */
	public function create_placeholder_instance_type() {
		global $wpdb;

		$term_name = 'Graphic Data Placeholder Instance Type';
		$term_slug = 'graphic-data-placeholder-instance-type';
		$term_description = 'This instance type is a placeholder used in cases where the Graphic Data theme is not activated.';
		$instance_navbar_name = 'Placeholder';
		// Find current max value of instance order in the database (which really should be called instance type order).
		$max_instance_order = $wpdb->get_var(
			"SELECT MAX(CAST(meta_value AS UNSIGNED)) 
			FROM {$wpdb->termmeta} 
			WHERE meta_key = 'instance_order'"
		);
		$processed_max_order = null !== $max_instance_order ? (int) $max_instance_order : 0;

		$args = array(
			'slug' => $term_slug,
			'description' => $term_description,
		);

		$term = wp_insert_term( $term_name, 'instance_type', $args );
		if ( ! is_wp_error( $term ) ) {
			update_term_meta( $term['term_id'], 'instance_order', $processed_max_order + 1 );
			update_term_meta( $term['term_id'], 'instance_navbar_name', $instance_navbar_name );
			update_term_meta( $term['term_id'], 'graphic_data_placeholder_id', 1 );
		}
	}

	/**
	 * Create placeholder instance.
	 *
	 * Links to the other placeholders are set afterwards by link_placeholders().
	 *
	 * @param int $current_user_id The ID of the user to set as post author.
	 * @return void
	 */
	public function create_placeholder_instance( $current_user_id ) {
		// set up information to be saved as the placeholder instance.
		$post_title = 'Placeholder Instance';
		$instance_short_title = 'Placeholder Instance';
		$instance_slug = 'placeholder-instance';
		$instance_status = 'Published';
		$instance_mobile_tile_background_color = '#f0f0f0';
		$instance_mobile_tile_text_color = '#000000';
		$instance_footer_columns = 0;

		// create the instance.
		$post_data = array(
			'post_title'   => $post_title,
			'post_type'    => 'instance',
			'post_status'  => 'publish',
			'post_author'  => $current_user_id,
		);

		// Insert the post and get its ID.
		$post_id = wp_insert_post( $post_data );

		// Check if post was created successfully.
		if ( ! is_wp_error( $post_id ) ) {
			update_post_meta( $post_id, 'instance_short_title', $instance_short_title );
			update_post_meta( $post_id, 'instance_slug', $instance_slug );
			update_post_meta( $post_id, 'instance_status', 'Published' );
			update_post_meta( $post_id, 'instance_legacy_content', 'no' );
			update_post_meta( $post_id, 'instance_mobile_tile_background_color', $instance_mobile_tile_background_color );
			update_post_meta( $post_id, 'instance_mobile_tile_text_color', $instance_mobile_tile_text_color );
			update_post_meta( $post_id, 'instance_footer_columns', 0 );
			update_post_meta( $post_id, 'graphic_data_placeholder_id', 2 );
		}
	}

	/**
	 * Create example scenes for the placeholder.
	 *
	 * Links to the other placeholders are set afterwards by link_placeholders().
	 *
	 * @param int $current_user_id The ID of the user to set as post author.
	 * @return void
	 */
	public function create_placeholder_scene( $current_user_id ) {
		$post_title = 'Placeholder Scene';
		$file_prefix = 'example_files/placeholder/';
		$scene_infographic = $file_prefix . 'placeholder-scene.svg';
		$scene_tagline = 'This is a placeholder scene used for behind the scenes purposes when Graphic Data is not the theme';
		$scene_order = 1;
		$scene_full_screen_button = 'yes';
		$scene_text_toggle = 'toggle_on';
		$scene_orphan_icon_action = 'translucent';
		$scene_toc_style = 'list';
		$scene_same_hover_color_sections = 'yes';
		$scene_hover_color = '#ffff00';
		$scene_hover_text_color = '#000000';
		$scene_section_number = 0;

		// create the placeholder scene.
		$post_data = array(
			'post_title'   => $post_title,
			'post_type'    => 'scene',
			'post_status'  => 'publish',
			'post_author'  => $current_user_id,
		);

		// Insert the post and get its ID.
		$post_id = wp_insert_post( $post_data );

		// Check if post was created successfully.
		if ( ! is_wp_error( $post_id ) ) {
			$placeholder_instance_id = $this->find_placeholder_post_id( 2, 'instance' );

			update_post_meta( $post_id, 'scene_published', 'published' );
			update_post_meta( $post_id, 'post_title', $post_title ); // This line is only needed because post title is added to the post meta table for regular scene posts, where it is used for several operations.
			$scene_infographic_url = $this->copy_image_to_media_library( $scene_infographic, 2, $placeholder_instance_id );
			update_post_meta( $post_id, 'scene_infographic', $scene_infographic_url );
			update_post_meta( $post_id, 'scene_tagline', $scene_tagline );
			update_post_meta( $post_id, 'scene_info_entries', 0 );
			update_post_meta( $post_id, 'scene_photo_entries', 0 );
			update_post_meta( $post_id, 'scene_order', 1 );
			update_post_meta( $post_id, 'scene_full_screen_button', $scene_full_screen_button );
			update_post_meta( $post_id, 'scene_text_toggle', $scene_text_toggle );
			update_post_meta( $post_id, 'scene_orphan_icon_action', $scene_orphan_icon_action );
			update_post_meta( $post_id, 'scene_toc_style', $scene_toc_style );
			update_post_meta( $post_id, 'scene_hover_color', $scene_hover_color );
			update_post_meta( $post_id, 'scene_hover_text_color', $scene_hover_text_color );
			update_post_meta( $post_id, 'graphic_data_placeholder_id', 3 );
		}
	}

	/**
	 * Ensures the placeholder instance type, instance, scene and modal all exist.
	 *
	 * Each placeholder is identified by its `graphic_data_placeholder_id` meta value:
	 * 1 = instance type (termmeta), 2 = instance, 3 = scene, 4 = modal (postmeta).
	 * Any placeholder that is missing is created by its create_placeholder_*() method.
	 * Runs regardless of whether the Graphic Data theme is active.
	 *
	 * When a run finds everything already exists, the PLACEHOLDERS_READY_OPTION flag is set and later calls
	 * return immediately. The flag is autoloaded, so checking it costs no extra query. It is
	 * cleared when a placeholder is deleted, so the next request recreates what is missing.
	 *
	 * @return void
	 */
	public function placeholder_content_director() {
		if ( get_option( self::PLACEHOLDERS_READY_OPTION ) ) {
			return;
		}

		$all_present = true;

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

		// create placeholder instance type if it isn't there.
		if ( ! $this->find_placeholder_term_id( 1 ) ) {
			$all_present = false;
			$this->create_placeholder_instance_type();
		}

		// create instance if it isn't there.
		if ( ! $this->find_placeholder_post_id( 2, 'instance' ) ) {
			$all_present = false;
			$this->create_placeholder_instance( $current_user_id );
		}

		// create scene if it isn't there.
		if ( ! $this->find_placeholder_post_id( 3, 'scene' ) ) {
			$all_present = false;
			$this->create_placeholder_scene( $current_user_id );
		}

		// create modal if it isn't there.
		if ( ! $this->find_placeholder_post_id( 4, 'modal' ) ) {
			$all_present = false;
			$this->create_placeholder_modal( $current_user_id );
		}

		// Anything just created may need linking, and existing placeholders may still point
		// at a deleted one, so rewrite every link between them.
		if ( ! $all_present ) {
			$this->link_placeholders();
		}

		// Only set the flag once a request finds everything already in place, so a failed
		// creation is retried on the next request instead of being skipped forever.
		if ( $all_present ) {
			update_option( self::PLACEHOLDERS_READY_OPTION, 1, true );
		}
	}

	/**
	 * Clears the placeholders-ready flag when a placeholder post is permanently deleted.
	 *
	 * Hooked to `before_delete_post`, because post meta is already gone by `deleted_post`.
	 * Trashing a placeholder does not trigger this, since the post still exists.
	 *
	 * @param int $post_id ID of the post being deleted.
	 * @return void
	 */
	public function reset_placeholders_on_post_delete( $post_id ) {
		if ( '' !== get_post_meta( $post_id, 'graphic_data_placeholder_id', true ) ) {
			delete_option( self::PLACEHOLDERS_READY_OPTION );
		}
	}

	/**
	 * Clears the placeholders-ready flag when the placeholder instance type is deleted.
	 *
	 * Hooked to `pre_delete_term`, because term meta is already gone by `delete_term`.
	 *
	 * @param int $term_id ID of the term being deleted.
	 * @return void
	 */
	public function reset_placeholders_on_term_delete( $term_id ) {
		if ( '' !== get_term_meta( $term_id, 'graphic_data_placeholder_id', true ) ) {
			delete_option( self::PLACEHOLDERS_READY_OPTION );
		}
	}

	/**
	 * Finds the term ID of a placeholder term by its `graphic_data_placeholder_id` value.
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 * @param int $placeholder_id Placeholder marker value (1 = instance type).
	 * @return int Term ID, or 0 if not found.
	 */
	private function find_placeholder_term_id( $placeholder_id ) {
		global $wpdb;
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT term_id FROM {$wpdb->termmeta} WHERE meta_key = %s AND meta_value = %s ORDER BY term_id ASC LIMIT 1",
				'graphic_data_placeholder_id',
				$placeholder_id,
			)
		);
	}

	/**
	 * Finds the post ID of a placeholder post by its `graphic_data_placeholder_id` value.
	 *
	 * The post type is required because placeholder media attachments share marker values
	 * with placeholder posts (the scene image is tagged 2, the same as the instance).
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 * @param int    $placeholder_id Placeholder marker value (2 = instance, 3 = scene, 4 = modal).
	 * @param string $post_type      Post type the placeholder must have.
	 * @return int Post ID, or 0 if not found.
	 */
	private function find_placeholder_post_id( $placeholder_id, $post_type ) {
		global $wpdb;
		return (int) $wpdb->get_var(
			$wpdb->prepare(
				"SELECT pm.post_id FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = %s AND pm.meta_value = %s AND p.post_type = %s ORDER BY pm.post_id ASC LIMIT 1",
				'graphic_data_placeholder_id',
				$placeholder_id,
				$post_type,
			)
		);
	}

	/**
	 * Points every placeholder at the current IDs of the others.
	 *
	 * Safe to run repeatedly: it looks up each placeholder fresh and overwrites the link
	 * fields, so a placeholder that survived when another was deleted and recreated is
	 * reconnected to the new one.
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 * @return void
	 */
	private function link_placeholders() {
		global $wpdb;

		$instance_type_id = $this->find_placeholder_term_id( 1 );
		$instance_id      = $this->find_placeholder_post_id( 2, 'instance' );
		$scene_id         = $this->find_placeholder_post_id( 3, 'scene' );
		$modal_id         = $this->find_placeholder_post_id( 4, 'modal' );

		if ( $instance_id ) {
			update_post_meta( $instance_id, 'instance_type', $instance_type_id );
			update_post_meta( $instance_id, 'instance_overview_scene', $scene_id );
		}
		if ( $scene_id ) {
			update_post_meta( $scene_id, 'scene_location', $instance_id );
		}
		if ( $modal_id ) {
			update_post_meta( $modal_id, 'modal_location', $instance_id );
			update_post_meta( $modal_id, 'modal_scene', $scene_id );
		}

		// Placeholder media is tagged with the instance it belongs to.
		if ( $instance_id ) {
			$attachment_ids = $wpdb->get_col(
				$wpdb->prepare(
					"SELECT pm.post_id FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = %s AND p.post_type = %s",
					'graphic_data_placeholder_id',
					'attachment',
				)
			);
			foreach ( $attachment_ids as $attachment_id ) {
				update_post_meta( (int) $attachment_id, 'graphic_data_instance_id', $instance_id );
			}
		}
	}

	/**
	 * Creates tutorial modal posts and writes their metadata to the database.
	 *
	 * Iterates over a structured array of modal data and inserts each entry as a
	 * WordPress post of type 'modal'. For each successfully created post, sets
	 * post meta fields based on the keys present in $modal_array. Links to the other
	 * placeholders are set afterwards by link_placeholders().
	 *
	 * @param int $current_user_id  The WordPress user ID to set as the post author.
	 * @return void
	 */
	public function create_placeholder_modal( $current_user_id ) {
		$post_title = 'Placeholder Modal';
		$modal_tagline = 'This is a placeholder modal used for behind the scenes purposes when Graphic Data is not used as the theme.';

		$post_data = array(
			'post_title'   => $post_title,
			'post_type'    => 'modal',
			'post_status'  => 'publish',
			'post_author'  => $current_user_id,
		);

		// Insert the post and get its ID.
		$post_id = wp_insert_post( $post_data );

		// Check if post was created successfully.
		if ( ! is_wp_error( $post_id ) ) {
			update_post_meta( $post_id, 'modal_published', 'published' );
			update_post_meta( $post_id, 'post_type', 'modal' ); // needed? Unclear.
			update_post_meta( $post_id, 'modal_icons', 'Placeholder' );
			update_post_meta( $post_id, 'modal_tagline', $modal_tagline );
			update_post_meta( $post_id, 'modal_icon_order', 1 );
			update_post_meta( $post_id, 'icon_function', 'Modal' );
			update_post_meta( $post_id, 'modal_info_entries', 0 );
			update_post_meta( $post_id, 'modal_photo_entries', 0 );
			update_post_meta( $post_id, 'modal_tab_number', 1 );
			update_post_meta( $post_id, 'modal_tab_title1', 'First Modal Tab' );
			update_post_meta( $post_id, 'graphic_data_placeholder_id', 4 );
		}
	}

	/**
	 * Copies an image file from the plugin directory to the WordPress media library.
	 *
	 * Takes an image file from within the plugin's directory structure, uploads it to
	 * the WordPress media library, generates attachment metadata (including image sizes),
	 * and tags the resulting attachment with both a placeholder ID and an instance ID for
	 * later lookup or cleanup.
	 *
	 * @since 1.0.0
	 *
	 * @param string $plugin_relative_path Relative path to the image file from the plugin root directory.
	 *                                     Example: 'example_files/tutorial/image.jpg'
	 * @param int    $placeholder_id       Placeholder ID stored in attachment post meta under
	 *                                     `graphic_data_placeholder_id` to identify placeholder media.
	 * @param int    $instance_id          Instance ID stored in attachment post meta under
	 *                                     `graphic_data_instance_id` to associate the media with a
	 *                                     specific plugin instance.
	 *
	 * If an attachment with the same placeholder ID and title already exists and its file is
	 * still on disk, that attachment is reused (and re-tagged with $instance_id) instead of
	 * uploading another copy.
	 *
	 * @return string|false URL of the uploaded attachment on success, or false if the source
	 *                      file does not exist or the upload process fails.
	 */
	public function copy_image_to_media_library( $plugin_relative_path, $placeholder_id, $instance_id ) {
		$plugin_image_path = GRAPHIC_DATA_PLUGIN_DIR . $plugin_relative_path;

		if ( ! file_exists( $plugin_image_path ) ) {
			return false;
		}

		$filename = basename( $plugin_image_path );
		$attachment_title = sanitize_file_name( pathinfo( $filename, PATHINFO_FILENAME ) );

		// Reuse an earlier copy of this image (same placeholder marker and title) if its file is
		// still on disk, so recreating a placeholder doesn't add another copy to the media library.
		$existing_ids = get_posts(
			array(
				'post_type'      => 'attachment',
				'post_status'    => 'inherit',
				'title'          => $attachment_title,
				'meta_key'       => 'graphic_data_placeholder_id',
				'meta_value'     => $placeholder_id,
				'orderby'        => 'ID',
				'order'          => 'ASC',
				'fields'         => 'ids',
				'posts_per_page' => -1,
			)
		);
		foreach ( $existing_ids as $existing_id ) {
			$existing_file = get_attached_file( $existing_id );
			if ( $existing_file && file_exists( $existing_file ) ) {
				update_post_meta( $existing_id, 'graphic_data_instance_id', $instance_id );
				return wp_get_attachment_url( $existing_id );
			}
		}

		require_once ABSPATH . 'wp-admin/includes/file.php';
		require_once ABSPATH . 'wp-admin/includes/media.php';
		require_once ABSPATH . 'wp-admin/includes/image.php';

		$upload_file = wp_upload_bits( $filename, null, file_get_contents( $plugin_image_path ) );

		if ( $upload_file['error'] ) {
			return false;
		}

		$attachment_data = array(
			'post_mime_type' => $upload_file['type'],
			'post_title'     => $attachment_title,
			'post_content'   => '',
			'post_status'    => 'inherit',
		);

		$attachment_id = wp_insert_attachment( $attachment_data, $upload_file['file'] );
		$attachment_metadata = wp_generate_attachment_metadata( $attachment_id, $upload_file['file'] );
		wp_update_attachment_metadata( $attachment_id, $attachment_metadata );

		// Add a flag to the post meta table so that we can find this media library item if we need to delete it later.
		update_post_meta( $attachment_id, 'graphic_data_placeholder_id', $placeholder_id );

		// Add the instance to the post meta for the media.
		update_post_meta( $attachment_id, 'graphic_data_instance_id', $instance_id );

		// Return the URL associated with the media library item.
		return wp_get_attachment_url( $attachment_id );
	}
}
