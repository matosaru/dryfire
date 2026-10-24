import { readFileSync } from 'node:fs';
import { readBuildProfile, resolveBuildEdition } from '../tools/build-profile.mjs';
const registry = JSON.parse(readFileSync(new URL('../docs/architecture/screen-map.json', import.meta.url)));
export const catalog = [...registry.screens, ...registry.shared].flatMap(screen => screen.states.map(state => ({
  screen: screen.id, folder: screen.folder, state: state.key, anchor: state.anchor, view: screen.domId,
  editions: state.edition ? [state.edition] : ['public', 'preview'],
})));
// Additional narrow-width captures supplement every registered state at 390 px.
const narrow = new Set(['recognize/needs-training.dark','recognize/needs-training.light','practiceGuide/single.dark', 'practiceGuide/single.light', 'practiceGuide/single-early.dark', 'practiceGuide/single-early.light', 'gunSetup/first-gun.dark', 'guns/library.dark', 'guns/library.light', 'learn/overview.dark',
  'drills/catalog.dark', 'practice/configure-single.dark', 'practice/active.dark', 'history/progress.dark',
  'history/overview.dark', 'settings/installation-help.dark', 'settings/installation-help.light', 'settings/overview.dark', 'settings/overview.light', 'settings/preview-free.dark', 'settings/preview-free.light', 'settings/preview-full.dark', 'settings/preview-full.light', 'about/overview.dark', 'about/overview.light', 'contact/overview.dark', 'contact/overview.light', 'safety/safety-modal.dark']);
export const allCases = catalog.flatMap(item => item.editions.flatMap(edition => [390, ...(narrow.has(`${item.screen}/${item.state}`) ? [320] : [])].map(width => ({ ...item, width, edition }))));
export const edition = resolveBuildEdition({ defaultEdition: readBuildProfile(), explicit: process.env.VISUAL_EDITION ?? process.env.APP_EDITION });
export const cases = allCases.filter(item => item.edition === edition);
export const baselineName = item => `${item.edition}/${item.folder}/${item.state}.${item.width}.png`;
