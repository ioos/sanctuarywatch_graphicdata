<?php

/**
 * Manages custom attachment fields in the WordPress Media Library.
 *
 * Adds an Instance association dropdown to the media editor and persists
 * the selected value as `graphic_data_instance_id` post meta on the attachment.
 */
class Graphic_Data_Media_Manager {

	/**
	 * Query published Instance posts visible to the current user.
	 *
	 * Authors receive only the instances listed in their `assigned_instances`
	 * user meta. All other roles receive every published Instance post.
	 * Returns an empty array when an author has no assigned instances.
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 * @return array Array of objects with `ID` and `post_title` properties,
	 *               ordered by post title ascending.
	 */
	public function create_instance_list() {
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
		return $instances;
	}

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

		$instances = $this->create_instance_list();

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
			// 'helps' => 'Associate this media item with an Instance.',
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

	/**
	 * Enqueue the media grid filter script and pass instance data to it.
	 *
	 * Hooked to `admin_enqueue_scripts`. Only runs on the upload.php screen.
	 * Depends on `media-views` so it loads after the WP media backbone stack.
	 *
	 * @return void
	 */
	public function enqueue_instance_filter_script(): void {
		$screen = get_current_screen();
		if ( ! $screen || 'upload' !== $screen->id ) {
			return;
		}

		$instances = $this->create_instance_list();

		$instance_data = array_map(
			function ( $instance ) {
				return [
					'id'    => absint( $instance->ID ),
					'title' => $instance->post_title,
				];
			},
			$instances
		);

		wp_enqueue_script(
			'graphic-data-media-filter',
			plugin_dir_url( __FILE__ ) . 'js/media-filter.js',
			[ 'media-views' ],
			GRAPHIC_DATA_PLUGIN_VERSION,
			true
		);

		wp_localize_script(
			'graphic-data-media-filter',
			'graphicDataMediaFilter',
			[ 'instances' => $instance_data ]
		);
	}

	/**
	 * Render the Instance filter dropdown in the media list view toolbar.
	 *
	 * Hooked to `restrict_manage_posts`. Only outputs on the attachment
	 * post type screen.
	 *
	 * @param string $post_type The current post type.
	 * @return void
	 */
	public function render_instance_filter_dropdown( string $post_type ): void {
		if ( 'attachment' !== $post_type ) {
			return;
		}

		global $wpdb;
		$instances = $wpdb->get_results(
			"SELECT ID, post_title
			FROM {$wpdb->posts}
			WHERE post_type = 'instance'
			AND post_status = 'publish'
			ORDER BY post_title ASC"
		);

		$selected = isset( $_GET['graphic_data_instance_id'] )
			? absint( $_GET['graphic_data_instance_id'] )
			: 0;

		echo '<select name="graphic_data_instance_id">';
		echo '<option value="-1">Instances Not Selected</option>';
		echo '<option value="0">Available Instances</option>';
		foreach ( $instances as $instance ) {
			printf(
				'<option value="%d"%s>%s</option>',
				absint( $instance->ID ),
				selected( $selected, $instance->ID, false ),
				esc_html( $instance->post_title )
			);
		}
		echo '</select>';
	}

	/**
	 * Apply the Instance filter to the media list view query.
	 *
	 * Hooked to `parse_query`. Adds a meta_query clause when
	 * graphic_data_instance_id is present in the request.
	 *
	 * @param WP_Query $query The current query object.
	 * @return void
	 */
	public function filter_media_by_instance( WP_Query $query ): void {
		global $pagenow;

		if ( 'upload.php' !== $pagenow || empty( $_GET['graphic_data_instance_id'] ) ) {
			return;
		}

		$instance_id = absint( $_GET['graphic_data_instance_id'] );
		if ( $instance_id < 1 ) {
			return;
		}

		$query->set(
			'meta_query',
			[
				[
					'key'   => 'graphic_data_instance_id',
					'value' => $instance_id,
					'type'  => 'NUMERIC',
				],
			]
		);
	}

	/**
	 * Apply the Instance filter to the media grid view (AJAX) query.
	 *
	 * Hooked to `ajax_query_attachments_args`. WordPress strips unknown keys
	 * from the query via array_intersect_key() before this filter runs, so
	 * graphic_data_instance_id must be read directly from $_REQUEST['query'].
	 *
	 * Sentinel values:
	 *  - 'all'       : media in user-accessible instances OR with no instance (union)
	 *  - 'available' : media tagged with a user-accessible instance only
	 *  - 'none'      : media with no graphic_data_instance_id meta at all
	 *  - numeric     : media tagged with that specific instance ID
	 *
	 * @param array $query Existing query args for WP_Query.
	 * @return array Modified query args.
	 */
	public function filter_ajax_media_by_instance( array $query ): array {
		$raw = isset( $_REQUEST['query']['graphic_data_instance_id'] )
			? sanitize_text_field( wp_unslash( $_REQUEST['query']['graphic_data_instance_id'] ) )
			: '';

		if ( 'none' === $raw ) {
			$query['meta_query'] = [
				[
					'key'     => 'graphic_data_instance_id',
					'compare' => 'NOT EXISTS',
				],
			];
			return $query;
		}

		if ( 'available' === $raw || 'all' === $raw ) {
			$instances   = $this->create_instance_list();
			$instance_ids = array_map( fn( $i ) => absint( $i->ID ), $instances );

			$has_instances = ! empty( $instance_ids );

			if ( 'available' === $raw ) {
				if ( ! $has_instances ) {
					return $query;
				}
				$query['meta_query'] = [
					[
						'key'     => 'graphic_data_instance_id',
						'value'   => $instance_ids,
						'compare' => 'IN',
						'type'    => 'NUMERIC',
					],
				];
			} else {
				// 'all': union of user-accessible instances and untagged media.
				$clauses = [
					'relation' => 'OR',
					[
						'key'     => 'graphic_data_instance_id',
						'compare' => 'NOT EXISTS',
					],
				];
				if ( $has_instances ) {
					$clauses[] = [
						'key'     => 'graphic_data_instance_id',
						'value'   => $instance_ids,
						'compare' => 'IN',
						'type'    => 'NUMERIC',
					];
				}
				$query['meta_query'] = $clauses;
			}
			return $query;
		}

		$instance_id = absint( $raw );

		if ( $instance_id < 1 ) {
			return $query;
		}

		$query['meta_query'] = [
			[
				'key'   => 'graphic_data_instance_id',
				'value' => $instance_id,
				'type'  => 'NUMERIC',
			],
		];

		return $query;
	}
}
