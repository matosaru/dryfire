# Public Free and full development preview

CHG-032 · revision 2.0 · 2026-10-12. The user explicitly approved temporary public restrictions while retaining full feature code and existing saved-data access. Source implementation, test/image review, publication and deployment are separate in the [delivery tracker](../project/implementation-history.md).

## What is temporarily disabled

| Action | Public build | Full preview |
| --- | --- | --- |
| Create a first gun | Available | Available |
| Create additional guns | Hidden and transaction-limited to one saved gun | Existing five-gun capacity |
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

Both optimized builds use `dist/`; rebuilding replaces that output, not user data. `edition.json` records the edition, source revision and source digest. Verification rejects the wrong edition or checkout revision. Unknown `APP_EDITION` values fail the build. No query parameter, localStorage setting, email address or client plan switch changes the edition.

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

Use the pinned renderer from [visual-test instructions](VISUAL_TESTS.md), not system Chromium, for accepted comparisons. CI builds/tests public and preview separately and uploads edition-labelled difference reports. Cases cover fresh one-gun creation, atomic/concurrent rejection, existing libraries and presets, legacy editing/execution, direct submit/visible-control attempts, no client edition override, preserved text history and full creation/charts. Both informational screens retain all five bottom tabs with history/setup guards.

[Current screen registry](../architecture/screen-map.json) marks preview-only and public-only states; shared states are compared in both editions. Browser references are grouped by browser/edition/screen/state/width. Actual implementation captures use the declared edition (public for shared states). Record image review and unchanged reruns before accepting references; ordinary CI never accepts them automatically.

## Later real subscription testing

Accounts/cloud/billing remain paused. Future production Free/Pro tests require separate staff identities and audited server-controlled grants, plus a controlled purchase/refund check. No production browser override or fake payment secret is introduced now. Continue [feature PR → dev → main](../project/branching-strategy.md); production release remains separate.
