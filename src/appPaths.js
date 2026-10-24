import {DRILLS} from './drills.js';
import {practiceDefinition} from './practiceModes.js';

/** Stable public identities only. Gun names, results and custom IDs stay local. */
const views={home:'',gunSetup:'gun-setup',guns:'guns',learn:'learn',drills:'drills',recognize:'live-listen',history:'history',settings:'settings',about:'about',contact:'contact'};
const modes={single:'single-trigger-press',repeated:'repeated-trigger-press',par:'par-time-practice',control:'trigger-control'};
const sequences={'rack-trigger':'rack-slide-trigger-pull','mag-trigger':'magazine-change-trigger-pull','draw-mag-trigger':'draw-magazine-change-trigger-pull','trigger-only':'trigger-pull-sequence'};
const pathFor=slug=>`/${slug}${slug?'/':''}`;
export function setupForGuide(guideId){
 if(Object.hasOwn(modes,guideId))return{view:'practice',mode:guideId};
 if(guideId==='sequence-custom')return{view:'session',preset:'custom'};
 const preset=guideId?.startsWith('sequence-')?guideId.slice(9):null;
 return Object.hasOwn(sequences,preset)?{view:'session',preset}:null;
}
export function guidePathFor(guideId){
 const setup=setupForGuide(guideId);
 if(!setup)return '/drills/';
 const slug=setup.view==='practice'?modes[setup.mode]:setup.preset==='custom'?'custom-sequence':sequences[setup.preset];
 return pathFor(slug+'-guide');
}
/** Build-only inventory; do not eagerly allocate this list in the app entry. */
export function offlineAppPaths(){return[
 ...Object.values(views).map(pathFor),...Object.values(modes).map(pathFor),...Object.values(sequences).map(pathFor),'/custom-sequence/',
 ...Object.keys(modes).map(guidePathFor),...Object.keys(sequences).map(id=>guidePathFor('sequence-'+id)),guidePathFor('sequence-custom'),
];}
export function parseAppPath(path){
 if(path==='/')return{view:'home'};
 for(const[view,slug]of Object.entries(views))if(path===pathFor(slug))return{view};
 for(const[mode,slug]of Object.entries(modes))if(path===pathFor(slug))return{view:'practice',mode};
 for(const[preset,slug]of Object.entries(sequences))if(path===pathFor(slug))return{view:'session',preset};
 if(path==='/custom-sequence/')return{view:'session',preset:'custom'};
 for(const mode of Object.keys(modes))if(path===guidePathFor(mode))return{view:'practiceGuide',guideId:mode};
 for(const preset of Object.keys(sequences))if(path===guidePathFor('sequence-'+preset))return{view:'practiceGuide',guideId:'sequence-'+preset};
 if(path===guidePathFor('sequence-custom'))return{view:'practiceGuide',guideId:'sequence-custom'};
 return null;
}
export function isAppPath(path){return parseAppPath(path)!==null;}
export function appPathFor(route){
 if(route.view==='practice'){const mode=route.mode??String(route.context??'').split(':')[0];return pathFor(modes[mode]??modes.single);}
 if(route.view==='session')return pathFor(sequences[route.preset]??'custom-sequence');
 if(route.view==='practiceGuide')return guidePathFor(route.guideId);
 return pathFor(views[route.view]??'');
}
export function isIndexableAppPath(path){
 const route=parseAppPath(path);
 return !!route && (['home','about','contact'].includes(route.view)||route.view==='practiceGuide'&&!['sequence-custom','sequence-trigger-only'].includes(route.guideId));
}
/** Compatibility redirects never guess which sequence a generic old URL meant. */
export function legacyPathRedirect(path){
 if(path==='/index.html')return '/';
 const canonical=path.endsWith('/')?path:path+'/';
 if(canonical==='/app/')return '/';
 if(canonical.startsWith('/app/')){
  const old=canonical.slice(4);
  if(old==='/guns/setup/')return '/gun-setup/';
  if(['/sequence/','/practice-guide/'].includes(old))return '/drills/';
  if(old.startsWith('/practice/')){const slug=old.slice(10,-1);for(const[mode,value]of Object.entries(modes))if(slug===value||mode==='par'&&slug==='par-time')return appPathFor({view:'practice',mode});return null;}
  const route=parseAppPath(old);return route?appPathFor(route):null;
 }
 if(canonical==='/welcome/')return '/about/';
 if(canonical==='/practice/')return '/practice-modes/';
 if(canonical==='/guides/sequence-drills/')return '/sequence-drills-guide/';
 if(canonical==='/guides/trigger-click-calibration/')return '/trigger-click-calibration-guide/';
 if(canonical.startsWith('/practice/')){const slug=canonical.slice(10,-1);for(const[mode,value]of Object.entries(modes))if(slug===value||mode==='par'&&slug==='par-time')return guidePathFor(mode);}
 return null;
}
export function appTitleFor(route){
 const product='Dry Fire With Ease';
 if(route?.view==='home')return product+' — Free Dry-Fire Practice App';
 const titles={gunSetup:'Gun setup',guns:'My Guns',learn:'Learn Sounds',drills:'Drills',recognize:'Live Listen',history:'History',settings:'Settings',about:'About',contact:'Contact'};
 let title=titles[route?.view]??'App';
 if(route?.view==='practice')title=practiceDefinition(route.mode)?.title??'Practice';
 if(route?.view==='session')title=DRILLS.find(drill=>drill.id===route.preset)?.title??'Custom sequence';
 if(route?.view==='practiceGuide'){const setup=setupForGuide(route.guideId);return appTitleFor(setup??{view:'drills'}).replace(' — '+product,' guide — '+product);}
 return title+' — '+product;
}
/** Build-only redirect inventory for installed offline clients using old bookmarks. */
export function legacyRedirects(){
 const paths=['/app/','/app/guns/setup/','/app/sequence/','/app/practice-guide/','/practice/','/welcome/','/guides/sequence-drills/','/guides/trigger-click-calibration/','/index.html',
  ...Object.values(views).filter(Boolean).map(slug=>'/app/'+slug+'/'),
  ...Object.entries(modes).flatMap(([mode,slug])=>{const old=mode==='par'?'par-time':slug;return['/app/practice/'+old+'/','/practice/'+old+'/'];})];
 return Object.fromEntries(paths.flatMap(path=>[path,...(path.endsWith('/')?[path.slice(0,-1)]:[])].map(from=>[from,legacyPathRedirect(from)])));
}
