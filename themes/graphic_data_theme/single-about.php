<?php

defined( 'ABSPATH' ) || exit;

// Check if user is not logged in and metavalue for about_published is draft - redirect if so
$post_id = get_the_ID();
$about_published = get_post_meta( $post_id, 'about_published', true );

if ( ! is_user_logged_in() && $about_published === 'draft' ) {
	wp_redirect( home_url( '/' ) );
	exit;
}

get_header();


// wp_reset_postdata();
	$abt_post_id = get_the_ID();
	$numberAboutBoxes = get_post_meta( $abt_post_id, 'numberAboutBoxes', true );
	$about_post_title = get_post_meta( $abt_post_id, 'post_title', true );
	$about_central_array = get_post_meta( $abt_post_id, 'centralAbout', true );
	$about_central_main = $about_central_array['aboutMain'];
	$about_central_details = $about_central_array['aboutDetail'];
?>
<div id="entire_thing">
<!-- // Google Tags Container ID call from wp_options single-about.php -->
<?php
$settings = get_option( 'graphic_data_settings' );
$google_tags_container_id = isset( $settings['google_tags_container_id'] ) ? esc_js( $settings['google_tags_container_id'] ) : '';
?>
<!-- Google Tag Manager (noscript) -->
<noscript><iframe src="https://www.googletagmanager.com/ns.html?id=<?php echo $google_tags_container_id; ?>"
height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
<!-- End Google Tag Manager (noscript) -->

<div class="container-fluid">
<!-- <i class="fa fa-clipboard-list" role="presentation" aria-label="clipboard-list icon"></i> -->
<div class="image-center">
		<span class="site-branding-logo">
			<?php
				echo '<img src="' . get_site_icon_url( 512, get_stylesheet_directory_uri() . '/assets/images/onms-logo-no-text-512.png' ) . '" alt="Navbar Emblem">';
			?>
		</span>
		<span class="site-branding-text-container">

		<div class="site-title-main"><?php echo get_bloginfo( 'name' ); ?></div>
		<?php
			$site_tagline = get_bloginfo( 'description' );
		if ( $site_tagline != '' ) {
			echo "<div class='site-tagline-main'>$site_tagline</div>";
		}
		?>
		</span>
	</div>
</div>


<div class="page-container-fluid main-container">
	<h2 style="color:black"><?php echo $about_post_title; ?></h2>

	<div class="tagline-content row" style ="text-align:left">
		<?php echo $about_central_main; ?>
		<?php if ( ! empty( $about_central_details ) ) : ?>
		<details>
			<summary>Learn More...</summary>
			<?php echo ( $about_central_details ); ?>
		</details>
		<?php endif; ?>
	</div>
</div>

<!-- Loop through all the possible aboutBoxes and populate them dynamically if there is content in any of them content. -->
<!-- Number of boxes needed is grabbed from the database.-->
<div class="about-container page-container-fluid main-container">
	<?php
	for ( $i = 1; $i <= $numberAboutBoxes; $i++ ) {
		$aboutBox_array = get_post_meta( $abt_post_id, "aboutBox$i", true );
		$aboutBox_title = $aboutBox_array[ "aboutBoxTitle$i" ] ?? '';
		$aboutBox_main = $aboutBox_array[ "aboutBoxMain$i" ] ?? '';
		$aboutBox_details = $aboutBox_array[ "aboutBoxDetail$i" ] ?? '';

		// If aboutBox_title, aboutBox_main, or aboutBox_details is not empty, then go ahead and create the card.
		if ( ! empty( $aboutBox_title ) || ! empty( $aboutBox_main ) || ! empty( $aboutBox_details ) ) {
			?>
			<div class="about-card">
				<h2><?php echo esc_html( $aboutBox_title ); ?></h2>
				<div class="card-content">
					<?php echo ( $aboutBox_main ); ?>
					<?php if ( ! empty( $aboutBox_details ) ) : ?>
						<details>
							<summary>Learn More...</summary>
							<?php echo ( $aboutBox_details ); ?>
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