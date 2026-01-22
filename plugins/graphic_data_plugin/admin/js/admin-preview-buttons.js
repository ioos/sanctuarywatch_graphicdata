// FIGURES Admin error handling for missing figure data in preview mode. Operates in figure-render.js
function errorPreviewHandler(divID, figureType){
    if (figureType === "Interactive"){
        //Preview error message in admin

        let fileInputElement;
        let graphTypeInputElement;
        let lineTypeInputElement;
        let barTypeInputElement;
        let existingFileInputElement;

        try {
            fileInputElement = document.getElementById('file-label').value;
        } catch {}
        try {
            existingFileInputElement = document.getElementById('existing-file-name').value;
            //console.log('existingFileInputElement:', existingFileInputElement);
        } catch {}
        try {
            graphTypeInputElement = document.getElementById('graphType').value;
        } catch {}
        try {
            lineTypeInputElement = document.getElementById('Line1').value;
         } catch {}
        try {
            barTypeInputElement = document.getElementById('Bar1').value;
        } catch {}

        if (window.location.href.includes('post.php') && (fileInputElement === '' || graphTypeInputElement === 'None') || lineTypeInputElement === 'None' || barTypeInputElement === 'None' || existingFileInputElement === '') {
            const errorMessageSummary = document.createElement("div");
            errorMessageSummary.style.textAlign = "center";
            errorMessageSummary.style.color = "red";
            errorMessageSummary.style.fontWeight = "bold";
            errorMessageSummary.style.margin = "5%";
            // Clear any previous error messages if necessary
            errorMessageSummary.textContent = "Please upload a file, choose a graph type, and make data selections to preview an interactive figure. Be sure to check all options.";

            // Avoid appending multiple error messages repeatedly
            if (!divID.contains(errorMessageSummary)) {
                divID.appendChild(errorMessageSummary);
            }
            return;
        }
    } else {
        if (window.location.href.includes('post.php')) {


            setTimeout(() => {
                const figure = document.querySelector('#myTabContent .figure');
                //.console.log("FOUND FIGURE:", figure);
                figure.remove();
            }, 50);

            const errorMessageSummary = document.createElement("div");
            errorMessageSummary.style.textAlign = "center";
            errorMessageSummary.style.color = "red";
            errorMessageSummary.style.fontWeight = "bold";
            errorMessageSummary.style.margin = "5%";
            // Clear any previous error messages if necessary
            errorMessageSummary.textContent = "Please make an image selection or input code to preview your figure.  Be sure to check all options.";
            // Avoid appending multiple error messages repeatedly
            if (!divID.contains(errorMessageSummary)) {
                divID.appendChild(errorMessageSummary);
            }
            if (figureType === "Code"){
                codeDiv = document.getElementById("code_display_window");
                codeDiv.remove();   
            }
            return;  
            
        }
    }
    return;
}




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
let previewFigureOrModalElements = document.querySelectorAll('[data-depend-id="modal_preview"], [data-depend-id="modal_preview_mobile"],[data-depend-id="figure_preview_mobile"],[data-depend-id="figure_preview"]');

if (!previewFigureOrModalElements) {
    previewFigureOrModalElements = [];
}

if (previewFigureOrModalElements.length > 0) {
    previewFigureOrModalElements.forEach(el => {
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
                            <button id="close1" type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body">
                            <div class="row">
                            <div id="tagline-container"></div>
                            <div id="accordion-container"></div>
                            </div>
                        </div>

                        <ul class="nav nav-tabs" id="myTab" role="tablist" style="margin-left: 1%;"></ul>
                        <div class="tab-content" id="myTabContent" style="margin-top: 2%; margin-left: 1%; margin-right: 1%;"></div>
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


            const modalEl2 = document.getElementById('myModal');
            const dialog2 = modalEl2?.querySelector('.modal-dialog');
            // Apply mobile preview sizing ONLY for mobile preview trigger
            if (el.getAttribute('data-depend-id') === 'modal_preview_mobile' || el.getAttribute('data-depend-id') === 'figure_preview_mobile') {
                deviceDetector.device = 'phone';
                if (dialog2) {
                    dialog2.style.minWidth = '33%';
                    dialog2.style.width = '350px';
                    dialog2.style.paddingTop = '2%'; // if you need this
                }
            } 

            //remove mobile css if present 
            if (el.getAttribute('data-depend-id') === 'modal_preview' || el.getAttribute('data-depend-id') === 'figure_preview') {
                document.getElementById('sw-modal-accordion-btn-css')?.remove();
            }

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

            const hasModalPreview = document.querySelectorAll('[data-depend-id="modal_preview"],[data-depend-id="modal_preview_mobile"]');
            const hasFigurePreview = document.querySelectorAll('[data-depend-id="figure_preview"],[data-depend-id="figure_preview_mobile"]');
            //console.log('hasModalPreview:', hasModalPreview);
            //console.log('hasFigurePreview:', hasFigurePreview);

            // --- GATHER MODAL DATA FROM FORM FIELDS AND PRODUCE A MODAL PREVIEW---
            if (hasModalPreview !== null && hasModalPreview.length > 0) {
                // --- ICON + TITLE ---
                let iconSelected = document.getElementsByName('modal_icons')[0]?.value || 'no_icon_selected';
                let modalTitle = document.getElementById("title").value || '';
                let modalTagline = document.getElementsByName('modal_tagline')[0]?.value || '';
                let modalTabNumber = Number(document.getElementsByName("modal_tab_number")[0]?.value || 0);

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

                render_modal(iconSelected, child_obj, modal_data);

                // if (el.getAttribute('data-depend-id') === 'modal_preview_mobile') {
                //     const color2 = '#ff6600'; // example
                //     const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='${color2}' d='M1.5 5.5l6 6 6-6'/></svg>`;
                //     const svgEncoded = encodeURIComponent(svg);

                //     const style = document.createElement('style');
                //     style.id = 'sw-modal-accordion-btn-css'; // optional: for easy debugging/removal
                //     style.textContent = `

                //     @media (min-width: 900px) {
                //     #accordion-container {
                //         max-width: 100% !important;  /* or unset */
                //         margin-left: 0 !important;   /* or unset */
                //         /* min-width can stay if you want */
                //     }
                //     }
                //     /* -----------------------------
                //     Accordion chevron
                //     ----------------------------- */
                //     .accordion-button::after {
                //     content: "";
                //     background-image: url("data:image/svg+xml,${svgEncoded}");
                //     background-repeat: no-repeat;
                //     background-size: 1.25rem;
                //     width: 1.25rem;
                //     height: 1.25rem;
                //     margin-left: auto;
                //     transform: rotate(0deg);
                //     transition: transform .2s ease-in-out;
                //     }
                //     .accordion-button:not(.collapsed)::after {
                //     transform: rotate(180deg);
                //     }      

                //     @media (min-width: 900px) {
                //     #accordion-container {
                //         max-width: 100%;
                //         min-width: 200px;
                //         margin-left: -15%;
                //     }
                //     }

                //     /* Stack tab "buttons" vertically */
                //     .nav-tabs {
                //     display: flex !important;
                //     flex-direction: column !important;
                //     width: 100% !important;
                //     border-bottom: 0 !important; /* optional: remove the bottom tab border line */
                //     }

                //     /* Make each tab item full width */
                //     .nav-tabs .nav-item {
                //     width: 100% !important;
                //     flex: 0 0 auto !important;
                //     }

                //     /* Make the clickable area a full-width centered button */
                //     .nav-tabs .nav-link {
                //     width: 98% !important;
                //     text-align: center !important;
                //     justify-content: center !important; /* helps if link uses flex */
                //     border-radius: 0.75rem;            /* optional */
                //     margin: 0 0 0.5rem 0;              /* spacing between "buttons" */
                //     }

                //     /* Optional: last one no extra gap */
                //     .nav-tabs .nav-item:last-child .nav-link {
                //     margin-bottom: 0;
                //     }
                //     `;

                //     document.head.appendChild(style);
                // }


            }

            // --- GATHER FIGURE DATA FROM FORM FIELDS ---
            if (hasFigurePreview !== null && hasFigurePreview.length > 0) {

                //MODAL PREVIEW LOGIC
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

                render_modal(iconSelected, child_obj, modal_data);

                // if (el.getAttribute('data-depend-id') === 'figure_preview_mobile') {
                //     const color2 = '#ff6600'; // example
                //     const svg = `<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 16 16'><path fill='${color2}' d='M1.5 5.5l6 6 6-6'/></svg>`;
                //     const svgEncoded = encodeURIComponent(svg);

                //     const style = document.createElement('style');
                //     style.id = 'sw-modal-accordion-btn-css'; // optional: for easy debugging/removal
                //     style.textContent = `

                //     @media (min-width: 900px) {
                //     #accordion-container {
                //         max-width: 100% !important;  /* or unset */
                //         margin-left: 0 !important;   /* or unset */
                //         /* min-width can stay if you want */
                //     }
                //     }
                //     /* -----------------------------
                //     Accordion chevron
                //     ----------------------------- */
                //     .accordion-button::after {
                //     content: "";
                //     background-image: url("data:image/svg+xml,${svgEncoded}");
                //     background-repeat: no-repeat;
                //     background-size: 1.25rem;
                //     width: 1.25rem;
                //     height: 1.25rem;
                //     margin-left: auto;
                //     transform: rotate(0deg);
                //     transition: transform .2s ease-in-out;
                //     }
                //     .accordion-button:not(.collapsed)::after {
                //     transform: rotate(180deg);
                //     }

                //     @media (min-width: 900px) {
                //     #accordion-container {
                //         max-width: 100%;
                //         min-width: 200px;
                //         margin-left: -15%;
                //     }
                //     }

                //     /* Stack tab "buttons" vertically */
                //     .nav-tabs {
                //     display: flex !important;
                //     flex-direction: column !important;
                //     width: 100% !important;
                //     border-bottom: 0 !important; /* optional: remove the bottom tab border line */
                //     }

                //     /* Make each tab item full width */
                //     .nav-tabs .nav-item {
                //     width: 100% !important;
                //     flex: 0 0 auto !important;
                //     }

                //     /* Make the clickable area a full-width centered button */
                //     .nav-tabs .nav-link {
                //     width: 98% !important;
                //     text-align: center !important;
                //     justify-content: center !important; /* helps if link uses flex */
                //     border-radius: 0.75rem;            /* optional */
                //     margin: 0 0 0.5rem 0;              /* spacing between "buttons" */
                //     }

                //     /* Optional: last one no extra gap */
                //     .nav-tabs .nav-item:last-child .nav-link {
                //     margin-bottom: 0;
                //     }
                //     `;
                //     document.head.appendChild(style);
                // }

                if (el.getAttribute('data-depend-id') === 'figure_preview') {
                    // Create a new style element
                    const style = document.createElement('style');

                    // Define CSS for the pseudo-element inside that style block
                    style.textContent = `
                    .accordion-button::after {
                    content: "▼";
                    font-size: 1rem;
                    width: 1.25rem;
                    height: 1.25rem;
                    margin-left: auto;
                    }
                    `;
                }

                //FIGURE PREVIEW LOGIC
                const info_obj = {
                    figure_published: document.getElementsByName("figure_published")[0]?.value,
                    postID: document.getElementsByName("post_ID")[0]?.value,

                    scienceLink: document.getElementsByName("figure_science_info[figure_science_link_url]")[0]?.value,
                    scienceText: document.getElementsByName("figure_science_info[figure_science_link_text]")[0]?.value,

                    dataLink: document.getElementsByName("figure_data_info[figure_data_link_url]")[0]?.value,
                    dataText: document.getElementsByName("figure_data_info[figure_data_link_text]")[0]?.value,

                    imageLink: (function() {
                        const type = document.getElementsByName("figure_path")[0]?.value;
                        if (type === "Internal") return document.getElementsByName("figure_image")[0]?.value;
                        if (type === "External") return document.getElementsByName("figure_external_url")[0]?.value;
                        return ""; // no image for Interactive/Code
                    })(),

                    code: document.getElementsByName("figure_code")[0]?.value,

                    externalAlt: document.getElementsByName("figure_external_alt")[0]?.value ?? "",

                    shortCaption: document.getElementById("figure_caption_short")?.value,
                    longCaption: document.getElementById("figure_caption_long")?.value,

                    figureType: document.getElementsByName("figure_path")[0]?.value,
                    figureTitle: document.getElementsByName("figure_title")[0]?.value,

                    figure_interactive_arguments: document.getElementsByName("figure_interactive_arguments")[0]?.value
                };


                const tabContentContainer = document.getElementById('myTabContent');
                const tabContentElement = document.getElementById('Example_Modal_Title-1-pane');
                const idx = 0; // Since we are only rendering one figure here, index is 0
                (async () => {
                    await render_tab_info(tabContentElement, tabContentContainer, info_obj, idx);
                    await render_interactive_plots(tabContentElement, info_obj);
                })();
            }
        });
    });
};

//INJECT CSS FOR THE THEME WHEN MODAL, or FIGURE PREVIEW IS CLICKED
if (previewFigureOrModalElements.length > 0) {
        previewFigureOrModalElements.forEach(el => {
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

                //console.log('🎨 Theme CSS injected');
                } else {
                //console.log('🎨 Theme CSS already loaded');
                }
            });
    });
};


//_________________________________________________________________________________________________________________

//LOGIC FOR SCENE PREVIEW MODE
function buildScenePayloadFromForm() {
    // Helpers
    const byIdVal = (id) => (document.getElementById(id)?.value ?? "");
    //console.log('byIdVal("title")', byIdVal("title"));
    const byNameVal = (name) => (document.getElementsByName(name)?.[0]?.value ?? "");

    const payload = {};

    // --- Top-level scene fields from your snippet ---
    payload.post_title = byIdVal("title"); // your h1 uses #title
    payload.scene_tagline = byNameVal("scene_tagline");
    payload.scene_location = byNameVal("scene_location");
    payload.scene_infographic = byNameVal("scene_infographic");
    payload.scene_hover_color = byNameVal("scene_hover_color");
    payload.scene_hover_text_color = byNameVal("scene_hover_text_color");
    payload.scene_text_toggle = byNameVal("scene_text_toggle");
    payload.scene_full_screen_button = byNameVal("scene_full_screen_button");
    payload.scene_toc_style = byNameVal("scene_toc_style");
    payload.scene_toc_style = "list";

    // --- scene_info_entries + scene_info1..6 (nested objects) ---
    let infoCount = 0;
    for (let i = 1; i < 7; i++) {
    const textName = `scene_info${i}[scene_info_text${i}]`;
    const urlName  = `scene_info${i}[scene_info_url${i}]`;

    const textVal = byNameVal(textName);
    const urlVal  = byNameVal(urlName);

    // Match your example shape exactly
    payload[`scene_info${i}`] = {
        [`scene_info_text${i}`]: textVal,
        [`scene_info_url${i}`]: urlVal
    };

    // Count "valid" entries the same way your accordion detection does
    if (textVal !== "" && urlVal !== "") infoCount++;
    }
    payload.scene_info_entries = String(infoCount);

    // --- scene_photo_entries + scene_photo1..6 (nested objects) ---
    let photoCount = 0;
    for (let i = 1; i < 7; i++) {
    const locName      = `scene_photo${i}[scene_photo_location${i}]`;
    const textName     = `scene_photo${i}[scene_photo_text${i}]`;
    const urlName      = `scene_photo${i}[scene_photo_url${i}]`;
    const internalName = `scene_photo${i}[scene_photo_internal${i}]`;

    const locVal      = byNameVal(locName) || "External"; // your example defaults to External
    const textVal     = byNameVal(textName);
    const urlVal      = byNameVal(urlName);
    const internalVal = byNameVal(internalName);

    payload[`scene_photo${i}`] = {
        [`scene_photo_location${i}`]: locVal,
        [`scene_photo_text${i}`]: textVal,
        [`scene_photo_url${i}`]: urlVal,
        [`scene_photo_internal${i}`]: internalVal
    };

    if (textVal !== "" && urlVal !== "") photoCount++;
    }
    payload.scene_photo_entries = String(photoCount);

    return payload;
}


function openSceneInModal(el) {
    
    // -- INJECT MODAL HTML MARKUP to sceneModalBody---
    let markup;
    markup = `
        <div id="entire_thing">  
        <div id="title-container" ></div>
        <div id="mobile-view-image"></div>
        <div class="container-fluid" id="scene-fluid">
        <div class="row" id="scene-row">
            <div class="col-md-10" >
            <div id="svg1" class="responsive-image-container">
                
            </div>
            </div>

            <div class="col-md-2" id="toc-container" >

                <!-- TABLE OF CONTENTS WILL GO HERE -->

            </div>
        </div>
        </div>
        </div>           
    `;

    // Inject as the first child of #wpcontent
    sceneModalBody.insertAdjacentHTML('afterbegin', markup);          
}



/**
 * Handles the click event for the "Scene preview" button, generating a live preview of the scene.
 *
 * This event listener dynamically creates a scene preview window that displays the scene title, tagline,
 * info and photo accordions, and a preview of the SVG infographic with highlighted icons. It ensures that
 * any previous preview is removed before generating a new one. The preview includes:
 * - Scene title (from the "title" field)
 * - Tagline (from the "scene_tagline" field)
 * - Accordions for info and photo links if any are present
 * - SVG infographic preview (if a valid SVG path is provided), with clickable icons highlighted using the scene's hover color
 * - A table of contents (TOC) listing the IDs of the SVG's icon layers, if present
 *
 * @event scene_preview_click
 *
 * @description
 * - Removes any existing preview window.
 * - Collects info and photo entries with both text and URL fields populated.
 * - Builds and appends accordions for info and photo links if present.
 * - Displays the tagline and scene title.
 * - Loads and displays the SVG infographic, highlights icon layers, and lists their IDs in a TOC.
 * - Handles errors in fetching or processing the SVG.
 *
 * @modifies
 * - The DOM by removing and creating the scene preview window, and by updating the SVG preview and TOC.
 *
 * @example
 * // This code is typically run on page load to enable scene preview functionality:
 * document.querySelector('[data-depend-id="scene_preview"]').addEventListener('click', ...);
 *
 * @global
 * - Assumes the existence of form fields named "title", "scene_tagline", "scene_info{n}[scene_info_text{n}]", "scene_info{n}[scene_info_url{n}]",
 *   "scene_photo{n}[scene_photo_text{n}]", "scene_photo{n}[scene_photo_url{n}]", "scene_infographic", "scene_hover_color", and "scene_location" in the DOM.
 * - Assumes the existence of the helper functions createAccordion and resizeSvg.
 * - Requires the SVG to have a group with id="icons" for icon highlighting and TOC generation.
 */
// Create scene preview from clicking on the "Scene preview button"
let previewSceneElements = document.querySelectorAll('[data-depend-id="scene_preview"], [data-depend-id="scene_preview_mobile"]');
if (!previewSceneElements) {
    previewSceneElements = [];
}
if (previewSceneElements.length > 0) {
    previewSceneElements.forEach(el => {
        el.addEventListener('click', function() {

            let markup;
             // --- INJECT MODAL HTML MARKUP to wpcontent---
            markup = `
                    <div class="modal fade" id="sceneModal" tabindex="-1">
                    <div class="modal-dialog modal-xl modal-dialog-scrollable">
                        <div class="modal-content">

                        <div class="modal-header">
                            <h5 class="modal-title1"></h5>
                            <button id="close1" type="button" class="btn-close" data-bs-dismiss="modal"></button>
                        </div>

                        <div class="modal-body" id="sceneModalBody">
                        </div>

                        </div>
                    </div>
                    </div>
                `;


            const wpcontent = document.getElementById('wpwrap');
            if (!wpcontent) {
                console.warn('#wpwrap not found.');
                return;
            }

            // Inject as the first child of #wpcontent
            wpcontent.insertAdjacentHTML('afterbegin', markup);
            
            // Scope everything to the newly injected modal (critical)
            const modalEl = document.getElementById('sceneModal');
            const dialog = modalEl?.querySelector('.modal-dialog');

            // Reset inline styles every time (desktop baseline)
            if (dialog) {
                dialog.style.removeProperty('min-width');
                dialog.style.removeProperty('width');
                dialog.style.removeProperty('padding-top');
            }

            // Apply mobile preview sizing ONLY for mobile preview trigger
            if (el.getAttribute('data-depend-id') === 'scene_preview_mobile') {
                if (dialog) {
                    dialog.style.minWidth = '27%';
                    dialog.style.width = '450px';
                    dialog.style.paddingTop = '2%'; // if you need this
                }
            }

            // Wait for DOM update, then show the modal (Bootstrap 5 API)
            setTimeout(() => {
                if (modalEl && typeof bootstrap !== 'undefined') {
                    const modalInstance = bootstrap.Modal.getOrCreateInstance(modalEl);
                    modalInstance.show();
                } else {
                    console.warn('Bootstrap not found — modal injected but not activated.');
                }
            }, 0);


            //_____________________________________________________________________________________________________

            let url;
            try {
                openSceneInModal(el);
                title_arr = buildScenePayloadFromForm();
                //console.log('title_arr', title_arr);
                if (title_arr['post_title'] == '') {
                    title_arr['post_title'] = "No Scene Title Entered.";
                }
                sceneLoc = make_title(); //this should be done on the SCENE side of things, maybe have make_title return scene object instead
                thisInstance = sceneLoc;
                url = title_arr['scene_infographic'];

            } catch {}

            if (url != '') {
                loadSVG(url, "svg1");
            }
            if (url === '') {
                const svgContainer = document.getElementById('svg1');
                svgContainer.innerText = "Please select/up an SVG image in the 'Infographic' field to preview the scene.";
                svgContainer.style.textAlign = "center";
                svgContainer.style.margin = "5%";
                svgContainer.style.fontWeight = "bold";
                svgContainer.style.color = "red";
            } 


        });
    });
    
};


//INJECT CSS FOR THE THEME WHEN SCENE IS CLICKED
if (previewSceneElements.length > 0) {
        previewSceneElements.forEach(el => {
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

                //console.log('🎨 Theme CSS injected');
                } else {
                //console.log('🎨 Theme CSS already loaded');
                }
            });
    });
};

//________________________________________________________________________________________

//Applies to  Scene, Figure, and Modals previews
// When the modal close button is clicked, remove both CSS files
document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'close1') {
        const css1 = document.getElementById('theme-css1');
        const css2 = document.getElementById('theme-css2');
        if (css1) css1.remove();
        if (css2) css2.remove();
    }
});

//________________________________________________________________________________________

async function plotlySnapshotFromDivAndSave(
    gd,
    {
      config = { responsive: true },
      figureId = null,
      sceneSlug = null,
      endpoint = "/wp-json/sw/v1/plotly-snapshot",
      meta = {}
    } = {}
  ) {
    if (!gd?.data || !gd?.layout) throw new Error("Plotly div not ready");
  
    const snap = {
      schema: "plotly-snapshot/v1",
      createdAt: new Date().toISOString(),
      figureId,
      sceneSlug,
      meta,
      data: structuredClone(gd.data),
      layout: structuredClone(gd.layout),
      config: structuredClone(config)
    };
  
    // Portable
    delete snap.layout.width;
    delete snap.layout.height;
    snap.layout.autosize = true;
    snap.config = snap.config || {};
    snap.config.responsive = true;
  
    // Save to WP
    const res = await fetch(endpoint, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(snap),
      credentials: "same-origin"
    });
  
    if (!res.ok) {
      const text = await res.text().catch(() => "");
      throw new Error(`Snapshot save failed (${res.status}): ${text}`);
    }
  
    // Expect server to return: { id, url, ... }
    const saved = await res.json();
  
    // Add “location” info
    snap.saved = {
      id: saved.id || saved.key || null,
      url: saved.url || null
    };
  
    return snap;
  }
  




