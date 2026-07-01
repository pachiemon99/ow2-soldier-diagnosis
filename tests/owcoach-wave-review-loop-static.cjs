#!/usr/bin/env node
const fs=require('fs'); const path=require('path'); const { readExpandedCsv } = require('./owcoach-csv-source-utils.cjs'); const root=path.resolve(__dirname,'..');
function fail(m){console.error(m);process.exit(1);} function must(c,m){if(!c)fail(m);}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const dbRel='data/shared/owcoach_wave_review_loop_db_v50_18.csv';
const auditRel='data/audits/owcoach_wave_review_loop_audit_v50_18.csv';
const summary=path.join(root,'data/audits/owcoach_wave_review_loop_target_summary_v50_18.csv');
const contract=path.join(root,'data/contracts/owcoach_wave_review_loop_contract_v50_18.json');
[dbRel,auditRel].forEach(rel=>must(fs.existsSync(path.join(root,rel)),`missing ${rel}`)); [summary,contract].forEach(p=>must(fs.existsSync(p),`missing ${path.basename(p)}`));
const rows=readExpandedCsv(root,dbRel); must(rows.length===867,`review DB must have 867 rows, got ${rows.length}`);
['target_id','enemy_id','review_pattern','wave_goal','review_question','success_signal','mistake_signal','next_adjustment','vod_marker','micro_drill'].forEach(c=>must(Object.prototype.hasOwnProperty.call(rows[0]||{},c),`missing ${c}`));
const statuses=readExpandedCsv(root,auditRel); must(statuses.length===867,`audit must have 867 rows, got ${statuses.length}`);
let needs=0; statuses.forEach(r=>{if(r.review_status!=='stable')needs++;}); must(needs===0,`review audit has ${needs} non-stable rows`);
['OWC_WAVE_REVIEW_LOOP_DB','owcWaveReviewLoop','owcWaveReviewHtml','owcCompositionWaveReviewLines','試合後の振り返り','Review Loop','Wave review loop static checks passed'].forEach(t=>must(index.includes(t),`missing token ${t}`));
must(index.includes('seen.has(key)'), 'composition wave review must de-duplicate next_adjustment lines');
must(index.includes("replace(/^\\s*[：:]+\\s*/,'')") || index.includes("replace(/^\s*[：:]+\s*/,'')"), 'composition wave review must strip leading colon from next_adjustment lines');
must(index.includes('v50.18 Pack R') || index.includes('v50.19 Pack S'), 'missing Pack R/S display token');
const c=JSON.parse(fs.readFileSync(contract,'utf8')); must(c.version==='v50.18','contract version mismatch'); must(c.row_count===867,'contract row count mismatch');
must(['50.18.0','50.19.0','50.20.0','50.21.0','50.22.0','50.23.0','50.24.0','50.26.0','50.27.0','50.28.0'].includes(pkg.version),`package version should be 50.18.0, got ${pkg.version}`); must(pkg.scripts['check:wave-review-loop']==='node tests/owcoach-wave-review-loop-static.cjs','missing check script'); must(pkg.scripts['check:syntax'].includes('check:wave-review-loop'),'check:syntax must include Pack R');
console.log('Wave review loop static checks passed');
