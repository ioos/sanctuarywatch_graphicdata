<?php
/**
 * Register class that defines Create SVG functions 
 * 
 */
include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-utility.php';
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
                [$this, 'create_svg_page']     // Callback function to output the page content
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
    public function enqueue_admin_svg_script(){
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
                    <p style="font-size:larger">Introductory text to be added later.</p>
                </div>

                <div class="form-section">
                    <div class="form-field">
                        <label>SVG Type:</label>
                        <div class="radio-group">
                            <label>
                                <input type="radio" name="svgType" value="illustrator" checked>
                                Illustrator
                            </label>
                            <label>
                                <input type="radio" name="svgType" value="inkscape">
                                Inkscape
                            </label>
                        </div>
                    </div>

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
                            <input type="range" id="svgIconNumber" name="svgIconNumber" min="0" max="15" value="0">
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