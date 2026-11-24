# Third-party code

## p5.js 2.4.0

This project uses the unmodified p5.js browser library by the Processing Foundation and p5.js contributors, distributed under LGPL 2.1. The library retains its original notices.

- Project and documentation: [p5.js](https://p5js.org/).
- Release source: [processing/p5.js v2.4.0](https://github.com/processing/p5.js/tree/v2.4.0).
- License text: [licenses/p5-LGPL-2.1.txt](licenses/p5-LGPL-2.1.txt).
- Matching source archive, including build instructions and dependency lockfile: [vendor/p5-2.4.0-source.tar.gz](vendor/p5-2.4.0-source.tar.gz).
- `p5.min.js` matches the official npm 2.4.0 distribution byte for byte. SHA-256: `52f7ebada940f4dfdaf5aef0026e42ed15681d5c41d4f2cb819ba38b119fd9f2`.

The following runtime dependencies are recorded in the release lockfile. Their notices are collected in [licenses/p5-dependencies.txt](licenses/p5-dependencies.txt); notices embedded in the upstream library and source archive are also retained. These are bundled library dependencies, not additional downloads made by the artwork.

| Package                                                                      | Version | License        |
| ---------------------------------------------------------------------------- | ------- | -------------- |
| [@davepagurek/bezier-path](https://github.com/davepagurek/bezier-path)       | 0.0.7   | MIT            |
| [@japont/unicode-range](https://www.npmjs.com/package/@japont/unicode-range) | 1.0.0   | MIT            |
| [acorn](https://github.com/acornjs/acorn)                                    | 8.18.0  | MIT            |
| [acorn-walk](https://github.com/acornjs/acorn)                               | 8.3.5   | MIT            |
| [colorjs.io](https://github.com/color-js/color.js)                           | 0.6.1   | MIT            |
| [escodegen](http://github.com/estools/escodegen)                             | 2.1.0   | BSD-2-Clause   |
| [esprima](https://github.com/jquery/esprima)                                 | 4.0.1   | BSD-2-Clause   |
| [estraverse](http://github.com/estools/estraverse)                           | 5.3.0   | BSD-2-Clause   |
| [esutils](http://github.com/estools/esutils)                                 | 2.0.3   | BSD-2-Clause   |
| [gifenc](https://github.com/mattdesl/gifenc)                                 | 1.0.3   | MIT            |
| [libtess](https://github.com/brendankenny/libtess.js)                        | 1.2.2   | SGI-B-2.0      |
| [omggif](https://github.com/deanm/omggif)                                    | 1.0.10  | MIT            |
| [pako](https://www.npmjs.com/package/pako)                                   | 2.2.0   | (MIT AND Zlib) |
| [source-map](http://github.com/mozilla/source-map)                           | 0.6.1   | BSD-3-Clause   |
| [tl-util](https://www.npmjs.com/package/@limzykenneth/tl-util)               | 0.0.1   | MIT            |
| [zimmerframe](https://github.com/sveltejs/zimmerframe)                       | 1.1.5   | MIT            |
| [zod](https://github.com/colinhacks/zod)                                     | 4.6.6   | MIT            |

The bezier-path package declares MIT in its package metadata but supplies no standalone license file; its author attribution and standard MIT terms are recorded in the notice collection.

## Mulberry32

`randomSource()` in `backgrounds.js` is a JavaScript implementation of Tommy Ettinger's Mulberry32 algorithm, dedicated to the public domain under CC0 1.0.

- Original: [Tommy Ettinger, Mulberry32 (2017)](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c).
- Original source and author notice: [vendor/mulberry32.c](vendor/mulberry32.c).
- Full terms: [licenses/CC0-1.0.txt](licenses/CC0-1.0.txt).

## Artwork assets

The photographs and sound files were supplied for this artwork. The GPL grant covers the project's original code; it does not relicense third-party photographs, sound recordings, fonts or other media. System fonts are requested by name and are not bundled. The reference videos are visual references, not embedded code or assets.
