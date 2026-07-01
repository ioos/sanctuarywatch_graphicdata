<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<div class="wrap wdt-datatables-admin-wrap">

    <?php wp_nonce_field('wdtEditNonce', 'wdtNonce'); ?>

    <?php do_action('wpdatatables_admin_before_edit'); ?>
    <div class="container">
        <div class="row">

            <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/table_settings_block.inc.php'; ?>

        </div>
        <!-- /.row -->

        <div class="row">

            <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/table_preview_block.inc.php'; ?>

        </div>
        <!-- /.row-->

    </div>
    <!-- /.container -->

    <div class="column-settings-overlay">

        <div class="row">

            <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/column_settings_panel.inc.php'; ?>

        </div>
        <!-- /.row-->

    </div>
    <!-- /column-settings-overlay -->


    <!-- Modals -->

    <!-- Configure foreign key modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/foreign_key_config.inc.php'; ?>
    <!-- /Configure foreign key modal -->

    <!-- Columns list modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/columns_list_modal.inc.php'; ?>
    <!-- /Columns list modal -->

    <!-- Formula Editor modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/formula_editor_modal.inc.php'; ?>
    <!-- /Formula Editor modal -->

    <!-- Add column modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/add_column_modal.inc.php'; ?>
    <!-- /Add column modal -->

    <!-- Remove column modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/remove_column_modal.inc.php'; ?>
    <!-- /Remove column modal -->

    <!-- Possible Values Merge List modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/possible_values_merge_list_modal.inc.php'; ?>
    <!-- /Possible Values Merge List modal -->

    <!-- Error message modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/error_modal.inc.php'; ?>
    <!-- /Error message modal -->

    <!-- /Modals -->

    <!-- Templates -->

    <!-- Custom headers row block-->
	<?php include WDT_TEMPLATE_PATH . 'admin/table-settings/custom_headers_row_block.inc.php'; ?>
    <!-- /Custom headers row block -->

    <!-- Conditional formatting block for column -->
    <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/conditional_formatting_block.inc.php'; ?>
    <!-- /Conditional formatting block for column -->

    <!-- Color picker template -->
    <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/colorpicker_block.inc.php'; ?>
    <!-- /Color picker template -->

    <!-- Column block for the columns popup -->
    <?php include WDT_TEMPLATE_PATH . 'admin/table-settings/column_small_block.inc.php'; ?>
    <!-- /Column block for the columns popup -->

    <!-- Close modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/close_modal.inc.php'; ?>
    <!-- Close modal -->

    <!-- Premium modal -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/premium_modal.inc.php'; ?>
    <!-- Premium modal -->

    <!-- Delete modal -->
    <?php include WDT_TEMPLATE_PATH . 'common/delete_modal.inc.php'; ?>
    <!-- /Delete modal -->

    <!-- Edit modal -->
    <?php include WDT_TEMPLATE_PATH . 'frontend/modal.inc.php'; ?>
    <!-- /Edit modal -->

    <!-- /Templates -->

</div>
<!-- /.wdt-datatables-admin-wrap .wrap -->
