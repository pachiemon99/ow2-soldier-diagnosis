const fs=require('fs');
const path=require('path');
function fail(m){console.error(m);process.exit(1);}
const root=process.cwd();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(!['50.0.0','50.1.0','50.2.0','50.3.0','50.4.0','50.5.0','50.6.0','50.7.0','50.8.0','50.9.0','50.10.0','50.11.0','50.12.0','50.13.0','50.14.0','50.15.0','50.16.0','50.17.0','50.18.0','50.19.0','50.20.0','50.21.0','50.22.0'].includes(pkg.version)) fail('package version mismatch');
for(const t of ['Junkrat','Pharah','Echo','Emre']){ if(!html.includes(`value="${t}"`) && !html.includes(`'${t}'`)) fail('missing target '+t); }
for(const f of ['owcEnhancedCompositionDiagnosis','owcSynergyWinConditionLine','owcTargetSynergyRoleLine','OWC_SYNERGY_EN']){ if(!html.includes(f)) fail('missing '+f); }
for(const bad of ['爆風を置く','フラグ・ランチャーを置く','ロケット・ランチャーを置く','曲射を置く','横道','遮蔽へ切る','undefined / null']){ if(html.includes(bad)) fail('forbidden term '+bad); }
console.log('v50/v50.20 static preflight OK');
