window.dataLayer = window.dataLayer || [];
const gaMeasurementID = window.graphicDataSettings.googleAnalyticsMeasurementId;

//FIGURE TRACKING AND ANALYSIS_______________________________________________________________
/**
 * Tracks a "figureSourceLinkClick" event by pushing data to the dataLayer whenclicked.
 *
 * @param {string} title - The title of the figure or source being tracked.
 * @param {number} postID - The ID of the post associated with the figure or source.
 *
 */
function figureScienceLinkClick(figureID, figureTitle, scienceText, scienceLink) {
		dataLayer.push({
			GA4_MeasurementID: gaMeasurementID,
			event: 'figureScienceLinkClick',
			pageSection: 'figure',
			linkTitle: scienceText,
			figureID: figureID,
			figureTitle: figureTitle,
			url: scienceLink
		});
}

function setupFigureScienceLinkTracking(figureID) {
	document.querySelectorAll('a').forEach(function(link) {
		const hasClipboardIcon = link.querySelector('i.fa.fa-clipboard-list');
		if (hasClipboardIcon) {
			link.addEventListener('click', function(event) {
				const linkTitle = link.textContent.trim();
				const url = link.href;

				const figureTitleElement = document.querySelector('.figureTitle');
				const figureTitle = figureTitleElement ? figureTitleElement.textContent.trim() : 'Unknown Title';

				figureScienceLinkClick(figureID, figureTitle, linkTitle, url);
			});
		}
	});
}

/**
 * Pushes a custom event to the dataLayer for tracking figure data link interactions when clicked.
 *
 * @function figureDataLinkClick
 * @param {string} title - The title of the figure or content being tracked.
 * @param {number} postID - The unique identifier of the post associated with the figure.
 * @description This function is used to send a custom event named 'figureDataLink' to the 
 *              Google Tag Manager dataLayer. It includes metadata such as the page section, 
 *              title, and post ID for analytics purposes.
 */
function figureDataLinkClick(figureID, figureTitle, dataText, dataLink) {
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'figureDataLinkClick',
		pageSection: 'figure',
		linkTitle: dataText,
		figureID: figureID,
		figureTitle: figureTitle,
		url: dataLink
	});
}

function setupFigureDataLinkTracking(figureID) {
document.querySelectorAll('a').forEach(function(link) {
	const hasClipboardIcon = link.querySelector('i.fa.fa-database');
	if (hasClipboardIcon) {
		link.addEventListener('click', function(event) {
			const linkTitle = link.textContent.trim();
			const url = link.href;

			const figureTitleElement = document.querySelector('.figureTitle');
			const figureTitle = figureTitleElement ? figureTitleElement.textContent.trim() : 'Unknown Title';

			figureDataLinkClick(figureID, figureTitle, linkTitle, url);
		});
	}
});
}

/**
 * Tracks the loading of an interactive timeseries graph by pushing an event to the dataLayer.
 * @param {string} title - The title of the figure.
 * @param {number} figureID - The ID of the post associated with the figure.
 * @description
 * This function is used to log the loading of an interactive timeseries graph by pushing
 * an event to the `dataLayer` object. The event includes metadata such as
 * the figure type and the page section where the image is displayed.
 * It is typically used for analytics purposes.
 */
function figureTimeseriesGraphLoaded(title, figureID, gaMeasurementID) {
	//console.log('gaMeasurementID figureTimeseriesGraphLoaded', gaMeasurementID);
	//console.log(title, figureID, gaMeasurementID);
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'figureTimeseriesGraphLoaded',
		figureType: "lineChart",
		pageSection: 'figure',
		title:  title,
		figureID:  figureID
	});
}


/**
 * Tracks the loading of an internal image and pushes an event to the dataLayer.
 * @param {string} title - The title of the figure.
 * @param {number} figureID - The ID of the post associated with the figure.
 * @description
 * This function is used to log the loading of an internal image by pushing
 * an event to the `dataLayer` object. The event includes metadata such as
 * the figure type and the page section where the image is displayed.
 * It is typically used for analytics purposes.
 */
function figureInternalImageLoaded(title, figureID, gaMeasurementID) {
		//console.log('gaMeasurementID figureInternalImageLoaded', gaMeasurementID);
		//console.log(title, figureID, gaMeasurementID);
		dataLayer.push({
			GA4_MeasurementID: gaMeasurementID,
			event: 'figureInternalImageLoaded',
			figureType: "internalImage",
			pageSection: 'figure',
			title:  title,
			figureID:  figureID
	});
}

/**
 * Tracks the loading of an external image and pushes an event to the dataLayer.
 * @param {string} title - The title of the figure.
 * @param {number} figureID - The ID of the post associated with the figure.
 * @description
 * This function is used to log the loading of an external image by pushing
 * an event to the `dataLayer` object. The event includes metadata such as
 * the figure type and the page section  where the image is displayed.
 * It is typically used for analytics purposes.
 */
function figureExternalImageLoaded(title, figureID, gaMeasurementID) {
	//console.log('gaMeasurementID figureExternalImageLoaded', gaMeasurementID);
	//console.log(title, figureID, gaMeasurementID);
	dataLayer.push({
			GA4_MeasurementID: gaMeasurementID,
			event: 'figureExternalImageLoaded',
			figureType: "externalImage",
			pageSection: 'figure',
			title:  title,
			figureID:  figureID
	});
}


/**
 * Pushes an event to the dataLayer indicating that a code display has been loaded.
 *
 * @param {string} title - The title of the figure.
 * @param {number} figureID - The ID of the post associated with the figure.
 */
function figureCodeDisplayLoaded(title, figureID, gaMeasurementID) {
	//console.log('gaMeasurementID figureCodeDisplayLoaded', gaMeasurementID);
	//console.log(title, figureID, gaMeasurementID); 
	dataLayer.push({
			GA4_MeasurementID: gaMeasurementID,
			event: 'figureCodeDisplayLoaded',
			figureType: 'codeDisplay',
			pageSection: 'figure',
			title:  title,
			figureID:  figureID
	});
}



//MODAL & TAB TRACKING AND ANALYSIS_______________________________________________________________
/**
 * Tracks the loading of a modal window by pushing an event to the dataLayer.
 *
 * @param {string} title - The title of the modal window.
 * @param {string|number} modal_id - The ID of the post associated with the modal window.
 */
function modalWindowLoaded(title, modal_id, gaMeasurementID) {
	//console.log('gaMeasurementID modalWindowLoaded', gaMeasurementID);
	//console.log(title, modal_id, gaMeasurementID);  
	dataLayer.push({
			GA4_MeasurementID: gaMeasurementID,
			event: 'modalWindowLoaded', 
			pageSection: 'modal',
			title:  title,
			modalID:  modal_id  
	});
}

/**
 * Tracks the loading of a modal tab by pushing an event to the dataLayer.
 *
 * @param {string} title - The title of the modal tab being loaded.
 * @param {string|number} modal_id - The ID of the post associated with the modal tab.
 */
function modalTabLoaded(tab_label, modal_id, tab_id, gaMeasurementID) {
	//console.log('gaMeasurementID modalTabLoaded', gaMeasurementID);
	//console.log(tab_label, modal_id, tab_id, gaMeasurementID);    
	dataLayer.push({
			GA4_MeasurementID: gaMeasurementID,
			event: 'modalTabLoaded', 
			pageSection: 'modal',
			title:  tab_label,
			modalID:  modal_id,
			tabID:  tab_id 
		});
}

/**
 * Tracks the "More Info" button click event within a modal and pushes the event data to the dataLayer.
 *
 */
function modalMoreInfoLinkClicked(linkTitle, modalID, url, modalTitle, gaMeasurementID) {
	//console.log(linkTitle, modalID, url, modalTitle, gaMeasurementID);
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'modalMoreInfoClicked',
		pageSection: 'modal',
		linkTitle: linkTitle,
		modalID: modalID,
		modalTitle: modalTitle,
		url: url
	});
}

function setupModalMoreInfoLinkTracking(modalID) {
	document.querySelectorAll('.accordion-body a').forEach(function(link) {
		link.addEventListener('click', function(event) {
			// Find the closest .accordion-item
			const accordionItem = event.currentTarget.closest('.accordion-item');
			const accordionButton = accordionItem ? accordionItem.querySelector('.accordion-header .accordion-button') : null;
			const buttonText = accordionButton.textContent.trim();
			// Check if the button has the class "More Info"
			if (buttonText === 'More Info') {
				const linkTitle = link.textContent.trim();
				const url = link.href;

				// Get modal title from #modal-title
				const modalTitleElement = document.getElementById('modal-title');
				const modalTitle = modalTitleElement ? modalTitleElement.textContent.trim() : 'Unknown Title';

				// Push to dataLayer
				modalMoreInfoLinkClicked(linkTitle, modalID, url, modalTitle, gaMeasurementID);
			}
		});
	});
}


/**
 * Tracks the event when modal images are clicked and pushes relevant data to the dataLayer.
 *
 */
function modalImagesLinkClicked(linkTitle, modalID, url, modalTitle, gaMeasurementID) {
	console.log(linkTitle, modalID, url, modalTitle, gaMeasurementID);
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'modalMoreInfoClicked',
		pageSection: 'modal',
		linkTitle: linkTitle,
		modalID: modalID,
		modalTitle: modalTitle,
		url: url
	});
}

function setupModalImagesLinkTracking(modalID) {
	document.querySelectorAll('.accordion-body a').forEach(function(link) {
		link.addEventListener('click', function(event) {
			// Find the closest .accordion-item
			const accordionItem = event.currentTarget.closest('.accordion-item');
			const accordionButton = accordionItem ? accordionItem.querySelector('.accordion-header .accordion-button') : null;
			const buttonText = accordionButton.textContent.trim();
			// Check if the button has the class "More Info"
			if (buttonText === 'Images') {
				const linkTitle = link.textContent.trim();
				const url = link.href;

				// Get modal title from #modal-title
				const modalTitleElement = document.getElementById('modal-title');
				const modalTitle = modalTitleElement ? modalTitleElement.textContent.trim() : 'Unknown Title';

				// Push to dataLayer
				modalImagesLinkClicked(linkTitle, modalID, url, modalTitle, gaMeasurementID);
			}
		});
	});
}


//SCENE TRACKING AND ANALYSIS_______________________________________________________________
/**
 * Pushes a 'sceneLoaded' event to the dataLayer with details about the scene.
 *
 * @param {string} title - The title of the scene being loaded.
 * @param {number} sceneID - The ID of the post associated with the scene.
 */
function sceneLoaded(title, sceneID, instance_overview_scene, gaMeasurementID) {
	//console.log(title, sceneID, instance_overview_scene, gaMeasurementID); 
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'sceneLoaded', 
		pageSection: 'scene',
		title:  title,
		sceneID:  sceneID,
		instance: instance_overview_scene
	});
}


/**
 * Tracks the "More Info" click event for a scene and pushes the event data to the dataLayer.
 *
 * @param {string} title - The title of the scene being clicked.
 * @param {number} sceneID - The unique identifier of the post associated with the scene.
 */
function sceneMoreInfoLinkClicked(linkTitle, sceneID, url, sceneTitle, gaMeasurementID) {
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'sceneMoreInfoLinkClicked',
		pageSection: 'scene',
		linkTitle: linkTitle,
		sceneID: sceneID,
		sceneTitle: sceneTitle,
		url: url
	});
}

function setupSceneMoreInfoLinkTracking(title, sceneID) {
	document.querySelectorAll('.accordion-body a').forEach(function(link) {
		link.addEventListener('click', function(event) {
			// Find the closest .accordion-item
			const accordionItem = event.currentTarget.closest('.accordion-item');
			const accordionButton = accordionItem ? accordionItem.querySelector('.accordion-header .accordion-button') : null;
			const buttonText = accordionButton.textContent.trim();
			// Check if the button has the class "More Info"
			if (buttonText === 'More Info') {
				const linkTitle = link.textContent.trim();
				const url = link.href;

				// Get scene title from #modal-title
				const sceneTitleElement = document.querySelector('#title-container h1')
				const sceneTitle = sceneTitleElement ? sceneTitleElement.textContent.trim() : 'Unknown Title';

				// Push to dataLayer
				sceneMoreInfoLinkClicked(linkTitle, sceneID, url, sceneTitle, gaMeasurementID);
			}
		});
	});
}



/**
 * Tracks when a scene image is clicked and pushes the event data to the dataLayer.
 *
 * @param {string} title - The title of the scene image that was clicked.
 * @param {number} sceneID - The ID of the post associated with the scene image.
 */
function sceneImagesLinkClicked(linkTitle, sceneID, url, sceneTitle, gaMeasurementID) {
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'sceneImagesLinkClicked',
		pageSection: 'scene',
		linkTitle: linkTitle,
		sceneID: sceneID,
		sceneTitle: sceneTitle,
		url: url
	});
}

function setupSceneImagesLinkTracking(title, sceneID) {
	document.querySelectorAll('.accordion-body a').forEach(function(link) {
		link.addEventListener('click', function(event) {
			// Find the closest .accordion-item
			const accordionItem = event.currentTarget.closest('.accordion-item');
			const accordionButton = accordionItem ? accordionItem.querySelector('.accordion-header .accordion-button') : null;
			const buttonText = accordionButton.textContent.trim();
			// Check if the button has the class "More Info"
			if (buttonText === 'Images') {
				const linkTitle = link.textContent.trim();
				const url = link.href;

				// Get scene title from #modal-title
				const sceneTitleElement = document.querySelector('#title-container h1')
				const sceneTitle = sceneTitleElement ? sceneTitleElement.textContent.trim() : 'Unknown Title';

				// Push to dataLayer
				sceneImagesLinkClicked(linkTitle, sceneID, url, sceneTitle, gaMeasurementID);
			}
		});
	});
}


//INSTANCE TRACKING AND ANALYSIS_______________________________________________________________

/**
 * Tracks the selection of an instance and pushes relevant data to the dataLayer.
 *
 * @param {string} title - The title of the selected instance.
 * @param {number} instanceID - The unique identifier of the selected instance.
 */
// function instanceSelected(title, instanceID) {
//     dataLayer.push({
//       event: 'instanceSelected', 
//       pageSection: 'instance',
//       title:  title,
//       instanceID:  instanceID  
//     });
// }


//ABOUT TRACKING AND ANALYSIS_______________________________________________________________
//Not sure if needed
/**
 * Tracks the selection of an "about" section item by pushing an event to the dataLayer.
 *
 */
// function aboutSelected() {
//     dataLayer.push({
//       event: 'aboutSelected', 
//       pageSection: 'about',
//     });
// }