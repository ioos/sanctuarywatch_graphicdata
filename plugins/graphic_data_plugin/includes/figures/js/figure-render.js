import { producePlotlyLineFigure } from '@graphic-data/plotly-timeseries-line';
import { producePlotlyBarFigure } from '@graphic-data/plotly-bar';
import { producePlotlyMap } from '@graphic-data/plotly-map';
import { produceTabulatorTable } from '@graphic-data/tabulator-table';
import { loadPlotlyScript, waitForElementById } from '@graphic-data/plotly-utility';
import { is_mobile } from '@graphic-data/scene-shared';


function waitForPlotly() {
	return new Promise((resolve, reject) => {
		if (window.Plotly) {
			resolve(window.Plotly);
			return;
		}

		const timeout = Date.now() + 10000;

		const interval = setInterval(() => {
			if (window.Plotly) {
				clearInterval(interval);
				resolve(window.Plotly);
				return;
			}

			if (Date.now() > timeout) {
				clearInterval(interval);
				reject(
					new Error('Plotly failed to load.')
				);
			}
		}, 50);
	});
}


async function renderSavedFigure(
        targetElement,
        savedFigure,
        plotlyDivID,
        postID
    ) {
        if (!targetElement) {
            throw new Error('Target element was not found.');
        }

        if (
            !savedFigure ||
            !savedFigure.data ||
            !savedFigure.layout
        ) {
            throw new Error(
                'Saved figure must contain data and layout.'
            );
        }

        let newDiv = document.createElement('div');
        newDiv.id = plotlyDivID
        newDiv.classList.add("container", `figure_interactive${postID}`);
        let target = await waitForElementById(targetElement);
		target.appendChild(newDiv);

        let plotDiv = document.getElementById(plotlyDivID);
		plotDiv.style.setProperty("width", "100%", "important");
		plotDiv.style.setProperty("max-width", "none", "important");

        await loadPlotlyScript();
        const PlotlyLibrary = await waitForPlotly();

        try {
            await PlotlyLibrary.newPlot(
                plotlyDivID,
                savedFigure.data,
                savedFigure.layout,
                savedFigure.config
            );

            /*
            * Move the Plotly modebar upward so it does not overlap
            * the legend items.
            */
            const plotlyElement =
            typeof plotlyDivID === 'string'
                ? document.getElementById(plotlyDivID)
                : plotlyDivID;

            const modebar = plotlyElement?.querySelector('.modebar');

            if (modebar) {
                modebar.style.top = '-28px';
            }

            return targetElement;
        } catch {
            return;
        }
}



/**
 * Renders interactive plots (e.g., Plotly graphs) within a specified tab content element.
 * Handles dynamic loading, resizing for mobile, and tab switching behavior.
 *
 * @async
 * @function render_interactive_plots
 * @param {HTMLElement} tabContentElement                     - The DOM element representing the tab content where the plot will be rendered.
 * @param {Object}      info_obj                              - An object containing information about the plot to be rendered.
 * @param {number}      info_obj.postID                       - The unique identifier for the post associated with the plot.
 * @param {string}      info_obj.figureType                   - The type of figure to render (e.g., "Interactive").
 * @param {string}      info_obj.figureTitle                  - The title of the figure.
 * @param {string}      info_obj.figure_interactive_arguments - A JSON string containing arguments for rendering the interactive figure.
 *
 * @throws {Error} Throws an error if required DOM elements are not found within the specified timeout.
 *
 * @description
 * This function dynamically renders interactive plots using Plotly. It includes:
 * - Polling for required DOM elements before rendering.
 * - Adjusting layout for mobile devices.
 * - Handling tab switching events to resize plots appropriately.
 * - Supporting multiple graph types, such as "Plotly line graph (time series)" and "Plotly bar graph".
 *
 * @example
 * const tabContentElement = document.getElementById('tab-content');
 * const info_obj = {
 *   postID: 123,
 *   figureType: "Interactive",
 *   figureTitle: "Sample Plot",
 *   figure_interactive_arguments: JSON.stringify({ graphType: "Plotly line graph (time series)" })
 * };
 * await render_interactive_plots(tabContentElement, info_obj);
 */
export async function render_interactive_plots(tabContentElement, info_obj, targetDocument, targetId) {

    //console.log('tabContentElement render_interactive_plots', tabContentElement);
	//Lets control if the figure is published or not
	let figure_published = info_obj.figure_published;
	if (figure_published != 'published') {
		if (window.location.href.includes('post.php') || window.location.href.includes("post-new.php")) {
			figure_published = 'published';
		} else {
			return; // do not render if the figure is not published
		}
	}

	const postID = info_obj.postID;
	const figureType = info_obj.figureType;
	const title = info_obj.figureTitle;
    const uniqueHash_plotlyDivID = window.crypto?.randomUUID?.() ||`${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
	const plotlyDivID = `plotlyFigure_${postID}_${uniqueHash_plotlyDivID}`;
	const interactive_arguments = info_obj.figure_interactive_arguments;
    const figure_interactive_args_rendered = info_obj.figure_interactive_args_rendered;

    let savedFigure;
    try {
        savedFigure = JSON.parse(figure_interactive_args_rendered);
    } catch {}

	//Preview error message in admin
    if (
        (window.location.href.includes('post.php') || window.location.href.includes("post-new.php")) &&
        figureType === 'Interactive'
    ) {
        document.dispatchEvent( new CustomEvent( 'graphic-data:figurePreviewError', {
            detail: { tabContentElement, figureType }
        } ) );
    }

	async function waitForElementByIdPolling(
		id,
		timeout = 15000,
		interval = 100,
	) {
		const start = Date.now();
		return new Promise((resolve, reject) => {
			(function poll() {
				const element = document.getElementById(id);
				if (element) {
					return resolve(element);
				}
				if (Date.now() - start >= timeout) {
					return reject(
						new Error(
							`Element with id ${id} not found after ${timeout}ms`
						)
					);
				}
				setTimeout(poll, interval);
			})();
		});
	}

	// Additional mobile-specific adjustments
	function adjustPlotlyLayoutForMobile(postID, targetID) {
        const isMobilePreview =
            (window.location.href.includes('post.php') || window.location.href.includes("post-new.php")) && !!window.mobileBool;
        if (window.innerWidth <= 768 || isMobilePreview) {
			// basic mobile width check
			const plotDiv = document.getElementById(targetID);
			if (plotDiv) {
				plotDiv.style.maxWidth = '100%';
				plotDiv.style.height = '400px'; // Force a good height for mobile
				plotDiv.style.width = '100%';
				Plotly.Plots.resize(plotDiv);
			}
		}
	}


    if ((!window.location.href.includes("post.php") || window.location.href.includes("post-new.php")) && savedFigure != null) {

        async function waitForPlotlyDiv(plotlyDivID, retries = 150, interval = 300) {
            for (let i = 0; i < retries; i++) {
                const el = document.getElementById(plotlyDivID);
                if (el) {
                    return el;
                }
                await new Promise((resolve) => setTimeout(resolve, interval));
                // producePlotly* call removed — this function only WAITS for the div,
                // it does not re-render. Re-rendering here caused duplicate fetch calls
                // and empty charts in admin preview context.
            }
            throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
        }

        try {
            await waitForElementByIdPolling(targetId, 15000);
            await renderSavedFigure(targetId, savedFigure, plotlyDivID, postID);
            await waitForPlotlyDiv(plotlyDivID);
            adjustPlotlyLayoutForMobile(postID, plotlyDivID);
            console.log('RIP - PLOT1', postID);

            // Manually trigger for initially active tab
            const activeTab = document.querySelector('.tab-pane.active');
            if (activeTab && activeTab.id === tabContentElement.id) {
                if (!document.getElementById(plotlyDivID)) {
                    await renderSavedFigure(targetId, savedFigure, plotlyDivID, postID);
                    await waitForPlotlyDiv(plotlyDivID);
                    adjustPlotlyLayoutForMobile(postID, plotlyDivID);
                    console.log('RIP - PLOT2', postID);
                }
            }

            document
                .querySelectorAll('button[data-bs-toggle="tab"]')
                .forEach((tab) => {
                    tab.addEventListener('shown.bs.tab', () => {
                        const plotDiv =
                            document.getElementById(plotlyDivID);
                        if (plotDiv) {
                            setTimeout(() => {
                                Plotly.Plots.resize(plotDiv);
                            }, 150);
                        }
                    });
                });
        } catch (err) {
            console.error('Plotly interactive plot error:', err);
        }
    }

    if (window.location.href.includes("post.php") || window.location.href.includes("post-new.php")) {

        switch (figureType) {
        	case 'Interactive':
        		const figure_arguments = Object.fromEntries(
        			JSON.parse(interactive_arguments)
        		);
        		const graphType = figure_arguments.graphType;

        		if (graphType === 'Plotly line graph (time series)') {
                    async function waitForPlotlyDiv(plotlyDivID, retries = 150, interval = 300) {
                        for (let i = 0; i < retries; i++) {
                            const el = document.getElementById(plotlyDivID);
                            if (el) {
                                return el;
                            }
                            await new Promise((resolve) => setTimeout(resolve, interval));
                            // producePlotly* call removed — this function only WAITS for the div,
                            // it does not re-render. Re-rendering here caused duplicate fetch calls
                            // and empty charts in admin preview context.
                        }
                        throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
                    }

        			try {
        				await waitForElementByIdPolling(targetId, 15000);
        				await producePlotlyLineFigure(
        					targetId,
        					interactive_arguments,
        					postID,
                            targetDocument,
                            plotlyDivID
        				);
        				await waitForPlotlyDiv(plotlyDivID);
        				adjustPlotlyLayoutForMobile(postID, plotlyDivID);
        				console.log('RIP - PLOT1', postID);
                        

        				// Manually trigger for initially active tab
        				const activeTab = document.querySelector('.tab-pane.active');
        				if (activeTab && activeTab.id === tabContentElement.id) {
        					if (!document.getElementById(plotlyDivID)) {
        						await producePlotlyLineFigure(
        							targetId,
        							interactive_arguments,
        							postID,
                                    targetDocument,
                                    plotlyDivID
        						);
        						await waitForPlotlyDiv(plotlyDivID);
        						adjustPlotlyLayoutForMobile(postID, plotlyDivID);
        						console.log('RIP - PLOT2', postID);
        					}
        				}

        				document
        					.querySelectorAll('button[data-bs-toggle="tab"]')
        					.forEach((tab) => {
        						tab.addEventListener('shown.bs.tab', () => {
        							const plotDiv =
        								document.getElementById(plotlyDivID);
        							if (plotDiv) {
        								setTimeout(() => {
        									Plotly.Plots.resize(plotDiv);
        								}, 150);
        							}
        						});
        					});
        			} catch (err) {
        				console.error('Plotly interactive plot error:', err);
        			}
        		}

        		if (graphType === 'Plotly bar graph') {
                    async function waitForPlotlyDiv(plotlyDivID, retries = 150, interval = 300) {
                        for (let i = 0; i < retries; i++) {
                            const el = document.getElementById(plotlyDivID);
                            if (el) {
                                return el;
                            }
                            await new Promise((resolve) => setTimeout(resolve, interval));
                            // producePlotly* call removed — this function only WAITS for the div,
                            // it does not re-render. Re-rendering here caused duplicate fetch calls
                            // and empty charts in admin preview context.
                        }
                        throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
                    }

        			try {
        				await waitForElementByIdPolling(targetId, 15000);
        				await producePlotlyBarFigure(
        					targetId,
        					interactive_arguments,
        					postID,
                            targetDocument,
                            plotlyDivID
        				);
        				await waitForPlotlyDiv(plotlyDivID);
        				adjustPlotlyLayoutForMobile(postID, plotlyDivID);

        				// Manually trigger for initially active tab
        				const activeTab =
        					document.querySelector('.tab-pane.active');
        				if (activeTab && activeTab.id === tabContentElement.id) {
        					if (!document.getElementById(plotlyDivID)) {
        						await producePlotlyBarFigure(
        							targetId,
        							interactive_arguments,
        							postID,
                                    targetDocument,
                                    plotlyDivID
        						);
        						await waitForPlotlyDiv(plotlyDivID);
        						adjustPlotlyLayoutForMobile(postID, plotlyDivID);
        						console.log('RIP - PLOT2', postID);
        					}
        				}

        				document
        					.querySelectorAll('button[data-bs-toggle="tab"]')
        					.forEach((tab) => {
        						tab.addEventListener('shown.bs.tab', () => {
        							const plotDiv =
        								document.getElementById(plotlyDivID);
        							if (plotDiv) {
        								setTimeout(() => {
        									Plotly.Plots.resize(plotDiv);
        								}, 150);
        							}
        						});
        					});
        			} catch (err) {
        				console.error('Plotly interactive plot error:', err);
        			}
        		}

        		if (graphType === 'Plotly map') {
                    async function waitForPlotlyDiv(plotlyDivID, retries = 150, interval = 300) {
                        for (let i = 0; i < retries; i++) {
                            const el = document.getElementById(plotlyDivID);
                            if (el) {
                                return el;
                            }
                            await new Promise((resolve) => setTimeout(resolve, interval));
                            // producePlotly* call removed — this function only WAITS for the div,
                            // it does not re-render. Re-rendering here caused duplicate fetch calls
                            // and empty charts in admin preview context.
                        }
                        throw new Error(`Plotly div ${plotlyDivID} not found after ${retries * interval}ms`);
                    }

        			try {
        				await waitForElementByIdPolling(targetId, 15000);
        				await producePlotlyMap(
        					targetId,
        					interactive_arguments,
        					postID,
                            targetDocument,
                            plotlyDivID
        				);
        				await waitForPlotlyDiv(plotlyDivID);
        				adjustPlotlyLayoutForMobile(postID, plotlyDivID);

        				// Manually trigger for initially active tab
        				const activeTab =
        					document.querySelector('.tab-pane.active');
        				if (activeTab && activeTab.id === tabContentElement.id) {
        					if (!document.getElementById(plotlyDivID)) {
        						await producePlotlyBarFigure(
        							targetId,
        							interactive_arguments,
        							postID,
                                    targetDocument,
                                    plotlyDivID
        						);
        						await waitForPlotlyDiv(plotlyDivID);
        						adjustPlotlyLayoutForMobile(postID, plotlyDivID);
        						console.log('RIP - PLOT2', postID);
        					}
        				}

        				document
        					.querySelectorAll('button[data-bs-toggle="tab"]')
        					.forEach((tab) => {
        						tab.addEventListener('shown.bs.tab', () => {
        							const plotDiv =
        								document.getElementById(plotlyDivID);
        							if (plotDiv) {
        								setTimeout(() => {
        									Plotly.Plots.resize(plotDiv);
        								}, 150);
        							}
        						});
        					});
        			} catch (err) {
        				console.error('Plotly interactive plot error:', err);
        			}
        		}

                const plotlyElement = document.getElementById(plotlyDivID);
                const modebar = plotlyElement?.querySelector('.modebar');
                if (modebar) {
                    modebar.style.top = '-28px';
                }

        		//Google Tags
                // document.addEventListener('graphic-data:figureTimeseriesGraphLoaded', (event) => {  
                //     console.log('Received graphic-data:figureTimeseriesGraphLoaded', event.detail);
                // });


        		if (!window.location.href.includes('post.php') || window.location.href.includes("post-new.php")) {
                    document.dispatchEvent( new CustomEvent( 'graphic-data:figureTimeseriesGraphLoaded', {
                        detail: { title, postID }
                    } ) );
        		}

        		break;
        }
    }    
}

/**
 * Renders tab content into the provided container element based on the information passed in the `info_obj` object.
 * This function creates a styled layout that includes links, an image with a caption, and an expandable details section.
 *
 * @param    {HTMLElement} tabContentElement   - The HTML element where the content for the tab will be inserted.
 * @param    {HTMLElement} tabContentContainer - The container element that holds the tab content and allows appending the tab content element.
 * @param    {Object}      info_obj            - An object containing information used to populate the tab content.
 * @param                  idx
 * @property {string}      scienceLink         - URL for the "More Science" link.
 * @property {string}      scienceText         - Text displayed for the "More Science" link. This text is prepended with a clipboard icon.
 * @property {string}      dataLink            - URL for the "More Data" link.
 * @property {string}      code                - HTML or JS code for embedding.
 * @property {string}      dataText            - Text displayed for the "More Data" link. This text is prepended with a database icon.
 * @property {string}      imageLink           - URL of the image to be displayed in the figure section.
 * @property {string}      shortCaption        - Short description that serves as the image caption.
 * @property {string}      longCaption         - Detailed text that is revealed when the user clicks on the expandable 'Click for Details' section.
 * @return {void} Modifies dom
 * Function Workflow:
 * 1. A container `div` element is created with custom styling, including background color, padding, and border-radius.
 * 2. Inside this container, a `table-row`-like structure is created using `div` elements that display two links:
 *      a. A "More Science" link on the left, prepended with a clipboard icon.
 *      b. A "More Data" link on the right, prepended with a database icon.
 * 3. The function appends the container to `tabContentElement` only if both the science link text and data link exist.
 * 4. An image with a caption is added to `tabContentElement`, using the URL and caption provided in `info_obj`.
 * 5. A `details` element is created, which reveals more information (the long caption) when the user clicks the 'Click for Details' summary.
 * 6. The function appends the entire tab content (container with links, figure with image, caption, and details) to `tabContentContainer`.
 *
 * Styling and Layout:
 * - The function uses a `table-row` and `table-cell` approach for laying out the links side by side.
 * - Links are decorated with icons, styled to remove the underline, and open in a new tab.
 * - The image is styled to be responsive (100% width) and centered within the figure.
 * - The `details` element is collapsible, providing a clean way to show the long caption when needed.
 *
 * Usage:
 * This function is called for each tab, populating one or more figures (and other corresponding info)
 */
export async function render_tab_info(tabContentElement, tabContentContainer, info_obj, idx, isBlock, tab_id, tab_title){

    // console.log('info_obj', info_obj);
    // console.log('tabContentElement', tabContentElement);
    // console.log('tabContentContainer', tabContentContainer);

    //Lets control if the figure is published or not
    let figure_published = info_obj["figure_published"];
    if (figure_published != "published"){
        if (window.location.href.includes('post.php') || window.location.href.includes("post-new.php")) {
            figure_published = "published";
        } else {
            return; // do not render if the figure is not published
        }
    }

    let postID = info_obj["postID"];
    let title = info_obj['figureTitle'];

    // Create the table row div
    const tableRowDiv = document.createElement(`div`);
    tableRowDiv.style.display = 'table-row';


    //Create a separator to make this figure distinct from others
    // if (!isBlock || isBlock === null) {
    //     const separator = document.createElement('div');
    //     separator.classList.add("separator");
    //     separator.style.color = 'none';
    //     separator.innerHTML = '<hr style="border: 1px solid #a2a2a2" >';
    //     tableRowDiv.appendChild(separator);
    // }

    if ((!isBlock || isBlock === null) && idx != 0) {
        const separator = document.createElement('div');
        separator.classList.add("separator");
        separator.style.color = 'none';
        separator.innerHTML = '<hr style="border: 1px solid #a2a2a2" >';
        tableRowDiv.appendChild(separator);
    }

    //CONSTRUCT THE MAIN DIV "FIGURE" WHERE THE CONTENT WILL GO
    //const figureDiv = document.createElement('div');
    const figureDiv = tableRowDiv;
    figureDiv.classList.add('figure');
    // figureDiv.id = `figure-${idx+1}`;
    figureDiv.id = `figure-${postID}`;



    //CREATE THE EMBED, COPY LINK, & RETURN BUTTONS
    if (!window.location.href.includes('post.php') && !window.location.href.includes("post-new.php")) {
        // Container for links
        const figureLinkContainer = document.createElement('div');
        figureLinkContainer.style.display = 'flex';
        figureLinkContainer.style.justifyContent = 'space-between';
        figureLinkContainer.style.alignItems = 'center';
        figureLinkContainer.style.width = '100%';
        figureLinkContainer.style.gap = '12px';
        figureLinkContainer.style.marginBottom = '1rem';


        //Add "figure" index
        const targetId = `figure-${idx + 1}`;

        const figureIndex = document.createElement('div');
        figureIndex.textContent = `Figure ${idx + 1}`;
        figureIndex.style.color = 'rgba(68, 68, 68, 0.55)';
        figureIndex.style.textDecoration = 'none';
        figureIndex.style.fontSize = '0.8em';
        figureIndex.style.marginRight = '2em';
        figureIndex.style.marginLeft = '.2em';
        figureIndex.style.cursor = 'pointer';

        /*
        * Make the div usable with a keyboard.
        */
        figureIndex.setAttribute('role', 'button');
        figureIndex.setAttribute('tabindex', '0');

        figureIndex.addEventListener('click', () => {
            navigateToFigureHash(targetId);
        });

        figureIndex.addEventListener('keydown', (event) => {
            if (
                event.key !== 'Enter' &&
                event.key !== ' '
            ) {
                return;
            }

            event.preventDefault();
            navigateToFigureHash(targetId);
        });
    
        // Add "Return" link
        const goToTopLink = document.createElement("a");
        goToTopLink.href = "#";
        goToTopLink.textContent = "↑ Return";
        goToTopLink.style.color = "rgba(68, 68, 68, 0.55)";
        goToTopLink.style.textDecoration = "none";
        goToTopLink.style.fontSize = "0.8em";
        goToTopLink.style.marginRight = "0.8em";
        goToTopLink.style.marginleft = "0.8em";
    
        goToTopLink.addEventListener("click", function (e) {
            e.preventDefault();
            document.getElementById("modal-title").scrollIntoView({
                top: 0,
                behavior: "smooth"
            });
        });

        // Add "Close" link
        const closeLink = document.createElement('a');

        closeLink.href = '#';
        closeLink.textContent = '× Close';
        closeLink.style.color = 'rgba(68, 68, 68, 0.55)';
        closeLink.style.textDecoration = 'none';
        closeLink.style.fontSize = '0.8em';
        closeLink.style.marginRight = '0.8em';
        // closeLink.style.marginLeft = '0.8em';

        closeLink.addEventListener('click', function (event) {
            event.preventDefault();

            const closeButton = document.getElementById('close');

            if (!closeButton) {
                console.error('The close button with id="close" was not found.');
                return;
            }

            closeButton.click();
        });
    
        // Add "Embed" link
        const embedLink = document.createElement('a');

        embedLink.href = '#';
        embedLink.textContent = '</> Embed Figure & Context';
        embedLink.style.color = 'rgba(68, 68, 68, 0.55)';
        embedLink.style.textDecoration = 'none';
        embedLink.style.fontSize = '0.8em';
        embedLink.style.marginRight = '0.8em';
        embedLink.style.marginLeft = '0.8em';

        embedLink.addEventListener('click', async function (event) {
            event.preventDefault();

            const iframePath = info_obj['iframeCode'];
            console.log('typeof iframePath', typeof iframePath);

            if (!iframePath || typeof iframePath !== 'string') {
                console.error(
                    'No iframe path was found in info_obj["iframe_path"].'
                );

                alert('The iframe embed code is unavailable.');
                return;
            }

            const iframeCode = `<iframe
            src="${iframePath}"
            title="${info_obj['figureTitle'] || `Figure ${postID}`}"
            width="100%"
            height="725"
            loading="lazy"
            style="display: block; width: 100%; min-height: 550px; border: 0;"
        ></iframe>`;


            try {
                await navigator.clipboard.writeText(iframeCode);

                alert(
                    'The iframe embed code has been copied to the clipboard.'
                );
            } catch (error) {
                console.error(
                    'Unable to copy the iframe embed code:',
                    error
                );

                alert(
                    'The iframe embed code could not be copied to the clipboard.'
                );
            }
        });

        // Add "Embed" link for figure only
        const embedLinkFigureOnly = document.createElement('a');

        embedLinkFigureOnly.href = '#';
        embedLinkFigureOnly.textContent = '</> Embed Figure Only';
        embedLinkFigureOnly.style.color = 'rgba(68, 68, 68, 0.55)';
        embedLinkFigureOnly.style.textDecoration = 'none';
        embedLinkFigureOnly.style.fontSize = '0.8em';
        embedLinkFigureOnly.style.marginRight = '0.8em';
        embedLinkFigureOnly.style.marginLeft = '0.8em';

        embedLinkFigureOnly.addEventListener('click', async function (event) {
            event.preventDefault();

            const iframePath = info_obj['iframeCode'].replace(
                /\.html$/,
                '_figure_only.html'
            );

            if (!iframePath || typeof iframePath !== 'string') {
                console.error(
                    'No iframe path was found in info_obj["iframe_path"].'
                );

                alert('The iframe embed code is unavailable.');
                return;
            }

            const iframeCode = `<iframe
                src="${iframePath}"
                title="${info_obj['figureTitle'] || `Figure ${postID}`}"
                width="100%"
                height="725"
                loading="lazy"
                style="display: block; width: 100%; min-height: 550px; border: 0;"
            ></iframe>`;


            try {
                await navigator.clipboard.writeText(iframeCode);

                alert(
                    'The iframe embed code has been copied to the clipboard.'
                );
            } catch (error) {
                console.error(
                    'Unable to copy the iframe embed code:',
                    error
                );

                alert(
                    'The iframe embed code could not be copied to the clipboard.'
                );
            }
        });
        

        // Add "Share" link
        const shareLink = document.createElement("a");
        shareLink.href = "#";
        shareLink.style.color = "rgba(68, 68, 68, 0.55)";
        shareLink.style.textDecoration = "none";
        shareLink.style.fontSize = "0.8em";
        shareLink.style.display = "inline-flex";
        shareLink.style.alignItems = "center";
        shareLink.style.gap = "6px";
        // shareLink.style.marginRight = ".5rem";
        // shareLink.style.marginleft = "1rem";

        // Swoop/share-style SVG icon (inline, no external assets)
        shareLink.innerHTML = `
            <span><i class="fa-solid fa-copy"></i> Copy Figure Link</span>
        `;
      
        shareLink.addEventListener('click', async function (e) {
            e.preventDefault();
        
            const url = new URL(window.location.href);
        
            // Setting .hash replaces any existing hash.
            url.hash =
                `${encodeURIComponent(tab_title)}/` +
                `${encodeURIComponent(tab_id)}` +
                // `?figure=${encodeURIComponent(figureDiv.id)}`;
                `?figure=${encodeURIComponent(postID)}`;

                postID
        
            const shareUrl = url.toString();
        
            try {
                await navigator.clipboard.writeText(shareUrl);
                console.log('Copied:', shareUrl);
        
                // Redirect the current page to the new share URL.
                window.location.assign(shareUrl);
                alert(
                    'Link copied successfully.'
                );
            } catch (err) {
                console.error('Failed to copy:', err);
        
                // Redirect even if clipboard access fails.
                window.location.assign(shareUrl);
            }
        });
    
        /*
        * Create the Share dropdown.
        */
        const shareDropdown = document.createElement('details');

        shareDropdown.className = 'figure-share-dropdown';
        shareDropdown.style.position = 'relative';
        shareDropdown.style.fontSize = '0.8em';

        /*
        * Create the visible Share control.
        */
        const shareDropdownButton = document.createElement('summary');

        shareDropdownButton.textContent = 'Share';
        shareDropdownButton.style.color = 'rgba(68, 68, 68, 0.55)';
        shareDropdownButton.style.cursor = 'pointer';
        shareDropdownButton.style.userSelect = 'none';
        shareDropdownButton.style.whiteSpace = 'nowrap';
        shareDropdownButton.style.marginRight = ".5rem";

        /*
        * Create the dropdown menu that opens below Share.
        */
        const shareDropdownMenu = document.createElement('div');

        shareDropdownMenu.className = 'figure-share-dropdown-menu';
        shareDropdownMenu.style.position = 'absolute';
        shareDropdownMenu.style.top = 'calc(100% + 6px)';
        shareDropdownMenu.style.right = '0';
        shareDropdownMenu.style.left = 'auto';
        shareDropdownMenu.style.zIndex = '1000';
        shareDropdownMenu.style.display = 'flex';
        shareDropdownMenu.style.flexDirection = 'column';
        shareDropdownMenu.style.alignItems = 'stretch';
        shareDropdownMenu.style.gap = '8px';
        shareDropdownMenu.style.width = '185px';
        shareDropdownMenu.style.maxWidth = 'calc(100vw - 30px)';
        shareDropdownMenu.style.boxSizing = 'border-box';
        shareDropdownMenu.style.padding = '10px';
        shareDropdownMenu.style.backgroundColor = '#ffffff';
        shareDropdownMenu.style.border =
            '1px solid rgba(68, 68, 68, 0.18)';
        shareDropdownMenu.style.borderRadius = '6px';
        shareDropdownMenu.style.boxShadow =
            '0 4px 12px rgba(0, 0, 0, 0.12)';

        /*
        * Reset the individual link margins because the dropdown controls
        * their spacing.
        */
        [
            embedLink,
            embedLinkFigureOnly,
            shareLink
        ].forEach(function (link) {
            link.style.display = 'block';
            link.style.width = '100%';
            link.style.margin = '0';
            link.style.padding = '4px 6px';
            link.style.whiteSpace = 'nowrap';
        });

        /*
        * Close the dropdown after one of its options is selected.
        *
        * The existing click listeners on these links will still run.
        */
        [
            embedLink,
            embedLinkFigureOnly,
            shareLink
        ].forEach(function (link) {
            link.addEventListener('click', function () {
                shareDropdown.removeAttribute('open');
            });
        });

        /*
        * Put the three existing options inside the dropdown.
        */
        shareDropdownMenu.appendChild(embedLink);
        shareDropdownMenu.appendChild(embedLinkFigureOnly);
        shareDropdownMenu.appendChild(shareLink);

        shareDropdown.appendChild(shareDropdownButton);
        shareDropdown.appendChild(shareDropdownMenu);

       /*
        * Keep the figure index on the left and all other controls on the right.
        */
        const figureLinkControls = document.createElement('div');

        figureLinkControls.style.display = 'flex';
        figureLinkControls.style.justifyContent = 'flex-end';
        figureLinkControls.style.alignItems = 'center';
        figureLinkControls.style.gap = '12px';
        figureLinkControls.style.marginLeft = 'auto';

        // figureLinkControls.appendChild(goToTopLink);
        figureLinkControls.appendChild(closeLink);
        figureLinkControls.appendChild(shareDropdown);

        figureLinkContainer.appendChild(figureIndex);
        figureLinkContainer.appendChild(figureLinkControls);

        figureDiv.appendChild(figureLinkContainer);


        document.addEventListener('click', function (event) {
            if (!shareDropdown.contains(event.target)) {
                shareDropdown.removeAttribute('open');
            }
        });
    }

    //Container for more science and data links
    const containerDiv = document.createElement(`div`);
    containerDiv.style.background = '#e3e3e354';
    containerDiv.style.width = '100%';
    containerDiv.style.display = 'table';
    if (is_mobile()) {
        containerDiv.style.fontSize = '1rem';

        // Prevent the container itself from overflowing.
        containerDiv.style.width = '100%';
        containerDiv.style.maxWidth = '100%';
        containerDiv.style.overflow = 'hidden';

        // Allow both the left and right sides to shrink and wrap.
        Array.from(containerDiv.children).forEach((child) => {
            child.style.minWidth = '0';
            child.style.maxWidth = '100%';

            child.style.whiteSpace = 'normal';
            child.style.overflowWrap = 'anywhere';
            child.style.wordBreak = 'break-word';
        });
    } else {
        containerDiv.style.fontSize = '1.25rem';
    }
    containerDiv.style.padding = '10px';
    containerDiv.style.marginTop = '15px';
    containerDiv.style.marginBottom = '40px';
    // containerDiv.style.margin = '0 auto'; 
    containerDiv.style.borderRadius = '6px 6px 6px 6px'; 
    containerDiv.style.borderWidth = '1px'; 
    containerDiv.style.borderColor = 'lightgrey'; 


    // Create the left cell div
    const leftCellDiv = document.createElement('div');
    leftCellDiv.style.textAlign = 'left';
    leftCellDiv.style.display = 'table-cell';

    // More Science Link Here
    const firstLink = document.createElement('a');
    firstLink.href = info_obj['scienceLink'];
    firstLink.target = '_blank';
    if (info_obj['scienceText']!=''){
        firstLink.appendChild(document.createTextNode(info_obj['scienceText']));
        let icon1 = `<i class="fa fa-clipboard-list" role="presentation" aria-label="clipboard-list icon" style=""></i> `;
        firstLink.innerHTML = icon1 + firstLink.innerHTML;
        firstLink.style.textDecoration = 'none';
        firstLink.classList.add('gray-bar-links');
        leftCellDiv.appendChild(firstLink);
    }

    // Create the right cell div
    const rightCellDiv = document.createElement('div');
    rightCellDiv.style.textAlign = 'right';
    rightCellDiv.style.display = 'table-cell';

    // Create the second link
    if (info_obj['dataLink']!=''){
        const secondLink = document.createElement('a');
        secondLink.href = info_obj['dataLink'];
        secondLink.target = '_blank';
        secondLink.classList.add('gray-bar-links');
        let icon2 = `<i class="fa fa-database" role="presentation" aria-label="database icon"></i>`;
        secondLink.appendChild(document.createTextNode(info_obj['dataText']));
        secondLink.innerHTML = icon2 + `  ` + secondLink.innerHTML;
        secondLink.style.textDecoration = 'none';
        rightCellDiv.appendChild(secondLink);
    }

    if (info_obj['dataLink']!='' || info_obj['scienceText']!=''){
        containerDiv.appendChild(leftCellDiv);
        containerDiv.appendChild(rightCellDiv);
        figureDiv.appendChild(containerDiv);
    }



    //CREATE THE FIGURE TITLE
    const figureTitle = document.createElement("div");
    figureTitle.classList.add('figureTitle');
    figureTitle.innerHTML = info_obj['figureTitle'];
    figureTitle.style.marginBottom = '2px';
    figureTitle.style.marginTop = '15px';
    figureTitle.style.marginBottom = '28px';
    figureTitle.style.textAlign = 'center';
    figureDiv.appendChild(figureTitle);


    //CREATE THE FIGURE
    let img;
    let figureType = info_obj["figureType"];

    switch (figureType) {
        case "Internal":           
            img = document.createElement(`img`);
            img.id = `img_${postID}`;
            img.src = info_obj['imageLink'];

            if (info_obj['externalAlt']){
                img.alt = info_obj['externalAlt'];
            } else {
                const protocol = window.location.protocol; // Get the current protocol (e.g., http or https)
                const host = window.location.host;// Get the current host (e.g., domain name)
                const restURL = protocol + "//" + host  + "/wp-json/graphic_data/v1/media/alt-text-by-url?image_url=" + encodeURI(img.src); 
                fetch(restURL)                
                .then(response => response.json())
                .then(data => {
                    const imgAltText = data["alt_text"];
                    if (imgAltText){            
                        img.alt = imgAltText;
                    }

                })
                // Log any errors that occur during the fetch process
                .catch((err) => {console.error(err)});
            }
            if (img.id  === `img_${postID}`) {
                await figureDiv.appendChild(img);

                //Error in admin preview for handling for missing image
                if (window.location.href.includes('post.php') || window.location.href.includes("post-new.php")) {
                    if (img.src.includes('post.php') || img.src.includes('post-new.php')) {
                        document.dispatchEvent( new CustomEvent( 'graphic-data:figurePreviewError', {
                            detail: { tabContentElement, figureType }
                        } ) );
                    } 
                }
            } else
            window.dataLayer = window.dataLayer || [];

            //Google Tags
            // document.addEventListener('graphic-data:figureInternalImageLoaded', (event) => {  
            //     console.log('Received graphic-data:figureInternalImageLoaded', event.detail);
            // });
            
            if (!window.location.href.includes('post.php') || !window.location.href.includes("post-new.php")) {
                document.dispatchEvent( new CustomEvent( 'graphic-data:figureInternalImageLoaded', {
                    detail: { title, postID }
                } ) );
            }
        break;

        case "External":
            img = document.createElement('img');
            img.id = `img_${postID}`;
            img.src = info_obj['imageLink'];

            if (info_obj['externalAlt']){
                img.alt = info_obj['externalAlt'];
            } else {
                img.alt = '';
            }
            if (img.id  === `img_${postID}`) {
                await figureDiv.appendChild(img);

                //Error in admin preview for handling for missing image
                if (window.location.href.includes('post.php') || window.location.href.includes("post-new.php")) {
                    if (img.src.includes('post.php') || img.src.includes('post-new.php')) {
                        document.dispatchEvent( new CustomEvent( 'graphic-data:figurePreviewError', {
                            detail: { tabContentElement, figureType }
                        } ) );
                    } 
                }
                
            } else {}

            //Google Tags
            // document.addEventListener('graphic-data:figureExternalImageLoaded', (event) => {  
            //     console.log('Received graphic-data:figureExternalImageLoaded', event.detail);
            // });

            if (!window.location.href.includes('post.php') || !window.location.href.includes("post-new.php")) {
                document.dispatchEvent( new CustomEvent( 'graphic-data:figureExternalImageLoaded', {
                    detail: { title, postID }
                } ) );
            }
        break;

        case "Interactive":
            // Create a div for the interactive figure, the rest will be handled by the render_interactive_plots function
            img = document.createElement('div');
            const uniqueHash = window.crypto?.randomUUID?.() || `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
            img.id = `javascript_figure_target_${postID}_${uniqueHash}`;
            //img.id = `javascript_figure_target_${postID}`;
            await figureDiv.appendChild(img);           
        break;

        case "Code":
            img = '';
            // Create a new div to display the embed code
            const codeDiv = document.createElement("div");
            codeDiv.id = "code_display_window";
            codeDiv.style.width = "100%";
            codeDiv.style.minHeight = "300px";
            codeDiv.style.padding = "10px";
            codeDiv.style.backgroundColor = "#ffffff";
            codeDiv.style.overflow = "auto";
            // Center the content using Flexbox
            codeDiv.style.display = "flex";
            codeDiv.style.justifyContent = "center"; // Centers horizontally
            codeDiv.style.alignItems = "center"; // Centers vertically (if height is greater than content)

            
            //Append the codeDiv to the figureDiv
            await figureDiv.appendChild(codeDiv);
            let embedCode = info_obj['code'];

            //Error in admin preview for handling for missing image
            if (!embedCode || embedCode === ''){
                if (window.location.href.includes('post.php') || window.location.href.includes("post-new.php")) {
                    document.dispatchEvent( new CustomEvent( 'graphic-data:figurePreviewError', {
                        detail: { tabContentElement, figureType }
                    } ) );
                }
            }

            // Parse the embed code and extract <script> tags
            const tempDiv = document.createElement("div");
            tempDiv.innerHTML = embedCode;

            // Move <script> tags to the head and inject the rest into the preview div
            const scripts = tempDiv.querySelectorAll("script");
            scripts.forEach((script) => {
                const newScript = document.createElement("script");
                newScript.type = script.type || "text/javascript";
                if (script.src) {
                    newScript.src = script.src; // External script
                } else {
                    newScript.textContent = script.textContent; // Inline script
                }
                document.head.appendChild(newScript); // Add to <head>
                script.remove(); // Remove the script tag from tempDiv
            });
            // Inject remaining HTML into the codeDiv
            codeDiv.innerHTML = tempDiv.innerHTML;

            //Google Tags
            // document.addEventListener('graphic-data:figureCodeDisplayLoaded', (event) => {  
            //     console.log('Received graphic-data:figureCodeDisplayLoaded', event.detail);
            // });

            if (!window.location.href.includes('post.php') || !window.location.href.includes("post-new.php")) {
                document.dispatchEvent( new CustomEvent( 'graphic-data:figureCodeDisplayLoaded', {
                    detail: { title, postID }
                } ) );
            }
        break;

    }
   
    //ATTRIBUTES FOR THE FIGURE DIV
    figureDiv.style.justifyContent = "center"; // Center horizontally
    figureDiv.style.alignItems = "center";
    figureDiv.setAttribute("style", "width: 100% !important; height: auto; display: block; margin: 0; margin-top: 2%");
    
  
    //CREATE PARAGRAPH ELEMENT UNDER "myTabContent" > div class="figure"
    const caption = document.createElement('p');
    caption.classList.add('caption');
    let tempShortCaption = info_obj['shortCaption'];
    tempShortCaption = tempShortCaption.replace(/\r\n\r\n/g, '<p style="margin-top: 15px;">');
    caption.innerHTML = tempShortCaption;
    caption.style.marginTop = '20px';
    figureDiv.appendChild(caption);
    tabContentElement.appendChild(figureDiv);


    // Create the details element
    const details = document.createElement('details');
    const summary = document.createElement('summary');
    if (is_mobile()) {
        summary.style.marginBottom = '5%';
    } else {
        summary.style.marginBottom = '2%';
    }
    summary.textContent = 'More Details';

    let longCaption = document.createElement("p");
    let tempLongCaption = info_obj['longCaption'];
    tempLongCaption = tempLongCaption.replace(/\r\n\r\n/g, '<p style="margin-top: 15px;">');
    longCaption.innerHTML = tempLongCaption;
    if (info_obj['longCaption'] != ''){
        details.appendChild(summary);
        details.appendChild(longCaption);
        tabContentElement.appendChild(details);

    }
    
    // Add the details element to the tab content element
    tabContentContainer.appendChild(tabContentElement); 

    //Google Tags registration for figure science and data links
    if (info_obj['scienceText']!=''){
        if (!window.location.href.includes('post.php') || !window.location.href.includes("post-new.php")) {
            document.dispatchEvent( new CustomEvent( 'graphic-data:setupFigureScienceLinkTracking', {
                detail: { postID }
            } ) );
        }
    }
    if (info_obj['dataLink']!=''){
        document.dispatchEvent( new CustomEvent( 'graphic-data:setupFigureDataLinkTracking', {
            detail: { postID }
        } ) );
    }
    //Finish the containers and give them the correct properties.
    switch (figureType) {
        case "Internal":
                img.setAttribute("style", "width: 100% !important; height: auto; display: block; margin: 0; margin-top: 2%");
            break;
        case "External":
                img.setAttribute("style", "width: 100% !important; height: auto; display: block; margin: 0; margin-top: 2%");
            break;
        case "Interactive":
                img.setAttribute("style", "width: 100% !important; height: auto; display: flex; margin: 0; margin-top: 2%");
                
                // let plotDiv = document.querySelector(`#plotlyFigure${postID}`);
                // try {
                //     plotDiv.style.width = "100%";
                // } catch {};
            break;
    }

    if (figureType === 'Interactive' ) {
        return img.id;
    }

}

  
  
  

