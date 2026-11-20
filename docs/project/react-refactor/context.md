# Working context

Updated 2026-11-20. Active task: CHG-070 localization on `codex/environment-recovery-2026-11-19`. Do not modify `b` or `main`; do not bump the version until the complete feature has passed acceptance. Scope, route/SEO decisions, ticket estimates and time records are in [localization-plan.md](../localization-plan.md) and [implementation-history.md](../implementation-history.md).

- Completed foundations: locale requirements/SEO contract; YAML compiler, key/placeholder/HTML validation and release-completeness gate; locale runtime, default-English persistence and Settings language selector; initial common/page migrations.
- Recent LOC-06 slices cover the Custom Drill Editor, animated Practice Guide examples, Learn calibration cards, and Trigger Press/Sequence cards. React UI primitives receive localized strings through props; native fallbacks use the same YAML catalogs. Saved user data and stable IDs remain unchanged.
- Latest validation: focused Drills/component/fallback tests pass (26 tests across 8 suites); full Jest passes 185 suites / 1,258 tests; typecheck, both lint suites, architecture verification, localization completeness, smoke (16/16), public/preview builds and explicit matching-edition artifact verification pass.
- Open validation: `docs:check` reports stale guide media/source fingerprints and site inventory. Pinned Playwright Chromium remains unavailable because its CDN returns HTTP 403; system-Chromium screenshots are not accepted against the pinned baseline.
- Next tickets: finish LOC-01 key/source ownership inventory and unowned-copy scan; complete LOC-04 browser history/preference/data-preservation acceptance; finish LOC-05 shared-string audit; continue LOC-06 migration and translation-source audit; accept LOC-07 SEO route evidence; complete LOC-08 accessibility/overflow/visual coverage; finish LOC-09 documentation, validation and one version bump.
- Latest Drills/calibration increment actual: 18m 47s (0.31 h). Current forecast: 24 active hours (12.5–38.25), excluding fluent translation review and owner device/browser acceptance. Earlier cumulative feature time is not reconstructible.

The Drills code/documentation increment is ready to commit and push to this feature branch only. No release, merge, or deployment is claimed.
