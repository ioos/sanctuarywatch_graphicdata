<?php defined('ABSPATH') or die('Access denied.'); ?>

<!-- .wdt-datatables-admin-wrap .wrap -->
<div class="wrap wdt-datatables-admin-wrap">

    <!-- .container -->
    <div class="container wdt-system-info">

        <!-- .row -->
        <div class="row">

            <div class="card card-head m-b-0">
                <?php wp_nonce_field('wdtSystemInfoNonce', 'wdtNonce'); ?>
                <div class="card-header wdt-admin-card-header ch-alt">
                    <img id="wpdt-inline-logo"
                         src="<?php echo WDT_ROOT_URL; ?>assets/img/logo.svg"/>
                    <h2>
                        <a href="<?php echo admin_url('admin.php?page=wpdatatables-dashboard'); ?>">
                            <i class="wpdt-icon-chevron-left"></i>
                        </a>
                        <span style="display: none">wpDataTables System Info</span>
                        <?php esc_html_e('System Info', 'wpdatatables'); ?>
                    </h2>
                    <ul class="actions">
                        <li>
                            <button class="btn btn-default btn-icon-text wdt-documentation"
                                    data-doc-page="system_info_page">
                                <i class="wpdt-icon-file-thin"></i>
                                <?php esc_html_e('View Documentation', 'wpdatatables'); ?>
                            </button>
                            <button class="btn btn-primary m-l-5"
                                    id="wdt-copy-table">
                                <i class="wpdt-icon-copy m-r-5"></i>
                                <?php esc_html_e('Copy System Info data', 'wpdatatables'); ?>
                            </button>
                        </li>
                    </ul>
                </div>

            </div>

        </div>
        <!-- /.row -->

        <div class="row">
            <div class="card wdt-system-info-card m-b-0">
                <div id="wdt-system-info-tables">
                    <!-- Table Wordpress environment data -->
                    <table class="wdt-system-info-table" cellspacing="0">
                        <thead>
                        <tr>
                            <th colspan="3"
                                data-export-label="WordPress Environment"><?php esc_html_e('WordPress Environment', 'wpdatatables'); ?></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td data-export-label="Home URL"><?php esc_html_e('Home URL:', 'wpdatatables'); ?></td>
                            <td data-export-data><?php echo esc_url_raw(home_url()); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The URL of your site\'s homepage.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Site URL"><?php esc_html_e('Site URL:', 'wpdatatables'); ?></td>
                            <td data-export-data><?php echo esc_url_raw(site_url()); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The root URL of your site.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="WP Content Path"><?php esc_html_e('WP Content Path:', 'wpdatatables'); ?></td>
                            <td><?php echo defined('WP_CONTENT_DIR') ? esc_html(WP_CONTENT_DIR) : esc_html__('N/A', 'wpdatatables'); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('System path of your wp-content directory.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="WP Path"><?php esc_html_e('WP Path:', 'wpdatatables'); ?></td>
                            <td><?php echo defined('ABSPATH') ? esc_html(ABSPATH) : esc_html__('N/A', 'wpdatatables'); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('System path of your WP root directory.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="WP Version"><?php esc_html_e('WP Version:', 'wpdatatables'); ?></td>
                            <td><?php bloginfo('version'); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The version of WordPress installed on your site.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="WP Multisite"><?php esc_html_e('WP Multisite:', 'wpdatatables'); ?></td>
                            <td class="wpdt-relative"><?php echo (is_multisite()) ? 'Yes' : 'No'; ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('Displays whether or not you have WordPress Multisite enabled.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <?php
                        // Get the memory from PHP's configuration.
                        $memory = ini_get('memory_limit');
                        // If we can't get it, fallback to WP_MEMORY_LIMIT.
                        if (!$memory || -1 === $memory) {
                            $memory = wp_convert_hr_to_bytes(WP_MEMORY_LIMIT);
                        }
                        // Make sure the value is properly formatted in bytes.
                        if (!is_numeric($memory)) {
                            $memory = wp_convert_hr_to_bytes($memory);
                        }
                        ?>
                        <tr <?php if ($memory < 128000000) echo "class='wpdt-warning-bg'" ?>>
                            <td data-export-label="PHP Memory Limit"><?php esc_html_e('PHP Memory Limit:', 'wpdatatables'); ?>

                                <?php if ($memory < 128000000) : ?>
                                <i class="wpdt-icon-info-circle wpdt-warning"></i>
                            </td>
                            <td>
                                <span class="wpdt-warning">
                                        <?php /* translators: %1$s: Current value. %2$s: URL. */ ?>
                                    <?php printf(__('%1$s </span> - We recommend setting memory to at least <strong>128MB</strong>. Please define memory limit in <strong>wp-config.php</strong> file. To learn how, see: <a href="%2$s" target="_blank" rel="noopener noreferrer">Increasing memory allocated to PHP.</a>', 'wpdatatables'), esc_attr(size_format($memory)), 'http://codex.wordpress.org/Editing_wp-config.php#Increasing_memory_allocated_to_PHP'); // WPCS: XSS ok. ?>

                                    <?php else : ?>
                            <td>
                                <span class="wpdt-blue-color">
                                        <?php echo esc_html(size_format($memory)); ?>
                                    </span>
                                <?php endif; ?>
                            </td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The maximum amount of memory (RAM) that your site can use at one time.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="WP Debug Mode"><?php esc_html_e('WP Debug Mode:', 'wpdatatables'); ?></td>
                            <td class="wpdt-relative">
                                <?php if (defined('WP_DEBUG') && WP_DEBUG) : ?>
                                    <?php esc_html_e('Active', 'wpdatatables'); ?>
                                <?php else : ?>
                                    <span class="no"><?php esc_html_e('Inactive', 'wpdatatables'); ?></span>
                                <?php endif; ?>
                            </td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('Displays whether or not WordPress is in Debug Mode.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Language"><?php esc_html_e('Language:', 'wpdatatables'); ?></td>
                            <td><?php echo esc_attr(get_locale()); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The current language used by WordPress. Default = English', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <!-- /Table Wordpress environment data -->

                    <!-- Table Server data -->
                    <table class="wdt-system-info-table m-t-40" cellspacing="0">
                        <thead>
                        <tr>
                            <th colspan="3"
                                data-export-label="Server Environment"><?php esc_html_e('Server Environment', 'wpdatatables'); ?></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td data-export-label="WP Path"><?php esc_html_e('Operating System: ', 'wpdatatables'); ?></td>
                            <td><?php echo defined('PHP_OS') ? esc_html(PHP_OS) : esc_html__('N/A', 'wpdatatables'); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('Information about your operating system.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Server Info">
                                <?php esc_html_e('Server Info:', 'wpdatatables'); ?></td>
                            <td><?php echo isset($_SERVER['SERVER_SOFTWARE']) ? esc_html(sanitize_text_field(wp_unslash($_SERVER['SERVER_SOFTWARE']))) : esc_html__('Unknown', 'wpdatatables'); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('Information about the web server that is currently hosting your site.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <?php
                        if ( version_compare( WDT_PHP_SERVER_VERSION, WDT_REQUIRED_PHP_VERSION, '<' ) ) {
                            $message = sprintf(
                            /* translators: %1$s: Minimum PHP version for wpdt. %2$s: Current PHP version. %3$s: Recommended PHP version. %4$s: "WordPress Requirements" link. */
                                esc_attr__('Our plugin require %1$s PHP Version or higher. Your Version: %2$s. WordPress recommendation: %3$s or above. See %4$s for details.', 'wpdatatables'),
                                WDT_REQUIRED_PHP_VERSION,
                                WDT_PHP_SERVER_VERSION,
                                '7.4',
                                '<a href="https://wordpress.org/about/requirements/" target="_blank">' . esc_html__('WordPress Requirements', 'wpdatatables') . '</a>'
                            );
                        } else {
                            $message = WDT_PHP_SERVER_VERSION;
                        }
                        ?>
                        <tr <?php if (version_compare( WDT_PHP_SERVER_VERSION, WDT_REQUIRED_PHP_VERSION, '<' )) echo 'class="wpdt-warning-bg"' ?>>
                            <td data-export-label="PHP Version"><?php esc_attr_e('PHP Version:', 'wpdatatables'); ?>
                                <?php if (version_compare( WDT_PHP_SERVER_VERSION, WDT_REQUIRED_PHP_VERSION, '>=' )) : ?>
                            </td>
                            <td>
                                <?php echo $message; // WPCS: XSS ok. ?>
                            </td>
                            <?php else : ?>
                                <i class="wpdt-icon-info-circle wpdt-warning"></i></td>
                                <td class="wpdt-warning">
                                    <?php echo $message; // WPCS: XSS ok. ?>
                                </td>
                            <?php endif; ?>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The version of PHP installed on your hosting server.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <?php if (function_exists('ini_get')) : ?>
                            <tr>
                                <td data-export-label="PHP Post Max Size">
                                    <?php esc_attr_e('PHP Post Max Size:', 'wpdatatables'); ?>
                                </td>
                                <td><?php echo esc_html(size_format(wp_convert_hr_to_bytes(ini_get('post_max_size')))); ?></td>
                                <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip"
                                                    data-placement="left"
                                                    title="<?php esc_attr_e('The largest file size that can be contained in one post.', 'wpdatatables'); ?>"></i>
                                </td>
                            </tr>
                            <?php $time_limit = ini_get('max_execution_time'); ?>
                            <tr <?php if (180 > $time_limit && 0 != $time_limit) echo 'class="wpdt-warning-bg"'; ?>>
                                <td data-export-label="PHP Time Limit"><?php esc_html_e('PHP Time Limit:', 'wpdatatables'); ?>
                                    <?php
                                    if (180 > $time_limit && 0 != $time_limit) {
                                        /* translators: %1$s: Current value. %2$s: URL. */
                                        echo '<i class="wpdt-icon-info-circle wpdt-warning"></i></td><td><span class="wpdt-warning">' . sprintf(__('%1$s </span> - We recommend setting max execution time to at least 180.<br />See: <a href="%2$s" target="_blank" rel="noopener noreferrer">Increasing max execution to PHP</a>', 'wpdatatables'), $time_limit, 'https://wordpress.org/support/article/common-wordpress-errors/#php-errors'); // WPCS: XSS ok.
                                    } else {
                                        echo '</td><td><span class="wpdt-blue-color">' . esc_html($time_limit) . '</span>';
                                    }
                                    ?>
                                </td>
                                <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip"
                                                    data-placement="left"
                                                    title="<?php esc_attr_e('The amount of time (in seconds) that your site will spend on a single operation before timing out (to avoid server lockups)', 'wpdatatables'); ?>"></i>
                                </td>
                            </tr>

                        <?php endif; ?>

                        <tr>
                            <td data-export-label="MySQL Version">
                                <?php esc_attr_e('MySQL Version:', 'wpdatatables'); ?>
                            </td>
                            <td>
                                <?php global $wpdb; ?>
                                <?php echo esc_html($wpdb->db_version()); ?>
                            </td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The version of MySQL installed on your hosting server.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Max Upload Size"><?php esc_html_e('Max Upload Size:', 'wpdatatables'); ?></td>
                            <td><?php echo esc_attr(size_format(wp_max_upload_size())); ?>
                            </td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The largest file size that can be uploaded to your WordPress installation.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Multibyte String">
                                <?php esc_html_e('Multibyte String:', 'wpdatatables'); ?>

                                <?php if (extension_loaded('mbstring')) { ?>
                            </td>
                            <td class="wpdt-relative">
                                <span class="wpdt-inline"><?php esc_html_e('Installed', 'wpdatatables'); ?></span>
                            </td>

                            <?php } else { ?>
                                <i class="wpdt-icon-exclamation-triangle wpdt-error"></i>
                                </td>
                                <td class="wpdt-relative">
                                    <span class="wpdt-inline wpdt-error"><?php esc_html_e('Not installed', 'wpdatatables'); ?></span>
                                    <span class="wpdt-inline"><?php esc_html_e('- Please install or enable PHP mbstring Extension on your server.', 'wpdatatables'); ?></span>
                                </td>

                            <?php } ?>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('Multibyte String (mbstring) is used to convert character encoding.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="XML extension"><?php esc_html_e('XML extension:', 'wpdatatables'); ?>
                                <?php if (extension_loaded('xml')) { ?>
                            </td>
                            <td class="wpdt-relative">
                                <span class="wpdt-inline"><?php esc_html_e('Installed', 'wpdatatables'); ?></span>
                            </td>
                            <?php } else { ?>
                                <i class="wpdt-icon-exclamation-triangle wpdt-error"></i>
                                </td>
                                <td class="wpdt-relative">
                                    <span class="wpdt-inline wpdt-error"><?php esc_html_e('Not installed - Please install or enable PHP XML Extension on your server.', 'wpdatatables'); ?></span>
                                </td>
                            <?php } ?>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('XML support is something that needs to be installed on the server for proper wpDataTables functionality.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="DOM extension"><?php esc_html_e('DOM extension:', 'wpdatatables'); ?>
                                <?php if (extension_loaded('dom')) { ?>
                            </td>
                            <td class="wpdt-relative">
                                <span class="wpdt-inline"><?php esc_html_e('Installed', 'wpdatatables'); ?></span>
                            </td>
                            <?php } else { ?>
                                <i class="wpdt-icon-exclamation-triangle wpdt-error"></i>
                                </td>
                                <td class="wpdt-relative">
                                    <span class="wpdt-inline wpdt-error"><?php esc_html_e('Not installed - Please install or enable PHP DOM Extension on your server.', 'wpdatatables'); ?></span>
                                </td>
                            <?php } ?>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('DOM support is something that needs to be installed on the server for proper wpDataTables functionality.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Libxml extension">
                                <?php esc_html_e('Libxml extension: ', 'wpdatatables'); ?>

                                <?php
                                if (extension_loaded('libxml')) {
                                ?>
                                <?php if (defined('LIBXML_VERSION') && LIBXML_VERSION && LIBXML_VERSION > 20760) { ?>
                            </td>
                            <td class="wpdt-relative">
                                <span class="wpdt-inline">
                                            <?php if (defined('LIBXML_DOTTED_VERSION') && LIBXML_DOTTED_VERSION) {
                                                printf(esc_attr__('Installed - Version:  %s', 'wpdatatables'), LIBXML_DOTTED_VERSION);
                                            } ?>
                                        </span>
                            </td>
                            <?php } else { ?>
                                <i class="wpdt-icon-exclamation-triangle wpdt-error"></i>
                                </td>
                                <td class="wpdt-relative">
                                    <span class="wpdt-inline wpdt-error"><?php esc_html_e('Lower version then required', 'wpdatatables'); ?></span>
                                    <span class="wpdt-inline"><?php esc_html_e('- Please update PHP LibXML Extension on your server to be higher then version 2.7.6.', 'wpdatatables'); ?></span>
                                </td>
                            <?php } ?>
                            <?php } else { ?>
                                <i class="wpdt-icon-exclamation-triangle wpdt-error"></i>
                                </td>
                                <td class="wpdt-relative">
                                    <span class="wpdt-inline wpdt-error"><?php esc_html_e('Not installed', 'wpdatatables'); ?></span>
                                    <span class="wpdt-inline"><?php esc_html_e('- Please install or enable PHP libxml Extension on your server.', 'wpdatatables'); ?></span>
                                </td>
                            <?php } ?>
                            <td class="help"><i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('Multibyte String (mbstring) require libxml to be installed. ', 'wpdatatables'); ?>"></i>
                            </td>

                        </tr>
                        <tr>
                            <td data-export-label="PDO"><?php esc_attr_e('PDO extension:', 'wpdatatables'); ?>
                                <?php if (extension_loaded('pdo')) { ?>
                            </td>
                            <td class="wpdt-relative">
                                <span class="wpdt-inline"><?php esc_html_e('Installed', 'wpdatatables'); ?></span>
                                <?php $pdoDriversArray = pdo_drivers();
                                $pdoDrivers = implode(", ", pdo_drivers());
                                ?>
                                <span><?php echo " - PDO Drivers: " . esc_html($pdoDrivers); ?></span>
                            </td>
                            <?php } else { ?>
                                <i class="wpdt-icon-exclamation-triangle wpdt-error"></i>
                                </td>
                                <td class="wpdt-relative">
                                    <span class="wpdt-inline wpdt-warning"><?php esc_html_e('Not installed', 'wpdatatables'); ?></span>
                                    <span class="wpdt-inline"><?php esc_html_e('- Please install or enable PHP pdo Extension on your server so you can use separate DB connection. (MS SQL and PostgreSQL)', 'wpdatatables'); ?></span>
                                </td>
                            <?php } ?>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('PDO is used to connect to separate database connection like MS SQL and PostgreSQL.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Zip extension"><?php esc_html_e('Zip extension:', 'wpdatatables'); ?>
                                <?php if (class_exists('ZipArchive')) { ?>
                            </td>
                            <td class="wpdt-relative">
                                <span class="wpdt-inline"><?php esc_html_e('Installed', 'wpdatatables'); ?></span>
                            </td>
                            <?php } else { ?>
                                <i class="wpdt-icon-exclamation-triangle wpdt-error"></i>
                                </td>
                                <td class="wpdt-relative">
                                    <span class="wpdt-inline wpdt-error"><?php esc_html_e('Not installed', 'wpdatatables'); ?></span>
                                    <span class="wpdt-inline"><?php esc_html_e(' - Please install or enable PHP Zip Extension on your server.', 'wpdatatables'); ?></span>
                                </td>
                            <?php } ?>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('ZIP support is something that needs to be installed on the server, as a package for the Linux operating system, or rather to the PHP software on the server.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Curl extension"><?php esc_attr_e('Curl extension:', 'wpdatatables'); ?>
                                <?php if (extension_loaded('curl')) { ?>
                            </td>
                            <td class="wpdt-relative">
                                <span class="wpdt-inline"><?php $values = curl_version();

                                    printf(esc_attr__('Installed - Version:  %s', 'wpdatatables'), $values['version']); ?></span>
                            </td>
                            <?php } else { ?>
                                <i class="wpdt-icon-exclamation-triangle wpdt-error"></i>
                                </td>
                                <td class="wpdt-relative">
                                    <span class="wpdt-inline wpdt-error"><?php esc_html_e('Not installed', 'wpdatatables'); ?></span>
                                    <span class="wpdt-inline"><?php esc_html_e('- Please install or enable PHP cURL Extension on your server.', 'wpdatatables'); ?></span>
                                </td>
                            <?php } ?>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('wpDataTables use cURL for getting data from other servers.', 'wpdatatables'); ?>"></i>
                            </td>

                        </tr>
                        </tbody>
                    </table>
                    <!-- /Table Server data -->

                    <!-- Table Theme data -->
                    <table class="wdt-system-info-table m-t-40" cellspacing="0">
                        <?php
                        $themeObject = wp_get_theme();
                        ?>
                        <thead>
                        <tr>
                            <th colspan="3" data-export-label="Theme"><?php esc_html_e('Theme', 'wpdatatables'); ?></th>
                        </tr>
                        </thead>
                        <tbody>
                        <tr>
                            <td data-export-label="Name"><?php esc_html_e('Name', 'wpdatatables'); ?>:</td>
                            <td><?php echo esc_html($themeObject->get('Name')); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The name of the current active theme.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Version"><?php esc_html_e('Version', 'wpdatatables'); ?>:</td>
                            <td>
                                <?php
                                echo esc_html($themeObject->get('Version'));
                                ?>
                            </td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The installed version of the current active theme.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        <tr>
                            <td data-export-label="Author URL"><?php esc_html_e('Author', 'wpdatatables'); ?>:</td>
                            <td><?php echo esc_html($themeObject->get('Author')); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The theme developers.', 'wpdatatables'); ?>"></i></td>
                        </tr>
                        <tr>
                            <td data-export-label="Author URL"><?php esc_html_e('Author URL', 'wpdatatables'); ?>:</td>
                            <td><?php echo esc_html($themeObject->get('AuthorURI')); ?></td>
                            <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="left"
                                                title="<?php esc_attr_e('The theme developers URL.', 'wpdatatables'); ?>"></i>
                            </td>
                        </tr>
                        </tbody>
                    </table>
                    <!-- /Table Theme data -->
                    <?php
                    $active_plugins = (array)get_option('active_plugins', array());

                    if (is_multisite()) {
                        $active_plugins = array_merge($active_plugins, array_keys(get_site_option('active_sitewide_plugins', array())));
                    }
                    ?>
                    <!-- Table Active plugins data -->
                    <table class="wdt-system-info-table m-t-40" cellspacing="0" id="status">
                        <thead>
                        <tr>
                            <th colspan="3"
                                data-export-label="Active Plugins (<?php echo esc_attr(count($active_plugins)); ?>)"><?php esc_html_e('Active Plugins', 'wpdatatables'); ?>
                                (<?php echo esc_html(count($active_plugins)); ?>)
                            </th>
                        </tr>
                        </thead>
                        <tbody>
                        <?php

                        foreach ($active_plugins as $plugin) {

                            $plugin_data = @get_plugin_data(WP_PLUGIN_DIR . '/' . $plugin);
                            $dirname = dirname($plugin);
                            $version_string = '';
                            $network_string = '';

                            if (!empty($plugin_data['Name'])) {

                                // Link the plugin name to the plugin url if available.
                                if (!empty($plugin_data['PluginURI'])) {
                                    $plugin_name = '<a href="' . esc_url($plugin_data['PluginURI']) . '" title="' . esc_attr__('Visit plugin homepage', 'wpdatatables') . '" target="_blank">' . esc_html($plugin_data['Name']) . '</a>';
                                } else {
                                    $plugin_name = esc_html($plugin_data['Name']);
                                }
                                ?>
                                <tr>
                                    <td>
                                        <?php echo $plugin_name; // WPCS: XSS ok. ?>
                                    </td>
                                    <td>
                                        <?php /* translators: plugin author. */ ?>
                                        <?php printf(esc_attr__('by %s', 'wpdatatables'), ' ' . esc_html($plugin_data['AuthorName']) . ' &ndash; ' . esc_html($plugin_data['Version']) . $version_string . $network_string); // WPCS: XSS ok. ?>
                                    </td>
                                    <td class="help"><i class=" wpdt-icon-info-circle-thin" data-toggle="tooltip"
                                                        data-placement="left" data-html="true"
                                                        title="<?php esc_html_e($plugin_data['Description']); ?>"></i>
                                    </td>
                                </tr>
                                <?php
                            }
                        }
                        ?>
                        </tbody>
                    </table>
                    <!-- /Table Active plugins data -->
                </div>
            </div>
        </div>

        <div class="row">
            <h6 class="text-center wdt-footer-title">
                <?php esc_html_e('Made by', 'wpdatatables'); ?>
                <a href="https://tmsproducts.io/?utm_source=lite&utm_medium=plugin&utm_campaign=wpdtlite" target="_blank">
                    <img src="<?php echo WDT_ASSETS_PATH; ?>img/TMS-Black.svg" alt="" style="width: 66px">
                </a>
            </h6>
            <ul class="wpdt-footer-links text-center">
                <li><a href="https://wpdatatables.com/?utm_source=lite&utm_medium=plugin&utm_campaign=wpdtlite" target="_blank">wpDataTables.com</a></li>
                <li>|</li>
                <li><a href="https://wpdatatables.com/documentation/general/features-overview/" target="_blank"> <?php esc_html_e('Documentation', 'wpdatatables'); ?></a>
                </li>
                <li>|</li>
                <li><a href="<?php echo admin_url('admin.php?page=wpdatatables-support'); ?>">
                        <?php esc_html_e('Support Center', 'wpdatatables'); ?></a></li>
            </ul>
        </div>
    </div>
    <!-- /.container -->

</div>
<!-- /.wdt-datatables-admin-wrap .wrap -->
