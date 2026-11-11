# Codex work allocation

This repository records project rules and acceptance criteria. The Codex client or managed environment owns model selection, reasoning effort, sandboxing and approval policy; repository files must not claim to enforce those controls.

## Task allocation

| Work | Default effort | Escalate when |
| --- | --- | --- |
| Backlog wording, documentation formatting and mechanical inventories | Low | Requirements conflict or evidence is incomplete |
| Repetitive scaffolding that follows an approved component pattern | Medium | Ownership, compatibility or bundle boundaries change |
| Product implementation across controllers, storage and UI | Medium | Concurrency, migrations, audio timing or security boundaries are involved |
| Debugging, refactoring and performance diagnosis | High | The failure is nondeterministic, cross-engine or spans several owners |
| Review and validation | Low for mechanical checks; high for risk analysis | Destructive data paths, authentication, privacy, security or performance acceptance are affected |

Use the least expensive capable model/effort for the current task. Increase effort when evidence justifies it; do not repeat completed analysis merely because a stronger model becomes available. Model names and availability change, so this repository specifies capabilities rather than pinning a model name.

## Staged agent pipeline

One coordinator owns the exact branch/commit and passes short, durable artifacts between stages. Separate agents do not independently merge overlapping edits.

| Stage | Agent responsibility | Default capability/effort | Required handoff |
| --- | --- | --- | --- |
| 0. Intake and scope | Restate goal, constraints, branch and done criteria | Fast model, low | Scoped task and unresolved decisions |
| 1. Planning/specification | Inspect current owners and write requirements/plan | Workhorse model, medium | Reviewable spec, risks and ordered work |
| 2. UX/design review | Define states, responsive behavior and accessibility | Workhorse model, medium | Design target and evidence owner |
| 3. Implementation | Change the smallest correct owners and focused tests | Coding/workhorse model, medium; high for cross-owner work | Code, changed contracts and focused results |
| 4. Independent review | Compare the diff with the spec and look for omissions | Independent workhorse, high | Findings ranked by impact, with file evidence |
| 5. Testing/validation | Run deterministic unit, integration, browser, visual and build gates | Fast model, medium | Commands, exact revision and results |
| 6. Auto-fixing | Diagnose a classified failure and make a minimal correction | Coding/workhorse model, high | Root cause, fix and focused proof |
| 7. Release acceptance | Run the complete exact-candidate gate and inspect repository hygiene | Fast model, medium | Accepted revision or explicit blockers |
| 8. Deployment | Execute the authorized deployment using environment-owned credentials | Fast model, low/medium | Deployment identifier and target |
| 9. Post-deployment verification | Verify live version, smoke flows, SEO/cache behavior and rollback need | Fast model, medium; escalate incidents | Observed live evidence |
| 10. Documentation/handoff | Update plan, history and concise active context | Fast model, low | Current status and remaining owner work |

## Continuous SEO Analyst role

The SEO Analyst is a persistent specialist in the development pipeline, including this component refactor and future product changes. It reviews every planned or implemented change that can affect crawlability, rendered public content, canonical URLs, titles/descriptions, structured data, internal links, redirects, robots/sitemap policy, performance signals or accessibility that affects content discovery. The role reports risks and specific improvements to Planning/Implementation before acceptance; it does not silently change product copy or route policy.

For every SEO-affecting implementation, include focused unit tests for the changed contract (route identity, canonical/metadata output, structured data, links, redirect/status/robots/sitemap behavior, as applicable). `npm run test:seo` runs the focused public-site and routing contract tests on every GitHub push and pull request; the full test/coverage, build and visual gates remain required. Extend the focused suite whenever a new SEO contract is added so the analyst's findings are enforced by CI rather than relying only on a manual review. Browser/HTTP edge behavior still needs relevant integration checks; passing unit tests do not prove live indexing or Search Console status.

Model guidance: use a fast model for routine change screening, and escalate to a high-reasoning SEO/legal review when routes, domain consolidation, redirects, privacy, structured claims or indexing policy change. The repository documents this role and CI checks; the Codex coordinator must assign/run the specialist review because GitHub Actions does not have an authenticated model agent configured.

## Refactor versioning

Every accepted refactor increment bumps the application patch version in the root `package.json` and lockfile. About is the user-facing build-derived version display; keep that metadata as the single source rather than maintaining a second label. A version change updates About pixels, so refresh only the affected visual captures and their source manifests, inspect the rendered result, and include those checks in the normal exact-candidate acceptance run.

Use a frontier/high-reasoning model for security boundaries, destructive storage changes, audio races, nondeterministic cross-browser failures or architectural decisions with costly rollback. A mechanical code review can be cheap; a security or migration review cannot.

Validation and auto-fixing form a bounded loop: classify failure, apply one minimal fix, run focused proof, then rerun the complete affected gate. Set a retry limit before starting. Escalate repeated or nondeterministic failures rather than allowing agents to weaken thresholds, rewrite baselines or keep patching symptoms.

Model/effort selection happens when the coordinator starts an agent. Repository instructions describe the policy but cannot force a client to honor a particular model name.

Current recommended mapping (review when the available model catalog changes): fast = `gpt-6-luna`; workhorse = `gpt-6.1-sol`; coding = `gpt-6.1-terra` or `gpt-6.1-sol`; frontier review = `gpt-6-astra`. Prefer the inherited model when it already fits, and do not switch models merely to repeat work.

A bounded implementation may use `gpt-6-luna` at medium effort when the approved plan names exact owners, invariants, compatibility requirements and acceptance tests. Escalate to the workhorse/coding tier if the implementation finds an unspecified boundary, changes storage/audio/navigation ownership, becomes performance-sensitive or fails the same check twice. A cheaper agent must not invent architecture, weaken a check or accept a visual baseline.

## Context discipline

- The active handoff is [`docs/project/react-refactor/context.md`](../project/react-refactor/context.md). Keep it concise and update it after an accepted increment.
- Durable product decisions belong in requirements, the approval log and implementation history. Do not duplicate their full text in the handoff.
- Plans track incomplete work and acceptance criteria. Mark a step complete only after its applicable checks pass.
- Large generated logs, browser traces and build output remain CI/test artifacts rather than committed conversational context.

## Reusable automation

Prefer the checked-in npm scripts and CI workflows listed in [`AGENTS.md`](../../AGENTS.md). Add a repository skill only when a procedure is repeated, stable, project-specific and cannot be expressed clearly as a script plus a short instruction. A skill must not weaken the acceptance gate, select credentials or silently change branches.

## Agents and parallel work

Use specialized or parallel agents only when work can be divided into independent outputs with explicit owners and a final integration review. Small changes and tightly coupled debugging stay with one agent to avoid duplicated context, conflicting edits and extra usage.

## Environment controls

- Keep user/client Codex configuration outside this repository.
- The active environment controls filesystem/network permissions and approval behavior.
- Never commit credentials, personal tokens or environment-specific access policy.
- Preserve the repository's `b` candidate and checked `b` to `main` promotion rules regardless of the client configuration.
