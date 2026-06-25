<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<script type="text/x-template" id="wdt-column-conditional-formatting-template">

    <div class="row wdt-conditional-formatting-rule form-horizontal">
        <div class="col-sm-2 p-t-5">
            <label class="control-label"><?php esc_html_e('If cell value', 'wpdatatables'); ?></label>
        </div>
        <div class="col-sm-2">
            <div class="form-group">
                <select class="formatting-rule-if-clause selectpicker">
                    <option value="lt" selected="selected">&lt;</option>
                    <option value="lteq">≤</option>
                    <option value="eq">=</option>
                    <option value="gteq">≥</option>
                    <option value="gt">&gt;</option>
                    <option value="neq">≠</option>
                    <option value="contains"><?php esc_html_e('contains', 'wpdatatable'); ?></option>
                    <option value="contains_not"><?php esc_html_e('does not contain', 'wpdatatable'); ?></option>
                </select>
            </div>
        </div>
        <div class="col-sm-2">
            <div class="form-group">
                <input type="text" class="form-control input-sm formatting-rule-cell-value" value="">
            </div>
        </div>
        <div class="col-sm-3">
            <div class="form-group">
                <select class="formatting-rule-action selectpicker">
                    <option value="setCellColor"
                            selected="selected"><?php esc_html_e('Set cell color', 'wpdatatables'); ?></option>
                    <option value="defaultCellColor"><?php esc_html_e('Reset cell color to default', 'wpdatatables'); ?></option>
                    <option value="setCellContent"><?php esc_html_e('Set cell content', 'wpdatatables'); ?></option>
                    <option value="setCellClass"><?php esc_html_e('Set cell CSS class', 'wpdatatables'); ?></option>
                    <option value="removeCellClass"><?php esc_html_e('Remove cell CSS class', 'wpdatatables'); ?></option>
                    <option value="setRowColor"><?php esc_html_e('Set row color', 'wpdatatables'); ?></option>
                    <option value="defaultRowColor"><?php esc_html_e('Reset row color to default', 'wpdatatables'); ?></option>
                    <option value="setRowClass"><?php esc_html_e('Set row CSS class', 'wpdatatables'); ?></option>
                    <option value="removeRowClass"><?php esc_html_e('Remove row CSS class', 'wpdatatables'); ?></option>
                    <option value="setColumnColor"><?php esc_html_e('Set column color', 'wpdatatables'); ?></option>
                    <option value="addColumnClass"><?php esc_html_e('Add column CSS class', 'wpdatatables'); ?></option>
                </select>
            </div>
        </div>
        <div class="col-sm-2">
            <div class="form-group">
                <input type="text" class="form-control input-sm formatting-rule-set-value cp-inside" value="">
            </div>
        </div>
        <div class="col-sm-1">
            <button class="btn btn-danger btn-icon-text pull-right wdt-delete-conditional-formatting-rule"
                    title="<?php esc_attr_e('Remove rule', 'wpdatatables'); ?>" data-toggle="tooltip"><i
                        class="zmdi zmdi-delete"></i></button>
        </div>
    </div>

</script>
