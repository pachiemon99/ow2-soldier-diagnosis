const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const contractPath = path.join(root, 'owcoach_enemy_skill_wait_contract_v50_7.json');
const csvPath = path.join(root, 'owcoach_enemy_skill_wait_windows_v50_7.csv');
if (!fs.existsSync(contractPath)) throw new Error('Missing enemy skill wait contract JSON.');
if (!fs.existsSync(csvPath)) throw new Error('Missing enemy skill wait CSV mirror.');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const ids = contract.targets || [];
if (ids.length !== 17) throw new Error(`Expected 17 target heroes, got ${ids.length}.`);
for (const token of [
  'OWC_SKILL_WAIT_TARGET_RULES',
  'owcSkillWaitTargetRule',
  'owcSkillWaitWindow',
  'owcSkillWaitCompositionLines',
  'owcSkillWaitForbiddenLines',
  'owcDetailSkillWaitText',
  'owcSkillWaitLineForHero'
]) {
  if (!html.includes(token)) throw new Error(`Missing ${token} in index.html.`);
}
for (const id of ids) {
  const re = new RegExp(`['\"]${id}['\"]\s*:`);
  if (!re.test(html)) throw new Error(`Missing skill wait target rule for ${id}.`);
}
for (const field of contract.required_target_rule_fields || []) {
  if (!html.includes(`${field}`)) throw new Error(`Missing skill-wait target field ${field}.`);
}
if (!html.includes('d.peak=owcSkillWaitCompositionLines(selectedEnemy(),commonComp).concat(owcSynergyPeakLines(commonComp)).map(sanitizeForTarget);')) {
  throw new Error('Composition diagnosis does not prepend skill-wait timing lines.');
}
if (!html.includes("if(typeof owcDetailSkillWaitText==='function'){const wait=owcDetailSkillWaitText(h,d);d.cue=wait.cue;d.practice=wait.practice;}")) {
  throw new Error('Detail diagnosis does not use owcDetailSkillWaitText.');
}
if (!html.includes('d.forbidden=owcSkillWaitForbiddenLines(selectedEnemy()).concat(owcSynergyForbiddenLines(commonComp)')) {
  throw new Error('Composition forbidden lines do not include skill-wait guardrails.');
}
const lines = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
const expectedRows = (contract.csv_rows_expected || 867) + 1;
if (lines.length !== expectedRows) throw new Error(`Expected ${expectedRows} CSV lines, got ${lines.length}.`);
const header = lines[0].split(',');
for (const field of contract.required_csv_fields || []) {
  if (!header.includes(field)) throw new Error(`CSV missing field ${field}.`);
}
for (const id of ids) {
  const count = lines.slice(1).filter(line => line.startsWith(id + ',')).length;
  if (count !== 51) throw new Error(`Expected 51 skill-wait rows for ${id}, got ${count}.`);
}
for (const term of contract.forbidden_placeholder_terms || []) {
  if (lines.slice(1).some(line => line.includes(term))) {
    throw new Error(`CSV still contains placeholder timing term: ${term}`);
  }
}
console.log('Enemy skill wait-window static checks passed');
