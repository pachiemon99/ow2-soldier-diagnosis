#!/usr/bin/env node
const path = require('path');
const root = path.resolve(__dirname, '..');
const { TARGET_IDS, createHarness, renderComposition, uniqueSampleCompositions, heroNames, findTextIssues, failWithIssues } = require('./owcoach-render-audit-utils.cjs');
const SAMPLE_PER_TARGET = Number(process.env.OWC_SAMPLE_PER_TARGET || 200);
const SAMPLE_SEED_OFFSET = Number(process.env.OWC_SAMPLE_SEED_OFFSET || 0);
try {
  const harness = createHarness(root);
  const names = heroNames(harness.context.heroes || []);
  const issues = [];
  let count = 0;
  for (const targetId of TARGET_IDS) {
    const combos = uniqueSampleCompositions(harness.context.heroes || [], SAMPLE_PER_TARGET, TARGET_IDS.indexOf(targetId) + 123 + SAMPLE_SEED_OFFSET);
    for (const combo of combos) {
      const text = renderComposition(harness, targetId, combo);
      count += 1;
      for (const issue of findTextIssues(text, names)) issues.push({ targetId, combo, ...issue });
    }
  }
  const expected = TARGET_IDS.length * SAMPLE_PER_TARGET;
  if (count !== expected) throw new Error(`unexpected large sample render count: ${count}/${expected}`);
  failWithIssues('Large sample composition text polish audit failed', issues);
  console.log(`Large sample composition text polish static checks passed (${count} outputs)`);
  process.exit(0);
} catch (error) {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
}
