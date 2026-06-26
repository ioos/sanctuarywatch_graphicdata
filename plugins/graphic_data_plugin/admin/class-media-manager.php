<?php

class Graphic_Data_Media_Manager {
	/**
	 * Add Instance dropdown to Media Library attachment fields.
	 */
	public function add_instance_field_to_media( array $form_fields, WP_Post $post ): array {
		// Fetch all Instance posts.
		$instances = get_posts(
			[
				'post_type'      => 'instance',   // <-- your CPT slug
				'post_status'    => 'publish',
				'posts_per_page' => -1,
				'orderby'        => 'title',
				'order'          => 'ASC',
			]
		);

		$saved_id = get_post_meta( $post->ID, '_instance_id', true );

		// Build the <select> HTML.
		$select  = '<select name="attachments[' . $post->ID . '][instance_id]" id="attachments-' . $post->ID . '-instance_id">';
		$select .= '<option value="">— None —</option>';

		foreach ( $instances as $instance ) {
			$selected = selected( (int) $saved_id, $instance->ID, false );
			$select  .= '<option value="' . esc_attr( $instance->ID ) . '"' . $selected . '>'
					. esc_html( $instance->post_title )
					. '</option>';
		}

		$select .= '</select>';

		$form_fields['instance_id'] = [
			'label' => __( 'Instance', 'your-textdomain' ),
			'input' => 'html',
			'html'  => $select,
			'helps' => __( 'Associate this media item with an Instance post.', 'your-textdomain' ),
		];

		return $form_fields;
	}
	add_filter( 'attachment_fields_to_edit', 'myplugin_add_instance_field_to_media', 10, 2 );


	/**
	 * Save the Instance dropdown value when an attachment is updated.
	 */
	public function save_instance_field_to_media( WP_Post $post, array $attachment ): WP_Post {
		if ( isset( $attachment['instance_id'] ) ) {
			$instance_id = absint( $attachment['instance_id'] );

			if ( $instance_id > 0 ) {
				update_post_meta( $post->ID, '_instance_id', $instance_id );
			} else {
				// "— None —" selected: remove the meta entirely.
				delete_post_meta( $post->ID, '_instance_id' );
			}
		}

		return $post;
	}
	add_filter( 'attachment_fields_to_save', 'myplugin_save_instance_field_to_media', 10, 2 );
}
