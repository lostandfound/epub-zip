'use strict';

import fs from 'fs/promises'; // Use promises for async operations
import path from 'path';
import _ from 'lodash';
import JSZip from 'jszip';

const PLUGIN_NAME = "epub-zip";
const ignoreFiles = /^(\.DS_Store|Thumbs\.db|desktop\.ini|_MACOSX)$/; // Regex to ignore system files

/**
 * Recursively reads a directory and collects file paths.
 * @param {string} root - The root directory to start reading from.
 * @param {string[]} [files=[]] - The array to collect file paths.
 * @param {string} [base=''] - The base path for recursion.
 * @returns {Promise<string[]>} - A promise that resolves to an array of file paths.
 */
async function readDirRecursive(root, files = [], base = '') {
  const dir = path.join(root, base);

  const stats = await fs.lstat(dir);
  if (stats.isDirectory()) {
    const dirFiles = await fs.readdir(dir);
    for (const file of dirFiles) {
      if (!file.match(ignoreFiles)) {
        // Recursively read subdirectories
        await readDirRecursive(root, files, path.join(base, file));
      }
    }
  } else {
    // Add file to list if it's not a directory
    files.push(base);
  }

  return files;
}

/**
 * Validates that necessary EPUB files are present.
 * @param {string[]} files - The list of file paths.
 * @throws Will throw an error if 'META-INF/container.xml' is missing.
 * @returns {string[]} - The validated list of file paths.
 */
function validateContainer(files) {
  if (!_.includes(files, "mimetype")) {
    console.warn(`${PLUGIN_NAME}: 'mimetype' file is missing in the root directory`);
  } else {
    // Remove 'mimetype' from the list to ensure it's added first to the zip
    files = _.without(files, "mimetype");
  }

  if (!_.includes(files, "META-INF/container.xml")) {
    throw new Error(`${PLUGIN_NAME}: 'META-INF/container.xml' is missing`);
  }

  return files;
}

/**
 * Creates an EPUB zip from a specified directory.
 * @param {string} dir - The source directory containing EPUB files.
 * @throws Will throw an error if the source directory is not specified.
 * @returns {Promise<Buffer>} - A promise that resolves to a Buffer containing the EPUB data.
 */
async function epubZip(dir) {
  if (!dir) {
    throw new Error(`${PLUGIN_NAME}: Source directory must be specified`);
  }

  // Get list of files in the directory
  let files = await readDirRecursive(dir);
  // Validate necessary EPUB structure files
  files = validateContainer(files);

  const zip = new JSZip();

  // Add 'mimetype' file first with no compression
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  // Add other files to the zip with compression
  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileContent = await fs.readFile(filePath);
    zip.file(file, fileContent, { compression: "DEFLATE" });
  }

  // Generate the EPUB buffer
  const epubBuffer = await zip.generateAsync({ type: "nodebuffer" });

  // Return the EPUB buffer
  return epubBuffer;
}

export default epubZip;
