# v50.17 Pack Q: Depth Enhancement Contract

Pack Q adds a depth layer for every implemented target/enemy matchup.

## Required row shape

Each of the 17 × 51 rows must include:

- `depth_archetype`
- `first_check`
- `commit_window`
- `reset_rule`
- `practice_question`
- `depth_summary`
- `duplication_guardrail`

## Display rule

The detail diagnosis may show the new depth layer as an execution note. It should not replace the core matchup plan, skill wait window, priority target, ultimate decision, or rank advice. It acts as a small tactical black box: what to check before entering, when to commit, and where to reset.

## QA rule

Pack Q fails static QA if rows are missing, if key fields are too short, if runtime helpers are absent, or if the v50.17 audit still reports `needs_depth`.
