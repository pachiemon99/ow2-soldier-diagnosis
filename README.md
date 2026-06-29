# OW Coach v50 Browser QA Stabilization

This package is prepared for manual GitHub reflection and Actions validation.

## Scope

- 17 diagnostic targets.
- Adds Junkrat, Pharah, Echo, and Emre.
- Adds main / secondary synergy diagnosis.
- Renders Japanese and English composition win conditions.
- Adds static preflight and Playwright QA for synergy diagnosis.

## Manual upload

Copy the contents of `repo_files/` into the GitHub branch `v50 browser QA stabilization branch`, commit, and push.


## v50 Browser QA Stabilization

- 追加4キャラ（ジャンクラット、ファラ、エコー、エムレ）を構成診断/詳細診断のセレクトに追加。
- Playwrightの追加ターゲット/シナジーQAで言語選択モーダルを事前にバイパス。
- 詳細診断QAで詳細タブを開いてから追加ターゲットを選択するよう修正。
- 英語表示用の追加ターゲット名・主要武器・移動スキル・アルティメット名を補完。


## v50.1 Added Target DB Pack A

- Recalibrated matchup ratings for Junkrat, Pharah, Echo, and Emre across all 51 enemy heroes.
- Replaced placeholder enemy skill checks with concrete enemy skill references.
- Added five-tier rank advice to all added-target detail rows.
- Updated added-target composition scoring to use DB average rating instead of fixed even score.
- Added static QA for rating variance, placeholder detection, rank advice completeness, and engine linkage.


## v50.2 DB Schema Contract Pack B

- Adds a normalized DB surface for target detail rows: gameplan, main, move, sustain, ultimate, highground, cue, practice, targets, forbidden, and rank.
- Adds a normalized comp row surface for matchup rating, composition tags, key enemy skills, and diagnosis snippets.
- Keeps existing CSV field names compatible instead of forcibly renaming legacy files.
- Adds `tests/owcoach-db-schema-contract-static.cjs` and `npm run check:db-schema-contract`.


## v50.8 Pack F - Ultimate Decision DB

- Adds an explicit ultimate decision DB for all 17 target heroes.
- Composition diagnosis section 6 now uses target-specific ultimate use conditions, wait-for skills, combo timing, bad timing, and target priority.
- Detail diagnosis ultimate cards now use the same decision layer instead of a generic one-line rule.
- Adds `owcoach_ultimate_decision_db_v50_6.csv` as an editable mirror.
- Adds `npm run check:ultimate-decision` static QA.


## v50.8 Pack G - Enemy Skill Wait Windows

- Added concrete enemy skill wait-window rules for all 17 implemented target heroes.
- Added 17 × 51 CSV mirror: `owcoach_enemy_skill_wait_windows_v50_7.csv`.
- Composition diagnosis now shows concrete skill timing before generic peak advice.
- Detail diagnosis now shows per-enemy cue and one-match practice checks.
- Added static QA: `npm run check:skill-wait-windows`.


## v50.9 Pack I - Priority Target Decision DB

- Added priority target decision rules for all 17 implemented target heroes.
- Added 17 × 51 CSV mirror: `owcoach_priority_target_decision_db_v50_8.csv`.
- Composition diagnosis now separates enemies into first-look, pressure-only, late-punish, and do-not-chase groups.
- Detail diagnosis now shows the enemy's priority class and reason.
- Added static QA: `npm run check:priority-targets`.


## v50.9 Pack I - Rank Advice Quality

- Added 867 rank-advice rows for 17 target heroes × 51 enemies.
- Runtime detail diagnosis now prefers the v50.9 five-tier advice DB.
- Added static QA for missing tiers, repeated fallback text, and runtime integration.


## v50.17 Pack Q - Depth Enhancement

Adds per-matchup depth notes for all 17 target heroes and all 51 enemy heroes. The new layer explains what to check before entering, when to commit, how to reset, and what to review after the fight. GitHub reflection remains on hold.


## v50.18 Pack R - Wave Review Loop

Adds one-wave review loops for all 17 target heroes and all 51 enemy heroes. Detail diagnosis now includes goal, review question, success signal, mistake shape, next adjustment, replay marker, and micro drill. Composition diagnosis also includes a compact review summary. GitHub reflection remains on hold.


## v50.19 Diagnosis Result UX Restructure Pack S

- Adds a top-three priority block to composition diagnosis.
- Adds beginner summaries to detail diagnosis.
- Groups long diagnosis output into collapsible sections.
- Keeps Pack A-R data intact while reducing reading load on mobile.
- Adds `tests/owcoach-diagnosis-ux-static.cjs` and `npm run check:diagnosis-ux`.


## v50.20 Pack T - Handoff Readiness

- Adds `handoff_bundle/` for next-chat transfer, QA runbook, pack history, GitHub hold notes, backlog, and file manifest.
- Adds `owcoach_handoff_readiness_contract_v50_20.json`.
- Adds `tests/owcoach-handoff-readiness-static.cjs` and `npm run check:handoff-readiness`.
- Does not change matchup strategy data.
- GitHub reflection remains on hold and Playwright browser QA remains pending for Pack A-T.
