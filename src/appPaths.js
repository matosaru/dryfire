import {DRILLS} from './drills.js';
import {practiceDefinition} from './practiceModes.js';

/** Stable public identities only. Gun names, results and custom IDs stay local. */
const views={home:'',gunSetup:'gun-setup',guns:'guns',learn:'learn',soundCheck:'sound-check',drills:'drills',recognize:'live-listen',history:'history',settings:'settings',about:'about',contact:'contact'};
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
export function offlineAppPaths(){const english=[
 ...Object.values(views).map(pathFor),...Object.values(modes).map(pathFor),...Object.values(sequences).map(pathFor),'/custom-sequence/',
 ...Object.keys(modes).map(guidePathFor),...Object.keys(sequences).map(id=>guidePathFor('sequence-'+id)),guidePathFor('sequence-custom'),
];return[...english,...['de','nl'].flatMap(locale=>english.map(path=>`/${locale}${path==='/'?'/':path}`))];}
function parseUnprefixedAppPath(path){
 if(path==='/')return{view:'home'};
 if(typeof path!=='string')return null;
 const slug=path.slice(1,-1),view=Object.entries(views).find(([,value])=>value===slug)?.[0];
 if(Object.hasOwn(views,view)&&path===pathFor(views[view]))return{view};
 for(const[mode,slug]of Object.entries(modes))if(path===pathFor(slug))return{view:'practice',mode};
 for(const[preset,slug]of Object.entries(sequences))if(path===pathFor(slug))return{view:'session',preset};
 if(path==='/custom-sequence/')return{view:'session',preset:'custom'};
 for(const mode of Object.keys(modes))if(path===guidePathFor(mode))return{view:'practiceGuide',guideId:mode};
 for(const preset of Object.keys(sequences))if(path===guidePathFor('sequence-'+preset))return{view:'practiceGuide',guideId:'sequence-'+preset};
 if(path===guidePathFor('sequence-custom'))return{view:'practiceGuide',guideId:'sequence-custom'};
 return null;
}
export function parseAppPath(path){
 if(typeof path!=='string')return null;
 const localized=path.match(/^\/(de|nl)(\/.*)$/);
 const route=parseUnprefixedAppPath(localized?localized[2]:path);
 return route&&localized?{...route,locale:localized[1]}:route;
}
export function isAppPath(path){return parseAppPath(path)!==null;}
export function appPathFor(route){
 let path;
 if(route.view==='practice'){const mode=route.mode??String(route.context??'').split(':')[0];path=pathFor(modes[mode]??modes.single);}
 else if(route.view==='session')path=pathFor(sequences[route.preset]??'custom-sequence');
 else if(route.view==='practiceGuide')path=guidePathFor(route.guideId);
 else path=pathFor(views[route.view]??'');
 return route.locale&&route.locale!=='en'?`/${route.locale}${path}`:path;
}
export function isIndexableAppPath(path){
 const route=parseAppPath(path);
 return !!route && !route.locale && (['home','about','contact'].includes(route.view)||route.view==='practiceGuide'&&!['sequence-custom','sequence-trigger-only'].includes(route.guideId));
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
export function appTitleFor(route,message){
 const product='Dry Fire With Ease';
 const localized=(namespace,key,fallback)=>typeof message==='function'?message(namespace,key):fallback;
 if(route?.view==='home')return localized('public-site','routes.home.title',product+' — Free Dry-Fire Practice App');
 const pages={gunSetup:['gun-setup','page.firstTitle','Gun setup'],guns:['guns','page.title','My Guns'],learn:['learn','page.title','Learn Sounds'],soundCheck:['sound-check','page.title','Sound Check'],drills:['drills','page.title','Drills'],recognize:['live-listen','page.title','Test Learned Sounds'],history:['history','page.title','History'],settings:['settings','page.title','Settings'],about:['public-site','routes.about.title','About — '+product],contact:['public-site','routes.contact.title','Contact — '+product]};
 if(route?.view==='practice')return localized('practice-guide',`manuals.${route.mode}.title`,practiceDefinition(route.mode)?.title??'Practice')+' — '+product;
 if(route?.view==='session')return localized('sequence','page.title',DRILLS.find(drill=>drill.id===route.preset)?.title??'Custom sequence')+' — '+product;
 if(route?.view==='practiceGuide'){
  const guideId=route.guideId??'single',publicId=guideId==='single'||guideId==='repeated'||guideId==='par'||guideId==='control'?guideId:guideId==='sequence-custom'?null:guideId.startsWith('sequence-')?guideId:null;
  const fallbackSetup=setupForGuide(guideId),fallback=appTitleFor(fallbackSetup??{view:'drills'}).replace(' — '+product,' guide — '+product);
  return publicId?localized('public-site',`routes.${publicId}.title`,fallback):localized('practice-guide',`manuals.${guideId==='sequence-custom'?'custom':guideId}.title`,fallback)+' — '+product;
 }
 const page=pages[route?.view];
 return page?localized(page[0],page[1],page[2])+(route?.view==='about'||route?.view==='contact'?'':' — '+product):'App — '+product;
}
/** Build-only redirect inventory for installed offline clients using old bookmarks. */
export function legacyRedirects(){
 const paths=['/app/','/app/guns/setup/','/app/sequence/','/app/practice-guide/','/practice/','/welcome/','/guides/sequence-drills/','/guides/trigger-click-calibration/','/index.html',
  ...Object.values(views).filter(Boolean).map(slug=>'/app/'+slug+'/'),
  ...Object.entries(modes).flatMap(([mode,slug])=>{const old=mode==='par'?'par-time':slug;return['/app/practice/'+old+'/','/practice/'+old+'/'];})];
 return Object.fromEntries(paths.flatMap(path=>[path,...(path.endsWith('/')?[path.slice(0,-1)]:[])].map(from=>[from,legacyPathRedirect(from)])));
}
