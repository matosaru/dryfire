# Working context

Updated 2026-10-23. Keep this file concise; detailed evidence belongs in the linked history/specifications.

## Authorization and branch rules

Work on **b only**. Main/dev are frozen; no release PR, merge or deployment without a new instruction. Main6c38bff/dev741f46e were verified unchanged. Cloudflare is owner-managed. Continue authorized tasks autonomously, with concise progress updates and no routine repeated confirmations.

Before publishing application changes require complete unit/coverage, integration, both-edition minified build/verification, pinned Chromium/WebKit screenshots and the original performance gate. Never call pending/cancelled/diagnostic checks passes. When pinned browsers are unavailable locally, use review-only CI candidates; preserve original baselines, samples, controls and tolerances. Update context after each completed task and keep requirements/designs/help/media synchronized.

## Completed and published

Application **72b41c7** on b implements CHG-058: all four trigger setup modes reuse Sequence's form, compact count/Par cards, grouped signal/delay, separate sound switch and ordered sound list through packages/ui/src/DrillSetup. Sequence frozen markup, native retained fields/drafts, existing run/review fragments, safety/audio/timing/data and edition behavior stay intact. Obsolete practice step-margin rule is removed; canonical Sequence CSS relocated without unrelated cascade changes. Cachev81.

Performance corrections remove duplicate Practice refresh after its own render, avoid equal native text/disabled/image writes with fresh DOM lookups, and batch startup library/selection/device-preference reads into one read-only IndexedDB snapshot. Existing schema4, migrations, write policies and stored data remain intact.

**All8 jobs pass** in pre-publication39959685865 and normal post-push39961346126:1013tests/147suites+coverage, both-edition Chromium/WebKit workflows/screenshots, four original performance gates/controls and aggregate acceptance.398goldens/83current captures;64 derived Practice/safety references reviewed, modal interior pixels identical. Sequence/guide references and ten GIF files unchanged. Exact accepted patch SHA256d91ef6ba727d54a69363650ec50e1b980ab27a71588a09ad93dd157a2354d937 retained in Git966f2e6, verified before applying. Temporary collector/patches/duplicate images cleaned.

Earlier failures39953233357/39955534502 and cleanup cancellation39957863599 remain in [history](../implementation-history.md) and [review evidence](../../design/baselines/chg-058-setup-review.json). Screenshot CI allowance12→15minutes fixes evidence/cleanup timeout only; no test/image/application gate weakened. Generic strict UI audit retains2 preexisting documented native-select ownership findings; no broad compliance claim.

CHG-057 cards and CHG-053 Live Listen were already accepted/published in da08937, all8 post-push39904517004 jobs green. Refactor P0–P8 remains complete; retain tested startup adapters/lazy React owners under ADR001. Browser entry is src/main.js; build-time typed templates tools/page-templates.mjs.13 page packages/26 shared UI packages have source/CSS/tests/exports; do not restart migration or eagerly hydrate the app.

## Latest guide-control request — proposal only

Owner asks to suggest improved About-this-practice UX. [Proposal](../../design/proposals/guide-control/README.md), published4036c0a: outlined “ⓘ About this practice” after context/sounds before setup, no underline/arrow. Includes Trigger/Sequence screenshots and keyboard navigation check. **Application guide link unchanged.** Do not infer implementation approval from a suggestion request.

## Next

Completed shared setup is ready for owner testing on b. Await guide-proposal feedback/new scope; record explicit instruction before implementing that redesign. Do not promote main/dev or claim Cloudflare/physical iPhone acceptance. Final handoff is documentation-only after tested application72b41c7.

[Plan](plan.md) · [Spec](spec.md) · [Architecture/entry point](../../architecture/application-structure.md) · [Component map](../../architecture/component-map.json) · [Requirements](../../requirements/drill-setup-template.md) · [ADR001](../../architecture/decisions/001-progressive-react-startup.md)
