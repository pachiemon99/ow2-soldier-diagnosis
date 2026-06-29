const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
function mustContain(text, label){
  if (!html.includes(text)) throw new Error(`Missing composition synthesis marker: ${label || text}`);
}
mustContain('OWC_SYNERGY_GROUPS', 'group registry');
mustContain('function owcOrderPlanForLabel', 'stop-order planner');
mustContain('function owcSynergyStopOrderLine', 'stop-order display');
mustContain('five_man_summary', 'five-man summary field');
mustContain('stop_order_summary', 'stop-order summary field');
mustContain('敵5人を1人ずつの対面として読まない', 'five-enemy wording');
const labels = ['ダイブ救助構成','長射線＋空中圧力構成','分断射線構成','ラッシュ継戦構成','高耐久継戦構成','救助継戦構成','バランス構成'];
for (const label of labels) mustContain(label, `label ${label}`);
console.log('Composition synthesis static checks passed');
