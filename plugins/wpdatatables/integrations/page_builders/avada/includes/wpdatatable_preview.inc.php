<script type="text/template" id="fusion_builder_block_wpdatatable_preview_template">
    <h4 class="fusion_module_title wpdatatable-head-title">
        <span class="fusion-module-icon {{ fusionAllElements[element_type].icon }}"></span>
        {{ fusionAllElements[element_type].name }}</h4>
    <#
    var selectedTable = params.id;
    var selectedTableName = fusionAllElements[element_type].params.id.value[params.id];
    var selectedExportFileName = params.export_file_name;

    if (selectedTable && selectedTable != 0 ) {  #>
    <p class="wpdatatable-title">Table: {{{ selectedTableName }}} </p>
    <span class="wpdatatable-id">[wpdatatable id=</span><span>{{{ selectedTable }}}</span>
    <# if (selectedExportFileName) {  #>
    <span class="wpdatatable-export-file-name"> export_file_name=</span><span>{{{ selectedExportFileName }}}</span>
    <# }  #>
    <span>]</span>
    <# } else {  #>
    <span class="wpdatatable-no-id">Please choose wpDatatable ID.</span>
    <# } #>
</script>