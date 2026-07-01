# Pack W: CSV Source Compaction

Pack W optimizes the CSV source mirror under `data/` while keeping runtime behavior unchanged.

## Policy

- Keep CSV files available for editing, audit, and source review.
- Do not add runtime CSV fetches.
- Do not remove embedded fallback data from `index.html` in this pass.
- Do not lose logical fields. Fields removed from CSV headers must be recoverable from the hero registry or the compaction manifest.

## New files

```text
 data/shared/owcoach_hero_registry_v50_25.csv
 data/shared/owcoach_csv_compaction_manifest_v50_25.json
 tests/owcoach-csv-source-utils.cjs
 tests/owcoach-csv-structure-static.cjs
 docs/audits/OWCOACH_CSV_STRUCTURE_AUDIT_v50_25.md
```

## QA

Run:

```bash
npm run check:csv-structure
npm run check:syntax
```
