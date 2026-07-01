<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<?php
/**
 * User: Miljko Milosevic
 * Date: 1/20/17
 * Time: 1:33 PM
 */
?>

<div role="tabpanel" class="tab-pane" id="custom-js-and-css">
    <?php if (current_user_can( 'unfiltered_html' )): ?>
    <div class="row">
        <div class="col-sm-8 custom-js">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Custom wpDataTables JS', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('This JS will be inserted as an inline script block on every page that has a wpDataTable.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <pre name="wdt-custom-js" id="wdt-custom-js"  style="width: 100%; height: 250px"></pre>
                </div>
            </div>
        </div>
    </div>
    <?php endif; ?>
    <div class="row">
        <div class="col-sm-8 custom-css">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Custom wpDataTables CSS', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('This CSS will be inserted as an inline style block on every page that has a wpDataTable.', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="fg-line">
                    <pre name="wdt-custom-css" id="wdt-custom-css"  style="width: 100%; height: 250px"></pre>
                </div>
            </div>
        </div>
    </div>
    <div class="row">
        <div class="col-sm-8 p-t-25  minified-js">
            <h4 class="c-title-color m-b-2">
                <?php esc_html_e('Use minified wpDataTables Javascript ', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right" title=""
                   data-original-title="Uncheck if you would like to make some changes to the main wpDataTables JS file (wpdatatables.js). Minified is inserted by default (better performance)."></i>
            </h4>
            <div class="toggle-switch" data-ts-color="blue">
                <input type="checkbox" name="wdt-minified-js" id="wdt-minified-js">
                <label for="wdt-minified-js" class="ts-label"><?php esc_html_e('Use minified version of Javascript files', 'wpdatatables'); ?></label>
            </div>
        </div>
    </div>
</div>
