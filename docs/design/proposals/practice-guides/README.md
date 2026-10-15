# Practice guide proposal — CHG-042

2026-10-15 (Europe/Vilnius) · **Proposal for review. Not added to the working app.**

Put an underlined **About this practice ›** link directly below each configuration title, before settings. Use white Dark text, normal Light ink, the existing body-link font and a minimum 44 px touch target. The guide opens as an independent app subpage with the same BETA header, footer/information links and sticky navigation, with Drills active. **Back to setup** returns to the same gun/mode and keeps edited settings; reading never starts the microphone or a drill.

![Setup link and two example guides](overview.dark.png)

## Page structure

1. Shared header. Setup retains its existing safety/gun context; the informational guide omits those extra controls so the manual appears immediately.
2. Back control, “About this practice”, and the selected practice title.
3. One-sentence purpose and a silent timing illustration with Play/Pause.
4. “What it measures”, three “How it works” steps, “Good to know” and “Before you start”.
5. **Back to setup**, acoustic limitations, then the shared informational footer and fixed five-tab navigation.

The examples retain the existing app's longer scrollable footer. Full-height PNGs below show the complete pages; the overview shows their first screenful. These are design-only HTML renders using the current shared header/footer/navigation and CSS, not screenshots of a shipped feature or accepted pixel-test baselines.

## Reviewable pages

| Practice / sequence | Dark | Light | Silent animation |
| --- | --- | --- | --- |
| Single trigger press | [Page](screens/single.dark.png) | [Page](screens/single.light.png) | [GIF](animations/single.gif) |
| Repeated trigger presses | [Page](screens/repeated.dark.png) | [Page](screens/repeated.light.png) | [GIF](animations/repeated.gif) |
| Par-time practice | [Page](screens/par.dark.png) | [Page](screens/par.light.png) | [GIF](animations/par.gif) |
| Trigger control | [Page](screens/control.dark.png) | [Page](screens/control.light.png) | [GIF](animations/control.gif) |
| Reload practice | [Page](screens/reload.dark.png) | [Page](screens/reload.light.png) | [GIF](animations/reload.gif) |
| Free practice | [Page](screens/free.dark.png) | [Page](screens/free.light.png) | [GIF](animations/free.gif) |
| Trigger pull (legacy sequence) | [Page](screens/sequence-trigger-only.dark.png) | [Page](screens/sequence-trigger-only.light.png) | [GIF](animations/sequence-trigger-only.gif) |
| Rack → Trigger | [Page](screens/sequence-rack-trigger.dark.png) | [Page](screens/sequence-rack-trigger.light.png) | [GIF](animations/sequence-rack-trigger.gif) |
| Magazine → Trigger | [Page](screens/sequence-mag-trigger.dark.png) | [Page](screens/sequence-mag-trigger.light.png) | [GIF](animations/sequence-mag-trigger.gif) |
| Draw → Magazine → Trigger | [Page](screens/sequence-draw-mag-trigger.dark.png) | [Page](screens/sequence-draw-mag-trigger.light.png) | [GIF](animations/sequence-draw-mag-trigger.gif) |
| Saved custom sequence example | [Page](screens/sequence-custom.dark.png) | [Page](screens/sequence-custom.light.png) | [GIF](animations/sequence-custom.gif) |

Link placement: [Single Dark](screens/single-setup.dark.png) · [Single Light](screens/single-setup.light.png) · [Sequence Dark](screens/sequence-rack-trigger-setup.dark.png) · [Sequence Light](screens/sequence-rack-trigger-setup.light.png).

The setup mockups demonstrate the proposed link and preserve the current practice fields. The sequence setup illustration reuses the field styling for link placement; its full sequence form is not a replacement proposal. Product implementation must retain the existing ordered-session controls/defaults. Reload endpoints and custom steps in a real guide must come from the selected configuration/preset snapshot. The shown profile name, counts and timings are fixtures.

## Animation direction

![Single practice timing illustration](animations/single.gif)

Use an original, quiet **Ready → Signal → Event → Result** timeline, adapted to each mode. The GIF is a four-second loop; it illustrates the stages rather than running a real-time drill. Single shows the next countdown, Repeated/control show multiple clicks/intervals, Par a deadline outcome, Reload an event interval, Free a session total and ordered drills their particular step order. It is not a physical technique demonstration or a microphone signal. No competitor media, external font, stock footage or manufacturer artwork is imported.

The prototype initially shows a static poster, including with reduced motion; **Play example** starts the GIF and **Pause** restores the poster. Text steps provide the same essential explanation. A later app implementation should use a small controlled SVG animation if it preserves meaning/accessibility and is lighter than bundled GIFs. No autoplay sound, microphone permission or third-party media service.

## Copy, source and validation

- [Short manual text for every type](copy.md), generated from [manuals.json](manuals.json).
- [Proposed requirements and internal navigation tree](../../../requirements/practice-guides.md).
- [Interactive HTML prototype](index.html): download/open it with its `animations/` folder, or serve the repository locally. GitHub displays source rather than running HTML; use the PNG/GIF links above for browser review.
- [Renderer](render.mjs), [timing illustration source](motion.html), [capture/check script](capture.mjs) and [observed validation](validation.json).

Observed local validation: all six source-defined mode IDs and four built-in action sequences match the catalog; 26 screenshots render; all 66 guide/theme/width combinations keep the BETA header and fixed navigation without horizontal overflow; Play/Pause works in all 22 themed guides; four edited-setting return journeys retain their unsaved repetition count; zero browser errors. All 11 GIFs have 40 frames at 10 fps and a four-second loop. Documentation checks, 16 existing smoke checks, the unchanged public production build/artifact verifier and existing visual-reference fingerprints pass. No full product Jest/browser comparison rerun is claimed by these proposal checks; ordinary branch CI supplies its separate result.

Reproduce from the repository root with `node docs/design/proposals/practice-guides/capture.mjs`. Requires installed Playwright, a Chromium executable (`CHROMIUM_EXECUTABLE_PATH`, default `/usr/bin/chromium`) and FFmpeg. It uses a temporary local server and stops it when done. No product routes, source files, build profiles, accepted screenshot references or stored user data are modified. The app's twelve-screen registry continues to describe implemented behavior; add the guide state and pinned capture coverage only with actual implementation.

Review scope: link placement/style, common page structure, all mode-specific copy, and the silent animation direction. Once this proposal is accepted, implement one reusable guide template/catalog, navigation guards and context retention, then refresh actual product screenshots and pinned browser references. Publication of these mockups does not itself approve or deploy the feature.
