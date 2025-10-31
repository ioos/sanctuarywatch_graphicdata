<?php
/**
 * Main template file that defines the HTML document structure for the theme.
 *
 * This file serves as the foundational HTML document setup for a WordPress theme, including all necessary
 * meta tags for character set, viewport, and IE compatibility. It utilizes WordPress functions to manage
 * document language attributes, header customizations, and body classes dynamically. The structure includes
 * a top bar with a logo, breadcrumb navigation for site hierarchy, and an extensible navigation bar. 
 * Proper security and compatibility practices are followed to ensure that the theme performs reliably across 
 * different browsers and devices.
 */

defined( 'ABSPATH' ) || exit;
?>
<!doctype html>
<html <?php language_attributes();?>>
<head>

<!-- // Google Tags/Analytics Measurement ID call from wp_options index.php -->
<?php
$settings = get_option('webcr_settings');
$google_analytics_measurement_id = isset($settings['google_analytics_measurement_id']) ? esc_js($settings['google_analytics_measurement_id']) : '';
$google_tags_container_id = isset($settings['google_tags_container_id']) ? esc_js($settings['google_tags_container_id']) : '';
?>

<!-- // Google Tags/Analytics Measurement ID variable for access in JS for googletags.js-->
<script>
  window.webcrSettings = {
    googleAnalyticsMeasurementId: "<?php echo $google_analytics_measurement_id; ?>"
  };
</script>

<!-- Google tag specifically from analytics datastream (gtag.js) index.php-->
<script async src="https://www.googletagmanager.com/gtag/js?id=<?php echo $google_analytics_measurement_id; ?>"></script>
<script>
  window.dataLayer = window.dataLayer || [];
  function gtag(){dataLayer.push(arguments);}
  gtag('js', new Date());

  gtag('config', '<?php echo $google_analytics_measurement_id; ?>');
</script>

<!-- Google Tag Manager index.php-->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','<?php echo $google_tags_container_id; ?>');</script>
<!-- End Google Tag Manager -->


<meta charset="<?php bloginfo( 'charset' ); ?>" />
<meta http-equiv="X-UA-Compatible" content="IE=edge" />
<meta name="viewport" content="width=device-width, initial-scale=1, shrink-to-fit=no" />
<link rel="profile" href="http://gmpg.org/xfn/11" />
<?php 

// WordPress hook for adding elements to the <head> section
wp_head(); 
/**
 * Dynamically applies CSS styles to the header based on theme customization settings.
 *
 * This conditional style block changes the color of the header and its links based on the user's choice in
 * the theme customizer. Utilizing `get_header_textcolor()`, it ensures that the style only applies if a color is set,
 * enhancing the theme's flexibility and adherence to user preferences.
 */
if ( get_header_textcolor() ) : ?>
<style type="text/css">
	#header,
	#header a { 
		color: #<?php echo esc_attr( get_header_textcolor() ); ?>;
	}
</style>
<?php endif; ?>
</head>
<body <?php echo esc_html( body_class() ); ?>>
<?php 
	// WordPress hook for doing actions right after the body tag opens 
	wp_body_open(); 

// Get the customizer value
$customizer_header_row_enable = get_theme_mod('header_row_enable', '');

$ioos_bar_replacement = true; 

if (!empty($customizer_header_row_enable)) {
	if ($customizer_header_row_enable == 1){
		$ioos_bar_replacement = false;
		$theme_header_row_image_ID = get_theme_mod('header_row_image', '');
		if (($theme_header_row_image_ID == "" )|| (empty($theme_header_row_image_ID))){
			$customizer_header_row_image =  get_stylesheet_directory_uri() . "/assets/images/IOOS_Emblem_Tertiary_B_RGB.png";
		} else {
			$customizer_header_row_image = wp_get_attachment_url($theme_header_row_image_ID);
		}
		
		$customizer_header_row_image_alt = get_theme_mod('header_row_image_alt', '');
		if ($customizer_header_row_image_alt == "" || empty($customizer_header_row_image_alt)){
			$customizer_header_row_image_alt =  "IOOS emblem link";
		}

		$customizer_header_row_image_link = get_theme_mod('header_row_image_link', '');
		if ($customizer_header_row_image_link == "" || empty($customizer_header_row_image_link)){
			$customizer_header_row_image_link =  "https://ioos.us/";
		}

		echo '<!-- Top bar section containing a clickable logo that links to an external site -->';
		echo '<div id="top-bar">';
		echo '	<a href="' . $customizer_header_row_image_link . '" target="_blank">';
		echo '		<img src="' . $customizer_header_row_image . '"  alt="' . $customizer_header_row_image_alt . '">';

		//		echo '		<img src="' .  get_stylesheet_directory_uri() . '/assets/images/IOOS_Emblem_Tertiary_B_RGB.png" alt="IOOS EMBLEM LINK">';
		echo '	</a>';
		echo '</div>';
	}
}

if ($ioos_bar_replacement == true){
	echo '<div style="padding-top:30px">';
	echo '</div>';
}


/**
 * Implements breadcrumb navigation dynamically based on the current post's metadata.
 *
 * Breadcrumbs provide a trail for the user to follow back to the starting or entry point of the website and 
 * are dynamically generated here based on the post's scene location metadata. It enhances user navigation and 
 * SEO by structuring the site hierarchy.
 */

// Get the customizer value
$customizer_breadcrumb_row_enable = get_theme_mod('breadcrumb_row_enable', '');

$breadcrumb_row_replacement = true;

if (!empty($customizer_breadcrumb_row_enable)) {
	if ($customizer_breadcrumb_row_enable == 1){
		$breadcrumb_row_replacement = false;
		echo '<div id="site-name-logo-banner">';
		echo '	<span id="header-margin">';
		// Breadcrumbs are dynamically generated based on the current post's metadata to facilitate navigation and enhance SEO
		// Fetch and store the post meta data and the scene location for the current post using its ID.
		if (get_the_ID() != false){
			$postMeta = get_post_meta(get_the_ID());
			//Trying to access array offset on value of type null ??
			$sceneLocation = isset($postMeta['scene_location'][0]) ? $postMeta['scene_location'][0] : '';

			// Split the 'scene_location' string into an array based on spaces.
			$sceneArr = explode(' ', $sceneLocation);
			if (!empty($sceneLocation)){

				// OLD BREAD CRUMB LOGIC
				// // Loop through each word in the 'sceneLocation' array except the last one.
				// $scene_loc_webcr = '';
				// for($i = 0; $i < count($sceneArr)-1; $i++){
				// 	$scene_loc_webcr = $scene_loc_webcr.$sceneArr[$i].' ';
				// }
				// // Create the breadcrumb with the default links 
				// if (!empty($customizer_header_row_enable)) {
				// 	if ($customizer_header_row_enable == 1){
				// 	$customizer_header_row_breadcrumb_name = get_theme_mod('header_row_breadcrumb_name', '');
				// 	if ($customizer_header_row_breadcrumb_name == "" || empty($customizer_header_row_breadcrumb_name)){
				// 		$customizer_header_row_breadcrumb_name =  "IOOS";
				// 	}
				// 	echo '<a href="' . $customizer_header_row_image_link . '" target="_blank">' . $customizer_header_row_breadcrumb_name . '</a>';
				// 	echo '<p> > </p>';
				// 	}
				// }
				// echo '<a href="' . home_url() . '">' . get_bloginfo('name') . '</a>';

			}	
		}
		// NEW LOGO AND SITE NAME DISPLAY LOGIC
		// echo '<a class="navbar-brand" href="' . home_url() . '"><img class="navbar-emblem" width="55px" src="' . get_site_icon_url(512, get_stylesheet_directory_uri() . '/assets/images/onms-logo-no-text-512.png') . '" alt="Header Emblem">'. get_bloginfo('name'). '</a>';
		echo '<div class="site-name-logo-header">';
		echo '  <a class="navbar-brand" href="' . home_url() . '">
					<img class="navbar-emblem" width="55px"
						src="' . get_site_icon_url(512, get_stylesheet_directory_uri() . '/assets/images/onms-logo-no-text-512.png') . '"
						alt="Header Emblem">
					' . get_bloginfo('name') . '
				</a>';

		echo '  <button class="navbar-toggler" type="button"
						data-bs-toggle="collapse"
						data-bs-target="#navbarColor01"
						aria-controls="navbarColor01"
						aria-expanded="false"
						aria-label="Toggle navigation">
					<span class="navbar-toggler-icon"></span>
				</button>';
		echo '</div>';

		echo '	</span>';
		echo '</div>';
		
	}
	
}

if ($breadcrumb_row_replacement == true){
	echo '<div style="padding-top:20px">';
	echo '</div>';
}

get_template_part( 'template-parts/navbar' ); 