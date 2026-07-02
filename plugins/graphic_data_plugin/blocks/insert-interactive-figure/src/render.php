<?php
/**
 * Dynamic render callback for the Graphic Data Figure block.
 */

$figure_id = isset( $attributes['figureId'] ) ? absint( $attributes['figureId'] ) : 0;

if ( ! $figure_id ) {
	return '';
}

$figure_path = get_post_meta( $figure_id, 'figure_path', true );

if ( $figure_path && 'Interactive' !== $figure_path ) {
	return '';
}

$interactive_arguments = get_post_meta( $figure_id, 'figure_interactive_arguments', true );

if ( empty( $interactive_arguments ) ) {
	return '';
}

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
		'class' => 'graphic-data-frontend-figure',
	)
);
?>

<div
	<?php echo $wrapper_attributes; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped ?>
	data-figure-id="<?php echo esc_attr( $figure_id ); ?>"
	data-instance-id="<?php echo esc_attr( $instance_id ); ?>"
	data-target-id="<?php echo esc_attr( $target_id ); ?>"
>
	<script type="application/json" class="graphic-data-interactive-arguments">
		<?php
		echo wp_json_encode(
			$interactive_arguments,
			JSON_HEX_TAG | JSON_HEX_AMP | JSON_HEX_APOS | JSON_HEX_QUOT
		);
		?>
	</script>

	<div
		id="<?php echo esc_attr( $target_id ); ?>"
		class="targetFigureElement graphic-data-block-plotly-target"
		data-figure-id="<?php echo esc_attr( $figure_id ); ?>"
		data-instance-id="<?php echo esc_attr( $instance_id ); ?>"
		style="width: 100%; max-width: 100%;"
	></div>
</div>