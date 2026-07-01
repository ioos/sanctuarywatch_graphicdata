/**
 * Permissions Admin Page JavaScript
 */

(function ($) {
    'use strict';

    // Get current tab from URL
    function getCurrentTab() {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get('tab') || 'tables';
    }

    // Load managers data for the current tab
    function loadManagersData() {
        const tab = getCurrentTab();
        $.ajax({
            type: 'POST',
            url: wdtPermissions.ajax_url,
            data: (function () {
                var params = {
                    action: 'wpdatatables_load_permissions',
                    tab: tab,
                    nonce: wdtPermissions.nonce
                };
                // include current search term if present
                var $search = $('.wpdt-search-box input[name="s"]');
                if ($search.length) {
                    params.s = $search.val();
                } else {
                    var urlParams = new URLSearchParams(window.location.search);
                    if (urlParams.has('s')) params.s = urlParams.get('s');
                }
                // include optional ordering/paging to keep state
                var urlParams2 = new URLSearchParams(window.location.search);
                if (urlParams2.has('orderby')) params.orderby = urlParams2.get('orderby');
                if (urlParams2.has('order')) params.order = urlParams2.get('order');
                if (urlParams2.has('paged')) params.paged = urlParams2.get('paged');
                return params;
            })(),
            success: function (response) {
                if (response.success) {
                    // Insert returned rows into the table body. target the-list tbody used by templates
                    $('#the-list').html(response.data.html);
                    bindRowActions();
                } else {
                    $('#the-list').html(
                        '<tr><td colspan="7" style="text-align: center; padding: 24px; color: red;">' +
                        'Error loading permissions: ' + response.data.message +
                        '</td></tr>'
                    );
                }
            },
            error: function () {
                $('#the-list').html(
                    '<tr><td colspan="7" style="text-align: center; padding: 24px; color: red;">' +
                    'Error loading permissions.' +
                    '</td></tr>'
                );
            }
        });
    }

    // Bind edit and delete actions
    function bindRowActions() {

        $(document).on('click', '.wdt-edit-permission', function (e) {
            e.preventDefault();
            const userId = $(this).data('id');
            editPermission(userId);
        });

        $(document).on('click', '.wdt-delete-permission', function (e) {
            e.preventDefault();
            const userId = $(this).data('id');
            // Open custom modal for delete confirmation
            $('#wdt-delete-permission-modal').data('user-id', userId);
            $('#wdt-delete-permission-modal').modal('show');
        });

        // Initialize sorting
        initTableSorting();
    }

    // Initialize table column sorting
    function initTableSorting() {
        $('.wdt-permissions-table thead th.sortable, .wdt-permissions-table thead th.sorted').off('click').on('click', function (e) {
            e.preventDefault();
            const $th = $(this);
            const columnIndex = $th.index();
            const isAsc = $th.hasClass('asc');

            // Remove sorted classes from all headers
            $('.wdt-permissions-table thead th').removeClass('sorted asc desc');

            // Add sorted class and direction to clicked header
            $th.addClass('sorted');
            if (isAsc) {
                $th.removeClass('asc').addClass('desc');
            } else {
                $th.removeClass('desc').addClass('asc');
            }

            // Sort the table rows
            sortTable(columnIndex, !isAsc);
        });
    }

    // Sort table by column
    function sortTable(columnIndex, ascending) {
        const $tbody = $('.wdt-permissions-table tbody');
        const rows = $tbody.find('tr').toArray();

        rows.sort(function (a, b) {
            const aValue = $(a).find('td').eq(columnIndex).text().trim();
            const bValue = $(b).find('td').eq(columnIndex).text().trim();

            // Check if values are numbers
            const aNum = parseFloat(aValue);
            const bNum = parseFloat(bValue);

            if (!isNaN(aNum) && !isNaN(bNum)) {
                return ascending ? aNum - bNum : bNum - aNum;
            }

            // String comparison
            if (ascending) {
                return aValue.localeCompare(bValue);
            } else {
                return bValue.localeCompare(aValue);
            }
        });

        $tbody.html(rows);
    }

    // Edit permission
    function editPermission(userId) {
        const tab = getCurrentTab();

        // Load permission data via AJAX
        $.ajax({
            type: 'POST',
            url: wdtPermissions.ajax_url,
            data: {
                action: 'wpdatatables_get_permission',
                user_id: userId,
                tab: tab,
                nonce: wdtPermissions.nonce
            },
            success: function (response) {
                if (response.success) {
                    const perm = response.data;

                    if (tab === 'charts') {
                        $('#wdt-chart-manager-modal-title').text('Edit Chart Manager');
                        $('#wdt-chart-user-select').val(perm.user_id).selectpicker('refresh');
                        $('#wdt-chart-perm-view').prop('checked', perm.has_capability);

                        if (perm.all_items) {
                            $('#wdt-enable-specific-charts').prop('checked', false);
                            $('#wdt-specific-charts-container').hide();
                        } else {
                            $('#wdt-enable-specific-charts').prop('checked', true);
                            $('#wdt-specific-charts-container').show();
                            $('#wdt-chart-items-select').val(perm.item_ids).selectpicker('refresh');
                        }

                        $('#wdt-chart-manager-modal').data('user-id', userId);
                        $('#wdt-chart-manager-modal').modal('show');
                    } else {
                        $('#wdt-table-manager-modal-title').text('Edit Table Manager');
                        $('#wdt-table-user-select').val(perm.user_id).selectpicker('refresh');
                        $('#wdt-table-perm-view').prop('checked', perm.has_capability);

                        if (perm.all_items) {
                            $('#wdt-enable-specific-tables').prop('checked', false);
                            $('#wdt-specific-tables-container').hide();
                        } else {
                            $('#wdt-enable-specific-tables').prop('checked', true);
                            $('#wdt-specific-tables-container').show();
                            $('#wdt-table-items-select').val(perm.item_ids).selectpicker('refresh');
                        }

                        $('#wdt-table-manager-modal').data('user-id', userId);
                        $('#wdt-table-manager-modal').modal('show');
                    }
                }
            }
        });
    }

    // Confirm delete permission
    function confirmDeletePermission() {
        const userId = $('#wdt-delete-permission-modal').data('user-id');
        const tab = getCurrentTab();

        $.ajax({
            type: 'POST',
            url: wdtPermissions.ajax_url,
            data: {
                action: 'wpdatatables_delete_permission',
                user_id: userId,
                tab: tab,
                nonce: wdtPermissions.nonce
            },
            success: function (response) {
                $('#wdt-delete-permission-modal').modal('hide');
                if (response.success) {
                    loadManagersData();
                } else {
                    // Show error inline in the modal footer
                    $('#wdt-delete-permission-modal .form-general-error').text('Error deleting permission: ' + response.data.message).show();
                }
            },
            error: function () {
                $('#wdt-delete-permission-modal .form-general-error').text('Error deleting permission.').show();
            }
        });
    }

    // Open Add Manager modal
    function openAddManagerModal() {
        const tab = getCurrentTab();
        // Reset modal
        resetModal(tab);

        if (tab === 'charts') {
            $('#wdt-chart-manager-modal-title').text('Add Chart Manager');
            $('#wdt-chart-manager-modal').modal('show');
        } else {
            $('#wdt-table-manager-modal-title').text('Add Table Manager');
            $('#wdt-table-manager-modal').modal('show');
        }
    }

    // Reset modal fields
    function resetModal(tab) {
        if (tab === 'charts') {
            $('#wdt-chart-user-select').val('').selectpicker('refresh');
            $('#wdt-chart-user-error').hide();
            $('#wdt-chart-perm-view').prop('checked', true);
            $('#wdt-enable-specific-charts').prop('checked', false);
            $('#wdt-specific-charts-container').hide();
            $('#wdt-chart-items-select').val([]).selectpicker('refresh');
            $('#wdt-chart-manager-modal').removeData('user-id');
        } else {
            $('#wdt-table-user-select').val('').selectpicker('refresh');
            $('#wdt-table-user-error').hide();
            $('#wdt-table-perm-view').prop('checked', true);
            $('#wdt-enable-specific-tables').prop('checked', false);
            $('#wdt-specific-tables-container').hide();
            $('#wdt-table-items-select').val([]).selectpicker('refresh');
            $('#wdt-table-manager-modal').removeData('user-id');
        }
    }

    // Save table manager
    function saveTableManager() {
        const userId = $('#wdt-table-user-select').val();
        if (!userId) {
            $('#wdt-table-user-error').show();
            return;
        }
        $('#wdt-table-user-error').hide();

        // Permissions validation - checkbox should be checked to grant capability
        if (!$('#wdt-table-perm-view').is(':checked')) {
            $('.permissions-error').text('Please grant at least one capability.').show();
            return;
        } else {
            $('.permissions-error').hide();
        }

        const enableSpecific = $('#wdt-enable-specific-tables').is(':checked') ? 1 : 0;
        const itemIds = enableSpecific ? $('#wdt-table-items-select').val() || [] : [];
        const userId_data = $('#wdt-table-manager-modal').data('user-id');

        $.ajax({
            type: 'POST',
            url: wdtPermissions.ajax_url,
            data: {
                action: userId_data ? 'wpdatatables_update_permission' : 'wpdatatables_save_permission',
                user_id: userId,
                tab: 'tables',
                enable_specific: enableSpecific,
                item_ids: itemIds,
                nonce: wdtPermissions.nonce
            },
            success: function (response) {
                if (response.success) {
                    $('#wdt-table-manager-modal').modal('hide');
                    loadManagersData();
                } else {
                    $('#wdt-table-manager-modal .form-general-error').text('Error saving permission: ' + response.data.message).show();
                }
            },
            error: function () {
                $('#wdt-table-manager-modal .form-general-error').text('Error saving permission.').show();
            }
        });
    }

    // Save chart manager
    function saveChartManager() {
        const userId = $('#wdt-chart-user-select').val();
        if (!userId) {
            $('#wdt-chart-user-error').show();
            return;
        }
        $('#wdt-chart-user-error').hide();

        // Permissions validation
        if (!$('#wdt-chart-perm-view').is(':checked')) {
            $('.permissions-error').text('Please grant at least one capability.').show();
            return;
        } else {
            $('.permissions-error').hide();
        }

        const enableSpecific = $('#wdt-enable-specific-charts').is(':checked') ? 1 : 0;
        const itemIds = enableSpecific ? $('#wdt-chart-items-select').val() || [] : [];
        const userId_data = $('#wdt-chart-manager-modal').data('user-id');

        $.ajax({
            type: 'POST',
            url: wdtPermissions.ajax_url,
            data: {
                action: userId_data ? 'wpdatatables_update_permission' : 'wpdatatables_save_permission',
                user_id: userId,
                tab: 'charts',
                enable_specific: enableSpecific,
                item_ids: itemIds,
                nonce: wdtPermissions.nonce
            },
            success: function (response) {
                if (response.success) {
                    $('#wdt-chart-manager-modal').modal('hide');
                    loadManagersData();
                } else {
                    $('#wdt-chart-manager-modal .form-general-error').text('Error saving permission: ' + response.data.message).show();
                }
            },
            error: function () {
                $('#wdt-chart-manager-modal .form-general-error').text('Error saving permission.').show();
            }
        });
    }

    // Initialize on document ready
    $(document).ready(function () {
        // Load initial data
        loadManagersData();

        var doSearch = function () {
            loadManagersData();
        };
        var debounceFn = null;
        if (typeof _ !== 'undefined' && typeof _.debounce === 'function') {
            debounceFn = _.debounce(doSearch, 800);
        } else {
            (function () {
                var timer = null;
                debounceFn = function () {
                    clearTimeout(timer);
                    timer = setTimeout(doSearch, 800);
                };
            })();
        }

        // Use the Browse input id pattern to match template
        $(document).on('keyup input', 'input#search_id-search-input, .wpdt-search-box input[name="s"]', function () {
            debounceFn();
        });

        // Search button click should trigger search as well
        $(document).on('click', '#search-submit', function (e) {
            e.preventDefault();
            loadManagersData();
        });

        // Handle Add Manager button click
        $('#wdt-add-manager-btn').on('click', function (e) {
            e.preventDefault();
            openAddManagerModal();
        });

        // Modal close buttons for table modal
        $('#wdt-table-modal-close, #wdt-table-modal-cancel').on('click', function (e) {
            e.preventDefault();
            $('#wdt-table-manager-modal').modal('hide');
        });
        // Modal close buttons for chart modal
        $('#wdt-chart-modal-close, #wdt-chart-modal-cancel').on('click', function (e) {
            e.preventDefault();
            $('#wdt-chart-manager-modal').modal('hide');
        });

        $('#wdt-edit-modal-close, #wdt-edit-modal-cancel').on('click', function (e) {
            e.preventDefault();
            $('#wdt-table-manager-modal, #wdt-chart-manager-modal').modal('hide');
        });

        // Close modal when clicking outside
        $(window).on('click', function (e) {
            if (e.target.id === 'wdt-table-manager-modal') {
                $('#wdt-table-manager-modal').modal('hide');
            }
            if (e.target.id === 'wdt-chart-manager-modal') {
                $('#wdt-chart-manager-modal').modal('hide');
            }
        });

        // Toggle specific tables container for table modal
        $('#wdt-enable-specific-tables').on('change', function () {
            if ($(this).is(':checked')) {
                $('#wdt-specific-tables-container').slideDown();
            } else {
                $('#wdt-specific-tables-container').slideUp();
            }
        });
        // Toggle specific charts container for chart modal
        $('#wdt-enable-specific-charts').on('change', function () {
            if ($(this).is(':checked')) {
                $('#wdt-specific-charts-container').slideDown();
            } else {
                $('#wdt-specific-charts-container').slideUp();
            }
        });

        // Update label based on tab
        const tab = getCurrentTab();
        const label = tab === 'tables' ? 'Select Tables' : 'Select Charts';
        $('#wdt-items-label').text(label);
        $('#wdt-edit-items-label').text(label);

        // Save buttons
        $('#wdt-table-manager-submit').on('click', function (e) {
            e.preventDefault();
            saveTableManager();
        });

        $('#wdt-chart-manager-submit').on('click', function (e) {
            e.preventDefault();
            saveChartManager();
        });

        // Delete confirmation
        $('#wdt-confirm-delete-permission').on('click', function (e) {
            e.preventDefault();
            confirmDeletePermission();
        });

        // Handle tab switching
        $('.tab-nav a').on('click', function (e) {
            const href = $(this).attr('href');
            window.location.href = href;
        });
    });

})(jQuery);

