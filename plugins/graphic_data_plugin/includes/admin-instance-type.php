<?php
/**
 * Register class that defines the Instance Type functions  
 * 
 */

 
include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-utility.php';
class Webcr_Instance_Type {

    // code version for instance
    function instance_settings_init() {
        // Register a new settings group
        register_setting('theme_settings_group', 'instance_settings');

        // Add a new section
        add_settings_section(
            'instance_settings_section',
            'Instance Settings',
            null,
            'instance_settings'
        );
    }

    // Register the instance_type taxonomy if it doesn't exist
    function register_instance_type_taxonomy() {
        if (!taxonomy_exists('instance_type')) {
            register_taxonomy('instance_type', 'post', [
                'hierarchical' => false,
                'labels' => [
                    'name' => 'Instance Types',
                    'singular_name' => 'Instance Type',
                    'menu_name' => 'Instance Types',
                    'all_items' => 'All Instance Types',
                    'edit_item' => 'Edit Instance Type',
                    'view_item' => 'View Instance Type',
                    'update_item' => 'Update Instance Type',
                    'add_new_item' => 'Add New Instance Type',
                    'new_item_name' => 'New Instance Type Name',
                    'search_items' => 'Search Instance Types',
                ],
                'show_ui' => true,
                'show_admin_column' => true,
                'query_var' => true,
                'rewrite' => ['slug' => 'instance-type'],
            ]);
        }
    }

    // Register the instance order meta field for the taxonomy
    function register_instance_type_order_meta() {
        register_meta('term', 'instance_order', [
            'type' => 'integer',
            'single' => true,
            'show_in_rest' => true,
            'sanitize_callback' => 'absint',
        ]);
    }

    // Register the instance navbar name meta field for the taxonomy
    function register_instance_type_navbar_name_meta() {
        register_meta('term', 'navbar_name', [
            'type' => 'integer',
            'single' => true,
            'show_in_rest' => true,
        ]);
    }

    // Add the admin menu item
    function add_instance_type_admin_menu() {
        add_menu_page(
            'Manage Instance Types',
            'Instance Types',
            'manage_categories',
            'manage-instance-types',
            [$this, 'render_instance_type_admin_page'],
            'dashicons-category',
            25
        );
    }

    // Render the admin page
    function render_instance_type_admin_page() {
        // Check if taxonomy exists before proceeding
        if (!taxonomy_exists('instance_type')) {
            echo '<div class="error"><p>Error: The instance_type taxonomy is not properly registered.</p></div>';
            return;
        }

        // Handle form submissions
        if ($_SERVER['REQUEST_METHOD'] === 'POST') {
            if (isset($_POST['action'])) {
                switch ($_POST['action']) {
                    case 'add':
                        if (isset($_POST['term_name']) && isset($_POST['instance_order']) && isset($_POST['instance_navbar_name'])) {
                            $term_name = sanitize_text_field($_POST['term_name']);
                            $term_slug = sanitize_title($_POST['term_slug']);
                            $term_description = sanitize_textarea_field($_POST['term_description']);
                            $instance_order = absint($_POST['instance_order']);
                            $instance_navbar_name = sanitize_text_field($_POST['instance_navbar_name']);
                            
                            $args = array(
                                'slug' => $term_slug,
                                'description' => $term_description
                            );
                            
                            $term = wp_insert_term($term_name, 'instance_type', $args);
                            if (!is_wp_error($term)) {
                                update_term_meta($term['term_id'], 'instance_order', $instance_order);
                                update_term_meta($term['term_id'], 'instance_navbar_name', $instance_navbar_name);
                            }
                        }
                        break;
                        
                    case 'edit':
                        if (isset($_POST['term_id']) && isset($_POST['term_name']) && isset($_POST['instance_order']) && isset($_POST['instance_navbar_name'])) {
                            $term_id = absint($_POST['term_id']);
                            $term_name = sanitize_text_field($_POST['term_name']);
                            $term_slug = sanitize_title($_POST['term_slug']);
                            $term_description = sanitize_textarea_field($_POST['term_description']);
                            $instance_order = absint($_POST['instance_order']);
                            $instance_navbar_name = sanitize_text_field($_POST['instance_navbar_name']);

                            wp_update_term($term_id, 'instance_type', [
                                'name' => $term_name,
                                'slug' => $term_slug,
                                'description' => $term_description
                            ]);
                            update_term_meta($term_id, 'instance_order', $instance_order);
                            update_term_meta($term_id, 'instance_navbar_name', $instance_navbar_name);
                        }
                        break;
                        
                    case 'delete':
                        if (isset($_POST['term_id'])) {
                            $term_id = absint($_POST['term_id']);
                            wp_delete_term($term_id, 'instance_type');
                        }
                        break;
                }
            }
        }
        
        // Get all instance_type terms
        $terms = get_terms([
            'taxonomy' => 'instance_type',
            'hide_empty' => false,
        ]);

        // Check if we got an error
        if (is_wp_error($terms)) {
            echo '<div class="error"><p>Error retrieving terms: ' . esc_html($terms->get_error_message()) . '</p></div>';
            return;
        }

        // Convert terms to array if it's not already (for older WordPress versions)
        $terms = is_array($terms) ? $terms : array();
        ?>
        <div class="wrap">
            <h1>Manage Instance Types</h1>
            
            <!-- Add new term form -->
            <h2>Add New Instance Type</h2>
            <form method="post" action="">
                <input type="hidden" name="action" value="add">
                <table class="form-table">
                    <tr>
                        <th><label for="term_name">Name</label></th>
                        <td><input type="text" name="term_name" id="term_name" class="regular-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="term_slug">Slug</label></th>
                        <td><input type="text" name="term_slug" id="term_slug" class="regular-text"></td>
                    </tr>
                    <tr>
                        <th><label for="term_description">Description</label></th>
                        <td><textarea name="term_description" id="term_description" class="large-text" rows="5"></textarea></td>
                    </tr>
                    <tr>
                        <th><label for="instance_order">Order</label></th>
                        <td><input type="number" name="instance_order" id="instance_order" class="small-text" required></td>
                    </tr>
                    <tr>
                        <th><label for="instance_navbar_name">Navbar Name</label></th>
                        <td><input type="text" name="instance_navbar_name" id="instance_navbar_name" class="regular-text" required></td>
                    </tr>
                </table>
                <?php submit_button('Add New Instance Type'); ?>
            </form>
            
            <!-- List existing terms -->
            <h2>Existing Instance Types</h2>
            <?php if (empty($terms)): ?>
                <p>No instance types found.</p>
            <?php else: ?>
                <table class="wp-list-table widefat fixed striped">
                    <thead>
                        <tr>
                            <th>Name</th>
                            <th>Slug</th>
                            <th>Description</th>
                            <th>Order</th>
                            <th>Navbar Name</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        <?php foreach ($terms as $term): 
                            // Ensure $term is a WP_Term object
                            if (!is_object($term) || !isset($term->term_id)) {
                                continue;
                            }
                            $instance_order = get_term_meta($term->term_id, 'instance_order', true); 
                            $instance_navbar_name = get_term_meta($term->term_id, 'instance_navbar_name', true); 
                        ?>
                            <tr>
                                <td><?php echo esc_html($term->name); ?></td>
                                <td><?php echo esc_html($term->slug); ?></td>
                                <td><?php echo esc_html($term->description); ?></td>
                                <td><?php echo esc_html($instance_order); ?></td>
                                <td><?php echo esc_html($instance_navbar_name); ?></td>
                                <td>
                                    <button type="button" class="button" 
                                        onclick="showEditForm(
                                            <?php echo esc_js($term->term_id); ?>,
                                            '<?php echo esc_js($term->name); ?>',
                                            '<?php echo esc_js($term->slug); ?>',
                                            '<?php echo esc_js($term->description); ?>',
                                            <?php echo esc_js($instance_order); ?>,
                                            '<?php echo esc_js($instance_navbar_name); ?>'
                                        )">
                                        Edit
                                    </button>
                                    <form method="post" action="" style="display: inline;">
                                        <input type="hidden" name="action" value="delete">
                                        <input type="hidden" name="term_id" value="<?php echo esc_attr($term->term_id); ?>">
                                        <button type="submit" class="button" onclick="return confirm('Are you sure you want to delete this term?')">
                                            Delete
                                        </button>
                                    </form>
                                </td>
                            </tr>
                        <?php endforeach; ?>
                    </tbody>
                </table>
            <?php endif; ?>
            
            <!-- Edit form (hidden by default) -->
            <div id="edit-form" style="display: none;">
                <h2>Edit Instance Type</h2>
                <form method="post" action="">
                    <input type="hidden" name="action" value="edit">
                    <input type="hidden" name="term_id" id="edit_term_id">
                    <table class="form-table">
                        <tr>
                            <th><label for="edit_term_name">Name</label></th>
                            <td><input type="text" name="term_name" id="edit_term_name" class="regular-text" required></td>
                        </tr>
                        <tr>
                            <th><label for="edit_term_slug">Slug</label></th>
                            <td><input type="text" name="term_slug" id="edit_term_slug" class="regular-text"></td>
                        </tr>
                        <tr>
                            <th><label for="edit_term_description">Description</label></th>
                            <td><textarea name="term_description" id="edit_term_description" class="large-text" rows="5"></textarea></td>
                        </tr>
                        <tr>
                            <th><label for="edit_instance_order">Order</label></th>
                            <td><input type="number" name="instance_order" id="edit_instance_order" class="small-text" required></td>
                        </tr>
                        <tr>
                            <th><label for="edit_instance_navbar_name">Navbar Name</label></th>
                            <td><input type="text" name="instance_navbar_name" id="edit_instance_navbar_name" class="regular-text" required></td>
                        </tr>
                    </table>
                    <?php submit_button('Update Instance Type'); ?>
                </form>
            </div>
            
            <script>
                function showEditForm(termId, termName, termSlug, termDescription, termOrder, termNavbarName) {
                    document.getElementById('edit-form').style.display = 'block';
                    document.getElementById('edit_term_id').value = termId;
                    document.getElementById('edit_term_name').value = termName;
                    document.getElementById('edit_term_slug').value = termSlug;
                    document.getElementById('edit_term_description').value = termDescription;
                    document.getElementById('edit_instance_order').value = termOrder;
                    document.getElementById('edit_instance_navbar_name').value = termNavbarName;
                }
            </script>

        </div>
        <?php
    }

}
