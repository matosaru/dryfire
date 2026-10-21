/** Prepare read-only guides outside startup. Import completion never changes DOM;
 * only an explicit, still-owned Open creates the controller and navigates. */
export function createPracticeGuideBridge({ onBack, onNavigate, onError,
  load = () => import('./practiceGuideController.js') }) {
  let module, pending, controller, generation = 0;
  function prepare() {
    if (module) return Promise.resolve(module);
    return pending ||= load().then(value => { module = value; return value; }).finally(() => { pending = null; });
  }
  return {
    prepare,
    async open(resolveContext) {
      const request = ++generation;
      const original = resolveContext();
      if (!original) return false;
      const owned = current => current && current.gunId === original.gunId && current.routeKey === original.routeKey && current.type === original.type;
      try {
        const ready = await prepare().catch(error => {
          throw new Error('Practice guide could not load. Your setup is unchanged. Check your connection and reload to try again.', { cause: error });
        });
        if (request !== generation) return false;
        const current = resolveContext();
        if (!owned(current)) return false;
        controller ||= ready.createPracticeGuideController({ onBack });
        controller.open(current);
        onNavigate();
        return true;
      } catch (error) {
        if (request === generation && owned(resolveContext())) onError(error);
        return false;
      }
    },
    pause() { generation++; controller?.pause(); },
    current() { return controller?.current() ?? null; },
    connectView(mount) { return controller?.connectView(mount) ?? false; },
    connectPage(mount) { return controller?.connectPage(mount) ?? false; },
  };
}
