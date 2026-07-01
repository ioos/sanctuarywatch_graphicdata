<?php defined('ABSPATH') or die('Access denied.'); ?>

<?php /** @var WDTBrowseTable $this */ ?>
<!-- .container -->
<div class="container">
    <div class="row">
        <div class="col-xs-6">
            <div class="bulk-action-container">
                <?php $this->display_tablenav('top'); ?>
            </div>
        </div>
        <div class="col-xs-6">
            <div class="pull-right pagination-container">
                <?php $this->pagination('top'); ?>
            </div>
            <div class="pull-right search-box-container">
                <?php $this->search_box('search', 'search_id'); ?>
            </div>
        </div>
    </div>
</div>
<!--/ .container -->

<!-- .wp-list-table -->
<table class="wp-list-table <?php echo implode(' ', $this->get_table_classes()); ?>">
    <thead>
    <tr>
        <?php $this->print_column_headers(); ?>
    </tr>
    </thead>

    <tbody id="the-list"<?php if ($singular) {
        echo " data-wp-lists='list:$singular'";
    } ?>>
    <?php $this->display_rows_or_placeholder(); ?>
    </tbody>


</table>
<!--/ .wp-list-table -->

<!-- .container -->
<div class="container">
    <div class="row">
        <div class="col-sm-6 pull-right">
            <?php $this->pagination('bottom'); ?>
        </div>
        <div class="col-sm-6 pull-left">
            <a class="btn btn-default btn-icon-text wdt-documentation" data-doc-page="browse_page">
                <i class="wpdt-icon-file-thin"></i> <?php esc_html_e(' View Documentation', 'wpdatatables'); ?>
            </a>
        </div>
    </div>
</div>
<!--/ .container -->