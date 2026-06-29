# v50.19 Pack S: Diagnosis Result UX Restructure

This pack reorganizes the diagnosis result UI after Pack R increased the amount of tactical information.

## Goals

- Show the most important 3 points first.
- Move long diagnosis sections into collapsible blocks.
- Add beginner summaries for detail diagnosis.
- Keep Pack A-R data intact while reducing reading load.
- Add static QA to prevent the UX layer from disappearing.

## Scope

- Composition diagnosis: top-three summary, section navigation, collapsible details.
- Detail diagnosis: beginner summary, grouped matchup sections, collapsible rank/review blocks.
- English rendering: matching top-three and beginner summary layout.
- Mobile: compact sticky section chips and details cards.

Browser QA is still pending until GitHub reflection resumes.
