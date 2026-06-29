const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const contractPath = path.join(root, 'owcoach_ultimate_decision_contract_v50_6.json');
const csvPath = path.join(root, 'owcoach_ultimate_decision_db_v50_6.csv');
if (!fs.existsSync(contractPath)) throw new Error('Missing ultimate decision contract JSON.');
if (!fs.existsSync(csvPath)) throw new Error('Missing ultimate decision CSV mirror.');
const contract = JSON.parse(fs.readFileSync(contractPath, 'utf8'));
const ids = contract.targets || [];
if (ids.length !== 17) throw new Error(`Expected 17 target heroes, got ${ids.length}.`);
for (const token of [
  'OWC_ULTIMATE_DECISION_DB',
  'owcUltimateDecisionProfile',
  'owcUltimateDecisionLines',
  'owcDetailUltimateDecisionText',
  'owcFallbackUltimateLine'
]) {
  if (!html.includes(token)) throw new Error(`Missing ${token} in index.html.`);
}
for (const id of ids) {
  const re = new RegExp(`"${id}"\\s*:`);
  if (!re.test(html)) throw new Error(`Missing ultimate decision entry for ${id}.`);
}
for (const field of contract.required_fields || []) {
  if (!html.includes(`"${field}"`)) throw new Error(`Missing required ultimate decision field ${field}.`);
}
for (const tier of contract.rank_tiers || []) {
  if (!html.includes(`"${tier}"`)) throw new Error(`Missing rank tier ${tier} in ultimate decision DB.`);
}
if (!html.includes('d.ultimate=owcUltimateDecisionLines(selectedEnemy(),commonComp,d).map(sanitizeForTarget);')) {
  throw new Error('Composition diagnosis does not use owcUltimateDecisionLines.');
}
if (!html.includes("if(typeof owcDetailUltimateDecisionText==='function')d.ultimate=owcDetailUltimateDecisionText(h,d);")) {
  throw new Error('Detail diagnosis does not use owcDetailUltimateDecisionText.');
}
if (!html.includes('window.owcToEnglishText')) {
  throw new Error('English conversion hook missing for ultimate decision text.');
}
const csv = fs.readFileSync(csvPath, 'utf8').trim().split(/\r?\n/);
if (csv.length !== 18) throw new Error(`Expected CSV header plus 17 rows, got ${csv.length}.`);
for (const id of ids) {
  if (!csv.some(line => line.startsWith(id + ','))) throw new Error(`CSV mirror missing ${id}.`);
}
console.log('Ultimate decision DB static checks passed');
