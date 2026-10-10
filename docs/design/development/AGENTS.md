# Codex instructions — Dry Fire Sound Trainer

## Project
Offline-first Vite / vanilla JavaScript PWA, packaged for iOS and Android with Capacitor. It learns four user-recorded acoustic events: `draw` (holster draw), `rack` (slide rack), `trigger` (trigger pull), and `reload` (magazine change). It recognizes sound events in continuous listening and tracks ordered multi-action drills. Training examples and history are local (IndexedDB). Production is hosted as static assets on Cloudflare Workers using `wrangler.jsonc`.

## Persistent requirements and approved designs

- Before product work, read [REQUIREMENTS.md](../requirements/OVERVIEW.md), the relevant files in [requirements specifications](../requirements/README.md), the [approval log](../requirements/approval-log.md), and the [design catalog](../README.md).
- Treat these Markdown specifications as the source of truth for requirements. Preserve linked designs and their reviewed revisions in Git. Handoff notes and illustrative mockup values do not override them.
- Before implementing changed product scope, behavior, data ownership, retention or defaults, document the concrete change, affected requirement IDs, acceptance criteria and revised design. Record the user's approval of that revision before implementation.
- Reuse explicit approval or a specific direct instruction already given in the conversation; do not ask again for unchanged approved scope. Assistant-proposed additions remain proposed until approved. Routine fixes restoring approved behavior do not require a new product approval.
- Follow [change-process.md](../requirements/change-process.md). Append approval evidence honestly; never infer approval from silence, an uploaded image, a successful push or elapsed time.
- Keep requirement approval, implementation, validation and deployment status separate. Update specifications, design links and implementation status when relevant behavior changes. Do not mark a mockup as implemented.

## Documentation location and provenance

- Keep all full project documentation under `docs/design/`, including requirements, approval history, design assets and development guides. Root README, AGENTS and REQUIREMENTS files are navigation entry points only.
- Keep design-source and license evidence in [originality-and-provenance.md](../originality-and-provenance.md). AI generation and locally authored paths do not prove trademark/copyright clearance. Do not describe a design as exclusive or legally cleared without evidence.
- The current app logo is `public/logo.svg`. Monogram variants in mockups are illustrative and do not authorize changing production branding. Any redesign follows the requirements approval process.

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
- Use a feature branch and pull request for nontrivial changes; include tests performed, any blocked validations, before/after build sizes, risks, and any manual iPhone checks still required.
- CI should run smoke tests, Jest, production build, and `verify:dist`.
- Cloudflare project: `dryfire`; `wrangler.jsonc` controls static asset deployment from `./dist`.
- Never claim a GitHub push, Cloudflare deployment, or real-device verification succeeded without observing success.

## Current handoff
See the [historical handoff](CODEX_HANDOFF.md) for the requested v0.8 UI update, production minification audit, and regression-test-first refactor task.
