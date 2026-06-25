<?php defined('ABSPATH') or die('Access denied.'); ?>

<div class="tablenav <?php echo esc_attr($which); ?>">
    <?php if ($this->has_items()):
        $this->bulk_actions($which);
    endif;

    $this->extra_tablenav($which);
    ?>
    <br class="clear"/>
</div>