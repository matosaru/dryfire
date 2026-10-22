/** Let a usable native screen paint before preparing its optional enhancement.
 * The callback retains ownership of any work; scheduling never transfers it. */
export function afterPaint(load, frame = globalThis.requestAnimationFrame, task = globalThis.setTimeout) {
  return new Promise((resolve, reject) => {
    frame(() => task(() => { Promise.resolve().then(load).then(resolve, reject); }, 0));
  });
}
