<?php defined('ABSPATH') or die('Access denied.'); ?>
<div class="row">
    <div class="col-sm-12 wpdt-chart-message">
        <img src="<?php echo WDT_ROOT_URL; ?>assets/img/chart_end.svg" alt="">
        <h4 class="m-t-0"><?php esc_html_e('Your chart is ready!', 'wpdatatables'); ?></h4>
    </div>
</div>

<div class="m-b-20">
    <label class="m-b-16"><?php esc_html_e('Paste this shortcode to render this chart', 'wpdatatables'); ?></label>
    <div id="wpdt-shortcode-container">
        <a class="wdt-copy-shortcode" data-toggle="tooltip" data-shortcode-type="chart"  data-placement="right"  title="<?php esc_attr_e('Click to copy shortcode', 'wpdatatables'); ?>">
            <i class="wpdt-icon-copy"></i>
        </a>
        <span id="wdt-chart-shortcode-id"></span>
    </div>
</div>