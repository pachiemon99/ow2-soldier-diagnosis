# OW Coach Composition Large Sample Polish Audit v50.26

## Scope

This audit checks rendered Japanese diagnosis output across multiple render paths, not only raw source strings.

- Detail diagnosis: 17 target heroes × 51 enemy heroes = 867 outputs
- Representative composition diagnosis: 17 target heroes × 7 representative enemy compositions = 119 outputs
- Large sample composition diagnosis: 17 target heroes × 200 deterministic sampled enemy compositions = 3,400 outputs

## Guarded output issues

The render audit rejects stale or unnatural text such as:

- するして / 作るして / 溜めるして / 確認するして
- previously banned ambiguous Japanese terms
- previously banned dive-route wording
- undefined / null / NaN
- previously banned generic skill-group wording
- duplicated adjacent hero names such as イラリー、イラリー

## Fixes included

- Composition win-condition text is routed through the same Japanese polish pass as other diagnosis text.
- Remaining generic support-role labels are converted to サポート or a more concrete support-action phrase.
- Adjacent duplicate hero-name lists are collapsed at display time.
- Missing matchup-reason fields no longer render undefined values in detail diagnosis.

## Notes

The large sample audit is intentionally separate from `check:syntax` because it renders thousands of diagnosis combinations and should remain a quality gate, not a fast syntax gate.
