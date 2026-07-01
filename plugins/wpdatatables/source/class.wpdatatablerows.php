<?php

defined('ABSPATH') or die('Access denied.');

class WPDataTableRows
{
    protected $_tableID;
    protected $_tableName = 'New wpDataTable';
    protected $_table_description = '';
    protected $_tableType = 'simple';
    protected $_colHeaders = [];
    protected $_colWidths = [];
    protected $_colNumber = '';
    protected $_rowNumber = '';
    protected $_rowsData = [];
    protected $_cellData = '';
    protected $_cellType = 'text';
    protected $_hiddenCell = false;
    protected $_cellMetaData = [];
    protected $_mergeCells = [];
    protected $_reloadCounter = 0;
    protected $_tableSettingsData;

    public function __construct(stdClass $tableData)
    {
        $this->setTableName($tableData->title);
        $this->setTableDescription($tableData->table_description);
        $this->setTableType($tableData->table_type);
        $this->setColNumber($tableData->content->colNumber);
        $this->setRowNumber($tableData->content->rowNumber);
        $this->setMergeCells($tableData->content->mergedCells);
        $this->setColHeaders($tableData->content->colHeaders);
        $this->setColWidths($tableData->content->colWidths);
        $this->setReloadCounter($tableData->content->reloadCounter);
        $this->setTableSettingsData($tableData);
    }

    /**
     * @return mixed
     */
    public function getTableID()
    {
        return $this->_tableID;
    }

    /**
     * @param mixed $tableID
     */
    public function setTableID($tableID)
    {
        $this->_tableID = $tableID;
    }

    /**
     * @return string
     */
    public function getTableName()
    {
        return $this->_tableName;
    }

    /**
     * @param string $tableName
     */
    public function setTableName($tableName)
    {
        $this->_tableName = $tableName;
    }
    /**
     * @param string $descriptionName
     */

    public function setTableDescription($descriptionName)
    {
        $this->_table_description = $descriptionName;
    }
    public function getTableDescription()
    {
        return $this->_table_description;
    }

    /**
     * @return string
     */
    public function getTableType()
    {
        return $this->_tableType;
    }

    /**
     * @param string $tableType
     */
    public function setTableType($tableType)
    {
        $this->_tableType = $tableType;
    }

    /**
     * @return array
     */
    public function getColHeaders()
    {
        return $this->_colHeaders;
    }

    /**
     * @param array $colHeaders
     */
    public function setColHeaders($colHeaders)
    {
        $this->_colHeaders = $colHeaders;
    }

    /**
     * @return array
     */
    public function getColWidths()
    {
        return $this->_colWidths;
    }

    /**
     * @param array $colWidths
     */
    public function setColWidths($colWidths)
    {
        $this->_colWidths = $colWidths;
    }

    /**
     * @return string
     */
    public function getColNumber()
    {
        return $this->_colNumber;
    }

    /**
     * @param string $colNumber
     */
    public function setColNumber($colNumber)
    {
        $this->_colNumber = $colNumber;
    }

    /**
     * @return string
     */
    public function getRowNumber()
    {
        return $this->_rowNumber;
    }

    /**
     * @param string $rowNumber
     */
    public function setRowNumber($rowNumber)
    {
        $this->_rowNumber = $rowNumber;
    }

    /**
     * @return array
     */
    public function getRowsData()
    {
        return $this->_rowsData;
    }

    /**
     * @param array $rowsData
     */
    public function setRowsData($rowsData)
    {
        $this->_rowsData = $rowsData;
    }

    /**
     * @param $rowData
     * @param $colIndex
     * @param $rowIndex
     * @return mixed
     */
    public function getCellDataByIndexes($rowData, $rowIndex, $colIndex)
    {
        return $rowData[$rowIndex]->cells[$colIndex]->data;
    }

    /**
     * @param $rowData
     * @param $colIndex
     * @param $rowIndex
     * @return string
     */
    public function getCellTypeByIndexes($rowData, $rowIndex, $colIndex)
    {
        return $rowData[$rowIndex]->cells[$colIndex]->type;
    }

    /**
     * @param $rowData
     * @param $colIndex
     * @param $rowIndex
     * @return bool
     */
    public function getHiddenCellByIndexes($rowData, $rowIndex, $colIndex)
    {
        return $rowData[$rowIndex]->cells[$colIndex]->hidden;
    }

    /**
     * @param $rowData
     * @param $colIndex
     * @param $rowIndex
     * @return mixed
     */
    public function getCellClassesByIndexes($rowData, $rowIndex, $colIndex)
    {
        if (isset($rowData[$rowIndex]->cells[$colIndex]->meta))
            return $rowData[$rowIndex]->cells[$colIndex]->meta;

        return false;
    }

    /**
     * @return string
     */
    public function getCellData()
    {
        return $this->_cellData;
    }

    /**
     * @param string $cellData
     */
    public function setCellData($cellData)
    {
        $this->_cellData = $cellData;
    }

    /**
     * @return string
     */
    public function getCellType()
    {
        return $this->_cellType;
    }

    /**
     * @param string $cellType
     */
    public function setCellType($cellType)
    {
        $this->_cellType = $cellType;
    }

    /**
     * @return bool
     */
    public function isHiddenCell()
    {
        return $this->_hiddenCell;
    }

    /**
     * @param bool $hiddenCell
     */
    public function setHiddenCell($hiddenCell)
    {
        $this->_hiddenCell = $hiddenCell;
    }

    /**
     * @return array
     */
    public function getCellMetaData()
    {
        return $this->_cellMetaData;
    }

    /**
     * @param mixed $cellMetaData
     */
    public function setCellMetaData($cellMetaData)
    {
        $this->_cellMetaData = $cellMetaData;
    }

    /**
     * @return array
     */
    public function getMergeCells()
    {
        return $this->_mergeCells;
    }

    /**
     * @param array $mergeCells
     */
    public function setMergeCells($mergeCells)
    {
        $this->_mergeCells = $mergeCells;
    }

    /**
     * @return int
     */
    public function getReloadCounter()
    {
        return $this->_reloadCounter;
    }

    /**
     * @param int $reloadCounter
     */
    public function setReloadCounter($reloadCounter)
    {
        $this->_reloadCounter = $reloadCounter;
    }

    /**
     * @return mixed
     */
    public function getTableSettingsData()
    {
        return $this->_tableSettingsData;
    }

    /**
     * @param mixed $tableSettingsData
     */
    public function setTableSettingsData($tableSettingsData)
    {
        $this->_tableSettingsData = $tableSettingsData;
    }

    /**
     * Helper method that load wpDataTableRows object by given table ID
     * and return array with $wpDataTableRows object and $tableData object
     * @param $tableId
     * @return WPDataTableRows
     * @throws Exception
     */
    public static function loadWpDataTableRows($tableId)
    {
        $tableData = WDTConfigController::loadTableFromDB($tableId, false);
        $advancedSettings =  json_decode($tableData->advanced_settings);
        $tableData->content = json_decode($tableData->content);
        $tableData->simpleResponsive = $advancedSettings->simpleResponsive;
        $tableData->simpleHeader = $advancedSettings->simpleHeader;
        $tableData->stripeTable = $advancedSettings->stripeTable;
        $tableData->cellPadding = $advancedSettings->cellPadding;
        $tableData->verticalScroll = $advancedSettings->verticalScroll;
        $tableData->verticalScrollHeight = $advancedSettings->verticalScrollHeight;
        $tableData->removeBorders = isset($advancedSettings->removeBorders) ? $advancedSettings->removeBorders : 0;
        $tableData->borderCollapse = isset($advancedSettings->borderCollapse) ? $advancedSettings->borderCollapse : 'collapse';
        $tableData->borderSpacing = isset($advancedSettings->borderSpacing) ? $advancedSettings->borderSpacing : 0;

        $wpDataTableRows = new WPDataTableRows($tableData);
        $wpDataTableRows->setTableID($tableId);

        $rowsDataPrepared = WDTConfigController::loadRowsDataFromDB($tableId);;

        $wpDataTableRows->fillFromData($rowsDataPrepared);

        return $wpDataTableRows;
    }
    /**
     * Save rows data from init Simple table with empty data in database
     * @param int $tableID
     */
    public function saveTableWithEmptyData($tableID)
    {
        $tempRows = [];
        for ($i = 0; $i < $this->getRowNumber(); $i++) {
            $tempRows[$i] = new stdClass();
            for ($j = 0; $j < $this->getColNumber(); $j++) {
                $tempRows[$i] = $this->setCellInfo($tempRows[$i], $j);
            }
            WDTConfigController::saveRowData($tempRows[$i], $tableID);
        }
    }

    /**
     * Set cell info data
     * @param $rowArray
     * @param $colIndex
     * @return mixed
     */
    public function setCellInfo($rowArray, $colIndex)
    {
        $rowArray->cells[$colIndex] = new stdClass();
        $rowArray->cells[$colIndex]->data = $this->getCellData();
        $rowArray->cells[$colIndex]->hidden = $this->isHiddenCell();
        $rowArray->cells[$colIndex]->type = $this->getCellType();

        return $rowArray;
    }

    /**
     * Delete rows data from Simple table in database
     * @param int $tableID
     */
    public function deleteRowsData($tableID)
    {
        global $wpdb;
        $wpdb->delete(
            $wpdb->prefix . "wpdatatables_rows",
            array(
                'table_id' => $tableID),
            array(
                '%d'
            )
        );
    }

    /**
     * Check is table ID exist in wpdatatable_rows table
     * @param int $tableID
     */
    public function checkIsExistTableID($tableID)
    {
        global $wpdb;
        return $wpdb->get_var(
            $wpdb->prepare(
                "SELECT id FROM " . $wpdb->prefix . "wpdatatables_rows WHERE table_id = %d", $tableID));
    }


    public function renderStyles()
    {
        // Generate the style block
        $returnData = "<style id='wpdt-custom-style-" . $this->getTableID() . "'>\n";

        // Table layout
        $customCss = get_option('wdtCustomCss');
        $returnData .= $this->getTableSettingsData()->fixed_layout ? "table#wpdtSimpleTable-" . $this->getTableID() . "{ table-layout: fixed !important; }\n" : '';
        $returnData .= $this->getTableSettingsData()->word_wrap ? "table#wpdtSimpleTable-" . $this->getTableID() . " td, table.wpdtSimpleTable" . $this->getTableID() . " th { white-space: normal !important; }\n" : '';
        $returnData .= $this->getTableSettingsData()->verticalScroll ? ".wpDataTables.wpDataTablesWrapper.wdtVerticalScroll  { overflow-y:auto; height:" . $this->getTableSettingsData()->verticalScrollHeight . "px; }\n" : '';
        $returnData .= $this->getTableSettingsData()->verticalScroll ? ".wpDataTableContainerSimpleTable .wdt-res-wrapper.active  {overflow: initial; max-height:" . $this->getTableSettingsData()->verticalScrollHeight . "px !important; }\n" : '';

        if ($customCss) {
            $returnData .= stripslashes_deep($customCss);
        }

        if (get_option('wdtBorderRemoval')) {
            $returnData .= ".wpDataTablesWrapper table.wpDataTable > tbody > tr > td{ border: none !important; }\n";
        }
        if (get_option('wdtBorderRemovalHeader')) {
            $returnData .= ".wpDataTablesWrapper table.wpDataTable > thead > tr > th{ border: none !important; }\n";
        }
        if ($this->getCellMetaData() != []) {
            $cellClasses = array_unique($this->getCellMetaData());
            $returnData .= self::getDynamicCellClasses($cellClasses);
        }
        $returnData .= "</style>\n";
        wp_enqueue_style('wdt-simple-table', WDT_CSS_PATH . 'wdt.simpleTable.min.css', array(), WDT_CURRENT_VERSION);
        wp_enqueue_style('wdt-font-style', WDT_CSS_PATH . 'style.min.css', array(), WDT_CURRENT_VERSION);
        if ($this->getTableSettingsData()->simpleResponsive) {
            wp_enqueue_script('wdt-simple-table-responsive-min-js', WDT_JS_PATH . 'responsive/wdt.simpleTable.responsive.min.js', array('jquery'), WDT_CURRENT_VERSION, true);
            wp_enqueue_script('wdt-simple-table-responsive-js', WDT_JS_PATH . 'responsive/wdt.simpleTable.responsive.init.js', array('jquery'), WDT_CURRENT_VERSION, true);
        }

        $returnData .= wdtRenderScriptStyleBlock($this->getTableID());

        return $returnData;
    }

    /**
     * Helper method which populates the wpDaTatablesRows object
     * with passed in parameters and data (stored in DB)
     * @param $rowsDataPrepared
     * @throws Exception
     */
    private function fillFromData($rowsDataPrepared)
    {
        $this->setRowsData($rowsDataPrepared);
        if ($this->getMergeCells() != []) {
            $mergeCellsArray = [];
            foreach ($this->getMergeCells() as $key => $mergeData) {
                $mergeData->col = intval($mergeData->col);
                $mergeData->row = intval($mergeData->row);
                $mergeData->colspan = intval($mergeData->colspan);
                $mergeData->rowspan = intval($mergeData->rowspan);
                $mergeCellsArray[$mergeData->col][$mergeData->row] = array(
                    'colspan' => $mergeData->colspan,
                    'rowspan' => $mergeData->rowspan
                );
            }
            $this->setMergeCells($mergeCellsArray);
        }
        $k = 0;
        foreach ($this->getRowsData() as $rowData) {
            for ($i = 0; $i < count($rowData->cells); $i++) {
                if (isset($rowData->cells[$i]->meta)) {
                    for ($j = 0; $j < count($rowData->cells[$i]->meta); $j++) {
                        $cellClasses[$k] = $rowData->cells[$i]->meta[$j];
                        $k++;
                    }
                }
            }
        }
        if (isset($cellClasses)) $this->setCellMetaData($cellClasses);
    }

    /**
     * Generates table HTML
     * @return string
     */
    public function generateTable($tableID)
    {
        ob_start();
        include WDT_TEMPLATE_PATH . 'frontend/simple_table_html.inc.php';
        $returnData = ob_get_contents();
        ob_end_clean();

        $returnData .= $this->renderStyles();

        return $returnData;
    }

    /**
     * Get dynamic classes for colors and fonts in simple table
     * @param array $cellClasses
     * @return string
     */
    public static function getDynamicCellClasses($cellClasses)
    {
	    $returnData = '';
        $systemFonts = WDTSettingsController::wdtGetSystemFonts();
        foreach ($cellClasses as $cellClass) {
            if (strpos($cellClass, 'wpdt-tc-') !== false) {
                $textColor = str_replace('wpdt-tc-', '', $cellClass);
                $returnData .= "." . $cellClass . " { color: #" . $textColor . " !important;}\n";
            } else if (strpos($cellClass, 'wpdt-bc-') !== false) {
                $bgColor = str_replace('wpdt-bc-', '', $cellClass);
                $returnData .= "." . $cellClass . " { background-color: #" . $bgColor . " !important;}\n";
            } else if (strpos($cellClass, 'wpdt-ff-') !== false) {
                $fontFamilyIndex = strval(intval(str_replace('wpdt-ff-', '', $cellClass)));
                $fontFamily = $fontFamilyIndex == "0" ? 'inherit' : $systemFonts[$fontFamilyIndex - 1];
                $returnData .= "." . $cellClass . " { font-family: " . $fontFamily . " !important;}\n";
            } else if (strpos($cellClass, 'wpdt-fs-') !== false) {
                $fontSizeIndex = strval(intval(str_replace('wpdt-fs-', '', $cellClass)));
                $fontSize = $fontSizeIndex == "0" ? '10' : $fontSizeIndex;
                $returnData .= "." . $cellClass . " { font-size: " . $fontSize . "px !important;}\n";
            } else if (strpos($cellClass, 'wpdt-sc-') !== false) {
                $starColor = str_replace('wpdt-sc-', '', $cellClass);
                $returnData .= "." . $cellClass . " .rating > span.full.rated:after { color: #" . $starColor . " !important;}\n";
                $returnData .= "." . $cellClass . " .rating > .half:before { color: #" . $starColor . " !important;}\n";
            }
        }

        return $returnData;
    }

    /**
     * Helper method that prepare cell data output for single cell shortcode
     * @return string
     */
    public static function prepareCellDataOutput($cellData, $cellMetaClasses, $rowID, $columnKey, $tableID){
        $emptyClasses = true;
        $includeFormatting = apply_filters('wpdatatable_cell_include_formatting', true, $columnKey, $rowID, $tableID);
        if ($cellMetaClasses != [] && $includeFormatting){
            $emptyClasses = false;
            $cellClasses = '';
            foreach ($cellMetaClasses as $class){
                $cellClasses .= $class . ' ';
            }
            $cellDataFormatted = '<div class="wpdt-c"><div class="' . $cellClasses . '">' . $cellData . '</div></div>';
            $cellDataFormatted = apply_filters(
                'wpdatatable_cell_filter_formatted_cell',
                $cellDataFormatted, $cellClasses, $cellData, $rowID, $columnKey, $tableID);
            $cellData = $cellDataFormatted;

            $addStyleData = WPDataTableRows::getDynamicCellClasses($cellMetaClasses);
            $addStyle = '<style>' . $addStyleData . "</style>";
            $cellData .= $addStyleData == '' ? '' : $addStyle;

            wp_enqueue_style('wdt-simple-table', WDT_CSS_PATH . 'wdt.simpleTable.css', array(), WDT_CURRENT_VERSION);
            wp_enqueue_style('wdt-font-style', WDT_CSS_PATH . 'style.min.css', array(), WDT_CURRENT_VERSION);
        }
        if (strpos($cellData, 'wpdt-do-shortcode') !== false) {
            $cellData = substr($cellData, strpos($cellData, '>[') + 1, strpos($cellData, ']<') - strpos($cellData, '>['));
            $cellData = do_shortcode($cellData);
        } else if (strpos($cellData, 'wpdt-star-rating') !== false ||
            strpos($cellData, 'wpdt-link-content') !== false) {
            if ($emptyClasses){
                $cellData = '<div class="wpdt-c">' . $cellData . '</div>';
            }
            wp_enqueue_style('wdt-simple-table', WDT_CSS_PATH . 'wdt.simpleTable.css', array(), WDT_CURRENT_VERSION);
            wp_enqueue_style('wdt-font-style', WDT_CSS_PATH . 'style.min.css', array(), WDT_CURRENT_VERSION);
        }

        return $cellData;

    }
}
