# 001 — Progressive React startup

Decision: retain the tested browser startup adapters alongside lazy React page owners. Accepted implementation decision on 2026-10-21 under CHG-051: after explanation of the alternatives, the owner said **“use your judgement”**. This delegates the architecture choice; it is not a waiver of performance, functionality, visual, data or edition requirements.

## Why

The isolated React hydration probe produces 67,811 gzip bytes before application functionality; the original public critical-JavaScript budget is 50,807 bytes. Eager React startup cannot meet that byte limit. Removing working startup handlers would also strand controls during delayed or failed downloads. Both problems contradict the unchanged-behavior/performance contract.

Typed React components remain the source of page/shell structure, with colocated CSS, tests and public exports. Build-time rendering emits immediately usable HTML. Existing small browser adapters populate data and handle controls before an optional renderer is available. A guarded atomic handoff then gives the React root exclusive ownership. Pure presentation decisions are shared between the two paths where applicable, including History scores/captions/evaluation, Settings capabilities, Live Listen feedback and Practice/Sequence run/review models.

## Rules

- No eager react-dom client dependency in the initial app entry merely to eliminate an active adapter.
- Retain platform/service ownership: native invalid-number drafts, file pickers, microphone meters, safety/capture guards, storage and independent Practice/Sequence engines.
- No two writers own the same region simultaneously. Once a page port exists, updates go through it. Module completion must not bypass route, profile, capture, safety or draft guards.
- Keep delayed/failed-chunk behavior, rollback/focus restoration and public offline assets tested. Private preview stays authenticated/no-store; no public Full override.
- Remove obsolete consumers, duplicate formatting and duplicate styles. Do not label an actively used startup renderer as dead code. New screens should use the established page/shared-component and presentation/controller boundaries.
- Original payload, timing, coverage, image and frame baselines remain unchanged. Record failures; do not claim acceptance from a small local timing sample.

## Trade-offs and completion scope

This is a progressive React architecture, not React-only runtime rendering. Some DOM construction remains in startup adapters; it is an intentional compatibility/performance boundary, not an untracked promise of later deletion. There is maintenance cost, protected by frozen native/React equivalence tests, component tests and pinned both-edition browser checks. Further consolidation is justified when it removes real duplication without changing behavior or exceeding budgets.

CHG-051 replaces the plan's unconditional native-first-entry retirement objective with consumer-audited retention under these rules. It does not permit unrelated feature work, deployment, main/dev updates, new billing/auth features or baseline relaxation. Final acceptance still requires CI on the implementation revision; hardware iPhone microphone/beep validation remains separate.

[Component registry](../component-map.json) · [Architecture guide](../application-structure.md) · [Refactor plan](../../project/react-refactor/plan.md)
