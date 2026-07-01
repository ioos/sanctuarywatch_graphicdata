<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- IvyForms settings -->
<div role="tabpanel" class="tab-pane" id="ivyforms-settings">
    <!-- .row -->
    <div class="row">
        <!-- Date Range Filter -->
        <div class="col-sm-3 wdt-ivyforms-filter-by-date-range-block">
            <h4 class="c-title-color m-b-4">
                <?php esc_html_e('Entry date range', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Filter form entries by submission date range', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <label for="wdt-ivyforms-date-filter-from" class="sr-only"><?php esc_html_e('From Date', 'wpdatatables'); ?></label>
                <input class="form-control wdt-datepicker" id="wdt-ivyforms-date-filter-from"
                       placeholder="<?php esc_attr_e('From', 'wpdatatables'); ?>"/>
            </div>
            <div class="form-group">
                <label for="wdt-ivyforms-date-filter-to" class="sr-only"><?php esc_html_e('To Date', 'wpdatatables'); ?></label>
                <input class="form-control wdt-datepicker" id="wdt-ivyforms-date-filter-to"
                       placeholder="<?php esc_attr_e('To', 'wpdatatables'); ?>"/>
            </div>
        </div>
        <!-- User ID Filter -->
        <div class="col-sm-3 wdt-ivyforms-filter-by-user-block">
            <h4 class="c-title-color m-b-4">
                <?php esc_html_e('User ID', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Filter form entries by a specific user ID', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <label for="wdt-ivyforms-filter-by-user" class="sr-only"><?php esc_html_e('User ID', 'wpdatatables'); ?></label>
                <input type="number" class="form-control" id="wdt-ivyforms-filter-by-user"
                       placeholder="<?php esc_attr_e('Enter User ID', 'wpdatatables'); ?>" min="0"/>
            </div>
        </div>
        <!-- Starred Filter -->
        <div class="col-sm-3 wdt-ivyforms-filter-by-starred-block">
            <h4 class="c-title-color m-b-4">
                <?php esc_html_e('Starred entries', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Show only starred/favorited entries', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <div class="toggle-switch" data-ts-color="blue">
                    <label for="wdt-ivyforms-filter-by-starred" class="ts-label"><?php esc_html_e('Show only starred', 'wpdatatables'); ?></label>
                    <input id="wdt-ivyforms-filter-by-starred" type="checkbox">
                    <label for="wdt-ivyforms-filter-by-starred" class="ts-helper"></label>
                </div>
            </div>
        </div>
        <!-- Read/Unread Filter -->
        <div class="col-sm-3 wdt-ivyforms-filter-by-read-block">
            <h4 class="c-title-color m-b-4">
                <?php esc_html_e('Entry status', 'wpdatatables'); ?>
                <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                   title="<?php esc_attr_e('Filter entries by their read/unread status', 'wpdatatables'); ?>"></i>
            </h4>
            <div class="form-group">
                <label for="wdt-ivyforms-filter-by-read" class="sr-only"><?php esc_html_e('Entry Status', 'wpdatatables'); ?></label>
                <select class="form-control selectpicker" id="wdt-ivyforms-filter-by-read">
                    <option value=""><?php esc_html_e('All entries', 'wpdatatables'); ?></option>
                    <option value="read"><?php esc_html_e('Read entries only', 'wpdatatables'); ?></option>
                    <option value="unread"><?php esc_html_e('Unread entries only', 'wpdatatables'); ?></option>
                </select>
            </div>
        </div>
    </div>
    <!-- /.row -->
</div>
<!-- /IvyForms settings -->

