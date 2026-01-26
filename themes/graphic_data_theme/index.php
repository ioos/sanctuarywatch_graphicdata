<?php
/**
 * Primary Page Template for Graphic Data Theme
 *
 * This template is designed to display the main content area of the Graphic Data Theme front page within a WordPress theme.
 * It integrates the site header and footer and provides a central container that features an image and detailed text
 * components styled directly within the template. The key elements include:
 *
 * - **Header Inclusion**: Utilizes `get_header()` to embed the standard site-wide header.
 * - **Main Content Container**: A full-width container that aligns the content at the top of the page and
 *   includes both visual and textual elements to engage users:
 *     - An emblem image (logo) for Sanctuary Watch is displayed alongside the site title and a descriptive tagline,
 *       both formatted with specific styles for prominence and readability.
 *     - A detailed description under a styled heading that introduces the Graphic Data platform, explaining its purpose
 *       and functionality in tracking ecosystem conditions through interactive tools.
 * - **Footer Inclusion**: Implements `get_footer()` to attach the standard site-wide footer.
 *
 * The content is primarily focused on delivering information through a clean and interactive layout, using inline styles
 * for specific design needs. This setup ensures that the theme maintains a coherent look while also providing specific
 * functionality and information layout tailored to the 'Sanctuary Watch' theme.
 *
 * @package Graphic_Data_Theme
 */

defined('ABSPATH') || exit;

get_header();

$graphic_data_args = array(
	'post_type'      => 'instance',
	'posts_per_page' => -1,
);

$graphic_data_instances_query = new WP_Query( $graphic_data_args );

$graphic_data_instance_slugs = array();
$graphic_data_instance_legacy_urls = [];

if ( $graphic_data_instances_query->have_posts() ) {
	while ( $graphic_data_instances_query->have_posts() ) {
		$graphic_data_instances_query->the_post();

		$graphic_data_instance_id = get_the_ID();
		$graphic_data_instance_slug = get_post_meta( $graphic_data_instance_id, 'instance_slug', true );
		$graphic_data_instance_overview_scene = get_post_meta( $graphic_data_instance_id, 'instance_overview_scene', true );
		$graphic_data_instance_legacy_content_url = get_post_meta( $graphic_data_instance_id, 'instance_legacy_content_url', true );

		if ( $graphic_data_instance_slug ) {
			$graphic_data_instance_slugs[] = [ $graphic_data_instance_slug, $graphic_data_instance_overview_scene ];
		}
		if ( $graphic_data_instance_legacy_content_url ) {
			$graphic_data_instance_legacy_urls[ $graphic_data_instance_id ] = $graphic_data_instance_legacy_content_url;
		}
	}
	wp_reset_postdata();
}

?>

<div id="entire_thing"> 
<div class="container-fluid-index">

<div class="image-center">
		<span class="site-branding-logo">
			<?php
				echo '<img src="' . esc_url( get_site_icon_url( 512, get_stylesheet_directory_uri() . '/assets/images/onms-logo-no-text-512.png' ) ) . '" alt="Navbar Emblem">';
			?>
		</span>
		<span class="site-branding-text-container">

		<div class="site-title-main"><?php echo esc_html( get_bloginfo( 'name' ) ); ?></div>
		<?php
			$graphic_data_site_tagline = get_bloginfo( 'description' );
		if ( '' != $graphic_data_site_tagline ) {
			echo "<div class='site-tagline-main'>" . esc_html( $graphic_data_site_tagline ) . '</div>';
		}
		?>
		</span>
	</div>
</div>
<!-- Main container with Bootstrap styling for fluid layout -->
<?php
$graphic_data_front_page_intro = '';
$graphic_data_settings = get_option( 'graphic_data_settings' );
if ( $graphic_data_settings && isset( $graphic_data_settings['intro_text'] ) && ! empty( $graphic_data_settings['intro_text'] ) ) {
	$graphic_data_front_page_intro = $graphic_data_settings['intro_text'];
}
echo "<div class='container-fluid-index main-container' style='margin-top: 0px;'><h4 style='color:black'>" . wp_kses_post( $graphic_data_front_page_intro ) . '</h4></div>';

$graphic_data_terms = get_terms(
	[
		'taxonomy'   => 'instance_type',
		'hide_empty' => false, // Include terms even if not assigned to posts.
	]
);

if ( empty( $graphic_data_terms ) || is_wp_error( $graphic_data_terms ) ) {
	return; // No terms found or an error occurred.
}

// Prepare an array with instance_order.
$graphic_data_terms_array = [];
foreach ( $graphic_data_terms as $graphic_data_term ) {
	$graphic_data_instance_order = get_term_meta( $graphic_data_term->term_id, 'instance_order', true );
	$graphic_data_terms_array[] = [
		'id'            => $graphic_data_term->term_id,
		'name'           => $graphic_data_term->name,
		'description'    => $graphic_data_term->description, // Get term description.
		'instance_order' => (int) $graphic_data_instance_order, // Ensure numeric sorting.
	];
}

// Sort terms by instance_order.
usort(
	$graphic_data_terms_array,
	function ( $a, $b ) {
		return $a['instance_order'] - $b['instance_order'];
	}
);


foreach ( $graphic_data_terms_array as $graphic_data_term ) {
	?>

	<?php
	echo "<hr class='mobile-separator'>";
	echo "<div class='container-fluid-index main-container'><h2 class='instance_type_title' style='margin-right: auto;'>" . esc_html( $graphic_data_term['name'] ) . '</h2></div>';
	echo "<div class='container-fluid-index main-container' style='margin-top: -30px; display: block'>" . wp_kses_post( $graphic_data_term['description'] ) . '</div>';
	echo "<div class='container main-container'>";

	$graphic_data_args = array(
		'post_type'      => 'instance',
		'posts_per_page' => -1,
		'meta_query'     => array(
			array(
				'key'   => 'instance_type',
				'value' => $graphic_data_term['id'],
			),
			array(
				'key'     => 'instance_status',
				'value'   => 'Draft',
				'compare' => '!=',
			),
		),
	);

	$graphic_data_query = new WP_Query( $graphic_data_args );

	$graphic_data_instances = array();

	if ( $graphic_data_query->have_posts() ) {
		while ( $graphic_data_query->have_posts() ) {
			$graphic_data_query->the_post();
			$graphic_data_instances[] = array(
				'id'             => get_the_ID(),
				'post_title'     => get_the_title(),
				'instance_status' => get_post_meta( get_the_ID(), 'instance_status', true ),
				'instance_legacy_content' => get_post_meta( get_the_ID(), 'instance_legacy_content', true ),
				'instance_legacy_content_url' => get_post_meta( get_the_ID(), 'instance_legacy_content_url', true ),
				'instance_overview_scene'    => get_post_meta( get_the_ID(), 'instance_overview_scene', true ),
			);
		}
		wp_reset_postdata();
	}

	// Custom sorting function: alphabetically by instance_status, then alphabetically by post_title.
	usort(
		$graphic_data_instances,
		function ( $a, $b ) {
			$graphic_data_status_compare = strcasecmp( $a['instance_status'], $b['instance_status'] ); // Reverse order.
			if ( 0 != $graphic_data_status_compare ) {
				return $graphic_data_status_compare;
			}
			return strcasecmp( $a['post_title'], $b['post_title'] ); // Normal order.
		}
	);

	$graphic_data_instance_count = count( $graphic_data_instances );
	$graphic_data_instance_rows = ceil( $graphic_data_instance_count / 3 );

	for ( $graphic_data_i = 0; $graphic_data_i < $graphic_data_instance_rows; $graphic_data_i++ ) {
		echo "<div class ='row justify-content-start' style='padding-bottom: 10px;'>";
		for ( $graphic_data_j = 0; $graphic_data_j < 3; $graphic_data_j++ ) {
			$graphic_data_current_row = $graphic_data_i * 3 + $graphic_data_j;
			$graphic_data_instance = isset( $graphic_data_instances[ $graphic_data_current_row ] ) ? $graphic_data_instances[ $graphic_data_current_row ] : null;

			if ( null != $graphic_data_instance ) {
				$graphic_data_tile_image = get_post_meta( $graphic_data_instance['id'], 'instance_tile' )[0];
				if ( 'no' == $graphic_data_instance['instance_legacy_content'] ) {
					$graphic_data_instance_slug = get_post_meta( $graphic_data_instance['id'], 'instance_slug' )[0];
					$graphic_data_instance_overview_scene = get_post_meta( $graphic_data_instance['id'], 'instance_overview_scene', true );
					$graphic_data_instance_post_name = get_post( $graphic_data_instance_overview_scene )->post_name;
					$graphic_data_instance_link = get_site_url() . '/' . $graphic_data_instance_slug . '/' . $graphic_data_instance_post_name;
				} else {
					$graphic_data_instance_link = $graphic_data_instance['instance_legacy_content_url'];
				}
				echo '<div class="col-12 col-sm-6 col-md-4 d-flex">';
				echo '<div class="card w-100" >';
				if ( 'Published' === $graphic_data_instance['instance_status'] ) {
					echo "<a href='" . esc_url( $graphic_data_instance_link ) . "'><img class='card-img-top' src='" . esc_url( $graphic_data_tile_image ) . "' alt='" . esc_attr( $graphic_data_instance['post_title'] ) . "'></a>";
				} else {
					echo "<img class='card-img-top' src='" . esc_url( $graphic_data_tile_image ) . "' alt='" . esc_attr( $graphic_data_instance['post_title'] ) . "'>";
				}
				echo '<div class="card-body">';
				if ( 'Published' === $graphic_data_instance['instance_status'] ) {
					echo "<a href='" . esc_url( $graphic_data_instance_link ) . "' class='btn w-100 instance_published_button'>" . esc_html( $graphic_data_instance['post_title'] ) . '</a>';
				} else {
					echo "<a class='btn w-100 instance_draft_button'>" . esc_html( $graphic_data_instance['post_title'] ) . '<br>Coming Soon</a>';
				}
				echo '</div>';

				echo '</div></div>';
			}
		}
		echo '</div>';
	}
	echo '</div>';
}

?>

</div>
<?php
 get_footer();
?>
</body>
