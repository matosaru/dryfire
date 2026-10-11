# Branching and release strategy

CHG-025 · revision 1.0 · directly requested on 2026-10-11. This supersedes earlier direct-main/no-PR publication rules.

| Branch | Purpose | Changes enter through | Deployment |
| --- | --- | --- | --- |
| `main` | Stable production code | Reviewed `dev` release PR or urgent `hotfix/*` PR; required CI | Production Worker `dryfire`, after deployment approval |
| `dev` | Integration and staging | `feature/*` PR; `main` synchronization PR after a hotfix | Development Worker `dryfire-dev` |
| `feature/*` | Features and routine fixes, based on `dev` | Commit/push the feature branch; PR to `dev` | CI; optional previews |
| `hotfix/*` | Urgent production fixes, based on `main` | PR to `main`, then synchronize `main` to `dev` by PR | Production through the same checks/approval gate |

New work stays on feature branches until its PR passes CI. Release promotion uses `dev` → `main`; the user owns release review/merge. Never push commits directly to `main`, including from automation or an administrator. Keep long-lived branches synchronized through merges, preserving history; no force pushes. Delete merged feature/hotfix branches when no longer needed.

## Required GitHub protection

Open [repository branch settings](https://github.com/matosaru/dryfire/settings/branches) and add a classic protection rule matching **`main`**:

1. Enable **Require a pull request before merging**. Leave required approvals at **0** for this solo-maintainer repository; the PR and passing checks remain mandatory, and the owner can merge their own reviewed PR.
2. Enable **Require status checks to pass before merging** and **Require branches to be up to date before merging**. Select the GitHub Actions checks **`validate`** and **`screenshots`** from the **Test and build** workflow.
3. Enable **Require conversation resolution before merging** and **Do not allow bypassing the above settings** (including administrators).
4. Leave force pushes and branch deletion disabled. Save the rule. Verify its target is exactly `main` and that no actor can bypass it.

Apply the same rule to `dev` to enforce the feature-PR integration path. Zero mandatory reviewer approvals avoids locking a sole maintainer out of their own PRs. Add independent required reviews later if the team grows.

[branch-protection.json](branch-protection.json) is the equivalent REST payload. A repository administrator with GitHub API access can apply it separately to each branch:

```bash
gh api --method PUT repos/matosaru/dryfire/branches/main/protection --input docs/project/branch-protection.json
gh api --method PUT repos/matosaru/dryfire/branches/dev/protection --input docs/project/branch-protection.json
gh api repos/matosaru/dryfire/branches/main/protection
gh api repos/matosaru/dryfire/branches/dev/protection
```

A file in Git does not activate server protection. Workspace requests to `api.github.com` currently return `Forbidden`; activation/verification requires owner settings access. Do not test enforcement by pushing a disposable commit to production.

## Development and production deployment

The opt-in [Cloudflare deployment workflow](../../.github/workflows/deploy.yml) deploys the `minified-web-app` artifact from the exact successful **Test and build** push run. It accepts only same-repository `main`/`dev` push runs, and skips stale commits. Feature/PR checks never receive deployment credentials.

- `dev` → GitHub environment **development** → Wrangler environment `dev` → Worker **dryfire-dev**.
- `main` → GitHub environment **production** → existing Worker **dryfire**. Configure a required deployment reviewer for this environment.
- The existing production address is `https://dryfire.matosaru.workers.dev/`. The expected staging address, once deployed in that account, is `https://dryfire-dev.matosaru.workers.dev/`; it is not yet verified. Separate origins keep staging and production IndexedDB libraries independent.

Owner setup before enabling deployments:

1. Create GitHub environments **development** and **production** under repository Settings → Environments. Limit development to `dev`, production to `main`. Add the production required reviewer; allow the sole maintainer to approve their own deployment if necessary.
2. Set environment secrets **CLOUDFLARE_API_TOKEN** and **CLOUDFLARE_ACCOUNT_ID**. Use Cloudflare Workers deployment permissions for the intended account; never commit credentials.
3. Disable the existing Cloudflare Workers Git automatic deployment path before enabling this workflow. Otherwise those builds can deploy independently of the GitHub approval gate. Use one authoritative deployment path.
4. Enable repository Actions variable **CLOUDFLARE_DEPLOYMENTS_ENABLED=true** only after protections, secrets and the production reviewer are configured.
5. Merge the policy PRs so the deployment workflow exists on the default `main` branch, then complete/re-run the latest `dev` push CI to start staging deployment. Observe successful development deployment before approving a production deployment. Record the tested/deployed commit, Worker version and URL.

Until the variable is enabled, deployment jobs are skipped. Configuration preparation is not deployment, domain binding or enforcement evidence. Domain registration/custom routing and physical iPhone verification remain separate in [DEPLOY.md](../development/DEPLOY.md).

## Release and rollback

Create an annotated `vX.Y.Z` release tag for the exact verified production commit, rather than for an untested branch tip. Record its CI run, Worker deployment/version and any data-format implications. For an urgent rollback, restore the known-good Worker version in Cloudflare and record the tag/commit; follow with a tested hotfix PR so repository history matches the restored release. Avoid rewriting `main` history or deleting browser data. Existing schema 3 / backup 4 remain unchanged by this policy.

## Acceptance and ownership

- Feature/hotfix pushes and PRs run source/build/documentation and Chromium/WebKit checks.
- Server rules block direct pushes and merging red/outdated PRs to protected branches.
- Development and production use distinct Workers, tested artifacts and explicit GitHub environments.
- Production deployment waits for the configured reviewer; stale/failed CI runs cannot deploy.
- No production credentials, domains or data are changed by preparation of this package.
- CI/publication, actual GitHub enforcement and Cloudflare/device verification are recorded separately in [the delivery tracker](implementation-history.md).
