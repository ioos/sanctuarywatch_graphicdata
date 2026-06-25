/**
 * JS Class for Column objects
 *
 * @author Alexander Gilmanov
 * @since 22.11.2016
 */
var WDTColumn = function (column, parent_table) {
    /**
     * Id of column
     * @type {null|int}
     */
    this.id = null;

    /**
     * Type of column
     * @type {null|string}
     */
    this.type = null;

    /**
     * Original header of column. Must be unique within the table
     * @type {null|string}
     */
    this.orig_header = null;

    /**
     * Header to display
     * @type {null|string}
     */
    this.display_header = null;

    /**
     * Position of column in the table
     * @type {null|int}
     */
    this.pos = null;

    /**
     * Text to display before content of cells
     * @type {string}
     */
    this.text_before = '';

    /**
     * Text to display after content of cells
     * @type {string}
     */
    this.text_after = '';

    /**
     * Hide on mobiles on responsive
     * @type {int}
     */
    this.hide_on_mobiles = 0;

    /**
     * Hide on desktops on responsive
     * @type {int}
     */
    this.hide_on_tablets = 0;

    /**
     * CSS class
     * @type {string}
     */
    this.css_class = '';

    /**
     * Whether this column should be used as a group column
     * @type {number}
     */
    this.groupColumn = 0;

    /**
     * Column color
     */
    this.color = '';

    /**
     * Column align cells
     * @type {string}
     */
    this.column_align_fields = '';

    /**
     * Column align headers
     * @type {string}
     */
    this.column_align_header = '';

    /**
     * Column visibility
     * @type {number}
     */
    this.visible = 1;

    /**
     * Column width
     * @type {number}
     */
    this.width = 0;

    /**
     * Default decimal places amount for floats
     * @type {number}
     */
    this.decimalPlaces = -1;

    /**
     * Defines how the possible values will be read
     * Fixed list, read on load, use from another table
     * @type {null|string}
     */
    this.possibleValuesType = null;

    /**
     * If possible values defined as a fixed list store it here
     * @type {null|string}
     */
    this.valuesList = null;

    /**
     * If possible values defined to be loaded from another table
     * store it here
     * @type {null|string}
     */
    this.foreignKeyRule = null;

    /**
     * Allow empty values for possible values list
     * @type {int}
     */
    this.possibleValuesAddEmpty = 0;

    /**
     * Toggle calculate total for numeric columns
     * @type {int}
     */
    this.calculateTotal = 0;

    /**
     * Toggle calculate average for numeric columns
     * @type {int}
     */
    this.calculateAvg = 0;

    /**
     * Toggle calculate minimum for numeric columns
     * @type {int}
     */
    this.calculateMin = 0;

    /**
     * Toggle calculate maximum for numeric columns
     * @type {int}
     */
    this.calculateMax = 0;

    /**
     * Toggle skip thousands separator for integer columns
     * @type {int}
     */
    this.skip_thousands_separator = 0;

    /**
     * Toggle sorting
     * @type {int}
     */
    this.sorting = 1;

    /**
     * Use as default sorting column
     * @type {number}
     */
    this.defaultSortingColumn = 0;

    /**
     * Enable a filter for this column
     * @type {number}
     */
    this.filtering = 0;

    /**
     * Toggle global search column
     * @type {int}
     */
    this.globalSearchColumn = 1;

    /**
     * Filter type for this column
     * @type {string}
     */
    this.filter_type = null;

    /**
     * Toggle exact filtering
     * @type {int}
     */
    this.exactFiltering = 0;

    /**
     * Filter label
     * @type {string}
     */
    this.filterLabel = 0;

    /**
     * Default filter value
     * @type {string}
     */
    this.filterDefaultValue = null;

    /**
     * Default Value Possible Values
     * @type {string}
     */
    this.defaultValueValues = null;


    /**
     * Editor input type for editable tables
     * @type {null}
     */
    this.editor_type = null;

    /**
     * Toggle the non-empty validation for this column
     * @type {int}
     */
    this.editingNonEmpty = 0;

    /**
     * Default editing value
     * @type {string}
     */
    this.editingDefaultValue = null;

    /**
     * Conditional formatting rules
     */
    this.conditional_formatting = [];

    /**
     * Link to parent wpdatatable_config object
     * @type {null}|obj
     */
    this.parent_table = null;

    /**
     * Formula for the formula-based columns
     * @type {string}
     */
    this.formula = '';

    /**
     * Indicator if the config editor open for this column
     */
    this.is_config_open = false;

    /**
     * Flag if this is the ID column for editing
     */
    this.id_column = 0;

    /**
     * Date input format
     */
    this.dateInputFormat = null;
    /**
     * Open link column in a popup
     */
    this.linkTargetAttribute = '_self';

    /**
     * Set NOFOLLOW link
     */
    this.linkNofollowAttribute = 0;

    /**
     * Set NOREFERRER link
     */
    this.linkNoreferrerAttribute = 0;

    /**
     * Set SPONSORED link
     */
    this.linkSponsoredAttribute = 0;

    /**
     *  Open link column as a button
     */
    this.linkButtonAttribute = 0;

    /**
     *  Url link button label
     */
    this.linkButtonLabel = null;
    /**
     *  Url link button class
     */
    this.linkButtonClass = null;

    /**
     * Initialize with object if passed
     */
    if (typeof column !== 'undefined') {
        this.calculateAvg = column.calculateAvg || 0;
        this.calculateMax = column.calculateMax || 0;
        this.calculateMin = column.calculateMin || 0;
        this.calculateTotal = column.calculateTotal || 0;
        this.color = column.color || '';
        this.conditional_formatting = column.conditional_formatting || [];
        this.css_class = column.css_class || '';
        this.dateInputFormat = column.dateInputFormat || '';
        this.decimalPlaces = column.decimalPlaces;
        this.defaultSortingColumn = column.defaultSortingColumn || 0;
        this.defaultValueValues = column.defaultValueValues || null;
        this.display_header = column.display_header || null;
        this.editingDefaultValue = column.editingDefaultValue || null;
        this.editingNonEmpty = column.input_mandatory || 0;
        this.editor_type = column.editor_type || 'none';
        this.exactFiltering = column.exactFiltering || 0;
        this.filter_type = column.filter_type || 'text';
        this.filterDefaultValue = column.filterDefaultValue || null;
        this.filtering = typeof column.filtering !== 'undefined' ? column.filtering : 1;
        this.globalSearchColumn = column.globalSearchColumn || 0;
        this.filterLabel = column.filterLabel || null;
        this.foreignKeyRule = column.foreignKeyRule || null;
        this.formula = column.formula || '';
        this.groupColumn = column.groupColumn || 0;
        this.hide_on_mobiles = column.hide_on_mobiles || 0;
        this.hide_on_tablets = column.hide_on_tablets || 0;
        this.id = column.id || null;
        this.id_column = column.id_column || 0;
        this.linkTargetAttribute = column.linkTargetAttribute || '_self';
        this.linkNofollowAttribute = column.linkNofollowAttribute || 0;
        this.linkNoreferrerAttribute = column.linkNoreferrerAttribute || 0;
        this.linkSponsoredAttribute = column.linkSponsoredAttribute || 0;
        this.linkButtonAttribute = column.linkButtonAttribute || 0;
        this.linkButtonLabel = column.linkButtonLabel || null;
        this.linkButtonClass = column.linkButtonClass || null;
        this.orig_header = column.orig_header || null;
        this.parent_table = column.parent_table || null;
        this.pos = column.pos || 0;
        this.possibleValuesAddEmpty = column.possibleValuesAddEmpty || 0;
        this.possibleValuesType = column.possibleValuesType || null;
        this.skip_thousands_separator = column.skip_thousands_separator || 0;
        this.sorting = typeof column.sorting !== 'undefined' ? column.sorting : 1;
        this.text_after = column.text_after || null;
        this.text_before = column.text_before || null;
        this.type = column.type || null;
        this.valuesList = column.valuesList || null;
        this.visible = typeof column.visible !== 'undefined' ? column.visible : 1;
        this.width = column.width || null;
        this.column_align_fields = column.column_align_fields || '';
        this.column_align_header = column.column_align_header || '';
    }
};

/**
 * Set column type
 * @param type
 */
WDTColumn.prototype.setType = function (type) {
    this.type = type;
};

/**
 * Gets column type
 * @returns {null|*}
 */
WDTColumn.prototype.getType = function () {
    return this.type;
};

/**
 * Set column ID
 * @param id
 */
WDTColumn.prototype.setId = function (id) {
    this.id = id;
};

/**
 * Get column ID
 * @returns {null|*}
 */
WDTColumn.prototype.getId = function () {
    return this.id;
};


/**
 * Set column display header
 * @param display_header
 */
WDTColumn.prototype.setDisplayHeader = function (display_header) {
    this.display_header = display_header;
};

/**
 * Get column display header
 */
WDTColumn.prototype.getDisplayHeader = function () {
    return this.display_header;
};

/**
 * Set text before
 * @param {string} text_before
 */
WDTColumn.prototype.setTextBefore = function (text_before) {
    this.text_before = text_before;
};

/**
 * Get text before
 * @returns {string|*|null}
 */
WDTColumn.prototype.getTextBefore = function () {
    return this.text_before;
};

/**
 * Set text after
 * @param {string} text_after
 */
WDTColumn.prototype.setTextAfter = function (text_after) {
    this.text_after = text_after;
};

/**
 * Get text after
 * @returns {string|*|null}
 */
WDTColumn.prototype.getTextAfter = function () {
    return this.text_after;
};

/**
 * Set Hide on Mobiles for responsive tables
 * @param {int} hideOnMobiles
 */
WDTColumn.prototype.setHideOnMobiles = function (hideOnMobiles) {
    this.hide_on_mobiles = hideOnMobiles;
};

/**
 * Get Hide On Mobiles
 * @returns {int}
 */
WDTColumn.prototype.getHideOnMobiles = function () {
    return this.hide_on_mobiles;
};

/**
 * Set Hide on Mobiles for responsive tables
 * @param {int} hideOnTablets
 */
WDTColumn.prototype.setHideOnTablets = function (hideOnTablets) {
    this.hide_on_tablets = hideOnTablets;
};

/**
 * Get Hide On Mobiles
 * @returns {int}
 */
WDTColumn.prototype.getHideOnTablets = function () {
    return this.hide_on_tablets;
};

/**
 * Set column CSS class
 * @param {string} css_class
 */
WDTColumn.prototype.setCssClass = function (css_class) {
    this.css_class = css_class;
};

/**
 * Get column Column CSS class
 * @returns {string}
 */
WDTColumn.prototype.getCssClass = function () {
    return this.css_class;
};

/**
 * Set Group Column
 * @param {int} groupColumn
 */
WDTColumn.prototype.setGroupColumn = function (groupColumn) {
    this.groupColumn = groupColumn;
};

/**
 * Get Group Column
 * @return {int}
 */
WDTColumn.prototype.getGroupColumn = function () {
    return this.groupColumn;
};

/**
 * Set column color
 * @param {string} color
 */
WDTColumn.prototype.setColor = function (color) {
    this.color = color;
};

/**
 * Get column color
 * @returns {string}
 */
WDTColumn.prototype.getColor = function () {
    return this.color;
};

/**
 * Set column ID for editing flog
 * @param {int} idColumn
 */
WDTColumn.prototype.setIdColumn = function (idColumn) {
    this.id_column = idColumn;
    jQuery('#wdt-id-editing-column').val(this.id);
};

/**
 * Get column ID for editing flog
 * @returns {string}
 */
WDTColumn.prototype.getIdColumn = function () {
    return this.id_column;
};

/**
 * Set Visibility
 * @param {int} visible
 */
WDTColumn.prototype.setVisible = function (visible) {
    this.visible = visible;
};

/**
 * Get Visibility
 * @return {int}
 */
WDTColumn.prototype.getVisible = function () {
    return this.visible;
};

/**
 * Set Width
 * @param {string} width
 */
WDTColumn.prototype.setWidth = function (width) {
    this.width = width;
};

/**
 * Get Width
 * @return {string}
 */
WDTColumn.prototype.getWidth = function () {
    return this.width;
};

/**
 * Get Position
 * @return {int}
 */
WDTColumn.prototype.getPos = function () {
    return this.pos;
};

/**
 * Set Position
 */
WDTColumn.prototype.setPos = function (pos) {
    this.pos = pos;
};

/**
 * Set Decimal Places
 * @param {int} decimalPlaces
 */
WDTColumn.prototype.setDecimalPlaces = function (decimalPlaces) {
    this.decimalPlaces = decimalPlaces;
};

/**
 * Get Decimal Places
 * @return {int}
 */
WDTColumn.prototype.getDecimalPlaces = function () {
    return this.decimalPlaces;
};

/**
 * Set Values Type (how to handle possible values)
 * @param {string} valuesType
 */
WDTColumn.prototype.setPossibleValuesType = function (valuesType) {
    this.possibleValuesType = valuesType;
};

/**
 * Get Values Type
 * @return {string}
 */
WDTColumn.prototype.getPossibleValuesType = function () {
    return this.possibleValuesType;
};

/**
 * Set Add Empty Value flag
 * Defines whether an empty value will be added to the list of possible values
 * @param {int} possibleValuesAddEmpty
 */
WDTColumn.prototype.setPossibleValuesAddEmpty = function (possibleValuesAddEmpty) {
    this.possibleValuesAddEmpty = possibleValuesAddEmpty;
};

/**
 * Get the Add Empty Value flag
 * (If an empty value in the list of possible values is allowed)
 * @return {int}
 */
WDTColumn.prototype.getPossibleValuesAddEmpty = function () {
    return this.possibleValuesAddEmpty;
};

/**
 * Set Values List (for columns with hardcoded list of possible values)
 * @param {string} valuesList
 */
WDTColumn.prototype.setValuesList = function (valuesList) {
    this.valuesList = valuesList;
};

/**
 * Get Values List
 * @return {string}
 */
WDTColumn.prototype.getValuesList = function () {
    return this.valuesList;
};

/**
 * Set Values ForeignKey (configuration for connecting to a remote table
 * for list of values for filtering and editing)
 * @param {obj} foreignKeyRule
 */
WDTColumn.prototype.setForeignKeyRule = function (foreignKeyRule) {
    this.foreignKeyRule = foreignKeyRule;
};

/**
 * Get Values Foreign Key config
 * @return {obj}
 */
WDTColumn.prototype.getForeignKeyRule = function () {
    return this.foreignKeyRule;
};

/**
 * Set Calculate Total
 * @param calculateTotal
 */
WDTColumn.prototype.setCalculateTotal = function (calculateTotal) {
    this.calculateTotal = calculateTotal;
};

/**
 * Get Calculate Total
 * @return calculateTotal
 */
WDTColumn.prototype.getCalculateTotal = function () {
    return this.calculateTotal;
};

/**
 * Set Calculate Average
 * @param {int} calculateAvg
 */
WDTColumn.prototype.setCalculateAvg = function (calculateAvg) {
    this.calculateAvg = calculateAvg;
};

/**
 * Get Calculate Average
 * @return {int} calculateTotal
 */
WDTColumn.prototype.getCalculateAvg = function () {
    return this.calculateAvg;
};

/**
 * Set Calculate Max
 * @param {int} calculateMax
 */
WDTColumn.prototype.setCalculateMax = function (calculateMax) {
    this.calculateMax = calculateMax;
};

/**
 * Get Calculate Max
 * @return {int} calculateMax
 */
WDTColumn.prototype.getCalculateMax = function () {
    return this.calculateMax;
};

/**
 * Set Calculate Min
 * @param {int} calculateMin
 */
WDTColumn.prototype.setCalculateMin = function (calculateMin) {
    this.calculateMin = calculateMin;
};

/**
 * Get Calculate Min
 * @return calculateMin
 */
WDTColumn.prototype.getCalculateMin = function () {
    return this.calculateMin;
};

/**
 * Set Skip Thousands Separator
 * @param {int} skipThousandsSeparator
 */
WDTColumn.prototype.setSkipThousandsSeparator = function (skipThousandsSeparator) {
    this.skip_thousands_separator = skipThousandsSeparator;
};

/**
 * Get Skip Thousands Separator
 * @return {int} skipThousandsSeparator
 */
WDTColumn.prototype.getSkipThousandsSeparator = function () {
    return this.skip_thousands_separator;
};

/**
 * Set Sorting
 * @param {int} sorting
 */
WDTColumn.prototype.setSorting = function (sorting) {
    this.sorting = sorting;
};

/**
 * Get Sorting
 * @return {int} sorting
 */
WDTColumn.prototype.getSorting = function () {
    return this.sorting;
};

/**
 * Set as Default Sorting Column
 * @param {int} defaultSortingColumn
 */
WDTColumn.prototype.setDefaultSortingColumn = function (defaultSortingColumn) {
    this.defaultSortingColumn = defaultSortingColumn;
};

/**
 * Get Default Sorting Column
 * @return {int} sorting
 */
WDTColumn.prototype.getDefaultSortingColumn = function () {
    return this.defaultSortingColumn;
};

/**
 * Set Filtering
 * @param {int} filtering
 */
WDTColumn.prototype.setFiltering = function (filtering) {
    this.filtering = filtering;
};

/**
 * Get Filtering
 * @return {int} filtering
 */
WDTColumn.prototype.getFiltering = function () {
    return this.filtering;
};

/**
 * Set global search for column
 * @param {int} globalSearchColumn
 */
WDTColumn.prototype.setGlobalSearchColumm = function (globalSearchColumn) {
    this.globalSearchColumn = globalSearchColumn;
};

/**
 * Get global search for column
 * @return {int} globalSearchColumn
 */
WDTColumn.prototype.getGlobalSearchColumn = function () {
    return this.globalSearchColumn;
};

/**

 /**
 * Set Filter Type
 * @param {string} filterType
 */
WDTColumn.prototype.setFilterType = function (filterType) {
    this.filter_type = filterType;
};

/**
 * Get Filter Type
 * @return {int} filterType
 */
WDTColumn.prototype.getFilterType = function () {
    return this.filter_type;
};

/**
 * Set Editor Type
 * @param {string} editorType
 */
WDTColumn.prototype.setEditorType = function (editorType) {
    this.editor_type = editorType;
};

/**
 * Get Editor Type
 * @return {string} editorType
 */
WDTColumn.prototype.getEditorType = function () {
    return this.filter_type;
};

/**
 * Set Non Empty
 * @param {int} nonEmpty
 */
WDTColumn.prototype.setNonEmpty = function (nonEmpty) {
    this.editingNonEmpty = nonEmpty;
};

/**
 * Get Non Empty
 * @return {int} nonEmpty
 */
WDTColumn.prototype.getNonEmpty = function () {
    return this.editingNonEmpty;
};

/**
 * Set Conditional Formatting rules
 * @param {array} conditionalFormatting
 */
WDTColumn.prototype.setConditionalFormatting = function (conditionalFormatting) {
    this.conditional_formatting = conditionalFormatting;
};

/**
 * Get Conditional Formatting rules
 * @return {int} nonEmpty
 */
WDTColumn.prototype.getConditionalFormatting = function () {
    return this.conditional_formatting;
};

/**
 * Set Formula
 * @param {string} formula
 */
WDTColumn.prototype.setFormula = function (formula) {
    this.formula = formula;
};

/**
 * Get Formula
 * @return {string}
 */
WDTColumn.prototype.getFormula = function () {
    return this.formula;
};

/**
 * Defines a link to a parent table
 * @param tableLink
 */
WDTColumn.prototype.setParentTable = function (tableLink) {
    this.parent_table = tableLink;
};

/**
 * Returns the link to parent table
 * @returns {null|*}
 */
WDTColumn.prototype.getParentTable = function () {
    return this.parent_table;
};

/**
 * Set date input format
 * @param {string} dateInputFormat
 */
WDTColumn.prototype.setDateInputFormat = function (dateInputFormat) {
    this.dateInputFormat = dateInputFormat;
};

/**
 * Get date input format
 * @returns {string|*|null}
 */
WDTColumn.prototype.getDateInputFormat = function () {
    return this.dateInputFormat;
};

/**
 * Renders the conditional formatting rule in the column settings panel
 * @param formattingRule object with the rule
 */
WDTColumn.prototype.renderConditionalFormattingBlock = function (formattingRule) {
    var conditional_formatting_tpl = jQuery('#wdt-column-conditional-formatting-template').html();
    var $block = jQuery(conditional_formatting_tpl)
        .appendTo('div.wdt-conditional-formatting-rules-container');
    $block.find('select.formatting-rule-if-clause')
        .val(formattingRule.ifClause)
        .wdtBootstrapSelectPicker();
    $block.find('input.formatting-rule-cell-value')
        .val(formattingRule.cellVal).addClass('wdt-' + jQuery('#wdt-column-type').val() + 'picker');
    $block.find('select.formatting-rule-action')
        .val(formattingRule.action)
        .wdtBootstrapSelectPicker();
    $block.find('input.formatting-rule-set-value')
        .val(formattingRule.setVal);

    if (['date', 'int', 'float', 'datetime', 'time'].indexOf(jQuery('#wdt-column-type').val()) !== -1) {
        $block
            .find('select.formatting-rule-if-clause option[value="contains"],select.formatting-rule-if-clause option[value="contains_not"]')
            .remove();
    } else if (['string', 'link', 'email', 'image'].indexOf(jQuery('#wdt-column-type').val()) !== -1) {
        $block
            .find('select.formatting-rule-if-clause option[value="lt"],'
                + 'select.formatting-rule-if-clause option[value="lteq"],'
                + 'select.formatting-rule-if-clause option[value="gteq"],'
                + 'select.formatting-rule-if-clause option[value="gt"]'
            )
            .remove();
    }

    $block.find('select.formatting-rule-action').change(function (e) {
        e.preventDefault();
        e.stopImmediatePropagation();
        if (['setCellColor', 'setRowColor', 'setColumnColor'].indexOf(jQuery(this).val()) !== -1) {
            if (!$block.find('div.wdt-color-picker').length) {
                wdtInputToColorpicker($block.find('input.formatting-rule-set-value'));
            }
        } else if ($block.find('div.wdt-color-picker').length) {
            wdtColorPickerToInput($block.find('input.formatting-rule-set-value'));
        }
    }).change();

    $block.find('select.formatting-rule-if-clause').wdtBootstrapSelectPicker('refresh');
};

/**
 * Helper function to show/hide the colorpicker in conditional formatting block
 */
jQuery(document).on('change', 'div.wdt-conditional-formatting-rules-container select.formatting-rule-action', function (e) {
    e.preventDefault();
    if (jQuery(this).val() == 'setCellColor' || jQuery(this).val() == 'setRowColor' || jQuery(this).val() == 'setColumnColor') {
        jQuery('.wdt-conditional-formatting-rules-container').parent().find('input.formatting-rule-set-value').remove();
    } else {
        var val = jQuery(this).parent().find('input.formatting-rule-set-value').val();
        jQuery(this).parent().find('div.wp-picker-container').replaceWith('<input class="setVal" value="' + val + '" />')
    }
});

WDTColumn.prototype.compileConditionalFormattingRules = function () {
    var column = this;
    var formattingRules = [];
    jQuery('div.wdt-conditional-formatting-rules-container div.wdt-conditional-formatting-rule').each(function () {
        if ((column.type == 'int') || (column.type == 'float')) {
            var cellVal = parseFloat(jQuery(this).find('input.formatting-rule-cell-value').val());
        } else {
            cellVal = jQuery(this).find('input.formatting-rule-cell-value').val().replace('"', "'");
        }
        formattingRules.push({
            ifClause: jQuery(this).find('select.formatting-rule-if-clause').val(),
            cellVal: cellVal,
            action: jQuery(this).find('select.formatting-rule-action').val(),
            setVal: jQuery(this).find('input.formatting-rule-set-value').val()
        });
    });
    this.conditional_formatting = formattingRules;
};

/**
 * Fill in the visible inputs with data
 */
WDTColumn.prototype.fillInputs = function () {
    jQuery('span.wdtColumnOrigHeader').html(this.orig_header);
    jQuery('#wdt-column-display-header').val(this.display_header);
    jQuery('#wdt-column-position').val(this.pos);
    jQuery('#wdt-column-display-text-before').val(this.text_before);
    jQuery('#wdt-column-display-text-after').val(this.text_after);

    if (this.parent_table.responsive) {
        jQuery('div.wdt-columns-responsive-block').show();
        jQuery('#wdt-hide-column-on-mobiles').prop('checked', this.hide_on_mobiles);
        jQuery('#wdt-hide-column-on-tablets').prop('checked', this.hide_on_tablets);
    } else {
        jQuery('div.wdt-columns-responsive-block').hide();
    }

    jQuery('#wdt-column-css-class').val(this.css_class).keyup();
    wpdatatable_config.server_side == 1 ? jQuery('div.wdt-group-column-block').hide() : jQuery('div.wdt-group-column-block').show();
    jQuery('#wdt-group-column').prop('checked', this.groupColumn);
    jQuery('#wdt-column-color').val(this.color).keyup();
    jQuery('#wdt-column-color').siblings('.wpcolorpicker-icon').find('i').css("background", this.color);
    jQuery('#wdt-column-visible').prop('checked', this.visible);
    jQuery('#wdt-column-width').val(this.width);
    jQuery('#wdt-link-target-attribute').prop('checked', this.linkTargetAttribute === '_self' ? 0 : 1);
    jQuery('#wdt-link-nofollow-attribute').prop('checked', this.linkNofollowAttribute).change();
    jQuery('#wdt-link-noreferrer-attribute').prop('checked', this.linkNoreferrerAttribute).change();
    jQuery('#wdt-link-sponsored-attribute').prop('checked', this.linkSponsoredAttribute).change();
    jQuery('#wdt-link-button-attribute').prop('checked', this.linkButtonAttribute).change();
    jQuery('#wdt-link-button-label').val(this.linkButtonLabel);
    jQuery('#wdt-link-button-class').val(this.linkButtonClass);
    jQuery('#wdt-column-enable-global-search').prop('checked', this.globalSearchColumn);

    jQuery('#wdt-column-decimal-places').val('');
    if (this.type == 'formula') {
        jQuery('#wdt-column-type option[value="formula"]').prop('disabled', '');
        jQuery('#wdt-column-type').prop('disabled', 'disabled');
        if (this.decimalPlaces != -1) {
            jQuery('#wdt-column-decimal-places').val(this.decimalPlaces);
        }
    } else {
        jQuery('#wdt-column-type option[value="formula"]').prop('disabled', 'disabled');
        jQuery('#wdt-column-type').prop('disabled', '');
    }
    jQuery('#wdt-column-type').wdtBootstrapSelectPicker('val', this.type).change();
    if (jQuery.inArray(this.type, ['date', 'datetime']) !== -1) {
        jQuery('#wdt-date-input-format').wdtBootstrapSelectPicker('val', this.dateInputFormat);
    }


    jQuery('#wdt-column-values').wdtBootstrapSelectPicker('val', this.possibleValuesType).trigger('change-without-notification');
    jQuery('#wdt-column-values-list').tagsinput('removeAll');
    jQuery('#wdt-column-align-fields').wdtBootstrapSelectPicker('val', this.column_align_fields).change();
    jQuery('#wdt-column-align-header').wdtBootstrapSelectPicker('val', this.column_align_header).change();
    if (this.possibleValuesType == 'list') {
        jQuery('#wdt-column-values-list').tagsinput('add', this.valuesList);
    } else if (this.possibleValuesType == 'foreignkey') {
        jQuery('#wdt-connected-table-name').html(this.foreignKeyRule.tableName);
        jQuery('#wdt-connected-table-show-column').html(this.foreignKeyRule.displayColumnName);
        jQuery('#wdt-connected-table-value-column').html(this.foreignKeyRule.storeColumnName);
        jQuery('div.wdt-foreign-rule-display').show();
    }
    jQuery('#wdt-column-values-add-empty').prop('checked', this.possibleValuesAddEmpty);

    jQuery('#wdt-column-calc-total').prop('checked', this.calculateTotal);
    jQuery('div.wdt-column-calc-total-block #wdt-column-calc-total-shortcode span')
        .html('[wpdatatable_sum table_id=' + wpdatatable_config.id + ' col_id=' + wpdatatable_config.currentOpenColumn.id + ']');
    jQuery('#wdt-column-calc-avg').prop('checked', this.calculateAvg);
    jQuery('div.wdt-column-calc-avg-block #wdt-column-calc-avg-shortcode span')
        .html('[wpdatatable_avg table_id=' + wpdatatable_config.id + ' col_id=' + wpdatatable_config.currentOpenColumn.id + ']');
    jQuery('#wdt-column-calc-min').prop('checked', this.calculateMin);
    jQuery('div.wdt-column-calc-min-block #wdt-column-calc-min-shortcode span')
        .html('[wpdatatable_min table_id=' + wpdatatable_config.id + ' col_id=' + wpdatatable_config.currentOpenColumn.id + ']');
    jQuery('#wdt-column-calc-max').prop('checked', this.calculateMax);
    jQuery('div.wdt-column-calc-max-block #wdt-column-calc-max-shortcode span')
        .html('[wpdatatable_max table_id=' + wpdatatable_config.id + ' col_id=' + wpdatatable_config.currentOpenColumn.id + ']');

    if (jQuery.inArray(this.type, ['int', 'float', 'formula']) !== -1) {
        this.type == 'int' ?
            jQuery('#wdt-column-skip-thousands').prop('checked', this.skip_thousands_separator)
            : this.decimalPlaces != -1 ?
            jQuery('#wdt-column-decimal-places').val(this.decimalPlaces) :
            jQuery('#wdt-column-decimal-places').val('');
    }

    jQuery('#wdt-column-allow-sorting').prop('checked', this.sorting).change();
    jQuery('#wdt-column-default-sort').prop('checked', this.defaultSortingColumn).change();
    if (this.defaultSortingColumn) {
        jQuery('#wdt-column-default-sorting-direction')
            .wdtBootstrapSelectPicker('val', this.defaultSortingColumn);
    }
    let filteringOptionEnabled = this.parent_table.filtering;
    let globalOptionEnabled = this.parent_table.global_search;
    if (!(filteringOptionEnabled || globalOptionEnabled) || this.type == 'formula') {
        jQuery('li.column-filtering-settings-tab').hide();
    } else {
        if(!globalOptionEnabled){
            jQuery('.wdt-global-search-block').addClass('hidden');
        } else {
            jQuery('.wdt-global-search-block ').removeClass('hidden');
        }
        jQuery('#wdt-column-enable-global-search').prop('checked', this.globalSearchColumn).change();
        jQuery('li.column-filtering-settings-tab').removeClass('active').show();
        jQuery('#wdt-column-filter-label').val(this.filterLabel);


        if (this.filter_type != 'none') {


            if (this.filterDefaultValue) {
                if (jQuery.inArray(this.filter_type, ['text', 'number']) != -1) {
                    jQuery('#wdt-filter-default-value').val(this.filterDefaultValue);
                } else if (jQuery.inArray(this.filter_type, ['number-range', 'date-range', 'datetime-range', 'time-range']) != -1) {
                    var filterDefaultValues = this.filterDefaultValue.split('|');
                    jQuery('#wdt-filter-default-value-from').val(filterDefaultValues[0]);
                    jQuery('#wdt-filter-default-value-to').val(filterDefaultValues[1]);
                } else {
                    this.filterDefaultValue = this.filter_type == 'checkbox' ? this.filterDefaultValue.split('|') : this.filterDefaultValue;
                    jQuery('#wdt-filter-default-value-selectpicker').wdtBootstrapSelectPicker('val', this.filterDefaultValue);
                }
            } else {
                jQuery('#wdt-filter-default-value').val('');
                jQuery('#wdt-filter-default-value-from').val('');
                jQuery('#wdt-filter-default-value-to').val('');
                jQuery('#wdt-filter-default-value-selectpicker').wdtBootstrapSelectPicker('val', '');
            }
        } else {

        }
    }

    if ((this.parent_table.editable || this.parent_table.table_type == 'manual') && this.type != 'formula') {
        jQuery('li.column-editing-settings-tab').show();
        jQuery('#wdt-column-editor-input-type').wdtBootstrapSelectPicker('val', this.editor_type).change();
        jQuery('#wdt-column-not-null').prop('checked', this.editingNonEmpty);
        if (this.editingDefaultValue) {
            if (jQuery.inArray(this.editor_type, ['selectbox', 'multi-selectbox']) != -1) {
                this.editingDefaultValue = this.editor_type == 'multi-selectbox' ? this.editingDefaultValue.split('|') : this.editingDefaultValue;
                jQuery('#wdt-editing-default-value-selectpicker').wdtBootstrapSelectPicker('val', this.editingDefaultValue);
            } else {
                jQuery('#wdt-editing-default-value').val(this.editingDefaultValue);
            }
        } else {
            jQuery('#wdt-editing-default-value').val('');
        }
        this.id_column == 1 ? jQuery('.wdt-skip-thousands-separator-block').hide() : '';
    } else {
        jQuery('li.column-editing-settings-tab').hide();
    }
    jQuery('div.wdt-conditional-formatting-rules-container').html('');
    if (this.conditional_formatting) {
        for (var i in this.conditional_formatting) {
            this.renderConditionalFormattingBlock(this.conditional_formatting[i]);
        }
    }

};

/**
 * Open the column settings block on the right, setting all
 * the UI controls to match the object config
 */
WDTColumn.prototype.show = function () {
    jQuery('div.column-settings-panel').fadeInRight();
    jQuery('div.column-settings-overlay').animateFadeIn();
    wpdatatable_config.currentOpenColumn = this;
    this.fillInputs();

    // Set Display tab and content as default one
    jQuery('div.column-settings-panel .tab-nav').find('.active').removeClass('active');
    jQuery('li.column-display-settings-tab').addClass('active');
    jQuery('div.column-settings-panel .tab-content').find('.active').removeClass('active');
    jQuery('div#column-display-settings').addClass('active');

    wpdatatable_config.sorting == 0 || this.type == 'formula' ?
        jQuery('.column-sorting-settings-tab').hide() :
        jQuery('.column-sorting-settings-tab').show();

    wpdatatable_config.global_search == 0 ?
        jQuery('.column-filtering-settings-tab').hide() :
        jQuery('.column-filtering-settings-tab').show();

    jQuery(document).on('keyup.hideCSEsc', function (e) {
        if (e.which == 27) {
            e.preventDefault();
            e.stopImmediatePropagation();
            if (jQuery('.wdt-datatables-admin-wrap div.modal').is(':visible')) {
                jQuery('.wdt-datatables-admin-wrap div.modal').modal('hide');
            } else {
                wpdatatable_config.currentOpenColumn.hide();
            }
        }
    });

    this.is_config_open = true;
};

/**
 * Hide the column settings block
 */
WDTColumn.prototype.hide = function () {
    jQuery('div.column-settings-panel').fadeOutRight();
    jQuery('div.column-settings-overlay').animateFadeOut();
    jQuery(document).off('keyup.hideCSEsc');
    this.is_config_open = false;
    this.parent_table.currentOpenColumn = null;
};

/**
 * Apply changes from UI to the object
 */
WDTColumn.prototype.applyChanges = function () {
    if (!this.is_config_open) {
        return;
    }
    this.type = jQuery('#wdt-column-type').val();
    this.display_header = jQuery('#wdt-column-display-header').val();

    // Reorder columns if columns position is changed
    var oldPos = this.pos;
    this.pos = jQuery('#wdt-column-position').val() > wpdatatable_config.columns.length - 1 ?
        wpdatatable_config.columns.length - 1 : parseInt(jQuery('#wdt-column-position').val());
    if (this.pos < 0) {
        this.pos = 0
    }
    if (oldPos != this.pos) {
        if (oldPos < this.pos) {
            for (var i = 0; i < wpdatatable_config.columns.length; i++) {
                if (i > oldPos && i <= this.pos) {
                    --wpdatatable_config.columns[i].pos;
                }
            }
        } else {
            for (i in wpdatatable_config.columns) {
                if (i >= this.pos && i < oldPos) {
                    ++wpdatatable_config.columns[i].pos;
                }
            }
        }
    }

    this.text_before = jQuery('#wdt-column-display-text-before').val();
    this.text_after = jQuery('#wdt-column-display-text-after').val();
    this.hide_on_mobiles = jQuery('#wdt-hide-column-on-mobiles').is(':checked') ? 1 : 0;
    this.hide_on_tablets = jQuery('#wdt-hide-column-on-tablets').is(':checked') ? 1 : 0;
    this.css_class = jQuery('#wdt-column-css-class').val();
    this.linkTargetAttribute = jQuery('#wdt-link-target-attribute').is(':checked') ? '_blank' : '_self';
    this.linkNofollowAttribute = jQuery('#wdt-link-nofollow-attribute').is(':checked') ? 1 : 0;
    this.linkNoreferrerAttribute = jQuery('#wdt-link-noreferrer-attribute').is(':checked') ? 1 : 0;
    this.linkSponsoredAttribute = jQuery('#wdt-link-sponsored-attribute').is(':checked') ? 1 : 0;
    this.linkButtonAttribute = jQuery('#wdt-link-button-attribute').is(':checked') ? 1 : 0;
    this.linkButtonLabel = jQuery('#wdt-link-button-label').val();
    this.linkButtonClass = jQuery('#wdt-link-button-class').val();

    // If group is checked ungroup all other columns
    if (jQuery('#wdt-group-column').is(':checked')) {
        for (i in wpdatatable_config.columns) {
            wpdatatable_config.columns[i].groupColumn =
                wpdatatable_config.columns[i].orig_header != this.orig_header ? 0 : 1;
        }
    } else {
        this.groupColumn = 0;
    }

    this.color = jQuery('#wdt-column-color').val();
    this.visible = jQuery('#wdt-column-visible').is(':checked') ? 1 : 0;
    let tempColumnWidth = jQuery('#wdt-column-width').val();
    this.width = tempColumnWidth.indexOf('px') != -1 ? tempColumnWidth.replace('px','') : tempColumnWidth;
    this.decimalPlaces = ((this.type == 'float' || this.type == 'formula') && jQuery('#wdt-column-decimal-places').val() != '') ?
        jQuery('#wdt-column-decimal-places').val() : -1;
    if (jQuery.inArray(this.type, ['date', 'datetime']) !== -1) {
        this.dateInputFormat = jQuery('#wdt-date-input-format').wdtBootstrapSelectPicker('val');
    }
    this.possibleValuesType = jQuery('#wdt-column-values').val();
    if (this.possibleValuesType == 'list') {
        this.valuesList = jQuery('#wdt-column-values-list').val().replace(/,/g, '|');
    }
    this.possibleValuesAddEmpty = jQuery('#wdt-column-values-add-empty').is(':checked') ? 1 : 0;
    this.column_align_header = jQuery('#wdt-column-align-header').val();
    this.column_align_fields = jQuery('#wdt-column-align-fields').val();
    this.calculateTotal = (jQuery('#wdt-column-calc-total').is(':checked') && (this.type == 'int' || this.type == 'float' || this.type == 'formula')) ? 1 : 0;
    this.calculateAvg = (jQuery('#wdt-column-calc-avg').is(':checked') && (this.type == 'int' || this.type == 'float' || this.type == 'formula')) ? 1 : 0;
    this.calculateMax = (jQuery('#wdt-column-calc-max').is(':checked') && (this.type == 'int' || this.type == 'float' || this.type == 'formula')) ? 1 : 0;
    this.calculateMin = (jQuery('#wdt-column-calc-min').is(':checked') && (this.type == 'int' || this.type == 'float' || this.type == 'formula')) ? 1 : 0;
    this.skip_thousands_separator = jQuery('#wdt-column-skip-thousands').is(':checked') ? 1 : 0;
    this.sorting = jQuery('#wdt-column-allow-sorting').is(':checked') ? 1 : 0;
    this.defaultSortingColumn = jQuery('#wdt-column-default-sort').is(':checked') ? 1 : 0;

    // If default sort column is checked remove default sort column for all other columns
    if (jQuery('#wdt-column-default-sort').is(':checked')) {
        for (i in wpdatatable_config.columns) {
            wpdatatable_config.columns[i].defaultSortingColumn =
                wpdatatable_config.columns[i].orig_header != this.orig_header ? 0 : 1;
        }
        this.defaultSortingColumn = jQuery('#wdt-column-default-sorting-direction').val() == 1 ? 1 : 2;
    } else {
        this.defaultSortingColumn = 0;
    }

    this.filter_type = jQuery('#wdt-column-enable-filter').is(':checked') ?
        jQuery('#wdt-column-filter-type').val() :
        'none';
    this.exactFiltering = jQuery('#wdt-column-exact-filtering').is(':checked') ? 1 : 0;
    this.filterLabel = jQuery('#wdt-column-filter-label').val();
    this.globalSearchColumn = jQuery('#wdt-column-enable-global-search').is(':checked') ? 1 : 0;

    if (jQuery.inArray(this.filter_type, ['text', 'number']) != -1) {
        this.filterDefaultValue = jQuery('#wdt-filter-default-value').val();
    } else if (jQuery.inArray(this.filter_type, ['number-range', 'date-range', 'datetime-range', 'time-range']) != -1) {
        this.filterDefaultValue = jQuery('#wdt-filter-default-value-from').val() + '|' + jQuery('#wdt-filter-default-value-to').val();
    } else {
        this.filterDefaultValue = jQuery.isArray(jQuery('#wdt-filter-default-value-selectpicker').wdtBootstrapSelectPicker('val')) ?
            jQuery('#wdt-filter-default-value-selectpicker').wdtBootstrapSelectPicker('val').join('|') :
            jQuery('#wdt-filter-default-value-selectpicker').wdtBootstrapSelectPicker('val');
    }

    this.editor_type = jQuery('#wdt-column-editor-input-type').val();
    this.editingNonEmpty = jQuery('#wdt-column-not-null').is(':checked') ? 1 : 0;

    if (jQuery.inArray(this.editor_type, ['selectbox', 'multi-selectbox']) != -1) {
        this.editingDefaultValue = jQuery.isArray(jQuery('#wdt-editing-default-value-selectpicker').wdtBootstrapSelectPicker('val')) ?
            jQuery('#wdt-editing-default-value-selectpicker').wdtBootstrapSelectPicker('val').join('|') :
            jQuery('#wdt-editing-default-value-selectpicker').wdtBootstrapSelectPicker('val');
    } else {
        this.editingDefaultValue = jQuery('#wdt-editing-default-value').val();
    }
    this.compileConditionalFormattingRules();

    this.hide();
};

/**
 * Return all settings in an object format
 * @return {} column config
 */
WDTColumn.prototype.getJSON = function () {
    return {
        calculateAvg: this.calculateAvg,
        calculateMax: this.calculateMax,
        calculateMin: this.calculateMin,
        calculateTotal: this.calculateTotal,
        color: this.color,
        conditional_formatting: this.conditional_formatting,
        css_class: this.css_class,
        dateInputFormat: this.dateInputFormat,
        decimalPlaces: this.decimalPlaces,
        defaultSortingColumn: this.defaultSortingColumn,
        defaultValueValues: this.defaultValueValues,
        display_header: this.display_header,
        editingDefaultValue: this.editingDefaultValue,
        editingNonEmpty: this.editingNonEmpty,
        editor_type: this.editor_type,
        exactFiltering: this.exactFiltering,
        filter_type: this.filter_type,
        filterDefaultValue: this.filterDefaultValue,
        filtering: this.filtering,
        globalSearchColumn: this.globalSearchColumn,
        filterLabel: this.filterLabel,
        foreignKeyRule: this.foreignKeyRule,
        formula: this.formula,
        groupColumn: this.groupColumn,
        hide_on_mobiles: this.hide_on_mobiles,
        hide_on_tablets: this.hide_on_tablets,
        id: this.id,
        id_column: this.id_column,
        linkTargetAttribute: this.linkTargetAttribute,
        linkNofollowAttribute: this.linkNofollowAttribute,
        linkNoreferrerAttribute: this.linkNoreferrerAttribute,
        linkSponsoredAttribute: this.linkSponsoredAttribute,
        linkButtonAttribute: this.linkButtonAttribute,
        linkButtonLabel: this.linkButtonLabel,
        linkButtonClass: this.linkButtonClass,
        orig_header: this.orig_header,
        pos: this.pos,
        possibleValuesAddEmpty: this.possibleValuesAddEmpty,
        possibleValuesType: this.possibleValuesType,
        column_align_header: this.column_align_header,
        column_align_fields: this.column_align_fields,
        skip_thousands_separator: this.skip_thousands_separator,
        sorting: this.sorting,
        text_after: this.text_after,
        text_before: this.text_before,
        type: this.type,
        valuesList: this.valuesList,
        visible: this.visible,
        width: this.width
    }
};

/**
 * Renders a small block for this column in the list (in the columns quickaccess modal, and in the formula editor)
 */
WDTColumn.prototype.renderSmallColumnBlock = function (columnIndex) {
    var columnHtml = jQuery('#wdt-column-small-block').html();

    // Adding to the columns quickaccess modal
    var $columnBlock = jQuery(columnHtml).appendTo('#wdt-columns-list-modal div.wdt-columns-container');
    this.display_header != null ?
        $columnBlock.find('div.fg-line input').val(this.display_header) :
        $columnBlock.find('div.fg-line input').val(this.orig_header);
    $columnBlock.attr('data-orig_header', this.orig_header);
    var column = this;
    $columnBlock.find('i.toggle-visibility').click(function (e) {
        e.preventDefault();
        if (!column.visible) {
            column.visible = 1;
            jQuery(this)
                .removeClass('inactive')
        } else {
            column.visible = 0;
            jQuery(this)
                .addClass('inactive')
        }
    });
    if (!column.visible) {
        $columnBlock.find('i.toggle-visibility')
            .addClass('inactive')
    }

    $columnBlock.find('i.wdt-toggle-show-on-mobile').click(function (e) {
        e.preventDefault();
        WDTColumn.prototype.getPremiumPopover(e)
    });

    $columnBlock.find('i.wdt-toggle-show-on-mobile').click(function (e) {
        e.preventDefault();
        if (column.hide_on_mobiles) {
            column.hide_on_mobiles = 0;
            jQuery(this)
                .removeClass('inactive')
        } else {
            column.hide_on_mobiles = 1;
            jQuery(this)
                .addClass('inactive')
        }
    });

    $columnBlock.find('i.wdt-toggle-show-on-tablet').click(function (e) {
        e.preventDefault();
        if (column.hide_on_tablets) {
            column.hide_on_tablets = 0;
            jQuery(this)
                .removeClass('inactive')
        } else {
            column.hide_on_tablets = 1;
            jQuery(this)
                .addClass('inactive')
        }
    });

    if (column.hide_on_mobiles) {
        $columnBlock.find('i.wdt-toggle-show-on-mobile')
            .addClass('inactive')
    }

    $columnBlock.find('i.wdt-toggle-show-on-tablet').click(function (e) {
        e.preventDefault();
        WDTColumn.prototype.getPremiumPopover(e)
    });

    if (column.hide_on_tablets) {
        $columnBlock.find('i.wdt-toggle-show-on-tablet')
            .addClass('inactive')
    }

    /**
     *    Show/hide filters in List of the columns in the data source with quickaccess tools.
     */

    $columnBlock.find('i.wdt-toggle-show-filters').click(function (e) {
        e.preventDefault();
        WDTColumn.prototype.getPremiumPopover(e)
    });


    /**
     *   Show/hide sorting in List of the columns in the data source with quickaccess tools.
     */

    $columnBlock.find('i.wdt-toggle-show-sorting').click(function (e) {
        e.preventDefault();
        if (!column.sorting) {
            column.sorting = 1;
            jQuery(this)
                .removeClass('inactive')
        } else {
            column.sorting = 0;
            jQuery(this)
                .addClass('inactive')

        }
    });

    if (!column.sorting) {
        $columnBlock.find('i.wdt-toggle-show-sorting')
            .addClass('inactive')
    }

    /**
     * Enable/disable global search for a column
     */
    $columnBlock.find('i.wdt-toggle-global-search').click(function (e) {
        e.preventDefault();
        if(column.globalSearchColumn) {
            column.globalSearchColumn = 0;
            jQuery(this)
                .addClass('inactive');
        } else {
            column.globalSearchColumn = 1;
            jQuery(this)
                .removeClass('inactive');
        }
    });

    if(!column.globalSearchColumn) {
        $columnBlock.find('i.wdt-toggle-global-search')
            .addClass('inactive');
    }

    /**
     * Open column settings on wrench click
     */
    $columnBlock.find('i.open-settings').click(function (e) {
        e.preventDefault();
        jQuery('#wdt-columns-list-modal').modal('hide');
        wpdatatable_config.showColumn(columnIndex);
    });

    // Adding to the formula editor
    if (this.type == 'int' || this.type == 'float') {
        $columnBlock = jQuery(columnHtml).appendTo('#wdt-formula-editor-modal div.formula-columns-container');
        $columnBlock.find('div.fg-line input').replaceWith('<span>' + this.display_header + '</span>');
        $columnBlock.attr('data-orig_header', this.orig_header);
        $columnBlock.find('i.column-control').remove();
    }

};

/**
 * Populate Column For Editing And User Selectpicker
 */
WDTColumn.prototype.populateColumnForEditing = function () {
    var $selecter = jQuery('#editing-settings #wdt-id-editing-column');

    jQuery('<option value="' + this.id + '">' + this.orig_header + '</option>')
        .appendTo($selecter);

    if (this.id_column) {
        $selecter.wdtBootstrapSelectPicker('val', this.id);
        wpdatatable_config.id_editing_column = true;
    }
};

/**
 * Populate User ID Column Selectpicker
 */
WDTColumn.prototype.populateUserIdColumn = function () {
    var $selecter = jQuery('#editing-settings #wdt-user-id-column');

    jQuery('<option value="' + this.id + '">' + this.orig_header + '</option>').appendTo($selecter);
};

WDTColumn.prototype.getPremiumPopover = function (e) {
    e.preventDefault();
    jQuery('[data-toggle="html-input-premium-popover"]').wdtBootstrapPopover('destroy').wdtBootstrapPopover({
        html: true,
        template: '<div class="popover wdt-premium-popover" role="tooltip">' +
            '<div class="arrow"></div>' +
            '<h3 class="popover-header">' +
            '<i class="wpdt-icon-star-full m-r-5" style="color: #FFC078;"></i>' +
            (wdtWpDataTablesPopoverStrings.title ? wdtWpDataTablesPopoverStrings.title : 'This is a premium feature') +
            '<button type="button" class="closePopover">' +
            '<span aria-hidden="true"><i class="wpdt-icon-times-full"></i></span></button></h3>' +
            '<div class="popover-body"><span>' + (wdtWpDataTablesPopoverStrings.description ? wdtWpDataTablesPopoverStrings.description : 'This feature is available only in premium version of wpDataTables') + '</span> ' +
            '<div class="popover-footer"><a id="wdt-premium-compare-link">' + (wdtWpDataTablesPopoverStrings.compare_link ? wdtWpDataTablesPopoverStrings.compare_link : 'Compare and View Pricing') + '</a></div></div' +
            '</div>',
        content: function () {
            var content = jQuery(this).attr("data-popover-content");
            return jQuery(content).children(".popover-body").html();
        },
        title: function () {
            var title = jQuery(this).attr("data-popover-content");
            return jQuery(title).children(".popover-heading").html();
        }
    }).on('shown.bs.popover', function () {
        var $popup = jQuery(this);
        jQuery(this).next('.popover').find('button.closePopover').click(function (e) {
            $popup.wdtBootstrapPopover('hide');
        });
        jQuery('#wdt-premium-compare-link').click(function () {
            jQuery(location).attr('href', wdtWpDataTablesPage.liteVSPremiumUrl);
        });
    })
};