# Search discoverability audit and rollout

**Status:** SEO and accessibility implementation verified locally on `feature/seo-discoverability`; release to `b` and `main` is pending branch CI and promotion.
**Scope:** canonical public site `https://easydryfire.com`; private/operational application paths stay out of search.  
**Source review:** `site/routes.js`, `workers/publicSite.js`, `tools/public-pages.mjs`, `PublicPage`, `MarketingOverview`, SEO requirements and route inventory.  
**Live verification:** not completed. This workspace's network policy blocks requests to `easydryfire.com`; no Search Console property or indexing report was available. Findings below distinguish source facts from things to verify after deployment.

## Summary

The technical SEO foundation is already in place. The site has 14 canonical public pages, prerendered informational content, unique titles/descriptions/canonicals/social metadata, factual JSON-LD, a generated sitemap and robots file, legacy redirects, 404 handling, and noindex treatment for operational routes and previews. Automated source checks cover sitemap membership, metadata, links, robots, redirects and static output.

The most valuable next work is to make the public content target clear search needs and then measure real impressions and clicks. Technical metadata alone will not establish demand, indexing or rankings. Do not create more thin URLs merely to increase the sitemap count.

## Findings

| Priority | Finding | Evidence and impact |
| --- | --- | --- |
| P0 | Production indexing and canonical behavior have not been observed | The source config says `.com` is canonical and `.app` redirects, but this workspace could not fetch either domain. Search Console coverage and sitemap processing are unknown. A valid local sitemap does not prove Google can fetch or index it. |
| P1 | The best product explanation is on `/about/`, but its search title and H1 are generic | `site/routes.js` uses title `About — Dry Fire With Ease` and heading `About`. `MarketingOverview` contains the useful explanation and mode links, but the page's main heading does not describe the product or search intent. `/` must remain the app as already specified. |
| P1 | There is no evidenced keyword/query map | Routes describe practice modes and calibration, but no search-query or Search Console data was found. We should avoid guessing volume or building pages around unsupported demand. |
| P1 | SEO copy must stay aligned with the generated About page | Resolved in this branch: `/about/` now has a product-specific title, H1 and description, and `docs/seo/public-copy.md` records the exact rendered search copy and current public-edition limits. |
| P2 | Current pages may be too short for broad informational queries | The mode and calibration pages are useful task guides, but their content is intentionally concise. Improve only where Search Console queries or user questions show an unmet need; preserve accurate limitations and safety language. |
| P2 | Share preview imagery is a generic square app icon | `tools/public-pages.mjs` uses `/icon-512.png` for Open Graph and Twitter cards. A purpose-designed 1200×630 brand card could improve link previews and sharing; it is a social-click-through improvement, not a direct ranking signal. |
| P2 | Search success measurement is not documented as an operating routine | The docs mention submitting the sitemap but do not define a repeatable review of indexed pages, query impressions, clicks, CTR or landing-page performance. |
| Maintain | Technical route/crawl controls are already good | `PUBLIC_ROUTES` is the single public route source; sitemap and robots are generated from it. The Worker redirects legacy and slashless routes, keeps app paths out of the sitemap and marks them noindex. Informational pages are prerendered, so they do not depend on microphone permission or user records. |

## Recommended page and content strategy

Keep `/` as the functional app. Treat `/about/` as the public product overview and strengthen its metadata and visible heading without creating a duplicate marketing homepage. Retain `/practice-modes/` as the comparison hub and the existing guide URLs as focused supporting pages.

The content should explain, in plain language:

- What the app measures: timing of microphone-detected trigger clicks and selected mechanical events.
- How to calibrate a trigger sound, prepare the phone and interpret false/missed detections.
- Which practice mode fits which goal, with links to the corresponding guide and setup.
- Browser microphone requirements, current local-storage behavior and exportable backups.
- Safety limits: timing describes audio; the microphone does not verify an unloaded firearm, aim or physical technique.

Use exact search terms naturally after query evidence is available. Candidate topic themes to investigate include “dry-fire practice app,” “dry-fire timer,” “trigger click timer,” “dry-fire practice drills,” and “dry-fire microphone calibration.” These are hypotheses, not researched volumes or promises of ranking.

## Rollout plan

### Stage 1 — Establish a live baseline

1. Verify that the production Google Search Console Domain property covers `easydryfire.com` and its subdomains. Add/verify the preferred HTTPS `.com` property if needed.
2. Submit `https://easydryfire.com/sitemap.xml`; record discovered/indexed counts and any fetch, canonical or redirect errors.
3. Inspect `/`, `/about/`, `/practice-modes/`, `/trigger-click-calibration-guide/` and one practice guide. Confirm rendered title, canonical, indexability and selected Google canonical.
4. Review the last 3 months of Search Console queries and page metrics; save the baseline before changing content. Check Bing Webmaster Tools and sitemap processing as a secondary source.
5. Verify `.app`→`.com`, `www`→`.com`, robots, sitemap and representative 404/noindex behavior in a real browser or HTTP checker after production deployment.

### Stage 2 — Fix copy accuracy and improve the product overview

1. Replace `/about/`'s generic title, description and H1 with an accurate product-focused formulation. Proposed starting point: **“Dry Fire With Ease: Browser Dry-Fire Practice Timer”** and **“Practice trigger-click timing in your browser. Learn your firearm’s sound, choose a structured practice mode, and review detected results.”** Keep “Beta” visible in page copy, describe microphone limitations, and avoid claiming guaranteed recognition.
2. Keep `/` routed to the app. Do not duplicate the full About copy on the home page. Consider only a small, static, semantic description/link block if evidence shows crawlers or users cannot discover the product overview from `/`.
3. Correct `docs/seo/public-copy.md` to match shipped content and the current free edition; remove removed modes, five-gun statements and “not rendered” wording. Keep public claims in sync with actual app capabilities.
4. Add contextual internal links between About, practice-mode hub, focused guides, Help and Contact using descriptive anchor text.

### Stage 3 — Improve useful coverage from measured queries

1. Group actual Search Console queries by intent: choosing a practice mode, calibrating recognition, browser/device setup, timing interpretation and safety limitations.
2. Expand the existing page that best answers each intent before creating a new URL. Use examples, limitations, clear steps and relevant app links; do not repeat nearly identical text across pages.
3. Add a new indexable page only when it answers a distinct, evidenced question and can be maintained. Keep account, settings, gun names, saved sessions and private previews out of public URLs and search.
4. Consider localization only after choosing supported languages and committing to accurate translated app/help content and `hreflang` maintenance. Do not add machine-translated thin pages.

### Stage 4 — Sharing and continuous measurement

1. Design a branded 1200×630 Open Graph image; verify readable crop and contrast at small preview sizes.
2. Track monthly Search Console clicks, impressions, CTR, average position, indexed pages and non-branded query share. Compare page-level trends, not one-day ranking changes.
3. Use Core Web Vitals field data and Lighthouse as diagnostics. Preserve existing JS/CSS compression and performance budgets; do not trade the working app startup for SEO markup.
4. Review public content whenever features, storage promises, free limits or Beta status change. SEO metadata and copy must reflect the current public edition, not the full preview.

## Acceptance criteria for implementation

- Canonical public routes, sitemap membership, preview noindex and operational noindex remain correct.
- About title, description, H1 and visible copy accurately describe the current public app and Beta status; no stale paid/full-preview capabilities are advertised.
- Each existing indexable page retains one descriptive H1, useful initial HTML, unique metadata, valid canonical and a clear next step.
- Internal links work, accessibility is preserved, and structured data contains only verifiable claims. Do not add ratings, prices, legal-company details or app-store availability without evidence.
- SEO changes have automated checks for page metadata/content, canonical/sitemap consistency, robots policy, link validity and any social-card asset dimensions. Run existing visual/performance acceptance before publishing implementation.
- Report local checks, branch push, merge, Cloudflare deployment and Search Console observations as separate outcomes.

## Limits of this audit

This is a source and documentation audit, not a guarantee of rankings or legal review. Search volume, competitor positions, current indexing, redirects and live response headers could not be independently verified from this environment. Search Console query data and a live post-deployment check are the evidence needed to choose content priorities confidently.

## Seobility mobile report — owner-provided screenshots, 2026-11-14

The report shows an on-page score of **66%**, metadata **97%**, page quality **36%**, page structure **57%**, links **66%**, server **100%**, and external factors **3%**. Its visible findings are useful diagnostics, but not every tool recommendation should be followed literally.

### Source-confirmed opportunities

- **Favicon link was missing from the root app document.** Fixed in this SEO branch: `index.html` now declares the existing `/favicon.ico`; informational pages already linked it.
- **Root page title and H1 do not align.** The production route title is “Dry Fire With Ease — Free Dry-Fire Practice App”; the root app's branded H1 is only “Dry Fire With Ease.” The `/about/` route is also titled and headed only “About,” despite containing the product overview. Improve the About page's title/H1/description as the product-focused search landing content while keeping `/` as the app.
- **The root app document contains multiple app screens.** The app's shared initial document contains view templates for many screens, including hidden views and repeated interface labels. A crawler audit can count this as about 1,665 words, 53 headings and duplicate phrases even though these are not a deliberate long-form homepage. Decide whether to keep `/` indexable with a cleaner crawler-facing document or make `/about/` the primary indexable product page while `/` remains usable as the app. Preserve the existing UX and performance budgets in either solution.
- **The server report says the charset is absent from the HTTP header.** Fixed in this SEO branch: successful public/app HTML responses now explicitly set `Content-Type: text/html; charset=utf-8`; the Worker and built-site checks assert it. The deployed response still needs a post-release check.
- **Internal-link count is low for the root page.** Much of the counted root content is application UI, not editorial navigation. Improve contextual links on `/about/` and `/practice-modes/` to the guides and Help instead of adding filler links to the trainer.
- **The About page is the better candidate to resolve title/H1/content mismatches.** It already contains the marketing introduction and current product facts, but its generic page name makes the product intent less clear to a crawler and searcher.

### Recommendations to treat carefully

- **Empty `alt` values are not automatically defects.** Several app images are decorative (brand mark and gun-type art adjacent to visible labels) and correctly use `alt=""`. Keep empty alt for decorative images; add meaningful alt only to informative images. Inspect Seobility's five image URLs before changing them.
- **Do not inflate word count or heading count.** The 53-heading/duplicate-text result likely reflects app templates and repeated controls in the root document. Add headings only where they organize real public explanatory content.
- **No external links and few backlinks:** adding unrelated external links will not improve relevance. Backlinks require legitimate mentions from useful resources or communities; avoid paid/spam links. This is a long-term outreach/content task, not a source-code fix.
- **Social sharing warning:** social buttons are optional and not a direct ranking factor. A well-designed Open Graph image and accurate share metadata are higher value and already partly implemented.
- **Score and “critical” labels are vendor-specific.** Use the concrete finding and business impact rather than targeting 100% Seobility score.

### Accessibility fixes included in this feature

- Removed redundant `title` attributes from the About, Contact and Settings icon controls. Their accessible names remain provided by `aria-label`, and the existing visible focus/hover tooltip remains available.
- Increased the shared footer text from 0.68rem to 0.8rem (12.8px at the default 16px root size) so the privacy notice and copyright are easier to read. The relative unit still respects browser text zoom.
- Added component and browser assertions that icon controls have no redundant title and footer text remains at least 12px. Refreshed the 26 mobile Chromium page captures; visual suite passes against those captures.

### Implementation status from this report

1. **Implemented on the feature branch:** add the root favicon declaration, set/verify UTF-8 HTML response headers, remove redundant icon `title` attributes, enlarge footer copy, add targeted checks and refresh mobile page screenshots.
2. **Implemented on the feature branch:** make `/about/` a static crawlable product page with descriptive title, H1 and description; `/` remains the app.
3. **Deferred pending search evidence:** consider crawler treatment for app templates at `/`. Do not change the homepage or noindex it solely for a vendor score.
4. Existing descriptive cross-links among About, practice modes, mode guides, calibration and Help are retained; add new links only when they help users.
5. **Post-release owner follow-up:** re-run Seobility and inspect Search Console. Use issue-level results and actual queries to set content/backlink priorities; a higher audit score alone does not establish better organic discovery.
