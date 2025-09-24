/**
 * Debounces a function, delaying its execution until after a specified wait time
 * has elapsed since the last time it was invoked.
 * @param {Function} func The function to debounce.
 * @param {number} delay The number of milliseconds to delay.
 * @returns {Function} The new debounced function.
 */
function debounce(func, delay) {
    let timeoutId;
    return function(...args) {
        const context = this;
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => {
            func.apply(context, args);
        }, delay);
    };
}

/**
 * Converts a hex color code to an RGBA color string.
 *
 * @function
 * @param {string} hex - The hex color code (e.g., "#ff0000" or "ff0000").
 * @param {number} opacity - The opacity value for the RGBA color (between 0 and 1).
 * @returns {string} The RGBA color string (e.g., "rgba(255, 0, 0, 0.5)").
 *
 * @example
 * hexToRgba('#3498db', 0.7); // returns "rgba(52, 152, 219, 0.7)"
 */
function hexToRgba(hex, opacity) {
    // Remove the hash if it's present
    hex = hex.replace(/^#/, '');

    // Parse the r, g, b values from the hex string
    let bigint = parseInt(hex, 16);
    let r = (bigint >> 16) & 255;
    let g = (bigint >> 8) & 255;
    let b = bigint & 255;

    // Return the rgba color string
    return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}


/**
 * Traps the focus within a specified modal element, ensuring that the user cannot tab out of it.
 *
 * This function ensures that accessibility keyboard navigation (specifically tabbing) is confined within the modal,
 * and if the user tries to tab past the last focusable element, focus will loop back to the first focusable element.
 * It also brings focus back to the modal if the user attempts to focus on an element outside of it.
 *
 * @param {HTMLElement} modalElement - The modal element within which focus should be trapped.
 * @returns {Function} cleanup - A function that removes the event listeners and deactivates the focus trap.
 */
function trapFocus(modalElement) {
    function getFocusableElements() {
        return Array.from(modalElement.querySelectorAll(
            'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'
        )).filter(el => !el.hasAttribute('disabled') && el.offsetParent !== null);
    }

    function handleKeydown(e) {
        const focusableElements = getFocusableElements();
        const firstFocusableElement = focusableElements[0];
        const lastFocusableElement = focusableElements[focusableElements.length - 1];

        if (e.key === 'Tab' || e.keyCode === 9) {
            if (e.shiftKey) { // shift + tab
                if (document.activeElement === firstFocusableElement) {
                    lastFocusableElement.focus();
                    e.preventDefault();
                }
            } else { // tab
                if (document.activeElement === lastFocusableElement) {
                    firstFocusableElement.focus();
                    e.preventDefault();
                }
            }
        } 
    }

    function handleFocus(e) {
        if (!modalElement.contains(e.target)) {
            const focusableElements = getFocusableElements();
            if (focusableElements.length > 0) {
                focusableElements[0].focus();
            }
        }
    }

    document.addEventListener('keydown', handleKeydown);
    document.addEventListener('focus', handleFocus, true);

    const initialFocusableElement = getFocusableElements()[0];
    if (initialFocusableElement) initialFocusableElement.focus();

    return function cleanup() {
        document.removeEventListener('keydown', handleKeydown);
        document.removeEventListener('focus', handleFocus, true);
    };
}

let child_obj = JSON.parse(JSON.stringify(child_ids));

let url1 =(JSON.stringify(svg_url));
url = url1.substring(2, url1.length - 2);


let testData;
let thisInstance;
let thisScene;
let sceneLoc;

let sectionObj = {};

let sectColors = {};

if (!is_mobile()) {
    // Create a new style element
    const style = document.createElement('style');

    style.innerHTML = `
        @media (min-width: 512px) and (max-width: 768px) {
            #toc-container{
                margin-left: 0px !important;
            }
            #scene-row > div.col-md-9{
                margin-left: 0px !important;
            }
            #title-container{
                margin-left: 0px !important;
            }
            #title-container > div > div.col-md-2 > div{
                max-width: 96% !important;
            }
            #top-button{
                margin-bottom: 5px;
                font-size: large;
                z-index: 1;
                margin-top: 2%;
            }
            #toggleButton{
                margin-bottom: 0px;
                font-size: large;
                z-index: 1;
            }
            #toc-group{
                padding-top: 2%;
            }
        }
    `;
    // Append the style to the head of the document
    document.head.appendChild(style);
}

/**
 
 * This function pre-processes the `child_obj` dictionary to ensure that each element (scene icon) belongs to the 
 * current scene by checking if its scene ID matches the post ID.
 * This ensures that elements from other scenes are excluded, and keys are updated as needed to avoid duplicates.
 *
 * @returns {void} Modifies child_obj dictionary in place
 */
function process_child_obj(){
    for (let key in child_obj){
        if (child_obj[key]["scene"]["ID"] !== post_id){
            delete child_obj[key];
        }
        else{
           
            let oldkey = String(key);
            let lastChar = oldkey.charAt(oldkey.length - 1);

            let isNumeric = /\d/.test(lastChar);

            //prevent duplicates:  For example, if there is a separate mobile icon for the icon named "whales", then in the mobile layer, that icon should be named "whales-mobile".
            if (isNumeric){
                let newkey = child_obj[key]["original_name"];
                child_obj[newkey] = child_obj[key];
                delete child_obj[key];
            }
        }
    }
    //now sort by icon order
    // If you need it back as an object:
}

// The lines below from ~ 173 to ~ 213 are used for organizing child_obj(of modals) when it is fed into the toc as sorted_child_entries. 
// If all modals are set to 1 then it now organized alphabetically. other wise it respects the modal order.
process_child_obj();

// Step 1: get [key, value] pairs
let sorted_child_entries = Object.entries(child_obj);

// Step 2: check if all modal_icon_order are 1 (or missing)
/**
 * Checks if all objects in the `sorted_child_entries` array have their `modal_icon_order` property equal to 1.
 *
 * @constant {boolean} allOrdersAreOne - A boolean indicating whether all entries satisfy the condition.
 * @param {Array} sorted_child_entries - An array of entries where each entry is a tuple containing a key and an object.
 * @param {Array} sorted_child_entries[].0 - The key of the entry (not used in the condition).
 * @param {Object} sorted_child_entries[].1 - The object containing the `modal_icon_order` property.
 * @param {string} sorted_child_entries[].1.modal_icon_order - The property to be checked, expected to be a string representation of a number.
 * @returns {boolean} `true` if all `modal_icon_order` values are equal to 1 after parsing as integers, otherwise `false`.
 */
const allOrdersAreOne = sorted_child_entries.every(([_, obj]) => parseInt(obj.modal_icon_order) === 1);

// Step 3: sort conditionally
if (allOrdersAreOne) {
    sorted_child_entries.sort((a, b) => {
        const titleA = a[1].title?.toLowerCase() || '';
        const titleB = b[1].title?.toLowerCase() || '';
        return titleA.localeCompare(titleB);
    });
} else {
    sorted_child_entries.sort((a, b) => {
        return (a[1].modal_icon_order || 0) - (b[1].modal_icon_order || 0);
    });
}

// Step 4: extract the objects (no keys) to match your original format
const sorted_child_objs = sorted_child_entries.map(([_, val]) => val);

// Step 5: build child_ids_helper for title-to-key mapping
child_ids_helper = {};
for (const [key, value] of sorted_child_entries) {
    child_ids_helper[value.title] = key;
}

/**
 * Creates HTML elements that represent collapsible sections with links to additional scene information.
 * This function generates a list of scene information items (like text and URLs) and wraps them in an accordion component.
 * 
 * @param {string} info - The base name of the field in `scene_data` representing scene information. 
 *                        This value will be concatenated with a number (1 to 6) to create the full field name.
 * @param {string} iText - The base name of the field in `scene_data` representing the text information for the scene. 
 *                         This will be concatenated with a number (1 to 6) to fetch the corresponding text.
 * @param {string} iUrl - The base name of the field in `scene_data` representing the URL information for the scene. 
 *                        This will be concatenated with a number (1 to 6) to fetch the corresponding URL.
 * @param {object} scene_data - The dataset containing information about the scene, which includes fields for text and URL.
 * @param {string} type - The type identifier, used to generate unique HTML element IDs.
 * @param {string} name - The display name for the accordion section header.
 * 
 * @returns {HTMLElement} - Returns an accordion item element (generated via `createAccordionItem`) containing the list of scene links.
 *
 * This function is typically used in `make_title` to generate the "More Info" and "Images" sections for each scene. It iterates through 
 * a predefined set of numbered fields (from 1 to 6) in the `scene_data`, checking for non-empty text and URLs. If valid data is found, 
 * it creates a collapsible accordion section with the relevant links and displays them.
 */
function make_scene_elements(info, iText, iUrl, scene_data, type, name){
    let collapseListHTML = '<div><ul>';
    for (let i = 1; i < 7; i++){
                let info_field = info + i;
                let info_text = iText + i;
                let info_url = iUrl + i;

                let scene_info_url;

                if (iUrl == "scene_photo_url"){
                    let photoLoc = "scene_photo_location" + i;
                    if (scene_data[info_field][photoLoc] == "External"){
                        scene_info_url = scene_data[info_field][info_url];
                    } else {
                        let internal = "scene_photo_internal" + i;
                        scene_info_url = scene_data[info_field][internal];
                    }
                } else {
                    scene_info_url = scene_data[info_field][info_url];
                }

                let scene_info_text = scene_data[info_field][info_text];
                

                if ((scene_info_text == '') && (scene_info_url == '')){
                    continue;
                }

                let listItem = document.createElement('li');
                let anchor = document.createElement('a');
                anchor.setAttribute('href', 'test'); 
                anchor.textContent = 'test';

                listItem.appendChild(anchor);

                collapseListHTML += `<li> <a href="${scene_info_url}" target="_blank">${scene_info_text}</a> </li>`;

    }
    collapseListHTML += '</ul></div>';
    let acc = createAccordionItem(`${type}-item-1`, `${type}-header-1`, `${type}-collapse-1`, name, collapseListHTML);

    return acc;
}

/**
 * Creates and renders the scene title, tagline, more information/photo dropdowns after scene API call. Called asynchronously within init function
 * @returns {String} `String` - Numerical location of the scene (which instance its found in) but still a string, returned so scene location can be used within init
 * @throws {Error} - Throws an error if the network response is not OK or if the SVG cannot be fetched or parsed.
 *  @throws {Error} - Throws an error if scene data not found or error fetching data
 */
async function make_title() {
    const protocol = window.location.protocol;
    const host = window.location.host;

    try {
        scene_data = title_arr;

        let scene_location = scene_data["scene_location"];
        let title = scene_data['post_title'];

        let titleDom = document.getElementById("title-container");
        let titleh1 = document.createElement("h1");
        titleh1.innerHTML = title;
        titleDom.appendChild(titleh1);

        if (is_mobile()) {
            titleh1.setAttribute("style", "margin-top: 16px; justify-content: center;; align-content: center; display: flex;");
        } else {}

        let accgroup = document.createElement("div");

    //     if (!is_mobile()) {
    //   //      accgroup.setAttribute("style", "margin-top: 2%");
    //     } else {
    //         accgroup.setAttribute("style", "margin-top: 16px"); //max-width: 85%
    //     }

        accgroup.classList.add("accordion");

        if (scene_data["scene_info_entries"]!=0){
            let acc = make_scene_elements("scene_info", "scene_info_text", "scene_info_url", scene_data, "more-info", "More Info");
            accgroup.appendChild(acc);
        }
        if (scene_data["scene_photo_entries"] != 0){
            let acc1 = make_scene_elements("scene_photo", "scene_photo_text", "scene_photo_url", scene_data, "images", "Images");
            accgroup.appendChild(acc1); 
        }
   
        let row = document.createElement("div");
        row.classList.add("row");

        let col1 = document.createElement("div");
        col1.appendChild(accgroup);

        let col2 = document.createElement("div");

        if (!is_mobile()) {


            col1.classList.add("col-md-2");
            col2.classList.add("col-md-10");

            function adjustTitleContainerMargin() {
                if (window.innerWidth < 512) {
                    document.querySelector("#title-container").style.marginLeft = '0%';
                } 
            }
            adjustTitleContainerMargin();
            window.addEventListener('resize', adjustTitleContainerMargin);

        } else {
            col1.classList.add("col-md-2");
            col2.classList.add("col-md-10");
        }

        if (is_mobile()){
            col1.setAttribute("style", "max-width: 85%;");
            col2.setAttribute("style", "padding-top: 5%; align-content: center; margin-left: 7%;");
        }

        let titleTagline = document.createElement("p");
        titleTagline.innerHTML = scene_data.scene_tagline;
        titleTagline.style.fontStyle = 'italic';
        if (is_mobile()){
            let item = createAccordionItem("taglineAccId", "taglineHeaderId", "taglineCollapseId", "Tagline", scene_data.scene_tagline);
            accgroup.prepend(item);

        } else {
            col2.appendChild(titleTagline);
        }
        row.appendChild(col2);
        row.appendChild(col1);

        titleDom.append(row);
 
        let instance_overview_scene = scene_data['instance_overview_scene'];
        if (instance_overview_scene == null){
            instance_overview_scene = 'None';
        }
        // Google Tags
        sceneLoaded(title, scene_data['post_ID'], instance_overview_scene, gaMeasurementID);
        setupSceneMoreInfoLinkTracking(title, scene_data['post_ID']);
        setupSceneImagesLinkTracking(title, scene_data['post_ID']);

        return scene_data;

    } catch (error) {
        console.error('If this fires you really screwed something up', error);
    }
}

let mobileBool = false;


/**
 * Checks whether or not an icon has an associated mobile layer. Looks at mob_icons elementm
 * @returns {Boolean} `Boolean` - Numerical location of the scene (which instance its found in) but still a string, returned so scene location can be used within init
 * @throws {Error} - Throws an error if the network response is not OK or if the SVG cannot be fetched or parsed.
 * * @throws {Error} - Throws an error if scene data not found or error fetching data
 */
function has_mobile_layer(mob_icons, elemname){
    if (mob_icons == null){
        return false;
    }
    for (let i = 0; i < mob_icons.children.length; i++) {
        let child = mob_icons.children[i];
        let label = child.getAttribute('id');
        let mobileElemName = elemname + "-mobile";
        if (label === mobileElemName){
            return true;
        }             
    }
    return false;
}

//returns DOM elements for mobile layer
/**
 * Retrieves the DOM element corresponding to a specific layer in a mobile SVG structure based on its label.
 * 
 * @param {HTMLElement} mob_icons - The parent DOM element that contains all child elements (icons) to search through.
 * @param {string} elemname - The name of the layer or icon to search for. It matches the 'inkscape:label' attribute of the child element.
 * 
 * @returns {HTMLElement|null} - Returns the DOM element that matches the given `elemname` in the 'inkscape:label' attribute.
 *                                If no match is found, it returns `null`.
 */
function get_mobile_layer(mob_icons, elemname){
    for (let i = 0; i < mob_icons.children.length; i++) {
        let child = mob_icons.children[i];
        let label = child.getAttribute('id');
        if (label === elemname){
            return child;
        }             
    }
    return null;
}

/**
 * Removes the outer container with the ID 'entire_thing' and promotes its child elements to the body. 
 * This is because we want to get rid of entire_thing if we are on pc/tablet view, and keep it otherwise (ie mobile)
 * 
 * This function locates the container element with the ID 'entire_thing', moves all its child elements 
 * directly to the `document.body`, and then removes the container itself from the DOM.
 * 
 * @returns {void}
 */
function remove_outer_div(){
    let container =  document.querySelector("#entire_thing");
    while (container.firstChild) {
        document.body.insertBefore(container.firstChild, container);
    }
    container.remove();

}

//helper function for creating mobile grid for loadSVG:
/**
 * Creates a mobile grid layout for displaying icons in an SVG element.
 * 
 * This function removes the outer container (using `remove_outer_div`), clones icons from an SVG element, 
 * and organizes them into a responsive grid based on the screen's width and height. It adjusts the layout
 * when the window is resized, dynamically setting the number of columns and rows.
 * 
 * @param {SVGElement} svgElement - The main SVG element that contains the icons to be displayed.
 * @param {Array} iconsArr - An array of icon objects containing the icon IDs and their metadata.
 * @param {HTMLElement} mobile_icons - A DOM element containing specific mobile versions of icons, if available.
 * 
 * @returns {void}
 */

function mobile_helper(svgElement, iconsArr, mobile_icons) {
    // Clear any existing mobile layout DOM container
    remove_outer_div();

    // Grab the <defs> section of the SVG (symbol definitions, gradients, etc.)
    let defs = svgElement.firstElementChild;
    let scene_toc_style = scene_data.scene_toc_style;

    function groupIconsBySection(iconsArr) {
        
        const grouped = {};
        const sectionOrderMap = {};
        iconsArr.forEach(iconId => {

            if (scene_same_hover_color_sections !== "yes" && child_obj[iconId] !== "None") {
                let section_num = child_obj[iconId].section_name;
                let modal_icon_order = child_obj[iconId].modal_icon_order;
                let modal_title = child_obj[iconId].title;
                let this_scene_section = `scene_section${section_num}`;
                let this_scene_section_title = `scene_section_title${section_num}`;
                let this_color = `scene_section_hover_color${section_num}`;
                let text_color = `scene_section_hover_text_color${section_num}`;
                const hoverColor = scene_data[this_scene_section][this_color];
                const sectionTitle = scene_data[this_scene_section][this_scene_section_title];
                const hoverTextColor = scene_data[this_scene_section][text_color];
                const groupTitle = sectionTitle || "Other";
                
                // Track section_num for sorting later
                sectionOrderMap[groupTitle] = parseInt(section_num);

                if (!grouped[groupTitle]) {
                    grouped[groupTitle] = {
                        sectionNum: parseInt(section_num),
                        sectionColor: hoverColor,
                        textColor: hoverTextColor,
                        modal_titles: [],
                        modal_orders: [],
                        iconIds: []
                    };
                }
                grouped[groupTitle].iconIds.push(iconId);
                grouped[groupTitle].modal_titles.push(modal_title);
                grouped[groupTitle].modal_orders.push(modal_icon_order);
            }
            if (scene_same_hover_color_sections == "yes") {
                let section_num = child_obj[iconId].section_name;
                let modal_icon_order = child_obj[iconId].modal_icon_order;
                let modal_title = child_obj[iconId].title;
                let this_scene_section = `scene_section${section_num}`;
                let this_scene_section_title = `scene_section_title${section_num}`;
                const hoverColor = scene_default_hover_color;
                const sectionTitle = scene_data[this_scene_section][this_scene_section_title] ;
                const hoverTextColor = scene_default_hover_text_color;
                const groupTitle = sectionTitle || "Other";

                // Track section_num for sorting later
                sectionOrderMap[groupTitle] = parseInt(section_num);

                if (!grouped[groupTitle]) {
                    grouped[groupTitle] = {
                        sectionNum: parseInt(section_num),
                        sectionColor: hoverColor,
                        textColor: hoverTextColor,
                        modal_titles: [],
                        modal_orders: [],
                        iconIds: []
                    };
                }
                grouped[groupTitle].iconIds.push(iconId);
                grouped[groupTitle].modal_titles.push(modal_title);
                grouped[groupTitle].modal_orders.push(modal_icon_order);
            }
        });

        // Sort group titles by section_num
        const sortedGroupTitles = Object.entries(sectionOrderMap)
            .sort((a, b) => a[1] - b[1]) // sort by section_num
            .map(entry => entry[0]);     // get groupTitle

        // Rebuild grouped and hoverColors in sorted order
        const groupedSorted = {};

        sortedGroupTitles.forEach(groupTitle => {
            const group = grouped[groupTitle];

            // Combine icon data into sortable array
            const combined = group.iconIds.map((iconId, i) => ({
                iconId,
                order: group.modal_orders[i] ?? 9999,  // fallback for undefined/null
                title: group.modal_titles[i] ?? ""
            }));

            // Sort: first by modal_icon_order (numerically), then by title (alphabetically)
            combined.sort((a, b) => {
                const orderA = parseInt(a.order, 10);
                const orderB = parseInt(b.order, 10);
                if (orderA === orderB) {
                    return a.title.localeCompare(b.title);
                }
                return orderA - orderB;
            });

            // Overwrite iconIds with sorted version
            group.iconIds = combined.map(item => item.iconId);

            // Clean up: no need to keep modal_titles/modal_orders unless needed later
            delete group.modal_titles;
            delete group.modal_orders;

            groupedSorted[groupTitle] = group;
        });

        return groupedSorted;
    }

    function getSortedIconsArr(iconsArr) {
        const sortable = iconsArr.map(iconId => {
            return {
                iconId,
                modal_icon_order: parseFloat(child_obj[iconId]?.modal_icon_order) || 0,
                modal_title: child_obj[iconId]?.title || ''
            };
        });

        sortable.sort((a, b) => {
            if (a.modal_icon_order !== b.modal_icon_order) {
                return a.modal_icon_order - b.modal_icon_order;
            }
            return a.modal_title.localeCompare(b.modal_title);
        });

        const sortedIconArr = sortable.map(item => item.iconId);
        return sortedIconArr;
    }

    async function buildAccordionLayout(groupedIcons, numCols, numRows) {
        const outer_cont = document.querySelector("body > div.container-fluid");
        outer_cont.innerHTML = '';

        Object.entries(groupedIcons).forEach(([sectionTitle, sectionData], groupIndex) => {
            const { sectionNum, sectionColor, textColor, iconIds } = sectionData;

            let renderedIcons = 0;

            const accordionWrapper = document.createElement("div");
            accordionWrapper.classList.add("accordion-group");

            const header = document.createElement("div");
            header.classList.add("accordion-header");
            header.textContent = sectionTitle;
            header.style.cursor = "pointer";
            header.style.padding = "10px";
            header.style.backgroundColor = sectionColor; 
            header.style.fontWeight = "bold";
            header.style.color = textColor;
            //header.style.border = "1px solid #ccc";
            header.style.borderRadius = "10px";
            header.style.marginBottom = "16px";
            header.style.textAlign = "center";
            header.innerHTML = `${sectionTitle} <i class="fas fa-chevron-down" style="float: right; padding-right: 12px; padding-top: 5px;"></i>`;
            header.setAttribute("data-target", `accordion-body-${groupIndex}`);

            accordionWrapper.appendChild(header);

            const body = document.createElement("div");
            body.classList.add("accordion-body");
            body.setAttribute("id", `accordion-body-${groupIndex}`);
            body.style.display = "none";
            //body.style.padding = "10px";
            body.style.border = "";

            let idx = 0; // Index of current icon in iconsArr
            // Create the grid rows
            for (let i = 0; i < numRows; i++) {
                let row_cont = document.createElement("div");
                row_cont.classList.add("row", "flex-wrap", "justify-content-center");
                row_cont.setAttribute("id", `row-${i}`);


                // Create the columns in each row
                for (let j = 0; j < numCols; j++) {
                    if (idx < iconIds.length) {
                        // Create a Bootstrap column container for each icon
                        let cont = document.createElement("div");
                        cont.classList.add("col-4");
                        cont.style.paddingBottom = '10px';
                        cont.style.paddingTop = '10px';
                        cont.style.paddingLeft = '5px';
                        cont.style.paddingRight = '5px';
                        cont.style.fontWeight = 'bold'; 
                        cont.style.border = '1px solid #000';
                        cont.style.background = instance_color_settings["instance_mobile_tile_background_color"];
                        cont.style.color = instance_color_settings["instance_mobile_tile_text_color"]; 
                        cont.style.overflow = 'hidden';


                        // Identify the current icon ID
                        let currIcon = iconIds[idx];
                        let key;

                        if (child_obj[currIcon] && child_obj[currIcon].section_name == sectionNum) {

                            // If there is no mobile layer, use the default icon layer
                            if (!has_mobile_layer(mobile_icons, currIcon)) {
                                key = svgElement.querySelector(`#${currIcon}`).cloneNode(true);
                            } else {
                                // Try to get the mobile-specific version of the icon
                                const currIconMobile = currIcon + "-mobile";
                                const mobileLayerElement = get_mobile_layer(mobile_icons, currIconMobile);

                                if (mobileLayerElement) {
                                    key = mobileLayerElement.cloneNode(true);
                                } else {
                                    console.warn(`Mobile layer for ${currIcon} expected but not found. Using default.`);
                                    key = svgElement.querySelector(`#${currIcon}`).cloneNode(true);
                                }
                            }

                            if (!key) {
                                console.error(`Could not find SVG element for icon: ${currIcon}`);
                                continue; // Skip rendering if the icon couldn't be found
                            }
                            // Set a unique ID for the container
                            cont.setAttribute("id", `${currIcon}-container`);
                            
                            // Create a blank SVG container
                            // Add shared <defs> and icon content to the new SVG
                            let svgClone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                            svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                            svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                            svgClone.append(defs.cloneNode(true));
                            svgClone.append(key);
                            cont.appendChild(svgClone);

                            // Add a caption below the icon using child_obj data
                            let caption = document.createElement("div");
                            if (child_obj[currIcon]) {
                                caption.innerText = child_obj[currIcon].title;
                            } else {
                                caption.innerText = "not in wp yet, have to add";
                            }
                            caption.style.paddingBottom = '10px';
                            //caption.style.fontSize = "14px";
                            //caption.style.fontSize = "3.15vw";
                            caption.style.overflow = "hidden";

                            const maxChars2 = 30;  // your character limit
                            const maxChars3 = 40;  // your character limit
                            const maxChars1 = 11;  // your character limit
                        
                            
                            if (caption.textContent.length <= maxChars1) {
                            // Text is longer than limit — apply a certain style or class
                            caption.style.fontSize = '12px';     // Example: smaller font size
                            // or
                            caption.classList.add('small-text'); // Example: add CSS class controlling size
                            }
                            if (caption.textContent.length > maxChars1 && caption.textContent.length <= maxChars2) {
                            // Text is longer than limit — apply a certain style or class
                            caption.style.fontSize = '11px';     // Example: smaller font size
                            // or
                            caption.classList.add('small-text'); // Example: add CSS class controlling size
                            } 
                            if (caption.textContent.length > maxChars3 && caption.textContent.length <= maxChars3) {
                            // Text is longer than limit — apply a certain style or class
                            caption.style.fontSize = '10.5px';     // Example: smaller font size
                            // or
                            caption.classList.add('small-text'); // Example: add CSS class controlling size
                            } 
                            if (caption.textContent.length > maxChars3) {
                            // Text is longer than limit — apply a certain style or class
                            caption.style.fontSize = '10px';     // Example: smaller font size
                            // or
                            caption.classList.add('small-text'); // Example: add CSS class controlling size
                            } else {
                            // Reset or apply default style
                            caption.style.fontSize = '14px';
                            caption.classList.remove('small-text');
                            }
                            
                            // Set to last fitting size
                            //caption.style.maxHeight = '10%'; // Add some space between icon and caption
                            cont.appendChild(caption);

                            // Append this icon container to the row
                            row_cont.appendChild(cont);

                            // Adjust the <svg>'s viewBox to fit the icon neatly
                           
                            body.style.display = "block"; // temporarily force visible
                            requestAnimationFrame(() => {
                                const bbox = key.getBBox();
                                svgClone.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
                                renderedIcons++;
                                console.log(`Rendered icon: ${currIcon}, total rendered: ${renderedIcons}`);
                                if (renderedIcons === iconIds.length) {
                                    body.style.display = "none"; // only hide once ALL icons are done
                                } 
                            });

                        }
                    idx++; // Move to next icon
                    }
                }
                // Apply margin fix for outer container and append the row
                //body.style.marginLeft = '-1.5%';
                body.appendChild(row_cont);
            }       
            
            accordionWrapper.appendChild(body);
            outer_cont.appendChild(accordionWrapper);
            outer_cont.style.maxWidth = "95%";

            header.addEventListener("click", () => {
                const current = document.getElementById(header.getAttribute("data-target"));
                const isVisible = current.style.display === "block";
                current.style.display = isVisible ? "none" : "block";
            });
        });
    }

    /**
     * Builds the responsive grid layout of icons using a Bootstrap-style grid.
     * For each icon, clones the appropriate layer (standard or mobile), wraps it in a mini <svg>,
     * and adds it to a <div> container with caption text.
     */
    function updateLayout(numCols, numRows) {

        // Select and clear the container that will hold all icon rows
        let outer_cont = document.querySelector("body > div.container-fluid");
        outer_cont.innerHTML = '';

        if (scene_toc_style === "accordion" || scene_toc_style === "sectioned_list") {
            const groupedIcons = groupIconsBySection(iconsArr);
            buildAccordionLayout(groupedIcons, numCols, numRows);
            return;
        }

        if (scene_toc_style === "" || scene_toc_style === "list") {

            orderedIcons = getSortedIconsArr(iconsArr);
            let idx = 0; // Index of current icon in iconsArr
            // Create the grid rows
            for (let i = 0; i < numRows; i++) {
                let row_cont = document.createElement("div");
                row_cont.classList.add("row", "flex-wrap", "justify-content-center");
                row_cont.setAttribute("id", `row-${i}`);

                // Create the columns in each row
                for (let j = 0; j < numCols; j++) {
                    if (idx < orderedIcons.length) {
                        // Create a Bootstrap column container for each icon
                        let cont = document.createElement("div");
                        cont.classList.add("col-4");
                        cont.style.paddingBottom = '10px';
                        cont.style.paddingTop = '20px';
                        cont.style.fontWeight = 'bold'; 
                        cont.style.border = '1px solid #000';
                        cont.style.paddingLeft = '5px';
                        cont.style.paddingRight = '5px';
                        cont.style.background = instance_color_settings["instance_mobile_tile_background_color"]; 
                        cont.style.color = instance_color_settings["instance_mobile_tile_text_color"]; 

                        // Create a blank SVG container
                        let svgClone = document.createElementNS("http://www.w3.org/2000/svg", "svg");
                        svgClone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
                        svgClone.setAttribute('xmlns:xlink', 'http://www.w3.org/1999/xlink');
                        cont.appendChild(svgClone);

                        // Identify the current icon ID
                        let currIcon = orderedIcons[idx];
                        let key;

                        // If there is no mobile layer, use the default icon layer
                        if (!has_mobile_layer(mobile_icons, currIcon)) {
                            key = svgElement.querySelector(`#${currIcon}`).cloneNode(true);
                        } else {
                            // Try to get the mobile-specific version of the icon
                            const currIconMobile = currIcon + "-mobile";
                            const mobileLayerElement = get_mobile_layer(mobile_icons, currIconMobile);

                            if (mobileLayerElement) {
                                key = mobileLayerElement.cloneNode(true);
                            } else {
                                console.warn(`Mobile layer for ${currIcon} expected but not found. Using default.`);
                                key = svgElement.querySelector(`#${currIcon}`).cloneNode(true);
                            }
                        }

                        if (!key) {
                            console.error(`Could not find SVG element for icon: ${currIcon}`);
                            continue; // Skip rendering if the icon couldn't be found
                        }
                        // Set a unique ID for the container
                        cont.setAttribute("id", `${currIcon}-container`);

                        // Add shared <defs> and icon content to the new SVG
                        svgClone.append(defs.cloneNode(true));
                        svgClone.append(key);


                        // Add a caption below the icon using child_obj data
                        let caption = document.createElement("div");
                        if (child_obj[currIcon]) {
                            caption.innerText = child_obj[currIcon].title;
                        } else {
                            caption.innerText = "not in wp yet, have to add";
                        }
                        caption.style.fontSize = "14px";
                        caption.style.paddingBottom = '10px';
                        cont.appendChild(caption);

                        // Append this icon container to the row
                        row_cont.appendChild(cont);

                        // Adjust the <svg>'s viewBox to fit the icon neatly
                        setTimeout(() => {
                            let bbox = key.getBBox(); 
                            svgClone.setAttribute('viewBox', `${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`);
                        }, 0);

                        idx++; // Move to next icon
                    }
                }
                // Apply margin fix for outer container and append the row
                //outer_cont.style.marginLeft = '-1.5%';
                outer_cont.appendChild(row_cont);
            }
        }
    }

    /**
     * Dynamically sets the number of columns and rows depending on screen orientation.
     * It also updates layout and adjusts styling for elements on landscape vs portrait.
     */
    function updateNumCols() {
        console.log("updateNumCols fired (debounced)");

        let numCols;
        let numRows;

        // Default style values for portrait
        let ogMobViewImage = 'transform: scale(0.3); margin-right: 65%; margin-top: -70%; margin-bottom: -70%';
        let ogSceneFluid = 'margin-top: 70%;'; //margin-left: -1.5%;
        let colmd2 = document.querySelector("#title-container > div > div.col-md-2");
        let ogColmd2 = colmd2.getAttribute("style", "");

        // === LANDSCAPE MODE ===
        if (window.innerWidth > window.innerHeight) {
            numCols = 4;

            document.querySelector("#mobile-view-image").setAttribute("style", "transform: scale(0.5); margin-right: 35%; margin-top: -23%");
            document.querySelector("#scene-fluid").setAttribute("style", "margin-top: 25%; display: block"); //margin-left: -1.5%;
            document.querySelector("#title-container > div > div.col-md-2").setAttribute("style", "width: 100%");
            document.querySelector("#mobileModal > div").setAttribute("style", "z-index: 9999;margin-top: 5%;max-width: 88%;");
            document.querySelector("#myModal > div").setAttribute("style", "z-index: 9999;margin-top: 5%;max-width: 88%;");

        // === PORTRAIT MODE ===
        } else {
            numCols = 3;

            const mobViewImage = document.querySelector("#mobile-view-image");
            mobViewImage.setAttribute("style", ''); // Clear
            mobViewImage.setAttribute("style", ogMobViewImage);

            const sceneFluid = document.querySelector("#scene-fluid");
            sceneFluid.setAttribute("style", '');
            sceneFluid.setAttribute("style", ogSceneFluid);

            colmd2.setAttribute("style", '');
            colmd2.setAttribute("style", ogColmd2);

            document.querySelector("#mobileModal > div").setAttribute("style", "z-index: 9999;margin-top: 5%;max-width: 88%;");
            document.querySelector("#myModal > div").setAttribute("style", "z-index: 9999;margin-top: 5%;max-width: 88%;");
        }

        // Calculate the number of rows based on icon count
        numRows = Math.ceil(iconsArr.length / numCols);

        // Apply the layout update
        updateLayout(numCols, numRows);
        add_modal(); // Reattach modals (tooltip/dialog logic)
    }

    // === Initial Setup ===
    updateNumCols(); // Build layout based on current orientation

    // === Listen for window resizes (debounced) ===
    const debouncedUpdateNumCols = debounce(updateNumCols, 250);
    window.addEventListener("resize", debouncedUpdateNumCols);
}



/**
 * Handles the visibility and styling of icons within an SVG element based on their association with modals.
 * 
 * This function applies specific behaviors to "orphaned" icons (icons not associated with any modal)
 * based on the `scene_orphan_icon_action` and `scene_orphan_icon_color` properties from the `scene_data` object.
 * It also adds a tooltip to orphaned icons when hovered.
 * 
 * @param {SVGElement} svgElement - The SVG element containing the icons to be processed.
 * @param {string[]} visible_modals - An array of modal IDs associated with the icons.
 * 
 * Behavior:
 * - Resets styles for all top-level icons.
 * - Applies specific styles or behaviors to orphaned icons based on the `scene_orphan_icon_action`:
 *   - `"hide"`: Hides the icon by setting its opacity to 0 and disabling pointer events.
 *   - `"translucent"`: Makes the icon partially transparent by setting its opacity to 0.25.
 *   - `"color"`: Changes the fill color of the icon to the value specified in `scene_orphan_icon_color`.
 *   - Default: Logs a warning for unknown modes.
 * - Adds a tooltip to orphaned icons with the message "Not currently available" when hovered.
 * 
 * Notes:
 * - Only top-level icons (direct children of the `g#icons` group) are processed.
 * - The function assumes the presence of a global `scene_data` object with the required properties.
 * 
 * Example Usage:
 * ```javascript
 * const svgElement = document.querySelector('svg#mySvg');
 * const associatedModals = ['modal1', 'modal2'];
 * handleIconVisibility(svgElement, associatedModals);
 * ```
 */
//original code is documented in issue #243 https://github.com/ioos/sanctuarywatch/issues/243
function handleIconVisibility(svgElement, visible_modals) {
    if (!svgElement || !Array.isArray(visible_modals)) return;

    const modalSet = new Set(visible_modals);
    const mode = scene_data['scene_orphan_icon_action'];
    const fill_color = scene_data['scene_orphan_icon_color'];

    // Inkscape-compatible: detect top-level icon groups (layers or <g id> inside #icons)
    let topLevelIcons = [];

    const iconGroup = svgElement.querySelector('g#icons');
    if (iconGroup) {
        topLevelIcons = Array.from(iconGroup.children)
            .filter(el => el.tagName === 'g' && el.id)
            .map(el => el.id);
    } else {
        // Fallback: treat all Inkscape layers as top-level icons
        topLevelIcons = Array.from(svgElement.querySelectorAll('g[id]'))
            .filter(el => el.getAttribute('inkscape:groupmode') === 'layer')
            .map(el => el.id);
    }

    svgElement.querySelectorAll("g[id]").forEach(icon => {
        const iconId = icon.id;
        if (!topLevelIcons.includes(iconId)) return;

        const isAssociated = modalSet.has(iconId);

        // Reset styles
        icon.style.opacity = "";
        icon.style.display = "";
        icon.style.pointerEvents = "";
        icon.querySelectorAll("*").forEach(el => {
            el.style.fill = "";
        });

        if (mode === "visible" || isAssociated) return;

        // Apply orphan style
        switch (mode) {
            case "hide":
                icon.style.opacity = "0";
                icon.style.pointerEvents = "none";
                break;
            case "translucent":
                icon.style.opacity = "0.25";
                break;
            case "color":
                icon.querySelectorAll("*").forEach(el => {
                    el.style.fill = fill_color;
                });
                break;
            default:
                console.warn("Unknown orphan icon mode:", mode);
        }

        // Tooltip listeners
        if (!icon.dataset.tooltipBound) {
            icon.addEventListener("mouseenter", function (e) {
                const tooltip = document.createElement("div");
                tooltip.className = "icon-tooltip";
                tooltip.textContent = "Not currently available";
                tooltip.style.position = "absolute";
                tooltip.style.padding = "6px 10px";
                tooltip.style.backgroundColor = "#333";
                tooltip.style.color = "#fff";
                tooltip.style.borderRadius = "4px";
                tooltip.style.fontSize = "13px";
                tooltip.style.pointerEvents = "none";
                tooltip.style.zIndex = "9999";
                tooltip.style.top = e.pageY + 10 + "px";
                tooltip.style.left = e.pageX + 10 + "px";
                tooltip.id = "orphanIconTooltip";
                document.body.appendChild(tooltip);
            });

            icon.addEventListener("mousemove", function (e) {
                const tooltip = document.getElementById("orphanIconTooltip");
                if (tooltip) {
                    tooltip.style.top = e.pageY + 10 + "px";
                    tooltip.style.left = e.pageX + 10 + "px";
                }
            });

            icon.addEventListener("mouseleave", function () {
                const tooltip = document.getElementById("orphanIconTooltip");
                if (tooltip) tooltip.remove();
            });

            // Mark as bound to avoid duplicate tooltips
            icon.dataset.tooltipBound = "true";
        }
    });
}


// Below is the function that will be used to include SVGs within each scene

/**
 * Accesses the SVG image for the scene, checks type of device, renders appropriate scene layout by calling other helper functions. 
 * all of the top-level helper functions that render different elements of the DOM are called within here. 
 * based on link_svg from infographiq.js
 *
 * @param {string} url - The URL of the SVG to be fetched, provided from the PHP backend.
 * @param {string} containerId - The ID of the DOM element to which the SVG will be appended.
 * @returns {void} `void` - Modifies the DOM but does not return any value.
 * @throws {Error} - Throws an error if the network response is not OK or if the SVG cannot be fetched or parsed.
 */
async function loadSVG(url, containerId) {
    try {
        // Step 1: Fetch the SVG content
        //console.log(url);
        const response = await fetch(url);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }


        // Step 2: Parse the SVG content
        const svgText = await response.text();
        let svgDoc;
        let svgElement;
        
        // // Check if the SVG contains Inkscape-specific attributes
        // if (svgText.includes("inkscape:label") || svgText.includes("inkscape:groupmode")) {
        //     console.log("Inkscape is detected");

        //     // 1) Remove inkscape:groupmode only (do not consume rest of the tag)
        //     const applyRule1 = svgText.replace(/\s+inkscape:groupmode="layer"(?=\s|>)/g, "");

        //     // 2) If id==label → keep id; else set id to label. Drop the label either way.
        //     const applyRule2 = applyRule1.replace(
        //         /id="([^"]+)"\s+inkscape:label="([^"]+)"/g,
        //         (_, idValue, labelValue) => (idValue === labelValue ? `id="${idValue}"` : `id="${labelValue}"`)
        //     );

        //     const parser = new DOMParser();
        //     svgDoc = parser.parseFromString(applyRule2, "image/svg+xml");
        // } else {
        //     const parser = new DOMParser();
        //     svgDoc = parser.parseFromString(svgText, "image/svg+xml");
        // }

        const parser = new DOMParser();
        svgDoc = parser.parseFromString(svgText, "image/svg+xml");

        // Assign (don’t redeclare)
        svgElement = svgDoc.documentElement;
        svgElement.setAttribute("id", "svg-elem");

        const container = document.getElementById(containerId);
        container.appendChild(svgElement);
      
        // checking if user device is touchscreen
        if (is_touchscreen()){
            if (is_mobile() && (deviceDetector.device != 'tablet')){ //a phone and not a tablet; screen will be its own UI here

                //smaller image preview here for mobile
                let fullImgCont = document.querySelector("#mobile-view-image");
                
                let titleRowCont = document.querySelector("#title-container > div");
                titleRowCont.style.display = "flex";
                titleRowCont.style.justifyContent = "center";
                titleRowCont.style.alignItems = "center";
                
                let sceneButton = document.createElement("button");
                sceneButton.innerHTML = "<strong>View Full Scene</strong>";
                sceneButton.setAttribute("style", "margin-top: 16px; max-width: 79%; border-radius: 10px; padding: 10px");
                sceneButton.setAttribute("class", "btn ");
                sceneButton.setAttribute("class", "ViewSceneButton");
                sceneButton.setAttribute("data-toggle", "modal");

                titleRowCont.appendChild(sceneButton);
                let svgElementMobileDisplay = svgElement.cloneNode(true);
                svgElementMobileDisplay.style.height = '10%';
                svgElementMobileDisplay.style.width = '100%';

              
                let modal = document.getElementById("mobileModal");
                let modalBody = document.querySelector("#mobileModal > div > div > div.modal-body")
                modalBody.appendChild(svgElementMobileDisplay);

                sceneButton.onclick = function() {
                    modal.style.display = "block";
                  }
                  
                  
                  // When the user clicks anywhere outside of the modal, close it
                window.onclick = function(event) {
                    if (event.target == modal) {
                      modal.style.display = "none";
                      history.pushState("", document.title, window.location.pathname + window.location.search);
                    }
                  }
                // let closeButton = document.querySelector("#mobileModal > div > div > div.modal-footer > button");
                let closeButton = document.querySelector("#close1");
                closeButton.onclick = function() {
                      modal.style.display = "none";
                      history.pushState("", document.title, window.location.pathname + window.location.search);
                  }
        
                mobileBool = true;
                const iconsElement = svgElement.getElementById("icons");
                //fix here
                let mobileIcons = null;
                if (svgElement.getElementById("mobile")){
                    mobileIcons = svgElement.getElementById("mobile").cloneNode(true);
                } 

                const iconsArr =  Object.keys(child_obj);
                mobile_helper(svgElement, iconsArr, mobileIcons);
                
            } else{ //if it gets here, device is a tablet
                //hide mobile icons
                
                // remove_outer_div();
                window.addEventListener('load', function() {
                    let mob_icons = document.querySelector("#mobile");
                    if (mob_icons) {
                        mob_icons.setAttribute("display", "none");
                    }
                });
                
                handleIconVisibility(svgElement, visible_modals);
                container.appendChild(svgElement);
                toggle_text();
                full_screen_button('svg1');
                if (scene_toc_style === "list"){
                    list_toc();
                } else {
                    table_of_contents();
                }               
                add_modal();
                flicker_highlight_icons();
            }
        }
        else{ //device is a PC
            //hide mobile icons
            window.addEventListener('load', function() {
                let mob_icons = document.querySelector("#mobile");
                if (mob_icons) {
                    mob_icons.setAttribute("display", "none");
                }
            });
            try {
                handleIconVisibility(svgElement, visible_modals);
            }
            catch (error) {
                console.error('Error handling icon visibility:', error);
            }
            
            container.appendChild(svgElement);
            highlight_icons();
 
            toggle_text();
            full_screen_button('svg1');
            if (scene_toc_style === "list"){
                list_toc();
            } else {
                table_of_contents();
            }               
            add_modal();
        }

    } catch (error) {
        console.error('Error fetching or parsing the SVG:', error);
    }
}


//highlight items on mouseover, remove highlight when off; 
//CHANGE HERE FOR TABLET STUFF

/**
 * Adds hover effects to SVG elements based on `child_obj` keys, meant for PC layout. 
 * Highlights the icon by changing its stroke color and width on mouseover, 
 * using section-specific colors if enabled, and resets the style on mouseout.
 *
 * @returns {void} - `void` Modifies DOM element styles in place.
 */
function highlight_icons() {
    for (let key in child_obj) {
        let elem = document.querySelector('g[id="' + key + '"]');
        elem.addEventListener('mouseover', function (e) {

            let elemCollection = elem.querySelectorAll("*");
            let hoverColor;
            let hoverTextColor;   

            elemCollection.forEach(subElem => {
                if (scene_same_hover_color_sections !== "yes" && sectionObj[key] !== "None") {
                    let section_name = child_obj[key].original_name;
                    let section_num = child_obj[key].section_name;
                    let this_scene_section = `scene_section${section_num}`;
                    let this_color = `scene_section_hover_color${section_num}`;
                    let text_color = `scene_section_hover_text_color${section_num}`;
                    hoverColor = scene_data[this_scene_section][this_color];
                    hoverTextColor = scene_data[this_scene_section][text_color];
                    subElem.style.stroke = hoverColor;
                } else {
                    hoverColor = scene_default_hover_color;
                    hoverTextColor = scene_default_hover_text_color;
                    subElem.style.stroke = hoverColor;
                }

                subElem.style.strokeWidth = "3px";
            });

            // Create and show the tooltip box
            const tooltip = document.createElement("div");
            tooltip.className = "hover-key-box";
            tooltip.textContent = child_obj[key].title;
            tooltip.style.position = "absolute";
            tooltip.style.padding = "5px 10px";
            tooltip.style.backgroundColor = hoverColor;
            tooltip.style.color = hoverTextColor;
            tooltip.style.borderRadius = "4px";
            tooltip.style.fontSize = "14px";
            tooltip.style.pointerEvents = "none";
            tooltip.style.zIndex = "9999";
            tooltip.id = "hoverKeyTooltip";
            document.body.appendChild(tooltip);

            // Initial position
            moveTooltip(e, elem, tooltip);
        });

        elem.addEventListener('mousemove', function (e) {
            const tooltip = document.getElementById("hoverKeyTooltip");
            if (tooltip) {
                moveTooltip(e, elem, tooltip);
            }
        });

        elem.addEventListener('mouseout', function () {
            let elemCollection = elem.querySelectorAll("*");
            elemCollection.forEach(subElem => {
                subElem.style.stroke = "";
                subElem.style.strokeWidth = "";
            });

            // Remove the tooltip
            const tooltip = document.getElementById("hoverKeyTooltip");
            if (tooltip) {
                tooltip.remove();
            }
        });
    }

    function moveTooltip(e, elem, tooltip) {
        const svg = elem.closest('svg');
        if (!svg) return;

        const svgRect = svg.getBoundingClientRect();
        const svgMidX = svgRect.left + (svgRect.width / 2);

        if (e.pageX > svgMidX) {
            // On the right half: show tooltip to the left
            tooltip.style.left = (e.pageX - tooltip.offsetWidth - 15) + "px";
        } else {
            // On the left half: show tooltip to the right
            tooltip.style.left = (e.pageX + 15) + "px";
        }
        tooltip.style.top = (e.pageY + 10) + "px";
    }
}


/**
 * Adds flicker effects to SVG elements based on `child_obj` keys, meant for tablet layout. 
 * Icons flicker their corresponding color on a short time interval
 * using section-specific colors if enabled
 * 
 * @returns {void} - `void` Modifies DOM element styles in place.
 */
function flicker_highlight_icons() {
    for (let key in child_obj) {
        let elem = document.querySelector('g[id="' + key + '"]');
        if (elem) {
            // Add transition for smooth fading

            elem.style.transition = 'stroke-opacity 1s ease-in-out';
            
            // Initial state
            if (scene_same_hover_color_sections != "yes" && sectionObj[key]!="None"){ //this should be done on the SCENE side of things, will havet o bring this back
                let section_name = sectionObj[key];
                let section_num = section_name.substring(section_name.length - 1, section_name.length);

                let this_color = `scene_section_hover_color${section_num}`;
                let text_color = `scene_section_hover_text_color${section_num}`;
                elem.style.stroke = scene_data[sectionObj[key]][this_color];
                } else {
                    elem.style.stroke = scene_default_hover_color;
                }

            elem.style.strokeWidth = "3";
            elem.style.strokeOpacity = "0";

            // Create flickering effect
            let increasing = true;
            setInterval(() => {
                if (increasing) {
                    elem.style.strokeOpacity = "0.5";
                    increasing = false;
                } else {
                    elem.style.strokeOpacity = "0";
                    increasing = true;
                }
            }, 1800); // Change every 1 second
        }
    }
}

/**
 * Checks if the device being used is touchscreen or not. 
 * @returns {boolean} `True` if touchscreen else `False`.
 */
function is_touchscreen(){
    //check multiple things here: type of device, screen width, 
    return ( 'ontouchstart' in window ) || 
           ( navigator.maxTouchPoints > 0 ) || 
           ( navigator.msMaxTouchPoints > 0 );
    
}

/**
 * Checks if the device being used is a mobile device or not.
 * Checks operating system and screen dimensions
 * @returns {boolean} `True` if mobile else `False`.
 */
function is_mobile() {
    return (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) 
           && (window.innerWidth < 512 || window.innerHeight < 512);
           //(window.innerWidth <= 512 && 'ontouchstart' in window);
}

/**
 * A utility object from the internet for detecting the user's device type based on the user agent string.
 * Helper function from the internet; using it to check type of device. 
 * Properties:
 * - `device` {string}: The detected device type ('tablet', 'phone', or 'desktop').
 * - `isMobile` (boolean): Indicates if the device is mobile (true for 'tablet' or 'phone', false for 'desktop').
 * - `userAgent` (string): The user agent string in lowercase.
 * 
 * Methods:
 * - `detect(s)`: Detects the device type from the user agent string `s` (or the current user agent if not provided).
 *     - @returns {string} - The detected device type ('tablet', 'phone', or 'desktop').
 */
var deviceDetector = (function ()
{
  var ua = navigator.userAgent.toLowerCase();
  var detect = (function(s)
  {
    if(s===undefined)s=ua;
    else ua = s.toLowerCase();
    if(/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(ua))
                return 'tablet';
          else
      if(/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(ua))            
                    return 'phone';
                else return 'desktop';
    });
    return{
        device:detect(),
        detect:detect,
        isMobile:((detect()!='desktop')?true:false),
        userAgent:ua
    };
}());
 

//creates an accordion item w/custom IDs based on input
/**
 * Creates and returns a fully structured Bootstrap accordion item with a header, button, and collapsible content.
 * Called in scenarios where accordion needs to be created - within `render_modal` (for modal info and modal images), `make_scene_elements` (for scene info and scene photo accordions), and `make_title' (for mobile tagline)
 *
 * @param {string} accordionId - The unique ID for the accordion item.
 * @param {string} headerId - The unique ID for the accordion header.
 * @param {string} collapseId - The unique ID for the collapsible section.
 * @param {string} buttonText - The text to display on the accordion button.
 * @param {string} collapseContent - The content to display within the collapsible section.
 * 
 * @returns {HTMLElement} `accordionItem` The complete accordion item containing the header, button, and collapsible content.
 */
function createAccordionItem(accordionId, headerId, collapseId, buttonText, collapseContent) {
    // Create Accordion Item
    let accordionItem = document.createElement("div");
    accordionItem.classList.add("accordion-item");
    accordionItem.setAttribute("id", accordionId);

    // Create Accordion Header
    let accordionHeader = document.createElement('h2');
    accordionHeader.classList.add("accordion-header");
    accordionHeader.setAttribute("id", headerId);

    // Create Accordion Button
    let accordionButton = document.createElement('button');
    accordionButton.classList.add('accordion-button', 'collapsed'); // Add 'collapsed' class
    accordionButton.setAttribute("type", "button");
    accordionButton.setAttribute("data-bs-toggle", "collapse");
    accordionButton.setAttribute("data-bs-target", `#${collapseId}`);
    accordionButton.setAttribute("aria-expanded", "false");
    accordionButton.setAttribute("aria-controls", collapseId);
    accordionButton.innerHTML = buttonText;

    // Append Button to Header
    accordionHeader.appendChild(accordionButton);

    // Create Accordion Collapse
    let accordionCollapse = document.createElement('div');
    accordionCollapse.classList.add("accordion-collapse", "collapse");
    accordionCollapse.setAttribute("id", collapseId);
    accordionCollapse.setAttribute("aria-labelledby", headerId);

    // Create Accordion Collapse Body
    let accordionCollapseBody = document.createElement('div');
    accordionCollapseBody.classList.add("accordion-body");
    accordionCollapseBody.innerHTML = collapseContent;

    // Append Collapse Body to Collapse
    accordionCollapse.appendChild(accordionCollapseBody);

    // Append Header and Collapse to Accordion Item
    accordionItem.appendChild(accordionHeader);
    accordionItem.appendChild(accordionCollapse);

    return accordionItem;
}

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
    let postID = info_obj["postID"];
    let figureType = info_obj["figureType"];
    let title = info_obj['figureTitle'];
    let targetId = `javascript_figure_target_${postID}`;
    let plotlyDivID = `plotlyFigure${postID}`;
    let interactive_arguments = info_obj["figure_interactive_arguments"];
    console.log('interactive_arguments', interactive_arguments);

    async function waitForElementByIdPolling(id, timeout = 10000, interval = 100) {
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

                async function waitForPlotlyDiv(plotlyDivID, retries = 20, interval = 250) {
                    for (let i = 0; i < retries; i++) {
                        const el = document.getElementById(plotlyDivID);
                        if (el) return el;
                        await new Promise(resolve => setTimeout(resolve, interval));
                        await producePlotlyLineFigure(targetId, interactive_arguments, postID);
                    }
                    throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
                }

                try {

                    await waitForElementByIdPolling(targetId, 1000);
                    await producePlotlyLineFigure(targetId, interactive_arguments, postID);
                    await waitForPlotlyDiv(plotlyDivID);
                    adjustPlotlyLayoutForMobile(postID);
                    //console.log('RIP - PLOT1', postID);
                    

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

                 async function waitForPlotlyDiv(plotlyDivID, retries = 20, interval = 250) {
                    for (let i = 0; i < retries; i++) {
                        const el = document.getElementById(plotlyDivID);
                        if (el) return el;
                        await new Promise(resolve => setTimeout(resolve, interval));
                        await producePlotlyBarFigure(targetId, interactive_arguments, postID);
                    }
                    throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
                }

                try {

                    await waitForElementByIdPolling(targetId, 1000);
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

                 async function waitForPlotlyDiv(plotlyDivID, retries = 20, interval = 250) {
                    for (let i = 0; i < retries; i++) {
                        const el = document.getElementById(plotlyDivID);
                        if (el) return el;
                        await new Promise(resolve => setTimeout(resolve, interval));
                        await producePlotlyMap(targetId, interactive_arguments, postID);
                    }
                    throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
                }

                try {

                    await waitForElementByIdPolling(targetId, 1000);
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
            
            figureTimeseriesGraphLoaded(title, postID, gaMeasurementID);

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
                const restURL = protocol + "//" + host  + "/wp-json/webcr/v1/media/alt-text-by-url?image_url=" + encodeURI(img.src); 
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
                figureDiv.appendChild(img);
            } else
            window.dataLayer = window.dataLayer || [];

            //Google Tags
            figureInternalImageLoaded(title, postID, gaMeasurementID); 
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
                figureDiv.appendChild(img);
            } else {}

            //Google Tags
            figureExternalImageLoaded(title, postID, gaMeasurementID);    
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
            figureCodeDisplayLoaded(title, postID, gaMeasurementID);  
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
        setupFigureScienceLinkTracking(postID);
    }
    if (info_obj['dataLink']!=''){
        setupFigureDataLinkTracking(postID);
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
        case "Code":
                img.setAttribute("style", "width: 100% !important; height: auto; display: flex; margin: 0; margin-top: 2%");
             break;
    }

}

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
    const fetchURL  =  protocol + "//" + host  + "/wp-json/wp/v2/figure?&order=asc&figure_modal=" + modal_id + "&figure_tab=" + tab_id;
    
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

/**
 * Creates and displays a full-screen button for the scene SVG element.
 * This button allows users to view scene in full screen (and escape to leave)
 *
 * @param {string} svgId - The ID of the SVG element to be made full-screen.
 * 
 * The function performs the following:
 * 1. Checks if the instance allows a full-screen button (within WP) and if the browser supports full-screen functionality.
 * 2. If supported, creates a button with appropriate attributes and prepends it to the container (`#toc-container`).
 * 3. Sets up an event listener on the SVG element to adjust its dimensions when entering or exiting full-screen mode.
 * 4. Defines the `openFullScreen` function to trigger full-screen mode for the SVG and appends a modal to it.
 * 5. Adds a click event to the button that calls the `openFullScreen` function.
 * 
 * Usage: called within load_svg
 */
function full_screen_button(svgId) {
    if (scene_full_screen_button != "yes") {
        return;
    }

    if ((document.fullscreenEnabled || document.webkitFullscreenEnabled)) {
        const svg = document.querySelector('#svg1 svg');
        const viewBox = svg.viewBox.baseVal;

        const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
        const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
        rect.setAttribute("width", "80");
        rect.setAttribute("height", "20");
        rect.setAttribute("fill", "#03386c");
        rect.setAttribute("rx", "5");

        const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
        text.textContent = "Full Screen";
        text.setAttribute("fill", "white");
        text.setAttribute("font-size", "12");
        text.setAttribute("text-anchor", "middle");
        text.setAttribute("dominant-baseline", "middle");
        text.setAttribute("x", "40");
        text.setAttribute("y", "10");

        g.appendChild(rect);
        g.appendChild(text);
        g.setAttribute("transform", `translate(${viewBox.width - 87}, 10)`);

        svg.appendChild(g);
        
        var webkitElem = document.getElementById(svgId);
        webkitElem.addEventListener('webkitfullscreenchange', (event) => {
            if (document.webkitFullscreenElement) {
                webkitElem.style.width = (window.innerWidth) + 'px';
                webkitElem.style.height = (window.innerHeight) + 'px';
            } else {
                webkitElem.style.width = width;
                webkitElem.style.height = height;
            }
        });
        
        function toggleFullScreen() {
            var elem = document.getElementById(svgId);
            if (!document.fullscreenElement && !document.webkitFullscreenElement) {
                if (elem.requestFullscreen) {
                    elem.requestFullscreen();
                } else if (elem.webkitRequestFullscreen) {
                    elem.webkitRequestFullscreen();
                }
                text.textContent = "Exit";

                let modal = document.getElementById("myModal");
                elem.prepend(modal);
            } else {
                if (document.exitFullscreen) {
                    document.exitFullscreen();
                } else if (document.webkitExitFullscreen) {
                    document.webkitExitFullscreen();
                }
                text.textContent = "Full Screen";
            }
        }

        g.addEventListener('click', toggleFullScreen);
        document.addEventListener('fullscreenchange', function() {
            if (!document.fullscreenElement) {
                text.textContent = "Full Screen";
            }
        });

        document.addEventListener('webkitfullscreenchange', function() {
            if (!document.webkitFullscreenElement) {
                text.textContent = "Full Screen";
            }
        });

        document.addEventListener('keydown', function(event) {
            if (event.key === "Escape" && (document.fullscreenElement || document.webkitFullscreenElement)) {
                text.textContent = "Full Screen";
            }
        });

    }
}

/**
 * Creates a toggle button that lets user toggle on/off the text within the scene.
 * 
 * The function performs the following:
 * 1. Checks if the instance wants the toggle button or not (within WP)
 * 2. If supported, creates a button with appropriate attributes and prepends it to the container (`#toc-container`).
 * 3. Based on the user-defined initial state of the toggle (again in WP), either sets toggle to on or off. 
 * 4. Adds a click event to the button that shows/hides text from element
 * 
 * Usage: called within load_svg
 */
function toggle_text() {
    if (scene_text_toggle == "none"){
        return;
    }

    let initialState = scene_text_toggle === "toggle_on"; //this should be done on the SCENE side of things
    let svgText = document.querySelector("#text");

    if (initialState) {
        svgText.setAttribute("display", "");
    } else {
        svgText.setAttribute("display", "None");
    }

    const svg = document.querySelector('#svg1 svg');
    // Get the SVG's viewBox
    const viewBox = svg.viewBox.baseVal;
    // Create a group element to hold our button
    const g = document.createElementNS("http://www.w3.org/2000/svg", "g");
    // Create a rect element for the button background
    const rect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    rect.setAttribute("width", "60");
    rect.setAttribute("height", "20");
    rect.setAttribute("fill", "#007bff");
    rect.setAttribute("rx", "5");
    // Create a text element for the button label
    const text = document.createElementNS("http://www.w3.org/2000/svg", "text");
    text.textContent = "Click";
    text.setAttribute("fill", "white");
    text.setAttribute("font-size", "12");
    text.setAttribute("text-anchor", "middle");
    text.setAttribute("dominant-baseline", "middle");
    text.setAttribute("x", "30");
    text.setAttribute("y", "10");

    g.appendChild(rect);
    g.appendChild(text);
    g.setAttribute("transform", `translate(${viewBox.width - 70}, 10)`);

    const toggleGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");

    const toggleRect = document.createElementNS("http://www.w3.org/2000/svg", "rect");
    toggleRect.setAttribute("width", "80");
    toggleRect.setAttribute("height", "20");
    toggleRect.setAttribute("fill", "#03386c");
    toggleRect.setAttribute("rx", "5");

    const toggleText = document.createElementNS("http://www.w3.org/2000/svg", "text");
    toggleText.setAttribute("fill", "white");
    toggleText.setAttribute("font-size", "12");
    toggleText.setAttribute("text-anchor", "middle");
    toggleText.setAttribute("dominant-baseline", "middle");
    toggleText.setAttribute("x", "40");
    toggleText.setAttribute("y", "10");
    toggleText.textContent = initialState ? "Hide Text" : "Show Text";

    toggleGroup.appendChild(toggleRect);
    toggleGroup.appendChild(toggleText);

    toggleGroup.setAttribute("transform", `translate(${viewBox.width - 87}, 35)`);
    svg.appendChild(toggleGroup);

    toggleGroup.addEventListener('click', function() {
        if (svgText.getAttribute("display") === "none") {
            svgText.setAttribute("display", "");
            toggleText.textContent = "Hide Text";
        } else {
            svgText.setAttribute("display", "none");
            toggleText.textContent = "Show Text";
        }
    });
}


/**
 * Creates a sectioned list table of contents that is organized based on the user-defined sections in WP for any given scene.
 * This function generates sections dynamically and organizes them in a color-coded way
 * 
 * The function:
 * 1. Extracts unique section names from the `section_name` property of each object in `child_obj`.
 * 2. Sorts the sections and assigns each section a color from the `colors` array. Ensures that consecutive sections don't have the same color.
 * 3. Builds a sectioned table of contents, where each section name is a header and below are its icons,  styled with its assigned color.
 * 4. Appends the generated TOC structure to the `#toc-container` element in the DOM.
 * 
 * @returns {void} - The function modifies the DOM by adding a dynamically generated TOC.
 * 
 * Usage: 
 * called in table_of_contents, if user has selected sectioned list option in WP
 */
function sectioned_list(){

    let sections = [];
    for (let key in child_obj) {
        let section = child_obj[key]['section_name'];

        if (!sections.includes(section) && section!='None') {
            sections.push(section);
        }
        sectionObj[key] = section;
    }
    sections.sort();
    sections.push('None');

    let toc_container = document.querySelector("#toc-container");
    let toc_group = document.createElement("div");

    toc_group.setAttribute("id", "toc-group");

    for (let i = 0; i < sections.length; i++) {

        let sect = document.createElement("div");

        let heading = document.createElement("h5");
        heading.setAttribute("id", `heading${i}`);
        if (sections[i] != "None" && scene_data['scene_same_hover_color_sections'] == "no"){

            heading.innerHTML = scene_data[`scene_section${sections[i]}`][`scene_section_title${i+1}`];
            let color =  scene_data[`scene_section${sections[i]}`][`scene_section_hover_color${i+1}`];
            heading.style.backgroundColor = hexToRgba(color, 0.2);
            heading.style.color = 'black';
            heading.style.display = 'inline-block';
            heading.style.padding = '0 5px';
        }
        if (sections[i] != "None" && scene_data['scene_same_hover_color_sections'] == "yes"){
            // heading.innerHTML = sections[i];

            heading.innerHTML = scene_data[`scene_section${sections[i]}`][`scene_section_title${i+1}`];
            let color =  scene_default_hover_color;
            heading.style.backgroundColor = hexToRgba(color, 0.2);
            heading.style.color = 'black';
            heading.style.display = 'inline-block';
            heading.style.padding = '0 5px';
        }
        if (sections[i] == "None"){
            heading.innerHTML = 'No Section';
            let color = scene_default_hover_color;
            heading.style.backgroundColor = hexToRgba(color, 0.2);
            heading.style.color = 'black';
            heading.style.display = 'inline-block';
        }   
        else {
            //use the section above in here to put it back the way it was before.
        }

        sect.appendChild(heading);

        let tocCollapse = document.createElement("div");

        let tocbody = document.createElement("div");

        let sectlist = document.createElement("ul");
        sectlist.setAttribute("id", sections[i]);
        sectlist.setAttribute("style", `color: black`);


        tocbody.appendChild(sectlist);
        tocCollapse.appendChild(tocbody);

        sect.appendChild(tocCollapse);
        toc_group.appendChild(sect);
    }
    toc_container.appendChild(toc_group);
}

/**
 * Creates a collapsible table of contents that is organized based on the user-defined sections in WP for any given scene.
 * This function generates sections dynamically and organizes them in an accordion-style layout.
 * 
 * The function:
 * 1. Extracts unique section names from the `section_name` property of each object in `child_obj`.
 * 2. Sorts the sections and assigns each section a color from the `colors` array. Ensures that consecutive sections don't have the same color.
 * 3. Builds an accordion-style TOC, where each section is collapsible and styled with its assigned color.
 * 4. Appends the generated TOC structure to the `#toc-container` element in the DOM.
 * 
 * @returns {void} - The function modifies the DOM by adding a dynamically generated TOC.
 * 
 * Usage: 
 * called in table_of_contents, if user has selected sectioned list option in WP
 */
function toc_sections() {

    let sections = [];
    for (let key in child_obj) {
        let section = child_obj[key]['section_name'];
        if (!sections.includes(section) && section!='None') {
            sections.push(section);
        }
        sectionObj[key] = section;
    }
    sections.sort();
    sections.push('None');

    let toc_container = document.querySelector("#toc-container");
    let toc_group = document.createElement("div");
    toc_group.classList.add("accordion");
    toc_group.setAttribute("id", "toc-group");

    for (let i = 0; i < sections.length; i++) {

        let sect = document.createElement("div");
        sect.classList.add("accordion-item");
        let heading = document.createElement("h2");
        heading.classList.add("accordion-header");
        heading.setAttribute("id", `heading${i}`);
        let button = document.createElement("button");
        button.classList.add("accordion-button", "collapsed");
        button.setAttribute("type", "button");
        button.setAttribute("data-bs-toggle", "collapse");
        button.setAttribute("data-bs-target", `#toccollapse${i}`);
        button.setAttribute("aria-expanded", "false");
        button.setAttribute("aria-controls", `toccollapse${i}`);


        const title_test = scene_data?.[`scene_section${sections[i]}`]?.[`scene_section_title${i + 1}`];
        if (title_test) {
            console.log("Title found:", title_test);
        } else {
            const title_test = "None";
            console.log("Title not found:", title_test);
        }


        if (sections[i]!="None" && title_test != "None"){

            let scene_section_title = scene_data[`scene_section${sections[i]}`][`scene_section_title${i+1}`];
            console.log('scene_section_title', scene_section_title);
            if (scene_data['scene_same_hover_color_sections'] == "no" && scene_section_title != ""){
                button.innerHTML = scene_section_title;

                let scene_section_color =  scene_data[`scene_section${sections[i]}`][`scene_section_hover_color${i+1}`];
                button.style.backgroundColor = hexToRgba(scene_section_color, 0.2);
            } 
            if (scene_data['scene_same_hover_color_sections'] == "yes" && scene_section_title != ""){
                button.innerHTML = scene_section_title;
                let color =  scene_default_hover_color;
                button.style.backgroundColor = hexToRgba(color, 0.2);
            } else {}
        }

        if (sections[i]=="None" || title_test == "None"){
            button.innerHTML = 'No Section';
            let color = scene_default_hover_color;
            button.style.backgroundColor = hexToRgba(color, 0.2);

        } else {

        }
        
        let arrowSpan = document.createElement("span");
        arrowSpan.classList.add("arrow");
        button.appendChild(arrowSpan);
     
        if (sections[i].length > 20){
            arrowSpan.style.marginRight = '15%';
        } else {
            arrowSpan.style.marginRight = '63%';
        }
        

        heading.appendChild(button);
        sect.appendChild(heading);

        let tocCollapse = document.createElement("div");
        tocCollapse.setAttribute("id", `toccollapse${i}`);
        tocCollapse.classList.add("accordion-collapse", "collapse");
        tocCollapse.setAttribute("aria-labelledby", `heading${i}`);

        let tocbody = document.createElement("div");
        tocbody.classList.add("accordion-body");

        let sectlist = document.createElement("ul");
        sectlist.setAttribute("id", sections[i]);
        tocbody.appendChild(sectlist);
        tocCollapse.appendChild(tocbody);

        sect.appendChild(tocCollapse);

        toc_group.appendChild(sect); //original options creakes blank boxes
    }
    toc_container.appendChild(toc_group);
}


/**
 * Generates a Table of Contents (TOC) for a document, with links that either open modal windows or redirect to external URLs.
 * The TOC style is determined by `thisInstance.instance_toc_style`, which can be:
 *  - "accordion": Generates sections in an accordion layout.
 *  - "list": Uses a simple list layout.
 *  - "sectioned_list": Organizes content in sections based on their grouping.
 * 
 * For each TOC item:
 * - If `child_obj[key]['modal']` is true, the item will open a modal window and trigger `render_modal(key)` to load content.
 * - If `child_obj[key]['external_url']` is present, the item will link to an external URL.
 * 
 * Additional functionality includes:
 * - Mouse hover effects on associated SVG elements, highlighting sections.
 * - Event listeners for closing the modal window when clicking outside or on the close button.
 * 
 * @returns {void} - Modifies the DOM by generating TOC elements and attaching event listeners.
 * 
 * Usage:
 * Called in load_svg if user wants to show the sections
 */

function table_of_contents(){

    if (scene_toc_style == "accordion"){ //this should be done on the SCENE side of things
        toc_sections();
    } else {
        sectioned_list();
    }       
   
    for (let obj of sorted_child_objs){

        let key = obj.original_name;

        if (sectionObj[key]=="None"){

        }
        let elem = document.getElementById(child_obj[key]['section_name']);
        let item = document.createElement("li");
        let title = child_obj[key]['title'];  
        let link = document.createElement("a");
        let title_formatted = title.replace(/\s+/g, '_')
        link.setAttribute("id", title_formatted);

        let modal = child_obj[key]['modal'];
        if (modal) {
            link.setAttribute("href", `#`); //just added
            link.classList.add("modal-link"); 
            link.innerHTML = title;

            item.appendChild(link);
            item.addEventListener('click', function() {
                let modal = document.getElementById("myModal");
                modal.style.display = "block";
                render_modal(key);
            });

            let closeButton = document.getElementById("close");
            closeButton.addEventListener('click', function() {
                    
                let accordion_container = document.getElementById('accordion-container');
                accordion_container.innerHTML = '';
                if (!is_mobile()){
                    let tagline_container = document.getElementById('tagline-container');
                    tagline_container.innerHTML = '';
                }

                document.getElementById("myTabContent").innerHTML = '';

                history.pushState("", document.title, window.location.pathname + window.location.search);
        });
        window.onclick = function(event) {
            if (event.target === modal) { // Check if the click is outside the modal content

                document.getElementById('accordion-container').innerHTML = '';
                if (!is_mobile()){
                    document.getElementById('tagline-container').innerHTML = '';
                }
                document.getElementById("myTabContent").innerHTML = '';
                history.pushState("", document.title, window.location.pathname + window.location.search);
            }
        };
        }
        
        else{
            link.href = child_obj[key]['external_url'];
            link.innerHTML = title;
            item.appendChild(link);
        }


        //CHANGE HERE FOR TABLET STUFF
        link.style.textDecoration = 'none';
        
        item.addEventListener('mouseover', ((key) => {
            return function() {
                let svg_elem = document.querySelector('g[id="' + key + '"]');

                let subElements = svg_elem.querySelectorAll("*");
                subElements.forEach(subElement => {

                    if (scene_same_hover_color_sections != "yes" && child_obj[key]!="None" ){ //this should be done on the SCENE side of things, will havet o bring this back

                        let section_num = child_obj[key]['section_name'];
                        let this_color = `scene_section_hover_color${section_num}`;
                        let text_color = `scene_section_hover_text_color${section_num}`;
                        let hovercolorfullpath = scene_data[`scene_section${section_num}`][this_color];
                        let hovertextcolorfullpath = scene_data[`scene_section${section_num}`][text_color]
                        subElement.style.stroke = hovercolorfullpath;

                    } else{
                        subElement.style.stroke = scene_default_hover_color;
                    }
                    
                    subElement.style.strokeWidth = "3";

                });
            };
        })(key));

        item.addEventListener('mouseout', ((key) => {
            return function() {
                let svg_elem = document.querySelector('g[id="' + key + '"]');

                let subElements = svg_elem.querySelectorAll("*");
                subElements.forEach(subElement => {
                    subElement.style.stroke = "";
                    subElement.style.strokeWidth = "";
                });
            };
        })(key));
                
        elem.appendChild(item);
    }
}

/**
 * Generates a simple list-based Table of Contents (TOC), where items either open modal windows or link to external URLs.
 * The sections are not explicitly displayed, but their colors are used for highlighting.
 * 
 * Each TOC item:
 * - If `child_obj[key]['modal']` is true, the item will open a modal window and trigger `render_modal(key)` to load content.
 * - If `child_obj[key]['external_url']` is present, the item will link to an external URL.
 * 
 * Additional functionality:
 * - Mouse hover effects highlight associated SVG elements, using section colors if `thisInstance.instance_colored_sections` is set to "yes".
 * - Modal close event handling, including clicking outside the modal window to close it.
 * 
 * @returns {void} - Modifies the DOM by generating TOC list items and attaching event listeners.
 * 
 * Usage:
 * called in load_svg if user wants a list with no sections displayed/no sections exist
 * 
 */
function list_toc(){
    
    let sections = [];
    for (let key in child_obj) {
        let section = child_obj[key]['section_name'];
        if (!sections.includes(section)) {
            sections.push(section);
        }
        sectionObj[key] = section;
    }
    sections.sort();

    let toc_container = document.querySelector("#toc-container");
    let toc_group = document.createElement("ul");
    let colorIdx = 0;
    let i = 0;
    let item;

    for (let obj of sorted_child_objs){

        let key = obj.original_name;

        i++;

        item = document.createElement("li");
    
        let title = obj['title']; 
        let link = document.createElement("a");
        let modal = obj['modal'];
        let title_formatted = title.replace(/\s+/g, '_')
    
        if (modal) {
            link.setAttribute("href", `#`); //just added
            link.setAttribute("id",title_formatted);

            link.classList.add("modal-link");
            link.innerHTML = title;
            item.appendChild(link);
            item.addEventListener('click', ((key) => {
                return function() {
                    modal = document.getElementById("myModal");
                    modal.style.display = "block";
                    render_modal(key);
                };
            })(key));
    
            let closeButton = document.getElementById("close");
            closeButton.addEventListener('click', function() {
                let modal = document.getElementById("myModal");

                modal.style.display = "none";
                history.pushState("", document.title, window.location.pathname + window.location.search);
            });
            window.onclick = function(event) {
                if (event.target === modal) { 
                    modal.style.display = "none";
                    history.pushState("", document.title, window.location.pathname + window.location.search);

                }
            };
        } else {
            link.href = obj['external_url'];
            link.innerHTML = title;
            item.appendChild(link);
        }
    
        item.addEventListener('mouseover', ((key) => {
            return function() {
                let svg_elem = document.querySelector('g[id="' + key + '"]');

                let subElements = svg_elem.querySelectorAll("*");
                subElements.forEach(subElement => {
                    subElement.style.stroke = scene_default_hover_color;
                    subElement.style.strokeWidth = "3";
                });
            };
        })(key));

        item.addEventListener('mouseout', ((key) => {
            return function() {
                let svg_elem = document.querySelector('g[id="' + key + '"]');

                let subElements = svg_elem.querySelectorAll("*");
                subElements.forEach(subElement => {
                    subElement.style.stroke = "";
                    subElement.style.strokeWidth = "";
                });
            };
        })(key));

        toc_group.appendChild(item);
    }
    toc_container.appendChild(toc_group);
}


/**
 * Generates and handles modal windows or external URL redirects when SVG elements are clicked.
 * 
 * This function adds click event listeners to SVG elements (identified by `g[id="key"]`) from `child_obj`.
 * 
 * - If the `child_obj[key]['modal']` value is true:
 *   - Clicking the SVG element or corresponding mobile container (`#key-container`) opens a modal window.
 *   - The `render_modal(key)` function is triggered to load modal content.
 *   - Clicking outside the modal or on the close button hides the modal and clears the content.
 * 
 * - If `child_obj[key]['modal']` is false:
 *   - Clicking the SVG element redirects to the external URL specified in `child_obj[key]['external_url']`.
 *   - For mobile devices, a similar event is added to the container element (`#key-container`).
 * 
 * Modal close behavior:
 * - The modal is closed when the close button is clicked or when a click occurs outside the modal.
 * - Upon closing, various content containers are cleared, and the URL is changed back to the original scene URL
 * 
 * @returns {void} - Directly manipulates the DOM by attaching event listeners for modal display or external URL redirection.
 * 
 * Usage: 
 * Called in mobile helper, load_svg to actually add modal capabilities to scene element
 */
function add_modal(){
    for (let key in child_obj){
        let elem = document.querySelector('g[id="' + key + '"]');
        if (child_obj[key]['modal']){
            let modal = document.getElementById("myModal");
            let closeButton = document.getElementById("close");
            
            if (mobileBool){
                let itemContainer = document.querySelector(`#${key}-container`);
                itemContainer.addEventListener('click', function() {
                    modal.style.display = "block";

                    render_modal(key );

            });
            } else {
                elem.addEventListener('click', function(event) {

                    modal.style.display = "block";
                    render_modal(key );
            });
            }
            
            closeButton.addEventListener('click', function() {
                    
                    modal.style.display = "none";
                    let accordion_container = document.getElementById('accordion-container');
                    accordion_container.innerHTML = '';

                    let myTab = document.getElementById('myTab');
                    myTab.innerHTML = '';

                    let tabContentContainer = document.getElementById("myTabContent");
                    tabContentContainer.innerHTML = '';
                    history.pushState("", document.title, window.location.pathname + window.location.search);
            });
            window.onclick = function(event) {
                if (event.target === modal) { // Check if the click is outside the modal content
                    modal.style.display = "none";
                    document.getElementById('accordion-container').innerHTML = '';
                    document.getElementById('tagline-container').innerHTML = '';
                    document.getElementById('myTab').innerHTML = '';
                    document.getElementById('myTabContent').innerHTML = '';
                    history.pushState("", document.title, window.location.pathname + window.location.search);
                }
            };
    
        } else {
            elem.addEventListener('click', function(event) {    
                let link =  child_obj[key]['external_url'];
                window.location.href = link;
            });
            if (mobileBool){
                let itemContainer = document.querySelector(`#${key}-container`);
                itemContainer.addEventListener('click', function() {
                    let link =  child_obj[key]['external_url'];
                    window.location.href = link;
                });
            }
        }
    }
}

/**
 * Waits for a DOM element matching the provided selector to become available.
 * 
 * This function returns a Promise that resolves when the DOM element matching the given `selector` is found.
 * If the element is already present, it resolves immediately. If not, it uses a `MutationObserver` to detect when
 * the element is added to the DOM and then resolves the Promise.
 * 
 * @param {string} selector - The CSS selector of the DOM element to wait for.
 * @returns {Promise<Element>} - A Promise that resolves with the found DOM element.
 * 
 * Usage:
 * called within handleHashNavigation, used to wait for the rendering of the modal button. 
 */
async function waitForElement(selector) {
    return new Promise(resolve => {
        const element = document.querySelector(selector);
        if (element) {
            resolve(element);
        } else {
            const observer = new MutationObserver(() => {
                const element = document.querySelector(selector);
                if (element) {
                    observer.disconnect();
                    resolve(element);
                }
            });
            observer.observe(document.body, { childList: true, subtree: true });
        }
    });
}


/**
 * Handles hash-based URL navigation. This is for when someone goes to the link for a certain figure (.../#CASheephead/1)
 * 
 * 1. First checks if the URL has a hash, making it a figure link
 * 2. Does some string parsing stuff to clean up the URL, from which we can extract information about the scene, icon, and tab
 * 3. Updates new URL, gets necessary DOM elements through waitForElement and fires event handlers to open up figure
 * 
 * @returns {Promise<void>} - A Promise that resolves when navigation handling is complete.
 * 
 * Usage:
 * Called after init when DOMcontent loaded. 
 */
async function handleHashNavigation() {
    //maybe in here check that the scene is/is not an overview
    if (window.location.hash) {
        let tabId = window.location.hash.substring(1);

        let modalName = tabId.split('/')[0];

        tabId = tabId.replace(/\//g, '-');

        history.pushState("", document.title, window.location.pathname + window.location.search);
        let modName;
        if (is_mobile()){
            let modModal =  modalName.replace(/_/g, ' ');
            modName = child_ids_helper[modModal] + '-container';
        } else{
            modName = modalName;
        }

        let modalButton = await waitForElement(`#${modName}`);

        modalButton.click();

        let tabButton = await waitForElement(`#${tabId}`);
        tabButton.click();
    } else {

    }
}



/**
 * Fetches instance details from the WordPress REST API.
 *
 * This asynchronous function retrieves data from the WordPress REST API endpoint for instances (`/wp-json/wp/v2/instance`)
 * using the current protocol and host. The results are fetched in ascending order.
 * It handles network errors and returns the data as a JSON object.
 *
 * @returns {Promise<Object[]>} - A Promise that resolves to an array of instance objects retrieved from the API.
 * 
 * @throws {Error} - Throws an error if the fetch request fails or the response is not successful (i.e., not OK).
 * 
 * Usage: called in init function to set to global variable testData, which is used to get information about current instance, section/color information
 */
async function load_instance_details() { //this should be done on the SCENE side of things; might not need this, may replace w scene postmeta call. keep for now
    const protocol = window.location.protocol;
    const host = window.location.host;
    const fetchURL = `${protocol}//${host}/wp-json/wp/v2/instance?&order=asc`;
  
    try {
        const response = await fetch(fetchURL);
        if (!response.ok) {
            throw new Error('Network response was not ok');
        }
        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Error fetching data:', error);
        throw error;
    }
}

/**
 * Initializes the application by loading instance details, setting up the scene location, 
 * defining instance-specific settings, and rendering the SVG element.
 *
 * This asynchronous function serves as the driver for the script. It performs the following tasks:
 * 1. Fetches instance details by calling `load_instance_details()` and stores the data in a global variable.
 * 2. Determines the scene location by calling `make_title()` (which also makes the title, other scene elemsnts) and stores the result in `sceneLoc`, which is also a global variable.
 * 3. Finds the instance object corresponding to the scene location and assigns it to `thisInstance`.
 * 4. Extracts the hover colors for the instance and assigns them to a global variable `colors`.
 * 5. Calls `loadSVG(url, "svg1")` to load and render an SVG based on the provided URL.
 *
 * If any errors occur during these steps, they are caught and logged to the console.
 * 
 * @async
 * @function init
 * 
 * @throws {Error} - If fetching instance details, determining the scene location, or loading the SVG fails, an error is caught and logged.
 *
 * Usage: right below; this is essentially the driver function for the entire file, as it pretty much calls every other function inside here. 
 */
async function init() {
    try {

        sceneLoc = make_title(); //this should be done on the SCENE side of things, maybe have make_title return scene object instead
        thisInstance = sceneLoc;
        
        loadSVG(url, "svg1"); // Call load_svg with the fetched data

    } catch (error) {
        console.error('Error:', error);
    }
}

document.addEventListener("DOMContentLoaded", () => {
    init(); 
    
    handleHashNavigation();

});