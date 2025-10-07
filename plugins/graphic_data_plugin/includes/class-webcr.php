<?php

/**
 * The file that defines the core plugin class
 *
 * A class definition that includes attributes and functions used across both the
 * public-facing side of the site and the admin area.
 *
 * @link       https://www.noaa.gov
 * @since      1.0.0
 *
 * @package    Webcr
 * @subpackage Webcr/includes
 */

/**
 * The core plugin class.
 *
 * This is used to define internationalization, admin-specific hooks, and
 * public-facing site hooks.
 *
 * Also maintains the unique identifier of this plugin as well as the current
 * version of the plugin.
 *
 * @since      1.0.0
 * @package    Webcr
 * @subpackage Webcr/includes
 * @author     Jai Ranganathan <jai.ranganathan@noaa.gov>
 */
class Webcr {

	/**
	 * The loader that's responsible for maintaining and registering all hooks that power
	 * the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      Webcr_Loader    $loader    Maintains and registers all hooks for the plugin.
	 */
	protected $loader;

	/**
	 * The unique identifier of this plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $plugin_name    The string used to uniquely identify this plugin.
	 */
	protected $plugin_name;

	/**
	 * The current version of the plugin.
	 *
	 * @since    1.0.0
	 * @access   protected
	 * @var      string    $version    The current version of the plugin.
	 */
	protected $version;

	/**
	 * Define the core functionality of the plugin.
	 *
	 * Set the plugin name and the plugin version that can be used throughout the plugin.
	 * Load the dependencies and set the hooks for the admin area and
	 * the public-facing side of the site.
	 *
	 * @since    1.0.0
	 */
	public function __construct() {
		if ( defined( 'WEBCR_VERSION' ) ) {
			$this->version = WEBCR_VERSION;
		} else {
			$this->version = '1.0.0';
		}
		$this->plugin_name = 'webcr';

		$this->load_dependencies();
		$this->define_admin_hooks();
		$this->define_public_hooks();
	}

	/**
	 * Load the required dependencies for this plugin.
	 *
	 * Include the following files that make up the plugin:
	 *
	 * - Webcr_Loader. Orchestrates the hooks of the plugin.
	 * - Webcr_Admin. Defines all hooks for the admin area.
	 * - Webcr_Public. Defines all hooks for the public side of the site.
	 *
	 * Create an instance of the loader which will be used to register the hooks
	 * with WordPress.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function load_dependencies() {

		/**
		 * The class responsible for orchestrating the actions and filters of the
		 * core plugin.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-webcr-loader.php';

		/**
		 * The class responsible for defining all actions that occur in the admin area.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-webcr-admin.php';

		/**
		 * The class responsible for defining all actions that occur in the public-facing
		 * side of the site.
		 */
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'public/class-webcr-public.php';

		// The class that defines the metaboxes used for field entry
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/exopite-simple-options/exopite-simple-options-framework-class.php';

		// The class that defines the functions used to alter the WordPress login screen
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-webcr-login.php';

		// The class that defines the functions used for the Scene custom content type
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-webcr-scene.php';

		// The class that defines the functions used for the Modal custom content type
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/admin-modal.php';

		// The class that defines the functions used for the Figure custom content type
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/admin-figure.php';

		// The class that defines the functions used for the Instance custom content type
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-webcr-instance.php';

		// The class that defines the functions used to define Instance Types
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-webcr-instance-type.php';

		// The class that defines the functions used for the About custom content type
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-webcr-about.php';

		// The class that defines the functions used for the Export Figures Tool
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-webcr-export-figures.php';

		// The class that defines the validation methods used for the custom post types
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-webcr-validation.php';

		// The class that defines the validation methods used for the content editor user types
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-webcr-content-editor-role.php';

		// The class that defines the support page for the plugin
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-graphic-data-support.php';

		// The class that defines the settings page for the plugin
		require_once plugin_dir_path( dirname( __FILE__ ) ) . 'includes/class-graphic-data-settings-page.php';

		// The class that defines general utility functions for the plugin
		include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-webcr-utility.php';

		$this->loader = new Webcr_Loader();
	}

	/**
	 * Register all of the hooks related to the admin area functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	public function define_admin_hooks() {
		// Load class and functions of utility functions
		$plugin_utility = new Webcr_Utility();
		$this->loader->add_action( 'admin_notices', $plugin_utility, 'post_admin_notice' ); 
		$this->loader->add_action( 'admin_footer', $plugin_utility, 'output_transient_to_js' ); 

		// Load class and functions to change overall look and function of admin screens
		$plugin_admin = new Webcr_Admin( $this->get_plugin_name(), $this->get_version() );
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_styles', 10 );  
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_scripts', 10 ); 
		$this->loader->add_action( 'login_head', $plugin_admin, 'add_favicon' ); 
		$this->loader->add_action( 'admin_head', $plugin_admin, 'add_favicon' ); 
		$this->loader->add_action( 'wp_before_admin_bar_render', $plugin_admin, 'remove_admin_bar_options' ); 
		$this->loader->add_action( 'admin_menu', $plugin_admin, 'remove_elements_from_menu' ); 
		$this->loader->add_action( 'wp_dashboard_setup', $plugin_admin, 'remove_dashboard_widgets' ); 
		$this->loader->add_action( 'admin_menu', $plugin_admin, 'wppversionremove' ); 
		$this->loader->add_action( 'get_sample_permalink_html', $plugin_admin, 'wppversionremove' ); 
		$this->loader->add_filter( 'get_sample_permalink_html', $plugin_admin, 'hide_permalink' ); 
		$this->loader->add_action( 'admin_head', $plugin_admin, 'remove_header_row' ); 
		$this->loader->add_filter( 'admin_footer_text', $plugin_admin, 'remove_thank_you'); 
		$this->loader->add_filter( 'months_dropdown_results', $plugin_admin, 'remove_all_dates');
		$this->loader->add_filter( 'use_block_editor_for_post', $plugin_admin, 'remove_gutenberg');
		$this->loader->add_filter( 'screen_options_show_screen', $plugin_admin, 'remove_screen_options'); 
	//	$this->loader->add_filter( 'init', $plugin_admin, 'add_content_manager_custom_role'); 
		$this->loader->add_filter( 'admin_menu', $plugin_admin, 'restrict_content_manager_admin_menu', 999); 
		$this->loader->add_filter( 'upload_mimes', $plugin_admin, 'allow_svg_uploads'); 
		$this->loader->add_filter( 'admin_enqueue_scripts', $plugin_admin, 'enqueue_bootstrap_admin', 5); 
		$this->loader->add_filter( 'admin_bar_menu', $plugin_admin, 'restrict_new_post_from_admin_bar', 999); 
		$this->loader->add_filter( 'gettext', $plugin_admin, 'modify_publish_button_text', 10, 3); 
		add_filter( 'xmlrpc_enabled', '__return_false' ); 		//Disable Xlmrpc.php file
		add_filter('screen_options_show_screen', '__return_false'); //Disable Screen Options in admin screens
		$this->loader->add_filter( 'post_row_actions', $plugin_admin, 'remove_view_link_from_post_type', 10, 2); 
		$this->loader->add_action( 'admin_notices', $plugin_admin, 'plugin_check_required_theme' ); 
		$this->loader->add_action( 'init', $plugin_admin, 'start_session' ); 
		$this->loader->add_action( 'admin_footer-post.php', $plugin_admin, 'adjust_admin_post_time_display', 10); 
		$this->loader->add_action( 'admin_footer-post-new.php', $plugin_admin, 'adjust_admin_post_time_display', 10); 

		// Load  class and functions associated with About custom content type
		$plugin_admin_about = new Webcr_About ( $this->get_plugin_name(), $this->get_version() );		
		$this->loader->add_action( 'init', $plugin_admin_about, 'custom_content_type_about' ); 
		$this->loader->add_action( 'admin_menu', $plugin_admin_about, 'create_about_fields', 1 );
		$this->loader->add_action( 'admin_head-edit.php', $plugin_admin_about, 'modify_about_add_new_button' ); // New Claude function for restricting number of about posts
		$this->loader->add_action( 'admin_notices', $plugin_admin_about, 'display_about_limit_notice' );  // New Claude function for restricting number of about posts
		$this->loader->add_action( 'wp_insert_post_data', $plugin_admin_about, 'prevent_multiple_about_posts', 10, 2);  // New Claude function for restricting number of about posts
		$this->loader->add_action( 'template_redirect', $plugin_admin_about, 'handle_about_template' );  // New Claude function for forcing use of single-about.php file for about posts
		$this->loader->add_filter( 'post_type_link', $plugin_admin_about, 'custom_about_permalink', 10, 2 ); // Claude function for forcing About permalink structure

		// Load  class and functions associated with Instance custom content type
		$plugin_admin_instance = new Webcr_Instance ( $this->get_plugin_name(), $this->get_version() );		
		$this->loader->add_action( 'init', $plugin_admin_instance, 'custom_content_type_instance' ); 
		$this->loader->add_action( 'admin_menu', $plugin_admin_instance, 'create_instance_fields', 1 );
		$this->loader->add_action( 'manage_instance_posts_columns', $plugin_admin_instance, 'change_instance_columns' ); 
		$this->loader->add_action( 'manage_instance_posts_custom_column', $plugin_admin_instance, 'custom_instance_column', 10, 2 ); 
		$this->loader->add_filter( 'bulk_actions-edit-instance', $plugin_admin_instance, 'remove_bulk_actions' ); 
		$this->loader->add_filter( 'post_row_actions', $plugin_admin_instance, 'custom_content_remove_quick_edit_link', 10, 2 ); 
		$this->loader->add_filter( 'rest_api_init', $plugin_admin_instance, 'register_instance_rest_fields' ); 
		$this->loader->add_action( 'admin_notices', $plugin_admin_instance, 'taxonomy_problem_admin_notice',10 ); 
		$this->loader->add_action( 'admin_notices', $plugin_admin_instance, 'instance_admin_notice',20 ); 

		// Load class and functions associated with the Settings Page
		$plugin_admin_settings_page = new Graphic_Data_Settings_Page ( $this->get_plugin_name(), $this->get_version() );		
		$this->loader->add_action( 'admin_menu', $plugin_admin_settings_page, 'webcr_add_admin_menu' ); 
		$this->loader->add_action( 'admin_init', $plugin_admin_settings_page, 'webcr_settings_init' ); 
        $plugin = plugin_basename(__FILE__); //Used in the next line
        $this->loader->add_filter("plugin_action_links_$plugin", $plugin_admin_settings_page, 'add_settings_link');
		$this->loader->add_action( 'rest_api_init', $plugin_admin_settings_page, 'webcr_register_rest_settings');
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin_settings_page, 'enqueue_admin_interactive_default_line_styles');
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin_settings_page, 'enqueue_admin_interactive_default_bar_styles');

		// Load class and functions associated with Instance Types
		$plugin_admin_instance_type = new Webcr_Instance_Type ( $this->get_plugin_name(), $this->get_version() );		
		$this->loader->add_action( 'admin_init', $plugin_admin_instance_type, 'instance_settings_init' ); 
		$this->loader->add_action( 'init', $plugin_admin_instance_type, 'register_instance_type_taxonomy', 0); // Priority 0 to run early
		$this->loader->add_action( 'init', $plugin_admin_instance_type, 'register_instance_type_order_meta'); 
		$this->loader->add_action( 'init', $plugin_admin_instance_type, 'register_instance_type_navbar_name_meta'); 
		$this->loader->add_action( 'admin_menu', $plugin_admin_instance_type, 'add_instance_type_admin_menu'); 

		// Load  class and functions associated with Scene custom content type
		$plugin_admin_scene = new Webcr_Scene( $this->get_plugin_name(), $this->get_version() );		
		$this->loader->add_action( 'restrict_manage_posts', $plugin_admin_scene, 'scene_filter_dropdowns' ); 
		$this->loader->add_action( 'pre_get_posts', $plugin_admin_scene, 'scene_location_filter_results' ); 
		$this->loader->add_action( 'current_screen', $plugin_admin_scene, 'cleanup_expired_scene_filters' ); 
		$this->loader->add_action( 'admin_menu', $plugin_admin_scene, 'create_scene_fields', 1 ); 
		$this->loader->add_action( 'manage_scene_posts_columns', $plugin_admin_scene, 'change_scene_columns' ); 
		$this->loader->add_action( 'manage_scene_posts_custom_column', $plugin_admin_scene, 'custom_scene_column', 10, 2 ); 
		$this->loader->add_action( 'init', $plugin_admin_scene, 'custom_content_type_scene' ); 
		$this->loader->add_filter( 'bulk_actions-edit-scene', $plugin_admin_instance, 'remove_bulk_actions' ); 
		$this->loader->add_action( 'wp_ajax_scene_preview', $plugin_admin_scene, 'scene_preview' ); 
		$this->loader->add_action( 'post_row_actions', $plugin_admin_scene, 'modify_scene_quick_edit_link', 10, 2 ); 
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin_scene, 'enqueue_scene_admin_columns_css'); 
		$this->loader->add_action( 'rest_api_init', $plugin_admin_scene, 'register_scene_rest_fields'); 
		$this->loader->add_filter( 'rest_scene_query', $plugin_admin_scene, 'filter_scene_by_scene_location', 10, 2); 
		$this->loader->add_filter( 'rewrite_rules_array', $plugin_admin_scene, 'add_scene_rewrite_rules'); 
		$this->loader->add_filter( 'post_type_link', $plugin_admin_scene, 'remove_scene_slug', 10, 3); 
		$this->loader->add_filter( 'manage_edit-scene_sortable_columns', $plugin_admin_scene, 'register_status_as_sortable_column'); 
		$this->loader->add_action( 'pre_get_posts', $plugin_admin_scene, 'orderby_status_column'); //This action orders by the status column for scene, modal, and figure content types 
        $this->loader->add_action( 'admin_notices', $plugin_admin_scene, 'display_overview_scene_notice' ); 

		// Load  class and functions associated with Modal custom content type
		$plugin_admin_modal = new Webcr_Modal ($this->get_plugin_name(), $this->get_version() );	
		$this->loader->add_action( 'restrict_manage_posts', $plugin_admin_modal, 'modal_filter_dropdowns' ); 
		$this->loader->add_action( 'pre_get_posts', $plugin_admin_modal, 'modal_location_filter_results' ); 
		$this->loader->add_action( 'current_screen', $plugin_admin_modal, 'cleanup_expired_modal_filters' ); 
		$this->loader->add_action( 'admin_menu', $plugin_admin_modal, 'create_modal_fields', 1 ); 
		$this->loader->add_action( 'manage_modal_posts_columns', $plugin_admin_modal, 'change_modal_columns' ); 
		$this->loader->add_action( 'manage_modal_posts_custom_column', $plugin_admin_modal, 'custom_modal_column', 10, 2 ); 
		$this->loader->add_action( 'init', $plugin_admin_modal, 'custom_content_type_modal' );
		$this->loader->add_filter( 'bulk_actions-edit-modal', $plugin_admin_instance, 'remove_bulk_actions' ); 
		$this->loader->add_action( 'rest_api_init', $plugin_admin_modal, 'register_modal_rest_fields' );
		$this->loader->add_filter( 'rest_modal_query', $plugin_admin_modal, 'filter_modal_by_modal_scene', 10, 2); 
		$this->loader->add_filter( 'manage_edit-modal_sortable_columns', $plugin_admin_scene, 'register_status_as_sortable_column'); 

		// Load  class and functions associated with Figure custom content type
		$plugin_admin_figure = new Webcr_Figure( $this->get_plugin_name());		
		$this->loader->add_action( 'init', $plugin_admin_figure, 'custom_content_type_figure' ); 
//		$this->loader->add_action( 'exopite_options_framework_init', $plugin_admin_figure, 'create_figure_fields', 1 ); //Robbie's version of the previous line
		$this->loader->add_action( 'admin_menu', $plugin_admin_figure, 'create_figure_fields', 1 );
		$this->loader->add_action( 'manage_figure_posts_columns', $plugin_admin_figure, 'change_figure_columns' ); 
		$this->loader->add_action( 'manage_figure_posts_custom_column', $plugin_admin_figure, 'custom_figure_column', 10, 2 ); 
		$this->loader->add_action( 'restrict_manage_posts', $plugin_admin_figure, 'figure_filter_dropdowns' ); 
		$this->loader->add_action( 'pre_get_posts', $plugin_admin_figure, 'figure_location_filter_results' ); 
		$this->loader->add_action( 'current_screen', $plugin_admin_figure, 'cleanup_expired_figure_filters' ); 
		$this->loader->add_action( 'admin_notices', $plugin_admin_figure, 'figure_admin_notice' ); 
		$this->loader->add_filter( 'bulk_actions-edit-figure', $plugin_admin_instance, 'remove_bulk_actions' ); 
		$this->loader->add_action( 'rest_api_init', $plugin_admin_figure, 'register_figure_rest_fields' ); 
		$this->loader->add_filter( 'rest_figure_query', $plugin_admin_figure, 'filter_figure_by_figure_modal', 10, 2); 
		$this->loader->add_filter( 'manage_edit-figure_sortable_columns', $plugin_admin_scene, 'register_status_as_sortable_column'); 
		$this->loader->add_action( 'rest_api_init', $plugin_admin_figure, 'register_get_alt_text_by_url_route');
		$this->loader->add_action( 'wp_ajax_custom_file_upload', $plugin_admin_figure, 'custom_file_upload_handler');
		$this->loader->add_action( 'wp_ajax_custom_file_delete', $plugin_admin_figure, 'custom_file_delete_handler');
		$this->loader->add_action( 'admin_enqueue_scripts', $plugin_admin_figure, 'enqueue_admin_interactive_graph_script');

		// Load class and functions connected to login screen customization
		$plugin_admin_logo = new Webcr_Login( $this->get_plugin_name(), $this->get_version() );
		$this->loader->add_action( 'login_enqueue_scripts', $plugin_admin_logo, 'webcr_login_logo' ); 

		// Load class and functions connected with Export Figures Tool
		$plugin_admin_export_figures = new Webcr_Export_Figures( $this->get_plugin_name(), $this->get_version() );
		$this->loader->add_action( 'admin_menu', $plugin_admin_export_figures, 'add_export_figures_menu' ); 	

		// Load class and functions connected with Support page
		$plugin_admin_support = new Graphic_Data_Support( );
		$this->loader->add_action( 'admin_menu', $plugin_admin_support, 'add_admin_menu' ); 

    }

	/**
	 * Register all of the hooks related to the public-facing functionality
	 * of the plugin.
	 *
	 * @since    1.0.0
	 * @access   private
	 */
	private function define_public_hooks() {

		$plugin_public = new Webcr_Public( $this->get_plugin_name(), $this->get_version() );

		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_styles' );
		$this->loader->add_action( 'wp_enqueue_scripts', $plugin_public, 'enqueue_scripts' );

	}

	/**
	 * Run the loader to execute all of the hooks with WordPress.
	 *
	 * @since    1.0.0
	 */
	public function run() {
		$this->loader->run();
	}

	/**
	 * The name of the plugin used to uniquely identify it within the context of
	 * WordPress and to define internationalization functionality.
	 *
	 * @since     1.0.0
	 * @return    string    The name of the plugin.
	 */
	public function get_plugin_name() {
		return $this->plugin_name;
	}

	/**
	 * The reference to the class that orchestrates the hooks with the plugin.
	 *
	 * @since     1.0.0
	 * @return    Webcr_Loader    Orchestrates the hooks of the plugin.
	 */
	public function get_loader() {
		return $this->loader;
	}

	/**
	 * Retrieve the version number of the plugin.
	 *
	 * @since     1.0.0
	 * @return    string    The version number of the plugin.
	 */
	public function get_version() {
		return $this->version;
	}

}
