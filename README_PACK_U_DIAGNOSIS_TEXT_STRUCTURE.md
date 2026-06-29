# v50.22 Pack U: Diagnosis Text Structure

Pack U separates diagnosis-result copy from the large renderer files.

## What changed

- Added `diagnosis_text/` as the editable text source area.
- Added external runtime loading for `diagnosis_text/bundle.json`.
- Kept an embedded fallback bundle inside `index.html` and `_combined.js` so the app still works if JSON loading fails.
- Moved composition win conditions, composition profile sections, target-role templates, section labels, and rewrite rules into structured JSON.
- Added `npm run check:diagnosis-text-structure`.

## What this improves

- Text changes can be made in small JSON files.
- Repeated phrases are easier to find.
- Section headings can be changed without digging through renderer code.
- Future additions can be added by composition type and section.

## What did not change

- No payment/authentication lock was added.
- No hero matchup ratings were intentionally changed.
- No GitHub reflection was performed in this local pass.
