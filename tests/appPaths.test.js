import {parseAppPath,appPathFor,isAppPath,offlineAppPaths,legacyPathRedirect,guidePathFor} from '../src/appPaths.js';
test('canonical application pages use flat paths with the application at root',()=>{
 for(const [view,path]of Object.entries({home:'/',guns:'/guns/',gunSetup:'/gun-setup/',learn:'/learn/',drills:'/drills/',recognize:'/live-listen/',history:'/history/',settings:'/settings/',about:'/about/',contact:'/contact/'})){
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
 const paths=offlineAppPaths();expect(new Set(paths).size).toBe(paths.length);for(const path of paths){expect(isAppPath(path)).toBe(true);expect(path.split('/').filter(Boolean).length).toBeLessThanOrEqual(1);}expect(paths).toContain('/');
 expect(appPathFor({view:'session',preset:'private-preset-id',gunId:'private-gun'})).toBe('/custom-sequence/');expect(appPathFor({view:'unknown',gunId:'private'})).toBe('/');
});
test('legacy links preserve their meaning without the app prefix or a replacement marketing homepage',()=>{
 for(const[path,target]of Object.entries({'/app/':'/','/app':'/','/app/learn/':'/learn/','/app/guns/setup/':'/gun-setup/','/app/practice/par-time/':'/par-time-practice/','/practice/par-time/':'/par-time-practice-guide/','/app/sequence/':'/drills/','/welcome/':'/about/','/guides/sequence-drills/':'/sequence-drills-guide/','/index.html':'/'}))expect(legacyPathRedirect(path)).toBe(target);
 for(const path of ['/learn/','/app/unknown/','/app/../private/','//outside.test/'])expect(legacyPathRedirect(path)).toBeNull();
});
