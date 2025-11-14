<?php
/**
 * Register class that defines Create SVG functions 
 * 
 */
include_once plugin_dir_path( dirname( __FILE__ ) ) . 'admin/class-utility.php';
class Create_SVG {

    /**
	 * Function to add the "Create SVG" submenu under Tools
	 *
	 * @since    1.0.0
	 */
    public function add_create_svg_menu() {
            add_submenu_page(
                'tools.php',              // Parent slug - adding it under 'Tools'
                'Create SVG',         // Page title
                'Create SVG',         // Menu title
                'edit_posts',         // Capability required to see the option
                'create-svg',         // Slug (used in the URL)
                [$this, 'create_svg_page']     // Callback function to output the page content
            );
    }

    // Callback function to display the content of the "Create SVG" page
    public function create_svg_page() {
        ?>
        <div class="wrap">
            <h1>Create SVG</h1>

            <p>
                <label for="location">Location ID:</label>
                <input type="text" id="location" name="location" value="" placeholder="Enter location ID" />
            </p>
            <p><button class="button button-primary" id="generateSVG">Generate and Download SVG</button></p>

            <div id="svgPreview" style="margin-top: 20px; border: 1px solid #ccc; padding: 10px; display: none;">
                <h3>Preview:</h3>
                <div id="svgContainer"></div>
            </div>
        </div>

        <script>
        document.addEventListener('DOMContentLoaded', function() {
            document.getElementById('generateSVG').addEventListener('click', function() {
                var locationId = document.getElementById('location').value;

                // Example SVG content - replace this with your actual SVG generation logic
                var svgContent = '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200">' +
                    '<circle cx="100" cy="100" r="80" fill="#4CAF50" />' +
                    '<text x="100" y="110" text-anchor="middle" fill="white" font-size="20">Location: ' + locationId + '</text>' +
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
                downloadLink.download = 'location-' + locationId + '.svg';

                // Trigger download
                document.body.appendChild(downloadLink);
                downloadLink.click();
                document.body.removeChild(downloadLink);

                // Clean up the URL object
                URL.revokeObjectURL(url);

                alert('SVG file download started!');
            });
        });
        </script>
        <?php
    }

}