# Follow-up architecture and cleanup audit

Status: prepared candidate, pending complete pinned acceptance. This describes the candidate in [the checkpoint](f3-f6-checkpoint.md), not the currently deployed application.

## Entry points and ownership

```text
index.html                         HTML document and browser entry reference
  src/main.js                      Startup composition, route/service wiring
    screenNavigation.js            Existing navigation/guard owner
    preferenceCoordinator.js       One preference record and persistence actions
    gunLibraryCoordinator.js       Gun workflow state, epoch and cached owners
      gunLibraryView.js            On-demand library presentation
    practiceController.js          Practice capture/timer/save lifecycle
    sessionController.js           Sequence capture/timer/save lifecycle
    apps/web/src/app/*             Guarded lazy React ownership adapters

tools/page-templates.mjs            Build-time composition of the same page owners
apps/web/src/pages/*                All13 complete screen owners
apps/web/src/features/*             Feature-specific presentation and models
packages/ui/src/*                  Shared layout, fields, run/review components

src/storage.js                     Unchanged public persistence exports
  storage/library.js               Normal runtime operations
  storage/database.js              Schema4, migration and transaction owner
  storage/restoreBackup.js          Explicit import; validation then atomic replace
  storage/*Validation.js           Pure backup/session validation
  storage/validation.js            Pure common normalization/validation
  storage/constants.js             Stable identifiers and limits
```

The machine-readable [component map](../../architecture/component-map.json) and [application sitemap](../../architecture/application-sitemap.md) are the ongoing component/route indexes. The expanded [application structure](../../architecture/application-structure.md) explains native-to-React ownership. There is no new eager React application root: ADR001 retains the tested startup adapters and their guards.

## Removed duplication and retained boundaries

| Area | Candidate result |
| --- | --- |
| Gun context | One shared GunContext across eight page owners, preserving exact markup |
| Settings | Shared section/action components inside its feature; shared PreferenceToggle for compatible controls |
| Drill setup | Shared field/delay-mode/delay-range controls; mode-specific fields and native draft identity retained |
| Live Listen | Three isolated panels compose its page; no platform acquisition in components |
| History | Existing list/evaluation/progress owners retained; no duplicate page/controller introduced |
| Storage | Pure validation separated from platform transactions;38public exports preserved; no parallel persistence engine |
| Main wiring | Preference/library workflows moved into focused coordinators; main1326→1193lines |
| CSS | Empty legacy-before-gun-setup file removed; moved rules retain cascade; intentional component stylesheet entries retained |
| Format ownership | FEATURE_VERSION has one pure source; audio retains its compatible re-export |
| Release assets | One build identity and worker policy; no timestamp-query mechanism or user-storage clearing |

Retained startup adapters and legacy cascade slices are used by active consumers. Removing them merely because their names include “native” or “legacy” would break the accepted startup/visual contracts. Historical review patches and media provenance are documentation, excluded from production dist; they remain useful evidence rather than duplicate shipped application code.

## Verification and remaining gate

Local:1129tests/168suites plus original logical-owner coverage ratchet pass;16smoke checks, type/lint/architecture checks pass. Public/preview payloads pass original limits. Exact eight-page SSR,32page/style/pixel cases and14header width/theme cases match; the original API has the same38exports. Two local Chromium offline/upgrade cases preserve the library and open documents. A later hashed404cache regression has a passing focused test and is included in the refreshed CI candidate.

Publication remains blocked until complete pinned Chromium/WebKit screenshots/integration and all original performance comparisons pass for the same final candidate. No new image baseline, timing allowance, coverage floor reduction or hardware microphone claim is authorized by this audit. After acceptance: publish source and matching canonical media together to b; promote via checked b→main PR; synchronize main ancestry back to b. Dev and commercial/native work remain outside scope.
