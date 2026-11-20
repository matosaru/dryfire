# Application localization refactor plan — CHG-070

**Status:** In progress on `codex/environment-recovery-2026-11-19`; `b` and `main` are unchanged. LOC-02/03/07 are implemented; LOC-01/04/05/06/08/09 remain in progress, and no release has been prepared. English, German and Dutch catalog key/parameter completeness passes. Public localized SEO output is generated and locally verified, but documentation and visual evidence gates remain incomplete.
**Scope requested:** English remains the default; add English, German and Dutch; put user-facing copy in page-and-language YAML files plus one shared common-message file; support parameterized messages; allow language selection in Settings; preserve correct SEO; require tests to pass. Visual tests are required for the English release only.

## Updated remaining-effort forecast (2026-11-20)

These estimates are active Codex engineering hours, not elapsed calendar time. They include each ticket's implementation and focused tests; LOC-09 includes full integration/acceptance fixes and release preparation. They exclude fluent German/Dutch copy review by a human and the user's hands-on browser/device testing. Estimates assume the current route/build architecture remains usable and no data migration is required.

| Ticket | Status | Remaining likely | Remaining range | Main uncertainty |
| --- | --- | ---: | ---: | --- |
| LOC-01 Inventory | In progress | 2 h | 1–3 h | Per-message key assignment and source-scan gate |
| LOC-02 Requirements and SEO schema | Done | 0 h | 0 h | Approved route, fallback, message, and SEO contract |
| LOC-03 YAML catalogs and validation | Done | 0 h | 0 h | Compiler, schema parity, generated-file checks, and release completeness gate are in place |
| LOC-04 Locale runtime and persistence | In progress | 0.75 h | 0.25–1.5 h | Browser-level back/forward and persisted preference/data acceptance |
| LOC-05 Settings and shared chrome | In progress | 1 h | 0.5–2 h | Complete common-message source audit and interaction coverage |
| LOC-06 Page and feature localization | In progress | 13 h | 7–17.5 h | Remaining app/public surfaces, manuals and translation-source audit |
| LOC-07 Localized SEO routes | Implemented; acceptance pending | 1 h | 0.5–2 h | Public build/artifact checks pass; docs/source review remains |
| LOC-08 Tests and accessibility/overflow checks | In progress | 4 h | 2–7 h | Finish locale, accessibility, overflow coverage and rerun visual suite |
| LOC-09 Full validation and release candidate | Blocked | 3 h | 2–6 h | Docs/visual review and full release checks; pinned Chromium download is blocked by HTTP 403 |
| **Total remaining Codex effort** |  | **25.75 h** | **13.25–39 h** | Fluent DE/NL review and owner device acceptance are separate |

The latest localization implementation increment took **20m 24s (0.34 h)**, timed from 13:14:42 to 13:35:06 UTC; the subsequent LOC-04 regression increment took **1m 46s (0.03 h)**, from 13:35:54 to 13:37:40 UTC. Earlier cumulative time is not reconstructible. Catalog completeness, public route generation and SEO artifact validation pass. Remaining effort covers source-copy inventory/migration, locale persistence acceptance, accessibility/overflow coverage, documentation/screenshot review, and final release validation. Current forecast is **26.75 active Codex hours (14.25–40.5 h)**, excluding fluent DE/NL review and owner device acceptance. Visual validation is blocked in this environment until the pinned Playwright Chromium can be installed; its CDN returned HTTP 403. The system Chromium can run functional flows, but its screenshot differs from the pinned baseline and is not accepted as a replacement.

## Proposed behavior and technical decisions

- Keep English as the explicit default for new and existing installations. Do not silently select a language from browser settings.
- Persist the selected language as a device-wide preference with the existing settings and backup/restore behavior. Changing language must not reset, migrate destructively, or split saved guns, learned sounds, presets, or history.
- Store copy in locale-specific YAML resources, for example `home.messages.en.yaml`, `home.messages.de.yaml`, and `home.messages.nl.yaml`, with one `common.messages.<locale>.yaml` per language for shared navigation, controls, statuses, and common actions. Use stable message keys, not translated text as identifiers.
- Support named interpolation parameters (for example `session.completed: "{{count}} repetitions complete"`). Define escaping, missing-parameter behavior, plural rules and locale formatting centrally; never treat translation values as HTML.
- Public English URLs stay unchanged. Proposed German and Dutch public URLs use `/de/` and `/nl/` prefixes. Locale selection on app-only paths should preserve the current route when a localized equivalent exists; otherwise go to the localized app home with a brief accessible explanation.
- Build each public language route as crawlable initial HTML with translated title, description and page content. Emit self-canonical URLs and reciprocal `hreflang` alternates (`en`, `de`, `nl`, and `x-default`) only for routes translated and published in all listed languages. Keep operational/private app routes out of the sitemap and `noindex`, consistent with current SEO policy. Sitemap and SEO tests cover every emitted localized public URL.
- Treat English as a complete required locale. German and Dutch are also complete for release; missing keys fail validation/CI instead of silently shipping mixed-language pages. Runtime can retain a defensive English fallback for malformed/unavailable resources, with an observable development warning.
- Keep exact localized page captures out of scope: run the existing visual suite once in English. German/Dutch receive functional, accessibility, metadata, routing, and overflow checks without pixel baselines.

## URL structure proposal

Use the current English URLs unchanged and add a locale prefix for German and Dutch. Keep slugs stable and untranslated so links remain recognizable and route identity does not depend on translation wording. The path locale is authoritative: a direct `/de/...` URL renders German and updates the saved language preference to German; `/nl/...` does the same for Dutch; an unprefixed existing URL means English and sets English. Changing the Settings language navigates to the equivalent route in the selected locale, then persists that choice. Existing English bookmarks continue to open English.

| Page | English (existing) | German | Dutch |
| --- | --- | --- | --- |
| App / public home | `/` | `/de/` | `/nl/` |
| Practice mode directory | `/practice-modes/` | `/de/practice-modes/` | `/nl/practice-modes/` |
| Single trigger press guide | `/single-trigger-press-guide/` | `/de/single-trigger-press-guide/` | `/nl/single-trigger-press-guide/` |
| Repeated trigger press guide | `/repeated-trigger-press-guide/` | `/de/repeated-trigger-press-guide/` | `/nl/repeated-trigger-press-guide/` |
| Par-time practice guide | `/par-time-practice-guide/` | `/de/par-time-practice-guide/` | `/nl/par-time-practice-guide/` |
| Trigger control guide | `/trigger-control-guide/` | `/de/trigger-control-guide/` | `/nl/trigger-control-guide/` |
| Rack slide → trigger pull guide | `/rack-slide-trigger-pull-guide/` | `/de/rack-slide-trigger-pull-guide/` | `/nl/rack-slide-trigger-pull-guide/` |
| Magazine change → trigger pull guide | `/magazine-change-trigger-pull-guide/` | `/de/magazine-change-trigger-pull-guide/` | `/nl/magazine-change-trigger-pull-guide/` |
| Draw → magazine change → trigger pull guide | `/draw-magazine-change-trigger-pull-guide/` | `/de/draw-magazine-change-trigger-pull-guide/` | `/nl/draw-magazine-change-trigger-pull-guide/` |
| Sequence drills guide | `/sequence-drills-guide/` | `/de/sequence-drills-guide/` | `/nl/sequence-drills-guide/` |
| Trigger-click calibration guide | `/trigger-click-calibration-guide/` | `/de/trigger-click-calibration-guide/` | `/nl/trigger-click-calibration-guide/` |
| Help | `/help/` | `/de/help/` | `/nl/help/` |
| About | `/about/` | `/de/about/` | `/nl/about/` |
| Contact | `/contact/` | `/de/contact/` | `/nl/contact/` |
| Learn sounds | `/learn/` | `/de/learn/` | `/nl/learn/` |
| Drills | `/drills/` | `/de/drills/` | `/nl/drills/` |
| Live Listen | `/live-listen/` | `/de/live-listen/` | `/nl/live-listen/` |
| History | `/history/` | `/de/history/` | `/nl/history/` |
| Settings | `/settings/` | `/de/settings/` | `/nl/settings/` |

Additional existing app routes use the same prefix rule, for example `/gun-setup/` → `/de/gun-setup/`, `/sound-check/` → `/de/sound-check/`, `/trigger-control/` → `/de/trigger-control/`, `/rack-slide-trigger-pull/` → `/de/rack-slide-trigger-pull/`, and `/custom-sequence/` → `/de/custom-sequence/` (with corresponding `/nl/` equivalents). This covers all routes in `offlineAppPaths()`; no route is translated by renaming its stable slug.

The same prefix rule applies to every stable app route, including gun setup, Sound Check, practice configuration, sequence setup, and guide routes. Do not put gun names, saved preset IDs, session IDs, or other personal data in the URL. Existing unprefixed paths remain valid English routes; no redirect of those URLs is proposed. All non-public app routes remain `noindex` and excluded from sitemap output regardless of locale.

SEO rules for public pages:

- `/` and each current unprefixed public URL remain the English canonical URLs.
- A translated public route has a self-canonical, for example `/de/about/` canonicalizes to `https://easydryfire.com/de/about/`.
- Each translated route emits reciprocal `hreflang="en"`, `hreflang="de"`, and `hreflang="nl"` alternates plus `hreflang="x-default"` pointing to English, but only where all three translations are complete and published.
- `html[lang]`, title, description, Open Graph locale, and visible page content all match the route locale.
- The XML sitemap lists the existing English public routes and their completed German/Dutch equivalents. It never lists noindex app-only routes, preview hosts, query strings, or incomplete translations.

This approved proposal preserves current English SEO paths and makes locale explicit in copied/shared links. LOC-02 recorded its requirements and SEO contract.

## Resource and code folder proposal

Keep localization infrastructure separate from page components and put all message text in YAML. Suggested structure:

```text
apps/web/src/localization/
  runtime.ts                       # locale state, interpolation, plurals, Intl formatting
  generated/catalog.<locale>.ts    # build output; generated from YAML and git-ignored
  messages/
    common.messages.<locale>.yaml  # shared navigation, actions, dialogs, statuses
    home.messages.<locale>.yaml
    learn.messages.<locale>.yaml
    sound-check.messages.<locale>.yaml
    settings.messages.<locale>.yaml
    drills.messages.<locale>.yaml
    ...

src/locales.js                     # supported locales and English default

tools/localization/
  catalogs.mjs                     # YAML syntax, key parity, parameters, HTML checks
  compile-catalogs.mjs             # deterministic TypeScript generation

site/
  routes.js                         # stable route identities and slug structure only
  ...build/prerender code...        # obtains page SEO copy from locale catalogs
```

The catalog set maps to actual screen/page types rather than every individual route instance. Sequence variants can share a `sequence` catalog with parameterized drill names where appropriate; unique public guide titles/descriptions remain per stable guide identity. Common copy belongs only in `common.messages.<locale>.yaml`; avoid duplicate keys in page files. All visible text, accessibility names, validation/error text, manuals and SEO title/description fields are catalog values. The route registry retains structural IDs, slugs, flags and message-key references, not English prose.

LOC-03 uses deterministic build-time catalog generation from YAML. This preserves offline use and static SEO generation without runtime network requests. Catalog files currently live directly in `apps/web/src/localization/messages/`; generated TypeScript modules are build artifacts and ignored by Git. `npm run localization:complete` is the final gate that rejects empty namespaces after LOC-06 fills them.

### Expected existing-file changes

- `src/appPaths.js` (or the replacement route adapter): parse/build locale-prefixed equivalents while preserving every current unprefixed English path and legacy redirect.
- `site/routes.js` and localized prerender/build scripts: store stable route IDs and message-key references; generate localized initial HTML and locale-correct SEO output.
- `apps/web/src/app/*` and `apps/web/src/pages/*`: read localized messages from the shared API; remove embedded user-facing copy as each page batch is migrated.
- `apps/web/src/pages/SettingsPage/*`, `src/preferenceCoordinator.js`, and storage/backup schema: persist and restore the selected locale with backwards-compatible English defaults.
- `tools/localization/*`, existing tests under `apps/web/src/**`, `tests/**`, and SEO/build verification: add schema, route, interaction, accessibility and artifact assertions for three locales. Keep image reference files and screenshot execution in English only.
- `docs/requirements/`, `docs/design/`, `docs/architecture/screen-map.json`, `docs/architecture/site-tree.md`, and project history: record approved behavior, affected routes/screens and verified delivery state.

Do not rename or move existing page components to introduce localization; the new `localization/` and `tools/localization/` folders are additive. Route/build ownership changes are limited to locale selection, message lookup and SEO output.

## One-sentence ticket summaries

| Ticket | Summary |
| --- | --- |
| LOC-01 | Inventory all user-facing copy and map each string, route, and dynamic value to a single YAML owner. |
| LOC-02 | Define the locale, message, fallback, routing, and SEO rules before implementation begins. |
| LOC-03 | Load English, German, and Dutch YAML catalogs and reject syntax, key, parameter, or unsafe-content errors. |
| LOC-04 | Implement locale selection, formatting, persistence, and safe switching while preserving saved training data and active work. |
| LOC-05 | Add an accessible Settings language selector and localize shared navigation, controls, statuses, and dialogs. |
| LOC-06 | Move remaining page, feature, help, manual, safety, and error copy into complete English, German, and Dutch catalogs. |
| LOC-07 | Build localized public pages with correct document language, canonical, hreflang, social metadata, and sitemap entries. |
| LOC-08 | Test catalog completeness, runtime switching, data preservation, accessibility, routing, and SEO output. |
| LOC-09 | Run acceptance gates, fix failures, bump the version once, and prepare a validated release candidate. |

## Implementation progress record — 2026-11-17

| Ticket | Current evidence and remaining work |
| --- | --- |
| LOC-01 | The screen-to-namespace ownership inventory exists; key-level source mapping and the unowned-copy scan remain. |
| LOC-02 | Approved locale defaults, route rules, YAML schema, SEO behavior, and exclusions are documented in the requirements and this plan. |
| LOC-03 | Deterministic YAML compilation, three-locale key/placeholder validation, HTML rejection, generated-file freshness checks, and a release-only non-empty-namespace gate are implemented. |
| LOC-04 | Locale normalization, safe interpolation/plurals, formatting, device preference persistence, and switching are implemented. Unit coverage now exercises locale-prefixed Back/Forward restoration and confirms changing language does not write gun-training data; browser-level preference persistence acceptance remains. |
| LOC-05 | The Settings selector, static Settings copy, shared header/navigation, and dynamic audio/vibration status strings use YAML. Remaining common controls/dialog feedback still need an inventory pass. |
| LOC-06 | Initial EN/DE/NL catalogs/tests cover Sound Check, History, Guns, Gun Setup, and prior migrated surfaces. Practice and Sequence setup shells, Practice Guide shared labels, and public Help body now use YAML. Controller-owned setup/run/review and guide details, other public pages, Help/manual completion, and source-scan coverage remain. |
| LOC-07 | Public English/German/Dutch pages, locale metadata, self-canonicals, reciprocal hreflang and sitemap are generated; public build and `verify:dist` pass. Live edge behavior is not verified. |
| LOC-08 | Catalog, locale-specific History, Live Listen, public-page and controller tests exist; broad overflow/accessibility review and pinned visual acceptance remain. |
| LOC-09 | Jest, typecheck, lint, architecture, smoke, public build and distribution/SEO checks pass. Docs and visual evidence remain blocked; no version bump or release candidate yet. |

Learn Sounds now also localizes SoundCard progress summaries, controls, accessible names/alt text and trigger-profile guidance in both the React page and its retained native fallback. German runtime tests cover the translated controls and profile message. This migrates that surface but does not close LOC-01's full source-copy inventory.

Practice and Sequence run/review pages now also load their shared fixed interface labels from the common EN/DE/NL YAML catalog, including control labels, empty states, meter captions, progress accessibility labels, and locale-aware detected-value formatting. Dynamic phase announcements, session review summaries, and detailed per-repetition result cards now use localized copy, dates, numbers and time formatting. Locale-switch tests cover run/review announcements and result details in all three languages while preserving the English guide-fragment contract.

## Implementation progress record — 2026-11-20

Localized Live Listen readiness/controller status copy and saved-session/history date, number, status and deletion copy; History verification options now respond to the active locale; additional common gun/setup/sample messages and custom-drill catalog labels use YAML. Public SEO prerenders 42 canonical pages across 14 routes (English, German and Dutch), with locale metadata, reciprocal hreflang and sitemap entries. Practice and Sequence setup, run, review and result-detail copy plus Learn Sounds profile/card copy are localized. Full Jest passes **183 suites / 1,245 tests**; typecheck, both linters, architecture, localization completeness, smoke (**16/16**), public build and `verify:dist` pass. The pinned Chromium download remains blocked by HTTP 403, and documentation/visual review is open. No version bump or release; work remains on the feature branch.

**Tracked increment — 2026-11-20:** LOC-06 session announcements, review summaries, and per-repetition details localization took **20m 24s (0.34 active hours)**, measured from 13:14:42 to 13:35:06 UTC. Timing is wall-clock elapsed for this focused work session, including test runs. This is the first complete measurement; earlier feature effort was not logged. Based on this slice, LOC-06's remaining forecast is 14 h (8–19 h), and total remaining effort is 27 h (14.5–41 h). Future increments will be timed individually to improve estimates.

**Tracked increment — 2026-11-20:** LOC-04 added regression tests for locale URL history and for preserving gun-level training data during a device-language change; focused tests pass (10 tests across preference and navigation suites). Elapsed time was **1m 46s (0.03 h)**, 13:35:54–13:37:40 UTC. LOC-04's remaining estimate is now 0.75 h (0.25–1.5 h), primarily for browser-level persistence/history acceptance; total remaining forecast is 26.75 h (14.25–40.5 h).

## Implementation progress record — 2026-11-19

Settings live audio/vibration feedback now uses parameterized EN/DE/NL YAML messages. The React Settings handoff carries status strings as state instead of mutating React-owned text nodes; regression coverage verifies status survives locale-driven rerenders. Shared Drill Setup primitives accept localized labels, and Practice/Sequence setup shells now use their respective EN/DE/NL catalogs. Locale-switch tests cover both pages. Full Jest passes **181 suites / 1,215 tests**; smoke passes **16 checks**; public build and `verify:dist` pass; component lint and typecheck pass. The English Chromium drill-setup workflow passes at 320 px and 390 px using system Chromium. The pinned Playwright Chromium executable is absent, so canonical pinned visual acceptance remains unverified. `localization:complete` still stops at the not-yet-migrated Practice Guide namespace; `docs:check` reports stale guide/source evidence predating this increment. Actual active time is not tracked. No version bump, merge, or deployment; work remains on the feature branch.

Practice Guide shell strings and the public Help article body have since been moved into EN/DE/NL YAML, with locale tests for each. The Practice Guide's per-mode instructional data and other public-page copy remain English. The focused guide/help tests pass 20 tests; typecheck, component lint, localization consistency, public build, and `verify:dist` pass. `localization:complete` now reaches the empty `public-site` namespace, confirming the next incomplete catalog; catalog release readiness is still blocked. Actual time not tracked; no release or version bump.

Implementation time was not measured. Most recent full test run passed **1,200 tests across 181 suites**. `npm run lint:components`, `npm run lint:runtime`, `npm run typecheck`, and `npm run verify:architecture` pass. Build, `verify:dist`, and smoke (16/16) passed after Settings migration. `npm run localization:complete` fails as expected because `home.messages.en.yaml` and most other page catalogs are empty. `npm run docs:check` remains failing on stale visual/GIF evidence, source fingerprints, and site-tree/SEO inventories; those baselines have not been reviewed or regenerated for localization. No version bump, commit, push, merge, or deployment has occurred.

## Ticket sequence

### LOC-01 — Message inventory and translation ownership

**Recommended model:** `gpt-6.1-terra`, medium reasoning. Use it for broad source inventory and ownership mapping; reserve frontier reasoning for conflicts discovered in routing/SEO design.

Inventory every user-facing string across React pages/components, retained native templates/controllers, accessibility labels, validation/errors, browser prompts, help/manual content and SEO metadata. Map each string to a page namespace or the shared namespace; identify generated/user-provided text that must remain data rather than translation copy. Record route-to-page ownership and flag strings that need parameters or plural forms.

**Acceptance:** inventory covers every user-visible screen/state and initial public HTML; each string has one stable key/owner; no translation scope is inferred from technical identifiers or user data. Produce translation-ready English source copy and a German/Dutch completeness checklist.

### LOC-02 — Localization requirements, SEO policy and resource schema

**Recommended model:** `gpt-6-astra`, high reasoning. This step reconciles route identity, crawl/index rules, saved preference precedence and translation completeness before approval.

Turn this plan into the approved CHG-070 requirement and design notes. Define supported locale tags, key naming, interpolation/plural semantics, accessible language selector behavior, fallback/error policy, public URL mapping, hreflang/canonical behavior, and SEO sitemap inclusion rules. Review affected screens in `screen-map.json` and update the architecture/site tree.

**Acceptance:** documented before/after behavior, data ownership, test matrix, all impacted screens/routes and explicit approval recorded. No application code changes before this requirement/design revision is approved.

### LOC-03 — YAML loading, schema validation and message catalog

**Recommended model:** `gpt-6.1-terra`, high reasoning. This is a cross-cutting build/runtime boundary where safe parsing, key validation, static output and offline behavior must agree.

Add page-scoped English/German/Dutch YAML message files and the three common files. Add a constrained YAML loader/catalog that validates locale, key shape, duplicate keys, placeholders and prohibited HTML. Decide and document whether Vite imports YAML through a maintained plugin or a deterministic build-time catalog generator; validate all YAML at build/CI time.

**Acceptance:** examples follow the requested naming (`home.messages.en.yaml`); every page catalog uses stable keys; build fails with file/key diagnostics on malformed YAML, duplicate/missing keys, mismatched interpolation parameters or invalid locale tags; all three locales resolve every required key.

### LOC-04 — Locale runtime and persistence

**Recommended model:** `gpt-6.1-terra`, high reasoning. It touches settings persistence, backups, navigation, active capture guards and page lifetimes.

Implement the shared locale service: default to English, load the selected locale, format locale-aware numbers/dates where the app presents them, interpolate named parameters safely, support plural forms, and persist selection with current device preferences and backups. Integrate updates without page reload where safe, while preserving form drafts, route context and active-work guards.

**Acceptance:** existing/missing/invalid saved language resolves to English; supported selection survives refresh and compatible backup/restore; no saved training data changes; changing locale during active capture/session follows existing safety/navigation locks; missing data is detectable and does not crash the app.

### LOC-05 — Settings language control and shared chrome

**Recommended model:** `gpt-6.1-sol`, medium reasoning. The component work follows settled APIs and can use the efficient implementation model, with accessibility review in LOC-08.

Add an accessible Language selector in Settings (English, Deutsch, Nederlands), with the selected value announced and persisted. Localize header, navigation, shared buttons, status/empty/error states, and common dialogs through the shared catalog. Keep Settings selector usable while language changes.

**Acceptance:** keyboard and assistive technology can identify and operate the selector; current value is correct after load; all shared shell strings update; screen readers receive sensible native language metadata (`lang`) after switching; saved app data and focus/drafts remain intact.

### LOC-06 — Localize page and feature copy

**Recommended model:** `gpt-6.1-sol`, medium reasoning for wiring page batches; use `gpt-6-astra`, high reasoning for terminology decisions, plural rules and consistency review across English source copy. German/Dutch translation quality should receive fluent human review before release; automated completeness is not proof of translation accuracy.

Move all inventory strings into page-keyed YAML catalogs and route-specific shared messages. Cover Home, Learn, Drills, Practice/Sequence setup and run/review, Live Listen, Sound Check, History, Guns/Gun Setup, Settings, About/Contact/Help/guides, safety, confirmation/error dialogs, and retained legacy/native islands. Remove duplicate hardcoded copy only after each consumer has catalog coverage.

**Acceptance:** no user-facing hardcoded English remains outside the English catalogs, approved brand/product terms, user-generated content, protocol/browser-owned text, and explicitly documented exceptions; all pages render completely in all three languages; long German labels wrap without clipped controls or lost actions.

### LOC-07 — Localized routes and SEO metadata

**Recommended model:** `gpt-6-astra`, high reasoning for implementation design/review because canonical/hreflang/sitemap errors can create site-wide indexing problems. Use `gpt-6.1-terra`, medium reasoning for mechanical route/catalog wiring after the rules are fixed.

Extend the route registry/build prerendering to emit translated public pages under proposed `/de/` and `/nl/` paths while preserving all current English paths. Translate each public page’s title, description, headings and copy; emit correct document language, self-canonical, Open Graph locale, and reciprocal `hreflang` links. Include only actual translated canonical pages in the XML sitemap; preserve robots/noindex rules for operational pages and preview origins.

**Acceptance:** direct-load, refresh and navigation work on every localized public page; all localized routes return the intended page and metadata without JavaScript where current SEO architecture requires it; each route has exactly one matching canonical; hreflang alternates are reciprocal and never point to missing translations; sitemap has no duplicate, query, preview or noindex URLs; legacy English URLs retain their current behavior.

### LOC-08 — Translation and SEO test coverage

**Recommended model:** `gpt-6.1-terra`, high reasoning for test-matrix design and edge-case discovery; have a separate `gpt-6.1-sol`, high-reasoning review inspect whether assertions truly cover the accepted contract.

Add automated catalog/schema checks; runtime interpolation/plural/fallback tests; locale persistence and backup tests; route/switcher/navigation tests; locale-aware document `lang`, title, description, canonical, hreflang, Open Graph and sitemap tests; English/German/Dutch completeness checks; and functional checks for all page types and active-work/data-preservation guards. Add German/Dutch narrow-screen overflow and accessible-name assertions without screenshot comparisons.

**Acceptance:** every message key resolves in all supported locales, parameter contracts match, public metadata is unique/correct, all expected paths are present, app-only paths remain noindex, language switching preserves app data, and functional/accessibility tests cover all three locales.

### LOC-09 — Full validation and release candidate

**Recommended model:** `gpt-6.1-sol`, medium reasoning for running the prescribed checks and fixing routine failures; escalate multi-area or performance regressions to `gpt-6-astra`, high reasoning. Use a separate `gpt-6.1-terra`, medium-reasoning validation pass to review evidence and release readiness independently from implementation.

Run the complete repository acceptance gate from a clean candidate: dependency lock/install check; smoke and full unit suites; coverage ratchet; typecheck, lint, architecture and documentation checks; public and preview builds/artifact verification; integration/browser functionality across all locales; English-only visual suite in the one configured browser and mobile viewport; unchanged pinned performance gates; route/SEO artifact checks. Fix failures before versioning or publication.

**Acceptance:** all required checks are green; no non-English visual suite is added; English screenshots show no unintended change or are deliberately reviewed/updated; the unchanged performance gate passes; localized SEO output is inspected; the release version is bumped once for the completed feature and reported with the release commit/PR and observed deployment status.

## Dependencies and release order

`LOC-01 → LOC-02 → LOC-03 → LOC-04 → LOC-05 → LOC-06 → LOC-07 → LOC-08 → LOC-09`.

LOC-05 and LOC-06 can be split into page batches after LOC-04, but every batch must remain integrated with the shared catalog and pass the focused catalog/runtime tests. Do not create a releasable partial locale: English, German and Dutch must be complete together. Keep SEO route generation after translated public copy and metadata exist, so the sitemap cannot list untranslated or absent pages.

## Explicit exclusions

- No machine translation service or runtime network dependency.
- No language auto-detection or account-level/cloud synchronization.
- No translation of saved user-generated names, custom preset names, or historical content stored as user data; format surrounding UI in the selected language.
- No visual screenshot baselines for German or Dutch. Functional, accessibility, metadata, and responsive overflow tests still apply.
- No guarantee of search-engine indexing; valid metadata and sitemap submission are signals, not indexing guarantees.

## Current state

Execution is authorized by the user's “Looks good, proceed” instruction and the follow-up to continue all remaining tickets. The user directed feature work and plans to stay on a feature branch, with `b` and `main` unchanged; the current branch is `codex/environment-recovery-2026-11-19`. All LOC tickets remain open until their acceptance criteria are met. Preserve unrelated working-tree changes.

## Latest validation checkpoint — 2026-11-19

**Done ticket summaries:** LOC-02 defines the approved locale/SEO contract; LOC-03 provides YAML compilation, locale/key/parameter checks, generated-output freshness validation and a release completeness command. LOC-04 has the runtime, locale preference persistence, and route-prefix foundation; LOC-05 has the Settings language selector and migrated Settings/shared-shell copy. LOC-06 has started Sound Check, History, Guns, and Gun Setup catalog migration with locale-switch tests. LOC-01 has a screen-to-namespace inventory, but key-level extraction and a hardcoded-copy scan remain incomplete.

**Validation:** full Jest passes **181 suites / 1,209 tests**; component lint, runtime lint, TypeScript, architecture ownership, build, distribution verification, and 16/16 smoke checks have passed on this working tree. Focused localization tests pass (15 tests across Guns, Gun Setup, and History); component/runtime lint and TypeScript pass after this increment. English mobile screenshots for History and Guns pass. The Sound Check screenshot still has an exact-pixel mismatch affecting 49 footer-text pixels and needs investigation; the screenshot run did not include Gun Setup or Sound Check from the canonical page catalog. The release-only `localization:complete` gate currently fails because `practice.messages.en.yaml` is empty and several namespaces remain blank. `docs:check` remains red due to stale design/GIF evidence, source fingerprints, and site-tree/SEO inventory; these are open work, not accepted failures.

**Remaining ticket summaries:** LOC-01 (1–3 h) finish key-level source ownership and unowned-copy scan; LOC-04 (0.25–1.5 h) finish browser-level history/persistence/data-preservation acceptance; LOC-05 (0.5–2 h) complete common-message source audit and interaction coverage; LOC-06 (8–19 h) migrate remaining manuals, app/public copy and finish translation-source audit; LOC-07 (0.5–2 h) review generated localized SEO output and route evidence; LOC-08 (2–7 h) finish locale, accessibility, overflow and visual coverage; LOC-09 (2–6 h) complete docs/visual review and final release validation. Combined remaining forecast: **26.75 active Codex hours (14.25–40.5 h range)**, excluding human translation review and owner device testing. Most recent measured increments took 0.34 h and 0.03 h.

No version has been bumped and CHG-070 is not releasable. `b` and `main` remain unchanged. Do not publish localized SEO paths until LOC-06/07 prove their content complete; retain noindex for incomplete localized app routes.


**Tracked increment — 2026-11-20:** localized the retained Custom Drill Editor in EN/DE/NL drill/common catalogs. The app-owned host now responds to locale changes while a saved drill is open, including translated sound names and accessible action labels; the shared UI package remains app-independent. English prerender parity and native fallback/rollback behavior are preserved. Active elapsed time was approximately **16m 33s (0.28 h)**, measured from the editor work's 13:39:48 UTC start marker through 13:56:21 UTC; timing includes focused and full test/build validation. Focused tests pass (22 tests), full Jest passes (183 suites / 1,248 tests), typecheck, component lint, architecture, localization completeness, smoke (16/16), public build/verification and preview build/verification pass. `docs:check` remains blocked by existing stale guide GIF/source-review fingerprints. LOC-06 remaining estimate is 13.5 h (7.5–18); total remaining is 26.25 h (13.75–39.5). No version bump or release.

**Tracked increment — 2026-11-20:** moved animated Practice Guide frame copy, counters, timing numbers, simulated microphone states, and play/pause controls into EN/DE/NL catalogs. Added German/Dutch assertions for frame text, sequence sound labels, decimal separators, and accessible control names; English native/React illustration parity remains covered. Active elapsed time was **10m 51s (0.18 h)**, measured from 13:58:17 to 14:09:08 UTC including validation and this record. Focused tests pass (40 tests across 3 suites); full Jest passes **184 suites / 1,252 tests**; localization completeness, typecheck, component lint, architecture, smoke (16/16), and sequential public/preview build plus artifact verification pass. `docs:check` remains blocked by pre-existing stale guide GIF and source-review fingerprints; no reviewed media was regenerated. LOC-06 remaining estimate is 13 h (7–17.5); total remaining is **25.75 h (13.25–39)**. No version bump, release, or changes to `b`/`main`.
