<?php

function graphic_data_delete_figure_folder( $post_id ) {

	if ( get_post_type( $post_id ) !== 'figure' ) {
		return;
	}

	$folder_path = WP_CONTENT_DIR . '/data/figure_' . $post_id;

	if ( ! is_dir( $folder_path ) ) {
		return;
	}

	$delete_directory = function ( $directory ) use ( &$delete_directory ) {

		$items = scandir( $directory );

		if ( false === $items ) {
			return false;
		}

		foreach ( $items as $item ) {

			if ( '.' === $item || '..' === $item ) {
				continue;
			}

			$item_path = $directory . DIRECTORY_SEPARATOR . $item;

			if ( is_dir( $item_path ) && ! is_link( $item_path ) ) {
				$delete_directory( $item_path );
			} else {
				unlink( $item_path );
			}
		}

		return rmdir( $directory );
	};

	$delete_directory( $folder_path );
}

add_action( 'before_delete_post', 'graphic_data_delete_figure_folder' );