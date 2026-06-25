<?php defined('ABSPATH') or die('Access denied.'); ?>

<select name="action<?php echo $two ?>" class="form-group fg-line wpdt-bulk-select selectpicker" tabindex="-98"
        id="bulk-action-selector-<?php echo esc_attr($which) ?>">
    <?php
    foreach ($this->_actions as $name => $title) {
        $class = 'edit' === $name ? ' class="hide-if-no-js"' : '';

        echo '<option value="' . $name . '"' . $class . '>' . $title . '</option>';
    } ?>
</select>

<button id="doaction<?php echo $two ?>" class="wpdt-control-buttons bulk-action-button disabled">
    <i class="wpdt-icon-trash-reg"></i><?php esc_html_e('Delete', 'wpdatatables') ?>
</button>