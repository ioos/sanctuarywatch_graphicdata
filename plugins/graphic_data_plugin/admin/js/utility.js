/**
 * Utility functions used across javascript files within admin/js folder
 */

// Check if a cookie exists
function cookieExists(cookieName) {
	return document.cookie
		.split(';')
		.some((cookie) => cookie.trim().startsWith(cookieName + '='));
}

// As the last step in field validation of edit post pages, swap out existing field values with those stored in the allCustomFields object
function replaceFieldValuesWithTransientValues() {
	if (typeof allCustomFields !== 'undefined') {
		Object.entries(allCustomFields).forEach(([metaBoxName, metaValue]) => {
			console.log(metaBoxName);
			console.log(metaValue);
			const element = document.querySelector(
				`[data-depend-id="${metaBoxName}"]`
			);
			if (element) {
				element.value = metaValue;

				// range elements need to be set differently
				if (element.tagName === 'INPUT' && element.type === 'range') {
					element.nextElementSibling.value = metaValue;
				}
			}
		});
	}
}

// Get a cookie with a specified name
function getCookie(cookieName) {
	const name = cookieName + '=';
	const decodedCookie = decodeURIComponent(document.cookie);
	const cookieArray = decodedCookie.split(';');

	for (let i = 0; i < cookieArray.length; i++) {
		const cookie = cookieArray[i].trim();
		if (cookie.indexOf(name) === 0) {
			return cookie.substring(name.length, cookie.length);
		}
	}
	return null;
}

// determine if we are on the correct edit page for a custom post type; a precursor step for further functions to run
function onCorrectEditPage(customPostType) {

	// Get the current URL
	const currentUrl = window.location.href;
	
	// Check if the URL indicates we're editing a post
	const isEditPage = currentUrl.includes('post.php') || currentUrl.includes('post-new.php');
	
	// Look for the post type parameter in the URL
	const urlParams = new URLSearchParams(window.location.search);
	const postType = urlParams.get('post_type') || 'post'; // Default to 'post' if not specified
	
	// For editing existing posts, the post type might not be in the URL
	// In that case, we can rely on the global typenow variable
	const actualPostType = window.typenow || postType;
	
	// Check if we're editing the right kind of custom content post
	if (isEditPage && actualPostType === customPostType) {
		return true;      
	} 
		return false;
	
}

/**
 * WordPress Admin Field Formatter
 *
 * This function enhances the WordPress admin interface by:
 * 1. Adding an informational header to the first content section
 * 2. Highlighting required fields by coloring titles that end with an asterisk
 *
 * @function redText
 * @description Adds an instructional header and visually marks required fields in WordPress admin forms
 * @returns {void} This function does not return a value
 * @example
 * // Call the function when the DOM is loaded
 * document.addEventListener('DOMContentLoaded', redText);
 */
function redText() {
	// Find only the first element with class "exopite-sof-content"
	const contentElement = document.querySelector('.exopite-sof-content');

	// Check if the element exists before proceeding
	if (contentElement) {
		// Create the new h4 element
		const infoHeader = document.createElement('h4');

		// Set the text content
		infoHeader.textContent =
			'Required fields have red titles with asterisks at the end.';

		// Style the text color red
		infoHeader.style.color = 'red';
		infoHeader.style.padding = '15px 0px 0px 30px';

		// Insert at the beginning of the content element
		contentElement.insertBefore(infoHeader, contentElement.firstChild);

		let sceneStatusExists = false;

		// Check if "Scene Status*" is in the content
		document.querySelectorAll('.exopite-sof-title').forEach(function (el) {
			const titleText = el.textContent.trim();
			if (titleText == 'Scene status*Should the Scene be live?') {
				sceneStatusExists = true;
			}
		});

		// If Overview Scene is missing, append a paragraph with the message
		if (sceneStatusExists == true) {
			const overviewSceneMessage = document.createElement('p');
			overviewSceneMessage.textContent =
				"⦁ To set this scene to as an overview scene, please select an instance below, save this post, then go to the instance and set this scene as the 'Overview Scene'.";
			overviewSceneMessage.style.color = 'red';
			overviewSceneMessage.style.padding = '15px 0px 0px 30px';

			contentElement.insertBefore(
				overviewSceneMessage,
				infoHeader.nextSibling
			);
		}
	}

	// Find all h4 elements with class "exopite-sof-title"
	const titleElements = document.querySelectorAll('h4.exopite-sof-title');

	// Loop through each matching element
	titleElements.forEach(function (element) {
		// Get the text content of the h4 element, excluding the p element
		// We find the first text node as it contains the title text
		const titleNode = Array.from(element.childNodes).find(
			(node) => node.nodeType === Node.TEXT_NODE
		);

		if (titleNode) {
			// Extract and trim the text from the node
			const titleText = titleNode.textContent.trim();

			// Check if the text exists and its last character is an asterisk
			if (
				titleText.length > 0 &&
				titleText[titleText.length - 1] === '*'
			) {
				// Create a span element to wrap the text content
				const span = document.createElement('span');
				// Set the span's text to the original title text
				span.textContent = titleText;
				// Apply red color styling to the span
				span.style.color = 'red';

				// Replace the original text node with our styled span
				// This preserves the DOM structure while applying the style
				element.replaceChild(span, titleNode);
			}
		}
	});
}

// Show relevant photo and info fields for scene and modal forms
function displayEntries(entry_number, string_prefix) {
	for (let i = 6; i > entry_number; i--) {
		const target_text = string_prefix + "text" + i + "']";
		const target_text_div = document.querySelector(target_text);
		target_text_div.value = '';
		const target_url = string_prefix + "url" + i + "']";
		const target_url_div = document.querySelector(target_url);
		target_url_div.value = '';
		target_text_div.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.display =
			'none';
	}

	for (let i = 1; i <= entry_number; i++) {
		const target_text = string_prefix + "text" + i + "']";
		const target_text_div = document.querySelector(target_text);
		target_text_div.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.display =
			'block';
	}
}

/**
 * Attaches a 'paste as plain text' handler to specified Trumbowyg editors.
 * Finds the Trumbowyg editor div associated with the original textarea ID
 * and modifies its paste behavior.
 *
 * Should be called after the DOM is ready, potentially with a delay
 * if Trumbowyg editors initialize late.
 *
 * @param {string[]} editorIds An array of the original textarea IDs for the Trumbowyg editors.
 * @return {boolean} True if handlers were successfully attached to all specified editors, false otherwise.
 */
function attachPlainTextPasteHandlers(editorIds) {
	// Check if editorIds is a valid array
	if (!Array.isArray(editorIds) || editorIds.length === 0) {
		console.warn(
			'attachPlainTextPasteHandlers: No valid editor IDs provided.'
		);
		return false;
	}

	// The actual paste handling logic using Selection API
	const handlePaste = (event) => {
		event.preventDefault(); // Prevent default paste

		const text = (event.clipboardData || window.clipboardData).getData(
			'text/plain'
		);
		const editorDiv = event.currentTarget; // The element the listener is attached to

		if (text) {
			const selection = window.getSelection();
			// Ensure the selection is actually *within* the editorDiv we are targeting
			if (
				selection &&
				selection.rangeCount > 0 &&
				editorDiv.contains(selection.anchorNode)
			) {
				const range = selection.getRangeAt(0);
				range.deleteContents();
				const textNode = document.createTextNode(text);
				range.insertNode(textNode);

				// Move cursor after inserted text
				range.setStartAfter(textNode);
				range.setEndAfter(textNode);
				selection.removeAllRanges();
				selection.addRange(range);
			} else if (editorDiv === document.activeElement) {
				// Fallback: If editor has focus but selection API failed or was outside
				editorDiv.appendChild(document.createTextNode(text));
				console.warn(
					'Could not reliably get selection within editor, appended text instead.'
				);
			} else {
				console.warn(
					'Paste event occurred but editor might not be focused or selection is elsewhere.'
				);
			}
		}
	};

	// Function to attach the paste listener to a specific editor div
	const attachListener = (editorDiv) => {
		if (editorDiv) {
			// Remove any existing listener first to prevent duplicates if called multiple times
			editorDiv.removeEventListener('paste', handlePaste);
			// Add the new listener
			editorDiv.addEventListener('paste', handlePaste);
		}
	};

	let editorsFoundCount = 0;
	editorIds.forEach((id) => {
		// 1. Find the original textarea element by its ID
		const textarea = document.getElementById(id);
		if (!textarea) {
			return; // Skip to the next ID if textarea doesn't exist
		}

		// 2. Find the closest ancestor wrapper div (adjust selector if needed for different contexts)
		const fieldWrapper = textarea.closest('.exopite-sof-field'); // Common wrapper class
		if (fieldWrapper) {
			// 3. Find the actual editable div created by Trumbowyg within that wrapper
			const editorDiv = fieldWrapper.querySelector('.trumbowyg-editor');
			if (editorDiv) {
				attachListener(editorDiv);
				editorsFoundCount++;
			}
		} else {
			console.warn(
				`attachPlainTextPasteHandlers: Field wrapper (.exopite-sof-field) not found via closest() for ID: ${id}`
			);
		}
	});

	// Return true if listeners were attached to *all* expected editors
	return editorsFoundCount === editorIds.length;
}
