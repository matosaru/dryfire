# Production minification and response checks

Audit date: 2026-10-11. Source release: [`7240e2c`](https://github.com/matosaru/dryfire/commit/7240e2c), included in audited `main` at `3b3c720`. This audit preserves the current build configuration and application behavior.

## Current output

[`vite.config.js`](../../vite.config.js) explicitly enables Oxc JavaScript minification, Lightning CSS minification and `sourcemap: false`, targeting Safari 16.4. The app, detector, service worker and AudioWorklet all pass through the production build. [`wrangler.jsonc`](../../wrangler.jsonc) publishes `./dist`; readable development modules stay in the repository.

The locally verified Node 22.23.3 / Vite 8.3.4 build has one nonempty physical line in every JavaScript and CSS file:

| Asset | Uncompressed bytes |
| --- | ---: |
| `assets/index-C-SnNSaq.js` | 143,368 |
| `assets/eventDetector-DtBbU0H0.js` | 1,836 |
| `sw.js` | 1,446 |
| `pcm-capture.worklet.js` | 715 |
| `assets/index-nvEhH2c1.css` | 55,530 |

Local function identifiers are shortened where safe. Spaces needed by JavaScript/CSS syntax, user-visible text, strings and stable API/storage field names remain. Removing those indiscriminately can change the program or invalidate saved data. HTML is a separate file and retains formatting; these single-line findings concern JavaScript and CSS.

## Compression comparison

Alternatives were installed and measured outside the repository, using the same unminified Vite output, module mode, safe local-variable mangling and no source maps. No extra minifier dependency or generated deployment file was committed. Gzip/Brotli measurements below use the same Node zlib defaults within each comparison; they are estimates, not observed Cloudflare transfer sizes.

| All JavaScript files | Raw bytes | Gzip bytes | Brotli bytes |
| --- | ---: | ---: | ---: |
| Current Oxc | **147,365** | **44,792** | **39,163** |
| Terser 5.51.2, one compression pass | 149,593 | 45,734 | 39,201 |
| Terser, two passes | 149,538 | 45,836 | 39,195 |
| Terser, three passes | 149,529 | 47,042 | 39,222 |

| CSS | Raw bytes | Gzip bytes | Brotli bytes |
| --- | ---: | ---: | ---: |
| Current Lightning CSS | 55,530 | 11,847 | 10,227 |
| cssnano 7.1.9, default preset | 55,845 | 11,837 | 10,271 |
| Lightning CSS followed by cssnano | 55,413 | 11,786 | 10,219 |

Oxc remains the smaller JavaScript option in these checks. The additional CSS pass saves only 117 raw bytes (0.21%), 61 gzip bytes or eight Brotli bytes. Retaining the existing minifiers avoids adding a second CSS transformation/dependency for that negligible saving. Candidate outputs were benchmarks, not accepted browser-tested releases. Unsafe property mangling was not evaluated because the app relies on persisted field names and external APIs.

Baseline dependency installation, **270 Jest tests / 23 suites**, **16 smoke checks**, production build and `verify:dist` pass under Node 22. Application code, layout, data formats and cache v17 are unchanged by this documentation audit; existing reviewed screenshots remain applicable.

## Inspecting a browser Network response or asset URL

The user reports extra spacing in the browser Network response / asset URL and supplied [the main JavaScript URL](https://dryfire.matosaru.workers.dev/assets/index-C-SnNSaq.js) and [the CSS URL](https://dryfire.matosaru.workers.dev/assets/index-nvEhH2c1.css). Both filenames match the locally audited build. That JavaScript has **zero line-break bytes**; the CSS has only **one trailing newline**, with no internal line breaks. Their exact deployed bodies remain unverified: direct requests for both URLs on 2026-10-11 received HTTP 403 from the workspace gateway before app content arrived. This is an access limitation, not evidence that Cloudflare serves unminified files or has failed. Transport encoding and deployed commit remain unverified.

1. Check the newest successful **production** build's commit in Cloudflare, following [DEPLOY.md](DEPLOY.md). GitHub CI success is separate deployment evidence.
2. Copy the precise JavaScript/CSS URL loaded by the page. Compare its filename with the audited names above, and verify its response content type/body is JavaScript or CSS rather than an HTML fallback. Names can also change with the resolved build-tool versions; a mismatch needs investigation rather than proving a failed deployment.
3. Save the actual response body and check physical line breaks. Developer tools may soft-wrap or format their display. Determine this from the response bytes instead of assuming display formatting caused the reported issue.
4. With an equivalent local build, compare the body with `dist/`. These SHA-256 values identify the locally audited uncompressed bodies:

   - Main JavaScript: `636eff2e25359f9f22c006c0b0ff424118e42ce64ee74f083371b02d7fedb91e`.
   - CSS: `0cb63d51915793327c0a24a2a2abfd4b99d34d4abea0780345bd21af476b3439`.

   Matching bytes verify the deployed response matches this build; a different hash needs the actual response and build versions to diagnose it.
5. Check `Content-Encoding` and transferred versus decoded resource size separately. Gzip/Brotli reduce bytes transferred without changing the decoded JavaScript/CSS displayed by the browser. This audit does not establish whether either encoding is enabled for the user's response.

If a page is still using an older cached bundle, reload and reopen the Home Screen app after the updated service worker activates. Preserve IndexedDB and avoid clearing browser site data merely to refresh assets. The supplied filenames already match this local build; attributing the user's display to a stale deployment would therefore be unsupported. A saved raw response or short excerpt can resolve any remaining difference in the displayed whitespace.
