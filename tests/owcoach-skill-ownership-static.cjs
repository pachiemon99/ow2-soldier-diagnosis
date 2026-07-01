const fs = require('fs');
const path = require('path');
const { readAppSource } = require('./owcoach-app-source-utils.cjs');
const root = path.resolve(__dirname, '..');
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
const appSource = readAppSource(root);
function must(condition, message){ if(!condition){ throw new Error(message); } }
for (const source of [index, appSource]) {
  must(source.includes('OWC_SKILL_OWNER_OVERRIDES'), 'skill owner override map is missing');
  must(source.includes('ヴォイド・バリア'), 'Void Barrier skill name should be represented');
  must(source.includes('Ramattra'), 'Ramattra owner guard should be represented');
  must(source.includes('エクスペリメンタル・バリア'), 'Sigma barrier should use Experimental Barrier');
  must(source.includes('owcSkillBelongsToHero'), 'skill ownership filter helper is missing');
  must(source.includes('owcFilterSkillsForHero'), 'skill list filtering helper is missing');
}
console.log('Skill ownership static checks passed');
