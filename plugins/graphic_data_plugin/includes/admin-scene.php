<?php
/**
 * Register class that defines the Scene custom content type as well as associated Scene functions
 * 
 */

include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-webcr-utility.php';

class Webcr_Scene {

	/**
	 * The ID of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    1.0.0
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

    /**
     * Display an admin notice if the current scene is the overview scene for its instance.
     *
     * @since    1.0.0
     */
    public function display_overview_scene_notice() {
        // 1. Check if we are on the correct screen (Scene edit page for an existing post)
        $screen = get_current_screen();
        if ( ! $screen || $screen->base !== 'post' || $screen->id !== 'scene' || $screen->action === 'add' ) {
            return; // Exit if not on the scene edit screen for an existing post
        }

        // 2. Get the current Scene's ID
        $current_scene_id = get_the_ID();
        if ( ! $current_scene_id ) {
            return; // Exit if we can't get the current post ID
        }

        // 3. Get the associated Instance ID from the Scene's meta field 'scene_location'
        $instance_id = get_post_meta( $current_scene_id, 'scene_location', true );

        // 4. Check if we have a valid Instance ID
        if ( empty( $instance_id ) || ! is_numeric( $instance_id ) ) {
            // If the scene_location isn't set, we can't determine if it's the overview scene.
            return;
        }
        $instance_id = (int) $instance_id; // Ensure it's an integer

        // 5. Get the Overview Scene ID from the Instance's meta field 'instance_overview_scene'
        $overview_scene_id = get_post_meta( $instance_id, 'instance_overview_scene', true );

        // 6. Check if the Instance has designated an overview scene
        if ( empty( $overview_scene_id ) || ! is_numeric( $overview_scene_id ) ) {
            // If the instance hasn't set an overview scene, the current scene cannot be it.
            return;
        }
        $overview_scene_id = (int) $overview_scene_id; // Ensure it's an integer

        // 7. Compare the current Scene ID with the Instance's Overview Scene ID
        if ( $current_scene_id === $overview_scene_id ) {
            // 8. Display the notice if they match
            wp_admin_notice('This is the overview scene for ' . get_the_title($instance_id) . ".",
                array(
                    'additional_classes' => array( 'updated' ),
                    'dismissible'        => true,
                )
            );
        }
    }

    //change Quick Edit link name in admin columns for Scene post type
    function modify_scene_quick_edit_link($actions, $post) {
        // Check if the post type is 'scene'.
        if ($post->post_type === 'scene') {
            // Check if the 'quick edit' action exists.
            if (isset($actions['inline hide-if-no-js'])) {
                // Modify the link text to "Edit Scene Name".
                $actions['inline hide-if-no-js'] = str_replace(
                    __('Quick&nbsp;Edit'), // The original "Quick Edit" text.
                    __('Edit Scene Slug'), // The new text.
                    $actions['inline hide-if-no-js'] // The existing action link.
                );
            }
        }
        return $actions;
    }

    /**
     * Enqueues custom CSS for scene admin columns on the post type edit screen.
     *
     * This function conditionally loads CSS styling for the admin columns display
     * when viewing the list of 'scene' custom post type entries in the WordPress admin.
     * The CSS is only enqueued when on the edit.php screen for the modal post type.
     *
     * @since 1.0.0
     *
     * @param string $hook The current admin page hook suffix.
     *
     * @return void
     */
    function enqueue_scene_admin_columns_css($hook) {
        // Get the current screen object.
        $screen = get_current_screen();
    
        // Check if we are on the edit screen for the custom post type 'scene'.
        if ($screen->post_type === 'scene' && $screen->base === 'edit') {
            // Enqueue CSS file.
            wp_enqueue_style(
                'scene-admin-columns-css', // Handle of the CSS file.
                plugin_dir_url( __DIR__ ) . 'admin/css/scene-admin-columns.css');
        }
    }

    /**
     * Store filter values in user metadata with 20-minute expiration.
     *
     * This function captures the current Scene filter selections from the URL parameters
     * and stores them in user metadata with a 20-minute expiration timestamp.
     * It only runs on the Scene post type admin screen and requires a logged-in user.
     *
     * @since    1.0.0
     * @access   public
     * @return   void
     */
    public function store_scene_filter_values() {
        $screen = get_current_screen();
        if ($screen->id != 'edit-scene') {
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
            update_user_meta($user_id, 'webcr_scene_field_length', sanitize_key($_GET['field_length']));
            update_user_meta($user_id, 'webcr_scene_field_length_expiration', $expiration_time);
        }
        
        // Store scene_instance filter value if it exists
        if (isset($_GET['scene_instance']) && !empty($_GET['scene_instance'])) {
            update_user_meta($user_id, 'webcr_scene_instance', absint($_GET['scene_instance']));
            update_user_meta($user_id, 'webcr_scene_instance_expiration', $expiration_time);
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
     * @return   bool|string|int    False if expired or not found, the value if still valid.
     */
    public function get_scene_filter_value($meta_key) {
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
     * Clean up expired scene filter values in user metadata.
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
    public function cleanup_expired_scene_filters() {
        $screen = get_current_screen();
        if (!$screen || $screen->id != 'edit-scene') {
            return;
        }
        
        $user_id = get_current_user_id();
        if (!$user_id) {
            return;
        }
        
        $current_time = time();
        
        // Check and clean up field_length
        $expiration_time = get_user_meta($user_id, 'webcr_scene_field_length_expiration', true);
        if ($expiration_time && $current_time > $expiration_time) {
            delete_user_meta($user_id, 'webcr_scene_field_length');
            delete_user_meta($user_id, 'webcr_scene_field_length_expiration');
        }
        
        // Check and clean up scene_instance
        $expiration_time = get_user_meta($user_id, 'webcr_scene_instance_expiration', true);
        if ($expiration_time && $current_time > $expiration_time) {
            delete_user_meta($user_id, 'webcr_scene_instance');
            delete_user_meta($user_id, 'webcr_scene_instance_expiration');
        }
    }

    /**
     * Add filter dropdowns for the Scene admin screen with persistent selection support.
     *
     * This function creates and outputs filter dropdowns for field length and instance
     * on the Scene post type admin screen. It first checks for filter values in the URL 
     * parameters, then falls back to stored user metadata values if they haven't expired.
     * After displaying the dropdowns, it stores the current selections for future use.
     * This function handles proper user capability checks to show only assigned instances
     * for content editors.
     *
     * @since    1.0.0
     * @access   public
     * @return   void
     */
    public function scene_filter_dropdowns() {
        $screen = get_current_screen();
        // Only proceed if we are on the 'scene' edit screen.
        if (!$screen || $screen->id !== 'edit-scene') {
            return;
        }

        // Run cleanup of expired filters
        $this->cleanup_expired_scene_filters();

        // --- Field Length Dropdown ---
        $fieldOptions = array(
            array("", "large", "Full tagline"),
            array("", "medium", "Medium tagline"),
            array("", "small", "Short tagline")
        );

        // Check for filter in URL first, then check for stored value
        $field_length = isset($_GET["field_length"]) ? sanitize_key($_GET["field_length"]) : $this->get_scene_filter_value('webcr_scene_field_length');
        
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
            $field_length_dropdown .= '<option ' . $fieldOptions[$i][0] . 'value="' . esc_attr($fieldOptions[$i][1]) . '">' . esc_html($fieldOptions[$i][2]) . '</option>';
        }
        $field_length_dropdown .= '</select>';

        echo $field_length_dropdown; // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped

        // --- Instances Dropdown (Modified Logic) ---
        global $wpdb;
        $instances = array(); // Initialize as empty array

        $current_user = wp_get_current_user();

        // Check if user is content manager but not administrator
        if (current_user_can('content_editor') && !current_user_can('administrator')) {
            // Get assigned instances for the content manager
            $user_instances = get_user_meta($current_user->ID, 'webcr_assigned_instances', true);

            // Ensure user_instances is a non-empty array before querying
            if (!empty($user_instances) && is_array($user_instances)) {
                // Sanitize instance IDs
                $instance_ids = array_map('absint', $user_instances);
                $instance_ids_sql = implode(',', $instance_ids);

                // Query only the assigned instances
                $instances = $wpdb->get_results("
                    SELECT ID, post_title
                    FROM {$wpdb->posts}
                    WHERE post_type = 'instance'
                    AND post_status = 'publish'
                    AND ID IN ({$instance_ids_sql})
                    ORDER BY post_title ASC");
            }
            // If content manager has no assigned instances, $instances remains empty, so only "All Instances" shows.

        } else {
            // Administrators or other roles see all instances
            $instances = $wpdb->get_results("
                SELECT ID, post_title
                FROM {$wpdb->posts}
                WHERE post_type = 'instance'
                AND post_status = 'publish'
                ORDER BY post_title ASC");
        }

        // Get selected instance from URL or from stored value
        $current_selection = isset($_GET['scene_instance']) ? absint($_GET['scene_instance']) : $this->get_scene_filter_value('webcr_scene_instance');

        // Generate the dropdown HTML
        echo '<select name="scene_instance" id="scene_instance">';
        echo '<option value="">' . esc_html__('All Instances', 'webcr') . '</option>'; // Use translation function

        // Check if $instances is not null and is an array before looping
        if (is_array($instances)) {
            foreach ($instances as $instance) {
                // Ensure $instance is an object with ID and post_title properties
                if (is_object($instance) && isset($instance->ID) && isset($instance->post_title)) {
                    $selected = selected($current_selection, $instance->ID, false); // Use selected() helper
                    echo '<option value="' . esc_attr($instance->ID) . '" ' . $selected . '>' . esc_html($instance->post_title) . '</option>';
                }
            }
        }
        echo '</select>';
        
        // Store the filter values after displaying the dropdowns
        $this->store_scene_filter_values();
    }

    /**
     * Filter the Scene admin screen results based on selected or stored filter values.
     *
     * This function modifies the WordPress query to filter Scene posts based on the
     * selected location (instance) values. It first checks for values in the URL parameters,
     * then falls back to stored user metadata values that haven't expired. This ensures
     * filter persistence for 20 minutes across page loads.
     *
     * @since    1.0.0
     * @access   public
     * @param    WP_Query  $query  The WordPress Query instance being filtered.
     * @return   void
     */
    public function scene_location_filter_results($query) {
        global $pagenow;
        $type = 'scene';
        
        if ($pagenow == 'edit.php' && isset($_GET['post_type']) && $_GET['post_type'] == $type) {
            // Check URL params first, then check stored values
            $instance = isset($_GET['scene_instance']) ? absint($_GET['scene_instance']) : $this->get_scene_filter_value('webcr_scene_instance');
            
            if ($instance) {
                $meta_query = array(
                    array(
                        'key' => 'scene_location', // The custom field storing the instance ID
                        'value' => $instance,
                        'compare' => '='
                    )
                );
                $query->set('meta_query', $meta_query);
            }
        }
    }

    /**
	 * Set columns in admin screen for Scene custom content type.
	 *
     * @link https://www.smashingmagazine.com/2017/12/customizing-admin-columns-wordpress/
	 * @since    1.0.0
	 */
    function change_scene_columns( $columns ) {
        $columns = array (
            //'cb' => $columns['cb'],
            'title' => 'Title',
            'scene_location' => 'Instance',
            'scene_infographic' => 'Infographic',		
            'scene_tagline' => 'Tagline',			
            'scene_order' => 'Order',	
            'scene_overview' => 'Overview'
,            'status' => 'Status',
        );
        return $columns;
    }

    /**
	 * Populate custom fields for Scene content type in the admin screen.
	 *
     * @param string $column The name of the column.
     * @param int $post_id The database id of the post.
	 * @since    1.0.0
	 */
    public function custom_scene_column( $column, $post_id ) {  

        if (isset($_GET["field_length"])) {
            $field_length = sanitize_key($_GET["field_length"]);
        } else {
            $stored_field_length = $this->get_scene_filter_value('webcr_scene_field_length');
            $field_length = $stored_field_length ? $stored_field_length : "small"; // Default to "small" if no stored value or expired
        }

        // Populate columns based on the determined field_length
        if ( $column === 'scene_location' ) {
            $instance_id = get_post_meta( $post_id, 'scene_location', true ); 
            echo get_the_title($instance_id ); 
        }

        if ( $column === 'scene_infographic' ) {
                $scene_infographic = get_post_meta($post_id, 'scene_infographic', true);
                if (!empty($scene_infographic)) {
                        echo '<img src="' . esc_url($scene_infographic) . '" style="max-width:100px; max-height:100px;" /><br>';
                }
        }

        if ($column == 'scene_tagline'){
            $scene_tagline = get_post_meta( $post_id, 'scene_tagline', true );
            switch ($field_length){
                case "large":
                    echo $scene_tagline;
                    break;
                case "medium":
                    echo $this->stringTruncate($scene_tagline, 75);
                    break;
                case "small":
                    if ($scene_tagline != NULL){
                        echo '<span class="dashicons dashicons-yes"></span>';
                    }
                    break;
            }
        }

        if ( $column === 'scene_order' ) {
            echo get_post_meta( $post_id, 'scene_order', true ); 
        }

        if ( $column === 'scene_overview' ) {
            $instance_id = get_post_meta( $post_id, 'scene_location', true ); 
            $instance_overview_scene = get_post_meta($instance_id, 'instance_overview_scene', true );
            if ($instance_overview_scene == $post_id) {
                echo '<span class="dashicons dashicons-yes"></span>';
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

    /**
	 * Shorten string without cutting words midword.
	 *
     * @param string $string The string to be shortened.
     * @param int $your_desired_width The number of characters in the shortened string.
	 * @since    1.0.0
	 */
    public function stringTruncate($string, $your_desired_width) {
        $parts = preg_split('/([\s\n\r]+)/', $string, null, PREG_SPLIT_DELIM_CAPTURE);
        $parts_count = count($parts);
        
        $length = 0;
        //$last_part = 0;
        for ($last_part = 0; $last_part < $parts_count; ++$last_part) {
            $length += strlen($parts[$last_part]);
            if ($length > $your_desired_width) { break; }
        }
        
        return implode(array_slice($parts, 0, $last_part));
    }

    /**
	 * Remove Bulk Actions dropdown from Scene, Modal, Figure, and Instance admin screens.
	 *
     * @param array $actions An array of the available bulk actions.
	 * @since    1.0.0
	 */
    function remove_bulk_actions($actions) {
        global $post_type;
    
        if ($post_type === 'scene' || $post_type === 'modal' || $post_type === 'figure' || $post_type === 'instance') {
            unset($actions['bulk-edit']);
            unset($actions['edit']);
            unset($actions['trash']);
            unset($actions['spam']);
            unset($actions['unspam']);
            unset($actions['delete']);
        }
        return $actions;
    }

    /**
	 * Remove Quick Edit links from Scene admin screen.
	 *
     * @param string[] $actions An array of row action links.
     * @param int $post The database id of the post.
	 * @since    1.0.0
	 */
    function scene_remove_quick_edit_link($actions, $post) {
        global $current_screen;
    
        if ($current_screen->post_type === 'scene') {
            unset($actions['inline hide-if-no-js']);
        }
        return $actions;
    }

    /**
	 * Create Scene custom content type.
	 *
	 * @since    1.0.0
	 */
    function custom_content_type_scene() {
        $labels = array(
            'name'                  => _x( 'Scenes', 'Post type general name', 'textdomain' ),
            'singular_name'         => _x( 'Scene', 'Post type singular name', 'textdomain' ),
            'menu_name'             => _x( 'Scenes', 'Admin Menu text', 'textdomain' ),
            'name_admin_bar'        => _x( 'Scene', 'Add New on Toolbar', 'textdomain' ),
            'add_new'               => __( 'Add New Scene', 'textdomain' ),
            'add_new_item'          => __( 'Add New Scene', 'textdomain' ),
            'new_item'              => __( 'New Scene', 'textdomain' ),
            'edit_item'             => __( 'Edit Scene', 'textdomain' ),
            'view_item'             => __( 'View Scene', 'textdomain' ),
            'all_items'             => __( 'All Scenes', 'textdomain' ),
            'search_items'          => __( 'Search Scenes', 'textdomain' ),
            'parent_item_colon'     => __( 'Parent Scenes:', 'textdomain' ),
            'not_found'             => __( 'No Scenes found.', 'textdomain' ),
            'not_found_in_trash'    => __( 'No Scenes found in Trash.', 'textdomain' ),
            'featured_image'        => _x( 'Scene Cover Image', 'Overrides the “Featured Image” phrase for this post type. Added in 4.3', 'textdomain' ),
            'set_featured_image'    => _x( 'Set cover image', 'Overrides the “Set featured image” phrase for this post type. Added in 4.3', 'textdomain' ),
            'remove_featured_image' => _x( 'Remove cover image', 'Overrides the “Remove featured image” phrase for this post type. Added in 4.3', 'textdomain' ),
            'use_featured_image'    => _x( 'Use as cover image', 'Overrides the “Use as featured image” phrase for this post type. Added in 4.3', 'textdomain' ),
            'archives'              => _x( 'Scene archives', 'The post type archive label used in nav menus. Default “Post Archives”. Added in 4.4', 'textdomain' ),
            'insert_into_item'      => _x( 'Insert into Scene', 'Overrides the “Insert into post”/”Insert into page” phrase (used when inserting media into a post). Added in 4.4', 'textdomain' ),
            'uploaded_to_this_item' => _x( 'Uploaded to this Scene', 'Overrides the “Uploaded to this post”/”Uploaded to this page” phrase (used when viewing media attached to a post). Added in 4.4', 'textdomain' ),
            'filter_items_list'     => _x( 'Filter Scenes list', 'Screen reader text for the filter links heading on the post type listing screen. Default “Filter posts list”/”Filter pages list”. Added in 4.4', 'textdomain' ),
            'items_list_navigation' => _x( 'Scenes list navigation', 'Screen reader text for the pagination heading on the post type listing screen. Default “Posts list navigation”/”Pages list navigation”. Added in 4.4', 'textdomain' ),
            'items_list'            => _x( 'Scenes list', 'Screen reader text for the items list heading on the post type listing screen. Default “Posts list”/”Pages list”. Added in 4.4', 'textdomain' ),
        );
    
        $args = array(
            'labels'             => $labels,
            'public'             => true,
            'publicly_queryable' => true,
            'show_ui'            => true,
            'show_in_menu'       => true,
            'show_in_rest'       => true,
            'query_var'          => true,
            'rewrite'            => array( 'slug' => 'scenes' ),
            'capability_type'    => 'post',
            'menu_icon'          => 'dashicons-tag',
            'has_archive'        => true,
            'hierarchical'       => false,
            'menu_position'      => null,
            'supports'           => array( 'title'), //array( 'title', 'revisions' ),
        );
    
        register_post_type( 'scene', $args );
    }

    /**
	 * Create custom fields, using metaboxes, for Scene custom content type.
     * 
     * @param bool $return_fields_only If true, only return the custom fields array without registering the metabox (used as part of field validation).
	 * @since    1.0.0
	 */
    public function create_scene_fields($return_fields_only = false) {
        $config_metabox = array(

            'type'              => 'metabox',                       // Required, menu or metabox
            'id'                => $this->plugin_name,              // Required, meta box id, unique, for saving meta: id[field-id]
            'post_types'        => array( 'scene' ),                 // Post types to display meta box
            'context'           => 'advanced',                      // 	The context within the screen where the boxes should display: 'normal', 'side', and 'advanced'.
            'priority'          => 'default',                       // 	The priority within the context where the boxes should show ('high', 'low').
            'title'             => 'Scene Fields',                  // The title of the metabox
            'capability'        => 'edit_posts',                    // The capability needed to view the page
            'tabbed'            => true,
            'options'           => 'simple',                        // Only for metabox, options is stored az induvidual meta key, value pair.
        );

        $function_utilities = new Webcr_Utility();
        $instances = $function_utilities ->  returnAllInstances();

        $fields = array(
            array(
                'id'             => 'scene_published',
                'type'           => 'select',
                'title'          => 'Scene status*',
                'options'        => array("draft" => "Draft", "published" => "Published"),
                'default' => 'draft',
                'description' => 'Should the Scene be live?',
            ),
            array(
                'id'   => 'scene_location',
                'type' => 'select',
                'title'          => 'Instance*',
                'options'        => $instances, 
                'description' => 'What instance is the scene part of? '
            ),
            array(
                'id'   => 'scene_infographic',
                'type' => 'image',
                'title' => 'Infographic*',
                'description' => 'What is the image for the scene? Only properly-formatted SVG-type images are allowed.'
            ),
            array(
                'id'   => 'scene_tagline',
                'type'   => 'editor',
                'editor' => 'trumbowyg',
                'title'       => 'Tagline',
                'description' => 'What is the tagline for the scene?'
            ),
            array(
                'id'      => 'scene_info_entries',
                'type'    => 'range',
                'title'   => 'Number of info entries',
                'description' => 'How many info links are there for the scene?',
                'min'     => 0,    
                 'default' => 0,    
                 'max'     => 6,         
                 'step'    => 1,             
            ),  
            array(
                'id'      => 'scene_photo_entries',
                'type'    => 'range',
                'title'   => 'Number of photo entries',
                'description' => 'How many photo links are there for the scene?',
                'min'     => 0,    
                 'default' => 0,    
                 'max'     => 6,         
                 'step'    => 1,             
            ),   
            array(
                'id'      => 'scene_order',
                'type'    => 'number',
                'title'   => 'Order',
                'description' => 'What is the order of the scene in the menu bar?',
                'default' => '1',                               
                'min'     => '1',                                    
                'max'     => '10',      
                'step'    => '1',   
            ),
            array(
                'id'    => 'scene_full_screen_button',
                'type'  => 'select',
                'title' => 'Full Screen Button',
                'description' => 'Should there be a button to allow full screen access to the scene?',
                'options'        => array("no" => "No", "yes" => "Yes"),
                "default"   => "yes",
            ),
            array(
                'id'             => 'scene_text_toggle',
                'type'           => 'select',
                'title'          => 'Text Toggle',
                'options'        => array("none" => "No Toggle", "toggle_off" => "Toggle, Default Off", "toggle_on" => "Toggle, Default On"),
                'default'        => 'toggle_on',
                'description' => 'Should there be a button to toggle text on and off?',
             //   'class'      => 'chosen', 
            ), 
            array(
                'id'    => 'scene_orphan_icon_action',
                'type'  => 'select',
                'title' => 'Icon visibility in scene, if no associated modal',
                'options'        => array("visible" => "Keep icons as they are", "hide" => "Hide icons", "translucent" => "Make icons semi-transparent", "color" => "Color in icons with specific color"),
                'description' => 'What should happen to clickable icons in the scene that have no associated modal or a modal that is a draft?',
                "default"   => "visible",
            ),
            array(
                'id'     => 'scene_orphan_icon_color',
                'type'   => 'color',
                'title'  => 'Color for icons with no associated modal',
                'description' => 'What should the icon color be?',
                'picker' => 'html5',
                "default"   => '#808080',
            ),
            array(
                'id'             => 'scene_toc_style',
                'type'           => 'select',
                'title'          => 'Table of contents style*',
                'options'        => array("accordion" => "Accordion (Sections Required)", "list" => "List (default option, No Sections)", "sectioned_list" => "Sectioned List (Sections Required)"),
                'default' => 'list',
                'description' => 'What should the table of contents to the right of the scene look like? Should the icons be in sections? If so, the sections can be created here. However, you will need to assign your modals to them.',
            ),
            array(
                'id'    => 'scene_same_hover_color_sections',
                'type'  => 'select',
                'title' => 'Single color for sections',
                'options'        => array("no" => "No", "yes" => "Yes"),
                'description' => 'Should all sections have the same hover color?',
                "default"   => "yes",
            ),
            array(
                'id'     => 'scene_hover_color',
                'type'   => 'color',
                'title'  => 'Scene Hover color',
                'description' => 'What should the hover color be?',
                'picker' => 'html5',
                "default"   => '#FFFF00',
            ),
            array(
                'id'     => 'scene_hover_text_color',
                'type'   => 'color',
                'title'  => 'Scene Hover Text Color',
                'description' => 'What should the hover text color be?',
                'picker' => 'html5',
                "default"   => '#000',

            ),
            array(
                'id'      => 'scene_section_number',
                'type'    => 'select',
                'title'   => 'Number of scene sections*',
                'description' => 'How many scene sections are there?',
                'options' => array(
                    0 => "0",
                    1 => "1",
                    2 => "2",
                    3 => "3",
                    4 => "4",
                    5 => "5",
                    6 => "6"
                ),
                'default' => 0           
            ),
            array(
                'id'          => 'scene_preview',
                'type'        => 'button',
                'title'       => 'Preview scene',
                'class'        => 'scene_preview',
                'options'     => array(
                    'href'  =>  '#nowhere',
                    'target' => '_self',
                    'value' => 'Preview',
                    'btn-class' => 'exopite-sof-btn'
                ),
            ),  
        );

        // Step 1: Create an array to hold the new info sub-arrays
        $infoFields = array();

        // Step 2: Use a loop to generate the new info sub-arrays
        for ($i = 1; $i <= 6; $i++) {
            $infoFields[] = array(
                'type' => 'fieldset',
                'id' => 'scene_info' . $i,
                'title'   => 'Info Link ' . $i,
            // 'description' => 'Scene Info Link 1 description',
                'fields' => array(
                    array(
                        'id'          => 'scene_info_text' . $i,
                        'type'        => 'text',
                        'title'       => 'Text',
                        'class'       => 'text-class',
                    ),
                    array(
                        'id'          => 'scene_info_url' . $i,
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
                'id' => 'scene_photo' . $i,
                'title'   => 'Photo Link ' . $i,
                'fields' => array(
                    array(
                        'id'             => 'scene_photo_location' . $i,
                        'type'           => 'select',
                        'title'          => 'Image Location',
                        'options'        => array("Internal" => "Within this site", "External" => "Outside of this site"),
                        'default'     => 'External',
                    ),
                    array(
                        'id'          => 'scene_photo_text' . $i,
                        'type'        => 'text',
                        'title'       => 'Link Text',
                        'class'       => 'text-class',
                    ),
                    array(
                        'id'          => 'scene_photo_url' . $i,
                        'type'        => 'text',
                        'title'       => 'URL',
                        'class'       => 'text-class',
                        'sanitize'    => array($function_utilities, 'dummy_sanitize'), // Prevents automatic URL sanitization

                    ),
                    array(
                        'id'    => 'scene_photo_internal' . $i,
                        'type'  => 'image',
                        'title' => 'Image',
                    ),
                ),
            );
        }

        // Step 1: Create an array to hold the new info sub-arrays
        $sectionFields = array();

        // Step 2: Use a loop to generate the new info sub-arrays
        for ($i = 1; $i <= 6; $i++) {
            $sectionFields[] = array(
                'type' => 'fieldset',
                'id' => 'scene_section' . $i,
                'title'   => 'Scene Section ' . $i . '*',
                'fields' => array(
                    array(
                        'id'          => 'scene_section_title' . $i,
                        'type'        => 'text',
                        'title'       => 'Section Title',
                        'class'       => 'text-class',
                    ),
                    array(
                        'id'     => 'scene_section_hover_color' . $i,
                        'type'   => 'color',
                        'title'  => 'Section Hover Color',
                        'picker' => 'html5',
                        "default"   => '#FFFF00',
                    ),
                    array(
                        'id'     => 'scene_section_hover_text_color' . $i,
                        'type'   => 'color',
                        'title'  => 'Section Hover Text Color',
                        'picker' => 'html5',
                        "default"   => '#00000',
                    ),
                ),
            );
        }

        // Step 3: Insert the new sub-arrays after the second element in the original 'fields' array
        
        array_splice($fields, 5, 0, $infoFields);
        array_splice($fields, 12, 0, $photoFields);
        array_splice($fields, 28, 0, $sectionFields);

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
        $options_panel = new Exopite_Simple_Options_Framework( $config_metabox, $fieldsHolder ); //$fields

        // Create array of fields to be registered with register_meta
        $fieldsToBeRegistered = array(
            array('scene_location', 'string', 'The location of the scene'),
            array('scene_tagline', 'string', 'The scene tagline'),
            array('scene_infographic', 'string', 'The url of the infographic'),
            array('scene_info_entries', 'integer', 'The number of info links'),
            array('scene_section_number', 'integer', 'The number of scene sections'),
            array('scene_hover_color', 'string', 'The hover color for the icons'),
            array('scene_hover_text_color', 'string', 'The hover text color for the icons'),
            array('scene_photo_entries', 'integer', 'The number of scene links'),
            array('scene_published', 'string', 'Is the scene live'),
            array('scene_toc_style', 'string', 'Table of contents style'),
        );

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
            array('scene_info', 'Info link '),
            array('scene_photo', 'Photo link '),
            array('scene_photo_internal', 'Internal photo link '),
            array('scene_section', 'Scene section '),
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
	 * Register Scene custom fields for use by REST API.
	 *
	 * @since    1.0.0
	 */
    function register_scene_rest_fields() {
        $scene_rest_fields = array('scene_location', 'scene_infographic', 'scene_tagline',

            'scene_info_entries', 'scene_photo_entries', 'scene_section_number', 'scene_hover_color', 'scene_hover_text_color','scene_published', 'scene_toc_style');

        for ($i = 1; $i < 7; $i++){
            array_push($scene_rest_fields,'scene_info' . $i, 'scene_photo' . $i, 'scene_photo_internal' . $i, 'scene_section' . $i);
        }
        $function_utilities = new Webcr_Utility();
        $function_utilities -> register_custom_rest_fields("scene", $scene_rest_fields);
    }

    /**
	 * Add a filter to support filtering by "scene_location" in REST API queries.
	 *
	 * @since    1.0.0
	 */
    function filter_scene_by_scene_location($args, $request) {
        if (isset($request['scene_location'])) {
            $args['meta_query'][] = array(
                'key' => 'scene_location',
                'value' => $request['scene_location'],
                'compare' => 'LIKE', // Change comparison method as needed
            );
        }
        return $args;
    }

    /**
	 * Add scene rewrite rules for permalinks (Skanda). THIS FUNCTION IS NOT IN USE AND REPLACED WITH OTHER REWRITE RULE FUNCTIONS. REMOVE?
	 *
	 * @since    1.0.0
	 */
    function add_scene_rewrite_rules($rules) {
        $new_rules = array(
            '([^/]+)/([^/]+)/?$' => 'index.php?post_type=scene&name=$matches[2]&instance_slug=$matches[1]' // Map URL structure to scene post type
        );
        return $new_rules + $rules;
    }

    /**
	 * Add scene rewrite rules for permalinks.
	 *
	 * @since    1.0.0
	 */
    function remove_scene_slug($post_link, $post, $leavename) {
        if ('scene' != $post->post_type || 'publish' != $post->post_status) {
            return $post_link;
        }
    
        $instance_id = get_post_meta($post->ID, 'scene_location', true);
        $instance = get_post($instance_id);
        $web_slug = get_post_meta($instance_id, 'instance_slug', true);
    
        if (!$instance || !$web_slug) {
            return $post_link;
        }
    
        return home_url('/' . $web_slug . '/' . $post->post_name . '/');
    }

	// Rewrite rule for scenes - new Claude code
    function add_custom_rewrite_rules() {
        add_rewrite_rule(
            '([^/]+)/([^/]+)/?$',
            'index.php?post_type=scene&scene=$matches[2]&instance_slug=$matches[1]',
            'top'
        );
    
        // Add query var for instance_slug
        add_filter('query_vars', function($vars) {
            $vars[] = 'instance_slug';
            return $vars;
        });
    }

    function scene_preview() {
      
        header("Location: ".$_SERVER["HTTP_REFERER"]);
      //  echo "hello";
        wp_die();
    }

    /**
     * Registers the "status" column as sortable in the Scene, Modal, and Figure custom post admin lists.
     *
     * @param array $sortable_columns An array of sortable columns.
     * @return array Modified array with the "status" column set as sortable by "modified".
     */
    function register_status_as_sortable_column($sortable_columns) {
        $sortable_columns['status'] = 'modified'; // Sorting by post_modified column
        return $sortable_columns;
    }

    /**
     * Modifies the main WordPress query to enable sorting by the last modified date.
     *
     * This function ensures that when sorting is triggered by the "status" column,
     * WordPress orders the Scene, Modal, or Figure posts based on the `post_modified` field in ascending
     * or descending order, depending on user selection.
     *
     * @param WP_Query $query The current query instance.
     * @return void
     */
    function orderby_status_column($query) {
        // Ensure we are in the admin area and working with the main query
        if (!is_admin() || !$query->is_main_query()) {
            return;
        }

        // Retrieve the sorting parameters
        $orderby = $query->get('orderby');
        $order = strtoupper($query->get('order')) === 'ASC' ? 'ASC' : 'DESC'; // Default to DESC if not set

        // Apply sorting if the "modified" column is selected
        if ($orderby == 'modified') {
            $query->set('orderby', 'modified');
            $query->set('order', $order);
        }
    }

}