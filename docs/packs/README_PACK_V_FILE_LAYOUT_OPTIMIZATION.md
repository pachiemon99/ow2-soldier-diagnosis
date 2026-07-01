# v50.23 Pack V: File Layout Optimization

Pack V reorganizes the repository so that generated data, contracts, audits, documentation, and runtime files are easier to understand.

## What changed

- Target CSV mirrors moved to `data/targets/<target-slug>/`.
- Shared generated CSV mirrors moved to `data/shared/`.
- Audit CSV files moved to `data/audits/`.
- Contract JSON files moved to `data/contracts/`.
- Pack and contract Markdown files moved to `docs/`.
- Runtime files remain at the root: `index.html`, public policy pages, sitemap, robots, package files. `_combined.js` is no longer committed because it duplicated the inline app source.
- `diagnosis_text/` remains at the root so the app can keep loading `diagnosis_text/bundle.json` without a runtime path migration.
- Static QA paths were updated.
- Added `npm run check:file-layout`.

## What did not change

- No hero matchup rating was intentionally changed.
- No payment/authentication lock was added.
- Browser runtime speed should remain equivalent because large CSV files are still not fetched at runtime.
