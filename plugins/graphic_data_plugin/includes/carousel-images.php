<?php
/** Display derivatives for carousel Media Library selections. Originals are never modified. */
add_action( 'after_setup_theme', function () {
	add_image_size( 'graphic-data-carousel', 2048, 2048, false );
} );

add_action( 'wp_ajax_graphic_data_carousel_image', function () {
	check_ajax_referer( 'graphic_data_carousel_image', 'nonce' );
	$id = absint( $_POST['attachment_id'] ?? 0 );
	if ( ! current_user_can( 'upload_files' ) || ! current_user_can( 'edit_post', $id ) ) {
		wp_send_json_error( array( 'message' => 'You cannot use this attachment.' ), 403 );
	}
	if ( ! wp_attachment_is_image( $id ) ) {
		wp_send_json_error( array( 'message' => 'Choose an image from the Media Library.' ), 400 );
	}
	$metadata = wp_get_attachment_metadata( $id );
	if ( ! is_array( $metadata ) || empty( $metadata['width'] ) || empty( $metadata['height'] ) ) {
		wp_send_json_error( array( 'message' => 'This image has no usable size information. Choose a raster image such as JPEG, PNG, or WebP.' ), 400 );
	}
	if ( max( $metadata['width'], $metadata['height'] ) > 2048 && empty( $metadata['sizes']['graphic-data-carousel'] ) ) {
		$editor = wp_get_image_editor( get_attached_file( $id ) );
		if ( is_wp_error( $editor ) ) {
			wp_send_json_error( array( 'message' => 'WordPress could not open this image for resizing.' ), 400 );
		}
		$resized = $editor->resize( 2048, 2048, false );
		if ( is_wp_error( $resized ) ) {
			wp_send_json_error( array( 'message' => 'WordPress could not resize this image.' ), 400 );
		}
		$result = $editor->save( $editor->generate_filename( 'carousel-2048' ) );
		if ( is_wp_error( $result ) ) {
			wp_send_json_error( array( 'message' => 'WordPress could not save the display copy.' ), 500 );
		}
		$metadata['sizes']['graphic-data-carousel'] = array(
			'file' => wp_basename( $result['path'] ),
			'width' => $result['width'],
			'height' => $result['height'],
			'mime-type' => $result['mime-type'],
		);
		wp_update_attachment_metadata( $id, $metadata );
	}
	$image = wp_get_attachment_image_src( $id, 'graphic-data-carousel' );
	if ( ! $image || max( $image[1], $image[2] ) > 2048 ) {
		wp_send_json_error( array( 'message' => 'A display copy within the size limit could not be prepared.' ), 500 );
	}
	// Limit both dimensions of responsive candidates, including portrait originals.
	$limit_sources = static function ( $sources ) {
		return array_filter( $sources, static function ( $source ) {
			return $source['value'] <= 2048;
		} );
	};
	add_filter( 'wp_calculate_image_srcset', $limit_sources );
	$srcset = wp_get_attachment_image_srcset( $id, 'graphic-data-carousel' );
	remove_filter( 'wp_calculate_image_srcset', $limit_sources );
	// WordPress uses widths in srcset; cap portrait widths to the resized image width too.
	$candidates = array_filter( explode( ', ', $srcset ?: '' ), static function ( $candidate ) use ( $image ) {
		return preg_match( '/\s(\d+)w$/', $candidate, $match ) && (int) $match[1] <= $image[1];
	} );
	wp_send_json_success( array( 'src' => $image[0], 'width' => $image[1], 'height' => $image[2], 'srcset' => implode( ', ', $candidates ) ) );
} );
