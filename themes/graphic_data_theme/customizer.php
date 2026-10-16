<?php
/**
 * Register class that defines the Customizer settings for the theme
 */
class Graphic_Data_Customizer_Settings {
	/**
	 * Adds theme customizer options for the site.
	 *
	 * @param WP_Customize_Manager $wp_customize Theme Customizer object.
	 */
	public function sanctuary_watch_customize_register( $wp_customize ) {

		// Add Header Row Section.
		$wp_customize->add_section(
			'header_row_section',
			array(
				'title'       => 'Header Row',
				'priority'    => 30,
			)
		);

		// Add setting for header row enable/disable.
		$wp_customize->add_setting(
			'header_row_enable',
			array(
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
				'transport'         => 'refresh',
			)
		);

		// Add control for header row enable/disable.
		$wp_customize->add_control(
			'header_row_enable',
			array(
				'label'       => 'Enable Header Row',
				'description' => 'Check to display a header row above the main header.',
				'section'     => 'header_row_section',
				'type'        => 'checkbox',
				'priority'    => 10,
			)
		);

		// Add setting for header row background color.
		$wp_customize->add_setting(
			'header_row_bg_color',
			array(
				'default'           => '#ffffff',
				'sanitize_callback' => 'sanitize_hex_color',
				'transport'         => 'refresh',
			)
		);

		// Add control for header row background color.
		$wp_customize->add_control(
			new WP_Customize_Color_Control(
				$wp_customize,
				'header_row_bg_color',
				array(
					'label'           => 'Header Row Background Color',
					'description'     => 'Choose the background color for the header row.',
					'section'         => 'header_row_section',
					'priority'        => 20,
					'active_callback' => [ $this, 'is_header_row_enabled' ],
				)
			)
		);

		// Modified setting for header image with enhanced validation.
		$wp_customize->add_setting(
			'header_row_image',
			array(
				'default'           => $this->get_header_row_default_image_id(),
				'sanitize_callback' => [ $this, 'header_row_sanitize_image' ],
				'validate_callback' => [ $this, 'header_row_validate_image' ], // Add validation.
				'transport'         => 'refresh',
			)
		);

		// Modified control for header image with better description.
		$wp_customize->add_control(
			new WP_Customize_Media_Control(
				$wp_customize,
				'header_row_image',
				array(
					'label'           => 'Header Image',
					'description'     => 'Upload an image that is exactly 433 pixels wide and 50 pixels tall. This field is required when the header row is enabled.',
					'section'         => 'header_row_section',
					'mime_type'       => 'image',
					'priority'        => 30,
					'active_callback' => [ $this, 'is_header_row_enabled' ],
				)
			)
		);

		 // Add JavaScript for client-side validation (optional but recommended for better UX).
		add_action( 'customize_controls_print_footer_scripts', [ $this, 'header_row_validation_script' ] );

		// Add setting for header image alt text.
		$wp_customize->add_setting(
			'header_row_image_alt',
			array(
				'default'           => 'IOOS',
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => [ $this, 'validate_required_when_header_enabled' ], // Add validation.
				'transport'         => 'refresh',
			)
		);

		// Add control for header image alt text.
		$wp_customize->add_control(
			'header_row_image_alt',
			array(
				'label'           => 'Header Image Alt Text',
				'description'     => 'Alternative text for the header image. This field is required when the header row is enabled.',
				'section'         => 'header_row_section',
				'type'            => 'text',
				'priority'        => 40,
				'active_callback' => [ $this, 'is_header_row_enabled' ],
			)
		);

		// Add setting for header image link.
		$wp_customize->add_setting(
			'header_row_image_link',
			array(
				'default'           => 'https://ioos.us/',
				'sanitize_callback' => 'esc_url_raw',
				'validate_callback' => [ $this, 'validate_required_when_header_enabled' ],
				'transport'         => 'refresh',
			)
		);

		// Add control for header image link.
		$wp_customize->add_control(
			'header_row_image_link',
			array(
				'label'           => 'Header Image Link',
				'description'     => 'URL that the header image should link to. This field is required when the header row is enabled.',
				'section'         => 'header_row_section',
				'type'            => 'url',
				'priority'        => 50,
				'active_callback' => [ $this, 'is_header_row_enabled' ],
			)
		);

		// Add setting for header name within breadcrumb row.
		$wp_customize->add_setting(
			'header_row_breadcrumb_name',
			array(
				'default'           => 'IOOS',
				'sanitize_callback' => 'sanitize_text_field',
				'validate_callback' => [ $this, 'validate_required_when_header_enabled' ],
				'transport'         => 'refresh',
			)
		);

		// Add control for header name within breadcrumb row.
		$wp_customize->add_control(
			'header_row_breadcrumb_name',
			array(
				'label'           => 'Header Name Within Breadcrumb Row',
				'description'     => 'Text to display in the breadcrumb navigation for this header. This field is required when the header row is enabled.',
				'section'         => 'header_row_section',
				'type'            => 'text',
				'priority'        => 60,
				'active_callback' => [ $this, 'is_header_row_enabled' ],
			)
		);

		// Add a new section for Other settings.
		$wp_customize->add_section(
			'other_settings',
			array(
				'title'    => 'Other Settings',
				'priority' => 50,
			)
		);

		// Add setting for breadcrumb row enable/disable.
		$wp_customize->add_setting(
			'breadcrumb_row_enable',
			array(
				'default'           => '',
				'sanitize_callback' => 'sanitize_text_field',
				'transport'         => 'refresh',
			)
		);

		// Add control for breadcrumb row enable/disable.
		$wp_customize->add_control(
			'breadcrumb_row_enable',
			array(
				'label'       => 'Enable Site Logo & Site Name Row',
				'description' => 'Check to display a row with the logo and site name (both linked) above the navigation bar.',
				'section'     => 'other_settings',
				'type'        => 'checkbox',
				'priority'    => 10,
			)
		);

		// Select the instance presented by the homepage and site navigation.
		$instance_choices = array( 0 => 'Show all instances' );
		$instances = get_posts( array(
			'post_type'      => 'instance',
			'post_status'    => 'publish',
			'posts_per_page' => -1,
			'orderby'        => 'title',
			'order'          => 'ASC',
		) );
		foreach ( $instances as $instance ) {
			if ( graphic_data_get_instance_overview( $instance->ID ) ) {
				$instance_choices[ $instance->ID ] = $instance->post_title;
			}
		}
		$wp_customize->add_setting(
			'single_instance_id',
			array(
				'default'           => 0,
				'sanitize_callback' => 'absint',
				'validate_callback' => array( $this, 'validate_single_instance' ),
				'transport'         => 'refresh',
			)
		);
		$wp_customize->add_control(
			'single_instance_id',
			array(
				'label'       => 'Single Instance View',
				'description' => 'Choose an instance to use its overview as the homepage and its navigation and footer throughout the site. Only published instances with a published overview scene or page are listed. Choose Show all instances to restore the instance listing.',
				'section'     => 'other_settings',
				'type'        => 'select',
				'choices'     => $instance_choices,
				'priority'    => 5,
			)
		);

		add_action( 'customize_controls_enqueue_scripts', array( $this, 'enqueue_single_instance_scripts' ) );

		// Add a new section for Theme Color settings.
		$wp_customize->add_section(
			'theme_color_settings',
			array(
				'title'    => 'Theme Colors',
				'priority' => 43,
			)
		);

		// Add setting for Theme Color 1.
		$wp_customize->add_setting(
			'theme_color_1',
			array(
				'default'   => '#03386c',
				'transport' => 'refresh',
				'sanitize_callback' => 'sanitize_hex_color',
			)
		);

		// Add control for Theme Color 1.
		$wp_customize->add_control(
			new WP_Customize_Color_Control(
				$wp_customize,
				'theme_color_1',
				array(
					'label'    => 'Color 1',
					'description' =>
						'This color is used for the following:<br>
                • Site title on front and about pages<br>
                • Navigation bar background<br>
                • Footer background<br>
                • Button background within front page tiles<br>
                • Background of Scene More Info/Media buttons<br>
                • Background of Modal More Info/Media buttons<br>
                • Background of "Copy tab link" above figures<br>
                • "Gray bar" icons appearing above figures',
					'section'  => 'theme_color_settings',
					'settings' => 'theme_color_1',
				)
			)
		);

		// Add setting for Theme Color 2.
		$wp_customize->add_setting(
			'theme_color_2',
			array(
				'default'   => '#FFFFFF',
				'transport' => 'refresh',
				'sanitize_callback' => 'sanitize_hex_color',
			)
		);

		// Add control for Theme Color 2.
		$wp_customize->add_control(
			new WP_Customize_Color_Control(
				$wp_customize,
				'theme_color_2',
				array(
					'label'    => 'Color 2',
					'description' =>
						'This color is used for the following:<br>
                • Navigation bar text<br>
                • Breadcrumb bar text<br>
                • Footer text<br>
                • Button text within front page tiles<br>
                • Text of Scene More Info/Media buttons<br>
                • Text of Modal More Info/Media buttons<br>
                • Text of "Copy tab link" above figures',
					'section'  => 'theme_color_settings',
					'settings' => 'theme_color_2',
				)
			)
		);

		// Add setting for Theme Color 3.
		$wp_customize->add_setting(
			'theme_color_3',
			array(
				'default'   => '#024880',
				'transport' => 'refresh',
				'sanitize_callback' => 'sanitize_hex_color',
			)
		);

		// Add control for Theme Color 3.
		$wp_customize->add_control(
			new WP_Customize_Color_Control(
				$wp_customize,
				'theme_color_3',
				array(
					'label'    => 'Color 3',
					'description' =>
						'This color is used for the following:<br>
                • Front page section titles<br>
                • Scene titles<br>
                • Page titles<br>
                • Modal titles<br>
                • Modal tab titles',
					'section'  => 'theme_color_settings',
					'settings' => 'theme_color_3',
				)
			)
		);

		// Add setting for Theme Color 4.
		$wp_customize->add_setting(
			'theme_color_4',
			array(
				'default'   => '#008da8',
				'transport' => 'refresh',
				'sanitize_callback' => 'sanitize_hex_color',
			)
		);

		// Add control for Theme Color 4.
		$wp_customize->add_control(
			new WP_Customize_Color_Control(
				$wp_customize,
				'theme_color_4',
				array(
					'label'    => 'Color 4',
					'description' =>
						'This color is used for the following:<br>
                • Breadcrumb background<br>
                • Front and about pages subtitle',
					'section'  => 'theme_color_settings',
					'settings' => 'theme_color_4',
				)
			)
		);

		// Add setting for Theme Color 5.
		$wp_customize->add_setting(
			'theme_color_5',
			array(
				'default'   => '#024880',
				'transport' => 'refresh',
				'sanitize_callback' => 'sanitize_hex_color',
			)
		);

		// Add control for Theme Color 5.
		$wp_customize->add_control(
			new WP_Customize_Color_Control(
				$wp_customize,
				'theme_color_5',
				array(
					'label'    => 'Color 5',
					'description' =>
						'This color is used for the following:<br>
                • Scene table of contents text<br>
                • Text contents within Scene "More Info" and "Image" buttons<br>
                • Text contents within Modal "More Info" and "Image" buttons',
					'section'  => 'theme_color_settings',
					'settings' => 'theme_color_5',
				)
			)
		);

		// Add setting for Theme Color 6.
		$wp_customize->add_setting(
			'theme_color_6',
			array(
				'default'   => '#f2f2f2',
				'transport' => 'refresh',
				'sanitize_callback' => 'sanitize_hex_color',
			)
		);

		// Add control for Theme Color 6.
		$wp_customize->add_control(
			new WP_Customize_Color_Control(
				$wp_customize,
				'theme_color_6',
				array(
					'label'    => 'Color 6',
					'description' =>
						'This color is used for the following:<br>
                • Background of primary content area for all pages, ',
					'section'  => 'theme_color_settings',
					'settings' => 'theme_color_6',
				)
			)
		);
	}

	/**
	 * Validates header image dimensions and requirement.
	 *
	 * When the header row is enabled, ensures an image is selected and validates
	 * that it matches the required dimensions of 433x50 pixels.
	 *
	 * @param WP_Error             $validity The validity object to add errors to.
	 * @param mixed                $value    The attachment ID of the selected image.
	 * @param WP_Customize_Setting $setting  The setting instance.
	 * @return WP_Error The validity object, potentially with added errors.
	 */
	public function header_row_validate_image( $validity, $value, $setting ) {
		// Check if header row is enabled.
		$header_row_enabled = $setting->manager->get_setting( 'header_row_enable' )->value();

		if ( $header_row_enabled ) {
			// If header row is enabled, image is required.
			if ( empty( $value ) || 0 == $value ) {
				$validity->add( 'required_field', 'Header image is required when header row is enabled.' );
				return $validity;
			}

			// Validate image dimensions.
			$image_data = wp_get_attachment_image_src( $value, 'full' );

			if ( $image_data ) {
				$width = $image_data[1];
				$height = $image_data[2];

				if ( 433 != $width || 50 != $height ) {
					$validity->add(
						'invalid_dimensions',
						sprintf(
							'Header image must be exactly 433 pixels wide and 50 pixels tall. Your image is %1$dx%2$d pixels.',
							$width,
							$height
						)
					);
				}
			} else {
				$validity->add( 'invalid_image', 'Invalid image selected.' );
			}
		}

		return $validity;
	}

	/**
	 * Validates that a field is not empty when header row is enabled.
	 *
	 * Generic validation callback for fields that become required when the header row
	 * feature is enabled. Generates field-specific error messages based on the setting ID.
	 *
	 * @param WP_Error             $validity The validity object to add errors to.
	 * @param mixed                $value    The field value being validated.
	 * @param WP_Customize_Setting $setting  The setting instance.
	 * @return WP_Error The validity object, potentially with added errors.
	 */
	public function validate_required_when_header_enabled( $validity, $value, $setting ) {
		// Check if header row is enabled.
		$header_row_enabled = $setting->manager->get_setting( 'header_row_enable' )->value();

		if ( $header_row_enabled ) {
			// If header row is enabled, this field is required.
			if ( empty( $value ) || 0 == $value ) {
				// Create dynamic error message based on setting ID.
				$field_names = [
					'header_row_image_alt'  => 'Header Image Alt Text',
					'header_row_image_link' => 'Header Image Link',
					'header_row_breadcrumb_name' => 'Header Name Within Breadcrumb Row',
				];

				$field_name = isset( $field_names[ $setting->id ] ) ? $field_names[ $setting->id ] : 'This field';

				$validity->add(
					'required_field',
					sprintf(
						'%s is required when header row is enabled.',
						$field_name
					)
				);
			}
		}
		return $validity;
	}

	/**
	 * Sanitizes the header image setting value.
	 *
	 * Converts the value to an absolute integer and verifies it corresponds
	 * to a valid image attachment.
	 *
	 * @param mixed $value The raw setting value to sanitize.
	 * @return int The sanitized attachment ID, or 0 if invalid.
	 */
	public function header_row_sanitize_image( $value ) {
		// Ensure it's a valid attachment ID.
		$attachment_id = absint( $value );

		// Verify it's actually an image attachment.
		if ( $attachment_id && wp_attachment_is_image( $attachment_id ) ) {
			return $attachment_id;
		}

		return 0;
	}

	/**
	 * Add JavaScript for enhanced client-side validation
	 */
	public function header_row_validation_script() {
		?>
		<script type="text/javascript">
		jQuery(document).ready(function($) {
			// Monitor header row enable/disable changes
			wp.customize('header_row_enable', function(value) {
				value.bind(function(enabled) {
					if (enabled) {
						// When header row is enabled, validate the image
						var imageValue = wp.customize('header_row_image').get();
						if (!imageValue || imageValue == 0) {
							// Add visual indicator that image is required
							$('#customize-control-header_row_image').addClass('customize-control-required');
							$('#customize-control-header_row_image .description').append(
								'<div class="customize-control-notifications-container" style="margin-top: 4px;">' +
								'<div class="notice notice-error"><p>Header image is required when header row is enabled.</p></div>' +
								'</div>'
							);
						}
					} else {
						// Remove required indicator when disabled
						$('#customize-control-header_row_image').removeClass('customize-control-required');
						$('#customize-control-header_row_image .customize-control-notifications-container').remove();
					}
				});
			});

			// Monitor image selection changes
			wp.customize('header_row_image', function(value) {
				value.bind(function(imageId) {
					var headerRowEnabled = wp.customize('header_row_enable').get();
					
					if (headerRowEnabled && (!imageId || imageId == 0)) {
						// Show error if header row is enabled but no image selected
						$('#customize-control-header_row_image .customize-control-notifications-container').remove();
						$('#customize-control-header_row_image .description').append(
							'<div class="customize-control-notifications-container" style="margin-top: 4px;">' +
							'<div class="notice notice-error"><p>Header image is required when header row is enabled.</p></div>' +
							'</div>'
						);
					} else {
						// Remove error messages when image is selected
						$('#customize-control-header_row_image .customize-control-notifications-container').remove();
					}
				});
			});
		});
		</script>
		<style>
		.customize-control-required .customize-control-title:after {
			content: " *";
			color: #dc3232;
		}
		</style>
		<?php
	}

	/**
	 * Additional helper function to check validation on theme activation or updates
	 */
	public function validate_header_settings_on_save() {
		$header_row_enabled = get_theme_mod( 'header_row_enable' );
		$header_image = get_theme_mod( 'header_row_image' );

		if ( $header_row_enabled ) {
			if ( ! empty( $header_image ) ) {
				// Validate dimensions.
				$image_data = wp_get_attachment_image_src( $header_image, 'full' );
				if ( $image_data && ( 433 != $image_data[1] || 50 != $image_data[2] ) ) {
					add_action(
						'admin_notices',
						function () use ( $image_data ) {
							echo '<div class="notice notice-warning"><p>' .
							sprintf(
								'Warning: Header image dimensions are %1$dx%2$d pixels, but should be exactly 433x50 pixels.',
								absint( $image_data[1] ),
								absint( $image_data[2] ),
							) .
							 '</p></div>';
						}
					);
				}
			}
		}
	}


	/**
	 * Get the default header image attachment ID
	 * This function checks if the default image exists in the media library
	 * and returns its attachment ID, or 0 if not found
	 */
	public function get_header_row_default_image_id() {
		static $default_image_id = null;

		if ( null === $default_image_id ) {
			$default_image_path = get_template_directory() . '/assets/images/IOOS_Emblem_Tertiary_B_RGB.png';
			$default_image_url = get_template_directory_uri() . '/assets/images/IOOS_Emblem_Tertiary_B_RGB.png';

			// Check if image exists in filesystem.
			if ( file_exists( $default_image_path ) ) {
				// Try to find this image in the media library.
				$attachment = get_posts(
					array(
						'post_type' => 'attachment',
						'meta_query' => array(
							array(
								'key' => '_wp_attached_file',
								'value' => basename( $default_image_path ),
								'compare' => 'LIKE',
							),
						),
						'posts_per_page' => 1,
					)
				);

				if ( ! empty( $attachment ) ) {
					$default_image_id = $attachment[0]->ID;
				} else {
					// If not in media library, try to add it.
					$default_image_id = $this->add_default_header_image_to_media_library();
				}
			} else {
				$default_image_id = 0;
			}
		}

		return $default_image_id;
	}

	/**
	 * Add the default header image to the media library
	 */
	public function add_default_header_image_to_media_library() {
		$default_image_path = get_template_directory() . '/assets/images/IOOS_Emblem_Tertiary_B_RGB.png';
		$default_image_url = get_template_directory_uri() . '/assets/images/IOOS_Emblem_Tertiary_B_RGB.png';

		if ( ! file_exists( $default_image_path ) ) {
			return 0;
		}

		// Check if already exists.
		$existing = get_posts(
			array(
				'post_type' => 'attachment',
				'meta_query' => array(
					array(
						'key' => '_wp_attached_file',
						'value' => basename( $default_image_path ),
						'compare' => 'LIKE',
					),
				),
				'posts_per_page' => 1,
			)
		);

		if ( ! empty( $existing ) ) {
			return $existing[0]->ID;
		}

		// Include WordPress file handling functions.
		if ( ! function_exists( 'wp_handle_upload' ) ) {
			require_once ABSPATH . 'wp-admin/includes/file.php';
		}
		if ( ! function_exists( 'wp_generate_attachment_metadata' ) ) {
			require_once ABSPATH . 'wp-admin/includes/image.php';
		}
		if ( ! function_exists( 'media_handle_upload' ) ) {
			require_once ABSPATH . 'wp-admin/includes/media.php';
		}

		// Copy file to uploads directory.
		$upload_dir = wp_upload_dir();
		$filename = basename( $default_image_path );
		$new_file_path = $upload_dir['path'] . '/' . $filename;

		// Only copy if it doesn't already exist in uploads.
		if ( ! file_exists( $new_file_path ) ) {
			if ( ! copy( $default_image_path, $new_file_path ) ) {
				return 0;
			}
		}

		// Create attachment.
		$attachment = array(
			'guid' => $upload_dir['url'] . '/' . $filename,
			'post_mime_type' => 'image/png',
			'post_title' => 'IOOS Header Image',
			'post_content' => '',
			'post_status' => 'inherit',
		);

		$attachment_id = wp_insert_attachment( $attachment, $new_file_path );

		if ( ! is_wp_error( $attachment_id ) ) {
			// Generate metadata.
			$attachment_data = wp_generate_attachment_metadata( $attachment_id, $new_file_path );
			wp_update_attachment_metadata( $attachment_id, $attachment_data );

			return $attachment_id;
		}

		return 0;
	}

	/**
	 * Determines whether header row controls should be visible.
	 *
	 * Active callback for conditionally showing header row controls
	 * based on the header_row_enable setting.
	 *
	 * @param WP_Customize_Control $control The control instance.
	 * @return bool True if header row is enabled, false otherwise.
	 */
	public function is_header_row_enabled( $control ) {
		$value = $control->manager->get_setting( 'header_row_enable' )->value();
		if ( 1 == $value ) {
			return true;
		} else {
			return false;
		}
	}

	/**
	 * Add inline JavaScript to control the visibility of header row settings
	 */
	public function header_row_customizer_inline_script() {
		?>
		<script type="text/javascript">
		(function() {
			wp.customize.bind('ready', function() {
				// List of controls that should be hidden/shown based on header row enable
				var dependentControls = [
					'header_row_bg_color',
					'header_row_image', 
					'header_row_image_alt',
					'header_row_image_link',
					'header_row_breadcrumb_name'
				];
				
				// Function to slide down (show) an element
				function slideDown(element, duration) {
					duration = duration || 300;
					element.style.display = 'block';
					element.style.height = '0px';
					element.style.overflow = 'hidden';
					element.style.transition = 'height ' + duration + 'ms ease-out';
					
					var height = element.scrollHeight + 'px';
					element.style.height = height;
					
					setTimeout(function() {
						element.style.height = '';
						element.style.overflow = '';
						element.style.transition = '';
					}, duration);
				}
				
				// Function to slide up (hide) an element
				function slideUp(element, duration) {
					duration = duration || 300;
					element.style.height = element.offsetHeight + 'px';
					element.style.overflow = 'hidden';
					element.style.transition = 'height ' + duration + 'ms ease-out';
					
					setTimeout(function() {
						element.style.height = '0px';
					}, 10);
					
					setTimeout(function() {
						element.style.display = 'none';
						element.style.height = '';
						element.style.overflow = '';
						element.style.transition = '';
					}, duration);
				}
				
				// Function to toggle control visibility
				function toggleHeaderRowControls(enabled) {
					dependentControls.forEach(function(controlId) {
						var control = wp.customize.control(controlId);
						if (control) {
							var container = control.container[0]; // Get DOM element from jQuery object
							if (enabled) {
								slideDown(container);
							} else {
								slideUp(container);
							}
						}
					});
				}
				
				// Get the header row enable control
				var headerRowEnable = wp.customize.control('header_row_enable');
				
				if (headerRowEnable) {
					// Set initial state
					var initialValue = wp.customize('header_row_enable').get();
					toggleHeaderRowControls(!!initialValue);
					
					// Listen for changes to the checkbox
					wp.customize('header_row_enable', function(setting) {
						setting.bind(function(value) {
							toggleHeaderRowControls(!!value);
						});
					});
				}
			});
		})();
		</script>
		<?php
	}

	/**
	 * Outputs custom CSS from the Theme Customizer.
	 */
	public function sanctuary_watch_customizer_css() {
		$color2 = get_theme_mod( 'theme_color_2', '#ffffff' );
		$color2_encoded = rawurlencode( $color2 );
		?>
		<style type="text/css">
			#top-bar {
				background-color: <?php echo esc_attr( get_theme_mod( 'header_row_bg_color', '#ffffff' ) ); ?>;
			}

			/* Theme Color 1 */
			.site-title-main, .gray-bar-links {
				color: <?php echo esc_attr( get_theme_mod( 'theme_color_1', '#03386c' ) ); ?>;
			}
			#navbar-inner, 
			#taglineHeaderId > button,
			.site-footer, 
			.instance_published_button, 
			.accordion-button, 
			.accordion-button:not(.collapsed), 
			.ViewSceneButton,
			.btn-primary {
				background-color: <?php echo esc_attr( get_theme_mod( 'theme_color_1', '#03386c' ) ); ?>;
			}

			/* Theme Color 2 */
			#taglineHeaderId > button,
			#site-name-logo-banner, 
			#site-name-logo-banner a, 
			#site-name-logo-banner p, 
			.navbar-brand, 
			.nav-link, 
			.footer-column-title, 
			.footer_component, 
			.footer_component a, 
			.instance_published_button, 
			.accordion-button, 
			.accordion-button:not(.collapsed),
			.ViewSceneButton,
			.btn-primary  {
				color: <?php echo esc_attr( get_theme_mod( 'theme_color_2', '#ffffff' ) ); ?> ;
			}

			/* STILL THEME COLOR 2: Override arrow with inline SVG  */
			.accordion-button::after {
				content: "";
				background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'%3E%3Cpath fill='<?php echo esc_attr( $color2_encoded ); ?>' d='M1.5 5.5l6 6 6-6'/%3E%3C/svg%3E") !important;
				background-repeat: no-repeat;
				background-size: 1.25rem;
				width: 1.25rem;
				height: 1.25rem;
				margin-left: auto;
			}

			.accordion-button:not(.collapsed)::after {
				transform: rotate(-180deg);
			}

			/* Theme Color 3 */
			.theme-title > h2, #title-container > h1, .modal-title, .instance_type_title, .graphic-data-page-title {
				color: <?php echo esc_attr( get_theme_mod( 'theme_color_3', '#024880' ) ); ?> !important;
			}

			.tab-title {
				color: <?php echo esc_attr( get_theme_mod( 'theme_color_3', '#024880' ) ); ?> !important;
			}

			/* Theme Color 4 */
			#site-name-logo-banner {
				background-color: <?php echo esc_attr( get_theme_mod( 'theme_color_4', '#008da8' ) ); ?>;
			}

			.site-tagline-main {
				color: <?php echo esc_attr( get_theme_mod( 'theme_color_4', '#008da8' ) ); ?>;
			}

			/* Theme Color 5 */

			#toc-container a, 
			#more-info-item-1 a, 
			#images-item-1 a, 
			#accordion-item-1 a, 
			#accordion-item-2 a {
				color: <?php echo esc_attr( get_theme_mod( 'theme_color_5', '#024880' ) ); ?>;
			}

			/* Theme Color 6 */
			#entire_thing {
				background-color: <?php echo esc_attr( get_theme_mod( 'theme_color_6', '#f2f2f2' ) ); ?>;
			}
		</style>
		<?php
	}

	/**
	 * Helper function to check if header row is enabled
	 */
	public function is_header_row_active() {
		return get_theme_mod( 'header_row_enable', false );
	}

	/**
	 * Helper function to get header row image URL
	 */
	public function get_header_row_image() {
		return get_theme_mod( 'header_row_image', get_template_directory_uri() . '/assets/images/IOOS_Emblem_Tertiary_B_RGB.png' );
	}

	/**
	 * Helper function to get header row image alt text
	 */
	public function get_header_row_image_alt() {
		return get_theme_mod( 'header_row_image_alt', 'IOOS' );
	}

	/**
	 * Helper function to get header row image link
	 */
	public function get_header_row_image_link() {
		return get_theme_mod( 'header_row_image_link', 'https://ioos.us/' );
	}

	/**
	 * Helper function to get header row breadcrumb name
	 */
	public function get_header_row_breadcrumb_name() {
		return get_theme_mod( 'header_row_breadcrumb_name', 'IOOS' );
	}

	/**
	 * Return the preview to the homepage when changing the selected instance.
	 */
	public function enqueue_single_instance_scripts() {
		wp_add_inline_script(
			'customize-controls',
			'wp.customize.bind("ready", function () {
				wp.customize("single_instance_id", function (setting) {
					setting.bind(function () {
						wp.customize.previewer.previewUrl.set(' . wp_json_encode( home_url( '/' ) ) . ');
						wp.customize.previewer.refresh();
					});
				});
			});'
		);
	}

	/**
	 * Reject an instance whose overview is no longer available when saving.
	 *
	 * @param WP_Error $validity Setting validation errors.
	 * @param mixed    $value Selected instance ID.
	 * @return WP_Error Validation errors.
	 */
	public function validate_single_instance( $validity, $value ) {
		if ( 0 !== absint( $value ) && ! graphic_data_get_instance_overview( $value ) ) {
			$validity->add( 'invalid_instance', 'Choose a published instance with a published overview scene or page.' );
		}
		return $validity;
	}


	/**
	 * Remove specific sections and panels from the WordPress Customizer.
	 *
	 * This function removes the Menus panel, Additional CSS section, and Homepage
	 * Settings section from the WordPress Customizer interface to streamline the
	 * customization options available to users.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_Customize_Manager $wp_customize The WordPress Customizer Manager object.
	 *                                          Contains methods for adding and removing
	 *                                          customizer panels, sections, and controls.
	 *
	 * @return void
	 */
	public function remove_customizer_sections( $wp_customize ) {
		// Remove Menus panel.
		$wp_customize->remove_panel( 'nav_menus' );

		// Remove Additional CSS section.
		$wp_customize->remove_section( 'custom_css' );

		// Remove Homepage Settings section.
		$wp_customize->remove_section( 'static_front_page' );
	}
}