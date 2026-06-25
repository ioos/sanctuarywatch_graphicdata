<?php defined('ABSPATH') or die('Access denied.');
$showAlertMessage = get_option('wdtSimpleTableAlert');
if ($showAlertMessage){
?>
<div class="alert alert-warning alert-dismissible wdt-simple-table-alert" role="alert">
    <button type="button" class="close" data-dismiss="alert" aria-label="Close">
        <span aria-hidden="true">×</span>
    </button>
    <p><?php esc_html_e('When working with this table type please note that at the moment:', 'wpdatatables'); ?></p>
    <ul style="list-style-type: disc;padding-inline-start: 40px;margin-top: 5px;">
    <li> <?php esc_html_e('There is no sorting, search, or pagination in this table type.', 'wpdatatables'); ?></li>
    <li> <?php esc_html_e('Creating charts from this table type is not yet possible.', 'wpdatatables'); ?></li>
        <li> <?php esc_html_e('If you need those features, please consider creating tables with option ', 'wpdatatables'); ?>
            <a href="<?php echo admin_url('admin.php?page=wpdatatables-constructor&source'); ?>"><?php esc_html_e('Create a data table linked to an existing data source', 'wpdatatables'); ?> </a>
        </li>
    </ul>
    <?php _e('Depends of users requests, we will add it in our road map and implement it based on priority. Thank you for understanding.', 'wpdatatables'); ?>
</div>
<?php } ?>
<div class="card column-settings ">

    <!-- Preloader -->
    <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
    <!-- /Preloader -->

    <div class="card-header wdt-admin-card-header ch-alt">
        <div class="col-sm-8 p-l-0 p-t-5">
            <h2><?php esc_html_e('Table preview', 'wpdatatables'); ?></h2>
        </div>

        <div class="clear"></div>
    </div>
    <!-- /.card-header -->
    <div class="card-body card-padding">
        <div id="wpdt-views">
            <ul class="nav nav-pills">
                <li class="nav-item active" data-view="desktop">
                    <a class="nav-link" ><?php esc_html_e('Desktop', 'wpdatatables'); ?></a>
                </li>
                <li class="nav-item" data-view="tablet">
                    <a class="nav-link"><?php esc_html_e('Tablet', 'wpdatatables'); ?></a>
                </li>
                <li class="nav-item" data-view="mobile">
                    <a class="nav-link"><?php esc_html_e('Mobile', 'wpdatatables'); ?></a>
                </li>
            </ul>
        </div>
        <div id="wpdt-view-container">
            <?php if(isset($tableData)) {?>
                <div class="wpdt-c wpDataTablesSimpleWrapper-<?php echo (int)$tableData->tableID;?>">
                    <?php echo $tableData->wdtHtml; ?>
                </div>
            <?php } ?>
        </div>
    </div>
    <!-- /.card-body -->
</div>
<!-- /.card /.column-settings -->
