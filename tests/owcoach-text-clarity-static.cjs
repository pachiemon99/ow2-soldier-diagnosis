#!/usr/bin/env node
const fs = require('fs');
const path = require('path');
const root = path.resolve(__dirname, '..');
function fail(message){ console.error(message); process.exit(1); }
function must(condition, message){ if(!condition) fail(message); }
const scanExt = new Set(['.js', '.html', '.csv', '.md', '.json', '.txt', '.cjs']);
const banned = [
  '短く削って',
  '短く迎撃し',
  '短く撃ち',
  '守りを使わせる',
  '確定窓は',
  '確定できなければ',
  '支援役の露出',
  '～の入り口か帰り道を待ち、止まった瞬間だけ',
  'が入った瞬間より、戻る向きが決まった瞬間を撃つ。',
  '本人をすぐ倒すことではなく、回復先を撃って守りを使わせた後に',
  '倒せたかではなく確認→攻撃→戻りの順番を見直す。',
  '1ウェーブ振り返り',
  '敵の防御・救助・遮蔽移動を1つ以上使わせ',
  'キルを防ぎて',
  '入口',
  '入り口',
  '見分け方：',
  '近距離へ入るフランカー',
  '最高高度ではなく',
  '通常射撃でレールガンを溜めるしてから',
  '撃破候補を切り替える',
  '小さな前進',
  '割れ目',
  '露出させる',
  '禁止行動：',
  '味方を助けた直後は本人より回復先',
  'その敵自身より回復を受けた味方',
  '本人ではなく回復先',
  '遮蔽か高台を持っている',
  'で撃破を確定すること'
];
const files=[];
function walk(dir){
  for(const ent of fs.readdirSync(dir, {withFileTypes:true})){
    if(ent.name === 'node_modules' || ent.name === '.git') continue;
    const p = path.join(dir, ent.name);
    if(ent.isDirectory()) walk(p);
    else if(scanExt.has(path.extname(ent.name))) files.push(p);
  }
}
walk(root);
const hits=[];
for(const file of files){
  const rel = path.relative(root, file);
  if(rel === 'tests/owcoach-text-clarity-static.cjs') continue;
  if(rel === 'tests/owcoach-diagnosis-text-structure-static.cjs') continue;
  if(rel === 'tests/owcoach-render-audit-utils.cjs') continue;
  if(rel === 'diagnosis_text/rewrite_rules.json') continue;
  let text = fs.readFileSync(file, 'utf8');
  if(rel === 'diagnosis_text/bundle.json'){
    const data = JSON.parse(text);
    delete data.rewrite_rules;
    text = JSON.stringify(data);
  }
  if(rel === 'index.html'){
    text = text.replace(new RegExp('const OWC_DIAGNOSIS_TEXT_BUNDLE = Object\\.freeze\\(.*?\\);\\n','s'), '');
  }
  for(const term of banned){
    if(text.includes(term)) hits.push(`${rel}: ${term}`);
  }
}
must(hits.length === 0, `Text clarity banned phrases remain:\n${hits.slice(0,40).join('\n')}`);
const index = fs.readFileSync(path.join(root, 'index.html'), 'utf8');
{
  const file = 'index.html';
  const text = fs.readFileSync(path.join(root, file), 'utf8');
  must(text.includes('owcCompactCompositionDisplay'), `${file} missing composition display compaction`);
  must(text.includes('owcCompactDetailDisplay'), `${file} missing detail display compaction`);
}
must(index.includes('試合後の振り返り'), 'missing renamed review heading');
must(index.includes('① 先に確認すること'), 'missing revised composition factor heading');
must(index.includes('サイバー体術(壁登り)'), 'missing display annotation for Cyber Agility wall climb text');
must(index.includes('owcUnsafePunishUseText'), 'missing safer forbidden skill-use wording helper');

must(index.includes('owcLikelySavedTargets'), 'missing conditional saved-target priority helper');
must(index.includes('owcSavePriorityBranchText'), 'missing saved-target priority branch text helper');
must(index.includes('救助された敵が遮蔽へ戻れていなければ'), 'missing conditional rescued-target priority wording');
console.log('Text clarity static checks passed');
