<?php
/**
 * Dynamic render callback for the Graphic Data Scene block.
 */

$scene_id = isset( $attributes['sceneId'] ) ? absint( $attributes['sceneId'] ) : 0;

if ( ! $scene_id || 'scene' !== get_post_type( $scene_id ) ||
	( ( 'publish' !== get_post_status( $scene_id ) || 'published' !== get_post_meta( $scene_id, 'scene_published', true ) ) && ! current_user_can( 'edit_post', $scene_id ) ) ) {
	return '';
}

// Supply the shared renderer with the same data shape used by scene pages.
// Keep this local to the block so the renderer and the theme need no changes.
$title_data = array();
foreach ( get_post_meta( $scene_id ) as $key => $values ) {
	if ( str_starts_with( $key, 'scene_' ) ) {
		$title_data[ $key ] = get_post_meta( $scene_id, $key, true );
	}
}
$title_data = array_merge( array(
	'scene_tagline' => '', 'scene_info_entries' => 0, 'scene_photo_entries' => 0,
	'scene_section_number' => 0, 'scene_toc_style' => 'list',
), $title_data );
$title_data['post_title'] = get_the_title( $scene_id );
for ( $i = 1; $i <= 6; $i++ ) {
	$info = is_array( $title_data[ 'scene_info' . $i ] ?? null ) ? $title_data[ 'scene_info' . $i ] : array();
	$photo = is_array( $title_data[ 'scene_photo' . $i ] ?? null ) ? $title_data[ 'scene_photo' . $i ] : array();
	$title_data[ 'scene_info' . $i ] = array_merge( array(
		'scene_info_text' . $i => '', 'scene_info_url' . $i => '',
	), $info );
	$title_data[ 'scene_photo' . $i ] = array_merge( array(
		'scene_photo_text' . $i => '', 'scene_photo_url' . $i => '',
		'scene_photo_location' . $i => 'External', 'scene_photo_internal' . $i => '',
	), $photo );
}

$children = array();
$modals = get_posts( array(
	'post_type' => 'modal', 'post_status' => 'publish', 'posts_per_page' => -1,
	'orderby' => 'title', 'order' => 'ASC',
	'meta_query' => array(
		array( 'key' => 'modal_scene', 'value' => $scene_id ),
		array( 'key' => 'modal_published', 'value' => 'published' ),
	),
) );
foreach ( $modals as $modal ) {
	$icon = (string) get_post_meta( $modal->ID, 'modal_icons', true );
	if ( '' === $icon ) { continue; }
	$function = get_post_meta( $modal->ID, 'icon_function', true );
	$link = '';
	if ( 'External URL' === $function ) {
		$link = get_post_meta( $modal->ID, 'icon_external_url', true );
	} elseif ( 'Scene' === $function || 'Page' === $function ) {
		$link_id = absint( get_post_meta( $modal->ID, 'Scene' === $function ? 'icon_scene_out' : 'icon_page_out', true ) );
		$link = $link_id ? get_permalink( $link_id ) : '';
	}
	$children[ $icon ] = array(
		'title' => get_the_title( $modal->ID ), 'modal_id' => $modal->ID,
		'modal' => 'Modal' === $function, 'external_url' => esc_url_raw( $link ),
		'scene' => $scene_id, 'original_name' => $icon,
		'section_name' => get_post_meta( $modal->ID, 'icon_toc_section', true ) ?: 'None',
		'modal_icon_order' => (int) ( get_post_meta( $modal->ID, 'modal_icon_order', true ) ?: 1 ),
	);
}
$instance = absint( $title_data['scene_location'] ?? 0 );
$options = get_option( 'graphic_data_settings', array() );
$config = array(
	'postId' => $scene_id, 'titleArr' => $title_data,
	'pluginUrl' => plugin_dir_url( GRAPHIC_DATA_PLUGIN_DIR . 'graphic_data_plugin.php' ),
	'svgUrl' => $title_data['scene_infographic'] ?? '',
	'childIds' => (object) $children, 'visibleModals' => array_keys( $children ),
	'sceneSameHoverColorSections' => $title_data['scene_same_hover_color_sections'] ?? 'yes',
	'sceneDefaultHoverColor' => $title_data['scene_hover_color'] ?? '#003b71',
	'sceneDefaultHoverTextColor' => $title_data['scene_hover_text_color'] ?? '#003b71',
	'sceneTextToggle' => $title_data['scene_text_toggle'] ?? 'none',
	'sceneTocStyle' => $title_data['scene_toc_style'] ?: 'list',
	'sceneFullScreenButton' => $title_data['scene_full_screen_button'] ?? 'no',
	'newTabByDefault' => ! empty( $options['links_new_tab_by_default'] ),
	'instanceColorSettings' => array(
		'instance_mobile_tile_background_color' => get_post_meta( $instance, 'instance_mobile_tile_background_color', true ) ?: '#ffffff',
		'instance_mobile_tile_text_color' => get_post_meta( $instance, 'instance_mobile_tile_text_color', true ) ?: '#003b71',
	),
);

$allowed_width_units = array( '%', 'px', 'rem', 'vw' );
$scene_width       = isset( $attributes['sceneWidth'] ) ? max( 0, (float) $attributes['sceneWidth'] ) : 100;
$scene_width_unit  = isset( $attributes['sceneWidthUnit'] ) && in_array( $attributes['sceneWidthUnit'], $allowed_width_units, true )
	? $attributes['sceneWidthUnit']
	: '%';
$scene_max_width   = isset( $attributes['sceneMaxWidth'] ) ? max( 0, (float) $attributes['sceneMaxWidth'] ) : 0;
$scene_height      = isset( $attributes['sceneHeight'] ) ? max( 0, (float) $attributes['sceneHeight'] ) : 0;
$scene_alignment   = isset( $attributes['sceneAlignment'] ) && in_array( $attributes['sceneAlignment'], array( 'left', 'center', 'right' ), true )
	? $attributes['sceneAlignment']
	: 'center';
$background_color   = isset( $attributes['sceneBackgroundColor'] ) ? sanitize_hex_color( $attributes['sceneBackgroundColor'] ) : '';
$border_enabled     = ! empty( $attributes['sceneBorderEnabled'] );
$border_color       = isset( $attributes['sceneBorderColor'] ) ? sanitize_hex_color( $attributes['sceneBorderColor'] ) : '#000000';
$border_width       = isset( $attributes['sceneBorderWidth'] ) ? max( 0, (float) $attributes['sceneBorderWidth'] ) : 1;
$border_radius      = isset( $attributes['sceneBorderRadius'] ) ? max( 0, (float) $attributes['sceneBorderRadius'] ) : 0;
$scene_padding     = isset( $attributes['scenePadding'] ) ? max( 0, (float) $attributes['scenePadding'] ) : 0;

$background_color = $background_color ? $background_color : 'transparent';
$border_color     = $border_color ? $border_color : '#000000';

$alignment_margins = array(
	'left'   => 'margin-left:0;margin-right:auto;',
	'center' => 'margin-left:auto;margin-right:auto;',
	'right'  => 'margin-left:auto;margin-right:0;',
);

$wrapper_style  = 'width:' . $scene_width . $scene_width_unit . ';';
$wrapper_style .= $scene_max_width > 0 ? 'max-width:' . $scene_max_width . 'px;' : 'max-width:none;';
$wrapper_style .= $alignment_margins[ $scene_alignment ];
$wrapper_style .= '--graphic-data-scene-height:' . ( $scene_height > 0 ? $scene_height . 'px' : 'auto' ) . ';';
$wrapper_style .= 'background-color:' . $background_color . ';';
$wrapper_style .= $border_enabled ? 'border:' . $border_width . 'px solid ' . $border_color . ';' : 'border:none;';
$wrapper_style .= 'border-radius:' . $border_radius . 'px;';
$wrapper_style .= 'padding:' . $scene_padding . 'px;';
$wrapper_style .= 'box-sizing:border-box;';
$wrapper_style .= $border_radius > 0 ? 'overflow:hidden;' : 'overflow:visible;';
$wrapper_style .= 'scroll-margin-top:2rem;';

/**
 * Each block instance needs its own frontend target ID.
 *
 * This prevents two copies of the same Scene ID from rendering into the
 * same DOM target.
 */
$instance_id = wp_unique_id( 'scene-instance-' );

$target_id = 'targetSceneElement_' . $scene_id . '_' . $instance_id;

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'graphic-data-frontend-scene graphic-data-scene-display',
		'id'    => 'scene-' . $scene_id . '-' . $instance_id,
	)
);
?>

<div
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-scene-id="<?php echo esc_attr( $scene_id ); ?>"
	data-instance-id="<?php echo esc_attr( $instance_id ); ?>"
	data-target-id="<?php echo esc_attr( $target_id ); ?>"
	data-scene-height="<?php echo esc_attr( $scene_height ); ?>"
	style="<?php echo esc_attr( $wrapper_style ); ?>"
>
	<script type="application/json" class="graphic-data-scene-config"><?php echo wp_json_encode( $config, JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT ); // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?></script>
	<div
		id="<?php echo esc_attr( $target_id ); ?>"
		class="targetSceneElement graphic-data-block-scene-target"
		data-scene-id="<?php echo esc_attr( $scene_id ); ?>"
		data-instance-id="<?php echo esc_attr( $instance_id ); ?>"
		style="width: 100%; max-width: 100%;"
	></div>
</div>
