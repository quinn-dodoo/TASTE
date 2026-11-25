# TASTE.EXE

A generative artwork by Nguyễn Hoàng Quỳnh Anh for COMM2754 — Digital Media Specialization 1, A1. TASTE explores consumer identity and SDG 12 through a photographic mouth, changing objects, interrupted typography and seven word-glitch backgrounds.

[Open the website](https://quinn-dodoo.github.io/TASTE/).

## Run the artwork

1. Keep `index.html`, the JavaScript files, `style.css`, `p5.min.js` and `images/` together in this directory.
2. Open a terminal in this directory and start a web server:

   ```sh
   python3 -m http.server 8000
   ```

   On Windows, `py -m http.server 8000` also works if Python is installed.

3. Open [http://localhost:8000/index.html](http://localhost:8000/index.html) in a desktop browser.
4. Press Ctrl+C in the terminal when finished.

VS Code users can also open `index.html` with the Live Server extension if it is already installed.

Any static web server works. No build, npm installation or internet connection is needed to run the artwork. Use a web server rather than opening the HTML through `file://`, so the image files can load correctly. The original PNG files are large and load progressively. Objects appear only after their images load; unavailable images are skipped without placeholder shapes.

## Viewing and controls

The canvas is **1920 × 1080 pixels**, including on Retina displays. It scales proportionally to fit the browser without stretching or cropping. Screens with a different aspect ratio have margins around the artwork.

- Refresh to generate a new composition and choose a different background type.
- Double-click the artwork to enter or leave fullscreen in browsers that support the Fullscreen API. Escape also exits fullscreen. If an embedded preview does not support it, use your browser's fullscreen command.
- Click **i** for project information. Drag its title bar to move it; close it with **×** or Escape.

## Files

| File                                             | Purpose                                                            |
| ------------------------------------------------ | ------------------------------------------------------------------ |
| `index.html`                                     | Entry page, script order and project information                   |
| `settings.js`                                    | Canvas dimensions, object timing and image paths                   |
| `sketch.js`                                      | p5 setup and animation loop                                        |
| `canvas.js`                                      | Small shared drawing helpers                                       |
| `assets.js`                                      | Image loading, cropping and connector endpoints                    |
| `objects.js`                                     | Object placement, jumps and yellow halftone rendering              |
| `pointers.js`                                    | Mouth image and numbered tongue connections                        |
| `typography.js`                                  | Headline, accumulating poster and error-stack text                 |
| `backgrounds.js`                                 | Seven seeded word-glitch systems                                   |
| `script.js`, `style.css`                         | Responsive page, fullscreen and information window                 |
| `p5.min.js`                                      | Unmodified p5.js 2.4.0 library                                     |
| `images/`                                        | Background-removed runtime images; names are case-sensitive. |
| `Sound/` | Sound experiments and Audacity sessions; not played by the website |
| `tests/`                                         | Optional checks and background preview gallery                     |
| `LICENSE`                                        | Full GNU GPL version 3 license for original code                   |
| `THIRD_PARTY_NOTICES.md`, `licenses/`, `vendor/` | Credits, third-party licenses and upstream source                  |

Most functions have fewer than 15 nonblank body lines. A few image-loading routines stay together for readability. Comments explain timing, image processing or third-party attribution where needed. The bundled p5 library is kept intact.

## Generative systems

Each reload selects a new seed. Consecutive reloads in the same tab avoid the previous background when session storage is available. Each background has its own random state and held-frame rhythm, separate from the foreground animation.

- **Redaction:** blocks abruptly reveal or conceal consumption words.
- **Mosaic:** character tiles jump between broken grids.
- **Shards:** paragraph fragments snap into new arrangements.
- **Receipts:** receipt columns advance in steps and tear sideways.
- **Scatter:** words jump between positions without trails.
- **Automata:** neighbouring cells build new patterns with rules 30, 90, 110 or 150.
- **Rain:** streams of fragmented phrases move in discrete jumps.

Frames are held briefly, then replaced with a solid blue reset and displaced strips. The smaller background buffer is scaled onto the 1920 × 1080 artwork.

For a repeatable background, append `?background=mosaic&seed=8101` to the URL. Use any lowercase name above. Remove the query to restore random selection. This reproduces only the background; foreground images and typography remain independent. Older `vortex` and `swarm` links resolve to `shards` and `scatter`.

To add an image, add its exact filename to `OBJECT_PATHS` in `settings.js`. Object timing lives there too; large-text colours and timing are at the top of `typography.js`.

## Authorship notes

Short comments identify contributions at the start of each main section:

- **Student direction** credits the concept, visual choices and feedback that shaped TASTE.
- **Course foundation** identifies techniques covered in Renick Bell's lessons, such as variables, arrays, loops, random selection, image drawing and the p5 animation loop. It describes the learning basis, not proof that a particular implementation was written without assistance.
- **AI-assisted / AI support** names the implementation help: layout calculations, image processing, timing, canvas compositing, interface behaviour and testing. Basic code can also be AI-assisted.

A support note at the start of a file or section covers its related helpers, so the same credit does not need to appear above every function. These notes distinguish design decisions from implementation support; they do not label code as independently student-written based on difficulty alone. The original p5 library and credited Mulberry32 algorithm remain third-party code, with their existing notices preserved.

Course references: [12-week p5.js course](https://renickbell.net/doku.php?id=12-week-p5js), [working with photos](https://renickbell.net/doku.php?id=p5js-photos), and [animation](https://renickbell.net/doku.php?id=p5js-animation).

## Checks

These optional checks require Node.js, with no additional packages:

```sh
node tests/backgrounds.test.cjs
node tests/artwork.test.cjs
```

They cover seed variation, held frames, opaque clears, selection on reload, image loading, all three typography scenes, object bounds, pointer IDs and finite drawing coordinates. Open [the background gallery](tests/backgrounds.html) through the local server to view all seven systems together. Its timing readout measures all seven at once.

## License and credits

Copyright © 2026 Nguyễn Hoàng Quỳnh Anh.

The original project code is released under **GNU GPL version 3 only**, without warranty. The complete license is included in [LICENSE](LICENSE). Third-party components keep their own licenses; photographs and audio are not relicensed by this code license.

The artwork uses [p5.js](https://p5js.org/) under LGPL 2.1 and the [Mulberry32 algorithm by Tommy Ettinger](https://gist.github.com/tommyettinger/46a874533244883189143505d203312c) under CC0. See [THIRD_PARTY_NOTICES.md](THIRD_PARTY_NOTICES.md) for source citations, dependency notices and included license texts.
