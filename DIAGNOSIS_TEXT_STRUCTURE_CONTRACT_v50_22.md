# v50.22 Diagnosis Text Structure Contract

## Purpose

Make diagnosis result text easier to edit, improve, and add without touching large application files directly.

## New structure

- `diagnosis_text/bundle.json`: runtime-editable diagnosis text bundle.
- `diagnosis_text/ja/composition_profiles.json`: Japanese composition diagnosis section text.
- `diagnosis_text/ja/composition_win_conditions.json`: win-condition text by composition type.
- `diagnosis_text/ja/target_role_templates.json`: target-hero role text templates.
- `diagnosis_text/ja/section_titles.json`: section heading labels.
- `diagnosis_text/output_rules.json`: fallback labels and display-order rules.
- `diagnosis_text/rewrite_rules.json`: forbidden and preferred wording rules.
- `tests/owcoach-diagnosis-text-structure-static.cjs`: static QA for this structure.

## Runtime rule

The app tries to load `diagnosis_text/bundle.json` first. If it cannot load the external file, it falls back to the embedded bundle in `index.html` / `_combined.js`.

## Editing rule

Future text changes should start in `diagnosis_text/` rather than directly editing renderer code.

## QA

Run:

```bash
npm run check:diagnosis-text-structure
npm run check:syntax
```

Expected result:

```text
Diagnosis text structure static checks passed
```
