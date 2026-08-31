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
}
