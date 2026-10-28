# Design context

This is a navigation entry for the maintained [design catalog](docs/design/README.md), [shared layout contract](docs/requirements/page-layout.md), [branding](docs/requirements/branding.md) and [component ownership map](docs/architecture/component-map.json).

The approved refactor preserves the existing identity, wording, responsive layout, accessibility, theme colors, navigation, screenshots and guide media. Runtime tokens and the ordered cascade remain owned by [src/styles.css](src/styles.css) and its imported component/style files; do not copy or redefine tokens independently.

Use the existing shared shell, typed page packages and guarded feature controllers. Keep data, safety, capture and Free/Full policy with their established owners. Visual changes require the documented requirements/design process; structural migration is not permission to redesign.

CHG-052 explicitly updates the Drills catalog: practice cards reuse sequence-card target icon/header/description/action classes and “▶ Start Drill” label; built-in sequence choices display multi-action presets only. Existing Configure flows, stored legacy trigger sequences and custom presets remain intact.

CHG-057 aligns catalog card title and sublabel to one text column beside a fixed target-icon column. Trigger, built-in sequence and saved-custom cards share that geometry and the existing full-width Start action. Catalog chips are omitted; sequence details remain in Configure/manuals. Runtime ownership stays DrillCard.css and its existing theme overrides, shared with PracticeCatalog.

CHG-058 makes Sequence configuration the shared template for all four trigger modes: compact repetition/Par cards, grouped signal/delay controls, separate start-sound card and left-aligned ordered sound list. DrillSetup owns this geometry and canonical setup CSS; retain page-specific labels/options and native forms, shell, timing/safety/data behavior.

CHG-059 adopts the outlined information-link proposal below context/sounds and before setup through DrillSetup's shared guide control. Guide sound orders use DrillSetupSteps and semantic list items in native and React views. Catalog target colors are group-scoped: Trigger #46baff, Sequence/custom #b574f6, in both themes; no position-dependent color. Preserve existing shell, guide examples and navigation/data contracts.

CHG-060 public static SEO pages reuse AppShell, BrandHeader, InfoFooter and fixed navigation through a real-link public variant. PublicPage owns editorial content/scoped CSS only, with current Dark palette, white text, orange action, type and card geometry.11 pages share actual manual sources and opt-in exported examples; existing app/GIF appearance remains unchanged. No new font or branding. Reading needs no profile/capture. Default app chrome remains guarded/callback-driven.

## CHG-061 — app-first root and marketing retained in About

Owner-approved: `/` opens the real trainer, informational and setup URLs are flat, and every built-in sequence has a distinct path. Retain marketing as `MarketingOverview` inside About with the existing brand, routine, free/local promise, CTA and mode guide cards. Public About/Contact/manuals use the same actual app components and fixed navigation as their in-app equivalents. Preserve the original marketing capture as historical evidence. No rebrand or unrelated layout changes. Review changed About/public captures in both pinned browsers and preserve unrelated baselines; original performance budgets apply.

Existing native selects remain OS-owned: practice delay/start-source, appearance, History progress filter and private preview simulation. Native popup geometry is intentionally platform-dependent; no authored dropdown redesign is authorized by this routing change. Preserve existing labels, keyboard behavior and numeric validation contracts. This explicit ownership decision also applies to the retained native template adapters.

## CHG-062 — shared information icons and Home brand link

The owner resumed header work and explicitly requested removing the bottom About/Contact links and making the header logo return Home (2026-10-27). Reuse BrandHeader in AppShell: About, drawn @ Contact, Settings in that order, 24px outlined icons/44px targets, white in Dark, existing Light palette, orange current/focus treatment. The logo plus wordmark form one accessible Home link. InfoFooter retains only disclosure/copyright/private status; fixed bottom navigation remains unchanged. Runtime ownership stays BrandHeader.css and existing shell/chrome bridges. Preserve guards, native/modified link behavior, draft ownership and Beta disclosure. This is an intentional approved shell change; current candidate screenshots are separate from accepted references.

## Canonical UI Map

| Capability | Canonical owner | Source of truth | Allowed variants | Verification |
| --- | --- | --- | --- | --- |
| Navigation | AppShell, BrandHeader, BottomNavigation and chromeBridge | Shared layout requirements and CHG-062 | Guarded in-app navigation; real public links; native startup and exclusive React enhancement | Shell/component/bridge tests and page-layout browser workflows |
| Select/Listbox | Existing labeled native selects | Native ownership decision above | OS-owned popup; preserved values and keyboard behavior | Feature unit and workflow tests |

The static audit manifest currently scopes the shared header/footer/shell changed in CHG-062. It is not a whole-application compliance claim or a reason to redesign unrelated forms.
