<?php defined('ABSPATH') or die('Access denied.'); ?>
<!-- .wdt-datatables-admin-wrap .wrap -->
<div class="wrap wdt-datatables-admin-wrap">
    <?php do_action('wpdatatables_admin_before_settings'); ?>
    <!-- Preloader -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
    <!-- /Preloader -->
    <!-- .welcome-page-container -->
    <div class="welcome-page-container">
        <!-- .row -->
        <div class="row">
            <!-- .welcome-page-card -->
            <div class="card welcome-page-card m-b-0">

                <!-- .card-header .wdt-admin-card-header-->
                <div class="card-header wdt-admin-card-header ch-alt">
                    <img class="img-responsive wdt-logo"
                         src="<?php echo WDT_ROOT_URL; ?>assets/img/welcome-page/iconLogo.svg"/>
                    <h2>
                        <span style="display: none">wpDataTables Welcome page</span>
                    </h2>
                    <ul class="actions">
                        <li class="m-0 p-0">
                            <button class="wdt-go-dashboard"><a
                                        href="<?php echo admin_url('admin.php?page=wpdatatables-dashboard'); ?>">
                                    <?php esc_html_e('Go to Dashboard', 'wpdatatables'); ?><i class="wpdt-icon-arrow-right"></i>
                                </a>
                            </button>
                        </li>
                    </ul>
                </div>
                <!-- /.card-header .wdt-admin-card-header-->

                <!-- .card-body-->
                <div class="card-body">

                    <!-- .wdt-welcome-header-->
                    <div class="wdt-welcome-header">
                        <div class="row m-0">
                            <div class="col-sm-3 p-0">
                                <img class="img-responsive"
                                     src="<?php echo WDT_ROOT_URL; ?>assets/img/welcome-page/iconManLeft.svg" alt="">
                            </div>
                            <div class="col-sm-6 text-center wdt-welcome-message">
                                <h1 class="m-t-0 p-t-0 p-b-0">
                                    <img class="wdt-wave" src="<?php echo WDT_ASSETS_PATH; ?>img/wave.png"
                                         style="width: 32px;height: 32px;">
                                    <?php esc_html_e('Welcome to wpDataTables!', 'wpdatatables'); ?>
                                </h1>
                                <h2>
                                    <?php esc_html_e('The Best Tables & Charts WordPress Plugin', 'wpdatatables'); ?>
                                </h2>
                                <p>
                                    <?php echo sprintf(esc_html__('wpDataTables is a best-selling WordPress table plugin which makes your work with tables, charts and data management easy. %s companies.', 'wpdatatables'), WDT_NUMBER_OF_ACTIVE_INSTALLS); ?>
                                </p>
                                <div class="wdt-changelog-button">
                                    <div class="wdt-changelog-button-background">
                                        <span>  <?php esc_html_e('Version ', 'wpdatatables'); ?></span>
                                        <span class="font-weight-bold">  <?php echo WDT_CURRENT_VERSION . " - "; ?></span>
                                        <a href="https://wordpress.org/plugins/wpdatatables/#developers"
                                           target="_blank">
                                            <?php esc_html_e('View changelog', 'wpdatatables'); ?>
                                        </a>
                                    </div>
                                </div>
                            </div>
                            <div class="col-sm-3 p-0 text-right">
                                <img class="img-responsive"
                                     src="<?php echo WDT_ROOT_URL; ?>assets/img/welcome-page/iconGirlRight.svg" alt="">
                            </div>
                        </div>
                    </div>
                    <!-- /.wdt-welcome-header-->

                    <!-- .wdt-welcome-body-->
                    <div class="wdt-welcome-body">
                        <!-- .wdt-wizard-options-->
                        <div class="row m-l-0 m-r-0 wdt-wizard-options m-b-38">
                            <div class="col-sm-4 p-0 wdt-wizard-options-details">
                                <div class="wdt-wizard-options-img pull-left">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH ?>img/constructor/create-simple-table.png">
                                </div>
                                <div class="wdt-wizard-options-desc pull-left">
                                    <span class="text-left"><?php esc_html_e('Create Simple tables', 'wpdatatables'); ?>.</span>
                                    <span class="wdt-lite"> <?php esc_html_e('Available in Lite ', 'wpdatatables'); ?></span>
                                </div>
                                <div class="clear"></div>
                            </div>
                            <div class="col-sm-4 p-0 wdt-wizard-options-details">
                                <div class="wdt-wizard-options-img pull-left">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH ?>img/constructor/add-from-data-source.png">
                                </div>
                                <div class="wdt-wizard-options-desc pull-left">
                                    <span class="text-left"><?php esc_html_e('Create a data table linked to an existing data source', 'wpdatatables'); ?>.</span>
                                    <span class="wdt-lite"> <?php esc_html_e('Available in Lite ', 'wpdatatables'); ?></span>
                                </div>
                                <div class="clear"></div>
                            </div>
                            <div class="col-sm-4 p-0 wdt-wizard-options-details">
                                <div class="wdt-wizard-options-img pull-left">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH ?>img/constructor/chartJsLite.png">
                                </div>
                                <div class="wdt-wizard-options-desc pull-left">
                                    <span class="text-left"><?php esc_html_e('Create charts with Google Charts and Chart.js', 'wpdatatables'); ?>.</span>
                                    <span class="wdt-lite"> <?php esc_html_e('Available in Lite ', 'wpdatatables'); ?></span>
                                </div>
                                <div class="clear"></div>
                            </div>
                        </div>
                        <div class="clear"></div>
                        <!--/ .wdt-wizard-options-->

                        <!-- .wdt-wizard-options-->
                        <div class="row m-l-0 m-r-0 wdt-wizard-options m-b-42">
                            <div class="col-sm-4 p-0 wdt-wizard-options-details">
                                <div class="wdt-wizard-options-img pull-left">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH ?>img/constructor/manual.png">
                                </div>
                                <div class="wdt-wizard-options-desc pull-left">
                                    <span class="text-left"><?php esc_html_e('Create a data table manually', 'wpdatatables'); ?>.</span>
                                    <span class="wdt-premium"> <?php esc_html_e('Available in Premium ', 'wpdatatables'); ?></span>
                                </div>
                                <div class="clear"></div>
                            </div>
                            <div class="col-sm-4 p-0 wdt-wizard-options-details">
                                <div class="wdt-wizard-options-img pull-left">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH ?>img/constructor/import-data-from-data-source.png">
                                </div>
                                <div class="wdt-wizard-options-desc pull-left">
                                    <span class="text-left"><?php esc_html_e('Create a data table by importing data from a data source', 'wpdatatables'); ?>.</span>
                                    <span class="wdt-premium"> <?php esc_html_e('Available in Premium ', 'wpdatatables'); ?></span>
                                </div>
                                <div class="clear"></div>
                            </div>
                            <div class="col-sm-4 p-0 wdt-wizard-options-details">
                                <div class="wdt-wizard-options-img pull-left">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH ?>img/constructor/generate-query-to-wordpress-database.png">
                                </div>
                                <div class="wdt-wizard-options-desc pull-left">
                                    <span class="text-left"><?php esc_html_e('Generate a query to the WordPress database', 'wpdatatables'); ?>.</span>
                                    <span class="wdt-premium"> <?php esc_html_e('Available in Premium ', 'wpdatatables'); ?></span>
                                </div>
                                <div class="clear"></div>
                            </div>
                        </div>
                        <div class="clear"></div>
                        <!-- /.wdt-wizard-options-->

                        <!-- .wdt-wizard-options-->
                        <div class="row m-l-0 m-r-0 wdt-wizard-options m-b-42">
                            <div class="col-sm-4 p-0 wdt-wizard-options-details">
                                <div class="wdt-wizard-options-img pull-left">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH ?>img/constructor/generate-query-to-mysql-database.png">
                                </div>
                                <div class="wdt-wizard-options-desc pull-left">
                                    <span class="text-left"><?php esc_html_e('Generate a query to the MySQL database', 'wpdatatables'); ?>.</span>
                                    <span class="wdt-premium"> <?php esc_html_e('Available in Premium ', 'wpdatatables'); ?></span>
                                </div>
                                <div class="clear"></div>
                            </div>
                            <div class="col-sm-4 p-0 wdt-wizard-options-details">
                                <div class="wdt-wizard-options-img pull-left">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH ?>img/constructor/wpPostLite.png">
                                </div>
                                <div class="wdt-wizard-options-desc pull-left">
                                    <span class="text-left"><strong style="color: #FD800C;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></strong><?php esc_html_e(' Build tables with custom post types, Meta and ACF', 'wpdatatables'); ?>.</span>
                                    <span class="wdt-premium"> <?php esc_html_e('Available in Premium ', 'wpdatatables'); ?></span>
                                </div>
                                <div class="clear"></div>
                            </div>
                            <div class="col-sm-4 p-0 wdt-wizard-options-details">
                                <div class="wdt-wizard-options-img pull-left">
                                    <img class="img-responsive"
                                         src="<?php echo WDT_ASSETS_PATH ?>img/constructor/wooLite.png">
                                </div>
                                <div class="wdt-wizard-options-desc pull-left">
                                    <span class="text-left"><strong style="color: #FD800C;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></strong><?php esc_html_e(' Create WooCommerce product table', 'wpdatatables'); ?>.</span>
                                    <span class="wdt-premium"> <?php esc_html_e('Available in Premium ', 'wpdatatables'); ?></span>
                                </div>
                                <div class="clear"></div>
                            </div>
                        </div>
                        <div class="clear"></div>
                        <!-- /.wdt-wizard-options-->

                        <!-- .wdt-getting-started-->
                        <div class="row m-0 wdt-getting-started">
                            <div class="col-sm-12 p-l-0 p-r-0 wdt-getting-started-desc">
                                <h2>
                                    <?php esc_html_e('Getting started with your first table and chart', 'wpdatatables'); ?>
                                </h2>
                                <p>
                                    <?php esc_html_e('By following the step-by-step instructions in the walkthrough, you can easily publish your first table or chart on your website.', 'wpdatatables'); ?>
                                </p>
                            </div>
                        </div>
                        <!-- /.wdt-getting-started-->

                        <!-- .wdt-getting-started-sections-->
                        <div class="row m-l-0 m-r-0 wdt-getting-started-sections">
                            <div class="col-sm-4 wdt-getting-started-section">
                                <h4>
                                    <i class="wpdt-icon-magic-stick"></i>
                                    <?php esc_html_e('Table and chart wizard', 'wpdatatables'); ?>
                                </h4>
                                <p>
                                    <?php esc_html_e('Through several different tutorials we will show you how to create your first table and chart.', 'wpdatatables'); ?>
                                </p>
                                <button class="wdt-start-creating"><a
                                            href="<?php echo admin_url('admin.php?page=wpdatatables-getting-started'); ?>">
                                        <?php esc_html_e('Start creating', 'wpdatatables'); ?>
                                    </a>
                                </button>
                            </div>
                            <div class="col-sm-4 wdt-getting-started-section">
                                <h4>
                                    <i class="wpdt-icon-question-square"></i>
                                    <?php esc_html_e('FAQ', 'wpdatatables'); ?>
                                </h4>
                                <p>
                                    <?php esc_html_e('Check out our FAQ section to find the answers to the popular questions about plugin functionality and many more.', 'wpdatatables'); ?>

                                </p>
                                <button class="wdt-start-creating"><a
                                            href="https://wpdatatables.com/help/faq/" target="_blank">
                                        <?php esc_html_e('View FAQ', 'wpdatatables'); ?>
                                    </a>
                                </button>
                            </div>
                            <div class="col-sm-4 wdt-getting-started-section">
                                <h4>
                                    <i class="wpdt-icon-book path1 path2"></i>
                                    <?php esc_html_e('Documentation', 'wpdatatables'); ?>
                                </h4>
                                <p>
                                    <?php esc_html_e('If you need a detailed video and text explanation about every feature in our plugin, check out our Documentation.', 'wpdatatables'); ?>

                                </p>
                                <button class="wdt-start-creating"><a
                                            href="https://wpdatatables.com/documentation/general/features-overview/"
                                            target="_blank">
                                        <?php esc_html_e('View Documentation', 'wpdatatables'); ?>
                                    </a>
                                </button>
                            </div>
                        </div>
                        <!-- /.wdt-getting-started-sections-->

                        <!-- .wdt-showcase-->
                        <div class="row m-l-0 m-r-0 wdt-showcase">
                            <div class="col-sm-6 p-0 wdt-showcase-desc">
                                <div class="wdt-abs-top-center">
                                    <h2> <?php esc_html_e('Check wpDataTables showcase', 'wpdatatables'); ?></h2>
                                    <p class="wpdt-bold m-0">
                                        <?php esc_html_e('A proper solution for every industry', 'wpdatatables'); ?>
                                    </p>
                                    <p class="w-80">
                                        <?php esc_html_e('See how our clients use wpDataTables in completely different spheres like business, science, education and non-profit organization.', 'wpdatatables'); ?>
                                    </p>
                                    <button class="wdt-showcase-link"><a
                                                href="https://wpdatatables.com/showcase/" target="_blank">
                                            <?php esc_html_e('View all at wpdatatables.com', 'wpdatatables'); ?><i
                                                    class="wpdt-icon-external-link-square"></i>
                                        </a>
                                    </button>
                                </div>
                            </div>
                            <div class="col-sm-6 wdt-showcase-slider">
                                <div id="wdt-showcase-carousel" class="carousel slide" data-ride="carousel">
                                    <!-- Wrapper for slides -->
                                    <div class="carousel-inner" role="listbox">

                                        <div class="item active">
                                            <img width="400"
                                                 src="<?php echo WDT_ROOT_URL; ?>assets/img/welcome-page/slider/showcase-statistics.png"
                                                 alt="">
                                            <div class="wdt-slider-img-desc text-center">
                                                <h3><?php esc_html_e('Statistics Table With Charts', 'wpdatatables'); ?></h3>
                                                <p><?php esc_html_e('Statistics market', 'wpdatatables'); ?></p>
                                            </div>
                                        </div>

                                        <div class="item">
                                            <img width="400"
                                                 src="<?php echo WDT_ROOT_URL; ?>assets/img/welcome-page/slider/showcase-crypto.png"
                                                 alt="">
                                            <div class="wdt-slider-img-desc text-center">
                                                <h3><?php esc_html_e('Cryptocurrencies Rank Table', 'wpdatatables'); ?></h3>
                                                <p><?php esc_html_e('Cryptocurrency market', 'wpdatatables'); ?></p>
                                            </div>
                                        </div>

                                        <div class="item">
                                            <img width="400"
                                                 src="<?php echo WDT_ROOT_URL; ?>assets/img/welcome-page/slider/showcase-product.png"
                                                 alt="">
                                            <div class="wdt-slider-img-desc text-center">
                                                <h3><?php esc_html_e('Laptop Online Catalog', 'wpdatatables'); ?></h3>
                                                <p><?php esc_html_e('Computer sales', 'wpdatatables'); ?></p>
                                            </div>
                                        </div>

                                        <div class="item">
                                            <img width="400"
                                                 src="<?php echo WDT_ROOT_URL; ?>assets/img/welcome-page/slider/showcase-temperature-summer.png"
                                                 alt="">
                                            <div class="wdt-slider-img-desc text-center">
                                                <h3><?php esc_html_e('Temperature Report - Maximums', 'wpdatatables'); ?></h3>
                                                <p><?php esc_html_e('Hydrometeorological Institute', 'wpdatatables'); ?></p>
                                            </div>
                                        </div>

                                    </div>

                                    <!-- Left and right controls -->
                                    <a class="left carousel-control" href="#wdt-showcase-carousel" role="button"
                                       data-slide="prev">
                                        <i class="wpdt-icon-chevron-left"></i>
                                        <span class="sr-only">Previous</span>
                                    </a>
                                    <a class="right carousel-control" href="#wdt-showcase-carousel" role="button"
                                       data-slide="next">
                                        <i class="wpdt-icon-chevron-right"></i>
                                        <span class="sr-only">Next</span>
                                    </a>
                                </div>
                            </div>
                        </div>
                        <!-- /.wdt-showcase-->

                    </div>
                    <!-- /.wdt-welcome-body-->

                    <!-- .wdt-welcome-footer-->
                    <div class="wdt-welcome-footer">
                        <div class="row m-0">
                            <div class="col-sm-12 text-center">
                                <h2>
                                    <i class="wpdt-icon-heart"></i>
                                    <?php esc_html_e('Thank you for choosing wpDataTables!', 'wpdatatables'); ?>
                                </h2>
                                <p>
                                    <?php esc_html_e('We hope that you will enjoy using our plugin for managing data on your website.', 'wpdatatables'); ?>
                                </p>
                                <button class="wdt-go-dashboard"><a
                                            href="<?php echo admin_url('admin.php?page=wpdatatables-dashboard'); ?>">
                                        <?php esc_html_e('Go to Dashboard', 'wpdatatables'); ?><i
                                                class="wpdt-icon-arrow-right"></i>
                                    </a>
                                </button>
                                <img class="img-responsive"
                                     src="<?php echo WDT_ROOT_URL; ?>assets/img/welcome-page/iconHeart.svg" alt="">
                            </div>
                        </div>
                    </div>
                    <!-- /.wdt-welcome-footer-->

                </div>
                <!-- /.card-body-->


            </div>
            <!-- /.welcome-page-card -->
        </div>
        <!-- /.row -->


    </div>
    <!-- /.welcome-page-container -->
    <div class="row">
        <h6 class="text-center wdt-footer-title">
            <?php esc_html_e('Made by', 'wpdatatables'); ?>
            <a href="https://tmsproducts.io/?utm_source=lite&utm_medium=plugin&utm_campaign=wpdtlite"
               target="_blank">
                <img src="<?php echo WDT_ASSETS_PATH; ?>img/TMS-Black.svg" alt="" style="width: 66px">
            </a>
        </h6>
        <ul class="wpdt-footer-links text-center">
            <li><a href="https://wpdatatables.com/?utm_source=lite&utm_medium=plugin&utm_campaign=wpdtlite"
                   target="_blank">wpDataTables.com</a></li>
            <li>|</li>
            <li><a href="https://wpdatatables.com/documentation/general/features-overview/"
                   target="_blank"> <?php esc_html_e('Documentation', 'wpdatatables'); ?></a>
            </li>
            <li>|</li>
            <li><a href="<?php echo admin_url('admin.php?page=wpdatatables-support'); ?>">
                    <?php esc_html_e('Support Center', 'wpdatatables'); ?></a></li>
        </ul>
    </div>

</div>
<!-- /.wdt-datatables-admin-wrap .wrap -->


