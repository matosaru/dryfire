# Shared drill configuration template — CHG-058

Approved by direct owner instruction on 2026-10-23: use the sequence drill configuration template for single-trigger drill configuration pages and reuse the template. The existing common trigger configuration owner serves Single, Repeated, Par time and Trigger control; all four use the shared layout.

- Reuse the Sequence setup fieldset, compact repetition card, delay card, start-sound card and left-aligned sound-step list through shared typed components/styles. Sequence configuration remains the canonical visual reference.
- Keep each practice title and About link, active-gun context, readiness, input limits, defaults, App/external start signal and mode-specific Par field. Start behavior, automatic repetitions, recognition, timing, safety, storage and saved data remain unchanged.
- Preserve native form/input nodes during React enhancement and preserve invalid/unsaved drafts, focus and event ownership. UI components never acquire microphone or storage APIs.
- Keep existing Sequence configuration appearance unchanged. Trigger practice labels, supported options and functionality remain; their arrangement adopts the Sequence cards. Run/review/help examples retain their current shared presentation.
- Update functional/design documents, component ownership and affected screenshots in both editions/themes and 320px narrow layout. Update guide/media source fingerprints only after confirming those exports remain visually unchanged; regenerate media if presentation changes.
- Full unit/coverage, integration, minified builds, original performance and pinned Chromium/WebKit visual acceptance precede application publication on b. Main/dev and deployments remain unchanged.
