# Branching and release strategy

Revision 4.1 · current Free-product workflow · clarified 2026-11-11. The active Git branches are `b` for pre-production and `main` for production. Cloudflare setup remains owner-managed.

| Branch | Current role | Ownership |
| --- | --- | --- |
| `b` | Free-product development and pre-production review | Changes are committed and validated here; direct updates are permitted |
| `main` | Stable Free production | The owner promotes an accepted `b` commit through a protected pull request; never push directly |

There is no separate Git branch for the full preview. The explicitly selected `preview` build profile remains available for isolated CI/review and may be served by an owner-configured, Access-protected Cloudflare Worker. A build profile or Cloudflare environment is not a Git branch. This policy does not change retained application code, preview functionality, user data, or deployment configuration.

## Daily changes and releases

1. Work on `b` for approved Free-product changes and fixes; feature branches are not required. All commits for an unfinished feature stay on `b`; keep `main` unchanged.
2. Complete the required unit/coverage, integration, both-edition build/artifact, pinned browser/visual and unchanged performance acceptance for the full feature on `b`.
3. Bump the application version exactly once per completed feature, after its acceptance passes on `b`; refresh version-derived About evidence and rerun full acceptance on that release candidate. Intermediate commits and refactor slices do not bump the version.
4. Push the accepted release candidate to `b`. Merge `b` to `main` through the protected PR process only after the user explicitly approves that feature's promotion. Do not merge or deploy without observing the required approval and successful checks.
5. Keep changes reversible, preserve user data, and avoid force-pushing or rewriting shared history. Cloudflare configuration remains owner-managed.

## Commercial work after Free completion

After the owner finishes the Free version on `b`/`main`, revisit monetization principles, desired functionality, business model, application/service structure and necessary technical solutions in a separate planning iteration. Prior Pro/cloud/billing proposals are inputs for reassessment, not automatic implementation instructions. [Commercial roadmap](web-commercial-plan.md) and [current modularization plan](react-refactor/follow-up-plan.md) record this sequence. Native releases remain deferred.

## Existing build/artifact compatibility reference

The following describes retained implementation compatibility and is not authorization to implement paid functionality.

`build-profile.json` is the committed default for `b` and `main`. `npm run dev`, `npm run build` and `npm run verify:dist` follow it. `npm run build:public` and `npm run build:preview` explicitly select an edition for isolated review; `APP_EDITION` is also validated. Unknown values fail closed. A build's `edition.json` identifies its edition, checkout revision, source digest and complete bundle assets.

`wrangler.jsonc` must match the appropriate prepared template: [public](../../wrangler.public.jsonc) for public deployments; [private](../../wrangler.private-preview.jsonc) for an owner-configured preview deployment. `verify:profile` checks that `b` and `main` use public routing. Preview uses a fail-closed signed-token Worker with every asset routed first through authentication. The owner fills non-secret Access identifiers in the private template and its matching deployment configuration. Public deployment scripts explicitly reject preview output.

CI runs on `b`/`main` pushes and all pull requests. Both public and preview editions receive documentation, profile, smoke, Jest, optimized build/artifact, deployment dry-run and pinned Chromium/WebKit checks, including visible-defect evidence. Default public artifacts upload as `minified-web-app`; explicitly built preview artifacts upload as `private-preview-web-app`. The stable `screenshots` aggregate requires both edition jobs. Downloadable expected/actual/difference images remain available; normal CI never accepts baselines.

## Required GitHub protection

In [branch settings](https://github.com/matosaru/dryfire/settings/branches), protect **main**:

1. Require a pull request. Zero mandatory approvals is appropriate for a solo maintainer; the PR and passing checks still apply.
2. Require `validate` and `screenshots` from **Test and build**, and require the branch to be up to date.
3. Require resolved conversations; disallow bypass, force pushes and deletion.

[branch-protection.json](branch-protection.json) is the prepared REST payload for `main` only. It does not activate server rules. Keep CI and no-force-push controls on `b` as appropriate. Server settings remain separately owner-verified.

```bash
gh api --method PUT repos/matosaru/dryfire/branches/main/protection --input docs/project/branch-protection.json
gh api repos/matosaru/dryfire/branches/main/protection
```

## Development and production deployment

The user will reconfigure Cloudflare. No live deploy, Access change, credentials or domain binding is part of this code delivery. Use one authoritative deployment path; configure external Git Builds to follow the same tested-commit gates if used instead of Actions.

| Git branch / deployment | Cloudflare setup prepared for the owner | Commands |
| --- | --- | --- |
| `b` | Separate public Free pre-production Worker; the existing Wrangler `dev` environment uses `dryfire-dev` and may be renamed by the owner | `npm run build`; `npm run deploy:development` |
| `main` | Public Free production Worker `dryfire` | `npm run build`; `npm run deploy:production` |
| Isolated preview build | Optional private preview Worker `dev-dryfire`, protected by the configured Access allowlist | `npm run build:preview`; `npm run deploy:private-preview` |

The opt-in [Actions deployment workflow](../../.github/workflows/deploy.yml) accepts only successful same-repository `b`/`main` push runs, downloads the exact public artifact, verifies edition/revision/profile and skips superseded commits. `b` maps to GitHub environment `development`; `main` maps to `production`. It deploys only public output. Keep it disabled unless the owner deliberately selects it by setting `CLOUDFLARE_DEPLOYMENTS_ENABLED=true`, scoped deployment secrets and a production reviewer. Private preview deployment remains separately owner-configured.

[Private preview setup](../development/private-preview-deployment.md) explains Access team domain/AUD, all-path protection and live authorization checks. The optional preview deployment must fail closed until configured. Separate origins have separate local IndexedDB data; moving domains requires explicit export/import. Current production origin remains `https://dryfire.matosaru.workers.dev/`.

## Release and rollback

Tag the exact verified production commit after release. Record its PR, CI, Worker deployment/version and data-format implications. Roll back to a known-good Worker version when necessary, then follow with a checked `b` → `main` fix PR. Never rewrite `main` or delete browser data. Schema 3 / backup format 4 stay unchanged.

Publication, PR merge, server enforcement, Cloudflare deployment and physical-device validation are separate facts in [the delivery tracker](implementation-history.md).

## CHG-056 pre-merge acceptance

Check the entire application candidate before promoting it to `main`: unit/coverage, integration, public/preview builds/artifact verification, pinned Chromium/WebKit screenshot suites and the unchanged performance gate. Focused checks are useful during development but are insufficient for merge acceptance. Pending/cancelled/failing checks block the merge. `b` is the only pre-production Git branch; promotion to `main` uses the protected PR process.

For an unmerged worktree lacking local pinned browsers, commit a review-only patch below `docs/design/review-inputs/` and run `Test and build` via workflow_dispatch with `candidate_patch` set to its repository-relative path. The existing gates apply the patch only to the candidate root checkout, never the immutable performance baseline. Record the exact patch hash/run, resolve all failures, then apply/publish that accepted application candidate. A patch does not prove that a later differing candidate passed. Standard post-push CI remains enabled.
