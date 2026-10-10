# Requirements index

Revision: 1.2 · Recorded: 2026-10-10

Start at the [requirements overview](OVERVIEW.md). This directory separates required behavior, proposed details, approvals and implementation status.

Read the [implementation history and remaining plan](../implementation-history.md) for delivered scope and the remaining work after each request.

| File | Purpose |
| --- | --- |
| [core.md](core.md) | Preserve the application's existing behavior and data |
| [branding.md](branding.md) | Approved Dry Fire With Ease name, logo lockup and compatible display-name update |
| [gun-profiles.md](gun-profiles.md) | Approved multi-gun scope and flow |
| [drill-sessions.md](drill-sessions.md) | Requested drill-session behavior and proposed interactions |
| [persistence.md](persistence.md) | Data durability, ownership, migration and backup requirements |
| [settings.md](settings.md) | Requested browser-backed preferences |
| [approval-log.md](approval-log.md) | Approval evidence and changes requiring confirmation |
| [change-process.md](change-process.md) | How specifications and designs stay synchronized |

## Status vocabulary

- **Existing:** current application behavior that must be preserved.
- **Approved:** supported by explicit user approval or a specific user instruction; evidence is recorded.
- **Requested:** the user specified the feature, but finer design choices remain open.
- **Proposed:** an assistant suggestion awaiting approval before implementation.
- **Deferred:** deliberately excluded from the current iteration.

Track implementation separately as **not implemented**, **partial**, or **implemented**, with validation evidence. These labels do not establish publication, deployment, or device verification.

Requirement IDs are stable. Change the document revision and append an approval-log entry when the behavior changes; do not recycle IDs or rewrite old approval evidence.
