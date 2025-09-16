// These functions only fire upon editing or creating a post of Figure custom content type

'use strict';

// the last stop in the field validation process (if needed)
replaceFieldValuesWithTransientValues();

// Makes title text red if it ends with an asterisk in "exopite-sof-title" elements. Also adds a line giving the meaning of red text at top of form.
document.addEventListener('DOMContentLoaded', redText);

run_webcr_admin_figures()

function run_webcr_admin_figures() {
    displayCorrectImageField ();
    let jsonColumns;
    let fieldLabelNumber;
    let fieldValueSaved;


    // Hide the parent element of the "figure_interactive_arguments" field
    //document.getElementsByName("figure_interactive_arguments")[0].parentElement.parentElement.style.display="none";

    /**
     * Updates the figure scene, modal, and tab options dynamically when the figure instance changes.
     * Fetches data from the REST API and populates the dropdowns accordingly.
     */
    function figureInstanceChange(){

        const protocol = window.location.protocol; // Get the current protocol (e.g., http or https)
        const host = window.location.host;// Get the current host (e.g., domain name)
        const figureInstance = document.getElementsByName("location")[0].value;
        const restScene = protocol + "//" + host  + "/wp-json/wp/v2/scene?_fields=id,title&orderby=title&order=asc&per_page=100&scene_location="+figureInstance;

        // Fetch scene data from the REST API
        fetch(restScene)
        .then(response => response.json())
        .then(data => {
            // Update the "figure_scene" dropdown with fetched scene data
            let figureScene = document.getElementsByName("figure_scene")[0];
            figureScene.value =" ";
            figureScene.innerHTML ="";
            let optionScene1 = document.createElement('option');
            optionScene1.text = " ";
            optionScene1.value = "";
            figureScene.add(optionScene1);
            
            // Populate the dropdown with scene options
            data.forEach(targetRow => {
                    let optionScene = document.createElement('option');
                    optionScene.value = targetRow['id'];
                    optionScene.text = targetRow['title']['rendered'];
                    figureScene.appendChild(optionScene);
            });

            // Reset and update the "figure_modal" dropdown
            let figureModal = document.getElementsByName("figure_modal")[0];
            figureModal.value =" ";
            figureModal.innerHTML ="";
            let optionModal = document.createElement('option');
            optionModal.text = " ";
            optionModal.value = "";
            figureModal.add(optionModal);

            // Reset and update the "figure_tab" dropdown
            let figureTab = document.getElementsByName("figure_tab")[0];
            figureTab.value =" ";
            figureTab.innerHTML ="";
            let optionTab = document.createElement('option');
            optionTab.text = " ";
            optionTab.value = "";
            figureTab.add(optionTab);
        })
        // Log any errors that occur during the fetch process
        .catch((err) => {console.error(err)});
    }

    // reset icons on scene change
    function figureSceneChange(){
        const protocol = window.location.protocol;
        const host = window.location.host;
        const figureScene = document.getElementsByName("figure_scene")[0].value;

        //FIX: the REST API for modal is retrieving all records even when icon_function and modal_scene are set for some reason 
        // CHECK - THIS IS FIXED I THINK?
        const restModal = protocol + "//" + host  + "/wp-json/wp/v2/modal?_fields=id,title,modal_scene,icon_function&orderby=title&order=asc&per_page=100";
        fetch(restModal)
        .then(response => response.json())
        .then(data => {
            let figureModal = document.getElementsByName("figure_modal")[0];
            figureModal.value =" ";
            figureModal.innerHTML ="";
            let optionIcon1 = document.createElement('option');
            optionIcon1.text = " ";
            optionIcon1.value = "";
            figureModal.add(optionIcon1);
        
            data.forEach(targetRow => {
                if (targetRow['icon_function']=="Modal" && targetRow['modal_scene']==figureScene ){

                    let optionIcon = document.createElement('option');
                    optionIcon.value = targetRow['id'];
                    optionIcon.text = targetRow['title']['rendered'];
                    figureModal.appendChild(optionIcon);
                }
            });
            let figureTab = document.getElementsByName("figure_tab")[0];
            figureTab.value =" ";
            figureTab.innerHTML ="";
            let optionTab = document.createElement('option');
            optionTab.text = " ";
            optionTab.value = "";
            figureTab.add(optionTab);
        })
        .catch((err) => {console.error(err)});
    }

    /**
     * Resets the tabs in the figure modal when the icon is changed.
     * Fetches modal data from the REST API and updates the tab options dynamically.
     */
    function figureIconChange(){
        const figureModal = document.getElementsByName("figure_modal")[0].value;      
        const protocol = window.location.protocol;
        const host = window.location.host;
        const restModal = protocol + "//" + host  + "/wp-json/wp/v2/modal/" + figureModal + "?per_page=100";

        fetch(restModal)
            .then(response => response.json())
            .then(data => {
                // Clear existing tab options
                let figureTab = document.getElementsByName("figure_tab")[0];
                figureTab.value =" ";
                figureTab.innerHTML ="";

                // Add default "Tabs" option
                let optionTab = document.createElement('option');
                optionTab.text = " ";
                optionTab.value = "";
                figureTab.add(optionTab);
            
                if (figureModal != " " && figureModal != ""){

                    let targetField ="";
                    for (let i = 1; i < 7; i++){
                        targetField = "modal_tab_title" + i;
                        if (data[targetField]!= ""){
                            let optionTitleTab = document.createElement('option');
                            optionTitleTab.text = data[targetField];
                            optionTitleTab.value = i;
                            figureTab.appendChild(optionTitleTab);
                        }
                    }
                }

            })
            .catch((err) => {console.error(err)});

    }

    /**
     * Dynamically displays the correct image field based on the selected image type.
     * Handles the visibility of fields for "Internal", "External", "Interactive", and "Code" image types.
     */
    // Should the image be an external URL or an internal URL? Show the relevant fields either way
    function displayCorrectImageField () {

        // Get the selected image type from the "figure_path" dropdown
        const imageType = document.getElementsByName("figure_path")[0].value;
    
        // Select the nested container with class "exopite-sof-field-ace_editor"
        let codeContainer= document.querySelector('.exopite-sof-field-ace_editor');

        // Select the nested container with class "exopite-sof-field-upload"
        let uploadFileContainer= document.querySelector('.exopite-sof-field-upload');

        // Select the nested container with class ".exopite-sof-btn.figure_preview"
        let figure_interactive_settings = document.querySelector('.exopite-sof-field.exopite-sof-field-button'); // Add an ID or a unique class
        
        const figure_interactive_settings2 =
        Array.from(document.querySelectorAll('.exopite-sof-field.exopite-sof-field-button'))
            .find(el => {
            const h4 = el.querySelector('h4.exopite-sof-title, .exopite-sof-title h4');
            return h4 && h4.textContent.trim().replace(/\s+/g, ' ') === 'Interactive Figure Settings';
            }) || null;
        
        // const figure_image_field = //document.querySelectorAll('.exopite-sof-field.exopite-sof-field-image')
        // Array.from(document.querySelectorAll('.exopite-sof-field.exopite-sof-field-image'))
        //     .find(el => {
        //     const h4 = el.querySelector('h4.exopite-sof-title, .exopite-sof-title h4');
        //     return h4 && h4.textContent.trim().replace(/\s+/g, ' ') === 'Figure image*';
        //     }) || null;

         // Handle the visibility of fields based on the selected image type
        switch (imageType) {
            case "Internal":
                //Show the fields we want to see
                document.getElementsByName("figure_image")[0].parentElement.parentElement.parentElement.style.display = "block";

                //Hide the fields we do not want to see
                codeContainer.style.display = "none";
                uploadFileContainer.style.display = "none";

                if (!window.location.href.includes("post-new.php")) {
                    figure_interactive_settings.style.display = "none";
                }

                document.getElementsByName("figure_external_alt")[0].parentElement.parentElement.style.display = "none";
                document.getElementsByName("figure_external_alt")[0].value = "";
                document.getElementsByName("figure_external_url")[0].parentElement.parentElement.style.display = "none";
                document.getElementsByName("figure_external_url")[0].value = "";
                break;

            case "External":

                //Show the fields we want to see
                document.getElementsByName("figure_external_alt")[0].parentElement.parentElement.style.display = "block";
                document.getElementsByName("figure_external_url")[0].parentElement.parentElement.style.display = "block";
                


                //Hide the fields we do not want to see
                codeContainer.style.display = "none";
                uploadFileContainer.style.display = "none";
                if (!window.location.href.includes("post-new.php")) {
                    figure_interactive_settings.style.display = "none";
                }
                document.getElementsByName("figure_image")[0].parentElement.parentElement.parentElement.style.display = "none";
                document.getElementsByName("figure_image")[0].value = "";
                break;               

            case "Interactive":
                //Show the fields we want to see
                codeContainer.style.display = "none";
                uploadFileContainer.style.display = "block";
                figure_interactive_settings.style.display = "block";

                //Hide the fields we do not want to see and show the fields we want to see
                document.getElementsByName("figure_external_alt")[0].parentElement.parentElement.style.display = "none";
                document.getElementsByName("figure_external_alt")[0].value = "";
                document.getElementsByName("figure_external_url")[0].parentElement.parentElement.style.display = "none";
                document.getElementsByName("figure_external_url")[0].value = "";
                
                //figure_image_field.style.display = "none";
                document.getElementsByName("figure_image")[0].parentElement.parentElement.parentElement.style.display = "none";
                document.getElementsByName("figure_image")[0].value = "";
                break;

            case "Code":
                //Show the fields we want to see
                codeContainer.style.display = "block";

                //Hide the fields we do not want to see
                uploadFileContainer.style.display = "none";
                if (!window.location.href.includes("post-new.php")) {
                    figure_interactive_settings.style.display = "none";
                }
                document.getElementsByName("figure_image")[0].parentElement.parentElement.parentElement.style.display = "none";
                document.getElementsByName("figure_external_url")[0].parentElement.parentElement.style.display = "none";
                document.getElementsByName("figure_external_alt")[0].parentElement.parentElement.style.display = "none";

                //figure_image_field.style.display = "none";
                // document.getElementsByName("figure_image")[0].parentElement.parentElement.parentElement.style.display = "none";
                // document.getElementsByName("figure_image")[0].value = "";
                break;
        } 
    }
    // Add event listeners to dynamically update fields based on user interactions
    document.getElementsByName("figure_path")[0].addEventListener('change', displayCorrectImageField);
    document.getElementsByName("figure_modal")[0].addEventListener('change', figureIconChange);
    document.getElementsByName("figure_scene")[0].addEventListener('change', figureSceneChange);
    document.getElementsByName("location")[0].addEventListener('change', figureInstanceChange);

    // Load the interactive figure settings if an uploaded file exists
    checkIfFileExistsAndLoadJson();


    /**
     * Checks if an uploaded file exists and loads its JSON content.
     * Handles the removal of existing interactive settings and dynamically updates the UI
     * based on the presence of the uploaded file.
     */
    async function checkIfFileExistsAndLoadJson() {
        try {
            // Remove the existing "Interactive Settings" button if it exists
            let button = document.querySelector(".exopite-sof-btn.figure_interactive_settings");
            if (button) {
                button.remove();
            } 

            // Construct the REST API URL to fetch the uploaded file path
            let rootURL = window.location.origin;
            const figureID = document.getElementsByName("post_ID")[0].value;
            const figureRestCall = `${rootURL}/wp-json/wp/v2/figure/${figureID}?_fields=uploaded_path_json`;
            
            // Fetch the uploaded file path from the REST API
            //const response = await fetch(figureRestCall);
            const response = await fetch(figureRestCall, {
                headers: {
                    'X-WP-Nonce': wpApiSettings.nonce
                }
            });

            if (response.ok) {
                const data = await response.json();
                const uploaded_path_json = data.uploaded_path_json;

                // Find the target div inside "exopite-sof-field-button"
                let targetContainer = document.querySelector(".exopite-sof-field.exopite-sof-field-button .exopite-sof-fieldset");

                // Check if the post meta variable exists (assuming it's in the "meta" field)
                if (uploaded_path_json != "") {

                    if (targetContainer) {
                        // Call the loadJson function and populate its contents inside the div
                        loadJson(targetContainer); // Call function with meta value
                    }
                }

                // If no uploaded file path exists, remove the container and display a message
                if (uploaded_path_json == "") {
                    let divContainer = document.querySelector(".exopite-sof-field.exopite-sof-field-button");
                    if (divContainer) {
                        divContainer.remove();
                    } 
                    //targetContainer.innerHTML = "Please upload a valid 'Interactive Figure File' and click  the 'Update' button in the top right of the page to access this feature.";
                }
            } else {
                // If the response is not OK, log an error message
                const uploaded_path_json = "";
            }   
        } catch (error) {     
            // Log any errors that occur during the fetch or processing  
            console.error("Error fetching post meta:", error.message);
        }
    }

    /**
     * Loads JSON data from the uploaded file and dynamically updates the UI.
     * Handles metadata extraction, graph configuration, and UI updates based on the JSON content.
     * 
     * @param {HTMLElement} targetContainer - The container element where the graph configuration UI will be appended.
     */
    async function loadJson(targetContainer) {
        const postPageType = window.location.href.includes("post-new.php")

        if (!postPageType) {

            try {
                const rootURL = window.location.origin;
                // REST API call to get the uploaded JSON file path
                const figureID = document.getElementsByName("post_ID")[0].value;
                const figureRestCall = `${rootURL}/wp-json/wp/v2/figure/${figureID}?_fields=uploaded_path_json`;
                const response = await fetch(figureRestCall);
                
                if (response.ok) {
                    const data = await response.json();
                    const uploaded_path_json = data.uploaded_path_json;
                    const restOfURL = "/wp-content" + uploaded_path_json.split("wp-content")[1];

                    // Check if the uploaded file path is empty and alert the user
                    if (uploaded_path_json == ""){
                        alert("Please upload a file before creating a graph");
                        console.error('Error loading JSON:', error);
                    }

                    const finalURL = rootURL + restOfURL;
                    try {
                        // Fetch the actual JSON file using the constructed URL
                        const response = await fetch(finalURL);
                        if (!response.ok) {
                            throw new Error('Network response was not ok');
                        }
                        const data = await response.json();


                        // Convert metadata keys into an array of key-value pairs for display
                        let metadataRows = [];
                        if (data.metadata && Object.keys(data.metadata).length > 0) {
                            metadataRows = Object.keys(data.metadata).map((key) => ({
                                key: key,
                                value: data.metadata[key],
                            }));
                        }


                        // Initialize jsonColumns to read .geojson ot regular .json files
                        if (!uploaded_path_json.includes(".geojson")) {
                            // Map data columns into an object with index-based keys
                            jsonColumns = Object.fromEntries(
                                Object.keys(data.data).map((key, index) => [index, key])); 
                                jsonColumns
                        }
                        if (uploaded_path_json.includes(".geojson")) {

                            function extractJsonColumnsFromGeojson(geojson) {
                                if (!geojson || !geojson.features || geojson.features.length === 0) return {};

                                const props = geojson.features[0].properties;
                                return Object.fromEntries(
                                    Object.keys(props).map((key, index) => [index, key])
                                );
                            }

                            jsonColumns = extractJsonColumnsFromGeojson(data);

                        }
                        
                        
                        // Check the number of columns in the JSON data
                        const lengthJsonColumns = (Object.entries(jsonColumns).length);
                        if (lengthJsonColumns > 1){
                            // Remove the existing graph GUI if it exists
                            var graphGUI = document.getElementById('graphGUI');
                            if (graphGUI) {
                                // Remove the scene window
                                graphGUI.parentNode.removeChild(graphGUI);
                            }

                            // Create a new container for the graph GUI
                            const targetElement = targetContainer
                            let newDiv = document.createElement('div');
                            newDiv.id = "graphGUI";
                            newDiv.classList.add("container", "graphGUI");

                            // If metadata exists, display it in a floating box
                            displayMetadataBox(metadataRows, newDiv);

                            // Create a label and dropdown for selecting the graph type
                            let labelGraphType = document.createElement("label");
                            labelGraphType.for = "graphType";
                            labelGraphType.innerHTML = "Graph Type";
                            let selectGraphType = document.createElement("select");
                            selectGraphType.id = "graphType";
                            selectGraphType.name = "plotFields";

                            // Add options to the dropdown for different graph types
                            let graphType1 = document.createElement("option");
                            graphType1.value = "None";
                            graphType1.innerHTML = "None";
                            let graphType2 = document.createElement("option");
                            graphType2.value = "Plotly bar graph";
                            graphType2.innerHTML = "Plotly bar graph";
                            let graphType3 = document.createElement("option");
                            graphType3.value = "Plotly line graph (time series)";
                            graphType3.innerHTML = "Plotly line graph (time series)";
                            // let graphType4 = document.createElement("option");
                            // graphType4.value = "Plotly map";
                            // graphType4.innerHTML = "Plotly map"; 
                            selectGraphType.appendChild(graphType1);
                            selectGraphType.appendChild(graphType2);    
                            selectGraphType.appendChild(graphType3);
                            // selectGraphType.appendChild(graphType4);  

                            
                            //Admin is able to call to the interactive_arguments using document.getElementsByName("figure_interactive_arguments")[0].value;
                            //interactive_arguments is for the theme side, it is blank here because it is a place holder variable
                            let interactive_arguments = document.getElementsByName("figure_interactive_arguments")[0].value;
                            fieldValueSaved = fillFormFieldValues(selectGraphType.id);

                            // Add event listeners to handle changes in the dropdown selection
                            if (fieldValueSaved != undefined){
                                selectGraphType.value = fieldValueSaved;
                            }
                            selectGraphType.addEventListener('change', function() {
                                secondaryGraphFields(this.value, interactive_arguments);
                            });
                            selectGraphType.addEventListener('change', function() {
                                logFormFieldValues();
                            });

                            // Create a new row and columns for the dropdown and label
                            let newRow = document.createElement("div");
                            newRow.classList.add("row", "fieldPadding");
                            let newColumn1 = document.createElement("div");
                            newColumn1.classList.add("col-3");   
                            let newColumn2 = document.createElement("div");
                            newColumn2.classList.add("col");

                            // Append the label and dropdown to the columns
                            newColumn1.appendChild(labelGraphType);
                            newColumn2.appendChild(selectGraphType);
                            newRow.append(newColumn1, newColumn2);
                            newDiv.append(newRow);

                            // Append the row to the new graph GUI container
                            targetElement.appendChild(newDiv);

                            // Trigger secondary graph fields if a saved value exists
                            if (fieldValueSaved != undefined){
                                secondaryGraphFields(selectGraphType.value, interactive_arguments);
                            }
                        }
                    } catch (error) {
                        // Log any errors that occur during the JSON loading process
                        console.error('Error loading JSON:', error);
                        targetContainer.innerHTML = "The file formatting is incorrect. Please fix the error and reupload your file.";

                    }
                }
            } catch (error) {
                console.log('Error fetching uploaded file path:', error);
            }
        }
    }





    /**
     * Displays metadata in a formatted box within the provided container.
     * Converts metadata key-value pairs into readable text and appends it to the container.
     * 
     * @param {Array} metadataRows - An array of objects containing metadata key-value pairs.
     * @param {HTMLElement} newDiv - The container element where the metadata will be displayed.
     */
    function displayMetadataBox(metadataRows, newDiv) {
        // Convert metadata object to readable text with both key and value
        let metadataText = "Current Metadata:<br><br>";
        
         // Check if metadata rows exist
        if (metadataRows.length >= 1) {
            // Iterate over each metadata row and format it as key-value pairs
            metadataRows.forEach((row) => {
                // Remove any commas from the metadata value for cleaner display
                let cleanedValue = row.value.replace(/,/g, "");
                metadataText += `<span style="font-size: 13px;">${row.key}: ${cleanedValue}</span><br>`;
            });
        } else {
            // Display a message if no metadata is found
            metadataText += `<span style="font-size: 13px;">No metadata found.</span><br>`;
        }
    
        // Add a light grey horizontal line at the bottom after all metadata rows
        metadataText += `<br><hr style="border: 0.5px solid lightgrey; margin-top: 8px;">`;
        // Insert the formatted metadata text into the existing div
        newDiv.innerHTML = metadataText; 
        // Ensure it's visible
        newDiv.style.display = "block";
    }
    

    /**
     * Dynamically creates or clears parameter fields based on the selected graph type.
     * Handles the removal of existing fields and updates the UI with new fields as needed.
     * 
     * @param {string} graphType - The type of graph selected by the user (e.g., "None", "Plotly bar graph", "Plotly line graph (time series)").
     * @param {string} interactive_arguments - A string containing saved interactive arguments for pre-filling fields.
     */
    function secondaryGraphFields(graphType, interactive_arguments){

        // Get the container for secondary graph fields
        var secondaryGraphDiv = document.getElementById('secondaryGraphFields');
        // If the element exists
        if (secondaryGraphDiv) {
            // Remove the scene window
            secondaryGraphDiv.parentNode.removeChild(secondaryGraphDiv);
        }

        // Handle different graph types and update the UI accordingly
        switch(graphType){
            case "None":
                // Clear any previously created graph fields
                clearPreviousGraphFields();
                break;
            case "Plotly map":
                // Clear any previously created graph fields
                clearPreviousGraphFields();
                plotlyMapParameterFields(jsonColumns, interactive_arguments);
                break;
            case "Plotly bar graph":
                // Clear any previously created graph fields
                clearPreviousGraphFields();
                plotlyBarParameterFields(jsonColumns, interactive_arguments);
                break;
            case "Plotly line graph (time series)":
                // Clear previous fields and create new fields specific to line graphs
                clearPreviousGraphFields();
                plotlyLineParameterFields(jsonColumns, interactive_arguments);
                break;
        }
    }

    /**
     * Clears out any previously created form fields used for indicating figure preferences.
     * Removes the container element for assigning columns to plots if it exists.
     */
    function clearPreviousGraphFields (){
        let assignColumnsToPlot = document.getElementById('assignColumnsToPlot');
        // If the element exists
        if (assignColumnsToPlot) {
            // Remove the scene window
            assignColumnsToPlot.parentNode.removeChild(assignColumnsToPlot);
        }
    }

    /**
     * Displays the embed code in a preview box below the preview button.
     * Handles the removal of existing preview windows, parsing of embed code, and injection of scripts and HTML.
     * 
     * @param {HTMLElement} previewCodeButton - The button element that triggers the preview display.
     */
    function displayCode (previewCodeButton) {
        // Remove existing preview div if present
        let previewWindow = document.getElementById("code_preview_window");
        if (previewWindow) {
            previewWindow.parentNode.removeChild(previewWindow);
        }
    
        // Create a new div to display the embed code
        const previewDiv = document.createElement("div");
        previewDiv.id = "code_preview_window";
        previewDiv.style.width = "100%";
        previewDiv.style.minHeight = "300px";
        previewDiv.style.padding = "10px";
        previewDiv.style.backgroundColor = "#ffffff";
        previewDiv.style.overflow = "auto";
        // Center the content using Flexbox
        previewDiv.style.display = "flex";
        previewDiv.style.justifyContent = "center"; // Centers horizontally
        previewDiv.style.alignItems = "center"; // Centers vertically (if height is greater than content)
    
        // Get the embed code from the figure_code field
        const embedCode = document.getElementsByName("figure_code")[0]?.value || "No code available. Set the 'Figure Type' to 'Code' and paste your code into the HTML/JavaScript Code Code text area.";
    
        try {
            // Parse the embed code and extract <script> tags
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = embedCode;
    
            // Move <script> tags to the head and inject the rest into the preview div
            const scripts = tempDiv.querySelectorAll("script");
            scripts.forEach((script) => {
                const newScript = document.createElement("script");
                newScript.type = script.type || "text/javascript";
                if (script.src) {
                    newScript.src = script.src; // External script
                } else {
                    newScript.textContent = script.textContent; // Inline script
                }
                document.head.appendChild(newScript); // Add to <head>
                script.remove(); // Remove the script tag from tempDiv
            });
    
            // Inject remaining HTML into the preview div
            previewDiv.innerHTML = tempDiv.innerHTML;
    
            // Append the preview div below the button
            //document.querySelector('[data-depend-id="figure_preview"]').insertAdjacentElement("afterend", previewDiv);
            document.querySelector('.figureTitle').insertAdjacentElement("afterend", previewDiv);
            
    
        } catch (error) {
            // Handle errors during embed code injection
            console.error("Failed to inject embed code:", error);
            previewDiv.textContent = "Failed to load embed code. Please check your input.";
            //document.querySelector('[data-depend-id="figure_preview"]').insertAdjacentElement("afterend", previewDiv);
            document.querySelector('.figureTitle').insertAdjacentElement("afterend", previewDiv);
        }
    }


    //FIGURE PREVIEW BUTTON 
    /**
    * Handles the functionality of the "Figure Preview" button.
    * Dynamically generates a preview window displaying the figure title, image, captions, and additional links.
    * Supports different figure types such as "Internal", "External", "Interactive", and "Code".
    */
    document.querySelector('[data-depend-id="figure_preview"]').addEventListener('click', function() {


        // try {
        //         var codePreviewWindow = document.getElementById('code_preview_window');
        //         // If the element exists
        //         if (codePreviewWindow) {
        //             // Remove the scene window
        //             codePreviewWindow.parentNode.removeChild(codePreviewWindow);
        //         }
        // } catch {}

        // Let's remove the preview window if it already exists
        try {
            var previewWindow = document.getElementById('preview_window');
            // If the element exists
            if (previewWindow) {
                // Remove the scene window
                previewWindow.parentNode.removeChild(previewWindow);
            }
        } catch {}


        // Find element
        const firstFigurePreview = document.querySelector('.figure_preview');

        // Find the second parent element
        const secondParent = firstFigurePreview.parentElement.parentElement;

        // Create a new div element
        let newDiv = document.createElement('div');
        newDiv.id = "preview_window";
        newDiv.classList.add("container", "figure_preview");

        
        // Add science and data URLs if available
        const scienceUrl = document.getElementsByName("figure_science_info[figure_science_link_url]")[0].value;
        const dataUrl = document.getElementsByName("figure_data_info[figure_data_link_url]")[0].value;

        if (scienceUrl !="" || dataUrl != ""){
            let firstRow = document.createElement("div");
            firstRow.classList.add("grayFigureRow");

            if (scienceUrl !=""){
                let scienceA = document.createElement("a");
                scienceA.classList.add("grayFigureRowLinks");
                scienceA.href = document.getElementsByName("figure_science_info[figure_science_link_url]")[0].value;
                scienceA.target="_blank";
                let dataIcon = document.createElement("i");
                dataIcon.classList.add("fa-solid", "fa-clipboard-list", "grayFigureRowIcon");
                let urlText = document.createElement("span");
                urlText.classList.add("grayFigureRowText");
                urlText.innerHTML = document.getElementsByName("figure_science_info[figure_science_link_text]")[0].value;
                scienceA.appendChild(dataIcon);
                scienceA.appendChild(urlText);
                firstRow.appendChild(scienceA);
            // firstRow.appendChild(urlText);
            }

            if (dataUrl !=""){
                let dataA = document.createElement("a");
                dataA.classList.add("grayFigureRowLinks");//, "grayFigureRowRightLink");
                dataA.href = document.getElementsByName("figure_data_info[figure_data_link_url]")[0].value;
                dataA.target="_blank";
                let dataIcon = document.createElement("i");
                dataIcon.classList.add("fa-solid", "fa-database", "grayFigureRowIcon");
                let urlText = document.createElement("span");
                urlText.classList.add("grayFigureRowText");
                urlText.innerHTML = document.getElementsByName("figure_data_info[figure_data_link_text]")[0].value;
                dataA.appendChild(dataIcon);
                dataA.appendChild(urlText);
                firstRow.appendChild(dataA);
            // firstRow.appendChild(urlText);
            }

            newDiv.appendChild(firstRow);
        } 

        //Figure title options
        const figure_title = document.getElementsByName("figure_title")[0].value;
        let figureTitle = document.createElement("div");
        figureTitle.innerHTML = figure_title;
        figureTitle.classList.add("figureTitle");
        newDiv.appendChild(figureTitle); //Append the figure title

        // Add the figure image or interactive/code preview
        let imageRow = document.createElement("div");
        imageRow.classList.add("imageRow");
        let figureImage = document.createElement("img");
        figureImage.classList.add("figureImage");

        const figurePath = document.getElementsByName("figure_path")[0].value;
        let figureSrc;

        let interactiveImage = false;
        switch(figurePath){
            case "Internal":
                figureSrc = document.getElementsByName("figure_image")[0].value;
                if (figureSrc != ""){
                    figureImage.src = figureSrc;
                } else {
                    imageRow.textContent = "No figure image."}
                break;
            case "External":
                figureSrc = document.getElementsByName("figure_external_url")[0].value;
                if (figureSrc != ""){
                    figureImage.src = figureSrc;
                } else {
                    imageRow.textContent = "No figure image."}
                break;         
            case "Interactive":
                const figureID = document.getElementsByName("post_ID")[0].value;
                imageRow.id = `javascript_figure_target_${figureID}`
                interactiveImage = true;
                break;
            case "Code":
                imageRow.id = "code_preview_window"
                break;
        }
        
        const containerWidth = document.querySelector('[data-depend-id="figure_preview"]').parentElement.parentElement.parentElement.clientWidth;

        if (containerWidth < 800){
            figureImage.style.width = (containerWidth-88) + "px";
        }

        imageRow.appendChild(figureImage);
        newDiv.appendChild(imageRow);

        // Add the figure captions
        let captionRow = document.createElement("div");
        captionRow.classList.add("captionRow");

        // Get the short caption
        let shortCaption = document.getElementById('figure_caption_short').value;  
     
        // Get the long caption
        let longCaption = document.getElementById('figure_caption_long').value;  
        let shortCaptionElementContent = document.createElement("p");
        shortCaptionElementContent.innerHTML = shortCaption;
        shortCaptionElementContent.classList.add("captionOptions");
        captionRow.appendChild(shortCaptionElementContent);
        let longCaptionElement = document.createElement("details");
        let longCaptionElementSummary = document.createElement("summary");

        longCaptionElementSummary.textContent = "Click here for more details.";
        let longCaptionElementContent = document.createElement("p");
        longCaptionElementContent.classList.add("captionOptions");
        longCaptionElementContent.innerHTML = longCaption;
        longCaptionElement.appendChild(longCaptionElementSummary);
        longCaptionElement.appendChild(longCaptionElementContent);
        captionRow.appendChild(longCaptionElement);
        newDiv.appendChild(captionRow);

        // Append the preview window to the parent container
        secondParent.appendChild(newDiv);

        //For code and interactive figures, these are when the physical code that create the figures is launched
        if (interactiveImage == true){
            try {
                //Admin is able to call to the interactive_arguments using document.getElementsByName("figure_interactive_arguments")[0].value;
                //interactive_arguments is for the theme side, it is blank here because it is a place holder variable
                let interactive_arguments = document.getElementsByName("figure_interactive_arguments")[0].value;
                const figureID = document.getElementsByName("post_ID")[0].value;
                const figure_arguments = Object.fromEntries(JSON.parse(interactive_arguments));
                const graphType = figure_arguments["graphType"];

                if (graphType === "Plotly bar graph") {
                    producePlotlyBarFigure(`javascript_figure_target_${figureID}`, interactive_arguments, null);
                }
                if (graphType === "Plotly map") {
                    //console.log(`javascript_figure_target_${figureID}`);
                    producePlotlyMap(`javascript_figure_target_${figureID}`, interactive_arguments, null);
                }
                if (graphType === "Plotly line graph (time series)") {
                    producePlotlyLineFigure(`javascript_figure_target_${figureID}`, interactive_arguments, null);
                }

            } catch (error) {
                alert('Please upload a a valid file before generating a graph.')
            }
        }
        if (figurePath == 'Code') {
            displayCode();        
        }
    });
};

// Ensure that only plain text is pasted into the Trumbowyg editors ( figure_caption_short and figure_caption_long)
document.addEventListener('DOMContentLoaded', function() {

    // Define the specific Trumbowyg editor IDs for the 'figure' post type
    const figureEditorIds = ['figure_caption_short', 'figure_caption_long'];

    // Ensure the utility function exists before calling it
    if (typeof attachPlainTextPasteHandlers === 'function') {
        // Attempt to attach handlers immediately after DOM is ready
        if (!attachPlainTextPasteHandlers(figureEditorIds)) {
            console.log('Figure Plain Text Paste: Trumbowyg editors not immediately found, setting timeout...');
            // Retry after a delay if editors weren't found (Trumbowyg might initialize later)
            setTimeout(() => attachPlainTextPasteHandlers(figureEditorIds), 1000); // Adjust timeout if needed (e.g., 500, 1500)
        }
    } else {
        console.error('Figure Plain Text Paste: attachPlainTextPasteHandlers function not found. Ensure utility.js is loaded correctly.');
    }

});


