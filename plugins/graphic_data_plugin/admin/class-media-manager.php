<?php

/**
 * Manages custom attachment fields in the WordPress Media Library.
 *
 * Adds an Instance association dropdown to the media editor and persists
 * the selected value as `graphic_data_instance_id` post meta on the attachment.
 */
class Graphic_Data_Media_Manager {
	/**
	 * Add Instance dropdown to Media Library attachment fields.
	 *
	 * Hooked to `attachment_fields_to_edit`. Builds a `<select>` populated
	 * with all published Instance posts and pre-selects the value stored in
	 * the `graphic_data_instance_id` post meta for the current attachment.
	 *
	 * @param array   $form_fields Existing attachment form fields.
	 * @param WP_Post $post        The attachment post object being edited.
	 * @return array The form fields array with the Instance dropdown appended.
	 */
	public function add_instance_field_to_media( array $form_fields, WP_Post $post ): array {
		// Fetch all Instance posts.
		global $wpdb;
		$instances = array(); // Initialize as empty array.

		$current_user = wp_get_current_user();

		// Check if user is author.
		$user = wp_get_current_user();
		$user_role = $user->roles[0];

		if ( 'author' == $user_role ) {
			// Get assigned instances for the author.
			$user_instances = get_user_meta( $current_user->ID, 'assigned_instances', true );

			// Ensure user_instances is a non-empty array before querying.
			if ( ! empty( $user_instances ) && is_array( $user_instances ) ) {
				// Sanitize instance IDs.
				$instance_ids = array_map( 'absint', $user_instances );

				// Create placeholders for prepare().
				$placeholders = implode( ', ', array_fill( 0, count( $instance_ids ), '%d' ) );

				// Build query with placeholders.
				$query = "
					SELECT ID, post_title
					FROM {$wpdb->posts}
					WHERE post_type = 'instance'
					AND post_status = 'publish'
					AND ID IN ($placeholders)
					ORDER BY post_title ASC";

				// Query only the assigned instances.
				$instances = $wpdb->get_results(
					$wpdb->prepare(
						$query, // phpcs:ignore WordPress.DB.PreparedSQL.NotPrepared
						...$instance_ids
					)
				);
			}
			// If author has no assigned instances, $instances remains empty, so only "All Instances" shows.

		} else {
			// Administrators or other roles see all instances.
			$instances = $wpdb->get_results(
				"
				SELECT ID, post_title
				FROM {$wpdb->posts}
				WHERE post_type = 'instance'
				AND post_status = 'publish'
				ORDER BY post_title ASC"
			);
		}

		$saved_id = get_post_meta( $post->ID, 'graphic_data_instance_id', true );

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
			'label' => 'Instance',
			'input' => 'html',
			'html'  => $select,
	//		'helps' => 'Associate this media item with an Instance.',
		];

		return $form_fields;
	}

	/**
	 * Save the Instance dropdown value when an attachment is updated.
	 *
	 * Hooked to `attachment_fields_to_save`. WordPress passes the post as an
	 * array (ARRAY_A) via `get_post( $id, ARRAY_A )` before applying this
	 * filter, so `$post` is an array, not a WP_Post object. Reads `instance_id`
	 * from the submitted attachment fields and either updates or removes the
	 * `graphic_data_instance_id` post meta on the attachment accordingly.
	 *
	 * @param array $post       The attachment post data array being saved.
	 * @param array $attachment The attachment fields submitted from the media editor.
	 * @return array The unmodified post array (required by the filter).
	 */
	public function save_instance_field_to_media( array $post, array $attachment ): array {
		if ( isset( $attachment['instance_id'] ) ) {
			$instance_id = absint( $attachment['instance_id'] );

			if ( $instance_id > 0 ) {
				update_post_meta( $post['ID'], 'graphic_data_instance_id', $instance_id );
			} else {
				// "— None —" selected: remove the meta entirely.
				delete_post_meta( $post['ID'], 'graphic_data_instance_id' );
			}
		}

		return $post;
	}
}
