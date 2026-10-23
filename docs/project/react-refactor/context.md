# Refactor working context

Updated 2026-10-23 UTC. Refactor implementation and automated acceptance are complete on **b only**; main/dev remain frozen. Do not merge or deploy without new release instructions.

Accepted application: **8a8906e42c3d9342c9343f2e096ee5f5469d5f68**, [CI 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411), all six jobs successful: validate, public/preview screenshots, public/preview performance and aggregate acceptance. Local full coverage959 tests/140 suites; original coverage/image/performance gates preserved. Earlier failures remain in evidence/history.

CHG-051 delegates architecture judgement: retain tested native startup adapters plus exclusive guarded lazy React owners. No eager React-only startup. All13 pages and25 UI components have source/CSS/tests/exports; browser entry is src/main.js, typed static markup is composed by tools/page-templates.mjs. Stable native input/file/meter/service/rollback islands intentionally remain. Cleanup removed12 templates,25 CSS wrappers and unused/test-only helpers, sharing preparation/text/history models. Catalogs move inert template nodes; no runtime HTML-string parser. Cache v68. No visual/data/schema/edition behavior change.

Original payload budgets pass: public JS166414raw/50609gzip, preview167988/51082; CSS61451/13011. Memory checks show stable warmed DOM/listener counts with disclosed React heap overhead/growth; no zero-leak/flat-heap claim. Physical iPhone acceptance, deployment and owner release remain separate. No more implementation is required by this refactor plan.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry guide](../../architecture/application-structure.md) · [Evidence](final-acceptance-evidence.json) · [History](../implementation-history.md) · [Execution archive](execution-history.md) · [Component map](../../architecture/component-map.json)

## Current work — CHG-058 accepted; publication verification next

**b only. Main/dev frozen. No deployment.** Full required acceptance precedes application publication; pending/cancelled/diagnostic runs are not passes.

CHG058 shared Sequence/Practice configuration is accepted in all8 jobs of **39959685865**.1013tests/147suites+coverage, both-edition minified builds/payloads, pinned Chromium/WebKit workflows/screenshots and all four original performance gates/controls pass. Exact source patchd91ef6ba727d54a69363650ec50e1b980ab27a71588a09ad93dd157a2354d937 retained in Git966f2e6; reverse-check verified before applying.398goldens/83current captures;64 derived Practice/safety references reviewed. Sequence/guide references and ten GIF files unchanged. Modal interior pixel identity proved. Shared native form/draft/safety/data/edition ownership preserved; source entry remains src/main.js.

DrillSetup owns shared form/count/ordered-step geometry. Practice adopts Sequence setup; run/review fragments unchanged. Rendering optimization skips duplicate Practice refresh and equal native writes with fresh IDs. Startup getLibraryOverview uses one read-only snapshot, existing schema/migration/write rules, then existing recovery/profile flow. Earlier timing failures in39953233357/39955534502 remain recorded.39957863599 actual tests passed but preview cleanup timed out; screenshot CI allowance15minutes fixes infrastructure only. No test/image/application gate weakened.

Next: push accepted source to b, then observe normal post-pushCI before final all-green claim. Temporary review patches/collector/duplicate images removed; evidence remains in Git and chg-058-setup-review.json.

Latest user guide-control request is suggestion only: proposal4036c0a at docs/design/proposals/guide-control/README.md, screenshots for both groups. Outlined info control after context/sounds before setup, no underline/arrow. Application guide link unchanged; do not infer implementation approval.

Generic UI audit retains2 preexisting documented native-select findings. Main/dev/Cloudflare unchanged. Refactor remains complete; retain ADR001 startup adapters and project-owned original performance limits.
