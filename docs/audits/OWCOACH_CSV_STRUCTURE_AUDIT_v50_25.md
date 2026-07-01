# OW Coach CSV Structure Audit v50.25

## Purpose

Pack W keeps the `data/` CSV mirrors, but removes table-level redundancy that made editing and review unnecessarily heavy.

The browser runtime is unchanged. `index.html` still contains the embedded `OWCOACH_DATA` runtime payload, so local direct-open behavior and GitHub Pages behavior are not affected by this CSV source cleanup.

## What changed

- Added `data/shared/owcoach_hero_registry_v50_25.csv` as the single source for hero display name, role, and sub-role.
- Added `data/shared/owcoach_csv_compaction_manifest_v50_25.json` to record every removed column, constant value, and alias mapping.
- Removed repeated registry-derived fields from CSV mirrors:
  - `hero_ja`, `role`, `sub_role` in target CSVs.
  - `target_ja`, `enemy_ja`, `enemy_role`, `enemy_sub_role` in shared and audit CSVs.
- Moved file-level constants to the compaction manifest.
- Removed exact duplicate alias columns while preserving how to reconstruct them.

## Size result

| Item | Size |
|---|---:|
| Original CSV bytes | 14,087,388 |
| Compact CSV bytes with registry | 10,954,013 |
| Saved | 3,133,375 |
| Reduction | 22.24% |

## Data-loss guard

The compact CSV files are intentionally smaller, but the logical table can still be reconstructed by combining:

1. the compact CSV row,
2. `owcoach_hero_registry_v50_25.csv`, and
3. `owcoach_csv_compaction_manifest_v50_25.json`.

The QA helper `tests/owcoach-csv-source-utils.cjs` hydrates compact rows during static checks, so older logical fields remain testable without storing them repeatedly in every row.
