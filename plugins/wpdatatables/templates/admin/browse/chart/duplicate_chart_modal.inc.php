<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- #wdt-duplicate-chart-modal -->
<div class="modal fade" id="wdt-duplicate-chart-modal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     role="dialog" aria-hidden="true">
    <?php wp_nonce_field('wdtDuplicateChartNonce', 'wdtNonce'); ?>

    <!-- .modal-dialog -->
    <div class="modal-dialog">

        <!-- .modal-content -->
        <div class="modal-content">

            <!-- .modal-header -->
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true"><i class="wpdt-icon-times-full"></i></span>
                </button>
                <h4 class="modal-title"><?php esc_html_e('Duplicate chart', 'wpdatatables') ?></h4>
            </div>
            <!--/ .modal-header -->

            <!-- .modal-body -->
            <div class="modal-body">
                <!-- .row -->
                <div class="row">
                    <div class="col-sm-12">
                        <label class="c-title-color duplicate-chart-label m-b-4 f-500"><?php esc_html_e('New chart title', 'wpdatatables'); ?></label>
                    </div>
                    <div class="col-sm-12">
                        <input type="text" value="" class="wdt-duplicate-chart-name form-control input-sm" title=""/>
                    </div>
                </div>
                <!--/ .row -->
            </div>
            <!--/ .modal-body -->

            <!-- .modal-footer -->
            <div class="modal-footer">
                <hr>
                <button type="button"
                        class="btn btn-danger btn-icon-text"
                        data-dismiss="modal">
                    <?php esc_html_e('Cancel', 'wpdatatables'); ?></button>
                <button type="button"
                        class="btn btn-primary btn-icon-text wdt-apply duplicate-chart-button">
                    <i class="wpdt-icon-clone"></i>
                    <?php esc_html_e('Duplicate', 'wpdatatables'); ?>
                </button>
            </div>
            <!--/ .modal-footer -->
        </div>
        <!--/ .modal-content -->
    </div>
    <!--/ .modal-dialog -->
</div>
<!--/ #wdt-duplicate-chart-modal -->
