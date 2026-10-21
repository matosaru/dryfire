/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {jest} from '@jest/globals';
import {deferStaticCatalog} from '../tools/static-catalog.mjs';
import {materializeStaticCatalog} from '../src/staticCatalog.js';
import {renderPracticeCatalog} from '../apps/web/src/app/renderPracticeCatalog.tsx';
import {renderCalibrationCatalog} from '../apps/web/src/app/renderCalibrationCatalog.tsx';
import {PRACTICE_MODES} from '../src/practiceSession.js';
test.each([['practiceCatalog',()=>renderPracticeCatalog(PRACTICE_MODES)],['calibrationCards',renderCalibrationCatalog]])('%s expands to the exact typed DOM once without replacing its host or delegated handlers',(_id,render)=>{
 const html=render();document.body.innerHTML=deferStaticCatalog(html);const host=document.body.firstElementChild;const click=jest.fn();host.addEventListener('click',click);
 expect(host.querySelectorAll('button')).toHaveLength(0);materializeStaticCatalog(host);expect(document.body.firstElementChild).toBe(host);
 const original=document.createElement('div');original.innerHTML=html;expect(host.outerHTML).toBe(original.firstElementChild.outerHTML);
 const button=host.querySelector('button');button.disabled=false;button.click();expect(click).toHaveBeenCalledTimes(1);materializeStaticCatalog(host);expect(host.querySelector('button')).toBe(button);expect(host.querySelector('script,template')).toBeNull();
});
test('the build refuses arbitrary roots or nested scripts and keeps escaped text inert',()=>{
 expect(()=>deferStaticCatalog('<div id="unknown"></div>')).toThrow('Unknown');expect(()=>deferStaticCatalog('<div id="practiceCatalog"><script>bad()</script></div>')).toThrow('scripts');
 const modes=[{...PRACTICE_MODES[0],title:'<img src=x onerror=alert(1)>'}];document.body.innerHTML=deferStaticCatalog(renderPracticeCatalog(modes));materializeStaticCatalog(document.body.firstElementChild);expect(document.querySelector('img')).toBeNull();expect(document.querySelector('h3').textContent).toBe(modes[0].title);
});
