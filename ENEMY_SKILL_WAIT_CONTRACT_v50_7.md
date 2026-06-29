# v50.7 Pack G - Enemy Skill Wait Windows

## Purpose

Pack G standardizes the timing language used across all implemented target heroes. The goal is to avoid vague instructions such as “after movement” or “after defense” and replace them with explicit enemy skill windows.

## Applied rules

- All 17 target heroes receive a target-specific skill-wait action profile.
- The shared enemy skill dictionary remains the canonical source for enemy skills.
- Composition diagnosis now prepends concrete skill-wait timing lines to the peak-timing section.
- Detail diagnosis now adds a per-enemy cue and a one-match practice check.
- A CSV mirror is provided for all 17 target heroes × 51 enemy heroes.

## Required output shape

Each target rule must provide:

- `ja`
- `type`
- `confirm`
- `punish`
- `reset`

Each generated enemy row must provide:

- `target_id`
- `enemy_id`
- `wait_category`
- `check_skills`
- `punish_window`
- `target_action`
- `reset_action`

## QA

Run:

```bash
npm run check:skill-wait-windows
npm run check:syntax
```

Expected result:

```text
Enemy skill wait-window static checks passed
```
