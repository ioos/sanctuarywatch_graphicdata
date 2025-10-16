<?php if ( ! defined( 'ABSPATH' ) ) {
	die;
} // Cannot access pages directly.
/**
 *
 * Field: Upload
 *
 */
/**
 * Info about JavaScript uploaders
 *
 */
if ( ! class_exists( 'Exopite_Simple_Options_Framework_Field_upload' ) ) {

	class Exopite_Simple_Options_Framework_Field_upload extends Exopite_Simple_Options_Framework_Fields {

		public function __construct( $field, $value = '', $unique = '', $config = array() ) {

			parent::__construct( $field, $value, $unique, $config );

			$defaults = array(
				'attach'                   => false,
				'filecount'                => 1,
				'delete-enabled'           => true,
				'delete-force-confirm'     => true,
				'retry-enable-auto'        => true,
				'retry-max-auto-attempts'  => 1,
				'retry-auto-attempt-delay' => 2,
				'auto-upload'              => false,
			);

			$options = ( ! empty( $this->field['options'] ) ) ? $this->field['options'] : array();

			$this->field['options'] = wp_parse_args( $options, $defaults );

		}

		public function output() {
			echo $this->element_before();
			?>

			<?php		
			// Expoite array variables from the FILE UPLOAD ARRAY BOX field in admin-figure.php
			//$maxsize = $this->field['options']['maxsize']; //not used

			// WP variables for post values in database
			$post_id = get_the_ID();
			$instance_id = get_post_meta( $post_id, 'location', true );
			$uploaded_path_csv = get_post_meta( $post_id, 'uploaded_path_csv', true );
			$uploaded_path_json = get_post_meta( $post_id, 'uploaded_path_json', true );
			$uploaded_path_geojson = get_post_meta( $post_id, 'uploaded_path_geojson', true );

			// Check if a file exists in postmeta before rendering the file input button
			$existing_file = get_post_meta($post_id, 'uploaded_file', true);
			$file_label = $existing_file ? 'Current File: ' . basename($existing_file) : '';


			// Style for the .custom-div where the light grey text is located. 
			echo '<style>
			.custom-div {
				color: #aaa; /* Light grey text */
				font-size: 13px; /* Text size */
				text-align: left; /* Left justified */
			}
			</style>';

			?>
			<!-- Custom form elements for the file select, upload, and -->
			<form id="custom-file-upload" enctype="multipart/form-data">
				<input type="hidden" id="existing-file-name" value="<?php echo esc_attr(basename($existing_file)); ?>">
				<input type="hidden" name="post_id" value="<?php echo get_the_ID(); ?>">

				<?php // Conditionally add the 'for' attribute ?>
				<label <?php echo (!$existing_file) ? 'for="uploaded-file"' : ''; ?> id="file-label">
					<?php echo esc_html($file_label); ?>
				</label>

				<?php if (!$existing_file): ?>
					<input type="file" name="uploaded_file" id="uploaded-file" accept=".json, .csv, .geojson" <?php echo ( $this->field['options']['attach'] ) ? 'multiple' : ''; ?> />
					<button type="button" id="upload-btn">Upload</button>
				<?php endif; ?>
				<?php if ($existing_file): ?>
					<button type="button" id="delete-btn">Delete File</button>
				<?php endif; ?>
			</form>

			<div class="custom-div">
				<?php
				// Output the existing file information if it exists
				if ( $existing_file ) {
					$existing_file_folder = get_site_url() . '/wp-content/data/figure_' . $post_id . '/';
					echo '<a href="' . esc_url($existing_file_folder . $existing_file) . '" target="_blank">Download Your File</a><br>';
				}
				if ( !$existing_file ) {
					echo 'Click "Browse" to select a file, Then click "Upload" to upload the file.<br>';
				}
				echo '<br>';
				echo '<strong>Upload Information:</strong><br>';
				echo esc_attr__( 'Max amount of files: ', 'exopite-sof' ) . $this->field['options']['filecount'] . '<br>';
				//echo esc_attr__( 'Allowed file types: ', 'exopite-sof' ) . '.csv, .json, .geojson'  . '<br>';
				echo esc_attr__( 'Allowed file types: ', 'exopite-sof' ) . '.csv, .json'  . '<br>';
				echo esc_attr__( 'Maximum Allowed File Size: ', 'exopite-sof' ) . '300MB'  . '<br>';
				echo esc_attr__( 'Recommended File Size: ', 'exopite-sof' ) . '<= 5MB'  . '<br><br>';

				// Output links to example files
				// Define the folder path inside wp-content
				$example_folder = get_site_url() . '/wp-content/plugins/graphic_data_plugin/example_files/';

				// Example file names
				$example_csv = 'example.csv';
				$example_json = 'example.json';
				$example_geojson = 'example.geojson';

				echo '<strong>Correct Formatting for .csv Files:</strong>';
				echo '<br>';
				echo ' - Be sure that every column header has a name and that none of your column header names, row data values, or metadata contain commas.<br>';
				echo ' - No values should be contained in quotes or double quote. (Examples - Correct: value, Incorrect: "value") .<br>';
				echo ' - Please see the date examples in the example files for accepted date formats and no data handling. <br>';
				echo ' - The date formats are best viewed in Notepad or a similar text editor, MS Excel may automatically change date formats. <br>';
				echo '<br>';
				echo '<strong>Correctly Formatted Example Files:</strong><br>';
				echo 'Please format your .csv or .json file as shown in the examples below. If they are not formatted properly, your file will be rejected.<br>';
				echo '<a href="' . esc_url($example_folder . $example_csv) . '" target="_blank">Download example.csv</a><br>';
				echo '<a href="' . esc_url($example_folder . $example_json) . '" target="_blank">Download example.json</a><br>';
				//echo '<a href="' . esc_url($example_folder . $example_geojson) . '" target="_blank">Download example.geojson</a><br>';
				echo '<br>';
				echo '<br>';
				?>
			</div>


			<script>
			/**
			 * CSVTOJSON CONVERTER - Converts a CSV string into a structured JSON object.
			 * 
			 * @param {string} csvString - The CSV input as a string.
			 * @returns {Object} - The converted JSON object with metadata and data.
			 */
			function csvToJson(csvString) {
				// Split the CSV string into an array of lines, trim whitespace, and remove empty lines
				const lines = csvString.split('\n').map(line => line.trim()).filter(line => line.length > 0);
				
				// Initialize an empty metadata object
				const metadata_result = {};

				// Determine the starting index of the header (first line with the same number of columns as the data rows)
				let headerIndex = lines.findIndex((line, idx) => {
					const values = line.split(',').map(value => value.trim());
					return values.length > 1 && values.every(value => value !== ""); // Ensure all columns are filled and more than one column exists
				});

				if (headerIndex === -1) headerIndex = 0; // Default to 0 if no valid header is found

				// Extract metadata lines before the header row, assigning each to a unique key
				lines.slice(0, headerIndex).forEach((line, index) => {
					if (line.includes(':')) {
						const [key, value] = line.split(':').map(part => part.trim());
						metadata_result[key] = value;
					} else {
						metadata_result[`meta${index + 1}`] = line;
					}
				});
				// Extract headers from the determined starting index
				const headers = lines[headerIndex].split(',').map(header => header.trim());

				// Initialize an empty object to store the result
				const result = {};

				// Create an array for each header key in the result object
				headers.forEach(header => {
					result[header] = [];
				});

				// Iterate through the remaining lines (data rows)
				for (let i = headerIndex + 1; i < lines.length; i++) {
					// Split each line by commas and trim whitespace
					const values = lines[i].split(',').map(value => value.trim());

					// Assign values to corresponding headers
					headers.forEach((header, index) => {
						let parsedValue = values[index] !== undefined ? values[index] : "";

						// Remove stray quotes
						// if (parsedValue.includes('"')) parsedValue = parsedValue.replace(/"/g, '');

						// Normalize missing / invalid values
						if (
							parsedValue === "" ||           // blank cell
							parsedValue === null ||         // null
							parsedValue.toUpperCase?.() === "NA" || // string "NA"
							parsedValue.toUpperCase?.() === "NAN" || // string "NaN"
							parsedValue === undefined ||
							parsedValue === "null"
						) {
							parsedValue = "NA";
						} else if (!isNaN(parsedValue)) {
							// Convert numeric strings to numbers (keep others as-is)
							parsedValue = parsedValue.includes(".")
								? parseFloat(parsedValue)
								: parseInt(parsedValue, 10);
						}

						// Push the parsed value into the respective header array
						result[header].push(parsedValue);
					});
				}
				// Wrap the result object inside a "data" key and return it along with metadata
				return { metadata: metadata_result, data: result };
			}



			</script>

			
			<script>
			/**
			 * JSON formatter - Formats the output json from csvToJson into a specific format.
			 * 
			 * @param {obj} obj - The json returned from csvToJson.
			 * @returns {Object} - The converted JSON object with metadata and data.
			 */
			function formatJsonCompact(obj) {
				// Initialize the JSON string with the opening bracket and metadata
				// Initialize the JSON string with the opening bracket and metadata
				let jsonStr = '{\n    "metadata": {\n';

				// Append metadata dynamically
				const metaKeys = Object.keys(obj.metadata);
				metaKeys.forEach((key, index) => {
					jsonStr += `        "${key}": "${obj.metadata[key]}"`;
					if (index < metaKeys.length - 1) {
						jsonStr += ',\n';
					}
				});

				jsonStr += '\n    },\n    "data": {\n';
				
				// Retrieve all keys from the "data" object
				const keys = Object.keys(obj.data);
				
				// Iterate through each key (column name) in the data object
				keys.forEach((key, index) => {
					// Format each value in the array appropriately
					const values = obj.data[key].map(value => 
						value === "null" ? null : (typeof value === "string" ? `"${value}"` : value) // Remove quotes from "null", keep other strings quoted
					);
					
					// Append the formatted key-value pair to the JSON string
					jsonStr += `        "${key}": [${values.join(',')}]`;
					
					// Add a comma after each key-value pair except the last one
					if (index < keys.length - 1) {
						jsonStr += ',\n';
					}
				});
				
				// Close the "data" object and the JSON structure
				jsonStr += '\n    }\n}';
				
				// Return the fully formatted compact JSON string
				//console.log(jsonStr);
				return jsonStr;
			}
			</script>


			<script>
			/**
			 * JSON Validator - When a .json file is uploaded form the admin GUI, this validates that json format to match the json output in the csvToJson.
			 * 
			 * @param {json} obj - The json string from the uploaded json file.
			 * @returns {true} - The script checks to see if the json contains the objects that are needed.
			 */
			function validateJson(json) {
				if (typeof json !== 'object' || json === null) return false;
				if (!json.metadata || typeof json.metadata !== 'object') return false;
				if (!json.data || typeof json.data !== 'object') return false;
				
				const keys = Object.keys(json.data);
				//if (!keys.includes("Year")) return false;
				//if (!Array.isArray(json.data.Year) || json.data.Year.some(y => typeof y !== 'number')) return false;
				
				for (let key of keys) {
					if (!Array.isArray(json.data[key])) return false;
				}
				
				return true;
			}
			</script>

			<script>
			function clickUpdateButton() {
				const updateButton = document.getElementById("publish"); // Find the button by ID
				if (updateButton) {
					updateButton.click(); // Simulate a click event
					//console.log("Update button clicked!");
				} else {
					console.error("Update button not found!");
				}
			}
	
			</script>


			<script>
			/**
			 * Delete Function - After a file has been uploaded this can be triggered to delete an existing file via an Ajax call.
			 * 
			 * @param {} obj - None
			 * @returns {} - Alert a file has been deleted.
			 */
			function deleteUploadedFile() {

				//Select an existing uploaded file, or the file you just attempted to upload that is not formatted correctly for deletion. 
				try {
					var fileNameInput = document.getElementById('existing-file-name');
					if (!fileNameInput || !fileNameInput.value) {
						//alert("Error: No file to delete.");
						console.error("Filename input error:", error);
						return;
					}
					var fileName = fileNameInput.value;
				} catch (error) {
					var fileNameInput = document.getElementById('uploaded-file');
					var file = fileNameInput.files[0];
					var fileName = file.name.toLowerCase();
				}
				
				//Get the post ID
				var postIdInput = document.querySelector('[name="post_id"]');
				if (!postIdInput || !postIdInput.value) {
					alert("Error: Post ID is missing in the form!");
					return;
				}

				var postId = postIdInput.value;
				
				var formData = new FormData();
				formData.append('post_id', postId);
				formData.append('file_name', fileName); // Send only the stored filename
				formData.append('action', 'custom_file_delete'); // Match WordPress AJAX action

				////console.log("Sending post_id:", postId, "file_name:", fileName); // Debugging

				fetch('<?php echo admin_url("admin-ajax.php"); ?>', { // Correct URL
					method: 'POST',
					body: formData,
					credentials: 'same-origin'
				})
				.then(response => response.json())
				.then(data => {
					////console.log("Server response:", data); // Debugging
					if (data.success) {
						alert("Success: " + (data.message || "File deleted successfully."));
						clickUpdateButton(); // Save and reload the page to reflect deletion
					} else {
						alert("Error: " + (data.message || "Delete failed. Please save or refresh the page to resolve this error."));
					}
				})
				.catch(error => {
					console.error("Delete error", error);
					alert("Delete failed. Please save or refresh the page to resolve this error." + error.message);
					clickUpdateButton(); // Save and reload the page to reflect deletion
				});
			}
			</script>

			<script>
			/**
			 * Trigger Delete button when clicked - This makes the call the delete-btn on the page, does not include the Ajax call.
			 * 
			 * @param {} obj - None
			 * @returns {} - Alert a file has been deleted.
			 */
			if (document.getElementById('delete-btn')) {
				document.getElementById('delete-btn').addEventListener('click', deleteUploadedFile);
			}
			</script>

			<script>
			/**
			 * Do not allow access to the delete button if it is a new post because there is no post id to store the data.
			 * 
			 * @param {} obj - None
			 * @returns {} - Prevents access to the browse button to upload a file.
			 */
			var fileInput = document.getElementById('uploaded-file');
			var uploadBtn = document.getElementById('upload-btn');

			// Check if URL contains "post-new.php?post_type=figure"
			if (window.location.href.includes("post-new.php?post_type=figure")) {
				if (uploadBtn) {
					uploadBtn.disabled = true; // Disable the button
					uploadBtn.style.opacity = "0.5"; // Make it look inactive
				}

				if (fileInput) {
					fileInput.disabled = true; // Disable file input as well
				}

				// Show a message above the button
				var message = document.createElement("p");
				message.textContent = "⚠️ You must save this post before uploading a file to create an interactive figure.";
				message.style.color = "red";
				message.style.fontWeight = "bold";
				uploadBtn.parentNode.insertBefore(message, uploadBtn);
			}		
			</script>

			<script>
			/**
			 * Upload button and .csv call to csvtojson converter and .json call to json validator
			 * 
			 * @param {} obj - None
			 * @returns {} - Trigger the file upload and posts the files and the file name and path to the database.
			 */

			if (document.getElementById('upload-btn')) {
				document.getElementById('upload-btn').addEventListener('click', function() {
				
				// Validation of variables form html and php
				var fileInput = document.getElementById('uploaded-file');
				var uploadBtn = document.getElementById('upload-btn');
				var uploadMessage = document.createElement("p");
				var uploadMessage2 = document.createElement("p");

				if (!fileInput.files.length) {
					alert("Please select a file before uploading.");
					return;
				}

				var formData = new FormData();
				var file = fileInput.files[0];
				var fileName = file.name.toLowerCase();

				// Append uploaded_file to form to send to AJAX
				formData.append('uploaded_file', file);

				var postIdInput = document.querySelector('[name="post_id"]');
				if (!postIdInput || !postIdInput.value) {
					alert("Error: Post ID is missing in the form!");
					return;
				}

				var postId = postIdInput.value;
				if (postId == '') {
					alert("Error: Post ID is missing in the form!");
					return;
				}
				
				// Append post_id and the action to trigger custom_file_upload to form to send to AJAX
				formData.append('post_id', postId);
				formData.append('action', 'custom_file_upload'); // Required for WordPress AJAX

				// AJAX processing request
				//console.log("Sending post_id:", postId);
				fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
					method: 'POST',
					body: formData,
					credentials: 'same-origin'
				})
				.then(response => response.json())
				.then(data => {
					//console.log("Server response:", data);
					// If the Ajax Request was successful
					if (data.success) {
						// If the file is a .csv file, trigger CSV-to-JSON conversion
						if (fileName.endsWith(".csv")) {
							var reader = new FileReader();
							reader.onload = function(event) {
								var csvData = event.target.result;
								var jsonData;

								try {
									jsonData = csvToJson(csvData); // Convert CSV to JSON
								} catch (error) {
									deleteUploadedFile();
									alert("CSV Conversion Failed: " + error.message);
									console.error("CSV Conversion Error:", error);
									return; // Stop execution if CSV is invalid
								}

								// Convert JSON object to a Blob
								//var jsonBlob = new Blob([JSON.stringify(jsonData, null, 0)], { type: "application/json" }); //standard JS way of precessing that doesn't give what Jai wants.
								var jsonBlob = new Blob([formatJsonCompact(jsonData)], { type: "application/json" });
								var json_fileName = fileName.replace('.csv', '.json');

								// Convert Blob to a File
								var jsonFile = new File([jsonBlob], json_fileName, { type: "application/json" });
								var jsonFile_metadata = jsonFile.metadata
								//console.log(jsonFile_metadata)

								// Prepare FormData for AJAX request
								var formData_csvtojson = new FormData();
								formData_csvtojson.append('uploaded_file', jsonFile);
								formData_csvtojson.append('post_id', postId);
								formData_csvtojson.append('action', 'custom_file_upload');

								//console.log("Sending JSON file to server:", json_fileName);

								fetch('<?php echo admin_url('admin-ajax.php'); ?>', {
									method: 'POST',
									body: formData_csvtojson,
									credentials: 'same-origin'
								})
								.then(response => response.json())
								.then(data => {
									//console.log("Server response:", data);
									if (data.success) {
										//alert("Success: " + (data.message || "File Upload Successful.") +  "\n" +	"\nClick 'Update' button in the top-right to save your changes, access the delete button, and the Interactive Figure Settings.");
										alert("Success: " + (data.message || "File Upload Successful" + '\n\n' + 'Click "OK" to save your changes.'));
										// Hide the upload button and the file input
										uploadBtn.style.display = "none";
										fileInput.style.display = "none";
										clickUpdateButton();

										// Display message after hiding the buttons
										//uploadMessage.textContent = `Current File: ${fileName}`;
										//uploadMessage2.textContent = 'Click "Update" button in the top-right to save your changes, access the delete button, and the Interactive Figure Settings.'
										//uploadBtn.parentNode.insertBefore(uploadMessage2, uploadBtn.nextSibling);
										//uploadBtn.parentNode.insertBefore(uploadMessage, uploadBtn.nextSibling);
									} else {
										alert("Error: " + (data.message || "Something went wrong."));
									}
								})
								.catch(error => {
									console.error("Upload error:", error);
									alert("Upload failed: " + error.message);
								});
							};
							reader.readAsText(file);


						}
						// If the file is a .json file, trigger json validation script
						if (fileName.endsWith(".json")) {
							var reader = new FileReader();

							reader.onload = function(event) {
								try {
									var jsonData = JSON.parse(event.target.result); // Parse the file content into JSON
									var isValid = validateJson(jsonData); // Validate the JSON

									if (!isValid) {
										throw new Error("JSON validation failed.");
									}

									//alert("Success: " + (data.message || "File Upload Successful.") + "\n\n" + "Click 'Update' button in the top-right to save your changes, access the delete button, and the Interactive Figure Settings.");
									alert("Success: " + (data.message || "File Upload Successful." + '\n\n' + 'Click "OK" to save your changes.'));

									// Hide the upload button and the file input
									uploadBtn.style.display = "none";
									fileInput.style.display = "none";
									clickUpdateButton();

									// Display message after hiding the buttons
									//uploadMessage.textContent = `Current File: ${fileName}`;
									//uploadMessage2.textContent = 'Click "Update" button in the top-right to save your changes, access the delete button, and the Interactive Figure Settings.'
									//uploadBtn.parentNode.insertBefore(uploadMessage2, uploadBtn.nextSibling);
									//uploadBtn.parentNode.insertBefore(uploadMessage, uploadBtn.nextSibling);
								} catch (error) {
									deleteUploadedFile();
									alert("JSON Validation Failed: " + error.message);
									console.error("JSON Validation Error:", error);
								}
							};
							reader.readAsText(file); // Read file content as text
											
						} 
						// If the file is a .json file, trigger json validation script
						if (fileName.endsWith(".geojson")) {
							var reader = new FileReader();
							reader.onload = function(event) {
								try {

									//alert("Success: " + (data.message || "File Upload Successful.") + "\n\n" + "Click 'Update' button in the top-right to save your changes, access the delete button, and the Interactive Figure Settings.");
									alert("Success: " + (data.message || "File Upload Successful." + '\n\n' + 'Click "OK" to save your changes.'));

									// Hide the upload button and the file input
									uploadBtn.style.display = "none";
									fileInput.style.display = "none";
									clickUpdateButton();

								} catch (error) {
									deleteUploadedFile();
									alert("GEOJSON Upload Failed: " + error.message);
									console.error("GEOJSONJSON Upload Error:", error);
								}
							};
							reader.readAsText(file); // Read file content as text
											
						} 
						else {
							// If the file is NOT a CSV or a Json....
						} 
					}
					// If the Ajax Request was not successful			
					if (!data.success) {
						console.error("Upload error:", error);
						alert("Upload failed: Data was not successfully Sent: " + error.message)
					}
				})
				.catch(error => {
					console.error("Upload error:", error);
					alert("Upload failed: " + error.message);
				});
			});
			} 

			</script>

			<?php

		}
	}
}

