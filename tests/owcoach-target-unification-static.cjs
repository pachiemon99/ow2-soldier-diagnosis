const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const match = html.match(/const OWCOACH_DATA = (.*?);\n/);
if (!match) throw new Error('OWCOACH_DATA not found');
const data = JSON.parse(match[1]);
const requiredTargets = ['Soldier76','Sojourn','Cassidy','Ashe','Reaper','Symmetra','Hanzo','Torbjorn','Bastion','Mei','Sombra','Tracer','Genji','Junkrat','Pharah','Echo','Emre'];
const slugs = {Soldier76:'soldier76',Sojourn:'sojourn',Cassidy:'cassidy',Ashe:'ashe',Reaper:'reaper',Symmetra:'symmetra',Hanzo:'hanzo',Torbjorn:'torbjorn',Bastion:'bastion',Mei:'mei',Sombra:'sombra',Tracer:'tracer',Genji:'genji',Junkrat:'junkrat',Pharah:'pharah',Echo:'echo',Emre:'emre'};
const requiredMeta = ['target_id','target_ja','data_source','canonical_source','engine_id','engine_family','csv_comp_file','csv_detail_file','comp_db_count','detail_db_count','normalization_contract'];
const requiredEngine = ['id','family','version','canonical_registry_key'];
function countRows(db){return Object.values(db || {}).filter(v => v && typeof v === 'object' && !Array.isArray(v)).length;}
if (JSON.stringify(data.metadata.targets) !== JSON.stringify(requiredTargets)) throw new Error('metadata.targets is not canonical');
for (const needle of ['CANONICAL_TARGET_IDS','buildTargetDataRegistry','TARGET_ENGINE_REGISTRY','getTargetEngine(target())']) {
  if (!html.includes(needle)) throw new Error(`${needle} missing from index.html`);
}
if (html.includes("target()==='Sojourn'?SojournEngine")) throw new Error('engine selection still uses chained target conditional');
const manifest = data.manifests && data.manifests.target_unification_manifest;
if (!manifest || manifest.version !== 'v50_3_target_unification') throw new Error('target unification manifest missing');
for (const targetId of requiredTargets) {
  const t = data.targets[targetId];
  if (!t) throw new Error(`${targetId} target block missing`);
  for (const key of requiredMeta) if (!(key in (t.meta || {}))) throw new Error(`${targetId} meta.${key} missing`);
  for (const key of requiredEngine) if (!(key in (t.engine || {}))) throw new Error(`${targetId} engine.${key} missing`);
  if (t.meta.target_id !== targetId) throw new Error(`${targetId} meta.target_id mismatch`);
  if (t.rank_advice_mode !== 'five_tiers') throw new Error(`${targetId} rank_advice_mode not unified`);
  const compCount = countRows(t.comp_db);
  const detailCount = countRows(t.detail_db);
  if (compCount !== 51) throw new Error(`${targetId} comp_db count ${compCount}, expected 51`);
  if (detailCount !== 51) throw new Error(`${targetId} detail_db count ${detailCount}, expected 51`);
  if (t.meta.comp_db_count !== compCount) throw new Error(`${targetId} comp_db_count metadata mismatch`);
  if (t.meta.detail_db_count !== detailCount) throw new Error(`${targetId} detail_db_count metadata mismatch`);
  const compCsv = path.join(ROOT, `${slugs[targetId]}_comp_diagnosis_db_v1.csv`);
  const detailCsv = path.join(ROOT, `${slugs[targetId]}_hero_db_v1_full_all_roles.csv`);
  if (!fs.existsSync(compCsv)) throw new Error(`${targetId} comp CSV missing: ${compCsv}`);
  if (!fs.existsSync(detailCsv)) throw new Error(`${targetId} detail CSV missing: ${detailCsv}`);
  const registryRow = manifest.targets.find(x => x.target_id === targetId);
  if (!registryRow) throw new Error(`${targetId} manifest row missing`);
  if (registryRow.engine_id !== t.meta.engine_id) throw new Error(`${targetId} manifest engine_id mismatch`);
}
console.log('Target unification static checks passed');
