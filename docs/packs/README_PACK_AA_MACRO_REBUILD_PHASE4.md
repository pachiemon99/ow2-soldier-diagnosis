# Pack AA: Macro Rebuild Phase 4

## Goal
Phase 4 rebuilds the detail diagnosis screen so a tapped enemy hero is not treated as an isolated matchup only. The screen now explains what that enemy is doing inside the enemy composition, what line to stop, what cooldown to wait for, and where the selected target hero should safely play.

## Runtime changes
- Added `OWC_MACRO_REBUILD_PHASE4_APPLIED` guard.
- Added `owcBuildDetailFunctionModel`.
- Added `owcRenderPhase4DetailBrief`.
- Wrapped `showHero` to inject a Phase 4 brief above the legacy detail sections.
- Kept the previous detail diagnosis, rank advice, matchup reason, category, entitlement, depth, and wave review sections.

## Display order
1. Composition role of the tapped enemy.
2. Safe seat for the selected target hero.
3. Line to stop first.
4. Cooldown or condition to wait for.
5. Enabler / synergy check.

## QA intent
The dedicated static check verifies that the Phase 4 tokens, renderer, model builder, CSS marker, notes file, and npm script are present and that the app source remains syntactically valid.
