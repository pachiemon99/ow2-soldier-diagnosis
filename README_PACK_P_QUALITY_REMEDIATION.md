# OW Coach v50.16 Pack P: Quality Remediation

This package applies the first DB quality remediation pass after Pack O.

## What changed

- Added canonical detail fields to all implemented targets: `main`, `move`, `sustain`, `ultimate`, `cue`, `practice`.
- Mirrored those fields into each target hero CSV so old custom DBs and newer DBs are easier to edit the same way.
- Replaced abstract timing words such as `移動スキル使用直後`, `防御スキル使用後`, `救助スキル使用後`, `主要アビリティ`, and `該当なし`.
- Added a post-remediation quality audit: `owcoach_db_quality_score_audit_v50_16.csv`.
- Added a post-remediation target summary: `owcoach_db_quality_target_summary_v50_16.csv`.
- Added static QA: `tests/owcoach-quality-remediation-static.cjs`.

## Post-remediation quality bands

- A: 357
- B: 510
- C: 0
- D: 0
- E: 0

## Important

Pack P does not add new heroes or change GitHub. It is a data-normalization and cleanup pass.
