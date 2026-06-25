<?php defined('ABSPATH') or die('Access denied.'); ?>

<?php
/**
 * Template file for the plain HTML table
 * wpDataTables Module
 * @author cjbug@ya.ru
 * @since 10.10.2012
 *
 **/

/** @var $this WPDataTable */
/** @var string $advancedFilterPosition */
?>
<?php



?>
<?php do_action('wpdatatables_before_table', $this->getWpId()); ?>
<?php wp_nonce_field('wdtFrontendEditTableNonce', 'wdtNonceFrontendEdit'); ?>
    <input type="hidden" id="<?php echo esc_attr($this->getId()) ?>_desc" value='<?php echo $this->getJsonDescription(); ?>'/>

    <table id="<?php echo esc_attr($this->getId()) ?>"
           class="<?php if ($this->isScrollable()) { ?>scroll<?php } ?>
           <?php if ($this->isResponsive()) { ?>responsive<?php } ?>
           display nowrap <?php echo esc_attr($this->getCSSClasses()) ?> wpDataTable wpDataTableID-<?php echo esc_attr($this->getWpId()) ?>"
           style="<?php echo esc_attr($this->getCSSStyle()) ?>"
           data-described-by='<?php echo esc_attr($this->getId()) ?>_desc'
           data-wpdatatable_id="<?php echo esc_attr($this->getWpId()); ?>
">
        <?php if (is_admin() || in_array(get_option('wdtBaseSkin'), ['mojito','raspberry-cream', 'dark-mojito'])) { ?>
            <colgroup id="<?php echo 'colgrup-' . esc_attr($this->getId()) ?>"></colgroup>
        <?php } ?>

        <!-- Table header -->
        <?php include WDT_TEMPLATE_PATH . 'frontend/table_head.inc.php'; ?>
        <!-- /Table header -->

        <!-- Table body -->
        <?php include WDT_TEMPLATE_PATH . 'frontend/table_body.inc.php'; ?>
        <!-- /Table body -->

        <?php  ?>

    </table>
<?php do_action('wpdatatables_after_table', $this->getWpId()); ?>

<?php 