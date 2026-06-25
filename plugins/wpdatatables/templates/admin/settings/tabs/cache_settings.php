<?php defined('ABSPATH') or die('Access denied.');
global $wpdb;
?>

<div role="tabpanel" class="tab-pane" id="cache-settings">

	<div class="row">
		<div class="col-sm-6 auto-update-cache-option">
			<h5 class="c-title-color m-b-2">
				<?php esc_html_e('Auto update cache for tables', 'wpdatatables'); ?>
				<i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
				   title="<?php esc_attr_e('When this is turn on, each non serverside datatables (created from Excel, CSV, XML, JSON, Nested JSON, Google Spreadsheet or PHP array), if table option "Cache table" is turn on, will be shown new option Auto update cache and you can turn on it for datatables that you need. By default it is turn off.', 'wpdatatables'); ?>"></i>
			</h5>
			<div class="toggle-switch" data-ts-color="blue">
				<input type="checkbox" name="wdt-auto-update-option" id="wdt-auto-update-option"/>
				<label for="wdt-auto-update-option" class="ts-label"><?php esc_html_e('Enable for all non-server side tables', 'wpdatatables'); ?></label>
			</div>
		</div>
	</div>
	<div class="row auto-update-cache-instructions hidden">
		<div class="col-sm-12">
			<div class="alert alert-info alert-dismissible m-t-20" role="alert">
				<i class="wpdt-icon-info-circle-full"></i>
				<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
						aria-hidden="true"><i
							class="wpdt-icon-times-full"></i></span></button>
				<span class="wdt-alert-title f-600">
                       <?php esc_html_e('Detail instruction how to set cache, auto update cache you can find on this', 'wpdatatables'); ?>
                        <a href="https://wpdatatables.com/documentation/table-features/caching-data-and-auto-update-cache-in-wordpress-tables/" target="_blank"><?php esc_html_e('link', 'wpdatatables'); ?></a>.
                    </span>
				<span class="wdt-alert-subtitle m-t-20">
                    <p>First, you will need to create non-serverside table (created from Excel, CSV, XML, JSON, Nested JSON, Google Spreadsheet or PHP array). On <strong>"Data source"</strong> tab in table settings you will find new option <strong>"Cache Data"</strong>. When you turn on, new option will be shown <strong>"Auto update cache"</strong>. If you turn on this option in table, then you will need to set the cron job like it is explained below.</p>
                    <p>Auto update cache for tables requires a bit of additional configuration with your server cron scheduler. If you want to run a cron (do auto update cache) every 15 minutes, copy the command below and paste it into the cron file.</p>
                    <p class="m-l-20"><strong>*/15 * * * * <?php echo get_site_url(); ?>/wp-admin/admin-ajax.php?action=wdtable_update_cache&wdtable_cache_verify=<?php echo get_option('wdtAutoUpdateHash'); ?></strong></p>
                    <p>If that doesn’t work, please try these as well:</p>
                    <p class="m-l-20"><strong>*/15 * * * * wget -q -O – "<?php echo get_site_url(); ?>/wp-admin/admin-ajax.php?action=wdtable_update_cache&wdtable_cache_verify=<?php echo get_option('wdtAutoUpdateHash'); ?>"</strong></p>
                    <p class="m-l-20"><strong>*/15 * * * * /usr/local/bin/php ~/public_html/wp-cron.php –action='wdtable_update_cache' –wdtable_cache_verify='<?php echo get_option('wdtAutoUpdateHash'); ?>'</strong></p>
                    <p class="m-l-20"><strong>GET '<?php echo get_site_url(); ?>/wp-admin/admin-ajax.php?action=wdtable_update_cache&wdtable_cache_verify=<?php echo get_option('wdtAutoUpdateHash'); ?>' > /dev/null</strong></p>
                    <p>If you need different schedule time, you can see the more detailed tutorial on how to set up cron jobs on this <a href="https://www.taniarascia.com/setting-up-a-basic-cron-job-in-linux/" target="_blank">link</a>.</p>
                    <p>If you are not familiar with this, you can use the plugin <a href="https://wordpress.org/plugins/wp-crontrol/" target="_blank">WP Crontrol</a> for creating a cronjob.</p>
                    <p>First, copy this: <?php echo get_site_url(); ?>/wp-admin/admin-ajax.php?action=wdtable_update_cache&wdtable_cache_verify=<?php echo get_option('wdtAutoUpdateHash'); ?></p>
                    <p>Then, go to <strong>Tools -> Cron Events</strong> admin panel, and click on the <strong>“Cron Schedules”</strong> tab. In it, add a 15-minute interval.</p>
                    <p>Now go back to the <strong>“Cron Events”</strong> tab, and click on <strong>“Add New”</strong>.</p>
                    <p>Below it, select the <strong>“PHP Cron event”</strong> radio button, and add the URL you copied:</p>
                    <p class="m-l-20"><strong>file_get_contents("<?php echo get_site_url(); ?>/wp-admin/admin-ajax.php?action=wdtable_update_cache&wdtable_cache_verify=<?php echo get_option('wdtAutoUpdateHash'); ?>");</strong></p>
                    <p>You don’t need to provide the PHP opening tag ("&lt;?php").</p>
                    <p>Set the <strong>Event name</strong>, and set the next run to be <strong>“At”</strong>, and a few minutes in the future. Select the recurrence (the event you created as the first step, in WP Crontrol – the “every_15_minutes” interval) and that’s it.</p>
                    </span>
			</div>
		</div>
		<div class="col-sm-12">
			<div class="alert alert-info alert-dismissible" role="alert">
				<button type="button" class="close" data-dismiss="alert" aria-label="Close"><span
						aria-hidden="true"><i
							class="wpdt-icon-times-full"></i></span></button>
				<span class="wdt-alert-subtitle">
                       <p>If you use "Auto update cache for tables" option and your table cache is not updated, please follow these instructions for troubleshooting:</p>
                        <ul class="m-l-20" style="list-style: disc;">
                             <li>First, check in your table if options <strong>"Cache table"</strong> and <strong>"Auto update cache"</strong> are turned on.</li>
                            <li>Then, you can run manually this URL in browser:</li>
                            <li><strong><?php echo get_site_url(); ?>/wp-admin/admin-ajax.php?action=wdtable_update_cache&wdtable_cache_verify=<?php echo get_option('wdtAutoUpdateHash'); ?></strong></li>
                            <li>to check if auto update is working.</li>
                            <li>If data in table is updated, then check with your hosting provider if your cron job is set properly.</li>
                            <li>When that is set, you need to check if there are any errors after cron execution.</li>
                            <li>You can check error log on your server.</li>
                            <li>If you are facing some issues, contact us using this
                                <a href="https://tmsplugins.ticksy.com/" target="_blank"><?php esc_html_e('link', 'wpdatatables'); ?></a>.
                            </li>
                        </ul>
                    </span>

			</div>
		</div>
		<div class="col-sm-12">
			<button id="wdt-delete-log-errors-cache" class="btn btn-danger">
				<?php esc_html_e('Delete errors log', 'wpdatatables'); ?>
			</button>
		</div>
	</div>
</div>

<!-- Error modal -->
<?php include WDT_TEMPLATE_PATH . 'admin/common/error_modal.inc.php'; ?>
<!-- /Error modal -->