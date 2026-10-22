# Refactor working context

Updated 2026-10-22 UTC. Refactor implementation and automated acceptance are complete on **b only**; main/dev remain frozen. Do not merge or deploy without new release instructions.

Accepted application: **8a8906e42c3d9342c9343f2e096ee5f5469d5f68**, [CI 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411), all six jobs successful: validate, public/preview screenshots, public/preview performance and aggregate acceptance. Local full coverage959 tests/140 suites; original coverage/image/performance gates preserved. Earlier failures remain in evidence/history.

CHG-051 delegates architecture judgement: retain tested native startup adapters plus exclusive guarded lazy React owners. No eager React-only startup. All13 pages and25 UI components have source/CSS/tests/exports; browser entry is src/main.js, typed static markup is composed by tools/page-templates.mjs. Stable native input/file/meter/service/rollback islands intentionally remain. Cleanup removed12 templates,25 CSS wrappers and unused/test-only helpers, sharing preparation/text/history models. Catalogs move inert template nodes; no runtime HTML-string parser. Cache v68. No visual/data/schema/edition behavior change.

Original payload budgets pass: public JS166414raw/50609gzip, preview167988/51082; CSS61451/13011. Memory checks show stable warmed DOM/listener counts with disclosed React heap overhead/growth; no zero-leak/flat-heap claim. Physical iPhone acceptance, deployment and owner release remain separate. No more implementation is required by this refactor plan.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry guide](../../architecture/application-structure.md) · [Evidence](final-acceptance-evidence.json) · [History](../implementation-history.md) · [Execution archive](execution-history.md) · [Component map](../../architecture/component-map.json)

## Current work

CHG-056 test corrections fully accepted by [CI39833498121](https://github.com/matosaru/dryfire/actions/runs/39833498121) on52ff7dd with review patch SHA2567b5319973566ca303a04f52d09c60fefff5502369a33ceefe1d99f9d1d32ba87. All eight jobs success: validate, both edition screenshots, four independent edition/browser performance jobs, aggregate acceptance. Original baseline/threshold/sample/control/image requirements unchanged. Browser isolation resolved the previous warm timing failure without loosening acceptance. Local980/142+coverage,16smoke,18public+11preview integration and18clock integration pass. Exact application patch verified against working tree before applying to b. No main/dev change or Cloudflare deployment.

Permanent rule: fix all tests and require full candidate unit/coverage, integration, both-edition builds, pinned Chromium/WebKit screenshots and original performance before merging application changes. Focused tests, diagnostics, cancellations and pending runs are not passes. Main/dev frozen; b only; no per-step approval.

Fixes: restore sequence fixtures suppressed by dangling condition; preserve supported immutable session title snapshots with strict historical-title validation; correct Settings fixture ownership; lazy same-build same-origin validated guide module retry after WebKit cached import rejection; shared browser clock helper freezes at exact reviewed timestamp without install/pause race. Current PNG/GIF frames/CSS preserved, cachev78. Detailed superseded failures/cancellations remain in implementation history and CI.

Next authorized task: uniform practice/sequence drill-card layout; align title with sublabel, remove preset-steps chips from catalog cards, update requirements/designs/unit/visual references. New intended visual change must be reviewed separately from CHG-056 corrective baseline-preserving work. Keep actual sequence definitions/configuration intact. Run full acceptance before applying that candidate to b.

CHG053 Live Listen readiness sync remains queued after card alignment; no runtime implementation. Notes `/tmp/live-listen-implementation-notes.md`, `/tmp/listeningReadiness.test.js.pending`, `/tmp/live-listen-readiness.spec.js.pending`.
