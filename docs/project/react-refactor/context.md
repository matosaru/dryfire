# Working context

Updated 2026-11-20. Active task: CHG-070 localization on `codex/environment-recovery-2026-11-19`. Do not modify `b` or `main`; do not bump the version until the complete feature has passed acceptance. Scope, route/SEO decisions, ticket estimates and time records are in [localization-plan.md](../localization-plan.md) and [implementation-history.md](../implementation-history.md).

- Completed foundations: locale requirements/SEO contract; YAML compiler, key/placeholder/HTML validation and release-completeness gate; locale runtime, default-English persistence and Settings language selector; initial common/page migrations.
- Recent LOC-06 slices cover the Custom Drill Editor, animated Practice Guide examples, Learn calibration cards, Trigger Press/Sequence cards, Live Listen panels and shared safety/gun/startup shell copy. React UI primitives receive localized strings through props; native fallbacks use the same YAML catalogs. Saved user data and stable IDs remain unchanged.
- Latest slice validation: focused Live Listen/shell tests pass (17 tests across 7 suites); typecheck, both lint suites, architecture verification and localization completeness pass. The prior full Jest run is 185 suites / 1,258 tests; full suite/build/smoke checks have not yet been rerun after the current uncommitted slice.
- Open validation: `docs:check` reports stale guide media/source fingerprints and site inventory. Pinned Playwright Chromium remains unavailable because its CDN returns HTTP 403; system-Chromium screenshots are not accepted against the pinned baseline.
- Next: complete LOC-01's remaining run/history literals inventory; finish LOC-04 browser history/preference/data-preservation acceptance; finish LOC-05 shared-string audit; continue LOC-06 migration and translation-source audit; accept LOC-07 SEO route evidence; complete LOC-08 accessibility/overflow/visual coverage; finish LOC-09 documentation, validation and one version bump.
- Latest increment actual: 20m 03s (0.33 h), Live Listen and shared shell copy extraction. Current forecast: 23 active hours (12.25–36.5), excluding fluent translation review and owner device/browser acceptance. Earlier cumulative feature time is not reconstructible.

The Drills code/documentation increment is ready to commit and push to this feature branch only. No release, merge, or deployment is claimed.
