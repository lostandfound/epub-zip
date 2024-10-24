# epub-zip

EPUB packager for Node.js.

## Overview

`epub-zip` is a library for compressing files in a specified directory into the EPUB format.

## Install

Install with npm:

```
npm install epub-zip
```

## Usage

Here is a basic example of creating an EPUB file using `epub-zip` with promises.

```javascript
import fs from 'fs';
import epubZip from 'epub-zip';

// Create an EPUB file by specifying the source directory
epubZip("./src").then(epubBuffer => {
  fs.writeFileSync("./dist/myAwesomeBook.epub", epubBuffer);
}).catch(err => {
  console.error("Error occurred while creating EPUB:", err);
});
```

### Using async/await

You can also use `async/await` for a cleaner syntax:

```javascript
import fs from 'fs/promises'; // Use promises for async operations
import epubZip from 'epub-zip';

async function createEpub() {
  try {
    // Create an EPUB file by specifying the source directory
    const epubBuffer = await epubZip("./src");
    await fs.writeFile("./dist/myAwesomeBook.epub", epubBuffer);
    console.log("EPUB file created successfully.");
  } catch (err) {
    console.error("Error occurred while creating EPUB:", err);
  }
}

createEpub();
```

### Notes

- The source directory must contain a `mimetype` file in the root directory.
- A `META-INF/container.xml` file is also required.
- The library uses asynchronous operations for better performance.
- Improved error messages help in identifying issues more easily.

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)
