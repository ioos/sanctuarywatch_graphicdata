<?php

/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://www.noaa.gov
 * @since      0.2.0-beta
 *
 * @package    graphic_data_plugin
 * @subpackage graphic_data_plugin/admin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 *
 * @package    Webcr
 * @subpackage Webcr/admin
 * @author     Jai Ranganathan <jai.ranganathan@noaa.gov>
 */
class Webcr_Admin {

	/**
	 * The ID of this plugin.
	 *
	 * @since    0.2.0-beta
	 * @access   private
	 * @var      string    $plugin_name    The ID of this plugin.
	 */
	private $plugin_name;

	/**
	 * The version of this plugin.
	 *
	 * @since    0.2.0-beta
	 * @access   private
	 * @var      string    $version    The current version of this plugin.
	 */
	private $version;

	/**
	 * Initialize the class and set its properties.
	 *
	 * @since    0.2.0-beta
	 * @param      string    $plugin_name       The name of this plugin.
	 * @param      string    $version    The version of this plugin.
	 */
	public function __construct( $plugin_name, $version ) {

		$this->plugin_name = $plugin_name;
		$this->version = $version;

	}

	/**
	 * Register the stylesheets for the admin area.
	 *
	 * @since    0.2.0-beta
	 */
	public function enqueue_styles() {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Webcr_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Webcr_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		wp_enqueue_style( $this->plugin_name, plugin_dir_url( __FILE__ ) . 'css/webcr-admin.css', array(), $this->version, 'all' );

		wp_enqueue_style(
			'font-awesome-admin', $src =
			'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css', 
			$deps = array(), 
			$ver = '6.6.0'
		);

	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * @since    0.2.0-beta
	 */
	public function enqueue_scripts($hook_suffix) {

		/**
		 * This function is provided for demonstration purposes only.
		 *
		 * An instance of this class should be passed to the run() function
		 * defined in Webcr_Loader as all of the hooks are defined
		 * in that particular class.
		 *
		 * The Webcr_Loader will then create the relationship
		 * between the defined hooks and the functions defined in this
		 * class.
		 */

		// Enqueue utlity javascript functions used across javascript files on the admin side
		 wp_enqueue_script( "webcr-utility", plugin_dir_url( __FILE__ ) . 'js/utility.js', array(  ), $this->version, array('strategy'  => 'defer') );

		$current_post_type = get_post_type();
		// Load About-specific Javascript only when editing/creating an About post 
		if ($current_post_type == "about" && ($hook_suffix == "post.php" || $hook_suffix == "post-new.php")){
			wp_enqueue_script( "webcr-admin-about", plugin_dir_url( __FILE__ ) . 'js/webcr-admin-about.js', array(  ), $this->version, array('strategy'  => 'defer') );
		}

		// Load Instance-specific Javascript only when editing/creating a Instance post 
		if ($current_post_type == "instance" && ($hook_suffix == "post.php" || $hook_suffix == "post-new.php")){
			wp_enqueue_script( "webcr-admin-instance", plugin_dir_url( __FILE__ ) . 'js/webcr-admin-instance.js', array(  ), $this->version, array('strategy'  => 'defer') );
		}

		// Load Scene-specific Javascript only when editing/creating a Scene post 
		if ($current_post_type == "scene" && ($hook_suffix == "post.php" || $hook_suffix == "post-new.php")){
			wp_enqueue_script( "webcr-admin-scene", plugin_dir_url( __FILE__ ) . 'js/webcr-admin-scene.js', array(  ), $this->version, array('strategy'  => 'defer') );
		}

		// Load Modal-specific Javascript only when editing/creating a Modal post 
		if ($current_post_type == "modal" && ($hook_suffix == "post.php" || $hook_suffix == "post-new.php")){
			wp_enqueue_script( "admin-modal", plugin_dir_url( __FILE__ ) . 'js/admin-modal.js', array( ), $this->version, array('strategy'  => 'defer') );

			// Enqueue modal-render.js
			wp_enqueue_script('modal-render', dirname(plugin_dir_url(__FILE__)) . '/includes/modals/js/modal-render.js',array(), '0.2.0-beta', array('strategy'  => 'defer'));
		}

		// Load Figure -specific Javascript only when editing/creating a Figure post 
		if ($current_post_type == "figure" && ($hook_suffix == "post.php" || $hook_suffix == "post-new.php")){

			// Enqueue figure-render.js
			wp_enqueue_script('figure-render', dirname(plugin_dir_url(__FILE__)) . '/includes/figures/js/figure-render.js',array(), '0.2.0-beta', array('strategy'  => 'defer'));

			// Enqueue utility.js
			wp_enqueue_script('figure-utility', dirname(plugin_dir_url(__FILE__)) . '/includes/figures/js/interactive/plotly-utility.js',array(), '0.2.0-beta', array('strategy'  => 'defer'));
		
			// Enqueue plotly-timeseries-line.js
			wp_enqueue_script('plotly-timeseries-line', dirname(plugin_dir_url(__FILE__)) .  '/includes/figures/js/interactive/plotly-timeseries-line.js', array(), '1.0.0', array('strategy'  => 'defer'));

			// Enqueue plotly-bar.js
			wp_enqueue_script('plotly-bar', dirname(plugin_dir_url(__FILE__)) .  '/includes/figures/js/interactive/plotly-bar.js', array(), '1.0.0', array('strategy'  => 'defer'));

			// Enqueue plotly-map.js
			wp_enqueue_script('plotly-map', dirname(plugin_dir_url(__FILE__)) .  '/includes/figures/js/interactive/plotly-map.js', array(), '1.0.0', array('strategy'  => 'defer'));

			// Enqueue file-upload.js
			wp_enqueue_script('file-upload', dirname(plugin_dir_url(__FILE__)) .  '/includes/figures/js/interactive/file-upload.js', array(), '1.0.0', array('strategy'  => 'defer'));

			// Enqueue figure-code.js
			wp_enqueue_script('figure-code', dirname(plugin_dir_url(__FILE__)) . '/includes/figures/js/code/figure-code.js',array(), '0.2.0-beta', array('strategy'  => 'defer'));

			// Enqueue admin-figure.js
			wp_enqueue_script( "admin-figure", plugin_dir_url( __FILE__ ) . 'js/admin-figure.js', array( ), $this->version, array('strategy'  => 'defer') );

		}

		// Load Modal-specific Javascript only for admin columns screen 
		if ($current_post_type == "modal" && $hook_suffix == "edit.php" ){
			wp_enqueue_script( "admin-modal_columns", plugin_dir_url( __FILE__ ) . 'js/admin-modal-columns.js', array(  ), $this->version, array('strategy'  => 'defer') );
		}

		// Load Figure-specific Javascript only for admin columns screen 
		if ($current_post_type == "figure" && $hook_suffix == "edit.php" ){
			wp_enqueue_script( "admin-figure_columns", plugin_dir_url( __FILE__ ) . 'js/admin-figure-columns.js', array( ), $this->version, array('strategy'  => 'defer') );
		}

		// Load Figure Export Javascript, but only when on Figure Export Tool page 
		$current_screen = get_current_screen();
		if ($current_screen-> base == "tools_page_export-figures"){
			wp_enqueue_script( "admin-figure_export", plugin_dir_url( __FILE__ ) . 'js/admin-export-figures.js', array(  ), $this->version, array('strategy'  => 'defer') );
			// Enqueue Bootstrap JavaScript
			wp_enqueue_script('PptxGenJS', 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js', array(), '3.12.0', true);

		}
	}

    /**
	 * Remove the ability to access Comments, Posts, Users, and Pages content types from the admin bar of the dashboard.
	 *
	 * @since    1.0.0
	 */
    public function remove_admin_bar_options(){
        global $wp_admin_bar;
        $wp_admin_bar->remove_menu('comments');
		$wp_admin_bar->remove_menu('new-page');
		$wp_admin_bar->remove_menu('new-post');
		$wp_admin_bar->remove_menu('new-user');
    }

	/**
	 * Enqueue Bootstrap (version 5.3.0) CSS and Javascript.
	 *
	 * @since    1.0.0
	 */
	function enqueue_bootstrap_admin() {
		// Enqueue Bootstrap CSS
		wp_enqueue_style('bootstrap-css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', array(), '5.3.0');
		
		// Enqueue Bootstrap JavaScript
		wp_enqueue_script('bootstrap-js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', array(), '5.3.0', true);
	}

    /**
	 * Remove the ability to access the Comments, Posts, and Pages content types from the sidebar of the dashboard.
	 *
	 * @since    1.0.0
	 */
    public function remove_elements_from_menu() {
		//remove comments from the admin menu
        remove_menu_page('edit-comments.php');
		//remove posts from the admin menu
		remove_menu_page('edit.php');
		//remove pages from the admin menu
		remove_menu_page('edit.php?post_type=page');
    }

    /**
	 * Remove remove unwanted widgets from the WordPress dashboard.
	 *
	 * @since    1.0.0
	 */
    public function remove_dashboard_widgets(){
        remove_meta_box('dashboard_quick_press', 'dashboard', 'side');
        remove_meta_box('dashboard_primary', 'dashboard', 'side');
    }

    /**
	 * Remove header row before fields for custom content types.
	 *
	 * @since    1.0.0
	 */
    public function remove_header_row() {
        echo '<style>
        .postbox-header {
            display: none;
            } 
        </style>';
    }
	
    /**
	 * Remove WordPress version number from appearing in the lower right of admin footer.
	 *
	 * @since    1.0.0
	 */
    function wppversionremove() {
        remove_filter( 'update_footer', 'core_update_footer' );
    }

    /**
	 * Remove permalink from edit post admin screens.
	 *
	 * @since    1.0.0
	 */
    function hide_permalink() {
        return '';
    }

    /**
	 * Remove screen options metabox from edit post screens.
	 *
	 * @since    1.0.0
	 */
    function remove_screen_options() {
        return "__return_false";
    }

    /**
	 * Remove  "Thank you for creating with wordpress" from the lower left of the footer of admin screens.
	 *
	 * @since    1.0.0
	 */
    function remove_thank_you() {
        return ; 
    }

    /**
	 * Remove  "Thank you for creating with wordpress" from the lower left of the footer of admin screens.
	 *
	 * @since    1.0.0
	 */
    function remove_gutenberg() {
        return FALSE; 
    }

    /**
	 * Remove "All dates" filter from admin screens.
	 *
	 * @since    1.0.0
	 */
    function remove_all_dates() {
        return array(); 
    }

    /**
	 * Change default favicon associated with site to Sanctuary Watch logo, if there is no site icon set in the theme.
	 *
	 * @since    1.0.0
	 */
    function add_favicon() {
		if (!has_site_icon()) {
			$favicon_url = plugin_dir_url( __FILE__ ) . 'images/onms-logo-80.png';
			echo '<link rel="shortcut icon" href="' . $favicon_url . '" />';
		}
   }

	/**
	 * Filters the text of the Publish and Update buttons to display "Save" instead.
	 *
	 * This function hooks into the `gettext` filter to modify the button text
	 * in the WordPress post editor, changing "Publish" and "Update" to "Save".
	 *
	 * @param string $translated_text The translated text that WordPress is about to output.
	 * @param string $text The original text string before translation.
	 * @param string $domain The text domain of the translation.
	 *
	 * @return string The modified button label if the original text is "Publish" or "Update", otherwise returns the original translated text.
	 *
	 * @example
	 * add_filter( 'gettext', 'modify_publish_button_text', 10, 3 );
	 *
	 * @since 0.1.0-beta
	 */
	function modify_publish_button_text( $translated_text, $text, $domain ) {
		if ( is_admin() ) {
			if ( $text === 'Publish' || $text === 'Update' ) {
				return 'Save';
			}
		}
		return $translated_text;
	}

	/**
	 * Add Content Manager as a role
	 *
	 * @since    1.0.0
	 */
	function add_content_manager_custom_role() {
		//remove_role( 'webcr_content_manager');
		$content_manager_role_exists = wp_roles()->is_role('webcr_content_manager');
		if ($content_manager_role_exists == false) {
			add_role('webcr_content_manager', __('Content Manager'),
				get_role( 'editor' )->capabilities);
		}
	}

	/**
	 * Edit what the Content Manager can see on the dashboard
	 *
	 * @since    1.0.0
	 */
	function restrict_content_manager_admin_menu() {
		if (current_user_can('webcr_content_manager')) {
		//	remove_menu_page('index.php');                  // Dashboard
			remove_menu_page('edit.php');                   // Posts
		//	remove_menu_page('upload.php');                 // Media
			remove_menu_page('edit.php?post_type=page');    // Pages
			remove_menu_page('manage-instance-types'); //Manage Instance Types
			remove_menu_page('edit.php?post_type=about');
			remove_menu_page('edit.php?post_type=instance');
		//	remove_menu_page('edit-comments.php');          // Comments
		//	remove_menu_page('themes.php');                 // Appearance
		//	remove_menu_page('plugins.php');                // Plugins
		//	remove_menu_page('users.php');                  // Users
		//	remove_menu_page('tools.php');                  // Tools
		//	remove_menu_page('options-general.php');        // Settings

		}
	}

	// Remove various post options from top row of admin bar with users of editor capacity or lower
	function restrict_new_post_from_admin_bar($wp_admin_bar) {
		// Check if the user has a role of editor or lower
		if (!current_user_can('manage_options')) {
			// Remove the "Post" item from the "New" dropdown
			$wp_admin_bar->remove_node('new-post');
			$wp_admin_bar->remove_node('new-page');
			$wp_admin_bar->remove_node('new-about');
			$wp_admin_bar->remove_node('new-instance');

		}
	}
	// Function to add SVG support
	function allow_svg_uploads($mimes) {
		$mimes['svg'] = 'image/svg+xml';
		return $mimes;
	}

	// Custom permalink structure for Scene and About custom content types - new Claude code
	function custom_permalink($permalink, $post) {
		if ($post->post_type === 'scene') {
			// Get the instance ID from scene_location
			$instance_id = get_post_meta($post->ID, 'scene_location', true);
			if (!$instance_id) {
				return $permalink;
			}

			// Get the instance slug
			$instance_slug = get_post_meta($instance_id, 'instance_slug', true);
			if (!$instance_slug) {
				return $permalink;
			}

			// Build the custom permalink
			return home_url('/' . $instance_slug . '/' . $post->post_name);
		}
		elseif ($post->post_type === 'about') {
			// Always return /about regardless of post slug
			return home_url('/about');
		}

		return $permalink;
	}

	/**
	 * Remove "view" link from admin screen for instance, modal, and figure posts.
	 *
	 * @param array    $actions An array of row action links.
	 * @param WP_Post  $post    The post object.
	 * @since    1.0.0
	 */
	function remove_view_link_from_post_type($actions, $post) {
		if (($post->post_type === 'instance' || $post->post_type === 'modal' || $post->post_type === 'figure')&& isset($actions['view'])) {
			unset($actions['view']); // Remove the "View" link
		}
		return $actions;
	}

	/**
	 * Checks if the required theme ("Graphic Data Theme") is active.
	 *
	 * If the required theme is not active, it displays an admin notice
	 * warning the user. This function is hooked to 'admin_notices'.
	 *
	 * @since 1.0.0
	 */
	function plugin_check_required_theme() {
		$current_theme = wp_get_theme();
		$required_theme = 'Graphic Data Theme'; // Replace with your theme's folder name
		
		if ($current_theme->get('Name') !== $required_theme && $current_theme->get('Template') !== $required_theme) {
			$message = sprintf(
				__('Warning: The <strong>Graphic Data plugin</strong> is designed to work only with the <strong>Graphic Data theme</strong>.', 'your-plugin-textdomain'));
			
			echo '<div class="notice notice-warning is-dismissible"><p>' . $message . '</p></div>';
		}
	}

	/**
	 * Starts the PHP session (used for field validation) using the 'init' WordPress hook.
	 *
	 * @since 1.0.0
	 */
	function start_session () {
		if (!session_id() && !headers_sent()) {
			session_start();
		}
	}

function adjust_admin_post_time_display() {
    global $post;
    
    // Only run on edit screens for your custom post types
    $screen = get_current_screen();
    if (!$screen || $screen->base !== 'post') {
        return;
    }
    
    $custom_post_types = array('instance', 'scene', 'modal', 'figure', 'about');
    if (!in_array($screen->post_type, $custom_post_types)) {
        return;
    }
    
    // Get the post and convert time to local timezone
    if ($post && $post->post_date) {
        // Convert to 12-hour format with AM/PM
        $local_time = get_date_from_gmt($post->post_date, 'F j, Y @ g:i A');
        
        // Get the user who published the post
        $author = get_userdata($post->post_author);
        
        if ($author) {
            $first_name = $author->first_name;
            $last_name = $author->last_name;
            
            // Use first name + last name if both are available
            if (!empty($first_name) && !empty($last_name)) {
                $author_name = $first_name . ' ' . $last_name;
            } elseif (!empty($first_name)) {
                // Use just first name if only first name is available
                $author_name = $first_name;
            } elseif (!empty($last_name)) {
                // Use just last name if only last name is available
                $author_name = $last_name;
            } else {
                // Fall back to display name if no first/last name
                $author_name = $author->display_name;
            }
        } else {
            $author_name = 'Unknown';
        }
        
        // Get the last modification details
        $last_modified_time = '';
        $last_modified_by = '';
        
		$is_post_updated = get_post_modified_time('U', false, $post->ID) > get_post_time('U', false, $post->ID);

        if ($is_post_updated == true) {
            // Get the most recent revision

            $last_modified_time = get_post_modified_time('F j, Y @ g:i A', false, $post->ID);

            $last_modified_user_id = get_post_field('post_author', $post->ID);
            $last_modified_user = get_userdata($last_modified_user_id);
			$last_modified_first_name = $last_modified_user -> first_name;
			$last_modified_last_name = $last_modified_user -> last_name;
                
			// Use first name + last name if both are available
			if (!empty($last_modified_first_name) && !empty($last_modified_last_name)) {
				$last_modified_by = $last_modified_first_name . ' ' . $last_modified_last_name;
			} elseif (!empty($last_modified_first_name)) {
				// Use just first name if only first name is available
				$last_modified_by = $last_modified_first_name;
			} elseif (!empty($last_modified_last_name)) {
				// Use just last name if only last name is available
				$last_modified_by = $last_modified_last_name;
			} else {
				// Fall back to display name if no first/last name
				$last_modified_by = $last_modified_user ->display_name;
			}
        }
        
        ?>
        <script type="text/javascript">
        jQuery(document).ready(function($) {
            // Find and replace the timestamp in the publish metabox
            <?php if ($is_post_updated == true): ?>
            replacementText = "Published on: <b><?php echo esc_js($local_time); ?></b> by <b><?php echo esc_js($author_name); ?></b><br><span class='dashicons dashicons-calendar-alt' style='margin-right: 5px;'></span>Last modified on: <b><?php echo esc_js($last_modified_time); ?></b> by <b><?php echo esc_js($last_modified_by); ?></b>";
            <?php else: ?>
            replacementText = "Published on: <b><?php echo esc_js($local_time); ?></b> by <b><?php echo esc_js($author_name); ?></b>";
            <?php endif; ?>
            $('#timestamp').html(replacementText);
        });
        </script>
        <?php
    }
}

}

