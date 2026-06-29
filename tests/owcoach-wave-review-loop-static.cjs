#!/usr/bin/env node
const fs=require('fs'); const path=require('path'); const root=path.resolve(__dirname,'..');
function fail(m){console.error(m);process.exit(1);} function must(c,m){if(!c)fail(m);}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const db=path.join(root,'owcoach_wave_review_loop_db_v50_18.csv');
const audit=path.join(root,'owcoach_wave_review_loop_audit_v50_18.csv');
const summary=path.join(root,'owcoach_wave_review_loop_target_summary_v50_18.csv');
const contract=path.join(root,'owcoach_wave_review_loop_contract_v50_18.json');
[db,audit,summary,contract].forEach(p=>must(fs.existsSync(p),`missing ${path.basename(p)}`));
const lines=fs.readFileSync(db,'utf8').trim().split(/\r?\n/); must(lines.length===868,`review DB must have 867 rows, got ${lines.length-1}`);
const header=lines[0].split(','); ['target_id','enemy_id','review_pattern','wave_goal','review_question','success_signal','mistake_signal','next_adjustment','vod_marker','micro_drill'].forEach(c=>must(header.includes(c),`missing ${c}`));
const statuses=fs.readFileSync(audit,'utf8').trim().split(/\r?\n/); must(statuses.length===868,`audit must have 867 rows, got ${statuses.length-1}`);
const ah=statuses[0].split(','); const st=ah.indexOf('review_status'); must(st>=0,'missing review_status'); let needs=0; statuses.slice(1).forEach(l=>{if(l.split(',')[st]!=='stable')needs++;}); must(needs===0,`review audit has ${needs} non-stable rows`);
['OWC_WAVE_REVIEW_LOOP_DB','owcWaveReviewLoop','owcWaveReviewHtml','owcCompositionWaveReviewLines','試合後の振り返り','Review Loop','Wave review loop static checks passed'].forEach(t=>must(index.includes(t),`missing token ${t}`));
must(index.includes('v50.18 Pack R') || index.includes('v50.19 Pack S'), 'missing Pack R/S display token');
const c=JSON.parse(fs.readFileSync(contract,'utf8')); must(c.version==='v50.18','contract version mismatch'); must(c.row_count===867,'contract row count mismatch');
must(['50.18.0','50.19.0','50.20.0','50.21.0','50.22.0'].includes(pkg.version),`package version should be 50.18.0, got ${pkg.version}`); must(pkg.scripts['check:wave-review-loop']==='node tests/owcoach-wave-review-loop-static.cjs','missing check script'); must(pkg.scripts['check:syntax'].includes('check:wave-review-loop'),'check:syntax must include Pack R');
console.log('Wave review loop static checks passed');
