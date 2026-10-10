# Design catalog

This is the permanent catalog of Dry Fire design references. Read the linked [requirements](../requirements/README.md) before implementing them. Current image links show the latest published draft; approval belongs to the specific reviewed revision recorded in the [approval log](../requirements/approval-log.md).

| Design | Current visualisation | Specification | Approval state |
| --- | --- | --- | --- |
| First visit, My Guns and selected-gun Home | [View image](multiple-guns-front-door.png) | [Gun profiles](../requirements/gun-profiles.md) | Multi-gun flow approved; not implemented |
| Gun-specific sounds, custom editor and session history | [View image](multiple-guns-sounds-drills-history.png) | [Gun profiles](../requirements/gun-profiles.md), [Drills](../requirements/drill-sessions.md), [Persistence](../requirements/persistence.md) | Multi-gun flow approved; finer session interactions remain proposed |
| Configure, Run and Review | [View image](drill-session-mockup.png) | [Drill sessions](../requirements/drill-sessions.md) | Single sequence explicitly requested; start-sound clarification awaiting confirmation |

## Supporting notes

- [Multi-gun proposal and storage explanation](multiple-guns.md)
- [Drill page proposal and clarified controls](drill-session.md)
- [Previous implemented reference-design update](../../DESIGN_CHANGES.md)

The Markdown specifications are authoritative for behavior. Sample names, times, counts and statuses in images are illustrative. Mockups do not prove that a feature exists or that data is synchronized to a server. When prose and a mockup disagree, record the discrepancy and resolve it through the change process rather than silently choosing a different requirement.

Do not remove approved design history. Revised images must be accompanied by revised specifications and a recorded approval state; use Git's immutable commits to preserve the reviewed version.
