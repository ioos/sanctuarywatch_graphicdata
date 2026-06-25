<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<div class="wrap wdt-datatables-admin-wrap">

    <?php wp_nonce_field('wdtConstructorNonce', 'wdtNonce'); ?>

    <?php do_action('wpdatatables_admin_before_constructor'); ?>

    <div class="container">

        <div class="row">

            <div class="card wdt-table-constructor">

                <!-- Preloader -->
                <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
                <!-- /Preloader -->

                <div class="card-header wdt-admin-card-header ch-alt">
                    <img id="wpdt-inline-logo"
                         src="<?php echo WDT_ROOT_URL; ?>assets/img/logo.svg"/>
                    <h2>
                        <span style="display: none"><?php esc_html_e('Create a Table', 'wpdatatables'); ?></span>
                        <?php esc_html_e('Create a Table', 'wpdatatables'); ?>
                    </h2>
                    <ul class="actions p-t-5">
                        <li>
                            <button class="btn wdt-backend-close">
                                <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                            </button>
                        </li>
                    </ul>
                </div>
                <!-- /.card-header -->

                <div class="card-body card-padding">

                    <?php include WDT_TEMPLATE_PATH . 'admin/constructor/steps/constructor_1.inc.php'; ?>

                    <?php include WDT_TEMPLATE_PATH . 'admin/constructor/steps/constructor_1_0.inc.php'; ?>

                </div>
                <!-- /.card-body -->
                <div class="row m-t-15 m-b-5 p-l-15 p-r-15">
                    <div id="wpdt-control-buttons">
                        <div class="btn-group wdt-constructor-create-buttons pull-right m-l-5" style="display: none;">
                            <button type="button" class="btn btn-primary dropdown-toggle"
                                    data-toggle="dropdown" aria-expanded="false">
                                Create the table
                                <i class="wpdt-icon-caret-down-full"></i>
                            </button>
                            <ul class="dropdown-menu" role="menu">
                                <li id="wdt-constructor-create-table">
                                    <a><?php esc_html_e('Open in standard editor', 'wpdatatables'); ?></a></li>
                                <li id="wdt-constructor-create-table-excel">
                                    <a><?php esc_html_e('Open in Excel-like editor', 'wpdatatables'); ?></a></li>
                            </ul>
                        </div>
                        <button class="btn btn-primary pull-right m-l-5"
                                disabled="disabled"
                                id="wdt-constructor-next-step"><?php esc_html_e('Next ', 'wpdatatables'); ?></button>
                        <button class="btn pull-right hidden" id="wdt-constructor-previous-step"
                                disabled="disabled"><?php esc_html_e(' Previous', 'wpdatatables'); ?></button>
                    </div>
                    <a class="btn btn-default btn-icon-text wdt-documentation"
                       data-doc-page="constructor">
                        <i class="wpdt-icon-file-thin"></i> <?php esc_html_e('View Documentation', 'wpdatatables'); ?>
                    </a>
                </div>

            </div>
            <!-- /.card /.wdt-table-constructor -->

        </div>
        <!-- /.row -->

    </div>
    <!-- /.container -->

    <!-- Error message modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/error_modal.inc.php'; ?>
    <!-- /Error message modal -->

    <!-- Close modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/close_modal.inc.php'; ?>
    <!-- /Close modal -->

    <!-- Premium modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/premium_modal.inc.php'; ?>
    <!-- Premium modal -->

</div>
<!-- /.wdt-datatables-admin-wrap .wrap -->
