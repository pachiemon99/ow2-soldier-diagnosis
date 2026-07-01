const fs = require('fs');
const path = require('path');
const { readExpandedCsv } = require('./owcoach-csv-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const contractPath = path.join(root, 'data/contracts/owcoach_priority_target_contract_v50_8.json');
const csvRel = 'data/shared/owcoach_priority_target_decision_db_v50_8.csv';
const csvPath = path.join(root, csvRel);
if (!fs.existsSync(contractPath)) throw new Error('Missing priority target contract JSON.');
if (!fs.existsSync(csvPath)) throw new Error('Missing priority target CSV mirror.');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const ids = contract.targets || [];
if (ids.length !== 17) throw new Error(`Expected 17 target heroes, got ${ids.length}.`);
for (const token of ['OWC_PRIORITY_TARGET_PROFILES','OWC_PRIORITY_TARGET_WEIGHTS','owcPriorityScore','owcPriorityClass','owcPriorityTargetOrderLines','owcPriorityTargetPillTargets','owcDetailPriorityTargets','owcPrioritySkillPlan','owcPriorityGroupSkillPlan']) {
  if (!html.includes(token)) throw new Error(`Missing ${token} in index.html.`);
}
for (const id of ids) {
  const re = new RegExp(`['"]${id}['"]\\s*:`);
  if (!re.test(html)) throw new Error(`Missing priority target profile for ${id}.`);
}
if (!html.includes('d.order=owcPriorityTargetOrderLines(selectedEnemy(),commonComp,target()).concat(owcSynergyOrderLines(commonComp))')) throw new Error('Composition order does not use owcPriorityTargetOrderLines.');
if (!html.includes('d.targets=owcPriorityTargetPillTargets(selectedEnemy(),target());')) throw new Error('Composition target pills do not use owcPriorityTargetPillTargets.');
const prioritySource = html.slice(html.indexOf('function owcPrioritySkillPlan'), html.indexOf('function owcPriorityTargetPillTargets'));
for (const phrase of ['回復・防御・位置移動を使わせる', '深追いせず回復・防御を使わせる', '移動・防御・救助を使った後']) {
  if (prioritySource.includes(phrase)) throw new Error(`Generic priority phrase remains in visible priority renderer: ${phrase}`);
}
if (!html.includes("if(typeof owcDetailPriorityTargets==='function')d.targets=owcDetailPriorityTargets(h,d,target());")) throw new Error('Detail view does not use owcDetailPriorityTargets.');
const rows = readExpandedCsv(root, csvRel);
if (rows.length !== (contract.csv_rows_expected || 867)) throw new Error(`Expected ${contract.csv_rows_expected || 867} CSV rows, got ${rows.length}.`);
for (const field of contract.required_csv_fields || []) if (!Object.prototype.hasOwnProperty.call(rows[0] || {}, field)) throw new Error(`CSV missing logical field ${field}.`);
const allowed = new Set(contract.allowed_priority_classes || []);
const classCounts = Object.fromEntries([...allowed].map(x => [x, 0]));
for (const row of rows) {
  const cls = row.priority_class;
  if (!allowed.has(cls)) throw new Error(`Invalid priority class: ${cls}`);
  classCounts[cls] += 1;
}
for (const cls of allowed) if (!classCounts[cls]) throw new Error(`No CSV rows for priority class ${cls}.`);
for (const id of ids) {
  const count = rows.filter(row => row.target_id === id).length;
  if (count !== 51) throw new Error(`Expected 51 priority rows for ${id}, got ${count}.`);
}
console.log('Priority target decision static checks passed');
