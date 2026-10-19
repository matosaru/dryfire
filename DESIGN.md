# Design context

This is a navigation entry for the maintained [design catalog](docs/design/README.md), [shared layout contract](docs/requirements/page-layout.md), [branding](docs/requirements/branding.md) and [component ownership map](docs/architecture/component-map.json).

The approved refactor preserves the existing identity, wording, responsive layout, accessibility, theme colors, navigation, screenshots and guide media. Runtime tokens and the ordered cascade remain owned by [src/styles.css](src/styles.css) and its imported component/style files; do not copy or redefine tokens independently.

Use the existing shared shell, typed page packages and guarded feature controllers. Keep data, safety, capture and Free/Full policy with their established owners. Visual changes require the documented requirements/design process; structural migration is not permission to redesign.
