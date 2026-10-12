# About and email contact

Revision 1.1 · CHG-027/028 · Implemented and locally/browser validated on 2026-10-11; exact editorial copy is proposed for user review. Publication, promotion and deployment are tracked separately.

User instruction: **“also start creating aboutpage, suggest page text. and add easydryfire@gmail.com as a contact email. create this as a separate feature branch”**. This specifically starts the About/contact slice after the CHG-026 implementation pause. Other commercial, account, cloud, paywall and SEO implementations remain paused.

| ID | Requirement | Authorization |
| --- | --- | --- |
| ABOUT-01 | Provide a dedicated About screen reached directly from the shared app footer, independently of Settings, including before a first gun has been saved. Describe the current app accurately and briefly. | Direct instruction, CHG-027/028 |
| ABOUT-02 | Explain local storage and backup recovery, experimental acoustic recognition and existing safety checks without promising cloud recovery, perfect detection or verified firearm safety. | Current CORE/DATA invariants applied to the requested page |
| ABOUT-03 | Display the selectable address **easydryfire@gmail.com** as a working `mailto:` link. Opening an email composer is user initiated; no saved gun/history/audio data is attached or sent automatically. | Explicit Contact address and CHG-027 |
| ABOUT-04 | Preserve app/browser Back and Forward, Dark/Light readability and access without microphone permission. Opening About does not create a gun, acknowledge safety or alter saved data. | Existing navigation, appearance and data invariants |

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

**Contact**

Have a question, feedback or a bug to report? We'd like to hear from you.

**easydryfire@gmail.com**

Opens your email app. You can also copy the address.

**Practice responsibly**

Complete the safety check before recording or practice. Sound recognition is experimental. It cannot verify an unloaded firearm, aim or safe handling, and is not a calibrated measurement instrument.

## Acceptance and boundaries

- App footer → About & contact opens the dedicated screen before and after gun setup. Back returns to the visited screen; browser Back/Forward restores the visited app state.
- Contact shows exactly the confirmed address and its `mailto:` destination, with no automatically populated private data. No in-app email-sending backend or contact form is introduced.
- About does not request microphone access or complete the safety acknowledgement. Existing persisted data, formats, current free features and defaults remain intact.
- Review mobile Dark/Light layouts at 390 and 320 px without horizontal overflow; maintain the registry, actual screen evidence and pinned browser baselines.
- About is a history-backed screen of `/`, not a new indexable `/about` server route. Public landing pages, Contact route, metadata, sitemap and robots remain CHG-026 planning scope.

Design: [About](../design/screens/about/README.md). Delivery and publication: [implementation history](../project/implementation-history.md).

## Independent link placement — CHG-028

The user explicitly requests updated screenshots and says **“it should be separated from settings”**. This supersedes the initial Settings-position proposal. Put **About & contact** at the start of the shared app footer, above the privacy/copyright text, accessible from Home, gun setup and other screens without opening Settings. About remains its own page; its self-link is hidden on that page. Keep the five practice-navigation destinations and the existing capture/storage navigation guards. Settings contains device capability information without an About group. Current visual evidence: [Home](../design/screens/home/README.md), [Settings](../design/screens/settings/README.md) and [shared layout](../design/screens/shared/README.md). Earlier [Settings mockups](../design/proposals/about-link-placement/README.md) are superseded evidence, not the current layout.
