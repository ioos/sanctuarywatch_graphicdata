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

		$term_name = [ 'First Instance Type', 'Second Instance Type' ];
		$term_slug = [ 'tutorial-instance-example-1', 'tutorial-instance-example-2' ];
		$term_description = [
			'Welcome, Space Captain! The highest level of organization in Graphic Data is the "Instance Type". Right here is an example (First Instance Type). ' .
			'Instance Types contain Instances. With Graphic Data, you must have at least one Instance Type and each Type must contains one or more Instances. This particular Instance Type contains two Instances.',
			'This is a second example Instance Type and it contains one Instance.',
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
	 * Copies a pair of .json and .csv files from the plugin directory to the data/tutorial folder.
	 *
	 * Creates the wp-content/data/ and wp-content/data/tutorial/ directories if they do not
	 * already exist. For each extension (.json, .csv), appends the extension to $file_path to
	 * resolve the source file and copies it to the tutorial folder. Skips any file that already
	 * exists at the destination. Returns false immediately if any copy operation fails.
	 *
	 * @param string $file_path Relative path (without extension) to the source file within the
	 *                          plugin directory (e.g. 'example_files/tutorial/data').
	 * @return string|false The relative destination path shared by both files
	 *                      (e.g. 'data/tutorial/data') on success, or false if a copy fails.
	 */
	public function copy_files_to_data_folder( $file_path ) {
		$data_folder = WP_CONTENT_DIR . '/data';
		if ( ! file_exists( $data_folder ) ) {
			wp_mkdir_p( $data_folder );
		}

		$tutorial_folder = $data_folder . '/tutorial';
		if ( ! file_exists( $tutorial_folder ) ) {
			wp_mkdir_p( $tutorial_folder );
		}

		$initial_source_path = GRAPHIC_DATA_PLUGIN_DIR . $file_path;
		$initial_destination_path = $tutorial_folder . '/' . basename( $file_path );

		$file_extension_array = [ '.json', '.csv' ];
		foreach ( $file_extension_array as $file_extension ) {
			$final_destination_path = $initial_destination_path . $file_extension;
			$final_source_path = $initial_source_path . $file_extension;
			if ( ! file_exists( $final_destination_path ) ) {
				if ( ! copy( $final_source_path, $final_destination_path ) ) {
					return false;
				}
			}
		}
		return $initial_destination_path;
	}

	/**
	 * Delete the data/tutorial folder and its contents.
	 *
	 * Deletes all files inside the data/tutorial/ directory within the plugin directory,
	 * then removes the tutorial/ directory itself.
	 *
	 * @return void
	 */
	public function delete_data_json_files() {
		$tutorial_folder = WP_CONTENT_DIR . '/data/tutorial';

		if ( file_exists( $tutorial_folder ) ) {
			foreach ( glob( $tutorial_folder . '/*' ) as $file ) {
				wp_delete_file( $file );
			}
			rmdir( $tutorial_folder );
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
	 * Populate tutorial default values for Graphic Data settings options.
	 *
	 * Sets the intro text, sitewide footer title, sitewide footer body, and
	 * front page code block to pre-written tutorial content. These values are
	 * normally configured by the user on the Graphic Data Settings page.
	 *
	 * @param array $options Existing options array to populate with tutorial content.
	 * @return array The options array with tutorial content values added.
	 */
	public function create_graphic_data_settings_content( $options ) {
		$options['intro_text'] = 'Welcome to Graphic Data, a WordPress plugin and theme that connects graphic design with data display. Here, you will find examples of what Graphic Data can do as well as instructions on how to use Graphic Data.';
		$options['sitewide_footer_title'] = 'Sitewide Footer Title';
		$options['site_footer'] = 'This is a column that exists across all pages on the site, called the sitewide footer. It is an optional and you can edit it on the Graphic Data Settings page.';
		$options['front_page_code_block'] = '
			<style>
				@import url("https://fonts.googleapis.com/css?family=Lato:300,400,700");
				#starfield-container {
				position: relative;
				width: 100%;
				max-width: 800px;
				height: clamp(200px, 40vw, 400px);
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
				font-size: clamp(16px, 4vw, 36px);
				letter-spacing: clamp(2px, 1vw, 10px);
				transform: translateY(-50%);
				padding-left: 10px;
				z-index: 10;
				}
				#title span {
					display: block;
					background: -webkit-linear-gradient(white, #a8c0d0);
					-webkit-background-clip: text;
					-webkit-text-fill-color: transparent;
					background-clip: text;
					filter: drop-shadow(0px 1px 3px rgba(0, 0, 0, 0.8));
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
		return $options;
	}

	/**
	 * Clear tutorial default values from Graphic Data settings options.
	 *
	 * Resets the intro text, sitewide footer title, sitewide footer body, and
	 * front page code block to empty strings, effectively removing the tutorial
	 * content from the Graphic Data settings.
	 *
	 * @param array $options Existing options array to clear tutorial content from.
	 * @return array The options array with tutorial content values emptied.
	 */
	public function delete_graphic_data_settings_content( $options ) {
		$options['intro_text'] = '';
		$options['sitewide_footer_title'] = '';
		$options['site_footer'] = '';
		$options['front_page_code_block'] = '';
		return $options;
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
	 * Build a blank key-value array for a single accordion link slot.
	 *
	 * All link slots for the scene/modal info and photo accordions must have entries
	 * in the post meta table (even empty ones) for any slot to be visible. Normal form
	 * submissions populate these automatically; tutorial content must construct them
	 * manually, which this helper does.
	 *
	 * @param string $array_key Meta key ending in a numeric index (e.g. `scene_info_link1`).
	 * @return array Associative array of blank sibling meta keys ready for insertion.
	 */
	public function create_blank_array( $array_key ) {
		$key_length = strlen( $array_key );
		$string_fragment1 = substr( $array_key, 0, $key_length - 1 );
		$string_fragment2 = substr( $array_key, -1 );
		$array_type = strpos( $array_key, 'info' );
		if ( false != $array_type ) {
			$first_key = $string_fragment1 . '_text' . $string_fragment2;
			$second_key = $string_fragment1 . '_url' . $string_fragment2;
			return array(
				$first_key => '',
				$second_key  => '',
			);
		} else {
			$first_key = $string_fragment1 . '_location' . $string_fragment2;
			$second_key = $string_fragment1 . '_text' . $string_fragment2;
			$third_key = $string_fragment1 . '_url' . $string_fragment2;
			$fourth_key = $string_fragment1 . '_internal' . $string_fragment2;
			return array(
				$first_key => 'External',
				$second_key  => '',
				$third_key  => '',
				$fourth_key  => '',
			);
		}
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
			'Welcome to Instance One, Space Commander! There are three instances in the tutorial content, each of which are there to highlight a different way to organize content. Here in Instance One, we are illustrating an Instance that contains multiple Scenes. When we have multiple Scenes in an Instance, the recommended practice is for the first Scene (the Overview Scene) to link to the other Scenes of the Instance. And so we demonstrate here! The three robots below, link to the same information displayed in three different ways.',
			'The second one',
			'The third one',
			'The fourth one',
			'The fifth one',
			'The sixth one',
		];
		$scene_info_entries = 2;
		$scene_info1 = array(
			'scene_info_text1' => 'More information',
			'scene_info_url1'  => 'https://en.wikipedia.org/wiki/Space_settlement',
		);
		$scene_info2 = array(
			'scene_info_text2' => 'You can have up to 6 links',
			'scene_info_url2'  => 'https://en.wikipedia.org/wiki/The_Power_of_Six',
		);
		$scene_photo_entries = 3;
		$scene_photo1 = array(
			'scene_photo_location1' => 'External',
			'scene_photo_text1' => 'An illustrative image outside of the site',
			'scene_photo_url1'  => 'https://nss.org/settlement/nasa/70sArtHiRes/70sArt/Cylinder_Interior_AC75-1086_1920.jpg',
			'scene_photo_internal1' => '',
		);
		$scene_photo2 = array(
			'scene_photo_location2' => 'Internal',
			'scene_photo_text2' => 'An illustrative image within the site',
			'scene_photo_url2'  => '',
			'scene_photo_internal2' => '',
		);
		$scene_photo3 = array(
			'scene_photo_location3' => 'External',
			'scene_photo_text3' => 'You can have up to 6 links here too',
			'scene_photo_url3'  => 'https://nss.org/settlement/nasa/70sArtHiRes/70sArt/Torus_Cutaway_AC75-1086-1_5725.jpg',
			'scene_photo_internal3' => '',
		);

		$scene_order = [ 1, 2, 3, 4, 1, 1 ];
		$scene_full_screen_button = [ 'yes', 'no', 'no', 'yes', 'yes', 'yes' ];
		$scene_text_toggle = [ 'toggle_off', 'none', 'none', 'toggle_off', 'toggle_on', 'toggle_on' ];
		$scene_orphan_icon_action = 'translucent';
		$scene_toc_style = [ 'list', 'list', 'list', 'list', 'sectioned_list', 'accordion' ];
		$scene_same_hover_color_sections = [ 'yes', 'yes', 'yes', 'yes', 'no', 'no' ];
		$scene_hover_color = '#ffff00';
		$scene_hover_text_color = '#000000';
		$scene_section_number = [ 0, 0, 0, 0, 2, 2 ];
		$scene_section_details = array(
			array(
				'scene_section_title1' => 'First Section',
				'scene_section_hover_color1' => '#eb4034',
				'scene_section_hover_text_color1' => '#125496',
			),
			array(
				'scene_section_title2' => 'Second Section',
				'scene_section_hover_color2' => '#29d646',
				'scene_section_hover_text_color2' => '#ad1897',
			),
		);

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
		};
	}

	/**
	 * Create example figures for the tutorial.
	 *
	 * @param int $current_user_id The ID of the user to set as post author.
	 * @return void
	 */
	public function create_tutorial_figures( $current_user_id ) {

		// NASA SDO "The Sun Now" — updates every few minutes, date/time stamped on the image:
		// This is a real-time image of the Sun in the 193Å extreme ultraviolet wavelength (showing the corona in false color). The date and UTC time are burned directly into the image, it's hosted on NASA's GSFC servers, and the URL never changes.
		// https://sdo.gsfc.nasa.gov/assets/img/latest/latest_1024_0193.jpg
		// image from https://www.researchgate.net/publication/334155727_Coronal_Mass_Ejections_over_Solar_Cycles_23_and_24 .

		global $wpdb;
		$target_icon_array = [ 'Image', 'Video', 'Interactive Bar Chart', 'Interactive Line Chart', 'External Link', 'Code Block' ];
		$figure_tutorial_id = 45;
		$modal_tutorial_id_array = [ 15, 21, 27, 33, 39 ]; // Image.

		// Load the details of the figures to be saved as tutorial figures from a json.
		$figure_details_json_path = GRAPHIC_DATA_PLUGIN_DIR . 'example_files/tutorial/figure_details.json';
		$figure_details_json = file_get_contents( $figure_details_json_path ); // phpcs:ignore WordPress.WP.AlternativeFunctions.file_get_contents_file_get_contents
		$figure_details_data = json_decode( $figure_details_json, true );

		// Iterate through each type of figure.
		for ( $a = 0; $a < 3; $a++ ) {
			$target_icon = $target_icon_array[ $a ];
			$target_figure_details = $figure_details_data[ $target_icon ];
			$target_array_length = count( $target_figure_details );
			$target_tutorial_id_array = array_map( fn( $id ) => $id + $a, $modal_tutorial_id_array );
			// Iterate through every figure in each figure type.
			for ( $b = 0; $b < $target_array_length; $b++ ) {
				$target_figure_details_element = $target_figure_details[ $b ];
				// Make a copy of each figure for every scene to which it is to be attached.
				for ( $q = 0; $q < 5; $q++ ) {
					$tutorial_modal_id = $wpdb->get_var(
						$wpdb->prepare(
							"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
							'tutorial_id',
							$target_tutorial_id_array[ $q ],
						)
					);
					$tutorial_scene_id = $wpdb->get_var(
						$wpdb->prepare(
							"SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s AND post_id = %d",
							'modal_scene',
							$tutorial_modal_id,
						)
					);
					$tutorial_instance_id = $wpdb->get_var(
						$wpdb->prepare(
							"SELECT meta_value FROM {$wpdb->postmeta} WHERE meta_key = %s AND post_id = %d",
							'modal_location',
							$tutorial_modal_id,
						)
					);

					$post_data = array(
						'post_title'   => $target_figure_details_element['title'],
						'post_type'    => 'figure',
						'post_status'  => 'publish',
						'post_author'  => $current_user_id,
					);

					// Insert the post and get its ID.
					$post_id = wp_insert_post( $post_data );

					// Check if post was created successfully.
					if ( ! is_wp_error( $post_id ) ) {
						update_post_meta( $post_id, 'figure_published', 'published' );
						update_post_meta( $post_id, 'figure_modal', $tutorial_modal_id );
						update_post_meta( $post_id, 'figure_scene', $tutorial_scene_id );
						update_post_meta( $post_id, 'location', $tutorial_instance_id );
						update_post_meta( $post_id, 'figure_tab', $target_figure_details_element['figure_tab'] );
						update_post_meta( $post_id, 'figure_order', $target_figure_details_element['figure_order'] );
						update_post_meta( $post_id, 'figure_science_info', $target_figure_details_element['figure_science_info'] );
						update_post_meta( $post_id, 'figure_data_info', $target_figure_details_element['figure_data_info'] );
						update_post_meta( $post_id, 'figure_caption_short', $target_figure_details_element['figure_caption_short'] );
						update_post_meta( $post_id, 'figure_caption_long', $target_figure_details_element['figure_caption_long'] );
						update_post_meta( $post_id, 'figure_path', $target_figure_details_element['figure_path'] );
						update_post_meta( $post_id, 'tutorial_id', $figure_tutorial_id );
						switch ( $target_figure_details_element['figure_path'] ) {
							case 'Code':
								update_post_meta( $post_id, 'figure_code', $target_figure_details_element['figure_code'] );
								break;
							case 'External':
								update_post_meta( $post_id, 'figure_external_url', $target_figure_details_element['figure_external_url'] );
								update_post_meta( $post_id, 'figure_external_alt', $target_figure_details_element['figure_external_alt'] );
								break;
							case 'Internal':
								$figure_image = $this->copy_image_to_media_library( $target_figure_details_element['figure_image'], $figure_tutorial_id );
								update_post_meta( $post_id, 'figure_image', $figure_image );
								break;
							case 'Interactive':
								$figure_file_path = $this->copy_files_to_data_folder( $target_figure_details_element['uploaded_file_path'] );
								if ( false != $figure_file_path ) {
									update_post_meta( $post_id, 'uploaded_path_json', $figure_file_path . '.json' );
									update_post_meta( $post_id, 'uploaded_path_csv', $figure_file_path . '.csv' );
									update_post_meta( $post_id, 'uploaded_file', basename( $figure_file_path ) . '.csv' );
									update_post_meta( $post_id, 'figure_interactive_arguments', wp_json_encode( $target_figure_details_element['figure_interactive_arguments'] ) );
								}
								break;
						}
						++$figure_tutorial_id;
					}
				}
			}
		}
	}

	/**
	 * Create example modals for the tutorial.
	 *
	 * @param int $current_user_id The ID of the user to set as post author.
	 * @return void
	 */
	public function create_tutorial_modals( $current_user_id ) {
		global $wpdb;
		$initial_array = array();
		$initial_array['post_title'] = [ 'Default Scene', 'Table Scene', 'Space Scene' ];
		$initial_array['modal_location'] = 3;
		$initial_array['modal_scene'] = 6;
		$initial_array['modal_icons'] = [ 'Default', 'Table', 'Space' ];
		$initial_array['modal_icon_order'] = [ 1, 3, 2 ];
		$initial_array['icon_function'] = [ 'Scene', 'Scene', 'Scene' ];
		$initial_array['icon_scene_out'] = [ 7, 8, 9 ];
		$initial_array['tutorial_id'] = [ 12, 13, 14 ];
		$this->write_modals_to_database( $initial_array, $current_user_id );

		$modal_location = [ 3, 3, 3, 4, 5 ];
		$modal_scene = [ 7, 8, 9, 10, 11 ];

		// default scene: 12.
		for ( $q = 0; $q < 5; $q++ ) {
			$repeat_array = array();

			$tutorial_instance_id = $wpdb->get_var(
				$wpdb->prepare(
					"SELECT pm.post_id FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = %s AND pm.meta_value = %s AND p.post_type = %s ORDER BY pm.post_id ASC LIMIT 1",
					'tutorial_id',
					$modal_scene[ $q ],
					'scene',
				)
			);
			$scene_title = get_the_title( $tutorial_instance_id );
			$repeat_array['post_title'] = [ 'Image', 'Video', 'Interactive Line Chart', 'Interactive Bar Chart', 'External Link', 'Code Block' ];
			$repeat_array['modal_location'] = $modal_location[ $q ];
			$repeat_array['modal_scene'] = $modal_scene[ $q ];
			$repeat_array['modal_icons'] = [ 'Image', 'Video', 'Interactive-Line-Chart', 'Interactive-Bar-Chart', 'External-Link', 'Code-Block' ];
			if ( $q > 2 ) {
				$repeat_array['icon_toc_section'] = [ 1, 2, 1, 2, 1, 2 ];
			}
			$repeat_array['modal_icon_order'] = [ 1, 1, 1, 1, 1, 1 ];
			$repeat_array['icon_function'] = [ 'Modal', 'Modal', 'Modal', 'Modal', 'External URL', 'Modal' ];
			$repeat_array['modal_tagline'] = [ 'The image tagline', 'The video tagline', 'the interactive line tagline', 'the interactive bar tagline', '', 'the code block tagline' ];
			$repeat_array['modal_info_entries'] = 2;
			$repeat_array['modal_photo_entries'] = 3;
			$repeat_array['modal_tab_number'] = [ 2, 1, 1, 1, 1, 1 ];
			$repeat_array['modal_tab_title1'] = [ 'Internal link', 'Video', 'Line Chart', 'Bar Chart', 'External Link', 'Code Block' ];
			$repeat_array['modal_tab_title2'] = [ 'External link', '', '', '', '', '' ];
			$min_id = ( $q + 1 ) * 6 + 9;
			$max_id = ( $q + 1 ) * 6 + 14;
			$repeat_array['tutorial_id'] = range( $min_id, $max_id );
			$this->write_modals_to_database( $repeat_array, $current_user_id );
		}
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

		$modal_info1 = array(
			'modal_info_text1' => 'More information',
			'modal_info_url1'  => 'https://en.wikipedia.org/wiki/Space_settlement',
		);
		$modal_info2 = array(
			'modal_info_text2' => 'You can have up to 6 links',
			'modal_info_url2'  => 'https://en.wikipedia.org/wiki/The_Power_of_Six',
		);
		$modal_photo1 = array(
			'modal_photo_location1' => 'External',
			'modal_photo_text1' => 'An illustrative image outside of the site',
			'modal_photo_url1'  => 'https://nss.org/settlement/nasa/70sArtHiRes/70sArt/Cylinder_Interior_AC75-1086_1920.jpg',
			'modal_photo_internal1' => '',
		);
		$modal_photo2 = array(
			'modal_photo_location2' => 'Internal',
			'modal_photo_text2' => 'An illustrative image within the site',
			'modal_photo_url2'  => '',
			'modal_photo_internal2' => '',
		);
		$modal_photo3 = array(
			'modal_photo_location3' => 'External',
			'modal_photo_text3' => 'You can have up to 6 links here too',
			'modal_photo_url3'  => 'https://nss.org/settlement/nasa/70sArtHiRes/70sArt/Torus_Cutaway_AC75-1086-1_5725.jpg',
			'modal_photo_internal3' => '',
		);

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
									$modal_array['modal_location'],
								)
							);
							update_post_meta( $post_id, 'modal_location', $tutorial_instance_id );
							break;
						case 'modal_scene':
							$tutorial_instance_id = $wpdb->get_var(
								$wpdb->prepare(
									"SELECT pm.post_id FROM {$wpdb->postmeta} pm INNER JOIN {$wpdb->posts} p ON p.ID = pm.post_id WHERE pm.meta_key = %s AND pm.meta_value = %s AND p.post_type = %s ORDER BY pm.post_id ASC LIMIT 1",
									'tutorial_id',
									$modal_array['modal_scene'],
									'scene',
								)
							);
							update_post_meta( $post_id, 'modal_scene', $tutorial_instance_id );
							break;
						case 'modal_icons':
							update_post_meta( $post_id, 'modal_icons', $modal_array['modal_icons'][ $i ] );
							break;
						case 'modal_tagline':
							update_post_meta( $post_id, 'modal_tagline', $modal_array['modal_tagline'][ $i ] );
							break;
						case 'modal_icon_order':
							update_post_meta( $post_id, 'modal_icon_order', $modal_array['modal_icon_order'][ $i ] );
							break;
						case 'icon_function':
							update_post_meta( $post_id, 'icon_function', $modal_array['icon_function'][ $i ] );

							if ( 'Scene' == $modal_array['icon_function'][ $i ] ) {
								$tutorial_scene_out_id = $wpdb->get_var(
									$wpdb->prepare(
										"SELECT post_id FROM {$wpdb->postmeta} WHERE meta_key = %s AND meta_value = %s",
										'tutorial_id',
										$modal_array['icon_scene_out'][ $i ],
									)
								);
								update_post_meta( $post_id, 'icon_scene_out', $tutorial_scene_out_id );
							} elseif ( 'External URL' == $modal_array['icon_function'][ $i ] ) {
								update_post_meta( $post_id, 'icon_external_url', 'https://ioos.github.io/sanctuarywatch_graphicdata/' );
							}
							break;
						case 'post_title':
							update_post_meta( $post_id, 'post_title', $modal_array['post_title'][ $i ] ); // This line is only needed because post title is added to the post meta table for regular posts, where it is used for several operations.
							break;
						case 'modal_info_entries':
							update_post_meta( $post_id, 'modal_info_entries', $modal_array['modal_info_entries'] );
							update_post_meta( $post_id, 'modal_info1', $modal_info1 );
							update_post_meta( $post_id, 'modal_info2', $modal_info2 );
							for ( $q = 3; $q < 7; $q++ ) {
								$meta_key = 'modal_info' . $q;
								update_post_meta( $post_id, $meta_key, $this->create_blank_array( $meta_key ) );
							}
							break;
						case 'modal_photo_entries':
							update_post_meta( $post_id, 'modal_photo_entries', $modal_array['modal_photo_entries'] );

							update_post_meta( $post_id, 'modal_photo1', $modal_photo1 );
							$modal_photo2['modal_photo_internal2'] = $this->copy_image_to_media_library( 'example_files/tutorial/tutorial_image1.jpg', $modal_array['tutorial_id'][ $i ] );
							update_post_meta( $post_id, 'modal_photo2', $modal_photo2 );
							update_post_meta( $post_id, 'modal_photo3', $modal_photo3 );
							for ( $q = 4; $q < 7; $q++ ) {
								$meta_key = 'modal_photo' . $q;
								update_post_meta( $post_id, $meta_key, $this->create_blank_array( $meta_key ) );
							}
							break;
						case 'modal_tab_number':
							if ( 4 != $i ) { // We don't want modal tab recorded for link out modals.
								update_post_meta( $post_id, 'modal_tab_number', $modal_array['modal_tab_number'][ $i ] );
							}
							break;
						case 'modal_tab_title1':
							if ( 4 != $i ) { // We don't want modal tab title recorded for link out modals.
								update_post_meta( $post_id, 'modal_tab_title1', $modal_array['modal_tab_title1'][ $i ] );
								if ( '' != $modal_array['modal_tab_title2'] ) {
									update_post_meta( $post_id, 'modal_tab_title2', $modal_array['modal_tab_title2'][ $i ] );
								}
							}
							break;
						case 'icon_toc_section':
							update_post_meta( $post_id, 'icon_toc_section', $modal_array['icon_toc_section'][ $i ] );
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
