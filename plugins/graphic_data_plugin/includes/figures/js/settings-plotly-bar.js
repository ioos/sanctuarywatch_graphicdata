

// ---- globals used across your helpers


//These are already called in settings-plotly-timeseries-bar.js
let jsonBarColumns = {};
let fieldValueBarSaved;

let interactive_bar_arguments_value = document.getElementById("interactive_bar_arguments_editor").value


//Hide the Bar Graph (Time Series) Arguments Editor row on load
document.addEventListener("DOMContentLoaded", function() {
    const row = document.getElementById("interactive_bar_arguments_editor").closest("tr");
    if (row) {
        row.style.display = "none";
    }
});

// // ====== Your functions (lightly tidied/safe-guarded) ======
// async function loadBarJson(targetContainer) {

//     // Only build GUI if we actually have columns
//     const lengthJsonColumns = Object.keys(jsonBarColumns).length;
//     if (lengthJsonColumns == 0) {
//         // Clear any existing GUI
//         const existing = document.getElementById('graphGUI');
//         if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

//         // Create the GUI wrapper
//         const targetElement = targetContainer;
//         const newDiv = document.createElement('div');
//         newDiv.id = "graphGUI";
//         newDiv.classList.add("container", "graphGUI");

//         // Label + select
//         const labelGraphType = document.createElement("label");
//         labelGraphType.setAttribute("for", "graphType");
//         labelGraphType.innerHTML = "Graph Type";

//         const selectGraphType = document.createElement("select");
//         selectGraphType.id = "graphType";
//         selectGraphType.name = "plotFields";

//         const optLine = new Option("Plotly bar graph (time series)", "Plotly bar graph (time series)");
//         selectGraphType.append(optLine);


//         //Pull saved interactive args (if any)
//         // const iaEl = <?php echo json_encode($interactive_bar_arguments_value); ?>;
//         const iaEl = document.getElementById("interactive_bar_arguments_value").dataset.value;
//         const interactive_arguments = iaEl ? iaEl : "";

        
//         //console.log('interactive_arguments', interactive_arguments);

//         //Restore saved selection (uses your own fill/log helpers)
//         if (typeof fillFormFieldBarValues === "function") {
//             fieldValueBarSaved = fillFormFieldBarValues(selectGraphType.id);
//             if (fieldValueBarSaved !== undefined) selectGraphType.value = fieldValueBarSaved;
//         }


//         // Layout
//         const row = document.createElement("div");
//         row.classList.add("row", "fieldPadding");
//         const col1 = document.createElement("div");
//         col1.classList.add("col-3");
//         const col2 = document.createElement("div");
//         col2.classList.add("col");

//         col1.appendChild(labelGraphType);
//         col2.appendChild(selectGraphType);
//         row.append(col1, col2);
//         newDiv.append(row);

//         targetElement.appendChild(newDiv);

//         console.log('fieldValueBarSaved', fieldValueBarSaved);

//         //Write button values is the fields do not have any saved values. 
//         if (fieldValueBarSaved == undefined) {
//             plotlyBarParameterFields(jsonBarColumns, interactive_arguments);
//             logFormFieldBarValues();
//         }

//         //Trigger secondaries if saved
//         if (fieldValueBarSaved !== undefined) {
//             secondaryGraphFields(interactive_arguments);
//         }

//     }
// }


// function secondaryGraphFields(interactive_arguments) {

//     // Remove existing secondary fields wrapper if present
//     const secondaryGraphDiv = document.getElementById('secondaryGraphFields');
//     if (secondaryGraphDiv && secondaryGraphDiv.parentNode) {
//         secondaryGraphDiv.parentNode.removeChild(secondaryGraphDiv);
//     }
    
//     clearPreviousGraphFields();
//     plotlyBarParameterFields(jsonBarColumns, interactive_arguments);        
// }

// function clearPreviousGraphFields() {
//     const assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
//     if (assignColumnsToPlot && assignColumnsToPlot.parentNode) {
//         assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
//     }
// }

// /**
//  * Logs the values of form fields (inputs, selects, etc.) associated with
//  * JavaScript figure parameters to a hidden input field, so that they are saved in the WordPress database.
//  * This function finds all elements with the name "plotFields",
//  * extracts their ID and value, and stores them as a JSON string in the
//  * "figure_interactive_arguments" field.
//  *
//  * @function logFormFieldBarValues
//  * @listens change
//  * @example
//  * // Assuming you have the following HTML:
//  * // <input type="text" name="plotFields" id="xAxisTitle" value="Date">
//  * // <input type="hidden" name="figure_interactive_arguments" value="">
//  * logFormFieldBarValues(); // After a change to one of the above plotFields, the hidden input will be updated
//  */
// function logFormFieldBarValues() {
//     const allFields = document.getElementsByName("plotFields");
//     let fieldValues = [];
//     allFields.forEach((uniqueField) => {
//         console.log([uniqueField.id, uniqueField.value]);
//         fieldValues.push([uniqueField.id, uniqueField.value]);
//     });
//     document.getElementById("interactive_bar_arguments_editor").value = JSON.stringify(fieldValues); 
// }

// /**
//  * Fills in the values of form fields associated with JavaScript figure
//  * parameters. It retrieves the values from the hidden
//  * "figure_interactive_arguments" field and populates the corresponding
//  * form fields.
//  *
//  * @function fillFormFieldBarValues
//  * @param {string} elementID - The ID of the form field to fill.
//  * @returns {string|undefined} The value of the form field if found, or
//  *   `undefined` if the field or its value is not found.
//  * @example
//  * // Assuming you have the following HTML:
//  * // <input type="text" name="plotFields" id="xAxisTitle" value="">
//  * // <input type="hidden" name="figure_interactive_arguments" value="[['xAxisTitle', 'Date'], ['yAxisTitle', 'Value']]">
//  * const xAxisTitle = fillFormFieldBarValues('xAxisTitle'); // xAxisTitle will be set to "Date"
//  */
// function fillFormFieldBarValues(elementID){
//     // const interactiveFields = <?php echo json_encode($interactive_bar_arguments_value); ?>;
//     // const interactiveFields = document.getElementById("interactive_bar_arguments_value").dataset.value;
//     const interactiveFields = document.getElementById("interactive_bar_arguments_editor").value
//     console.log('interactiveFields', interactiveFields);
//     if (interactiveFields != ""  && interactiveFields != null) {
//         const resultJSON = Object.fromEntries(JSON.parse(interactiveFields));

//         if (resultJSON[elementID] != undefined && resultJSON[elementID] != ""){
//             return resultJSON[elementID];
//         }
//     }
// }

// function plotlyBarParameterFields(jsonBarColumns, interactive_arguments){

//     let newDiv = document.createElement("div");
//     newDiv.id = 'secondaryGraphFields';
//     const targetElement = document.getElementById('graphGUI');

//     let newRow;
//     let newColumn1;
//     let newColumn2;

//     //Add checkboxes for showgrid
//     const features = ["showGrid", "graphTicks"];
//     const featureNames = ["Show X&Y Lines on Grid", "Remove Outside Graph Ticks"];
//     for (let i = 0; i < features.length; i++) {
//         const feature = features[i];
//         const featureName = featureNames[i];

//         let newRow = document.createElement("div");
//         newRow.classList.add("row", "fieldPadding");

//         let newColumn1 = document.createElement("div");
//         newColumn1.classList.add("col-3");
//         let newColumn2 = document.createElement("div");
//         newColumn2.classList.add("col");

//         let label = document.createElement("label");
//         label.for = feature;
//         label.innerHTML = `${featureName}`;
//         let checkbox = document.createElement("input");
//         checkbox.type = "checkbox";
//         checkbox.id = feature;
//         checkbox.name = "plotFields";

//         let fieldValueBarSaved = fillFormFieldBarValues(checkbox.id, interactive_arguments);
//         checkbox.value = fieldValueBarSaved === 'on' ? 'on' : "";
//         checkbox.checked = fieldValueBarSaved === 'on';

//         // Toggle visibility dynamically
//         checkbox.addEventListener('change', function () {
//             checkbox.value = checkbox.checked ? 'on' : "";
//             logFormFieldBarValues();
//         });

//         newColumn1.appendChild(label);
//         newColumn2.appendChild(checkbox);
//         newRow.append(newColumn1, newColumn2);
//         newDiv.append(newRow);
        
//     }
        


//     //X Axis Date Format
//     let labelSelectXAxisFormat = document.createElement("label");
//     labelSelectXAxisFormat.for = "XAxisFormat";
//     labelSelectXAxisFormat.innerHTML = "X Axis Date Format";
//     let selectXAxisFormat = document.createElement("select");
//     selectXAxisFormat.id = "XAxisFormat";
//     selectXAxisFormat.name = "plotFields";
//     selectXAxisFormat.addEventListener('change', function() {
//         logFormFieldBarValues();
//     });

//     const dateFormats =["YYYY", "YYYY-MM-DD"];

//     dateFormats.forEach((dateFormat) => {
//         let selectXAxisFormatOption = document.createElement("option");
//         selectXAxisFormatOption.value = dateFormat;
//         selectXAxisFormatOption.innerHTML = dateFormat; 
//         selectXAxisFormat.appendChild(selectXAxisFormatOption);
//     });
//     fieldValueBarSaved = fillFormFieldBarValues(selectXAxisFormat.id, interactive_arguments);
//     if (fieldValueBarSaved != undefined){
//         selectXAxisFormat.value = fieldValueBarSaved;
//     }

//     newRow = document.createElement("div");
//     newRow.classList.add("row", "fieldPadding");
//     newColumn1 = document.createElement("div");
//     newColumn1.classList.add("col-3");   
//     newColumn2 = document.createElement("div");
//     newColumn2.classList.add("col");

//     newColumn1.appendChild(labelSelectXAxisFormat);
//     newColumn2.appendChild(selectXAxisFormat);
//     newRow.append(newColumn1, newColumn2);
//     newDiv.append(newRow);     

//     targetElement.appendChild(newDiv);

//     // Run display bar fields
//     displayLineFields(14, jsonBarColumns, interactive_arguments); //set the number of bars here
//     }


//     // generate the form fields needed for users to indicate preferences for how a figure should appear 
//     function displayLineFields (numLines, jsonBarColumns, interactive_arguments) {
//     let assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
//     // If the element exists
//     if (assignColumnsToPlot) {
//         // Remove the scene window
//         assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
//     }

//     if (numLines > 0) {
        
//         let newDiv = document.createElement("div");
//         newDiv.id = "assignColumnsToPlot";

//         let fieldLabels = [["XAxis", "X Axis Column"]];
//         for (let i = 1; i <= numLines; i++){
//             fieldLabels.push(["Line" + i, "Line " + i + " Column"]);
//         }
    

//         fieldLabels.forEach((fieldLabel) => {
//             //Select the data source from dropdown menu  
//             let labelSelectColumn = document.createElement("label");
//             //labelSelectColumn.for = fieldLabel[0];
//             //labelSelectColumn.innerHTML = fieldLabel[1];
//             let selectColumn = document.createElement("select");


//             let newRow = document.createElement("div");
//             newRow.classList.add("row", "fieldPadding");

//             if (fieldLabel[0] != "XAxis"){      
//                 fieldLabelNumber = parseInt(fieldLabel[0].slice(-1));
//                 if (fieldLabelNumber % 2 != 0 ){
//                     newRow.classList.add("row", "fieldBackgroundColor");
//                 }
//             }

//             let newColumn1 = document.createElement("div");
//             newColumn1.classList.add("col-3");   
//             let newColumn2 = document.createElement("div");
//             newColumn2.classList.add("col");

//             //newColumn1.appendChild(labelSelectColumn);
//             //newColumn2.appendChild(selectColumn);
//             newRow.append(newColumn1, newColumn2);
//             newDiv.append(newRow);

            
//             // Add bar label and color fields, bar type, marker type, and marker size
//             if (fieldLabel[0] != "XAxis"){
//                 // Add bar label field
//                 newRow = document.createElement("div");
//                 newRow.classList.add("row", "fieldPadding");

//                 if (fieldLabelNumber % 2 != 0 ){
//                     newRow.classList.add("row", "fieldBackgroundColor");
//                 }


//                 // Add color field
//                 newRow = document.createElement("div");
//                 newRow.classList.add("row", "fieldPadding");
//                 if (fieldLabelNumber % 2 != 0 ){
//                     newRow.classList.add("row", "fieldBackgroundColor");
//                 }
//                 newColumn1 = document.createElement("div");
//                 newColumn1.classList.add("col-3");   
//                 newColumn2 = document.createElement("div");
//                 newColumn2.classList.add("col");

//                 let labelInputColor = document.createElement("label");
//                 labelInputColor.for = fieldLabel[0] + "Color";
//                 labelInputColor.innerHTML = fieldLabel[1] + " Color";
//                 let inputColor = document.createElement("input");
//                 inputColor.id = fieldLabel[0] + "Color";
//                 inputColor.name = "plotFields";
//                 inputColor.type = "color";
//                 fieldValueBarSaved = fillFormFieldBarValues(inputColor.id, interactive_arguments);
//                 if (fieldValueBarSaved != undefined){
//                     inputColor.value = fieldValueBarSaved;
//                 }
//                 inputColor.addEventListener('change', function() {
//                     logFormFieldBarValues();
//                 });

//                 newColumn1.appendChild(labelInputColor);
//                 newColumn2.appendChild(inputColor);
//                 newRow.append(newColumn1, newColumn2);
//                 newDiv.append(newRow);

//                 // Add barType type dropdown
//                 const barTypeRow = document.createElement('div');
//                 barTypeRow.classList.add('row', 'fieldPadding');
//                 if (fieldLabelNumber % 2 != 0) barTypeRow.classList.add('fieldBackgroundColor');

//                 const barTypeCol1 = document.createElement('div');
//                 barTypeCol1.classList.add('col-3');
//                 const barTypeCol2 = document.createElement('div');
//                 barTypeCol2.classList.add('col');

//                 const barTypeLabel = document.createElement('label');
//                 barTypeLabel.textContent = fieldLabel[1] + ' Line Type';
//                 barTypeLabel.htmlFor = fieldLabel[0] + 'LineType';
//                 const barTypeSelect = document.createElement('select');
//                 barTypeSelect.id = fieldLabel[0] + 'LineType';
//                 barTypeSelect.name = 'plotFields';

//                 //bar types
//                 ["solid", "dash", "dot", "dashdot", "longdash", "longdashdot"].forEach(type => {
//                 const opt = document.createElement('option');
//                 opt.value = type;
//                 opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
//                 barTypeSelect.appendChild(opt);
//                 });

//                 const barTypeSaved = fillFormFieldBarValues(barTypeSelect.id, interactive_arguments);
//                 if (barTypeSaved) barTypeSelect.value = barTypeSaved;

//                 barTypeSelect.addEventListener('change', logFormFieldBarValues);
//                 barTypeCol1.appendChild(barTypeLabel);
//                 barTypeCol2.appendChild(barTypeSelect);
//                 barTypeRow.append(barTypeCol1, barTypeCol2);
//                 newDiv.append(barTypeRow);

//                 // Add marker type dropdown
//                 const markerRow = document.createElement('div');
//                 markerRow.classList.add('row', 'fieldPadding');
//                 if (fieldLabelNumber % 2 != 0) markerRow.classList.add('fieldBackgroundColor');

//                 const markerCol1 = document.createElement('div');
//                 markerCol1.classList.add('col-3');
//                 const markerCol2 = document.createElement('div');
//                 markerCol2.classList.add('col');

//                 const markerLabel = document.createElement('label');
//                 markerLabel.textContent = fieldLabel[1] + ' Marker Type';
//                 markerLabel.htmlFor = fieldLabel[0] + 'MarkerType';
//                 const markerSelect = document.createElement('select');
//                 markerSelect.id = fieldLabel[0] + 'MarkerType';
//                 markerSelect.name = 'plotFields';

//                 ["circle", "square", "diamond", "x", "triangle-up", "triangle-down", "pentagon", "hexagon", "star", "hourglass", "bowtie", "cross"].forEach(type => {
//                     const opt = document.createElement('option');
//                     opt.value = type;
//                     opt.innerHTML = type.charAt(0).toUpperCase() + type.slice(1);
//                     markerSelect.appendChild(opt);
//                 });

//                 const markerSaved = fillFormFieldBarValues(markerSelect.id, interactive_arguments);
//                 if (markerSaved) markerSelect.value = markerSaved;

//                 markerSelect.addEventListener('change', logFormFieldBarValues);
//                 markerCol1.appendChild(markerLabel);
//                 markerCol2.appendChild(markerSelect);
//                 markerRow.append(markerCol1, markerCol2);
//                 newDiv.append(markerRow);


//                 // Add markerSize type dropdown
//                 const markerSizeRow = document.createElement('div');
//                 markerSizeRow.classList.add('row', 'fieldPadding');
//                 if (fieldLabelNumber % 2 != 0) markerSizeRow.classList.add('fieldBackgroundColor');

//                 const markerSizeCol1 = document.createElement('div');
//                 markerSizeCol1.classList.add('col-3');
//                 const markerSizeCol2 = document.createElement('div');
//                 markerSizeCol2.classList.add('col');

//                 const markerSizeLabel = document.createElement('label');
//                 markerSizeLabel.textContent = fieldLabel[1] + ' Marker Size';
//                 markerSizeLabel.htmlFor = fieldLabel[0] + 'MarkerSize';
//                 const markerSizeSelect = document.createElement('select');
//                 markerSizeSelect.id = fieldLabel[0] + 'MarkerSize';
//                 markerSizeSelect.name = 'plotFields';

//                 // Sizes 1 through 20
//                 [0, 1, 2, 3, 4, 6, 8, 10, 12, 14, 16, 18, 20].forEach(size => {
//                 const opt = document.createElement('option');
//                 opt.value = size;
//                 opt.innerHTML = size + ' px';
//                 markerSizeSelect.appendChild(opt);
//                 });

//                 const markerSizeSaved = fillFormFieldBarValues(markerSizeSelect.id, interactive_arguments);
//                 if (markerSizeSaved) markerSizeSelect.value = markerSizeSaved;

//                 markerSizeSelect.addEventListener('change', logFormFieldBarValues);
//                 markerSizeCol1.appendChild(markerSizeLabel);
//                 markerSizeCol2.appendChild(markerSizeSelect);
//                 markerSizeRow.append(markerSizeCol1, markerSizeCol2);
//                 newDiv.append(markerSizeRow);


//                 //Add checkboxes for error bars, standard deviation, mean, and percentiles
//                 const features = ["Legend", "StdDev", "ErrorBars"];
//                 const featureNames = ["Add Line to Legend", "+-1 Std Dev Fill ", "Symmetric Error Bars"];
//                 for (let i = 0; i < features.length; i++) {
//                     const feature = features[i];
//                     const featureName = featureNames[i];

//                     let newRow = document.createElement("div");
//                     newRow.classList.add("row", "fieldPadding");
//                     if (fieldLabelNumber % 2 != 0) {
//                         newRow.classList.add("row", "fieldBackgroundColor");
//                     }

//                     let newColumn1 = document.createElement("div");
//                     newColumn1.classList.add("col-3");
//                     let newColumn2 = document.createElement("div");
//                     newColumn2.classList.add("col");

//                     let label = document.createElement("label");
//                     label.for = fieldLabel[0] + feature;
//                     label.innerHTML = `${featureName}`;
//                     let checkbox = document.createElement("input");
//                     checkbox.type = "checkbox";
//                     checkbox.id = fieldLabel[0] + feature;
//                     checkbox.name = "plotFields";

//                     let fieldValueBarSaved = fillFormFieldBarValues(checkbox.id, interactive_arguments);
//                     checkbox.value = fieldValueBarSaved === 'on' ? 'on' : "";
//                     checkbox.checked = fieldValueBarSaved === 'on';

//                     newColumn1.appendChild(label);
//                     newColumn2.appendChild(checkbox);
//                     newRow.append(newColumn1, newColumn2);
//                     newDiv.append(newRow);
                    

//                     // === Add dropdowns for feature-specific data ===
//                     if (["Mean", "ErrorBars", "StdDev"].includes(feature)) {
//                         const dropdownContainer = document.createElement("div");
//                         dropdownContainer.classList.add("row", "fieldPadding");
//                         if (fieldLabelNumber % 2 != 0) {
//                             dropdownContainer.classList.add("row", "fieldBackgroundColor");
//                         }

//                         const dropdownLabelCol = document.createElement("div");
//                         dropdownLabelCol.classList.add("col-3");
//                         const dropdownInputCol = document.createElement("div");
//                         dropdownInputCol.classList.add("col");

//                         function createDropdown(labelText, selectId) {
//                             const label = document.createElement("label");
//                             label.innerHTML = labelText;
//                             const select = document.createElement("select");
//                             select.id = selectId;
//                             select.name = "plotFields";

//                             if (feature === "Mean" || feature === "ErrorBars" || feature === "StdDev") {
//                                 const autoOpt = document.createElement("option");

//                                 if (feature != "ErrorBars") {
//                                     autoOpt.value = "auto";
//                                     autoOpt.innerHTML = "Auto Calculate Based on Line Column Selection";
//                                     select.appendChild(autoOpt);
//                                 }
//                                 if (feature === "ErrorBars") {
//                                     autoOpt.value = "auto";
//                                     autoOpt.innerHTML = "Example Error Bars";
//                                     select.appendChild(autoOpt);
//                                 }

//                             for (let col of Object.values(jsonBarColumns)) {
//                                 const opt = document.createElement("option");
//                                 opt.value = col;
//                                 opt.innerHTML = col;
//                                 select.appendChild(opt);
//                             }

//                             const saved = fillFormFieldBarValues(select.id, interactive_arguments);
//                             if (saved) select.value = saved;

//                             select.addEventListener("change", logFormFieldBarValues);
//                             return { label, select };
//                             }

//                         }

//                         function createColorfield(labelText, inputId) {
//                             const label = document.createElement("label");
//                             label.textContent = labelText;
//                             label.htmlFor = inputId; // Link label to input

//                             const input = document.createElement("input"); // Correct element
//                             input.type = "color";
//                             input.id = inputId;
//                             input.name = "plotFields";

//                             const saved = fillFormFieldBarValues(input.id, interactive_arguments);
//                             if (saved) input.value = saved;

//                             input.addEventListener("change", logFormFieldBarValues);
//                             return { label, input };
//                         }

//                         const controls = [];

//                         // if (feature === "Mean") {
//                         //     const { label, select } = createDropdown("Mean Source Column", fieldLabel[0] + feature + "Field");
//                         //     controls.push(label, select);
//                         // }

//                         if (feature === "ErrorBars" || feature === "StdDev") {
//                             //const { label: labelValues, select: selectValues } = createDropdown(`${featureName} Input Column Values`, fieldLabel[0] + feature + "InputValues");
//                             const { label: labelColor, input: ColorValue } = createColorfield(`Color`, fieldLabel[0] + feature + "Color");
//                             controls.push(labelColor, document.createElement('br'), ColorValue);
//                         }             

//                         // Initially hide the dropdown container
//                         dropdownContainer.style.display = checkbox.checked ? "flex" : "none";

//                         controls.forEach(control => dropdownInputCol.appendChild(control));
//                         dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
//                         newDiv.append(dropdownContainer);

//                         // Toggle visibility dynamically
//                         checkbox.addEventListener('change', function () {
//                             checkbox.value = checkbox.checked ? 'on' : "";
//                             dropdownContainer.style.display = checkbox.checked ? "flex" : "none";
//                             logFormFieldBarValues();
//                         });
//                     } else {
//                         checkbox.addEventListener('change', function () {
//                             checkbox.value = checkbox.checked ? 'on' : "";
//                             logFormFieldBarValues();
//                         });
//                     }
//                 }
                
//             }
            

//             const targetElement = document.getElementById('graphGUI');
//             targetElement.appendChild(newDiv);

//             let newHR = document.createElement("hr");
//             newHR.style = "margin-top:15px";
//             newDiv.append(newHR);    
//         }); 
//     }
//     }

// // ====== Boot: run loadBarJson with targetContainer = #barDefaultSelector ======
// function startLoadBarJson() {
//     const target = document.getElementById('barDefaultSelector');
//     if (!target) return;

//     // If your other helpers are loaded asynchronously, delay slightly:
//     // setTimeout(() => loadBarJson(target), 50);
//     loadBarJson(target);
// }

// if (document.readyState === 'loading') {
//     document.addEventListener('DOMContentLoaded', startLoadBarJson);
// } else {
//     //startLoadBarJson();
// }
