<?php
/**
 * Dynamic render callback for the Graphic Data Modal block.
 */

$modal_id = isset( $attributes['modalId'] ) ? absint( $attributes['modalId'] ) : 0;

if ( ! $modal_id ) {
	return '';
}

$allowed_width_units = array( '%', 'px', 'rem', 'vw' );
$modal_width       = isset( $attributes['modalWidth'] ) ? max( 0, (float) $attributes['modalWidth'] ) : 100;
$modal_width_unit  = isset( $attributes['modalWidthUnit'] ) && in_array( $attributes['modalWidthUnit'], $allowed_width_units, true )
	? $attributes['modalWidthUnit']
	: '%';
$modal_max_width   = isset( $attributes['modalMaxWidth'] ) ? max( 0, (float) $attributes['modalMaxWidth'] ) : 0;
$modal_height      = isset( $attributes['modalHeight'] ) ? max( 0, (float) $attributes['modalHeight'] ) : 0;
$modal_alignment   = isset( $attributes['modalAlignment'] ) && in_array( $attributes['modalAlignment'], array( 'left', 'center', 'right' ), true )
	? $attributes['modalAlignment']
	: 'center';
$background_color   = isset( $attributes['modalBackgroundColor'] ) ? sanitize_hex_color( $attributes['modalBackgroundColor'] ) : '';
$border_enabled     = ! empty( $attributes['modalBorderEnabled'] );
$border_color       = isset( $attributes['modalBorderColor'] ) ? sanitize_hex_color( $attributes['modalBorderColor'] ) : '#000000';
$border_width       = isset( $attributes['modalBorderWidth'] ) ? max( 0, (float) $attributes['modalBorderWidth'] ) : 1;
$border_radius      = isset( $attributes['modalBorderRadius'] ) ? max( 0, (float) $attributes['modalBorderRadius'] ) : 0;
$modal_padding     = isset( $attributes['modalPadding'] ) ? max( 0, (float) $attributes['modalPadding'] ) : 0;

$background_color = $background_color ? $background_color : 'transparent';
$border_color     = $border_color ? $border_color : '#000000';

$alignment_margins = array(
	'left'   => 'margin-left:0;margin-right:auto;',
	'center' => 'margin-left:auto;margin-right:auto;',
	'right'  => 'margin-left:auto;margin-right:0;',
);

$wrapper_style  = 'width:' . $modal_width . $modal_width_unit . ';';
$wrapper_style .= $modal_max_width > 0 ? 'max-width:' . $modal_max_width . 'px;' : 'max-width:none;';
$wrapper_style .= $alignment_margins[ $modal_alignment ];
$wrapper_style .= '--graphic-data-modal-height:' . ( $modal_height > 0 ? $modal_height . 'px' : 'auto' ) . ';';
$wrapper_style .= 'background-color:' . $background_color . ';';
$wrapper_style .= $border_enabled ? 'border:' . $border_width . 'px solid ' . $border_color . ';' : 'border:none;';
$wrapper_style .= 'border-radius:' . $border_radius . 'px;';
$wrapper_style .= 'padding:' . $modal_padding . 'px;';
$wrapper_style .= 'box-sizing:border-box;';
$wrapper_style .= $border_radius > 0 ? 'overflow:hidden;' : 'overflow:visible;';
$wrapper_style .= 'scroll-margin-top:2rem;';

/**
 * Each block instance needs its own frontend target ID.
 *
 * This prevents two copies of the same Modal ID from rendering into the
 * same DOM target.
 */
$instance_id = wp_unique_id( 'modal-instance-' );

$target_id = 'targetModalElement_' . $modal_id . '_' . $instance_id;

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'graphic-data-frontend-modal graphic-data-modal-display',
		'id'    => 'modal-' . $modal_id . '-' . $instance_id,
	)
);
?>

<div
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-modal-id="<?php echo esc_attr( $modal_id ); ?>"
	data-plugin-url="<?php echo esc_url( plugin_dir_url( GRAPHIC_DATA_PLUGIN_DIR . 'graphic_data_plugin.php' ) ); ?>"
	data-instance-id="<?php echo esc_attr( $instance_id ); ?>"
	data-target-id="<?php echo esc_attr( $target_id ); ?>"
	data-modal-height="<?php echo esc_attr( $modal_height ); ?>"
	style="<?php echo esc_attr( $wrapper_style ); ?>"
>
	<div
		id="<?php echo esc_attr( $target_id ); ?>"
		class="targetModalElement graphic-data-block-modal-target"
		data-modal-id="<?php echo esc_attr( $modal_id ); ?>"
		data-instance-id="<?php echo esc_attr( $instance_id ); ?>"
		style="width: 100%; max-width: 100%;"
	></div>
</div>
