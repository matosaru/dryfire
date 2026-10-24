import {parseAppPath,appPathFor,isAppPath} from '../src/appPaths.js';
test('known app paths map to stable screen/mode identities without private URL fields',()=>{
 expect(parseAppPath('/app/history/')).toEqual({view:'history'});expect(parseAppPath('/app/practice/single-trigger-press/')).toEqual({view:'practice',mode:'single'});expect(appPathFor({view:'recognize'})).toBe('/app/live-listen/');expect(appPathFor({view:'practice',context:'single'})).toBe('/app/practice/single-trigger-press/');
 for(const path of ['/app/unknown/','/app/practice/unknown/','/app/history/private-id/','/help/'])expect(parseAppPath(path)).toBeNull();expect(isAppPath('/app/')).toBe(true);
});

test('all supported app screens round-trip, and unknown/private identifiers do not become URL paths',()=>{for(const view of ['home','guns','gunSetup','learn','drills','recognize','history','settings','about','contact','session','practiceGuide'])expect(parseAppPath(appPathFor({view}))).toEqual({view});for(const mode of ['single','repeated','par','control'])expect(parseAppPath(appPathFor({view:'practice',mode}))).toEqual({view:'practice',mode});expect(appPathFor({view:'unknown',gunId:'secret'})).toBe('/app/');});
