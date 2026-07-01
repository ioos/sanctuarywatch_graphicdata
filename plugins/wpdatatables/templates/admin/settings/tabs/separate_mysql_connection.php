<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<?php
/**
 * User: Miljko Milosevic
 * Date: 1/20/17
 * Time: 1:08 PM
 */
?>

<div role="tabpanel" class="tab-pane" id="separate-mysql-connection">
    <div class="row">
        <div role="tabpanel" class="tab-pane" id="separate-connection" data-count="">
            <div class="row">
                <div class="separate-conn-not-available-notice" style="max-width: 1440px;margin: 0 auto;padding: 10px;text-align: center;">
                    <h4 class="f-14">
                        <i class="wpdt-icon-star-full m-r-5" style="color: #091D70;"></i>
                        <?php esc_html_e('Available from Standard licence', 'wpdatatables'); ?></h4>
                    <p class="m-b-0"><?php esc_html_e('Add more than one separate database connection. Now every table can have its own separate database connection, so tables can pull data from multiple databases and servers.', 'wpdatatables'); ?></p>
                    <p><?php esc_html_e('There are separate database connections for MySQL, MS SQL and PostgreSQL databases.', 'wpdatatables'); ?></p>
                    <button class="btn btn-primary wdt-upgrade-btn m-b-20">
                        <a rel="nofollow" target="_blank" href="<?php echo admin_url('admin.php?page=wpdatatables-lite-vs-premium'); ?>"> <?php esc_html_e('Upgrade', 'wpdatatables'); ?></a>
                    </button>
                    <img class="wdt-upgrade-img" src="<?php echo WDT_ASSETS_PATH ?>img/feature-preview-notice/starter/separate-db-connection.gif"
                         alt="wpDataTables Separate connection preview">
                </div>
            </div>
        </div>
    </div>
</div>
