# Tixy Quest

Puzzles for learning JavaScript by writing tiny bits of code that draw dot patterns.
Grew out of the tixy page on the kids' links site, which was based on
[tixy.land](https://tixy.land) and the [tixy tutorial](https://www.mathsuniverse.com/tixy) by @JakeGMaths.

## What's in it

- **Level packs**: Mommy's original levels, the original tutorial, and new packs:
  shapes, remainders (`%`), red & white (`-1`, `? :`), shading, big grids, animation (`t`),
  binary/bitwise, and "many ways & code golf".
- **Saved answers**: every working answer is saved per level. Each level has three stars:
  solve it, match the shortest known answer, and find several different answers.
- **Dot inspector**: click any dot to see its `x`, `y`, `i` and `t`, the code with the numbers
  filled in, and each `||` / `&&` piece's value, so you can see *why* a dot is on.
- **Spot the difference**: outlines the dots that don't match the target yet.
- Both the inspector and spot-the-difference are checkboxes under the code box. The inspector setting is remembered.
- **Numbers on dots**: print `x`, `y` or `i` inside every dot on both grids (too small to fit on 32×32).
- **Time controls** (for patterns that use `t`): pause, step 0.1 s back or forward, restart, speeds ¼× to 2×,
  and an optional tick sound every 0.1 s or 1 s. Speed and sound settings are remembered.
- **Dictionary**: every bit of syntax with a short explanation and live examples.
- **Playground**: free play on 8×8, 16×16 or 32×32 grids, with examples and saved creations.
- **Backups**: progress lives in the browser's localStorage. The home page can save and load a backup file.

## Running it

No build step. It's plain HTML, CSS and JavaScript modules. Serve the folder with any static server:

    npx http-server .

(Opening `index.html` straight from disk won't work, because browsers block JS modules on `file://`.)

To publish with GitHub Pages: Settings → Pages → Deploy from a branch → `main` / root.

## Editing

- **The welcome note** is at the top of `index.html`.
- **Levels** are in `js/levels.js`. Add `{ code: '...' }` to a pack. Optional fields are listed at the top of that file.
  Put other answers you know about in `alts`. The shortest one becomes the "shortest known answer".
  A level's id is its pack plus its code, so moving levels around keeps saved progress.
  Changing a level's `code` makes it a new level.
- **Dictionary entries** are in `js/dictionary.js`.

## Tests

    node --test tests/*.test.js

The tests check that every level compiles, every `alts` answer really matches, dictionary links exist, and the inspector's explanation logic works.
