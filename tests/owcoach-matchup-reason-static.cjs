#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { readExpandedCsv } = require('./owcoach-csv-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const csvRel = 'data/shared/owcoach_matchup_reason_db_v50_10.csv';
const csvPath = path.join(root, csvRel);
if (!fs.existsSync(csvPath)) throw new Error('missing owcoach_matchup_reason_db_v50_10.csv');
const rows = readExpandedCsv(root, csvRel);
const required = ['target_id','target_ja','enemy_id','enemy_ja','enemy_role','enemy_sub_role','matchup_rating','verdict','advantage_reason','disadvantage_reason','win_condition','loss_condition','play_priority','confidence'];
if (rows.length !== 867) throw new Error(`expected 867 data rows, got ${rows.length}`);
const targets = new Set();
const enemiesByTarget = new Map();
const forbidden = /(TODO|TBD|主要アビリティ|移動スキル使用直後|防御スキル使用後|救助スキル使用後|該当なし|undefined|null|NaN)/;
for (const row of rows) {
  const target=row.target_id, enemy=row.enemy_id;
  targets.add(target);
  if(!enemiesByTarget.has(target)) enemiesByTarget.set(target,new Set());
  enemiesByTarget.get(target).add(enemy);
  for (const col of required) {
    const v = row[col] || '';
    if (!String(v).trim()) throw new Error(`empty ${col} for ${target}/${enemy}`);
    if (['advantage_reason','disadvantage_reason','win_condition','loss_condition'].includes(col) && forbidden.test(v)) {
      throw new Error(`placeholder text in ${col} for ${target}/${enemy}: ${v}`);
    }
  }
  const rating = Number(row.matchup_rating);
  if (!Number.isFinite(rating) || rating < 0 || rating > 10) throw new Error(`bad rating for ${target}/${enemy}`);
}
if (targets.size !== 17) throw new Error(`expected 17 targets, got ${targets.size}`);
for (const [target,set] of enemiesByTarget) {
  if (set.size !== 51) throw new Error(`expected 51 enemies for ${target}, got ${set.size}`);
}
const mustContain = ['OWC_MATCHUP_REASON_DB','owcDetailMatchupReasonHtml','owcCompositionMatchupReasonLines','有利 / 不利理由','相性理由','matchup_reason_contract'];
for (const needle of mustContain) if (!index.includes(needle)) throw new Error(`missing runtime marker: ${needle}`);
if (!pkg.scripts['check:matchup-reasons']) throw new Error('missing check:matchup-reasons script');
if (!pkg.scripts['check:syntax'].includes('check:matchup-reasons')) throw new Error('check:syntax does not run Pack J check');
console.log('Matchup reason clarity static checks passed');
