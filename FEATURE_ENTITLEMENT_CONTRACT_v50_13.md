# v50.13 Pack M: Free / Paid Entitlement Flags Contract

## Purpose

Pack M adds monetization metadata to OW Coach before implementing payment or authentication. The goal is to separate product design from paywall mechanics.

## Rules

1. Every implemented target/enemy matchup must have one entitlement row.
2. Allowed tiers are `free`, `preview`, and `paid` only.
3. The app must not enforce a hard paywall in this pack.
4. Basic composition results and matchup plan stay free.
5. Category summary and priority overview are preview content.
6. Matchup reasons, skill wait windows, ultimate decision, and rank advice are paid-value content.
7. Runtime helpers must expose the metadata for a future auth/payment layer.

## Intended paid product boundary

- Free: composition rating, composition type, basic plan.
- Preview: matchup category and priority overview.
- Paid: detailed reasons, cooldown timing, ultimate decisions, rank-specific advice, and unique matchup focus.
