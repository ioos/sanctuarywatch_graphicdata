export let child_obj = {};
export let sorted_child_objs = null;
export let sectionObj = {};
export let visible_modals = [];
export let scene_data = {};

/**
 * Sets the shared child object.
 *
 * @param {Object} v The child object to store.
 * @return {void}
 */
export function setChildObj(v)        { child_obj = v; }

/**
 * Sets the sorted child object.
 *
 * @param {Object} v The sorted child object to store.
 * @return {void}
 */
export function setSortedChildObjs(v) { sorted_child_objs = v; }

/**
 * Sets the section object.
 *
 * @param {Object} v The section object to store.
 * @return {void}
 */
export function setSectionObj(k, v)   { sectionObj[k] = v; }

/**
 * Sets the visible modals object.
 *
 * @param {Object} v The visible modals to store.
 * @return {void}
 */
export function setVisibleModals(v)   { visible_modals = v; }

/**
 * Sets the scene data object.
 *
 * @param {Object} v The scene data object to store.
 * @return {void}
 */
export function setSceneData(v)       { scene_data = v; }

/**
 * Reads and parses scene data from the `#graphic-data-scene-data` DOM element.
 *
 * Expects a JSON-encoded data island rendered server-side as the text content
 * of an element with id `graphic-data-scene-data`. Returns an empty object if the
 * element is missing, empty, or contains invalid JSON.
 *
 * @return {Object} Parsed scene data, or `{}` on failure.
 */
export function getSceneData() {
    const el = document.getElementById('graphic-data-scene-data');
    if (!el || !el.textContent) return {};
    try { return JSON.parse(el.textContent); } catch { return {}; }
}

/**
 * Debounces a function, delaying its execution until after a specified wait time
 * has elapsed since the last time it was invoked.
 * @param {Function} func  The function to debounce.
 * @param {number}   delay The number of milliseconds to delay.
 * @return {Function} The new debounced function.
 */
export function debounce(func, delay) {
	let timeoutId;
	return function (...args) {
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
 * @param {string} hex     - The hex color code (e.g., "#ff0000" or "ff0000").
 * @param {number} opacity - The opacity value for the RGBA color (between 0 and 1).
 * @return {string} The RGBA color string (e.g., "rgba(255, 0, 0, 0.5)").
 *
 * @example
 * hexToRgba('#3498db', 0.7); // returns "rgba(52, 152, 219, 0.7)"
 */
export function hexToRgba(hex, opacity) {
	// Remove the hash if it's present
	hex = hex.replace(/^#/, '');

	// Parse the r, g, b values from the hex string
	const bigint = parseInt(hex, 16);
	const r = (bigint >> 16) & 255;
	const g = (bigint >> 8) & 255;
	const b = bigint & 255;

	// Return the rgba color string
	return `rgba(${r}, ${g}, ${b}, ${opacity})`;
}

//returns DOM elements for mobile layer
/**
 * Retrieves the DOM element corresponding to a specific layer in a mobile SVG structure based on its label.
 *
 * @param {HTMLElement} mob_icons - The parent DOM element that contains all child elements (icons) to search through.
 * @param {string}      elemname  - The name of the layer or icon to search for. It matches the 'inkscape:label' attribute of the child element.
 *
 * @return {HTMLElement|null} - Returns the DOM element that matches the given `elemname` in the 'inkscape:label' attribute.
 *                                If no match is found, it returns `null`.
 */
export function get_mobile_layer(mob_icons, elemname) {
	for (let i = 0; i < mob_icons.children.length; i++) {
		const child = mob_icons.children[i];
		const label = child.getAttribute('id');
		if (label === elemname) {
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
 * @return {void}
 */
export function remove_outer_div() {
	const container = document.querySelector('#entire_thing');
	while (container.firstChild) {
		document.body.insertBefore(container.firstChild, container);
	}
	container.remove();
}


/**
 * Checks if the device being used is touchscreen or not.
 * @return {boolean} `True` if touchscreen else `False`.
 */
export function is_touchscreen(){
    if (window.mobileBool) {                      // admin mobile-preview button is active
        return true;
    }
    return ('ontouchstart' in window)
        || (navigator.maxTouchPoints > 0)
        || (navigator.msMaxTouchPoints > 0);
}

//creates an accordion item w/custom IDs based on input
/**
 * Creates and returns a fully structured Bootstrap accordion item with a header, button, and collapsible content.
 * Called in scenarios where accordion needs to be created - within `render_modal` (for modal info and modal images), `make_scene_elements` (for scene info and scene photo accordions), and `make_title' (for mobile tagline)
 *
 * @param {string} accordionId     - The unique ID for the accordion item.
 * @param {string} headerId        - The unique ID for the accordion header.
 * @param {string} collapseId      - The unique ID for the collapsible section.
 * @param {string} buttonText      - The text to display on the accordion button.
 * @param {string} collapseContent - The content to display within the collapsible section.
 *
 * @return {HTMLElement} `accordionItem` The complete accordion item containing the header, button, and collapsible content.
 */
export function createAccordionItem(
	accordionId,
	headerId,
	collapseId,
	buttonText,
	collapseContent
) {
	// Create Accordion Item
	const accordionItem = document.createElement('div');
	accordionItem.classList.add('accordion-item');
	accordionItem.setAttribute('id', accordionId);

	// Create Accordion Header
	const accordionHeader = document.createElement('h2');
	accordionHeader.classList.add('accordion-header');
	accordionHeader.setAttribute('id', headerId);

	// Create Accordion Button
	const accordionButton = document.createElement('button');
	accordionButton.classList.add('accordion-button', 'collapsed'); // Add 'collapsed' class
	accordionButton.setAttribute('type', 'button');
	accordionButton.setAttribute('data-bs-toggle', 'collapse');
	accordionButton.setAttribute('data-bs-target', `#${collapseId}`);
	accordionButton.setAttribute('aria-expanded', 'false');
	accordionButton.setAttribute('aria-controls', collapseId);
	accordionButton.innerHTML = buttonText;

	// Append Button to Header
	accordionHeader.appendChild(accordionButton);

	// Create Accordion Collapse
	const accordionCollapse = document.createElement('div');
	accordionCollapse.classList.add('accordion-collapse', 'collapse');
	accordionCollapse.setAttribute('id', collapseId);
	accordionCollapse.setAttribute('aria-labelledby', headerId);

	// Create Accordion Collapse Body
	const accordionCollapseBody = document.createElement('div');
	accordionCollapseBody.classList.add('accordion-body');
	accordionCollapseBody.innerHTML = collapseContent;

	// Append Collapse Body to Collapse
	accordionCollapse.appendChild(accordionCollapseBody);

	// Append Header and Collapse to Accordion Item
	accordionItem.appendChild(accordionHeader);
	accordionItem.appendChild(accordionCollapse);

	return accordionItem;
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
export var deviceDetector = (function () {
	const isAdminEditor =
		window.location.href.includes('post.php') ||
		window.location.href.includes('post-new.php') ||
		window.location.href.includes('edit.php');

	var ua = navigator.userAgent.toLowerCase();
	var detect = function (s) {
		if (isAdminEditor && is_mobile()) {
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
 * Convert an arbitrary string into a URL/DOM-friendly “slug”.
 *
 * What it does:
 * - Converts the input to a string.
 * - Normalizes Unicode characters (splits accented characters into base + accent marks).
 * - Removes diacritic marks (accents).
 * - Lowercases the result.
 * - Trims leading/trailing whitespace.
 * - Replaces any run of non-alphanumeric characters with a single hyphen.
 * - Trims leading/trailing hyphens.
 *
 * Common uses:
 * - Generating safe IDs: `id="my-title-1"`
 * - Building URL paths: `/posts/my-title-1`
 * - Creating stable keys for maps/objects
 *
 * Notes:
 * - Output is limited to ASCII `a-z`, `0-9`, and `-`.
 * - If you need underscores instead of hyphens, change the replacement to `"_"`
 *   and adjust the trim regex accordingly.
 *
 * @param {string} str - Input text to slugify.
 * @returns {string} A slugified, lowercased, hyphen-separated string.
 *
 * @example
 * slugify("R&D 50% Off — #1!") // "r-d-50-off-1"
 * slugify("  Crème brûlée  ")  // "creme-brulee"
 * slugify("Hello   world")     // "hello-world"
 */
export function slugify(str) {
	return String(str)
		.normalize('NFKD') // split accents
		.replace(/[\u0300-\u036f]/g, '') // remove accents
		.toLowerCase()
		.trim()
		.replace(/[^a-z0-9]+/g, '-') // non-alnum -> -
		.replace(/^-+|-+$/g, ''); // trim dashes
}

/**
 * Checks if the device being used is a mobile device or not.
 * Checks operating system and screen dimensions
 * @return {boolean} `True` if mobile else `False`.
 */
export function is_mobile() {
    if (window.mobileBool) {
        return true;
    }
    return (/Android|webOS|iPhone|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent))
        && (window.innerWidth < 512 || window.innerHeight < 512);
}