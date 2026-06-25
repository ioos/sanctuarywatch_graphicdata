<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- #wdt-backend-close-modal -->
<div class="modal fade" id="wdt-backend-html-modal" data-backdrop="static" data-keyboard="false" tabindex="-1"
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
                <h4 class="modal-title"> <?php esc_html_e('HTML Editor', 'wpdatatables') ?></h4>
            </div>
            <!--/ .modal-header -->

            <!-- .modal-body -->
            <div class="modal-body">
                <!-- .row -->
                <div class="row">
                    <div class="form-group m-b-0 col-xs-12">
                        <div class="fg-line">
                     <textarea class="wpdt-tiny-mce"
                               id="wpdt-tiny-mce" rows="20"
                     ></textarea>
                        </div>
                    </div>
                </div>
            </div>
            <!--/ .modal-body -->

            <!-- .modal-footer -->
            <div class="modal-footer p-t-0">
                <hr>

                <button type="button" class="btn btn-danger btn-icon-text wdt-backend-close-modal-button " data-dismiss="modal">
                    <i class="wpdt-icon-times-full"></i>
                    <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-icon-text"
                        id="wdt-backend-insert-html-button">
                    <i class="wpdt-icon-plus-full"></i>
                    <?php esc_html_e('Insert HTML', 'wpdatatables'); ?>
                </button>
            </div>
            <!--/ .modal-footer -->
        </div>
        <!--/ .modal-content -->
    </div>
    <!--/ .modal-dialog -->
</div>
<!--/ #wdt-backend-close-modal -->
