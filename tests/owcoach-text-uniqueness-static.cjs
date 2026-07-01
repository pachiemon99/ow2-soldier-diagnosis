#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { readExpandedCsv } = require('./owcoach-csv-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const csvRel = 'data/shared/owcoach_diagnostic_text_uniqueness_hints_v50_11.csv';
const csvPath = path.join(root, csvRel);
const contractPath = path.join(root, 'data/contracts/owcoach_text_uniqueness_contract_v50_11.json');
if (!fs.existsSync(csvPath)) throw new Error('missing text uniqueness hints CSV');
if (!fs.existsSync(contractPath)) throw new Error('missing text uniqueness contract JSON');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
if (contract.version !== 'v50.11') throw new Error('contract version must be v50.11');
const rows = readExpandedCsv(root, csvRel);
const required = ['target_id','target_ja','enemy_id','enemy_ja','enemy_role','enemy_sub_role','enemy_archetype','specific_focus','unique_cue','avoid_repeat_note','composition_summary_token'];
if (rows.length !== 867) throw new Error(`expected 867 uniqueness rows, got ${rows.length}`);
const targets = new Map();
const tokens = new Set();
const forbidden = /(TODO|TBD|undefined|null|NaN|該当なし|主要アビリティ)/;
for (const row of rows) {
  for (const col of required) if (!(row[col] || '').trim()) throw new Error(`empty ${col} for ${row.target_id}/${row.enemy_id}`);
  if (forbidden.test(Object.values(row).join(' '))) throw new Error(`placeholder text for ${row.target_id}/${row.enemy_id}`);
  if (row.specific_focus.length < 18) throw new Error(`short specific_focus for ${row.target_id}/${row.enemy_id}`);
  if (row.unique_cue.length < 18) throw new Error(`short unique_cue for ${row.target_id}/${row.enemy_id}`);
  if (!targets.has(row.target_id)) targets.set(row.target_id, new Set());
  targets.get(row.target_id).add(row.enemy_id);
  tokens.add(row.composition_summary_token);
}
if (targets.size !== 17) throw new Error(`expected 17 targets, got ${targets.size}`);
for (const [target,set] of targets) if (set.size !== 51) throw new Error(`${target} must have 51 enemy rows, got ${set.size}`);
if (tokens.size < 100) throw new Error(`expected varied composition summary tokens, got ${tokens.size}`);
for (const needle of ['OWC_TEXT_UNIQUENESS_HINTS_DB','owcTextUniquenessHint','owcUniqueTextLines','unique_cue','avoid_repeat_note']) {
  if (!index.includes(needle)) throw new Error(`missing runtime marker: ${needle}`);
}
if (!pkg.scripts['check:text-uniqueness']) throw new Error('missing check:text-uniqueness script');
if (!pkg.scripts['check:syntax'].includes('check:text-uniqueness')) throw new Error('check:syntax does not run Pack K check');
console.log('Text uniqueness static checks passed');
