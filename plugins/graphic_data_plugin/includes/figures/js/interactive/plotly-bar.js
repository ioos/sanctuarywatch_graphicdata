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

    //Allow for cases where no X axis is selected
    if (columnXHeader === 'None') {
        layout.xaxis = layout.xaxis || {};
        layout.xaxis.type = 'category';
    } else {
        layout.xaxis = layout.xaxis || {};
        layout.xaxis.type = 'date';
    }


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
 * Asynchronously generates a Plotly bar chart and appends it to a target HTML element.
 * 
 * This function fetches data from a WordPress REST API endpoint, processes the data,
 * and renders a Plotly bar chart based on the provided arguments. It supports various
 * configurations such as stacked bars, grid visibility, error bars, percentiles, and
 * mean lines.
 * 
 * @async
 * @function producePlotlyBarFigure
 * @param {string} targetFigureElement - The ID of the target HTML element where the chart will be appended.
 * @param {string} interactive_arguments - A JSON string containing the configuration arguments for the chart.
 * @param {string|null} postID - The WordPress post ID. If null, the function attempts to retrieve the post ID from the admin interface.
 * 
 * @throws {Error} Throws an error if there is an issue with network requests or data processing.
 * 
 * @example
 * const targetElement = "chartContainer_123";
 * const args = JSON.stringify({
 *   NumberOfBars: 3,
 *   XAxis: "Category",
 *   Bar1: "Value1",
 *   Bar1Color: "#FF0000",
 *   Bar1Title: "Bar 1",
 *   YAxisTitle: "Values",
 *   showGrid: "on",
 *   graphTicks: "off"
 * });
 * const postID = "123";
 * producePlotlyBarFigure(targetElement, args, postID);
 * 
 * @description
 * The function performs the following steps:
 * 1. Ensures that the Plotly library is loaded.
 * 2. Fetches the `uploaded_path_json` from the WordPress REST API for the given post ID.
 * 3. Fetches the data file from the resolved URL.
 * 4. Processes the data and generates Plotly traces based on the provided arguments.
 * 5. Configures the layout and rendering options for the Plotly chart.
 * 6. Appends the chart to the specified target HTML element.
 * 
 * @see {@link https://plotly.com/javascript/} for more information about Plotly.
 * 
 * @param {Object} figureArguments - Parsed configuration arguments for the chart.
 * @param {number} figureArguments.NumberOfBars - The number of bars to display in the chart.
 * @param {string} figureArguments.XAxis - The column name for the X-axis data.
 * @param {string} figureArguments.YAxisTitle - The title for the Y-axis.
 * @param {string} figureArguments.showGrid - Whether to show grid lines ("on" or "off").
 * @param {string} figureArguments.graphTicks - Whether to show graph ticks ("on" or "off").
 * @param {string} figureArguments.StackedBarColumns - Whether bars should be stacked ("on" or "off").
 * @param {string} figureArguments.Bar{n} - The column name for the Y-axis data of the nth bar.
 * @param {string} figureArguments.Bar{n}Color - The color of the nth bar.
 * @param {string} figureArguments.Bar{n}Title - The title of the nth bar.
 * @param {string} figureArguments.Bar{n}Stacked - Whether the nth bar is stacked ("on" or "off").
 * @param {string} figureArguments.Bar{n}Legend - Whether to show the legend for the nth bar ("on" or "off").
 * @param {string} figureArguments.Bar{n}FillType - The fill pattern for the nth bar.
 * @param {string} figureArguments.Bar{n}Percentiles - Whether to show percentiles for the nth bar ("on" or "off").
 * @param {string} figureArguments.Bar{n}Mean - Whether to show the mean line for the nth bar ("on" or "off").
 * @param {string} figureArguments.Bar{n}MeanField - The column name for the mean values of the nth bar.
 * @param {string} figureArguments.Bar{n}ErrorBars - Whether to show error bars for the nth bar ("on" or "off").
 * @param {string} figureArguments.Bar{n}ErrorBarsInputValues - The column name for error bar values or "auto".
 * @param {string} figureArguments.Bar{n}ErrorBarsColor - The color of the error bars for the nth bar.
 * 
 * @param {Object} layout - The layout configuration for the Plotly chart.
 * @param {string} layout.barmode - The bar mode ("stack" or "group").
 * @param {Object} layout.xaxis - Configuration for the X-axis.
 * @param {Object} layout.yaxis - Configuration for the Y-axis.
 * @param {Object} layout.legend - Configuration for the chart legend.
 * 
 * @param {Object} config - The rendering configuration for the Plotly chart.
 * @param {boolean} config.responsive - Whether the chart is responsive to window resizing.
 * @param {string} config.renderer - The rendering mode ("svg" or "webgl").
 * @param {boolean} config.displayModeBar - Whether to display the mode bar.
 * @param {Array<string>} config.modeBarButtonsToRemove - List of mode bar buttons to remove.
 */
async function producePlotlyBarFigure(targetFigureElement, interactive_arguments, postID){
    try {
        await loadPlotlyScript(); // ensures Plotly is ready

        const rawField = interactive_arguments;
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

        // in fetch_tab_info in script.js, await render_tab_info & await new Promise were added to give each run of producePlotlyBarFigure a chance to finish running before the next one kicked off
        // producePlotlyBarFigure used to fail here because the script was running before the previous iteration finished. 
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
            const targetElement = await waitForElementById(targetFigureElement);
            targetElement.appendChild(newDiv);
            
            const numBars = figureArguments['NumberOfBars'];

            let plotlyX;
            let plotlyY;
            let columnXHeader;
            let columnYHeader;
            let targetBarColumn;
            let singleBarPlotly;
            let allBarsPlotly = [];
            let shapesForLayout = [];

            const barStackedByX = figureArguments['StackedBarColumns'] === 'on';

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

            for (let i = 1; i <= figureArguments['NumberOfBars']; i++) {
                const targetBarColumn = 'Bar' + i;
                const columnXHeader = figureArguments['XAxis'];
                const columnYHeader = figureArguments[targetBarColumn];

                const isStacked = figureArguments[targetBarColumn + 'Stacked'];
                const StackedSeparatorColor = figureArguments[targetBarColumn + 'StackedSeparatorLineColor'];
                const showLegend = figureArguments[targetBarColumn + 'Legend'];
                const showLegendBool = showLegend === 'on';
                const fillType = figureArguments[targetBarColumn + 'FillType'];

                //console.log('fillType', fillType);

                function lightenColor(hex, factor = 0.2) {
                    const rgb = parseInt(hex.slice(1), 16);
                    const r = Math.min(255, Math.floor(((rgb >> 16) & 0xff) + 255 * factor));
                    const g = Math.min(255, Math.floor(((rgb >> 8) & 0xff) + 255 * factor));
                    const b = Math.min(255, Math.floor((rgb & 0xff) + 255 * factor));
                    return `rgb(${r},${g},${b})`;
                }

                // === CASE: Individual Bar Column Stacking ===
                if (isStacked === 'on' && columnXHeader !== 'None') {
                    console.log('// === CASE: Individual Bar Column Stacking ===');
                    const categories = dataToBePlotted[columnXHeader];
                    const values = dataToBePlotted[columnYHeader].map(val => parseFloat(val));
                    const groupMap = {};
                    categories.forEach((cat, idx) => {
                        if (!groupMap[cat]) groupMap[cat] = 0;
                        groupMap[cat] += !isNaN(values[idx]) ? values[idx] : 0;
                    });

                    const xValue = figureArguments[targetBarColumn + 'Title'] || `Bar ${i}`;
                    Object.entries(groupMap).forEach(([stackCategory, val], j) => {
                        allBarsPlotly.push({
                            x: [xValue],
                            y: [val],
                            type: 'bar',
                            name: `${stackCategory} ${xValue}`,
                            showlegend: showLegendBool,
                            marker: {
                                color: lightenColor(figureArguments[targetBarColumn + 'Color'], j * 0.05),
                                line: {
                                    width: 1,
                                    color: StackedSeparatorColor
                                },
                                pattern: { shape: fillType, size: 4, solidity: 0.5 }
                            },
                            hovertemplate: `${columnXHeader}: ${stackCategory}`
                        });
                    });
                }

                // === CASE: Single Bar (no X axis) ===
                else if (columnXHeader === 'None') {
                    console.log(' // === CASE: Single Bar (no X axis) ===');
                    plotlyX = [figureArguments[targetBarColumn + 'Title'] || `Bar ${i}`];
                    let sumY = dataToBePlotted[columnYHeader].map(val => parseFloat(val)).filter(val => !isNaN(val)).reduce((a, b) => a + b, 0);
                    plotlyY = [sumY];
                    
                    console.log('plotlyX:', plotlyX);
                    console.log('plotlyY:', plotlyY);

                    // allBarsPlotly.push({
                    //     x: plotlyX,
                    //     y: plotlyY,
                    //     type: 'bar',
                    //     name: `${figureArguments[targetBarColumn + 'Title']}`,
                    //     showlegend: showLegendBool,
                    //     marker: {
                    //         color: figureArguments[targetBarColumn + 'Color'],
                    //         pattern: { shape: fillType, size: 4, solidity: 0.5 }
                    //     },
                    //     hovertemplate: `${figureArguments['YAxisTitle']}: %{y}`
                    // });
                }


                // === CASE: Stacked across columns by X axis ===
                else if (barStackedByX && columnXHeader !== 'None') {
                    console.log(' // === CASE: Stacked across columns by X axis ===');
                    const categories = dataToBePlotted[columnXHeader];
                    const values = dataToBePlotted[columnYHeader].map(val => parseFloat(val));
                    const groupMap = {};
                    categories.forEach((cat, idx) => {
                        if (!groupMap[cat]) groupMap[cat] = 0;
                        groupMap[cat] += !isNaN(values[idx]) ? values[idx] : 0;
                    });

                    plotlyX = Object.keys(groupMap);
                    plotlyY = Object.values(groupMap);

                    // allBarsPlotly.push({
                    //     x: plotlyX,
                    //     y: plotlyY,
                    //     type: 'bar',
                    //     name: `${figureArguments[targetBarColumn + 'Title']}`,
                    //     showlegend: showLegendBool,
                    //     marker: {
                    //         color: figureArguments[targetBarColumn + 'Color'],
                    //         pattern: { shape: fillType, size: 4, solidity: 0.5 }
                    //     },
                    //     hovertemplate: `${figureArguments['XAxisTitle']}: %{x}<br>${figureArguments['YAxisTitle']}: %{y}`
                    // });
                }

                // === CASE: Separate columns side-by-side per bar ===
                else {
                    console.log('// === CASE: Separate columns side-by-side per bar ===');
                    const categories = dataToBePlotted[columnXHeader];
                    const values = dataToBePlotted[columnYHeader].map(val => parseFloat(val));
                    const groupMap = {};
                    categories.forEach((cat, idx) => {
                        if (!groupMap[cat]) groupMap[cat] = 0;
                        groupMap[cat] += !isNaN(values[idx]) ? values[idx] : 0;
                    });

                    plotlyX = Object.keys(groupMap);
                    ////console.log(plotlyX);
                    plotlyY = Object.values(groupMap);
                    ////console.log(plotlyY);



                    // allBarsPlotly.push({
                    //     x: plotlyX,
                    //     y: plotlyY,
                    //     type: 'bar',
                    //     name: `${figureArguments[targetBarColumn + 'Title']}`,
                    //     showlegend: showLegendBool,
                    //     // marker: {
                    //     //     color: figureArguments[targetBarColumn + 'Color']
                    //     // },
                    //     hovertemplate: `${figureArguments['XAxisTitle']}: %{x}<br>${figureArguments['YAxisTitle']}: %{y}`
                    // });
                }
                
                //Percentiles and Mean lines
                const showPercentiles = figureArguments[targetBarColumn + 'Percentiles'];
                const showMean = figureArguments[targetBarColumn + 'Mean'];
                const showMean_ValuesOpt = figureArguments[targetBarColumn + 'MeanField'];
                if (showPercentiles === 'on' || showMean === 'on') {

                    //Calculate Percentiles (Auto Calculated) based on dataset Y-axis values
                    //Do we want to be able to set high and low bounds per point here? (That wouldn't make sense to me)
                    const p10 = computePercentile(plotlyY, 10);
                    const p90 = computePercentile(plotlyY, 90);
                    const filteredX = plotlyX.filter(item => item !== "");
                    const xMinPercentile = Math.min(...filteredX);
                    const xMaxPercentile = Math.max(...filteredX);
                    if (showPercentiles === 'on') {
                        allBarsPlotly.push({
                            x: [xMinPercentile, xMaxPercentile],
                            y: [p10, p10],
                            mode: 'lines',
                            line: { dash: 'dot', color: figureArguments[targetBarColumn + 'Color'] + '60'},
                            name: `${figureArguments[targetBarColumn + 'Title']} 10th Percentile (Bottom)`,
                            type: 'scatter',
                            visible: true,
                            showlegend: false
                        });
                        allBarsPlotly.push({
                            x: [xMinPercentile, xMaxPercentile],
                            y: [p90, p90],
                            mode: 'lines',
                            line: { dash: 'dot', color: figureArguments[targetBarColumn + 'Color'] + '60'},
                            name: `${figureArguments[targetBarColumn + 'Title']} 10th & 90th Percentile`,
                            type: 'scatter',
                            visible: true,
                            showlegend: showLegendBool
                        });
                    }

                    // Calculate mean

                    //Calculate mean (Auto Calculated) based on dataset Y-axis values
                    if (showMean_ValuesOpt === 'auto' && showMean === 'on') {
                        // const mean = plotlyY.reduce((a, b) => a + b, 0) / plotlyY.length;
                        let plotlyYSafeArray = plotlyY.map(value => value === "NA" ? 0 : value);
                        const mean = plotlyYSafeArray.reduce((a, b) => a + b, 0) / plotlyY.length;
                        const filteredX = plotlyX.filter(item => item !== "");
                        const xMin = Math.min(...filteredX);
                        const xMax = Math.max(...filteredX);
                        allBarsPlotly.push({
                            x: [xMin, xMax],
                            y: [mean, mean],
                            mode: 'lines',
                            line: { dash: 'solid', color: figureArguments[targetBarColumn + 'Color'] + '60'},
                            name: `${figureArguments[targetBarColumn + 'Title']} Mean`,
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
                        allBarsPlotly.push({
                            x: [xMin, xMax],
                            y: [mean, mean],
                            mode: 'lines',
                            line: { dash: 'solid', color: figureArguments[targetBarColumn + 'Color'] + '60'},
                            name: `${figureArguments[targetBarColumn + 'Title']} Mean`,
                            type: 'scatter',
                            visible: true,
                            showlegend: showLegendBool
                        });
                    }
                }
                // === Optional Overlays and Error Bars ===
                const errorArrayRaw = figureArguments[targetBarColumn + 'ErrorBars'] === 'on'
                    ? figureArguments[targetBarColumn + 'ErrorBarsInputValues'] === 'auto'
                        ? new Array(plotlyY.length).fill(computeStandardDeviation(plotlyY))
                        : (dataToBePlotted[figureArguments[targetBarColumn + 'ErrorBarsInputValues']] || []).map(val => parseFloat(val)).filter(val => !isNaN(val))
                    : null;

                const error_y = errorArrayRaw ? {
                    type: 'data',
                    array: errorArrayRaw,
                    visible: true,
                    color: figureArguments[targetBarColumn + 'ErrorBarsColor'] || '#000',
                    thickness: 1,
                    width: 5
                } : undefined;

                if (!(isStacked === 'on' && columnXHeader !== 'None')) {
                    trace = {
                        x: plotlyX,
                        y: plotlyY,
                        type: 'bar',
                        name: `${figureArguments[targetBarColumn + 'Title']}`,
                        showlegend: showLegendBool,
                        marker: {
                            color: figureArguments[targetBarColumn + 'Color'],
                            pattern: { shape: fillType, size: 4, solidity: 0.5 }
                        },
                        hovertemplate: `${figureArguments['XAxisTitle'] || ''}: %{x}<br>${figureArguments['YAxisTitle'] || ''}: %{y}`,
                        ...(error_y ? { error_y } : {})
                    };
                    allBarsPlotly.push(trace);
                }               
            }

            


            // Set layout barmode based on stacked column option
            var layout = {
                barmode: barStackedByX ? 'stack' : 'group',
                xaxis: {
                    title: { text: figureArguments['XAxisTitle'] || '' },
                    linecolor: 'black',
                    linewidth: 1,
                    tickmode: 'array',
                    tickangle: -45,
                    automargin: true,
                    tickmode: graphTickModeBool,
                    ticks: graphTickPositionBool 
                },
                yaxis: {
                    title: { text: figureArguments['YAxisTitle'] || '' },
                    linecolor: 'black',
                    linewidth: 1,
                    rangemode: 'tozero',
                    autorange: figureArguments['YAxisLowBound'] === '' && figureArguments['YAxisHighBound'] === '' ? true : false,
                    range: (
                        figureArguments['YAxisLowBound'] !== '' && figureArguments['YAxisHighBound'] !== ''
                        ? [parseFloat(figureArguments['YAxisLowBound']), parseFloat(figureArguments['YAxisHighBound'])]
                        : undefined
                    ),
                    tickmode: graphTickModeBool,
                    ticks: graphTickPositionBool,
                    showgrid: showGridBool
                },
                legend: {
                    orientation: 'h',
                    y: 1.1,
                    x: 0.5,
                    xanchor: 'center',
                    yanchor: 'bottom'
                },
                autosize: true,
                margin: { t: 60, b: 60, l: 60, r: 60 },
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

                            
            // Create the plot with all lines
            //Plotly.newPlot(plotlyDivID, allBarsPlotly, layout, config);  


                         
            // Create the plot with all lines
            await Plotly.newPlot(plotDiv, allBarsPlotly, layout, config).then(() => {
                // After the plot is created, inject overlays if any, this is here because you can only get overlays that span the entire yaxis after the graph has been rendered.
                // You need the specific values for the entire yaxis
                injectOverlays(plotDiv, layout, allBarsPlotly, figureArguments, dataToBePlotted);
            });
            Plotly.Plots.resize(plotDiv)

        } else {}
    } catch (error) {
        console.error('Error loading scripts:', error);
    }
}


/**
 * Loads and merges default interactive bar arguments with the current arguments,
 * ensuring proper handling of bar-specific keys and other configuration options.
 * Updates the value of the "figure_interactive_arguments" field and displays
 * the bar fields accordingly.
 *
 * @param {Object} jsonColumns - JSON object representing the columns of the bar chart.
 *
 * @description
 * This function is designed to handle the merging of default and current arguments
 * for an interactive bar chart. It ensures that bar-specific keys are updated based
 * on the number of bars specified, while also preserving the original order of keys
 * in the current arguments. Non-bar-specific keys are always updated with default values.
 * The merged arguments are written back to the "figure_interactive_arguments" field
 * as a JSON string and used to display the bar fields.
 *
 * @returns {void}
 *
 * @example
 * // Assuming `argumentsDefaultsBar.interactive_bar_arguments` contains default arguments
 * // and the "figure_interactive_arguments" field exists in the DOM:
 * loadDefaultInteractiveBarArguments(jsonColumns);
 *
 * @throws {Error} This function does not throw errors but may fail silently if
 * required DOM elements are not present.
 *
 * @global
 * - `argumentsDefaultsBar` (optional): A global object containing default arguments
 *   for the interactive bar chart.
 *
 * @helper
 * - `safeParseJSON(s)`: Safely parses a JSON string, returning `null` if parsing fails.
 * - `pairsToObject(pairs)`: Converts an array of key-value pairs to an object.
 * - `kvStringToObject(str)`: Converts a key-value string to an object.
 * - `toObjectFlexible(s)`: Converts a string to an object, supporting JSON and key-value formats.
 * - `toPairsFlexible(s)`: Converts a string to an array of key-value pairs, supporting JSON and key-value formats.
 * - `objectToPairsPreserveOrder(obj, currentPairs)`: Converts an object to an array of key-value pairs,
 *   preserving the order of keys from the current pairs.
 *
 * @DOM
 * - Reads the value of the "figure_interactive_arguments" field.
 * - Reads the value of the "NumberOfBars" input field to determine the number of bars.
 * - Writes the merged arguments back to the "figure_interactive_arguments" field.
 * - Calls `displayBarFields` to update the bar fields in the UI.
 *
 * @variables
 * - `field`: The DOM element representing the "figure_interactive_arguments" field.
 * - `currentStr`: The current value of the "figure_interactive_arguments" field.
 * - `defaultsStr`: The default arguments for the interactive bar chart.
 * - `currentPairs`: The current arguments as an array of key-value pairs.
 * - `currentObj`: The current arguments as an object.
 * - `defaultsObj`: The default arguments as an object.
 * - `numEl`: The DOM element representing the "NumberOfBars" input field.
 * - `numberOfBars`: The number of bars specified in the "NumberOfBars" input field.
 * - `barPrefixes`: An array of prefixes for bar-specific keys (e.g., "Bar1", "Bar2").
 * - `mergedPairs`: The merged arguments as an array of key-value pairs.
 * - `mergedPairs_string`: The merged arguments as a JSON string.
 */
function loadDefaultInteractiveBarArguments (jsonColumns) {
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
    const defaultsStr = (typeof argumentsDefaultsBar !== "undefined" && argumentsDefaultsBar.interactive_bar_arguments)
                            ? argumentsDefaultsBar.interactive_bar_arguments : "";

    // Parse both to objects and keep original pair order from current
    const currentPairs   = toPairsFlexible(currentStr);
    const currentObj     = toObjectFlexible(currentStr);
    const defaultsObj    = toObjectFlexible(defaultsStr);

    // How many bars should be considered?
    const numEl = document.getElementById("NumberOfBars");
    const numberOfBars = numEl && numEl.value ? parseInt(numEl.value, 10) : 0;
    if (numberOfBars > 0) currentObj.NumberOfBars = String(numberOfBars);

    // Overwrite ONLY keys that:
    //  - start with Bar1..Bar{N}, AND
    //  - already exist in currentObj, AND
    //  - also exist in defaultsObj
    if (numberOfBars > 0) {
        const barPrefixes = Array.from({ length: numberOfBars }, (_, i) => `Bar${i + 1}`);
        for (const key of Object.keys(currentObj)) {
        const isWithinBars = barPrefixes.some(prefix => key.startsWith(prefix));
        if (isWithinBars && (key in defaultsObj)) {
            currentObj[key] = defaultsObj[key];
        }
        }
    }

    // Ensure/overwrite these non-bar keys regardless of bar count
    currentObj.showGrid    = (defaultsObj.showGrid    ?? "on");
    currentObj.graphTicks  = (defaultsObj.graphTicks  ?? "on");
    currentObj.XAxisFormat = (defaultsObj.XAxisFormat ?? "YYYY");

    // Convert back to array-of-pairs, preserving the original order from currentPairs
    const mergedPairs = objectToPairsPreserveOrder(currentObj, currentPairs);

    // Write back EXACTLY as array-of-pairs JSON
    let mergedPairs_string = JSON.stringify(mergedPairs);

    //console.log('interactive_arguments', currentStr);
    //console.log('default_interactive_arguments', defaultsStr);
    //console.log('mergedPairs_string', mergedPairs_string);

    document.getElementsByName("figure_interactive_arguments")[0].value = mergedPairs_string;

    displayBarFields(numberOfBars, jsonColumns, mergedPairs_string);

    return;
    
}

/**
 * Dynamically generates and appends form fields for configuring Plotly bar chart parameters in the UI.
 *
 * This function creates a set of HTML form controls (checkboxes, text inputs, color pickers, and select dropdowns)
 * for customizing various aspects of a Plotly bar chart, such as grid lines, axis titles, axis bounds, number of bars,
 * axis date format, and other bar-specific options. The generated fields are appended to the element with ID 'graphGUI'.
 * The function also prepopulates field values using the provided interactive arguments and attaches event listeners
 * to update the underlying data model when fields are changed.
 *
 * @function plotlyBarParameterFields
 * @param {Object} jsonColumns - An object representing available data columns, where keys are column identifiers and values are column names.
 * @param {Object} interactive_arguments - An object or JSON string containing previously saved form field values, used to prepopulate the GUI fields.
 *
 * @description
 * The function performs the following steps:
 * 1. Creates a container div for the parameter fields.
 * 2. Adds checkboxes for toggling grid lines and graph ticks.
 * 3. Adds input fields for X and Y axis titles and their low/high bounds.
 * 4. Adds a select dropdown for the number of bars to be plotted (1–14).
 * 5. Adds a select dropdown for the X axis date format.
 * 6. Appends all generated fields to the 'graphGUI' element in the DOM.
 * 7. Calls `displayBarFields` to generate additional bar-specific configuration fields based on the selected number of bars.
 * 8. Attaches event listeners to all fields to update the hidden input storing the configuration as a JSON string.
 *
 * @modifies
 * - Appends a new div with ID 'secondaryGraphFields' to the element with ID 'graphGUI'.
 * - Updates the value of the hidden input field named 'figure_interactive_arguments' when any field is changed.
 * - Calls `displayBarFields` to update bar-specific fields dynamically.
 *
 * @requires
 * - fillFormFieldValues: Function to retrieve saved values for form fields.
 * - logFormFieldValues: Function to update the hidden input with current form values.
 * - displayBarFields: Function to generate bar-specific configuration fields.
 *
 * @listens change - Updates the hidden input and UI when any field is changed.
 *
 * @example
 * // Example usage:
 * const jsonColumns = { col1: "Column 1", col2: "Column 2" };
 * const interactive_arguments = { XAxisTitle: "Year", NumberOfBars: 2 };
 * plotlyBarParameterFields(jsonColumns, interactive_arguments);
 *
 * @global
 * - Assumes the existence of a DOM element with ID 'graphGUI'.
 * - Assumes the existence of a hidden input named 'figure_interactive_arguments'.
 */
function plotlyBarParameterFields(jsonColumns, interactive_arguments){

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
  let labelSelectNumberBars = document.createElement("label");
  labelSelectNumberBars.for = "NumberOfBars";
  labelSelectNumberBars.innerHTML = "Number of Bars to Be Plotted";
  let selectNumberBars = document.createElement("select");
  selectNumberBars.id = "NumberOfBars";
  selectNumberBars.name = "plotFields";
  selectNumberBars.addEventListener('change', function() {
      displayBarFields(selectNumberBars.value, jsonColumns, interactive_arguments) });
  selectNumberBars.addEventListener('change', function() {
          logFormFieldValues();
      });

  for (let i = 1; i < 15; i++){
      let selectNumberBarsOption = document.createElement("option");
      selectNumberBarsOption.value = i;
      selectNumberBarsOption.innerHTML = i; 
      selectNumberBars.appendChild(selectNumberBarsOption);
  }
  fieldValueSaved = fillFormFieldValues(selectNumberBars.id, interactive_arguments);
  if (fieldValueSaved != undefined){
      selectNumberBars.value = fieldValueSaved;
  }
  newRow = document.createElement("div");
  newRow.classList.add("row", "fieldPadding");
  newColumn1 = document.createElement("div");
  newColumn1.classList.add("col-3");   
  newColumn2 = document.createElement("div");
  newColumn2.classList.add("col");

  newColumn1.appendChild(labelSelectNumberBars);
  newColumn2.appendChild(selectNumberBars);
  newRow.append(newColumn1, newColumn2);
  newDiv.append(newRow);

  let labelSelectXAxisFormat = document.createElement("label");
  labelSelectXAxisFormat.for = "XAxisFormat";
  labelSelectXAxisFormat.innerHTML = "X Axis Date Format";
  let selectXAxisFormat = document.createElement("select");
  selectXAxisFormat.id = "XAxisFormat";
  selectXAxisFormat.name = "plotFields";
  selectXAxisFormat.addEventListener('change', function() {
      logFormFieldValues();
  });

  const dateFormats =["None", "YYYY", "YYYY-MM-DD"];

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
  displayBarFields(selectNumberBars.value, jsonColumns, interactive_arguments);
}


// generate the form fields needed for users to indicate preferences for how a figure should appear 
/**
 * Dynamically generates and displays a GUI for configuring bar chart fields, including options for 
 * X-axis, bar columns, styles, and additional features such as error bars, mean lines, and percentiles.
 *
 * @param {number} numBars - The number of bars to be plotted in the chart.
 * @param {Object} jsonColumns - An object representing the available data columns, where keys are column identifiers 
 *                               and values are column names.
 * @param {Object} interactive_arguments - An object containing previously saved form field values, used to prepopulate 
 *                                         the GUI fields.
 *
 * @description
 * This function creates a dynamic interface for configuring bar chart settings. It includes:
 * - A checkbox for grouping bars by the X-axis (stacked columns).
 * - A button to apply default styles to all bars.
 * - Dropdowns for selecting the X-axis column and bar columns.
 * - Input fields for customizing bar titles and colors.
 * - Dropdowns for selecting fill patterns for bars.
 * - Checkboxes for enabling additional features such as adding bars to the legend, mean lines, error bars, 
 *   percentiles, and stacked bar grouping.
 * - Additional dropdowns and input fields for configuring feature-specific settings, such as error bar values 
 *   and mean source columns.
 *
 * The generated GUI is appended to an HTML element with the ID `graphGUI`. If a GUI already exists, it is removed 
 * before creating a new one.
 *
 * @example
 * // Example usage:
 * const numBars = 3;
 * const jsonColumns = { col1: "Column 1", col2: "Column 2", col3: "Column 3" };
 * const interactive_arguments = { XAxis: "col1", Bar1: "col2", Bar1Title: "Bar 1 Title" };
 * displayBarFields(numBars, jsonColumns, interactive_arguments);
 *
 * @listens change - Logs form field values when dropdowns, checkboxes, or input fields are modified.
 * @listens click - Applies default styles when the "Apply Custom Bar Styles to All Bars" button is clicked.
 *
 * @requires logFormFieldValues - A function to log the current values of the form fields.
 * @requires fillFormFieldValues - A function to retrieve and populate saved values for form fields.
 * @requires loadDefaultInteractiveBarArguments - A function to load default arguments for bar chart customization.
 *
 * @modifies
 * - Removes the existing GUI element with the ID `assignColumnsToPlot` if it exists.
 * - Appends a new GUI element to the HTML element with the ID `graphGUI`.
 *
 * @throws {Error} If the target element with ID `graphGUI` does not exist in the DOM.
 */
function displayBarFields (numBars, jsonColumns, interactive_arguments) {
    let assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
    // If the element exists
    if (assignColumnsToPlot) {
        // Remove the scene window
        assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
    }

    if (numBars > 0) {
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


        // Add checkbox for StackedBarColumns
        let labelStackedBarColumns = document.createElement("label");
        labelStackedBarColumns.for = "StackedBarColumns";
        labelStackedBarColumns.innerHTML = "Group Bars by X Axis (Stacked Columns)";
        let checkboxStackedBarColumns = document.createElement("input");
        checkboxStackedBarColumns.type = "checkbox";
        checkboxStackedBarColumns.id = "StackedBarColumns";
        checkboxStackedBarColumns.name = "plotFields";
        checkboxStackedBarColumns.addEventListener("change", function () {
            checkboxStackedBarColumns.value = checkboxStackedBarColumns.checked ? "on" : "";
            logFormFieldValues();
        });
  
        fieldValueSaved = fillFormFieldValues(checkboxStackedBarColumns.id, interactive_arguments);
        checkboxStackedBarColumns.checked = (fieldValueSaved === 'on');  // only true if exactly "on"
        checkboxStackedBarColumns.value = checkboxStackedBarColumns.checked ? 'on' : '';

        newRow = document.createElement("div");
        newRow.classList.add("row", "fieldPadding");
        newColumn1 = document.createElement("div");
        newColumn1.classList.add("col-3");
        newColumn2 = document.createElement("div");
        newColumn2.classList.add("col");

        newColumn1.appendChild(labelStackedBarColumns);
        newColumn2.appendChild(checkboxStackedBarColumns);
        newRow.append(newColumn1, newColumn2);
        newDiv.append(newRow);


        // Create the button for default styles
        let labelApplyDefaults = document.createElement("label");
        labelApplyDefaults.for = "ApplyBarDefaults";
        labelApplyDefaults.innerHTML = "Apply Custom Bar Styles to All Bars";

        let btnApplyDefaults = document.createElement("button");
        btnApplyDefaults.id = "ApplyBarDefaults";
        btnApplyDefaults.type = "button"; // prevent accidental form submit
        btnApplyDefaults.classList.add("button", "button-primary"); // WP admin button style
        btnApplyDefaults.innerHTML = "Click to Apply Styles";

        btnApplyDefaults.addEventListener('click', function() {
            loadDefaultInteractiveBarArguments(jsonColumns);
        });

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



        //Create select fields for X Axis and each line to be plotted
        let fieldLabels = [["XAxis", "X Axis Column"]];
        for (let i = 1; i <= numBars; i++){
            fieldLabels.push(["Bar" + i, "Bar " + i + " Column"]);
        }

        fieldLabels.forEach((fieldLabel) => {
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
                  if (fieldLabel[0].includes("Bar")){
                    selectColumn.addEventListener('change', function() {
                        DropdownValueSaved = selectColumn.value;
                        if (DropdownValueSaved != 'None' && fieldValueSaved === undefined) {
                            console.log('fieldValueSaved2', fieldValueSaved);
                            inputTitle.value = DropdownValueSaved;
                            console.log('DropdownValueSaved2', DropdownValueSaved);
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


                // Create pattern/fill select field
                let labelPatternSelect = document.createElement("label");
                labelPatternSelect.htmlFor = fieldLabel[0] + "FillType";
                labelPatternSelect.innerHTML = fieldLabel[1] + " Fill Type";

                let selectColumnPattern = document.createElement("select");
                selectColumnPattern.id = fieldLabel[0] + "FillType";  // use consistent key
                selectColumnPattern.name = "plotFields";
                selectColumnPattern.addEventListener('change', function() {
                    logFormFieldValues();
                });

                const patternJsonColumns = {
                    'Solid': '', 
                    'Slanted Line': '/', 
                    'Crosshatch': 'x', 
                    'Dots': '.', 
                    'Horizontal Line': '-', 
                    'Vertical Line': '|'
                };

                Object.entries(patternJsonColumns).forEach(([label, value]) => {
                    option = document.createElement("option");
                    option.value = value;
                    option.innerHTML = label;
                    selectColumnPattern.appendChild(option);
                });

                fieldValueSaved = fillFormFieldValues(selectColumnPattern.id, interactive_arguments);
                if (fieldValueSaved !== undefined) {
                    selectColumnPattern.value = fieldValueSaved;
                }

                // Create and append row
                newRow = document.createElement("div");
                newRow.classList.add("row", "fieldPadding");

                if (fieldLabel[0] !== "XAxis") {
                    fieldLabelNumber = parseInt(fieldLabel[0].slice(-1));
                    if (fieldLabelNumber % 2 !== 0) {
                        newRow.classList.add("row", "fieldBackgroundColor");
                    }
                }

                newColumn1 = document.createElement("div");
                newColumn1.classList.add("col-3");   
                newColumn2 = document.createElement("div");
                newColumn2.classList.add("col");

                newColumn1.appendChild(labelPatternSelect);
                newColumn2.appendChild(selectColumnPattern);
                newRow.append(newColumn1, newColumn2);
                newDiv.append(newRow);
                
                

                //   // Create the informational text box
                //   const infoBox = document.createElement("div");
                //   infoBox.for = fieldLabel[0] + "Color";
                //   infoBox.className = "info-box"; // Optional: for styling
                //   infoBox.textContent = "Optional Settings Below";
                //   infoBox.style.marginTop = "20px";
                //   infoBox.style.marginTop = "20px";
                //   infoBox.style.marginBottom = "20px";

                //   // Insert the info box at the top of the container
                //   newRow.classList.add("row", "fieldBackgroundColor");
                //   newRow.appendChild(infoBox);
                //   newDiv.appendChild(newRow);

                

                //Add checkboxes for error bars, standard deviation, mean, and percentiles
                const features = ["Legend", "Mean", "ErrorBars", "Percentiles", "Stacked"];
                const featureNames = ["Add Bar to Legend", "Mean Line", "Symmetric Error Bars", "90th & 10th Percentile Lines", "Group Bar X Axis By Category"];
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
                    if (["Mean", "ErrorBars", "Stacked"].includes(feature)) {
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

                            if (feature === "Mean" || feature === "ErrorBars") {
                                const autoOpt = document.createElement("option");

                                if (feature != "ErrorBars") {
                                    autoOpt.value = "auto";
                                    autoOpt.innerHTML = "Auto Calculate Based on Bar Column Selection";
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

                        if (feature === "Mean") {
                            const { label, select } = createDropdown("Mean Source Column", fieldLabel[0] + feature + "Field");
                            controls.push(label, select);
                        }

                        if (feature === "Stacked") {
                            const { label: labelColor, input: ColorValue } = createColorfield(`Separator Line Color`, fieldLabel[0] + feature + "SeparatorLineColor");
                            controls.push(labelColor, document.createElement('br'), ColorValue);
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
