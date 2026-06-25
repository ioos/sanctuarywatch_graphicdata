<?php defined('ABSPATH') or die('Access denied.'); ?>

<?php
/**
 * Template for Table Settings widget
 * @author Milan Jovanovic
 *
 */
?>

<div class="card wdt-table-settings wdt-simple-table-settings">


    <!-- Preloader -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
    <!-- /Preloader -->

    <div class="card-header wdt-admin-card-header ch-alt ">
        <img id="wpdt-inline-logo"
             src="<?php echo WDT_ROOT_URL; ?>assets/img/logo.svg"/>
        <h2 class="pull-left">
            <div class="fg-line wdt-table-name">
                <input type="text" class="form-control input-sm" value="New wpDataTable" id="wdt-table-title-edit">
                <i class="wpdt-icon-pen"></i>
            </div>

            <small class="m-t-5 m-l-5"><?php esc_html_e('wpDataTable name, click to edit', 'wpdatatables'); ?></small>
        </h2>
        <button class="btn hidden" id="wdt-table-id">[wpdatatable id=23]
        </button>
        <div class="clear"></div>
        <h2 class="pull-left">
            <div class="wdt-custom-headers-row-rule">
                <textarea class="form-control" value="Insert wpDataTable description" id="wdt-table-description-edit"
                          placeholder="<?php esc_attr_e( 'Insert description of your wpDataTable', 'wpdatatables' ); ?>"></textarea>
            </div>
        </h2>
        <button class="btn hidden" id="wdt-table-id">
        </button>
        <div class="clear"></div>
        <ul id="wdt-tour-actions" class="actions p-t-5">
            <li>
                <button class="btn wdt-collapse-table-settings <?php if (isset($_GET['collapsed'])) { ?>collapsed <?php } else { ?>expanded <?php } ?>">
                    <?php esc_html_e('Settings', 'wpdatatables'); ?>
                    <i style="color: #008CFF;"
                       class="wpdt-icon-angle-<?php if (isset($_GET['collapsed'])) { ?>down <?php } else { ?>up <?php } ?>"></i>
                </button>
            </li>
            <li>
                <button class="btn wdt-backend-close">
                    <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                </button>
            </li>
            <li>
                <button class="btn btn-primary wdt-save-data"
                        title="<?php esc_attr_e('Save Changes', 'wpdatatables'); ?>" data-toggle="tooltip">
                    <i class="wpdt-icon-save m-r-5"></i><?php esc_html_e('Save Changes', 'wpdatatables'); ?>
                </button>
            </li>
        </ul>
    </div>
    <!-- /.card-header -->

    <div class="card-body card-padding" <?php if (isset($_GET['collapsed'])) { ?> style="display: none" <?php } ?>>
        <div role="tabpanel">
            <ul class="tab-nav" role="tablist">
                <li class="active edit-table-settings-tab">
                    <a href="#edit-table-settings" aria-controls="edit-table-settings" role="tab"
                       data-toggle="tab"><?php esc_html_e('Edit Data', 'wpdatatables'); ?></a>
                </li>
                <li class="display-settings-tab">
                    <a href="#display-settings" aria-controls="display-settings" role="tab"
                       data-toggle="tab"><?php esc_html_e('Display', 'wpdatatables'); ?></a>
                </li>
                <li class="responsive-settings-tab">
                    <a href="#responsive-settings" aria-controls="responsive-settings" role="tab"
                       data-toggle="tab"><?php esc_html_e('Responsive', 'wpdatatables'); ?></a>
                </li>

            </ul>
            <!-- /ul .tab-nav -->

            <div class="tab-content">
                <!-- Edit table settings -->
                <div role="tabpanel" class="tab-pane active" id="edit-table-settings">

                    <div class="wpdt-row-flex">

                        <div id="wpdt-cell-action-buttons" class="wpdt-cell-action-buttons">

                            <button class="btn btn-primary btn-icon-text disabled" id="wpdt-undo"
                                    title="<?php esc_html_e('Undo', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-undo2"></i>
                            </button>
                            <button class="btn btn-primary btn-icon-text disabled" id="wpdt-redo"
                                    title="<?php esc_html_e('Redo', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-redo2"></i>
                            </button>
                            <span class="btn-separator"></span>
                            <div id="wpdt-table-action-buttons" class="wpdt-table-action-buttons">
                                <div id="wpdt-column-action-buttons">
                                    <button class="btn btn-primary btn-icon-text" id="wpdt-column-button"
                                            title="<?php esc_attr_e('Manage columns', 'wpdatatables'); ?>"
                                            data-toggle="tooltip">
                                        <i class="wpdt-icon-columns-2"></i>
                                        <?php esc_html_e('Column', 'wpdatatables'); ?>
                                    </button>
                                    <div id="wpdt-column-actions" hidden>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-add-column-left"
                                                title="<?php esc_attr_e('Add column left', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-add-column-left"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-insert-column-before"
                                                title="<?php esc_attr_e('Insert column before selection', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-insert-column-before"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-insert-column-after"
                                                title="<?php esc_attr_e('Insert column after selection', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-insert-column-after"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-add-column-right"
                                                title="<?php esc_attr_e('Add column right', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-add-column-right"></i>
                                        </button>
                                        <button class="btn btn-danger btn-icon-text" id="wpdt-remove-column"
                                                title="<?php esc_attr_e('Remove column/columns', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-remove-column"></i>
                                        </button>
                                    </div>
                                </div>
                                <span class="btn-separator"></span>
                                <div id="wpdt-row-action-buttons">
                                    <button class="btn btn-primary btn-icon-text" id="wpdt-row-button"
                                            title="<?php esc_attr_e('Manage rows', 'wpdatatables'); ?>" data-toggle="tooltip">
                                        <i class="wpdt-icon-rows-1"></i>
                                        <?php esc_attr_e('Row', 'wpdatatables'); ?>
                                    </button>
                                    <div id="wpdt-row-actions" hidden>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-add-top-row"
                                                title="<?php esc_attr_e('Add top row', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-add-row-bottom"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-insert-row-before"
                                                title="<?php esc_attr_e('Insert row before selection', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-insert-row-before"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-insert-row-after"
                                                title="<?php esc_attr_e('Insert row after selection', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-insert-row-after"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-add-bottom-row"
                                                title="<?php esc_attr_e('Add bottom row', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-add-row-top"></i>
                                        </button>
                                        <button class="btn btn-danger btn-icon-text" id="wpdt-remove-row"
                                                title="<?php esc_attr_e('Remove row/rows', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-remove-row"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <span class="btn-separator"></span>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-bold"
                                    title="<?php esc_attr_e('Bold', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-bold"></i>
                            </button>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-italic"
                                    title="<?php esc_attr_e('Italic', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-italic"></i>
                            </button>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-underline"
                                    title="<?php esc_attr_e('Underline', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-underline"></i>
                            </button>
                            <span class="btn-separator"></span>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-text-color"
                                    title="<?php esc_attr_e('Text Color', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-font"></i>
                            </button>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-background-color"
                                    title="<?php esc_attr_e('Background Color', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-tint"></i>
                            </button>
                            <span class="btn-separator"></span>
                            <div id="wpdt-expand-buttons">
                                <div id="wpdt-expand-align-buttons">
                                    <button class="btn btn-primary btn-icon-text" data-after="\\f036"
                                            id="wpdt-align-button"
                                            title="<?php esc_attr_e('Horizontal align', 'wpdatatables'); ?>"
                                            data-toggle="tooltip">
                                        <i class="wpdt-icon-align-left"></i>
                                        <i class="wpdt-icon-sort-down"></i>
                                    </button>
                                    <div id="wpdt-align-buttons" hidden>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-align-left"
                                                title="<?php esc_attr_e('Align Left', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-align-left"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-align-center"
                                                title="<?php esc_attr_e('Align Center', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-align-center"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-align-right"
                                                title="<?php esc_attr_e('Align Right', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-align-right"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-align-justify"
                                                title="<?php esc_attr_e('Align Justify', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-align-justify"></i>
                                        </button>
                                    </div>
                                </div>
                                <div id="wpdt-expand-valign-buttons">
                                    <button class="btn btn-primary btn-icon-text" id="wpdt-valign-button"
                                            title="<?php esc_attr_e('Vertical align', 'wpdatatables'); ?>"
                                            data-toggle="tooltip">
                                        <i class="wpdt-icon-vertical-align-center"></i>
                                        <i class="wpdt-icon-sort-down"></i>
                                    </button>
                                    <div id="wpdt-valign-buttons" hidden>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-valign-middle"
                                                title="<?php esc_attr_e('Vertical Align Middle', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-vertical-align-center"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-valign-top"
                                                title="<?php esc_attr_e('Vertical Align Top', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-vertical-align-top"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-valign-bottom"
                                                title="<?php esc_attr_e('Vertical Align Bottom', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-vertical-align-bottom"></i>
                                        </button>
                                    </div>
                                </div>
                                <div id="wpdt-expand-wrap-buttons">
                                    <button class="btn btn-primary btn-icon-text" id="wpdt-wrap-button"
                                            title="<?php esc_attr_e('Text wrapping', 'wpdatatables'); ?>"
                                            data-toggle="tooltip">
                                        <i class="wpdt-icon-wrap-text"></i>
                                        <i class="wpdt-icon-sort-down"></i>
                                    </button>
                                    <div id="wpdt-wrap-buttons" hidden>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-wrap-text"
                                                title="<?php esc_attr_e('Wrap', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-wrap-text"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-overflow-text"
                                                title="<?php esc_attr_e('Overflow', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-overflow-text"></i>
                                        </button>
                                        <button class="btn btn-primary btn-icon-text" id="wpdt-clip-text"
                                                title="<?php esc_attr_e('Clip', 'wpdatatables'); ?>"
                                                data-toggle="tooltip">
                                            <i class="wpdt-icon-clip-text"></i>
                                        </button>
                                    </div>
                                </div>
                            </div>
                            <span class="btn-separator"></span>
                            <select id="wpdt-font-family" data-toggle="tooltip"
                                    data-wpdt-fonts='<?php echo htmlspecialchars(json_encode(WDTSettingsController::wdtGetSystemFonts(), JSON_FORCE_OBJECT), ENT_QUOTES, 'UTF-8'); ?>'
                                    title="<?php esc_attr_e('Choose font family for the cell ot cells range', 'wpdatatables'); ?>">
                                <option value="0"><?php esc_html_e('Default font', 'wpdatatables'); ?></option>
                                <?php foreach (WDTSettingsController::wdtGetSystemFonts() as $fontIndex => $fontName) { ?>
                                    <option value="<?php echo esc_attr($fontIndex + 1) ?>"><?php echo esc_html($fontName) ?></option>
                                <?php } ?>
                            </select>
                            <select id="wpdt-font-size" data-toggle="tooltip"
                                    title="<?php esc_attr_e('Choose font size for the cell ot cells range', 'wpdatatables'); ?>">
                                <option value="0"></option>
                                <?php for ($fontSizeValue = 6; $fontSizeValue < 51; $fontSizeValue++) { ?>
                                    <option value="<?php echo esc_attr($fontSizeValue) ?>" <?php if ($fontSizeValue == 13) echo 'selected' ?>><?php echo esc_html($fontSizeValue) ?></option>
                                <?php } ?>
                            </select>
                            <span class="btn-separator"></span>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-link"
                                    title="<?php esc_attr_e('Link', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-link"></i>
                            </button>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-media"
                                    title="<?php esc_attr_e('Insert Media', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-image"></i>
                            </button>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-html"
                                    title="<?php esc_attr_e('Insert HTML', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-code"></i>
                            </button>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-do-shortcode"
                                    title="<?php esc_attr_e('Insert shortcode', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-brackets1"></i>
                            </button>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-star-rating"
                                    title="<?php esc_attr_e('Insert star rating', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-star-full"></i>
                            </button>
                            <button class="btn btn-primary btn-icon-text" id="wpdt-clear"
                                    title="<?php esc_attr_e('Clear data', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-icon-close"></i>
                            </button>
                            <span class="btn-separator"></span>
                            <button class="btn btn-primary btn-icon-text disabled" id="wpdt-merge"
                                    title="<?php esc_attr_e('Merge cells', 'wpdatatables'); ?>" data-toggle="tooltip">
                                <i class="wpdt-icon-expand-arrows-alt"></i>
                            </button>
                        </div>
                        <!--/Cell action buttons -->

                    </div>
                    <!-- .wpDataTableContainerConfigSimpleTable -->
                    <div class="wpdt-c row wpDataTableContainerConfigSimpleTable wpDataTables wpDataTablesWrapper">
                        <?php if (isset($tableData)) {
                            echo '<div id="wpdt-table-editor" class="hot" data-wpdt-id="' . esc_attr($tableData->table->id) . '" data-col="' . esc_attr($tableData->table->content->colNumber) . '" data-row="' . esc_attr($tableData->table->content->rowNumber) . '"></div>';
                        } ?>

                    </div>
                    <!-- /.wpDataTableContainerConfigSimpleTable -->

                </div>
                <!-- /Edit table settings -->

                <!-- Table display settings -->
                <div role="tabpanel" class="tab-pane fade" id="display-settings">

                    <div class="row">
                        <div class="col-sm-4 m-b-16">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Table title', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-popover-content="#table-title-hint"
                                   data-toggle="html-popover" data-trigger="hover" data-placement="right"></i>
                            </h4>

                            <!-- Hidden popover with image hint -->
                            <div class="hidden" id="table-title-hint">
                                <div class="popover-heading">
                                    <?php esc_html_e('Show table title', 'wpdatatables'); ?>
                                </div>

                                <div class="popover-body">
                                    <?php esc_html_e('Enable this to show the table title in a h3 block above the table, disable to hide.', 'wpdatatables'); ?>
                                </div>
                            </div>
                            <!-- /Hidden popover with image hint -->

                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-show-title" type="checkbox" checked="checked">
                                <label for="wdt-show-title"
                                       class="ts-label"><?php esc_html_e( 'Show table title on the page', 'wpdatatables' ); ?></label>
                            </div>

                        </div>
                        <div class="col-sm-4 m-b-16">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e( 'Table description', 'wpdatatables' ); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-popover-content="#table-description-hint"
                                   data-toggle="html-popover" data-trigger="hover" data-placement="right"></i>
                            </h4>

                            <!-- Hidden popover with image hint -->
                            <div class="hidden" id="table-description-hint">
                                <div class="popover-heading">
                                    <?php esc_html_e( 'Show table description', 'wpdatatables' ); ?>
                                </div>

                                <div class="popover-body">
                                    <?php esc_html_e( 'Enable this to show the table description, disable to hide.', 'wpdatatables' ); ?>
                                </div>
                            </div>

                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-show-description" type="checkbox">
                                <label for="wdt-show-description"
                                       class="ts-label"><?php esc_html_e( 'Show table description on the page', 'wpdatatables' ); ?></label>
                            </div>

                        </div>
                        <div class="col-sm-4 m-b-16 simple-header-block">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Header', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-popover-content="#simple-header-hint"
                                   data-toggle="html-popover" data-trigger="hover" data-placement="right"></i>
                            </h4>

                            <!-- Hidden popover with image hint -->
                            <div class="hidden" id="simple-header-hint">
                                <div class="popover-heading">
                                    <?php esc_html_e('Set Header', 'wpdatatables'); ?>
                                </div>

                                <div class="popover-body">
                                    <?php esc_html_e('Enable this to set first row of the table as header.', 'wpdatatables'); ?>
                                </div>
                            </div>
                            <!-- /Hidden popover with image hint -->

                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-simple-header" type="checkbox">
                                <label for="wdt-simple-header"
                                       class="ts-label"><?php esc_html_e('Use first row as table header', 'wpdatatables'); ?></label>
                            </div>

                        </div>
                        <div class="col-sm-4 m-b-16 stripe-table-block">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Stripe table', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-popover-content="#stripe-table-hint"
                                   data-toggle="html-popover" data-trigger="hover" data-placement="right"></i>
                            </h4>

                            <!-- Hidden popover with image hint -->
                            <div class="hidden" id="stripe-table-hint">
                                <div class="popover-heading">
                                    <?php esc_html_e('Set Stripe table', 'wpdatatables'); ?>
                                </div>

                                <div class="popover-body">
                                    <?php esc_html_e('Enable this to set odds and even classes in table', 'wpdatatables'); ?>
                                </div>
                            </div>
                            <!-- /Hidden popover with image hint -->

                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-stripe-table" type="checkbox">
                                <label for="wdt-stripe-table"
                                       class="ts-label"><?php esc_html_e('Set odds and even classes in table', 'wpdatatables'); ?></label>
                            </div>

                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4 cell-padding-block">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Cell padding (in px)', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Here you can provide number of the padding size for cell in table without inserting px.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line wdt-custom-number-input">
                                    <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus"
                                            data-type="minus" data-field="wdt-cell-padding">
                                        <i class="wpdt-icon-minus"></i>
                                    </button>
                                    <input type="number" name="wdt-cell-padding" min="0" value="10"
                                           max="40" class="form-control input-sm input-number"
                                           id="wdt-cell-padding">
                                    <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus"
                                            data-type="plus" data-field="wdt-cell-padding">
                                        <i class="wpdt-icon-plus-full"></i>
                                    </button>
                                </div>
                            </div>

                        </div>
                        <div class="col-sm-4 remove-borders-block">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Remove borders', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Remove the table borders', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-remove-borders" type="checkbox">
                                <label for="wdt-remove-borders"
                                       class="ts-label"><?php esc_html_e('Remove borders', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                        <div class="col-sm-4 border-collapse-block">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Border collapse', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Whether table borders should collapse into a single border or be separated as in standard HTML.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <label for="wdt-border-collapse"></label><select class="selectpicker" id="wdt-border-collapse">
                                            <option value="collapse" selected><?php esc_html_e('Collapse', 'wpdatatables'); ?></option>
                                            <option value="separate"><?php esc_html_e('Separate', 'wpdatatables'); ?></option>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4 border-spacing-block">
                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Border spacing (in px)', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Here you can provide the number of pixels for the table border spacing.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line wdt-custom-number-input">
                                    <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus"
                                            data-type="minus" data-field="wdt-border-spacing">
                                        <i class="wpdt-icon-minus"></i>
                                    </button>
                                    <input type="number" name="wdt-border-spacing" min="0" value="0"
                                           class="form-control input-sm input-number" id="wdt-border-spacing">
                                    <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus"
                                            data-type="plus" data-field="wdt-border-spacing">
                                        <i class="wpdt-icon-plus-full"></i>
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
                <!-- /Table display settings -->

                <!-- Table responsive settings -->
                <div role="tabpanel" class="tab-pane fade" id="responsive-settings">

                    <div class="row">
                        <div class="col-sm-4 m-b-16 simple-responsive-block">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Basic responsive', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-popover-content="#simple-responsive-hint"
                                   data-toggle="html-popover" data-trigger="hover" data-placement="right"></i>
                            </h4>

                            <!-- Hidden popover with image hint -->
                            <div class="hidden" id="simple-responsive-hint">
                                <div class="popover-heading">
                                    <?php esc_html_e('Basic responsive', 'wpdatatables'); ?>
                                </div>

                                <div class="popover-body">
                                    <?php esc_html_e('Enable this to enable responsive mode on tablet and mobile devices.', 'wpdatatables'); ?>
                                    <br>
                                    <?php esc_html_e('All cells will be shown in one column. If option "Header" on Display tab in turn on, then table will be shown in two columns. First column will be repeated first row from table(column headers) and in second column will be shown transpose other row data.', 'wpdatatables'); ?>
                                </div>
                            </div>
                            <!-- /Hidden popover with image hint -->

                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-simple-responsive" type="checkbox">
                                <label for="wdt-simple-responsive"
                                       class="ts-label"><?php esc_html_e('Enable responsive mode', 'wpdatatables'); ?></label>
                            </div>

                        </div>
                        <div class="col-sm-4 m-b-16 wdt-scrollable-block">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Scrollable', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-popover-content="#scrollable-hint"
                                   data-toggle="html-popover" data-trigger="hover" data-placement="right"></i>
                            </h4>

                            <!-- Hidden popover with image hint -->
                            <div class="hidden" id="scrollable-hint">
                                <div class="popover-heading">
                                    <?php esc_html_e('Scrollable table', 'wpdatatables'); ?>
                                </div>

                                <div class="popover-body">
                                    <?php esc_html_e('Enable this to enable a horizontal scrollbar below the table.', 'wpdatatables'); ?>
                                </div>
                            </div>
                            <!-- /Hidden popover with image hint -->

                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-scrollable" type="checkbox">
                                <label for="wdt-scrollable"
                                       class="ts-label"><?php esc_html_e('Show a horizontal scrollbar', 'wpdatatables'); ?></label>
                            </div>

                        </div>
                        <div class="col-sm-4 m-b-16 limit-table-width-settings-block">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Limit table width', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-popover-content="#limit-width-hint"
                                   data-toggle="html-popover" data-trigger="hover" data-placement="right"></i>
                            </h4>

                            <!-- Hidden popover with image hint -->
                            <div class="hidden" id="limit-width-hint">
                                <div class="popover-heading">
                                    <?php esc_html_e('Limit table width', 'wpdatatables'); ?>
                                </div>

                                <div class="popover-body">
                                    <?php esc_html_e('Enable this to restrict table width to page width.', 'wpdatatables'); ?>
                                </div>
                            </div>
                            <!-- /Hidden popover with image hint -->

                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-limit-layout" type="checkbox">
                                <label for="wdt-limit-layout"
                                       class="ts-label"><?php esc_html_e('Limit table width to page width', 'wpdatatables'); ?></label>
                            </div>

                        </div>
                        <div class="col-sm-4 m-b-16 word-wrap-settings-block hidden">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Word wrap', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-popover-content="#word-wrap-hint"
                                   data-toggle="html-popover" data-trigger="hover" data-placement="right"></i>
                            </h4>

                            <!-- Hidden popover with image hint -->
                            <div class="hidden" id="word-wrap-hint">
                                <div class="popover-heading">
                                    <?php esc_html_e('Word wrap', 'wpdatatables'); ?>
                                </div>

                                <div class="popover-body">
                                    <?php esc_html_e('Enable this to wrap long strings into multiple lines and stretch the cells height.', 'wpdatatables'); ?>
                                </div>
                            </div>
                            <!-- /Hidden popover with image hint -->

                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-word-wrap" type="checkbox">
                                <label for="wdt-word-wrap"
                                       class="ts-label"><?php esc_html_e('Wrap words to newlines', 'wpdatatables'); ?></label>
                            </div>

                        </div>
                    </div>
                    <div class="row">
                        <div class="col-sm-4 m-b-16 vertical-scroll-block">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Vertical scroll', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-popover-content="#vertical-scroll-hint"
                                   data-toggle="html-popover" data-trigger="hover" data-placement="right"></i>
                            </h4>

                            <!-- Hidden popover with image hint -->
                            <div class="hidden" id="vertical-scroll-hint">
                                <div class="popover-heading">
                                    <?php esc_html_e('Add Vertical scroll', 'wpdatatables'); ?>
                                </div>

                                <div class="popover-body">
                                    <?php esc_html_e('Enable this to enable a vertical scrollbar in the table.', 'wpdatatables'); ?>
                                </div>
                            </div>
                            <!-- /Hidden popover with image hint -->

                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-vertical-scroll" type="checkbox">
                                <label for="wdt-vertical-scroll"
                                       class="ts-label"><?php esc_html_e('Show a vertical scrollbar', 'wpdatatables'); ?></label>
                            </div>

                        </div>
                        <div class="col-sm-4 vertical-scroll-height-block hidden">

                            <h4 class="c-title-color m-b-2">
                                <?php esc_html_e('Vertical scroll height', 'wpdatatables'); ?>
                                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                                   title="<?php esc_attr_e('Here you can provide number of the padding size for cell in table without inserting px.', 'wpdatatables'); ?>"></i>
                            </h4>
                            <div class="form-group">
                                <div class="fg-line wdt-custom-number-input">
                                    <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus"
                                            data-type="minus" data-field="wdt-vertical-scroll-height">
                                        <i class="wpdt-icon-minus"></i>
                                    </button>
                                    <input type="number" name="wdt-vertical-scroll-height" min="1" value="600"
                                           class="form-control input-sm input-number"
                                           id="wdt-vertical-scroll-height">
                                    <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus"
                                            data-type="plus" data-field="wdt-vertical-scroll-height">
                                        <i class="wpdt-icon-plus-full"></i>
                                    </button>
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
                <!-- /Table responsive settings -->

            </div>
            <!-- /.tab-content - end of table settings tabs -->

            <div class="row m-l-0 m-r-0">

                <div class="col-md-12 p-l-0  wdt-table-settings-col">
                    <button class="btn btn-default btn-icon-text wdt-documentation wdt-table-settings"
                            data-doc-page="simple_table_settings">
                        <i class="wpdt-icon-file-thin"></i><?php esc_html_e('View Documentation', 'wpdatatables'); ?>
                    </button>
                </div>
                <!-- /.col-md-12 -->
            </div>
            <!-- /.row -->
        </div>
        <!--/div role="tabpanel" -->
    </div>


</div>
<!-- /.card /.wdt-table-settings -->

