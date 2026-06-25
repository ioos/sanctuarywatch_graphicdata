<?php defined('ABSPATH') or die('Access denied.'); ?>

<div class="row">
    <div class="col-sm-5 col-md-5 col-lg-5 m-b-20">
        <div id="chart-container-tabs" class=" settings">

            <div class="col-sm-3 col-md-3 col-lg-4">
                <ul class="tab-nav settings">
                    <li class="chart-container active"><a href="#chart-container-tabs-1"
                                                          data-toggle="tab"><?php _e('Chart', 'wpdatatables'); ?></a>
                    </li>
                    <li class="chart-container series"><a href="#chart-container-tabs-2" data-toggle="tab"
                                                          class=""><?php esc_html_e('Series', 'wpdatatables'); ?></a></li>
                    <li class="chart-container axes"><a href="#chart-container-tabs-3" data-toggle="tab"
                                                        class=""><?php esc_html_e('Axes', 'wpdatatables'); ?></a></li>
                    <li class="chart-container title"><a href="#chart-container-tabs-4" data-toggle="tab"
                                                         class=""><?php esc_html_e('Title', 'wpdatatables'); ?></a></li>
                    <li class="chart-container tooltips"><a href="#chart-container-tabs-5" data-toggle="tab"
                                                            class=""><?php esc_html_e('Tooltip', 'wpdatatables'); ?></a></li>
                    <li class="chart-container legend"><a href="#chart-container-tabs-6" data-toggle="tab"
                                                          class=""><?php esc_html_e('Legend', 'wpdatatables'); ?></a></li>
                    <li class="chart-container highcharts"><a href="#chart-container-tabs-7" data-toggle="tab"
                                                              class=""><?php esc_html_e('Exporting', 'wpdatatables'); ?></a>
                    </li>
                    <li class="chart-container highcharts"><a href="#chart-container-tabs-8" data-toggle="tab"
                                                              class=""><?php esc_html_e('Credits', 'wpdatatables'); ?></a></li>
                </ul>
            </div>

            <div class="tab-content p-0">
                <div id="chart-container-tabs-2"
                     class="col-sm-9 col-md-9 col-lg-8 chart-container chart-options-container tab-pane">
                    <div>
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Series settings', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('If you want to redefine the series labels and colors you can do it here.', 'wpdatatables'); ?>"></i>
                        </h4>
                    </div>
                    <div>
                        <div id="series-settings-container">

                        </div>
                    </div>
                    <div class="chartjs google" id="curve-type-row">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Curve type', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('Controls the curve of the lines', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="toggle-switch" data-ts-color="blue">
                            <input id="curve-type" type="checkbox">
                            <label for="curve-type"><?php _e('Check for smoothed lines', 'wpdatatables'); ?></label>
                        </div>
                    </div>
                </div>
                <div id="chart-container-tabs-1"
                     class="col-sm-9 col-md-9 col-lg-8 chart-container chart-options-container tab-pane active">
                    <div class="chart-width">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Chart width', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The width of the chart.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <div class="wdt-custom-number-input">
                                            <button type="button" id="btn-minus-chart-width"  class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="chart-width">
                                                <i class="wpdt-icon-minus"></i>
                                            </button>
                                            <input type="number" name="chart-width" min="0" value="400" class="form-control input-sm input-number"
                                                   id="chart-width">
                                            <button type="button" id="btn-plus-chart-width"  class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="chart-width">
                                                <i class="wpdt-icon-plus-full"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="responsive-width">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Responsive width', 'wpdatatables'); ?>
                            <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('If you tick this chart width will always adjust to 100% width of the container', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="toggle-switch p-b-16" data-ts-color="blue">
                            <input id="chart-responsive-width" type="checkbox" checked>
                            <label for="chart-responsive-width"><?php esc_html_e('Responsive chart width', 'wpdatatables'); ?></label>
                        </div>
                    </div>
                    <div class="chart-height">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Chart height', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The height of the chart.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <div class="wdt-custom-number-input">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="chart-height">
                                                <i class="wpdt-icon-minus"></i>
                                            </button>
                                            <input type="number" name="chart-height"  min="0" value="400" class="form-control input-sm input-number"
                                                   id="chart-height">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="chart-height">
                                                <i class="wpdt-icon-plus-full"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="group-chart">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Group chart', 'wpdatatables'); ?>
                            <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('If you tick this checkbox, the values of the rows with same label will be summed up and rendered as a single series. If you leave it unticked all rows will be rendered as separate series.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="toggle-switch p-b-16" data-ts-color="blue">
                            <input id="group-chart" type="checkbox" class="doNotTriggerChange">
                            <label for="group-chart"><?php esc_html_e('Enable grouping', 'wpdatatables'); ?></label>
                        </div>
                    </div>
                    <div class="background-color-container" id="background-color-container">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Background color', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The background color for the outer chart area.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="cp-container">
                            <div class="form-group">
                                <div class="fg-line dropdown">
                                    <div id="cp"
                                         class="input-group wdt-color-picker">
                                        <input type="text" id="background-color" value=""
                                               class="form-control cp-value wdt-add-picker background-color"/>
                                        <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="border-width">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Border width', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The pixel width of the outer chart border.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <div class="wdt-custom-number-input">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="border-width">
                                                <i class="wpdt-icon-minus"></i>
                                            </button>
                                            <input type="number" name="border-width" min="0" value="0"  class="form-control input-sm input-number"
                                                   id="border-width">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="border-width">
                                                <i class="wpdt-icon-plus-full"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="border-color-container" id="border-color-container">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Border color', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The color of the outer chart border.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="cp-container">
                            <div class="form-group">
                                <div class="fg-line dropdown">
                                    <div id="cp"
                                         class="input-group wdt-color-picker">
                                        <input type="text" id="border_color" value=""
                                               class="form-control cp-value wdt-add-picker plot border_color"/>
                                        <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="border-radius">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Border radius', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The corner radius of the outer chart border.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <div class="wdt-custom-number-input">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="border-radius">
                                                <i class="wpdt-icon-minus"></i>
                                            </button>
                                            <input type="number" name="border-radius" min="0" value="0" class="form-control input-sm input-number"
                                                   id="border-radius">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="border-radius">
                                                <i class="wpdt-icon-plus-full"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="google"  id="plot-background-color-container">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Plot background color', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The background color or gradient for the plot area.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="cp-container">
                            <div class="form-group">
                                <div class="fg-line dropdown">
                                    <div id="cp"
                                         class="input-group wdt-color-picker">
                                        <input type="text" id="plot-background-color" value=""
                                               class="form-control cp-value wdt-add-picker plot-background-color"/>
                                        <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="google"  id="plot-border-width-row">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Plot border width', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The corner radius of the outer chart border.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <div class="wdt-custom-number-input">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="plot-border-width">
                                                <i class="wpdt-icon-minus"></i>
                                            </button>
                                            <input type="number" name="plot-border-width" min="0" value="" class="form-control input-sm input-number plot-border-width"
                                                   id="plot-border-width">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="plot-border-width">
                                                <i class="wpdt-icon-plus-full"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="google"  id="plot-border-color-container">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Plot border color', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The color of the inner chart or plot area border.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="cp-container">
                            <div class="form-group">
                                <div class="fg-line dropdown">
                                    <div id="cp"
                                         class="input-group wdt-color-picker">
                                        <input type="text" id="plot-border-color" value=""
                                               class="form-control cp-value wdt-add-picker plot-border-color"/>
                                        <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="google chartjs" id="font-size-row">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Font size', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The default font size, in pixels, of all text in the chart.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <div class="wdt-custom-number-input">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="font-size">
                                                <i class="wpdt-icon-minus"></i>
                                            </button>
                                            <input type="number" name="font-size" value="" min="0" class="form-control input-sm input-number"
                                                   id="font-size" data-placement="top" title="" data-content="content">
                                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="font-size">
                                                <i class="wpdt-icon-plus-full"></i>
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="google chartjs" id="font-name-row">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Font name', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The default font face for all text in the chart.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="row">
                                    <div class="col-sm-12">
                                        <input type="text" name="font-name" id="font-name" value="Arial"
                                               class="form-control input-sm" data-placement="top" title="" data-content="content"/>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chartjs" id="font-style-row">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Font style', 'wpdatatables'); ?>
                            <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The default font style for all text in the chart (except title and tooltip)', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="select">
                                    <select class="selectpicker" name="font-style" id="font-style">
                                        <option selected="selected" value="normal">Normal</option>
                                        <option value="italic">Italic</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chartjs" id="font-weight-row">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Font weight', 'wpdatatables'); ?>
                            <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The default font weight for all text in the chart (except title and tooltip)', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="select">
                                    <select class="selectpicker" name="font-weight" id="font-weight">
                                        <option value="normal">Normal</option>
                                        <option selected="selected" value="bold">Bold</option>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="chartjs" id="font-color-container">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Font color', 'wpdatatables'); ?>
                            <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('The default font color for all text in the chart.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="cp-container">
                            <div class="form-group">
                                <div class="fg-line dropdown">
                                    <div id="cp"
                                         class="input-group wdt-color-picker">
                                        <input type="text" id="font-color" value=""
                                               class="form-control cp-value wdt-add-picker font-color"/>
                                        <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="google" id="three-d-row">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('3D', 'wpdatatables'); ?>
                            <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('Check for 3D pie chart', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="toggle-switch p-b-16" data-ts-color="blue">
                            <input id="three-d" type="checkbox">
                            <label for="three-d"><?php _e('3D', 'wpdatatables'); ?></label>
                        </div>
                    </div>
                </div>
                <div id="chart-container-tabs-3"
                     class="col-sm-9 col-md-9 col-lg-8 chart-container chart-options-container tab-pane">
                    <div class="inside">
                        <div id="show-grid-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Grid', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Controls the curve of the lines', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="show-grid" type="checkbox" checked>
                                <label for="show-grid"><?php _e('Do you want to show grid on the chart', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                        <div id="horizontal-axis-label-row" class="google chartjs">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Horizontal axis label', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Name of the horizontal axis.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <input type="text" id="horizontal-axis-label" value=""
                                                   class="form-control input-sm"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="google" id="horizontal-axis-crosshair-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Horizontal crosshair', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Configure a horizontal crosshair that follows either the mouse pointer or the hovered point lines', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch p-b-16" data-ts-color="blue">
                                <input id="horizontal-axis-crosshair" type="checkbox">
                                <label for="horizontal-axis-crosshair"><?php esc_html_e('Show x-Axis crosshair', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                        <div class="google" id="horizontal-axis-direction-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Horizontal axis direction', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The direction in which the values along the horizontal axis grow. Specify -1 to reverse the order of the values', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="selectpicker" name="horizontal-axis-direction"
                                                id="horizontal-axis-direction">
                                            <option selected="selected" value="1">1</option>
                                            <option value="-1">-1</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="vertical-axis-label-row" class="google chartjs">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Vertical axis label', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Name of the vertical axis.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <input type="text" id="vertical-axis-label" value=""
                                                   class="form-control input-sm"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="google" id="vertical-axis-crosshair-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Vertical crosshair', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Configure a vertical crosshair that follows either the mouse pointer or the hovered point lines', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch p-b-16" data-ts-color="blue">
                                <input id="vertical-axis-crosshair" type="checkbox">
                                <label for="vertical-axis-crosshair"><?php esc_html_e('Show y-Axis crosshair', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                        <div class="google" id="vertical-axis-direction-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Vertical axis direction', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The direction in which the values along the vertical axis grow. Specify -1 to reverse the order of the values', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="selectpicker" name="vertical-axis-direction"
                                                id="vertical-axis-direction">
                                            <option selected="selected" value="1">1</option>
                                            <option value="-1">-1</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="vertical-axis-min-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Vertical axis min value', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The minimum value of the axis.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div class="wdt-custom-number-input">
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="vertical-axis-min">
                                                    <i class="wpdt-icon-minus"></i>
                                                </button>
                                                <input type="number" name="vertical-axis-min" min="-10000" class="form-control input-sm input-number" data-placement="top" title="" data-content="content"
                                                       id="vertical-axis-min">
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="vertical-axis-min">
                                                    <i class="wpdt-icon-plus-full"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div id="vertical-axis-max-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Vertical axis max value', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The maximum value of the axis.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div class="wdt-custom-number-input">
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="vertical-axis-max">
                                                    <i class="wpdt-icon-minus"></i>
                                                </button>
                                                <input type="number" name="vertical-axis-max" min="-10000" class="form-control input-sm input-number" data-placement="top" title="" data-content="content"
                                                       id="vertical-axis-max">
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="vertical-axis-max">
                                                    <i class="wpdt-icon-plus-full"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="google" id="inverted-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Invert', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Whether to invert the axes so that the x axis is vertical and y axis is horizontal', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch p-b-16" data-ts-color="blue">
                                <input id="inverted" type="checkbox">
                                <label for="inverted"><?php esc_html_e('Invert chart axes', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="chart-container-tabs-4"
                     class="col-sm-9 col-md-9 col-lg-8 chart-container chart-options-container tab-pane">
                    <div class="inside">
                        <div id="show-chart-title-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Chart title', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Do you want to show the chart title on the page', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="show-chart-title" type="checkbox" checked>
                                <label for="show-chart-title"><?php _e('Show title', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                        <div class="google"  id="title-floating-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Title floating', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('When the title is floating, the plot area will not move to make space for it', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="title-floating" type="checkbox">
                                <label for="title-floating"><?php _e('Enable floating', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                        <div class="chartjs">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Title position', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Position of the title. Possible values are \'top\', \'left\', \'bottom\' and \'right\'', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="selectpicker" name="title-position" id="title-position">
                                            <option selected="selected" value="top">Top</option>
                                            <option value="left">Left</option>
                                            <option value="bottom">Bottom</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chartjs" id="title-font-name-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Title font name', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The default font face for text in the title.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <input type="text" name="title-font-name" id="title-font-name" value="Arial"
                                                   class="form-control input-sm"/>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chartjs" id="title-font-style-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Title font style', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The default font style for text in the title', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="selectpicker" name="title-font-style" id="title-font-style">
                                            <option selected="selected" value="normal">Normal</option>
                                            <option value="italic">Italic</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chartjs" id="title-font-weight-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Title font weight', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The default font weight for text in the title', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="selectpicker" name="title-font-weight" id="title-font-weight">
                                            <option value="normal">Normal</option>
                                            <option selected="selected" value="bold">Bold</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chartjs" id="title-font-color-container">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Title font color', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The default font color for text in the title.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="title-font-color" value=""
                                                   class="form-control cp-value wdt-add-picker"/>
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="chart-container-tabs-5"
                     class="col-sm-9 col-md-9 col-lg-8 chart-container chart-options-container tab-pane">
                    <div class="inside">
                        <div id="tooltip-enabled-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Tooltip', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Enable or disable the tooltip', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="tooltip-enabled" type="checkbox" checked="checked">
                                <label for="tooltip-enabled"><?php _e('Show tooltip', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                        <div class="chartjs" id="tooltip-background-color-container">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Background color', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The background color for the tooltip.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="tooltip-background-color" value=""
                                                   class="form-control cp-value wdt-add-picker tooltip-background-color"/>
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chartjs">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Border radius', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The radius of the rounded border corners.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div class="wdt-custom-number-input">
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="tooltip-border-radius">
                                                    <i class="wpdt-icon-minus"></i>
                                                </button>
                                                <input type="number" name="tooltip-border-radius" min="0" class="form-control input-sm input-number"
                                                       id="tooltip-border-radius" value="3">
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="tooltip-border-radius">
                                                    <i class="wpdt-icon-plus-full"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chartjs">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Shared tooltip', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('When the tooltip is shared, the entire plot area will capture mouse movement or touch events', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch p-b-16" data-ts-color="blue">
                                <input id="tooltip-shared" type="checkbox">
                                <label for="tooltip-shared"><?php _e('Share tooltip', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div id="chart-container-tabs-6"
                     class="col-sm-9 col-md-9 col-lg-8 chart-container chart-options-container tab-pane">
                    <div class="inside">
                        <div class="chartjs">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Legend', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Enable or disable the legend', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch p-b-16" data-ts-color="blue">
                                <input id="show-legend" type="checkbox" checked="checked">
                                <label for="show-legend"><?php _e('Show legend', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                        <div class="google" id="legend-position-row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Position', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Position of the legend', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="selectpicker" name="legend_position" id="legend_position">
                                            <option value="right">Right</option>
                                            <option selected="selected" value="bottom">Bottom</option>
                                            <option value="top">Top</option>
                                            <option value="in">In</option>
                                            <option value="none">None</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="chartjs" id="legend_position_row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Legend position', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Position of the legend. Possible values are \'top\', \'left\', \'bottom\' and \'right\'', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="selectpicker" name="legend-position-cjs"
                                                id="legend-position-cjs">
                                            <option selected="selected" value="">Nothing selected</option>
                                            <option value="top">Top</option>
                                            <option value="left">Left</option>
                                            <option value="bottom">Bottom</option>
                                            <option value="right">Right</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="google"  id="legend_vertical_align_row">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Vertical align', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The vertical alignment of the legend box', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="selectpicker" name="legend_vertical_align"
                                                id="legend_vertical_align">
                                            <option selected="selected" value="bottom">Bottom</option>
                                            <option value="middle">Middle</option>
                                            <option value="top">Top</option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    </div>

    <div class="col-sm-7 col-md-7 col-lg-7">
        <div class="chart-preview-container">
            <div id="google-chart-container"></div>
            <div id="chart-js-container">
                <canvas id="chart-js-canvas" aria-label="Chartjs canvas" role="img"></canvas>
            </div>
        </div>
    </div>

</div>
