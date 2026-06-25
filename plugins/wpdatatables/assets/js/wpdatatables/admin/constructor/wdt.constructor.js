var constructedTableData = {
    name: '',
    method: '',
    table_description: '',
    columnCount: 0,
    columns: []
};



(function ($) {

    var wdtNonce = $('#wdtNonce').val();
    var customUploader;
    var nextStepButton = $('#wdt-constructor-next-step');
    var previousStepButton = $('#wdt-constructor-previous-step');

    

    $('.wdt-constructor-type-selecter-block .card:not([data-toggle="html-premium-popover"])').on('click', function () {
        $('.wdt-constructor-type-selecter-block .card').removeClass('selected').addClass('not-selected');
        $(this).addClass('selected').removeClass('not-selected');
        nextStepButton.prop('disabled', false);
    });

    /**
     * Next step handler
     */
    nextStepButton.click(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();

        var $curStepBlock = $('div.wdt-constructor-step:visible:eq(0)');
        var curStep = $curStepBlock.data('step');

        switch (curStep) {
            case 1:
                $curStepBlock.hide();
                previousStepButton.prop('disabled', false);
                var inputMethod = $('.wdt-constructor-type-selecter-block .card.selected').data('value');
                constructedTableData.method = inputMethod;
                switch (inputMethod) {
                    case 'simple':
                        $('div.wdt-constructor-step[data-step="1-0"]').animateFadeIn();
                        nextStepButton.hide();
                        previousStepButton.prop('disabled', false);
                        previousStepButton.hide();
                        $('.wdt-constructor-create-custom-buttons').show();
                        break;
                    case 'ivyforms':
                        $('.wdt-preload-layer').animateFadeIn();
                        window.location.replace(window.location.pathname + '?page=wpdatatables-constructor&source=ivyforms');
                        break;
                    case 'source':
                    default:
                        $('.wdt-preload-layer').animateFadeIn();
                        window.location.replace(window.location.pathname + '?page=wpdatatables-constructor&source');
                        break;
                }
                break;

            
        }
    });

    /**
     * Change table name for Simple table
     */
    $('#wdt-constructor-simple-table-name').change(function (e) {
        e.preventDefault();
        constructedTableData.name = $(this).val();
    });
    /**
     * Change table description for Simple table
     */
    $('#wdt-constructor-simple-table-description').change(function (e) {
        e.preventDefault();
        constructedTableData.table_description = $(this).val();
    });

    /**
     * Handler which creates the table
     */
    $('#wdt-simple-table-constructor').click(function (e) {
        e.preventDefault();
        $('.wdt-preload-layer').animateFadeIn();
        if (constructedTableData.method == 'simple'){

            var columns = $('#wdt-simple-table-number-of-columns').val(),
                rows = $('#wdt-simple-table-number-of-rows').val(),
                wdtNonce = $('#wdtNonce').val();

            if (columns == "" || columns == 0) {
                wdtNotify(wpdatatables_edit_strings.error, wpdatatables_edit_strings.numberOfColumnsError, 'danger');
                $('.wdt-preload-layer').animateFadeOut();
                return;
            }

            if ( rows == "" || rows == 0) {
                wdtNotify(wpdatatables_edit_strings.error, wpdatatables_edit_strings.numberOfRowsError, 'danger');
                $('.wdt-preload-layer').animateFadeOut();
                return;
            }

            var colWidths = Array(parseInt(columns)).fill(null).map((u, i) => i)

            $('#wdt-constructor-simple-table-name').change();
            $('#wdt-constructor-simple-table-description').change();

            constructedTableData.title = constructedTableData.name;
            constructedTableData.table_type = constructedTableData.method;
            constructedTableData.content = {};
            constructedTableData.content.rowNumber = parseInt(rows);
            constructedTableData.content.colNumber = parseInt(columns);
            constructedTableData.content.colHeaders = [];
            constructedTableData.content.mergedCells = [];
            constructedTableData.content.reloadCounter = 0;
            constructedTableData.content.colWidths = colWidths.fill(100,0,parseInt(columns));
            constructedTableData.advanced_settings = {};
            constructedTableData.advanced_settings.table_description = constructedTableData.table_description;

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'wpdatatables_create_simple_table',
                    tableData: JSON.stringify(constructedTableData),
                    templateId : 0,
                    wdtNonce: wdtNonce
                },
                success: function (link) {
                    window.location = link;
                },
                error: function (data) {
                    $('#wdt-error-modal .modal-body').html('There was an error while trying to generate the table! ' + data.statusText + ' ' + data.responseText);
                    $('#wdt-error-modal').modal('show');
                    $('.wdt-preload-layer').animateFadeOut();
                }
            })

        }

    });
    $('.wdt-simple-table-template').hover(function (e) {
        $('.wdt-simple-table-template').removeClass('selected')
        $(this).addClass('selected')
    });
    $('.wdt-simple-table-template .wdt-simple-table-constructor').click(function (e) {
        e.preventDefault();
        $('.wdt-preload-layer').animateFadeIn();
        if (constructedTableData.method == 'simple'){

            $('#wdt-constructor-simple-table-name').change();
            $('#wdt-constructor-simple-table-description').change();

            constructedTableData.advanced_settings = {};
            constructedTableData.advanced_settings.table_description = constructedTableData.table_description;
            constructedTableData.content = {};
            constructedTableData.title = constructedTableData.name;
            constructedTableData.table_type = constructedTableData.method;
            constructedTableData.templateId = $(this).parent().parent().data('template_id')

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'wpdatatables_create_simple_table',
                    tableData: JSON.stringify(constructedTableData),
                    templateId: constructedTableData.templateId,
                    wdtNonce: wdtNonce
                },
                success: function (link) {
                    window.location = link;
                },
                error: function (data) {
                    $('#wdt-error-modal .modal-body').html('There was an error while trying to generate the table! ' + data.statusText + ' ' + data.responseText);
                    $('#wdt-error-modal').modal('show');
                    $('.wdt-preload-layer').animateFadeOut();
                }
            })

        }

    });
    

})(jQuery);
