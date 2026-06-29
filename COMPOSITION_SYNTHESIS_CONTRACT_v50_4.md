# OW Coach v50.4 Pack D - Composition Synthesis Contract

## Purpose

Move composition diagnosis from simple single-hero aggregation toward five-enemy synthesis. The main label remains compatible with v50 QA, but each diagnosis now also carries role decomposition, pressure axis, primary stop group, secondary stop group, and stop-order summary.

## Preserved main labels

- ダイブ救助構成
- 長射線＋空中圧力構成
- 分断射線構成
- ラッシュ継戦構成
- 高耐久継戦構成
- 救助継戦構成
- バランス構成

## New shared diagnosis fields

- `roles`: tank / damage / support buckets from selected enemy five.
- `evidence`: named synergy groups such as dive, save, air, long, flank, brawl, heavy, speed, barrier, burstSave.
- `score_map`: numeric evidence strength map for auditing.
- `order_plan`: ordered plan with label, heroes, and reason.
- `primary_group`: first group to deny.
- `second_group`: second group to force or move.
- `pressure_axis`: short description of how the five enemies combine.
- `five_man_summary`: compact synthesis line.
- `stop_order_summary`: display-safe stop order line.

## Implementation rule

Do not change per-target engines first. All 17 targets must consume the common `owcEnhancedCompositionDiagnosis()` output through shared rendering lines, so custom and simple engines stay aligned.
