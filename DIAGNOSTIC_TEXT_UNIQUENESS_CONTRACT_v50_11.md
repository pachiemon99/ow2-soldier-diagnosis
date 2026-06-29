# v50.11 Pack K: Diagnostic Text Uniqueness Contract

## Purpose

Pack K reduces template-like diagnostic repetition. It keeps the existing Pack J reason DB intact, then overlays a target/enemy-specific focus cue for every implemented target hero and every enemy hero.

## Rules

1. Every implemented target must have 51 uniqueness hint rows.
2. Each row must include `specific_focus`, `unique_cue`, and `avoid_repeat_note`.
3. Visible duplicate arrays such as priority targets and forbidden actions are de-duplicated before rendering.
4. Matchup reason win/loss text receives a concrete `見分け方` / `重複回避` cue.
5. Rank learning goals receive a `固有焦点` suffix so repeated rank templates do not feel identical across enemies.
6. The existing Pack J matchup reason CSV remains available as the base reason DB.

## Non-goals

This pack does not rewrite every sentence manually. It adds a deterministic anti-duplication layer and static QA so later manual editing has a clean contract.
