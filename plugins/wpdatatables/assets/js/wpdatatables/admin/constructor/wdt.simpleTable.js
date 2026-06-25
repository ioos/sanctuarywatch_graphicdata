(function ($) {
    $(function () {
        var container = $('#wpdt-table-editor'),
            rowNumber = container.data('row'),
            colNumber = container.data('col'),
            heightHT = $('.ht_master .wtHider'),
            cpCellsMetaData = [],
            cpRowsCount = [],
            cpColsCount = [],
            cellActionButtons = $(
                '#wpdt-align-left, #wpdt-undo, #wpdt-redo,#wpdt-bold, #wpdt-italic, #wpdt-underline, #wpdt-align-right,#wpdt-align-center,#wpdt-align-justify,#wpdt-valign-top, #wpdt-valign-middle, #wpdt-valign-bottom, #wpdt-wrap-text, #wpdt-overflow-text, #wpdt-clip-text'
            ),
            tableActionButtons = $('#wpdt-add-column-left, #wpdt-add-column-right, #wpdt-add-top-row, #wpdt-add-bottom-row, #wpdt-insert-column-before, #wpdt-insert-column-after, #wpdt-insert-row-before, #wpdt-insert-row-after, #wpdt-remove-column, #wpdt-remove-row')

        /**
         * Init wpdtEditor (instance of Handsontable)
         */
        if (container.length) {

            var wpdtEditor = new Handsontable(container[0], {
                startRows: rowNumber,
                startCols: colNumber,
                colWidths: 100,
                colHeaders: true,
                rowHeaders: true,
                width: '100%',
                height: setHeightHT(heightHT),
                mergeCells: true,
                contextMenu: {
                    items: {
                        'row_above': {
                            name: wpdatatables_frontend_strings.insert_row_above
                        },
                        'row_below': {
                            name: wpdatatables_frontend_strings.insert_row_below
                        },
                        'remove_row': {
                            name: wpdatatables_frontend_strings.remove_row
                        },
                        'separator': Handsontable.plugins.ContextMenu.SEPARATOR,
                        'col_left': {
                            name: wpdatatables_frontend_strings.insert_col_left
                        },
                        'col_right': {
                            name: wpdatatables_frontend_strings.insert_col_right
                        },
                        'remove_col': {
                            name: wpdatatables_frontend_strings.remove_column
                        },
                        'separator2': Handsontable.plugins.ContextMenu.SEPARATOR,
                        'undo': {
                            name: wpdatatables_frontend_strings.undo
                        },
                        'redo': {
                            name: wpdatatables_frontend_strings.redo
                        },
                        'separator3': Handsontable.plugins.ContextMenu.SEPARATOR,
                        'alignment': {
                            name: wpdatatables_frontend_strings.alignment,
                            submenu: {
                                // Custom option with submenu of items
                                items: [

                                    {
                                        key: 'alignment:left',
                                        name: wpdatatables_frontend_strings.left,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[5].click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'alignment:center',
                                        name: wpdatatables_frontend_strings.center,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[6].click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'alignment:right',
                                        name: wpdatatables_frontend_strings.right,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[7].click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'alignment:justify',
                                        name: wpdatatables_frontend_strings.justify,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[8].click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        name: '---------',
                                    },
                                    {
                                        key: 'alignment:top',
                                        name: wpdatatables_frontend_strings.top,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[10].click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'alignment:middle',
                                        name: wpdatatables_frontend_strings.middle,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[9].click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'alignment:bottom',
                                        name: wpdatatables_frontend_strings.bottom,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[11].click()
                                            }, 0);
                                        }
                                    }
                                ]
                            }
                        },
                        'separator4': Handsontable.plugins.ContextMenu.SEPARATOR,
                        'wrapping': {
                            name: wpdatatables_frontend_strings.text_wrapping,
                            submenu: {
                                // Custom option with submenu of items
                                items: [
                                    {
                                        key: 'wrapping:wrap',
                                        name: wpdatatables_frontend_strings.wrap,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[12].click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'wrapping:overflow',
                                        name: wpdatatables_frontend_strings.overflow,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[13].click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'wrapping:clip',
                                        name: wpdatatables_frontend_strings.clip,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                cellActionButtons[14].click()
                                            }, 0);
                                        }
                                    },

                                ]
                            }
                        },
                        'separator5': Handsontable.plugins.ContextMenu.SEPARATOR,
                        'cut': {
                            name: wpdatatables_frontend_strings.cut
                        },
                        'copy': {
                            name: wpdatatables_frontend_strings.copy
                        },
                        'separator6': Handsontable.plugins.ContextMenu.SEPARATOR,
                        'add': {
                            name: wpdatatables_frontend_strings.insert_custom,
                            submenu: {
                                // Custom option with submenu of items
                                items: [
                                    {
                                        key: 'add:link',
                                        name: wpdatatables_frontend_strings.link,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                $('#wpdt-link').click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'add:media',
                                        name: wpdatatables_frontend_strings.media,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                $('#wpdt-media').click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'add:html',
                                        name: wpdatatables_frontend_strings.html_code,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                $('#wpdt-html').click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'add:shortcode',
                                        name: wpdatatables_frontend_strings.shortcode,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                $('#wpdt-do-shortcode').click()
                                            }, 0);
                                        }
                                    },
                                    {
                                        key: 'add:star',
                                        name: wpdatatables_frontend_strings.star_rating,
                                        callback: function (key, selection, clickEvent) {
                                            setTimeout(function () {
                                                $('#wpdt-star-rating').click()
                                            }, 0);
                                        }
                                    }
                                ]
                            }
                        },
                        'separator7': Handsontable.plugins.ContextMenu.SEPARATOR,
                        'clear': {
                            name: wpdatatables_frontend_strings.clear_table_data,
                            callback: function (key, selection, clickEvent) {
                                setTimeout(function () {
                                    $('#wpdt-clear').click()
                                }, 0);
                            }
                        },
                        'separator8': Handsontable.plugins.ContextMenu.SEPARATOR,
                        'mergeCells': {
                            name: wpdatatables_frontend_strings.merge_cells,
                            callback: function (key, selection, clickEvent) {
                                setTimeout(function () {
                                    $('#wpdt-merge').click()
                                }, 0);
                            }
                        }
                    }
                },
                fixedRowsTop: 0,
                fixedColumnsLeft: 0,
                outsideClickDeselects: false,
                manualRowResize: true,
                manualColumnResize: true,
                manualRowMove: true,
                manualColumnMove: true,
                undo: true,
                cells: function (row, col) {
                    var cellPrp = {};
                    cellPrp.renderer = 'html';
                    return cellPrp
                },
                afterSelection: (row, column, row2, column2, preventScrolling, selectionLayerLevel) => {
                    disableButtons();
                    updateActiveButtons()
                }
            });
            wpdtEditor.selectCell(0, 0);
            Handsontable.hooks.getRegistered();
            $('.wdt-simple-table-settings .display-settings-tab').animateFadeIn();
        }

        // Load table data to editor
        if (container.length) {
            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'wpdatatables_get_handsontable_data',
                    tableID: wpdatatable_config.id != null ? wpdatatable_config.id : $('#wpdt-table-editor').data('wpdt-id'),
                    wdtNonce: $('#wdtNonce').val()
                },
                success: function (result) {
                    var obj = JSON.parse(result),
                        rows = obj.tableData,
                        meta = obj.tableMeta,
                        mergeCells = (typeof meta === 'object' && 'mergedCells' in meta && meta.mergedCells.length ? meta.mergedCells : []);

                    // Set rows data
                    if (rows.length > 0) {
                        var data = [],
                            heights = [],
                            widths = [],
                            cellsMeta = [];

                        $.each(rows, function (x, row) {
                            var cells = [];

                            heights.push(row.height !== undefined && row.height > 0 ? row.height : undefined);

                            $.each(row.cells, function (y, cell) {
                                var metaData = {};

                                if ('meta' in cell && cell.meta !== undefined) {
                                    var classes = cell.meta,
                                        color = '',
                                        bgColor = '';
                                    $.each(classes, function (y, cellClass) {
                                        if (cellClass.indexOf('wpdt-tc-') !== -1) {
                                            color = cellClass.substring(cellClass.indexOf('wpdt-tc-') + 8, cellClass.indexOf('wpdt-tc-') + 14);
                                        } else if (cellClass.indexOf('wpdt-bc-') !== -1) {
                                            bgColor = cellClass.substring(cellClass.indexOf('wpdt-bc-') + 8, cellClass.indexOf('wpdt-bc-') + 14);
                                        }
                                    });

                                    var cellClasses = cell.meta,
                                        curClasses = [];

                                    for (var i = 0; i <= cellClasses.length; i++) {
                                        curClasses.push(cellClasses[i]);
                                    }
                                    metaData = $.extend(metaData, {row: x, col: y, className: curClasses.join(' ')});
                                }
                                metaData = $.extend(metaData, {
                                    type: 'text'
                                });

                                cellsMeta.push(metaData);
                                if (x === 0 && meta.colWidths) {
                                    widths.push(meta.colWidths[y] > 0 ? meta.colWidths[y] : 100);
                                } else if (x === 0) {
                                    widths.push(cell.width === undefined ? 100 : cell.width);
                                }
                                cells.push(cell.data);
                            });
                            data.push(cells);
                        });

                        // Set merged cells
                        if (mergeCells.length > 0) {
                            wpdtEditor.updateSettings({
                                mergeCells: mergeCells
                            });
                        }
                        // Height & width
                        wpdtEditor.updateSettings({
                            rowHeights: heights,
                            colWidths: widths,
                        });
                        wpdtEditor.loadData(data);

                        // Load extracted metadata
                        $.each(cellsMeta, function (i, meta) {
                            wpdtEditor.setCellMetaObject(meta.row, meta.col, meta);
                        });
                        wpdtEditor.render()

                        let heightHT = $('.ht_master .wtHider');
                        wpdtEditor.updateSettings({
                            height: setHeightHT(heightHT)
                        });
                    }
                    $('.wdt-preload-layer').animateFadeOut();
                }
            })
        }

        /**
         * Save table data
         */
        $('.wdt-save-data').on('click', function () {
            $('.wdt-preload-layer').animateFadeIn();
            var tableSettings,
                allData = wpdtEditor.getData(),
                metaData = {},
                mergeData = [],
                rowsData = [],
                rowCounter = 0,
                reloadCounter = 0,
                colWidths = [],
                colHeaders = wpdtEditor.getColHeader(),
                colNumber = wpdtEditor.countCols(),
                rowNumber = wpdtEditor.countRows();
            $.each(allData, function (x, row) {
                var currentRow = {cells: []};
                rowCounter++;

                $.each(row, function (y) {
                    var meta = wpdtEditor.getCellMeta(x, y),
                        metaClasses = meta.className,
                        row = wpdtEditor.toPhysicalRow(x),
                        cell = wpdtEditor.getSourceDataAtCell(row, y) != '\n' ? wpdtEditor.getSourceDataAtCell(row, y) : '',
                        classes = [],
                        cellData = {
                            data: cell,
                            hidden: false,
                            type: 'text'
                        },
                        mergeCell = wpdtEditor.getPlugin('mergeCells').mergedCellsCollection.get(x, y);

                    if (cell != null && (cell.includes('wpdt-do-shortcode') == true || cell.includes('wpdt-link-content') == true)) {
                        reloadCounter++
                    }
                    if (mergeCell !== undefined && mergeCell !== false) {
                        cellData.hidden = true;
                    }

                    if (metaClasses !== undefined) {
                        $.each(metaClasses.split(' '), function (index, element) {
                            if (element.length) {
                                classes.push($.trim(element));
                            }
                        });
                    }
                    cellData.meta = classes;

                    if (x == 0) {
                        colWidths.push(wpdtEditor.getColWidth(y));
                    }
                    currentRow.cells.push(cellData);
                });
                currentRow.height = wpdtEditor.getRowHeight(x);

                rowsData.push(currentRow);
            });

            if (wpdtEditor.getPlugin('mergeCells').mergedCellsCollection.mergedCells.length) {
                for (var i = 0; i < wpdtEditor.getPlugin('mergeCells').mergedCellsCollection.mergedCells.length; i++) {
                    mergeData.push(wpdtEditor.getPlugin('mergeCells').mergedCellsCollection.mergedCells[i]);
                }
            }

            metaData = {
                colNumber: colNumber,
                rowNumber: rowNumber,
                colWidths: colWidths,
                colHeaders: colHeaders,
                mergedCells: mergeData,
                reloadCounter: reloadCounter
            };
            tableSettings = wpdatatable_config.getJSON();
            tableSettings.content = metaData;

            $.ajax({
                url: ajaxurl,
                type: 'POST',
                data: {
                    action: 'wpdatatables_save_simple_table_data',
                    rowsData: JSON.stringify(rowsData),
                    tableSettings: JSON.stringify(tableSettings),
                    wdtNonce: $('#wdtNonce').val()
                },
                success: function (result) {
                    var data = JSON.parse(result)
                    if (typeof data.error != 'undefined') {
                        $('#wdt-error-modal .modal-body').html(data.error);
                        $('#wdt-error-modal').modal('show');
                        $('.wdt-preload-layer').animateFadeOut();
                    } else {
                        if (data.reload) {
                            location.reload()
                        } else {
                            $('.wdt-preload-layer').animateFadeOut();
                            $('.wpDataTablesSimpleWrapper-' + wpdatatable_config.id).empty().append(data.tableHTML);
                            $('#wpdt-views ul li:first-child a').click();
                        }
                        wdtNotify(
                            wpdatatables_edit_strings.success,
                            wpdatatables_edit_strings.tableSaved,
                            'success'
                        );

                    }
                }
            })

        });

        function getCellsMetaData(changes, coords) {
            cpCellsMetaData = [];
            cpRowsCount = 0;
            cpColsCount = 0;
            for (var i = 0; i < coords.length; i++) {
                for (var row = coords[i].startRow; row <= coords[i].endRow; row++) {
                    for (var col = coords[i].startCol; col <= coords[i].endCol; col++) {
                        cpCellsMetaData.push(wpdtEditor.getCellMeta(row, col));
                        if (row == coords[i].startRow) {
                            cpColsCount++;
                        }
                    }
                    cpRowsCount++;
                }
            }
        }

        /**
         * Set height of wpdtEditor wrapper
         */
        function setHeightHT(element) {
            let height;
            if (element.length) {
                if (element.height() > 601) {
                    height = 622
                } else {
                    height = element.height() + 30
                }
            } else {
                height = 320
            }
            return height;
        }

        /**
         * Get all heights for rows
         */
        function getHeightData() {
            if (!wpdtEditor.allHeights) {
                wpdtEditor.allHeights = typeof (wpdtEditor.getSettings().rowHeights) == 'object' ? wpdtEditor.getSettings().rowHeights : [];
            }
        }

        /**
         * Get all widths for columns
         */
        function getWidthData() {
            if (!wpdtEditor.allWidths) {
                wpdtEditor.allWidths = typeof (wpdtEditor.getSettings().colWidths) == 'object' ? wpdtEditor.getSettings().colWidths : [];
            }
        }

        /**
         * Update status of active buttons in toolbar
         */
        function updateActiveButtons() {
            var selectedRange = wpdtEditor.getSelectedRange()[0],
                highlightRow = selectedRange.highlight.row,
                highlightCol = selectedRange.highlight.col,
                cellMeta = wpdtEditor.getCellMeta(highlightRow, highlightCol),
                cellData = wpdtEditor.getDataAtCell(highlightRow, highlightCol),
                cellClasses = typeof cellMeta.className != 'undefined' ? cellMeta.className : '',
                bgColorButton = $('#wpdt-background-color'),
                mainAlignButtonIcon = $('#wpdt-align-button i:first-child'),
                mainValignButtonIcon = $('#wpdt-valign-button i:first-child'),
                mainWrapButtonIcon = $('#wpdt-wrap-button i:first-child'),
                textColorButton = $('#wpdt-text-color'),
                fontSizeSelect = $('#wpdt-font-size'),
                fontFamilySelect = $('#wpdt-font-family'),
                linkButton = $('#wpdt-link'),
                mediaButton = $('#wpdt-media'),
                htmlButton = $('#wpdt-html'),
                shortcodeButton = $('#wpdt-do-shortcode'),
                starButton = $('#wpdt-star-rating');
            // Update Bold button
            if (cellClasses.indexOf('wpdt-bold') !== -1) {
                $('#wpdt-bold').addClass('selected');
            } else {
                $('#wpdt-bold').removeClass('selected');
            }
            // Update Italic button
            if (cellClasses.indexOf('wpdt-italic') !== -1) {
                $('#wpdt-italic').addClass('selected');
            } else {
                $('#wpdt-italic').removeClass('selected');
            }
            // Update Underline button
            if (cellClasses.indexOf('wpdt-underline') !== -1) {
                $('#wpdt-underline').addClass('selected');
            } else {
                $('#wpdt-underline').removeClass('selected');
            }
            // Update Text color button
            if (cellClasses.indexOf('wpdt-tc-') !== -1) {
                let textColor = cellClasses.substring(cellClasses.indexOf('wpdt-tc-') + 8, cellClasses.indexOf('wpdt-tc-') + 14);
                textColorButton.removeAttr('style');
                textColorButton.css("border-bottom-color", "#" + textColor);
            } else {
                textColorButton.removeAttr('style');
                textColorButton.css("border-bottom-color", "#000000");
            }
            // Update Background color button
            if (cellClasses.indexOf('wpdt-bc-') !== -1) {
                let bgColor = cellClasses.substring(cellClasses.indexOf('wpdt-bc-') + 8, cellClasses.indexOf('wpdt-bc-') + 14);
                bgColorButton.removeAttr('style');
                bgColorButton.css("border-bottom-color", "#" + bgColor);
            } else {
                bgColorButton.removeAttr('style');
                bgColorButton.css("border-bottom-color", "#FFFFFF");
            }
            // Update Font size select
            if (cellClasses.indexOf('wpdt-fs-') !== -1) {
                let fontSize = cellClasses.substring(cellClasses.indexOf('wpdt-fs-') + 8, cellClasses.indexOf('wpdt-fs-') + 14);
                const regex = new RegExp("^0+(?!$)", 'g');
                // Replaces the matched
                // value with given string
                fontSize = fontSize.replaceAll(regex, "");
                fontSizeSelect.val(fontSize)
            } else {
                fontSizeSelect.val(13)
            }
            // Update Font family select
            if (cellClasses.indexOf('wpdt-ff-') !== -1) {
                let fontFamily = cellClasses.substring(cellClasses.indexOf('wpdt-ff-') + 8, cellClasses.indexOf('wpdt-ff-') + 14);
                const regex = new RegExp("^0+(?!$)", 'g');
                // Replaces the matched
                // value with given string
                fontFamily = fontFamily.replaceAll(regex, "");
                fontFamilySelect.val(fontFamily)
            } else {
                fontFamilySelect.val(0)
            }
            // Update Horizontal right align button
            if (cellClasses.indexOf('wpdt-align-right') !== -1) {
                $('#wpdt-align-right').addClass('selected');
                mainAlignButtonIcon.removeClass();
                mainAlignButtonIcon.addClass('wpdt-icon-align-right');
            } else {
                $('#wpdt-align-right').removeClass('selected');
            }
            // Update Horizontal left align button
            if (cellClasses.indexOf('wpdt-align-left') !== -1) {
                $('#wpdt-align-left').addClass('selected');
                mainAlignButtonIcon.removeClass();
                mainAlignButtonIcon.addClass('wpdt-icon-align-left');
            } else {
                $('#wpdt-align-left').removeClass('selected');
            }
            // Update Horizontal center align button
            if (cellClasses.indexOf('wpdt-align-center') !== -1) {
                $('#wpdt-align-center').addClass('selected');
                mainAlignButtonIcon.removeClass();
                mainAlignButtonIcon.addClass('wpdt-icon-align-center');
            } else {
                $('#wpdt-align-center').removeClass('selected');
            }
            // Update Horizontal justify align button
            if (cellClasses.indexOf('wpdt-align-justify') !== -1) {
                $('#wpdt-align-justify').addClass('selected');
                mainAlignButtonIcon.removeClass();
                mainAlignButtonIcon.addClass('wpdt-icon-align-justify');
            } else {
                $('#wpdt-align-justify').removeClass('selected');
            }
            // Update main Horizontal align button
            if (cellClasses.indexOf('wpdt-align-justify') === -1 &&
                cellClasses.indexOf('wpdt-align-center') === -1 &&
                cellClasses.indexOf('wpdt-align-left') === -1 &&
                cellClasses.indexOf('wpdt-align-right') === -1
            ) {
                mainAlignButtonIcon.removeClass();
                mainAlignButtonIcon.addClass('wpdt-icon-align-left');
            }
            // Update Vertical top align button
            if (cellClasses.indexOf('wpdt-valign-top') !== -1) {
                $('#wpdt-valign-top').addClass('selected');
                mainValignButtonIcon.removeClass();
                mainValignButtonIcon.addClass('wpdt-icon-vertical-align-top');
            } else {
                $('#wpdt-valign-top').removeClass('selected');
            }
            // Update Vertical middle align button
            if (cellClasses.indexOf('wpdt-valign-middle') !== -1) {
                $('#wpdt-valign-middle').addClass('selected');
                mainValignButtonIcon.removeClass();
                mainValignButtonIcon.addClass('wpdt-icon-vertical-align-center');
            } else {
                $('#wpdt-valign-middle').removeClass('selected');
            }
            // Update Vertical bottom align button
            if (cellClasses.indexOf('wpdt-valign-bottom') !== -1) {
                $('#wpdt-valign-bottom').addClass('selected');
                mainValignButtonIcon.removeClass();
                mainValignButtonIcon.addClass('wpdt-icon-vertical-align-bottom');
            } else {
                $('#wpdt-valign-bottom').removeClass('selected');
            }
            // Update main Vertical align button
            if (cellClasses.indexOf('wpdt-valign-top') === -1 &&
                cellClasses.indexOf('wpdt-valign-middle') === -1 &&
                cellClasses.indexOf('wpdt-valign-bottom') === -1
            ) {
                mainValignButtonIcon.removeClass();
                mainValignButtonIcon.addClass('wpdt-icon-vertical-align-center');
            }
            // Update Wrap text button
            if (cellClasses.indexOf('wpdt-wrap-text') !== -1) {
                $('#wpdt-wrap-text').addClass('selected');
                mainWrapButtonIcon.removeClass();
                mainWrapButtonIcon.addClass('wpdt-icon-wrap-text');
            } else {
                $('#wpdt-wrap-text').removeClass('selected');
            }
            // Update Overflow text button
            if (cellClasses.indexOf('wpdt-overflow-text') !== -1) {
                $('#wpdt-overflow-text').addClass('selected');
                mainWrapButtonIcon.removeClass();
                mainWrapButtonIcon.addClass('wpdt-icon-overflow-text');
            } else {
                $('#wpdt-overflow-text').removeClass('selected');
            }
            // Update Clip text button
            if (cellClasses.indexOf('wpdt-clip-text') !== -1) {
                $('#wpdt-clip-text').addClass('selected');
                mainWrapButtonIcon.removeClass();
                mainWrapButtonIcon.addClass('wpdt-icon-clip-text');
            } else {
                $('#wpdt-clip-text').removeClass('selected');
            }
            // Update main Wrap text button
            if (cellClasses.indexOf('wpdt-wrap-text') === -1 &&
                cellClasses.indexOf('wpdt-overflow-text') === -1 &&
                cellClasses.indexOf('wpdt-clip-text') === -1
            ) {
                mainWrapButtonIcon.removeClass();
                mainWrapButtonIcon.addClass('wpdt-icon-wrap-text');
            }

            // Update Link button
            if (cellData != null && cellData.indexOf('wpdt-link-content') !== -1) {
                linkButton.addClass('selected');
            } else {
                linkButton.removeClass('selected');
            }
            // Update Media button
            if (cellData != null && cellData.indexOf('wpdt-media-content') !== -1) {
                mediaButton.addClass('selected');
            } else {
                mediaButton.removeClass('selected');
            }
            // Update HTML button
            if (cellData != null && cellData.indexOf('wpdt-html-content') !== -1) {
                htmlButton.addClass('selected');
            } else {
                htmlButton.removeClass('selected');
            }

            // Update Shortcode button
            if (cellData != null && cellData.indexOf('wpdt-do-shortcode') !== -1) {
                shortcodeButton.addClass('selected');
            } else {
                shortcodeButton.removeClass('selected');
            }

            // Update HTML button
            if (cellData != null && cellData.indexOf('wpdt-star-rating') !== -1) {
                starButton.addClass('selected');
            } else {
                starButton.removeClass('selected');
            }
        }

        /**
         * Disable buttons based on selection
         */
        function disableButtons() {
            if (wpdtEditor.getSelectedRange() !== undefined) {
                var selection = wpdtEditor.getSelectedRange()[0];
                if (selection.from.row !== selection.to.row ||
                    selection.from.col !== selection.to.col) {
                    $('#wpdt-merge').removeClass('disabled');
                } else {
                    $('#wpdt-merge').addClass('disabled');
                }
            }
            if (wpdtEditor.undoRedo.isUndoAvailable()) {
                $('#wpdt-undo').removeClass('disabled');
            } else {
                $('#wpdt-undo').addClass('disabled');
            }

            if (wpdtEditor.undoRedo.isRedoAvailable()) {
                $('#wpdt-redo').removeClass('disabled');
            } else {
                $('#wpdt-redo').addClass('disabled');
            }
        }

        /**
         * Add dynamic classes for cells
         */
        function addDynamicStyle(selectedCells, value, partClass, fontFamilyArr = []) {
            let newValue;
            for (var index = 0; index < selectedCells.length; index += 1) {
                var item = selectedCells[index],
                    startRow = Math.min(item[0], item[2]),
                    endRow = Math.max(item[0], item[2]),
                    startCol = Math.min(item[1], item[3]),
                    endCol = Math.max(item[1], item[3]);

                for (var rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
                    for (var columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
                        var cell = wpdtEditor.getCellMeta(rowIndex, columnIndex),
                            newClassName;
                        cell.className = typeof cell.className == 'string' ? cell.className : '';

                        if (cell.className.indexOf(partClass) !== -1) {
                            if (partClass == 'wpdt-ff-' || partClass == 'wpdt-fs-') {
                                newValue = String(value).padStart(6, '0');
                            } else {
                                newValue = value;
                            }
                            if (newValue != ''){
                                newClassName = cell.className.replace(cell.className.substring(cell.className.indexOf(partClass), cell.className.indexOf(partClass) + 14), partClass + newValue);
                            } else {
                                newClassName = cell.className.replace(cell.className.substring(cell.className.indexOf(partClass), cell.className.indexOf(partClass) + 14), '');
                            }
                        } else {
                            if (partClass == 'wpdt-ff-' || partClass == 'wpdt-fs-') {
                                newClassName = cell.className + ' ' + partClass + String(value).padStart(6, '0');
                            } else {
                                if (value != ''){
                                    newClassName = cell.className + ' ' + partClass + value;
                                } else {
                                    newClassName = cell.className + ' ';
                                }
                            }
                        }
                        wpdtEditor.setCellMeta(rowIndex, columnIndex, 'className', newClassName.trimStart());
                    }
                }
            }
            wpdtEditor.render();
            if (partClass === 'wpdt-tc-') {
                addStylesheetRules('.' + partClass + value, 'color:#' + value + ' !important;')
            } else if (partClass === 'wpdt-bc-') {
                addStylesheetRules('.' + partClass + value, 'background-color:#' + value + ' !important;');
            } else if (partClass === 'wpdt-fs-') {
                addStylesheetRules('.' + partClass + String(value).padStart(6, '0'), 'font-size:' + value + 'px !important;');
            } else if (partClass === 'wpdt-ff-') {
                let fontFamily = value === '0' ? 'inherit' : fontFamilyArr[value - 1];
                addStylesheetRules('.' + partClass + String(value).padStart(6, '0'), 'font-family:' + fontFamily + ' !important;');
            } else if (partClass === 'wpdt-sc-') {
                addStylesheetRules('.' + partClass + value + '.rating > span.full.rated:after', 'color:#' + value + ' !important;');
                addStylesheetRules('.' + partClass + value + '.rating > .half:before', 'color:#' + value + ' !important;');
            }
        }

        /**
         * Set cell classes depends of button click from toolbar
         */
        function setCellClasses(rowIndex, columnIndex, className) {
            var cell = wpdtEditor.getCellMeta(rowIndex, columnIndex),
                newClassName, arrayOfClasses,
                hAlignClases = ['wpdt-align-left', 'wpdt-align-right', 'wpdt-align-center', 'wpdt-align-justify'],
                vAlignClases = ['wpdt-valign-top', 'wpdt-valign-middle', 'wpdt-valign-bottom'],
                wrapClases = ['wpdt-wrap-text', 'wpdt-overflow-text', 'wpdt-clip-text'],
                boldClass = ['wpdt-bold'],
                italicClass = ['wpdt-italic'],
                underlineClass = ['wpdt-underline'],
                doShortcode = ['wpdt-do-shortcode'],
                starRating = ['wpdt-star-rating'];


            if ($.inArray(className, hAlignClases) !== -1) {
                arrayOfClasses = hAlignClases;
            } else if ($.inArray(className, vAlignClases) !== -1) {
                arrayOfClasses = vAlignClases;
            } else if ($.inArray(className, wrapClases) !== -1) {
                arrayOfClasses = wrapClases;
            } else if ($.inArray(className, boldClass) !== -1) {
                arrayOfClasses = boldClass;
            } else if ($.inArray(className, italicClass) !== -1) {
                arrayOfClasses = italicClass;
            } else if ($.inArray(className, underlineClass) !== -1) {
                arrayOfClasses = underlineClass;
            } else if ($.inArray(className, doShortcode) !== -1) {
                arrayOfClasses = doShortcode;
            } else if ($.inArray(className, starRating) !== -1) {
                arrayOfClasses = starRating;
            }

            cell.className = typeof cell.className == 'string' ? cell.className : '';

            if (cell.className.indexOf(className) !== -1) {
                newClassName = cell.className.replace(className, '');
            } else {
                var i = arrayOfClasses.indexOf(className);

                if (i !== -1) arrayOfClasses.splice(i, 1);

                $.each(arrayOfClasses, function (index, value) {
                    if (cell.className.indexOf(value) !== -1) {
                        cell.className = cell.className.replace(value, '');
                    }
                });
                newClassName = cell.className + ' ' + className;
            }
            wpdtEditor.setCellMeta(rowIndex, columnIndex, 'className', newClassName.trimStart());
        }

        /**
         * Create dynamic stylesheet rules
         */
        function addStylesheetRules(selector, propStr) {
            var styleEl;
            if (document.getElementById('wpdt-backend-simple-table-style') == null) {
                styleEl = document.createElement('style');
                styleEl.setAttribute('type', 'text/css');
                styleEl.setAttribute('id', 'wpdt-backend-simple-table-style')
                // Append <style> element to <head>
                document.head.appendChild(styleEl);
            } else {
                styleEl = document.getElementById('wpdt-backend-simple-table-style');
            }

            // Grab style element's sheet
            var styleSheet = styleEl.sheet;

            //Check if the cell contain link
            if (selector.indexOf('wpdt-tc') != -1)
                selector = $(selector + " > a").length > 0 ? selector + " > a" : selector;

            // Insert CSS Rule
            styleSheet.insertRule(selector + '{' + propStr + '}', styleSheet.cssRules.length);

        }

        /**
         * Adopt attachments from Media library for proper HTML tags
         */
        function adoptToHTML(attachment, displaySettings) {
            var content = attachment.url,
                url = attachment.url,
                type = attachment.type,
                link = '',
                linkHtml = '',
                classes = '',
                dataTypeContent = 'data-media-content="wpdt-media-content"',
                attrs = 'style="max-width: 100%; height: auto;"',
                isEmbed = false;

            if (attachment) {
                if (attachment.sizes) {
                    if (attachment.sizes[displaySettings.size]) {
                        url = attachment.sizes[displaySettings.size].url;
                        classes += ' align' + displaySettings.align + ' size-' + displaySettings.size;
                    }
                    if (attachment.sizes['full']) {
                        fullUrl = attachment.sizes['full'].url;
                    }

                    if (type == 'image') {
                        attrs = 'width="' + attachment.sizes[displaySettings.size].width + '" height="' + attachment.sizes[displaySettings.size].width + '"';
                    }
                }
                switch (displaySettings.link) {
                    case 'file':
                        link = attachment.url;
                        linkHtml = '<a ' + dataTypeContent + ' href="' + link + '">' + attachment.title + '</a>';
                        break;
                    case 'post':
                        link = attachment.link;
                        linkHtml = '<a ' + dataTypeContent + '  href="' + link + '">' + attachment.title + '</a>';
                        break;
                    case 'custom':
                        link = displaySettings.linkUrl;
                        break;
                    case 'embed':
                        isEmbed = true;
                        break;
                    default:
                        break;
                }
            }
            switch (type) {
                case 'image':
                    content = '<img  ' + dataTypeContent + '  src="' + url + '" class="' + classes + '" ' + attrs + ' />';
                    if (link) {
                        content = '<a href="' + link + '">' + content + '</a>';
                    }
                    break;
                case 'video':
                    if (isEmbed) {
                        content = '<div  ' + dataTypeContent + '  class="video-container"><video controls>';
                        content += '<source src="' + url + '" ' +
                            (typeof attachment.mime != 'undefined' ? 'type="' + attachment.mime + '"' : '') + '>';
                        content += '</video></div>';
                    } else if (linkHtml) {
                        content = linkHtml;
                    }
                    break;
                case 'audio':
                    if (isEmbed) {
                        content = '<div ' + dataTypeContent + '  class="audio-container"><audio controls>';
                        content += '<source src="' + url + '" ' +
                            (typeof attachment.mime != 'undefined' ? 'type="' + attachment.mime + '"' : '') + '>';
                        content += '</audio></div>';
                    } else if (linkHtml) {
                        content = linkHtml;
                    }
                    break;
                case 'application':
                    if (linkHtml) {
                        content = linkHtml;
                    }
                    break;
                default:
                    if (attachment.mime === 'text/csv') {
                        if (linkHtml) {
                            content = linkHtml;
                        }
                    }
                    break;
            }

            return content;

        }

        /**
         * Remove cell classes
         */
        function removeCellMetaClasses() {
            var selected = wpdtEditor.getSelected();

            for (var index = 0; index < selected.length; index += 1) {
                var item = selected[index],
                    startRow = Math.min(item[0], item[2]),
                    endRow = Math.max(item[0], item[2]),
                    startCol = Math.min(item[1], item[3]),
                    endCol = Math.max(item[1], item[3]);

                for (var rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
                    for (var columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {
                        wpdtEditor.setCellMeta(rowIndex, columnIndex, 'className', '');
                    }
                }
            }
            wpdtEditor.render();
        }
        function wdtApplyColorPickerSC(selectedCells, selecter) {
            var starRateElement = $("#wdt-backend-star-modal .rateYo");
            var element = '#' + selecter,
                defoult = jQuery(element).val() == "" ? '#FFD700' : jQuery(element).val(),
                partClass = selecter === 'wpdt-star-rating-color' ? 'wpdt-sc-': '',
                selectedStarColor = '';

            const pickr = new Pickr({
                el: element,
                useAsButton: true,
                default: defoult,
                theme: 'classic',
                autoReposition: true,
                position: 'bottom-end',
                outputPrecision: 1,
                comparison: true,
                lockOpacity: true,
                swatches: [
                    'rgba(244, 67, 54, 1)',
                    'rgba(233, 30, 99, 1)',
                    'rgba(156, 39, 176, 1)',
                    'rgba(103, 58, 183, 1)',
                    'rgba(63, 81, 181, 1)',
                    'rgba(33, 150, 243, 1)',
                    'rgba(3, 169, 244, 1)',
                    'rgba(0, 188, 212, 1)',
                    'rgba(0, 150, 136, 1)',
                    'rgba(76, 175, 80, 1)',
                    'rgba(139, 195, 74, 1)',
                    'rgba(205, 220, 57, 1)',
                    'rgba(255, 235, 59, 1)',
                    'rgba(255, 193, 7, 1)'
                ],
                components: {
                    preview: true,
                    opacity: false,
                    hue: true,
                    interaction: {
                        hex: true,
                        rgba: true,
                        hsla: false,
                        hsva: false,
                        cmyk: false,
                        clear: true,
                        input: true,
                        save: true
                    }
                }
            }).on('init', pickr => {

                pickr.show();
                selectedStarColor = pickr.getColor().toHEXA().toString(0).replace('#', "");
                jQuery(element).parent('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", pickr.getColor().toHEXA().toString(0));
                addDynamicStyle(selectedCells, selectedStarColor, partClass);

            }).on('save', color => {
                if (color != null) {
                    selectedStarColor = pickr.getColor().toHEXA().toString(0).replace('#', "");
                    jQuery(element).val(pickr.getColor().toHEXA().toString(0));
                    jQuery(element).change();
                    starRateElement.rateYo("option", "ratedFill", pickr.getColor().toHEXA().toString(0));
                    jQuery(element).parent('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", pickr.getColor().toHEXA().toString(0));
                    selectedStarColor = pickr.getColor().toHEXA().toString(0).replace('#', "");
                    addDynamicStyle(selectedCells, selectedStarColor, partClass);
                }
                pickr.hide();

            }).on('change', color => {
                jQuery(element).val(pickr.getColor().toHEXA().toString(0));
                starRateElement.rateYo("option", "ratedFill", pickr.getColor().toHEXA().toString(0));
                jQuery(element).closest('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", pickr.getColor().toHEXA().toString(0));
                selectedStarColor = pickr.getColor().toHEXA().toString(0).replace('#', "");
                jQuery(element).change();
                addDynamicStyle(selectedCells, selectedStarColor, partClass);

            }).on('clear', color => {
                jQuery(element).val('');
                jQuery(element).change();
                jQuery(element).parent('.wdt-color-picker').find('.wpcolorpicker-icon i').css("background", 'none');
            })
        }
        /**
         * Apply color picker on Text and Background color of cell
         */
        function wdtApplyColorPickerHT(selectedCells, selecter) {
            var element = '#' + selecter,
                defaultValueColor = selecter === 'wpdt-text-color' && document.getElementById(selecter).style.borderBottomColor === '' ? '#000000' : document.getElementById(selecter).style.borderBottomColor,
                defaultValueBgColor = selecter === 'wpdt-background-color' && document.getElementById(selecter).style.borderBottomColor === '' ? '#FFFFFF' : document.getElementById(selecter).style.borderBottomColor,
                partClass = selecter === 'wpdt-text-color' ? 'wpdt-tc-' : 'wpdt-bc-',
                selectedColor = '';
            const pickr = new Pickr({
                el: element,
                default: selecter === 'wpdt-text-color' ? defaultValueColor : defaultValueBgColor,
                theme: 'classic',
                useAsButton: true,
                autoReposition: true,
                position: 'bottom-start',
                outputPrecision: 1,
                comparison: true,
                lockOpacity: true,
                swatches: [
                    'rgba(244, 67, 54, 1)',
                    'rgba(233, 30, 99, 1)',
                    'rgba(156, 39, 176, 1)',
                    'rgba(103, 58, 183, 1)',
                    'rgba(63, 81, 181, 1)',
                    'rgba(33, 150, 243, 1)',
                    'rgba(3, 169, 244, 1)',
                    'rgba(0, 188, 212, 1)',
                    'rgba(0, 150, 136, 1)',
                    'rgba(76, 175, 80, 1)',
                    'rgba(139, 195, 74, 1)',
                    'rgba(205, 220, 57, 1)',
                    'rgba(255, 235, 59, 1)',
                    'rgba(255, 193, 7, 1)'
                ],
                components: {
                    preview: true,
                    opacity: false,
                    hue: true,
                    interaction: {
                        hex: true,
                        rgba: true,
                        hsla: false,
                        hsva: false,
                        cmyk: false,
                        clear: true,
                        input: true,
                        save: true
                    }
                }
            }).on('init', pickr => {
                jQuery(element).css("border-bottom-color", pickr.getColor().toHEXA().toString(0));
                pickr.show();
                selectedColor = pickr.getColor().toHEXA().toString(0).replace('#', "");
                addDynamicStyle(selectedCells, selectedColor, partClass);
            }).on('save', color => {
                if (color != null) {
                    jQuery(element).css("border-bottom-color", color.toHEXA().toString(0));
                    selectedColor = pickr.getColor().toHEXA().toString(0).replace('#', "");
                    addDynamicStyle(selectedCells, selectedColor, partClass);
                } else {
                    jQuery(element).css("border-bottom-color", "");
                }
                pickr.hide();
            }).on('change', color => {
                jQuery(element).css("border-bottom-color", color.toHEXA().toString(0));
                selectedColor = pickr.getColor().toHEXA().toString(0).replace('#', "");
                addDynamicStyle(selectedCells, selectedColor, partClass);
            }).on('clear', color => {
                jQuery(element).css("border-bottom-color", "");
                addDynamicStyle(selectedCells, '', partClass);
            })
        }

        /**
         * Cover actions buttons for cell customization
         */
        cellActionButtons.on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var selected = wpdtEditor.getSelected(),
                target = this.id,
                styleButtons = [
                    'wpdt-bold',
                    'wpdt-italic',
                    'wpdt-underline'
                ],
                expandButtons = [
                    'wpdt-align-left',
                    'wpdt-align-right',
                    'wpdt-align-center',
                    'wpdt-align-justify',
                    'wpdt-valign-top',
                    'wpdt-valign-middle',
                    'wpdt-valign-bottom',
                    'wpdt-wrap-text',
                    'wpdt-overflow-text',
                    'wpdt-clip-text'
                ]

            for (var index = 0; index < selected.length; index += 1) {
                var item = selected[index],
                    startRow = Math.min(item[0], item[2]),
                    endRow = Math.max(item[0], item[2]),
                    startCol = Math.min(item[1], item[3]),
                    endCol = Math.max(item[1], item[3]);

                for (var rowIndex = startRow; rowIndex <= endRow; rowIndex += 1) {
                    for (var columnIndex = startCol; columnIndex <= endCol; columnIndex += 1) {

                        if (target === 'wpdt-undo') {
                            wpdtEditor.undo();
                        }
                        if (target === 'wpdt-redo') {
                            wpdtEditor.redo();
                        }
                        if ($.inArray(target, expandButtons) !== -1 || $.inArray(target, styleButtons) !== -1) {
                            setCellClasses(rowIndex, columnIndex, target);
                        }
                    }
                }
            }
            disableButtons();
            wpdtEditor.render();
            updateActiveButtons();
            if ($.inArray(target, expandButtons) !== -1) {
                $('#' + target).parent().hide();
            }

        });
        /**
         * Cover actions buttons for table layout
         */
        tableActionButtons.on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var selectedRange = wpdtEditor.getSelectedRange()[0],
                numberOfColumnsToDelete = (selectedRange.to.col - selectedRange.from.col) + 1,
                numberOfRowsToDelete = (selectedRange.to.row - selectedRange.from.row) + 1,
                target = this.id;

            if (target === 'wpdt-add-column-left') {
                wpdtEditor.alter('insert_col', 0)
            }
            if (target === 'wpdt-add-column-right') {
                wpdtEditor.alter('insert_col', wpdtEditor.countCols())
            }
            if (target === 'wpdt-add-top-row') {
                wpdtEditor.alter('insert_row', 0);
            }
            if (target === 'wpdt-add-bottom-row') {
                wpdtEditor.alter('insert_row', wpdtEditor.countRows());
            }
            if (target === 'wpdt-insert-column-before') {
                wpdtEditor.alter('insert_col', wpdtEditor.getSelectedLast()[1], 1)
            }
            if (target === 'wpdt-insert-column-after') {
                wpdtEditor.alter('insert_col', wpdtEditor.getSelectedLast()[1] + 1, 1)
            }
            if (target === 'wpdt-insert-row-before') {
                wpdtEditor.alter('insert_row', wpdtEditor.getSelectedLast()[0], 1)
            }
            if (target === 'wpdt-insert-row-after') {
                wpdtEditor.alter('insert_row', wpdtEditor.getSelectedLast()[0] + 1, 1)
            }
            if (target === 'wpdt-remove-column') {
                wpdtEditor.alter('remove_col', wpdtEditor.getSelectedLast()[1], numberOfColumnsToDelete)
            }
            if (target === 'wpdt-remove-row') {
                wpdtEditor.alter('remove_row', wpdtEditor.getSelectedLast()[0], numberOfRowsToDelete)
            }
            disableButtons();
            wpdtEditor.render();
            $('#wpdt-column-actions, #wpdt-row-actions').hide();

        });
        $('#wpdt-column-button').click(function () {
            if ($('#wpdt-column-actions').is(':hidden')) {
                $('#wpdt-column-actions').show()
            } else {
                $('#wpdt-column-actions').hide()
            }
        }).blur(function (e) {
            let target = e.relatedTarget !== null ? e.relatedTarget.id : '';
            let selectors = ['wpdt-add-column-left', 'wpdt-add-column-right', 'wpdt-insert-column-before', 'wpdt-insert-column-after', 'wpdt-remove-column'];
            if (jQuery.inArray(target, selectors) === -1) {
                $('#wpdt-column-actions').hide()
            }
        })
        $('#wpdt-row-button').click(function () {
            if ($('#wpdt-row-actions').is(':hidden')) {
                $('#wpdt-row-actions').show()
            } else {
                $('#wpdt-row-actions').hide()
            }
        }).blur(function (e) {
            let target = e.relatedTarget !== null ? e.relatedTarget.id : '';
            let selectors = ['wpdt-add-top-row', 'wpdt-add-bottom-row', 'wpdt-insert-row-before', 'wpdt-insert-row-after', 'wpdt-remove-row'];
            if (jQuery.inArray(target, selectors) === -1) {
                $('#wpdt-row-actions').hide()
            }
        })
        $('#wpdt-align-button').click(function () {
            if ($('#wpdt-align-buttons').is(':hidden')) {
                $('#wpdt-align-buttons').show()
            } else {
                $('#wpdt-align-buttons').hide()
            }
        }).blur(function (e) {
            let target = e.relatedTarget !== null ? e.relatedTarget.id : '';
            let selectors = ['wpdt-align-justify', 'wpdt-align-right', 'wpdt-align-left', 'wpdt-align-center'];
            if (jQuery.inArray(target, selectors) === -1) {
                $('#wpdt-align-buttons').hide()
            }
        })

        $('#wpdt-valign-button').click(function () {
            if ($('#wpdt-valign-buttons').is(':hidden')) {
                $('#wpdt-valign-buttons').show()
            } else {
                $('#wpdt-valign-buttons').hide()
            }
        }).blur(function (e) {
            let target = e.relatedTarget !== null ? e.relatedTarget.id : '';
            let selectors = ['wpdt-valign-top', 'wpdt-valign-middle', 'wpdt-valign-bottom'];
            if (jQuery.inArray(target, selectors) === -1) {
                $('#wpdt-valign-buttons').hide()
            }
        })
        $('#wpdt-wrap-button').click(function () {
            if ($('#wpdt-wrap-buttons').is(':hidden')) {
                $('#wpdt-wrap-buttons').show()
            } else {
                $('#wpdt-wrap-buttons').hide()
            }
        }).blur(function (e) {
            let target = e.relatedTarget !== null ? e.relatedTarget.id : '';
            let selectors = ['wpdt-wrap-text', 'wpdt-overflow-text', 'wpdt-clip-text'];
            if (jQuery.inArray(target, selectors) === -1) {
                $('#wpdt-wrap-buttons').hide()
            }
        })

        /**
         * Apply color for text and background of the cell
         */
        $('#wpdt-text-color, #wpdt-background-color ').on('click', function (e) {
            let target = $(this)[0].id,
                selectedCells = wpdtEditor.getSelected();
            $('.pcr-app').remove();
            wdtApplyColorPickerHT(selectedCells, target)
        });

        /**
         * Apply color for star rating
         */
        $('#wpdt-star-rating-color').on('click', function (e) {
            let target = $(this)[0].id,
                selectedCells = wpdtEditor.getSelected();
            $('.pcr-app').remove();
            wdtApplyColorPickerSC(selectedCells, target);
        });

        /**
         * Apply font-size and font-family for text in the cell
         */
        $('#wpdt-font-size,#wpdt-font-family').on('change', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            let target = $(this)[0].id,
                selectValue = $(this).val(),
                selectedCells = wpdtEditor.getSelected(),
                fontFamilyArr = $(this).data('wpdt-fonts'),
                partClass = (target == 'wpdt-font-size') ? 'wpdt-fs-' : 'wpdt-ff-';
            addDynamicStyle(selectedCells, selectValue, partClass, fontFamilyArr);
        });
        /**
         * Insert media in cell
         */
        $('#wpdt-media').click(function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.preventDefault();
            let selectedRange = wpdtEditor.getSelectedRange()[0],
                highlightRow = selectedRange.highlight.row,
                highlightCol = selectedRange.highlight.col;

            wp.media.editor.send.attachment = function (props, attachment) {
                window.wpActiveEditor = null;
                wpdtEditor.setDataAtCell(highlightRow, highlightCol, adoptToHTML(attachment, props));
                $('.wdt-save-data').click();
            };
            if (typeof wp !== 'undefined' && wp.media && wp.media.editor)
                wp.media.editor.open();
            return false;
        });

        /**
         * Clear table
         */
        $('#wpdt-clear').on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var modal = $('#wdt-backend-warning-modal');
            modal.modal('show');
            $('#wdt-backend-clear-table-data-button').on('click', function () {
                wpdtEditor.clear();
                wpdtEditor.allHeights.fill(undefined);
                wpdtEditor.allWidths.fill(100)
                removeCellMetaClasses();
                let heightHT = $('.ht_master .wtHider');
                wpdtEditor.updateSettings({
                    height: setHeightHT(heightHT),
                    colWidths: 100,
                    width: '100%',
                    mergeCells: []
                });
                modal.modal('hide');
            })

        });

        /**
         * Show warrnign modal before clear table data
         */
        $('#wdt-backend-warning-modal').on('hide.bs.modal', function (e) {
            let heightHT = $('.ht_master .wtHider');
            wpdtEditor.updateSettings({
                height: setHeightHT(heightHT),
            });
        })

        /**
         * Merge/Split cells
         */
        $('#wpdt-merge').on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            wpdtEditor.getPlugin('mergeCells').toggleMergeOnSelection(wpdtEditor.getSelectedRange());

            wpdtEditor.render();
            var mergeCells = wpdtEditor.getPlugin('mergeCells').mergedCellsCollection.mergedCells;
            if (mergeCells) {
                var tmpMergeCells = mergeCells.map(function (item) {
                    delete item.removed;
                    return item;
                });

                wpdtEditor.updateSettings({
                    mergeCells: tmpMergeCells
                });
            }
        });
        /**
         * Insert link in cell
         */
        $('#wpdt-link').on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            let selectedRange = wpdtEditor.getSelectedRange()[0],
                highlightRow = selectedRange.highlight.row,
                highlightCol = selectedRange.highlight.col;
            var modal = $('#wdt-backend-link-modal'),
                linkData,
                cellData = wpdtEditor.getDataAtCell(highlightRow, highlightCol);
            modal.modal('show');
            if (cellData != null && cellData.indexOf('wpdt-link-content') >= 0) {
                linkData = $('#wpdt-table-editor').find('[data-cell-id="' + highlightRow + highlightCol + '"]')
                $('#wpdt-link-url').val(linkData.data('link-url'));
                $('#wpdt-link-text').val(linkData.data('link-text'));
                $("#wpdt-link-target-attribute").prop("checked", linkData.data('link-target') === true);
                $("#wpdt-link-nofollow-attribute").prop("checked", linkData.data('link-nofollow') === true);
                $("#wpdt-link-noreferrer-attribute").prop("checked", linkData.data('link-noreferrer') === true);
                $("#wpdt-link-sponsored-attribute").prop("checked", linkData.data('link-sponsored') === true);
                $("#wpdt-link-button-attribute").prop("checked", linkData.data('link-btn-status') === true);
                if (linkData.data('link-btn-status') === true) {
                    $('div.wpdt-link-button-class-block').show();
                } else {
                    $('div.wpdt-link-button-class-block').hide();
                }

                $("#wpdt-button-class").val(linkData.data('link-btn-class'));
            } else {
                $('#wpdt-link-url').val('');
                $('#wpdt-link-text').val('');
                $("#wpdt-link-target-attribute").prop("checked", false);
                $("#wpdt-link-nofollow-attribute").prop("checked", false);
                $("#wpdt-link-noreferrer-attribute").prop("checked", false);
                $("#wpdt-link-sponsored-attribute").prop("checked", false);
                $("#wpdt-link-button-attribute").prop("checked", false);
                $('div.wpdt-link-button-text-block').hide();
                $('div.wpdt-link-button-class-block').hide();
                $("#wpdt-button-class").val('');
            }

            $('#wdt-backend-insert-link-button').on('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                let targetAttr, rel, nofollowAttr, noreferrerAttr, sponsoredAttr, formdata, dataAttr,
                    selectedRange = wpdtEditor.getSelectedRange()[0],
                    highlightRow = selectedRange.highlight.row,
                    highlightCol = selectedRange.highlight.col,
                    linkUrl = $('#wpdt-link-url'),
                    linkUrlValue = linkUrl.val(),
                    linkText = $('#wpdt-link-text'),
                    linkTextValue = linkText.val(),
                    linkTarget = $("#wpdt-link-target-attribute").is(":checked") || 0,
                    linkNofollow = $("#wpdt-link-nofollow-attribute").is(":checked") || 0,
                    linkNoreferrer = $("#wpdt-link-noreferrer-attribute").is(":checked") || 0,
                    linkSponsored = $("#wpdt-link-sponsored-attribute").is(":checked") || 0,
                    linkButtonStatus = $("#wpdt-link-button-attribute").is(":checked") || 0,
                    buttonClass = $("#wpdt-button-class").val(),
                    pattern = new RegExp('^(https?)://');

                targetAttr = linkTarget ? "_blank" : "_self";
                nofollowAttr = linkNofollow ? ' nofollow ' : '';
                noreferrerAttr = linkNoreferrer ? ' noreferrer ' : '';
                sponsoredAttr = linkSponsored ? ' sponsored ' : '';
                rel = nofollowAttr + noreferrerAttr + sponsoredAttr;

                if (linkUrlValue == '') {
                    linkUrl.closest('.col-sm-12').siblings('.error-msg').show();
                    linkUrl.addClass('error-border');
                    return;
                }
                if (linkTextValue == '') {
                    linkText.closest('.col-sm-12').siblings('.error-msg').show();
                    linkText.addClass('error-border');
                    return;
                }
                if (!pattern.test(linkUrlValue)) {
                    linkUrl = "http://" + linkUrlValue;
                } else {
                    linkUrl = linkUrlValue;
                }
                linkUrl = _.escape(linkUrl);
                linkTextValue = _.escape(linkTextValue);
                buttonClass = _.escape(buttonClass);
                dataAttr = ' data-cell-id="' + highlightRow + highlightCol + '"';
                dataAttr += ' data-link-url="' + linkUrl + '"';
                dataAttr += ' data-link-text="' + linkTextValue + '"';
                dataAttr += ' data-link-target="' + linkTarget + '"';
                dataAttr += ' data-link-nofollow="' + linkNofollow + '"';
                dataAttr += ' data-link-noreferrer="' + linkNoreferrer + '"';
                dataAttr += ' data-link-sponsored="' + linkSponsored + '"';
                dataAttr += ' data-link-btn-status="' + linkButtonStatus + '"';
                dataAttr += ' data-link-btn-class="' + buttonClass + '"';
                dataAttr += ' data-link-content="wpdt-link-content"';

                if (!linkButtonStatus) {
                    formdata = '<a class="wpdt-link-content" href="' + linkUrl + '" ' + ' rel="' + rel + '"' + ' target="' + targetAttr + '"' + dataAttr + '>' + linkTextValue + '</a>';
                } else {
                    formdata = '<a class="wpdt-link-content" href="' + linkUrl + '" ' + ' rel="' + rel + '"' + ' target="' + targetAttr + '" ' + dataAttr + '><button class="' + buttonClass + '">' + linkTextValue + '</button></a>';
                }

                wpdtEditor.setDataAtCell(highlightRow, highlightCol, formdata);
                modal.modal('hide');
                $('.wdt-save-data').click();
            });
            $('#wpdt-link-url,#wpdt-link-text').on('focus', function () {
                $(this).removeClass('error-border')
                $(this).closest('.col-sm-12').siblings('.error-msg').hide();
            });

        });

        /**
         * Show/hide buton class input in link modal
         */
        $('#wpdt-link-button-attribute').change(function (e) {
            if ($('#wpdt-link-button-attribute').is(':checked')) {
                $('div.wpdt-link-button-class-block').show();
            } else {
                $('div.wpdt-link-button-class-block').hide();
            }
        });

        /**
         * Insert HTML in cell
         */
        $('#wpdt-html').on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            let selectedRange = wpdtEditor.getSelectedRange()[0],
                highlightRow = selectedRange.highlight.row,
                highlightCol = selectedRange.highlight.col,
                modal = $('#wdt-backend-html-modal');
            if (tinymce.activeEditor)
                tinymce.activeEditor.setContent('');
            tinymce.execCommand('mceRemoveEditor', true, $(this).attr('id'));
            tinymce.init({
                selector: '#wpdt-tiny-mce',
                init_instance_callback: function (editor) {
                    let selectedRange = wpdtEditor.getSelectedRange()[0],
                        highlightRow = selectedRange.highlight.row,
                        highlightCol = selectedRange.highlight.col,
                        cellData = wpdtEditor.getDataAtCell(highlightRow, highlightCol);
                    if (cellData != null && cellData.indexOf('wpdt-html-content') >= 0) {
                        editor.setContent(cellData);
                    } else {
                        editor.setContent($('#wpdt-tiny-mce').val());
                    }
                },
                height: "400",
                menubar: false,
                plugins: 'link image media lists hr colorpicker fullscreen textcolor code',
                toolbar: 'undo redo formatselect bold italic underline strikethrough subscript superscript | alignleft aligncenter alignright alignjustify | bullist numlist outdent indent blockquote | hr fullscreen | link unlink image | forecolor backcolor | code '
            });

            if (wpdtEditor.getDataAtCell(highlightRow, highlightCol) != null && wpdtEditor.getDataAtCell(highlightRow, highlightCol).indexOf('wpdt-html-content') >= 0) {
                tinymce.activeEditor.setContent(wpdtEditor.getDataAtCell(highlightRow, highlightCol));
            } else {
                if ($('#wdt-backend-html-modal .mce-container .mce-active').length !== 0) {
                    tinymce.activeEditor.execCommand('selectAll');
                    tinymce.activeEditor.execCommand('RemoveFormat');
                }
            }
            modal.modal('show');
            $('#wdt-backend-insert-html-button').on('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                let selectedRange = wpdtEditor.getSelectedRange()[0],
                    highlightRow = selectedRange.highlight.row,
                    highlightCol = selectedRange.highlight.col,
                    cellHTMLContent = '';
                if(tinyMCE.activeEditor.getContent().indexOf('wpdt-html-content') >= 0) {
                    cellHTMLContent = tinyMCE.activeEditor.getContent();
                } else {
                    cellHTMLContent = '<div data-type-content="wpdt-html-content">'
                        + tinyMCE.activeEditor.getContent()
                        + '</div>';
                }
                wpdtEditor.setDataAtCell(highlightRow, highlightCol, cellHTMLContent);
                wpdtEditor.render();
                modal.modal('hide');
                $('.wdt-save-data').click();
            })

        });

        /**
         * Insert shortcode in cell
         */
        $('#wpdt-do-shortcode').on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            let shortcode,
                selectedRange = wpdtEditor.getSelectedRange()[0],
                highlightRow = selectedRange.highlight.row,
                highlightCol = selectedRange.highlight.col,
                modal = $('#wdt-backend-shortcode-modal'),
                cellData = wpdtEditor.getDataAtCell(highlightRow, highlightCol);

            modal.modal('show');
            if (cellData != null && cellData.indexOf('wpdt-do-shortcode') >= 0) {
                shortcode = $('#wpdt-table-editor').find('[data-cell-id="' + highlightRow + highlightCol + '"]')
                $('#wpdt-shortcode-data').val(shortcode.data('shortcode'));
            } else {
                $('#wpdt-shortcode-data').val('');
            }
            $('#wdt-backend-insert-shortcode-button').on('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                let formatData,
                    selectedRange = wpdtEditor.getSelectedRange()[0],
                    highlightRow = selectedRange.highlight.row,
                    highlightCol = selectedRange.highlight.col,
                    shortcodeData = $('#wpdt-shortcode-data').val(),
                    shortcodeDataValue = _.escape(shortcodeData.trim());

                if (shortcodeData == '') {
                    shortcodeData.closest('.col-sm-12').siblings('.error-msg').show();
                    shortcodeData.addClass('error-border');
                    return;
                }
                formatData = '<span data-content="wpdt-do-shortcode" ';
                formatData += 'data-cell-id="' + highlightRow + highlightCol + '" ';
                formatData += 'data-shortcode="' + shortcodeDataValue + '">';
                formatData += shortcodeDataValue
                formatData += '</span>';

                wpdtEditor.setDataAtCell(highlightRow, highlightCol, formatData);
                wpdtEditor.selectCell(highlightRow, highlightCol);
                wpdtEditor.render();
                modal.modal('hide');
                $('.wdt-save-data').click();
            })

        });

        $('#wpdt-star-rating-number').change(function (e) {
            if ($('#wpdt-star-rating-number').is(':checked')) {
                $('#wdt-backend-star-modal .rateYo').css("margin-bottom", "5px");
                $('#wdt-backend-star-modal .rateNum').show();
                $('#wdt-backend-star-modal .rateNum').css("margin-bottom", "55px");
            } else {
                $('#wdt-backend-star-modal .rateYo').css("margin-bottom", "55px");
                $('#wdt-backend-star-modal .rateNum').hide();
                $('#wdt-backend-star-modal .rateNum').css("margin-bottom", "5px");
            }
        });

        /**
         * Insert star rating in cell
         */
        $('#wpdt-star-rating').on('click', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var starData,
                colHeaderArr = wpdtEditor.getColHeader(),
                selectedRange = wpdtEditor.getSelectedRange()[0],
                highlightRow = selectedRange.highlight.row,
                highlightCol = selectedRange.highlight.col,
                modal = $('#wdt-backend-star-modal'),
                starRateElement = $("#wdt-backend-star-modal .rateYo"),
                starRateNumber = $('#wdt-backend-star-modal .rateNum'),
                cellData = wpdtEditor.getDataAtCell(highlightRow, highlightCol);

            modal.modal('show');
            if (cellData != null && cellData.indexOf('wpdt-star-rating') >= 0) {
                starData = $('#wpdt-table-editor').find('[data-cell-id="' + colHeaderArr[highlightCol] + highlightRow + '"]')
                if ($("#wdt-backend-star-modal .jq-ry-container").length)
                    starRateElement.rateYo('destroy');
                starRateElement.rateYo({
                    normalFill: "#A0A0A0",
                    ratedFill : (starData.data('star-color') === '') ? "#FFD700" : starData.data('star-color'),
                    halfStar: true,
                    numStars: starData.data('star-num'),
                    maxValue: starData.data('star-num'),
                    rating: starData.data('star-rating')
                });
                $('#wpdt-star-number').val(starData.data('star-num'));
                if (starData.data('star-show-number') === true) {
                    $("#wpdt-star-rating-number").prop("checked", true);
                    starRateElement.css("margin-bottom", "0");
                    starRateNumber.css("margin-bottom", "55px");
                    starRateNumber.empty().show().append(starData.data('star-rating') + '/' + starData.data('star-num'));
                } else {
                    $("#wpdt-star-rating-number").prop("checked", false);
                    starRateElement.css("margin-bottom", "55px");
                    starRateNumber.empty().hide().append(starData.data('star-rating') + '/' + starData.data('star-num'));
                }

                $('#wpdt-star-rating-color').val(starData.data('star-color'));
                if (starData.data('star-color') === '') {
                    jQuery('#wpdt-star-rating-color')
                        .closest('.wdt-color-picker')
                        .find('.wpcolorpicker-icon i')
                        .css("background", 'none');
                } else {
                    jQuery('#wpdt-star-rating-color')
                        .closest('.wdt-color-picker')
                        .find('.wpcolorpicker-icon i')
                        .css("background", starData.data('star-color'));
                }
            } else {
                if ($("#wdt-backend-star-modal .jq-ry-container").length)
                    starRateElement.rateYo('destroy');
                jQuery('#wpdt-star-rating-color')
                    .closest('.wdt-color-picker')
                    .find('.wpcolorpicker-icon i')
                    .css("background", 'none');
                jQuery('#wpdt-star-rating-color').val('');
                starRateElement.rateYo({
                    normalFill: "#A0A0A0",
                    halfStar: true,
                    numStars: 5,
                    maxValue: 5,
                    rating: 0
                });
                starRateElement.css("margin-bottom", "55px");
                starRateNumber.empty().hide().append('0/5');
                $('#wpdt-star-number').val(5);
                $('.wdt-button-plus[data-field="wpdt-star-number"]').attr("disabled", false);
                $("#wpdt-star-rating-number").prop("checked", false);
            }
            starRateNumber.css("font-size", "20px");

            $('#wpdt-star-number').on('change input focus', function () {
                let starNum,
                    starNumEl = $(this),
                    starNumValue = $(this).val(),
                    starRatingNumber = starRateElement.rateYo("rating");

                if (starNumValue == '' || isNaN(starNumValue)) {
                    starNumEl.val(1)
                    return;
                }
                if (starNumValue > 9) {
                    starNum = 10;
                    $('.wdt-button-plus[data-field="wpdt-star-number"]').attr("disabled", true);
                    starNumEl.val('10')
                } else {
                    starNum = starNumValue
                    $('.wdt-button-plus[data-field="wpdt-star-number"]').attr("disabled", false);
                }
                starRateElement.rateYo("option", "numStars", starNum);
                starRateElement.rateYo("option", "maxValue", starNum);
                starRatingNumber = starRatingNumber > starNum ? starNum : starRatingNumber;
                starRateNumber.html(starRatingNumber + '/' + starNum);
            })

            starRateElement.rateYo("option", "onSet", function () {
                starRateNumber.empty();
                starRateElement.rateYo("option", "maxValue", starRateElement.rateYo("option", "numStars"));
                let maxValue = starRateElement.rateYo("option", "numStars"),
                    rating = starRateElement.rateYo("rating");
                starRateNumber.append(rating + '/' + maxValue);
            });

            $('#wdt-backend-insert-star-button').on('click', function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                let formatData, starWrapper, ratingEnd, isInt,
                    selectedRange = wpdtEditor.getSelectedRange()[0],
                    highlightRow = selectedRange.highlight.row,
                    highlightCol = selectedRange.highlight.col,
                    starRateElement = $("#wdt-backend-star-modal .rateYo");
                var maxValue = parseInt(starRateElement.rateYo("option", "maxValue")),
                    rating = starRateElement.rateYo("option", "rating"),
                    showNumber = $('#wpdt-star-rating-number').is(":checked"),
                    starColor =jQuery('#wpdt-star-rating-color').val();
                    colHeaderArr = wpdtEditor.getColHeader();


                starRateElement.css("margin-bottom", "5px");
                starWrapper = '<div class="rating">';
                isInt = Number.isInteger(rating);
                ratingEnd = rating % 1 === 0 ? rating : Math.floor(rating)
                for (var i = 0; i < maxValue; i++) {
                    if (i < ratingEnd) {
                        starWrapper += '<span class="full rated"></span>';
                    } else if (!isInt && i == ratingEnd) {
                        starWrapper += '<span class="half half-reflect"></span>';
                    } else {
                        starWrapper += '<span class="full"></span>';
                    }
                }
                starWrapper += '</div>';
                if (showNumber) {
                    starWrapper += '<div class="rateNum">' + rating + '/' + maxValue + '</div>'
                }

                $('#wdt-backend-star-modal .rateNum').css("margin-bottom", "0");
                formatData = '<span data-content="wpdt-star-rating" ';
                formatData += 'data-cell-id="' + colHeaderArr[highlightCol] + highlightRow + '" ';
                formatData += 'data-star-num="' + maxValue + '" ';
                formatData += 'data-star-rating="' + rating + '" ';
                formatData += 'data-star-color="' + starColor + '" ';
                formatData += 'data-star-show-number="' + showNumber + '">';
                formatData += starWrapper;
                formatData += '</span>';

                wpdtEditor.setDataAtCell(highlightRow, highlightCol, formatData);
                wpdtEditor.render();
                modal.modal('hide');
                $('.wdt-save-data').click();
            })

        });

        /**
         * Prevent bootstrap dialog from blocking focusin on Tinymce editor
         */
        $(document).on('focusin', function (e) {
            if ($(e.target).closest(".mce-window").length) {
                e.stopImmediatePropagation();
            }
        });

        /**
         * Set wpdtEditor Hooks
         */
        if (container.length) {

            wpdtEditor.addHook('beforeCellAlignment', function (stateBefore, range, type, alignmentClass) {
                disableButtons();
            });
            wpdtEditor.addHook('beforeInit', function (stateBefore, range, type, alignmentClass) {
                disableButtons();
            });
            wpdtEditor.addHook('afterChange', function (changes) {
                let value,
                    pattern = new RegExp('^(https?)://');
                if (changes != null) {
                    changes.forEach(function (change) {
                        var row = change[0],
                            col = change[1],
                            newVal = change[3];
                        if (pattern.test(newVal)) {
                            value = '<a href="' + newVal + '" target="_blank">' + newVal + '</a>'
                            wpdtEditor.setDataAtCell(row, col, value);
                        }
                    })
                }
                disableButtons();
                updateActiveButtons()
                wpdtEditor.render();
            });

            wpdtEditor.addHook('afterLoadData', function () {
                getWidthData();
                getHeightData();
                wpdtEditor.updateSettings({
                    manualRowResize: true,
                    colHeaders: true,
                    renderer: 'html'
                });
            });
            wpdtEditor.addHook('afterCreateRow', function (insertRowIndex, amount, source) {
                disableButtons();
                getWidthData();
                getHeightData();
                wpdtEditor.selectCell(0, 0)
            });
            wpdtEditor.addHook('afterCreateCol', function (insertColumnIndex, amount, source) {
                disableButtons();
                insertColumnIndex = typeof (insertColumnIndex) != 'undefined' ? insertColumnIndex : 0;
                var selectedCell = wpdtEditor.getSelected()[0],
                    selectedColumnIndex = 0;

                if (selectedCell && selectedCell[1] && selectedCell[3]) {
                    var isMin = (selectedCell[1] <= selectedCell[3] ? 1 : 3);
                    if (insertColumnIndex == selectedCell[isMin]) {
                        selectedColumnIndex = selectedCell[isMin];
                    } else {
                        selectedColumnIndex = selectedCell[(isMin == 1 ? 3 : 1)];
                    }
                }
                if (source == 'UndoRedo.undo') {
                    amount = amount - insertColumnIndex + 1;
                    if (amount <= 0) amount = 1;
                }
                getWidthData();
                for (var n = 0; n < amount; n++) {
                    wpdtEditor.allWidths.splice(insertColumnIndex + n, 0, wpdtEditor.allWidths[selectedColumnIndex]);
                }
                getHeightData();
                wpdtEditor.selectCell(0, 0)
            });
            wpdtEditor.addHook('afterRemoveRow', function (from, amount) {
                getHeightData();
                wpdtEditor.allHeights.splice(from, amount);

                var countRows = wpdtEditor.countRows(),
                    plugin = wpdtEditor.getPlugin('ManualRowResize');

                for (var i = 0; i < countRows; i++) {
                    var colHeight = wpdtEditor.getRowHeight(i);

                    if (colHeight !== wpdtEditor.allHeights[i]) {
                        plugin.setManualSize(i, wpdtEditor.allHeights[i]);
                    }
                }
                disableButtons();
                // setTimeout(function () {
                //     let heightHT = $('.ht_master .wtHider');
                //     wpdtEditor.updateSettings({
                //         height: setHeightHT(heightHT)
                //     });
                // }, 500);

            });
            wpdtEditor.addHook('afterRemoveCol', function (from, amount) {
                getWidthData();
                wpdtEditor.allWidths.splice(from, amount);

                var countCols = wpdtEditor.countCols(),
                    plugin = wpdtEditor.getPlugin('ManualColumnResize');

                for (var i = 0; i < countCols; i++) {
                    var colWidth = wpdtEditor.getColWidth(i);
                    if (colWidth !== wpdtEditor.allWidths[i]) {
                        plugin.setManualSize(i, wpdtEditor.allWidths[i]);
                    }
                }
                disableButtons();
            });
            wpdtEditor.addHook('afterRowResize', function (row, height) {
                getHeightData();
                wpdtEditor.allHeights.splice(row, 1, height);
            });
            wpdtEditor.addHook('afterColumnResize', function (column, width) {
                getWidthData();
                wpdtEditor.allWidths.splice(column, 1, width);
            });
            wpdtEditor.addHook('afterCopy', function (changes, copyCoords) {
                getCellsMetaData(changes, copyCoords);
            });
            wpdtEditor.addHook('afterCut', function (changes, cutCoords) {
                getCellsMetaData(changes, cutCoords);
            });
            wpdtEditor.addHook('afterPaste', function (changes, pasteCoords) {
                var rowsCopyCount = pasteCoords[0].startRow + cpRowsCount - 1,
                    colsCopyCount = pasteCoords[0].startCol + cpColsCount - 1,
                    endRow = pasteCoords[0].endRow < rowsCopyCount ? rowsCopyCount : pasteCoords[0].endRow,
                    endCol = pasteCoords[0].endCol < colsCopyCount ? colsCopyCount : pasteCoords[0].endCol,
                    j = 0;

                for (var i = 0; i < pasteCoords.length; i++) {
                    for (var row = pasteCoords[i].startRow; row <= endRow; row++) {
                        for (var col = pasteCoords[i].startCol; col <= endCol; col++) {
                            if (!cpCellsMetaData[j]) {
                                j = 0;
                            }
                            if (cpCellsMetaData[j]) {
                                var value = wpdtEditor.getSourceDataAtCell(cpCellsMetaData[j].row, cpCellsMetaData[j].col);
                                if (value) {
                                    wpdtEditor.setDataAtCell(row, col, value);
                                }
                                wpdtEditor.setCellMetaObject(row, col, cpCellsMetaData[j]);
                                j++;
                            }
                        }
                    }
                }
                wpdtEditor.render();
            });
        }

        /**
         * Set wpdtEditor height after tabs switching
         */
        $('.wdt-simple-table-settings .edit-table-settings-tab a[data-toggle="tab"]').on('shown.bs.tab', function (e) {
            setTimeout(function () {
                let heightHT = $('.ht_master .wtHider');
                wpdtEditor.updateSettings({
                    height: setHeightHT(heightHT)
                });
                $('.wdt-save-data').click()
            }, 1000);
        });

        /**
         * Remove Simple Table alert message
         */
        $(document).on('click', '.wdt-simple-table-alert button', function (e) {
            e.preventDefault();
            $.ajax({
                url: ajaxurl,
                method: "POST",
                data: {
                    'action': 'wdtHideSimpleTableAlert'
                },
                dataType: "json",
                async: !0,
                success: function (e) {
                    if (e == "success") {
                        $('.wdt-simple-table-alert').slideUp('fast');
                    }
                }
            });
        })
    });

})(jQuery);