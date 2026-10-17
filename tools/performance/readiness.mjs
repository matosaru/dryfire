/** Shared by the browser probe and its DOM characterization tests. The Ready
 * label can precede queued navigation; measure usable UI, not that text alone. */
export function usableInitialScreen(doc) {
  if (doc.getElementById('statusPill')?.textContent !== 'Ready') return false;
  const view = doc.body?.dataset.view;
  if (!['home', 'gunSetup'].includes(view)) return false;
  const section = doc.getElementById(view + 'View');
  if (!section || section.classList.contains('hidden')) return false;
  const controls = view === 'home' ? ['homeDrillsBtn'] : ['gunName', 'saveGunBtn'];
  return controls.every(id => {
    const control = doc.getElementById(id);
    return control && !control.disabled;
  });
}
