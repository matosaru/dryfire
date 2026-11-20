# Working context

Updated 2026-11-20. Active task: CHG-070 localization on `codex/environment-recovery-2026-11-19`. Keep `b` and `main` unchanged. Do not bump the app version until all feature tickets pass; final release/merge awaits the user's approval. Detailed tickets, forecasts, and time records are in [localization-plan.md](../localization-plan.md).

- **Done:** locale and SEO contract; YAML catalog compiler/validation/completeness gate; locale runtime and Settings selection; browser reload restores the selected locale while preserving local data; localized SEO output and artifact verification; accessibility/overflow and visual acceptance.
- **Latest acceptance:** Jest 187 suites / 1,292 tests; smoke 16/16; typecheck; component/runtime lint; architecture; complete EN/DE/NL catalogs; docs verification; full pinned visual suite 179 passed / 38 intentionally skipped / 0 failed. Public SEO artifact has 42 canonical pages across 14 routes. Preview artifacts and build profile verify.
- **This increment:** fixed the delayed React edit title and localized the History evaluation matrix; restored first-gun data disclosure and corrected practice cue spacing; reviewed and updated the English mobile History baseline and 10 guide exports. Actual elapsed time approximately 31 minutes (0.52 h).
- **Remaining:** LOC-01 global message/source ownership scan; LOC-05 shared-copy audit; LOC-06 final source audit and any remaining app/public copy. LOC-09 final clean-candidate checks and one version bump after those tickets. Forecast 12.49 h (5.49–18.74 h), excluding fluent German/Dutch review and owner device acceptance.
- The feature branch contains all active changes. No version bump, merge, release, or deployment is claimed.
