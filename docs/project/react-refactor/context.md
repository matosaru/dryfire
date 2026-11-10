# Active work context

Updated 2026-11-10. [Free app plan](../free-app-next-work-plan.md) · [Component-library plan](../component-library-refactor-plan.md) · [Component-library specification](../component-library-refactor-spec.md) · [Performance contract](../../development/PERFORMANCE.md).

- Work is isolated to branch `b`, based on `86a2817`; `main` and `dev` are unchanged. Changes are local, uncommitted and unpublished.
- Existing candidate product work includes persisted Metric/Imperial preference, per-item History deletion, one canonical mobile Chromium image per page type, semantic UI tokens, Codex workflow documentation and component-library architecture documentation.
- Component-library plan: CL0–CL3 complete; the first CL4 `InformationCard` slice passes both editions, single-emission CSS, canonical pixels, functional routes, and all four performance comparisons. CL4 remains in progress for other repeated primitives; CL5–CL11 remain. See plan for precise boundaries.
- Final unit run: 182 suites / 1,189 tests pass. Typecheck, component/runtime lint, coverage ratchet, docs, architecture and visual-coverage checks pass. Coverage percentages are preserved by the ratchet.
- Chromium visuals: public 105 passed / 5 intentional skips; preview 82 passed / 3 intentional skips. Dark and light delayed Settings handoff captures pass after the last change. `visual:review` verifies 26 page cases in one mobile Chromium project.
- Current CL4 payload: public 50,042 gzip JS / 12,587 gzip CSS; preview 50,414 gzip JS / 12,587 gzip CSS. Ten-pair timing comparisons pass in Chromium and WebKit for both editions, with no confirmed regression. JSON artifacts are in ignored `performance-results/`.
- The public and preview builds are locally verified. No push, branch CI, Cloudflare deployment, or live-edge validation has occurred. Physical iPhone microphone/audio checks remain owner testing.
