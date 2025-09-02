

let plotlyScriptPromise = null;

function loadPlotlyScript() {
    if (window.Plotly) return Promise.resolve();

    // Reuse the same Promise if already started
    if (plotlyScriptPromise) return plotlyScriptPromise;

    plotlyScriptPromise = new Promise((resolve, reject) => {
        const existingScript = document.querySelector('script[src="https://cdn.plot.ly/plotly-3.0.0.min.js"]');
        if (existingScript) {
            existingScript.onload = () => {
                if (window.Plotly) resolve();
                else reject(new Error("Plotly failed to initialize."));
            };
            existingScript.onerror = reject;
            return;
        }

        const script = document.createElement('script');
        script.src = 'https://cdn.plot.ly/plotly-3.0.0.min.js';
        script.onload = () => {
            if (window.Plotly) resolve();
            else reject(new Error("Plotly failed to initialize."));
        };
        script.onerror = reject;
        document.head.appendChild(script);
    });

    return plotlyScriptPromise;
}


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

        overlays.push({
            x: [start, end, end, start],
            y: [yMax, yMax, yMin, yMin],
            fill: 'toself',
            fillcolor: fillColor,
            type: 'scatter',
            mode: 'lines',
            line: { color: fillColor, width: 0 },
            hoverinfo: `Evaluation Period`,
            // hovertemplate:
            // `${startDate}<br>` +
            // `${endDate}<extra></extra>`,
            name: `Evaluation Period`,
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
        }
        
    }
    Plotly.react(plotDiv, [...mainDataTraces, ...overlays], layout);
}


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

function computeStandardDeviation(arr) {
    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const variance = arr.reduce((acc, val) => acc + (val - mean) ** 2, 0) / n;
    return Math.sqrt(variance);
}

function computePercentile(arr, percentile) {
    if (arr.length === 0) return undefined;
    if (arr.length === 1) return arr[0];
    const sorted = [...arr].sort((a, b) => a - b);
    const index = (percentile / 100) * (sorted.length - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    if (lower === upper) return sorted[lower];
    return sorted[lower] + (index - lower) * (sorted[upper] - sorted[lower]);
}

async function producePlotlyLineFigure(targetFigureElement, interactive_arguments, postID){
    try {
        await loadPlotlyScript(); // ensures Plotly is ready

        const rawField = interactive_arguments;
        //console.log(rawField);
        const figureArguments = Object.fromEntries(JSON.parse(rawField));
        const rootURL = window.location.origin;

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
        const dataToBePlotted = responseJson.data;

        let newDiv = document.createElement('div');
        const plotlyDivID = `plotlyFigure${figureID}`;
        newDiv.id = plotlyDivID
        newDiv.classList.add("container", `figure_interactive${figureID}`);

        const targetElementparts = targetFigureElement.split("_");
        const targetElementpostID = targetElementparts[targetElementparts.length - 1];

        if (figureID == targetElementpostID) {

            //console.log(`Figure ID ${figureID} matches target element post ID ${targetElementpostID}`) ;            
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
                console.log('lineType', lineType);
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


                //Show Standard Deviation Filled/Shaded Area
                const showSD = figureArguments[targetLineColumn + 'StdDev'];
                const showSD_InputValuesOpt = figureArguments[targetLineColumn + 'StdDevInputValues'];
                //Standard Deviation of dataset based on dataset Y-axis values (AutoCalculated)
                if (showSD == 'on' && showSD_InputValuesOpt === 'auto') {
                    const mean = plotlyY.reduce((a, b) => a + b, 0) / plotlyY.length;
                    const upperY = plotlyY.filter(item => item !== "").map(y => mean + stdDev);
                    const lowerY = plotlyY.filter(item => item !== "").map(y => mean - stdDev);
                    const filteredX = plotlyX.filter(item => item !== "");
                    const stdFill = {
                        x: [...filteredX, ...filteredX.slice().reverse()],
                        y: [...upperY, ...lowerY.slice().reverse()],
                        fill: 'toself',
                        fillcolor: figureArguments[targetLineColumn + 'StdDevColor'] + '27',
                        line: { color: 'transparent' },
                        name: `${figureArguments[targetLineColumn + 'Title']} Mean ±1 SD`,
                        type: 'scatter',
                        //hoverinfo: `${figureArguments[targetLineColumn + 'Title']} Mean ±1 SD`, //String(upperY-mean),
                        hoverinfo: `skip`, //String(upperY-mean),
                        // hovertemplate:
                        // 'X: %{x}<br>' +
                        // 'Y: %{y}<br>' +
                        // '<extra></extra>',
                        showlegend: showLegendBool,
                        visible: true
                    };
                    allLinesPlotly.push(stdFill);
                }
                //Standard Deviation (values imported from spreadsheet per point in dataset)
                //Do we want high and low bounds here?
                if (showSD == 'on' && showSD_InputValuesOpt != 'auto') {
                    const stdSingleValue = dataToBePlotted[showSD_InputValuesOpt].filter(item => item !== "").reduce((a, b) => a + b, 0) / dataToBePlotted[showSD_InputValuesOpt].length;
                    const mean = plotlyY.reduce((a, b) => a + b, 0) / plotlyY.length;
                    const upperY = plotlyY.filter(item => item !== "").map(y => mean + stdSingleValue);
                    const lowerY = plotlyY.filter(item => item !== "").map(y => mean - stdSingleValue);
                    const filteredX = plotlyX.filter(item => item !== "");
                    const stdFill = {
                        x: [...filteredX, ...filteredX.slice().reverse()],
                        y: [...upperY.filter(item => item !== ""), ...lowerY.filter(item => item !== "").slice().reverse()],
                        fill: 'toself',
                        fillcolor: figureArguments[targetLineColumn + 'StdDevColor'] + '27',
                        line: { color: 'transparent' },
                        name: `${figureArguments[targetLineColumn + 'Title']} Mean ±1 SD`,
                        type: 'scatter',
                        hoverinfo: `skip`,
                        //hoverinfo: `${figureArguments[targetLineColumn + 'Title']} Mean ±1 SD`,//String(stdSingleValue),
                        // hovertemplate:
                        // 'X: %{x}<br>' +
                        // 'Y: %{y}<br>' +
                        // '<extra></extra>',
                        showlegend: showLegendBool,
                        visible: true
                    };
                    allLinesPlotly.push(stdFill);
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
                        const mean = plotlyY.reduce((a, b) => a + b, 0) / plotlyY.length;
                        const filteredX = plotlyX.filter(item => item !== "");
                        const xMin = Math.min(...filteredX);
                        const xMax = Math.max(...filteredX);
                        allLinesPlotly.push({
                            x: [xMin, xMax],
                            y: [mean, mean],
                            mode: 'lines',
                            line: { dash: 'dash', color: figureArguments[targetLineColumn + 'Color'] + '60'},
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
                            line: { dash: 'dash', color: figureArguments[targetLineColumn + 'Color'] + '60'},
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
                    range: [figureArguments['XAxisLowBound'], figureArguments['XAxisHighBound']]                      
                },
                yaxis: {
                    title: {
                    text: figureArguments['YAxisTitle']
                    },
                    linecolor: 'black', 
                    linewidth: 1,
                    range: [figureArguments['YAxisLowBound'], figureArguments['YAxisHighBound']]     
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

function plotlyLineParameterFields(jsonColumns, interactive_arguments){

  let newDiv = document.createElement("div");
  newDiv.id = 'secondaryGraphFields';
  const targetElement = document.getElementById('graphGUI');

  let newRow;
  let newColumn1;
  let newColumn2;

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


// generate the form fields needed for users to indicate preferences for how a figure should appear 
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

      let fieldLabels = [["XAxis", "X Axis Column"]];
      for (let i = 1; i <= numLines; i++){
          fieldLabels.push(["Line" + i, "Line " + i + " Column"]);
      }

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
                controls.push(labelStartDate, document.createElement('br'), StartDateValues, document.createElement('br'), labelEndDate, document.createElement('br'), EndDateValues, document.createElement('br'), labelColor, document.createElement('br'), ColorValue);
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
                    fillFormFieldValues(axisSelect.id, interactive_arguments);

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

              const markerSizeSaved = fillFormFieldValues(markerSizeSelect.id, interactive_arguments);
              if (markerSizeSaved) markerSizeSelect.value = markerSizeSaved;

              markerSizeSelect.addEventListener('change', logFormFieldValues);
              markerSizeCol1.appendChild(markerSizeLabel);
              markerSizeCol2.appendChild(markerSizeSelect);
              markerSizeRow.append(markerSizeCol1, markerSizeCol2);
              newDiv.append(markerSizeRow);


            //Add checkboxes for error bars, standard deviation, mean, and percentiles
            const features = ["Legend", "ConnectGaps", "Mean", "StdDev", "ErrorBars", "Percentiles"];
            const featureNames = ["Add Line to Legend", "Connect Missing Data Gaps","Mean Line", "+-1 Std Dev Fill ", "Symmetric Error Bars", "90th & 10th Percentile Lines"];
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
