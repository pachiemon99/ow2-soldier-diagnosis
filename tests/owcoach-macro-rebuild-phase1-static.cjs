const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function fail(msg){ console.error(msg); process.exit(1); }
const required = [
  'OWC_MACRO_REBUILD_PHASE1_APPLIED',
  '構成読み取り 2.0',
  'Dive Save',
  'Isolation Dive',
  'Poke Air',
  'Split Angle',
  'Rush Sustain',
  'Heavy Sustain',
  'Save Cycle',
  'Anti Dive Trap',
  'Objective Fortress',
  'Balanced Tempo',
  'Winston',
  'Tracer',
  'Reinhardt',
  'Lúcio',
  'Mercy',
  'Pharah'
];
for (const token of required) if (!html.includes(token)) fail(`missing macro phase1 token: ${token}`);
const phaseStart = html.indexOf('/* v50.29 WIP Phase 1');
const phaseEnd = html.indexOf('</script>', phaseStart);
if (phaseStart < 0 || phaseEnd < 0) fail('macro phase1 script block not found');
const phaseBlock = html.slice(phaseStart, phaseEnd);
const forbidden = ['短く'+'削って', '守りを'+'使わせる', '入り'+'口'];
for (const token of forbidden) if (phaseBlock.includes(token)) fail(`forbidden macro wording leaked: ${token}`);
const notes = JSON.parse(fs.readFileSync(path.join(root, 'data/shared/owcoach_macro_rebuild_phase1_notes_v50_29_wip.json'), 'utf8'));
if (notes.archetype_count !== 10) fail('unexpected macro archetype count');
if (notes.pair_synergy_count < 15) fail('pair synergy coverage too small');
console.log('Macro rebuild phase1 static checks passed');
