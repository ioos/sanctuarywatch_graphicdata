/******/ (() => { // webpackBootstrap
/******/ 	"use strict";
/******/ 	var __webpack_modules__ = ({

/***/ "./includes/figures/js/interactive/plotly-bar.js"
/*!*******************************************************!*\
  !*** ./includes/figures/js/interactive/plotly-bar.js ***!
  \*******************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   producePlotlyBarFigure: () => (/* binding */ producePlotlyBarFigure)
/* harmony export */ });
/* harmony import */ var _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @graphic-data/plotly-utility */ "./includes/figures/js/interactive/plotly-utility.js");

const _barDataEl = document.getElementById('wp-script-module-data-@graphic-data/plotly-bar');
let _barDefaults = {};
if (_barDataEl?.textContent) {
  try {
    _barDefaults = JSON.parse(_barDataEl.textContent);
  } catch {}
}

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
 * @param {HTMLElement} plotDiv         - The DOM element where the Plotly chart is rendered.
 * @param {Object}      layout          - The Plotly layout object, which will be modified to include overlay settings.
 * @param {Array}       mainDataTraces  - The main data traces to be plotted (typically lines).
 * @param {Object}      figureArguments - An object containing user-specified arguments for overlays, such as:
 *                                      - 'EvaluationPeriod': 'on' to enable evaluation period overlay.
 *                                      - 'EvaluationPeriodStartDate', 'EvaluationPeriodEndDate': Date strings for the evaluation period.
 *                                      - 'EvaluationPeriodFillColor': Color for the evaluation period overlay.
 *                                      - 'EvaluationPeriodText': Label for the evaluation period.
 *                                      - 'EventMarkers': 'on' to enable event markers.
 *                                      - 'EventMarkersField': Number of event markers.
 *                                      - 'EventMarkersEventAxis{n}': 'x' or 'y' for each marker.
 *                                      - 'EventMarkersEventText{n}': Label for each marker.
 *                                      - 'EventMarkersEventColor{n}': Color for each marker.
 *                                      - 'EventMarkersEventDate{n}': Date for x-axis marker.
 *                                      - 'EventMarkersEventYValue{n}': Y value for y-axis marker.
 * @param {Object}      dataToBePlotted - The data object containing arrays for each column, used for plotting overlays.
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
 * @return {void}
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
  const dateFormat = figureArguments['XAxisFormat'];
  let xHoverFormat = '';
  switch (dateFormat) {
    case 'YYYY':
      xHoverFormat = '%Y';
      break;
    case 'YYYY-MM':
      xHoverFormat = '%Y-%m';
      break;
    case 'YYYY-MM-DD':
      xHoverFormat = '%Y-%m-%d';
      break;
    default:
      xHoverFormat = '';
    // fallback to raw
  }
  const xHoverValue = xHoverFormat ? `%{x|${xHoverFormat}}` : `%{x}`;
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
      line: {
        color: fillColor,
        width: 0
      },
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
      const lineType = figureArguments[`EventMarkersLineType${i}`] || 'solid';
      if (axisType === 'x') {
        let date = figureArguments[`EventMarkersEventDate${i}`];
        overlays.push({
          x: [date, date],
          y: [yMin, yMax],
          type: 'scatter',
          mode: 'lines',
          line: {
            color,
            width: 2,
            dash: lineType
          },
          name: label,
          showlegend: true,
          yaxis: 'y',
          xaxis: 'x',
          hovertemplate: `${label}: ${xHoverValue}<extra></extra>`
          //hoverinfo: `x`,
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
          line: {
            color,
            width: 2,
            dash: lineType
          },
          name: label,
          showlegend: true,
          yaxis: 'y',
          xaxis: 'x',
          //hoverinfo: `${label} y`,
          hovertemplate: `${label}: %{y}<extra></extra>`
        });
      }
      if (axisType === 'x') {
        let date = figureArguments[`EventMarkersEventDate${i}`];
        layout.shapes = layout.shapes || [];
        layout.shapes.push({
          type: 'line',
          xref: 'x',
          yref: 'paper',
          // "paper" makes it stretch top-to-bottom
          x0: date,
          x1: date,
          y0: 0,
          // bottom edge of the plotting area
          y1: 1,
          // top edge of the plotting area
          line: {
            color: color,
            width: 2,
            dash: lineType
          }
        });
      }
      if (axisType === 'y') {
        let yValue = parseFloat(figureArguments[`EventMarkersEventYValue${i}`], 10);
        // const yArray = Array(plotlyX.length).fill(yValue);
        layout.shapes = layout.shapes || [];
        layout.shapes.push({
          type: 'line',
          xref: 'paper',
          // "paper" means 0–1 relative to full width
          yref: 'y',
          x0: 0,
          // start at left edge of plot
          x1: 1,
          // end at right edge of plot
          y0: yValue,
          y1: yValue,
          line: {
            color: color,
            width: 2,
            dash: lineType
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
 * @param {string}        targetFigureElement                        - The ID of the target HTML element where the chart will be appended.
 * @param {string}        interactive_arguments                      - A JSON string containing the configuration arguments for the chart.
 * @param {string|null}   postID                                     - The WordPress post ID. If null, the function attempts to retrieve the post ID from the admin interface.
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
 * @param {Object}        figureArguments                            - Parsed configuration arguments for the chart.
 * @param {number}        figureArguments.NumberOfBars               - The number of bars to display in the chart.
 * @param {string}        figureArguments.XAxis                      - The column name for the X-axis data.
 * @param {string}        figureArguments.YAxisTitle                 - The title for the Y-axis.
 * @param {string}        figureArguments.showGrid                   - Whether to show grid lines ("on" or "off").
 * @param {string}        figureArguments.graphTicks                 - Whether to show graph ticks ("on" or "off").
 * @param {string}        figureArguments.StackedBarColumns          - Whether bars should be stacked ("on" or "off").
 * @param {string}        figureArguments.Bar{n}                     - The column name for the Y-axis data of the nth bar.
 * @param {string}        figureArguments.Bar{n}Color                - The color of the nth bar.
 * @param {string}        figureArguments.Bar{n}Title                - The title of the nth bar.
 * @param {string}        figureArguments.Bar{n}Stacked              - Whether the nth bar is stacked ("on" or "off").
 * @param {string}        figureArguments.Bar{n}Legend               - Whether to show the legend for the nth bar ("on" or "off").
 * @param {string}        figureArguments.Bar{n}FillType             - The fill pattern for the nth bar.
 * @param {string}        figureArguments.Bar{n}Percentiles          - Whether to show percentiles for the nth bar ("on" or "off").
 * @param {string}        figureArguments.Bar{n}Mean                 - Whether to show the mean line for the nth bar ("on" or "off").
 * @param {string}        figureArguments.Bar{n}MeanField            - The column name for the mean values of the nth bar.
 * @param {string}        figureArguments.Bar{n}ErrorBars            - Whether to show error bars for the nth bar ("on" or "off").
 * @param {string}        figureArguments.Bar{n}ErrorBarsInputValues - The column name for error bar values or "auto".
 * @param {string}        figureArguments.Bar{n}ErrorBarsColor       - The color of the error bars for the nth bar.
 *
 * @param {Object}        layout                                     - The layout configuration for the Plotly chart.
 * @param {string}        layout.barmode                             - The bar mode ("stack" or "group").
 * @param {Object}        layout.xaxis                               - Configuration for the X-axis.
 * @param {Object}        layout.yaxis                               - Configuration for the Y-axis.
 * @param {Object}        layout.legend                              - Configuration for the chart legend.
 *
 * @param {Object}        config                                     - The rendering configuration for the Plotly chart.
 * @param {boolean}       config.responsive                          - Whether the chart is responsive to window resizing.
 * @param {string}        config.renderer                            - The rendering mode ("svg" or "webgl").
 * @param {boolean}       config.displayModeBar                      - Whether to display the mode bar.
 * @param {Array<string>} config.modeBarButtonsToRemove              - List of mode bar buttons to remove.
 */
async function producePlotlyBarFigure(targetFigureElement, interactive_arguments, postID, targetDocument = document) {
  try {
    const renderDocument = targetDocument || document;
    await (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.loadPlotlyScript)(); // ensures Plotly is ready

    const rawField = interactive_arguments;
    const figureArguments = Object.fromEntries(JSON.parse(rawField));
    const rootURL = window.location.origin;
    let figureID = '';

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

    //Important for blocks to work - We need one to work with the document from the block and one for the regular document the function normally runs in.
    let newDiv;
    if (!targetDocument) {
      newDiv = document.createElement('div');
    }
    if (targetDocument) {
      newDiv = renderDocument.createElement('div');
    }

    // considerations for unique hashing for multiple uses vs onetime use.
    let plotlyDivID = `plotlyFigure${figureID}`;
    // let plotlyDivID;
    // const uniqueHash = window.crypto?.randomUUID?.() ||`${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    // if (!targetDocument) {
    // 	plotlyDivID = `plotlyFigure${figureID}`;
    // }
    // if (targetDocument) {
    // 	plotlyDivID = `plotlyFigure${figureID}_${uniqueHash}`;
    // }

    newDiv.id = plotlyDivID;
    newDiv.classList.add("container", `figure_interactive${figureID}`);
    let targetElement = await (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.waitForElementById)(targetFigureElement);
    targetElement.appendChild(newDiv);
    // let targetElement;
    // if (!targetDocument) {
    // 	targetElement = await waitForElementById(targetFigureElement);
    // 	targetElement.appendChild(newDiv);
    // }
    // if (targetDocument) {
    // 	targetElement = renderDocument.getElementById(targetFigureElement);
    // 	targetElement.appendChild(newDiv);
    // }

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
      const dateFormat = figureArguments['XAxisFormat'];
      let xHoverFormat = '';
      switch (dateFormat) {
        case 'YYYY':
          xHoverFormat = '%Y';
          break;
        case 'YYYY-MM':
          xHoverFormat = '%Y-%m';
          break;
        case 'YYYY-MM-DD':
          xHoverFormat = '%Y-%m-%d';
          break;
        default:
          xHoverFormat = '';
        // fallback to raw
      }
      const xHoverValue = xHoverFormat ? `%{x|${xHoverFormat}}` : `%{x}`;

      //console.log('fillType', fillType);

      function lightenColor(hex, factor = 0.2) {
        const rgb = parseInt(hex.slice(1), 16);
        const r = Math.min(255, Math.floor((rgb >> 16 & 0xff) + 255 * factor));
        const g = Math.min(255, Math.floor((rgb >> 8 & 0xff) + 255 * factor));
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
              pattern: {
                shape: fillType,
                size: 4,
                solidity: 0.5
              }
            },
            //hovertemplate: `${columnXHeader}: ${stackCategory}`
            hovertemplate: `${figureArguments['XAxisTitle'] || columnXHeader}: ${xHoverValue}<br>${figureArguments['YAxisTitle'] || ''}: %{y}<extra></extra>`
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
        const p10 = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.computePercentile)(plotlyY, 10);
        const p90 = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.computePercentile)(plotlyY, 90);
        const filteredX = plotlyX.filter(item => item !== "");
        const xMinPercentile = Math.min(...filteredX);
        const xMaxPercentile = Math.max(...filteredX);
        if (showPercentiles === 'on') {
          allBarsPlotly.push({
            x: [xMinPercentile, xMaxPercentile],
            y: [p10, p10],
            mode: 'lines',
            line: {
              dash: 'dot',
              color: figureArguments[targetBarColumn + 'Color'] + '60'
            },
            name: `${figureArguments[targetBarColumn + 'Title']} 10th Percentile (Bottom)`,
            type: 'scatter',
            visible: true,
            showlegend: false
          });
          allBarsPlotly.push({
            x: [xMinPercentile, xMaxPercentile],
            y: [p90, p90],
            mode: 'lines',
            line: {
              dash: 'dot',
              color: figureArguments[targetBarColumn + 'Color'] + '60'
            },
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
          let plotlyYSafeArrayLength = plotlyY.filter(value => value !== null && value !== "NA").length;
          const mean = plotlyYSafeArray.reduce((a, b) => a + b, 0) / plotlyYSafeArrayLength;
          const filteredX = plotlyX.filter(item => item !== "");
          let xMin;
          let xMax;
          xMin = Math.min(...filteredX);
          xMax = Math.max(...filteredX);
          if (isNaN(xMin) || isNaN(xMax)) {
            xMin = new Date(filteredX[0]);
            xMax = new Date(filteredX[filteredX.length - 1]);
          }
          allBarsPlotly.push({
            x: [xMin, xMax],
            y: [mean, mean],
            mode: 'lines',
            line: {
              dash: 'solid',
              color: figureArguments[targetBarColumn + 'Color'] + '60'
            },
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
          let xMin;
          let xMax;
          xMin = Math.min(...filteredX);
          xMax = Math.max(...filteredX);
          if (isNaN(xMin) || isNaN(xMax)) {
            xMin = new Date(filteredX[0]);
            xMax = new Date(filteredX[filteredX.length - 1]);
          }
          allBarsPlotly.push({
            x: [xMin, xMax],
            y: [mean, mean],
            mode: 'lines',
            line: {
              dash: 'solid',
              color: figureArguments[targetBarColumn + 'Color'] + '60'
            },
            name: `${figureArguments[targetBarColumn + 'Title']} Mean`,
            type: 'scatter',
            visible: true,
            showlegend: showLegendBool
          });
        }
      }
      // === Optional Overlays and Error Bars ===
      const errorArrayRaw = figureArguments[targetBarColumn + 'ErrorBars'] === 'on' ? figureArguments[targetBarColumn + 'ErrorBarsInputValues'] === 'auto' ? new Array(plotlyY.length).fill((0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.computeStandardDeviation)(plotlyY)) : (dataToBePlotted[figureArguments[targetBarColumn + 'ErrorBarsInputValues']] || []).map(val => parseFloat(val)).filter(val => !isNaN(val)) : null;
      const error_y = errorArrayRaw ? {
        type: 'data',
        array: errorArrayRaw,
        visible: true,
        color: figureArguments[targetBarColumn + 'ErrorBarsColor'] || '#000',
        thickness: 1,
        width: 5
      } : undefined;
      if (!(isStacked === 'on' && columnXHeader !== 'None')) {
        const trace = {
          x: plotlyX,
          y: plotlyY,
          type: 'bar',
          name: `${figureArguments[targetBarColumn + 'Title']}`,
          showlegend: showLegendBool,
          marker: {
            color: figureArguments[targetBarColumn + 'Color'],
            pattern: {
              shape: fillType,
              size: 4,
              solidity: 0.5
            }
          },
          //hovertemplate: `${figureArguments['XAxisTitle'] || ''}: %{x}<br>${figureArguments['YAxisTitle'] || ''}: %{y}`,
          hovertemplate: `${figureArguments['XAxisTitle'] || columnXHeader}: ${xHoverValue}<br>${figureArguments['YAxisTitle'] || ''}: %{y}<extra></extra>`,
          ...(error_y ? {
            error_y
          } : {})
        };
        allBarsPlotly.push(trace);
      }
    }

    // Set layout barmode based on stacked column option
    var layout = {
      barmode: barStackedByX ? 'stack' : 'group',
      xaxis: {
        title: {
          text: figureArguments['XAxisTitle'] || ''
        },
        linecolor: 'black',
        linewidth: 1,
        tickmode: 'array',
        tickangle: -45,
        automargin: true,
        range: [figureArguments['XAxisLowBound'], figureArguments['XAxisHighBound']],
        tickmode: graphTickModeBool,
        ticks: graphTickPositionBool
      },
      yaxis: {
        title: {
          text: figureArguments['YAxisTitle'] || ''
        },
        linecolor: 'black',
        linewidth: 1,
        rangemode: 'tozero',
        autorange: figureArguments['YAxisLowBound'] === '' && figureArguments['YAxisHighBound'] === '' ? true : false,
        range: figureArguments['YAxisLowBound'] !== '' && figureArguments['YAxisHighBound'] !== '' ? [parseFloat(figureArguments['YAxisLowBound']), parseFloat(figureArguments['YAxisHighBound'])] : undefined,
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
      margin: {
        t: 60,
        b: 60,
        l: 60,
        r: 60
      },
      cliponaxis: true
    };
    const config = {
      responsive: true,
      // This makes the plot resize with the browser window
      renderer: 'svg',
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['zoom2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian' //'toImage', 'resetScale2d', 'select2d'
      ]
    };

    // Set up the plotlyDiv (The div the the plot will be rendered in)
    let plotDiv = document.getElementById(plotlyDivID);
    // let plotDiv;
    // if (!targetDocument) {
    // 	plotDiv = document.getElementById(plotlyDivID);
    // }
    // if (targetDocument) {
    // 	plotDiv = renderDocument.getElementById(plotlyDivID);
    // }      
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
    Plotly.Plots.resize(plotDiv);
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
 * @return {void}
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
function loadDefaultInteractiveBarArguments(jsonColumns) {
  // ---------- helpers ----------
  function safeParseJSON(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }
  function pairsToObject(pairs) {
    const o = {};
    if (Array.isArray(pairs)) {
      for (const p of pairs) {
        if (Array.isArray(p) && p.length >= 2) {
          o[String(p[0])] = String(p[1] ?? '');
        }
      }
    }
    return o;
  }
  function kvStringToObject(str) {
    const o = {};
    if (!str) {
      return o;
    }
    for (const part of str.split(/[;,]/)) {
      const [k, v] = part.split(/[:=]/).map(s => (s || '').trim());
      if (k) {
        o[k] = v ?? '';
      }
    }
    return o;
  }
  function toObjectFlexible(s) {
    if (!s) {
      return {};
    }
    const asJSON = safeParseJSON(s);
    if (asJSON && typeof asJSON === 'object') {
      return Array.isArray(asJSON) ? pairsToObject(asJSON) : asJSON;
    }
    return kvStringToObject(s);
  }
  function toPairsFlexible(s) {
    const asJSON = safeParseJSON(s);
    if (Array.isArray(asJSON)) {
      return asJSON;
    }
    const obj = toObjectFlexible(s);
    return Object.entries(obj).map(([k, v]) => [k, v]);
  }
  // preserve original order from currentPairs; append unseen keys at the end
  function objectToPairsPreserveOrder(obj, currentPairs) {
    const seen = new Set();
    const out = [];
    for (const [k] of currentPairs) {
      if (!seen.has(k) && k in obj) {
        out.push([k, String(obj[k] ?? '')]);
        seen.add(k);
      }
    }
    // append any remaining keys (e.g., required keys not in original)
    for (const k of Object.keys(obj)) {
      if (!seen.has(k)) {
        out.push([k, String(obj[k] ?? '')]);
      }
    }
    return out;
  }

  // ---------- main ----------
  const field = document.getElementsByName('figure_interactive_arguments')[0];
  if (!field) {
    return;
  }
  const currentStr = field.value || '';
  const defaultsStr = _barDefaults.interactive_bar_arguments || '';

  // Parse both to objects and keep original pair order from current
  const currentPairs = toPairsFlexible(currentStr);
  const currentObj = toObjectFlexible(currentStr);
  const defaultsObj = toObjectFlexible(defaultsStr);

  // How many bars should be considered?
  const numEl = document.getElementById('NumberOfBars');
  const numberOfBars = numEl && numEl.value ? parseInt(numEl.value, 10) : 0;
  if (numberOfBars > 0) {
    currentObj.NumberOfBars = String(numberOfBars);
  }

  // Overwrite ONLY keys that:
  //  - start with Bar1..Bar{N}, AND
  //  - already exist in currentObj, AND
  //  - also exist in defaultsObj
  if (numberOfBars > 0) {
    const barPrefixes = Array.from({
      length: numberOfBars
    }, (_, i) => `Bar${i + 1}`);
    for (const key of Object.keys(currentObj)) {
      const isWithinBars = barPrefixes.some(prefix => key.startsWith(prefix));
      if (isWithinBars && key in defaultsObj) {
        currentObj[key] = defaultsObj[key];
      }
    }
  }

  // Ensure/overwrite these non-bar keys regardless of bar count
  currentObj.showGrid = defaultsObj.showGrid ?? 'on';
  currentObj.graphTicks = defaultsObj.graphTicks ?? 'on';
  currentObj.XAxisFormat = defaultsObj.XAxisFormat ?? 'YYYY';

  // Convert back to array-of-pairs, preserving the original order from currentPairs
  const mergedPairs = objectToPairsPreserveOrder(currentObj, currentPairs);

  // Write back EXACTLY as array-of-pairs JSON
  const mergedPairs_string = JSON.stringify(mergedPairs);

  //console.log('interactive_arguments', currentStr);
  //console.log('default_interactive_arguments', defaultsStr);
  //console.log('mergedPairs_string', mergedPairs_string);

  document.getElementsByName('figure_interactive_arguments')[0].value = mergedPairs_string;
  displayBarFields(numberOfBars, jsonColumns, mergedPairs_string);
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
 * @param {Object} jsonColumns           - An object representing available data columns, where keys are column identifiers and values are column names.
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
function plotlyBarParameterFields(jsonColumns, interactive_arguments) {
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
    let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkbox.id, interactive_arguments);
    checkbox.value = fieldValueSaved === 'on' ? 'on' : "";
    checkbox.checked = fieldValueSaved === 'on';

    // Toggle visibility dynamically
    checkbox.addEventListener('change', function () {
      checkbox.value = checkbox.checked ? 'on' : "";
      (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
    });
    newColumn1.appendChild(label);
    newColumn2.appendChild(checkbox);
    newRow.append(newColumn1, newColumn2);
    newDiv.append(newRow);
    newRow.style.display = "none";
  }

  // Create input fields for X and Y Axis Titles
  const axisTitleArray = ["X", "Y"];
  axisTitleArray.forEach(axisTitle => {
    newRow = document.createElement("div");
    newRow.classList.add("row", "fieldPadding");
    newColumn1 = document.createElement("div");
    newColumn1.classList.add("col-3");
    newColumn2 = document.createElement("div");
    newColumn2.classList.add("col");
    let labelInputAxis = document.createElement("label");
    labelInputAxis.for = axisTitle + "AxisTitle";
    labelInputAxis.innerHTML = axisTitle + " Axis Options";
    let labelInputAxisTitle = document.createElement("label");
    labelInputAxisTitle.for = axisTitle + "AxisTitle";
    labelInputAxisTitle.innerHTML = "Title";
    let inputAxisTitle = document.createElement("input");
    inputAxisTitle.id = axisTitle + "AxisTitle";
    inputAxisTitle.name = "plotFields";
    inputAxisTitle.size = "70";
    let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputAxisTitle.id, interactive_arguments);
    if (fieldValueSaved != undefined) {
      inputAxisTitle.value = fieldValueSaved;
    }
    inputAxisTitle.addEventListener('change', function () {
      (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
    });
    newColumn1.appendChild(labelInputAxis);
    newColumn2.appendChild(labelInputAxisTitle);
    newColumn2.appendChild(document.createElement("br"));
    newColumn2.appendChild(inputAxisTitle);
    newRow.append(newColumn1, newColumn2);
    newDiv.append(newRow);
    const rangeBound = ["Low", "High"];
    newRow = document.createElement("div");
    newRow.classList.add("row", "fieldPadding");
    newColumn1 = document.createElement("div");
    newColumn1.classList.add("col-3");
    newColumn2 = document.createElement("div");
    newColumn2.classList.add("col");
    const boundsWrapper = document.createElement('div');
    boundsWrapper.classList.add('row');
    rangeBound.forEach(bound => {
      const boundColumn = document.createElement('div');
      boundColumn.classList.add('col');
      let inputBound = document.createElement("input");
      inputBound.id = axisTitle + "Axis" + bound + "Bound";
      inputBound.name = "plotFields";
      inputBound.type = "number";
      let labelBound = document.createElement("label");
      labelBound.for = axisTitle + bound + "Bound";
      labelBound.innerHTML = bound + " Bound (both required)";
      fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputBound.id, interactive_arguments);
      if (fieldValueSaved != undefined) {
        inputBound.value = fieldValueSaved;
      }
      inputBound.addEventListener('change', function () {
        (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
      });
      boundColumn.append(labelBound, document.createElement('br'), inputBound);
      boundsWrapper.appendChild(boundColumn);
    });
    newColumn2.appendChild(boundsWrapper);
    newRow.append(newColumn1, newColumn2);
    newDiv.append(newRow);
  });

  // Create select field for number of lines to be plotted
  let labelSelectNumberBars = document.createElement("label");
  labelSelectNumberBars.for = "NumberOfBars";
  labelSelectNumberBars.innerHTML = "Number of Bars to Be Plotted";
  let selectNumberBars = document.createElement("select");
  selectNumberBars.id = "NumberOfBars";
  selectNumberBars.name = "plotFields";
  selectNumberBars.addEventListener('change', function () {
    displayBarFields(selectNumberBars.value, jsonColumns, interactive_arguments);
  });
  selectNumberBars.addEventListener('change', function () {
    (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
  });
  for (let i = 1; i < 15; i++) {
    let selectNumberBarsOption = document.createElement("option");
    selectNumberBarsOption.value = i;
    selectNumberBarsOption.innerHTML = i;
    selectNumberBars.appendChild(selectNumberBarsOption);
  }
  let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectNumberBars.id, interactive_arguments);
  if (fieldValueSaved != undefined) {
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
  selectXAxisFormat.addEventListener('change', function () {
    (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
  });
  const dateFormats = ["None", "YYYY", "YYYY-MM", "YYYY-MM-DD"];
  dateFormats.forEach(dateFormat => {
    let selectXAxisFormatOption = document.createElement("option");
    selectXAxisFormatOption.value = dateFormat;
    selectXAxisFormatOption.innerHTML = dateFormat;
    selectXAxisFormat.appendChild(selectXAxisFormatOption);
  });
  fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectXAxisFormat.id, interactive_arguments);
  if (fieldValueSaved != undefined) {
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
 * @param {number} numBars               - The number of bars to be plotted in the chart.
 * @param {Object} jsonColumns           - An object representing the available data columns, where keys are column identifiers
 *                                       and values are column names.
 * @param {Object} interactive_arguments - An object containing previously saved form field values, used to prepopulate
 *                                       the GUI fields.
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
function displayBarFields(numBars, jsonColumns, interactive_arguments) {
  const assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
  // If the element exists
  if (assignColumnsToPlot) {
    // Remove the scene window
    assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
  }
  if (numBars > 0) {
    const newDiv = document.createElement('div');
    newDiv.id = 'assignColumnsToPlot';

    //"EvaluationPeriod" & "EventMarkers"
    const features = ['EvaluationPeriod', 'EventMarkers'];
    const featureNames = ['Evaluation Period', 'Event Markers'];
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      const featureName = featureNames[i];
      let newRow = document.createElement('div');
      newRow.classList.add('row', 'fieldPadding');
      const newColumn1 = document.createElement('div');
      newColumn1.classList.add('col-3');
      const newColumn2 = document.createElement('div');
      newColumn2.classList.add('col');
      const label = document.createElement('label');
      label.for = feature;
      label.innerHTML = `${featureName}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = feature;
      checkbox.name = 'plotFields';
      const fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkbox.id, interactive_arguments);
      checkbox.value = fieldValueSaved === 'on' ? 'on' : '';
      checkbox.checked = fieldValueSaved === 'on';
      newColumn1.appendChild(label);
      newColumn2.appendChild(checkbox);
      newRow.append(newColumn1, newColumn2);
      newRow.style.marginTop = '20px';
      newRow.style.marginBottom = '20px';
      newDiv.append(newRow);

      // === Add dropdowns for feature-specific data ===
      if (['EvaluationPeriod', 'EventMarkers'].includes(feature)) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('row', 'fieldPadding');
        const dropdownLabelCol = document.createElement('div');
        dropdownLabelCol.classList.add('col-3');
        const dropdownInputCol = document.createElement('div');
        dropdownInputCol.classList.add('col');
        function createDropdown(labelText, selectId) {
          const label = document.createElement('label');
          label.innerHTML = labelText;
          const select = document.createElement('select');
          select.id = selectId;
          select.name = 'plotFields';
          if (feature === 'EventMarkers') {
            for (const col of [1, 2, 3, 4, 5, 6]) {
              const opt = document.createElement('option');
              opt.value = col;
              opt.innerHTML = col;
              select.appendChild(opt);
            }
            const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(select.id, interactive_arguments);
            if (saved) {
              select.value = saved;
            }
            select.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
            return {
              label,
              select
            };
          }
        }
        function createDatefield(labelText, inputId) {
          const label = document.createElement('label');
          label.textContent = labelText;
          label.htmlFor = inputId; // Link label to input

          const input = document.createElement('input'); // Correct element
          input.type = 'date';
          input.id = inputId;
          input.name = 'plotFields';
          const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
          if (saved) {
            input.value = saved;
          }
          input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
          return {
            label,
            input
          };
        }
        function createTextfield(labelText, inputId) {
          const label = document.createElement('label');
          label.textContent = labelText;
          label.htmlFor = inputId; // Link label to input

          const input = document.createElement('input'); // Correct element
          input.type = 'text';
          input.id = inputId;
          input.name = 'plotFields';
          input.style.width = '200px';
          const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
          if (saved) {
            input.value = saved;
          }
          input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
          return {
            label,
            input
          };
        }
        function createColorfield(labelText, inputId) {
          const label = document.createElement('label');
          label.textContent = labelText;
          label.htmlFor = inputId; // Link label to input

          const input = document.createElement('input'); // Correct element
          input.type = 'color';
          input.id = inputId;
          input.name = 'plotFields';
          const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
          if (saved) {
            input.value = saved;
          }
          input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
          return {
            label,
            input
          };
        }
        const controls = [];
        if (feature === 'EvaluationPeriod') {
          const {
            label: labelStartDate,
            input: StartDateValues
          } = createDatefield(`Start Date`, feature + 'StartDate');
          const {
            label: labelEndDate,
            input: EndDateValues
          } = createDatefield('End Date', feature + 'EndDate');
          const {
            label: labelColor,
            input: ColorValue
          } = createColorfield(`Fill Color`, feature + 'FillColor');
          const {
            label: textLabel,
            input: textInput
          } = createTextfield(`Display Text`, feature + 'Text');
          controls.push(labelStartDate, document.createElement('br'), StartDateValues, document.createElement('br'), document.createElement('br'), labelEndDate, document.createElement('br'), EndDateValues, document.createElement('br'), document.createElement('br'), labelColor, document.createElement('br'), ColorValue, document.createElement('br'), document.createElement('br'), textLabel, document.createElement('br'), textInput, document.createElement('br'));
        }
        if (feature === 'EventMarkers') {
          const {
            label,
            select
          } = createDropdown('Number of Event Markers', feature + 'Field');
          controls.push(label, select);

          // A wrapper that we'll (re)fill with the N sets of fields
          const wrapper = document.createElement('div');
          wrapper.id = feature + 'FieldsWrapper';
          controls.push(wrapper);
          const renderEventMarkerFields = n => {
            wrapper.innerHTML = ''; // Clear previous

            for (let i = 0; i < n; i++) {
              // === Axis Selector ===
              const axisLabel = document.createElement('label');
              axisLabel.textContent = `Event Marker Axis ${i + 1}`;
              const axisSelect = document.createElement('select');
              axisSelect.id = `${feature}EventAxis${i}`;
              axisSelect.name = 'plotFields';
              ['x', 'y'].forEach(axis => {
                const opt = document.createElement('option');
                opt.value = axis;
                opt.textContent = axis.toUpperCase() + ' Axis';
                axisSelect.appendChild(opt);
              });
              const savedAxis = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(axisSelect.id, interactive_arguments);
              if (savedAxis) {
                axisSelect.value = savedAxis;
              }

              // === Line Type Selector ===
              const lineTypeLabel = document.createElement('label');
              lineTypeLabel.textContent = `Line Type ${i + 1}`;
              lineTypeLabel.htmlFor = `${feature}LineType${i}`;
              const lineTypeSelect = document.createElement('select');
              lineTypeSelect.id = `${feature}LineType${i}`;
              lineTypeSelect.name = 'plotFields';
              ['solid', 'dash', 'dot', 'dashdot', 'longdash', 'longdashdot'].forEach(type => {
                const opt = document.createElement('option');
                opt.value = type;
                opt.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                lineTypeSelect.appendChild(opt);
              });
              const savedLineType = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(lineTypeSelect.id, interactive_arguments);

              // Important: force a default value even if nothing is saved yet
              lineTypeSelect.value = savedLineType || 'solid';
              lineTypeSelect.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);

              // === Shared Inputs ===
              const {
                label: textLabel,
                input: textInput
              } = createTextfield(`Display Text ${i + 1}`, `${feature}EventText${i}`);
              const {
                label: colorLabel,
                input: colorInput
              } = createColorfield(`Line Color ${i + 1}`, `${feature}EventColor${i}`);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(textInput.id, interactive_arguments);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(colorInput.id, interactive_arguments);

              // === X-axis Fields ===
              const xWrapper = document.createElement('div');
              const {
                label: dateLabel,
                input: dateInput
              } = createDatefield(`Event Date ${i + 1} (X-Axis)`, `${feature}EventDate${i}`);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(dateInput.id, interactive_arguments);
              xWrapper.append(dateLabel, document.createElement('br'), dateInput, document.createElement('br'));

              // === Y-axis Fields ===
              const yWrapper = document.createElement('div');
              const {
                label: yLabel,
                input: yInput
              } = createTextfield(`Event Y Value ${i + 1}`, `${feature}EventYValue${i}`);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(yInput.id, interactive_arguments);
              yWrapper.append(yLabel, document.createElement('br'), yInput, document.createElement('br'));

              // === Container & Toggle Logic ===
              const block = document.createElement('div');
              block.append(document.createElement('hr'), axisLabel, document.createElement('br'), axisSelect, document.createElement('br'), document.createElement('br'), lineTypeSelect, document.createElement('br'), document.createElement('br'), xWrapper, yWrapper, document.createElement('br'), textLabel, document.createElement('br'), textInput, document.createElement('br'), document.createElement('br'), colorLabel, document.createElement('br'), colorInput, document.createElement('br'));

              // Handle visibility
              const toggleAxisFields = val => {
                xWrapper.style.display = val === 'x' ? 'block' : 'none';
                yWrapper.style.display = val === 'y' ? 'block' : 'none';
              };
              toggleAxisFields(axisSelect.value); // Initial state
              axisSelect.addEventListener('change', e => {
                toggleAxisFields(e.target.value);
                (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
              });
              wrapper.appendChild(block);
            }
          };

          // Initial render using saved or current value
          const initialN = parseInt(select.value, 10) || 0;
          renderEventMarkerFields(initialN);

          // Re-render on change
          select.addEventListener('change', e => {
            const n = parseInt(e.target.value, 10) || 0;
            renderEventMarkerFields(n);
          });
        }

        // Initially hide the dropdown container
        dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
        controls.forEach(control => dropdownInputCol.appendChild(control));
        dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
        newDiv.append(dropdownContainer);

        // Toggle visibility dynamically
        checkbox.addEventListener('change', function () {
          checkbox.value = checkbox.checked ? 'on' : '';
          dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
      } else {
        checkbox.addEventListener('change', function () {
          checkbox.value = checkbox.checked ? 'on' : '';
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
      }
    }
    const newHR = document.createElement('hr');
    newHR.style = 'margin-top:15px';
    newDiv.append(newHR);

    // Add checkbox for StackedBarColumns
    const labelStackedBarColumns = document.createElement('label');
    labelStackedBarColumns.for = 'StackedBarColumns';
    labelStackedBarColumns.innerHTML = 'Group Bars by X Axis (Stacked Columns)';
    const checkboxStackedBarColumns = document.createElement('input');
    checkboxStackedBarColumns.type = 'checkbox';
    checkboxStackedBarColumns.id = 'StackedBarColumns';
    checkboxStackedBarColumns.name = 'plotFields';
    checkboxStackedBarColumns.addEventListener('change', function () {
      checkboxStackedBarColumns.value = checkboxStackedBarColumns.checked ? 'on' : '';
      (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
    });
    let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkboxStackedBarColumns.id, interactive_arguments);
    checkboxStackedBarColumns.checked = fieldValueSaved === 'on'; // only true if exactly "on"
    checkboxStackedBarColumns.value = checkboxStackedBarColumns.checked ? 'on' : '';
    let newRow = document.createElement('div');
    newRow.classList.add('row', 'fieldPadding');
    let newColumn1 = document.createElement('div');
    newColumn1.classList.add('col-3');
    let newColumn2 = document.createElement('div');
    newColumn2.classList.add('col');
    newColumn1.appendChild(labelStackedBarColumns);
    newColumn2.appendChild(checkboxStackedBarColumns);
    newRow.append(newColumn1, newColumn2);
    newDiv.append(newRow);

    // Create the button for default styles
    const labelApplyDefaults = document.createElement('label');
    labelApplyDefaults.for = 'ApplyBarDefaults';
    labelApplyDefaults.innerHTML = 'Apply Custom Bar Styles to All Bars';
    const btnApplyDefaults = document.createElement('button');
    btnApplyDefaults.id = 'ApplyBarDefaults';
    btnApplyDefaults.type = 'button'; // prevent accidental form submit
    btnApplyDefaults.classList.add('button', 'button-primary'); // WP admin button style
    btnApplyDefaults.innerHTML = 'Click to Apply Styles';
    btnApplyDefaults.addEventListener('click', function () {
      loadDefaultInteractiveBarArguments(jsonColumns);
    });
    const newRowBtn = document.createElement('div');
    newRowBtn.classList.add('row', 'fieldPadding');
    const newColumn1Btn = document.createElement('div');
    newColumn1Btn.classList.add('col-3');
    const newColumn2Btn = document.createElement('div');
    newColumn2Btn.classList.add('col');
    newColumn1Btn.appendChild(labelApplyDefaults);
    newColumn2Btn.appendChild(btnApplyDefaults);
    newRowBtn.append(newColumn1Btn, newColumn2Btn);
    newDiv.append(newRowBtn);

    //Create select fields for X Axis and each line to be plotted
    const fieldLabels = [['XAxis', 'X Axis Column']];
    for (let i = 1; i <= numBars; i++) {
      fieldLabels.push(['Bar' + i, 'Bar ' + i + ' Column']);
    }
    fieldLabels.forEach(fieldLabel => {
      const labelSelectColumn = document.createElement('label');
      labelSelectColumn.for = fieldLabel[0];
      labelSelectColumn.innerHTML = fieldLabel[1];
      const selectColumn = document.createElement('select');
      selectColumn.id = fieldLabel[0];
      selectColumn.name = 'plotFields';
      selectColumn.addEventListener('change', function () {
        (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
      });
      let selectColumnOption = document.createElement('option');
      selectColumnOption.value = 'None';
      selectColumnOption.innerHTML = 'None';
      selectColumn.appendChild(selectColumnOption);
      Object.entries(jsonColumns).forEach(([jsonColumnsKey, jsonColumnsValue]) => {
        selectColumnOption = document.createElement('option');
        selectColumnOption.value = jsonColumnsValue; // jsonColumnsKey;
        selectColumnOption.innerHTML = jsonColumnsValue;
        selectColumn.appendChild(selectColumnOption);
      });
      fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectColumn.id, interactive_arguments);
      if (fieldValueSaved != undefined) {
        selectColumn.value = fieldValueSaved;
      }
      let newRow = document.createElement('div');
      newRow.classList.add('row', 'fieldPadding');
      let fieldLabelNumber = '';
      if (fieldLabel[0] != 'XAxis') {
        fieldLabelNumber = parseInt(fieldLabel[0].slice(-1));
        if (fieldLabelNumber % 2 != 0) {
          newRow.classList.add('row', 'fieldBackgroundColor');
        }
      }
      let newColumn1 = document.createElement('div');
      newColumn1.classList.add('col-3');
      let newColumn2 = document.createElement('div');
      newColumn2.classList.add('col');
      newColumn1.appendChild(labelSelectColumn);
      newColumn2.appendChild(selectColumn);
      newRow.append(newColumn1, newColumn2);
      newDiv.append(newRow);
      if (fieldLabel[0] != 'XAxis') {
        // Add line label field
        newRow = document.createElement('div');
        newRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          newRow.classList.add('row', 'fieldBackgroundColor');
        }
        newColumn1 = document.createElement('div');
        newColumn1.classList.add('col-3');
        newColumn2 = document.createElement('div');
        newColumn2.classList.add('col');
        const labelInputTitle = document.createElement('label');
        labelInputTitle.for = fieldLabel[0] + 'Title';
        labelInputTitle.innerHTML = fieldLabel[1] + ' Title';
        const inputTitle = document.createElement('input');
        inputTitle.id = fieldLabel[0] + 'Title';
        inputTitle.size = '70';
        inputTitle.name = 'plotFields';
        inputTitle.addEventListener('change', function () {
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
        fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputTitle.id, interactive_arguments);
        if (fieldValueSaved != undefined) {
          inputTitle.value = fieldValueSaved;
        }
        if (fieldValueSaved === undefined) {
          // Make each line's default title set to the name of the column name that is selected for that line. Only if the line title is not already set.
          //const DropdownValueSaved = fillFormFieldValues(selectColumn.id, interactive_arguments);
          if (fieldLabel[0].includes('Bar')) {
            selectColumn.addEventListener('change', function () {
              let DropdownValueSaved = selectColumn.value;
              if (DropdownValueSaved != 'None' && fieldValueSaved === undefined) {
                inputTitle.value = DropdownValueSaved;
                (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
              }
            });
          }
        }
        newColumn1.appendChild(labelInputTitle);
        newColumn2.appendChild(inputTitle);
        newRow.append(newColumn1, newColumn2);
        newDiv.append(newRow);

        // Add color field
        newRow = document.createElement('div');
        newRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          newRow.classList.add('row', 'fieldBackgroundColor');
        }
        newColumn1 = document.createElement('div');
        newColumn1.classList.add('col-3');
        newColumn2 = document.createElement('div');
        newColumn2.classList.add('col');
        const labelInputColor = document.createElement('label');
        labelInputColor.for = fieldLabel[0] + 'Color';
        labelInputColor.innerHTML = fieldLabel[1] + ' Color';
        const inputColor = document.createElement('input');
        inputColor.id = fieldLabel[0] + 'Color';
        inputColor.name = 'plotFields';
        inputColor.type = 'color';
        fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputColor.id, interactive_arguments);
        if (fieldValueSaved != undefined) {
          inputColor.value = fieldValueSaved;
        }
        inputColor.addEventListener('change', function () {
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
        newColumn1.appendChild(labelInputColor);
        newColumn2.appendChild(inputColor);
        newRow.append(newColumn1, newColumn2);
        newDiv.append(newRow);

        // Create pattern/fill select field
        const labelPatternSelect = document.createElement('label');
        labelPatternSelect.htmlFor = fieldLabel[0] + 'FillType';
        labelPatternSelect.innerHTML = fieldLabel[1] + ' Fill Type';
        const selectColumnPattern = document.createElement('select');
        selectColumnPattern.id = fieldLabel[0] + 'FillType'; // use consistent key
        selectColumnPattern.name = 'plotFields';
        selectColumnPattern.addEventListener('change', function () {
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
        const patternJsonColumns = {
          Solid: '',
          'Slanted Line': '/',
          Crosshatch: 'x',
          Dots: '.',
          'Horizontal Line': '-',
          'Vertical Line': '|'
        };
        Object.entries(patternJsonColumns).forEach(([label, value]) => {
          let option = document.createElement('option');
          option.value = value;
          option.innerHTML = label;
          selectColumnPattern.appendChild(option);
        });
        fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectColumnPattern.id, interactive_arguments);
        if (fieldValueSaved !== undefined) {
          selectColumnPattern.value = fieldValueSaved;
        }

        // Create and append row
        newRow = document.createElement('div');
        newRow.classList.add('row', 'fieldPadding');
        if (fieldLabel[0] !== 'XAxis') {
          fieldLabelNumber = parseInt(fieldLabel[0].slice(-1));
          if (fieldLabelNumber % 2 !== 0) {
            newRow.classList.add('row', 'fieldBackgroundColor');
          }
        }
        newColumn1 = document.createElement('div');
        newColumn1.classList.add('col-3');
        newColumn2 = document.createElement('div');
        newColumn2.classList.add('col');
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
        const features = ['Legend', 'Mean', 'ErrorBars', 'Percentiles', 'Stacked'];
        const featureNames = ['Add Bar to Legend', 'Mean Line', 'Symmetric Error Bars', '90th & 10th Percentile Lines', 'Group Bar X Axis By Category'];
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          const featureName = featureNames[i];
          const newRow = document.createElement('div');
          newRow.classList.add('row', 'fieldPadding');
          if (fieldLabelNumber % 2 != 0) {
            newRow.classList.add('row', 'fieldBackgroundColor');
          }
          const newColumn1 = document.createElement('div');
          newColumn1.classList.add('col-3');
          const newColumn2 = document.createElement('div');
          newColumn2.classList.add('col');
          const label = document.createElement('label');
          label.for = fieldLabel[0] + feature;
          label.innerHTML = `${featureName}`;
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = fieldLabel[0] + feature;
          checkbox.name = 'plotFields';
          const fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkbox.id, interactive_arguments);
          checkbox.value = fieldValueSaved === 'on' ? 'on' : '';
          checkbox.checked = fieldValueSaved === 'on';
          newColumn1.appendChild(label);
          newColumn2.appendChild(checkbox);
          newRow.append(newColumn1, newColumn2);
          newDiv.append(newRow);

          // === Add dropdowns for feature-specific data ===
          if (['Mean', 'ErrorBars', 'Stacked'].includes(feature)) {
            const dropdownContainer = document.createElement('div');
            dropdownContainer.classList.add('row', 'fieldPadding');
            if (fieldLabelNumber % 2 != 0) {
              dropdownContainer.classList.add('row', 'fieldBackgroundColor');
            }
            const dropdownLabelCol = document.createElement('div');
            dropdownLabelCol.classList.add('col-3');
            const dropdownInputCol = document.createElement('div');
            dropdownInputCol.classList.add('col');
            function createDropdown(labelText, selectId) {
              const label = document.createElement('label');
              label.innerHTML = labelText;
              const select = document.createElement('select');
              select.id = selectId;
              select.name = 'plotFields';
              if (feature === 'Mean' || feature === 'ErrorBars') {
                const autoOpt = document.createElement('option');
                if (feature != 'ErrorBars') {
                  autoOpt.value = 'auto';
                  autoOpt.innerHTML = 'Auto Calculate Based on Bar Column Selection';
                  select.appendChild(autoOpt);
                }
                if (feature === 'ErrorBars') {
                  autoOpt.value = 'auto';
                  autoOpt.innerHTML = 'Example Error Bars';
                  select.appendChild(autoOpt);
                }
                for (const col of Object.values(jsonColumns)) {
                  const opt = document.createElement('option');
                  opt.value = col;
                  opt.innerHTML = col;
                  select.appendChild(opt);
                }
                const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(select.id, interactive_arguments);
                if (saved) {
                  select.value = saved;
                }
                select.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
                return {
                  label,
                  select
                };
              }
            }
            function createDatefield(labelText, inputId) {
              const label = document.createElement('label');
              label.textContent = labelText;
              label.htmlFor = inputId; // Link label to input

              const input = document.createElement('input'); // Correct element
              input.type = 'date';
              input.id = inputId;
              input.name = 'plotFields';
              const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
              if (saved) {
                input.value = saved;
              }
              input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
              return {
                label,
                input
              };
            }
            function createTextfield(labelText, inputId) {
              const label = document.createElement('label');
              label.textContent = labelText;
              label.htmlFor = inputId; // Link label to input

              const input = document.createElement('input'); // Correct element
              input.type = 'text';
              input.id = inputId;
              input.name = 'plotFields';
              input.style.width = '200px';
              const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
              if (saved) {
                input.value = saved;
              }
              input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
              return {
                label,
                input
              };
            }
            function createColorfield(labelText, inputId) {
              const label = document.createElement('label');
              label.textContent = labelText;
              label.htmlFor = inputId; // Link label to input

              const input = document.createElement('input'); // Correct element
              input.type = 'color';
              input.id = inputId;
              input.name = 'plotFields';
              const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
              if (saved) {
                input.value = saved;
              }
              input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
              return {
                label,
                input
              };
            }
            const controls = [];
            if (feature === 'Mean') {
              const {
                label,
                select
              } = createDropdown('Mean Source Column', fieldLabel[0] + feature + 'Field');
              controls.push(label, select);
            }
            if (feature === 'Stacked') {
              const {
                label: labelColor,
                input: ColorValue
              } = createColorfield(`Separator Line Color`, fieldLabel[0] + feature + 'SeparatorLineColor');
              controls.push(labelColor, document.createElement('br'), ColorValue);
            }
            if (feature === 'ErrorBars' || feature === 'StdDev') {
              const {
                label: labelValues,
                select: selectValues
              } = createDropdown(`${featureName} Input Column Values`, fieldLabel[0] + feature + 'InputValues');
              const {
                label: labelColor,
                input: ColorValue
              } = createColorfield(`Color`, fieldLabel[0] + feature + 'Color');
              controls.push(labelValues, document.createElement('br'), selectValues, document.createElement('br'), labelColor, document.createElement('br'), ColorValue);
            }

            // Initially hide the dropdown container
            dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
            controls.forEach(control => dropdownInputCol.appendChild(control));
            dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
            newDiv.append(dropdownContainer);

            // Toggle visibility dynamically
            checkbox.addEventListener('change', function () {
              checkbox.value = checkbox.checked ? 'on' : '';
              dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
            });
          } else {
            checkbox.addEventListener('change', function () {
              checkbox.value = checkbox.checked ? 'on' : '';
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
            });
          }
        }
      }
      const targetElement = document.getElementById('graphGUI');
      targetElement.appendChild(newDiv);
    });
  }
}

// Bridge for classic scripts (admin-preview-buttons.js) until they are modularized.
window.plotlyBarParameterFields = plotlyBarParameterFields;

/***/ },

/***/ "./includes/figures/js/interactive/plotly-timeseries-line.js"
/*!*******************************************************************!*\
  !*** ./includes/figures/js/interactive/plotly-timeseries-line.js ***!
  \*******************************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   producePlotlyLineFigure: () => (/* binding */ producePlotlyLineFigure)
/* harmony export */ });
/* harmony import */ var _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @graphic-data/plotly-utility */ "./includes/figures/js/interactive/plotly-utility.js");

const _lineDataEl = document.getElementById('wp-script-module-data-@graphic-data/plotly-timeseries-line');
let _lineDefaults = {};
if (_lineDataEl?.textContent) {
  try {
    _lineDefaults = JSON.parse(_lineDataEl.textContent);
  } catch {}
}

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
 * @param {HTMLElement} plotDiv         - The DOM element where the Plotly chart is rendered.
 * @param {Object}      layout          - The Plotly layout object, which will be modified to include overlay settings.
 * @param {Array}       mainDataTraces  - The main data traces to be plotted (typically lines).
 * @param {Object}      figureArguments - An object containing user-specified arguments for overlays, such as:
 *                                      - 'EvaluationPeriod': 'on' to enable evaluation period overlay.
 *                                      - 'EvaluationPeriodStartDate', 'EvaluationPeriodEndDate': Date strings for the evaluation period.
 *                                      - 'EvaluationPeriodFillColor': Color for the evaluation period overlay.
 *                                      - 'EvaluationPeriodText': Label for the evaluation period.
 *                                      - 'EventMarkers': 'on' to enable event markers.
 *                                      - 'EventMarkersField': Number of event markers.
 *                                      - 'EventMarkersEventAxis{n}': 'x' or 'y' for each marker.
 *                                      - 'EventMarkersEventText{n}': Label for each marker.
 *                                      - 'EventMarkersEventColor{n}': Color for each marker.
 *                                      - 'EventMarkersEventDate{n}': Date for x-axis marker.
 *                                      - 'EventMarkersEventYValue{n}': Y value for y-axis marker.
 * @param {Object}      dataToBePlotted - The data object containing arrays for each column, used for plotting overlays.
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
 * @return {void}
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
  const dateFormat = figureArguments['XAxisFormat'];
  let xHoverFormat = '';
  switch (dateFormat) {
    case 'YYYY':
      xHoverFormat = '%Y';
      break;
    case 'YYYY-MM':
      xHoverFormat = '%Y-%m';
      break;
    case 'YYYY-MM-DD':
      xHoverFormat = '%Y-%m-%d';
      break;
    default:
      xHoverFormat = '';
    // fallback to raw
  }

  // Then build your hovertemplate:
  const xHoverValue = xHoverFormat ? `%{x|${xHoverFormat}}` : `%{x}`;

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
      line: {
        color: fillColor,
        width: 0
      },
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
      const lineType = figureArguments[`EventMarkersLineType${i}`] || 'solid';
      if (axisType === 'x') {
        let date = figureArguments[`EventMarkersEventDate${i}`];
        overlays.push({
          x: [date, date],
          y: [yMin, yMax],
          type: 'scatter',
          mode: 'lines',
          line: {
            color,
            width: 2,
            dash: lineType
          },
          name: label,
          showlegend: true,
          yaxis: 'y',
          xaxis: 'x',
          //hoverinfo: `x`,
          hovertemplate: `${label}: ${xHoverValue}<extra></extra>`
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
          line: {
            color,
            width: 2,
            dash: lineType
          },
          name: label,
          showlegend: true,
          yaxis: 'y',
          xaxis: 'x',
          //hoverinfo: `${label} y`,
          hovertemplate: `${label}: %{y}<extra></extra>`
        });
      }
      if (axisType === 'x') {
        let date = figureArguments[`EventMarkersEventDate${i}`];
        layout.shapes = layout.shapes || [];
        layout.shapes.push({
          type: 'line',
          xref: 'x',
          yref: 'paper',
          // "paper" makes it stretch top-to-bottom
          x0: date,
          x1: date,
          y0: 0,
          // bottom edge of the plotting area
          y1: 1,
          // top edge of the plotting area
          line: {
            color: color,
            width: 2,
            dash: lineType
          }
        });
      }
      if (axisType === 'y') {
        let yValue = parseFloat(figureArguments[`EventMarkersEventYValue${i}`], 10);
        // const yArray = Array(plotlyX.length).fill(yValue);
        layout.shapes = layout.shapes || [];
        layout.shapes.push({
          type: 'line',
          xref: 'paper',
          // "paper" means 0–1 relative to full width
          yref: 'y',
          x0: 0,
          // start at left edge of plot
          x1: 1,
          // end at right edge of plot
          y0: yValue,
          y1: yValue,
          line: {
            color: color,
            width: 2,
            dash: lineType
          }
        });
      }
    }
  }
  Plotly.react(plotDiv, [...overlays, ...mainDataTraces], layout);
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
 * @param {string}             targetFigureElement   - The ID of the DOM element where the chart should be rendered.
 * @param {string}             interactive_arguments - A JSON string (array of key-value pairs) representing user-specified chart configuration.
 * @param {string|number|null} postID                - The WordPress post ID for the figure. If null, the function attempts to retrieve it from the admin page.
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
async function producePlotlyLineFigure(targetFigureElement, interactive_arguments, postID, targetDocument = document) {
  try {
    const renderDocument = targetDocument || document;
    await (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.loadPlotlyScript)(); // ensures Plotly is ready

    const rawField = interactive_arguments;
    const figureArguments = Object.fromEntries(JSON.parse(rawField));
    const rootURL = window.location.origin;
    let figureID = '';

    //Rest call to get uploaded_path_json
    if (postID == null) {
      // ADMIN SIDE POST ID GRAB
      figureID = document.getElementsByName("post_ID")[0].value;
      //console.log("figureID ADMIN:", figureID);
    }
    if (postID != null) {
      // THEME SIDE POST ID GRAB
      figureID = postID;
      //console.log("figureID THEME:", figureID);
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
    //console.log('[GD] responseJson keys:', Object.keys(responseJson), 'type:', Array.isArray(responseJson) ? 'array' : typeof responseJson);

    const dataToBePlotted = responseJson.data;
    //console.log('[GD] dataToBePlotted:', dataToBePlotted?.length, 'rows, first row:', JSON.stringify(dataToBePlotted?.[0]));

    //Important for blocks to work - We need one to work with the document from the block and one for the regular document the function normally runs in.
    let newDiv = document.createElement('div');
    // let newDiv;
    // if (!targetDocument || targetDocument === null) {
    // 	newDiv = document.createElement('div');
    // }
    // if (targetDocument) {
    // 	newDiv = renderDocument.createElement('div');
    // }

    // considerations for unique hashing for multiple uses vs onetime use.
    let plotlyDivID = `plotlyFigure${figureID}`;
    // let plotlyDivID;
    // const uniqueHash = window.crypto?.randomUUID?.() ||`${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    // // if (targetDocument != renderDocument) {
    // 	plotlyDivID = `plotlyFigure${figureID}`;
    // }
    // if (targetDocument === renderDocument) {
    // 	plotlyDivID = `plotlyFigure${figureID}_${uniqueHash}`;
    // }

    newDiv.id = plotlyDivID;
    newDiv.classList.add("container", `figure_interactive${figureID}`);

    //Important for blocks to work - We need one to work with the document from the block and one for the regular document the function normally runs in.

    let targetElement = await (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.waitForElementById)(targetFigureElement);
    targetElement.appendChild(newDiv);
    // let targetElement;
    // if (!targetDocument) {
    // 	targetElement = await waitForElementById(targetFigureElement);
    // 	targetElement.appendChild(newDiv);
    // }
    // if (targetDocument) {
    // 	targetElement = renderDocument.getElementById(targetFigureElement);
    // 	targetElement.appendChild(newDiv);
    // }

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
      const stdDev = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.computeStandardDeviation)(plotlyY);
      const dateFormat = figureArguments['XAxisFormat'];
      let xHoverFormat = '';
      switch (dateFormat) {
        case 'YYYY':
          xHoverFormat = '%Y';
          break;
        case 'YYYY-MM':
          xHoverFormat = '%Y-%m';
          break;
        case 'YYYY-MM-DD':
          xHoverFormat = '%Y-%m-%d';
          break;
        default:
          xHoverFormat = '';
        // fallback to raw
      }

      // Then build your hovertemplate:
      const xHoverValue = xHoverFormat ? `%{x|${xHoverFormat}}` : `%{x}`;

      // Line type, marker type, and marker size
      const lineType = figureArguments[targetLineColumn + 'LineType'];
      if (lineType === undefined) {
        const lineType = 'solid';
      }
      //console.log('lineType', lineType);
      const markerType = figureArguments[targetLineColumn + 'MarkerType'];
      const markerSize = parseInt(figureArguments[targetLineColumn + 'MarkerSize'], 10);

      //Turn off line if needed
      let graphModeSetting = 'lines+markers';
      const removeLine = figureArguments[targetLineColumn + 'RemoveLine'];
      if (removeLine === 'on') {
        graphModeSetting = 'markers';
      } else {
        graphModeSetting = 'lines+markers';
      }

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
            array: showError_InputValue.map(val => parseFloat(val)),
            // Convert to number if needed
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
        mode: graphModeSetting,
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
        hovertemplate: `${figureArguments['XAxisTitle']}: ${xHoverValue}<br>` + `${figureArguments['YAxisTitle']}: %{y}<extra></extra>`
        //figureArguments['XAxisTitle'] + ': %{x}<br>' +
        //figureArguments['YAxisTitle'] + ': %{y}'
      };
      allLinesPlotly.push(singleLinePlotly);

      //Show Standard Deviation Lines
      const showSD = figureArguments[targetLineColumn + 'StdDev'];
      const showSD_InputValuesOpt = figureArguments[targetLineColumn + 'StdDevInputValues'];
      //Standard Deviation of dataset based on dataset Y-axis values (AutoCalculated)
      if (showSD == 'on' && showSD_InputValuesOpt === 'auto') {
        const plotlyYSanitized = plotlyY.map(val => {
          if (val === null || val === undefined || val === "" || typeof val === "string" && val.trim().toUpperCase() === "NA" || isNaN(val)) {
            return 0;
          }
          return parseFloat(val);
        });
        let plotlyYSafeArrayLength = plotlyY.filter(value => value !== null && value !== "NA").length;
        const mean = plotlyYSanitized.reduce((a, b) => a + b, 0) / plotlyYSafeArrayLength;
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
          showlegend: showLegendBool,
          // only the first one shows in legend
          visible: true
        };

        // Lower SD line
        const stdLowerLine = {
          x: filteredX,
          y: lowerY,
          type: 'scatter',
          mode: 'lines',
          name: legendGroupName,
          // same name, but hidden in legend
          legendgroup: legendGroupName,
          line: {
            dash: 'dash',
            color: figureArguments[targetLineColumn + 'StdDevColor']
          },
          hoverinfo: 'skip',
          showlegend: false,
          // hides duplicate legend entry
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
          if (val === null || val === undefined || val === "" || typeof val === "string" && val.trim().toUpperCase() === "NA" || isNaN(val)) {
            return 0;
          }
          return parseFloat(val);
        });
        let plotlyYSafeArrayLength = plotlyY.filter(value => value !== null && value !== "NA").length;
        const mean = plotlyYSanitized.reduce((a, b) => a + b, 0) / plotlyYSafeArrayLength;
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
          showlegend: showLegendBool,
          // only the first one shows in legend
          visible: true
        };

        // Lower SD line
        const stdLowerLine = {
          x: filteredX,
          y: lowerY,
          type: 'scatter',
          mode: 'lines',
          name: legendGroupName,
          // same name, but hidden in legend
          legendgroup: legendGroupName,
          line: {
            dash: 'dash',
            color: figureArguments[targetLineColumn + 'StdDevColor']
          },
          hoverinfo: 'skip',
          showlegend: false,
          // hides duplicate legend entry
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
        const p10 = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.computePercentile)(plotlyY, 10);
        const p90 = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.computePercentile)(plotlyY, 90);
        const filteredX = plotlyX.filter(item => item !== "");
        const xMinPercentile = Math.min(...filteredX);
        const xMaxPercentile = Math.max(...filteredX);
        if (showPercentiles === 'on') {
          allLinesPlotly.push({
            x: [xMinPercentile, xMaxPercentile],
            y: [p10, p10],
            mode: 'lines',
            line: {
              dash: 'dot',
              color: figureArguments[targetLineColumn + 'Color'] + '60'
            },
            name: `${figureArguments[targetLineColumn + 'Title']} 10th Percentile (Bottom)`,
            type: 'scatter',
            visible: true,
            showlegend: false
          });
          allLinesPlotly.push({
            x: [xMinPercentile, xMaxPercentile],
            y: [p90, p90],
            mode: 'lines',
            line: {
              dash: 'dot',
              color: figureArguments[targetLineColumn + 'Color'] + '60'
            },
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
          let plotlyYSafeArrayLength = plotlyY.filter(value => value !== null && value !== "NA").length;
          const mean = plotlyYSafeArray.reduce((a, b) => a + b, 0) / plotlyYSafeArrayLength;
          //console.log('mean', mean);
          //console.log('plotlyY', plotlyY);
          const filteredX = plotlyX.filter(item => item !== "");
          //console.log('filteredX', filteredX);

          let xMin;
          let xMax;
          xMin = Math.min(...filteredX);
          xMax = Math.max(...filteredX);
          if (isNaN(xMin) || isNaN(xMax)) {
            xMin = new Date(filteredX[0]);
            xMax = new Date(filteredX[filteredX.length - 1]);
          }
          allLinesPlotly.push({
            x: [xMin, xMax],
            y: [mean, mean],
            mode: 'lines',
            line: {
              dash: 'solid',
              color: figureArguments[targetLineColumn + 'Color'] + '60'
            },
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
          let xMin;
          let xMax;
          xMin = Math.min(...filteredX);
          xMax = Math.max(...filteredX);
          if (isNaN(xMin) || isNaN(xMax)) {
            xMin = new Date(filteredX[0]);
            xMax = new Date(filteredX[filteredX.length - 1]);
          }
          allLinesPlotly.push({
            x: [xMin, xMax],
            y: [mean, mean],
            mode: 'lines',
            line: {
              dash: 'solid',
              color: figureArguments[targetLineColumn + 'Color'] + '60'
            },
            name: `${figureArguments[targetLineColumn + 'Title']} Mean`,
            type: 'scatter',
            visible: true,
            showlegend: showLegendBool
          });
        }
      }
    }
    console.log('figureArguments', figureArguments);

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
        showgrid: showGridBool
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
        showgrid: showGridBool
      },
      legend: {
        orientation: 'h',
        // horizontal layout
        y: 1.1,
        // position legend above the plot
        x: 0.5,
        // center the legend
        xanchor: 'center',
        yanchor: 'bottom'
      },
      autosize: true,
      margin: {
        t: 60,
        b: 60,
        l: 60,
        r: 60
      },
      hovermode: 'closest',
      //width: container.clientWidth, 
      //height: container.clientHeight,
      cliponaxis: true
    };
    const config = {
      responsive: true,
      // This makes the plot resize with the browser window
      renderer: 'svg',
      displayModeBar: true,
      displaylogo: false,
      modeBarButtonsToRemove: ['zoom2d', 'lasso2d', 'autoScale2d', 'hoverClosestCartesian', 'hoverCompareCartesian' //'toImage', 'resetScale2d', 'select2d'
      ]
    };

    // Set up the plotlyDiv (The div the the plot will be rendered in)
    //Important for blocks to work - We need one to work with the document from the block and one for the regular document the function normally runs in.

    let plotDiv = document.getElementById(plotlyDivID);
    // let plotDiv;
    // if (!targetDocument) {
    // 	plotDiv = document.getElementById(plotlyDivID);
    // }
    // if (targetDocument) {
    // 	plotDiv = renderDocument.getElementById(plotlyDivID);
    // }
    plotDiv.style.setProperty("width", "100%", "important");
    plotDiv.style.setProperty("max-width", "none", "important");

    // Create the plot with all lines
    // await Plotly.newPlot(plotlyDivID, allLinesPlotly, layout, config);

    await Plotly.newPlot(plotDiv, allLinesPlotly, layout, config).then(() => {
      // After the plot is created, inject overlays if any, this is here because you can only get overlays that span the entire yaxis after the graph has been rendered.
      // You need the specific values for the entire yaxis
      injectOverlays(plotDiv, layout, allLinesPlotly, figureArguments, dataToBePlotted);
    });
    Plotly.Plots.resize(plotDiv);

    // if (window.location.href.includes('post.php')) {
    // 	//Save the plotly figure as an html file. 
    // 	const savedFigure = {
    // 		data: plotDiv.data,
    // 		layout: plotDiv.layout,
    // 		config: { responsive: true }
    // 	};

    // 	const figureiframeGenerator = createFigureIframeHtml(savedFigure, figureID, rootURL);
    // }

    // if () {
    // 	document.querySelector('[data-depend-id="figure_preview"]').addEventListener('click', function() {
    // 		saveHtmlFileToServer(figureiframeGenerator.figIframeHtml, figureiframeGenerator.figIframeHtmlFileName, figureiframeGenerator.figIframeHtmlPath, postId);
    // 	});
    // }	

    //STANDALONE CODE TO INJECT INTO CODE BLOCK> WORKS INTERMITTENTLY
    // const snippet = buildPlotlySnippetEmbedCode(
    // 	savedFigure,
    // 	`plotly-snippet-${figureID}`
    // );

    // console.log("snippet", snippet);
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
 * @return {void}
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
function loadDefaultInteractiveLineArguments(jsonColumns) {
  let interactive_arguments = document.getElementsByName('figure_interactive_arguments')[0].value;

  // ---------- helpers ----------
  function safeParseJSON(s) {
    try {
      return JSON.parse(s);
    } catch {
      return null;
    }
  }
  function pairsToObject(pairs) {
    const o = {};
    if (Array.isArray(pairs)) {
      for (const p of pairs) {
        if (Array.isArray(p) && p.length >= 2) {
          o[String(p[0])] = String(p[1] ?? '');
        }
      }
    }
    return o;
  }
  function kvStringToObject(str) {
    const o = {};
    if (!str) {
      return o;
    }
    for (const part of str.split(/[;,]/)) {
      const [k, v] = part.split(/[:=]/).map(s => (s || '').trim());
      if (k) {
        o[k] = v ?? '';
      }
    }
    return o;
  }
  function toObjectFlexible(s) {
    if (!s) {
      return {};
    }
    const asJSON = safeParseJSON(s);
    if (asJSON && typeof asJSON === 'object') {
      return Array.isArray(asJSON) ? pairsToObject(asJSON) : asJSON;
    }
    return kvStringToObject(s);
  }
  function toPairsFlexible(s) {
    const asJSON = safeParseJSON(s);
    if (Array.isArray(asJSON)) {
      return asJSON;
    }
    const obj = toObjectFlexible(s);
    return Object.entries(obj).map(([k, v]) => [k, v]);
  }
  // preserve original order from currentPairs; append unseen keys at the end
  function objectToPairsPreserveOrder(obj, currentPairs) {
    const seen = new Set();
    const out = [];
    for (const [k] of currentPairs) {
      if (!seen.has(k) && k in obj) {
        out.push([k, String(obj[k] ?? '')]);
        seen.add(k);
      }
    }
    // append any remaining keys (e.g., required keys not in original)
    for (const k of Object.keys(obj)) {
      if (!seen.has(k)) {
        out.push([k, String(obj[k] ?? '')]);
      }
    }
    return out;
  }

  // ---------- main ----------
  // Use the passed interactive_arguments parameter (works in preview modal context
  // where the form field may not be in the document). Fall back to DOM read for
  // the settings-page context where the parameter is not passed.
  const field = document.getElementsByName('figure_interactive_arguments')[0];
  const currentStr = interactive_arguments || (field ? field.value : '') || '';
  // console.log('[GD] currentStr length:', currentStr.length, 'preview:', currentStr.substring(0, 100));
  // if (!currentStr) {
  // 	console.log('[GD] EARLY RETURN — no currentStr');
  // 	return;
  // }

  //console.log('_lineDefaults', _lineDefaults);
  //console.log('_lineDefaults.interactive_line_arguments', _lineDefaults.interactive_line_arguments);
  const defaultsStr = _lineDefaults.interactive_line_arguments || '';

  // Parse both to objects and keep original pair order from current
  const currentPairs = toPairsFlexible(currentStr);
  const currentObj = toObjectFlexible(currentStr);
  const defaultsObj = toObjectFlexible(defaultsStr);

  // How many lines should be considered?
  const numEl = document.getElementById('NumberOfLines');
  const numberOfLines = numEl && numEl.value ? parseInt(numEl.value, 10) : 0;
  if (numberOfLines > 0) {
    currentObj.NumberOfLines = String(numberOfLines);
  }

  // Overwrite ONLY keys that:
  //  - start with Line1..Line{N}, AND
  //  - already exist in currentObj, AND
  //  - also exist in defaultsObj
  if (numberOfLines > 0) {
    const linePrefixes = Array.from({
      length: numberOfLines
    }, (_, i) => `Line${i + 1}`);
    for (const key of Object.keys(currentObj)) {
      const isWithinLines = linePrefixes.some(prefix => key.startsWith(prefix));
      if (isWithinLines && key in defaultsObj) {
        currentObj[key] = defaultsObj[key];
      }
    }
  }

  // Ensure/overwrite these non-line keys regardless of line count
  currentObj.showGrid = defaultsObj.showGrid ?? 'on';
  currentObj.graphTicks = defaultsObj.graphTicks ?? 'on';
  currentObj.XAxisFormat = defaultsObj.XAxisFormat ?? 'YYYY';

  // Convert back to array-of-pairs, preserving the original order from currentPairs
  const mergedPairs = objectToPairsPreserveOrder(currentObj, currentPairs);

  // Write back EXACTLY as array-of-pairs JSON
  const mergedPairs_string = JSON.stringify(mergedPairs);
  console.log('interactive_arguments', currentStr);
  console.log('default_interactive_line_arguments', defaultsStr);
  console.log('mergedPairs_string', mergedPairs_string);
  document.getElementsByName('figure_interactive_arguments')[0].value = mergedPairs_string;
  displayLineFields(numberOfLines, jsonColumns, mergedPairs_string);
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
 * @param {Object}        jsonColumns           - An object representing available data columns, where keys are column identifiers and values are column names.
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
function plotlyLineParameterFields(jsonColumns, interactive_arguments) {
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
    let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkbox.id, interactive_arguments);
    checkbox.value = fieldValueSaved === 'on' ? 'on' : "";
    checkbox.checked = fieldValueSaved === 'on';

    // Toggle visibility dynamically
    checkbox.addEventListener('change', function () {
      checkbox.value = checkbox.checked ? 'on' : "";
      (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
    });
    newColumn1.appendChild(label);
    newColumn2.appendChild(checkbox);
    newRow.append(newColumn1, newColumn2);
    newDiv.append(newRow);
    newRow.style.display = "none";
  }

  // Create input fields for X and Y Axis Titles
  const axisTitleArray = ["X", "Y"];
  axisTitleArray.forEach(axisTitle => {
    newRow = document.createElement("div");
    newRow.classList.add("row", "fieldPadding");
    newColumn1 = document.createElement("div");
    newColumn1.classList.add("col-3");
    newColumn2 = document.createElement("div");
    newColumn2.classList.add("col");
    let labelInputAxis = document.createElement("label");
    labelInputAxis.for = axisTitle + "AxisTitle";
    labelInputAxis.innerHTML = axisTitle + " Axis Options";
    let labelInputAxisTitle = document.createElement("label");
    labelInputAxisTitle.for = axisTitle + "AxisTitle";
    labelInputAxisTitle.innerHTML = "Title";
    let inputAxisTitle = document.createElement("input");
    inputAxisTitle.id = axisTitle + "AxisTitle";
    inputAxisTitle.name = "plotFields";
    inputAxisTitle.size = "70";
    let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputAxisTitle.id, interactive_arguments);
    if (fieldValueSaved != undefined) {
      inputAxisTitle.value = fieldValueSaved;
    }
    inputAxisTitle.addEventListener('change', function () {
      (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
    });
    newColumn1.appendChild(labelInputAxis);
    newColumn2.appendChild(labelInputAxisTitle);
    newColumn2.appendChild(document.createElement("br"));
    newColumn2.appendChild(inputAxisTitle);
    newRow.append(newColumn1, newColumn2);
    newDiv.append(newRow);
    const rangeBound = ["Low", "High"];
    newRow = document.createElement("div");
    newRow.classList.add("row", "fieldPadding");
    newColumn1 = document.createElement("div");
    newColumn1.classList.add("col-3");
    newColumn2 = document.createElement("div");
    newColumn2.classList.add("col");
    const boundsWrapper = document.createElement('div');
    boundsWrapper.classList.add('row');
    rangeBound.forEach(bound => {
      const boundColumn = document.createElement('div');
      boundColumn.classList.add('col');
      let inputBound = document.createElement("input");
      inputBound.id = axisTitle + "Axis" + bound + "Bound";
      inputBound.name = "plotFields";
      inputBound.type = "number";
      let labelBound = document.createElement("label");
      labelBound.for = axisTitle + bound + "Bound";
      labelBound.innerHTML = bound + " Bound (both required)";
      fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputBound.id, interactive_arguments);
      if (fieldValueSaved != undefined) {
        inputBound.value = fieldValueSaved;
      }
      inputBound.addEventListener('change', function () {
        (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
      });
      boundColumn.append(labelBound, document.createElement('br'), inputBound);
      boundsWrapper.appendChild(boundColumn);
    });
    newColumn2.appendChild(boundsWrapper);
    newRow.append(newColumn1, newColumn2);
    newDiv.append(newRow);
  });

  // Create select field for number of lines to be plotted
  let labelSelectNumberLines = document.createElement("label");
  labelSelectNumberLines.for = "NumberOfLines";
  labelSelectNumberLines.innerHTML = "Number of Lines to Be Plotted";
  let selectNumberLines = document.createElement("select");
  selectNumberLines.id = "NumberOfLines";
  selectNumberLines.name = "plotFields";
  selectNumberLines.addEventListener('change', function () {
    displayLineFields(selectNumberLines.value, jsonColumns, interactive_arguments);
  });
  selectNumberLines.addEventListener('change', function () {
    (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
  });
  for (let i = 1; i < 15; i++) {
    let selectNumberLinesOption = document.createElement("option");
    selectNumberLinesOption.value = i;
    selectNumberLinesOption.innerHTML = i;
    selectNumberLines.appendChild(selectNumberLinesOption);
  }
  let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectNumberLines.id, interactive_arguments);
  if (fieldValueSaved != undefined) {
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
  selectXAxisFormat.addEventListener('change', function () {
    (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
  });
  const dateFormats = ["None", "YYYY", "YYYY-MM", "YYYY-MM-DD"];
  dateFormats.forEach(dateFormat => {
    let selectXAxisFormatOption = document.createElement("option");
    selectXAxisFormatOption.value = dateFormat;
    selectXAxisFormatOption.innerHTML = dateFormat;
    selectXAxisFormat.appendChild(selectXAxisFormatOption);
  });
  fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectXAxisFormat.id, interactive_arguments);
  if (fieldValueSaved != undefined) {
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
 * @param {number}        numLines              - The number of lines to generate configuration fields for.
 * @param {Object}        jsonColumns           - An object representing available data columns, where keys are column identifiers and values are column names.
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
function displayLineFields(numLines, jsonColumns, interactive_arguments) {
  const assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
  // If the element exists
  if (assignColumnsToPlot) {
    // Remove the scene window
    assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
  }
  if (numLines > 0) {
    const newDiv = document.createElement('div');
    newDiv.id = 'assignColumnsToPlot';

    //"EvaluationPeriod" & "EventMarkers"
    const features = ['EvaluationPeriod', 'EventMarkers'];
    const featureNames = ['Evaluation Period', 'Event Markers'];
    for (let i = 0; i < features.length; i++) {
      const feature = features[i];
      const featureName = featureNames[i];
      const newRow = document.createElement('div');
      newRow.classList.add('row', 'fieldPadding');
      const newColumn1 = document.createElement('div');
      newColumn1.classList.add('col-3');
      const newColumn2 = document.createElement('div');
      newColumn2.classList.add('col');
      const label = document.createElement('label');
      label.for = feature;
      label.innerHTML = `${featureName}`;
      const checkbox = document.createElement('input');
      checkbox.type = 'checkbox';
      checkbox.id = feature;
      checkbox.name = 'plotFields';
      const fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkbox.id, interactive_arguments);
      checkbox.value = fieldValueSaved === 'on' ? 'on' : '';
      checkbox.checked = fieldValueSaved === 'on';
      newColumn1.appendChild(label);
      newColumn2.appendChild(checkbox);
      newRow.append(newColumn1, newColumn2);
      newRow.style.marginTop = '20px';
      newRow.style.marginBottom = '20px';
      newDiv.append(newRow);

      // === Add dropdowns for feature-specific data ===
      if (['EvaluationPeriod', 'EventMarkers'].includes(feature)) {
        const dropdownContainer = document.createElement('div');
        dropdownContainer.classList.add('row', 'fieldPadding');
        const dropdownLabelCol = document.createElement('div');
        dropdownLabelCol.classList.add('col-3');
        const dropdownInputCol = document.createElement('div');
        dropdownInputCol.classList.add('col');
        function createDropdown(labelText, selectId) {
          const label = document.createElement('label');
          label.innerHTML = labelText;
          const select = document.createElement('select');
          select.id = selectId;
          select.name = 'plotFields';
          if (feature === 'EventMarkers') {
            for (const col of [1, 2, 3, 4, 5, 6]) {
              const opt = document.createElement('option');
              opt.value = col;
              opt.innerHTML = col;
              select.appendChild(opt);
            }
            const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(select.id, interactive_arguments);
            if (saved) {
              select.value = saved;
            }
            select.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
            return {
              label,
              select
            };
          }
        }
        function createDatefield(labelText, inputId) {
          const label = document.createElement('label');
          label.textContent = labelText;
          label.htmlFor = inputId; // Link label to input

          const input = document.createElement('input'); // Correct element
          input.type = 'date';
          input.id = inputId;
          input.name = 'plotFields';
          const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
          if (saved) {
            input.value = saved;
          }
          input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
          return {
            label,
            input
          };
        }
        function createTextfield(labelText, inputId) {
          const label = document.createElement('label');
          label.textContent = labelText;
          label.htmlFor = inputId; // Link label to input

          const input = document.createElement('input'); // Correct element
          input.type = 'text';
          input.id = inputId;
          input.name = 'plotFields';
          input.style.width = '200px';
          const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
          if (saved) {
            input.value = saved;
          }
          input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
          return {
            label,
            input
          };
        }
        function createColorfield(labelText, inputId) {
          const label = document.createElement('label');
          label.textContent = labelText;
          label.htmlFor = inputId; // Link label to input

          const input = document.createElement('input'); // Correct element
          input.type = 'color';
          input.id = inputId;
          input.name = 'plotFields';
          const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
          if (saved) {
            input.value = saved;
          }
          input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
          return {
            label,
            input
          };
        }
        const controls = [];
        if (feature === 'EvaluationPeriod') {
          const {
            label: labelStartDate,
            input: StartDateValues
          } = createDatefield(`Start Date`, feature + 'StartDate');
          const {
            label: labelEndDate,
            input: EndDateValues
          } = createDatefield('End Date', feature + 'EndDate');
          const {
            label: labelColor,
            input: ColorValue
          } = createColorfield(`Fill Color`, feature + 'FillColor');
          const {
            label: textLabel,
            input: textInput
          } = createTextfield(`Display Text`, feature + 'Text');
          controls.push(labelStartDate, document.createElement('br'), StartDateValues, document.createElement('br'), document.createElement('br'), labelEndDate, document.createElement('br'), EndDateValues, document.createElement('br'), document.createElement('br'), labelColor, document.createElement('br'), ColorValue, document.createElement('br'), document.createElement('br'), textLabel, document.createElement('br'), textInput, document.createElement('br'));
        }
        if (feature === 'EventMarkers') {
          const {
            label,
            select
          } = createDropdown('Number of Event Markers', feature + 'Field');
          controls.push(label, select);

          // A wrapper that we'll (re)fill with the N sets of fields
          const wrapper = document.createElement('div');
          wrapper.id = feature + 'FieldsWrapper';
          controls.push(wrapper);
          const renderEventMarkerFields = n => {
            wrapper.innerHTML = ''; // Clear previous

            for (let i = 0; i < n; i++) {
              // === Axis Selector ===
              const axisLabel = document.createElement('label');
              axisLabel.textContent = `Event Marker Axis ${i + 1}`;
              const axisSelect = document.createElement('select');
              axisSelect.id = `${feature}EventAxis${i}`;
              axisSelect.name = 'plotFields';
              ['x', 'y'].forEach(axis => {
                const opt = document.createElement('option');
                opt.value = axis;
                opt.textContent = axis.toUpperCase() + ' Axis';
                axisSelect.appendChild(opt);
              });
              const savedAxis = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(axisSelect.id, interactive_arguments);
              if (savedAxis) {
                axisSelect.value = savedAxis;
              }

              // === Line Type Selector ===
              const lineTypeLabel = document.createElement('label');
              lineTypeLabel.textContent = `Line Type ${i + 1}`;
              lineTypeLabel.htmlFor = `${feature}LineType${i}`;
              const lineTypeSelect = document.createElement('select');
              lineTypeSelect.id = `${feature}LineType${i}`;
              lineTypeSelect.name = 'plotFields';
              ['solid', 'dash', 'dot', 'dashdot', 'longdash', 'longdashdot'].forEach(type => {
                const opt = document.createElement('option');
                opt.value = type;
                opt.textContent = type.charAt(0).toUpperCase() + type.slice(1);
                lineTypeSelect.appendChild(opt);
              });
              const savedLineType = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(lineTypeSelect.id, interactive_arguments);

              // Important: force a default value even if nothing is saved yet
              lineTypeSelect.value = savedLineType || 'solid';
              lineTypeSelect.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);

              // === Shared Inputs ===
              const {
                label: textLabel,
                input: textInput
              } = createTextfield(`Display Text ${i + 1}`, `${feature}EventText${i}`);
              const {
                label: colorLabel,
                input: colorInput
              } = createColorfield(`Line Color ${i + 1}`, `${feature}EventColor${i}`);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(textInput.id, interactive_arguments);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(colorInput.id, interactive_arguments);

              // === X-axis Fields ===
              const xWrapper = document.createElement('div');
              const {
                label: dateLabel,
                input: dateInput
              } = createDatefield(`Event Date ${i + 1} (X-Axis)`, `${feature}EventDate${i}`);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(dateInput.id, interactive_arguments);
              xWrapper.append(dateLabel, document.createElement('br'), dateInput, document.createElement('br'));

              // === Y-axis Fields ===
              const yWrapper = document.createElement('div');
              const {
                label: yLabel,
                input: yInput
              } = createTextfield(`Event Y Value ${i + 1}`, `${feature}EventYValue${i}`);
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(yInput.id, interactive_arguments);
              yWrapper.append(yLabel, document.createElement('br'), yInput, document.createElement('br'));

              // === Container & Toggle Logic ===
              const block = document.createElement('div');
              block.append(document.createElement('hr'), axisLabel, document.createElement('br'), axisSelect, document.createElement('br'), document.createElement('br'), lineTypeLabel, document.createElement('br'), lineTypeSelect, document.createElement('br'), document.createElement('br'), xWrapper, yWrapper, document.createElement('br'), textLabel, document.createElement('br'), textInput, document.createElement('br'), document.createElement('br'), colorLabel, document.createElement('br'), colorInput, document.createElement('br'));

              // Handle visibility
              const toggleAxisFields = val => {
                xWrapper.style.display = val === 'x' ? 'block' : 'none';
                yWrapper.style.display = val === 'y' ? 'block' : 'none';
              };
              toggleAxisFields(axisSelect.value); // Initial state
              axisSelect.addEventListener('change', e => {
                toggleAxisFields(e.target.value);
                (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
              });
              wrapper.appendChild(block);
            }
          };

          // Initial render using saved or current value
          const initialN = parseInt(select.value, 10) || 0;
          renderEventMarkerFields(initialN);

          // Re-render on change
          select.addEventListener('change', e => {
            const n = parseInt(e.target.value, 10) || 0;
            renderEventMarkerFields(n);
          });
        }

        // Initially hide the dropdown container
        dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
        controls.forEach(control => dropdownInputCol.appendChild(control));
        dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
        newDiv.append(dropdownContainer);

        // Toggle visibility dynamically
        checkbox.addEventListener('change', function () {
          checkbox.value = checkbox.checked ? 'on' : '';
          dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
      } else {
        checkbox.addEventListener('change', function () {
          checkbox.value = checkbox.checked ? 'on' : '';
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
      }
    }
    const newHR = document.createElement('hr');
    newHR.style = 'margin-top:15px';
    newDiv.append(newHR);

    // Create the button for default styles
    const labelApplyDefaults = document.createElement('label');
    labelApplyDefaults.for = 'ApplyLineDefaults';
    labelApplyDefaults.innerHTML = 'Apply Custom Line Styles to All Lines';
    const btnApplyDefaults = document.createElement('button');
    btnApplyDefaults.id = 'ApplyLineDefaults';
    btnApplyDefaults.type = 'button'; // prevent accidental form submit
    btnApplyDefaults.classList.add('button', 'button-primary'); // WP admin button style
    btnApplyDefaults.innerHTML = 'Click to Apply Styles';

    // Add event listener
    btnApplyDefaults.addEventListener('click', function () {
      // Call your function here
      loadDefaultInteractiveLineArguments(jsonColumns);
    });

    // Wrap in row/col just like your select
    const newRowBtn = document.createElement('div');
    newRowBtn.classList.add('row', 'fieldPadding');
    const newColumn1Btn = document.createElement('div');
    newColumn1Btn.classList.add('col-3');
    const newColumn2Btn = document.createElement('div');
    newColumn2Btn.classList.add('col');
    newColumn1Btn.appendChild(labelApplyDefaults);
    newColumn2Btn.appendChild(btnApplyDefaults);
    newRowBtn.append(newColumn1Btn, newColumn2Btn);
    newDiv.append(newRowBtn);
    const fieldLabels = [['XAxis', 'X Axis Column']];
    for (let i = 1; i <= numLines; i++) {
      fieldLabels.push(['Line' + i, 'Line ' + i + ' Column']);
    }
    fieldLabels.forEach(fieldLabel => {
      //Select the data source from dropdown menu
      const labelSelectColumn = document.createElement('label');
      labelSelectColumn.for = fieldLabel[0];
      labelSelectColumn.innerHTML = fieldLabel[1];
      const selectColumn = document.createElement('select');
      selectColumn.id = fieldLabel[0];
      selectColumn.name = 'plotFields';
      selectColumn.addEventListener('change', function () {
        (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
      });
      let selectColumnOption = document.createElement('option');
      selectColumnOption.value = 'None';
      selectColumnOption.innerHTML = 'None';
      selectColumn.appendChild(selectColumnOption);
      Object.entries(jsonColumns).forEach(([jsonColumnsKey, jsonColumnsValue]) => {
        selectColumnOption = document.createElement('option');
        selectColumnOption.value = jsonColumnsValue; // jsonColumnsKey;
        selectColumnOption.innerHTML = jsonColumnsValue;
        selectColumn.appendChild(selectColumnOption);
      });
      let fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(selectColumn.id, interactive_arguments);
      if (fieldValueSaved != undefined) {
        selectColumn.value = fieldValueSaved;
      }
      let newRow = document.createElement('div');
      newRow.classList.add('row', 'fieldPadding');
      let fieldLabelNumber = '';
      if (fieldLabel[0] != 'XAxis') {
        fieldLabelNumber = parseInt(fieldLabel[0].slice(-1));
        if (fieldLabelNumber % 2 != 0) {
          newRow.classList.add('row', 'fieldBackgroundColor');
        }
      }
      let newColumn1 = document.createElement('div');
      newColumn1.classList.add('col-3');
      let newColumn2 = document.createElement('div');
      newColumn2.classList.add('col');
      newColumn1.appendChild(labelSelectColumn);
      newColumn2.appendChild(selectColumn);
      newRow.append(newColumn1, newColumn2);
      newDiv.append(newRow);

      // Add line label and color fields, line type, marker type, and marker size
      if (fieldLabel[0] != 'XAxis') {
        // Add line label field
        newRow = document.createElement('div');
        newRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          newRow.classList.add('row', 'fieldBackgroundColor');
        }
        newColumn1 = document.createElement('div');
        newColumn1.classList.add('col-3');
        newColumn2 = document.createElement('div');
        newColumn2.classList.add('col');
        const labelInputTitle = document.createElement('label');
        labelInputTitle.for = fieldLabel[0] + 'Title';
        labelInputTitle.innerHTML = fieldLabel[1] + ' Title';
        const inputTitle = document.createElement('input');
        inputTitle.id = fieldLabel[0] + 'Title';
        inputTitle.size = '70';
        inputTitle.name = 'plotFields';
        inputTitle.addEventListener('change', function () {
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
        fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputTitle.id, interactive_arguments);
        if (fieldValueSaved != undefined) {
          inputTitle.value = fieldValueSaved;
        }
        if (fieldValueSaved === undefined) {
          // Make each line's default title set to the name of the column name that is selected for that line. Only if the line title is not already set.
          //const DropdownValueSaved = fillFormFieldValues(selectColumn.id, interactive_arguments);
          if (fieldLabel[0].includes('Line')) {
            selectColumn.addEventListener('change', function () {
              let DropdownValueSaved = selectColumn.value;
              if (DropdownValueSaved != 'None' && fieldValueSaved === undefined) {
                inputTitle.value = DropdownValueSaved;
                (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
              }
            });
          }
        }
        newColumn1.appendChild(labelInputTitle);
        newColumn2.appendChild(inputTitle);
        newRow.append(newColumn1, newColumn2);
        newDiv.append(newRow);

        // Add color field
        newRow = document.createElement('div');
        newRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          newRow.classList.add('row', 'fieldBackgroundColor');
        }
        newColumn1 = document.createElement('div');
        newColumn1.classList.add('col-3');
        newColumn2 = document.createElement('div');
        newColumn2.classList.add('col');
        const labelInputColor = document.createElement('label');
        labelInputColor.for = fieldLabel[0] + 'Color';
        labelInputColor.innerHTML = fieldLabel[1] + ' Color';
        const inputColor = document.createElement('input');
        inputColor.id = fieldLabel[0] + 'Color';
        inputColor.name = 'plotFields';
        inputColor.type = 'color';
        fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(inputColor.id, interactive_arguments);
        if (fieldValueSaved != undefined) {
          inputColor.value = fieldValueSaved;
        }
        inputColor.addEventListener('change', function () {
          (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
        });
        newColumn1.appendChild(labelInputColor);
        newColumn2.appendChild(inputColor);
        newRow.append(newColumn1, newColumn2);
        newDiv.append(newRow);

        // Add lineType type dropdown
        const lineTypeRow = document.createElement('div');
        lineTypeRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          lineTypeRow.classList.add('fieldBackgroundColor');
        }
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
        ['solid', 'dash', 'dot', 'dashdot', 'longdash', 'longdashdot'].forEach(type => {
          const opt = document.createElement('option');
          opt.value = type;
          opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
          lineTypeSelect.appendChild(opt);
        });
        const lineTypeSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(lineTypeSelect.id, interactive_arguments);
        if (lineTypeSaved) {
          lineTypeSelect.value = lineTypeSaved;
        }
        lineTypeSelect.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
        lineTypeCol1.appendChild(lineTypeLabel);
        lineTypeCol2.appendChild(lineTypeSelect);
        lineTypeRow.append(lineTypeCol1, lineTypeCol2);
        newDiv.append(lineTypeRow);

        // Add marker type dropdown
        const markerRow = document.createElement('div');
        markerRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          markerRow.classList.add('fieldBackgroundColor');
        }
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
        ['circle', 'square', 'diamond', 'x', 'triangle-up', 'triangle-down', 'pentagon', 'hexagon', 'star', 'hourglass', 'bowtie', 'cross'].forEach(type => {
          const opt = document.createElement('option');
          opt.value = type;
          opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
          markerSelect.appendChild(opt);
        });
        const markerSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(markerSelect.id, interactive_arguments);
        if (markerSaved) {
          markerSelect.value = markerSaved;
        }
        markerSelect.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
        markerCol1.appendChild(markerLabel);
        markerCol2.appendChild(markerSelect);
        markerRow.append(markerCol1, markerCol2);
        newDiv.append(markerRow);

        // Add markerSize type dropdown
        const markerSizeRow = document.createElement('div');
        markerSizeRow.classList.add('row', 'fieldPadding');
        if (fieldLabelNumber % 2 != 0) {
          markerSizeRow.classList.add('fieldBackgroundColor');
        }
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
        const markerSizeSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(markerSizeSelect.id, interactive_arguments);
        if (markerSizeSaved) {
          markerSizeSelect.value = markerSizeSaved;
        }
        markerSizeSelect.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
        markerSizeCol1.appendChild(markerSizeLabel);
        markerSizeCol2.appendChild(markerSizeSelect);
        markerSizeRow.append(markerSizeCol1, markerSizeCol2);
        newDiv.append(markerSizeRow);

        //Add checkboxes for error bars, standard deviation, mean, and percentiles
        const features = ['RemoveLine', 'Legend', 'ConnectGaps', 'Mean', 'StdDev', 'ErrorBars', 'Percentiles'];
        const featureNames = ['Scatter Mode (Remove Line)', 'Add Line to Legend', 'Connect Missing Data Gaps', 'Mean Line', '+-1 Std Dev Lines ', 'Symmetric Error Bars', '90th & 10th Percentile Lines'];
        for (let i = 0; i < features.length; i++) {
          const feature = features[i];
          const featureName = featureNames[i];
          const newRow = document.createElement('div');
          newRow.classList.add('row', 'fieldPadding');
          if (fieldLabelNumber % 2 != 0) {
            newRow.classList.add('row', 'fieldBackgroundColor');
          }
          const newColumn1 = document.createElement('div');
          newColumn1.classList.add('col-3');
          const newColumn2 = document.createElement('div');
          newColumn2.classList.add('col');
          const label = document.createElement('label');
          label.for = fieldLabel[0] + feature;
          label.innerHTML = `${featureName}`;
          const checkbox = document.createElement('input');
          checkbox.type = 'checkbox';
          checkbox.id = fieldLabel[0] + feature;
          checkbox.name = 'plotFields';
          const fieldValueSaved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(checkbox.id, interactive_arguments);
          checkbox.value = fieldValueSaved === 'on' ? 'on' : '';
          checkbox.checked = fieldValueSaved === 'on';
          newColumn1.appendChild(label);
          newColumn2.appendChild(checkbox);
          newRow.append(newColumn1, newColumn2);
          newDiv.append(newRow);

          // === Add dropdowns for feature-specific data ===
          if (['Mean', 'ErrorBars', 'StdDev'].includes(feature)) {
            const dropdownContainer = document.createElement('div');
            dropdownContainer.classList.add('row', 'fieldPadding');
            if (fieldLabelNumber % 2 != 0) {
              dropdownContainer.classList.add('row', 'fieldBackgroundColor');
            }
            const dropdownLabelCol = document.createElement('div');
            dropdownLabelCol.classList.add('col-3');
            const dropdownInputCol = document.createElement('div');
            dropdownInputCol.classList.add('col');

            //---------------------------------------------------------------- START FUNCTIONS

            function createDropdown(labelText, selectId) {
              const label = document.createElement('label');
              label.innerHTML = labelText;
              const select = document.createElement('select');
              select.id = selectId;
              select.name = 'plotFields';
              if (feature === 'Mean' || feature === 'ErrorBars' || feature === 'StdDev') {
                const autoOpt = document.createElement('option');
                if (feature != 'ErrorBars') {
                  autoOpt.value = 'auto';
                  autoOpt.innerHTML = 'Auto Calculate Based on Line Column Selection';
                  select.appendChild(autoOpt);
                }
                if (feature === 'ErrorBars') {
                  autoOpt.value = 'auto';
                  autoOpt.innerHTML = 'Example Error Bars';
                  select.appendChild(autoOpt);
                }
                for (const col of Object.values(jsonColumns)) {
                  const opt = document.createElement('option');
                  opt.value = col;
                  opt.innerHTML = col;
                  select.appendChild(opt);
                }
                const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(select.id, interactive_arguments);
                if (saved) {
                  select.value = saved;
                }
                select.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
                return {
                  label,
                  select
                };
              }
            }
            function createColorfield(labelText, inputId) {
              const label = document.createElement('label');
              label.textContent = labelText;
              label.htmlFor = inputId; // Link label to input

              const input = document.createElement('input'); // Correct element
              input.type = 'color';
              input.id = inputId;
              input.name = 'plotFields';
              const saved = (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.fillFormFieldValues)(input.id, interactive_arguments);
              if (saved) {
                input.value = saved;
              }
              input.addEventListener('change', _graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues);
              return {
                label,
                input
              };
            }

            //---------------------------------------------------------------- END FUNCTIONS

            const controls = [];

            // Add features for Mean
            if (feature === 'Mean') {
              const {
                label,
                select
              } = createDropdown('Mean Source Column', fieldLabel[0] + feature + 'Field');
              controls.push(label, select);
            }

            // Add features for ErrorBars
            if (feature === 'ErrorBars' || feature === 'StdDev') {
              const {
                label: labelValues,
                select: selectValues
              } = createDropdown(`${featureName} Input Column Values`, fieldLabel[0] + feature + 'InputValues');
              const {
                label: labelColor,
                input: ColorValue
              } = createColorfield(`Color`, fieldLabel[0] + feature + 'Color');
              controls.push(labelValues, document.createElement('br'), selectValues, document.createElement('br'), labelColor, document.createElement('br'), ColorValue);
            }

            // Initially hide the dropdown container becasue the box hasnt been checked
            dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
            controls.forEach(control => dropdownInputCol.appendChild(control));
            dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
            newDiv.append(dropdownContainer);

            // Toggle visibility dynamically
            checkbox.addEventListener('change', function () {
              checkbox.value = checkbox.checked ? 'on' : '';
              dropdownContainer.style.display = checkbox.checked ? 'flex' : 'none';
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
            });
          } else {
            checkbox.addEventListener('change', function () {
              checkbox.value = checkbox.checked ? 'on' : '';
              (0,_graphic_data_plotly_utility__WEBPACK_IMPORTED_MODULE_0__.logFormFieldValues)();
            });
          }
        }
      }
      const targetElement = document.getElementById('graphGUI');
      targetElement.appendChild(newDiv);
    });
  }
}
// Bridge for classic scripts until they are modularized.
window.plotlyLineParameterFields = plotlyLineParameterFields;

/***/ },

/***/ "./includes/figures/js/interactive/plotly-utility.js"
/*!***********************************************************!*\
  !*** ./includes/figures/js/interactive/plotly-utility.js ***!
  \***********************************************************/
(__unused_webpack_module, __webpack_exports__, __webpack_require__) {

__webpack_require__.r(__webpack_exports__);
/* harmony export */ __webpack_require__.d(__webpack_exports__, {
/* harmony export */   buildPlotlySnippetEmbedCode: () => (/* binding */ buildPlotlySnippetEmbedCode),
/* harmony export */   computePercentile: () => (/* binding */ computePercentile),
/* harmony export */   computeStandardDeviation: () => (/* binding */ computeStandardDeviation),
/* harmony export */   createFigureIframeHtml: () => (/* binding */ createFigureIframeHtml),
/* harmony export */   fillFormFieldValues: () => (/* binding */ fillFormFieldValues),
/* harmony export */   loadExternalScript: () => (/* binding */ loadExternalScript),
/* harmony export */   loadPlotlyScript: () => (/* binding */ loadPlotlyScript),
/* harmony export */   logFormFieldValues: () => (/* binding */ logFormFieldValues),
/* harmony export */   plotlyScriptPromise: () => (/* binding */ plotlyScriptPromise),
/* harmony export */   saveHtmlToServer: () => (/* binding */ saveHtmlToServer),
/* harmony export */   waitForElementById: () => (/* binding */ waitForElementById)
/* harmony export */ });
// Needed to ensure Plotly is only loaded once
let plotlyScriptPromise = null;

/**
 * Loads the Plotly.js library dynamically if it is not already loaded.
 *
 * This function ensures that the Plotly.js library is loaded and available for use.
 * If the library is already loaded, it resolves immediately. If the loading process
 * has already started, it reuses the same Promise to avoid multiple simultaneous loads.
 *
 * @return {Promise<void>} A Promise that resolves when the Plotly.js library is successfully loaded.
 *                          If the library fails to load or initialize, the Promise is rejected with an error.
 *
 * @throws {Error} If the Plotly.js library fails to initialize after loading.
 *
 * @example
 * loadPlotlyScript()
 *   .then(() => {
 *     console.log('Plotly.js is ready to use.');
 *     // You can now use Plotly to create charts
 *   })
 *   .catch((error) => {
 *     console.error('Failed to load Plotly.js:', error);
 *   });
 */
function loadPlotlyScript() {
  if (window.Plotly) {
    return Promise.resolve();
  }

  // Reuse the same Promise if already started
  if (plotlyScriptPromise) {
    return plotlyScriptPromise;
  }
  plotlyScriptPromise = new Promise((resolve, reject) => {
    const existingScript = document.querySelector('script[src="https://cdn.plot.ly/plotly-3.0.0.min.js"]');
    if (existingScript) {
      existingScript.onload = () => {
        if (window.Plotly) {
          resolve();
        } else {
          reject(new Error('Plotly failed to initialize.'));
        }
      };
      existingScript.onerror = reject;
      return;
    }
    const script = document.createElement('script');
    script.src = 'https://cdn.plot.ly/plotly-3.0.0.min.js';
    script.onload = () => {
      if (window.Plotly) {
        resolve();
      } else {
        reject(new Error('Plotly failed to initialize.'));
      }
    };
    script.onerror = reject;
    document.head.appendChild(script);
  });
  return plotlyScriptPromise;
}

/**
 * Waits for an HTML element with the specified ID to appear in the DOM within a given timeout period.
 * Polls the DOM at regular intervals to check for the presence of the element.
 *
 * @function
 * @param {string} id             - The ID of the HTML element to wait for.
 * @param {number} [timeout=1000] - The maximum time (in milliseconds) to wait for the element to appear. Defaults to 1000ms.
 * @return {Promise<HTMLElement>} A promise that resolves with the found HTML element if it appears within the timeout period.
 * @throws {Error} If the element with the specified ID is not found within the timeout period.
 *
 * @example
 * waitForElementById('my-element', 2000)
 *   .then(element => {
 *     console.log('Element found:', element);
 *   })
 *   .catch(error => {
 *     console.error(error.message);
 *   });
 */
function waitForElementById(id, timeout = 1000) {
  return new Promise((resolve, reject) => {
    const intervalTime = 50;
    let elapsedTime = 0;
    const interval = setInterval(() => {
      const element = document.getElementById(id);
      if (element) {
        clearInterval(interval);
        resolve(element);
      }
      elapsedTime += intervalTime;
      if (elapsedTime >= timeout) {
        clearInterval(interval);
        reject(new Error(`Element with id ${id} not found after ${timeout}ms`));
      }
    }, intervalTime);
  });
}

/**
 * Computes the standard deviation of an array of numbers.
 *
 * The standard deviation is a measure of the amount of variation or dispersion
 * in a set of values. This function calculates the population standard deviation,
 * which divides by the number of elements (n) rather than (n - 1).
 *
 * @param {number[]} arr - The array of numbers for which to compute the standard deviation.
 *                       Must be a non-empty array. If the array is empty or not an array,
 *                       the function will return 0.
 * @return {number} The standard deviation of the numbers in the array. Returns 0 if the input
 *                   is not a valid array or is empty.
 */
function computeStandardDeviation(arr) {
  if (!Array.isArray(arr) || arr.length === 0) {
    return 0;
  }

  // Filter out invalid or "NA" values
  const numericValues = arr.filter(val => val !== null && val !== undefined && val !== '' && !(typeof val === 'string' && val.trim().toUpperCase() === 'NA') && !isNaN(val)).map(val => parseFloat(val));
  if (numericValues.length === 0) {
    return 0;
  }
  const n = numericValues.length;
  const mean = numericValues.reduce((a, b) => a + b, 0) / n;
  const variance = numericValues.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
  return Math.sqrt(variance);
}

/**
 * Computes the percentile value from an array of numbers.
 *
 * This function calculates the value at a given percentile in a numeric array.
 * The array is first sorted in ascending order. The percentile is specified as a number between 0 and 100.
 * If the array is empty, the function returns `undefined`. If the array contains only one element,
 * that element is returned. For arrays with more than one element, the function uses linear interpolation
 * between the two nearest ranks if the desired percentile falls between them.
 *
 * @param {number[]} arr        - The array of numbers from which to compute the percentile. Should be non-empty.
 * @param {number}   percentile - The percentile to compute (between 0 and 100).
 * @return {number|undefined} The value at the specified percentile, or `undefined` if the array is empty.
 *
 * @example
 * // For arr = [1, 2, 3, 4, 5], percentile = 50
 * // Returns 3 (the median)
 * computePercentile([1, 2, 3, 4, 5], 50);
 *
 * @example
 * // For arr = [10, 20, 30], percentile = 75
 * // Returns 25 (interpolated between 20 and 30)
 * computePercentile([10, 20, 30], 75);
 *
 * @example
 * // For arr = [], percentile = 90
 * // Returns undefined
 * computePercentile([], 90);
 */
function computePercentile(arr, percentile) {
  if (arr.length === 0) {
    return undefined;
  }
  if (arr.length === 1) {
    return arr[0];
  }
  const sorted = [...arr].sort((a, b) => a - b);
  const index = percentile / 100 * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  if (lower === upper) {
    return sorted[lower];
  }
  return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
}

/**
 * @file This file contains utility functions used for creating javascript figures - both in the display of those figures,
 * as well in getting the figure parameter values from the WordPress user
 * @version 1.0.0
 */

/**
 * Loads an external JavaScript file into the document.
 *
 * @async
 * @function loadExternalScript
 * @param {string} url - The URL of the external JavaScript file.
 * @return {Promise<void>} A promise that resolves when the script is loaded
 *   and appended to the document, or rejects if there's an error.
 * @throws {Error} Throws an error if the script fails to load.
 * @example
 * loadExternalScript('https://cdn.plot.ly/plotly-3.0.0.min.js')
 *   .then(() => console.log('Plotly loaded!'))
 *   .catch((error) => console.error('Failed to load Plotly:', error));
 */
function loadExternalScript(url) {
  return new Promise((resolve, reject) => {
    // Check if script is already loaded
    if (document.querySelector(`script[src="${url}"]`)) {
      resolve();
      return;
    }
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = url;
    script.async = true;
    script.onload = () => {
      resolve();
    };
    script.onerror = () => {
      reject(new Error(`Failed to load script: ${url}`));
    };
    document.head.appendChild(script);
  });
}

/**
 * Logs the values of form fields (inputs, selects, etc.) associated with
 * JavaScript figure parameters to a hidden input field, so that they are saved in the WordPress database.
 * This function finds all elements with the name "plotFields",
 * extracts their ID and value, and stores them as a JSON string in the
 * "figure_interactive_arguments" field.
 *
 * @function logFormFieldValues
 * @listens change
 * @example
 * // Assuming you have the following HTML:
 * // <input type="text" name="plotFields" id="xAxisTitle" value="Date">
 * // <input type="hidden" name="figure_interactive_arguments" value="">
 * logFormFieldValues(); // After a change to one of the above plotFields, the hidden input will be updated
 */
function logFormFieldValues() {
  const allFields = document.getElementsByName('plotFields');
  const fieldValues = [];
  allFields.forEach(uniqueField => {
    fieldValues.push([uniqueField.id, uniqueField.value]);
  });
  document.getElementsByName('figure_interactive_arguments')[0].value = JSON.stringify(fieldValues);
}

/**
 * Fills in the values of form fields associated with JavaScript figure
 * parameters. It retrieves the values from the hidden
 * "figure_interactive_arguments" field and populates the corresponding
 * form fields.
 *
 * @function fillFormFieldValues
 * @param {string} elementID - The ID of the form field to fill.
 * @return {string|undefined} The value of the form field if found, or
 *   `undefined` if the field or its value is not found.
 * @example
 * // Assuming you have the following HTML:
 * // <input type="text" name="plotFields" id="xAxisTitle" value="">
 * // <input type="hidden" name="figure_interactive_arguments" value="[['xAxisTitle', 'Date'], ['yAxisTitle', 'Value']]">
 * const xAxisTitle = fillFormFieldValues('xAxisTitle'); // xAxisTitle will be set to "Date"
 */
function fillFormFieldValues(elementID) {
  let interactiveFields = document.getElementsByName('figure_interactive_arguments')[0].value;

  // CHECK FOR "\" AND REMOVE IF EXISTS, This is to fix escaping issues for existing figures
  if (interactiveFields.includes('\\')) {
    interactiveFields = interactiveFields.replace(/\\/g, '');
  }
  if (interactiveFields != '' && interactiveFields != null) {
    const resultJSON = Object.fromEntries(JSON.parse(interactiveFields));
    if (resultJSON[elementID] != undefined && resultJSON[elementID] != '') {
      return resultJSON[elementID];
    }
  }
}

/**
 * Generates the HTML document and embed metadata needed to display a Plotly figure in an iframe.
 *
 * Builds a self-contained HTML page that loads Plotly from CDN (if not already present) and
 * renders the figure responsively. Width/height are stripped from the layout so the chart fills
 * its container automatically.
 *
 * @param {Object} savedFigure - Plotly figure object with `data`, `layout`, and `config` properties.
 * @param {string|number} figureID - Unique identifier for the figure, used in element IDs and the output filename.
 * @param {string} rootURL - WordPress site root URL (no trailing slash), used to construct the iframe `src` path.
 * @returns {{
 *   figIframeHtml: string,
 *   figIframeHtmlFileName: string,
 *   figIframeHtmlPath: string,
 *   figIframeCode: string
 * }} Object containing the full HTML document string, the filename (without extension), the
 *    expected server path, and a ready-to-insert `<iframe>` tag.
 */
function createFigureIframeHtml(savedFigure, figureID, rootURL) {
  function buildStandalonePlotlyEmbedCode(savedFigure, figureID) {
    const cleanFigure = {
      data: savedFigure.data || [],
      layout: JSON.parse(JSON.stringify(savedFigure.layout || {})),
      config: savedFigure.config || {}
    };
    delete cleanFigure.layout.width;
    delete cleanFigure.layout.height;
    cleanFigure.layout.autosize = true;
    const jsonString = JSON.stringify(cleanFigure).replace(/<\/script/gi, "<\\/script");
    return `
	<script>
	(function () {
		const currentScript = document.currentScript;
	
		const chart = document.createElement("div");
		chart.id = "${figureID}";
		chart.style.position = "absolute";
		chart.style.width = "100%";
		chart.style.height = "100%";
		chart.style.minHeight = "400px";

		currentScript.parentNode.insertBefore(chart, currentScript);
	
		const fig = ${jsonString};
	
		function renderPlot() {
		Plotly.react(
			chart,
			fig.data || [],
			fig.layout || {},
			fig.config || {}
		).then(function () {
			Plotly.Plots.resize(chart);
		});
	
		window.addEventListener("resize", function () {
			Plotly.Plots.resize(chart);
		});
		}
	
		if (typeof Plotly !== "undefined") {
		renderPlot();
		return;
		}
	
		const script = document.createElement("script");
		script.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
		script.onload = renderPlot;
		document.head.appendChild(script);
	})();
	</script>
	`;
  }
  const figIframeHtml = `
				<!doctype html>
				<html>
				<head>
				<meta charset="utf-8">
				<title>Plotly Embed</title>
				<style>
					html, body {
					width: 100%;
					min-height: 400px;
					margin: 0;
					padding: 0;
					}

					body {
					overflow: hidden;
					}

					#plotly-embed-${figureID} {
					width: 100%;
					height: 100%;
					min-height: 400px;
					}
				</style>
				</head>
				<body>
				${buildStandalonePlotlyEmbedCode(savedFigure, `plotly-embed-${figureID}`)}
				</body>
				</html>
	`;
  const figIframeHtmlFileName = `plotly-${figureID}`;
  const figIframeHtmlPath = `${rootURL}/wp-content/data/figure_${figureID}/${figIframeHtmlFileName}.html`;
  const figIframeCode = `<iframe src="${figIframeHtmlPath}" width="100%" height="400px !important" min-height="400px !important"></iframe>`;
  return {
    figIframeHtml,
    figIframeHtmlFileName,
    figIframeHtmlPath,
    figIframeCode
  };
}

/**
 * Builds an inline HTML snippet that renders a Plotly figure directly in a page (not inside an iframe).
 *
 * Produces a `<div>` wrapper and an immediately-invoked `<script>` block. The script inlines the
 * figure JSON, loads Plotly from CDN if needed (reusing any already-loading CDN script to avoid
 * duplicate requests), and calls `Plotly.react` once the library is ready. Width/height are removed
 * from the layout so the chart fills its container responsively.
 *
 * @param {Object} savedFigure - Plotly figure object with `data`, `layout`, and `config` properties.
 * @param {string} embedID - Unique element ID for the chart `<div>`. A wrapper `<div>` with ID
 *   `${embedID}-wrap` is also created around it.
 * @returns {string} An HTML string containing the wrapper div and self-executing script tag, ready
 *   to be injected into a page.
 */
function buildPlotlySnippetEmbedCode(savedFigure, embedID) {
  const cleanFigure = {
    data: savedFigure.data || [],
    layout: JSON.parse(JSON.stringify(savedFigure.layout || {})),
    config: savedFigure.config || {}
  };
  delete cleanFigure.layout.width;
  delete cleanFigure.layout.height;
  cleanFigure.layout.autosize = true;
  cleanFigure.config.responsive = true;
  const jsonString = JSON.stringify(cleanFigure).replace(/<\/script/gi, "<\\/script");
  return `
	<div id="${embedID}-wrap" style="width:100%; min-height:400px; height:500px; position:relative;">
		<div id="${embedID}" style="width:100%; height:100%; min-height:400px;"></div>
	</div>
	
	<script>
	(function () {
		const fig = ${jsonString};
		const target = document.getElementById("${embedID}");
	
		function renderPlot() {
		const target2 = document.getElementById("${embedID}");

		if (!target || typeof Plotly === "undefined") return;

		Plotly.react(
		  target,
		  fig.data || [],
		  fig.layout || {},
		  fig.config || {}
		).then(function () {
		  Plotly.Plots.resize(target2);
		});

		window.addEventListener("resize", function () {
		  Plotly.Plots.resize(target);
		});
	  }

	  if (typeof Plotly !== "undefined") {
		renderPlot();
		return;
	  }

	  const existing = document.querySelector('script[src*="cdn.plot.ly"]');

	  if (existing) {
		const waitForPlotly = setInterval(function () {
		  if (typeof Plotly !== "undefined") {
			clearInterval(waitForPlotly);
			renderPlot();
		  }
		}, 50);

		setTimeout(function () {
		  clearInterval(waitForPlotly);
		}, 10000);

		return;
	  }

	  const script = document.createElement("script");
	  script.src = "https://cdn.plot.ly/plotly-2.35.2.min.js";
	  script.onload = renderPlot;
	  document.head.appendChild(script);
	})();
	</script>
	`;
}

/**
 * Uploads an HTML string to the server as a file via the WordPress AJAX API.
 *
 * Wraps `htmlContent` in a `File` object and POSTs it to `wp-admin/admin-ajax.php` using
 * the `custom_file_upload` action. Requires a `[name="figure_nonce"]` input to be present
 * in the DOM; alerts and returns early if it is missing.
 *
 * @param {string} htmlContent - The raw HTML string to save.
 * @param {string} fileName - The filename (including extension) to use when creating the uploaded file.
 * @param {string|number} postId - The WordPress post ID to associate the uploaded file with.
 * @returns {Promise<Object>|undefined} Resolves with the parsed JSON response from the server on
 *   success or failure (`result.success` indicates outcome), or `undefined` if the nonce is missing.
 * @throws {Error} Rejects if the `fetch` call itself fails (network error, etc.).
 */
function saveHtmlToServer(htmlContent, fileName, postId) {
  // Send the HTML content and filename to the server via AJAX

  const htmlBlob = new Blob([htmlContent], {
    type: "text/html"
  });
  const htmlFile = new File([htmlBlob], fileName, {
    type: "text/html"
  });
  const figureNonceInput = document.querySelector('[name="figure_nonce"]');
  if (!figureNonceInput || !figureNonceInput.value) {
    alert("Error: figure_nonce is missing in the form!");
    return;
  }
  const formData = new FormData();

  // Must match your WP AJAX action hook
  formData.append("action", "custom_file_upload");

  // Must match your PHP expected fields
  formData.append("post_id", postId);
  formData.append("figure_nonce", figureNonce);
  formData.append("uploaded_file", htmlFile);
  const ajaxUrl = window.location.origin + "/wp-admin/admin-ajax.php";
  return fetch(ajaxUrl, {
    method: "POST",
    body: formData,
    credentials: "same-origin"
  }).then(response => response.json()).then(result => {
    if (!result.success) {
      console.error("HTML upload failed:", result.data);
      return result;
    }
    console.log("HTML uploaded successfully:", result.data);
    return result;
  }).catch(error => {
    console.error("AJAX error uploading HTML:", error);
    throw error;
  });
}

// Bridge for classic scripts (admin-preview-buttons.js) until they are modularized.
window.fillFormFieldValues = fillFormFieldValues;

/***/ }

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			// no module.id needed
/******/ 			// no module.loaded needed
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		if (!(moduleId in __webpack_modules__)) {
/******/ 			delete __webpack_module_cache__[moduleId];
/******/ 			var e = new Error("Cannot find module '" + moduleId + "'");
/******/ 			e.code = 'MODULE_NOT_FOUND';
/******/ 			throw e;
/******/ 		}
/******/ 		__webpack_modules__[moduleId](module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
var __webpack_exports__ = {};
// This entry needs to be wrapped in an IIFE because it needs to be isolated against other modules in the chunk.
(() => {
/*!******************************************!*\
  !*** ./blocks/insert-figure/src/view.js ***!
  \******************************************/
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var _graphic_data_plotly_timeseries_line__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! @graphic-data/plotly-timeseries-line */ "./includes/figures/js/interactive/plotly-timeseries-line.js");
/* harmony import */ var _graphic_data_plotly_bar__WEBPACK_IMPORTED_MODULE_1__ = __webpack_require__(/*! @graphic-data/plotly-bar */ "./includes/figures/js/interactive/plotly-bar.js");


function normalizeInteractiveArguments(value) {
  if (!value) {
    return '';
  }
  if (typeof value === 'string') {
    return value;
  }
  return JSON.stringify(value);
}
function readInteractiveArguments(block) {
  const dataElement = block.querySelector('.graphic-data-interactive-arguments');
  if (!dataElement) {
    return '';
  }
  const rawValue = dataElement.textContent.trim();
  if (!rawValue) {
    return '';
  }
  try {
    return normalizeInteractiveArguments(JSON.parse(rawValue));
  } catch (error) {
    // If the script tag already contains the raw argument string, use it.
    return rawValue;
  }
}
function findTargetInBlock(block, targetFigureElement) {
  return Array.from(block.querySelectorAll('.graphic-data-block-plotly-target')).find(element => element.id === targetFigureElement);
}
async function renderFigureBlock(block) {
  const figureId = Number(block.dataset.figureId || 0);
  if (!figureId) {
    return;
  }
  const targetFigureElement = block.dataset.targetId || `targetFigureElement_${figureId}`;
  const interactiveArguments = readInteractiveArguments(block);
  const rawArgs = interactiveArguments;
  const parsedArgs = typeof rawArgs === 'string' ? JSON.parse(rawArgs) : rawArgs;
  const graphType = Array.isArray(parsedArgs) ? Object.fromEntries(parsedArgs).graphType : parsedArgs?.graphType;
  console.log('graphType', graphType);
  if (!interactiveArguments) {
    throw new Error(`Missing figure_interactive_arguments for figure ${figureId}.`);
  }
  let targetDiv = findTargetInBlock(block, targetFigureElement);
  if (!targetDiv) {
    targetDiv = document.createElement('div');
    targetDiv.id = targetFigureElement;
    targetDiv.className = 'targetFigureElement graphic-data-block-plotly-target';
    targetDiv.dataset.figureId = String(figureId);
    targetDiv.style.width = '100%';
    targetDiv.style.maxWidth = '100%';
    block.appendChild(targetDiv);
  }
  if (window.Plotly?.purge) {
    try {
      window.Plotly.purge(targetDiv);
    } catch (error) {
      // Ignore purge errors. The target may not have an existing Plotly plot yet.
    }
  }
  targetDiv.innerHTML = '';
  if (graphType === 'Plotly line graph (time series)') {
    await Promise.resolve((0,_graphic_data_plotly_timeseries_line__WEBPACK_IMPORTED_MODULE_0__.producePlotlyLineFigure)(targetFigureElement, interactiveArguments, figureId, document));
  }
  if (graphType === 'Plotly bar graph') {
    await Promise.resolve((0,_graphic_data_plotly_bar__WEBPACK_IMPORTED_MODULE_1__.producePlotlyBarFigure)(targetFigureElement, interactiveArguments, figureId, document));
  }
  const plotDiv = document.getElementById(`plotlyFigure${figureId}`);
  if (plotDiv && window.Plotly?.Plots?.resize) {
    plotDiv.style.width = '100%';
    plotDiv.style.maxWidth = '100%';
    window.Plotly.Plots.resize(plotDiv);
  }
}
function renderGraphicDataInsertFigures() {
  const figureBlocks = document.querySelectorAll('.graphic-data-frontend-figure[data-figure-id]');
  figureBlocks.forEach(block => {
    renderFigureBlock(block).catch(error => {
      const figureId = block.dataset.figureId || '';
      console.error('Frontend Plotly render failed:', error);
      block.innerHTML = `
				<div class="graphic-data-figure-error">
					Failed to render figure ${figureId}.
				</div>
			`;
    });
  });
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', renderGraphicDataInsertFigures);
} else {
  renderGraphicDataInsertFigures();
}
})();

/******/ })()
;
//# sourceMappingURL=view.js.map