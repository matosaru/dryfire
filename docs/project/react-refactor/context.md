# Working context

Updated 2026-11-21. CHG-070 localization implementation and clean-candidate validation are complete on `codex/environment-recovery-2026-11-19`. Keep `b` and `main` unchanged; do not version-bump, merge, or release until the user approves. Detailed tickets and test evidence are in [localization-plan.md](../localization-plan.md).

- **Done:** locale and SEO contract; YAML catalog compiler/validation/completeness gate; locale runtime and Settings selection; browser reload restores the selected locale while preserving local data; localized SEO output and artifact verification; accessibility/overflow and visual acceptance.
- **Acceptance:** full Jest **189 suites / 1,314 tests**; smoke **16/16**; typecheck; component/runtime lint; architecture; complete EN/DE/NL catalog and static-copy audit; docs verification; pinned visual suite **179 passed / 38 skipped / 0 failed**. Public SEO artifact verifies **42 canonical pages across 14 routes**; public and preview builds, artifact checks and profile verification pass.
- **Completed final increment:** shared React session fragments, page headings and numeric-input hints now require localized labels; added localized shared “Get ready” and number-format hints, and verified live locale updates for numeric hints. Full Jest, typecheck and all targeted gates passed. Actual time for this resumed increment was not tracked separately.
- **Remaining:** implementation tickets LOC-01–LOC-09 are closed. Human fluent German/Dutch review and owner browser acceptance remain before release. Version bump, merge, and deployment require the user's approval.
- Changes are staged on the feature branch only; no claim of version bump, merge, release, or deployment.
