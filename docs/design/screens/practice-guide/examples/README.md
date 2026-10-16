# Current guide animation exports

CHG-045: these GIFs are exported at 1× timing from the actual working help component. The component compiles the same run/review templates and uses the same CSS/presentation as live practice. The levels/events are simulated; no microphone or saved session is created. The app plays its controlled DOM example, so GIF files do not add application download weight. Earlier proposal GIFs are historical.

Build public assets, export frames with `node tools/export-guide-examples.mjs --output /tmp/dryfire-guide-frames`, then encode using Python/Pillow: `python3 tools/encode-guide-examples.py /tmp/dryfire-guide-frames`. Use the pinned Chromium environment for reviewed exports; optional `GUIDE_EXPORT_BROWSER` is for local debugging only. Review animations/current screenshots, then commit media and the generated source/hash manifest together. `docs:check` rejects stale sources/media. Playback stops at Review; a viewer can reload to replay the exported GIF.

| Example | Animation |
| --- | --- |
| single | [single.gif](single.gif) |
| single early | [single-early.gif](single-early.gif) |
| repeated | [repeated.gif](repeated.gif) |
| par | [par.gif](par.gif) |
| control | [control.gif](control.gif) |
| reload | [reload.gif](reload.gif) |
| free | [free.gif](free.gif) |
| sequence trigger only | [sequence-trigger-only.gif](sequence-trigger-only.gif) |
| sequence rack trigger | [sequence-rack-trigger.gif](sequence-rack-trigger.gif) |
| sequence mag trigger | [sequence-mag-trigger.gif](sequence-mag-trigger.gif) |
| sequence draw mag trigger | [sequence-draw-mag-trigger.gif](sequence-draw-mag-trigger.gif) |
| sequence custom | [sequence-custom.gif](sequence-custom.gif) |
