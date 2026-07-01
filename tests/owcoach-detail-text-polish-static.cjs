#!/usr/bin/env node
const path = require('path');
const root = path.resolve(__dirname, '..');
const { TARGET_IDS, createHarness, renderDetail, heroNames, findTextIssues, failWithIssues } = require('./owcoach-render-audit-utils.cjs');
try {
  const harness = createHarness(root);
  const names = heroNames(harness.context.heroes || []);
  const issues = [];
  let count = 0;
  for (const targetId of TARGET_IDS) {
    for (const enemy of harness.context.heroes || []) {
      const text = renderDetail(harness, targetId, enemy.hero_id);
      count += 1;
      for (const issue of findTextIssues(text, names)) issues.push({ targetId, enemy: enemy.hero_id, ...issue });
    }
  }
  if (count !== TARGET_IDS.length * (harness.context.heroes || []).length) throw new Error(`unexpected detail render count: ${count}`);
  failWithIssues('Detail diagnosis text polish audit failed', issues);
  console.log(`Detail diagnosis text polish static checks passed (${count} outputs)`);
  process.exit(0);
} catch (error) {
  console.error(error && error.stack ? error.stack : String(error));
  process.exit(1);
}
