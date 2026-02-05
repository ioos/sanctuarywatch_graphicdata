/**
 * Displays the embed code in a preview box below the preview button.
 * Handles the removal of existing preview windows, parsing of embed code, and injection of scripts and HTML.
 *
 * @param {HTMLElement} previewCodeButton - The button element that triggers the preview display.
 */
function displayCode(previewCodeButton) {
	// Remove existing preview div if present
	const previewWindow = document.getElementById('code_preview_window');
	if (previewWindow) {
		previewWindow.parentNode.removeChild(previewWindow);
	}

	// Create a new div to display the embed code
	const previewDiv = document.createElement('div');
	previewDiv.id = 'code_preview_window';
	previewDiv.style.width = '100%';
	previewDiv.style.minHeight = '300px';
	previewDiv.style.padding = '10px';
	previewDiv.style.backgroundColor = '#ffffff';
	previewDiv.style.overflow = 'auto';
	// Center the content using Flexbox
	previewDiv.style.display = 'flex';
	previewDiv.style.justifyContent = 'center'; // Centers horizontally
	previewDiv.style.alignItems = 'center'; // Centers vertically (if height is greater than content)

	// Get the embed code from the figure_code field
	const embedCode =
		document.getElementsByName('figure_code')[0]?.value ||
		"No code available. Set the 'Figure Type' to 'Code' and paste your code into the HTML/JavaScript Code Code text area.";

	try {
		// Parse the embed code and extract <script> tags
		const tempDiv = document.createElement('div');
		tempDiv.innerHTML = embedCode;

		// Move <script> tags to the head and inject the rest into the preview div
		const scripts = tempDiv.querySelectorAll('script');
		scripts.forEach((script) => {
			const newScript = document.createElement('script');
			newScript.type = script.type || 'text/javascript';
			if (script.src) {
				newScript.src = script.src; // External script
			} else {
				newScript.textContent = script.textContent; // Inline script
			}
			document.head.appendChild(newScript); // Add to <head>
			script.remove(); // Remove the script tag from tempDiv
		});

		// Inject remaining HTML into the preview div
		previewDiv.innerHTML = tempDiv.innerHTML;

		// Append the preview div below the button
		//document.querySelector('[data-depend-id="figure_preview"]').insertAdjacentElement("afterend", previewDiv);
		document
			.querySelector('.figureTitle')
			.insertAdjacentElement('afterend', previewDiv);
	} catch (error) {
		// Handle errors during embed code injection
		console.error('Failed to inject embed code:', error);
		previewDiv.textContent =
			'Failed to load embed code. Please check your input.';
		//document.querySelector('[data-depend-id="figure_preview"]').insertAdjacentElement("afterend", previewDiv);
		document
			.querySelector('.figureTitle')
			.insertAdjacentElement('afterend', previewDiv);
	}
}
