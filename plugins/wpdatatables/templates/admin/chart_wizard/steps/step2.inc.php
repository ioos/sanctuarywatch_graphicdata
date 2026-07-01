<?php defined('ABSPATH') or die('Access denied.'); ?>

<div class="row">
    <div class="col-sm-6 col-md-6 data-source">
        <h4 class="c-title-color m-b-2">
            <?php esc_html_e('wpDataTable Data Source', 'wpdatatables'); ?>
            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
               title="<?php esc_attr_e('Please pick a wpDataTable which will be used as a data source for this chart.', 'wpdatatables'); ?>"></i>
        </h4>
        <div class="form-group">
            <div class="fg-line">
                <div class="select">
                    <select class="selectpicker" name="wpdatatables-chart-source" id="wpdatatables-chart-source"
                            data-live-search="true">
                        <option value=""><?php _e('Pick a wpDataTable', 'wpdatatables'); ?></option>
                        <?php foreach (WPDataTable::getAllTables() as $table) { ?>
                            <option value="<?php echo esc_attr($table['id']) ?>"
                                    data-table-type="<?php echo esc_attr($table['table_type']) ?>">
                            <?php echo esc_html("{$table['title']} (id: {$table['id']})");?>
                            </option>
                        <?php } ?>
                    </select>
                    </select>
                </div>
            </div>
        </div>
    </div>
</div>
<div id="wdt-simple-source-chart" class="alert alert-info" role="alert" style="width: fit-content;">
    <i class="wpdt-icon-info-circle-full"></i>
    <span class="wdt-alert-title f-600"><?php esc_html_e('You are trying to use a Simple table to create a chart, which is not possible at the moment. Please try using any other data table to create a chart.', 'wpdatatables'); ?><br></span>
</div>
