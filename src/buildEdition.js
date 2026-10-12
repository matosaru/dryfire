export function editionCapabilities(edition = 'public') {
  if (!['public', 'preview'].includes(edition)) throw new Error(`Unknown build edition: ${edition}`);
  const full = edition === 'preview';
  return Object.freeze({ edition, gunCreationLimit: full ? 5 : 1, customDrillCreation: full, advancedGraphs: full });
}
export function canSaveCustomDrill(capabilities, id, ownedDrills) {
  return capabilities.customDrillCreation || !!id && ownedDrills.some(drill => drill.id === id);
}
export const CAPABILITIES = editionCapabilities(typeof __BUILD_EDITION__ === 'undefined' ? 'public' : __BUILD_EDITION__);
