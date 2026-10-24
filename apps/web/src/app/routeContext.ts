import { PAGE_IDS } from '../../../../src/pageDefinitions.js';
import { isGuideContextCurrent, isPublicGuideContextCurrent } from '../../../../src/practiceGuides.js';

type GunId = string | number;
type Controller = { routeKey(): string | null; guideContext(): unknown };
type Guide = { id?: string; publicEntry?: boolean; gunId: GunId; parent: string; sourceKey: string; contextKey: string };
export type AppRoute = { view: string; gunId: GunId | null; context?: string | null };
type Context = readonly [
  gun: { id: GunId; needsDetails?: boolean } | null,
  practice: Controller | null,
  sequence: Controller | null,
  guide: { current(): Guide | null } | null,
];

/** Route validation reads current gun/controller owners supplied at the call.
 * The router still owns history serialization and capture/save guards. */
export function resolveRouteView(route: AppRoute, [activeGun, practiceController, sessionController, practiceGuideController]: Context): string {
  const publicGuide = practiceGuideController?.current();
  if (route.view === 'practiceGuide' && route.gunId === (activeGun?.id ?? null) && route.context === publicGuide?.contextKey && isPublicGuideContextCurrent(publicGuide, activeGun?.id)) return 'practiceGuide';
  if (!activeGun || activeGun.needsDetails) return ['gunSetup', 'guns', 'settings', 'about', 'contact'].includes(route.view) ? route.view : 'gunSetup';
  if (route.gunId !== activeGun.id) return route.view === 'practiceGuide' ? 'drills' : 'home';
  if (route.view === 'practiceGuide') {
    const guide = practiceGuideController?.current();
    const owner = guide?.parent === 'practice' ? practiceController : sessionController;
    if (!owner?.guideContext() || !isGuideContextCurrent(guide, activeGun.id, owner.routeKey()) || route.context !== guide?.contextKey) return 'drills';
  }
  if (route.view === 'practice' && (!practiceController?.routeKey() || route.context !== practiceController.routeKey())) return 'drills';
  if (route.view === 'session' && (!sessionController?.routeKey() || route.context !== sessionController.routeKey())) return 'drills';
  return PAGE_IDS.includes(route.view) ? route.view : 'home';
}
