# Contact

Revision 1.0 · CHG-029 · 2026-10-12. Directly requested separate app screen; validation and publication are recorded in the [delivery tracker](../project/implementation-history.md).

| ID | Requirement | Authorization |
| --- | --- | --- |
| CONTACT-02 | Provide an independent Contact app screen, opened by its own centered shared-footer control before or after first-gun setup. Preserve visited-screen Back/Forward and appearance. | CHG-029 direct instruction |
| CONTACT-03 | Show the confirmed, selectable **easydryfire@gmail.com** address linked to `mailto:easydryfire@gmail.com`, with the existing invitation and email-app explanation. No private data is automatically attached. | CHG-027 confirmed address; ABOUT-03 retained; CHG-029 separation |
| CONTACT-04 | Opening Contact does not request microphone permission, confirm safety, create a profile or change saved data. Hide the practice tabs, safety disclosure and gun selector as on About. Both footer links remain available, matching footer text color with preserved font/underline/focus and a divider below. | Existing invariants and CHG-029 |

## Page text

**Contact**

**Get in touch**

Have a question, feedback or a bug to report? We'd like to hear from you.

**easydryfire@gmail.com**

Opens your email app. You can also copy the address.

## Acceptance and boundaries

- About and Contact are distinct app screens at `/`, each with Back and the existing Settings shortcut. Contact owns the email card; About owns its app/routine/storage/safety explanation.
- Direct entry works without a saved gun or microphone permission. Back/Forward restores the actual visited state, including About → Contact → Back to About.
- Review both themes at 320 and 390px without horizontal overflow. Preserve saved data and safety state.
- A public `/contact` server route, contact form, copy-button behavior and email backend remain unimplemented CHG-026 scope. CONTACT-01 in [web commercial requirements](web-commercial.md) retains that forward scope.

Design: [Contact](../design/screens/contact/README.md). Shared controls: [footer](../design/screens/shared/README.md).
