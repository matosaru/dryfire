/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {serialize,deserialize} from 'node:v8';
import {renderPageTemplates} from '../tools/page-templates.mjs';
import {createPracticeGuideController} from '../src/practiceGuideController.js';
import {loadLocale} from '../apps/web/src/localization/runtime.ts';
const originalClone=globalThis.structuredClone;
beforeAll(()=>{globalThis.structuredClone=value=>deserialize(serialize(value));});
afterAll(()=>{globalThis.structuredClone=originalClone;});
afterEach(async()=>{document.body.replaceChildren();await loadLocale('en');});
test('an already open guide refreshes all retained guidance after locale changes',async()=>{
 document.body.innerHTML=renderPageTemplates('{{app}}');
 const controller=createPracticeGuideController({onBack:()=>{}});
 controller.open({type:'practice',mode:'single',gunId:'gun-a',routeKey:'setup-a',config:{repetitions:2}});
 await loadLocale('de');controller.refreshLocale();
 expect(document.getElementById('practiceGuidePlayBtn')).toHaveTextContent('Beispiel abspielen');
 expect(document.getElementById('practiceGuideKind')).toHaveTextContent('ÜBUNGSANLEITUNG');
 expect(document.getElementById('practiceGuideName').textContent).not.toBe('Single trigger press');
 expect(document.getElementById('practiceGuideSteps').textContent).not.toContain('Wait');
});
test.each([
 ['de','Beispiel abspielen','Beispiel stoppen','Beispiel: Das Mikrofon hört zu.'],
 ['nl','Voorbeeld afspelen','Voorbeeld stoppen','Voorbeeld: de microfoon luistert.'],
])('guide example controls and accessible description update in %s',async(locale,play,stop,earlyDescription)=>{
 await loadLocale(locale);document.body.innerHTML=renderPageTemplates('{{app}}');
 const controller=createPracticeGuideController({onBack:()=>{}});
 const guide=controller.open({type:'practice',mode:'single',gunId:'gun-a',routeKey:'setup-a',config:{repetitions:2}});
 expect(document.getElementById('practiceGuidePlayBtn')).toHaveTextContent(play);
 expect(document.getElementById('example-practiceStopBtn')).toHaveAttribute('aria-label',stop);
 expect(document.getElementById('practiceGuideExample')).toHaveAttribute('aria-label',expect.stringContaining(guide.title));
 document.getElementById('practiceGuideEarlyBtn').click();
 expect(document.getElementById('practiceGuidePlayBtn')).toHaveTextContent(play);
 expect(document.getElementById('practiceGuideExample').getAttribute('aria-label')).toContain(earlyDescription);
 controller.pause();
});
