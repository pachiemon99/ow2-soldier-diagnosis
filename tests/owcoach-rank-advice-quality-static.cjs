const fs = require('fs');
const path = require('path');

const root = process.cwd();
const indexPath = path.join(root, 'index.html');
const csvPath = path.join(root, 'owcoach_rank_advice_quality_db_v50_9.csv');
const contractPath = path.join(root, 'owcoach_rank_advice_quality_contract_v50_9.json');

function fail(msg){ console.error(msg); process.exit(1); }
function parseCsv(text){
  const rows=[]; let row=[], cell='', q=false;
  for(let i=0;i<text.length;i++){
    const ch=text[i], next=text[i+1];
    if(q){
      if(ch==='"' && next==='"'){ cell+='"'; i++; }
      else if(ch==='"'){ q=false; }
      else cell+=ch;
    } else {
      if(ch==='"') q=true;
      else if(ch===','){ row.push(cell); cell=''; }
      else if(ch==='\n') { row.push(cell); rows.push(row); row=[]; cell=''; }
      else if(ch!=='\r') cell+=ch;
    }
  }
  if(cell || row.length){ row.push(cell); rows.push(row); }
  const header=rows.shift();
  return rows.filter(r=>r.some(Boolean)).map(r=>Object.fromEntries(header.map((h,i)=>[h,r[i]||''])));
}

if(!fs.existsSync(indexPath)) fail('index.html is missing');
if(!fs.existsSync(csvPath)) fail('rank advice CSV is missing');
if(!fs.existsSync(contractPath)) fail('rank advice contract is missing');

const index = fs.readFileSync(indexPath,'utf8');
const csv = fs.readFileSync(csvPath,'utf8');
const contract = JSON.parse(fs.readFileSync(contractPath,'utf8'));
const rows = parseCsv(csv);
const ranks = ['bronze','silver','gold','platinum','diamond_plus'];
const targets = ['Soldier76','Sojourn','Cassidy','Ashe','Reaper','Symmetra','Hanzo','Torbjorn','Bastion','Mei','Sombra','Tracer','Genji','Junkrat','Pharah','Echo','Emre'];

if(contract.version !== 'v50.9') fail('contract version must be v50.9');
if(rows.length !== 867) fail(`expected 867 rank advice rows, got ${rows.length}`);
if(!index.includes('OWC_RANK_ADVICE_QUALITY_DB')) fail('runtime rank DB constant missing');
if(!index.includes('owcRankAdviceQuality')) fail('rank quality runtime function missing');
if(!index.includes('return owcRankAdviceQuality(h,d,target())')) fail('expandRankAdvice does not prefer Pack I DB');
if(!index.includes('Rank advice quality static checks passed')) fail('static success marker missing from index payload');

const byTarget = new Map();
for(const row of rows){
  if(!targets.includes(row.target_id)) fail(`unknown target_id ${row.target_id}`);
  if(!row.enemy_id) fail('row missing enemy_id');
  if(!row.learning_goal || row.learning_goal.length < 16) fail(`short learning_goal for ${row.target_id}/${row.enemy_id}`);
  const seen = new Set();
  for(const r of ranks){
    const v = row[r] || '';
    if(v.length < 32) fail(`short ${r} advice for ${row.target_id}/${row.enemy_id}`);
    if(/遮蔽を使い、無理な追撃を避ける/.test(v)) fail(`fallback rank advice remains in ${row.target_id}/${row.enemy_id}`);
    if(seen.has(v)) fail(`duplicate rank advice text in ${row.target_id}/${row.enemy_id}`);
    seen.add(v);
  }
  const key=row.target_id;
  if(!byTarget.has(key)) byTarget.set(key,0);
  byTarget.set(key, byTarget.get(key)+1);
}
for(const t of targets){
  if(byTarget.get(t)!==51) fail(`${t} must have 51 rank rows, got ${byTarget.get(t)||0}`);
}
console.log('Rank advice quality static checks passed');
