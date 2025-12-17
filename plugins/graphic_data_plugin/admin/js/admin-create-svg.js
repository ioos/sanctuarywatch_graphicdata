document.addEventListener('DOMContentLoaded', function() {
    // Update range slider value display
    const rangeInput = document.getElementById('svgIconNumber');
    const rangeValue = document.getElementById('svgIconNumberValue');
    const rangeIconNumber = document.getElementById('svgIconNumber');
    console.log("hello");
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

    // Helper function to show errors
    function showError(message) {
        let errorDiv = document.createElement('div');
        errorDiv.className = 'svgValidationError notice notice-error is-dismissible';
        errorDiv.innerHTML = '<p><strong>Error:</strong><br>' + message + '</p>';

        let wrapDiv = document.querySelector('.wrap');
        if (wrapDiv) {
            wrapDiv.insertBefore(errorDiv, wrapDiv.firstChild);
        }

        window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    // Form validation
    function validateForm() {
        // Remove any existing error messages
        const existingError = document.getElementsByClassName('svgValidationError');
        if (existingError.length > 0) {
            Array.from(existingError).forEach(err => err.remove());
        }

        let fieldError = false;

        // Check if SVG Title field is blank
        const svgTitle = document.getElementById('svgTitle');
        if (!svgTitle || svgTitle.value.trim() === '') {
            showError('The field SVG Title cannot be blank.');
            svgTitle.focus();
            fieldError = true;
        }

        // Validate iconLabel fields
        const iconNumber = parseInt(document.getElementById('svgIconNumber').value);
        let iconLabelField = null;
        let labelValue = null;
        if (iconNumber > 0) {
            let iconLabels = [];
            let validationErrors = [];

            for (let i = 1; i <= iconNumber; i++) {
                iconLabelField = document.getElementById('iconLabel' + i);

                if (!iconLabelField) {
                    continue;
                }

                labelValue = iconLabelField.value.trim();

                // Validation 1: No blanks
                if (labelValue === '') {
                    validationErrors.push('Icon ' + i + ' label cannot be blank.');
                    continue;
                }

                // Validation 2: No spaces
                if (/\s/.test(labelValue)) {
                    validationErrors.push('Icon ' + i + ' label cannot contain spaces.');
                }

                // Validation 3: No special characters except dashes and underscores
                if (!/^[a-zA-Z0-9_-]+$/.test(labelValue)) {
                    validationErrors.push('Icon ' + i + ' label can only contain letters, numbers, dashes, and underscores.');
                }

                // Collect for duplicate checking
                iconLabels.push({
                    index: i,
                    value: labelValue
                });
            }

            // Validation 4: No duplicates
            let labelValues = iconLabels.map(function(item) { return item.value; });
            let uniqueLabels = new Set(labelValues);

            if (uniqueLabels.size !== labelValues.length) {
                // Find duplicates
                let duplicates = labelValues.filter(function(value, index, array) {
                    return array.indexOf(value) !== index;
                });
                let uniqueDuplicates = Array.from(new Set(duplicates));

                validationErrors.push('Duplicate icon labels found: ' + uniqueDuplicates.join(', '));
            }

            // If there are validation errors, show them and stop
            if (validationErrors.length > 0) {
                showError(validationErrors.join('<br>'));
                fieldError = true;
            }
        }
        return fieldError;
    }
 
    document.getElementById('generateSVG').addEventListener('click', function() {

        const fieldError = validateForm();
        if (fieldError == true){
            return;
        }

        // Fetch the SVG template
        fetch(ajaxurl.replace('admin-ajax.php', '') + '../wp-content/plugins/graphic_data_plugin/admin/images/create_svg_template_illustrator.svg')
            .then(response => response.text())
            .then(templateContent => {
                // Parse the SVG template as DOM
                let parser = new DOMParser();
                let svgDoc = parser.parseFromString(templateContent, 'image/svg+xml');

                // Get the title group and update its text content
                let titleGroup = svgDoc.getElementById('title');
                if (titleGroup) {
                    var textElement = titleGroup.querySelector('#title-text');
                    var rectElement = titleGroup.querySelector('#title-text-background');

                    if (textElement) {
                        // Get the SVG title from the input field
                        var titleText = document.getElementById('svgTitle').value;
                        // Replace the text content while preserving tspan structure if needed
                        textElement.textContent = titleText;

                        // Calculate text width (approximate)
                        // Using rough estimate: each character is about 14.5px at font-size 24.48px
                        var fontSize = 24.48;
                        var charWidth = fontSize * 0.6; // Approximate character width for bold Arial
                        var textWidth = titleText.length * charWidth;

                        // Add padding on both sides
                        var padding = 40;
                        var newRectWidth = textWidth + (padding * 2);

                        // Update rect width if the new width is larger than current width
                        var currentWidth = parseFloat(rectElement.getAttribute('width'));
                        if (newRectWidth > currentWidth) {
                            rectElement.setAttribute('width', newRectWidth);
                        }
                    }
                }

                // Check if svgText checkbox is unchecked, and if so, delete the text group
                const svgTextCheckbox = document.getElementById('svgText');
                if (svgTextCheckbox && !svgTextCheckbox.checked) {
                    const textGroup = svgDoc.getElementById('text');
                    textGroup.parentNode.removeChild(textGroup);
                }

                // Get the svgIconNumber value and remove icons (regular and mobile) that exceed this number
                const svgIconNumber = parseInt(document.getElementById('svgIconNumber').value);

                let targetID = "";
                let targetElement = null;
                for (let q = 12; q > svgIconNumber; q--) {
                    for (let k = 0; k < 2; k++) {
                        targetID = "icon" + q;
                        if (k == 1) {
                            targetID = targetID + "-mobile";
                        }
                        targetElement = svgDoc.getElementById(targetID);
                        targetElement.parentNode.removeChild(targetElement);
                    }
                }

                // Remove any additional mobile icons, based on user selection, that are not needed
                for (let q = 1; q <= svgIconNumber; q++) {
                    let includeIconMobile = document.getElementById('iconMobile' + q).checked;
                    if (includeIconMobile == false) {
                        targetID = "icon" + q + "-mobile";
                        targetElement = svgDoc.getElementById(targetID);
                        targetElement.parentNode.removeChild(targetElement);
                    }
                }

                // Update labels and IDs for icons in both regular and mobile layers
                let tspanElements = null;
                let targetElementLabel = null;
                let newLabelValue = null;
                for (let q = 1; q <= svgIconNumber; q++) {
                    for (let k = 0; k < 2; k++) {
                        targetID = "icon" + q;
                        if (k == 1) {
                            targetID = targetID + "-mobile";
                        }
                        iconLabelField = document.getElementById('iconLabel' + q);
                        labelValue = iconLabelField.value.trim();
                        targetElement = svgDoc.getElementById(targetID);

                        // we need this if statement as some mobile icons may have been removed already
                        if (targetElement) {
                            targetElement.setAttribute('id', labelValue);

                            targetID = "icon" + q + "-text";
                            if (k == 1) {
                                targetID = "icon" + q + "-mobile-text";
                            }
                            targetElementLabel = svgDoc.getElementById(targetID);
                            newLabelValue = labelValue + "-text";
                            if (k==1) {
                                newLabelValue = labelValue + "-mobile-text";
                            }
                            targetElementLabel.setAttribute('id', newLabelValue);
                            tspanElements = targetElementLabel.getElementsByTagName('tspan');
                            Array.from(tspanElements).forEach(function(tspanElement) {
                                tspanElement.textContent = labelValue;
                            });
                        }
                    }
                }

                // Prompt user for filename with timestamp as default
                const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, -5);
                const defaultFilename = 'location-' + timestamp;
                let filename = prompt('Enter filename for SVG (without extension):', defaultFilename);

                // If user cancels, exit
                if (filename === null || filename.trim() === '') {
                    return;
                }

                // Clean filename (remove invalid characters)
                filename = filename.trim().replace(/[^a-z0-9_-]/gi, '_');

                // Serialize the modified SVG back to string
                let serializer = new XMLSerializer();
                const svgContent = serializer.serializeToString(svgDoc);

                // Create a Blob from the SVG content
                let blob = new Blob([svgContent], { type: 'image/svg+xml' });

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
            })
            .catch(error => {
                console.error('Error loading SVG template:', error);
                alert('Error loading SVG template. Please check the console for details.');
            });

    });

    document.getElementById('previewSVG').addEventListener('click', function() {
        
        const previewElement = document.getElementById('preview');
        previewElement.innerHTML = ''; // Clear previous preview
        
        const fieldError = validateForm();
        if (fieldError == true){
            return;
        }

        // Fetch the SVG template
        fetch(ajaxurl.replace('admin-ajax.php', '') + '../wp-content/plugins/graphic_data_plugin/admin/images/create_svg_template_illustrator.svg')
            .then(response => response.text())
            .then(templateContent => {
                // Parse the SVG template as DOM
                let parser = new DOMParser();
                let svgDoc = parser.parseFromString(templateContent, 'image/svg+xml');

                // Get the title group and update its text content
                let titleGroup = svgDoc.getElementById('title');
                if (titleGroup) {
                    var textElement = titleGroup.querySelector('#title-text');
                    var rectElement = titleGroup.querySelector('#title-text-background');

                    if (textElement) {
                        // Get the SVG title from the input field
                        var titleText = document.getElementById('svgTitle').value;
                        // Replace the text content while preserving tspan structure if needed
                        textElement.textContent = titleText;

                        // Calculate text width (approximate)
                        // Using rough estimate: each character is about 14.5px at font-size 24.48px
                        var fontSize = 24.48;
                        var charWidth = fontSize * 0.6; // Approximate character width for bold Arial
                        var textWidth = titleText.length * charWidth;

                        // Add padding on both sides
                        var padding = 40;
                        var newRectWidth = textWidth + (padding * 2);

                        // Update rect width if the new width is larger than current width
                        var currentWidth = parseFloat(rectElement.getAttribute('width'));
                        if (newRectWidth > currentWidth) {
                            rectElement.setAttribute('width', newRectWidth);
                        }
                    }
                }

                // Check if svgText checkbox is unchecked, and if so, delete the text group
                const svgTextCheckbox = document.getElementById('svgText');
                if (svgTextCheckbox && !svgTextCheckbox.checked) {
                    const textGroup = svgDoc.getElementById('text');
                    textGroup.parentNode.removeChild(textGroup);
                }

                // Get the svgIconNumber value and remove icons (regular and mobile) that exceed this number
                const svgIconNumber = parseInt(document.getElementById('svgIconNumber').value);

                let targetID = "";
                let targetElement = null;
                for (let q = 12; q > svgIconNumber; q--) {
                    for (let k = 0; k < 2; k++) {
                        targetID = "icon" + q;
                        if (k == 1) {
                            targetID = targetID + "-mobile";
                        }
                        targetElement = svgDoc.getElementById(targetID);
                        targetElement.parentNode.removeChild(targetElement);
                    }
                }

                // Remove any additional mobile icons, based on user selection, that are not needed
                for (let q = 1; q <= svgIconNumber; q++) {
                    let includeIconMobile = document.getElementById('iconMobile' + q).checked;
                    if (includeIconMobile == false) {
                        targetID = "icon" + q + "-mobile";
                        targetElement = svgDoc.getElementById(targetID);
                        targetElement.parentNode.removeChild(targetElement);
                    }
                }

                // Update labels and IDs for icons in both regular and mobile layers
                let tspanElements = null;
                let targetElementLabel = null;
                let newLabelValue = null;
                for (let q = 1; q <= svgIconNumber; q++) {
                    for (let k = 0; k < 2; k++) {
                        targetID = "icon" + q;
                        if (k == 1) {
                            targetID = targetID + "-mobile";
                        }
                        iconLabelField = document.getElementById('iconLabel' + q);
                        labelValue = iconLabelField.value.trim();
                        targetElement = svgDoc.getElementById(targetID);

                        // we need this if statement as some mobile icons may have been removed already
                        if (targetElement) {
                            targetElement.setAttribute('id', labelValue);

                            targetID = "icon" + q + "-text";
                            if (k == 1) {
                                targetID = "icon" + q + "-mobile-text";
                            }
                            targetElementLabel = svgDoc.getElementById(targetID);
                            newLabelValue = labelValue + "-text";
                            if (k==1) {
                                newLabelValue = labelValue + "-mobile-text";
                            }
                            targetElementLabel.setAttribute('id', newLabelValue);
                            tspanElements = targetElementLabel.getElementsByTagName('tspan');
                            Array.from(tspanElements).forEach(function(tspanElement) {
                                tspanElement.textContent = labelValue;
                            });
                        }
                    }
                }


                previewElement.appendChild(svgDoc.documentElement);
            
            })
            .catch(error => {
                console.error('Error loading SVG template:', error);
                alert('Error loading SVG template. Please check the console for details.');
            });

    });

});
