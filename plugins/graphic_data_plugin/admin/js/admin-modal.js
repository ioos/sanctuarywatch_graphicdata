'use strict';

// the last stop in the field validation process (if needed)
replaceFieldValuesWithTransientValues();

let hoverColor = 'red'; // hacky solution to solving problem of hoverColor in promise. FIX

// Makes title text red if it ends with an asterisk in "exopite-sof-title" elements. Also adds a line giving the meaning of red text at top of form.
document.addEventListener('DOMContentLoaded', redText);

const opening_scene_info_entries = document.querySelector(
	".range[data-depend-id='modal_info_entries']"
).value;
displayEntries(
	opening_scene_info_entries,
	".text-class[data-depend-id='modal_info_"
);
const opening_scene_photo_entries = document.querySelector(
	".range[data-depend-id='modal_photo_entries']"
).value;
displayEntries(
	opening_scene_photo_entries,
	".text-class[data-depend-id='modal_photo_"
);

const opening_tab_entries =
	document.getElementsByName('modal_tab_number')[0].value;
displayTabEntries(opening_tab_entries);

// used by modal_scene_change function to determine if the page has just loaded
let isPageLoad = true;
function changePageLoad() {
	isPageLoad = false;
}

// Use the window.onload event to change isPageLoad to false 3 seconds after page loads
window.onload = function () {
	setTimeout(changePageLoad, 1000);
};

iconFunction();
modalWindow();
modal_scene_change();
modal_location_change();
hideIconSection();

/**
 * Hides or shows the "Icon Section" field in the modal form based on the number of available section options.
 *
 * This function checks the select field named "icon_toc_section" in the modal form. If the field contains fewer than
 * two options (i.e., there are no sections to select), the function hides the entire field by setting its grandparent
 * element's display style to "none". If there are two or more options, the field is shown by setting the display style
 * to "block". This ensures that the "Icon Section" field is only visible when there are valid sections to choose from.
 *
 * @function hideIconSection
 *
 * @description
 * - Retrieves the select element with the name "icon_toc_section".
 * - Checks the number of options in the select element.
 * - Hides the field if there are fewer than two options; otherwise, shows the field.
 *
 * @modifies
 * - The display style of the grandparent element of the "icon_toc_section" select field in the DOM.
 *
 * @example
 * // Hide the Icon Section field if there are no sections to select:
 * hideIconSection();
 *
 * @global
 * - Assumes the existence of a select element named "icon_toc_section" in the DOM.
 */
// If a given Scene does not have any sections, then let's hide the Icon Section field in the modal page
function hideIconSection() {
	const sectionField = document.getElementsByName('icon_toc_section')[0];
	if (sectionField.options.length < 2) {
		sectionField.parentElement.parentElement.style.display = 'none';
	} else {
		sectionField.parentElement.parentElement.style.display = 'block';
	}
}

/**
 * Displays either a URL input field or an internal image upload field for a scene photo,
 * based on the selected photo location type for a given field number.
 *
 * This function toggles the visibility of the URL input and internal image upload fields
 * for a specific photo entry in the modal form. If the user selects "Internal" as the photo
 * location, the URL input is hidden and the internal image upload field is shown. If "External"
 * is selected, the internal image upload field is hidden and the URL input is shown. The function
 * also clears the values of the hidden fields to prevent unintended data submission.
 *
 * @function displayPhotoPath
 * @param {number} fieldNumber - The index of the photo field to update (typically 1–6).
 *
 * @description
 * - Determines the target select element and associated fields for the specified photo entry.
 * - Checks the selected value ("Internal" or "External") for the photo location.
 * - Shows or hides the appropriate input fields and clears the values of hidden fields.
 *
 * @modifies
 * - The display style and value of the URL input and internal image upload fields for the specified photo entry in the DOM.
 *
 * @example
 * // Show or hide the photo fields for the first photo entry based on user selection:
 * displayPhotoPath(1);
 *
 * @global
 * - Assumes the existence of form fields named "modal_photo{n}[modal_photo_location{n}]", "modal_photo{n}[modal_photo_url{n}]", and
 *   elements with data-depend-id="modal_photo_internal{n}" in the DOM, where {n} is the field number.
 */
// Function to display either URL or image under scene image link
function displayPhotoPath(fieldNumber) {
	const targetElement =
		'modal_photo' +
		fieldNumber +
		'[modal_photo_location' +
		fieldNumber +
		']';
	const targetLocation = document.getElementsByName(targetElement)[0];
	const imageElement =
		'[data-depend-id="modal_photo_internal' + fieldNumber + '"]';
	const imageField = document.querySelector(imageElement);
	const urlElement =
		'modal_photo' + fieldNumber + '[modal_photo_url' + fieldNumber + ']';
	const urlField = document.getElementsByName(urlElement)[0];
	if (targetLocation.value == 'Internal') {
		urlField.value = '';
		urlField.parentElement.parentElement.style.display = 'none';
		imageField.parentElement.parentElement.style.display = 'block';
	} else if (targetLocation.value == 'External') {
		imageField.children[1].value = '';
		imageField.children[0].children[0].children[1].src = '';
		imageField.children[0].classList.add('hidden');
		imageField.parentElement.parentElement.style.display = 'none';
		urlField.parentElement.parentElement.style.display = 'block';
	}
}

/**
 * Initializes and manages the display logic for up to six scene photo fields in the modal form.
 *
 * For each photo entry (1–6), this loop:
 * 1. Calls `displayPhotoPath(i)` to set the initial visibility of the URL and internal image upload fields
 *    based on the current selection ("Internal" or "External") for each photo location dropdown.
 * 2. Attaches a "change" event listener to the corresponding photo location select element, so that when
 *    the user changes the selection, `displayPhotoPath(i)` is called again to update the field visibility accordingly.
 *
 * This ensures that the correct input fields are shown or hidden for each photo entry, and that any changes
 * made by the user are immediately reflected in the UI.
 *
 * @example
 * // This code is typically run on page load to initialize all photo fields:
 * for (let i = 1; i < 7; i++){
 *     displayPhotoPath(i);
 *     let targetPhotoElement = document.querySelector('select[name="modal_photo' + i + '[modal_photo_location' + i + ']"]');
 *     targetPhotoElement.addEventListener("change", function() {
 *         displayPhotoPath(i);
 *     });
 * }
 *
 * @requires
 * - displayPhotoPath: Function that toggles visibility of photo URL and internal upload fields for a given entry.
 *
 * @global
 * - Assumes the existence of select elements named "modal_photo{n}[modal_photo_location{n}]" in the DOM, where {n} is 1–6.
 */
for (let i = 1; i < 7; i++) {
	displayPhotoPath(i);
	const targetPhotoElement = document.querySelector(
		'select[name="modal_photo' + i + '[modal_photo_location' + i + ']"]'
	);
	targetPhotoElement.addEventListener('change', function () {
		displayPhotoPath(i);
	});
}

/**
 * Dynamically creates and appends an accordion UI component for displaying lists of info or photo links in the modal preview.
 *
 * This function generates a Bootstrap-style accordion section (either "info" or "photo") and appends it to the specified parent div.
 * Each accordion contains a header button and a collapsible body with a list of links. The links are constructed from the provided
 * list of element indices, using the corresponding text and URL values from the modal form fields.
 *
 * @function createAccordion
 * @param {string}        accordionType - The type of accordion to create ("info" or "photo"). Determines field names and header text.
 * @param {HTMLElement}   parentDiv     - The parent DOM element to which the accordion will be appended.
 * @param {Array<number>} listElements  - An array of indices representing the info or photo entries to include in the accordion.
 *
 * @description
 * - Creates a container div for the accordion item and its header.
 * - Sets the header text to "More info" for "info" type or "Images" for "photo" type.
 * - Builds a collapsible section containing a list of links, where each link uses the text and URL from the corresponding modal form fields.
 * - Appends the completed accordion item to the specified parent div.
 *
 * @modifies
 * - Appends a new accordion item to the given parentDiv in the DOM.
 *
 * @example
 * // Example usage to create an info accordion with entries 1 and 2:
 * createAccordion("info", document.getElementById("allAccordions"), [1, 2]);
 *
 * @global
 * - Assumes the existence of modal form fields named "modal_{type}{n}[modal_{type}_text{n}]" and "modal_{type}{n}[modal_{type}_url{n}]" in the DOM.
 */
function createAccordion(accordionType, parentDiv, listElements) {
	const accordionItem = document.createElement('div');
	accordionItem.classList.add('accordion-item');

	const accordionFirstPart = document.createElement('div');
	accordionFirstPart.classList.add('accordion-header');

	const accordionHeaderButton = document.createElement('button');
	accordionHeaderButton.classList.add('accordion-button', 'accordionTitle');
	accordionHeaderButton.setAttribute('type', 'button');
	accordionHeaderButton.setAttribute('data-bs-toggle', 'collapse');
	accordionHeaderButton.setAttribute(
		'data-bs-target',
		'#collapse' + accordionType
	);
	accordionHeaderButton.setAttribute('aria-expanded', 'true');
	accordionHeaderButton.setAttribute(
		'aria-controls',
		'collapse' + accordionType
	);
	if (accordionType == 'info') {
		accordionHeaderButton.textContent = 'More info';
	} else {
		accordionHeaderButton.textContent = 'Images';
	}
	accordionFirstPart.appendChild(accordionHeaderButton);
	accordionItem.appendChild(accordionFirstPart);

	const accordionSecondPart = document.createElement('div');
	accordionSecondPart.classList.add('accordion-collapse', 'collapse');
	accordionSecondPart.setAttribute(
		'data-bs-parent',
		'#accordion' + accordionType
	);
	accordionSecondPart.id = 'collapse' + accordionType;

	const accordionBody = document.createElement('div');
	accordionBody.classList.add('accordion_body');

	const accordionList = document.createElement('ul');
	accordionList.classList.add('previewAccordionElements');
	for (let i = 0; i < listElements.length; i++) {
		const listItem = document.createElement('li');
		const listLink = document.createElement('a');

		const targetElement = listElements[i];
		const text_field = document.getElementsByName(
			'modal_' +
				accordionType +
				targetElement +
				'[modal_' +
				accordionType +
				'_text' +
				targetElement +
				']'
		)[0].value;
		const url_field = document.getElementsByName(
			'modal_' +
				accordionType +
				targetElement +
				'[modal_' +
				accordionType +
				'_url' +
				targetElement +
				']'
		)[0].value;

		listLink.setAttribute('href', url_field);
		listLink.textContent = text_field;
		listLink.setAttribute('target', '_blank');
		listItem.appendChild(listLink);
		accordionList.appendChild(listItem);
	}

	accordionBody.appendChild(accordionList);
	accordionSecondPart.appendChild(accordionBody);
	accordionItem.appendChild(accordionSecondPart);

	parentDiv.appendChild(accordionItem);
}

/**
 * Populates the "icon_scene_out" dropdown with available scenes for the selected location, excluding the current scene.
 *
 * This function fetches a list of scenes from the WordPress REST API that match the currently selected location
 * (from the "modal_location" select field), and populates the "icon_scene_out" dropdown with these scenes,
 * excluding the currently selected scene (from the "modal_scene" select field). The dropdown is cleared before
 * new options are added. If no location is selected, the dropdown remains empty.
 *
 * @function iconSceneOutDropdown
 *
 * @description
 * - Retrieves the selected location and scene from the modal form.
 * - Constructs a REST API URL to fetch scenes matching the selected location.
 * - Fetches the scene data and populates the "icon_scene_out" dropdown with options for each scene (excluding the current scene).
 * - Handles errors by logging them to the console.
 *
 * @modifies
 * - The options of the select element named "icon_scene_out" in the DOM.
 *
 * @example
 * // Update the "icon_scene_out" dropdown when the location or scene changes:
 * iconSceneOutDropdown();
 *
 * @global
 * - Assumes the existence of select elements named "modal_location", "icon_scene_out", and "modal_scene" in the DOM.
 * - Requires the WordPress REST API to be available and accessible.
 */
function iconSceneOutDropdown() {
	const modal_location =
		document.getElementsByName('modal_location')[0].value;
	const iconSceneOut = document.getElementsByName('icon_scene_out')[0];
	iconSceneOut.innerHTML = '';

	const modalScene = document.getElementsByName('modal_scene')[0].value;
	if (modalScene != '') {
		//     const modal_location_no_space = urlifyRecursiveFunc(modal_location);
		const protocol = window.location.protocol;
		const host = window.location.host;
		const restURL =
			protocol +
			'//' +
			host +
			'/wp-json/wp/v2/scene?_fields=title,id&orderby=title&order=asc&per_page=100&scene_location=' +
			modal_location;
		fetch(restURL)
			.then((response) => response.json())
			.then((data) => {
				const option = document.createElement('option');
				option.value = '';
				option.text = '';
				option.selected = true;
				iconSceneOut.appendChild(option);
				data.forEach((element) => {
					if (element.id != modalScene) {
						const option = document.createElement('option');
						option.value = element.id;
						option.text = element.title.rendered;
						iconSceneOut.appendChild(option);
					}
				});
			})
			.catch((error) => console.error('Error fetching data:', error));
	}
}

/**
 * Controls the visibility and reset logic for modal form fields based on the selected icon function type.
 *
 * This function shows or hides various modal form fields depending on whether the user selects "Modal", "External URL", or "Scene"
 * as the icon function type. It also resets or clears the values of certain fields to prevent unintended data from being submitted.
 * When "Modal" is selected, all modal-specific fields (tagline, info entries, photo entries, tab number, and preview) are shown,
 * and the external URL and scene out fields are hidden and cleared. When "External URL" is selected, only the external URL field is shown.
 * When "Scene" is selected, only the scene out field is shown. The function also ensures that the correct number of tab, info, and photo
 * fields are displayed or hidden, and resets their values as needed.
 *
 * @function modalWindow
 *
 * @description
 * - Checks the value of the "icon_function" select field.
 * - Shows or hides the "icon_external_url", "icon_scene_out", "modal_tagline", "modal_info_entries", "modal_photo_entries",
 *   "modal_tab_number", and "modal_preview" fields based on the selected icon function type.
 * - Resets the values of hidden fields to prevent accidental data submission.
 * - Calls `displayTabEntries` and `displayEntries` to update the visibility of tab, info, and photo fields.
 *
 * @modifies
 * - The display style and value of various modal form fields in the DOM.
 *
 * @example
 * // Update the modal form fields when the icon function changes:
 * modalWindow();
 *
 * @global
 * - Assumes the existence of form fields named "icon_function", "icon_external_url", "icon_scene_out", "modal_tagline",
 *   "modal_info_entries", "modal_photo_entries", "modal_tab_number", and elements with class "modal_preview" in the DOM.
 * - Assumes the existence of helper functions `displayTabEntries` and `displayEntries`.
 */
function modalWindow(){
    const iconFunctionValue = document.getElementsByName("icon_function")[0].value;
    if (iconFunctionValue == "Modal"){ 
        //  document.getElementsByName("icon_out_type")[0].value = "External";
        document.getElementsByName("icon_external_url")[0].parentElement.parentElement.style.display = "none";
        document.getElementsByName("icon_external_url")[0].value = "";
        document.getElementsByName("icon_scene_out")[0].value = "";
        document.getElementsByName("icon_scene_out")[0].parentElement.parentElement.style.display = "none";
        document.getElementsByName("modal_tagline")[0].parentElement.parentElement.style.display = "block";
        document.getElementsByName("modal_info_entries")[0].parentElement.parentElement.style.display = "block";
        document.getElementsByName("modal_photo_entries")[0].parentElement.parentElement.style.display = "block";
        document.getElementsByName("modal_tab_number")[0].parentElement.parentElement.style.display = "block";
        document.getElementsByClassName("modal_preview")[0].parentElement.parentElement.style.display = "block";
        document.getElementsByClassName("modal_preview_mobile")[0].parentElement.parentElement.style.display = "block";
        displayTabEntries(document.getElementsByName("modal_tab_number")[0].value);
    } else {

        document.getElementsByName("modal_tagline")[0].parentElement.parentElement.style.display = "none";

        // Set the Modal Info entries to 0, run displayEntries to hide all of the resulting Modal Info fields 
        // and then hide the Modal Info range 
        document.getElementsByName("modal_info_entries")[0].value = 0;
        document.getElementsByName("modal_info_entries")[0].nextSibling.value = 0;
        displayEntries(0, ".text-class[data-depend-id='modal_info_");
        document.getElementsByName("modal_info_entries")[0].parentElement.parentElement.style.display = "none";

        // Set the Modal Photo entries to 0, run displayEntries to hide all of the resulting Modal Photo fields 
        // and then hide the Modal Photo range 
        document.getElementsByName("modal_photo_entries")[0].value = 0;
        document.getElementsByName("modal_photo_entries")[0].nextSibling.value = 0;
        displayEntries(0, ".text-class[data-depend-id='modal_photo_");
        document.getElementsByName("modal_photo_entries")[0].parentElement.parentElement.style.display = "none";

        // Set the Modal Tab entries to 0, run displayTabEntries to hide all of the resulting Modal Tab fields 
        // and then hide the Modal Tab range 
        document.getElementsByName("modal_tab_number")[0].value = 1;
        document.getElementsByName("modal_tab_number")[0].nextSibling.value = 1;
        displayTabEntries(0);
        document.getElementsByName("modal_tab_number")[0].parentElement.parentElement.style.display = "none";

        // Turn off the Modal preview button
        document.getElementsByClassName("modal_preview")[0].parentElement.parentElement.style.display = "none";
        document.getElementsByClassName("modal_preview_mobile")[0].parentElement.parentElement.style.display = "none";
    }
}

/**
 * Controls the display logic for icon-related fields in the modal form based on the selected icon function type.
 *
 * This function determines which fields should be shown or hidden in the modal form depending on the user's selection
 * of the icon function type ("External URL", "Modal", or "Scene"). It also resets or clears the values of certain fields
 * to prevent unintended data from being submitted. After updating the visibility and values of the relevant fields,
 * it calls `modalWindow()` to ensure the modal form is updated accordingly.
 *
 * @function iconFunction
 *
 * @description
 * - Checks the value of the "icon_function" select field.
 * - For "External URL": Shows the external URL field, hides and clears the scene out field.
 * - For "Modal": Hides and clears both the external URL and scene out fields.
 * - For "Scene": Shows the scene out field, hides and clears the external URL field.
 * - Calls `modalWindow()` to update the modal form fields based on the current selection.
 *
 * @modifies
 * - The display style and value of the "icon_external_url" and "icon_scene_out" fields in the DOM.
 *
 * @example
 * // Update the icon-related fields when the icon function changes:
 * iconFunction();
 *
 * @global
 * - Assumes the existence of form fields named "icon_function", "icon_external_url", and "icon_scene_out" in the DOM.
 * - Assumes the existence of the `modalWindow` function.
 */
function iconFunction() {
	const iconFunctionType =
		document.getElementsByName('icon_function')[0].value;
	switch (iconFunctionType) {
		case 'External URL':
			document.getElementsByName('icon_scene_out')[0].value = '';
			document.getElementsByName(
				'icon_scene_out'
			)[0].parentElement.parentElement.style.display = 'none';
			document.getElementsByName(
				'icon_external_url'
			)[0].parentElement.parentElement.style.display = 'block';
			break;
		case 'Modal':
			document.getElementsByName('icon_scene_out')[0].value = '';
			document.getElementsByName('icon_external_url')[0].value = '';
			document.getElementsByName(
				'icon_scene_out'
			)[0].parentElement.parentElement.style.display = 'none';
			document.getElementsByName(
				'icon_external_url'
			)[0].parentElement.parentElement.style.display = 'none';
			break;
		case 'Scene':
			document.getElementsByName('icon_external_url')[0].value = '';
			document.getElementsByName(
				'icon_scene_out'
			)[0].parentElement.parentElement.style.display = 'block';
			document.getElementsByName(
				'icon_external_url'
			)[0].parentElement.parentElement.style.display = 'none';
			break;
	}
	modalWindow();
}

/**
 * Shows or hides modal tab title fields based on the specified number of tab entries.
 *
 * This function manages the visibility and values of up to six modal tab title input fields in the modal form.
 * For each tab title field beyond the specified entry number, the field is hidden and its value is cleared.
 * For each tab title field up to and including the specified entry number, the field is shown.
 *
 * @function displayTabEntries
 * @param {number|string} entry_number - The number of tab title fields to display (typically 1–6).
 *
 * @description
 * - Iterates from 6 down to entry_number + 1, hiding and clearing each tab title field.
 * - Iterates from 1 up to entry_number, showing each tab title field.
 * - Ensures that only the desired number of tab title fields are visible and populated in the UI.
 *
 * @modifies
 * - The display style and value of input fields named "modal_tab_title{n}" in the DOM, where {n} is 1–6.
 *
 * @example
 * // Show the first three tab title fields and hide the rest:
 * displayTabEntries(3);
 *
 * @global
 * - Assumes the existence of input fields named "modal_tab_title{n}" in the DOM, where {n} is 1–6.
 */
function displayTabEntries(entry_number) {
	let target_element = '';
	for (let i = 6; i > entry_number; i--) {
		target_element = 'modal_tab_title' + i;
		document.getElementsByName(
			target_element
		)[0].parentElement.parentElement.style.display = 'none';
		document.getElementsByName(target_element)[0].value = '';
	}

	for (let i = 1; i <= entry_number; i++) {
		target_element = 'modal_tab_title' + i;
		document.getElementsByName(
			target_element
		)[0].parentElement.parentElement.style.display = 'block';
	}
}

/**
 * Populates the "modal_scene" dropdown with available scene options.
 *
 * This function updates the select element named "modal_scene" in the modal form with a list of scene options
 * provided in the `dropdownElements` array. Each option is created using the scene ID and title from the array.
 * The dropdown is cleared before new options are added, and a blank option is always added as the first entry.
 *
 * @function modalSceneDropdown
 * @param {Array} dropdownElements - An array of arrays, where each sub-array contains two elements:
 *                                 [sceneID, sceneTitle]. Used to populate the dropdown options.
 *
 * @description
 * - Clears all existing options from the "modal_scene" select element.
 * - Adds a blank option as the first entry.
 * - Iterates through `dropdownElements` and appends each scene as an option to the dropdown.
 *
 * @modifies
 * - The options of the select element named "modal_scene" in the DOM.
 *
 * @example
 * // Populate the modal_scene dropdown with two scenes:
 * modalSceneDropdown([[1, "Scene One"], [2, "Scene Two"]]);
 *
 * @global
 * - Assumes the existence of a select element named "modal_scene" in the DOM.
 */
function modalSceneDropdown(dropdownElements = []) {
	const sceneDropdown = document.getElementsByName('modal_scene')[0];
	//   if (!(sceneDropdown.value > 0)) {

	sceneDropdown.innerHTML = '';
	const optionScene = document.createElement('option');
	optionScene.text = '';
	optionScene.value = '';
	sceneDropdown.add(optionScene);
	const elementNumber = dropdownElements.length;
	if (elementNumber > 0) {
		for (let i = 0; i <= elementNumber - 1; i++) {
			const option = document.createElement('option');
			option.value = dropdownElements[i][0];
			option.text = dropdownElements[i][1];
			sceneDropdown.appendChild(option);
		}
		//     }
	}
}

/**
 * Populates the "modal_icons" dropdown with available icon options and preserves the current selection if possible.
 *
 * This function updates the select element named "modal_icons" in the modal form with a list of icon options
 * provided in the `dropdownElements` array. Each option is created using the icon name from the array.
 * The dropdown is cleared before new options are added, and a blank option is always added as the first entry.
 * If the current value of the dropdown matches one of the new options, that option is selected.
 *
 * @function modalIconsDropdown
 * @param {Array} dropdownElements - An array of strings, where each string is the name of an icon to be added as an option.
 *
 * @description
 * - Clears all existing options from the "modal_icons" select element.
 * - Adds a blank option as the first entry.
 * - Iterates through `dropdownElements` and appends each icon as an option to the dropdown.
 * - Preserves the current selection if it matches one of the new options.
 *
 * @modifies
 * - The options and selected value of the select element named "modal_icons" in the DOM.
 *
 * @example
 * // Populate the modal_icons dropdown with three icons:
 * modalIconsDropdown(["icon1", "icon2", "icon3"]);
 *
 * @global
 * - Assumes the existence of a select element named "modal_icons" in the DOM.
 */
function modalIconsDropdown(dropdownElements = []) {
	const iconsDropdown = document.getElementsByName('modal_icons')[0];
	const currentFieldValue = iconsDropdown.value;
	iconsDropdown.innerHTML = '';
	const optionIcon = document.createElement('option');
	optionIcon.text = '';
	optionIcon.value = '';
	iconsDropdown.add(optionIcon);
	const elementNumber = dropdownElements.length;
	if (elementNumber > 0) {
		for (let i = 0; i <= elementNumber - 1; i++) {
			const option = document.createElement('option');
			option.value = dropdownElements[i];
			option.text = dropdownElements[i];
			if (option.value == currentFieldValue) {
				option.selected = true;
			}
			iconsDropdown.appendChild(option);
		}
	}
}

/**
 * Recursively replaces all spaces in a string with '%20' for URL encoding.
 *
 * This function takes a string as input and returns a new string where every space character (' ')
 * is replaced with the URL-encoded value '%20'. The replacement is performed recursively, character by character.
 * If the input string is empty, it returns an empty string.
 *
 * @function urlifyRecursiveFunc
 * @param {string} str - The input string to be URL-encoded.
 * @return {string} The URL-encoded string with all spaces replaced by '%20'.
 *
 * @example
 * // Returns 'Hello%20World'
 * urlifyRecursiveFunc('Hello World');
 *
 * @example
 * // Returns 'NoSpacesHere'
 * urlifyRecursiveFunc('NoSpacesHere');
 *
 * @example
 * // Returns '%20%20LeadingSpaces'
 * urlifyRecursiveFunc('  LeadingSpaces');
 */
function urlifyRecursiveFunc(str) {
	if (str.length === 0) {
		return '';
	}
	if (str[0] === ' ') {
		return '%20' + urlifyRecursiveFunc(str.slice(1));
	}
	return str[0] + urlifyRecursiveFunc(str.slice(1));
}

/**
 * Handles changes to the "modal_location" select field and updates related modal form fields accordingly.
 *
 * This function is triggered when the user changes the selected location in the modal form. It performs several UI and data updates:
 * - Clears and hides the "icon_toc_section" dropdown and resets its value.
 * - Removes the preview window if it exists.
 * - If a valid location is selected, fetches all scenes for that location from the WordPress REST API and populates the "modal_scene" dropdown.
 * - Clears and resets the "modal_icons" dropdown.
 *
 * The function only performs these actions if the page is not in its initial load state (`isPageLoad == false`).
 *
 * @function modal_location_change
 *
 * @description
 * - Checks if the page is not in its initial load state.
 * - Clears and hides the "icon_toc_section" dropdown.
 * - Removes the preview window if present.
 * - If a valid location is selected, fetches scenes for that location and updates the "modal_scene" dropdown.
 * - Clears and resets the "modal_icons" dropdown.
 *
 * @modifies
 * - The options and visibility of the "icon_toc_section" select field.
 * - The DOM by removing the preview window if it exists.
 * - The options of the "modal_scene" and "modal_icons" select fields.
 *
 * @example
 * // Typically used as an event handler for the "modal_location" select field:
 * document.querySelector('select[name="modal_location"]').addEventListener("change", modal_location_change);
 *
 * @global
 * - Assumes the existence of select elements named "modal_location", "icon_toc_section", "modal_scene", and "modal_icons" in the DOM.
 * - Assumes the existence of the helper function urlifyRecursiveFunc for URL encoding.
 * - Requires the WordPress REST API to be available and accessible.
 * - Uses the global variable isPageLoad to determine if the page is in its initial load state.
 */
function modal_location_change() {
	if (isPageLoad == false) {
		// let's remove all options from the Icon Section field and make it invisible
		const sectionField = document.getElementsByName('icon_toc_section')[0];
		sectionField.innerHTML = '';
		sectionField.value = '';
		sectionField.parentElement.parentElement.style.display = 'none';

		// Let's remove the preview window if it already exists
		const previewWindow = document.getElementById('preview_window');
		// If the element exists
		if (previewWindow) {
			// Remove the scene window
			previewWindow.parentNode.removeChild(previewWindow);
		}
		const modal_location = document.querySelector(
			'select[name="modal_location"]'
		).value;
		if (modal_location != ' ' && modal_location != '') {
			const modal_location_no_space = urlifyRecursiveFunc(modal_location);
			const protocol = window.location.protocol;
			const host = window.location.host;
			const restURL =
				protocol +
				'//' +
				host +
				'/wp-json/wp/v2/scene?_fields=title,id,scene_location&orderby=title&order=asc&per_page=100&scene_location=' +
				modal_location_no_space;
			fetch(restURL)
				.then((response) => response.json())
				.then((data) => {
					// Variable to hold the JSON object
					const jsonData = data;

					// Now you can use the jsonData variable to access the JSON object
					const sceneArray = [];
					let newRow;
					jsonData.forEach((element) => {
						newRow = [element.id, element.title.rendered];
						sceneArray.push(newRow);
					});
					modalSceneDropdown(sceneArray);

					const iconsDropdown =
						document.getElementsByName('modal_icons')[0];
					iconsDropdown.innerHTML = '';
					iconsDropdown.value = '';
					const optionIcon = document.createElement('option');
					optionIcon.text = ' ';
					optionIcon.value = '';
					iconsDropdown.add(optionIcon);
				})
				.catch((error) => console.error('Error fetching data:', error));
		}
	}
}

/**
 * Updates the "icon_toc_section" dropdown with available section options for the selected scene.
 *
 * This function fetches section data for the currently selected scene from the WordPress REST API and populates
 * the "icon_toc_section" dropdown with the available sections. It constructs the REST API URL using the selected
 * scene ID and requests section-related fields. If the scene uses a non-list TOC style and has one or more sections,
 * the dropdown is populated with options for each section, and the current value is set based on the database value
 * for the modal (if available). If the scene has no sections or uses a "list" TOC style, the dropdown is left empty.
 * After updating the dropdown, the function calls `hideIconSection()` to show or hide the field as appropriate.
 *
 * @function modal_section_options
 *
 * @description
 * - Retrieves the selected scene ID from the "modal_scene" dropdown.
 * - Constructs a REST API URL to fetch section data for the selected scene.
 * - Fetches the section data and populates the "icon_toc_section" dropdown with options for each section.
 * - If a modal post ID is present, fetches the current "icon_toc_section" value from the modal and sets it.
 * - Calls `hideIconSection()` to update the visibility of the section field.
 *
 * @modifies
 * - The options and value of the select element named "icon_toc_section" in the DOM.
 *
 * @example
 * // Update the section dropdown when the scene changes:
 * modal_section_options();
 *
 * @global
 * - Assumes the existence of select elements named "modal_scene" and "icon_toc_section" in the DOM.
 * - Assumes the existence of an input named "post_ID" for the modal post ID.
 * - Requires the WordPress REST API to be available and accessible.
 * - Assumes the existence of the helper function `hideIconSection`.
 */
// Change the options for the select field with the name icon_toc_section when the scene changes.
// This is done to reflect the sections associated with the new scene
function modal_section_options() {
	const sceneID = document.getElementsByName('modal_scene')[0].value;
	const modalSection = document.getElementsByName('icon_toc_section')[0];
	modalSection.innerHTML = '';
	modalSection.value = '';

	let sceneSection = '';
	for (let i = 1; i < 7; i++) {
		sceneSection = sceneSection + 'scene_section' + i + ',';
	}
	sceneSection = sceneSection.slice(0, -1);

	const protocol = window.location.protocol;
	const host = window.location.host;
	const restURL =
		protocol +
		'//' +
		host +
		'/wp-json/wp/v2/scene/' +
		sceneID +
		'?_fields=title,id,scene_toc_style,scene_section_number,' +
		sceneSection;
	fetch(restURL)
		.then((response) => response.json())
		.then((data) => {
			const sceneTocStyle = data.scene_toc_style;
			const sceneSectionNumber = parseInt(data.scene_section_number);
			if (sceneTocStyle != 'list' && sceneSectionNumber > 0) {
				const option = document.createElement('option');
				option.text = '';
				option.value = '';
				modalSection.add(option);

				for (let j = 1; j <= sceneSectionNumber; j++) {
					const option = document.createElement('option');
					option.value = j;
					option.text =
						data['scene_section' + j]['scene_section_title' + j];
					modalSection.add(option);
				}

				// let's set the value of the icon_toc_section field to the value of the icon_toc_section field in the database
				const modalId = document.querySelector('input[name="post_ID"]');

				if (modalId && modalId.value) {
					const restURL2 =
						protocol +
						'//' +
						host +
						'/wp-json/wp/v2/modal/' +
						modalId.value +
						'?_fields=id,icon_toc_section';
					fetch(restURL2)
						.then((response) => response.json())
						.then((data) => {
							const iconTocSection = data.icon_toc_section;
							if (
								iconTocSection != null &&
								iconTocSection != ''
							) {
								modalSection.value = iconTocSection;
							}
						})
						.catch((error) =>
							console.error('Error fetching data:', error)
						);
				}
			}
			hideIconSection();
		})
		.catch((error) => console.error('Error fetching data:', error));
}

/**
 * Handles changes to the "modal_scene" select field and updates related modal form fields and preview accordingly.
 *
 * This function is triggered when the user changes the selected scene in the modal form. It performs several UI and data updates:
 * - Removes the existing preview window if present.
 * - If a valid scene is selected, updates the "icon_scene_out" dropdown (unless the page is in its initial load state).
 * - Updates the "icon_toc_section" dropdown with available sections for the selected scene.
 * - Fetches and displays the scene's infographic SVG in a preview window, adjusting its width and highlighting the selected icon if applicable.
 * - Fetches and applies the hover color for the icon highlight from the scene's data.
 * - Populates the "modal_icons" dropdown with available icons from the SVG, preserving the current selection if possible.
 * - Handles errors in fetching data and logs them to the console.
 *
 * @function modal_scene_change
 *
 * @description
 * - Removes the preview window if it exists.
 * - Checks if a valid scene is selected.
 * - If not in the initial page load, updates the "icon_scene_out" dropdown.
 * - Updates the "icon_toc_section" dropdown with sections for the selected scene.
 * - Fetches and displays the scene infographic SVG, highlights the selected icon, and updates the "modal_icons" dropdown.
 * - Handles hover color extraction and applies it to the icon highlight.
 * - Handles errors gracefully and logs them to the console.
 *
 * @modifies
 * - The DOM by removing and recreating the preview window.
 * - The options and value of the "icon_scene_out", "icon_toc_section", and "modal_icons" select fields.
 * - The SVG preview and icon highlight in the preview window.
 *
 * @example
 * // Typically used as an event handler for the "modal_scene" select field:
 * document.querySelector('select[name="modal_scene"]').addEventListener("change", modal_scene_change);
 *
 * @global
 * - Assumes the existence of select elements named "modal_scene", "icon_scene_out", "icon_toc_section", and "modal_icons" in the DOM.
 * - Assumes the existence of the helper functions iconSceneOutDropdown, modal_section_options, and modalIconsDropdown.
 * - Uses the global variable isPageLoad to determine if the page is in its initial load state.
 * - Uses the global variable hoverColor for icon highlight color.
 * - Requires the WordPress REST API to be available and accessible.
 */
function modal_scene_change() {
	// Let's remove the preview window if it already exists
	const previewWindow = document.getElementById('preview_window');
	// If the element exists
	if (previewWindow) {
		// Remove the scene window
		previewWindow.parentNode.removeChild(previewWindow);
	}

	const sceneID = document.querySelector("select[name='modal_scene']").value;

	if (sceneID != ' ' && sceneID != '' && sceneID != null) {
		if (!isPageLoad) {
			iconSceneOutDropdown();
		}

		modal_section_options();

		const newDiv = document.createElement('div');
		newDiv.id = 'preview_window';
		newDiv.classList.add('container');
		const imageRow = document.createElement('div');
		imageRow.classList.add('row', 'thirdPreviewRow');
		const imageColumn = document.createElement('div');
		imageColumn.classList.add('col-9');
		imageColumn.id = 'previewSvgContainer';

		const protocol = window.location.protocol;
		const host = window.location.host;
		const restURL =
			protocol +
			'//' +
			host +
			'/wp-json/wp/v2/scene/' +
			sceneID +
			'?_fields=scene_infographic&per_page=100';

		const restHoverColor =
			protocol +
			'//' +
			host +
			'/wp-json/wp/v2/scene/' +
			sceneID +
			'?_fields=scene_hover_color';

		fetch(restHoverColor)
			.then((response) => response.json())
			.then((data) => {
				const rawHoverColorString = data.scene_hover_color;
				if (rawHoverColorString) {
					hoverColor = rawHoverColorString;
					const commaIndex = hoverColor.indexOf(',');
					if (commaIndex !== -1) {
						hoverColor = hoverColor.substring(0, commaIndex);
					}
				}
				return fetch(restURL);
			})
			.then((response) => response.json())
			.then((svgJson) => {
				const svgUrl = svgJson.scene_infographic;
				if (svgUrl == '') {
					imageColumn.innerHTML = 'No infographic for scene';
					modalIconsDropdown([]);
				} else {
					fetch(svgUrl)
						.then((response) => response.text())
						.then((svgContent) => {
							imageColumn.innerHTML = svgContent;
							imageColumn.children[0].id = 'previewSvg';
							document
								.getElementById('previewSvg')
								.removeAttribute('height');

							const width = imageColumn.clientWidth;
							document
								.getElementById('previewSvg')
								.setAttribute('width', width);

							if (isPageLoad == true) {
								const iconValue =
									document.getElementsByName('modal_icons')[0]
										.value;

								if (iconValue != null && iconValue != '') {
									const svgIcons =
										imageColumn.querySelector(
											'g[id="icons"]'
										);
									const svgIconTarget =
										svgIcons.querySelector(
											'g[id="' + iconValue + '"]'
										);

									// Select all child elements
									const subElements =
										svgIconTarget.querySelectorAll('*');

									// Loop through each sub-element and update its stroke-width and color
									subElements.forEach((subElement) => {
										const svgIconHighlight =
											subElement.cloneNode(true);
										svgIconHighlight.id = 'icon_highlight'; //replaced id with name
										svgIconHighlight.style.strokeWidth =
											'3';
										svgIconHighlight.style.stroke =
											hoverColor;
										svgIcons.prepend(svgIconHighlight);
									});
								}
							}

							const iconsLayer = document
								.getElementById('previewSvg')
								.querySelector('g[id="icons" i]');
							// Initialize an array to hold the sublayer names
							let sublayers = [];
							if (iconsLayer) {
								// Iterate over the child elements of the "icons" layer
								iconsLayer.childNodes.forEach((node) => {
									// Check if the node is an element and push its id to the sublayers array
									if (node.nodeType === Node.ELEMENT_NODE) {
										sublayers.push(node.id);
									}
								});
								sublayers = sublayers.sort();
							}
							if (isPageLoad == false) {
								modalIconsDropdown(sublayers);
							}
						});
				}
			})
			.catch((err) => {
				console.error(err);
			});

		imageRow.appendChild(imageColumn);
		newDiv.appendChild(imageRow);
		document
			.getElementsByClassName('exopite-sof-field-select')[1]
			.appendChild(newDiv);
	}
}

/**
 * Handles changes to the "modal_icons" select field and updates the SVG preview highlight accordingly.
 *
 * This function is triggered when the user selects a different icon from the "modal_icons" dropdown in the modal form.
 * It removes any existing icon highlight from the SVG preview, fetches the appropriate hover color from the WordPress REST API,
 * and applies a new highlight to the selected icon within the SVG. The highlight is created by cloning the icon's SVG elements,
 * increasing their stroke width, and setting their stroke color to the fetched hover color.
 *
 * @function modal_icons_change
 *
 * @description
 * - Retrieves the selected icon value from the "modal_icons" dropdown.
 * - Removes any existing highlight elements (with id "icon_highlight") from the SVG preview.
 * - Fetches the hover color for the current instance from the REST API.
 * - Clones and highlights the selected icon's SVG elements with the hover color and increased stroke width.
 *
 * @modifies
 * - The SVG preview in the DOM by removing and adding highlight elements.
 *
 * @example
 * // Typically used as an event handler for the "modal_icons" select field:
 * document.querySelector('select[name="modal_icons"]').addEventListener("change", modal_icons_change);
 *
 * @global
 * - Assumes the existence of a select element named "modal_icons" and an SVG element with id "previewSvg" in the DOM.
 * - Assumes the existence of a group element with id "icons" inside the SVG.
 * - Uses the global variable hoverColor for the highlight color.
 * - Requires the WordPress REST API to be available and accessible.
 */
function modal_icons_change() {
	const iconValue = document.getElementsByName('modal_icons')[0].value;
	if (iconValue != null && iconValue != ' ') {
		const svg = document.getElementById('previewSvg');

		const svgIcons = svg.getElementById('icons');

		const subElementsCheck = svgIcons.querySelectorAll('*');
		subElementsCheck.forEach((subElementCheck) => {
			if (subElementCheck.id == 'icon_highlight') {
				subElementCheck.remove();
			}
		});

		const protocol = window.location.protocol;
		const host = window.location.host;
		const modalInstance =
			document.getElementsByName('modal_location')[0].value;
		const restHoverColor =
			protocol +
			'//' +
			host +
			'/wp-json/wp/v2/instance/' +
			modalInstance +
			'?per_page=100';

		fetch(restHoverColor)
			.then((response) => response.json())
			.then((data) => {
				const rawHoverColorString = data.instance_hover_color;
				//  let hoverColor = "yellow";
				if (rawHoverColorString) {
					hoverColor = rawHoverColorString;
					const commaIndex = hoverColor.indexOf(',');
					if (commaIndex !== -1) {
						hoverColor = hoverColor.substring(0, commaIndex);
					}
				}

				if (iconValue != '') {
					const svgIconTarget = svgIcons.querySelector(
						'g[id="' + iconValue + '"]'
					);

					// Select all child elements
					const subElements = svgIconTarget.querySelectorAll('*');

					// Loop through each sub-element and update its stroke-width and color
					subElements.forEach((subElement) => {
						const svgIconHighlight = subElement.cloneNode(true);
						svgIconHighlight.id = 'icon_highlight';
						svgIconHighlight.style.strokeWidth = '6';
						svgIconHighlight.style.stroke = hoverColor;
						svgIcons.prepend(svgIconHighlight);
					});
				}
			});
	}
}

/**
 * Initializes event listeners for modal form interactivity and preview functionality.
 *
 * This block attaches change and click event listeners to various modal form fields to ensure the UI updates dynamically
 * as the user interacts with the form. It manages the following:
 * - Updates scene, icon, and section dropdowns when their dependencies change.
 * - Dynamically shows/hides and updates tab, info, and photo entry fields based on user input.
 * - Handles the preview button to generate a live modal preview with accordions, tab navigation, and tagline.
 *
 * @description
 * - Adds change event listeners to the "modal_location", "modal_scene", "modal_icons", and "icon_function" select fields,
 *   calling their respective handler functions to update related fields and UI.
 * - Adds change event listeners to the tab, info, and photo entry range fields (and their siblings) to update the number of visible fields.
 * - Adds a click event listener to the preview button to generate a modal preview, including accordions for info/photo links and tab navigation.
 * - Ensures that all UI elements reflect the current state of the form and user selections.
 *
 * @modifies
 * - The DOM by updating field visibility, dropdown options, and generating/removing the modal preview window.
 *
 * @example
 * // This code is typically run on page load to initialize all event listeners:
 * // (No function call needed; runs as part of the script.)
 *
 * @global
 * - Assumes the existence of select elements and range inputs with appropriate names and data attributes in the DOM.
 * - Assumes the existence of helper functions: modal_location_change, modal_scene_change, modal_icons_change, iconFunction,
 *   displayTabEntries, displayEntries, and createAccordion.
 */
document
	.querySelector('select[name="modal_location"]')
	.addEventListener('change', modal_location_change);
document
	.querySelector('select[name="modal_scene"]')
	.addEventListener('change', modal_scene_change);
document
	.querySelector('select[name="modal_icons"]')
	.addEventListener('change', modal_icons_change);
document
	.querySelector('select[name="icon_function"]')
	.addEventListener('change', iconFunction);

document
	.querySelector(".range[data-depend-id='modal_tab_number']")
	.addEventListener('change', function () {
		const opening_tab_entries =
			document.getElementsByName('modal_tab_number')[0].value;
		displayTabEntries(opening_tab_entries);
	});

// Add on change event handlers to the two "modal tab number" entry fields
const modalTabRangeElement = document.querySelector(
	".range[data-depend-id='modal_tab_number']"
);
modalTabRangeElement.addEventListener('change', function () {
	const opening_tab_entries =
		document.getElementsByName('modal_tab_number')[0].value;
	displayTabEntries(opening_tab_entries);
});

const modalTabRangeElement2 = modalTabRangeElement.nextElementSibling;
modalTabRangeElement2.addEventListener('change', function () {
	const opening_tab_entries2 =
		document.getElementsByName('modal_tab_number')[0].value;
	displayTabEntries(opening_tab_entries2);
});

// Add on change event handlers to the two "modal info number" entry fields
const modalInfoRangeElement = document.querySelector(
	".range[data-depend-id='modal_info_entries']"
);
modalInfoRangeElement.addEventListener('change', function () {
	const number_of_modal_info_entries = modalInfoRangeElement.value;
	displayEntries(
		number_of_modal_info_entries,
		".text-class[data-depend-id='modal_info_"
	);
});

const modalInfoRangeElement2 = modalInfoRangeElement.nextElementSibling;
modalInfoRangeElement2.addEventListener('change', function () {
	const number_of_modal_info_entries2 = modalInfoRangeElement2.value;
	displayEntries(
		number_of_modal_info_entries2,
		".text-class[data-depend-id='modal_info_"
	);
});

// Add on change event handlers to the two "modal photo number" entry fields
const modalPhotoRangeElement = document.querySelector(
	".range[data-depend-id='modal_photo_entries']"
);
modalPhotoRangeElement.addEventListener('change', function () {
	const number_of_modal_photo_entries = modalPhotoRangeElement.value;
	displayEntries(
		number_of_modal_photo_entries,
		".text-class[data-depend-id='modal_photo_"
	);
});

const modalPhotoRangeElement2 = modalPhotoRangeElement.nextElementSibling;
modalPhotoRangeElement2.addEventListener('change', function () {
	const number_of_modal_photo_entries2 = modalPhotoRangeElement2.value;
	displayEntries(
		number_of_modal_photo_entries2,
		".text-class[data-depend-id='modal_photo_"
	);
});
