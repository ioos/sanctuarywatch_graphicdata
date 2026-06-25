<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- .wdt-datatables-admin-wrap .wrap -->
<div class="wrap wdt-datatables-admin-wrap">
    <!-- Preloader -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
    <!-- /Preloader -->
    <!-- .container -->
    <div class="container wdt-lite-vs-premium">

        <!-- .row -->
        <div class="row">

            <div class="card card-head m-b-0">
                <?php wp_nonce_field('wdtLiteVSPremiumNonce', 'wdtNonce'); ?>
                <div class="card-header wdt-admin-card-header ch-alt">
                    <img id="wpdt-inline-logo"
                         src="<?php echo WDT_ROOT_URL; ?>assets/img/logo.svg" alt="Logo wpdatatables"/>
                    <h2>
                        <a href="<?php echo admin_url('admin.php?page=wpdatatables-dashboard'); ?>">
                            <i class="wpdt-icon-chevron-left"></i>
                        </a>
                        <span style="display: none">wpDataTables Lite VS Premium</span>
                        <?php esc_html_e('Plans', 'wpdatatables'); ?>
                    </h2>
                    <ul class="actions">
                        <li>
                            <button class="btn btn-default btn-icon-text wdt-documentation"
                                    data-doc-page="lite_vs_premium_page">
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
            <div class="col-sm-12 wdt-lite-vs-premium-block bg-white p-l-0 p-r-0">
                <div class="card wdt-lite-vs-premium-card m-b-0">

                    <div class="card-header wdt-admin-card-header">
                        <h5><?php esc_html_e('Lite vs Premium comparison', 'wpdatatables'); ?></h5>
                        <p><?php esc_html_e('Get the most out of wpDataTables by upgrading to Premium and unlocking all of the powerful features.', 'wpdatatables'); ?></p>
                        <a target="_blank" href="https://wpdatatables.com/pricing/?utm_source=wpdt-lite&utm_medium=lite-upgrade&utm_content=wpdt&utm_campaign=wpdt"
                           class="btn btn-primary f-500">
                            <i class="wpdt-icon-star-full m-r-5"></i>
                            <?php esc_html_e('Go Premium Now', 'wpdatatables'); ?></a>
                    </div>
                    <div class="wpdt-comparison-div">
                        <!--  Live vs Premium Table -->
                        <table id="wpdt-comparison">
                            <thead class="sticky-thead">
                            <th><?php esc_html_e('Features', 'wpdatatables'); ?>
                                <hr>
                            </th>
                            <th><?php esc_html_e('Lite', 'wpdatatables'); ?>
                                <hr>
                            </th>
                            <th colspan="4" class="text-center"><?php esc_html_e('Premium', 'wpdatatables'); ?>
                                <hr>
                            </th>
                            </thead>
                            <tbody>
                            <tr class="sticky-tr">
                                <td data-title="Features"><?php esc_html_e('Licence', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center" style="font-size: 18px;">
                                    <?php esc_html_e('Free', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center" style="font-size: 18px;">
                                    <?php esc_html_e('Starter', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center" style="font-size: 18px;">
                                    <?php esc_html_e('Standard', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center" style="font-size: 18px;">
                                    <?php esc_html_e('Pro', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center" style="font-size: 18px;">
                                    <?php esc_html_e('Dev', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Domain', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <?php esc_html_e('1 domain', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <?php esc_html_e('1 domain', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <?php esc_html_e('3 domains', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <?php esc_html_e('Unlimited domains', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Support', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite"
                                    class="text-center bg-grey"><?php esc_html_e('Limited', 'wpdatatables'); ?>
                                    <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="top"
                                       title="<?php esc_attr_e('Response time is slow and can be up to 3 business days.', 'wpdatatables'); ?>"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <?php esc_html_e('Premium', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <?php esc_html_e('Premium', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <?php esc_html_e('Premium', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <?php esc_html_e('Premium', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong class="wdt-lite-premium-features">
                                        <?php esc_html_e('New Premium features', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('WP Post Builder', 'wpdatatables'); ?>
                                    <span style="color: #7f54b3;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('WooCommerce Integration', 'wpdatatables'); ?>
                                    <span style="color: #7f54b3;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center wdt-lite-premium-red-row">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>

                            <tr>
                                <td></td>
                                <td></td>
                                <td colspan="2">
                                <div class="wdt-lite-vs-premium-footer text-center">
                                    <a target="_blank" href="https://wpdatatables.com/pricing/?utm_source=wpdt-lite&utm_medium=lite-upgrade-btn-woo&utm_content=wpdt&utm_campaign=wpdt"
                                       class="btn btn-primary m-t-24 p-r-48 p-l-48 f-500 wdt-lite-premium-woo-button">
                                        <i class="wpdt-icon-star-full m-r-5"></i>
                                        <?php esc_html_e('Go Premium Now', 'wpdatatables'); ?></a>
                                </div>
                                </td>
                                <td></td>
                                <td></td>
                            </tr>

                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong>
                                        <?php esc_html_e('Creating simple Excel-like tables', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Excel like editor', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Merge cells', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Add/Remove columns and rows', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Resize/Reorder columns and rows', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Cell custom formatting', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Font family and font size', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Undo/Redo', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Add star rating', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Custom links', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Add media', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Custom HTML editor', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Shortcode in cells', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Pre-built table templates', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite"
                                    class="text-center bg-grey"><?php esc_html_e('Limited', 'wpdatatables'); ?>
                                    <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="top"
                                       title="<?php esc_attr_e('Only 13 simple templates are available.', 'wpdatatables'); ?>"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong>
                                        <?php esc_html_e('Creating datatables from existing data sources', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Excel files (.xls, .xlsx or .ods)', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('CSV files', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('JSON feeds', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Nested JSON data (Any API data)', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('XML feeds', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Serialized PHP arrays', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Public Google Sheets', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Auto-sync with Google Sheets', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Connect to Google Sheets API', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Private Google Sheets', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('MySQL queries', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong>
                                        <?php esc_html_e('Database Manipulation', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Creating and filling in the tables manually', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Creating editable tables by importing CSV, Excel or Google Sheet table data', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Datatables from MySQL queries', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('WordPress Database Query Builder (pull data from post types, post custom (meta) fields, taxonomies...)', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('SQL Query Builder', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('External connection to any MySQL database', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('External connection to any MSSQL database', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('External connection to any PostgreSQL database', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong>
                                        <?php esc_html_e('Datatable Editing', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Back-end editing', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Front-end editing', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Excel-like editor', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Inline table editing', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Popup and popover editor', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('12 different Editor input types', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Predefined value(s) for editor', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Mandatory fields', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Allowing users to see and edit only their own data', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Configuring table relations (foreign key)', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong>
                                        <?php esc_html_e('Datatable Features', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Global search', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Sorting', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Pagination', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Export table data (PDF, Excel, CSV, Copy and Print)', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Row grouping', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Single Cell Shortcode', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Standard Display length', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Custom Display length', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Global Page Search shortcode', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong>
                                        <?php esc_html_e('Advanced Features', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Full WCAG compatibility', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Caching data', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Auto-update cache data', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Responsive', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Calculating totals, minimum, maximum and average values', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Server-side processing', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Advanced filtering', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Pre-filtering tables through URL', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Transform Value', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Conditional Formatting', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Global time format with seconds', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Customize tables', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Rotate column headers', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Update manual tables from source files', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Making dynamic SQL Queries with placeholders', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Fixed Headers', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Fixed Columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Folders / Categories for tables', 'wpdatatables'); ?>
                                    <span style="color: #ea0b0b;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('WP Post Builder', 'wpdatatables'); ?>
                                    <span style="color: #ea0b0b;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('WooCommerce Integration', 'wpdatatables'); ?>
                                    <span style="color: #ea0b0b;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Custom Fields Integration for WP Posts Builder', 'wpdatatables'); ?>
                                    <span style="color: #ea0b0b;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Custom Fields Integration for WooCommerce', 'wpdatatables'); ?>
                                    <span style="color: #ea0b0b;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong>
                                        <?php esc_html_e('Datatable column types and features', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('String columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Integer columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Float columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Date columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('DateTime columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Time columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Image columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('URL links columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Hiding columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Currency/price, percentage and other column types', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Coloring and styling columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Formula (calculated) columns', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Hidden (Dynamic) columns', 'wpdatatables'); ?>
                                    <span style="color: #ea0b0b;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Index column', 'wpdatatables'); ?>
                                    <span style="color: #ea0b0b;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong>
                                        <?php esc_html_e('Creating dynamic charts', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Editing existing charts', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Responsive design', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Grouping rows', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Customize options', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Google charts', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Chart.js', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('Follow table filtering in charts', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('ApexCharts', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features"><?php esc_html_e('HighCharts', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>

                            <tr>
                                <td data-title="Features"><?php esc_html_e('Creating charts with Highstock', 'wpdatatables'); ?>
                                    <span style="color: #ea0b0b;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Folders / Categories for charts', 'wpdatatables'); ?>
                                    <span style="color: #ea0b0b;font-weight: bold;float: right;"><?php esc_html_e('NEW!', 'wpdatatables'); ?></span>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-times-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td class=" sticky bg-white" colspan="6">
                                    <strong>
                                        <?php esc_html_e('Integrations', 'wpdatatables'); ?>
                                    </strong>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('IvyForms', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Visual Composer', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Avada Website Builder', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Divi Builder', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Elementor', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('Gutenberg blocks', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            <tr>
                                <td data-title="Features">
                                    <?php esc_html_e('WCAG compatibility', 'wpdatatables'); ?>
                                    <hr>
                                </td>
                                <td data-title="Lite" class="text-center bg-grey">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-starter">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-standard">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-pro">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                                <td data-title="Premium" class="text-center bg-blue-dev">
                                    <i class="wpdt-icon-check-full"></i>
                                    <hr>
                                </td>
                            </tr>
                            </tbody>
                        </table>
                        <!--  /Live vs Premium Table -->
                        <p style="padding-left: 28px;padding-top: 10px;font-size: 10px"><?php esc_html_e('* Please note that wpDataTables add-ons are not included in premium version of plugin.', 'wpdatatables'); ?></p>
                    </div>
                    <div class="wdt-lite-vs-premium-footer text-center">
                        <a target="_blank" href="https://wpdatatables.com/pricing/?utm_source=wpdt-lite&utm_medium=lite-upgrade-btn-bottom&utm_content=wpdt&utm_campaign=wpdt"
                           class="btn btn-primary m-t-24 p-r-48 p-l-48 f-500">
                            <i class="wpdt-icon-star-full m-r-5"></i>
                            <?php esc_html_e('Go Premium Now', 'wpdatatables'); ?></a>
                    </div>
                </div>
            </div>
        </div>

        <div class="row">
            <h6 class="text-center wdt-footer-title">
                <?php esc_html_e('Made by', 'wpdatatables'); ?>
                <a href="https://tmsproducts.io/?utm_source=full&utm_medium=plugin&utm_campaign=wpdtful"
                   target="_blank">
                    <img src="<?php echo WDT_ASSETS_PATH; ?>img/TMS-Black.svg" alt="" style="width: 66px">
                </a>
            </h6>
            <ul class="wpdt-footer-links text-center">
                <li><a rel="nofollow"
                       href="https://wpdatatables.com/?utm_source=full&utm_medium=plugin&utm_campaign=wpdtful"
                       target="_blank">wpDataTables.com</a></li>
                <li>|</li>
                <li><a rel="nofollow" href="https://wpdatatables.com/documentation/general/features-overview/"
                       target="_blank"> <?php esc_html_e('Documentation', 'wpdatatables'); ?></a>
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

