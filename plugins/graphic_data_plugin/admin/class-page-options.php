<?php

/**
 * Adds a required "Instance" section to the Page options of the Gutenberg page editor.
 *
 * Registers a meta box on the `page` post type that exposes three controls:
 * an Instance select (None, Global, or any Instance returned by
 * Graphic_Data_Utility::return_all_instances()), an "Include in navigation
 * bar?" checkbox, and a navigation-bar order select (1 through 10). The
 * selected values are persisted as the `scene_location`,
 * `graphic_data_page_instance_in_navbar`, and `scene_order` post meta and
 * registered with the REST API so the block editor can read them.
 */
class Graphic_Data_Page_Options {

	/**
	 * The meta key that stores the selected Instance for a page.
	 *
	 * @var string
	 */
	const INSTANCE_META_KEY = 'scene_location';

	/**
	 * The meta key that stores whether the page is included in the navigation bar.
	 *
	 * @var string
	 */
	const NAVBAR_META_KEY = 'graphic_data_page_instance_in_navbar';

	/**
	 * The meta key that stores the page's order within the navigation bar.
	 *
	 * @var string
	 */
	const ORDER_META_KEY = 'scene_order';

	/**
	 * The lowest value offered by the navigation-bar order select.
	 *
	 * @var int
	 */
	const ORDER_MIN = 1;

	/**
	 * The highest value offered by the navigation-bar order select.
	 *
	 * @var int
	 */
	const ORDER_MAX = 10;

	/**
	 * The nonce action used when saving the Instance section.
	 *
	 * @var string
	 */
	const NONCE_ACTION = 'graphic_data_save_page_instance';

	/**
	 * The nonce field name used when saving the Instance section.
	 *
	 * @var string
	 */
	const NONCE_NAME = 'graphic_data_page_instance_nonce';

	/**
	 * Register the page meta so the block editor and REST API are aware of it.
	 *
	 * Hooked to `init`.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function register_page_instance_meta() {
		register_post_meta(
			'page',
			self::INSTANCE_META_KEY,
			array(
				'show_in_rest'      => true,
				'single'            => true,
				'type'              => 'string',
				'default'           => 'none',
				'sanitize_callback' => 'sanitize_text_field',
				'auth_callback'     => function () {
					return current_user_can( 'edit_pages' );
				},
			)
		);

		register_post_meta(
			'page',
			self::NAVBAR_META_KEY,
			array(
				'show_in_rest'      => true,
				'single'            => true,
				'type'              => 'boolean',
				'default'           => false,
				'sanitize_callback' => 'rest_sanitize_boolean',
				'auth_callback'     => function () {
					return current_user_can( 'edit_pages' );
				},
			)
		);

		register_post_meta(
			'page',
			self::ORDER_META_KEY,
			array(
				'show_in_rest'      => true,
				'single'            => true,
				'type'              => 'integer',
				'default'           => self::ORDER_MIN,
				'sanitize_callback' => 'absint',
				'auth_callback'     => function () {
					return current_user_can( 'edit_pages' );
				},
			)
		);
	}

	/**
	 * Replace the columns shown on the Pages admin list table.
	 *
	 * Filter callback for `manage_page_posts_columns`. Rebuilds the column set so
	 * the Pages list surfaces the Instance a page is attached to and whether the
	 * page acts as that Instance's overview scene, while keeping the checkbox,
	 * author, comments and date columns provided by WordPress core.
	 *
	 * The `scene_location` and `scene_overview` cells are populated by
	 * change_page_columns()'s companion method custom_page_column().
	 *
	 * @since 1.0.0
	 * @link https://www.smashingmagazine.com/2017/12/customizing-admin-columns-wordpress/
	 *
	 * @param array $columns Column ID => label map supplied by WordPress for the
	 *                       `page` list table.
	 * @return array The reordered column map:
	 *               - 'cb': Row selection checkbox, carried over from core.
	 *               - 'title': Page title.
	 *               - 'scene_location': Labelled "Instance"; the Instance the page belongs to.
	 *               - 'scene_overview': Labelled "Overview"; marks the page as its Instance's overview scene.
	 *               - 'author': Page author, carried over from core.
	 *               - 'comments': Comment count, shown as the core comments-bubble icon.
	 *               - 'date': Published/modified date, carried over from core.
	 */
	public function change_page_columns( $columns ) {
		$columns = array(
			'cb' => $columns['cb'],
			'title' => 'Title',
			'scene_location' => 'Instance',
			'scene_overview' => 'Overview',
			'author' => 'Author',
			// Render the default WordPress comments-bubble icon instead of the word "Comments".
			'comments' => '<span class="vers comment-grey-bubble" title="Comments" aria-hidden="true"></span><span class="screen-reader-text">Comments</span>',
			'date' => 'Date',
		);
		return $columns;
	}

	/**
	 * Populate custom fields for page content type in the admin screen.
	 *
	 * @param string $column The name of the column.
	 * @param int    $post_id The database id of the post.
	 * @since    1.0.0
	 */
	public function custom_page_column( $column, $post_id ) {

		// Populate columns based on the determined field_length.
		if ( 'scene_location' === $column ) {
			$instance_id = get_post_meta( $post_id, 'scene_location', true );
			echo esc_html( get_the_title( $instance_id ) );
		}

		if ( 'scene_overview' === $column && $this->is_instance_overview_scene( $post_id ) ) {
			echo '<span class="dashicons dashicons-yes"></span>';
		}
	}

	/**
	 * Determine whether a page is the overview scene of the Instance it belongs to.
	 *
	 * A page points at an Instance through its `scene_location` meta, and that
	 * Instance names a single overview scene through its `instance_overview_scene`
	 * meta. When the two match, the page doubles as the Instance's landing page.
	 *
	 * @since 1.0.0
	 *
	 * @param int $post_id The page ID to test.
	 * @return bool True when the page is its Instance's overview scene, false otherwise.
	 */
	private function is_instance_overview_scene( $post_id ) {
		$post_id = (int) $post_id;

		if ( ! $post_id ) {
			return false;
		}

		$instance_id = get_post_meta( $post_id, self::INSTANCE_META_KEY, true );

		if ( empty( $instance_id ) ) {
			return false;
		}

		$instance_overview_scene = get_post_meta( $instance_id, 'instance_overview_scene', true );

		return (int) $instance_overview_scene === $post_id;
	}

	/**
	 * Build the notice text shown when a page is its Instance's overview scene.
	 *
	 * @since 1.0.0
	 *
	 * @param int $post_id The page the notice is about.
	 * @return string Translated, human-readable message naming the Instance where possible.
	 */
	private function overview_scene_notice_message( $post_id ) {
		$instance_title = get_the_title( get_post_meta( (int) $post_id, self::INSTANCE_META_KEY, true ) );

		if ( '' !== $instance_title ) {
			return sprintf(
				/* translators: %s: Instance title. */
				__( 'This page is the overview scene for the "%s" Instance and serves as its landing page.', 'graphic-data' ),
				$instance_title
			);
		}

		return __( 'This page is the overview scene for its Instance and serves as its landing page.', 'graphic-data' );
	}

	/**
	 * Print a dismissible notice on the classic page editor when the page is its Instance's overview scene.
	 *
	 * Hooked to `admin_notices`. The block editor relocates raw `admin_notices`
	 * markup into a hidden container, so this path is limited to the classic
	 * editor; enqueue_overview_scene_notice() covers the block editor.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function overview_scene_editor_notice() {
		$screen = get_current_screen();

		if ( ! $screen || 'post' !== $screen->base || 'page' !== $screen->post_type || $screen->is_block_editor() ) {
			return;
		}

		$post_id = (int) get_the_ID();

		if ( ! $this->is_instance_overview_scene( $post_id ) ) {
			return;
		}

		printf(
			'<div class="notice notice-info is-dismissible"><p>%s</p></div>',
			esc_html( $this->overview_scene_notice_message( $post_id ) )
		);
	}

	/**
	 * Push a dismissible block-editor notice when the page is its Instance's overview scene.
	 *
	 * Hooked to `enqueue_block_editor_assets`. Adds an inline script that inserts
	 * an informational notice into the editor's `core/notices` store, since raw
	 * `admin_notices` output is not reliably shown on the block editor screen.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function enqueue_overview_scene_notice() {
		$screen = get_current_screen();

		if ( ! $screen || 'page' !== $screen->post_type || ! $screen->is_block_editor() ) {
			return;
		}

		$post_id = (int) get_the_ID();

		if ( ! $this->is_instance_overview_scene( $post_id ) ) {
			return;
		}

		$message = wp_json_encode( $this->overview_scene_notice_message( $post_id ) );

		if ( false === $message ) {
			return;
		}

		$handle = 'graphic-data-overview-scene-notice';
		wp_register_script( $handle, false, array( 'wp-data', 'wp-notices', 'wp-dom-ready' ), GRAPHIC_DATA_PLUGIN_VERSION, true );
		wp_enqueue_script( $handle );
		wp_add_inline_script(
			$handle,
			'wp.domReady( function () {'
				. ' wp.data.dispatch( "core/notices" ).createNotice( "info", ' . $message . ','
				. ' { id: "graphic-data-overview-scene", isDismissible: true } );'
				. ' } );'
		);
	}

	/**
	 * Register the Instance meta box on the page editor.
	 *
	 * Hooked to `add_meta_boxes`. The box is placed in the `side` context with a
	 * `high` priority so it appears alongside the other Page options panels in
	 * the block editor.
	 *
	 * @since 1.0.0
	 * @return void
	 */
	public function add_instance_meta_box() {
		add_meta_box(
			'graphic_data_page_instance',
			__( 'Instance', 'graphic-data' ),
			array( $this, 'render_instance_meta_box' ),
			'page',
			'side',
			'high',
			array( '__block_editor_compatible_meta_box' => true )
		);
	}

	/**
	 * Render the Instance section controls.
	 *
	 * Outputs the required Instance select, the "Include in navigation bar?"
	 * checkbox, and the navigation-bar order select, pre-filled with any
	 * previously saved values. The order select is only shown while the
	 * checkbox is checked (handled with a CSS `:has()` rule so it toggles
	 * live without JavaScript).
	 *
	 * @since 1.0.0
	 * @param WP_Post $post The page being edited.
	 * @return void
	 */
	public function render_instance_meta_box( $post ) {
		wp_nonce_field( self::NONCE_ACTION, self::NONCE_NAME );

		$stored_instance   = get_post_meta( $post->ID, self::INSTANCE_META_KEY, true );
		$selected_instance = ( is_string( $stored_instance ) && '' !== $stored_instance ) ? $stored_instance : 'none';

		$in_navbar = ! empty( get_post_meta( $post->ID, self::NAVBAR_META_KEY, true ) );

		$stored_order   = get_post_meta( $post->ID, self::ORDER_META_KEY, true );
		$selected_order = is_numeric( $stored_order ) ? (int) $stored_order : self::ORDER_MIN;
		if ( $selected_order < self::ORDER_MIN || $selected_order > self::ORDER_MAX ) {
			$selected_order = self::ORDER_MIN;
		}

		$options = $this->get_instance_options();
		?>
		<style>
			#graphic-data-page-instance-fields .graphic-data-order-row {
				display: none;
			}
			#graphic-data-page-instance-fields:has( #graphic_data_page_instance_in_navbar:checked ) .graphic-data-order-row {
				display: block;
			}
		</style>
		<div id="graphic-data-page-instance-fields">
			<p>
				<label for="graphic_data_page_instance" style="display:inline-flex;align-items:center;gap:4px;">
					<span class="dashicons dashicons-admin-site-alt3" aria-hidden="true"></span>
					<strong><?php esc_html_e( 'Instance', 'graphic-data' ); ?></strong>
					<span class="description">(<?php esc_html_e( 'required', 'graphic-data' ); ?>)</span>
				</label>
			</p>
			<p>
				<select name="graphic_data_page_instance" id="graphic_data_page_instance" class="widefat" style="width:100%;max-width:100%;box-sizing:border-box;" required>
					<?php foreach ( $options as $value => $label ) : ?>
						<option value="<?php echo esc_attr( $value ); ?>" <?php selected( $selected_instance, (string) $value ); ?>>
							<?php echo esc_html( $label ); ?>
						</option>
					<?php endforeach; ?>
				</select>
			</p>
			<p>
				<input type="checkbox" name="graphic_data_page_instance_in_navbar" id="graphic_data_page_instance_in_navbar" value="1" <?php checked( $in_navbar ); ?> />
				<label for="graphic_data_page_instance_in_navbar"><?php esc_html_e( 'Include in navigation bar?', 'graphic-data' ); ?></label>
			</p>
			<div class="graphic-data-order-row">
				<p>
					<label for="scene_order"><?php esc_html_e( 'What is the order of the page in the navigation bar?', 'graphic-data' ); ?></label>
				</p>
				<p>
					<select name="scene_order" id="scene_order" class="widefat" style="width:100%;max-width:100%;box-sizing:border-box;">
						<?php for ( $order_option = self::ORDER_MIN; $order_option <= self::ORDER_MAX; $order_option++ ) : ?>
							<option value="<?php echo esc_attr( (string) $order_option ); ?>" <?php selected( $selected_order, $order_option ); ?>>
								<?php echo esc_html( (string) $order_option ); ?>
							</option>
						<?php endfor; ?>
					</select>
				</p>
			</div>
		</div>
		<?php
	}

	/**
	 * Persist the Instance section values when a page is saved.
	 *
	 * Hooked to `save_post_page`. Validates the nonce, capability, and request
	 * context before writing the `scene_location`,
	 * `graphic_data_page_instance_in_navbar`, and `scene_order` post meta.
	 * Unrecognised Instance values fall back to `none`, and an out-of-range
	 * order falls back to the lowest allowed value.
	 *
	 * @since 1.0.0
	 * @param int $post_id The ID of the page being saved.
	 * @return void
	 */
	public function save_instance_meta_box( $post_id ) {
		if ( defined( 'DOING_AUTOSAVE' ) && DOING_AUTOSAVE ) {
			return;
		}

		if ( wp_is_post_revision( $post_id ) ) {
			return;
		}

		if ( ! isset( $_POST[ self::NONCE_NAME ] ) ) {
			return;
		}

		$nonce = sanitize_text_field( wp_unslash( $_POST[ self::NONCE_NAME ] ) );
		if ( ! wp_verify_nonce( $nonce, self::NONCE_ACTION ) ) {
			return;
		}

		if ( ! current_user_can( 'edit_page', $post_id ) ) {
			return;
		}

		$selected_instance = isset( $_POST['graphic_data_page_instance'] )
			? sanitize_text_field( wp_unslash( $_POST['graphic_data_page_instance'] ) )
			: 'none';

		// array_keys() returns numeric Instance IDs as integers, so cast every
		// allowed value to a string before the strict comparison below;
		// otherwise a selected Instance ID ("8") never matches (8) and the
		// value silently falls back to "none".
		$valid_values = array_map( 'strval', array_keys( $this->get_instance_options() ) );
		if ( ! in_array( $selected_instance, $valid_values, true ) ) {
			$selected_instance = 'none';
		}
		update_post_meta( $post_id, self::INSTANCE_META_KEY, $selected_instance );

		if ( isset( $_POST['graphic_data_page_instance_in_navbar'] ) ) {
			update_post_meta( $post_id, self::NAVBAR_META_KEY, '1' );
		} else {
			delete_post_meta( $post_id, self::NAVBAR_META_KEY );
		}

		$submitted_order = isset( $_POST['scene_order'] ) ? absint( wp_unslash( $_POST['scene_order'] ) ) : self::ORDER_MIN;
		if ( $submitted_order < self::ORDER_MIN || $submitted_order > self::ORDER_MAX ) {
			$submitted_order = self::ORDER_MIN;
		}
		update_post_meta( $post_id, self::ORDER_META_KEY, $submitted_order );
	}

	/**
	 * Build the list of options for the Instance select.
	 *
	 * The list always starts with `None` (the default) and `Global`, followed by
	 * every Instance returned by Graphic_Data_Utility::return_all_instances(),
	 * keyed by Instance ID. The blank placeholder entry that
	 * return_all_instances() seeds its result with is skipped.
	 *
	 * @since 1.0.0
	 * @return array<string, string> Associative array of option value => option label.
	 */
	private function get_instance_options() {
		$options = array(
			'none'   => __( 'None', 'graphic-data' ),
			'global' => __( 'Global', 'graphic-data' ),
		);

		$utility   = new Graphic_Data_Utility();
		$instances = $utility->return_all_instances();

		if ( is_array( $instances ) ) {
			foreach ( $instances as $instance_id => $instance_title ) {
				$value = (string) $instance_id;
				$label = is_scalar( $instance_title ) ? (string) $instance_title : '';

				if ( '' === trim( $value ) || '' === $label ) {
					continue;
				}

				$options[ $value ] = $label;
			}
		}

		return $options;
	}

	/**
	 * Resolve the public URL slug of the Instance assigned to a page.
	 *
	 * Reads the page's `scene_location` meta and, when it holds a real Instance
	 * ID (not `none` or `global`), returns that Instance's `instance_slug` meta
	 * with any surrounding slashes trimmed. Returns an empty string when no
	 * Instance is assigned, the referenced post is not an Instance, or the
	 * Instance has no slug.
	 *
	 * @since 1.0.0
	 * @param int $post_id The page ID.
	 * @return string The Instance URL slug, or '' when the page has no Instance.
	 */
	private function get_page_instance_web_slug( $post_id ) {
		$stored_instance = get_post_meta( $post_id, self::INSTANCE_META_KEY, true );

		if ( ! is_numeric( $stored_instance ) ) {
			return '';
		}

		$instance = get_post( (int) $stored_instance );
		if ( ! $instance || 'instance' !== $instance->post_type ) {
			return '';
		}

		$web_slug = get_post_meta( (int) $stored_instance, 'instance_slug', true );

		return is_string( $web_slug ) ? trim( $web_slug, '/' ) : '';
	}

	/**
	 * Rewrite a page permalink to include its assigned Instance slug.
	 *
	 * Filter callback for `page_link`. When a published page has a real
	 * Instance selected in its `scene_location` meta, its permalink becomes
	 * `{home_url}/{instance_slug}/{page_slug}/`. Pages with no Instance (or a
	 * `none`/`global` selection), unpublished pages, and pages whose Instance
	 * has no slug keep the default permalink.
	 *
	 * @since 1.0.0
	 * @param string $link    The page's default permalink.
	 * @param int    $post_id The page ID.
	 * @param bool   $sample  Whether this is a sample (draft) permalink. Unused.
	 * @return string The Instance-scoped permalink, or the original link.
	 */
	public function filter_instance_page_link( $link, $post_id, $sample = false ) {
		$post = get_post( $post_id );

		if ( ! $post || 'page' !== $post->post_type || 'publish' !== $post->post_status ) {
			return $link;
		}

		if ( '' === $post->post_name ) {
			return $link;
		}

		$web_slug = $this->get_page_instance_web_slug( $post_id );
		if ( '' === $web_slug ) {
			return $link;
		}

		return home_url( '/' . $web_slug . '/' . $post->post_name . '/' );
	}

	/**
	 * Route an `{instance_slug}/{page_slug}` request to the matching page.
	 *
	 * Filter callback for `request`. The Scene custom post type registers a
	 * catch-all rewrite rule that maps every two-segment URL to
	 * `post_type=scene&name={segment2}&instance_slug={segment1}`. This callback
	 * inspects that resolved query: if no published Scene in the named Instance
	 * owns the slug, but a published page does carry that slug and is assigned
	 * to the Instance whose `instance_slug` matches the first segment, the
	 * query is redirected to that page. All other requests pass through
	 * untouched so Scene routing is unaffected.
	 *
	 * @since 1.0.0
	 * @param array $query_vars The query vars produced by rewrite matching.
	 * @return array The original query vars, or `array( 'page_id' => ... )`.
	 */
	public function resolve_instance_page_request( $query_vars ) {
		if ( ! is_array( $query_vars ) ) {
			return $query_vars;
		}

		if ( empty( $query_vars['instance_slug'] ) || empty( $query_vars['name'] ) ) {
			return $query_vars;
		}

		if ( ! isset( $query_vars['post_type'] ) || 'scene' !== $query_vars['post_type'] ) {
			return $query_vars;
		}

		$instance_slug = sanitize_title( $query_vars['instance_slug'] );
		$page_slug     = sanitize_title( $query_vars['name'] );

		// A Scene that genuinely belongs to this Instance keeps priority; leave
		// the query alone so the existing Scene routing resolves it.
		if ( $this->scene_belongs_to_instance( $page_slug, $instance_slug ) ) {
			return $query_vars;
		}

		$page = get_page_by_path( $page_slug, OBJECT, 'page' );
		if ( ! $page || 'publish' !== $page->post_status ) {
			return $query_vars;
		}

		if ( $this->get_page_instance_web_slug( $page->ID ) !== $instance_slug ) {
			return $query_vars;
		}

		return array( 'page_id' => $page->ID );
	}

	/**
	 * Determine whether a published Scene with the given slug belongs to an Instance.
	 *
	 * Used to decide whether an `{instance_slug}/{slug}` request should stay on
	 * the Scene routing path or fall through to page routing.
	 *
	 * @since 1.0.0
	 * @param string $scene_slug    The Scene post slug (second URL segment).
	 * @param string $instance_slug The Instance URL slug (first URL segment).
	 * @return bool True when a published Scene with that slug is assigned to the
	 *              Instance whose `instance_slug` matches $instance_slug.
	 */
	private function scene_belongs_to_instance( $scene_slug, $instance_slug ) {
		$scene_ids = get_posts(
			array(
				'post_type'        => 'scene',
				'name'             => $scene_slug,
				'post_status'      => 'publish',
				'posts_per_page'   => -1,
				'fields'           => 'ids',
				'no_found_rows'    => true,
				'suppress_filters' => true,
			)
		);

		if ( empty( $scene_ids ) ) {
			return false;
		}

		foreach ( $scene_ids as $scene_id ) {
			$scene_instance_id = get_post_meta( $scene_id, 'scene_location', true );
			if ( ! is_numeric( $scene_instance_id ) ) {
				continue;
			}

			$web_slug = get_post_meta( (int) $scene_instance_id, 'instance_slug', true );
			if ( is_string( $web_slug ) && trim( $web_slug, '/' ) === $instance_slug ) {
				return true;
			}
		}

		return false;
	}
}
