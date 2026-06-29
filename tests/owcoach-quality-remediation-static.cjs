#!/usr/bin/env node
const fs=require('fs');
const path=require('path');
const root=path.resolve(__dirname,'..');
const index=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
function fail(msg){console.error(msg);process.exit(1);} function must(c,m){if(!c) fail(m);} 
const audit=path.join(root,'owcoach_db_quality_score_audit_v50_16.csv');
const summary=path.join(root,'owcoach_db_quality_target_summary_v50_16.csv');
const contract=path.join(root,'owcoach_quality_remediation_contract_v50_16.json');
must(fs.existsSync(audit),'missing v50.16 remediation audit CSV');
must(fs.existsSync(summary),'missing v50.16 target summary CSV');
must(fs.existsSync(contract),'missing v50.16 remediation contract');
const lines=fs.readFileSync(audit,'utf8').trim().split(/\r?\n/);
must(lines.length===868,`expected 867 remediation rows, got ${lines.length-1}`);
const header=lines[0].split(',');
['target_id','enemy_id','total_quality_score','quality_band','remediation_applied','quality_version'].forEach(c=>must(header.includes(c),`missing ${c}`));
const bandIdx=header.indexOf('quality_band');
let cCount=0,dCount=0,eCount=0;
for(const line of lines.slice(1)){
  const band=line.split(',')[bandIdx];
  if(band==='C') cCount++; if(band==='D') dCount++; if(band==='E') eCount++;
}
must(dCount===0 && eCount===0,'remediation audit must not contain D/E rows');
must(cCount===0,'Pack P should resolve all C-band rows from Pack O');
['OWC_QUALITY_REMEDIATION_DB','owcQualityRemediationScore','owcQualityRemediationSummary','owcQualityRemediationEditorNote','v50.16 Pack P'].forEach(t=>must(index.includes(t),`missing runtime token ${t}`));
const marker='const OWCOACH_DATA = '; const start=index.indexOf(marker)+marker.length; const end=index.indexOf('\n\nconst CANONICAL_TARGET_IDS', start); const embedded=index.slice(start,end); ['移動後','防御後','救助後','主要アビリティ','該当なし'].forEach(t=>must(!embedded.includes(t),`placeholder still present in embedded data: ${t}`));
must(['50.16.0','50.17.0','50.18.0','50.19.0','50.20.0','50.21.0','50.22.0'].includes(pkg.version),`package version should be 50.16.0, got ${pkg.version}`);
must(pkg.scripts['check:quality-remediation']==='node tests/owcoach-quality-remediation-static.cjs','missing check:quality-remediation script');
must(pkg.scripts['check:syntax'].includes('check:quality-remediation'),'check:syntax must include quality remediation');
console.log('Quality remediation static checks passed');
