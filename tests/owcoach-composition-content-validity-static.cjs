#!/usr/bin/env node
const path = require('path');
const root = path.resolve(__dirname, '..');
const { TARGET_IDS, createHarness, renderComposition, representativeCompositions, uniqueSampleCompositions, failWithIssues } = require('./owcoach-render-audit-utils.cjs');

const harness = createHarness(root);
const heroes = harness.context.heroes || [];
const byId = Object.fromEntries(heroes.map(h => [h.hero_id, h]));
function comboIds(combo){ return [combo.tank, combo.dps1, combo.dps2, combo.sup1, combo.sup2].filter(Boolean); }
function comboNames(combo){ return comboIds(combo).map(id => byId[id]?.hero_ja || id); }
function render(targetId, combo){ return renderComposition(harness, targetId, combo); }
function hasAny(text, patterns){ return patterns.some(p => typeof p === 'string' ? text.includes(p) : p.test(text)); }
function assertNo(text, patterns, meta, issues){
  for (const p of patterns) {
    if (typeof p === 'string' ? text.includes(p) : p.test(text)) {
      const i = typeof p === 'string' ? text.indexOf(p) : text.search(p);
      issues.push({ ...meta, pattern: String(p), ctx: text.slice(Math.max(0, i - 110), i + 190) });
    }
  }
}
function assertIncludes(text, patterns, meta, issues){
  for (const p of patterns) {
    if (!(typeof p === 'string' ? text.includes(p) : p.test(text))) issues.push({ ...meta, missing: String(p), ctx: text.slice(0, 280) });
  }
}
const issues = [];
const semanticCases = [
  {
    label:'no-long-damage-support-focus',
    combo:{ tank:'Junker Queen', dps1:'Junkrat', dps2:'Cassidy', sup1:'Mizuki', sup2:'Baptiste' },
    no:['長射線を作るダメージ']
  },
  {
    label:'mobile-supports-not-flanker-label',
    combo:{ tank:'Reinhardt', dps1:'Emre', dps2:'Sojourn', sup1:'Lúcio', sup2:'Kiriko' },
    no:['フランカー対策：ルシオ', 'フランカー対策：キリコ', 'フランカー対策：ルシオ、キリコ']
  },
  {
    label:'air-long-poke-no-dive-wording',
    combo:{ tank:'D.Va', dps1:'Ashe', dps2:'Pharah', sup1:'Illari', sup2:'Jetpack Cat' },
    no:['ダイブ後', 'ダイブ経路', 'ダイブ確認']
  },
  {
    label:'ball-highground-not-air-only-label',
    combo:{ tank:'Wrecking Ball', dps1:'Junkrat', dps2:'Reaper', sup1:'Kiriko', sup2:'Lifeweaver' },
    no:['空中対策：レッキング・ボール']
  },
  {
    label:'selected-enemy-skill-scope',
    combo:{ tank:'D.Va', dps1:'Ashe', dps2:'Widowmaker', sup1:'Illari', sup2:'Jetpack Cat' },
    no:['鈴のご加護', 'イモータリティ・フィールド', 'サウンド・バリア', 'ヴォイド・バリア', 'アクリーション']
  }
];
for (const targetId of TARGET_IDS) {
  for (const c of semanticCases) {
    const text = render(targetId, c.combo);
    const meta = { targetId, case: c.label, combo: comboNames(c.combo).join('/') };
    if (c.no) assertNo(text, c.no, meta, issues);
    if (c.yes) assertIncludes(text, c.yes, meta, issues);
    assertIncludes(text, ['攻撃優先順位'], meta, issues);
    assertNo(text, ['1. 先に見る敵：'], meta, issues);
    for (const name of comboNames(c.combo)) {
      if (!text.includes(`${name}：`) && !text.includes(`${name}、`) && !text.includes(`${name}。`) && !text.includes(`${name} `)) {
        issues.push({ ...meta, missingEnemyReference: name, ctx: text.slice(0, 500) });
      }
    }
  }
}

// Broad semantic guard on representative and sampled compositions. This is not a balance oracle;
// it catches advice that contradicts selected enemy roles or already-fixed terminology.
const broadCombos = representativeCompositions(heroes).concat(uniqueSampleCompositions(heroes, 80, 2601));
for (const targetId of TARGET_IDS) {
  for (const combo of broadCombos) {
    const text = render(targetId, combo);
    const meta = { targetId, case:'broad-semantic-sample', combo: comboNames(combo).join('/') };
    assertNo(text, [
      'ダイブ後', 'ダイブ経路', 'ダイブ確認',
      'フランカー対策：ルシオ', 'フランカー対策：キリコ',
      '長射線を作るダメージと、サポートが遮蔽から離れるタイミングを基準に',
      '空中対策：レッキング・ボール',
      '1. 先に見る敵：'
    ], meta, issues);
  }
}

failWithIssues('Composition content validity audit failed', issues, 60);
console.log(`Composition content validity static checks passed (${TARGET_IDS.length * (semanticCases.length + broadCombos.length)} outputs)`);
