var wpDataTablesChartJS = function(){

    var obj = {
        container: '#chart-js-container',
        canvas: '#chart-js-canvas',
        columnIndexes: [],
        connectedWPDataTable: null,
        renderCallback: null,
        chart: null,
        pieCharts: ['chartjs_polar_area_chart', 'chartjs_pie_chart', 'chartjs_doughnut_chart'],
        setContainer: function(container){
            this.container = container;
        },
        setCanvas: function(canvas){
            this.canvas = canvas;
        },
        setContainerOptions: function(options){
            if(options.container.width == 0){
                this.container.style.width = null;
            } else {
                this.container.style.width = options.container.width + 'px';
            }
            this.container.style.height = options.container.height + 'px';
            this.canvas.style.backgroundColor = options.canvas.backgroundColor;
            this.canvas.style.border = options.canvas.borderWidth + 'px solid ' + options.canvas.borderColor;
            this.canvas.style.borderRadius = options.canvas.borderRadius + 'px';
        },
        setRenderCallback: function( callback ){
            this.renderCallback = callback;
        },
        globalOptions: {

        },
        options: {
            data:{

            },
            options: {
                scales: {
                    x: {
                        title: {
                            display: true
                        }
                    },
                    y: {
                        title: {
                            display: true
                        },
                        beginAtZero: false
                    }
                },
                plugins:{
                    title: {
                        text: '',
                        display: true,
                        position: 'top',
                        font:{
                            size: 16,
                        },
                        color: '#666'
                    },
                    legend: {
                        display: true,
                        labels: {
                            font:{
                                fontSize: 12,
                            },
                            color: '#666',
                            boxWidth: 40
                        }
                    },
                    tooltip: {
                        enabled: true,
                        mode: 'single',
                        backgroundColor: 'rgba(0,0,0,0.8)',
                        titleFont: {
                            size: 12,
                            weight: 'bold',
                        },
                        titleColor: '#fff',
                        bodyFont:{
                            size: 12,
                            style: 'normal',
                        },
                        caretSize: 5,
                        cornerRadius: 6
                    }
                },
                maintainAspectRatio: false
            }
        },
        setOptions: function( options ){
            for( var property in options ){
                for (var option in options[property]) {
                    if(option) {
                        this.options['options'][property][option] = options[property][option];
                    }
                }
            }
        },
        setGlobalOptions: function( globalOptions ){
            for( var property in globalOptions ){
                if(globalOptions[property]){
                    this.globalOptions[property] = globalOptions[property];
                }
            }
        },
        setData: function( data ){
            for( var property in data ){
                this.options['data'][property] = data[property];
            }
        },
        getOptions: function(){
            return this.options;
        },
        render: function(){
            if( this.renderCallback !== null ){
                this.renderCallback( this );
            }
            for( var property in this.globalOptions ){
                Chart.defaults[property] = this.globalOptions[property];
            }
            this.chart = new Chart(this.canvas, this.options);
        },
        setType: function( type ){
            switch( type ){
                case 'chartjs_line_chart':
                    Chart.defaults.elements.line.fill = false;
                    this.options.type = 'line';
                    break;
                case 'chartjs_area_chart':
                    Chart.defaults.elements.line.fill = true;
                    this.options.type = 'line';
                    break;
                case 'chartjs_stacked_area_chart':
                    Chart.defaults.elements.line.fill = true;
                    this.options.type = 'line';
                    this.options.options.scales.y.stacked = true;
                    break;
                case 'chartjs_column_chart':
                    Chart.defaults.elements.line.fill = true;
                    this.options.type = 'bar';
                    break;
                case 'chartjs_stacked_column_chart':
                    Chart.defaults.elements.line.fill = true;
                    this.options.type = 'bar';
                    this.options.options.scales.y.stacked = true;
                    this.options.options.scales.x.stacked = true;
                    break;
                case 'chartjs_bar_chart':
                    Chart.defaults.elements.line.fill = true;
                    this.options.type = 'bar';
                    this.options.options.indexAxis = 'y';
                    break;
                case 'chartjs_stacked_bar_chart':
                    Chart.defaults.elements.line.fill = true;
                    this.options.type = 'bar';
                    this.options.options.scales.y.stacked = true;
                    this.options.options.scales.x.stacked = true;
                    this.options.options.indexAxis = 'y';
                    break;
                case 'chartjs_radar_chart':
                    Chart.defaults.elements.line.fill = true;
                    this.options.type = 'radar';
                    break;
                case 'chartjs_polar_area_chart':
                    this.options.type = 'polarArea';
                    break;
                case 'chartjs_pie_chart':
                    this.options.type = 'pie';
                    break;
                case 'chartjs_doughnut_chart':
                    this.options.type = 'doughnut';
                    break;
                case 'chartjs_bubble_chart':
                    this.options.type = 'bubble';
                    break;
            }
        },
        setColumnIndexes: function( columnIndexes ){
            this.columnIndexes = columnIndexes;
        },
        setConnectedWPDataTable: function( wpDataTable ){
            this.connectedWPDataTable = wpDataTable;
        },
        setGrouping: function( group_chart ){
            this.group_chart = group_chart;
        },
        setChartConfig: function(chartConfig) {
            // Chart
            if (chartConfig.responsive_width == 1) {
                this.container.style.width = null;
            } else {
                this.container.style.width = chartConfig.width + 'px';
                this.options.options.maintainAspectRatio = false;
            }
            chartConfig.height ? this.container.style.height = chartConfig.height + 'px' : null;
            this.canvas.style.backgroundColor = chartConfig.background_color;
            this.canvas.style.border = chartConfig.border_width + 'px solid ' + chartConfig.border_color;
            chartConfig.border_radius ? this.canvas.style.borderRadius = chartConfig.border_radius + 'px' : null;
            if (chartConfig.font_size){
                this.globalOptions.font.size = parseInt(chartConfig.font_size)
                this.options.options.plugins.legend.labels.font.size  = parseInt(chartConfig.font_size)
                this.options.options.plugins.title.font.size  = parseInt(chartConfig.font_size)
                this.options.options.scales.x.ticks.font.size = parseInt(chartConfig.font_size)
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.font.size = parseInt(chartConfig.font_size)
                    this.options.options.scales.r.pointLabels.font.size = parseInt(chartConfig.font_size)
                }
                this.options.options.scales.y.ticks.font.size = parseInt(chartConfig.font_size)
                this.options.options.scales.x.title.font.size = parseInt(chartConfig.font_size)
                this.options.options.scales.y.title.font.size = parseInt(chartConfig.font_size)
            } else {
                this.globalOptions.font.size = 12
                this.options.options.plugins.legend.labels.font.size = 12
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.font.size = 12
                    this.options.options.scales.r.pointLabels.font.size = 12
                }
                this.options.options.plugins.title.font.size = 12
                this.options.options.scales.x.ticks.font.size = 12
                this.options.options.scales.y.ticks.font.size = 12
                this.options.options.scales.x.title.font.size = 12
                this.options.options.scales.y.title.font.size = 12
            }
            if (chartConfig.font_name){
                this.globalOptions.font.family = chartConfig.font_name
                this.options.options.plugins.legend.labels.font.family  = chartConfig.font_name
                this.options.options.scales.x.title.font.family = chartConfig.font_name
                this.options.options.scales.y.title.font.family = chartConfig.font_name
                this.options.options.scales.x.ticks.font.family = chartConfig.font_name
                this.options.options.scales.y.ticks.font.family = chartConfig.font_name
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.font.family = chartConfig.font_name
                    this.options.options.scales.r.pointLabels.font.family = chartConfig.font_name
                }
            } else {
                this.globalOptions.font.family = 'Arial'
                this.options.options.plugins.legend.labels.font.family  = 'Arial'
                this.options.options.scales.x.ticks.font.family = 'Arial'
                this.options.options.scales.y.ticks.font.family = 'Arial'
                this.options.options.scales.y.title.font.family = 'Arial'
                this.options.options.scales.x.ticks.font.family = 'Arial'
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.font.family = 'Arial'
                    this.options.options.scales.r.pointLabels.font.family = 'Arial'
                }
            }
            if (chartConfig.font_style){
                this.options.options.plugins.legend.labels.font.style = chartConfig.font_style;
                this.options.options.scales.x.ticks.font.style = chartConfig.font_style;
                this.options.options.scales.y.ticks.font.style = chartConfig.font_style;
                this.options.options.scales.x.title.font.style = chartConfig.font_style
                this.options.options.scales.y.title.font.style = chartConfig.font_style
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.font.style = chartConfig.font_style
                    this.options.options.scales.r.pointLabels.font.style = chartConfig.font_style
                }
            } else {
                this.options.options.plugins.legend.labels.font.style  = 'normal'
                this.options.options.scales.x.ticks.font.style = 'normal'
                this.options.options.scales.y.ticks.font.style = 'normal'
                this.options.options.scales.x.title.font.style = 'normal'
                this.options.options.scales.y.title.font.style = 'normal'
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.font.style = 'normal'
                    this.options.options.scales.r.pointLabels.font.style = 'normal'
                }
            }
            if (chartConfig.font_weight){
                this.options.options.plugins.legend.labels.font.weight = chartConfig.font_weight
                this.options.options.scales.x.ticks.font.weight = chartConfig.font_weight
                this.options.options.scales.y.ticks.font.weight = chartConfig.font_weight
                this.options.options.scales.x.title.font.weight = chartConfig.font_weight
                this.options.options.scales.y.title.font.weight = chartConfig.font_weight
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.font.weight = chartConfig.font_weight
                    this.options.options.scales.r.pointLabels.font.weight = chartConfig.font_weight
                }
            } else {
                this.options.options.plugins.legend.labels.font.weight  ='bold'
                this.options.options.scales.x.ticks.font.weight ='bold'
                this.options.options.scales.y.ticks.font.weight ='bold'
                this.options.options.scales.x.title.font.weight = 'bold'
                this.options.options.scales.y.title.font.weight = 'bold'
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.font.weight = 'bold'
                    this.options.options.scales.r.pointLabels.font.weight = 'bold'
                }
            }
            if (chartConfig.font_color){
                this.globalOptions.color = chartConfig.font_color
                this.options.options.plugins.legend.labels.color  = chartConfig.font_color
                this.options.options.scales.x.ticks.color = chartConfig.font_color
                this.options.options.scales.y.ticks.color = chartConfig.font_color
                this.options.options.scales.x.title.color = chartConfig.font_color
                this.options.options.scales.y.title.color = chartConfig.font_color
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.color = chartConfig.font_color
                    this.options.options.scales.r.pointLabels.color = chartConfig.font_color
                }
            } else {
                this.globalOptions.color = '#666'
                this.options.options.plugins.legend.labels.color  = '#666'
                this.options.options.scales.x.ticks.color = '#666'
                this.options.options.scales.y.ticks.color = '#666'
                this.options.options.scales.x.title.color = '#666'
                this.options.options.scales.y.title.color = '#666'
                if (chartConfig.type == 'chartjs_radar_chart' ||
                    chartConfig.type == 'chartjs_polar_area_chart'
                ){
                    this.options.options.scales.r.ticks.color = '#666'
                    this.options.options.scales.r.pointLabels.color = '#666'
                }
            }
            // Series
            if ( this.pieCharts.indexOf(chartConfig.type) == -1 && chartConfig.type != 'chartjs_bubble_chart') {
                var j = 0;
                for (var i in chartConfig.series_data) {
                    this.options.data.datasets[j].label = chartConfig.series_data[i].label;
                    chartConfig.series_data[i].color ? this.options.data.datasets[j].borderColor = chartConfig.series_data[i].color : null;
                    chartConfig.series_data[i].color ? this.options.data.datasets[j].backgroundColor = "rgba(" + hexToRgb(chartConfig.series_data[i].color).r + ", " + hexToRgb(chartConfig.series_data[i].color).g + ", " + hexToRgb(chartConfig.series_data[i].color).b + ", 0.2)" : null;
                    j++;
                }
                if (chartConfig.curve_type == 1) {
                    for (i in this.options.data.datasets) {
                        this.options.data.datasets[i].lineTension = 0.4;
                    }
                } else {
                    for (i in this.options.data.datasets) {
                        this.options.data.datasets[i].lineTension = 0;
                    }
                }
            }
            // Axes
            if (chartConfig.show_grid == 0) {
                this.options.options.scales.x.display = false;
                this.options.options.scales.y.display = false;
            } else {
                this.options.options.scales.x.display = true;
                this.options.options.scales.y.display = true;
            }
            chartConfig.horizontal_axis_label ? this.options.options.scales.x.title.text = chartConfig.horizontal_axis_label : null;
            chartConfig.vertical_axis_label ? this.options.options.scales.y.title.text = chartConfig.vertical_axis_label : null;
            if (chartConfig.vertical_axis_min != '') {
                this.options.options.scales.y.min = parseInt(chartConfig.vertical_axis_min)
            } else {
                if (['chartjs_pie_chart',
                    'chartjs_radar_chart',
                    'chartjs_doughnut_chart',
                    'chartjs_polar_area_chart',
                    'chartjs_bubble_chart'].includes(chartConfig.type)
                ) {
                    this.options.options.scales.y.beginAtZero = true;
                    this.options.options.scales.y.min = 0;
                } else {
                    this.options.options.scales.y.beginAtZero = false;
                    delete this.options.options.scales.y.min;
                }
            }
            chartConfig.vertical_axis_max != '' ? this.options.options.scales.y.max = parseInt(chartConfig.vertical_axis_max) : delete this.options.options.scales.y.max;

            // Title
            if (chartConfig.show_title == 1) {
                this.options.options.plugins.title.display = true;
                this.options.options.plugins.title.text = chartConfig.title
            } else {
                this.options.options.plugins.title.display = false;
            }
            chartConfig.title_position ? this.options.options.plugins.title.position = chartConfig.title_position : null;
            chartConfig.title_font_name ? this.options.options.plugins.title.font.family = chartConfig.title_font_name : null;
            if (chartConfig.title_font_style){
                this.options.options.plugins.title.font.style = chartConfig.title_font_style.includes('italic') ? 'italic' : 'normal';
            } else {
                this.options.options.plugins.title.font.style = 'normal'
            }
            if (chartConfig.title_font_weight){
                this.options.options.plugins.title.font.weight = chartConfig.title_font_weight;
            } else {
                this.options.options.plugins.title.font.wieght = 'bold';
            }
            chartConfig.title_font_color ? this.options.options.plugins.title.color = chartConfig.title_font_color : this.options.options.plugins.title.color = '#666';
            // Tooltip
            chartConfig.tooltip_enabled == 1 ? this.options.options.plugins.tooltip.enabled = true : this.options.options.plugins.tooltip.enabled = false;
            chartConfig.tooltip_background_color ? this.options.options.plugins.tooltip.backgroundColor = chartConfig.tooltip_background_color : this.options.options.plugins.tooltip.backgroundColor = 'rgba(0,0,0,0.8)';
            chartConfig.tooltip_border_radius ? this.options.options.plugins.tooltip.cornerRadius = parseInt(chartConfig.tooltip_border_radius) : null;
            if (chartConfig.tooltip_shared == 1) {
                this.options.options.plugins.tooltip.mode = 'index';
            } else {
                this.options.options.plugins.tooltip.mode = 'nearest';
                this.options.options.plugins.tooltip.intersect = true;
            }
            // Legend
            chartConfig.show_legend == 1 ? this.options.options.plugins.legend.display = true : this.options.options.plugins.legend.display = false;
            chartConfig.legend_position_cjs ? this.options.options.plugins.legend.position = chartConfig.legend_position_cjs : null;

        },
    };

    return obj;

};
