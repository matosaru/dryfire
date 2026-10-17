# Refactor performance checks

CHG-049 implements the measurement foundation required by [the approved specification](../project/react-refactor/spec.md#performance-contract). Runtime source and accepted visual references are unchanged in P0.

## Reproduce

```bash
npm run build
npm run verify:dist
npm run perf:payload
```

The artifact analyzer parses optimized modules without executing them, counts mandatory static transitive imports, records raw/gzip bytes and reports lazy/installed assets separately. The browser benchmark also accounts for actual startup requests, including dynamic imports that started before Ready and finished later. Its VM parser needs the experimental-vm-modules flag already supplied by the npm command. Compression accounting uses Node gzip consistently, which can differ from Vite's rounded size summary; compare reports from the same Node/runtime. [The captured payload baseline](../architecture/performance-baseline.json) identifies exact files, bytes and hashes. Explicit edition comparisons must use their own matching baseline.

For browser timing, build an independent original checkout and the candidate with the same Node, lockfile and edition, then run in the pinned Playwright image:

```bash
npm run perf:compare -- --baseline=/path/to/original/dist --candidate=dist
```

The CI job performs these independent builds from immutable source: Free checkout 6c38bff and Full checkout a5b76e8. It uses the same compiler/runtime and tests both public/preview outputs. It never runs tests against or changes a public deployment. The preview login boundary is covered by separate signed-token tests; this local fixture server is not a replacement private deployment.

Each Chromium/WebKit comparison alternates baseline/candidate order for ten cold and ten warm samples. Chromium uses fixed 4× CPU throttling, 40 ms network latency and 200,000-byte/s download throughput; WebKit uses a consistent unthrottled browser. The real app imports the synthetic library, navigates, starts a zero-delay Single through actual safety confirmation, recognizes PCM through its real detector/classifier, saves Review and releases capture. The last sample for each artifact also performs ten successive practice cycles in the same page. Reports retain cold/warm/returning-user startup, immediate cold Settings action, navigation and first-click median/p95 and samples, requested asset paths, practice frame gaps, long tasks, cleanup state and Chromium post-GC heap observations through those repeated cycles. Synthetic media retains its own test objects; compare matched reports rather than interpreting all heap growth as an application leak. Repeated controller timer/resource contracts remain a separate deterministic guard.

Critical raw/gzip payload growth fails before browser work. Changed application assets with slower timing medians trigger a second paired sample set; a slowdown repeated in at least 80% of the paired observations fails. All raw samples and p95 values remain reviewable; this is a regression signal, not a formal statistical confidence guarantee. Identical application HTML/JS/CSS assets are reported as unchanged, with timing variance retained diagnostically rather than falsely attributed to the refactor. No benchmark result is described as a speed improvement merely because one noisy sample is faster.

GitHub **Test and build** publishes performance-checks-public and performance-checks-preview JSON artifacts. The stable screenshots aggregate also requires both performance jobs. Reports identify baseline/candidate source revision, asset hashes, image, browser and Node. Repeated cleanup and browser/platform coverage must be expanded as each lifecycle migrates; synthetic input is not a physical iPhone latency/loudness measurement.

System Chromium can diagnose the harness using PERFORMANCE_EXECUTABLE_PATH and --browser=chromium --runs=2. Such runs are explicitly marked local-diagnostic and cannot establish canonical visual parity or final performance acceptance. The managed environment's pinned-image pull is currently blocked; the extra MCR blob domain is saved in the environment draft, which requires user publication to apply. Pinned CI remains usable independently.

## Shell runtime feasibility

`npm run perf:react-shell` builds a temporary, isolated React 19.3.1 hydration example with the same Oxc minifier and Safari 16.4 target. It never mounts in or changes the product. [Measured evidence](../architecture/react-shell-runtime-probe.json) records 219,424 raw / 67,811 gzip JS bytes for a single interactive button, before any app features. The entire current public entry is 170,917 raw / 50,807 gzip bytes under the same accounting. Thus importing the React client renderer upfront fails the approved initial-size gate even before app code is added.

This rules out that loading strategy, not all React use or all possible performance outcomes. P2 must prove the plan's prerendered, immediately usable shell and deferred ownership handoff without losing controls, drafts/focus or first-action responsiveness. It cannot mark an unusable page Ready to hide mandatory bytes, block capture on a slow chunk, keep duplicate DOM writers or silently relax the payload gate. Stop a strategy that fails those checks and retain the last verified implementation.

## Coverage before migration

```bash
npm run test:coverage
npm run coverage:check
```

Jest now discovers both .test.ts and .test.tsx and measures src, workers, typed web and shared UI runtime code. [coverage-baseline.json](../architecture/coverage-baseline.json) prevents lowering the measured whole-scope and per-file percentages or silently removing a measured owner. New typed runtime packages use the approved 90% statement/function/line and 80% branch floors. Existing uncovered legacy controllers stay visible; they do not become safe just because a global ratchet passes. Add their characterization before moving them, and increase the accepted floors when coverage improves. Reports are uploaded as runtime-test-coverage.
