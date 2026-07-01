# Pack W: Duplicate Source Reduction

This pass audits repository-wide duplication and removes the largest avoidable duplicate source.

## Main change

- Removed `_combined.js` from the committed source tree.
- Added `tests/owcoach-app-source-utils.cjs` to extract inline JavaScript from `index.html` during QA.
- Added `tests/owcoach-app-source-syntax-static.cjs` so syntax checks still cover the actual browser source.
- Updated checks that previously read `_combined.js` to read the extracted app source instead.

## Runtime impact

No runtime fetch path was added. The browser still opens `index.html` directly and uses the same embedded data path, so page-load behavior remains unchanged.

## Why this reduces maintenance cost

Before this pass, every app logic change had to be mirrored in both `index.html` and `_combined.js`. After this pass, `index.html` is the single committed browser source, while QA derives the checkable JavaScript from it.
