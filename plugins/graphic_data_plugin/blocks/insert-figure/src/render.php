<?php
/**
 * Dynamic render callback for the Graphic Data Figure block.
 */

$figure_id = isset( $attributes['figureId'] ) ? absint( $attributes['figureId'] ) : 0;

if ( ! $figure_id ) {
	return '';
}

$allowed_width_units = array( '%', 'px', 'rem', 'vw' );
$figure_width       = isset( $attributes['figureWidth'] ) ? max( 0, (float) $attributes['figureWidth'] ) : 100;
$figure_width_unit  = isset( $attributes['figureWidthUnit'] ) && in_array( $attributes['figureWidthUnit'], $allowed_width_units, true )
	? $attributes['figureWidthUnit']
	: '%';
$figure_max_width   = isset( $attributes['figureMaxWidth'] ) ? max( 0, (float) $attributes['figureMaxWidth'] ) : 0;
$figure_height      = isset( $attributes['figureHeight'] ) ? max( 0, (float) $attributes['figureHeight'] ) : 0;
$figure_alignment   = isset( $attributes['figureAlignment'] ) && in_array( $attributes['figureAlignment'], array( 'left', 'center', 'right' ), true )
	? $attributes['figureAlignment']
	: 'center';

$alignment_margins = array(
	'left'   => 'margin-left:0;margin-right:auto;',
	'center' => 'margin-left:auto;margin-right:auto;',
	'right'  => 'margin-left:auto;margin-right:0;',
);

$wrapper_style  = 'width:' . $figure_width . $figure_width_unit . ';';
$wrapper_style .= $figure_max_width > 0 ? 'max-width:' . $figure_max_width . 'px;' : 'max-width:none;';
$wrapper_style .= $alignment_margins[ $figure_alignment ];
$wrapper_style .= '--graphic-data-figure-height:' . ( $figure_height > 0 ? $figure_height . 'px' : 'auto' ) . ';';
$wrapper_style .= 'scroll-margin-top:2rem;';

/**
 * Each block instance needs its own frontend target ID.
 *
 * This prevents two copies of the same Figure ID from rendering into the
 * same DOM target.
 */
$instance_id = isset( $attributes['instanceId'] ) ? sanitize_key( $attributes['instanceId'] ) : '';

if ( empty( $instance_id ) ) {
	$instance_id = wp_unique_id( 'figure-instance-' );
}

$target_id = 'targetFigureElement_' . $figure_id . '_' . $instance_id;

$wrapper_attributes = get_block_wrapper_attributes(
	array(
		'class' => 'graphic-data-frontend-figure graphic-data-figure-display',
		'id'    => 'figure-' . $figure_id,
	)
);
?>

<div
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-figure-id="<?php echo esc_attr( $figure_id ); ?>"
	data-instance-id="<?php echo esc_attr( $instance_id ); ?>"
	data-target-id="<?php echo esc_attr( $target_id ); ?>"
	data-figure-height="<?php echo esc_attr( $figure_height ); ?>"
	style="<?php echo esc_attr( $wrapper_style ); ?>"
>
	<div
		id="<?php echo esc_attr( $target_id ); ?>"
		class="targetFigureElement graphic-data-block-plotly-target"
		data-figure-id="<?php echo esc_attr( $figure_id ); ?>"
		data-instance-id="<?php echo esc_attr( $instance_id ); ?>"
		style="width: 100%; max-width: 100%;"
	></div>
</div>
