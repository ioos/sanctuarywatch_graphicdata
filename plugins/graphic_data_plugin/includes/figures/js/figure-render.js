
/**
 * Renders interactive plots (e.g., Plotly graphs) within a specified tab content element.
 * Handles dynamic loading, resizing for mobile, and tab switching behavior.
 *
 * @async
 * @function render_interactive_plots
 * @param {HTMLElement} tabContentElement - The DOM element representing the tab content where the plot will be rendered.
 * @param {Object} info_obj - An object containing information about the plot to be rendered.
 * @param {number} info_obj.postID - The unique identifier for the post associated with the plot.
 * @param {string} info_obj.figureType - The type of figure to render (e.g., "Interactive").
 * @param {string} info_obj.figureTitle - The title of the figure.
 * @param {string} info_obj.figure_interactive_arguments - A JSON string containing arguments for rendering the interactive figure.
 *
 * @throws {Error} Throws an error if required DOM elements are not found within the specified timeout.
 *
 * @description
 * This function dynamically renders interactive plots using Plotly. It includes:
 * - Polling for required DOM elements before rendering.
 * - Adjusting layout for mobile devices.
 * - Handling tab switching events to resize plots appropriately.
 * - Supporting multiple graph types, such as "Plotly line graph (time series)" and "Plotly bar graph".
 *
 * @example
 * const tabContentElement = document.getElementById('tab-content');
 * const info_obj = {
 *   postID: 123,
 *   figureType: "Interactive",
 *   figureTitle: "Sample Plot",
 *   figure_interactive_arguments: JSON.stringify({ graphType: "Plotly line graph (time series)" })
 * };
 * await render_interactive_plots(tabContentElement, info_obj);
 */
async function render_interactive_plots(tabContentElement, info_obj) {

    //Lets control if the figure is published or not
    let figure_published = info_obj['figure_published'];
    if (figure_published != "published"){
        if (window.location.href.includes('post.php')) {
            figure_published = "published";
        } else {
            return; // do not render if the figure is not published
        }
    }

    let postID = info_obj["postID"];
    let figureType = info_obj["figureType"];
    let title = info_obj['figureTitle'];
    let targetId = `javascript_figure_target_${postID}`;
    let plotlyDivID = `plotlyFigure${postID}`;
    let interactive_arguments = info_obj["figure_interactive_arguments"];
    //console.log('interactive_arguments', interactive_arguments);


    //Preview error message in admin
    if (window.location.href.includes('post.php') && figureType === 'Interactive') {
        errorPreviewHandler(tabContentElement, figureType);
    }

    async function waitForElementByIdPolling(id, timeout = 15000, interval = 100) {
        const start = Date.now();
        return new Promise((resolve, reject) => {
            (function poll() {
                const element = document.getElementById(id);
                if (element) return resolve(element);
                if (Date.now() - start >= timeout) return reject(new Error(`Element with id ${id} not found after ${timeout}ms`));
                setTimeout(poll, interval);
            })();
        });
    }

    // Additional mobile-specific adjustments
    function adjustPlotlyLayoutForMobile(postID) {
        if (window.innerWidth <= 768) {  // basic mobile width check
            const plotlyDivID = `plotlyFigure${postID}`;
            const plotDiv = document.getElementById(plotlyDivID);
            if (plotDiv) {
                plotDiv.style.maxWidth = "100%";
                plotDiv.style.height = "400px"; // Force a good height for mobile
                plotDiv.style.width = "100%";
                Plotly.Plots.resize(plotDiv);
            }
        }
    }
    
    switch (figureType) {
        case "Interactive":

        const figure_arguments = Object.fromEntries(JSON.parse(interactive_arguments));
        const graphType = figure_arguments["graphType"];

            if (graphType === "Plotly line graph (time series)") {

                async function waitForPlotlyDiv(plotlyDivID, retries = 150, interval = 300) {
                    for (let i = 0; i < retries; i++) {
                        const el = document.getElementById(plotlyDivID);
                        if (el) return el;
                        await new Promise(resolve => setTimeout(resolve, interval));
                        await producePlotlyLineFigure(targetId, interactive_arguments, postID);
                    }
                    throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
                }

                try {

                    await waitForElementByIdPolling(targetId, 15000);
                    await producePlotlyLineFigure(targetId, interactive_arguments, postID);
                    await waitForPlotlyDiv(plotlyDivID);
                    adjustPlotlyLayoutForMobile(postID);
                    console.log('RIP - PLOT1', postID);
                    

                    // Manually trigger for initially active tab
                    // if (tabContentElement.classList.contains("active")) {
                    //     if (!document.getElementById(plotlyDivID)) {
                    //         try {
                    //             await producePlotlyLineFigure(targetId, interactive_arguments, postID);
                    //             await waitForPlotlyDiv(plotlyDivID);
                    //             adjustPlotlyLayoutForMobile(postID);
                    //             //console.log('RIP - PLOT2', postID);
                    //         } catch (err) {
                    //             console.error(`Initial active tab Plotly error (${postID}):`, err);
                    //         }
                    //     }
                    // }

                    // Manually trigger for initially active tab
                    const activeTab = document.querySelector('.tab-pane.active');
                    if (activeTab && activeTab.id === tabContentElement.id) {
                        if (!document.getElementById(plotlyDivID)) {
                            await producePlotlyLineFigure(targetId, interactive_arguments, postID);
                            await waitForPlotlyDiv(plotlyDivID);
                            adjustPlotlyLayoutForMobile(postID);
                            console.log('RIP - PLOT2', postID);
                        }
                    }

                    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
                        tab.addEventListener('shown.bs.tab', () => {
                            const plotDiv = document.getElementById(plotlyDivID);
                            if (plotDiv) {
                                setTimeout(() => {
                                    Plotly.Plots.resize(plotDiv);
                                    //console.log("Bootstrap event triggered resize:", plotlyDivID);
                                }, 150);
                            }
                        });
                    });            

                } catch (err) {
                    console.error("Plotly interactive plot error:", err);
                }
            }

            if (graphType === "Plotly bar graph") {

                 async function waitForPlotlyDiv(plotlyDivID, retries = 150, interval = 300) {
                    for (let i = 0; i < retries; i++) {
                        const el = document.getElementById(plotlyDivID);
                        if (el) return el;
                        await new Promise(resolve => setTimeout(resolve, interval));
                        await producePlotlyBarFigure(targetId, interactive_arguments, postID);
                    }
                    throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
                }

                try {

                    await waitForElementByIdPolling(targetId, 15000);
                    await producePlotlyBarFigure(targetId, interactive_arguments, postID);
                    await waitForPlotlyDiv(plotlyDivID);
                    adjustPlotlyLayoutForMobile(postID);
                    //console.log('RIP - PLOT1', postID);
                    
                    // // Manually trigger for initially active tab
                    // if (tabContentElement.classList.contains("active")) {
                    //     if (!document.getElementById(plotlyDivID)) {
                    //         try {
                    //             await producePlotlyBarFigure(targetId, interactive_arguments, postID);
                    //             await waitForPlotlyDiv(plotlyDivID);
                    //             adjustPlotlyLayoutForMobile(postID);
                    //             //console.log('RIP - PLOT2', postID);
                    //         } catch (err) {
                    //             console.error(`Initial active tab Plotly error (${postID}):`, err);
                    //         }
                    //     }
                    // }

                    // Manually trigger for initially active tab
                    const activeTab = document.querySelector('.tab-pane.active');
                    if (activeTab && activeTab.id === tabContentElement.id) {
                        if (!document.getElementById(plotlyDivID)) {
                            await producePlotlyBarFigure(targetId, interactive_arguments, postID);
                            await waitForPlotlyDiv(plotlyDivID);
                            adjustPlotlyLayoutForMobile(postID);
                            console.log('RIP - PLOT2', postID);
                        }
                    }

                    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
                        tab.addEventListener('shown.bs.tab', () => {
                            const plotDiv = document.getElementById(plotlyDivID);
                            if (plotDiv) {
                                setTimeout(() => {
                                    Plotly.Plots.resize(plotDiv);
                                    //console.log("Bootstrap event triggered resize:", plotlyDivID);
                                }, 150);
                            }
                        });
                    });            

                } catch (err) {
                    console.error("Plotly interactive plot error:", err);
                }
            }


            if (graphType === "Plotly map") {

                 async function waitForPlotlyDiv(plotlyDivID, retries = 150, interval = 300) {
                    for (let i = 0; i < retries; i++) {
                        const el = document.getElementById(plotlyDivID);
                        if (el) return el;
                        await new Promise(resolve => setTimeout(resolve, interval));
                        await producePlotlyMap(targetId, interactive_arguments, postID);
                    }
                    throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
                }

                try {

                    await waitForElementByIdPolling(targetId, 15000);
                    await producePlotlyMap(targetId, interactive_arguments, postID);
                    await waitForPlotlyDiv(plotlyDivID);
                    adjustPlotlyLayoutForMobile(postID);
                    //console.log('RIP - PLOT1', postID);
                    
                    // // Manually trigger for initially active tab
                    // if (tabContentElement.classList.contains("active")) {
                    //     if (!document.getElementById(plotlyDivID)) {
                    //         try {
                    //             await producePlotlyBarFigure(targetId, interactive_arguments, postID);
                    //             await waitForPlotlyDiv(plotlyDivID);
                    //             adjustPlotlyLayoutForMobile(postID);
                    //             //console.log('RIP - PLOT2', postID);
                    //         } catch (err) {
                    //             console.error(`Initial active tab Plotly error (${postID}):`, err);
                    //         }
                    //     }
                    // }

                    // Manually trigger for initially active tab
                    const activeTab = document.querySelector('.tab-pane.active');
                    if (activeTab && activeTab.id === tabContentElement.id) {
                        if (!document.getElementById(plotlyDivID)) {
                            await producePlotlyBarFigure(targetId, interactive_arguments, postID);
                            await waitForPlotlyDiv(plotlyDivID);
                            adjustPlotlyLayoutForMobile(postID);
                            console.log('RIP - PLOT2', postID);
                        }
                    }

                    document.querySelectorAll('button[data-bs-toggle="tab"]').forEach(tab => {
                        tab.addEventListener('shown.bs.tab', () => {
                            const plotDiv = document.getElementById(plotlyDivID);
                            if (plotDiv) {
                                setTimeout(() => {
                                    Plotly.Plots.resize(plotDiv);
                                    //console.log("Bootstrap event triggered resize:", plotlyDivID);
                                }, 150);
                            }
                        });
                    });            

                } catch (err) {
                    console.error("Plotly interactive plot error:", err);
                }
            }
            
            //Google Tags
            if (!window.location.href.includes('post.php')) {
                figureTimeseriesGraphLoaded(title, postID, gaMeasurementID);
            }

        break;
    }
}



/**
 * Renders tab content into the provided container element based on the information passed in the `info_obj` object. 
 * This function creates a styled layout that includes links, an image with a caption, and an expandable details section.
 * 
 * @param {HTMLElement} tabContentElement - The HTML element where the content for the tab will be inserted.
 * @param {HTMLElement} tabContentContainer - The container element that holds the tab content and allows appending the tab content element.
 * @param {Object} info_obj - An object containing information used to populate the tab content.
 *     @property {string} scienceLink - URL for the "More Science" link.
 *     @property {string} scienceText - Text displayed for the "More Science" link. This text is prepended with a clipboard icon.
 *     @property {string} dataLink - URL for the "More Data" link.
 *     @property {string} code - HTML or JS code for embedding.
 *     @property {string} dataText - Text displayed for the "More Data" link. This text is prepended with a database icon.
 *     @property {string} imageLink - URL of the image to be displayed in the figure section.
 *     @property {string} shortCaption - Short description that serves as the image caption.
 *     @property {string} longCaption - Detailed text that is revealed when the user clicks on the expandable 'Click for Details' section.
 * @returns {void} Modifies dom
 * Function Workflow:
 * 1. A container `div` element is created with custom styling, including background color, padding, and border-radius.
 * 2. Inside this container, a `table-row`-like structure is created using `div` elements that display two links:
 *      a. A "More Science" link on the left, prepended with a clipboard icon.
 *      b. A "More Data" link on the right, prepended with a database icon.
 * 3. The function appends the container to `tabContentElement` only if both the science link text and data link exist.
 * 4. An image with a caption is added to `tabContentElement`, using the URL and caption provided in `info_obj`.
 * 5. A `details` element is created, which reveals more information (the long caption) when the user clicks the 'Click for Details' summary.
 * 6. The function appends the entire tab content (container with links, figure with image, caption, and details) to `tabContentContainer`.
 *
 * Styling and Layout:
 * - The function uses a `table-row` and `table-cell` approach for laying out the links side by side.
 * - Links are decorated with icons, styled to remove the underline, and open in a new tab.
 * - The image is styled to be responsive (100% width) and centered within the figure.
 * - The `details` element is collapsible, providing a clean way to show the long caption when needed.
 *
 * Usage:
 * This function is called for each tab, populating one or more figures (and other corresponding info)
 */
async function render_tab_info(tabContentElement, tabContentContainer, info_obj, idx){

    console.log('tabContentElement', tabContentElement);

    //Lets control if the figure is published or not
    let figure_published = info_obj["figure_published"];
    if (figure_published != "published"){
        if (window.location.href.includes('post.php')) {
            figure_published = "published";
        } else {
            return; // do not render if the figure is not published
        }
    }

    let postID = info_obj["postID"];
    let title = info_obj['figureTitle'];

    // Create the table row div
    const tableRowDiv = document.createElement(`div`);
    tableRowDiv.style.display = 'table-row';

    //Create a separator to make this figure distinct from others
    const separator = document.createElement('div');
    separator.classList.add("separator");
    separator.innerHTML = '<hr style="border-bottom: 1px rgb(252, 252, 252);">';
    tableRowDiv.appendChild(separator);

    //CONSTRUCT THE MAIN DIV "FIGURE" WHERE THE CONTENT WILL GO
    //const figureDiv = document.createElement('div');
    const figureDiv = tableRowDiv;
    figureDiv.classList.add('figure');

    //Container for more science and data links
    const containerDiv = document.createElement(`div`);
    containerDiv.style.background = '#e3e3e354';
    containerDiv.style.width = '100%';
    containerDiv.style.display = 'table';
    containerDiv.style.fontSize = '120%';
    containerDiv.style.padding = '10px';
    containerDiv.style.marginBottom = '15px';
    containerDiv.style.marginTop = '15px';
    containerDiv.style.margin = '0 auto'; 
    containerDiv.style.borderRadius = '6px 6px 6px 6px'; 
    containerDiv.style.borderWidth = '1px'; 
    containerDiv.style.borderColor = 'lightgrey'; 


    // Create the left cell div
    const leftCellDiv = document.createElement('div');
    leftCellDiv.style.textAlign = 'left';
    leftCellDiv.style.display = 'table-cell';

    // More Science Link Here
    const firstLink = document.createElement('a');
    firstLink.href = info_obj['scienceLink'];
    firstLink.target = '_blank';
    if (info_obj['scienceText']!=''){
        firstLink.appendChild(document.createTextNode(info_obj['scienceText']));
        let icon1 = `<i class="fa fa-clipboard-list" role="presentation" aria-label="clipboard-list icon" style=""></i> `;
        firstLink.innerHTML = icon1 + firstLink.innerHTML;
        firstLink.style.textDecoration = 'none';
        firstLink.classList.add('gray-bar-links');
        leftCellDiv.appendChild(firstLink);
    }

    // Create the right cell div
    const rightCellDiv = document.createElement('div');
    rightCellDiv.style.textAlign = 'right';
    rightCellDiv.style.display = 'table-cell';

    // Create the second link
    if (info_obj['dataLink']!=''){
        const secondLink = document.createElement('a');
        secondLink.href = info_obj['dataLink'];
        secondLink.target = '_blank';
        secondLink.classList.add('gray-bar-links');
        let icon2 = `<i class="fa fa-database" role="presentation" aria-label="database icon"></i>`;
        secondLink.appendChild(document.createTextNode(info_obj['dataText']));
        secondLink.innerHTML = icon2 + `  ` + secondLink.innerHTML;
        secondLink.style.textDecoration = 'none';
        rightCellDiv.appendChild(secondLink);
    }

    if (info_obj['dataLink']!='' || info_obj['scienceText']!=''){
        containerDiv.appendChild(leftCellDiv);
        containerDiv.appendChild(rightCellDiv);
        figureDiv.appendChild(containerDiv);
    }



    //CREATE THE FIGURE TITLE
    const figureTitle = document.createElement("div");
    figureTitle.classList.add('figureTitle');
    figureTitle.innerHTML = info_obj['figureTitle'];
    figureTitle.style.marginBottom = '2px';
    figureTitle.style.marginTop = '15px';
    figureTitle.style.textAlign = 'center';
    figureDiv.appendChild(figureTitle);


    //CREATE THE FIGURE
    let img;
    let figureType = info_obj["figureType"];

    switch (figureType) {
        case "Internal":           
            img = document.createElement(`img`);
            img.id = `img_${postID}`;
            img.src = info_obj['imageLink'];

            if (info_obj['externalAlt']){
                img.alt = info_obj['externalAlt'];
            } else {
                const protocol = window.location.protocol; // Get the current protocol (e.g., http or https)
                const host = window.location.host;// Get the current host (e.g., domain name)
                const restURL = protocol + "//" + host  + "/wp-json/graphics_data/v1/media/alt-text-by-url?image_url=" + encodeURI(img.src); 
                console.log(restURL);
                fetch(restURL)                
                .then(response => response.json())
                .then(data => {
                    const imgAltText = data["alt_text"];
                    if (imgAltText){            
                        img.alt = imgAltText;
                    }

                })
                // Log any errors that occur during the fetch process
                .catch((err) => {console.error(err)});
            }
            if (img.id  === `img_${postID}`) {
                await figureDiv.appendChild(img);

                //Error in admin preview for handling for missing image
                if (window.location.href.includes('post.php')) {
                    if (img.src.includes('post.php')) {
                        errorPreviewHandler(tabContentElement, figureType);
                    } 
                }
            } else
            window.dataLayer = window.dataLayer || [];

            //Google Tags
            if (!window.location.href.includes('post.php')) {
                figureInternalImageLoaded(title, postID, gaMeasurementID);
            }
        break;

        case "External":
            img = document.createElement('img');
            img.id = `img_${postID}`;
            img.src = info_obj['imageLink'];

            if (info_obj['externalAlt']){
                img.alt = info_obj['externalAlt'];
            } else {
                img.alt = '';
            }
            if (img.id  === `img_${postID}`) {
                await figureDiv.appendChild(img);

                //Error in admin preview for handling for missing image
                if (window.location.href.includes('post.php')) {
                    if (img.src.includes('post.php')) {
                        errorPreviewHandler(tabContentElement, figureType);
                    } 
                }
                
            } else {}

            //Google Tags
            if (!window.location.href.includes('post.php')) {
                figureExternalImageLoaded(title, postID, gaMeasurementID);
            }
        break;

        case "Interactive":
            // Create a div for the interactive figure, the rest will be handled by the render_interactive_plots function
            img = document.createElement('div');
            img.id = `javascript_figure_target_${postID}`;
            await figureDiv.appendChild(img);           
        break;

        case "Code":
            img = '';
            // Create a new div to display the embed code
            const codeDiv = document.createElement("div");
            codeDiv.id = "code_display_window";
            codeDiv.style.width = "100%";
            codeDiv.style.minHeight = "300px";
            codeDiv.style.padding = "10px";
            codeDiv.style.backgroundColor = "#ffffff";
            codeDiv.style.overflow = "auto";
            // Center the content using Flexbox
            codeDiv.style.display = "flex";
            codeDiv.style.justifyContent = "center"; // Centers horizontally
            codeDiv.style.alignItems = "center"; // Centers vertically (if height is greater than content)

            
            //Append the codeDiv to the figureDiv
            await figureDiv.appendChild(codeDiv);
            embedCode = info_obj['code'];

            //Error in admin preview for handling for missing image
            if (!embedCode || embedCode === ''){
                if (window.location.href.includes('post.php')) {
                    errorPreviewHandler(tabContentElement, figureType);
                }
            }

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
            // Inject remaining HTML into the codeDiv
            codeDiv.innerHTML = tempDiv.innerHTML;

            //Google Tags
            if (!window.location.href.includes('post.php')) {
                figureCodeDisplayLoaded(title, postID, gaMeasurementID);
            }
        break;

    }
   
    //ATTRIBUTES FOR THE FIGURE DIV
    figureDiv.style.justifyContent = "center"; // Center horizontally
    figureDiv.style.alignItems = "center";
    figureDiv.setAttribute("style", "width: 100% !important; height: auto; display: block; margin: 0; margin-top: 2%");
    
  
    //CREATE PARAGRAPH ELEMENT UNDER "myTabContent" > div class="figure"
    const caption = document.createElement('p');
    caption.classList.add('caption');
    caption.innerHTML = info_obj['shortCaption'];
    caption.style.marginTop = '10px';
    figureDiv.appendChild(caption);
    tabContentElement.appendChild(figureDiv);


    // Add "Go to Top" link
    const goToTopLink = document.createElement('a');
    goToTopLink.href = "#";
    goToTopLink.textContent = "↑ Back to Top";
    goToTopLink.style.display = "block";
    goToTopLink.style.textAlign = "right";
    goToTopLink.style.marginTop = "5px";
    goToTopLink.style.color = "#0056b3";
    goToTopLink.style.textDecoration = "none";
    goToTopLink.style.fontSize = "0.8em";
    figureDiv.appendChild(goToTopLink);  // append link to figureDiv

    goToTopLink.addEventListener('click', function (e) {
        e.preventDefault();
        document.getElementById('modal-title').scrollIntoView({ top:0, behavior: 'smooth' });
        //const modalContent = document.querySelector('.modal-title');
        //modalContent.scrollTop = 0; // or:
        //modalContent.scrollTo({ top: 0, behavior: 'smooth' });
    });

    // Create the details element
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    summary.textContent = 'Click for Details';

    let longCaption = document.createElement("p");
    longCaption.innerHTML = info_obj['longCaption'];
    if (info_obj['longCaption'] != ''){
        details.appendChild(summary);
        details.appendChild(longCaption);
        tabContentElement.appendChild(details);

    }
    
    // Add the details element to the tab content element
    tabContentContainer.appendChild(tabContentElement);

    //Google Tags registration for figure science and data links
    if (info_obj['scienceText']!=''){
        if (!window.location.href.includes('post.php')) {
            setupFigureScienceLinkTracking(postID);
        }
    }
    if (info_obj['dataLink']!=''){
        if (!window.location.href.includes('post.php')) {
            setupFigureDataLinkTracking(postID);
        }

    }
    //Finish the containers and give them the correct properties.
    switch (figureType) {
        case "Internal":
                img.setAttribute("style", "width: 100% !important; height: auto; display: block; margin: 0; margin-top: 2%");
            break;
        case "External":
                img.setAttribute("style", "width: 100% !important; height: auto; display: block; margin: 0; margin-top: 2%");
            break;
        case "Interactive":
                img.setAttribute("style", "width: 100% !important; height: auto; display: flex; margin: 0; margin-top: 2%");
                
                let plotDiv = document.querySelector(`#plotlyFigure${postID}`);
                try {
                    plotDiv.style.width = "100%";
                } catch {};
            break;
        // case "Code":
        //         img.setAttribute("style", "width: 100% !important; height: auto; display: flex; margin: 0; margin-top: 2%");
        //      break;
    }

}
