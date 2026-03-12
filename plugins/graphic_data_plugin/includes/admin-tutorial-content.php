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
		static $is_running = false;
		if ( $is_running ) {
			return;
		}
		$is_running = true;

		$options = get_option( 'graphic_data_settings' );
		$tutorial_content = isset( $options['tutorial_content'] ) ? $options['tutorial_content'] : 0;
		switch ( $tutorial_content ) {
			// no tutorial content wanted. If it hasn't been done already, delete all existing tutorial content.
			case 0:
				if ( ( ! isset( $options['tutorial_content_present'] ) ) || 0 == $options['tutorial_content_present'] ) {
					$options['tutorial_content'] = 0;
					$options['tutorial_content_present'] = 0;
					update_option( 'graphic_data_settings', $options );
					$this->delete_tutorial_instance_types();
					$this->delete_tutorial_images();
					$this->delete_tutorial_posts();
					$this->delete_graphic_data_settings_content();
				}
				break;
			// Tutorial content wanted. If it hasn't been done already, create tutorial content.
			case 1:
				if ( ( ! isset( $options['tutorial_content_present'] ) ) || 0 == $options['tutorial_content_present'] ) {
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

					$options['tutorial_content_present'] = 1;
					update_option( 'graphic_data_settings', $options );
					$this->create_tutorial_instance_types();
					$this->create_tutorial_instances( $current_user_id );
					$this->create_tutorial_scenes( $current_user_id );
					$this->create_tutorial_modals( $current_user_id );
					$this->create_graphic_data_settings_content();
				}
				break;
		}
		$is_running = false;
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
			'You must have at least one instance type and each instance type contains one or more instances. This particular instance type contains two instances.',
			'This is a second example instance type and it contains one instance.',
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
		$options['intro_text'] = 'Welcome to Graphic Data, a WordPress plugin and theme that connects graphic design with data display. Here, you will find examples of what Graphic Data can do as well as instructions on how to use Graphic Data.';
		$options['sitewide_footer_title'] = 'Sitewide Footer Title';
		$options['site_footer'] = 'This is a column that exists across all pages on the site, called the sitewide footer. It is an optional and you can edit it on the Graphic Data Settings page.';
		$options['front_page_code_block'] = '  <link href="https://fonts.googleapis.com/css?family=Lato:300,400,700" rel="stylesheet">
			<style>
				#starfield-container {
				position: relative;
				width: 800px;
				height: 400px;
				margin: 0 auto;
				overflow: hidden;
				background: radial-gradient(ellipse at bottom, #1B2735 0%, #090A0F 100%);
				}

				#starfield-container canvas {
				position: absolute;
				top: 0;
				left: 0;
				}

				#stars  { animation: animStar  50s linear infinite; }
				#stars2 { animation: animStar 100s linear infinite; }
				#stars3 { animation: animStar 150s linear infinite; }

				@keyframes animStar {
				from { transform: translateY(0px); }
				to   { transform: translateY(-2000px); }
				}

				#title {
				position: absolute;
				top: 50%;
				left: 0;
				right: 0;
				color: #FFF;
				text-align: center;
				font-family: "Lato", sans-serif;
				font-weight: 300;
				font-size: 36px;
				letter-spacing: 10px;
				transform: translateY(-50%);
				padding-left: 10px;
				z-index: 10;
				}

				#title span {
				display: block;
				background: -webkit-linear-gradient(white, #38495a);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				background-clip: text;
				}
			</style>
			<div id="starfield-container">
				<canvas id="stars"></canvas>
				<canvas id="stars2"></canvas>
				<canvas id="stars3"></canvas>
				<div id="title">
				<span>SAMPLE CODE BLOCK</span>
				<br>
				<span>Create your own within the Graphic Data settings page.</span>
				</div>
			</div>

			<script>
				function generateStars(canvasId, count, size) {
				const canvas = document.getElementById(canvasId);
				const ctx = canvas.getContext("2d");
				const container = document.getElementById("starfield-container");

				function draw() {
					canvas.width  = container.offsetWidth;
					canvas.height = 4000;
					ctx.fillStyle = "#FFF";
					for (let i = 0; i < count; i++) {
					const x = Math.random() * container.offsetWidth;
					const y = Math.random() * 2000;
					ctx.fillRect(x, y, size, size);
					ctx.fillRect(x, y + 2000, size, size);
					}
				}

				draw();
				window.addEventListener("resize", draw);
				}

				generateStars("stars",  700, 1);
				generateStars("stars2", 200, 2);
				generateStars("stars3", 100, 3);
			</script>';
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
		$options['site_footer'] = '';
		$options['front_page_code_block'] = '';
		update_option( 'graphic_data_settings', $options );
	}

	/**
	 * Create example instances for the tutorial.
	 *
	 * @param int $current_user_id The ID of the user to set as post author.
	 * @return void
	 */
	public function create_tutorial_instances( $current_user_id ) {
		global $wpdb;

		// set up information to be saved as the three tutorial instances.
		$post_title = [ 'Example Instance 1', 'Example Instance 2', 'Example Instance 3' ];
		$instance_short_title = [ 'Example 1', 'Example 2', 'Example 3' ];
		$instance_slug = [ 'example-instance-1', 'example-instance-2', 'example-instance-3' ];
		$instance_type = [ 1, 1, 2 ];
		$tutorial_id = [ 3, 4, 5 ];
		$instance_status = 'Published';
		$tile_prefix = 'example_files/tutorial/';
		$instance_tile = [ $tile_prefix . 'instance_tile1.jpg', $tile_prefix . 'instance_tile2.jpg', $tile_prefix . 'instance_tile3.jpg' ];
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
				update_post_meta( $post_id, 'instance_mobile_tile_background_color', $instance_mobile_tile_background_color );
				update_post_meta( $post_id, 'instance_mobile_tile_text_color', $instance_mobile_tile_text_color );
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
	 * @param int $current_user_id The ID of the user to set as post author.
	 * @return void
	 */
	public function create_tutorial_scenes( $current_user_id ) {
		global $wpdb;
		$tutorial_id = [ 6, 7, 8, 9, 10, 11 ];
		$post_title = [ 'Overview Scene', 'Default Scene', 'Table Scene', 'Space Scene', 'Space Base', 'Space Dome' ];
		$scene_location = [ 3, 3, 3, 3, 4, 5 ];
		$file_prefix = 'example_files/tutorial/';
		$scene_infographic = [
			$file_prefix . 'overview-scene.svg',
			$file_prefix . 'default-scene.svg',
			$file_prefix . 'table-scene.svg',
			$file_prefix . 'space-colony-dome-scene.svg',
			$file_prefix . 'spaceship-scene.svg',
			$file_prefix . 'space-colony-scene.svg',
		];
		$scene_tagline = [
			'The first one',
			'The second one',
			'The third one',
			'The fourth one',
			'The fifth one',
			'The sixth one',
		];
		$scene_info_entries = 0;
		$scene_photo_entries = 0;
		$scene_order = [ 1, 2, 3, 4, 1, 1 ];
		$scene_full_screen_button = [ 'yes', 'no', 'no', 'yes', 'yes', 'yes' ];
		$scene_text_toggle = [ 'toggle_off', 'none', 'none', 'toggle_off', 'toggle_on', 'toggle_on' ];
		$scene_orphan_icon_action = 'translucent';
		$scene_toc_style = 'list';
		$scene_same_hover_color_sections = [ 'yes', 'yes', 'yes', 'yes', 'yes', 'yes' ];
		$scene_hover_color = '#ffff00';
		$scene_hover_text_color = '#000000';

		// create the six tutorial scenes.
		for ( $i = 0; $i < 6; $i++ ) {
			$post_data = array(
				'post_title'   => $post_title[ $i ],
				'post_type'    => 'scene',
				'post_status'  => 'publish',
				'post_author'  => $current_user_id,
			);

			// Insert the post and get its ID.
			$post_id = wp_insert_post( $post_data );

			// Check if post was created successfully.
			if ( ! is_wp_error( $post_id ) ) {
				$tutorial_instance_id = $wpdb->get_var(
					$wpdb->prepare(
						"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
						'tutorial_id',
						$scene_location [ $i ],
					)
				);

				update_post_meta( $post_id, 'scene_location', $tutorial_instance_id );
				if ( $i < 1 || $i > 3 ) { // Add an overview scene to each tutorial instance.
					update_post_meta( $tutorial_instance_id, 'instance_overview_scene', $post_id );
				}
				update_post_meta( $post_id, 'scene_published', 'published' );
				update_post_meta( $post_id, 'post_title', $post_title[ $i ] ); // This line is only needed because post title is added to the post meta table for regular scene posts, where it is used for several operations.
				$scene_infographic_url = $this->copy_image_to_media_library( $scene_infographic [ $i ], $tutorial_id [ $i ] );
				update_post_meta( $post_id, 'scene_infographic', $scene_infographic_url );
				update_post_meta( $post_id, 'scene_tagline', $scene_tagline [ $i ] );
				update_post_meta( $post_id, 'scene_info_entries', $scene_info_entries );
				update_post_meta( $post_id, 'scene_photo_entries', $scene_photo_entries );
				update_post_meta( $post_id, 'scene_order', $scene_order [ $i ] );
				update_post_meta( $post_id, 'scene_full_screen_button', $scene_full_screen_button [ $i ] );
				update_post_meta( $post_id, 'scene_text_toggle', $scene_text_toggle [ $i ] );
				update_post_meta( $post_id, 'scene_orphan_icon_action', $scene_orphan_icon_action );
				update_post_meta( $post_id, 'scene_toc_style', $scene_toc_style );
				update_post_meta( $post_id, 'scene_hover_color', $scene_hover_color );
				update_post_meta( $post_id, 'scene_hover_text_color', $scene_hover_text_color );
				update_post_meta( $post_id, 'scene_same_hover_color_sections', $scene_same_hover_color_sections [ $i ] );
				update_post_meta( $post_id, 'tutorial_id', $tutorial_id [ $i ] );
			}
		};
	}

	/**
	 * Create example modals for the tutorial.
	 *
	 * @param int $current_user_id The ID of the user to set as post author.
	 * @return void
	 */
	public function create_tutorial_modals( $current_user_id ) {
		$initial_array = array();
		$initial_array['post_title'] = [ 'Default Scene', 'Table Scene', 'Space Scene' ];
		$initial_array['modal_location'] = [ 3, 3, 3 ];
		$initial_array['modal_scene'] = [ 6, 6, 6 ];
		$initial_array['modal_icons'] = [ 'Default', 'Table', 'Space' ];
		$initial_array['modal_icon_order'] = [ 1, 3, 2 ];
		$initial_array['icon_function'] = [ 'Scene', 'Scene', 'Scene' ];
		$initial_array['icon_scene_out'] = [ 7, 8, 9 ];
		$initial_array['tutorial_id'] = [ 12, 13, 14 ];
		$this->write_modals_to_database( $initial_array, $current_user_id );

		// default scene: 12.
		$repeat_array = array();
		$repeat_array['post_title'] = [ 'Image Modal', 'Video Modal', 'Interactive Line Chart Modal', 'Interactive Bar Chart Modal', 'External Link Modal', 'Code Block Modal' ];
		$repeat_array['modal_location'] = [ 3, 3, 3, 3, 3, 3 ];
		$repeat_array['modal_scene'] = [ 12, 12, 12, 12, 12, 12 ];
		$repeat_array['modal_icons'] = [ 'Image', 'Video', 'Interactive-Line-Chart', 'Interactive-Bar-Chart', 'External-Link', 'Code-Block' ];
		$repeat_array['modal_icon_order'] = [ 1, 1, 1, 1, 1, 1 ];
		$repeat_array['icon_function'] = [ 'Modal', 'Modal', 'Modal', 'Modal', 'External URL', 'Modal' ];
		$repeat_array['modal_tagline'] = [ 'The image tagline', 'The video tagline', 'the interactive line tagline', 'the interactive bar tagline', '', 'the code block tagline' ];
		$repeat_array['modal_info_entries'] = [ 0, 0, 0, 0, 0, 0 ];
		$repeat_array['modal_photo_entries'] = [ 0, 0, 0, 0, 0 ];
		$repeat_array['modal_tab_number'] = [ 1, 1, 1, 1, 1, 1 ];
		$repeat_array['modal_tab_title1'] = [ 'Image', 'Video', 'Line Chart', 'Bar Chart', 'External Link', 'Code Block' ];
		$repeat_array['tutorial_id'] = range( 15, 20 );
		$this->write_modals_to_database( $repeat_array, $current_user_id );
	}

	/**
	 * Creates tutorial modal posts and writes their metadata to the database.
	 *
	 * Iterates over a structured array of modal data and inserts each entry as a
	 * WordPress post of type 'modal'. For each successfully created post, sets
	 * post meta fields based on the keys present in $modal_array.
	 *
	 * @param array $modal_array      Associative array of modal field data, keyed by
	 *                                field name with indexed sub-arrays per modal entry.
	 *                                Expected keys include: 'post_title', 'tutorial_id',
	 *                                'modal_location', 'modal_scene', 'modal_icons',
	 *                                'modal_icon_order', 'icon_function', 'icon_scene_out'.
	 * @param int   $current_user_id  The WordPress user ID to set as the post author.
	 * @return void
	 */
	public function write_modals_to_database( $modal_array, $current_user_id ) {
		global $wpdb;
		$i_max = count( $modal_array['post_title'] );

		for ( $i = 0; $i < $i_max; $i++ ) {
			$post_data = array(
				'post_title'   => $modal_array['post_title'][ $i ],
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
				$modal_array_keys = array_keys( $modal_array );
				foreach ( $modal_array_keys as $key ) {
					switch ( $key ) {
						case 'modal_location':
							$tutorial_instance_id = $wpdb->get_var(
								$wpdb->prepare(
									"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
									'tutorial_id',
									$modal_array['modal_location'][ $i ],
								)
							);
							update_post_meta( $post_id, 'modal_location', $tutorial_instance_id );
							break;
						case 'modal_scene':
							$tutorial_instance_id = $wpdb->get_var(
								$wpdb->prepare(
									"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
									'tutorial_id',
									$modal_array['modal_scene'][ $i ],
								)
							);
							update_post_meta( $post_id, 'modal_scene', $tutorial_instance_id );
							break;
						case 'modal_icons':
							update_post_meta( $post_id, 'modal_icons', $modal_array['modal_icons'][ $i ] );
							break;
						case 'modal_icon_order':
							update_post_meta( $post_id, 'modal_icon_order', $modal_array['modal_icon_order'][ $i ] );
							break;
						case 'icon_function':
							update_post_meta( $post_id, 'icon_function', $modal_array['icon_function'][ $i ] );

							if ( $modal_array['icon_function'][ $i ] ) {
								$tutorial_scene_out_id = $wpdb->get_var(
									$wpdb->prepare(
										"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
										'tutorial_id',
										$modal_array['icon_scene_out'][ $i ],
									)
								);
								update_post_meta( $post_id, 'icon_scene_out', $tutorial_scene_out_id );
							}
							break;
						case 'post_title':
							update_post_meta( $post_id, 'post_title', $modal_array['post_title'][ $i ] ); // This line is only needed because post title is added to the post meta table for regular posts, where it is used for several operations.
							break;
						case 'modal_info_entries':
							update_post_meta( $post_id, 'modal_info_entries', $modal_array['modal_info_entries'][ $i ] );
							break;
						case 'modal_photo_entries':
							update_post_meta( $post_id, 'modal_photo_entries', $modal_array['modal_photo_entries'][ $i ] );
							break;
						case 'modal_tab_number':
							update_post_meta( $post_id, 'modal_tab_number', $modal_array['modal_tab_number'][ $i ] );
							break;
						case 'modal_tab_title1':
							update_post_meta( $post_id, 'modal_tab_title1', $modal_array['modal_tab_title1'][ $i ] );
							break;
						case 'tutorial_id':
							update_post_meta( $post_id, 'tutorial_id', $modal_array['tutorial_id'][ $i ] ); // This line is only needed because post title is added to the post meta table for regular posts, where it is used for several operations.
							break;
					}
				}
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
