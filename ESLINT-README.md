# ESLint Configuration for WordPress

This repository includes ESLint configuration to maintain JavaScript code quality across WordPress plugins and themes.

## Overview

The ESLint setup includes:
- **WordPress coding standards** via `@wordpress/eslint-plugin`
- **JavaScript file linting** (`.js` files)
- **PHP embedded JavaScript linting** (JavaScript within `.php` files)
- **Automatic exclusion** of `plugins/graphic_data_plugin/admin/exopite-simple-options/`

## Local Usage

### Prerequisites
```bash
npm install
```

### Running ESLint

**Lint JavaScript files only:**
```bash
npm run lint:js
```

**Lint JavaScript embedded in PHP files:**
```bash
npm run lint:php-js
```

**Lint everything (both .js and .php files):**
```bash
npm run lint:all
```

**Generate JSON report:**
```bash
npm run lint:js:report
```

## GitHub Actions

The workflow automatically runs on every push to the `main` branch and:

1. Lints all `.js` files in `plugins/` and `themes/`
2. Extracts and lints JavaScript embedded in `.php` files
3. Generates comprehensive reports in both JSON and text formats
4. Uploads reports as artifacts (retained for 30 days)

### Viewing Reports

After a workflow run:
1. Go to the Actions tab in GitHub
2. Click on the workflow run
3. Scroll to "Artifacts" section
4. Download `eslint-json-report` or `eslint-text-report`

## How PHP Linting Works

The custom script `lint-php-js.js` extracts JavaScript from PHP files by:
- Finding `<script>` tags and their contents
- Extracting inline event handlers (`onclick`, `onload`, etc.)
- Creating temporary `.js` files for analysis
- Running ESLint on extracted code
- Mapping results back to original PHP file locations
- Cleaning up temporary files

## Configuration Files

- **[package.json](package.json)** - Dependencies and scripts
- **[.eslintrc.json](.eslintrc.json)** - ESLint rules and configuration
- **[lint-php-js.js](lint-php-js.js)** - Custom PHP JavaScript extractor
- **[.github/workflows/eslint.yml](.github/workflows/eslint.yml)** - GitHub Actions workflow

## Excluded Paths

The following are automatically excluded from linting:
- `node_modules/`
- `vendor/`
- `plugins/graphic_data_plugin/admin/exopite-simple-options/**`
- `*.min.js`
- `build/`
- `dist/`

## Customization

### Adding New Rules

Edit [.eslintrc.json](.eslintrc.json) and add rules under the `rules` section:

```json
{
  "rules": {
    "no-console": "off",
    "semi": ["error", "always"]
  }
}
```

### Excluding Additional Paths

Add patterns to the `ignorePatterns` array in [.eslintrc.json](.eslintrc.json):

```json
{
  "ignorePatterns": [
    "node_modules/",
    "your-custom-path/**"
  ]
}
```

## Troubleshooting

**ESLint not finding files:**
- Ensure you're running from the `wp-content` directory
- Check that the paths exist in `plugins/` or `themes/`

**PHP JavaScript extraction not working:**
- The script looks for `<script>` tags in PHP files
- Ensure JavaScript is within proper `<script>` tags
- Inline event handlers must use double or single quotes

**Workflow failing:**
- Check the Actions tab for detailed error messages
- Review uploaded artifact reports for specific issues
- Ensure all dependencies are properly listed in package.json
