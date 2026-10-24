# Public SEO and routing

CHG-061 corrects the homepage/URL contract after CHG-060. [History](../project/implementation-history.md) distinguishes approval, checks, push, merge and observed deployment. The owner reports `.app` → `.com` permanent redirects; public-origin HTTP access remains blocked by this workspace's proxy before origin.

The [complete generated URL inventory](routes.md) lists every canonical/app path, redirect and static resource. `site/routes.js` owns14 canonical pages at https://easydryfire.com; `src/appPaths.js` owns flat app/guide identities. Root `/` is the actual trainer; marketing remains reusable content inside About. Seven public manuals and About/Contact prerender actual shared app screens. Informational content is readable without JavaScript/profile/microphone; the trainer needs JavaScript. Static Help/directory/overview pages share app chrome.

Initial public HTML has unique title, description, canonical, Open Graph/Twitter metadata and factual JSON-LD. No invented prices, ratings or recognition guarantees. `workers/publicSite.js` handles routes, permanent legacy redirects,404/405, XML/robots and favicon. Operational paths are noindex, previews remain noindex, private Full still requires signed Access authentication. No private names, custom IDs or saved records enter URLs, metadata or the XML sitemap.

## Release and indexing

- Complete candidate acceptance precedes application publication on b and a checked b→main PR. Dev remains untouched. Cloudflare domain configuration is owner-managed; do not equate code publication with observed deployment.
- Manifest id/scope/start remain `/`. Same-origin URL changes keep IndexedDB. Domain redirects do not transfer separately stored libraries; retain manual export/import.
- Verify live HTML/headers, old redirects, robots/sitemap and favicon after deployment. Submit `https://easydryfire.com/sitemap.xml` in Search Console and inspect representative canonical URLs. Metadata and a valid sitemap do not guarantee indexing/rankings.
- `verify:dist` checks built initial metadata/content, all links, flat routes, HTTP policies, legacy redirects, XML/robots and ICO. Browser checks cover actual app root, unique sequence cold entry/refresh/history, no-JS informational content, guide/source invalid drafts and local data.
- Maintain [requirements](../requirements/public-seo.md), [routing plan](indexable-routes-plan.md), [screen tree](../architecture/site-tree.md), approved screenshots and actual guide/GIF parity. Original performance/payload and pinned both-browser/both-edition acceptance apply.

## Planned public topology — CHG-026

Historical commercial/marketing topology was a proposal. CHG-061 supersedes its root-page and `/app` assumptions: the trainer opens at `/`, marketing remains in About, and [the current generated inventory](routes.md) defines implemented routes. Monetization/account/cloud work remains deferred.
