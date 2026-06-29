# Diagnosis Result UX Contract v50.19

OW Coach diagnosis output must be readable in layers.

## Required layers

1. Top summary: three actionable points before any long text.
2. Core details: opened by default.
3. Tactical details: target order, skill timing, ultimate use, and review loop.
4. Deep details: matchup reasons, rank advice, paid-value sections.

## Rules

- Do not remove existing Pack A-R data sources.
- Long sections should be rendered inside `details.owcUxDetails`.
- Japanese output must include `今回の最重要ポイント` and `初心者向け要約`.
- English output must include `Top 3 Priorities` and `Beginner Summary`.
- QA must check for the renderer names and section order constant.
