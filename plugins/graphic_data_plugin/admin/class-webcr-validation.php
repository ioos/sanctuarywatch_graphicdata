<?php

/**
 * The class that defines the validation methods for the fields of the custom content types
 */

include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-webcr-utility.php';
include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-graphic-data-SVGValidator.php';

class webcr_validation {

    /**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	public $plugin_name = 'webcr';

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      string    $version    The current version of the plugin.
	 */
	public $version = '1.0.0';

    public function master_validate($validate_content_type){
        
        // I think a session is needed for validation, but not 100% sure. Stashing
        // the session start and stop within this function for now.
        session_start();

        switch ($validate_content_type) {
            case "about":
                $result = $this->validate_about();
                break;
            case "scene":
                $result = $this->validate_scene();
                break;
            case "modal":
                $result = $this->validate_modal();
                break;
            case "figure":
                $result = $this->validate_figure();
                break;
            case "instance":
                $result = $this->validate_instance();
                break;
            case "default":
                $result = false;
        }
       // session_write_close();
        return $result;
    }

    // The purpose of this function is to validate the fields of the About custom content type. 
    public function validate_about (){
        $function_utilities = new Webcr_Utility();
        
        $save_about_fields = true;
        $about_errors = [];
        $about_warnings = [];

        if ($_POST["centralAbout"]["aboutMain"] == ""){
            array_push($about_errors,  'The "Central content: main" field cannot be left blank.');
            $save_about_fields = FALSE;
        }

        $numberAboutBoxes = $_POST["numberAboutBoxes"];
        if ($numberAboutBoxes > 0) {
            for ($i = 1; $i <= $numberAboutBoxes; $i++) {
                if ($_POST["aboutBox". $i]["aboutBoxTitle" . $i] == "" || $_POST["aboutBox". $i]["aboutBoxMain" . $i] == "") {  
                    array_push($about_errors,  'In About Box ' . $i . ' , the title and  "content: main" fields cannot be left blank.');
                    $save_about_fields = FALSE;
                }
            }
        }

        if ($save_about_fields == FALSE) {
            $function_utilities ->  fields_to_transient('about_errors', $about_errors, 30);
            $function_utilities ->  fields_to_transient('about_post_status', "post_error", 30);

            // Instantiate the modal class 
            $about_class = new Webcr_About( $this->plugin_name, $this->version ); // Assuming this is your modal class
            
            // Get the fields configuration
            $fields_config = $this->get_fields_config('about', $about_class);
            
            // save the fields to the transient

            $function_utilities ->  fields_to_transient('about_error_all_fields', $fields_config, 30);
        } else {
            $function_utilities ->  fields_to_transient('about_post_status', "post_good", 30);
        }

        return $save_about_fields;
    }


    // The purpose of this function is to validate the fields of the Instance custom content type. If validation fails, it sets a cookie with the error messages and the values of the fields that were submitted. 
    // It also sets a cookie to indicate whether the post was successful or not. If the function returns false, it means that the validation failed and the post was not saved. 
    // However, the page is reloaded and an error message is displayed to the user.
    public function validate_instance (){
        $save_instance_fields = true;

        // Clear previous validation data from session
        unset($_SESSION["instance_errors"]);
        unset($_SESSION["instance_warnings"]);
        unset($_SESSION["instance_post_status"]);

        $instance_errors = [];
        $instance_warnings = [];

        if ($_POST["instance_short_title"] == ""){
            array_push($instance_errors,  "The Short title field cannot be left blank.");
            $save_instance_fields = FALSE;
        }

        if ($_POST["instance_slug"] == ""){
            array_push($instance_errors,  "The URL component field cannot be left blank.");
            $save_instance_fields = FALSE;
        }

        if ($_POST["instance_overview_scene"] == ""){
            array_push($instance_warnings, "No overview scene is set. This will cause several issues with the display of the instance until it is corrected.");        
        }

        if ($_POST["instance_tile"] == ""){
            array_push($instance_warnings, "No tile image is set. This will cause an issue with the display of the front page of the site until it is corrected.");        
        } else {
            $image_path = $_SERVER['DOCUMENT_ROOT'] . wp_make_link_relative($_POST["instance_tile"]);
            if (!file_exists($image_path)) {
                array_push($instance_errors,  "The image specified by the 'Tile image' field does not exist.");
                $save_instance_fields = FALSE;
            } else {
                // Check file type based on content
                $file_info = finfo_open(FILEINFO_MIME_TYPE);
                $mime_type = finfo_file($file_info, $image_path);
                finfo_close($file_info);
                
                // Return false for SVG and other vector formats
                if ($mime_type === 'image/svg+xml') {
                    array_push($instance_errors,  "The image specified by the 'Tile image' field has a SVG format. Only pixel-based formats like jpeg or png are allowed.");
                    $save_instance_fields = FALSE;
                } else {
                    $image_size = getimagesize($image_path);
                    if ($image_size) {
                        $width = $image_size[0];
                        $height = $image_size[1];
                        
                        if (empty($width) || $width == 0 || empty($height) || $height == 0) {
                            array_push($instance_errors,  "The image specified by the 'Tile image' field has an unreadable height or width.");
                            $save_instance_fields = FALSE;
                        } else if($width/$height != 1.25) {
                            array_push($instance_errors,  "The image specified by the 'Tile image' field does not have the correct aspect ratio. The image must be exactly 25% wider than it is tall.");
                            $save_instance_fields = FALSE;
                        } else if ($width < 250){
                            array_push($instance_errors,  "The image specified by the 'Tile image' field is too small. The image must be, at the minimum, 250 pixels wide by 200 pixels tall.");
                            $save_instance_fields = FALSE;
                        } else if ($width > 1000){
                            array_push($instance_errors,  "The image specified by the 'Tile image' field is too big. The image must be, at the maximum, 1000 pixels wide by 800 pixels tall.");
                            $save_instance_fields = FALSE;
                        }
                    }
                }
            }

        }

        if ($_POST["instance_legacy_content"] == "yes"){
            $instance_legacy_content_url = $_POST["instance_legacy_content_url"];
            if ($instance_legacy_content_url == ""){
                array_push($instance_errors,  "If Legacy content is set to 'yes', then the Legacy content URL field cannot be left blank.");
                $save_instance_fields = FALSE;
            } else {
                if ( $this -> url_check($instance_legacy_content_url) == FALSE ) {
                    $save_instance_fields = FALSE;
                    array_push($instance_errors, "The Legacy content URL is not valid");
                } else {
                    // Set cURL options
                    $ch = curl_init($instance_legacy_content_url);
                    $userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  // Return the transfer as a string
                    curl_setopt($ch, CURLOPT_NOBODY, true);  // Exclude the body from the output
                    curl_setopt($ch, CURLOPT_HEADER, true);  // Include the header in the output
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  // Follow redirects
                    curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);  // Set User-Agent header

                    // Execute cURL session
                    curl_exec($ch);

                    // Get the headers
                    $headers = curl_getinfo($ch);

                    // Close cURL session
                    curl_close($ch);

                    if ($headers["http_code"] != 200){
                        array_push($instance_warnings, "The 'Legacy content URL' field cannot be accessed. This may be because there is something wrong with that URL. Alternatively, the automatic process used to check URL's might have been blocked in this case.");                               
                    }
                }
            }
        }

        $instance_footer_column_number = $_POST["instance_footer_columns"];

        for ($i = 1; $i <= $instance_footer_column_number; $i++) {
            $footer_column = $_POST["instance_footer_column" . $i];
            if ($footer_column["instance_footer_column_title" . $i] == "" || $footer_column["instance_footer_column_content" . $i] == "") {
                $save_instance_fields = FALSE;
                array_push($instance_errors,  "The Header and Content fields in Footer column " . $i . " cannot be blank.");
            }
        }   

        if (!empty($instance_warnings)){
            $_SESSION["instance_warnings"] = $instance_warnings;             
        }
        if ($save_instance_fields == FALSE) {
            $_SESSION["instance_errors"] = $instance_errors; // Store array directly
            $_SESSION["instance_post_status"] = "post_error";

            // Instamtiate the modal class 
            $instance_class = new Webcr_Instance( $this->plugin_name, $this->version ); // Assuming this is your modal class
            
            // Get the fields configuration
            $fields_config = $this->get_fields_config('instance', $instance_class);
            
            // save the fields to the transient
            $function_utilities = new Webcr_Utility();
            $function_utilities ->  fields_to_transient('instance_error_all_fields', $fields_config, 30);
        } else {
            $_SESSION["instance_post_status"] = "post_good";
        }

        return $save_instance_fields;
    }


    // The purpose of this function is to validate the fields of the Figure custom content type. If validation fails, it saves to the session the error messages and the values of the fields that were submitted. 
    // It also save to the session to indicate whether the post was successful or not. If the function returns false, it means that the validation failed and the post was not saved. 
    // However, the page is reloaded and an error message is displayed to the user.
    public function validate_figure (){
        $save_figure_fields = true;

        // Clear previous figure validation data from session
        unset($_SESSION["figure_errors"]);
        unset($_SESSION["figure_warnings"]);
        unset($_SESSION["figure_post_status"]);

        $figure_errors = [];
        $figure_warnings = [];


        if ($_POST["location"] == " "){
            array_push($figure_errors,  "The Instance field cannot be left blank.");
            $save_figure_fields = FALSE;
        }

        if ($_POST["figure_scene"] == ""){
            array_push($figure_errors,  "The Scene field cannot be left blank.");
            $save_figure_fields = FALSE;
        }

        if ($_POST["figure_modal"] == ""){
            array_push($figure_errors,  "The Icon field cannot be left blank.");
            $save_figure_fields = FALSE;
        } 

        if ($_POST["figure_tab"] == ""){
            array_push($figure_errors,  "The Tab field cannot be left blank.");
            $save_figure_fields = FALSE;
        }

        if ($_POST["figure_path"] == "Internal" && $_POST["figure_image"] == ""){
            array_push($figure_errors,  "If the Figure Type is set to 'Internal image', then the 'Figure image' field cannot be left blank.");
            $save_figure_fields = FALSE;
        }

        if ($_POST["figure_path"] == "External"){
            $figure_external_url = $_POST["figure_external_url"];
            if ($figure_external_url == ""){
                $save_figure_fields = FALSE;
                array_push($figure_errors,  "If the Figure Type is set to 'External image', then the External URL field cannot be left blank.");
            } else {
                if ( $this -> url_check($figure_external_url) == FALSE ) {
                    $save_figure_fields = FALSE;
                    array_push($figure_errors, "The External URL is not a valid URL.");
                } else {
                    // Set cURL options
                    $ch = curl_init($figure_external_url);
                    $userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
                    curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  // Return the transfer as a string
                    curl_setopt($ch, CURLOPT_NOBODY, true);  // Exclude the body from the output
                    curl_setopt($ch, CURLOPT_HEADER, true);  // Include the header in the output
                    curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  // Follow redirects
                    curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);  // Set User-Agent header

                    // Execute cURL session
                    curl_exec($ch);

                    // Get the headers
                    $headers = curl_getinfo($ch);

                    // Close cURL session
                    curl_close($ch);

                    if ($headers["http_code"] != 200){
                        array_push($figure_warnings, "The 'External URL' field cannot be accessed. This may be because there is something wrong with that URL. Alternatively, the automatic process used to check URL's might have been blocked in this case.");                               
                    }
                }
            }
        }

        if ($_POST["figure_path"] == "External" && $_POST["figure_external_alt"] == ""){
            array_push($figure_errors,  "If the Figure Type is set to 'External image', then the 'Alt text for external image' field cannot be left blank.");
            $save_figure_fields = FALSE;
        }

        $field_types = array("figure_science_", "figure_data_");
        $error_notice_name =[];
        $error_notice_name["figure_science_"] = "Monitoring program";
        $error_notice_name["figure_data_"] = "Data";    

        foreach ($field_types as $field_type){
            $form_fieldset = $field_type .  "info";
            $field_couplet = $_POST[$form_fieldset];

            $field_text = $field_type . "link_text";
            $field_url = $field_type . "link_url";
            if (!$field_couplet[$field_url] == "" || !$field_couplet[$field_text] == "" ){
                if ($field_couplet[$field_url] == "" || $field_couplet[$field_text] == "" ){
                    $save_figure_fields = FALSE;
                    array_push($figure_errors,  "The URL or Text is blank for the " . $error_notice_name[$field_type] . " link.");
                }
                if (!$field_couplet[$field_url] == "" ) {
                    if ( $this -> url_check($field_couplet[$field_url]) == FALSE ) {
                        $save_figure_fields = FALSE;
                        array_push($figure_errors, "The URL for the " . $error_notice_name[$field_type] . " link is not valid");
                    } else {
                        // Set cURL options
                        $ch = curl_init($field_couplet[$field_url]);
                        $userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  // Return the transfer as a string
                        curl_setopt($ch, CURLOPT_NOBODY, true);  // Exclude the body from the output
                        curl_setopt($ch, CURLOPT_HEADER, true);  // Include the header in the output
                        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  // Follow redirects
                        curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);  // Set User-Agent header

                        // Execute cURL session
                        curl_exec($ch);

                        // Get the headers
                        $headers = curl_getinfo($ch);

                        // Close cURL session
                        curl_close($ch);

                        if ($headers["http_code"] != 200){
                            array_push($figure_warnings, "The URL for the " . $error_notice_name[$field_type] . " link cannot be accessed. This may be because there is something wrong with that URL. Alternatively, the automatic process used to check URL's might have been blocked in this case.");                               
                        }
                    }
                }
            }
        }

        if (!empty($figure_warnings)){
            $_SESSION["figure_warnings"] = $figure_warnings; // Store array directly   
        }
        if ($save_figure_fields == FALSE) {
            $_SESSION["figure_errors"] = $figure_errors; // Store array directly
            $_SESSION["figure_post_status"] = "post_error";

            // Instamtiate the modal class 
            $figure_class = new Webcr_Figure( $this->plugin_name, $this->version ); // Assuming this is your modal class
            
            // Get the fields configuration
            $fields_config = $this->get_fields_config('figure', $figure_class);
            
            // save the fields to the transient
            $function_utilities = new Webcr_Utility();
            $function_utilities ->  fields_to_transient('figure_error_all_fields', $fields_config, 30);
        } else {
            $_SESSION["figure_post_status"] = "post_good";
        }
        return $save_figure_fields;
    }
    
    // The purpose of this function is to validate the fields of the Modal custom content type. If validation fails, it sets a cookie with the error messages and the values of the fields that were submitted. 
    // It also sets a cookie to indicate whether the post was successful or not. If the function returns false, it means that the validation failed and the post was not saved. 
    // However, the page is reloaded and an error message is displayed to the user.
    public function validate_modal(){
        $save_modal_fields = true;

        // Clear previous validation data from session
        unset($_SESSION["modal_errors"]);
        unset($_SESSION["modal_warnings"]);
        unset($_SESSION["modal_post_status"]);

        $modal_errors = [];
        $modal_warnings = [];

        //Check modal title for potential errors
        $modal_title = $_POST["post_title"];
        $words = explode(' ', $modal_title);
        
        foreach ($words as $word) {
            // Remove any punctuation for accurate word length
            $clean_word = preg_replace('/[^\p{L}\p{N}]/u', '', $word);
            if (strlen($clean_word) > 14) {
                array_push($modal_warnings, "The word '" . $clean_word . "' in the modal title is longer than 14 characters, which may cause issues in mobile view.");
            } 
        }

        // Report warning if total title length exceeds 70 characters
        $string_length = strlen($modal_title);
        if ($string_length > 70) {
            array_push($modal_warnings, "The title length is {$string_length} characters long, which exceeds the 70 character limit recommendation for proper layout.");
        }

        if ($_POST["modal_location"] == " " || $_POST["modal_location"] == "") {
            array_push($modal_errors,  "The Instance field cannot be left blank.");
            $save_modal_fields = FALSE;
        }

        if ($_POST["modal_scene"] == " " || $_POST["modal_scene"] == "") {
            array_push($modal_errors,  "The Scene field cannot be left blank.");
            $save_modal_fields = FALSE;
        }

        if ($_POST["modal_icons"] == " " || $_POST["modal_icons"] == "") {
            array_push($modal_errors,  "The Icons field cannot be left blank.");
            $save_modal_fields = FALSE;
        } 

        if ($_POST["modal_scene"] != " " && $_POST["modal_icons"] != " "){

            $icon_id = $_POST["modal_icons"];
            $scene_id = $_POST["modal_scene"];

            $args = array(
                'post_type'      => 'modal',       // Specify the custom post type
                'posts_per_page' => -1,          // Ensure we count all matching posts, not just the first page
                'fields'         => 'ids',         // More efficient: Only retrieve post IDs, not full post objects
                'meta_query'     => array(
                    'relation' => 'AND', // Both conditions must be true
                    array(
                        'key'     => 'modal_icons', // First custom field key
                        'value'   => $icon_id,      // Value to match for modal_icons
                        'compare' => '=',           // Exact match comparison
                   //     'type'    => 'NUMERIC',     // Treat the value as a number
                    ),
                    array(
                        'key'     => 'modal_scene', // Second custom field key
                        'value'   => $scene_id,     // Value to match for modal_scene
                        'compare' => '=',           // Exact match comparison
                        'type'    => 'NUMERIC',     // Treat the value as a number
                    ),
                ),
                // Performance optimizations for counting:
                'no_found_rows'          => false, // We *need* found_rows to get the count
                'cache_results'          => false, // Disable caching if you need the absolute latest count
                'update_post_meta_cache' => false, // Don't need post meta cache for counting IDs
                'update_post_term_cache' => false, // Don't need term cache for counting IDs
            );
        
            // Create a new WP_Query instance
            $query = new WP_Query( $args );
        
            // Get the total number of posts found by the query
            $record_count = $query->found_posts;
            if ($record_count > 1){
                array_push($modal_warnings, "This icon has already been claimed by one or more other modals.");                               
            } else if ($record_count == 1){
                $saved_ID = $query->posts[0];
                if ($saved_ID != $_POST['post_ID']) {
                    array_push($modal_warnings, "This icon has already been claimed by one or more other modals.");                               
                }
            }           
        
        }
        // If the associated scene contains sections, force the use of sections with this modal
        if ($_POST["modal_scene"] != ""){
            $scene_ID = intval($_POST["modal_scene"]);
            $scene_toc_style = get_post_meta($scene_ID, "scene_toc_style", true);
            $scene_section_number = get_post_meta($scene_ID, "scene_section_number", true);
            if ($scene_toc_style != "list" && $scene_section_number != 0){
                if ($_POST["icon_toc_section"] == ""){
                    array_push($modal_errors,  "The Icon Section field cannot be left blank.");
                    $save_modal_fields = FALSE;
                }
            }
        }

        // Based upon the value of the icon action field (that's the title, but the actual name is icon function), do some error checking
        switch ($_POST["icon_function"]) {
            case "External URL":
                $icon_external_url = $_POST["icon_external_url"];

                if ($icon_external_url == ""){
                    $save_modal_fields = FALSE;
                    array_push($modal_errors,  "The Icon External URL field is blank.");
                } else {
                    if ( $this -> url_check($icon_external_url) == FALSE ) {
                        $save_modal_fields = FALSE;
                        array_push($modal_errors, "The Icon External URL is not valid");
                    } else {
                        // Set cURL options
                        $ch = curl_init($icon_external_url);
                        $userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
                        curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  // Return the transfer as a string
                        curl_setopt($ch, CURLOPT_NOBODY, true);  // Exclude the body from the output
                        curl_setopt($ch, CURLOPT_HEADER, true);  // Include the header in the output
                        curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  // Follow redirects
                        curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);  // Set User-Agent header

                        // Execute cURL session
                        curl_exec($ch);

                        // Get the headers
                        $headers = curl_getinfo($ch);

                        // Close cURL session
                        curl_close($ch);

                        if ($headers["http_code"] != 200){
                            array_push($modal_warnings, "The 'Icon External URL' field cannot be accessed. This may be because there is something wrong with that URL. Alternatively, the automatic process used to check URL's might have been blocked in this case.");                               
                        }
                    }
                }
                break;
            case "Modal":
                $modal_tab_number = $_POST["modal_tab_number"];
                if ($modal_tab_number == 0){
                    $save_modal_fields = FALSE;
                    array_push($modal_errors,  "There must be at least one modal tab if the Icon Action is set to Modal");
                } else {
                    for ($i = 1; $i <= $modal_tab_number; $i++) {
                        $tab_title = $_POST["modal_tab_title" . $i]; 
                        if (empty($tab_title) || is_null($tab_title) ){
                            $save_modal_fields = FALSE;
                            array_push($modal_errors,  "The Modal Tab Title " . $i . " is blank.");
                        }
                    }            
                }
                break;
            case "Scene":
                $icon_scene_out = $_POST["icon_scene_out"];

                if ($icon_scene_out == ""){
                    $save_modal_fields = FALSE;
                    array_push($modal_errors,  "The Icon Scene Out field is blank.");
                } 
                break;
        }

        $field_types = array("info", "photo");

        foreach ($field_types as $field_type){
            for ($i = 1; $i < 7; $i++){

                $form_fieldset = 'modal_' . $field_type .  $i;
                $field_couplet = $_POST[$form_fieldset];
                $field_text = "modal_" . $field_type . "_text" . $i;
                $field_url = "modal_" . $field_type . "_url" . $i;
                $field_photo_internal = "modal_photo_internal" . $i;
                if (!$field_couplet[$field_url] == "" || !$field_couplet[$field_text] == "" ){
                    if ( ($field_type == "info" && ($field_couplet[$field_url] == "" || $field_couplet[$field_text] == "")) || ($field_type == "photo" && ( ($field_couplet[$field_url] == "" && $field_couplet[$field_photo_internal]  == "")  || $field_couplet[$field_text] == ""))   ){
                        $save_modal_fields = FALSE;
                        array_push($modal_errors,  "Error in Modal " . ucfirst($field_type) . " Link " . $i);
                    }
                    if (!$field_couplet[$field_url] == "" ) {
                        if ( $this -> url_check($field_couplet[$field_url]) == FALSE ) {
                            $save_modal_fields = FALSE;
                            array_push($modal_errors, "The URL for Modal " . ucfirst($field_type) . " Link " . $i . " is not valid");
                        } else {
                            // Set cURL options
                            $ch = curl_init($field_couplet[$field_url]);
                            $userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
                            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  // Return the transfer as a string
                            curl_setopt($ch, CURLOPT_NOBODY, true);  // Exclude the body from the output
                            curl_setopt($ch, CURLOPT_HEADER, true);  // Include the header in the output
                            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  // Follow redirects
                            curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);  // Set User-Agent header

                            // Execute cURL session
                            curl_exec($ch);

                            // Get the headers
                            $headers = curl_getinfo($ch);

                            // Close cURL session
                            curl_close($ch);

                            if ($headers["http_code"] != 200){
                                array_push($modal_warnings, "The URL for Modal " . ucfirst($field_type) . " Link " . $i . " cannot be accessed. This may be because there is something wrong with that URL. Alternatively, the automatic process used to check URL's might have been blocked in this case.");                               
                            }
                        }
                    }
                }
            }
        }

        if (!empty($modal_warnings)){
            $_SESSION["modal_warnings"] = $modal_warnings;          
        }
        if ($save_modal_fields == FALSE) {
            $_SESSION["modal_errors"] = $modal_errors; // Store array directly
            $_SESSION["modal_post_status"] = "post_error";

            // Instamtiate the modal class 
            $modal_class = new Webcr_Modal( $this->plugin_name, $this->version ); // Assuming this is your modal class
            
            // Get the fields configuration
            $fields_config = $this->get_fields_config('modal', $modal_class);
            
            // save the fields to the transient
            $function_utilities = new Webcr_Utility();
            $function_utilities ->  fields_to_transient('modal_error_all_fields', $fields_config, 30);

        } else {
            $_SESSION["modal_post_status"] = "post_good";
        }

        return $save_modal_fields;
    }

    // The purpose of this function is to validate the fields of the Scene custom content type. If validation fails, it sets a cookie with the error messages and the values of the fields that were submitted. 
    // It also sets a cookie to indicate whether the post was successful or not. If the function returns false, it means that the validation failed and the post was not saved. 
    // However, the page is reloaded and an error message is displayed to the user.
    public function validate_scene (){
        $save_scene_fields = true;

        // Clear previous validation data from session
        unset($_SESSION["scene_errors"]);
        unset($_SESSION["scene_warnings"]);
        unset($_SESSION["scene_post_status"]);

        $scene_errors = [];
        $scene_warnings = [];

        if ($_POST["scene_location"] == " "){
            array_push($scene_errors,  "The Instance field cannot be left blank.");
            $save_scene_fields = FALSE;
        }

        $scene_infographic = $_POST["scene_infographic"];

        if (is_null($scene_infographic) || $scene_infographic == "" ){
            array_push($scene_errors,  "The Infographic field cannot be left blank.");
            $save_scene_fields = FALSE;
        } else {
            // Parse the URL to extract the path
            $parsed_url = parse_url($scene_infographic);

            // Get the path from the parsed URL
            $path_url = $parsed_url['path'];
            $content_path = rtrim(get_home_path(), '/') . $path_url;

            $infographic_svg_validate = new SVG_Validator();
            $svg_analyze =  $infographic_svg_validate->validate_svg_file($content_path);
          
            if ($svg_analyze['valid'] == false) {
                array_push($scene_errors,  $svg_analyze["error"]);
                $save_scene_fields = FALSE;
            } 
        }

        if ($_POST["scene_toc_style"] != "list" && $_POST["scene_section_number"] == "0"){
            array_push($scene_errors,  "If the field 'Table of contents style' is not set to List, then the 'Number of scene sections' field must be greater than 0."); 
            $save_scene_fields = FALSE;
        }

        if ($_POST["scene_toc_style"] != "list" && $_POST["scene_section_number"] != "0"){
            $section_number = intval($_POST["scene_section_number"]);
            for ($q = 1; $q <= $section_number; $q++){
                if ($_POST["scene_section". $q ]["scene_section_title" . $q] == ""){
                    array_push($scene_errors,  "Scene section title " . $q . " is blank.");
                    $save_scene_fields = FALSE;
                }
            }
        }

        $field_types = array("info", "photo");

        foreach ($field_types as $field_type){
            for ($i = 1; $i < 7; $i++){
                $form_fieldset = 'scene_' . $field_type .  $i;
                $field_couplet = $_POST[$form_fieldset];
                $field_text = "scene_" . $field_type . "_text" . $i;
                $field_url = "scene_" . $field_type . "_url" . $i;
                $field_photo_internal = "scene_photo_internal" . $i;
                if (!$field_couplet[$field_url] == "" || !$field_couplet[$field_text] == "" ){
                    if ( ($field_type == "info" && ($field_couplet[$field_url] == "" || $field_couplet[$field_text] == "")) || ($field_type == "photo" && ( ($field_couplet[$field_url] == "" && $field_couplet[$field_photo_internal]  == "")  || $field_couplet[$field_text] == ""))   ){
                        $save_scene_fields = FALSE;
                        array_push($scene_errors,  "Error in Scene " . ucfirst($field_type) . " Link " . $i);
                    }
                    if (!$field_couplet[$field_url] == "" ) {
                        if ( $this -> url_check($field_couplet[$field_url]) == FALSE ) {
                            $save_scene_fields = FALSE;
                            array_push($scene_errors, "The URL for Scene " . ucfirst($field_type) . " Link " . $i . " is not valid");
                        } else {

                            // Set cURL options
                            $ch = curl_init($field_couplet[$field_url]);
                            $userAgent = "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36";
                            curl_setopt($ch, CURLOPT_RETURNTRANSFER, true);  // Return the transfer as a string
                            curl_setopt($ch, CURLOPT_NOBODY, true);  // Exclude the body from the output
                            curl_setopt($ch, CURLOPT_HEADER, true);  // Include the header in the output
                            curl_setopt($ch, CURLOPT_FOLLOWLOCATION, true);  // Follow redirects
                            curl_setopt($ch, CURLOPT_USERAGENT, $userAgent);  // Set User-Agent header

                            // Execute cURL session
                            curl_exec($ch);

                            // Get the headers
                            $headers = curl_getinfo($ch);

                            // Close cURL session
                            curl_close($ch);

                            if ($headers["http_code"] != 200){
                                array_push($scene_warnings, "The URL for Scene " . ucfirst($field_type) . " Link " . $i . " cannot be accessed");                               
                            }
                        }
                    }
                }
            }
        }
        if (!empty($scene_warnings)){
            $_SESSION["scene_warnings"] = $scene_warnings;       
        }
        if ($save_scene_fields == FALSE) {
            $_SESSION["scene_errors"] = $scene_errors; // Store array directly
            $_SESSION["scene_post_status"] = "post_error";

            // Instamtiate the modal class 
            $scene_class = new Webcr_Scene( $this->plugin_name, $this->version ); // Assuming this is your modal class
            
            // Get the fields configuration
            $fields_config = $this->get_fields_config('scene', $scene_class);
            
            // save the fields to the transient
            $function_utilities = new Webcr_Utility();
            $function_utilities ->  fields_to_transient('scene_error_all_fields', $fields_config, 30);
        } else {
            $_SESSION["scene_post_status"] = "post_good";
        }
        return $save_scene_fields;
    }

    // This function checks whether an input url has valid syntax
    public function url_check ($input_url) {
        if ( filter_var($input_url, FILTER_VALIDATE_URL, FILTER_FLAG_PATH_REQUIRED) == FALSE ) {
            return FALSE;
        } else {
            return TRUE;
        } 
    }
    
    /**
     * Get fields configuration from a content type's field creation method
     * 
     * @param string $content_type The custom content type (e.g., 'modal', 'scene', etc.)
     * @param object $class_instance Instance of the class containing the field creation method
     * @return array The fields configuration array
     */
    public function get_fields_config($content_type, $class_instance) {
        $method_name = 'create_' . $content_type . '_fields';
        
        if (method_exists($class_instance, $method_name)) {
            // We need to modify the field creation methods to return the fields array
            // instead of just creating the options panel
            return $class_instance->$method_name(true); // Pass true to indicate we want fields returned
        }
        
        return [];
    }

}
