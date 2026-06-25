<?php
// Permissions List Table for wpDataTables
if (!class_exists('WP_List_Table')) {
    require_once(ABSPATH . 'wp-admin/includes/class-wp-list-table.php');
}

class WDTPermissionsListTable extends WP_List_Table
{
    public $type = 'tables';

    public function __construct($args = array())
    {
        parent::__construct(array(
            'singular' => 'permission',
            'plural' => 'permissions',
            'ajax' => false,
            'primary' => 'user'
        ));
        if (!empty($args['type']) && in_array($args['type'], ['tables', 'charts'])) {
            $this->type = $args['type'];
        }
    }

    public function get_columns()
    {
        return array(
            'id' => __('ID', 'wpdatatables'),
            'user' => __('User', 'wpdatatables'),
            'roles' => __('Roles', 'wpdatatables'),
            'email' => __('Email', 'wpdatatables'),
            'tables' => __('Tables', 'wpdatatables'),
            'permissions' => __('Permissions', 'wpdatatables'),
            'actions' => ''
        );
    }

    public function get_sortable_columns()
    {
        return array(
            'id' => array('id', true),
            'user' => array('user', false),
            'roles' => array('roles', false)
        );
    }

    public function column_default($item, $column_name)
    {
        switch ($column_name) {
            case 'id':
                return '<span class="wpdt-id">' . intval(isset($item['id']) ? $item['id'] : 0) . '</span>';
            case 'user':
                return isset($item['user']) ? '<a href="#">' . esc_html($item['user']) . '</a>' : '';
            case 'roles':
                return isset($item['roles']) ? esc_html($item['roles']) : '';
            case 'email':
                return isset($item['email']) ? esc_html($item['email']) : '';
            case 'tables':
                return isset($item['tables']) ? esc_html($item['tables']) : '—';
            case 'permissions':
                return isset($item['permissions']) ? esc_html($item['permissions']) : '';
            case 'actions':
                return isset($item['actions']) ? $item['actions'] : '';
            default:
                return isset($item[$column_name]) ? esc_html($item[$column_name]) : '';
        }
    }

    /**
     * Override display_tablenav
     *
     * @param string $which
     */
    public function display_tablenav($which)
    {
        if ('top' === $which) {
            wp_nonce_field('bulk-' . $this->_args['plural']);
        }
        echo '<div class="tablenav ' . esc_attr($which) . '">';
        $this->extra_tablenav($which);
        echo '<br class="clear"/>';
        echo '</div>';
    }

    /**
     * Print column headers
     */
    public function print_column_headers($with_id = true)
    {
        list($columns, $hidden, $sortable, $primary) = $this->get_column_info();
        $defaultSortingOrder = get_option('wdtSortingOrderBrowseTables');

        $current_url = set_url_scheme('http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
        $current_url = remove_query_arg('paged', $current_url);

        if (isset($_GET['orderby'])) {
            $current_orderby = $_GET['orderby'];
        } else {
            $current_orderby = '';
        }

        if (isset($_GET['order']) && 'desc' === $_GET['order']) {
            $current_order = 'desc';
        } else {
            $current_order = 'asc';
        }

        foreach ($columns as $column_key => $column_display_name) {
            $class = array('manage-column', "column-$column_key");

            if (in_array($column_key, $hidden)) {
                $class[] = 'hidden';
            }

            if ('cb' === $column_key)
                $class[] = 'check-column';
            elseif (in_array($column_key, array('posts', 'comments', 'links')))
                $class[] = 'num';

            if ($column_key === $primary) {
                $class[] = 'column-primary';
            }

            if (isset($sortable[$column_key])) {
                list($orderby, $desc_first) = $sortable[$column_key];

                if ($current_orderby === $orderby) {
                    $order = 'asc' === $current_order ? 'desc' : 'asc';
                    $class[] = 'sorted';
                    $class[] = $current_order;
                } else {
                    $order = strtolower($defaultSortingOrder) == 'desc' ? 'desc' : 'asc';
                    $class[] = ($current_orderby == '' && $column_key == 'id') ? 'sorted' : 'sortable';
                    $class[] = strtolower($defaultSortingOrder) == 'desc' ? 'desc' : 'asc';
                }

                $column_display_name = '<a href="' . esc_url(add_query_arg(compact('orderby', 'order'), $current_url)) . '"><span>' . $column_display_name . '</span><span class="sorting-indicator"></span></a>';
            }

            $tag = ('cb' === $column_key) ? 'td' : 'th';
            $scope = ('th' === $tag) ? 'scope="col"' : '';
            $id = $with_id ? "id='$column_key'" : '';

            if (!empty($class))
                $class = "class='" . join(' ', $class) . "'";

            echo "<$tag $scope $id $class>$column_display_name</$tag>";
        }
    }

    /**
     * Display the pagination
     */
    protected function pagination($which)
    {
        if (empty($this->_pagination_args))
            return;

        $max = $this->_pagination_args['total_pages'];
        $paged = $this->get_pagenum();

        if ($max <= 1)
            return;

        $removable_query_args = wp_removable_query_args();
        $current_url = set_url_scheme('http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
        $current_url = remove_query_arg($removable_query_args, $current_url);
        $search_term = '';
        if (isset($_REQUEST['s'])) {
            $search_term = sanitize_text_field($_REQUEST['s']);
            $current_url = add_query_arg('s', $search_term, $current_url);
        }

        if ($paged >= 1)
            $links[] = $paged;

        if ($paged >= 3) {
            $links[] = $paged - 1;
            $links[] = $paged - 2;
        }

        if (($paged + 2) <= $max) {
            $links[] = $paged + 2;
            $links[] = $paged + 1;
        }

        $disable_first = $disable_last = $disable_prev = $disable_next = false;

        if ($paged == 1) {
            $disable_first = true;
            $disable_prev = true;
        }
        if ($paged == 2) {
            $disable_first = true;
        }
        if ($paged == $max) {
            $disable_last = true;
            $disable_next = true;
        }
        if ($paged == $max - 1) {
            $disable_last = true;
        }

        require(WDT_ROOT_PATH . '/templates/admin/browse/pagination.inc.php');
    }

    /**
     * Return total count of permission rows (used by parent pagination)
     *
     * @return int
     */
    public function getTableCount()
    {
        $users = get_users();
        $count = 0;
        $cap = $this->type === 'tables' ? WDTPermissionsAdmin::CAPABILITY_VIEW_TABLES : WDTPermissionsAdmin::CAPABILITY_VIEW_CHARTS;
        $search = isset($_REQUEST['s']) ? sanitize_text_field($_REQUEST['s']) : '';
        foreach ($users as $user) {
            if (in_array('administrator', (array)$user->roles, true)) continue;
            if (!isset($user->allcaps[$cap]) || !$user->allcaps[$cap]) continue;
            if ($search) {
                $match = false;
                if (is_numeric($search) && intval($search) === intval($user->ID)) $match = true;
                if (stripos($user->user_login, $search) !== false) $match = true;
                if (stripos($user->user_email, $search) !== false) $match = true;
                if (!$match) continue;
            }
            $count++;
        }
        return $count;
    }

    /**
     * Return permission rows
     *
     * @return array
     */
    public function getAllTables()
    {
        $users = get_users();
        $rows = array();
        $cap = $this->type === 'tables' ? WDTPermissionsAdmin::CAPABILITY_VIEW_TABLES : WDTPermissionsAdmin::CAPABILITY_VIEW_CHARTS;
        $search = isset($_REQUEST['s']) ? sanitize_text_field($_REQUEST['s']) : '';

        foreach ($users as $user) {
            if (in_array('administrator', (array)$user->roles, true)) continue;
            if (!isset($user->allcaps[$cap]) || !$user->allcaps[$cap]) continue;

            if ($search) {
                $match = false;
                if (is_numeric($search) && intval($search) === intval($user->ID)) $match = true;
                if (stripos($user->user_login, $search) !== false) $match = true;
                if (stripos($user->user_email, $search) !== false) $match = true;
                if (!$match) continue;
            }

            $roles = implode(', ', $user->roles);
            $meta_key = $this->type === 'tables' ? 'wpdt_table_access' : 'wpdt_chart_access';
            $access = get_user_meta($user->ID, $meta_key, true);
            $all_key = $this->type === 'tables' ? 'all_tables' : 'all_charts';
            $item_id_key = $this->type === 'tables' ? 'table_ids' : 'chart_ids';
            if (empty($access) || (isset($access[$all_key]) && $access[$all_key])) {
                $items_display = esc_html__('All', 'wpdatatables');
            } else {
                $ids = isset($access[$item_id_key]) ? $access[$item_id_key] : array();
                if (empty($ids)) {
                    $items_display = '—';
                } else {
                    global $wpdb;
                    if ($this->type === 'tables') {
                        $placeholders = implode(',', array_fill(0, count($ids), '%d'));
                        $query = $wpdb->prepare("SELECT GROUP_CONCAT(title) as titles FROM {$wpdb->prefix}wpdatatables WHERE id IN ($placeholders)", ...$ids);
                    } else {
                        $placeholders = implode(',', array_fill(0, count($ids), '%d'));
                        $query = $wpdb->prepare("SELECT GROUP_CONCAT(title) as titles FROM {$wpdb->prefix}wpdatacharts WHERE id IN ($placeholders)", ...$ids);
                    }
                    $result = $wpdb->get_var($query);
                    $items_display = $result ?: '—';
                }
            }

            $rows[] = array(
                'id' => $user->ID,
                'title' => $user->user_login,
                'table_type' => $roles,
                'shortcode' => '<span class="wdt-shortcode">' . esc_html($user->user_email) . '</span>',
                'actions' => '<div class="wdt-function-flex">'
                    . '<a href="#" class="wdt-edit-permission" data-id="' . intval($user->ID) . '" data-toggle="tooltip" title="' . esc_attr__('Edit', 'wpdatatables') . '"><i class="wpdt-icon-pen"></i></a>'
                    . '<a href="#" class="wdt-delete-permission" data-id="' . intval($user->ID) . '" data-toggle="tooltip" title="' . esc_attr__('Delete', 'wpdatatables') . '"><i class="wpdt-icon-trash"></i></a>'
                    . '</div>'
            );
        }
        // Sorting: respect orderby/order
        $orderby = isset($_REQUEST['orderby']) ? sanitize_text_field($_REQUEST['orderby']) : 'id';
        $order = isset($_REQUEST['order']) && strtolower($_REQUEST['order']) === 'desc' ? 'desc' : 'asc';
        if (in_array($orderby, array('id', 'title', 'table_type'), true)) {
            usort($rows, function ($a, $b) use ($orderby, $order) {
                $av = isset($a[$orderby]) ? $a[$orderby] : '';
                $bv = isset($b[$orderby]) ? $b[$orderby] : '';
                if ($orderby === 'id') {
                    $cmp = intval($av) <=> intval($bv);
                } else {
                    $cmp = strcasecmp((string)$av, (string)$bv);
                }
                return $order === 'desc' ? -$cmp : $cmp;
            });
        }

        // Paging: emulate per-page slicing
        $per_page = get_option('wdtTablesPerPage') ? get_option('wdtTablesPerPage') : 10;
        $paged = isset($_REQUEST['paged']) ? intval($_REQUEST['paged']) : 1;
        $offset = ($paged - 1) * $per_page;
        return array_slice($rows, $offset, $per_page);
    }

    /**
     * Displays the search box
     *
     * @param string $text
     * @param string $input_id
     */
    public function search_box($text, $input_id)
    {
        if (empty($_REQUEST['s']) && !$this->has_items())
            return;

        $input_id = $input_id . '-search-input';

        if (!empty($_REQUEST['orderby']))
            echo '<input type="hidden" name="orderby" value="' . esc_attr($_REQUEST['orderby']) . '" />';
        if (!empty($_REQUEST['order']))
            echo '<input type="hidden" name="order" value="' . esc_attr($_REQUEST['order']) . '" />';
        if (!empty($_REQUEST['post_mime_type']))
            echo '<input type="hidden" name="post_mime_type" value="' . esc_attr($_REQUEST['post_mime_type']) . '" />';
        if (!empty($_REQUEST['detached']))
            echo '<input type="hidden" name="detached" value="' . esc_attr($_REQUEST['detached']) . '" />';

        require_once(WDT_ROOT_PATH . '/templates/admin/browse/search_box.inc.php');
    }

    public function prepare_items()
    {
        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();
        $this->_column_headers = array($columns, $hidden, $sortable);

        $data = $this->get_permissions_data();
        // Sorting
        $orderby = isset($_REQUEST['orderby']) ? sanitize_text_field($_REQUEST['orderby']) : 'id';
        $order = isset($_REQUEST['order']) && strtolower($_REQUEST['order']) === 'desc' ? 'desc' : 'asc';
        if (in_array($orderby, array('id', 'user', 'roles'), true)) {
            usort($data, function ($a, $b) use ($orderby, $order) {
                $av = isset($a[$orderby]) ? $a[$orderby] : '';
                $bv = isset($b[$orderby]) ? $b[$orderby] : '';
                if ($orderby === 'id') {
                    $cmp = intval($av) <=> intval($bv);
                } else {
                    $cmp = strcasecmp((string)$av, (string)$bv);
                }
                return $order === 'desc' ? -$cmp : $cmp;
            });
        }

        $per_page = get_option('wdtTablesPerPage') ? get_option('wdtTablesPerPage') : 10;
        $current_page = $this->get_pagenum();
        $total_items = count($data);

        $this->items = array_slice($data, ($current_page - 1) * $per_page, $per_page);
        $this->set_pagination_args(array(
            'total_items' => $total_items,
            'per_page' => $per_page,
            'total_pages' => ceil($total_items / $per_page)
        ));
    }

    private function get_permissions_data()
    {
        // Fetch users and permission data
        $users = get_users();
        $rows = array();
        foreach ($users as $user) {
            if (in_array('administrator', (array)$user->roles, true)) continue;
            $cap = $this->type === 'tables' ? WDTPermissionsAdmin::CAPABILITY_VIEW_TABLES : WDTPermissionsAdmin::CAPABILITY_VIEW_CHARTS;
            if (!isset($user->allcaps[$cap]) || !$user->allcaps[$cap]) continue;
            $roles = implode(', ', $user->roles);
            $meta_key = $this->type === 'tables' ? 'wpdt_table_access' : 'wpdt_chart_access';
            $access = get_user_meta($user->ID, $meta_key, true);
            $all_key = $this->type === 'tables' ? 'all_tables' : 'all_charts';
            $item_id_key = $this->type === 'tables' ? 'table_ids' : 'chart_ids';
            if (empty($access) || (isset($access[$all_key]) && $access[$all_key])) {
                $items_display = esc_html__('All', 'wpdatatables');
            } else {
                $ids = isset($access[$item_id_key]) ? $access[$item_id_key] : array();
                if (empty($ids)) {
                    $items_display = '—';
                } else {
                    global $wpdb;
                    if ($this->type === 'tables') {
                        $placeholders = implode(',', array_fill(0, count($ids), '%d'));
                        $query = $wpdb->prepare("SELECT GROUP_CONCAT(title) as titles FROM {$wpdb->prefix}wpdatatables WHERE id IN ($placeholders)", ...$ids);
                    } else {
                        $placeholders = implode(',', array_fill(0, count($ids), '%d'));
                        $query = $wpdb->prepare("SELECT GROUP_CONCAT(title) as titles FROM {$wpdb->prefix}wpdatacharts WHERE id IN ($placeholders)", ...$ids);
                    }
                    $result = $wpdb->get_var($query);
                    $items_display = $result ?: '—';
                }
            }
            $rows[] = array(
                'id' => $user->ID,
                'user' => $user->user_login,
                'email' => $user->user_email,
                'roles' => $roles,
                'tables' => $items_display,
                'permissions' => $this->type === 'tables' ? esc_html__('View Tables', 'wpdatatables') : esc_html__('View Charts', 'wpdatatables'),
                'actions' => '<div class="wdt-function-flex">'
                    . '<a href="#" class="wdt-edit-permission" data-id="' . intval($user->ID) . '" data-toggle="tooltip" title="' . esc_attr__('Edit', 'wpdatatables') . '"><i class="wpdt-icon-pen"></i></a>'
                    . '<a href="#" class="wdt-delete-permission" data-id="' . intval($user->ID) . '" data-toggle="tooltip" title="' . esc_attr__('Delete', 'wpdatatables') . '"><i class="wpdt-icon-trash"></i></a>'
                    . '</div>'
            );
        }
        return $rows;
    }

    /**
     * Return an array of extra table classes for the permissions table template.
     * The template already prints `widefat fixed wp-list-table`
     *
     * @return array
     */
    public function get_table_classes()
    {
        return array('widefat', 'fixed', 'wdt-permissions-table');
    }

    /**
     * Override display to use the permissions-specific template
     */
    public function display()
    {
        require_once(WDT_ROOT_PATH . '/templates/admin/permissions/table_list.inc.php');
    }
}
