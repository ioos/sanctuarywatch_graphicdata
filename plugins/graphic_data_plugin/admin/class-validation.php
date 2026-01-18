<?php

/**
 * The class that defines the validation methods for the fields of the custom content types
 */

include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-utility.php';
include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-graphic-data-SVGValidator.php';

class Validation {

    /**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   public
	 */

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   public
	 * @var      string    $version    The current version of the plugin.
	 */
	public $version = '1.0.0';

    public function master_validate($validate_content_type){
        
        switch ($validate_content_type) {
            case "about":
                return $this->validate_about();
                break;
            case "scene":
                return $this->validate_scene();
                break;
            case "modal":
                return $this->validate_modal();
                break;
            case "figure":
                return $this->validate_figure();
                break;
            case "instance":
                return $this->validate_instance();
                break;
            case "default":
                return false;
        }
    }

    // The purpose of this function is to validate the fields of the About custom content type. 
    public function validate_about (){
        $function_utilities = new Graphic_Data_Utility();
        
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

            // Instantiate the about class - we need this to get the current custom fields list for the content type
            $about_class = new About( ); 
            
            // Get the list of custom fields for the content type
            $fields_config = $this->get_fields_config('about', $about_class);
            
            // save the fields to the transient

            $function_utilities ->  fields_to_transient('about_error_all_fields', $fields_config, 30);
        } else {
            $function_utilities ->  fields_to_transient('about_post_status', "post_good", 30);
        }

        return $save_about_fields;
    }


    /**
     * Validates a post of Instance custom post type before saving.
     *
     * Performs comprehensive validation on a given Instance post. If the validation succeeds, the function 
     * returns true, allowing the post to be saved. If any validation checks fail, it returns false and sets
     * several transients to store error messages, warnings, and field values for display after a page reload.
     *
     * @since 1.0.0
     *
     * @global array $_POST Contains the submitted Modal post type field values.
     * @return bool True if all validation passes and post can be saved, false otherwise.
     *
     * Transients set on validation failure:
     * - 'instance_errors': Array of error messages (30 second expiration)
     * - 'instance_post_status': Set to "post_error" (30 second expiration)
     * - 'instance_error_all_fields': Field configuration and submitted values (30 second expiration)
     *
     * Transient set on validation success:
     * - 'modal_post_status': Set to "post_good" (30 second expiration)
     *
     * Transient potentially set on either validation failure or success:
     * - 'instance_warnings': Array of error messages (30 second expiration)
     */
    public function validate_instance (){

        $function_utilities = new Graphic_Data_Utility();
        $save_instance_fields = true;

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
                    $url_http_code = $this -> check_url_is_accessible($instance_legacy_content_url);
                    if ($url_http_code != 200){
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
            $function_utilities ->  fields_to_transient('instance_warnings', $instance_warnings, 30);         
        }
        if ($save_instance_fields == FALSE) {
            $function_utilities ->  fields_to_transient('instance_errors', $instance_errors, 30);  
            $function_utilities ->  fields_to_transient('instance_post_status', "post_error", 30);  

            // Instantiate the modal class - we need this to get the current custom fields list for the content type
            $instance_class = new Instance(); 
            
            // Get the list of custom fields for the content type
            $fields_config = $this->get_fields_config('instance', $instance_class);
            
            // save the fields to the transient
            $function_utilities ->  fields_to_transient('instance_error_all_fields', $fields_config, 30);
        } else {
            $function_utilities ->  fields_to_transient('instance_post_status', "post_good", 30);  
        }

        return $save_instance_fields;
    }


    /**
     * Validates a post of Figure custom post type before saving.
     *
     * Performs comprehensive validation on a given Figure post. If the validation succeeds, the function 
     * returns true, allowing the post to be saved. If any validation checks fail, it returns false and sets
     * several transients to store error messages, warnings, and field values for display after a page reload.
     *
     * @since 1.0.0
     *
     * @global array $_POST Contains the submitted Figure post type field values.
     * @return bool True if all validation passes and post can be saved, false otherwise.
     *
     * Transients set on validation failure:
     * - 'figure_errors': Array of error messages (30 second expiration)
     * - 'figure_post_status': Set to "post_error" (30 second expiration)
     * - 'figure_error_all_fields': Field configuration and submitted values (30 second expiration)
     *
     * Transient set on validation success:
     * - 'figure_post_status': Set to "post_good" (30 second expiration)
     *
     * Transient potentially set on either validation failure or success:
     * - 'figure_warnings': Array of error messages (30 second expiration)
     */
    public function validate_figure (){

        $function_utilities = new Graphic_Data_Utility();
        $save_figure_fields = true;

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
                    $url_http_code = $this -> check_url_is_accessible($figure_external_url);
                    if ($url_http_code != 200){
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
                        $url_http_code = $this -> check_url_is_accessible($field_couplet[$field_url]);
                        if ($url_http_code != 200){
                            array_push($figure_warnings, "The URL for the " . $error_notice_name[$field_type] . " link cannot be accessed. This may be because there is something wrong with that URL. Alternatively, the automatic process used to check URL's might have been blocked in this case.");                               
                        }
                    }
                }
            }
        }

        if (!empty($figure_warnings)){
            $function_utilities ->  fields_to_transient('figure_warnings', $figure_warnings, 30);         
        }
        if ($save_figure_fields == FALSE) {
            $function_utilities ->  fields_to_transient('figure_errors', $figure_errors, 30);  
            $function_utilities ->  fields_to_transient('figure_post_status', "post_error", 30);  

            // Instantiate the figure class - we need this to get the current custom fields list for the content type
            $figure_class = new Figure(); 
            
            // Get the list of custom fields for the content type
            $fields_config = $this->get_fields_config('figure', $figure_class);
            
            // save the fields to the transient

            $function_utilities ->  fields_to_transient('figure_error_all_fields', $fields_config, 30);
        } else {
            $function_utilities ->  fields_to_transient('figure_post_status', "post_good", 30);  
        }
        return $save_figure_fields;
    }
    
    /**
     * Validates a post of Modal custom post type before saving.
     *
     * Performs comprehensive validation on a given Modal post. If the validation succeeds, the function 
     * returns true, allowing the post to be saved. If any validation checks fail, it returns false and sets
     * several transients to store error messages, warnings, and field values for display after a page reload.
     *
     * @since 1.0.0
     *
     * @global array $_POST Contains the submitted Modal post type field values.
     * @return bool True if all validation passes and post can be saved, false otherwise.
     *
     * Transients set on new modal post:
     * - 'modal_new_post': Set to "true"  (30 second expiration)
     * 
     * Transients set on validation failure:
     * - 'modal_errors': Array of error messages (30 second expiration)
     * - 'modal_post_status': Set to "post_error" (30 second expiration)
     * - 'modal_error_all_fields': Field configuration and submitted values (30 second expiration)
     *
     * Transient set on validation success:
     * - 'modal_post_status': Set to "post_good" (30 second expiration)
     *
     * Transient potentially set on either validation failure or success:
     * - 'modal_warnings': Array of error messages (30 second expiration)
     */
    public function validate_modal(){

        $function_utilities = new Graphic_Data_Utility();
        $save_modal_fields = true;

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
                        $url_http_code = $this -> check_url_is_accessible($icon_external_url);
                        if ($url_http_code != 200){
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

            if ($field_type == "info"){
                $field_max = intval($_POST["modal_info_entries"]) +1;
            } else {
                $field_max = intval($_POST["modal_photo_entries"]) +1;
            }

            for ($i = 1; $i < $field_max; $i++){

                $form_fieldset = 'modal_' . $field_type .  $i;
                $field_couplet = $_POST[$form_fieldset];
                $field_text = "modal_" . $field_type . "_text" . $i;
                $field_url = "modal_" . $field_type . "_url" . $i;
                $field_photo_internal = "modal_photo_internal" . $i;

                if ($field_couplet[$field_url] == "" && $field_couplet[$field_text] == "" ){
                    $save_modal_fields = FALSE;
                    array_push($modal_errors,  "The Modal " . ucfirst($field_type) . " Link " . $i . " is blank.");
                } else {
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
                                $url_http_code = $this -> check_url_is_accessible($field_couplet[$field_url]);
                                if ($url_http_code != 200){
                                    array_push($modal_warnings, "The URL for Modal " . ucfirst($field_type) . " Link " . $i . " cannot be accessed. This may be because there is something wrong with that URL. Alternatively, the automatic process used to check URL's might have been blocked in this case.");                               
                                }
                            }
                        }
                    }
                }
            }
        }

        if (!empty($modal_warnings)){
            $function_utilities ->  fields_to_transient('modal_warnings', $modal_warnings, 30);                
        }
        if ($save_modal_fields == FALSE) {

            $function_utilities ->  fields_to_transient('modal_errors', $modal_errors, 30);  
            $function_utilities ->  fields_to_transient('modal_post_status', "post_error", 30);  

            // Instantiate the modal class - we need this to get the current custom fields list for the content type
            $modal_class = new Modal( ); 
            
            // Get the custom fields list for the content type
            $fields_config = $this->get_fields_config('modal', $modal_class);
            
            // save the fields to the transient
            $function_utilities ->  fields_to_transient('modal_error_all_fields', $fields_config, 30);

        } else {
            $function_utilities ->  fields_to_transient('modal_post_status', "post_good", 30);  
        }

        if (isset($_POST['_wp_http_referer'])) {
            $http_referer = $_POST['_wp_http_referer'];
            if (str_contains($http_referer, 'post-new.php')) {
                $function_utilities ->  fields_to_transient('modal_post_new', "true", 30);  
            }
        }

        return $save_modal_fields;
    }

    /**
     * Validates a post of Scene custom post type before saving.
     *
     * Performs comprehensive validation on a given Scene post. If the validation succeeds, the function 
     * returns true, allowing the post to be saved. If any validation checks fail, it returns false and sets
     * several transients to store error messages, warnings, and field values for display after a page reload.
     *
     * @since 1.0.0
     *
     * @global array $_POST Contains the submitted Scene post type field values.
     * @return bool True if all validation passes and post can be saved, false otherwise.
     *
     * Transients set on validation failure:
     * - 'scene_errors': Array of error messages (30 second expiration)
     * - 'scene_warnings': Array of warning messages (30 second expiration)
     * - 'scene_post_status': Set to "post_error" (30 second expiration)
     * - 'scene_error_all_fields': Field configuration and submitted values (30 second expiration)
     *
     * Transient set on validation success:
     * - 'scene_post_status': Set to "post_good" (30 second expiration)
     *
     * Transient potentially set on either validation failure or success:
     * - 'scene_warnings': Array of error messages (30 second expiration)
     */
    public function validate_scene (){
        $function_utilities = new Graphic_Data_Utility();
        $save_scene_fields = true;

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

            $infographic_svg_validate = new Graphic_Data_SVG_Validator();
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
            if ($field_type == "info"){
                $field_max = intval($_POST["scene_info_entries"]) +1;
            } else {
                $field_max = intval($_POST["scene_photo_entries"]) +1;
            }
            for ($i = 1; $i < $field_max; $i++){
                $form_fieldset = 'scene_' . $field_type .  $i;
                $field_couplet = $_POST[$form_fieldset];
                $field_text = "scene_" . $field_type . "_text" . $i;
                $field_url = "scene_" . $field_type . "_url" . $i;
                $field_photo_internal = "scene_photo_internal" . $i;
                if ($field_couplet[$field_url] == "" && $field_couplet[$field_text] == "" ){
                    $save_scene_fields = FALSE;
                    array_push($scene_errors,  "The Scene " . ucfirst($field_type) . " Link " . $i . " is blank.");
                } else {
                    if ( ($field_type === "info" && ($field_couplet[$field_url] === "" || $field_couplet[$field_text] === "")) || ($field_type === "photo" && ( ($field_couplet[$field_url] === "" && $field_couplet[$field_photo_internal]  === "")  || $field_couplet[$field_text] === ""))   ){
                        $save_scene_fields = FALSE;
                        array_push($scene_errors,  "Error in Scene " . ucfirst($field_type) . " Link " . $i);
                    }
                    if (!$field_couplet[$field_url] == "" ) {
                        if ( $this -> url_check($field_couplet[$field_url]) == FALSE ) {
                            $save_scene_fields = FALSE;
                            array_push($scene_errors, "The URL for Scene " . ucfirst($field_type) . " Link " . $i . " is not valid");
                        } else {
                            $url_http_code = $this -> check_url_is_accessible($field_couplet[$field_url]);
                            if ($url_http_code != 200){
                                array_push($scene_warnings, "The URL for Scene " . ucfirst($field_type) . " Link " . $i . " cannot be accessed");                               
                            }
                        }
                    }
                }
            }
        }
        if (!empty($scene_warnings)){
            $function_utilities ->  fields_to_transient('scene_warnings', $scene_warnings, 30);        
        }
        if ($save_scene_fields == FALSE) {
            $function_utilities ->  fields_to_transient('scene_errors', $scene_errors, 30);  
            $function_utilities ->  fields_to_transient('scene_post_status', "post_error", 30);  

            // Instantiate the scene class - we need this to get the current custom fields list for the content type
            $scene_class = new Scene( ); 
            
            // Get the custom fields list for the content type
            $fields_config = $this->get_fields_config('scene', $scene_class);
            
            // save the fields to the transient
            $function_utilities ->  fields_to_transient('scene_error_all_fields', $fields_config, 30);
        } else {
            $function_utilities ->  fields_to_transient('scene_post_status', "post_good", 30);  
        }
        return $save_scene_fields;
    }

    /**
     * Return HTTP status code for a given URL to check if it's accessible.
     * 
     * This function uses cURL to perform a HEAD request to the specified URL and retrieves the HTTP status code. Note that 
     * prior to this funciton being called, the URL to be checked has already been validated for correct syntax, so it
     * doesn't need to be validated again here.
     * 
     * @param string $url_to_be_checked The URL to be checked for accessibility.
     * @return integer The HTTP status code for the URL (e.g., 200 for accessible, 404 for not found, etc.)
     */
    public function check_url_is_accessible($url_to_be_checked) {

        // Set cURL options
        $ch = curl_init($url_to_be_checked);
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

        // return the HTTP code for url that is being checked (note anything other than 200 is a problem)
        return $headers["http_code"];
    }

    /**
     * Validates URL syntax with path requirement.
     *
     * Checks whether the provided URL has valid syntax according to PHP's URL
     * validation filter. The URL must include a path component to pass validation.
     *
     * @since 1.0.0
     *
     * @param string $input_url The URL to validate.
     * @return bool True if the URL is valid and contains a path, false otherwise.
     *
     * @example
     * $this->url_check('https://example.com/path'); // Returns true
     * $this->url_check('https://example.com');      // Returns false (no path)
     * $this->url_check('not-a-url');                // Returns false
     */
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
