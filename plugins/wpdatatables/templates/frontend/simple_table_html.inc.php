<?php defined('ABSPATH') or die('Access denied.'); ?>

<?php if ($this->getTableSettingsData() && $this->getTableSettingsData()->show_title && $this->getTableSettingsData()->title) { ?>
    <h3 class="wpdt-c"
        id="wdt-table-title-<?php echo (int)$this->getTableID() ?>"><?php echo esc_html($this->getTableSettingsData()->title) ?></h3>
<?php } ?>
<?php if ($this->getTableSettingsData() && $this->getTableSettingsData()->show_table_description && $this->getTableSettingsData()->table_description) { ?>
    <p class="wpdt-c"
       id="wdt-table-description-<?php echo (int)$this->getTableID() ?>"><?php echo esc_html($this->getTableSettingsData()->table_description) ?></p>
<?php } ?>
<div class="wpdt-c row wpDataTableContainerSimpleTable wpDataTables wpDataTablesWrapper
<?php if ($this->getTableSettingsData()->scrollable) echo ' wdtscroll' ?>
<?php if ($this->getTableSettingsData()->verticalScroll) echo ' wdtVerticalScroll' ?>"
    <?php if (is_admin()) { ?>
        id="wpdatatable-simple-preview-container-<?php echo (int)$this->getTableID() ?>"
    <?php } ?>
>
    <?php
    $isResponsive = $this->getTableSettingsData()->simpleResponsive;
    $isRemoveBorders = $this->getTableSettingsData()->removeBorders;
    $isBorderSeparate = $this->getTableSettingsData()->borderCollapse == 'separate';
    $isStripe = $this->getTableSettingsData()->stripeTable;
    $header = $this->getTableSettingsData()->simpleHeader;
    $tableHTMLClasses = ["wpdtSimpleTable", "wpDataTable"];
    if ($this->getTableSettingsData()->simple_template_id == '3') {
        $tableHTMLClasses[] = 'wpdtTemplatePricing1';
    }
    if ($this->getTableSettingsData()->simple_template_id == '6') {
        $tableHTMLClasses[] = 'wpdtTemplatePedigree1';
    }
    ?>
    <table id="wpdtSimpleTable-<?php echo (int)$this->getTableID() ?>"
           style="border-collapse:<?php echo esc_attr($this->getTableSettingsData()->borderCollapse); ?>;
                   border-spacing:<?php echo esc_attr($this->getTableSettingsData()->borderSpacing); ?>px;"
           class="wpdtSimpleTable wpDataTable"
           data-column="<?php echo esc_attr($this->getColNumber()) ?>"
           data-rows="<?php echo esc_attr($this->getRowNumber()) ?>"
           data-wpID="<?php echo (int)$this->getTableID() ?>"
           data-responsive="<?php echo esc_attr($isResponsive) ?>"
           data-has-header="<?php echo esc_attr($header) ?>">

        <?php
        $toggleClass = $isStripe ? 'even' : '';
        $tag = 'td';
        for ($i = 0; $i < $this->getRowNumber(); $i++) {
            if ($isStripe) {
                if ($header && $i == 0) {
                    $toggleClass = '';
                } else {
                    $toggleClass = $toggleClass == 'odd' ? 'even' : 'odd';
                }
            }
            ?>
            <?php if ($i == 0 && $header) {
                $tag = 'th';
                echo '<thead>';
            } else if (($i == 0 && !$header) || ($i == 1 && $header)) {
                $tag = 'td';
                echo '<tbody>';
            }
            ?>
        <tr class="wpdt-cell-row <?php echo esc_attr($toggleClass) ?><?php if ($isRemoveBorders) echo ' remove-borders ' ?>" <?php if (isset($this->getRowsData()[$i]->height)) echo 'style="height:' . esc_attr($this->getRowsData()[$i]->height) . 'px;"'; ?>>
            <?php for ($j = 0; $j < $this->getColNumber(); $j++) {
                $cellMetaClasses = $this->getCellClassesByIndexes($this->getRowsData(), $i, $j) ? implode(" ", $this->getCellClassesByIndexes($this->getRowsData(), $i, $j)) : "";
                $cellMetaClasses .= $this->getCellDataByIndexes($this->getRowsData(), $i, $j) == "" ? " wpdt-empty-cell " : "";
                $cellMetaClasses = apply_filters('wpdt_filter_simple_table_cell_meta', $cellMetaClasses, $i, $j, $this->getTableID());

                $hiddenCell = $this->getHiddenCellByIndexes($this->getRowsData(), $i, $j) ? 'hidden' : "";
                $colspanValue = 1;
                $rowspanValue = 1;
                $colspanAttr = "";
                $rowspanAttr = "";
                if (isset($this->getMergeCells()[$j][$i])) {
                    $colspanValue = (int)$this->getMergeCells()[$j][$i]['colspan'];
                    $rowspanValue = (int)$this->getMergeCells()[$j][$i]['rowspan'];
                    $colspanAttr = 'colspan="' . esc_attr($colspanValue) . '"';
                    $rowspanAttr = 'rowspan="' . esc_attr($rowspanValue) . '"';
                    $hiddenCell = "";
                    $cellMetaClasses .= " wpdt-merged-cell ";
                }
                $cellMetaClasses .=  $isRemoveBorders ? ' remove-borders ' : '';
                $cellMetaClasses .=  $isBorderSeparate ? ' border-separate ' : '';
                $cellMetaClasses = apply_filters('wpdt_filter_simple_table_cell_meta', $cellMetaClasses, $i, $j, $this->getTableID());

                if (($hiddenCell == 'hidden' && $isResponsive) || $hiddenCell != 'hidden'){
                    ?>
                    <<?php echo $tag ?> class="wpdt-cell <?php echo esc_attr($cellMetaClasses) ?>"
                    <?php echo ' ' . $colspanAttr . ' ' . $hiddenCell . ' ' . $rowspanAttr . ' ' ?>
                    data-cell-id="<?php if (isset($this->getColHeaders()[$j])) echo esc_attr($this->getColHeaders()[$j] . ($i + 1)); ?>"
                    data-col-index="<?php echo esc_attr($j) ?>"
                    data-row-index="<?php echo esc_attr($i) ?>"
                    style="<?php if ($i == 0) {
                        if ($this->getTableSettingsData()->simpleResponsive) {
                            if ($colspanValue > 1) {
                                echo ' width:' . esc_attr((($this->getColWidths()[$j] / array_sum($this->getColWidths())) * 100) * $colspanValue) . '%;';
                            } else if ($hiddenCell == "hidden") {
                                echo ' width:0%;';
                            } else {
                                echo ' width:' . esc_attr((($this->getColWidths()[$j] / array_sum($this->getColWidths())) * 100)) . '%;';
                            }

                        } else if ($this->getTableSettingsData()->scrollable) {
                            if ($colspanValue > 1) {
                                echo ' width:' . esc_attr(($this->getColWidths()[$j]) * $colspanValue) . 'px;';
                            } else if ($hiddenCell == "hidden") {
                                echo ' width:0px;';
                            } else {
                                echo ' width:' . esc_attr(($this->getColWidths()[$j])) . 'px;';
                            }
                        } else {
                            if ($colspanValue > 1) {
                                echo ' width:' . esc_attr((($this->getColWidths()[$j] / array_sum($this->getColWidths())) * 100) * $colspanValue) . '%;';
                            } else if ($hiddenCell == "hidden") {
                                echo ' width:0%;';
                            } else {
                                echo ' width:' . esc_attr((($this->getColWidths()[$j] / array_sum($this->getColWidths())) * 100)) . '%;';
                            }
                        }
                    } ?>
                    padding:<?php echo esc_attr($this->getTableSettingsData()->cellPadding); ?>px;
                    <?php if ($isResponsive && $isBorderSeparate) echo 'margin-bottom: ' .  esc_attr($this->getTableSettingsData()->borderSpacing) .'px;' ?>"
                    >
                    <?php
                    $cellData = $this->getCellDataByIndexes($this->getRowsData(), $i, $j);
                    if (strpos($cellData, 'wpdt-do-shortcode') !== false) {
                        $cellData = substr($cellData, strpos($cellData, '>[') + 1, strpos($cellData, ']<') - strpos($cellData, '>['));
                        $cellData = do_shortcode($cellData);
                    }
                    $cellData = apply_filters('wpdt_filter_simple_table_cell_data', $cellData, $this->getTableID());
                    ?>
                    <?php echo $cellData ?>
                    </<?php echo $tag ?>>
                <?php } ?>
            <?php } ?>
            </tr>
        <?php } ?>
        <?php if ($i == 0 && $header) {
            echo '</thead>';
        } else if (($i == 0 && !$header) || ($i == 1 && $header)) {
            echo '</tbody>';
        } ?>
    </table>
</div>