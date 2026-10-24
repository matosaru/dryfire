# Indexable routes and page metadata — Free product

Requested 2026-10-24, before the proposed modularization plan. **Implemented; complete candidate acceptance passed in run40083935270. b publication is being finalized; owner controls production promotion.** Review/work on b only. The owner handles production promotion/domain configuration. Canonical host confirmed by the owner: https://easydryfire.com. easydryfire.app redirects to the matching .com path. Existing libraries on other origins must remain recoverable.

## Findings before CHG-060

- The application sitemap at docs/architecture/application-sitemap.md is generated documentation, not a deployed search-engine XML sitemap.
- screenNavigation.js uses pushState/replaceState without a URL argument. Screen states share `/`; index.html has one title/description. Public about/contact/help/practice guides are not independent public HTTP resources today.
- robots.txt and sitemap.xml exist only under docs/seo/templates and are not copied into public output. Canonical, social metadata and JSON-LD remain draft templates rather than current application metadata.
- The root could be crawled/indexed subject to actual production responses and crawler decisions. Source inspection does not establish whether it is indexed; a sitemap never guarantees indexing.
- Existing SEO drafts are stale in places (six-mode wording and graph availability); validate all copy against the four current trigger modes and actual public edition before publishing.

## Intended public route inventory

The implementation uses these readable, lowercase, hyphenated routes with a consistent trailing slash. They are public HTML resources, separate from operational app screen IDs. Final canonical URLs use https://easydryfire.com; never use .app or preview hostnames in canonical metadata.

| Path | Public content | Proposed title |
| --- | --- | --- |
| `/` | Product landing page, current Free capabilities, useful explanation, Open app action | Dry Fire With Ease — Free Dry-Fire Practice App |
| `/practice/` | Four trigger modes and how to choose; links to individual manuals | Dry-Fire Practice Modes — Dry Fire With Ease |
| `/practice/single-trigger-press/` | Public short manual and silent example | Single Trigger Press Practice — Dry Fire With Ease |
| `/practice/repeated-trigger-press/` | Public short manual and silent example | Repeated Trigger Press Practice — Dry Fire With Ease |
| `/practice/par-time/` | Public short manual and silent example | Par-Time Practice — Dry Fire With Ease |
| `/practice/trigger-control/` | Public manual; explain timing consistency and microphone limitations | Trigger Control Practice — Dry Fire With Ease |
| `/guides/sequence-drills/` | Current built-in sequences, required calibration and limitations | Sequence Drills Guide — Dry Fire With Ease |
| `/guides/trigger-click-calibration/` | Accurate calibration/setup instructions and troubleshooting | Trigger-Click Calibration — Dry Fire With Ease |
| `/help/` | Browser/microphone/install/start-signal help | Help and Browser Setup — Dry Fire With Ease |
| `/about/` | Public product/Beta/about copy | About — Dry Fire With Ease |
| `/contact/` | Public email support, easydryfire@gmail.com | Contact — Dry Fire With Ease |

Publish only complete useful pages. No empty keyword pages, paid features, unverified accuracy claims, prices, ratings, affiliations or promised cloud/native functionality. Privacy/terms public routes need accurate reviewed content before being included; do not invent trader details or publish placeholders.

## Readable operational app URLs

Proposed app paths include `/app/`, `/app/learn/`, `/app/drills/`, `/app/live-listen/`, `/app/history/` and `/app/settings/`. A selected practice can use `/app/practice/single-trigger-press/` and corresponding supported-mode slugs. These are app destinations, not separate SEO landing pages.

- Exclude operational/personal app pages, saved sessions, gun profiles, backups and private test states from the XML sitemap. Serve app responses with explicit noindex metadata/header; public editorial pages remain indexable.
- Never prerender personal gun names, calibration, results or other local user data into public HTML/metadata. Do not put personal gun names or session data in URLs.
- noindex/robots is not authentication or authorization. Keep existing independent private-feature/security boundaries.
- Preserve active-gun/training/safety/save/capture guards, Back/Forward, invalid drafts and startup behavior. A direct app URL cannot start capture automatically or bypass prerequisites.
- Public information must be readable without stored guns, training, login, microphone permission or JavaScript. It must not redirect first-time visitors to gun setup.

## Technical approach

Keep Vite and the current shared React presentation. Generate static/prerendered HTML for public routes at build time, with the actual useful body and head for each route. An eager whole-app React root, new SSR framework or heavier startup bundle is unnecessary for this scope.

Use one public route/content registry to drive public HTML generation, links, per-page metadata, canonical URLs and the deployed XML sitemap. Keep it separate from the existing operational screen registry, with explicit links between public manuals and app launch destinations. Reuse guide copy/models/examples with in-app manuals instead of maintaining a separate inconsistent manual. Use shared design components; public reading cannot depend on personal app context.

The app's existing navigation service can map supported screen states to stable app paths while retaining all serialized transitions/guards. Resolve deep links on initial load and refresh. Keep route context and personal selection in existing validated state rather than inventing public URLs for records. Define known legacy root entry and installed-PWA behavior before changing start URLs.

## Per-page metadata and serving rules

- Unique factual title and description in the initial HTML; one self-canonical URL per public page. Do not canonicalize all distinct manuals to `/`.
- Open Graph/Twitter title, description and valid image; use real asset URLs and reserve dimensions.
- Semantic heading structure, useful visible content and ordinary crawlable `<a href>` links to public pages. In-app state buttons alone are not the public discovery strategy.
- Appropriate factual WebSite/SoftwareApplication/WebPage/BreadcrumbList structured data where applicable, matching visible content. Structured data does not guarantee a rich result.
- `/sitemap.xml`: absolute canonical HTTPS public URLs only, valid XML/content type. Use truthful lastmod only when maintained from content changes, not every build timestamp.
- `/robots.txt`: production sitemap location and intended crawling policy. Do not disallow a URL and assume a crawler will still see its noindex directive. Private access is enforced independently.
- One canonical host; deliberate redirects from alias hosts and URL variants. Known public pages return200, real redirects use appropriate301/308 responses and unknown paths return404 instead of the app shell with200.
- All nonproduction previews have noindex, including b even when using the public feature edition. Production-indexability and Free/Full feature edition are separate configuration concerns. Avoid accidentally shipping preview noindex to production.
- Preserve minification, payload limits, service-worker behavior, manifest/start URL compatibility, cache updates and offline app workflows. Test real edge responses rather than relying only on a Vite development server.

## Domain and saved-data decision

The owner explicitly chose https://easydryfire.com for the complete public site and app navigation, with easydryfire.app redirecting to .com. No split marketing/app origins are planned. All canonical, social URL and public sitemap entries use .com.

- Redirect HTTPS .app paths to matching HTTPS .com paths with a permanent301/308 response, not a JavaScript-only redirect. Preserve ordinary path/query meaning and avoid multi-hop chains; never add personal app data to the URL. Unknown target paths still produce a real404.
- Normalize HTTP/HTTPS and any configured www alias to the selected bare HTTPS .com host. Preserve valid deep links instead of sending every path to the homepage.
- Do not redirect b previews to production; keep their independent testing access and noindex policy.
- The existing Workers-origin app is a legacy-data recovery entry until its users can export/restore. Do not silently apply the .app alias policy to that old origin.
- Before enabling .app redirects, establish whether it already has saved user libraries; if so, provide a recovery/export window or other explicitly specified handover. Cross-origin IndexedDB cannot simply be read from .com.
- Cloudflare host bindings/edge redirect configuration remain owner-managed. Repository preparation/CI and actual live redirect verification are separate deliverables.

Existing user storage is origin-scoped: moving from workers.dev to either custom domain does not automatically transfer IndexedDB. Paths on the same origin do not by themselves change IndexedDB ownership, but changing manifest start URLs/service-worker scope still requires compatibility testing. Provide an explicit backup/export/restore or other approved migration approach before moving existing users. Do not silently redirect away from access to an old library without a recovery path. Keep the existing app entry usable during migration.

## SEO phase before structural refactoring

1. **S1 — Confirm routing/domain/content contracts.** Use the confirmed .com canonical/.app redirect policy; specify legacy-data/installed-PWA compatibility, public versus operational inventory and factual copy/design. Record approved route names and metadata; no new routes are claimed as implemented yet.
2. **S2 — Implement public rendering and metadata.** Build-time public pages, shared guides, real internal links, metadata registry, deployed sitemap/robots, correct status/content-type behavior and preview noindex.
3. **S3 — Add compatible app deep links.** Preserve guards/drafts/Back/Forward, anonymous reading, noindex operational responses and existing data/offline/installed-app access. Keep URL state and screen state consistent.
4. **S4 — Complete acceptance and production handoff.** Full existing application gates plus SEO tests, owner-reviewed public-page visuals and edge HTTP verification. Owner promotes to main/configures production host and Search Console. Record actual results, not assumed indexing.

Then refresh the approved baseline for intentional public-page/routing additions and begin the separate structural F1–F7 plan. Do not combine SEO redesign with unrelated persistence/engine refactoring or accept unrelated visual/performance regressions as SEO changes.

## Verification

- Request every public URL directly with JavaScript disabled: correct200 response, unique initial title/description/canonical and meaningful content; no gun setup or microphone requirement.
- Parse deployed HTML, JSON-LD, XML and robots files; verify sitemap URLs, internal links, images, redirect chains, trailing-slash behavior, canonical hosts and unknown404 responses.
- Verify public pages indexable, app pages noindex, previews noindex and no personal data in generated HTML/metadata. Review actual headers on target production/preview hosts.
- Exercise deep links/refresh, Back/Forward, invalid configuration drafts, active capture/unsaved-result guards, legacy entry, offline service worker and installed-PWA behavior.
- Run existing unit/coverage/integration, both-edition minified build/artifact/payload, pinned browser/visual and original performance gates. Add focused route/metadata tests with useful failures for missing or duplicate canonical/title and incorrect status/indexing rules.
- Update requirements/designs, route/screen maps, documentation sitemap/tree and component ownership evidence. Separate intentional new page references from unchanged existing screens.
- After owner production deployment: verify the chosen Search Console property, submit the real sitemap, inspect representative pages and monitor coverage/crawl errors. Sitemap submission and indexing are separate outcomes; no ranking/indexing guarantee.

## Status

CHG-060 implements all11public HTML pages, metadata/crawl files, readable operational app paths and the favicon fix. Complete candidate acceptance passed all8jobs in [run40083935270](https://github.com/matosaru/dryfire/actions/runs/40083935270), including1037unit tests/150suites, coverage, both-edition browser screenshots and original performance gates. Intentional new public references are separate from398unchanged app references. Application data schema/engines remain unchanged. b publication is being finalized; owner production promotion, live HTTP checks and Search Console/indexing are separate checkpoints. The owner-reported redirect and live domain responses remain independently unverified.

[Current architecture sitemap](../architecture/application-sitemap.md) · [Existing SEO research](README.md) · [Structural follow-up](../project/react-refactor/follow-up-plan.md)
