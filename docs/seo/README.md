# Public SEO and routing

CHG-060 ·2026-10-24. Repository implementation passed complete candidate acceptance40104091922 and is published on b; production promotion, live HTTP verification and crawler indexing are separate outcomes. [History](../project/implementation-history.md) records exact CI/publication status. The owner reports creating the public .app→.com301 redirect; this workspace cannot independently access those public domains.

[Complete generated URL inventory and indexing rules](routes.md) lists every public/app path, redirect, generated endpoint and static resource.

## Current implementation

`site/routes.js` owns11 public routes and canonical https://easydryfire.com. `tools/public-pages.mjs` prerenders useful content with unique initial title/description/canonical, Open Graph/Twitter metadata and factual JSON-LD. Public pages require no JS, profile, login or microphone. Existing manual content and opt-in silent GIF exports are reused. No invented price, rating, accuracy guarantee or cloud feature is published.

`workers/publicSite.js` serves the public landing at .com root, public route HTML, XML sitemap, robots and conventional favicon; unknown URLs return404. Operational /app/ paths are noindex and preserve guarded app history. The old Workers/nonproduction root still opens the app; nonproduction /welcome/ previews the landing with noindex. All other preview public responses are noindex. Private preview keeps its independent signed Access gate.

Public pages share the existing branding, BETA/header/footer/fixed navigation and Dark visual language. App chrome's default callback-driven behavior is unchanged; public chrome has real href links. The full route inventory and decisions are in [the route/metadata plan](indexable-routes-plan.md), [requirements](../requirements/public-seo.md) and [generated application sitemap](../architecture/application-sitemap.md).

## Deployment and indexing

- Owner promotes tested b to main and manages Cloudflare domains. No production merge is implied by a b push.
- One canonical host: .com. Matching .app redirects preserve path/query but do not transfer IndexedDB. [Redirect guide](../development/cloudflare-public-redirect.md) records owner-reported creation and independent verification limits.
- New installs start at /app/ with the existing manifest id/scope. Same-origin path changes preserve local data. Existing cached/installed clients and old-origin data need deliberate verification/export/import; no automatic cross-origin migration exists.
- Real public pages return200; personal app states are noindex and excluded from sitemap. Noindex is not an authentication mechanism. Only the actual supported public route registry enters XML; lastmod is omitted rather than fabricated from every build.
- After production deployment, verify actual HTML/headers/redirects/robots/sitemap and Search Console ownership, submit https://easydryfire.com/sitemap.xml and inspect representative URLs. Neither valid metadata nor a sitemap guarantees indexing, rankings or rich results.

## Verification and reference templates

`verify:dist` runs tools/verify-public-site.mjs against the built HTML/assets and local Worker handler: unique metadata, JSON-LD, links, index/noindex policies, XML/robots,404 behavior, operational responses and ICO availability/type. Browser tests cover public reading without JS and operational deep links/refresh/drafts/Back/Forward. Existing both-edition/browser visual and original performance gates remain required.

[head.html](templates/head.html), [SoftwareApplication reference](templates/webapplication.json), [robots reference](templates/robots.txt) and [sitemap reference](templates/sitemap.xml) document generated output; the build generator/registry own runtime output. Older [public copy](public-copy.md) and commercial topology proposals remain historical research, not authority to publish unimplemented paid/account/cloud routes.

[Shared public designs](../design/screens/public-site/README.md) · [Deployment](../development/DEPLOY.md) · [Architecture](../architecture/README.md)

## Planned public topology — CHG-026

Historical proposal reference retained for existing approval links. Earlier split-domain marketing/app and commercial routes were proposals, not implemented commitments. CHG-060 supersedes the public topology with one canonical .com origin,11 actual public pages and noindex operational /app/ paths. Pricing, accounts, cloud/billing and legal-page drafts remain outside this implementation.
