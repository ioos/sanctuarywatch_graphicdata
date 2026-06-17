<?php
/**
 * Register class that defines Graphic Data plugin only content
 *
 * @package Graphic_Data_Plugin
 */

/**
 * Class Graphic_Data_Plugin_Only_Content
 *
 * Defines methods that content when the Graphic Data plugin is used without the theme.
 *
 * @since 1.0.0
 */
class Graphic_Data_Plugin_Only_Content {

	public function create_placeholder_instance_type() {
		global $wpdb;

		$term_name = 'Graphic Data Placeholder Instance Type';
		$term_slug = 'graphic-data-placeholder-instance-type';
		$term_description = 'This instance type is a placeholder used in cases where the Graphic Data theme is not activated.';
		$instance_navbar_name = 'Placeholder';
		// Find current max value of instance order in the database (which really should be called instance type order).
		$max_instance_order = $wpdb->get_var(
			"SELECT MAX(CAST(meta_value AS UNSIGNED)) 
			FROM {$wpdb->termmeta} 
			WHERE meta_key = 'instance_order'"
		);
		$processed_max_order = null !== $max_instance_order ? (int) $max_instance_order : 0;

		$args = array(
			'slug' => $term_slug,
			'description' => $term_description,
		);

		$term = wp_insert_term( $term_name, 'instance_type', $args );
		if ( ! is_wp_error( $term ) ) {
			update_term_meta( $term['term_id'], 'instance_order', $processed_max_order + 1 );
			update_term_meta( $term['term_id'], 'instance_navbar_name', $instance_navbar_name );
			update_term_meta( $term['term_id'], 'graphic_data_instance_type_placeholder_id', 1 );
		}
	}

	public function placeholder_content_director() {
		if (GRAPHIC_DATA_IS_ACTIVE_THEME){
			
		}
	}
}
