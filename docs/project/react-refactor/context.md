# Working context

Updated 2026-11-02. [Active audio plan](../audio-recognition-improvement-plan.md) · [Performance contract](../../development/PERFORMANCE.md) · [Application sitemap](../../architecture/application-sitemap.md).

- Current authorized work is isolated on `feature/audio-recognition-v3`; `main`, `b` and `dev` remain unchanged. Publish only the feature branch for owner testing. Cloudflare remains owner-managed.
- CHG-063 adds ambient microphone readiness, stronger/testable cue, trigger-profile guidance, atomic sample replacement and a labelled Sound Check with privacy-safe report export. New 23-value spectral features feed a v3 shadow comparison only; v2 continues to drive all practice results. Preserve schema 4/formats 1–4, saved profiles/backups, raw-audio prohibition, capture/safety guards and minification.
- Local candidate evidence: 1,166 tests / 177 suites plus coverage ratchet, type/component/runtime lint, architecture/docs, 16 smoke checks and 454/454 exact public/preview Chromium/WebKit screenshots pass. Current guide media and 95 registered screen captures are regenerated/reviewed.
- Remaining before owner testing: verify both optimized artifacts and original payload/performance gates, commit/push the clean feature branch and observe GitHub CI. Owner then tests iPhone Safari/Home Screen cue audibility and exports an unseen labelled Sound Check corpus; automated tests cannot establish physical recognition significance.
