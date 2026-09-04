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


export async function waitForElementHash(selector, timeoutMs = 20000) {
	return new Promise((resolve) => {
		const element = document.querySelector(selector);

		if (element) {
			resolve(element);
			return;
		}

		const observer = new MutationObserver(() => {
			const element = document.querySelector(selector);

			if (element) {
				clearTimeout(timeoutId);
				observer.disconnect();
				resolve(element);
			}
		});

		observer.observe(
			document.body,
			{
				childList: true,
				subtree: true
			}
		);

		const timeoutId = setTimeout(() => {
			observer.disconnect();

			alert(
				'The requested modal cannot be found.'
			);

			resolve(null);
		}, timeoutMs);
	});
}

function waitForElementById(
	id,
	timeoutMs = 30000
) {
	return new Promise(
		(resolve, reject) => {

			const existingElement =
				document.getElementById(
					id
				);

			if (existingElement) {
				resolve(
					existingElement
				);
				return;
			}


			const observer =
				new MutationObserver(
					() => {
						const element =
							document.getElementById(
								id
							);

						if (element) {
							clearTimeout(
								timeoutId
							);

							observer.disconnect();

							resolve(
								element
							);
						}
					}
				);


			observer.observe(
				document.body,
				{
					childList: true,
					subtree: true
				}
			);


			const timeoutId =
				setTimeout(
					() => {
						observer.disconnect();

						reject(
							new Error(
								`Timed out waiting for element #${id}`
							)
						);
					},
					timeoutMs
				);
		}
	);
}


async function waitForEitherElementHash(
	selector1,
	selector2
) {
	return new Promise((resolve) => {

		function findElement() {
			return (
				document.querySelector(selector1) ||
				document.querySelector(selector2)
			);
		}

		const existingElement =
			findElement();

		if (existingElement) {
			resolve(existingElement);
			return;
		}

		const observer =
			new MutationObserver(() => {

				const element =
					findElement();

				if (element) {
					observer.disconnect();
					resolve(element);
				}
			});

		observer.observe(
			document.body,
			{
				childList: true,
				subtree: true
			}
		);
	});
}


/**
 * Handles hash-based URL navigation. This is for when someone goes to the link for a certain figure (.../#CASheephead/1)
 *
 * 1. First checks if the URL has a hash, making it a figure link
 * 2. Does some string parsing stuff to clean up the URL, from which we can extract information about the scene, icon, and tab
 * 3. Updates new URL, gets necessary DOM elements through waitForElement and fires event handlers to open up figure
 *
 * @return {Promise<void>} - A Promise that resolves when navigation handling is complete.
 *
 * Usage:
 * Called after init when DOMcontent loaded.
 */
export async function handleHashNavigation() {
	//maybe in here check that the scene is/is not an overview
	if (window.location.hash && !window.location.href.includes('post.php') && !window.location.href.includes('post-new.php')) {


		//____________________________
		//FUNCTIONS
		//____________________________
		function getTargetIdFromHash(rawHash) {
			let decoded = rawHash;
			try {
				decoded = decodeURIComponent(rawHash);
			} catch (_) {}
		
			return decoded.split("/")[0] || "";
		}
		
		function getTabFromHash(rawHash) {
			let decoded = rawHash;
			try {
			  decoded = decodeURIComponent(rawHash);
			} catch (_) {}
	
			if (decoded.includes('?')) {
				const hashWithoutQuery = decoded.split('?')[0];
				return hashWithoutQuery.split('/')[1] || hashWithoutQuery || '';
			} else {
				return decoded.split("/")[1] || "";
			}
		}

		function waitForElement(parentElement, selector, timeoutMs = 30000) {
			return new Promise((resolve, reject) => {
				// Check immediately.
				const existingElement =
					parentElement.querySelector(selector);
		
				if (existingElement) {
					resolve(existingElement);
					return;
				}
		
				const observer = new MutationObserver(() => {
					const element =
						parentElement.querySelector(selector);
		
					if (element) {
						clearTimeout(timeoutId);
						observer.disconnect();
		
						resolve(element);
					}
				});
		
				observer.observe(parentElement, {
					childList: true,
					subtree: true
				});
		
				const timeoutId = setTimeout(() => {
					observer.disconnect();
		
					reject(
						new Error(
							`Timed out waiting for ${selector}`
						)
					);
				}, timeoutMs);
			});
		}

		function activateCaseLink(wrongLink, correctLink, tab) {
			if (wrongLink === correctLink) return;

			console.log('wrongLink', wrongLink);
			console.log('correctLink', correctLink);
		
			const newHash = `#${correctLink}/${tab}`;
		
			if (window.location.hash !== newHash) {
				window.location.hash = newHash;
			} else {
				window.dispatchEvent(new Event("hashchange"));
			}


			const targetLink = document.getElementById(correctLink);
			console.log('targetLink', targetLink);
			targetLink.click();

			if (is_mobile()) {
				let modalButton = waitForElement(`#${correctLink}-container`);
				modalButton.dispatchEvent(new MouseEvent('click', { bubbles: true, cancelable: true }));
			}
		}

		async function waitForMeasurableElement(
            figureElement,
            timeoutMs = 30000
        ) {
            /*
            * Find the tab pane containing this figure.
            */
            const tabPane =
                figureElement.closest('.tab-pane');
        
            if (!tabPane) {
                throw new Error(
                    `Could not find tab pane for #${figureElement.id}`
                );
            }
        
        
            /*
            * Get all figures in DOM order.
            */
            const figures =
                Array.from(
                    tabPane.querySelectorAll('.figure')
                );
        
        
            /*
            * Find our target's position.
            */
            const targetIndex =
                figures.indexOf(figureElement);
        
            if (targetIndex === -1) {
                throw new Error(
                    `Could not find #${figureElement.id} in its tab pane`
                );
            }
        
            const figuresToWaitFor =
            figures.slice(
                0,
                targetIndex + 1
            );
        
            let targetMeasurableElement = null;
        
        
            /*
            * Wait for every preceding figure in order.
            */
            for (const currentFigure of figuresToWaitFor) {
                const measurableElement =
                    await waitForSingleMeasurableElement(
                        currentFigure,
                        timeoutMs
                    );
        
        
                if (currentFigure === figureElement) {
                    targetMeasurableElement =
                        measurableElement;
                }
            }
        
        
            return targetMeasurableElement;
        }

		function waitForSingleMeasurableElement(
            figureElement,
            timeoutMs = 30000
        ) {
            const selector = [
                '.main-svg',
                'iframe',
                'img',
                '.code_display_window'
            ].join(', ');
        
            return new Promise((resolve, reject) => {
                const checkElement = () => {
                    const measurableElement =
                        figureElement.querySelector(selector);
        
                    if (!measurableElement) {
                        return false;
                    }
        
                    /*
                    * Image must actually be loaded.
                    */
                    if (measurableElement.matches('img')) {
                        if (
                            !measurableElement.complete ||
                            measurableElement.naturalWidth === 0
                        ) {
                            return false;
                        }
                    }
        
                    /*
                    * Plotly SVG must have dimensions.
                    */
                    if (measurableElement.matches('.main-svg')) {
                        const rect =
                            measurableElement.getBoundingClientRect();
        
                        if (
                            rect.width <= 0 ||
                            rect.height <= 0
                        ) {
                            return false;
                        }
                    }
        
                    /*
                    * Code window must contain something.
                    */
                    if (
                        measurableElement.matches(
                            '.code_display_window'
                        )
                    ) {
                        if (
                            measurableElement.children.length === 0 &&
                            measurableElement.textContent.trim() === ''
                        ) {
                            return false;
                        }
                    }
        
                    return measurableElement;
                };
        
        
                const existingElement = checkElement();
        
                if (existingElement) {
                    resolve(existingElement);
                    return;
                }
        
        
                const observer = new MutationObserver(() => {
                    const measurableElement = checkElement();
        
                    if (measurableElement) {
                        clearTimeout(timeoutId);
                        observer.disconnect();
        
                        resolve(measurableElement);
                    }
                });
        
        
                observer.observe(figureElement, {
                    childList: true,
                    subtree: true,
                    attributes: true
                });
        
        
                const timeoutId = setTimeout(() => {
                    observer.disconnect();
        
                    reject(
                        new Error(
                            `Timed out waiting for measurable content inside #${figureElement.id}`
                        )
                    );
                }, timeoutMs);
            });
        }

		function expandAccordionForLink(targetLink) {
			if (!targetLink) return;
		
			const bodyEl = targetLink.closest(".accordion-body");
			const item = bodyEl ? bodyEl.closest(".accordion-item") : null;
			const button = item
			? item.querySelector(".accordion-button, .accordion-toggle, button")
			: null;
		
			if (button && button.getAttribute("aria-expanded") !== "true") {
			button.click();
			}
		}

		function collectModalIds() {

            if (!is_mobile()) {
                return [...document.querySelectorAll(".modal-link")]
                .map((el) => el.id)
                .filter(Boolean);
            }

            if (is_mobile()) {
            return [...document.querySelectorAll('div[id$="-container"]')]
                .map((el) => el.id)
                .filter(Boolean);
            }
        }

		function decodeHtmlEntities(value) {
			const textarea = document.createElement('textarea');
			textarea.innerHTML = value;
			return textarea.value;
		}

		//____________________________
		//MODAL OPEN CONTROL SELECTION 
		//____________________________
		const raw = window.location.hash.slice(1);
		let modalName = getTargetIdFromHash(raw);
		let tabId = getTabFromHash(raw);

		const submittedURL = window.location.href;
        const submittedURLParts = submittedURL.split('/');
        const submittedInstance = submittedURLParts[3];
        const submittedScene = submittedURLParts[4];
        const submittedModal = submittedURLParts[5].replace('#', '');
		let constructedRestFigureURL;

		/*
		* Capture figure ID BEFORE any modal/tab
		* click handlers can modify the URL hash.
		*/
		const [rawTabPath, rawFragmentQuery = ''] =
			raw.split('?');

		const rawFragmentParams =
			new URLSearchParams(rawFragmentQuery);

		let figureId =
			rawFragmentParams.get('figure');

		console.log(
			'ORIGINAL figureId',
			figureId
		);

		if (figureId) {
			// Build the REST API URL to fetch the figure data based on the figureId from the URL hash.
			const protocol = window.location.protocol;
			const host = window.location.host;

			const figureFetchURL  =  protocol + "//" + host  + "/wp-json/wp/v2/figure/" + figureId;
			const figureResponse = await fetch(figureFetchURL);
			if (!figureResponse.ok) {
				alert(
					'The requested figure cannot be found.'
				);
				return;
			}
			const figureData = await figureResponse.json();
			const figureModalNumber = figureData.figure_modal;
			let figureTab = figureData.figure_tab;
			figureTab = Number(figureTab);

			const modalFetchURL  =  protocol + "//" + host  + "/wp-json/wp/v2/modal/" + figureModalNumber;
			const modalResponse = await fetch(modalFetchURL);
			const modalData = await modalResponse.json();
			let modalTitle = modalData.title.rendered;
			modalTitle = decodeHtmlEntities(modalTitle);
			// console.log('modalTitle', modalTitle);
			let modalSlug = slugify(modalTitle);
			// console.log('modalSlug', modalSlug);
			const modalSceneNumber = modalData.modal_scene;

			const sceneFetchURL  =  protocol + "//" + host  + "/wp-json/wp/v2/scene/" + modalSceneNumber;
			const sceneResponse = await fetch(sceneFetchURL);
			const sceneData = await sceneResponse.json();
			const sceneSlug = sceneData.slug;
			const sceneInstanceNumber = sceneData.scene_location;

			const instanceFetchURL  =  protocol + "//" + host  + "/wp-json/wp/v2/instance/" + sceneInstanceNumber;
			const instanceResponse = await fetch(instanceFetchURL);
			const instanceData = await instanceResponse.json();
			const instanceSlug = instanceData.instance_slug;

			constructedRestFigureURL =  protocol + "//" + host  + "/" + instanceSlug + "/" + sceneSlug + "/#" + modalSlug + "/" + figureTab + "?figure=" + figureId;
			
			console.log('constructedRestFigureURL', constructedRestFigureURL);
			console.log('submittedURL', submittedURL);

			console.log('submittedScene', submittedScene);
			console.log('sceneSlug', sceneSlug);

			console.log('submittedModal', submittedModal);
			console.log('modalSlug', modalSlug);

			console.log('submittedInstance', submittedInstance);
			console.log('instanceSlug', instanceSlug);

			// Check if the submitted URL, scene, modal, or instance does not match the constructed REST figure URL or the expected slugs.
			if (submittedURL !== constructedRestFigureURL || submittedInstance !== instanceSlug) {

				if (submittedScene != sceneSlug) {
					window.location.href = constructedRestFigureURL;
					// window.location.reload();
				}

				if (tabId != figureTab) {
					window.location.href = constructedRestFigureURL;
					// window.location.reload();
				}

				if ((submittedInstance === instanceSlug && submittedScene === sceneSlug && submittedModal != modalSlug) || (submittedInstance === instanceSlug && submittedScene === sceneSlug && submittedModal === modalSlug && figureTab !== tabId)) {

					// Redirect to the correct figure location.
					window.location.href = constructedRestFigureURL;
					window.location.reload();
				}

				// return;
			}
		}


		// history.pushState(
		// 	'',
		// 	document.title,
		// 	window.location.pathname + window.location.search
		// );

		let modName;
		let modModal;
		let modNameCapitalized;

		if (is_mobile()) {

			/*
			* Convert hash-safe modal name back into
			* the readable modal name.
			*
			* Example:
			* contaminants -> contaminants
			* code_block   -> code block
			*/
			modModal = modalName.replace(/_/g, ' ');

			/*
			* PRIMARY MOBILE ID
			*
			* Actual mobile containers are generally:
			*
			* contaminants-container
			* phytoplankton-container
			* code-block-container
			*/
			modName =
				`${modModal
					.toLowerCase()
					.replace(/\s+/g, '-')}-container`;

			/*
			* FALLBACK:
			*
			* Keep support for any existing mobile
			* containers that may have been created
			* with capitalized words.
			*/
			const modModalCapitalized =
				modModal.replace(
					/\b\w/g,
					char => char.toUpperCase()
				);

			modNameCapitalized =
				`${modModalCapitalized
					.replace(/\s+/g, '-')}-container`;

		} else {

			/*
			* Desktop IDs already use the modal
			* slug directly.
			*/
			modName = modalName;
		}


		//____________________________
		// FIND MODAL OPEN CONTROL
		//____________________________

		let modalButton;

		if (is_mobile()) {

			console.log(
				'MOBILE modalName',
				modalName
			);

			console.log(
				'MOBILE modModal',
				modModal
			);

			console.log(
				'MOBILE modName',
				modName
			);

			console.log(
				'MOBILE modNameCapitalized',
				modNameCapitalized
			);


			/*
			* Use getElementById() here instead of
			* querySelector().
			*
			* This is safer for dynamically-generated
			* IDs and avoids CSS-selector issues.
			*/
			const modNameElement =
				document.getElementById(
					modName
				);

			const modNameCapitalizedElement =
				document.getElementById(
					modNameCapitalized
				);

			const modModalElement =
				document.getElementById(
					modModal
				);


			/*
			* 1. Preferred mobile container:
			*
			* contaminants-container
			*/
			if (modNameElement) {

				modalButton =
					modNameElement;

				console.log(
					'MOBILE modalButton found using modName',
					modalButton
				);

			/*
			* 2. Fallback for older/mixed-case IDs:
			*
			* Contaminants-container
			*/
			} else if (
				modNameCapitalizedElement
			) {

				modalButton =
					modNameCapitalizedElement;

				console.log(
					'MOBILE modalButton found using modNameCapitalized',
					modalButton
				);

			/*
			* 3. Final direct-ID fallback.
			*/
			} else if (
				modModalElement
			) {

				modalButton =
					modModalElement;

				console.log(
					'MOBILE modalButton found using modModal',
					modalButton
				);

			} else {

				/*
				* The mobile DOM is generated dynamically,
				* so none of the controls may exist yet.
				*
				* Wait for the normal lowercase container
				* first, with the capitalized version as
				* the alternate.
				*/
				modalButton =
					await waitForEitherElementHash(
						`#${modName}`,
						`#${modNameCapitalized}`
					);
			}

			console.log(
				'MOBILE modalButton',
				modalButton
			);
		}

		if (!is_mobile()) {

			console.log('DESKTOP modName', modName);
			console.log('DESKTOP modModal', modModal);


			modalButton = await waitForElementHash(`#${modName}`);
			console.log('DESKTOP modalButton', modalButton);
		}


		// DESKTOP
		if (!is_mobile()) {
			console.log('DESKTOP modName', modName);

			modalButton = await waitForElementHash(
				`#${modName}`
			);

			console.log(
				'DESKTOP modalButton',
				modalButton
			);
		}


		// Final safety check
		if (!modalButton) {
			throw new Error(
				`Could not find modal control. Tried "${modName}" and "${modModal}".`
			);
		}


		//____________________________
		// FIND ACTUAL CLICK TARGET
		//____________________________

		let modalClickTarget = modalButton;

		/*
		* Some SVG modal controls contain nested <g> elements
		* with the same ID:
		*
		* <g id="contaminants">
		*     <g id="contaminants">
		*         ...
		*     </g>
		* </g>
		*
		* Click the deepest matching element so the event can
		* bubble upward through all parent SVG elements.
		*/
		if (modalButton.tagName.toLowerCase() === 'g') {
			const nestedMatchingElements = Array.from(
				modalButton.querySelectorAll('[id]')
			).filter(
				element => element.id === modalButton.id
			);

			if (nestedMatchingElements.length > 0) {
				modalClickTarget =
					nestedMatchingElements[
						nestedMatchingElements.length - 1
					];
			}
		}

		console.log(
			'ABOUT TO CLICK MODAL:',
			{
				modalName,
				modName,
				modModal,
				modalButton,
				modalClickTarget,
				id: modalClickTarget.id,
				tagName: modalClickTarget.tagName
			}
		);


		//____________________________
		// CLICK MODAL
		//____________________________

		if (
			modalButton.dataset.sharedNavigationClicked !== 'true'
		) {
			modalButton.dataset.sharedNavigationClicked = 'true';

			if (
				modalClickTarget.tagName.toLowerCase() === 'g'
			) {
				modalClickTarget.dispatchEvent(
					new MouseEvent('click', {
						view: window,
						bubbles: true,
						cancelable: true
					})
				);

				console.log(
					'MODAL CLICK SVG <g>',
					modalClickTarget
				);
			} else {
				modalClickTarget.click();

				console.log(
					'MODAL CLICK REGULAR',
					modalClickTarget
				);
			}
		} else {
			console.log(
				'MODAL CLICK SKIPPED — already clicked:',
				modalButton.id
			);
		}

		try {
		    expandAccordionForLink(modalName);
		} catch {}

		// let modalIds = collectModalIds();
		// const excludedModalIds = [
		//     'title-container',
		//     'tagline-container',
		//     'accordion-container',
		//     'toc-container'
		// ];

		// modalIds = modalIds.filter((modalName) => !excludedModalIds.includes(modalName));
		// console.log('modalIds', modalIds);

		
		// if (!is_mobile() && !modalIds.includes(modalName)) {
		// 	alert("We couldn't find that content. It may have been moved, renamed, or deleted.");
		// }

		// if (is_mobile() && !modalIds.some(modalId => modalId.toLowerCase().replace(/-container$/, '') === modalName)) {
		// 	alert("We couldn't find that content. It may have been moved, renamed, or deleted.");
		// }

		//____________________________
		//TAB CONTROL SELECTION
		//____________________________
		let tabButton;
		let tabButtonId;
		if (is_mobile()) {
			tabButtonId = `${modalName}-${tabId}`;
			console.log('tabButtonId 3', tabButtonId);
			tabButton = await waitForElementById(tabButtonId);
			console.log('tabButton 3', tabButton);
			tabButton.click();
			console.log('TEST 3: MOBILE tabButton clicked');
		}
		if (!is_mobile()) {
			tabButton = await waitForElementHash(`#${modName}-${tabId}`);
			tabButtonId = `${modName}-${tabId}`;
			console.log('tabButton', tabButton);
			tabButton.click();
			console.log('TEST 4: DESKTOP tabButton clicked');
		}

		//____________________________
		//SET PANE ID AND FIGURE CONTROL SELECTION
		//____________________________

		let targetTabPaneId = `${modalName}-${tabId}-pane`;
		console.log('targetTabPaneId', targetTabPaneId);


		if (figureId) {

			if (submittedURL === constructedRestFigureURL) {

				try {
					const tabPane = await waitForElementById(targetTabPaneId);
					console.log('targetTabPaneId', targetTabPaneId);
					console.log('tabPane', tabPane);

					if (is_mobile()) {
						await new Promise((resolve) => {

							function checkTabState() {

								const isActive =
									tabPane.classList.contains('active');

								const isShown =
									tabPane.classList.contains('show');

								if (isActive && isShown) {
									resolve();
									return;
								}

								requestAnimationFrame(
									checkTabState
								);
							}

							checkTabState();
						});
												
					}


					const figureElement =
						await waitForElement(
							tabPane,
							`#figure-${figureId}`
						);

					// console.log('figureElement', figureElement);

					/*s
					* Wait until the figure actually contains its rendered content.
					*/
					const measurableElement =
					await waitForMeasurableElement(
						figureElement
					);

					/*
					* Give the browser two final layout frames after
					* the figure has been confirmed stable.
					*/
					await new Promise((resolve) => {
						window.requestAnimationFrame(() => {
							window.requestAnimationFrame(
								resolve
							);
						});
					});
			
					figureElement.scrollIntoView({
						behavior: 'smooth',
						block: 'start',
						inline: 'nearest'
					});


					const figureSuffix =
					figureId
						? `?figure=${encodeURIComponent(figureId)}`
						: '';

					const newHash =
						`#${modalName}/${tabId}${figureSuffix}`;

					window.history.replaceState(
						null,
						'',
						`${window.location.pathname}${window.location.search}${newHash}`
					);


				} catch (error) {

					alert("We couldn't find that content. It may have been moved, renamed, or deleted.");
					console.error(
						'Could not scroll to shared figure:',
						error
					);
				}
			}
		}
	} 
}

