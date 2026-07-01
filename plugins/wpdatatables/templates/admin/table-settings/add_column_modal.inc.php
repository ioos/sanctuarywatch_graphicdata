<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<!-- .wdt-add-column-modal -->
<div class="modal fade" id="wdt-add-column-modal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     role="dialog" aria-hidden="true">

    <!-- .modal-dialog -->
    <div class="modal-dialog">

        <!-- .modal-content -->
        <div class="modal-content">

            <!-- Preloader -->
            <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
            <!-- /Preloader -->

            <!-- .modal-header -->
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span>
                </button>
                <h4 class="modal-title"><?php esc_html_e('Add Column', 'wpdatatable'); ?></h4>
            </div>
            <!--/ .modal-header -->

            <!-- .modal-body -->
            <div class="modal-body">

                <!-- .wdt-add-column-modal-block -->
                <div class="wdt-add-column-modal-block">

                    <div class="row">

                        <div class="col-xs-12">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Column header', 'wpdatatables'); ?>
                            </h5>
                            <div class="form-group">
                                <div class="fg-line">
                                    <input class="form-control input-sm" id="wdt-add-column-column-header" type="text"
                                           value=""/>
                                </div>
                            </div>
                        </div>

                        <div class="col-xs-12">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Type', 'wpdatatables'); ?>
                            </h5>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="selectpicker wdt-add-column-column-type">
                                            <?php foreach (WDTTools::getPossibleColumnTypes() as $columnTypeKey => $columnTypeName) { ?>
                                                <option value="<?php echo esc_attr($columnTypeKey) ?>"><?php echo esc_html($columnTypeName) ?></option>
                                            <?php } ?>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-xs-12">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Insert after', 'wpdatatables'); ?>
                            </h5>
                            <div class="form-group">
                                <div class="fg-line">
                                    <div class="select">
                                        <select class="wdt-add-column-insert-after selectpicker">
                                            <option value="%%beginning%%"><?php esc_html_e('Beginning of table', 'wpdatatables'); ?></option>
                                            <option value="%%end%%"><?php esc_html_e('End of table', 'wpdatatables'); ?></option>
                                            <?php if (isset($tableData)){
                                                foreach ($tableData->table->columns as $column) { ?>
                                                <option value="<?php echo esc_attr($column->orig_header); ?>"><?php echo esc_html($column->display_header); ?></option>
                                                <?php } ?>
                                            <?php } ?>
                                        </select>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div class="col-xs-12 wdt-add-column-possible-values-block" style="display: none;">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Possible values', 'wpdatatables'); ?>
                            </h5>
                            <div class="form-group">
                                <div class="fg-line">
                                    <input class="form-control input-sm wdt-add-column-possible-values" value=""/>
                                </div>
                            </div>
                        </div>

                        <div class="col-xs-12">
                            <h5 class="c-title-color m-b-2">
                                <?php esc_html_e('Editor predefined value', 'wpdatatables'); ?>
                            </h5>
                            <div class="form-group">
                                <div class="fg-line">
                                    <input type="text" class="form-control input-sm wdt-add-column-default-value"
                                           value="">
                                </div>
                            </div>
                        </div>

                        <div class="col-xs-12">
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-add-column-fill-with-default" type="checkbox">
                                <label for="wdt-add-column-fill-with-default"
                                       class="ts-label"><?php esc_html_e('Fill with default value', 'wpdatatables'); ?></label>
                            </div>
                        </div>

                    </div>

                </div>
                <!--/ .wdt-add-column-modal-block -->
            </div>
            <!--/ .modal-body -->

            <!-- .modal-footer -->
            <div class="modal-footer">
                <button class="btn btn-danger btn-icon-text " data-toggle="modal"
                        data-target="#wdt-add-column-modal">
                    <i class="zmdi zmdi-close"></i>
                    <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                </button>
                <button class="btn btn-primary btn-icon-text " id="wdt-add-column-submit">
                    <i class="zmdi zmdi-check"></i>
                    <?php esc_html_e('OK', 'wpdatatables'); ?>
                </button>
            </div>
            <!--/ .modal-footer -->
        </div>
        <!--/ .modal-content -->
    </div>
    <!--/ .modal-dialog -->
</div>
<!--/ .wdt-add-column-modal -->
