# Working context

Updated 2026-11-19. Active task: CHG-070 localization on `codex/environment-recovery-2026-11-19`. Do not modify `b` or `main`; do not bump the version until the complete feature has passed acceptance. Detailed scope, route/SEO design, ticket estimates and history are in [localization-plan.md](../localization-plan.md) and [implementation-history.md](../implementation-history.md).

- Completed foundations: locale requirements/SEO contract; YAML compiler, key/placeholder/HTML validation and release-completeness gate; locale runtime, default-English persistence and language selector; initial common/page migrations. Earlier branch checkpoint is `4e8324b`.
- Current increment: localized dynamic Settings audio/vibration status, Practice and Sequence setup-shell copy, and shared setup label props. Full Jest: 181 suites / 1,215 tests; smoke: 16/16; public build, `verify:dist`, component lint and typecheck pass. Two English Chromium drill-setup workflows pass at 320/390 px with `/usr/bin/chromium`.
- Open validation: pinned Playwright Chromium is not installed; `localization:complete` fails on empty Practice Guide catalogs; `docs:check` reports pre-existing stale guide/source fingerprints. Do not refresh reviewed fingerprints without reviewing affected screen/media evidence.
- Remaining tickets: finish LOC-01 source/key inventory; LOC-04 history/data acceptance; LOC-05 shared strings; LOC-06 controller-owned pages, guides and Help/manuals; LOC-07 localized public HTML/SEO/hreflang/sitemap; LOC-08 a11y/overflow/SEO coverage; LOC-09 full acceptance and one version bump.
- Actual engineering time is not tracked. Current remaining forecast is 48.5 hours (34.5–69), excluding fluent review and owner device/browser acceptance. No release, merge, or deployment is claimed.

Next action: continue LOC-06 with Practice Guide content and controller/runtime string ownership; retain English visual baselines and add functional tests for German/Dutch without locale-specific screenshot baselines.
