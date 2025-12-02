

/**
 * Adds overlay elements (such as evaluation periods and event markers) to a Plotly time series line chart.
 *
 * This function modifies the provided Plotly layout and data by injecting overlays that visually represent
 * special periods (e.g., evaluation periods) and event markers (vertical or horizontal lines) on the chart.
 * Overlays are constructed based on the configuration in `figureArguments` and the data in `dataToBePlotted`.
 * The function supports both shaded regions (for evaluation periods) and lines (for event markers on x or y axes).
 * After constructing the overlays, the function calls `Plotly.react` to update the chart with the overlays and main data traces.
 *
 * @function injectOverlays
 * @param {HTMLElement} plotDiv - The DOM element where the Plotly chart is rendered.
 * @param {Object} layout - The Plotly layout object, which will be modified to include overlay settings.
 * @param {Array} mainDataTraces - The main data traces to be plotted (typically lines).
 * @param {Object} figureArguments - An object containing user-specified arguments for overlays, such as:
 *   - 'EvaluationPeriod': 'on' to enable evaluation period overlay.
 *   - 'EvaluationPeriodStartDate', 'EvaluationPeriodEndDate': Date strings for the evaluation period.
 *   - 'EvaluationPeriodFillColor': Color for the evaluation period overlay.
 *   - 'EvaluationPeriodText': Label for the evaluation period.
 *   - 'EventMarkers': 'on' to enable event markers.
 *   - 'EventMarkersField': Number of event markers.
 *   - 'EventMarkersEventAxis{n}': 'x' or 'y' for each marker.
 *   - 'EventMarkersEventText{n}': Label for each marker.
 *   - 'EventMarkersEventColor{n}': Color for each marker.
 *   - 'EventMarkersEventDate{n}': Date for x-axis marker.
 *   - 'EventMarkersEventYValue{n}': Y value for y-axis marker.
 * @param {Object} dataToBePlotted - The data object containing arrays for each column, used for plotting overlays.
 *
 * @description
 * - If the evaluation period is enabled, a shaded region is added to the chart between the specified start and end dates.
 * - If event markers are enabled, vertical or horizontal lines are added at specified positions, with labels and colors.
 * - The function ensures overlays are drawn using the current y-axis range and x-axis data.
 * - The overlays are combined with the main data traces and rendered using `Plotly.react`.
 *
 * @modifies
 * - Modifies the `layout` object to ensure correct axis types.
 * - Updates the chart in `plotDiv` by calling `Plotly.react`.
 *
 * @example
 * injectOverlays(plotDiv, layout, mainDataTraces, figureArguments, dataToBePlotted);
 *
 * @returns {void}
 */
function injectOverlays(plotDiv, layout, mainDataTraces, figureArguments, dataToBePlotted) {
    if (!plotDiv || !layout || !layout.yaxis || !layout.yaxis.range) {
        console.warn("[Overlay] Missing layout or y-axis range");
        return;
    }

    const columnXHeader = figureArguments['XAxis'];
    const plotlyX = dataToBePlotted[columnXHeader];

    layout.xaxis = layout.xaxis || {};
    layout.xaxis.type = 'date';

    layout.yaxis = layout.yaxis || {};
    layout.yaxis.type = 'linear';

    const [yMin, yMax] = layout.yaxis.range || [0, 1];
    const overlays = [];  

    // === Evaluation Period ===
    if (figureArguments['EvaluationPeriod'] === 'on') {
        let start = figureArguments['EvaluationPeriodStartDate'];
        let end = figureArguments['EvaluationPeriodEndDate'];
        const startDate = new Date(start).toLocaleDateString();
        const endDate = new Date(end).toLocaleDateString();     
        const fillColor = (figureArguments['EvaluationPeriodFillColor'] || '#999') + '15';
        const EvalDisplayText = figureArguments['EvaluationPeriodText'];

        overlays.push({
            x: [start, end, end, start],
            y: [yMax, yMax, yMin, yMin],
            fill: 'toself',
            fillcolor: fillColor,
            type: 'scatter',
            mode: 'lines',
            line: { color: fillColor, width: 0 },
            // hoverinfo: EvalDisplayText,
            // hovertemplate:
            // `${startDate}<br>` +
            // `${endDate}<extra></extra>`,
            name: EvalDisplayText,
            showlegend: true,
            yaxis: 'y',
            xaxis: 'x'
        });

    }

    for (let i = 0; i <= Number(figureArguments['EventMarkersField']); i++) {
        // === Event Markers ===
        if (figureArguments[`EventMarkers`] === 'on') {
            let axisType = figureArguments[`EventMarkersEventAxis${i}`];
            const label = figureArguments[`EventMarkersEventText${i}`];
            const color = figureArguments[`EventMarkersEventColor${i}`] || '#000';

            if (axisType === 'x') {
                let date = figureArguments[`EventMarkersEventDate${i}`];
                overlays.push({
                    x: [date, date],
                    y: [yMin, yMax],
                    type: 'scatter',
                    mode: 'lines',
                    line: { color, width: 2 },
                    name: label,
                    showlegend: true,
                    yaxis: 'y',
                    xaxis: 'x',
                    hoverinfo: `x`,
                });
            }
            if (axisType === 'y') {
                let yValue = parseFloat(figureArguments[`EventMarkersEventYValue${i}`], 10);
                const yArray = Array(plotlyX.length).fill(yValue);
                overlays.push({
                    x: plotlyX,
                    y: yArray,
                    type: 'scatter',
                    mode: 'lines',
                    line: { color, width: 2 },
                    name: label,
                    showlegend: true,
                    yaxis: 'y',
                    xaxis: 'x',
                    hoverinfo: `${label} y`,
                });
            }
            if (axisType === 'x') {
                let date = figureArguments[`EventMarkersEventDate${i}`];
                layout.shapes = layout.shapes || [];
                layout.shapes.push({
                    type: 'line',
                    xref: 'x',
                    yref: 'paper',   // "paper" makes it stretch top-to-bottom
                    x0: date,
                    x1: date,
                    y0: 0,           // bottom edge of the plotting area
                    y1: 1,           // top edge of the plotting area
                    line: {
                        color: color,
                        width: 2,
                        dash: 'solid'
                    }
                });
            }
            if (axisType === 'y') {
                let yValue = parseFloat(figureArguments[`EventMarkersEventYValue${i}`], 10);
                // const yArray = Array(plotlyX.length).fill(yValue);
                layout.shapes = layout.shapes || [];
                layout.shapes.push({
                    type: 'line',
                    xref: 'paper',  // "paper" means 0–1 relative to full width
                    yref: 'y',
                    x0: 0,          // start at left edge of plot
                    x1: 1,          // end at right edge of plot
                    y0: yValue,
                    y1: yValue,
                    line: {
                        color: color,
                        width: 2
                    }
                });
            }
        }
        
    }
    Plotly.react(plotDiv, [...overlays, ...mainDataTraces], layout);
    //Plotly.react(plotDiv, [...mainDataTraces, ...overlays], layout);
}


/**
 * Asynchronously generates and renders a Plotly time series line chart with interactive features and overlays.
 *
 * This function loads the necessary Plotly library, retrieves figure configuration and data via REST API calls,
 * constructs the chart's data traces and layout based on user-specified arguments, and injects overlays such as
 * evaluation periods, event markers, standard deviation fills, error bars, mean and percentile lines. It supports
 * both admin and theme contexts for retrieving the figure's post ID.
 *
 * @async
 * @function producePlotlyLineFigure
 * @param {string} targetFigureElement - The ID of the DOM element where the chart should be rendered.
 * @param {string} interactive_arguments - A JSON string (array of key-value pairs) representing user-specified chart configuration.
 * @param {string|number|null} postID - The WordPress post ID for the figure. If null, the function attempts to retrieve it from the admin page.
 *
 * @description
 * - Ensures Plotly.js is loaded before proceeding.
 * - Retrieves the figure's configuration and data file path via a REST API call.
 * - Fetches the actual data to be plotted from the resolved file URL.
 * - Dynamically creates a container div for the Plotly chart and appends it to the target element.
 * - Constructs Plotly data traces for each line, including options for error bars, standard deviation fills, mean and percentile lines, and legend visibility.
 * - Configures the chart layout, including axis titles, bounds, grid lines, tick settings, and legend position.
 * - Renders the chart using Plotly.newPlot, then injects overlays (evaluation periods and event markers) using the `injectOverlays` function.
 * - Handles both admin and theme contexts for post ID resolution.
 * - Catches and logs errors related to script loading or network requests.
 *
 * @modifies
 * - Appends a new div to the target DOM element for rendering the chart.
 * - Updates the chart in the DOM with Plotly.
 *
 * @requires
 * - loadPlotlyScript: Ensures Plotly.js is loaded.
 * - waitForElementById: Waits for the target DOM element to be available.
 * - computeStandardDeviation: Computes standard deviation for error bars and fills.
 * - computePercentile: Computes percentiles for percentile lines.
 * - injectOverlays: Adds overlays such as evaluation periods and event markers to the chart.
 *
 * @example
 * // Render a Plotly line chart in the element with ID 'figure_123' using saved arguments and post ID 123:
 * producePlotlyLineFigure('figure_123', '[["XAxisTitle","Date"],["YAxisTitle","Value"],...]', 123);
 *
 * @throws {Error} Logs errors to the console if Plotly fails to load, network requests fail, or data cannot be parsed.
 *
 * @variables
 * - figureID: The resolved post ID for the figure.
 * - figureArguments: Object containing parsed chart configuration.
 * - rootURL: The root URL of the current site.
 * - figureRestCall: REST API endpoint for retrieving the figure's data file path.
 * - uploaded_path_json: Path to the uploaded data file.
 * - finalURL: Full URL to the data file.
 * - dataToBePlotted: The parsed data object used for plotting.
 * - plotlyDivID: The ID assigned to the Plotly chart container div.
 * - allLinesPlotly: Array of Plotly trace objects for each line and overlay.
 * - layout: Plotly layout object for axis, legend, and display settings.
 * - config: Plotly configuration object for rendering options.
 */
async function producePlotlyLineFigure(targetFigureElement, interactive_arguments, postID){
    try {
        await loadPlotlyScript(); // ensures Plotly is ready

        const rawField = interactive_arguments;
        ////console.log(rawField);
        const figureArguments = Object.fromEntries(JSON.parse(rawField));
        const rootURL = window.location.origin;

        //Rest call to get uploaded_path_json
        if (postID == null) {
            // ADMIN SIDE POST ID GRAB
            figureID = document.getElementsByName("post_ID")[0].value;
            ////console.log("figureID ADMIN:", figureID);
        }
        if (postID != null) {
            // THEME SIDE POST ID GRAB
            figureID = postID;
            ////console.log("figureID THEME:", figureID);
        }

        // in fetch_tab_info in script.js, await render_tab_info & await new Promise were added to give each run of producePlotlyLineFigure a chance to finish running before the next one kicked off
        // producePlotlyLineFigure used to fail here because the script was running before the previous iteration finished. 
        const figureRestCall = `${rootURL}/wp-json/wp/v2/figure/${figureID}?_fields=uploaded_path_json`;
        const response = await fetch(figureRestCall);

        const data = await response.json();
        const uploaded_path_json = data.uploaded_path_json;

        const restOfURL = "/wp-content" + uploaded_path_json.split("wp-content")[1];
        const finalURL = rootURL + restOfURL;
        
        const rawResponse = await fetch(finalURL);
        if (!rawResponse.ok) {
            throw new Error('Network response was not ok');
        }
        
        const responseJson = await rawResponse.json();
        const dataToBePlotted = responseJson.data;

        let newDiv = document.createElement('div');
        const plotlyDivID = `plotlyFigure${figureID}`;
        newDiv.id = plotlyDivID
        newDiv.classList.add("container", `figure_interactive${figureID}`);

        const targetElementparts = targetFigureElement.split("_");
        const targetElementpostID = targetElementparts[targetElementparts.length - 1];

        if (figureID == targetElementpostID) {

            ////console.log(`Figure ID ${figureID} matches target element post ID ${targetElementpostID}`) ;            
            // const targetElement = document.getElementById(targetFigureElement);
            const targetElement = await waitForElementById(targetFigureElement);
            targetElement.appendChild(newDiv);
            
            const numLines = figureArguments['NumberOfLines'];

            let plotlyX;
            let plotlyY;
            let columnXHeader;
            let columnYHeader;
            let targetLineColumn;
            let singleLinePlotly;
            let allLinesPlotly = [];
            let shapesForLayout = [];


            //Shows the grid lines if it is set to 'on' in the figure arguments
            const showGrid = figureArguments['showGrid'];
            if (showGrid === 'on') {
                var showGridBool = true;     
            } else {
                var showGridBool = false;     
            }

            //Shows the graph ticks on the outside if it is set to 'on' in the figure arguments
            const graphTicks = figureArguments['graphTicks'];
            if (graphTicks === 'on') {
                var graphTickModeBool = '';
                var graphTickPositionBool = '';       
            } else {
                var graphTickModeBool = 'auto';
                var graphTickPositionBool = 'outside';    
            }
            //console.log('graphTicks', graphTicks);            
            //console.log('graphTickModeBool', graphTickModeBool);
            //console.log('graphTickPositionBool', graphTickPositionBool);

            // Plotly figure production logic
            for (let i = 1; i <= figureArguments['NumberOfLines']; i++) {
                const targetLineColumn = 'Line' + i;
                const columnXHeader = figureArguments['XAxis'];
                const columnYHeader = figureArguments[targetLineColumn];

                const plotlyX = dataToBePlotted[columnXHeader];
                const plotlyY = dataToBePlotted[columnYHeader];

                const stdDev = computeStandardDeviation(plotlyY);

                // Line type, marker type, and marker size
                const lineType = figureArguments[targetLineColumn + 'LineType'];
                if (lineType === undefined) {
                    const lineType = 'solid';
                } 
                //console.log('lineType', lineType);
                const markerType = figureArguments[targetLineColumn + 'MarkerType'];
                const markerSize = parseInt(figureArguments[targetLineColumn + 'MarkerSize'], 10);

                //Shows the legend if it is set to 'on' in the figure arguments
                const showLegend = figureArguments[targetLineColumn + 'Legend'];
                if (showLegend === 'on') {
                    var showLegendBool = true;     
                } else {
                    var showLegendBool = false;     
                }

                //Connects gaps in line where there is missing data
                const connectGapsOpt = figureArguments[targetLineColumn + 'ConnectGaps'] === 'on';     

                //Show Standard error bars
                const showError = figureArguments[targetLineColumn + 'ErrorBars'];
                const showError_InputValuesOpt = figureArguments[targetLineColumn + 'ErrorBarsInputValues'];
                if (showError === 'on') {
                    //Error bars using Standard Deviation based on dataset Y-axis values (Auto Calculated)
                    if (showError_InputValuesOpt === 'auto') {
                        var errorBarY = {
                            type: 'data',
                            array: new Array(plotlyY.length).fill(stdDev),
                            visible: true,
                            color: figureArguments[targetLineColumn + 'ErrorBarsColor'],
                            thickness: 1.5,
                            width: 8
                        };   
                    }
                    //Error bars (values imported from spreadsheet per point in dataset)
                    //Do we want high and low bounds here?
                    if (showError_InputValuesOpt != 'auto') {
                        const showError_InputValue = dataToBePlotted[showError_InputValuesOpt].filter(item => item !== "");
                        var errorBarY = {
                            type: 'data',
                            array: showError_InputValue.map(val => parseFloat(val)), // Convert to number if needed
                            visible: true,
                            color: figureArguments[targetLineColumn + 'ErrorBarsColor'],
                            thickness: 1.5,
                            width: 8
                        }; 
                    }          
                }
                if (showError != 'on') {
                    var errorBarY = {};
                }

                // Main line with or w/o error bars
                const singleLinePlotly = {
                    x: plotlyX,
                    y: plotlyY,
                    mode: 'lines+markers',
                    type: 'scatter',
                    name: `${figureArguments[targetLineColumn + 'Title']}`,
                    showlegend: showLegendBool,
                    line: {
                        dash: lineType // e.g., 'dash', 'dot', etc.
                    },
                    marker: {
                        color: figureArguments[targetLineColumn + 'Color'],
                        symbol: markerType,
                        size: markerSize // Convert markerSize to integer

                    },
                    error_y: errorBarY,
                    connectgaps: connectGapsOpt, 
                    hovertemplate:
                        figureArguments['XAxisTitle'] + ': %{x}<br>' +
                        figureArguments['YAxisTitle'] + ': %{y}'
                };
                allLinesPlotly.push(singleLinePlotly);


                //Show Standard Deviation Lines
                const showSD = figureArguments[targetLineColumn + 'StdDev'];
                const showSD_InputValuesOpt = figureArguments[targetLineColumn + 'StdDevInputValues'];
                //Standard Deviation of dataset based on dataset Y-axis values (AutoCalculated)
                if (showSD == 'on' && showSD_InputValuesOpt === 'auto') {
                    const plotlyYSanitized = plotlyY.map(val => {
                        if (
                            val === null ||
                            val === undefined ||
                            val === "" ||
                            (typeof val === "string" && val.trim().toUpperCase() === "NA") ||
                            isNaN(val)
                        ) {
                            return 0;
                        }
                        return parseFloat(val);
                    });
                    const mean = plotlyYSanitized.reduce((a, b) => a + b, 0) / plotlyYSanitized.length;
                    //console.log('mean', mean);
                    //console.log('stdDev', stdDev);
                    const upperY = plotlyY.map(y => mean + stdDev);
                    const lowerY = plotlyY.map(y => mean - stdDev);
                    const filteredX = plotlyX.filter(item => item !== "");
                    // Shared legend group name
                    const legendGroupName = `${figureArguments[targetLineColumn + 'Title']} ±1 SD`;

                    // Upper SD line
                    const stdUpperLine = {
                        x: filteredX,
                        y: upperY,
                        type: 'scatter',
                        mode: 'lines',
                        name: legendGroupName,
                        legendgroup: legendGroupName,
                        line: {
                            dash: 'dash',
                            color: figureArguments[targetLineColumn + 'StdDevColor']
                        },
                        hoverinfo: 'skip',
                        showlegend: showLegendBool, // only the first one shows in legend
                        visible: true
                    };

                    // Lower SD line
                    const stdLowerLine = {
                        x: filteredX,
                        y: lowerY,
                        type: 'scatter',
                        mode: 'lines',
                        name: legendGroupName,      // same name, but hidden in legend
                        legendgroup: legendGroupName,
                        line: {
                            dash: 'dash',
                            color: figureArguments[targetLineColumn + 'StdDevColor']
                        },
                        hoverinfo: 'skip',
                        showlegend: false,          // hides duplicate legend entry
                        visible: true
                    };

                    // Push both to plot
                    allLinesPlotly.push(stdUpperLine, stdLowerLine);
                }
                //Standard Deviation (values imported from spreadsheet per point in dataset)
                //Do we want high and low bounds here?
                if (showSD == 'on' && showSD_InputValuesOpt != 'auto') {
                    const stdSingleValue = dataToBePlotted[showSD_InputValuesOpt].filter(item => item !== "NA").reduce((a, b) => a + b, 0) / dataToBePlotted[showSD_InputValuesOpt].length;
                    //console.log('stdSingleValue', stdSingleValue);
                    const plotlyYSanitized = plotlyY.map(val => {
                        if (
                            val === null ||
                            val === undefined ||
                            val === "" ||
                            (typeof val === "string" && val.trim().toUpperCase() === "NA") ||
                            isNaN(val)
                        ) {
                            return 0;
                        }
                        return parseFloat(val);
                    });
                    const mean = plotlyYSanitized.reduce((a, b) => a + b, 0) / plotlyY.length;
                    const upperY = plotlyY.map(y => mean + stdSingleValue);
                    const lowerY = plotlyY.map(y => mean - stdSingleValue);
                    const filteredX = plotlyX.filter(item => item !== "");
                    // Shared legend group name
                    const legendGroupName = `${figureArguments[targetLineColumn + 'Title']} ±1 SD`;

                    // Upper SD line
                    const stdUpperLine = {
                        x: filteredX,
                        y: upperY,
                        type: 'scatter',
                        mode: 'lines',
                        name: legendGroupName,
                        legendgroup: legendGroupName,
                        line: {
                            dash: 'dash',
                            color: figureArguments[targetLineColumn + 'StdDevColor']
                        },
                        hoverinfo: 'skip',
                        showlegend: showLegendBool, // only the first one shows in legend
                        visible: true
                    };

                    // Lower SD line
                    const stdLowerLine = {
                        x: filteredX,
                        y: lowerY,
                        type: 'scatter',
                        mode: 'lines',
                        name: legendGroupName,      // same name, but hidden in legend
                        legendgroup: legendGroupName,
                        line: {
                            dash: 'dash',
                            color: figureArguments[targetLineColumn + 'StdDevColor']
                        },
                        hoverinfo: 'skip',
                        showlegend: false,          // hides duplicate legend entry
                        visible: true
                    };

                    // Push both to plot
                    allLinesPlotly.push(stdUpperLine, stdLowerLine);
                }
                
                //Percentiles and Mean lines
                const showPercentiles = figureArguments[targetLineColumn + 'Percentiles'];
                const showMean = figureArguments[targetLineColumn + 'Mean'];
                const showMean_ValuesOpt = figureArguments[targetLineColumn + 'MeanField'];
                if (showPercentiles === 'on' || showMean === 'on') {

                    //Calculate Percentiles (Auto Calculated) based on dataset Y-axis values
                    //Do we want to be able to set high and low bounds per point here? (That wouldn't make sense to me)
                    const p10 = computePercentile(plotlyY, 10);
                    const p90 = computePercentile(plotlyY, 90);
                    const filteredX = plotlyX.filter(item => item !== "");
                    const xMinPercentile = Math.min(...filteredX);
                    const xMaxPercentile = Math.max(...filteredX);
                    if (showPercentiles === 'on') {
                        allLinesPlotly.push({
                            x: [xMinPercentile, xMaxPercentile],
                            y: [p10, p10],
                            mode: 'lines',
                            line: { dash: 'dot', color: figureArguments[targetLineColumn + 'Color'] + '60'},
                            name: `${figureArguments[targetLineColumn + 'Title']} 10th Percentile (Bottom)`,
                            type: 'scatter',
                            visible: true,
                            showlegend: false
                        });
                        allLinesPlotly.push({
                            x: [xMinPercentile, xMaxPercentile],
                            y: [p90, p90],
                            mode: 'lines',
                            line: { dash: 'dot', color: figureArguments[targetLineColumn + 'Color'] + '60'},
                            name: `${figureArguments[targetLineColumn + 'Title']} 10th & 90th Percentile`,
                            type: 'scatter',
                            visible: true,
                            showlegend: showLegendBool
                        });
                    }

                    // Calculate mean

                    //Calculate mean (Auto Calculated) based on dataset Y-axis values
                    if (showMean_ValuesOpt === 'auto' && showMean === 'on') {
                        let plotlyYSafeArray = plotlyY.map(value => value === "NA" ? 0 : value);
                        const mean = plotlyYSafeArray.reduce((a, b) => a + b, 0) / plotlyY.length;
                        // console.log('mean', mean);
                        // console.log('plotlyY', plotlyY);
                        const filteredX = plotlyX.filter(item => item !== "");
                        const xMin = Math.min(...filteredX);
                        const xMax = Math.max(...filteredX);
                        allLinesPlotly.push({
                            x: [xMin, xMax],
                            y: [mean, mean],
                            mode: 'lines',
                            line: { dash: 'solid', color: figureArguments[targetLineColumn + 'Color'] + '60'},
                            name: `${figureArguments[targetLineColumn + 'Title']} Mean`,
                            type: 'scatter',
                            visible: true,
                            showlegend: showLegendBool
                        });
                    }
                    //Get mean from the spreadsheet (values imported from spreadsheet per point in dataset)
                    if (showMean_ValuesOpt != 'auto' && showMean === 'on') {
                        const ExistingMeanValue = dataToBePlotted[showMean_ValuesOpt].filter(item => item !== "");
                        const mean = ExistingMeanValue.reduce((a, b) => a + b, 0) / ExistingMeanValue.length;
                        const filteredX = plotlyX.filter(item => item !== "");
                        const xMin = Math.min(...filteredX);
                        const xMax = Math.max(...filteredX);
                        allLinesPlotly.push({
                            x: [xMin, xMax],
                            y: [mean, mean],
                            mode: 'lines',
                            line: { dash: 'solid', color: figureArguments[targetLineColumn + 'Color'] + '60'},
                            name: `${figureArguments[targetLineColumn + 'Title']} Mean`,
                            type: 'scatter',
                            visible: true,
                            showlegend: showLegendBool
                        });
                    }
                }

            }

            //const container = document.getElementById(plotlyDivID); 

            //GRAPH DISPLAY SETTINGS
            var layout = {
                xaxis: {
                    title: {
                    text: figureArguments['XAxisTitle']
                    },
                    linecolor: 'black', 
                    linewidth: 1,
                    range: [figureArguments['XAxisLowBound'], figureArguments['XAxisHighBound']],
                    tickmode: graphTickModeBool,
                    ticks: graphTickPositionBool,
                    showgrid: showGridBool,                 
                },
                yaxis: {
                    title: {
                    text: figureArguments['YAxisTitle']
                    },
                    linecolor: 'black', 
                    linewidth: 1,
                    range: [figureArguments['YAxisLowBound'], figureArguments['YAxisHighBound']],
                    tickmode: graphTickModeBool,
                    ticks: graphTickPositionBool,
                    showgrid: showGridBool, 
                },
                legend: {
                    orientation: 'h',       // horizontal layout
                    y: 1.1,                 // position legend above the plot
                    x: 0.5,                 // center the legend
                    xanchor: 'center',
                    yanchor: 'bottom'
                },
                autosize: true,
                margin: { t: 60, b: 60, l: 60, r: 60 },
                hovermode: 'closest',
                //width: container.clientWidth, 
                //height: container.clientHeight,
                cliponaxis: true
                };
            

            const config = {
            responsive: true,  // This makes the plot resize with the browser window
            renderer: 'svg',
            displayModeBar: true,
            displaylogo: false,
            modeBarButtonsToRemove: [
                'zoom2d', 'lasso2d', 'autoScale2d',
                'hoverClosestCartesian', 'hoverCompareCartesian' //'toImage', 'resetScale2d', 'select2d'
            ]
            };

            // Set up the plotlyDiv (The div the the plot will be rendered in)
            const plotDiv = document.getElementById(plotlyDivID);         
            plotDiv.style.setProperty("width", "100%", "important");
            plotDiv.style.setProperty("max-width", "none", "important");
            //plotDiv.style.border = "1px solid black";
            //plotDiv.style.display = "inline-block";
                         
            // Create the plot with all lines
            // await Plotly.newPlot(plotlyDivID, allLinesPlotly, layout, config);
            await Plotly.newPlot(plotDiv, allLinesPlotly, layout, config).then(() => {
                // After the plot is created, inject overlays if any, this is here because you can only get overlays that span the entire yaxis after the graph has been rendered.
                // You need the specific values for the entire yaxis
                injectOverlays(plotDiv, layout, allLinesPlotly, figureArguments, dataToBePlotted);
            });
            Plotly.Plots.resize(plotDiv)

        } else {}

    } catch (error) {
        console.error('Error loading scripts:', error);
    }
}


/**
 * Loads and merges default interactive line arguments with the current arguments,
 * ensuring proper handling of line-specific keys and other configuration options.
 * Updates the value of the "figure_interactive_arguments" field and displays
 * the line fields accordingly.
 *
 * @function loadDefaultInteractiveLineArguments
 * @param {Object} jsonColumns - JSON object representing the columns of the line chart.
 *
 * @description
 * This function is designed to handle the merging of default and current arguments
 * for an interactive line chart. It ensures that line-specific keys are updated based
 * on the number of lines specified, while also preserving the original order of keys
 * in the current arguments. Non-line-specific keys are always updated with default values.
 * The merged arguments are written back to the "figure_interactive_arguments" field
 * as a JSON string and used to display the line fields.
 *
 * The function uses several helper functions:
 * - `safeParseJSON(s)`: Safely parses a JSON string, returning `null` if parsing fails.
 * - `pairsToObject(pairs)`: Converts an array of key-value pairs to an object.
 * - `kvStringToObject(str)`: Converts a key-value string to an object.
 * - `toObjectFlexible(s)`: Converts a string to an object, supporting JSON and key-value formats.
 * - `toPairsFlexible(s)`: Converts a string to an array of key-value pairs, supporting JSON and key-value formats.
 * - `objectToPairsPreserveOrder(obj, currentPairs)`: Converts an object to an array of key-value pairs,
 *    preserving the order of keys from the current pairs.
 *
 * @modifies
 * - Reads and updates the value of the "figure_interactive_arguments" field in the DOM.
 * - Reads the value of the "NumberOfLines" input field to determine the number of lines.
 * - Calls `displayLineFields` to update the line fields in the UI.
 *
 * @variables
 * - `field`: The DOM element representing the "figure_interactive_arguments" field.
 * - `currentStr`: The current value of the "figure_interactive_arguments" field.
 * - `defaultsStr`: The default arguments for the interactive line chart.
 * - `currentPairs`: The current arguments as an array of key-value pairs.
 * - `currentObj`: The current arguments as an object.
 * - `defaultsObj`: The default arguments as an object.
 * - `numEl`: The DOM element representing the "NumberOfLines" input field.
 * - `numberOfLines`: The number of lines specified in the "NumberOfLines" input field.
 * - `mergedPairs`: The merged arguments as an array of key-value pairs.
 * - `mergedPairs_string`: The merged arguments as a JSON string.
 *
 * @returns {void}
 *
 * @example
 * // Assuming `argumentsDefaultsLine.interactive_line_arguments` contains default arguments
 * // and the "figure_interactive_arguments" field exists in the DOM:
 * loadDefaultInteractiveLineArguments(jsonColumns);
 *
 * @throws {Error} This function does not throw errors but may fail silently if
 * required DOM elements are not present.
 *
 * @global
 * - `argumentsDefaultsLine` (optional): A global object containing default arguments
 *   for the interactive line chart.
 */
function loadDefaultInteractiveLineArguments (jsonColumns) {
    // ---------- helpers ----------
    function safeParseJSON(s) { try { return JSON.parse(s); } catch { return null; } }

    function pairsToObject(pairs) {
        const o = {};
        if (Array.isArray(pairs)) {
        for (const p of pairs) {
            if (Array.isArray(p) && p.length >= 2) o[String(p[0])] = String(p[1] ?? "");
        }
        }
        return o;
    }
    function kvStringToObject(str) {
        const o = {};
        if (!str) return o;
        for (const part of str.split(/[;,]/)) {
        const [k, v] = part.split(/[:=]/).map(s => (s || "").trim());
        if (k) o[k] = v ?? "";
        }
        return o;
    }
    function toObjectFlexible(s) {
        if (!s) return {};
        const asJSON = safeParseJSON(s);
        if (asJSON && typeof asJSON === "object") {
        return Array.isArray(asJSON) ? pairsToObject(asJSON) : asJSON;
        }
        return kvStringToObject(s);
    }
    function toPairsFlexible(s) {
        const asJSON = safeParseJSON(s);
        if (Array.isArray(asJSON)) return asJSON;
        const obj = toObjectFlexible(s);
        return Object.entries(obj).map(([k, v]) => [k, v]);
    }
    // preserve original order from currentPairs; append unseen keys at the end
    function objectToPairsPreserveOrder(obj, currentPairs) {
        const seen = new Set();
        const out = [];
        for (const [k] of currentPairs) {
        if (!seen.has(k) && k in obj) {
            out.push([k, String(obj[k] ?? "")]);
            seen.add(k);
        }
        }
        // append any remaining keys (e.g., required keys not in original)
        for (const k of Object.keys(obj)) {
        if (!seen.has(k)) out.push([k, String(obj[k] ?? "")]);
        }
        return out;
    }

    // ---------- main ----------
    const field = document.getElementsByName("figure_interactive_arguments")[0];
    if (!field) return;

    const currentStr  = field.value || "";
    const defaultsStr = (typeof argumentsDefaultsLine !== "undefined" && argumentsDefaultsLine.interactive_line_arguments)
                            ? argumentsDefaultsLine.interactive_line_arguments : "";


    // Parse both to objects and keep original pair order from current
    const currentPairs   = toPairsFlexible(currentStr);
    const currentObj     = toObjectFlexible(currentStr);
    const defaultsObj    = toObjectFlexible(defaultsStr);

    // How many lines should be considered?
    const numEl = document.getElementById("NumberOfLines");
    const numberOfLines = numEl && numEl.value ? parseInt(numEl.value, 10) : 0;
    if (numberOfLines > 0) currentObj.NumberOfLines = String(numberOfLines);

    // Overwrite ONLY keys that:
    //  - start with Line1..Line{N}, AND
    //  - already exist in currentObj, AND
    //  - also exist in defaultsObj
    if (numberOfLines > 0) {
        const linePrefixes = Array.from({ length: numberOfLines }, (_, i) => `Line${i + 1}`);
        for (const key of Object.keys(currentObj)) {
        const isWithinLines = linePrefixes.some(prefix => key.startsWith(prefix));
        if (isWithinLines && (key in defaultsObj)) {
            currentObj[key] = defaultsObj[key];
        }
        }
    }

    // Ensure/overwrite these non-line keys regardless of line count
    currentObj.showGrid    = (defaultsObj.showGrid    ?? "on");
    currentObj.graphTicks  = (defaultsObj.graphTicks  ?? "on");
    currentObj.XAxisFormat = (defaultsObj.XAxisFormat ?? "YYYY");

    // Convert back to array-of-pairs, preserving the original order from currentPairs
    const mergedPairs = objectToPairsPreserveOrder(currentObj, currentPairs);

    // Write back EXACTLY as array-of-pairs JSON
    let mergedPairs_string = JSON.stringify(mergedPairs);

    // console.log('interactive_arguments', currentStr);
    // console.log('default_interactive_line_arguments', defaultsStr);
    // console.log('mergedPairs_string', mergedPairs_string);

    document.getElementsByName("figure_interactive_arguments")[0].value = mergedPairs_string;

    displayLineFields(numberOfLines, jsonColumns, mergedPairs_string);

    return;
    
}

/**
 * Dynamically generates and appends form fields for configuring Plotly time series line chart parameters in the UI.
 *
 * This function creates a set of HTML form controls (checkboxes, text inputs, color pickers, and select dropdowns)
 * for customizing various aspects of a Plotly time series line chart, such as grid lines, axis titles, axis bounds,
 * number of lines, axis date format, and line-specific options (color, type, marker, error bars, standard deviation, mean, percentiles, legend, etc.).
 * The generated fields are appended to the element with ID 'graphGUI'.
 * The function also prepopulates field values using the provided interactive arguments and attaches event listeners
 * to update the underlying data model when fields are changed.
 *
 * @function plotlyLineParameterFields
 * @param {Object} jsonColumns - An object representing available data columns, where keys are column identifiers and values are column names.
 * @param {Object|string} interactive_arguments - An object or JSON string containing previously saved form field values, used to prepopulate the GUI fields.
 *
 * @description
 * The function performs the following steps:
 * 1. Creates a container div for the parameter fields.
 * 2. Adds checkboxes for toggling grid lines and graph ticks.
 * 3. Adds input fields for X and Y axis titles and their low/high bounds.
 * 4. Adds a select dropdown for the number of lines to be plotted (1–14).
 * 5. Adds a select dropdown for the X axis date format.
 * 6. Appends all generated fields to the 'graphGUI' element in the DOM.
 * 7. Calls `displayLineFields` to generate additional line-specific configuration fields based on the selected number of lines.
 * 8. Attaches event listeners to all fields to update the hidden input storing the configuration as a JSON string.
 *
 * @modifies
 * - Appends a new div with ID 'secondaryGraphFields' to the element with ID 'graphGUI'.
 * - Updates the value of the hidden input field named 'figure_interactive_arguments' when any field is changed.
 * - Calls `displayLineFields` to update line-specific fields dynamically.
 *
 * @requires
 * - fillFormFieldValues: Function to retrieve saved values for form fields.
 * - logFormFieldValues: Function to update the hidden input with current form values.
 * - displayLineFields: Function to generate line-specific configuration fields.
 *
 * @listens change - Updates the hidden input and UI when any field is changed.
 *
 * @example
 * // Example usage:
 * const jsonColumns = { col1: "Column 1", col2: "Column 2" };
 * const interactive_arguments = { XAxisTitle: "Year", NumberOfLines: 2 };
 * plotlyLineParameterFields(jsonColumns, interactive_arguments);
 *
 * @global
 * - Assumes the existence of a DOM element with ID 'graphGUI'.
 * - Assumes the existence of a hidden input named 'figure_interactive_arguments'.
 */
function plotlyLineParameterFields(jsonColumns, interactive_arguments){
  let newDiv = document.createElement("div");
  newDiv.id = 'secondaryGraphFields';
  const targetElement = document.getElementById('graphGUI');

  let newRow;
  let newColumn1;
  let newColumn2;


  //Add checkboxes for showgrid and graphTicks
    const features = ["showGrid", "graphTicks"];
    const featureNames = ["Show X&Y Lines on Grid", "Remove Outside Graph Ticks"];
    for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const featureName = featureNames[i];

        let newRow = document.createElement("div");
        newRow.classList.add("row", "fieldPadding");

        let newColumn1 = document.createElement("div");
        newColumn1.classList.add("col-3");
        let newColumn2 = document.createElement("div");
        newColumn2.classList.add("col");

        let label = document.createElement("label");
        label.for = feature;
        label.innerHTML = `${featureName}`;
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = feature;
        checkbox.name = "plotFields";

        let fieldValueSaved = fillFormFieldValues(checkbox.id, interactive_arguments);
        checkbox.value = fieldValueSaved === 'on' ? 'on' : "";
        checkbox.checked = fieldValueSaved === 'on';

        // Toggle visibility dynamically
        checkbox.addEventListener('change', function () {
            checkbox.value = checkbox.checked ? 'on' : "";
            logFormFieldValues();
        });

        newColumn1.appendChild(label);
        newColumn2.appendChild(checkbox);
        newRow.append(newColumn1, newColumn2);
        newDiv.append(newRow);

        newRow.style.display = "none";
        
    }

  // Create input fields for X and Y Axis Titles
  const axisTitleArray = ["X", "Y"];

  axisTitleArray.forEach((axisTitle) => {
      newRow = document.createElement("div");
      newRow.classList.add("row", "fieldPadding");
      newColumn1 = document.createElement("div");
      newColumn1.classList.add("col-3");   
      newColumn2 = document.createElement("div");
      newColumn2.classList.add("col");

      let labelInputAxisTitle = document.createElement("label");
      labelInputAxisTitle.for = axisTitle + "AxisTitle";
      labelInputAxisTitle.innerHTML = axisTitle + " Axis Title";
      let inputAxisTitle = document.createElement("input");
      inputAxisTitle.id = axisTitle + "AxisTitle";
      inputAxisTitle.name = "plotFields";
      inputAxisTitle.size = "70";
      fieldValueSaved = fillFormFieldValues(inputAxisTitle.id, interactive_arguments);
      if (fieldValueSaved != undefined){
          inputAxisTitle.value = fieldValueSaved;
      }
      inputAxisTitle.addEventListener('change', function() {
          logFormFieldValues();
      });
      newColumn1.appendChild(labelInputAxisTitle);
      newColumn2.appendChild(inputAxisTitle);
      newRow.append(newColumn1, newColumn2);
      newDiv.append(newRow);    

      const rangeBound =["Low", "High"];
      rangeBound.forEach((bound) => {
          newRow = document.createElement("div");
          newRow.classList.add("row", "fieldPadding");
          newColumn1 = document.createElement("div");
          newColumn1.classList.add("col-3");   
          newColumn2 = document.createElement("div");
          newColumn2.classList.add("col");

          let labelBound = document.createElement("label");
          labelBound.for =  axisTitle + bound + "Bound";
          labelBound.innerHTML = axisTitle + " Axis, " + bound + " Bound";
          let inputBound = document.createElement("input");
          inputBound.id = axisTitle + "Axis" + bound + "Bound";
          inputBound.name = "plotFields";
          inputBound.type = "number";
          fieldValueSaved = fillFormFieldValues(inputBound.id, interactive_arguments);
          if (fieldValueSaved != undefined){
              inputBound.value = fieldValueSaved;
          }
          inputBound.addEventListener('change', function() {
              logFormFieldValues();
          });
          newColumn1.appendChild(labelBound);
          newColumn2.appendChild(inputBound);
          newRow.append(newColumn1, newColumn2);
          newDiv.append(newRow); 
      });

  });



  // Create select field for number of lines to be plotted
  let labelSelectNumberLines = document.createElement("label");
  labelSelectNumberLines.for = "NumberOfLines";
  labelSelectNumberLines.innerHTML = "Number of Lines to Be Plotted";
  let selectNumberLines = document.createElement("select");
  selectNumberLines.id = "NumberOfLines";
  selectNumberLines.name = "plotFields";
  selectNumberLines.addEventListener('change', function() {
      displayLineFields(selectNumberLines.value, jsonColumns, interactive_arguments) });
  selectNumberLines.addEventListener('change', function() {
          logFormFieldValues();
      });

  for (let i = 1; i < 15; i++){
      let selectNumberLinesOption = document.createElement("option");
      selectNumberLinesOption.value = i;
      selectNumberLinesOption.innerHTML = i; 
      selectNumberLines.appendChild(selectNumberLinesOption);
  }
  fieldValueSaved = fillFormFieldValues(selectNumberLines.id, interactive_arguments);
  if (fieldValueSaved != undefined){
      selectNumberLines.value = fieldValueSaved;
  }
  newRow = document.createElement("div");
  newRow.classList.add("row", "fieldPadding");
  newColumn1 = document.createElement("div");
  newColumn1.classList.add("col-3");   
  newColumn2 = document.createElement("div");
  newColumn2.classList.add("col");

  newColumn1.appendChild(labelSelectNumberLines);
  newColumn2.appendChild(selectNumberLines);
  newRow.append(newColumn1, newColumn2);
  newDiv.append(newRow);


  //X Axis Date Format
  let labelSelectXAxisFormat = document.createElement("label");
  labelSelectXAxisFormat.for = "XAxisFormat";
  labelSelectXAxisFormat.innerHTML = "X Axis Date Format";
  let selectXAxisFormat = document.createElement("select");
  selectXAxisFormat.id = "XAxisFormat";
  selectXAxisFormat.name = "plotFields";
  selectXAxisFormat.addEventListener('change', function() {
      logFormFieldValues();
  });

  const dateFormats =["YYYY", "YYYY-MM-DD"];

  dateFormats.forEach((dateFormat) => {
      let selectXAxisFormatOption = document.createElement("option");
      selectXAxisFormatOption.value = dateFormat;
      selectXAxisFormatOption.innerHTML = dateFormat; 
      selectXAxisFormat.appendChild(selectXAxisFormatOption);
  });
  fieldValueSaved = fillFormFieldValues(selectXAxisFormat.id, interactive_arguments);
  if (fieldValueSaved != undefined){
      selectXAxisFormat.value = fieldValueSaved;
  }

  newRow = document.createElement("div");
  newRow.classList.add("row", "fieldPadding");
  newColumn1 = document.createElement("div");
  newColumn1.classList.add("col-3");   
  newColumn2 = document.createElement("div");
  newColumn2.classList.add("col");

  newColumn1.appendChild(labelSelectXAxisFormat);
  newColumn2.appendChild(selectXAxisFormat);
  newRow.append(newColumn1, newColumn2);
  newDiv.append(newRow);

  let newHR = document.createElement("hr");
  newHR.style = "margin-top:15px";
  newDiv.append(newHR);        

  targetElement.appendChild(newDiv);

  // Run display line fields
  displayLineFields(selectNumberLines.value, jsonColumns, interactive_arguments);
}


/**
 * Dynamically generates and appends form fields for configuring line-specific and overlay parameters
 * for a Plotly time series line chart in the UI.
 *
 * This function creates a set of HTML form controls for each line to be plotted, including dropdowns for
 * selecting data columns, line and marker styles, and checkboxes for enabling features such as legend display,
 * connecting gaps, mean lines, standard deviation fills, error bars, and percentile lines. It also generates
 * controls for overlays such as evaluation periods and event markers, including their specific configuration fields.
 * The generated fields are appended to the element with ID 'graphGUI'.
 * The function prepopulates field values using the provided interactive arguments and attaches event listeners
 * to update the underlying data model when fields are changed.
 *
 * @function displayLineFields
 * @param {number} numLines - The number of lines to generate configuration fields for.
 * @param {Object} jsonColumns - An object representing available data columns, where keys are column identifiers and values are column names.
 * @param {Object|string} interactive_arguments - An object or JSON string containing previously saved form field values, used to prepopulate the GUI fields.
 *
 * @description
 * The function performs the following steps:
 * 1. Removes any existing line assignment container from the DOM.
 * 2. For each line, generates dropdowns for selecting the data column, line title, color, line type, marker type, and marker size.
 * 3. Adds checkboxes for enabling/disabling legend, connecting gaps, mean line, standard deviation fill, error bars, and percentile lines.
 * 4. For features that require additional configuration (mean, error bars, standard deviation), generates dropdowns for selecting the source column and color pickers.
 * 5. Generates controls for overlays, including evaluation period and event markers, with their own configuration fields (dates, colors, labels, axis, etc.).
 * 6. Adds a button to apply default line styles to all lines.
 * 7. Appends all generated fields to the 'graphGUI' element in the DOM.
 * 8. Prepopulates all fields using the provided interactive arguments and attaches event listeners to update the hidden input storing the configuration as a JSON string.
 *
 * @modifies
 * - Appends a new div with ID 'assignColumnsToPlot' to the element with ID 'graphGUI'.
 * - Updates the value of the hidden input field named 'figure_interactive_arguments' when any field is changed.
 *
 * @requires
 * - fillFormFieldValues: Function to retrieve saved values for form fields.
 * - logFormFieldValues: Function to update the hidden input with current form values.
 * - loadDefaultInteractiveLineArguments: Function to apply default line styles.
 *
 * @listens change - Updates the hidden input and UI when any field is changed.
 *
 * @example
 * // Example usage:
 * const jsonColumns = { col1: "Column 1", col2: "Column 2" };
 * const interactive_arguments = { XAxisTitle: "Year", NumberOfLines: 2 };
 * displayLineFields(2, jsonColumns, interactive_arguments);
 *
 * @global
 * - Assumes the existence of a DOM element with ID 'graphGUI'.
 * - Assumes the existence of a hidden input named 'figure_interactive_arguments'.
 */
function displayLineFields (numLines, jsonColumns, interactive_arguments) {
  let assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
  // If the element exists
  if (assignColumnsToPlot) {
      // Remove the scene window
      assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
  }

  if (numLines > 0) {
      let newDiv = document.createElement("div");
      newDiv.id = "assignColumnsToPlot";

      //"EvaluationPeriod" & "EventMarkers"
      const features = ["EvaluationPeriod", "EventMarkers"];
      const featureNames = ["Evaluation Period", "Event Markers"];
      for (let i = 0; i < features.length; i++) {
        const feature = features[i];
        const featureName = featureNames[i];

        let newRow = document.createElement("div");
        newRow.classList.add("row", "fieldPadding");

        let newColumn1 = document.createElement("div");
        newColumn1.classList.add("col-3");
        let newColumn2 = document.createElement("div");
        newColumn2.classList.add("col");

        let label = document.createElement("label");
        label.for = feature;
        label.innerHTML = `${featureName}`;
        let checkbox = document.createElement("input");
        checkbox.type = "checkbox";
        checkbox.id = feature;
        checkbox.name = "plotFields";

        let fieldValueSaved = fillFormFieldValues(checkbox.id, interactive_arguments);
        checkbox.value = fieldValueSaved === 'on' ? 'on' : "";
        checkbox.checked = fieldValueSaved === 'on';

        newColumn1.appendChild(label);
        newColumn2.appendChild(checkbox);
        newRow.append(newColumn1, newColumn2);
        newRow.style.marginTop = "20px";
        newRow.style.marginBottom = "20px"
        newDiv.append(newRow);
        

        // === Add dropdowns for feature-specific data ===
        if (["EvaluationPeriod", "EventMarkers"].includes(feature)) {
            const dropdownContainer = document.createElement("div");
            dropdownContainer.classList.add("row", "fieldPadding");

            const dropdownLabelCol = document.createElement("div");
            dropdownLabelCol.classList.add("col-3");
            const dropdownInputCol = document.createElement("div");
            dropdownInputCol.classList.add("col");

            function createDropdown(labelText, selectId) {
                const label = document.createElement("label");
                label.innerHTML = labelText;
                const select = document.createElement("select");
                select.id = selectId;
                select.name = "plotFields";

                if (feature === "EventMarkers") {

                    for (let col of [1, 2, 3, 4, 5, 6]) {
                        const opt = document.createElement("option");
                        opt.value = col;
                        opt.innerHTML = col;
                        select.appendChild(opt);
                    }

                    const saved = fillFormFieldValues(select.id, interactive_arguments);
                    if (saved) select.value = saved;

                    select.addEventListener("change", logFormFieldValues);
                    return { label, select };
                }
            }

            function createDatefield(labelText, inputId) {
                const label = document.createElement("label");
                label.textContent = labelText;
                label.htmlFor = inputId; // Link label to input

                const input = document.createElement("input"); // Correct element
                input.type = "date";
                input.id = inputId;
                input.name = "plotFields";

                const saved = fillFormFieldValues(input.id, interactive_arguments);
                if (saved) input.value = saved;

                input.addEventListener("change", logFormFieldValues);
                return { label, input };
            }

            function createTextfield(labelText, inputId) {
                const label = document.createElement("label");
                label.textContent = labelText;
                label.htmlFor = inputId; // Link label to input

                const input = document.createElement("input"); // Correct element
                input.type = "text";
                input.id = inputId;
                input.name = "plotFields";
                input.style.width = "200px";


                const saved = fillFormFieldValues(input.id, interactive_arguments);
                if (saved) input.value = saved;

                input.addEventListener("change", logFormFieldValues);
                return { label, input };
            }

            function createColorfield(labelText, inputId) {
                const label = document.createElement("label");
                label.textContent = labelText;
                label.htmlFor = inputId; // Link label to input

                const input = document.createElement("input"); // Correct element
                input.type = "color";
                input.id = inputId;
                input.name = "plotFields";

                const saved = fillFormFieldValues(input.id, interactive_arguments);
                if (saved) input.value = saved;

                input.addEventListener("change", logFormFieldValues);
                return { label, input };
            }

            const controls = [];

            if (feature === "EvaluationPeriod") {
                const { label: labelStartDate, input: StartDateValues } = createDatefield(`Start Date`,  feature + "StartDate");
                const { label: labelEndDate, input: EndDateValues } = createDatefield('End Date', feature + "EndDate");
                const { label: labelColor, input: ColorValue } = createColorfield(`Fill Color`,  feature + "FillColor");
                const { label: textLabel, input: textInput }   = createTextfield(`Display Text`, feature + "Text");
                controls.push(labelStartDate, document.createElement('br'), StartDateValues, document.createElement('br'), document.createElement('br'), labelEndDate, document.createElement('br'), EndDateValues, document.createElement('br'), document.createElement('br'), labelColor, document.createElement('br'), ColorValue, document.createElement('br'), document.createElement('br'), textLabel, document.createElement('br'), textInput, document.createElement('br'));
            }

            if (feature === "EventMarkers") {
                const { label, select } = createDropdown("Number of Event Markers", feature + "Field");
                controls.push(label, select);
  

                // A wrapper that we'll (re)fill with the N sets of fields
                const wrapper = document.createElement("div");
                wrapper.id = feature + "FieldsWrapper";
                controls.push(wrapper);

                const renderEventMarkerFields = (n) => {
                wrapper.innerHTML = ""; // Clear previous

                for (let i = 0; i < n; i++) {
                    // === Axis Selector ===
                    const axisLabel = document.createElement("label");
                    axisLabel.textContent = `Event Marker Axis ${i + 1}`;
                    const axisSelect = document.createElement("select");
                    axisSelect.id = `${feature}EventAxis${i}`;
                    axisSelect.name = "plotFields";

                    ["x", "y"].forEach(axis => {
                    const opt = document.createElement("option");
                    opt.value = axis;
                    opt.textContent = axis.toUpperCase() + " Axis";
                    axisSelect.appendChild(opt);
                    });
                    let savedAxis = fillFormFieldValues(axisSelect.id, interactive_arguments);
                    if (savedAxis) axisSelect.value = savedAxis;

                    // === Shared Inputs ===
                    const { label: textLabel, input: textInput }   = createTextfield(`Display Text ${i + 1}`, `${feature}EventText${i}`);
                    const { label: colorLabel, input: colorInput } = createColorfield(`Line Color ${i + 1}`,  `${feature}EventColor${i}`);
                    fillFormFieldValues(textInput.id, interactive_arguments);
                    fillFormFieldValues(colorInput.id, interactive_arguments);

                    // === X-axis Fields ===
                    const xWrapper = document.createElement("div");
                    const { label: dateLabel, input: dateInput } = createDatefield(`Event Date ${i + 1} (X-Axis)`, `${feature}EventDate${i}`);
                    fillFormFieldValues(dateInput.id, interactive_arguments);
                    xWrapper.append(dateLabel, document.createElement("br"), dateInput, document.createElement("br"));

                    // === Y-axis Fields ===
                    const yWrapper = document.createElement("div");
                    const { label: yLabel, input: yInput } = createTextfield(`Event Y Value ${i + 1}`, `${feature}EventYValue${i}`);
                    fillFormFieldValues(yInput.id, interactive_arguments);
                    yWrapper.append(yLabel, document.createElement("br"), yInput, document.createElement("br"));

                    // === Container & Toggle Logic ===
                    const block = document.createElement("div");
                    block.append(
                    document.createElement("hr"),
                    axisLabel, document.createElement("br"), axisSelect, document.createElement("br"), document.createElement("br"),
                    xWrapper, yWrapper, document.createElement("br"),
                    textLabel, document.createElement("br"), textInput, document.createElement("br"),document.createElement("br"),
                    colorLabel, document.createElement("br"), colorInput, document.createElement("br")
                    );

                    // Handle visibility
                    const toggleAxisFields = (val) => {
                    xWrapper.style.display = val === 'x' ? "block" : "none";
                    yWrapper.style.display = val === 'y' ? "block" : "none";
                    };
                    toggleAxisFields(axisSelect.value); // Initial state
                    axisSelect.addEventListener("change", (e) => {
                    toggleAxisFields(e.target.value);
                    logFormFieldValues();
                    });

                    wrapper.appendChild(block);
                }
                };

                // Initial render using saved or current value
                const initialN = parseInt(select.value, 10) || 0;
                renderEventMarkerFields(initialN);

                // Re-render on change
                select.addEventListener("change", (e) => {
                    const n = parseInt(e.target.value, 10) || 0;
                    renderEventMarkerFields(n);
                });
            }

            // Initially hide the dropdown container
            dropdownContainer.style.display = checkbox.checked ? "flex" : "none";

            controls.forEach(control => dropdownInputCol.appendChild(control));
            dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
            newDiv.append(dropdownContainer);

            // Toggle visibility dynamically
            checkbox.addEventListener('change', function () {
                checkbox.value = checkbox.checked ? 'on' : "";
                dropdownContainer.style.display = checkbox.checked ? "flex" : "none";
                logFormFieldValues();
            });
        } else {
            checkbox.addEventListener('change', function () {
                checkbox.value = checkbox.checked ? 'on' : "";
                logFormFieldValues();
            });
        }
        }
        let newHR = document.createElement("hr");
        newHR.style = "margin-top:15px";
        newDiv.append(newHR); 
        
        
        // Create the button for default styles
        let labelApplyDefaults = document.createElement("label");
        labelApplyDefaults.for = "ApplyLineDefaults";
        labelApplyDefaults.innerHTML = "Apply Custom Line Styles to All Lines";

        let btnApplyDefaults = document.createElement("button");
        btnApplyDefaults.id = "ApplyLineDefaults";
        btnApplyDefaults.type = "button"; // prevent accidental form submit
        btnApplyDefaults.classList.add("button", "button-primary"); // WP admin button style
        btnApplyDefaults.innerHTML = "Click to Apply Styles";

        // Add event listener
        btnApplyDefaults.addEventListener('click', function() {
            // Call your function here
            loadDefaultInteractiveLineArguments(jsonColumns, interactive_arguments);
        });

        // Wrap in row/col just like your select
        let newRowBtn = document.createElement("div");
        newRowBtn.classList.add("row", "fieldPadding");
        let newColumn1Btn = document.createElement("div");
        newColumn1Btn.classList.add("col-3");
        let newColumn2Btn = document.createElement("div");
        newColumn2Btn.classList.add("col");
        newColumn1Btn.appendChild(labelApplyDefaults);
        newColumn2Btn.appendChild(btnApplyDefaults);
        newRowBtn.append(newColumn1Btn, newColumn2Btn);
        newDiv.append(newRowBtn);

      let fieldLabels = [["XAxis", "X Axis Column"]];
      for (let i = 1; i <= numLines; i++){
          fieldLabels.push(["Line" + i, "Line " + i + " Column"]);
      }

      fieldLabels.forEach((fieldLabel) => {
          //Select the data source from dropdown menu  
          let labelSelectColumn = document.createElement("label");
          labelSelectColumn.for = fieldLabel[0];
          labelSelectColumn.innerHTML = fieldLabel[1];
          let selectColumn = document.createElement("select");
          selectColumn.id = fieldLabel[0];
          selectColumn.name = "plotFields";
          selectColumn.addEventListener('change', function() {
              logFormFieldValues();
          });

          let selectColumnOption = document.createElement("option");
          selectColumnOption.value = "None";
          selectColumnOption.innerHTML = "None"; 
          selectColumn.appendChild(selectColumnOption);

          Object.entries(jsonColumns).forEach(([jsonColumnsKey, jsonColumnsValue]) => {
              selectColumnOption = document.createElement("option");
              selectColumnOption.value = jsonColumnsValue;// jsonColumnsKey;
              selectColumnOption.innerHTML = jsonColumnsValue; 
              selectColumn.appendChild(selectColumnOption);
          });
          
          fieldValueSaved = fillFormFieldValues(selectColumn.id, interactive_arguments);
          if (fieldValueSaved != undefined){
              selectColumn.value = fieldValueSaved;
          }

          let newRow = document.createElement("div");
          newRow.classList.add("row", "fieldPadding");

          if (fieldLabel[0] != "XAxis"){      
              fieldLabelNumber = parseInt(fieldLabel[0].slice(-1));
              if (fieldLabelNumber % 2 != 0 ){
                  newRow.classList.add("row", "fieldBackgroundColor");
              }
          }

          let newColumn1 = document.createElement("div");
          newColumn1.classList.add("col-3");   
          let newColumn2 = document.createElement("div");
          newColumn2.classList.add("col");

          newColumn1.appendChild(labelSelectColumn);
          newColumn2.appendChild(selectColumn);
          newRow.append(newColumn1, newColumn2);
          newDiv.append(newRow);
          

          
          // Add line label and color fields, line type, marker type, and marker size
          if (fieldLabel[0] != "XAxis"){
              // Add line label field
              newRow = document.createElement("div");
              newRow.classList.add("row", "fieldPadding");

              if (fieldLabelNumber % 2 != 0 ){
                  newRow.classList.add("row", "fieldBackgroundColor");
              }

              newColumn1 = document.createElement("div");
              newColumn1.classList.add("col-3");   
              newColumn2 = document.createElement("div");
              newColumn2.classList.add("col");

              let labelInputTitle = document.createElement("label");
              labelInputTitle.for = fieldLabel[0] + "Title";
              labelInputTitle.innerHTML = fieldLabel[1] + " Title";
              let inputTitle = document.createElement("input");
              inputTitle.id = fieldLabel[0] + "Title";
              inputTitle.size = "70";
              inputTitle.name = "plotFields";
              
              
              inputTitle.addEventListener('change', function() {
                  logFormFieldValues();
              });
              fieldValueSaved = fillFormFieldValues(inputTitle.id, interactive_arguments);
              if (fieldValueSaved != undefined){ 
                inputTitle.value = fieldValueSaved;    
              }
              if (fieldValueSaved === undefined){
                 // Make each line's default title set to the name of the column name that is selected for that line. Only if the line title is not already set.
                  //const DropdownValueSaved = fillFormFieldValues(selectColumn.id, interactive_arguments);
                  if (fieldLabel[0].includes("Line")){
                    selectColumn.addEventListener('change', function() {
                        DropdownValueSaved = selectColumn.value;
                        if (DropdownValueSaved != 'None' && fieldValueSaved === undefined) {
                            //console.log('fieldValueSaved2', fieldValueSaved);
                            inputTitle.value = DropdownValueSaved;
                            //console.log('DropdownValueSaved2', DropdownValueSaved);
                        } 
                    });
                  }
              }

              newColumn1.appendChild(labelInputTitle);
              newColumn2.appendChild(inputTitle);
              newRow.append(newColumn1, newColumn2);
              newDiv.append(newRow); 

              // Add color field
              newRow = document.createElement("div");
              newRow.classList.add("row", "fieldPadding");
              if (fieldLabelNumber % 2 != 0 ){
                  newRow.classList.add("row", "fieldBackgroundColor");
              }
              newColumn1 = document.createElement("div");
              newColumn1.classList.add("col-3");   
              newColumn2 = document.createElement("div");
              newColumn2.classList.add("col");

              let labelInputColor = document.createElement("label");
              labelInputColor.for = fieldLabel[0] + "Color";
              labelInputColor.innerHTML = fieldLabel[1] + " Color";
              let inputColor = document.createElement("input");
              inputColor.id = fieldLabel[0] + "Color";
              inputColor.name = "plotFields";
              inputColor.type = "color";
              fieldValueSaved = fillFormFieldValues(inputColor.id, interactive_arguments);
              if (fieldValueSaved != undefined){
                  inputColor.value = fieldValueSaved;
              }
              inputColor.addEventListener('change', function() {
                  logFormFieldValues();
              });

              newColumn1.appendChild(labelInputColor);
              newColumn2.appendChild(inputColor);
              newRow.append(newColumn1, newColumn2);
              newDiv.append(newRow);

              // Add lineType type dropdown
              const lineTypeRow = document.createElement('div');
              lineTypeRow.classList.add('row', 'fieldPadding');
              if (fieldLabelNumber % 2 != 0) lineTypeRow.classList.add('fieldBackgroundColor');

              const lineTypeCol1 = document.createElement('div');
              lineTypeCol1.classList.add('col-3');
              const lineTypeCol2 = document.createElement('div');
              lineTypeCol2.classList.add('col');

              const lineTypeLabel = document.createElement('label');
              lineTypeLabel.textContent = fieldLabel[1] + ' Line Type';
              lineTypeLabel.htmlFor = fieldLabel[0] + 'LineType';
              const lineTypeSelect = document.createElement('select');
              lineTypeSelect.id = fieldLabel[0] + 'LineType';
              lineTypeSelect.name = 'plotFields';

              //line types
              ["solid", "dash", "dot", "dashdot", "longdash", "longdashdot"].forEach(type => {
              const opt = document.createElement('option');
              opt.value = type;
              opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
              lineTypeSelect.appendChild(opt);
              });

              const lineTypeSaved = fillFormFieldValues(lineTypeSelect.id, interactive_arguments);
              if (lineTypeSaved) lineTypeSelect.value = lineTypeSaved;

              lineTypeSelect.addEventListener('change', logFormFieldValues);
              lineTypeCol1.appendChild(lineTypeLabel);
              lineTypeCol2.appendChild(lineTypeSelect);
              lineTypeRow.append(lineTypeCol1, lineTypeCol2);
              newDiv.append(lineTypeRow);

              // Add marker type dropdown
              const markerRow = document.createElement('div');
              markerRow.classList.add('row', 'fieldPadding');
              if (fieldLabelNumber % 2 != 0) markerRow.classList.add('fieldBackgroundColor');

              const markerCol1 = document.createElement('div');
              markerCol1.classList.add('col-3');
              const markerCol2 = document.createElement('div');
              markerCol2.classList.add('col');

              const markerLabel = document.createElement('label');
              markerLabel.textContent = fieldLabel[1] + ' Marker Type';
              markerLabel.htmlFor = fieldLabel[0] + 'MarkerType';
              const markerSelect = document.createElement('select');
              markerSelect.id = fieldLabel[0] + 'MarkerType';
              markerSelect.name = 'plotFields';

              ["circle", "square", "diamond", "x", "triangle-up", "triangle-down", "pentagon", "hexagon", "star", "hourglass", "bowtie", "cross"].forEach(type => {
                const opt = document.createElement('option');
                opt.value = type;
                opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
                markerSelect.appendChild(opt);
              });

              const markerSaved = fillFormFieldValues(markerSelect.id, interactive_arguments);
              if (markerSaved) markerSelect.value = markerSaved;

              markerSelect.addEventListener('change', logFormFieldValues);
              markerCol1.appendChild(markerLabel);
              markerCol2.appendChild(markerSelect);
              markerRow.append(markerCol1, markerCol2);
              newDiv.append(markerRow);


              // Add markerSize type dropdown
              const markerSizeRow = document.createElement('div');
              markerSizeRow.classList.add('row', 'fieldPadding');
              if (fieldLabelNumber % 2 != 0) markerSizeRow.classList.add('fieldBackgroundColor');

              const markerSizeCol1 = document.createElement('div');
              markerSizeCol1.classList.add('col-3');
              const markerSizeCol2 = document.createElement('div');
              markerSizeCol2.classList.add('col');

              const markerSizeLabel = document.createElement('label');
              markerSizeLabel.textContent = fieldLabel[1] + ' Marker Size';
              markerSizeLabel.htmlFor = fieldLabel[0] + 'MarkerSize';
              const markerSizeSelect = document.createElement('select');
              markerSizeSelect.id = fieldLabel[0] + 'MarkerSize';
              markerSizeSelect.name = 'plotFields';

              // Sizes 1 through 20
              [0, 1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20].forEach(size => {
              const opt = document.createElement('option');
              opt.value = size;
              opt.innerHTML = size + ' px';
              markerSizeSelect.appendChild(opt);
              });

              markerSizeSelect.value = 10;

              const markerSizeSaved = fillFormFieldValues(markerSizeSelect.id, interactive_arguments);
              if (markerSizeSaved) markerSizeSelect.value = markerSizeSaved;

              markerSizeSelect.addEventListener('change', logFormFieldValues);
              markerSizeCol1.appendChild(markerSizeLabel);
              markerSizeCol2.appendChild(markerSizeSelect);
              markerSizeRow.append(markerSizeCol1, markerSizeCol2);
              newDiv.append(markerSizeRow);


            //Add checkboxes for error bars, standard deviation, mean, and percentiles
            const features = ["Legend", "ConnectGaps", "Mean", "StdDev", "ErrorBars", "Percentiles"];
            const featureNames = ["Add Line to Legend", "Connect Missing Data Gaps","Mean Line", "+-1 Std Dev Lines ", "Symmetric Error Bars", "90th & 10th Percentile Lines"];
            for (let i = 0; i < features.length; i++) {
                const feature = features[i];
                const featureName = featureNames[i];

                let newRow = document.createElement("div");
                newRow.classList.add("row", "fieldPadding");
                if (fieldLabelNumber % 2 != 0) {
                    newRow.classList.add("row", "fieldBackgroundColor");
                }

                let newColumn1 = document.createElement("div");
                newColumn1.classList.add("col-3");
                let newColumn2 = document.createElement("div");
                newColumn2.classList.add("col");

                let label = document.createElement("label");
                label.for = fieldLabel[0] + feature;
                label.innerHTML = `${featureName}`;
                let checkbox = document.createElement("input");
                checkbox.type = "checkbox";
                checkbox.id = fieldLabel[0] + feature;
                checkbox.name = "plotFields";

                let fieldValueSaved = fillFormFieldValues(checkbox.id, interactive_arguments);
                checkbox.value = fieldValueSaved === 'on' ? 'on' : "";
                checkbox.checked = fieldValueSaved === 'on';

                newColumn1.appendChild(label);
                newColumn2.appendChild(checkbox);
                newRow.append(newColumn1, newColumn2);
                newDiv.append(newRow);
                

                // === Add dropdowns for feature-specific data ===
                if (["Mean", "ErrorBars", "StdDev"].includes(feature)) {
                    const dropdownContainer = document.createElement("div");
                    dropdownContainer.classList.add("row", "fieldPadding");
                    if (fieldLabelNumber % 2 != 0) {
                        dropdownContainer.classList.add("row", "fieldBackgroundColor");
                    }

                    const dropdownLabelCol = document.createElement("div");
                    dropdownLabelCol.classList.add("col-3");
                    const dropdownInputCol = document.createElement("div");
                    dropdownInputCol.classList.add("col");

                    function createDropdown(labelText, selectId) {
                        const label = document.createElement("label");
                        label.innerHTML = labelText;
                        const select = document.createElement("select");
                        select.id = selectId;
                        select.name = "plotFields";

                        if (feature === "Mean" || feature === "ErrorBars" || feature === "StdDev") {
                            const autoOpt = document.createElement("option");

                            if (feature != "ErrorBars") {
                                autoOpt.value = "auto";
                                autoOpt.innerHTML = "Auto Calculate Based on Line Column Selection";
                                select.appendChild(autoOpt);
                            }
                            if (feature === "ErrorBars") {
                                autoOpt.value = "auto";
                                autoOpt.innerHTML = "Example Error Bars";
                                select.appendChild(autoOpt);
                            }

                        for (let col of Object.values(jsonColumns)) {
                            const opt = document.createElement("option");
                            opt.value = col;
                            opt.innerHTML = col;
                            select.appendChild(opt);
                        }

                        const saved = fillFormFieldValues(select.id, interactive_arguments);
                        if (saved) select.value = saved;

                        select.addEventListener("change", logFormFieldValues);
                        return { label, select };
                        }

                    }

                    function createColorfield(labelText, inputId) {
                        const label = document.createElement("label");
                        label.textContent = labelText;
                        label.htmlFor = inputId; // Link label to input

                        const input = document.createElement("input"); // Correct element
                        input.type = "color";
                        input.id = inputId;
                        input.name = "plotFields";

                        const saved = fillFormFieldValues(input.id, interactive_arguments);
                        if (saved) input.value = saved;

                        input.addEventListener("change", logFormFieldValues);
                        return { label, input };
                    }

                    const controls = [];

                    if (feature === "Mean") {
                        const { label, select } = createDropdown("Mean Source Column", fieldLabel[0] + feature + "Field");
                        controls.push(label, select);
                    }

                    if (feature === "ErrorBars" || feature === "StdDev") {
                        const { label: labelValues, select: selectValues } = createDropdown(`${featureName} Input Column Values`, fieldLabel[0] + feature + "InputValues");
                        const { label: labelColor, input: ColorValue } = createColorfield(`Color`, fieldLabel[0] + feature + "Color");
                        controls.push(labelValues, document.createElement('br'), selectValues, document.createElement('br'), labelColor, document.createElement('br'), ColorValue);
                    }             

                    // Initially hide the dropdown container
                    dropdownContainer.style.display = checkbox.checked ? "flex" : "none";

                    controls.forEach(control => dropdownInputCol.appendChild(control));
                    dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
                    newDiv.append(dropdownContainer);

                    // Toggle visibility dynamically
                    checkbox.addEventListener('change', function () {
                        checkbox.value = checkbox.checked ? 'on' : "";
                        dropdownContainer.style.display = checkbox.checked ? "flex" : "none";
                        logFormFieldValues();
                    });
                } else {
                    checkbox.addEventListener('change', function () {
                        checkbox.value = checkbox.checked ? 'on' : "";
                        logFormFieldValues();
                    });
                }
            }
            
          }
        

          const targetElement = document.getElementById('graphGUI');
          targetElement.appendChild(newDiv);
      });
  }
}
