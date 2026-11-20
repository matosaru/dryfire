# Working context

Updated 2026-11-20. Active task: CHG-070 localization on `codex/environment-recovery-2026-11-19`. Keep `b` and `main` unchanged. Do not bump the app version until all feature tickets pass; final release/merge awaits the user's approval. Detailed tickets, forecasts, and time records are in [localization-plan.md](../localization-plan.md).

- **Done:** locale and SEO contract; YAML catalog compiler/validation/completeness gate; locale runtime and Settings selection; browser reload restores the selected locale while preserving local data; localized SEO output and artifact verification; accessibility/overflow and visual acceptance.
- **Latest acceptance:** Jest 188 suites / 1,299 tests; smoke 16/16; typecheck; both linters; architecture; complete EN/DE/NL catalogs plus static-copy audit; docs verification; full pinned visual suite 179 passed / 38 intentionally skipped / 0 failed. Public SEO artifact has 42 canonical pages across 14 routes. Public and preview distributions/profile verify.
- **This increment:** added the raw JSX/DOM text audit gate; localized initial Practice/Sequence review titles and Practice result fallback; removed the test-only About copy owner; regenerated and reviewed all 10 guide GIFs. Actual elapsed time approximately 24 minutes (0.40 h).
- **Remaining:** LOC-01 native/template/controller source ownership; LOC-05 common-message audit/interactions; LOC-06 remaining app/public/manual copy and source audit. LOC-09 final clean-candidate checks and one version bump after those tickets. Forecast 11.75 h (4.95–17.75 h), excluding fluent German/Dutch review and owner device acceptance.
- The feature branch contains all active changes. No version bump, merge, release, or deployment is claimed.
