<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- #wdt-backend-warning-modal -->
<div class="modal fade wpdt-modals" id="wdt-backend-warning-modal" data-backdrop="static" data-keyboard="false"
     tabindex="-1"
     role="dialog" aria-hidden="true">

    <!-- .modal-dialog -->
    <div class="modal-dialog">

        <!-- .modal-content -->
        <div class="modal-content">

            <!-- .modal-header -->
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i
                            class="wpdt-icon-times-full"></i></span>
                </button>
                <h4 class="modal-title"><?php esc_html_e('Are you sure?', 'wpdatatables'); ?></h4>
            </div>
            <!--/ .modal-header -->

            <!-- .modal-body -->
            <div class="modal-body">
                <div class="row">
                    <p class="col-sm-12 m-b-0" style="font-size: 16px;">
                        <?php esc_html_e('You are about to delete all table data.', 'wpdatatables') ?>
                    </p>
                </div>
                <!-- .row -->
            </div>
            <!--/ .modal-body -->

            <!-- .modal-footer -->
            <div class="modal-footer p-t-0">
                <hr>

                <button type="button" class="btn btn-icon-text" id="wdt-backend-warning-continue-button"
                        data-dismiss="modal">
                    <?php esc_html_e('No, Continue', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-danger btn-icon-text"
                        id="wdt-backend-clear-table-data-button">
                    <i class="wpdt-icon-times-full"></i>
                    <?php esc_html_e('Yes, Delete', 'wpdatatables'); ?>
                </button>
            </div>
            <!--/ .modal-footer -->
        </div>
        <!--/ .modal-content -->
    </div>
    <!--/ .modal-dialog -->
</div>
<!--/ #wdt-backend-warning-modal -->

