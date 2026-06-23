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
	 * Create placeholder instance for the tutorial.
	 *
	 * @param int $current_user_id The ID of the user to set as post author.
	 * @return void
	 */
	public function create_placeholder_instance( $current_user_id ) {
		global $wpdb;

		// set up information to be saved as the three tutorial instances.
		$post_title = 'Placeholder Instance';
		$instance_short_title = 'Placeholder Instance';
		$instance_slug = 'placeholder-instance';
		$instance_status = 'Published';
		$tile_prefix = 'example_files/tutorial/';
		$instance_tile = $tile_prefix . 'instance_tile1.jpg';
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

			$placeholder_instance_type_id = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT term_id FROM {$wpdb->termmeta} WHERE meta_key = %s AND meta_value = %s",
					'graphic_data_placeholder_id',
					1,
				)
			);
			update_post_meta( $post_id, 'instance_type', $tutorial_instance_type_id );
			update_post_meta( $post_id, 'instance_status', 'Published' );

			// $instance_tile_url = $this->copy_image_to_media_library( $instance_tile [ $i ], $tutorial_id [ $i ] );
			// update_post_meta( $post_id, 'instance_tile', $instance_tile_url );
			update_post_meta( $post_id, 'instance_legacy_content', 'no' );
			update_post_meta( $post_id, 'instance_mobile_tile_background_color', $instance_mobile_tile_background_color );
			update_post_meta( $post_id, 'instance_mobile_tile_text_color', $instance_mobile_tile_text_color );
			update_post_meta( $post_id, 'instance_footer_columns', 0 );
			update_post_meta( $post_id, 'graphic_data_placeholder_id', 2 );
		}
	}

	/**
	 * Create example scenes for the tutorial.
	 *
	 * @param int $current_user_id The ID of the user to set as post author.
	 * @return void
	 */
	public function create_placeholder_scene( $current_user_id ) {
		global $wpdb;
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
			$placeholder_instance_id = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
					'graphic_data_placeholder_id',
					2,
				)
			);

			update_post_meta( $post_id, 'scene_location', $placeholder_instance_id );
			update_post_meta( $placeholder_instance_id, 'instance_overview_scene', $post_id );

			update_post_meta( $post_id, 'scene_published', 'published' );
			update_post_meta( $post_id, 'post_title', $post_title[ $i ] ); // This line is only needed because post title is added to the post meta table for regular scene posts, where it is used for several operations.
			$scene_infographic_url = $this->copy_image_to_media_library( $scene_infographic [ $i ], $tutorial_id [ $i ] );
			update_post_meta( $post_id, 'scene_infographic', $scene_infographic_url );
			update_post_meta( $post_id, 'scene_tagline', $scene_tagline [ $i ] );
			update_post_meta( $post_id, 'scene_info_entries', $scene_info_entries );
			update_post_meta( $post_id, 'scene_info1', $scene_info1 );
			update_post_meta( $post_id, 'scene_info2', $scene_info2 );
			for ( $q = 3; $q < 7; $q++ ) {
				$meta_key = 'scene_info' . $q;
				update_post_meta( $post_id, $meta_key, $this->create_blank_array( $meta_key ) );
			}
			update_post_meta( $post_id, 'scene_photo_entries', $scene_photo_entries );
			update_post_meta( $post_id, 'scene_photo1', $scene_photo1 );
			$scene_photo2['scene_photo_internal2'] = $this->copy_image_to_media_library( 'example_files/tutorial/tutorial_image1.jpg', $tutorial_id [ $i ] );
			update_post_meta( $post_id, 'scene_photo2', $scene_photo2 );
			update_post_meta( $post_id, 'scene_photo3', $scene_photo3 );
			for ( $q = 4; $q < 7; $q++ ) {
				$meta_key = 'scene_photo' . $q;
				update_post_meta( $post_id, $meta_key, $this->create_blank_array( $meta_key ) );
			}
			update_post_meta( $post_id, 'scene_order', $scene_order [ $i ] );
			update_post_meta( $post_id, 'scene_full_screen_button', $scene_full_screen_button [ $i ] );
			update_post_meta( $post_id, 'scene_text_toggle', $scene_text_toggle [ $i ] );
			update_post_meta( $post_id, 'scene_orphan_icon_action', $scene_orphan_icon_action );
			update_post_meta( $post_id, 'scene_toc_style', $scene_toc_style [ $i ] );
			update_post_meta( $post_id, 'scene_hover_color', $scene_hover_color );
			update_post_meta( $post_id, 'scene_hover_text_color', $scene_hover_text_color );
			update_post_meta( $post_id, 'scene_same_hover_color_sections', $scene_same_hover_color_sections [ $i ] );
			update_post_meta( $post_id, 'scene_section_number', $scene_section_number [ $i ] );
			if ( $i > 3 ) {
				update_post_meta( $post_id, 'scene_section1', $scene_section_details[0] );
				update_post_meta( $post_id, 'scene_section2', $scene_section_details[1] );
			}
			update_post_meta( $post_id, 'tutorial_id', $tutorial_id [ $i ] );
		}
	}

	/**
	 * Ensures a placeholder instance type exists when the Graphic Data theme is not active.
	 *
	 * Queries postmeta for the `graphic_data_instance_type_placeholder_id` key. If no
	 * record is found, delegates to {@see create_placeholder_instance_type()} to insert
	 * the placeholder term. Does nothing when the Graphic Data theme is active, since the
	 * theme provides its own instance type management.
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 * @return void
	 */
	public function placeholder_content_director() {
		global $wpdb;
		if ( ! GRAPHIC_DATA_IS_ACTIVE_THEME ) {

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
			$instance_type_present = $wpdb->get_var(
				"SELECT COUNT(*)
				FROM {$wpdb->postmeta}
				WHERE meta_key = 'graphic_data_placeholder_id' 
				AND meta_value = 1"
			);
			if ( 0 == $instance_type_present ) {
				$this->create_placeholder_instance_type();
			}

			// create instance if it isn't there.
			$instance_present = $wpdb->get_var(
				"SELECT COUNT(*)
				FROM {$wpdb->postmeta}
				WHERE meta_key = 'graphic_data_placeholder_id' 
				AND meta_value = 2"
			);
			if ( 0 == $instance_present ) {
				$this->create_placeholder_instance( $current_user_id );
			}
		}
	}
}
