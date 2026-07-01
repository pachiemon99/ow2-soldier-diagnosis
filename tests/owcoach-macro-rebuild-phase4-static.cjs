const fs = require('fs');
const path = require('path');
const { assertAppSourceSyntax } = require('./owcoach-app-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function fail(msg){ console.error(msg); process.exit(1); }
const required = [
  'OWC_MACRO_REBUILD_PHASE4_APPLIED',
  'owcBuildDetailFunctionModel',
  'owcRenderPhase4DetailBrief',
  'owcPhase4DetailBrief',
  'owcDetailFunctionCards',
  '構成内の役割',
  '安全な席',
  '先に止める線',
  '待つスキル',
  '成立役・シナジー確認',
  '退路',
  '起点役',
  '支援線',
  '設置物・エリア制圧',
  'owc-macro-phase4-style'
];
for (const token of required) if (!html.includes(token)) fail(`missing macro phase4 token: ${token}`);
const phaseStart = html.indexOf('/* v50.31 WIP Phase 4');
const phaseEnd = html.indexOf('</script>', phaseStart);
if (phaseStart < 0 || phaseEnd < 0) fail('macro phase4 script block not found');
const phaseBlock = html.slice(phaseStart, phaseEnd);
for (const token of ['タンクだけ見て', '1体だけ見て', 'サブアングル', '横角']) {
  if (phaseBlock.includes(token)) fail(`forbidden macro phase4 wording leaked: ${token}`);
}
const notes = JSON.parse(fs.readFileSync(path.join(root, 'data/shared/owcoach_macro_rebuild_phase4_notes_v50_31_wip.json'), 'utf8'));
if (notes.phase !== 'macro_rebuild_phase4') fail('unexpected phase4 notes phase');
if (notes.package_version !== '50.31.0') fail('unexpected phase4 package version');
if (!Array.isArray(notes.display_order) || notes.display_order.length !== 5) fail('unexpected phase4 display order');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!['50.31.0','50.32.0','50.33.0'].includes(pkg.version)) fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts['check:macro-rebuild-phase4']) fail('missing phase4 npm script');
assertAppSourceSyntax(root);
console.log('Macro rebuild phase4 static checks passed');
