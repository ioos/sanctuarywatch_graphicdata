<?php

defined( 'ABSPATH' ) || exit;

get_header();

// Check if user is not logged in and metavalue for about_published is draft - redirect if so.
$graphic_data_post_id = get_the_ID();
$graphic_data_about_published = get_post_meta( $graphic_data_post_id, 'about_published', true );

if ( ! is_user_logged_in() && 'draft' === $graphic_data_about_published ) {
	wp_redirect( home_url( '/' ) );
	exit;
}

$graphic_data_number_about_boxes = get_post_meta( $graphic_data_post_id, 'numberAboutBoxes', true );
$graphic_data_about_post_title = get_post_meta( $graphic_data_post_id, 'post_title', true );
$graphic_data_about_central_array = get_post_meta( $graphic_data_post_id, 'centralAbout', true );
$graphic_data_about_central_main = $graphic_data_about_central_array['aboutMain'];
$graphic_data_about_central_details = $graphic_data_about_central_array['aboutDetail'];
?>
<div id="entire_thing">

<div class="container-fluid">
<!-- <i class="fa fa-clipboard-list" role="presentation" aria-label="clipboard-list icon"></i> -->
<div class="image-center">
		<span class="site-branding-logo">
			<?php
				echo '<img src="' . esc_url( get_site_icon_url( 512, get_stylesheet_directory_uri() . '/assets/images/graphic_data_logo_no_text_340.png' ) ) . '" alt="Navbar Emblem">';
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


<div class="page-container-fluid main-container">
	<h2 style="color:black"><?php echo esc_html( $graphic_data_about_post_title ); ?></h2>

	<div class="tagline-content row" style ="text-align:left">
		<?php echo wp_kses_post( $graphic_data_about_central_main ); ?>
		<?php if ( ! empty( $graphic_data_about_central_details ) ) : ?>
		<details>
			<summary>Learn More...</summary>
			<?php echo wp_kses_post( $graphic_data_about_central_details ); ?>
		</details>
		<?php endif; ?>
	</div>
</div>

<!-- Loop through all the possible aboutBoxes and populate them dynamically if there is content in any of them content. -->
<!-- Number of boxes needed is grabbed from the database.-->
<div class="about-container page-container-fluid main-container">
	<?php
	for ( $graphic_data_i = 1; $graphic_data_i <= $graphic_data_number_about_boxes; $graphic_data_i++ ) {
		$graphic_data_about_box_array = get_post_meta( $graphic_data_post_id, "aboutBox$graphic_data_i", true );
		$graphic_data_about_box_title = $graphic_data_about_box_array[ "aboutBoxTitle$graphic_data_i" ] ?? '';
		$graphic_data_about_box_main = $graphic_data_about_box_array[ "aboutBoxMain$graphic_data_i" ] ?? '';
		$graphic_data_about_box_details = $graphic_data_about_box_array[ "aboutBoxDetail$graphic_data_i" ] ?? '';

		// If aboutBox_title, aboutBox_main, or aboutBox_details is not empty, then go ahead and create the card.
		if ( ! empty( $graphic_data_about_box_title ) || ! empty( $graphic_data_about_box_main ) || ! empty( $graphic_data_about_box_details ) ) {
			?>
			<div class="about-card">
				<h2><?php echo esc_html( $graphic_data_about_box_title ); ?></h2>
				<div class="card-content">
					<?php echo wp_kses_post( $graphic_data_about_box_main ); ?>
					<?php if ( ! empty( $graphic_data_about_box_details ) ) : ?>
						<details>
							<summary>Learn More...</summary>
							<?php echo wp_kses_post( $graphic_data_about_box_details ); ?>
						</details>
					<?php endif; ?>
				</div>
			</div>
			<?php
		}
	}
	?>
</div>
</div>

<style>
.page-header {
	text-align: center;
	max-width: 800px;
	margin: 2rem auto;
	padding: 0 1rem;
}

.page-header h2 {
	color: #333;
	font-size: 2rem;
	margin-bottom: 1rem;
}

.tagline-content {
	color: #666;
	line-height: 1.6;
	font-size: 1.1rem;
	margin-bottom: 1rem;
}

.about-container {
	display: grid;
	grid-template-columns: repeat(2, 1fr);
	gap: 2rem;
	padding: 2rem;
	margin: 0 auto;
}

.about-card {
	background: #ffffff;
	border-radius: 8px;
	box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
	padding: 1.5rem;
	transition: transform 0.2s ease;
}

.about-card:hover {
	transform: translateY(-5px);
}

.about-card h2 {
	color: #333;
	margin-bottom: 1rem;
	font-size: 1.5rem;
	border-bottom: 2px solid #eee;
	padding-bottom: 0.5rem;
}

.card-content {
	color: #666;
	line-height: 1.6;
}

@media (max-width: 768px) {
	.about-container {
		grid-template-columns: 1fr;
		padding: 1rem;
	}
	
	.page-header {
		margin: 1rem auto;
	}
	
	.tagline-content {
		margin-bottom: 2rem;
	}
}
</style>
<?php get_footer(); ?>