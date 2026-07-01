(function ($) {
    $(function () {

        var applyButtonEvent = typeof $('.wdt-apply').data('events') !== 'undefined' ? $('.wdt-apply').data('events').click[1] : null;

        /**
         * Check if IvyForms container has alerts (indicating not installed or integration disabled)
         */
        function isIvyFormsReady() {
            return $('#wdt-ivyforms-form-container').find('.alert').length === 0;
        }

        /**
         * Handle table type change
         * Show/hide Ivy Forms related fields
         */
        $('#wdt-table-type').change(function () {
            if ($(this).val() === 'ivyforms') {
                $('#wdt-ivyforms-form-container').animateFadeIn();
                wpdatatable_config.server_side = 0;

                // Only bind the save handler if IvyForms is ready
                if (isIvyFormsReady()) {
                    $('.wdt-apply').off('click').click(function (e) {
                        e.preventDefault();
                        e.stopImmediatePropagation();
                        saveTableConfig();
                    });
                } else {
                    // Disable apply button if IvyForms is not ready
                    $('.wdt-apply').prop('disabled', true);
                }
            } else {
                $('#wdt-ivyforms-form-container').addClass('hidden');
                $('#wdt-ivyforms-form-picker').selectpicker('val', '');
                $('#wdt-ivyforms-form-column-picker').selectpicker('val', '');
                $('#wdt-ivyforms-column-container').addClass('hidden');
                if ($(this).val() !== 'forminator' && $(this).val() !== 'gravity' && $(this).val() !== 'formidable' && $(this).val() !== 'airtable') {
                    $('.wdt-apply').off().bind('click', applyButtonEvent);
                }
            }
            wpdatatable_config.content = '';
            $('.wdt-apply').prop('disabled', true);
        });

        /**
         * Handle form selection change
         * Fetch fields via AJAX and display them
         */
        $('#wdt-ivyforms-form-picker').change(function () {
            // Skip if IvyForms is not ready
            if (!isIvyFormsReady()) {
                return;
            }

            var formId = $(this).val();
            var $selectpicker = $('#wdt-ivyforms-form-column-picker');
            var $container = $('#wdt-ivyforms-column-container');

            $selectpicker.empty();

            if (formId !== '') {
                // Set the form ID in the config object
                window.ivyformsTableConfig.setFormId(formId);

                $.post(ajaxurl, {
                    action: 'wpdatatables_get_ivy_forms_form_fields',
                    form_id: formId
                }, function (response) {
                    if (response.success && response.data) {
                        var options = '';

                        // Add form fields
                        if (response.data.fields && response.data.fields.length > 0) {
                            options += '<optgroup id="wdt-ivyforms-form-fields" label="Form Fields">';
                            response.data.fields.forEach(function(field) {
                                options += '<option value="' + field.id + '">' + field.label + '</option>';
                            });
                            options += '</optgroup>';
                        }

                        // Add entry metadata columns
                        if (response.data.entry_data && response.data.entry_data.length > 0) {
                            options += '<optgroup id="wdt-ivyforms-entry-fields" label="Entry Data">';
                            response.data.entry_data.forEach(function(entry) {
                                options += '<option value="' + entry.id + '">' + entry.label + '</option>';
                            });
                            options += '</optgroup>';
                        }

                        $selectpicker.html(options);
                        $selectpicker.selectpicker('refresh');
                        $selectpicker.closest('.form-group').show();

                        if (!$container.is(':visible')) {
                            $container.animateFadeIn();
                        }

                        // If editing existing table, select previously chosen fields
                        if (typeof wpdatatable_init_config !== 'undefined' && wpdatatable_init_config.table_type === 'ivyforms') {
                            var content = JSON.parse(wpdatatable_init_config.content);
                            if (content.fieldIds && content.fieldIds.length > 0) {
                                $selectpicker.selectpicker('val', content.fieldIds);
                                window.ivyformsTableConfig.setFields(content.fieldIds);
                                $selectpicker.trigger('change');
                            }
                        }
                    } else {
                        $selectpicker.html('');
                        $selectpicker.selectpicker('refresh');
                        $selectpicker.closest('.form-group').hide();
                        $container.animateFadeOut();
                    }
                }).fail(function() {
                    wdtNotify(
                        wpdatatables_edit_strings.error,
                        wpdatatables_edit_strings.failedToLoadFormFields,
                        'danger'
                    );
                    $selectpicker.html('');
                    $selectpicker.selectpicker('refresh');
                    $selectpicker.closest('.form-group').hide();
                    $container.animateFadeOut();
                });
            } else {
                $selectpicker.html('');
                $selectpicker.selectpicker('refresh');
                $selectpicker.closest('.form-group').hide();
                $container.animateFadeOut();
            }
        });

        /**
         * Handle column selection change
         * Enable/disable apply button and show/hide configuration tabs
         */
        $('#wdt-ivyforms-form-column-picker').on('change', function () {
            if ($(this).val().length) {
                $('.wdt-apply').prop('disabled', false);
                window.ivyformsTableConfig.setFields($(this).val());

                // Show configuration tabs
                if (!$('.display-settings-tab').is(':visible')) {
                    $('.display-settings-tab').animateFadeIn();
                    $('.table-sorting-filtering-settings-tab').animateFadeIn();
                    $('.table-tools-settings-tab').animateFadeIn();
                    $('.customize-table-settings-tab').animateFadeIn();
                    $('.placeholders-settings-tab').animateFadeIn();
                    $('.ivyforms-settings-tab').animateFadeIn();
                    $('.advanced-table-settings-tab').animateFadeIn();
                    $('.master-detail-settings-tab').animateFadeIn();
                }
            } else {
                $('.wdt-apply').prop('disabled', true);

                // Hide configuration tabs
                $('.display-settings-tab').animateFadeOut();
                $('.table-sorting-filtering-settings-tab').animateFadeOut();
                $('.table-tools-settings-tab').animateFadeOut();
                $('.customize-table-settings-tab').animateFadeOut();
                $('.placeholders-settings-tab').animateFadeOut();
                $('.ivyforms-settings-tab').animateFadeOut();
                $('.advanced-table-settings-tab').animateFadeOut();
                $('.master-detail-settings-tab').animateFadeOut();
            }
        });

        /**
         * Filter by date - From date
         */
        $('#wdt-ivyforms-date-filter-from').on('change dp.change', function () {
            window.ivyformsTableConfig.setDateFrom($(this).val());
        });

        /**
         * Filter by date - To date
         */
        $('#wdt-ivyforms-date-filter-to').on('change dp.change', function () {
            window.ivyformsTableConfig.setDateTo($(this).val());
        });

        /**
         * Filter by user
         */
        $('#wdt-ivyforms-filter-by-user').on('input change', function () {
            var userId = parseInt($(this).val()) || null;
            window.ivyformsTableConfig.setFilterByUser(userId);
        });

        /**
         * Filter by starred entries
         */
        $('#wdt-ivyforms-filter-by-starred').on('change', function () {
            var starred = $(this).is(':checked');
            window.ivyformsTableConfig.setFilterByStarred(starred);
        });

        /**
         * Filter by read/unread status
         */
        $('#wdt-ivyforms-filter-by-read').on('change', function () {
            var status = $(this).val();
            window.ivyformsTableConfig.setFilterByRead(status);
        });

        /**
         * Initialize date pickers
         */
        if ($.fn.datepicker) {
            $('#wdt-ivyforms-date-filter-from, #wdt-ivyforms-date-filter-to').datepicker({
                format: 'yyyy-mm-dd',
                autoclose: true,
                todayHighlight: true
            });

            // Set min/max dates
            $('#wdt-ivyforms-date-filter-from').on('changeDate', function (e) {
                $('#wdt-ivyforms-date-filter-to').datepicker('setStartDate', e.date);
            });

            $('#wdt-ivyforms-date-filter-to').on('changeDate', function (e) {
                $('#wdt-ivyforms-date-filter-from').datepicker('setEndDate', e.date);
            });
        }

        /**
         * Load the table for editing
         */
        if (typeof wpdatatable_init_config !== 'undefined' && wpdatatable_init_config.table_type === 'ivyforms') {
            $('#wdt-ivyforms-form-container').animateFadeIn();
            $('.ivyforms-settings-tab').animateFadeIn();
            $('.placeholders-settings-tab').animateFadeIn();

            initIvyFormsFromJSON(wpdatatable_init_config);

            $('.wdt-apply').off('click').click(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                saveTableConfig();
            });
        }

        // IvyForms auto-select and disable logic
        var urlParams = new URLSearchParams(window.location.search);
        var source = urlParams.get('source');
        var $tableTypePicker = $('#wdt-table-type');
        if ((source === 'ivyforms') || (typeof wpdatatable_init_config !== 'undefined' && wpdatatable_init_config.table_type === 'ivyforms')) {
            if ($tableTypePicker.length && $tableTypePicker.find('option[value="ivyforms"]').length) {
                $tableTypePicker.val('ivyforms').prop('disabled', true).selectpicker('refresh').trigger('change');
            }
        }

    });

    /**
     * Save Ivyforms based wpDataTable config to DB and preview the wpDataTable
     */
    function saveTableConfig() {
        if ($('#wdt-ivyforms-form-picker').val() && $('#wdt-ivyforms-form-column-picker').val()) {
            $('.wdt-preload-layer').animateFadeIn();

            $.ajax({
                url: ajaxurl,
                data: {
                    action: 'wpdatatables_save_ivyforms_table_config',
                    ivyforms: JSON.stringify(window.ivyformsTableConfig.getConfig()),
                    nonce: $('#wdtNonce').val(),
                    table: JSON.stringify(wpdatatable_config.getJSON())
                },
                dataType: 'json',
                method: 'POST',
                success: function (data) {
                    $('.wdt-preload-layer').animateFadeOut();

                    if (data.error) {
                        // Show error message
                        $('#wdt-error-modal .modal-body').html(data.error);
                        $('#wdt-error-modal').modal('show');
                    } else if (data.table) {
                        // Reinitialize table with returned data
                        wpdatatable_config.initFromJSON(data.table);
                        wpdatatable_config.setTableHtml(data.wdtHtml);
                        wpdatatable_config.setDataTableConfig(data.wdtJsonConfig);
                        wpdatatable_config.renderTable();

                        // Show success message
                        wdtNotify(
                            wpdatatables_edit_strings.success,
                            wpdatatables_edit_strings.tableSaved,
                            'success'
                        );

                        // Update URL with table_id if this is a new table
                        if (window.location.href.indexOf("table_id=") === -1 && data.table.id) {
                            window.history.replaceState(null, null, window.location.pathname + "?page=wpdatatables-constructor&source=ivyforms&table_id=" + data.table.id);
                        }

                        // Remove disable from "Apply" button
                        $('.wdt-apply').prop('disabled', false);
                    } else {
                        // Unknown response format
                        wdtNotify(
                            wpdatatables_edit_strings.error,
                            wpdatatables_edit_strings.invalidResponseServer,
                            'danger'
                        );
                    }
                },
                error: function (xhr, status, error) {
                    $('.wdt-preload-layer').animateFadeOut();

                    var errorMessage = 'An error occurred while saving the table.';
                    if (xhr.responseJSON && xhr.responseJSON.error) {
                        errorMessage = xhr.responseJSON.error;
                    } else if (xhr.responseText) {
                        try {
                            var response = JSON.parse(xhr.responseText);
                            if (response.error) {
                                errorMessage = response.error;
                            }
                        } catch (e) {
                            // Keep default error message
                        }
                    }

                    wdtNotify(
                        wpdatatables_edit_strings.error,
                        errorMessage,
                        'danger'
                    );
                }
            });
        } else {
            wdtNotify(
                'Validation Error',
                'Please select a form and at least one field.',
                'warning'
            );
        }
    }

    /**
     * Initializes IvyForms config from JSON for edit table
     * @param tableJSON
     */
    function initIvyFormsFromJSON(tableJSON) {
        // Fill "Choose an Ivy Form" dropdown and trigger change
        var content = JSON.parse(tableJSON.content);
        $('#wdt-ivyforms-form-picker').selectpicker('val', content.formId).change();

        wpdatatable_config.setServerSide(tableJSON.server_side);

        // Load Ivyforms filter settings if they exist
        if (tableJSON.advanced_settings) {
            var advancedSettings = JSON.parse(tableJSON.advanced_settings);

            if (advancedSettings.ivyforms) {
                var ivyformsData = advancedSettings.ivyforms;

                // Date filtering
                if (ivyformsData.dateFrom) {
                    $('#wdt-ivyforms-date-filter-from').val(ivyformsData.dateFrom);
                    window.ivyformsTableConfig.setDateFrom(ivyformsData.dateFrom);
                }

                if (ivyformsData.dateTo) {
                    $('#wdt-ivyforms-date-filter-to').val(ivyformsData.dateTo);
                    window.ivyformsTableConfig.setDateTo(ivyformsData.dateTo);
                }

                // User filtering
                if (ivyformsData.filterByUser) {
                    $('#wdt-ivyforms-filter-by-user').val(ivyformsData.filterByUser);
                    window.ivyformsTableConfig.setFilterByUser(ivyformsData.filterByUser);
                }

                // Starred filtering
                if (ivyformsData.filterByStarred) {
                    $('#wdt-ivyforms-filter-by-starred').prop('checked', true);
                    window.ivyformsTableConfig.setFilterByStarred(true);
                }

                // Read status filtering
                if (ivyformsData.filterByRead) {
                    $('#wdt-ivyforms-filter-by-read').selectpicker('val', ivyformsData.filterByRead);
                    window.ivyformsTableConfig.setFilterByRead(ivyformsData.filterByRead);
                }
            }
        }
    }

    $('#ivyforms-one-click-install').on('click', function(e) {
        e.preventDefault();
        var status = document.getElementById('ivyforms-install-status');
        status.innerHTML = 'Installing...';

        var nonce = document.getElementById('ivyforms-install-nonce').value;

        fetch(ajaxurl, {
            method: 'POST',
            credentials: 'same-origin',
            headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
            body: 'action=ivyforms_one_click_install&nonce=' + nonce
        })
            .then(response => response.json())
            .then(data => {
                if (data.success) {
                    status.innerHTML = 'IvyForms installed and activated!';
                } else {
                    status.innerHTML = 'Error: ' + data.data;
                }
            });
    });

})(jQuery);
