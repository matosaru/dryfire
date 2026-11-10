# Design system

This package is the canonical entry point for the reusable visual language of Dry Fire With Ease. It documents existing approved UI; it does not authorize a redesign.

## Sources of truth

| Concern | Canonical owner |
| --- | --- |
| Semantic values | [`packages/ui/src/tokens.css`](../../packages/ui/src/tokens.css) |
| Shared components | [`packages/ui/src`](../../packages/ui/src) |
| Page components | [`apps/web/src/pages`](../../apps/web/src/pages) |
| Shared shell behavior | [`page-layout.md`](../requirements/page-layout.md) |
| Screen appearance | [`docs/design/screens`](../design/screens) |
| Component/runtime ownership | [`component-map.json`](../architecture/component-map.json) |
| CSS import order | [`src/styles.css`](../../src/styles.css) |

The ordered stylesheet remains necessary while legacy startup adapters are retained. Tokens are introduced as semantic aliases for new and migrated code; legacy raw values migrate only in reviewed, pixel-identical increments. Keep the token file out of the startup stylesheet until a visible component consumes it; owner imports will add it as part of measured CSS migration slices.

## Rules

1. Reuse an existing component before creating another visual implementation.
2. Use a semantic token when the token expresses the intended role.
3. Do not change a token to fix one page. A token change affects the system and requires all affected page evidence.
4. Page CSS may own page-specific composition. Shared control appearance belongs to its primitive/component package.
5. Native form controls remain canonical where documented; do not recreate their popup UI.
6. Every reusable component keeps its source, CSS, export and meaningful test together.
7. A visual change updates the requirement, screen design and canonical page screenshot.

[Tokens](tokens.md) · [Primitives](primitives.md) · [Application component map](../architecture/component-map.json)
