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
| Built-in and saved drill catalog | `drills` | `apps/web/src/pages/DrillsPage/**`; `src/drills.js`; `src/practiceModes.js` (stable IDs; legacy titles only for validating saved records); drill card/preset presentation |
| Trigger-practice configure/run/review | `practice` | `apps/web/src/pages/PracticePage/**`; `apps/web/src/app/practiceContents.tsx`; `src/practiceController.js`; practice state/result presentation |
| Sequence configure/run/review | `sequence` | `apps/web/src/pages/SequencePage/**`; `apps/web/src/app/sequenceContents.tsx`; `src/sessionController.js`; session result/presentation copy |
| About this practice, all built-in guide variants and custom guide | `practice-guide` | `apps/web/src/pages/PracticeGuidePage/**`; `src/practiceGuideManuals.js` (structural IDs/kinds/sound order only); `src/practiceGuides.js`; `src/practiceGuideExamples.js`; guide content/presentation |
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

Practice and Sequence live announcements, phase labels, review summaries, result statuses, timing labels, detection outcomes, score labels, date/number formats, empty-result fallbacks, and retry-save actions are owned by `common.sessionUi.*` and `common.sessionResult.*`. User and drill names remain data; stable domain reason/outcome enums are mapped to translated messages. Locale tests verify German and Dutch rendering while unchanged English DOM/reference tests protect the guide examples.

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

The trigger-profile assessment now returns only status, sample count, needed count and outlier indexes. The typed Learn component and native renderer receive title, message, eyebrow and action text from the `learn` catalog; neither the classifier nor the shared UI component owns English fallback copy. German coverage verifies native rendering.


## Newly audited Custom Drill Editor — 2026-11-20

The create/edit form's titles, field labels, action-order accessibility name, action buttons, helper copy, unavailable/save feedback and sound option names are now owned by `drills.editor.*` and the shared `common.sound.*` keys. The stable app-owned editor host resolves the page/common catalogs and subscribes to locale changes; the shared UI package receives messages as props and remains independent of application localization. Controller/native fallback feedback also uses the drill catalog. Tests cover retained English markup, both render paths, dynamic German/Dutch changes while editing a saved sequence, and the existing native-form rollback contract. The key-level whole-repository source scan remains open.

## Newly audited animated Practice Guide — 2026-11-20

Guide animation frame labels, simulated microphone states, countdown/results, counters, captions, no-save disclosures, and play/pause/replay controls now use the `practice-guide.example.*` message keys in all supported locales. Sequence-step sound labels reuse `common.sound.*`; integer and decimal example values use locale formatting. The animation continues to simulate only presentation state and does not access audio or storage. German/Dutch tests cover representative frame states and number formatting; English frame parity remains covered separately. The overall scan for unowned user-facing text is still open.

## Run/review and private preview fallback copy — 2026-11-20

Practice and Sequence native run/review fallback labels no longer carry duplicate English defaults in `src/sessionPresentation.js`; controllers supply `common.sessionUi.*` values. The private preview locked-state notice also uses `settings.preview.locked`. Tests verify the renderer inputs and German preview notice. Static fixture/template strings remain English test baselines; the global scan of app/public and legacy surfaces is still open.

## Practice Guide catalog ownership cleanup — 2026-11-20

Removed the duplicate English manual prose from `src/practiceGuideManuals.js`; that module now contains only stable guide IDs, guide kinds and example sound order. `src/practiceGuides.js` resolves all displayed manual fields from the `practice-guide` YAML catalogs. A source-ownership regression test protects this boundary, while the guide tests verify localized values still populate the returned manual. This is one completed source-audit slice; LOC-01 remains open for the repository-wide scan.

## Newly audited Learn calibration cards — 2026-11-20

Reset-click, noise/handling, and external-cue calibration labels, descriptions, localized sample counts, limit feedback, and Train/Reset actions are now owned by `learn.calibration.examples.*` and `learn.calibration.*`. The shared UI component accepts copy as props and has no application-locale dependency; the app provides the same translated values to both React and the retained native fallback. Changing the device language updates the card content without changing calibration IDs, counts, or reset ownership. German/Dutch tests cover both rendering paths. The global source scan remains open for other untranslated page and dialog copy.

## Newly audited Drills catalog — 2026-11-20

Trigger Press and Sequence card descriptions, built-in sequence titles, and Start Drill/Edit actions now use `drills.modes.*`, `drills.cards.*`, and `drills.custom.edit` message keys in English, German and Dutch. The React page and native fallback share the catalogs; UI package cards take copy through props and saved custom preset names remain user data. Locale-switch tests cover the page, and a native fallback test checks translated labels without changing practice-mode IDs. The global source scan remains open.

Built-in Trigger Press card titles/descriptions were removed from the current mode-ID module. Build-time and live card rendering resolve these labels from YAML. The English titles in the saved-record validator remain solely for backward compatibility with existing stored records; they are not the current display source.

## Newly audited Live Listen and shared shell — 2026-11-20

Live Listen panel controls, accessible names, distance fallback text, step counts, drill status and result notes now use the `live-listen` YAML catalogs in React and the retained native presentation. The shared safety dialog/disclosure, selected-gun switcher, and startup status use `common.shellSafety.*`, `common.shellGun.*`, and `common.shellStartup` messages passed into UI primitives as props; the primitives retain English defaults for standalone consumers. English shell/tree parity and German/Dutch shell text checks pass. The native Practice latest-result fallback and History progress chart/table labels have since been localized. LOC-01's repository-wide key/source scan remains open.

## Newly audited History progress — 2026-11-20

Progress chart timing summaries, comparison trends, empty states, metric names, SVG accessible text, date/number formatting, and accessible table labels/values now use the `history.progress.*` YAML catalog in both the pre-mount native fallback and lazy React chart. The History section heading, filter labels/options, chart disclosure, and retained-recognition limit label also use the locale catalogs. The UI package receives only a presentation model, preserving its app-independent boundary. The Practice latest-result fallback now accepts the shared `common.sessionUi.practiceLatestEmpty` message in both normal practice and the animated guide. Frozen English DOM parity remains exact; German and Dutch presentation/runtime tests cover locale formatting and both render paths. Broader LOC-01 source ownership scanning remains open.

Removed the duplicate English message dictionary from `progressPresentation.ts` and the native renderer's duplicate table-summary fallback. Both presentation and native chart APIs now require a History message resolver; current app callers provide `history.progress.*` catalog values. Tests supply catalog resolvers explicitly.

History comparison option titles now resolve built-in practice and sequence names from their YAML catalogs instead of displaying the English title stored in each saved session. User-created drill titles remain saved user data and are shown as entered.

## Newly audited shared footer and review empty states — 2026-11-20

The global microphone/data-storage disclosure and copyright now use `common.footer.*` messages passed into the shared footer component. Native Practice and Sequence review fallbacks receive the shared localized no-result messages; the component package retains its English standalone defaults. English shell parity and locale-specific footer tests pass. The broad inventory remains open for remaining public, manual, controller/status and review-detail copy.

## Newly audited private preview controls and edition messaging — 2026-11-20

The private Settings preview selector, choices, retained-data explanation, edition badge, and dynamic Free/Full status now use the Settings catalog. The preview controller rerenders these messages on locale changes. The Drills page chooses its Free/Full Sequence description from a catalog key inside the React page, so switching language while Full preview is selected does not leave stale English copy. Existing preview capabilities, browser preference storage and stable route/mode IDs are unchanged. Locale, DOM rebinding, and retained draft handoff tests cover this surface. The complete source ownership scan remains open.

## Localized client document titles — 2026-11-20

Client-side application titles now resolve from the current locale catalog for app pages, guide pages and the homepage. Public guide titles reuse their localized SEO title entries; existing English build-time consumers retain the English default. Tests cover German and Dutch app titles and a German guide title. Static public HTML title/description/canonical/hreflang output remains generated and validated by the public build. A full source scan and visual/documentation evidence review are still open.

## Backup validation feedback — 2026-11-20

Backup validation now marks invalid-import errors with a stable error code while preserving detailed English messages for storage-level diagnostics and existing tests. The Settings import flow displays a localized, actionable compatibility message from `common.runtimeErrors.invalidBackup` for all validation failures. English, German and Dutch feedback are covered; database replacement still begins only after full validation.

Gun-library write guards now also attach stable codes for a missing gun, missing selection, gun cap, sound-sample cap and calibration-sample cap. `showError` maps these to `common.runtimeErrors.*` catalog messages in all supported locales while the underlying diagnostic message remains available. Tests cover the guarded storage operations and translated feedback; other less common validation and stale-record errors remain part of the source scan.

Stale event/session lookups and invalid training-data errors also now carry stable codes mapped to localized `common.runtimeErrors.*` text. The underlying English diagnostic remains attached for storage/debug callers. Focused persistence/localization tests cover missing records and translated training-data feedback. The broader audit of low-frequency controller, storage and validation errors remains open.

Practice Guide lazy-load recovery now uses a stable `GUIDE_UNAVAILABLE` code routed through the shared common error catalog, rather than relying on exact English-message matching.

Microphone and recording failures now attach stable codes for too-short, unclear or distorted samples; secure-context, Web Audio, PCM recorder and input availability; denied permission; and stopped capture. The shared error translator maps these codes into the existing common YAML messages. Focused audio lifecycle tests preserve the expected diagnostic strings and resource cleanup behavior.

App navigation guards, unsaved Practice review handling, and History chart-load fallback errors now use stable codes mapped to the existing shared `runtimeMain`/`sessionUi` messages or a new common error message. This keeps failure feedback consistent across route entry points and current locale.
