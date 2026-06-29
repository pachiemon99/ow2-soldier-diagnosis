# v50.10 Pack J: Matchup Reason Clarity

## Purpose
Pack J adds explicit matchup reasoning for all implemented target heroes and all 51 enemy heroes.

## What changed
- Adds `owcoach_matchup_reason_db_v50_10.csv` with 17 × 51 = 867 rows.
- Adds `OWC_MATCHUP_REASON_DB` to the app runtime.
- Adds a composition-level `相性理由` section.
- Adds a detail-level `有利 / 不利理由` section.
- Keeps existing Pack A-I checks intact and adds a static Pack J check.

## Reason model
Each matchup now has:
- numeric rating
- verdict
- advantage reason
- disadvantage reason
- win condition
- loss condition
- play priority
- confidence

## GitHub
Not reflected to GitHub yet. Use this ZIP as a manual reflection source when ready.
