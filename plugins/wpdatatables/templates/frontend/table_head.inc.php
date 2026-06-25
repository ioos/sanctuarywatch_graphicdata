<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<?php
/**
 * Template file for the table head HTML
 * @author: Milos Timotic
 * @since: 22.4.17.
 */

/** @var string $advancedFilterPosition */
/** @var WPDataTable $this */
/** @var WDTColumn $dataColumn */
$dataRows = $this->getDataRows();
?>
<thead>
<?php  ?>
<tr>
    <?php do_action('wpdatatables_before_header', $this->getWpId()); ?>
    <?php $expandShown = false; ?>
    <?php foreach ($this->getColumns() as $dataColumn) { ?>
        <th
        <?php if (!$expandShown && $dataColumn->isVisibleOnMobiles()){ ?>data-class="expand"<?php $expandShown = true;
    } ?>
        <?php if ($dataColumn->getHiddenAttr()) { ?>data-hide="<?php echo esc_attr($dataColumn->getHiddenAttr()) ?>"<?php } ?>
        class="<?php if ($dataColumn->getHiddenAttr()) {
            echo esc_attr($dataColumn->getHiddenAttr());
        } ?> wdtheader <?php if ($dataColumn->getSorting()) { ?>sort <?php } ?><?php echo esc_attr($dataColumn->getCSSClasses()); ?>"
        style="<?php echo esc_attr($dataColumn->getCSSStyle()); ?>"><?php echo esc_attr($dataColumn->getTitle()) ?></th><?php } ?>
    <?php do_action('wpdatatables_after_header', $this->getWpId()); ?>
</tr>
</thead>
