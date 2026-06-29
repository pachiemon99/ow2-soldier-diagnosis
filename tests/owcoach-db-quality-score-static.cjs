#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
function fail(msg){console.error(msg);process.exit(1);} 
function must(cond,msg){if(!cond) fail(msg);} 
const csvPath=path.join(root,'owcoach_db_quality_score_audit_v50_15.csv');
const summaryPath=path.join(root,'owcoach_db_quality_target_summary_v50_15.csv');
const contractPath=path.join(root,'owcoach_db_quality_score_contract_v50_15.json');
must(fs.existsSync(csvPath),'missing DB quality audit CSV');
must(fs.existsSync(summaryPath),'missing DB quality target summary CSV');
must(fs.existsSync(contractPath),'missing DB quality contract JSON');
const csv=fs.readFileSync(csvPath,'utf8').trim().split(/\r?\n/);
const header=csv[0].split(',');
must(csv.length===868,`DB quality audit CSV must contain 867 data rows, got ${csv.length-1}`);
['target_id','enemy_id','total_quality_score','quality_band','issue_count','next_edit_priority','review_status'].forEach(col=>must(header.includes(col),`missing column ${col}`));
const scoreIndex=header.indexOf('total_quality_score');
const bandIndex=header.indexOf('quality_band');
for(const line of csv.slice(1)){
  const cols=line.split(',');
  const score=Number(cols[scoreIndex]);
  must(Number.isFinite(score) && score>=0 && score<=100,`invalid quality score ${score}`);
  must(['A','B','C','D','E'].includes(cols[bandIndex]),`invalid quality band ${cols[bandIndex]}`);
}
const contract=JSON.parse(fs.readFileSync(contractPath,'utf8'));
must(contract.version==='v50.15','contract version must be v50.15');
must(contract.row_count===867,'contract row count must be 867');
must((contract.runtime_helpers||[]).includes('owcDbQualityEditorNote'),'contract missing runtime helper');
['v50.15 Pack O: DB quality score audit','OWC_DB_QUALITY_SCORE_DB','owcDbQualityScore','owcDbQualitySummary','owcDbQualityEditorNote'].forEach(token=>must(index.includes(token),`missing runtime token ${token}`));
must(['50.15.0','50.16.0','50.17.0','50.18.0','50.19.0','50.20.0','50.21.0','50.22.0'].includes(pkg.version),`package version should be 50.15.0 or 50.16.0, got ${pkg.version}`);
must(pkg.scripts['check:db-quality-score']==='node tests/owcoach-db-quality-score-static.cjs','missing check:db-quality-score script');
must(pkg.scripts['check:syntax'].includes('check:db-quality-score'),'check:syntax must include DB quality check');
console.log('DB quality score static checks passed');
