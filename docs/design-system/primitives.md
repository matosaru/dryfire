# Canonical primitives and reusable components

Use these owners rather than reproducing their structure or styles in page code.

| UI need | Canonical owner | Notes |
| --- | --- | --- |
| Application shell | `AppShell` | Header, main, footer and fixed navigation composition |
| Brand/header actions | `BrandHeader` | Home wordmark, About, Contact, Settings and Beta badge |
| Bottom navigation | `BottomNavigation` | Main destinations, active and disabled states |
| Page title/back | `PageHeading` | Consistent page heading and historical Back action |
| Selected gun summary | `GunSwitcher`, `GunContext` | Shared profile context and accessible names |
| Informational card | `InformationCard` | Noninteractive grouped explanation |
| Drill catalog choice | `DrillCard`, `PracticeCatalog` | Shared target, title, description and action geometry |
| Drill setup | `DrillSetup` | Guide link, ordered steps and setup group structure |
| Numeric input | `NumberInput` | Bounds/help presentation; domain validation remains controller-owned |
| Preference switch | `PreferenceToggle` | Label, status copy and native checkbox behavior |
| Safety confirmation | `SafetyDialog`, `SafetyDisclosure` | Safety gate copy and confirmation structure |
| Session result | `RepetitionResult`, `PracticeReview`, `SequenceReview` | Read-only result presentation |
| Active session | `PracticeRun`, `SequenceRun` | Run status and controls; controllers own capture |
| History records | `SavedSessionList`, `RecognitionList` | Review, verification and individual deletion presentation |
| Footer disclosure | `InfoFooter` | Storage/microphone disclosure and copyright |

## Platform primitives

The current canonical Button/Input/Select layer is deliberately lightweight:

- Buttons use the established `.button` variants and accessible native `<button>` behavior.
- Text and number inputs remain native elements with labeled page/component composition.
- Selects remain native OS/browser controls.
- Destructive confirmations use the established app-owned inline/dialog pattern for new UI; older browser confirmations remain until separately migrated.

A generic component should be extracted only when it can preserve the existing DOM, focus, validation, performance and pixels across real consumers. Extraction itself is not permission to redesign.

## Component package contract

A reusable component directory contains:

```text
ComponentName/
  ComponentName.tsx
  ComponentName.css
  ComponentName.test.tsx
  index.ts
```

Tests cover semantics, states and callback ownership. Browser workflows cover integration, navigation, retained drafts and responsive behavior. The canonical screenshot suite covers one mobile Chromium image per distinct page type.
