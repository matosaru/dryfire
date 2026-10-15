# Dry Fire With Ease branding

Revision: 1.1 · Date: 2026-10-15 · Approval: **Approved** · Implementation: **implemented and locally validated** · Deployment: **not verified**

The user directly instructed: **“no, lets leave dry fire with ease, just update logo to have this with ease, and all other places , where dry fire as a brand is used in an app”**. This authorizes the branding update below; it does not authorize unrelated behavior or data-format changes. See CHG-011 in the [approval log](../project/approval-log.md).

## Before and after

Before this update, the app presented Dry Fire / DRYFIRE with Sound Trainer as its primary lockup. The canonical display name is now **Dry Fire With Ease**. The existing orange/white angular DF monogram and dark/orange visual direction remain; the wordmark includes **WITH EASE** so the complete brand is visible.

| ID | Approved requirement and acceptance criteria |
| --- | --- |
| BRAND-01 | Use **Dry Fire With Ease** wherever the application identifies its brand: page title, visible header, accessible logo/header name, About text, PWA manifest display name and supported installation-title metadata. Uppercase visual treatment is allowed; the words remain the same. |
| BRAND-02 | The logo lockup retains the existing DF monogram and **DRY FIRE** wordmark, with **WITH EASE** visibly included. Keep orange/white colors and a readable layout on narrow mobile screens. **Sound Trainer** may remain as a secondary descriptive subtitle, but may not replace **With Ease**. |
| BRAND-03 | Update Capacitor's user-visible `appName` to **Dry Fire With Ease**. The name must remain readable in the app header and installation surfaces; platform truncation of a system label does not authorize dropping words from the supplied metadata. |
| BRAND-04 | Preserve existing database names, stores, persisted sound/drill identifiers, backup schema, manifest identity/start URL, package name, Capacitor `appId`, worker/project/repository identifiers and deployment origin. A display-brand update must not create a new storage identity or invalidate existing learned sounds and history. |
| BRAND-05 | Replace brand references in current documentation and record the new lockup's creation. Preserve historical approval evidence and previously reviewed image snapshots. Older mockups may retain their reviewed brand; their catalog must identify that difference and must not present them as the latest production lockup. No uniqueness or legal-clearance claim is established by the name change. |
| BRAND-06 | CHG-023, directly requested 2026-10-11: show **© 2026 Dry Fire With Ease. All rights reserved.** in the shared app footer, readable in both themes and at 320 px. Keep the existing data/microphone notice and brand. Record `easydryfire.com` and `easydryfire.app` as user-reported Cloudflare registrations; registration alone does not change app origin or connect a Worker custom domain. |

## Beta disclosure — CHG-041

Direct instruction: **“add some marker, that this site only a Beta version. Make it clearly visible, maybe somewhere near logo”**. The beta lifecycle label is independent of Free/Full build editions and does not change entitlements.

| ID | Approved requirement and acceptance criteria |
| --- | --- |
| BRAND-07 | Show a clearly readable, non-interactive **BETA** badge beside the full wordmark in the shared header on every existing page, in public and private builds. Use the existing orange accent with dark text, readable in both themes. Preserve logo/name, Settings access and header geometry without overlap or horizontal overflow at 320, 390 and 1024 px. Provide an accessible Beta version label. No storage, installed-app identity or edition change. |

Generic descriptions of dry-fire practice and technical `dryfire` identifiers are not display-brand labels. They do not need a forced wording change.

## Design record

The canonical DF monogram remains [public/logo.svg](../../public/logo.svg). The complete production lockup combines that monogram with the accessible HTML wordmark and BETA marker in [the shared header](../../src/templates/shared/header.html), styled by [src/styles.css](../../src/styles.css); the SVG alone does not contain the full name. See the [actual header screenshot](../design/archive/chg-011/brand/lockup.png), including Settings, and [Home screenshot](../design/archive/chg-011/home/overview.png).

This is the approved wording extension, retaining the existing monogram rather than adopting generated variants from earlier mockups. Existing [reviewed mockups](../design/README.md) remain available as historical flow/design evidence.

## Implementation and validation

Implemented: visible/accessibility branding, page and installation metadata, About text, Capacitor display name, branded backup download filename and the service-worker cache update from v9 to v10. Stable storage, backup-format, app/package and deployment identifiers remain unchanged.

Observed local validation on 2026-10-10:

- All 16 smoke checks and 48 Jest tests passed, along with the production build and `verify:dist`.
- Chromium verified the production title, accessible full-brand header, visible With Ease, manifest/iOS titles, About text and no header overflow or text collision at 320, 375, 390, 430, 768 and 1280 px widths.
- Original-format backup import/export still worked, with the new branded download filename. Seeded IndexedDB learned profiles, history and settings remained exactly unchanged after a v9-to-v10 service-worker cache update and reload. The local check explicitly registered the service worker on localhost.
- The linked screenshots are captures of the implemented production header and Home screen, not generated mockups.

Production output sizes, before → after (raw / gzip KB):

| Asset | Before | After |
| --- | --- | --- |
| HTML | 18.12 / 5.19 | 18.29 / 5.21 |
| CSS | 23.89 / 6.12 | 24.25 / 6.21 |
| JavaScript | 37.87 / 12.69 | 37.88 / 12.70 |

Worker output sizes are unchanged. Browser/OS installation labels on real devices and Cloudflare deployment have not been verified. The config supplies the native display name; this check does not establish a signed native release.

After deployment, reload the app to fetch the update. If an older cached screen remains visible, close and reopen the app after the updated service worker activates. Do not clear browser/site storage to refresh the branding; that would remove local learned data.
