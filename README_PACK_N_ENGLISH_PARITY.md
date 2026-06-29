# OW Coach v50.14 Pack N - English Parity Audit

This pack improves English-mode parity after the DB expansion packs.

## What changed

- Replaced the final English composition renderer with a parity renderer.
- Added English display sections for access tier, matchup category summary, target order, matchup reasons, timing windows, ultimate conditions, avoid lines, and priority enemies.
- Replaced the English detail renderer with a parity renderer that keeps Pack F-M data visible.
- Added English detail sections for access tier, matchup category, matchup reason, unique matchup focus, skill timing window, rank advice, priority targets, and avoid lines.
- Added a static QA file to prevent English mode from silently dropping new DB sections.

## Important note

This pack does not enforce a hard paywall. It only keeps the free / preview / paid metadata visible in English mode so that monetization QA can be done later without losing content.

## Validation

Run:

```bash
npm run check:syntax
npm run check:english-parity
node --check _combined.js
```
