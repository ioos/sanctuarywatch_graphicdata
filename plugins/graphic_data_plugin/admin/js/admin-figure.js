// These functions only fire upon editing or creating a post of Figure custom content type

'use strict';

// the last stop in the field validation process (if needed)
replaceFieldValuesWithTransientValues();

// Makes title text red if it ends with an asterisk in "exopite-sof-title" elements. Also adds a line giving the meaning of red text at top of form.
document.addEventListener('DOMContentLoaded', redText);

run_admin_figures();

function run_admin_figures() {
	displayCorrectImageField();
	let jsonColumns;
	let fieldLabelNumber;
	let fieldValueSaved;

	// Hide the parent element of the "figure_interactive_arguments" field
	document.getElementsByName(
		'figure_interactive_arguments'
	)[0].parentElement.parentElement.style.display = 'none';

	/**
	 * Updates the figure scene, modal, and tab options dynamically when the figure instance changes.
	 * Fetches data from the REST API and populates the dropdowns accordingly.
	 */
	function figureInstanceChange() {
		const protocol = window.location.protocol; // Get the current protocol (e.g., http or https)
		const host = window.location.host; // Get the current host (e.g., domain name)
		const figureInstance = document.getElementsByName('location')[0].value;
		const restScene =
			protocol +
			'//' +
			host +
			'/wp-json/wp/v2/scene?_fields=id,title&orderby=title&order=asc&per_page=100&scene_location=' +
			figureInstance;

		// Fetch scene data from the REST API
		fetch(restScene)
			.then((response) => response.json())
			.then((data) => {
				// Update the "figure_scene" dropdown with fetched scene data
				const figureScene =
					document.getElementsByName('figure_scene')[0];
				figureScene.value = ' ';
				figureScene.innerHTML = '';
				const optionScene1 = document.createElement('option');
				optionScene1.text = ' ';
				optionScene1.value = '';
				figureScene.add(optionScene1);

				// Populate the dropdown with scene options
				data.forEach((targetRow) => {
					const optionScene = document.createElement('option');
					optionScene.value = targetRow.id;
					const tmp = document.createElement('textarea');
					tmp.innerHTML = targetRow.title.rendered;
					optionScene.text = tmp.value;
					//optionScene.text = targetRow['title']['rendered'];
					figureScene.appendChild(optionScene);

					//console.log('optionScene.value', optionScene.value);
					//console.log('optionScene.text', optionScene.text)
				});

				// Reset and update the "figure_modal" dropdown
				const figureModal =
					document.getElementsByName('figure_modal')[0];
				figureModal.value = ' ';
				figureModal.innerHTML = '';
				const optionModal = document.createElement('option');
				optionModal.text = ' ';
				optionModal.value = '';
				figureModal.add(optionModal);

				// Reset and update the "figure_tab" dropdown
				const figureTab = document.getElementsByName('figure_tab')[0];
				figureTab.value = ' ';
				figureTab.innerHTML = '';
				const optionTab = document.createElement('option');
				optionTab.text = ' ';
				optionTab.value = '';
				figureTab.add(optionTab);
			})
			// Log any errors that occur during the fetch process
			.catch((err) => {
				console.error(err);
			});
	}

	// reset icons on scene change
	function figureSceneChange() {
		const protocol = window.location.protocol;
		const host = window.location.host;
		const figureScene = document.getElementsByName('figure_scene')[0].value;

		//FIX: the REST API for modal is retrieving all records even when icon_function and modal_scene are set for some reason
		// CHECK - THIS IS FIXED I THINK?
		const restModal =
			protocol +
			'//' +
			host +
			'/wp-json/wp/v2/modal?_fields=id,title,modal_scene,icon_function&orderby=title&order=asc&per_page=100&modal_scene=' +
			figureScene;
		fetch(restModal)
			.then((response) => response.json())
			.then((data) => {
				const figureModal =
					document.getElementsByName('figure_modal')[0];
				figureModal.value = ' ';
				figureModal.innerHTML = '';
				const optionIcon1 = document.createElement('option');
				optionIcon1.text = ' ';
				optionIcon1.value = '';
				figureModal.add(optionIcon1);

				data.forEach((targetRow) => {
					if (
						targetRow.icon_function == 'Modal' &&
						targetRow.modal_scene == figureScene
					) {
						const optionIcon = document.createElement('option');
						const tempTitleDiv = document.createElement('div');
						tempTitleDiv.innerHTML = targetRow.title.rendered;
						optionIcon.value = targetRow.id;

						const tmp = document.createElement('textarea');
						tmp.innerHTML = targetRow.title.rendered;
						optionIcon.text = tmp.value;
						//optionIcon.text = tempTitleDiv.textContent;
						figureModal.appendChild(optionIcon);

						//console.log('optionIcon.value', optionIcon.value);
						//console.log('optionIcon.text', optionIcon.text);
					}
				});
				const figureTab = document.getElementsByName('figure_tab')[0];
				figureTab.value = ' ';
				figureTab.innerHTML = '';
				const optionTab = document.createElement('option');
				optionTab.text = ' ';
				optionTab.value = '';
				figureTab.add(optionTab);
			})
			.catch((err) => {
				console.error(err);
			});
	}

	/**
	 * Resets the tabs in the figure modal when the icon is changed.
	 * Fetches modal data from the REST API and updates the tab options dynamically.
	 */
	function figureIconChange() {
		const figureModal = document.getElementsByName('figure_modal')[0].value;
		const protocol = window.location.protocol;
		const host = window.location.host;
		const restModal =
			protocol +
			'//' +
			host +
			'/wp-json/wp/v2/modal/' +
			figureModal +
			'?per_page=100';

		fetch(restModal)
			.then((response) => response.json())
			.then((data) => {
				// Clear existing tab options
				const figureTab = document.getElementsByName('figure_tab')[0];
				figureTab.value = ' ';
				figureTab.innerHTML = '';

				// Add default "Tabs" option
				const optionTab = document.createElement('option');
				optionTab.text = ' ';
				optionTab.value = '';
				figureTab.add(optionTab);

				if (figureModal != ' ' && figureModal != '') {
					let targetField = '';
					for (let i = 1; i < 7; i++) {
						targetField = 'modal_tab_title' + i;
						if (data[targetField] != '') {
							const optionTitleTab =
								document.createElement('option');
							const tmp = document.createElement('textarea');
							tmp.innerHTML = data[targetField];
							optionTitleTab.text = tmp.value;
							//optionTitleTab.text = data[targetField];
							optionTitleTab.value = i;
							figureTab.appendChild(optionTitleTab);
						}
					}
				}
			})
			.catch((err) => {
				console.error(err);
			});
	}

	/**
	 * Dynamically displays the correct image field based on the selected image type.
	 * Handles the visibility of fields for "Internal", "External", "Interactive", and "Code" image types.
	 */
	// Should the image be an external URL or an internal URL? Show the relevant fields either way
	function displayCorrectImageField() {
		// Get the selected image type from the "figure_path" dropdown
		const imageType = document.getElementsByName('figure_path')[0].value;

		// Select the nested container with class "exopite-sof-field-ace_editor"
		const codeContainer = document.querySelector(
			'.exopite-sof-field-ace_editor'
		);

		// Select the nested container with class "exopite-sof-field-upload"
		const uploadFileContainer = document.querySelector(
			'.exopite-sof-field-upload'
		);

		// Select the nested container with class ".exopite-sof-btn.figure_preview"
		const figure_interactive_settings = document.querySelector(
			'.exopite-sof-field.exopite-sof-field-button'
		); // Add an ID or a unique class

		const figure_interactive_settings2 =
			Array.from(
				document.querySelectorAll(
					'.exopite-sof-field.exopite-sof-field-button'
				)
			).find((el) => {
				const h4 = el.querySelector(
					'h4.exopite-sof-title, .exopite-sof-title h4'
				);
				return (
					h4 &&
					h4.textContent.trim().replace(/\s+/g, ' ') ===
						'Interactive Figure Settings'
				);
			}) || null;

		// const figure_image_field = //document.querySelectorAll('.exopite-sof-field.exopite-sof-field-image')
		// Array.from(document.querySelectorAll('.exopite-sof-field.exopite-sof-field-image'))
		//     .find(el => {
		//     const h4 = el.querySelector('h4.exopite-sof-title, .exopite-sof-title h4');
		//     return h4 && h4.textContent.trim().replace(/\s+/g, ' ') === 'Figure image*';
		//     }) || null;

		// Handle the visibility of fields based on the selected image type
		switch (imageType) {
			case 'Internal':
				//Show the fields we want to see
				document.getElementsByName(
					'figure_image'
				)[0].parentElement.parentElement.parentElement.style.display =
					'block';

				//Hide the fields we do not want to see
				codeContainer.style.display = 'none';
				uploadFileContainer.style.display = 'none';

				if (!window.location.href.includes('post-new.php')) {
					figure_interactive_settings.style.display = 'none';
				}

				document.getElementsByName(
					'figure_external_alt'
				)[0].parentElement.parentElement.style.display = 'none';
				document.getElementsByName('figure_external_alt')[0].value = '';
				document.getElementsByName(
					'figure_external_url'
				)[0].parentElement.parentElement.style.display = 'none';
				document.getElementsByName('figure_external_url')[0].value = '';

				document.querySelectorAll(
					'[data-depend-id="figure_preview"]'
				)[0].parentElement.parentElement.style.display = 'block';
				break;

			case 'External':
				//Show the fields we want to see
				document.getElementsByName(
					'figure_external_alt'
				)[0].parentElement.parentElement.style.display = 'block';
				document.getElementsByName(
					'figure_external_url'
				)[0].parentElement.parentElement.style.display = 'block';

				//Hide the fields we do not want to see
				codeContainer.style.display = 'none';
				uploadFileContainer.style.display = 'none';
				if (!window.location.href.includes('post-new.php')) {
					figure_interactive_settings.style.display = 'none';
				}
				document.getElementsByName(
					'figure_image'
				)[0].parentElement.parentElement.parentElement.style.display =
					'none';
				document.getElementsByName('figure_image')[0].value = '';

				document.querySelectorAll(
					'[data-depend-id="figure_preview"]'
				)[0].parentElement.parentElement.style.display = 'block';
				break;

			case 'Interactive':
				//Show the fields we want to see
				codeContainer.style.display = 'none';
				uploadFileContainer.style.display = 'block';
				figure_interactive_settings.style.display = 'block';

				//Hide the fields we do not want to see and show the fields we want to see
				document.getElementsByName(
					'figure_external_alt'
				)[0].parentElement.parentElement.style.display = 'none';
				document.getElementsByName('figure_external_alt')[0].value = '';
				document.getElementsByName(
					'figure_external_url'
				)[0].parentElement.parentElement.style.display = 'none';
				document.getElementsByName('figure_external_url')[0].value = '';

				//figure_image_field.style.display = "none";
				document.getElementsByName(
					'figure_image'
				)[0].parentElement.parentElement.parentElement.style.display =
					'none';
				document.getElementsByName('figure_image')[0].value = '';

				document.querySelectorAll(
					'[data-depend-id="figure_preview"]'
				)[0].parentElement.parentElement.style.display = 'block';
				break;

			case 'Code':
				//Show the fields we want to see
				codeContainer.style.display = 'block';

				//Hide the fields we do not want to see
				uploadFileContainer.style.display = 'none';
				if (!window.location.href.includes('post-new.php')) {
					figure_interactive_settings.style.display = 'none';
				}
				document.getElementsByName(
					'figure_image'
				)[0].parentElement.parentElement.parentElement.style.display =
					'none';
				document.getElementsByName(
					'figure_external_url'
				)[0].parentElement.parentElement.style.display = 'none';
				document.getElementsByName(
					'figure_external_alt'
				)[0].parentElement.parentElement.style.display = 'none';

				document.querySelectorAll(
					'[data-depend-id="figure_preview"]'
				)[0].parentElement.parentElement.style.display = 'block';

				//figure_image_field.style.display = "none";
				// document.getElementsByName("figure_image")[0].parentElement.parentElement.parentElement.style.display = "none";
				// document.getElementsByName("figure_image")[0].value = "";
				break;
		}
	}
	// Add event listeners to dynamically update fields based on user interactions
	document
		.getElementsByName('figure_path')[0]
		.addEventListener('change', displayCorrectImageField);
	document
		.getElementsByName('figure_modal')[0]
		.addEventListener('change', figureIconChange);
	document
		.getElementsByName('figure_scene')[0]
		.addEventListener('change', figureSceneChange);
	document
		.getElementsByName('location')[0]
		.addEventListener('change', figureInstanceChange);

	// Load the interactive figure settings if an uploaded file exists
	checkIfFileExistsAndLoadJson();
}

// Ensure that only plain text is pasted into the Trumbowyg editors ( figure_caption_short and figure_caption_long)
document.addEventListener('DOMContentLoaded', function () {
	// Define the specific Trumbowyg editor IDs for the 'figure' post type
	const figureEditorIds = ['figure_caption_short', 'figure_caption_long'];

	// Ensure the utility function exists before calling it
	if (typeof attachPlainTextPasteHandlers === 'function') {
		// Attempt to attach handlers immediately after DOM is ready
		if (!attachPlainTextPasteHandlers(figureEditorIds)) {
			//console.log('Figure Plain Text Paste: Trumbowyg editors not immediately found, setting timeout...');
			// Retry after a delay if editors weren't found (Trumbowyg might initialize later)
			setTimeout(
				() => attachPlainTextPasteHandlers(figureEditorIds),
				1000
			); // Adjust timeout if needed (e.g., 500, 1500)
		}
	} else {
		console.error(
			'Figure Plain Text Paste: attachPlainTextPasteHandlers function not found. Ensure utility.js is loaded correctly.'
		);
	}
});
