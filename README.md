# OW Coach v49.43 Public URL SEO QA (public)

This package consolidates the v49.31-v49.40 Playwright browser QA additions into a ZIP-ready QA build.

## Included E2E coverage

- Language roundtrip endurance tests.
- All 10 target hero composition diagnosis tests in Japanese and English.
- Five-stage affinity regression tests.
- Enemy Damage/Support duplicate-prevention tests.
- English mobile sticky/KPI layout tests.
- All 51 hero detail diagnosis tests.
- Policy page language UI tests.
- Broken output / legacy NG wording regression tests.
- Invalid localStorage fallback tests.
- Visual snapshot capture tests for GitHub Actions artifacts.

## Local run

```bash
npm install
npx playwright install
npm run check:syntax
npm run test:e2e
```

## GitHub Actions

The workflow `.github/workflows/playwright.yml` runs syntax checks and Playwright browser QA on push, pull request, and manual dispatch.
Artifacts include `playwright-report`, `test-results`, and `visual-snapshots`.


---

## v49.40 Visual Snapshots E2E WIP

- Added `tests/owcoach-visual-snapshots.spec.js`.
- The E2E suite now captures visual review screenshots for first-visit language selection, flag language menus, English mobile diagnosis, sticky header after scroll, all target diagnosis summaries, detail diagnosis after language switching, and all policy language pages.
- GitHub Actions now uploads a separate `visual-snapshots` artifact in addition to Playwright reports and `test-results`.
- ZIP generation is intentionally deferred for this WIP stage.

# OW Coach v49.39 LocalStorage Fallback E2E WIP

- Added `tests/owcoach-localstorage-fallback.spec.js`.
- Strengthens invalid `localStorage` value handling checks for the main page and policy pages.
- Verifies invalid language values fall back to Japanese, invalid first-choice flags show the language modal, and corrupted extra keys do not break diagnosis/detail rendering.
- ZIP generation is intentionally deferred at this WIP stage.

# OW Coach v49.37 Policy Language UI E2E WIP

- Added Playwright regression tests for policy page language UI.
- Covers notices, terms, privacy, and tokusho pages.
- Checks first-visit modal, flag menu, self-named language options, language round trips, title/meta/body switching, invalid localStorage fallback, and navigation pills.
- ZIP generation is intentionally pending until the next QA/release step.

# OW Coach v49.34 Enemy Unique E2E WIP

- Added dedicated Playwright regression tests for enemy Damage/Support duplicate prevention.
- Checks initial values, disabled duplicate options, programmatic duplicate repair, language round trips, target hero changes, and tank slot non-overrestriction.
- ZIP generation is intentionally held for the WIP phase.

# OW Coach v49.31 Language Roundtrip Endurance WIP

This WIP adds a strengthened Playwright browser test for repeated language switching.

## Added QA

- Japanese -> English -> Japanese endurance loop, 10 switches.
- English -> Japanese -> English endurance loop, 10 switches.
- Diagnosis result language cleanliness after every switch.
- Detail matchup language cleanliness after every switch.
- Target hero select labels stay language-correct after every switch.
- Language options remain self-named: `日本語 / English`.
- Enemy damage/support duplicate prevention remains active after switching.
- Invalid `localStorage.owcoach_lang` fallback is checked.

## Local run

```bash
npm install
npx playwright install
npm run test:e2e
```

## Syntax check

```bash
npm run check:syntax
```



## v49.32 All Target Diagnosis E2E WIP

- Added `tests/owcoach-all-target-diagnosis.spec.js`.
- Runs composition diagnosis for all 10 diagnosable heroes in Japanese and English.
- Verifies five-stage affinity labels only.
- Verifies target labels, enemy slot uniqueness, no legacy affinity labels, and no broken output tokens.
- ZIP generation is intentionally pending until the next QA pass.


## v49.33 Affinity Five-Stage E2E WIP

- Added `tests/owcoach-affinity-five-stage.spec.js`.
- Scans app source files for legacy affinity labels and `normalizeCompAffinity`.
- Verifies source scoring helpers return only the five Japanese affinity labels.
- Runs all 10 diagnosable heroes against three enemy fixtures in Japanese and English.
- Verifies DOM affinity labels stay in the five-stage set after language switching.
- ZIP generation is intentionally pending until the next QA pass.

## v49.37 All Hero Detail E2E WIP

- Added `tests/owcoach-all-hero-detail.spec.js`.
- Verifies that all 51 shared heroes open a detail diagnosis in Japanese and English.
- Checks detail language consistency, missing output (`undefined` / `null` / `[object Object]`), old NG words, stable `data-hero-id`, official role/sub-role labels, and detail persistence across repeated language switching.
- ZIP generation is intentionally deferred for the WIP phase.

## v49.38 Broken Output Regression E2E

- Added `tests/owcoach-broken-output-regression.spec.js`.
- Checks main page and policy pages for visible `undefined`, `null`, `[object Object]`, and `NaN`.
- Checks old wording such as `ストルワート`, `Hard No`, `横道`, `触る`, `遮蔽へ切る`, and legacy affinity labels.
- Sweeps all 10 composition targets in Japanese and English.
- Sweeps all 51 hero detail pages in Japanese and English.
- Checks that language round trips do not reintroduce old labels or broken placeholder output.



## v49.43 Public URL SEO QA

- Restored `robots.txt` and `sitemap.xml` at the package root.
- Added `tests/owcoach-seo-files.spec.js` to verify both files exist, are served by the static server, and include all public OW Coach pages.
- Default URL placeholder is `https://owcoach.jp`. Before public release, replace it in both `robots.txt` and `sitemap.xml` with the real GitHub Pages or custom domain URL.
- Public pages listed in the sitemap: `/`, `/notices.html`, `/terms.html`, `/privacy.html`, `/tokusho.html`.
