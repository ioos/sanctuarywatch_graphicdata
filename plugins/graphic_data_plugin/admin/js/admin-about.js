'use strict';

// the last stop in the field validation process (if needed)
replaceFieldValuesWithTransientValues();

// The following code changes the number of visible about boxes depending on the value of "Number of About Boxes"
displayAboutBoxes();

function displayAboutBoxes() {
	const numAboutBoxes =
		document.getElementsByName('numberAboutBoxes')[0].value;
	const target_element = '';
	for (let i = 10; i > numAboutBoxes; i--) {
		const target_element = 'aboutBoxMain' + i;
		document
			.getElementById(target_element)
			.closest('.exopite-sof-field-fieldset').style.display = 'none';
		document.getElementsByName(
			'aboutBox' + i + '[aboutBoxTitle' + i + ']'
		)[0].value = '';
		if (
			document.getElementById('aboutBoxMain' + i).previousElementSibling
		) {
			document.getElementById(
				'aboutBoxMain' + i
			).previousElementSibling.innerText = '';
			document.getElementById(
				'aboutBoxDetail' + i
			).previousElementSibling.innerText = '';
		}
	}

	for (let i = 1; i <= numAboutBoxes; i++) {
		const target_element = 'aboutBoxMain' + i;
		document
			.getElementById(target_element)
			.closest('.exopite-sof-field-fieldset').style.display = 'block';
	}
}

const aboutInfoRangeElement = document.querySelector(
	".range[data-depend-id='numberAboutBoxes']"
);
aboutInfoRangeElement.addEventListener('change', displayAboutBoxes);

// Ensure that only plain text is pasted into the Trumbowyg editors (about boxes: main and detail, numbered 1-10)
document.addEventListener('DOMContentLoaded', function () {
	// Define the specific Trumbowyg editor IDs for the 'about' post type
	const editorBoxType = ['aboutBoxMain', 'aboutBoxDetail'];
	const aboutEditorIDs = [];
	for (let i = 1; i <= 10; i++) {
		editorBoxType.forEach((element) => aboutEditorIDs.push(element + i));
	}

	// Ensure the utility function exists before calling it
	if (typeof attachPlainTextPasteHandlers === 'function') {
		// Attempt to attach handlers immediately after DOM is ready
		if (!attachPlainTextPasteHandlers(aboutEditorIDs)) {
			// Retry after a delay if editors weren't found (Trumbowyg might initialize later)
			setTimeout(
				() => attachPlainTextPasteHandlers(aboutEditorIDs),
				1000
			); // Adjust timeout if needed (e.g., 500, 1500)
		}
	} else {
		console.error(
			'About Plain Text Paste: attachPlainTextPasteHandlers function not found. Ensure utility.js is loaded correctly.'
		);
	}
});
