window.dataLayer = window.dataLayer || [];
const _settingsEl = document.getElementById('graphic-data-settings');
const _settings = _settingsEl ? JSON.parse(_settingsEl.textContent) : {};
const gaMeasurementID = _settings.googleAnalyticsMeasurementId ?? '';

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

document.addEventListener(
	'graphic-data:setupFigureScienceLinkTracking',
	(e) => {
		const { figureID } = e.detail;
		document.querySelectorAll('a').forEach(function (link) {
			const hasClipboardIcon = link.querySelector(
				'i.fa.fa-clipboard-list'
			);
			if (hasClipboardIcon) {
				link.addEventListener('click', function (event) {
					const linkTitle = link.textContent.trim();
					const url = link.href;

					const figureTitleElement =
						document.querySelector('.figureTitle');
					const figureTitle = figureTitleElement
						? figureTitleElement.textContent.trim()
						: 'Unknown Title';

					figureScienceLinkClick(
						figureID,
						figureTitle,
						linkTitle,
						url
					);
				});
			}
		});
	}
);

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

document.addEventListener('graphic-data:setupFigureDataLinkTracking', (e) => {
	const { figureID } = e.detail;
	document.querySelectorAll('a').forEach(function (link) {
		const hasClipboardIcon = link.querySelector('i.fa.fa-database');
		if (hasClipboardIcon) {
			link.addEventListener('click', function (event) {
				const linkTitle = link.textContent.trim();
				const url = link.href;

				const figureTitleElement =
					document.querySelector('.figureTitle');
				const figureTitle = figureTitleElement
					? figureTitleElement.textContent.trim()
					: 'Unknown Title';

				figureDataLinkClick(figureID, figureTitle, linkTitle, url);
			});
		}
	});
});

document.addEventListener('graphic-data:figureTimeseriesGraphLoaded', (e) => {
	const { title, figureID } = e.detail;
	dataLayer.push({
		GA4_MeasurementID: gaMeasurementID,
		event: 'figureTimeseriesGraphLoaded',
		figureType: 'lineChart',
		pageSection: 'figure',
		title,
		figureID,
	});
});

document.addEventListener('graphic-data:figureInternalImageLoaded', (e) => {
	const { title, figureID } = e.detail;
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
	const { title, figureID } = e.detail;
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
	const { title, figureID } = e.detail;
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
		event: 'modalMoreInfoClicked',
		pageSection: 'modal',
		linkTitle,
		modalID,
		modalTitle,
		url,
	});
}

document.addEventListener(
	'graphic-data:setupModalMoreInfoLinkTracking',
	(e) => {
		const { modalID } = e.detail;
		document.querySelectorAll('.accordion-body a').forEach(function (link) {
			link.addEventListener('click', function (event) {
				// Find the closest .accordion-item
				const accordionItem =
					event.currentTarget.closest('.accordion-item');
				const accordionButton = accordionItem
					? accordionItem.querySelector(
							'.accordion-header .accordion-button'
						)
					: null;
				const buttonText = accordionButton.textContent.trim();
				// Check if the button has the class "More Info"
				if (buttonText === 'More Info') {
					const linkTitle = link.textContent.trim();
					const url = link.href;

					// Get modal title from #modal-title
					const modalTitleElement =
						document.getElementById('modal-title');
					const modalTitle = modalTitleElement
						? modalTitleElement.textContent.trim()
						: 'Unknown Title';

					// Push to dataLayer
					modalMoreInfoLinkClicked(
						linkTitle,
						modalID,
						url,
						modalTitle,
						gaMeasurementID
					);
				}
			});
		});
	}
);

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
		event: 'modalMoreInfoClicked',
		pageSection: 'modal',
		linkTitle,
		modalID,
		modalTitle,
		url,
	});
}

document.addEventListener('graphic-data:setupModalImagesLinkTracking', (e) => {
	const { modalID } = e.detail;
	document.querySelectorAll('.accordion-body a').forEach(function (link) {
		link.addEventListener('click', function (event) {
			// Find the closest .accordion-item
			const accordionItem =
				event.currentTarget.closest('.accordion-item');
			const accordionButton = accordionItem
				? accordionItem.querySelector(
						'.accordion-header .accordion-button'
					)
				: null;
			const buttonText = accordionButton.textContent.trim();
			// Check if the button has the class "More Info"
			if (buttonText === 'Media') {
				const linkTitle = link.textContent.trim();
				const url = link.href;

				// Get modal title from #modal-title
				const modalTitleElement =
					document.getElementById('modal-title');
				const modalTitle = modalTitleElement
					? modalTitleElement.textContent.trim()
					: 'Unknown Title';

				// Push to dataLayer
				modalImagesLinkClicked(
					linkTitle,
					modalID,
					url,
					modalTitle,
					gaMeasurementID
				);
			}
		});
	});
});

//SCENE TRACKING AND ANALYSIS_______________________________________________________________
document.addEventListener('graphic-data:sceneLoaded', (e) => {
	const { title, sceneID, instance_overview_scene } = e.detail;
	window.dataLayer.push({
		event: 'sceneLoaded',
		sceneTitle: title,
		sceneID,
		instance_overview_scene,
		gaMeasurementID, // from module-level const
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

document.addEventListener(
	'graphic-data:setupSceneMoreInfoLinkTracking',
	(e) => {
		const { title, sceneID } = e.detail;
		document.querySelectorAll('.accordion-body a').forEach(function (link) {
			link.addEventListener('click', function (event) {
				// Find the closest .accordion-item
				const accordionItem =
					event.currentTarget.closest('.accordion-item');
				const accordionButton = accordionItem
					? accordionItem.querySelector(
							'.accordion-header .accordion-button'
						)
					: null;
				const buttonText = accordionButton.textContent.trim();
				// Check if the button has the class "More Info"
				if (buttonText === 'More Info') {
					const linkTitle = link.textContent.trim();
					const url = link.href;

					// Get scene title from #modal-title
					const sceneTitleElement = document.querySelector(
						'#title-container h1'
					);
					const sceneTitle = sceneTitleElement
						? sceneTitleElement.textContent.trim()
						: 'Unknown Title';

					// Push to dataLayer
					sceneMoreInfoLinkClicked(
						linkTitle,
						sceneID,
						url,
						sceneTitle,
						gaMeasurementID
					);
				}
			});
		});
	}
);

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

document.addEventListener('graphic-data:setupSceneImagesLinkTracking', (e) => {
	const { sceneID } = e.detail;
	document.querySelectorAll('.accordion-body a').forEach(function (link) {
		link.addEventListener('click', function (event) {
			// Find the closest .accordion-item
			const accordionItem =
				event.currentTarget.closest('.accordion-item');
			const accordionButton = accordionItem
				? accordionItem.querySelector(
						'.accordion-header .accordion-button'
					)
				: null;
			const buttonText = accordionButton.textContent.trim();
			// Check if the button has the class "More Info"
			if (buttonText === 'Media') {
				const linkTitle = link.textContent.trim();
				const url = link.href;

				// Get scene title from #modal-title
				const sceneTitleElement = document.querySelector(
					'#title-container h1'
				);
				const sceneTitle = sceneTitleElement
					? sceneTitleElement.textContent.trim()
					: 'Unknown Title';

				// Push to dataLayer
				sceneImagesLinkClicked(
					linkTitle,
					sceneID,
					url,
					sceneTitle,
					gaMeasurementID
				);
			}
		});
	});
});
