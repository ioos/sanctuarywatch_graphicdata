<?php
/**
 * Register class that defines the tutorial content
 *
 * @package Graphic_Data_Plugin
 */

/**
 * Class Graphic_Data_Tutorial_Content
 *
 * Defines methods that creates or deletes tutorial content.
 *
 * @since 1.0.0
 */
class Graphic_Data_Tutorial_Content {

	/**
	 * Synchronize tutorial content based on plugin settings.
	 *
	 * Checks the 'tutorial_content' setting and takes action accordingly:
	 * - If set to 0 and tutorial content hasn't been deleted, deletes all tutorial instance types.
	 * - If set to 1 and tutorial content doesn't exist, creates tutorial instance types.
	 *
	 * Updates the 'tutorial_content_present' flag to track the current state.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function check_tutorial_content_status() {
		$options = get_option( 'graphic_data_settings' );
		$tutorial_content = isset( $options['tutorial_content'] ) ? $options['tutorial_content'] : 0;
		switch ( $tutorial_content ) {
			// no tutorial content wanted. If it hasn't been done already, delete all existing tutorial content.
			case 0:
				if ( ( ! isset( $options['tutorial_content_present'] ) ) || 0 == $options['tutorial_content_present'] ) {
					$this->delete_instance_types();
					$options['tutorial_content'] = 0;
					update_option( 'graphic_data_settings', $options );
				}
				break;
			// Tutorial content wanted. If it hasn't been done already, create tutorial content.
			case 1:
				if ( ( ! isset( $options['tutorial_content_present'] ) ) || 0 == $options['tutorial_content_present'] ) {
					$this->create_instance_types();
					$options['tutorial_content_present'] = 1;
					update_option( 'graphic_data_settings', $options );
				}
				break;
		}
	}

	/**
	 * Create example instance type taxonomy terms for the tutorial.
	 *
	 * Creates two sample instance type terms with predefined names, slugs,
	 * and descriptions. Sets appropriate term meta including display order
	 * and navbar names.
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 * @return void
	 */
	public function create_instance_types() {
		global $wpdb;

		$term_name = [ 'Instance Type Example 1', 'Instance Type Example 2' ];
		$term_slug = [ 'tutorial-instance-example-1', 'tutorial-instance-example-2' ];
		$term_description = [
			'This is an example instance type. ' .
			'You must have at least one instance type and each instance type contains one or more instances.',
			'This is a second example instance type.',
		];
		$instance_navbar_name = [ 'Example 1', 'Example 2' ];
		// Find current max value of instance order in the database (which really should be called instance type order).
		$max_instance_order = $wpdb->get_var(
			"SELECT MAX(CAST(meta_value AS UNSIGNED)) 
			FROM {$wpdb->termmeta} 
			WHERE meta_key = 'instance_order'"
		);
		$processed_max_order = null !== $max_instance_order ? (int) $max_instance_order : 0;

		for ( $i = 0; $i < 2; $i++ ) {
			$args = array(
				'slug' => $term_slug[ $i ],
				'description' => $term_description[ $i ],
			);

			$term = wp_insert_term( $term_name[ $i ], 'instance_type', $args );
			if ( ! is_wp_error( $term ) ) {
				update_term_meta( $term['term_id'], 'instance_order', $processed_max_order + $i + 1 );
				update_term_meta( $term['term_id'], 'instance_navbar_name', $instance_navbar_name [ $i ] );
				update_term_meta( $term['term_id'], 'tutorial_instance_type_id', $i + 1 );
			}
		}
	}

	/**
	 * Deletes all tutorial instance type terms from the database.
	 *
	 * Finds all taxonomy terms that have the 'tutorial_instance_type_id' meta key
	 * and removes them along with their associated metadata. Uses wp_delete_term()
	 * which handles cleanup of wp_terms, wp_term_taxonomy, and wp_termmeta tables.
	 *
	 * @since 1.0.0
	 *
	 * @global wpdb $wpdb WordPress database abstraction object.
	 *
	 * @return void
	 */
	public function delete_instance_types() {
		global $wpdb;

		// Step 1: Get all term IDs associated with the tutorial (they'll have a value for tutorial_instance_type_id).
		$term_ids = $wpdb->get_col(
			$wpdb->prepare(
				"SELECT DISTINCT term_id 
				FROM {$wpdb->termmeta} 
				WHERE meta_key = %s",
				'tutorial_instance_type_id'
			)
		);

		// Step 2: Delete each term (this also deletes associated metadata).
		if ( ! empty( $term_ids ) ) {
			foreach ( $term_ids as $term_id ) {
				// wp_delete_term() handles wp_terms, wp_term_taxonomy, and wp_termmeta.
				// But we need the taxonomy, so we need to find it first.
				$term = get_term( $term_id );

				if ( $term && ! is_wp_error( $term ) ) {
					wp_delete_term( $term_id, $term->taxonomy );
				}
			}
		}
	}

	/**
	 * Create example instances for the tutorial.
	 *
	 * @return void
	 */
	public function create_instances() {
		// get current user ID or default to first user if no user is logged in.
		$current_user_id = get_current_user_id();
		if ( 0 === $current_user_id ) {

			$users = get_users(
				array(
					'number'  => 1,
					'orderby' => 'ID',
					'order'   => 'ASC',
				)
			);

			if ( ! empty( $users ) ) {
				$current_user_id = $users[0]->ID;
			}
		}

		$post_title = [ 'Example Instance 1', 'Example Instance 2', 'Example Instance 3' ];
		$instance_short_title = [ 'Example 1', 'Example 2', 'Example 3' ];
		$instance_slug = [ 'example-instance-1', 'example-instance-2', 'example-instance-3' ];
		$instance_type = [ 1, 1, 2 ];
		$instance_status = 'Published';
		// instance_tile.
		$instance_mobile_tile_background_color = '#f0f0f0';
		$instance_mobile_tile_text_color = '#000000';
		$instance_footer_columns = 2;
		$instance_footer_column1 = array(
			'instance_footer_column_title1' => 'First footer column',
			'instance_footer_column_content1' => 'You can have between zero and three footer columns that are unique to each instance. Here is an example of the first column.',
		);
		$instance_footer_column2 = array(
			'instance_footer_column_title2' => 'Second footer column',
			'instance_footer_column_content2' => '<p>Here is an example of the second column.</p>',
		);
		$instance_footer_column3 = array(
			'instance_footer_column_title3' => '',
			'instance_footer_column_content3' => '',
		);

		$post_data = array(
			'post_title'   => 'Example Instance 1',
			'post_type'    => 'instance',
			'post_status'  => 'publish',
			'post_author'  => $current_user_id,
		);

		// Insert the post and get its ID.
		$post_id = wp_insert_post( $post_data );

		// Check if post was created successfully.
		if ( ! is_wp_error( $post_id ) ) {
			// Add post meta.
/*
			instance_short_title
			instance_slug
			instance_type
			instance_status
				// instance_tile
instance_mobile_tile_background_color #f0f0f0
instance_mobile_tile_text_color #000000
instance_footer_columns 2 
instance_footer_column1 a:2:{s:29:"instance_footer_column_title1";s:19:"First footer column";s:31:"instance_footer_column_content1";s:124:"You can have between zero and three footer columns that are unique to each instance. Here is an example of the first column.";}
instance_footer_column2 a:2:{s:29:"instance_footer_column_title2";s:20:"Second footer column";s:31:"instance_footer_column_content2";s:47:"<p>Here is an example of the second column.</p>";}
instance_footer_column3  a:2:{s:29:"instance_footer_column_title3";s:0:"";s:31:"instance_footer_column_content3";s:0:"";}
*/
			update_post_meta( $post_id, 'instance_legacy_content', 'no' );
			update_post_meta( $post_id, 'instance_footer_columns', 0 );
		}
	}

}
