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
 
//this should bea top level function it is called in scenes and modals
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

    let sectionNoneCount = sections.filter(s => s === "None").length;


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
        if (sections[i] == "None" && sectionNoneCount > 1){
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


    let sectionNoneCount = sections.filter(s => s === "None").length;

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

        if (sectionNoneCount > 1 && sections[i]=="None" || title_test == "None"){
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