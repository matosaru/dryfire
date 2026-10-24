# Design context

This is a navigation entry for the maintained [design catalog](docs/design/README.md), [shared layout contract](docs/requirements/page-layout.md), [branding](docs/requirements/branding.md) and [component ownership map](docs/architecture/component-map.json).

The approved refactor preserves the existing identity, wording, responsive layout, accessibility, theme colors, navigation, screenshots and guide media. Runtime tokens and the ordered cascade remain owned by [src/styles.css](src/styles.css) and its imported component/style files; do not copy or redefine tokens independently.

Use the existing shared shell, typed page packages and guarded feature controllers. Keep data, safety, capture and Free/Full policy with their established owners. Visual changes require the documented requirements/design process; structural migration is not permission to redesign.

CHG-052 explicitly updates the Drills catalog: practice cards reuse sequence-card target icon/header/description/action classes and “▶ Start Drill” label; built-in sequence choices display multi-action presets only. Existing Configure flows, stored legacy trigger sequences and custom presets remain intact.

CHG-057 aligns catalog card title and sublabel to one text column beside a fixed target-icon column. Trigger, built-in sequence and saved-custom cards share that geometry and the existing full-width Start action. Catalog chips are omitted; sequence details remain in Configure/manuals. Runtime ownership stays DrillCard.css and its existing theme overrides, shared with PracticeCatalog.

CHG-058 makes Sequence configuration the shared template for all four trigger modes: compact repetition/Par cards, grouped signal/delay controls, separate start-sound card and left-aligned ordered sound list. DrillSetup owns this geometry and canonical setup CSS; retain page-specific labels/options and native forms, shell, timing/safety/data behavior.

CHG-059 adopts the outlined information-link proposal below context/sounds and before setup through DrillSetup's shared guide control. Guide sound orders use DrillSetupSteps and semantic list items in native and React views. Catalog target colors are group-scoped: Trigger #46baff, Sequence/custom #b574f6, in both themes; no position-dependent color. Preserve existing shell, guide examples and navigation/data contracts.
