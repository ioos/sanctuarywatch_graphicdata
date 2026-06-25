<?php defined('ABSPATH') or die('Access denied.'); ?>

<div class="wrap wdt-datatables-admin-wrap">
    <?php do_action('wpdatatables_admin_before_addons'); ?>

    <!-- .container -->
    <div class="container">

        <!-- .row -->
        <div class="row">

            <div class="card wdt-addons">

                <!-- Preloader -->
                <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
                <!-- /Preloader -->

                <div class="card-header wdt-admin-card-header ch-alt">
                    <img id="wpdt-inline-logo"
                         src="<?php echo WDT_ROOT_URL; ?>assets/img/logo.svg"/>
                    <h2>
                        <span style="display: none">wpDataTables Addons</span>
                        <?php esc_html_e('Addons', 'wpdatatables'); ?>
                    </h2>

                </div>

                <div class="notice notice-info wpdt-bundles-notice">
                    <div id="wpdt-bundles-section">
                        <div id="wpdt-first-section">
                            <img class="wpdt-promo-logo" src="<?php echo WDT_ROOT_URL ?>assets/img/bundles/bundle_all_pricing.png" alt="">
                        </div>
                        <div id="wpdt-second-section">
                            <h2><strong>SAVE UP TO 60%</strong>
                                with our exclusive bundles!<br> Get more value for your money.<br>
                                <button id="wpdt-grab-it" onclick="window.open('https://wpdatatables.com/bundles/?utm_source=wpdt-lite&utm_medium=addons&utm_content=wpdt&utm_campaign=wpdt', '_blank')"> Get discount now!</button>
                            </h2>
                        </div>
                    </div>
                </div>

                <p class="wdt-addons-intro"><?php esc_html_e('While wpDataTables itself provides quite a large amount of features and unlimited customisation flexibility, you can achieve even more with our premium addons(except Forminator Forms integrations add-on which is FREE). Each addon brings you some unique extension to the core functionality. There will be more addons developed over time by wpDataTables creators and 3rd party developers, so stay tuned. Please note that addons requires Premium version of wpDataTables(except Forminator Froms integration which can be use with Lite version as well).', 'wpdatatables'); ?></p>

                <div class="card-body card-padding wpdt-add-ons-card">

                    <div class="row">

                        <div class="col-sm-4">
                            <div class="thumbnail">
                                <div class="ribbon"><span><?php esc_html_e('NEW', 'wpdatatables'); ?></span></div>
                                <div class="wpdt-addons-desc">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH; ?>img/addons/forminator-forms-logo.png" alt="">
                                    <h4><?php esc_html_e('Forminator Forms integration for wpDataTables', 'wpdatatables'); ?></h4>
                                </div>
                                <div class="caption">
                                    <p><?php esc_html_e('A powerful tool that adds “Forminator Form” as a new table type in wpDataTables and allows you to create responsive, sortable tables & charts based on Forminator Forms submissions.', 'wpdatatables'); ?></p>
                                </div>
                                <?php if (!defined('WDT_FRF_ROOT_PATH')) { ?>
                                    <div class="wdt-addons-links">
                                        <a href="https://downloads.wordpress.org/plugin/wpdatatables-forminator.zip" class="free-download btn btn-primary">
                                            <?php esc_html_e('Free Download', 'wpdatatables'); ?>
                                            <i class="wpdt-icon-file-download m-l-5"></i>
                                        </a>
                                        <a href="https://wordpress.org/plugins/wpdatatables-forminator/"
                                           target="_blank"
                                           class="btn btn-sm btn-icon-text btn-primary"
                                           role="button">
                                            <?php esc_html_e('Learn more', 'wpdatatables'); ?><i
                                                    class="wpdt-icon-external-link-square-alt m-l-10"></i>
                                        </a>
                                        <div class="clear"></div>

                                    </div>
                                <?php } else { ?>
                                    <div class="wdt-addons-links text-center">
                                        <button class="wdt-plugin-installed btn btn-icon-text btn-primary">
                                            <i class="wpdt-icon-check-full m-r-5"></i>
                                            <?php esc_html_e('Installed', 'wpdatatables'); ?>
                                        </button>
                                        <div class="clear"></div>
                                    </div>
                                <?php } ?>

                            </div>
                        </div>

                        <div class="col-sm-4">
                            <div class="thumbnail">
                                <div class="ribbon"><span><?php esc_html_e('NEW', 'wpdatatables'); ?></span></div>
                                <div class="wpdt-addons-desc">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH; ?>img/addons/master-detail-logo.png" alt="">
                                    <h4><?php esc_html_e('Master Detail Tables for wpDataTables', 'wpdatatables'); ?></h4>
                                </div>
                                <div class="caption">
                                    <p><?php esc_html_e('A wpDataTables addon which allows showing additional details for a specific row in a popup or a separate page or post. Handy when you would like to keep fewer columns in the table, while allowing user to access full details of particular entries.', 'wpdatatables'); ?></p>
                                </div>
                                <div class="wdt-addons-links">
                                    <a href="https://wpdatatables.com/documentation/addons/master-detail-tables/?utm_source=wpdt-lite&utm_medium=addons&utm_content=wpdt&utm_campaign=wpdt"
                                       target="_blank"
                                       class="btn btn-sm btn-icon-text btn-primary"
                                       role="button">
                                        <?php esc_html_e('Learn more', 'wpdatatables'); ?><i
                                                class="wpdt-icon-external-link-square-alt m-l-10"></i>
                                    </a>
                                    <div class="clear"></div>

                                </div>
                            </div>
                        </div>

                        <div class="col-sm-4">
                            <div class="thumbnail">
                                <div class="ribbon"><span><?php esc_html_e('NEW', 'wpdatatables'); ?></span></div>
                                <div class="wpdt-addons-desc">

                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH; ?>img/addons/powerful-filters-logo.png"
                                         alt="">
                                    <h4><?php esc_html_e('Powerful Filters for wpDataTables', 'wpdatatables'); ?></h4>
                                </div>
                                <div class="caption">
                                    <p><?php esc_html_e('An add-on for wpDataTables that provides powerful filtering features: cascade filtering, applying filters on button click, show only filter without the table before user defines the search values.', 'wpdatatables'); ?></p>
                                </div>
                                <div class="wdt-addons-links">
                                    <a href="https://wpdatatables.com/documentation/addons/powerful-filtering/?utm_source=wpdt-lite&utm_medium=addons&utm_content=wpdt&utm_campaign=wpdt"
                                       target="_blank"
                                       class="btn btn-sm btn-icon-text btn-primary"
                                       role="button">
                                        <?php esc_html_e('Learn more', 'wpdatatables'); ?><i
                                                class="wpdt-icon-external-link-square-alt m-l-10"></i>
                                    </a>
                                    <div class="clear"></div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div class="row">

                        <div class="col-sm-4">
                            <div class="thumbnail">
                                <div class="wpdt-addons-desc">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH; ?>img/addons/report-builder-logo.png" alt="">
                                    <h4><?php esc_html_e('Report Builder', 'wpdatatables'); ?></h4>
                                </div>
                                <div class="caption">
                                    <p><?php esc_html_e('A unique tool that allows you to generate almost any Word DOCX and Excel XLSX documents filled in with actual data from your database.', 'wpdatatables'); ?></p>
                                </div>
                                <div class="wdt-addons-links">
                                    <a href="http://wpreportbuilder.com?utm_source=wpdt" target="_blank"
                                       class="btn btn-sm btn-icon-text btn-primary"
                                       role="button">
                                        <?php esc_html_e('Learn more', 'wpdatatables'); ?><i
                                                class="wpdt-icon-external-link-square-alt m-l-10"></i>
                                    </a>
                                    <div class="clear"></div>
                                </div>
                            </div>
                        </div>

                        <div class="col-sm-4">
                            <div class="thumbnail">
                                <div class="wpdt-addons-desc">
                                    <img class="img-responsive wdt-formidable-img"
                                         src="<?php echo WDT_ASSETS_PATH; ?>img/addons/formidable-forms-logo.png"
                                         alt="">

                                    <h4><?php esc_html_e('Formidable Forms integration for wpDataTables', 'wpdatatables'); ?></h4>
                                </div>
                                <div class="caption">
                                    <p><?php esc_html_e('Tool that adds "Formidable Form" as a new table type and allows you to create wpDataTables from Formidable Forms entries data.', 'wpdatatables'); ?></p>
                                </div>
                                <div class="wdt-addons-links">
                                    <a href="https://wpdatatables.com/documentation/addons/formidable-forms-integration/?utm_source=wpdt-lite&utm_medium=addons&utm_content=wpdt&utm_campaign=wpdt"
                                       target="_blank"
                                       class="btn btn-sm btn-icon-text btn-primary"
                                       role="button">
                                        <?php esc_html_e('Learn more', 'wpdatatables'); ?><i class="wpdt-icon-external-link-square-alt m-l-10"></i>
                                    </a>
                                    <div class="clear"></div>
                                </div>
                            </div>
                        </div>

                        <div class="col-sm-4">
                            <div class="thumbnail">
                                <div class="wpdt-addons-desc">
                                    <img class="img-responsive wdt-gravity-img"
                                         src="<?php echo WDT_ASSETS_PATH; ?>img/addons/gravity-forms-logo.png" alt="">
                                    <h4><?php esc_html_e('Gravity Forms integration for wpDataTables', 'wpdatatables'); ?></h4>
                                </div>
                                <div class="caption">
                                    <p><?php esc_html_e('Tool that adds "Gravity Form" as a new table type and allows you to create wpDataTables from Gravity Forms entries data.', 'wpdatatables'); ?></p>
                                </div>
                                <div class="wdt-addons-links">
                                    <a href="https://wpdatatables.com/documentation/addons/gravity-forms-integration/?utm_source=wpdt-lite&utm_medium=addons&utm_content=wpdt&utm_campaign=wpdt"
                                       target="_blank"
                                       class="btn btn-sm btn-icon-text btn-primary"
                                       role="button">
                                        <?php esc_html_e('Learn more', 'wpdatatables'); ?><i
                                                class="wpdt-icon-external-link-square-alt m-l-10"></i>
                                    </a>
                                    <div class="clear"></div>
                                </div>
                            </div>
                        </div>

                    </div>
                    <!-- /.row -->
                </div>
            </div>
            <!-- /.row -->
        </div>

    </div>
    <!-- /.container -->

</div>
<!-- /.wdt-datatables-admin-wrap .wrap -->
