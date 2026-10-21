# Site and screen tree

Generated from [screen-map.json](screen-map.json). Reviewed 2026-10-21; application source baseline `98e4bbd`, with CHG-017 / CHG-019 / CHG-020 / CHG-021 / CHG-022 / CHG-023 / CHG-027 About and email contact / CHG-028 independent About footer link / CHG-029 separate About/Contact and centered footer / CHG-030 pure white Dark primary text / CHG-031 white Dark About/Contact controls / CHG-032 / CHG-033 / CHG-034 / CHG-035 / CHG-036 / CHG-037 / CHG-041 / CHG-044 / CHG-045 / CHG-047 / CHG-049 P1 route ownership extraction (no visual change) / CHG-049 static practice catalog prerender (unchanged final UI) / CHG-049 P2 shared chrome and static controls (unchanged final UI) documented changes and exact reviewed-source fingerprints in the registry. Regenerate with `npm run docs:generate`.

## Public site

Canonical production origin: `https://dryfire.matosaru.workers.dev/`. **One implemented public path: `/`.** The app states below use the same URL and browser history; they are not separate public pages or sitemap entries. Draft robots/sitemap/metadata live in the [SEO proposal](../seo/README.md) and are not deployed.

## App hierarchy

```text
/
├── First-use gate
│   └── Gun setup [gunSetup]
├── Home [home]
│   ├── My Guns [guns]
│   ├── Learn Sounds [learn]
│   ├── Drills [drills]
│   │   ├── Practice [practice]
│   │   ├── Drill Session [session]
│   │   └── About this practice [practiceGuide]
│   ├── Live Listen [recognize]
│   ├── History [history]
│   ├── Settings [settings]
│   ├── About [about]
│   └── Contact [contact]
└── Shared capture gate
    └── Safety confirmation dialog
```

Registry edition labels identify public-only and full-preview-only states; shared current images use public, and browser references test both editions. About and Contact retain the shared five-item bottom navigation.

The tree describes primary destinations, not a restriction on Back/Forward. About and Contact open separate screens from centered shared-footer controls, including before gun setup; Back returns to the visited screen. Settings is accessible from the common branded header on every screen; My Guns links to the shared add/edit form and backup/restore. History opens Practice or Drill Session review. Missing required sounds link to Learn. Gun Setup can also be reached from My Guns after first use.

## Functional screens and states

| Screen / shared gate | App anchor | Entry path | Captured states | Visual layout | Functional specifications |
| --- | --- | --- | --- | --- | --- |
| Gun setup | `gunSetupView` | First visit without a gun; Add/Edit from My Guns | `first-gun.dark`, `add-second-gun.dark` (public), `add-gun.dark` (preview), `edit-gun.dark`, `edit-gun.light` | [Design](../design/screens/gun-setup/README.md) | [gun-profiles](../requirements/gun-profiles.md), [persistence](../requirements/persistence.md), [build-editions](../requirements/build-editions.md), [page-layout](../requirements/page-layout.md) |
| Home | `homeView` | After gun selection/setup and returning visits | `overview.dark` | [Design](../design/screens/home/README.md) | [core](../requirements/core.md), [branding](../requirements/branding.md), [gun-profiles](../requirements/gun-profiles.md), [about](../requirements/about.md), [page-layout](../requirements/page-layout.md) |
| My Guns | `gunsView` | Active-gun switcher | `library.dark`, `library.light`, `deleted.dark` | [Design](../design/screens/guns/README.md) | [gun-profiles](../requirements/gun-profiles.md), [persistence](../requirements/persistence.md), [build-editions](../requirements/build-editions.md), [page-layout](../requirements/page-layout.md) |
| Learn Sounds | `learnView` | Learn tab, Home card or missing-sound link | `overview.dark`, `optional-sounds.dark`, `calibration.dark`, `recording-limit.dark` | [Design](../design/screens/learn/README.md) | [core](../requirements/core.md), [practice-modes](../requirements/practice-modes.md), [practice-improvements](../requirements/practice-improvements.md), [page-layout](../requirements/page-layout.md) |
| Drills | `drillsView` | Drills tab, Home card or review completion | `catalog.dark`, `custom.dark`, `custom-editor.dark` (preview), `edit-custom.dark` (public) | [Design](../design/screens/drills/README.md) | [drill-sessions](../requirements/drill-sessions.md), [practice-modes](../requirements/practice-modes.md), [build-editions](../requirements/build-editions.md), [page-layout](../requirements/page-layout.md) |
| Practice | `practiceView` | Six mode cards or saved practice review in History | `configure-single.dark`, `configure-repeated.dark`, `configure-par.dark`, `configure-control.dark`, `configure-reload.dark`, `configure-free.dark`, `countdown.dark`, `active.dark`, `active.light`, `paused.dark`, `review.dark`, `early-review.dark` | [Design](../design/screens/practice/README.md) | [practice-modes](../requirements/practice-modes.md), [practice-improvements](../requirements/practice-improvements.md), [persistence](../requirements/persistence.md), [practice-start](../requirements/practice-start.md), [page-layout](../requirements/page-layout.md) |
| Drill Session | `sessionView` | Start Drill on a built-in/custom sequence, or History review | `configure.dark`, `active.dark`, `paused.dark`, `review.dark` | [Design](../design/screens/session/README.md) | [drill-sessions](../requirements/drill-sessions.md), [practice-improvements](../requirements/practice-improvements.md), [persistence](../requirements/persistence.md), [page-layout](../requirements/page-layout.md) |
| About this practice | `practiceGuideView` | About this practice link on stopped Practice or Sequence configuration | `single.dark`, `single.light`, `repeated.dark`, `repeated.light`, `par.dark`, `par.light`, `control.dark`, `control.light`, `reload.dark`, `reload.light`, `free.dark`, `free.light`, `sequence-trigger-only.dark`, `sequence-trigger-only.light`, `sequence-rack-trigger.dark`, `sequence-rack-trigger.light`, `sequence-mag-trigger.dark`, `sequence-mag-trigger.light`, `sequence-draw-mag-trigger.dark`, `sequence-draw-mag-trigger.light`, `sequence-custom.dark`, `sequence-custom.light`, `single-early.dark`, `single-early.light`, `reload-selected-endpoints.dark`, `external-start.dark`, `silent-start.dark` | [Design](../design/screens/practice-guide/README.md) | [practice-guides](../requirements/practice-guides.md), [page-layout](../requirements/page-layout.md), [practice-modes](../requirements/practice-modes.md), [drill-sessions](../requirements/drill-sessions.md) |
| Live Listen | `recognizeView` | Live Listen tab, Home card or Start free listening | `ready.dark`, `listening.dark` | [Design](../design/screens/live-listen/README.md) | [core](../requirements/core.md), [practice-modes](../requirements/practice-modes.md), [practice-improvements](../requirements/practice-improvements.md), [page-layout](../requirements/page-layout.md) |
| History | `historyView` | History tab or Home card | `overview.dark` (public), `overview.light` (public), `progress.dark` (preview), `data-table.dark` (preview), `progress.light` (preview), `recognition-cleared.dark`, `sessions-cleared.dark` | [Design](../design/screens/history/README.md) | [core](../requirements/core.md), [practice-improvements](../requirements/practice-improvements.md), [persistence](../requirements/persistence.md), [build-editions](../requirements/build-editions.md), [page-layout](../requirements/page-layout.md) |
| Settings | `settingsView` | Settings gear in the shared branded header; backup/restore links | `overview.dark` (public), `overview.light` (public), `sounds-reset.dark`, `preview-free.dark` (preview), `preview-free.light` (preview), `preview-full.dark` (preview), `preview-full.light` (preview), `installation-help.dark`, `installation-help.light` | [Design](../design/screens/settings/README.md) | [settings](../requirements/settings.md), [core](../requirements/core.md), [persistence](../requirements/persistence.md), [about](../requirements/about.md), [page-layout](../requirements/page-layout.md) |
| About | `aboutView` | Shared app footer → About, including before gun setup | `overview.dark`, `overview.light` | [Design](../design/screens/about/README.md) | [about](../requirements/about.md), [core](../requirements/core.md), [branding](../requirements/branding.md), [persistence](../requirements/persistence.md), [build-editions](../requirements/build-editions.md), [page-layout](../requirements/page-layout.md) |
| Contact | `contactView` | Shared app footer → Contact, including before gun setup | `overview.dark`, `overview.light` | [Design](../design/screens/contact/README.md) | [contact](../requirements/contact.md), [about](../requirements/about.md), [core](../requirements/core.md), [persistence](../requirements/persistence.md), [page-layout](../requirements/page-layout.md) |
| Safety confirmation | `safetyModal` | Any unconfirmed action that would acquire microphone capture | `safety-modal.dark` | [Design](../design/screens/shared/README.md) | [core](../requirements/core.md), [practice-improvements](../requirements/practice-improvements.md) |

## Shared templates

Every screen uses the [reusable app layout and view wrapper](page-templates.md), one branded header, main content, informational footer and fixed five-item bottom navigation. Installation/help is existing Settings content. Keep this shell consistent when adding screens.

## State transitions

`Practice/Sequence Configure → About this practice → Same Configure`; preserve source/gun context and invalid/unsaved draft values, with no microphone/safety prompt. Guides use controlled synthetic examples and pause on navigation/background.

`First visit → Gun setup → Home`; returning visits restore a valid selected gun.

`Drills → Practice Configure → Safety if needed → Connecting → Countdown or external cue → Listening → Review`. Single saves its first accepted click then automatically repeats fresh countdown/signal/listening until the target; Par/Reload offer Next; repeated/control/free remain continuous. Pause releases capture; Resume restarts appropriately. STOP/End saves partial results.

`Drills → Sequence Configure → Safety if needed → Countdown/GO → Ordered sounds → Saved repetition → Fresh countdown → Review`. Pause/Resume and interruption preserve durable results.

`History → Saved Practice/Sequence Review`; Back returns to the visited screen. Native/browser Back/Forward cleanly end active capture and validate gun/context ownership. Refresh preserves local data but never automatically acquires a microphone.

`My Guns → Delete one gun → Confirm → Remaining gun library or first-gun setup`; atomically delete all records owned by that gun, preserving other guns/device preferences. Cancel keeps all data.

`History → Clear recognition history or Clear saved sessions → Confirm → Refreshed corresponding log/statistics`; separate scopes preserve other data and guns. Deleted Review contexts resolve to Drills.

`Any capture action → Safety modal if unconfirmed → Confirm & continue original action or Cancel`. Page-session safety acknowledgement resets on refresh or gun change.

[Maintenance and data architecture](README.md) · [Current design catalog](../design/README.md) · [Implementation plan](../project/implementation-history.md)
