<?php

defined('ABSPATH') or die("Cannot access pages directly.");

/**
 * Settings file for the wpDataTables plugin
 *
 **/

// Current version

define('WDT_CURRENT_VERSION', '6.5.0.7');

// Version when hooks are updated
define('WDT_INITIAL_LITE_VERSION', '3.4.2.16');

// Number of active plugin installs for wpDataTables
define('WDT_NUMBER_OF_ACTIVE_INSTALLS', '80,000+');
// Number of active plugin installs for Amelia
define('AMELIA_NUMBER_OF_ACTIVE_INSTALLS', '90,000+');
// Number of appointments for Amelia
define('AMELIA_NUMBER_OF_APPOINTMENTS', '900,000+');
/**
 * Regular Expressions
 */
define('WDT_EMAIL_REGEX', '/^[A-Z0-9._%-]+@[A-Z0-9.-]+\.[A-Z]{2,4}$/i');
define('WDT_URL_REGEX', '/^\b(?:(?:https?|ftp):\/\/|www\.)[-a-z0-9+&@#\/%?=~_|!:,.;]*[-a-z0-9+&@#\/%=~_|]$/i');
define('WDT_CURRENCY_REGEX', '"^\$?\-?([1-9]{1}[0-9]{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\-?\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))$|^\(\$?([1-9]{1}\d{0,2}(\,\d{3})*(\.\d{0,2})?|[1-9]{1}\d{0,}(\.\d{0,2})?|0(\.\d{0,2})?|(\.\d{1,2}))\)$"');
define('WDT_TIME_12H_REGEX', '/^(1[0-2]|0?[1-9]):[0-5][0-9]/');
define('WDT_TIME_24H_REGEX', '/^(2[0-3]|[01][0-9]):([0-5][0-9])/');

/**
 * Path settings.
 * Paths are relative by default, but you may change it as you wish
 */
define('WDT_TEMPLATE_PATH', WDT_ROOT_PATH . 'templates/'); // path to wpDataTables templates. You should not change this setting if you use default templates
define('WDT_ASSETS_PATH', WDT_ROOT_URL . 'assets/'); // path to wpDataTables assets directory. You should not change this setting if you don't change default CSS/JS
define('WDT_INTEGRATIONS_URL', WDT_ROOT_URL . 'integrations/'); // path to wpDataTables integrations directory.
define('WDT_INTEGRATIONS_PATH', WDT_ROOT_PATH . 'integrations/'); // path to wpDataTables integrations directory.
define('WDT_CSS_PATH', WDT_ROOT_URL . 'assets/css/'); // path to wpDataTables CSS styles. You should not change this setting if you use default CSS
define('WDT_JS_PATH', WDT_ROOT_URL . 'assets/js/'); // path to wpDataTables javascript. You should not change this setting if you use default javascripts.


/**
 * Settings which define whether we include the JS files
 * from the plugin build or not
 * (if user already has them included in the page)
 */
define('WDT_INCLUDE_DATATABLES_CORE', true); // Whether to include link to jQuery DataTables plugin javascript to the generated page. Set to false if you already have DataTables included in your project (version used in wpDataTables is 1.9.1, newer version will be provided with updates).

/** Store URL */
define('WDT_STORE_URL', 'https://store.tms-plugins.com/');
define('WDT_STORE_API_URL', 'https://store.tms-plugins.com/api/');


/**
 * MySQL's settings for query-based tables
 */
define('WDT_ENABLE_MYSQL', true); // Whether to use MySQL in wpDataTables. Disable if you are not going to access MySQL directly from wpDataTables.
if (get_option('wdtUseSeparateCon')) {
    define('WDT_MYSQL_HOST', get_option('wdtMySqlHost')); // Name or address of MySQL host
    define('WDT_MYSQL_DB', get_option('wdtMySqlDB')); // Name of MySQL database to use
    define('WDT_MYSQL_USER', get_option('wdtMySqlUser')); // Name of MySQL user
    define('WDT_MYSQL_PASSWORD', get_option('wdtMySqlPwd')); // Password to use in MySQL
    define('WDT_MYSQL_PORT', get_option('wdtMySqlPort')); // Password to use in MySQL
}

global $wdtAllowTypes;
$wdtAllowTypes = array(
    'int',
    'float',
    'date',
    'email',
    'string',
    'link',
    'image',
    'formatnum',
    'formula',
    'datetime',
    'time'
);

/**
 * Required PHP version and get actual server PHP version
 */
define('WDT_REQUIRED_PHP_VERSION', '7.4');
if (defined('PHP_VERSION')) {
    define('WDT_PHP_SERVER_VERSION', PHP_VERSION) ;
} elseif (function_exists('phpversion')) {
    define('WDT_PHP_SERVER_VERSION', phpversion());
} else {
    define('WDT_PHP_SERVER_VERSION', 0) ;
}
