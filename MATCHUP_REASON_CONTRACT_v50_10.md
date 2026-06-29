# Matchup Reason Clarity Contract v50.10

This contract defines the minimum data shape for matchup reason clarity.

## Required rows
Every implemented target hero must have one row for every shared enemy hero.

Current target count: 17  
Current enemy count: 51  
Required rows: 867

## Required fields
- target_id
- target_ja
- enemy_id
- enemy_ja
- enemy_role
- enemy_sub_role
- matchup_rating
- verdict
- advantage_reason
- disadvantage_reason
- win_condition
- loss_condition
- play_priority
- confidence

## UI requirements
- Composition diagnosis must include selected-enemy matchup reason lines.
- Detail diagnosis must include a reason block explaining both favorable and unfavorable factors.
- Numeric scores must not be shown without textual reasoning.
