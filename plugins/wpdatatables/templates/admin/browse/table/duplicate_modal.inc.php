<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- #wdt-duplicate-table-modal -->
<div class="modal fade" id="wdt-duplicate-table-modal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     role="dialog" aria-hidden="true">
    <?php wp_nonce_field('wdtDuplicateTableNonce', 'wdtNonce'); ?>

    <!-- .modal-dialog -->
    <div class="modal-dialog">

        <!-- .modal-content -->
        <div class="modal-content">

            <!-- .modal-header -->
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">
                        <i class="wpdt-icon-times-full"></i></span>
                </button>
                <h4 class="modal-title"><?php esc_html_e('Duplicate table', 'wpdatatables') ?></h4>
            </div>
            <!--/ .modal-header -->

            <!-- .modal-body -->
            <div class="modal-body">
                <!-- .row -->
                <div class="row">
                    <div class="col-sm-12">
                        <label class="c-title-color duplicate-table-label m-b-4 f-500"><?php _e('New table title', 'wpdatatables'); ?></label>
                    </div>
                    <div class="col-sm-12">
                        <input type="text" value="" class="wdt-duplicate-table-name form-control input-sm" title=""/>
                    </div>
                </div>
                <!--/ .row -->

                <!--/ .row -->
                <div class="row wdt-duplicate-manual-table">
                    <div class="col-sm-12">
                        <h4 class="c-title-color m-b-2">
                            <?php esc_html_e('Duplicate option', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right" data-html="true"
                               data-original-title="<strong><?php _e('Unchecked', 'wpdatatables'); ?> -</strong>  <?php _e('will create exact copy of this table which means that all changes made in one table will be reflected in all copies.', 'wpdatatables'); ?><br /><strong><?php _e('Checked', 'wpdatatables'); ?> -</strong>  <?php _e('will create separate database table so changing one table won\'t affect other copies.', 'wpdatatables'); ?>"></i>
                        </h4>
                        <div class="toggle-switch" data-ts-color="blue">
                            <input type="checkbox" id="wdt-duplicate-database" name="wdt-duplicate-database"
                                   value="duplicate" title="" checked="checked">

                            <label for="wdt-duplicate-database" class="duplicate-table-label">
                                <?php esc_html_e('Duplicate database table', 'wpdatatables'); ?>
                            </label>
                        </div>
                    </div>
                </div>
                <!--/ .row -->
            </div>
            <!--/ .modal-body -->
            <!-- .modal-footer -->
            <div class="modal-footer">
                <hr>
                <button type="button" class="btn btn-danger btn-icon-text"
                        data-dismiss="modal"> <?php esc_html_e('Cancel', 'wpdatatables'); ?></button>
                <button type="button"
                        class="btn btn-primary btn-icon-text wdt-apply duplicate-table-button"><i
                            class="wpdt-icon-clone"></i> <?php esc_html_e('Duplicate', 'wpdatatables'); ?></button>
            </div>
            <!--/ .modal-footer -->
        </div>
        <!--/ .modal-content -->
    </div>
    <!--/ .modal-dialog -->
</div>
<!--/ #wdt-duplicate-table-modal -->