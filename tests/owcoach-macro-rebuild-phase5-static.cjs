const fs = require('fs');
const path = require('path');
const { assertAppSourceSyntax } = require('./owcoach-app-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function fail(msg){ console.error(msg); process.exit(1); }
const required = [
  'OWC_MACRO_REBUILD_PHASE5_APPLIED',
  'owcBuildMacroCoreSynthesis',
  'owcDetectTrioCores',
  'owcRenderMacroCoreSynthesis',
  'TRIO_CORES',
  '完成コア検出 / 5人構成合成',
  '敵5人の完成形',
  '切るべき配線',
  '主勝ち筋 / 副勝ち筋',
  'Winston + Tracer + Ana',
  'ラインハルト＋メイ＋ルシオ',
  'シグマ＋バスティオン＋バティスト',
  'ファラ＋マーシー＋D.Va',
  'ゲンジ＋アナ＋キリコ',
  'ブリギッテ＋アナ＋ゼニヤッタ',
  'owcMacroPhase5',
  'owc-macro-phase5-style'
];
for (const token of required) if (!html.includes(token)) fail(`missing macro phase5 token: ${token}`);
const phaseStart = html.indexOf('/* v50.32 WIP Phase 5');
const phaseEnd = html.indexOf('</script>', phaseStart);
if (phaseStart < 0 || phaseEnd < 0) fail('macro phase5 script block not found');
const phaseBlock = html.slice(phaseStart, phaseEnd);
for (const token of ['サブアングル', '横角', 'ヘリックス', 'バイザー']) {
  if (phaseBlock.includes(token)) fail(`forbidden macro phase5 wording leaked: ${token}`);
}
const notes = JSON.parse(fs.readFileSync(path.join(root, 'data/shared/owcoach_macro_rebuild_phase5_notes_v50_32_wip.json'), 'utf8'));
if (notes.phase !== 'macro_rebuild_phase5') fail('unexpected phase5 notes phase');
if (notes.package_version !== '50.32.0') fail('unexpected phase5 package version');
if (!Array.isArray(notes.trio_core_examples) || notes.trio_core_examples.length < 6) fail('missing trio core examples');
if (!Array.isArray(notes.display_order) || !notes.display_order.includes('切るべき配線')) fail('missing phase5 display order');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!['50.32.0','50.33.0'].includes(pkg.version)) fail(`package version mismatch: ${pkg.version}`);
if (!pkg.scripts['check:macro-rebuild-phase5']) fail('missing phase5 npm script');
assertAppSourceSyntax(root);
console.log('Macro rebuild phase5 static checks passed');
