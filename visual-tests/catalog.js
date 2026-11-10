import { readFileSync } from 'node:fs';
import { readBuildProfile, resolveBuildEdition } from '../tools/build-profile.mjs';
const registry = JSON.parse(readFileSync(new URL('../docs/architecture/screen-map.json', import.meta.url)));
export const catalog = [...registry.screens, ...registry.shared, ...(registry.publicScreens??[])].flatMap(screen => screen.states.map(state => ({
  screen: screen.id, folder: screen.folder, state: state.key, anchor: state.anchor, view: screen.domId,
  editions: state.edition ? [state.edition] : ['public', 'preview'],
})));
// CHG-069: one canonical 390 px Chromium image owns each application page
// type. Every public-content state is a distinct URL and therefore a distinct
// page. Transient states, alternate themes, editions and narrow-width behavior
// remain protected by semantic component/integration/browser tests.
const representative = new Map([
  ['gunSetup','first-gun.dark'], ['home','overview.dark'], ['guns','library.dark'],
  ['learn','overview.dark'], ['soundCheck','overview.dark'], ['drills','catalog.dark'],
  ['practice','configure-single.dark'], ['session','configure.dark'],
  ['practiceGuide','single.dark'], ['recognize','ready.dark'], ['history','overview.dark'],
  ['settings','overview.dark'], ['about','overview.dark'], ['contact','overview.dark'],
  ['safety','safety-modal.dark'],
]);
export const allCases = catalog
  .filter(item => item.screen === 'publicSite' || representative.get(item.screen) === item.state)
  .map(item => ({...item, width:390, edition:'public'}));
export const edition = resolveBuildEdition({ defaultEdition: readBuildProfile(), explicit: process.env.VISUAL_EDITION ?? process.env.APP_EDITION });
export const cases = allCases.filter(item => item.edition === edition);
export const baselineName = item => `${item.edition}/${item.folder}/${item.state}.${item.width}.png`;
