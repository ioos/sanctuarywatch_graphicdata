<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<?php
/**
 * User: Miljko Milosevic
 * Date: 1/20/17
 * Time: 1:08 PM
 */
?>

<div role="tabpanel" class="tab-pane active" id="main-plugin-settings">
    <div class="row">
        <div class="col-sm-4 interface-language">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Interface language', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Pick the language which will be used in tables interface.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="select">
                        <select class="selectpicker" id="wdt-interface-language">
                            <option value=""><?php esc_html_e('English (default)', 'wpdatatables'); ?></option>
                            <?php foreach (WDTSettingsController::getInterfaceLanguages() as $language) : ?>
                                <option value="<?php echo esc_attr($language['file']) ?>">
                                    <?php echo esc_html($language['name']); ?>
                                </option>
                            <?php endforeach; ?>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-4 date-format">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Date format', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Pick the date format to use in date column type.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="select">
                        <select class="selectpicker" name="wdt-date-format" id="wdt-date-format">
                            <option value="d/m/Y"> 15/07/2005 (d/m/Y)</option>
                            <option value="m/d/Y"> 07/15/2005 (m/d/Y)</option>
                            <option value="Y/m/d"> 2005/15/07 (Y/m/d)</option>
                            <option value="d.m.Y"> 15.07.2005 (d.m.Y)</option>
                            <option value="m.d.Y"> 07.15.2005 (m.d.Y)</option>
                            <option value="d-m-Y"> 15-07-2005 (d-m-Y)</option>
                            <option value="m-d-Y"> 07-15-2005 (m-d-Y)</option>
                            <option value="Y-m-d"> 2005-07-15 (Y-m-d)</option>
                            <option value="d.m.y"> 15.07.05 (d.m.y)</option>
                            <option value="m.d.y"> 07.15.05 (m.d.y)</option>
                            <option value="Y.m.d"> 2005.07.15 (Y.m.d)</option>
                            <option value="d-m-y"> 15-07-05 (d-m-y)</option>
                            <option value="m-d-y"> 07-15-05 (m-d-y)</option>
                            <option value="d M Y"> 15 Jul 2005 (d F Y)</option>
                            <option value="d.m">15.07 (d.m)</option>
                            <option value="m/Y"> 07/2005 (m/Y)</option>
                            <option value="M Y"> Jul 2005 (Mon Y)</option>
                            <option value="F Y"> July 2005 (F Y)</option>
                            <option value="F j, Y"> July 15, 2005 (F j, Y)</option>
                            <option value="j. F Y."> 15. July 2005. (j. F Y.)</option>
                            <option value="Y">2005 (Y)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-4 time-format">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Time format', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Pick the time format to use in datetime and time column type.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="select">
                        <select class="selectpicker" name="wdt-time-format" id="wdt-time-format">
                            <option value="h:i A">1:25 PM (12h)</option>
                            <option value="H:i">13:25 (24h)</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-4 wdt-parse-shortcodes">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Parse shortcodes', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('If the option is enabled, you can use shortcodes of other plugins for generating content.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="toggle-switch" data-ts-color="blue">
                <input type="checkbox" name="wdt-parse-shortcodes" id="wdt-parse-shortcodes"/>
                <label for="wdt-parse-shortcodes" class="ts-label"> <?php esc_html_e('Parse shortcodes in strings', 'wpdatatables'); ?></label>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-4 base-skin">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Base skin', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Choose the base skin for the plugin.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="select">
                        <select class="selectpicker" name="wdt-base-skin" id="wdt-base-skin">
                            <option value="skin0"><?php esc_html_e('Material', 'wpdatatables'); ?></option>
                            <option value="skin1"><?php esc_html_e('Light', 'wpdatatables'); ?></option>
                            <option value="skin2"><?php esc_html_e('Graphite', 'wpdatatables'); ?></option>
                            <option value="aqua"><?php esc_html_e('Aqua', 'wpdatatables'); ?></option>
                            <option value="purple"><?php esc_html_e('Purple', 'wpdatatables'); ?></option>
                            <option value="dark"><?php esc_html_e('Dark', 'wpdatatables'); ?></option>
                            <option value="mojito"><?php esc_html_e('Mojito', 'wpdatatables'); ?></option>
                            <option value="raspberry-cream"><?php esc_html_e('Raspberry Cream', 'wpdatatables'); ?></option>
                            <option value="dark-mojito"><?php esc_html_e('Dark Mojito', 'wpdatatables'); ?></option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-4 number-format">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Number format', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Pick the number format (thousands and decimals separator)', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="select">
                        <select class="selectpicker" id="wdt-number-format">
                            <option value="1">15.000,00</option>
                            <option value="2">15,000.00</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-4 filter-position">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Render advanced filter', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Choose where you would like to render the advanced filter for tables where enabled.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="select">
                        <select class="selectpicker" id="wp-render-filter" data-toggle="html-premium-popover" data-placement="top" title="title" data-content="content">
                            <option value="header" data-content="<i class='wpdt-icon-star-full m-r-5' style='color: #FFC078;'></i> <span class='opacity-6'><?php esc_html_e('In the header', 'wpdatatables'); ?></span>"></option>
                            <option value="footer" data-content="<i class='wpdt-icon-star-full m-r-5' style='color: #FFC078;'></i> <span class='opacity-6'><?php esc_html_e('In the footer', 'wpdatatables'); ?></span>"></option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-4 decimal-places">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Decimal places', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Define the amount of decimal places for the float numbers.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="fg-line wdt-custom-number-input">
                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="wdt-decimal-places">
                                    <i class="wpdt-icon-minus"></i>
                                </button>
                                <input type="number" name="wdt-decimal-places" min="1" value="" class="form-control input-sm input-number" data-name="wdtDecimalPlaces"
                                       id="wdt-decimal-places">
                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="wdt-decimal-places">
                                    <i class="wpdt-icon-plus-full"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-4 csv-delimiter">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('CSV delimiter', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Pick the CSV delimiter', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="select">
                        <select class="selectpicker" id="wdt-csv-delimiter">
                            <option value=""></option>
                            <option value=",">,</option>
                            <option value=":">:</option>
                            <option value=";">;</option>
                            <option value="|">|</option>
                            <option value="\t">TAB</option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-4 sorting-browse-tables">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Tables sorting direction in admin page', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Here you can set sorting direction by id for browse tables and charts. By default is ascending order.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="select">
                        <select class="selectpicker" id="wdt-sorting-order-browse-tables">
                            <option value="ASC"> <?php esc_html_e('Ascending', 'wpdatatables'); ?></option>
                            <option value="DESC"> <?php esc_html_e('Descending', 'wpdatatables'); ?></option>
                        </select>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-4 tablet-width">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Tablet width', 'wpdatatables'); ?>
                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Here you can specify width of the screen (in pixels) that will be treated as a tablet. You can set it wider if you want responsive effect on desktops.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="fg-line wdt-custom-number-input">
                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="wdt-tablet-width">
                                    <i class="wpdt-icon-minus"></i>
                                </button>
                                <input type="number" name="wdt-tablet-width" placeholder="Set tablet width in px" min="0" value="" class="form-control input-sm input-number" id="wdt-tablet-width">
                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="wdt-tablet-width">
                                    <i class="wpdt-icon-plus-full"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-4 mobile-width">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Mobile width', 'wpdatatables'); ?>
                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Here you can specify width (in pixels) will be treated as a mobile..', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="row">
                        <div class="col-sm-12">
                            <div class="fg-line wdt-custom-number-input">
                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus" data-field="wdt-mobile-width">
                                    <i class="wpdt-icon-minus"></i>
                                </button>
                                <input type="number" name="wdt-mobile-width" placeholder="Set mobile width in px" min="0" value="" class="form-control input-sm input-number" id="wdt-mobile-width">
                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus" data-field="wdt-mobile-width">
                                    <i class="wpdt-icon-plus-full"></i>
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-4 tables-on-browse">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Tables per admin page', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('How many tables to show in the browse page.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="select">
                        <select class="selectpicker" id="wdt-tables-per-page">
                            <?php for ($i = 10; $i <= 50; $i += 10) { ?>
                                <option value="<?php echo $i ?>"><?php echo $i ?></option>
                            <?php } ?>
                        </select>
                    </div>
                </div>
            </div>
        </div>
        <div class="col-sm-4 align-numbers">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Align numbers', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('How Integer and Float column types will be aligned in the cell', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="toggle-switch" data-ts-color="blue">
                <input type="checkbox" name="wdt-numbers-align" id="wdt-numbers-align" checked="checked"/>
                <label for="wdt-numbers-align" class="ts-label"> <?php esc_html_e('Align numbers to the right', 'wpdatatables'); ?></label>
            </div>
        </div>
    </div>
    <!-- SUM and AVG label settings -->
    <div class="row">

        <div class="col-sm-4 wdt-sum-function-label-block">
            <h4 class="c-title-color m-b-2">
                <i class="wpdt-icon-star-full" style="color: #FFC078;"></i>
                <span class="opacity-6" ><?php esc_html_e('Sum functions label', 'wpdatatables'); ?></span>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Enter a label that will be used for Sum functions. If you leave it blank default label will be Σ =', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="row">
                        <div class="col-sm-12">
                            <input type="text" name="wdt-sum-function-label" id="wdt-sum-function-label"
                                   class="form-control input-sm" disabled placeholder="Enter the default SUM functions label"
                                   value="" data-toggle="html-input-premium-popover" data-placement="top" title="" data-content="content"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-sm-4 wdt-avg-function-label-block">
            <h4 class="c-title-color m-b-2">
                <i class="wpdt-icon-star-full" style="color: #FFC078;"></i>
                <span class="opacity-6" ><?php esc_html_e('Average functions label', 'wpdatatables'); ?></span>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Enter a label that will be used for Average functions. If you leave it blank default label will be Avg =', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="row">
                        <div class="col-sm-12">
                            <input type="text" name="wdt-avg-function-label" id="wdt-avg-function-label"
                                   class="form-control input-sm" disabled placeholder="Enter the default AVG functions label"
                                   value="" data-toggle="html-input-premium-popover" data-placement="top" title="" data-content="content"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>
    <!-- /.row -->
    <!-- MIN and MAX label settings -->
    <div class="row">

        <div class="col-sm-4 wdt-min-function-label-block">
            <h4 class="c-title-color m-b-2">
                <i class="wpdt-icon-star-full" style="color: #FFC078;"></i>
                <span class="opacity-6" ><?php esc_html_e('Minimum functions label', 'wpdatatables'); ?></span>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Enter a label that will be used for Minimum functions. If you leave it blank default label will be Min =', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="row">
                        <div class="col-sm-12">
                            <input type="text" name="wdt-min-function-label" id="wdt-min-function-label"
                                   class="form-control input-sm" disabled placeholder="Enter the default MIN functions label"
                                   value="" data-toggle="html-input-premium-popover" data-placement="top" title="" data-content="content"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="col-sm-4 wdt-max-function-label-block">
            <h4 class="c-title-color m-b-2">
                <i class="wpdt-icon-star-full" style="color: #FFC078;"></i>
                <span class="opacity-6" ><?php esc_html_e('Maximum functions label', 'wpdatatables'); ?></span>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Enter a label that will be used for Maximum functions. If you leave it blank default label will be Max =', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <div class="row">
                        <div class="col-sm-12">
                            <input type="text" name="wdt-max-function-label" id="wdt-max-function-label"
                                   class="form-control input-sm" disabled placeholder="Enter the default MAX functions label"
                                   value="" data-toggle="html-input-premium-popover" data-placement="top" title="" data-content="content"/>
                        </div>
                    </div>
                </div>
            </div>
        </div>

    </div>

    <!-- /.row -->
    <div class="row">

    </div>
    <!-- /.row -->
    <!-- Include bootstrap on front and back settings -->
    <div class="row">
        <div class="col-sm-4 wdt-include-bootstrap-block">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Include full bootstrap front-end', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('It is recommended to uncheck this option if bootstrap.js is already included in one of the theme files. Unchecked option means that there is still bootstrap.js included just in noconflict mode which should prevent errors.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="toggle-switch" data-ts-color="blue">
                <input type="checkbox" name="wdt-include-bootstrap" id="wdt-include-bootstrap"/>
                <label for="wdt-include-bootstrap" class="ts-label"><?php esc_html_e('Include full bootstrap.js on the front-end', 'wpdatatables');?></label>
            </div>
        </div>
        <div class="col-sm-4 wdt-include-bootstrap-back-end-block">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Include full bootstrap back-end', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('It is recommended to uncheck this option if bootstrap.js is already included in one of the theme files. Unchecked option means that there is still bootstrap.js included just in noconflict mode which should prevent errors.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="toggle-switch" data-ts-color="blue">
                <input type="checkbox" name="wdt-include-bootstrap-back-end" id="wdt-include-bootstrap-back-end"/>
                <label for="wdt-include-bootstrap-back-end" class="ts-label"><?php esc_html_e('Include full bootstrap.js on the back-end', 'wpdatatables');?></label>
            </div>
        </div>
    </div>

    <div class="row">
        <div class="col-sm-4 wdt-site-link-block">
            <h4 class="c-title-color m-b-2">
    <?php esc_html_e('Show plugin credentials below tables', 'wpdatatables'); ?>
    <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('If you want to support our project, please, keep this checkbox as checked', 'wpdatatables');?>"></i>
            </h4>
            <div class="toggle-switch" data-ts-color="blue">
                <input type="checkbox" name="wdt-site-link" id="wdt-site-link" checked="checked"/>
                <label for="wdt-site-link" class="ts-label"><?php esc_html_e('Show plugin credentials below tables', 'wpdatatables');?></label>
            </div>
        </div>
        <div class="col-sm-4 wdt-prevent-deleting-tables-block">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Prevent deleting tables in database', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('It is recommended to leave this option as checked if you what to keep your tables in database after deleting plugin from Plugins page. If you uncheck this option, it will be deleted all tables in database after deleting plugin', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="toggle-switch" data-ts-color="blue">
                <input type="checkbox" name="wdt-prevent-deleting-tables" id="wdt-prevent-deleting-tables"/>
                <label for="wdt-prevent-deleting-tables" class="ts-label"><?php esc_html_e('Prevent deleting tables in database after deleting plugin from Plugins page', 'wpdatatables');?></label>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-4 wdt-getting-started-page-status-block">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Remove Getting Started page', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Check this option if you want to remove Getting Started page from admin menu.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="toggle-switch" data-ts-color="blue">
                <input type="checkbox" name="wdt-getting-started-page-status" id="wdt-getting-started-page-status"/>
                <label for="wdt-getting-started-page-status" class="ts-label"><?php esc_html_e('Remove "Getting Started" page from admin menu.', 'wpdatatables'); ?></label>
            </div>
        </div>
        <div class= "col-sm-4 wdt-global-loder">
                <h4 class="c-title-color m-b-2">
                    <i class="wpdt-icon-star-full" style="color: #FFC078;"></i>
                    <span class="opacity-6" ><?php esc_html_e('Loader visibility', 'wpdatatables'); ?></span>
                    <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                       title="<?php esc_attr_e('Enable this option to display a loader for all tables while they are loading.', 'wpdatatables'); ?>"></i>
                </h4>
                <div class="toggle-switch opacity-5" data-ts-color="blue">
                    <input type="checkbox" name="wdt-global-table-loader" id="wdt-global-table-loader" disabled checked="checked"/>
                    <label for="wdt-global-table-loader"
                           class="ts-label"><?php esc_html_e('Enable table loaders', 'wpdatatables'); ?></label>
                </div>
        </div>
    </div>
</div>
