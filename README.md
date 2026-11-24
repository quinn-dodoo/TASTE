# TASTE.EXE

Generative artwork for COMM2754 — Digital Media Specialization 1, A1.

TASTE explores consumer identity and SDG 12 through a photographic mouth, changing consumer objects, seven evolving word backgrounds, kinetic typography and numbered connections.

## Website

https://quinn-dodoo.github.io/TASTE/

## Run locally

Run `python3 -m http.server 8000` in this folder, then open http://localhost:8000/.

## Project files

- `index.html`: artwork page and project information window.
- `backgrounds.js`: independent seeded background systems.
- `sketch.js`: generative artwork, typography, image motion and pointers.
- `script.js`: responsive layout and draggable information window.
- `style.css`: page and information-window styling.
- `p5.min.js`: bundled p5.js library.
- `images/`: original image assets; filenames are case-sensitive.
- `Sound/`: raw sound effects and Audacity development sessions. These are retained as project files; the website does not currently play them.

The canvas uses 1920×1080 internal dimensions and scales to fit the browser. GitHub Pages serves the website from the root of `main`.

## Generative backgrounds

Every reload chooses a fresh seed and one of seven systems. In the same browser tab, consecutive reloads avoid the previous system when session storage is available. Layout, density and motion vary within each system; each continues to evolve over time.

- **Redaction:** flowing reveal masks uncover and censor a field of consumption words.
- **Mosaic:** moving wave masks assemble coloured character tiles.
- **Vortex:** words rotate through two projected twisting volumes around the mouth.
- **Receipts:** independently scrolling receipt columns split into torn fragments.
- **Swarm:** word particles follow a changing flow field, leaving short trails.
- **Automata:** neighbouring cells generate new text patterns using rules 30, 90, 110 or 150, with occasional fresh inputs.
- **Rain:** staggered streams carry fragments of consumption phrases.

The backgrounds render on a small cached canvas at up to 30 fps, separately from the foreground animation. Their random state does not alter the tuned clothing, typography or pointer timing. No new libraries, images or network requests are needed.

For a repeatable background preview, add `?background=mosaic&seed=8101` to the website URL (use any name above in lowercase). Remove the query to return to random selection. This reproduces the background, not the independently generated foreground.

## Checks

Run `node tests/backgrounds.test.cjs` for seed variation, repeatability, continuing evolution, finite drawing coordinates and reload selection. Open `tests/backgrounds.html` through the local server to inspect all seven systems together. Its timing readout measures all seven running simultaneously, not the normal single-background page.
