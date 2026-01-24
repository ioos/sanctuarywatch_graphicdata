<?php
defined( 'ABSPATH' ) || exit;
$graphic_data_instance_num = get_post_meta( get_the_ID(), 'scene_location', true );

$graphic_data_single_instance = graphic_data_single_instance_check();
if ( false != $graphic_data_single_instance ) {
	$graphic_data_instance_num = $graphic_data_single_instance['instanceID'];
}

$graphic_data_instance_footer = intval( get_post_meta( $graphic_data_instance_num, 'instance_footer_columns', true ) );
$graphic_data_settings = get_option( 'graphic_data_settings', [] );

$graphic_data_sitewide_footer_title = ( ! empty( $graphic_data_settings['sitewide_footer_title'] ?? '' ) ) ? $graphic_data_settings['sitewide_footer_title'] : '';
$graphic_data_sitewide_footer = ( ! empty( $graphic_data_settings['site_footer'] ?? '' ) ) ? $graphic_data_settings['site_footer'] : '';
if ( '' == $graphic_data_sitewide_footer_title || '' == $graphic_data_sitewide_footer ) {
	$graphic_data_sitewide_footer_present = false;
} else {
	$graphic_data_sitewide_footer_present = true;
}

if ( ( $graphic_data_instance_footer > 0 ) || ( true == $graphic_data_sitewide_footer_present ) ) {
	echo '<footer class="site-footer" >';
	echo '<div class="container" style="margin: 0 auto; max-width: 1200px;">';
	echo '<div class="row">';

	if ( $graphic_data_instance_footer > 0 ) {
		for ( $graphic_data_i = 1; $graphic_data_i <= $graphic_data_instance_footer; $graphic_data_i++ ) {

			$graphic_data_target_footer_column = 'instance_footer_column' . $graphic_data_i;

			$graphic_data_instance_footer = get_post_meta( $graphic_data_instance_num, $graphic_data_target_footer_column, true );
			if ( '' != $graphic_data_instance_footer ) {
				if ( '' !== $graphic_data_instance_footer[ 'instance_footer_column_title' . $graphic_data_i ] && '' !== $graphic_data_instance_footer[ 'instance_footer_column_content' . $graphic_data_i ] ) {
					// Apply flex styling to .col-sm to center its direct child (the new wrapper).
					echo '<div class="col-sm footer-column">';
					// This wrapper will be centered in .col-sm, and its text content will be left-aligned.
					echo '  <div class="footer-content-wrapper">';
					echo '    <h6 class="footer-column-title">' . esc_html( $graphic_data_instance_footer[ 'instance_footer_column_title' . $graphic_data_i ] ) . '</h6>';
					echo '    <div class="footer_component">';
					echo wp_kses_post( $graphic_data_instance_footer[ 'instance_footer_column_content' . $graphic_data_i ] );
					echo '    </div>';
					echo '  </div>'; // Closing footer-content-wrapper.
					echo '</div>';
				}
			}
		}
	}

	if ( true == $graphic_data_sitewide_footer_present ) {
		// Apply flex styling to .col-sm to center its direct child (the new wrapper).
		echo '<div class="col-sm footer-column">';
		// This wrapper will be centered in .col-sm, and its text content will be left-aligned.
		echo '  <div class="footer-content-wrapper">';
		echo '    <h6 class="footer-column-title">' . esc_html( $graphic_data_sitewide_footer_title ) . '</h6>';
		echo '    <div class="footer_component">';
		echo wp_kses_post( $graphic_data_sitewide_footer );
		echo '    </div>';
		echo '  </div>'; // Closing footer-content-wrapper.
		echo '</div>';
	}

	echo '</div>';
	echo '</div>';
	echo '</footer>';
}

wp_footer();
echo '</body>';
echo '</html>';
