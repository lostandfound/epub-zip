# epub-zip

epub packager.

## Usage

```javascript
var fs = require('fs');
var epubZip = require('epub-zip');

var content = epubZip("./src");
fs.writeFileSync("./dist/myAwsomeBook.epub", content);
```

## License

[MIT License](http://en.wikipedia.org/wiki/MIT_License)