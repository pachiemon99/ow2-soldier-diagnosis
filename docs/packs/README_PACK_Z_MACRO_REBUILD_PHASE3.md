# Pack Z / Macro Rebuild Phase 3

## Purpose
Phase 3 restructures the composition result screen into a fight-ready command order. Phase 1 added the macro composition lens and Phase 2 connected that lens to priority scoring. Phase 3 changes the top-level display order so players can read the output during a match without opening every section.

## Display order
1. Enemy win condition
2. Selected target hero's seat and positioning
3. Line to stop first
4. Target order
5. Skill wait / peak timing
6. Ultimate condition and forbidden action

## Implementation notes
- Keeps the existing `index.html` runtime model.
- Does not add browser-time CSV fetches.
- Adds `owcBuildPhase3CommandModel` and `owcRenderPhase3Composition`.
- Replaces the Japanese composition renderer through `owcRenderReadableComposition` while keeping detailed sections available below the command cards.
- Leaves GitHub reflection and ZIP generation to the user's explicit instruction.

## QA
Run:

```bash
npm run check:macro-rebuild-phase3
npm run check:app-source
npm run check:file-layout
```
