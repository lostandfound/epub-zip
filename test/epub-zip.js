"use strict";

import path from 'path';
import { fileURLToPath } from 'url';
import chai from 'chai';
import chaiAsPromised from 'chai-as-promised';
import JSZip from 'jszip';
import epubZip from '../lib/epub-zip/index.mjs';

chai.use(chaiAsPromised);
const { assert } = chai;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputDir = path.join(__dirname, 'fixtures');

describe('epub-zip', function() {

  describe('normal case', function () {

    let zip;
    let actual;
    before(async function() {
      zip = new JSZip();
      const content = await epubZip(path.join(inputDir, "pub00"));
      actual = await zip.loadAsync(content);
    });

    it ('should be uncompressed mimetype in the archive.', function () {
      assert.propertyVal(actual.files.mimetype, 'name', 'mimetype');
      assert.equal(actual.files.mimetype._data.compressedSize, actual.files.mimetype._data.uncompressedSize);
    });

    it ('should be container.xml in the archive.', function () {
      assert.propertyVal(actual.files['META-INF/container.xml'], 'name', 'META-INF/container.xml');
    });

    it ('should be an opf file in the archive.', function () {
      assert.propertyVal(actual.files['item/standard.opf'], 'name', 'item/standard.opf');
    });

    it ('should be image file in the archive.', function () {
      assert.propertyVal(actual.files['item/image/cover.jpg'], 'name', 'item/image/cover.jpg');
    });

    it ('should be css file in the archive.', function () {
      assert.propertyVal(actual.files['item/style/book-style.css'], 'name', 'item/style/book-style.css');
    });

    it ('should be xhtml file in the archive.', function () {
      assert.propertyVal(actual.files['item/xhtml/p-001.xhtml'], 'name', 'item/xhtml/p-001.xhtml');
    });

  });

  it ('should throw error if source directory is missing.', async function () {
    await assert.isRejected(
      epubZip(),
      Error,
      `epub-zip: Source directory must be specified`
    );
  });

  it ('should throw error if META-INF/container.xml is missing.', async function () {
    await assert.isRejected(
      epubZip(path.join(inputDir, "pub01")),
      Error,
      `epub-zip: 'META-INF/container.xml' is missing`
    );
  });

  it ('should be mimetype in the archive even if mimetype is missing in the source directory.', async function () {
    const zip = new JSZip();
    const content = await epubZip(path.join(inputDir, "pub02"));
    const actual = await zip.loadAsync(content);
    assert.propertyVal(actual.files.mimetype, 'name', 'mimetype');
  });

  describe('ignore files', function () {

    let zip;
    let actual;
    before(async function() {
      zip = new JSZip();
      const content = await epubZip(path.join(inputDir, "pub03"));
      actual = await zip.loadAsync(content);
    });

    it ('should not be .DS_Store in the archive.', function () {
      assert.notProperty(actual.files, '.DS_Store');
    });

    it ('should not be Thumbs.db in the archive.', function () {
      assert.notProperty(actual.files, 'Thumbs.db');
    });

    it ('should not be desktop.ini in the archive.', function () {
      assert.notProperty(actual.files, 'desktop.ini');
    });

    it ('should not be _MACOSX in the archive.', function () {
      assert.notProperty(actual.files, '_MACOSX/.gitkeep');
    });

  });

});