<?php defined('ABSPATH') or die('Access denied.'); ?>

<div class="col-sm-12 wdt-constructor-step hidden bg-white" data-step="1-0">
    <div id="wpdt-simple-setup-data">
        <div class="row wpdt-custom-center-flex">

            <div class="col-sm-6">
                <h4 class="c-title-color m-b-2">
                    <?php esc_html_e('Table name', 'wpdatatables'); ?>
                    <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                       title="<?php esc_attr_e('What is the header of the table that will be visible to the site visitors?', 'wpdatatables'); ?>"></i>
                </h4>
                <div class="form-group">
                    <div class="fg-line">
                        <input type="text" class="form-control input-sm" value="New wpDataTable"
                               id="wdt-constructor-simple-table-name">
                    </div>
                </div>
            </div>
        </div>
        <div class="row wpdt-custom-center-flex">

            <div class="col-sm-6">
                <h4 class="c-title-color m-b-2">
                    <?php esc_html_e('Table description', 'wpdatatables'); ?>
                    <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                       title="<?php esc_attr_e('What is the description of the table? (optional)', 'wpdatatables'); ?>"></i>
                </h4>
                <div class="form-group">
                    <div class="fg-line">
                        <textarea class="form-control" value=""
                                  id="wdt-constructor-simple-table-description"
                                  placeholder="<?php esc_attr_e('Insert description of your wpDataTable', 'wpdatatables'); ?>"></textarea>
                    </div>
                </div>
            </div>
        </div>
        <div class="row wpdt-custom-center-flex">

            <div class="col-sm-3">
                <h4 class="c-title-color m-b-2">
                    <?php esc_html_e('Number of columns', 'wpdatatables'); ?>
                    <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                       title="<?php esc_attr_e('What is the number columns that you need?', 'wpdatatables'); ?>?"></i>
                </h4>
                <div class="form-group">
                    <div class="fg-line wdt-custom-number-input">
                        <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus"
                                data-field="wdt-simple-table-number-of-columns">
                            <i class="wpdt-icon-minus"></i>
                        </button>
                        <input type="number" name="wdt-simple-table-number-of-columns" min="1" value="5"
                               class="form-control input-sm input-number" id="wdt-simple-table-number-of-columns">
                        <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus"
                                data-field="wdt-simple-table-number-of-columns">
                            <i class="wpdt-icon-plus-full"></i>
                        </button>
                    </div>
                </div>
            </div>

            <div class="col-sm-3">
                <h4 class="c-title-color m-b-2">
                    <?php esc_html_e('Number of rows', 'wpdatatables'); ?>
                    <i class="wpdt-icon-info-circle-thin" data-toggle="tooltip" data-placement="right"
                       title="<?php esc_attr_e('How many columns table will it have? You can also modify it below with + and x buttons', 'wpdatatables'); ?>."></i>
                </h4>
                <div class="form-group">
                    <div class="fg-line wdt-custom-number-input">
                        <button type="button" class="btn btn-default wdt-btn-number wdt-button-minus" data-type="minus"
                                data-field="wdt-simple-table-number-of-rows">
                            <i class="wpdt-icon-minus"></i>
                        </button>
                        <input type="number" name="wdt-simple-table-number-of-rows" min="1" value="5"
                               class="form-control input-sm input-number" id="wdt-simple-table-number-of-rows">
                        <button type="button" class="btn btn-default wdt-btn-number wdt-button-plus" data-type="plus"
                                data-field="wdt-simple-table-number-of-rows">
                            <i class="wpdt-icon-plus-full"></i>
                        </button>
                    </div>
                </div>
            </div>

        </div>
        <div class="row m-t-15 m-b-5 p-l-15 p-r-15">
            <div class="wpdt-custom-center-flex">
                <button class=" btn btn-primary" id="wdt-simple-table-constructor">
                    <?php esc_html_e('Generate table', 'wpdatatables'); ?>
                </button>
            </div>
        </div>
        <div class="row m-t-20 m-b-5 p-l-20 p-r-20">
            <div class="wpdt-custom-center-flex">
                <div class = "category">
                    <p class="wdt-category-heading"><?php esc_html_e("PRICING TABLES TEMPLATES", "wpdatatables") ?></p>
                </div>
            </div>
        </div>
        <div class="row">

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pricing-template-1.png">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pricing table 1', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pricing-template-2.png">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pricing table 2', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pricing-template-3.png">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pricing table 3', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pricing-template-4.jpg">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pricing table 4', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-pricing-table-5-template" data-type="wdt-pricing-table-5-template" data-template_id="18">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pricing-template-5.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-pricing-table/#pricing-table-example-five" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pricing table 5', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-pricing-table-6-template" data-type="wdt-pricing-table-6-template" data-template_id="19">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pricing-template-6.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-pricing-table/#pricing-table-example-six" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pricing table 6', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-pricing-table-7-template" data-type="wdt-pricing-table-7-template" data-template_id="23">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pricing-template-7.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-pricing-table/#pricing-table-example-seven" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pricing table 7', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-pricing-table-8-template" data-type="wdt-pricing-table-8-template" data-template_id="27">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pricing-template-8.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-pricing-table/#pricing-table-example-eight" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pricing table 8', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-pricing-table-9-template" data-type="wdt-pricing-table-9-template" data-template_id="28">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pricing-template-9.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-pricing-table/#pricing-table-example-nine" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pricing table 9', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
        </div>
        <div class="row m-t-20 m-b-5 p-l-20 p-r-20">
            <div class="wpdt-custom-center-flex">
                <div class = "category">
                    <p class="wdt-category-heading"><?php esc_html_e("COMPARISON TABLES TEMPLATES", "wpdatatables") ?></p>
                </div>
            </div>
        </div>
        <div class="row">

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/comparison-template-1.png">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Comparison table 1', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/comparison-template-2.png">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Comparison table 2', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/comparison-template-3.jpg">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Comparison table 3', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/comparison-template-4.jpg">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Comparison table 4', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
        </div>
        <div class="row">
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-comparison-table-5-template" data-type="wdt-comparison-table-5-template" data-template_id="20">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/comparison-template-5.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-amazon-product-comparison-table/#comparison-table-example-five" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Comparison table 5', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-comparison-table-6-template" data-type="wdt-comparison-table-6-template" data-template_id="21">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/comparison-template-6.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-amazon-product-comparison-table/#comparison-table-example-six" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Comparison table 6', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-comparison-table-7-template" data-type="wdt-comparison-table-7-template" data-template_id="22">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/comparison-template-7.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-amazon-product-comparison-table/#comparison-table-example-seven" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Comparison table 7', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-comparison-table-8-template" data-type="wdt-comparison-table-8-template" data-template_id="29">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/comparison-template-8.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-amazon-product-comparison-table/#comparison-table-example-eight" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Comparison table 8', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
        </div>
        <div class="row m-t-20 m-b-5 p-l-20 p-r-20">
            <div class="wpdt-custom-center-flex">
                <div class = "category">
                    <p class="wdt-category-heading"><?php esc_html_e("PEDIGREE TABLES TEMPLATES", "wpdatatables") ?></p>
                </div>
            </div>
        </div>
        <div class="row">

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card"  id="wdt-pedigree-table-1-template" data-type="wdt-pedigree-table-1-template" data-template_id="8">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pedigree-template-1.png">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-pedigree-table/#pedigree-table-example-one" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pedigree table 1', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pedigree-template-2.png">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pedigree table 2', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/pedigree-template-3.png">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Pedigree table 3', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>

        </div>
        <div class="row m-t-20 m-b-5 p-l-20 p-r-20">
            <div class="wpdt-custom-center-flex">
                <div class = "category">
                    <p class="wdt-category-heading"><?php esc_html_e("TABLES WITH MERGED CELLS TEMPLATES", "wpdatatables") ?></p>
                </div>
            </div>
        </div>
        <div class="row">

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-merged-cells-table-1-template" data-type="wdt-merged-cells-table-1-template" data-template_id="4">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/merged-cells-template-1.png">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-table-merge-cells/#merged-cells-example-one" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Table with merge cells 1', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/merged-cells-template-2.png">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Table with merge cells 2', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/merged-cells-template-3.png">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Table with merge cells 3', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/merged-cells-template-4.jpg">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Table with merge cells 4', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>

        </div>
        <div class="row m-t-20 m-b-5 p-l-20 p-r-20">
            <div class="wpdt-custom-center-flex">
                <div class = "category">
                    <p class="wdt-category-heading"><?php esc_html_e("EMPLOYEE TABLES TEMPLATES", "wpdatatables") ?></p>
                </div>
            </div>
        </div>
        <div class="row">

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-employee-table-1-template" data-type="wdt-employee-table-1-template" data-template_id="1">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/employee-template-1.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-employee-table/#employee-table-example-one" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Employee table 1', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/employee-template-2.jpg">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Employee table 2', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/employee-template-3.jpg">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Employee table 3', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
        </div>
        <div class="row m-t-20 m-b-5 p-l-20 p-r-20">
            <div class="wpdt-custom-center-flex">
                <div class = "category">
                    <p class="wdt-category-heading"><?php esc_html_e("SCHEDULING TABLES TEMPLATES", "wpdatatables") ?></p>
                </div>
            </div>
        </div>
        <div class="row">

            <div class="wdt-simple-table-template col-sm-2">
                <div class="card" id="wdt-scheduling-table-1-template" data-type="wdt-scheduling-table-1-template" data-template_id="24">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5"></div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/scheduling-template-1.jpg">
                        <button class=" btn btn-primary wdt-simple-table-constructor">
                            <?php esc_html_e('Create table', 'wpdatatables'); ?>
                        </button>
                        <a class=" btn btn-primary showcase wdt-simple-table-constructor-showcase" href="https://wpdatatables.com/documentation/table-examples/wordpress-scheduling-table/#scheduling-table-example-one" target="_blank" rel="nofollow">
                            <?php esc_html_e('Show live', 'wpdatatables'); ?>
                            <i class="wpdt-icon-external-link" style="background-color: transparent"></i>
                        </a>
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Scheduling table 1', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
            <div class="wdt-simple-table-template col-sm-2">
                <div class="card wdt-premium-feature">
                    <div class="card-header">
                        <div class="wdt-simple-table-template-overlay m-b-5">
                            <i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i><?php esc_html_e('Available in Premium','wpdatatables');?>
                        </div>
                        <img class="img-responsive"
                             src="<?php echo WDT_ASSETS_PATH ?>img/simple-templates/scheduling-template-2.jpg">
                    </div>
                    <div class="card-body">
                        <h4 class="f-14"><?php esc_html_e('Scheduling table 2', 'wpdatatables'); ?></h4>
                    </div>
                </div>
            </div>
        </div>
    </div>

</div>
<div class="clear"></div>