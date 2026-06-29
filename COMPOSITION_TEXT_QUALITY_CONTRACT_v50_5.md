# OW Coach v50.5 Pack E - Composition Text Quality Contract

## Purpose
Improve the user-facing composition diagnosis text after Pack D introduced five-enemy synthesis.

## Required sections
Each implemented target hero must receive composition text through the same shared phase functions:

1. `owcSynergyOpeningLines()` - opening judgement and first objective.
2. `owcSynergyOrderLines()` - target order based on the synthesized stop-order plan.
3. `owcSynergyHighgroundLines()` - high-ground and repositioning judgement.
4. `owcSynergyPeakLines()` - peek timing and re-peek discipline.
5. `owcSynergyUltimateLines()` - ultimate use conditions.
6. `owcSynergyForbiddenLines()` - forbidden actions tied to the enemy five-person plan.

## Rules
- Keep the existing Pack D composition labels stable.
- Do not fall back to a single generic high-ground or peek sentence.
- Do not describe five enemies as isolated one-on-one matchups.
- Keep language concrete: opening, target order, high-ground, peek, ultimate, and forbidden action.
- Existing target-specific engines may keep their own extra line, but the Pack E shared phase text must come first.
