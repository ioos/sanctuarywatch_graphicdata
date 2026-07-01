<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<?php
/**
 * Template for Table Preview widget
 * @author Alexander Gilmanov
 * @since 13.10.2016
 */
?>
<!-- div.column-settings -->
<div class="card column-settings hidden">

    <!-- Preloader -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
    <!-- /Preloader -->

    <div class="card-header wdt-admin-card-header ch-alt">
        <div class="col-sm-8 p-l-0 p-t-5">
            <h2><?php esc_html_e('Table preview and columns setup', 'wpdatatables'); ?></h2>
        </div>
        <div class="clear"></div>
    </div>
    <!-- /.card-header -->
    <div class="card-body card-padding">
        <div class="wdt-table-action-buttons">
            <span class="pull-right">
                 <button class="btn pull-right"
                         title="<?php esc_attr_e('Complete column list', 'wpdatatables'); ?>" data-toggle="tooltip"
                         id="wdt-open-columns-list">
               <i class="wpdt-icon-line-columns"></i>
                     <?php esc_html_e('Column List', 'wpdatatables'); ?>
            </button>
            </span>
            <span class="pull-left">
              <?php if (isset($tableData) && $tableData->table->table_type === 'manual') { ?>
                  <button class="btn pull-right wdt-remove-column">
                      <i class="wpdt-icon-minus"></i>
                      <?php esc_html_e('Remove column', 'wpdatatables'); ?>
                  </button>
              <?php } ?>
                <button type="button" class="btn pull-right wdt-add-formula-column" data-toggle="html-button-premium-popover" data-placement="top" title="title" data-content="content">
                    <i class='wpdt-icon-star-full m-r-5' style='color: #FFC078;'></i>
                <i class="wpdt-icon-function-reg"></i>
                    <?php esc_html_e('Add a Formula Column', 'wpdatatables'); ?>
                </button>
              <?php if (isset($tableData) && $tableData->table->table_type === 'manual') { ?>
                  <button class="btn pull-right wdt-add-column">
                      <i class="wpdt-icon-plus-full"></i>
                      <?php esc_html_e('Add column', 'wpdatatables'); ?>
                  </button>
              <?php } ?>
           </span>

        </div>
        <div class="clear"></div>
        <div class="col-sm-12 p-0 wdt-edit-buttons hidden">
            <span class="pull-right"><?php _e('Switch View:', 'wpdatatables'); ?>
                <?php if (isset($_GET['table_view']) && $_GET['table_view'] == 'excel') { ?>
                    <a href="<?php echo admin_url(isset($_GET['table_id']) ? 'admin.php?page=wpdatatables-constructor&source&table_id=' . (int)$_GET['table_id'] : ''); ?>"><?php esc_html_e('STANDARD', 'wpdatatables'); ?></a> |
                    <?php _e('EXCEL-LIKE', 'wpdatatables'); ?>
                <?php } else { ?>
                    <?php _e('STANDARD', 'wpdatatables'); ?> |
                    <a href="<?php echo admin_url(isset($_GET['table_id']) ? 'admin.php?page=wpdatatables-constructor&source&table_id=' . (int)$_GET['table_id'] . '&table_view=excel' : ''); ?>"><?php esc_html_e('EXCEL-LIKE', 'wpdatatables'); ?></a>
                <?php } ?>
            </span>
        </div>
        <div class="clearfix"></div>

        <div class="row wpDataTableContainer wpDataTables wpDataTablesWrapper" id="wpdatatable-preview-container">
            <?php if (isset($tableData)) {
                echo $tableData->wdtHtml;
            } ?>
        </div>
        <!-- /.wpDataTableContainer -->

        <div class="row">

            <div class="col-md-12">
                <button class="btn btn-default btn-icon-text wdt-documentation"
                        data-doc-page="table_preview">
                    <i class="wpdt-icon-file-thin"></i><?php esc_html_e('View Documentation', 'wpdatatables'); ?>
                </button>

                <div class="pull-right">
                    <button class="btn btn-danger btn-icon-text wdt-backend-close">
                        <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                    </button>
                    <button class="btn btn-primary btn-icon-text wdt-apply">
                        <i class="wpdt-icon-save"></i><?php esc_html_e('Save Changes', 'wpdatatables'); ?>
                    </button>
                </div>
            </div>
            <!-- /.col-md-12 -->
        </div>
        <!-- /.row -->

    </div>
    <!-- /.card-body -->
</div>
<!-- /.card /.column-settings -->
