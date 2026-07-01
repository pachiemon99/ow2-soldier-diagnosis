# Pack AB / Macro Rebuild Phase 5

## Purpose

Phase 5 upgrades the composition diagnosis from pair synergy reading to **trio core and five-man synthesis**.

The goal is to show the enemy composition as a set of connected functions, not as five isolated heroes.

## Added surface

- 完成コア検出 / 5人構成合成
- 敵5人の完成形
- 切るべき配線
- 主勝ち筋 / 副勝ち筋

## Implemented examples

- Winston + Tracer + Ana
- Reinhardt + Mei + Lúcio
- Sigma + Bastion + Baptiste
- Pharah + Mercy + D.Va
- Genji + Ana + Kiriko
- Brigitte + Ana + Zenyatta

## Runtime approach

The feature is non-destructive. It wraps the Phase 3 composition renderer and inserts a Phase 5 block before the detailed win-condition section. Existing Phase 1-4 macro logic remains intact.

## QA

Run:

```bash
npm run check:macro-rebuild-phase5
npm run check:app-source
npm run check:file-layout
```
