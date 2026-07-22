<?php
/**
 * Site Checker admin page for the Graphic Data plugin.
 *
 * Adds a "Site Checker" submenu under `graphic-data-search` that provides
 * tools for auditing Graphic Data content. Currently implements a broken
 * link checker that scans postmeta across the instance, scene, modal,
 * and figure post types.
 *
 * @package Graphic_Data_Plugin
 */

// Prevent direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Register class that defines the Figure custom content type as well as associated Figure functions
 */
include_once plugin_dir_path( __DIR__ ) . 'admin/class-utility.php';

/**
 * Class Graphic_Data_Site_Checker.
 */
class Graphic_Data_Site_Checker {

	/**
	 * Number of URLs to check per AJAX batch request.
	 *
	 * Kept low so no single request runs long enough to time out. The
	 * front-end fires batches sequentially and updates progress after each.
	 */
	const BATCH_SIZE = 10;

	/**
	 * Nonce action used for all Site Checker AJAX requests.
	 */
	const NONCE_ACTION = 'graphic_data_site_checker';

	/**
	 * Capability required to access the Site Checker page and endpoints.
	 *
	 * `edit_others_posts` is held by the Editor role and above, so this gates
	 * the page at "editor or higher" without requiring full admin privileges.
	 */
	const CAPABILITY = 'edit_others_posts';

	/**
	 * Parent admin menu slug that this page hangs off of.
	 */
	const PARENT_SLUG = 'graphic-data-search';

	/**
	 * This page's admin menu slug.
	 */
	const PAGE_SLUG = 'graphic-data-site-checker';

	/**
	 * Absolute URL to the plugin root (for asset URLs).
	 *
	 * @var string
	 */
	private $plugin_url;

	/**
	 * Version string used for asset cache-busting.
	 *
	 * @var string
	 */
	private $version;

	/**
	 * Full hook suffix for this page (populated once WP registers it).
	 *
	 * @var string
	 */
	private $page_hook = '';

	/**
	 * Constructor.
	 *
	 * @param string $plugin_url Absolute URL to the plugin root, with trailing slash.
	 *                           Defaults to one directory above this file.
	 * @param string $version    Version string for asset URLs.
	 */
	public function __construct( $plugin_url = '', $version = '1.0.0' ) {
		if ( '' === $plugin_url ) {
			$plugin_url = plugin_dir_url( dirname( __FILE__ ) );
		}
		$this->plugin_url = trailingslashit( $plugin_url );
		$this->version    = $version;

		add_action( 'admin_menu', array( $this, 'register_submenu' ), 20 );
		add_action( 'admin_enqueue_scripts', array( $this, 'enqueue_assets' ) );
		add_action( 'admin_head', array( $this, 'print_inline_data' ) );
		add_action( 'wp_ajax_graphic_data_gather_urls', array( $this, 'ajax_gather_urls' ) );
		add_action( 'wp_ajax_graphic_data_check_url_batch', array( $this, 'ajax_check_url_batch' ) );
		add_action( 'wp_ajax_graphic_data_check_alt_text', array( $this, 'ajax_check_alt_text' ) );
	}

	/**
	 * Register the Site Checker submenu page.
	 */
	public function register_submenu() {
		$this->page_hook = (string) add_submenu_page(
			self::PARENT_SLUG,
			__( 'Site Checker', 'graphic-data' ),
			__( 'Site Checker', 'graphic-data' ),
			self::CAPABILITY,
			self::PAGE_SLUG,
			array( $this, 'render_page' )
		);
	}

	/**
	 * Enqueue CSS and the ES module for the Site Checker page only.
	 *
	 * @param string $hook_suffix Current admin page hook.
	 */
	public function enqueue_assets( $hook_suffix ) {
		if ( ! $this->is_site_checker_screen( $hook_suffix ) ) {
			return;
		}

		wp_enqueue_style(
			'graphic-data-site-checker',
			dirname( plugin_dir_url( __FILE__ ) ) . '/admin/css/site-checker.css',
			array(),
			GRAPHIC_DATA_PLUGIN_VERSION
		);

		wp_register_script_module(
			'@graphic-data/site-checker',
			dirname( plugin_dir_url( __FILE__ ) ) . '/admin/js/site-checker.js',
			array(),
			GRAPHIC_DATA_PLUGIN_VERSION
		);
		wp_enqueue_script_module( '@graphic-data/site-checker' );
	}

	/**
	 * Print the configuration global consumed by the ES module.
	 *
	 * Script Modules load deferred, so this inline script (printed in the
	 * head) always runs before the module and can safely set globals.
	 */
	public function print_inline_data() {
		$screen = function_exists( 'get_current_screen' ) ? get_current_screen() : null;
		if ( ! $screen || ! $this->is_site_checker_screen( $screen->id ) ) {
			return;
		}

		$data = array(
			'ajaxUrl'   => admin_url( 'admin-ajax.php' ),
			'nonce'     => wp_create_nonce( self::NONCE_ACTION ),
			'batchSize' => self::BATCH_SIZE,
		);

		printf(
			'<script id="graphic-data-site-checker-data">window.graphicDataSiteChecker = %s;</script>' . "\n",
			wp_json_encode( $data ) // phpcs:ignore WordPress.Security.EscapeOutput.OutputNotEscaped -- JSON is safe inside <script>.
		);
	}

	/**
	 * Determine whether the given admin screen is the Site Checker page.
	 *
	 * @param string $screen_id Screen ID / hook suffix.
	 * @return bool
	 */
	private function is_site_checker_screen( $screen_id ) {
		if ( '' !== $this->page_hook && $screen_id === $this->page_hook ) {
			return true;
		}
		// Fallback if we're queried before register_submenu ran.
		return self::PARENT_SLUG . '_page_' . self::PAGE_SLUG === $screen_id;
	}

	/**
	 * Render the admin page markup.
	 */
	public function render_page() {
		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_die( 'You do not have permission to access this page.' );
		}
		?>
		<div class="wrap graphic-data-site-checker">
			<h1>Graphic Data Site Checker</h1>
			<p class="description">
				Audit Graphic Data content for common issues. New checks will be added over time.
			</p>

			<div class="graphic-data-site-checker__section" id="graphic-data-broken-links-section">
				<h3>Broken Link Checker</h3>
				<p>
				<?php
				$function_utilities = new Graphic_Data_Utility();
				$function_utilities->create_instance_dropdown_filter( 'target_instance' );
				?>
				</p>
				<p>
					<button type="button" class="button button-primary" id="graphic-data-check-broken-links">
						Check for Broken Links &amp; Missing Alt Text
					</button>
				</p>

				<div class="graphic-data-site-checker__status" id="graphic-data-broken-links-status" hidden>
					<span class="spinner is-active" aria-hidden="true"></span>
					<span class="graphic-data-site-checker__status-text" role="status" aria-live="polite"></span>
				</div>

				<div class="graphic-data-site-checker__progress" id="graphic-data-broken-links-progress" hidden>
					<progress max="100" value="0"></progress>
					<span class="graphic-data-site-checker__progress-text" role="status" aria-live="polite"></span>
				</div>

				<h4>Broken Links</h4>
				<div class="graphic-data-site-checker__report" id="graphic-data-broken-links-report" hidden></div>

				<h4>Missing Alt Text</h4>
				<div class="graphic-data-site-checker__report" id="graphic-data-alt-text-report" hidden></div>
			</div>
		</div>
		<?php
	}

	/* ---------------------------------------------------------------------
	 * AJAX: gather URLs
	 * ------------------------------------------------------------------ */

	/**
	 * Return the list of every URL found in Graphic Data postmeta, along
	 * with the post it belongs to and the meta key it came from.
	 */
	public function ajax_gather_urls() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );

		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_send_json_error(
				array( 'message' => __( 'Insufficient permissions.', 'graphic-data' ) ),
				403
			);
		}

		$target_instance = isset( $_POST['target_instance'] ) ? absint( $_POST['target_instance'] ) : 0;

		$items = array();
		$items = array_merge( $items, $this->gather_from_post_type( 'instance', array( 'instance_legacy_content_url' ), $target_instance ) );
		$items = array_merge( $items, $this->gather_from_post_type( 'scene', $this->scene_meta_keys(), $target_instance ) );
		$items = array_merge( $items, $this->gather_from_post_type( 'modal', $this->modal_meta_keys(), $target_instance ) );
		$items = array_merge( $items, $this->gather_from_post_type( 'figure', $this->figure_meta_keys(), $target_instance ) );

		wp_send_json_success(
			array(
				'items' => array_values( $items ),
				'total' => count( $items ),
			)
		);
	}

	/**
	 * Meta keys to scan on scene posts.
	 *
	 * @return string[]
	 */
	private function scene_meta_keys() {
		$keys = array( 'scene_tagline' );
		for ( $i = 1; $i <= 6; $i++ ) {
			$keys[] = 'scene_info' . $i;
			$keys[] = 'scene_photo' . $i;
		}
		return $keys;
	}

	/**
	 * Meta keys to scan on modal posts.
	 *
	 * @return string[]
	 */
	private function modal_meta_keys() {
		$keys = array( 'modal_tagline' );
		for ( $i = 1; $i <= 6; $i++ ) {
			$keys[] = 'modal_info' . $i;
			$keys[] = 'modal_photo' . $i;
		}
		return $keys;
	}

	/**
	 * Meta keys to scan on figure posts.
	 *
	 * @return string[]
	 */
	private function figure_meta_keys() {
		return array(
			'figure_science_info',
			'figure_data_info',
			'figure_caption_short',
			'figure_caption_long',
		);
	}

	/**
	 * Return a human-readable label for a given meta key.
	 *
	 * Used in the broken-links report so operators see field names as they
	 * appear in the editor UI rather than raw meta keys.
	 *
	 * @param string $meta_key Meta key.
	 * @return string Human-readable label.
	 */
	private function human_label_for_meta_key( $meta_key ) {
		$labels = array(
			'instance_legacy_content_url' => 'Legacy Content Url',
			'scene_tagline'               => 'Tagline',
			'modal_tagline'               => 'Tagline',
			'figure_science_info'         => 'Science Info',
			'figure_data_info'            => 'Data Info',
			'figure_caption_short'        => 'Caption Short',
			'figure_caption_long'         => 'Caption Long',
		);

		if ( isset( $labels[ $meta_key ] ) ) {
			return $labels[ $meta_key ];
		}

		// scene_info1..6, scene_photo1..6, modal_info1..6, modal_photo1..6.
		if ( preg_match( '/^(?:scene|modal)_(info|photo)([1-6])$/', $meta_key, $matches ) ) {
			$prefixes = array(
				'info'  => 'Info Link',
				'photo' => 'Media Link',
			);
			return $prefixes[ $matches[1] ] . ' ' . $matches[2];
		}

		// Sensible fallback if a new key ever gets added without a mapping.
		return ucwords( str_replace( '_', ' ', $meta_key ) );
	}

	/**
	 * Meta key that links a given post type back to its owning instance,
	 * mirroring the "Instance" filter columns/dropdowns elsewhere in the
	 * plugin (see class-utility.php and includes/admin-{modal,figure}.php).
	 *
	 * @param string $post_type Post type slug.
	 * @return string Meta key, or empty string if the post type has no such link.
	 */
	private function instance_meta_key_for_post_type( $post_type ) {
		$keys = array(
			'scene'  => 'scene_location',
			'modal'  => 'modal_location',
			'figure' => 'location',
		);
		return isset( $keys[ $post_type ] ) ? $keys[ $post_type ] : '';
	}

	/**
	 * Build `get_posts()` args for a post type, optionally scoped to the
	 * posts belonging to a given instance. Shared by every gather routine
	 * (broken links and missing alt text) so the two checks stay scoped to
	 * the same set of posts for a given `target_instance` selection.
	 *
	 * @param string $post_type       Post type slug.
	 * @param int    $target_instance Optional instance post ID to restrict results to.
	 *                                0 means "all instances".
	 * @return array<string,mixed> `get_posts()` args.
	 */
	private function instance_scoped_query_args( $post_type, $target_instance = 0 ) {
		$query_args = array(
			'post_type'        => $post_type,
			'post_status'      => array( 'publish', 'draft', 'private', 'pending', 'future' ),
			'posts_per_page'   => -1,
			'no_found_rows'    => true,
			'fields'           => 'ids',
			'suppress_filters' => true,
			'orderby'          => 'ID',
			'order'            => 'ASC',
		);

		if ( $target_instance ) {
			if ( 'instance' === $post_type ) {
				// The instance post type has no self-referential meta key; it IS the instance.
				$query_args['post__in'] = array( $target_instance );
			} else {
				$instance_meta_key = $this->instance_meta_key_for_post_type( $post_type );
				if ( '' !== $instance_meta_key ) {
					$query_args['meta_key']   = $instance_meta_key; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_key
					$query_args['meta_value'] = $target_instance; // phpcs:ignore WordPress.DB.SlowDBQuery.slow_db_query_meta_value
				}
			}
		}

		return $query_args;
	}

	/**
	 * Iterate all posts of a given type and extract URLs from the named meta keys.
	 *
	 * @param string   $post_type       Post type slug.
	 * @param string[] $meta_keys       Meta keys to inspect.
	 * @param int      $target_instance Optional instance post ID to restrict results to.
	 *                                  0 (the default) means "all instances".
	 * @return array<int,array<string,mixed>> Flat list of {post_id, post_title, post_type, edit_link, meta_key, url}.
	 */
	private function gather_from_post_type( $post_type, $meta_keys, $target_instance = 0 ) {
		$items = array();

		if ( ! post_type_exists( $post_type ) ) {
			return $items;
		}

		$post_ids = get_posts( $this->instance_scoped_query_args( $post_type, $target_instance ) );

		foreach ( $post_ids as $post_id ) {
			$post_id    = (int) $post_id;
			$post_title = get_the_title( $post_id );
			$edit_link  = get_edit_post_link( $post_id, 'raw' );

			foreach ( $meta_keys as $meta_key ) {
				$meta_value = get_post_meta( $post_id, $meta_key, true );
				if ( empty( $meta_value ) ) {
					continue;
				}

				$urls = $this->extract_urls( $meta_value );
				foreach ( $urls as $url ) {
					$items[] = array(
						'post_id'     => $post_id,
						'post_title'  => $post_title,
						'post_type'   => $post_type,
						'edit_link'   => $edit_link ? $edit_link : '',
						'meta_key'    => $meta_key,
						'field_label' => $this->human_label_for_meta_key( $meta_key ),
						'url'         => $url,
					);
				}
			}
		}

		return $items;
	}

	/* ---------------------------------------------------------------------
	 * URL extraction
	 * ------------------------------------------------------------------ */

	/**
	 * Recursively walk a meta value (scalar, array, or Exopite fieldset payload)
	 * and pull out every URL it references.
	 *
	 * Handles href/src attributes from rich text, bare `http(s)://` URLs
	 * appearing in strings, and plain-URL scalar fields.
	 *
	 * @param mixed $value The value to scan.
	 * @return string[] Unique list of absolute URLs.
	 */
	private function extract_urls( $value ) {
		$urls = array();

		if ( is_array( $value ) ) {
			foreach ( $value as $item ) {
				$urls = array_merge( $urls, $this->extract_urls( $item ) );
			}
			return array_values( array_unique( $urls ) );
		}

		if ( ! is_string( $value ) ) {
			return $urls;
		}

		$value = trim( $value );
		if ( '' === $value ) {
			return $urls;
		}

		// href="..." attributes.
		if ( preg_match_all( '/\bhref\s*=\s*(["\'])(.*?)\1/i', $value, $matches ) ) {
			foreach ( $matches[2] as $match ) {
				$url = $this->normalize_url( $match );
				if ( '' !== $url ) {
					$urls[] = $url;
				}
			}
		}

		// src="..." attributes (images, iframes, etc.).
		if ( preg_match_all( '/\bsrc\s*=\s*(["\'])(.*?)\1/i', $value, $matches ) ) {
			foreach ( $matches[2] as $match ) {
				$url = $this->normalize_url( $match );
				if ( '' !== $url ) {
					$urls[] = $url;
				}
			}
		}

		// Bare http(s) URLs in strings (e.g. rich text that inlines URLs, or
		// fieldset values that store a URL as text).
		if ( preg_match_all( '#\bhttps?://[^\s<>"\'\\\\]+#i', $value, $matches ) ) {
			foreach ( $matches[0] as $match ) {
				// Strip common trailing punctuation.
				$match = rtrim( $match, ".,;:!?)]}" );
				$url   = $this->normalize_url( $match );
				if ( '' !== $url ) {
					$urls[] = $url;
				}
			}
		}

		// A field whose entire value is a URL (e.g. instance_legacy_content_url
		// with a relative or protocol-relative path).
		if ( empty( $urls ) ) {
			$url = $this->normalize_url( $value );
			if ( '' !== $url ) {
				$urls[] = $url;
			}
		}

		return array_values( array_unique( $urls ) );
	}

	/**
	 * Normalize a raw URL string into an absolute, checkable form.
	 *
	 * Rejects mailto:/tel:/javascript: schemes and pure anchors.
	 * Turns protocol-relative and site-root-relative URLs into absolute ones.
	 *
	 * @param string $url Raw URL.
	 * @return string Absolute URL, or empty string if not checkable.
	 */
	private function normalize_url( $url ) {
		$url = trim( html_entity_decode( (string) $url, ENT_QUOTES | ENT_HTML5, 'UTF-8' ) );
		if ( '' === $url ) {
			return '';
		}

		// Skip unsupported schemes and anchors.
		if ( preg_match( '/^(mailto:|tel:|javascript:|data:|#)/i', $url ) ) {
			return '';
		}

		// Protocol-relative -> absolute.
		if ( 0 === strpos( $url, '//' ) ) {
			$url = ( is_ssl() ? 'https:' : 'http:' ) . $url;
		}

		// Root-relative -> absolute against this site.
		if ( 0 === strpos( $url, '/' ) ) {
			$url = home_url( $url );
		}

		// Anything without a scheme by now is not checkable (e.g. plain text).
		if ( ! preg_match( '#^https?://#i', $url ) ) {
			return '';
		}

		return esc_url_raw( $url );
	}

	/* ---------------------------------------------------------------------
	 * AJAX: check a batch of URLs
	 * ------------------------------------------------------------------ */

	/**
	 * Check a batch of URLs and return their reachability status.
	 */
	public function ajax_check_url_batch() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );

		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_send_json_error(
				array( 'message' => __( 'Insufficient permissions.', 'graphic-data' ) ),
				403
			);
		}

		$raw   = isset( $_POST['urls'] ) ? wp_unslash( $_POST['urls'] ) : '';
		$batch = is_string( $raw ) ? json_decode( $raw, true ) : null;

		if ( ! is_array( $batch ) ) {
			wp_send_json_error(
				array( 'message' => __( 'Invalid batch payload.', 'graphic-data' ) ),
				400
			);
		}

		$results = array();
		foreach ( $batch as $url ) {
			$url = esc_url_raw( (string) $url );
			if ( '' === $url ) {
				continue;
			}
			$results[ $url ] = $this->check_url( $url );
		}

		wp_send_json_success( array( 'results' => $results ) );
	}

	/**
	 * Probe a single URL and return {ok, status, error}.
	 *
	 * Tries HEAD first (cheap), falls back to GET when the server returns
	 * a client/server error or a WP_Error, since many hosts block HEAD.
	 *
	 * @param string $url Absolute URL.
	 * @return array<string,mixed>
	 */
	private function check_url( $url ) {
		$args = array(
			'timeout'     => 10,
			'redirection' => 5,
			'sslverify'   => true,
			'user-agent'  => 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
			'headers'     => array(
				'Accept'          => '*/*',
				'Accept-Language' => 'en-US,en;q=0.9',
			),
		);

		$head_response = wp_remote_head( $url, $args );
		$status        = 0;
		$final         = $head_response;

		if ( ! is_wp_error( $head_response ) ) {
			$status = (int) wp_remote_retrieve_response_code( $head_response );
		}

		$should_fallback = is_wp_error( $head_response ) || 0 === $status || $status >= 400;
		if ( true === $should_fallback ) {
			$get_args            = $args;
			$get_args['timeout'] = 15;
			$get_response        = wp_remote_get( $url, $get_args );

			if ( ! is_wp_error( $get_response ) ) {
				$status = (int) wp_remote_retrieve_response_code( $get_response );
				$final  = $get_response;
			} elseif ( is_wp_error( $head_response ) ) {
				$final = $get_response;
			}
		}

		if ( is_wp_error( $final ) ) {
			return array(
				'ok'     => false,
				'status' => 0,
				'error'  => $final->get_error_message(),
			);
		}

		return array(
			'ok'     => ( $status >= 200 && $status < 400 ),
			'status' => $status,
			'error'  => '',
		);
	}

	/* ---------------------------------------------------------------------
	 * AJAX: check for missing image alt text
	 * ------------------------------------------------------------------ */

	/**
	 * Scan the instance/scene/modal/figure image fields, resolve each one
	 * that points at a Media Library attachment, and report the ones whose
	 * attachment has no alt text set.
	 *
	 * Unlike the broken-link check this needs no external HTTP requests —
	 * it's local postmeta lookups only — so it runs as a single request
	 * rather than a batched scan.
	 */
	public function ajax_check_alt_text() {
		check_ajax_referer( self::NONCE_ACTION, 'nonce' );

		if ( ! current_user_can( self::CAPABILITY ) ) {
			wp_send_json_error(
				array( 'message' => __( 'Insufficient permissions.', 'graphic-data' ) ),
				403
			);
		}

		$target_instance = isset( $_POST['target_instance'] ) ? absint( $_POST['target_instance'] ) : 0;

		$items = array();
		foreach ( array( 'instance', 'scene', 'modal', 'figure' ) as $post_type ) {
			$items = array_merge( $items, $this->gather_image_urls_from_post_type( $post_type, $target_instance ) );
		}

		$missing = array();
		foreach ( $items as $item ) {
			$attachment_id = $this->resolve_attachment_id( $item['url'] );

			// Not a Media Library attachment (e.g. an externally-hosted image)
			// -- nothing here we can add alt text to, so skip it.
			if ( ! $attachment_id ) {
				continue;
			}

			$alt_text = get_post_meta( $attachment_id, '_wp_attachment_image_alt', true );
			if ( '' !== trim( (string) $alt_text ) ) {
				continue;
			}

			$missing[] = array(
				'post_id'         => $item['post_id'],
				'post_title'      => $item['post_title'],
				'post_type'       => $item['post_type'],
				'edit_link'       => $item['edit_link'],
				'field_label'     => $item['field_label'],
				'url'             => $item['url'],
				'attachment_id'   => $attachment_id,
				// Deep-links into the Media Library grid with this attachment's
				// details panel open (Alt Text is directly editable there),
				// rather than the classic single-post "Edit Media" screen.
				'media_edit_link' => admin_url( 'upload.php?item=' . $attachment_id ),
			);
		}

		wp_send_json_success(
			array(
				'items' => array_values( $missing ),
				'total' => count( $items ),
			)
		);
	}

	/**
	 * Image field specs per post type: which meta key holds the image, and
	 * (for the Exopite fieldset fields) which sub-key inside that meta
	 * value holds the Media Library URL.
	 *
	 * @param string $post_type Post type slug.
	 * @return array<int,array<string,string>> List of {meta_key, sub_key, label}.
	 *                                          `sub_key` is '' for flat (non-fieldset) fields.
	 */
	private function image_field_specs( $post_type ) {
		switch ( $post_type ) {
			case 'instance':
				return array(
					array(
						'meta_key' => 'instance_tile',
						'sub_key'  => '',
						'label'    => 'Tile Image',
					),
				);

			case 'scene':
			case 'modal':
				$specs = array();
				for ( $i = 1; $i <= 6; $i++ ) {
					$specs[] = array(
						'meta_key' => $post_type . '_photo' . $i,
						'sub_key'  => $post_type . '_photo_internal' . $i,
						'label'    => 'Media Link ' . $i,
					);
				}
				return $specs;

			case 'figure':
				return array(
					array(
						'meta_key' => 'figure_image',
						'sub_key'  => '',
						'label'    => 'Figure Image',
					),
				);

			default:
				return array();
		}
	}

	/**
	 * Iterate all posts of a given type and pull the Media Library image
	 * URL out of each configured image field.
	 *
	 * @param string $post_type       Post type slug.
	 * @param int    $target_instance Optional instance post ID to restrict results to.
	 *                                0 means "all instances".
	 * @return array<int,array<string,mixed>> Flat list of {post_id, post_title, post_type, edit_link, field_label, url}.
	 */
	private function gather_image_urls_from_post_type( $post_type, $target_instance = 0 ) {
		$items = array();
		$specs = $this->image_field_specs( $post_type );

		if ( ! post_type_exists( $post_type ) || empty( $specs ) ) {
			return $items;
		}

		$post_ids = get_posts( $this->instance_scoped_query_args( $post_type, $target_instance ) );

		foreach ( $post_ids as $post_id ) {
			$post_id    = (int) $post_id;
			$post_title = get_the_title( $post_id );
			$edit_link  = get_edit_post_link( $post_id, 'raw' );

			foreach ( $specs as $spec ) {
				$meta_value = get_post_meta( $post_id, $spec['meta_key'], true );

				if ( '' !== $spec['sub_key'] ) {
					$url = ( is_array( $meta_value ) && isset( $meta_value[ $spec['sub_key'] ] ) )
						? $meta_value[ $spec['sub_key'] ]
						: '';
				} else {
					$url = is_string( $meta_value ) ? $meta_value : '';
				}

				$url = trim( (string) $url );
				if ( '' === $url ) {
					continue;
				}

				$items[] = array(
					'post_id'     => $post_id,
					'post_title'  => $post_title,
					'post_type'   => $post_type,
					'edit_link'   => $edit_link ? $edit_link : '',
					'field_label' => $spec['label'],
					'url'         => $url,
				);
			}
		}

		return $items;
	}

	/**
	 * Resolve an image URL to its Media Library attachment ID, if any.
	 *
	 * Falls back to stripping a `-WIDTHxHEIGHT` resize suffix (e.g.
	 * `image-300x200.jpg` -> `image.jpg`) before retrying, since stored
	 * field values sometimes point at a generated intermediate size rather
	 * than the original upload that `attachment_url_to_postid()` indexes.
	 * Mirrors the same fallback in class-validation.php's media linking.
	 *
	 * @param string $url Image URL.
	 * @return int Attachment post ID, or 0 if it doesn't resolve to one.
	 */
	private function resolve_attachment_id( $url ) {
		$url = esc_url_raw( (string) $url );
		if ( '' === $url ) {
			return 0;
		}

		$attachment_id = attachment_url_to_postid( $url );

		if ( ! $attachment_id ) {
			$stripped = preg_replace( '/-\d+x\d+(\.[a-z0-9]+)$/i', '$1', $url );
			if ( $stripped !== $url ) {
				$attachment_id = attachment_url_to_postid( $stripped );
			}
		}

		return (int) $attachment_id;
	}
}
