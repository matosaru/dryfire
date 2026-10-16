# Practice guides — CHG-042

Revision 1.1 · CHG-042/043/044/045 · 2026-10-15 (Europe/Vilnius) · **Approved for implementation; delivery/testing tracked separately.**

CHG-044 explicitly starts implementation: after **“publish changes”**, the user clarifies **“Implement guides and push to b/dev (Recommended)”**. This supersedes the design-only status below for GUIDE-01–08. Reuse the reviewed page direction and animation meaning, one shared guide template and the existing navigation guards. CHG-045 supersedes the simplified Canvas layout: the help example uses the same run/review templates, CSS and presentation as the live practice. Illustrations remain synthetic and separate from real capture. Use actual selected Reload endpoints/custom steps in instructions/examples; explain external-cue/silent settings truthfully. Preserve invalid/unsaved form drafts rather than revalidating or resetting setup to read help. The registry and current product design package map the implemented guide; final image acceptance/publication is tracked separately. Main/Cloudflare are not part of this publication instruction.

The user requests a short manual for each practice type, a link reading **“About this practice >”** on each initial configuration page, separate manual subpages and visual examples, preferably with animation. This authorizes preparing and publishing the proposal below. The reviewed CHG-042/043 direction is now implemented locally under CHG-044; pinned screenshot acceptance and publication are tracked separately.

## Approved requirements

| ID | Proposed behavior |
| --- | --- |
| GUIDE-01 | Put an underlined **About this practice ›** link immediately below the configuration page title, before gun context, required sounds and settings. Keep a 44 px touch target, visible keyboard focus, white Dark text and high-contrast Light ink. The chevron is decorative; the accessible name is “About this practice”. |
| GUIDE-02 | Open a dedicated guide for the selected mode, using one common guide template with mode-specific content. Cover Single, Repeated, Par-time, Trigger control, Reload and Free practice. Cover each of the four existing built-in ordered sequences separately, plus a guide resolved from the selected existing custom preset. Do not confuse the legacy one-step Trigger pull sequence with Single's different repetition/timing behavior. |
| GUIDE-03 | Each guide has the same shared BETA header, content/footer/information links and fixed five-tab navigation as the app, with Drills selected. Include a title, one-sentence purpose, visual example, “What it measures”, three short steps, mode-specific expectations and **Back to setup**. Reading does not require microphone permission or a safety acknowledgement; capture still requires the existing safety gate. |
| GUIDE-04 | Opening/closing a guide preserves the gun, mode/preset and unsaved configuration. Browser Back and the page Back/Back to setup return to the same setup without starting/restarting recording. A guide is reached only from a stopped setup, never by abandoning an active capture or unsaved review. Invalid/deleted contexts fall back safely to Drills. |
| GUIDE-05 | Copy follows the existing engines: Single automatically repeats and counts pre-beep accepted triggers as failed attempts; Par/Reload use Next repetition after a result; Repeated/control/free listen continuously. Legacy ordered sessions automatically repeat and keep their existing cue/timing rules. Explain default app signals versus optional calibrated external beeps without claiming a microphone can verify physical actions. |
| GUIDE-06 | Use locally authored, silent timing illustrations, visibly labeled **SIMULATED EXAMPLE · NO LIVE MICROPHONE · NOTHING IS SAVED**. Provide a poster, text-equivalent steps and Play/Pause; honor reduced motion by keeping the poster until explicitly played. No camera, microphone, audio autoplay, external media tracker or new raw-audio collection is needed. A GIF is a review/export example; the app uses the same actual DOM run/review components as the live session, driven by simulated state. |
| GUIDE-09 | After any relevant design change, update the live screen, help example, current screenshots and exported GIFs together. Reuse the same run/review templates and presentation; visibly label simulated microphone levels/events. Record source fingerprints for GIF exports and fail documentation checks when they become stale. |
| GUIDE-07 | Keep guides available for existing usable practices in both editions. Explain only features available in the chosen context; do not unlock new custom creation, graphs or additional guns. Guides do not change timing thresholds, limits, entitlements, calibration, storage or safety behavior. |
| GUIDE-08 | CHG-043 revises the original compressed diagrams: show microphone preparation before countdown, actual elapsed countdown seconds and a visible signal before accepted clicks. Export at 1× timing, using configurations clearly labeled as examples. Check transitions/outcomes against the real session engines. Single demonstrates automatic repetition and a separate early-trigger miss with zero shots and no successful reaction time. Par/Reload show explicit user Next; continuous modes have one beep; ordered sessions retain their distinct result hold/detection rules. Remove decorative waveforms that could imply real recorded audio. Keep examples silent, controllable and visibly synthetic. |

The user's **“ok, revisit”** approves revising the proposal after the assistant identified compressed timing, missing readiness and missing early-trigger behavior. It authorizes this animation/mockup correction; at that time it did not authorize app implementation; the subsequent explicit CHG-044 instruction above now does. The original four-second concept remains in Git at [`b84de36`](https://github.com/matosaru/dryfire/commit/b84de36).

## Content and acceptance

[Current product designs](../design/screens/practice-guide/README.md) own reviewed application captures. [Reusable base copy](../../src/practiceGuideManuals.js) and [context adaptation](../../src/practiceGuides.js) provide separate short manuals for six modes, four built-ins and the actual selected saved custom preset/Reload endpoints. The earlier [design proposal](../design/proposals/practice-guides/README.md) remains review history; its fixture values do not override the selected setup.

Acceptance checks: every stopped configuration links to its correct guide; keyboard/Back navigation preserves unsaved values; all guides use the common shell at 320/390/1024 px and in both themes; active/unsaved guards remain intact; no automatic media permission or start signal; animations can stop and reduced motion shows an equivalent poster; content agrees with [practice modes](practice-modes.md), [start timing](practice-start.md), [sequence sessions](drill-sessions.md) and [page layout](page-layout.md). The actual guide states and captures belong in the current registry and screen package; older proposals retain their historical scope.

## Internal guide architecture

```text
Drills
├── Practice setup (single / repeated / par / control / reload / free)
│   └── About this practice → Practice guide(mode) → Back to same setup
└── Ordered sequence setup (four built-ins / existing custom preset)
    └── About this practice → Practice guide(preset snapshot) → Back to same setup
```

Reuse the common layout plus one guide-content template/data catalog; retain one app public path `/`. This is an implemented internal history state, not a public SEO route. The screen registry maps thirteen functional screens, including the shared Practice guide.

## CHG-044 implementation details

The shared DOM presentation uses the same synthetic engine scenarios as the reviewed GIF direction, with Play/Pause/Resume/Replay and stopped Review; it never requests audio or saves synthetic outcomes. Static posters are initial in all motion preferences. Navigation/backgrounding pauses examples. Reload and saved presets resolve current endpoints/steps; long presets illustrate one full attempt. A deliberately invalid equal-endpoint draft may still read help, with the valid fallback illustration disclosed. External/silent setups explain that the illustration uses the optional app signal. The setup inputs stay in their existing DOM and controllers; opening/closing help does not normalize, reset or require valid numeric drafts. The context checks gun/source key and disallows pending/running/unsaved capture; stale history resolves safely.

## CHG-045 visual parity and exports

The user rejects the initial simplified animation after comparing it with the live drill. Practice and Sequence now compile their actual run/review fragments twice, namespacing the example IDs. Shared read-only presentation renders engine snapshots for both. Counters, countdown, STOP, microphone bar, result cards and action rows therefore use the real structure/styles. Example playback and clearly labeled synthetic levels never invoke live control handlers or save records. Review says **Example only · nothing saved**.

GIFs are documentation exports from the same production-built help component, generated at 1× timing. They are not downloaded by the app. The export manifest records relevant sources and media hashes; documentation validation rejects stale/missing exports. Update them with screenshots after any relevant UI/scenario change. Earlier CHG-042/043 proposal GIFs remain historical and are not the current implementation design.
