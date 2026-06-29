# OW Coach v50.13 Pack M: Free / Paid Entitlement Flags

This package adds product-tier metadata to all 17 implemented diagnostic targets and all 51 enemy matchups.

## What changed

- Added `owcoach_feature_entitlement_db_v50_13.csv` with 17 × 51 rows.
- Added `owcoach_feature_entitlement_contract_v50_13.json`.
- Added runtime helpers for free / preview / paid metadata.
- Added detail diagnosis section: `公開区分`.
- Added composition diagnosis section: `構成診断の公開区分`.
- Added static QA for entitlement coverage, tier names, and runtime hooks.

## Important

This pack does **not** hide content yet. It only tags content by product tier so a later authentication/payment layer can read the same rules.

## Validation

Run:

```bash
npm run check:syntax
node --check _combined.js
npm run check:feature-entitlements
```

Browser QA is still not run locally. Run GitHub Actions when GitHub reflection resumes.
