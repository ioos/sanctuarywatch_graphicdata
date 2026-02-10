<?php
/**
 * WordPress Function Stubs for Static Analysis
 * 
 * These stubs are used to resolve "Call to unknown function" errors in PHPStan/Intelephense
 * when WordPress core is not loaded.
 */

if (!function_exists('__')) {
	/**
	 * Retrieve the translation of $text.
	 *
	 * @param string $text   Text to translate.
	 * @param string $domain Optional. Text domain. Unique identifier for retrieving translated strings.
	 *                       Default 'default'.
	 * @return string Translated text.
	 */
	function __($text, $domain = 'default')
	{
		return $text;
	}
}

if (!function_exists('_x')) {
	/**
	 * Retrieve translated string with gettext context.
	 *
	 * @param string $text    Text to translate.
	 * @param string $context Context information for the translators.
	 * @param string $domain  Optional. Text domain. Unique identifier for retrieving translated strings.
	 *                        Default 'default'.
	 * @return string Translated context string if successful, original text otherwise.
	 */
	function _x($text, $context, $domain = 'default')
	{
		return $text;
	}
}

if (!function_exists('_e')) {
	/**
	 * Display translated text.
	 *
	 * @param string $text   Text to translate.
	 * @param string $domain Optional. Text domain. Unique identifier for retrieving translated strings.
	 *                       Default 'default'.
	 */
	function _e($text, $domain = 'default')
	{
	}
}

if (!function_exists('esc_html__')) {
	/**
	 * Retrieve the translation of $text and escapes it for safe use in HTML output.
	 *
	 * @param string $text   Text to translate.
	 * @param string $domain Optional. Text domain. Unique identifier for retrieving translated strings.
	 *                       Default 'default'.
	 * @return string Translated text.
	 */
	function esc_html__($text, $domain = 'default')
	{
		return $text;
	}
}

if (!function_exists('esc_html_e')) {
	/**
	 * Display translated text that has been escaped for safe use in HTML output.
	 *
	 * @param string $text   Text to translate.
	 * @param string $domain Optional. Text domain. Unique identifier for retrieving translated strings.
	 *                       Default 'default'.
	 */
	function esc_html_e($text, $domain = 'default')
	{
	}
}

if (!function_exists('esc_attr__')) {
	/**
	 * Retrieve the translation of $text and escapes it for safe use in an attribute.
	 *
	 * @param string $text   Text to translate.
	 * @param string $domain Optional. Text domain. Unique identifier for retrieving translated strings.
	 *                       Default 'default'.
	 * @return string Translated text.
	 */
	function esc_attr__($text, $domain = 'default')
	{
		return $text;
	}
}

if (!function_exists('_n')) {
	/**
	 * Translate and retrieve the singular or plural form based on the supplied number.
	 *
	 * @param string $single The text to be used if the number is singular.
	 * @param string $plural The text to be used if the number is plural.
	 * @param int    $number The number to compare against to use either the singular or plural form.
	 * @param string $domain Optional. Text domain. Unique identifier for retrieving translated strings.
	 *                       Default 'default'.
	 * @return string The translated singular or plural form.
	 */
	function _n($single, $plural, $number, $domain = 'default')
	{
		return $number === 1 ? $single : $plural;
	}
}

// Common WordPress Functions often missing in incomplete stubs

if (!function_exists('add_action')) {
	function add_action($hook_name, $callback, $priority = 10, $accepted_args = 1)
	{
	}
}

if (!function_exists('add_filter')) {
	function add_filter($hook_name, $callback, $priority = 10, $accepted_args = 1)
	{
	}
}

if (!function_exists('wp_enqueue_script')) {
	function wp_enqueue_script($handle, $src = '', $deps = array(), $ver = false, $in_footer = false)
	{
	}
}

if (!function_exists('wp_enqueue_style')) {
	function wp_enqueue_style($handle, $src = '', $deps = array(), $ver = false, $media = 'all')
	{
	}
}

if (!function_exists('register_post_type')) {
	function register_post_type($post_type, $args = array())
	{
	}
}

if (!function_exists('plugin_dir_path')) {
	function plugin_dir_path($file)
	{
		return '';
	}
}

if (!function_exists('plugin_dir_url')) {
	function plugin_dir_url($file)
	{
		return '';
	}
}

if (!function_exists('get_stylesheet_directory_uri')) {
	function get_stylesheet_directory_uri()
	{
		return '';
	}
}

if (!function_exists('get_template_directory_uri')) {
	function get_template_directory_uri()
	{
		return '';
	}
}

if (!function_exists('get_template_directory')) {
	function get_template_directory()
	{
		return '';
	}
}

if (!function_exists('get_stylesheet_directory')) {
	function get_stylesheet_directory()
	{
		return '';
	}
}

if (!function_exists('is_admin')) {
	function is_admin()
	{
		return false;
	}
}

if (!function_exists('is_front_page')) {
	function is_front_page()
	{
		return false;
	}
}

if (!function_exists('wp_redirect')) {
	function wp_redirect($location, $status = 302)
	{
	}
}

if (!function_exists('get_permalink')) {
	function get_permalink($post = 0, $leavename = false)
	{
		return '';
	}
}

if (!function_exists('get_header')) {
	function get_header($name = null, $args = array())
	{
	}
}

if (!function_exists('get_footer')) {
	function get_footer($name = null, $args = array())
	{
	}
}

if (!function_exists('get_post_meta')) {
	/**
	 * @param int|object $post_id
	 * @param string $key
	 * @param bool $single
	 * @return mixed|array|string
	 */
	function get_post_meta($post_id, $key = '', $single = false)
	{
		return $single ? '' : array();
	}
}

if (!function_exists('update_post_meta')) {
	function update_post_meta($post_id, $meta_key, $meta_value, $prev_value = '')
	{
	}
}

if (!function_exists('get_option')) {
	function get_option($option, $default = false)
	{
		return $default;
	}
}

if (!function_exists('update_option')) {
	function update_option($option, $value, $autoload = null)
	{
	}
}

if (!function_exists('wp_get_theme')) {
	function wp_get_theme($stylesheet = null, $theme_root = null)
	{
		return new WP_Theme();
	}
}

if (!class_exists('WP_Theme')) {
	class WP_Theme
	{
		public function get($header)
		{
			return '';
		}
	}
}

if (!class_exists('wpdb')) {
	class wpdb
	{
		public $prefix = 'wp_';
		public function get_var($query = null, $x = 0, $y = 0)
		{
			return '';
		}
		public function prepare($query, ...$args)
		{
			return $query;
		}
		public function get_results($query = null, $output = 'OBJECT')
		{
			return array();
		}
	}
}

if (!function_exists('get_theme_mod')) {
	function get_theme_mod($name, $default = false)
	{
		return $default;
	}
}

if (!function_exists('get_stylesheet_uri')) {
	function get_stylesheet_uri()
	{
		return '';
	}
}

if (!function_exists('has_site_icon')) {
	function has_site_icon()
	{
		return false;
	}
}

if (!function_exists('attachment_url_to_postid')) {
	function attachment_url_to_postid($url)
	{
		return 0;
	}
}

if (!function_exists('media_sideload_image')) {
	function media_sideload_image($file, $post_id, $desc = null, $return = 'html')
	{
		return '';
	}
}

if (!function_exists('is_plugin_active')) {
	function is_plugin_active($plugin)
	{
		return false;
	}
}

if (!function_exists('admin_url')) {
	function admin_url($path = '', $scheme = 'admin')
	{
		return '';
	}
}

if (!function_exists('content_url')) {
	function content_url($path = '')
	{
		return '';
	}
}

if (!function_exists('is_home')) {
	function is_home()
	{
		return false;
	}
}

if (!function_exists('get_post')) {
	function get_post($post = null, $output = 'OBJECT', $filter = 'raw')
	{
		return new stdClass();
	}
}

if (!function_exists('get_site_icon_url')) {
	function get_site_icon_url($size = 512, $url = '', $blog_id = 0)
	{
		return '';
	}
}

if (!function_exists('get_bloginfo')) {
	function get_bloginfo($show = '', $filter = 'raw')
	{
		return '';
	}
}

if (!function_exists('get_terms')) {
	function get_terms($args = array(), $deprecated = array())
	{
		return array();
	}
}

if (!function_exists('is_wp_error')) {
	function is_wp_error($thing)
	{
		return false;
	}
}

if (!function_exists('get_term_meta')) {
	function get_term_meta($term_id, $key = '', $single = false)
	{
		return '';
	}
}

if (!function_exists('wp_reset_postdata')) {
	function wp_reset_postdata()
	{
	}
}

if (!function_exists('esc_js')) {
	function esc_js($text)
	{
		return $text;
	}
}

if (!function_exists('get_the_ID')) {
	function get_the_ID()
	{
		return 0;
	}
}

if (!function_exists('get_the_title')) {
	function get_the_title($post = 0)
	{
		return '';
	}
}

if (!function_exists('wp_create_nonce')) {
	function wp_create_nonce($action = -1)
	{
		return '';
	}
}

if (!function_exists('esc_url_raw')) {
	function esc_url_raw($url, $protocols = null)
	{
		return $url;
	}
}

if (!function_exists('rest_url')) {
	function rest_url($path = '', $scheme = 'rest')
	{
		return '';
	}
}

if (!function_exists('wp_localize_script')) {
	function wp_localize_script($handle, $object_name, $l10n)
	{
		return true;
	}
}

if (!class_exists('WP_Query')) {
	class WP_Query
	{
		public $posts = array();
		public function __construct($query = '')
		{
		}
		public function have_posts()
		{
			return false;
		}
		public function the_post()
		{
		}
	}
}

// Missing Constants
if (!defined('ABSPATH')) {
	define('ABSPATH', '/tmp/wordpress');
}

if (!defined('WPINC')) {
	define('WPINC', 'wp-includes');
}

// Missing Classes
if (!class_exists('WP_Error')) {
	class WP_Error
	{
		public function __construct($code = '', $message = '', $data = '')
		{
		}
		public function get_error_message($code = '')
		{
			return '';
		}
		public function get_error_codes()
		{
			return array();
		}
		public function get_error_code()
		{
			return '';
		}
		public function remove($code)
		{
		}
		public function add($code, $message, $data = '')
		{
		}
		public function add_data($data, $code = '')
		{
		}
	}
}

if (!class_exists('WP_Post')) {
	class WP_Post
	{
		public $ID;
		public $post_author = 0;
		public $post_date = '0000-00-00 00:00:00';
		public $post_date_gmt = '0000-00-00 00:00:00';
		public $post_content = '';
		public $post_title = '';
		public $post_excerpt = '';
		public $post_status = 'publish';
		public $comment_status = 'open';
		public $ping_status = 'open';
		public $post_password = '';
		public $post_name = '';
		public $to_ping = '';
		public $pinged = '';
		public $post_modified = '0000-00-00 00:00:00';
		public $post_modified_gmt = '0000-00-00 00:00:00';
		public $post_content_filtered = '';
		public $post_parent = 0;
		public $guid = '';
		public $menu_order = 0;
		public $post_type = 'post';
		public $post_mime_type = '';
		public $comment_count = 0;
		public $filter;

		public function __construct($post = null)
		{
		}

		/**
		 * @param string $key
		 * @return mixed
		 */
		public function __get($key)
		{
			return null;
		}
	}
}

// Additional Functions
if (!function_exists('get_post_type')) {
	function get_post_type($post = null)
	{
		return 'post';
	}
}

if (!function_exists('wp_parse_args')) {
	function wp_parse_args($args, $defaults = '')
	{
		return array();
	}
}

if (!function_exists('apply_filters')) {
	function apply_filters($hook_name, $value, ...$args)
	{
		return $value;
	}
}

if (!function_exists('do_action')) {
	function do_action($hook_name, ...$arg)
	{
	}
}

if (!function_exists('shortcode_atts')) {
	function shortcode_atts($pairs, $atts, $shortcode = '')
	{
		return array();
	}
}

if (!function_exists('wp_remote_get')) {
	/** @return array|WP_Error */
	function wp_remote_get($url, $args = array())
	{
		return array();
	}
}

if (!function_exists('wp_remote_retrieve_body')) {
	function wp_remote_retrieve_body($response)
	{
		return '';
	}
}

if (!function_exists('is_plugin_active_for_network')) {
	function is_plugin_active_for_network($plugin)
	{
		return false;
	}
}
