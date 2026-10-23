# Refactor working context

Updated 2026-10-23 UTC. Refactor implementation and automated acceptance are complete on **b only**; main/dev remain frozen. Do not merge or deploy without new release instructions.

Accepted application: **8a8906e42c3d9342c9343f2e096ee5f5469d5f68**, [CI 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411), all six jobs successful: validate, public/preview screenshots, public/preview performance and aggregate acceptance. Local full coverage959 tests/140 suites; original coverage/image/performance gates preserved. Earlier failures remain in evidence/history.

CHG-051 delegates architecture judgement: retain tested native startup adapters plus exclusive guarded lazy React owners. No eager React-only startup. All13 pages and25 UI components have source/CSS/tests/exports; browser entry is src/main.js, typed static markup is composed by tools/page-templates.mjs. Stable native input/file/meter/service/rollback islands intentionally remain. Cleanup removed12 templates,25 CSS wrappers and unused/test-only helpers, sharing preparation/text/history models. Catalogs move inert template nodes; no runtime HTML-string parser. Cache v68. No visual/data/schema/edition behavior change.

Original payload budgets pass: public JS166414raw/50609gzip, preview167988/51082; CSS61451/13011. Memory checks show stable warmed DOM/listener counts with disclosed React heap overhead/growth; no zero-leak/flat-heap claim. Physical iPhone acceptance, deployment and owner release remain separate. No more implementation is required by this refactor plan.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry guide](../../architecture/application-structure.md) · [Evidence](final-acceptance-evidence.json) · [History](../implementation-history.md) · [Execution archive](execution-history.md) · [Component map](../../architecture/component-map.json)

## Current work — CHG-053 complete on b

Work on **b only**. Main/dev frozen; no deployment. Full required tests must pass before application publication; diagnostics and cancelled runs are not passes.

CHG-057 card alignment/removal is published as1623012 following all-eight-job pre-merge CI39900134721. Post-push39901256344 failed the unchanged public WebKit warm timing gate (37→43ms); other validation/screenshots/performance jobs passed. Timing debt remains open.

CHG-053 applicationda08937 synchronizes Home/Drills/bottom Live Listen entries, explains three-trigger capture requirements and temporary blocking reasons, preserves active Stop and native/React ownership. Typed readiness model; no audio/storage/schema change. Timing controllers construct once when a gun exists rather than during empty onboarding; reset/restore/background paths covered. Checkpoint:1000tests/144suites+coverage and13Chromium lifecycle/readiness workflows pass. Public JS47222gzip/CSS13001gzip within original limits. Pinned screenshots, both-edition final checks and original performance acceptance remain pending.

Pinned collector39903205415 succeeds; image-only4ae6c44 has24 reviewed new guidance states.390goldens/81current captures; existing ready/listening references and ten GIF bytes/frames unchanged. Full candidate acceptance **39903463815 succeeds in all8jobs**. Exact patch6c4260d50d81eea739c57e21a49a21cb7bd1c0dc1d3c7855a619e782e560df4b retained in Gite8fa706; reverse-check succeeds before applying.1000tests/144suites+coverage,16smoke,13public+13preview local lifecycle cases, type/lint/architecture/docs/build/verify/payload pass. PublicJS47227gzip/CSS13001gzip.

Earlier isolated39903205450 failed public WebKit warm37→41ms; subsequent full gate passed all four comparisons and original controls. Preserve both results; no timing-consistency resolution claim. No benchmark baseline, thresholds, sample counts or controls changed. Temporary collector/patches/duplicate images removed after acceptance; hashes/Git review evidence retained.

Published exact accepted source as **da08937** on b. **Normal post-pushCI39904517004 succeeds in all8jobs**, including both screenshot suites, four browser/edition performance jobs with original controls and aggregate acceptance. Earlier isolated timing failure remains recorded; no thresholds/baselines/samples changed. Worktree clean after documentation handoff.

Requested card alignment/removal(CHG057) and Live Listen readiness(CHG053) are complete. No further authorized implementation in this queue. Main6c38bff; dev741f46e remain untouched. Cloudflare deployment/physical-device verification remain owner-managed. Continue b-only and full-gate-before-push for future work.
