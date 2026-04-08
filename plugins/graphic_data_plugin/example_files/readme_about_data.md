# About the Data Folder
The file you are currently reading was copied from wp-content/plugins/graphic_data_plugin/example_files to wp-content/data when the plugin was created or updated. 

## Basic Overview
The wp-content/data directory is used to store uploaded data files for interactive figures outside of the standard WordPress Media Library. This is intentional because the developers of Graphic Data do not want you to loose your data if you uninstall the Graphic Data plugin. Each figure gets its own subfolder, typically named figure_<post_id>, so uploaded CSV, JSON, and GEOJSON files stay grouped with the Figure post they belong to. This folder structure supports the plugin’s upload, delete, and conversion workflows, including cases where a CSV upload also generates a companion JSON file. Filenames are preserved as closely as possible to the uploaded source, with companion JSON files commonly generated from the CSV name using the same base filename and a .json extension but in lowercase. 

## Ownership Considerations 
Because these files are written and deleted directly by PHP during AJAX requests, the data directory and its subfolders must be writable by the web server user. On Bitnami-based environments, this is often the daemon user. Ownership and permissions should be configured so that newly created figure_<post_id> directories can be read, written, and cleaned up reliably by the application. A typical setup is directory permissions of 775, file permissions of 664, and ownership assigned to the web server user and group. This is done in the graphic_data_ensure_public_data_dir() in graphic_data_plugin.php when this folder is created

## Admin Options
If you would like to delete all of your files and data from this folder, you can do so via terminal or you can check the box to delete your files when you uninstall the Graphic Data plugin. This option is located in the Graphic Data Settings panel.




