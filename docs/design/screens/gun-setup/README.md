# Gun setup design

CHG-034: public creation allows two guns; all existing profiles remain editable. Add-second-gun is captured in public; the existing five-gun Add state is full preview. [Edition specification](../../../requirements/build-editions.md).

CHG-031: About/Contact footer controls are pure white in Dark (`#FFFFFF`); Light/disclosure colors and the existing layout/underline/focus/divider remain. [ABOUT-05](../../../requirements/about.md) and the [shared footer design](../shared/README.md) define the correction. [Current capture review](../../baselines/bright-footer-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-030 typography revision: primary Dark text uses `#FFFFFF` throughout this screen and neutral controls. Secondary/footer/accent colors and Light values remain. The [shared typography design](../shared/README.md) and [SET-07](../../../requirements/settings.md) define the palette; [current capture/build review](../../baselines/white-primary-validation.json) records the passing pinned runs; publication is tracked separately.

CHG-029 capture refresh: current references use the pinned production-build renderer and separate centered About/Contact footer controls. [Capture/build review](../../baselines/separate-pages-validation.json) records both passing 138-check runs and reviewed images; earlier [CHG-028 evidence](../../baselines/footer-entry-validation.json) retains the combined entry.

Current implemented layout · CHG-018 coverage audit / CHG-019 corrections · 2026-10-11 · CHG-023 footer published in [`dbf8687`](https://github.com/matosaru/dryfire/commit/dbf8687); earlier feature baseline [`aacdb18`](https://github.com/matosaru/dryfire/commit/aacdb18); exact reviewed file hashes are in the registry

Entry: First visit without a gun; Add/Edit from My Guns. App anchor: `gunSetupView`. This is a state of the same `/` web app, not a separate indexable URL.

## Layout and interaction

Name (1–80 characters), three illustrated native radio choices for gun type, edition-aware two/five-gun capacity, local-storage explanation and Save. Existing-gun Edit prefills the same form with Save Changes and Cancel; saving retains gun identity and all data without changing active selection. First use offers Restore from backup.

Functional specifications: [gun-profiles](../../../requirements/gun-profiles.md) · [persistence](../../../requirements/persistence.md). These define acceptance behavior and input bounds; the layout here does not introduce a second set of requirement IDs.

## Current visual references

![Gun setup current layout](first-gun.dark.png)

| Screen/state | Capture | App anchor |
| --- | --- | --- |
| First gun | [`first-gun.dark.png`](first-gun.dark.png) | `gunForm` |
| Add second gun, public Free | [`add-second-gun.dark.png`](add-second-gun.dark.png) | `gunForm` |
| Add or edit gun, full preview | [`add-gun.dark.png`](add-gun.dark.png) | `gunForm` |
| Edit existing gun, Dark | [`edit-gun.dark.png`](edit-gun.dark.png) | `gunForm` |
| Edit existing gun, Light | [`edit-gun.light.png`](edit-gun.light.png) | `gunForm` |

Captured from the current local production build in Chromium at a 390 px mobile viewport. QA gun names, sample counts, audio levels and timing statistics are illustrative fixtures. Captures are actual UI rather than generated concepts; they do not establish Cloudflare deployment, real iPhone recognition accuracy or legal clearance. Additional transient/error states use this same layout and the linked requirements.

For a visible change, update the affected captures, this Markdown and the [screen registry](../../../architecture/screen-map.json); run the [maintenance checks](../../../architecture/README.md). Earlier reviewed revisions remain in the [archive](../../archive/README.md) and immutable Git history.
