<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- .wdt-datatables-admin-wrap -->
<div class="wrap wdt-datatables-admin-wrap">

    <!-- .container -->
    <div class="container">

        <!-- .row -->
        <div class="row">

            <!-- .card .wdt-browse-table -->
            <div class="card wdt-browse-table">

                <!-- Preloader -->
                <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
                <!-- /Preloader -->

                <!-- .card-header -->
                <div class="card-header wdt-admin-card-header ch-alt">
                    <img id="wpdt-inline-logo"
                         src="<?php echo WDT_ROOT_URL; ?>assets/img/logo.svg"/>
                    <h2>
                        <span style="display: none">wpDataTables</span>
                        <?php esc_html_e('Browse Tables', 'wpdatatables'); ?>
                    </h2>
                    <ul class="actions">
                        <li>
                            <button onclick="location.href='admin.php?page=wpdatatables-constructor'"
                                    class="btn btn-primary wdt-add-new">
                                <i class="wpdt-icon-plus"></i>
                                <?php esc_html_e('Add New', 'wpdatatables'); ?>
                            </button>
                        </li>
                    </ul>
                </div>
                <!--/ .card-header -->

                <form method="post" action="<?php echo admin_url('admin.php?page=wpdatatables-administration'); ?>"
                      id="wdt-datatables-browse-table">
                    <?php echo $tableHTML; ?>
                    <?php wp_nonce_field('wdtDeleteTableNonce', 'wdtNonce'); ?>
                </form>
            </div>
            <!--/ .card .wdt-browse-table -->

        </div>
        <!--/ .row -->

    </div>
    <!-- .container -->

    <!-- Delete modal -->
    <?php include WDT_TEMPLATE_PATH . 'common/delete_modal.inc.php'; ?>
    <!-- /Delete modal -->

    <!-- Duplicate table modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/browse/table/duplicate_modal.inc.php'; ?>
    <!-- /Duplicate table modal -->

</div>
<!--/ .wdt-datatables-admin-wrap -->
