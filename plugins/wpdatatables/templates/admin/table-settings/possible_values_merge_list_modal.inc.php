<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<!-- #wdt-possible-values-merge-list-modal -->
<div class="modal fade" id="wdt-possible-values-merge-list-modal" data-backdrop="static" data-keyboard="false"
     tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <h4 class="modal-title"><?php esc_html_e('Merge values?', 'wpdatatables'); ?></h4>
            </div>
            <div class="modal-body">
                <p>
                    <small><?php esc_html_e('There are already defined possible values. Do you want to merge or to replace new values with the existing?', 'wpdatatables'); ?></small>
                </p>
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-danger btn-icon-text " data-dismiss="modal">
                    <i class="zmdi zmdi-close"></i>
                    <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-primary btn-icon-text wdt-merge-possible-values">
                    <i class="zmdi zmdi-arrow-merge"></i>
                    <?php esc_html_e('Merge', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-primary btn-icon-text wdt-replace-possible-values">
                    <i class="zmdi zmdi-search-replace"></i>
                    <?php esc_html_e('Replace', 'wpdatatables'); ?>
                </button>
            </div>
        </div>
    </div>
</div>
<!-- /#wdt-possible-values-merge-list-modal -->