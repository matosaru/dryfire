/** Let a usable native screen paint before preparing its optional enhancement.
 * This schedules no DOM changes; the caller still owns any later handoff. */
export function afterPaint(load, frame = globalThis.requestAnimationFrame, task = globalThis.setTimeout) {
  return new Promise((resolve, reject) => {
    frame(() => task(() => { Promise.resolve().then(load).then(resolve, reject); }, 0));
  });
}
