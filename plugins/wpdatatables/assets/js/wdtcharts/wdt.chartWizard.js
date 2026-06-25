if (typeof constructedChartData == 'undefined') {
    var constructedChartData = {};
}

var wdtChartColumnsData = {};


(function ($) {
    var wdtChart = null;
    var nextStepButton = $('#wdt-chart-wizard-next-step');
    var previousStepButton = $('#wdt-chart-wizard-previous-step');
    let chartSourcePicker = $('#wpdatatables-chart-source');

    $('.wdt-chart-wizard-chart-selecter-block .card').on('click', function () {
        $('.wdt-chart-wizard-chart-selecter-block .card').removeClass('selected').addClass('not-selected');
        nextStepButton.prop('disabled', true);
        if ( !($(this).data('type') == 'google_marker_geo_chart'||
            $(this).data('type') == 'google_text_geo_chart'||
            $(this).data('type') == 'google_geo_chart')) {
                $(this).addClass('selected').removeClass('not-selected');
                nextStepButton.prop('disabled', false);
        }
    });

    /**
     * Steps switcher (Next)
     */
    nextStepButton.click(function (e) {
        e.preventDefault();

        var curStep = $('div.chart-wizard-step:visible').data('step');
        $('div.chart-wizard-step').hide();
        $('li.chart_wizard_breadcrumbs_block').removeClass('active');
        $('.wdt-preload-layer').animateFadeIn();

        switch (curStep) {
            case 'step1':
                // Data source
                constructedChartData.type = $('.wdt-chart-wizard-chart-selecter-block .card.selected').data('type');
                constructedChartData.min_columns = parseInt($('.card.selected').data('min_columns'));
                constructedChartData.max_columns = parseInt($('.card.selected').data('max_columns'));
                $('div.chart-wizard-step.step2').show();
                $('li.chart_wizard_breadcrumbs_block.step2').addClass('active');
                constructedChartData.title = $('#chart-name').val();
                constructedChartData.engine = $('#chart-render-engine').val();
                if (constructedChartData.engine == 'google') {

                    $("#chart-js-container").hide();
                    $("#google-chart-container").show();

                    $(".highcharts").hide();
                    $(".chartjs").hide();
                    $(".google").show();

                    $('#curve-type-row').hide();
                    $('#three-d-row').hide();
                    $('#background_color_row').show();
                    $('#border_width_row').show();
                    $('#border_color_row').show();
                    $('#border_radius_row').show();
                    $('#plot_background_color_row').show();
                    $('#plot-border-width-row').show();
                    $('#plot_border_color_row').show();
                    $('#font-size-row').show();
                    $('#font-name-row').show();
                    $('.series').show();
                    $('.axes').show();
                    $('#show-grid-row').show();
                    $('#horizontal-axis-crosshair-row').show();
                    $('#vertical-axis-crosshair-row').show();
                    $('.title').show();
                    $('#title-floating-row').show();
                    $('.tooltip').show();
                    $('.legend').show();
                    $('#inverted-row').show();

                    switch (constructedChartData.type) {
                        case 'google_column_chart':
                            $('#horizontal-axis-crosshair-row').hide();
                            $('#vertical-axis-crosshair-row').hide();
                            break;
                        case 'google_histogram':
                            $('#horizontal-axis-crosshair-row').hide();
                            $('#vertical-axis-crosshair-row').hide();
                            break;
                        case 'google_bar_chart':
                            $('#horizontal-axis-crosshair-row').hide();
                            $('#vertical-axis-crosshair-row').hide();
                            break;
                        case 'google_stacked_bar_chart':
                            $('#horizontal-axis-crosshair-row').hide();
                            $('#vertical-axis-crosshair-row').hide();
                            $('#inverted-row').hide();
                            break;
                        case 'google_line_chart':
                            $('#curve-type-row').show();
                            break;
                        case 'google_stepped_area_chart':
                            $('#horizontal-axis-crosshair-row').hide();
                            $('#vertical-axis-crosshair-row').hide();
                            break;
                        case 'google_pie_chart':
                            $('#plot_background_color_row').hide();
                            $('#plot-border-width-row').hide();
                            $('#plot_border_color_row').hide();
                            $('#three-d-row').show();
                            $('.axes').hide();
                            $('#title-floating-row').hide();
                            $('.series').hide();
                            break;
                        case 'google_bubble_chart':
                            $('.legend').hide();
                            break;
                        case 'google_donut_chart':
                            $('#plot_background_color_row').hide();
                            $('#plot-border-width-row').hide();
                            $('#plot_border_color_row').hide();
                            $('.axes').hide();
                            $('#title-floating-row').hide();
                            $('.series').hide();
                            break;
                        case 'google_gauge_chart':
                            $('#background_color_row').hide();
                            $('#border_width_row').hide();
                            $('#border_color_row').hide();
                            $('#border_radius_row').hide();
                            $('#plot_background_color_row').hide();
                            $('#plot-border-width-row').hide();
                            $('#plot_border_color_row').hide();
                            $('#font-size-row').hide();
                            $('#font-name-row').hide();
                            $('#show-grid-row').hide();
                            $('.axes').hide();
                            $('.title').hide();
                            $('.tooltip').hide();
                            $('.legend').hide();
                            $('.series').hide();
                            break;
                        case 'google_scatter_chart':
                            $('#inverted-row').hide();
                            break;
                        case 'google_candlestick_chart':
                            $('.series').hide();
                            $('#horizontal-axis-crosshair-row').hide();
                            $('#vertical-axis-crosshair-row').hide();
                            $('.legend').hide();
                            break;
                        case 'google_waterfall_chart':
                            $('.series').hide();
                            $('#horizontal-axis-crosshair-row').hide();
                            $('#vertical-axis-crosshair-row').hide();
                            $('.legend').hide();
                            break;
                    }
                } else if (constructedChartData.engine == 'chartjs') {

                    $("#google-chart-container").hide();
                    $("#chart-js-container").show();

                    $(".google").hide();
                    $(".highcharts").hide();
                    $(".chartjs").show();

                    $('.series').show();
                    $('#curve-type-row').hide();
                    var legendPositionCjsVal = $('#legend-position-cjs').val() ? $('#legend-position-cjs').val() : 'top';
                    $('#legend-position-cjs').val(legendPositionCjsVal).change();

                    switch (constructedChartData.type) {
                        case 'chartjs_line_chart':
                            $('#curve-type-row').show();
                            break;
                        case 'chartjs_area_chart':
                            $('#curve-type-row').show();
                            break;
                        case 'chartjs_stacked_area_chart':
                            $('#curve-type-row').show();
                            break;
                        case 'chartjs_bar_chart':
                        case 'chartjs_stacked_bar_chart':
                            $('#vertical-axis-min-row').hide();
                            $('#vertical-axis-max-row').hide();
                            break;
                        case 'chartjs_bubble_chart':
                            $('.series').hide();
                            break;
                        case 'chartjs_polar_area_chart':
                            $('.series').hide();
                            break;
                        case 'chartjs_pie_chart':
                            $('.series').hide();
                            break;
                        case 'chartjs_doughnut_chart':
                            $('.series').hide();
                            break;
                    }
                }

                previousStepButton.prop('disabled', false);
                previousStepButton.animateFadeIn();
                chartSourcePicker.change();
                $('.wdt-preload-layer').animateFadeOut();
                break;
            case 'step2':
                // Data range
                $('.wdt-preload-layer').animateFadeOut();
                applyDragula();
                nextStepButton.prop('disabled', true);
                nextStepButton.hide();
                constructedChartData.wpdatatable_id = chartSourcePicker.val();
                $('div.chart-wizard-step.step3').show();
                $('li.chart_wizard_breadcrumbs_block.step3').addClass('active');

                $.ajax({
                    url: ajaxurl,
                    type: 'post',
                    dataType: 'json',
                    data: {
                        action: 'wpdatatables_get_columns_data_by_table_id',
                        table_id: constructedChartData.wpdatatable_id,
                        wdtNonce: $('#wdtNonce').val(),
                    },
                    success: function (columns) {
                        wdtChartColumnsData = columns;
                        var columnChartTemplate = $.templates("#wdt-chart-column-block");
                        var columnChartBlockHtml = columnChartTemplate.render({columns: columns});
                        $('div.wdt-chart-column-picker-container div.wdt-chart-wizart-existing-columns-container').html(columnChartBlockHtml);

                        if ((typeof constructedChartData.selected_columns !== 'undefined')
                            || (typeof editing_chart_data !== 'undefined')) {
                            var columns = (typeof editing_chart_data !== 'undefined') ? editing_chart_data.selected_columns : constructedChartData.selected_columns;
                            $('div.wdt-chart-column-picker-container div.wdt-chart-wizard-chosen-columns-container .chart-column-block').remove();
                            for (var i in columns) {
                                $('div.wdt-chart-column-picker-container div.wdt-chart-wizart-existing-columns-container div.chart-column-block[data-orig_header="' + columns[i] + '"]')
                                    .appendTo('div.wdt-chart-column-picker-container div.wdt-chart-wizard-chosen-columns-container');
                            }
                        }
                        $('#wdt-add-chart-columns').click();
                        $('div.alert-warning').show();
                        nextStepButton.show();
                    }
                });
                break;
            case 'step3':
                // Formatting
                if (typeof constructedChartData.selected_columns == 'undefined') {
                    constructedChartData.selected_columns = {};
                }

                // Move string column on first place
                if ($('div.chosen_columns div.chart-column-block.string,' +
                        'div.chosen_columns div.chart-column-block.date,' +
                        'div.chosen_columns div.chart-column-block.datetime,' +
                        'div.chosen_columns div.chart-column-block.time').length
                    && (!$('div.chosen_columns div.chart-column-block:eq(0)').hasClass('float')
                        || !$('div.chosen_columns div.chart-column-block:eq(0)').hasClass('int'))) {
                    $('div.chosen_columns div.chart-column-block.string,' +
                        'div.chosen_columns div.chart-column-block.date,' +
                        'div.chosen_columns div.chart-column-block.datetime,' +
                        'div.chosen_columns div.chart-column-block.time')
                        .eq(0)
                        .prependTo('div.wdt-chart-wizard-chosen-columns-container')
                }

                constructedChartData.selected_columns = {};
                constructedChartData.series_data = {};
                $('div.wdt-chart-wizard-chosen-columns-container div.chart-column-block').each(function () {
                    constructedChartData.selected_columns[parseInt($(this).index())] = $(this).data('orig_header');
                });

                if (typeof editing_chart_data !== 'undefined') {
                    if (!_.isEqual(constructedChartData.selected_columns, editing_chart_data.selected_columns)) {
                        editing_chart_data.render_data.series = editing_chart_data.render_data.series.filter(function (editColumns) {
                            return Object.values(constructedChartData.selected_columns).indexOf(editColumns.orig_header) !== -1;
                        });
                    }
                }


                // Set initial width for preview
                if (constructedChartData.width == null) {
                    if (typeof editing_chart_data !== 'undefined') {
                        if (editing_chart_data.render_data.options.responsive_width != 1 && editing_chart_data.render_data.options.width == null) {
                            constructedChartData.width = 400;
                        }
                    } else {
                        constructedChartData.width = 400;
                    }
                }

                constructedChartData.range_type = 'all_rows';

                $('#series-settings-container').empty();

                getInputData();
                nextStepButton.hide();
                // Render chart first time in preview
                $.ajax({
                    url: ajaxurl,
                    data: {
                        action: 'wpdatatable_show_chart_from_data',
                        chart_data: constructedChartData,
                        wdtNonce: $('#wdtNonce').val(),
                    },
                    dataType: 'json',
                    type: 'post',
                    success: function (data) {
                        $('div.chart-wizard-step.step4').show();
                        $('li.chart_wizard_breadcrumbs_block.step4').addClass('active');

                        //Series
                        var seriesBlockTemplate = $.templates("#wdt-chart-series-setting-block");

                        if (constructedChartData.engine == 'google') {
                            if (typeof editing_chart_data != 'undefined') {
                                for (i = 0; i < data.series.length; i++) {
                                    for (j = 0; j < editing_chart_data.render_data.series.length; j++) {
                                        if (data.series[i].orig_header === editing_chart_data.render_data.series[j].orig_header) {
                                            data.series[i].label = data.columns[i + 1].label = editing_chart_data.render_data.series[j].label;
                                        }
                                    }
                                }
                            }
                            seriesBlockTemplateHtml = seriesBlockTemplate.render({series: data.series});

                        } else if (constructedChartData.engine == 'chartjs') {
                            if (typeof editing_chart_data != 'undefined' && editing_chart_data.chartjs_render_data != null && constructedChartData.type !== 'chartjs_bubble_chart') {
                                for (i = 0; i < data.options.data.datasets.length; i++) {
                                    for (j = 0; j < editing_chart_data.chartjs_render_data.options.data.datasets.length; j++) {
                                        if (data.options.data.datasets[i].orig_header === editing_chart_data.chartjs_render_data.options.data.datasets[j].orig_header) {
                                            data.options.data.datasets[i].label = editing_chart_data.chartjs_render_data.options.data.datasets[j].label;
                                        }
                                    }
                                }
                            }
                            seriesBlockTemplateHtml = seriesBlockTemplate.render({series: data.options.data.datasets});
                        }
                        $('#series-settings-container').html(seriesBlockTemplateHtml);

                        if (constructedChartData.engine == 'google') {
                            if (typeof editing_chart_data != 'undefined') {
                                for (i in data.series) {
                                    for (j in editing_chart_data.render_data.series) {
                                        if (data.series[i].orig_header === editing_chart_data.render_data.series[j].orig_header &&
                                            typeof (editing_chart_data.render_data.options.series[j]) !== 'undefined') {
                                            $('#series-settings-container div.chart-series-block:eq(' + i + ')').find('div.chart-series-color input').val(editing_chart_data.render_data.options.series[j].color);
                                            data.options.series[i] = {
                                                color: editing_chart_data.render_data.options.series[j].color
                                            }
                                        }
                                    }
                                }
                            } else {
                                for (i in data.series) {
                                    $('#series-settings-container div.chart-series-block:eq(' + i + ')').find('div.chart-series-color input').val(data.series[i].color);
                                }
                            }
                        } else if (constructedChartData.engine == 'chartjs') {
                            if (typeof editing_chart_data != 'undefined' && editing_chart_data.chartjs_render_data != null && constructedChartData.type !== 'chartjs_bubble_chart') {
                                for (i in data.options.data.datasets) {
                                    for (j in editing_chart_data.chartjs_render_data.options.data.datasets) {
                                        if (data.options.data.datasets[i].orig_header === editing_chart_data.chartjs_render_data.options.data.datasets[j].orig_header) {
                                            $('#series-settings-container div.chart-series-block:eq(' + i + ')').find('div.chart-series-color input').val(editing_chart_data.chartjs_render_data.options.data.datasets[j].borderColor);
                                            data.options.data.datasets[i].borderColor = editing_chart_data.chartjs_render_data.options.data.datasets[j].borderColor;
                                            data.options.data.datasets[i].backgroundColor = editing_chart_data.chartjs_render_data.options.data.datasets[j].backgroundColor;
                                        }
                                    }
                                }
                            } else {
                                for (i in data.options.data.datasets) {
                                    $('#series-settings-container div.chart-series-block:eq(' + i + ')').find('div.chart-series-color input').val(data.options.data.datasets[i].borderColor);
                                }
                            }
                        } else {
                            for (i in data.options.series) {
                                $('#series-settings-container div.chart-series-block:eq(' + i + ')').find('div.chart-series-color input').val(data.options.series[i].color);
                                $('#series-settings-container div.chart-series-block:eq(' + i + ')').find('div.chart-series-type select').val(data.options.series[i].type);
                                $('#series-settings-container div.chart-series-block:eq(' + i + ')').find('div.chart-show-yaxis input').val(data.options.series[i].yAxis);
                            }
                        }

                        $(".wdt-chart-wizard .wdt-add-picker").each(function (i) {
                            jQuery(this).addClass('pickr');
                            jQuery(this)
                                .closest('.wdt-color-picker')
                                .find('.wpcolorpicker-icon i')
                                .css("background", this.value);
                        });


                        if (constructedChartData.engine == 'google') {
                            wdtChart = new wpDataTablesGoogleChart();
                            wdtChart.setType(data.type);
                            wdtChart.setColumns(data.columns);
                            wdtChart.setRows(data.rows);
                            wdtChart.setOptions(data.options);
                            wdtChart.setContainer('google-chart-container');
                            wdtChart.setColumnIndexes(data.column_indexes);
                        } else if (constructedChartData.engine == 'chartjs') {
                            if (wdtChart !== null) {
                                wdtChart.chart.destroy();
                            }
                            wdtChart = new wpDataTablesChartJS();
                            var container = document.getElementById("chart-js-container");
                            var canvas = document.getElementById("chart-js-canvas");
                            wdtChart.setData(data.options.data);
                            wdtChart.setOptions(data.options.options);
                            wdtChart.setGlobalOptions(data.options.globalOptions);
                            wdtChart.setType(data.configurations.type);
                            wdtChart.setColumnIndexes(data.column_indexes);
                            wdtChart.setContainer(container);
                            wdtChart.setCanvas(canvas);
                            wdtChart.setContainerOptions(data.configurations);
                        }
                        wdtChart.render();
                        if (constructedChartData.type == 'google_bubble_chart') {
                            $('.chart-series-color').hide();
                        }

                        $('.selectpicker').wdtBootstrapSelectPicker('refresh');

                        var eTop = $('.chart-preview-container').offset().top;
                        var eWidth = $('.chart-preview-container').width();

                        $(window).scroll(function () {
                            if (eTop - $(window).scrollTop() <= 30) {
                                $('.chart-preview-container').css('position', 'fixed').css('right', 48).css('top', 30).css('width', eWidth);
                            } else {
                                eWidth = $('.chart-preview-container').width();
                                $('.chart-preview-container').css('position', 'relative').css('right', '').css('top', '').css('width', '');
                            }
                        });

                        $('#chart-series-color,' +
                            '#background-color,' +
                            '#border_color,' +
                            '#plot-background-color,' +
                            '#plot-border-color,' +
                            '#font-color,' +
                            '#title-font-color,' +
                            '#tooltip-background-color,' +
                            '#tooltip-border-color,' +
                            '#legend_background_color,' +
                            '#legend_border_color,' +
                            '#exporting-button-color'
                        ).on('change', function (e, ui) {
                            e.stopImmediatePropagation()
                            e.preventDefault()
                            renderChart(false);
                        });

                        // Render chart on changing chart options
                        $('div.step4 input:not(#group-chart), div.step4 select')
                            .on('change', function () {
                                renderChart(false);
                            });
                        // Trigger chart grouping
                        $('input#group-chart')
                            .on('change', function () {
                                renderChart(true);
                            });

                        nextStepButton.show().addClass('wdt-save-chart').html('<i class="wpdt-icon-save"></i>' + wpdatatablesEditStrings.saveChart)

                        $('.wdt-preload-layer').animateFadeOut();
                    }
                });
                break;
            case 'step4':
                getInputData();
                // Save and get shortcode
                $.ajax({
                    url: ajaxurl,
                    data: {
                        action: 'wpdatatable_save_chart_get_shortcode',
                        chart_data: constructedChartData,
                        wdtNonce: $('#wdtNonce').val(),
                    },
                    type: 'post',
                    dataType: 'json',
                    success: function (data) {
                        $('div.chart-wizard-step.step5').show();
                        $('li.chart_wizard_breadcrumbs_block.step5').addClass('active');
                        $('#wdt-chart-shortcode-id').html(data.shortcode);
                        constructedChartData.id = data.id;
                        $('#wp-data-chart-id').val(data.id);
                        $('.wdt-preload-layer').animateFadeOut();
                        nextStepButton.prop('disabled', true);
                        nextStepButton.hide();
                        $('#finishButton').show();
                    }
                });
                break;
        }
    });

    function renderChart(reloadNeeded) {
        if (typeof reloadNeeded == 'undefined') {
            reloadNeeded = true;
        }

        getInputData();

        if (reloadNeeded) {
            $.ajax({
                url: ajaxurl,
                data: {
                    action: 'wpdatatable_show_chart_from_data',
                    chart_data: constructedChartData,
                    wdtNonce: $('#wdtNonce').val(),
                },
                dataType: 'json',
                type: 'post',
                success: function (data) {
                    if (constructedChartData.engine == 'google') {
                        wdtChart = new wpDataTablesGoogleChart();
                        wdtChart.setType(data.type);
                        wdtChart.setColumns(data.columns);
                        wdtChart.setRows(data.rows);
                        wdtChart.setOptions(data.options);
                        wdtChart.setContainer('google-chart-container');
                        wdtChart.setColumnIndexes(data.column_indexes);
                    } else if (constructedChartData.engine == 'chartjs') {
                        wdtChart.chart.destroy();
                        wdtChart = new wpDataTablesChartJS();
                        var container = document.getElementById("chart-js-container");
                        var canvas = document.getElementById("chart-js-canvas");
                        wdtChart.setData(data.options.data);
                        wdtChart.setGlobalOptions(data.options.globalOptions);
                        wdtChart.setOptions(data.options.options);
                        wdtChart.setType(data.configurations.type);
                        wdtChart.setColumnIndexes(data.column_indexes);
                        wdtChart.setContainer(container);
                        wdtChart.setCanvas(canvas);
                        wdtChart.setContainerOptions(data.configurations);
                    }
                    wdtChart.render();
                    $('.wdt-preload-layer').animateFadeOut();

                }
            });
        } else {
            if (constructedChartData.engine == 'chartjs') {
                wdtChart.chart.destroy();
            }
            wdtChart.setChartConfig(constructedChartData);
            wdtChart.render();
        }

    }

    // Get input fields data
    function getInputData() {
        //Chart
        constructedChartData.width = parseInt($('#chart-width').val());
        constructedChartData.responsive_width = $('#chart-responsive-width').is(':checked') ? 1 : 0;
        constructedChartData.height = parseInt($('#chart-height').val());
        constructedChartData.group_chart = $('#group-chart').is(':checked') ? 1 : 0;
        constructedChartData.enable_animation = $('#enable-animation').is(':checked') ? 1 : 0;
        constructedChartData.show_data_labels = $('#data-labels').is(':checked') ? 1 : 0;
        constructedChartData.start_angle =parseInt($('#start-angle').val());
        constructedChartData.end_angle =parseInt($('#end-angle').val());
        constructedChartData.background_color = $('input.background-color').val();
        constructedChartData.border_width = parseInt($('#border-width').val() ? $('#border-width').val() : 0);
        constructedChartData.border_color = $('input.border_color').val();
        constructedChartData.border_radius = parseInt($('#border-radius').val() ? $('#border-radius').val() : 0);
        constructedChartData.zoom_type = $('#zoom-type').val();
        constructedChartData.panning = $('#panning').is(':checked') ? 1 : 0;
        constructedChartData.pan_key = $('#pan-key').val();
        constructedChartData.plot_background_color = $('input.plot-background-color').val();
        constructedChartData.plot_background_image = $('#plot-background-image').val();
        constructedChartData.line_background_image = $('#line-background-image').val();
        constructedChartData.plot_border_width = $('#plot-border-width').val();
        constructedChartData.plot_border_color = $('input.plot-border-color').val();
        constructedChartData.font_size = $('#font-size').val();
        constructedChartData.font_name = $('#font-name').val();
        constructedChartData.font_style = $('#font-style').val();
        constructedChartData.font_weight = $('#font-weight').val();
        constructedChartData.font_color = $('input.font-color').val();
        constructedChartData.three_d = $('#three-d').is(':checked') ? 1 : 0;
        constructedChartData.monochrome = $('#monochrome').is(':checked') ? 1 : 0;
        constructedChartData.monochrome_color = $('input#monochrome-color').val();
        constructedChartData.enable_color_palette = $('#enable-color-palette').is(':checked') ? 1 : 0;
        constructedChartData.color_palette = $('#color-palette').val();
        constructedChartData.enable_dropshadow = $('#enable-dropshadow').is(':checked') ? 1 : 0;
        constructedChartData.dropshadow_blur = parseInt($('#dropshadow-blur').val());
        constructedChartData.dropshadow_opacity = parseInt($('#dropshadow-opacity').val()) / 100;
        constructedChartData.dropshadow_color = $('input#dropshadow-color').val();
        constructedChartData.dropshadow_top = parseInt($('#dropshadow-top').val());
        constructedChartData.dropshadow_left = parseInt($('#dropshadow-left').val());
        constructedChartData.text_color = $('input#chart-text-color').val();
        // Series
        if (typeof constructedChartData.series_data == 'undefined') {
            constructedChartData.series_data = {};
        }
        if (constructedChartData.engine == 'google' || constructedChartData.engine == 'chartjs'
        ) {
            $('div.chart-series-block').each(function (e) {
                constructedChartData.series_data[$(this).data('orig_header')] = {
                    label: $(this).find('input.series-label').val(),
                    color: $(this).find('input.series-color').val()
                }
            });
        }

        constructedChartData.curve_type = $('#curve-type').is(':checked') ? 1 : 0;
        // Axes
        constructedChartData.show_grid = $('#show-grid').is(':checked') ? 1 : 0;
        constructedChartData.grid_color = $('input#grid-color').val();
        constructedChartData.grid_stroke = $('#grid-stroke').val();
        constructedChartData.grid_position = $('#grid-position').val();
        constructedChartData.grid_axes = $('#grid-axes').val();
        constructedChartData.highcharts_line_dash_style = $('#highcharts-line-dash-style').val();
        constructedChartData.horizontal_axis_label = $('#horizontal-axis-label').val();
        constructedChartData.horizontal_axis_crosshair = $('#horizontal-axis-crosshair').is(':checked') ? 1 : 0;
        constructedChartData.horizontal_axis_direction = $('#horizontal-axis-direction').val();
        constructedChartData.vertical_axis_label = $('#vertical-axis-label').val();
        constructedChartData.vertical_axis_crosshair = $('#vertical-axis-crosshair').is(':checked') ? 1 : 0;
        constructedChartData.vertical_axis_direction = $('#vertical-axis-direction').val();
        constructedChartData.marker_size = $('#marker-size').val();
        constructedChartData.stroke_width = $('#stroke-width').val();
        constructedChartData.vertical_axis_min = $('#vertical-axis-min').val();
        constructedChartData.vertical_axis_max = $('#vertical-axis-max').val();
        constructedChartData.tick_amount = $('#tick-amount').val();
        constructedChartData.inverted = $('#inverted').is(':checked') ? 1 : 0;
        constructedChartData.reversed = $('#reversed').is(':checked') ? 1 : 0;
        // Title
        constructedChartData.show_title = $('#show-chart-title').is(':checked') ? 1 : 0;
        constructedChartData.title_floating = $('#title-floating').is(':checked') ? 1 : 0;
        constructedChartData.title_align = $('#title-align').val();
        constructedChartData.title_position = $('#title-position').val();
        constructedChartData.title_font_size = $('#title_font_size').val();
        constructedChartData.title_font_name = $('#title-font-name').val();
        constructedChartData.title_font_style = $('#title-font-style').val();
        constructedChartData.title_font_weight = $('#title-font-weight').val();
        constructedChartData.title_font_color = $('input#title-font-color').val();
        constructedChartData.subtitle = $('#subtitle').val();
        constructedChartData.subtitle_align = $('#subtitle-align').val();
        // Tooltip
        constructedChartData.tooltip_enabled = $('#tooltip-enabled').is(':checked') ? 1 : 0;
        constructedChartData.tooltip_background_color = $('input.tooltip-background-color').val();
        constructedChartData.tooltip_border_width = $('#tooltip-border-width').val();
        constructedChartData.tooltip_border_color = $('input.tooltip-border-color').val();
        constructedChartData.tooltip_border_radius = $('#tooltip-border-radius').val();
        constructedChartData.tooltip_shared = $('#tooltip-shared').is(':checked') ? 1 : 0;
        constructedChartData.tooltip_value_prefix = $('#tooltip-value-prefix').val();
        constructedChartData.tooltip_value_suffix = $('#tooltip-value-suffix').val();
        constructedChartData.follow_cursor = $('#follow-cursor').is(':checked') ? 1 : 0;
        constructedChartData.fill_series_color = $('#fill-series-color').is(':checked') ? 1 : 0;
        // Legend
        constructedChartData.show_legend = $('#show-legend').is(':checked') ? 1 : 0;
        constructedChartData.legend_position = $('#legend_position').val();
        constructedChartData.legend_background_color = $('input.legend_background_color').val();
        constructedChartData.legend_title = $('#legend_title').val();
        constructedChartData.legend_layout = $('#legend_layout').val();
        constructedChartData.legend_align = $('#legend_align').val();
        constructedChartData.legend_vertical_align = $('#legend_vertical_align').val();
        constructedChartData.legend_border_width = $('#legend_border_width').val();
        constructedChartData.legend_border_color = $('input.legend_border_color').val();
        constructedChartData.legend_border_radius = $('#legend_border_radius').val();
        constructedChartData.legend_position_cjs = $('#legend-position-cjs').val();

        // Exporting
        constructedChartData.exporting = $('#exporting').is(':checked') ? 1 : 0;
        constructedChartData.exporting_data_labels = $('#exporting-data-labels').is(':checked') ? 1 : 0;
        constructedChartData.exporting_file_name = $('#exporting-file-name').val();
        constructedChartData.exporting_width = $('#exporting-width').val();
        constructedChartData.exporting_button_align = $('#exporting-button-align').val();
        constructedChartData.exporting_button_vertical_align = $('#exporting-button-vertical-align').val();
        constructedChartData.exporting_button_color = $('#exporting-button-color').val();
        constructedChartData.exporting_button_text = $('#exporting-button-text').val();
        // Credits
        constructedChartData.credits = $('#credits').is(':checked') ? 1 : 0;
        constructedChartData.credits_href = $('#credits-href').val();
        constructedChartData.credits_text = $('#credits-text').val();

        //Toolbar
        constructedChartData.show_toolbar = $('#show-toolbar').is(':checked') ? 1 : 0;
        constructedChartData.toolbar_buttons = $('#toolbar-buttons').val();
        constructedChartData.apex_exporting_file_name = $('#apex-exporting-file-name').val();
    }

    /**
     * Steps switcher (Prev)
     */
    previousStepButton.click(function (e) {
        e.preventDefault();

        $('.wdt-preload-layer').animateFadeIn();
        var curStep = $('div.chart-wizard-step:visible').data('step');

        switch (curStep) {
            case 'step2':
                previousStepButton.prop('disabled', true);
                previousStepButton.hide();
                $('div.chart-wizard-step.step1').show();
                $('div.chart-wizard-step.step2').hide();
                $('li.chart_wizard_breadcrumbs_block.step2').removeClass('active');
                $('li.chart_wizard_breadcrumbs_block.step1').addClass('active');
                $('#chart-render-engine').change();
                $('.wdt-preload-layer').animateFadeOut();
                break;
            case 'step3':
                $('div.chart-wizard-step.step2').show();
                $('div.chart-wizard-step.step3').hide();
                $('li.chart_wizard_breadcrumbs_block.step3').removeClass('active');
                $('li.chart_wizard_breadcrumbs_block.step2').addClass('active');
                $('.wdt-preload-layer').animateFadeOut();
                break;
            case 'step4':
                $('div.chart-wizard-step.step3').show();
                $('div.chart-wizard-step.step4').hide();
                $('li.chart_wizard_breadcrumbs_block.step4').removeClass('active');
                $('li.chart_wizard_breadcrumbs_block.step3').addClass('active');
                $('.wdt-preload-layer').animateFadeOut();
                nextStepButton.removeClass('wdt-save-chart').html('Next ')
                nextStepButton.prop('disabled', false);
                break;
            case 'step5':
                $('div.chart-wizard-step.step4').show();
                $('div.chart-wizard-step.step5').hide();
                $('li.chart_wizard_breadcrumbs_block.step5').removeClass('active');
                $('li.chart_wizard_breadcrumbs_block.step4').addClass('active');
                nextStepButton.prop('disabled', false);
                nextStepButton.show();
                $('#finishButton').hide();
                $('.wdt-preload-layer').animateFadeOut();
                break;
        }
    });

    /**
     * Open chart browser on finish
     */
    $('#finishButton').click(function (e) {
        e.preventDefault();
        window.location = $('#wdt-browse-charts-url').val();
    });

    /**
     * Pick the chart type
     */
    $('#chart-render-engine').change(function (e) {
        e.preventDefault();
        nextStepButton.prop('disabled', true);
        $('.wdt-chart-wizard-chart-selecter-block .card').removeClass('selected').removeClass('not-selected');
        $('div.charts-type').hide();
        if ($(this).val() != '') {
            constructedChartData.chart_engine = $(this).val();
            if ($(this).val() == 'google') {
                $('div.google-charts-type').show();
            } else if ($(this).val() == 'chartjs') {
                $('div.chartjs-charts-type').show();
            }
        }
    });

    /**
     * Pick the data type
     */
    chartSourcePicker.change(function (e) {
        e.preventDefault();
        let selectedTable = $(this).find('option:selected');
        let tableType = selectedTable.data('table-type');
        if ($(this).val() == '') {
            nextStepButton.prop('disabled', true);
            $('#wdt-simple-source-chart').hide();
        } else if (tableType === 'simple') {
            nextStepButton.prop('disabled', true);
            $('#wdt-simple-source-chart').show();
        } else {
            nextStepButton.prop('disabled', false);
            $('#wdt-simple-source-chart').hide();
        }
    });

    /**
     * Responsive width checkbox
     */
    $('#chart-responsive-width').change(function (e) {
        if ($(this).is(':checked')) {
            $('#chart-width').val('0');
            $('#btn-plus-chart-width').prop('disabled', true);
            $('#btn-minus-chart-width').prop('disabled', true);
            $('#chart-width').prop('readonly', 'readonly');
        } else {
            $('#btn-plus-chart-width').prop('disabled', false);
            $('#btn-minus-chart-width').prop('disabled', false);
            $('#chart-width').prop('readonly', '');
            $('#chart-width').val('400');
        }
    });


    /**
     * Select all columns in the column selecter
     */
    $('button.select-all-columns, button.deselect-all-columns').click(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if ($(this).hasClass('select-all-columns')) {
            $(this).closest('.card').find('div.chart-column-block').addClass('selected');
            $(this).text('Deselect All');
        } else {
            $(this).closest('.card').find('div.chart-column-block').removeClass('selected');
            $(this).text('Select All');
        }
        $(this).toggleClass('select-all-columns deselect-all-columns');

    });

    /**
     * Select a column in chart row range picker
     */
    $(document).on('click', 'div.wdt-chart-column-picker-container div.chart-column-block', function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if ($(this).hasClass('selected')) {
            $(this).removeClass('selected');
        } else {
            $(this).addClass('selected');
        }
    });

    /**
     * Check for limit of string columns
     */
    function checkColumnsLimit() {
        // 1 - Checking for string columns
        var string_columns = 0;
        var valid = true;
        $('div.wdt-chart-wizard-chosen-columns-container div.chart-column-block').each(function () {
            if (
                $(this).hasClass('string')
                || $(this).hasClass('link')
                || $(this).hasClass('email')
                || $(this).hasClass('image')
                || $(this).hasClass('date')
                || $(this).hasClass('datetime')
                || $(this).hasClass('time')
            ) {
                string_columns++;
            }
        });
        if (string_columns > 1) {
            $('div.chosen_columns div.strings-error').show();
            valid = false;
        } else {
            $('div.chosen_columns div.strings-error').hide();
        }
        // 2 - Checking for min and max columns limit
        var totalColumnCount = $('div.wdt-chart-wizard-chosen-columns-container div.chart-column-block').length;
        if (totalColumnCount < constructedChartData.min_columns) {
            $('div.chosen_columns div.min-columns-error').show();
            $('div.chosen_columns div.min-columns-error span.columns').html(constructedChartData.min_columns);
            valid = false;
        } else {
            $('div.chosen_columns div.min-columns-error').hide();
        }
        if ((constructedChartData.max_columns > 0)
            && (totalColumnCount > constructedChartData.max_columns)) {
            $('div.chosen_columns div.max-columns-error').show();
            $('div.chosen_columns div.max-columns-error span.columns').html(constructedChartData.max_columns);
            valid = false;
        } else {
            $('div.chosen_columns div.max-columns-error').hide();
        }
        if (!valid) {
            nextStepButton.prop('disabled', true);
        } else {
            nextStepButton.prop('disabled', false);
        }
    }

    /**
     * Add columns to chart
     */
    $('#wdt-add-chart-columns').click(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        $('div.wdt-chart-column-picker-container div.wdt-chart-wizart-existing-columns-container div.chart-column-block.selected').each(function () {
            $(this).appendTo('div.wdt-chart-column-picker-container div.wdt-chart-wizard-chosen-columns-container');
        });
        checkColumnsLimit();
    });

    /**
     * Add all columns to chart
     */
    $('#wdt-add-all-chart-columns').click(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        $('div.wdt-chart-column-picker-container div.wdt-chart-wizart-existing-columns-container div.chart-column-block').addClass('selected');
        $('#wdt-add-chart-columns').click();
        $('div.wdt-chart-column-picker-container div.wdt-chart-wizard-chosen-columns-container div.chart-column-block').removeClass('selected');
        checkColumnsLimit();
    });

    /**
     * Remove columns from chart series
     */
    $('#wdt-remove-chart-columns').click(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        $('div.wdt-chart-column-picker-container div.wdt-chart-wizard-chosen-columns-container div.chart-column-block.selected').each(function () {
            $(this).appendTo('div.wdt-chart-column-picker-container div.wdt-chart-wizart-existing-columns-container ');
        });
        checkColumnsLimit();
    });

    /**
     * Remove all columns from chart
     */
    $('#wdt-remove-all-chart-columns').click(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        $('div.wdt-chart-column-picker-container div.wdt-chart-wizard-chosen-columns-container div.chart-column-block').addClass('selected');
        $('#wdt-remove-chart-columns').click();
        $('div.wdt-chart-column-picker-container div.wdt-chart-wizart-existing-columns-container div.chart-column-block').removeClass('selected');
    });


    /**
     * Load data for editing existing charts
     */
    $(document).ready(function () {
        if ($('#wp-data-chart-id').val() != '') {

            $('#chart-render-engine').change();
            constructedChartData.id = $('#wp-data-chart-id').val();
            constructedChartData.title = editing_chart_data.title;
            // General settings
            $('.charts-type').find("[data-type='" + editing_chart_data.type + "']").click();
            chartSourcePicker.val(editing_chart_data.wpdatatable_id);

            if (editing_chart_data.range_type == 'picked_range') {
                $('#wdt-chart-row-range-type').val('pick_rows').change();
                constructedChartData.range_data = editing_chart_data.row_range;
                $('#range_picked_info span').html(constructedChartData.range_data.length);
            }


            // Chart
            if (typeof editing_chart_data.render_data.options.width !== 'undefined') {
                $('#chart-width').val(editing_chart_data.render_data.options.width);
                $('#chart-responsive-width').prop('checked', '');
                $('#btn-plus-chart-width').prop('disabled', false);
                $('#btn-minus-chart-width').prop('disabled', false);
                $('#chart-width').prop('readonly', '');
            } else {
                $('#chart-responsive-width').prop('checked', 'checked');
                $('#chart-width').val(0);
                $('#chart-width').prop('readonly', 'readonly');
            }
            $('#chart-height').val(editing_chart_data.render_data.options.height);

            // Grouping
            if (editing_chart_data.render_data.group_chart) {
                $('#group-chart').prop('checked', 'checked');
            } else {
                $('#group-chart').prop('checked', '');
            }

            // Axes
            if (editing_chart_data.render_data.show_grid == null) {
                $('#show-grid').prop('checked', 'checked');
            } else {
                if (editing_chart_data.render_data.show_grid) {
                    $('#show-grid').prop('checked', 'checked');
                } else {
                    $('#show-grid').prop('checked', '');
                }
            }
            $('#horizontal-axis-label').val(editing_chart_data.render_data.options.hAxis.title);
            $('#vertical-axis-label').val(editing_chart_data.render_data.options.vAxis.title);

            // Title
            if (editing_chart_data.render_data.options.title) {
                $('#show-chart-title').prop('checked', 'checked');
            } else {
                $('#show-chart-title').prop('checked', '');
            }

            if (editing_chart_data.engine == 'google') {
                // Chart
                if (editing_chart_data.render_data.options.backgroundColor == null) {
                    $('input.background-color').val('');
                    $('#border-width').val('');
                    $('input.border_color').val('');
                    $('#border-radius').val('');

                } else {
                    if (editing_chart_data.render_data.options.backgroundColor.fill) {
                        $('#background-color').val(editing_chart_data.render_data.options.backgroundColor.fill);
                    }
                    $('#border-width').val(editing_chart_data.render_data.options.backgroundColor.strokeWidth);
                    if (editing_chart_data.render_data.options.backgroundColor.stroke) {
                        $('#border_color').val(editing_chart_data.render_data.options.backgroundColor.stroke);
                    }
                    $('#border-radius').val(editing_chart_data.render_data.options.backgroundColor.rx);
                }

                if (editing_chart_data.render_data.options.chartArea == null) {
                    $('input.plot-background-color').val('');
                    $('#plot-border-width').val('');
                    $('input.plot-border-color').val('');
                } else {
                    if (editing_chart_data.render_data.options.chartArea.backgroundColor.fill) {
                        $('#plot-background-color').val(editing_chart_data.render_data.options.chartArea.backgroundColor.fill);
                    }
                    $('#plot-border-width').val(editing_chart_data.render_data.options.chartArea.backgroundColor.strokeWidth);
                    if (editing_chart_data.render_data.options.chartArea.backgroundColor.stroke) {
                        $('#plot-border-color').val(editing_chart_data.render_data.options.chartArea.backgroundColor.stroke);
                    }
                }

                if (editing_chart_data.render_data.options.fontSize == null) {
                    $('#font-size').val('');
                } else {
                    $('#font-size').val(editing_chart_data.render_data.options.fontSize);
                }
                if (editing_chart_data.render_data.options.fontName == null) {
                    $('#font-name').val('Arial');
                } else {
                    $('#font-name').val(editing_chart_data.render_data.options.fontName);
                }

                if (editing_chart_data.render_data.options.is3D) {
                    $('#three-d').prop('checked', 'checked');
                } else {
                    $('#three-d').prop('checked', '');
                }

                // Axes
                if (editing_chart_data.render_data.options.crosshair == null) {
                    $('#horizontal-axis-crosshair').prop('checked', '');
                    $('#vertical-axis-crosshair').prop('checked', '');
                } else {
                    if (editing_chart_data.render_data.options.crosshair.orientation == 'both') {
                        $('#horizontal-axis-crosshair').prop('checked', 'checked');
                        $('#vertical-axis-crosshair').prop('checked', 'checked');
                    } else if (editing_chart_data.render_data.options.crosshair.orientation == 'horizontal') {
                        $('#horizontal-axis-crosshair').prop('checked', 'checked');
                        $('#vertical-axis-crosshair').prop('checked', '');
                    } else if (editing_chart_data.render_data.options.crosshair.orientation == 'vertical') {
                        $('#horizontal-axis-crosshair').prop('checked', '');
                        $('#vertical-axis-crosshair').prop('checked', 'checked');
                    }
                }


                if (editing_chart_data.render_data.options.hAxis.direction == null) {
                    $('#horizontal-axis-direction').val(1);
                } else {
                    $('#horizontal-axis-direction').val(editing_chart_data.render_data.options.hAxis.direction);
                }

                if (editing_chart_data.render_data.options.vAxis.direction == null) {
                    $('#vertical-axis-direction').val(1);
                } else {
                    $('#vertical-axis-direction').val(editing_chart_data.render_data.options.vAxis.direction);
                }

                // Axes
                if (editing_chart_data.render_data.options.vAxis.viewWindow == null) {
                    $('#vertical-axis-min').val('');
                    $('#vertical-axis-max').val('');
                } else {
                    $('#vertical-axis-min').val(editing_chart_data.render_data.options.vAxis.viewWindow.min);
                    $('#vertical-axis-max').val(editing_chart_data.render_data.options.vAxis.viewWindow.max);
                }

                if (editing_chart_data.render_data.options.orientation == null) {
                    $('#inverted').prop('checked', '');
                } else {
                    if (editing_chart_data.render_data.options.orientation == 'vertical') {
                        $('#inverted').prop('checked', 'checked');
                    }
                }

                // Title
                if (editing_chart_data.render_data.options.titlePosition == null) {
                    $('#title-floating').prop('checked', '');
                } else {
                    if (editing_chart_data.render_data.options.titlePosition == 'in') {
                        $('#title-floating').prop('checked', 'checked');
                    }
                }

                // Tooltip
                if (editing_chart_data.render_data.options.tooltip == null) {
                    $('#tooltip-enabled').prop('checked', 'checked');
                } else {
                    if (editing_chart_data.render_data.options.tooltip.trigger == 'none') {
                        $('#tooltip-enabled').prop('checked', '');
                    } else {
                        $('#tooltip-enabled').prop('checked', 'checked');
                    }
                }

                // Legend
                if (editing_chart_data.render_data.options.legend == null) {
                    $('#legend_position').val('right');
                    $('#legend_vertical_align').val("bottom");
                } else {
                    $('#legend_position').val(editing_chart_data.render_data.options.legend.position);
                    if (editing_chart_data.render_data.options.legend.alignment == 'end') {
                        $('#legend_vertical_align').val("bottom");
                    } else if (editing_chart_data.render_data.options.legend.alignment == 'center') {
                        $('#legend_vertical_align').val("middle");
                    } else {
                        $('#legend_vertical_align').val("top");
                    }
                }
            } else if (editing_chart_data.engine == 'chartjs') {
                // Chart
                if (editing_chart_data.chartjs_render_data.configurations.canvas.backgroundColor) {
                    $('#background-color').val(editing_chart_data.chartjs_render_data.configurations.canvas.backgroundColor);
                }
                $('#border-width').val(editing_chart_data.chartjs_render_data.configurations.canvas.borderWidth);
                if (editing_chart_data.chartjs_render_data.configurations.canvas.borderColor) {
                    $('#border_color').val(editing_chart_data.chartjs_render_data.configurations.canvas.borderColor);
                }
                $('#border-radius').val(editing_chart_data.chartjs_render_data.configurations.canvas.borderRadius);

                if (typeof editing_chart_data.chartjs_render_data.options.globalOptions.font !== 'undefined'){
                    if (editing_chart_data.chartjs_render_data.options.globalOptions.font.size == null) {
                        $('#font-size').val('');
                    } else {
                        $('#font-size').val(editing_chart_data.chartjs_render_data.options.globalOptions.font.size);
                    }
                }
                if (typeof editing_chart_data.chartjs_render_data.options.globalOptions.font !== 'undefined'){
                    $('#font-name').val(editing_chart_data.chartjs_render_data.options.globalOptions.font.family);
                    $('#font-style').val(editing_chart_data.chartjs_render_data.options.globalOptions.font.style);
                    $('#font-weight').val(editing_chart_data.chartjs_render_data.options.globalOptions.font.weight);
                }
                if (typeof editing_chart_data.chartjs_render_data.options.globalOptions.color !== 'undefined'){
                    $('#font-color').val(editing_chart_data.chartjs_render_data.options.globalOptions.color);
                }

                // Series
                if (editing_chart_data.type !== 'chartjs_bubble_chart' && editing_chart_data.chartjs_render_data.options.data.datasets[0].lineTension == 0.4) {
                    $('#curve-type').prop('checked', 'checked');
                } else {
                    $('#curve-type').prop('checked', '');
                }

                // Axes version 4.0.2
                if (typeof editing_chart_data.chartjs_render_data.options.options.scales.x !== 'undefined'){
                    $('#horizontal-axis-label').val(editing_chart_data.chartjs_render_data.options.options.scales.x.title.text);
                }
                if (typeof editing_chart_data.chartjs_render_data.options.options.scales.y !== 'undefined'){
                    $('#vertical-axis-label').val(editing_chart_data.chartjs_render_data.options.options.scales.y.title.text);
                    editing_chart_data.chartjs_render_data.options.options.scales.y.beginAtZero ?
                        $('#vertical-axis-min').val(0) : $('#vertical-axis-min').val(editing_chart_data.chartjs_render_data.options.options.scales.y.min);
                    $('#vertical-axis-max').val(editing_chart_data.chartjs_render_data.options.options.scales.y.max);
                }
                // Axes
                if (typeof editing_chart_data.chartjs_render_data.options.options.scales.xAxes !== 'undefined') {
                    $('#horizontal-axis-label').val(editing_chart_data.chartjs_render_data.options.options.scales.xAxes[0].scaleLabel.labelString);
                }
                if (typeof editing_chart_data.chartjs_render_data.options.options.scales.yAxes !== 'undefined') {
                    $('#vertical-axis-label').val(editing_chart_data.chartjs_render_data.options.options.scales.yAxes[0].scaleLabel.labelString);
                    editing_chart_data.chartjs_render_data.options.options.scales.yAxes[0].ticks.beginAtZero ?
                        $('#vertical-axis-min').val(0) : $('#vertical-axis-min').val(editing_chart_data.chartjs_render_data.options.options.scales.yAxes[0].ticks.min);
                    $('#vertical-axis-max').val(editing_chart_data.chartjs_render_data.options.options.scales.yAxes[0].ticks.max);
                }

                if (typeof editing_chart_data.chartjs_render_data.options.options.plugins !== 'undefined') {
                    // Title version 4.0.2
                    $('#title-position').val(editing_chart_data.chartjs_render_data.options.options.plugins.title.position);
                    $('#title-font-name').val(editing_chart_data.chartjs_render_data.options.options.plugins.title.font.family);
                    $('#title-font-style').val(editing_chart_data.chartjs_render_data.options.options.plugins.title.font.style);
                    $('#title-font-weight').val(editing_chart_data.chartjs_render_data.options.options.plugins.title.font.weight);
                    if (editing_chart_data.chartjs_render_data.options.options.plugins.title.color) {
                        $('#title-font-color').val(editing_chart_data.chartjs_render_data.options.options.plugins.title.color);
                    }

                    // Tooltip version 4.0.2
                    if (editing_chart_data.chartjs_render_data.options.options.plugins.tooltip.enabled) {
                        $('#tooltip-enabled').prop('checked', 'checked');
                    } else {
                        $('#tooltip-enabled').prop('checked', '');
                    }
                    if (editing_chart_data.chartjs_render_data.options.options.plugins.tooltip.backgroundColor) {
                        $('#tooltip-background-color').val(editing_chart_data.chartjs_render_data.options.options.plugins.tooltip.backgroundColor);
                    }
                    $('#tooltip-border-radius').val(editing_chart_data.chartjs_render_data.options.options.plugins.tooltip.cornerRadius);
                    if (editing_chart_data.chartjs_render_data.options.options.plugins.tooltip.mode == 'index') {
                        $('#tooltip-shared').prop('checked', 'checked');
                    } else {
                        $('#tooltip-shared').prop('checked', '');
                    }

                    // Legend version 4.0.2
                    if (editing_chart_data.chartjs_render_data.options.options.plugins.legend.display) {
                        $('#show-legend').prop('checked', 'checked');
                    } else {
                        $('#show-legend').prop('checked', '');
                    }
                    $('#legend-position-cjs').val(editing_chart_data.chartjs_render_data.options.options.plugins.legend.position);
                }
            }
        }
    });

    function applyDragula() {
        var drake = dragula([document.querySelector('.wdt-chart-wizart-existing-columns-container'), document.querySelector('.wdt-chart-wizard-chosen-columns-container')], {
            invalid: function (el, target) {
                if (el.classList.contains('alert')) {
                    return true;
                }
            }
        });
        drake.on('drop', function () {
            checkColumnsLimit();
        });
    }


    /**
     * Pick the chart type
     */
    $('#chart-render-engine').change(function (e) {
        e.preventDefault();

        $('.wdt-chart-wizard-chart-selecter-block .card').removeClass('selected').removeClass('not-selected');
        $('div.charts-type').hide();
        if ($(this).val() != '') {
            constructedChartData.chart_engine = $(this).val();
            if ($(this).val() == 'google') {
                $('div.google-charts-type').show();
                $('div.alert-info').show();
                $('div.alert-warning').hide();
            } else if ($(this).val() == 'highcharts') {
                $('div.highcharts-charts-type').show();
                $('div.alert-info').hide();
                $('div.alert-warning').show();
                $('#wdt-chart-wizard-next-step').prop('disabled',true);
            } else if ($(this).val() == 'chartjs') {
                $('div.chartjs-charts-type').show();
                $('div.alert-info').hide();
                $('div.alert-warning').show();
                $('#wdt-chart-wizard-next-step').prop('disabled',true);
            } else if ($(this).val() == 'apexcharts') {
                $('div.apexcharts-charts-type').show();
                $('div.alert-info').hide();
                $('div.alert-warning').show();
                $('#wdt-chart-wizard-next-step').prop('disabled',true);
            }   else if ($(this).val() == 'highstock') {
                $('div.highstock-charts-type').show();
                $('div.alert-info').hide();
                $('div.alert-warning').show();
                $('#wdt-chart-wizard-next-step').prop('disabled', true);

            }
        } else {
            $('div.alert-info').hide();
            $('div.alert-warning').hide();
        }
    });


})(jQuery);

/**
 * Helper func to convert hex to rgb color
 */
function hexToRgb(hex) {
    var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
    return result ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16)
    } : null;
}
