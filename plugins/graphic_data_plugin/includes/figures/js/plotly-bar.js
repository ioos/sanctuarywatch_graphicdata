
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
    if (!Array.isArray(arr) || arr.length === 0) return 0;

    const n = arr.length;
    const mean = arr.reduce((a, b) => a + b, 0) / n;
    const variance = arr.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / n;
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
            //console.log("figureID ADMIN:", figureID);
        }
        if (postID != null) {
            // THEME SIDE POST ID GRAB
            figureID = postID;
            //console.log("figureID THEME:", figureID);
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

            //console.log(`Figure ID ${figureID} matches target element post ID ${targetElementpostID}`) ;            
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

            for (let i = 1; i <= figureArguments['NumberOfBars']; i++) {
                const targetBarColumn = 'Bar' + i;
                const columnXHeader = figureArguments['XAxis'];
                const columnYHeader = figureArguments[targetBarColumn];

                const isStacked = figureArguments[targetBarColumn + 'Stacked'];
                const StackedSeparatorColor = figureArguments[targetBarColumn + 'StackedSeparatorLineColor'];
                const showLegend = figureArguments[targetBarColumn + 'Legend'];
                const showLegendBool = showLegend === 'on';

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
                                }
                            },
                            hovertemplate: `${columnXHeader}: ${stackCategory}`
                        });
                    });
                }

                // === CASE: Single Bar (no X axis) ===
                else if (columnXHeader === 'None') {
                    console.log(' // === CASE: Single Bar (no X axis) ===');
                    plotlyX = [figureArguments[targetBarColumn + 'Title'] || `Bar ${i}`];
                    const sumY = dataToBePlotted[columnYHeader].map(val => parseFloat(val)).filter(val => !isNaN(val)).reduce((a, b) => a + b, 0);
                    plotlyY = [sumY];

                    allBarsPlotly.push({
                        x: plotlyX,
                        y: plotlyY,
                        type: 'bar',
                        name: `${figureArguments[targetBarColumn + 'Title']}`,
                        showlegend: showLegendBool,
                        marker: {
                            color: figureArguments[targetBarColumn + 'Color']
                        },
                        hovertemplate: `${figureArguments['YAxisTitle']}: %{y}`
                    });
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

                    allBarsPlotly.push({
                        x: plotlyX,
                        y: plotlyY,
                        type: 'bar',
                        name: `${figureArguments[targetBarColumn + 'Title']}`,
                        showlegend: showLegendBool,
                        marker: {
                            color: figureArguments[targetBarColumn + 'Color']
                        },
                        hovertemplate: `${figureArguments['XAxisTitle']}: %{x}<br>${figureArguments['YAxisTitle']}: %{y}`
                    });
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
                    //console.log(plotlyX);
                    plotlyY = Object.values(groupMap);
                    //console.log(plotlyY);



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
                        const mean = plotlyY.reduce((a, b) => a + b, 0) / plotlyY.length;
                        const filteredX = plotlyX.filter(item => item !== "");
                        const xMin = Math.min(...filteredX);
                        const xMax = Math.max(...filteredX);
                        allBarsPlotly.push({
                            x: [xMin, xMax],
                            y: [mean, mean],
                            mode: 'lines',
                            line: { dash: 'dash', color: figureArguments[targetBarColumn + 'Color'] + '60'},
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
                            line: { dash: 'dash', color: figureArguments[targetBarColumn + 'Color'] + '60'},
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
                            color: figureArguments[targetBarColumn + 'Color']
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
                    automargin: true
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
                    )
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
            Plotly.newPlot(plotlyDivID, allBarsPlotly, layout, config);

        } else {}
    } catch (error) {
        console.error('Error loading scripts:', error);
    }
}

function plotlyBarParameterFields(jsonColumns, interactive_arguments){

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
  displayBarFields(selectNumberBars.value, jsonColumns, interactive_arguments);
}


// generate the form fields needed for users to indicate preferences for how a figure should appear 
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


        // Add checkbox for StackedBarColumns
        let labelStackedBarColumns = document.createElement("label");
        labelStackedBarColumns.for = "StackedBarColumns";
        labelStackedBarColumns.innerHTML = "Group Bars by X-axis (Stacked Columns)";
        let checkboxStackedBarColumns = document.createElement("input");
        checkboxStackedBarColumns.type = "checkbox";
        checkboxStackedBarColumns.id = "StackedBarColumns";
        checkboxStackedBarColumns.name = "plotFields";
        checkboxStackedBarColumns.addEventListener("change", function () {
            if (numBars > 1) {
                checkboxStackedBarColumns.value = checkboxStackedBarColumns.checked ? 'on' : "";
                logFormFieldValues();
            }
            if (numBars <= 1) {
                checkboxStackedBarColumns.value = checkboxStackedBarColumns.checked ? "" : "";
                logFormFieldValues();
            } else {}
        });
  

        // Pre-fill value if previously saved
        fieldValueSaved = fillFormFieldValues(checkboxStackedBarColumns.id, interactive_arguments);
        if (fieldValueSaved === 'on') {
            checkboxStackedBarColumns.checked = true;
        }

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
        //end checkbox for StackedBarColumns

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
                const featureNames = ["Graph Legend Visible?", "Mean Bar Visible?", "Symmetric Error Bars Visible?", "90th & 10th Percentile Bars (Auto Calculated) Visible?", "Stack Bar by X Axis Column Values? (Not for use with Mean, Error Bars, or Percentiles)"];
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
