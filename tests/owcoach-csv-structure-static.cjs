#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { loadManifest, loadHeroRegistry, readCompactCsv, readExpandedCsv } = require('./owcoach-csv-source-utils.cjs');
const root = path.resolve(__dirname, '..');
function fail(msg){ console.error(msg); process.exit(1); }
function must(cond,msg){ if(!cond) fail(msg); }
const manifest = loadManifest(root);
must(manifest.version === 'v50.25_csv_compaction', 'CSV compaction manifest version mismatch');
must(manifest.summary && manifest.summary.bytes_saved > 2500000, 'CSV compaction should save more than 2.5MB');
const registry = loadHeroRegistry(root, manifest);
must(registry.size === 51, `hero registry must have 51 rows, got ${registry.size}`);
for(const id of ['D.Va','Sigma','Ramattra','Illari','Widowmaker','Jetpack Cat']) must(registry.has(id), `hero registry missing ${id}`);
for(const [id,row] of registry){
  must(row.hero_ja && row.role && row.sub_role, `registry row incomplete for ${id}`);
}
let csvCount = 0;
let compactMissing = 0;
for(const rel of Object.keys(manifest.files || {})){
  csvCount++;
  const rows = readCompactCsv(root, rel);
  const expanded = readExpandedCsv(root, rel);
  const meta = manifest.files[rel];
  must(rows.length === meta.row_count, `${rel} row count mismatch`);
  must(expanded.length === meta.row_count, `${rel} expanded row count mismatch`);
  const compactFields = Object.keys(rows[0] || {});
  for(const col of meta.compact_columns || []) must(compactFields.includes(col), `${rel} missing compact column ${col}`);
  for(const col of meta.registry_removed_columns || []){
    if(compactFields.includes(col)) compactMissing++;
    must(Object.prototype.hasOwnProperty.call(expanded[0] || {}, col), `${rel} does not hydrate registry column ${col}`);
  }
  for(const col of Object.keys(meta.constant_columns || {})){
    must(!compactFields.includes(col), `${rel} constant column should be stored in manifest: ${col}`);
    must(Object.prototype.hasOwnProperty.call(expanded[0] || {}, col), `${rel} does not hydrate constant column ${col}`);
  }
  for(const [alias,source] of Object.entries(meta.alias_columns || {})){
    must(!compactFields.includes(alias), `${rel} alias column should be removed: ${alias}`);
    must(compactFields.includes(source) || Object.prototype.hasOwnProperty.call(meta.constant_columns || {}, source), `${rel} alias source missing: ${source}`);
    must(Object.prototype.hasOwnProperty.call(expanded[0] || {}, alias), `${rel} does not hydrate alias ${alias}`);
  }
}
must(csvCount >= 50, `expected at least 50 compacted CSV files, got ${csvCount}`);
must(compactMissing === 0, 'registry-derived fields should not remain in compact CSV headers');
const layoutDoc = path.join(root, 'docs/audits/OWCOACH_CSV_STRUCTURE_AUDIT_v50_25.md');
must(fs.existsSync(layoutDoc), 'missing CSV structure audit doc');
console.log('CSV structure compaction static checks passed');
