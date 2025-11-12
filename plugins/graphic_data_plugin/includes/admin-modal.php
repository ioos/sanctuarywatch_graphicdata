<?php

/**
 * Register class that defines the Modal custom content type as well as associated Modal functions 
 * 
 */
include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-utility.php';
class Modal {

    /**
	 * Create Modal custom content type.
	 *
	 * @since    1.0.0
	 */
    function custom_content_type_modal() {
        $labels = array(
            'name'                  => _x( 'Modals', 'Post type general name', 'textdomain' ),
            'singular_name'         => _x( 'Modal', 'Post type singular name', 'textdomain' ),
            'menu_name'             => _x( 'Modals', 'Admin Menu text', 'textdomain' ),
            'name_admin_bar'        => _x( 'Modal', 'Add New on Toolbar', 'textdomain' ),
            'add_new'               => __( 'Add New Modal', 'textdomain' ),
            'add_new_item'          => __( 'Add New Modal', 'textdomain' ),
            'new_item'              => __( 'New Modal', 'textdomain' ),
            'edit_item'             => __( 'Edit Modal', 'textdomain' ),
            'view_item'             => __( 'View Modal', 'textdomain' ),
            'all_items'             => __( 'All Modals', 'textdomain' ),
            'search_items'          => __( 'Search Modals', 'textdomain' ),
            'parent_item_colon'     => __( 'Parent Modals:', 'textdomain' ),
            'not_found'             => __( 'No Modals found.', 'textdomain' ),
            'not_found_in_trash'    => __( 'No Modals found in Trash.', 'textdomain' ),
            'featured_image'        => _x( 'Modal Cover Image', 'Overrides the “Featured Image” phrase for this post type. Added in 4.3', 'textdomain' ),
            'set_featured_image'    => _x( 'Set cover image', 'Overrides the “Set featured image” phrase for this post type. Added in 4.3', 'textdomain' ),
            'remove_featured_image' => _x( 'Remove cover image', 'Overrides the “Remove featured image” phrase for this post type. Added in 4.3', 'textdomain' ),
            'use_featured_image'    => _x( 'Use as cover image', 'Overrides the “Use as featured image” phrase for this post type. Added in 4.3', 'textdomain' ),
            'archives'              => _x( 'Modal archives', 'The post type archive label used in nav menus. Default “Post Archives”. Added in 4.4', 'textdomain' ),
            'insert_into_item'      => _x( 'Insert into Modal', 'Overrides the “Insert into post”/”Insert into page” phrase (used when inserting media into a post). Added in 4.4', 'textdomain' ),
            'uploaded_to_this_item' => _x( 'Uploaded to this Modal', 'Overrides the “Uploaded to this post”/”Uploaded to this page” phrase (used when viewing media attached to a post). Added in 4.4', 'textdomain' ),
            'filter_items_list'     => _x( 'Filter Modals list', 'Screen reader text for the filter links heading on the post type listing screen. Default “Filter posts list”/”Filter pages list”. Added in 4.4', 'textdomain' ),
            'items_list_navigation' => _x( 'Modals list navigation', 'Screen reader text for the pagination heading on the post type listing screen. Default “Posts list navigation”/”Pages list navigation”. Added in 4.4', 'textdomain' ),
            'items_list'            => _x( 'Modals list', 'Screen reader text for the items list heading on the post type listing screen. Default “Posts list”/”Pages list”. Added in 4.4', 'textdomain' ),
        );
    
        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'show_in_rest'       => true,
            'query_var'          => true,
            'rewrite'            => array( 'slug' => 'modals' ),
            'capability_type'    => 'post',
            'menu_icon'          => 'dashicons-category',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array( 'title' ), //array( 'title', 'revisions' ), 
        );
    
        register_post_type( 'modal', $args );
    }

    /**
	 * Create custom fields, using metaboxes, for Modal custom content type.
	 *
     * @param bool $return_fields_only If true, only return the custom fields array without registering the metabox (used as part of field validation).
	 * @since    1.0.0
	 */
    function create_modal_fields($return_fields_only = false) {

        $config_metabox = array(

            /*
            * METABOX
            */
            'type'              => 'metabox',                       // Required, menu or metabox
            'id'                => 'graphic_data_plugin',              // Required, meta box id, unique, for saving meta: id[field-id]
            'post_types'        => array( 'modal' ),                 // Post types to display meta box
            'context'           => 'advanced',                      // 	The context within the screen where the boxes should display: 'normal', 'side', and 'advanced'.
            'priority'          => 'default',                       // 	The priority within the context where the boxes should show ('high', 'low').
            'title'             => 'Modal Fields',                  // The title of the metabox
            'capability'        => 'edit_posts',                    // The capability needed to view the page
            'tabbed'            => true,
            'options'           => 'simple',                        // Only for metabox, options is stored az induvidual meta key, value pair.
        );

        // get list of locations
        $function_utilities = new Utility();
        $locations = $function_utilities -> returnAllInstances();

        $transient_fields_exist = false;
        
        // Get current user ID
        $user_id = get_current_user_id();
                
        // Check if transient exists for this user
        $transient_name = "modal_error_all_fields_user_{$user_id}";
        $transient_fields = get_transient($transient_name);
        
        if ($transient_fields !== false) {
            $transient_fields_exist = true;
        }

        $scene_titles =[];
        $modal_icons = [];
        $icon_scene_out = []; 
        $modal_section = [];
        // used by both scene and icon dropdowns
        if (array_key_exists("post", $_GET)) {
            $modal_id = intval($_GET["post"]);
            $scene_id = intval(get_post_meta($modal_id, "modal_scene", true));
            $scene_titles = $function_utilities -> returnSceneTitles($scene_id, $modal_id);
            if ($transient_fields_exist){
                $scene_titles = $function_utilities -> returnSceneTitles($transient_fields["modal_scene"], $modal_id);
            } else {
                $scene_titles = $function_utilities -> returnSceneTitles($scene_id, $modal_id);
            }   

            if ($transient_fields_exist){
                $modal_icons = $function_utilities -> returnIcons($transient_fields["modal_scene"]);
            } else {
                $modal_icons = $function_utilities -> returnIcons($scene_id);
            }  

            if ($transient_fields_exist){
                $icon_scene_out = $function_utilities -> returnScenesExceptCurrent($transient_fields["modal_scene"]);
            } else {
                $icon_scene_out = $function_utilities -> returnScenesExceptCurrent($scene_id);
            }  

            if ($transient_fields_exist){
                $modal_section = $function_utilities -> returnModalSections($transient_fields["modal_scene"]);
            } else {
                $modal_section = $function_utilities -> returnModalSections($scene_id);
            }  
        }

        $fields = array(
            array(
                'id'             => 'modal_published',
                'type'           => 'select',
                'title'          => 'Modal Status*',
                'options'        => array("draft" => "Draft", "published" => "Published"),
                'default'        => 'draft',
                'description' => 'Should the modal be live? If set to Draft, the assigned icon for this modal will behave as set in the scene option "Icon visibility in scene, if no associated modal". If set to Published, the icon will be visible in the scene.',
            ),
            array(
                'id'             => 'modal_location',
                'type'           => 'select',
                'title'          => 'Instance*',
                'options'        => $locations,
                'description' => 'In which instance is the modal located?',
                'default'        =>  '',
            ),
            array(
                'id'             => 'modal_scene',
                'type'           => 'select',
                'title'          => 'Scene*',
                'options'        => $scene_titles,
                'description' => 'In which scene is the modal located?',
                'default'        =>  '',
            ),
            array(
                'id'             => 'modal_icons',
                'type'           => 'select',
                'title'          => 'Icons*',
                'options'        => $modal_icons, 
                'description' => 'Which icon from the above scene is the modal associated with?',
                'default'        =>  '',
            ),
            array(
                'id'      => 'modal_icon_order',
                'type'    => 'number',
                'title'   => 'Icon order (optional)',
                'min'     => '1',
                'max'     => '20',
                'step'    => '1',
                'description' => "In the table of contents to the right of the scene, what is the order in which this icon should appear? Lower numbers will appear first. All icons with the same order number (example: all icons keep the default value of 1), will be sorted alphabetically.",
                'default'        => 1,
            ),
            array(
                'id'             => 'icon_toc_section',
                'type'           => 'select',
                'title'          => 'Icon Section*',
                'options'        =>  $modal_section,
                'description'    => 'Which scene section is this modal associated with?',
                'default'        => '',
            ),
            array(
                'id'             => 'icon_function',
                'type'           => 'select',
                'title'          => 'Icon Action*',
                'options'        => array("External URL" => "Link to External URL", "Scene" => "Link to Scene", "Modal" => "Open Modal"),
                'description'    => 'What should happen when the user clicks on the icon?',
                'default'        =>  'Modal',
            ),
            array(
                'id'          => 'icon_external_url',
                'type'        => 'text',
                'title'       => 'Icon External URL*',
                'class'       => 'text-class',   
                'description' => 'What is the external URL that the user should be taken to when the icon is clicked?',  
                'sanitize'    => array($function_utilities, 'dummy_sanitize'), // Prevents automatic URL sanitization

            ),
            array(
                'id'             => 'icon_scene_out',
                'type'           => 'select',
                'title'          => 'Icon Scene Out*',
                'options'        => $icon_scene_out,  
                'description' => 'What is the scene that the user should be taken to when the icon is clicked?',
                'default'        => '',
            ),
            array(
                'id'          => 'modal_tagline',
                'type'   => 'editor',
                'editor' => 'trumbowyg',
                'title'       => 'Modal Tagline',
                'description' => 'What is the modal tagline?',
            ),
            array(
                'id'      => 'modal_info_entries',
                'type'    => 'range',
                'title'   => 'Number of Modal Info Entries',
                'description' => 'How many info links are there for the modal?',
                'min'     => 0,      
                'max'     => 6,         
                'step'    => 1,          
                'default'     => 0,   
            ),    
            array(
                'id'      => 'modal_photo_entries',
                'type'    => 'range',
                'title'   => 'Number of Modal Photo Entries',
                'description' => 'How many photo links are there for the modal?',
                'min'     => 0,     
                'max'     => 6,         
                'step'    => 1,  
                'default'     =>  0,         
            ),     
            array(
                'id'      => 'modal_tab_number',
                'type'    => 'range',
                'title'   => 'Number of Modal Tabs*',
                'description' => 'How many modal tabs are there?',
                'min'     => 1,    
                'default'     =>  1,   
                'max'     => 6,         
                'step'    => 1,             
            ), 
            array(
                'id'          => 'modal_preview',
                'type'        => 'button',
                'title'       => 'Preview Modal',
                'class'        => 'modal_preview',
                'options'     => array(
                    'href'  =>  '#nowhere',
                    'target' => '_self',
                    'value' => 'Preview',
                    'btn-class' => 'exopite-sof-btn'
                ),
            )         
        );

        // Step 1: Create an array to hold the new info sub-arrays
        $infoFields = array();

        // Step 2: Use a loop to generate the new info sub-arrays
        for ($i = 1; $i <= 6; $i++) {
            $infoFields[] = array(
                'type' => 'fieldset',
                'id' => 'modal_info' . $i,
                'title'   => 'Modal Info Link ' . $i,
                'fields' => array(
                    array(
                        'id'          => 'modal_info_text' . $i,
                        'type'        => 'text',
                        'title'       => 'Text',
                        'class'       => 'text-class',
                    ),
                    array(
                        'id'          => 'modal_info_url' . $i,
                        'type'        => 'text',
                        'title'       => 'URL',
                        'class'       => 'text-class',
                        'sanitize'    => array($function_utilities, 'dummy_sanitize'), // Prevents automatic URL sanitization
                    ),
                ),
            );
        }
        // Step 1: Create an array to hold the new info sub-arrays
        $photoFields = array();

        // Step 2: Use a loop to generate the new info sub-arrays
        for ($i = 1; $i <= 6; $i++) {
            $photoFields[] = array(
                'type' => 'fieldset',
                'id' => 'modal_photo' . $i,
                'title'   => 'Modal Photo Link ' . $i,
                'fields' => array(
                    array(
                        'id'             => 'modal_photo_location' . $i,
                        'type'           => 'select',
                        'title'          => 'Image Location',
                        'options'        => array("Internal" => "Within this site", "External" => "Outside of this site"),
                        'default'     => 'External', 
                    ),
                    array(
                        'id'          => 'modal_photo_text' . $i,
                        'type'        => 'text',
                        'title'       => 'Link Text',
                        'class'       => 'text-class',
                    ),
                    array(
                        'id'          => 'modal_photo_url' . $i,
                        'type'        => 'text',
                        'title'       => 'URL',
                        'class'       => 'text-class',
                        'sanitize'    => array($function_utilities, 'dummy_sanitize'), // Prevents automatic URL sanitization

                    ),
                    array(
                        'id'    => 'modal_photo_internal' . $i,
                        'type'  => 'image',
                        'title' => 'Image',
                    ),
                ),
            );
        }

        // Step 1: Create an array to hold the new info sub-arrays
        $tabFields = array();

        // Step 2: Use a loop to generate the new info sub-arrays
        for ($i = 1; $i <= 6; $i++) {
            $tabFields[] = array(
                    'id'          => 'modal_tab_title' . $i,
                    'type'        => 'text',
                    'title'       => 'Modal Tab Title ' . $i. '*',
                    'class'       => 'text-class',
            );
        }

        // Step 3: Insert the new sub-arrays after the second element in the original 'fields' array
        array_splice($fields, 11, 0, $infoFields);
        array_splice($fields, 18, 0, $photoFields);
        array_splice($fields, 25, 0, $tabFields);

        // If we're just running this function to get the custom field list for field validation, return early
        if ($return_fields_only) {
            return $fields;
        }

        $fieldsHolder[] = array(
            'name'   => 'basic',
            'title'  => 'Basic',
            'icon'   => 'dashicons-admin-generic',
            'fields' => $fields,
        );

        // instantiate the admin page
        $options_panel = new Exopite_Simple_Options_Framework( $config_metabox, $fieldsHolder ); 

        // Create array of fields to be registered with register_meta
        $fieldsToBeRegistered = array(
            array('modal_scene', 'integer', 'The modal scene'),
            array('modal_icon_order', 'integer', 'The modal icon order'),
            array('icon_function', 'string', 'The icon function'),           
            array('modal_published', 'string', 'The icon function'),
            array('modal_tagline', 'string', 'The modal tagline'),
            array('icon_toc_section', 'string', 'The icon table of contents section'),
            array('modal_info_entries', 'integer', 'The number of info links'),
            array('modal_photo_entries', 'integer', 'The number of photo links'),
            array('modal_tab_number', 'integer', 'The number of modal tabs'),
        );

        for ($i = 1; $i < 7; $i++ ) {
            $fieldsToBeRegistered[] = array('modal_tab_title' . $i, 'string', 'Modal tab ' . $i);
        }
        foreach ($fieldsToBeRegistered as $targetSubArray) {
            register_meta(
                'post', // Object type. In this case, 'post' refers to custom post type 'Scene'
                $targetSubArray[0], // Meta key name
                array(
                    'show_in_rest' => true, // Make the field available in REST API
                    'single' => true, // Indicates whether the meta key has one single value
                    'type' => $targetSubArray[1], // Data type of the meta value
                    'description' => $targetSubArray[2], // Description of the meta key
                    'auth_callback' => '__return_false'
                )
            );
        }

        $fieldAndDescription = array(
            array('modal_info', 'Info link '),
            array('modal_photo', 'Photo link '),
            array('modal_photo_internal', 'Internal photo link ')
        );

        for ($i = 1; $i < 7; $i++ ) {
            foreach($fieldAndDescription as $targetFieldAndDescription){
                $target_field = $targetFieldAndDescription[0] . $i;
                $target_description = $targetFieldAndDescription[1] . $i;
                register_meta( 'post', 
                    $target_field,
                    array(
                        'auth_callback'     => '__return_false' ,
                        'single'            => true, // The field contains a single array
                        'description' => $target_description, // Description of the meta key
                        'show_in_rest'      => array(
                            'schema' => array(
                                'type'  => 'array', // The meta field is an array
                                'items' => array(
                                    'type' => 'string', // Each item in the array is a string
                                ),
                            ),
                        ),
                    ) 
                );
            }
        }
    }

    /**
	 * Register Modal custom fields for use by REST API.
	 *
	 * @since    1.0.0
	 */
    function register_modal_rest_fields() {
        $modal_rest_fields = array('modal_scene','modal_tagline', 'modal_published', 'modal_icon_order', 'icon_function','modal_info_entries', 
            'modal_photo_entries', 'modal_tab_number', 'icon_toc_section');

            for ($i = 1; $i < 7; $i++){
                array_push($modal_rest_fields,'modal_info' . $i, 'modal_photo' . $i, 'modal_tab_title' . $i );
            }
            $function_utilities = new Utility();
            $function_utilities -> register_custom_rest_fields("modal", $modal_rest_fields);
    }

    /**
	 * Add a filter to support filtering by "modal_location" in REST API queries.
	 *
	 * @since    1.0.0
	 */
    function filter_modal_by_modal_scene($args, $request) {
        if (isset($request['modal_scene'])) {
            $args['meta_query'][] = array(
                'key' => 'modal_scene',
                'value' => $request['modal_scene'],
                'compare' => 'LIKE', // Change comparison method as needed
            );
        }
        // Filter by icon_function if set
        if (isset($request['icon_function'])) {
            $args['meta_query'][] = array(
                'key'     => 'icon_function',
                'value'   => $request['icon_function'],
                'compare' => '='
            );
        }
        $args['orderby'] = 'title';
        $args['order'] = 'ASC';
        return $args;
    }

    /**
	 * Set columns in admin screen for Modal custom content type.
	 *
     * @link https://www.smashingmagazine.com/2017/12/customizing-admin-columns-wordpress/
	 * @since    1.0.0
	 */
    function change_modal_columns( $columns ) {
        $columns = array (
            'title' => 'Title',
            'modal_location' => 'Instance',
            'modal_scene' => 'Scene',		
            'modal_icons' => 'Icon',	
            'icon_function' => 'Function',		
            'modal_tagline' => 'Tagline',			
            'tabs' => 'Tabs (# of Figures)<br><span style="font-weight:normal; font-size:0.9em; color:#666;"><a href="https://ioos.github.io/sanctuarywatch_graphicdata/figures/#status" target="_blank">Bold = no live figures</a></span>',	
            'status' => 'Status',
        );
        return $columns;
    }

    /**
     * Store filter values in user metadata with 20-minute expiration.
     *
     * This function captures the current filter selections from the URL parameters
     * and stores them in user metadata with a 20-minute expiration timestamp.
     * It only runs on the Modal post type admin screen and requires a logged-in user.
     *
     * @since    1.0.0
     * @access   public
     * @return   void
     */
    function store_modal_filter_values() {
        $screen = get_current_screen();
        if ($screen->id != 'edit-modal') {
            return;
        }
        
        $user_id = get_current_user_id();
        if (!$user_id) {
            return;
        }
        
        // Get current timestamp
        $current_time = time();
        
        // Store the expiration time (20 minutes = 1200 seconds)
        $expiration_time = $current_time + 1200;
        
        // Store field_length filter value if it exists
        if (isset($_GET['field_length']) && !empty($_GET['field_length'])) {
            update_user_meta($user_id, 'modal_field_length', $_GET['field_length']); //come back here
            update_user_meta($user_id, 'modal_field_length_expiration', $expiration_time);
        }
        
        // Store modal_instance filter value if it exists
        if (isset($_GET['modal_instance']) && !empty($_GET['modal_instance'])) {
            update_user_meta($user_id, 'modal_instance', $_GET['modal_instance']);
            update_user_meta($user_id, 'modal_instance_expiration', $expiration_time);
        }
        
        // Store modal_scene filter value if it exists
        if (isset($_GET['modal_scene']) && !empty($_GET['modal_scene'])) {
            update_user_meta($user_id, 'modal_scene', $_GET['modal_scene']);
            update_user_meta($user_id, 'modal_scene_expiration', $expiration_time);
        }
    }

    /**
     * Check if stored filter values are still valid and retrieve them if they are.
     *
     * This function retrieves a stored filter value from user metadata and verifies
     * if it has exceeded its expiration time. If the value has expired, it cleans up
     * the metadata entries and returns false. Otherwise, it returns the stored value.
     *
     * @since    1.0.0
     * @access   public
     * @param    string  $meta_key  The meta key to check expiration for.
     * @return   bool|string        False if expired or not found, the value if still valid.
     */
    function get_modal_filter_value($meta_key) {
        $user_id = get_current_user_id();
        if (!$user_id) {
            return false;
        }
        
        $value = get_user_meta($user_id, $meta_key, true);
        if (empty($value)) {
            return false;
        }
        
        // Check if the value has expired
        $expiration_time = get_user_meta($user_id, $meta_key . '_expiration', true);
        $current_time = time();
        
        if ($current_time > $expiration_time) {
            // Delete expired values
            delete_user_meta($user_id, $meta_key);
            delete_user_meta($user_id, $meta_key . '_expiration');
            return false;
        }
        
        return $value;
    }

    /**
     * Enqueues custom CSS for modal admin columns on the post type edit screen.
     *
     * This function conditionally loads CSS styling for the admin columns display
     * when viewing the list of 'modal' custom post type entries in the WordPress admin.
     * The CSS is only enqueued when on the edit.php screen for the modal post type.
     *
     * @since 1.0.0
     *
     * @param string $hook The current admin page hook suffix.
     *
     * @return void
     */
    function enqueue_modal_admin_columns_css($hook) {
        // Get the current screen object.
        $screen = get_current_screen();
    
        // Check if we are on the edit screen for the custom post type 'scene'.
        if ($screen->post_type === 'modal' && $screen->base === 'edit') {
            // Enqueue CSS file.
            wp_enqueue_style(
                'modal-admin-columns-css', // Handle of the CSS file.
                plugin_dir_url( __DIR__ ) . 'admin/css/modal-admin-columns.css');
        }
    }

    /**
     * Add filter dropdowns for the Modal admin screen with persistent selection support.
     *
     * This function creates and outputs filter dropdowns for field length, instance,
     * and scene on the Modal post type admin screen. It first checks for filter values
     * in the URL parameters, then falls back to stored user metadata values if they 
     * haven't expired. After displaying the dropdowns, it stores the current selections
     * for future use.
     *
     * @since    1.0.0
     * @access   public
     * @return   void
     */
    function modal_filter_dropdowns() {
        $screen = get_current_screen();
        if ($screen->id == 'edit-modal') {
            // Field Length dropdown
            $fieldOptions = array(
                array("", "large", "Full tagline"),
                array("", "medium", "Medium tagline"),
                array("", "small", "Short tagline")
            );

            // Check for filter in URL first, then check for stored value
            $field_length = isset($_GET["field_length"]) ? $_GET["field_length"] : $this->get_modal_filter_value('modal_field_length');
            
            if ($field_length) {
                switch ($field_length) {
                    case "large":
                        $fieldOptions[0][0] = "selected ";
                        break;
                    case "medium":
                        $fieldOptions[1][0] = "selected ";
                        break;
                    case "small":
                        $fieldOptions[2][0] = "selected ";
                        break;
                }
            } else {
                $fieldOptions[2][0] = "selected ";
            }

            $field_length_dropdown = '<select name="field_length" id="field_length">';
            for ($i = 0; $i < 3; $i++) {
                $field_length_dropdown .= '<option ' . $fieldOptions[$i][0] . 'value="' . $fieldOptions[$i][1] . '">' . $fieldOptions[$i][2] . '</option>';
            }
            $field_length_dropdown .= '</select>';

            echo $field_length_dropdown;
            
            $function_utilities = new Utility();
            $function_utilities -> createInstanceDropDownFilter('modal_instance');

            // Scene dropdown
            echo '<select name="modal_scene" id="modal_scene">';
            echo '<option value="">All Scenes</option>';
            
            // Get selected scene from URL or from stored value
            $selected_instance = isset($_GET['modal_instance']) ? $_GET['modal_instance'] : $this->get_modal_filter_value('modal_instance');
            $selected_scene = isset($_GET['modal_scene']) ? $_GET['modal_scene'] : $this->get_modal_filter_value('modal_scene');
            
            if ($selected_instance) {
                global $wpdb;
                $scenes = $wpdb->get_results("
                    SELECT p.ID, p.post_title 
                    FROM $wpdb->posts p
                    INNER JOIN $wpdb->postmeta pm ON p.ID = pm.post_id
                    WHERE p.post_type = 'scene' 
                    AND p.post_status = 'publish'
                    AND pm.meta_key = 'scene_location' 
                    AND pm.meta_value = " . $selected_instance);

                foreach ($scenes as $scene) {
                    $selected = ($selected_scene == $scene->ID) ? 'selected="selected"' : '';
                    echo '<option value="' . $scene->ID . '" ' . $selected . '>' . $scene->post_title . '</option>';
                }
            }
            echo '</select>';
        }
        
        // Store the filter values after displaying the dropdowns
        $this->store_modal_filter_values();
    }

    /**
     * Filter the Modal admin screen results based on selected or stored filter values.
     *
     * This function modifies the WordPress query to filter Modal posts based on the
     * selected location (instance) and scene values. It first checks for values in
     * the URL parameters, then falls back to stored user metadata values that haven't
     * expired. This ensures filter persistence for 20 minutes across page loads.
     *
     * @since    1.0.0
     * @access   public
     * @param    WP_Query  $query  The WordPress Query instance being filtered.
     * @return   void
     */
    function modal_location_filter_results($query) {
        global $pagenow;
        $type = 'modal';
        
        if ($pagenow == 'edit.php' && isset($_GET['post_type']) && $_GET['post_type'] == $type) {
            // Check URL params first, then check stored values
            $instance = isset($_GET['modal_instance']) ? $_GET['modal_instance'] : $this->get_modal_filter_value('modal_instance');
            $scene = isset($_GET['modal_scene']) ? $_GET['modal_scene'] : $this->get_modal_filter_value('modal_scene');
            
            if ($instance) {
                if ($scene) {
                    $meta_query = array(
                        array(
                            'key' => 'modal_scene',
                            'value' => $scene,
                            'compare' => '='
                        )
                    );
                } else {
                    $meta_query = array(
                        array(
                            'key' => 'modal_location',
                            'value' => $instance,
                            'compare' => '='
                        )
                    );
                }
                $query->set('meta_query', $meta_query);
            }
        }
    }

    /**
     * Clean up expired modal filter values in user metadata.
     *
     * This function runs on admin page load and checks if any stored filter values
     * have exceeded their 20-minute expiration time. Any expired values are removed
     * from the database to maintain clean user metadata and prevent stale filters
     * from being applied.
     *
     * @since    1.0.0
     * @access   public
     * @return   void
     */
    function cleanup_expired_modal_filters() {
        $screen = get_current_screen();
        if (!$screen || $screen->id != 'edit-modal') {
            return;
        }
        
        $user_id = get_current_user_id();
        if (!$user_id) {
            return;
        }
        
        $current_time = time();
        
        // Check and clean up field_length
        $expiration_time = get_user_meta($user_id, 'modal_field_length_expiration', true);
        if ($expiration_time && $current_time > $expiration_time) {
            delete_user_meta($user_id, 'modal_field_length');
            delete_user_meta($user_id, 'modal_field_length_expiration');
        }
        
        // Check and clean up modal_instance
        $expiration_time = get_user_meta($user_id, 'modal_instance_expiration', true);
        if ($expiration_time && $current_time > $expiration_time) {
            delete_user_meta($user_id, 'modal_instance');
            delete_user_meta($user_id, 'modal_instance_expiration');
        }
        
        // Check and clean up modal_scene
        $expiration_time = get_user_meta($user_id, 'modal_scene_expiration', true);
        if ($expiration_time && $current_time > $expiration_time) {
            delete_user_meta($user_id, 'modal_scene');
            delete_user_meta($user_id, 'modal_scene_expiration');
        }
    }

    // Display warning notices on the Modal edit screen if tabs lack content
    function modal_warning_notice_tabs() {
        // Get the current screen
        $screen = get_current_screen();
        
        // Check if we're on the post edit screen
        if (!$screen || $screen->base !== 'post') {
            return;
        }
        
        // Check if it's the 'modal' post type
        if ($screen->post_type !== 'modal') {
            return;
        }
        
        // Check if we're editing an existing post (not creating a new one)
        global $post;
        if (!$post || !$post->ID) {
            return;
        }

        // if we're on this page after a return from a new post (meaning the post has been just created), don't show the warning either
        $user_id = get_current_user_id();
        $transient_name = "modal_post_new_user_{$user_id}";
        $transient_fields = get_transient($transient_name);
        
        if ($transient_fields !== false) {
            delete_transient($transient_name);  
            return;
        }
        
        $post_id = $post->ID;   

        $modal_tab_number = get_post_meta( $post_id, 'modal_tab_number', true );
        if ($modal_tab_number !== '' && $modal_tab_number !== false) { //don't go further if the value is empty or doesn't exist
            $show_warning = false;
            $tab_name_array = [];
            for ($i = 1; $i <= $modal_tab_number; $i++){
                $search_field = "modal_tab_title" . $i;
                $tab_name = get_post_meta( $post_id, $search_field, true ); 
                if ($tab_name !== '' && $tab_name !== false){
                    $tab_name_array [] = ['tab_number' => $i, 'tab_name' => $tab_name ];
                }
            }

            if (count($tab_name_array) > 0) {
                global $wpdb;
                $master_warning ="<p>Warning. The following tabs are currently not showing any content.</p><ul class='tab_warning_list'>";
                foreach ($tab_name_array as $tab_name_individual) {

                    $results = $wpdb->get_results(
                        $wpdb->prepare(
                            "SELECT 
                                pm1.post_id,
                                pm3.meta_value AS figure_published
                            FROM 
                                {$wpdb->postmeta} pm1
                            INNER JOIN 
                                {$wpdb->postmeta} pm2 ON pm1.post_id = pm2.post_id
                            INNER JOIN 
                                {$wpdb->postmeta} pm3 ON pm1.post_id = pm3.post_id
                            INNER JOIN
                                {$wpdb->posts} p ON pm1.post_id = p.ID
                            WHERE 
                                pm1.meta_key = 'figure_modal' AND pm1.meta_value = %d
                                AND pm2.meta_key = 'figure_tab' AND pm2.meta_value = %s
                                AND pm3.meta_key = 'figure_published'
                                AND p.post_type = 'figure'",
                            $post_id,
                            $tab_name_individual['tab_number']
                        )
                    );
                    
                    $warning = "";
                    if (empty($results)) {
                        $warning = "Tab " . $tab_name_individual['tab_number'] .  " - " . $tab_name_individual['tab_name'] . ". There are no figures associated with this tab.";
                    } else {
                        $draft_figures_only = true;
                        foreach ($results as $row) {
                            if ($row->figure_published == "published") {
                                $draft_figures_only = false;
                                break;
                            } 
                        }
                        if ($draft_figures_only) {
                            $warning = "Tab " . $tab_name_individual['tab_number'] .  " - " . $tab_name_individual['tab_name'] . ". There are no published figures associated with this tab.";
                        }
                    }

                    if ($warning != ""){
                        $show_warning = true;
                        $master_warning .= "<li>" . esc_html($warning) . "</li>";
                    }

                }

                if ($show_warning){
                    $master_warning .= "</ul>";
                    echo '<div class="notice notice-warning is-dismissible"><p>' . $master_warning . '</p></div>';
                }   
            }   
        }
    }

    /**
	 * Populate custom fields for Modal content type in the admin screen.
	 *
     * @param string $column The name of the column.
     * @param int $post_id The database id of the post.
	 * @since    1.0.0
	 */
    function custom_modal_column( $column, $post_id ) {  

        global $wpdb; // used by Tabs column

        // maybe knock this next section out
        if (isset($_GET["field_length"])) {
            $field_length = sanitize_key($_GET["field_length"]);
        } else {
            $stored_field_length = $this->get_modal_filter_value('modal_field_length');
            $field_length = $stored_field_length ? $stored_field_length : "small"; // Default to "small" if no stored value or expired
        }

        // Populate columns based on the determined field_length
        if ( $column === 'modal_location' ) {
            $instance_id = get_post_meta( $post_id, 'modal_location', true ); 
            echo get_the_title($instance_id ); 
         //   echo get_post_meta( $post_id, 'modal_location', true ); 
        }

        if ( $column === 'modal_scene' ) {
            $scene_id = get_post_meta( $post_id, 'modal_scene', true );
            $scene_title = get_the_title($scene_id);
            echo $scene_title; 
        }

        if ( $column === 'modal_icons' ) {
            echo get_post_meta( $post_id, 'modal_icons', true ); 
        }

        if ( $column === 'icon_function' ) {
            echo get_post_meta( $post_id, 'icon_function', true ); 
        }
        
        if ($column === 'modal_tagline'){
            $modal_tagline = get_post_meta( $post_id, 'modal_tagline', true );
            switch ($field_length){
                case "large":
                    echo $modal_tagline;
                    break;
                case "medium":
                    $medium_tagline = new Utility();
                    $final_tagline = $medium_tagline -> stringTruncate($modal_tagline, 75);
                    echo $final_tagline;
                    break;
                case "small":
                    if ($modal_tagline != NULL){
                        echo '<span class="dashicons dashicons-yes"></span>';
                    }
                    break;
            }
        }

        if ($column == 'tabs'){

            $modal_tab_number = get_post_meta( $post_id, 'modal_tab_number', true );
            if ($modal_tab_number !== '' && $modal_tab_number !== false) { //don't go further if the value is empty or doesn't exist

                $tab_name_array = [];

                for ($i = 1; $i <= $modal_tab_number; $i++){
                    $search_field = "modal_tab_title" . $i;
                    $tab_name = get_post_meta( $post_id, $search_field, true ); 
                    if ($tab_name !== '' && $tab_name !== false){
                        $tab_name_array [] = ['tab_number' => $i, 'tab_name' => $tab_name ];
                    }
                }

                if (count($tab_name_array) > 0) {
                    $tab_list = "<ol class='tab_name_list'>";
                    foreach ($tab_name_array as $tab_name_individual) {

                        $results = $wpdb->get_results(
                            $wpdb->prepare(
                                "SELECT 
                                    pm1.post_id,
                                    pm3.meta_value AS figure_published
                                FROM 
                                    {$wpdb->postmeta} pm1
                                INNER JOIN 
                                    {$wpdb->postmeta} pm2 ON pm1.post_id = pm2.post_id
                                INNER JOIN 
                                    {$wpdb->postmeta} pm3 ON pm1.post_id = pm3.post_id
                                INNER JOIN
                                    {$wpdb->posts} p ON pm1.post_id = p.ID
                                WHERE 
                                    pm1.meta_key = 'figure_modal' AND pm1.meta_value = %d
                                    AND pm2.meta_key = 'figure_tab' AND pm2.meta_value = %s
                                    AND pm3.meta_key = 'figure_published'
                                    AND p.post_type = 'figure'",
                                $post_id,
                                $tab_name_individual['tab_number']
                            )
                        );
                        
                        $fig_number = 0;
                        $draft_figures_only = true;
                        if (!empty($results)) {
                            $fig_number = count($results);
                            foreach ($results as $row) {
                                if ($row->figure_published == "published") {
                                    $draft_figures_only = false;
                                    break;
                                } 
                            }
                        }
                        if ($draft_figures_only) {
                            $tab_list .= "<li style='font-weight:bold;'>" . esc_html($tab_name_individual['tab_name']) . " (" .  $fig_number . ")</li>";
                        } else {
                            $tab_list .= "<li>" . esc_html($tab_name_individual['tab_name']) . " (" .  $fig_number . ")</li>";
                        }


                    }
                    $tab_list .= "</ol>";

                    echo $tab_list; 
                }     
            }
        }

        if ($column === "status"){
            date_default_timezone_set('America/Los_Angeles'); 
            $last_modified_time = get_post_modified_time('g:i A', false, $post_id, true);
            $last_modified_date = get_post_modified_time('F j, Y', false, $post_id, true);
            $last_modified_user_id = get_post_meta($post_id, '_edit_last', true);
            if (empty($last_modified_user_id)){
                 $last_modified_user_id = get_post_field('post_author', $post_id);
            }
            $last_modified_user = get_userdata($last_modified_user_id);
            $last_modified_name = $last_modified_user -> first_name . " " . $last_modified_user -> last_name; 

            echo "Last updated at " . $last_modified_time . " Pacific Time on " . $last_modified_date . " by " . $last_modified_name;
        }
    }


}