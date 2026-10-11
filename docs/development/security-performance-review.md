# Security and performance review

CHG-026 · initial read-only review · 2026-10-11 · baseline dev `d1754d81a891435ef4e42de976f185ec8b3f26bf`. Findings are preparation for focused fixes, not a completed penetration test or a claim that the deployed site was inspected.

## Observed dependency results

| Command | Result |
| --- | --- |
| `npm audit --omit=dev --json` | 0 known production dependency vulnerabilities |
| `npm audit --json` | 22 moderate affected package entries; 0 high/critical; two root advisories, with transitive propagation |

The two root advisories are [sprintf-js precision denial of service](https://github.com/advisories/GHSA-hp3w-g68c-fv3c) (`<=1.1.3`, through the Jest/configuration chain) and [uuid buffer bounds checks](https://github.com/advisories/GHSA-w5hq-g745-h8pq) (`<11.1.1`, through xcode/Capacitor CLI). These are development dependencies, not 22 independent production flaws. Runtime exploitability was not established; evaluate actual call paths and supported upstream fixes. The audit reports no direct automatic fix for the root entries. Do not use force-upgrades, unsafe overrides or remove native dependencies merely to make the count green. Native release is deferred, while existing reproducible builds/tests still matter.

Repeat both audits against the committed lockfile when fixing dependencies, capture the upstream version/compatibility decision and run baseline/final source/build checks. Zero advisory results would still not establish application security.

## Source findings and prioritized work

| ID | Observation | Classification and next work |
| --- | --- | --- |
| REVIEW-01 | Development dependency advisories above | Triage before adding privileged backend/deployment work; update supported dependencies or document reachability/mitigation with an owner decision |
| REVIEW-02 | `public/_headers` sets nosniff and no-referrer but no CSP, frame protection or Permissions-Policy | Defense-in-depth gap. Design/test CSP for modules, styles, worklets and future auth; prevent unwanted framing and limit mic/camera to required origins. Verify actual deployed headers; source files do not prove HTTP settings |
| REVIEW-03 | `workers/sw.js` uses cache-first same-origin GET with `ignoreSearch: true` and can cache successful document responses | Before auth/billing: explicitly bypass API, login/callback, checkout/account, signed URLs and all personalized responses. Cache only approved public static assets; no-store private responses and prove account changes/logout cannot expose old responses. No authenticated route exists today, so this is a future integration blocker, not an observed account-data leak |
| REVIEW-04 | `src/main.js` rejects imported files over 10 MB, while `src/storage.js` exports all saved sessions; saved sessions have no automatic cap | Source-level recovery risk: a sufficiently large valid library can produce an export the UI refuses to restore. Reproduce with realistic large data before selecting chunked/streamed recovery or explicit supported limits; preserve sessions rather than silently trimming them |
| REVIEW-05 | Backup validation checks formats/owners/IDs/features and validates all records before atomic replacement; UI uses textContent/DOM construction, with no innerHTML/eval/new Function found in the reviewed source search | Existing protections to retain. Expand adversarial tests for extreme depth/array lengths, malformed shared presets and future API payload quotas; enforce limits server-side as well. Search results are not an exhaustive XSS/prototype-pollution assessment |
| REVIEW-06 | `getSessions()` loads all owned sessions and progress/history derives views from them | Large-history performance candidate. Measure large fixtures, then page history and compute/cache aggregates where useful; keep exact statistics and complete exportable records |
| REVIEW-07 | `classify()` recalculates training normalization and leave-one-out distances per candidate; `recognizeRecording()` evaluates multiple candidate windows | Audio hot-path candidate. Profile actual device latency before optimizing; consider a revision-keyed prepared model and invalidate on gun/training/calibration/enabled-label changes. Preserve classification and captured-onset timing through regression fixtures |
| REVIEW-08 | Vite already minifies/tree-shakes JS/CSS and both workers, with sourcemaps disabled | Preserve this verified build. Prior minifier comparisons did not justify a replacement; measure transfer/compression and caching over real production HTTPS before claiming further savings |

No application code, lockfile, header or data-format fix is made by this planning change. Authentication, authorization and payment attacks cannot be fully assessed before those services exist.

## Measurement and acceptance

Use the current [device checklist](IPHONE_RELEASE_CHECKS.md) and [accuracy protocol](ACCURACY_TESTING.md). Record environment/source, representative small and large histories, slow-network cold/warm load, memory, p50/p95 time to interactive, audio event-delivery/recognition latency and rendered history/chart time. Add a budget only after a baseline is observed; do not invent benchmark improvements.

Before code changes, run the required install/source/build baseline in [AGENTS.md](AGENTS.md); add meaningful regressions for a reproduced issue before fixing it. Validate saved-data migration/recovery, then rerun affected source/smoke/build/asset checks and Chromium/WebKit UI comparisons where relevant. First-click recognition and speaker volume need physical iPhone evidence beyond synthetic tests.

Before charging or cloud upload, add tenant-isolation, authentication/session expiry, CSRF where cookie-based, server payload/rate limits, checkout ownership, signed/idempotent webhook, replay/environment mismatch, secrets/log-redaction, deletion/restore and account-switch tests. The detailed backend controls live in [the cloud proposal](../architecture/cloud-services-proposal.md).
