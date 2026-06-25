<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- .wpdt-c -->
<div class="wpdt-c">
    <!-- #wdt-delete-modal -->
    <div class="modal fade in" id="wdt-delete-modal" style="display: none" data-backdrop="static" data-keyboard="false"
         tabindex="-1" role="dialog" aria-hidden="true">

        <!-- .modal-dialog -->
        <div class="modal-dialog">

            <!-- .modal-content -->
            <div class="modal-content">

                <!-- .modal-header -->
                <div class="modal-header">
                    <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span
                                aria-hidden="true"> <i class="wpdt-icon-times-full"></i></span></button>
                    <h4 class="modal-title"><?php esc_html_e('Are you sure?', 'wpdatatables') ?></h4>
                </div>
                <!--/ .modal-header -->

                <!-- .modal-body -->
                <div class="modal-body">
                    <!-- .row -->
                    <div class="row">
                        <div class="col-sm-12">
                            <small><?php esc_html_e('Please confirm deletion. There is no undo!', 'wpdatatables'); ?></small>
                        </div>
                    </div>
                    <!--/ .row -->
                </div>
                <!--/ .modal-body -->

                <!-- .modal-footer -->
                <div class="modal-footer">
                    <hr>
                    <button type="button" class="btn btn-icon-text wdt-cancel-delete-button" data-dismiss="modal">
                        <?php esc_html_e('Cancel', 'wpdatatables'); ?></button>
                    <button type="button" class="btn btn-danger btn-icon-text wdt-browse-delete-button"
                            id="wdt-browse-delete-button"><i
                                class="wpdt-icon-trash"></i> <?php esc_html_e('Delete', 'wpdatatables'); ?></button>
                </div>
                <!--/ .modal-footer -->
            </div>
            <!--/ .modal-content -->
        </div>
        <!--/ .modal-dialog -->
    </div>
    <!--/ #wdt-delete-modal -->
</div>
<!--/ .wpdt-c -->