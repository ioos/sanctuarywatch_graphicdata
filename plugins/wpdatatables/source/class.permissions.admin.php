<?php
if (!defined('ABSPATH')) die('Access denied.');


class WDTPermissionsAdmin
{
    // Define capabilities
    const CAPABILITY_VIEW_TABLES = 'wpdt_view_tables';
    const CAPABILITY_VIEW_CHARTS = 'wpdt_view_charts';

    public static function enqueueAssets($hook)
    {
        if (isset($_GET['page']) && $_GET['page'] === 'wpdatatables_permissions') {
            // Enqueue permissions-specific scripts
            wp_enqueue_script('wdt-permissions-js', plugins_url('../assets/js/wpdatatables/admin/permissions/permissions-admin.js', __FILE__), array('jquery', 'wdt-common'), WDT_CURRENT_VERSION, true);

            wp_localize_script('wdt-permissions-js', 'wdtPermissions', array(
                'ajax_url' => admin_url('admin-ajax.php'),
                'nonce' => wp_create_nonce('wdt_permissions_nonce'),
            ));
        }
    }

    /**
     * Register wpDataTables capabilities
     * Makes them available in role management interfaces
     */
    public static function registerCapabilities()
    {
        // Add the capabilities directly to administrator role
        // This makes them discoverable by role management plugins
        $adminRole = get_role('administrator');
        if ($adminRole) {
            $adminRole->add_cap(self::CAPABILITY_VIEW_TABLES);
            $adminRole->add_cap(self::CAPABILITY_VIEW_CHARTS);
        }

        // Add filter to include our custom capabilities in role editors
        add_filter('members_get_capabilities', function ($capabilities) {
            $capabilities[] = self::CAPABILITY_VIEW_TABLES;
            $capabilities[] = self::CAPABILITY_VIEW_CHARTS;
            return array_unique($capabilities);
        });

        // For other role editors, filter the available capabilities
        add_filter('editable_roles', function ($roles) {
            return $roles;
        });
    }

    public static function registerMenu()
    {
        // Only admins can access
        if (!current_user_can('manage_options')) return;
        add_submenu_page(
            'wpdatatables',
            __('Permissions', 'wpdatatables'),
            __('Permissions', 'wpdatatables'),
            'manage_options',
            'wpdatatables_permissions',
            [self::class, 'renderPage']
        );
    }

    public static function renderPage()
    {
        $activeTab = isset($_GET['tab']) && $_GET['tab'] === 'charts' ? 'charts' : 'tables';
        require_once(WDT_ROOT_PATH . '/source/class.wdtpermissionslisttable.php');
        $permissionsTable = new WDTPermissionsListTable(['type' => $activeTab]);
        $permissionsTable->prepare_items();
        include(WDT_ROOT_PATH . '/templates/admin/permissions/permissions.inc.php');
    }

    public static function loadPermissionsAjax()
    {
        check_ajax_referer('wdt_permissions_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $tab = isset($_POST['tab']) ? sanitize_text_field($_POST['tab']) : 'tables';

        // Load assigned permissions for tables or charts
        if ($tab === 'tables') {
            $html = self::getTablePermissionsListHtml();
        } else {
            $html = self::getChartPermissionsListHtml();
        }

        wp_send_json_success(['html' => $html]);
    }

    private static function getTablePermissionsListHtml()
    {
        // Get optional search term
        $search = isset($_POST['s']) ? sanitize_text_field($_POST['s']) : '';

        // Get all users with the wpdt_view_tables capability
        $users = get_users();
        if (!is_array($users) || empty($users)) {
            return '<tr><td colspan="7" style="text-align: center; padding: 24px;">' .
                esc_html__('No users found.', 'wpdatatables') .
                '</td></tr>';
        }

        $html = '';
        $foundAny = false;

        foreach ($users as $user) {
            // Skip administrators
            if (in_array('administrator', (array)$user->roles, true)) {
                continue;
            }
            // Apply search filter if present
            if ($search) {
                $match = false;
                if (is_numeric($search) && intval($search) === intval($user->ID)) $match = true;
                if (stripos($user->user_login, $search) !== false) $match = true;
                if (stripos($user->user_email, $search) !== false) $match = true;
                if (!$match) continue;
            }
            // Check if user has the capability by checking their actual capabilities
            // This respects role hierarchy and capability grants/denials
            if (!isset($user->allcaps[self::CAPABILITY_VIEW_TABLES]) || !$user->allcaps[self::CAPABILITY_VIEW_TABLES]) {
                continue;
            }

            $foundAny = true;

            // Get user roles
            $roles = implode(', ', $user->roles);

            // Get table access metadata for this user
            $userTableAccess = get_user_meta($user->ID, 'wpdt_table_access', true);
            $allTables = empty($userTableAccess) || isset($userTableAccess['all_tables']) && $userTableAccess['all_tables'];

            // Get tables list
            if ($allTables) {
                $tablesDisplay = esc_html__('All', 'wpdatatables');
            } else {
                $tableIds = isset($userTableAccess['table_ids']) ? $userTableAccess['table_ids'] : array();
                if (empty($tableIds)) {
                    $tablesDisplay = '—';
                } else {
                    // Get table titles
                    global $wpdb;
                    $placeholders = implode(',', array_fill(0, count($tableIds), '%d'));
                    $query = $wpdb->prepare("SELECT GROUP_CONCAT(title) as titles FROM {$wpdb->prefix}wpdatatables WHERE id IN ($placeholders)", ...$tableIds);
                    $result = $wpdb->get_var($query);
                    $tablesDisplay = $result ?: '—';
                }
            }

            $permissionsDisplay = esc_html__('View Tables', 'wpdatatables');

            $html .= '<tr>';
            $html .= '<td class="column-id">' . intval($user->ID) . '</td>';
            $html .= '<td class="column-user"><a href="#">' . esc_html($user->user_login) . '</a></td>';
            $html .= '<td class="column-roles">' . esc_html($roles) . '</td>';
            $html .= '<td class="column-email">' . esc_html($user->user_email) . '</td>';
            $html .= '<td class="column-tables">' . esc_html($tablesDisplay) . '</td>';
            $html .= '<td class="column-permissions">' . esc_html($permissionsDisplay) . '</td>';
            $html .= '<td class="column-actions">';
            $html .= '<div class="wdt-function-flex">';
            $html .= '<a href="#" class="wdt-edit-permission" data-id="' . intval($user->ID) . '" data-toggle="tooltip" title="' . esc_attr__('Edit', 'wpdatatables') . '"><i class="wpdt-icon-pen"></i></a>';
            $html .= '<a href="#" class="wdt-delete-permission" data-id="' . intval($user->ID) . '" data-toggle="tooltip" title="' . esc_attr__('Delete', 'wpdatatables') . '"><i class="wpdt-icon-trash"></i></a>';
            $html .= '</div>';
            $html .= '</td>';
            $html .= '</tr>';
        }

        if (!$foundAny) {
            return '<tr><td colspan="7" style="text-align: center; padding: 24px;">' .
                esc_html__('No permissions assigned yet.', 'wpdatatables') .
                '</td></tr>';
        }

        return $html;
    }

    private static function getChartPermissionsListHtml()
    {
        // Get optional search term
        $search = isset($_POST['s']) ? sanitize_text_field($_POST['s']) : '';

        // Get all users with the wpdt_view_charts capability
        $users = get_users();
        if (!is_array($users) || empty($users)) {
            return '<tr><td colspan="7" style="text-align: center; padding: 24px;">' .
                esc_html__('No users found.', 'wpdatatables') .
                '</td></tr>';
        }

        $html = '';
        $foundAny = false;

        foreach ($users as $user) {
            // Skip administrators
            if (in_array('administrator', (array)$user->roles, true)) {
                continue;
            }
            // Apply search filter if present
            if ($search) {
                $match = false;
                if (is_numeric($search) && intval($search) === intval($user->ID)) $match = true;
                if (stripos($user->user_login, $search) !== false) $match = true;
                if (stripos($user->user_email, $search) !== false) $match = true;
                if (!$match) continue;
            }
            // Check if user has the capability by checking their actual capabilities
            // This respects role hierarchy and capability grants/denials
            if (!isset($user->allcaps[self::CAPABILITY_VIEW_CHARTS]) || !$user->allcaps[self::CAPABILITY_VIEW_CHARTS]) {
                continue;
            }

            $foundAny = true;

            // Get user roles
            $roles = implode(', ', $user->roles);

            // Get chart access metadata for this user
            $userChartAccess = get_user_meta($user->ID, 'wpdt_chart_access', true);
            $allCharts = empty($userChartAccess) || isset($userChartAccess['all_charts']) && $userChartAccess['all_charts'];

            // Get charts list
            if ($allCharts) {
                $chartsDisplay = esc_html__('All', 'wpdatatables');
            } else {
                $chartIds = isset($userChartAccess['chart_ids']) ? $userChartAccess['chart_ids'] : array();
                if (empty($chartIds)) {
                    $chartsDisplay = '—';
                } else {
                    // Get chart titles
                    global $wpdb;
                    $placeholders = implode(',', array_fill(0, count($chartIds), '%d'));
                    $query = $wpdb->prepare("SELECT GROUP_CONCAT(title) as titles FROM {$wpdb->prefix}wpdatacharts WHERE id IN ($placeholders)", ...$chartIds);
                    $result = $wpdb->get_var($query);
                    $chartsDisplay = $result ?: '—';
                }
            }

            $permissionsDisplay = esc_html__('View Charts', 'wpdatatables');

            $html .= '<tr>';
            $html .= '<td class="column-id">' . intval($user->ID) . '</td>';
            $html .= '<td class="column-user"><a href="#">' . esc_html($user->user_login) . '</a></td>';
            $html .= '<td class="column-roles">' . esc_html($roles) . '</td>';
            $html .= '<td class="column-email">' . esc_html($user->user_email) . '</td>';
            $html .= '<td class="column-tables">' . esc_html($chartsDisplay) . '</td>';
            $html .= '<td class="column-permissions">' . esc_html($permissionsDisplay) . '</td>';
            $html .= '<td class="column-actions">';
            $html .= '<div class="wdt-function-flex">';
            $html .= '<a href="#" class="wdt-edit-permission" data-id="' . intval($user->ID) . '" data-toggle="tooltip" title="' . esc_attr__('Edit', 'wpdatatables') . '"><i class="wpdt-icon-pen"></i></a>';
            $html .= '<a href="#" class="wdt-delete-permission" data-id="' . intval($user->ID) . '" data-toggle="tooltip" title="' . esc_attr__('Delete', 'wpdatatables') . '"><i class="wpdt-icon-trash"></i></a>';
            $html .= '</div>';
            $html .= '</td>';
            $html .= '</tr>';
        }

        if (!$foundAny) {
            return '<tr><td colspan="7" style="text-align: center; padding: 24px;">' .
                esc_html__('No permissions assigned yet.', 'wpdatatables') .
                '</td></tr>';
        }

        return $html;
    }

    public static function savePermissionAjax()
    {
        check_ajax_referer('wdt_permissions_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $tab = isset($_POST['tab']) ? sanitize_text_field($_POST['tab']) : 'tables';
        $userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $enableSpecific = isset($_POST['enable_specific']) ? intval($_POST['enable_specific']) : 0;
        $itemIds = isset($_POST['item_ids']) ? (array)$_POST['item_ids'] : array();

        if (!$userId) {
            wp_send_json_error(['message' => 'Invalid data']);
        }

        $user = get_userdata($userId);
        if (!$user) {
            wp_send_json_error(['message' => 'User not found']);
        }

        // Determine capability to grant
        $capability = $tab === 'tables' ? self::CAPABILITY_VIEW_TABLES : self::CAPABILITY_VIEW_CHARTS;

        // Grant capability to user
        $user->add_cap($capability);

        // Store table/chart access metadata
        $metaKey = $tab === 'tables' ? 'wpdt_table_access' : 'wpdt_chart_access';
        $accessData = array();

        if ($enableSpecific && !empty($itemIds)) {
            $itemIdKey = $tab === 'tables' ? 'table_ids' : 'chart_ids';
            $accessData[$itemIdKey] = array_map('intval', $itemIds);
        } else {
            $allKey = $tab === 'tables' ? 'all_tables' : 'all_charts';
            $accessData[$allKey] = true;
        }

        update_user_meta($userId, $metaKey, $accessData);

        wp_send_json_success(['message' => 'Permission saved successfully']);
    }

    public static function updatePermissionAjax()
    {
        check_ajax_referer('wdt_permissions_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $tab = isset($_POST['tab']) ? sanitize_text_field($_POST['tab']) : 'tables';
        $userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;
        $enableSpecific = isset($_POST['enable_specific']) ? intval($_POST['enable_specific']) : 0;
        $itemIds = isset($_POST['item_ids']) ? (array)$_POST['item_ids'] : array();

        if (!$userId) {
            wp_send_json_error(['message' => 'Invalid data']);
        }

        $user = get_userdata($userId);
        if (!$user) {
            wp_send_json_error(['message' => 'User not found']);
        }

        // Determine capability
        $capability = $tab === 'tables' ? self::CAPABILITY_VIEW_TABLES : self::CAPABILITY_VIEW_CHARTS;

        // Ensure user has capability
        $user->add_cap($capability);

        // Update table/chart access metadata
        $metaKey = $tab === 'tables' ? 'wpdt_table_access' : 'wpdt_chart_access';
        $accessData = array();

        if ($enableSpecific && !empty($itemIds)) {
            $itemIdKey = $tab === 'tables' ? 'table_ids' : 'chart_ids';
            $accessData[$itemIdKey] = array_map('intval', $itemIds);
        } else {
            $allKey = $tab === 'tables' ? 'all_tables' : 'all_charts';
            $accessData[$allKey] = true;
        }

        update_user_meta($userId, $metaKey, $accessData);

        wp_send_json_success(['message' => 'Permission updated successfully']);
    }

    public static function deletePermissionAjax()
    {
        check_ajax_referer('wdt_permissions_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $tab = isset($_POST['tab']) ? sanitize_text_field($_POST['tab']) : 'tables';
        $userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;

        if (!$userId) {
            wp_send_json_error(['message' => 'Invalid data']);
        }

        $user = get_userdata($userId);
        if (!$user) {
            wp_send_json_error(['message' => 'User not found']);
        }

        // Determine capability to remove
        $capability = $tab === 'tables' ? self::CAPABILITY_VIEW_TABLES : self::CAPABILITY_VIEW_CHARTS;

        // Remove capability from user
        $user->remove_cap($capability);

        // Delete associated metadata
        $metaKey = $tab === 'tables' ? 'wpdt_table_access' : 'wpdt_chart_access';
        delete_user_meta($userId, $metaKey);

        wp_send_json_success(['message' => 'Permission deleted successfully']);
    }

    public static function getPermissionAjax()
    {
        check_ajax_referer('wdt_permissions_nonce', 'nonce');

        if (!current_user_can('manage_options')) {
            wp_send_json_error(['message' => 'Unauthorized']);
        }

        $tab = isset($_POST['tab']) ? sanitize_text_field($_POST['tab']) : 'tables';
        $userId = isset($_POST['user_id']) ? intval($_POST['user_id']) : 0;

        if (!$userId) {
            wp_send_json_error(['message' => 'Invalid data']);
        }

        $user = get_userdata($userId);
        if (!$user) {
            wp_send_json_error(['message' => 'User not found']);
        }

        // Get capability
        $capability = $tab === 'tables' ? self::CAPABILITY_VIEW_TABLES : self::CAPABILITY_VIEW_CHARTS;
        $hasCapability = $user->has_cap($capability);

        // Get table/chart access metadata
        $metaKey = $tab === 'tables' ? 'wpdt_table_access' : 'wpdt_chart_access';
        $accessData = get_user_meta($userId, $metaKey, true);

        $result = array(
            'user_id' => $userId,
            'has_capability' => $hasCapability,
        );

        // Determine access type
        if (empty($accessData)) {
            $result['all_items'] = true;
            $result['item_ids'] = array();
        } else {
            $allKey = $tab === 'tables' ? 'all_tables' : 'all_charts';
            $itemIdKey = $tab === 'tables' ? 'table_ids' : 'chart_ids';

            $result['all_items'] = isset($accessData[$allKey]) && $accessData[$allKey];
            $result['item_ids'] = isset($accessData[$itemIdKey]) ? $accessData[$itemIdKey] : array();
        }

        wp_send_json_success($result);
    }
}

add_action('admin_menu', ['WDTPermissionsAdmin', 'registerMenu']);
add_action('admin_enqueue_scripts', ['WDTPermissionsAdmin', 'enqueueAssets']);
add_action('init', ['WDTPermissionsAdmin', 'registerCapabilities'], 1);
add_action('wp_ajax_wpdatatables_load_permissions', ['WDTPermissionsAdmin', 'loadPermissionsAjax']);
add_action('wp_ajax_wpdatatables_save_permission', ['WDTPermissionsAdmin', 'savePermissionAjax']);
add_action('wp_ajax_wpdatatables_update_permission', ['WDTPermissionsAdmin', 'updatePermissionAjax']);
add_action('wp_ajax_wpdatatables_delete_permission', ['WDTPermissionsAdmin', 'deletePermissionAjax']);
add_action('wp_ajax_wpdatatables_get_permission', ['WDTPermissionsAdmin', 'getPermissionAjax']);
