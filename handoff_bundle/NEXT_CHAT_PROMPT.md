OW Coach 引継ぎメモ

現在の最新作業物は v50.20 Pack T: Handoff Readiness です。
GitHubへの反映は v50.0.0 以降しばらく保留しています。

対象リポジトリ:
pachiemon99/OW-Coach

GitHub上の状態:
- v50.0.0 タグは作成済み
- v50.0.0 と main は同一コミットで差分0
- main は v50安定ライン
- Node.js 20 deprecated 警告は解消済み
- browser-qa は v50時点で成功済み

ローカル作業の最新ZIP:
owcoach_v50_20_handoff_readiness_pack_t.zip

最新パック:
- Pack S: 診断結果UX整理
- Pack T: 引継ぎセット、QA整理、ファイルマニフェスト、次チャット用プロンプト、GitHub反映手順、静的QA追加

v50以降のPack A〜T概要:
A 追加4キャラDB改善
B DBスキーマ統一
C 全17キャラデータ統一
D 敵5人合成ロジック
E 構成診断文品質改善
F アルティメット判断DB
G 敵スキル待ち条件
H 優先攻撃対象DB
I ランク別アドバイス品質統一
J 有利・不利理由明文化
K 診断文重複削減
L 対面カテゴリ追加
M 無料 / 有料切り分けフラグ
N 英語表示パリティ監査
O DB品質スコア監査
P 品質改善・C判定解消
Q 深掘り説明補強
R 試合後の振り返りループ
S 診断結果UX整理
T 引継ぎ・QA整理セット

重要な運用方針:
- GitHub反映はまだしない。ユーザーが明示するまで保留。
- ZIP生成は「生成して」「ZIPにして」「出力して」など明示がある時のみ。
- PlaywrightブラウザQAはPack A〜Tでは未実施。GitHub反映前にActionsで確認する。
- index.html単体プレビューリンクは不要。
- 修正相談段階ではZIP生成しない。
- 文章はスラングや曖昧語を避ける。
- 月額300円の商品化を見据え、無料 / プレビュー / 有料の設計はPack MでDBタグ化済み。ただし課金ロックは未実装。

次にやるなら:
1. Pack Tの中身を確認する。
2. GitHub反映前なら `QA_AND_GITHUB_REFLECTION_RUNBOOK.md` の順に静的QAを確認する。
3. 追加改善なら `NEXT_WORK_BACKLOG.md` の優先順位から選ぶ。
4. GitHub反映を再開する場合は、まずブランチを切ってPack Tを反映し、Actionsのbrowser-qaを確認する。
