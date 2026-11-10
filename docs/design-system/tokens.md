# Semantic tokens

Tokens name a visual role rather than a particular screen. The runtime definitions live in [`packages/ui/src/tokens.css`](../../packages/ui/src/tokens.css).

## Categories

| Category | Tokens | Intended use |
| --- | --- | --- |
| Canvas/surfaces | `--color-canvas`, `--color-surface`, `--color-surface-raised` | Page background and layered cards |
| Content | `--color-text`, `--color-text-muted` | Primary and supporting copy |
| Boundaries | `--color-border` | Card, field and divider borders |
| Actions/status | `--color-accent`, `--color-positive` | Primary action/current state and successful readiness |
| Practice groups | `--color-trigger`, `--color-sequence` | Trigger and sequence catalog identity |
| Typography | `--font-sans`, `--font-size-*` | Existing system stack and approved type scale |
| Spacing | `--space-1` through `--space-8` | Internal gaps and page rhythm |
| Shape/targets | `--radius-*`, `--control-min-size` | Corners and 44 px minimum interactive target |
| Layout | `--content-phone`, `--content-app` | Reference widths, not unconditional element widths |

## Adding a token

Add a token only when at least one of these is true:

- the same semantic role is used by multiple components;
- Dark and Light need coordinated values;
- a reviewed design explicitly establishes a reusable system value.

Document the role here, add a focused token contract test, migrate consumers in a separate reviewable change, and prove unchanged pixels when the task is structural.

Avoid component names such as `--settings-card-blue`. Prefer roles such as `--color-surface-raised`. Do not create aliases for one-off decorative values without a reuse case.
