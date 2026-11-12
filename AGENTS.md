# Codex repository guide — Dry Fire With Ease

## Project overview

Dry Fire With Ease is an offline-first Vite PWA for microphone-assisted dry-fire practice. The runtime is progressively migrating from vanilla JavaScript to typed React while preserving fast native startup adapters. Data is stored locally in IndexedDB; production assets are deployed to Cloudflare Workers.

| Area | Technology |
| --- | --- |
| UI | React, TypeScript, reusable packages under `packages/ui` |
| Runtime/controllers | JavaScript modules under `src` |
| Build | Vite, minified production output in ignored `dist/` |
| Storage | IndexedDB schema 4; backup format 4 with legacy restore support |
| Tests | Jest, Testing Library, Playwright Chromium/WebKit |
| Hosting | Cloudflare Workers static assets |

Node.js 22 or newer is required. Install from the committed lockfile with `npm ci`.

## Repository map

| Path | Responsibility |
| --- | --- |
| `apps/web/src/pages/` | Typed application page components and page-local CSS/tests |
| `apps/web/src/features/` | Feature presentation and feature-local components |
| `apps/web/src/app/` | Guarded React mounts and controller-to-page adapters |
| `packages/ui/src/` | Shared reusable UI components, semantic tokens, CSS and tests |
| `src/` | Runtime controllers, audio, navigation, storage and startup adapters |
| `workers/` | Service worker, audio worklet and Worker entry points |
| `tests/` | Runtime, storage, integration and adapter tests |
| `visual-tests/` | Playwright workflows and canonical screenshot harness |
| `docs/requirements/` | Authoritative functional requirements |
| `docs/design/` | Current screen designs, reviewed captures and provenance |
| `docs/architecture/` | Screen/component ownership, routes and maintenance rules |
| `docs/project/` | Approval evidence, implementation history and active plans |

The application entry point and ownership map are documented in [application-structure.md](docs/architecture/application-structure.md) and [component-map.json](docs/architecture/component-map.json).

## Sources of truth

Read these before changing the affected area:

1. [Functional requirements](docs/requirements/README.md)
2. [Design context](DESIGN.md) and [design catalog](docs/design/README.md)
3. [Approval log](docs/project/approval-log.md)
4. [Architecture maintenance](docs/architecture/README.md)
5. [Detailed repository rules](docs/development/AGENTS.md)

Historical CHG decisions remain evidence in the linked documents. They do not override a later direct user instruction or the current rules in this file.

Task/model allocation and context discipline are documented in [codex-workflow.md](docs/development/codex-workflow.md). Model, approval and sandbox configuration remains client/environment-owned rather than committed to this repository.
For a complete `b` candidate, use the repository's [candidate-acceptance skill](.agents/skills/dryfire-candidate-acceptance/SKILL.md); focused checks never replace that gate.

## Current branch and delivery rules

- Develop Free application changes on `b`.
- Commit all ongoing feature work only to `b`; keep `main` unchanged while the feature is being built and validated.
- Bump the app version once per completed feature, not once per commit or intermediate refactor slice. After the feature passes its full acceptance on `b`, make one release-version commit, refresh version-derived About evidence, and rerun the exact-candidate gates.
- Promote the fully tested/released `b` feature to `main` only after the user explicitly approves that feature's promotion. Use the protected pull-request process; never merge or push application changes to `main` without that approval.
- The user configures Cloudflare. Prepare and validate repository code/configuration; do not claim live deployment without observing it.
- Before an in-progress commit to `b`, inspect the diff and run focused tests for the changed owners. CI must test each pushed candidate. Before the one feature version bump and any promotion request, run the complete acceptance gate on the versioned candidate; focused tests alone are insufficient for release.

## Working rules

- Preserve approved behavior, saved data, routes, accessibility and reviewed visuals unless the user explicitly changes them.
- Prefer small changes in the existing owner. Do not add a dependency when an existing component or platform primitive solves the problem.
- Shared UI receives data and callbacks; it does not access microphones or IndexedDB directly.
- Keep React ownership exclusive. A native startup adapter must stop mutating a region after React owns it.
- Reuse semantic tokens and canonical primitives described in [the design-system package](docs/design-system/README.md). Do not introduce unexplained raw colors, spacing scales or duplicate controls.
- Keep native selects native unless a separately approved design changes that decision.
- Add meaningful tests for behavior and ownership. Do not add implementation-mirroring tests solely to increase counts.
- Preserve IndexedDB identifiers, backup compatibility and gun ownership. Destructive actions require accurate scope and confirmation.
- Synthetic audio tests do not establish physical microphone accuracy, cue audibility or safe firearm handling.

## Commands

### Fast local checks

```bash
npm ci
npm run typecheck
npm run lint:components
npm run lint:runtime
npm run test:smoke
npm test
npm run build:public
npm run verify:dist -- --edition=public
```

### Documentation and architecture

```bash
npm run verify:architecture
npm run docs:generate
npm run docs:check
npm run visual:review
```

Run `npm run docs:review` only after reviewing affected requirements, designs and rendered evidence.

### Complete application acceptance

```bash
npm run test:coverage
npm run coverage:check
npm run build:public
npm run verify:dist -- --edition=public
npm run perf:payload
npm run build:preview
npm run verify:dist -- --edition=preview
```

Run the pinned Playwright container for browser workflows and canonical screenshots:

```bash
npm run build:public
VISUAL_EDITION=public npm run test:visual:docker
npm run build:preview
VISUAL_EDITION=preview npm run test:visual:docker
```

Run the unchanged performance comparison required by [PERFORMANCE.md](docs/development/PERFORMANCE.md). Never replace pinned Chromium/WebKit evidence with a local browser or treat cancelled/pending CI as passed.

## Visible-change process

For a screen, state, navigation, copy or visible-control change:

1. Update its requirement and design document.
2. Review `docs/architecture/screen-map.json` and component ownership.
3. Update meaningful unit/integration tests.
4. Generate the canonical 390 px Chromium page capture when its page appearance changes.
5. Inspect the actual image before recording its fingerprint.
6. Run `npm run docs:review`, `npm run docs:generate`, and `npm run docs:check` in that order.

Normal tests and CI must never auto-accept screenshot baselines.

## Definition of done

A change is done only when:

- implementation, requirements and design documentation agree;
- relevant unit, integration, storage and browser tests pass;
- coverage, architecture, documentation, build/profile, payload and performance gates pass;
- both public and preview artifacts are verified;
- canonical visual references are inspected and exact comparisons pass when affected;
- the implementation history and current handoff identify completed and remaining work;
- the exact accepted candidate is committed to `b` and observed CI is green before promotion.

Keep [react-refactor/context.md](docs/project/react-refactor/context.md) concise and current after each completed increment. Record deployment and physical-device checks separately from source acceptance.

For a feature spanning multiple commits or refactor slices, keep one application version throughout work on `b`. Bump `package.json` and `package-lock.json` once when that complete feature is ready for release on `b`; refresh About's build-derived version evidence and rerun full acceptance on the bumped exact candidate. Do not bump for intermediate commits. Do not merge that release to `main` until the user explicitly approves promotion.
