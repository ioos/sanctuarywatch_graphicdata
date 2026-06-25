<?php

use PhpOffice\PhpSpreadsheet\Reader\Xlsx;
use PhpOffice\PhpSpreadsheet\Reader\Xls;
use PhpOffice\PhpSpreadsheet\Reader\Ods;
use PhpOffice\PhpSpreadsheet\Reader\Csv;
use PhpOffice\PhpSpreadsheet\Shared\Date;

defined('ABSPATH') or die("Cannot access pages directly.");


/**
 * Main engine of wpDataTables plugin
 */
class WPDataTable
{

    protected static $_columnClass = 'WDTColumn';
    protected $_wdtIndexedColumns = array();
    private $_wdtNamedColumns = array();
    private $_defaultSortColumn;
    private $_defaultSortDirection = 'ASC';
    private $_tableContent = '';
    private $_tableType = '';
    private $_fileLocation = 'wp_media_lib';
    private $_title = '';
    private $_table_description = '';
    private $_show_table_description = false;
    private $_interfaceLanguage;
    private $_responsive = false;
    private $_responsiveAction = 'icon';
    private $_scrollable = false;
    private $_inlineEditing = false;
    private $_popoverTools = false;
    private $_no_data = false;
    private $_filtering_form = false;
    private $_hide_before_load = false;
    public static $wdt_internal_idcount = 0;
    public static $modalRendered = false;
    private $_showFilter = true;
    private $_firstOnPage = false;
    private $_groupingEnabled = false;
    private $_wdtColumnGroupIndex = 0;
	private $_cache_source_data = false;
	private $_auto_update_cache = false;
    private $_showAdvancedFilter = false;
    private $_wdtTableSort = true;
    private $_serverProcessing = false;
    private $_wdtColumnTypes = array();
    private $_dataRows = array();
    public $_cacheHash = '';
    private $_showTT = true;
    private $_lengthDisplay = 10;
    private $_cssClassArray = array();
    private $_style = '';
    private $_editable = false;
    private $_id;
    private $_idColumnKey = '';
    private $_db;
    private $_wpId = '';
    private $_onlyOwnRows = false;
    private $_userIdColumn = 0;
    private $_defaultSearchValue = '';
    protected $_sumColumns = array();
    protected $_avgColumns = array();
    protected $_minColumns = array();
    protected $_maxColumns = array();
    protected $_sumFooterColumns = array();
    protected $_avgFooterColumns = array();
    protected $_minFooterColumns = array();
    protected $_maxFooterColumns = array();
    protected $_columnsDecimalPlaces = array();
    protected $_columnsThousandsSeparator = array();
    protected $_conditionalFormattingColumns = array();
    private $_fixedLayout = false;
    private $_wordWrap = false;
    private $_columnsCSS = '';
    private $_showTableToolsIncludeHTML = 0;
    private $_showTableToolsIncludeTitle = 0;
    private $_tableToolsConfig = array();
    private $_autoRefreshInterval = 0;
    private $_infoBlock = true;
    private $_pagination = true;
    private $_paginationAlign = 'right';
    private $_paginationLayout = 'full_numbers';
    private $_paginationLayoutMobile = 'simple';

    private $_simpleResponsive = false;
    private $_verticalScroll = false;
    private $_simpleHeader = false;
    private $_stripeTable= false;
    private $_cellPadding= 10;
    private $_removeBorders = false;
    private $_borderCollapse = 'collapse';
    private $_borderSpacing = 0;
    private $_verticalScrollHeight= 600;
    private $_globalSearch = true;
    private $_showRowsPerPage = true;
    private $_aggregateFuncsRes = array();
    private $_ajaxReturn = false;
    private $_clearFilters = false;
    private $_pdfPaperSize = 'A4';
    private $_pdfPageOrientation = 'portrait';
    private $_table_wcag = 0;
    public $column_id;
    private $_simple_template_id = 0;
    private $_pagination_top = 0;
    public static $allowedTableTypes = array('xls', 'csv', 'manual', 'mysql', 'json','nested_json', 'google_spreadsheet', 'xml', 'serialized', 'simple');

    /**
     * @return bool
     */
    public function isClearFilters()
    {
        return $this->_clearFilters;
    }

    /**
     * @return array
     */
    public function getWdtColumnTypes()
    {
        return $this->_wdtColumnTypes;
    }

    /**
     * @param bool $clearFilters
     */
    public function setClearFilters($clearFilters)
    {
        $this->_clearFilters = $clearFilters;
    }

    /**
     * @return bool
     */
    public function isFixedLayout()
    {
        return $this->_fixedLayout;
    }

    /**
     * @param bool $fixedLayout
     */
    public function setFixedLayout($fixedLayout)
    {
        $this->_fixedLayout = $fixedLayout;
    }

    /**
     * @return bool
     */
    public function isWordWrap()
    {
        return $this->_wordWrap;
    }

    /**
     * @param bool $wordWrap
     */
    public function setWordWrap($wordWrap)
    {
        $this->_wordWrap = $wordWrap;
    }

    /**
     * @return bool
     */
    public function isAjaxReturn()
    {
        return $this->_ajaxReturn;
    }

    /**
     * @param bool $ajaxReturn
     */
    public function setAjaxReturn($ajaxReturn)
    {
        $this->_ajaxReturn = $ajaxReturn;
    }

    public function setNoData($no_data)
    {
        $this->_no_data = $no_data;
    }

    public function getNoData()
    {
        return $this->_no_data;
    }

    public function getId()
    {
        return $this->_id;
    }

    public function setId($id)
    {
        $this->_id = $id;
    }

    /**
     * @return string
     */
    public function getTableContent()
    {
        return $this->_tableContent;
    }

    /**
     * @param string $tableContent
     */
    public function setTableContent($tableContent)
    {
        $this->_tableContent = $tableContent;
    }

    /**
     * @return string
     */

    public function getFileLocation() {
        return $this->_fileLocation;
    }

    /**
     * @param string $fileLocation
     */
    public function setFileLocation($fileLocation) {
        $this->_fileLocation = $fileLocation;
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

    public function setDefaultSearchValue($value)
    {
        if (!empty($value)) {
            $this->_defaultSearchValue = urlencode($value);
        }
    }

    public function getDefaultSearchValue()
    {
        return urldecode($this->_defaultSearchValue);
    }

    public function sortEnabled()
    {
        return $this->_wdtTableSort;
    }

    public function sortEnable()
    {
        $this->_wdtTableSort = true;
    }

    public function sortDisable()
    {
        $this->_wdtTableSort = false;
    }

    public function addSumColumn($columnKey)
    {
        $this->_sumColumns[] = $columnKey;
    }

    public function setSumColumns($sumColumns)
    {
        $this->_sumColumns = $sumColumns;
    }

    public function getSumColumns()
    {
        return $this->_sumColumns;
    }

    public function addAvgColumn($columnKey)
    {
        $this->_avgColumns[] = $columnKey;
    }

    public function setAvgColumns($avgColumns)
    {
        $this->_avgColumns = $avgColumns;
    }

    public function getAvgColumns()
    {
        return $this->_avgColumns;
    }

    public function addMinColumn($columnKey)
    {
        $this->_minColumns[] = $columnKey;
    }

    public function setMinColumns($minColumns)
    {
        $this->_minColumns = $minColumns;
    }

    public function getMinColumns()
    {
        return $this->_minColumns;
    }

    public function addMaxColumn($columnKey)
    {
        $this->_maxColumns[] = $columnKey;
    }

    public function setMaxColumns($maxColumns)
    {
        $this->_maxColumns = $maxColumns;
    }

    public function getMaxColumns()
    {
        return $this->_maxColumns;
    }

    public function addSumFooterColumn($columnKey)
    {
        $this->_sumFooterColumns[] = $columnKey;
    }

    public function setSumFooterColumns($sumColumns)
    {
        $this->_sumFooterColumns = $sumColumns;
    }

    public function getSumFooterColumns()
    {
        return $this->_sumFooterColumns;
    }

    public function addAvgFooterColumn($columnKey)
    {
        $this->_avgFooterColumns[] = $columnKey;
    }

    public function setAvgFooterColumns($avgColumns)
    {
        $this->_avgFooterColumns = $avgColumns;
    }

    public function getAvgFooterColumns()
    {
        return $this->_avgFooterColumns;
    }

    public function addMinFooterColumn($columnKey)
    {
        $this->_minFooterColumns[] = $columnKey;
    }

    public function setMinFooterColumns($minColumns)
    {
        $this->_minFooterColumns = $minColumns;
    }

    public function getMinFooterColumns()
    {
        return $this->_minFooterColumns;
    }

    public function addMaxFooterColumn($columnKey)
    {
        $this->_maxFooterColumns[] = $columnKey;
    }

    public function setMaxFooterColumns($maxColumns)
    {
        $this->_maxFooterColumns = $maxColumns;
    }

    public function getMaxFooterColumns()
    {
        return $this->_maxFooterColumns;
    }

    public function addColumnsDecimalPlaces($columnKey, $decimalPlaces)
    {
        $this->_columnsDecimalPlaces[$columnKey] = $decimalPlaces;
    }

    public function addColumnsThousandsSeparator($columnKey, $thousandsSeparator)
    {
        $this->_columnsThousandsSeparator[$columnKey] = $thousandsSeparator;
    }

    public function getColumnsCSS()
    {
        return $this->_columnsCSS;
    }

    public function setColumnsCss($css)
    {
        $this->_columnsCSS = $css;
    }

    public function reorderColumns($posArray)
    {
        if (!is_array($posArray)) {
            throw new WDTException('Invalid position data provided!');
        }
        $resultArray = array();
        $resultByKeys = array();

        foreach ($posArray as $pos => $dataColumnIndex) {
            $resultArray[$pos] = $this->_wdtNamedColumns[$dataColumnIndex];
            $resultByKeys[$dataColumnIndex] = $this->_wdtNamedColumns[$dataColumnIndex];
        }
        $this->_wdtIndexedColumns = $resultArray;
        $this->_wdtNamedColumns = $resultByKeys;
    }

    public function getWpId()
    {
        return $this->_wpId;
    }

    public function setWpId($wpId)
    {
        $this->_wpId = $wpId;
    }
    public function isTableWCAG()
    {
        return $this->_table_wcag;
    }
    public function setTableWCAG($tableWCAG)
    {
        $this->_table_wcag = $tableWCAG;
    }
    public function getCssClassesArr()
    {
        $classesStr = $this->_cssClassArray;
        $classesStr = apply_filters('wpdatatables_filter_table_cssClassArray', $classesStr, $this->getWpId());
        return implode(' ', $classesStr);
    }

    public function getCSSClasses()
    {
        return implode(' ', $this->_cssClassArray);
    }

    public function addCSSClass($cssClass)
    {
        $this->_cssClassArray[] = $cssClass;
    }

    public function getCSSStyle()
    {
        return $this->_style;
    }

    public function setCSSStyle($style)
    {
        $this->_style = $style;
    }

    public function setTitle($title)
    {
        $this->_title = $title;
    }

    public function getName()
    {
        return $this->_title;
    }
    public function setDescription($description) {
        $this->_table_description = $description;
    }

    public function getDescription() {
        return $this->_table_description;
    }
    public function setShowDescription($show_description) {
        if ($show_description) {
            $this->_show_table_description = true;
        } else {
            $this->_show_table_description = false;
        }
    }
    public function getShowDescription() {
        return $this->_show_table_description ;
    }
    public function setScrollable($scrollable)
    {
        if ($scrollable) {
            $this->_scrollable = true;
        } else {
            $this->_scrollable = false;
        }
    }

    public function isScrollable()
    {
        return $this->_scrollable;
    }

    public function setVerticalScroll($verticalScroll) {
        if ($verticalScroll) {
            $this->_verticalScroll = true;
        } else {
            $this->_verticalScroll = false;
        }
    }

    public function isVerticalScroll() {
        return $this->_verticalScroll;
    }

    /**
     * @throws WDTException
     */
    public function setInterfaceLanguage($lang)
    {
        if (empty($lang)) {
            throw new WDTException('Incorrect language parameter!');
        }

        // Security Fix: Prevent Path Traversal / LFI attacks (CVE-2026-28039)
        // Remove any path traversal attempts and allow only valid filenames
        $lang = basename($lang);

        // Additional security: Only allow .inc.php extension
        if (substr($lang, -8) !== '.inc.php') {
            throw new WDTException('Invalid language file format!');
        }

        // Build the safe path
        $safePath = WDT_ROOT_PATH . 'source/lang/' . $lang;

        // Verify the resolved path is still within the lang directory
        $realPath = realpath($safePath);
        $realLangDir = rtrim(realpath(WDT_ROOT_PATH . 'source/lang/'), DIRECTORY_SEPARATOR) . DIRECTORY_SEPARATOR;

        if ($realPath === false || strpos($realPath, $realLangDir) !== 0) {
            throw new WDTException('Language file not found or path traversal detected!');
        }

        $this->_interfaceLanguage = $realPath;
    }

    public function getInterfaceLanguage()
    {
        return $this->_interfaceLanguage;
    }

    public function setAutoRefresh($refresh_interval)
    {
        $this->_autoRefreshInterval = (int)$refresh_interval;
    }

    public function getRefreshInterval()
    {
        return (int)$this->_autoRefreshInterval;
    }

    /**
     * @param boolean $paginationOnTop
     */
    public function setPaginationOnTop($paginationOnTop)
    {
        $this->_pagination_top = (int)$paginationOnTop;
    }
    public function getPaginationOnTop()
    {
        return $this->_pagination_top;
    }

    public function paginationEnabled()
    {
        return $this->_pagination;
    }

    public function enablePagination()
    {
        $this->_pagination = true;
    }

    public function disablePagination()
    {
        $this->_pagination = false;
    }

    public function enableTT()
    {
        $this->_showTT = true;
    }

    public function disableTT()
    {
        $this->_showTT = false;
    }

    public function TTEnabled()
    {
        return $this->_showTT;
    }

    public function getTableToolsIncludeHTML()
    {
        return $this->_showTableToolsIncludeHTML;
    }
    public function setTableToolsIncludeHTML($showTableToolsIncludeHTML)
    {
        $this->_showTableToolsIncludeHTML = $showTableToolsIncludeHTML;
    }

    public function getTableToolsIncludeTitle()
    {
        return $this->_showTableToolsIncludeTitle;
    }

    public function setTableToolsIncludeTitle($showTableToolsIncludeTitle)
    {
        $this->_showTableToolsIncludeTitle = $showTableToolsIncludeTitle;
    }

    public function hideToolbar()
    {
        $this->_toolbar = false;
    }

    public function setDefaultSortColumn($key)
    {
        if (!isset($this->_wdtIndexedColumns[$key])
            && !isset($this->_wdtNamedColumns[$key])
        ) {
            throw new WDTException('Incorrect column index');
        }

        if (!is_numeric($key)) {
            $key = array_search($key, array_keys($this->_wdtNamedColumns));
        }
        $this->_defaultSortColumn = $key;
    }

    public function getDefaultSortColumn()
    {
        return $this->_defaultSortColumn;
    }

    public function setDefaultSortDirection($direction)
    {
        if (
        !in_array(
            $direction,
            array(
                'ASC',
                'DESC'
            )
        )
        ) {
            return false;
        }
        $this->_defaultSortDirection = $direction;
    }

    public function getDefaultSortDirection()
    {
        return $this->_defaultSortDirection;
    }

    public function hideBeforeLoad()
    {
        $this->setCSSStyle('display: none; ');
        $this->_hide_before_load = true;
    }

    public function showBeforeLoad()
    {
        $this->_hide_before_load = false;
    }

    public function doHideBeforeLoad()
    {
        return $this->_hide_before_load;
    }

    public function getDisplayLength()
    {
        return $this->_lengthDisplay;
    }

    public function setDisplayLength($length)
    {
        if (!in_array($length, array(1, 5, 10, 20, 25, 30, 50, 100, 200, -1))) {
            return false;
        }
        $this->_lengthDisplay = $length;
    }

    public function setIdColumnKey($key)
    {
        $this->_idColumnKey = $key;
    }

    public function getIdColumnKey()
    {
        return $this->_idColumnKey;
    }

    /**
     * @return boolean
     */
    public function isInfoBlock()
    {
        return $this->_infoBlock;
    }

    /**
     * @param boolean $infoBlock
     */
    public function setInfoBlock($infoBlock)
    {
        $this->_infoBlock = (bool)$infoBlock;
    }

    /**
     * @return bool
     */
    public function isPagination()
    {
        return $this->_pagination;
    }

    /**
     * @param bool $pagination
     */
    public function setPagination($pagination)
    {
        $this->_pagination = $pagination;
    }

    /**
     * @return string
     */
    public function getPaginationAlign()
    {
        return $this->_paginationAlign;
    }

    /**
     * @param string $paginationAlign
     */
    public function setPaginationAlign($paginationAlign)
    {
        $this->_paginationAlign = $paginationAlign;
        if (wp_is_mobile()) {
            $this->_paginationAlign = 'center';
        }
    }

    /**
     * @return string
     */
    public function getPaginationLayout()
    {
        return $this->_paginationLayout;
    }

    /**
     * @param string $paginationLayout
     */
    public function setPaginationLayout($paginationLayout)
    {
        $this->_paginationLayout = $paginationLayout;
    }

    /**
     * @return string
     */
    public function getPaginationLayoutMobile()
    {
        return $this->_paginationLayoutMobile;
    }

    /**
     * @param string $paginationLayout
     */
    public function setPaginationLayoutMobile($paginationLayout)
    {
        $this->_paginationLayoutMobile = $paginationLayout;
    }

    /**
     * @return boolean
     */
    public function isSimpleResponsive() {
        return $this->_simpleResponsive;
    }

    /**
     * @param boolean $simpleResponsive
     */
    public function setSimpleResponsive($simpleResponsive) {
        $this->_simpleResponsive = (bool)$simpleResponsive;
    }

    /**
     * @return boolean
     */
    public function isSimpleHeader() {
        return $this->_simpleHeader;
    }

    /**
     * @param boolean $simpleHeader
     */
    public function setSimpleHeader($simpleHeader) {
        $this->_simpleHeader = (bool)$simpleHeader;
    }

    /**
     * @return boolean
     */
    public function isStripeTable() {
        return $this->_stripeTable;
    }

    /**
     * @param boolean $stripeTable
     */
    public function setStripeTable($stripeTable) {
        $this->_stripeTable = (bool)$stripeTable;
    }

    /**
     * @return boolean
     */
    public function getCellPadding() {
        return $this->_cellPadding;
    }

    /**
     * @param boolean $cellPadding
     */
    public function setCellPadding($cellPadding) {
        $this->_cellPadding = (bool)$cellPadding;
    }

    /**
     * @return boolean
     */
    public function isRemoveBorders()
    {
        return $this->_removeBorders;
    }

    /**
     * @param boolean $removeBorders
     */
    public function setRemoveBorders($removeBorders)
    {
        $this->_removeBorders = (bool)$removeBorders;
    }

    /**
     * @return string
     */
    public function getBorderCollapse()
    {
        return $this->_borderCollapse;
    }

    /**
     * @param string $borderCollapse
     */
    public function setBorderCollapse($borderCollapse)
    {
        $this->_borderCollapse = $borderCollapse;
    }

    /**
     * @return int
     */
    public function getBorderSpacing()
    {
        return $this->_borderSpacing;
    }

    /**
     * @param int $borderSpacing
     */
    public function setBorderSpacing($borderSpacing)
    {
        $this->_borderSpacing = (int)$borderSpacing;
    }
    /**
     * @return boolean
     */
    public function getVerticalScrollHeight() {
        return $this->_verticalScrollHeight;
    }

    /**
     * @param boolean $verticalScrollHeight
     */
    public function setVerticalScrollHeight($verticalScrollHeight) {
        $this->_verticalScrollHeight = (bool)$verticalScrollHeight;
    }

    /**
     * @return boolean
     */
    public function isGlobalSearch()
    {
        return $this->_globalSearch;
    }

    /**
     * @param boolean $globalSearch
     */
    public function setGlobalSearch($globalSearch)
    {
        $this->_globalSearch = (bool)$globalSearch;
    }

    /**
     * @return boolean
     */
    public function isShowRowsPerPage()
    {
        return $this->_showRowsPerPage;
    }

    /**
     * @param boolean $showRowsPerPage
     */
    public function setShowRowsPerPage($showRowsPerPage)
    {
        $this->_showRowsPerPage = (bool)$showRowsPerPage;
    }

    /**
     * @return string
     */
    public function getPdfPaperSize()
    {
        return $this->_pdfPaperSize;
    }

    /**
     * @param string $pdfPaperSize
     */
    public function setPdfPaperSize($pdfPaperSize)
    {
            $this->_pdfPaperSize = $pdfPaperSize;
    }

    /**
     * @return string
     */
    public function getPdfPageOrientation()
    {
            return $this->_pdfPageOrientation;
    }

    /**
     * @param string $pdfPageOrientation
     */
    public function setPdfPageOrientation($pdfPageOrientation)
    {
            $this->_pdfPageOrientation = $pdfPageOrientation;
    }

    public function getSimpleTemplateId()
    {
        return $this->_simple_template_id;
    }

    public function setSimpleTemplateId($simple_template_id)
    {
        $this->_simple_template_id = $simple_template_id;
    }

    public function __construct()
    {
        if (self::$wdt_internal_idcount == 0) {
            $this->_firstOnPage = true;
        }
        self::$wdt_internal_idcount++;
        $this->_id = 'table_' . self::$wdt_internal_idcount;
    }

    public function wdtDefineColumnsWidth($widthsArray)
    {
        if (empty($this->_wdtIndexedColumns)) {
            throw new WDTException('wpDataTable reports no columns are defined!');
        }
        if (!is_array($widthsArray)) {
            throw new WDTException('Incorrect parameter passed!');
        }
        if (wdtTools::isArrayAssoc($widthsArray)) {
            foreach ($widthsArray as $name => $value) {
                if (!isset($this->_wdtNamedColumns[$name])) {
                    continue;
                }
                $this->_wdtNamedColumns[$name]->setWidth($value);
            }
        } else {
            // if width is provided in indexed array
            foreach ($widthsArray as $name => $value) {
                $this->_wdtIndexedColumns[$name]->setWidth($value);
            }
        }
    }

    public function setColumnsPossibleValues($valuesArray)
    {
        if (empty($this->_wdtIndexedColumns)) {
            throw new WDTException('No columns in the table!');
        }
        if (!is_array($valuesArray)) {
            throw new WDTException('Valid array of width values is required!');
        }
        if (WDTTools::isArrayAssoc($valuesArray)) {
            foreach ($valuesArray as $key => $value) {
                if (!isset($this->_wdtNamedColumns[$key])) {
                    continue;
                }
                $possibleValues = $this->_wdtNamedColumns[$key]->getPossibleValues();
                if (empty($possibleValues)) {
                    $this->_wdtNamedColumns[$key]->setPossibleValues($value);
                }
            }
        } else {
            foreach ($valuesArray as $key => $value) {
                $this->_wdtIndexedColumns[$key]->setPossibleValues($value);
            }
        }
    }

    public function getHiddenColumnCount()
    {
        $count = 0;
        foreach ($this->_wdtIndexedColumns as $dataColumn) {
            if (!$dataColumn->isVisible()) {
                $count++;
            }
        }
        return $count;
    }

    public function setResponsive($responsive) {
        if ($responsive) {
            $this->_responsive = true;
        } else {
            $this->_responsive = false;
        }
    }

    public function isResponsive() {
        return $this->_responsive;
    }

    /**
     * @return string
     */
    public function getResponsiveAction()
    {
        return $this->_responsiveAction;
    }

    /**
     * @param string $responsiveAction
     */
    public function setResponsiveAction($responsiveAction)
    {
        $this->_responsiveAction = $responsiveAction;
    }

	public function setCacheSourceData($cacheSourceData) {
		$this->_cache_source_data = (bool)$cacheSourceData;
	}

	public function getCacheSourceData() {
		return $this->_cache_source_data;
	}

	public function setAutoUpdateCache($autoUpdateCache) {
		$this->_auto_update_cache = (bool)$autoUpdateCache;
	}

	public function getAutoUpdateCache() {
		return $this->_auto_update_cache;
	}


    public function enableGrouping()
    {
        $this->_groupingEnabled = true;
    }

    public function disableGrouping()
    {
        $this->_groupingEnabled = false;
    }

    public function groupingEnabled()
    {
        return $this->_groupingEnabled;
    }

    public function groupByColumn($key)
    {
        if (!isset($this->_wdtIndexedColumns[$key])
            && !isset($this->_wdtNamedColumns[$key])
        ) {
            throw new WDTException('Column not found!');
        }

        if (!is_numeric($key)) {
            $key = array_search(
                $key,
                array_keys($this->_wdtNamedColumns)
            );
        }

        $this->enableGrouping();
        $this->_wdtColumnGroupIndex = $key;
    }

    /**
     * Returns the index of grouping column
     */
    public function groupingColumnIndex()
    {
        return $this->_wdtColumnGroupIndex;
    }

    /**
     * Returns the grouping column index
     */
    public function groupingColumn()
    {
        return $this->_wdtColumnGroupIndex;
    }

    public function countColumns()
    {
        return count($this->_wdtIndexedColumns);
    }

    public function getColumnKeys()
    {
        return array_keys($this->_wdtNamedColumns);
    }

    public function setOnlyOwnRows($ownRows)
    {
        $this->_onlyOwnRows = (bool)$ownRows;
    }

    public function getOnlyOwnRows()
    {
        return $this->_onlyOwnRows;
    }

    public function setUserIdColumn($column)
    {
        $this->_userIdColumn = $column;
    }

    public function getUserIdColumn()
    {
        return $this->_userIdColumn;
    }

    public function getColumns()
    {
        return $this->_wdtIndexedColumns;
    }

    public function getColumnsByHeaders()
    {
        return $this->_wdtNamedColumns;
    }

    public function addConditionalFormattingColumn($column)
    {
        $this->_conditionalFormattingColumns[] = $column;
    }

    public function getConditionalFormattingColumns()
    {
        return $this->_conditionalFormattingColumns;
    }

    public function createColumnsFromArr($headerArr, $wdtParameters, $wdtColumnTypes)
    {
        foreach ($headerArr as $key) {
            $dataColumnProperties = array();
            $dataColumnProperties['title'] = isset($wdtParameters['columnTitles'][$key]) ? $wdtParameters['columnTitles'][$key] : $key;
            $dataColumnProperties['width'] = !empty($wdtParameters['columnWidths'][$key]) ? $wdtParameters['columnWidths'][$key] : '';
            $dataColumnProperties['sorting'] = isset($wdtParameters['sorting'][$key]) ? $wdtParameters['sorting'][$key] : true;
            $dataColumnProperties['decimalPlaces'] = isset($wdtParameters['decimalPlaces'][$key]) ? $wdtParameters['decimalPlaces'][$key] : get_option('wdtDecimalPlaces');
            $dataColumnProperties['orig_header'] = $key;
            $dataColumnProperties['exactFiltering'] = !empty($wdtParameters['exactFiltering'][$key]) ? $wdtParameters['exactFiltering'][$key] : false;
            $dataColumnProperties['filterLabel'] = isset($wdtParameters['filterLabel'][$key]) ? $wdtParameters['filterLabel'][$key] : null;
            $dataColumnProperties['filterDefaultValue'] = isset($wdtParameters['filterDefaultValue'][$key]) ? $wdtParameters['filterDefaultValue'][$key] : null;
            $dataColumnProperties['possibleValuesType'] = !empty($wdtParameters['possibleValuesType'][$key]) ? $wdtParameters['possibleValuesType'][$key] : 'read';
            $dataColumnProperties['possibleValuesAddEmpty'] = !empty($wdtParameters['possibleValuesAddEmpty'][$key]) ? $wdtParameters['possibleValuesAddEmpty'][$key] : false;
            $dataColumnProperties['foreignKeyRule'] = isset($wdtParameters['foreignKeyRule'][$key]) ? $wdtParameters['foreignKeyRule'][$key] : '';
            $dataColumnProperties['editingDefaultValue'] = isset($wdtParameters['editingDefaultValue'][$key]) ? $wdtParameters['editingDefaultValue'][$key] : '';
            $dataColumnProperties['linkTargetAttribute'] = isset($wdtParameters['linkTargetAttribute'][$key]) ? $wdtParameters['linkTargetAttribute'][$key] : '';
            $dataColumnProperties['linkNofollowAttribute'] = isset($wdtParameters['linkNofollowAttribute'][$key]) ? $wdtParameters['linkNofollowAttribute'][$key] : false;
            $dataColumnProperties['linkNoreferrerAttribute'] = isset($wdtParameters['linkNoreferrerAttribute'][$key]) ? $wdtParameters['linkNoreferrerAttribute'][$key] : false;
            $dataColumnProperties['linkSponsoredAttribute'] = isset($wdtParameters['linkSponsoredAttribute'][$key]) ? $wdtParameters['linkSponsoredAttribute'][$key] : false;
            $dataColumnProperties['linkButtonAttribute'] = isset($wdtParameters['linkButtonAttribute'][$key]) ? $wdtParameters['linkButtonAttribute'][$key] : false;
            $dataColumnProperties['linkButtonLabel'] = isset($wdtParameters['linkButtonLabel'][$key]) ? $wdtParameters['linkButtonLabel'][$key] : '';
            $dataColumnProperties['linkButtonClass'] = isset($wdtParameters['linkButtonClass'][$key]) ? $wdtParameters['linkButtonClass'][$key] : '';
            $dataColumnProperties['globalSearchColumn'] =       isset($wdtParameters['globalSearchColumn'][$key]) ? $wdtParameters['globalSearchColumn'][$key] : false;
            $dataColumnProperties['parentTable'] = $this;

            /** @var WDTColumn $tableColumnClass */
            $tableColumnClass = static::$_columnClass;

            if (isset($wdtColumnTypes[$key])) {
                /** @var WDTColumn $dataColumn */
                $dataColumn = $tableColumnClass::generateColumn($wdtColumnTypes[$key], $dataColumnProperties);

                if ($wdtColumnTypes[$key] === 'formula') {
                    /** @var FormulaWDTColumn $dataColumn */
                    if (!empty($wdtParameters['columnFormulas'][$key])) {
                        $dataColumn->setFormula($wdtParameters['columnFormulas'][$key]);
                        if ($this->serverSide()) {
                            $dataColumn->setSorting(false);
                            $dataColumn->setSearchable(false);
                        }
                    } else {
                        $dataColumn->setFormula('');
                    }
                }
            }

            if ($dataColumn && $dataColumn->getPossibleValuesType() == 'foreignkey' && $dataColumn->getForeignKeyRule() != null) {
                $foreignKeyData = $this->joinWithForeignWpDataTable($dataColumn->getOriginalHeader(), $dataColumn->getForeignKeyRule(), $this->getDataRows());
                $this->_dataRows = $foreignKeyData['dataRows'];
                $dataColumn->setPossibleValues($foreignKeyData['distinctValues']);
            }

            $this->_wdtIndexedColumns[] = $dataColumn;
            $this->_wdtNamedColumns[$key] = &$this->_wdtIndexedColumns[count($this->_wdtIndexedColumns) - 1];
        }

    }

    public function getColumnHeaderOffset($key)
    {
        $keys = $this->getColumnKeys();
        if (!empty($key) && in_array($key, $keys)) {
            return array_search($key, $keys);
        } else {
            return -1;
        }
    }

    public function getColumnDefinitions()
    {
        $defs = array();
        foreach ($this->_wdtIndexedColumns as $key => &$dataColumn) {
            $def = $dataColumn->getColumnJSON($key);
            $def->aTargets = array($key);
            $defs[] = json_encode($def);
        }
        return implode(', ', $defs);
    }

    /**
     * Get column filter definitions
     *
     * @return string
     */
    public function getColumnFilterDefinitions()
    {
        $columnDefinitions = array();
        foreach ($this->_wdtIndexedColumns as $key => $dataColumn) {

            /** @var WDTColumn $dataColumn */
            $columnDefinition = $dataColumn->getJSFilterDefinition();

            if ($this->getFilteringForm()) {
                $columnDefinition->sSelector = '#' . $this->getId() . '_' . $key . '_filter';
            }

            $columnDefinitions[] = json_encode($columnDefinition);
        }
        return implode(', ', $columnDefinitions);
    }


    /**
     * Get WDTColumn by column original header
     *
     * @param $originalHeader
     * @return bool|mixed
     */
    public function getColumn($originalHeader)
    {
        if (!isset($originalHeader)
            || (!isset($this->_wdtNamedColumns[$originalHeader])
                && !isset($this->_wdtIndexedColumns[$originalHeader]))
        ) {
            return false;
        }
        if (!is_int($originalHeader)) {
            return $this->_wdtNamedColumns[$originalHeader];
        }

        return $this->_wdtIndexedColumns[$originalHeader];
    }

    /**
     * Generates the structure in memory needed to render the tables
     *
     * @param array $rawDataArr Array of data for the table content
     * @param array $wdtParameters Array of rendering parameters
     * @return bool Result of generation
     */
    public function arrayBasedConstruct($rawDataArr, $wdtParameters)
    {

        if (empty($rawDataArr)) {
            if (!isset($wdtParameters['data_types'])) {
                $rawDataArr = array(0 => array('No data' => 'No data'));
            } else {
                $arrayEntry = array();
                foreach ($wdtParameters['data_types'] as $cKey => $cType) {
                    $arrayEntry[$cKey] = $cKey;
                }
                $rawDataArr[] = $arrayEntry;
            }
            $this->setNoData(true);
        }

        $headerArr = WDTTools::extractHeaders($rawDataArr);

        if (!empty($wdtParameters['columnTitles'])) {
            $headerArr = array_unique(
                array_merge(
                    $headerArr,
                    array_keys($wdtParameters['columnTitles'])
                )
            );
        }

        $wdtColumnTypes = isset($wdtParameters['data_types']) ? $wdtParameters['data_types'] : array();

        if (empty($wdtColumnTypes)) {
            $wdtColumnTypes = WDTTools::detectColumnDataTypes($rawDataArr, $headerArr);
        }

        if (empty($wdtColumnTypes)) {
            foreach ($headerArr as $key) {
                $wdtColumnTypes[$key] = 'string';
            }
        }

        $this->_wdtColumnTypes = $wdtColumnTypes;

        if (!$this->getNoData()) {
            $this->_dataRows = $rawDataArr;
        }

        $this->createColumnsFromArr($headerArr, $wdtParameters, $wdtColumnTypes);

        if (empty($wdtParameters['dates_detected'])
            && count(array_intersect(array('date', 'datetime', 'time'), $wdtColumnTypes))
        ) {
            foreach ($wdtColumnTypes as $key => $columnType) {
                $currentDateFormat = isset($wdtParameters['dateInputFormat'][$key]) ? $wdtParameters['dateInputFormat'][$key] : null;
                if (in_array($columnType, array('date', 'datetime', 'time'))) {
                    foreach ($this->_dataRows as &$dataRow) {
                        $dataRow[$key] = WDTTools::wdtConvertStringToUnixTimestamp($dataRow[$key], $currentDateFormat);
                    }
                }
            }
        }

        if (!in_array($wdtParameters['tableType'], array('mysql', 'manual')) && count(array_intersect(array('float', 'int'), $wdtColumnTypes))) {
            $numberFormat = get_option('wdtNumberFormat') ? get_option('wdtNumberFormat') : 1;
            foreach ($wdtColumnTypes as $key => $columnType) {
                if ($columnType === 'float') {
                    foreach ($this->_dataRows as &$dataRow) {
                        if ($numberFormat == 1) {
                            $dataRow[$key] = str_replace(',', '.', str_replace('.', '', $dataRow[$key]));
                        } else {
                            $dataRow[$key] = str_replace(',', '', $dataRow[$key]);
                        }
                    }
                }
                if ($columnType === 'int') {
                    foreach ($this->_dataRows as &$dataRow) {
                        if ($numberFormat == 1) {
                            $dataRow[$key] = str_replace('.', '', $dataRow[$key]);
                        } else {
                            $dataRow[$key] = str_replace(',', '', $dataRow[$key]);
                        }
                    }
                }
                if ($columnType === 'string') {
                    foreach ($this->_dataRows as &$dataRow) {
                        if (is_float($dataRow[$key]) || is_int($dataRow[$key])) {
                            $dataRow[$key] = strval($dataRow[$key]);
                        }
                    }
                }
            }
        }

        foreach ($wdtColumnTypes as $key => $columnType){
            foreach ($this->_dataRows as &$dataRow) {
                if (isset($dataRow[$key])) {
                    $dataRow[$key] = wp_kses_post($dataRow[$key]);
                }
            }
        }

        return true;

    }


    public function hideColumn($dataColumnIndex)
    {
        if (!isset($dataColumnIndex)
            || !isset($this->_wdtNamedColumns[$dataColumnIndex])
        ) {
            throw new WDTException('A column with provided header does not exist.');
        }
        $this->_wdtNamedColumns[$dataColumnIndex]->setIsVisible(false);
    }

    public function showColumn($dataColumnIndex)
    {
        if (!isset($dataColumnIndex)
            || !isset($this->_wdtNamedColumns[$dataColumnIndex])
        ) {
            throw new WDTException('A column with provided header does not exist.');
        }
        $this->_wdtNamedColumns[$dataColumnIndex]->setIsVisible(true);
    }


    public function getCell($dataColumnIndex, $rowKey)
    {
        if (!isset($dataColumnIndex)
            || !isset($rowKey)
        ) {
            throw new WDTException('Please provide the column key and the row key');
        }
        if (!isset($this->_dataRows[$rowKey])) {
            throw new WDTException('Row does not exist.');
        }
        if (!isset($this->_wdtNamedColumns[$dataColumnIndex])
            && !isset($this->_wdtIndexedColumns[$dataColumnIndex])
        ) {
            throw new WDTException('Column does not exist.');
        }
        return $this->_dataRows[$rowKey][$dataColumnIndex];
    }

    public function returnCellValue($cellContent, $wdtColumnIndex)
    {
        if (!isset($wdtColumnIndex)) {
            throw new WDTException('Column index not provided!');
        }
        if (!isset($this->_wdtNamedColumns[$wdtColumnIndex])) {
            throw new WDTException('Column index out of bounds!');
        }
        return $this->_wdtNamedColumns[$wdtColumnIndex]->returnCellValue($cellContent);
    }

    public function getDataRows()
    {
        return $this->_dataRows;
    }

    public function setDataRows($dataRows) {
        return $this->_dataRows= $dataRows;
    }

    public function getDataRowsFormatted()
    {
        $dataRowsFormatted = array();
        foreach ($this->_dataRows as $dataRow) {
            $formattedRow = array();
            foreach ($dataRow as $colHeader => $cellValue) {
                $formattedRow[$colHeader] = $this->returnCellValue($cellValue, $colHeader);
            }
            $dataRowsFormatted[] = $formattedRow;
        }
        return $dataRowsFormatted;
    }

    public function getRow($index)
    {
        if (!isset($index) || !isset($this->_dataRows[$index])) {
            throw new WDTException('Invalid row index!');
        }
        $rowArray = &$this->_dataRows[$index];
        apply_filters('wdt_get_row', $rowArray);
        return $rowArray;
    }

    public function addDataColumn(&$dataColumn)
    {
        if (!($dataColumn instanceof WDTColumn)) {
            throw new WDTException('Please provide a wpDataTable column.');
        }
        apply_filters('wdt_add_column', $dataColumn);
        $this->_wdtIndexedColumns[] = &$dataColumn;
        return true;
    }

    public function addColumns(&$dataColumns)
    {
        if (!is_array($dataColumns)) {
            throw new WDTException('Please provide an array of wpDataTable column objects.');
        }
        apply_filters('wdt_add_columns', $dataColumns);
        foreach ($dataColumns as &$dataColumn) {
            $this->addDataColumn($dataColumn);
        }
    }

    /**
     * Helper method to calculate value for the specified column and function
     *
     * @param $columnKey
     * @param $function
     * @return float|int
     */
    public function calcColumnFunction($columnKey, $function)
    {
        $result = null;
        if ($function == 'sum' || $function == 'avg') {
            foreach ($this->getDataRows() as $wdtRowDataArr) {
                $result += $wdtRowDataArr[$columnKey];
            }

            if ($function == 'avg') {
                $result = $result / count($this->getDataRows());

                require_once(WDT_ROOT_PATH . 'source/class.float.wpdatacolumn.php');
                $floatCol = new FloatWDTColumn();
                $floatCol->setParentTable($this);
                return $floatCol->prepareCellOutput($result);
            }

        } else if ($function == 'min') {
            foreach ($this->getDataRows() as $wdtRowDataArr) {
                if (!isset($result) || $wdtRowDataArr[$columnKey] < $result) {
                    $result = $wdtRowDataArr[$columnKey];
                }
            }
        } else if ($function == 'max') {
            foreach ($this->getDataRows() as $wdtRowDataArr) {
                if (!isset($result) || $wdtRowDataArr[$columnKey] > $result) {
                    $result = $wdtRowDataArr[$columnKey];
                }
            }
        }

        return $this->returnCellValue($result, $columnKey);

    }

    /**
     * Helper method to generate values for SUM, MIN, MAX, AVG
     */
    private function calcColumnsAggregateFuncs()
    {
        if (empty($this->_aggregateFuncsRes)) {
            $this->_aggregateFuncsRes = array(
                'sum' => array(),
                'avg' => array(),
                'min' => array(),
                'max' => array()
            );
        }
        foreach ($this->getColumnKeys() as $columnKey) {
            if (
            in_array(
                $columnKey,
                array_unique(
                    array_merge(
                        $this->getSumColumns(),
                        $this->getAvgColumns(),
                        $this->getMinColumns(),
                        $this->getMaxColumns()
                    )
                )
            )
            )
                foreach ($this->getDataRows() as $wdtRowDataArr) {
                    if (
                    in_array(
                        $columnKey,
                        array_unique(
                            array_merge(
                                $this->getSumColumns(),
                                $this->getAvgColumns()
                            )

                        )
                    )
                    ) {
                        if (!isset($this->_aggregateFuncsRes['sum'][$columnKey])) {
                            $this->_aggregateFuncsRes['sum'][$columnKey] = 0;
                        }

                        $this->_aggregateFuncsRes['sum'][$columnKey] += $wdtRowDataArr[$columnKey];
                    }
                    if (
                    in_array(
                        $columnKey,
                        $this->getMinColumns()
                    )
                    ) {
                        if (
                            !isset($this->_aggregateFuncsRes['min'][$columnKey])
                            || ($wdtRowDataArr[$columnKey] < $this->_aggregateFuncsRes['min'][$columnKey])
                        ) {
                            $this->_aggregateFuncsRes['min'][$columnKey] = $wdtRowDataArr[$columnKey];
                        }
                    }

                    if (
                    in_array(
                        $columnKey,
                        $this->getMaxColumns()
                    )
                    ) {
                        if (
                            !isset($this->_aggregateFuncsRes['max'][$columnKey])
                            || ($wdtRowDataArr[$columnKey] > $this->_aggregateFuncsRes['max'][$columnKey])
                        ) {
                            $this->_aggregateFuncsRes['max'][$columnKey] = $wdtRowDataArr[$columnKey];
                        }
                    }
                }

            if (in_array($columnKey, $this->getAvgColumns())) {
                $this->_aggregateFuncsRes['avg'][$columnKey] = $this->_aggregateFuncsRes['sum'][$columnKey] / count($this->getDataRows());
            }
        }
    }

    /**
     * Return aggregate function results
     *
     * @param $columnKey
     * @param $function
     * @return mixed
     */
    public function getColumnsAggregateFuncsResult($columnKey, $function)
    {
        if (!isset($this->_aggregateFuncsRes[$function][$columnKey])) {
            $this->calcColumnsAggregateFuncs();
        }
        return $this->_aggregateFuncsRes[$function][$columnKey];
    }


    /**
     * Formatting row data structure for ajax display table
     * @param $row - key => value pairs as column name and cell value of a row
     * @return array
     */
    protected function formatAjaxQueryResultRow($row)
    {
        return array_values($row);
    }

	public function customBasedConstruct($tableData, $wdtParameters = array()) {
		if (has_action('wpdatatables_generate_' . $tableData->table_type)) {
			do_action(
				'wpdatatables_generate_' . $tableData->table_type,
				$this,
				$tableData->content,
				$wdtParameters
			);
		} else {
			throw new WDTException(__('You are trying to load a table of an unknown type. Probably you did not activate the addon which is required to use this table type.', 'wpdatatables'));
		}
	}


	/**
	 * @throws Exception
	 */
	public function jsonBasedConstruct($json, $wdtParameters = array()) {
		$cache = WPDataTableCache::maybeCache($this->getCacheSourceData(), (int)$this->getWpId());
		if (!$cache){
			$jsonArray = self::sourceRenderData($this, 'json', $json);
		} else {
			$jsonArray = $cache;
		}

		$jsonArray = apply_filters('wpdatatables_filter_json_array', $jsonArray, $this->getWpId(), $json);

		return $this->arrayBasedConstruct($jsonArray, $wdtParameters);
	}

	/**
	 * @throws Exception
	 */
	public function serializedPHPBasedConstruct($url, $wdtParameters = array()) {
		$cache = WPDataTableCache::maybeCache($this->getCacheSourceData(), (int)$this->getWpId());
		if (!$cache){
			$PHPArray = self::sourceRenderData($this, 'serialized', $url);
		} else {
			$PHPArray = $cache;
		}

		$PHPArray = apply_filters('wpdatatables_filter_php_array', $PHPArray, $this->getWpId(), $url);

		return $this->arrayBasedConstruct($PHPArray, $wdtParameters);
	}

	/**
	 * @throws Exception
	 */
	public function nestedJsonBasedConstruct($jsonParams, $wdtParameters = array()) {
		$cache = WPDataTableCache::maybeCache($this->getCacheSourceData(), (int)$this->getWpId());
		if (!$cache){
			$jsonArray = self::sourceRenderData($this, 'nested_json', $jsonParams);
		} else {
			$jsonArray = $cache;
		}

		$jsonArray = apply_filters('wpdatatables_filter_nested_json_array', $jsonArray, $this->getWpId(), $jsonParams);

		return $this->arrayBasedConstruct($jsonArray, $wdtParameters);
	}

	/**
	 * @throws WDTException
	 */
	public function XMLBasedConstruct($xml, $wdtParameters = array()) {
		$cache = WPDataTableCache::maybeCache($this->getCacheSourceData(), (int)$this->getWpId());
		if (!$cache){
			if (!$xml) {
				throw new WDTException('File you provided cannot be found.');
			}
			$XMLArray = self::sourceRenderData($this, 'xml', $xml);
		} else {
			$XMLArray = $cache;
		}

		$XMLArray = apply_filters('wpdatatables_filter_xml_array', $XMLArray, $this->getWpId(), $xml);

		return $this->arrayBasedConstruct($XMLArray, $wdtParameters);
	}

	/**
	 * @throws WDTException
	 * @throws \PhpOffice\PhpSpreadsheet\Exception
	 * @throws \PhpOffice\PhpSpreadsheet\Reader\Exception
	 * @throws Exception
	 */
	public function excelBasedConstruct($xls_url, $wdtParameters = array()) {
        $cache = WPDataTableCache::maybeCache($this->getCacheSourceData(), (int)$this->getWpId());
        if (!$cache) {
            ini_set('memory_limit', '2048M');
            $fileLocation = $this->getFileLocation();
            if (!$xls_url) {
                throw new WDTException(esc_html__('Excel file not found!', 'wpdatatables'));
            }
            if ($fileLocation == 'wp_media_lib' && !file_exists($xls_url)) {
                throw new WDTException('Provided file ' . stripcslashes($xls_url) . ' does not exist!');
            }

            $format = substr(strrchr($xls_url, "."), 1);
            $objReader = self::createObjectReader($xls_url);
            $xls_url = apply_filters('wpdatatables_filter_excel_based_data_url', $xls_url, $this->getWpId());
            if ($fileLocation == 'wp_any_url') {
                $xls_url_original = $xls_url;
                $data = WDTTools::curlGetData($xls_url);
                if ($data == null)
                    throw new WDTException(esc_html__("File from provided URL is empty."));
                $tempFileName = 'tempfile' . $this->getWpId() . '.' . $format;
                $fillFileWithData = file_put_contents($tempFileName, $data);
                if ($fillFileWithData === false)
                    throw new WDTException(esc_html__("File from provided URL is empty."));
                $xls_url = $tempFileName;
            }
            $objPHPExcel = $objReader->load($xls_url);
            if ($fileLocation == 'wp_any_url') {
                $xls_url = $xls_url_original;
                unlink($tempFileName);
            }
            $objWorksheet = $objPHPExcel->getActiveSheet();
            $objWorksheet = apply_filters('wpdatatables_before_get_excel_headers', $objWorksheet, $this->getWpId(), $xls_url);
            $highestRow = $objWorksheet->getHighestRow();
            $highestColumn = $objWorksheet->getHighestDataColumn();

            $headingsArray = $objWorksheet->rangeToArray('A1:' . $highestColumn . '1', null, true, true, true);
            while (!end($headingsArray[1])) {
                array_pop($headingsArray[1]);
            };
            foreach ($headingsArray[1] as $heading) {
                if ($heading === '' || $heading === null)
                    throw new WDTException(esc_html__('One or more columns doesn\'t have a header. Please enter headers for all columns in order to proceed.'));
            }
            $headingsArray = array_map('trim', $headingsArray[1]);

			$r = -1;
			$namedDataArray = array();

			$dataRows = $objWorksheet->rangeToArray('A2:' . $highestColumn . $highestRow, null, true, true, true);
			for ($row = 2; $row <= $highestRow; ++$row) {
				if (max($dataRows[$row]) !== null) {
					++$r;
					foreach ($headingsArray as $dataColumnIndex => $dataColumnHeading) {
						$dataColumnHeading = trim(preg_replace('/\s\s+/', ' ', str_replace("\n", " ", $dataColumnHeading)));
                        $namedDataArray[$r][$dataColumnHeading] = trim(isset($dataRows[$row][$dataColumnIndex]) ? $dataRows[$row][$dataColumnIndex] : '');
                        $namedDataArray[$r][$dataColumnHeading] = wp_kses_post($namedDataArray[$r][$dataColumnHeading]);
						$currentDateFormat = isset($wdtParameters['dateInputFormat'][$dataColumnHeading]) ? $wdtParameters['dateInputFormat'][$dataColumnHeading] : null;
						if (!empty($wdtParameters['data_types'][$dataColumnHeading]) && in_array($wdtParameters['data_types'][$dataColumnHeading], array('date', 'datetime', 'time'))) {
							if ($format === 'xls' || $format === 'ods') {
								$cell = $objPHPExcel->getActiveSheet()->getCell($dataColumnIndex . '' . $row);
								if (Date::isDateTime($cell) && $cell->getValue() !== null) {
									$namedDataArray[$r][$dataColumnHeading] = Date::excelToTimestamp($cell->getValue());
								} else {
									$namedDataArray[$r][$dataColumnHeading] = WDTTools::wdtConvertStringToUnixTimestamp($dataRows[$row][$dataColumnIndex], $currentDateFormat);
								}
							} elseif ($format === 'csv') {
								$namedDataArray[$r][$dataColumnHeading] = WDTTools::wdtConvertStringToUnixTimestamp($dataRows[$row][$dataColumnIndex], $currentDateFormat);
							}
						}
					}
				}
			}
			if (empty($namedDataArray)) {
				throw new WDTException(esc_html__('There is no data in your source file. Please check your source file and try again.','wpdatatables'));
			}

			WPDataTableCache::maybeSaveData(
				(int)$this->getWpId(),
				$format,
				$xls_url,
				$this->getAutoUpdateCache(),
				$namedDataArray,
				$this->getCacheSourceData()
			);

		} else {
			$namedDataArray = $cache;
		}

		// Let arrayBasedConstruct know that dates have been converted to timestamps
		$wdtParameters['dates_detected'] = true;

		$namedDataArray = apply_filters('wpdatatables_filter_excel_array', $namedDataArray, $this->getWpId(), $xls_url);

		return $this->arrayBasedConstruct($namedDataArray, $wdtParameters);
	}

	/**
	 * Helper method to get data from source URL
	 * @param $sourceObj
	 * @param $sourceType
	 * @param $source
	 * @return array|mixed|string|void|null
	 * @throws WDTException
	 * @throws Exception
	 */
	public static function sourceRenderData($sourceObj, $sourceType, $source) {
		$wpId = $sourceObj->getWpId();
		$sourceArray = array();
		if ($sourceType == 'json') {
			$sourceArray = self::jsonRenderData($source, $wpId);
		}

		if ($sourceType == 'nested_json') {
			$sourceArray = self::nestedJsonRenderData($source, $wpId);
		}

		if ($sourceType == 'serialized') {
			$sourceArray = self::serializedPhpRenderData($source, $wpId);
		}

		if ($sourceType == 'xml') {
			$sourceArray = self::xmlRenderData($source, $wpId);
		}

		WPDataTableCache::maybeSaveData(
			(int)$wpId,
			$sourceType,
			$source,
			$sourceObj->getAutoUpdateCache(),
			$sourceArray,
			$sourceObj->getCacheSourceData()
		);

		return $sourceArray;
	}

	/**
	 * Helper method to get data from source URL
	 * @param $json
	 * @param $id
	 * @return mixed|null
	 * @throws Exception
	 */
	public static function jsonRenderData($json, $id) {
		$json = WDTTools::curlGetData($json);
		$json = apply_filters('wpdatatables_filter_json', $json, $id);
		return json_decode($json, true);
	}

	/**
	 * Helper method to get data from source URL
	 * @param $jsonParams
	 * @param $id
	 * @return mixed|void
	 * @throws Exception
	 */
	public static function nestedJsonRenderData($jsonParams, $id) {
		if (!is_object($jsonParams))
			$jsonParams = json_decode($jsonParams);
		$nestedJSON = new WDTNestedJson($jsonParams);
		return $nestedJSON->getData($id);
	}

	/**
	 * Helper method to get data from source URL
	 * @param $url
	 * @param $id
	 * @return mixed
	 */
	public static function serializedPhpRenderData($url, $id) {
		$url = apply_filters('wpdatatables_filter_url_php_array', $url, $id);
		$serialized_content = apply_filters('wpdatatables_filter_serialized', WDTTools::curlGetData($url), $id);
        return unserialize($serialized_content, ["allowed_classes" => false]);
	}

	/**
	 * Helper method to get data from source URL
	 * @param $xml
	 * @return array|string
	 */
	public static function xmlRenderData( $xml, $id) {
		$XMLObject = simplexml_load_file($xml);
		$XMLObject = apply_filters('wpdatatables_filter_simplexml', $XMLObject, $id);
		$XMLArray = WDTTools::convertXMLtoArr($XMLObject);
		foreach ($XMLArray as &$xml_el) {
			if (is_array($xml_el) && array_key_exists('attributes', $xml_el)) {
				$xml_el = $xml_el['attributes'];
			}
		}
		return $XMLArray;
	}

	/**
	 * Creates a reader depending on the file extension
	 * @param $file
	 * @return Csv|Ods|Xls|Xlsx
	 * @throws WDTException
	 */
	public static function createObjectReader($file) {
		if (strpos(strtolower($file), '.xlsx')) {
			$objReader = new Xlsx();
		} elseif (strpos(strtolower($file), '.xls')) {
			$objReader = new Xls();
		} elseif (strpos(strtolower($file), '.ods')) {
			$objReader = new Ods();
		} elseif (strpos(strtolower($file), '.csv')) {
			$objReader = new Csv();
            $objReader->setTestAutoDetect(false);
			$csvDelimiter = stripcslashes(get_option('wdtCSVDelimiter')) ? stripcslashes(get_option('wdtCSVDelimiter')) : WDTTools::detectCSVDelimiter($file);
			$objReader->setDelimiter($csvDelimiter);
		} else {
			throw new WDTException('File format not supported!');
		}

		return $objReader;
	}

    /**
     * Helper method that renders the modal
     */
    public static function renderModal()
    {
        include_once WDT_TEMPLATE_PATH . 'frontend/modal.inc.php';
        include_once WDT_TEMPLATE_PATH . 'common/delete_modal.inc.php';
    }

    /**
     * Generates table HTML
     * @return string
     */
    public function generateTable()
    {
        /** @noinspection PhpUnusedLocalVariableInspection */
        $tableContent = $this->renderWithJSAndStyles();

        ob_start();
        include WDT_TEMPLATE_PATH . 'frontend/wrap_template.inc.php';
        if (!self::$modalRendered) {
            if (!is_admin()) {
                add_action('wp_footer', array('WPDataTable', 'renderModal'));
            }
            self::$modalRendered = true;
        }
        $returnData = ob_get_contents();
        ob_end_clean();

        // Generate the style block
        $returnData .= "<style>\n";
        // Columns text before and after
        $returnData .= $this->getColumnsCSS();

        // Table layout
        $customCss = get_option('wdtCustomCss');

        $returnData .= $this->isFixedLayout() ? "table.wpDataTable { table-layout: fixed !important; }\n" : '';
        $returnData .= $this->isWordWrap() ? "table.wpDataTable td, table.wpDataTable th { white-space: normal !important; }\n" : '';

        if ($customCss) {
            $returnData .= stripslashes_deep($customCss);
        }
        if (get_option('wdtNumbersAlign')) {
            $returnData .= "table.wpDataTable td.numdata { text-align: right !important; }\n";
        }
        if (get_option('wdtBorderRemoval')) {
            $returnData .= ".wpDataTablesWrapper table.wpDataTable > tbody > tr > td{ border: none !important; }\n";
        }
        if (get_option('wdtBorderRemovalHeader')) {
            $returnData .= ".wpDataTablesWrapper table.wpDataTable > thead > tr > th{ border: none !important; }\n";
        }
        $returnData .= "</style>\n";

        $returnData .= wdtRenderScriptStyleBlock($this->getWpId());
        return $returnData;
    }

    /**
     * Function that return table HTML content and
     * enqueue all necessary JS and CSS files
     * @return string
     */
    protected function renderWithJSAndStyles()
    {

        $this->enqueueJSAndStyles();

        $this->addCSSClass('data-t');

        /** @noinspection PhpUnusedLocalVariableInspection */
        $advancedFilterPosition = get_option('wdtRenderFilter');
        /** @noinspection PhpUnusedLocalVariableInspection */
        $wdtSumFunctionsLabel = get_option('wdtSumFunctionsLabel');
        /** @noinspection PhpUnusedLocalVariableInspection */
        $wdtAvgFunctionsLabel = get_option('wdtAvgFunctionsLabel');
        /** @noinspection PhpUnusedLocalVariableInspection */
        $wdtMinFunctionsLabel = get_option('wdtMinFunctionsLabel');
        /** @noinspection PhpUnusedLocalVariableInspection */
        $wdtMaxFunctionsLabel = get_option('wdtMaxFunctionsLabel');

        ob_start();
        include WDT_TEMPLATE_PATH . 'frontend/table_main.inc.php';
        $tableContent = ob_get_contents();
        ob_end_clean();

        return $tableContent;
    }

    /**
     * Function that enqueue all necessary JS and CSS files for wpDataTable
     */
    protected function enqueueJSAndStyles()
    {

        WDTTools::wdtUIKitEnqueue();

        wp_enqueue_script('wdt-common', WDT_ROOT_URL . 'assets/js/wpdatatables/admin/common.js', array(), false, true);
        if (get_option('wdtMinifiedJs')) {
            wp_enqueue_style('wdt-wpdatatables', WDT_CSS_PATH . 'wdt.frontend.min.css');

            wp_enqueue_script('wdt-wpdatatables', WDT_JS_PATH . 'wpdatatables/wdt.frontend.min.js', array('wdt-common'), false, true);
        } else {
            wp_enqueue_style('wdt-wpdatatables', WDT_CSS_PATH . 'wpdatatables.min.css');
            wp_enqueue_style('wdt-table-tools', WDT_CSS_PATH . 'TableTools.css');
            if ($this->isResponsive()) {
                wp_enqueue_style('wdt-datatables-responsive', WDT_CSS_PATH . 'datatables.responsive.css', array(), WDT_CURRENT_VERSION);
            }
            if (WDT_INCLUDE_DATATABLES_CORE) {
                wp_enqueue_script('wdt-datatables', WDT_JS_PATH . 'jquery-datatables/jquery.dataTables.min.js', array(), false, true);
            }


            if ($this->groupingEnabled()) {
                wp_enqueue_script('wdt-row-grouping', WDT_JS_PATH . 'jquery-datatables/jquery.dataTables.rowGrouping.js', array('jquery', 'wdt-datatables'), false, true);
            }
            if ($this->TTEnabled()) {
                wp_enqueue_script('wdt-buttons', WDT_JS_PATH . 'export-tools/dataTables.buttons.min.js', array('jquery', 'wdt-datatables'), WDT_CURRENT_VERSION, true);

                wp_enqueue_script('wdt-buttons-html5', WDT_JS_PATH . 'export-tools/buttons.html5.min.js', array('jquery', 'wdt-datatables'), WDT_CURRENT_VERSION, true);
                !empty($this->_tableToolsConfig['print']) ? wp_enqueue_script('wdt-button-print', WDT_JS_PATH . 'export-tools/buttons.print.min.js', array('jquery', 'wdt-datatables'), WDT_CURRENT_VERSION, true) : null;
                !empty($this->_tableToolsConfig['columns']) ? wp_enqueue_script('wdt-button-vis', WDT_JS_PATH . 'export-tools/buttons.colVis.min.js', array('jquery', 'wdt-datatables'), WDT_CURRENT_VERSION, true) : null;

            }
            if ($this->isResponsive()) {
                wp_enqueue_script('wdt-responsive', WDT_JS_PATH . 'responsive/datatables.responsive.js', array(), WDT_CURRENT_VERSION, true);
            }
            wp_enqueue_script('wdt-funcs-js', WDT_JS_PATH . 'wpdatatables/wdt.funcs.js', array('jquery', 'wdt-datatables', 'wdt-common'), false, true);
            wp_enqueue_script('wdt-wpdatatables', WDT_JS_PATH . 'wpdatatables/wpdatatables.js', array('jquery', 'wdt-datatables'), false, true);
        }

        $skin = get_option('wdtBaseSkin');
        if (empty($skin)) {
            $skin = 'skin1';
        }
        switch ($skin) {
            case "skin0":
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/material.css';
                break;
            case "skin1":
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/light.css';
                break;
            case "skin2":
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/graphite.css';
                break;
            case "aqua":
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/aqua.css';
                break;
            case "purple":
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/purple.css';
                break;
            case "dark":
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/dark.css';
                break;
            case "mojito":
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/mojito.css';
                break;
            case "raspberry-cream":
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/raspberry-cream.css';
                break;
            case "dark-mojito":
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/darkmojito.css';
                break;
            default:
                $renderSkin = WDT_ASSETS_PATH . 'css/wdt-skins/material.css';
                break;
        }
        wp_enqueue_style('wdt-skin', $renderSkin, array(), WDT_CURRENT_VERSION);
        wp_enqueue_style('dashicons');

        wp_enqueue_script('underscore');
        !empty($this->_tableToolsConfig['excel']) ? wp_enqueue_script('wdt-js-zip', WDT_JS_PATH . 'export-tools/jszip.min.js', array('jquery'), false, true) : null;
        !empty($this->_tableToolsConfig['pdf']) ? wp_enqueue_script('wdt-pdf-make', WDT_JS_PATH . 'export-tools/pdfmake.min.js', array('jquery'), false, true) : null;
        !empty($this->_tableToolsConfig['pdf']) ? wp_enqueue_script('wdt-vfs-fonts', WDT_JS_PATH . 'export-tools/vfs_fonts.js', array('jquery'), false, true) : null;


        wp_localize_script('wdt-common', 'wpdatatables_edit_strings', WDTTools::getTranslationStrings());
        wp_localize_script('wdt-common', 'wdtWpDataTablesPopoverStrings',WDTTools::getWpDataTablesPopoverStrings());
        wp_localize_script('wdt-wpdatatables', 'wpdatatables_settings', WDTTools::getDateTimeSettings());
        wp_localize_script('wdt-wpdatatables', 'wpdatatables_frontend_strings', WDTTools::getTranslationStrings());
        wp_localize_script('wdt-advanced-filter', 'wpdatatables_frontend_strings', WDTTools::getTranslationStrings());
    }

    /**
     * * Helper method which prepares the column data from values stored in DB
     * @param $tableData
     * @return array
     */
    public function prepareColumnData($tableData)
    {

        $returnArray = array(
            'dateInputFormat' => array(),
            'columnFormulas' => array(),
            'columnOrder' => array(),
            'columnTitles' => array(),
            'columnTypes' => array(),
            'columnWidths' => array(),
            'decimalPlaces' => array(),
            'editingDefaultValue' => array(),
            'exactFiltering' => array(),
            'filterDefaultValue' => array(),
            'filterLabel' => array(),
            'foreignKeyRule' => array(),
            'possibleValues' => array(),
            'possibleValuesAddEmpty' => array(),
            'possibleValuesType' => array(),
            'sorting' => array(),
            'userIdColumnHeader' => NULL,
            'linkTargetAttribute' => array(),
            'linkNofollowAttribute' => array(),
            'linkNoreferrerAttribute' => array(),
            'linkSponsoredAttribute' => array(),
            'linkButtonAttribute' => array(),
            'linkButtonLabel' => array(),
            'linkButtonClass' => array(),
            'globalSearchColumn' => array(),
        );

        if ($tableData) {
            foreach ($tableData->columns as $column) {
                $returnArray['columnOrder'][(int)$column->pos] = $column->orig_header;
                if ($column->display_header) {
                    $returnArray['columnTitles'][$column->orig_header] = $column->display_header;
                }
                if ($column->width) {
                    $returnArray['columnWidths'][$column->orig_header] = $column->width;
                }
                if ($column->type != 'autodetect') {
                    $returnArray['columnTypes'][$column->orig_header] = $column->type;
                }
                if ($column->type == 'formula') {
                    $returnArray['columnFormulas'][$column->orig_header] = $column->formula;
                }
                if ($tableData->edit_only_own_rows && $tableData->userid_column_id == $column->id) {
                    $returnArray['userIdColumnHeader'] = $column->orig_header;
                }
                if ($column->filterDefaultValue) {
                    $returnArray['filterDefaultValue'][$column->orig_header] = $column->filterDefaultValue;
                }

                $returnArray['dateInputFormat'][$column->orig_header] = isset($column->dateInputFormat) ? $column->dateInputFormat : null;
                $returnArray['decimalPlaces'][$column->orig_header] = isset($column->decimalPlaces) ? $column->decimalPlaces : null;
                $returnArray['editingDefaultValue'][$column->orig_header] = isset($column->editingDefaultValue) ? $column->editingDefaultValue : null;
                $returnArray['exactFiltering'][$column->orig_header] = isset($column->exactFiltering) ? $column->exactFiltering : null;
                $returnArray['filterLabel'][$column->orig_header] = isset($column->filterLabel) ? $column->filterLabel : null;
                $returnArray['foreignKeyRule'][$column->orig_header] = isset($column->foreignKeyRule) ? $column->foreignKeyRule : null;
                $returnArray['possibleValues'][$column->orig_header] = isset($column->valuesList) ? $column->valuesList : null;
                $returnArray['possibleValuesAddEmpty'][$column->orig_header] = isset($column->possibleValuesAddEmpty) ? $column->possibleValuesAddEmpty : null;
                $returnArray['possibleValuesType'][$column->orig_header] = isset($column->possibleValuesType) ? $column->possibleValuesType : null;
	            $returnArray['column_align_fields'][$column->orig_header] = isset($column->column_align_fields) ? $column->column_align_fields : '';
	            $returnArray['sorting'][$column->orig_header] = isset($column->sorting) ? $column->sorting : null;
                $returnArray['linkTargetAttribute'][$column->orig_header] = isset($column->linkTargetAttribute) ? $column->linkTargetAttribute : null;
                $returnArray['linkNofollowAttribute'][$column->orig_header] = isset($column->linkNofollowAttribute) ? $column->linkNofollowAttribute : null;
                $returnArray['linkNoreferrerAttribute'][$column->orig_header] = isset($column->linkNoreferrerAttribute) ? $column->linkNoreferrerAttribute : null;
                $returnArray['linkSponsoredAttribute'][$column->orig_header] = isset($column->linkSponsoredAttribute) ? $column->linkSponsoredAttribute : null;
                $returnArray['linkButtonAttribute'][$column->orig_header] = isset($column->linkButtonAttribute) ? $column->linkButtonAttribute : null;
                $returnArray['linkButtonLabel'][$column->orig_header] = isset($column->linkButtonLabel) ? $column->linkButtonLabel : null;
                $returnArray['linkButtonClass'][$column->orig_header] = isset($column->linkButtonClass) ? $column->linkButtonClass : null;
                $returnArray['globalSearchColumn'][$column->orig_header] = isset($column->globalSearchColumn) ? $column->globalSearchColumn : null;
	            $returnArray['column_align_header'][$column->orig_header] = isset($column->column_align_header) ? $column->column_align_header : '';
	            $returnArray['column_align_fields'][$column->orig_header] = isset($column->column_align_fields) ? $column->column_align_fields : '';
            }
        }
        return $returnArray;
    }


    /**
     * Helper method which populates the wpdatatables object with passed in parameters and data (stored in DB)
     *
     * @param $tableData
     * @param $columnData
     * @throws WDTException
     * @throws Exception
     */

    public function fillFromData($tableData, $columnData)
    {
        if (empty($tableData->table_type)) {
            return;
        }
        global $wdtVar1, $wdtVar2, $wdtVar3;

        // Set placeholders
        $wdtVar1 = $wdtVar1 === '' ? $tableData->var1 : $wdtVar1;
        $wdtVar2 = $wdtVar2 === '' ? $tableData->var2 : $wdtVar2;
        $wdtVar3 = $wdtVar3 === '' ? $tableData->var3 : $wdtVar3;

        // Defining column parameters if provided
        $params = array();
        if (isset($tableData->limit)) {
            $params['limit'] = $tableData->limit;
        }
        if (isset($tableData->table_type)) {
            $params['tableType'] = $tableData->table_type;
        }
        if (isset($columnData['columnTypes'])) {
            $params['data_types'] = $columnData['columnTypes'];
        }
        if (isset($columnData['columnTitles'])) {
            $params['columnTitles'] = $columnData['columnTitles'];
        }
        if (isset($columnData['columnFormulas'])) {
            $params['columnFormulas'] = $columnData['columnFormulas'];
        }
        if (isset($columnData['sorting'])) {
            $params['sorting'] = $columnData['sorting'];
        }
        if (isset($columnData['decimalPlaces'])) {
            $params['decimalPlaces'] = $columnData['decimalPlaces'];
        }
        if (isset($columnData['exactFiltering'])) {
            $params['exactFiltering'] = $columnData['exactFiltering'];
        }
        if (isset($columnData['globalSearchColumn'])) {
            $params['globalSearchColumn'] = $columnData['globalSearchColumn'];
        }
        if (isset($columnData['filterDefaultValue'])) {
            $params['filterDefaultValue'] = $columnData['filterDefaultValue'];
        }
        if (isset($columnData['filterLabel'])) {
            $params['filterLabel'] = $columnData['filterLabel'];
        }
        if (isset($columnData['possibleValuesType'])) {
            $params['possibleValuesType'] = $columnData['possibleValuesType'];
        }
        if (isset($columnData['possibleValuesAddEmpty'])) {
            $params['possibleValuesAddEmpty'] = $columnData['possibleValuesAddEmpty'];
        }
        if (isset($columnData['foreignKeyRule'])) {
            $params['foreignKeyRule'] = $columnData['foreignKeyRule'];
        }
        if (isset($columnData['editingDefaultValue'])) {
            $params['editingDefaultValue'] = $columnData['editingDefaultValue'];
        }
        if (isset($columnData['dateInputFormat'])) {
            $params['dateInputFormat'] = $columnData['dateInputFormat'];
        }
        if (isset($columnData['linkTargetAttribute'])) {
            $params['linkTargetAttribute'] = $columnData['linkTargetAttribute'];
        }
        if (isset($columnData['linkNofollowAttribute'])) {
            $params['linkNofollowAttribute'] = $columnData['linkNofollowAttribute'];
        }
        if (isset($columnData['linkNoreferrerAttribute'])) {
            $params['linkNoreferrerAttribute'] = $columnData['linkNoreferrerAttribute'];
        }
        if (isset($columnData['linkSponsoredAttribute'])) {
            $params['linkSponsoredAttribute'] = $columnData['linkSponsoredAttribute'];
        }
        if (isset($columnData['linkButtonAttribute'])) {
            $params['linkButtonAttribute'] = $columnData['linkButtonAttribute'];
        }
        if (isset($columnData['linkButtonLabel'])) {
            $params['linkButtonLabel'] = $columnData['linkButtonLabel'];
        }
        if (isset($columnData['linkButtonClass'])) {
            $params['linkButtonClass'] = $columnData['linkButtonClass'];
        }

        if (isset($tableData->display_length) && $tableData->display_length != 0) {
            $this->setDisplayLength($tableData->display_length);
        } else {
            $this->disablePagination();
        }
        if (isset($tableData->file_location)) {
            $this->setFileLocation($tableData->file_location);
        }
	    $this->setCacheSourceData(!empty($tableData->cache_source_data));
	    $this->setAutoUpdateCache(!empty($tableData->auto_update_cache));

        switch ($tableData->table_type) {

            case 'xls':
            case 'csv':
                $this->excelBasedConstruct(
                    $tableData->content,
                    $params
                );
                break;
            case 'xml':
                $this->XMLBasedConstruct(
                    $tableData->content,
                    $params
                );
                break;
            case 'json':
                $this->jsonBasedConstruct(
                    $tableData->content,
                    $params
                );
                break;
	        case 'nested_json':
		        $this->nestedJsonBasedConstruct(
			        $tableData->content,
			        $params
		        );
		        break;
            case 'serialized':
	            $this->serializedPHPBasedConstruct(
		            $tableData->content,
		            $params
	            );
                break;
            default:
                // Solution for addons
	            $this->customBasedConstruct(
		            $tableData,
		            $params
	            );

                break;
        }
        if (!empty($tableData->content)) {
            $this->setTableContent($tableData->content);
        }
        if (!empty($tableData->table_type)) {
            $this->setTableType($tableData->table_type);
        }
        if (!empty($tableData->title)) {
            $this->setTitle($tableData->title);
        }
        if (!empty($tableData->table_description)) {
            $this->setDescription($tableData->table_description);
        }
        if (!empty($tableData->hide_before_load)) {
            $this->hideBeforeLoad();
        } else {
            $this->showBeforeLoad();
        }
        if (!empty($tableData->fixed_layout)) {
            $this->setFixedLayout(true);
        }
        if (!empty($tableData->word_wrap)) {
            $this->setWordWrap(true);
        }

        if (!empty($tableData->responsive)) {
            $this->setResponsive(true);
        }
        if (!empty($tableData->scrollable)) {
            $this->setScrollable(true);
        }
        if (empty($tableData->sorting)) {
            $this->sortDisable();
        }
        if (empty($tableData->tools)) {
            $this->disableTT();
        } else {
            $this->enableTT();
            if (isset($tableData->tabletools_config)) {
                $this->_tableToolsConfig = $tableData->tabletools_config;
            } else {
                $this->_tableToolsConfig = array(
                    'print' => 1,
                    'copy' => 1,
                    'excel' => 1,
                    'csv' => 1,
                    'pdf' => 0
                );
            }
        }
        if (get_option('wdtInterfaceLanguage') != '') {
            $this->setInterfaceLanguage(get_option('wdtInterfaceLanguage'));
        }

        if (!empty($tableData->advanced_settings)) {
            $advancedSettings = json_decode($tableData->advanced_settings);
            isset($advancedSettings->info_block) ? $this->setInfoBlock($advancedSettings->info_block) : $this->setInfoBlock(true);
            isset($advancedSettings->global_search) ? $this->setGlobalSearch($advancedSettings->global_search) :$this->setGlobalSearch(true);
            isset($advancedSettings->showRowsPerPage) ? $this->setShowRowsPerPage($advancedSettings->showRowsPerPage) : $this->setShowRowsPerPage(true);
            isset($advancedSettings->simpleResponsive) ? $this->setSimpleResponsive($advancedSettings->simpleResponsive) : $this->setSimpleResponsive(false);
            isset($advancedSettings->simpleHeader) ? $this->setSimpleHeader($advancedSettings->simpleHeader) : $this->setSimpleHeader(false);
            isset($advancedSettings->stripeTable) ? $this->setStripeTable($advancedSettings->stripeTable) : $this->setStripeTable(false);
            isset($advancedSettings->cellPadding) ? $this->setCellPadding($advancedSettings->cellPadding) : $this->setCellPadding(10);
            isset($advancedSettings->removeBorders) ? $this->setRemoveBorders($advancedSettings->removeBorders) : $this->setRemoveBorders(false);
            isset($advancedSettings->borderCollapse) ? $this->setBorderCollapse($advancedSettings->borderCollapse) : $this->setBorderCollapse('collapse');
            isset($advancedSettings->borderSpacing) ? $this->setBorderSpacing($advancedSettings->borderSpacing) : $this->setBorderSpacing(0);
            isset($advancedSettings->verticalScroll) ? $this->setVerticalScroll($advancedSettings->verticalScroll) : $this->setVerticalScroll(false);
            isset($advancedSettings->verticalScrollHeight) ? $this->setVerticalScrollHeight($advancedSettings->verticalScrollHeight) : $this->setVerticalScrollHeight(600);
            isset($advancedSettings->responsiveAction) ? $this->setResponsiveAction($advancedSettings->responsiveAction) : $this->setResponsiveAction('icon');
            isset($advancedSettings->pagination) ? $this->setPagination($advancedSettings->pagination) : $this->setPagination(true);
            isset($advancedSettings->paginationAlign) ? $this->setPaginationAlign($advancedSettings->paginationAlign) : $this->setPaginationAlign('right');
            isset($advancedSettings->paginationLayout) ? $this->setPaginationLayout($advancedSettings->paginationLayout) : $this->setPaginationLayout('full_numbers');
            isset($advancedSettings->paginationLayoutMobile) ? $this->setPaginationLayoutMobile($advancedSettings->paginationLayoutMobile) : $this->setPaginationLayoutMobile('simple');
            isset($advancedSettings->showTableToolsIncludeHTML) ? $this->setTableToolsIncludeHTML($advancedSettings->showTableToolsIncludeHTML) : $this->setTableToolsIncludeHTML(false);
            isset($advancedSettings->showTableToolsIncludeTitle) ? $this->setTableToolsIncludeTitle($advancedSettings->showTableToolsIncludeTitle) : $this->setTableToolsIncludeTitle(false);
            isset($advancedSettings->pdfPaperSize) ? $this->setPdfPaperSize($advancedSettings->pdfPaperSize) : $this->setPdfPaperSize('A4');
            isset($advancedSettings->pdfPageOrientation) ? $this->setPdfPageOrientation($advancedSettings->pdfPageOrientation) : $this->setPdfPageOrientation('portrait');
            isset($advancedSettings->show_table_description) ? $this->setShowDescription($advancedSettings->show_table_description) : $this->setShowDescription(false);
            isset($advancedSettings->table_description) ? $this->setDescription($advancedSettings->table_description) : $this->setDescription('');
            isset($advancedSettings->table_wcag) ? $this->setTableWCAG($advancedSettings->table_wcag) : $this->setTableWCAG(0);
            isset($advancedSettings->simple_template_id) ? $this->setSimpleTemplateId($advancedSettings->simple_template_id) : $this->setSimpleTemplateId(0);
            isset($advancedSettings->pagination_top) ? $this->setPaginationOnTop($advancedSettings->pagination_top) : $this->setPaginationOnTop(0);
        } else {
            $this->setInfoBlock(true);
            $this->setGlobalSearch(true);
            $this->setShowRowsPerPage(true);
            $this->setSimpleHeader(false);
            $this->setSimpleResponsive(false);
            $this->setStripeTable(false);
            $this->setCellPadding(10);
            $this->setRemoveBorders(false);
            $this->setBorderCollapse('collapse');
            $this->setBorderSpacing(0);
            $this->setVerticalScroll(false);
            $this->setVerticalScrollHeight(600);
            $this->setPagination(true);
            $this->setPaginationAlign('right');
            $this->setPaginationLayout('full_numbers');
            $this->setPaginationLayoutMobile('simple');
            $this->setTableToolsIncludeHTML(false);
            $this->setTableToolsIncludeTitle(false);
            $this->setPdfPaperSize('A4');
            $this->setPdfPageOrientation('portrait');
            $this->setShowDescription(false);
            $this->setDescription('');
            $this->setTableWCAG(0);
            $this->setPaginationOnTop(0);
        }

        if (!empty($columnData['columnOrder'])) {
            $this->reorderColumns($columnData['columnOrder']);
        }
        if (!empty($columnData['columnWidths'])) {
            $this->wdtDefineColumnsWidth($columnData['columnWidths']);
        }
        if (!empty($columnData['possibleValues'])) {
            $this->setColumnsPossibleValues($columnData['possibleValues']);
        }
        if (!empty($tableData->columns)) {
            $this->prepareRenderingRules($tableData->columns);
        }

    }

    /**
     * Helper method that prepares the rendering rules
     * @param array $columnData
     */
    public function prepareRenderingRules($columnData)
    {
        $columnIndex = 1;
        // Check the search values passed from URL
        if (isset($_GET['wdt_search'])) {
            $this->setDefaultSearchValue($_GET['wdt_search']);
        }

        // Define all column-dependent rendering rules
        foreach ($columnData as $key => $column) {

            $this->column_id = $key;
            // Set filter types
            $this->getColumn($column->orig_header)->setFilterType($column->filter_type);
            // Set CSS class
            $this->getColumn($column->orig_header)->addCSSClass($column->css_class);
            // Set visibility
            if (!$column->visible) {
                $this->getColumn($column->orig_header)->setIsVisible(false);
            }
            // Set hiding on phones and tablets for responsiveness
            if ($this->isResponsive()) {
                if ($column->hide_on_mobiles) {
                    $this->getColumn($column->orig_header)->setHiddenOnPhones(true);
                }
                if ($column->hide_on_tablets) {
                    $this->getColumn($column->orig_header)->setHiddenOnTablets(true);
                }
            }

            // if grouping enabled for this column, passing it to table class
            if ($column->groupColumn) {
                $this->groupByColumn($column->orig_header);
            }
            if ($column->defaultSortingColumn != '0') {
                $this->setDefaultSortColumn($column->orig_header);
                if ($column->defaultSortingColumn == '1') {
                    $this->setDefaultSortDirection('ASC');
                } elseif ($column->defaultSortingColumn == '2') {
                    $this->setDefaultSortDirection('DESC');
                }
            }
            // If thousands separator is disabled or column is "ID column for editing"
            // pass it to the column class instance
            if ($column->type == 'int') {
                if ($column->skip_thousands_separator || $column->id_column) {
                    $this->getColumn($column->orig_header)->setShowThousandsSeparator(false);
                    $this->addColumnsThousandsSeparator($column->orig_header, 0);
                } else {
                    $this->addColumnsThousandsSeparator($column->orig_header, 1);
                }
            }

            // Set ID column if specified
            if ($column->id_column) {
                $this->setIdColumnKey($column->orig_header);
            }
            // Set front-end editor input type
            $this->getColumn($column->orig_header)
                ->setInputType($column->editor_type);
            // Define if input cannot be empty
            $this->getColumn($column->orig_header)
                ->setNotNull((bool)$column->input_mandatory);

            // Get display before/after and color
            if (sanitize_html_class(strtolower(str_replace(' ', '-', $column->orig_header))) === '') {
                $cssColumnHeader = 'column-' . $this->column_id;
            } else {
                $cssColumnHeader = 'column-' . sanitize_html_class(strtolower(str_replace(' ', '-', $column->orig_header)));
            }
            if ($column->text_before != '') {
                $this->_columnsCSS .= "\n#{$this->getId()} > tbody > tr > td.{$cssColumnHeader}:not(:empty):before,
                                       \n#{$this->getId()} > tbody > tr.row-detail ul li.{$cssColumnHeader} span.columnValue:before
                                            { content: '{$column->text_before}' }";
            }
            if ($column->text_after != '') {
                $this->_columnsCSS .= "\n#{$this->getId()} > tbody > tr > td.{$cssColumnHeader}:not(:empty):after,
                                       \n#{$this->getId()} > tbody > tr.row-detail ul li.{$cssColumnHeader} span.columnValue:after
                                            { content: '{$column->text_after}' }";
            }
            if ($column->color != '') {
                $this->_columnsCSS .= "\n#{$this->getId()} > tbody > tr > td.{$cssColumnHeader}, "
                    . "#{$this->getId()} > tbody > tr.row-detail ul li.{$cssColumnHeader}, "
                    . "#{$this->getId()} > thead > tr > th.{$cssColumnHeader}, "
                    . "#{$this->getId()} > tfoot > tr > th.{$cssColumnHeader} { background-color: {$column->color} !important; }";
            }
	        if ($column->column_align_fields != '') {
		        $this->_columnsCSS .= "\n#{$this->getId()} > tbody > tr > td.{$cssColumnHeader} { text-align: {$column->column_align_fields} !important; }";
	        }

	        if ($column->column_align_header != '') {
		        $this->_columnsCSS .= "\n#{$this->getId()} > thead > tr > th.{$cssColumnHeader} { text-align: {$column->column_align_header} !important; }";
	        }

            $columnIndex++;
        }

    }

    /**
     * Returns JSON object for table description
     */
    public function getJsonDescription()
    {

        global $wdtExportFileName;

        $obj = new stdClass();
        $obj->tableId = $this->getId();
        $obj->tableType = $this->getTableType();
        $obj->selector = '#' . $this->getId();
        $obj->responsive = $this->isResponsive();
        $obj->responsiveAction = $this->getResponsiveAction();
        $obj->infoBlock = $this->isInfoBlock();
        $obj->pagination = $this->isPagination();
        $obj->paginationAlign = $this->getPaginationAlign();
        $obj->paginationLayout = $this->getPaginationLayout();
        $obj->paginationLayoutMobile = $this->getPaginationLayoutMobile();
        $obj->file_location = $this->getFileLocation();
        $obj->table_wcag = $this->isTableWCAG();
        $obj->simple_template_id = $this->getSimpleTemplateId();
        $obj->scrollable = $this->isScrollable();
        $obj->globalSearch = $this->isGlobalSearch();
        $obj->showRowsPerPage = $this->isShowRowsPerPage();
        $obj->hideBeforeLoad = $this->doHideBeforeLoad();
        $obj->pagination_top = $this->getPaginationOnTop();
        $obj->number_format = (int)(get_option('wdtNumberFormat') ? get_option('wdtNumberFormat') : 1);
        $obj->decimalPlaces = (int)(get_option('wdtDecimalPlaces') ? get_option('wdtDecimalPlaces') : 2);

        $obj->spinnerSrc = WDT_ASSETS_PATH . '/img/spinner.gif';
        $obj->groupingEnabled = $this->groupingEnabled();
        if ($this->groupingEnabled()) {
            $obj->groupingColumnIndex = $this->groupingColumn();
        }
        $obj->tableWpId = $this->getWpId();
        $obj->dataTableParams = new StdClass();

        $currentSkin = get_option('wdtBaseSkin');
        $obj->currentSkin = $currentSkin;
        $infoBlock = ($obj->infoBlock == true) ? 'i' : '';
        $pagination = ($obj->pagination == true) ? 'p' : '';
        $globalSearch = ($obj->globalSearch == true) ? 'f' : '';
        $showRowsPerPage = ($obj->showRowsPerPage == true) ? 'l' : '';
        $scrollable = ($this->isScrollable() == true) ? "<'wdtscroll't>" : 't';
        if (in_array($currentSkin, ['mojito', 'dark-mojito'])) {
            $obj->dataTableParams->sDom = "<'wdt_wrapper_for_buttons'{$globalSearch}{$showRowsPerPage}BT>{$scrollable}{$infoBlock}{$pagination}";
        } else {
            $obj->dataTableParams->sDom = "BT<'clear'>{$showRowsPerPage}{$globalSearch}{$scrollable}{$infoBlock}{$pagination}";
        }

        $obj->dataTableParams->bSortCellsTop = false;

        if ($this->paginationEnabled()) {
            $obj->dataTableParams->bPaginate = true;
            if (wp_is_mobile()) {
                $obj->dataTableParams->sPaginationType = $this->getPaginationLayoutMobile();
            } else {
                $obj->dataTableParams->sPaginationType = $this->getPaginationLayout();
            }
            $obj->dataTableParams->aLengthMenu = json_decode('[[1,5,10,25,50,100,-1],[1,5,10,25,50,100,"' . __('All', 'wpdatatables') . '"]]');
            $obj->dataTableParams->iDisplayLength = (int)$this->getDisplayLength();
        } else {
            $obj->dataTableParams->aLengthMenu = json_decode('[[1,5,10,25,50,100,-1],[1,5,10,25,50,100,"' . __('All', 'wpdatatables') . '"]]');
            $obj->dataTableParams->iDisplayLength = (int)$this->getDisplayLength();
            if ($this->groupingEnabled()) {
                $obj->dataTableParams->aaSortingFixed = json_decode('[[' . $this->groupingColumn() . ', "asc"]]');
            }
        }
        if (get_option('wdtTabletWidth')) {
            $obj->tabletWidth = get_option('wdtTabletWidth');
        }
        if (get_option('wdtMobileWidth')) {
            $obj->mobileWidth = get_option('wdtMobileWidth');
        }
        $obj->dataTableParams->columnDefs = json_decode('[' . $this->getColumnDefinitions() . ']');
        $obj->dataTableParams->bAutoWidth = false;

        if (!is_null($this->getDefaultSortColumn())) {
            $obj->dataTableParams->order = json_decode('[[' . $this->getDefaultSortColumn() . ', "' . strtolower($this->getDefaultSortDirection()) . '" ]]');
        } else {
            $orderColumn = '';
            foreach ($obj->dataTableParams->columnDefs as $columnKey => $column) {
                if ($column->orderable === true) {
                    $orderColumn = $columnKey;
                    break;
                }
            }
            $obj->dataTableParams->order = json_decode('[[' . $orderColumn . ' ,"asc"]]');
        }

        if ($this->sortEnabled()) {
            $obj->dataTableParams->ordering = true;
        } else {
            $obj->dataTableParams->ordering = false;
        }

        if ($this->getInterfaceLanguage()) {
            $obj->dataTableParams->oLanguage = json_decode(file_get_contents($this->getInterfaceLanguage()));
        }

        if (empty($wdtExportFileName)) {
            if (!empty($this->_title)) {
                $wdtExportFileName = $this->_title;
            } else {
                $wdtExportFileName = 'wpdt_export';
            }
        }

        $skinsWithNewTableToolsButtons = ['aqua','purple','dark','raspberry-cream', 'mojito', 'dark-mojito'];
        $tableToolsIncludeHTML = !$this->getTableToolsIncludeHTML();
        $printBttnText = in_array($currentSkin, ['mojito','raspberry-cream', 'dark-mojito']) ? '' : __('Print', 'wpdatatables');
        $tableToolsExportTitle = $this->getTableToolsIncludeTitle() ? $this->getName() : null;
        $exportBttnText = $currentSkin == in_array($currentSkin, ['mojito', 'dark-mojito']) ? '' : __('Export', 'wpdatatables');
        $pdfPaperSize = $this->getPdfPaperSize();
        $pdfPageOrientation = $this->getPdfPageOrientation();
        $columnsBttnText = $currentSkin == in_array($currentSkin, ['mojito', 'dark-mojito']) ? '' : __('Columns', 'wpdatatables');

        if ($this->TTEnabled()) {
            (!isset($obj->dataTableParams->buttons)) ? $obj->dataTableParams->buttons = array() : '';
            if (in_array($currentSkin, $skinsWithNewTableToolsButtons)) {

                if (!empty($this->_tableToolsConfig['columns'])) {
                    $obj->dataTableParams->buttons[] =
                        array(
                            'extend'           => 'colvis',
                            'className'        => 'DTTT_button DTTT_button_colvis',
                            'text'             => $columnsBttnText,
                            'collectionLayout' => 'wdt-skin-' . $currentSkin
                        );
                }
                if (!empty($this->_tableToolsConfig['print'])) {
                    $obj->dataTableParams->buttons[] =
                        array(
                            'extend'        => 'print',
                            'exportOptions' => array(
                                'columns'   => ':visible',
                                'stripHtml' => $tableToolsIncludeHTML
                            ),
                            'className' => 'DTTT_button DTTT_button_print',
                            'text' => $printBttnText,
                            'title' => $wdtExportFileName
                        );
                }

                if (!empty($this->_tableToolsConfig['excel'])) {
                    $exportButtons[] =
                        array(
                            'extend'        => 'excelHtml5',
                            'exportOptions' => array(
                                'columns'   => ':visible',
                                'stripHtml' => $tableToolsIncludeHTML
                            ),
                            'filename'      => $wdtExportFileName,
                            'title'         => $tableToolsExportTitle,
                            'text'          => __('Excel', 'wpdatatables')
                        );
                }
                if (!empty($this->_tableToolsConfig['csv'])) {
                    $exportButtons[] =
                        array(
                            'extend'        => 'csvHtml5',
                            'exportOptions' => array(
                                'columns'   => ':visible',
                                'stripHtml' => $tableToolsIncludeHTML
                            ),
                            'title'         => $wdtExportFileName,
                            'text'          => __('CSV', 'wpdatatables')
                        );
                }
                if (!empty($this->_tableToolsConfig['copy'])) {
                    $exportButtons[] =
                        array(
                            'extend'        => 'copyHtml5',
                            'exportOptions' => array(
                                'columns'   => ':visible',
                                'stripHtml' => $tableToolsIncludeHTML
                            ),
                            'filename'      => $wdtExportFileName,
                            'title'         => $tableToolsExportTitle,
                            'text'          => __('Copy', 'wpdatatables')
                        );
                }
                if (!empty($this->_tableToolsConfig['pdf'])) {
                    $exportButtons[] =
                        array(
                            'extend'        => 'pdfHtml5',
                            'exportOptions' => array('columns' => ':visible'),
                            'orientation'   => $pdfPageOrientation,
                            'pageSize'      => $pdfPaperSize,
                            'title'         => $wdtExportFileName,
                            'text'          => __('PDF', 'wpdatatables')
                        );
                }

                if (!empty($exportButtons)) {
                    $obj->dataTableParams->buttons[] = array(
                        'extend'    => 'collection',
                        'className' => 'DTTT_button DTTT_button_export',
                        'text'      => $exportBttnText,
                        'buttons'   => $exportButtons
                    );
                }

            } else {

                if (!empty($this->_tableToolsConfig['columns'])) {
                    $obj->dataTableParams->buttons[] =
                        array(
                            'extend'           => 'colvis',
                            'className'        => 'DTTT_button DTTT_button_colvis',
                            'text'             => $columnsBttnText,
                            'collectionLayout' => 'wdt-skin-' . $currentSkin
                        );
                }
                if (!empty($this->_tableToolsConfig['print'])) {
                    $obj->dataTableParams->buttons[] =
                        array(
                            'extend'        => 'print',
                            'exportOptions' => array(
                                'columns' => ':visible',
                                'stripHtml' => $tableToolsIncludeHTML
                            ),
                            'className'     => 'DTTT_button DTTT_button_print',
                            'title'         => $wdtExportFileName,
                            'text'          => $printBttnText,
                        );
                }

                if (!empty($this->_tableToolsConfig['excel'])) {
                    $obj->dataTableParams->buttons[] =
                        array(
                            'extend'        => 'excelHtml5',
                            'exportOptions' => array(
                                'columns'   => ':visible',
                                'stripHtml' => $tableToolsIncludeHTML
                            ),
                            'className'     => 'DTTT_button DTTT_button_xls',
                            'filename'      => $wdtExportFileName,
                            'title'         => $tableToolsExportTitle,
                            'text'          => __('Excel', 'wpdatatables')
                        );
                }
                if (!empty($this->_tableToolsConfig['csv'])) {
                    $obj->dataTableParams->buttons[] =
                        array(
                            'extend'        => 'csvHtml5',
                            'exportOptions' => array(
                                'columns'   => ':visible',
                                'stripHtml' => $tableToolsIncludeHTML
                            ),
                            'className'     => 'DTTT_button DTTT_button_csv',
                            'title'         => $wdtExportFileName,
                            'text'          => __('CSV', 'wpdatatables')
                        );
                }
                if (!empty($this->_tableToolsConfig['copy'])) {
                    $obj->dataTableParams->buttons[] =
                        array(
                            'extend'        => 'copyHtml5',
                            'exportOptions' => array(
                                'columns'   => ':visible',
                                'stripHtml' => $tableToolsIncludeHTML
                            ),
                            'className'     => 'DTTT_button DTTT_button_copy',
                            'filename'      => $wdtExportFileName,
                            'title'         => $tableToolsExportTitle,
                            'text'          => __('Copy', 'wpdatatables')
                        );
                }
                if (!empty($this->_tableToolsConfig['pdf'])) {
                    $obj->dataTableParams->buttons[] =
                        array(
                            'extend'        => 'pdfHtml5',
                            'exportOptions' => array('columns' => ':visible'),
                            'className'     => 'DTTT_button DTTT_button_pdf',
                            'orientation'   => $pdfPageOrientation,
                            'pageSize'      => $pdfPaperSize,
                            'title'         => $wdtExportFileName,
                            'text'          => __('PDF', 'wpdatatables')
                        );
                }
            }
        }

        if (in_array($currentSkin, $skinsWithNewTableToolsButtons)) {

            if (!isset($obj->dataTableParams->oLanguage)) {
                $obj->dataTableParams->oLanguage = new stdClass();
            }

            $obj->dataTableParams->oLanguage->sSearch = '<span class="wdt-search-icon"></span>';
            $obj->dataTableParams->oLanguage->sSearchPlaceholder = __('Search table', 'wpdatatables');
            $obj->dataTableParams->oLanguage->sLengthMenu = __('Showing _MENU_ Entries', 'wpdatatables');
        }


        if (!isset($obj->dataTableParams->buttons)) {
            $obj->dataTableParams->buttons = array();
        }

        $obj->columnsFixed = 0;


        $init_format = get_option('wdtDateFormat');
        $datepick_format = str_replace('d', 'dd', $init_format);
        $datepick_format = str_replace('m', 'mm', $datepick_format);
        $datepick_format = str_replace('Y', 'yy', $datepick_format);

        $obj->timeFormat = get_option('wdtTimeFormat');
        $obj->datepickFormat = $datepick_format;

        $obj->dataTableParams->oSearch = array('bSmart' => false, 'bRegex' => false, 'sSearch' => $this->getDefaultSearchValue());

        $obj = apply_filters('wpdatatables_filter_table_description', $obj, $this->getWpId(), $this);

        return json_encode($obj, JSON_HEX_APOS | JSON_HEX_QUOT | JSON_HEX_TAG);
    }


    /**
     * @param $columnKey
     * @param $foreignKeyRule
     * @param $dataRows
     * @return mixed
     */
    public function joinWithForeignWpDataTable($columnKey, $foreignKeyRule, $dataRows)
    {
        $joinedTable = WPDataTable::loadWpDataTable($foreignKeyRule->tableId);
        $distinctValues = $joinedTable->getDistinctValuesForColumns($foreignKeyRule);
        foreach ($dataRows as &$dataRow) {
            $dataRow[$columnKey] = isset($distinctValues[$dataRow[$columnKey]]) ? $distinctValues[$dataRow[$columnKey]] : $dataRow[$columnKey];
        }

        return array(
            'dataRows' => $dataRows,
            'distinctValues' => $distinctValues
        );

    }

    /**
     * Function that returns related values (ID's and strings) for Foreign Key feature
     * by provided foreign key rule
     * @param $foreignKeyRule stdClass that contains tableId, tableName, displayColumnId, displayColumnName,
     * storeColumnId and storeColumnName
     * @return array
     */
    public function getDistinctValuesForColumns($foreignKeyRule)
    {
        $distinctValues = array();
        $storeColumnName = $foreignKeyRule->storeColumnName;
        $displayColumnName = $foreignKeyRule->displayColumnName;
        $tableType = $this->getTableType();

        if ($tableType == 'mysql' || $tableType == 'manual') {
            $tableContent = $this->getTableContent();

            $distValuesQuery = "SELECT(`$storeColumnName`) AS `$storeColumnName`, (`$displayColumnName`) AS `$displayColumnName` FROM ($tableContent) tbl GROUP BY $storeColumnName ORDER BY $displayColumnName";

            if (!get_option('wdtUseSeparateCon')) {
                global $wpdb;
                $mySqlResult = $wpdb->get_results($distValuesQuery);

                foreach ($mySqlResult as $dataRow) {
                    $distinctValues[$dataRow->$storeColumnName] = $dataRow->$displayColumnName;
                }
            } else {
                $sql = new PDTSql(WDT_MYSQL_HOST, WDT_MYSQL_DB, WDT_MYSQL_USER, WDT_MYSQL_PASSWORD, WDT_MYSQL_PORT);
                $mySqlResult = $sql->getArray($distValuesQuery);

                foreach ($mySqlResult as $dataRow) {
                    $distinctValues[$dataRow[$storeColumnName]] = $dataRow[$displayColumnName];
                }
            }
        } else {
            foreach ($this->getDataRows() as $dataRow) {
                $distinctValues[$dataRow[$storeColumnName]] = $dataRow[$displayColumnName];
            }
        }

        return $distinctValues;
    }


    /**
     * Delete table by ID
     * @param $tableId
     * @return bool
     */
    public static function deleteTable($tableId)
    {
        global $wpdb;

        if (!isset($_REQUEST['wdtNonce']) || empty($tableId) || !current_user_can('manage_options') || !wp_verify_nonce($_REQUEST['wdtNonce'], 'wdtDeleteTableNonce')) {
            return false;
        }

        $table = WDTConfigController::loadTableFromDB($tableId);

        if (!$table) {
            return false;
        }

        if (!empty($table->table_type)) {
            if ($table->table_type == 'manual') {
                if (!get_option('wdtUseSeparateCon')) {
                    $wpdb->query("DROP TABLE {$table->mysql_table_name}");
                } else {
                    $sql = new PDTSql(WDT_MYSQL_HOST, WDT_MYSQL_DB, WDT_MYSQL_USER, WDT_MYSQL_PASSWORD, WDT_MYSQL_PORT);
                    $sql->doQuery("DROP TABLE {$table->mysql_table_name}");
                }
            }
        }

        $wpdb->delete("{$wpdb->prefix}wpdatatables", array('id' => (int)$tableId));
        $wpdb->delete("{$wpdb->prefix}wpdatatables_columns", array('table_id' => (int)$tableId));
	    $wpdb->delete("{$wpdb->prefix}wpdatatables_rows", array('table_id' => (int)$tableId));
	    $wpdb->delete("{$wpdb->prefix}wpdatatables_cache", array('table_id' => (int)$tableId));
        $wpdb->delete("{$wpdb->prefix}wpdatacharts", array('wpdatatable_id' => (int)$tableId));

        return true;
    }

    /**
     * Get all tables
     * @return array|null|object
     */
    public static function getAllTables()
    {
        global $wpdb;
        $query = "SELECT id, title, table_type, server_side FROM {$wpdb->prefix}wpdatatables ORDER BY id";
        $allTables = $wpdb->get_results($query, ARRAY_A);
        return $allTables;
    }

    /**
     * Get all tables except simple tables
     * @return array|null|object
     */
    public static function getAllTablesExceptSimple() {
        global $wpdb;

        $query = "SELECT id, title FROM {$wpdb->prefix}wpdatatables WHERE NOT table_type = 'simple' ORDER BY id";

        $allTables = $wpdb->get_results($query, ARRAY_A);
        return $allTables;
    }

    /**
     * Helper method that load wpDataTable object by given table ID
     * and return array with $wpDataTable object and $tableData object
     * @param $tableId
     * @param null $tableView
     * @param bool $disableLimit
     * @return WPDataTable|WPExcelDataTable|bool
     */
    public static function loadWpDataTable($tableId, $tableView = null, $disableLimit = false)
    {
        $tableData = WDTConfigController::loadTableFromDB($tableId);

        if ($tableData) {
            $tableData->disable_limit = $disableLimit;
        }

        $wpDataTable = $tableView == 'excel' ? new WPExcelDataTable() : new self();
        $wpDataTable->setWpId($tableId);

        $columnDataPrepared = $wpDataTable->prepareColumnData($tableData);

        $wpDataTable->fillFromData($tableData, $columnDataPrepared);

        return $wpDataTable;
    }

}
