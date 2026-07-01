const fs = require('fs');
const path = require('path');
const { assertAppSourceSyntax } = require('./owcoach-app-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function fail(msg){ console.error(msg); process.exit(1); }
const required = [
  'OWC_MACRO_REBUILD_PHASE3_APPLIED',
  'owcBuildPhase3CommandModel',
  'owcRenderPhase3Composition',
  '指令書表示',
  '敵の勝ち筋',
  '自分の席',
  '止める線',
  '攻撃優先順位',
  'スキル待ち・ピーク条件',
  '絶対NG',
  'owcPhase3CommandGrid',
  'owcPhase3Flow',
  'owc-macro-phase3-style'
];
for (const token of required) if (!html.includes(token)) fail(`missing macro phase3 token: ${token}`);
const phaseStart = html.indexOf('/* v50.30 WIP Phase 3');
const phaseEnd = html.indexOf('</script>', phaseStart);
if (phaseStart < 0 || phaseEnd < 0) fail('macro phase3 script block not found');
const phaseBlock = html.slice(phaseStart, phaseEnd);
const flowStart = phaseBlock.indexOf('owcPhase3Flow');
const flowEnd = phaseBlock.indexOf('</div>', flowStart);
if (flowStart < 0 || flowEnd < 0) fail('phase3 flow block not found');
const flowBlock = phaseBlock.slice(flowStart, flowEnd);
const orderTokens = ['敵の勝ち筋','自分の席','止める線','攻撃優先順位','スキル待ち','絶対NG'];
let last = -1;
for (const token of orderTokens) {
  const idx = flowBlock.indexOf(token);
  if (idx < 0) fail(`missing phase3 flow token: ${token}`);
  if (idx < last) fail(`phase3 flow token out of order: ${token}`);
  last = idx;
}
for (const token of ['短く'+'削って', '守りを'+'使わせる', 'サブアングル', '横角']) {
  if (phaseBlock.includes(token)) fail(`forbidden macro phase3 wording leaked: ${token}`);
}
const notes = JSON.parse(fs.readFileSync(path.join(root, 'data/shared/owcoach_macro_rebuild_phase3_notes_v50_30_wip.json'), 'utf8'));
if (notes.phase !== 'macro_rebuild_phase3') fail('unexpected phase3 notes phase');
if (!Array.isArray(notes.display_order) || notes.display_order.length !== 6) fail('unexpected phase3 display order');
if (notes.package_version !== '50.30.0') fail('unexpected phase3 package version');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!['50.30.0','50.31.0','50.32.0','50.33.0'].includes(pkg.version)) fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts['check:macro-rebuild-phase3']) fail('missing phase3 npm script');
assertAppSourceSyntax(root);
console.log('Macro rebuild phase3 static checks passed');
