/**
 * Main jQuery elements controller for the table settings page
 *
 * Binds the jQuery control elements for manipulating the config object, binds jQuery plugins
 *
 * @author Alexander Gilmanov
 * @since 16.09.2016
 */

(function($) {
    $(function(){

        /**
         * Change table type
         */
        $('#wdt-table-type').change(function(e){
            wpdatatable_config.setTableType( $(this).val() );
        });

        /**
         * Change file location
         */
        $('#wdt-file-location').change(function (e) {
            wpdatatable_config.setFileLocation($(this).val());
        });

        /**
         * Toggle server-side processing
         */
        $('#wdt-server-side').change(function(e){
            wpdatatable_config.setServerSide( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Change table name
         */
        $('#wdt-table-title-edit').change(function(e){
            wpdatatable_config.setTitle( $(this).val() );
        });

        /**
         * Change table description
         */
        $('#wdt-table-description-edit').change(function (e) {
            wpdatatable_config.setDescription($(this).val());
        });

        /**
         * Change auto-refresh
         */
        $('#wdt-auto-refresh').change(function(e){
            wpdatatable_config.setAutoRefresh( $(this).val() );
        });

        /**
         * Change URL
         */
        $('#wdt-input-url').bind('input change',function(e){
            wpdatatable_config.setContent( $(this).val() );
        });

        /**
         * Toggle Table Tools selection dropdown
         */
        $('#wdt-table-tools').change(function(e){
            wpdatatable_config.setShowTableTools( $(this).is(':checked') ? 1 : 0, {} );
        });

        /**
         * Toggle Table Tools Include HTML option
         */
        $('#wdt-table-tools-include-html').change(function (e) {
            wpdatatable_config.setTableToolsIncludeHTML($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Toggle Table Tools Include table title option
         */
        $('#wdt-table-tools-include-title').change(function (e) {
            wpdatatable_config.setTableToolsIncludeTitle($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Toggle Responsiveness
         */
        $('#wdt-responsive').change(function(e){
            wpdatatable_config.setResponsive( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Set responsive action
         */
        $('#wdt-responsive-action').change(function (e) {
            wpdatatable_config.setResponsiveAction($(this).val());
        });

        /**
         * Toggle Scrollable
         */
        $('#wdt-scrollable').change(function(e){
            wpdatatable_config.setScrollable( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle Hide until loaded
         */
        $('#wdt-hide-until-loaded').change(function(e){
            wpdatatable_config.setHideBeforeLoad( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle Limit Width
         */
        $('#wdt-limit-layout').change(function(e){
            wpdatatable_config.setLimitLayout( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle Word Wrap
         */
        $('#wdt-word-wrap').change(function(e){
            wpdatatable_config.setWordWrap( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle show title
         */
        $('#wdt-show-title').change(function(e){
            wpdatatable_config.setShowTitle( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle show description
         */
        $('#wdt-show-description').change(function (e) {
            wpdatatable_config.setShowDescription($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Change display length
         */
        $('#wdt-rows-per-page').change(function(e){
            wpdatatable_config.setDisplayLength( $(this).val() );
        });

        /**
         * Toggle "Show X entries"
         */
        $('#wdt-show-rows-per-page').change(function(e){
            wpdatatable_config.setShowRowsPerPage( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Change display info block
         */
        $('#wdt-info-block').change(function(e){
            wpdatatable_config.setInfoBlock( $(this).is(':checked') ? 1 : 0 );
        });
        /**
         * Enable to go on the top of the table after clicking the pagination buttons
         */
        $('#wdt-pagination-top').change(function (e) {
            wpdatatable_config.setPaginationOnTop($(this).is(':checked') ? 1 : 0);
        });
        /**
         * Enable pagination
         */
        $('#wdt-pagination').change(function (e) {
            wpdatatable_config.setPagination($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Set pagination alignment
         */
        $('#wdt-pagination-align').change(function (e) {
            wpdatatable_config.setPaginationAlign($(this).val());
        });

        /**
         * Set pagination layout
         */
        $('#wdt-pagination-layout').change(function (e) {
            wpdatatable_config.setPaginationLayout($(this).val());
        });

        /**
         * Set pagination layout for mobile devices
         */
        $('#wdt-pagination-layout-mobile').change(function (e) {
            wpdatatable_config.setPaginationLayoutMobile($(this).val());
        });

        /**
         * Toggle Vertical scroll
         */
        $('#wdt-vertical-scroll').change(function (e) {
            wpdatatable_config.setVerticalScroll($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Toggle simple responsive
         */
        $('#wdt-simple-responsive').change(function (e) {
            wpdatatable_config.setSimpleResponsive($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Toggle simple header
         */
        $('#wdt-simple-header').change(function (e) {
            wpdatatable_config.setSimpleHeader($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Toggle stripe table
         */
        $('#wdt-stripe-table').change(function (e) {
            wpdatatable_config.setStripeTable($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Set cell padding for simple table
         */
        $('#wdt-cell-padding').change(function (e) {
            wpdatatable_config.setCellPadding($(this).val());
        });

        /**
         * Set vertical scroll for simple table
         */
        $('#wdt-vertical-scroll-height').change(function (e) {
            wpdatatable_config.setVerticalScrollHeight($(this).val());
        });

        /**
         * Toggle remove borders for simple table
         */
        $('#wdt-remove-borders').change(function (e) {
            wpdatatable_config.setRemoveBorders($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Set border collapse for simple table
         */
        $('#wdt-border-collapse').change(function (e) {
            wpdatatable_config.setBorderCollapse($(this).val());
        });

        /**
         * Set border spacing for simple table
         */
        $('#wdt-border-spacing').change(function (e) {
            wpdatatable_config.setBorderSpacing($(this).val());
        });

        /**
         * Toggle Advanced filter
         */
        $('#wdt-advanced-filter').change(function(e){
            wpdatatable_config.setAdvancedFiltering( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle Sorting
         */
        $('#wdt-global-sorting').change(function(e){
            wpdatatable_config.setSorting( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle Global Search
         */
        $('#wdt-global-search').change(function(e){
            wpdatatable_config.setGlobalSearch( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle cache source data
         */
        $('#wpdt-cache-source-data').change(function (e) {
            wpdatatable_config.setCacheSourceData($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Toggle auto update cache
         */
        $('#wpdt-auto-update-cache').change(function (e) {
            wpdatatable_config.setAutoUpdateCache($(this).is(':checked') ? 1 : 0);
        });

        /**
         * Toggle Filters in form
         */
        $('#wdt-filter-in-form').change(function(e){
            wpdatatable_config.setFilteringForm( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle Clear Filters
         */
        $('#wdt-clear-filters').change(function(e){
            wpdatatable_config.setClearFilters( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle Editable
         */
        $('#wdt-editable').change(function(e){
            wpdatatable_config.setEditable( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle Popover Tools
         */
        $('#wdt-popover-tools').change(function(e){
            wpdatatable_config.setPopoverTools( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Toggle inline editing
         */
        $('#wdt-inline-editable').change(function(e){
            wpdatatable_config.setInlineEditing( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Set MySQL table name
         */
        $('#wdt-mysql-table-name').change(function(e){
            wpdatatable_config.setMySQLTableName( $(this).val() );
        });

        /**
         * Set ID editing column
         */
        $('#wdt-id-editing-column').change(function(e){
            wpdatatable_config.setIdEditingColumn( $(this).val() );
        });

        /**
         * Set editor roles
         */
        $('#wdt-editor-roles').change(function(e){
            wpdatatable_config.setEditorRoles( $(this).val() );
        });

        /**
         * Toggle edit only own rows
         */
        $('#wdt-edit-only-own-rows').change(function(e){
            wpdatatable_config.setEditOwnRows( $(this).is(':checked') ? 1 : 0 );
        });

        /**
         * Set User ID Column
         */
        $('#wdt-user-id-column').change(function(e){
            wpdatatable_config.setUserIdColumn( $(this).val() );
        });

        /**
         * Set Table Tools config
         */
        $('#wdt-table-tools-config').change(function(e){
            var tableToolsConfig = {};
            var tableToolsSelection = $(this).val();
            for( var i in tableToolsSelection ){
                tableToolsConfig[tableToolsSelection[i]] = 1;
            }
            // Show/hide PDF export options
            if (tableToolsSelection.includes('pdf')) {
                if( !$('div.pdf-export-options').is(":visible")){
                    $('div.pdf-export-options').animateFadeIn();
                }
            } else {
                $('div.pdf-export-options').animateFadeOut();
                wpdatatable_config.setPdfPaperSize('A4');
                wpdatatable_config.setPdfPageOrientation('portrait');
            }

            if ($(this).val() == null) {
                wpdatatable_config.setShowTableTools(0, []);
            }
            wpdatatable_config.setTableToolsConfig(tableToolsConfig);
        });

        /**
         * Set PDF export paper size
         */
        $('#wdt-pdf-paper-size').change(function (e) {
            wpdatatable_config.setPdfPaperSize($(this).val());
        });

        /**
         * Set PDF export page orientation
         */
        $('#wdt-pdf-page-orientation').change(function (e) {
            wpdatatable_config.setPdfPageOrientation($(this).val());
        });

        /**
         * Set Placeholder VAR 1
         */
        $('#wdt-var1-placeholder').change(function(e){
            wpdatatable_config.setPlaceholderVar1( $(this).val() );
        });

        /**
         * Set Placeholder VAR 2
         */
        $('#wdt-var2-placeholder').change(function(e){
            wpdatatable_config.setPlaceholderVar2( $(this).val() );
        });

        /**
         * Set Placeholder VAR 3
         */
        $('#wdt-var3-placeholder').change(function(e){
            wpdatatable_config.setPlaceholderVar3( $(this).val() );
        });

        /**
         * Set Placeholder Current User ID
         */
        $('#wdt-user-id-placeholder').change(function(e){
            wpdatatable_config.setPlaceholderCurrentUserId( $(this).val() );
        });

        /**
         * Set Placeholder Current User Login
         */
        $('#wdt-user-login-placeholder').change(function(e){
            wpdatatable_config.setPlaceholderCurrentUserLogin( $(this).val() );
        });

        /**
         * Set Placeholder Current Post ID
         */
        $('#wdt-post-id-placeholder').change(function(e){
            wpdatatable_config.setPlaceholderCurrentPostId( $(this).val() );
        });

        /**
         * Set Placeholder wpdb
         */
        $('#wdt-wpdb-placeholder').change(function(e){
            wpdatatable_config.setPlaceholderWpdb( $(this).val() );
        });

        /**
         * Remove decimal place if value is negative or 0 for int
         * and if value is negative for formula
         */
        $('#wdt-column-decimal-places').change(function(e){
            var comparisonNumber = wpdatatable_config.currentOpenColumn.type == 'formula' ? -1 : 0;
            if ( $('#wdt-column-decimal-places').val() <= comparisonNumber ) {
                $('#wdt-column-decimal-places').val( '' );
            }
        });

        /**
         * Apply syntax highlighter
         */
        if( $('#wdt-mysql-query').length ) {

            var applyQuery = function(e){
                if( aceEditor.getValue().length > 5 ){
                    wpdatatable_config.setContent( aceEditor.getValue() );
                }
            };

            aceEditor = ace.edit('wdt-mysql-query');
            aceEditor.$blockScrolling = Infinity;
            aceEditor.getSession().setMode("ace/mode/sql");
            aceEditor.setTheme("ace/theme/idle_fingers");

            
        }

        /**
         * Close column settings
         */
        $('button.wdt-cancel-column-settings').click(function(e){
            e.preventDefault();
            wpdatatable_config.currentOpenColumn.hide();
        });

        /**
         * Collapse and expand the Table Settings widget
         */
        $('button.wdt-collapse-table-settings').click(function(e){
            e.preventDefault();
            e.stopImmediatePropagation();
            if( $(this).hasClass('expanded') ){
                $(this).find('i').removeClass('wpdt-icon-angle-up').addClass('wpdt-icon-angle-down');
                $(this).closest('.card').find('div.card-body').slideUp();
                $(this).removeClass('expanded').addClass('collapsed');
            }else{
                $(this).find('i').addClass('wpdt-icon-angle-up').removeClass('wpdt-icon-angle-down');
                $(this).closest('.card').find('div.card-body').slideDown();
                $(this).addClass('expanded').removeClass('collapsed');
            }
        });

        /**
         * Reset column values
         */
        $('#wdt-column-values-reset').click(function(e){
            e.preventDefault();
            $('#wdt-column-values-list')
                .tagsinput('removeAll');
        });

        /**
         * Configure column values
         */
        $('#wdt-column-values').on('change-without-notification change', function(e){
            e.preventDefault();

            $('select#wdt-column-editor-input-type').find('option')
                .prop('disabled', false);

            if ($(this).val() === 'read') {
                $('div.wdt-manual-list-enter-block').hide();
                $('div.wdt-foreign-key-block').hide();
            } else if ($(this).val() === 'list') {
                $('div.wdt-manual-list-enter-block').show();
                $('div.wdt-foreign-key-block').hide();
            } else if ($(this).val() === 'foreignkey') {
                if ($.inArray(wpdatatable_config.currentOpenColumn.filter_type, ['select', 'checkbox']) !== -1) {
                    $('#wdt-column-exact-filtering').prop('checked', 1).change();
                }
                $('div.wdt-manual-list-enter-block').hide();
                $('div.wdt-foreign-key-block').show();
                $('div.wdt-foreign-rule-display').show();
                $('select#wdt-column-editor-input-type').find('option')
                    .not('[value=selectbox]')
                    .not('[value=none]')
                    .prop('disabled', true);
                if ($('select#wdt-column-editor-input-type').val() == null) {
                    $('select#wdt-column-editor-input-type').wdtBootstrapSelectPicker('val', 'none');
                }
            } else {
                $('div.wdt-possible-values-options-block').hide();
            }

            $('select#wdt-column-editor-input-type').wdtBootstrapSelectPicker('refresh');

            if (wpdatatable_config.currentOpenColumn.foreignKeyRule == null) {
                $('#wdt-column-foreign-table').wdtBootstrapSelectPicker('val', 0).trigger('change');

                $('.wdt-foreign-rule-display #wdt-connected-table-name').text('-');
                $('.wdt-foreign-rule-display #wdt-connected-table-show-column').text('-');
                $('.wdt-foreign-rule-display #wdt-connected-table-value-column').text('-');
            }
        });

        /**
         * Show columns list modal
         */
        $('#wdt-open-columns-list').click(function(e){
            e.preventDefault();
            $('#wdt-columns-list-modal').modal('show');
        });

        

        /**
         * Apply Dragula within columns list modal
         */
        dragula([$('div.wdt-columns-container').get(0)])
            .on('dragend', function( el ){
                $('#wdt-columns-list-modal div.wdt-column-block').each(function(){
                    wpdatatable_config
                        .getColumnByHeader( $(this).data('orig_header') )
                        .setPos( $(this).index() )
                });
            });

        

        /**
         * Open add column modal
         */
        $('button.wdt-add-column').click(function (e) {
            e.preventDefault();
            $('#wdt-add-column-modal').modal('show');
        });

        /**
         * Open remove column modal
         */
        $('button.wdt-remove-column').click(function (e) {
            e.preventDefault();
            $('#wdt-remove-column-modal').modal('show');
        });

        /**
         * Delete conditional formatting rule
         */
        $(document).on('click','button.wdt-delete-conditional-formatting-rule',function(e){
            var $block = $(this).closest('div.wdt-conditional-formatting-rule');
            $block.remove();
        });
        $('#wdt-wcag').change(function (e) {
            wpdatatable_config.setWCAG($(this).is(':checked') ? 1 : 0);
        });
        /**
         * Show/hide different settings for different column types
         */
        $('#wdt-column-type').change(function(e){
            if( $(this).val() == 'formula' ){
                $('div.wdt-possible-values-type-block').hide();
                $('div.wdt-possible-values-options-block').hide();
                $('div.wdt-formula-column-block').show();
                $('div.wdt-skip-thousands-separator-block').hide();
                $('div.wdt-numeric-column-block').hide();
                $('div.wdt-float-column-block').show();
                $('div.wdt-date-input-format-block').hide();
                $('div.wdt-link-target-attribute-block').hide();
                $('div.wdt-link-nofollow-attribute-block').hide();
                $('div.wdt-link-noreferrer-attribute-block').hide();
                $('div.wdt-link-sponsored-attribute-block').hide();
                $('div.wdt-link-button-attribute-block').hide();
                $('div.wdt-link-button-label-block').hide();
                $('div.wdt-link-button-class-block').hide();
            }else if( [ 'int','float' ].indexOf( $(this).val() ) !== -1 ){
                $('div.wdt-possible-values-type-block').hide();
                $('div.wdt-possible-values-options-block').hide();
                $('div.wdt-formula-column-block').hide();
                $('div.wdt-numeric-column-block').show();
                $('div.wdt-date-input-format-block').hide();
                if( $(this).val() == 'float' ){
                    $('div.wdt-skip-thousands-separator-block').hide();
                    $('div.wdt-float-column-block').show();
                }else{
                    $('div.wdt-float-column-block').hide();
                    $('div.wdt-skip-thousands-separator-block').show();
                }
                $('div.wdt-link-nofollow-attribute-block').hide();
                $('div.wdt-link-noreferrer-attribute-block').hide();
                $('div.wdt-link-sponsored-attribute-block').hide();
                $('div.wdt-link-target-attribute-block').hide();
                $('div.wdt-link-button-attribute-block').hide();
                $('div.wdt-link-button-label-block').hide();
                $('div.wdt-link-button-class-block').hide();
            }else if( $(this).val() == 'string' ){
                $('div.wdt-possible-values-type-block').show();
                $('div.wdt-possible-values-options-block').show();
                $('div.wdt-numeric-column-block').hide();
                $('div.wdt-formula-column-block').hide();
                $('div.wdt-date-input-format-block').hide();
                $('div.wdt-link-target-attribute-block').hide();
                $('div.wdt-link-nofollow-attribute-block').hide();
                $('div.wdt-link-noreferrer-attribute-block').hide();
                $('div.wdt-link-sponsored-attribute-block').hide();
                $('div.wdt-link-button-attribute-block').hide();
                $('div.wdt-link-button-label-block').hide();
                $('div.wdt-link-button-class-block').hide();
            } else if (['date', 'datetime'].indexOf($(this).val()) !== -1
                && $.inArray(wpdatatable_config.table_type, ['xls', 'csv', 'google_spreadsheet', 'json','nested_json', 'xml', 'serialized']) !== -1) {
                $('div.wdt-date-input-format-block').show();
                $('div.wdt-possible-values-type-block').hide();
                $('div.wdt-possible-values-options-block').hide();
                $('div.wdt-numeric-column-block').hide();
                $('div.wdt-formula-column-block').hide();
                $('div.wdt-link-target-attribute-block').hide();
                $('div.wdt-link-nofollow-attribute-block').hide();
                $('div.wdt-link-noreferrer-attribute-block').hide();
                $('div.wdt-link-sponsored-attribute-block').hide();
                $('div.wdt-link-button-attribute-block').hide();
                $('div.wdt-link-button-label-block').hide();
                $('div.wdt-link-button-class-block').hide();
            } else if ($(this).val() == 'link') {
                $('div.wdt-possible-values-type-block').hide();
                $('div.wdt-possible-values-options-block').hide();
                $('div.wdt-numeric-column-block').hide();
                $('div.wdt-formula-column-block').hide();
                $('div.wdt-date-input-format-block').hide();
                $('div.wdt-link-target-attribute-block').show();
                $('div.wdt-link-nofollow-attribute-block').show();
                $('div.wdt-link-noreferrer-attribute-block').show();
                $('div.wdt-link-sponsored-attribute-block').show();
                if ($('#wdt-link-button-attribute').is(':checked')) {
                    $('div.wdt-link-button-label-block').show();
                    $('div.wdt-link-button-class-block').show();
                }
                $('div.wdt-link-button-attribute-block').show();
            } else {
                $('div.wdt-possible-values-type-block').hide();
                $('div.wdt-possible-values-options-block').hide();
                $('div.wdt-numeric-column-block').hide();
                $('div.wdt-formula-column-block').hide();
                $('div.wdt-date-input-format-block').hide();
                $('div.wdt-link-target-attribute-block').hide();
                $('div.wdt-link-nofollow-attribute-block').hide();
                $('div.wdt-link-noreferrer-attribute-block').hide();
                $('div.wdt-link-sponsored-attribute-block').hide();
                $('div.wdt-link-button-attribute-block').hide();
                $('div.wdt-link-button-label-block').hide();
                $('div.wdt-link-button-class-block').hide();
            }
        });

        /**
         * Show different Default Value(s) input(s) for different filter types
         */
        $('#wdt-column-filter-type').change(function(e){
            var filterType = $(this).val();
            var $filterInput = $('#wdt-filter-default-value');
            var $filterInputBlock = $('.wdt-filter-default-value-block');
            var $filterInputFrom = $('#wdt-filter-default-value-from');
            var $filterInputFromBlock = $('.wdt-filter-default-value-from-block');
            var $filterInputTo = $('#wdt-filter-default-value-to');
            var $filterInputToBlock = $('.wdt-filter-default-value-to-block');
            var $filterInputSelectpicker = $('#wdt-filter-default-value-selectpicker');
            var $filterInputSelectpickerBlock = $('.wdt-filter-default-value-selectpicker-block');
            var typeAttr = 'text';

            if ( $.inArray( filterType, ['text', 'number']) != -1 ) {
                $('div.wdt-exact-filtering-block').show();
                if (filterType == 'number')
                    typeAttr = 'number';
                $filterInput.attr('type', typeAttr);
                $filterInputBlock.show();
                $filterInputFromBlock.hide();
                $filterInputToBlock.hide();
                $filterInputSelectpickerBlock.hide();
                $filterInputFrom.val('');
                $filterInputTo.val('');
                $filterInputSelectpicker.wdtBootstrapSelectPicker('deselectAll');
            } else if ( $.inArray( filterType, ['number-range', 'date-range', 'datetime-range', 'time-range'])  != -1 ) {
                $('div.wdt-exact-filtering-block').hide();
                $filterInputBlock.hide();
                $filterInputFromBlock.show();
                $filterInputToBlock.show();
                $filterInputSelectpickerBlock.hide();
                $filterInputFrom.val('');
                $filterInputTo.val('');
                $filterInputSelectpicker.wdtBootstrapSelectPicker('deselectAll');

                if ($filterInputFrom.data('DateTimePicker') != undefined)
                    $filterInputFrom.data('DateTimePicker').destroy();

                if ($filterInputTo.data('DateTimePicker') != undefined)
                    $filterInputTo.data('DateTimePicker').destroy();

                if (filterType == 'number-range')
                    typeAttr = 'number';

                $filterInputFrom
                    .attr('type', typeAttr)
                    .removeClass('wdt-datepicker wdt-datetimepicker wdt-timepicker');
                $filterInputTo
                    .attr('type', typeAttr)
                    .removeClass('wdt-datepicker wdt-datetimepicker wdt-timepicker');

                if (filterType != 'number-range') {
                    $filterInputFrom
                        .addClass('wdt-' + filterType.substring(0, filterType.indexOf('-')) + 'picker');
                    $filterInputTo
                        .addClass('wdt-' + filterType.substring(0, filterType.indexOf('-')) + 'picker')
                }
            } else {
                $('div.wdt-exact-filtering-block').show();
                $filterInputBlock.hide();
                $filterInputFromBlock.hide();
                $filterInputToBlock.hide();
                $filterInputSelectpickerBlock.show();

                $filterInputSelectpicker.html('');

                if (filterType == 'checkbox') {
                    $filterInputSelectpicker.attr('multiple', 'multiple');
                } else {
                    $filterInputSelectpicker.prepend('<option value="" data-empty="true" selected="selected"></option>');
                    $filterInputSelectpicker.removeAttr('multiple');
                }

                if (wpdatatable_config.currentOpenColumn.possibleValuesType === 'foreignkey') {
                    $('#wdt-column-exact-filtering').prop('checked', 1).change();
                }

                var values = wpdatatable_config.currentOpenColumn.defaultValueValues;
                var options = '';

                $.each(wpdatatable_config.currentOpenColumn.defaultValueValues, function( index, value ) {
                    if (typeof (values[index]) != 'object') {
                        options += '<option value="' + value + '">' + value + '</option>'
                    } else {
                        options += '<option value="' + value.value + '">' + value.label + '</option>'
                    }
                });

                $filterInputSelectpicker.append(options);

                $filterInputSelectpicker.wdtBootstrapSelectPicker('destroy').wdtBootstrapSelectPicker('render');

            }

        });

        /**
         * Show/hide sorting direction block on 'default sorting' switch toggle
         */
        $('#wdt-column-default-sort').change(function(e){
            if( $(this).is(':checked') ){
                $('div.wdt-column-default-sorting-direction-block').show();
            }else{
                $('div.wdt-column-default-sorting-direction-block').hide();
            }
        });

        /**
         * Show/hide editing blocks when 'none' is selected as editor input type.
         * Change 'Predefined value(s)' input type based on editor input type.
         */
        $('#wdt-column-editor-input-type').change(function(e){

            $('div.wdt-editing-enabled-block').show();
            var editorInputType = $(this).val();
            var $defaultValueInput = $('#wdt-editing-default-value');
            var $defaultValueInputBlock = $('.wdt-editing-default-value-block');
            var $defaultValueSelectpicker = $('#wdt-editing-default-value-selectpicker');
            var $defaultValueSelectpickerBlock = $('.wdt-editing-default-value-selectpicker-block');

            if ( $.inArray(editorInputType, ['text', 'textarea', 'mce-editor', 'link', 'email', 'attachment']) != -1 ) {
                $defaultValueInputBlock.show();
                $defaultValueSelectpickerBlock.hide();

                if ($defaultValueInput.data('DateTimePicker') != undefined)
                    $defaultValueInput.data('DateTimePicker').destroy();

                $defaultValueInput
                    .removeClass('wdt-datepicker wdt-datetimepicker wdt-timepicker');

            } else if ( $.inArray(editorInputType, ['date', 'datetime', 'time']) != -1 ) {
                $defaultValueInputBlock.show();
                $defaultValueSelectpickerBlock.hide();

                if ($defaultValueInput.data('DateTimePicker') != undefined)
                    $defaultValueInput.data('DateTimePicker').destroy();

                $defaultValueInput
                    .removeClass('wdt-datepicker wdt-datetimepicker wdt-timepicker');

                $defaultValueInput
                    .addClass('wdt-' + editorInputType + 'picker');

            } else if ( $.inArray(editorInputType, ['selectbox', 'multi-selectbox']) != -1 ) {
                $defaultValueInputBlock.hide();
                $defaultValueSelectpickerBlock.show();
                $defaultValueInput.val('');

                $defaultValueSelectpicker.html('');

                if (editorInputType == 'multi-selectbox') {
                    $defaultValueSelectpicker.attr('multiple', 'multiple');
                } else {
                    $defaultValueSelectpicker.prepend('<option value="" data-empty="true" selected="selected"></option>');
                    $defaultValueSelectpicker.removeAttr('multiple');
                }

                var values = wpdatatable_config.currentOpenColumn.defaultValueValues;
                var options = '';

                $.each(wpdatatable_config.currentOpenColumn.defaultValueValues, function( index, value ) {
                    if (typeof (values[index]) != 'object') {
                        options += '<option value="' + value + '">' + value + '</option>'
                    } else {
                        options += '<option value="' + value.value + '">' + value.label + '</option>'
                    }
                });

                $defaultValueSelectpicker.append(options);

                $defaultValueSelectpicker.wdtBootstrapSelectPicker('destroy').wdtBootstrapSelectPicker('render');

            } else {
                $defaultValueInput.val('');
                $('div.wdt-editing-enabled-block').hide();
            }

        });

        /**
         * Add a conditional formatting rule
         */
        $('button.wdt-column-add-conditional-formatting-rule').click(function(e){
            if( wpdatatable_config.currentOpenColumn == null ){ return; }
            wpdatatable_config.currentOpenColumn.renderConditionalFormattingBlock({
                ifClause: 'eq',
                cellVal: '',
                action: 'setCellColor',
                setVal: ''
            });
        });



        /**
         * Show/hide button label in Url link column
         */
        $('#wdt-link-button-attribute').change(function (e) {
            if ($(this).is(':checked')) {
                $('div.wdt-link-button-label-block').show();
                $('div.wdt-link-button-class-block').show();

            } else {
                $('div.wdt-link-button-label-block').hide();
                $('div.wdt-link-button-class-block').hide();
            }
        });


        /**
         * Apply all column changes on "Apply" click in column block
         */
        $('button.wdt-column-apply').click(function(e){
            e.preventDefault();
            wpdatatable_config.currentOpenColumn.applyChanges();
            // Trigger table's Apply action
            $('button.wdt-apply:eq(0)').click();
        });

        /**
         * Apply all changes on "Apply" click
         */
        $(document).on('click', 'button.wdt-apply', function () {
            if ( wpdatatable_config.editable ){
                if( $('#wdt-mysql-table-name').val() == '' ){
                    $('#wdt-error-modal .modal-body').html( 'MySQL table name for front-end editing is not set!' );
                    $('#wdt-error-modal').modal( 'show' );
                    return;
                }
            }
            if ( wpdatatable_config.server_side == 1 ) {
                for (var i in wpdatatable_config.columns) {
                    wpdatatable_config.columns[i].groupColumn = 0;
                    if ( wpdatatable_config.columns[i].type == 'formula' ) {
                        wpdatatable_config.columns[i].calculateTotal = 0;
                        wpdatatable_config.columns[i].calculateAvg   = 0;
                        wpdatatable_config.columns[i].calculateMin   = 0;
                        wpdatatable_config.columns[i].calculateMax   = 0;
                    }
                }
            }
            if (wpdatatable_config.table_type === 'nested_json'){

                wpdatatable_config.jsonAuthParams = {
                    url: $('#wdt-nested-json-url').val(),
                    method: $('#wdt-nested-json-get-type').wdtBootstrapSelectPicker('val'),
                    authOption: $('#wdt-nested-json-auth-option').wdtBootstrapSelectPicker('val'),
                    username: $('#wdt-nested-json-username').val(),
                    password: $('#wdt-nested-json-password').val(),
                    customHeaders: wpdatatable_config.compileCustomHeadersRow(),
                    root: $('#wdt-nested-json-root').val(),
                };

                if (wpdatatable_config.jsonAuthParams.root === ''){
                    wdtNotify(wpdatatables_edit_strings.error, 'JSON roots can not be empty. Please set proper JSON roots or insert proper JSON params and click on Fetch JSON button again to get valid roots from JSON URL.', 'danger');
                    return;
                }
                if (wpdatatable_config.jsonAuthParams.url === ''){
                    $('.wdt-table-settings #wdt-nested-json-root').html('').wdtBootstrapSelectPicker('refresh');
                    $('.wdt-table-settings .nested-json-roots').addClass('hidden');
                    wdtNotify(wpdatatables_edit_strings.error, 'JSON URL can not be empty', 'danger');
                    return;
                }
                if ( wpdatatable_config.jsonAuthParams.authOption !== ''){
                    if ( wpdatatable_config.jsonAuthParams.username === '' || wpdatatable_config.jsonAuthParams.password === ''){
                        wdtNotify(wpdatatables_edit_strings.error, 'Credentials can not be empty', 'danger');
                        return;
                    }
                }
            }

            $('.wdt-preload-layer').animateFadeIn();
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                dataType: 'json',
                data: {
                    wdtNonce: $('#wdtNonce').val(),
                    action: 'wpdatatables_save_table_config',
                    table: JSON.stringify( wpdatatable_config.getJSON() )
                },
                success: function(data){

                    if( typeof data.error != 'undefined' ){
                        // Show error if returned
                        $('#wdt-error-modal .modal-body').html( data.error );
                        $('#wdt-error-modal').modal( 'show' );
                        $('.wdt-preload-layer').animateFadeOut();
                        return;
                    }else{
                        // Reinitialize table with returned data
                        wpdatatable_config.initFromJSON( data.table );
                        wpdatatable_config.setTableHtml( data.wdtHtml );
                        wpdatatable_config.setDataTableConfig( data.wdtJsonConfig );
                        if ( $('.wpExcelTable').length ) {
                            location.reload();
                        } else {
                            wpdatatable_config.renderTable();
                        }
                        // Show editing tab
                        if ((data.table.table_type == 'mysql' || data.table.table_type == 'manual')
                            && !jQuery('.editing-settings-tab').is(':visible')) {
                            $('.editing-settings-tab').animateFadeIn();
                        }
                        // Add url to "Switch View" buttons for MySQL tables
                        if (data.table.table_type == 'mysql') {
                            $('.wdt-edit-buttons a')
                                .attr('href', window.location.pathname + '?page=wpdatatables-constructor&source&table_id=' +  data.table.id + '&table_view=excel')
                        }
                        // Show success message
                        wdtNotify(
                            wpdatatables_edit_strings.success,
                            wpdatatables_edit_strings.tableSaved,
                            'success'
                        );
                    }
                    if(window.location.href.indexOf("table_id=") === -1){
                        window.history.replaceState(null, null, window.location.pathname + "?page=wpdatatables-constructor&source&table_id=" + data.table.id);
                    }
                },
                error: function( data ){
                    $('#wdt-error-modal .modal-body').html( 'There was an error while trying to save the table! '+data.statusText+' '+data.responseText);
                    $('#wdt-error-modal').modal( 'show' );
                    $('.wdt-preload-layer').animateFadeOut();
                }
            });
        });

        /**
         * Switch tabs in table settings
         */
        $('.wdt-datatables-admin-wrap .wdt-table-settings .tab-nav a, ' +
            '.wdt-datatables-admin-wrap .column-settings-panel .tab-nav li').on('click',function (e) {
            e.preventDefault();
            $('.wdt-datatables-admin-wrap .column-settings-panel .tab-content .tab-pane:not(.main-customize-table-settings)').removeClass(' fade active in');
            const href = $(this).find('a').attr('href');
            if (href) {
                $(href).addClass('active in');
            }
        });

        /**
         * Fill possible values list on "Read From Table" button
         */
        $('button#wdt-column-values-read-from-table').click( function(e) {
            e.preventDefault();
            if ( wpdatatable_config.table_type == 'mysql' || wpdatatable_config.table_type == 'manual' ) {
                var data = {};
                data.action = 'wpdatatable_get_column_distinct_values';
                data.tableId = wpdatatable_config.id;
                data.columnId = wpdatatable_config.currentOpenColumn.id;

                $.ajax({
                    type: 'post',
                    url: ajaxurl,
                    data: data,
                    dataType: 'json',
                    success: function (distValues) {
                        if (!(distValues instanceof Array)) {
                            return;
                        }
                        wdtFillPossibleValuesList( distValues );
                    }
                });
            } else {
                var distValues = wpdatatable_config.dataTable.columns( wpdatatable_config.currentOpenColumn.pos ).data().eq( 0 ).sort().unique().toArray();
                wdtFillPossibleValuesList( distValues );
            }

        });

        /**
         * Apply foreign key rule and save for current column
         */
        $('button.wdt-save-foreign-key-rule').click(function(e){
            $('#wdt-configure-foreign-key-modal').modal('hide');
            if( wpdatatable_config.currentOpenColumn == null ){ return; }
            wpdatatable_config.currentOpenColumn.foreignKeyRule = {
                tableId: $('#wdt-column-foreign-table').val(),
                tableName: $('#wdt-column-foreign-table').wdtBootstrapSelectPicker('val') != 0 ? $('#wdt-column-foreign-table option:selected').html() : '',
                displayColumnId: $('#wdt-foreign-column-display-value').val(),
                displayColumnName: $('#wdt-foreign-column-display-value option:selected').html(),
                storeColumnId: $('#wdt-foreign-column-store-value').val(),
                storeColumnName: $('#wdt-foreign-column-store-value option:selected').html()
            };
            if ( wpdatatable_config.currentOpenColumn.foreignKeyRule.tableId != 0 ) {
                $('.wdt-foreign-rule-display #wdt-connected-table-name').text( $('#wdt-column-foreign-table option:selected').html() );
                $('.wdt-foreign-rule-display #wdt-connected-table-show-column').text( $('#wdt-foreign-column-display-value option:selected').html() );
                $('.wdt-foreign-rule-display #wdt-connected-table-value-column').text( $('#wdt-foreign-column-store-value option:selected').html() );
            } else {
                $('.wdt-foreign-rule-display #wdt-connected-table-name').text( '-' );
                $('.wdt-foreign-rule-display #wdt-connected-table-show-column').text( '-' );
                $('.wdt-foreign-rule-display #wdt-connected-table-value-column').text( '-' );
            }
        });

        /**
         * Replace span with input for column name and vice versa
         */
        $(document).on('keyup','.wdt-column-display-header-edit', function(e){
            e.preventDefault();
            wpdatatable_config
                .getColumnByHeader( $(this).closest('.wdt-column-block').data('orig_header') )
                .setDisplayHeader( $(this).val() );
        });

        /**
         * Apply changes for column settings on enter
         */
        $(document).on('keyup','#column-display-settings input[type="text"]',function(e){
            if( e.which == 13 ){
                $('button.wdt-column-apply:eq(0)').click();
            }
        });

        

        /**
         * Apply the changes to column in the quickaccess modal
         */
        $('#wdt-apply-columns-list').click(function(e){
            $('#wdt-columns-list-modal').modal('hide');
            $('button.wdt-apply:eq(0)').click();
        });

        /**
         * Add column to formula on click
         */
        $(document).on('click', '#wdt-formula-editor-modal div.wdt-column-block', function(e){
            $('#wdt-formula-editor-modal textarea').insertAtCaret( $(this).data('orig_header') );
        });

        /**
         * Add operator to formula on click
         */
        $(document).on('click', '#wdt-formula-editor-modal div.wdt-formula-operators button', function(e){
            $('#wdt-formula-editor-modal textarea').insertAtCaret( $(this).text() );
        });

        /**
         * Preview formula result
         */
        $('button.wdt-preview-formula').click(function(e){
            $('#wdt-formula-editor-modal .wdt-preload-layer').animateFadeIn();
            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'wpdatatables_preview_formula_result',
                    table_id: wpdatatable_config.id,
                    formula: $('#wdt-formula-editor-modal textarea').val()
                },
                success: function(data){
                    $('div.wdt-formula-result-preview').html( data );
                    if( !$('div.wdt-formula-result-preview').is(':visible') ){
                        $('div.wdt-formula-result-preview').fadeInDown();
                    }
                    $('#wdt-formula-editor-modal .wdt-preload-layer').animateFadeOut();
                }
            })
        });

        /**
         * Save formula
         */
        $('button.wdt-save-formula').click(function(e){
            if( wpdatatable_config.currentOpenColumn == null ){
                // Adding a new column
                var columnName = wpdatatable_config.generateFormulaName();
                wpdatatable_config.addColumn(
                    new WDTColumn(
                        {
                            type:           'formula',
                            orig_header:    columnName,
                            display_header: columnName,
                            pos:            wpdatatable_config.columns.length,
                            formula:        $('#wdt-formula-editor-modal textarea').val(),
                            parent_table:   wpdatatable_config
                        }
                    )
                );
                $('button.wdt-apply:eq(0)').click();
            }else{
                //Updating existing column
                wpdatatable_config.currentOpenColumn.formula =  $('#wdt-formula-editor-modal textarea').val();
            }
            $('#wdt-formula-editor-modal').modal('hide');
        });

        /**
         * Load the table for edit page
         */
        if( typeof wpdatatable_init_config !== 'undefined' ){
            wpdatatable_config.initFromJSON( wpdatatable_init_config );
            wpdatatable_config.dataTable = $('#wpdatatable-preview-container table.wpDataTable').DataTable();
            $('div.column-settings').removeClass('hidden');
            wpdatatable_config.drawColumnSettingsButtons( $('#wpdatatable-preview-container table') );
        }

        /**
         * Open WordPress media uploader
         */
        $('#wdt-browse-button').click(function(e) {
            e.preventDefault();
            e.stopImmediatePropagation();
            e.preventDefault();

            var mediaType;

            if ( $('#wdt-table-type').val() == 'xls' ){
                mediaType =  'application/vnd.ms-excel,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
            } else if ( $('#wdt-table-type').val() == 'csv'){
                mediaType =  'text/csv';
            }

            // Extend the wp.media object
            custom_uploader = wp.media.frames.file_frame = wp.media({
                title: wpdatatables_edit_strings.selectExcelCsv,
                button: {
                    text: wpdatatables_edit_strings.choose_file
                },
                multiple: false,
                library: {
                    type: mediaType
                }
            });

            // When a file is selected, grab the URL and set it as the text field value
            custom_uploader.on('select', function() {
                attachment = custom_uploader.state().get('selection').first().toJSON();
                $('#wdt-input-url').val(attachment.url).trigger('change');
            });

            //Open the uploader dialog
            custom_uploader.open();

        });

        /**
         * Change JSON Auth option
         */
        $('#wdt-nested-json-auth-option').change(function (e) {
            let type = $(this).val();
            switch( type ){
                case 'basic_auth':
                    jQuery('.wdt-table-settings .nested-json-basic-auth-inputs').removeClass('hidden');
                    break;
                default:
                    jQuery('.wdt-table-settings .nested-json-basic-auth-inputs').addClass('hidden');
                    jQuery('#wdt-nested-json-username').val('');
                    jQuery('#wdt-nested-json-password').val('');
                    break;
            }
            jQuery('#wdt-nested-json-auth-option').val( type ).wdtBootstrapSelectPicker('refresh');
        });

        /**
         * Get Nested JSON roots
         */
        $('#wdt-get-nested-json-roots').click(function (e) {
            e.stopImmediatePropagation();
            let url = $('#wdt-nested-json-url').val(),
                authOption = $('#wdt-nested-json-auth-option').wdtBootstrapSelectPicker('val'),
                username = $('#wdt-nested-json-username').val(),
                password = $('#wdt-nested-json-password').val(),
                customHeaders = wpdatatable_config.compileCustomHeadersRow(),
                params = {
                    method: $('#wdt-nested-json-get-type').wdtBootstrapSelectPicker('val')
                };

            if (url === ''){
                $('.wdt-table-settings #wdt-nested-json-root').html('').wdtBootstrapSelectPicker('refresh');
                $('.wdt-table-settings .nested-json-roots').addClass('hidden');
                wdtNotify(wpdatatables_edit_strings.error, 'JSON URL can not be empty', 'danger');
                return;
            }
            params.url = url;
            params.customHeaders = customHeaders;
            if (authOption !== ''){
                params.authOption = authOption;
                if (username === '' || password === ''){
                    wdtNotify(wpdatatables_edit_strings.error, 'Credentials can not be empty', 'danger');
                    return;
                }
                params.username = username;
                params.password = password;
            }

            // Add custom loader
            let loader = document.createElement("div");
            loader.classList.add("nested-json-loader");
            $('#main-table-settings').css('opacity','0.5').append(loader)

            $.ajax({
                url: ajaxurl,
                method: 'POST',
                data: {
                    action: 'wpdatatables_get_nested_json_roots',
                    wdtNonce:  $('#wdtNonce').val(),
                    params: JSON.stringify(params),
                    tableConfig: JSON.stringify(wpdatatable_config.getJSON())
                },
                success: function (data) {
                    if(data.success) {
                        var options = '';
                        $.each(data.data.roots, function (i, name) {
                            options += '<option value="' + name + '">' + name + '</option>';
                        });
                        $('.wdt-table-settings #wdt-nested-json-root').html(options).wdtBootstrapSelectPicker('refresh');
                        $('.wdt-table-settings .nested-json-roots').removeClass('hidden');
                        $('#main-table-settings .nested-json-loader').remove();
                        $('#main-table-settings').css('opacity','1')
                        jQuery('button.wdt-apply').prop( 'disabled', '' );
                        wdtNotify(
                            wpdatatables_edit_strings.success,
                            wpdatatables_edit_strings.getJsonRoots,
                            'success'
                        );
                    } else {
                        $('.wdt-table-settings #wdt-nested-json-root').html('').wdtBootstrapSelectPicker('refresh');
                        $('.wdt-table-settings .nested-json-roots').addClass('hidden');
                        $('#main-table-settings .nested-json-loader').remove();
                        $('#main-table-settings').css('opacity','1')
                        $('button.wdt-apply').prop( 'disabled', 'disabled' );
                        wdtNotify('Error!', wpdatatables_edit_strings.errorText, 'danger');
                    }
                },
                error: function (xhr, status, error) {
                    $('.wdt-table-settings #wdt-nested-json-root').html('').wdtBootstrapSelectPicker('refresh');
                    $('.wdt-table-settings .nested-json-roots').addClass('hidden');
                    $('#main-table-settings .nested-json-loader').remove();
                    $('#main-table-settings').css('opacity','1')
                    $('button.wdt-apply').prop( 'disabled', 'disabled' );
                    let message = xhr.responseText;
                    wdtNotify('Error!', message, 'danger');
                }
            })

        });

        /**
         * Add custom headers row
         */
        $('.wdt-add-nested-json-custom-headers-row').on('click', function (e) {
            wpdatatable_config.renderCustomHeadersRow({
                setKeyName: '',
                setKeyValue: ''
            });

        });

        /**
         * Delete custom headers row
         */
        $(document).on('click', '.wdt-delete-custom-headers-row-rule', function (e) {
            var $block = $(this).closest('div.wdt-custom-headers-row-rule');
            $block.remove();
        });

        /**
         * Apply tagsinput
         */
        $('#wdt-column-values-list').tagsinput({
            delimiterRegex: '|',
            tagClass: 'label label-primary'
        });


        var hash = window.location.hash;

        // On page load
        activateTabByHash(hash);

        // On hashchange
        window.addEventListener('hashchange', function () {
            activateTabByHash(window.location.hash);
        }, false);

        // Update hash when any tab is clicked
        $('.wdt-datatables-admin-wrap').on('click', '.wdt-table-settings .tab-nav a[data-toggle="tab"]', function (e) {
            e.preventDefault();
            var targetHash = this.hash;
            if (targetHash) {
                var scrollmem = $('body').scrollTop();
                window.location.hash = targetHash;
                $('html,body').scrollTop(scrollmem);
            }

            // Show tab (Bootstrap behavior)
            $(this).wdtBootstrapTabs('show');
        });

        function activateTabByHash(hash) {
            if (!hash) return;

            // First, try matching a top-level tab
            var $topLevelTab = $('.wdt-datatables-admin-wrap .wdt-table-settings ul.tab-nav a[href="' + hash + '"]');

            if ($topLevelTab.length && typeof $.fn.wdtBootstrapTabs !== 'undefined') {
                $topLevelTab.wdtBootstrapTabs('show');
            }
            // If not found, try nested tabs under #customize-table-settings
            var $nestedTab = $('.customize-table-settings-ul a[href="' + hash + '"]');

            if ($nestedTab.length) {
                // First, make sure parent tab is shown
                var $customizeTab = $('.wdt-datatables-admin-wrap .wdt-table-settings ul.tab-nav a[href="#customize-table-settings"]');
                if ($customizeTab.length) {
                    $customizeTab.wdtBootstrapTabs('show');
                }

                // Then show the nested tab
                setTimeout(function () {
                    $nestedTab.wdtBootstrapTabs('show');
                }, 100); // slight delay in case parent tab needs time to render
            }
        }
    });
})(jQuery);
