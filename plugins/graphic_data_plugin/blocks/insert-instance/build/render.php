<?php
/**
 * Dynamic render callback for the Graphic Data Instance block.
 *
 * Outputs a single instance tile card, matching the front-page tiles built in
 * themes/graphic_data_theme/index.php: tile image plus a title button that links
 * to the instance (overview scene, or legacy content URL), or a "Coming Soon"
 * label when the instance is not yet published. Draft instances render nothing,
 * as on the front page.
 */

$instance_post_id = isset( $attributes['instancePostId'] ) ? absint( $attributes['instancePostId'] ) : 0;

if ( ! $instance_post_id || 'instance' !== get_post_type( $instance_post_id )
	|| 'publish' !== get_post_status( $instance_post_id )
	|| metadata_exists( 'post', $instance_post_id, 'graphic_data_placeholder_id' ) ) {
	return '';
}

$instance_status = (string) get_post_meta( $instance_post_id, 'instance_status', true );
if ( 'Draft' === $instance_status ) {
	return '';
}
$is_published = 'Published' === $instance_status;

// Link target: same rules as the front-page tiles.
$instance_link = '';
if ( $is_published ) {
	if ( 'yes' === get_post_meta( $instance_post_id, 'instance_legacy_content', true ) ) {
		$instance_link = (string) get_post_meta( $instance_post_id, 'instance_legacy_content_url', true );
	} else {
		$overview_id   = absint( get_post_meta( $instance_post_id, 'instance_overview_scene', true ) );
		$overview_post = $overview_id ? get_post( $overview_id ) : null;
		if ( $overview_post ) {
			$instance_slug = (string) get_post_meta( $instance_post_id, 'instance_slug', true );
			$instance_link = get_site_url() . '/' . $instance_slug . '/' . $overview_post->post_name;
		}
	}
}

// Title, optionally split onto lines around the front-page break text.
$raw_title       = get_the_title( $instance_post_id );
$formatted_title = esc_html( $raw_title );
$settings        = get_option( 'graphic_data_settings' );
$break_text      = ( is_array( $settings ) && isset( $settings['front_page_break_text'] ) ) ? trim( $settings['front_page_break_text'] ) : '';
if ( '' !== $break_text && false !== strpos( $raw_title, $break_text ) ) {
	$title_parts = explode( $break_text, $raw_title, 2 );
	$before      = trim( $title_parts[0] );
	$after       = trim( $title_parts[1] );
	if ( '' !== $before && '' !== $after ) {
		$formatted_title = esc_html( $before ) . '<br>' . esc_html( $break_text ) . '<br>' . esc_html( $after );
	} elseif ( '' === $before ) {
		$formatted_title = esc_html( $break_text ) . '<br>' . esc_html( $after );
	} else {
		$formatted_title = esc_html( $before ) . '<br>' . esc_html( $break_text );
	}
}

$tile_image = (string) get_post_meta( $instance_post_id, 'instance_tile', true );

// Dimensions.
$allowed_width_units = array( '%', 'px', 'rem', 'vw' );
$tile_width          = isset( $attributes['instanceWidth'] ) ? max( 0, (float) $attributes['instanceWidth'] ) : 100;
$tile_width_unit     = isset( $attributes['instanceWidthUnit'] ) && in_array( $attributes['instanceWidthUnit'], $allowed_width_units, true )
	? $attributes['instanceWidthUnit']
	: '%';
$tile_max_width      = isset( $attributes['instanceMaxWidth'] ) ? max( 0, (float) $attributes['instanceMaxWidth'] ) : 360;
$tile_alignment      = isset( $attributes['instanceAlignment'] ) && in_array( $attributes['instanceAlignment'], array( 'left', 'center', 'right' ), true )
	? $attributes['instanceAlignment']
	: 'center';

$alignment_margins = array(
	'left'   => 'margin-left:0;margin-right:auto;',
	'center' => 'margin-left:auto;margin-right:auto;',
	'right'  => 'margin-left:auto;margin-right:0;',
);

// Theme colors come from the Customizer so the tile matches the front page,
// including inside the block editor where the theme's CSS is not loaded.
$button_bg   = sanitize_hex_color( get_theme_mod( 'theme_color_1', '#03386c' ) ) ?: '#03386c';
$button_text = sanitize_hex_color( get_theme_mod( 'theme_color_2', '#ffffff' ) ) ?: '#ffffff';

$wrapper_style  = 'width:' . $tile_width . $tile_width_unit . ';';
$wrapper_style .= $tile_max_width > 0 ? 'max-width:' . $tile_max_width . 'px;' : 'max-width:none;';
$wrapper_style .= $alignment_margins[ $tile_alignment ];
$wrapper_style .= '--graphic-data-instance-button-bg:' . $button_bg . ';';
$wrapper_style .= '--graphic-data-instance-button-text:' . $button_text . ';';

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'graphic-data-instance-tile' . ( $is_published ? '' : ' is-coming-soon' ),
		'style' => $wrapper_style,
	)
);
$allowed_title_html = array( 'br' => array() );
?>
<div <?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>>
	<?php if ( '' !== $tile_image ) : ?>
		<?php if ( $instance_link ) : ?>
			<a class="graphic-data-instance-tile__image-link" href="<?php echo esc_url( $instance_link ); ?>">
				<img class="graphic-data-instance-tile__image" src="<?php echo esc_url( $tile_image ); ?>" alt="<?php echo esc_attr( $raw_title ); ?>">
			</a>
		<?php else : ?>
			<img class="graphic-data-instance-tile__image" src="<?php echo esc_url( $tile_image ); ?>" alt="<?php echo esc_attr( $raw_title ); ?>">
		<?php endif; ?>
	<?php endif; ?>
	<div class="graphic-data-instance-tile__body">
		<?php if ( $instance_link ) : ?>
			<a class="graphic-data-instance-tile__button" href="<?php echo esc_url( $instance_link ); ?>"><?php echo wp_kses( $formatted_title, $allowed_title_html ); ?></a>
		<?php elseif ( $is_published ) : ?>
			<span class="graphic-data-instance-tile__button"><?php echo wp_kses( $formatted_title, $allowed_title_html ); ?></span>
		<?php else : ?>
			<span class="graphic-data-instance-tile__button graphic-data-instance-tile__button--soon">
				<span><?php echo wp_kses( $formatted_title, $allowed_title_html ); ?></span>
				<span class="graphic-data-instance-tile__soon-label"><?php esc_html_e( 'Coming Soon', 'graphic-data-plugin' ); ?></span>
			</span>
		<?php endif; ?>
	</div>
</div>
