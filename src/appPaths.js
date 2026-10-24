/** Publicly readable app paths contain screen identity, never personal records. */
const views={home:'',gunSetup:'guns/setup',guns:'guns',learn:'learn',drills:'drills',recognize:'live-listen',history:'history',settings:'settings',about:'about',contact:'contact',session:'sequence',practiceGuide:'practice-guide'};
const modes={single:'single-trigger-press',repeated:'repeated-trigger-press',par:'par-time',control:'trigger-control'};
export function offlineAppPaths() { return ['/app', ...Object.values(views).map(slug => `/app/${slug}${slug ? '/' : ''}`), ...Object.values(modes).map(slug => `/app/practice/${slug}/`)]; }
export function parseAppPath(path){
 if(path==='/app'||path==='/app/')return{view:'home'};
 for(const[view,slug]of Object.entries(views))if(path===`/app/${slug}/`)return{view};
 for(const[mode,slug]of Object.entries(modes))if(path===`/app/practice/${slug}/`)return{view:'practice',mode};
 return null;
}
export function isAppPath(path){return parseAppPath(path)!==null;}
export function appPathFor(route){
 if(route.view==='practice'){const mode=route.mode??String(route.context??'').split(':')[0];return `/app/practice/${modes[mode]??modes.single}/`;}
 return `/app/${views[route.view]??''}${views[route.view]?'/':''}`;
}

export function appTitleFor(route){const titles={home:'Home',gunSetup:'Gun setup',guns:'My Guns',learn:'Learn Sounds',drills:'Drills',recognize:'Live Listen',history:'History',settings:'Settings',about:'About',contact:'Contact',practice:'Practice',session:'Drill Session',practiceGuide:'About this practice'};return `${titles[route?.view]??'App'} — Dry Fire With Ease`;}
