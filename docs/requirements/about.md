# About

Revision 1.3 · CHG-027/028/029/031 · 2026-10-12. CHG-029 separates About from Contact; CHG-031 makes the footer controls white in Dark mode. Exact editorial copy remains suggested for review; implementation, validation and publication are tracked separately.

User instruction: **“also start creating aboutpage, suggest page text. and add easydryfire@gmail.com as a contact email. create this as a separate feature branch”**. This specifically starts the About/contact slice after the CHG-026 implementation pause. Other commercial, account, cloud, paywall and SEO implementations remain paused.

| ID | Requirement | Authorization |
| --- | --- | --- |
| ABOUT-01 | Provide a dedicated About screen reached directly from the shared app footer, independently of Settings, including before a first gun has been saved. Describe the current app accurately and briefly. | Direct instruction, CHG-027/028 |
| ABOUT-02 | Explain local storage and backup recovery, experimental acoustic recognition and existing safety checks without promising cloud recovery, perfect detection or verified firearm safety. | Current CORE/DATA invariants applied to the requested page |
| ABOUT-03 | Display the selectable address **easydryfire@gmail.com** as a working `mailto:` link on the separate Contact screen. Opening an email composer is user initiated; no saved gun/history/audio data is attached or sent automatically. See [Contact](contact.md). | Explicit Contact address, CHG-027/029 |
| ABOUT-04 | Preserve app/browser Back and Forward, Dark/Light readability and access without microphone permission. Opening About does not create a gun, acknowledge safety or alter saved data. | Existing navigation, appearance and data invariants |
| ABOUT-05 | Shared About and Contact controls use `#FFFFFF` in resolved Dark mode for stronger contrast. Light controls keep the footer text color. Preserve centered placement, size/underline/focus/touch target, no arrows and the divider below. Disclosure/copyright retains its muted color. | CHG-031 contrast correction under the existing requested implementation and pure-white preference |

## Suggested page text

This is the initial editorial proposal implemented for review, not a claim of word-for-word user approval.

**Dry Fire With Ease**

**Dry-fire practice, made simple.**

Use your device's microphone to recognize your learned trigger click, time your repetitions and review your progress.

**A simple practice routine**

1. Learn your trigger click.
2. Choose a practice mode or drill.
3. Follow the start signal and review your saved results.

Keep separate profiles for up to five guns, create custom drills and view timing trends. Other sound categories are optional unless your drill uses them.

**Saved on your device**

No account is required. Your profiles, learned sound features, drills and history stay in this browser. Use Settings → Export backup to keep a recovery copy before changing device or clearing browser data.

**Practice responsibly**

Complete the safety check before recording or practice. Sound recognition is experimental. It cannot verify an unloaded firearm, aim or safe handling, and is not a calibrated measurement instrument.

## Acceptance and boundaries

- App footer → About opens About and → Contact opens Contact before and after gun setup. Back returns to the visited screen; browser Back/Forward restores the visited app state.
- About contains no contact card; [Contact](contact.md) owns the email page. Neither page sends private data or introduces an email backend or form.
- About does not request microphone access or complete the safety acknowledgement. Existing persisted data, formats, current free features and defaults remain intact.
- Review mobile Dark/Light layouts at 390 and 320 px without horizontal overflow; maintain the registry, actual screen evidence and pinned browser baselines.
- About is a history-backed screen of `/`, not a new indexable `/about` server route. Public landing pages, Contact route, metadata, sitemap and robots remain CHG-026 planning scope.

Design: [About](../design/screens/about/README.md). Delivery and publication: [implementation history](../project/implementation-history.md).

## Independent link placement — CHG-029/031 (supersedes CHG-028)

Use two separate **About** and **Contact** controls centered in the shared footer, independently of Settings. Both remain visible on either informational page and the current page has `aria-current="page"`. Remove arrows; controls are `#FFFFFF` in Dark and match footer text `#4A6276` in Light. Preserve 0.85rem type, underline and keyboard focus outline, and the divider between the links and the disclosure text. Minimum touch height stays 44px. Keep the five practice-navigation destinations and existing capture/storage guards. Earlier muted-Dark/combined-link/Settings-placement images are superseded evidence. Current layouts: [shared footer](../design/screens/shared/README.md), [About](../design/screens/about/README.md) and [Contact](../design/screens/contact/README.md).
