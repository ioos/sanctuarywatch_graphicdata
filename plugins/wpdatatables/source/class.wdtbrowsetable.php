<?php

defined('ABSPATH') or die("Cannot access pages directly.");
/**
 * Browse table for the admin panel
 */

if (!class_exists('WP_List_Table')) {
    require_once(ABSPATH . 'wp-admin/includes/class-wp-list-table.php');
}

/**
 * Class WDTBrowseTable
 */
class WDTBrowseTable extends WP_List_Table {

    /**
     * Get a list of columns. The format is:
     * 'internal-name' => 'Title'
     *
     * @since 3.1.0
     * @access public
     * @abstract
     *
     * @return array
     */
    function get_columns() {
        return array(
            'cb'         => '1',
            'id'         => __('ID', 'wpdatatables'),
            'title'      => __('Title', 'wpdatatables'),
            'table_type' => __('Type', 'wpdatatables'),
            'shortcode'  => __('Shortcode', 'wpdatatables'),
            'functions'  => ''
        );
    }

    /**
     * Get a list of sortable columns. The format is:
     * 'internal-name' => 'orderby'
     * or
     * 'internal-name' => array( 'orderby', true )
     *
     * The second format will make the initial sorting order be descending
     *
     * @since 3.1.0
     * @access protected
     *
     * @return array
     */
    function get_sortable_columns() {
        return array(
            'id' => array('id', true),
            'title' => array('title', false),
            'table_type' => array('table_type', false)
        );
    }

    /**
     * Get table count for the browser
     *
     * @return null|string
     */
    function getTableCount() {
        global $wpdb;
        $query = "SELECT COUNT(*) FROM {$wpdb->prefix}wpdatatables";
        if (isset($_REQUEST['s'])) {
            if (is_numeric($_REQUEST['s'])) {
                $query .= " WHERE id LIKE '" . sanitize_text_field($_REQUEST['s']) . "'";
            } else {
                $query .= " WHERE title LIKE '%" . sanitize_text_field($_REQUEST['s']) . "%'";
            }
        }
        $count = $wpdb->get_var($query);
        return $count;
    }

    /**
     * Get all tables for the Browse Tables (wpDataTables) Page
     *
     * @return array|mixed|null|object
     */
    function getAllTables() {
        global $wpdb;
        $predifinedOrderByValue = ['id', 'title', 'table_type'];
        $orderByValue = 'id';
        $defaultSortingOrder = get_option('wdtSortingOrderBrowseTables');

        $query = "SELECT id, title, table_type, editable FROM {$wpdb->prefix}wpdatatables ";

        if (isset($_REQUEST['s'])) {
            if (is_numeric($_REQUEST['s'])) {
                $query .= " WHERE id LIKE '" . sanitize_text_field($_REQUEST['s']) . "'";
            } else {
                $query .= " WHERE title LIKE '%" . sanitize_text_field($_REQUEST['s']) . "%'";
            }
        }

        if (isset($_REQUEST['orderby'])) {
            if (in_array($_REQUEST['orderby'], $predifinedOrderByValue)) {

                $requestOrderByValue = sanitize_text_field($_REQUEST['orderby']);
                foreach ($predifinedOrderByValue as $value) {
                    if ($requestOrderByValue === $value){
                        $orderByValue = $value;
                    }
                }
                $query .= " ORDER BY " . $orderByValue;
                if ($_REQUEST['order'] == 'desc') {
                    $query .= " DESC";
                } else {
                    $query .= " ASC";
                }
            }
        } else {
            $query .= " ORDER BY id " . $defaultSortingOrder . ' ';
        }

        if (isset($_REQUEST['paged'])) {
            $paged = (int)$_REQUEST['paged'];
        } else {
            $paged = 1;
        }

        $tablesPerPage = get_option('wdtTablesPerPage') ? get_option('wdtTablesPerPage') : 10;
        $query .= " LIMIT " . ($paged - 1) * $tablesPerPage . ", " . $tablesPerPage;
        $allTables = $wpdb->get_results($query, ARRAY_A);
        $allTables = apply_filters('wpdatatables_filter_browse_tables', $allTables);

        return $allTables;
    }

    /**
     * Prepares the list of items for displaying.
     * @uses WP_List_Table::set_pagination_args()
     *
     * @since 3.1.0
     * @access public
     * @abstract
     */
    function prepare_items() {
        $per_page = get_option('wdtTablesPerPage') ? get_option('wdtTablesPerPage') : 10;

        $columns = $this->get_columns();
        $hidden = array();
        $sortable = $this->get_sortable_columns();
        $this->_column_headers = array($columns, $hidden, $sortable);

        $this->set_pagination_args(
            array(
                'total_items' => $this->getTableCount(),
                'per_page' => $per_page
            )
        );

        $this->items = $this->getAllTables();
    }

    /**
     * Set default columns value
     * @param object $item
     * @param string $column_name
     * @return string
     */
    function column_default($item, $column_name) {
        switch ($column_name) {
            case 'shortcode':
                return '<a class="wdt-copy-shortcode-browse" data-toggle="tooltip" data-shortcode="[wpdatatable id=' . esc_attr($item['id']) . ']" data-placement="top"  title="' . esc_attr__('Click to copy shortcode', 'wpdatatables') . '"><i class="wpdt-icon-copy"></i></a><span class="wdt-shortcode">[wpdatatable id=' . (int)$item['id'] . ']</span>';
                break;
            case 'functions':
                $return_string = '';
                $simpleTableType = ($item['table_type'] == 'simple') ? '&simple' : '';
                $ivyTableType = ($item['table_type'] == 'ivyforms') ? '=ivyforms' : '';
                if (in_array($item['table_type'], WPDataTable::$allowedTableTypes)) {
                    $return_string = '<div class="wdt-function-flex"><a type="button" 
                                         class="wdt-duplicate-table" 
                                         data-table_id="' . esc_attr($item['id']) . '" 
                                         data-table_name="' . esc_attr($item['title']) . '" 
                                         data-table_type="' . esc_attr($item['table_type']) . '" 
                                         data-toggle="tooltip" title="' . esc_attr__('Duplicate', 'wpdatatables') . '" href="#"><i class="wpdt-icon-clone"></i></a>';

                    $return_string .= ' <a type="button" 
                                            class="wdt-configure" 
                                            data-table_id="' . esc_attr($item['id']) . '" 
                                            data-table_name="' . esc_attr($item['title']) . '" 
                                            data-toggle="tooltip" title="' . esc_attr__('Configure', 'wpdatatables') . '" 
                                            href="admin.php?page=wpdatatables-constructor&source' . $simpleTableType . $ivyTableType . '&table_id=' . (int)$item['id'] . '" ><i class="wpdt-icon-cog"></i></a>';
                }
                $return_string .= ' <a type="button" 
                                       class="wdt-submit-delete" 
                                       data-table_id="' . esc_attr($item['id']) . '" 
                                       data-table_name="' . esc_attr($item['title']) . '" 
                                       data-toggle="tooltip" title="' . esc_attr__('Delete', 'wpdatatables') . '" 
                                       href="' . wp_nonce_url('admin.php?page=wpdatatables-administration&action=delete&table_id=' . (int)$item['id'] . '', 'wdtDeleteTableNonce', 'wdtNonce') . '" rel="' . (int)$item['id'] . '"><i class="wpdt-icon-trash"></i></a></div>';
                return $return_string;
                break;
            case 'id':
            case 'title':
            default:
                return $item[$column_name];
                break;
        }
    }

    /**
     * Set columns title
     * @param $item
     * @return string
     */
    function column_title($item) {
        $simpleTableType = ($item['table_type'] == 'simple') ? '&simple' : '';
        $ivyTableType = ($item['table_type'] == 'ivyforms') ? '=ivyforms' : '';
        if (in_array($item['table_type'], WPDataTable::$allowedTableTypes)) {
//            $actions = array(
//                'edit' => '<a href="admin.php?page=wpdatatables-constructor&source&table_id=' . $item['id'] . '" title="' . __('Configure', 'wpdatatables') . '">' . __('Configure', 'wpdatatables') . '</a>',
//                'trash' => '<a class="wdt-submit-delete" title="' . __('Delete', 'wpdatatables') . '" href="' . wp_nonce_url('admin.php?page=wpdatatables-administration&action=delete&table_id=' . $item['id'] . '', 'wdtDeleteTableNonce', 'wdtNonce') . '" rel="' . $item['id'] . '">' . __('Delete', 'wpdatatables') . '</a>'
//            );

            return '<a href="admin.php?page=wpdatatables-constructor&source' . $simpleTableType . $ivyTableType . '&table_id=' . (int)$item['id'] . '">' . esc_html($item['title']) . '</a> ';
        } else {
            return esc_html($item['title']);
        }
    }

    /**
     * Set column type
     * @param $item
     * @return string
     */
    function column_table_type($item) {
        switch ($item['table_type']) {
            case 'mysql':
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('MySQL', 'wpdatatables') . '</span>';

            case 'manual':
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('Manual', 'wpdatatables') . '</span>';
            case 'xls':
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('Excel', 'wpdatatables') . '</span>';
            case 'csv':
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('CSV', 'wpdatatables') . '</span>';
            case 'xml':
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('XML', 'wpdatatables') . '</span>';
            case 'json':
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('JSON', 'wpdatatables') . '</span>';
	        case 'nested_json':
		        return '<span class="wpdt-type-column">' . esc_html__('Nested JSON', 'wpdatatables') . '</span>';
            case 'serialized':
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('Serialized PHP array', 'wpdatatables') . '</span>';
            case 'google_spreadsheet':
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('Google spreadsheet', 'wpdatatables') . '</span>';
            case 'simple':
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('Simple', 'wpdatatables') . '</span>';
            case 'ivyforms':
                if (!class_exists('IvyForms\\Services\\API\\IvyFormsAPI')) {
                    return '<span class="wpdt-type-column bgm-gray">' . esc_html__('Unknown', 'wpdatatables') . '</span>';
                }
                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('IvyForms', 'wpdatatables') . '</span>';
            default:
                if (in_array($item['table_type'], WPDataTable::$allowedTableTypes)) {
                    return '<span class="wpdt-type-column bgm-gray">' . ucfirst(esc_html($item['table_type'])) . '</span>';
                }

                return '<span class="wpdt-type-column bgm-gray">' . esc_html__('Unknown', 'wpdatatables') . '</span>';
        }
    }

    /**
     * Print column headers, accounting for hidden and sortable columns.
     *
     * @since 3.1.0
     * @access public
     *
     * @staticvar int $cb_counter
     *
     * @param bool $with_id Whether to set the id attribute or not
     */
    function print_column_headers($with_id = true) {
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

        if (!empty($columns['cb'])) {
            static $cb_counter = 1;
            $columns['cb'] = '<label class="screen-reader-text" for="cb-select-all-' . $cb_counter . '">' . esc_html__('Select All') . '</label>'
                . '<div class="checkbox"><input id="cb-select-all-' . $cb_counter . '" type="checkbox" /></i></div>';
            $cb_counter++;
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
     * @return array
     */
    function get_bulk_actions() {
        $actions = array(
            'delete' => 'Delete'
        );
        return $actions;
    }

    /**
     * @param object $item
     * @return string
     */
    function column_cb($item) {
        return sprintf(
            '<div class="checkbox"><input type="checkbox" name="table_id[]" value="%s" /></div>', $item['id']
        );
    }

    /**
     * Message to be displayed when there are no items
     *
     * @since 3.1.0
     * @access public
     */
    function no_items() {
        _e('No wpDataTables in the system yet.', 'wpdatatables');
    }

    /**
     * Display the table
     *
     * @since 3.1.0
     * @access public
     */
    function display() {
        $singular = $this->_args['singular'];

        $this->screen->render_screen_reader_content('heading_list');

        require_once(WDT_ROOT_PATH . '/templates/admin/browse/table_list.inc.php');
    }

    /**
     * Display the pagination.
     *
     * @since 3.1.0
     * @access protected
     *
     * @param string $which
     */
    protected function pagination($which) {
        if (empty($this->_pagination_args))
            return;

        $max = $this->_pagination_args['total_pages'];
        $paged = $this->get_pagenum();

        /** Stop execution if there's only 1 page */
        if ($max <= 1)
            return;

        $removable_query_args = wp_removable_query_args();
        $current_url = set_url_scheme('http://' . $_SERVER['HTTP_HOST'] . $_SERVER['REQUEST_URI']);
        $current_url = remove_query_arg($removable_query_args, $current_url);
        $search_term = '';
        if( isset($_REQUEST['s'] ) ){
            $search_term = sanitize_text_field($_REQUEST['s']);
            $current_url = add_query_arg( 's', $search_term, $current_url );
        }
        /**    Add current page to the array */
        if ($paged >= 1)
            $links[] = $paged;

        /**    Add the pages around the current page to the array */
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
     * Display the bulk actions dropdown.
     *
     * @since 3.1.0
     * @access protected
     *
     * @param string $which The location of the bulk actions: 'top' or 'bottom'.
     * This is designated as optional for backward compatibility.
     */
    function bulk_actions($which = '') {
        if (is_null($this->_actions)) {
            $no_new_actions = $this->_actions = $this->get_bulk_actions();
            /**
             * Filters the list table Bulk Actions drop-down.
             *
             * The dynamic portion of the hook name, `$this->screen->id`, refers
             * to the ID of the current screen, usually a string.
             *
             * This filter can currently only be used to remove bulk actions.
             *
             * @since 3.5.0
             *
             * @param array $actions An array of the available bulk actions.
             */
            $this->_actions = apply_filters("bulk_actions-{$this->screen->id}", $this->_actions);
            $this->_actions = array_intersect_assoc($this->_actions, $no_new_actions);
            $two = '';
        } else {
            $two = '2';
        }

        if (empty($this->_actions))
            return;

        require(WDT_ROOT_PATH . '/templates/admin/browse/bulk_actions.inc.php');
    }

    /**
     * Generate the table navigation above or below the table
     *
     * @since 3.1.0
     * @access protected
     * @param string $which
     */
    function display_tablenav($which) {
        if ('top' === $which) {
            wp_nonce_field('bulk-' . $this->_args['plural']);
        }

        require(WDT_ROOT_PATH . '/templates/admin/browse/table_navigation.inc.php');
    }

    /**
     * Displays the search box.
     *
     * @since 3.1.0
     * @access public
     *
     * @param string $text The 'submit' button label.
     * @param string $input_id ID attribute value for the search input field.
     */
    function search_box($text, $input_id) {
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
}
