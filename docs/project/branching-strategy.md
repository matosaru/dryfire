# Branching and release strategy

CHG-036 · revision 2.0 · directly requested 2026-10-12. This replaces CHG-025 feature → dev → main. The main PR requirement remains. Cloudflare setup and deployment are owner-managed.

| Branch | App functionality | Changes enter through | Default build / routing |
| --- | --- | --- | --- |
| `b` | Free pre-production: two new guns, basic practice, saved text results and legacy-data access | Direct Free feature/fix commits; no feature branch required | `public`; public assets |
| `main` | Stable Free production | Tested `b` → `main` PR | `public`; public assets |
| `dev` | Complete app: Free improvements plus Full-only functionality | Merge Free changes from `b`; direct Full-only commits | `preview`; signed Access asset gate |

`dev` contains the complete feature set. Its private **Test as Free / Full** simulation defaults to Free and remembers a valid private preference; choose Full in Settings to test all five-gun/custom/graph functionality. This does not change the build identity. Public output contains no switch or override implementation.

## Daily changes and synchronization

1. Work on `b` for Free features/fixes. Run the required checks, commit and push directly there.
2. Synchronize tested Free improvements **b → dev**, retaining dev's Full-only additions, `build-profile.json` (`preview`) and private `wrangler.jsonc`. If either configuration conflicts, resolve it to the destination branch's profile; never accept the Free routing into dev blindly. Run `npm run verify:profile -- --branch=dev` and CI after the merge.
3. Work directly on `dev` for Full-only features/fixes. Bring a shared fix into b deliberately as a reviewed small change; do not release dev wholesale into b/main.
4. Release the tested Free code by **b → main PR**, with passing `validate` and `screenshots`. Never push main directly or bypass its protection. Synchronize main's merge ancestry back to b, then b → dev, retaining dev's profile.

No force pushes, rebases of shared branch history or required feature branches. Urgent Free fixes follow b → main PR as well. All saved data remains compatible. Optional source retained in Free branches supports existing-preset editing and both-edition regression tests; official Free artifacts exclude new Full functionality. Future Full-only development stays on dev.

## Build and artifact contract

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
