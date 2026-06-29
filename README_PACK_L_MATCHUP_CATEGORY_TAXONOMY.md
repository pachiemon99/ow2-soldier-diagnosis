# OW Coach v50.12 Pack L: Matchup Category Taxonomy

This package adds matchup categories for all 17 implemented diagnostic targets and all 51 enemy heroes.

## What changed

- Added `owcoach_matchup_category_taxonomy_db_v50_12.csv` with 17 × 51 rows.
- Added detail diagnosis section: `対面カテゴリ`.
- Added composition diagnosis section: `対面カテゴリ要約`.
- Added runtime helpers for category lookup and composition grouping.
- Added static QA for category coverage and display hooks.

## Validation

Run:

```bash
npm run check:syntax
node --check _combined.js
npm run check:matchup-categories
```

Browser QA is still not run locally. Run GitHub Actions when GitHub reflection resumes.
