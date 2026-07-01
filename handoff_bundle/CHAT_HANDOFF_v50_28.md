# OW Coach Chat Handoff v50.28

## Current state
- Version: `50.28.0`
- Package: `OW Coach v50.28 composition priority and win-condition consistency polish.`
- Latest package type: full GitHub Desktop reflection ZIP. Future ZIPs should continue to include the whole project, including unchanged files.
- `_combined.js` has been removed. QA now extracts app JavaScript from `index.html` using `tests/owcoach-app-source-utils.cjs`.
- `data/` CSV files are retained, but were compacted with shared metadata and a hero registry.
- Runtime behavior remains centered on `index.html`. CSV files are editing, audit, and QA sources, not additional browser runtime fetches.

## Major recent work completed
1. Pack V file layout optimization.
2. UI and diagnosis text cleanup.
3. Skill ownership guard, including `ヴォイド・バリア = ラマットラ` and Sigma skills filtered correctly.
4. D.Va vs Reaper / Death Blossom evaluation adjusted for Defense Matrix value.
5. Full-source duplication reduction by removing `_combined.js`.
6. CSV source compaction while preserving `data/`.
7. Japanese text quality audit:
   - Detail diagnosis: 17 targets × 51 enemies = 867 outputs.
   - Representative composition diagnosis: 17 targets × 7 archetypes = 119 outputs.
   - Large sample composition diagnosis batches: multiple 1,360–3,400 output checks.
8. Content validity audit:
   - Prevented non-selected enemy skills from appearing.
   - Reduced incorrect dive, flanker, long-sightline, and air-pressure labels.
   - Improved composition priority, win-condition, and forbidden-action consistency.

## Current key QA status
Passed locally:
- `npm run check:csv-structure`
- `npm run check:app-source`
- `npm run check:text-clarity`
- `npm run check:detail-text-polish`
- `npm run check:composition-representative-polish`
- `npm run check:composition-content-validity`
- `npm run check:composition-priority-consistency`
- `npm run check:matchup-consistency`
- `OWC_SAMPLE_PER_TARGET=80 npm run check:composition-large-sample-polish`
- `npm run check:file-layout`

`npm run check:syntax` was started and passed through the earlier checks, but timed out while running the heavy composition priority section. The remaining heavy checks were then run individually and passed. Browser QA has not been run locally.

## Important user preferences
- User prefers Japanese responses.
- Do not generate ZIPs unless explicitly requested.
- When generating ZIPs, create a full ZIP including unchanged files unless the user explicitly asks for a delta ZIP.
- Do not provide standalone `index.html` previews unless the user asks to check in browser.
- Be precise about local vs GitHub state. Latest work is local package generation unless user says they reflected it to GitHub.
- User uses GitHub Desktop ZIP workflow. Avoid Git Bash / PowerShell workflow unless explicitly requested.

## Recommended next actions
1. Reflect the v50.28 full ZIP via GitHub Desktop.
2. Run GitHub Actions `browser-qa`.
3. If browser QA passes, merge to main.
4. If QA fails, inspect Playwright report ZIPs before editing.
5. Next quality work, if requested: content validity second pass focused on actual hero-by-hero matchup advice, especially newly added or nonstandard heroes.

## Suggested branch and commit
- Branch: `pack-w-v50-28-quality-audit-handoff`
- Commit message: `Polish diagnosis text quality and add v50.28 handoff package`
