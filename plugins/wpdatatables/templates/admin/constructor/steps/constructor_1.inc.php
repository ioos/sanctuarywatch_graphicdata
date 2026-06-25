<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<div class="row wdt-constructor-step" data-step="1">
    <h4 class="m-b-20 p-l-15 f-15">
        <?php esc_html_e('Choose what kind of table would you like to construct', 'wpdatatables'); ?>
    </h4>

    <div class="col-sm-12 p-0">

        <div class="row wpdt-flex wdt-first-row">
            <div class="wdt-constructor-type-selecter-block col-sm-6">
                <div class="card" data-value="simple">
                    <div class="card-header">
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/constructor/create-simple-table.svg">
                    </div>
                    <div class="card-body p-b-20 p-r-20 p-t-20">
                        <h4 class="m-t-0 m-b-8 f-14"><?php esc_html_e('Create a simple table from scratch', 'wpdatatables'); ?>.</h4>
                        <span><?php esc_html_e('Create a simple table with any data, merged cells, styling, star rating and a lot more.', 'wpdatatables'); ?>
                            <br>
                            <?php esc_html_e('You get full control of formatting, but no sorting, searching, pagination or export functionality like in data tables.', 'wpdatatables'); ?></span>
                    </div>
                </div>
            </div>
            <div class="wdt-constructor-type-selecter-block col-sm-6">
                <div class="card" data-value="source">
                    <div class="card-header">
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/constructor/add-from-data-source.png">
                    </div>
                    <div class="card-body p-b-20 p-r-20 p-t-20">
                        <h4 class="m-t-0 m-b-8 f-14"><?php esc_html_e('Create a data table linked to an existing data source', 'wpdatatables'); ?>.</h4>
                        <span><?php esc_html_e('Excel, CSV, Google Spreadsheet, SQL query, XML, JSON, Nested JSON and serialized PHP array. Data will be read from the source every time on page load. Only SQL-based tables can be made editable.', 'wpdatatables'); ?></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="row wpdt-flex wdt-second-row">
            <div class="wdt-constructor-type-selecter-block col-sm-6">
                <div class="card" data-value="ivyforms">
                    <div class="ribbon"><span>NEW</span></div>
                    <div class="card-header">
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/constructor/ivyforms.svg">
                    </div>
                    <div class="card-body p-b-20 p-r-20 p-t-20">
                        <h4 class="m-t-0 m-b-8 f-14"><?php esc_html_e('Create a data table linked to an IvyForms Form', 'wpdatatables'); ?>.</h4>
                        <span><?php esc_html_e('Create a dynamic table from IvyForms submissions with customizable columns for all form fields and entry meta, perfect for managing and displaying form entry data in a clean, sortable layout.', 'wpdatatables'); ?></span>
                    </div>
                </div>
            </div>
            <div class="wdt-constructor-type-selecter-block col-sm-6" >
                <div class="card wdt-premium-feature" data-value="manual" data-toggle="html-premium-popover"  data-placement="top" title="title" data-content="content">
                    <div class="card-header opacity-6">
                        <img class="img-responsive" src="<?php echo WDT_ASSETS_PATH ?>img/constructor/manual.png">
                    </div>
                    <div class="card-body p-b-20 p-r-20 p-t-20">
                        <h4 class="m-t-0 m-b-8 f-14"><i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i> <span class="opacity-6 f-14"><?php esc_html_e('Create a data table manually', 'wpdatatables'); ?>.</span></h4>
                        <span class="opacity-6"><?php esc_html_e('Define the number and type of columns, and fill in the data manually in WP admin. Data table will be stored in the database and can be edited from WP admin, or made front-end editable.', 'wpdatatables'); ?></span>
                    </div>
                </div>
            </div>
        </div>

        <div class="row wpdt-flex wdt-third-row">
            <div class="wdt-constructor-type-selecter-block col-sm-6">
                <div class="card wdt-premium-feature" data-value="file" data-toggle="html-premium-popover"  data-placement="top" title="title" data-content="content">
                    <div class="card-header opacity-6">
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/constructor/import-data-from-data-source.png">
                    </div>
                    <div class="card-body p-b-20 p-r-20 p-t-20">
                        <h4 class="m-t-0 m-b-8 f-14"><i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i> <span class="opacity-6 f-14"><?php esc_html_e('Create a data table by importing data from a data source', 'wpdatatables'); ?>.</span></h4>
                        <span class="opacity-6"><?php esc_html_e('Excel, CSV, Google Spreadsheet. Data will be imported to the database, the data table can be edited in WP admin, or made front-end editable.', 'wpdatatables'); ?></span>
                    </div>
                </div>
            </div>
            <div class="wdt-constructor-type-selecter-block col-sm-6">
                <div class="card wdt-premium-feature" data-value="mysql" data-toggle="html-premium-popover"  data-placement="top" title="title" data-content="content">
                    <div class="card-header opacity-6">
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/constructor/generate-query-to-mysql-database.png">
                    </div>
                    <div class="card-body p-b-20 p-r-20 p-t-20">
                        <h4 class="m-t-0 m-b-8 f-14"><i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><span class="opacity-6 f-14"><?php esc_html_e('Generate a query to the MySQL database', 'wpdatatables'); ?>.</span></h4>
                        <span class="opacity-6"><?php esc_html_e('Create a SQL-query-based data table by generating a query to any custom SQL database with a GUI tool.', 'wpdatatables'); ?></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="row wpdt-flex wdt-third-row">
            <div class="wdt-constructor-type-selecter-block col-sm-6">
                <div class="card wdt-premium-feature" data-value="wp" data-toggle="html-premium-popover"  data-placement="top" title="title" data-content="content">
                    <div class="card-header opacity-6">
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/constructor/generate-query-to-wordpress-database.png">
                    </div>
                    <div class="card-body p-b-20 p-r-20 p-t-20">
                        <h4 class="m-t-0 m-b-8 f-14"><i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><span class="opacity-6 f-14"><?php esc_html_e('Generate a query to the WordPress database', 'wpdatatables'); ?>.</span></h4>
                        <span class="opacity-6"><?php esc_html_e('Create a MySQL-query-based data table by generating a query to the WordPress database (posts, taxonomies, postmeta) with a GUI tool.', 'wpdatatables'); ?></span>
                    </div>
                </div>
            </div>
            <div class="wdt-constructor-type-selecter-block col-sm-6">
                <div class="card wdt-premium-feature" data-value="woo_commerce" data-toggle="html-premium-popover"  data-placement="top" title="title" data-content="content">
                    <div class="ribbon"><span>NEW</span></div>
                    <div class="card-header opacity-6">
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/constructor/wp-query-builder-table.png">
                    </div>
                    <div class="card-body p-b-20 p-r-20 p-t-20">
                        <h4 class="m-t-0 m-b-8 f-14"><i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><span class="opacity-6 f-14"><?php esc_html_e('Build a WP Post Query', 'wpdatatables'); ?>.</span></h4>
                        <span class="opacity-6"><?php esc_html_e('Automatically create a data table based on WordPress posts. Configure the columns to display post titles, authors, dates, and other post details, with data dynamically pulled from your site\'s content.', 'wpdatatables'); ?></span>
                    </div>
                </div>
            </div>
        </div>
        <div class="row wpdt-flex wdt-fourth-row">
            <div class="wdt-constructor-type-selecter-block col-sm-6">
                <div class="card wdt-premium-feature" data-value="wp_posts_query" data-toggle="html-premium-popover"  data-placement="top" title="title" data-content="content">
                    <div class="ribbon"><span>NEW</span></div>
                    <div class="card-header opacity-6">
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/constructor/woo-commerce-table.png">
                    </div>
                    <div class="card-body p-b-20 p-r-20 p-t-20">
                        <h4 class="m-t-0 m-b-8 f-14"><i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><span class="opacity-6 f-14"><?php esc_html_e('Build a WooCommerce Table', 'wpdatatables'); ?>.</span></h4>
                        <span class="opacity-6"><?php esc_html_e('Create a detailed WooCommerce product table with selectable columns for all product details, and optional \'Add to Cart\' buttons for a seamless shopping integration.', 'wpdatatables'); ?></span>
                    </div>
                </div>
            </div>
        </div>

    </div>

</div>