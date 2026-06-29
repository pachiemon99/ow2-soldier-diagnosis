# OW Coach v50.11 Pack K: Diagnostic Text Uniqueness

This package adds a diagnostic text uniqueness layer on top of v50.10 Pack J.

## What changed

- Added `owcoach_diagnostic_text_uniqueness_hints_v50_11.csv` with 17 × 51 rows.
- Added runtime helpers to remove exact duplicate visible lines.
- Added target/enemy-specific focus notes to detail diagnosis.
- Added specific cues to matchup reason win/loss text.
- Added a static QA test for the new uniqueness contract.

## Validation

Run:

```bash
npm run check:syntax
node --check _combined.js
npm run check:text-uniqueness
```

Browser QA is still not run locally. Run GitHub Actions when GitHub reflection resumes.
