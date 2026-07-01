#!/usr/bin/env node
const fs=require('fs'); const path=require('path'); const { readExpandedCsv } = require('./owcoach-csv-source-utils.cjs');
const root=path.resolve(__dirname,'..');
function fail(m){console.error(m);process.exit(1);} function must(c,m){if(!c)fail(m);}
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
const dbRel='data/shared/owcoach_depth_enhancement_db_v50_17.csv';
const auditRel='data/audits/owcoach_db_quality_score_audit_v50_17.csv';
const summaryPath=path.join(root,'data/audits/owcoach_db_quality_target_summary_v50_17.csv');
const contractPath=path.join(root,'data/contracts/owcoach_depth_enhancement_contract_v50_17.json');
[dbRel,auditRel].forEach(rel=>must(fs.existsSync(path.join(root,rel)),`missing ${rel}`));
must(fs.existsSync(summaryPath),'missing depth summary'); must(fs.existsSync(contractPath),'missing depth contract');
const rows=readExpandedCsv(root,dbRel); must(rows.length===867,`depth DB must have 867 rows, got ${rows.length}`);
['target_id','enemy_id','depth_archetype','first_check','commit_window','reset_rule','practice_question','depth_summary','duplication_guardrail'].forEach(c=>must(Object.prototype.hasOwnProperty.call(rows[0]||{},c),`missing depth logical column ${c}`));
for(const row of rows.slice(0,20)) must(row.duplication_guardrail && row.duplication_guardrail.length>20,'guardrail sample too short');
const audit=readExpandedCsv(root,auditRel); must(audit.length===867,`v50.17 audit must have 867 rows, got ${audit.length}`);
let needs=0; for(const row of audit){ if(row.pack_q_review_status==='needs_depth') needs++; }
must(needs===0,`Pack Q audit should resolve needs_depth rows, got ${needs}`);
['v50.17 Pack Q','OWC_DEPTH_ENHANCEMENT_DB','owcDepthEnhancement','owcDepthEnhancementHtml','OWC_DEPTH_QUALITY_AUDIT_DB','owcDepthQualityEditorNote','対面深掘りメモ','Depth Notes'].forEach(t=>must(index.includes(t),`missing runtime token ${t}`));
const contract=JSON.parse(fs.readFileSync(contractPath,'utf8'));
must(contract.version==='v50.17','contract version must be v50.17');
must(contract.row_count===867,'contract row count must be 867');
must(['50.17.0','50.18.0','50.19.0','50.20.0','50.21.0','50.22.0','50.23.0','50.24.0','50.26.0','50.27.0','50.28.0'].includes(pkg.version),`package version should be 50.17.0, got ${pkg.version}`);
must(pkg.scripts['check:depth-enhancement']==='node tests/owcoach-depth-enhancement-static.cjs','missing check:depth-enhancement script');
must(pkg.scripts['check:syntax'].includes('check:depth-enhancement'),'check:syntax must include depth enhancement');
console.log('Depth enhancement static checks passed');
