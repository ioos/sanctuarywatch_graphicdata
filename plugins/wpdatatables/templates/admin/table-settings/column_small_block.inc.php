<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<script type="text/x-template" id="wdt-column-small-block">

    <div class="wdt-column-block">
        <div class="fg-line m-l-10">
            <input type="text" class="form-control input-sm wdt-column-display-header-edit" value="New wpDataTable">
            <i class="wpdt-icon-pen"></i>
        </div>
        <div class="pull-right wdt-column-move-arrows">
            <span class="pull-right"><i class="wpdt-icon-sort-full column-control"></i></span>
        </div>

        <span class="pull-right" data-toggle="html-input-premium-popover" data-placement="top" title="" data-content="content"><i
                    class="wpdt-icon-filter column-control wdt-toggle-show-filters" style="color: #FFC078;"></i></span>
        <span class="pull-right wdt-column-block-icon formula-remove-option" data-toggle="tooltip" title="<?php esc_attr_e('Enable/disable in global search'); ?>"><i
                    class="wpdt-icon-search2 column-control wdt-toggle-global-search"></i></span>
        <span class="pull-right" data-toggle="tooltip" title="<?php esc_attr_e('Show/hide sorting'); ?>"><i
                    class="wpdt-icon-sort-alpha-up column-control wdt-toggle-show-sorting"></i></span>
        <span class="pull-right" data-toggle="tooltip" title="<?php esc_attr_e('Show/hide the column'); ?>"><i
                    class="wpdt-icon-eye-full column-control toggle-visibility"></i></span>
        <span class="pull-right wdt-column-block-icon" data-toggle="tooltip" title="<?php esc_attr_e('Show/hide on mobile'); ?>"><i
                    class="wpdt-icon-mobile-android-alt column-control wdt-toggle-show-on-mobile"></i></span>
        <span class="pull-right wdt-column-block-icon" data-toggle="tooltip" title="<?php esc_attr_e('Show/hide on tablet'); ?>"><i
                    class="wpdt-icon-mobile-android-alt column-control wdt-toggle-show-on-tablet"></i></span>
        <span class="pull-right" data-toggle="tooltip" title="<?php esc_attr_e('Open column settings'); ?>"><i
                    class="wpdt-icon-cog column-control open-settings"></i></span>
    </div>

</script>