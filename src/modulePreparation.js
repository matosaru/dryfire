/** Cache lazy page modules without mounting or changing the current screen.
 * Callers retain all route, capture, safety and draft ownership guards. */
export function createModulePreparation(onError) {
  const entries = new Map();
  return (key, load) => {
    const existing = entries.get(key);
    if (existing) return existing.module;
    const entry = {};
    entries.set(key, entry);
    load().then(module => { entry.module = module; }).catch(error => {
      entries.delete(key);
      onError(error);
    });
    return undefined;
  };
}
