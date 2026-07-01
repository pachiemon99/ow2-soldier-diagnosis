const fs = require('fs');
const path = require('path');
const { assertAppSourceSyntax } = require('./owcoach-app-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function fail(msg){ console.error(msg); process.exit(1); }
const required = [
  'OWC_MACRO_REBUILD_PHASE2_APPLIED',
  'owcBuildMacroDecisionPlan',
  '診断スコア連動',
  '進入後返し優先',
  '孤立防止優先',
  '上下射線分解優先',
  'クロスファイア遮断優先',
  '角管理・引き撃ち優先',
  '支援線崩し優先',
  '救助消費から二手目優先',
  '設置物前処理優先',
  '退路・回復線遮断優先',
  '起点分解優先',
  'phase2_score_bias',
  'macro_phase2',
  'owc-macro-phase2-style'
];
for (const token of required) if (!html.includes(token)) fail(`missing macro phase2 token: ${token}`);
const phaseStart = html.indexOf('/* v50.29 WIP Phase 2');
const phaseEnd = html.indexOf('</script>', phaseStart);
if (phaseStart < 0 || phaseEnd < 0) fail('macro phase2 script block not found');
const phaseBlock = html.slice(phaseStart, phaseEnd);
for (const token of ['短く'+'削って', '守りを'+'使わせる', 'サブアングル', '横角']) {
  if (phaseBlock.includes(token)) fail(`forbidden macro phase2 wording leaked: ${token}`);
}
const notes = JSON.parse(fs.readFileSync(path.join(root, 'data/shared/owcoach_macro_rebuild_phase2_notes_v50_29_wip.json'), 'utf8'));
if (notes.phase2_rule_count !== 10) fail('unexpected phase2 rule count');
if (notes.target_role_hint_count !== 17) fail('unexpected target role hint count');
assertAppSourceSyntax(root);
console.log('Macro rebuild phase2 static checks passed');
