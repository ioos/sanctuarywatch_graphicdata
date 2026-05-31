/**
 * Utility functions used across javascript files within admin/js folder
 */

/**
 * Checks whether a cookie with the given name exists in the browser.
 *
 * @param {string} cookieName - The name of the cookie to look for.
 * @returns {boolean} True if the cookie exists, false otherwise.
 */
export function cookieExists(cookieName) {
	return document.cookie
		.split(';')
		.some((cookie) => cookie.trim().startsWith(cookieName + '='));
}

/**
 * Replaces current form field values with those stored in the allCustomFields object.
 *
 * Intended as the last step in field validation on edit post pages. Iterates over
 * each entry in allCustomFields and sets the matching field's value via its
 * data-depend-id attribute. Range inputs are handled separately by also updating
 * their adjacent sibling element.
 *
 * @returns {void}
 */
export function replaceFieldValuesWithTransientValues() {
	const el = document.getElementById( 'graphic-data-transient-fields' );
	if ( ! el ) {
		return;
	}
	let allCustomFields;
	try {
		allCustomFields = JSON.parse( el.textContent );
	} catch ( e ) {
		console.error( 'graphic-data-transient-fields: failed to parse JSON', e );
		return;
	}

	const setEditorContent = ( editor, value ) => {
		if ( editor.initialized ) {
			editor.setContent( value );
			editor.save();
		} else {
			editor.on( 'init', () => {
				editor.setContent( value );
				editor.save();
			} );
		}
	};

	const applyValue = ( metaBoxName, metaValue ) => {
		const editor =
			typeof tinymce !== 'undefined' ? tinymce.get( metaBoxName ) : null;

		if ( editor ) {
			setEditorContent( editor, metaValue );
			return;
		}

		const element = document.querySelector(
			`[data-depend-id="${ metaBoxName }"]`
		);
		if ( element ) {
			element.value = metaValue;
			if ( element.tagName === 'INPUT' && element.type === 'range' ) {
				element.nextElementSibling.value = metaValue;
			}
		}
	};

	// Apply immediately for anything already present (the 12 plain fields,
	// plus any editor that happens to already be registered).
	Object.entries( allCustomFields ).forEach( ( [ name, value ] ) => {
		applyValue( name, value );
	} );

	// Catch editor fields that register AFTER this function runs.
	if ( typeof tinymce !== 'undefined' ) {
		tinymce.on( 'AddEditor', ( e ) => {
			const id = e.editor.id;
			if ( Object.prototype.hasOwnProperty.call( allCustomFields, id ) ) {
				setEditorContent( e.editor, allCustomFields[ id ] );
			}
		} );
	}
}

/**
 * Retrieves the value of a cookie by name.
 *
 * @param {string} cookieName - The name of the cookie to retrieve.
 * @returns {string|null} The decoded cookie value, or null if not found.
 */
export function getCookie(cookieName) {
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

/**
 * Determines whether the current page is the correct WordPress edit screen for a given custom post type.
 *
 * Checks both new-post and existing-post edit URLs, resolving the actual post type from the URL
 * query string or the global `window.typenow` variable (used by WordPress when the post type
 * is not present in the URL, e.g. when editing an existing post via post.php?post=123).
 *
 * @param {string} customPostType - The post type slug to check against (e.g. 'graphic_data').
 * @returns {boolean} True if the current page is an edit screen for the specified post type, false otherwise.
 */
export function onCorrectEditPage(customPostType) {

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
export function redText() {
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

/**                                   
 * Shows or hides photo and info entry fields for scene and modal forms based on the selected entry count.        
 *                                    
 * Iterates up to a maximum of 6 entries. Fields beyond `entry_number` are cleared and hidden;                    
 * fields within `entry_number` are made visible. Each field is located via a partial attribute                   
 * selector built from `string_prefix` combined with a `text{n}` or `url{n}` suffix, and visibility               
 * is controlled on the 7th ancestor element of the matched input.          
 *                                     
 * @param {number} entry_number - The number of entries to display (1–6).
 * @param {string} string_prefix - The partial attribute selector prefix used to target field elements            
 * (e.g. `[data-depend-id="scene_photo_`).                                
 * @returns {void}                    
 */      
export function displayEntries(entry_number, string_prefix) {
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
 * Attaches a paste handler to a single already-initialized TinyMCE editor
 * instance that strips all formatting and inserts only plain text.
 *
 * Newlines in the pasted content are converted to <br> elements so that
 * line breaks are preserved visually inside the editor.
 *
 * This is a low-level helper intended to be called by applyPlainTextPaste,
 * which handles timing and editor discovery. You should not normally need to
 * call this function directly.
 *
 * @param {object} editor A fully initialized TinyMCE editor instance.
 * @return {void}
 */
export function bindPlainTextPaste(editor) {
	editor.on('paste', function (e) {
		e.preventDefault();
		const text = (e.clipboardData || window.clipboardData).getData(
			'text/plain'
		);
		if (text) {
			editor.insertContent(
				editor.dom.encode(text).replace(/\n/g, '<br>')
			);
		}
	});
}

/**
 * Ensures plain-text-only paste behavior is applied to a set of TinyMCE
 * editors identified by their underlying textarea IDs.
 *
 * Because TinyMCE editors may not be fully initialized when this function is
 * first called, it uses two complementary strategies:
 *
 * 1. If TinyMCE itself is not yet available, the function retries on a 500 ms
 *    interval until it is, then proceeds.
 * 2. For each editor ID, if the editor is already registered with TinyMCE at
 *    call time, the paste handler is bound immediately via bindPlainTextPaste.
 *    If it is not yet registered, a one-time listener on TinyMCE's 'AddEditor'
 *    event binds the handler as soon as that specific editor is added.
 *
 * @param {string[]} editorIds An array of textarea IDs corresponding to the
 *                             TinyMCE editors that should receive plain-text
 *                             paste behavior.
 * @return {void}
 */
export function applyPlainTextPaste(editorIds) {
	if (!Array.isArray(editorIds) || editorIds.length === 0) {
		console.warn('applyPlainTextPaste: No valid editor IDs provided.');
		return;
	}

	// If TinyMCE is not yet loaded, retry on an interval until it is.
	if (typeof tinymce === 'undefined') {
		const waitForTinyMCE = setInterval(function () {
			if (typeof tinymce !== 'undefined') {
				clearInterval(waitForTinyMCE);
				applyPlainTextPaste(editorIds);
			}
		}, 500);
		return;
	}

	editorIds.forEach(function (id) {
		const editor = tinymce.get(id);
		if (editor) {
			// Editor is already initialized — bind immediately.
			bindPlainTextPaste(editor);
		} else {
			// Editor not yet initialized — bind as soon as TinyMCE adds it.
			tinymce.on('AddEditor', function onAddEditor(e) {
				if (e.editor.id === id) {
					bindPlainTextPaste(e.editor);
					// Remove this listener so it does not fire again for
					// subsequent editors added later in the page lifecycle.
					tinymce.off('AddEditor', onAddEditor);
				}
			});
		}
	});
}
