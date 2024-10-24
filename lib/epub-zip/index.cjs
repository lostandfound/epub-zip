'use strict';

const fs = require('fs/promises'); // Use promises for async operations
const path = require('path');
const _ = require('lodash');
const JSZip = require('jszip');

const PLUGIN_NAME = "epub-zip";
const ignoreFiles = /^(\.DS_Store|Thumbs\.db|desktop\.ini|_MACOSX)$/; // Corrected spelling

async function readDirRecursive(root, files = [], base = '') {
  const dir = path.join(root, base);

  const stats = await fs.lstat(dir);
  if (stats.isDirectory()) {
    const dirFiles = await fs.readdir(dir);
    for (const file of dirFiles) {
      if (!file.match(ignoreFiles)) {
        await readDirRecursive(root, files, path.join(base, file));
      }
    }
  } else {
    files.push(base);
  }

  return files;
}

function validateContainer(files) {
  if (!_.includes(files, "mimetype")) {
    console.warn(`${PLUGIN_NAME}: 'mimetype' file is missing in the root directory`);
  } else {
    files = _.without(files, "mimetype");
  }

  if (!_.includes(files, "META-INF/container.xml")) {
    throw new Error(`${PLUGIN_NAME}: 'META-INF/container.xml' is missing`);
  }

  return files;
}

async function epubZip(dir) {
  if (!dir) {
    throw new Error(`${PLUGIN_NAME}: Source directory must be specified`);
  }

  let files = await readDirRecursive(dir);
  files = validateContainer(files);

  const zip = new JSZip();

  // Add mimetype first 
  zip.file("mimetype", "application/epub+zip", { compression: "STORE" });

  for (const file of files) {
    const filePath = path.join(dir, file);
    const fileContent = await fs.readFile(filePath);
    zip.file(file, fileContent, { compression: "DEFLATE" });
  }

  const content = await zip.generateAsync({ type: "nodebuffer" });

  // Return Buffer
  return content;
}

module.exports = epubZip;
