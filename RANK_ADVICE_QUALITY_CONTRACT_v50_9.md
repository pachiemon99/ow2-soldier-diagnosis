# v50.9 Pack I - Rank Advice Quality

This pack standardizes rank advice across all implemented OW Coach target heroes.

## Scope

- 17 target heroes.
- 51 enemy heroes per target.
- 867 rank-advice rows.
- Five tiers per row: Bronze, Silver, Gold, Platinum, Diamond+.

## Runtime behavior

`expandRankAdvice()` now checks the v50.9 rank-advice DB first. Existing detail row rank fields and generated runtime advice remain as fallbacks.

## Design goal

Rank advice should not be a repeated generic paragraph. Each tier should teach a different layer:

1. Bronze: survival, cover, and not chasing.
2. Silver: skill wait timing.
3. Gold: teammate timing and basic target switch.
4. Platinum: proactive angle, highground, and resource purpose.
5. Diamond+: cooldown cycle prediction and ultimate timing.
