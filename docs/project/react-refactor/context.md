# Refactor working context

Updated 2026-10-21 (Europe/Vilnius).

## Rules and architecture

Approved autonomous refactor. Push **b only**, main/dev frozen, no release PR/manual deployment. Preserve design/behavior/data/schema/edition/minification and original coverage/image/performance gates. Give meaningful updates every60 seconds; never claim unobserved CI/deployment or background work. CHG-051: owner said “use your judgement”; selected [progressive startup adapters](../../architecture/decisions/001-progressive-react-startup.md) with guarded lazy React owners, not eager React-only startup. This resolves unconditional-retirement scope, not performance acceptance.

P0–P6 structural/runtime scope verified. Cleanup retires12 templates,25 CSS wrappers, test-only helpers/unused declarations and duplicate preparation/text/history presentation decisions.13 pages +25 UI components have source/CSS/tests/exports. Intentional native input/meter/file/rollback/service/first-entry boundaries remain.306-file exact-content audit finds no duplicate files, not proof of zero semantic duplication. P8 [architecture and entry-point guide](../../architecture/application-structure.md) is prepared; final acceptance remains open.

## Latest source and checks

Parent7b6999f. Current candidate: two-host visibility update (same forced-toggle no-op semantics), body-only safe HTML quote compaction through build-only html-minifier-terser7.2.0, cache v66. Head/class/verifier marker syntax stays intact; parsed full-app DOM is exact. Strengthened layout tests assert one active host for every screen/theme/width. Vite/helper/export dependencies reviewed in media manifest; CSS,390 image references,83 captures,12 GIFs unchanged.

956 tests /139 suites and original coverage ratchet pass;23 affected cases, static/type/lint/architecture/docs,16 smoke checks,18 public +20 preview system-Chromium workflows and both static payload gates pass. Public JS166286/50575 raw/gzip, HTML54087/12376; preview JS167862/51042, HTML54708/12538; CSS61451/13011. [Evidence](final-acceptance-evidence.json). No pinned final CI result yet.

## Failures and limits to retain

CI39587543820 at785a69b: validate/public screenshots pass; preview317 passes plus1 Resume synchronization failure. Test-only repair7b6999f waits inputActive, explicitly delays resume permission and preserves Connecting/no-input until release;6 practice-start cases pass locally per edition. No clock/threshold/retry/image change. That CI also confirms public WebKit warm38→43ms (36/40 slower) and preview Chromium navigation21.6→22ms (32/40 slower). Superseded run39589082064 cancelled, not acceptance. Older fully green496c850/05733a1 do not supersede these later failures.

Intermediate current-stage local4-pair timing failed click-feedback p95 before the final target-toggle variant; trace retained. Final canonical both-edition CI is required. Do not lower gates or call the refactor complete while it fails.

Memory: repeated60-repetition capture releases;30 fixed-data navigation cycles stabilize DOM/listeners, with disclosed heap overhead/growth. Extra30 private graph/editor/Free-Full cycles show stable2190 nodes/985 listeners after warmup, no page errors; heap4.12→4.48MB cycle5→29. No zero-leak/equal-memory/flat-heap claim. Physical iPhone acceptance and live deployment remain separate. Original baseline worktree:/tmp/dryfire-original-public at6c38bff, independently installed/built.

## Next

Push verified candidate to b, observe final pinned both-edition CI and fix any reproducible failure. Once original gates pass, mark P7/P8 automated/architecture acceptance complete, update plan/history/context and publish final docs on b. Main/dev unchanged. No native/commercial/product scope expansion.

[Spec](spec.md) · [plan](plan.md) · [history](../implementation-history.md) · [approvals](../approval-log.md) · [component registry](../../architecture/component-map.json)
