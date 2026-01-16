# Development

This guide is intended for those interested in Graphic Data development. It provides an on-ramp for setting up the environment that you will need to be involved with Graphic Data development in a WordPress environment that is installed locally.

This guide is written assuming that Local, Visual Studio Code, and GitHub Desktop will be used (and assumes a working knowledge of all three, as well as knowledge of using the WordPress admin dashboard). 

1. Install [Local](https://localwp.com/).  
2. Install [Visual Studio Code](https://code.visualstudio.com/).  
3. Install and activate [PHP Debug Extension for VS Code](https://marketplace.visualstudio.com/items?itemName=xdebug.php-debug).  
4. Install [GitHub Desktop](https://desktop.github.com/).  
5. Install the [JetBrains XDebug extension for your browser](https://github.com/JetBrains/xdebug-extension).  
6. Create a new Wordpress site in the Local app by hitting the plus sign in lower left and using the default options. For the purposes of this example, the site is called may26 and is located at the following path: `C:\\Users\\jai\\Local Sites\\may26`
7. Turn on the debug log for your Wordpress installation, by doing the following.   
   1. In Visual Studio Code, open the file wp-config.php, which is located in the root directory for the wordpress installation. In this example’s case, the directory where wp-config.php is located is: `C:\\Users\\jai\\Local Sites\\may26\\app\\public`
   2. Delete the debug-related code in the wp-config.php file, which at the time of writing is located on lines 90-92 and consists of the following:

```
if ( ! defined( 'WP_DEBUG' ) ) {
    define( 'WP_DEBUG', false );
}
```

8. Replace the deleted lines above with the following lines, which come from the [Wordpress Developer’s Guide](https://developer.wordpress.org/advanced-administration/debug/debug-wordpress/), and then save the wp-config file:

```
// Enable WP_DEBUG mode
define( 'WP_DEBUG', true );
// Enable Debug logging to /wp-content/debug.log file
define( 'WP_DEBUG_LOG', true );
// Disable display of errors and warnings
define( 'WP_DEBUG_DISPLAY', false );
@ini_set( 'display_errors', 0 );
```

9. In your Wordpress installation, delete all themes other than the current theme. At the time of writing, the current default theme is Twenty Twenty Five.  
10. Create a new folder called “old wp content”  somewhere other than the Wordpress locations. In “old wp content”, copy over the contents of the Wordpress wp-content directory. In this example’s case, the location of that directory is: `C:\\Users\\jai\\Local Sites\\may26\\app\\public\\wp-content`
11. Delete the contents of the wp-content directory, but don’t delete the directory itself.   
    1. Note: there may be hidden files within the directory that also need to be removed. For example, if you’re on a Mac, there will be a .DS\_Store hidden file that needs to be removed.   
    2. To see if there are hidden files that need to be removed, one way to do that would be to open a terminal window and go to the wp-content directory. If you type the command `ls-la`, you will see all files in the directory, including the hidden files.  
    3. Type `rm \<filename\>` in the terminal to knock out any remaining files.  
12. Now that you have modified the default Wordpress file and folder structure it is time to get the custom plugin code. Clone the [Sanctuary Watch](https://github.com/ioos/sanctuarywatch) repo to your computer using GitHub Desktop. Save the repo into the wp-content/ directory. GitHub Desktop will attempt to save the directory as wp-content/sanctuarywatch \- but that is not what you want. Save the directory into just wp-content/  
    1. To do this, navigate to the wp-content directory in the terminal and use the following command (note that the period at the end is important): `git clone \<whatever link.git\> .`  
13. From “old wp content”, copy the themes/twentytwentyfive and uploads/ folders back into the wp-content/ folder. If a theme other than twenty twenty five is the current theme, copy that theme folder instead.  
14. Delete the “old wp content” folder.  
15. Get Xdebug configured properly in this Wordpress installation, by doing the following. In Visual Studio Code open the Wordpress installation’s php.ini.hbs file. This file is located under your site’s conf/php/ directory. In our example, it can be found at: `C:\\Users\\jai\\Local Sites\\may26\\conf\\php\\`
    1. Delete the Xdebug-related lines in the file, which at the time of writing consisted of the following at lines 227-241:

```
[xdebug]
{{#if os.windows}}
zend_extension = php_xdebug.dll
{{else}}
zend_extension = {{extensionsDir}}/xdebug.so
{{/if}}

{{#if xdebugEnabled}}
xdebug.mode=debug,develop
{{else}}
xdebug.mode=off
{{/if}}
xdebug.client_port=9000
xdebug.start_with_request=yes
xdebug.discover_client_host=yes
```

16. Replace the deleted lines, with the following, which comes from [this resource](https://webdevstudios.com/2022/10/06/debugging-wordpress/):

```
[xdebug]
{{#if os.windows}}
zend_extension = php_xdebug.dll
{{else}}
zend_extension = {{extensionsDir}}/xdebug.so
{{/if}}

{{#if xdebugEnabled}}
xdebug.mode=debug
; xdebug.mode=debug,develop
{{else}}
xdebug.mode=off
{{/if}}
xdebug.client_port="9000"
; xdebug.start_with_request=yes
xdebug.discover_client_host=yes
```
17. Navigate to the WordPress admin interface of your new site.  
18. The new Graphic Data plugin depends on the [Svg Support](https://wordpress.org/plugins/svg-support/) plugin being installed before it can be activated. You can install and activate Svg Support by clicking the associated link in the Wordpress Admin Plugins window (see image below). Note that, in the window that opens when you click the link, the *Install* and *Activate* buttons are in the lower right (and easy to miss).   
    ![][images/svg-support.png]  
    

19. Activate the Graphic Data plugin.  
20. Activate the Graphic Data theme.  
21. Install PHP Code Sniffer within Visual Studio Code (which evaluates PHP files to see if they match coding standards).  
    1. Install [PHP\_CodeSniffer](https://github.com/PHPCSStandards/PHP_CodeSniffer/) on your computer.  
    2. Install and enable the [PHP\_CodeSniffer](https://marketplace.visualstudio.com/items?itemName=obliviousharmony.vscode-php-codesniffer) Visual Studio Code extension.  
    3. In order for the extension to work, several configuration settings must first be set in the extension’s Settings:  
       1. For the field Exec: Linux, Exec: Osx, or Exec: Windows (depending on the operating system you are running), enter the path to the PHPCS executable file that you installed on your computer in part a (see example below).  
          ![][image2]  
       2. For the field Standard, set the value to Custom.  
       3. For the field Standard Custom, set the value to the path of the phpcs.xml.dist file located in the root directory of the GitHub repo that you cloned onto your computer in Step 11 of these instructions. For example, in the case of the writer of these instructions, that path would be: "/Users/jairanganathan/Local Sites/jun24/app/public/wp-content/phpcs.xml.dist". Note the use of quotation marks, which is necessary due to the fact that “Local Sites” in the path contains a space.   
22.  Install PHPStan within Visual Studio Code (which acts as a static code analyzer for PHP files).  
    1. Install and enable the Visual Studio Code [extension for PHPStan](https://marketplace.visualstudio.com/items?itemName=swordev.phpstan&ssr=false#overview).  
    2. In the terminal, navigate to the root directory of the repository.  
    3. In the terminal, install PHPstan by running the following command (which assumes that [composer](https://getcomposer.org/doc/00-intro.md) is already installed): `composer require phpstan/phpstan \--dev`  
    4. There already is a configuration file within the root directory for PHPstan (so you don’t have to supply one).  
23. Install ESLint within Visual Studio Code (which acts as a linter for Javascript files).  
    1. Install and enable the Visual Studio Code [ESLint extension](https://marketplace.visualstudio.com/items?itemName=dbaeumer.vscode-eslint).   
    2. In the terminal, navigate to the root directory of the repository.  
    3. In the terminal, install ESLint within the root directory by running the following command (which assumes that [npm](https://docs.npmjs.com/downloading-and-installing-node-js-and-npm) is already installed): `npm install \--save-dev eslint`  
    4. There already is a configuration file within the root directory for ESLint (so you don’t have to supply one).