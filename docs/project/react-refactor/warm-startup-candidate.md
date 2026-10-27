# Public WebKit warm-startup candidate

## Observed failure

The `b` source is `bddaa93c4458f55634ebb22843ba8cde2c66a1cf`.
The [push check](https://github.com/matosaru/dryfire/actions/runs/40486819679/job/122130565021)
reports a confirmed public WebKit warm regression: baseline median/p95
36/49 ms, candidate 40/46 ms, 34 of 40 paired samples slower. Navigation
phase medians are responseEnd 2→5 ms and domInteractive 14→22 ms.
The corresponding PR run also failed. Earlier green candidate runs do not
supersede these publication failures. Main promotion remains blocked.

## Candidate and evidence

`tools/minify-html.mjs` previously relocated blocking stylesheets ahead of
the JavaScript module. The candidate leaves the actual stylesheet tags in
their original order after the module and inserts early `as="style"`
preloads instead. This preserves early CSS fetching while allowing module
discovery before cached stylesheet processing. This is a hypothesis for the
measured public warm-startup regression, not a verified performance fix.

Regression tests cover module/stylesheet order, request attributes, duplicate
hint suppression, idempotence, avoiding duplicate element IDs/event handlers,
unchanged body markup and documents without application modules. No runtime
logic, CSS, screenshot pixels, stored data or timing thresholds are changed.
Guide GIF bytes are retained because their presentation/scenarios are unchanged;
the reviewed input fingerprints disclose pending pinned-browser acceptance.

Both public and preview builds, minification/artifact verification, original
payload limits and visual-reference inventory checks pass locally. Public
critical JavaScript is 50,030 gzip bytes and preview is 50,465; CSS is 12,885
in each. Reference inventory checks are not screenshot execution.

The candidate passes all 1,123 tests in 168 suites under Node 22.23.3,
the unchanged coverage ratchet, smoke tests, type checking, both lint scopes,
architecture and documentation checks. Portable patch SHA256:
`91dfabaa5446f439355110584413c008e89b5f012948fa521cac5310eb824910`.
Public and private-preview Worker deployment dry runs also pass; nothing was
deployed. The first local `deploy:check` used the preview artifact with a public
profile and correctly rejected it; rebuilding the matching edition resolves that
local invocation error.

## Required acceptance

The portable candidate is
`docs/design/review-inputs/warm-style-preload.patch`, based on the source above.
It contains build logic, regression tests and the corresponding review metadata;
publishing that review file does not activate the application change.

Run **Test and build** with branch `b`, input `candidate_patch` set to that path
and `candidate_design_ref` empty. All validation, both screenshot editions,
integration/diff probes and all four unchanged performance comparisons must pass.
Only then apply the exact candidate to `b`, finish its push/PR checks and merge
PR29 normally. Do not retry unchanged failures, loosen budgets or rebaseline.

## Environment blocker

On 2026-10-27 Git fetch and GitHub's HTML check pages work, but API requests to
`api.github.com` are denied by the active egress policy. The exact pinned browser
image also fails to download with `Forbidden`. The existing cloud-environment
draft already includes `api.github.com` and
`westcentralus.data.mcr.microsoft.com`; the running environment reports neither
as allowed. Apply/publish that saved environment configuration and refresh the
environment so CI dispatch and pinned local browser validation can resume.
Do not bypass the proxy or substitute host-browser results for acceptance.
