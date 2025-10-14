<?php
  /**
   * Theme Functionality File
   *
   * This file is part of a WordPress theme and is responsible for defining and handling the loading of all theme-specific
   * scripts, styles, and custom post types. The functions are designed to enhance the theme's capabilities, ensuring
   * proper style, script management, and custom post type functionalities. Each function is hooked to an appropriate action or filter within WordPress to ensure they execute at the right time
   * during page load or admin panel interactions. Proper use of actions and filters follows WordPress best practices,
   * aiming to extend the functionality of WordPress themes without modifying core files.
   */

  // Customizer functions - first let's load the customizer class
  include_once get_template_directory(). '/customizer.php';
  $customizer_settings = new Customizer_Settings();

  // Now let's call the customizer functions
  add_action( 'customize_register', array( $customizer_settings, 'sanctuary_watch_customize_register' ) );
  add_action( 'wp_head', array( $customizer_settings, 'sanctuary_watch_customizer_css' ));
  add_action( 'customize_register', array( $customizer_settings,'remove_customizer_sections'), 20 );
  add_action('customize_controls_print_footer_scripts', array( $customizer_settings,'header_row_customizer_inline_script'));
  add_action('after_setup_theme', function() {
    $customizer_settings = new Customizer_Settings();
    add_action('admin_init', [$customizer_settings, 'validate_header_settings_on_save']);
  });

/**
 * Redirects the front page to a specific scene if single instance mode is enabled.
 *
 * This function is hooked to the 'template_redirect' action. It checks if the current
 * page is the front page and if the "Single Instance View" setting is enabled in the
 * Customizer. If both conditions are met, it calls singleInstanceCheck() to determine
 * the target scene. If a valid scene post ID is returned, it performs a 301 permanent
 * redirect to that scene's permalink.
 *
 * @since 1.0.0
 *
 * @uses is_front_page() To check if the current page is the front page.
 * @uses is_admin() To prevent execution in the admin area.
 * @uses singleInstanceCheck() To determine if a redirect is needed and get the target post ID.
 * @uses get_permalink() To get the URL of the target scene.
 * @uses wp_redirect() To perform the browser redirect.
 */
function single_instance_front_page_redirect() {
    // Only run on the front page
    if (!is_front_page() || is_admin()) {
        return;
    }
    
    $singleInstance = singleInstanceCheck();
    if ($singleInstance != false) {
        // Get the permalink for the page
        $redirect_url = get_permalink($singleInstance["sceneID"]);
        
        // Make sure the page exists and we have a valid URL
           if ($redirect_url && $redirect_url !== get_permalink()) {
            // Perform the redirect
            wp_redirect($redirect_url, 301); // 301 = permanent redirect
            exit;
        }
    }
}

// Hook the function to run early in the WordPress loading process
add_action('template_redirect', 'single_instance_front_page_redirect');

/**
 * Determines whether Single Instance settings should be applied to the theme and returns the target post ID.
 * 
 * This function checks if the single instance mode is enabled in the customizer, verifies that exactly
 * one instance exists in the database, and returns the instance post ID and the appropriate scene post ID to display. It prioritizes
 * the overview scene if available, otherwise returns the first scene in the instance.
 * 
 * @since 1.0.0
 * 
 * @global wpdb $wpdb WordPress database abstraction object.
 * 
 * @return array|false Returns, as an associative array, the post ID of the instance and the post ID of the target scene 
 *                   if single instance mode should be applied,
 *                   false if single instance mode is disabled, multiple instances exist, or no scenes
 *                   are found in the instance.
 * 
 * @example
 * ```php
 * $target_scene = singleInstanceCheck();
 * if ($target_scene !== false) {
 *     // Single instance mode is active, redirect to scene
 *     wp_redirect(get_permalink($target_scene));
 * }
 * ```
 * 
 */
function singleInstanceCheck (){
    $singleInstanceInfo = false;
    // Get the customizer setting value
    $single_instance_enable = get_theme_mod('single_instance_enable', '');
    
    // Check if the setting is enabled (checkbox returns '1' when checked)
    if ($single_instance_enable) {

      global $wpdb;
      
      // Get the number of instances
      $sql_row_count = "SELECT COUNT(*) FROM {$wpdb->prefix}postmeta WHERE meta_key = 'instance_short_title'";
      $row_count = $wpdb->get_var($sql_row_count);
      
      if ($row_count == 1) { // we know that there is only instance
        // get the post id of the instance
        $SQL_instance_ID = "SELECT `post_id` FROM `wp_postmeta` WHERE `meta_key` = 'instance_short_title'";
        $instance_ID = $wpdb->get_var($SQL_instance_ID);

        // get the number of scenes in the instance
        $SQL_numScenesInInstance = $wpdb->prepare(
          "SELECT COUNT(*) FROM `wp_postmeta` WHERE `meta_key` = 'scene_location' AND `meta_value` = %s",
          $instance_ID);
        $numScenesInInstance = $wpdb->get_var($SQL_numScenesInInstance);

        if ($numScenesInInstance > 0){
          $overview_scene = get_post_meta($instance_ID, 'instance_overview_scene', true);
                    // Return the value if found, otherwise return false
          if ($overview_scene == "") {

            $SQL_target_scene = $wpdb->prepare(
              "SELECT post_id FROM `wp_postmeta` WHERE `meta_key` = 'scene_location' AND `meta_value` = %s  ORDER BY post_id ASC LIMIT 1",
              $instance_ID);
              $target_scene = $wpdb->get_var($SQL_target_scene);
              $singleInstanceInfo = array("instanceID"=>$instance_ID, "sceneID"=>$target_scene);
          } else {
              $singleInstanceInfo = array("instanceID"=>$instance_ID, "sceneID"=>$overview_scene);
          }
        }
      }
    }
    return $singleInstanceInfo;
}

function enqueue_font_awesome() {
  wp_enqueue_style(
      'font-awesome', 
      'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css', 
      array(), 
      '6.6.0', 
      'all' 
  );
}

add_action('wp_enqueue_scripts', 'enqueue_font_awesome');

  /**
   * Enqueues the theme's main stylesheet.
   *
   * This function utilizes `wp_enqueue_style` to register the theme's main 
   * stylesheet using the current theme's stylesheet URI. Used to ensure
   * that the main stylesheet is properly added to the HTML output of the WordPress theme.
   *
   * @return void
   */
  function files() {
    wp_enqueue_style( 'style', get_stylesheet_uri() );
  } 
  add_action( 'wp_enqueue_scripts', 'files' );

  /**
   * Enqueues Bootstrap's JavaScript library with dependency management.
   *
   * This function registers and enqueues the Bootstrap JavaScript library from a CDN. It specifies jQuery as a dependency,
   * meaning jQuery will be loaded before the Bootstrap JavaScript. The script is added to the footer of the HTML document 
   * and is set to defer loading until after the HTML parsing has completed.
   *
   * @return void
   */
  // function enqueue_bootstrap_scripts() {
  //   wp_enqueue_script('bootstrap-js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js', array('jquery'), null, array('strategy' => 'defer,'));
  // }
  // add_action('wp_enqueue_scripts', 'enqueue_bootstrap_scripts');
  function enqueue_bootstrap_scripts() {
    wp_enqueue_script(
        'bootstrap-js', 
        'https://cdn.jsdelivr.net/npm/bootstrap@5.0.2/dist/js/bootstrap.bundle.min.js', 
        array('jquery'), 
        null, 
        array('strategy' => 'defer') // Corrected the 'strategy' syntax
    );
}
add_action('wp_enqueue_scripts', 'enqueue_bootstrap_scripts');

  function enqueue_api_script(){
    wp_enqueue_script( 'wp-api' );
  }
  add_action('wp_enqueue_scripts', 'enqueue_api_script');


function set_theme_default_site_icon() {
    // Only set if no site icon is already configured
    if (!has_site_icon()) {
        $icon_url = get_stylesheet_directory_uri() . '/assets/images/onms-logo-no-text-800.png';
        $icon_path = get_stylesheet_directory() . '/assets/images/onms-logo-no-text-800.png';
        
        // Check if the file exists
        if (file_exists($icon_path)) {
            // Upload the image to media library and set as site icon
            $attachment_id = attachment_url_to_postid($icon_url);
            
            if (!$attachment_id) {
                // If not in media library, add it
                require_once(ABSPATH . 'wp-admin/includes/file.php');
                require_once(ABSPATH . 'wp-admin/includes/media.php');
                require_once(ABSPATH . 'wp-admin/includes/image.php');
                
                $attachment_id = media_sideload_image($icon_url, 0, 'Site Icon', 'id');
            }
            
            if (!is_wp_error($attachment_id)) {
                update_option('site_icon', $attachment_id);
            }
        }
    }
}
add_action('after_setup_theme', 'set_theme_default_site_icon');


   //  Include the GitHub Updater class if not already included by the plugin
    if ( is_plugin_active( 'graphic_data_plugin/graphic_data_plugin.php' ) ) {
      // Include the GitHub Updater class if not already included by the plugin
      if (!class_exists('GitHub_Updater')) {
        require_once get_template_directory() . '/admin/class-github-updater.php';
      }
    
      // Initialize the theme updater (only if not in development environment)
      new GitHub_Updater(
          get_template_directory() . '/style.css',
          'ioos', // GitHub username
          'sanctuarywatch_graphicdata', //  repository name
          true, // This is a theme, not a plugin
          'themes/graphic_data_theme' // Subdirectory path in the repository
      );
    }

  /**
   * Retrieves arrays of scene information and photos for a specified post.
   *
   * This function collects and returns two arrays containing scene information and photos respectively. It searches 
   * through post meta to find up to 6 sets of scene information and photos, each potentially containing text and a URL.
   * The function performs a single query per metadata type (`scene_info` and `scene_photo`) for efficiency, and checks 
   * for the existence of both text and URL before adding the data to the return array. This method optimizes memory usage 
   * by avoiding unnecessary data pushing to the array if the data set is incomplete.
   *
   * @param int $post_id The ID of the post from which to gather scene info and photos.
   * @return array An array of two arrays: one for scene info and one for photos, each containing the respective text and URL.
   */
  //get scene photo and info arrays
  function get_scene_info_photo($post_id){
    $scene_info_photo_arr = [[], []];
    for($i = 1; $i <= 6; $i++){
      //ASSUMING BOTH SCENE INFO AND PHOTO HAVE BOTH TEXT AND LINK
      //instead of doing individual queries is it faster to just query once of everything then search the query for the required links
      $scene_info = get_post_meta($post_id, "scene_info".$i);
      $scene_photo = get_post_meta($post_id, "scene_photo".$i);

      //instead of pushing to array(takes up more memory) can just create the dropdown in the if statement
      if($scene_info[0]['scene_info_text'.$i] && $scene_info[0]['scene_info_url'.$i]){
          array_push($scene_info_photo_arr[0], $scene_info[0]);
      }
      if($scene_photo[0]['scene_photo_text'.$i] && $scene_photo[0]['scene_photo_url'.$i]){
          array_push($scene_info_photo_arr[1], $scene_photo[0]);
      }
    }
    return $scene_info_photo_arr;
  }

  /**
   * Generates an HTML accordion section.
   *
   * This function outputs an HTML structure for an accordion section tailored to Bootstrap's collapse plugin. It constructs 
   * a single accordion item with dynamically generated IDs based on the provided title, which are used for the collapsible 
   * target references. The function checks if the provided data array is not empty and iterates over this array to create list 
   * items (`<li>`) with links (`<a>` tags) derived from the data array's elements. Each link displays text and references a URL 
   * both stored as key-value pairs in the array, expected to be indexed by a base key formed by a modified version of the title.
   *
   * @param string $title The title of the accordion section which is also used to create IDs for HTML elements.
   * @param array $dataArr An array of associative arrays, each containing keys formed by appending a suffix to the modified title.
   *                       These keys should map to the URL and text to be used for links within this accordion section.
   * @return void Outputs HTML Accordion directly.
   */
  //GENERATING ACCORDION SECTIONS 
  function generateAccordionSection($title, $dataArr){
    if(!empty($dataArr)){
        $modTitle = str_replace(' ', '_', strtolower($title));
        echo '<div class="accordion-item">';
        echo '<h2 class="accordions-header">';
        echo '<button class="accordion-button" type="button" data-bs-toggle="collapse" data-bs-target="#collapse' . $modTitle . '"  aria-controls="collapse' . $modTitle . '">';
        echo '<div class="title_size">' . $title . '</div>';
        //echo $title;
        echo '</button>';
        echo '</h2>';
        echo '<div id="collapse' . $modTitle . '" class="accordion-collapse collapse" data-bs-parent="#sceneAccordions">';
        echo '<div class="accordion-body">';
        echo '<ul>';
        for ($i = 0; $i < count($dataArr); $i++) {
            echo '<li><a href="' . $dataArr[$i][$modTitle . '_url' . ($i + 1)] . '">' . $dataArr[$i][$modTitle . '_text' . ($i + 1)] . '</a></li>';
        }
        echo '</ul>';
        echo '</div>';
        echo '</div>';
        echo '</div>';
    }
  }

  /**
   * Generates an array of modal information from an SVG file.
   *
   * This function processes an SVG file to extract child elements of a specified element and 
   * generates an array of information related to these child elements, based on associated 
   * WordPress post metadata. It utilizes DOMDocument and DOMXPath to parse and query the SVG 
   * content and creates a structured array containing details for each child element.
   *
   * @param string $svg_url The URL of the SVG file to be processed.
   * @return array|null An array of associative arrays containing modal information for each 
   *                    child element, or null if the SVG file could not be processed.
   */
  function generateModalArray($svg_url){
    //Check if $svg_url contains anything, return null if nothing
    if($svg_url){
      // Find the path to the SVG file
      $relative_path = ltrim(parse_url($svg_url)['path'], "/");
      $full_path = ABSPATH . $relative_path;

      // Get the contents from the SVG file
      $svg_content = file_get_contents($full_path);

      // If the SVG content could not be loaded, terminate with an error message
      if(!$svg_content){
          die("Fail to load SVG file");
          return null;
      }
      // Load the SVG content into a DOMDocument
      $dom  = new DOMDocument();
      libxml_use_internal_errors(true);
      $dom->loadXML($svg_content);
      libxml_clear_errors();

      // Create a DOMXPath object for querying the DOMDocument
      $xpath = new DOMXPath($dom);

      // Find the element with ID "icons"
      $xpath_query = "//*[translate(@id, 'ABCDEFGHIJKLMNOPQRSTUVWXYZ', 'abcdefghijklmnopqrstuvwxyz') = 'icons']";
      $icons_element = $xpath->query($xpath_query)->item(0);

      // If the element with ID "icons" is not found, terminate with an error message
      if($icons_element === null){
          die('Element with ID "icons" not found');
          return null;
      }

      // Get the child nodes of the "icons" element
      $child_elements = $icons_element->childNodes;

      // Initialize an array to hold the IDs of the child elements
      $child_ids = array();
      foreach($child_elements as $child){
        // Check if the child node is an element and has an "id" attribute
          if($child->nodeType === XML_ELEMENT_NODE && $child->hasAttribute('id')) {
              // Add the "id" attribute to the array
              $child_ids[] = $child->getAttribute('id');
          }
      }
      // Sort the IDs alphabetically
      asort($child_ids);

      // Iterate over the sorted IDs and create an associative array for each one
      for ($i = 0; $i < count($child_ids); $i++){
        // Create a new WP_Query object for the current ID
        $query = new WP_Query(postQuery($child_ids[$i]));
        // Check if there are any posts for the current ID
        if($query->have_posts()){
            // Get the post ID and post object
            $child_post_id = $query->posts[0];
            $post = get_post($child_post_id); //this might not be needed

            // Get the icon type, title, and other meta information
            $icon_type = get_post_meta($child_post_id, "icon_function");
            $icon_title = get_post_meta($child_post_id, "post_title");
            $modal = "";
            $scene_url = "";
            $external_url = "";

            // Determine the URL based on the icon type or Modal
            if($icon_type[0] === "External URL"){
                $external_url = get_post_meta( $child_post_id, "icon_external_url");
            }
            if($icon_type[0] === "Scene"){
                $scene_id = get_post_meta( $child_post_id, "icon_scene_out");
                $scene_url = get_permalink($scene_id[0]);
            }
            //TODO
            if($icon_type[0] === "Modal"){
                $modal = "Modal TODO";
            }

            //Create an array using the information above
            $child_ids[$i] = ["name" => $child_ids[$i], 
                              "title" => $icon_title[0],
                              "post_id" => $child_post_id,
                              "icon_function" => $icon_type[0],
                              "modal" => $modal,
                              "scene" => $scene_url,
                              "external" => $external_url[0]
                            ];
        }
      }

      // Reset the global $post object after query
      wp_reset_postdata();
      return $child_ids;
    }
    return null;
  }

  /**
   * Constructs a query argument array for retrieving posts with a specific meta key value.
   *
   * This function generates an array of arguments tailored for a WordPress query. It targets 
   * any post type and filters posts based on a meta key `modal_icons` matching the provided 
   * icon name. The function ensures that only the IDs of the matching posts are retrieved.
   *
   * @param string $icon_name The value to be matched against the `modal_icons` meta key.
   * @return array The argument array to be used with a WordPress query.
   */
  function postQuery($icon_name){ //maybe add a field named 'modal_scene'
    $args = array(
        'post_type' => 'any', 
        'meta_query' => array(
          'relation' => 'AND', // Ensures both conditions must be met
            array(
                'key'     => 'modal_icons',
                'value'   => $icon_name,
                'compare' => '='
              ),
              array(
                  'key'     => 'modal_published',
                  'value'   => 'published',
                  'compare' => '='
            )
        ),
        'fields' => 'ids' 
    );
    return $args;
  }

  function modal_helper($child_post_id, $child_ids, $child_id, $idx = 0){
          //get icon_type to check if modal
          
          $icon_type = get_post_meta($child_post_id, "icon_function");
          $icon_title = get_post_meta($child_post_id, "post_title");
          $modal = FALSE;
          $external_url =  '';
          $external_scene_id = '';
          $is_modal = get_post_meta($child_post_id,"post_type" );//[0]; //error here?
          $icon_order = get_post_meta($child_post_id,"modal_icon_order");
          //create array/map from child id to different attributes (ie hyperlinks)
          if($is_modal){
            if ($icon_type[0] === "Modal"){
              $modal = TRUE;
            } else if ($icon_type[0] === "External URL"){
              $external_url = get_post_meta( $child_post_id, "icon_external_url")[0];
            } else if ($icon_type[0] === "Scene"){
              $external_scene_id = get_post_meta( $child_post_id, "icon_scene_out");
              $external_url = get_permalink($external_scene_id[0]);

            } 
          $scene_id = get_post_meta($child_post_id, "modal_scene");
          $scenePost = get_post($scene_id[0]);
          $sceneName = get_post_meta($scenePost, "post_title");

          $section_name = isset(get_post_meta($child_post_id, "icon_toc_section")[0]) ? get_post_meta($child_post_id, "icon_toc_section")[0] : '';
          $child = $child_id;

          if (array_key_exists($child_id, $child_ids)){
            $child = ($child_id . $idx);
          }

          if (count($icon_order) == 0){
            $modal_icon_order = 1;
          } else if ($icon_order[0] == null){
            $modal_icon_order = 1;
          } else {
            $modal_icon_order = intval($icon_order[0]);
          }

          $child_ids[$child] = [
              "title" => $icon_title[0],
              "modal_id" => $child_post_id,
              "external_url" => $external_url,
              "modal" => $modal,
              "scene" => $scenePost,
              "section_name" => $section_name, 
              "original_name" => $child_id,
              "modal_icon_order" => $modal_icon_order,
            ];
          } 
          return $child_ids;
          //add to array
          // $child_ids[$icon_title[0]] = $modal;
  }
  /**
   * Ideal behavior: create n-D array with element IDs and boolean indicating whether or not element has corresponding modal
   *
   *
   * @param $svg_url The URL of the SVG file to be processed.
   * @return array The argument array to be used with a WordPress query.
   */
  function get_modal_array($svg_url){
    // from original function - just preprocessing of the svg url, etc.
    if($svg_url){
      // Find the path to the SVG file
      $relative_path = ltrim(parse_url($svg_url)['path'], "/");
      $full_path = ABSPATH . $relative_path;

      // Get the contents from the SVG file
      $svg_content = file_get_contents($full_path);

      // If the SVG content could not be loaded, terminate with an error message
      if(!$svg_content){
          die("Fail to load SVG file");
          return null;
      }
      // Load the SVG content into a DOMDocument
      $dom  = new DOMDocument();
      libxml_use_internal_errors(true);
      $dom->loadXML($svg_content);
      libxml_clear_errors();

      // Create a DOMXPath object for querying the DOMDocument
      $xpath = new DOMXPath($dom);

      // Find the element with ID "icons"
      $icons_element = $xpath->query('//*[@id="icons"]')->item(0); //could 
      // $icons_id = get_post_meta($icons_element);

      // If the element with ID "icons" is not found, terminate with an error message
      if($icons_element === null){
          die('Element with ID "icons" not found');
          return null;
      }

      // Get the child nodes of the "icons" element
      $child_elements = $icons_element->childNodes;
      $child_ids = array();
      
      foreach($child_elements as $child){
        // $needtocontinue = FALSE;
        if($child->nodeType === XML_ELEMENT_NODE && $child->hasAttribute('id')) {
          // Add the "id" attribute to the array
          $child_id = $child->getAttribute('id');
          //this is a WP_query object for the current child ID
          $query = new WP_Query(postQuery($child_id)); //here, the query produces all the modals with that ID

          $child_post_id_list = $query->posts;
          if (count($child_post_id_list) > 1) {
            // $lastChild = $child_elements->item($child_elements->length - 1);
            // // Get the parent node of the last item
            // $parentNode = $lastChild->parentNode;
            $idx = 1;
            foreach ($child_post_id_list as $cid) {
                // Create a new DOM element for each post ID
                // Append the new element to the parent node of the current child
                // $parentNode = $icon->parentNode;
                // $child_elements->appendChild($newElement);
                $child_ids = modal_helper($cid, $child_ids, $child_id, $idx);
                $idx++;
            }
            continue;
        }
        if (!empty($query->posts)){
          $child_post_id = $query->posts[0]; //should not always be 0th index; want to loop through all the posts and select the one that is found on this scene
          $child_ids = modal_helper($child_post_id, $child_ids, $child_id);
        }
          
          
        }
      }
      //reset global $Post object
      wp_reset_postdata();
      return $child_ids;
    }
    return null;
  }

  /**
   * Check if the Sanctuary Watch Framework plugin is active and display an admin notice if not.
   *
   * This function verifies whether the Sanctuary Watch Framework plugin required by the theme
   * is currently active. If the plugin is not active, it displays a dismissible
   * warning notice in the WordPress admin panel with a link to activate the plugin.
   *
   * @since 1.0.0
   * @access public
   * 
   * @uses is_plugin_active()   To check if the plugin is active
   * @uses admin_url()          To generate the URL to the plugins page
   * @uses add_action()         Hooked into 'admin_notices' action
   * 
   * @return void
   */
  function theme_check_required_plugin() {
    // Check if the is_plugin_active function is available
    if (!function_exists('is_plugin_active')) {
        include_once(ABSPATH . 'wp-admin/includes/plugin.php');
    }

    // Check if the required plugin is active
    if (!is_plugin_active('graphic_data_plugin/graphic_data_plugin.php')) {
        $message = sprintf(
            __('Warning: This theme requires the <strong>Graphic Data</strong> plugin to function properly. Please %1$s the plugin.', 'your-theme-textdomain'),
            '<a href="' . admin_url('plugins.php') . '">activate</a>'
        );
        
        echo '<div class="notice notice-warning is-dismissible"><p>' . $message . '</p></div>';
    }
  }
  add_action('admin_notices', 'theme_check_required_plugin');


  //enqueue javascript 
  function enqueue_info_scripts() {
    wp_enqueue_script(
        'script-js',
        get_template_directory_uri() . '/assets/js/script.js',
        array(),
        null,
        array('strategy' => 'defer') 
    );

    // Get the SVG URL (replace this with how you're getting it)
    $child_ids = get_post_meta( get_the_ID(), 'scene_child_ids', true ); // Get child_ids from post meta
    $svg_url = get_post_meta( get_the_ID(), 'scene_svg_url', true ); // Example: from post meta
  
    // Localize the script, passing the SVG URL and child_ids
//    wp_localize_script( 'script-js', 'my_script_vars', array( // Correct handle
//        'child_ids' => $child_ids,
//        'svg_url' => $svg_url,
//    ) );


}
add_action('wp_enqueue_scripts', 'enqueue_info_scripts');

function enqueue_info_scripts2() {
  wp_enqueue_script(
      'index-js',
      get_template_directory_uri() . '/assets/js/index.js',
      array(),
      null,
      array('strategy' => 'defer') 
  );
}
add_action('wp_enqueue_scripts', 'enqueue_info_scripts2');


function enqueue_scene_render_script() {
  wp_enqueue_script(
    'scene-render', 
    content_url() . '/plugins/graphic_data_plugin/includes/scenes/js/scene-render.js', 
    array(), '1.0.0', 
    array('strategy'  => 'defer')
  );
}
add_action('wp_enqueue_scripts', 'enqueue_scene_render_script');


function enqueue_modal_render_script() {
  wp_enqueue_script(
    'modal-render', 
    content_url() . '/plugins/graphic_data_plugin/includes/modals/js/modal-render.js', 
    array(), '1.0.0', 
    array('strategy'  => 'defer')
  );
}
add_action('wp_enqueue_scripts', 'enqueue_modal_render_script');


function enqueue_figure_render_script() {
  wp_enqueue_script(
    'figure-render', 
    content_url() . '/plugins/graphic_data_plugin/includes/figures/js/figure-render.js', 
    array(), '1.0.0', 
    array('strategy'  => 'defer')
  );
}
add_action('wp_enqueue_scripts', 'enqueue_figure_render_script');


function enqueue_figure_code_script() {
  wp_enqueue_script(
    'figure-code', 
    content_url() . '/plugins/graphic_data_plugin/includes/figures/js/code/figure-code.js', 
    array(), '1.0.0', 
    array('strategy'  => 'defer')
  );
}
add_action('wp_enqueue_scripts', 'enqueue_figure_code_script');


function enqueue_plotly_utility_script() {
  wp_enqueue_script(
    'utility', 
    content_url() . '/plugins/graphic_data_plugin/includes/figures/js/interactive/plotly-utility.js', 
    array(), '1.0.0', 
    array('strategy'  => 'defer')
  );
}
add_action('wp_enqueue_scripts', 'enqueue_plotly_utility_script');



function enqueue_plotly_line_script() {
  wp_enqueue_script(
    'plotly-timeseries-line', 
    content_url() . '/plugins/graphic_data_plugin/includes/figures/js/interactive/plotly-timeseries-line.js', 
    array(), '1.0.0', 
    array('strategy'  => 'defer')
  );
}
add_action('wp_enqueue_scripts', 'enqueue_plotly_line_script');


function enqueue_plotly_bar_script() {
  wp_enqueue_script(
    'plotly-bar', 
    content_url() . '/plugins/graphic_data_plugin/includes/figures/js/interactive/plotly-bar.js', 
    array(), '1.0.0', 
    array('strategy'  => 'defer')
  );
}
add_action('wp_enqueue_scripts', 'enqueue_plotly_bar_script');


function enqueue_plotly_map_script() {
  wp_enqueue_script(
    'plotly-map', 
    content_url() . '/plugins/graphic_data_plugin/includes/figures/js/interactive/plotly-map.js', 
    array(), '1.0.0', 
    array('strategy'  => 'defer')
  );
}
add_action('wp_enqueue_scripts', 'enqueue_plotly_map_script');


function enqueue_google_tags_scripts() {
  wp_enqueue_script(
      'googletags',
      get_template_directory_uri() . '/assets/js/googletags.js',
      array(),
      null,
      array('strategy' => 'defer') 
  );
}
add_action('wp_enqueue_scripts', 'enqueue_google_tags_scripts');
?>