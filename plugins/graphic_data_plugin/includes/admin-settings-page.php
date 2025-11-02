<?php
/**
 * Register class that defines the functions used to create the Graphic Data Settings page in the admin dashboard  
 * 
 */

 
include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-utility.php';
class Graphic_Data_Settings_Page {

    // Add menu item to WordPress admin
    function add_admin_menu() {
        add_menu_page(
            'Graphic Data Settings', // Page title
            'Graphic Data Settings', // Menu title
            'manage_options', // Capability required
            'theme_settings', // Menu slug
            [$this, 'webcr_settings_page'] // Function to display the page
        );
    }

    // Register settings-plotly-timeseries-line.js script to display the script.
    function enqueue_admin_interactive_default_line_styles() {

        if (empty($_GET['page']) || $_GET['page'] !== 'theme_settings') {
            return; // stop if not on our settings page
        }

        wp_enqueue_script(
                'load_default_line_styles', // Handle.
                plugin_dir_url(__FILE__) . '../includes/figures/js/interactive/settings-plotly-timeseries-line.js',
                [], // Dependencies (e.g., array('jquery')).
                null, // Version.
                true // Load in footer.
            );
    }

    //Register settings-plotly-bar.js script to display the script.
    function enqueue_admin_interactive_default_bar_styles() {
        if (empty($_GET['page']) || $_GET['page'] !== 'theme_settings') {
            return; // stop if not on our settings page
        }
        wp_enqueue_script(
                'load_default_bar_styles', // Handle.
                plugin_dir_url(__FILE__) . '../includes/figures/js/interactive/settings-plotly-bar.js',
                [], // Dependencies (e.g., array('jquery')).
                null, // Version.
                true // Load in footer.
            );
    }

    function webcr_settings_init() {
        // Register a new settings group
        register_setting('theme_settings_group', 'webcr_settings');

        // Theme Display section
        add_settings_section(
            'webcr_settings_section',
            'Theme Display',
            null,
            'theme_settings'
        );

        add_settings_field(
            'intro_text',
            'Front Page Introduction',
            [$this, 'intro_text_field_callback'],
            'theme_settings',
            'webcr_settings_section'
        );

        add_settings_field(
            'sitewide_footer_title',
            'Site-wide footer title',
            [$this, 'sitewide_footer_title_field_callback'],
            'theme_settings',
            'webcr_settings_section'
        );

        add_settings_field(
            'sitewide_footer',
            'Site-wide footer',
            [$this, 'sitewide_footer_field_callback'],
            'theme_settings',
            'webcr_settings_section'
        );


        // Google Analytics/Tags section
        add_settings_section(
            'google_settings_section',
            'Google Analytics/Tags',
            null,
            'theme_settings'
        );

        add_settings_field(
            'google_analytics_measurement_id',
            'Google Analytics Measurement ID',
            [$this, 'google_analytics_measurement_id_field_callback'],
            'theme_settings',
            'google_settings_section'
        );

        add_settings_field(
            'google_tags_container_id',
            'Google Tags Container ID',
            [$this, 'google_tags_container_id_field_callback'],
            'theme_settings',
            'google_settings_section'
        );


        // Interactive Figure Defaults section
        add_settings_section(
            'interactive_figures_defaults_section',
            'Interactive Figure Defaults',
            null,
            'theme_settings'
        );

        add_settings_field(
            'interactive_line_arguments',
            'Line Graph (Time Series) Arguments',
            [$this, 'interactive_line_arguments_callback'],
            'theme_settings',
            'interactive_figures_defaults_section'
        );

        add_settings_field(
            'interactive_line_defaults',
            'Line Graph (Time Series) Custom Style Settings',
            [$this, 'interactive_line_defaults_callback'],
            'theme_settings',
            'interactive_figures_defaults_section'
        );

        add_settings_field(
            'interactive_bar_arguments',
            'Bar Graph Arguments',
            [$this, 'interactive_bar_arguments_callback'],
            'theme_settings',
            'interactive_figures_defaults_section'
        );

        add_settings_field(
            'interactive_bar_defaults',
            'Bar Graph Custom Style Settings',
            [$this, 'interactive_bar_defaults_callback'],
            'theme_settings',
            'interactive_figures_defaults_section'
        );

        // Register settings for REST API access (read-only)
        register_setting('theme_settings_group', 'webcr_sitewide_footer_title', [
            'show_in_rest' => [
                'name' => 'sitewide_footer_title',
                'schema' => [
                    'type' => 'string',
                    'description' => 'Site-wide footer title'
                ]
            ],
            'type' => 'string',
            'default' => '',
            'sanitize_callback' => 'sanitize_text_field'
        ]);

        register_setting('theme_settings_group', 'webcr_sitewide_footer', [
            'show_in_rest' => [
                'name' => 'sitewide_footer',
                'schema' => [
                    'type' => 'string',
                    'description' => 'Site-wide footer content'
                ]
            ],
            'type' => 'string',
            'default' => '',
            'sanitize_callback' => 'wp_kses_post' // Allows safe HTML
        ]);
    }

    function webcr_register_rest_settings() {
        // Register custom REST route for read-only access
        register_rest_route('webcr/v1', '/footer-settings', [
            'methods' => 'GET',
            'callback' => [$this, 'webcr_get_footer_settings'],
        'webcr_get_footer_settings',
            'permission_callback' => '__return_true', // Public access
            'args' => []
        ]);
    }

    function webcr_get_footer_settings($request) {
        $settings = get_option('webcr_settings', []);
        
        return rest_ensure_response([
            'sitewide_footer_title' => isset($settings['sitewide_footer_title']) ? $settings['sitewide_footer_title'] : '',
            'sitewide_footer' => isset($settings['site_footer']) ? $settings['site_footer'] : ''  // Changed to 'site_footer'
        ]);
    }

    /**
     * Callback function to render the "Site footer title" field.
     *
     * @since 1.0.0
     * @return void
     */
    function sitewide_footer_title_field_callback() {
        $options = get_option('webcr_settings');
        // Ensure the correct option key is used, assuming it's 'sitewide_footer_title'
        $value = isset($options['sitewide_footer_title']) ? $options['sitewide_footer_title'] : '';
        ?>
        <input type="text" name="webcr_settings[sitewide_footer_title]" value="<?php echo esc_attr($value); ?>" class="regular-text">


        <p class="description">Enter the title for the site-wide footer. This will appear as the heading for the first column in the footer across all pages. If you don't want a site-wide footer, leave this field blank.</p>
        <?php
    }

    /**
     * Callback function to render the "Site footer" rich text editor field.
     *
     * @since 1.0.0
     * @return void
     */
    function sitewide_footer_field_callback() {
        $options = get_option('webcr_settings');
        $value = isset($options['site_footer']) ? $options['site_footer'] : '';
        $editor_id = 'webcr_site_footer_editor'; // Unique ID for the editor
        $settings = array(
            'textarea_name' => 'webcr_settings[site_footer]', // Important for saving
            'media_buttons' => true, // Set to false if you don't want media buttons
            'textarea_rows' => 10, // Number of rows
            'tinymce'       => true, // Use TinyMCE
            'quicktags'     => true  // Enable quicktags
        );
        wp_editor(wp_kses_post($value), $editor_id, $settings);
        ?>
        <p class="description">The content in this field will appear as the first column in the footer across all pages. If you don't want a site-wide footer, then leave this field blank.</p>
        <?php
    }
   
    /**
     * Callback function to render the "Intro Text" rich text editor field.
     *
     * @since 1.0.0
     * @return void
     */
    function intro_text_field_callback() {
        $options = get_option('webcr_settings');
        $value = isset($options['intro_text']) ? $options['intro_text'] : '';
        $editor_id = 'graphic_data_intro_text_editor'; // Unique ID for the editor
        $settings = array(
            'textarea_name' => 'webcr_settings[intro_text]', // Important for saving
            'media_buttons' => true, // Set to false if you don't want media buttons
            'textarea_rows' => 10, // Number of rows
            'tinymce'       => true, // Use TinyMCE
            'quicktags'     => true  // Enable quicktags
        );
        wp_editor(wp_kses_post($value), $editor_id, $settings);
        ?>
        <p class="description">This text will appear on your site's front page. If you have a single instance site, with "single instance" selected in the theme, this field does not apply.</p>
        <?php
    }
   
    function google_analytics_measurement_id_field_callback() {
        $options = get_option('webcr_settings');
        $value = isset($options['google_analytics_measurement_id']) ? $options['google_analytics_measurement_id'] : '';
        ?>
        <input type="text" name="webcr_settings[google_analytics_measurement_id]" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="G-XXXXXXXXXXXX">
        <p class="description">
            Enter the Google Analytics Measurement ID for your site.
            <br>
            <a href="https://support.google.com/analytics/answer/9539598" target="_blank" rel="noopener noreferrer">Learn how to find your Measurement ID</a>.
        </p>
        <?php
    }


    public function interactive_line_arguments_callback() {
        $options = get_option('webcr_settings');
        $value = isset($options['interactive_line_arguments']) ? $options['interactive_line_arguments'] : '';
        $editor_id = 'interactive_line_arguments_editor'; // Unique ID for the editor
        $settings = array(
            'textarea_name' => 'webcr_settings[interactive_line_arguments]', // Important for saving
            'media_buttons' => false, // Set to false if you don't want media buttons
            'textarea_rows' => 10, // Number of rows
            'tinymce'       => false, // Use TinyMCE
            'quicktags'     => false  // Enable quicktags
        );
        wp_editor(wp_kses_post($value), $editor_id, $settings);
    }


    function interactive_line_defaults_callback() {
        $options = get_option('webcr_settings');
        $interactive_line_arguments_value = isset($options['interactive_line_arguments']) ? $options['interactive_line_arguments'] : '';
        $value   = isset($options['interactive_line_defaults']) ? $options['interactive_line_defaults'] : '';
        ?>
        <div id="interactive_line_arguments_value" data-value="<?php echo $interactive_line_arguments_value; ?>"></div>
        <details>
        <summary style="cursor:pointer; font-weight:bold;">
            Expand/Collapse Options
        </summary>
        <div id="lineDefaultSelector" style="margin-top:10px;"></div>
        
        </details> 
        <?php    
    }

    public function interactive_bar_arguments_callback() {
        $options = get_option('webcr_settings');
        $value = isset($options['interactive_bar_arguments']) ? $options['interactive_bar_arguments'] : '';
        $editor_id = 'interactive_bar_arguments_editor'; // Unique ID for the editor
        $settings = array(
            'textarea_name' => 'webcr_settings[interactive_bar_arguments]', // Important for saving
            'media_buttons' => false, // Set to false if you don't want media buttons
            'textarea_rows' => 10, // Number of rows
            'tinymce'       => false, // Use TinyMCE
            'quicktags'     => false  // Enable quicktags
        );
        wp_editor(wp_kses_post($value), $editor_id, $settings);
    }


    function interactive_bar_defaults_callback() {
        $options = get_option('webcr_settings');
        $interactive_bar_arguments_value = isset($options['interactive_bar_arguments']) ? $options['interactive_bar_arguments'] : '';
        $value   = isset($options['interactive_bar_defaults']) ? $options['interactive_bar_defaults'] : '';
        ?>
        <div id="interactive_bar_arguments_value" data-value="<?php echo $interactive_bar_arguments_value; ?>"></div>
        <details>
        <summary style="cursor:pointer; font-weight:bold;">
            Expand/Collapse Options
        </summary>
        <div id="barDefaultSelector" style="margin-top:10px;"></div>
        
        </details>

        <p class="description">
            <br>
            <br>
            Be sure to click the "Save Changes" below when complete.
            <br>
        </p>   
        <?php    
    }
    

    /**
     * Callback function for rendering the Google Tags Container ID field in the settings page.
     *
     * This function generates an input field for the Google Tags Container ID and provides
     * additional instructions and links for users to configure their Google Tag Manager setup.
     * It also includes a JavaScript implementation to dynamically modify and download a JSON
     * container file with user-provided IDs.
     *
     * @return void
     */
    function google_tags_container_id_field_callback() {
        // Retrieve the plugin settings from the WordPress options table.
        $options = get_option('webcr_settings');
        // Get the Google Tags Container ID from the settings, or set a default empty value.
        $value = isset($options['google_tags_container_id']) ? $options['google_tags_container_id'] : '';
        // Get the Google Analytics Measurement ID from the settings, or set a default empty value.
        $value_GTMContainer = isset($options['google_analytics_measurement_id']) ? $options['google_analytics_measurement_id'] : '';
        // Define the example JSON file name and its folder path.
        $example_container_json = 'example_google_container_tags.json';
        $example_folder = get_site_url() . '/wp-content/plugins/graphic_data_plugin/example_files/';
        // Generate the full URL for the example JSON file.
        $filedownload =  esc_url($example_folder . $example_container_json)

        ?>
        <input type="text" name="webcr_settings[google_tags_container_id]" value="<?php echo esc_attr($value); ?>" class="regular-text" placeholder="GTM-XXXXXXXX">
        <p class="description">
            Enter the Google Tags Container ID for your site.
            <br>
            <a href="https://support.google.com/tagmanager/answer/14847097?hl=en" target="_blank" rel="noopener noreferrer">Learn how to find your Container ID (2. Install a web container > Step 4)</a>.
            <br>
            <br>
            Enter both IDs above, then click below to download, then import this container into your Google Tag Manager instance.
            <br>
            <a href="#" id="downloadLink" target="" rel="noopener noreferrer">Download Container File</a>
            <br>
            <a href="https://support.google.com/tagmanager/answer/6106997" target="_blank" rel="noopener noreferrer">Learn how to import a container into Google Tag Manager</a>
            <br>
            <br>
            Be sure to click the "Save Changes" below when complete.
            <br>
        </p>


        <script>
            /**
            * JavaScript functionality:
            * - Listens for a click event on the "Download Container File" link.
            * - Fetches the example JSON file from the server.
            * - Dynamically replaces placeholder values ("G-EXAMPLE" and "GTM-EXAMPLE") in the JSON
            *   with the user-provided Google Analytics Measurement ID and Google Tags Container ID.
            * - Creates a downloadable JSON file with the modified data.
            * - Triggers the download of the modified file.
            * - Handles errors during the fetch process and logs them to the console.
            */
            document.getElementById('downloadLink').addEventListener('click', function (event) {
                event.preventDefault();  // Prevent the default link behavior

                // GA4 Measurement ID passed from PHP
                var gaMeasurementId = "<?php echo esc_js($value); ?>"; 

                // GA4 Measurement ID passed from PHP
                var gtmContainerId = "<?php echo esc_js($value_GTMContainer); ?>";


                // Fetch the GTM container JSON from the local server
                const rootURL = window.location.origin;
                const figureRestCall = `${rootURL}/wp-content/plugins/webcr/example_files/example_google_container_tags.json`;
                fetch(figureRestCall)  // Update with the correct path
                    .then(response => response.json())  // Parse JSON
                    .then(jsonData => {
                        // Loop through the tags and replace "G-EXAMPLE" with the dynamic GA Measurement ID
                        jsonData.containerVersion.tag.forEach(tag => {
                            tag.parameter.forEach(param => {
                                if (param.key === "tagId" && param.value === "G-EXAMPLE") {
                                    param.value = gaMeasurementId;  // Replace with the actual GA Measurement ID
                                }
                                if (param.key === "publicId" && param.value === "GTM-EXAMPLE") {
                                    param.value = gtmContainerId;  // Replace with the actual GA Measurement ID
                                }
                            });
                        });

                        // Loop through the tagIds array and replace "GTM-EXAMPLE" with gtmContainerId
                        jsonData.containerVersion.container.tagIds.forEach((tagId, index) => {
                            if (tagId === "GTM-EXAMPLE") {
                                jsonData.containerVersion.container.tagIds[index] = gtmContainerId;  // Replace with the GTM Container ID
                            }
                        });

                        // Create a Blob from the modified JSON data
                        const jsonString = JSON.stringify(jsonData, null, 2);  // Format JSON with indentation
                        const blob = new Blob([jsonString], { type: 'application/json' });

                        console.log(jsonString);
                        console.log(blob);

                        // Create a download link for the modified file
                        const url = URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'GTM-EXAMPLE-CONTAINER.json';  // Set the filename for the download

                        // Programmatically click the download link to trigger the download
                        a.click();

                        // Clean up the object URL after the download
                        URL.revokeObjectURL(url);
                    })
                    .catch(error => {
                        console.error("Error fetching the JSON file:", error);
                    });
            });
        </script>
        <?php
    }

    
   // Create the settings page
   function webcr_settings_page() {
       // Check user capabilities
       if (!current_user_can('manage_options')) {
           return;
       }
       ?>
       <div class="wrap">
           <h1><?php echo esc_html(get_admin_page_title()); ?></h1>
           <form action="options.php" method="post">
               <?php
               settings_fields('theme_settings_group');
               do_settings_sections('theme_settings');
               submit_button();
               ?>
           </form>
       </div>
       <?php
   }

}
