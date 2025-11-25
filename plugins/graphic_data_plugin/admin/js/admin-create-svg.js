document.addEventListener('DOMContentLoaded', function() {
    // Update range slider value display
    const rangeInput = document.getElementById('svgIconNumber');
    const rangeValue = document.getElementById('svgIconNumberValue');
    const rangeIconNumber = document.getElementById('svgIconNumber');

    rangeIconNumber.addEventListener('change', function() {
        // delete existing field container if it exists
        let fieldsContainer = document.getElementById('fieldsContainer');
        if (fieldsContainer) {
            fieldsContainer.remove();
        }
        // create new field container
        fieldsContainer = document.createElement('div');
        fieldsContainer.id = 'fieldsContainer';
        const iconNumber = rangeIconNumber.value
        
        if (iconNumber > 0) {
            const lineBreak0 = document.createElement('p');
            fieldsContainer.appendChild(lineBreak0);
        }

        for (let i = 1; i <= iconNumber; i++) {
            const fieldDiv = document.createElement('div');
            fieldDiv.className = 'icon-field';
            fieldDiv.style.marginBottom = '10px';

            const label1 = document.createElement('label');
            label1.for = `iconLabel${i}`;
            label1.textContent = `Icon ${i} label: `;
            label1.style.fontWeight = 'bold';

            const inputLabel = document.createElement('input');
            inputLabel.type = 'text';
            inputLabel.id = `iconLabel${i}`;
            inputLabel.name = `iconLabel${i}`;
            inputLabel.style.marginRight = '20px';
            inputLabel.style.width = '300px';

            fieldDiv.appendChild(label1);
            fieldDiv.appendChild(inputLabel);

            const lineBreak1 = document.createElement('p');
            fieldDiv.appendChild(lineBreak1);

            const label2 = document.createElement('label');
            label2.for = `iconTitle${i}`;
            label2.textContent = `Icon ${i} title: `;
            label2.style.fontWeight = 'bold';

            const inputTitle = document.createElement('input');
            inputTitle.type = 'text';
            inputTitle.id = `iconTitle${i}`;
            inputTitle.name = `iconTitle${i}`;
            inputTitle.style.marginRight = '20px';
            inputTitle.style.width = '300px';

            fieldDiv.appendChild(label2);
            fieldDiv.appendChild(inputTitle);

            const lineBreak2 = document.createElement('p');
            fieldDiv.appendChild(lineBreak2);

            const label3 = document.createElement('label');
            label3.textContent = `Icon ${i} will look different in mobile view? `;
            label3.style.fontWeight = 'bold';

            const inputMobile = document.createElement('input');
            inputMobile.type = 'checkbox';
            inputMobile.id = `iconMobile${i}`;
            inputMobile.name = `iconMobile${i}`;
            inputMobile.style.marginLeft = '10px';

            label3.appendChild(inputMobile);
            fieldDiv.appendChild(label3);

            const hrIcons = document.createElement('hr');
            fieldDiv.appendChild(hrIcons);
            fieldsContainer.appendChild(fieldDiv);
        }

        // Insert after the form-section div
        const formSection = document.querySelector('.form-section');
        formSection.parentElement.insertBefore(fieldsContainer, formSection.nextSibling);
    });

    rangeInput.addEventListener('input', function() {
        rangeValue.textContent = this.value;
    });

    document.getElementById('generateSVG').addEventListener('click', function() {
        // Check if SVG Title field is blank
        var svgTitle = document.getElementById('svgTitle');
        if (!svgTitle || svgTitle.value.trim() === '') {
            // Remove any existing error messages
            var existingError = document.getElementById('svgTitleError');
            if (existingError) {
                existingError.remove();
            }

            // Create error message
            var errorDiv = document.createElement('div');
            errorDiv.id = 'svgTitleError';
            errorDiv.className = 'notice notice-error is-dismissible';
            errorDiv.innerHTML = '<p><strong>Error:</strong> SVG Title cannot be blank. Please enter a title before generating the SVG.</p>';

            // Insert error message at the top of the wrap div
            var wrapDiv = document.querySelector('.wrap');
            if (wrapDiv) {
                wrapDiv.insertBefore(errorDiv, wrapDiv.firstChild);
            }

            // Scroll to top to show the error
            window.scrollTo({ top: 0, behavior: 'smooth' });

            // Focus on the svgTitle field
            svgTitle.focus();

            return;
        }

        // Prompt user for filename with timestamp as default
        var timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
        var defaultFilename = 'location-' + timestamp;
        var filename = prompt('Enter filename for SVG (without extension):', defaultFilename);

        // If user cancels, exit
        if (filename === null || filename.trim() === '') {
            return;
        }

        // Clean filename (remove invalid characters)
        filename = filename.trim().replace(/[^a-z0-9_-]/gi, '_');

        // Example SVG content - replace this with your actual SVG generation logic
        var svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
            '<circle cx="100" cy="100" r="80" fill="#4CAF50" />' +
            '<text x="100" y="110" text-anchor="middle" fill="white" font-size="20">SVG: ' + filename + '</text>' +
            '</svg>';

        // Show preview
        document.getElementById('svgContainer').innerHTML = svgContent;
        document.getElementById('svgPreview').style.display = 'block';

        // Create a Blob from the SVG content
        var blob = new Blob([svgContent], { type: 'image/svg+xml' });

        // Create a download link
        var url = URL.createObjectURL(blob);
        var downloadLink = document.createElement('a');
        downloadLink.href = url;
        downloadLink.download = filename + '.svg';

        // Trigger download
        document.body.appendChild(downloadLink);
        downloadLink.click();
        document.body.removeChild(downloadLink);

        // Clean up the URL object
        URL.revokeObjectURL(url);
    });
});
