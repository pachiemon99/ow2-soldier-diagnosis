#!/usr/bin/env node
const path = require('path');
const root = path.resolve(__dirname, '..');
const { TARGET_IDS, createHarness, renderComposition, representativeCompositions, uniqueSampleCompositions, failWithIssues } = require('./owcoach-render-audit-utils.cjs');

const harness = createHarness(root);
const heroes = harness.context.heroes || [];
const byId = Object.fromEntries(heroes.map(h => [h.hero_id, h]));
const TARGET_JA = {Soldier76:'ソルジャー76',Sojourn:'ソジョーン',Cassidy:'キャスディ',Ashe:'アッシュ',Reaper:'リーパー',Symmetra:'シンメトラ',Hanzo:'ハンゾー',Torbjorn:'トールビョーン',Bastion:'バスティオン',Mei:'メイ',Sombra:'ソンブラ',Tracer:'トレーサー',Genji:'ゲンジ',Junkrat:'ジャンクラット',Pharah:'ファラ',Echo:'エコー',Emre:'エムレ'};
const targetJa = id => TARGET_JA[id] || byId[id]?.hero_ja || id;
const realAir = new Set(['Pharah', 'Echo', 'Jetpack Cat']);
const longDamage = new Set(['Ashe', 'Widowmaker', 'Hanzo', 'Sojourn', 'Soldier: 76', 'Cassidy', 'Emre', 'Freja']);
const groundMobilityOnly = new Set(['D.Va', 'Winston', 'Doomfist', 'Wrecking Ball', 'Genji']);

function ids(combo){ return [combo.tank, combo.dps1, combo.dps2, combo.sup1, combo.sup2].filter(Boolean); }
function names(combo){ return ids(combo).map(id => byId[id]?.hero_ja || id); }
function has(combo, set){ return ids(combo).some(id => set.has(id)); }
function context(text, token){
  const i = text.indexOf(token);
  return i >= 0 ? text.slice(Math.max(0, i - 120), i + 220) : text.slice(0, 400);
}
function assertNo(text, tokens, meta, issues){
  for (const token of tokens) {
    if (text.includes(token)) issues.push({ ...meta, token, ctx: context(text, token) });
  }
}
function assertEnemyNamesScoped(text, combo, targetId, meta, issues){
  const selected = new Set(names(combo));
  const targetName = targetJa(targetId);
  for (const h of heroes) {
    const n = h.hero_ja;
    if (!n || selected.has(n) || n === targetName) continue;
    // The rendered app can show the target hero in the header, but enemy-specific syntax must not name unselected enemies.
    const probes = [`${n}の`, `${n}が`, `${n}を`, `${n}：`, `${n}、`];
    for (const token of probes) {
      const i = text.indexOf(token);
      if (i >= 0) {
        issues.push({ ...meta, type:'unselected enemy reference', enemy:n, token, ctx:text.slice(Math.max(0, i - 100), i + 180) });
        return;
      }
    }
  }
}

const semanticCases = [
  {
    label:'ground-dive-priority-not-long-sightline',
    combo:{ tank:'Winston', dps1:'Tracer', dps2:'Genji', sup1:'Kiriko', sup2:'Lifeweaver' },
    no:['長い射線を構えたダメージ', '副シナジー： 長射線＋空中圧力構成']
  },
  {
    label:'heavy-sustain-without-air-label',
    combo:{ tank:'Mauga', dps1:'Bastion', dps2:'Torbjörn', sup1:'Baptiste', sup2:'Mercy' },
    no:['副シナジー： 長射線＋空中圧力構成', '空中圧力管理型', '構成タイプ 長射線＋空中圧力構成']
  },
  {
    label:'dva-ground-mobility-not-air-only',
    combo:{ tank:'D.Va', dps1:'Soldier: 76', dps2:'Cassidy', sup1:'Ana', sup2:'Baptiste' },
    no:['空中対策：D.Va', 'D.Vaを見上げ続け']
  },
  {
    label:'ball-ground-mobility-not-air-only',
    combo:{ tank:'Wrecking Ball', dps1:'Junkrat', dps2:'Reaper', sup1:'Kiriko', sup2:'Lifeweaver' },
    no:['空中対策：レッキング・ボール', 'レッキング・ボールを見上げ続け']
  },
  {
    label:'enemy-skill-scope-stays-selected',
    combo:{ tank:'D.Va', dps1:'Ashe', dps2:'Widowmaker', sup1:'Illari', sup2:'Jetpack Cat' },
    no:['鈴のご加護', 'イモータリティ・フィールド', 'サウンド・バリア', 'ヴォイド・バリア', 'アクリーション']
  }
];

const issues = [];
for (const targetId of TARGET_IDS) {
  for (const c of semanticCases) {
    const text = renderComposition(harness, targetId, c.combo);
    const meta = { targetId, case:c.label, combo:names(c.combo).join('/') };
    assertNo(text, c.no || [], meta, issues);
    assertEnemyNamesScoped(text, c.combo, targetId, meta, issues);
    if (!text.includes('攻撃優先順位：')) issues.push({ ...meta, type:'missing attack priority label', ctx:text.slice(0, 300) });
    assertNo(text, ['防御・救助・移動が残る相手へ先出ししない'], meta, issues);
  }
}

const broadCombos = representativeCompositions(heroes).concat(uniqueSampleCompositions(heroes, 120, 5028));
for (const targetId of TARGET_IDS) {
  for (const combo of broadCombos) {
    const text = renderComposition(harness, targetId, combo);
    const meta = { targetId, case:'broad-priority-win-forbidden', combo:names(combo).join('/') };
    assertEnemyNamesScoped(text, combo, targetId, meta, issues);
    if (!has(combo, realAir)) {
      assertNo(text, ['構成タイプ 長射線＋空中圧力構成', '副シナジー： 長射線＋空中圧力構成', '空中圧力管理型'], meta, issues);
    }
    if (!has(combo, longDamage)) {
      assertNo(text, ['長い射線を構えたダメージ'], meta, issues);
    }
    const groundNames = ids(combo).filter(id => groundMobilityOnly.has(id)).map(id => byId[id]?.hero_ja || id);
    for (const n of groundNames) {
      assertNo(text, [`空中対策：${n}`, `${n}を見上げ続け`], meta, issues);
    }
    assertNo(text, ['防御・救助・移動が残る相手へ先出ししない'], meta, issues);
  }
}

failWithIssues('Composition priority / win-condition / forbidden consistency audit failed', issues, 80);
console.log(`Composition priority consistency static checks passed (${TARGET_IDS.length * (semanticCases.length + broadCombos.length)} outputs)`);
