# Requirements and design change process

Revision: 1.1 · Approved by the user's request to keep designs/specifications sticky and changed requirements documented and approved.

CHG-018 separates full documentation into packages under `docs/`: functional requirements in `docs/requirements/`, visual layouts in `docs/design/`, architecture in `docs/architecture/`, development in `docs/development/`, delivery/approvals here in `docs/project/`, and prepared indexing work in `docs/seo/`. Root files provide entry links. Keep provenance records current when artwork or branding changes.

## Before implementation

1. Read [REQUIREMENTS.md](../requirements/README.md), the relevant specifications, approval log and linked designs.
2. Classify the work. A fix that restores approved behavior does not create a new product requirement. Changes to scope, user-visible behavior, data ownership, retention or defaults do.
3. Write a concrete change in Markdown before implementing a new requirement. Give it a change ID, affected requirement IDs, revised document version, before/after behavior, acceptance criteria and related designs.
4. If the UI changes, update its design or record why no visual update is needed. Keep existing approved assets accessible in Git history and link an immutable commit to the reviewed revision.
5. Record approval evidence. A specific user instruction authorizing the changed behavior is valid evidence; reuse approvals already given. Do not infer approval from silence, elapsed time, a successful push, a generated image, or a request to upload an image.
6. For an assistant-proposed scope change without approval, present the concrete revised specification/design and obtain user approval before implementing that change. Continue independent work within already approved scope.
7. After approval, mark the exact IDs/revision approved and append the evidence to [approval-log.md](approval-log.md). A later revision does not inherit approval for changed behavior automatically.

## During and after implementation

- Preserve approved behavior and saved user data; document any migration and recovery strategy.
- Add meaningful regression checks for new behavior and execute relevant repository/functional checks.
- Record implementation and validation separately from approval. Keep **partial**, **not implemented**, and **implemented** accurate.
- Update the specification, design catalog and approval log in the same change when they are affected. Avoid conflicting instructions scattered across handoff files.
- Report exactly what was saved, pushed, deployed and verified. Approval is not proof of implementation or deployment.

## Change record template

```markdown
### CHG-NNN — Short description

- Date:
- Affected requirement IDs and document revision:
- Previous behavior:
- Proposed behavior:
- Design links (including immutable reviewed commit):
- Acceptance criteria:
- Approval state: Proposed / Requested / Approved / Deferred
- Approval evidence: exact user instruction or explicit approval; otherwise Pending
- Implementation state and validation:
```

Approval logs are append-only. Correct an inaccurate entry through a new correction entry instead of silently rewriting the historical evidence.

## Screen and architecture maintenance

For every screen, state, navigation, visible-control or default change, update the corresponding functional specification and screen Markdown/captures. Review `docs/architecture/screen-map.json`, refresh its reviewed-source fingerprints only after reviewing affected screens, and run `npm run docs:generate` followed by `npm run docs:check`. Regeneration updates the tree/catalog from the registry; it does not establish design approval or prove screenshot accuracy. See [the maintenance procedure](../architecture/README.md).

Keep one current screenshot path per screen/state/theme, and move superseded revisions to the change-numbered archive if needed. Retain immutable reviewed links. Do not keep duplicate current indexes or byte-identical current images. Document shared modals and inline editors as states rather than fabricated public URLs.

## Branch publication policy

CHG-025 supersedes the earlier direct-main/no-PR policy. Follow [branching-strategy.md](branching-strategy.md): `feature/*` → PR to `dev` → reviewed release PR to `main`; urgent `hotfix/*` → PR to `main` → synchronization PR to `dev`. The user owns production promotion. Require `validate`/`screenshots` and current base branches. Never push directly to `main`, bypass checks, or assume a policy JSON file enables GitHub enforcement. The deployment workflow stays opt-in until the owner configures secrets, environments and the production reviewer. Record actual tested, published and deployed commits separately.
