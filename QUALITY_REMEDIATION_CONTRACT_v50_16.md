# v50.16 Pack P: Quality Remediation Contract

## Purpose

Pack P turns Pack O's audit findings into the first cleanup pass. It does not change the product model or map logic.

## Rules

1. Every implemented target/enemy detail row must expose the canonical fields `main`, `move`, `sustain`, `ultimate`, `cue`, and `practice`.
2. Old target-specific fields such as `peacemaker_management`, `railgun_management`, `storm_bow`, or `pulse_pistols` remain available.
3. CSV mirrors should contain the canonical fields so future editing uses one shape.
4. Abstract placeholder timing words should not remain in embedded data or CSV mirrors.
5. Post-remediation audit rows are advisory. Structural QA is hard-fail; content quality is prioritized by score.
