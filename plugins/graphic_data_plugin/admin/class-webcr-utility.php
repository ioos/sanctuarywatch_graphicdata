<?php
/**
 * Utility functions used across the plugin
 *
 * @link       https://www.noaa.gov
 * @since      1.0.0
 *
 * @package    Webcr
 * @subpackage Webcr/admin
 */

/**
 * Utility functions used across the plugin
 *
 * @package    Webcr
 * @subpackage Webcr/admin
 * @author     Jai Ranganathan <jai.ranganathan@noaa.gov>
 */
class Webcr_Utility {

    /**
	 * Shorten string without cutting words midword.
	 *
     * @param string $string The string to be shortened.
     * @param int $your_desired_width The number of characters in the shortened string.
     * @return The shortened string
	 * @since    1.0.0
	 */
    public function stringTruncate($string, $your_desired_width) {
        $parts = preg_split('/([\s\n\r]+)/', $string, -1, PREG_SPLIT_DELIM_CAPTURE);
        $parts_count = count($parts);
        
        $length = 0;
        //$last_part = 0;
        for ($last_part = 0; $last_part < $parts_count; ++$last_part) {
            $length += strlen($parts[$last_part]);
            if ($length > $your_desired_width) { break; }
        }
        
        return implode(array_slice($parts, 0, $last_part));
    }

    // used for field validation
    function output_transient_to_js() {
        // Only run on edit post pages for certain custom content post types
        global $pagenow, $post;
        
        if ($pagenow !== 'post.php') {
            return;
        }
        
        $acceptable_post_types = ['modal', 'scene', 'instance', 'figure', 'about'];
        $current_post_type = isset($post->post_type) ? $post->post_type : '';

        if (!$post || !in_array($current_post_type, $acceptable_post_types)) {
            return;
        }
        
        // Get current user ID
        $user_id = get_current_user_id();
        
        if (!$user_id) {
            return;
        }
        
        // Check if transient exists for this user
        $transient_name = $current_post_type . "_error_all_fields_user_{$user_id}";

        //modal_error_all_fields_user_1
        $transient_data = get_transient($transient_name);
        
        if ($transient_data !== false) {
            // Output the transient data as JavaScript
            ?>
            <script type="text/javascript">
                const allCustomFields = <?php echo wp_json_encode($transient_data); ?>;
            </script>
            <?php
            
            // Delete the transient after outputting it
            delete_transient($transient_name);
        }
    }


    /**
     * Generalized function to write all field values from any custom content type to transients
     * 
     * @param string $content_type The custom content type (e.g., 'modal', 'scene', etc.)
     * @param array $fields_config The fields configuration array from the create_*_fields() method
     * @param int $expiration Optional. Time until expiration in seconds. Default 1800 (30 minutes)
     * @since 1.0.0
     */
    public function fields_to_transient($key_name, $fields_config, $expiration = 1800) {
        delete_expired_transients(); // Ensure expired transients are cleaned up before storing new ones
        $all_fields = [];
        
        $variable_type = gettype($fields_config);

        if ($variable_type == 'array') {
        // Process the fields configuration to extract field IDss and handle fieldsets
            $this->extract_field_values($fields_config, $all_fields);
        } else if ($variable_type === 'string') {
            $all_fields = $fields_config;
        }
        // Create a unique transient key for this user and content type
        $transient_key = $this->get_user_transient_key($key_name);
        
        // Store in transient instead of session
        set_transient($transient_key, $all_fields, $expiration);
    }

    /**
     * Helper function to create a unique transient key for the current user, based on the user ID
     * 
     * This function is used as part of the field validation process in multiple places.
     * 
     * @param string $base_key The base key for the transient
     * @return string The user-specific transient key
     */
    public function get_user_transient_key($base_key) {
        $user_id = get_current_user_id();
        return $base_key . '_user_' . $user_id;
    }

    /**
     * Helper function to retrieve field values from transients
     * 
     * @param string $content_type The custom content type
     * @return array|false The stored field values or false if not found
     */
    public function get_fields_from_transient($content_type) {
        $transient_key = $this->get_user_transient_key($content_type . "_error_all_fields");
        return get_transient($transient_key);
    }

    /**
     * Dummy sanitize function that returns the value as is.
     * 
     * This sanitize function is used to prevent automatic sanitization of
     * URL fields. What is causing the automatic sanitization is unknown but 
     * exists somewhere deep in the Exopite Framework options. The problem comes up 
     * with URL escape codes which are not interpreted correctly by whatever
     * is doing the automatic sanitization. This function, in contrast, ensures that
     * the user input is preserved.
     * 
     * @param string $value The URL field to be returned.
     * @return string The URL field.
     */
    function dummy_sanitize($value) {
        return $value;
    } 

    /**
     * Helper function to delete field values from transients
     * 
     * @param string $content_type The custom content type
     * @return bool True if successful, false otherwise
     */
    public function delete_fields_transient($content_type) {
        $transient_key = $this->get_user_transient_key($content_type . "_error_all_fields");
        return delete_transient($transient_key);
    }

    /**
     * Recursively extract field values from POST data based on field configuration
     * 
     * @param array $fields The fields configuration array
     * @param array &$all_fields Reference to array where field values will be stored
     */
    public function extract_field_values($fields, &$all_fields) {
        foreach ($fields as $field) {
            // Skip button type fields
            if (isset($field['type']) && $field['type'] === 'button') {
                continue;
            }
            
            // Handle fieldsets (nested fields)
            if (isset($field['type']) && $field['type'] === 'fieldset') {
                $fieldset_id = $field['id'];
                
                // Process each field within the fieldset
                if (isset($field['fields']) && is_array($field['fields'])) {
                    foreach ($field['fields'] as $nested_field) {
                        if (isset($nested_field['id']) && isset($nested_field['type']) && $nested_field['type'] !== 'button') {
                            $nested_field_id = $nested_field['id'];
                            // For fieldsets, data is nested: $_POST[fieldset_id][field_id]
                            if (isset($_POST[$fieldset_id][$nested_field_id])) {
                                $all_fields[$nested_field_id] = $_POST[$fieldset_id][$nested_field_id];
                            }
                        }
                    }
                }
            }
            // Handle regular fields
            elseif (isset($field['id']) && isset($field['type'])) {
                $field_id = $field['id'];
                // For regular fields, data is direct: $_POST[field_id]
                if (isset($_POST[$field_id])) {
                    $all_fields[$field_id] = $_POST[$field_id];
                }
            }
            
            // Handle nested field arrays (like your tabFields)
            if (isset($field['fields']) && is_array($field['fields'])) {
                $this->extract_field_values($field['fields'], $all_fields);
            }
        }
    }

    /**
     * Displays admin notices for the following kind of custom content posts: about, instance, scene, modal, and figure.
     * 
     * Shows informational, error, or warning messages based on the status of the post.
     * Notices are displayed only on the post type edit screen after a post has been updated.
     *
     * @param string $post_type The type of post for which the notice is being displayed.
     * @return void Outputs the appropriate admin notice.
     */
    public function post_admin_notice() {
        // First let's determine where we are. We only want to show admin notices in the right places. Namely in one of our custom 
        // posts after it has been updated. The if statement is looking for three things: 1. Right post type? 2. An individual post (as opposed to the scene
        // admin screen)? 3. A new post

        if (function_exists('get_current_screen')) {
            $current_screen = get_current_screen();
            if ($current_screen){
                $post_type = $current_screen->post_type; 
                if ($current_screen->base == "post" && $current_screen->id == $post_type && !($current_screen->action =="add") ) { 
                    $current_post_status = $this->retrieve_post_status($post_type);
                    if ($current_post_status == "none"){
                        return;
                    }
                    if ($current_post_status == "post_good"){
                        echo '<div class="notice notice-info is-dismissible"><p>' . ucfirst($post_type) . ' created or updated.</p></div>';
                    } else if ($current_post_status == "post_error"){
                        $error_message = "<p>Error or errors in " . $post_type . "</p>";
                        $error_list_array =  $this->retrieve_post_errors_warnings($post_type, "_errors");
                        if ($error_list_array != "none"){
                            $error_array_length = count($error_list_array);
                            $error_message = $error_message . '<p><ul>';
                            for ($i = 0; $i < $error_array_length; $i++){
                                $error_message = $error_message . '<li>' . $error_list_array[$i] . '</li>';
                            }
                            $error_message = $error_message . '</ul></p>';
                        }

                        echo '<div class="notice notice-error is-dismissible">' . $error_message . '</div>'; 
                    }
                    $warning_list_array =  $this->retrieve_post_errors_warnings($post_type, "_warnings");
                    if ($warning_list_array != "none"){
                        $warning_message = "<p>Warning or warnings in " . $post_type . "</p>";
                        $warning_array_length = count($warning_list_array);
                        $warning_message = $warning_message . '<p><ul>';
                        for ($i = 0; $i < $warning_array_length; $i++){
                            $warning_message = $warning_message . '<li>' . $warning_list_array[$i] . '</li>';
                        }
                        $warning_message = $warning_message . '</ul></p>';
                        echo '<div class="notice notice-warning is-dismissible">' . $warning_message . '</div>'; 
                    }   
                }
            }
        }
    }

    /**
     * Return post status for custom posts.
     * 
     * This function the post status associated with custom
     * posts of type about, instance, scene, modal, and figure. The retrieval
     * occurs from a WordPress transient, which is recorded at the moment
     * that the post in question was saved. This function is used after that
     * posts reloads after the save.
     * 
     * @param string $post_type The custom post type. 
     */
    function retrieve_post_status ($post_type) {
        $user_id = get_current_user_id();
        
        if (!$user_id) {
            return "none";
        }
        
        // Check if transient exists for this user
        $transient_name = $post_type . "_post_status_user_{$user_id}";

        // retrieve transient, if it's there
        $transient_data = get_transient($transient_name);
        // post_status
        if ($transient_data == false) {
            return "none";
        } else {
            return $transient_data;
            delete_transient($transient_name);
        }
    }

    /**
     * Return data entry errors and warnings associated with custom posts.
     * 
     * This function retrieves errors and warnings associated with custom
     * posts of type about, instance, scene, modal, and figure. The retrieval
     * occurs from WordPress transients, which are recorded at the moment
     * that the post in question was saved. This function is used after that
     * posts reloads after the save.
     * 
     * @param string $post_type The custom post type. 
     * @param string $issue_type Either 'errors' or 'warnings'.
     */
    function retrieve_post_errors_warnings ($post_type, $issue_type) {
        $user_id = get_current_user_id();
        
        if (!$user_id) {
            return "none";
        }
        
        // Check if transient exists for this user
        $transient_name = $post_type . $issue_type . "_user_{$user_id}";

        // retrieve transient, if it's there
        $transient_data = get_transient($transient_name);
        // post_status
        if ($transient_data == false) {
            return "none";
        } else {
            return $transient_data;
            delete_transient($transient_name);
        }
    }


    /**
     * Get a list of all instances, filtered for 'content_editor' role.
     *
     * @return array An associative array of instance IDs and titles.
     */
    public function returnAllInstances(){
        // Initialize the result array with a default empty option
        $instances_array = array(" " => "");

        // Get the current user
        $current_user = wp_get_current_user();
        if (!$current_user || $current_user->ID === 0) {
            // If no user is logged in, return just the empty option (or handle as needed)
            return $instances_array;
        }

        // Default query arguments to get all published instances
        $args = array(
            'post_type'      => 'instance',
            'posts_per_page' => -1,
            'orderby'        => 'title',
            'order'          => 'ASC',
            'post_status'    => 'publish', // Ensure only published instances are fetched
            'fields'         => 'ids',     // Only retrieve IDs initially
        );

        // --- Role-Based Filtering Logic ---
        // Check if the current user is a 'content_editor' BUT NOT an 'administrator'
        if ( user_can($current_user, 'content_editor') && !user_can($current_user, 'administrator') ) {
            // Get the instances assigned to this content editor
            $user_assigned_instances = get_user_meta($current_user->ID, 'webcr_assigned_instances', true);

            // Ensure it's a non-empty array
            if (!empty($user_assigned_instances) && is_array($user_assigned_instances)) {
                // Modify the query to only include posts with these IDs
                $args['post__in'] = array_map('absint', $user_assigned_instances); // Sanitize IDs just in case
            } else {
                // If the content editor has no assigned instances, return only the default empty option
                return $instances_array;
            }
        }
        // --- End Role-Based Filtering Logic ---
        // Administrators and other roles will use the default $args (fetching all instances)

        // Execute the query
        $query = new WP_Query($args);

        // Build the associative array of ID => Title
        if ($query->have_posts()) {
            foreach ($query->posts as $post_id) {
                $title = get_the_title($post_id);
                // Add to array only if title is not empty
                if ($title) {
                    $instances_array[$post_id] = $title;
                }
            }
        }
        // WP_Query already handled the 'orderby' => 'title', so no need to sort again here.

        return $instances_array;
    }

    //Get a list of all scenes associated with an instance
    public function returnInstanceScenes($instance_id){

        $scene_titles = array();
        $args = array(
            'post_type' => 'scene',  // Your custom post type
            'posts_per_page' => -1,  // Retrieve all matching posts (-1 means no limit)
            'meta_query' => array(
                array(
                    'key' => 'scene_location',      // The custom field key
                    'value' => $instance_id, // The value you are searching for
                    'compare' => '='         // Comparison operator
                )
            ),
            'fields' => 'ids'            // Only return post IDs
        );
        
        // Execute the query
        $query = new WP_Query($args);
        
        // Get the array of post IDs
        $scene_post_ids = $query->posts;
        foreach ($scene_post_ids as $target_id){
            $target_title = get_post_meta($target_id, "post_title", true);
            $scene_titles[$target_id] = $target_title;
        }
        asort($scene_titles);
        return $scene_titles;
    }

    public function returnSceneTitles($scene_id, $modal_id){
        $final_scene_titles =  array(" " =>  "");
        if (array_key_exists("post", $_GET)) {
            $scene_location = get_post_meta($modal_id, "modal_location", true);
            $scene_name = get_post_meta($scene_id, "post_title", true);
            $scenes[$scene_id] = $scene_name;

            $args = array(
                'post_type' => 'scene',  // Your custom post type
                'posts_per_page' => -1,  // Retrieve all matching posts (-1 means no limit)
                'meta_query' => array(
                    array(
                        'key' => 'scene_location',      // The custom field key
                        'value' => $scene_location, // The value you are searching for
                        'compare' => '='         // Comparison operator
                    )
                ),
                'fields' => 'ids'            // Only return post IDs
            );
            
            // Execute the query
            $query = new WP_Query($args);
            
            // Get the array of post IDs
            $scene_post_ids = $query->posts;

            $scene_titles =[];
            foreach ($scene_post_ids as $target_id){
                $target_title = get_post_meta($target_id, "post_title", true);
                $scene_titles[$target_id] = $target_title;
            }
            asort($scene_titles);

            // Create the final array starting with the desired empty option
            $final_scene_titles = [" " => ""];

            // Use the union operator (+) to add the sorted scenes after the empty option.
            // This preserves the keys from $scene_titles.
            $final_scene_titles += $scene_titles;
        }
        return $final_scene_titles;
    }

    public function returnIcons($scene_id){
        $modal_icons = array("" => "");
        $scene_infographic = get_post_meta($scene_id, "scene_infographic", true);
        if ($scene_infographic == true){
            $relative_path =  ltrim(parse_url($scene_infographic)['path'], "/");

            $full_path = get_home_path() . $relative_path;

            $svg_content = file_get_contents($full_path);

            if ($svg_content === false) {
                die("Failed to load SVG file.");
            }
            
            // Create a new DOMDocument instance and load the SVG content 
            $dom = new DOMDocument();
            libxml_use_internal_errors(true); // Suppress errors related to invalid XML
            $dom->loadXML($svg_content);
            libxml_clear_errors();
            
            // Create a new DOMXPath instance
            $xpath = new DOMXPath($dom);
            
        // Find the element with the ID "icons" (case-insensitive)
        // XPath 1.0 doesn't have lower-case(), so we use translate()
        $query = "//*[translate(@id, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'icons']";
        $icons_element = $xpath->query($query)->item(0);
            
            if ($icons_element === null) {
                error_log("Webcr_Utility::returnIcons - Element with ID 'icons' (case-insensitive) not found in SVG: " . $full_path);
                return $modal_icons; // Element not found
            }
            
            // Get all child elements of the "icons" element
            $child_elements = $icons_element->childNodes;
            
            // Initialize an array to hold the IDs
            $child_ids = array();
            
            // Loop through the child elements and extract their IDs
            foreach ($child_elements as $child) {
                if ($child->nodeType === XML_ELEMENT_NODE && $child->hasAttribute('id')) {
                    $child_ids[] = $child->getAttribute('id');
                }
            }
            asort($child_ids);
            foreach ($child_ids as $single_icon){
                $modal_icons[$single_icon] = $single_icon;
            }
        }
        return $modal_icons;
    }

    // return an array of scenes, other than the current scene, for a given location
    public function returnScenesExceptCurrent($scene_id){
        $potential_scenes = [];
        $scene_location = get_post_meta($scene_id, "scene_location", true);
        if ($scene_location == true){
            $args = array(
                'post_type' => 'scene',  // Your custom post type
                'posts_per_page' => -1,       // Retrieve all matching posts (-1 means no limit)
                'meta_query' => array(
                    array(
                        'key' => 'scene_location',      // The custom field key
                        'value' => $scene_location, // The value you are searching for
                        'compare' => '='         // Comparison operator
                    )
                ),
                'fields' => 'ids'            // Only return post IDs
            );
            
            // Execute the query
            $query = new WP_Query($args);
            
            // Get the array of post IDs
            $scene_post_ids = $query->posts;
            foreach ($scene_post_ids as $target_id){
                if ($target_id != $scene_id) {
                    $target_title = get_post_meta($target_id, "post_title", true);
                    $potential_scenes[$target_id] = $target_title;
                }
            }
            asort($potential_scenes);
            $potential_scenes = array("" => "") + $potential_scenes;
        }
        return $potential_scenes;
    }

    // Potential section headers for icons
    public function returnModalSections($scene_id){
        $modal_sections = [];
        for ($i = 1; $i < 7; $i++){
            $field_target = 'scene_section' . $i;
            $target_section = get_post_meta($scene_id, $field_target, true);
            if ($target_section != null && $target_section != "" & is_array($target_section)){
                $target_title = $target_section["scene_section_title" . $i];
                if ($target_title != null && $target_title != ""){
                    $modal_sections[$field_target] = $target_title; //$modal_sections[$target_title] = $target_title;
                }

            }
        }
        asort($modal_sections);
        $modal_sections = array_merge(array("" => ""),$modal_sections );
        return $modal_sections;
    }

    // Dropdown options for Scene in figure content type
    public function returnScenesFigure($location){
        $potential_scenes[""] = "";

        if ($location != ""){
            $args = array(
                'post_type' => 'scene',  // Your custom post type
                'posts_per_page' => -1,   // Retrieve all matching posts (-1 means no limit)
                'meta_query' => array(
                    array(
                        'key' => 'scene_location',      // The custom field key
                        'value' => $location, // The value you are searching for
                        'compare' => '='         // Comparison operator
                    )
                ),
                'fields' => 'ids'            // Only return post IDs
            );
            // Execute the query
            $query = new WP_Query($args);

            // Get the array of post IDs
            $scene_post_ids = $query->posts;
            foreach ($scene_post_ids as $target_id){
                $target_title = get_post_meta($target_id, "post_title", true);
                $potential_scenes[$target_id] = $target_title;
            }
        //    asort($potential_scenes);
        }
        return $potential_scenes;
        
    }

    public function returnModalTabs($modal_id){
        $potential_tabs[""] = "";
        if ($modal_id != "") {
            for ($i = 1; $i < 7; $i++){
                $target_field = "modal_tab_title" . $i;
                $target_title = get_post_meta($modal_id, $target_field, true);
                if ($target_title != "" && $target_title != null ){
                    $potential_tabs[$i] = $target_title;
                }
            }
        //    asort($potential_tabs);
        }
        return $potential_tabs;
    }

    //dropdown options for Icon in figure content type
    public function returnFigureIcons($scene_id){
        $potential_icons[""] = "";
        if ($scene_id != ""){

            $args = array(
                'post_type' => 'modal',  // Your custom post type
                'fields' => 'ids',           // Only return post IDs
                'posts_per_page' => -1,       // Retrieve all matching posts 
                'meta_query' => array(
                    array(
                        'key' => 'modal_scene',      // The custom field key
                        'value' => $scene_id, // The value you are searching for
                        'compare' => '='         // Comparison operator
                    ),
                    array(
                        'key' => 'icon_function',
                        'value' => 'Modal',
                        'compare' => '='
                    ),
                ),
            );
            
            // Execute the query
            $query = new WP_Query($args);
            
            // Get the array of post IDs
            $modal_post_ids = $query->posts;

            $modal_titles =[];
            foreach ($modal_post_ids as $target_id){
                $target_title = get_post_meta($target_id, "post_title", true);
                $potential_icons[$target_id] = $target_title;
            }
          //  asort($potential_icons);
        }

        return $potential_icons;
    }

    // register rest fields for when rest api hook is called
    public function register_custom_rest_fields($post_type, $rest_fields){
        foreach($rest_fields as $target_field){
            register_rest_field(
                $post_type, // Custom post type name
                $target_field, // Name of the custom field
                array(
                    'get_callback' => array($this, 'meta_get_callback'),
                    'schema' => null,
                )
            );
        }
    }

    // used by register_custom_rest_fields
    public function meta_get_callback($object, $field_name, $request) {
        return get_post_meta($object['id'], $field_name, true);
    }

}

