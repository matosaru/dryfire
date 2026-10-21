# Refactor working context

Updated 2026-10-21 (Europe/Vilnius).

## Rules and architecture

Approved autonomous refactor. Push **b only**, main/dev frozen, no release PR/manual deployment. Preserve design/behavior/data/schema/edition/minification and original coverage/image/performance gates. Give meaningful updates every60 seconds; never claim unobserved CI/deployment or background work. CHG-051: owner said “use your judgement”; selected [progressive startup adapters](../../architecture/decisions/001-progressive-react-startup.md) with guarded lazy React owners, not eager React-only startup. This resolves unconditional-retirement scope, not performance acceptance.

P0–P6 structural/runtime scope verified. Cleanup retires12 templates,25 CSS wrappers, test-only helpers/unused declarations and duplicate preparation/text/history presentation decisions.13 pages +25 UI components have source/CSS/tests/exports. Intentional native input/meter/file/rollback/service/first-entry boundaries remain.306-file exact-content audit finds no duplicate files, not proof of zero semantic duplication. P8 [architecture and entry-point guide](../../architecture/application-structure.md) is prepared; final acceptance remains open.

## Latest source and checks

Published parent65334f0. New candidate adds trusted static-catalog materialization: same typed Practice/calibration DOM embedded as non-executable data. Practice expands during normal startup renderCatalog; calibration before first Learn render. No idle/network delay, dropped controls or duplicate layout source. Host/delegated handlers retained; helpers restrict known roots/reject nested scripts and do not consume user/stored HTML. Cache v67. Body-only safe quote compaction and two-host visibility remain. Media manifest now tracks all build/runtime helpers. CSS/images/GIF/frame baselines unchanged.

959 tests /140 suites, original coverage ratchet and helper100% coverage pass.55 affected cases; static/type/lint/architecture/docs,16 smoke checks,19 public +18 preview system-Chromium workflows and both original payload limits pass. Public JS166415/50617 raw/gzip, HTML54193/12393; preview JS167989/51078, HTML54814/12559; CSS61451/13011. [Evidence](final-acceptance-evidence.json). Publish new candidate and observe canonical CI; no new-source acceptance yet.

## Failures and limits to retain

CI39587543820 at785a69b: validate/public screenshots pass; preview317 passes plus1 Resume synchronization failure. Test-only repair7b6999f waits inputActive, explicitly delays resume permission and preserves Connecting/no-input until release;6 practice-start cases pass locally per edition. No clock/threshold/retry/image change. That CI also confirms public WebKit warm38→43ms (36/40 slower) and preview Chromium navigation21.6→22ms (32/40 slower). Superseded run39589082064 cancelled, not acceptance. Older fully green496c850/05733a1 do not supersede these later failures.

CI39591151715 at65334f0 passes validate/both pinned screenshot editions/preview performance comparison but public WebKit warm42→50ms (36/40 slower; DOMInteractive17→25ms) fails. Do not claim older green checkpoints as acceptance. Intermediate local4-pair click-feedback failure is also retained. Final canonical both-edition CI is required. Do not lower gates or call the refactor complete while it fails.

Memory: repeated60-repetition capture releases;30 fixed-data navigation cycles stabilize DOM/listeners, with disclosed heap overhead/growth. Extra30 private graph/editor/Free-Full cycles show stable2190 nodes/985 listeners after warmup, no page errors; heap4.12→4.48MB cycle5→29. No zero-leak/equal-memory/flat-heap claim. Physical iPhone acceptance and live deployment remain separate. Original baseline worktree:/tmp/dryfire-original-public at6c38bff, independently installed/built.

## Next

Push the verified catalog candidate to b, observe its canonical both-edition CI, fix reproducible failure without relaxing original gates. Once green, mark P7/P8 automated/architecture acceptance complete and publish final docs/history/context on b. Main/dev frozen, no release PR or manual deployment. No native/commercial scope expansion.

[Spec](spec.md) · [plan](plan.md) · [history](../implementation-history.md) · [approvals](../approval-log.md) · [component registry](../../architecture/component-map.json)
