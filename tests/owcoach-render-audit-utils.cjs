const vm = require('vm');
const { readAppSource } = require('./owcoach-app-source-utils.cjs');

const TARGET_IDS = ['Soldier76','Sojourn','Cassidy','Ashe','Reaper','Symmetra','Hanzo','Torbjorn','Bastion','Mei','Sombra','Tracer','Genji','Junkrat','Pharah','Echo','Emre'];

const BAD_TEXT_PATTERNS = [
  /するして/,
  /作るして/,
  /溜めるして/,
  /確認するして/,
  /撃つして/,
  /入るして/,
  /使うして/,
  /見るして/,
  /1回のピークす/,
  /帰り道/,
  /資源/,
  /割れ目/,
  /撃破候補/,
  /小さな前進/,
  /露出/,
  /覗/,
  /本人/,
  /ダイブ経路/,
  /ダイブ確認/,
  /ダイブ後/,
  /undefined|null|NaN/,
  /防御・救助・移動スキル/,
  /移動・防御・救助/,
  /回復・防御・位置移動/,
  /救助・回復・妨害/,
  /最高高度/,
  /撃破を確定/,
  /持っている/,
  /確定窓/,
  /支援役/,
  /入口/,
  /ヘリックス・ロケットで倒し切り/
];

function htmlToText(html) {
  return String(html || '')
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<style[\s\S]*?<\/style>/g, '')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function createElementFactory(initial) {
  const elements = {};
  function el(id) {
    if (elements[id]) return elements[id];
    const node = {
      id,
      value: initial[id] || '',
      innerHTML: '',
      textContent: '',
      className: '',
      classList: { add(){}, remove(){}, toggle(){} },
      style: {},
      dataset: {},
      options: [],
      children: [],
      parentNode: { insertBefore(){} },
      querySelector(){ return null; },
      querySelectorAll(){ return []; },
      addEventListener(){},
      setAttribute(k, v){ this[k] = v; },
      getAttribute(k){ return this[k] || (this.dataset && this.dataset[k]) || ''; },
      appendChild(){},
      remove(){}
    };
    elements[id] = node;
    return node;
  }
  return { elements, el };
}

function createHarness(root) {
  const initial = { targetHero:'Soldier76', targetHeroDetail:'Soldier76', tank:'D.Va', dps1:'Ashe', dps2:'Widowmaker', sup1:'Illari', sup2:'Ana', result:'', detailResult:'' };
  const { elements, el } = createElementFactory(initial);
  const document = {
    getElementById: el,
    querySelector(){ return null; },
    querySelectorAll(){ return []; },
    getElementsByTagName(){ return [{ parentNode: { insertBefore(){} } }]; },
    createElement(tag){ const e = el(`created-${tag}-${Math.random()}`); e.tagName = tag; return e; },
    body: {},
    head: { appendChild(){} },
    documentElement: { dataset: {}, lang: '' },
    addEventListener(){}
  };
  const storage = { owcoach_result_mode: 'detail' };
  const context = {
    window: {},
    document,
    console,
    setTimeout(){},
    clearTimeout(){},
    localStorage: { getItem(k){ return storage[k] || null; }, setItem(k, v){ storage[k] = String(v); } },
    fetch(){ return Promise.reject(new Error('fetch disabled in static render audit')); },
    navigator: {},
    location: {},
    URL: { createObjectURL(){ return ''; } }
  };
  context.window = context;
  context.global = context;
  context.self = context;
  vm.createContext(context);
  vm.runInContext(readAppSource(root), context, { filename: 'owcoach-index-inline-app.js' });
  return { context, elements };
}

function setComposition(elements, targetId, combo) {
  elements.targetHero.value = targetId;
  elements.targetHeroDetail.value = targetId;
  elements.tank.value = combo.tank || combo.t;
  elements.dps1.value = combo.dps1 || combo.d1;
  elements.dps2.value = combo.dps2 || combo.d2;
  elements.sup1.value = combo.sup1 || combo.s1;
  elements.sup2.value = combo.sup2 || combo.s2;
}

function renderComposition(harness, targetId, combo) {
  setComposition(harness.elements, targetId, combo);
  harness.context.window.diagnose();
  return htmlToText(harness.elements.result.innerHTML);
}

function renderDetail(harness, targetId, enemyId) {
  harness.elements.targetHero.value = targetId;
  harness.elements.targetHeroDetail.value = targetId;
  harness.context.window.showHero(enemyId);
  return htmlToText(harness.elements.detailResult.innerHTML);
}

function lcg(seed) {
  let x = seed >>> 0;
  return () => ((x = (1664525 * x + 1013904223) >>> 0) / 2 ** 32);
}

function uniqueSampleCompositions(heroes, n, seed) {
  const tanks = heroes.filter(h => h.role === 'タンク').map(h => h.hero_id);
  const dps = heroes.filter(h => h.role === 'ダメージ').map(h => h.hero_id);
  const supports = heroes.filter(h => h.role === 'サポート').map(h => h.hero_id);
  const rnd = lcg(seed);
  const combos = [];
  const seen = new Set();
  let tries = 0;
  while (combos.length < n && tries < n * 80) {
    tries += 1;
    const tank = tanks[Math.floor(rnd() * tanks.length)];
    const dps1 = dps[Math.floor(rnd() * dps.length)];
    const dps2 = dps[Math.floor(rnd() * dps.length)];
    const sup1 = supports[Math.floor(rnd() * supports.length)];
    const sup2 = supports[Math.floor(rnd() * supports.length)];
    if (!tank || !dps1 || !dps2 || !sup1 || !sup2 || dps1 === dps2 || sup1 === sup2) continue;
    const key = [tank, ...[dps1, dps2].sort(), ...[sup1, sup2].sort()].join('|');
    if (seen.has(key)) continue;
    seen.add(key);
    combos.push({ tank, dps1, dps2, sup1, sup2 });
  }
  if (combos.length < n) throw new Error(`could not generate enough unique compositions: ${combos.length}/${n}`);
  return combos;
}

function existingCombo(heroes, combo) {
  const ids = new Set(heroes.map(h => h.hero_id));
  for (const [key, value] of Object.entries(combo)) {
    if (key === 'label') continue;
    if (!ids.has(value)) throw new Error(`representative combo references unknown hero: ${value}`);
  }
  return combo;
}

function representativeCompositions(heroes) {
  return [
    existingCombo(heroes, { label:'ダイブ救助構成', tank:'Winston', dps1:'Tracer', dps2:'Genji', sup1:'Kiriko', sup2:'Lifeweaver' }),
    existingCombo(heroes, { label:'長射線＋空中圧力構成', tank:'D.Va', dps1:'Ashe', dps2:'Pharah', sup1:'Illari', sup2:'Jetpack Cat' }),
    existingCombo(heroes, { label:'分断射線構成', tank:'Sigma', dps1:'Widowmaker', dps2:'Sombra', sup1:'Ana', sup2:'Zenyatta' }),
    existingCombo(heroes, { label:'ラッシュ継戦構成', tank:'Reinhardt', dps1:'Reaper', dps2:'Mei', sup1:'Lúcio', sup2:'Moira' }),
    existingCombo(heroes, { label:'高耐久継戦構成', tank:'Mauga', dps1:'Bastion', dps2:'Torbjörn', sup1:'Baptiste', sup2:'Mercy' }),
    existingCombo(heroes, { label:'救助継戦構成', tank:'Zarya', dps1:'Cassidy', dps2:'Sojourn', sup1:'Kiriko', sup2:'Lifeweaver' }),
    existingCombo(heroes, { label:'バランス構成', tank:'Junker Queen', dps1:'Soldier: 76', dps2:'Hanzo', sup1:'Ana', sup2:'Illari' })
  ];
}

function heroNames(heroes) {
  return heroes.map(h => h.hero_ja).filter(n => n && n.length > 1).sort((a, b) => b.length - a.length);
}

function escapeRegExp(text) {
  return String(text).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function findTextIssues(text, heroNameList) {
  const issues = [];
  for (const re of BAD_TEXT_PATTERNS) {
    const idx = text.search(re);
    if (idx >= 0) issues.push({ pattern: String(re), ctx: text.slice(Math.max(0, idx - 90), idx + 170) });
  }
  for (const name of heroNameList) {
    const escaped = escapeRegExp(name);
    const re = new RegExp(`${escaped}、${escaped}`);
    const idx = text.search(re);
    if (idx >= 0) issues.push({ pattern: `duplicate hero name: ${name}`, ctx: text.slice(Math.max(0, idx - 90), idx + 170) });
  }
  return issues;
}

function failWithIssues(title, issues, limit = 20) {
  if (!issues.length) return;
  const preview = issues.slice(0, limit).map((x, i) => `${i + 1}. ${JSON.stringify(x)}`).join('\n');
  throw new Error(`${title}: ${issues.length} issue(s)\n${preview}`);
}

module.exports = {
  TARGET_IDS,
  BAD_TEXT_PATTERNS,
  createHarness,
  renderComposition,
  renderDetail,
  uniqueSampleCompositions,
  representativeCompositions,
  heroNames,
  findTextIssues,
  failWithIssues
};
