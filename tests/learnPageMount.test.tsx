/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {act,fireEvent} from '@testing-library/react';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {renderLearnPage} from '../apps/web/src/app/renderLearnPage.tsx';
import {renderCalibrationCatalog} from '../apps/web/src/app/renderCalibrationCatalog.tsx';
import {mountLearnPage} from '../apps/web/src/app/learnPage.tsx';
const profileCss=readFileSync(new URL('../packages/ui/src/TriggerProfileStatus/TriggerProfileStatus.css',import.meta.url),'utf8').trim();
const fixture=readFileSync(new URL('./fixtures/legacy-learn-page.html',import.meta.url),'utf8').replace('{{calibrationCatalog}}',renderCalibrationCatalog()).replace('{{profileCss}}',profileCss);
function setup(){document.body.innerHTML=`<section id="learnView">${fixture}</section>`;return document.querySelector('#learnView')!;}
function tree(node:Node):unknown{if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;if(!(node instanceof Element))return null;return[node.tagName,[...node.attributes].map(a=>[a.name,a.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];}
test('typed Learn source retains the complete frozen template with approved recording guidance',()=>{const native=document.createElement('div'),actual=document.createElement('div');native.innerHTML=fixture;actual.innerHTML=renderLearnPage(renderCalibrationCatalog(),profileCss);native.querySelector('.tip')!.innerHTML=actual.querySelector('.tip')!.innerHTML;expect(actual.querySelector('.tip')).toHaveTextContent(/same phone position/i);expect(tree(actual)).toEqual(tree(native));});
const card={label:'trigger',meta:{title:'Trigger pull',tone:'orange',description:'Dry click'},count:3,minExamples:3,recommendedExamples:8,maxExamples:10,locked:false};
test('handoff preserves native notices, context, disclosures and focus while transferring actions once',()=>{
 const host=setup(),details=host.querySelectorAll('details');details[0].open=true;details[1].open=true;document.querySelector('.gun-context-name')!.textContent='Owned gun';document.querySelector('#modelNotice')!.textContent='Older features';document.querySelector('#modelNotice')!.classList.remove('hidden');const original=document.querySelector<HTMLButtonElement>('[data-calibration-kind="reset"]')!,native=jest.fn(),record=jest.fn();original.addEventListener('click',native);original.id='focused-calibration';original.disabled=false;original.focus();
 let page:ReturnType<typeof mountLearnPage>;act(()=>{page=mountLearnPage(host,{cards:[card],calibrationProps:{counts:{reset:3},locked:false,onRecord:record}});});expect(document.querySelector('.gun-context-name')).toHaveTextContent('Owned gun');expect(document.querySelector('#modelNotice')).toHaveTextContent('Older features');for(const detail of host.querySelectorAll('details'))expect(detail).toHaveAttribute('open');
 act(()=>fireEvent.click(document.querySelector('[data-calibration-kind="reset"]')!));expect(record).toHaveBeenCalledWith('reset');expect(document.activeElement).toBe(document.querySelector('[data-calibration-kind="reset"]'));expect(native).not.toHaveBeenCalled();const current=document.querySelector('.record-example');act(()=>page.update({cards:[{...card,count:10}],noticeHidden:true}));expect(document.querySelector('.record-example')).toBe(current);expect(current).toBeDisabled();expect(document.querySelector('#modelNotice')).toHaveClass('hidden');
 act(()=>page.dispose());act(()=>page.dispose());act(()=>page.update({notice:'Ignored'}));expect(host.childNodes).toHaveLength(0);
});
test('failed initial commit restores original nodes and event owner',()=>{
 const host=setup(),button=document.querySelector<HTMLButtonElement>('[data-calibration-kind="reset"]')!,native=jest.fn();button.addEventListener('click',native);button.disabled=false;button.focus();const environment=globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT?:boolean};const previous=environment.IS_REACT_ACT_ENVIRONMENT;environment.IS_REACT_ACT_ENVIRONMENT=false;
 try{expect(()=>mountLearnPage(host,{gunName:{invalid:true} as unknown as string})).toThrow();}finally{environment.IS_REACT_ACT_ENVIRONMENT=previous;}expect(document.querySelector('[data-calibration-kind="reset"]')).toBe(button);expect(document.activeElement).toBe(button);button.click();expect(native).toHaveBeenCalledTimes(1);
});

test('handoff preserves semantic Back focus without a generated control id',()=>{const host=setup(),back=host.querySelector<HTMLButtonElement>('[data-back]')!;back.focus();let page:ReturnType<typeof mountLearnPage>;act(()=>{page=mountLearnPage(host,{});});expect(document.activeElement).toBe(host.querySelector('[data-back]'));act(()=>page.dispose());});
test('unfocused handoff preserves another page control focus',()=>{const host=setup(),outside=document.createElement('input');document.body.append(outside);outside.focus();let page:ReturnType<typeof mountLearnPage>;act(()=>{page=mountLearnPage(host,{});});expect(document.activeElement).toBe(outside);act(()=>page.dispose());});
