<?php defined('ABSPATH') or die('Access denied.'); ?>
<div class="col-sm-6 hidden" id="wdt-ivyforms-column-container">
    <h4 class="c-title-color m-b-2">
        <?php esc_html_e('Choose fields to show as columns', 'wpdatatables'); ?>
        <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left" title=""
           data-original-title="Please choose fields that will be used as wpDataTable columns"></i>
    </h4>
    <div class="form-group">
        <div class="fg-line">
            <select class="selectpicker" multiple data-live-search="true" id="wdt-ivyforms-form-column-picker" data-actions-box="true">
                <?php if (!empty($field_columns_for_template)) {
                    foreach ($field_columns_for_template as $field) { ?>
                        <option value="<?php echo esc_attr($field->name); ?>">
                            <?php echo esc_html($field->label); ?>
                        </option>
                <?php }
                } ?>
            </select>
        </div>
    </div>
</div>
