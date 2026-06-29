# QA and GitHub Reflection Runbook

## Current rule

GitHub reflection is on hold until the user explicitly resumes it.

## Local static checks

Run from `repo_files/` first:

```bash
npm run check:syntax
node --check _combined.js
npm run check:handoff-readiness
```

Then repeat the same important checks in `dev_app/` and `public_release/` if needed.

## Browser QA when GitHub reflection resumes

1. Create a new branch from current `main`.
2. Copy the contents of `repo_files/` into the repository.
3. Commit as a single Pack T reflection commit.
4. Push branch.
5. Confirm GitHub Actions `browser-qa`.
6. If Actions pass, merge or create a release candidate tag.

## Manual public URL checks after deployment

- Japanese mode opens without modal blocking normal use.
- English mode opens and Pack F-M sections are not missing.
- Composition diagnosis can choose all 17 target heroes.
- Detail diagnosis can choose all 17 target heroes.
- Added targets: Junkrat, Pharah, Echo, Emre render text.
- Mobile width does not collapse the result cards.
- CSV loading does not fail.
- Old v49/v50 cache is not shown.

## Do not skip

Pack A-T added a large amount of data and render logic. Static QA passing is not enough. Browser QA is required before publication.
