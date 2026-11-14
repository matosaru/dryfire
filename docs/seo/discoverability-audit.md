# Search discoverability audit and rollout

**Status:** analysis and proposed SEO work; no application behavior or public branch changed.  
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
| P1 | Existing public copy is inconsistent and some planning copy is stale | `docs/seo/public-copy.md` labels its proposed copy “not currently rendered,” although `MarketingOverview` is rendered on About. That draft also mentions removed Reload/Free modes and five guns while the public edition currently describes four trigger modes and a two-gun limit. This risks incorrect search snippets and content decisions. |
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
