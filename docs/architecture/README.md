# Site and application architecture

Read the [component structure and application entry-point guide](application-structure.md) for build/browser startup, screen owners, shared packages and deliberate progressive startup boundaries. [Decision001](decisions/001-progressive-react-startup.md) records CHG-051.

The [application sitemap](application-sitemap.md) shows navigation and the screen directory. It and the detailed [site tree](site-tree.md) are generated from [screen-map.json](screen-map.json). The registry is the single source for functional screen/state coverage and design associations. The app has one public address, `/`; its thirteen functional screens, including separate CHG-029 About and Contact, are history-backed UI states, not separate server routes or indexable pages.

CHG-026 adds a separate [future cloud-services proposal](cloud-services-proposal.md) and [planned public topology](../seo/README.md#planned-public-topology--chg-026). These are not implemented routes or registry entries. Contact is now an app state; its public server route remains proposed. Add account/public-page states to the maintained tree only when code and reviewed designs exist.

## Maintain after each change

1. Update the affected [functional requirements](../requirements/README.md) and record changed-scope authorization using the [change process](../project/change-process.md).
2. Change the corresponding `docs/design/screens/<screen>/README.md` and actual local production-build captures. Retain superseded reviewed revisions in Git/archive. Review visible controls, state labels, numeric limits, themes and ownership against the source.
3. Update registry screen/state IDs, hierarchy, entry points and requirement/design/image paths. Add a new real public path only when its implementation and scope are authorized. Do not put inline forms or dialogs in the sitemap.
4. After reviewing affected screens, refresh the hashes in `reviewedSources` with `npm run docs:review`. This command records the current UI/navigation source hashes; it does not approve a design or capture images. Do not use it just to suppress a failing check.
5. For a visible change, update and review the affected Chromium/WebKit baselines in the pinned renderer and record `npm run visual:review -- --write`; normal CI never updates baselines. Follow [the visual-test guide](../development/VISUAL_TESTS.md).
6. For guide/run UI changes, regenerate current [guide GIF exports](../design/screens/practice-guide/examples/README.md) from the actual shared component. Documentation checks reject stale source/media fingerprints; retain earlier proposal GIFs as history.
7. Run `npm run docs:generate` to regenerate the tree and coverage table, then `npm run docs:check`. Commit the registry, tree, specifications, screenshots and implementation-history update with the change. CI runs the same checker.

The checker compares all HTML root views and the six source-defined modes to the registry, checks required DOM anchors and reviewed-source fingerprints, validates current design/capture links and naming, detects byte-identical current PNGs, and verifies generated tree/catalog content. It checks local file/heading links across repository Markdown, including the archive. It cannot prove that a new screenshot looks right; visual review remains required.

## Data and execution boundaries

CHG-044 [implements contextual practice guides](../requirements/practice-guides.md#internal-guide-architecture): Practice/Sequence Configure → guide for the selected mode/preset → the same Configure state with unsaved values retained. One shared guide template/content catalog reuses the app shell; the registry includes its mode/sequence/early/theme/context states. Guide navigation retains source keys and setup DOM, and examples pause on navigation/background without audio or storage APIs. No public route is added.

- `index.html` declares screens; `src/main.js` connects controls and active gun context. `src/screenNavigation.js` maintains app/browser Back/Forward and guards stale contexts.
- `src/practiceSession.js` / `src/practiceController.js` own the four-mode engine and Configure/Run/Review. `src/drillSession.js` / `src/sessionController.js` preserve ordered sequence sessions.
- Microphone capture and segmentation run through `src/audio.js`, the AudioWorklet and event detector; calibrated numeric features feed local recognition. No raw audio is durably recorded/uploaded.
- `src/storage.js` uses IndexedDB schema 4; backup format 4 restores compatible older formats. Gun profiles own examples, presets, calibration/settings and saved sessions. Appearance/vibration are device-wide. Same-origin refresh/deployment preserves stored data; clearing browser storage or changing origin can lose access. Use exported backups for recovery.
- History derives comparable progress locally. It does not synchronize another device or measure aim, unloaded status or physical technique.
- Vite emits minified static assets to `dist/`; Cloudflare Workers serves them. The PWA service worker caches the app shell; internal navigation is not a multipage website.

See [persistence requirements](../requirements/persistence.md), [deployment](../development/DEPLOY.md) and the [SEO proposal](../seo/README.md) for boundaries and remaining work.

## Build editions — CHG-032/033

[Edition requirements](../requirements/build-editions.md) control temporary public creation/graph availability while preserving data. Registry states may declare `edition: public` or `edition: preview`; an omitted value means shared. Current shared captures use public, and edition-specific browser references cover both outputs. The [edition guide](../development/free-preview-testing.md) records commands, retained optional source, legacy data and the unverified hosted-preview protection prerequisite. About/Contact keep the fixed five-item navigation in either edition. No public server paths or storage schemas are added.

CHG-035 private preview has an authenticated asset boundary and a Free/Full simulation in Settings. Public output omits it; private UI states have their own captures. Preview app-shell caching is disabled to preserve authentication boundaries, while IndexedDB/manual backups remain. [Deployment configuration and verification](../development/private-preview-deployment.md) target only the requested private hostname; no public server route or product account is added.

## Shared app shell

CHG-037 uses [reusable page templates](page-templates.md) for every screen. Preserve this shared architecture when adding or changing pages; do not duplicate header/footer/navigation.

CHG-041 adds a shared BETA badge beside the brand and a feedback invitation within the existing About page. The twelve-screen tree and public routes are unchanged; current captures include the shared marker in both editions. See [branding](../requirements/branding.md#beta-disclosure--chg-041) and [About](../requirements/about.md#beta-and-feedback--chg-041).

CHG-047: [incremental React ownership, CSS and test boundaries](react-migration.md) · [screen-to-component/test map](component-map.json). Keep these current when moving a screen; the site hierarchy and stable routes remain unchanged.
