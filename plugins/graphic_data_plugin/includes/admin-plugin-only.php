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

	public function create_plugin_only_instance_type() {
		global $wpdb;

		$term_name = 'First Instance Type';
		$term_slug = [ 'tutorial-instance-example-1', 'tutorial-instance-example-2' ];
		$term_description = [
			'Welcome, Space Captain! The highest level of organization in Graphic Data is the "Instance Type". Right here is an example (First Instance Type). ' .
			'Instance Types contain Instances. With Graphic Data, you must have at least one Instance Type and each Type must contains one or more Instances. This particular Instance Type contains two Instances. You can check out your Instances and Instance Types in the WordPress admin dashboard (they are options in the left panel).',
			'This is a second example Instance Type and it contains one Instance.',
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
}
