#!/usr/bin/env node
const path = require('path');
const root = path.resolve(__dirname, '..');
const { TARGET_IDS, createHarness, renderDetail, failWithIssues } = require('./owcoach-render-audit-utils.cjs');

function verdictBandIssue(verdict, score){
  const v=Number(score);
  if(!Number.isFinite(v)) return 'rating is not numeric';
  if(verdict==='有利' && v<6.0) return 'favored verdict has low rating';
  if(verdict==='やや有利' && (v<5.2 || v>7.6)) return 'slightly favored verdict is outside broad rating band';
  if(verdict==='五分' && (v<4.0 || v>6.0)) return 'even verdict is outside broad rating band';
  if(verdict==='やや不利' && (v<2.8 || v>4.8)) return 'slightly unfavored verdict is outside broad rating band';
  if(verdict==='不利' && v>4.0) return 'unfavored verdict has high rating';
  return '';
}
function sectionAfter(text, start, end){
  const i=text.indexOf(start);
  if(i<0)return '';
  const j=end?text.indexOf(end,i+start.length):-1;
  return text.slice(i, j>=0?j:undefined);
}
function parseReason(text){
  const m=text.match(/判定：\s*(有利|やや有利|五分|やや不利|不利)（([0-9.]+)\/10）\s*\/\s*([^。]+(?:。)?)/);
  return m ? { verdict:m[1], score:Number(m[2]), priority:m[3] } : null;
}
function has(text, re){ return re.test(String(text||'')); }

try{
  const harness=createHarness(root);
  const heroes=harness.context.heroes || [];
  const issues=[];
  let count=0;
  for(const targetId of TARGET_IDS){
    for(const enemy of heroes){
      const text=renderDetail(harness,targetId,enemy.hero_id);
      count+=1;
      const reason=parseReason(text);
      const meta={targetId, enemy:enemy.hero_id, enemy_ja:enemy.hero_ja};
      if(!reason){
        issues.push({...meta, missing:'matchup reason verdict', ctx:text.slice(0,500)});
        continue;
      }
      const band=verdictBandIssue(reason.verdict, reason.score);
      if(band){
        issues.push({...meta, verdict:reason.verdict, score:reason.score, band, ctx:sectionAfter(text,'有利 / 不利理由','固有焦点')});
      }
      const plan=sectionAfter(text,'対面方針','スキル待ち・火力運用');
      const reasonBlock=sectionAfter(text,'有利 / 不利理由','固有焦点・深掘り');
      if(['有利','やや有利'].includes(reason.verdict) && has(plan,/不利になる相手|不利な長射線|不利になりやすい/)){
        issues.push({...meta, verdict:reason.verdict, contradiction:'favored plan uses unfavored framing', ctx:plan});
      }
      if(['不利','やや不利'].includes(reason.verdict) && has(plan,/有利になる相手|有利に戦える|有利を取れる/)){
        issues.push({...meta, verdict:reason.verdict, contradiction:'unfavored plan uses favored framing', ctx:plan});
      }
      if(['有利','やや有利'].includes(reason.verdict) && has(reasonBlock,/不利になりやすい理由は/)){
        issues.push({...meta, verdict:reason.verdict, contradiction:'favored reason block uses unfavored-only explanation header', ctx:reasonBlock});
      }
      if(['不利','やや不利'].includes(reason.verdict) && has(reasonBlock,/一方的な圧を受けにくい。先に倒すより/)){
        issues.push({...meta, verdict:reason.verdict, contradiction:'unfavored reason block uses favored-only claim', ctx:reasonBlock});
      }
      if(has(text,/撃つして|入るして|使うして|見るして|移動・防御・救助|救助・回復・妨害/)){
        issues.push({...meta, contradiction:'old phrasing remains in matchup output', ctx:text.slice(Math.max(0,text.search(/撃つして|入るして|使うして|見るして|移動・防御・救助|救助・回復・妨害/)-100), text.search(/撃つして|入るして|使うして|見るして|移動・防御・救助|救助・回復・妨害/)+220)});
      }
    }
  }
  if(count!==TARGET_IDS.length*heroes.length) throw new Error(`unexpected detail count: ${count}`);
  failWithIssues('Matchup consistency audit failed', issues, 80);
  console.log(`Matchup consistency static checks passed (${count} detail outputs)`);
}catch(error){
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
}
