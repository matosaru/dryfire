# Component-library inventory

Reviewed 2026-11-09. The generated [`component-map.json`](component-map.json) is the machine-checked source/CSS/test inventory; this document explains the intended library boundaries.

## Existing layers

| Layer | Location | Count | Intended ownership |
| --- | --- | ---: | --- |
| Shared UI library | `packages/ui/src` (`@dryfire/ui/*`) | 29 | Cross-feature shell, context, controls, catalogs, session presentation and history presentation |
| Feature-local components | `apps/web/src/features/*/components` | 5 | Reusable only inside Settings or learned-sound checking until a second real consumer exists |
| Application pages | `apps/web/src/pages` | 14 | Screen composition and page-local layout; no direct storage/microphone ownership |
| Public-site components | `apps/web/src/public-site` | 2 | Indexable public-page shell and reusable marketing content |

All 50 packages above have a source file, co-located CSS, meaningful component test and public `index.ts`. `npm run verify:architecture` checks those boundaries.

## Shared `@dryfire/ui` catalog

- **Shell/navigation:** `AppShell`, `BrandHeader`, `BottomNavigation`, `PageHeading`, `InfoFooter`.
- **Gun/safety context:** `GunContext`, `GunSwitcher`, `SafetyDialog`, `SafetyDisclosure`.
- **Inputs/preferences:** `NumberInput`, `PreferenceToggle`.
- **Cards/catalog/setup:** `InformationCard`, `DrillCard`, `PracticeCatalog`, `SoundCard`, `CalibrationCatalog`, `CustomDrillEditor`, `DrillSetup`, `TriggerProfileStatus`.
- **Session presentation:** `PracticeRun`, `PracticeReview`, `SequenceRun`, `SequenceReview`, `RepetitionResult`.
- **History/progress:** `SavedSessionList`, `RecognitionList`, `EvaluationPanel`, `ProgressContent`.
- **Progressive-ownership utility:** `RetainedNode`.

The private workspace package uses subpath exports (`@dryfire/ui/ComponentName`) rather than one eager barrel. This keeps consumers explicit and preserves lazy page boundaries.

## Current gaps

1. Button, icon-button, field, input, select, card, modal and status presentation still rely partly on established global classes rather than a documented low-level primitive package.
2. Shared UI includes both broadly reusable primitives and Dry Fire product composites. Dependency layers are implicit.
3. Semantic tokens exist in `packages/ui/src/tokens.css`, but most existing selectors intentionally retain approved raw values until pixel-identical migrations are reviewed.
4. Native startup adapters reproduce limited markup for immediate usability and startup budgets. They are compatibility owners, not a second public component library, and cannot be removed without performance and handoff evidence.
5. Feature-local components should move to `@dryfire/ui` only after a real cross-feature consumer proves the abstraction.

## Recommended target boundaries

1. **Tokens:** semantic colors, typography, spacing, radii, targets and widths.
2. **Primitives:** behavior-light Button/IconButton/Field/Input/Select/Card/Dialog/Status components with native semantics.
3. **Shared product components:** app shell, gun/safety context, drill/session/history components.
4. **Feature components:** Settings and learned-sound compositions that remain close to their feature.
5. **Pages:** route/screen composition only; controllers/adapters provide data and callbacks.

Inventory and characterize duplicate DOM/CSS before extracting a primitive. Each migration must preserve DOM contracts, focus, drafts, lazy boundaries, minified payload and canonical pixels. A file move alone is not reuse.
