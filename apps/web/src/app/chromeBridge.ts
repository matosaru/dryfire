export type ChromeSnapshot = { view: string; status: string; navigationDisabled: boolean };
export type ChromeRenderer = {
  update(state: ChromeSnapshot): void;
  dispose(): void;
};
export type ChromeFactory = (options: { doc: Document; initial: ChromeSnapshot; onNavigate: (view: string) => void }) => ChromeRenderer;

/** Native controls are immediately functional without downloading React. The
 * optional renderer takes ownership atomically; no page/form node is replaced. */
export function createChromeBridge(doc: Document, onNavigate: (view: string) => void) {
  const hosts = ['header.hero', '.footer-links', '.tabs'].map(selector => doc.querySelector(selector));
  if (hosts.some(host => !host)) throw new Error('Shared chrome regions are missing.');
  const regions = hosts as Element[];
  const controls = regions.flatMap(host => [...host.querySelectorAll<HTMLButtonElement>('button')]);
  const destinations: Record<string, string> = { settingsShortcut: 'settings', aboutBtn: 'about', contactBtn: 'contact' };
  const state: ChromeSnapshot = { view: 'home', status: 'Loading…', navigationDisabled: false };
  let renderer: ChromeRenderer | undefined, disposed = false;
  const activate = (event: Event) => {
    const button = (event.target as Element).closest?.('button');
    if (!button || button.disabled) return;
    const view = button.dataset.view ?? destinations[button.id];
    if (view) onNavigate(view);
  };
  regions.forEach(host => host.addEventListener('click', activate));
  const removeNative = () => regions.forEach(host => host.removeEventListener('click', activate));
  const update = (patch: Partial<ChromeSnapshot>) => {
    if (disposed) return;
    Object.assign(state, patch);
    if (renderer) { renderer.update(state); return; }
    if (patch.view !== undefined) {
      const value = state.view;
      for (const button of controls) {
        const route = button.dataset.view ?? destinations[button.id];
        const selected = route === value || route === 'drills' && ['session', 'practice', 'practiceGuide'].includes(value);
        if (button.dataset.view || route === 'settings') button.classList.toggle('active', selected);
        button.ariaCurrent = selected ? 'page' : null;
      }
    }
    if (patch.status !== undefined) doc.getElementById('statusPill')!.textContent = state.status;
    if (patch.navigationDisabled !== undefined) controls.forEach(button => { if (button.dataset.view) button.disabled = state.navigationDisabled; });
  };
  return {
    view(value: string) { update({ view: value }); },
    status(value: string) { update({ status: value }); },
    navigationDisabled(value: boolean) { update({ navigationDisabled: value }); },
    enhance(mount: ChromeFactory) {
      if (disposed || renderer) return;
      // The factory must finish its synchronous commit before returning. Keep
      // fallback handlers until then so a failed mount does not strand users.
      renderer = mount({ doc, initial: { ...state }, onNavigate });
      removeNative();
    },
    dispose() {
      if (disposed) return;
      disposed = true; removeNative(); renderer?.dispose();
    },
  };
}
