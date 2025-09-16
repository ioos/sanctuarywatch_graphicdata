<?php
/**
 * Register class that defines the functions used to create the Graphic Data Settings page in the admin dashboard  
 * 
 */

 
include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-webcr-utility.php';
class Graphic_Data_Settings_Page {

    // Add menu item to WordPress admin
    function webcr_add_admin_menu() {
        add_menu_page(
            'Graphic Data Settings', // Page title
            'Graphic Data Settings', // Menu title
            'manage_options', // Capability required
            'theme_settings', // Menu slug
            [$this, 'webcr_settings_page'] // Function to display the page
        );
    }

    // Register settings-plotly-timeseries-line.js script to display the script.


    function enqueue_admin_interactive_line_default_styles() {
        wp_enqueue_script(
                'load_default_line_styles', // Handle.
                plugin_dir_url(__FILE__) . '../includes/figures/js/settings-plotly-timeseries-line.js',
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
            'webcr_google_settings_section',
            'Google Analytics/Tags',
            null,
            'theme_settings'
        );

        add_settings_field(
            'google_analytics_measurement_id',
            'Google Analytics Measurement ID',
            [$this, 'google_analytics_measurement_id_field_callback'],
            'theme_settings',
            'webcr_google_settings_section'
        );

        add_settings_field(
            'google_tags_container_id',
            'Google Tags Container ID',
            [$this, 'google_tags_container_id_field_callback'],
            'theme_settings',
            'webcr_google_settings_section'
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
            'Line Graph (Time Series) Default Settings',
            [$this, 'interactive_line_defaults_callback'],
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
        // Inject inline JS to hide the whole <tr> row on load
        ?>
        <!-- <script>
        document.addEventListener("DOMContentLoaded", function() {
            const row = document.getElementById("interactive_line_arguments_editor").closest("tr");
            if (row) {
                row.style.display = "none";
            }
        });
        </script> -->
        <?php
    }


    function interactive_line_defaults_callback() {
        $options = get_option('webcr_settings');
        $interactive_line_arguments_value = isset($options['interactive_line_arguments']) ? $options['interactive_line_arguments'] : '';
        $value   = isset($options['interactive_line_defaults']) ? $options['interactive_line_defaults'] : '';
        ?>
        <div id="interactive_line_arguments_value" data-value="<?php echo $interactive_line_arguments_value; ?>"></div>
        <details>
        <summary style="cursor:pointer; font-weight:bold;">
            Expand/Collapse Line Graph (Time Series) Default Settings
        </summary>
        <div id="lineDefaultSelector" style="margin-top:10px;"></div>
        
        </details>

        <p class="description">
            <br>
            <br>
            Be sure to click the "Save Changes" below when complete.
            <br>
        </p>

        <script>    

        (function () {

            // ---- globals used across your helpers
            let jsonColumns = {};
            let fieldValueSaved;

            let interactive_line_arguments_value = document.getElementById("interactive_line_arguments_editor").value

            // ====== Your functions (lightly tidied/safe-guarded) ======
            async function loadJson(targetContainer) {

                const rootURL = window.location.origin;
                const idEl = document.getElementsByName("post_ID")[0];

                // Only build GUI if we actually have columns
                const lengthJsonColumns = Object.keys(jsonColumns).length;
                if (lengthJsonColumns == 0) {
                    // Clear any existing GUI
                    const existing = document.getElementById('graphGUI');
                    if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

                    // Create the GUI wrapper
                    const targetElement = targetContainer;
                    const newDiv = document.createElement('div');
                    newDiv.id = "graphGUI";
                    newDiv.classList.add("container", "graphGUI");

                    // Label + select
                    const labelGraphType = document.createElement("label");
                    labelGraphType.setAttribute("for", "graphType");
                    labelGraphType.innerHTML = "Graph Type";

                    const selectGraphType = document.createElement("select");
                    selectGraphType.id = "graphType";
                    selectGraphType.name = "plotFields";

                    const optLine = new Option("Plotly line graph (time series)", "Plotly line graph (time series)");
                    selectGraphType.append(optLine);


                    //Pull saved interactive args (if any)
                    const iaEl = <?php echo json_encode($interactive_line_arguments_value); ?>; 
                    const interactive_arguments = iaEl ? iaEl : "";


                    console.log('iaEl', iaEl);
                    console.log('interactive_arguments', interactive_arguments);

                    // Restore saved selection (uses your own fill/log helpers)
                    if (typeof fillFormFieldValues === "function") {
                        fieldValueSaved = fillFormFieldValues(selectGraphType.id);
                        if (fieldValueSaved !== undefined) selectGraphType.value = fieldValueSaved;
                    }

                    selectGraphType.addEventListener('change', function () {
                        secondaryGraphFields(this.value, interactive_arguments);
                        if (typeof logFormFieldValues === "function") logFormFieldValues();
                    });

                    // Layout
                    const row = document.createElement("div");
                    row.classList.add("row", "fieldPadding");
                    const col1 = document.createElement("div");
                    col1.classList.add("col-3");
                    const col2 = document.createElement("div");
                    col2.classList.add("col");

                    col1.appendChild(labelGraphType);
                    col2.appendChild(selectGraphType);
                    row.append(col1, col2);
                    newDiv.append(row);

                    targetElement.appendChild(newDiv);

                    console.log('fieldValueSaved', fieldValueSaved);


                    //Trigger secondaries if saved
                    if (fieldValueSaved !== undefined) {
                        secondaryGraphFields(interactive_arguments);
                    }

                }
            }


            function secondaryGraphFields(interactive_arguments) {

                // Remove existing secondary fields wrapper if present
                const secondaryGraphDiv = document.getElementById('secondaryGraphFields');
                if (secondaryGraphDiv && secondaryGraphDiv.parentNode) {
                    secondaryGraphDiv.parentNode.removeChild(secondaryGraphDiv);
                }
                
                clearPreviousGraphFields();
                console.log('TEST1');
                plotlyLineParameterFields(jsonColumns, interactive_arguments);        
            }

            function clearPreviousGraphFields() {
                const assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
                if (assignColumnsToPlot && assignColumnsToPlot.parentNode) {
                    assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
                }
            }

            /**
             * Logs the values of form fields (inputs, selects, etc.) associated with
             * JavaScript figure parameters to a hidden input field, so that they are saved in the WordPress database.
             * This function finds all elements with the name "plotFields",
             * extracts their ID and value, and stores them as a JSON string in the
             * "figure_interactive_arguments" field.
             *
             * @function logFormFieldValues
             * @listens change
             * @example
             * // Assuming you have the following HTML:
             * // <input type="text" name="plotFields" id="xAxisTitle" value="Date">
             * // <input type="hidden" name="figure_interactive_arguments" value="">
             * logFormFieldValues(); // After a change to one of the above plotFields, the hidden input will be updated
             */
            function logFormFieldValues() {
                const allFields = document.getElementsByName("plotFields");
                let fieldValues = [];
                allFields.forEach((uniqueField) => {
                    console.log([uniqueField.id, uniqueField.value]);
                    fieldValues.push([uniqueField.id, uniqueField.value]);
                });
                document.getElementById("interactive_line_arguments_editor").value = JSON.stringify(fieldValues); 
            }

            /**
             * Fills in the values of form fields associated with JavaScript figure
             * parameters. It retrieves the values from the hidden
             * "figure_interactive_arguments" field and populates the corresponding
             * form fields.
             *
             * @function fillFormFieldValues
             * @param {string} elementID - The ID of the form field to fill.
             * @returns {string|undefined} The value of the form field if found, or
             *   `undefined` if the field or its value is not found.
             * @example
             * // Assuming you have the following HTML:
             * // <input type="text" name="plotFields" id="xAxisTitle" value="">
             * // <input type="hidden" name="figure_interactive_arguments" value="[['xAxisTitle', 'Date'], ['yAxisTitle', 'Value']]">
             * const xAxisTitle = fillFormFieldValues('xAxisTitle'); // xAxisTitle will be set to "Date"
             */
            function fillFormFieldValues(elementID){
                const interactiveFields = <?php echo json_encode($interactive_line_arguments_value); ?>;
                console.log('interactiveFields', interactiveFields);
                if (interactiveFields != ""  && interactiveFields != null) {
                    const resultJSON = Object.fromEntries(JSON.parse(interactiveFields));

                    if (resultJSON[elementID] != undefined && resultJSON[elementID] != ""){
                        return resultJSON[elementID];
                    }
                }
            }

            function plotlyLineParameterFields(jsonColumns, interactive_arguments){

                let newDiv = document.createElement("div");
                newDiv.id = 'secondaryGraphFields';
                const targetElement = document.getElementById('graphGUI');

                let newRow;
                let newColumn1;
                let newColumn2;

                //Add checkboxes for showgrid
                const features = ["showGrid", "graphTicks"];
                const featureNames = ["Show X&Y Lines on Grid", "Remove Outside Graph Ticks"];
                for (let i = 0; i < features.length; i++) {
                    const feature = features[i];
                    const featureName = featureNames[i];

                    let newRow = document.createElement("div");
                    newRow.classList.add("row", "fieldPadding");

                    let newColumn1 = document.createElement("div");
                    newColumn1.classList.add("col-3");
                    let newColumn2 = document.createElement("div");
                    newColumn2.classList.add("col");

                    let label = document.createElement("label");
                    label.for = feature;
                    label.innerHTML = `${featureName}`;
                    let checkbox = document.createElement("input");
                    checkbox.type = "checkbox";
                    checkbox.id = feature;
                    checkbox.name = "plotFields";

                    let fieldValueSaved = fillFormFieldValues(checkbox.id, interactive_arguments);
                    checkbox.value = fieldValueSaved === 'on' ? 'on' : "";
                    checkbox.checked = fieldValueSaved === 'on';

                    // Toggle visibility dynamically
                    checkbox.addEventListener('change', function () {
                        checkbox.value = checkbox.checked ? 'on' : "";
                        logFormFieldValues();
                    });

                    newColumn1.appendChild(label);
                    newColumn2.appendChild(checkbox);
                    newRow.append(newColumn1, newColumn2);
                    newDiv.append(newRow);
                    
                }
                    


                //X Axis Date Format
                let labelSelectXAxisFormat = document.createElement("label");
                labelSelectXAxisFormat.for = "XAxisFormat";
                labelSelectXAxisFormat.innerHTML = "X Axis Date Format";
                let selectXAxisFormat = document.createElement("select");
                selectXAxisFormat.id = "XAxisFormat";
                selectXAxisFormat.name = "plotFields";
                selectXAxisFormat.addEventListener('change', function() {
                    logFormFieldValues();
                });

                const dateFormats =["YYYY", "YYYY-MM-DD"];

                dateFormats.forEach((dateFormat) => {
                    let selectXAxisFormatOption = document.createElement("option");
                    selectXAxisFormatOption.value = dateFormat;
                    selectXAxisFormatOption.innerHTML = dateFormat; 
                    selectXAxisFormat.appendChild(selectXAxisFormatOption);
                });
                fieldValueSaved = fillFormFieldValues(selectXAxisFormat.id, interactive_arguments);
                if (fieldValueSaved != undefined){
                    selectXAxisFormat.value = fieldValueSaved;
                }

                newRow = document.createElement("div");
                newRow.classList.add("row", "fieldPadding");
                newColumn1 = document.createElement("div");
                newColumn1.classList.add("col-3");   
                newColumn2 = document.createElement("div");
                newColumn2.classList.add("col");

                newColumn1.appendChild(labelSelectXAxisFormat);
                newColumn2.appendChild(selectXAxisFormat);
                newRow.append(newColumn1, newColumn2);
                newDiv.append(newRow);     

                targetElement.appendChild(newDiv);

                // Run display line fields
                displayLineFields(14, jsonColumns, interactive_arguments);
                }


                // generate the form fields needed for users to indicate preferences for how a figure should appear 
                function displayLineFields (numLines, jsonColumns, interactive_arguments) {
                let assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
                // If the element exists
                if (assignColumnsToPlot) {
                    // Remove the scene window
                    assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
                }

                if (numLines > 0) {
                    
                    let newDiv = document.createElement("div");
                    newDiv.id = "assignColumnsToPlot";

                    let fieldLabels = [["XAxis", "X Axis Column"]];
                    for (let i = 1; i <= numLines; i++){
                        fieldLabels.push(["Line" + i, "Line " + i + " Column"]);
                    }
              

                    fieldLabels.forEach((fieldLabel) => {
                        //Select the data source from dropdown menu  
                        let labelSelectColumn = document.createElement("label");
                        //labelSelectColumn.for = fieldLabel[0];
                        //labelSelectColumn.innerHTML = fieldLabel[1];
                        let selectColumn = document.createElement("select");


                        let newRow = document.createElement("div");
                        newRow.classList.add("row", "fieldPadding");

                        if (fieldLabel[0] != "XAxis"){      
                            fieldLabelNumber = parseInt(fieldLabel[0].slice(-1));
                            if (fieldLabelNumber % 2 != 0 ){
                                newRow.classList.add("row", "fieldBackgroundColor");
                            }
                        }

                        let newColumn1 = document.createElement("div");
                        newColumn1.classList.add("col-3");   
                        let newColumn2 = document.createElement("div");
                        newColumn2.classList.add("col");

                        //newColumn1.appendChild(labelSelectColumn);
                        //newColumn2.appendChild(selectColumn);
                        newRow.append(newColumn1, newColumn2);
                        newDiv.append(newRow);

                        
                        // Add line label and color fields, line type, marker type, and marker size
                        if (fieldLabel[0] != "XAxis"){
                            // Add line label field
                            newRow = document.createElement("div");
                            newRow.classList.add("row", "fieldPadding");

                            if (fieldLabelNumber % 2 != 0 ){
                                newRow.classList.add("row", "fieldBackgroundColor");
                            }


                            // Add color field
                            newRow = document.createElement("div");
                            newRow.classList.add("row", "fieldPadding");
                            if (fieldLabelNumber % 2 != 0 ){
                                newRow.classList.add("row", "fieldBackgroundColor");
                            }
                            newColumn1 = document.createElement("div");
                            newColumn1.classList.add("col-3");   
                            newColumn2 = document.createElement("div");
                            newColumn2.classList.add("col");

                            let labelInputColor = document.createElement("label");
                            labelInputColor.for = fieldLabel[0] + "Color";
                            labelInputColor.innerHTML = fieldLabel[1] + " Color";
                            let inputColor = document.createElement("input");
                            inputColor.id = fieldLabel[0] + "Color";
                            inputColor.name = "plotFields";
                            inputColor.type = "color";
                            fieldValueSaved = fillFormFieldValues(inputColor.id, interactive_arguments);
                            if (fieldValueSaved != undefined){
                                inputColor.value = fieldValueSaved;
                            }
                            inputColor.addEventListener('change', function() {
                                logFormFieldValues();
                            });

                            newColumn1.appendChild(labelInputColor);
                            newColumn2.appendChild(inputColor);
                            newRow.append(newColumn1, newColumn2);
                            newDiv.append(newRow);

                            // Add lineType type dropdown
                            const lineTypeRow = document.createElement('div');
                            lineTypeRow.classList.add('row', 'fieldPadding');
                            if (fieldLabelNumber % 2 != 0) lineTypeRow.classList.add('fieldBackgroundColor');

                            const lineTypeCol1 = document.createElement('div');
                            lineTypeCol1.classList.add('col-3');
                            const lineTypeCol2 = document.createElement('div');
                            lineTypeCol2.classList.add('col');

                            const lineTypeLabel = document.createElement('label');
                            lineTypeLabel.textContent = fieldLabel[1] + ' Line Type';
                            lineTypeLabel.htmlFor = fieldLabel[0] + 'LineType';
                            const lineTypeSelect = document.createElement('select');
                            lineTypeSelect.id = fieldLabel[0] + 'LineType';
                            lineTypeSelect.name = 'plotFields';

                            //line types
                            ["solid", "dash", "dot", "dashdot", "longdash", "longdashdot"].forEach(type => {
                            const opt = document.createElement('option');
                            opt.value = type;
                            opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
                            lineTypeSelect.appendChild(opt);
                            });

                            const lineTypeSaved = fillFormFieldValues(lineTypeSelect.id, interactive_arguments);
                            if (lineTypeSaved) lineTypeSelect.value = lineTypeSaved;

                            lineTypeSelect.addEventListener('change', logFormFieldValues);
                            lineTypeCol1.appendChild(lineTypeLabel);
                            lineTypeCol2.appendChild(lineTypeSelect);
                            lineTypeRow.append(lineTypeCol1, lineTypeCol2);
                            newDiv.append(lineTypeRow);

                            // Add marker type dropdown
                            const markerRow = document.createElement('div');
                            markerRow.classList.add('row', 'fieldPadding');
                            if (fieldLabelNumber % 2 != 0) markerRow.classList.add('fieldBackgroundColor');

                            const markerCol1 = document.createElement('div');
                            markerCol1.classList.add('col-3');
                            const markerCol2 = document.createElement('div');
                            markerCol2.classList.add('col');

                            const markerLabel = document.createElement('label');
                            markerLabel.textContent = fieldLabel[1] + ' Marker Type';
                            markerLabel.htmlFor = fieldLabel[0] + 'MarkerType';
                            const markerSelect = document.createElement('select');
                            markerSelect.id = fieldLabel[0] + 'MarkerType';
                            markerSelect.name = 'plotFields';

                            ["circle", "square", "diamond", "x", "triangle-up", "triangle-down", "pentagon", "hexagon", "star", "hourglass", "bowtie", "cross"].forEach(type => {
                                const opt = document.createElement('option');
                                opt.value = type;
                                opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
                                markerSelect.appendChild(opt);
                            });

                            const markerSaved = fillFormFieldValues(markerSelect.id, interactive_arguments);
                            if (markerSaved) markerSelect.value = markerSaved;

                            markerSelect.addEventListener('change', logFormFieldValues);
                            markerCol1.appendChild(markerLabel);
                            markerCol2.appendChild(markerSelect);
                            markerRow.append(markerCol1, markerCol2);
                            newDiv.append(markerRow);


                            // Add markerSize type dropdown
                            const markerSizeRow = document.createElement('div');
                            markerSizeRow.classList.add('row', 'fieldPadding');
                            if (fieldLabelNumber % 2 != 0) markerSizeRow.classList.add('fieldBackgroundColor');

                            const markerSizeCol1 = document.createElement('div');
                            markerSizeCol1.classList.add('col-3');
                            const markerSizeCol2 = document.createElement('div');
                            markerSizeCol2.classList.add('col');

                            const markerSizeLabel = document.createElement('label');
                            markerSizeLabel.textContent = fieldLabel[1] + ' Marker Size';
                            markerSizeLabel.htmlFor = fieldLabel[0] + 'MarkerSize';
                            const markerSizeSelect = document.createElement('select');
                            markerSizeSelect.id = fieldLabel[0] + 'MarkerSize';
                            markerSizeSelect.name = 'plotFields';

                            // Sizes 1 through 20
                            [0, 1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20].forEach(size => {
                            const opt = document.createElement('option');
                            opt.value = size;
                            opt.innerHTML = size + ' px';
                            markerSizeSelect.appendChild(opt);
                            });

                            const markerSizeSaved = fillFormFieldValues(markerSizeSelect.id, interactive_arguments);
                            if (markerSizeSaved) markerSizeSelect.value = markerSizeSaved;

                            markerSizeSelect.addEventListener('change', logFormFieldValues);
                            markerSizeCol1.appendChild(markerSizeLabel);
                            markerSizeCol2.appendChild(markerSizeSelect);
                            markerSizeRow.append(markerSizeCol1, markerSizeCol2);
                            newDiv.append(markerSizeRow);


                            //Add checkboxes for error bars, standard deviation, mean, and percentiles
                            const features = ["Legend", "StdDev", "ErrorBars"];
                            const featureNames = ["Add Line to Legend", "+-1 Std Dev Fill ", "Symmetric Error Bars"];
                            for (let i = 0; i < features.length; i++) {
                                const feature = features[i];
                                const featureName = featureNames[i];

                                let newRow = document.createElement("div");
                                newRow.classList.add("row", "fieldPadding");
                                if (fieldLabelNumber % 2 != 0) {
                                    newRow.classList.add("row", "fieldBackgroundColor");
                                }

                                let newColumn1 = document.createElement("div");
                                newColumn1.classList.add("col-3");
                                let newColumn2 = document.createElement("div");
                                newColumn2.classList.add("col");

                                let label = document.createElement("label");
                                label.for = fieldLabel[0] + feature;
                                label.innerHTML = `${featureName}`;
                                let checkbox = document.createElement("input");
                                checkbox.type = "checkbox";
                                checkbox.id = fieldLabel[0] + feature;
                                checkbox.name = "plotFields";

                                let fieldValueSaved = fillFormFieldValues(checkbox.id, interactive_arguments);
                                checkbox.value = fieldValueSaved === 'on' ? 'on' : "";
                                checkbox.checked = fieldValueSaved === 'on';

                                newColumn1.appendChild(label);
                                newColumn2.appendChild(checkbox);
                                newRow.append(newColumn1, newColumn2);
                                newDiv.append(newRow);
                                

                                // === Add dropdowns for feature-specific data ===
                                if (["Mean", "ErrorBars", "StdDev"].includes(feature)) {
                                    const dropdownContainer = document.createElement("div");
                                    dropdownContainer.classList.add("row", "fieldPadding");
                                    if (fieldLabelNumber % 2 != 0) {
                                        dropdownContainer.classList.add("row", "fieldBackgroundColor");
                                    }

                                    const dropdownLabelCol = document.createElement("div");
                                    dropdownLabelCol.classList.add("col-3");
                                    const dropdownInputCol = document.createElement("div");
                                    dropdownInputCol.classList.add("col");

                                    function createDropdown(labelText, selectId) {
                                        const label = document.createElement("label");
                                        label.innerHTML = labelText;
                                        const select = document.createElement("select");
                                        select.id = selectId;
                                        select.name = "plotFields";

                                        if (feature === "Mean" || feature === "ErrorBars" || feature === "StdDev") {
                                            const autoOpt = document.createElement("option");

                                            if (feature != "ErrorBars") {
                                                autoOpt.value = "auto";
                                                autoOpt.innerHTML = "Auto Calculate Based on Line Column Selection";
                                                select.appendChild(autoOpt);
                                            }
                                            if (feature === "ErrorBars") {
                                                autoOpt.value = "auto";
                                                autoOpt.innerHTML = "Example Error Bars";
                                                select.appendChild(autoOpt);
                                            }

                                        for (let col of Object.values(jsonColumns)) {
                                            const opt = document.createElement("option");
                                            opt.value = col;
                                            opt.innerHTML = col;
                                            select.appendChild(opt);
                                        }

                                        const saved = fillFormFieldValues(select.id, interactive_arguments);
                                        if (saved) select.value = saved;

                                        select.addEventListener("change", logFormFieldValues);
                                        return { label, select };
                                        }

                                    }

                                    function createColorfield(labelText, inputId) {
                                        const label = document.createElement("label");
                                        label.textContent = labelText;
                                        label.htmlFor = inputId; // Link label to input

                                        const input = document.createElement("input"); // Correct element
                                        input.type = "color";
                                        input.id = inputId;
                                        input.name = "plotFields";

                                        const saved = fillFormFieldValues(input.id, interactive_arguments);
                                        if (saved) input.value = saved;

                                        input.addEventListener("change", logFormFieldValues);
                                        return { label, input };
                                    }

                                    const controls = [];

                                    // if (feature === "Mean") {
                                    //     const { label, select } = createDropdown("Mean Source Column", fieldLabel[0] + feature + "Field");
                                    //     controls.push(label, select);
                                    // }

                                    if (feature === "ErrorBars" || feature === "StdDev") {
                                        //const { label: labelValues, select: selectValues } = createDropdown(`${featureName} Input Column Values`, fieldLabel[0] + feature + "InputValues");
                                        const { label: labelColor, input: ColorValue } = createColorfield(`Color`, fieldLabel[0] + feature + "Color");
                                        controls.push(labelColor, document.createElement('br'), ColorValue);
                                    }             

                                    // Initially hide the dropdown container
                                    dropdownContainer.style.display = checkbox.checked ? "flex" : "none";

                                    controls.forEach(control => dropdownInputCol.appendChild(control));
                                    dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
                                    newDiv.append(dropdownContainer);

                                    // Toggle visibility dynamically
                                    checkbox.addEventListener('change', function () {
                                        checkbox.value = checkbox.checked ? 'on' : "";
                                        dropdownContainer.style.display = checkbox.checked ? "flex" : "none";
                                        logFormFieldValues();
                                    });
                                } else {
                                    checkbox.addEventListener('change', function () {
                                        checkbox.value = checkbox.checked ? 'on' : "";
                                        logFormFieldValues();
                                    });
                                }
                            }
                            
                        }
                        

                        const targetElement = document.getElementById('graphGUI');
                        targetElement.appendChild(newDiv);

                        let newHR = document.createElement("hr");
                        newHR.style = "margin-top:15px";
                        newDiv.append(newHR);    
                    }); 
                }
                }

            // ====== Boot: run loadJson with targetContainer = #lineDefaultSelector ======
            function startLoadJson() {
                const target = document.getElementById('lineDefaultSelector');
                if (!target) return;

                // If your other helpers are loaded asynchronously, delay slightly:
                // setTimeout(() => loadJson(target), 50);
                loadJson(target);
            }

            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', startLoadJson);
            } else {
                startLoadJson();
            }
        })();
        </script>
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
        </script> -->
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
