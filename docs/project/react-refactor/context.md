# Active work context

Updated 2026-11-11. [Free app plan](../free-app-next-work-plan.md) · [Component-library plan](../component-library-refactor-plan.md) · [Component-library specification](../component-library-refactor-spec.md) · [Performance contract](../../development/PERFORMANCE.md).

- Accepted `b` base: [`f7a7bed`](https://github.com/matosaru/dryfire/commit/f7a7bed7fd660a1b3b2de0994a14ac8daa247e6d), version 0.8.8; complete CI [43092852578](https://github.com/matosaru/dryfire/actions/runs/43092852578) passed. `main` is unchanged.
- Existing candidate product work includes persisted Metric/Imperial preference, per-item History deletion, one canonical mobile Chromium image per page type, semantic UI tokens, Codex workflow documentation and component-library architecture documentation.
- Component-library refactor: CL0–CL3 complete, CL4 in progress, CL5–CL11 remain. Current uncommitted slice adds multi-stylesheet ownership for PracticeRun and RepetitionResult; no application CSS declarations or version bump.
- Local checks for this slice: 182 Jest suites / 1,193 tests, smoke 16/16, typecheck, component/runtime lint, architecture and docs checks pass. Public/preview optimized builds, artifact verification and payload budgets pass (50,091/50,456 gzip JS; 12,587/12,587 gzip CSS).
- The pinned Chromium binary is unavailable in this workspace (Playwright download returned 403). System Chromium ran semantic and layout tests, but its canonical screenshots differ from the pinned baseline and are not considered visual acceptance. Exact pinned public/preview visual and performance CI is still required for the candidate.
- Version workflow: keep 0.8.8 across this entire component-library feature; bump exactly once after all feature phases and gates pass on `b`, refresh About evidence, rerun the full exact-candidate gates, then wait for explicit user approval before promotion to `main`. No deployment is claimed.
