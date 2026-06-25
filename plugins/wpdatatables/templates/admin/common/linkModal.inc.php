<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- #wdt-backend-close-modal -->
<div class="modal fade wpdt-modals" id="wdt-backend-link-modal" data-backdrop="static" data-keyboard="false" tabindex="-1"
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
                <h4 class="modal-title"><?php esc_html_e('Link editor', 'wpdatatables') ?></h4>
            </div>
            <!--/ .modal-header -->

            <!-- .modal-body -->
            <div class="modal-body">
                <!-- .row -->
                <div class="row">
                    <div class="form-group p-0 col-xs-12">
                        <label for="wpdt-link-url" class="col-sm-12 control-label">
                            <?php esc_html_e('Insert URL:', 'wpdatatables') ?>
                        </label>
                        <!--/ .control-label -->
                        <!-- .col-sm-9 -->
                        <div class="col-sm-12">
                            <div class="fg-line">
                                <input type="text" id="wpdt-link-url" class="form-control" name="wpdt-link-url" required>
                            </div>
                        </div>
                        <!-- .col-sm-9 -->
                        <div class="error-msg m-l-15" hidden> <?php esc_html_e('Field can not be empty!', 'wpdatatables') ?></div>

                    </div>
                </div>
                <div class="row">
                    <div class="form-group p-0 col-xs-12">
                        <label for="wpdt-link-text" class="col-sm-12 control-label">
                            <?php esc_html_e('Insert Link text:', 'wpdatatables') ?>
                        </label>
                        <!--/ .control-label -->
                        <!-- .col-sm-9 -->
                        <div class="col-sm-12">
                            <div class="fg-line">
                                <input type="text" id="wpdt-link-text" class="form-control" name="wpdt-link-text" required>
                            </div>
                        </div>
                        <!-- .col-sm-9 -->
                        <div class="error-msg m-l-15" hidden> <?php esc_html_e('Field can not be empty!', 'wpdatatables') ?></div>
                    </div>
                </div>
                <!--/ .row -->
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group">
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wpdt-link-target-attribute" type="checkbox">
                                <label for="wpdt-link-target-attribute"
                                       class="ts-label"><?php esc_html_e('Open link in the new tab', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group">
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wpdt-link-nofollow-attribute" type="checkbox">
                                <label for="wpdt-link-nofollow-attribute"
                                       class="ts-label"><?php esc_html_e('Make NOFOLLOW link', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group">
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wpdt-link-noreferrer-attribute" type="checkbox">
                                <label for="wpdt-link-noreferrer-attribute"
                                       class="ts-label"><?php esc_html_e('Make NOREFERRER link', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group">
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wpdt-link-sponsored-attribute" type="checkbox">
                                <label for="wpdt-link-sponsored-attribute"
                                       class="ts-label"><?php esc_html_e('Make SPONSORED link', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="col-sm-12">
                        <div class="form-group">
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wpdt-link-button-attribute" type="checkbox">
                                <label for="wpdt-link-button-attribute"
                                       class="ts-label"><?php esc_html_e('Set the link to appear as a button', 'wpdatatables'); ?></label>
                            </div>
                        </div>
                    </div>
                </div>

                <div class="row wpdt-link-button-class-block" hidden>
                    <div class="form-group p-0 col-xs-12">
                        <label for="wpdt-button-class" class="col-sm-12 control-label">
                            <?php esc_html_e('Button class:', 'wpdatatables') ?>
                        </label>
                        <!--/ .control-label -->
                        <!-- .col-sm-9 -->
                        <div class="col-sm-12">
                            <div class="fg-line">
                                <input type="text" id="wpdt-button-class" class="form-control" name="wpdt-button-class">
                            </div>
                        </div>
                        <!-- .col-sm-9 -->
                    </div>
                </div>
            </div>
            <!--/ .modal-body -->

            <!-- .modal-footer -->
            <div class="modal-footer">
                <hr>

                <button type="button" class="btn btn-danger btn-icon-text wdt-backend-close-modal-button"
                        data-dismiss="modal">
                    <i class="wpdt-icon-times-full"></i><?php esc_html_e('Cancel', 'wpdatatables'); ?></button>
                <button type="button" class="btn btn-icon-text"
                        id="wdt-backend-insert-link-button">
                    <i class="wpdt-icon-plus-full"></i>
                    <?php esc_html_e('Insert link', 'wpdatatables'); ?>
                </button>
            </div>
            <!--/ .modal-footer -->
        </div>
        <!--/ .modal-content -->
    </div>
    <!--/ .modal-dialog -->
</div>
<!--/ #wdt-backend-close-modal -->
