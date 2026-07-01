<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- #wdt-backend-close-modal -->
<div class="modal fade wpdt-modals" id="wdt-backend-star-modal" data-backdrop="static" data-keyboard="false"
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
                <h4 class="modal-title"> <?php _e('Star Rating Editor', 'wpdatatables') ?></h4>
            </div>
            <!--/ .modal-header -->

            <!-- .modal-body -->
            <div class="modal-body">
                <div class="row">
                    <p class="col-sm-12 m-b-0" style="font-size: 16px;">
                        <?php _e('Select star rating:', 'wpdatatables') ?>
                    </p>
                </div>
                <!-- .row -->
                <div class="row">
                    <div class="wpdt-star-rating-wrapper text-center">
                        <div class='rateYo'></div>
                        <div class="rateNum" hidden></div>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-sm-6">
                        <label for="wpdt-star-number" class="col-sm-12 p-l-0 p-r-0 control-label">
                            <?php _e('Choose number of stars:', 'wpdatatables') ?>
                        </label>
                        <div class="fg-line wdt-custom-number-input">
                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus"
                                    data-type="minus" data-field="wpdt-star-number">
                                <i class="wpdt-icon-minus"></i>
                            </button>
                            <input type="number" name="wpdt-star-number" min="1" max="10" value="5"
                                   class="form-control input-sm input-number" id="wpdt-star-number">
                            <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus"
                                    data-type="plus" data-field="wpdt-star-number">
                                <i class="wpdt-icon-plus-full"></i>
                            </button>
                        </div>
                    </div>
                    <div class="form-group col-sm-6 m-t-20">
                        <div class="toggle-switch" data-ts-color="blue">
                            <input id="wpdt-star-rating-number" type="checkbox">
                            <label for="wpdt-star-rating-number"
                                   class="ts-label"><?php _e('Show star number rating', 'wpdatatables'); ?></label>
                        </div>
                    </div>
                </div>
                <div class="row">
                    <div class="form-group col-sm-6">
                        <label for="wpdt-star-rating-color" class="col-sm-12 p-l-0 p-r-0 control-label">
                            <?php esc_html_e('Choose star color:', 'wpdatatables') ?>
                        </label>
                        <div class="cp-container">
                            <div class="form-group col-sm-16">
                                <div class="fg-line dropdown">
                                    <div id="cp" class="input-group wdt-color-picker">
                                        <input type="text" id="wpdt-star-rating-color" value="" class="form-control cp-value cp-inside wdt-add-picker"/>
                                        <span class="input-group-addon wpcolorpicker-icon"><i></i></span>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <!--/ .modal-body -->

            <!-- .modal-footer -->
            <div class="modal-footer p-t-0">
                <hr>

                <button type="button" class="btn btn-danger btn-icon-text wdt-backend-close-modal-button "
                        data-dismiss="modal">
                    <i class="wpdt-icon-times-full"></i>
                    <?php _e('Cancel', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-icon-text"
                        id="wdt-backend-insert-star-button">
                    <i class="wpdt-icon-plus-full"></i>
                    <?php _e('Insert star rating', 'wpdatatables'); ?>
                </button>
            </div>
            <!--/ .modal-footer -->
        </div>
        <!--/ .modal-content -->
    </div>
    <!--/ .modal-dialog -->
</div>
<!--/ #wdt-backend-close-modal -->
