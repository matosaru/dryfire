# Refactor working context

Updated 2026-10-20 (Europe/Vilnius). Compact handoff; detailed scope/results stay in the linked documents.

## Durable rules

- Continue approved refactor steps automatically; publish verified increments to **b only**. **Main and dev stay unchanged.** No deployment or repeated step approvals.
- Preserve visuals, behavior, saved data, Free/Full boundaries and final performance. Keep source minified and original test/image/performance baselines intact.
- Give progress updates at least every 60 seconds during active work. Save credits by avoiding redundant runs/dev synchronization.
- Report local checks, push, canonical CI and deployment separately. Never turn pending/failed evidence into “passed” or imply unattended background progress.

## Current work

Source: b HEAD (`git log -1` identifies the exact published increment).

P0/P1 complete; P2–P5 presentation/runtime handoffs verified. Native startup fallback retirement remains P7.

**P6 active:** shared live Practice/Sequence Run/Review and read-only guide runtime are verified. Typed PracticePage, SequencePage and PracticeGuidePage parent source/CSS/test packages now supply prerendered HTML through `app/renderSessionPages`; complete frozen parent DOM preserves all forms/defaults/IDs. PageHeading supports explicit native Back IDs without extra global listeners. Trusted numeric slots still compile through existing bounded NumberInput. Parent runtime/manual/configuration writes are still native; source extraction alone is not P6 completion.

## Next action

Continue **P6 parent runtime handoffs** on b. Read [session ownership notes](session-ownership-notes.md). Add explicit model/update ports for parent titles/guide links/context/steps/manual text, and route main's gun-context writes through them after mount. Retain exact Configure nodes (native badInput/drafts), outer Run/Review hosts and guide figure, keeping their mounted child roots alive. Mount only on a later explicit unlocked/paused entry, never asynchronous import completion. Preserve rollback/focus and shared templates; no approval needed. Main/dev remain frozen.

## Verification and open debt

Latest parent source increment: **884 tests /128 suites**, full coverage ratchet, type/lint/architecture/docs,16 smoke checks, both minified artifacts and **20 public +20 preview Chromium workflows** pass. New three pages/build adapter100% measured coverage. Three complete frozen parent DOM signatures, all1,333 native guide signatures and1,333 React guide frames remain equivalent. Both-theme guide/saved-review pixels, actual live timing/cleanup/drafts, silent playback/return and offline loading remain protected. CSS61451/13011 and original hash are byte-identical; temporary valid top-level CSS wrappers preserve cascade after an import-order issue was caught by production artifact verification. Use only final browser logs, not the discarded intermediate CSS build. Worker cache v57 updates prerendered pages.390 image references,83 captures and12 GIFs remain intact through input-equivalence review.

Critical JS raw bytes remain177388 public /178683 preview; gzip54217/54570 (+3410/+3424 vs original). Initial HTML falls505 raw bytes per edition to55757/12459 public and56396/12628 preview raw/gzip. Performance gates remain failing P7 debt; no fresh passing startup timing inferred. Final release still requires original-baseline acceptance. Generic strict UI audit still reports34 existing findings under RF-11, not compliance.

Local Chromium is diagnostic; pinned canonical CI and deployment are separate. Earlier f94e063 CI validation passed; original performance comparison steps failed and screenshots were pending at last inspection. New source publication does not establish CI/deployment success. Real iPhone microphone/beep verification remains separate. Temporary CSS fragments, unused raw parent templates and native startup fallback retirement stay P7.

## Sources of truth

- [Repository rules](../../../AGENTS.md) and [approved specification](spec.md)
- [Active plan/checklist](plan.md) and [implementation history](../implementation-history.md)
- [Approvals](../approval-log.md), [requirements](../../requirements/README.md), [designs](../../design/README.md)
- [Ownership map](../../architecture/component-map.json), [page handoffs](../../architecture/page-templates.md), [screen/source registry](../../architecture/screen-map.json)

## After every completed task

Replace this summary's current work, evidence, open issues and next action; do not append a timeline. Offload details to their authoritative document and link them. Remove superseded status while retaining user constraints, approval pointers and unresolved failures. Keep this handoff compact (roughly 40–60 lines), then resume by reading it, the relevant linked section and git state.
