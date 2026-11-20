/** @jest-environment jsdom */
import {readFileSync} from 'node:fs';
import {renderLegacyLiveDrill} from '../src/optional/renderLegacyLiveDrill.js';
import {loadLocale,translate} from '../apps/web/src/localization/runtime.ts';

test('native live drill feedback follows the selected locale',async()=>{
 await loadLocale('de');try{document.body.innerHTML=readFileSync(new URL('./fixtures/legacy-live-listen-page.html',import.meta.url),'utf8');const drill={steps:['trigger','rack']},state={stepIndex:0,completed:0,incorrect:0,unknown:0,lastOutcome:'ready'};renderLegacyLiveDrill(document,drill,state,label=>label,true,(key,parameters)=>translate('live-listen',key,parameters));expect(document.getElementById('drill-heading').textContent).toBe('Übungseinheit');expect(document.getElementById('drillProgressBadge').textContent).toBe('Schritt 1 / 2');expect(document.getElementById('drillFeedback').textContent).toBe('Bereit · erwartet trigger.');}finally{await loadLocale('en');}
});
