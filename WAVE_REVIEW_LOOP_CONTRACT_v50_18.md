# v50.18 Pack R: Wave Review Loop Contract

Pack R adds a review loop layer after the diagnostic advice.

## Required row shape

Every implemented target/enemy row must include:

- `review_pattern`
- `wave_goal`
- `review_question`
- `success_signal`
- `mistake_signal`
- `next_adjustment`
- `vod_marker`
- `micro_drill`

## Design rule

The review loop must not repeat the main matchup plan. It converts the plan into a short improvement cycle: goal, check question, success signal, mistake shape, next adjustment, replay marker, and micro drill.

## QA rule

Static QA fails if any row is missing, key fields are too short, runtime helpers are absent, or Pack R is not wired into the detail and composition outputs.
