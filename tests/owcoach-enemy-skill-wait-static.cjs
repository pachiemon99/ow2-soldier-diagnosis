const fs = require('fs');
const path = require('path');
const { readExpandedCsv } = require('./owcoach-csv-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const contractPath = path.join(root, 'data/contracts/owcoach_enemy_skill_wait_contract_v50_7.json');
const csvRel = 'data/shared/owcoach_enemy_skill_wait_windows_v50_7.csv';
const csvPath = path.join(root, csvRel);
if (!fs.existsSync(contractPath)) throw new Error('Missing enemy skill wait contract JSON.');
if (!fs.existsSync(csvPath)) throw new Error('Missing enemy skill wait CSV mirror.');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const ids = contract.targets || [];
if (ids.length !== 17) throw new Error(`Expected 17 target heroes, got ${ids.length}.`);
for (const token of ['OWC_SKILL_WAIT_TARGET_RULES','owcSkillWaitTargetRule','owcSkillWaitWindow','owcSkillWaitCompositionLines','owcSkillWaitForbiddenLines','owcDetailSkillWaitText','owcSkillWaitLineForHero']) {
  if (!html.includes(token)) throw new Error(`Missing ${token} in index.html.`);
}
for (const id of ids) {
  const re = new RegExp(`['"]${id}['"]\\s*:`);
  if (!re.test(html)) throw new Error(`Missing skill wait target rule for ${id}.`);
}
for (const field of contract.required_target_rule_fields || []) if (!html.includes(`${field}`)) throw new Error(`Missing skill-wait target field ${field}.`);
if (!html.includes('d.peak=owcSkillWaitCompositionLines(selectedEnemy(),commonComp).concat(owcSynergyPeakLines(commonComp)).map(sanitizeForTarget);')) throw new Error('Composition diagnosis does not prepend skill-wait timing lines.');
if (!html.includes("if(typeof owcDetailSkillWaitText==='function'){const wait=owcDetailSkillWaitText(h,d);d.cue=wait.cue;d.practice=wait.practice;}")) throw new Error('Detail diagnosis does not use owcDetailSkillWaitText.');
if (!html.includes('d.forbidden=owcSkillWaitForbiddenLines(selectedEnemy()).concat(owcSynergyForbiddenLines(commonComp)')) throw new Error('Composition forbidden lines do not include skill-wait guardrails.');
const rows = readExpandedCsv(root, csvRel);
if (rows.length !== (contract.csv_rows_expected || 867)) throw new Error(`Expected ${contract.csv_rows_expected || 867} CSV rows, got ${rows.length}.`);
for (const field of contract.required_csv_fields || []) if (!Object.prototype.hasOwnProperty.call(rows[0] || {}, field)) throw new Error(`CSV missing logical field ${field}.`);
for (const id of ids) {
  const count = rows.filter(row => row.target_id === id).length;
  if (count !== 51) throw new Error(`Expected 51 skill-wait rows for ${id}, got ${count}.`);
}
const body = rows.map(row => Object.values(row).join(' ')).join('\n');
for (const term of contract.forbidden_placeholder_terms || []) if (body.includes(term)) throw new Error(`CSV still contains placeholder timing term: ${term}`);
console.log('Enemy skill wait-window static checks passed');
