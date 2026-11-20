# CHG-070 message inventory and ownership — LOC-01

Updated: 2026-11-20 · State: page ownership map established; runtime scans continue as localization is migrated. Untranslated surfaces are still being identified.

This inventory maps every maintained UI/page family and its source owner to one YAML namespace. It intentionally does not translate or catalog user data, stable IDs, code identifiers, browser/OS-owned controls, or approved product/brand names. All actual editable UI copy must end up in the assigned catalogs; the current English strings are the extraction source until each consumer is migrated. A catalog parity/build check is the release proof that the three language files contain the same keys and parameters.

## Page-to-catalog ownership

| Screen / content family | Catalog namespace | Current primary source surfaces |
| --- | --- | --- |
| Shared shell, navigation, dialogs, common actions, status/error, safety, accessibility names | `common` | `index.html`; `src/templates/**`; `apps/web/src/app/**`; `packages/ui/src/**`; shared fragments under `apps/web/src/layout/**`; controller/bridge status copy under `src/**` |
| Home | `home` | `apps/web/src/pages/HomePage/**`; home presentation/controller and route title copy |
| Learn Sounds and calibration | `learn` | `apps/web/src/pages/LearnPage/**`; calibration copy/presentation and capture guidance |
| Sound Check | `sound-check` | `apps/web/src/pages/SoundCheckPage/**`; `src/soundCheckController.js`; Sound Check evaluation/report labels |
| Settings, including language, units, appearance, audio and backup | `settings` | `apps/web/src/pages/SettingsPage/**`; `apps/web/src/features/settings/**`; `apps/web/src/app/settingsPage.tsx`; `src/preferenceCoordinator.js`; Settings/data action copy in `src/main.js` |
| Built-in and saved drill catalog | `drills` | `apps/web/src/pages/DrillsPage/**`; `src/drills.js`; `src/practiceModes.js`; drill card/preset presentation |
| Trigger-practice configure/run/review | `practice` | `apps/web/src/pages/PracticePage/**`; `apps/web/src/app/practiceContents.tsx`; `src/practiceController.js`; practice state/result presentation |
| Sequence configure/run/review | `sequence` | `apps/web/src/pages/SequencePage/**`; `apps/web/src/app/sequenceContents.tsx`; `src/sessionController.js`; session result/presentation copy |
| About this practice, all built-in guide variants and custom guide | `practice-guide` | `apps/web/src/pages/PracticeGuidePage/**`; `src/practiceGuideManuals.js`; `src/practiceGuides.js`; `src/practiceGuideExamples.js`; guide content/presentation |
| Live Listen | `live-listen` | `apps/web/src/pages/LiveListenPage/**`; `apps/web/src/features/live-listen/**`; live-listen readiness/presentation/controller |
| History, progress and deletion | `history` | `apps/web/src/pages/HistoryPage/**`; `apps/web/src/features/history/**`; `src/optional/renderLegacyHistory.js`; `src/history*` and `src/sessionController.js` |
| Gun list | `guns` | `apps/web/src/pages/GunsPage/**`; gun library presentation/coordinator |
| First/add/edit gun setup | `gun-setup` | `apps/web/src/pages/GunSetupPage/**`; gun setup form and `src/gunLibraryCoordinator.js` |
| About page, retained marketing overview and app explanation | `about` | `apps/web/src/pages/AboutPage/**`; `apps/web/src/public-site/MarketingOverview/**`; `apps/web/src/app/informationPages.tsx` |
| Contact page | `contact` | `apps/web/src/pages/ContactPage/**`; `apps/web/src/public-site/PublicPage/**`; email-copy feedback |
| Browser setup and help content | `help` | Public Help page source, `docs/development/README.md` user-help content, installation/privacy/manual copy rendered in Settings |
| Public route names, page titles/descriptions, open-graph copy and public-only marketing/manual landing content | `public-site` | `site/routes.js`; `tools/public-pages.mjs`; `apps/web/src/public-site/**`; public SEO templates and build-time page metadata |

The current route registry contains 14 app screen identities, four trigger mode setup paths, built-in/custom sequence setup paths and their manual routes. Those route variants share their owning page namespace; stable mode/guide IDs select the corresponding message keys. Public page metadata is catalog copy, while paths, route IDs and app data remain stable technical identifiers.

## Newly audited session presentation surface — 2026-11-20

Practice and Sequence live announcements, phase labels, review summaries, result statuses, timing labels, detection outcomes, score labels, and date/number formats are owned by `common.sessionUi.*` and `common.sessionResult.*`. User and drill names remain data; stable domain reason/outcome enums are mapped to translated messages. Locale tests verify German and Dutch rendering while unchanged English DOM/reference tests protect the guide examples.

## Copy inventory rules

- Visible JSX text, template text, native DOM-created messages, button/field text, placeholders, visible labels, accessible names/descriptions, validation/error/status/empty states, safety and confirmation copy, page headings, help/manuals, metadata and structured SEO text are user-facing messages and receive stable locale-neutral keys.
- Dynamic messages use named parameters (for example saved-record count, selected gun name, repetition count, recognition status); parameter values are plain text and remain user data when user-supplied.
- Drill/event/preset IDs (`trigger`, `rack`, route IDs), storage keys, enum values, CSS class names, programmatic ARIA state tokens, API/browser errors verbatim, filenames and diagnostic log text are not translated. Any user-visible explanation surrounding a browser/API result is translated.
- Gun names, custom preset names, saved session content, imported backup labels, history values and other user-generated/historical content remain exactly as saved. Date/number formatting follows the selected locale without rewriting stored values.
- Brand/product names and stable product terms retain the approved form from `branding.md`; terms such as trigger press, trigger pull, session, calibration and sound recognition are localized via the approved glossary, not by changing persisted IDs.
- English (`en`) is the source copy; German (`de`) and Dutch (`nl`) require identical keys and parameter contracts. No released localized page may silently fall back to English.

LOC-01 is complete when the ownership table, route/screen inventory and exclusions are represented in the key manifest; each migrated consumer points to one stable key and the source-scan gate reports no unowned user-facing copy. Translation completeness and user-visible flow coverage are separately enforced by LOC-03/06/08.

## Newly audited Learn Sounds surface — 2026-11-20

The Learn page and its `SoundCard` primitive previously retained English-only progress summaries, action labels, image alternative text, optional-sound controls, and trigger-profile status copy. These now belong to `learn.soundCard.*` and `learn.profile.*` in the English, German and Dutch YAML catalogs. The page adapts the profile's language-neutral status/count data at render time; the domain assessment in `src/profileQuality.js` remains responsible for classification only. A locale-switch test covers the German controls and incomplete-profile guidance. This increment does not complete the global key-level source inventory: run/review fragments, remaining legacy dialogs/controllers and practice-guide details still need systematic scanning.


## Newly audited Custom Drill Editor — 2026-11-20

The create/edit form's titles, field labels, action-order accessibility name, action buttons, helper copy, unavailable/save feedback and sound option names are now owned by `drills.editor.*` and the shared `common.sound.*` keys. The stable app-owned editor host resolves the page/common catalogs and subscribes to locale changes; the shared UI package receives messages as props and remains independent of application localization. Controller/native fallback feedback also uses the drill catalog. Tests cover retained English markup, both render paths, dynamic German/Dutch changes while editing a saved sequence, and the existing native-form rollback contract. The key-level whole-repository source scan remains open.

## Newly audited animated Practice Guide — 2026-11-20

Guide animation frame labels, simulated microphone states, countdown/results, counters, captions, no-save disclosures, and play/pause/replay controls now use the `practice-guide.example.*` message keys in all supported locales. Sequence-step sound labels reuse `common.sound.*`; integer and decimal example values use locale formatting. The animation continues to simulate only presentation state and does not access audio or storage. German/Dutch tests cover representative frame states and number formatting; English frame parity remains covered separately. The overall scan for unowned user-facing text is still open.
