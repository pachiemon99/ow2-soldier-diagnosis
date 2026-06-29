# OW Coach v50.15 Pack O: DB Quality Score Audit

This package adds a database quality score audit layer on top of Pack N.

## What changed

- Added `owcoach_db_quality_score_audit_v50_15.csv` with 17 × 51 = 867 rows.
- Added `owcoach_db_quality_target_summary_v50_15.csv` with one summary row per implemented target.
- Added `owcoach_db_quality_score_contract_v50_15.json`.
- Added runtime helpers: `owcDbQualityScore`, `owcDbQualitySummary`, `owcDbQualityEditorNote`.
- Added static QA: `tests/owcoach-db-quality-score-static.cjs`.
- Added `npm run check:db-quality-score` and wired it into `npm run check:syntax`.

## Quality bands in this build

- A: 344
- B: 509
- C: 14
- D: 0
- E: 0

## Important

Pack O is an audit layer. It does not block content display, enforce paywalls, or change balancing. It identifies which rows should be edited next.

## Validation

Run:

```bash
npm run check:syntax
node --check _combined.js
npm run check:db-quality-score
```

Browser QA is still not run locally. Run GitHub Actions when GitHub reflection resumes.
