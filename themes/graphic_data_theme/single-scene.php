<?php
/**
 * Detailed Scene Page Template
 *
 * This template file is designed for displaying detailed pages of the 'scene' post type within a WordPress theme.
 * It dynamically loads and presents various content elements such as scene information, photos, and infographics
 * based on associated post metadata. The template handles the presentation logic including conditional rendering
 * of content sections and integrates Bootstrap components for styling. Key functionalities include:
 *
 * - **Header and Footer**: Incorporates the common header and footer across the site using `get_header()` and `get_footer()`.
 * - **Post Identification**: Retrieves the current post ID with `get_the_ID()` to fetch associated metadata.
 * - **Metadata Retrieval**: Uses a custom function `get_scene_info_photo()` to obtain arrays of text and URLs for
 *   scene information and photos, which are then passed to another function for rendering as accordion components.
 * - **Conditional Layouts**: Depending on the availability of scene information or photos, the layout adjusts to
 *   display these elements appropriately. If both information types are available, they are displayed side-by-side;
 *   otherwise, the tagline or main content takes more visual precedence.
 * - **Dynamic Content Rendering**: Content sections for scene information and photos are rendered using the
 *   `generateAccordionSection()` function which creates Bootstrap accordions dynamically. Additionally, any
 *   available infographic is displayed as an image.
 * - **Styling and Structure**: Inline styles are used temporarily for layout control, intended to be moved to
 *   an external CSS file for better maintainability and performance.
 *
 * This template is critical for providing a detailed and interactive view of individual scenes, facilitating
 * better user engagement and content discovery through well-structured and dynamic data presentation.
 *
 * @package Graphic_Data_Theme
 */

defined( 'ABSPATH' ) || exit;

// Check if user is not logged in and metavalue for scene_published is draft - redirect if so.
$graphic_data_post_id = get_the_ID();
$graphic_data_scene_published = get_post_meta( $graphic_data_post_id, 'scene_published', true );

if ( ! is_user_logged_in() && 'draft' === $graphic_data_scene_published ) {
	wp_redirect( home_url( '/' ) );
	exit;
}

get_header();

// ALL CURRENTLY ASSUME THERE IS THE CORRECT POSTMETA DATA AND THERE ALL SUFFICIENT INFORMATION EXISTS
// IMPLEMENT ERROR CHECKS LATER.
$graphic_data_scene_url = get_post_meta( $graphic_data_post_id, 'scene_infographic' );
$graphic_data_instance = get_post_meta( $graphic_data_post_id, 'scene_location', true );
?>

  <div class="modal" id="mobileModal" style="z-index: 9999; background-color: rgba(0,0,0,0.8);">
  <div class="modal-dialog modal-lg" style="z-index: 9999;margin-top: 5%; max-width: 95%;/* margin-right: 10%; */">
	<div class="modal-content" >

	<div class="modal-header">
		<h4 id = "modal-title1" class="modal-title"> Full Scene Image</h4>
		<button id="close1" type="button" class="btn-close" data-bs-dismiss="modal"></button>
	  </div>

	  <!-- Modal body -->
	  <div class="modal-body">
		<!-- Modal body.. -->
	  </div>

	</div>
  </div>
</div>

<!-- <body class="p-3 m-0 border-0 bd-example m-0 border-0"> -->
<div class="modal" id="myModal" style="z-index: 9999; background-color: rgba(0,0,0,0.8);">
  <div class="modal-dialog modal-lg" style="z-index: 9999; margin: 5% auto; ">
	<div class="modal-content" aria-labelledby="modal-title">

	  <!-- Modal Header -->
	  <div class="modal-header">
		<h4 id = "modal-title" class="modal-title"></h4>
		<button id="close" type="button" class="btn-close" data-bs-dismiss="modal"></button>
	  </div>

	  <!-- Modal body -->
	  <div class="modal-body">
		<div class="row">
		<div id="tagline-container"  >
			
			</div>
		  <div id="accordion-container"  >
		
		  </div>

		</div>
	  </div>

	  <!-- images go here -->
	  <ul class="nav nav-tabs" id="myTab" role="tablist" style="margin-left: 1%">

		
	  </ul>

	  <div class="tab-content" id="myTabContent" style="margin-top: 2%; margin-left: 2%; margin-right: 2%">

	  </div>
	  <!-- image stuff ends here -->

	</div>
  </div>
</div>


<div id="entire_thing">  
<div id="title-container" ></div>
<div id="mobile-view-image"></div>
<div class="container-fluid" id="scene-fluid">
  <div class="row" id="scene-row">
	<div class="col-md-10" >
	  <div id="svg1" class="responsive-image-container">
		<?php
		  $graphic_data_svg_url = get_post_meta( $graphic_data_post_id, 'scene_infographic', true );
		  $graphic_data_num_sections = get_post_meta( $graphic_data_post_id, 'scene_section_number', true );
		  $graphic_data_scene_sections = [];
		for ( $graphic_data_i = 1; $graphic_data_i <= $graphic_data_num_sections; $graphic_data_i++ ) {
			$graphic_data_curr = 'scene_section' . $graphic_data_i;
			$graphic_data_curr_section = get_post_meta( $graphic_data_post_id, $graphic_data_curr, true );
			$graphic_data_hov_color = 'scene_section_hover_color' . $graphic_data_i;
			$graphic_data_scene_title = 'scene_section_title' . $graphic_data_i;

			$graphic_data_scene_sections[ $graphic_data_curr_section[ $graphic_data_scene_title ] ] = $graphic_data_curr_section[ $graphic_data_hov_color ];
		}

		  // a bunch of scene meta fields.
		  $graphic_data_scene_default_hover_color = get_post_meta( $graphic_data_post_id, 'scene_hover_color', true );
		  $graphic_data_scene_default_hover_text_color = get_post_meta( $graphic_data_post_id, 'scene_hover_text_color', true );
		  $graphic_data_scene_text_toggle = get_post_meta( $graphic_data_post_id, 'scene_text_toggle', true );
		  $graphic_data_scene_toc_style = get_post_meta( $graphic_data_post_id, 'scene_toc_style', true );
		  $graphic_data_scene_full_screen_button = get_post_meta( $graphic_data_post_id, 'scene_full_screen_button', true );
		  $graphic_data_scene_same_hover_color_sections  = get_post_meta( $graphic_data_post_id, 'scene_same_hover_color_sections', true );

		  $graphic_data_child_ids = graphic_data_get_modal_array( $graphic_data_svg_url );

		?>
	  </div>
	</div>

	<div class="col-md-2" id="toc-container" >

		<!-- TABLE OF CONTENTS WILL GO HERE -->

	</div>
  </div>
  <script>
	let child_ids = <?php echo json_encode( $graphic_data_child_ids ); ?>;
	let post_id =  <?php echo absint( $graphic_data_post_id ); ?>;
	let svg_url =  <?php echo json_encode( $graphic_data_scene_url ); ?>;
	let num_sections =  <?php echo json_encode( $graphic_data_num_sections ); ?>;
	let scene_sections =  <?php echo json_encode( $graphic_data_scene_sections ); ?>;
	let scene_same_hover_color_sections = <?php echo json_encode( $graphic_data_scene_same_hover_color_sections ); ?>;

	let scene_default_hover_color =  <?php echo json_encode( $graphic_data_scene_default_hover_color ); ?>;
	let scene_default_hover_text_color =  <?php echo json_encode( $graphic_data_scene_default_hover_text_color ); ?>;
	let scene_text_toggle =  <?php echo json_encode( $graphic_data_scene_text_toggle ); ?>;
	let scene_toc_style =  <?php echo json_encode( $graphic_data_scene_toc_style ); ?>;
	let scene_full_screen_button  = <?php echo json_encode( $graphic_data_scene_full_screen_button ); ?>;    
  </script>

</div>
</div>
<?php
// This is where all of the stuff related to make_title will be.
global $wpdb;

$graphic_data_results = $wpdb->get_results(
	$wpdb->prepare(
		"SELECT * FROM {$wpdb->postmeta} 
		WHERE (meta_id = %d OR post_id = %d OR meta_key = %s OR meta_value = %s)
		LIMIT 100",
		$graphic_data_post_id,
		$graphic_data_post_id,
		strval( $graphic_data_post_id ),
		strval( $graphic_data_post_id )
	)
);


$graphic_data_title_arr = [];
foreach ( $graphic_data_results as $graphic_data_row ) {
	// Check if the meta_value looks like a serialized string.
	if ( is_serialized( $graphic_data_row->meta_value ) ) {
		$graphic_data_nested_array = @unserialize( $graphic_data_row->meta_value ); // Use @ to suppress the notice.

		if ( false !== $graphic_data_nested_array ) {
			$graphic_data_title_arr[ $graphic_data_row->meta_key ] = $graphic_data_nested_array;
		} else {
			// Handle unserialization failure if needed.
			$graphic_data_title_arr[ $graphic_data_row->meta_key ] = $graphic_data_row->meta_value; // Or some default value.
		}
	} else {
		// Not serialized, use the raw value.
		$graphic_data_title_arr[ $graphic_data_row->meta_key ] = $graphic_data_row->meta_value;
	}

	// This ties to scripts.js for the function handleIconVisibility(svgElement, visible_modals)?
	$graphic_data_related_modals_results = $wpdb->get_results(
		$wpdb->prepare(
			"
			SELECT pm2.meta_value AS modal_icons,
				pm3.meta_value AS modal_published
			FROM {$wpdb->postmeta} AS pm1
			INNER JOIN {$wpdb->postmeta} AS pm2
				ON pm1.post_id = pm2.post_id
			INNER JOIN {$wpdb->postmeta} AS pm3
				ON pm1.post_id = pm3.post_id
			INNER JOIN {$wpdb->posts} AS p
				ON pm1.post_id = p.ID
			WHERE pm1.meta_key = 'modal_scene'
			AND pm1.meta_value = %d
			AND pm2.meta_key = 'modal_icons'
			AND pm3.meta_key = 'modal_published'
			AND p.post_status != 'trash'
			LIMIT 100
			",
			$graphic_data_post_id
		)
	);

	// Only include modal_icons if the modal_published value is 'published'.
	$graphic_data_visible_modals = array_values(
		array_unique(
			array_reduce(
				$graphic_data_related_modals_results,
				function ( $carry, $row ) {
					if ( isset( $row->modal_published ) && 'published' === $row->modal_published ) {
						$carry[] = $row->modal_icons ?? null;
					}
					return $carry;
				},
				[]
			)
		)
	);
}

// save instance color settings for mobile background and mobile text to page.
$graphic_data_instance_mobile_tile_background_color = get_post_meta( $graphic_data_instance, 'instance_mobile_tile_background_color', true );
$graphic_data_instance_mobile_tile_text_color = get_post_meta( $graphic_data_instance, 'instance_mobile_tile_text_color', true );
$graphic_data_instance_color_settings = array(
	'instance_mobile_tile_background_color' => $graphic_data_instance_mobile_tile_background_color,
	'instance_mobile_tile_text_color' => $graphic_data_instance_mobile_tile_text_color,
);

?>
 </body>
<script>
  let title_arr  = <?php echo json_encode( $graphic_data_title_arr ); ?>;
  let visible_modals  = <?php echo json_encode( $graphic_data_visible_modals ); ?>;
  let instance_color_settings  = <?php echo json_encode( $graphic_data_instance_color_settings ); ?>;
</script>

  <!-- </body> -->

<?php
get_footer();