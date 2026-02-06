/**
 * Renders a modal dialog for corresponding icon with data fetched from a WordPress REST API endpoint.
 * The modal displays a title, tagline, and two sections of content (more info and images)
 * using accordions, along with dynamic tab content based on the modal's data.
 *
 * @param {string} key       - The key used to access specific child data in the `childObj` object,
 *                           which contains modal configuration and content details.
 *
 *                           This function performs the following steps:
 *                           1. Constructs the URL to fetch modal data based on the `modal_id` associated with the provided `key`.
 *                           2. Fetches modal data from the WordPress REST API.
 *                           3. Updates the modal title and tagline based on the fetched data.
 *                           4. Generates two accordion sections:
 *                           - A "More Info" section containing a list of items linked to URLs.
 *                           - An "Images" section containing a list of image links.
 *                           5. Dynamically creates tabs based on the number of tabs specified in the modal data.
 *                           6. Adjusts layout and classes for mobile and desktop views.
 *                           7. Traps focus within the modal dialog to improve accessibility.
 *
 *                           Usage:
 *                           Called in add_modal and table_of_contents; those functions iterate through keys of childObj(which has all the icons in a scene )
 * @param          obj
 * @param          modal_obj
 */
function render_modal(key, obj, modal_obj) {
	// Allow passing in a specific childObj from preview mode in admin-modal.js
	if (typeof childObj === 'undefined') {
		childObj = obj;
	}

	console.log('Rendering modal for key:', key, 'with childObj:', childObj);

	const id = childObj[key].modal_id;
	console.log('id', id);

	//function for rendering the modal content after fetching data
	function populateModalContent(modal_data, childObj, key) {
		// --- Title ---
		const title = childObj[key].title; // or could be modal_data.title
		const modal_title = document.getElementById('modal-title');

		// PREVIEW MODE: if title is empty, set to "No Modal Title Set"
		if (window.location.href.includes('post.php')) {
			const title_test = document.getElementById('title').value;
			console.log('title_test', title_test);
			if (
				title_test === '' ||
				title_test === null ||
				title_test === undefined
			) {
				modal_title.innerHTML = 'No Modal Title Set';
				modal_title.style.fontWeight = 'bold';
			} else {
				modal_title.innerHTML = title;
			}
		}
		// FRONTEND MODE: set title normally
		if (!window.location.href.includes('post.php')) {
			modal_title.innerHTML = title;
		}

		// --- Tagline container ---
		const tagline_container = document.getElementById('tagline-container');
		const modal_tagline = modal_data.modal_tagline;

		if (!is_mobile()) {
			tagline_container.innerHTML = `<em>${modal_tagline}</em>`;
		}

		// --- Accordion container setup ---
		const accordion_container = document.getElementById(
			'accordion-container'
		);
		const acc = document.createElement('div');
		acc.classList.add('accordion');

		const modal_info_entries = modal_data.modal_info_entries;
		const modal_photo_entries = modal_data.modal_photo_entries;

		if (is_mobile()) {
			accordion_container.setAttribute('class', '');
		} else {
			tagline_container.setAttribute('class', '');
			accordion_container.setAttribute('class', '');

			if (modal_info_entries != 0 || modal_photo_entries != 0) {
				tagline_container.classList.add('col-9');
				accordion_container.classList.add('col-3');
			} else {
				tagline_container.classList.add('col-12');
				accordion_container.classList.add('d-none');
			}
		}

		// --- Info Section ---
		if (modal_info_entries != 0) {
			let collapseListHTML = '<div><ul>';
			for (let i = 1; i < 7; i++) {
				const info_field = `modal_info${i}`;
				const info_text = `modal_info_text${i}`;
				const info_url = `modal_info_url${i}`;

				const modal_info_text =
					modal_data[info_field]?.[info_text] || '';
				const modal_info_url = modal_data[info_field]?.[info_url] || '';

				if (!modal_info_text && !modal_info_url) {
					continue;
				}

				collapseListHTML += `<li><a href="${modal_info_url}" target="_blank">${modal_info_text}</a></li>`;
			}
			collapseListHTML += '</ul></div>';

			const accordionItem1 = createAccordionItem(
				'accordion-item-1',
				'accordion-header-1',
				'accordion-collapse-1',
				'More Info',
				collapseListHTML
			);
			acc.appendChild(accordionItem1);
		}

		// --- Photo Section ---
		const modal_id = modal_data.id;
		let collapsePhotoHTML = '<div><ul>';

		if (modal_photo_entries != 0) {
			for (let i = 1; i < 7; i++) {
				const info_field = `modal_photo${i}`;
				const info_text = `modal_photo_text${i}`;
				const loc = `modal_photo_location${i}`;

				const urlField =
					modal_data[info_field]?.[loc] === 'External'
						? `modal_photo_url${i}`
						: `modal_photo_internal${i}`;

				const modal_info_text =
					modal_data[info_field]?.[info_text] || '';
				const modal_info_url = modal_data[info_field]?.[urlField] || '';

				if (!modal_info_text && !modal_info_url) {
					continue;
				}

				collapsePhotoHTML += `<li><a href="${modal_info_url}" target="_blank">${modal_info_text}</a></li>`;
			}

			collapsePhotoHTML += '</ul></div>';

			const accordionItem2 = createAccordionItem(
				'accordion-item-2',
				'accordion-header-2',
				'accordion-collapse-2',
				'Images',
				collapsePhotoHTML
			);
			acc.appendChild(accordionItem2);
		}

		// --- Tagline accordion for mobile ---
		if (is_mobile()) {
			const accordionItem3 = createAccordionItem(
				'accordion-item-3',
				'accordion-header-3',
				'accordion-collapse-3',
				'Tagline',
				modal_tagline
			);
			acc.prepend(accordionItem3);
		}

		// Append accordion
		accordion_container.appendChild(acc);

		// --- Tabs ---
		const num_tabs = Number(modal_data.modal_tab_number);
		for (let i = 1; i <= num_tabs; i++) {
			const tab_key = `modal_tab_title${i}`;
			let tab_title = modal_data[tab_key];

			if (
				window.location.href.includes('post.php') &&
				(tab_title === '' ||
					tab_title === null ||
					tab_title === undefined)
			) {
				tab_title = 'No Tab Title Set';
			}

			create_tabs(i, tab_key, tab_title, title, modal_id);

			if (i === num_tabs) {
				const mdialog = document.querySelector('#myModal > div');
				trapFocus(mdialog);
			}
		}
		// Google Tags
		// modalWindowLoaded(title, modal_id, gaMeasurementID);
	}

	// Fetch modal data and populate content PREVIEW MODE vs FRONTEND MODE
	if (window.location.href.includes('post.php')) {
		const modal_data = modal_obj;
		populateModalContent(modal_data, childObj, key);
	}

	// Fetch modal data and populate content FRONTEND MODE
	if (!window.location.href.includes('post.php')) {
		const protocol = window.location.protocol;
		const host = window.location.host;
		const fetchURL = protocol + '//' + host + `/wp-json/wp/v2/modal/${id}`;
		fetch(fetchURL)
			.then((response) => response.json())
			.then((data) => {
				const modal_data = data; //.find(modal => modal.id === id);
				console.log('modal_data:', modal_data);
				populateModalContent(modal_data, childObj, key);
			})
			.catch((error) => console.error('Error fetching data:', error));
	}
}

/**
 * Ensures at least one tab button is active inside the modal after tabs have been created or filtered.
 *
 * This function inspects the set of tab buttons rendered under `.nav-item button` and determines
 * whether any of them are currently active (contain the 'active' class and exist in the DOM).
 * If none are active, it activates the first available (previously inactive) tab using the
 * Bootstrap Tab API so that the modal displays content correctly.
 *
 * Behavior details:
 * - Collects all tab buttons within `.nav-item` elements.
 * - Separates buttons into `activeButtons` (buttons that currently have the 'active' class and exist)
 *   and `inactiveButtons` (buttons without the 'active' class).
 * - If no valid active button is present, shows the first inactive button by creating a
 *   bootstrap.Tab instance for it and calling `.show()`.
 *
 * Side effects:
 * - May change modal UI state by activating a tab (modifies element classes and visible tab pane).
 * - Uses Bootstrap's JavaScript Tab API (expects bootstrap.Tab to be available).
 *
 * Variables used / created:
 * - navButtons (NodeList): all buttons found via `document.querySelectorAll('.nav-item button')`.
 * - activeButtons (Array<HTMLButtonElement>): buttons that have 'active' and are present in DOM.
 * - inactiveButtons (Array<HTMLButtonElement>): buttons that do not have 'active'.
 * - anyActiveButton (boolean): result of checking whether any nav button had 'active' class during iteration.
 * - firstButton (HTMLButtonElement): the first button from `inactiveButtons` to activate when needed.
 *
 * Requirements / assumptions:
 * - The modal's tab markup uses `.nav-item button` for tab triggers (Bootstrap convention).
 * - The Bootstrap Tab class is available on the page (bootstrap.Tab).
 * - Buttons may have been added/removed before this function runs; the function checks existence by id.
 *
 * Accessibility / UX:
 * - Activating the first available tab prevents the modal from showing an empty content area.
 *
 * Example:
 * // After creating or filtering tabs, call:
 * initTabButtons();
 */
//After removing tabs that do not contain content or do not contain published figures, we show only the tabs that have content and make the first one active
function initTabButtons() {
	// Select all buttons inside nav-item elements
	const navButtons = document.querySelectorAll('.nav-item button');

	const activeButtons = [];
	const inactiveButtons = [];

	// Check if any button is active (e.g., class 'active')
	const anyActiveButton = Array.from(navButtons).some((button) => {
		const isActiveClass = button.classList.contains('active');

		if (!isActiveClass) {
			inactiveButtons.push(button);
		}

		if (isActiveClass) {
			const buttonExists = document.getElementById(button.id);
			if (buttonExists) {
				activeButtons.push(button);
			}
		}
	});

	if (activeButtons.length == 0) {
		// Activate the first one via Bootstrap API
		if (inactiveButtons.length > 0) {
			const firstButton = inactiveButtons[0];
			const tabTrigger = new bootstrap.Tab(firstButton);
			tabTrigger.show(); // ✅ Properly displays inside modal
		}
	}
}

/**
 * Traps the focus within a specified modal element, ensuring that the user cannot tab out of it.
 *
 * This function ensures that accessibility keyboard navigation (specifically tabbing) is confined within the modal,
 * and if the user tries to tab past the last focusable element, focus will loop back to the first focusable element.
 * It also brings focus back to the modal if the user attempts to focus on an element outside of it.
 *
 * @param {HTMLElement} modalElement - The modal element within which focus should be trapped.
 * @return {Function} cleanup - A function that removes the event listeners and deactivates the focus trap.
 */
function trapFocus(modalElement) {
	function getFocusableElements() {
		return Array.from(
			modalElement.querySelectorAll(
				'button, [href], input, select, textarea, summary, [tabindex]:not([tabindex="-1"])'
			)
		).filter(
			(el) => !el.hasAttribute('disabled') && el.offsetParent !== null
		);
	}

	function handleKeydown(e) {
		const focusableElements = getFocusableElements();
		const firstFocusableElement = focusableElements[0];
		const lastFocusableElement =
			focusableElements[focusableElements.length - 1];

		if (e.key === 'Tab' || e.keyCode === 9) {
			if (e.shiftKey) {
				// shift + tab
				if (document.activeElement === firstFocusableElement) {
					lastFocusableElement.focus();
					e.preventDefault();
				}
			} else {
				// tab
				if (document.activeElement === lastFocusableElement) {
					firstFocusableElement.focus();
					e.preventDefault();
				}
			}
		}
	}

	function handleFocus(e) {
		if (!modalElement.contains(e.target)) {
			const focusableElements = getFocusableElements();
			if (focusableElements.length > 0) {
				focusableElements[0].focus();
			}
		}
	}

	document.addEventListener('keydown', handleKeydown);
	document.addEventListener('focus', handleFocus, true);

	const initialFocusableElement = getFocusableElements()[0];
	if (initialFocusableElement) {
		initialFocusableElement.focus();
	}

	return function cleanup() {
		document.removeEventListener('keydown', handleKeydown);
		document.removeEventListener('focus', handleFocus, true);
	};
}

/**
 * Fetches tab information from a WordPress REST API endpoint and renders it into the specified tab content element and container.
 * This function retrieves figure data associated with a specific tab label and ID, and then processes and displays the data using the `render_tab_info` function.
 *
 * @param {HTMLElement} tabContentElement   - The HTML element where the individual tab content will be rendered.
 * @param {HTMLElement} tabContentContainer - The container element that holds all tab contents.
 * @param {string}      tab_label           - The label of the tab used to filter data. This parameter is currently unused
 * @param {string}      tab_id              - The ID of the tab, used to filter the figure data from the fetched results. Is a number but type is string, type casted when used
 *
 *                                          Function Workflow:
 *                                          1. Constructs the API URL to fetch figure data using the current page's protocol and host.
 *                                          2. Makes a fetch request to the constructed URL to retrieve figure data in JSON format.
 *                                          3. Filters the retrieved data based on the provided `tab_id`, looking for figures that match this ID.
 *                                          4. If no figures match the `tab_id`, the function exits early without rendering any content.
 *                                          5. If matching figures are found:
 *                                          a. Iterates through the filtered figure data.
 *                                          b. Constructs an `info_obj` for each figure, containing URLs, text, image links, and captions.
 *                                          c. Calls the `render_tab_info` function to render each figure's information into the specified tab content element.
 *
 *                                          Error Handling:
 *                                          - If the fetch request fails, an error message is logged to the console.
 *
 *                                          Usage:
 *                                          Called at the end of the create_tabs function
 * @param               modal_id
 * @param               buttonID
 */
function fetch_tab_info(
	tabContentElement,
	tabContentContainer,
	tab_label,
	tab_id,
	modal_id,
	buttonID
) {
	const protocol = window.location.protocol;
	const host = window.location.host;
	const fetchURL =
		protocol +
		'//' +
		host +
		'/wp-json/wp/v2/figure?&per_page=24&order=asc&figure_modal=' +
		modal_id +
		'&figure_tab=' +
		tab_id;

	fetch(fetchURL)
		.then((response) => response.json())
		.then((data) => {
			all_figure_data = data.filter(
				(figure) => Number(figure.figure_tab) === Number(tab_id)
			);
			all_figure_data = all_figure_data.filter(
				(figure) => Number(figure.figure_modal) === Number(modal_id)
			);

			// Sort with the following priority:
			// 1. figure_order (ascending; missing/invalid orders go last)
			// 2. figure_title (alphabetically by first letter, for figures with the same order)
			// 3. Maintain original order for figures with same order and title

			all_figure_data.sort((a, b) => {
				// Convert order values to numbers (NaN-safe)
				const orderA = Number(a.figure_order);
				const orderB = Number(b.figure_order);

				const validA = !isNaN(orderA);
				const validB = !isNaN(orderB);

				// Normalize title strings
				const titleA = (a.figure_title || '')
					.trim()
					.charAt(0)
					.toLowerCase();
				const titleB = (b.figure_title || '')
					.trim()
					.charAt(0)
					.toLowerCase();

				// Step 1: sort by figure_order (missing/invalid orders go last)
				if (validA && validB && orderA !== orderB) {
					return orderA - orderB;
				}
				if (validA && !validB) {
					return -1;
				}
				if (!validA && validB) {
					return 1;
				}

				// Step 2: within the same order → sort alphabetically by first letter of title
				return titleA.localeCompare(titleB);
			});

			//filter: If # of figures contained in the buttonID is > 0 generally & the number of figures = published is > 0 in the buttonID, show the tab.
			let total_published_figures = 0;
			for (let idx = 0; idx < all_figure_data.length; idx++) {
				const figure_data = all_figure_data[idx];
				const figure_published = figure_data.figure_published;
				if (figure_published == 'published') {
					total_published_figures += 1;
				}
			}
			if (all_figure_data.length > 0 && total_published_figures > 0) {
				const element = document.getElementById(buttonID);
				if (element) {
					element.style.display = 'block';
				}
			} else {
				const element = document.getElementById(buttonID);
				if (element.style.display == 'none') {
					console.log('buttonID', buttonID);
					element.remove();
				}
			}

			if (!all_figure_data) {
				//we don't create anything here...
				//don't have to render any of the info
			} else {
				(async () => {
					for (let idx = 0; idx < all_figure_data.length; idx++) {
						const figure_data = all_figure_data[idx];

						let external_alt = '';
						if (figure_data.figure_path === 'External') {
							img = figure_data.figure_external_url;
							external_alt = figure_data.figure_external_alt;
						} else {
							img = figure_data.figure_image;
						}

						const info_obj = {
							figure_published: figure_data.figure_published,
							postID: figure_data.id,
							scienceLink:
								figure_data.figure_science_info
									.figure_science_link_url,
							scienceText:
								figure_data.figure_science_info
									.figure_science_link_text,
							dataLink:
								figure_data.figure_data_info
									.figure_data_link_url,
							dataText:
								figure_data.figure_data_info
									.figure_data_link_text,
							imageLink: img,
							code: figure_data.figure_code,
							externalAlt: external_alt,
							shortCaption: figure_data.figure_caption_short,
							longCaption: figure_data.figure_caption_long,
							figureType: figure_data.figure_path,
							figureTitle: figure_data.figure_title,
							figure_interactive_arguments:
								figure_data.figure_interactive_arguments,
						};

						(async () => {
							await render_tab_info(
								tabContentElement,
								tabContentContainer,
								info_obj,
								idx
							);
							//await new Promise(resolve => setTimeout(resolve, 1000)); // Stagger each render
							await render_interactive_plots(
								tabContentElement,
								info_obj
							);
							initTabButtons();
						})();
					}
				})();
			}
		})
		.catch((error) => console.error('Error fetching data:', error));
	//new stuff here
}

//create tabs
/**
 * Creates and adds a new tab within modal window. Each tab is associated with specific content that is displayed when the tab is active.
 * The function also sets up event listeners for copying the tab link to the clipboard (modified permalink structure)
 *
 * @param {number} iter       - The index of the tab being created. This determines the order of the tabs. From render_modal, when iterating through all tabs
 * @param {string} tab_id     - The unique identifier for the tab, generated from the `tab_label`. It is sanitized to replace spaces and special characters.
 * @param {string} tab_label  - The label displayed on the tab, which the user clicks to activate the tab content.
 * @param {string} [title=""] - An optional title used to construct the IDs and classes associated with the tab. It is sanitized similarly to `tab_id`.
 *
 *                            Function Workflow:
 *                            1. Sanitizes `tab_id` and `title` by replacing spaces and special characters with underscores to create valid HTML IDs.
 *                            2. Constructs the target ID for the tab content and controls using the sanitized `title` and `tab_id`.
 *                            3. Creates a new navigation item for the tab, including setting the necessary attributes for Bootstrap styling and functionality.
 *                            4. Appends the new tab button to modal window
 *                            5. Creates a corresponding tab content pane and sets its attributes for proper display and accessibility.
 *                            6. Adds a "Copy Tab Link" button and link to the tab content that allows users to copy the tab's URL to the clipboard.
 *                            7. Sets event listeners for the tab button and link/button to handle copying the URL to the clipboard when clicked.
 *                            8. Updates the browser's hash in the URL to reflect the currently active tab when it is clicked based on what tab/figure is currently being displayed
 *                            9. Calls the `fetch_tab_info` function to fetch and display data relevant to the newly created tab.
 *
 *                            Error Handling:
 *                            - The function handles potential errors during clipboard writing by providing user feedback through alerts.
 *
 *                            Usage:
 *                            Called within render_modal -- each modal has a certain amount of tabs, iterate through each tab and create/render tab info, fix tab permalink
 *
 * @param          modal_id
 */
function create_tabs(iter, tab_id, tab_label, title = '', modal_id) {
	tab_id = tab_label.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_'); //instead of tab id, it should just be the index (figure_data)
	title = title.replace(/\s+/g, '_').replace(/[^a-zA-Z0-9_]/g, '_');
	tab_id = iter;

	const tab_target = `#${title}-${tab_id}-pane`;
	const tab_controls = `${title}-${tab_id}-pane`;

	const myTab = document.getElementById('myTab');
	const navItem = document.createElement('li');
	navItem.classList.add('nav-item');
	navItem.setAttribute('role', 'presentation');

	const button = document.createElement('button');
	button.classList.add('nav-link');
	button.classList.add('tab-title');
	if (iter === 1) {
		button.classList.add('active');
		button.setAttribute('aria-selected', 'true');
	} else {
		button.setAttribute('aria-selected', 'false');
	}
	button.id = `${title}-${tab_id}`;
	button.setAttribute('data-bs-toggle', 'tab');
	button.setAttribute('data-bs-target', tab_target);
	button.setAttribute('type', 'button');
	button.setAttribute('role', 'tab');
	button.setAttribute('aria-controls', tab_controls);
	button.textContent = tab_label;

	if (window.location.href.includes('post.php')) {
		button.style.display = 'block';
	} else {
		button.style.display = 'none'; //hide all tabs initially, will show only those that have published figures in fetch_tab_info
	}

	navItem.appendChild(button);
	myTab.appendChild(navItem);

	const tabContentContainer = document.getElementById('myTabContent');
	const tabContentElement = document.createElement('div');
	tabContentElement.classList.add('tab-pane', 'fade');

	if (iter === 1) {
		tabContentElement.classList.add('show', 'active');
	}

	tabContentElement.id = tab_controls;
	tabContentElement.setAttribute('role', 'tabpanel');
	tabContentElement.setAttribute('aria-labelledby', `${title}-${tab_id}`);
	tabContentElement.setAttribute('tabindex', '0');

	tabContentContainer.appendChild(tabContentElement);

	const linkbutton = document.createElement('button');
	linkbutton.classList.add('btn', 'btn-primary');
	linkbutton.innerHTML = '<i class="fa-solid fa-copy"></i> Copy Tab Link';
	linkbutton.type = 'button';
	linkbutton.setAttribute('style', 'margin-bottom: 7px');
	tabContentElement.prepend(linkbutton);

	if (iter === 1) {
		window.location.hash = `${title}/${tab_id}`;

		linkbutton.addEventListener('click', (e) => {
			e.preventDefault(); // Prevent the link from opening
			writeClipboardText(
				`${window.location.origin}${window.location.pathname}#${title}/${tab_id}`
			);
		});
	}

	button.addEventListener('click', function () {
		window.location.hash = `${title}/${tab_id}`;

		linkbutton.addEventListener('click', (e) => {
			e.preventDefault(); // Prevent the link from opening
			writeClipboardText(
				`${window.location.origin}${window.location.pathname}#${title}/${tab_id}`
			);
		});
	});
	async function writeClipboardText(text) {
		try {
			await navigator.clipboard.writeText(text);
			alert('Link copied to clipboard!');
		} catch (error) {
			console.error('Failed to copy: ', error);
			alert('Failed to copy link. Please try again.');
		}
	}

	// Fetch tab info and render content is not in preview mode from admin side
	// if (!window.location.href.includes('post.php')) {
	//fetch_tab_info(tabContentElement, tabContentContainer, tab_label, tab_id, modal_id);
	try {
		(async () => {
			await fetch_tab_info(
				tabContentElement,
				tabContentContainer,
				tab_label,
				tab_id,
				modal_id,
				button.id
			);
		})();
	} catch (error) {}

	//Google tags triggers
	try {
		modalTabLoaded(tab_label, modal_id, tab_id, gaMeasurementID);
		setupModalMoreInfoLinkTracking(modal_id);
		setupModalImagesLinkTracking(modal_id);
	} catch (error) {}
}
