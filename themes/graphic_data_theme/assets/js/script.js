let url;

// graphicDataSceneData is provided as a global by wp_localize_script on the
// public scene page. On admin pages it does not exist. Normalize to a safe
// object either way WITHOUT redeclaring the identifier (a `let`/`const`/`var`
// here would collide with the localized global on the public page).
// TRANSITIONAL: replace with getSceneData() island read in Phase 4.
window.graphicDataSceneData = window.graphicDataSceneData || {};

const isAdminEditor =
	window.location.href.includes('post.php') ||
	window.location.href.includes('post-new.php') ||
	window.location.href.includes('edit.php');

// Deep clone the childIds object to create child_obj, ensuring that modifications to child_obj do not affect the original childIds.
// This is useful for safely manipulating or filtering the child_obj data structure later in the script.
if (typeof child_obj === 'undefined') {
	var child_obj = {};
}

if (isAdminEditor) {
	graphicDataSceneData = {};
}

//Checking the page title to see if we are in admin edit mode for a scene
let adminEditTitle;
try {
	adminEditTitle = document
		.querySelector('h1.wp-heading-inline')
		?.textContent.trim();
} catch {
	adminEditTitle = 'none';
}

//Allows for declaration of child_obj variable for theme and for admin side preview mode
if (isAdminEditor) {
	child_obj = undefined;
} else {
	child_obj = JSON.parse(JSON.stringify(graphicDataSceneData.childIds));
}

// Convert the svgUrl variable to a JSON string, then extract the actual URL by removing the first two and last two characters.
// This is likely done to strip extra quotes or escape characters from the serialized string.

let url1 = {};

//Allows for declaration of url1 variable for theme and for admin side preview mode
if (isAdminEditor && adminEditTitle !== 'Edit Scene') {
	url = '';
}
if (!isAdminEditor) {
	url1 = JSON.stringify(graphicDataSceneData.svgUrl);
	url = url1.substring(2, url1.length - 2);
}

// Declare variables to hold data and state throughout the script.
// These will be assigned values later as the script loads and processes scene/instance data.
let testData; // Will hold instance data or API results
let thisInstance; // Will reference the current instance object
let thisScene; // Will reference the current scene object
let sceneLoc; // Will store the current scene location or identifier

// Initialize empty objects to store section data and section colors for the scene.
// These will be populated as the script processes scene/section information.
if (typeof sectionObj === 'undefined') {
	var sectionObj = {};
}
const sectColors = {};

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

// The lines below from step 1 through step 3 are used for organizing child_obj(of modals) when it is fed into the toc as sortedChildEntries.
// If all modals are set to 1 then it now organized alphabetically. other wise it respects the modal order.

process_child_obj();

// Step 1: get [key, value] pairs

let sortedChildEntries = {};

//Allows for declaration of url1 variable for theme and for admin side preview mode
if (isAdminEditor) {
	sortedChildEntries = null;
} else {
	sortedChildEntries = Object.entries(child_obj);
}

// Step 2: check if all modal_icon_order are 1 (or missing)
/**
 * Checks if all objects in the `sortedChildEntries` array have their `modal_icon_order` property equal to 1.
 *
 * @constant {boolean} allOrdersAreOne - A boolean indicating whether all entries satisfy the condition.
 * @param {Array}  sortedChildEntries                      - An array of entries where each entry is a tuple containing a key and an object.
 * @param {Array}  sortedChildEntries[].0                  - The key of the entry (not used in the condition).
 * @param {Object} sortedChildEntries[].1                  - The object containing the `modal_icon_order` property.
 * @param {string} sortedChildEntries[].1.modal_icon_order - The property to be checked, expected to be a string representation of a number.
 * @return {boolean} `true` if all `modal_icon_order` values are equal to 1 after parsing as integers, otherwise `false`.
 */

let allOrdersAreOne = null;

if (!isAdminEditor) {
	allOrdersAreOne = sortedChildEntries.every(
		([_, obj]) => parseInt(obj.modal_icon_order) === 1
	);
}
// Step 3: sort conditionally

try {
	if (allOrdersAreOne) {
		sortedChildEntries.sort((a, b) => {
			const titleA = a[1].title?.toLowerCase() || '';
			const titleB = b[1].title?.toLowerCase() || '';
			return titleA.localeCompare(titleB);
		});
	} else {
		sortedChildEntries.sort((a, b) => {
			return (a[1].modal_icon_order || 0) - (b[1].modal_icon_order || 0);
		});
	}
} catch {}

// Step 4: extract the objects (no keys) to match your original format
if (typeof sorted_child_objs === 'undefined') {
	var sorted_child_objs = null;
}
if (!isAdminEditor) {
	sorted_child_objs = sortedChildEntries.map(([_, val]) => val);
}

// Step 5: build childIdsHelper for title-to-key mapping
let childIdsHelper = {};
if (!isAdminEditor) {
	for (const [key, value] of sortedChildEntries) {
		childIdsHelper[value.title] = key;
	}
}

//Main Initialization of script
document.addEventListener('DOMContentLoaded', () => {
	if (!isAdminEditor) {
		init();
	}
	handleHashNavigation();
});

/**
 * This function pre-processes the `child_obj` dictionary to ensure that each element (scene icon) belongs to the 
 * current scene by checking if its scene ID matches the post ID.
 * This ensures that elements from other scenes are excluded, and keys are updated as needed to avoid duplicates.
 *
 * @returns {void} Modifies child_obj dictionary in place
 */
function process_child_obj() {
	for (const key in child_obj) {
		if (child_obj[key].scene !== parseInt(graphicDataSceneData.postId)) {
			delete child_obj[key];
		} else {
			const oldkey = String(key);
			const lastChar = oldkey.charAt(oldkey.length - 1);

			const isNumeric = /\d/.test(lastChar);

			//prevent duplicates:  For example, if there is a separate mobile icon for the icon named "whales", then in the mobile layer, that icon should be named "whales-mobile".
			if (isNumeric) {
				const newkey = child_obj[key].original_name;
				child_obj[newkey] = child_obj[key];
				delete child_obj[key];
			}
		}
	}
	//now sort by icon order
	// If you need it back as an object:
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
var deviceDetector = (function () {
	var ua = navigator.userAgent.toLowerCase();
	var detect = function (s) {
		if (isAdminEditor && admin_preview_condition_checker()) {
			return 'phone';
		}

		if (s === undefined) s = ua;
		else ua = s.toLowerCase();
		if (
			/(ipad|tablet|(android(?!.*mobile))|(windows(?!.*phone)(.*touch))|kindle|playbook|silk|(puffin(?!.*(IP|AP|WP))))/.test(
				ua
			)
		)
			return 'tablet';
		else if (
			/(mobi|ipod|phone|blackberry|opera mini|fennec|minimo|symbian|psp|nintendo ds|archos|skyfire|puffin|blazer|bolt|gobrowser|iris|maemo|semc|teashark|uzard)/.test(
				ua
			)
		)
			return 'phone';
		else return 'desktop';
	};
	return {
		device: detect(),
		detect: detect,
		isMobile: detect() != 'desktop' ? true : false,
		userAgent: ua,
	};
})();

/**
 * Waits for a DOM element matching the provided selector to become available.
 *
 * This function returns a Promise that resolves when the DOM element matching the given `selector` is found.
 * If the element is already present, it resolves immediately. If not, it uses a `MutationObserver` to detect when
 * the element is added to the DOM and then resolves the Promise.
 *
 * @param {string} selector - The CSS selector of the DOM element to wait for.
 * @return {Promise<Element>} - A Promise that resolves with the found DOM element.
 *
 * Usage:
 * called within handleHashNavigation, used to wait for the rendering of the modal button.
 */
async function waitForElement(selector) {
	return new Promise((resolve) => {
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
 * @return {Promise<void>} - A Promise that resolves when navigation handling is complete.
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

		history.pushState(
			'',
			document.title,
			window.location.pathname + window.location.search
		);
		let modName;
		if (is_mobile()) {
			let modModal = modalName.replace(/_/g, ' ');
			modName = child_ids_helper[modModal] + '-container';
		} else {
			modName = modalName;
		}

		let modalButton = await waitForElement(`#${modName}`);

		// Sometimes a <g tag is sent insteast of an <a tag. This break the way the modal loads. This is a good work around
		// if <g then change method of waiting for click, if not then proceed as normal
		if (modalButton.tagName.toLowerCase() === 'g') {
			modalButton.dispatchEvent(
				new MouseEvent('click', { bubbles: true, cancelable: true })
			);
		} else {
			modalButton.click();
		}

		let tabButton = await waitForElement(`#${tabId}`);
		tabButton.click();
	} else {
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

		loadSVG(url, 'svg1'); // Call load_svg with the fetched data
	} catch (error) {
		if (!isAdminEditor) {
			console.error('Error:', error);
		}
	}
}
