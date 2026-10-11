# Repository instructions

Read the repository-wide [agent instructions](docs/development/AGENTS.md), [functional requirements](docs/requirements/README.md), [approval log](docs/project/approval-log.md) and [design catalog](docs/design/README.md) before work. Preserve saved user data and reuse existing explicit approvals.

Full documentation belongs in the appropriate package under `docs/`; the [documentation index](docs/README.md) defines ownership. CHG-018 supersedes the older all-under-`docs/design/` rule.

For a screen, state, navigation or visible-control change, update its requirement/design, review the [screen registry](docs/architecture/screen-map.json), then run `npm run docs:generate` and `npm run docs:check`. Follow the [maintenance procedure](docs/architecture/README.md). Keep the implementation history current after every request; do not equate publication with deployment.

CHG-024: new work is published to the existing `dev` branch first, as directly requested on 2026-10-11. Run CI there and leave `main` for an explicitly requested promotion. This supersedes the earlier direct-main workflow for subsequent work; no PR is required unless the user requests one.
