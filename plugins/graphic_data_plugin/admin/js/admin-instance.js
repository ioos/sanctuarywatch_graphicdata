// These functions only fire upon editing or creating a post of Instance custom content type

'use strict';

// the last stop in the field validation process (if needed)
replaceFieldValuesWithTransientValues();

// In case of data entry error with instance post, let's set the instance field values to the values in the cookie
writeCookieValuesToInstanceFields();

// Makes title text red if it ends with an asterisk in "exopite-sof-title" elements. Also adds a line giving the meaning of red text at top of form.
document.addEventListener('DOMContentLoaded', redText);

displayLegacyContentField();

displayFooterEntries ();
document.querySelector('[data-depend-id="instance_footer_columns"]').addEventListener("change", displayFooterEntries );
document.querySelector('[data-depend-id="instance_footer_columns"]').nextElementSibling.addEventListener("change", displayFooterEntries );

// should the "legacy content url" field be shown?
function displayLegacyContentField () {
    const legacyContent = document.getElementsByName("instance_legacy_content")[0].value;
    if (legacyContent == "no"){
        document.getElementsByName("instance_legacy_content_url")[0].parentElement.parentElement.style.display = "none";
        document.getElementsByName("instance_legacy_content_url")[0].value = "";          
    } else {
        document.getElementsByName("instance_legacy_content_url")[0].parentElement.parentElement.style.display = "block";
    }
}

document.querySelector('select[name="instance_legacy_content"]').addEventListener("change", displayLegacyContentField );


// Show relevant footer entries 
function displayFooterEntries (){
    const footerColumnNumber = document.getElementsByName("instance_footer_columns")[0].value;
	for (let i = 3; i > footerColumnNumber; i--){
		let target_text_title = "instance_footer_column" + i + "[instance_footer_column_title" + i + "]";
        let target_text_title_div = document.getElementsByName(target_text_title)[0];
        target_text_title_div.value ="";
		let target_text_content = "instance_footer_column" + i + "[instance_footer_column_content" + i + "]";
        let target_text_content_div = document.getElementsByName(target_text_content)[0];

        // Update the hidden textarea
        target_text_content_div.value = '';

        // Find the corresponding visual editor
        // Look for the .trumbowyg-editor that's a sibling of this textarea
        const trumbowygBox = target_text_content_div.closest('.trumbowyg-box');
        const visualEditor = trumbowygBox ? trumbowygBox.querySelector('.trumbowyg-editor[contenteditable="true"]') : null;

        if (visualEditor) {
            visualEditor.innerHTML = '';
            // Trigger events to ensure synchronization
            visualEditor.dispatchEvent(new Event('input', { bubbles: true }));
            visualEditor.dispatchEvent(new Event('keyup', { bubbles: true }));
        }
		target_text_title_div.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.display="none";
	}

	for (let i = 1; i <= footerColumnNumber; i++){
		let target_text_title = "instance_footer_column" + i + "[instance_footer_column_title" + i + "]";
        let target_text_title_div = document.getElementsByName(target_text_title)[0];
		target_text_title_div.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.parentElement.style.display="block";
	}
}

// This function is the last stop on a field validation path. When a user edits a instance post and hits save, the following happens:
// 1. The instance post is validated. If there are errors, the field values are not saved to the database but they are saved to a temporary cookie.
// 2. The user is redirected back to the edit page for the instance post and an error message is displayed.
// 3. The cookie is read and the field values are written to the fields on the edit page. It is this last step that is done by this function. 
function writeCookieValuesToInstanceFields() {
    if (onCorrectEditPage("instance") == true) {
        if (cookieExists("instance_error_all_fields")) {
            const instanceCookie = getCookie("instance_error_all_fields");
            // Parse the main JSON object
            const instanceCookieValues = JSON.parse(instanceCookie);
            
            // Fill in values for simple fields
            const instanceFieldNames = ["instance_short_title", "instance_slug", "instance_type", "instance_overview_scene",
                "instance_status", "instance_tile", "instance_legacy_content", "instance_legacy_content_url", "instance_footer_column_title_1",
                "instance_footer_column_title_2", "instance_footer_column_title_3"];

			instanceFieldNames.forEach((element) => {
				document.getElementsByName(element)[0].value = instanceCookieValues[element];
			});

            // Fill in values for complex fieldsets
            document.getElementsByName("instance_footer[instance_footer_about]")[0].value = instanceCookieValues["instance_footer_about"];
            document.getElementsByName("instance_footer[instance_footer_contact]")[0].value = instanceCookieValues["instance_footer_contact"];
            document.getElementsByName("instance_footer[instance_footer_reports]")[0].value = instanceCookieValues["instance_footer_reports"];
        }
    }
}

// Ensure that only plain text is pasted into the Trumbowyg editors (instance_footer_about, instance_footer_contact, and instance_footer_reports)
document.addEventListener('DOMContentLoaded', function() {

    // Define the specific Trumbowyg editor IDs for the 'figure' post type
    const instanceEditorIds = ['instance_footer_about', 'instance_footer_contact', 'instance_footer_reports'];

    // Ensure the utility function exists before calling it
    if (typeof attachPlainTextPasteHandlers === 'function') {
        // Attempt to attach handlers immediately after DOM is ready
        if (!attachPlainTextPasteHandlers(instanceEditorIds)) {
            // Retry after a delay if editors weren't found (Trumbowyg might initialize later)
            setTimeout(() => attachPlainTextPasteHandlers(instanceEditorIds), 1000); // Adjust timeout if needed (e.g., 500, 1500)
        }
    } else {
        console.error('Instance Plain Text Paste: attachPlainTextPasteHandlers function not found. Ensure utility.js is loaded correctly.');
    }

});