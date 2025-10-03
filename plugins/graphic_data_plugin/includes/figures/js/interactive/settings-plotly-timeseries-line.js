
// ---- globals used across your helpers
let jsonColumns = {};
let fieldValueSaved;

const interactive_line_arguments_value = document.getElementById("interactive_line_arguments_editor").value


//Hide the Line Graph (Time Series) Arguments Editor row on load
document.addEventListener("DOMContentLoaded", function() {
    const row = document.getElementById("interactive_line_arguments_editor").closest("tr");
    if (row) {
        row.style.display = "none";
    }
});

// ====== Your functions (lightly tidied/safe-guarded) ======
async function loadJson(targetContainer) {

    // Only build GUI if we actually have columns
    const lengthJsonColumns = Object.keys(jsonColumns).length;
    if (lengthJsonColumns == 0) {
        // Clear any existing GUI
        const existing = document.getElementById('graphGUI');
        if (existing && existing.parentNode) existing.parentNode.removeChild(existing);

        // Create the GUI wrapper
        const targetElement = targetContainer;
        const newDiv = document.createElement('div');
        newDiv.id = "graphGUI";
        newDiv.classList.add("container", "graphGUI");

        // Label + select
        const labelGraphType = document.createElement("label");
        labelGraphType.setAttribute("for", "graphType");
        labelGraphType.innerHTML = "Graph Type";

        const selectGraphType = document.createElement("select");
        selectGraphType.id = "graphType";
        selectGraphType.name = "plotFields";

        const optLine = new Option("Plotly line graph (time series)", "Plotly line graph (time series)");
        selectGraphType.append(optLine);


        //Pull saved interactive args (if any)
        // const iaEl = <?php echo json_encode($interactive_line_arguments_value); ?>;
        const iaEl = document.getElementById("interactive_line_arguments_value").dataset.value;
        const interactive_arguments = iaEl ? iaEl : "";

        //Restore saved selection (uses your own fill/log helpers)

        if (typeof fillFormFieldValues === "function") {
            fieldValueSaved = fillFormFieldValues(selectGraphType.id);
            if (fieldValueSaved !== undefined) selectGraphType.value = fieldValueSaved;
        }


        // Layout
        const row = document.createElement("div");
        row.classList.add("row", "fieldPadding");
        const col1 = document.createElement("div");
        col1.classList.add("col-3");
        const col2 = document.createElement("div");
        col2.classList.add("col");

        col1.appendChild(labelGraphType);
        col2.appendChild(selectGraphType);
        row.append(col1, col2);
        newDiv.append(row);

        targetElement.appendChild(newDiv);

        ////console.log('fieldValueSaved', fieldValueSaved);

        //Write button values is the fields do not have any saved values. 
        if (fieldValueSaved === undefined && interactive_arguments === "" || interactive_arguments === undefined) {
            plotlyLineParameterFields(jsonColumns, interactive_arguments);
            logFormFieldValues();
        }

        //Trigger secondaries if saved
        if (fieldValueSaved !== undefined) {
            secondaryGraphFields(interactive_arguments);
        }

    }
}


function secondaryGraphFields(interactive_arguments) {

    // Remove existing secondary fields wrapper if present
    const secondaryGraphDiv = document.getElementById('secondaryGraphFields');
    if (secondaryGraphDiv && secondaryGraphDiv.parentNode) {
        secondaryGraphDiv.parentNode.removeChild(secondaryGraphDiv);
    }
    
    clearPreviousGraphFields();
    plotlyLineParameterFields(jsonColumns, interactive_arguments);        
}

function clearPreviousGraphFields() {
    const assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
    if (assignColumnsToPlot && assignColumnsToPlot.parentNode) {
        assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
    }
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
    const allFields = document.getElementsByName("plotFields");
    let fieldValues = [];
    allFields.forEach((uniqueField) => {
        ////console.log([uniqueField.id, uniqueField.value]);
        fieldValues.push([uniqueField.id, uniqueField.value]);
    });
    document.getElementById("interactive_line_arguments_editor").value = JSON.stringify(fieldValues); 
}

/**
 * Fills in the values of form fields associated with JavaScript figure
 * parameters. It retrieves the values from the hidden
 * "figure_interactive_arguments" field and populates the corresponding
 * form fields.
 *
 * @function fillFormFieldValues
 * @param {string} elementID - The ID of the form field to fill.
 * @returns {string|undefined} The value of the form field if found, or
 *   `undefined` if the field or its value is not found.
 * @example
 * // Assuming you have the following HTML:
 * // <input type="text" name="plotFields" id="xAxisTitle" value="">
 * // <input type="hidden" name="figure_interactive_arguments" value="[['xAxisTitle', 'Date'], ['yAxisTitle', 'Value']]">
 * const xAxisTitle = fillFormFieldValues('xAxisTitle'); // xAxisTitle will be set to "Date"
 */
function fillFormFieldValues(elementID){
    // const interactiveFields = <?php echo json_encode($interactive_line_arguments_value); ?>; //only for php scripts
    try {
        const interactiveFields = document.getElementById("interactive_line_arguments_value").dataset.value;
        ////console.log('interactiveFields', interactiveFields);
        if (interactiveFields != ""  && interactiveFields != null) {
            const resultJSON = Object.fromEntries(JSON.parse(interactiveFields));
            if (resultJSON[elementID] != undefined && resultJSON[elementID] != ""){
                return resultJSON[elementID];
            }
        }
    } catch {
        const interactiveFields = document.getElementById("interactive_line_arguments_editor").value
        ////console.log('interactiveFields', interactiveFields);
        if (interactiveFields != ""  && interactiveFields != null) {
            const resultJSON = Object.fromEntries(JSON.parse(interactiveFields));
            if (resultJSON[elementID] != undefined && resultJSON[elementID] != ""){
                return resultJSON[elementID];
            }
        }
    }
    
}

function plotlyLineParameterFields(jsonColumns, interactive_arguments){

    let newDiv = document.createElement("div");
    newDiv.id = 'secondaryGraphFields';
    const targetElement = document.getElementById('graphGUI');

    let newRow;
    let newColumn1;
    let newColumn2;

    //Add checkboxes for showgrid
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
        
    }
        


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

    targetElement.appendChild(newDiv);

    // Run display line fields
    displayLineFields(14, jsonColumns, interactive_arguments); //set the number of lines here
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
    

        fieldLabels.forEach((fieldLabel) => {
            //Select the data source from dropdown menu  
            let labelSelectColumn = document.createElement("label");
            //labelSelectColumn.for = fieldLabel[0];
            //labelSelectColumn.innerHTML = fieldLabel[1];
            let selectColumn = document.createElement("select");


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

            //newColumn1.appendChild(labelSelectColumn);
            //newColumn2.appendChild(selectColumn);
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
                const features = ["Legend", "StdDev", "ErrorBars"];
                const featureNames = ["Add Line to Legend", "+-1 Std Dev Fill ", "Symmetric Error Bars"];
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
                    newColumn1.appendChild(label);

                    if (feature == "Legend") {
                        let checkbox = document.createElement("input");
                        checkbox.type = "checkbox";
                        checkbox.id = fieldLabel[0] + feature;
                        checkbox.name = "plotBarFields";

                        let fieldValueBarSaved = fillFormFieldBarValues(checkbox.id, interactive_arguments);
                        checkbox.value = fieldValueBarSaved === 'on' ? 'on' : "";
                        checkbox.checked = fieldValueBarSaved === 'on';

                        // Toggle visibility dynamically
                        checkbox.addEventListener('change', function () {
                            checkbox.value = checkbox.checked ? 'on' : "";
                            logFormFieldBarValues();
                        });
                        newColumn2.appendChild(checkbox);
                    }

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

                        // if (feature === "Mean") {
                        //     const { label, select } = createDropdown("Mean Source Column", fieldLabel[0] + feature + "Field");
                        //     controls.push(label, select);
                        // }

                        if (feature === "ErrorBars" || feature === "StdDev") {
                            //const { label: labelValues, select: selectValues } = createDropdown(`${featureName} Input Column Values`, fieldLabel[0] + feature + "InputValues");
                            const { label: labelColor, input: ColorValue } = createColorfield(`Color`, fieldLabel[0] + feature + "Color");
                            controls.push(labelColor, document.createElement('br'), ColorValue);
                        }             

                        // Initially hide the dropdown container
                        //dropdownContainer.style.display = checkbox.checked ? "flex" : "none";

                        controls.forEach(control => dropdownInputCol.appendChild(control));
                        dropdownContainer.append(dropdownLabelCol, dropdownInputCol);
                        newDiv.append(dropdownContainer);

                        // // Toggle visibility dynamically
                        // checkbox.addEventListener('change', function () {
                        //     checkbox.value = checkbox.checked ? 'on' : "";
                        //     dropdownContainer.style.display = checkbox.checked ? "flex" : "none";
                        //     logFormFieldValues();
                        // });
                    } else {
                        // checkbox.addEventListener('change', function () {
                        //     checkbox.value = checkbox.checked ? 'on' : "";
                        //     logFormFieldValues();
                        // });
                    }
                }
                
            }
            

            const targetElement = document.getElementById('graphGUI');
            targetElement.appendChild(newDiv);

            let newHR = document.createElement("hr");
            newHR.style = "margin-top:15px";
            newDiv.append(newHR);    
        }); 
    }
    }

// ====== Boot: run loadJson with targetContainer = #lineDefaultSelector ======
function startLoadJson() {
    const target = document.getElementById('lineDefaultSelector');
    if (!target) return;

    // If your other helpers are loaded asynchronously, delay slightly:
    // setTimeout(() => loadJson(target), 50);
    loadJson(target);
    
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startLoadJson);
} else {
    startLoadJson();
}
