/** New JS controller for wpDataTables **/

var wpDataTables = {};
var wpDataTablesSelRows = {};
var wpDataTablesFunctions = {};
var wpDataTablesUpdatingFlags = {};
var wpDataTablesResponsiveHelpers = {};
var wdtBreakpointDefinition = {
    tablet: 1024,
    phone: 480
};
var wdtCustomUploader = null;

var wdtRenderDataTable = null;

(function ($) {
    $(function () {

        /**
         * Helper function to render a DataTable
         *
         * @param $table jQuery link to the container table object
         * @param tableDescription JSON with the table description
         */
        wdtRenderDataTable = function ($table, tableDescription) {

            // Parse the DataTable init options
            var dataTableOptions = tableDescription.dataTableParams;

            /**
             * Responsive-mode related stuff
             */
            if (tableDescription.responsive) {
                wpDataTablesResponsiveHelpers[tableDescription.tableId] = false;
                dataTableOptions.preDrawCallback = function () {
                    if (!wpDataTablesResponsiveHelpers[tableDescription.tableId]) {
                        if (typeof tableDescription.mobileWidth !== 'undefined') {
                            wdtBreakpointDefinition.phone = parseInt(tableDescription.mobileWidth);
                        }
                        if (typeof tableDescription.tabletWidth !== 'undefined') {
                            wdtBreakpointDefinition.tablet = parseInt(tableDescription.tabletWidth);
                        }
                        wpDataTablesResponsiveHelpers[tableDescription.tableId] = new ResponsiveDatatablesHelper($(tableDescription.selector).dataTable(), wdtBreakpointDefinition, {
                            clickOn: tableDescription.responsiveAction ? tableDescription.responsiveAction : 'icon'
                        });
                    }
                    wdtAddOverlay('#' + tableDescription.tableId);
                }
                dataTableOptions.fnRowCallback = function (nRow, aData, iDisplayIndex, iDisplayIndexFull) {
                    wpDataTablesResponsiveHelpers[tableDescription.tableId].createExpandIcon(nRow);
                }

                dataTableOptions.fnDrawCallback = function () {
                    wpDataTablesResponsiveHelpers[tableDescription.tableId].respond();
                    wdtRemoveOverlay('#' + tableDescription.tableId);
                }

            } else {
                dataTableOptions.fnPreDrawCallback = function () {
                    wdtAddOverlay('#' + tableDescription.tableId);
                }
            }

            /**
             * Remove overlay if the table is not responsive nor editable
             */
            if (!tableDescription.responsive) {
                dataTableOptions.fnDrawCallback = function () {
                    wdtRemoveOverlay('#' + tableDescription.tableId);
                }
            }
            /**
             * If aggregate functions shortcode exists on the page add that column to the ajax data
             */
            if ($('.wdt-column-sum[data-table-id="' + tableDescription.tableWpId + '"]').length) {
                var sumColumns = [];
                $('.wdt-column-sum[data-table-id="' + tableDescription.tableWpId + '"]').each(function () {
                    sumColumns.push($(this).data('column-orig-header'));
                });
            }

            if ($('.wdt-column-avg[data-table-id="' + tableDescription.tableWpId + '"]').length) {
                var avgColumns = [];
                $('.wdt-column-avg[data-table-id="' + tableDescription.tableWpId + '"]').each(function () {
                    avgColumns.push($(this).data('column-orig-header'));
                });
            }

            if ($('.wdt-column-min[data-table-id="' + tableDescription.tableWpId + '"]').length) {
                var minColumns = [];
                $('.wdt-column-min[data-table-id="' + tableDescription.tableWpId + '"]').each(function () {
                    minColumns.push($(this).data('column-orig-header'));
                });
            }

            if ($('.wdt-column-max[data-table-id="' + tableDescription.tableWpId + '"]').length) {
                var maxColumns = [];
                $('.wdt-column-max[data-table-id="' + tableDescription.tableWpId + '"]').each(function () {
                    maxColumns.push($(this).data('column-orig-header'));
                });
            }

            if (tableDescription.serverSide) {
                dataTableOptions.ajax.data = function (data) {
                    data.sumColumns = sumColumns;
                    data.avgColumns = avgColumns;
                    data.minColumns = minColumns;
                    data.maxColumns = maxColumns;
                    data.currentUserId = $('#wdt-user-id-placeholder').val();
                    data.currentUserLogin = $('#wdt-user-login-placeholder').val();
                    data.currentPostIdPlaceholder = $('#wdt-post-id-placeholder').val();
                    data.wpdbPlaceholder = $('#wdt-wpdb-placeholder').val();
                };
            }

            /**
             * Show after load if configured
             */
            if (tableDescription.hideBeforeLoad) {
                dataTableOptions.fnInitComplete = function () {
                    $(tableDescription.selector).animateFadeIn();
                }
            }

            /**
             * Add outline class to selected column col for initial table load
             */
            if ($.inArray(tableDescription.currentSkin, ['raspberry-cream', 'mojito', 'dark-mojito']) !== -1) {
                dataTableOptions.fnInitComplete = function () {
                    //  Find the column that the table is initially sorted by
                    let columnPos = tableDescription.dataTableParams.order[0][0];
                    let columnTitle = tableDescription.dataTableParams.columnDefs[columnPos].className.substring(
                        tableDescription.dataTableParams.columnDefs[columnPos].className.indexOf("column-") + 7,
                    );

                    let tableId = tableDescription.tableId;
                    addOutlineBorder(tableId, columnTitle);

                    if ($.inArray(tableDescription.currentSkin, ['mojito', 'dark-mojito']) !== -1) {
                        cubeLoaderMojito(tableId);
                        if (tableDescription.showRowsPerPage)
                            hideLabelShowXEntries(tableId);
                    }

                    if (tableDescription.hideBeforeLoad) {
                        $(tableDescription.selector).animateFadeIn();
                    }
                }
            }

            /**
             * Init the DataTable itself
             */
            wpDataTables[tableDescription.tableId] = $(tableDescription.selector).dataTable(dataTableOptions);

            /**
             * Remove pagination when "Default rows per page" is set to "All"
             */
            if(wpDataTables[tableDescription.tableId].fnSettings()._iDisplayLength >= wpDataTables[tableDescription.tableId].fnSettings().fnRecordsTotal() || dataTableOptions.iDisplayLength === -1){
                $('.dataTables_paginate').hide();
            }

            /**
             * Set pagination alignment classes
             */
            if (tableDescription.paginationAlign) {
                switch (tableDescription.paginationAlign){
                    case "right":
                        $(tableDescription.selector + '_wrapper').addClass('wpdt-pagination-right');
                        $(tableDescription.selector + '_wrapper').removeClass('wpdt-pagination-left');
                        $(tableDescription.selector + '_wrapper').removeClass('wpdt-pagination-center');
                        break;
                    case "left":
                        $(tableDescription.selector + '_wrapper').addClass('wpdt-pagination-left');
                        $(tableDescription.selector + '_wrapper').removeClass('wpdt-pagination-right');
                        $(tableDescription.selector + '_wrapper').removeClass('wpdt-pagination-center');
                        break;
                    case "center":
                        $(tableDescription.selector + '_wrapper').addClass('wpdt-pagination-center');
                        $(tableDescription.selector + '_wrapper').removeClass('wpdt-pagination-left');
                        $(tableDescription.selector + '_wrapper').removeClass('wpdt-pagination-right');
                        break;
                    default:
                        $(tableDescription.selector + '_wrapper').addClass('wpdt-pagination-right');
                        $(tableDescription.selector + '_wrapper').removeClass('wpdt-pagination-left');
                        $(tableDescription.selector + '_wrapper').removeClass('wpdt-pagination-center');
                        break;
                }

            }
            if(tableDescription.pagination && tableDescription.table_wcag){
                $(tableDescription.selector + '_paginate').addClass('wcag_paginate');
                wpDataTables[tableDescription.tableId].fnSettings().oLanguage.oPaginate.sFirst = wpdatatables_frontend_strings.firstPageWCAG;
                wpDataTables[tableDescription.tableId].fnSettings().oLanguage.oPaginate.sLast = wpdatatables_frontend_strings.lastPageWCAG;
                wpDataTables[tableDescription.tableId].fnSettings().oLanguage.oPaginate.sNext = wpdatatables_frontend_strings.nextPageWCAG;
                wpDataTables[tableDescription.tableId].fnSettings().oLanguage.oPaginate.sPrevious = wpdatatables_frontend_strings.previousPageWCAG;
                $(document).ready(function () {
                    $('#' + tableDescription.tableId + '_paginate').find('span .paginate_button').each(function (index) {
                        $(this).attr('aria-label', wpdatatables_frontend_strings.pageWCAG + this.text);
                    });
                });
            }
            $(document).ready(function () {
                if (tableDescription.table_wcag) {
                    $(tableDescription.selector + '_wrapper .dt-buttons .dt-button.DTTT_button_spacer').attr('aria-label', wpdatatables_frontend_strings.spacerWCAG).attr('role', 'button');
                    $(tableDescription.selector + '_wrapper .dt-buttons .dt-button.DTTT_button_colvis').attr('aria-label', wpdatatables_frontend_strings.colvisWCAG).attr('role', 'button');
                    $(tableDescription.selector + '_wrapper .dt-buttons .dt-button.DTTT_button_print').attr('aria-label', wpdatatables_frontend_strings.printTableWCAG).attr('role', 'button');
                    $(tableDescription.selector + '_wrapper .dt-buttons .dt-button.DTTT_button_export').attr('aria-label', wpdatatables_frontend_strings.exportTableWCAG).attr('role', 'button');
                    $(tableDescription.selector + '_wrapper .dt-buttons .dt-button.DTTT_button_clear_filters').attr('aria-label', wpdatatables_frontend_strings.clearFiltersWCAG).attr('role', 'button');
                }
            });

            /**
             * Remove pagination when "All" is selected from length menu or
             * if value length menu is greater than total records
             */
            wpDataTables[tableDescription.tableId].fnSettings().aoDrawCallback.push({
                sName: 'removePaginate',
                fn: function (oSettings) {
                    var api = oSettings.oInstance.api();

                    if (typeof (api.page.info()) != 'undefined'){
                        if (api.page.len() >= api.page.info().recordsDisplay || api.data().page.len() == -1) {
                            $('#' +  tableDescription.tableId + '_paginate').hide();
                        } else {
                            $('#' +  tableDescription.tableId + '_paginate').show();
                        }
                    }
                }
            });

            /**
             * Add outline class to selected column col when a draw occurs
             */
            wpDataTables[tableDescription.tableId].fnSettings().aoDrawCallback.push({
                sName: 'addOutlineClass',
                fn: function (oSettings) {
                    if ($.inArray(tableDescription.currentSkin, ['raspberry-cream', 'mojito', 'dark-mojito']) !== -1) {
                        //Find the column that the table is sorted by
                        let columnPos = oSettings.aaSorting[0][0];
                        let columnTitle = oSettings.aoColumns[columnPos].className.substring(
                            oSettings.aoColumns[columnPos].className.indexOf("column-") + 7,
                        );

                        let tableId = oSettings.sTableId;
                        addOutlineBorder(tableId, columnTitle);
                    }
                }
            });

            /**
             * Helper function for adding a border around the selected column
             */
            function addOutlineBorder(tableId, columnTitle) {
                if (columnTitle.indexOf(' ') !== -1) {
                    columnTitle = columnTitle.substring(0, columnTitle.indexOf(' '));
                }
                let colgroupList = document.getElementById(tableId).children[0];
                colgroupList.replaceChildren();
                let visibleColumns = document.getElementById(tableId).tHead.getElementsByClassName('wdtheader');

                for (column of visibleColumns) {
                    let newCol = document.createElement('col');
                    let colTitle = column.className.substring(
                        column.className.indexOf("column-") + 7,
                    );
                    colTitle = colTitle.substring(0, colTitle.indexOf(' '));
                    newCol.setAttribute('id', tableId + '-column-' + colTitle + '-col');
                    colgroupList.append(newCol);
                }

                $('#' +tableId + '-column-' + columnTitle + '-col').addClass('outlined');
            }
            /**
             * Helper function for hiding label 'show entries' for mojito skin
             */

            function hideLabelShowXEntries(tableId){
                let showEntriesText = $('#' + tableId +'_length')[0].firstChild;
                showEntriesText.removeChild(showEntriesText.firstChild);
                showEntriesText.removeChild(showEntriesText.lastChild);

            }

            function cubeLoaderMojito(tableId){
                let cubesAnimation = '<div class="wdt_cubes">';
                for (let i = 1; i <= 9; i++) {
                    cubesAnimation += '<div class="wdt_cube wdt_cube-' + i + '"></div>';
                }
                cubesAnimation += ' </div>';
                $('#' + tableId).append(cubesAnimation)
            }

            /**
             * Add the draw callback
             * @param callback
             */
            wpDataTables[tableDescription.tableId].addOnDrawCallback = function (callback) {
                if (typeof callback !== 'function') {
                    return;
                }

                var index = wpDataTables[tableDescription.tableId].fnSettings().aoDrawCallback.length + 1;

                wpDataTables[tableDescription.tableId].fnSettings().aoDrawCallback.push({
                    sName: 'user_callback_' + index,
                    fn: callback
                });

            };



            /**
             * Init row grouping if enabled
             */
            if ((tableDescription.columnsFixed == 0) && (tableDescription.groupingEnabled)) {
                wpDataTables[tableDescription.tableId].rowGrouping({iGroupingColumnIndex: tableDescription.groupingColumnIndex});
            }

            $(document).on('click', '.paginate_button', function () {
                var tableSelector = $(this)[0].attributes[1].value;
                if (JSON.parse($('#' + $('#' + tableSelector).data('described-by')).val()).pagination_top) {
                    function paginateScroll() {
                        $('html, body').animate({
                            scrollTop: $('#' + tableSelector + "_wrapper").offset().top
                        }, 100);
                    }

                    paginateScroll();

                    $(this).closest(tableDescription.selector + "_paginate.paginate_button").off('click').on('click', paginateScroll);
                }
            });

            return wpDataTables[tableDescription.tableId];

        };

        /**
         * Loop through all tables on the page and render the wpDataTables elements
         */
        $('table.wpDataTable:not(.wpdtSimpleTable)').each(function () {
            var tableDescription = JSON.parse($('#' + $(this).data('described-by')).val());
            wdtRenderDataTable($(this), tableDescription);
        });

    });

})(jQuery);

/**
 * Apply cell action for conditional formatting rule
 *
 * @param $cell
 * @param action
 * @param setVal
 */
function wdtApplyCellAction($cell, action, setVal) {
    switch (action) {
        case 'setCellColor':
            $cell.attr('style', 'background-color: ' + setVal + ' !important');
            break;
        case 'defaultCellColor':
            $cell.attr('style', 'background-color: "" !important');
            break;
        case 'setCellContent':
            $cell.html(setVal);
            break;
        case 'setCellClass':
            $cell.addClass(setVal);
            break;
        case 'removeCellClass':
            $cell.removeClass(setVal);
            break;
        case 'setRowColor':
            $cell.closest('tr').find('td').attr('style', 'background-color: ' + setVal + ' !important');
            break;
        case 'defaultRowColor':
            $cell.closest('tr').find('td').attr('style', 'background-color: "" !important');
            break;
        case 'setRowClass':
            $cell.closest('tr').addClass(setVal);
            break;
        case 'addColumnClass':
            var index = $cell.index() + 1;
            $cell
                .closest('table.wpDataTable')
                .find('tbody td:nth-child(' + index + ')')
                .addClass(setVal);
            break;
        case 'setColumnColor':
            var index = $cell.index() + 1;
            $cell
                .closest('table.wpDataTable')
                .find('tbody td:nth-child(' + index + ')')
                .attr('style', 'background-color: ' + setVal + ' !important');
            break;
    }
}

function wdtDialog(str, title) {
    var dialogId = Math.floor((Math.random() * 1000) + 1);
    var editModal = jQuery('.wdt-frontend-modal').clone();

    editModal.attr('id', 'remodal-' + dialogId);
    editModal.find('.modal-title').html(title);
    editModal.find('.modal-header').append(str);

    return editModal;
}

function wdtAddOverlay(table_selector) {
    jQuery(table_selector).addClass('overlayed');
}

function wdtRemoveOverlay(table_selector) {
    jQuery(table_selector).removeClass('overlayed');
}



/**
 * Get cell value cleared from neighbour html tags
 * @param element
 * @param responsive
 * @returns {*}
 */
function getPurifiedValue(element, responsive) {
    if (responsive) {
        var cellVal = element.children('.columnValue').html();
    } else {
        cellVal = element.clone().children().remove().end().html();
    }

    return cellVal;
}

/**
 * Conditional formatting
 * @param conditionalFormattingRules
 * @param params
 * @param element
 * @param responsive
 */
function wdtCheckConditionalFormatting(conditionalFormattingRules, params, element, responsive) {

    var cellVal = '';
    var ruleVal = '';
    var ruleMatched = false;
    if (( params.columnType == 'int' ) || ( params.columnType == 'float' )) {
        // Process numeric comparison
        cellVal = parseFloat(wdtUnformatNumber(getPurifiedValue(element, responsive), params.thousandsSeparator, params.decimalSeparator, true))
        ruleVal = conditionalFormattingRules.cellVal;
    } else if (params.columnType == 'date') {
        cellVal = moment(getPurifiedValue(element, responsive), params.momentDateFormat).toDate();
        if (conditionalFormattingRules.cellVal == '%TODAY%') {
            ruleVal = moment().startOf('day').toDate();
        } else {
            ruleVal = moment(conditionalFormattingRules.cellVal, params.momentDateFormat).toDate();
        }
    } else if (params.columnType == 'datetime') {
        if (conditionalFormattingRules.cellVal == '%TODAY%') {
            cellVal = moment(getPurifiedValue(element, responsive), params.momentDateFormat + ' ' + params.momentTimeFormat).startOf('day').toDate();
            ruleVal = moment().startOf('day').toDate();
        } else {
            cellVal = moment(getPurifiedValue(element, responsive), params.momentDateFormat + ' ' + params.momentTimeFormat).toDate();
            ruleVal = moment(conditionalFormattingRules.cellVal, params.momentDateFormat + ' ' + params.momentTimeFormat).toDate();
        }
    } else if (params.columnType == 'time') {
        cellVal = moment(getPurifiedValue(element, responsive), params.momentTimeFormat).toDate();
        ruleVal = moment(conditionalFormattingRules.cellVal, params.momentTimeFormat).toDate();
    } else {
        // Process string comparison
        cellVal = getPurifiedValue(element, responsive);
        ruleVal = conditionalFormattingRules.cellVal;
    }

    switch (conditionalFormattingRules.ifClause) {
        case 'lt':
            ruleMatched = cellVal < ruleVal;
            break;
        case 'lteq':
            ruleMatched = cellVal <= ruleVal;
            break;
        case 'eq':
            if (params.columnType == 'date'
                || params.columnType == 'datetime'
                || params.columnType == 'time') {
                cellVal = cellVal != null ? cellVal.getTime() : null;
                ruleVal = ruleVal != null ? ruleVal.getTime() : null;
            }
            ruleMatched = cellVal == ruleVal;
            break;
        case 'neq':
            if (params.columnType == 'date' || params.columnType == 'datetime') {
                cellVal = cellVal != null ? cellVal.getTime() : null;
                ruleVal = ruleVal != null ? ruleVal.getTime() : null;
            }
            ruleMatched = cellVal != ruleVal;
            break;
        case 'gteq':
            ruleMatched = cellVal >= ruleVal;
            break;
        case 'gt':
            ruleMatched = cellVal > ruleVal;
            break;
        case 'contains':
            ruleMatched = cellVal.indexOf(ruleVal) !== -1;
            break;
        case 'contains_not':
            ruleMatched = cellVal.indexOf(ruleVal) == -1;
            break;
    }

    if (ruleMatched) {
        wdtApplyCellAction(element, conditionalFormattingRules.action, conditionalFormattingRules.setVal);
    }
}

jQuery.fn.dataTableExt.oStdClasses.sWrapper = "wpDataTables wpDataTablesWrapper";
jQuery.fn.dataTable.ext.classes.sLengthSelect = 'selectpicker length_menu';
jQuery.fn.dataTable.ext.classes.sFilterInput = 'form-control';
