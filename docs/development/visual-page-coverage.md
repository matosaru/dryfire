# Canonical visual page coverage

CHG-069 reduces image comparisons to one public, Dark, 390 px Chromium reference for each distinct application page type. Public manuals remain separate cases because each owns a different indexable URL. The safety gate remains one explicit exception because it is a shared modal with its own durable layout contract.

| Page type | Canonical case |
| --- | --- |
| First gun setup | `gun-setup/first-gun.dark.390.png` |
| Home | `home/overview.dark.390.png` |
| Gun library | `guns/library.dark.390.png` |
| Learn | `learn/overview.dark.390.png` |
| Sound Check | `sound-check/overview.dark.390.png` |
| Drills | `drills/catalog.dark.390.png` |
| Trigger practice setup/run | `practice/configure-single.dark.390.png` |
| Sequence setup/run | `session/configure.dark.390.png` |
| Practice guide | `practice-guide/single.dark.390.png` |
| Learned-sound check | `live-listen/ready.dark.390.png` |
| History | `history/overview.dark.390.png` |
| Settings | `settings/overview.dark.390.png` |
| About | `about/overview.dark.390.png` |
| Contact | `contact/overview.dark.390.png` |
| Shared safety gate | `shared/safety-modal.dark.390.png` |
| Public/indexable manuals | One 390 px case for each state under `public-site/` |

Removed screenshot permutations include Light theme, preview edition, WebKit, 320 px and transient states such as active, paused, cleared and empty. Their behavior remains covered by component tests and semantic browser workflows. WebKit and narrow-layout tests remain in the browser suite; only pixel comparisons are Chromium-only. Failure screenshots, traces and HTML reports remain CI artifacts.
