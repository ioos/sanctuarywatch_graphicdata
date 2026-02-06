/**
 * Creates and renders the scene title, tagline, more information/photo dropdowns after scene API call. Called asynchronously within init function
 * @return {string} `String` - Numerical location of the scene (which instance its found in) but still a string, returned so scene location can be used within init
 * @throws {Error} - Throws an error if the network response is not OK or if the SVG cannot be fetched or parsed.
 *  @throws {Error} - Throws an error if scene data not found or error fetching data
 */
async function makeTitle() {
	try {
		const sceneData = title_arr;

		const scene_location = sceneData.scene_location;
		const title = sceneData.post_title;

		const titleDom = document.getElementById('title-container');
		const titleh1 = document.createElement('h1');
		titleh1.innerHTML = title;
		titleDom.appendChild(titleh1);

		if (is_mobile()) {
			titleh1.setAttribute(
				'style',
				'margin-top: 16px; justify-content: center;; align-content: center; display: flex;'
			);
		} else {
		}

		const accgroup = document.createElement('div');

		accgroup.classList.add('accordion');

		if (sceneData.scene_info_entries != 0) {
			const acc = make_scene_elements(
				'scene_info',
				'scene_info_text',
				'scene_info_url',
				sceneData,
				'more-info',
				'More Info'
			);
			accgroup.appendChild(acc);
		}
		if (sceneData.scene_photo_entries != 0) {
			const acc1 = make_scene_elements(
				'scene_photo',
				'scene_photo_text',
				'scene_photo_url',
				sceneData,
				'images',
				'Images'
			);
			accgroup.appendChild(acc1);
		}

		const row = document.createElement('div');
		row.classList.add('row');

		const col1 = document.createElement('div');
		col1.appendChild(accgroup);

		const col2 = document.createElement('div');

		if (!is_mobile()) {
			col1.classList.add('col-md-2');
			col2.classList.add('col-md-10');

			function adjustTitleContainerMargin() {
				if (window.innerWidth < 512) {
					document.querySelector(
						'#title-container'
					).style.marginLeft = '0%';
				}
			}
			adjustTitleContainerMargin();
			window.addEventListener('resize', adjustTitleContainerMargin);
		} else {
			col1.classList.add('col-md-2');
			col2.classList.add('col-md-10');
		}

		if (is_mobile()) {
			col1.setAttribute('style', 'max-width: 85%;');
			col2.setAttribute(
				'style',
				'padding-top: 5%; align-content: center; margin-left: 7%;'
			);
		}

		const titleTagline = document.createElement('p');
		titleTagline.innerHTML = sceneData.scene_tagline;
		titleTagline.style.fontStyle = 'italic';
		if (is_mobile()) {
			const item = createAccordionItem(
				'taglineAccId',
				'taglineHeaderId',
				'taglineCollapseId',
				'Tagline',
				sceneData.scene_tagline
			);
			accgroup.prepend(item);
		} else {
			col2.appendChild(titleTagline);
		}
		row.appendChild(col2);
		row.appendChild(col1);

		titleDom.append(row);

		let instance_overview_scene = sceneData.instance_overview_scene;
		if (instance_overview_scene === null) {
			instance_overview_scene = 'None';
		}
		// Google Tags
		sceneLoaded(
			title,
			sceneData.post_ID,
			instance_overview_scene,
			gaMeasurementID
		);
		setupSceneMoreInfoLinkTracking(title, sceneData.post_ID);
		setupSceneImagesLinkTracking(title, sceneData.post_ID);

		return sceneData;
	} catch (error) {
		if (!window.location.href.includes('post.php')) {
			console.error(
				'If this fires you really screwed something up',
				error
			);
		}
	}
}

//helper function for creating mobile grid for loadSVG:
/**
 * Creates a mobile grid layout for displaying icons in an SVG element.
 *
 * This function removes the outer container (using `remove_outer_div`), clones icons from an SVG element,
 * and organizes them into a responsive grid based on the screen's width and height. It adjusts the layout
 * when the window is resized, dynamically setting the number of columns and rows.
 *
 * @param {SVGElement}  svgElement   - The main SVG element that contains the icons to be displayed.
 * @param {Array}       iconsArr     - An array of icon objects containing the icon IDs and their metadata.
 * @param {HTMLElement} mobile_icons - A DOM element containing specific mobile versions of icons, if available.
 *
 * @return {void}
 */

function mobile_helper(svgElement, iconsArr, mobile_icons) {
	// Clear any existing mobile layout DOM container
	remove_outer_div();

	// Grab the <defs> section of the SVG (symbol definitions, gradients, etc.)
	const defs = svgElement.firstElementChild;
	const scene_toc_style = sceneData.scene_toc_style;

	function groupIconsBySection(iconsArr) {
		const grouped = {};
		const sectionOrderMap = {};
		iconsArr.forEach((iconId) => {
			if (
				scene_same_hover_color_sections !== 'yes' &&
				childObj[iconId] !== 'None'
			) {
				const section_num = childObj[iconId].section_name;
				const modal_icon_order = childObj[iconId].modal_icon_order;
				const modal_title = childObj[iconId].title;
				const this_scene_section = `scene_section${section_num}`;
				const this_scene_section_title = `scene_section_title${section_num}`;
				const this_color = `scene_section_hover_color${section_num}`;
				const text_color = `scene_section_hover_text_color${section_num}`;
				const hoverColor = sceneData[this_scene_section][this_color];
				const sectionTitle =
					sceneData[this_scene_section][this_scene_section_title];
				const hoverTextColor =
					sceneData[this_scene_section][text_color];
				const groupTitle = sectionTitle || 'Other';

				// Track section_num for sorting later
				sectionOrderMap[groupTitle] = parseInt(section_num);

				if (!grouped[groupTitle]) {
					grouped[groupTitle] = {
						sectionNum: parseInt(section_num),
						sectionColor: hoverColor,
						textColor: hoverTextColor,
						modal_titles: [],
						modal_orders: [],
						iconIds: [],
					};
				}
				grouped[groupTitle].iconIds.push(iconId);
				grouped[groupTitle].modal_titles.push(modal_title);
				grouped[groupTitle].modal_orders.push(modal_icon_order);
			}
			if (scene_same_hover_color_sections === 'yes') {
				const section_num = childObj[iconId].section_name;
				const modal_icon_order = childObj[iconId].modal_icon_order;
				const modal_title = childObj[iconId].title;
				const this_scene_section = `scene_section${section_num}`;
				const this_scene_section_title = `scene_section_title${section_num}`;
				const hoverColor = scene_default_hover_color;
				const sectionTitle =
					sceneData[this_scene_section][this_scene_section_title];
				const hoverTextColor = scene_default_hover_text_color;
				const groupTitle = sectionTitle || 'Other';

				// Track section_num for sorting later
				sectionOrderMap[groupTitle] = parseInt(section_num);

				if (!grouped[groupTitle]) {
					grouped[groupTitle] = {
						sectionNum: parseInt(section_num),
						sectionColor: hoverColor,
						textColor: hoverTextColor,
						modal_titles: [],
						modal_orders: [],
						iconIds: [],
					};
				}
				grouped[groupTitle].iconIds.push(iconId);
				grouped[groupTitle].modal_titles.push(modal_title);
				grouped[groupTitle].modal_orders.push(modal_icon_order);
			}
		});

		// Sort group titles by section_num
		const sortedGroupTitles = Object.entries(sectionOrderMap)
			.sort((a, b) => a[1] - b[1]) // sort by section_num
			.map((entry) => entry[0]); // get groupTitle

		// Rebuild grouped and hoverColors in sorted order
		const groupedSorted = {};

		sortedGroupTitles.forEach((groupTitle) => {
			const group = grouped[groupTitle];

			// Combine icon data into sortable array
			const combined = group.iconIds.map((iconId, i) => ({
				iconId,
				order: group.modal_orders[i] ?? 9999, // fallback for undefined/null
				title: group.modal_titles[i] ?? '',
			}));

			// Sort: first by modal_icon_order (numerically), then by title (alphabetically)
			combined.sort((a, b) => {
				const orderA = parseInt(a.order, 10);
				const orderB = parseInt(b.order, 10);
				if (orderA === orderB) {
					return a.title.localeCompare(b.title);
				}
				return orderA - orderB;
			});

			// Overwrite iconIds with sorted version
			group.iconIds = combined.map((item) => item.iconId);

			// Clean up: no need to keep modal_titles/modal_orders unless needed later
			delete group.modal_titles;
			delete group.modal_orders;

			groupedSorted[groupTitle] = group;
		});

		return groupedSorted;
	}

	function getSortedIconsArr(iconsArr) {
		const sortable = iconsArr.map((iconId) => {
			return {
				iconId,
				modal_icon_order:
					parseFloat(childObj[iconId]?.modal_icon_order) || 0,
				modal_title: childObj[iconId]?.title || '',
			};
		});

		sortable.sort((a, b) => {
			if (a.modal_icon_order !== b.modal_icon_order) {
				return a.modal_icon_order - b.modal_icon_order;
			}
			return a.modal_title.localeCompare(b.modal_title);
		});

		const sortedIconArr = sortable.map((item) => item.iconId);
		return sortedIconArr;
	}

	async function buildAccordionLayout(groupedIcons, numCols, numRows) {
		const outer_cont = document.querySelector('body > div.container-fluid');
		outer_cont.innerHTML = '';

		Object.entries(groupedIcons).forEach(
			([sectionTitle, sectionData], groupIndex) => {
				const { sectionNum, sectionColor, textColor, iconIds } =
					sectionData;

				let renderedIcons = 0;

				const accordionWrapper = document.createElement('div');
				accordionWrapper.classList.add('accordion-group');

				const header = document.createElement('div');
				header.classList.add('accordion-header');
				header.textContent = sectionTitle;
				header.style.cursor = 'pointer';
				header.style.padding = '12px';
				header.style.marginRight = '7px';
				header.style.marginLeft = '7px';
				header.style.backgroundColor = sectionColor;
				header.style.fontWeight = 'bold';
				header.style.color = textColor;
				//header.style.border = "1px solid #ccc";
				header.style.borderRadius = '10px';
				header.style.marginBottom = '16px';
				header.style.textAlign = 'center';
				header.innerHTML = `${sectionTitle} <i class="fas fa-chevron-down" style="float: right; padding-right: 12px; padding-top: 5px;"></i>`;
				header.setAttribute(
					'data-target',
					`accordion-body-${groupIndex}`
				);

				accordionWrapper.appendChild(header);

				const body = document.createElement('div');
				body.classList.add('accordion-body');
				body.setAttribute('id', `accordion-body-${groupIndex}`);
				body.style.display = 'none';
				//body.style.padding = "10px";
				body.style.border = '';

				let idx = 0; // Index of current icon in iconsArr
				// Create the grid rows
				for (let i = 0; i < numRows; i++) {
					const row_cont = document.createElement('div');
					row_cont.classList.add(
						'row',
						'flex-wrap',
						'justify-content-center'
					);
					row_cont.setAttribute('id', `row-${i}`);

					// Create the columns in each row
					for (let j = 0; j < numCols; j++) {
						if (idx < iconIds.length) {
							// Create a Bootstrap column container for each icon
							const cont = document.createElement('div');
							cont.classList.add('col-4');
							cont.style.paddingBottom = '10px';
							cont.style.paddingTop = '10px';
							cont.style.paddingLeft = '5px';
							cont.style.paddingRight = '5px';
							cont.style.fontWeight = 'bold';
							cont.style.border = '1px solid #000';
							cont.style.background =
								instance_color_settings.instance_mobile_tile_background_color;
							cont.style.color =
								instance_color_settings.instance_mobile_tile_text_color;
							cont.style.overflow = 'hidden';

							// Identify the current icon ID
							const currIcon = iconIds[idx];
							let key;

							if (
								childObj[currIcon] &&
								childObj[currIcon].section_name === sectionNum
							) {
								// If there is no mobile layer, use the default icon layer
								if (!has_mobile_layer(mobile_icons, currIcon)) {
									key = svgElement
										.querySelector(`#${currIcon}`)
										.cloneNode(true);
								} else {
									// Try to get the mobile-specific version of the icon
									const currIconMobile = currIcon + '-mobile';
									const mobileLayerElement = get_mobile_layer(
										mobile_icons,
										currIconMobile
									);

									if (mobileLayerElement) {
										key =
											mobileLayerElement.cloneNode(true);
									} else {
										console.warn(
											`Mobile layer for ${currIcon} expected but not found. Using default.`
										);
										key = svgElement
											.querySelector(`#${currIcon}`)
											.cloneNode(true);
									}
								}

								if (!key) {
									console.error(
										`Could not find SVG element for icon: ${currIcon}`
									);
									continue; // Skip rendering if the icon couldn't be found
								}
								// Set a unique ID for the container
								cont.setAttribute(
									'id',
									`${currIcon}-container`
								);

								// Create a blank SVG container
								// Add shared <defs> and icon content to the new SVG
								const svgClone = document.createElementNS(
									'http://www.w3.org/2000/svg',
									'svg'
								);
								svgClone.setAttribute(
									'xmlns',
									'http://www.w3.org/2000/svg'
								);
								svgClone.setAttribute(
									'xmlns:xlink',
									'http://www.w3.org/1999/xlink'
								);
								svgClone.append(defs.cloneNode(true));
								svgClone.append(key);
								cont.appendChild(svgClone);

								// Add a caption below the icon using childObj data
								const caption = document.createElement('div');
								if (childObj[currIcon]) {
									caption.innerText =
										childObj[currIcon].title;
								} else {
									caption.innerText =
										'not in wp yet, have to add';
								}
								caption.style.paddingBottom = '10px';
								//caption.style.fontSize = "14px";
								//caption.style.fontSize = "3.15vw";
								caption.style.overflow = 'hidden';

								const maxChars2 = 30; // your character limit
								const maxChars3 = 40; // your character limit
								const maxChars1 = 11; // your character limit

								if (caption.textContent.length <= maxChars1) {
									// Text is longer than limit — apply a certain style or class
									caption.style.fontSize = '12px'; // Example: smaller font size
									// or
									caption.classList.add('small-text'); // Example: add CSS class controlling size
								}
								if (
									caption.textContent.length > maxChars1 &&
									caption.textContent.length <= maxChars2
								) {
									// Text is longer than limit — apply a certain style or class
									caption.style.fontSize = '11px'; // Example: smaller font size
									// or
									caption.classList.add('small-text'); // Example: add CSS class controlling size
								}
								if (
									caption.textContent.length > maxChars3 &&
									caption.textContent.length <= maxChars3
								) {
									// Text is longer than limit — apply a certain style or class
									caption.style.fontSize = '10.5px'; // Example: smaller font size
									// or
									caption.classList.add('small-text'); // Example: add CSS class controlling size
								}
								if (caption.textContent.length > maxChars3) {
									// Text is longer than limit — apply a certain style or class
									caption.style.fontSize = '10px'; // Example: smaller font size
									// or
									caption.classList.add('small-text'); // Example: add CSS class controlling size
								} else {
									// Reset or apply default style
									caption.style.fontSize = '14px';
									caption.classList.remove('small-text');
								}

								// Set to last fitting size
								//caption.style.maxHeight = '10%'; // Add some space between icon and caption
								cont.appendChild(caption);

								// Append this icon container to the row
								row_cont.appendChild(cont);

								// Adjust the <svg>'s viewBox to fit the icon neatly

								body.style.display = 'block'; // temporarily force visible
								requestAnimationFrame(() => {
									const bbox = key.getBBox();
									svgClone.setAttribute(
										'viewBox',
										`${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
									);
									renderedIcons++;
									console.log(
										`Rendered icon: ${currIcon}, total rendered: ${renderedIcons}`
									);
									if (renderedIcons === iconIds.length) {
										body.style.display = 'none'; // only hide once ALL icons are done
									}
								});
							}
							idx++; // Move to next icon
						}
					}
					// Apply margin fix for outer container and append the row
					//body.style.marginLeft = '-1.5%';
					body.appendChild(row_cont);
				}

				accordionWrapper.appendChild(body);
				outer_cont.appendChild(accordionWrapper);
				outer_cont.style.maxWidth = '95%';

				header.addEventListener('click', () => {
					const current = document.getElementById(
						header.getAttribute('data-target')
					);
					const isVisible = current.style.display === 'block';
					current.style.display = isVisible ? 'none' : 'block';
				});
			}
		);
	}

	/**
	 * Builds the responsive grid layout of icons using a Bootstrap-style grid.
	 * For each icon, clones the appropriate layer (standard or mobile), wraps it in a mini <svg>,
	 * and adds it to a <div> container with caption text.
	 * @param numCols
	 * @param numRows
	 */
	function updateLayout(numCols, numRows) {
		// Select and clear the container that will hold all icon rows
		const outer_cont = document.querySelector('body > div.container-fluid');
		outer_cont.innerHTML = '';

		if (
			scene_toc_style === 'accordion' ||
			scene_toc_style === 'sectioned_list'
		) {
			const groupedIcons = groupIconsBySection(iconsArr);
			buildAccordionLayout(groupedIcons, numCols, numRows);
			return;
		}

		if (scene_toc_style === '' || scene_toc_style === 'list') {
			orderedIcons = getSortedIconsArr(iconsArr);
			let idx = 0; // Index of current icon in iconsArr
			// Create the grid rows
			for (let i = 0; i < numRows; i++) {
				const row_cont = document.createElement('div');
				row_cont.classList.add(
					'row',
					'flex-wrap',
					'justify-content-center'
				);
				row_cont.setAttribute('id', `row-${i}`);

				// Create the columns in each row
				for (let j = 0; j < numCols; j++) {
					if (idx < orderedIcons.length) {
						// Create a Bootstrap column container for each icon
						const cont = document.createElement('div');
						cont.classList.add('col-4');
						cont.style.paddingBottom = '10px';
						cont.style.paddingTop = '20px';
						cont.style.fontWeight = 'bold';
						cont.style.border = '1px solid #000';
						cont.style.paddingLeft = '5px';
						cont.style.paddingRight = '5px';
						cont.style.background =
							instance_color_settings.instance_mobile_tile_background_color;
						cont.style.color =
							instance_color_settings.instance_mobile_tile_text_color;

						// Create a blank SVG container
						const svgClone = document.createElementNS(
							'http://www.w3.org/2000/svg',
							'svg'
						);
						svgClone.setAttribute(
							'xmlns',
							'http://www.w3.org/2000/svg'
						);
						svgClone.setAttribute(
							'xmlns:xlink',
							'http://www.w3.org/1999/xlink'
						);
						cont.appendChild(svgClone);

						// Identify the current icon ID
						const currIcon = orderedIcons[idx];
						let key;

						// If there is no mobile layer, use the default icon layer
						if (!has_mobile_layer(mobile_icons, currIcon)) {
							key = svgElement
								.querySelector(`#${currIcon}`)
								.cloneNode(true);
						} else {
							// Try to get the mobile-specific version of the icon
							const currIconMobile = currIcon + '-mobile';
							const mobileLayerElement = get_mobile_layer(
								mobile_icons,
								currIconMobile
							);

							if (mobileLayerElement) {
								key = mobileLayerElement.cloneNode(true);
							} else {
								console.warn(
									`Mobile layer for ${currIcon} expected but not found. Using default.`
								);
								key = svgElement
									.querySelector(`#${currIcon}`)
									.cloneNode(true);
							}
						}

						if (!key) {
							console.error(
								`Could not find SVG element for icon: ${currIcon}`
							);
							continue; // Skip rendering if the icon couldn't be found
						}
						// Set a unique ID for the container
						cont.setAttribute('id', `${currIcon}-container`);

						// Add shared <defs> and icon content to the new SVG
						svgClone.append(defs.cloneNode(true));
						svgClone.append(key);

						// Add a caption below the icon using childObj data
						const caption = document.createElement('div');
						if (childObj[currIcon]) {
							caption.innerText = childObj[currIcon].title;
						} else {
							caption.innerText = 'not in wp yet, have to add';
						}
						caption.style.fontSize = '14px';
						caption.style.paddingBottom = '10px';
						cont.appendChild(caption);

						// Append this icon container to the row
						row_cont.appendChild(cont);

						// Adjust the <svg>'s viewBox to fit the icon neatly
						setTimeout(() => {
							const bbox = key.getBBox();
							svgClone.setAttribute(
								'viewBox',
								`${bbox.x} ${bbox.y} ${bbox.width} ${bbox.height}`
							);
						}, 0);

						idx++; // Move to next icon
					}
				}
				// Apply margin fix for outer container and append the row
				//outer_cont.style.marginLeft = '-1.5%';
				outer_cont.appendChild(row_cont);
			}
		}
	}

	/**
	 * Dynamically sets the number of columns and rows depending on screen orientation.
	 * It also updates layout and adjusts styling for elements on landscape vs portrait.
	 */
	function updateNumCols() {
		console.log('updateNumCols fired (debounced)');

		let numCols;
		let numRows;

		// Default style values for portrait
		const ogMobViewImage =
			'transform: scale(0.3); margin-right: 65%; margin-top: -70%; margin-bottom: -70%';
		const ogSceneFluid = 'margin-top: 70%;'; //margin-left: -1.5%;
		const colmd2 = document.querySelector(
			'#title-container > div > div.col-md-2'
		);
		const ogColmd2 = colmd2.getAttribute('style', '');

		// === LANDSCAPE MODE ===
		if (window.innerWidth > window.innerHeight) {
			numCols = 4;

			document
				.querySelector('#mobile-view-image')
				.setAttribute(
					'style',
					'transform: scale(0.5); margin-right: 35%; margin-top: -23%'
				);
			document
				.querySelector('#scene-fluid')
				.setAttribute('style', 'margin-top: 25%; display: block'); //margin-left: -1.5%;
			document
				.querySelector('#title-container > div > div.col-md-2')
				.setAttribute('style', 'width: 100%');
			document
				.querySelector('#mobileModal > div')
				.setAttribute(
					'style',
					'z-index: 9999;margin-top: 5%;max-width: 88%;'
				);
			document
				.querySelector('#myModal > div')
				.setAttribute(
					'style',
					'z-index: 9999;margin-top: 5%;max-width: 88%;'
				);

			// === PORTRAIT MODE ===
		} else {
			numCols = 3;

			const mobViewImage = document.querySelector('#mobile-view-image');
			mobViewImage.setAttribute('style', ''); // Clear
			mobViewImage.setAttribute('style', ogMobViewImage);

			const sceneFluid = document.querySelector('#scene-fluid');
			sceneFluid.setAttribute('style', '');
			sceneFluid.setAttribute('style', ogSceneFluid);

			colmd2.setAttribute('style', '');
			colmd2.setAttribute('style', ogColmd2);

			document
				.querySelector('#mobileModal > div')
				.setAttribute(
					'style',
					'z-index: 9999;margin-top: 5%;max-width: 88%;'
				);
			document
				.querySelector('#myModal > div')
				.setAttribute(
					'style',
					'z-index: 9999;margin-top: 5%;max-width: 88%;'
				);
		}

		// Calculate the number of rows based on icon count
		numRows = Math.ceil(iconsArr.length / numCols);

		// Apply the layout update
		updateLayout(numCols, numRows);
		add_modal(); // Reattach modals (tooltip/dialog logic)
	}

	// === Initial Setup ===
	updateNumCols(); // Build layout based on current orientation

	// === Listen for window resizes (debounced) ===
	const debouncedUpdateNumCols = debounce(updateNumCols, 250);
	window.addEventListener('resize', debouncedUpdateNumCols);
}

/**
 * Handles the visibility and styling of icons within an SVG element based on their association with modals.
 *
 * This function applies specific behaviors to "orphaned" icons (icons not associated with any modal)
 * based on the `scene_orphan_icon_action` and `scene_orphan_icon_color` properties from the `sceneData` object.
 * It also adds a tooltip to orphaned icons when hovered.
 *
 * @param {SVGElement} svgElement     - The SVG element containing the icons to be processed.
 * @param {string[]}   visible_modals - An array of modal IDs associated with the icons.
 *
 *                                    Behavior:
 *                                    - Resets styles for all top-level icons.
 *                                    - Applies specific styles or behaviors to orphaned icons based on the `scene_orphan_icon_action`:
 *                                    - `"hide"`: Hides the icon by setting its opacity to 0 and disabling pointer events.
 *                                    - `"translucent"`: Makes the icon partially transparent by setting its opacity to 0.25.
 *                                    - `"color"`: Changes the fill color of the icon to the value specified in `scene_orphan_icon_color`.
 *                                    - Default: Logs a warning for unknown modes.
 *                                    - Adds a tooltip to orphaned icons with the message "Not currently available" when hovered.
 *
 *                                    Notes:
 *                                    - Only top-level icons (direct children of the `g#icons` group) are processed.
 *                                    - The function assumes the presence of a global `sceneData` object with the required properties.
 *
 *                                    Example Usage:
 *                                    ```javascript
 *                                    const svgElement = document.querySelector('svg#mySvg');
 *                                    const associatedModals = ['modal1', 'modal2'];
 *                                    handleIconVisibility(svgElement, associatedModals);
 *                                    ```
 */
//original code is documented in issue #243 https://github.com/ioos/sanctuarywatch/issues/243
function handleIconVisibility(svgElement, visible_modals) {
	if (!svgElement || !Array.isArray(visible_modals)) {
		return;
	}

	debugger;
	const modalSet = new Set(visible_modals);
	const mode = sceneData.scene_orphan_icon_action;
	const fill_color = sceneData.scene_orphan_icon_color;

	// Inkscape-compatible: detect top-level icon groups (layers or <g id> inside #icons)
	let topLevelIcons = [];

	const iconGroup = svgElement.querySelector('g#icons');
	if (iconGroup) {
		topLevelIcons = Array.from(iconGroup.children)
			.filter((el) => el.tagName === 'g' && el.id)
			.map((el) => el.id);
	} else {
		// Fallback: treat all Inkscape layers as top-level icons
		topLevelIcons = Array.from(svgElement.querySelectorAll('g[id]'))
			.filter((el) => el.getAttribute('inkscape:groupmode') === 'layer')
			.map((el) => el.id);
	}

	svgElement.querySelectorAll('g[id]').forEach((icon) => {
		const iconId = icon.id;
		if (!topLevelIcons.includes(iconId)) {
			return;
		}

		const isAssociated = modalSet.has(iconId);

		// Reset styles
		icon.style.opacity = '';
		icon.style.display = '';
		icon.style.pointerEvents = '';
		icon.querySelectorAll('*').forEach((el) => {
			el.style.fill = '';
		});

		if (mode === 'visible' || isAssociated) {
			return;
		}

		// Apply orphan style
		switch (mode) {
			case 'hide':
				icon.style.opacity = '0';
				icon.style.pointerEvents = 'none';
				break;
			case 'translucent':
				icon.style.opacity = '0.25';
				break;
			case 'color':
				icon.querySelectorAll('*').forEach((el) => {
					el.style.fill = fill_color;
				});
				break;
			default:
				console.warn('Unknown orphan icon mode:', mode);
		}

		// Tooltip listeners
		if (!icon.dataset.tooltipBound) {
			icon.addEventListener('mouseenter', function (e) {
				const tooltip = document.createElement('div');
				tooltip.className = 'icon-tooltip';
				tooltip.textContent = 'Not currently available';
				tooltip.style.position = 'absolute';
				tooltip.style.padding = '6px 10px';
				tooltip.style.backgroundColor = '#333';
				tooltip.style.color = '#fff';
				tooltip.style.borderRadius = '4px';
				tooltip.style.fontSize = '13px';
				tooltip.style.pointerEvents = 'none';
				tooltip.style.zIndex = '9999';
				tooltip.style.top = e.pageY + 10 + 'px';
				tooltip.style.left = e.pageX + 10 + 'px';
				tooltip.id = 'orphanIconTooltip';
				document.body.appendChild(tooltip);
			});

			icon.addEventListener('mousemove', function (e) {
				const tooltip = document.getElementById('orphanIconTooltip');
				if (tooltip) {
					tooltip.style.top = e.pageY + 10 + 'px';
					tooltip.style.left = e.pageX + 10 + 'px';
				}
			});

			icon.addEventListener('mouseleave', function () {
				const tooltip = document.getElementById('orphanIconTooltip');
				if (tooltip) {
					tooltip.remove();
				}
			});

			// Mark as bound to avoid duplicate tooltips
			icon.dataset.tooltipBound = 'true';
		}
	});
}

/**
 * Creates HTML elements that represent collapsible sections with links to additional scene information.
 * This function generates a list of scene information items (like text and URLs) and wraps them in an accordion component.
 *
 * @param {string} info       - The base name of the field in `sceneData` representing scene information.
 *                            This value will be concatenated with a number (1 to 6) to create the full field name.
 * @param {string} iText      - The base name of the field in `sceneData` representing the text information for the scene.
 *                            This will be concatenated with a number (1 to 6) to fetch the corresponding text.
 * @param {string} iUrl       - The base name of the field in `sceneData` representing the URL information for the scene.
 *                            This will be concatenated with a number (1 to 6) to fetch the corresponding URL.
 * @param {Object} sceneData - The dataset containing information about the scene, which includes fields for text and URL.
 * @param {string} type       - The type identifier, used to generate unique HTML element IDs.
 * @param {string} name       - The display name for the accordion section header.
 *
 * @return {HTMLElement} - Returns an accordion item element (generated via `createAccordionItem`) containing the list of scene links.
 *
 * This function is typically used in `makeTitle` to generate the "More Info" and "Images" sections for each scene. It iterates through
 * a predefined set of numbered fields (from 1 to 6) in the `sceneData`, checking for non-empty text and URLs. If valid data is found,
 * it creates a collapsible accordion section with the relevant links and displays them.
 */
function make_scene_elements(info, iText, iUrl, sceneData, type, name) {
	let collapseListHTML = '<div><ul>';
	for (let i = 1; i < 7; i++) {
		const info_field = info + i;
		const info_text = iText + i;
		const info_url = iUrl + i;

		let scene_info_url;

		if (iUrl === 'scene_photo_url') {
			const photoLoc = 'scene_photo_location' + i;
			if (sceneData[info_field][photoLoc] === 'External') {
				scene_info_url = sceneData[info_field][info_url];
			} else {
				const internal = 'scene_photo_internal' + i;
				scene_info_url = sceneData[info_field][internal];
			}
		} else {
			scene_info_url = sceneData[info_field][info_url];
		}

		const scene_info_text = sceneData[info_field][info_text];

		if (scene_info_text === '' && scene_info_url === '') {
			continue;
		}

		const listItem = document.createElement('li');
		const anchor = document.createElement('a');
		anchor.setAttribute('href', 'test');
		anchor.textContent = 'test';

		listItem.appendChild(anchor);

		collapseListHTML += `<li> <a href="${scene_info_url}" target="_blank">${scene_info_text}</a> </li>`;
	}
	collapseListHTML += '</ul></div>';
	const acc = createAccordionItem(
		`${type}-item-1`,
		`${type}-header-1`,
		`${type}-collapse-1`,
		name,
		collapseListHTML
	);

	return acc;
}

/**
 * Checks whether or not an icon has an associated mobile layer. Looks at mob_icons elementm
 * @param  mob_icons
 * @param  elemname
 * @return {boolean} `Boolean` - Numerical location of the scene (which instance its found in) but still a string, returned so scene location can be used within init
 * @throws {Error} - Throws an error if the network response is not OK or if the SVG cannot be fetched or parsed.
 * * @throws {Error} - Throws an error if scene data not found or error fetching data
 */
function has_mobile_layer(mob_icons, elemname) {
	if (mob_icons === null) {
		return false;
	}
	for (let i = 0; i < mob_icons.children.length; i++) {
		const child = mob_icons.children[i];
		const label = child.getAttribute('id');
		const mobileElemName = elemname + '-mobile';
		if (label === mobileElemName) {
			return true;
		}
	}
	return false;
}

// Below is the function that will be used to include SVGs within each scene
/**
 * Accesses the SVG image for the scene, checks type of device, renders appropriate scene layout by calling other helper functions.
 * all of the top-level helper functions that render different elements of the DOM are called within here.
 * based on link_svg from infographiq.js
 *
 * @param {string} url         - The URL of the SVG to be fetched, provided from the PHP backend.
 * @param {string} containerId - The ID of the DOM element to which the SVG will be appended.
 * @return {void} `void` - Modifies the DOM but does not return any value.
 * @throws {Error} - Throws an error if the network response is not OK or if the SVG cannot be fetched or parsed.
 */
async function loadSVG(url, containerId) {
	// Step 1: Fetch the SVG content
	const response = await fetch(url);
	if (!response.ok) {
		throw new Error('Network response was not ok');
	}

	// Step 2: Parse the SVG content
	const svgText = await response.text();
	let svgDoc;
	let svgElement;

	const parser = new DOMParser();
	svgDoc = parser.parseFromString(svgText, 'image/svg+xml');

	// Assign (don’t redeclare)
	svgElement = svgDoc.documentElement;
	svgElement.setAttribute('id', 'svg-elem');

	const container = document.getElementById(containerId);
	container.appendChild(svgElement);

	//LOGIC FOR OPTIONS FOR SCENE PREVIEW MODE
	if (
		window.location.href.includes('post.php') &&
		adminEditTitle === 'Edit Scene'
	) {
		const modalHeader = document.querySelector('.modal-header');
		if (modalHeader) {
			const textNode = document.createElement('span');
			textNode.textContent =
				'This preview is intended to help validate that the SVG and the icons inside of it are formatted correctly. It is not intended to be a full replication of the way a scene functions when published.';
			textNode.style.fontSize = '.65rem';
			textNode.style.textAlign = 'center';
			textNode.style.color = 'red';
			textNode.style.paddingLeft = '5%';
			modalHeader.prepend(textNode); // or append()
		}
		modalHeader.style.borderBottom = 'none';

		const modalWindow = document.querySelector(
			'.modal-dialog.modal-xl.modal-dialog-scrollable'
		);
		modalWindow.style.paddingTop = '2%';

		const iconsLayer = document
			.getElementById('svg-elem')
			.querySelector('g[id="icons"]');
		visible_modals = iconsLayer
			? Array.from(iconsLayer.children)
					.filter((el) => el.tagName.toLowerCase() === 'g')
					.map((el) => el.id)
			: [];

		svgElement = document.getElementById('svg-elem');
		svgElement.style.width = '100%';
		svgElement.style.height = 'auto';

		sceneRow = document.getElementById('scene-row');
		sceneRow.style.marginTop = '20px';

		scene_text_toggle = title_arr.scene_text_toggle; //"toggle_on";
		scene_full_screen_button = title_arr.scene_full_screen_button; //"yes";
		scene_toc_style = 'list';

		scene_default_hover_color = title_arr.scene_hover_color;
		scene_hover_text_color = title_arr.scene_hover_text_color;
		//scene_default_hover_color = "#FFFF00"; // Gold

		function toWpDateTimeLocal(d = new Date()) {
			const pad = (n) => String(n).padStart(2, '0');
			return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())} ${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
		}

		function buildVisibleModalsObject(visible_modals, opts = {}) {
			const now = new Date();
			const nowStr = toWpDateTimeLocal(now);

			const sceneId = opts.sceneId ?? 0;
			const postAuthor = String(opts.postAuthor ?? '1');

			// Optional: if you want GMT strings too (WP-style)
			const nowGmtStr = opts.useGmt
				? toWpDateTimeLocal(
						new Date(
							now.getTime() + now.getTimezoneOffset() * 60000
						)
					)
				: nowStr;

			return (visible_modals || []).map((name, idx) => ({
				title: name,
				modal_id: 0,
				external_url: '',
				modal: true,
				scene: {
					ID: sceneId,
					post_author: postAuthor,
					post_date: nowStr,
					post_date_gmt: nowGmtStr,
					post_content: '',
					post_title: '',
					post_excerpt: '',
					post_status: 'publish',
					comment_status: 'closed',
					ping_status: 'closed',
					post_password: '',
					post_name: '',
					to_ping: '',
					pinged: '',
					post_modified: nowStr,
					post_modified_gmt: nowGmtStr,
					post_content_filtered: '',
					post_parent: 0,
					guid: '',
					menu_order: 0,
					post_type: 'scene',
					post_mime_type: '',
					comment_count: '0',
					filter: 'raw',
				},
				section_name: '1',
				original_name: name,
				modal_icon_order: idx + 1, // sequential order
			}));
		}

		sortedChildObjs = buildVisibleModalsObject(visible_modals, {
			sceneId: Number(
				document.getElementsByName('post_ID')?.[0]?.value || 0
			),
			postAuthor: '1',
			useGmt: true, // set false if you want local time for both
		});

		// Initialize an array to hold the sublayers
		let sublayers = [];
		// Iterate over the child elements of the "icons" layer
		iconsLayer.childNodes.forEach((node) => {
			// Check if the node is an element and push its id to the sublayers array
			if (node.nodeType === Node.ELEMENT_NODE) {
				sublayers.push(node.id);
			}
		});
		sublayers = sublayers.sort();

		// Define hover colors
		sublayers.forEach((listElement) => {
			const iconLayer = svgElement.getElementById(listElement);

			// Select all child elements
			const subElements = iconLayer.querySelectorAll('*');

			// Loop through each sub-element and update its stroke-width and color
			subElements.forEach((element) => {
				element.style.strokeWidth = '2';
				element.style.stroke = scene_default_hover_color;
			});
		});
	}

	// checking if user device is touchscreen
	if (is_touchscreen()) {
		if (is_mobile() && deviceDetector.device != 'tablet') {
			//a phone and not a tablet; screen will be its own UI here
			//smaller image preview here for mobile
			const fullImgCont = document.querySelector('#mobile-view-image');

			const titleRowCont = document.querySelector(
				'#title-container > div'
			);
			titleRowCont.style.display = 'flex';
			titleRowCont.style.justifyContent = 'center';
			titleRowCont.style.alignItems = 'center';

			const sceneButton = document.createElement('button');
			sceneButton.innerHTML = '<strong>View Full Scene</strong>';
			sceneButton.setAttribute(
				'style',
				'margin-top: 16px; max-width: 79%; border-radius: 10px; padding: 10px'
			);
			sceneButton.setAttribute('class', 'btn ');
			sceneButton.setAttribute('class', 'ViewSceneButton');
			sceneButton.setAttribute('data-toggle', 'modal');

			titleRowCont.appendChild(sceneButton);
			const svgElementMobileDisplay = svgElement.cloneNode(true);
			svgElementMobileDisplay.style.height = '10%';
			svgElementMobileDisplay.style.width = '100%';

			const modal = document.getElementById('mobileModal');
			const modalBody = document.querySelector(
				'#mobileModal > div > div > div.modal-body'
			);
			modalBody.appendChild(svgElementMobileDisplay);

			sceneButton.onclick = function () {
				modal.style.display = 'block';
			};

			// When the user clicks anywhere outside of the modal, close it
			window.onclick = function (event) {
				if (event.target === modal) {
					modal.style.display = 'none';
					history.pushState(
						'',
						document.title,
						window.location.pathname + window.location.search
					);
				}
			};
			// let closeButton = document.querySelector("#mobileModal > div > div > div.modal-footer > button");
			const closeButton = document.querySelector('#close1');
			closeButton.onclick = function () {
				modal.style.display = 'none';
				history.pushState(
					'',
					document.title,
					window.location.pathname + window.location.search
				);
			};

			const mobileBool = true;
			const iconsElement = svgElement.getElementById('icons');
			//fix here
			let mobileIcons = null;
			if (svgElement.getElementById('mobile')) {
				mobileIcons = svgElement
					.getElementById('mobile')
					.cloneNode(true);
			}

			const iconsArr = Object.keys(childObj);
			mobile_helper(svgElement, iconsArr, mobileIcons);
		} else {
			//if it gets here, device is a tablet
			//hide mobile icons

			// remove_outer_div();
			window.addEventListener('load', function () {
				const mob_icons = document.querySelector('#mobile');
				if (mob_icons) {
					mob_icons.setAttribute('display', 'none');
				}
			});

			handleIconVisibility(svgElement, visible_modals);
			container.appendChild(svgElement);
			toggle_text();
			full_screen_button('svg1');
			if (scene_toc_style === 'list') {
				list_toc();
			} else {
				table_of_contents();
			}
			add_modal();
			flicker_highlight_icons();
		}
	} else {
		//device is a PC
		//hide mobile icons
		window.addEventListener('load', function () {
			const mob_icons = document.querySelector('#mobile');
			if (mob_icons) {
				mob_icons.setAttribute('display', 'none');
			}
		});
		try {
			handleIconVisibility(svgElement, visible_modals);
		} catch (error) {
			console.error('Error handling icon visibility:', error);
		}

		container.appendChild(svgElement);

		if (!window.location.href.includes('post.php')) {
			highlight_icons();
		}

		toggle_text();
		full_screen_button('svg1');
		if (scene_toc_style === 'list') {
			list_toc();
		} else {
			table_of_contents();
		}
		add_modal();
	}

	// } catch (error) {
	//     console.error('Error fetching or parsing the SVG:', error);
	// }
}

//highlight items on mouseover, remove highlight when off;
//CHANGE HERE FOR TABLET STUFF

/**
 * Adds hover effects to SVG elements based on `childObj` keys, meant for PC layout.
 * Highlights the icon by changing its stroke color and width on mouseover,
 * using section-specific colors if enabled, and resets the style on mouseout.
 *
 * @return {void} - `void` Modifies DOM element styles in place.
 */
function highlight_icons() {
	for (const key in childObj) {
		const elem = document.querySelector('g[id="' + key + '"]');
		elem.addEventListener('mouseover', function (e) {
			const elemCollection = elem.querySelectorAll('*');
			let hoverColor;
			let hoverTextColor;

			elemCollection.forEach((subElem) => {
				if (
					scene_same_hover_color_sections !== 'yes' &&
					sectionObj[key] !== 'None'
				) {
					const section_name = childObj[key].original_name;
					const section_num = childObj[key].section_name;
					const this_scene_section = `scene_section${section_num}`;
					const this_color = `scene_section_hover_color${section_num}`;
					const text_color = `scene_section_hover_text_color${section_num}`;
					hoverColor = sceneData[this_scene_section][this_color];
					hoverTextColor = sceneData[this_scene_section][text_color];
					subElem.style.stroke = hoverColor;
				} else {
					hoverColor = scene_default_hover_color;
					hoverTextColor = scene_default_hover_text_color;
					subElem.style.stroke = hoverColor;
				}

				subElem.style.strokeWidth = '3px';
			});

			// Create and show the tooltip box
			const tooltip = document.createElement('div');
			tooltip.className = 'hover-key-box';
			tooltip.textContent = childObj[key].title;
			tooltip.style.position = 'absolute';
			tooltip.style.padding = '5px 10px';
			tooltip.style.backgroundColor = hoverColor;
			tooltip.style.color = hoverTextColor;
			tooltip.style.borderRadius = '4px';
			tooltip.style.fontSize = '14px';
			tooltip.style.pointerEvents = 'none';
			tooltip.style.zIndex = '9999';
			tooltip.id = 'hoverKeyTooltip';
			document.body.appendChild(tooltip);

			// Initial position
			moveTooltip(e, elem, tooltip);
		});

		elem.addEventListener('mousemove', function (e) {
			const tooltip = document.getElementById('hoverKeyTooltip');
			if (tooltip) {
				moveTooltip(e, elem, tooltip);
			}
		});

		elem.addEventListener('mouseout', function () {
			const elemCollection = elem.querySelectorAll('*');
			elemCollection.forEach((subElem) => {
				subElem.style.stroke = '';
				subElem.style.strokeWidth = '';
			});

			// Remove the tooltip
			const tooltip = document.getElementById('hoverKeyTooltip');
			if (tooltip) {
				tooltip.remove();
			}
		});
	}

	function moveTooltip(e, elem, tooltip) {
		const svg = elem.closest('svg');
		if (!svg) {
			return;
		}

		const svgRect = svg.getBoundingClientRect();
		const svgMidX = svgRect.left + svgRect.width / 2;

		if (e.pageX > svgMidX) {
			// On the right half: show tooltip to the left
			tooltip.style.left = e.pageX - tooltip.offsetWidth - 15 + 'px';
		} else {
			// On the left half: show tooltip to the right
			tooltip.style.left = e.pageX + 15 + 'px';
		}
		tooltip.style.top = e.pageY + 10 + 'px';
	}
}

/**
 * Adds flicker effects to SVG elements based on `childObj` keys, meant for tablet layout.
 * Icons flicker their corresponding color on a short time interval
 * using section-specific colors if enabled
 *
 * @return {void} - `void` Modifies DOM element styles in place.
 */
function flicker_highlight_icons() {
	for (const key in childObj) {
		const elem = document.querySelector('g[id="' + key + '"]');
		if (elem) {
			// Add transition for smooth fading

			elem.style.transition = 'stroke-opacity 1s ease-in-out';

			// Initial state
			if (
				scene_same_hover_color_sections != 'yes' &&
				sectionObj[key] != 'None'
			) {
				//this should be done on the SCENE side of things, will havet o bring this back
				const section_name = sectionObj[key];
				const section_num = section_name.substring(
					section_name.length - 1,
					section_name.length
				);

				const this_color = `scene_section_hover_color${section_num}`;
				const text_color = `scene_section_hover_text_color${section_num}`;
				elem.style.stroke = sceneData[sectionObj[key]][this_color];
			} else {
				elem.style.stroke = scene_default_hover_color;
			}

			elem.style.strokeWidth = '3';
			elem.style.strokeOpacity = '0';

			// Create flickering effect
			let increasing = true;
			setInterval(() => {
				if (increasing) {
					elem.style.strokeOpacity = '0.5';
					increasing = false;
				} else {
					elem.style.strokeOpacity = '0';
					increasing = true;
				}
			}, 1800); // Change every 1 second
		}
	}
}

/**
 * Creates and displays a full-screen button for the scene SVG element.
 * This button allows users to view scene in full screen (and escape to leave)
 *
 * @param {string} svgId - The ID of the SVG element to be made full-screen.
 *
 *                       The function performs the following:
 *                       1. Checks if the instance allows a full-screen button (within WP) and if the browser supports full-screen functionality.
 *                       2. If supported, creates a button with appropriate attributes and prepends it to the container (`#toc-container`).
 *                       3. Sets up an event listener on the SVG element to adjust its dimensions when entering or exiting full-screen mode.
 *                       4. Defines the `openFullScreen` function to trigger full-screen mode for the SVG and appends a modal to it.
 *                       5. Adds a click event to the button that calls the `openFullScreen` function.
 *
 *                       Usage: called within load_svg
 */
function full_screen_button(svgId) {
	if (scene_full_screen_button != 'yes') {
		return;
	}

	if (document.fullscreenEnabled || document.webkitFullscreenEnabled) {
		const svg = document.querySelector('#svg1 svg');
		const viewBox = svg.viewBox.baseVal;

		const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
		const rect = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'rect'
		);
		rect.setAttribute('width', '80');
		rect.setAttribute('height', '20');
		rect.setAttribute('fill', '#03386c');
		rect.setAttribute('rx', '5');

		const text = document.createElementNS(
			'http://www.w3.org/2000/svg',
			'text'
		);
		text.textContent = 'Full Screen';
		text.setAttribute('fill', 'white');
		text.setAttribute('font-size', '12');
		text.setAttribute('text-anchor', 'middle');
		text.setAttribute('dominant-baseline', 'middle');
		text.setAttribute('x', '40');
		text.setAttribute('y', '10');

		g.appendChild(rect);
		g.appendChild(text);
		g.setAttribute('transform', `translate(${viewBox.width - 87}, 10)`);

		svg.appendChild(g);

		const webkitElem = document.getElementById(svgId);
		webkitElem.addEventListener('webkitfullscreenchange', (event) => {
			if (document.webkitFullscreenElement) {
				webkitElem.style.width = window.innerWidth + 'px';
				webkitElem.style.height = window.innerHeight + 'px';
			} else {
				webkitElem.style.width = width;
				webkitElem.style.height = height;
			}
		});

		function toggleFullScreen() {
			const elem = document.getElementById(svgId);
			const svg = elem.querySelector('svg');

			if (
				!document.fullscreenElement &&
				!document.webkitFullscreenElement
			) {
				// Apply styles for fullscreen with aspect ratio preservation
				elem.style.backgroundColor = 'black';
				elem.style.display = 'flex';
				elem.style.alignItems = 'center';
				elem.style.justifyContent = 'center';

				// Set SVG to use full viewport with aspect ratio preserved
				svg.style.width = '100%';
				svg.style.height = '100%';
				svg.style.maxWidth = '100vw';
				svg.style.maxHeight = '100vh';
				svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

				if (elem.requestFullscreen) {
					elem.requestFullscreen();
				} else if (elem.webkitRequestFullscreen) {
					elem.webkitRequestFullscreen();
				}
				text.textContent = 'Exit';

				const modal = document.getElementById('myModal');
				elem.prepend(modal);
			} else {
				// Remove fullscreen styles
				elem.style.backgroundColor = '';
				elem.style.display = '';
				elem.style.alignItems = '';
				elem.style.justifyContent = '';

				svg.style.width = '';
				svg.style.height = '';
				svg.style.maxWidth = '';
				svg.style.maxHeight = '';
				svg.setAttribute('preserveAspectRatio', 'xMidYMid meet');

				if (document.exitFullscreen) {
					document.exitFullscreen();
				} else if (document.webkitExitFullscreen) {
					document.webkitExitFullscreen();
				}
				text.textContent = 'Full Screen';
			}
		}

		g.addEventListener('click', toggleFullScreen);
		document.addEventListener('fullscreenchange', function () {
			if (!document.fullscreenElement) {
				text.textContent = 'Full Screen';
			}
		});

		document.addEventListener('webkitfullscreenchange', function () {
			if (!document.webkitFullscreenElement) {
				text.textContent = 'Full Screen';
			}
		});

		document.addEventListener('keydown', function (event) {
			if (
				event.key === 'Escape' &&
				(document.fullscreenElement || document.webkitFullscreenElement)
			) {
				text.textContent = 'Full Screen';
			}
		});
	}
}

/**
 * Creates a toggle button that lets user toggle on/off the text within the scene.
 *
 * The function performs the following:
 * 1. Checks if the instance wants the toggle button or not (within WP)
 * 2. If supported, creates a button with appropriate attributes and prepends it to the container (`#toc-container`).
 * 3. Based on the user-defined initial state of the toggle (again in WP), either sets toggle to on or off.
 * 4. Adds a click event to the button that shows/hides text from element
 *
 * Usage: called within load_svg
 */
function toggle_text() {
	if (scene_text_toggle === 'none') {
		return;
	}

	const initialState = scene_text_toggle === 'toggle_on'; //this should be done on the SCENE side of things
	const svgText = document.querySelector('#text');

	if (initialState) {
		svgText.setAttribute('display', '');
	} else {
		svgText.setAttribute('display', 'None');
	}

	const svg = document.querySelector('#svg1 svg');
	// Get the SVG's viewBox
	const viewBox = svg.viewBox.baseVal;
	// Create a group element to hold our button
	const g = document.createElementNS('http://www.w3.org/2000/svg', 'g');
	// Create a rect element for the button background
	const rect = document.createElementNS('http://www.w3.org/2000/svg', 'rect');
	rect.setAttribute('width', '60');
	rect.setAttribute('height', '20');
	rect.setAttribute('fill', '#007bff');
	rect.setAttribute('rx', '5');
	// Create a text element for the button label
	const text = document.createElementNS('http://www.w3.org/2000/svg', 'text');
	text.textContent = 'Click';
	text.setAttribute('fill', 'white');
	text.setAttribute('font-size', '12');
	text.setAttribute('text-anchor', 'middle');
	text.setAttribute('dominant-baseline', 'middle');
	text.setAttribute('x', '30');
	text.setAttribute('y', '10');

	g.appendChild(rect);
	g.appendChild(text);
	g.setAttribute('transform', `translate(${viewBox.width - 70}, 10)`);

	const toggleGroup = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'g'
	);

	const toggleRect = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'rect'
	);
	toggleRect.setAttribute('width', '80');
	toggleRect.setAttribute('height', '20');
	toggleRect.setAttribute('fill', '#03386c');
	toggleRect.setAttribute('rx', '5');

	const toggleText = document.createElementNS(
		'http://www.w3.org/2000/svg',
		'text'
	);
	toggleText.setAttribute('fill', 'white');
	toggleText.setAttribute('font-size', '12');
	toggleText.setAttribute('text-anchor', 'middle');
	toggleText.setAttribute('dominant-baseline', 'middle');
	toggleText.setAttribute('x', '40');
	toggleText.setAttribute('y', '10');
	toggleText.textContent = initialState ? 'Hide Text' : 'Show Text';

	toggleGroup.appendChild(toggleRect);
	toggleGroup.appendChild(toggleText);

	toggleGroup.setAttribute(
		'transform',
		`translate(${viewBox.width - 87}, 35)`
	);
	svg.appendChild(toggleGroup);

	toggleGroup.addEventListener('click', function () {
		if (svgText.getAttribute('display') === 'none') {
			svgText.setAttribute('display', '');
			toggleText.textContent = 'Hide Text';
		} else {
			svgText.setAttribute('display', 'none');
			toggleText.textContent = 'Show Text';
		}
	});
}

/**
 * Creates a sectioned list table of contents that is organized based on the user-defined sections in WP for any given scene.
 * This function generates sections dynamically and organizes them in a color-coded way
 *
 * The function:
 * 1. Extracts unique section names from the `section_name` property of each object in `childObj`.
 * 2. Sorts the sections and assigns each section a color from the `colors` array. Ensures that consecutive sections don't have the same color.
 * 3. Builds a sectioned table of contents, where each section name is a header and below are its icons,  styled with its assigned color.
 * 4. Appends the generated TOC structure to the `#toc-container` element in the DOM.
 *
 * @return {void} - The function modifies the DOM by adding a dynamically generated TOC.
 *
 * Usage:
 * called in table_of_contents, if user has selected sectioned list option in WP
 */
function sectioned_list() {
	const sections = [];
	for (const key in childObj) {
		const section = childObj[key].section_name;

		if (!sections.includes(section) && section != 'None') {
			sections.push(section);
		}
		sectionObj[key] = section;
	}
	sections.sort();
	sections.push('None');

	const sectionNoneCount = sections.filter((s) => s === 'None').length;

	const toc_container = document.querySelector('#toc-container');
	const toc_group = document.createElement('div');

	toc_group.setAttribute('id', 'toc-group');

	for (let i = 0; i < sections.length; i++) {
		const sect = document.createElement('div');

		const heading = document.createElement('h5');
		heading.setAttribute('id', `heading${i}`);
		if (
			sections[i] != 'None' &&
			sceneData.scene_same_hover_color_sections === 'no'
		) {
			heading.innerHTML =
				sceneData[`scene_section${sections[i]}`][
					`scene_section_title${i + 1}`
				];
			const color =
				sceneData[`scene_section${sections[i]}`][
					`scene_section_hover_color${i + 1}`
				];
			heading.style.backgroundColor = hexToRgba(color, 0.2);
			heading.style.color = 'black';
			heading.style.display = 'inline-block';
			heading.style.padding = '0 5px';
		}
		if (
			sections[i] != 'None' &&
			sceneData.scene_same_hover_color_sections === 'yes'
		) {
			// heading.innerHTML = sections[i];

			heading.innerHTML =
				sceneData[`scene_section${sections[i]}`][
					`scene_section_title${i + 1}`
				];
			const color = scene_default_hover_color;
			heading.style.backgroundColor = hexToRgba(color, 0.2);
			heading.style.color = 'black';
			heading.style.display = 'inline-block';
			heading.style.padding = '0 5px';
		}
		if (sections[i] === 'None' && sectionNoneCount > 1) {
			heading.innerHTML = 'No Section';
			const color = scene_default_hover_color;
			heading.style.backgroundColor = hexToRgba(color, 0.2);
			heading.style.color = 'black';
			heading.style.display = 'inline-block';
		} else {
			//use the section above in here to put it back the way it was before.
		}

		sect.appendChild(heading);

		const tocCollapse = document.createElement('div');

		const tocbody = document.createElement('div');

		const sectlist = document.createElement('ul');
		sectlist.setAttribute('id', sections[i]);
		sectlist.setAttribute('style', `color: black`);

		tocbody.appendChild(sectlist);
		tocCollapse.appendChild(tocbody);

		sect.appendChild(tocCollapse);
		toc_group.appendChild(sect);
	}
	toc_container.appendChild(toc_group);
}

/**
 * Creates a collapsible table of contents that is organized based on the user-defined sections in WP for any given scene.
 * This function generates sections dynamically and organizes them in an accordion-style layout.
 *
 * The function:
 * 1. Extracts unique section names from the `section_name` property of each object in `childObj`.
 * 2. Sorts the sections and assigns each section a color from the `colors` array. Ensures that consecutive sections don't have the same color.
 * 3. Builds an accordion-style TOC, where each section is collapsible and styled with its assigned color.
 * 4. Appends the generated TOC structure to the `#toc-container` element in the DOM.
 *
 * @return {void} - The function modifies the DOM by adding a dynamically generated TOC.
 *
 * Usage:
 * called in table_of_contents, if user has selected sectioned list option in WP
 */
function toc_sections() {
	const sections = [];
	for (const key in childObj) {
		const section = childObj[key].section_name;
		if (!sections.includes(section) && section != 'None') {
			sections.push(section);
		}
		sectionObj[key] = section;
	}
	sections.sort();
	sections.push('None');

	const sectionNoneCount = sections.filter((s) => s === 'None').length;

	const toc_container = document.querySelector('#toc-container');
	const toc_group = document.createElement('div');
	toc_group.classList.add('accordion');
	toc_group.setAttribute('id', 'toc-group');

	for (let i = 0; i < sections.length; i++) {
		const sect = document.createElement('div');
		sect.classList.add('accordion-item');
		const heading = document.createElement('h2');
		heading.classList.add('accordion-header');
		heading.setAttribute('id', `heading${i}`);
		const button = document.createElement('button');
		button.classList.add('accordion-button', 'collapsed');
		button.setAttribute('type', 'button');
		button.setAttribute('data-bs-toggle', 'collapse');
		button.setAttribute('data-bs-target', `#toccollapse${i}`);
		button.setAttribute('aria-expanded', 'false');
		button.setAttribute('aria-controls', `toccollapse${i}`);

		const title_test =
			sceneData?.[`scene_section${sections[i]}`]?.[
				`scene_section_title${i + 1}`
			];
		if (title_test) {
			console.log('Title found:', title_test);
		} else {
			const title_test = 'None';
			console.log('Title not found:', title_test);
		}

		if (sections[i] != 'None' && title_test != 'None') {
			const scene_section_title =
				sceneData[`scene_section${sections[i]}`][
					`scene_section_title${i + 1}`
				];
			console.log('scene_section_title', scene_section_title);
			if (
				sceneData.scene_same_hover_color_sections === 'no' &&
				scene_section_title != ''
			) {
				button.innerHTML = scene_section_title;

				const scene_section_color =
					sceneData[`scene_section${sections[i]}`][
						`scene_section_hover_color${i + 1}`
					];
				button.style.backgroundColor = hexToRgba(
					scene_section_color,
					0.2
				);
			}
			if (
				sceneData.scene_same_hover_color_sections === 'yes' &&
				scene_section_title != ''
			) {
				button.innerHTML = scene_section_title;
				const color = scene_default_hover_color;
				button.style.backgroundColor = hexToRgba(color, 0.2);
			} else {
			}
		}

		if (
			(sectionNoneCount > 1 && sections[i] === 'None') ||
			title_test === 'None'
		) {
			button.innerHTML = 'No Section';
			const color = scene_default_hover_color;
			button.style.backgroundColor = hexToRgba(color, 0.2);
		} else {
		}

		const arrowSpan = document.createElement('span');
		arrowSpan.classList.add('arrow');
		button.appendChild(arrowSpan);

		if (sections[i].length > 20) {
			arrowSpan.style.marginRight = '15%';
		} else {
			arrowSpan.style.marginRight = '63%';
		}

		heading.appendChild(button);
		sect.appendChild(heading);

		const tocCollapse = document.createElement('div');
		tocCollapse.setAttribute('id', `toccollapse${i}`);
		tocCollapse.classList.add('accordion-collapse', 'collapse');
		tocCollapse.setAttribute('aria-labelledby', `heading${i}`);

		const tocbody = document.createElement('div');
		tocbody.classList.add('accordion-body');

		const sectlist = document.createElement('ul');
		sectlist.setAttribute('id', sections[i]);
		tocbody.appendChild(sectlist);
		tocCollapse.appendChild(tocbody);

		sect.appendChild(tocCollapse);

		toc_group.appendChild(sect); //original options creakes blank boxes
	}
	toc_container.appendChild(toc_group);
}

/**
 * Generates a Table of Contents (TOC) for a document, with links that either open modal windows or redirect to external URLs.
 * The TOC style is determined by `thisInstance.instance_toc_style`, which can be:
 *  - "accordion": Generates sections in an accordion layout.
 *  - "list": Uses a simple list layout.
 *  - "sectioned_list": Organizes content in sections based on their grouping.
 *
 * For each TOC item:
 * - If `childObj[key]['modal']` is true, the item will open a modal window and trigger `render_modal(key)` to load content.
 * - If `childObj[key]['external_url']` is present, the item will link to an external URL.
 *
 * Additional functionality includes:
 * - Mouse hover effects on associated SVG elements, highlighting sections.
 * - Event listeners for closing the modal window when clicking outside or on the close button.
 *
 * @return {void} - Modifies the DOM by generating TOC elements and attaching event listeners.
 *
 * Usage:
 * Called in load_svg if user wants to show the sections
 */

function table_of_contents() {
	if (scene_toc_style === 'accordion') {
		//this should be done on the SCENE side of things
		toc_sections();
	} else {
		sectioned_list();
	}

	for (const obj of sortedChildObjs) {
		const key = obj.original_name;

		if (sectionObj[key] === 'None') {
		}
		const elem = document.getElementById(childObj[key].section_name);
		const item = document.createElement('li');
		const title = childObj[key].title;
		const link = document.createElement('a');
		const title_formatted = title.replace(/\s+/g, '_');
		link.setAttribute('id', title_formatted);

		const modal = childObj[key].modal;
		if (modal) {
			link.setAttribute('href', `#`); //just added
			link.classList.add('modal-link');
			link.innerHTML = title;

			item.appendChild(link);
			item.addEventListener('click', function () {
				const modal = document.getElementById('myModal');
				modal.style.display = 'block';
				render_modal(key);
			});

			const closeButton = document.getElementById('close');
			closeButton.addEventListener('click', function () {
				const accordion_container = document.getElementById(
					'accordion-container'
				);
				accordion_container.innerHTML = '';
				if (!is_mobile()) {
					const tagline_container =
						document.getElementById('tagline-container');
					tagline_container.innerHTML = '';
				}

				document.getElementById('myTabContent').innerHTML = '';

				history.pushState(
					'',
					document.title,
					window.location.pathname + window.location.search
				);
			});
			window.onclick = function (event) {
				if (event.target === modal) {
					// Check if the click is outside the modal content

					document.getElementById('accordion-container').innerHTML =
						'';
					if (!is_mobile()) {
						document.getElementById('tagline-container').innerHTML =
							'';
					}
					document.getElementById('myTabContent').innerHTML = '';
					history.pushState(
						'',
						document.title,
						window.location.pathname + window.location.search
					);
				}
			};
		} else {
			link.href = childObj[key].external_url;
			link.innerHTML = title;
			item.appendChild(link);
		}

		//CHANGE HERE FOR TABLET STUFF
		link.style.textDecoration = 'none';

		item.addEventListener(
			'mouseover',
			((key) => {
				return function () {
					const svg_elem = document.querySelector(
						'g[id="' + key + '"]'
					);

					const subElements = svg_elem.querySelectorAll('*');
					subElements.forEach((subElement) => {
						if (
							scene_same_hover_color_sections != 'yes' &&
							childObj[key] != 'None'
						) {
							//this should be done on the SCENE side of things, will havet o bring this back

							const section_num = childObj[key].section_name;
							const this_color = `scene_section_hover_color${section_num}`;
							const text_color = `scene_section_hover_text_color${section_num}`;
							const hovercolorfullpath =
								sceneData[`scene_section${section_num}`][
									this_color
								];
							const hovertextcolorfullpath =
								sceneData[`scene_section${section_num}`][
									text_color
								];
							subElement.style.stroke = hovercolorfullpath;
						} else {
							subElement.style.stroke = scene_default_hover_color;
						}

						subElement.style.strokeWidth = '3';
					});
				};
			})(key)
		);

		item.addEventListener(
			'mouseout',
			((key) => {
				return function () {
					const svg_elem = document.querySelector(
						'g[id="' + key + '"]'
					);

					const subElements = svg_elem.querySelectorAll('*');
					subElements.forEach((subElement) => {
						subElement.style.stroke = '';
						subElement.style.strokeWidth = '';
					});
				};
			})(key)
		);

		elem.appendChild(item);
	}
}

/**
 * Generates a simple list-based Table of Contents (TOC), where items either open modal windows or link to external URLs.
 * The sections are not explicitly displayed, but their colors are used for highlighting.
 *
 * Each TOC item:
 * - If `childObj[key]['modal']` is true, the item will open a modal window and trigger `render_modal(key)` to load content.
 * - If `childObj[key]['external_url']` is present, the item will link to an external URL.
 *
 * Additional functionality:
 * - Mouse hover effects highlight associated SVG elements, using section colors if `thisInstance.instance_colored_sections` is set to "yes".
 * - Modal close event handling, including clicking outside the modal window to close it.
 *
 * @return {void} - Modifies the DOM by generating TOC list items and attaching event listeners.
 *
 * Usage:
 * called in load_svg if user wants a list with no sections displayed/no sections exist
 */
function list_toc() {
	const sections = [];
	for (const key in childObj) {
		const section = childObj[key].section_name;
		if (!sections.includes(section)) {
			sections.push(section);
		}
		sectionObj[key] = section;
	}
	sections.sort();

	const toc_container = document.querySelector('#toc-container');
	const toc_group = document.createElement('ul');
	const colorIdx = 0;
	let i = 0;
	let item;

	for (const obj of sortedChildObjs) {
		const key = obj.original_name;

		i++;

		item = document.createElement('li');

		const title = obj.title;
		const link = document.createElement('a');
		let modal = obj.modal;
		const title_formatted = title.replace(/\s+/g, '_');

		if (modal) {
			link.setAttribute('href', `#`); //just added
			link.setAttribute('id', title_formatted);

			link.classList.add('modal-link');
			link.innerHTML = title;
			item.appendChild(link);
			item.addEventListener(
				'click',
				((key) => {
					return function () {
						modal = document.getElementById('myModal');
						modal.style.display = 'block';
						render_modal(key);
					};
				})(key)
			);

			//only allow the modal close button event listener if the user is on theme.
			if (!window.location.href.includes('post.php')) {
				const closeButton = document.getElementById('close');
				closeButton.addEventListener('click', function () {
					const modal = document.getElementById('myModal');

					modal.style.display = 'none';
					history.pushState(
						'',
						document.title,
						window.location.pathname + window.location.search
					);
				});
			}
			window.onclick = function (event) {
				if (event.target === modal) {
					modal.style.display = 'none';
					history.pushState(
						'',
						document.title,
						window.location.pathname + window.location.search
					);
				}
			};
		} else {
			link.href = obj.external_url;
			link.innerHTML = title;
			item.appendChild(link);
		}

		if (!window.location.href.includes('post.php')) {
			item.addEventListener(
				'mouseover',
				((key) => {
					return function () {
						const svg_elem = document.querySelector(
							'g[id="' + key + '"]'
						);

						const subElements = svg_elem.querySelectorAll('*');
						subElements.forEach((subElement) => {
							subElement.style.stroke = scene_default_hover_color;
							subElement.style.strokeWidth = '3';
						});
					};
				})(key)
			);

			item.addEventListener(
				'mouseout',
				((key) => {
					return function () {
						const svg_elem = document.querySelector(
							'g[id="' + key + '"]'
						);

						const subElements = svg_elem.querySelectorAll('*');
						subElements.forEach((subElement) => {
							subElement.style.stroke = '';
							subElement.style.strokeWidth = '';
						});
					};
				})(key)
			);
		}

		toc_group.appendChild(item);
	}
	toc_container.appendChild(toc_group);
}

/**
 * Generates and handles modal windows or external URL redirects when SVG elements are clicked.
 *
 * This function adds click event listeners to SVG elements (identified by `g[id="key"]`) from `childObj`.
 *
 * - If the `childObj[key]['modal']` value is true:
 *   - Clicking the SVG element or corresponding mobile container (`#key-container`) opens a modal window.
 *   - The `render_modal(key)` function is triggered to load modal content.
 *   - Clicking outside the modal or on the close button hides the modal and clears the content.
 *
 * - If `childObj[key]['modal']` is false:
 *   - Clicking the SVG element redirects to the external URL specified in `childObj[key]['external_url']`.
 *   - For mobile devices, a similar event is added to the container element (`#key-container`).
 *
 * Modal close behavior:
 * - The modal is closed when the close button is clicked or when a click occurs outside the modal.
 * - Upon closing, various content containers are cleared, and the URL is changed back to the original scene URL
 *
 * @return {void} - Directly manipulates the DOM by attaching event listeners for modal display or external URL redirection.
 *
 * Usage:
 * Called in mobile helper, load_svg to actually add modal capabilities to scene element
 */
function add_modal() {
	for (const key in childObj) {
		const elem = document.querySelector('g[id="' + key + '"]');
		if (childObj[key].modal) {
			const modal = document.getElementById('myModal');
			const closeButton = document.getElementById('close');

			if (mobileBool) {
				const itemContainer = document.querySelector(
					`#${key}-container`
				);
				itemContainer.addEventListener('click', function () {
					modal.style.display = 'block';

					render_modal(key);
				});
			} else {
				elem.addEventListener('click', function (event) {
					modal.style.display = 'block';
					render_modal(key);
				});
			}

			closeButton.addEventListener('click', function () {
				modal.style.display = 'none';
				const accordion_container = document.getElementById(
					'accordion-container'
				);
				accordion_container.innerHTML = '';

				const myTab = document.getElementById('myTab');
				myTab.innerHTML = '';

				const tabContentContainer =
					document.getElementById('myTabContent');
				tabContentContainer.innerHTML = '';
				history.pushState(
					'',
					document.title,
					window.location.pathname + window.location.search
				);
			});
			window.onclick = function (event) {
				if (event.target === modal) {
					// Check if the click is outside the modal content
					modal.style.display = 'none';
					document.getElementById('accordion-container').innerHTML =
						'';
					document.getElementById('tagline-container').innerHTML = '';
					document.getElementById('myTab').innerHTML = '';
					document.getElementById('myTabContent').innerHTML = '';
					history.pushState(
						'',
						document.title,
						window.location.pathname + window.location.search
					);
				}
			};
		} else {
			elem.addEventListener('click', function (event) {
				const link = childObj[key].external_url;
				window.location.href = link;
			});
			if (mobileBool) {
				const itemContainer = document.querySelector(
					`#${key}-container`
				);
				itemContainer.addEventListener('click', function () {
					const link = childObj[key].external_url;
					window.location.href = link;
				});
			}
		}
	}
}
