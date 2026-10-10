# Designs and project documentation

This is the permanent catalog of Dry Fire With Ease design references. Read the linked [requirements](requirements/README.md) before implementing them. Current image links show the latest published draft; approval belongs to the specific reviewed revision recorded in the [approval log](requirements/approval-log.md).

| Design | Current visualisation | Specification | Approval state |
| --- | --- | --- | --- |
| Dry Fire With Ease logo lockup | [Actual header](brand-lockup.png), [Home](branding-preview.png) | [Branding](requirements/branding.md) | Approved in CHG-011; implemented and locally validated; deployment not verified |
| First visit, My Guns and selected-gun Home | [View image](multiple-guns-front-door.png) | [Gun profiles](requirements/gun-profiles.md) | Multi-gun flow approved; not implemented |
| Gun-specific sounds, custom editor and session history | [View image](multiple-guns-sounds-drills-history.png) | [Gun profiles](requirements/gun-profiles.md), [Drills](requirements/drill-sessions.md), [Persistence](requirements/persistence.md) | Multi-gun flow approved; finer session interactions remain proposed |
| Configure, Run and Review | [View image](drill-session-mockup.png) | [Drill sessions](requirements/drill-sessions.md) | Single sequence requested; Sound at start approved; remaining session details in review |

## Supporting notes

- [Multi-gun proposal and storage explanation](multiple-guns.md)
- [Drill page proposal and clarified controls](drill-session.md)
- [Previous implemented reference-design update](development/DESIGN_CHANGES.md)

The Markdown specifications are authoritative for behavior. Sample names, times, counts and statuses in images are illustrative. Mockups do not prove that a feature exists or that data is synchronized to a server. When prose and a mockup disagree, record the discrepancy and resolve it through the change process rather than silently choosing a different requirement.

The saved flow mockups retain their reviewed older Dry Fire / Sound Trainer lockups. CHG-011 approves **Dry Fire With Ease** for current production branding; those snapshots remain evidence of their reviewed flow, not the latest production wordmark. Generated monogram variants in them are illustrative.

Do not remove approved design history. Revised images must be accompanied by revised specifications and a recorded approval state; use Git's immutable commits to preserve the reviewed version.

## Specifications and development guides

- [Requirements overview](requirements/OVERVIEW.md) and [specification index](requirements/README.md)
- [Approval history](requirements/approval-log.md) and [change process](requirements/change-process.md)
- [Originality and asset provenance](originality-and-provenance.md)
- [Development guide](development/README.md) and [agent instructions](development/AGENTS.md)
- [Cloudflare deployment](development/DEPLOY.md) and [Netlify deployment](development/NETLIFY_DEPLOY.md)
- [iPhone installation](development/INSTALL_ON_IPHONE.md) and [device accuracy testing](development/ACCURACY_TESTING.md)
- [Changelog](development/CHANGELOG.md), [historical engineering review](development/REVIEW.md) and [historical handoff](development/CODEX_HANDOFF.md)

All full project documentation is stored in this folder and its subfolders. The repository-root README, AGENTS and REQUIREMENTS files are short entry-point links for GitHub visitors, agents and existing bookmarks.
