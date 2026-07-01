# diagnosis_text

診断結果として画面に出る文章を編集しやすくするためのデータ置き場です。

## 目的

巨大な `index.html` の中に文章を直接書き足すのではなく、診断文を JSON データとして分離します。

## 主に編集するファイル

- `diagnosis_text/ja/composition_profiles.json`
  - 構成診断の「開幕行動」「高台運用」「ピーク」「アルティメット」「絶対にやってはいけないこと」を編集します。
- `diagnosis_text/ja/composition_win_conditions.json`
  - 「構成の勝ち筋」を編集します。
- `diagnosis_text/ja/target_role_templates.json`
  - 診断対象ヒーローごとの「自分の役割」を編集します。
- `diagnosis_text/ja/section_titles.json`
  - 見出し名を編集します。
- `diagnosis_text/rewrite_rules.json`
  - 使用を避けたい表現、推奨表現を管理します。

## プレースホルダー

文章内では次の置換語を使えます。

- `{firstNames}`: 最初に見る敵グループ
- `{secondNames}`: 支援・救助側の敵グループ
- `{axis}`: 敵5人の圧力軸
- `{diveNames}` / `{saveNames}` / `{longNames}` / `{airNames}` など: 構成カテゴリ別の敵名
- `{targetJa}` / `{primary}` / `{burst}` / `{sustain}` / `{mobility}`: 診断対象ヒーローの表示名・スキル文脈

## 反映の考え方

アプリは `diagnosis_text/bundle.json` を読み込める場合はそれを優先します。読み込めない場合は、`index.html` 内の埋め込み版を使います。

編集後は `npm run check:diagnosis-text-structure` で構造と禁止表現を確認します。
