/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {jest} from '@jest/globals';
import {renderLegacyPracticeCatalog} from '../src/optional/localizedDrillCatalog.js';

test('native fallback practice cards use localized labels without changing mode ids',()=>{
 document.body.innerHTML='<div id="practiceCatalog"><article class="preset-card"><h3>Single trigger press</h3><p>Old description</p><button data-practice-mode="single">Start Drill</button></article></div>';
 const translate=jest.fn((_namespace,key)=>({
  'manuals.single.title':'Een keer de trekker overhalen',
  'modes.singleDescription':'Reactietijd na een startsignaal.',
  'cards.start':'▶ Oefening starten',
 }[key]));
 renderLegacyPracticeCatalog(document,{practiceModes:[{id:'single'}],translate});
 expect(document.querySelector('#practiceCatalog h3')).toHaveTextContent('Een keer de trekker overhalen');
 expect(document.querySelector('#practiceCatalog p')).toHaveTextContent('Reactietijd na een startsignaal.');
 expect(document.querySelector('#practiceCatalog button')).toHaveTextContent('▶ Oefening starten');
 expect(document.querySelector('#practiceCatalog button')).toHaveAttribute('data-practice-mode','single');
 expect(translate).toHaveBeenCalledTimes(3);
});
