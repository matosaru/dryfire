# Indexable routes and page metadata — CHG-061

Canonical origin: **https://easydryfire.com**. The owner configured `.app` permanent redirects. This routing correction is approved; candidate validation/publication is tracked in [history](../project/implementation-history.md). Dev is out of scope.

## Current contract

- `/` opens the actual trainer, with first-use gun setup or the selected gun's Home.
- Preserve the marketing introduction, routine, free promise and mode links inside `/about/` through reusable `MarketingOverview`; do not permanently delete them.
- Flat `/learn/`, `/drills/`, `/live-listen/`, `/history/`, `/settings/`, `/guns/`, `/gun-setup/` operational paths. No `/app` prefix.
- `/single-trigger-press/`, `/repeated-trigger-press/`, `/par-time-practice/`, `/trigger-control/` configure the four retained modes.
- `/rack-slide-trigger-pull/`, `/magazine-change-trigger-pull/`, `/draw-magazine-change-trigger-pull/` restore the exact named sequence on direct entry/refresh. Matching `-guide/` URLs read the actual shared manual screens.
- About, Contact, Help, mode directory, seven current manuals and two overview guides join the root in the 14-entry XML sitemap. Canonical initial content/metadata is generated at build time. Operational paths remain noindex; preview hosts remain noindex even for public content.
- Custom sequence IDs, gun names and saved results remain local. `/custom-sequence/` can restore only the selected gun's saved selected custom preset; missing context returns to Drills with an explanation. Legacy trigger-only remains compatible but is not public catalog/sitemap content.

[Complete generated URL inventory](routes.md) is authoritative for exact names, titles, redirects and static resources. [Requirements](../requirements/public-seo.md) and [screen tree](../architecture/site-tree.md) own behavior/layout coverage.

## Compatibility and storage

Known old `/app/*` and nested public manual URLs permanently redirect to flat equivalents, preserving query strings. `/welcome/` redirects to About. Ambiguous old sequence URLs resolve to Drills instead of guessing. Unknown routes remain404. Same-origin paths preserve IndexedDB; domain redirects cannot transfer separate-origin data. Schema, import/export, profile/capture/safety/save guards and invalid drafts remain unchanged. Refresh never starts a microphone.

## Acceptance and release

Validate HTTP, initial semantic content, metadata/JSON-LD, XML/robots, all links, favicon, no-JS informational pages, production-root flow, unique sequence cold-entry/refresh/history and installed/offline compatibility. Review changed About/public captures in pinned Chromium/WebKit, preserve unrelated visual references and actual guide/GIF parity. Pass unit/coverage, integration, both-edition artifacts and original payload/timing budgets before b publication; promote through a checked b→main PR only. Cloudflare setup belongs to the owner; report observed CI/build/deployment separately. Search Console submission and search-engine indexing are external follow-ups, not guaranteed by a sitemap.
