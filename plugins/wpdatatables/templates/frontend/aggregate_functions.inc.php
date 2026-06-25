<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<div class='wdt-column-<?php echo esc_attr($function) ?>' data-table-id='<?php echo esc_attr($attributes['table_id']) ?>'
     data-column-id='<?php echo esc_attr($attributes['col_id']) ?>'
     data-column-orig-header='<?php echo esc_attr($column['orig_header']) ?>'>
    <strong><?php echo esc_html($attributes['label']) ?> </strong>
    <span class='wdt-column-<?php echo esc_attr($function) ?>-value'><?php echo esc_html($funcResult) ?></span>
</div>