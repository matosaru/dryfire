# SEO and accessibility rollout plan

**Working branch:** `feature/seo-discoverability-release`
**Release path:** feature branch → `b` → `main` after verification  
**Scope:** public discoverability and the accessibility findings in the owner-provided Seobility screenshots. Keep `/` as the usable app homepage. Do not include the separate monetization feature.

## Workflow and status

| Step | Work | Status | Acceptance evidence |
| --- | --- | --- | --- |
| 1. Baseline and triage | Review Seobility screenshots, route source, generated pages, accessible labels, image alternatives and existing checks. Classify vendor warnings as code defects, product decisions or off-site work. | Done | `docs/seo/discoverability-audit.md` records evidence and cautions against score chasing. |
| 2. Fix technical delivery | Link the existing favicon from the app entry document. Send UTF-8 charset on successful HTML responses. Preserve canonical URLs, route redirects, crawler directives and hashed-asset caching. | Done | Public-site tests and built-output verification. |
| 3. Fix reported accessibility issues | Remove redundant `title` text when icon controls already have accessible names; make footer copy readable; assert both at component/browser-test level. | Done | BrandHeader unit test and page-layout visual assertions. |
| 4. Make the public product page crawlable | Serve `/about/` as a focused static public page rather than the full app shell with hidden screens. Use a descriptive, accurate title, H1 and description. Keep the app at `/`. | Done | Route metadata tests and public HTML checks. |
| 5. Verify and refresh visual evidence | Run unit, SEO/public-route, build, docs, public-site and mobile Chromium visual checks. Refresh only baselines changed by the accepted UI/accessibility or public-page changes. Use the pinned Playwright browser version. | Done | 1,196/1,196 unit tests across 182 suites; 16/16 smoke tests; Chromium 105 passed / 5 skipped and WebKit 70 passed / 33 skipped (175 browser checks passed, 38 skipped total). Typecheck, component/runtime lint, build, public-site verification, documentation checks, payload budget and Wrangler dry-run pass. Visual baselines were reviewed on the current `b` source; animated guide examples were regenerated from the same live components. |
| 6. Release candidate | Review final diff and version policy, bump the app version once for the completed feature, commit and push the SEO branch. | In progress | Version is `0.8.10` (one patch above current `b`); verified source changes, reviewed mobile screenshot baselines, and refreshed practice-guide GIFs are included in the reviewed release candidate. The feature is based directly on the latest `origin/b` and contains no monetization changes. PR #42 is open; it must be updated after rebase and pass branch CI. |
| 7. Promote to `b` | Merge/cherry-pick only SEO feature changes onto `b`, run the full required CI checks there, and confirm the preview deployment. | Pending | `b` checks green and preview serves new HTML/headers. |
| 8. Promote to `main` | After `b` is verified, promote the same SEO changes to `main`, run production CI and confirm production deployment. | Pending | `main` checks green; production canonical routes, HTML charset and favicon respond correctly. |
| 9. Measure indexing | Submit/inspect sitemap and indexing in Search Console; re-run Seobility on the deployed canonical pages; compare issue-level findings. | Owner follow-up | Search Console and live audit evidence; do not infer ranking gains from a tool score. |

## Release gates

Before committing or promoting, run:

1. `npm test -- --runInBand`
2. `npm run test:smoke`
3. `npm run typecheck`
4. `npm run build`
5. `node tools/verify-public-site.mjs`
6. `npm run docs:check`
7. `npm run test:visual:docker` (pinned Chromium; update snapshots only when the visual change is intentional and reviewed)
8. The repository's CI checks for build, screenshots, performance and deployment profile.

No branch promotion occurs until the checks applicable to that branch are green. Report test status, branch SHAs and deployment status separately.

## Findings intentionally not “fixed” by code changes

- Decorative images keep `alt=""`; this is correct accessibility behavior. Add descriptions only for informative images whose meaning is not already given by adjacent text.
- Backlinks require relevant, genuine references from other sites. Do not add unrelated outbound links or buy links to silence a checker.
- Social share buttons are optional. Existing accurate share metadata is retained; an editorial 1200×630 share card can be a separate design task.
- The root app includes many screens and repeated interface labels. Do not hide the app from search or alter the homepage contract solely to improve a vendor's word-count/heading score. Review Search Console data before deciding whether the app document needs a separate crawler strategy.
- Seobility's score and severity labels are vendor-specific. Acceptance is based on specific defects, crawlability and user accessibility, not a target score.

## Manual post-release checklist

- Fetch `https://easydryfire.com/`, `/about/`, `/favicon.ico`, `/robots.txt` and `/sitemap.xml`; confirm status, canonical tags and `Content-Type` values.
- Confirm `.app` permanent redirect continues to `.com` and that public routes keep their paths.
- In Search Console, submit `/sitemap.xml`, inspect `/` and `/about/`, and review coverage after recrawl.
- Re-run the external audit on `/about/` and `/` separately; compare each issue rather than only the aggregate percentage.
