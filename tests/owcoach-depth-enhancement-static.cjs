#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
function fail(msg){console.error(msg);process.exit(1);} function must(c,m){if(!c) fail(m);} 
const dbPath=path.join(root,'owcoach_depth_enhancement_db_v50_17.csv');
const auditPath=path.join(root,'owcoach_db_quality_score_audit_v50_17.csv');
const summaryPath=path.join(root,'owcoach_db_quality_target_summary_v50_17.csv');
const contractPath=path.join(root,'owcoach_depth_enhancement_contract_v50_17.json');
[dbPath,auditPath,summaryPath,contractPath].forEach(p=>must(fs.existsSync(p),`missing ${path.basename(p)}`));
const lines=fs.readFileSync(dbPath,'utf8').trim().split(/\r?\n/);
must(lines.length===868,`depth DB must have 867 rows, got ${lines.length-1}`);
const header=lines[0].split(',');
['target_id','enemy_id','depth_archetype','first_check','commit_window','reset_rule','practice_question','depth_summary','duplication_guardrail'].forEach(c=>must(header.includes(c),`missing depth column ${c}`));
const guardIdx=header.indexOf('duplication_guardrail');
for(const line of lines.slice(1,20)) must(line.split(',')[guardIdx] && line.split(',')[guardIdx].length>20,'guardrail sample too short');
const audit=fs.readFileSync(auditPath,'utf8').trim().split(/\r?\n/);
must(audit.length===868,`v50.17 audit must have 867 rows, got ${audit.length-1}`);
const ah=audit[0].split(',');
const statusIdx=ah.indexOf('pack_q_review_status');
must(statusIdx>=0,'missing pack_q_review_status');
let needs=0;
for(const line of audit.slice(1)){ if(line.split(',')[statusIdx]==='needs_depth') needs++; }
must(needs===0,`Pack Q audit should resolve needs_depth rows, got ${needs}`);
['v50.17 Pack Q','OWC_DEPTH_ENHANCEMENT_DB','owcDepthEnhancement','owcDepthEnhancementHtml','OWC_DEPTH_QUALITY_AUDIT_DB','owcDepthQualityEditorNote','対面深掘りメモ','Depth Notes'].forEach(t=>must(index.includes(t),`missing runtime token ${t}`));
const contract=JSON.parse(fs.readFileSync(contractPath,'utf8'));
must(contract.version==='v50.17','contract version must be v50.17');
must(contract.row_count===867,'contract row count must be 867');
must(['50.17.0','50.18.0','50.19.0','50.20.0','50.21.0','50.22.0'].includes(pkg.version),`package version should be 50.17.0, got ${pkg.version}`);
must(pkg.scripts['check:depth-enhancement']==='node tests/owcoach-depth-enhancement-static.cjs','missing check:depth-enhancement script');
must(pkg.scripts['check:syntax'].includes('check:depth-enhancement'),'check:syntax must include depth enhancement');
console.log('Depth enhancement static checks passed');
