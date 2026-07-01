#!/usr/bin/env node
const path = require('path');
const root = path.resolve(__dirname, '..');
const { TARGET_IDS, createHarness, renderComposition, representativeCompositions, heroNames, findTextIssues, failWithIssues } = require('./owcoach-render-audit-utils.cjs');
try {
  const harness = createHarness(root);
  const names = heroNames(harness.context.heroes || []);
  const reps = representativeCompositions(harness.context.heroes || []);
  const issues = [];
  let count = 0;
  for (const targetId of TARGET_IDS) {
    for (const combo of reps) {
      const text = renderComposition(harness, targetId, combo);
      count += 1;
      for (const issue of findTextIssues(text, names)) issues.push({ targetId, composition: combo.label, combo, ...issue });
    }
  }
  failWithIssues('Representative composition text polish audit failed', issues);
  console.log(`Representative composition text polish static checks passed (${count} outputs)`);
  process.exit(0);
} catch (error) {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
}
