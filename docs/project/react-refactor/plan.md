# React refactor plan — completed

Updated 2026-10-22 UTC. [spec.md](spec.md) remains the contract. CHG-049 authorized autonomous implementation; CHG-050 deferred optimization until structural work; CHG-051 approved using engineering judgement to retain progressive startup adapters with guarded lazy React owners.

## Final status

Application revision **8a8906e42c3d9342c9343f2e096ee5f5469d5f68** passes the complete [canonical CI run 39598533411](https://github.com/matosaru/dryfire/actions/runs/39598533411). Validation, public/Full-preview Chromium and WebKit screenshots, both original performance gates, identical-build controls, public deliberate-slowdown rejection and aggregate acceptance all succeeded. Local full coverage: **959 tests in 140 suites**, with the original coverage ratchet preserved. No image/GIF references, performance thresholds or data schemas were changed to obtain acceptance.

| Stage | Status | Delivered |
| --- | --- | --- |
| P0 — Baselines and safety net | Complete | Characterization, deterministic fixtures, visual/unit/integration coverage and original performance gates |
| P1 — Typed boundaries | Complete | Route, context, edition and service contracts |
| P2 — Shared shell and controls | Complete | Reusable header, footer, navigation, safety and controls with source/CSS/tests |
| P3 — Home and guns | Complete | Typed pages and guarded ownership; preserved drafts, storage and gun limits |
| P4 — Settings, Learn, Live Listen | Complete | Typed presentation and stable native input/file/meter lifetimes |
| P5 — Drills and History | Complete | Shared catalog/editor/session presentation, private graphs and edition guards |
| P6 — Practice, Sequence, guides | Complete | Shared live/example components, controller contracts and unchanged guide frames |
| P7 — Cleanup and performance | Complete | Removed obsolete templates/wrappers/helpers; shared preparation/text/history models; original final CI gates pass |
| P8 — Architecture handoff | Complete | Entry points, all 13 page packages, 25 UI components, ownership map and maintenance instructions |

## Architecture and cleanup decision

The final application uses prerendered typed page components, immediately usable lightweight native startup adapters, and lazy React owners with exclusive update guards and rollback. It does not eagerly hydrate the entire app. Retained startup adapters, browser inputs, capture engines and rollback nodes are active dependencies, not unused code. [Decision 001](../../architecture/decisions/001-progressive-react-startup.md) documents the measured reason and unchanged performance contract.

Cleanup removed 12 obsolete templates, 25 import-only CSS wrappers, unused declarations and production test-only helpers. Exact-content scans found no duplicate-file groups; this does not claim the absence of every semantic duplication or all possible unused exports. Repeated navigation/capture/private-feature checks found stable warmed DOM/listener counts; measured heap overhead is disclosed, not described as zero memory growth.

## Evidence and maintenance

- [Application structure and entry-point guide](../../architecture/application-structure.md): browser entry is `src/main.js`; typed markup is composed at build time through `tools/page-templates.mjs`.
- [Component registry](../../architecture/component-map.json) and [screen map](../../architecture/screen-map.json): source, CSS, tests, requirements and designs.
- [Final acceptance evidence](final-acceptance-evidence.json): final result plus earlier failures and measurements.
- [Implementation history](../implementation-history.md) and [historical execution plan](execution-history.md): staged work, failed checkpoints and original exit criteria.
- [Retained-owner and memory audit](p7-retained-owner-audit.md): intentional boundaries and limitations.

For future changes, keep each component's source/CSS/tests together; reuse shared page/guide presentation, preserve a single owner per region, and run affected unit/integration tests plus both-edition pinned visual and original performance gates. Update architecture and design/help/animation documentation when their contracts change. Never rebaseline a visual or performance regression merely to pass CI.

## Outside completed implementation

- [ ] Owner reviews and promotes `b` to `main` through the release process.
- [ ] Owner-managed Cloudflare deployment and live-version verification.
- [ ] Physical iPhone Safari/Home Screen microphone recognition, start-beep and supported feedback acceptance.

Only **b** is updated. Main and dev remain unchanged. No release PR, merge or manual deployment was performed. Commercial, cloud-account and native-app work remain outside this refactor.
