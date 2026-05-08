<?php
/**
 * Content Editor and Manager Role Implementation
 *
 * This file creates custom user roles and limits available roles to:
 * Content Editor, Content Manager, and Administrator (in that order)
 *
 * @package Graphic_Data_Plugin
 */

// Don't allow direct access.
if ( ! defined( 'ABSPATH' ) ) {
	exit;
}

/**
 * Manages custom user roles and role-based access control for the Graphic Data Plugin.
 *
 * Replaces the default WordPress roles (subscriber, contributor, author, editor) with
 * two custom roles: Content Editor and Content Manager. Content Editors are restricted
 * to managing only the scene, modal, and figure post types assigned to their instances.
 * Content Managers have editor-level capabilities without sensitive administrative permissions.
 *
 * @since   1.0.0
 * @package Graphic_Data_Plugin
 */
class Graphic_Data_Custom_Roles {

	/**
	 * Removes admin menu pages that authors should not access.
	 *
	 * Hides Posts, Pages, About, Instance, and Manage Instance Types menu items
	 * from users with the 'author' role.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function restrict_author_admin_menu() {
		$user = wp_get_current_user();
		$user_role = $user->roles[0];

		if ( 'author' == $user_role ) {
			remove_menu_page( 'edit.php' );                   // Posts.
			remove_menu_page( 'edit.php?post_type=page' );    // Pages.
			remove_menu_page( 'manage-instance-types' ); // Manage Instance Types.
			remove_menu_page( 'edit.php?post_type=about' );
			remove_menu_page( 'edit.php?post_type=instance' );

		}
	}

	/**
	 * Removes "New" content links from the admin bar for non-admin users.
	 *
	 * Strips the new-post, new-page, new-about, and new-instance nodes from the
	 * admin bar for any user who lacks the 'manage_options' capability.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_Admin_Bar $wp_admin_bar The WordPress admin bar instance.
	 * @return void
	 */
	public function restrict_new_post_from_admin_bar( $wp_admin_bar ) {
		// Check if the user has a role of editor or lower.
		if ( ! current_user_can( 'manage_options' ) ) {
			// Remove the "Post" item from the "New" dropdown.
			$wp_admin_bar->remove_node( 'new-post' );
			$wp_admin_bar->remove_node( 'new-page' );
			$wp_admin_bar->remove_node( 'new-about' );
			$wp_admin_bar->remove_node( 'new-instance' );

		}
	}

	/**
	 * Filters admin list queries to show only posts belonging to an author's assigned instances.
	 *
	 * Applies a meta query on the main admin listing query for scene, modal, and figure post types.
	 * Authors will only see posts whose location meta field matches one of their assigned
	 * instances. If no instances are assigned, no posts are shown.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_Query $query The current WordPress query object.
	 * @return void
	 */
	public function restrict_listing( $query ) {
		global $pagenow;

		// Ensure this is the main query in the admin area.
		if ( ! is_admin() || ! $query->is_main_query() ) {
			return;
		}

		// Ensure that we are dealing with the scene, modal, or figure post types (the only ones where the author restrictions come to bear).
		$current_post_type = $query->get( 'post_type' );
		if ( 'scene' != $current_post_type && 'modal' != $current_post_type && 'figure' != $current_post_type ) {
			return;
		}

		$user = wp_get_current_user();
		$user_role = $user->roles[0];

		// Only filter when viewing the scene list table ('edit.php') and for authors.
		if ( 'edit.php' === $pagenow && 'author' === $user_role ) {

			// Get the current user.
			$current_user = wp_get_current_user();

			// Get instances associated with this author.
			$user_instances = get_user_meta( $current_user->ID, 'assigned_instances', true );

			// If we have associated instances and it's a non-empty array.
			if ( ! empty( $user_instances ) && is_array( $user_instances ) ) {

				if ( 'figure' == $current_post_type ) {
					$target_field = 'location';
				} else {
					$target_field = $current_post_type . '_location'; // e.g., 'scene_location', 'modal_location'.
				}

				// Set up meta query to only show post associated with these instances.
				$meta_query = $query->get( 'meta_query' ) ? $query->get( 'meta_query' ) : array(); // Get existing meta query or initialize if needed.
				$meta_query[] = array(
					'key'     => $target_field, // Make sure this is the correct meta key.
					'value'   => $user_instances,
					'compare' => 'IN',
				);
				$query->set( 'meta_query', $meta_query );

			} else {
				// If no instances are associated, show no posts (safer than showing all).
				$query->set( 'post__in', array( 0 ) ); // This ensures no posts will be found.
			}
		}
	}

	/**
	 * Registers the Content Editor and Content Manager roles.
	 *
	 * Content Editor inherits the built-in editor capabilities, but is restricted to only allowed Instances. Content Manager also inherits
	 * editor capabilities but explicitly excludes sensitive administrative capabilities such as
	 * plugin/theme management and core updates. After creating the custom roles, the default
	 * subscriber, contributor, author, and editor roles are removed.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function create_custom_roles() {
		// ... (rest of the function remains the same) ...
		// Get the capabilities of the editor role
		$editor_role = get_role( 'editor' );
		$editor_capabilities = $editor_role ? $editor_role->capabilities : array();

		// Create the Content Editor role.
		if ( ! get_role( 'content_editor' ) ) {
			add_role(
				'content_editor',
				'Content Editor',
				$editor_capabilities
			);
		}

		// Create the Content Manager role (with slightly higher capabilities).
		if ( ! get_role( 'content_manager' ) ) {
			// Get admin capabilities but remove some sensitive ones.
			$manager_capabilities = $editor_role->capabilities;

			// Remove capabilities that should be reserved for administrators.
			$restricted_caps = array(
				'install_plugins',
				'activate_plugins',
				'delete_plugins',
				'edit_plugins',
				'install_themes',
				'switch_themes',
				'edit_themes',
				'delete_themes',
				'update_core',
				'update_plugins',
				'update_themes',
				'manage_options',
				'manage_sites',
			);

			foreach ( $restricted_caps as $cap ) {
				if ( isset( $manager_capabilities[ $cap ] ) ) {
					unset( $manager_capabilities[ $cap ] );
				}
			}

			add_role( 'content_manager', 'Content Manager', $manager_capabilities );
		}
	}


	/**
	 * Grants author-role users full create, edit, and delete access to the scene, modal, and figure post types.
	 *
	 * Iterates over the three custom post types and calls add_cap() for every
	 * primitive capability WordPress maps to those types, covering own posts,
	 * others' posts, published posts, and private posts.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function add_author_custom_post_type_caps() {
		$options = get_option( 'graphic_data_settings' );

		if ( is_array( $options ) && isset( $options['author_caps_version'] ) &&
			GRAPHIC_DATA_PLUGIN_VERSION === $options['author_caps_version'] ) {
				return;
		}

		$author_role = get_role( 'author' );

		if ( ! $author_role ) {
			return;
		}

		$post_types = array( 'scene', 'modal', 'figure' );

		foreach ( $post_types as $post_type ) {
			$plural = $post_type . 's';
			$author_role->add_cap( 'edit_' . $plural );
			$author_role->add_cap( 'edit_others_' . $plural );
			$author_role->add_cap( 'edit_published_' . $plural );
			$author_role->add_cap( 'edit_private_' . $plural );
			$author_role->add_cap( 'delete_' . $plural );
			$author_role->add_cap( 'delete_others_' . $plural );
			$author_role->add_cap( 'delete_published_' . $plural );
			$author_role->add_cap( 'delete_private_' . $plural );
			$author_role->add_cap( 'read_private_' . $plural );
		}

		if ( ! is_array( $options ) ) {
			add_option( 'graphic_data_settings', array( 'author_caps_version' => GRAPHIC_DATA_PLUGIN_VERSION ) );
		} else {
			$options['author_caps_version'] = GRAPHIC_DATA_PLUGIN_VERSION;
			update_option( 'graphic_data_settings', $options );
		}
	}

	/**
	 * Filters the editable roles list, restoring any missing standard WordPress roles.
	 *
	 * For each standard WordPress role (administrator, editor, author, contributor, subscriber),
	 * if the role is absent from the list it is restored to the database via populate_roles()
	 * and added back to the returned array with its standard capabilities.
	 *
	 * @since 1.0.0
	 *
	 * @param array $roles Associative array of role slugs to role details.
	 * @return array Roles array with any missing standard WordPress roles restored.
	 */
	public function filter_user_roles( $roles ) {
		$standard_roles = array( 'administrator', 'editor', 'author', 'contributor', 'subscriber' );

		$needs_populate = false;
		foreach ( $standard_roles as $role_slug ) {
			if ( ! isset( $roles[ $role_slug ] ) && ! get_role( $role_slug ) ) {
				$needs_populate = true;
				break;
			}
		}

		if ( $needs_populate ) {
			if ( ! function_exists( 'populate_roles' ) ) {
				require_once ABSPATH . 'wp-admin/includes/schema.php';
			}
			populate_roles();
		}

		foreach ( $standard_roles as $role_slug ) {
			if ( isset( $roles[ $role_slug ] ) ) {
				continue;
			}
			$role_obj = get_role( $role_slug );
			if ( $role_obj ) {
				$wp_role_name                = wp_roles()->roles[ $role_slug ]['name'] ?? ucfirst( $role_slug );
				$roles[ $role_slug ] = array(
					'name'         => $wp_role_name,
					'capabilities' => $role_obj->capabilities,
				);
			}
		}

		return $roles;
	}

	/**
	 * Renders the Instance Assignments checkbox fields on the user edit screen.
	 *
	 * Displays a list of all published instance posts as checkboxes, allowing
	 * administrators to assign specific instances to a user. The section is only
	 * visible to administrators and is toggled via inline JavaScript to show only
	 * when the selected user role is 'author'.
	 *
	 * @since 1.0.0
	 *
	 * @param WP_User $user The user object being edited.
	 * @return void
	 */
	public function add_instance_selection_fields( $user ) {

		// Only show these fields if the CURRENTLY LOGGED-IN user is an Administrator.
		if ( ! current_user_can( 'manage_options' ) ) {
			return; // Exit if the current user is not an administrator.
		}

		// Get user role.
		$selected_user_roles = $user->roles; // This is an array.
		$selected_user_role  = ! empty( $selected_user_roles ) ? $selected_user_roles[0] : '';

		// Get all instance posts.
		$instances = get_posts(
			array(
				'post_type' => 'instance',
				'numberposts' => -1,
				'orderby' => 'title',
				'order' => 'ASC',
			)
		);

		// Get the currently selected instances for this user.
		$selected_instances = get_user_meta( $user->ID, 'assigned_instances', true );
		if ( ! is_array( $selected_instances ) ) {
			$selected_instances = array();
		}

		// Display the fields.
		if ( 'author' == $selected_user_role ) {
			?>
			<h3>Instance Assignments</h3>
			<?php wp_nonce_field( 'save_assigned_instances_' . $user->ID, 'assigned_instances_nonce' ); ?>
			<table class="form-table">
				<tr>
					<th><label>Assigned Instances</label></th>
					<td>
						<?php if ( ! empty( $instances ) ) : ?>
							<fieldset>
								<legend class="screen-reader-text">Assigned Instances</legend>
								<?php foreach ( $instances as $instance ) : ?>
									<label>
										<input type="checkbox"
											name="assigned_instances[]"
											value="<?php echo esc_attr( $instance->ID ); ?>"
											<?php checked( in_array( $instance->ID, $selected_instances ) ); ?>>
										<?php echo esc_html( $instance->post_title ); ?>
									</label><br>
								<?php endforeach; ?>
							</fieldset>
							<p class="description">Select the instances this author can manage.</p>
						<?php else : ?>
							<p>No instances found.</p>
						<?php endif; ?>
						

						<!-- Script below makes sure that this only shows if we're editing an author.  -->
						<script>
						document.addEventListener('DOMContentLoaded', function () {
							const roleDropdown = document.getElementById('role');
							if (!roleDropdown) {
								console.warn('Role dropdown not found. Instance visibility toggle skipped.');
								return;
							}

							const headings = document.querySelectorAll('h3');
							let instanceHeading = null;
							let instanceTable = null;

							// Locate the specific <h3> and its following .form-table
							headings.forEach(function (heading) {
								if (heading.textContent.trim() === 'Instance Assignments') {
									const table = heading.nextElementSibling;
									if (table && table.classList.contains('form-table')) {
										instanceHeading = heading;
										instanceTable = table;
									}
								}
							});

							if (!instanceHeading || !instanceTable) {
								console.warn('Instance Assignments section not found.');
								return;
							}

							function toggleInstanceSection() {
								const selectedRole = roleDropdown.value;
								const show = selectedRole === 'author';

								instanceHeading.style.display = show ? '' : 'none';
								instanceTable.style.display = show ? '' : 'none';
							}

							// Initial check on load.
							toggleInstanceSection();

							// Re-check on dropdown change.
							roleDropdown.addEventListener('change', toggleInstanceSection);
						});
						</script>
					</td>
				</tr>
			</table>
			<?php
		}
	}

	/**
	 * Saves the assigned instance selections when a user profile is saved.
	 *
	 * Sanitizes the submitted instance IDs with `absint` and stores them as the
	 * 'assigned_instances' user meta. Only processes the save if the current user
	 * has permission to edit the target user and the target user has the
	 * 'author' role.
	 *
	 * @since 1.0.0
	 *
	 * @param int $user_id The ID of the user being saved.
	 * @return bool|void False if the current user lacks edit permissions, void otherwise.
	 */
	public function save_instance_selections( $user_id ) {
		// Verify nonce.
		if ( ! isset( $_POST['assigned_instances_nonce'] ) || ! wp_verify_nonce( sanitize_text_field( wp_unslash( $_POST['assigned_instances_nonce'] ) ), 'save_assigned_instances_' . $user_id ) ) {
			return false;
		}

		// Check for permissions.
		if ( ! current_user_can( 'edit_user', $user_id ) ) {
			return false;
		}

		// Get the current user object.
		$user = get_userdata( $user_id );

		// Only save instance selections, for users with the role of author.
		if ( in_array( 'author', $user->roles ) ) {
			// Get the selected instances.
			$selected_instances = isset( $_POST['assigned_instances'] ) ? array_map( 'absint', wp_unslash( $_POST['assigned_instances'] ) ) : array();

			// Save the selected instances.
			update_user_meta( $user_id, 'assigned_instances', $selected_instances );
		}
	}

	/**
	 * Restricts access to individual post edit screens for authors.
	 *
	 * On `post.php` for scene, modal, and figure post types, verifies that the
	 * Author's assigned instances include the instance associated with the
	 * post being edited. If the user has no assigned instances or the post belongs
	 * to an unassigned instance, the user is redirected to the post type's list screen.
	 * Administrators and non-Content-Editor roles are not affected.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function restrict_editing() {
		global $pagenow;

		// Only on post editing screens.
		if ( ! is_admin() || ! in_array( $pagenow, array( 'post.php', 'post-new.php' ) ) ) {
			return;
		}

		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only access control check on page load, no form processing.
		$post_type = isset( $_GET['post_type'] ) ? sanitize_text_field( wp_unslash( $_GET['post_type'] ) ) : '';
		// phpcs:ignore WordPress.Security.NonceVerification.Recommended -- Read-only access control check on page load, no form processing.
		$post_id   = isset( $_GET['post'] ) ? absint( $_GET['post'] ) : 0;

		// Determine the actual post type being edited.
		if ( $post_id > 0 ) {
			$current_post_type = get_post_type( $post_id );
		} elseif ( ! empty( $post_type ) ) {
			$current_post_type = $post_type;
		} else {
			$current_post_type = '';
		}

		// Only apply restrictions to 'author' role.
		$user = wp_get_current_user();
		$user_role = $user->roles[0];

		if ( 'author' != $user_role ) {
			return;
		}

		// Only apply restrictions to scene, modal, and figure post types.
		if ( 'scene' !== $current_post_type && 'modal' !== $current_post_type && 'figure' !== $current_post_type ) {
			return;
		}

		// For new posts, don't need to check anything yet (they'll be restricted at save time if needed).
		if ( 'post-new.php' === $pagenow ) {
			return;
		}

		// If editing an existing post.
		if ( 'post.php' === $pagenow && $post_id > 0 ) {
			$current_user = wp_get_current_user();
			$user_instances = get_user_meta( $current_user->ID, 'assigned_instances', true );
			$redirect_url = admin_url( 'edit.php?post_type=' . $current_post_type );

			// No instances assigned at all.
			if ( empty( $user_instances ) || ! is_array( $user_instances ) ) {
				wp_safe_redirect( $redirect_url );
				exit;
			}

			if ( 'figure' === $current_post_type ) {
				$target_field = 'location';
			} else {
				$target_field = $current_post_type . '_location'; // e.g., 'scene_location', 'modal_location'.
			}

			// Get the instance ID associated with this custom post type.
			$target_instance = get_post_meta( $post_id, $target_field, true );

			// Check if user can edit this specific scene's instance.
			if ( ! in_array( $target_instance, $user_instances ) ) {
				wp_safe_redirect( $redirect_url );
				exit;
			}
		}
	}

	/**
	 * Migrates users from custom roles to their standard WordPress equivalents.
	 *
	 * Moves content_editor users to the author role and content_manager users
	 * to the editor role.
	 *
	 * @since 1.0.0
	 *
	 * @return void
	 */
	public function migrate_custom_roles_to_standard() {
		$migrations = array(
			'content_editor'  => 'author',
			'content_manager' => 'editor',
		);

		foreach ( $migrations as $from_role => $to_role ) {
			$users = get_users( array( 'role' => $from_role ) );
			foreach ( $users as $user ) {
				$user->set_role( $to_role );
			}
		}
	}
}
