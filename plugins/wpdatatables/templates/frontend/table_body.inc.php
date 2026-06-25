<?php defined('ABSPATH') or die("Cannot access pages directly."); ?>

<?php
/** @var WDTColumn $dataColumn */
?>
<tbody>
<?php do_action('wpdatatables_before_first_row', $this->getWpId()); ?>
<?php foreach ($this->getDataRows() as $wdtRowIndex => $wdtRowDataArr) { ?>
    <?php do_action('wpdatatables_before_row', $this->getWpId(), $wdtRowIndex); ?>
    <tr id="table_<?php echo $this->getWpId() ?>_row_<?php echo $wdtRowIndex; ?>">
        <?php foreach ($this->getColumnsByHeaders() as $dataColumnHeader => $dataColumn) { ?>
            <td style="<?php echo esc_attr($dataColumn->getCSSStyle()); ?>"><?php echo apply_filters('wpdatatables_filter_cell_output', $this->returnCellValue($wdtRowDataArr[$dataColumnHeader], $dataColumnHeader), $this->getWpId(), $dataColumnHeader); ?></td>
        <?php } ?>
    </tr>
    <?php do_action('wpdatatables_after_row', $this->getWpId(), $wdtRowIndex); ?>
<?php } ?>
<?php do_action('wpdatatables_after_last_row', $this->getWpId()); ?>
</tbody>