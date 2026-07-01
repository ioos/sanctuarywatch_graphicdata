<?php defined('ABSPATH') or die('Access denied.');

$tables = \WDTTools::getTablesCount('table');
?>

<!-- .wdt-datatables-admin-wrap .wrap -->
<div class="wrap wdt-datatables-admin-wrap">
    <!-- Preloader -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
    <!-- /Preloader -->
    <!-- .container -->
    <div class="container wdt-getting-started">

        <!-- .row -->
        <div class="row">

            <div class="card card-head m-b-0">
                <?php wp_nonce_field('wdtGettingStartedNonce', 'wdtNonce'); ?>
                <div class="card-header wdt-admin-card-header ch-alt">
                    <img id="wpdt-inline-logo"
                         src="<?php echo WDT_ROOT_URL; ?>assets/img/logo.svg"/>
                    <h2>
                        <a href="<?php echo admin_url('admin.php?page=wpdatatables-dashboard'); ?>">
                            <i class="wpdt-icon-chevron-left"></i>
                        </a>
                        <span style="display: none">wpDataTables Getting Started</span>
                        <?php esc_html_e('Table and Charts tutorials', 'wpdatatables'); ?>
                    </h2>
                    <ul class="actions">
                        <li>
                            <button class="btn btn-default btn-icon-text wdt-documentation"
                                    data-doc-page="getting_started_page">
                                <i class="wpdt-icon-file-thin"></i>
                                <?php esc_html_e('View Documentation', 'wpdatatables'); ?>
                            </button>
                        </li>
                    </ul>
                </div>

            </div>

        </div>
        <!-- /.row -->
        <!-- .row -->
        <div class="row">
            <div class="col-sm-12 wdt-getting-started-block bg-white p-l-0 p-r-0">
                <div class="card wdt-getting-started-card m-b-0">

                    <div class="card-header wdt-admin-card-header">
                        <h5> <i class="wpdt-icon-g-cap m-r-10"></i><?php esc_html_e('Getting started: a crash course on wpDataTables basic tables and charts features', 'wpdatatables'); ?></h5>
                        <p><?php esc_html_e('Hi there. In order to make your acquaintance with wpDataTables smooth and easy, we created these short interactive tutorials for different basic features of wpDataTables. Choose the topic that you are interested in, and click ', 'wpdatatables'); ?><em><?php esc_html_e('"Launch tutorial"', 'wpdatatables'); ?></em><?php esc_html_e(' - it will then guide you through the process, making sure you do everything right. Additionally, you can check out our documentation and video database.', 'wpdatatables'); ?></p>

                    </div>
                    <div class="col-sm-6 card-columns p-r-12 p-l-0">
                        <div class="card wdt-tutorial-card m-b-18">
                            <div class="card-body wpdt-flex card-padding">
                                <div class="wdt-tutorial-img">
                                    <img src="<?php echo WDT_ASSETS_PATH ?>img/constructor/create-simple-table.svg">
                                </div>
                                <div class="wdt-tutorial-desc">
                                    <span class="d-block"><?php esc_html_e('Create a simple table from scratch:', 'wpdatatables'); ?><span class="f-400"><?php esc_html_e(' create a simple table with any data, merged cells, styling, star rating and a lot more.', 'wpdatatables'); ?></span></span>
                                    <a href="https://wpdatatables.com/documentation/creating-new-wpdatatables-with-table-constructor/creating-a-simple-table-with-wpdatatables/"
                                       target="_blank"><?php esc_html_e('View documentation', 'wpdatatables'); ?></a>
                                </div>
                                <div class="wdt-tutorial-button">
                                    <button class="btn btn-primary" id="wdt-tutorial-simple-table">
                                        <i class="wpdt-icon-play"></i>
                                        <?php esc_html_e('Launch tutorial', 'wpdatatables'); ?>
                                    </button>
                                </div>

                            </div>
                            <div class="clear"></div>
                        </div>
                        <div class="card wdt-tutorial-card m-b-18">
                            <div class="card-body wpdt-flex card-padding">
                                <div class="wdt-tutorial-img">
                                    <img src="<?php echo WDT_ASSETS_PATH ?>img/constructor/add-from-data-source.png">
                                </div>
                                <div class="wdt-tutorial-desc">
                                    <span class="d-block"><?php esc_html_e('Create a data table linked to an existing data source:', 'wpdatatables'); ?><span class="f-400"><?php esc_html_e(' create a wpDataTables based on your Excel, CSV file or other data source in a few steps.', 'wpdatatables'); ?></span></span>
                                    <a href="https://wpdatatables.com/documentation/general/features-overview/"
                                       target="_blank"><?php esc_html_e('View documentation', 'wpdatatables'); ?></a>
                                </div>
                                <div class="wdt-tutorial-button">
                                    <button class="btn btn-primary" id="wdt-tutorial-data-source">
                                        <i class="wpdt-icon-play"></i>
                                        <?php esc_html_e('Launch tutorial', 'wpdatatables'); ?>
                                    </button>
                                </div>

                            </div>
                            <div class="clear"></div>
                        </div>
                        <div class="card wdt-tutorial-card m-b-18">
                            <div class="card-body wpdt-flex card-padding">
                                <div class="wdt-tutorial-img">
                                    <img src="<?php echo WDT_ASSETS_PATH; ?>img/constructor/charts.png" alt="">
                                </div>
                                <?php if ($tables != 0) { ?>
                                    <div class="wdt-tutorial-desc">
                                        <span class="d-block"><?php esc_html_e('Create a chart:', 'wpdatatables'); ?><span class="f-400"><?php esc_html_e(' create dynamic charts in WordPress with Google Charts or Chart.js rendering engine.', 'wpdatatables'); ?></span></span>
                                        <a href="https://wpdatatables.com/documentation/wpdatacharts/creating-charts-wordpress-wpdatachart-wizard/"
                                           target="_blank"><?php esc_html_e('View documentation', 'wpdatatables'); ?></a>
                                    </div>
                                    <div class="wdt-tutorial-button">
                                        <button class="btn btn-primary" id="wdt-tutorial-create-charts">
                                            <i class="wpdt-icon-play"></i>
                                            <?php esc_html_e('Launch tutorial', 'wpdatatables'); ?>
                                        </button>
                                    </div>
                                <?php } else { ?>
                                    <div class="wdt-tutorial-desc">
                                        <span><?php esc_html_e('You dont have any table created. Please create a table first and then you will be able to create a chart.', 'wpdatatables'); ?></span>
                                    </div>
                                    <div class="wdt-tutorial-button">
                                        <button class="btn btn-primary" id="wdt-tutorial-create-charts" disabled>
                                            <i class="wpdt-icon-play"></i>
                                            <?php esc_html_e('Launch tutorial', 'wpdatatables'); ?>
                                        </button>
                                    </div>
                                <?php } ?>
                            </div>
                        </div>
                        <div class="card wdt-tutorial-card m-b-18">
                            <div class="card-body wpdt-flex card-padding">
                                <div class="wdt-tutorial-img">
                                    <img src="<?php echo WDT_ASSETS_PATH ?>img/constructor/manual.png">
                                </div>
                                <div class="wdt-tutorial-desc">
                                    <span class="d-block"><?php esc_html_e('Create a  data table manually:', 'wpdatatables'); ?><span class="f-400"><?php esc_html_e(' learn how to build a data table completely from the WordPress admin.', 'wpdatatables'); ?></span></span>
                                    <a class="wdt-premium"><?php esc_html_e('Available in Premium', 'wpdatatables'); ?></a>
                                    <a class="wdt-compare-link" href="<?php echo admin_url('admin.php?page=wpdatatables-lite-vs-premium'); ?>"><?php esc_html_e('Compare and View Pricing', 'wpdatatables'); ?></a>
                                </div>
                            </div>
                        </div>
                        <div class="card wdt-tutorial-card m-b-18">
                            <div class="card-body wpdt-flex card-padding">
                                <div class="wdt-tutorial-img">
                                    <img src="<?php echo WDT_ASSETS_PATH ?>img/constructor/import-data-from-data-source.png">
                                </div>
                                <div class="wdt-tutorial-desc">
                                    <span class="d-block"><?php esc_html_e('Create a data table by importing data from a data source:', 'wpdatatables'); ?><span class="f-400"><?php esc_html_e(' extract data from your existing table to be able to edit it from WordPress.', 'wpdatatables'); ?></span></span>
                                    <a class="wdt-premium"><?php esc_html_e('Available in Premium', 'wpdatatables'); ?></a>
                                        <a class="wdt-compare-link" href="<?php echo admin_url('admin.php?page=wpdatatables-lite-vs-premium'); ?>"><?php esc_html_e('Compare and View Pricing', 'wpdatatables'); ?></a>
                                </div>
                            </div>
                        </div>
                        <div class="card wdt-tutorial-card m-b-18">
                            <div class="card-body wpdt-flex card-padding">
                                <div class="wdt-tutorial-img">
                                    <img src="<?php echo WDT_ASSETS_PATH ?>img/constructor/generate-query-to-mysql-database.png">
                                </div>
                                <div class="wdt-tutorial-desc">
                                    <span class="d-block"><?php esc_html_e('Generate a query to the MySQL database:', 'wpdatatables'); ?><span class="f-400"><?php esc_html_e(' create a data table based on your DB data without having to learn SQL', 'wpdatatables'); ?> </span></span>
                                    <a class="wdt-premium"><?php esc_html_e('Available in Premium', 'wpdatatables'); ?></a>
                                    <a class="wdt-compare-link" href="<?php echo admin_url('admin.php?page=wpdatatables-lite-vs-premium'); ?>"><?php esc_html_e('Compare and View Pricing', 'wpdatatables'); ?></a>
                                </div>
                            </div>
                        </div>
                        <div class="card wdt-tutorial-card m-b-18">
                            <div class="card-body wpdt-flex card-padding">
                                <div class="wdt-tutorial-img">
                                    <img src="<?php echo WDT_ASSETS_PATH ?>img/constructor/generate-query-to-wordpress-database.png">
                                </div>
                                <div class="wdt-tutorial-desc">
                                    <span class="d-block"><?php esc_html_e('Generate a query to the WordPress database:', 'wpdatatables'); ?><span class="f-400"><?php esc_html_e(' create a data table based on your WP data (posts, meta, taxonomies)', 'wpdatatables'); ?></span></span>
                                    <a class="wdt-premium"><?php esc_html_e('Available in Premium', 'wpdatatables'); ?></a>
                                    <a class="wdt-compare-link" href="<?php echo admin_url('admin.php?page=wpdatatables-lite-vs-premium'); ?>"><?php esc_html_e('Compare and View Pricing', 'wpdatatables'); ?></a>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div class="col-sm-6 card-columns wdt-getting-started-img-section p-l-12 p-r-0"></div>
                </div>

            </div>

        </div>
        <!-- /.row -->

        <div class="row">
            <h6 class="text-center wdt-footer-title">
                <?php esc_html_e('Made by', 'wpdatatables'); ?>
                <a href="https://tmsproducts.io/?utm_source=lite&utm_medium=plugin&utm_campaign=wpdtlite" target="_blank">
                    <img src="<?php echo WDT_ASSETS_PATH; ?>img/TMS-Black.svg" alt="" style="width: 66px">
                </a>
            </h6>
            <ul class="wpdt-footer-links text-center">
                <li><a href="https://wpdatatables.com/?utm_source=lite&utm_medium=plugin&utm_campaign=wpdtlite" target="_blank">wpDataTables.com</a></li>
                <li>|</li>
                <li><a href="https://wpdatatables.com/documentation/general/features-overview/" target="_blank"> <?php esc_html_e('Documentation', 'wpdatatables'); ?></a>
                </li>
                <li>|</li>
                <li><a href="<?php echo admin_url('admin.php?page=wpdatatables-support'); ?>">
                        <?php esc_html_e('Support Center', 'wpdatatables'); ?></a></li>
            </ul>
        </div>
    </div>
    <!-- /.container -->

</div>
<!-- /.wdt-datatables-admin-wrap .wrap -->
