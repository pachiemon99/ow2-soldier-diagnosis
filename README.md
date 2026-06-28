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
