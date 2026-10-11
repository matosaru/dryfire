# Repository instructions

Read the repository-wide [agent instructions](docs/development/AGENTS.md), [functional requirements](docs/requirements/README.md), [approval log](docs/project/approval-log.md) and [design catalog](docs/design/README.md) before work. Preserve saved user data and reuse existing explicit approvals.

Full documentation belongs in the appropriate package under `docs/`; the [documentation index](docs/README.md) defines ownership. CHG-018 supersedes the older all-under-`docs/design/` rule.

For a screen, state, navigation or visible-control change, update its requirement/design, review the [screen registry](docs/architecture/screen-map.json), then run `npm run docs:generate` and `npm run docs:check`. Follow the [maintenance procedure](docs/architecture/README.md). Keep the implementation history current after every request; do not equate publication with deployment.

CHG-025: use [the branching strategy](docs/project/branching-strategy.md). Create `feature/*` from `dev`, push and validate it, then use a PR into `dev`. Release through a reviewed `dev` → `main` PR; the user owns production promotion. Urgent `hotfix/*` starts from `main`, uses a PR to `main`, then synchronizes back to `dev`. Never push directly to `main`. This supersedes earlier no-PR/direct-main instructions. Preserve CI gates and distinguish prepared protection/deployment configuration from settings actually activated in GitHub/Cloudflare.

CHG-026 currently authorizes [plans/research only](docs/project/web-commercial-plan.md), committed to a feature branch. The user explicitly says not to start implementations; wait for a later implementation instruction. Native apps are deferred. Price/paid allocation/providers/data policies and public-Free/private-preview gates remain proposals; existing free features and saved data stay intact. Country/market: Lithuania/Europe. Public Contact address: easydryfire@gmail.com.

CHG-027 is the later, specific instruction to start [About and email contact](docs/requirements/about.md) on a separate feature branch from `dev`. Implement that slice with suggested copy for review; the broader CHG-026 implementation pause remains in force.
