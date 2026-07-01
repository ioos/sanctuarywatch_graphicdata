(function ($) {

    /**
     * Change column type for a new column
     */
    $('.wdt-add-column-column-type').change(function (e) {
        var $addColumnBlock = $(this).closest('div.wdt-add-column-modal-block');
        var $possibleValuesInput = $addColumnBlock.find('.wdt-add-column-possible-values');
        var $possibleValuesBlock = $addColumnBlock.find('.wdt-add-column-possible-values-block');
        if ($(this).val() == 'select' || $(this).val() == 'multiselect') {
            $possibleValuesBlock.show();
            $('.wdt-add-column-possible-values').tagsinput({
                tagClass: 'label label-primary'
            });
            $addColumnBlock.find('.wdt-add-column-default-value').wdtBootstrapSelectPicker('destroy');
            $addColumnBlock.find('.wdt-add-column-default-value')
                .replaceWith('<select class="selectpicker wdt-add-column-default-value"></select>');
            if ($(this).val() == 'multiselect') {
                $addColumnBlock.find('.wdt-add-column-default-value').attr('multiple', 'multiple');
            } else {
                $addColumnBlock.find('.wdt-add-column-default-value').prepend('<option value=""></option>').removeAttr('multiple');
            }
            $addColumnBlock.find('.wdt-add-column-default-value').wdtBootstrapSelectPicker();

            if ($addColumnBlock.find('.wdt-add-column-possible-values').val() != '') {
                var possibleValues = $addColumnBlock.find('.wdt-add-column-possible-values').val().split(',');
                $.each(possibleValues, function (index, value) {
                    $addColumnBlock.find('select.wdt-add-column-default-value').append('<option value="' + value + '">' + value + '</option>');
                });
                $addColumnBlock.find('select.wdt-add-column-default-value').wdtBootstrapSelectPicker('refresh');
            }

            $possibleValuesInput.on('itemAdded', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $addColumnBlock.find('select.wdt-add-column-default-value').append('<option value="' + e.item + '">' + e.item + '</option>')
                    .wdtBootstrapSelectPicker('refresh');
            });

            $possibleValuesInput.on('itemRemoved', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                $addColumnBlock.find('.wdt-add-column-default-value option[value="' + e.item + '"]').remove();
                $addColumnBlock.find('.wdt-add-column-default-value').wdtBootstrapSelectPicker('refresh');
            });
        } else {
            $possibleValuesBlock.hide();
            $addColumnBlock.find('.wdt-add-column-default-value').wdtBootstrapSelectPicker('destroy');
            $addColumnBlock.find('.wdt-add-column-default-value')
                .replaceWith('<input type="text" class="form-control input-sm wdt-add-column-default-value" value="">');
            $addColumnBlock.find('.wdt-add-column-default-value')
                .attr('type', 'text');

            if ($.inArray($(this).val(), ['date', 'datetime', 'time']) != -1) {
                $addColumnBlock.find('.wdt-add-column-default-value')
                    .addClass('wdt-' + $(this).val() + 'picker');
            }

            if ($.inArray($(this).val(), ['int', 'float']) != -1) {
                $addColumnBlock.find('.wdt-add-column-default-value')
                    .attr('type', 'number');
            }
        }
    });

    $('#wdt-add-column-submit').click(function () {

        var $addColumnModal = $('.wdt-add-column-modal-block');

        if ($('div#wdt-add-column-modal #wdt-add-column-column-header').val() == '') {
            wdtNotify(wdtFrontendStrings.error, wdtFrontendStrings.columnHeaderEmpty, 'danger');
            return false;
        }

        var columnType = $addColumnModal.find('.wdt-add-column-column-type').wdtBootstrapSelectPicker('val');
        var defaultValue = $.inArray(columnType, ['select', 'multiselect']) != -1 ?
            $addColumnModal.find('.wdt-add-column-default-value').wdtBootstrapSelectPicker('val') :
            $addColumnModal.find('.wdt-add-column-default-value').val();
        if (defaultValue != null && columnType == 'multiselect') {
            defaultValue.join('|');
        }

        var newColumnData = {
            name: $('#wdt-add-column-column-header').val(),
            type: columnType,
            insert_after: $('.wdt-add-column-insert-after').wdtBootstrapSelectPicker('val'),
            possible_values: $addColumnModal.find('.wdt-add-column-possible-values').val().replace(/,/g, '|'),
            default_value: defaultValue,
            fill_default: $('#wdt-add-column-fill-with-default').is(':checked') ? 1 : 0
        };

        $('#wdt-add-column-modal').find('.wdt-preload-layer').animateFadeIn();

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'wpdatatables_add_new_manual_column',
                table_id: typeof $('table.wpDataTable').data('wpdatatable_id') !== 'undefined' ?
                    $('table.wpDataTable').data('wpdatatable_id') : $('.wpExcelTable').data('wpdatatable_id'),
                wdtNonce: $('#wdtNonceFrontendEdit').val(),
                column_data: newColumnData
            },
            success: function () {
                $('#wdt-add-column-modal').find('.wdt-preload-layer').animateFadeOut();
                wdtNotify(wdtFrontendStrings.success, wdtFrontendStrings.columnAdded, 'success');
                setTimeout(function () {
                    $('#wdt-add-column-modal').modal('hide');
                    window.location.reload(true);
                }, 1500);
            }
        });

    });

    /**
     * Remove a column
     */
    $('#wdt-remove-column-submit').click(function (e) {
        e.preventDefault();

        if ($('#wdt-remove-column-confirm').is(':checked') == false) {
            wdtNotify(wdtFrontendStrings.error, wdtFrontendStrings.columnRemoveConfirm, 'danger');
            return false;
        }

        $('#wdt-remove-column-modal').find('.wdt-preload-layer').animateFadeIn();

        $.ajax({
            url: ajaxurl,
            type: 'POST',
            data: {
                action: 'wpdatatables_delete_manual_column',
                table_id: typeof $('table.wpDataTable').data('wpdatatable_id') !== 'undefined' ?
                    $('table.wpDataTable').data('wpdatatable_id') : $('.wpExcelTable').data('wpdatatable_id'),
                wdtNonce: $('#wdtNonceFrontendEdit').val(),
                column_name: $('#wdtDeleteColumnSelect').val()
            },
            success: function () {
                $('#wdt-remove-column-modal').find('.wdt-preload-layer').animateFadeOut();
                wdtNotify(wdtFrontendStrings.success, wdtFrontendStrings.columnRemoved, 'success');
                setTimeout(function () {
                    $('#wdt-remove-column-modal').modal('hide');
                    window.location.reload(true);
                }, 1500);
            }
        });

    });

})(jQuery);
