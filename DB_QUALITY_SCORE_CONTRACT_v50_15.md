# v50.15 Pack O: DB Quality Score Audit Contract

## Purpose

Pack O adds an editor-facing quality audit for the full OW Coach diagnostic database. It does not change matchup rules directly. It creates a scoring surface that tells which rows should be edited next.

## Scope

- 17 implemented target heroes.
- 51 enemy heroes per target.
- 867 matchup rows.
- Structural sources from Pack A through Pack N.

## Quality formula

- Coverage: 35%.
- Text depth and placeholder cleanup: 25%.
- Rating quality and range: 20%.
- Text uniqueness: 20%.

## Bands

- A: 92-100, stable.
- B: 82-91, good.
- C: 70-81, review.
- D: 55-69, needs reinforcement.
- E: 0-54, needs correction.

## Rule

Static QA should fail only on structural problems. Content quality problems are reported in CSV and runtime metadata so the next editing pass can prioritize them.
