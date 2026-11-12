# Initial account, cloud and training features — implementation needs

CHG-074 · 2026-11-12 · **Requested scope and technical analysis only; no implementation or provider selection is approved here.** Work remains on `feature/monetization-rollout-plan`; `b` and `main` stay unchanged. This document records the initial feature set the owner wants to investigate before a later pricing/payment plan.

## Requested initial scope

| Capability | Initial requirement | Boundary for the first implementation |
| --- | --- | --- |
| Account | Optional account creation/sign-in, preferably Google sign-in | Google authenticates the user; it is not cloud storage and must not request Google Drive access. Keep local practice usable without sign-in. |
| Cloud data | Store and recover a user's app library | Start with private, versioned cloud backup and explicit restore. Do not claim continuous multi-device sync until conflict handling is implemented and tested. |
| Gun library | Up to five gun profiles available to an account | Include each profile's learned sound features, preferences, presets/configuration and history associations. Do not delete older profiles if an account already contains more than the new limit; define a safe migration rule. No Free/Pro gate is chosen yet. |
| Drill history | Graphical historical view | Derive charts from persisted practice/session records; keep accessible text/table summaries and exports. Compare like-for-like drill types and guns. |
| More drill options | Investigate before adding modes | First audit existing modes and interview/test users. Only propose a mode if the app can detect and measure its required events reliably. No specific new drill is approved yet. |
| Drill analysis and suggestions | Show useful interpretation and next-practice ideas | Start with transparent, deterministic rules based on the user's own saved results. Show sample size and reason; do not claim aim, safety, physical action or firearm status. No generative AI or external upload is required for the first version. |

The existing app already stores profiles, derived sound features, preferences, custom presets and drill-session results locally. Refreshes and compatible deployments on the same origin already preserve IndexedDB. Cloud recovery mainly protects against browser-data deletion/eviction, device loss and moving between origins/devices; it does not replace local persistence. Data under a `workers.dev` origin is separate from `easydryfire.com`, so first sign-in must explicitly transfer the selected local library. A cloud project must carry the current schema-4 / backup-format-4 library forward rather than replace or reinterpret it. Raw microphone recordings/video are not part of this request and must not be uploaded.

The current public edition and private Full preview have different gun-creation behavior. The requested five-profile capability is a product requirement for planning; this change does **not** change current public limits, edition rules, or access to paid features. Price, payment processor, subscription checkout and paid entitlements are deferred to a later plan.

## Recommended technical direction

### Account and Google sign-in

For the lowest-complexity Google-first prototype, evaluate **Firebase Authentication with Google as the sign-in provider**, rather than writing a complete custom OAuth/token/session stack. Firebase's web SDK supports popup and redirect flows and documents redirect as preferred on mobile. There is a specific Safari issue for this app: Firebase says its default redirect helper can fail when third-party storage is blocked, including Safari 16.1+, and apps hosted outside Firebase Hosting must choose a workaround. Because EasyDryFire is hosted on Cloudflare, the likely redirect option is a transparent same-origin Worker reverse proxy for Firebase's `/__/auth/` helper on `easydryfire.com`, with matching authorized domains and OAuth redirect settings; a 302 redirect is insufficient. A popup is another SDK option but may be blocked and is less smooth on mobile. Treat the Firebase choice as conditional until an iPhone Safari/Home Screen proof validates sign-in, return navigation, session persistence and refresh. A managed account can later support an additional sign-in/recovery provider without changing the app's internal user ID.

Important distinctions:

- A Google account only establishes identity. It does not save EasyDryFire data to Google Drive.
- Do not request Drive or unrelated Google API scopes. Use only the identity information needed to authenticate and maintain an internal Firebase UID.
- Do not use email address as the ownership key; emails can change. Link identities through the provider's stable UID and explicit account-linking flow.
- Anonymous users must be able to link a local library after signing in. If both local and cloud libraries exist, never silently overwrite or merge. Show their timestamps and contents, retain/export the local copy, and require an explicit choice.
- Create separate Firebase projects/OAuth clients for staging and production; configure verified domains, same-origin auth-helper proxy routes, redirect URLs and consent/privacy branding; keep secrets/configuration out of source control. Restrict the Worker proxy to the required Firebase auth-helper route/host (never a user-selected open proxy), disable caching for auth responses and validate staging and production origins independently. Test that service-worker caching never caches auth responses. The user owns Cloudflare environment configuration; no live setup is performed by this plan.

Firebase is a candidate, not selected. It keeps Google Auth, database and object storage together, but adds a vendor and requires an active billing plan for Firebase Cloud Storage. If reuse of Cloudflare is more important, another option is Google-backed managed auth plus a Worker API and private D1/R2 storage; this needs custom token verification, session/authorization boundaries and more integration tests. Supabase Auth with its Google provider and Postgres/Storage is another integrated alternative with a published Pro starting price. Compare final region, terms, costs, export/exit and operating work before creating production resources.

### User-facing surfaces

Add an **Account and backup** area under Settings rather than another primary navigation tab. It should show: signed-out/local-only state; a Google sign-in action; which library/gun count will be uploaded; current backup status and last confirmed save time; retry/error help; restore/replace choices; manual export; sign-out; and cloud/account deletion. Follow Google sign-in button branding and accessible naming. Make clear that signing in does not automatically grant access to the Google Drive account or upload raw recordings. Keep account setup optional and do not interrupt a drill.

## Cloud backup, restore and eventual sync

Treat these as separate features:

1. **Backup/restore (first):** after explicit opt-in, save a complete versioned snapshot and show its true completion time/status. Restore to a new/cleared device after validating the full snapshot. Preserve the previous good backup if an upload or restore fails.
2. **Cross-device sync (later unless explicitly added):** propagate edits automatically between devices. This needs revisions, conflict UI/copies, offline queues, deletion tombstones and account-switch isolation. It must not be implied by a “cloud backup” label.

First snapshot contents: global preferences; up to five gun profiles; each gun's current derived acoustic training features/calibration; saved custom drills and settings; completed and partial saved sessions/history needed by the current backup contract. Exclude raw PCM/audio/video, microphone streams, Google credentials, card data and unrelated analytics. Validate size/schema/ownership server-side and preserve compatible older backup formats.

Data placement recommendation to prototype: Firebase Auth for identity, Firestore for small account/library metadata and Cloud Storage for versioned full-library backup objects. A full library backup can exceed Firestore's document size limit, so do not serialize the entire archive into one document. Enforce owner-only rules using the authenticated UID, use private objects, and test security rules in the Firebase Emulator Suite. Never rely on hidden UI or CORS for authorization.

Before creating Firestore, choose a supported EU data location with legal/privacy review: Firebase documents that the database location cannot be changed after provisioning. Align the storage bucket and any other regional services where possible, and review Google/Firebase data-processing terms, subprocessors and transfers. Cloud Storage for Firebase requires the pay-as-you-go Blaze plan; no-cost quotas may still apply, but a billing account and spend alerts are needed. This is a real operating cost/control decision even though customer pricing is deferred.

### Local data and recovery experience

Preserve the existing IndexedDB library and manual export/import. The proposed first-use flow is:

1. Practice locally without an account.
2. Offer optional Google sign-in from a clear account/backup entry.
3. Explain what data will be backed up, that raw audio is excluded, and that cloud backup is not live sync.
4. If the account has no cloud library, show a local library summary and ask before its first upload.
5. If a cloud library already exists, show local/cloud timestamps, gun counts and session counts; let the owner choose backup restore, keep local/export, or cancel. Do not auto-merge.
6. Show pending/saved/error state truthfully; retry safely.
7. Provide export, cloud-data deletion and account-deletion paths. Delete cloud copies on request subject to disclosed provider backup/retention windows; do not delete local data merely because sign-in ends.

Logout/account switching must stop queued writes, clear account-scoped caches, and never expose Account A's data under Account B. Account deletion needs recent reauthentication where required by the provider and a server-confirmed deletion workflow for app data, not only deletion of the identity record.

## History graphs and analysis

The graph layer should consume saved, immutable session results; it must not alter drill scoring or write synthetic outcomes into history. First candidates for measures are:

- reaction time from configured start signal to recognized trigger click;
- median and distribution/range by drill type, gun and date window;
- completed, early-trigger, missed/failed and interrupted repetitions;
- trend across comparable repetitions/sessions, with sample counts and date range visible.

Do not compare unlike drills, different signal settings, or mixed guns as if they were equivalent. Retain a readable table/text fallback, keyboard/assistive-technology labels, unit consistency, and empty/low-sample states. Use anonymized deterministic fixtures for charts; use local user data only in their authenticated scope.

Suggestions should initially be auditable rules, for example “not enough sessions to show a trend,” “repeat this setup to collect a comparable sample,” or “several attempts ended before the signal; review the practice instructions.” Each suggestion must show the metric and period that caused it and be dismissible. Any threshold/minimum sample count needs product validation and must be labelled provisional. Do not suggest tactical actions, diagnose safety, grade aim/movement, or present an AI opinion as measured fact. A future model/AI analysis is a separate privacy, safety, cost and evaluation decision.

## More drill options — investigation before specification

Do not add a list of assumed drills yet. First:

1. Inventory currently available Trigger Press Group and Sequence drill modes, setup choices and measurable events.
2. Ask users which training goal is missing and when they would use it; distinguish drill names from actual user outcomes.
3. For each candidate, specify the event sequence and measurable output, required trained sound categories, false-positive/missed-event behavior, microphone limitations and safety wording.
4. Reject modes whose core result requires aim, target impact, firearm status, physical movement or a sensor/camera the app does not have.
5. Prototype the smallest promising candidate, then validate comprehensibility and repeatability with synthetic cases plus owner device testing before adding it to the catalog.

The result of this stage is a ranked short list and acceptance criteria, not code or a promise of an “AI coach.”

## Implementation order and done criteria

| Step | Work | Required proof before next step |
| --- | --- | --- |
| 0. Decisions and data map | Confirm backup vs sync boundary, Google/Firebase candidate, EU region, five-gun migration, stored fields, retention, deletion/export and version compatibility | Approved architecture/data-flow diagram; threat/privacy review; no app-code change yet |
| 1. Auth proof | Build isolated staging sign-in using Google provider; redirect flow for iOS Safari/PWA; anonymous-to-account linking | Valid/invalid/cancelled sign-in; same UID across refresh; logout/account switch isolation; account-link collision/recovery handled; no Drive scope; existing first screen/payload performance preserved |
| 2. Secure cloud snapshot | Staging Firestore metadata + private Storage backup; UID owner rules; version/checksum/idempotency | Emulator tests deny unauthenticated and cross-account reads/writes; bounded quota/body; backup failure keeps prior good snapshot; old format imports and export still work |
| 3. Backup/restore experience | Consent/explanation, first upload, status/error/retry, new-device restore and account deletion | iPhone Safari and desktop flows; cleared local data restores correctly; mismatches require user choice; no silent overwrite; delete propagates and local copy remains as designed |
| 4. Five-gun library | Ensure account backup/restore and selected app experience support up to five profiles, with all data owned by the correct profile | Five profiles survive refresh, backup, restore and account change; over-limit legacy data is retained/exportable; free/full edition policy is separately decided |
| 5. Historical graphs | Add chart/summary views over existing immutable session data | Unit tests for aggregation/filter/time-window/units/empty/small-sample cases; visual checks at the agreed mobile viewport; accessible text equivalents; no session result mutation |
| 6. Drill research and spec | User interviews and ranked candidate modes; select only detectable/measurable actions | Reviewed requirement and design for each selected mode; no new drill implementation until approved |
| 7. Explainable analysis/suggestions | Deterministic initial rules sourced from session aggregates | Unit/integration coverage for every rule, threshold, insufficient-data, contradictory and dismissed state; each recommendation gives its reason; no AI/data upload |
| 8. Pilot and acceptance | Private staging/preview; synthetic account isolation, owner physical device checks and recovery tests | Full automated checks green, manual iPhone/Safari/Home Screen sign-in/backup/restore, deletion/recovery acceptance recorded; cost/security/privacy controls confirmed |

All work remains documentation/research until separately authorized for implementation. The eventual code work stays on the requested feature branch; do not publish to `b`/`main`, bump the app version, configure production resources, or turn on paid restrictions as part of this plan. Prices, processors, subscription terms and paid entitlement rules belong in a later plan.

## Official implementation references checked 2026-11-12

- [Firebase web Google sign-in](https://firebase.google.com/docs/auth/web/google-signin): supports popup and redirect sign-in and states redirect is preferred on mobile devices.
- [Firebase redirect-flow best practices](https://firebase.google.com/docs/auth/web/redirect-best-practices): explains third-party storage restrictions in Safari and requires a compatible same-origin/custom-domain/proxy approach for apps hosted outside Firebase Hosting; the proxy must be transparent, not a 302. Its guidance also warns against asking users to disable browser protections.
- [Firebase account linking](https://firebase.google.com/docs/auth/web/account-linking): provider identities can be linked to one Firebase user ID; use this for anonymous-library promotion/recovery planning rather than merging by email.
- [Firebase Authentication](https://firebase.google.com/docs/auth): managed consumer authentication, user/session management and provider flows.
- [Firestore locations](https://firebase.google.com/docs/firestore/locations): select the database location at creation; the default database location cannot be changed later.
- [Firebase Security Rules basics](https://firebase.google.com/docs/rules/basics) and [Cloud Storage rules](https://firebase.google.com/docs/storage/security): rules can scope access to the authenticated UID. These rules must be tested, not inferred from UI behavior.
- [Firebase Rules unit tests](https://firebase.google.com/docs/rules/unit-tests): official emulator-based rule test approach.
- [Firebase Storage billing change](https://firebase.google.com/docs/storage/faqs-storage-changes-announced-sept-2024): Cloud Storage for Firebase now requires the pay-as-you-go Blaze plan; no-cost usage can remain within its quotas.
- [Firebase pricing](https://firebase.google.com/pricing): current service-specific no-cost and paid quotas; estimate Firestore and Storage separately in the calculator.
- [Firebase privacy information](https://firebase.google.com/support/privacy): review relevant service terms, data processing and subprocessors before choosing a region/provider.

These sources establish available mechanisms and current published constraints; they do not select a vendor, establish legal compliance or guarantee a particular project cost.
