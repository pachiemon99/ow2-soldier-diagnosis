# Pack Y / v50.29 WIP Macro Rebuild Phase 2

## Purpose

Phase 2 connects the Phase 1 macro composition lens to actual diagnosis priority. Phase 1 displayed enemy macro reading as a non-destructive overlay. Phase 2 makes that reading influence the diagnosis arrays that users actually follow: factors, opening, target order, peak timing, ultimate timing, and forbidden actions.

## Design

The app still runs from `index.html`. CSV/JSON files remain editing, audit, and QA sources only. No browser runtime fetch was added.

New runtime entry:

- `owcBuildMacroDecisionPlan(sel, diag)`

Patched runtime entries:

- `owcEnhancedCompositionDiagnosis`
- `owcSynergyFactorLines`
- `diagnose`
- `owcRenderReadableComposition`

## Added diagnosis axes

- 進入後返し優先
- 孤立防止優先
- 上下射線分解優先
- クロスファイア遮断優先
- 角管理・引き撃ち優先
- 支援線崩し優先
- 救助消費から二手目優先
- 設置物前処理優先
- 退路・回復線遮断優先
- 起点分解優先

## Status

- ZIP generated: no
- GitHub reflected: no
- Browser QA: not run locally
