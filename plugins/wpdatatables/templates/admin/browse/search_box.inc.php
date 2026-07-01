<?php defined('ABSPATH') or die('Access denied.'); ?>

<div class="wpdt-search-box search-box">
    <div class="fg-line">
        <i class="wpdt-icon-search"></i>
        <label class="screen-reader-text" for="<?php echo esc_attr($input_id); ?>"><?php echo $text; ?>:</label>
        <input type="search" placeholder="<?php esc_html_e('Search for items...', 'wpdatatables');?>" id="<?php echo esc_attr($input_id); ?>" name="s"
               value="<?php _admin_search_query(); ?>"/>
    </div>
    <button id="search-submit" class="wpdt-control-buttons" style="display: none">
        <i class="wpdt-icon-search"></i>
    </button>
</div>