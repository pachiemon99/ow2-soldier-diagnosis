const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const match = html.match(/const OWCOACH_DATA = (.*?);\n/);
if (!match) throw new Error('OWCOACH_DATA not found');
const data = JSON.parse(match[1]);
const targets = ['Junkrat', 'Pharah', 'Echo', 'Emre'];
const placeholders = ['主要アビリティ', '移動スキル使用直後', '防御スキル使用後', '救助スキル使用後', '防御・救助・移動スキル'];
const rankKeys = ['bronze', 'silver', 'gold', 'platinum', 'diamond_plus'];
for (const target of targets) {
  const t = data.targets[target];
  if (!t) throw new Error(`${target} target missing`);
  const comp = t.comp_db || {};
  const detail = t.detail_db || {};
  if (Object.keys(comp).length !== 51) throw new Error(`${target} comp count is ${Object.keys(comp).length}`);
  if (Object.keys(detail).length !== 51) throw new Error(`${target} detail count is ${Object.keys(detail).length}`);
  const ratings = Object.values(comp).map(x => Number(x.matchup_rating));
  if (new Set(ratings.map(x => x.toFixed(1))).size < 8) throw new Error(`${target} ratings are not sufficiently varied`);
  if (ratings.every(x => x === 5)) throw new Error(`${target} ratings are still all 5`);
  for (const [heroId, row] of Object.entries(comp)) {
    const blob = JSON.stringify(row.key_enemy_skills || {});
    for (const ph of placeholders) {
      if (blob.includes(ph)) throw new Error(`${target}/${heroId} still contains placeholder skill: ${ph}`);
    }
  }
  for (const [heroId, row] of Object.entries(detail)) {
    const rank = row.rank || row.rank_tips || {};
    for (const key of rankKeys) {
      if (typeof rank[key] !== 'string' || rank[key].trim().length < 12) {
        throw new Error(`${target}/${heroId} rank.${key} missing or too short`);
      }
    }
    for (const key of ['gameplan','main','move','ultimate']) {
      if (typeof row[key] !== 'string' || row[key].trim().length < 20) throw new Error(`${target}/${heroId} ${key} too short`);
    }
  }
}
if (!html.includes('SimpleTargetEngineWithDbScore') && !html.includes('avgRating(sel)')) {
  throw new Error('added-target simple engine does not appear to use DB ratings');
}
console.log('added-target DB Pack A static checks passed');
