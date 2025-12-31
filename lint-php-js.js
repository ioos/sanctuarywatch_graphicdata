#!/usr/bin/env node

/**
 * Script to extract and lint JavaScript code embedded in PHP files
 */

const fs = require('fs');
const path = require('path');
const { ESLint } = require('eslint');
const { glob } = require('glob');

// Configuration
const TEMP_DIR = path.join(__dirname, '.eslint-temp');
const EXCLUDE_PATTERN = 'plugins/graphic_data_plugin/admin/exopite-simple-options/**';

/**
 * Extract JavaScript from PHP files
 * Looks for:
 * 1. <script> tags
 * 2. Inline event handlers (onclick, onload, etc.)
 * 3. wp_enqueue_script inline scripts
 */
function extractJavaScriptFromPHP(phpContent, filePath) {
  const jsBlocks = [];
  let lineOffset = 0;

  // Extract from <script> tags
  const scriptRegex = /<script[^>]*>([\s\S]*?)<\/script>/gi;
  let match;

  while ((match = scriptRegex.exec(phpContent)) !== null) {
    const jsCode = match[1];
    if (jsCode.trim()) {
      // Calculate line number where this script starts
      const beforeScript = phpContent.substring(0, match.index);
      const lineNumber = (beforeScript.match(/\n/g) || []).length + 1;

      jsBlocks.push({
        code: jsCode,
        line: lineNumber,
        type: 'script-tag'
      });
    }
  }

  // Extract from inline event handlers
  const inlineEventRegex = /\s(on\w+)=["']([^"']+)["']/gi;
  while ((match = inlineEventRegex.exec(phpContent)) !== null) {
    const jsCode = match[2];
    if (jsCode.trim()) {
      const beforeScript = phpContent.substring(0, match.index);
      const lineNumber = (beforeScript.match(/\n/g) || []).length + 1;

      jsBlocks.push({
        code: jsCode,
        line: lineNumber,
        type: 'inline-handler'
      });
    }
  }

  return jsBlocks;
}

/**
 * Create temporary JS files from extracted code
 */
async function createTempFiles(phpFiles) {
  // Create temp directory if it doesn't exist
  if (!fs.existsSync(TEMP_DIR)) {
    fs.mkdirSync(TEMP_DIR, { recursive: true });
  }

  const tempFiles = [];

  for (const phpFile of phpFiles) {
    const content = fs.readFileSync(phpFile, 'utf8');
    const jsBlocks = extractJavaScriptFromPHP(content, phpFile);

    if (jsBlocks.length > 0) {
      // Create a temp file for this PHP file
      const relativePath = path.relative(__dirname, phpFile);
      const tempFileName = relativePath.replace(/[\/\\]/g, '_').replace('.php', '.js');
      const tempFilePath = path.join(TEMP_DIR, tempFileName);

      // Combine all JS blocks with source mapping comments
      let combinedJs = `/* Extracted from: ${phpFile} */\n\n`;
      jsBlocks.forEach((block, index) => {
        combinedJs += `/* Line ${block.line} - ${block.type} */\n`;
        combinedJs += block.code + '\n\n';
      });

      fs.writeFileSync(tempFilePath, combinedJs);
      tempFiles.push({
        tempPath: tempFilePath,
        originalPath: phpFile
      });
    }
  }

  return tempFiles;
}

/**
 * Clean up temporary files
 */
function cleanup() {
  if (fs.existsSync(TEMP_DIR)) {
    fs.rmSync(TEMP_DIR, { recursive: true, force: true });
  }
}

/**
 * Main function
 */
async function main() {
  try {
    console.log('Scanning for PHP files with embedded JavaScript...\n');

    // Find all PHP files
    const phpFiles = await glob('**/*.php', {
      cwd: __dirname,
      ignore: [
        'node_modules/**',
        'vendor/**',
        EXCLUDE_PATTERN,
        '.eslint-temp/**'
      ],
      absolute: true
    });

    console.log(`Found ${phpFiles.length} PHP files to scan\n`);

    // Extract JS and create temp files
    const tempFiles = await createTempFiles(phpFiles);

    if (tempFiles.length === 0) {
      console.log('No embedded JavaScript found in PHP files.');
      cleanup();
      return;
    }

    console.log(`Extracted JavaScript from ${tempFiles.length} PHP files\n`);
    console.log('Running ESLint on extracted JavaScript...\n');

    // Run ESLint on temp files
    const eslint = new ESLint();
    const results = await eslint.lintFiles([TEMP_DIR + '/**/*.js']);

    // Format results to show original PHP file names
    const formattedResults = results.map(result => {
      const tempFile = tempFiles.find(tf => tf.tempPath === result.filePath);
      if (tempFile) {
        return {
          ...result,
          filePath: tempFile.originalPath + ' (embedded JS)'
        };
      }
      return result;
    });

    // Output results
    const formatter = await eslint.loadFormatter('stylish');
    const resultText = formatter.format(formattedResults);
    console.log(resultText);

    // Calculate totals
    const totalErrors = results.reduce((sum, result) => sum + result.errorCount, 0);
    const totalWarnings = results.reduce((sum, result) => sum + result.warningCount, 0);

    console.log(`\nTotal: ${totalErrors} errors, ${totalWarnings} warnings in PHP files`);

    // Cleanup
    cleanup();

    // Exit with error code if there are errors
    if (totalErrors > 0) {
      process.exit(1);
    }

  } catch (error) {
    console.error('Error:', error);
    cleanup();
    process.exit(1);
  }
}

// Run if called directly
if (require.main === module) {
  main();
}

module.exports = { extractJavaScriptFromPHP, createTempFiles, cleanup };
