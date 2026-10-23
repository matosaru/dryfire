# About this practice — control proposal

Requested on 2026-10-23. **Proposal, not implemented in the application.** The owner asked for a suggestion for replacing the underlined arrow link; the shared Sequence-style setup implementation is tracked separately under CHG-058.

Use the same compact secondary navigation control in both groups:

- Label: **ⓘ About this practice**. The information icon is decorative; the accessible name stays “About this practice”.
- Placement: after gun context and the ordered sound list, immediately before the setup heading. The user sees which practice is configured before opening its instructions.
- Appearance: existing secondary surface, border, text and radius tokens; minimum 44 px target, visible keyboard focus, no underline and no arrow. The main orange Start action remains visually dominant.
- Behavior: keep a real link to the existing guide, the same Back-to-setup behavior and preserved form drafts. Opening the guide never starts audio or prompts for safety.
- Reuse: one shared guide-control component for PracticePage and SequencePage if this design is adopted.

The images are local Chromium production-build captures with temporary proposal DOM styling, QA fixture data and the existing shared app shell. Keyboard Enter opened the real guide in both examples. They are not current visual baselines or evidence of deployment. The approved app still uses its existing guide link.

| Trigger group | Sequence group |
| --- | --- |
| [Single trigger press](trigger.dark.png) | [Rack slide → Trigger pull](sequence.dark.png) |
