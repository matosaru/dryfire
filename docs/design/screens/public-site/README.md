# Public website — shared app and informational layouts

CHG-061,2026-10-24. Root opens the actual trainer; marketing is retained inside About. Public About/Contact/manuals prerender their actual app components, with the same header/footer/fixed navigation. Static overview/Help pages reuse the same shell.  [Public SEO requirements](../../../requirements/public-seo.md) own behavior. PublicPage composes shared chrome with real links, Dark default, white text, orange action and fixed navigation. Content is readable without JS/profile/microphone and reuses actual in-app manuals. [SEO route plan](../../../seo/indexable-routes-plan.md) owns URLs; [history](../../../project/implementation-history.md) separates acceptance/publication from live deployment.

| Page | Current capture |
| --- | --- |
| home `/` | Reuses [first-gun app capture](../gun-setup/first-gun.dark.png) and Home |
| practice | [practice.dark.png](practice.dark.png) |
| single | [single.dark.png](single.dark.png) |
| repeated | [repeated.dark.png](repeated.dark.png) |
| par | [par.dark.png](par.dark.png) |
| control | [control.dark.png](control.dark.png) |
| sequence | [sequence.dark.png](sequence.dark.png) |
| calibration | [calibration.dark.png](calibration.dark.png) |
| help | [help.dark.png](help.dark.png) |
| about | Reuses [About capture](../about/overview.dark.png) |
| contact | Reuses [Contact capture](../contact/overview.dark.png) |
| sequence-rack-trigger | [sequence-rack-trigger.dark.png](sequence-rack-trigger.dark.png) |
| sequence-mag-trigger | [sequence-mag-trigger.dark.png](sequence-mag-trigger.dark.png) |
| sequence-draw-mag-trigger | [sequence-draw-mag-trigger.dark.png](sequence-draw-mag-trigger.dark.png) |

Public images use no personal fixtures. `/welcome/` redirects to About on every host. The original marketing-home design is archived outside the current screenshot set; marketing content remains live in About. Existing unrelated app/GIF appearance stays unchanged.

[Preserved original marketing design](../../archive/chg-060/README.md) is historical evidence; the live marketing content belongs to About.

Root/About/Contact deliberately reuse the canonical app-screen captures rather than duplicate identical PNGs. HTTP/no-JS/deep-entry tests separately verify each public URL. Public reference files cover the remaining distinct informational screens.
