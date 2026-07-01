# OW Coach Duplicate Source Audit v50.24

## Scope

Checked the full repository package after the skill ownership and UI hotfix.

## Result

No exact duplicate file-content groups were found in the package.

The largest avoidable near-duplicate was `_combined.js`: it duplicated the inline browser app source already stored in `index.html` and created a second correction point for every logic/text change.

## Optimization applied

- Removed `_combined.js` from committed source.
- Added `tests/owcoach-app-source-utils.cjs` to extract inline JavaScript from `index.html` for QA.
- Added `tests/owcoach-app-source-syntax-static.cjs` to preserve syntax coverage of the browser source.
- Updated tests that previously read `_combined.js` so they use the extracted app source.
- Kept runtime behavior unchanged: `index.html` is still the browser entry point and no additional runtime fetch is required.

## Size impact

| Metric | Before | After |
|---|---:|---:|
| Repository target files | 186 | 188 |
| Uncompressed repository size | 44,957,731 bytes | 29,752,099 bytes |
| Reduction | - | 15,205,632 bytes |

The file count increased by two because the duplicate file was replaced by small QA utilities and this audit note. The data volume and future correction surface were reduced substantially.

## Deferred candidates

These areas still contain intentional mirrors and should be optimized only in separate passes:

- `diagnosis_text/bundle.json` mirrors split JSON files so runtime can load one compact bundle.
- `index.html` contains embedded fallback data so direct local preview works without a local server.
- CSV files under `data/` mirror embedded runtime data for editing, QA, and audits.

Removing those would require a larger build-step or runtime-loading redesign, so they were not changed in this pass.
