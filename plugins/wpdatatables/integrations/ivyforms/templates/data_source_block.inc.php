<?php defined('ABSPATH') or die('Access denied.');

use IvyForms\Services\API\IvyFormsAPI;

// Check if IvyForms is installed and active
$ivyforms_installed = class_exists('IvyForms\Services\API\IvyFormsAPI') && IvyFormsAPI::isPluginActive();
$integration_enabled = false;
$forms = [];
$ivyforms_needs_update = false;

if ($ivyforms_installed) {
    // Check version - first IvyForms version with integration is 0.5
    if (defined('IVYFORMS_VERSION') && version_compare(IVYFORMS_VERSION, '0.5', '<')) {
        $ivyforms_needs_update = true;
    }
    if (method_exists('IvyForms\Services\API\IvyFormsAPI', 'isIntegrationEnabled')) {
        $integration_enabled = IvyFormsAPI::isIntegrationEnabled('wpdatatables');
    }
    if ($integration_enabled) {
        // Use only forms with wpDataTables integration enabled
        $forms = isset($forms_for_template) ? $forms_for_template : IvyFormsAPI::getFormsWithIntegrationEnabled('wpdatatables');
    }
}
?>

<?php if (!$ivyforms_installed): ?>
    <!-- IvyForms Not Installed -->
    <div class="col-sm-12 hidden" id="wdt-ivyforms-form-container">
        <div class="alert alert-info" role="alert">
            <h4 class="m-t-0 m-b-16">
                <i class="wpdt-icon-info-circle-full"></i>
                <?php esc_html_e('IvyForms Plugin Required', 'wpdatatables'); ?>
            </h4>
            <p class="m-b-16">
                <?php esc_html_e('To create data tables from IvyForms submissions, you need to install and activate the IvyForms plugin.', 'wpdatatables'); ?>
            </p>
            <p class="m-b-0">
                <button id="ivyforms-one-click-install" class="btn btn-primary">
                    <i class="wpdt-icon-download"></i>
                    <?php esc_html_e('Install & Activate IvyForms', 'wpdatatables'); ?>
                </button>
                <span id="ivyforms-install-status"></span>
                <input type="hidden" id="ivyforms-install-nonce" value="<?php echo wp_create_nonce('ivyforms_install'); ?>">
            </p>
        </div>
    </div>
<?php elseif ($ivyforms_needs_update): ?>
    <!-- IvyForms Installed but Needs Update -->
    <div class="col-sm-12 hidden" id="wdt-ivyforms-form-container">
        <div class="alert alert-warning" role="alert">
            <h4 class="m-t-0 m-b-16">
                <i class="wpdt-icon-info-circle-full"></i>
                <?php esc_html_e('IvyForms Plugin Update Required', 'wpdatatables'); ?>
            </h4>
            <p class="m-b-16">
                <?php esc_html_e('Your IvyForms plugin version is outdated. Please update to version 0.5 or newer to use all features.', 'wpdatatables'); ?>
            </p>
            <p class="m-b-0">
                <button id="ivyforms-one-click-update" class="btn btn-primary">
                    <i class="wpdt-icon-download"></i>
                    <?php esc_html_e('Update IvyForms', 'wpdatatables'); ?>
                </button>
                <span id="ivyforms-update-status"></span>
                <input type="hidden" id="ivyforms-update-nonce" value="<?php echo wp_create_nonce('ivyforms_install'); ?>">
            </p>
        </div>
    </div>
<?php elseif (!$integration_enabled): ?>
    <!-- IvyForms Installed but Integration Disabled -->
    <div class="col-sm-12 hidden" id="wdt-ivyforms-form-container">
        <div class="alert" role="alert">
            <h4 class="m-t-0 m-b-16">
                <i class="wpdt-icon-info-circle-full"></i>
                <?php esc_html_e('Enable wpDataTables Integration', 'wpdatatables'); ?>
            </h4>
            <p class="m-b-16">
                <?php esc_html_e('The wpDataTables integration is currently disabled in IvyForms settings. Please enable it to create data tables from form submissions.', 'wpdatatables'); ?>
            </p>
            <p class="m-b-0">
                <a href="<?php echo admin_url('admin.php?page=ivyforms-integrations#/'); ?>"
                   class="btn btn-primary">
                    <i class="wpdt-icon-cog"></i>
                    <?php esc_html_e('Enable Integration', 'wpdatatables'); ?>
                </a>
            </p>
        </div>
    </div>
<?php else: ?>
    <!-- IvyForms Installed and Integration Enabled -->
    <div class="col-sm-6 hidden" id="wdt-ivyforms-form-container">
        <h4 class="c-title-color m-b-2">
            <?php esc_html_e('Choose an Ivy Form', 'wpdatatables'); ?>
            <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right" title=""
               data-original-title="Please choose an Ivy Form that will be used as data source for wpDataTable"></i>
        </h4>
        <div class="form-group">

            <select class="selectpicker" id="wdt-ivyforms-form-picker" data-live-search="true">
                <option value=""><?php esc_html_e('Choose a form', 'wpdatatables'); ?></option>
                <?php if (!empty($forms)) {
                    foreach ($forms as $form) { ?>
                        <option value="<?php echo esc_attr($form->getId()); ?>">
                            <?php echo esc_html($form->getName()); ?>
                        </option>
                    <?php }
                } else { ?>
                    <option disabled><?php esc_html_e('No forms with wpDataTables integration enabled', 'wpdatatables'); ?></option>
                <?php } ?>
            </select>
        </div>
    </div>
<?php endif; ?>
