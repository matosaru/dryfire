/** Browser and in-app navigation share one serialized capture/storage guard. */
export function createScreenNavigation({ history, events, initial, resolve, show, canLeave, beforeLeave, onError }) {
  const valid = value => value?.dryfireNavigation === 1 && Number.isInteger(value.index) && value.index >= 0 && value.route;
  let current = { dryfireNavigation: 1, index: valid(history.state) ? history.state.index : 0, route: initial };
  let queue = Promise.resolve(), restoring = false;
  history.replaceState(current, '');
  const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);
  const enqueue = work => { const task = queue.then(work); queue = task.catch(onError); return task; };
  async function leave() {
    if (!canLeave()) { onError(new Error('Finish the current action or save results before leaving this screen.')); return false; }
    await beforeLeave();
    if (!canLeave()) { onError(new Error('Results could not be saved. Retry saving before leaving.')); return false; }
    return true;
  }
  events.addEventListener('popstate', event => {
    if (restoring) { if (valid(event.state) && event.state.index === current.index) restoring = false; return; }
    const target = valid(event.state) ? event.state : { ...current, index: 0, route: initial };
    enqueue(async () => {
      if (valid(history.state) && history.state.index !== target.index) return;
      if (!await leave()) {
        const distance = current.index - target.index;
        if (distance) { restoring = true; history.go(distance); } else history.replaceState(current, '');
        return;
      }
      const route = resolve(target.route);
      current = { ...target, route }; history.replaceState(current, ''); await show(route);
    });
  });
  return {
    navigate(route) { return enqueue(async () => {
      route = resolve(route);
      if (same(current.route, route)) return true;
      if (!await leave()) return false;
      route = resolve(route);
      current = { dryfireNavigation: 1, index: current.index + 1, route };
      history.pushState(current, ''); await show(route); return true;
    }); },
    back(fallback) { if (current.index > 0) history.back(); else return this.navigate(fallback); },
    flush: () => queue,
  };
}
