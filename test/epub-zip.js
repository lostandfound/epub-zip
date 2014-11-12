"use strict";

var fs = require('fs');
var path = require('path');
var assert = require('chai').assert;
var JSZip = require('jszip');
var epubZip = require('../index');

var inputDir = path.join(__dirname , 'fixtures');
var targetDir = path.join(__dirname , 'dist');

describe('epub-zip', function() {

  describe('normal case', function () {

    var zip = new JSZip();
    var content = epubZip( path.join(inputDir, "pub00") );
    var actual = zip.load(content);

    it ('should be uncompressed mimetype in the archive.', function (done) {
      assert.propertyVal(actual.files.mimetype, 'name', 'mimetype');
      assert.equal(actual.files.mimetype._data.compressedSize, actual.files.mimetype._data.uncompressedSize);
      done();
    });

    it ('should be container.xml in the archive.', function (done) {
      assert.propertyVal(actual.files['META-INF/container.xml'], 'name', 'META-INF/container.xml');
      done();
    });

    it ('should be an opf file in the archive.', function (done) {
      assert.propertyVal(actual.files['item/standard.opf'], 'name', 'item/standard.opf');
      done();
    });

    it ('should be image file in the archive.', function (done) {
      assert.propertyVal(actual.files['item/image/cover.jpg'], 'name', 'item/image/cover.jpg');
      done();
    });

    it ('should be css file in the archive.', function (done) {
      assert.propertyVal(actual.files['item/style/book-style.css'], 'name', 'item/style/book-style.css');
      done();
    });

    it ('should be xhtml file in the archive.', function (done) {
      assert.propertyVal(actual.files['item/xhtml/p-001.xhtml'], 'name', 'item/xhtml/p-001.xhtml');
      done();
    });

  });

  it ('should throw erro if source directory is missing.', function (done) {
    assert.throws(
      function() {epubZip()}, Error
    );
    done();
  });

  it ('should throw erro if META-INF/container.xml is missing.', function (done) {
    assert.throws(
      function() {epubZip( path.join(inputDir, "pub01") )}, Error
    );
    done();
  });

  it ('should be mimetype in the archive evenif mimetype is missing in the source directory.', function (done) {
    var zip = new JSZip();
    var content = epubZip( path.join(inputDir, "pub02") );
    var actual = zip.load(content);
    assert.propertyVal(actual.files.mimetype, 'name', 'mimetype');
    done();
  });

  describe('ignore files', function () {
    var zip = new JSZip();
    var content = epubZip( path.join(inputDir, "pub03") );
    var actual = zip.load(content);

    it ('should not be .DS_Store in the archive.', function (done) {
      assert.notProperty(actual.files, '.DS_Store');
      done();
    });

    it ('should not be Thumbs.db in the archive.', function (done) {
      assert.notProperty(actual.files, 'Thumbs.db');
      done();
    });

    it ('should not be desktop.ini in the archive.', function (done) {
      assert.notProperty(actual.files, 'desktop.ini');
      done();
    });

    it ('should not be _MACOSX in the archive.', function (done) {
      assert.notProperty(actual.files, '_MACOSX/.gitkeep');
      done();
    });

  });

});
