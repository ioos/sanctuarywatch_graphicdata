
/**
 * Fetches tab information from a WordPress REST API endpoint and renders it into the specified tab content element and container.
 * This function retrieves figure data associated with a specific tab label and ID, and then processes and displays the data using the `render_tab_info` function.
 * 
 * @param {HTMLElement} tabContentElement - The HTML element where the individual tab content will be rendered.
 * @param {HTMLElement} tabContentContainer - The container element that holds all tab contents.
 * @param {string} tab_label - The label of the tab used to filter data. This parameter is currently unused
 * @param {string} tab_id - The ID of the tab, used to filter the figure data from the fetched results. Is a number but type is string, type casted when used
 *
 * Function Workflow:
 * 1. Constructs the API URL to fetch figure data using the current page's protocol and host.
 * 2. Makes a fetch request to the constructed URL to retrieve figure data in JSON format.
 * 3. Filters the retrieved data based on the provided `tab_id`, looking for figures that match this ID.
 * 4. If no figures match the `tab_id`, the function exits early without rendering any content.
 * 5. If matching figures are found:
 *      a. Iterates through the filtered figure data.
 *      b. Constructs an `info_obj` for each figure, containing URLs, text, image links, and captions.
 *      c. Calls the `render_tab_info` function to render each figure's information into the specified tab content element.
 *
 * Error Handling:
 * - If the fetch request fails, an error message is logged to the console.
 *
 * Usage:
 * Called at the end of the create_tabs function
 */
 function fetch_tab_info(tabContentElement, tabContentContainer, tab_label, tab_id, modal_id){
    const protocol = window.location.protocol;
    const host = window.location.host;
    const fetchURL  =  protocol + "//" + host  + "/wp-json/wp/v2/figure?&per_page=24&order=asc&figure_modal=" + modal_id + "&figure_tab=" + tab_id;
    
    fetch(fetchURL)
        .then(response => response.json())
        .then(data => {

            all_figure_data = data.filter(figure => Number(figure.figure_tab) === Number(tab_id));
            all_figure_data = all_figure_data.filter(figure => Number(figure.figure_modal) === Number(modal_id));

            // Third filter: If user is not logged in, only show published figures
           // const isUserLoggedIn = document.body.classList.contains('logged-in');
           // if (!isUserLoggedIn) {
           //     all_figure_data = all_figure_data.filter(figure => figure.figure_published === "published");
           // }

            // Sort with the following priority:
            // 1. figure_order == 1 → sorted by id
            // 2. figure_order > 1 → sorted by id
            // 3. missing or non-numeric figure_order → sorted by id
            all_figure_data.sort((a, b) => {
                const orderA = Number(a.figure_order);
                const orderB = Number(b.figure_order);
                const validA = !isNaN(orderA);
                const validB = !isNaN(orderB);

                const isOneA = validA && orderA === 1;
                const isOneB = validB && orderB === 1;

                const isGreaterA = validA && orderA > 1;
                const isGreaterB = validB && orderB > 1;

                if (isOneA && !isOneB) return -1;
                if (!isOneA && isOneB) return 1;

                if (isOneA && isOneB) return a.id - b.id;

                if (isGreaterA && !isGreaterB) return -1;
                if (!isGreaterA && isGreaterB) return 1;

                if (isGreaterA && isGreaterB) return a.id - b.id;

                // both are missing or invalid → sort by ID
                return a.id - b.id;
            });

            if (!all_figure_data){
                //we don't create anything here...
                //don't have to render any of the info
                return;
                
            } else{
                (async () => {
                    for (let idx = 0; idx < all_figure_data.length; idx++) {
                        const figure_data = all_figure_data[idx];
                
                        let external_alt = '';
                        if (figure_data['figure_path'] === 'External') {
                            img = figure_data['figure_external_url'];
                            external_alt = figure_data['figure_external_alt'];
                        } else {
                            img = figure_data['figure_image'];
                        }
                
                        const info_obj = {
                            postID: figure_data.id,
                            scienceLink: figure_data["figure_science_info"]["figure_science_link_url"],
                            scienceText: figure_data["figure_science_info"]["figure_science_link_text"],
                            dataLink: figure_data["figure_data_info"]["figure_data_link_url"],
                            dataText: figure_data["figure_data_info"]["figure_data_link_text"],
                            imageLink: img,
                            code: figure_data["figure_code"],
                            externalAlt: external_alt,
                            shortCaption: figure_data["figure_caption_short"],
                            longCaption: figure_data["figure_caption_long"],
                            figureType: figure_data["figure_path"],
                            figureTitle: figure_data["figure_title"],
                            figure_interactive_arguments: figure_data["figure_interactive_arguments"]
                        };
                
                        (async () => {
                            await render_tab_info(tabContentElement, tabContentContainer, info_obj, idx);
                            //await new Promise(resolve => setTimeout(resolve, 1000)); // Stagger each render
                            await render_interactive_plots(tabContentElement, info_obj);
                        })();
                    }
                })();
            }
        })
    .catch(error => console.error('Error fetching data:', error));
        //new stuff here
   
}

//create tabs
/**
 * Creates and adds a new tab within modal window. Each tab is associated with specific content that is displayed when the tab is active.
 * The function also sets up event listeners for copying the tab link to the clipboard (modified permalink structure)
 *
 * @param {number} iter - The index of the tab being created. This determines the order of the tabs. From render_modal, when iterating through all tabs
 * @param {string} tab_id - The unique identifier for the tab, generated from the `tab_label`. It is sanitized to replace spaces and special characters.
 * @param {string} tab_label - The label displayed on the tab, which the user clicks to activate the tab content.
 * @param {string} [title=""] - An optional title used to construct the IDs and classes associated with the tab. It is sanitized similarly to `tab_id`.
 *
 * Function Workflow:
 * 1. Sanitizes `tab_id` and `title` by replacing spaces and special characters with underscores to create valid HTML IDs.
 * 2. Constructs the target ID for the tab content and controls using the sanitized `title` and `tab_id`.
 * 3. Creates a new navigation item for the tab, including setting the necessary attributes for Bootstrap styling and functionality.
 * 4. Appends the new tab button to modal window
 * 5. Creates a corresponding tab content pane and sets its attributes for proper display and accessibility.
 * 6. Adds a "Copy Tab Link" button and link to the tab content that allows users to copy the tab's URL to the clipboard.
 * 7. Sets event listeners for the tab button and link/button to handle copying the URL to the clipboard when clicked.
 * 8. Updates the browser's hash in the URL to reflect the currently active tab when it is clicked based on what tab/figure is currently being displayed
 * 9. Calls the `fetch_tab_info` function to fetch and display data relevant to the newly created tab.
 *
 * Error Handling:
 * - The function handles potential errors during clipboard writing by providing user feedback through alerts.
 *
 * Usage:
 * Called within render_modal -- each modal has a certain amount of tabs, iterate through each tab and create/render tab info, fix tab permalink
 *
 */
function create_tabs(iter, tab_id, tab_label, title = "", modal_id) {

    tab_id = tab_label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_'); //instead of tab id, it should just be the index (figure_data)
    title = title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_');
    tab_id = iter;

    let tab_target = `#${title}-${tab_id}-pane`;
    let tab_controls = `${title}-${tab_id}-pane`;

    let myTab = document.getElementById('myTab');
    let navItem = document.createElement("li");
    navItem.classList.add("nav-item");
    navItem.setAttribute("role", "presentation");
    
    const button = document.createElement('button');
    button.classList.add('nav-link');
    button.classList.add('tab-title');
    if (iter === 1) {
        button.classList.add('active');
        button.setAttribute('aria-selected', 'true');
    } else {
        button.setAttribute('aria-selected', 'false');
    }
    button.id = `${title}-${tab_id}`;
    button.setAttribute('data-bs-toggle', 'tab');
    button.setAttribute('data-bs-target', tab_target);
    button.setAttribute('type', 'button');
    button.setAttribute('role', 'tab');
    button.setAttribute('aria-controls', tab_controls);
    button.textContent = tab_label;

    navItem.appendChild(button);
    myTab.appendChild(navItem);

    let tabContentContainer = document.getElementById("myTabContent");
    const tabContentElement = document.createElement('div');
    tabContentElement.classList.add('tab-pane', 'fade');


    if (iter === 1) {
        tabContentElement.classList.add('show', 'active');
    }
    
    tabContentElement.id = tab_controls;
    tabContentElement.setAttribute('role', 'tabpanel');
    tabContentElement.setAttribute('aria-labelledby', `${title}-${tab_id}`);
    tabContentElement.setAttribute('tabindex', '0');

    tabContentContainer.appendChild(tabContentElement);
    
    let linkbutton = document.createElement("button");
    linkbutton.classList.add("btn", "btn-primary");
    linkbutton.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Tab Link';
    linkbutton.type = "button"; 
    linkbutton.setAttribute('style', 'margin-bottom: 7px');
    tabContentElement.prepend(linkbutton);


    if (iter === 1) {
        window.location.hash = `${title}/${tab_id}`; 
    
        linkbutton.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent the link from opening
            writeClipboardText(`${window.location.origin}${window.location.pathname}#${title}/${tab_id}`);
        });
    }

    button.addEventListener('click', function() {
        window.location.hash = `${title}/${tab_id}`; 
       
        linkbutton.addEventListener("click", (e) => {
            e.preventDefault(); // Prevent the link from opening
            writeClipboardText(`${window.location.origin}${window.location.pathname}#${title}/${tab_id}`);
        });      
        
    });
    async function writeClipboardText(text) {
        try {
            await navigator.clipboard.writeText(text);
            alert('Link copied to clipboard!');
        } catch (error) {
            console.error('Failed to copy: ', error);
            alert('Failed to copy link. Please try again.');
        }
    }
    
    //fetch_tab_info(tabContentElement, tabContentContainer, tab_label, tab_id, modal_id);
    (async () => {
        await fetch_tab_info(tabContentElement, tabContentContainer, tab_label, tab_id, modal_id);
    })();

    
    //Google tags triggers
    modalTabLoaded(tab_label, modal_id, tab_id, gaMeasurementID);
    setupModalMoreInfoLinkTracking(modal_id);
    setupModalImagesLinkTracking(modal_id);
}



/**
 * Renders a modal dialog for corresponding icon with data fetched from a WordPress REST API endpoint.
 * The modal displays a title, tagline, and two sections of content (more info and images) 
 * using accordions, along with dynamic tab content based on the modal's data.
 *
 * @param {string} key - The key used to access specific child data in the `child_obj` object,
 *                       which contains modal configuration and content details.
 *
 * This function performs the following steps:
 * 1. Constructs the URL to fetch modal data based on the `modal_id` associated with the provided `key`.
 * 2. Fetches modal data from the WordPress REST API.
 * 3. Updates the modal title and tagline based on the fetched data.
 * 4. Generates two accordion sections:
 *    - A "More Info" section containing a list of items linked to URLs.
 *    - An "Images" section containing a list of image links.
 * 5. Dynamically creates tabs based on the number of tabs specified in the modal data.
 * 6. Adjusts layout and classes for mobile and desktop views.
 * 7. Traps focus within the modal dialog to improve accessibility.
 *
 * Usage:
 * Called in add_modal and table_of_contents; those functions iterate through keys of child_obj(which has all the icons in a scene )
 */
function render_modal(key){

    let id = child_obj[key]['modal_id'];
    const protocol = window.location.protocol;
    const host = window.location.host;
    const fetchURL  =  protocol + "//" + host  + `/wp-json/wp/v2/modal/${id}`;
    fetch(fetchURL)
        .then(response => response.json())
        .then(data => {

            let modal_data = data; //.find(modal => modal.id === id);

            //title stuff:
            let title = child_obj[key]['title'];  //importat! pass as argument
            let modal_title = document.getElementById("modal-title");
            
            modal_title.innerHTML = title;

            //tagline container
            let tagline_container = document.getElementById('tagline-container');
            //add stuff for formatting here...

            let modal_tagline = modal_data["modal_tagline"];
            if (!is_mobile()){
                tagline_container.innerHTML =  "<em>" + modal_tagline + "<em>";
            }

            //generate accordion
            // Select the container where the accordion will be appended
            let accordion_container = document.getElementById('accordion-container');
            //add stuff for formatting here...

            // Create the accordion element
            let acc = document.createElement("div");
            acc.classList.add("accordion");

            let modal_info_entries = modal_data["modal_info_entries"];
            let modal_photo_entries = modal_data["modal_photo_entries"];

            if (is_mobile()){

                accordion_container.setAttribute("class", "");

            } else{
                tagline_container.setAttribute("class", "");
                accordion_container.setAttribute("class", "");
                
                if (modal_info_entries != 0 || modal_photo_entries != 0) {
                    tagline_container.classList.add("col-9");
                    accordion_container.classList.add("col-3");
                } else {
                    tagline_container.classList.add("col-12");
                    accordion_container.classList.add("d-none");
                }
            }

            //for more info

            if (modal_info_entries != 0){

                let collapseListHTML = '<div><ul>';
                for (let i = 1; i < 7; i++){
                    let info_field = "modal_info" + i;
                    let info_text = "modal_info_text" + i;
                    let info_url = "modal_info_url" + i;

                    let modal_info_text = modal_data[info_field][info_text];
                    let modal_info_url = modal_data[info_field][info_url];
                    if ((modal_info_text == '') && (modal_info_url == '')){
                        continue;
                    }

                    let listItem = document.createElement('li');
                    let anchor = document.createElement('a');
                    anchor.setAttribute('href', modal_info_url); 
                    anchor.textContent = modal_info_text;

                    listItem.appendChild(anchor);

                    collapseListHTML += `<li> <a href="${modal_info_url}" target="_blank">${modal_info_text}</a> </li>`;

                }
                collapseListHTML += '</ul></div>';
                let accordionItem1 = createAccordionItem("accordion-item-1", "accordion-header-1", "accordion-collapse-1", "More Info", collapseListHTML);
                acc.appendChild(accordionItem1);
            }

            //for photos:

            let modal_id = modal_data.id;
            let collapsePhotoHTML = '<div><ul>';
    
            //Show the "Images" accordion item if the number of image entries is greater than 0 in the admin slider for modals.
            if (modal_photo_entries != 0){
                for (let i = 1; i < 7; i++){
                    let info_field = "modal_photo" + i;
                    let info_text = "modal_photo_text" + i;
    
                    let info_url;
                    let loc = "modal_photo_location" + i;
                    if (modal_data[info_field][loc] === "External"){
                        info_url = "modal_photo_url" + i;
                    } else {
                        info_url = "modal_photo_internal" + i;
                    }
    
                    let modal_info_text = modal_data[info_field][info_text];
                    let modal_info_url = modal_data[info_field][info_url];
                    if ((modal_info_text == '') && (modal_info_url == '')){
                        continue;
                    }
    
                    let listItem = document.createElement('li');
                    let anchor = document.createElement('a');
                    anchor.setAttribute('href', modal_info_url); 
                    anchor.textContent = modal_info_text;
    
                    listItem.appendChild(anchor);
    
                    collapsePhotoHTML += `<li> <a href="${modal_info_url}" target="_blank">${modal_info_text}</a> </li>`;
                    collapsePhotoHTML += '</ul></div>';
                }

                let accordionItem2 = createAccordionItem("accordion-item-2", "accordion-header-2", "accordion-collapse-2", "Images", collapsePhotoHTML);
                acc.appendChild(accordionItem2);
            } 
            
            if (is_mobile()){
                let accordionItem3 = createAccordionItem("accordion-item-3", "accordion-header-3", "accordion-collapse-3", "Tagline", modal_tagline);
                acc.prepend(accordionItem3);

            }

            accordion_container.appendChild(acc);
            
            let num_tabs = Number(modal_data["modal_tab_number"]);

            for (let i =1; i <= num_tabs; i++){
                let tab_key = "modal_tab_title" + i;
                let tab_title = modal_data[tab_key];

                create_tabs(i, tab_key, tab_title, title, modal_id);

                if (i === num_tabs){
                    break;
                }

                let mdialog = document.querySelector("#myModal > div"); //document.querySelector("#myModal");

                trapFocus(mdialog);
              
            }
            // Google Tags
            modalWindowLoaded(title, modal_id, gaMeasurementID);

            
        })
    .catch(error => console.error('Error fetching data:', error));
    
}

