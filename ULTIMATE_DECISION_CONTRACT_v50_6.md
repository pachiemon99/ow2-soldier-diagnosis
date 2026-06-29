# OW Coach v50.6 Pack F - Ultimate Decision DB

## Purpose

Pack F adds a shared ultimate-decision layer for all 17 implemented target heroes.
It separates ultimate advice into concrete decision fields instead of relying on a generic "check saves and barriers" sentence.

## Required fields per target

- `use_condition`
- `wait_for`
- `combo_with`
- `bad_timing`
- `target_priority`
- `rank_tip.bronze`
- `rank_tip.silver`
- `rank_tip.gold`
- `rank_tip.platinum`
- `rank_tip.diamond_plus`

## Applied surfaces

- Composition diagnosis: section 6, ultimate conditions.
- Detail diagnosis: target-specific ultimate card.
- English mode: rendered through the existing English conversion path so the new field does not disappear from English output.

## Non-goals

- This pack does not change map guidance.
- This pack does not change the 17 target roster.
- This pack does not change GitHub release/tag state.
