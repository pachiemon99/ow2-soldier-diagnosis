const fs=require('fs');
const path=require('path');
function fail(m){console.error(m);process.exit(1);}
const root=process.cwd();
const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
const pkg=JSON.parse(fs.readFileSync(path.join(root,'package.json'),'utf8'));
if(pkg.version!=='49.53.17') fail('package version mismatch');
for(const t of ['Junkrat','Pharah','Echo','Emre']){ if(!html.includes(`value="${t}"`)&&!html.includes(`value="${t}"`)&&!html.includes(`'${t}'`)) fail('missing target '+t); }
for(const f of ['owcEnhancedCompositionDiagnosis','owcSynergyWinConditionLine','owcTargetSynergyRoleLine','OWC_SYNERGY_EN']){ if(!html.includes(f)) fail('missing '+f); }
for(const bad of ['爆風を置く','フラグ・ランチャーを置く','ロケット・ランチャーを置く','曲射を置く','横道','遮蔽へ切る','undefined / null']){ if(html.includes(bad)) fail('forbidden term '+bad); }
console.log('v49.53.17 static preflight OK');
