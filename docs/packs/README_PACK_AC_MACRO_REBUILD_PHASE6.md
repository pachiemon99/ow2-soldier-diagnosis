# Pack AC / Macro Rebuild Phase 6

## Purpose

Phase 6 adds Browser QA coverage for the macro rebuild work completed through Phase 5. The goal is to catch UI regressions in GitHub Actions instead of relying only on static checks.

## Browser QA scope

The new Playwright spec is:

- `tests/owcoach-macro-rebuild-phase6-browser.spec.js`

It checks:

- Phase 5 synthesis appears in `quick`, `standard`, and `detail` result modes.
- The composition result shows `完成コア検出 / 5人構成合成`.
- The result includes `敵5人の完成形`, `切るべき配線`, and `主勝ち筋 / 副勝ち筋`.
- Representative trio cores render without broken output.
- Phase 4 detail blocks remain visible after Phase 5 synthesis is active.
- Coverage runs under the existing Playwright projects, including `Mobile Safari width` and `Desktop Chromium`.

## Representative cases

- Winston + Tracer + Ana core
- Reinhardt + Mei + Lúcio core
- Sigma + Bastion + Baptiste core
- Phase 4 detail surface after a macro composition diagnosis

## GitHub Actions impact

`npm run test:e2e:ci` now includes the Phase 6 browser spec, so the `browser-qa` workflow will fail if the Phase 5/Phase 4 macro surfaces disappear or produce broken output.

## Notes

This phase does not change the diagnosis scoring itself. It adds browser-facing regression coverage for the existing macro rebuild UI.
