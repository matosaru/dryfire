import { editionCapabilities, canSaveCustomDrill } from '../src/buildEdition.js';

test('public defaults preserve basic use but disable future paid creation and graphs', () => {
  expect(editionCapabilities()).toEqual({ edition: 'public', gunCreationLimit: 1, customDrillCreation: false, advancedGraphs: false });
});
test('explicit preview retains the existing full feature capacity', () => {
  expect(editionCapabilities('preview')).toEqual({ edition: 'preview', gunCreationLimit: 5, customDrillCreation: true, advancedGraphs: true });
});
test('unknown editions fail closed', () => {
  for (const edition of ['pro', '', null, 'PUBLIC']) expect(() => editionCapabilities(edition)).toThrow('Unknown build edition');
});
test('public permits editing only an already owned saved preset', () => {
  const capabilities = editionCapabilities();
  const drills = [{ id: 'custom-existing' }];
  expect(canSaveCustomDrill(capabilities, 'custom-existing', drills)).toBe(true);
  expect(canSaveCustomDrill(capabilities, null, drills)).toBe(false);
  expect(canSaveCustomDrill(capabilities, 'custom-new', drills)).toBe(false);
  expect(canSaveCustomDrill(capabilities, 'custom-existing', [])).toBe(false);
});
test('preview can create presets without changing public capability objects', () => {
  expect(canSaveCustomDrill(editionCapabilities('preview'), null, [])).toBe(true);
  expect(editionCapabilities().customDrillCreation).toBe(false);
});
