# Application localization — CHG-070

Revision 1.0 · Scope: English, German and Dutch application localization with localized public SEO · Approved 2026-11-17

Owner request: keep English as the default; initially support English, German and Dutch; store user-facing copy in page-and-language YAML files with parameter support and a shared common-message file; allow language selection in Settings; preserve SEO and require the test suite to pass. The owner approved the ticket plan with “Looks good, proceed” and directed that all remaining tickets be completed.

## LOC requirements

| ID | Requirement | State |
| --- | --- | --- |
| LOC-01 | Inventory every user-facing message, accessible name, validation/error, help/manual string, public SEO field, dynamic value and owning page/catalog key. Keep generated user data, browser/OS copy, stable identifiers and approved brand/product terms outside message catalogs. | Approved; inventory in progress |
| LOC-02 | English remains the explicit default; support locale tags `en`, `de`, and `nl`; define stable keys, named parameters/plurals, fallback/error behavior, locale routing and crawl rules before code. | Approved |
| LOC-03 | All editable user-facing product copy is YAML: `common.messages.<locale>.yaml` for shared copy and `<page>.messages.<locale>.yaml` for each page type. Reject malformed YAML, duplicate/missing keys, mismatched parameters, unsupported locale tags and HTML-bearing values during validation/build. | Approved |
| LOC-04 | Language is a device-wide preference. Missing/invalid values resolve to English. Persist through refresh and compatible backup/restore. Switching language preserves IndexedDB data, active session/capture locks, focus and unsaved drafts. | Approved |
| LOC-05 | Settings exposes an accessible native language selector using the existing Settings select pattern. Shared navigation, headings, actions, statuses, dialogs, notices, footer and accessible names follow the selected locale; update the document `lang` value. | Approved |
| LOC-06 | All application screens, retained native/legacy surfaces, help, manuals, safety/error messages and public copy are complete in all three locales. User-generated names and historical user content remain unchanged; surrounding UI is localized. | Approved |
| LOC-07 | Existing unprefixed English URLs stay canonical. Localized public routes use `/de/` and `/nl/` prefixes with self-canonicals, reciprocal `hreflang` and `x-default`, translated metadata and sitemap entries only when every linked locale is complete. Operational routes remain `noindex` and excluded from sitemap. | Approved |
| LOC-08 | Automated tests enforce catalog completeness/key/parameter parity, safe interpolation, persistence/data preservation, switching and route behavior, accessible language controls, narrow-screen text overflow, `lang`, metadata, canonical/hreflang and sitemap correctness in every locale. | Approved |
| LOC-09 | Full unit/coverage, type/lint/architecture/docs, smoke, both-edition build/artifact, integration, approved English-only visual and unchanged performance gates pass before one feature version bump and release-candidate handoff. | Approved |

## Message resource ownership

Use stable page-type ownership rather than route instances: `common`, `home`, `learn`, `sound-check`, `settings`, `drills`, `practice`, `sequence`, `practice-guide`, `live-listen`, `history`, `guns`, `gun-setup`, `about`, `contact`, `help`, and `public-site`. Each namespace has `.messages.en.yaml`, `.messages.de.yaml`, `.messages.nl.yaml`; common controls/actions/statuses belong only in `common`. Manuals share `practice-guide`; route-specific SEO title/description and headings use stable guide IDs inside that namespace. The generated catalog may be a build artifact but YAML stays the sole editable copy source.

Message keys are locale-neutral dotted identifiers. Parameters use named placeholders, are escaped as plain text, and never create HTML. Plural messages use locale-aware `Intl.PluralRules` categories; numeric/date/measurement display uses `Intl` with explicit application policy. Missing keys are build/CI errors; runtime must never silently publish mixed-language content. English remains a defensive development fallback only for malformed local data and must emit a diagnostic.

## SEO and routing contract

English routes remain unchanged. German and Dutch public routes share stable route slugs beneath `/de/` and `/nl/`. The route path is authoritative on direct entry and refresh; switching locale navigates to the equivalent route, and if no localized equivalent is published it goes to that locale's app root with an accessible explanation. Do not infer language from the browser. Keep saved gun names, preset IDs, sessions and other personal data out of URLs and metadata. App-only paths stay noindex and out of XML sitemap. Retain current redirect behavior for legacy English paths.

Localized public pages must be crawlable in initial HTML where current SEO architecture requires static rendering. Every published localized route has one self-canonical, reciprocal complete `hreflang` alternates (`en`, `de`, `nl`, `x-default`), document `lang`, unique localized title/description, matching Open Graph locale, and sitemap membership. Never emit alternates or sitemap entries for incomplete translations. Preserve `.com` as canonical origin and the current `.app` redirect configuration.

## Accessibility and layout

The language selector has a visible associated label, correct current value, keyboard operation and a non-color selected state. Locale changes preserve focus where the same control exists and expose the changed language to assistive technology. German long strings may wrap; no labels, buttons, actions, headings or validation copy may clip, overlap or become unreachable at the supported mobile width. All interactive states and copy are functional-testable. Visual screenshot tests remain English-only, in the project's one configured browser/mobile viewport policy.

## Acceptance and exclusions

LOC-01 through LOC-09 and their ticket acceptance criteria are tracked in [the implementation plan](../project/localization-plan.md). English, German and Dutch must be complete together for release; no English fallback is permitted on a published German/Dutch page. No external machine-translation service, language auto-detection, account/cloud locale sync, translation of stored user-generated content, or German/Dutch screenshot baselines are included. Human linguistic review and the owner's real-device checks are separate from automated engineering acceptance; automation proves catalog/schema consistency, not translation quality.

Implementation status is not inferred from this approved specification. Ticket completion, test evidence, version, publication and deployment are recorded separately in [implementation history](../project/implementation-history.md).
