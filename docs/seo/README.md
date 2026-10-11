# SEO and indexing proposal

Prepared for CHG-018 · 2026-10-11 · **Proposed; not applied to the application or deployed.**

CHG-026 requests Contact and public SEO in the [forward web plan](../project/web-commercial-plan.md). Existing templates remain preparatory; their current Worker canonical is not changed until final routing/domain design and origin-data migration are specified. Do not publish the example paid price or make account/cloud claims before those features exist.

## Planned public topology — CHG-026

Working routing proposal, **not implemented or added to the current generated site tree**:

| Candidate location | Proposed public content | Indexing/privacy rule |
| --- | --- | --- |
| `easydryfire.com/` | Clear landing page with useful free dry-fire explanation and Open app action | Public initial HTML without microphone/sign-in; one canonical |
| `/features/` and `/help/` on the marketing origin | Real capabilities, calibration/device help, safety/timing limits | Only shipped capabilities; no invented accuracy claims |
| `/contact/` plus Contact in app navigation | `easydryfire@gmail.com`, Email support action and copy-address fallback | Free/Pro/anonymous access; no automatic gun/history/audio attachment |
| `/pricing/` | One Free/Pro comparison after offer approval | Publish only actual price/benefits; no charging for roadmap items |
| `/privacy/` and `/terms/` | Real trader/contact, data purposes/retention and consumer/billing terms | Match implemented services and Lithuania/target-market obligations |
| `easydryfire.app/` | Existing PWA plus later reviewed account/backup/billing states | Personal/account/session views noindex; device data never public sitemap content |

The user registered both domains, but bindings and deployed origin behavior are unverified. Preserve the current Worker URL and existing libraries until users can explicitly export/link/restore to any new origin; `.com`, `.app` and the Worker origin have distinct IndexedDB storage. Contact can start with `mailto:` and a copy fallback, avoiding a new server email form/spam service. Verify iPhone behavior when no mail client is configured and never claim mailto sent a message.

Define final routes/designs before application changes, maintain real HTTP 404/redirect/content types and then update the architecture registry/tree and screenshots. Only deployed public canonical 200 pages enter sitemap; preview/dev return noindex. Account APIs/private pages are excluded and protected independently—robots rules are not access control. Existing root-only crawl templates remain drafts, not the final proposed multipage sitemap.

## Current audit

The production origin supplied by the user is `https://dryfire.matosaru.workers.dev/`. Source has one public URL; app navigation uses same-URL history states. Gun Setup, Learn, Practice, History and Settings are not separately crawlable pages. Do not advertise invented URLs such as `/practice/` in a sitemap.

`index.html` already has English language, a brand title, descriptive text, mobile metadata and a manifest. Source currently has no canonical link, Open Graph/Twitter metadata, JSON-LD, `robots.txt` or `sitemap.xml`. No production HTTP/indexing audit is claimed: direct Cloudflare access remains blocked by this workspace gateway. Local source and deployed HTTP behavior must be verified separately.

First-time users see a gun setup form after initialization. There is no dedicated public explanation/FAQ page. Accurate metadata helps explain the page, but does not replace visible, useful content or guarantee indexing. Personal local History is not public content to index, and microphone permission must never be needed to read public product information.

## Recommended search listing

**Title (54 characters):** Dry Fire With Ease | Dry-Fire Timer & Practice Tracker

**Description (148 characters):** Practice dry fire with trigger-click calibration, start beeps, six practice modes and progress charts. Gun profiles and history stay on your device.

These lengths are editorial targets, not guaranteed Google display limits. Search engines may rewrite titles/snippets. Use natural phrases such as “dry-fire timer”, “trigger-click calibration”, “dry-fire practice app”, “start beep” and “practice history”; do not add a meta-keywords tag or repeat keywords unnaturally. Keep the full brand name.

## Prepared artifacts

| Draft | Application when authorized |
| --- | --- |
| [head.html](templates/head.html) | Replace the existing title/description once and add canonical and social metadata in the initial HTML head |
| [webapplication.json](templates/webapplication.json) | Inline this exact JSON as `application/ld+json`; keep facts consistent with visible public content |
| [robots.txt](templates/robots.txt) | Publish at `/robots.txt` after sitemap deployment; production crawling allowed |
| [sitemap.xml](templates/sitemap.xml) | Publish at `/sitemap.xml`; list only the real canonical root URL |
| [Public product copy](public-copy.md) | Candidate visible introduction and FAQ, awaiting public-content implementation scope |

Templates live in documentation and are not copied to `public/`, `index.html` or `dist/` by this change. The proposed social image is the existing deployed-path 512 px app icon, with a square `summary` card. A dedicated 1200×630 social preview can be added later; do not reference a nonexistent image. Verify actual production icon availability before enabling metadata.

The JSON-LD describes a SoftwareApplication and omits invented prices, offers, ratings, reviews, downloads, accuracy statistics and affiliation. Structured data does not guarantee a Google app rich result; Google's eligibility requirements may require facts this app does not publish. Describe supported capabilities honestly, including timing limits and unavailable vibration on browsers without the API.

## Efficient implementation sequence

1. **Prepared here:** complete the source audit, title/description, social/canonical/JSON-LD/crawl templates and public copy. Existing app behavior and storage origin remain unchanged.
2. **Proposed next:** apply the metadata and crawl files alongside an approved visible public introduction/FAQ. Keep the app's start URL, database identity and existing data intact. Moving the app to `/app/`, adding a separate landing page or adding crawlable help/privacy pages requires a specific product/routing design, not a silent SEO-only move. Use real routes and meaningful HTTP 404s for missing content.
3. **Validate before publishing:** parse JSON-LD/XML, inspect initial and rendered HTML without microphone permission, check mobile accessibility, ensure one canonical/title/description, verify all referenced images and run repository/build checks. Include any actual service-worker/asset changes in cache-version maintenance. Serve production HTML/XML/text with correct content types.
4. **Verify deployment:** check canonical `/`, `/robots.txt`, `/sitemap.xml` and icon responses over public HTTPS. Check redirects and unknown-path status. Preview deployments should return `X-Robots-Tag: noindex`; do not rely on `robots.txt` blocking to remove an indexed preview. Only include successful public canonical pages in the sitemap. Omit `lastmod` unless a truthful page-content modification date is maintained; do not use a build timestamp for unrelated doc-only commits.
5. **Owner account action:** verify the exact production URL-prefix property in Google Search Console, submit the sitemap and inspect/request indexing of the canonical URL. A `workers.dev` subdomain does not grant DNS control of the Cloudflare parent domain; use an available URL-prefix verification method. Record verified access and results rather than promising submission from this workspace. Bing Webmaster Tools is an optional separate step.
6. **Measure:** record indexed coverage, real queries, impressions/clicks and mobile performance after launch. Adjust useful public content using evidence; no ranking/indexing guarantee. If a custom domain is chosen later, approve and test canonical/redirects and the separate same-origin storage migration before moving users.

## Acceptance and remaining work

Prepared templates and source findings are complete. Production metadata/crawl files/public copy remain **not implemented** by this request; Search Console submission, indexing, HTTP verification and performance measurements remain **not verified**. See the [updated plan](../project/implementation-history.md) and [app site tree](../architecture/site-tree.md).

Public copy must say local browser storage and backups accurately: no account-based sync, no firearm-unloaded/aim verification, no perfect trigger/reset discrimination, no trademark or copyright-clearance claims, no unsupported iPhone vibration promise. Do not expose per-gun history or calibration data through indexable URLs.

## Official reference material

- [Google SEO Starter Guide](https://developers.google.com/search/docs/fundamentals/seo-starter-guide)
- [JavaScript SEO basics](https://developers.google.com/search/docs/crawling-indexing/javascript/javascript-seo-basics)
- [Title links](https://developers.google.com/search/docs/appearance/title-link) and [snippets](https://developers.google.com/search/docs/appearance/snippet)
- [Canonical URLs](https://developers.google.com/search/docs/crawling-indexing/consolidate-duplicate-urls)
- [Build and submit a sitemap](https://developers.google.com/search/docs/crawling-indexing/sitemaps/build-sitemap)
- [Software app structured data](https://developers.google.com/search/docs/appearance/structured-data/software-app)
- [Block indexing with noindex](https://developers.google.com/search/docs/crawling-indexing/block-indexing)
- [Search Console verification](https://support.google.com/webmasters/answer/9008080)

These are implementation references, not evidence that the current production URL has been indexed.
