# OW Coach v50.3 Target Data Unification Audit

## 目的

構成診断改善の前に、実装済み17キャラのデータ形を統一する。キャラクター固有の違いではなく、追加時期によって生じた実装差を吸収する。

## 比較結果: 初期追加のソルジャー76 vs 後期追加のエコー / エムレ

| 対象 | metaキー | engineキー | comp_db | detail_db | comp CSV | detail CSV | rank_advice_mode |
|---|---|---|---:|---:|---|---|---|
| Soldier76 | `hero_id, hero_ja, role, status` | `comp_mode, detail_mode, name` | 51 | 7 | なし | なし | `5tier_runtime_and_db` |
| Echo | `db_quality, hero_id, hero_ja, last_reviewed, role, status` | `comp_mode, detail_mode, name` | 51 | 51 | あり | あり | `5tier_db_pack_a` |
| Emre | `db_quality, hero_id, hero_ja, last_reviewed, role, status` | `comp_mode, detail_mode, name` | 51 | 51 | あり | あり | `5tier_db_pack_a` |


## 洗い出した相違点

1. ソルジャー76は `detail_db` が実質9件で、詳細診断は主にランタイム生成だった。一方、エコー・エムレは51件のDBを持つ。
2. ソルジャー76、ソジョーン、キャスディ、アッシュはCSVミラーが存在しない。一方、後期キャラはCSVが存在する。
3. `engine` オブジェクトのキーが追加時期ごとに違う。`name / comp_mode / detail_mode`、`archetypes / primary_plan`、`id / version / core_style` が混在していた。
4. `rank_advice_mode` が `5tier_runtime_and_db`、`five_tiers`、`5tiers`、`5tier_db_pack_a` に分散していた。
5. 旧互換の `DATA.<hero>_comp_db` / `DATA.<hero>_hero_db` が手書き列挙で、キャラ追加ごとに漏れが発生しやすい。
6. エンジン選択が長い三項演算子で、追加キャラほど分岐が末尾に増える構造だった。
7. `meta` に `source`、`db_quality`、`last_reviewed`、`created_for` などがキャラごとに偏っていた。
8. DBの実体は `OWCOACH_DATA.targets[targetId]` なのに、コード側の参照名が複数経路に分かれていた。

## 統一ルール v50.3

1. 17キャラすべてを `CANONICAL_TARGET_IDS` で管理する。
2. アプリ内の正本は `OWCOACH_DATA.targets[targetId]` に統一する。
3. CSVは正本ではなく、全キャラ分の参照・監査用ミラーとして配置する。
4. 全キャラの `meta` に `target_id`、`target_ja`、`engine_id`、`engine_family`、`csv_comp_file`、`csv_detail_file`、`comp_db_count`、`detail_db_count`、`normalization_contract` を持たせる。
5. 全キャラの `engine` に `id`、`family`、`version`、`canonical_registry_key` を持たせる。
6. `rank_advice_mode` は全キャラ `five_tiers` に統一する。
7. エンジン選択は `TARGET_ENGINE_REGISTRY[targetId]` に統一する。
8. 旧互換の `DATA.<slug>_comp_db` / `DATA.<slug>_hero_db` は手書きではなく動的生成する。
9. ソルジャー76の `detail_db` は51件へ拡張し、後期キャラと同じDB件数の前提にそろえる。
10. 表示時の列名ゆれは Pack B の `normalizeTargetCompEntry` / `normalizeTargetDetailEntry` で吸収し、CSV列の強制改名はしない。

## 適用結果

- 全17キャラにcanonical metadataを付与。
- 全17キャラ分のcomp/detail CSVミラーを生成。
- ソルジャー76のdetail_dbを51件に拡張。
- `TARGET_ENGINE_REGISTRY` を導入。
- 動的legacy aliasを導入。
- v50.3専用の静的QAを追加。
