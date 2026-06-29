# v50.20 Pack T: Handoff Readiness

Pack T prepares OW Coach for a safe chat handoff and later GitHub reflection.

## What changed

- Added `handoff_bundle/` with next-chat prompt, current state, pack history, QA runbook, GitHub hold notes, backlog, and file manifest.
- Added a handoff readiness contract.
- Added static QA: `npm run check:handoff-readiness`.
- Updated package metadata to `50.20.0`.
- GitHub reflection remains on hold.

## What did not change

- No matchup strategy values were changed.
- No hard paywall was added.
- No GitHub files were pushed.
- Playwright browser QA was not run locally.

## Use

In a new chat, paste `handoff_bundle/NEXT_CHAT_PROMPT.md` first.
