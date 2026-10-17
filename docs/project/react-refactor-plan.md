# React refactor roadmap entry point

The active CHG-048 review package is:

- [spec.md](react-refactor/spec.md): current structure, actual article analysis, invariants, measured test gaps and performance contract.
- [plan.md](react-refactor/plan.md): remaining stages, characterization-first gates, visual/unit/integration testing and release/rollback rules.

The owner explicitly requests reviewing this plan before further implementation. The first CHG-047 increment (workspaces, React About/Contact and shared heading/card packages) is already released in PR #24; the shared shell and eleven remaining screen interiors are still legacy-owned. No additional migration is approved by publishing these documents.

The earlier [CHG-046/047 roadmap at release #24](https://github.com/matosaru/dryfire/blob/6c38bff81662d30279d94d41ca5c949bdbbe1c6e/docs/project/react-refactor-plan.md) remains historical evidence, rather than a second active plan. Its article-access blocker is resolved: the requested article was read on 2026-10-17. Use the current specification for the measured coverage gaps and performance risks.

[Current architecture](../architecture/react-migration.md) · [delivery history](implementation-history.md) · [approval evidence](approval-log.md).
