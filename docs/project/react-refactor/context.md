# Working context

Updated 2026-11-21. CHG-070 localization is not release-ready: owner screenshots show English copy persisting on German Settings and Practice screens. Source/catalog audit passes, but runtime locale refresh is incomplete. Work remains on `codex/environment-recovery-2026-11-19`; keep `b` and `main` unchanged and do not version-bump, merge, or release. Findings and estimated corrective tickets are in [localization-plan.md](../localization-plan.md).

- **Done:** locale and SEO contract; YAML catalog compiler/validation/completeness gate; locale runtime and Settings selection; browser reload restores the selected locale while preserving local data; localized SEO output and artifact verification; accessibility/overflow and visual acceptance.
- **Completed:** catalog parity/completeness and static source-copy audit; prior unit/build/SEO/docs and English-only pinned visual gates passed (see plan for counts and limits).
- **Confirmed gaps:** Settings snapshots dynamic translated strings and does not recompute them on language change; Practice passes an initial English title/step snapshot and retained build-time English setup DOM. `loadLocale` only patches numeric hints in nodes already present and publishes React subscribers, so inserted/retained native content can stay stale.
- **Next:** implement corrective tickets L10–L15 in [localization-plan.md](../localization-plan.md), then rerun full candidate acceptance. Corrective engineering estimate: **8.75 h (5.75–14.25 h)**; this analysis/documentation increment was not timed.
- No application code, version, `b`, `main`, release, or deployment was changed in this analysis pass.
