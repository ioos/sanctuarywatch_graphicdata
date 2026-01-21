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

	public function check_tutorial_content_status() {
		$options = get_option( 'graphic_data_settings' );
		$tutorial_content_wamted = isset( $options['tutorial_content'] ) ? $options['tutorial_content'] : 0;
		if ( 1 == $tutorial_content_enabled ) {
			$this->create_tutorial_content();
		} else {
			$this->delete_tutorial_content();
		}	
	}
}
