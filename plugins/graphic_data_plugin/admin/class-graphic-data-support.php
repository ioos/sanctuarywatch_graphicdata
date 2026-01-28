<?php
/**
 * The code for creating the "Graphic Data Support" menu item and page in the plugin.
 */
class Graphic_Data_Support {

	/**
	 * Add admin menu item
	 */
	public function add_admin_menu() {
		add_menu_page(
			'Graphic Data Support',           // Page title.
			'Graphic Data Support',           // Menu title.
			'manage_options',                 // Capability required.
			'graphic-data-support',           // Menu slug.
			array( $this, 'display_support_page' ), // Callback function.
			'dashicons-chart-area',           // Icon (you can change this).
			100                                // Position in menu.
		);
	}

	/**
	 * Display the support page content
	 */
	public function display_support_page() {
		?>
		<div class="wrap">
			<div class="support_card">
				<h2>Welcome to Graphic Data!</h2>

			<p class="support_text_size"> Thanks very much for using the Graphic Data Plugin and Theme! We'd love to hear from you. Whether you are just checking out Graphic Data for the
				first time, or you are a long-time user, we want to say hello! And to make it worth your while, if you send us an email saying hello,
				we'd love to mail you this free sticker. To get your sticker, please send Jai an email with your address at <a href="mailto:jai.ranganathan@noaa.gov">jai.ranganathan@noaa.gov</a>.</p>
			
			<p> <img src="<?php echo esc_url( plugin_dir_url( __FILE__ ) . '/images/sanctuary_watch_sticker.png' ); ?>" alt="Graphic Data Sticker" style="max-width: 350px; height: auto;"></p>
			
			<p class="support_text_size">Also, maybe you have some support questions or some suggestions for us? If so, please do send us an email at the same place <a href="mailto:jai.ranganathan@noaa.gov">jai.ranganathan@noaa.gov</a>.
			Or, if you'd prefer, feel free to fill out our handy-dandy <a href="https://forms.gle/DG2fwrb2YrU2qRqJ6">Google Form</a>.</p>

			<p class="support_text_size">We have tons of documentation to help you get started! Check it out <a href="https://github.com/ioos/sanctuarywatch_graphicdata">here</a>.</p>

			<p class="support_text_size">Thanks again and let's definitely be in touch! Jai and Robbie</p>
		<?php
	}
}