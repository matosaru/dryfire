# Codex handoff — Dry Fire Sound Trainer

Current product scope and approval states are maintained in [REQUIREMENTS.md](REQUIREMENTS.md), [docs/requirements](docs/requirements/README.md) and the [design catalog](docs/design/README.md). Read those first. The v0.8 archive and release notes below are historical context, not instructions to replace the current application or override approved requirements.

Repository: https://github.com/matosaru/dryfire
Primary branch: main
Target release: v0.8.0 UI update, followed by test-first minification audit/refactor.

## Baseline verification (before any refactor)

The separately prepared v0.8.0 source archive passed:
- `node --test tests/smoke.test.mjs tests/installable.test.mjs`: **16 passed, 0 failed**.
- `node --check` for all source/worker/test/build JS files: passed.
- Jest, Vite build and real iPhone microphone tests: **not verified** in the constrained environment; npm registry was unavailable. Run these on a development machine or in CI before refactoring.

Existing `vite.config.js` explicitly enables:
- `build.minify: 'oxc'`
- `build.cssMinify: 'lightningcss'`
- `build.sourcemap: false`
- separate bundling/minification of `sw.js` and `pcm-capture.worklet.js`

Do NOT interpret these configuration settings as proof of minified output until `npm run build && npm run verify:dist` pass. Inspect produced JS/CSS and look for raw sources and duplicate code.

## Release request

The current main branch still has the prior app version. A complete v0.8.0 source archive is available in the ChatGPT project conversation as `dryfire-sound-trainer-v0.8.0-source.zip` (NOT part of the repository yet).

Next implementation tasks:
1. Import the complete v0.8.0 archive (place archive contents at repo root; do not nest them under an extra directory). Preserve Git history, avoid force-push.
2. Keep the four distinct sound labels and built-in drills.
3. Compact header with new angular logo, five tabs Home/Learn/Drills/Live Listen/History; Settings accessible from header.
4. Four looping illustrative animation GIFs with reduced-motion static stills.
5. Per-label reset for learned examples; separate confirmed full reset; neither operation silently deletes recognition history. Maintain IndexedDB migration compatibility.
6. Run the baseline tests, Jest and production build, then add regression tests before any refactor.
7. Audit duplicated helpers, DOM-building blocks, classification and UI event logic. Refactor into reusable components without changing user-facing behavior.
8. Ensure deployment bundle is **minified**, whitespace/comments trimmed, local variable/function names shortened where safe, code split and reused, **no .map files**, and no readable `src/` or unminified worker/service worker files in `dist/`. Preserve readable source in GitHub.
9. Use a feature branch with pull request for refactor. Attach before/after build size and smoke/Jest results.
10. Once checks pass, deploy Cloudflare using `npm run build` followed by `npx wrangler deploy` with `wrangler.jsonc` assets.directory=`./dist`. Never deploy raw source ZIP directly.

## Important limitations

Synthetic audio tests do not verify recognition accuracy or microphone behavior on iPhone Safari. Manual real-device testing remains required. Avoid changes that cause recognition to stop after the first detected event.

## Review checklist

- [ ] baseline smoke + Jest + build completed and results logged
- [ ] existing drills and four labels unchanged
- [ ] individual reset leaves unrelated profiles intact
- [ ] no service worker caching stale app
- [ ] no raw source or source maps deployed
- [ ] minified JS, CSS, audio worklet, service worker inspected
- [ ] repeated event recognition works on real iPhone
