<?php
/**
 * Export Figures admin page.
 *
 * @package Graphic_Data_Plugin
 */

require_once plugin_dir_path( __DIR__ ) . 'admin/class-utility.php';

/**
 * Class Graphic_Data_Export_Figures
 *
 * Registers and displays the Export Figures admin page under the Tools menu.
 * Allows users to select an instance and export associated figures.
 *
 * @since 1.0.0
 */
class Graphic_Data_Export_Figures {

	/**
	 * Callback function to display the content of the "Export Figures" page.
	 *
	 * @since    1.0.0
	 */
	public function export_figures_page() {
		?>
		<div class="wrap">
			<h1>Export Figures</h1>
			<p>Select an Instance for figure export:</p>
			<p>
			<?php
			// get list of locations.
			$function_utilities = new Graphic_Data_Utility();
			$locations = $function_utilities->return_all_instances();

			echo '<select id="location" name="location">'; // Opening the <select> tag.
			foreach ( $locations as $key => $value ) {
				echo '<option value="' . esc_attr( $key ) . '">' . esc_html( $value ) . '</option>'; // Dynamically generating options.
			}
			echo '</select>'; // Closing the <select> tag.
			?>
			</p>
			<p><button class = "button button-primary" id="chooseInstance">Choose Instance</button></p>

			<div id="optionCanvas"></div>

		<?php
	}
}