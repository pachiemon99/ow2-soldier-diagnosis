const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function mustContain(text, label){
  if (!html.includes(text)) throw new Error(`Missing composition text quality marker: ${label || text}`);
}
function mustNotContain(text, label){
  if (html.includes(text)) throw new Error(`Forbidden stale composition text marker: ${label || text}`);
}
for (const marker of [
  'function owcCompositionTextProfile',
  'function owcSynergyOpeningLines',
  'function owcSynergyOrderLines',
  'function owcSynergyHighgroundLines',
  'function owcSynergyPeakLines',
  'function owcSynergyUltimateLines',
  'function owcSynergyForbiddenLines',
  '開幕判断',
  '初手の目的',
  '高台判断',
  'ピーク判断',
  'アルティメット判断',
  '絶対にやってはいけないこと'
]) mustContain(marker);
for (const label of ['ダイブ救助構成','長射線＋空中圧力構成','分断射線構成','ラッシュ継戦構成','高耐久継戦構成','救助継戦構成','バランス構成']) mustContain(`'${label}'`, `profile ${label}`);
mustContain('owcSynergyOpeningLines(sel,commonComp)', 'diagnose opening injection');
mustContain('owcSynergyOrderLines(commonComp)', 'diagnose order injection');
mustContain('owcSynergyHighgroundLines(commonComp)', 'diagnose highground injection');
mustContain('owcSynergyPeakLines(commonComp)', 'diagnose peak injection');
if (!html.includes('owcSynergyUltimateLines(commonComp)') && !html.includes('owcUltimateDecisionLines(selectedEnemy(),commonComp,d)')) throw new Error('Missing composition text quality marker: diagnose ultimate injection');
mustContain('owcSynergyForbiddenLines(commonComp)', 'diagnose forbidden injection');
mustNotContain('高台は居座る場所ではなく、撃った後に隠れられる退路込みで使う。', 'old generic highground fallback');
mustNotContain('同じ角度で撃ち続けない。', 'old generic peak fallback');
console.log('Composition text quality static checks passed');
