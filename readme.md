# Graphic Data <img align="right" width="150" alt="Graphic Data logo" height="150" src="https://github.com/user-attachments/assets/c999e108-7d2c-40f8-90a5-574c0e1446cc">
In this repository, you'll find the Wordpress plugin and theme that create the customized Graphic Data experience within a Wordpress environment. 

## What is Graphic Data?
Graphic Data is an open-source framework for combining artwork with data in a way that is: 1) easy (and attractive!) to use by web users and 2) easy to use by those tasked with entering content. This framework is intended for the small-yet-mighty organizations and people who have big website ambitions, but don't necessarily have big website capacity.

## Is Graphic Data being used anywhere?
Yes! Check out [Sanctuary Watch](https://sanctuarywatch.ioos.us/american-samoa/overview/), a website that shows the information used in the management of sanctuaries within the [National Marine Sanctuary System](https://sanctuaries.noaa.gov/).

## How do I learn more about using Sanctuary Watch?
Check out our [guide](https://ioos.github.io/sanctuarywatch_graphicdata/)!

## Earlier Work
The general approach taken by Graphic Data is based upon [Infographiq](https://github.com/marinebon/infographiq), created by [Ben Best](https://ecoquants.com/).
The plugin is based upon the structure provided by Joe Sz's [Wordpress Plugin Boilerplate Tutorial](https://github.com/JoeSz/WordPress-Plugin-Boilerplate-Tutorial) - which is itself based upon the structure provided by Devin Vinson's [Wordpress Plugin Boilerplate](https://github.com/DevinVinson/WordPress-Plugin-Boilerplate). 

## Development Setup

### PHP Code Quality Tools

This repository uses PHP_CodeSniffer with WordPress Coding Standards to maintain code quality.

#### Setup Instructions:

1. **Install dependencies:**
   ```bash
   composer install
   ```

2. **VS Code Setup:**
   - Install the [PHP_CodeSniffer extension](https://marketplace.visualstudio.com/items?itemName=obliviousharmony.vscode-php-codesniffer)
   - Open the **wp-content** folder as your workspace root in VS Code (not a subfolder)
   - The extension will automatically use the configuration in `.vscode/settings.json`

3. **Verify it's working:**
   - Open any PHP file in the `plugins/` or `themes/` directories
   - You should see linting errors/warnings highlighted in the editor

#### Manual Code Checking:

You can also run phpcs manually from the command line:

```bash
# Check all files
vendor/bin/phpcs

# Check a specific file
vendor/bin/phpcs plugins/graphic_data_plugin/graphic_data_plugin.php

# Auto-fix some issues
vendor/bin/phpcbf plugins/graphic_data_plugin/graphic_data_plugin.php
```

The coding standards configuration is in `phpcs.xml.dist`.

## Questions?
Please contact Jai Ranganathan at jai.ranganathan@noaa.gov with any questions you may have.

## License
We use the [MIT license](LICENSE.md).
