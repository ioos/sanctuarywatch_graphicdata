<?php
/**
 * The admin-specific functionality of the plugin.
 *
 * @link       https://github.com/ioos/sanctuarywatch_graphicdata
 * @package    Graphic_Data_Plugin
 */

/**
 * The admin-specific functionality of the plugin.
 *
 * Defines the plugin name, version, and two examples hooks for how to
 * enqueue the admin-specific stylesheet and JavaScript.
 */
class Graphic_Data_Admin {

	/**
	 * Register the stylesheets for the admin area.
	 */
	public function enqueue_styles() {

		// Only enqueue on admin screens where the plugin needs its styles.
		if ( function_exists( 'get_current_screen' ) ) {
			$screen = get_current_screen();
			if ( ! $screen ) {
				return;
			}

			// Skip Site Health / tools pages to avoid interfering with health checks.
			if ( in_array( $screen->id, array( 'tools_page_site-health', 'site-health' ), true ) ) {
				return;
			}
		}

		wp_enqueue_style( 'graphic_data_plugin', plugin_dir_url( __FILE__ ) . 'css/admin.css', array(), GRAPHIC_DATA_PLUGIN_VERSION, 'all' );

		wp_enqueue_style(
			'font-awesome-admin',
			'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.6.0/css/all.min.css',
			array(),
			'6.6.0'
		);
	}

	/**
	 * Register the JavaScript for the admin area.
	 *
	 * Enqueues utility scripts globally and conditionally loads post-type-specific
	 * scripts based on the current screen context. Scripts are loaded for:
	 * - About, Instance, Scene, Modal, and Figure post types (edit/create screens)
	 * - Modal and Figure admin column screens
	 * - Figure Export Tool page
	 *
	 * @since 1.0.0
	 *
	 * @param string $hook_suffix The current admin page hook suffix (e.g., 'post.php', 'edit.php').
	 */
	public function enqueue_scripts( $hook_suffix ) {

		// Enqueue utlity javascript functions used across javascript files on the admin side.
		wp_register_script_module(
			'@graphic-data/admin-utility',
			plugin_dir_url( __FILE__ ) . 'js/utility.js',
			array(),
			GRAPHIC_DATA_PLUGIN_VERSION
		);
		// Prevent WordPress from emitting utility.js as a classic <script> tag.
		// wp_register_script_module registers a same-named classic fallback internally;
		// deregistering it here ensures only the type="module" version is output.
		wp_deregister_script( '@graphic-data/admin-utility' );

		$current_post_type = get_post_type();

		if ( 'post.php' === $hook_suffix || 'post-new.php' === $hook_suffix ) {
			$interactive_base = dirname( plugin_dir_url( __FILE__ ) ) . '/includes/figures/js/interactive/';

			wp_register_script_module(
				'@graphic-data/scene-shared',
				dirname( plugin_dir_url( __FILE__ ) ) . '/includes/scenes/js/scene-shared.js',
				array(),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/scene-shared' );

			// Enqueue scene-render.js.
			wp_register_script_module(
				'@graphic-data/scene-render',
				dirname( plugin_dir_url( __FILE__ ) ) . '/includes/scenes/js/scene-render.js',
				array( '@graphic-data/scene-shared', '@graphic-data/modal-render' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/scene-render' );

			wp_register_script_module(
				'@graphic-data/plotly-utility',
				$interactive_base . 'plotly-utility.js',
				array(),
				GRAPHIC_DATA_PLUGIN_VERSION
			);

			wp_register_script_module(
				'@graphic-data/plotly-timeseries-line',
				$interactive_base . 'plotly-timeseries-line.js',
				array( '@graphic-data/plotly-utility' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);

			wp_register_script_module(
				'@graphic-data/plotly-bar',                     // FIXED id (was plotly-timeseries-bar).
				$interactive_base . 'plotly-bar.js',                                   // FIXED filename.
				array( '@graphic-data/plotly-utility' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);

			wp_register_script_module(
				'@graphic-data/plotly-map',
				$interactive_base . 'plotly-map.js',
				array( '@graphic-data/plotly-utility' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);

			wp_register_script_module(
				'@graphic-data/figure-render',
				dirname( plugin_dir_url( __FILE__ ) ) . '/includes/figures/js/figure-render.js',
				array( '@graphic-data/plotly-timeseries-line', '@graphic-data/plotly-bar', '@graphic-data/plotly-map' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);

			wp_register_script_module(
				'@graphic-data/modal-render',
				dirname( plugin_dir_url( __FILE__ ) ) . '/includes/modals/js/modal-render.js',
				array( '@graphic-data/figure-render' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);

			wp_register_script_module(
				'@graphic-data/admin-preview-buttons',
				plugin_dir_url( __FILE__ ) . 'js/admin-preview-buttons.js',
				array(
					'@graphic-data/admin-utility',
					'@graphic-data/modal-render',
					'@graphic-data/figure-render',
					'@graphic-data/scene-render',
				),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
		}

		// Load About-specific Javascript only when editing/creating an About post.
		if ( 'about' == $current_post_type && ( 'post.php' == $hook_suffix || 'post-new.php' == $hook_suffix ) ) {
			wp_register_script_module(
				'@graphic-data/admin-about',
				plugin_dir_url( __FILE__ ) . 'js/admin-about.js',
				array( '@graphic-data/admin-utility' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/admin-about' );
		}

		// Load Instance-specific Javascript only when editing/creating a Instance post.
		if ( 'instance' == $current_post_type && ( 'post.php' == $hook_suffix || 'post-new.php' == $hook_suffix ) ) {
			wp_register_script_module(
				'@graphic-data/admin-instance',
				plugin_dir_url( __FILE__ ) . 'js/admin-instance.js',
				array( '@graphic-data/admin-utility' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/admin-instance' );
		}

		// Load Scene-specific Javascript only when editing/creating a Scene post.
		if ( 'scene' == $current_post_type && ( 'post.php' == $hook_suffix || 'post-new.php' == $hook_suffix ) ) {

			// Pass Graphic Data Is Active Theme variable on to Javascript.
			add_filter(
				'script_module_data_@graphic-data/admin-scene',
				function ( array $data ): array {
					$data['isActiveTheme'] = GRAPHIC_DATA_IS_ACTIVE_THEME;
					return $data;
				}
			);

			// Enqueue admin-scene.js.
			wp_register_script_module(
				'@graphic-data/admin-scene',
				plugin_dir_url( __FILE__ ) . 'js/admin-scene.js',
				array( '@graphic-data/admin-utility' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/admin-scene' );

			// Enqueue admin-preview-buttons.js.
			wp_enqueue_script_module( '@graphic-data/admin-preview-buttons' );
		}

		// Load Modal-specific Javascript only when editing/creating a Modal post.
		if ( 'modal' == $current_post_type && ( 'post.php' == $hook_suffix || 'post-new.php' == $hook_suffix ) ) {

			wp_register_script_module(
				'@graphic-data/admin-modal',
				plugin_dir_url( __FILE__ ) . 'js/admin-modal.js',
				array( '@graphic-data/admin-utility' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/admin-modal' );

			// Enqueue admin-preview-buttons.js.
			wp_enqueue_script_module( '@graphic-data/admin-preview-buttons' );

			// Enqueue the modal render module.
			wp_enqueue_script_module( '@graphic-data/modal-render' );
		}

		// Load Figure-specific Javascript only when editing/creating a Figure post.
		if ( 'figure' == $current_post_type && ( 'post.php' == $hook_suffix || 'post-new.php' == $hook_suffix ) ) {

			// Enqueue figure-render.js.
			wp_enqueue_script_module( '@graphic-data/figure-render' );

			// Enqueue file-upload.js.
			wp_register_script_module(
				'@graphic-data/file-upload',
				dirname( plugin_dir_url( __FILE__ ) ) . '/includes/figures/js/interactive/file-upload.js',
				array(
					'@graphic-data/plotly-bar',
					'@graphic-data/plotly-timeseries-line',
					'@graphic-data/plotly-map',
				),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/file-upload' );

			// Enqueue admin-figure.js.
			wp_register_script_module(
				'@graphic-data/admin-figure',
				plugin_dir_url( __FILE__ ) . 'js/admin-figure.js',
				array( '@graphic-data/admin-utility', '@graphic-data/file-upload' ),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/admin-figure' );

			// Enqueue the modal render module.
			wp_enqueue_script_module( '@graphic-data/modal-render' );

			// Enqueue admin-preview-buttons.js.
			wp_enqueue_script_module( '@graphic-data/admin-preview-buttons' );

			// Pass the REST nonce via script_module_data (replaces wp_localize_script).
			add_filter(
				'script_module_data_@graphic-data/file-upload',
				function ( array $data ): array {
					$data['nonce'] = wp_create_nonce( 'wp_rest' );
					return $data;
				}
			);
		}

		// Load Modal-specific Javascript only for admin columns screen.
		if ( 'modal' == $current_post_type && 'edit.php' == $hook_suffix ) {
			wp_register_script_module(
				'@graphic-data/admin-modal_columns',
				plugin_dir_url( __FILE__ ) . 'js/admin-modal-columns.js',
				array(),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/admin-modal_columns' );
		}

		// Load Figure-specific Javascript only for admin columns screen.
		if ( 'figure' == $current_post_type && 'edit.php' == $hook_suffix ) {
			wp_register_script_module(
				'@graphic-data/admin-figure_columns',
				plugin_dir_url( __FILE__ ) . 'js/admin-figure-columns.js',
				array(),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/admin-figure_columns' );
		}

		// Load Figure Export Javascript, but only when on Figure Export Tool page.
		$current_screen = get_current_screen();
		if ( 'tools_page_export-figures' == $current_screen->base ) {

			wp_register_script_module(
				'@graphic-data/admin-export-figures',
				plugin_dir_url( __FILE__ ) . 'js/admin-export-figures.js',
				array(),
				GRAPHIC_DATA_PLUGIN_VERSION
			);
			wp_enqueue_script_module( '@graphic-data/admin-export-figures' );

			// Enqueue Bootstrap JavaScript.
			wp_enqueue_script( 'PptxGenJS', 'https://cdn.jsdelivr.net/npm/pptxgenjs@3.12.0/dist/pptxgen.bundle.js', array(), '3.12.0', true );

		}
	}

	/**
	 * Adjusts the admin bar "New" menu based on the active theme.
	 *
	 * When the Graphic Data theme is active, removes the Comments, New Page,
	 * New Post, and New User items — standard WordPress content types that are
	 * not used in this setup. When a different theme is active, removes the
	 * plugin-specific New About and New Instance items instead, since those
	 * post types are only meaningful under the Graphic Data theme.
	 *
	 * @since  1.0.0
	 * @return void
	 */
	public function change_admin_bar_options() {
		global $wp_admin_bar;
		if ( GRAPHIC_DATA_IS_ACTIVE_THEME ) {
			$wp_admin_bar->remove_menu( 'comments' );
			$wp_admin_bar->remove_menu( 'new-page' );
			$wp_admin_bar->remove_menu( 'new-post' );
			$wp_admin_bar->remove_menu( 'new-user' );
		} else {
			$wp_admin_bar->remove_menu( 'new-about' );
			$wp_admin_bar->remove_menu( 'new-instance' );
		}
	}

	/**
	 * Enqueue Bootstrap (version 5.3.0) CSS and Javascript.
	 *
	 * @since    1.0.0
	 */
	public function enqueue_bootstrap_admin() {
		// Enqueue Bootstrap CSS.
		wp_enqueue_style( 'bootstrap-css', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/css/bootstrap.min.css', array(), '5.3.0' );

		// Enqueue Bootstrap JavaScript.
		wp_enqueue_script( 'bootstrap-js', 'https://cdn.jsdelivr.net/npm/bootstrap@5.3.3/dist/js/bootstrap.bundle.min.js', array(), '5.3.0', true );
	}

	/**
	 * Adjusts the admin sidebar menu based on the active theme.
	 *
	 * When the Graphic Data theme is active, removes the Comments, Posts, and
	 * Pages menu items — standard WordPress content types not used in this
	 * setup. When a different theme is active, removes the plugin-specific
	 * Instance, About, and Instance Types menu items instead, since those are
	 * only relevant under the Graphic Data theme.
	 *
	 * @since  1.0.0
	 * @return void
	 */
	public function change_elements_in_menu() {

		if ( GRAPHIC_DATA_IS_ACTIVE_THEME ) {
			// Remove comments from the admin menu.
			remove_menu_page( 'edit-comments.php' );
			// Remove posts from the admin menu.
			remove_menu_page( 'edit.php' );
			// Remove pages from the admin menu.
			remove_menu_page( 'edit.php?post_type=page' );
		} else {
			remove_menu_page( 'edit.php?post_type=instance' );
			remove_menu_page( 'edit.php?post_type=about' );
			remove_menu_page( 'manage-instance-types' );
		}
	}

	/**
	 * Remove remove unwanted widgets from the WordPress dashboard.
	 *
	 * @since    1.0.0
	 */
	public function remove_dashboard_widgets() {
		remove_meta_box( 'dashboard_quick_press', 'dashboard', 'side' );
		remove_meta_box( 'dashboard_primary', 'dashboard', 'side' );
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
	public function wppversionremove() {
		remove_filter( 'update_footer', 'core_update_footer' );
	}

	/**
	 * Remove permalink from edit post admin screens.
	 *
	 * @since    1.0.0
	 */
	public function hide_permalink() {
		return '';
	}

	/**
	 * Remove screen options metabox from edit post screens.
	 *
	 * @since    1.0.0
	 */
	public function remove_screen_options() {
		return '__return_false';
	}

	/**
	 * Remove  "Thank you for creating with wordpress" from the lower left of the footer of admin screens.
	 *
	 * @since    1.0.0
	 */
	public function remove_thank_you() {
		return;
	}

	/**
	 * Remove  "Thank you for creating with wordpress" from the lower left of the footer of admin screens.
	 *
	 * @since    1.0.0
	 */
	public function remove_gutenberg() {
		return false;
	}

	/**
	 * Remove "All dates" filter from admin screens.
	 *
	 * @since    1.0.0
	 */
	public function remove_all_dates() {
		return array();
	}

	/**
	 * Change default favicon associated with site to Sanctuary Watch logo, if there is no site icon set in the theme.
	 *
	 * @since    1.0.0
	 */
	public function add_favicon() {
		if ( ! has_site_icon() ) {
			$favicon_url = plugin_dir_url( __FILE__ ) . 'images/graphic_data_logo_80.png';
			echo '<link rel="shortcut icon" href="' . esc_url( $favicon_url ) . '" />';
		}
	}

	/**
	 * Enqueues the TinyMCE new-tab default script and passes configuration data to it.
	 *
	 * When the plugin setting `links_new_tab_by_default` is enabled, loads
	 * `admin-tinymce-new-tab.js` on post-edit screens for any of the custom post
	 * types that contain targeted TinyMCE fields (scene, modal, figure, about).
	 * Configuration is passed to the script via `wp_localize_script` so that the
	 * JavaScript knows which editor fields should default new links to opening in
	 * a new tab.
	 *
	 * To add a new field to the targeted list, append its TinyMCE editor ID to
	 * the `$target_fields` array inside this method.
	 *
	 * @since  1.0.0
	 * @param  string $hook_suffix The current admin page hook suffix (e.g. 'post.php').
	 * @return void
	 */
	public function enqueue_tinymce_new_tab_script( $hook_suffix ) {

		// Only relevant on post create/edit screens.
		if ( 'post.php' !== $hook_suffix && 'post-new.php' !== $hook_suffix ) {
			return;
		}

		// Only relevant for the custom post types that contain targeted fields.
		$current_post_type    = get_post_type();
		$relevant_post_types  = array( 'instance', 'scene', 'modal', 'figure', 'about' );

		if ( ! in_array( $current_post_type, $relevant_post_types, true ) ) {
			return;
		}

		// Read the plugin-wide setting.
		$options             = get_option( 'graphic_data_settings' );
		$new_tab_by_default  = ! empty( $options['links_new_tab_by_default'] );

		wp_register_script_module(
			'@graphic-data/admin-tinymce-new-tab',
			plugin_dir_url( __FILE__ ) . 'js/admin-tinymce-new-tab.js',
			array(),
			GRAPHIC_DATA_PLUGIN_VERSION
		);
		wp_enqueue_script_module( '@graphic-data/admin-tinymce-new-tab' );

		/**
		 * List of TinyMCE editor IDs that should default new links to opening
		 * in a new tab when `links_new_tab_by_default` is enabled.
		 *
		 * Each entry must match the `id` attribute that WordPress / the
		 * Exopite framework assigns to the underlying <textarea> element for
		 * that custom field (typically the same as the field's `id` key in the
		 * field definition array).
		 *
		 * @var string[]
		 */
		$target_fields = array(
			'instance_footer_column_content1',
			'instance_footer_column_content2',
			'instance_footer_column_content3',
			'scene_tagline',
			'modal_tagline',
			'figure_caption_short',
			'figure_caption_long',
			'aboutMain',
			'aboutDetail',
		);

		for ( $i = 1; $i < 11;  $i++ ) {
			array_push( $target_fields, 'aboutBoxMain' . $i, 'aboutBoxDetail' . $i );
		}
		add_filter(
			'script_module_data_@graphic-data/admin-tinymce-new-tab',
			function ( array $data ) use ( $new_tab_by_default, $target_fields ): array {
				$data['enabled']      = $new_tab_by_default;
				$data['targetFields'] = $target_fields;
				return $data;
			}
		);
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
	public function modify_publish_button_text( $translated_text, $text, $domain ) {
		if ( is_admin() ) {
			if ( 'Publish' === $text || 'Update' === $text ) {
				return 'Save';
			}
		}
		return $translated_text;
	}

	/**
	 * Add SVG support to allowed upload MIME types.
	 *
	 * @param array $mimes Allowed MIME types.
	 * @return array Modified MIME types with SVG support.
	 */
	public function allow_svg_uploads( $mimes ) {
		$mimes['svg'] = 'image/svg+xml';
		return $mimes;
	}

	/**
	 * Remove "view" link from admin screen for instance, modal, and figure posts.
	 *
	 * @param array   $actions An array of row action links.
	 * @param WP_Post $post    The post object.
	 * @since    1.0.0
	 */
	public function remove_view_link_from_post_type( $actions, $post ) {
		if ( ( 'instance' === $post->post_type || 'modal' === $post->post_type || 'figure' === $post->post_type ) && isset( $actions['view'] ) ) {
			unset( $actions['view'] ); // Remove the "View" link.
		}
		return $actions;
	}

	/**
	 * Adjust admin post time display to show local timezone and author information.
	 *
	 * Replaces the default WordPress timestamp display in the publish metabox with a custom
	 * format that shows the publication date/time in local timezone (converted from GMT),
	 * the author who published the post, and optionally the last modification details if
	 * the post has been updated.
	 *
	 * Only applies to specific custom post types: instance, scene, modal, figure, and about.
	 * Uses jQuery to dynamically replace the #timestamp element content after DOM ready.
	 *
	 * The function displays:
	 * - Publication date/time in "F j, Y @ g:i A" format (e.g., "January 15, 2025 @ 3:45 PM")
	 * - Author name (first + last name, or display name as fallback)
	 * - Last modified date/time and modifier (if post has been updated and metadata exists)
	 *
	 * @global WP_Post $post The current post object.
	 *
	 * @return void Returns early if not on a post edit screen or if post type is not in the custom list.
	 */
	public function adjust_admin_post_time_display() {
		global $post;

		// Only run on edit screens for custom post types.
		$screen = get_current_screen();
		if ( ! $screen || 'post' !== $screen->base ) {
			return;
		}

		$custom_post_types = array( 'instance', 'scene', 'modal', 'figure', 'about' );
		if ( ! in_array( $screen->post_type, $custom_post_types ) ) {
			return;
		}

		// Get the post and convert time to local timezone.
		if ( $post && $post->post_date ) {
			// Convert to 12-hour format with AM/PM.
			$local_time = get_post_time( 'F j, Y @ g:i A', false, $post );

			// Get the user who published the post.
			$author = get_userdata( $post->post_author );

			if ( $author ) {
				$first_name = $author->first_name;
				$last_name = $author->last_name;

				// Use first name + last name if both are available.
				if ( ! empty( $first_name ) && ! empty( $last_name ) ) {
					$author_name = $first_name . ' ' . $last_name;
				} elseif ( ! empty( $first_name ) ) {
					// Use just first name if only first name is available.
					$author_name = $first_name;
				} elseif ( ! empty( $last_name ) ) {
					// Use just last name if only last name is available.
					$author_name = $last_name;
				} else {
					// Fall back to display name if no first/last name.
					$author_name = $author->display_name;
				}
			} else {
				$author_name = 'Unknown';
			}

			// Get the last modification details.
			$last_modified_time = '';
			$last_modified_by = '';

			$is_post_updated = get_post_modified_time( 'U', false, $post->ID ) > get_post_time( 'U', false, $post->ID );

			$last_modified_user_id = get_post_meta( $post->ID, '_edit_last', true );
			if ( '' == $last_modified_user_id || false == $last_modified_user_id ) {
				$is_post_updated = false;
			}

			if ( true == $is_post_updated ) {
				// Get the most recent revision.

				$last_modified_time = get_post_modified_time( 'F j, Y @ g:i A', false, $post->ID );
				$last_modified_user = get_userdata( $last_modified_user_id );
				$last_modified_first_name = $last_modified_user->first_name;
				$last_modified_last_name = $last_modified_user->last_name;

				// Use first name + last name if both are available.
				if ( ! empty( $last_modified_first_name ) && ! empty( $last_modified_last_name ) ) {
					$last_modified_by = $last_modified_first_name . ' ' . $last_modified_last_name;
				} elseif ( ! empty( $last_modified_first_name ) ) {
					// Use just first name if only first name is available.
					$last_modified_by = $last_modified_first_name;
				} elseif ( ! empty( $last_modified_last_name ) ) {
					// Use just last name if only last name is available.
					$last_modified_by = $last_modified_last_name;
				} else {
					// Fall back to display name if no first/last name.
					$last_modified_by = $last_modified_user->display_name;
				}
			}

			?>
			<script type="text/javascript">
			jQuery(document).ready(function($) {
				// Find and replace the timestamp in the publish metabox.
				<?php if ( true == $is_post_updated ) : ?>
				replacementText = "Published on: <b><?php echo esc_js( $local_time ); ?></b> by <b><?php echo esc_js( $author_name ); ?></b><br><span class='dashicons dashicons-calendar-alt' style='margin-right: 5px;'></span>Last modified on: <b><?php echo esc_js( $last_modified_time ); ?></b> by <b><?php echo esc_js( $last_modified_by ); ?></b>";
				<?php else : ?>
				replacementText = "Published on: <b><?php echo esc_js( $local_time ); ?></b> by <b><?php echo esc_js( $author_name ); ?></b>";
				<?php endif; ?>
				$('#timestamp').html(replacementText);
			});
			</script>
			<?php
		}
	}
}
