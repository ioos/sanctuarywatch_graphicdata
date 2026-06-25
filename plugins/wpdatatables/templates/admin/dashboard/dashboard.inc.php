<?php defined('ABSPATH') or die('Access denied.'); ?>
<?php
$tableCount = (int)WDTTools::getTablesCount('table');
$tableChartsCount = (int)WDTTools::getTablesCount('chart');
?>
<!-- .wdt-datatables-admin-wrap .wrap -->
<div class="wrap wdt-datatables-admin-wrap">
    <?php do_action('wpdatatables_admin_before_dashboard'); ?>

    <!-- .container -->
    <div class="container wdt-dashbord">

        <!-- .row -->
        <div class="row">

            <div class="card plugin-dashboard">
                <?php wp_nonce_field('wdtDashboardNonce', 'wdtNonce'); ?>
                <div class="card-header wdt-admin-card-header ch-alt">
                    <img id="wpdt-inline-logo"
                         src="<?php echo WDT_ROOT_URL; ?>assets/img/logo.svg"/>
                    <h2>
                        <span style="display: none">wpDataTables Dashboard</span>
                        <?php esc_html_e('Dashboard', 'wpdatatables'); ?>
                    </h2>
                    <ul class="actions">
                        <li>
                            <button class="btn btn-default btn-icon-text wdt-documentation"
                                    data-doc-page="dashboard_page">
                                <i class="wpdt-icon-file-thin"></i>
                                <?php esc_html_e('View Documentation', 'wpdatatables'); ?>
                            </button>
                        </li>
                    </ul>
                </div>
            </div>

        </div>
        <!-- /.row -->
        <div class="row">
            <div class="col-sm-12 p-l-0 p-r-0">
                <div class="card wdt-welcome-card">
                    <div class="card-body card-padding">
                        <div class="col-sm-7 pull-left p-l-20 p-t-20 p-b-20">
                            <h1 class="p-0 m-t-0 m-b-4">
                                <?php esc_html_e('Welcome to wpDataTables ', 'wpdatatables'); ?>
                                <sup> <?php esc_html_e('Lite version ', 'wpdatatables'); ?></sup>
                            </h1>
                            <p class="wpdt-text wpdt-font">   <?php esc_html_e('Congratulations! You are about to use the most powerful WordPress table plugin -  wpDataTables is designed to make the process of data representation and interaction quick, easy and effective.', 'wpdatatables'); ?></p>
                            <?php if ($tableCount > 10) { ?>
                                <a href="<?php echo admin_url('admin.php?page=wpdatatables-constructor'); ?>"
                                   class="btn btn-primary">
                                    <i class="wpdt-icon-table"></i>
                                    <?php esc_html_e('Create a Table', 'wpdatatables'); ?></a>
                                <a href="<?php echo admin_url('admin.php?page=wpdatatables-chart-wizard'); ?>"
                                   class="btn btn-primary">
                                    <i class="wpdt-icon-chart-line"></i>
                                    <?php esc_html_e('Create a Chart', 'wpdatatables'); ?></a>

                                <?php if (get_option('wdtGettingStartedPageStatus') != 1) { ?>
                                    <a href="<?php echo admin_url('admin.php?page=wpdatatables-getting-started'); ?>"
                                       class="wdt-link-tutorials">
                                        <?php esc_html_e('I need help, show me tutorials', 'wpdatatables'); ?></a>
                                <?php } ?>
                            <?php } else { ?>
                                <a href="<?php echo admin_url('admin.php?page=wpdatatables-getting-started'); ?>"
                                   class="btn btn-primary">
                                    <i class="wpdt-icon-question"></i>
                                    <?php esc_html_e('Learn how to create table and charts', 'wpdatatables'); ?></a>
                                <span class="d-block"><?php esc_html_e('Or skip tutorials and', 'wpdatatables'); ?>
                                <a href="<?php echo admin_url('admin.php?page=wpdatatables-constructor'); ?>"
                                   class="wdt-link-tutorials-inline">
                                    <?php esc_html_e('Create a table', 'wpdatatables'); ?></a>
                                <?php esc_html_e('or', 'wpdatatables'); ?>
                                <a href="<?php echo admin_url('admin.php?page=wpdatatables-chart-wizard'); ?>"
                                   class="wdt-link-tutorials-inline">
                                    <?php esc_html_e('Create a chart', 'wpdatatables'); ?></a>
                                    </span>
                            <?php } ?>

                        </div>
                        <div class="col-sm-5 pull-right text-right">
                            <img class="img-responsive wdt-welcome-img"
                                 src="<?php echo WDT_ASSETS_PATH; ?>img/dashboard/dashboard-welcome.svg"
                                 alt="Welcome message">
                        </div>
                        <div class="clear"></div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-6 card-columns p-r-12 p-l-0">
                <div class="card wdt-table-card">
                    <div class="card-header">
                        <div class="wdt-card-header-title">
                            <i class="wpdt-icon-table"></i>
                            <?php esc_html_e('Tables', 'wpdatatables'); ?>
                        </div>
                        <ul class="actions">
                            <li>
                                <button class="wdt-card-header-button">
                                    <?php if ($tableCount == 0) {
                                        ?>
                                        <a href="<?php echo admin_url('admin.php?page=wpdatatables-constructor'); ?>">
                                            <?php esc_html_e('Create Table', 'wpdatatables'); ?>
                                        </a>
                                    <?php } else { ?>
                                        <a href="<?php echo admin_url('admin.php?page=wpdatatables-administration'); ?>">
                                            <?php esc_html_e('Browse all tables', 'wpdatatables'); ?>
                                        </a>
                                    <?php } ?>
                                </button>
                            </li>
                        </ul>
                    </div>

                    <?php if ($tableCount == 0) { ?>
                        <div class="card-body wpdt-flex card-padding wdt-empty">
                            <div class="wdt-table-count text-center">
                                <span class="wdt-table-count-number"> <?php echo $tableCount; ?></span>
                                <p><?php esc_html_e('Created', 'wpdatatables'); ?></p>
                            </div>
                            <div class="wdt-table-message">
                                <p><?php esc_html_e('You have no tables created.', 'wpdatatables'); ?></p>
                                <?php if (get_option('wdtGettingStartedPageStatus') != 1) { ?>
                                    <a href="<?php echo admin_url('admin.php?page=wpdatatables-tutorials'); ?>">
                                        <?php esc_html_e('View tutorials', 'wpdatatables'); ?>
                                    </a>
                                <?php } ?>
                            </div>
                            <div class="clear"></div>
                        </div>
                    <?php } else {
                        $lastTableData = WDTTools::getLastTableData('table');
                        $tableType = WDTTools::getConvertedTableType($lastTableData->table_type);
                        $simpleType = $lastTableData->table_type == 'simple' ? '&simple': '';
                        $ivyType = $lastTableData->table_type == 'ivyforms' ? '=ivyforms': '';

                        ?>
                        <div class="card-body wpdt-flex card-padding">
                            <div class="wdt-table-count text-center">
                                <span class="wdt-table-count-number"><a href="<?php echo admin_url('admin.php?page=wpdatatables-administration'); ?>"> <?php echo $tableCount; ?></a></span>
                                <p><?php esc_html_e('Created', 'wpdatatables'); ?></p>
                            </div>
                            <div class="wdt-table-last-created">
                                <a href="admin.php?page=wpdatatables-constructor&source<?php echo $simpleType . $ivyType ?>&table_id=<?php echo (int)$lastTableData->id; ?>"
                                   class="wdt-table-link">
                                    <?php echo esc_html($lastTableData->title) ?>
                                </a>
                                <span class="wdt-table-type"><?php echo esc_html($tableType); ?></span>
                                <div id="wpdt-shortcode-container" class="pull-right">
                                    <a class="wdt-copy-shortcode" data-toggle="tooltip" data-shortcode-type="last-table"
                                       data-placement="top" title=""
                                       data-original-title="<?php esc_attr_e('Click to copy shortcode', 'wpdatatables'); ?>">
                                        <i class="wpdt-icon-copy"></i>
                                    </a>
                                    <span id="wdt-last-table-shortcode-id">[wpdatatable id=<?php echo (int)$lastTableData->id; ?>]</span>
                                </div>
                                <p><?php esc_html_e('Latest table created.', 'wpdatatables'); ?></p>
                                <div class="clear"></div>
                            </div>
                        </div>
                    <?php } ?>

                </div>
                <div class="card wdt-chart-card">
                    <div class="card-header">
                        <div class="wdt-card-header-title">
                            <i class="wpdt-icon-chart-line"></i>
                            <?php esc_html_e('Charts', 'wpdatatables'); ?>
                        </div>
                        <ul class="actions">
                            <li>
                                <button class="wdt-card-header-button">
                                    <?php if ($tableChartsCount == 0) {
                                        ?>
                                        <a href="<?php echo admin_url('admin.php?page=wpdatatables-chart-wizard'); ?>">
                                            <?php esc_html_e('Create a Chart', 'wpdatatables'); ?>
                                        </a>
                                    <?php } else { ?>
                                        <a href="<?php echo admin_url('admin.php?page=wpdatatables-charts'); ?>">
                                            <?php esc_html_e('Browse all charts', 'wpdatatables'); ?>
                                        </a>
                                    <?php } ?>
                                </button>
                            </li>
                        </ul>
                    </div>

                    <?php if ($tableChartsCount == 0) { ?>
                        <div class="card-body wpdt-flex card-padding wdt-empty">
                            <div class="wdt-chart-count text-center">
                                <span class="wdt-chart-count-number"> <?php echo $tableChartsCount; ?></span>
                                <p><?php esc_html_e('Created', 'wpdatatables'); ?></p>
                            </div>
                            <div class="wdt-chart-message">
                                <p><?php esc_html_e('You have no charts created.', 'wpdatatables'); ?></p>
                                <?php if (get_option('wdtGettingStartedPageStatus') != 1) { ?>
                                    <a href="<?php echo admin_url('admin.php?page=wpdatatables-tutorials'); ?>">
                                        <?php esc_html_e('View tutorials', 'wpdatatables'); ?>
                                    </a>
                                <?php } ?>
                            </div>
                            <div class="clear"></div>
                        </div>
                    <?php } else {
                        $lastChartData = WDTTools::getLastTableData('chart');
                        ?>
                        <div class="card-body wpdt-flex card-padding">
                            <div class="wdt-chart-count text-center">
                                <span class="wdt-chart-count-number"> <a href="<?php echo admin_url('admin.php?page=wpdatatables-charts'); ?>"><?php echo $tableChartsCount; ?></a></span>
                                <p><?php esc_html_e('Created', 'wpdatatables'); ?></p>
                            </div>
                            <div class="wdt-chart-last-created">
                                <a href="admin.php?page=wpdatatables-chart-wizard&chart_id=<?php echo (int)$lastChartData->id; ?>&engine=<?php esc_attr_e($lastChartData->engine); ?>"
                                   class="wdt-chart-link">
                                    <?php echo esc_html($lastChartData->title) ?>
                                </a>
                                <span class="wdt-chart-engine"><?php echo ucfirst(esc_html($lastChartData->engine)) ?></span>
                                <div id="wpdt-shortcode-container" class="pull-right">
                                    <a class="wdt-copy-shortcode" data-toggle="tooltip" data-shortcode-type="last-chart"
                                       data-placement="top" title=""
                                       data-original-title="<?php esc_attr_e('Click to copy shortcode', 'wpdatatables'); ?>">
                                        <i class="wpdt-icon-copy"></i>
                                    </a>
                                    <span id="wdt-last-chart-shortcode-id">[wpdatachart id=<?php echo (int)$lastChartData->id; ?>]</span>
                                </div>
                                <p><?php esc_html_e('Latest chart created.', 'wpdatatables'); ?></p>
                                <div class="clear"></div>
                            </div>
                        </div>
                    <?php } ?>

                </div>
                <div class="card wdt-support-card">
                    <div class="card-body card-padding">
                        <div class="col-sm-12 p-l-0 p-r-0">
                            <div class="col-sm-6 p-l-12 p-b-12 p-t-12 p-r-0 pull-left">
                                <h4 class="wdt-card-header-title m-t-0 m-b-4">
                                    <?php esc_html_e('Still need help? ', 'wpdatatables'); ?>
                                </h4>
                                <p class="wpdt-text wpdt-font">
                                    <?php esc_html_e('We provide professional support to all our users via our ticketing system.'); ?></p>
                                <a href="<?php echo admin_url('admin.php?page=wpdatatables-support'); ?>"
                                   class="btn btn-primary">
                                    <?php esc_html_e('Visit Support Center', 'wpdatatables'); ?></a>
                            </div>
                        </div>
                        <div class="clear"></div>
                    </div>
                </div>
                <div class="card wdt-settings-card">
                    <div class="card-header">
                        <div class="wdt-card-header-title">
                            <i class="wpdt-icon-wrench"></i>
                            <?php esc_html_e('Settings', 'wpdatatables'); ?>
                        </div>
                        <ul class="actions">
                            <li>
                                <button class="wdt-card-header-button">
                                    <a href="<?php echo admin_url('admin.php?page=wpdatatables-settings'); ?>">
                                        <?php esc_html_e('Configure', 'wpdatatables'); ?>
                                    </a>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div class="card-body card-padding">
                        <p class="wpdt-text wpdt-font">
                            <?php esc_html_e('Basic system info:', 'wpdatatables'); ?>
                        </p>
                        <ul>
                            <li><span><?php esc_html_e('PHP', 'wpdatatables'); ?></span>
                                <?php if ( version_compare( WDT_PHP_SERVER_VERSION, WDT_REQUIRED_PHP_VERSION, '>=' ) ) { ?>
                                    <i class="wpdt-icon-check-circle-full"></i>
                                <?php } else { ?>
                                    <i class="wpdt-icon-times-circle-full"></i>
                                <?php } ?>
                            </li>
                            <li><span><?php esc_html_e('MySQL', 'wpdatatables'); ?></span>
                                <?php global $wpdb;
                                if (version_compare($wpdb->db_version(), '5.0.0', '>')) { ?>
                                    <i class="wpdt-icon-check-circle-full"></i>
                                <?php } else { ?>
                                    <i class="wwpdt-icon-times-circle-full"></i>
                                <?php } ?>
                            </li>
                            <li>
                                <span>
                                   <?php esc_html_e('Zip extension ', 'wpdatatables'); ?>
                                </span>
                                <?php if (class_exists('ZipArchive')) { ?>
                                    <i class="wpdt-icon-check-circle-full"></i>
                                <?php } else { ?>
                                    <i class="wpdt-icon-times-circle-full"></i>
                                <?php } ?>
                            </li>
                            <li>
                                <span>
                                    <?php esc_html_e('Curl extension ', 'wpdatatables'); ?>
                                </span>
                                <?php
                                if (extension_loaded('curl')) { ?>
                                    <i class="wpdt-icon-check-circle-full"></i>
                                <?php } else { ?>
                                    <i class="wpdt-icon-times-circle-full"></i>
                                <?php } ?>
                            </li>
                        </ul>
                        <p class="wdt-link pull-right m-b-0">
                            <a href="<?php echo admin_url('admin.php?page=wpdatatables-system-info'); ?>">
                                <?php esc_html_e('View Full System Info', 'wpdatatables'); ?></a></p>
                        <div class="clear"></div>
                    </div>

                </div>
                <div class="card wdt-changelog-card">
                    <div class="card-header">
                        <div class="wdt-card-header-title">
                            <i class="wpdt-icon-file"></i>
                            <?php esc_html_e('Changelog', 'wpdatatables'); ?>
                        </div>
                        <ul class="actions">
                            <li>
                                <button class="wdt-card-header-button">
                                    <a href="https://wordpress.org/plugins/wpdatatables/#developers" target="_blank">
                                        <?php esc_html_e('View Changelog', 'wpdatatables'); ?>
                                    </a>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div class="card-body card-padding">
                        <p class="wpdt-text wpdt-font m-b-4"> <?php esc_html_e('You are currently using ', 'wpdatatables'); ?>
                            <span class="f-600">
                                <?php esc_html_e('Version ', 'wpdatatables');
                                echo WDT_CURRENT_VERSION; ?>
                                 </span>
                        </p>
                        <p class="wpdt-text wpdt-font m-b-18">
                            New update:
                        </p>
                        <div class="alert alert-info m-b-0" role="alert">
                            <i class="wpdt-icon-info-circle-full"></i>
                            <ul>
                                <li>Added support for HTML, Rating, and Signature fileds for the Ivyforms integration.</li>
                                <li>Other small bug fixes and stability improvements.</li>
                            </ul>
                        </div>

                    </div>
                </div>
            </div>
            <div class="col-sm-6 card-columns p-l-12 p-r-0">
                <div class="card wdt-premium-features-card">
                    <div class="card-header ">
                        <div class="wdt-card-header-title">
                            <i class="wpdt-icon-star-full" style="color: #008CFF;"></i>
                            <?php esc_html_e('Go Premium!', 'wpdatatables'); ?>
                        </div>
                        <ul class="actions">
                            <li class="m-b-0">
                                <button class="wdt-card-header-link">
                                    <a href="<?php echo admin_url('admin.php?page=wpdatatables-lite-vs-premium'); ?>" target="_blank">
                                        <?php esc_html_e('View Comparison', 'wpdatatables'); ?>
                                    </a>
                                </button>
                            </li>
                        </ul>
                    </div>
                    <div class="card-body card-padding">
                        <p class="wpdt-text f-400 wpdt-font" style="color:#304463 !important;">
                            <?php esc_html_e('Get the most out of wpDataTables by upgrading to Premium and unlocking all of the powerful features.', 'wpdatatables'); ?>
                        </p>
                        <div class="wdt-premium-features">
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: red;font-weight: bold;">NEW! </span><?php esc_html_e('Custom Fields Integration for WP Posts Builder', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: red;font-weight: bold;">NEW! </span><?php esc_html_e('Custom Fields Integration for WooCommerce', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: red;font-weight: bold;">NEW! </span><?php esc_html_e('WooCommerce Integration', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: red;font-weight: bold;">NEW! </span><?php esc_html_e('WP Post Builder', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Fixed headers', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Fixed columns', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Transform value', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Highcharts Stock', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Folders/Categories for tables', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Folders/Categories for charts', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('GeoCharts', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Hidden (dynamic) columns', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Index column', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Create a table manually', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Update manual tables', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Creating tables from Google Spreadsheet', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Creating tables via Google Sheet API', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Creating tables from Private Google Spreadsheet', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Creating MySQL-based tables from database', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Creating MySQL-based tables from Wordpress post types', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Creating tables where users can see and edit own data', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Creating table relations (Foreign key)', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Advanced filtering', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Pre-filtering tables through URL', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Table Customization', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Server-side processing', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Multiple databases support (MySQL,MS SQL and PostgreSQL)', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Front-end table editing', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Excel-like editing', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Creating charts with ApexCharts', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Creating charts with Highcharts', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Export Highcharts data to CSV and XLS files', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Follow table filtering in charts', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Conditional formatting', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Calculating Tools', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Formula columns', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><span style="color: #f43e3e;font-weight: bold;">NEW! </span><?php esc_html_e('Rotate column headers', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Placeholders', 'wpdatatables'); ?>
                            </p>
                            <p class="wpdt-font">
                                <i class="wpdt-icon-check m-r-8"></i><?php esc_html_e('Premium support', 'wpdatatables'); ?>
                            </p>
                        </div>
                        <a class="btn btn-primary m-t-20" target="_blank" href="https://wpdatatables.com/pricing/?utm_source=wpdt-lite&utm_medium=lite-upgrade-dashboard&utm_content=wpdt&utm_campaign=wpdt">
                            <?php esc_html_e('Get Premium Today', 'wpdatatables'); ?></a>
                    </div>
                </div>
                <div class="card wdt-blog-card">
                    <div class="card-header">
                        <div class="wdt-card-header-title">
                            <i class="wpdt-icon-bullhorn-full"></i>
                            <?php esc_html_e('News Blog', 'wpdatatables'); ?>
                        </div>
                    </div>
                    <div class="card-body card-padding">
                        <p class="wpdt-text">
                            <?php esc_html_e('Checkout useful articles from wpdatatables.com', 'wpdatatables'); ?>
                        </p>
                        <ul>

                            <?php
                            if (extension_loaded('xml') && extension_loaded('dom') && ini_get('allow_url_fopen')) {
                                $rss = new DOMDocument();
                                @$rss->load('https://wpdatatables.com/feed/');
                                if($rss){
                                    $feed = array();
                                    foreach ($rss->getElementsByTagName('item') as $node) {
                                        $item = array(
                                            'title' => $node->getElementsByTagName('title')->item(0)->nodeValue,
                                            'link' => $node->getElementsByTagName('link')->item(0)->nodeValue
                                        );
                                        $feed[] = $item;
                                    }
                                    $limit = 4;
                                    if(!empty($feed)){
                                        for ($x = 0; $x < $limit; $x++) {
                                            $title = str_replace(' & ', ' &amp; ', $feed[$x]['title']);
                                            $link = $feed[$x]['link'];
                                            echo ' <li> <a href="' . $link . '" title="' . $title . '" class="card-link" target="_blank">' . $title . '<i class="wpdt-icon-external-link-square-alt"></i></a></li>';
                                        }
                                    } else {?>
                                        <li> <a href="https://wpdatatables.com/how-to-create-the-premier-league-table/" title="How to create the Premier League table for your site" class="card-link" target="_blank">How to create the Premier League table for your site<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                        <li> <a href="https://wpdatatables.com/charts-vs-tables/" title="Charts Vs Tables or When to Use One Over the Other" class="card-link" target="_blank">Charts Vs Tables or When to Use One Over the Other<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                        <li> <a href="https://wpdatatables.com/scan-wordpress-database-for-malware/" title="How to Scan The WordPress Database For Malware" class="card-link" target="_blank">How to Scan The WordPress Database For Malware<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                        <li> <a href="https://wpdatatables.com/wordpress-database-cleanup/" title="How to Do a WordPress Database Cleanup" class="card-link" target="_blank">How to Do a WordPress Database Cleanup<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                    <?php }
                                } else {?>
                                    <li> <a href="https://wpdatatables.com/how-to-create-the-premier-league-table/" title="How to create the Premier League table for your site" class="card-link" target="_blank">How to create the Premier League table for your site<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                    <li> <a href="https://wpdatatables.com/charts-vs-tables/" title="Charts Vs Tables or When to Use One Over the Other" class="card-link" target="_blank">Charts Vs Tables or When to Use One Over the Other<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                    <li> <a href="https://wpdatatables.com/scan-wordpress-database-for-malware/" title="How to Scan The WordPress Database For Malware" class="card-link" target="_blank">How to Scan The WordPress Database For Malware<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                    <li> <a href="https://wpdatatables.com/wordpress-database-cleanup/" title="How to Do a WordPress Database Cleanup" class="card-link" target="_blank">How to Do a WordPress Database Cleanup<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                <?php }
                            } else {  ?>
                                <li> <a href="https://wpdatatables.com/how-to-create-the-premier-league-table/" title="How to create the Premier League table for your site" class="card-link" target="_blank">How to create the Premier League table for your site<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                <li> <a href="https://wpdatatables.com/charts-vs-tables/" title="Charts Vs Tables or When to Use One Over the Other" class="card-link" target="_blank">Charts Vs Tables or When to Use One Over the Other<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                <li> <a href="https://wpdatatables.com/scan-wordpress-database-for-malware/" title="How to Scan The WordPress Database For Malware" class="card-link" target="_blank">How to Scan The WordPress Database For Malware<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                                <li> <a href="https://wpdatatables.com/wordpress-database-cleanup/" title="How to Do a WordPress Database Cleanup" class="card-link" target="_blank">How to Do a WordPress Database Cleanup<i class="wpdt-icon-external-link-square-alt"></i></a></li>
                            <?php } ?>
                        </ul>
                        <div class="clear"></div>
                        <div class="wdt-subscribe">
                            <div class="wdt-subscribe-message">
                                <i class="wpdt-icon-envelope"></i>
                                <p class="wpdt-text"><?php esc_html_e('Never miss notifications about new cool features, promotions,
                                    giveaways or freebies – subscribe to our newsletter! Join 3000+ subscribers. We send
                                    about 1 message per month and never spam!', 'wpdatatables'); ?> </p>
                            </div>
                            <div class="wdt-subscribe-form">
                                <div id="form-acm_50703"></div>
                                <script type="text/javascript" src="https://acumbamail.com/newform/dynamic/js/ET8rshmNeLvQox6J8U99sSJZ8B1DZo1mhOgs408R0mHYiwgmM/50703/"></script>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="col-sm-12 p-l-0 p-r-0">
                <h4 class="wdt-row-title text-center">
                    <?php esc_html_e('wpDataTables Addons', 'wpdatatables'); ?>
                    <sup> <?php esc_html_e('Premium ', 'wpdatatables'); ?></sup>
                </h4>
                <p class="text-center wdt-row-desc">
                    <?php esc_html_e('While wpDataTables itself provides quite a large amount of features and unlimited customisation, flexibility, you can achieve even more with our premium addons.', 'wpdatatables'); ?>
                    <br>
                    <?php esc_html_e('(except Forminator Forms integration which is free and can be used with Lite version as well, all others requires wpDataTables Premium version)', 'wpdatatables'); ?>
                </p>
            </div>
        </div>
        <div class="row">
            <div class="col-1-4 col-md-6 col-xs-12 p-l-0">
                <div class="card wdt-addons-card">
                    <div class="thumbnail">
                        <div class="ribbon"><span><?php esc_html_e('Free', 'wpdatatables'); ?></span></div>
                        <div class="wpdt-addons-desc text-center">
                            <img class="img-responsive"
                                 src="<?php echo WDT_ASSETS_PATH; ?>img/addons/forminator-forms-logo.png"
                                 alt="">
                        </div>
                        <h4 class="text-center">
                            <?php esc_html_e('Forminator Forms integration for wpDataTables', 'wpdatatables'); ?>
                        </h4>
                        <div class="caption p-0">
                            <p class="text-center">
                                <?php esc_html_e('Tool that adds "Forminator Form" as a new table type and allows you to create wpDataTables from Forminator Forms submissions.', 'wpdatatables'); ?>
                            </p>
                        </div>
                        <?php if (!defined('WDT_FRF_ROOT_PATH')) { ?>
                            <div class="wdt-addons-links text-center">
                                <a href="https://wordpress.org/plugins/wpdatatables-forminator/"
                                   target="_blank" class="btn  btn-primary" role="button">
                                    <?php esc_html_e('Learn More', 'wpdatatables'); ?><i
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
            </div>
            <div class="col-1-4 col-md-6 col-xs-12 p-l-0">
                <div class="card wdt-addons-card">
                    <div class="thumbnail">
                        <div class="wpdt-addons-desc text-center">
                            <img class="img-responsive"
                                 src="<?php echo WDT_ASSETS_PATH; ?>img/addons/master-detail-logo.png"
                                 alt="">
                        </div>
                        <h4 class="text-center">
                            <?php esc_html_e('Master Detail Tables for wpDataTables', 'wpdatatables'); ?>
                        </h4>
                        <div class="caption p-0">
                            <p class="text-center">
                                <?php esc_html_e('A wpDataTables addon which allows showing additional details for a specific row in a popup or a separate page or post.', 'wpdatatables'); ?>
                            </p>
                        </div>
                        <div class="wdt-addons-links text-center">
                            <a href="https://wpdatatables.com/documentation/addons/master-detail-tables/?utm_source=wpdt-lite&utm_medium=addons&utm_content=wpdt&utm_campaign=wpdt"
                               target="_blank" class="btn  btn-primary" role="button">
                                <?php esc_html_e('Learn More', 'wpdatatables'); ?><i
                                        class="wpdt-icon-external-link-square-alt m-l-10"></i>
                            </a>
                            <div class="clear"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-1-4 p-l-0 col-md-6 col-xs-12">
                <div class="card wdt-addons-card">
                    <div class="thumbnail">
                        <div class="wpdt-addons-desc text-center">
                            <img class="img-responsive"
                                 src="<?php echo WDT_ASSETS_PATH; ?>img/addons/powerful-filters-logo.png"
                                 alt="">
                        </div>
                        <h4 class="text-center">
                            <?php esc_html_e('Powerful Filters for wpDataTables', 'wpdatatables'); ?>
                        </h4>
                        <div class="caption p-0">
                            <p class="text-center">
                                <?php esc_html_e('An add-on for wpDataTables that provides powerful filtering features: cascade filtering, applying filters on button click, hide table before filtering.', 'wpdatatables'); ?>
                            </p>
                        </div>
                        <div class="wdt-addons-links text-center">
                            <a href="https://wpdatatables.com/documentation/addons/powerful-filtering/?utm_source=wpdt-lite&utm_medium=addons&utm_content=wpdt&utm_campaign=wpdt"
                               target="_blank" class="btn btn-primary" role="button">
                                <?php esc_html_e('Learn More', 'wpdatatables'); ?><i
                                        class="wpdt-icon-external-link-square-alt m-l-10"></i>
                            </a>
                            <div class="clear"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-1-4 p-l-0 col-md-6 col-xs-12">
                <div class="card wdt-addons-card">
                    <div class="thumbnail">
                        <div class="wpdt-addons-desc text-center">
                            <img class="img-responsive"
                                 src="<?php echo WDT_ASSETS_PATH; ?>img/addons/report-builder-logo.png" alt="">
                        </div>
                        <h4 class="text-center">
                            <?php esc_html_e('Report Builder', 'wpdatatables'); ?>
                        </h4>
                        <div class="caption p-0">
                            <p class="text-center">
                                <?php esc_html_e('A unique tool that allows you to generate almost any Word DOCX and Excel XLSX documents filled in with actual data from your database.', 'wpdatatables'); ?>
                            </p>
                        </div>
                        <div class="wdt-addons-links text-center">
                            <a href="http://wpreportbuilder.com?utm_source=wpdt" target="_blank"
                               class="btn btn-primary" role="button">
                                <?php esc_html_e('Learn More', 'wpdatatables'); ?><i
                                        class="wpdt-icon-external-link-square-alt m-l-10"></i>
                            </a>
                            <div class="clear"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-1-4 p-l-0 col-md-6 col-xs-12">
                <div class="card wdt-addons-card">
                    <div class="thumbnail">
                        <div class="wpdt-addons-desc text-center">
                            <img class="img-responsive wdt-formidable-img"
                                 src="<?php echo WDT_ASSETS_PATH; ?>img/addons/formidable-forms-logo.png"
                                 alt="">
                        </div>
                        <h4 class="text-center">
                            <?php esc_html_e('Formidable Forms integration for wpDataTables', 'wpdatatables'); ?>
                        </h4>
                        <div class="caption p-0">
                            <p class="text-center">
                                <?php esc_html_e('Tool that adds "Formidable Form" as a new table type and allows you to create wpDataTables from Formidable Forms entries data.', 'wpdatatables'); ?>
                            </p>
                        </div>
                        <div class="wdt-addons-links text-center">
                            <a href="https://wpdatatables.com/documentation/addons/formidable-forms-integration/?utm_source=wpdt-lite&utm_medium=addons&utm_content=wpdt&utm_campaign=wpdt"
                               target="_blank" class="btn btn-primary" role="button">
                                <?php esc_html_e('Learn More', 'wpdatatables'); ?><i
                                        class="wpdt-icon-external-link-square-alt m-l-10"></i>
                            </a>
                            <div class="clear"></div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="col-1-4 p-l-0 col-md-6 col-xs-12">
                <div class="card wdt-addons-card">
                    <div class="thumbnail">
                        <div class="wpdt-addons-desc text-center">
                            <img class="img-responsive wdt-gravity-img"
                                 src="<?php echo WDT_ASSETS_PATH; ?>img/addons/gravity-forms-logo.png" alt="">
                        </div>
                        <h4 class="text-center">
                            <?php esc_html_e('Gravity Forms integration for wpDataTables', 'wpdatatables'); ?>
                        </h4>
                        <div class="caption p-0">
                            <p class="text-center">
                                <?php esc_html_e('Tool that adds "Gravity Form" as a new table type and allows you to create wpDataTables from Gravity Forms entries data.', 'wpdatatables'); ?>
                            </p>
                        </div>
                        <div class="wdt-addons-links text-center">
                            <a href="https://wpdatatables.com/documentation/addons/gravity-forms-integration/?utm_source=wpdt-lite&utm_medium=addons&utm_content=wpdt&utm_campaign=wpdt"
                               target="_blank" class="btn btn-primary" role="button">
                                <?php esc_html_e('Learn More', 'wpdatatables'); ?><i
                                        class="wpdt-icon-external-link-square-alt m-l-10"></i>
                            </a>
                            <div class="clear"></div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <h4 class="wdt-row-title m-b-20 text-center">
                <?php esc_html_e('Need a free booking plugin?', 'wpdatatables'); ?></h4>
        </div>
        <div class="row">
            <div class="col-sm-12 p-l-0 p-r-0">
                <div class="card wdt-amelia-card m-b-0">
                    <div class="card-body card-padding">
                        <div class="col-sm-6 pull-left amelia-desc">
                            <img src="<?php echo WDT_ASSETS_PATH; ?>img/amelia-logo.png" style="width: 122px;">
                            <div class="amelia-title m-b-4">
                                <?php esc_html_e('Appointments and Events WordPress Booking Plugin', 'wpdatatables'); ?>
                            </div>
                            <p class="wpdt-text wpdt-font m-b-0">
                                <?php echo sprintf(esc_html__('Amelia Lite is a free appointment and event WordPress booking plugin that allows to set up a fully-featured automated booking system on your WordPress website and is a handy tool for small businesses and individuals that depend on stable appointment booking processes and for premium %s businesses from healthcare, beauty, sports, automotive, educational, creative, HR and other industries use Amelia to flawlessly manage %s appointments and events worldwide each month.', 'wpdatatables') ,AMELIA_NUMBER_OF_ACTIVE_INSTALLS , AMELIA_NUMBER_OF_APPOINTMENTS ); ?></p>
                            <p>
                                <span class="wdt-stars-container stars-88">★★★★★</span>
                                <span class="wdt-rating"> <?php esc_html_e('Rating: 4.6 - 573 reviews') ?></span>
                            </p>
                            <a href="https://downloads.wordpress.org/plugin/ameliabooking.zip" class="btn btn-primary">
                                <?php esc_html_e('Free Download', 'wpdatatables'); ?>
                                <i class="wpdt-icon-file-download"></i>
                            </a>
                            <a href="https://wordpress.org/plugins/ameliabooking/" target="_blank" class="btn btn-primary">
                                <?php esc_html_e('Learn More', 'wpdatatables'); ?>
                                <i class="wpdt-icon-arrow-right"></i>
                            </a>

                        </div>
                    </div>
                </div>
            </div>
        </div>
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
            </ul>
        </div>
    </div>
    <!-- /.container -->

</div>
<!-- /.wdt-datatables-admin-wrap .wrap -->


