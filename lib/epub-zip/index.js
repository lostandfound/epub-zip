"use strict";

var fs = require("fs");
var path = require("path");
var _ = require("lodash");
var JSZip = require("jszip");

var PLUGIN_NAME = "epub-zip";
var ingoreFiles = /^(\.DS_Store|Thumbs\.db|desktop\.ini|_MACOSX)$/;
//var ignoreFiles = /^(Thumbs\.db|desktop\.ini|_MACOSX)$/;

function readDirResursive(root, files, base) {
  base  = base  || ""
  files = files || []

  var dir = path.join(root, base)

  if (fs.lstatSync(dir).isDirectory() ) {
  	fs.readdirSync(dir)
    .forEach(function (file) {
      if(!file.match(ingoreFiles)) {
        readDirResursive(root, files, path.join(base, file))
      }
    })
  } else {
  	files.push(base)
  }

  return files
}

function validateContainer(files) {
  
  if(!_.includes(files, "mimetype")) {
    console.warn(PLUGIN_NAME + ": mimetype file is missing in root directory");
  } else {
  	// omit mimetype
  	files = _.without(files, "mimetype");
  }

  if(!_.includes(files, "META-INF/container.xml")) {
    throw new Error(PLUGIN_NAME + ": META-INF/container.xml is missing");
  }

  return files;
}

function epubZip(dir) {

  if(!dir) {
    //throw new Error(PLUGIN_NAME + ": source directory must be specified");
    throw new Error("Wrong value");
  }
  
  var files = readDirResursive(dir);
  files = validateContainer(files);

  var zip = new JSZip();

  // add mimetype first 
  zip.file("mimetype", "application/epub+zip", {compression: "STORE"});

  files.forEach(function(file) {
  	zip.file(file, fs.readFileSync(path.join(dir, file)), {compression: "DEFLATE"});
  });

  var content = zip.generate({type:"nodebuffer"});
  
  // return Bufffer
  return content;
  cb();
}

module.exports = epubZip;