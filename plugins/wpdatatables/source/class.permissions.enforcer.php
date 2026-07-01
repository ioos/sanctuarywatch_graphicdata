<?php
// Permissions enforcement helper class
if (!defined('ABSPATH')) die('Access denied.');


class WDTPermissionsEnforcer
{

    /**
     * Check if current user can view a specific table
     *
     * @param int $tableId The table ID to check
     * @return bool True if user can view, false otherwise
     */
    public static function canUserViewTable($tableId)
    {
        // If user is not logged in, show tables by default (public access)
        if (!is_user_logged_in()) {
            return true;
        }

        $userId = get_current_user_id();

        // Admins can always view
        if (current_user_can('manage_options')) {
            return true;
        }

        // Fetch table access metadata for this user. If there's no explicit
        // permission metadata, the user should be allowed to see tables by default.
        $userTableAccess = get_user_meta($userId, 'wpdt_table_access', true);

        // If no metadata or all_tables explicitly set, allow
        if (empty($userTableAccess) || (isset($userTableAccess['all_tables']) && $userTableAccess['all_tables'])) {
            return true;
        }

        // If user has an explicit list of allowed table IDs, allow only those
        if (isset($userTableAccess['table_ids']) && is_array($userTableAccess['table_ids'])) {
            return in_array($tableId, $userTableAccess['table_ids'], true);
        }

        return true;
    }

    /**
     * Check if current user can view a specific chart
     *
     * @param int $chartId The chart ID to check
     * @return bool True if user can view, false otherwise
     */
    public static function canUserViewChart($chartId)
    {
        // If user is not logged in, show charts by default (public access)
        if (!is_user_logged_in()) {
            return true;
        }

        $userId = get_current_user_id();

        // Admins can always view
        if (current_user_can('manage_options')) {
            return true;
        }

        // Fetch chart access metadata for this user. If no explicit metadata is
        // present, allow charts by default.
        $userChartAccess = get_user_meta($userId, 'wpdt_chart_access', true);

        if (empty($userChartAccess) || (isset($userChartAccess['all_charts']) && $userChartAccess['all_charts'])) {
            return true;
        }

        if (isset($userChartAccess['chart_ids']) && is_array($userChartAccess['chart_ids'])) {
            return in_array($chartId, $userChartAccess['chart_ids'], true);
        }

        // Default allow
        return true;
    }
}
