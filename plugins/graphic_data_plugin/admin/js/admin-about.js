import {
	replaceFieldValuesWithTransientValues,
	applyPlainTextPaste,
} from '@graphic-data/admin-utility';

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

// Ensure that only plain text is pasted into the TinyMCE editors
// (aboutMain, aboutDetail, plus aboutBoxMain and aboutBoxDetail 1 through 10).
// Both applyPlainTextPaste and bindPlainTextPaste are defined in utility.js.
// Define the specific Trumbowyg editor IDs for the 'about' post type
const editorBoxType = ['aboutBoxMain', 'aboutBoxDetail'];
const aboutEditorIDs = ['aboutMain', 'aboutDetail'];
for (let i = 1; i <= 10; i++) {
	editorBoxType.forEach((element) => aboutEditorIDs.push(element + i));
}

applyPlainTextPaste(aboutEditorIDs);
