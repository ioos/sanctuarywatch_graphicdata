<script type="text/template" id="fusion_builder_block_wpdatachart_preview_template">
    <h4 class="fusion_module_title wpdatachart-head-title">
        <span class="fusion-module-icon {{ fusionAllElements[element_type].icon }}"></span>
        {{ fusionAllElements[element_type].name }}</h4>
    <#
    var selectedChart = params.id;
    var selectedChartName = fusionAllElements[element_type].params.id.value[params.id];
    if (selectedChart && selectedChart != 0 ) {
    #>
    <p class="wpdatachart-title">Chart: {{{ selectedChartName }}} </p>
    <span class="wpdatachart-shortcode">[wpdatachart id:</span><span> {{{ selectedChart }}}]</span>
    <# } else {  #>
    <span class="wpdatachart-no-id">Please choose wpDataChart ID.</span>
    <# }#>
</script>