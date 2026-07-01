/**
 * wpDataTable config object
 *
 * Contains all the settings for the table and columns.
 * setter methods adjust the binded jQuery elements
 *
 * @author Alexander Gilmanov
 * @since 15.11.2016
 */
var wpdatatable_config = {
    id: null,
    title: 'New wpDataTable',
    show_title: 1,
    table_description: '',
    show_table_description: false,
    tools: 1,
    responsive: 1,
    responsiveAction: 'icon',
    hide_before_load: 1,
    fixed_layout: 0,
    scrollable: 0,
    verticalScroll: 0,
    sorting: 1,
    word_wrap: 0,
    table_type: '',
    file_location: 'wp_media_lib',
    server_side: 1,
    auto_refresh: 0,
    content: '',
    info_block: 1,
    pagination: 1,
    paginationAlign: 'right',
    paginationLayout: 'full_numbers',
    paginationLayoutMobile: 'simple',
    simpleResponsive: 0,
    simpleHeader: 0,
    stripeTable: 0,
    cellPadding: 10,
    removeBorders: 0,
    borderCollapse: 'collapse',
    borderSpacing: 0,
    verticalScrollHeight: 600,
    filtering: 1,
    global_search: 1,
    cache_source_data: 0,
    auto_update_cache: 0,
    editable: 0,
    popover_tools: 0,
    mysql_table_name: '',
    edit_only_own_rows: 0,
    userid_column_id: null,
    inline_editing: 0,
    filtering_form: 0,
    clearFilters: 0,
    display_length: 10,
    showRowsPerPage: true,
    id_editing_column: false,
    editor_roles: null,
    table_html: '',
    dataTable: null,
    datatable_config: null,
    tabletools_config: {print: 1, copy: 1, excel: 1, csv: 1, pdf: 0},
    pdfPaperSize: 'A4',
    pdfPageOrientation: 'portrait',
    showTableToolsIncludeHTML: 0,
    showTableToolsIncludeTitle: 0,
    columns: [],
    columns_by_headers: {},
    currentOpenColumn: null,
    var1: '',
    var2: '',
    var3: '',
    currentUserIdPlaceholder: jQuery('#wdt-user-id-placeholder').val(),
    currentUserLoginPlaceholder: jQuery('#wdt-user-login-placeholder').val(),
    currentPostIdPlaceholder: '',
    wpdbPlaceholder: jQuery('#wdt-wpdb-placeholder').val(),
    table_wcag: 0,
    simple_template_id: 0,
    pagination_top: 0,
    /**
     * Method to set the data source type - hides all dependent controls
     * @param type mysql, google_spreadsheet, xml, json, serialized, csv, excel
     */
    setTableType: function (type) {
        wpdatatable_config.table_type = type;
        jQuery('#wdt-input-url').val('');
        switch (type) {
            case 'mysql':
                if (wpdatatable_config.content.length > 5 && !jQuery('.placeholders-settings-tab').is(':visible')) {
                    jQuery('.placeholders-settings-tab').animateFadeIn();
                }
                if (jQuery('.wdt-table-settings .mysql-settings-block').hasClass('hidden')) {
                    jQuery('.wdt-table-settings .input-path-block').addClass('hidden');
                }
                jQuery('.wdt-table-settings .wdt-file-location').addClass('hidden');
                jQuery('.wdt-table-settings .wdt-input-data-source-type').removeClass('col-sm-4').addClass('col-sm-6');
                jQuery('.wdt-table-settings .input-path-block').removeClass('col-sm-4').addClass('col-sm-6');
                break;
            case 'manual':
                wpdatatable_config.setServerSide(1);
                jQuery('.wdt-input-data-source-type').hide();
                break;
            case 'google_spreadsheet':
                jQuery('.wdt-table-settings .input-path-block').addClass('hidden');
                break;
            case 'csv':
            case 'xls':
            case 'xml':
            case 'json':
            case 'serialized':
                jQuery('.placeholders-settings-tab').animateFadeIn();
                jQuery('.wdt-table-settings #wdt-browse-button').removeClass('hidden');
                jQuery('.wdt-table-settings #wdt-get-nested-json-roots').addClass('hidden');
                if (jQuery('.wdt-table-settings .input-path-block').hasClass('hidden')) {
                    jQuery('.wdt-table-settings .input-path-block').animateFadeIn();
                }
                jQuery('.wdt-table-settings .input-nested-json-url-block').addClass('hidden');
                jQuery('.wdt-table-settings .mysql-settings-block').addClass('hidden');
                jQuery('.wdt-table-settings .wdt-auto-refresh').addClass('hidden');
                wpdatatable_config.setServerSide(0);
                jQuery('.wdt-table-settings #wdt-nested-json-block').addClass('hidden');
                jQuery('.wdt-table-settings #wdt-nested-json-additional-block').addClass('hidden');
                if (jQuery.inArray(type, ['google_spreadsheet', 'xml', 'json','nested_json', 'serialized']) != -1)
                    jQuery('.wdt-table-settings #wdt-browse-button').addClass('hidden');
                if (jQuery.inArray(type, ['csv', 'xls']) != -1 ){
                    wpdatatable_config.setFileLocation('wp_media_lib');
                    jQuery('.wdt-table-settings .wdt-file-location').removeClass('hidden');
                    jQuery('.wdt-table-settings .wdt-input-data-source-type').removeClass('col-sm-6').addClass('col-sm-4');
                    jQuery('.wdt-table-settings .input-path-block').removeClass('col-sm-6').addClass('col-sm-4');
                } else {
                    jQuery('.wdt-table-settings .wdt-file-location').addClass('hidden');
                    jQuery('.wdt-table-settings .wdt-input-data-source-type').removeClass('col-sm-4').addClass('col-sm-6');
                    jQuery('.wdt-table-settings .input-path-block').removeClass('col-sm-4').addClass('col-sm-6');
                }
                break;
            case 'nested_json':
                jQuery('.placeholders-settings-tab').animateFadeIn();
                jQuery('.wdt-table-settings .input-path-block').addClass('hidden');
                if( jQuery('.wdt-table-settings .input-nested-json-url-block').hasClass('hidden') ) {
                    jQuery('.wdt-table-settings .input-nested-json-url-block').animateFadeIn();
                }
                jQuery('.wdt-table-settings #wdt-browse-button').addClass('hidden');
                jQuery('.wdt-table-settings .mysql-settings-block').addClass('hidden');
                jQuery('.wdt-table-settings .wdt-server-side-processing').addClass('hidden');
                jQuery('.wdt-table-settings .wdt-auto-refresh').addClass('hidden');
                jQuery('.wdt-table-settings #wdt-nested-json-block').removeClass('hidden');
                jQuery('.wdt-table-settings #wdt-nested-json-additional-block').removeClass('hidden');
                jQuery('.wdt-table-settings #wdt-get-nested-json-roots').removeClass('hidden');
                wpdatatable_config.setServerSide( 0 );
                jQuery('.wdt-table-settings .wdt-input-data-source-type').removeClass('col-sm-4').addClass('col-sm-6');
                jQuery('.wdt-table-settings .input-path-block').removeClass('col-sm-4').addClass('col-sm-6');
                jQuery('.wdt-table-settings .wdt-file-location').addClass('hidden');
                break;
            default:
                jQuery('.wdt-table-settings .input-path-block').addClass('hidden');
                jQuery('.wdt-table-settings .input-nested-json-url-block').addClass('hidden');
                jQuery('.wdt-table-settings .mysql-settings-block').addClass('hidden');
                jQuery('.wdt-table-settings .wdt-auto-refresh').addClass('hidden');
                jQuery('.wdt-table-settings .cache-settings-block').addClass('hidden');
                jQuery('.wdt-table-settings .auto-update-cache-block').addClass('hidden');
                jQuery('.wdt-table-settings #wdt-get-nested-json-roots').addClass('hidden');
                jQuery('.wdt-table-settings #wdt-nested-json-block').addClass('hidden');
                jQuery('.wdt-table-settings #wdt-nested-json-additional-block').addClass('hidden');
                jQuery('.wdt-table-settings .wdt-file-location').addClass('hidden');
                break;
        }
        jQuery('#wdt-table-type').val(type).wdtBootstrapSelectPicker('refresh');
    },
    setFileLocation: function( fileLocation ){
        wpdatatable_config.file_location = fileLocation;
        switch( fileLocation ){
            case 'wp_media_lib':
                jQuery('#wdt-browse-button').removeClass('hidden');
                jQuery('#wdt-input-url').closest('.col-sm-9').css('cssText', 'width: 75% !important');
                jQuery('#wdt-input-url').val('');
                break;
            case 'wp_any_url':
                jQuery('#wdt-browse-button').addClass('hidden');
                jQuery('#wdt-input-url').closest('.col-sm-9').css('cssText', 'width: 100% !important');
                jQuery('#wdt-input-url').val('');
                break;
        }
        jQuery('#wdt-file-location').val( fileLocation ).wdtBootstrapSelectPicker('refresh');
    },
    renderCustomHeadersRow: function (row){
        var custom_headers_row = jQuery('#wdt-nested-json-custom-headers-template').html();
        var $block = jQuery(custom_headers_row)
            .appendTo('div.wdt-nested-json-custom-headers-container');
        $block.find('input.custom-header-key-name-value')
            .val(row.setKeyName);

        $block.find('textarea.custom-header-key-value-value')
            .val(row.setKeyValue);
    },
    /**
     * Method to compile custom headers row data
     */
    compileCustomHeadersRow: function () {
        var customHeadersRowRule = [];
        jQuery('div.wdt-nested-json-custom-headers-container div.wdt-custom-headers-row-rule').each(function () {
            let keyNameValue = jQuery(this).find('input.custom-header-key-name-value').val(),
                keyValueValue = jQuery(this).find('textarea.custom-header-key-value-value').val()
            if (keyNameValue !== '' && keyValueValue !== ''){
                customHeadersRowRule.push({
                    setKeyName: keyNameValue,
                    setKeyValue: keyValueValue
                });
            }
        });
        return customHeadersRowRule;
    },
    /**
     * Method to set ID for new tables
     * Shows the label with the shortcode if hiddem
     */
    setId: function (id) {
        wpdatatable_config.id = id;
        jQuery('#wdt-table-id').html(
            ' <a class="wdt-copy-shortcode" data-toggle="tooltip" data-shortcode-type="table" data-placement="top" title="Click to copy shortcode">' +
            '            <i class="wpdt-icon-copy"></i>' +
            '        </a>' +
            '        <span id="wdt-table-shortcode-id">[wpdatatable id=' + id + ']</span>');
        if (jQuery('#wdt-table-id').is(':hidden')) {
            jQuery('#wdt-table-id').animateFadeIn();
        }
    },
    /**
     * Method to set the table title
     */
    setTitle: function (title) {
        wpdatatable_config.title = title;
        jQuery('#wdt-table-title-edit').val(title);
    },
    setDescription: function( description ){
        wpdatatable_config.table_description = description;
        jQuery( '#wdt-table-description-edit' ).val( description );
    },
    /**
     * Method to enable or disable the server side processing
     * Shows or hides the auto-refresh input
     * @param serverSide 1 or 0
     */
    setServerSide: function (serverSide) {
        wpdatatable_config.server_side = serverSide;
        if (serverSide == 1) {
            jQuery('.wdt-table-settings .wdt-auto-refresh').animateFadeIn();
        } else {
            wpdatatable_config.setEditable(0);
            jQuery('.wdt-table-settings .wdt-auto-refresh').addClass('hidden');
        }
        jQuery('#wdt-server-side').prop('checked', serverSide);
    },
    /**
     * Defines the auto-refresh period
     * @param autoRefresh
     */
    setAutoRefresh: function (autoRefresh) {
        wpdatatable_config.auto_refresh = autoRefresh;
        if (jQuery('#wdt-auto-refresh').val() != wpdatatable_config.auto_refresh) {
            jQuery('#wdt-auto-refresh').val(wpdatatable_config.auto_refresh);
        }
    },
    /**
     * Sets the content of the table
     * @param content string with MySQL query for MySQL-based tables, or path/URL to other types of tables
     */
    setContent: function (content) {
        wpdatatable_config.content = content;
        if ((content != '') && (content.length > 5)) {
            if (wpdatatable_config.table_type == 'google_spreadsheet') {
                return false;
            }

            // TODO - validate content
            if (!jQuery('.display-settings-tab').is(':visible')) {
                jQuery('.display-settings-tab').animateFadeIn();
                jQuery('.table-sorting-filtering-settings-tab').animateFadeIn();
                jQuery('.table-tools-settings-tab').animateFadeIn();
                jQuery('.customize-table-settings-tab').animateFadeIn();
                jQuery('.advanced-table-settings-tab').animateFadeIn();
            }
            if (wpdatatable_config.table_type == 'mysql') {
                if (!jQuery('.placeholders-settings-tab').is(':visible')) {
                    jQuery('.placeholders-settings-tab').animateFadeIn();
                }
                var aceEditor = ace.edit('wdt-mysql-query');
                aceEditor.$blockScrolling = Infinity;
                if (aceEditor.getValue() != content) {
                    aceEditor.setValue(content);
                }
            } else {
                wpdatatable_config.table_type == 'manual' ?
                    !jQuery('.editing-settings-tab').is(':visible') ? jQuery('.editing-settings-tab').animateFadeIn() : null :
                    jQuery('.editing-settings-tab').addClass('hidden');
                jQuery('#wdt-input-url').val(content);
            }
            jQuery('button.wdt-apply').prop('disabled', '');
        } else {
            jQuery('.display-settings-tab').addClass('hidden');
            jQuery('.table-sorting-filtering-settings-tab').addClass('hidden');
            jQuery('.table-tools-settings-tab').addClass('hidden');
            jQuery('.customize-table-settings-tab').addClass('hidden');
            jQuery('.editing-settings-tab').addClass('hidden');
            jQuery('.placeholders-settings-tab').addClass('hidden');
            jQuery('button.wdt-apply').prop('disabled', 'disabled');
        }
        if (wpdatatable_config.table_type == 'nested_json' && content != '' ) {
            let jsonParams = JSON.parse(content)
            jQuery('#wdt-nested-json-url').val(jsonParams.url);
            jQuery('#wdt-nested-json-get-type').val(jsonParams.method).wdtBootstrapSelectPicker('refresh');
            jQuery('#wdt-nested-json-auth-option').val(jsonParams.authOption).wdtBootstrapSelectPicker('refresh');
            jQuery('.wdt-table-settings .nested-json-basic-auth-inputs').addClass('hidden');
            if (jsonParams.authOption != '') {
                jQuery('#wdt-nested-json-username').val(jsonParams.username);
                jQuery('#wdt-nested-json-password').val(jsonParams.password);
                jQuery('.wdt-table-settings .nested-json-basic-auth-inputs').removeClass('hidden');
            }
            if (jsonParams.customHeaders.length != 0){
                jQuery('div.wdt-nested-json-custom-headers-container').html('');
                for (var i in jsonParams.customHeaders) {
                    wpdatatable_config.renderCustomHeadersRow(jsonParams.customHeaders[i]);
                }
                let customHeaderFirstRow = jQuery('div.wdt-nested-json-custom-headers-container .wdt-custom-headers-row-rule:first-child');
                jQuery(customHeaderFirstRow).find('.wdt-delete-custom-headers-wrapper').remove();
                jQuery(customHeaderFirstRow).find('.wdt-custom-header-key-value').removeClass('col-sm-5-3 p-r-0').addClass('col-sm-6');
            }

            if (typeof jsonParams.root !== 'undefined'){
                jQuery('.wdt-table-settings .nested-json-roots').removeClass('hidden');
                let option = '<option value="' + jsonParams.root + '">' + jsonParams.root + '</option>';
                jQuery('.wdt-table-settings #wdt-nested-json-root').html(option).wdtBootstrapSelectPicker('refresh');
                jQuery('#wdt-nested-json-root').val(jsonParams.root).wdtBootstrapSelectPicker('refresh');
            }
        }
    },
    /**
     * Set the show / hide title
     * @param show_title 1 or 0
     */
    setShowTitle: function (show_title) {
        wpdatatable_config.show_title = show_title;
        jQuery('#wdt-show-title').prop('checked', show_title);
    },
    /**
     * Set the show / hide description
     * @param show_description 1 or 0
     */
    setShowDescription: function( show_description ){
        wpdatatable_config.show_table_description = show_description;
        jQuery('#wdt-show-description').prop( 'checked', show_description );
    },
    setWCAG: function (tableWCAG) {
        wpdatatable_config.table_wcag = tableWCAG;
        jQuery('#wdt-wcag').prop('checked', tableWCAG);
    },
    /**
     * Set the table tools
     * @param show_tabletools 1 or 0
     * @param table_tools
     */
    setShowTableTools: function (show_tabletools, table_tools) {
        wpdatatable_config.tools = show_tabletools;
        if (show_tabletools == 1) {
            jQuery('.wdt-table-settings .table-tools-settings-block').animateFadeIn();
            jQuery('.wdt-table-settings .table-tools-include-html-block').animateFadeIn();
            jQuery('.wdt-table-settings .table-tools-include-title-block').animateFadeIn();
            jQuery.isEmptyObject(table_tools) ?
                wpdatatable_config.setTableToolsConfig({print: 1, copy: 1, excel: 1, csv: 1, pdf: 0}) :
                wpdatatable_config.setTableToolsConfig(table_tools);
            wpdatatable_config.setTableToolsIncludeHTML(0);
            wpdatatable_config.setTableToolsIncludeTitle( 0 );
            // Show/hide PDF export options
            if (typeof wpdatatable_config.tabletools_config.pdf !== "undefined" && wpdatatable_config.tabletools_config.pdf == 1) {
                jQuery('div.pdf-export-options').animateFadeIn();
            } else {
                jQuery('div.pdf-export-options').animateFadeOut();
            }
        } else {
            jQuery('.wdt-table-settings .table-tools-settings-block').addClass('hidden');
            jQuery('.wdt-table-settings .table-tools-include-html-block').addClass('hidden');
            jQuery('.wdt-table-settings .table-tools-include-title-block').addClass('hidden');
            jQuery('div.pdf-export-options').animateFadeOut();
            wpdatatable_config.setTableToolsConfig({})
            wpdatatable_config.setTableToolsIncludeHTML(0);
            wpdatatable_config.setTableToolsIncludeTitle( 0 );
            wpdatatable_config.setPdfPaperSize('A4')
            wpdatatable_config.setPdfPageOrientation('portrait')
        }
        jQuery('#wdt-table-tools').prop('checked', show_tabletools);
    },
    /**
     * Enable or disable table tools include HTML
     * @param showTableToolsIncludeHTML 1 or 0
     +*/
    setTableToolsIncludeHTML: function (showTableToolsIncludeHTML) {
        wpdatatable_config.showTableToolsIncludeHTML = showTableToolsIncludeHTML;
        jQuery('#wdt-table-tools-include-html').prop('checked', showTableToolsIncludeHTML);
    },
    /**
     * Enable or disable table tools include table title
     * @param showTableToolsIncludeTitle 1 or 0
     */
    setTableToolsIncludeTitle: function( showTableToolsIncludeTitle ){
        wpdatatable_config.showTableToolsIncludeTitle = showTableToolsIncludeTitle;
        jQuery('#wdt-table-tools-include-title').prop( 'checked', showTableToolsIncludeTitle );
    },
    /**
     * Enable or disable pagination on top of the table
     * @param paginationTop 1 or 0
     */
    setPaginationOnTop: function (paginationTop) {
        wpdatatable_config.pagination_top = paginationTop;
        jQuery('#wdt-pagination-top').prop('checked', paginationTop);
    },
    /**
     * Enable or disable responsiveness
     * @param responsive 1 or 0
     */
    setResponsive: function (responsive) {
        wpdatatable_config.responsive = responsive;
        jQuery('#wdt-responsive').prop('checked', responsive);

        if (responsive === 1) {
            jQuery('.responsive-action-block').removeClass('hidden');
        } else {
            jQuery('.responsive-action-block').addClass('hidden');
            wpdatatable_config.setResponsiveAction('icon');
        }
    },
    /**
     * Set responsive action
     * @param responsiveAction string
     */
    setResponsiveAction: function (responsiveAction) {
        wpdatatable_config.responsiveAction = responsiveAction;
        jQuery('#wdt-responsive-action')
            .val(responsiveAction)
            .wdtBootstrapSelectPicker('refresh');
    },
    /**
     * Enable or disable scrollable feature
     * @param scrollable 1 or 0
     */
    setScrollable: function (scrollable) {
        wpdatatable_config.scrollable = scrollable;
        if (scrollable == 1) {
            wpdatatable_config.setLimitLayout(0);
            jQuery('.limit-table-width-settings-block').addClass('hidden');
        } else {
            !jQuery('.limit-table-width-settings-block').is(':visible') ? jQuery('.limit-table-width-settings-block').animateFadeIn() : null;
        }
        jQuery('#wdt-scrollable').prop('checked', scrollable);
    },
    /**
     * Enable or disable vertical scroll feature
     * @param verticalScroll 1 or 0
     */
    setVerticalScroll: function (verticalScroll) {
        wpdatatable_config.verticalScroll = verticalScroll;
        if (verticalScroll == 1) {
            jQuery('.vertical-scroll-height-block').animateFadeIn();
        } else {
            wpdatatable_config.setVerticalScrollHeight(600);
            jQuery('.vertical-scroll-height-block').animateFadeOut();
        }
        jQuery('#wdt-vertical-scroll').prop('checked', verticalScroll);
    },
    /**
     * Enable or disable hiding before load
     * @param hideBeforeLoad 1 or 0
     */
    setHideBeforeLoad: function (hideBeforeLoad) {
        wpdatatable_config.hide_before_load = hideBeforeLoad;
        jQuery('#wdt-hide-until-loaded').prop('checked', hideBeforeLoad);
    },
    /**
     * Enable or disable limit table layout
     * @param limitLayout 1 or 0
     */
    setLimitLayout: function (limitLayout) {
        wpdatatable_config.fixed_layout = limitLayout;
        if (limitLayout == 1) {
            wpdatatable_config.setScrollable(0);
            jQuery('.word-wrap-settings-block').animateFadeIn();
            jQuery('.wdt-scrollable-block').addClass('hidden');
            jQuery('.wdt-column-width-block').show();
        } else {
            wpdatatable_config.setWordWrap(0);
            jQuery('.word-wrap-settings-block').addClass('hidden');
            !jQuery('.wdt-scrollable-block').is(':visible') ? jQuery('.wdt-scrollable-block').animateFadeIn() : null;
            jQuery('.wdt-column-width-block').hide();
        }
        jQuery('#wdt-limit-layout').prop('checked', limitLayout);
    },
    /**
     * Enable or disable Word Wrap
     * @param wordWrap 1 or 0
     */
    setWordWrap: function (wordWrap) {
        wpdatatable_config.word_wrap = wordWrap;
        jQuery('#wdt-word-wrap').prop('checked', wordWrap);
    },
    /**
     * Enable or disable display length
     * @param displayLength integer - 10, 20, 50, 100, -1 (all)
     */
    setDisplayLength: function (displayLength) {
        wpdatatable_config.display_length = displayLength;
        jQuery('#wdt-rows-per-page')
            .val(displayLength)
            .wdtBootstrapSelectPicker('refresh');
    },
    /**
     * Show or hide "Show X entries" dropdown
     */
    setShowRowsPerPage: function (showRowsPerPage) {
        wpdatatable_config.showRowsPerPage = showRowsPerPage;
        jQuery('#wdt-show-rows-per-page').prop('checked', showRowsPerPage);
    },
    /**
     * Enable or disable the info block
     * @param infoBlock 1 or 0
     */
    setInfoBlock: function (infoBlock) {
        wpdatatable_config.info_block = infoBlock;
        jQuery('#wdt-info-block').prop('checked', infoBlock);
    },
    /**
     * Enable or disable pagination
     * @param pagination 1 or 0
     */
    setPagination: function (pagination) {
        wpdatatable_config.pagination = pagination;
        jQuery('#wdt-pagination').prop('checked', pagination);
        if (pagination == 1) {
            jQuery('.pagination-align-settings-block').removeClass('hidden');
            jQuery('.pagination-layout-settings-block').removeClass('hidden');
            jQuery('.pagination-layout-mobile-settings-block').removeClass('hidden');
            jQuery('.pagination-on-top').removeClass('hidden');
        } else {
            wpdatatable_config.setPaginationAlign('right');
            wpdatatable_config.setPaginationLayout('full_numbers');
            wpdatatable_config.setPaginationLayoutMobile('simple');
            jQuery('.pagination-align-settings-block').addClass('hidden');
            jQuery('.pagination-layout-settings-block').addClass('hidden');
            jQuery('.pagination-layout-mobile-settings-block').addClass('hidden');
            jQuery('.pagination-on-top').addClass('hidden');
        }
    },
    /**
     * Set pagination alignment
     * @param paginationAlign string
     */
    setPaginationAlign: function (paginationAlign) {
        wpdatatable_config.paginationAlign = paginationAlign;
        jQuery('#wdt-pagination-align')
            .val(paginationAlign)
            .wdtBootstrapSelectPicker('refresh');
    },
    /**
     * Set pagination layout
     * @param paginationLayout string
     */
    setPaginationLayout: function (paginationLayout) {
        wpdatatable_config.paginationLayout = paginationLayout;
        jQuery('#wdt-pagination-layout')
            .val(paginationLayout)
            .wdtBootstrapSelectPicker('refresh');
    },
    /**
     * Set pagination layout for mobile devices
     * @param paginationLayout string
     */
    setPaginationLayoutMobile: function( paginationLayout ){
        wpdatatable_config.paginationLayoutMobile = paginationLayout;
        jQuery('#wdt-pagination-layout-mobile')
            .val( paginationLayout )
            .selectpicker( 'refresh' );
    },
    /**
     * Enable or disable simple responsive
     * @param simpleResponsive 1 or 0
     */
    setSimpleResponsive: function (simpleResponsive) {
        wpdatatable_config.simpleResponsive = simpleResponsive;
        if (simpleResponsive == 1) {
            wpdatatable_config.setScrollable(0);
            wpdatatable_config.setLimitLayout(0);
            wpdatatable_config.setWordWrap(0);
            jQuery('.wdt-scrollable-block').addClass('hidden');
            jQuery('.limit-table-width-settings-block').addClass('hidden');
            jQuery('.word-wrap-settings-block').addClass('hidden');
        } else {
            if (wpdatatable_config.scrollable == 1) {
                jQuery('.limit-table-width-settings-block').hide();
                jQuery('.word-wrap-settings-block').hide();
                jQuery('.wdt-scrollable-block').show();
            } else if (wpdatatable_config.fixed_layout == 1) {
                jQuery('.wdt-scrollable-block').hide();
                jQuery('.limit-table-width-settings-block').show();
                jQuery('.word-wrap-settings-block').show();
            } else {
                jQuery('.wdt-scrollable-block').animateFadeIn();
                jQuery('.limit-table-width-settings-block').animateFadeIn();
            }


        }
        jQuery('#wdt-simple-responsive').prop('checked', simpleResponsive);
    },
    /**
     * Enable or disable first row as a header
     * @param simpleHeader 1 or 0
     */
    setSimpleHeader: function (simpleHeader) {
        wpdatatable_config.simpleHeader = simpleHeader;
        jQuery('#wdt-simple-header').prop('checked', simpleHeader);
    },
    /**
     * Enable or disable odds and even row classes
     * @param stripeTable 1 or 0
     */
    setStripeTable: function (stripeTable) {
        wpdatatable_config.stripeTable = stripeTable;
        jQuery('#wdt-stripe-table').prop('checked', stripeTable);
    },
    /**
     * Set cell padding value
     * @param cellPadding 1 or 0
     */
    setCellPadding: function (cellPadding) {
        wpdatatable_config.cellPadding = cellPadding;
        if (jQuery('#wdt-cell-padding').val() != wpdatatable_config.cellPadding) {
            jQuery('#wdt-cell-padding').val(wpdatatable_config.cellPadding);
        }
    },
    /**
     * Enable or disable borders
     * @param removeBorders 1 or 0
     */
    setRemoveBorders: function( removeBorders ){
        wpdatatable_config.removeBorders = removeBorders;
        jQuery('#wdt-remove-borders').prop( 'checked', removeBorders );
    },
    /**
     * Set the collapsing borders
     * @param borderCollapse
     */
    setBorderCollapse: function( borderCollapse ){
         wpdatatable_config.borderCollapse = borderCollapse;
         jQuery('#wdt-border-collapse').val( borderCollapse ).wdtBootstrapSelectPicker( 'refresh' );
     },
    /**
     * Set border spacing value
     * @param borderSpacing
     */
    setBorderSpacing: function( borderSpacing ){
         wpdatatable_config.borderSpacing = borderSpacing;
         if( jQuery('#wdt-border-spacing').val() !== wpdatatable_config.borderSpacing ){
             jQuery('#wdt-border-spacing').val( wpdatatable_config.borderSpacing );
         }
     },
    /**
     * Set vertical scroll height value
     * @param verticalScrollHeight 1 or 0
     */
    setVerticalScrollHeight: function (verticalScrollHeight) {
        wpdatatable_config.verticalScrollHeight = verticalScrollHeight;
        if (jQuery('#wdt-vertical-scroll-height').val() != wpdatatable_config.verticalScrollHeight) {
            jQuery('#wdt-vertical-scroll-height').val(wpdatatable_config.verticalScrollHeight);
        }
    },
    /**
     * Enable or disable the advanced filtering
     * @param filtering 1 or 0
     */
    setAdvancedFiltering: function (filtering) {
        wpdatatable_config.filtering = filtering;
        if (filtering == 0) {
            jQuery('.filtering-form-block').addClass('hidden');
            jQuery('.wdt-clear-filters-block').addClass('hidden');

            wpdatatable_config.filtering_form = 0;
            wpdatatable_config.clearFilters = 0;
            jQuery('#wdt-filter-in-form').prop('checked', 0);
            jQuery('#wdt-clear-filters').prop('checked', 0);
        }
        jQuery('#wdt-advanced-filter').prop('checked', filtering);
    },
    /**
     * Enable or disable the filtering form
     * @param filteringForm 1 or 0
     */
    setFilteringForm: function (filteringForm) {
        wpdatatable_config.filtering_form = filteringForm;
        jQuery('#wdt-filter-in-form').prop('checked', filteringForm);
    },
    /**
     * Enable or disable the clear filters button
     * @param clearFilters 1 or 0
     */
    setClearFilters: function (clearFilters) {
        wpdatatable_config.clearFilters = clearFilters;
        jQuery('#wdt-clear-filters').prop('checked', clearFilters);
    },
    /**
     * Enable or disable sorting
     * @param sorting 1 or 0
     */
    setSorting: function (sorting) {
        wpdatatable_config.sorting = sorting;
        jQuery('#wdt-global-sorting').prop('checked', sorting);
    },
    /**
     * Enable or disable cache source data
     * @param cacheSourceData 1 or 0
     */
    setCacheSourceData: function( cacheSourceData ){
        wpdatatable_config.cache_source_data = cacheSourceData;
        let allowedTableTypes = ['csv', 'xls', 'xml', 'json','nested_json','serialized'];
        if (allowedTableTypes.includes(wpdatatable_config.table_type)){
            jQuery('.wdt-table-settings .cache-settings-block').removeClass('hidden');
            jQuery('.wdt-table-settings .auto-update-cache-block').removeClass('hidden');
            if (['csv', 'xls'].includes(wpdatatable_config.table_type)) {
                jQuery('.wdt-table-settings .cache-settings-block').removeClass('col-sm-3').addClass('col-sm-4');
                jQuery('.wdt-table-settings .auto-update-cache-block').removeClass('col-sm-3').addClass('col-sm-4');
            } else {
                jQuery('.wdt-table-settings .cache-settings-block').removeClass('col-sm-4').addClass('col-sm-3');
                jQuery('.wdt-table-settings .auto-update-cache-block').removeClass('col-sm-4').addClass('col-sm-3');
            }
        } else {
            jQuery('.wdt-table-settings .cache-settings-block').addClass('hidden');
            jQuery('.wdt-table-settings .auto-update-cache-block').addClass('hidden');
            jQuery('.wdt-table-settings .cache-settings-block').removeClass('col-sm-4').addClass('col-sm-3');
            jQuery('.wdt-table-settings .auto-update-cache-block').removeClass('col-sm-4').addClass('col-sm-3');
        }
        if (cacheSourceData == 0){
            wpdatatable_config.auto_update_cache = 0
            jQuery('#wpdt-auto-update-cache').prop( 'checked', 0 );
            jQuery('.wdt-table-settings .auto-update-cache-block').addClass('hidden');
        } else {
            jQuery('.wdt-table-settings .auto-update-cache-block').removeClass('hidden');
        }
        jQuery('#wpdt-cache-source-data').prop( 'checked', cacheSourceData );
    },
    /**
     * Enable or disable auto update data in cache
     * @param autoUpdateCache 1 or 0
     */
    setAutoUpdateCache: function( autoUpdateCache ){
        wpdatatable_config.auto_update_cache = autoUpdateCache;
        jQuery('#wpdt-auto-update-cache').prop( 'checked', autoUpdateCache );
    },
    /**
     * Enable or disable Global Search block
     * @param globalSearch 1 or 0
     */
    setGlobalSearch: function (globalSearch) {
        wpdatatable_config.global_search = globalSearch;
        jQuery('#wdt-global-search').prop('checked', globalSearch);
    },
    /**
     * Enable or disable Editable for MySQL-based tables
     * Toggles the dependent feature switches
     * @param editable 1 or 0
     */
    setEditable: function (editable) {
        wpdatatable_config.editable = editable;
        if (wpdatatable_config.table_type == 'mysql' && !jQuery('.editing-settings-tab').is(':visible')) {
            jQuery('.editing-settings-tab').animateFadeIn();
        }

        // Show switch view buttons if table type is 'manual' or it is 'mysql' and editing is enabled
        if ((wpdatatable_config.editable == 1 || wpdatatable_config.table_type == 'manual') && !jQuery('div.wdt-edit-buttons').is(':visible')) {
            jQuery('div.wdt-edit-buttons').animateFadeIn();
        } else if (wpdatatable_config.table_type == 'mysql' && wpdatatable_config.editable == 0) {
            jQuery('div.wdt-edit-buttons').hide();
        }

        if (editable == 1) {
            jQuery('.editing-settings-block').animateFadeIn();
            if (wpdatatable_config.edit_only_own_rows) {
                jQuery('.own-rows-editing-settings-block').animateFadeIn();
            }

            // Apply selecter and guess the default ID column for editing
            if (!jQuery('#editing-settings #wdt-id-editing-column').val()) {
                var id_headers = ['id', 'ID', 'Id', 'wdt_ID'];

                var idColumnDefined = false;
                for (var i in id_headers) {
                    if (wpdatatable_config.columns_by_headers[id_headers[i]]) {
                        wpdatatable_config.setIdEditingColumn(wpdatatable_config.columns_by_headers[id_headers[i]].id);
                        idColumnDefined = true;
                        break;
                    }
                }
                if (!idColumnDefined && wpdatatable_config.columns.length > 0) {
                    wpdatatable_config.setIdEditingColumn(wpdatatable_config.columns[0].id);
                }
            }

            // Try to guess MySQL table name for editing
            var mysqlTableName = wpdatatable_config.content;
            mysqlTableName = mysqlTableName.slice(mysqlTableName.toLowerCase().indexOf('from') + 5);
            mysqlTableName = jQuery.trim(mysqlTableName);
            mysqlTableName = mysqlTableName.replace(new RegExp("\n", "g"), ' ');
            mysqlTableName = mysqlTableName.replace(new RegExp("`", "g"), '');
            mysqlTableName.indexOf(' ') != -1
                ? mysqlTableName = mysqlTableName.slice(0, mysqlTableName.indexOf(' ')) : null;
            wpdatatable_config.setMySQLTableName(mysqlTableName);

            wpdatatable_config.setServerSide(1);
        } else {
            // Reset all editing settings to default
            jQuery('.editing-settings-block').addClass('hidden');
            jQuery('#wdt-popover-tools').prop('checked', 0);
            jQuery('#wdt-inline-editable').prop('checked', 0);
            jQuery('.own-rows-editing-settings-block').addClass('hidden');
            jQuery('#wdt-edit-only-own-rows').prop('checked', 0);

            wpdatatable_config.popover_tools = 0;
            wpdatatable_config.inline_editing = 0;
            wpdatatable_config.id_editing_column = false;
            wpdatatable_config.editor_roles = '';
            jQuery('#wdt-editor-roles')
                .val('')
                .wdtBootstrapSelectPicker('refresh');
            wpdatatable_config.edit_only_own_rows = 0;
            wpdatatable_config.userid_column_id = null;
            if (wpdatatable_config.table_type != 'manual')
                wpdatatable_config.setMySQLTableName('');
        }
        jQuery('#wdt-editable').prop('checked', editable);
    },
    /**
     * Enable or disable the popover tools
     * @param popoverTools 1 or 0
     */
    setPopoverTools: function (popoverTools) {
        wpdatatable_config.popover_tools = popoverTools;
        jQuery('#wdt-popover-tools').prop('checked', popoverTools);
    },
    /**
     * Enable or disable inline editing
     * @param inlineEditing 1 or 0
     */
    setInlineEditing: function (inlineEditing) {
        wpdatatable_config.inline_editing = inlineEditing;
        jQuery('#wdt-inline-editable').prop('checked', inlineEditing);
    },
    /**
     * Define MySQL table for editing
     * @param mysqlTableName
     */
    setMySQLTableName: function (mysqlTableName) {
        wpdatatable_config.mysql_table_name = mysqlTableName;
        if (jQuery('#wdt-mysql-table-name').val() != wpdatatable_config.mysql_table_name) {
            jQuery('#wdt-mysql-table-name').val(wpdatatable_config.mysql_table_name);
        }
        if (wpdatatable_config.table_type === 'manual') {
            jQuery('#wdt-mysql-table-name').prop('disabled', true);
        }
    },
    /**
     * Define the ID column for editing
     * @param idEditingColumn integer
     */
    setIdEditingColumn: function (idEditingColumn) {
        wpdatatable_config.id_editing_column = true;
        jQuery('#wdt-id-editing-column')
            .val(idEditingColumn)
            .wdtBootstrapSelectPicker('refresh');

        for (var i in wpdatatable_config.columns) {
            wpdatatable_config.columns[i].id_column = wpdatatable_config.columns[i].id == idEditingColumn ? 1 : 0;
        }
    },
    /**
     * Set the editor roles
     * @param editorRoles comma-separated string
     */
    setEditorRoles: function (editorRoles) {
        wpdatatable_config.editor_roles = editorRoles;
        jQuery('#wdt-editor-roles')
            .val(editorRoles)
            .wdtBootstrapSelectPicker('refresh');
    },
    /**
     * Enable editing of only own rows for editable tables
     * @param editOwnRows 1 or 0
     */
    setEditOwnRows: function (editOwnRows) {
        wpdatatable_config.edit_only_own_rows = editOwnRows;
        jQuery('#wdt-edit-only-own-rows').prop('checked', editOwnRows);
        if (editOwnRows) {
            jQuery('.own-rows-editing-settings-block').animateFadeIn();
            if (wpdatatable_config.userid_column_id == null) {
                jQuery('#wdt-user-id-column').wdtBootstrapSelectPicker('refresh');
                wpdatatable_config.setUserIdColumn(wpdatatable_config.columns[0].id);
            } else {
                wpdatatable_config.setUserIdColumn(wpdatatable_config.userid_column_id);
            }
        } else {
            jQuery('.own-rows-editing-settings-block').animateFadeOut();
            wpdatatable_config.userid_column_id = null;
        }
    },
    /**
     * Set the user ID column for tables where users can see and edit
     * only their own rows
     * @param userIdColumn
     */
    setUserIdColumn: function (userIdColumn) {
        wpdatatable_config.userid_column_id = parseInt(userIdColumn);
        if (jQuery('#wdt-user-id-column').val() != userIdColumn) {
            jQuery('#wdt-user-id-column').val(userIdColumn).wdtBootstrapSelectPicker('refresh');
        }
    },
    /**
     * Set the selection for table tools
     * @param tableToolsConfig
     */
    setTableToolsConfig: function (tableToolsConfig) {
        wpdatatable_config.tabletools_config = tableToolsConfig;
        var tabletoolsConfigVal = [];
        for (var i in tableToolsConfig) {
            if (tableToolsConfig[i] == 1)
                tabletoolsConfigVal.push(i);
        }
        if (jQuery('#wdt-table-tools-config').val() != tabletoolsConfigVal) {
            jQuery('#wdt-table-tools-config').val(tabletoolsConfigVal).wdtBootstrapSelectPicker('refresh');
        }
    },
    /**
     * Set paper size for PDF export
     */
    setPdfPaperSize: function ( pdfPaperSize ) {
        wpdatatable_config.pdfPaperSize = pdfPaperSize;
        jQuery( '#wdt-pdf-paper-size' )
            .val( pdfPaperSize )
            .wdtBootstrapSelectPicker( 'refresh' );
    },
    /**
     * Set page orientation for PDF export
     */
    setPdfPageOrientation: function ( pdfPageOrientation ) {
        wpdatatable_config.pdfPageOrientation = pdfPageOrientation;
        jQuery( '#wdt-pdf-page-orientation' )
            .val( pdfPageOrientation )
            .wdtBootstrapSelectPicker( 'refresh' );
    },
    /**
     * Set the VAR 1 placeholder value
     */
    setPlaceholderVar1: function (var1) {
        wpdatatable_config.var1 = var1;
        if (jQuery('#wdt-var1-placeholder').val() != wpdatatable_config.var1) {
            jQuery('#wdt-var1-placeholder').val(wpdatatable_config.var1);
        }
    },
    /**
     * Set the VAR 2 placeholder value
     */
    setPlaceholderVar2: function (var2) {
        wpdatatable_config.var2 = var2;
        if (jQuery('#wdt-var2-placeholder').val() != wpdatatable_config.var2) {
            jQuery('#wdt-var2-placeholder').val(wpdatatable_config.var2);
        }
    },
    /**
     * Set the VAR 3 placeholder value
     */
    setPlaceholderVar3: function (var3) {
        wpdatatable_config.var3 = var3;
        if (jQuery('#wdt-var3-placeholder').val() != wpdatatable_config.var3) {
            jQuery('#wdt-var3-placeholder').val(wpdatatable_config.var3);
        }
    },
    /**
     * Set the Current User ID placeholder value
     */
    setPlaceholderCurrentUserId: function (currentUserIdPlaceholder) {
        wpdatatable_config.currentUserIdPlaceholder = currentUserIdPlaceholder;
        if (jQuery('#wdt-user-id-placeholder').val() != wpdatatable_config.currentUserIdPlaceholder) {
            jQuery('#wdt-user-id-placeholder').val(wpdatatable_config.currentUserIdPlaceholder);
        }
    },
    /**
     * Set the Current User Login placeholder value
     */
    setPlaceholderCurrentUserLogin: function (currentUserLoginPlaceholder) {
        wpdatatable_config.currentUserLoginPlaceholder = currentUserLoginPlaceholder;
        if (jQuery('#wdt-user-login-placeholder').val() != wpdatatable_config.currentUserLoginPlaceholder) {
            jQuery('#wdt-user-login-placeholder').val(wpdatatable_config.currentUserLoginPlaceholder);
        }
    },
    /**
     * Set the Current Post ID placeholder value
     */
    setPlaceholderCurrentPostId: function (currentPostIdPlaceholder) {
        wpdatatable_config.currentPostIdPlaceholder = currentPostIdPlaceholder;
        if (jQuery('#wdt-post-id-placeholder').val() != wpdatatable_config.currentPostIdPlaceholder) {
            jQuery('#wdt-post-id-placeholder').val(wpdatatable_config.currentPostIdPlaceholder);
        }
    },
    /**
     * Set the wpdb placeholder value
     */
    setPlaceholderWpdb: function (wpdbPlaceholder) {
        wpdatatable_config.wpdbPlaceholder = wpdbPlaceholder;
        if (jQuery('#wdt-wpdb-placeholder').val() != wpdatatable_config.wpdbPlaceholder) {
            jQuery('#wdt-wpdb-placeholder').val(wpdatatable_config.wpdbPlaceholder);
        }
    },
    setSimpleTemplateId: function (simple_template_id) {
        wpdatatable_config.simple_template_id = simple_template_id;
    },
    /**
     * Add a column to the list
     * @param column
     */
    addColumn: function (column) {
        wpdatatable_config.columns.push(column);
        wpdatatable_config.columns_by_headers[column.orig_header] = column;
    },
    /**
     * Define complete column list at once
     * @param columns
     */
    setColumns: function (columns) {
        wpdatatable_config.columns = columns;
    },
    /**
     * Open the properties block for the column with defined index
     * @param columnIndex
     */
    showColumn: function (columnIndex) {
        wpdatatable_config.columns[columnIndex].show();
        wpdatatable_config.currentOpenColumn = wpdatatable_config.columns[columnIndex];
    },
    /**
     * Returns the column by given index
     * @param columnIndex
     */
    getColumn: function (columnIndex) {
        return wpdatatable_config.columns[columnIndex];
    },
    /**
     * Returns the column by given header (orig_header)
     */
    getColumnByHeader: function (origHeader) {
        return typeof wpdatatable_config.columns_by_headers[origHeader] !== 'undefined' ?
            wpdatatable_config.columns_by_headers[origHeader] : null;
    },


    /**
     * Method to validate config and enable/disable the apply button
     */
    validateConfig: function () {

    },
    /**
     * Returns table config in JSON format
     */
    getJSON: function () {
        var properties = _.difference(_.keys(wpdatatable_config), _.functions(wpdatatable_config));
        var config = {};

        _.map(properties, function (property) {
            config[property] = wpdatatable_config[property];
        });

        config.columns = _.map(wpdatatable_config.columns, function (column) {
            return column.getJSON()
        });

        delete config.columns_by_headers;
        delete config.dataTable;

        return config;
    },
    /**
     * Initializes the table and columns config from JSON - for save and for edit
     */
    initFromJSON: function (tableJSON) {
        wpdatatable_config.setId(tableJSON.id);
        wpdatatable_config.setTitle(tableJSON.title);
        wpdatatable_config.setDescription( tableJSON.table_description );
        wpdatatable_config.setTableType(tableJSON.table_type);
        wpdatatable_config.setFileLocation( tableJSON.file_location );
        wpdatatable_config.setAutoRefresh(tableJSON.auto_refresh);
        wpdatatable_config.setShowTitle(tableJSON.show_title);
        wpdatatable_config.setContent(tableJSON.content);
        wpdatatable_config.setDisplayLength(tableJSON.display_length);
        wpdatatable_config.setShowRowsPerPage(tableJSON.showRowsPerPage);
        wpdatatable_config.setShowDescription( tableJSON.show_table_description );
        wpdatatable_config.columns = [];
        wpdatatable_config.columns_by_headers = {};
        for (var i in tableJSON.columns) {
            tableJSON.columns[i].parent_table = wpdatatable_config;
            wpdatatable_config.addColumn(new WDTColumn(tableJSON.columns[i]));
        }
        wpdatatable_config.fillColumnsBlock();
        wpdatatable_config.setCacheSourceData( parseInt( tableJSON.cache_source_data ) );
        wpdatatable_config.setAutoUpdateCache( parseInt( tableJSON.auto_update_cache ) );

        wpdatatable_config.setLimitLayout(parseInt(tableJSON.fixed_layout));
        wpdatatable_config.setGlobalSearch(parseInt(tableJSON.global_search));
        wpdatatable_config.setHideBeforeLoad(parseInt(tableJSON.hide_before_load));
        wpdatatable_config.setInfoBlock(parseInt(tableJSON.info_block));
        wpdatatable_config.setPagination(parseInt(tableJSON.pagination));
        wpdatatable_config.setPaginationAlign(tableJSON.paginationAlign);
        wpdatatable_config.setPaginationLayout(tableJSON.paginationLayout);
        wpdatatable_config.setPaginationLayoutMobile( tableJSON.paginationLayoutMobile );
        wpdatatable_config.setSimpleHeader(parseInt(tableJSON.simpleHeader));
        wpdatatable_config.setStripeTable(parseInt(tableJSON.stripeTable));
        wpdatatable_config.setCellPadding(parseInt(tableJSON.cellPadding));
        wpdatatable_config.setVerticalScrollHeight(parseInt(tableJSON.verticalScrollHeight));
        wpdatatable_config.setRemoveBorders( parseInt( tableJSON.removeBorders ) );
        wpdatatable_config.setBorderCollapse( tableJSON.borderCollapse );
        wpdatatable_config.setBorderSpacing( parseInt( tableJSON.borderSpacing) );
        wpdatatable_config.setResponsive( parseInt( tableJSON.responsive ) );
        wpdatatable_config.setResponsiveAction( tableJSON.responsiveAction );
        wpdatatable_config.setScrollable(parseInt(tableJSON.scrollable));
        wpdatatable_config.setSimpleResponsive(parseInt(tableJSON.simpleResponsive));
        wpdatatable_config.setVerticalScroll(parseInt(tableJSON.verticalScroll));
        wpdatatable_config.setSorting(parseInt(tableJSON.sorting));
        wpdatatable_config.setShowTableTools(parseInt(tableJSON.tools), tableJSON.tabletools_config);
        wpdatatable_config.setTableToolsIncludeHTML( parseInt( tableJSON.showTableToolsIncludeHTML ) );
        wpdatatable_config.setTableToolsIncludeTitle( parseInt( tableJSON.showTableToolsIncludeTitle ) );
        wpdatatable_config.setPdfPaperSize( tableJSON.pdfPaperSize);
        wpdatatable_config.setPdfPageOrientation( tableJSON.pdfPageOrientation);
        wpdatatable_config.setWordWrap(tableJSON.word_wrap);
        wpdatatable_config.setPlaceholderVar1(tableJSON.var1);
        wpdatatable_config.setPlaceholderVar2(tableJSON.var2);
        wpdatatable_config.setPlaceholderVar3(tableJSON.var3);
        wpdatatable_config.setWCAG(tableJSON.table_wcag);
        wpdatatable_config.setSimpleTemplateId(tableJSON.simple_template_id);
        wpdatatable_config.setPaginationOnTop(parseInt(tableJSON.pagination_top));
    },
    /**
     * Method which draws the "column settings" and "delete formula" buttons in wpDataTable
     * and adds events and logic for these buttons
     */
    drawColumnSettingsButtons: function ($table) {
        jQuery('.wdt-preload-layer').animateFadeOut();
        $table.find('thead tr:eq(0) th.wdtheader').each(function () {
            if (wpdatatable_config.columns[wpdatatable_config.dataTable.column(jQuery(this)).index()].type == 'formula') {
                var $formulaDeleteButton = jQuery('<button class="btn btn-default pull-right btn-xs wdt-delete-formula-column" data-toggle="tooltip" title="Click to delete formula column"><i class="wpdt-icon-trash"></i></button>');
                $formulaDeleteButton.appendTo(this).click(function (e) {
                    var formulaColumn = wpdatatable_config.columns.slice(wpdatatable_config.dataTable.column(jQuery(this).closest('th')).index())[0];
                    for (var i = formulaColumn.pos + 1; i <= wpdatatable_config.columns.length - 1; i++) {
                        wpdatatable_config.columns[i].pos = --wpdatatable_config.columns[i].pos;
                    }
                    wpdatatable_config.columns = _.reject(
                        wpdatatable_config.columns,
                        function (el) {
                            return el.orig_header == formulaColumn.orig_header;
                        });
                    jQuery('button.wdt-apply:eq(0)').click();
                });
            }
            var $button = jQuery('<button class="btn btn-default pull-right btn-xs wdt-column-settings" data-toggle="tooltip" title="Click to open column settings"><i class="wpdt-icon-cog"></i></button>');
            $button.appendTo(this).click(function (e) {
                e.preventDefault();
                e.stopImmediatePropagation();
                var columnIndex = wpdatatable_config.dataTable.column(jQuery(this).closest('th')).index();
                wpdatatable_config.showColumn(columnIndex);
            });
        });
        $table.find('thead th button[data-toggle="tooltip"]').tooltip();
        jQuery(document).off('click', 'span.columnTitle button.wdt-column-settings').on('click', 'span.columnTitle button.wdt-column-settings', function (e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            var columnIndex = jQuery(this).closest('li').data('column');
            wpdatatable_config.showColumn(columnIndex);
        });
        jQuery('#wpdatatable-preview-container table').show();
        jQuery('input.number-range-filter').keyup();
        jQuery('input.date-range-filter').keyup();
        jQuery('input.datetime-range-filter').keyup();
        jQuery('input.time-range-filter').keyup();
        wdtHideTooltip();
    },
    /**
     * Sets the string for table HTML
     * @param table_html
     */
    setTableHtml: function (table_html) {
        wpdatatable_config.table_html = table_html;
    },
    /**
     * Sets the JSON object for datatable_config
     * @param datatable_config
     */
    setDataTableConfig: function (datatable_config) {
        wpdatatable_config.datatable_config = datatable_config;
    },
    renderTable: function () {
        if (!jQuery('div.column-settings').is(':visible')) {
            jQuery('div.column-settings').fadeInDown();
        }
        if (wpdatatable_config.dataTable != null) {
            wpdatatable_config.dataTable.destroy();
        }
        if (wpdatatable_config.table_html != '') {
            jQuery('#wpdatatable-preview-container').html('');
            jQuery('#wpdatatable-preview-container').html(wpdatatable_config.table_html);
        }
        wpdatatable_config.dataTable = wdtRenderDataTable(
            jQuery('#wpdatatable-preview-container table'),
            wpdatatable_config.datatable_config
        ).api();

        wpdatatable_config.drawColumnSettingsButtons(jQuery('#wpdatatable-preview-container table'));
        jQuery('.wpDataTablesWrapper .dataTables_length .length_menu').wdtBootstrapSelectPicker();
    },
    /**
     * Helper method that fills in the columns in he column popup
     * from the wpdatatable_config.columns array
     */
    fillColumnsBlock: function () {
        jQuery('#wdt-columns-list-modal div.wdt-columns-container').html('');
        jQuery('#wdt-formula-editor-modal div.formula-columns-container').html('');
        jQuery('#editing-settings #wdt-id-editing-column').html('');
        jQuery('#editing-settings #wdt-user-id-column').html('');
        for (var i in wpdatatable_config.columns) {
            wpdatatable_config.columns[i].renderSmallColumnBlock(i);
            if (wpdatatable_config.table_type == 'mysql' || wpdatatable_config.table_type == 'manual') {
                wpdatatable_config.columns[i].populateColumnForEditing();
                wpdatatable_config.columns[i].populateUserIdColumn();
            }
        }

        jQuery('#wdt-id-editing-column').wdtBootstrapSelectPicker('refresh');
        if (wpdatatable_config.id_editing_column == false)
            jQuery('#wdt-id-editing-column').wdtBootstrapSelectPicker('val', '');

        jQuery('#wdt-user-id-column').wdtBootstrapSelectPicker('val', wpdatatable_config.userid_column_id);

        // Apply new tooltips
        jQuery('#wdt-columns-list-modal [data-toggle="tooltip"]').tooltip();
    },
    /**
     * Helper method to generate a formula name, checking that same name wouldn't already exist in the table
     */
    generateFormulaName: function () {
        var i = 1;
        var nameGenerated = false;
        var name = '';
        while (!nameGenerated) {
            name = 'formula_' + i;
            if (wpdatatable_config.getColumnByHeader(name) == null) {
                nameGenerated = true;
            }
            i++;
        }
        return name;
    }
};
