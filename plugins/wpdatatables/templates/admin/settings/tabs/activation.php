<div role="tabpanel" class="tab-pane" id="wdt-activation">
    <div class="row ">
        <div class="col-sm-6 m-b-30">
            <span>
                <?php esc_html_e('For instructions on activating your license, please refer to our ', 'wpdatatables'); ?>
                        <a href="https://wpdatatables.com/documentation/general/updating-wpdatatables/"
                           target="_blank"
                           rel="nofollow">
                                            <?php esc_html_e('upgrade guide.', 'wpdatatables'); ?></a>
            </span>
        </div>
    </div>
    <div class="row ">
        <div class="col-sm-6 m-b-30">

            <div class="wdt-activation-section opacity-6">

                <div class="wpdt-plugins-desc">
                    <img class="img-responsive" src="<?php echo WDT_ASSETS_PATH; ?>img/logo-large.png" alt="">
                    <h4>wpDataTables</h4>
                </div>

                <div class="panel-body">

                    <div class="col-sm-10 wdt-purchase-code p-l-0">

                        <h4 class="c-title-color m-b-2 m-t-0">
                            <?php esc_html_e('TMS Store Purchase Code', 'wpdatatables'); ?>
                        </h4>

                        <div class="form-group m-b-0">
                            <div class="row">

                                <div class="col-sm-11 p-r-0 wdt-purchase-code-store-wrapper">
                                    <div class="fg-line">
                                        <input type="text" name="wdt-purchase-code-store"
                                               id="wdt-purchase-code-store"
                                               class="form-control input-sm"
                                               disabled="disabled"
                                               placeholder="<?php esc_html_e('Please enter your wpDataTables TMS Store Purchase Code', 'wpdatatables'); ?>"
                                               value=""
                                        />
                                    </div>
                                </div>

                                <div class="col-sm-11 p-r-0 wdt-security-massage-wrapper hidden">
                                    <div class="fg-line">
                                        <div class="alert alert-info" role="alert">
                                            <i class="wpdt-icon-info-circle-full"></i>
                                            <span class="wdt-alert-title f-600">
                                        <?php esc_html_e('Your purchase code has been hidden for security reasons. You can find it on your', 'wpdatatables'); ?>
                                        <a href="https://store.tms-plugins.com/login"
                                           target="_blank"><?php esc_html_e('store page', 'wpdatatables'); ?></a>.
                                    </span>
                                        </div>
                                    </div>
                                </div>

                                <div class="col-sm-1">
                                    <button class="btn btn-primary wdt-store-activate-plugin" id="wdt-activate-plugin"
                                            disabled="disabled">
                                        <i class="wpdt-icon-check-circle-full"></i><?php esc_html_e('Activate ', 'wpdatatables'); ?>
                                    </button>
                                </div>

                            </div>
                        </div>

                    </div>

                    <div class="col-sm-10 wdt-envato-activation wdt-envato-activation-wpdatatables p-l-0">

                        <h4 class="c-title-color m-b-2 m-t-0">
                            <?php esc_html_e('Envato API', 'wpdatatables'); ?>
                        </h4>

                        <div class="form-group m-b-0">
                            <div class="row m-l-0">

                                <button class="btn wdt-envato-activation-button"
                                        disabled="disabled"
                                        id="wdt-envato-activation-wpdatatables">
                                    <div id="wdt-envato-div">
                                        <img src="<?php echo WDT_ASSETS_PATH ?>img/envato.svg"
                                             class="wdt-envato-activation-logo"
                                        >
                                    </div>
                                    <span>
                                    <?php esc_html_e('Activate with Envato', 'wpdatatables'); ?>
                                </span>
                                </button>

                                <button class="btn btn-danger wdt-envato-deactivation-button"
                                        disabled="disabled"
                                        style="display: none;" id="wdt-envato-deactivation-wpdatatables">
                                    <i class="wpdt-icon-times-circle-full"></i><?php esc_html_e('Deactivate ', 'wpdatatables'); ?>
                                </button>

                            </div>
                        </div>

                    </div>

                </div>
            </div>

        </div>
        <?php do_action('wpdatatables_add_activation'); ?>

    </div>
</div>