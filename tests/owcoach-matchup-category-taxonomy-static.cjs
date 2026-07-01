#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const { readExpandedCsv } = require('./owcoach-csv-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));
const csvRel = 'data/shared/owcoach_matchup_category_taxonomy_db_v50_12.csv';
const csvPath = path.join(root, csvRel);
const contractPath = path.join(root, 'data/contracts/owcoach_matchup_category_taxonomy_contract_v50_12.json');
if (!fs.existsSync(csvPath)) throw new Error('missing matchup category taxonomy CSV');
if (!fs.existsSync(contractPath)) throw new Error('missing matchup category contract JSON');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
if (contract.version !== 'v50.12') throw new Error('contract version must be v50.12');
const rows = readExpandedCsv(root, csvRel);
const required = ['target_id','target_ja','enemy_id','enemy_ja','enemy_role','enemy_sub_role','primary_category','secondary_category','ui_badge_label','category_description','category_reason','recommended_response','avoid_response','practice_focus','taxonomy_version'];
if (rows.length !== 867) throw new Error(`expected 867 category rows, got ${rows.length}`);
const allowed = new Set(contract.allowed_primary_categories || []);
const targets = new Map();
const categories = new Map();
const forbidden = /(TODO|TBD|undefined|null|NaN|該当なし|主要アビリティ)/;
for (const row of rows) {
  for (const col of required) {
    if (!(row[col] || '').trim()) throw new Error(`empty ${col} for ${row.target_id}/${row.enemy_id}`);
  }
  if (!allowed.has(row.primary_category)) throw new Error(`unknown category: ${row.primary_category}`);
  if (forbidden.test(Object.values(row).join(' '))) throw new Error(`placeholder text for ${row.target_id}/${row.enemy_id}`);
  if (row.recommended_response.length < 28) throw new Error(`short recommended_response for ${row.target_id}/${row.enemy_id}`);
  if (row.avoid_response.length < 22) throw new Error(`short avoid_response for ${row.target_id}/${row.enemy_id}`);
  if (!targets.has(row.target_id)) targets.set(row.target_id, new Set());
  targets.get(row.target_id).add(row.enemy_id);
  categories.set(row.primary_category, (categories.get(row.primary_category)||0)+1);
}
if (targets.size !== 17) throw new Error(`expected 17 targets, got ${targets.size}`);
for (const [target,set] of targets) {
  if (set.size !== 51) throw new Error(`${target} must have 51 enemy rows, got ${set.size}`);
}
if (categories.size < 8) throw new Error(`expected at least 8 used categories, got ${categories.size}`);
for (const requiredCategory of ['空中対策','フランカー対策','長射線管理','救助崩し','高耐久削り','範囲・設置物処理']) {
  if (!categories.has(requiredCategory)) throw new Error(`category not used: ${requiredCategory}`);
}
const mustContain = [
  'OWC_MATCHUP_CATEGORY_DB',
  'owcMatchupCategory',
  'owcDetailMatchupCategoryHtml',
  'owcCompositionCategorySummaryLines',
  'owcCategorySpecificSummary',
  'owcCategorySkillText',
  'owcCategorySkillNames',
  '対面カテゴリ',
  '対面カテゴリ要約',
  'd.categorySummary=typeof owcCompositionCategorySummaryLines',
  'owcDetailMatchupCategoryHtml(h,d,target())'
];
for (const needle of mustContain) {
  if (!index.includes(needle)) throw new Error(`missing runtime marker: ${needle}`);
}
if (index.includes("map(x=>`${x.label}：${x.heroes.join('、')}。${x.responses[0]}`)")) {
  throw new Error('composition category summary must not reuse the first generic recommended_response');
}
if (!index.includes('heroRefs.push(h)')) throw new Error('composition category summary must keep hero refs for skill-specific advice');
if (!index.includes('owcCategorySkillNames(hero')) throw new Error('missing skill-name resolver for category summary');
if (!pkg.scripts['check:matchup-categories']) throw new Error('missing check:matchup-categories script');
if (!pkg.scripts['check:syntax'].includes('check:matchup-categories')) throw new Error('check:syntax does not run Pack L check');
console.log('Matchup category taxonomy static checks passed');
