# Active work context

Updated 2026-11-11. [Free app plan](../free-app-next-work-plan.md) · [Component-library plan](../component-library-refactor-plan.md) · [Component-library specification](../component-library-refactor-spec.md) · [Performance contract](../../development/PERFORMANCE.md).

- Branch policy: all feature work goes to `b`; do not update `main` until the user explicitly approves promotion. Cloudflare deployment is separate and is not part of this task.
- Component-library refactor: CSS ownership migration and cleanup are complete locally. The architecture map records 51 packages (30 shared UI, 5 feature, 14 pages, 2 public-site); delivery is 45 aggregate, 2 lazy, 2 external, and 2 comment-only CSS files. The native-rendered first screen retains one ordered blocking stylesheet to preserve first paint and cascade.
- Version policy: kept the refactor at 0.8.8 until full-feature acceptance, then bumped once to 0.8.9. Version-derived About captures and source fingerprints must match 0.8.9 before release.
- Pre-bump checks: 182 Jest suites / 1,195 tests; 16 smoke; 23 SEO; TypeScript, both lints, coverage ratchet, architecture/docs; public/preview production builds and distribution checks; pinned visual suites (public 175 pass / 38 intentional skips; preview 157 pass / 6 intentional skips); four pinned performance comparisons all passed with no confirmed slowdown. Startup budgets: public 50,089 gzip JS / 12,587 gzip CSS; preview 50,465 / 12,587.
- Remaining: refresh About version captures at 0.8.9, rerun the exact-candidate gates, commit/push the candidate to `b`, then monitor GitHub CI. If checks pass, report it ready and wait for the user's approval before merging to `main`.
- No Cloudflare credentials, production deployment, or `main` write was used or claimed.
