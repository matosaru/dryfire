# Practice guides — CHG-042

Revision 0.1 · 2026-10-15 (Europe/Vilnius) · **Design proposal; no application implementation yet.**

The user requests a short manual for each practice type, a link reading **“About this practice >”** on each initial configuration page, separate manual subpages and visual examples, preferably with animation. This authorizes preparing and publishing the proposal below. The exact new layout/copy/animation is presented for review; it is not an implemented application feature.

## Proposed requirements

| ID | Proposed behavior |
| --- | --- |
| GUIDE-01 | Put an underlined **About this practice ›** link immediately below the configuration page title, before gun context, required sounds and settings. Keep a 44 px touch target, visible keyboard focus, white Dark text and high-contrast Light ink. The chevron is decorative; the accessible name is “About this practice”. |
| GUIDE-02 | Open a dedicated guide for the selected mode, using one common guide template with mode-specific content. Cover Single, Repeated, Par-time, Trigger control, Reload and Free practice. Cover each of the four existing built-in ordered sequences separately, plus a guide resolved from the selected existing custom preset. Do not confuse the legacy one-step Trigger pull sequence with Single's different repetition/timing behavior. |
| GUIDE-03 | Each guide has the same shared BETA header, content/footer/information links and fixed five-tab navigation as the app, with Drills selected. Include a title, one-sentence purpose, visual example, “What it measures”, three short steps, mode-specific expectations and **Back to setup**. Reading does not require microphone permission or a safety acknowledgement; capture still requires the existing safety gate. |
| GUIDE-04 | Opening/closing a guide preserves the gun, mode/preset and unsaved configuration. Browser Back and the page Back/Back to setup return to the same setup without starting/restarting recording. A guide is reached only from a stopped setup, never by abandoning an active capture or unsaved review. Invalid/deleted contexts fall back safely to Drills. |
| GUIDE-05 | Copy follows the existing engines: Single automatically repeats and counts pre-beep accepted triggers as failed attempts; Par/Reload use Next repetition after a result; Repeated/control/free listen continuously. Legacy ordered sessions automatically repeat and keep their existing cue/timing rules. Explain default app signals versus optional calibrated external beeps without claiming a microphone can verify physical actions. |
| GUIDE-06 | Use locally authored, silent timing illustrations, visibly labeled **Illustration · example timings**. Provide a poster, text-equivalent steps and Play/Pause; honor reduced motion by keeping the poster until explicitly played. No camera, microphone, audio autoplay, external media tracker or new raw-audio collection is needed. A GIF is a review/export example; an eventual app implementation may use a lighter controlled SVG animation with the same meaning. |
| GUIDE-07 | Keep guides available for existing usable practices in both editions. Explain only features available in the chosen context; do not unlock new custom creation, graphs or additional guns. Guides do not change timing thresholds, limits, entitlements, calibration, storage or safety behavior. |

## Content and acceptance

[The design proposal](../design/proposals/practice-guides/README.md) owns reviewable page examples and the [draft content catalog](../design/proposals/practice-guides/manuals.json). The catalog contains separate copy and animation states for six practice modes, four built-ins and one custom-preset example. Custom/Reload guides must resolve actual saved steps/endpoints in a future implementation; fixture values are illustrative.

Acceptance for eventual implementation: every stopped configuration links to its correct guide; keyboard/Back navigation preserves unsaved values; all guides use the common shell at 320/390/1024 px and in both themes; active/unsaved guards remain intact; no automatic media permission or start signal; animations can stop and reduced motion shows an equivalent poster; content agrees with [practice modes](practice-modes.md), [start timing](practice-start.md), [sequence sessions](drill-sessions.md) and [page layout](page-layout.md). Add actual registry states and reviewed product screenshots only when the feature is implemented.

## Proposed architecture (not current routes)

```text
Drills
├── Practice setup (single / repeated / par / control / reload / free)
│   └── About this practice → Practice guide(mode) → Back to same setup
└── Ordered sequence setup (four built-ins / existing custom preset)
    └── About this practice → Practice guide(preset snapshot) → Back to same setup
```

Reuse the common layout plus one guide-content template/data catalog; retain one app public path `/`. This is proposed internal history state, not a public SEO page or live route. The current screen registry remains the truthful twelve-screen implemented map.
