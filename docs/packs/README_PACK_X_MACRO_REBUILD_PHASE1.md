# Pack X WIP: Macro Composition Rebuild Phase 1

## Purpose
Overwatch playing research showed that OW Coach should read enemy teams less as five isolated matchups and more as one connected win condition. Phase 1 adds a macro lens over the existing v50.28 diagnosis engine without deleting the current matchup database.

## Applied in this phase
- Added a runtime macro composition lens in `index.html`.
- Added ten macro archetypes:
  - Dive Save
  - Isolation Dive
  - Poke Air
  - Split Angle
  - Rush Sustain
  - Heavy Sustain
  - Save Cycle
  - Anti Dive Trap
  - Objective Fortress
  - Balanced Tempo
- Added high-value pair synergy detection for common combinations such as Winston + Tracer, Reinhardt + Lúcio, Sigma + Widowmaker, Mercy + Pharah, and other practical pairs.
- Added target-hero macro lens lines for all 17 current diagnosis targets.
- Added a new result block: `構成読み取り 2.0`.

## Design rules
- Do not remove existing detailed matchup guidance yet.
- Do not change the selected target hero list yet.
- Do not add new browser runtime fetches.
- Keep the current `index.html` centered runtime model.
- Keep ZIP generation manual only.

## Next phases
1. Phase 2: Replace the old composition scoring thresholds with macro score contracts and dedicated QA.
2. Phase 3: Rebuild composition result UI around `敵の勝ち筋 -> 自分の席 -> 撃つ順番 -> 退路`.
3. Phase 4: Re-evaluate all 17 target × 51 enemy matchups using macro tags and sub-role context.
4. Phase 5: Expand synergy DB from pair detection to 3-hero cores and 5-hero archetype synthesis.
