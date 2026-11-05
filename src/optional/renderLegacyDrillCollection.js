export function renderLegacyDrillCollection(doc,{custom,limited,creation}){
  const byId=id=>doc.getElementById(id);
  byId('customDrillsTab').classList.toggle('hidden',limited);byId('builtInDrillsTab').parentElement.classList.toggle('hidden',limited);
  byId('builtInDrillsTab').setAttribute('aria-pressed',String(!custom));byId('customDrillsTab').setAttribute('aria-pressed',String(custom));
  byId('drillCatalog').classList.toggle('hidden',custom);byId('newCustomDrillBtn').classList.toggle('hidden',!custom||!creation);byId('customDrillCatalog').classList.toggle('hidden',!custom);
}
