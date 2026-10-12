# Public Free and full development preview

CHG-032 / CHG-034 · revision 2.1 · 2026-10-12. The user explicitly approved temporary public restrictions while retaining full feature code and existing saved-data access. Source implementation, test/image review, publication and deployment are separate in the [delivery tracker](../project/implementation-history.md).

## What is temporarily disabled

| Action | Public build | Full preview |
| --- | --- | --- |
| Create a first gun | Available | Available |
| Create a second gun | Available | Available |
| Create a third or later gun | Hidden and transaction-limited at two saved guns; existing larger libraries kept | Existing five-gun capacity |
| Create new custom drills | Hidden and guarded on submit | Available |
| Edit/run existing custom presets | Available for the current gun's saved presets | Available |
| Advanced progress graphs, ranges and chart-data table | Hidden; chart code omitted from bundle | Available |
| Saved sessions and text timing summaries, recognition history, backup and all basic practice modes | Available | Available |
| Existing multi-gun selection/edit/delete/use and compatible backup restoration | Available; no records removed | Available |

No payment/account/subscription code exists to remove. The commercial roadmap remains; this is temporary availability, not an implemented paid plan. [EDITION-01–07](../requirements/build-editions.md) are authoritative.

## Retained code and data

[src/optional](../../src/optional/README.md) contains the retained editor and chart presentation. The chart is imported only in the compiled full branch. The editor stays in public output for legacy preset editing; it rejects creation there. Storage/preset execution remain shared to preserve every existing library and format-4 backup. IndexedDB schema 3, feature format 2 and backup format 4 are unchanged. No database migration, payment flag or local entitlement is added.

A valid existing multi-gun/custom backup can still be restored. This protects personal data; it is not payment proof. The public repository and browser code are inspectable. Build editions control published actions, not licensing/DRM; future hosted paid resources need backend authorization.

## Commands

```bash
npm ci
npm run build
npm run verify:dist
npm run preview -- --host 127.0.0.1
```

The default build/server edition is public. To run all retained features locally:

```bash
npm run dev:preview
# Or test the full optimized build:
npm run build:preview
npm run verify:dist -- --edition=preview
npm run preview -- --host 127.0.0.1
```

Both optimized builds use `dist/`; rebuilding replaces that output, not user data. `edition.json` records the edition, source revision/digest and complete bundled-asset list. Worker cache v28 preloads lazy modules as well as the app shell, without changing IndexedDB. Verification rejects the wrong edition or checkout revision. Unknown `APP_EDITION` values fail the build. No query parameter, localStorage setting, email address or client plan switch changes the edition.

## Deployment boundary

Ordinary dev/main deployment still consumes the **public** `minified-web-app` artifact. Both production/development deploy scripts verify public edition/source metadata before invoking Wrangler. An accidental full build cannot use these scripts. The full edition runs on loopback and in isolated CI contexts; no hosted full preview is claimed.

Before hosting full preview, configure Cloudflare Access or equivalent authentication on the actual custom hostname **and every reachable Workers/preview/alias URL**. Disable unprotected aliases. Verify anonymous requests are denied, authorized staff can load the full app, and assets/service-worker paths have the same boundary. A hidden URL, noindex, local email comparison or an environment variable saying protection is enabled is not authentication. Then add a dedicated tested-preview artifact/deployment path through the existing PR and environment gates. Cloudflare credentials/live Access configuration are not available in this workspace; that external prerequisite remains unverified. No public full-preview deployment is performed.

## Tests and screenshots

```bash
npm test
npm run test:smoke
npm run build
VISUAL_EDITION=public npm run test:visual
npm run build:preview
npm run verify:dist -- --edition=preview
VISUAL_EDITION=preview npm run test:visual
```

Use the pinned renderer from [visual-test instructions](VISUAL_TESTS.md), not system Chromium, for accepted comparisons. CI builds/tests public and preview separately and uploads edition-labelled difference reports. Cases cover fresh two-gun creation and third-gun rejection, atomic/concurrent rejection, existing libraries and presets, legacy editing/execution, direct submit/visible-control attempts, no client edition override, preserved text history and full creation/charts. Both informational screens retain all five bottom tabs with history/setup guards. First-install offline refresh tests retain the whole restored library in both editions; the optimized local preview uses same-origin assets without development CORS Vary headers.

[Current screen registry](../architecture/screen-map.json) marks preview-only and public-only states; shared states are compared in both editions. Browser references are grouped by browser/edition/screen/state/width. Actual implementation captures use the declared edition (public for shared states). Record image review and unchanged reruns before accepting references; ordinary CI never accepts them automatically.

## Later real subscription testing

Accounts/cloud/billing remain paused. Future production Free/Pro tests require separate staff identities and audited server-controlled grants, plus a controlled purchase/refund check. No production browser override or fake payment secret is introduced now. Continue [feature PR → dev → main](../project/branching-strategy.md); production release remains separate.

## Proposed in-app tester switch

Recommendation requested on 2026-10-12; **planning only**, not a new implementation approval. The simplest first option is a small **Testing: Free / Full** selector inside an exclusively private preview build. Cloudflare Access authenticates and explicitly allowlists testers for that entire build; every admitted tester already has permission to use Full. The switch simulates the real Free restrictions without granting access. It is compiled out of public output together with its override path; a public URL/localStorage value cannot activate it. Access must protect all alternate hostnames, assets and Workers URLs, with unprotected aliases disabled. The existing build separation is implemented, but this selector and live Access configuration are not.

Default private testing to Free, show the active simulation clearly, and preserve the test library on a mode change. Private-origin preferences may remember a tester's simulation; they are never paid entitlement evidence and never affect public output. Use the same capability rules and guards as the actual editions, including legacy-data access, to avoid a cosmetic hide-only simulation. Exercise both optimized published editions in CI as well; a private simulation does not replace those artifact checks. Full preview assets are available to authorized testers, and public source remains inspectable: this boundary protects access, not exclusive ownership of browser code.

For a later **production** switch, once authentication and backend entitlements exist, expose the selector only after the server confirms an explicitly allowlisted tester account. Ordinary users never see the selector. Switching calls an authenticated server endpoint; the server checks the tester role, target environment and ownership, then stores a short-lived override. Use a secure HttpOnly session cookie, CSRF protection, audited grants/expiry and deny-by-default authorization. A client flag or decoded role must never grant access. Enforce permissions on protected APIs/resources as well as visible controls.

Free simulation means the actual public rules: two new guns, no new custom drills and no advanced graphs. Full simulation means the five-gun/custom/chart preview. Preserve existing local data and normal backup recovery in either mode; switching does not delete profiles or rewrite a subscription. Display the active testing mode and expiry to prevent confusion. On expiry or revoked tester access, restore the account's real permissions. Isolate test billing, secrets, storage and identities on dev; production override grants are limited to named staff and their own test data. Actual customer billing checks remain a separate controlled test.

Acceptance for that later feature: anonymous and ordinary accounts cannot request Full by revealing a control, calling its endpoint, changing a URL/localStorage value or replaying an expired/revoked grant; Free/Full/lapsed behavior has server and UI coverage; no grant exposes another person's data. The public repository and downloaded browser code remain inspectable. Authorization can protect hosted resources and private builds, but cannot make locally delivered features impossible to copy. No login, tester API or production override is implemented in CHG-034.
