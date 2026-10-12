# Codex instructions — Dry Fire With Ease

## Project
Offline-first Vite / vanilla JavaScript PWA, packaged for iOS and Android with Capacitor. Trigger-click practice needs only `trigger`; optional `draw`, `rack` and `reload` retain their stable identifiers. Six practice modes share one engine, while existing ordered built-in/custom sequences remain available. Optional reset/noise/cue calibration supplies rejection evidence; only calibrated external-cue mode requires cue examples. Features, gun-owned preferences and legacy/practice history stay in IndexedDB schema 3; current backup format 4 restores compatible formats 1–3. Explicitly confirmed CHG-019 Settings full reset clears the whole local app library; CHG-020 single-gun deletion removes all data owned by that gun, and separate session/history clear actions remove only their disclosed selected-gun scope. Ordinary sound resets still preserve profiles/results. Production is hosted as static assets on Cloudflare Workers using `wrangler.jsonc`.

## Persistent requirements and approved designs

- Before product work, read [REQUIREMENTS.md](../requirements/README.md), the relevant files in [requirements specifications](../requirements/README.md), the [approval log](../project/approval-log.md), and the [design catalog](../design/README.md).
- Treat these Markdown specifications as the source of truth for requirements. Preserve linked designs and their reviewed revisions in Git. Handoff notes and illustrative mockup values do not override them.
- Before implementing changed product scope, behavior, data ownership, retention or defaults, document the concrete change, affected requirement IDs, acceptance criteria and revised design. Record the user's approval of that revision before implementation.
- Reuse explicit approval or a specific direct instruction already given in the conversation; do not ask again for unchanged approved scope. Assistant-proposed additions remain proposed until approved. Routine fixes restoring approved behavior do not require a new product approval.
- Follow [change-process.md](../project/change-process.md). Append approval evidence honestly; never infer approval from silence, an uploaded image, a successful push or elapsed time.
- Keep requirement approval, implementation, validation and deployment status separate. Update specifications, design links and implementation status when relevant behavior changes. Do not mark a mockup as implemented.
- After every user request that affects project work, update [implementation history and remaining plan](../project/implementation-history.md). Keep a concise per-request record of delivered scope, remaining work and next steps. Separate approval, code, tests, push and deployment; record only observed success, and preserve earlier history rather than implying every published design is a working feature.

## Documentation location and provenance

- Keep full project documentation in its appropriate package under `docs/` as defined by the [documentation index](../README.md). CHG-018 supersedes the older all-under-`docs/design/` rule. Root README, AGENTS and REQUIREMENTS files are navigation entry points only.
- For every screen/state/navigation/control change, update the relevant requirement and design, review the [screen registry](../architecture/screen-map.json), then run `npm run docs:generate` and `npm run docs:check`. Update reviewed-source fingerprints only after reviewing affected screen evidence; see [maintenance](../architecture/README.md).
- Keep design-source and license evidence in [originality-and-provenance.md](../design/originality-and-provenance.md). AI generation and locally authored paths do not prove trademark/copyright clearance. Do not describe a design as exclusive or legally cleared without evidence.
- The canonical display name is **Dry Fire With Ease**; follow [branding.md](../requirements/branding.md). The canonical DF monogram is `public/logo.svg`; the full logo lockup combines that SVG with the accessible HTML wordmark in `index.html` and `src/styles.css`, including WITH EASE. Monogram variants in historical mockups are illustrative and do not authorize changing production branding. Further redesigns follow the requirements approval process.

## First rule: test BEFORE refactoring
1. Read the [development guide](README.md), `package.json`, `vite.config.js`, `wrangler.jsonc`, and existing tests.
2. Before changing application code, run and record results of:
   - `npm install` (or `npm ci` if a committed lockfile exists)
   - `npm run test:smoke`
   - `npm test`
   - `npm run build`
   - `npm run verify:dist`
3. If a baseline test fails or dependencies cannot be installed, document that explicitly. Fix pre-existing failures separately; do not silently attribute them to a refactor.
4. Add regression tests for intended behavior BEFORE changing tested logic. Re-run the same checks after each relevant change. Do not claim device microphone functionality was verified by synthetic audio tests.

## Preserve behavior and data
- Continuous recognition must keep listening and detecting successive separate actions until user explicitly stops or leaves the active screen.
- Four event labels remain distinct: draw, rack, trigger, reload. Do not change persisted identifiers without migrations.
- Existing built-in drills and their action order must remain intact.
- Learned examples must persist locally; resetting one sound must not delete other sound profiles or history. Full reset must be a separate confirmed action.
- Preserve import/export behavior and IndexedDB compatibility. Treat saved data as user data; avoid destructive migrations.
- Keep safety checklist and accurate warnings that acoustic detection does not verify a firearm is unloaded.
- Browser microphone access generally requires HTTPS or localhost. Never assume recording works in the background or on every iPhone without real-device testing.

## Architecture and refactoring
- Keep pure logic in dedicated modules (`src/classifier.js`, `src/drills.js`, `src/eventDetector.js`, `src/evaluation.js`).
- Centralize repeated class labels, display names, DOM helpers, reset logic and event handling where this actually reduces duplication.
- Keep changes small and reviewable; avoid renaming everything just for style or rewriting the app as a new framework without approval.
- Add unit tests for any new utilities and event-segmentation behavior.

## Production optimization requirements
- Editable development modules remain human-readable in `src/` and `workers/`.
- Deploy only `dist/`: bundle and tree-shake modules, minify JavaScript (including shortening local identifiers where safe), minify CSS, remove unnecessary whitespace/comments, disable source maps.
- Bundle and minify the AudioWorklet and service worker; ensure no unminified copies from `public/` or raw `src/` leak into production.
- Respect externally referenced worker class names / API names and stable persisted field names; do not break them through unsafe identifier mangling.
- Verify `dist/index.html`, `dist/assets/`, `dist/sw.js`, `dist/pcm-capture.worklet.js` and run `npm run verify:dist`. Compare generated output sizes.
- Do not commit `node_modules/`, `dist/` or secrets.

## Delivery and deployments
- CHG-025: follow [branching-strategy.md](../project/branching-strategy.md): feature branches from `dev` use PRs into `dev`; production uses a reviewed `dev` → `main` PR owned by the user. Hotfixes start from `main`, enter by PR and synchronize back to `dev`. Never push directly to `main`. Earlier no-PR instructions are superseded. Include tested/published commits and blocked server-protection/deployment/device validation in the delivery record.
- CI should run `docs:check`, smoke tests, Jest, production build, and `verify:dist`.
- Cloudflare project: `dryfire`; `wrangler.jsonc` controls static asset deployment from `./dist`.
- Never claim a GitHub push, Cloudflare deployment, or real-device verification succeeded without observing success.

## Current handoff

CHG-026: the [web commercial roadmap](../project/web-commercial-plan.md) is **planning only**, per the latest explicit instruction to commit plans on a feature branch and not begin implementations. Native releases are deferred. Use the [forward requirements](../requirements/web-commercial.md), commercial/cloud/review/preview documents and exact approval evidence; do not implement paid gates, pricing, accounts, cloud uploads or Contact/SEO routes until the user later starts implementation. Read-only research and documentation validation remain authorized.

CHG-027 specifically starts the [About/email-contact slice](../requirements/about.md) on its own feature branch. This authorizes a dedicated app screen and the confirmed email link, with initial suggested copy for user review. It does not start other CHG-026 implementation stages.
See the [historical handoff](CODEX_HANDOFF.md) for the requested v0.8 UI update, production minification audit, and regression-test-first refactor task.

CHG-032 is a specific later authorization for [temporary public/full editions](../requirements/build-editions.md), overriding the earlier gate-implementation pause only for that slice. Preserve existing gun/preset editing/use/export/restore, keep optional code and test both editions. Ordinary public deployment rejects preview artifacts; hosted full preview needs verified access protection. CHG-033 keeps the fixed five-item navigation visible on About/Contact. CHG-034 changes public creation to two guns while retaining larger existing libraries. CHG-035 starts the private-preview simulation and signed Access asset gate, with no public override or private offline shell. Live policy/deployment stays separately verified. Billing/auth/cloud/SEO/native implementations remain paused/deferred.
