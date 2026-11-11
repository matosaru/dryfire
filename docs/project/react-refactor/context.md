# Active work context

Updated 2026-11-11. [Free app plan](../free-app-next-work-plan.md) · [Component-library plan](../component-library-refactor-plan.md) · [Component-library specification](../component-library-refactor-spec.md) · [Performance contract](../../development/PERFORMANCE.md).

- Branch policy: all feature work goes to `b`; do not update `main` until the user explicitly approves promotion. Cloudflare deployment is separate and is not part of this task.
- Component-library refactor: CSS ownership migration and cleanup are complete locally. The architecture map records 51 packages (30 shared UI, 5 feature, 14 pages, 2 public-site); delivery is 45 aggregate, 2 lazy, 2 external, and 2 comment-only CSS files. The native-rendered first screen retains one ordered blocking stylesheet to preserve first paint and cascade.
- Version policy: kept the refactor at 0.8.8 until full-feature acceptance, then bumped once to 0.8.9 and refreshed About references.
- Versioned checks: 182 Jest suites / 1,195 tests; 16 smoke; 23 SEO; TypeScript, both lints, coverage ratchet, architecture/docs; public/preview production builds and distribution checks; pinned visual suites (public 175 pass / 38 intentional skips; preview 157 pass / 6 intentional skips); four pinned performance comparisons all passed with no confirmed slowdown. Startup budgets: public 50,083 gzip JS / 12,587 gzip CSS; preview 50,464 / 12,587.
- Exact `b` acceptance passed on [`4cf3d93`](https://github.com/matosaru/dryfire/commit/4cf3d93de9f77d0f45b1b88fdb9073d27e4ee695), GitHub run [43116383205](https://github.com/matosaru/dryfire/actions/runs/43116383205). About Dark/Light captures, visual baseline fingerprints, component/screen maps, and docs agree with 0.8.9.
- Refactor is complete on `b`. `main` remains unchanged; wait for explicit user approval before promotion. No Cloudflare deploy was made or claimed.
