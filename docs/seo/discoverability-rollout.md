# SEO audit remediation rollout

**Working branch:** `feature/seo-audit-scroll-fix`
**Base:** `main` at `d4f0026`; `b` has the same tree and is two merge commits behind. This worktree is isolated.
**Release rule:** finish and verify on this branch, release to `b`, bump the app version once for the completed feature, then merge `b` to `main` only with owner approval.

## Acceptance steps and tickets

| Step | Ticket | Acceptance | Status |
|---|---:|---|---|
| 1. Remove empty emphasis markup | [#44](https://github.com/matosaru/dryfire/issues/44) | No empty `<b>`/`<strong>` in crawlable public documents; route verification guards regressions. | Implemented; public-route verifier passes. |
| 2. Isolate non-active app screens from crawlers | [#45](https://github.com/matosaru/dryfire/issues/45) | Each app URL emits only its selected screen as ordinary markup; other screens remain inert in templates and restore before controllers start. | Implemented; unit tests and both-edition browser suites pass. |
| 3. Align Home metadata and copy | [#46](https://github.com/matosaru/dryfire/issues/46) | Root title, single H1 and visible copy describe browser dry-fire practice and include matching topic terms. | Implemented; all 14 public routes pass verification. |
| 4. Add image alternatives | [#48](https://github.com/matosaru/dryfire/issues/48) | Images declare suitable alternatives; decorative illustrations do not duplicate spoken labels. | Implemented; component and route tests pass. |
| 5. Enforce SEO/public-route invariants | [#49](https://github.com/matosaru/dryfire/issues/49) | Check metadata, H1s, headings, image alternatives, emphasis, active view, internal links, canonicals, sitemap, redirects and Worker responses. | Implemented; public and preview builds verify all 14 canonical routes. |
| 6. Resolve accessibility findings | [#50](https://github.com/matosaru/dryfire/issues/50) | Remove redundant tooltips; make flagged small labels readable; retain keyboard-accessible names and navigation. | Implemented; component tests and reviewed mobile captures pass. |
| 7. Add crawlable Home guide links | [#51](https://github.com/matosaru/dryfire/issues/51) | Home links contextually to public practice, sequence and calibration guides; link destinations are checked. | Implemented; Home test, route verifier and refreshed mobile capture pass. |
| 8. Final acceptance and release | [#47](https://github.com/matosaru/dryfire/issues/47) | Full checks green; version bumped once; release follows the branch/approval rule. | Local checks are green. PR/release to `b` is pending; current version is `0.8.10`. The release version bump and owner-approved `main` promotion follow the established `b` release gate. |

## Current verification record

- Full Jest coverage: **1,201 passed across 183 suites**; statement/branch/function/line coverage is 76.92% / 74.71% / 78.77% / 79.30%.
- Smoke: **16 passed**. Focused SEO routes: **25 passed**.
- Public browser suite: **107 passed, 5 skipped**. Preview browser suite: **82 passed, 5 skipped**. The updated Home screenshot was then regenerated and passed independently.
- Public and preview builds plus `verify:dist` pass. The local public-route verifier checks 14 canonical routes, sitemap/robots, metadata, links, redirects and local Worker responses.
- Typecheck, component/runtime lint, architecture and payload checks pass. The coverage ratchet passes.
- 26 mobile Chromium baselines were reviewed after refresh; the Home baseline was refreshed again for the contextual guide links.
- Documentation checks pass after guide GIF exports and source fingerprints were regenerated: `docs:check` verifies 14 functional screens, one shared dialog, 95 current captures and the SEO proposal.
- The public sitemap is generated and verified at `/sitemap.xml`; Search Console submission is an external action and is not verified here. Live site and Seobility could not be fetched from this environment (network proxy returned HTTP 403), so the deployed audit score needs a fresh external crawl after release.
- The external backlink score and social-profile findings are not code-only fixes. Backlinks require outreach; social links need the owner’s actual profiles. These remain outside this app change.
- No version bump, commit, push or deployment has been made. `b` and `main` are unchanged. Version remains `0.8.10` until release acceptance.

## Workflow

1. Complete code and unit coverage for tickets #44–#51.
2. Build public and preview editions; verify route metadata, content, links, sitemap, robots and redirects.
3. Run full unit, smoke, typecheck, lint, architecture, coverage, payload, docs and pinned browser checks; refresh only reviewed visual/media references.
4. Review accessibility and mobile captures, then record evidence in the tickets and this file.
5. Merge the verified feature to `b` after its PR checks pass; verify its deployment.
6. Bump the app version once for the completed feature on `b`, rerun release checks, then merge `b` to `main` only after owner approval. Confirm deployment and request a fresh external SEO crawl.
