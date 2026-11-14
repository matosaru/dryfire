/** @jest-environment jsdom */
import { restoreDeferredAppViews } from '../src/deferredAppViews.js';

test('restores each deferred screen once without losing its descendants or hidden state',()=>{
 document.body.innerHTML='<main id="pageContent"><section id="homeView" class="view">home</section><template data-deferred-app-view="learnView"><section id="learnView" class="view hidden"><h2>Learn</h2><input value="draft"></section></template></main>';
 expect(restoreDeferredAppViews(document)).toBe(1);
 expect(document.querySelectorAll('main > .view')).toHaveLength(2);
 expect(document.querySelector('#learnView h2').textContent).toBe('Learn');
 expect(document.querySelector('#learnView input').value).toBe('draft');
 expect(document.querySelector('#learnView').classList.contains('hidden')).toBe(true);
 expect(restoreDeferredAppViews(document)).toBe(0);
});

test('rejects templates whose screen identity does not match their payload',()=>{
 document.body.innerHTML='<main><template data-deferred-app-view="learnView"><section id="settingsView" class="view"></section></template></main>';
 expect(()=>restoreDeferredAppViews(document)).toThrow('Invalid deferred app view template: learnView');
});
