# Branching and release strategy

Revision3.0 · active Free-product phase · directly clarified 2026-10-24. This supersedes the prior automatic b→dev synchronization and Full-branch development workflow for the current phase. Main remains protected/PR-based; Cloudflare setup is owner-managed.

| Branch | Current role | Ownership |
| --- | --- | --- |
| `b` | Active Free-product development and pre-production review | Assistant prepares/tests changes here within approved scope |
| `main` | Stable Free production | Owner merges tested b changes; assistant does not merge or push main unless explicitly instructed |

Dev is outside the active workflow. Do not inspect, update or synchronize it for current work. No paid development or automatic synchronization is needed while finishing the Free product. This workflow change does not alter existing runtime editions, build profiles, saved-data access or deployment configuration.

## Daily changes and releases

1. Work/review on b only for approved Free-product improvements and fixes; no feature branch is required.
2. Complete the required unit/coverage, integration, both-edition build/artifact, pinned browser/visual and unchanged performance acceptance before application publication.
3. Commit/push to b only when authorized. The owner handles b→main releases through the protected release process. Do not claim an announced owner merge has occurred without evidence; do not inspect other branches unless later requested.
4. Keep changes reversible, preserve user data and avoid force-pushing or rewriting shared history. Cloudflare configuration remains owner-managed.

## Commercial work after Free completion

After the owner finishes the Free version in b/main, revisit monetization principles, desired functionality, business model, application/service structure and necessary technical solutions in a separate planning iteration. Prior Pro/cloud/billing proposals are inputs for reassessment, not automatic implementation instructions. [Commercial roadmap](web-commercial-plan.md) and [current modularization plan](react-refactor/follow-up-plan.md) record this sequence. Native releases remain deferred.

## Existing build/artifact compatibility reference

The following describes retained implementation compatibility, not authorization to resume work on an inactive branch or implement paid functionality.


`build-profile.json` is the committed branch default. `npm run dev`, `npm run build` and `npm run verify:dist` follow it. `npm run build:public` and `npm run build:preview` explicitly select an alternate edition for isolated review; `APP_EDITION` is also validated. Unknown values fail closed. A build's `edition.json` identifies its edition, checkout revision, source digest and complete bundle assets.

`wrangler.jsonc` must match the appropriate prepared template: [public](../../wrangler.public.jsonc) on b/main; [private](../../wrangler.private-preview.jsonc) on dev. `verify:profile` checks routing and the CI target branch. Preview uses a fail-closed signed-token Worker with every asset routed first through authentication. The owner fills the non-secret Access identifiers in both private template and dev default configuration together. Public deployment scripts explicitly reject preview output.

CI runs on b/main/dev pushes and PRs. Every branch runs documentation, profile, smoke, Jest, optimized build/artifact validation, public/private dry runs and both editions' Chromium/WebKit checks, including visible-defect evidence. Default Free artifacts upload as `minified-web-app`; default Full artifacts as `private-preview-web-app`. The stable `screenshots` aggregate requires both edition jobs. Downloadable expected/actual/difference images remain available; normal CI never accepts baselines.

## Required GitHub protection

In [branch settings](https://github.com/matosaru/dryfire/settings/branches), protect **main**:

1. Require a pull request. Zero mandatory approvals is appropriate for a solo maintainer; the PR and passing checks still apply.
2. Require `validate` and `screenshots` from **Test and build**, and require the branch to be up to date.
3. Require resolved conversations; disallow bypass, force pushes and deletion.

[branch-protection.json](branch-protection.json) is the prepared REST payload for main only. It does not activate server rules. b/dev accept the requested direct commits; remove any obsolete dev rule requiring feature PRs while retaining CI/no-force-push controls as appropriate. Server settings remain separately owner-verified.

```bash
gh api --method PUT repos/matosaru/dryfire/branches/main/protection --input docs/project/branch-protection.json
gh api repos/matosaru/dryfire/branches/main/protection
```

## Development and production deployment

The user will reconfigure Cloudflare. No live deploy, Access change, credentials or domain binding is part of this code delivery. Use one authoritative deployment path; configure external Git Builds to follow the same tested-commit gates if used instead of Actions.

| Branch | Cloudflare setup prepared for the owner | Commands |
| --- | --- | --- |
| b | Separate Free pre-production Worker; existing public template's `dev` environment uses `dryfire-dev`, which the owner may rename | `npm run build`; `npm run deploy:development` |
| main | Free production Worker `dryfire` | `npm run build`; `npm run deploy:production` |
| dev | Private complete preview Worker `dev-dryfire`, Access allowlist `matosaru@gmail.com` | `npm run build`; `npm run deploy:private-preview` |

The opt-in [Actions deployment workflow](../../.github/workflows/deploy.yml) accepts only successful same-repository b/main push runs, downloads the exact Free artifact, verifies edition/revision/profile and skips superseded commits. b maps to GitHub environment `development`, main to `production`. It cannot publish dev's Full artifact. Keep it disabled unless the owner deliberately selects it by setting `CLOUDFLARE_DEPLOYMENTS_ENABLED=true`, scoped deployment secrets and a production reviewer. No private deployment automation is enabled.

[Private preview setup](../development/private-preview-deployment.md) explains Access team domain/AUD, all-path protection and live authorization checks. The dev default configuration deliberately serves no assets until configured. Separate origins have separate local IndexedDB data; moving domains requires explicit export/import. Current production origin remains `https://dryfire.matosaru.workers.dev/`.

## Release and rollback

Tag the exact verified production commit after release. Record its PR, CI, Worker deployment/version and data-format implications. Roll back to a known-good Worker version when necessary, then follow with a checked b → main fix PR. Never rewrite main or delete browser data. Schema 3 / backup format 4 stay unchanged.

Publication, PR merge, server enforcement, Cloudflare deployment and physical-device validation are separate facts in [the delivery tracker](implementation-history.md).

## CHG-056 pre-merge acceptance

Check the entire application candidate before merging/promoting into any branch: unit/coverage, integration, public/preview builds/artifact verification, pinned Chromium/WebKit screenshot suites and the unchanged performance gate. Focused checks are useful during development but are insufficient for merge acceptance. Pending/cancelled/failing checks block the merge. Keep the current b-only/main-dev freeze instruction until the owner changes it.

For an unmerged worktree lacking local pinned browsers, commit a review-only patch below `docs/design/review-inputs/` and run `Test and build` via workflow_dispatch with `candidate_patch` set to its repository-relative path. The existing gates apply the patch only to the candidate root checkout, never the immutable performance baseline. Record the exact patch hash/run, resolve all failures, then apply/publish that accepted application candidate. A patch does not prove that a later differing candidate passed. Standard post-push CI remains enabled.
