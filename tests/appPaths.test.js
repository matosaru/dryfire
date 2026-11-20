import {parseAppPath,appPathFor,isAppPath,offlineAppPaths,legacyPathRedirect,guidePathFor,isIndexableAppPath,appTitleFor} from '../src/appPaths.js';
import {loadLocale,translate} from '../apps/web/src/localization/runtime.ts';
test('canonical application pages use flat paths with the application at root',()=>{
 for(const [view,path]of Object.entries({home:'/',guns:'/guns/',gunSetup:'/gun-setup/',learn:'/learn/',soundCheck:'/sound-check/',drills:'/drills/',recognize:'/live-listen/',history:'/history/',settings:'/settings/',about:'/about/',contact:'/contact/'})){
  expect(appPathFor({view})).toBe(path);expect(parseAppPath(path)).toEqual({view});
 }
 expect(parseAppPath('/app/learn/')).toBeNull();for(const path of ['/unknown/','/history/private-id/','/help/'])expect(isAppPath(path)).toBe(false);
});
test('each practice and built-in sequence has a distinct restorable identity',()=>{
 for(const [mode,slug]of Object.entries({single:'single-trigger-press',repeated:'repeated-trigger-press',par:'par-time-practice',control:'trigger-control'})){
  const path=`/${slug}/`;expect(appPathFor({view:'practice',mode})).toBe(path);expect(parseAppPath(path)).toEqual({view:'practice',mode});expect(parseAppPath(guidePathFor(mode))).toEqual({view:'practiceGuide',guideId:mode});
 }
 const paths=[];
 for(const [preset,slug]of Object.entries({'rack-trigger':'rack-slide-trigger-pull','mag-trigger':'magazine-change-trigger-pull','draw-mag-trigger':'draw-magazine-change-trigger-pull'})){
  const path=`/${slug}/`;paths.push(path);expect(appPathFor({view:'session',preset})).toBe(path);expect(parseAppPath(path)).toEqual({view:'session',preset});expect(parseAppPath(guidePathFor('sequence-'+preset))).toEqual({view:'practiceGuide',guideId:'sequence-'+preset});
 }
 expect(new Set(paths).size).toBe(3);
});
test('offline path inventory is unique, flat and restricted to implemented screens',()=>{
 const paths=offlineAppPaths();expect(new Set(paths).size).toBe(paths.length);for(const path of paths){expect(isAppPath(path)).toBe(true);expect(path.split('/').filter(Boolean).filter(segment=>!['de','nl'].includes(segment)).length).toBeLessThanOrEqual(1);}expect(paths).toContain('/');
 expect(appPathFor({view:'session',preset:'private-preset-id',gunId:'private-gun'})).toBe('/custom-sequence/');expect(appPathFor({view:'unknown',gunId:'private'})).toBe('/');
});
test('legacy links preserve their meaning without the app prefix or a replacement marketing homepage',()=>{
 for(const[path,target]of Object.entries({'/app/':'/','/app':'/','/app/learn/':'/learn/','/app/guns/setup/':'/gun-setup/','/app/practice/par-time/':'/par-time-practice/','/practice/par-time/':'/par-time-practice-guide/','/app/sequence/':'/drills/','/welcome/':'/about/','/guides/sequence-drills/':'/sequence-drills-guide/','/index.html':'/'}))expect(legacyPathRedirect(path)).toBe(target);
 for(const path of ['/learn/','/app/unknown/','/app/../private/','//outside.test/'])expect(legacyPathRedirect(path)).toBeNull();
});

test('URL-aware navigation preserves real transitions without redundant same-URL browser work',async()=>{
 const {readFileSync}=await import('node:fs'),{runInNewContext}=await import('node:vm');const source=readFileSync(new URL('../src/main.js',import.meta.url),'utf8');const start=source.indexOf('urlFor:appURLs?')+'urlFor:appURLs?'.length,end=source.indexOf(':undefined,',start);const context={appPathFor,pendingEntry:null,location:{pathname:'/',search:'?keep=1'}};const urlFor=runInNewContext(source.slice(start,end),context);
 expect(urlFor({view:'home'})).toBeUndefined();expect(urlFor({view:'learn'})).toBe('/learn/?keep=1');context.location.pathname='/learn/';expect(urlFor({view:'learn'})).toBeUndefined();expect(urlFor({view:'home'})).toBe('/?keep=1');context.pendingEntry={view:'practice',mode:'par'};expect(urlFor({view:'gunSetup'})).toBe('/par-time-practice/?keep=1');
});

test('ordinary-route fast lookup still rejects internal view keys that are not canonical URL slugs',()=>{for(const path of ['/home/','/recognize/','/gunSetup/','/settings-extra/','/settings',null,undefined,0,{},[]])expect(parseAppPath(path)).toBeNull();expect(parseAppPath('/gun-setup/')).toEqual({view:'gunSetup'});expect(parseAppPath('/live-listen/')).toEqual({view:'recognize'});});

test('German and Dutch routes add explicit locale prefixes while English remains the stable default',()=>{
 for(const locale of ['de','nl'])for(const view of ['home','learn','settings','history','about']){
  const path=appPathFor({view,locale});expect(path).toBe(`/${locale}${view==='home'?'/':`/${view}/`}`);
  expect(parseAppPath(path)).toEqual({view,locale});expect(isIndexableAppPath(path)).toBe(false);
 }
 expect(appPathFor({view:'settings',locale:'en'})).toBe('/settings/');expect(parseAppPath('/de/single-trigger-press/')).toEqual({view:'practice',mode:'single',locale:'de'});
 expect(offlineAppPaths()).toContain('/nl/settings/');expect(offlineAppPaths()).toContain('/de/');
});

test.each([{locale:'de',view:'settings',expected:'Einstellungen — Dry Fire With Ease'},{locale:'nl',view:'history',expected:'Geschiedenis — Dry Fire With Ease'}])('document titles follow the selected locale for $locale $view routes',async({locale,view,expected})=>{
 await loadLocale(locale);try{expect(appTitleFor({view,locale},translate)).toBe(expected);}finally{await loadLocale('en');}
});

test('localized guide document titles use the published localized SEO title',async()=>{
 await loadLocale('de');try{expect(appTitleFor({view:'practiceGuide',guideId:'sequence-rack-trigger',locale:'de'},translate)).toBe('Anleitung: Verschluss spannen und Abzug betätigen — Dry Fire With Ease');}finally{await loadLocale('en');}
});
