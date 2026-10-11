# Documentation packages

Each topic has one authoritative home. A package here is a documentation directory, not a separately installed application dependency.

| Package | Owns |
| --- | --- |
| [requirements](requirements/README.md) | Current functional behavior, stable IDs, approved bounds and acceptance criteria |
| [design](design/README.md) | Current screen/state layouts and screenshots; archived reviewed visual revisions; asset provenance |
| [architecture](architecture/README.md) | App screen/state registry, generated site tree and maintenance checks |
| [development](development/README.md) | Setup, tests, deployment and device validation |
| [project](project/README.md) | Append-only approval evidence, change process, implementation history and next steps |
| [business](business/README.md) | Proposed monetization, tiers, pricing and payment/entitlement work |
| [seo](seo/README.md) | Indexing audit, recommended copy, prepared templates and proposed rollout |

Start with the [current plan](project/implementation-history.md), then read the relevant requirements and linked screen designs. Historical proposals are retained for evidence and cannot override current requirements. Publication, local tests, Cloudflare deployment and physical-device validation are separate states.

CHG-018 explicitly replaces the earlier instruction to put every topic under `docs/design/`. The previous single-purpose requirement indexes were consolidated; designs now use `screens/<screen>/<state>.<theme>.png`. External immutable historical commit links remain unchanged even when their current files move.

Before publishing documentation, run `npm run docs:generate` and `npm run docs:check`. See [maintenance](architecture/README.md) for what changes require updated screen evidence.
