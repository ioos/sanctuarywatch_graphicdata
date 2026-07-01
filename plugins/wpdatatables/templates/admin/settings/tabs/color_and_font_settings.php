<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<?php
/**
 * User: Miljko Milosevic
 * Date: 1/20/17
 * Time: 1:29 PM
 */
?>

<div role="tabpanel" class="tab-pane" id="color-and-font-settings">
    <div class="row">
        <div class="panel-group col-sm-12" role="tablist" aria-multiselectable="true">
            <div class="panel panel-collapse">
                <div class="panel-heading active" role="tab" id="heading-one">
                    <h4 class="panel-title">
                        <a data-toggle="collapse" data-parent="#accordion" href="#collapse-one" aria-expanded="true"
                           aria-controls="collapse-one"> <?php esc_html_e('Font', 'wpdatatables'); ?></a>
                    </h4>
                </div>
                <div id="collapse-one" class="collapse in" role="tabpanel" aria-labelledby="heading-one">
                    <div class="panel-body">
                        <div class="col-sm-4">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Font', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This font will be used in rendered tables. Leave blank not to override default theme settings', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select id="wdt-table-font" data-name="wdtTableFont" class="selectpicker"
                                                title="Choose font for the table">
                                            <option value=""></option>
                                            <?php foreach (WDTSettingsController::wdtGetSystemFonts() as $font) { ?>
                                                <option value="<?php echo esc_attr($font) ?>"><?php echo esc_html($font) ?></option>
                                            <?php } ?>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Font size', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Define the font size', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div class="fg-line wdt-custom-number-input">
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus"  data-type="minus" data-field="wdt-font-size">
                                                    <i class="wpdt-icon-minus"></i>
                                                </button>
                                                <input type="number" name="wdt-font-size" min="1" value="" class="form-control input-sm input-number" data-name="wdtFontSize"
                                                       id="wdt-font-size" >
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus"  data-type="plus" data-field="wdt-font-size">
                                                    <i class="wpdt-icon-plus-full"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-4">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Font color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for the main font in table cells.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp" class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-table-font-color" data-name="wdtTableFontColor"
                                                   class="form-control cp-value wdt-add-picker" value="" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="panel-group col-sm-12" role="tablist" aria-multiselectable="true">
            <div class="panel panel-collapse">
                <div class="panel-heading" role="tab" id="heading-two">
                    <h4 class="panel-title">
                        <a data-toggle="collapse" data-parent="#accordion" href="#collapse-two" aria-expanded="true"
                           aria-controls="collapse-two"> <?php esc_html_e('Header', 'wpdatatables'); ?></a>
                    </h4>
                </div>
                <div id="collapse-two" class="collapse" role="tabpanel" aria-labelledby="heading-two">
                    <div class="panel-body">
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Background color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The color is used for background of the table header.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-header-base-color" data-name="wdtHeaderBaseColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Border color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for the border in the table header.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-header-border-color"
                                                   data-name="wdtHeaderBorderColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Font color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for the font in the table header.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-header-font-color" data-name="wdtHeaderFontColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Active and hover color	', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used when you hover the mouse above the table header, or when you choose a column.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-header-active-color"
                                                   data-name="wdtHeaderActiveColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="panel-group col-sm-12" role="tablist" aria-multiselectable="true">
            <div class="panel panel-collapse">
                <div class="panel-heading" role="tab" id="heading-three">
                    <h4 class="panel-title">
                        <a data-toggle="collapse" data-parent="#accordion" href="#collapse-three" aria-expanded="false"
                           aria-controls="collapse-three" class="collapsed"><?php esc_html_e('Table border ', 'wpdatatables'); ?></a>
                    </h4>
                </div>
                <div id="collapse-three" class="collapse" role="tabpanel" aria-labelledby="heading-three">
                    <div class="panel-body">
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Inner border', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for the inner border in the table between cells.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-table-inner-border-color"
                                                   data-name="wdtTableInnerBorderColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Outer border', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for the outer border of the whole table body.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-table-outer-border-color"
                                                   data-name="wdtTableOuterBorderColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3 wdt-remove-borders">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Table borders', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('When this is checked, borders in table will be removed ', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="toggle-switch" data-ts-color="blue">
                                <input type="checkbox" name="wdt-remove-borders" id="wdt-remove-borders"/>
                                <label for="wdt-remove-borders" class="ts-label"><?php esc_html_e('Remove borders in table', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                        <div class="col-sm-3 wdt-remove-borders-header">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Header border', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('When this is checked,borders in header will be removed  ', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="toggle-switch" data-ts-color="blue">
                                <input type="checkbox" name="wdt-remove-borders-header" id="wdt-remove-borders-header"/>
                                <label for="wdt-remove-borders-header" class="ts-label"><?php esc_html_e('Remove borders in header', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="panel-group col-sm-12" role="tablist" aria-multiselectable="true">
            <div class="panel panel-collapse">
                <div class="panel-heading" role="tab" id="heading-four">
                    <h4 class="panel-title">
                        <a data-toggle="collapse" data-parent="#accordion" href="#collapse-four" aria-expanded="false"
                           aria-controls="collapse-four" class="collapsed"><?php esc_html_e('Row color', 'wpdatatables'); ?></a>
                    </h4>
                </div>
                <div id="collapse-four" class="collapse" role="tabpanel" aria-labelledby="heading-four">
                    <div class="panel-body">
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Even row background', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for for background in even rows.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-even-row-color" data-name="wdtEvenRowColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Odd row background', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for for background in odd rows.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-odd-row-color" data-name="wdtOddRowColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Hover row', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for to highlight the row when you hover your mouse above it.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-hover-row-color" data-name="wdtHoverRowColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Background for selected rows', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for background in selected rows.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-selected-row-color"
                                                   data-name="wdtSelectedRowColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="panel-group col-sm-12" role="tablist" aria-multiselectable="true">
            <div class="panel panel-collapse">
                <div class="panel-heading" role="tab" id="heading-five">
                    <h4 class="panel-title">
                        <a data-toggle="collapse" data-parent="#accordion" href="#collapse-five" aria-expanded="false"
                           aria-controls="collapse-five" class="collapsed"> <?php esc_html_e('Cell color', 'wpdatatables'); ?></a>
                    </h4>
                </div>
                <div id="collapse-five" class="collapse" role="tabpanel" aria-labelledby="heading-five">
                    <div class="panel-body">
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Sorted columns, even rows', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for background in cells which are in the active columns (columns used for sorting) in even rows.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-active-even-cell-color"
                                                   data-name="wdtActiveEvenCellColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Sorted columns, odd rows', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for background in cells which are in the active columns (columns used for sorting) in odd rows.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-active-odd-cell-color"
                                                   data-name="wdtActiveOddCellColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="panel-group col-sm-12" role="tablist" aria-multiselectable="true">
            <div class="panel panel-collapse">
                <div class="panel-heading" role="tab" id="heading-six">
                    <h4 class="panel-title">
                        <a data-parent="#accordion" href="#collapse-six" aria-expanded="false" data-toggle="html-input-premium-popover" data-placement="top" title="" data-content="content"
                           aria-controls="collapse-six" class="collapsed"> <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><span class="opacity-6" ><?php esc_html_e('Buttons color in modals', 'wpdatatables'); ?></span></a>
                    </h4>
                </div>
                <div id="collapse-six" class="collapse disabled" role="tabpanel" aria-labelledby="heading-six">
                    <div class="panel-body">
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Background color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for background in buttons.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-button-color" data-name="wdtButtonColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Border color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for border in buttons.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-button-border-color"
                                                   data-name="wdtButtonBorderColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Font color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for font in buttons.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-button-font-color" data-name="wdtButtonFontColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Background hover color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color will be used for button backgrounds when you hover above them.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-button-background-hover-color"
                                                   data-name="wdtButtonBackgroundHoverColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Hover font color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color will be used for buttons font when you hover above them.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-button-font-hover-color"
                                                   data-name="wdtButtonFontHoverColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Buttons hover border color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color will be used for button borders when you hover above them.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-button-border-hover-color"
                                                   data-name="wdtButtonBorderHoverColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3 buttons-input-border-radius">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Buttons and inputs border radius (in px)', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This is a border radius for inputs in buttons. Default is 3px.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="row">
                                        <div class="col-sm-12">
                                            <div class="fg-line wdt-custom-number-input">
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus"  data-type="minus" data-field="wdt-border-input-radius">
                                                    <i class="wpdt-icon-minus"></i>
                                                </button>
                                                <input type="number" name="wdt-border-input-radius" min="1" value="" class="form-control input-sm input-number" data-name="wdtBorderRadius"
                                                       id="wdt-border-input-radius" >
                                                <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus"  data-type="plus" data-field="wdt-border-input-radius">
                                                    <i class="wpdt-icon-plus-full"></i>
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="panel-group col-sm-12" role="tablist" aria-multiselectable="true">
            <div class="panel panel-collapse">
                <div class="panel-heading" role="tab" id="heading-seven">
                    <h4 class="panel-title">
                        <a data-parent="#accordion" href="#collapse-seven" aria-expanded="false" data-toggle="html-input-premium-popover" data-placement="top" title="" data-content="content"
                           aria-controls="collapse-seven" class="collapsed"> <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><span class="opacity-6" ><?php esc_html_e('Modals and overlay color', 'wpdatatables'); ?></span></a>
                    </h4>
                </div>
                <div id="collapse-seven" class="collapse disabled" role="tabpanel" aria-labelledby="heading-seven">
                    <div class="panel-body">
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Modals font color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color will be used for wpDataTable popup (filter, datepicker) fonts.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-modal-font-color" data-name="wdtModalFontColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Modals background', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color will be used for wpDataTable popup (filter, datepicker) background.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-modal-background-color"
                                                   data-name="wdtModalBackgroundColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Overlay background', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color will be used for overlay which appears below the plugin popups.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-overlay-color" data-name="wdtOverlayColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="panel-group col-sm-12" role="tablist" aria-multiselectable="true">
            <div class="panel panel-collapse">
                <div class="panel-heading" role="tab" id="heading-eight">
                    <h4 class="panel-title">
                        <a data-toggle="collapse" data-parent="#accordion" href="#collapse-eight" aria-expanded="true"
                           aria-controls="collapse-eight"> <?php esc_html_e('Pagination', 'wpdatatables'); ?></a>
                    </h4>
                </div>
                <div id="collapse-eight" class="collapse" role="tabpanel" aria-labelledby="heading-eight">
                    <div class="panel-body">
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Background color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for the background of the pagination', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-pagination-background-color"
                                                   data-name="wdtPaginationBackgroundColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for the color of the links in the pagination.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-pagination--color"
                                                   data-name="wdtPaginationColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Current page background color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('The color is used for background of the current page', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-pagination-current-background-color" data-name="wdtPaginationCurrentBackgroundColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Current page color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used for the color of the current page.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-pagination-current-color"
                                                   data-name="wdtPaginationCurrentColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Other pages hover background color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This background color is used when you hover the mouse above the other pages', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-pagination-hover-background-color" data-name="wdtPaginationHoverBackgroundColor"
                                                   class="form-control cp-value wdt-add-picker" />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div class="col-sm-3">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Other pages hover color', 'wpdatatables'); ?>
                                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('This color is used when you hover the mouse above the other pages.', 'wpdatatables'); ?>"></i>
                            </h5>
                            <div class="cp-container">
                                <div class="form-group">
                                    <div class="fg-line dropdown">
                                        <div id="cp"
                                             class="input-group wdt-color-picker">
                                            <input type="text" id="wdt-pagination-hover-color"
                                                   data-name="wdtPaginationHoverColor" class="form-control cp-value wdt-add-picker"
                                                   />
                                            <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    </div>
</div>
