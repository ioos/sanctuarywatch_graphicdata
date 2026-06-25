<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<?php
/**
 * Template for Formula Editor poopup/modal
 * @author Alexander Gilmanov
 * @since 04.11.2016
 */
?>
<!-- #wdtFormulaEditorModal -->
<div class="modal fade" id="wdt-formula-editor-modal" data-backdrop="static" data-keyboard="false"
     tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <!-- Preloader -->
            <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
            <!-- /Preloader -->
            <div class="modal-header">
                <h4 class="modal-title"><?php esc_html_e('Formula Editor', 'wpdatatables'); ?></h4>
            </div>
            <div class="modal-body">
                <div class="alert alert-info alert-dismissible" role="alert">
                    <button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
                                aria-hidden="true">×</span></button>
                    <span class="wdt-alert-title f-600"><?php esc_html_e('Use this dialog to construct formulas and see a preview of the result.', 'wpdatatables'); ?>
                        <br></span>
                    <span class="wdt-alert-subtitle"><?php esc_html_e('You can use columns (values for each cell will be inserted), or number values. Only numeric columns allowed (non-numeric will be parsed as 0). Basic math operations and brackets are supported. Example: col1*((col2+2)-col3*sin(col4-3)).', 'wpdatatables'); ?></span>
                </div>
                <div class="row">
                    <div class="col-md-6">
                        <p><strong><?php esc_html_e('Columns to use', 'wpdatatables'); ?></strong></p>
                        <div class="formula-columns-container">
                            <!-- Columns will be added here -->
                        </div>
                    </div>
                    <div class="col-md-6 formula_col">
                        <p><strong><?php esc_html_e('Formula', 'wpdatatables'); ?></strong></p>
                        <div class="form-group">
                            <div class="fg-line">
                                <textarea class="form-control" rows="5"
                                          placeholder="<?php esc_html_e('Type your formula here...', 'wpdatatables'); ?>"></textarea>
                            </div>
                        </div>
                    </div>
                    <div class="col-md-12 p-t-10 wdt-formula-operators">
                        <button class="btn btn-icon  formula_plus">+</button>
                        <button class="btn btn-icon  formula_minus">-</button>
                        <button class="btn btn-icon  formula_mult">*</button>
                        <button class="btn btn-icon  formula_mult formula_div">/
                        </button>
                        <button class="btn btn-icon  formula_mult formula_brackets">
                            ()
                        </button>
                        <button class="btn btn-icon  formula_mult formula_sin">
                            sin()
                        </button>
                        <button class="btn btn-icon  formula_mult formula_cos">
                            cos()
                        </button>
                        <button class="btn btn-icon  formula_mult formula_tan">
                            tan()
                        </button>
                        <button class="btn btn-icon  formula_mult formula_tan">
                            cot()
                        </button>
                        <button class="btn btn-icon  formula_mult formula_sec">
                            sec()
                        </button>
                        <button class="btn btn-icon  formula_mult formula_csc">
                            csc()
                        </button>
                    </div>
                </div>
                <!--/.row-->

                <div class="row">
                    <div class="col-md-12">
                        <div class="alert alert-info hidden wdt-formula-result-preview" role="alert"></div>
                    </div>
                </div>
                <!--/.row-->
            </div>
            <div class="modal-footer">
                <button type="button" class="btn btn-primary wdt-preview-formula">
                    <?php esc_html_e('Preview', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-danger btn-icon-text " data-dismiss="modal">
                    <i class="zmdi zmdi-close"></i>
                    <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-primary btn-icon-text wdt-save-formula">
                    <i class="zmdi zmdi-check"></i>
                    <?php esc_html_e('Save', 'wpdatatables'); ?>
                </button>
            </div>
        </div>
    </div>
</div>
<!-- /#wdtFormulaEditorModal -->