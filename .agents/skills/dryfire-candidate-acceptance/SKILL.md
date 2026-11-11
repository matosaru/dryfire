---
name: dryfire-candidate-acceptance
description: Validate an exact Dry Fire With Ease b-branch candidate before commit, push, or b-to-main promotion.
---

# Dry Fire candidate acceptance

Use focused checks while developing intermediate commits on `b`. Use this complete workflow when a feature is finished and its one release-version bump is ready, or before asking the user to approve promotion to `main`.

## Preconditions

1. Confirm the working branch is `b`.
2. Read root `AGENTS.md`, the affected requirements/design documents and the active plan.
3. Inspect the entire diff, including untracked files. Do not include generated `dist`, coverage, traces, reports, credentials or temporary artifacts.
4. Do not update screenshot baselines merely to make a test pass. A visible change needs approved requirements/design and inspection of the rendered image.

## Static and unit acceptance

Run:

```bash
npm run typecheck
npm run lint:components
npm run lint:runtime
npm run verify:architecture
npm run docs:check
npm run test:smoke
npm run test:coverage
npm run coverage:check
```

Fix failures and rerun the complete affected gate. A focused rerun proves the fix, but does not replace complete acceptance.

## Artifact acceptance

For each edition, build and verify the same output before replacing it with the other edition:

```bash
npm run build:public
npm run verify:dist -- --edition=public
npm run perf:payload
VISUAL_EDITION=public npm run test:visual:docker

npm run build:preview
npm run verify:dist -- --edition=preview
VISUAL_EDITION=preview npm run test:visual:docker
```

Run the unchanged browser performance comparison described in `docs/development/PERFORMANCE.md`. Local diagnostic browsers cannot replace the pinned comparison.

## Evidence and delivery

1. Update implementation history, the active plan and `docs/project/react-refactor/context.md` with observed results and remaining owner/device/deployment checks.
2. Run `git diff --check` and inspect `git status --short`.
3. Keep the existing version during intermediate commits. For the completed feature, make one version bump after acceptance, refresh About evidence, then rerun this complete workflow on that exact versioned candidate.
4. Commit/push feature work only to `b`; observe branch CI. Cancelled, pending or stale runs are not green.
5. Request promotion only after the exact release candidate on `b` is green. Merge `b` to `main` through the checked PR workflow only after the user explicitly approves this feature's promotion.

Never claim Cloudflare deployment, physical iPhone audio acceptance or classifier significance from repository tests alone.
