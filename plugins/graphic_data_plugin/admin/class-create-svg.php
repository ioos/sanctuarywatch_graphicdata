<?php
/**
 * Register class that defines Create SVG functions
 */

class Create_SVG {

	/**
	 * Function to add the "Create SVG" submenu under Tools
	 *
	 * @since    1.0.0
	 */
	public function add_create_svg_menu() {
			add_submenu_page(
				'tools.php',              // Parent slug - adding it under 'Tools'
				'Create SVG',         // Page title
				'Create SVG',         // Menu title
				'edit_posts',         // Capability required to see the option
				'create-svg',         // Slug (used in the URL)
				[ $this, 'create_svg_page' ]     // Callback function to output the page content
			);
	}

	/**
	 * Enqueue the JavaScript and CSS files for Create SVG functionality
	 *
	 * Loads the admin-create-svg.js script which handles SVG generation,
	 * filename prompting, preview display, and file download functionality.
	 * Also loads the admin-create-svg.css for styling.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_admin_svg_script( $hook ) {
		// Only load on the create-svg page (tools.php?page=create-svg)
		if ( $hook !== 'tools_page_create-svg' ) {
			return;
		}

		wp_enqueue_script(
			'admin-create-svg',
			plugin_dir_url( __FILE__ ) . 'js/admin-create-svg.js',
			array(),
			GRAPHIC_DATA_PLUGIN_VERSION,
			true
		);

		wp_enqueue_style(
			'admin-create-svg',
			plugin_dir_url( __FILE__ ) . 'css/admin-create-svg.css',
			array(),
			GRAPHIC_DATA_PLUGIN_VERSION
		);
	}

	// Callback function to display the content of the "Create SVG" page
	public function create_svg_page() {

		?>
		<div class="wrap">
			<h1>Create SVG</h1>

			<div class="create-svg-container">
				<div class="create-svg-intro">
					<p style="font-size:larger">This tool allows you to create a SVG that is formatted correctly to work within Graphic Data as a clickable image within a Scene. There are several tricky steps involved in creating a Graphic-Data-compliant SVG and the point of this tool is to remove the key pain points in SVG generation. The full details of how SVGs must be formatted for Graphic Data can be found in our <a target="_blank" href="https://ioos.github.io/sanctuarywatch_graphicdata/creating_svg_files/">documentation</a>.</p>

					<p style="font-size:larger">The basic idea of how to use this tool is as follows.<ol style="font-size:larger"><li>Use the controls below to create and download a SVG which has the icon structure that you want. You can control the number and names of the icons, as well as whether the icons each have separate mobile versions. This SVG will have the correct layer organization to work with Graphic Data.</li><li>Import the SVG into a vector graphics editor. SVGs created by this tool have been tested to work with two editors: Illustrator and Inkscape.</li><li>In the editor, keep the layer organization of the SVG, but swap out all artwork elements with whatever you would like.</li></ol></p>

					<p style="font-size:larger">There are a few rules that you will need to follow to use this tool.<ol style="font-size:larger"><li>The SVG Title cannot be left blank.</li><li>Icon labels cannot be left blank.</li><li>Icon labels cannot contain spaces or special characters, except for dashes (-) and underscores(_).</li><li>Within a single SVG, icon labels must be unique.</li></ol></p>
				</div>

				<div class="form-section">
					<div class="form-field">
						<label for="svgTitle">SVG Title:</label><br>
						<input type="text" id="svgTitle" name="svgTitle" value="" placeholder="Enter SVG title" style="width: 100%; max-width: 400px;">
					</div>

					<div class="form-field">
						<div class="checkbox-field">
							<label>Does the SVG contain a text layer?</label>
							<input type="checkbox" id="svgText" name="svgText">
						</div>
					</div>

					<div class="form-field">
						<label for="svgIconNumber">Number of clickable icons:</label>
						<div class="range-control">
							<input type="range" id="svgIconNumber" name="svgIconNumber" min="0" max="12" value="0">
							<span class="range-value" id="svgIconNumberValue">0</span>
						</div>
					</div>
				</div>

				<div class="action-buttons">
					<button class="button button-primary" id="previewSVG">Preview SVG</button>
					<button class="button button-primary" id="generateSVG">Download SVG</button>
				</div>

				<div id="preview"></div>
			</div>
		</div>
		<?php
	}
}