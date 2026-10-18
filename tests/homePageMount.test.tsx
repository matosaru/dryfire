/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {act} from '@testing-library/react';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {renderToStaticMarkup} from 'react-dom/server';
import {HomePage} from '../apps/web/src/pages/HomePage/index.ts';
import {mountHomePage} from '../apps/web/src/app/profilePages/index.ts';
const fixture=readFileSync(new URL('./fixtures/legacy-home-page.html',import.meta.url),'utf8');
const setup=()=>{document.body.innerHTML=`<section id="homeView">${fixture}</section>`;return document.querySelector('#homeView')!;};
function tree(node:Node):unknown{if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;if(!(node instanceof Element))return null;return[node.tagName,[...node.attributes].map(attr=>[attr.name,attr.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];}
test('static Home retains every released element, attribute, glyph and text',()=>{const old=document.createElement('div'),actual=document.createElement('div');old.innerHTML=fixture;actual.innerHTML=renderToStaticMarkup(<HomePage/>);expect(tree(actual)).toEqual(tree(old));});
test('handoff snapshots latest native state and focus, replacing native listeners exactly once',()=>{
 const host=setup(),native=jest.fn(),navigate=jest.fn();const button=document.querySelector<HTMLButtonElement>('#homeDrillsBtn')!;button.addEventListener('click',native);button.focus();
 document.querySelector('#homeEvents')!.textContent='7';document.querySelector('#homeAccuracy')!.textContent='50%';document.querySelector('#homeExamples')!.textContent='6 / 8 trigger';document.querySelector('.gun-context-name')!.textContent='Selected';document.querySelector('.gun-context')!.classList.add('hidden');(document.querySelector('#homeListenBtn') as HTMLButtonElement).disabled=true;
 let page:ReturnType<typeof mountHomePage>;act(()=>{page=mountHomePage(host,navigate);});expect(document.activeElement?.id).toBe('homeDrillsBtn');expect(document.querySelector('#homeEvents')).toHaveTextContent('7');expect(document.querySelector('#homeAccuracy')).toHaveTextContent('50%');expect(document.querySelector('#homeExamples')).toHaveTextContent('6 / 8 trigger');expect(document.querySelector('.gun-context')).toHaveClass('hidden');
 act(()=>{(document.querySelector('#homeDrillsBtn') as HTMLButtonElement).click();});expect(navigate.mock.calls).toEqual([['drills']]);expect(native).not.toHaveBeenCalled();
 act(()=>page.update({events:8,listenDisabled:false,contextHidden:false}));expect(document.querySelector('#homeAccuracy')).toHaveTextContent('50%');expect(document.querySelector('#homeListenBtn')).not.toBeDisabled();expect(document.querySelector('.gun-context')).not.toHaveClass('hidden');
 const current=document.querySelector('#homeDrillsBtn');act(()=>page.update({accuracy:'100%'}));expect(document.querySelector('#homeDrillsBtn')).toBe(current);
 act(()=>page.dispose());act(()=>page.dispose());act(()=>page.update({events:99}));expect(host.childNodes).toHaveLength(0);
});
test('unfocused handoff does not steal focus from another page',()=>{const host=setup();const input=document.createElement('input');document.body.append(input);input.focus();let page:ReturnType<typeof mountHomePage>;act(()=>{page=mountHomePage(host,jest.fn());});expect(document.activeElement).toBe(input);act(()=>page.dispose());});
test('failed commit restores native nodes, focus and events for retry',()=>{
 const host=setup(),button=document.querySelector<HTMLButtonElement>('#homeLearnBtn')!,native=jest.fn();button.addEventListener('click',native);button.focus();
 const environment=globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT?:boolean};const previous=environment.IS_REACT_ACT_ENVIRONMENT;environment.IS_REACT_ACT_ENVIRONMENT=false;
 const navigate=Object.assign(jest.fn(),{});const query=host.querySelector.bind(host);const spy=jest.spyOn(host,'querySelector'); spy.mockImplementation(selector=>selector==='.gun-context-name'?{textContent:{invalid:true}} as unknown as Element:query(selector));
 try{expect(()=>mountHomePage(host,navigate)).toThrow();}finally{spy.mockRestore();environment.IS_REACT_ACT_ENVIRONMENT=previous;}
 expect(document.querySelector('#homeLearnBtn')).toBe(button);expect(document.activeElement).toBe(button);button.click();expect(native).toHaveBeenCalledTimes(1);
});
