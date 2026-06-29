# v50.12 Pack L: Matchup Category Taxonomy Contract

## Purpose

Pack L adds a tactical category to every target/enemy matchup. The goal is to make each diagnosis easier to scan before the player reads the full matchup text.

## Category groups

- 空中対策 / 空中圧の回避
- フランカー対策 / 接近拒否
- 長射線管理
- 救助崩し
- 高耐久削り / 盾割り・正面資源
- 範囲・設置物処理
- 撃ち合いテンポ / 瀕死回収 / 正面破壊

## Rules

1. Every implemented target must have 51 category rows.
2. Every row must include primary and secondary categories.
3. The detail diagnosis must show `対面カテゴリ` before deeper reason text.
4. The composition diagnosis must summarize the selected enemy five with `対面カテゴリ要約`.
5. Category text must not replace Pack J/K reason text. It is a scan layer placed above the details.
