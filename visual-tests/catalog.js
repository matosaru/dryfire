import { readFileSync } from 'node:fs';
const registry = JSON.parse(readFileSync(new URL('../docs/architecture/screen-map.json', import.meta.url)));
export const catalog = [...registry.screens, ...registry.shared].flatMap(screen => screen.states.map(state => ({
  screen: screen.id, folder: screen.folder, state: state.key, anchor: state.anchor, view: screen.domId,
})));
// Additional narrow-width captures supplement every registered state at 390 px.
const narrow = new Set(['gunSetup/first-gun.dark', 'guns/library.dark', 'guns/library.light', 'learn/overview.dark',
  'drills/catalog.dark', 'practice/configure-single.dark', 'practice/active.dark', 'history/progress.dark',
  'settings/overview.dark', 'settings/overview.light', 'about/overview.dark', 'about/overview.light', 'contact/overview.dark', 'contact/overview.light', 'safety/safety-modal.dark']);
export const cases = catalog.flatMap(item => [390, ...(narrow.has(`${item.screen}/${item.state}`) ? [320] : [])].map(width => ({ ...item, width })));
export const baselineName = item => `${item.folder}/${item.state}.${item.width}.png`;
