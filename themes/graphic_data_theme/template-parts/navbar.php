<?php
/**
 * Navigation Bar Template
 *
 * This template file is responsible for generating a dynamic and responsive navigation bar for a WordPress theme,
 * specifically tailored to display links based on the 'scene' custom post type and its associated metadata. The navbar
 * facilitates easy navigation through various scenes and includes a fallback for general site navigation if no scenes
 * are available. It leverages Bootstrap's navbar component to ensure responsiveness and aesthetic integration. Key
 * functionalities include:
 * - **Dynamic Navbar Branding**: Depending on the presence of specific post metadata ('scene_location'), the navbar's
 *   brand logo adjusts dynamically. If 'scene_location' is present, it shows a text link styled as the navbar brand
 *   that leads to the 'overview' of the current scene. If not present, it defaults to displaying the site's logo along
 *   with the 'Sanctuary Watch' text.
 * - **Scene-Specific Navigation Links**:
 *   - Utilizes a custom WP_Query to fetch posts of type 'scene' that match the current 'scene_location'.
 *   - Posts are sorted by a custom field ('scene_order') to control the display order, allowing manual curation of
 *     link arrangement within the navbar.
 *   - Each post title is displayed as a link within the navbar, facilitating quick navigation to different scenes.
 *   - If no matching posts are found, a template part (typically a dropdown menu) is included as a fallback.
 * This navigation bar is crucial for user navigation, offering both adaptability and robust functionality to enhance
 * user experience and site usability.
 *
 * @package Graphic_Data_Theme
 */

 defined( 'ABSPATH' ) || exit;
?>

<nav class="navbar navbar-expand-lg bg-primary" data-bs-theme="dark">
	<div id = "navbar-inner" class="container-fluid">
		<div class="navbar-wrapper">
			<?php
			$graphic_data_post_meta = get_post_meta( get_the_ID() );
			$graphic_data_scene_location = isset( $graphic_data_post_meta['scene_location'][0] ) ? $graphic_data_post_meta['scene_location'][0] : '';

			$graphic_data_inst_overview_scene = isset( $graphic_data_post_meta['instance_overview_scene'][0] ) ? $graphic_data_post_meta['instance_overview_scene'][0] : '';

			$graphic_data_single_instance = graphic_data_single_instance_check();
			if ( false != $graphic_data_single_instance ) {
				$graphic_data_scene_location = $graphic_data_single_instance['instanceID'];
			}

			if ( ! empty( $graphic_data_scene_location ) ) {
				$graphic_data_title = get_post_meta( $graphic_data_scene_location, 'post_title' )[0];
				echo "<span class='navbar-brand'>" . esc_html( $graphic_data_title ) . '</span>';
			}

			?>
			<div class="collapse navbar-collapse" id="navbarColor01">
				<ul class="navbar-nav">
					<?php

					$graphic_data_args = array(
						'post_type' => 'scene',
						'post_status' => 'publish',
						'meta_query' => array(
							array(
								'key' => 'scene_location',
								'value' => $graphic_data_scene_location,
								'compare' => '=',
							),
						),
					);
					$graphic_data_query = new WP_Query( $graphic_data_args );
					if ( $graphic_data_query->have_posts() ) {
						$graphic_data_post_titles = array();
						while ( $graphic_data_query->have_posts() ) {
							$graphic_data_query->the_post();
							$graphic_data_scene_loc = get_post_meta( get_the_ID(), 'scene_location' )[0];
							$graphic_data_scene_published = get_post_meta( get_the_ID(), 'scene_published', true );
							$graphic_data_inst_overview_scene = get_post_meta( $graphic_data_scene_loc, 'instance_overview_scene' )[0];
							$graphic_data_scene_order = get_post_meta( get_the_ID(), 'scene_order' );
							if ( get_the_ID() != $graphic_data_inst_overview_scene && 'draft' != $graphic_data_scene_published ) {
								$graphic_data_post_titles[] = [ get_the_title(), $graphic_data_scene_order[0], get_the_ID() ];
							}
						}
						wp_reset_postdata();


						/**
						 * Comparison callback for sorting post title arrays.
						 *
						 * Sorts primarily by the numeric sort order (index 1), then
						 * alphabetically by title (index 0) as a tiebreaker.
						 *
						 * @param array $a First array with [title, sort_order, post_id].
						 * @param array $b Second array with [title, sort_order, post_id].
						 * @return int Negative if $a < $b, positive if $a > $b, zero if equal.
						 */
						function graphic_data_custom_compare( $a, $b ) {
							$result = $a[1] - $b[1];
							if ( 0 == $result ) {
								$result = strcmp( $a[0], $b[0] );
							}
							return $result;
						}

						usort( $graphic_data_post_titles, 'graphic_data_custom_compare' );

						if ( $graphic_data_inst_overview_scene ) {
							echo "<li class='nav-item'><a class='nav-link' href='" . esc_url( get_permalink( $graphic_data_inst_overview_scene ) ) . "'>" . esc_html( get_the_title( $graphic_data_inst_overview_scene ) ) . '</a></li>';
						}

						foreach ( $graphic_data_post_titles as $graphic_data_post_title ) {
							echo "<li class='nav-item'><a class='nav-link' href='" . esc_url( get_permalink( $graphic_data_post_title[2] ) ) . "'>" . esc_html( $graphic_data_post_title[0] ) . '</a></li>';
						}

						// Add about option to the end of scene list, if this is a single instance view.
						if ( false != $graphic_data_single_instance ) {
							if ( is_user_logged_in() == true ) {
								$graphic_data_args = array(
									'post_type' => 'about', // custom post type.
									'post_status' => 'publish',
									'posts_per_page' => 1, // We only need to know if at least one exists.
								);
							} else {
								$graphic_data_args = array(
									'post_type' => 'about', // custom post type.
									'post_status' => 'publish',
									'posts_per_page' => 1, // We only need to know if at least one exists.
									'meta_query' => array( // only show if about_published is published.
										array(
											'key' => 'about_published',
											'value' => 'published',
											'compare' => '=',
										),
									),
								);
							}
							$graphic_data_about_query = new WP_Query( $graphic_data_args );

							if ( $graphic_data_about_query->have_posts() ) {
								// At least one "about" post exists.
								echo '<li class="nav-item ">';
								echo '<a class="nav-link "  href="/about" role="button" aria-haspopup="true" aria-expanded="false">About</a>';
								echo '</li>';
							}
						}
					} else {
						get_template_part( 'parts/navbar-dropdown' );
					}
					?>
				
				</ul>
			</div>
		</div>
	</div>
</nav>

