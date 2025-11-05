// Deep clone the child_ids object to create child_obj, ensuring that modifications to child_obj do not affect the original child_ids.
// This is useful for safely manipulating or filtering the child_obj data structure later in the script.
let child_obj = JSON.parse(JSON.stringify(child_ids));


// Convert the svg_url variable to a JSON string, then extract the actual URL by removing the first two and last two characters.
// This is likely done to strip extra quotes or escape characters from the serialized string.

let url1 =(JSON.stringify(svg_url));
url = url1.substring(2, url1.length - 2);


// Declare variables to hold data and state throughout the script.
// These will be assigned values later as the script loads and processes scene/instance data.
let testData;      // Will hold instance data or API results
let thisInstance;  // Will reference the current instance object
let thisScene;     // Will reference the current scene object
let sceneLoc;      // Will store the current scene location or identifier

// Initialize empty objects to store section data and section colors for the scene.
// These will be populated as the script processes scene/section information.
let sectionObj = {};
let sectColors = {};

// If the current device is NOT mobile, inject custom CSS styles for tablet/desktop layouts.
// This block creates a <style> element with specific CSS rules for elements in the 512px–768px width range,
// ensuring proper alignment and sizing for the table of contents, scene row, title container, and buttons.
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

// The lines below from step 1 through step 3 are used for organizing child_obj(of modals) when it is fed into the toc as sorted_child_entries. 
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


// Declare a variable to track if the current environment is mobile.
// Initially set to false, assuming a non-mobile environment by default.
let mobileBool = false;

//Main Initialization of script
document.addEventListener("DOMContentLoaded", () => {
    init(); 
    
    handleHashNavigation();

});


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


// THIS IS POSSIBLY DEPRECATED NOW, MAYBE DELETE LATER
// /**
//  * Fetches instance details from the WordPress REST API.
//  *
//  * This asynchronous function retrieves data from the WordPress REST API endpoint for instances (`/wp-json/wp/v2/instance`)
//  * using the current protocol and host. The results are fetched in ascending order.
//  * It handles network errors and returns the data as a JSON object.
//  *
//  * @returns {Promise<Object[]>} - A Promise that resolves to an array of instance objects retrieved from the API.
//  * 
//  * @throws {Error} - Throws an error if the fetch request fails or the response is not successful (i.e., not OK).
//  * 
//  * Usage: called in init function to set to global variable testData, which is used to get information about current instance, section/color information
//  */
// async function load_instance_details() { //this should be done on the SCENE side of things; might not need this, may replace w scene postmeta call. keep for now
//     const protocol = window.location.protocol;
//     const host = window.location.host;
//     const fetchURL = `${protocol}//${host}/wp-json/wp/v2/instance?&order=asc`;
  
//     try {
//         const response = await fetch(fetchURL);
//         if (!response.ok) {
//             throw new Error('Network response was not ok');
//         }
//         const data = await response.json();
//         return data;
//     } catch (error) {
//         console.error('Error fetching data:', error);
//         throw error;
//     }
// }

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