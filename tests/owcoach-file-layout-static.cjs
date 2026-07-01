const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function fail(msg){ console.error(msg); process.exit(1); }
function exists(rel){ return fs.existsSync(path.join(root, rel)); }
const requiredDirs = [
  'data/targets',
  'data/contracts',
  'data/audits',
  'data/shared',
  'data/reports',
  'docs/contracts',
  'docs/packs',
  'docs/audits',
  'diagnosis_text',
  'handoff_bundle',
  'tests'
];
for (const dir of requiredDirs) if (!exists(dir)) fail(`missing layout directory: ${dir}`);
const rootFiles = fs.readdirSync(root).filter(name => fs.statSync(path.join(root, name)).isFile());

if (exists('_combined.js')) fail('_combined.js should not be committed; extract app source from index.html during QA instead');
if (!exists('tests/owcoach-app-source-syntax-static.cjs')) fail('missing app source syntax extraction check');
if (rootFiles.length > 16) fail(`too many root files after layout optimization: ${rootFiles.length}`);
const targetDirs = fs.readdirSync(path.join(root, 'data/targets')).filter(name => fs.statSync(path.join(root, 'data/targets', name)).isDirectory());
if (targetDirs.length !== 17) fail(`target data directory count ${targetDirs.length}, expected 17`);
for (const slug of targetDirs) {
  if (!exists(`data/targets/${slug}/${slug}_comp_diagnosis_db_v1.csv`)) fail(`missing comp CSV for ${slug}`);
  if (!exists(`data/targets/${slug}/${slug}_hero_db_v1_full_all_roles.csv`)) fail(`missing detail CSV for ${slug}`);
}
const sharedRequired = [
  'data/shared/owcoach_priority_target_decision_db_v50_8.csv',
  'data/shared/owcoach_matchup_category_taxonomy_db_v50_12.csv',
  'data/shared/owcoach_feature_entitlement_db_v50_13.csv',
  'data/shared/owcoach_matchup_reason_db_v50_10.csv',
  'data/shared/owcoach_wave_review_loop_db_v50_18.csv',
  'data/shared/owcoach_hero_registry_v50_25.csv',
  'data/shared/owcoach_csv_compaction_manifest_v50_25.json'
];
for (const rel of sharedRequired) if (!exists(rel)) fail(`missing shared DB: ${rel}`);
const contractRequired = [
  'data/contracts/owcoach_handoff_readiness_contract_v50_20.json',
  'docs/contracts/HANDOFF_READINESS_CONTRACT_v50_20.md',
  'docs/packs/README_PACK_U_DIAGNOSIS_TEXT_STRUCTURE.md',
  'docs/packs/README_PACK_W_CSV_SOURCE_COMPACTION.md',
  'docs/audits/OWCOACH_CSV_STRUCTURE_AUDIT_v50_25.md',
  'data/reports/validation_report.json'
];
for (const rel of contractRequired) if (!exists(rel)) fail(`missing moved contract/doc: ${rel}`);
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
if (!['50.23.0','50.24.0','50.26.0','50.27.0','50.28.0','50.29.0','50.30.0','50.31.0','50.32.0','50.33.0'].includes(pkg.version)) fail(`package version mismatch: ${pkg.version}`);
console.log('File layout optimization static checks passed');
