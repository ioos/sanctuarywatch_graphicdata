<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- #wdt-backend-close-modal -->
<div class="modal fade" id="wdt-backend-close-modal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     role="dialog" aria-hidden="true">

    <!-- .modal-dialog -->
    <div class="modal-dialog">

        <!-- .modal-content -->
        <div class="modal-content">

            <!-- .modal-header -->
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="wpdt-icon-times-full"></i></span>
                </button>
                <h4 class="modal-title"><?php esc_html_e('Are you sure?', 'wpdatatables') ?></h4>
            </div>
            <!--/ .modal-header -->

            <!-- .modal-body -->
            <div class="modal-body">
                <!-- .row -->
                <div class="row">
                    <div class="col-sm-12">
                        <small><?php esc_html_e('You are about to cancel creating wizard, there is no undo! You will be redirect to Browse page.', 'wpdatatables'); ?></small>
                    </div>
                </div>
                <!--/ .row -->
            </div>
            <!--/ .modal-body -->

            <!-- .modal-footer -->
            <div class="modal-footer">
                <hr>
                <button type="button" class="btn btn-icon-text" data-dismiss="modal"
                        id="wdt-backend-continue-button"><?php esc_html_e('No, Continue', 'wpdatatables'); ?></button>
                <button type="button" class="btn btn-danger btn-icon-text"
                        id="wdt-backend-close-button"><i class="wpdt-icon-times-full"></i><?php esc_html_e('Yes, Cancel', 'wpdatatables'); ?></button>
            </div>
            <!--/ .modal-footer -->
        </div>
        <!--/ .modal-content -->
    </div>
    <!--/ .modal-dialog -->
</div>
<!--/ #wdt-backend-close-modal -->