# v50.8 Pack H - Priority Target Decision DB

## Purpose

Pack H redesigns target priority so the app no longer treats “important enemy” as a single list. Each implemented target hero now separates enemy heroes into:

- `focus_first`: enemies to look at first for a pick
- `pressure_only`: enemies to damage for resources, not chase for kills
- `punish_late`: enemies to attack after movement, defense, or rescue tools are spent
- `avoid_chase`: enemies that should not be chased in isolation

## Scope

- 17 target heroes
- 51 enemy heroes
- 867 CSV rows
- Composition diagnosis order section
- Detail diagnosis priority target section

## Display behavior

Composition diagnosis now prepends target-priority lines before general synergy order lines. Detail diagnosis replaces raw `priority_targets` with a normalized explanation that includes the enemy's priority class and reason.

## QA

Run:

```bash
npm run check:priority-targets
npm run check:syntax
```

Expected result:

```text
Priority target decision static checks passed
```
