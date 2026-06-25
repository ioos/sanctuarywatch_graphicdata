<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- Add/Edit Table Manager Modal -->
<div class="modal fade wpdt-c" id="wdt-table-manager-modal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <!-- Preloader -->
            <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
            <!-- /Preloader -->

            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true"><i class="wpdt-icon-times-full"></i></span>
                </button>
                <h4 class="modal-title"
                    id="wdt-table-manager-modal-title"><?php esc_html_e('Add Table Manager', 'wpdatatables'); ?></h4>
            </div>

            <div class="modal-body">
                <div class="row">
                    <div class="col-sm-12">
                        <h5 class="c-black m-b-10">
                            <?php esc_html_e('Select User', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('Choose the user to assign table permissions', 'wpdatatables'); ?>"></i>
                        </h5>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="select">
                                    <select class="selectpicker" id="wdt-table-user-select" data-live-search="true">
                                        <option value=""><?php esc_html_e('Select a user', 'wpdatatables'); ?></option>
                                        <?php
                                        $users = get_users();
                                        foreach ($users as $user) {
                                            if (in_array('administrator', (array)$user->roles, true)) continue;
                                            echo '<option value="' . intval($user->ID) . '">' . esc_html($user->user_login) . ' (' . esc_html($user->user_email) . ')</option>';
                                        }
                                        ?>
                                    </select>
                                </div>
                            </div>
                            <small class="text-danger user-error" id="wdt-table-user-error"
                                   style="display: none;"><?php esc_html_e('Please select a user', 'wpdatatables'); ?></small>
                        </div>
                    </div>

                    <div class="col-sm-12">
                        <h5 class="c-black m-b-10">
                            <?php esc_html_e('Permissions', 'wpdatatables'); ?>
                        </h5>
                        <div class="form-group">
                            <small class="text-danger permissions-error"
                                   style="display: none;"><?php esc_html_e('Please select at least one permission', 'wpdatatables'); ?></small>
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-table-perm-view" type="checkbox" value="wpdt_view_tables" checked>
                                <label for="wdt-table-perm-view" class="ts-label">
                                    <?php esc_html_e('Grant wpdt_view_tables Capability', 'wpdatatables'); ?>
                                </label>
                            </div>
                            <small class="text-muted d-block m-t-5"><?php esc_html_e('This grants the user the capability to view all tables or specific tables based on configuration below.', 'wpdatatables'); ?></small>
                        </div>
                    </div>

                    <div class="col-sm-12">
                        <div class="toggle-switch" data-ts-color="blue">
                            <input id="wdt-enable-specific-tables" type="checkbox">
                            <label for="wdt-enable-specific-tables" class="ts-label">
                                <?php esc_html_e('Enable Specific Tables Permission', 'wpdatatables'); ?>
                            </label>
                        </div>
                        <p class="m-t-5 m-b-10">
                            <small><?php esc_html_e('If unchecked, permissions will apply to all tables.', 'wpdatatables'); ?></small>
                        </p>
                    </div>

                    <div class="col-sm-12" id="wdt-specific-tables-container" style="display: none;">
                        <h5 class="c-black m-b-10">
                            <?php esc_html_e('Select Tables', 'wpdatatables'); ?>
                        </h5>
                        <div class="form-group">
                            <small class="text-danger items-error"
                                   style="display: none;"><?php esc_html_e('Please select at least one table', 'wpdatatables'); ?></small>
                            <div class="fg-line">
                                <div class="select">
                                    <select class="selectpicker" id="wdt-table-items-select" multiple
                                            data-live-search="true">
                                        <?php
                                        global $wpdb;
                                        $tables = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}wpdatatables ORDER BY title ASC", ARRAY_A);
                                        foreach ($tables as $table) {
                                            echo '<option value="' . intval($table['id']) . '">' . esc_html($table['title']) . '</option>';
                                        }
                                        ?>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <small class="text-danger form-general-error" style="display: none;"></small>
                <hr>
                <button type="button" class="btn btn-danger btn-icon-text" data-dismiss="modal">
                    <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-primary btn-icon-text" id="wdt-table-manager-submit">
                    <i class="wpdt-icon-save"></i>
                    <?php esc_html_e('Save', 'wpdatatables'); ?>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Add/Edit Chart Manager Modal -->
<div class="modal fade wpdt-c" id="wdt-chart-manager-modal" data-backdrop="static" data-keyboard="false" tabindex="-1"
     role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <!-- Preloader -->
            <?php include WDT_TEMPLATE_PATH . 'admin/common/preloader.inc.php'; ?>
            <!-- /Preloader -->

            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true"><i class="wpdt-icon-times-full"></i></span>
                </button>
                <h4 class="modal-title"
                    id="wdt-chart-manager-modal-title"><?php esc_html_e('Add Chart Manager', 'wpdatatables'); ?></h4>
            </div>

            <div class="modal-body">
                <div class="row">
                    <div class="col-sm-12">
                        <h5 class="c-black m-b-10">
                            <?php esc_html_e('Select User', 'wpdatatables'); ?>
                            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                               title="<?php esc_attr_e('Choose the user to assign chart permissions', 'wpdatatables'); ?>"></i>
                        </h5>
                        <div class="form-group">
                            <div class="fg-line">
                                <div class="select">
                                    <select class="selectpicker" id="wdt-chart-user-select" data-live-search="true">
                                        <option value=""><?php esc_html_e('Select a user', 'wpdatatables'); ?></option>
                                        <?php
                                        foreach ($users as $user) {
                                            echo '<option value="' . intval($user->ID) . '">' . esc_html($user->user_login) . ' (' . esc_html($user->user_email) . ')</option>';
                                        }
                                        ?>
                                    </select>
                                </div>
                            </div>
                            <small class="text-danger user-error" id="wdt-chart-user-error"
                                   style="display: none;"><?php esc_html_e('Please select a user', 'wpdatatables'); ?></small>
                        </div>
                    </div>

                    <div class="col-sm-12">
                        <h5 class="c-black m-b-10">
                            <?php esc_html_e('Permissions', 'wpdatatables'); ?>
                        </h5>
                        <div class="form-group">
                            <small class="text-danger permissions-error"
                                   style="display: none;"><?php esc_html_e('Please select at least one permission', 'wpdatatables'); ?></small>
                            <div class="toggle-switch" data-ts-color="blue">
                                <input id="wdt-chart-perm-view" type="checkbox" value="wpdt_view_charts" checked>
                                <label for="wdt-chart-perm-view" class="ts-label">
                                    <?php esc_html_e('Grant wpdt_view_charts Capability', 'wpdatatables'); ?>
                                </label>
                            </div>
                            <small class="text-muted d-block m-t-5"><?php esc_html_e('This grants the user the capability to view all charts or specific charts based on configuration below.', 'wpdatatables'); ?></small>
                        </div>
                    </div>

                    <div class="col-sm-12">
                        <div class="toggle-switch" data-ts-color="blue">
                            <input id="wdt-enable-specific-charts" type="checkbox">
                            <label for="wdt-enable-specific-charts" class="ts-label">
                                <?php esc_html_e('Enable Specific Charts Permission', 'wpdatatables'); ?>
                            </label>
                        </div>
                        <p class="m-t-5 m-b-10">
                            <small><?php esc_html_e('If unchecked, permissions will apply to all charts.', 'wpdatatables'); ?></small>
                        </p>
                    </div>

                    <div class="col-sm-12" id="wdt-specific-charts-container" style="display: none;">
                        <h5 class="c-black m-b-10">
                            <?php esc_html_e('Select Charts', 'wpdatatables'); ?>
                        </h5>
                        <div class="form-group">
                            <small class="text-danger items-error"
                                   style="display: none;"><?php esc_html_e('Please select at least one chart', 'wpdatatables'); ?></small>
                            <div class="fg-line">
                                <div class="select">
                                    <select class="selectpicker" id="wdt-chart-items-select" multiple
                                            data-live-search="true">
                                        <?php
                                        $charts = $wpdb->get_results("SELECT id, title FROM {$wpdb->prefix}wpdatacharts ORDER BY title ASC", ARRAY_A);
                                        foreach ($charts as $chart) {
                                            echo '<option value="' . intval($chart['id']) . '">' . esc_html($chart['title']) . '</option>';
                                        }
                                        ?>
                                    </select>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <small class="text-danger form-general-error" style="display: none;"></small>
                <hr>
                <button type="button" class="btn btn-danger btn-icon-text" data-dismiss="modal">
                    <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-primary btn-icon-text" id="wdt-chart-manager-submit">
                    <i class="wpdt-icon-save"></i>
                    <?php esc_html_e('Save', 'wpdatatables'); ?>
                </button>
            </div>
        </div>
    </div>
</div>

<!-- Delete Permission Modal -->
<div class="modal fade wpdt-c in" id="wdt-delete-permission-modal" style="display: none" data-backdrop="static"
     data-keyboard="false"
     tabindex="-1" role="dialog" aria-hidden="true">
    <div class="modal-dialog">
        <div class="modal-content">
            <div class="modal-header">
                <button type="button" class="close" data-dismiss="modal" aria-label="Close">
                    <span aria-hidden="true"><i class="wpdt-icon-times-full"></i></span>
                </button>
                <h4 class="modal-title"><?php esc_html_e('Are you sure?', 'wpdatatables') ?></h4>
            </div>

            <div class="modal-body">
                <div class="row">
                    <div class="col-sm-12">
                        <small><?php esc_html_e('Please confirm deletion. There is no undo!', 'wpdatatables'); ?></small>
                    </div>
                </div>
            </div>

            <div class="modal-footer">
                <hr>
                <button type="button" class="btn btn-icon-text" data-dismiss="modal">
                    <?php esc_html_e('Cancel', 'wpdatatables'); ?>
                </button>
                <button type="button" class="btn btn-danger btn-icon-text" id="wdt-confirm-delete-permission">
                    <i class="wpdt-icon-trash"></i>
                    <?php esc_html_e('Delete', 'wpdatatables'); ?>
                </button>
            </div>
        </div>
    </div>
</div>

