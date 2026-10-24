# Working context

Updated 2026-10-24. Keep concise; detailed evidence belongs in requirements/history.

## Authorization

Work on **b only**; main6c38bff/dev741f46e remain frozen. Owner explicitly approved CHG-059: implement proposed outlined guide link, common guide layout/sound sequence, Trigger targets #46baff and built-in/custom Sequence targets #b574f6; update tests/screenshots and publish b. Continue without routine questions. Cloudflare owner-managed; distinguish push/CI from live deployment.

Require complete unit/coverage, integration, both-edition minified builds, pinned Chromium/WebKit screenshots and unchanged original performance gate before publishing app changes. Never call pending/cancelled/diagnostic checks passes. No threshold/baseline-control weakening. Keep startup adapters/lazy React owners per ADR001; refactor P0–P8 complete.

## Current task CHG-059

Application candidate passed complete acceptance40075428666 on 2026-10-24 and is being published on b. Shared DrillGuideLink follows context/sounds before setup; no underline/arrow, decorative info icon, 44px target/focus. Both setup pages reuse it. Guide native/React views reuse DrillSetupSteps/semantic li.drill-step. Removed unused preset-chip CSS. Explicit catalog-container colors replace third-child rule and Light overrides. Cachev82. Data/audio/timing/navigation/examples stay intact.

[Spec](../../requirements/guide-layout.md), [review evidence](../../design/baselines/chg-059-guide-review.json), [history](../implementation-history.md). Clean baseline1013tests passes. New unit run1016tests/147suites and coverage ratchet passed before one extra native-list regression was added; rerun final coverage.10focused public and10preview Chromium workflows pass. Both minified editions and original payload budgets pass (CSS60782raw/12823gzip). Generic strict audit has only2 preexisting documented native-select ownership findings.

Pinned image collector39979166376 successful, commitbcf363b.204images collected:100approved changed baselines,104identical;23currentcaptures updated. Safety modal interior identical across8refs; ten GIFbytes unchanged. Temporary collector/workflow and review patch are review-only; remove duplicate images/temporary inputs after acceptance, preserving Git proof. Earlier redundant CI39979096427 and collector39979096410 cancelled, not acceptance.

## Next

All8 candidate jobs are green:1017tests/147suites+coverage, both editions/browsers/screenshots and4 original performance gates/controls. Accepted patch in Git9af1303 SHA256780af0d539a14bdaacbba3c5eaeeb5b9a1824ea392c821baf198bad677ad512e; reverse check passed. Publish accepted code b, verify normal CI and visible deployment checks. Then fulfill new owner request: maintainable application sitemap; correct stale six-mode architecture text to four. Update docs/context with observed results; never claim physical iPhone/live deployment without evidence. Main/dev unchanged.

Prior accepted app72b41c7 CHG058 passed all8jobs39961346126. Browser entry src/main.js; typed templates tools/page-templates.mjs;13pages/26UI packages. [Architecture](../../architecture/application-structure.md) · [Plan](plan.md).
