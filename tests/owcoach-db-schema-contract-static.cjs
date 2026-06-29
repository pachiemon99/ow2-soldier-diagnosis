const fs = require('fs');
const path = require('path');
const ROOT = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(ROOT, 'index.html'), 'utf8');
const match = html.match(/const OWCOACH_DATA = (.*?);\n/);
if (!match) throw new Error('OWCOACH_DATA not found');
const data = JSON.parse(match[1]);
const rankKeys = ['bronze','silver','gold','platinum','diamond_plus'];
const detailAliases = {
  main:['main','railgun_management','peacemaker_management','viper_management','hellfire_shotguns','photon_projector','storm_bow','rivet_gun','pulse_pistols','shuriken','recon_mode','assault_mode','blaster','machine_pistol'],
  move:['move','power_slide','combat_roll','coach_gun','shadow_step','teleporter','lunge_wall_climb','overload','blink','swift_strike','reconfigure','wall','translocator','cyber_agility'],
  sustain:['sustain','disruptor_shot','flashbang','dynamite','wraith_form','sentry_turret','sonic_arrow','deploy_turret','recall','deflect','grenade','cryo','virus','forge_hammer'],
  ultimate:['ultimate','overclock','deadeye','bob','death_blossom','photon_barrier','dragonstrike','molten_core','pulse_bomb','dragonblade','artillery','blizzard','emp'],
  highground:['highground','positioning','cyber_agility'],
  cue:['cue','watch_moment'],
  practice:['practice','in_match_check'],
  targets:['targets','priority_targets'],
  forbidden:['forbidden','forbidden_actions'],
  rank:['rank','rank_tips','bronze','silver','gold','platinum','diamond_plus','rank_tips.bronze']
};
function pick(row, keys){
  for (const k of keys) {
    const v = row?.[k];
    if (Array.isArray(v) && v.length) return v;
    if (v && typeof v === 'object' && Object.keys(v).length) return v;
    if (typeof v === 'string' && v.trim()) return v;
    if (typeof v === 'number' && Number.isFinite(v)) return v;
  }
  return null;
}
function rankObj(row){
  const r = row.rank || row.rank_tips;
  if (r && typeof r === 'object' && !Array.isArray(r)) return r;
  const flat = {bronze:row.bronze,silver:row.silver,gold:row.gold,platinum:row.platinum,diamond_plus:row.diamond_plus};
  if (Object.values(flat).some(v => typeof v === 'string' && v.trim())) return flat;
  const dotted = {bronze:row['rank_tips.bronze'],silver:row['rank_tips.silver'],gold:row['rank_tips.gold'],platinum:row['rank_tips.platinum'],diamond_plus:row['rank_tips.diamond_plus']};
  if (Object.values(dotted).some(v => typeof v === 'string' && v.trim())) return dotted;
  return null;
}
function compRating(row){
  if (Number.isFinite(Number(row.matchup_rating))) return Number(row.matchup_rating);
  for (const [key,value] of Object.entries(row)) {
    if (/_comp_stats$/.test(key) && value && typeof value === 'object' && Number.isFinite(Number(value.matchup_rating))) return Number(value.matchup_rating);
    if (key.endsWith('.matchup_rating') && Number.isFinite(Number(value))) return Number(value);
  }
  return null;
}
const targetIds = data.metadata.targets || Object.keys(data.targets || {});
if (targetIds.length !== 17) throw new Error(`expected 17 targets, got ${targetIds.length}`);
for (const fn of ['normalizeTargetDetailEntry','normalizeTargetCompEntry','normalizeRankAdviceValue']) {
  if (!html.includes(`function ${fn}`)) throw new Error(`${fn} missing from index.html`);
}
if (!html.includes('detail(h){return normalizeTargetDetailEntry')) throw new Error('Simple target engine is not using detail normalizer');
if (!html.includes('db(h){return normalizeTargetCompEntry')) throw new Error('Simple target engine is not using comp normalizer');
for (const target of targetIds) {
  const t = data.targets[target];
  if (!t) throw new Error(`${target} target block missing`);
  const detail = t.detail_db || {};
  const comp = t.comp_db || {};
  if (Object.keys(detail).length === 51) {
    for (const [heroId,row] of Object.entries(detail)) {
      if (typeof row !== 'object' || Array.isArray(row)) throw new Error(`${target}/${heroId} detail row is not an object`);
      if (!pick(row,['gameplan'])) throw new Error(`${target}/${heroId} missing gameplan`);
      for (const surface of ['main','move','sustain','ultimate','highground','targets','forbidden']) {
        if (!pick(row, detailAliases[surface])) throw new Error(`${target}/${heroId} missing normalized surface ${surface}`);
      }
      const r = rankObj(row);
      if (!r) throw new Error(`${target}/${heroId} missing rank advice object`);
      for (const key of rankKeys) {
        if (typeof r[key] !== 'string' || r[key].trim().length < 12) throw new Error(`${target}/${heroId} rank.${key} missing or too short`);
      }
    }
  }
  if (Object.keys(comp).length === 51 && target !== 'Soldier76' && target !== 'Sojourn') {
    const ratings = Object.entries(comp).map(([heroId,row]) => [heroId,compRating(row)]);
    const missing = ratings.filter(([,v]) => !Number.isFinite(v));
    if (missing.length) throw new Error(`${target} comp ratings missing: ${missing.slice(0,3).map(x=>x[0]).join(', ')}`);
    const varied = new Set(ratings.map(([,v]) => Number(v).toFixed(1)));
    if (varied.size < 5) throw new Error(`${target} comp ratings are too flat for DB contract: ${varied.size}`);
  }
}
console.log('DB schema contract static checks passed');
