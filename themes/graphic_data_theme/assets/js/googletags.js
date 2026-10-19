
window.dataLayer = window.dataLayer || [];
const _settingsEl = document.getElementById('graphic-data-settings');
const _settings = _settingsEl ? JSON.parse(_settingsEl.textContent) : {};
const gaMeasurementID = _settings.googleAnalyticsMeasurementId ?? '';


// Keep one delegated click listener per tracking type, with current context.
function setupFigureLinkTracking(eventName, iconSelector, track) {
	const figures = new Map();
	document.addEventListener(eventName, (e) => {
		const { postID: figureID } = e.detail;
		if (figureID == null || figureID === '') return;
		figures.set(String(figureID), figureID);
	});
	document.addEventListener('click', (e) => {
		const link = e.target.closest?.('a');
		if (!link || !link.querySelector(iconSelector)) return;
		const figure = link.closest('[id^="figure-"]');
		if (!figure) return;
		const figureID = figures.get(figure.id.slice('figure-'.length));
		if (figureID == null) return;
		const title = figure.querySelector('.figureTitle')?.textContent.trim() || 'Unknown Title';
		track(figureID, title, link.textContent.trim(), link.href);
	});
}

function setupAccordionLinkTracking(eventName, section, label, track) {
	let context;
	document.addEventListener(eventName, (e) => {
		context = e.detail;
	});
	document.addEventListener('click', (e) => {
		if (!context) return;
		const link = e.target.closest?.('.accordion-body a');
		if (!link || link.closest('[id^="figure-"]')) return;
		const modal = link.closest('.modal-content');
		if (section === 'modal') {
			if (!modal || !link.closest('#accordion-container')) return;
		} else if (modal) {
			return;
		}
		const item = link.closest('.accordion-item');
		const button = item?.querySelector('.accordion-header .accordion-button');
		if (!button || button.textContent.trim() !== label) return;
		const id = section === 'modal' ? context.modalID : context.sceneID;
		if (id == null || id === '') return;
		const titleElement = section === 'modal'
			? modal.querySelector('#modal-title')
			: document.querySelector('#title-container h1');
		const title = titleElement?.textContent.trim() || context.title || 'Unknown Title';
		track(link.textContent.trim(), id, link.href, title, gaMeasurementID);
	});
}

//FIGURE TRACKING AND ANALYSIS_______________________________________________________________
/**
 * Pushes a custom event to the dataLayer for tracking figure science link interactions when clicked.
 *
 * @function figureScienceLinkClick
 * @param {string} figureID    - The unique identifier of the figure.
 * @param {string} figureTitle - The title of the figure being tracked.
 * @param {string} scienceText - The text of the science link that was clicked.
 * @param {string} scienceLink - The URL of the science link that was clicked.
 */
function figureScienceLinkClick(
	figureID,
	figureTitle,
	scienceText,
	scienceLink
) {
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'figureScienceLinkClick',
		pageSection: 'figure',
		linkTitle: scienceText,
		figureID,
		figureTitle,
		url: scienceLink,
	});
}

setupFigureLinkTracking('graphic-data:setupFigureScienceLinkTracking', 'i.fa.fa-clipboard-list', figureScienceLinkClick);

/**
 * Pushes a custom event to the dataLayer for tracking figure data link interactions when clicked.
 *
 * @function figureDataLinkClick
 * @param {string} figureID    - The unique identifier of the figure.
 * @param {string} figureTitle - The title of the figure being tracked.
 * @param {string} dataText    - The text of the data link that was clicked.
 * @param {string} dataLink    - The URL of the data link that was clicked.
 */
function figureDataLinkClick(figureID, figureTitle, dataText, dataLink) {
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'figureDataLinkClick',
		pageSection: 'figure',
		linkTitle: dataText,
		figureID,
		figureTitle,
		url: dataLink,
	});
}

setupFigureLinkTracking('graphic-data:setupFigureDataLinkTracking', 'i.fa.fa-database', figureDataLinkClick);

document.addEventListener('graphic-data:figureInteractiveGraphLoaded', (e) => {
	console.log('googletags.js',  e.detail);
	const { title, postID: figureID } = e.detail;
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'figureInteractiveGraphLoaded',
		figureType: 'lineChart',
		pageSection: 'figure',
		title,
		figureID,
	});
});

document.addEventListener('graphic-data:figureInternalImageLoaded', (e) => {
	console.log('googletags.js',  e.detail);
	const { title, postID: figureID } = e.detail;
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'figureInternalImageLoaded',
		figureType: 'internalImage',
		pageSection: 'figure',
		title,
		figureID,
	});
});

document.addEventListener('graphic-data:figureExternalImageLoaded', (e) => {
	const { title, postID: figureID } = e.detail;
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'figureExternalImageLoaded',
		figureType: 'externalImage',
		pageSection: 'figure',
		title,
		figureID,
	});
});

document.addEventListener('graphic-data:figureCodeDisplayLoaded', (e) => {
	const { title, postID: figureID } = e.detail;
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'figureCodeDisplayLoaded',
		figureType: 'codeDisplay',
		pageSection: 'figure',
		title,
		figureID,
	});
});

//MODAL & TAB TRACKING AND ANALYSIS_______________________________________________________________
document.addEventListener('graphic-data:modalWindowLoaded', (e) => {
	const { title, modal_id } = e.detail;
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'modalWindowLoaded',
		pageSection: 'modal',
		title,
		modalID: modal_id,
	});
});

document.addEventListener('graphic-data:modalTabLoaded', (e) => {
	const { tab_label, modal_id, tab_id } = e.detail;
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'modalTabLoaded',
		pageSection: 'modal',
		title: tab_label,
		modalID: modal_id,
		tabID: tab_id,
	});
});

/**
 * Tracks the "More Info" button click event within a modal and pushes the event data to the dataLayer.
 *
 * @param linkTitle
 * @param modalID
 * @param url
 * @param modalTitle
 * @param gaMeasurementID
 */
function modalMoreInfoLinkClicked(
	linkTitle,
	modalID,
	url,
	modalTitle,
	gaMeasurementID
) {
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'modalMoreInfoLinkClicked',
		pageSection: 'modal',
		linkTitle,
		modalID,
		modalTitle,
		url,
	});
}

setupAccordionLinkTracking('graphic-data:setupModalMoreInfoLinkTracking', 'modal', 'More Info', modalMoreInfoLinkClicked);

/**
 * Tracks the event when modal images are clicked and pushes relevant data to the dataLayer.
 *
 * @param linkTitle
 * @param modalID
 * @param url
 * @param modalTitle
 * @param gaMeasurementID
 */
function modalImagesLinkClicked(
	linkTitle,
	modalID,
	url,
	modalTitle,
	gaMeasurementID
) {
	console.log(linkTitle, modalID, url, modalTitle, gaMeasurementID);
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'modalImagesLinkClicked',
		pageSection: 'modal',
		linkTitle,
		modalID,
		modalTitle,
		url,
	});
}

setupAccordionLinkTracking('graphic-data:setupModalImagesLinkTracking', 'modal', 'Media', modalImagesLinkClicked);

//SCENE TRACKING AND ANALYSIS_______________________________________________________________
document.addEventListener('graphic-data:sceneLoaded', (e) => {
	const { title, sceneID, instance_overview_scene } = e.detail;
	window.dataLayer.push({
		event: 'sceneLoaded',
		pageSection: 'scene',
		title,
		sceneTitle: title,
		sceneID,
		instance: instance_overview_scene,
		GA4_MeasurementID: gaMeasurementID, // from module-level const
	});
});

/**
 * Tracks the "More Info" click event for a scene and pushes the event data to the dataLayer.
 *
 * @param {string} title           - The title of the scene being clicked.
 * @param          linkTitle
 * @param {number} sceneID         - The unique identifier of the post associated with the scene.
 * @param          url
 * @param          sceneTitle
 * @param          gaMeasurementID
 */
function sceneMoreInfoLinkClicked(
	linkTitle,
	sceneID,
	url,
	sceneTitle,
	gaMeasurementID
) {
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'sceneMoreInfoLinkClicked',
		pageSection: 'scene',
		linkTitle,
		sceneID,
		sceneTitle,
		url,
	});
}

setupAccordionLinkTracking('graphic-data:setupSceneMoreInfoLinkTracking', 'scene', 'More Info', sceneMoreInfoLinkClicked);

/**
 * Tracks when a scene image is clicked and pushes the event data to the dataLayer.
 *
 * @param {string} title           - The title of the scene image that was clicked.
 * @param          linkTitle
 * @param {number} sceneID         - The ID of the post associated with the scene image.
 * @param          url
 * @param          sceneTitle
 * @param          gaMeasurementID
 */
function sceneImagesLinkClicked(
	linkTitle,
	sceneID,
	url,
	sceneTitle,
	gaMeasurementID
) {
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'sceneImagesLinkClicked',
		pageSection: 'scene',
		linkTitle,
		sceneID,
		sceneTitle,
		url,
	});
}

setupAccordionLinkTracking('graphic-data:setupSceneImagesLinkTracking', 'scene', 'Media', sceneImagesLinkClicked);
