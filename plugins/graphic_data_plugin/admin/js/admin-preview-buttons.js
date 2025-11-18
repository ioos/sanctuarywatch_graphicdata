


//PREVIEW BUTTON LOGIC FOR MODALS AND FIGURES



/**
 * Handles the click event for the modal preview button, generating a live preview of the modal.
 *
 * - Removes any existing preview window.
 * - Gathers info and photo entries to display as accordions if present.
 * - Displays the tagline and tab navigation if configured.
 * - Appends the constructed preview to the DOM.
 *
 * @modifies
 * - The DOM by removing and creating the modal preview window.
 */
document.querySelectorAll('[data-depend-id="modal_preview"], [data-depend-id="figure_preview"]').forEach(el => {
    el.addEventListener('click', function() {

        // Prevent duplicate injection, remove existing to make way for new. 
        if (document.getElementById('myModal') || document.getElementById('mobileModal')) {
            //console.log('Modals already exist — showing modal.');
            const modalEl = document.getElementById('myModal');
            const mobileModal = document.getElementById('mobileModal');
            if (modalEl) modalEl.remove();
            if (mobileModal) mobileModal.remove();
        }

        // --- INJECT MODAL HTML MARKUP to wpcontent---
        const markup = `
            <body>
                <!-- for the mobile image stuff -->
                <div class="modal" id="mobileModal" style="z-index: 9999; background-color: rgba(0,0,0,0.8);">
                <div class="modal-dialog modal-lg" style="z-index: 9999;margin-top: 5%; max-width: 95%;">
                    <div class="modal-content">
                    <div class="modal-header">
                        <h4 id="modal-title1" class="modal-title"> Full Scene Image</h4>
                        <button id="close1" type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>
                    <div class="modal-body"></div>
                    </div>
                </div>
                </div>

                <div class="modal" id="myModal" style="z-index: 9999; background-color: rgba(0,0,0,0.8);">
                <div class="modal-dialog modal-lg" style="z-index: 9999; margin: 5% auto;">
                    <div class="modal-content" aria-labelledby="modal-title">
                    <div class="modal-header">
                        <h4 id="modal-title" class="modal-title"></h4>
                        <button id="close" type="button" class="btn-close" data-bs-dismiss="modal"></button>
                    </div>

                    <div class="modal-body">
                        <div class="row">
                        <div id="tagline-container"></div>
                        <div id="accordion-container"></div>
                        </div>
                    </div>

                    <ul class="nav nav-tabs" id="myTab" role="tablist" style="margin-left: 1%;"></ul>
                    <div class="tab-content" id="myTabContent" style="margin-top: 2%; margin-left: 2%; margin-right: 2%;"></div>
                    </div>
                </div>
                </div>
            </body>`;

        const wpcontent = document.getElementById('wpwrap');
        if (!wpcontent) {
            console.warn('#wpwrap not found.');
            return;
        }

        // Inject as the first child of #wpcontent
        wpcontent.insertAdjacentHTML('afterbegin', markup);
        //console.log('✅ Modals injected into #wpcontent');

        // Wait for DOM update, then show the modal (Bootstrap 5 API)
        setTimeout(() => {
            const modalEl = document.getElementById('myModal');
            if (modalEl && typeof bootstrap !== 'undefined') {
            const modalInstance = new bootstrap.Modal(modalEl);
            modalInstance.show();
            } else {
            console.warn('Bootstrap not found — modal injected but not activated.');
            }
        }, 100);

        const hasModalPreview = document.querySelectorAll('[data-depend-id="modal_preview"]');
        const hasFigurePreview = document.querySelectorAll('[data-depend-id="figure_preview"]');

        //console.log('hasModalPreview:', hasModalPreview);
        //console.log('hasFigurePreview:', hasFigurePreview);

        // --- GATHER MODAL DATA FROM FORM FIELDS ---
        if (hasModalPreview !== null && hasModalPreview.length > 0) {
            // --- ICON + TITLE ---
            let iconSelected = document.getElementsByName('modal_icons')[0]?.value || 'no_icon_selected';
            let modalTitle = document.getElementById("title").value || '';
            let modalTagline = document.getElementsByName('modal_tagline')[0]?.value || '';
            let modalTabNumber = Number(document.getElementsByName("modal_tab_number")[0]?.value || 0);

            //console.log('iconSelected:', iconSelected);
            //console.log('modalTitle:', modalTitle);
            //console.log('modalTagline:', modalTagline);
            //console.log('modalTabNumber:', modalTabNumber);

            // --- COUNT INFO + PHOTO ENTRIES ---
            let modal_info_entries = 0;
            let modal_photo_entries = 0;
            let modal_info_elements = [];
            let modal_photo_elements = [];

            for (let i = 1; i < 7; i++) {
                let photo_text = document.getElementsByName(`modal_photo${i}[modal_photo_text${i}]`)[0]?.value || '';
                let photo_url = document.getElementsByName(`modal_photo${i}[modal_photo_url${i}]`)[0]?.value || '';
                let info_text = document.getElementsByName(`modal_info${i}[modal_info_text${i}]`)[0]?.value || '';
                let info_url = document.getElementsByName(`modal_info${i}[modal_info_url${i}]`)[0]?.value || '';

                if (photo_text !== '' || photo_url !== '') {
                    modal_photo_entries++;
                    modal_photo_elements.push(i);
                }
                if (info_text !== '' || info_url !== '') {
                    modal_info_entries++;
                    modal_info_elements.push(i);
                }
            }

            // --- BUILD STRUCTURED OBJECT ---
            let modal_data = {
                id: 0, // you can fill in dynamically later
                slug: modalTitle.toLowerCase().replace(/\s+/g, '-'),
                type: 'modal',
                title: { rendered: modalTitle },
                modal_tagline: modalTagline,
                modal_info_entries: modal_info_entries,
                modal_photo_entries: modal_photo_entries,
                modal_tab_number: modalTabNumber,
                icon_function: "Modal",
                modal_icon_order: "1",
                icon_toc_section: "1",
                modal_published: "published",
                modal_scene: "",
                class_list: [],
                _links: {}
            };

            // --- ADD INFO + PHOTO OBJECTS ---
            for (let i = 1; i <= 6; i++) {
                let info_text = document.getElementsByName(`modal_info${i}[modal_info_text${i}]`)[0]?.value || '';
                let info_url = document.getElementsByName(`modal_info${i}[modal_info_url${i}]`)[0]?.value || '';
                modal_data[`modal_info${i}`] = {
                    [`modal_info_text${i}`]: info_text,
                    [`modal_info_url${i}`]: info_url
                };

                let photo_text = document.getElementsByName(`modal_photo${i}[modal_photo_text${i}]`)[0]?.value || '';
                let photo_url = document.getElementsByName(`modal_photo${i}[modal_photo_url${i}]`)[0]?.value || '';
                let photo_internal = document.getElementsByName(`modal_photo${i}[modal_photo_internal${i}]`)[0]?.value || '';
                let photo_loc = document.getElementsByName(`modal_photo${i}[modal_photo_location${i}]`)[0]?.value || 'External';

                modal_data[`modal_photo${i}`] = {
                    [`modal_photo_location${i}`]: photo_loc,
                    [`modal_photo_text${i}`]: photo_text,
                    [`modal_photo_url${i}`]: photo_url,
                    [`modal_photo_internal${i}`]: photo_internal
                };
            }

            // --- ADD TAB TITLES ---
            for (let i = 1; i <= modalTabNumber; i++) {
                let tab_title = document.getElementsByName(`modal_tab_title${i}`)[0]?.value || '';
                modal_data[`modal_tab_title${i}`] = tab_title;
            }

            // --- WRAP IN OUTER OBJECT USING ICON AS KEY ---
            let child_obj = {
                [iconSelected]: {
                    title: modalTitle,
                    modal: true,
                    original_name: iconSelected,
                    modal_id: 0,
                    modal_data: modal_data
                }
            };

            //console.log('modal_data', modal_data);

            render_modal(iconSelected, child_obj, modal_data);
        }

        // --- GATHER FIGURE DATA FROM FORM FIELDS ---
        if (hasFigurePreview !== null && hasFigurePreview.length > 0) {

            let iconSelected = "ExampleKey";
            let modal_data = {"id":0,"slug":"Example Modal Title","type":"modal","title":{"rendered":"Example Modal Title"},"modal_tagline":"Example Tagline","modal_info_entries":1,"modal_photo_entries":1,"modal_tab_number":1,"icon_function":"Modal","modal_icon_order":"1","icon_toc_section":"1","modal_published":"published","modal_scene":"","class_list":[],"_links":{},"modal_info1":{"modal_info_text1":"Example Information Link","modal_info_url1":""},"modal_photo1":{"modal_photo_location1":"External","modal_photo_text1":"Example Photo Link","modal_photo_url1":"","modal_photo_internal1":""},"modal_info2":{"modal_info_text2":"","modal_info_url2":""},"modal_photo2":{"modal_photo_location2":"External","modal_photo_text2":"","modal_photo_url2":"","modal_photo_internal2":""},"modal_info3":{"modal_info_text3":"","modal_info_url3":""},"modal_photo3":{"modal_photo_location3":"External","modal_photo_text3":"","modal_photo_url3":"","modal_photo_internal3":""},"modal_info4":{"modal_info_text4":"","modal_info_url4":""},"modal_photo4":{"modal_photo_location4":"External","modal_photo_text4":"","modal_photo_url4":"","modal_photo_internal4":""},"modal_info5":{"modal_info_text5":"","modal_info_url5":""},"modal_photo5":{"modal_photo_location5":"External","modal_photo_text5":"","modal_photo_url5":"","modal_photo_internal5":""},"modal_info6":{"modal_info_text6":"","modal_info_url6":""},"modal_photo6":{"modal_photo_location6":"External","modal_photo_text6":"","modal_photo_url6":"","modal_photo_internal6":""},"modal_tab_title1":"Example Modal Tab"};

            let child_obj = {
                [iconSelected]: {
                    title: "Example Modal Title",
                    modal: true,
                    original_name: "Example Modal Title",
                    modal_id: 0,
                    modal_data: modal_data
                }
            };

            //console.log('modal_data', modal_data);
            render_modal(iconSelected, child_obj, modal_data);

            
            // Find element
            const firstFigurePreview = document.getElementById('myTabContent');
                   

            // Create a new div element
            let newDiv = document.createElement('div');
            newDiv.id = "preview_window";
            newDiv.style.width = "100%";
        
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
                }

                newDiv.appendChild(firstRow);
            } 

            //Figure title options
            const figure_title = document.getElementsByName("figure_title")[0].value;
            let figureTitle = document.createElement("div");
            figureTitle.innerHTML = figure_title;
            figureTitle.classList.add("figureTitle");
            figureTitle.style.textAlign = "center";
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
            firstFigurePreview.appendChild(newDiv);

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
                        //////console.log(`javascript_figure_target_${figureID}`);
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
        

        }

    });
});

//INJECT CSS FOR THE THEME WHEN MODAL OR FIGURE PREVIEW IS CLICKED
document.querySelectorAll('[data-depend-id="modal_preview"], [data-depend-id="figure_preview"]').forEach(el => {
  el.addEventListener('click', function() {
    // Only inject CSS if not already loaded
    if (!document.getElementById('theme-css1') && !document.getElementById('theme-css2')) {
      const css1 = document.createElement('link');
      css1.id = 'theme-css1';
      css1.rel = 'stylesheet';
      css1.href = `${window.location.origin}/wp-content/themes/graphic_data_theme/assets/css/bootstrap.css`;
      document.head.appendChild(css1);

      const css2 = document.createElement('link');
      css2.id = 'theme-css2';
      css2.rel = 'stylesheet';
      css2.href = `${window.location.origin}/wp-content/themes/graphic_data_theme/style.css`;
      document.head.appendChild(css2);

      console.log('🎨 Theme CSS injected');
    } else {
      console.log('🎨 Theme CSS already loaded');
    }
  });
});


// When the modal close button is clicked, remove both CSS files
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'close') {
        const css1 = document.getElementById('theme-css1');
        const css2 = document.getElementById('theme-css2');
        if (css1) css1.remove();
        if (css2) css2.remove();
        // console.log('🧹 Theme CSS removed from head.');
    }
});


