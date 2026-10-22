# Drills design

CHG-054 supersedes earlier six-card discovery descriptions: **Trigger Press Group** contains Single trigger press, Repeated trigger press, Par time practice and Trigger control, in that order. **Sequence drills** remains unchanged. CHG-055 removes the retired engines/manuals and selectively deletes their saved sessions/configuration. Supported practice/sequence history stays intact. Card styling and setup flow stay unchanged. Current screenshot refresh is tracked in the delivery history.

CHG-052: both groups share the existing target icon, title-first header, aligned description and full-width orange **▶ Start Drill** button. Dry-fire practice still opens mode configuration. Sequence catalog shows only the three multi-action built-ins; legacy Trigger pull sessions remain restorable/repeatable and custom one-action presets are preserved. No new tokens or timing behavior.

CHG-049 structural refactor: the four current practice choices are now prerendered by [PracticeCatalog](../../../../packages/ui/src/PracticeCatalog/PracticeCatalog.tsx); the existing controller owns one delegated native action listener and capture/configuration guards. Card copy, order, DOM, styles and behavior are preserved. The [input-equivalence review](../../baselines/static-practice-catalog-review.json) records this performance correction; Drills/editor migration is complete under the retained progressive startup architecture.

CHG-041: the shared header now shows an orange **BETA** badge beside the wordmark in both themes/editions. It remains readable on narrow screens without covering the brand or Settings. [Beta requirements](../../../requirements/branding.md#beta-disclosure--chg-041) define this shared lifecycle label; image review/delivery is recorded in the [tracker](../../../project/implementation-history.md).

CHG-037: this screen uses the common app layout and screen wrapper, shared branded header with Settings, informational footer and fixed five-tab navigation. Context controls remain screen-specific. [Layout requirements](../../../requirements/page-layout.md), [template architecture](../../../architecture/page-templates.md) and [reviewed current captures](../../baselines/page-templates-review.json) define the current shell; earlier entries below retain historical evidence.

CHG-032 public availability: preserve all four modes, the CHG-052 displayed built-ins and existing custom presets, including their Start/Edit actions. Hide new custom creation; the saved-custom tab appears only when owned presets exist. Full preview retains creation. [Edition specification](../../../requirements/build-editions.md).

CHG-031: About/Contact footer controls are pure white in Dark (`#FFFFFF`); Light/disclosure colors and the existing layout/underline/focus/divider remain. [ABOUT-05](../../../requirements/about.md) and the [shared footer design](../shared/README.md) define the correction. [Current capture review](../../baselines/bright-footer-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-030 typography revision: primary Dark text uses `#FFFFFF` throughout this screen and neutral controls. Secondary/footer/accent colors and Light values remain. The [shared typography design](../shared/README.md) and [SET-07](../../../requirements/settings.md) define the palette; [current capture/build review](../../baselines/white-primary-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-029 capture refresh: current references use the pinned production-build renderer and separate centered About/Contact footer controls. [Capture/build review](../../baselines/separate-pages-validation.json) records both passing 138-check runs and reviewed images; earlier [CHG-028 evidence](../../baselines/footer-entry-validation.json) retains the combined entry.

Current implemented layout · CHG-018 coverage audit / CHG-019 corrections · 2026-10-11 · CHG-023 footer published in [`dbf8687`](https://github.com/matosaru/dryfire/commit/dbf8687); earlier feature baseline [`aacdb18`](https://github.com/matosaru/dryfire/commit/aacdb18); exact reviewed file hashes are in the registry

Entry: Drills tab, Home card or review completion. App anchor: `drillsView`. This is a state of the same `/` web app, not a separate indexable URL.

## Layout and interaction

Four trigger practice cards precede the three multi-action built-in sequence cards. Built-in / Custom tabs select sequence presets. The inline custom editor has a title, ordered action list, add/remove/reorder controls, Save and Cancel. A preset is owned by the active gun and uses the existing four event identifiers. The editor is a screen state, not another public route.

Functional specifications: [drill-sessions](../../../requirements/drill-sessions.md) · [practice-modes](../../../requirements/practice-modes.md). These define acceptance behavior and input bounds; the layout here does not introduce a second set of requirement IDs.

## Current visual references

![Drills current layout](catalog.dark.png)

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| Practice modes and built-in sequences | [`catalog.dark.png`](catalog.dark.png) | `practiceCatalog` |
| Saved custom sequences | [`custom.dark.png`](custom.dark.png) | `customDrillCatalog` |
| Create or edit a sequence | [`custom-editor.dark.png`](custom-editor.dark.png) | `customDrillForm` |

Captured from the current local production build in Chromium at a 390 px mobile viewport. QA gun names, sample counts, audio levels and timing statistics are illustrative fixtures. Captures are actual UI rather than generated concepts; they do not establish Cloudflare deployment, real iPhone recognition accuracy or legal clearance. Additional transient/error states use this same layout and the linked requirements.

For a visible change, update the affected captures, this Markdown and the [screen registry](../../../architecture/screen-map.json); run the [maintenance checks](../../../architecture/README.md). Earlier reviewed revisions remain in the [archive](../../archive/README.md) and immutable Git history.

Public existing-preset editing: [`edit-custom.dark.png`](edit-custom.dark.png), anchor `customDrillForm`. New-preset editor is preview-only; both retain the same sequence controls.

CHG-052 [pinned card review](../../baselines/chg-052-card-review.json) records both-edition/browser candidates, changed captures and validation status.

CHG-054/055 [current catalog and retirement review](../../baselines/chg-055-retirement-review.json) records pinned both-edition/browser screenshots, selective session cleanup and retained-mode invariants. Earlier six-mode descriptions are historical; the current catalog has four trigger choices.
