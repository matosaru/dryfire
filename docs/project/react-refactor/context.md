# Working context

Updated 2026-11-07. [Active Free plan](../free-app-next-work-plan.md) · [Audio evidence plan](../audio-recognition-improvement-plan.md) · [Performance contract](../../development/PERFORMANCE.md) · [Application sitemap](../../architecture/application-sitemap.md).

- Current application work targets `b`; production promotion remains checked `b` → `main`, and `dev` is outside scope. CHG-066 Metric/Imperial preference is in progress. CHG-068 individual History deletion and CHG-069 one-mobile-Chromium-visual-per-page reduction are queued in that order. Cloudflare remains owner-managed.
- CHG-063 adds ambient microphone readiness, stronger/testable cue, trigger-profile guidance, atomic sample replacement and a labelled Sound Check with privacy-safe report export. New 23-value spectral features feed a v3 shadow comparison only; v2 continues to drive all practice results. Preserve schema 4/formats 1–4, saved profiles/backups, raw-audio prohibition, capture/safety guards and minification.
- The audio feature and Learn-owned learned-sound check are merged. Physical iPhone cue/recognition evidence remains owner testing; the shadow v3 classifier is not promoted from automated evidence.
- Baseline before CHG-066: 1,173 tests / 179 suites, 16 smoke checks, optimized public build and artifact verification pass on current `origin/b` (`86a2817`). Complete acceptance is still required before publication. The later CHG-069 screenshot reduction must retain semantic coverage and publish failure images/diffs for every retained page-level case.
