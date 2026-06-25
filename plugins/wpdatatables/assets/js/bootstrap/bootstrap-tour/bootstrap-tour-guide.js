(function ($) {
    $(function () {
        var $demo0, $demo1, $demo2, tour0, tour1, tour2, invalidStep = -1;

        $demo0 = $("#wdt-tutorial-simple-table");
        $demo1 = $("#wdt-tutorial-data-source");
        $demo2 = $("#wdt-tutorial-create-charts");

        function validateStepInput(tour) {
            var currentStep = tour.getCurrentStep();
            var stepName = tour._options.name;
            switch (stepName) {
                case 'create-table-data-source':
                    var inputURL = $('#wdt-input-url');
                    var selectBox =  $('.wdt-input-data-source-type .bootstrap-select ul.dropdown-menu li.selected:not([data-original-index="0"])')

                    if (inputURL.is(":visible") && inputURL.val() === '' && currentStep === 6) {
                        invalidStep = tour.getCurrentStep();
                    }

                    if (!selectBox.length) {
                        invalidStep = tour.getCurrentStep();
                    }

                    break;
                case 'create-chart':
                    var disabledNextButton = $('#wdt-chart-wizard-next-step');
                    var selectedChartType = $('.wdt-chart-wizard-chart-selecter-block .card.selected');
                    var googleCharts = $('.charts-type.google-charts-type');
                    var ChartsJS = $('.charts-type.chartjs-charts-type');

                    if ((!selectedChartType.length && disabledNextButton.is(":disabled") && googleCharts.is(":visible") && currentStep === 7) ||
                        (!selectedChartType.length && disabledNextButton.is(":disabled") && ChartsJS.is(":visible") && currentStep === 8)) {
                        invalidStep = tour.getCurrentStep();
                    }
                    if (!selectedChartType.length && !disabledNextButton.is(":disabled") && googleCharts.is(":visible") ||
                        !selectedChartType.length && !disabledNextButton.is(":disabled") && ChartsJS.is(":visible")) {
                        invalidStep = tour.getCurrentStep();
                    }
                    if (disabledNextButton.is(":disabled") && currentStep === 14) {
                        invalidStep = tour.getCurrentStep();
                    }
                    break;
            }

            return invalidStep === -1;
        }

        function checkPreviousStepValid(tour) {

            // .goTo only seems to work in the onShown step event so I had to put this check
            // on the next step's onShown event in order to redisplay the previous step with
            // the error
            if (invalidStep > -1) {
                var tempStep = invalidStep;
                var currentStep = tour.getCurrentStep();
                var stepName = tour._options.name;
                var errorMessage = '';
                invalidStep = -1;
                tour.goTo(tempStep);
                switch (stepName) {
                    case 'create-chart':
                        if (currentStep === 9){
                            errorMessage = wpdtTutorialStrings.cannot_be_empty_chart_type;
                        } else if (currentStep === 12){
                            errorMessage = wpdtTutorialStrings.cannot_be_empty_chart_table;
                        } else if (currentStep === 15){
                            errorMessage = wpdtTutorialStrings.cannot_be_empty_chart_table_columns;
                        }
                        break;
                    default:
                        errorMessage = wpdtTutorialStrings.cannot_be_empty_field;
                        break;

                }
                wdtNotify(
                    errorMessage,
                    '',
                    'danger'
                )
            }
        }

        tour0 = new Tour({
            name: "create-simple-table",
            keyboard: false,
            steps: [
                {
                    // step 0
                    orphan: true,
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour0.step0.title,
                    content: wpdtTutorialStrings.tour0.step0.content,
                }, {
                    // step 1
                    element: "#toplevel_page_wpdatatables-dashboard ul li:nth-child(4) a",
                    placement: "right",
                    reflex: true,
                    title: wpdtTutorialStrings.tour0.step1.title,
                    content: wpdtTutorialStrings.tour0.step1.content,
                    onShown: function () {
                        $('#toplevel_page_wpdatatables-dashboard ul li:nth-child(4) a').css("background-color", "#F88F20");
                    },
                    onHidden: function () {
                        $('#toplevel_page_wpdatatables-dashboard ul li:nth-child(4) a').css("background-color", "inherit");
                    }
                }, {
                    // step 2
                    path: document.location.pathname + "?page=wpdatatables-constructor",
                    element: ".wdt-first-row .wdt-constructor-type-selecter-block:nth-child(1) .card",
                    placement: "right",
                    title: wpdtTutorialStrings.tour0.step2.title,
                    content: wpdtTutorialStrings.tour0.step2.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('.wdt-constructor-type-selecter-block .card:not([data-value="simple"])').addClass('disabled');
                        window.localStorage.removeItem('create-simple-table_redirect_to');
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 3
                    element: "#wdt-constructor-next-step",
                    placement: "left",
                    title: wpdtTutorialStrings.tour0.step3.title,
                    content: wpdtTutorialStrings.tour0.step3.content,
                    reflex: true,
                    backdrop: true,
                    backdropPadding: 5,
                    duration: 3000,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                        $('.wdt-constructor-type-selecter-block .card:not([data-value="simple"])').addClass('disabled');
                    },
                    onNext: function () {
                        $('#wdt-constructor-next-step').click();
                    }
                }, {
                    // step 4
                    orphan: true,
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour0.step4.title,
                    content: wpdtTutorialStrings.tour0.step4.content,
                }, {
                    // step 5
                    element: "#wdt-constructor-simple-table-name",
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour0.step5.title,
                    content: wpdtTutorialStrings.tour0.step5.content,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 6
                    element: "#wdt-simple-table-number-of-columns",
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour0.step6.title,
                    content: wpdtTutorialStrings.tour0.step6.content,
                    backdrop: true,
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 7
                    element: "#wdt-simple-table-number-of-rows",
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour0.step7.title,
                    content: wpdtTutorialStrings.tour0.step7.content,
                    backdrop: true,
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 8
                    element: "#wdt-simple-table-constructor",
                    placement: "left",
                    title: wpdtTutorialStrings.tour0.step8.title,
                    content: wpdtTutorialStrings.tour0.step8.content,
                    reflex: true,
                    backdrop: true,
                    redirect:false,
                    backdropContainer: '#wdt-tour-actions',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 9
                    redirect:false,
                    orphan: true,
                    element: "#edit-table-settings",
                    placement: "top",
                    title: wpdtTutorialStrings.tour0.step9.title,
                    content: wpdtTutorialStrings.tour0.step9.content,

                }, {
                    // step 10
                    orphan: true,
                    placement: "top",
                    title: wpdtTutorialStrings.tour0.step10.title,
                    content: wpdtTutorialStrings.tour0.step10.content,

                }, {
                    // step 11
                    element: "#wpdt-table-editor",
                    placement: "top",
                    title: wpdtTutorialStrings.tour0.step11.title,
                    content: wpdtTutorialStrings.tour0.step11.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wpdt-table-editor').css("z-index", "1101");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                        $('#wpdt-table-editor').css("z-index", "10");
                    }
                }, {
                    // step 11
                    element: "#wpdt-cell-action-buttons",
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour0.step12.title,
                    content: wpdtTutorialStrings.tour0.step12.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    },
                }, {
                    // step 12
                    element: "#wpdt-views .nav.nav-pills",
                    placement: "right",
                    title: wpdtTutorialStrings.tour0.step13.title,
                    content: wpdtTutorialStrings.tour0.step13.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 13
                    element: "#wpdt-view-container",
                    placement: "top",
                    title: wpdtTutorialStrings.tour0.step14.title,
                    content: wpdtTutorialStrings.tour0.step14.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 14
                    element: "#wdt-table-id",
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour0.step15.title,
                    content: wpdtTutorialStrings.tour0.step15.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                },
            ],
            template: function () {
                var showButtons = '';
                var tour0NextButtonSteps = [4, 5, 6, 7, 9, 10, 11, 12, 13, 14];
                if (typeof tour0 == 'undefined' && localStorage.getItem("create-simple-table_current_step") !== null) {
                    window.localStorage.removeItem('create-simple-table_current_step');
                    window.localStorage.removeItem('create-simple-table_redirect_to');
                    return "<div class='popover tour'>" +
                        "<div class='arrow'></div>" +
                        "<p>" + wpdtTutorialStrings.cancel_tour + "</p>" +
                        "<div class='popover-navigation d-flex flex-nowrap'>" +
                        "<span class='popover-separator' data-role='separator'> </span>" +
                        "<button class='btn btn-warning float-left' data-role='end'>" + wpdtTutorialStrings.cancel_button + "</button></div></div>";
                } else if (tour0.getCurrentStep() === 0) {
                    showButtons = "<button class='btn btn-warning float-left' data-role='end'>" + wpdtTutorialStrings.cancel_button + "</button><button class='btn btn-primary float-right' data-role='next'>" + wpdtTutorialStrings.start_button + " <i class='wpdt-icon-chevron-right m-l-5'></i></button>" + "</div></div>"
                } else if (jQuery.inArray(tour0.getCurrentStep(), tour0NextButtonSteps) !== -1) {
                    showButtons = "<button class='btn btn-primary' data-role='next'>" + wpdtTutorialStrings.next_button + " <i class='wpdt-icon-chevron-right'></i></button>" + "<button class='btn btn-warning' data-role='end'> " + wpdtTutorialStrings.skip_button + " </button>" + "</div></div>";
                } else if (tour0.getCurrentStep() === 15) {
                    showButtons = "<button class='btn btn-primary float-right' data-role='end'><i class='wpdt-icon-trophy m-r-5'></i> " + wpdtTutorialStrings.finish_button + " </button>" + "</div></div>";
                } else {
                    showButtons = "<button class='btn btn-warning' data-role='end'> " + wpdtTutorialStrings.skip_button + " </button>" + "</div></div>";
                }

                return "<div class='popover tour'>" +
                    "<div class='arrow'></div>" +
                    "<h3 class='popover-title'></h3>" +
                    "<div class='popover-content'></div>" +
                    "<div class='popover-navigation d-flex flex-nowrap'>" +
                    "<span class='popover-separator' data-role='separator'> </span>" +
                    showButtons;

            },
            onStart: function () {
                $demo0.addClass("disabled");
                $demo1.addClass("disabled");
                $demo2.addClass("disabled");
            },
            onEnd: function () {
                window.localStorage.removeItem('create-simple-table_current_step');
                window.localStorage.removeItem('create-simple-table_redirect_to');
                $demo0.removeClass("disabled");
                $demo1.removeClass("disabled");
                $demo2.removeClass("disabled");
                $('.wdt-constructor-type-selecter-block .card:not([data-value="simple"])').removeClass('disabled');
            }
        }).init();

        tour1 = new Tour({
            name: "create-table-data-source",
            keyboard: false,
            steps: [
                {
                    // step 0
                    orphan: true,
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour1.step0.title,
                    content: wpdtTutorialStrings.tour1.step0.content
                }, {
                    // step 1
                    element: "#toplevel_page_wpdatatables-dashboard ul li:nth-child(4) a",
                    placement: "right",
                    reflex: true,
                    title: wpdtTutorialStrings.tour1.step1.title,
                    content: wpdtTutorialStrings.tour1.step1.content,
                    onShown: function () {
                        $('#toplevel_page_wpdatatables-dashboard ul li:nth-child(4) a').css("background-color", "#F88F20");
                    },
                    onHidden: function () {
                        $('#toplevel_page_wpdatatables-dashboard ul li:nth-child(4) a').css("background-color", "inherit");
                    }
                }, {
                    // step 2
                    path: document.location.pathname + "?page=wpdatatables-constructor",
                    element: ".wdt-first-row .wdt-constructor-type-selecter-block:nth-child(2) .card",
                    placement: "left",
                    title: wpdtTutorialStrings.tour1.step2.title,
                    content: wpdtTutorialStrings.tour1.step2.content,
                    reflex: true,
                    backdrop: true,
                    backdropPadding: 4,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('.wdt-constructor-type-selecter-block .card:not([data-value="source"])').addClass('disabled');
                        window.localStorage.removeItem('create-table-data-source_redirect_to');
                    },
                    onHidden: function (tour) {
                        $('.tour-step-background').css("background-color", "inherit");
                        validateStepInput(tour);
                    }
                }, {
                    // step 3
                    element: "#wdt-constructor-next-step",
                    placement: "left",
                    title: wpdtTutorialStrings.tour1.step3.title,
                    content: wpdtTutorialStrings.tour1.step3.content,
                    reflex: true,
                    redirect: false,
                    backdrop: true,
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                        $('.wdt-constructor-type-selecter-block .card:not([data-value="source"])').removeClass('disabled');
                    }
                }, {
                    // step 4
                    redirect: false,
                    element: ".wdt-input-data-source-type",
                    placement: "top",
                    title: wpdtTutorialStrings.tour1.step4.title,
                    content: wpdtTutorialStrings.tour1.step4.content,
                    reflex: true,
                    backdrop: true,
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('.wdt-input-data-source-type .bootstrap-select').css("background-color", "#FFFFFF");
                        var v = document.getElementById('wdt-table-type');
                        delete v.dataset.toggle;
                        delete v.dataset.placement;
                        delete v.dataset.content;
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                        $('.wdt-input-data-source-type .bootstrap-select').css("background-color", "inherit");
                    }
                }, {
                    // step 5
                    element: "#wdt-table-type",
                    placement: "top",
                    title: wpdtTutorialStrings.tour1.step5.title,
                    content: wpdtTutorialStrings.tour1.step5.content,
                    onShown: function (tour) {
                        $('#wdt-browse-button').prop('disabled', true);
                        $('#wdt-input-url').prop('disabled', true);
                        var v = document.getElementById('wdt-table-type');
                        delete v.dataset.toggle;
                        delete v.dataset.placement;
                        delete v.dataset.content;
                    },
                    onHidden: function (tour) {
                        $('#wdt-browse-button').prop('disabled', false);
                        $('#wdt-input-url').prop('disabled', false);
                        $('#wdt-table-type')
                            .data('toggle','html-premium-popover')
                            .data('placement','top')
                            .data('content','content')
                    },
                    onNext: function (tour) {
                        validateStepInput(tour);
                    }
                }, {
                    // step 6
                    element: ".input-path-block",
                    placement: "top",
                    title: wpdtTutorialStrings.tour1.step6.title,
                    content: wpdtTutorialStrings.tour1.step6.content,
                    backdrop: true,
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('[data-id="wdt-table-type"]').css({
                            'cssText': "cursor:not-allowed;background-color:#eeeeee !important"
                        });
                        $('#wdt-table-type').prop('disabled', true);
                    },
                    onHidden: function (tour) {
                        $('.tour-step-background').css("background-color", "inherit");
                    },
                    onNext: function (tour) {
                        validateStepInput(tour);
                    }
                }, {
                    // step 7
                    element: ".wdt-table-settings .card-header .btn.wdt-apply",
                    placement: "left",
                    title: wpdtTutorialStrings.tour1.step7.title,
                    content: wpdtTutorialStrings.tour1.step7.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: '#wdt-tour-actions',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        checkPreviousStepValid(tour);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    },
                    onNext: function (tour) {
                        if (typeof wpdatatable_config !== 'undefined'){
                            $.ajax({
                                url: ajaxurl,
                                method: 'POST',
                                dataType: 'json',
                                data: {
                                    wdtNonce: $('#wdtNonce').val(),
                                    action: 'wpdatatables_save_table_config',
                                    table: JSON.stringify(wpdatatable_config.getJSON())
                                },
                                success: function (data) {
                                    if (typeof data.error != 'undefined') {
                                        tour.prev();
                                        wdtNotify(
                                            wpdtTutorialStrings.error_data_source,
                                            '',
                                            'danger'
                                        )
                                    }
                                }
                            });
                        }

                    }
                },  {
                    // step 8
                    orphan: true,
                    placement: "top",
                    title: wpdtTutorialStrings.tour1.step8.title,
                    content: wpdtTutorialStrings.tour1.step8.content,
                    onShown: function (tour) {
                        $('#wdt-table-type').prop('disabled', false);
                        $('[data-id="wdt-table-type"]').css({
                            'cssText': "cursor:pointer;background-color:white !important"
                        });
                    }
                },{
                    // step 9
                    element: "#wdt-table-id",
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour1.step9.title,
                    content: wpdtTutorialStrings.tour1.step9.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }
            ],
            template: function () {
                var showButtons = '';
                var tour1NextButtonSteps = [5, 6, 8];
                if (typeof tour1 == 'undefined' && localStorage.getItem("create-table-data-source_current_step") !== null) {
                    window.localStorage.removeItem('create-table-data-source_current_step');
                    window.localStorage.removeItem('create-table-data-source_redirect_to');
                    return "<div class='popover tour'>" +
                        "<div class='arrow'></div>" +
                        "<p>" + wpdtTutorialStrings.cancel_tour + "</p>" +
                        "<div class='popover-navigation d-flex flex-nowrap'>" +
                        "<span class='popover-separator' data-role='separator'> </span>" +
                        "<button class='btn btn-warning float-left' data-role='end'>" + wpdtTutorialStrings.cancel_button + "</button></div></div>";
                } else if (tour1.getCurrentStep() === 0) {
                    showButtons = "<button class='btn btn-warning float-left' data-role='end'>" + wpdtTutorialStrings.cancel_button + "</button><button class='btn btn-primary float-right' data-role='next'>" + wpdtTutorialStrings.start_button + " <i class='wpdt-icon-chevron-right m-l-5'></i></button>" + "</div></div>"
                } else if (jQuery.inArray(tour1.getCurrentStep(), tour1NextButtonSteps) !== -1) {
                    showButtons = "<button class='btn btn-primary' data-role='next'>" + wpdtTutorialStrings.next_button + " <i class='wpdt-icon-chevron-right'></i></button>" + "<button class='btn btn-warning' data-role='end'> " + wpdtTutorialStrings.skip_button + " </button>" + "</div></div>";
                } else if (tour1.getCurrentStep() === 9) {
                    showButtons = "<button class='btn btn-primary float-right' data-role='end'><i class='wpdt-icon-trophy m-r-5'></i> " + wpdtTutorialStrings.finish_button + " </button>" + "</div></div>";
                } else {
                    showButtons = "<button class='btn btn-warning' data-role='end'> " + wpdtTutorialStrings.skip_button + " </button>" + "</div></div>";
                }

                return "<div class='popover tour'>" +
                    "<div class='arrow'></div>" +
                    "<h3 class='popover-title'></h3>" +
                    "<div class='popover-content'></div>" +
                    "<div class='popover-navigation d-flex flex-nowrap'>" +
                    "<span class='popover-separator' data-role='separator'> </span>" +
                    showButtons;

            },
            onStart: function () {
                $demo0.addClass("disabled");
                $demo1.addClass("disabled");
                $demo2.addClass("disabled");
            },
            onEnd: function () {
                window.localStorage.removeItem('create-table-data-source_current_step');
                window.localStorage.removeItem('create-table-data-source_redirect_to');
                $demo0.removeClass("disabled");
                $demo1.removeClass("disabled");
                $demo2.removeClass("disabled");
                $('.wdt-constructor-type-selecter-block .card:not([data-value="source"])').removeClass('disabled');
                $('#wdt-browse-button').prop('disabled', false);
                $('#wdt-input-url').prop('disabled', false);
                $('#wdt-table-type').prop('disabled', false);
                $('[data-id="wdt-table-type"]').css({
                    'cssText': "cursor:pointer;background-color:white !important"
                });
            }
        }).init();

        tour2 = new Tour({
            name: "create-chart",
            keyboard: false,
            steps: [
                {
                    // step 0
                    orphan: true,
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour2.step0.title,
                    content: wpdtTutorialStrings.tour2.step0.content
                }, {
                    // step 1
                    element: "#toplevel_page_wpdatatables-dashboard ul li:nth-child(6) a",
                    placement: "right",
                    reflex: true,
                    title: wpdtTutorialStrings.tour2.step1.title,
                    content: wpdtTutorialStrings.tour2.step1.content,
                    onShown: function () {
                        $('#toplevel_page_wpdatatables-dashboard ul li:nth-child(6) a').css("background-color", "#F88F20");
                    },
                    onHidden: function () {
                        $('#toplevel_page_wpdatatables-dashboard ul li:nth-child(6) a').css("background-color", "inherit");
                    }
                }, {
                    // step 2
                    path: document.location.pathname + "?page=wpdatatables-chart-wizard",
                    element: "#wdt-chart-wizard-body",
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour2.step2.title,
                    content: wpdtTutorialStrings.tour2.step2.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        window.localStorage.removeItem('create-chart_redirect_to');
                        $('button[data-id="chart-render-engine"]').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 3
                    element: ".chart-wizard-breadcrumb",
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour2.step3.title,
                    content: wpdtTutorialStrings.tour2.step3.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('button[data-id="chart-render-engine"]').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 4
                    element: ".chart-name",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step4.title,
                    content: wpdtTutorialStrings.tour2.step4.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('button[data-id="chart-render-engine"]').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                        $('button[data-id="chart-render-engine"]').prop('disabled', false);
                    }
                }, {
                    // step 5
                    element: ".render-engine",
                    placement: "left",
                    title: wpdtTutorialStrings.tour2.step5.title,
                    content: wpdtTutorialStrings.tour2.step5.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 6
                    element: "#chart-render-engine",
                    placement: "top",
                    title: wpdtTutorialStrings.tour2.step6.title,
                    content: wpdtTutorialStrings.tour2.step6.content,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('.charts-type.google-charts-type:hidden').addClass('disabled');
                        $('.charts-type.chartjs-charts-type:hidden').addClass('disabled');
                        $('.charts-type.highcharts-charts-type:hidden').addClass('disabled');
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 7
                    element: ".charts-type.google-charts-type",
                    placement: "top",
                    title: wpdtTutorialStrings.tour2.step7.title,
                    content: wpdtTutorialStrings.tour2.step7.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#chart-render-engine').prop('disabled', true);
                        $('[data-id="chart-render-engine"]').prop('disabled', true);
                        $('.charts-type.google-charts-type').removeClass('disabled');
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    },
                    onNext: function (tour) {
                        validateStepInput(tour);
                    }
                }, {
                    // step 8
                    element: ".charts-type.chartjs-charts-type",
                    placement: "top",
                    title: wpdtTutorialStrings.tour2.step7.title,
                    content: wpdtTutorialStrings.tour2.step7.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#chart-render-engine').prop('disabled', true);
                        $('[data-id="chart-render-engine"]').prop('disabled', true);
                        $('.charts-type.chartjs-charts-type').removeClass('disabled');
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    },
                    onNext: function (tour) {
                        validateStepInput(tour);
                    }
                },{
                    // step 9
                    element: "#wdt-chart-wizard-next-step",
                    placement: "left",
                    title: wpdtTutorialStrings.tour2.step10.title,
                    content: wpdtTutorialStrings.tour2.step10.content,
                    backdrop: true,
                    reflex: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#chart-render-engine').prop('disabled', true);
                        $('[data-id="chart-render-engine"]').prop('disabled', true);
                        checkPreviousStepValid(tour);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                        $('#chart-render-engine').prop('disabled', false);
                        $('[data-id="chart-render-engine"]').prop('disabled', false);
                    },
                    onNext: function () {
                        $("html, body").animate({scrollTop: 0}, "slow");
                    },
                }, {
                    // step 10
                    element: ".data-source",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step11.title,
                    content: wpdtTutorialStrings.tour2.step11.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 11
                    element: "#wpdatatables-chart-source",
                    placement: "top",
                    title: wpdtTutorialStrings.tour2.step12.title,
                    content: wpdtTutorialStrings.tour2.step12.content,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    },
                    onNext: function (tour) {
                        validateStepInput(tour);
                    }
                }, {
                    // step 12
                    element: "#wdt-chart-wizard-next-step",
                    placement: "left",
                    title: wpdtTutorialStrings.tour2.step13.title,
                    content: wpdtTutorialStrings.tour2.step13.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                        checkPreviousStepValid(tour);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 13
                    orphan: true,
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour2.step14.title,
                    content: wpdtTutorialStrings.tour2.step14.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true)
                    }
                }, {
                    // step 14
                    element: ".wdt-chart-column-picker-container",
                    placement: "bottom",
                    title: wpdtTutorialStrings.tour2.step15.title,
                    content: wpdtTutorialStrings.tour2.step15.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    },
                    onNext: function (tour) {
                        validateStepInput(tour);
                    }
                }, {
                    // step 15
                    element: "#wdt-chart-wizard-next-step",
                    placement: "left",
                    title: wpdtTutorialStrings.tour2.step16.title,
                    content: wpdtTutorialStrings.tour2.step16.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                        checkPreviousStepValid(tour);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 16
                    orphan: true,
                    placement: "top",
                    title: wpdtTutorialStrings.tour2.step17.title,
                    content: wpdtTutorialStrings.tour2.step17.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function (tour) {
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                }, {
                    // step 17
                    element: ".tab-nav.settings",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step18.title,
                    content: wpdtTutorialStrings.tour2.step18.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");

                    }
                }, {
                    // step 18
                    element: "#chart-container-tabs-1",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step19.title,
                    content: wpdtTutorialStrings.tour2.step19.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 19
                    element: "#chart-container-tabs-2",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step19.title,
                    content: wpdtTutorialStrings.tour2.step19.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 20
                    element: "#chart-container-tabs-3",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step19.title,
                    content: wpdtTutorialStrings.tour2.step19.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 21
                    element: "#chart-container-tabs-4",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step19.title,
                    content: wpdtTutorialStrings.tour2.step19.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 22
                    element: "#chart-container-tabs-5",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step19.title,
                    content: wpdtTutorialStrings.tour2.step19.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 23
                    element: "#chart-container-tabs-6",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step19.title,
                    content: wpdtTutorialStrings.tour2.step19.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 24
                    element: "#chart-container-tabs-7",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step19.title,
                    content: wpdtTutorialStrings.tour2.step19.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 25
                    element: "#chart-container-tabs-8",
                    placement: "right",
                    title: wpdtTutorialStrings.tour2.step19.title,
                    content: wpdtTutorialStrings.tour2.step19.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 26
                    element: ".chart-preview-container",
                    placement: "left",
                    title: wpdtTutorialStrings.tour2.step27.title,
                    content: wpdtTutorialStrings.tour2.step27.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-next-step').prop('disabled', true);
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                        $('#wdt-chart-wizard-next-step').prop('disabled', false)
                    }
                }, {
                    // step 27
                    element: "#wdt-chart-wizard-next-step",
                    placement: "left",
                    title: wpdtTutorialStrings.tour2.step28.title,
                    content: wpdtTutorialStrings.tour2.step28.content,
                    reflex: true,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onNext: function () {
                        $("html, body").animate({scrollTop: 0}, "slow");
                    },
                    onShown: function () {
                        $('.tour-step-background').css("background-color", "rgba(248, 143, 32, 0.5)");
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('.tour-step-background').css("background-color", "inherit");
                    }
                }, {
                    // step 28
                    orphan: true,
                    placement: "top",
                    title: wpdtTutorialStrings.tour2.step29.title,
                    content: wpdtTutorialStrings.tour2.step29.content,
                    backdrop: true,
                    backdropContainer: 'body',
                    backdropPadding: 5,
                    onShown: function () {
                        $('#wdt-chart-wizard-previous-step').prop('disabled', true);
                    },
                    onHidden: function () {
                        $('#wdt-chart-wizard-previous-step').prop('disabled', false);
                    }
                }
            ],
            template: function () {
                var showButtons = '';
                var tour2NextButtonSteps = [2, 3, 4, 6, 7,8,  11, 13, 14, 16, 17, 18, 19, 20, 21, 22, 23, 24, 25, 26];
                if (typeof tour2 == 'undefined' && localStorage.getItem("create-chart_current_step") !== null) {
                    window.localStorage.removeItem('create-chart_current_step');
                    window.localStorage.removeItem('create-chart_redirect_to');
                    return "<div class='popover tour'>" +
                        "<div class='arrow'></div>" +
                        "<p>" + wpdtTutorialStrings.cancel_tour + "</p>" +
                        "<div class='popover-navigation d-flex flex-nowrap'>" +
                        "<span class='popover-separator' data-role='separator'> </span>" +
                        "<button class='btn btn-warning float-left' data-role='end'>" + wpdtTutorialStrings.cancel_button + "</button></div></div>";
                } else if (tour2.getCurrentStep() === 0) {
                    showButtons = "<button class='btn btn-warning float-left' data-role='end'>" + wpdtTutorialStrings.cancel_button + "</button><button class='btn btn-primary float-right' data-role='next'>" + wpdtTutorialStrings.start_button + " <i class='wpdt-icon-chevron-right m-l-5'></i></button>" + "</div></div>"
                } else if (jQuery.inArray(tour2.getCurrentStep(), tour2NextButtonSteps) !== -1) {
                    showButtons = "<button class='btn btn-primary' data-role='next'>" + wpdtTutorialStrings.next_button + " <i class='wpdt-icon-chevron-right m-l-5'></i></button>" + "<button class='btn btn-warning' data-role='end'> " + wpdtTutorialStrings.skip_button + " </button>" + "</div></div>";
                } else if (tour2.getCurrentStep() === 28) {
                    showButtons = "<button class='btn btn-primary float-right' data-role='end'><i class='wpdt-icon-trophy m-r-5'></i> " + wpdtTutorialStrings.finish_button + " </button>" + "</div></div>";
                } else {
                    showButtons = "<button class='btn btn-warning' data-role='end'> " + wpdtTutorialStrings.skip_button + " </button>" + "</div></div>";
                }

                return "<div class='popover tour'>" +
                    "<div class='arrow'></div>" +
                    "<h3 class='popover-title'></h3>" +
                    "<div class='popover-content'></div>" +
                    "<div class='popover-navigation d-flex flex-nowrap'>" +
                    "<span class='popover-separator' data-role='separator'> </span>" +
                    showButtons;

            },
            onStart: function () {
                $demo0.addClass("disabled");
                $demo1.addClass("disabled");
                $demo2.addClass("disabled");
            },
            onEnd: function () {
                window.localStorage.removeItem('create-chart_current_step');
                window.localStorage.removeItem('create-chart_redirect_to');
                $demo0.removeClass("disabled");
                $demo1.removeClass("disabled");
                $demo2.removeClass("disabled");
                $('button[data-id="chart-render-engine"]').prop('disabled', false);
                $('.charts-type.google-charts-type:hidden').removeClass('disabled');
                $('.charts-type.chartjs-charts-type:hidden').removeClass('disabled');
                $('#chart-render-engine').prop('disabled', false);
                $('[data-id="chart-render-engine"]').prop('disabled', false);
                $('#wdt-chart-wizard-previous-step').prop('disabled', false);
            }
        }).init();

        $(document).on("click", "#wdt-tutorial-simple-table", function (e) {
            e.preventDefault();
            if ($(this).hasClass("disabled")) {
                return;
            }
            tour0.restart();
        });

        $(document).on("click", "#wdt-tutorial-data-source", function (e) {
            e.preventDefault();
            if ($(this).hasClass("disabled")) {
                return;
            }
            tour1.restart();
        });

        $(document).on("click", "#wdt-tutorial-create-charts", function (e) {
            e.preventDefault();
            if ($(this).hasClass("disabled")) {
                return;
            }
            tour2.restart();
        });

        if (!(window.location.href.includes('wpdatatables-constructor') ||
         window.location.href.includes('wpdatatables-getting-started') ||
         window.location.href.includes('wpdatatables-chart-wizard')) &&
             (localStorage.getItem("create-table-data-source_redirect_to") !== null ||
             localStorage.getItem("create-table-data-source_current_step") !== null ||
                 localStorage.getItem("create-simple-table_current_step") !== null ||
                 localStorage.getItem("create-simple-table_redirect_to") !== null ||
             localStorage.getItem("create-chart_redirect_to") !== null ||
             localStorage.getItem("create-chart_current_step") !== null)){
            window.localStorage.removeItem('create-table-data-source_current_step');
            window.localStorage.removeItem('create-table-data-source_redirect_to');
            window.localStorage.removeItem('create-simple-table_current_step');
            window.localStorage.removeItem('create-simple-table_redirect_to');
            window.localStorage.removeItem('create-chart_current_step');
            window.localStorage.removeItem('create-chart_redirect_to');
        }
        if ( localStorage.getItem("create-chart_current_step") !== null) {
            $('#wdt-chart-wizard-next-step').on('click', function () {

                if (localStorage.getItem("create-chart_current_step") == 7 && !$('.wdt-chart-wizard-chart-selecter-block .card.selected').length ||
                    localStorage.getItem("create-chart_current_step") == 8 && !$('.wdt-chart-wizard-chart-selecter-block .card.selected').length ||
                    localStorage.getItem("create-chart_current_step") == 7 && $('.wdt-chart-wizard-chart-selecter-block .card.selected').length ||
                    localStorage.getItem("create-chart_current_step") == 8 && $('.wdt-chart-wizard-chart-selecter-block .card.selected').length) {
                    $('#wdt-chart-wizard-previous-step').click();
                    $("html, body").animate({scrollTop: 0}, "slow");
                } else if (localStorage.getItem("create-chart_current_step") == 11) {
                    $('#wdt-chart-wizard-previous-step').click();
                    $('#wpdatatables-chart-source').val('').wdtBootstrapSelectPicker('refresh');
                } else if (localStorage.getItem("create-chart_current_step") == 14) {
                    var observer = new MutationObserver(function (mutations) {
                        if ($("#wdt-chart-wizard-previous-step").length) {
                            $('#wdt-chart-wizard-previous-step').click();
                            observer.disconnect();
                            //We can disconnect observer once the element exist if we dont want observe more changes in the DOM
                        }
                    });

                    // Start observing
                    observer.observe(document.body, { //document.body is node target to observe
                        childList: true, //This is a must have for the observer with subtree
                        subtree: true //Set to true if changes must also be observed in descendants.
                    });
                }
            });
        }

    });

})(jQuery);