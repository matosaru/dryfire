# Current designs

CHG-035 adds private-only Free/Full Settings simulation, with a visible mode indicator and protected online asset boundary. CHG-032 adds public/full build editions; shared current captures use public unless a state is explicitly preview-only. CHG-033 retains the five bottom tabs on About/Contact in both themes/editions. Requirements and exact capture/CI status are in the delivery tracker.

Visual package for Dry Fire With Ease. [Functional requirements](../requirements/README.md) own behavior; [approval history](../project/approval-log.md) records authorization; [delivery plan](../project/implementation-history.md) owns implementation/publication status.

CHG-031 corrects the Dark About/Contact footer controls to pure white (`#FFFFFF`) for stronger contrast. Their centered layout, underline/focus, size and divider remain; Light controls and disclosure colors retain their previous values. Current review/publication is recorded in the delivery tracker.

CHG-030 makes primary text pure white (`#FFFFFF`) in resolved Dark mode across all screens and neutral control labels/values. Light and secondary/disclosure/accent palettes remain; CHG-031 separately makes the Dark footer controls white. Affected Dark captures and pinned references are refreshed under the [shared typography requirements](screens/shared/README.md); review/publication status is in the delivery tracker.

CHG-029 separates About and Contact into two pages, reached by centered separate links in the shared footer (CHG-031: white in Dark, footer-matching in Light), independently of Settings. Arrows are removed; font/underline/focus are preserved and a divider separates links from the disclosure. Earlier combined-entry and [Settings placement previews](proposals/about-link-placement/README.md) are superseded.

CHG-026 prepares [future Contact/SEO/account/Free-Pro/preview design scope](../requirements/web-commercial.md), with implementation explicitly paused. CHG-027 is the later direct request to create [About](screens/about/README.md) and [Contact](screens/contact/README.md) on a separate feature branch, with proposed copy for review. Other commercial/SEO/account work remains planning only.

Current references below are actual production-build captures. CHG-029 separates Contact and refreshes the footer across the app. Twelve functional screens, all six Practice configurations, early-trigger Review, the inline custom editor and shared safety modal have references. Fixture statistics and gun names are examples. The [shared layout](screens/shared/README.md) and BRAND-06 apply to every screen; prior captures are archived. Exact reviewed-source hashes are in the registry.

## File naming and ownership

- Current screen text: `screens/<screen>/README.md`.
- Current screenshots: `screens/<screen>/<state>.<theme>.png`, lowercase kebab case; themes `dark` and `light`. `configure-single.dark.png` identifies a mode-specific form. Shared modal: `screens/shared/safety-modal.dark.png`.
- Earlier reviewed evidence: `archive/chg-NNN/<screen>/<state>.png`. Older filenames without theme suffixes retain their historical meaning and cannot be used as current captures.
- Source artwork stays in `public/`; the canonical monogram is [logo.svg](../../public/logo.svg). [Provenance](originality-and-provenance.md) records origin and limits of evidence.
- Keep one current path per screen/state/theme. Avoid duplicate current indexes/images; retain different historical revisions rather than treating their repetition across releases as duplicate evidence.

## Current screen coverage

<!-- screen-coverage:start -->
| Screen / shared gate | Current layout and captures | Requirements |
| --- | --- | --- |
| Gun setup | [5 state/theme references](screens/gun-setup/README.md) | [gun-profiles](../requirements/gun-profiles.md), [persistence](../requirements/persistence.md), [build-editions](../requirements/build-editions.md) |
| Home | [1 state/theme references](screens/home/README.md) | [core](../requirements/core.md), [branding](../requirements/branding.md), [gun-profiles](../requirements/gun-profiles.md), [about](../requirements/about.md) |
| My Guns | [3 state/theme references](screens/guns/README.md) | [gun-profiles](../requirements/gun-profiles.md), [persistence](../requirements/persistence.md), [build-editions](../requirements/build-editions.md) |
| Learn Sounds | [4 state/theme references](screens/learn/README.md) | [core](../requirements/core.md), [practice-modes](../requirements/practice-modes.md), [practice-improvements](../requirements/practice-improvements.md) |
| Drills | [4 state/theme references](screens/drills/README.md) | [drill-sessions](../requirements/drill-sessions.md), [practice-modes](../requirements/practice-modes.md), [build-editions](../requirements/build-editions.md) |
| Practice | [12 state/theme references](screens/practice/README.md) | [practice-modes](../requirements/practice-modes.md), [practice-improvements](../requirements/practice-improvements.md), [persistence](../requirements/persistence.md), [practice-start](../requirements/practice-start.md) |
| Drill Session | [4 state/theme references](screens/session/README.md) | [drill-sessions](../requirements/drill-sessions.md), [practice-improvements](../requirements/practice-improvements.md), [persistence](../requirements/persistence.md) |
| Live Listen | [2 state/theme references](screens/live-listen/README.md) | [core](../requirements/core.md), [practice-modes](../requirements/practice-modes.md), [practice-improvements](../requirements/practice-improvements.md) |
| History | [7 state/theme references](screens/history/README.md) | [core](../requirements/core.md), [practice-improvements](../requirements/practice-improvements.md), [persistence](../requirements/persistence.md), [build-editions](../requirements/build-editions.md) |
| Settings | [3 state/theme references](screens/settings/README.md) | [settings](../requirements/settings.md), [core](../requirements/core.md), [persistence](../requirements/persistence.md), [about](../requirements/about.md) |
| About | [2 state/theme references](screens/about/README.md) | [about](../requirements/about.md), [core](../requirements/core.md), [branding](../requirements/branding.md), [persistence](../requirements/persistence.md), [build-editions](../requirements/build-editions.md) |
| Contact | [2 state/theme references](screens/contact/README.md) | [contact](../requirements/contact.md), [about](../requirements/about.md), [core](../requirements/core.md), [persistence](../requirements/persistence.md) |
| Safety confirmation | [1 state/theme references](screens/shared/README.md) | [core](../requirements/core.md), [practice-improvements](../requirements/practice-improvements.md) |
<!-- screen-coverage:end -->

This table is generated from the [screen registry](../architecture/screen-map.json). Its [site tree](../architecture/site-tree.md) records entry paths and internal states. Capture links belong to each screen document rather than a flat image dump.

## Historical references and validation

[Archived proposals and reviewed releases](archive/README.md) preserve 85 historical PNGs and original layout notes. They are not current production designs and may show older branding, limits or controls. Immutable approved commit links remain in the approval log.

Markdown and image correspondence was checked against the current controls: ten-per-type new recordings with old profiles preserved; automatic Single countdowns; STOP/microphone placement; comparable History charts/table; once-per-page safety modal; navigation history; per-gun and per-device preferences; Edit with data preservation; illustrated gun types; distinct sound/all-library reset with cancellation and backup recovery. The legacy sequence runner intentionally retains its GO status and separate controls. CHG-018 reorganizes evidence; CHG-019 implements the user-directed edit/selector/reset corrections.

Run `npm run docs:generate` and `npm run docs:check` after a screen change. The checker enforces coverage, source-review fingerprints, paths, local Markdown links and current-image uniqueness; human review must still confirm that changed layouts match the screenshots and approved behavior.

[Keeping screenshots and implementation aligned](visual-validation.md) describes source-aware checks and the CHG-021 per-browser pixel-regression workflow; acceptance evidence is in the delivery tracker.
