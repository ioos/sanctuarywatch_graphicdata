// These functions only fire upon editing or creating a post of Scene custom content type

'use strict';

// the last stop in the field validation process (if needed)
replaceFieldValuesWithTransientValues();

// In case of data entry error with scene post, let's set the scene fields values to the values in the cookie
writeCookieValuesToSceneFields();

// Makes title text red if it ends with an asterisk in "exopite-sof-title" elements. Also adds a line giving the meaning of red text at top of form.
document.addEventListener('DOMContentLoaded', redText);

// Initialize the number of visible scene section fields and set up TOC-related field visibility on page load.
//
// - Retrieves the current value of the "scene_section_number" field to determine how many section fields to display.
// - Calls displaySceneEntries to show/hide the appropriate number of section fields.
// - Calls tableOfContentsFieldOptions to set the initial visibility and defaults for TOC and hover color fields
//   based on the selected TOC style.
//
// This ensures the scene editor UI is correctly initialized when the page loads.
let openingSceneSections = document.getElementsByName("scene_section_number")[0].value;
displaySceneEntries(openingSceneSections);
tableOfContentsFieldOptions();

// Initialize visibility of orphan icon color field when page loads 
orphanColorFieldVisibility();

// Change visibility of orphan icon color field based upon value of field scene_orphan_icon_action
document.querySelector('[data-depend-id="scene_orphan_icon_action"]').addEventListener('change', orphanColorFieldVisibility);

// Makes title text red if it ends with an asterisk in "exopite-sof-title" elements. Also adds a line giving the meaning of red text at top of form.
document.addEventListener('DOMContentLoaded', redText);

/**
 * Controls the visibility and default values of scene section and hover color fields based on the selected Table of Contents (TOC) style.
 *
 * This function dynamically shows or hides various scene section fields and hover color fields in the scene editor UI,
 * depending on whether the TOC style is set to "list" or another value. When "list" is selected, section fields are hidden,
 * the section number is set to 0, and only the global hover color fields are shown. For other TOC styles, the function
 * displays section fields and determines whether to show global or per-section hover color fields based on the value of
 * "scene_same_hover_color_sections".
 *
 * @function tableOfContentsFieldOptions
 *
 * @description
 * - Retrieves the current TOC style from the "scene_toc_style" select field.
 * - If TOC style is "list":
 *   - Sets "scene_same_hover_color_sections" to "yes" and hides its field.
 *   - Sets "scene_section_number" to 0 and hides its field.
 *   - Hides all section fields and shows only the global hover color fields.
 * - If TOC style is not "list":
 *   - Shows the "scene_same_hover_color_sections" and "scene_section_number" fields.
 *   - If "scene_same_hover_color_sections" is "no", hides global hover color fields and shows per-section hover color fields.
 *   - If "scene_same_hover_color_sections" is "yes", shows global hover color fields and hides per-section hover color fields.
 * - Calls `displaySceneEntries` to update the number of visible section fields as needed.
 *
 * @modifies
 * - The display style and values of fields named "scene_same_hover_color_sections", "scene_section_number",
 *   "scene_hover_color", "scene_hover_text_color", and per-section hover color fields in the DOM.
 *
 * @example
 * // Update field visibility when the TOC style changes:
 * tableOfContentsFieldOptions();
 *
 * @global
 * - Assumes the existence of fields named "scene_toc_style", "scene_same_hover_color_sections", "scene_section_number",
 *   "scene_hover_color", "scene_hover_text_color", and per-section hover color fields in the DOM.
 * - Assumes the existence of the helper function displaySceneEntries.
 */
// function to show hover color field, based on table of contents type
function tableOfContentsFieldOptions () {
	const tocStyle = document.getElementsByName("scene_toc_style")[0].value;
	let target_color_element = "";
	let target_color_text_element = "";
	// document.getElementsByName("scene_section1[scene_section_hover_color1]")[0].parentElement.parentElement.parentElement;

	if (tocStyle == "list"){
		document.getElementsByName("scene_same_hover_color_sections")[0].value = "yes";
		document.getElementsByName("scene_same_hover_color_sections")[0].parentElement.parentElement.style.display = "none";
		document.getElementsByName("scene_section_number")[0].value = 0;
		displaySceneEntries(0);
		document.getElementsByName("scene_section_number")[0].parentElement.parentElement.style.display = "none";
		document.getElementsByName("scene_hover_color")[0].parentElement.parentElement.style.display = "block";
		document.getElementsByName("scene_hover_text_color")[0].parentElement.parentElement.style.display = "block";
	} else {
		document.getElementsByName("scene_same_hover_color_sections")[0].parentElement.parentElement.style.display = "block";
		document.getElementsByName("scene_section_number")[0].parentElement.parentElement.style.display = "block";
		const singleColor = document.getElementsByName("scene_same_hover_color_sections")[0].value;
		if (singleColor == "no"){
			document.getElementsByName("scene_hover_text_color")[0].parentElement.parentElement.style.display = "none";
			document.getElementsByName("scene_hover_color")[0].parentElement.parentElement.style.display = "none";
			for (let i = 1; i <= 6; i++){
				document.getElementsByName("scene_section" + i + "[scene_section_hover_color" + i + "]")[0].parentElement.parentElement.parentElement.style.display = "block";
				document.getElementsByName("scene_section" + i + "[scene_section_hover_text_color" + i + "]")[0].parentElement.parentElement.parentElement.style.display = "block";
			}
		} else {
			document.getElementsByName("scene_hover_text_color")[0].parentElement.parentElement.style.display = "block";
			document.getElementsByName("scene_hover_color")[0].parentElement.parentElement.style.display = "block";
			for (let i = 1; i <= 6; i++){
				document.getElementsByName("scene_section" + i + "[scene_section_hover_color" + i + "]")[0].parentElement.parentElement.parentElement.style.display = "none";
				document.getElementsByName("scene_section" + i + "[scene_section_hover_text_color" + i + "]")[0].parentElement.parentElement.parentElement.style.display = "none";
			}
		}
	}
}


/**
 * Shows or hides scene section fields based on the specified number of sections.
 *
 * This function manages the visibility and values of up to six scene section input fields in the scene editor form.
 * For each section field beyond the specified entry number, the field is hidden and its value is cleared.
 * For each section field up to and including the specified entry number, the field is shown.
 *
 * @function displaySceneEntries
 * @param {number|string} entry_number - The number of scene section fields to display (typically 1–6).
 *
 * @description
 * - Iterates from 6 down to entry_number + 1, hiding and clearing each section title field and its associated container.
 * - Iterates from 1 up to entry_number, showing each section title field and its associated container.
 * - Ensures that only the desired number of scene section fields are visible and populated in the UI.
 *
 * @modifies
 * - The display style and value of input fields named "scene_section{n}[scene_section_title{n}]" in the DOM, where {n} is 1–6.
 * - The display style of their parent containers, which may include associated hover color fields.
 *
 * @example
 * // Show the first three scene section fields and hide the rest:
 * displaySceneEntries(3);
 *
 * @global
 * - Assumes the existence of input fields named "scene_section{n}[scene_section_title{n}]" in the DOM, where {n} is 1–6.
 * - Assumes the parent containers are structured such that setting their style.display property will show/hide the section fields.
 */
// function to display Scene Section fields
function displaySceneEntries (entry_number){
	let target_title_element = "";
	let target_color_element = "";
	let target_color_text_element = "";

	for (let i = 6; i > entry_number; i--){
		target_title_element = "scene_section" + i + "[scene_section_title" + i + "]";
		target_color_element = "scene_section" + i + "[scene_section_hover_color" + i + "]";
		target_color_text_element = "scene_section" + i + "[scene_section_hover_text_color" + i + "]";
	//	console.log(target_color_element);
		document.getElementsByName(target_title_element)[0].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.display = "none";
		document.getElementsByName(target_title_element)[0].value = "";
	}

	for (let i = 1; i <= entry_number; i++){
		target_title_element = "scene_section" + i + "[scene_section_title" + i + "]";
	//	target_color_element = "scene_section" + i + "[scene_section_hover_color" + i + "]";
		document.getElementsByName(target_title_element)[0].parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.display = "block";

	}
}

/**
 * Displays either a URL input field or an internal image upload field for a scene photo,
 * based on the selected photo location type for a given field number.
 *
 * This function toggles the visibility of the URL input and internal image upload fields
 * for a specific photo entry in the scene editor form. If the user selects "Internal" as the photo
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
 * - Assumes the existence of form fields named "scene_photo{n}[scene_photo_location{n}]", "scene_photo{n}[scene_photo_url{n}]", and
 *   elements with data-depend-id="scene_photo_internal{n}" in the DOM, where {n} is the field number.
 */
// Function to display either URL or image under scene image link
function displayPhotoPath (fieldNumber){
	const targetElement = "scene_photo" + fieldNumber + "[scene_photo_location" + fieldNumber + "]";
	const targetLocation = document.getElementsByName(targetElement)[0];
	const imageElement = '[data-depend-id="scene_photo_internal' + fieldNumber + '"]';
	const imageField = document.querySelector(imageElement);
	const urlElement = "scene_photo" + fieldNumber + "[scene_photo_url" + fieldNumber + "]";
	const urlField = document.getElementsByName(urlElement)[0];
	if (targetLocation.value == "Internal"){
		urlField.value = "";
		urlField.parentElement.parentElement.style.display = "none";
		imageField.parentElement.parentElement.style.display="block";
	} else if (targetLocation.value == "External"){
		imageField.children[1].value = "";
		imageField.children[0].children[0].children[1].src="";
		imageField.children[0].classList.add("hidden");
		imageField.parentElement.parentElement.style.display = "none";
		urlField.parentElement.parentElement.style.display="block";

	}
}

/**
 * Resizes the SVG element in the scene preview to match the width of its container.
 *
 * This function retrieves the SVG element with the ID "previewSvg" and its parent container with the ID "previewSvgContainer".
 * It then sets the SVG's width attribute to match the client width of the container, ensuring the SVG scales responsively
 * within the preview area.
 *
 * @function resizeSvg
 *
 * @description
 * - Gets the SVG element by ID "previewSvg".
 * - Gets the container div by ID "previewSvgContainer".
 * - Sets the SVG's width attribute to the container's clientWidth.
 * - Ensures the SVG scales to fit the available space in the preview.
 *
 * @modifies
 * - The width attribute of the SVG element with ID "previewSvg".
 *
 * @example
 * // Resize the SVG to fit its container after loading or updating the preview:
 * resizeSvg();
 *
 * @global
 * - Assumes the existence of elements with IDs "previewSvg" and "previewSvgContainer" in the DOM.
 */
// Function to resize the SVG
function resizeSvg() {
	// Get the SVG element
	const svg = document.getElementById('previewSvg');

	// Get the parent div (with class "col-10")
	const svgContainer = document.getElementById('previewSvgContainer');

	// Set SVG width to match the container width
	const width = svgContainer.clientWidth;
	svg.setAttribute('width', width);
	}

/**
 * Dynamically creates and appends an accordion UI component for displaying lists of info or photo links in the scene preview.
 *
 * This function generates a Bootstrap-style accordion section (either "info" or "photo") and appends it to the specified parent div.
 * Each accordion contains a header button and a collapsible body with a list of links. The links are constructed from the provided
 * list of element indices, using the corresponding text and URL values from the scene form fields.
 *
 * @function createAccordion
 * @param {string} accordionType - The type of accordion to create ("info" or "photo"). Determines field names and header text.
 * @param {HTMLElement} parentDiv - The parent DOM element to which the accordion will be appended.
 * @param {Array<number>} listElements - An array of indices representing the info or photo entries to include in the accordion.
 *
 * @description
 * - Creates a container div for the accordion item and its header.
 * - Sets the header text to "More info" for "info" type or "Images" for "photo" type.
 * - Builds a collapsible section containing a list of links, where each link uses the text and URL from the corresponding scene form fields.
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
 * - Assumes the existence of scene form fields named "scene_{type}{n}[scene_{type}_text{n}]" and "scene_{type}{n}[scene_{type}_url{n}]" in the DOM.
 */
function createAccordion(accordionType, parentDiv, listElements){

	let accordionItem = document.createElement("div");
	accordionItem.classList.add("accordion-item");

	let accordionFirstPart = document.createElement("div");
	accordionFirstPart.classList.add("accordion-header");

	let accordionHeaderButton = document.createElement("button");
	accordionHeaderButton.classList.add("accordion-button", "accordionTitle");
	accordionHeaderButton.setAttribute("type", "button");
	accordionHeaderButton.setAttribute("data-bs-toggle", "collapse");
	accordionHeaderButton.setAttribute("data-bs-target", "#collapse" + accordionType);
	accordionHeaderButton.setAttribute("aria-expanded", "true");
	accordionHeaderButton.setAttribute("aria-controls", "collapse" + accordionType);
	if (accordionType == "info"){ 
		accordionHeaderButton.textContent = "More info";
	} else {
		accordionHeaderButton.textContent = "Images";
	}
	accordionFirstPart.appendChild(accordionHeaderButton);
	accordionItem.appendChild(accordionFirstPart);

	let accordionSecondPart = document.createElement("div");
	accordionSecondPart.classList.add("accordion-collapse", "collapse");
	accordionSecondPart.setAttribute("data-bs-parent", "#accordion" + accordionType);
	accordionSecondPart.id = "collapse" + accordionType;

	let accordionBody = document.createElement("div");
	accordionBody.classList.add("accordion_body");

	let accordionList = document.createElement("ul");
	accordionList.classList.add("previewAccordionElements");
	for (let i = 0; i < listElements.length; i++){
		let listItem = document.createElement("li");
		let listLink = document.createElement("a");

		let targetElement = listElements[i];	
		let text_field = document.getElementsByName("scene_" + accordionType + targetElement + "[scene_" + accordionType + "_text" + targetElement + "]")[0].value;
		let url_field = document.getElementsByName("scene_" + accordionType + targetElement + "[scene_" + accordionType + "_url" + targetElement + "]")[0].value;

		listLink.setAttribute("href", url_field);
		listLink.textContent = text_field;
		listLink.setAttribute("target", "_blank");
		listItem.appendChild(listLink);
		accordionList.appendChild(listItem);
	}

	accordionBody.appendChild(accordionList); 
	accordionSecondPart.appendChild(accordionBody);
	accordionItem.appendChild(accordionSecondPart);

	parentDiv.appendChild(accordionItem);
	
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
document.querySelector('[data-depend-id="scene_preview"]').addEventListener('click', function() {

	// Let's remove the preview window if it already exists
	var previewWindow = document.getElementById('preview_window');
	// If the element exists
	if (previewWindow) {
		// Remove the scene window
		previewWindow.parentNode.removeChild(previewWindow);
	}
		
	// Find element
	const firstScenePreview = document.querySelector('.scene_preview');

	// Find the second parent element
	const secondParent = firstScenePreview.parentElement.parentElement;

	// Create a new div element
	let newDiv = document.createElement('div');
	newDiv.id = "preview_window";
	newDiv.classList.add("container");

	// Create an h1 element
	let h1 = document.createElement('h1');
	// Set the text content of the h1 element to "Hello World"
	h1.textContent = document.getElementById("title").value
	// Append the h1 element to the new div
	newDiv.appendChild(h1);

	let secondRow = document.createElement("div");
	secondRow.classList.add("row");

	// check to see if any photo link and info link fields are not empty

	let scene_info_elements = [];
	let scene_photo_elements = [];
	let text_field;
	let url_field;
	let haveAccordions = false;
	for (let i = 1; i < 7; i++){
		text_field = "scene_photo" + i + "[scene_photo_text" + i + "]";
		url_field = "scene_photo" + i + "[scene_photo_url" + i + "]";
		if (document.getElementsByName(text_field)[0].value != "" && document.getElementsByName(url_field)[0].value != ""){
			scene_photo_elements.push(i);
		}
		text_field = "scene_info" + i + "[scene_info_text" + i + "]";
		url_field = "scene_info" + i + "[scene_info_url" + i + "]";
		if (document.getElementsByName(text_field)[0].value != "" && document.getElementsByName(url_field)[0].value != ""){
			scene_info_elements.push(i);
		}
	}

	if (scene_info_elements.length > 0 || scene_photo_elements.length > 0) {
		haveAccordions = true;
	}

	if (haveAccordions === true){
		let firstColumn = document.createElement("div");
		firstColumn.classList.add("col-2", "accordion");
		firstColumn.id = "allAccordions";
		
		if (scene_info_elements.length > 0) {
			createAccordion("info", firstColumn, scene_info_elements);
		}
	
		if (scene_photo_elements.length > 0) {
			createAccordion("photo", firstColumn, scene_photo_elements);
		}
		
		secondRow.appendChild(firstColumn);

	}
	let secondColumn = document.createElement("div");
	if (haveAccordions == true){
		secondColumn.classList.add("col-10");
	} else {
		secondColumn.classList.add("col-12");
	}
	secondColumn.textContent = document.getElementsByName('scene_tagline')[0].value;
	secondColumn.classList.add("sceneTagline");
	secondRow.appendChild(secondColumn);

	newDiv.appendChild(secondRow);

	// add row 
	let thirdRow = document.createElement("div");
	thirdRow.classList.add("row", "thirdPreviewRow");
	
	let imageColumn = document.createElement("div");
	imageColumn.classList.add("col-9");
//	imageColumn.id = "previewSvgContainer";
	
	let svgPath = document.getElementsByName("scene_infographic")[0].value;
	let hoverSceneColor = document.getElementsByName("scene_hover_color")[0].value;
	let hoverSceneTextColor = document.getElementsByName("scene_hover_text_color")[0].value;
	if (svgPath == ""){
		imageColumn.innerText = "No image.";
		thirdRow.append(imageColumn);
	} else {
		let imageExtension = svgPath.split('.').pop().toLowerCase();
		if (imageExtension != "svg"){
			imageColumn.innerText = "Image is not a svg.";
			thirdRow.append(imageColumn);
		} else {

			const protocol = window.location.protocol;
			const host = window.location.host;
			const sceneInstance = document.getElementsByName("scene_location")[0].value;
			const restHoverColor = protocol + "//" + host  + "/wp-json/wp/v2/instance/" + sceneInstance;

			fetch(restHoverColor)
				.then(response => response.json())
				.then(data => {
					let hoverColor = "yellow"; 
					const rawHoverColorString = data['instance_hover_color'];

					if (rawHoverColorString) {
						hoverColor = rawHoverColorString;
						const commaIndex = hoverColor.indexOf(',');
						if (commaIndex !== -1) {
							hoverColor = hoverColor.substring(0, commaIndex);
						}
					}
					return fetch(svgPath);
				})
			.then(response => response.text())
			.then(svgContent => {
				// Create a temporary div to hold the SVG content
				imageColumn.innerHTML = svgContent;
				imageColumn.id = "previewSvgContainer";

				thirdRow.append(imageColumn);
				document.getElementById("previewSvgContainer").children[0].id = "previewSvg";

				//document.getElementById("previewSvgContainer").children[0].classList.add("previewSvg");
				document.getElementById("previewSvgContainer").children[0].removeAttribute("height");
				resizeSvg();

				// Find the "icons" layer
				let iconsLayer = document.getElementById("previewSvg").querySelector('g[id="icons"]');

				if (iconsLayer) {

					// Initialize an array to hold the sublayers
					let sublayers = [];

					// Iterate over the child elements of the "icons" layer
					iconsLayer.childNodes.forEach(node => {
						// Check if the node is an element and push its id to the sublayers array
						if (node.nodeType === Node.ELEMENT_NODE) {
						sublayers.push(node.id);
						}
					});
					sublayers = sublayers.sort();

					let tocColumn = document.createElement("div");
					tocColumn.classList.add("col-3", "previewSceneTOC");
					let tocList = document.createElement("ul");
					sublayers.forEach (listElement => {
						let tocElement = document.createElement("li");
						tocElement.innerText = listElement;
						tocList.appendChild(tocElement);
					})
					tocColumn.append(tocList);
					thirdRow.append(tocColumn);

					//let's highlight the clickable elements of the svg
					const targetSvg = document.getElementById("previewSvg");
					sublayers.forEach (listElement => {
						let iconLayer = targetSvg.getElementById(listElement);

						// Select all child elements 
						let subElements = iconLayer.querySelectorAll("*");
					
						// Loop through each sub-element and update its stroke-width and color
						subElements.forEach(element => {
							element.style.strokeWidth = "2";
							element.style.stroke = hoverSceneColor;
						});
					})

				} else {
					imageColumn.innerText = 'No "icons" layer found in the SVG.';
					thirdRow.append(imageColumn);
				}
			})
			.catch(error => {
				console.error('Error fetching or processing SVG:', error);
			});

		}
	}

	newDiv.appendChild(thirdRow);
	// Append the new div to the second parent element
	secondParent.appendChild(newDiv);
});

let opening_scene_info_entries = document.querySelector(".range[data-depend-id='scene_info_entries']").value;
displayEntries(opening_scene_info_entries, ".text-class[data-depend-id='scene_info_");
let opening_scene_photo_entries = document.querySelector(".range[data-depend-id='scene_photo_entries']").value;
displayEntries(opening_scene_photo_entries, ".text-class[data-depend-id='scene_photo_");	


//initialize photopath six times and also set it for onchange of dropdown
for (let i = 1; i < 7; i++){
	displayPhotoPath(i);
	let targetPhotoElementSelector  = 'select[name="scene_photo' + i + '[scene_photo_location' + i + ']"]';
	let targetPhotoElement = document.querySelector(targetPhotoElementSelector);
	targetPhotoElement.addEventListener("change", function() {
		displayPhotoPath(i);
	});
}

document.querySelector('select[name="scene_toc_style"]').addEventListener("change", function() {
	tableOfContentsFieldOptions();
});

document.querySelector('select[name="scene_same_hover_color_sections"]').addEventListener("change", function() {
	tableOfContentsFieldOptions();
});

document.querySelector('select[name="scene_section_number"]').addEventListener("change", function() {
	let openingSceneSections = document.getElementsByName("scene_section_number")[0].value;
	displaySceneEntries(openingSceneSections);
});

document.querySelector('select[name="scene_toc_style"]').addEventListener("change", function() {
	tableOfContentsFieldOptions();
});

// Add on change event handlers to the two "scene info number" entry fields
let sceneInfoRangeElement = document.querySelector(".range[data-depend-id='scene_info_entries']");
sceneInfoRangeElement.addEventListener("change", function() {
	let number_of_scene_info_entries = sceneInfoRangeElement.value;
	displayEntries(number_of_scene_info_entries, ".text-class[data-depend-id='scene_info_");
});

let sceneInfoRangeElement2 = sceneInfoRangeElement.nextElementSibling;
sceneInfoRangeElement2.addEventListener("change", function() {
	let number_of_scene_info_entries2 = sceneInfoRangeElement2.value;
	displayEntries(number_of_scene_info_entries2, ".text-class[data-depend-id='scene_info_");
});

// Add on change event handlers to the two "scene photo number" entry fields
let scenePhotoRangeElement = document.querySelector(".range[data-depend-id='scene_photo_entries']");
scenePhotoRangeElement.addEventListener("change", function() {
	let number_of_scene_photo_entries = scenePhotoRangeElement.value;
	displayEntries(number_of_scene_photo_entries, ".text-class[data-depend-id='scene_photo_");
});

let scenePhotoRangeElement2 = scenePhotoRangeElement.nextElementSibling;
scenePhotoRangeElement2.addEventListener("change", function() {
	let number_of_scene_photo_entries2 = scenePhotoRangeElement2.value;
	displayEntries(number_of_scene_photo_entries2, ".text-class[data-depend-id='scene_photo_");
});

const rangeElement = document.querySelector(".range[data-depend-id='scene_photo_entries']");
rangeElement.addEventListener("change", function() { 
	let number_of_scene_info_entries = rangeElement.value;
	displayEntries(number_of_scene_info_entries, ".text-class[data-depend-id='scene_photo_");
});

const OnSceneEditPage = document.getElementsByName("scene_tagline").length; //determining if we are on a page where we are editing a scene
const SceneError = getCookie("scene_post_status");

if (OnSceneEditPage === 1 && SceneError === "post_error") {
	let SceneFields = JSON.parse(getCookie("scene_error_all_fields"));

	const SceneFieldNames =["scene_location", "scene_infographic", "scene_tagline", "scene_info_entries", "scene_photo_entries"];
	SceneFields["scene_tagline"] = SceneFields["scene_tagline"].replace("\\'","\'");

	SceneFieldNames.forEach((element) => document.getElementsByName(element)[0].value = SceneFields[element]);

	document.getElementsByName("scene_info_entries")[0].parentElement.childNodes[1].value = SceneFields["scene_info_entries"];
	displayEntries(SceneFields["scene_info_entries"], ".text-class[data-depend-id='scene_info_");

	document.getElementsByName("scene_photo_entries")[0].parentElement.childNodes[1].value = SceneFields["scene_photo_entries"];
	displayEntries(SceneFields["scene_photo_entries"], ".text-class[data-depend-id='scene_photo_");

	let elementName;
	let secondElementName;
	const fieldClass = ["info", "photo"];
	for (let i = 1; i < 7; i++){
		fieldClass.forEach((array_value) => {
			elementName = "scene_" + array_value + i + "[scene_" + array_value + "_url" + i + "]";
			secondElementName = "scene_" + array_value + "_url" + i;
			document.getElementsByName(elementName)[0].value = SceneFields[secondElementName];
			elementName = "scene_" + array_value + i + "[scene_" + array_value + "_text" + i + "]";
			secondElementName = "scene_" + array_value + "_text" + i;
			document.getElementsByName(elementName)[0].value = SceneFields[secondElementName];
		});
	}
}

/**
 * Retrieves the value of a specified cookie by name.
 *
 * This function searches the document's cookies for a cookie with the given name and returns its decoded value.
 * If the cookie is not found, it returns null.
 *
 * @function getCookie
 * @param {string} cookieName - The name of the cookie to retrieve.
 * @returns {string|null} The decoded value of the cookie if found, or null if not found.
 *
 * @description
 * - Splits the document.cookie string into individual cookies.
 * - Iterates through the cookies to find one matching the specified name.
 * - Decodes and returns the value of the matching cookie.
 * - Returns null if the cookie does not exist.
 *
 * @example
 * // Retrieve the value of a cookie named "session_id":
 * const sessionId = getCookie("session_id");
 *
 * @global
 * - Uses document.cookie to access browser cookies.
 */
function getCookie(cookieName) {
	let cookies = document.cookie;
	let cookieArray = cookies.split("; ");
	
	for (let i = 0; i < cookieArray.length; i++) {
		let cookie = cookieArray[i];
		let [name, value] = cookie.split("=");
		
		if (name === cookieName) {
			return decodeURIComponent(value);
		}
	}
	
	return null;
}


/**
 * Controls the visibility of the "scene_orphan_icon_color" field based on the selected orphan icon action.
 *
 * This function shows or hides the color picker field for orphan icons in the scene editor form,
 * depending on the value selected in the "scene_orphan_icon_action" dropdown. If the action is set to "color",
 * the color field is displayed; otherwise, it is hidden.
 *
 * @function orphanColorFieldVisibility
 *
 * @description
 * - Retrieves the value of the "scene_orphan_icon_action" select field.
 * - If the value is "color", shows the "scene_orphan_icon_color" field.
 * - If the value is not "color", hides the "scene_orphan_icon_color" field.
 *
 * @modifies
 * - The display style of the field named "scene_orphan_icon_color" in the DOM.
 *
 * @example
 * // Update the visibility of the orphan icon color field when the action changes:
 * orphanColorFieldVisibility();
 *
 * @global
 * - Assumes the existence of form fields named "scene_orphan_icon_action" and "scene_orphan_icon_color" in the DOM.
 */
// make the field scene_orphan_icon_color visible or not visible based upon the value for the field scene_orphan_icon_action
function orphanColorFieldVisibility() {
	const iconOrphanAction = document.getElementsByName("scene_orphan_icon_action")[0].value;
	if (iconOrphanAction == "color"){
		document.getElementsByName("scene_orphan_icon_color")[0].parentElement.parentElement.style.display = "block";
	} else {
		document.getElementsByName("scene_orphan_icon_color")[0].parentElement.parentElement.style.display = "none";
	}
}

// This function is the last stop on a field validation path. When a user edits a scene post and hits save, the following happens:
// 1. The scene post is validated. If there are errors, the field values are not saved to the database but they are saved to a temporary cookie.
// 2. The user is redirected back to the edit page for the scene post and an error message is displayed.
// 3. The cookie is read and the field values are written to the fields on the edit page. It is this last step that is done by this function. 
function writeCookieValuesToSceneFields() {

	if (onCorrectEditPage("scene") == true) {
		if (cookieExists("scene_error_all_fields")) {
			const sceneCookie = getCookie("scene_error_all_fields");
			const sceneCookieValues = JSON.parse(sceneCookie);

			const sceneFieldNames = ["scene_published", "scene_location", "scene_infographic", "scene_tagline", "scene_info_entries", "scene_photo_entries", 
				"scene_order", "scene_orphan_icon_action", "scene_orphan_icon_color", "scene_toc_style", "scene_same_hover_color_sections", "scene_hover_color", 
				"scene_full_screen_button", "scene_text_toggle", "scene_section_number", ];

			// Fill in values for simple fields
			sceneFieldNames.forEach((element) => {
				document.getElementsByName(element)[0].value = sceneCookieValues[element];
			});

			// Fill in values for complex fieldsets
			for (let i = 1; i < 7; i++){
				document.getElementsByName("scene_info" + i + "[scene_info_url" + i + "]")[0].value = sceneCookieValues["scene_info_url" + i];
				document.getElementsByName("scene_info" + i + "[scene_info_text" + i + "]")[0].value = sceneCookieValues["scene_info_text" + i];
				document.getElementsByName("scene_photo" + i + "[scene_photo_url" + i + "]")[0].value = sceneCookieValues["scene_photo_url" + i];
				document.getElementsByName("scene_photo" + i + "[scene_photo_text" + i + "]")[0].value = sceneCookieValues["scene_photo_text" + i];
				document.getElementsByName("scene_photo" + i + "[scene_photo_location" + i + "]")[0].value = sceneCookieValues["scene_photo_location" + i];
				document.getElementsByName("scene_photo" + i + "[scene_photo_internal" + i + "]")[0].value = sceneCookieValues["scene_photo_internal" + i];
				document.getElementsByName("scene_section" + i + "[scene_section_title" + i + "]")[0].value = sceneCookieValues["scene_section_title" + i];
				document.getElementsByName("scene_section" + i + "[scene_section_hover_color" + i + "]")[0].value = sceneCookieValues["scene_section_hover_color" + i];
				document.getElementsByName("scene_section" + i + "[scene_section_hover_text_color" + i + "]")[0].value = sceneCookieValues["scene_section_hover_text_color" + i];
			}
		}
	}

}