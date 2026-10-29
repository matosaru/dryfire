export type ChromeSnapshot = { view: string; status: string; navigationDisabled: boolean };
export type ChromeRenderer = {
  update(state: ChromeSnapshot): void;
  dispose(): void;
};
export type ChromeFactory = (options: { doc: Document; initial: ChromeSnapshot; onNavigate: (view: string) => void }) => ChromeRenderer;

/** Native controls are immediately functional without downloading React. The
 * optional renderer takes ownership atomically; no page/form node is replaced. */
export function createChromeBridge(doc: Document, onNavigate: (view: string) => void) {
  const hosts = ['header.hero', '.tabs'].map(selector => doc.querySelector(selector));
  if (hosts.some(host => !host)) throw new Error('Shared chrome regions are missing.');
  const regions = hosts as Element[];
  const controls = regions.flatMap(host => [...host.querySelectorAll<HTMLButtonElement | HTMLAnchorElement>('button,a.header-link,a.brand-home')]);
  const destinations: Record<string, string> = { brandHome: 'home', settingsShortcut: 'settings', aboutBtn: 'about', contactBtn: 'contact' };
  const state: ChromeSnapshot = { view: 'home', status: 'Loading…', navigationDisabled: false };
  let renderer: ChromeRenderer | undefined, disposed = false;
  const activate = (event: Event) => {
    const button = (event.target as Element).closest?.<HTMLButtonElement | HTMLAnchorElement>('button,a.header-link,a.brand-home');
    if (!button || ('disabled' in button && button.disabled)) return;
    if (button instanceof HTMLAnchorElement) {
      const click=event as MouseEvent;
      if(click.button!==0||click.metaKey||click.ctrlKey||click.altKey||click.shiftKey)return;
      event.preventDefault();
    }
    const view = button.dataset.view ?? destinations[button.id];
    if (view) {
      if((event as MouseEvent).detail===0&&button.classList.contains('header-link'))button.dataset.tipOff='true';
      onNavigate(view);
    }
  };
  const tooltip = (event: Event) => {
    const link=(event.target as Element).closest?.<HTMLElement>('.header-link');
    if(!link)return;
    if(event.type==='keydown') { if((event as KeyboardEvent).key==='Escape')link.dataset.tipOff='true'; }
    else if((event.type!=='pointerout'||doc.activeElement!==link)&&!link.contains((event as FocusEvent).relatedTarget as Node|null))delete link.dataset.tipOff;
  };
  regions.forEach(host => host.addEventListener('click', activate));
  for(const type of ['keydown','focusout','pointerout']) regions[0].addEventListener(type,tooltip);
  const removeNative = () => {
    regions.forEach(host => host.removeEventListener('click', activate));
    for(const type of ['keydown','focusout','pointerout']) regions[0].removeEventListener(type,tooltip);
  };
  const applied: Partial<ChromeSnapshot> = {};
  const update = <Key extends keyof ChromeSnapshot>(key: Key, value: ChromeSnapshot[Key]) => {
    if (disposed || applied[key] === value) return;
    applied[key] = state[key] = value;
    if (renderer) { renderer.update(state); return; }
    if (key === 'view') {
      const value = state.view;
      for (const button of controls) {
        const route = button.dataset.view ?? destinations[button.id];
        const selected = route === value || route === 'drills' && ['session', 'practice', 'practiceGuide'].includes(value);
        if (route && button.classList.contains('active') !== selected) button.classList.toggle('active', selected);
        const current = selected ? 'page' : null;
        if (button.getAttribute('aria-current') !== current) button.ariaCurrent = current;
      }
    }
    if (key === 'status') doc.getElementById('statusPill')!.textContent = state.status;
    if (key === 'navigationDisabled') controls.forEach(button => { if (button instanceof HTMLButtonElement && button.dataset.view) button.disabled = state.navigationDisabled; });
  };
  return {
    view(value: string) { update('view', value); },
    status(value: string) { update('status', value); },
    navigationDisabled(value: boolean) { update('navigationDisabled', value); },
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
