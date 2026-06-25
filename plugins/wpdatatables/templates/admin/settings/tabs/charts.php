<?php defined('ABSPATH') or die('Access denied.'); ?>

<div role="tabpanel" class="tab-pane" id="wdt-charts">
    <div class="row">
        <div id="wdt-google-stable-tag" class="col-sm-4 stable-tag">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Use stable GoogleCharts version', 'wpdatatables'); ?>
                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Choose weather to use the chart engine library directly from the CDN (as they get updated, some features may break), or use the latest version wpDataTables has been tested with. Leaving this option unchecked means the code is pulled from the CDN.', 'wpdatatables'); ?>"></i>
            </h4>

            <div class="fg-line">
                <div class="toggle-switch" data-ts-color="blue">
                    <input id="wdt-use-google-stable-version" type="checkbox">
                    <label for="wdt-use-google-stable-version"
                           class="ts-label form-control"><?php esc_html_e('Use stable version', 'wpdatatables'); ?></label>
                </div>
            </div>
        </div>
        <div id="wdt-highcharts-stable-tag" class="col-sm-4 stable-tag">
            <h4 class="c-title-color m-b-2">
                <span class="opacity-6">
                <?php esc_html_e('Use stable HighChart version', 'wpdatatables'); ?>
                </span>
                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Choose weather to use the chart engine library directly from the CDN (as they get updated, some features may break), or use the latest version wpDataTables has been tested with. Leaving this option unchecked means the code is pulled from the CDN.', 'wpdatatables'); ?>"></i>
            </h4>

            <div class="fg-line">
                <div class="toggle-switch" data-ts-color="blue">
                    <input class="opacity-6 wdt-premium-feature" disabled id="wdt-use-highcharts-stable-version" type="checkbox">
                    <label for="wdt-use-highcharts-stable-version"
                           class="ts-label form-control opacity-6" data-toggle="html-checkbox-premium-popover" data-placement="top" title="" data-content="content">
                        <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i>
                            <span class="opacity-6">
                                <?php esc_html_e('Use stable version', 'wpdatatables'); ?>
                            </span>
                    </label>
                </div>
            </div>
        </div>
        <div id="wdt-apexcharts-stable-tag" class="col-sm-4 stable-tag">
            <h4 class="c-title-color m-b-2">
                <span class="opacity-6">
                <?php esc_html_e('Use stable ApexChart version', 'wpdatatables'); ?>
                </span>
                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Choose weather to use the chart engine library directly from the CDN (as they get updated, some features may break), or use the latest version wpDataTables has been tested with. Leaving this option unchecked means the code is pulled from the CDN.', 'wpdatatables'); ?>"></i>
            </h4>

            <div class="fg-line">
                <div class="toggle-switch" data-ts-color="blue">
                    <input class="opacity-6 wdt-premium-feature" disabled id="wdt-use-apexcharts-stable-version" type="checkbox">
                    <label for="wdt-use-apexcharts-stable-version"
                           class="ts-label form-control opacity-6"
                            data-placement="top" title="" data-content="content">
                        <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i>
                            <span class="opacity-6">
                           <?php esc_html_e('Use stable version', 'wpdatatables'); ?>
                            </span>
                    </label>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div id="wdt-googlechart-mapkey-tag" class="col-sm-4 stable-tag googlechart-mapkey">
            <h4 class="c-title-color m-b-2">
                <i class="wpdt-icon-star-full" style="color: #FFC078;"></i>
                <span class="opacity-6">
                 <?php esc_html_e('Google Maps API key', 'wpdatatables'); ?>
                </span>
                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Insert Google Maps API key', 'wpdatatables'); ?>"></i>
            </h4>

            <div class="fg-line">
                <input type="text" name="wdt-googlechart-mapkey"
                       id="wdt-googlechart-mapkey" disabled
                       class="form-control input-sm"
                       placeholder="<?php esc_html_e('Please enter your Google Maps API key', 'wpdatatables'); ?>"
                       value="" autocomplete="off"
                       data-toggle="html-input-premium-popover" data-placement="top" title="" data-content="content"
                />
            </div>
        </div>
        <div class="col-sm-4 wdt-global-loder">
            <h4 class="c-title-color m-b-2">
                <span class="opacity-6">
                 <?php esc_html_e('Loader visibility', 'wpdatatables'); ?>
                </span>
                <i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Enable this option to display a loader for all charts while they are loading.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="fg-line">
                <div class="toggle-switch" data-ts-color="blue">
                    <input class="opacity-6 wdt-premium-feature" disabled name="wdt-global-chart-loader" id="wdt-global-chart-loader" type="checkbox"/>
                    <label for="wdt-global-chart-loader"
                           class="ts-label form-control opacity-6"
                           data-toggle="html-checkbox-premium-popover" data-placement="top" title="" data-content="content">
                        <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i>
                        <span class="opacity-6">
                           <?php esc_html_e('Enable chart loaders', 'wpdatatables'); ?>
                        </span>
                    </label>
                </div>
            </div>
        </div>
    </div>
</div>