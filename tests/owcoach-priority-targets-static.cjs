const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const contractPath = path.join(root, 'owcoach_priority_target_contract_v50_8.json');
const csvPath = path.join(root, 'owcoach_priority_target_decision_db_v50_8.csv');
if (!fs.existsSync(contractPath)) throw new Error('Missing priority target contract JSON.');
if (!fs.existsSync(csvPath)) throw new Error('Missing priority target CSV mirror.');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const ids = contract.targets || [];
if (ids.length !== 17) throw new Error(`Expected 17 target heroes, got ${ids.length}.`);
for (const token of [
  'OWC_PRIORITY_TARGET_PROFILES',
  'OWC_PRIORITY_TARGET_WEIGHTS',
  'owcPriorityScore',
  'owcPriorityClass',
  'owcPriorityTargetOrderLines',
  'owcPriorityTargetPillTargets',
  'owcDetailPriorityTargets'
]) {
  if (!html.includes(token)) throw new Error(`Missing ${token} in index.html.`);
}
for (const id of ids) {
  const re = new RegExp(`['"]${id}['"]\s*:`);
  if (!re.test(html)) throw new Error(`Missing priority target profile for ${id}.`);
}
if (!html.includes('d.order=owcPriorityTargetOrderLines(selectedEnemy(),commonComp,target()).concat(owcSynergyOrderLines(commonComp))')) {
  throw new Error('Composition order does not use owcPriorityTargetOrderLines.');
}
if (!html.includes('d.targets=owcPriorityTargetPillTargets(selectedEnemy(),target());')) {
  throw new Error('Composition target pills do not use owcPriorityTargetPillTargets.');
}
if (!html.includes("if(typeof owcDetailPriorityTargets==='function')d.targets=owcDetailPriorityTargets(h,d,target());")) {
  throw new Error('Detail view does not use owcDetailPriorityTargets.');
}
const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
const expectedRows = (contract.csv_rows_expected || 867) + 1;
if (lines.length !== expectedRows) throw new Error(`Expected ${expectedRows} CSV lines, got ${lines.length}.`);
const header = lines[0].split(',');
for (const field of contract.required_csv_fields || []) {
  if (!header.includes(field)) throw new Error(`CSV missing field ${field}.`);
}
const allowed = new Set(contract.allowed_priority_classes || []);
const classCounts = Object.fromEntries([...allowed].map(x => [x, 0]));
for (const line of lines.slice(1)) {
  const cols = line.split(',');
  const cls = cols[header.indexOf('priority_class')];
  if (!allowed.has(cls)) throw new Error(`Invalid priority class: ${cls}`);
  classCounts[cls] += 1;
}
for (const cls of allowed) {
  if (!classCounts[cls]) throw new Error(`No CSV rows for priority class ${cls}.`);
}
for (const id of ids) {
  const count = lines.slice(1).filter(line => line.startsWith(id + ',')).length;
  if (count !== 51) throw new Error(`Expected 51 priority rows for ${id}, got ${count}.`);
}
console.log('Priority target decision static checks passed');
