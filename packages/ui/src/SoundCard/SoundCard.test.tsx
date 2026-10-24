/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,fireEvent,cleanup} from '@testing-library/react';
import {jest} from '@jest/globals';
// @ts-expect-error The untyped pre-migration factory is the independent DOM parity oracle.
import {soundCard} from '../../../../src/uiComponents.js';
import {SoundCard} from './SoundCard.tsx';
afterEach(cleanup);
const defaults={label:'trigger',meta:{title:'Trigger pull',description:'Dry trigger click',tone:'orange'},count:0,maxExamples:10,minExamples:3,recommendedExamples:8,locked:false};
function tree(node:Node):unknown{if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;if(!(node instanceof Element))return null;return[node.tagName,[...node.attributes].filter(a=>a.name!=='checked').map(a=>[a.name,a.name==='style'?(node as HTMLElement).style.cssText:a.value]).sort(),node instanceof HTMLInputElement?node.checked:null,[...node.childNodes].map(tree).filter(Boolean)];}
test('every progress and lock state preserves the native sound card DOM and reduced-motion media',()=>{
 for(const count of [0,3,8,10,12])for(const locked of [false,true])for(const optional of [false,true]){
  const props={...defaults,count,locked,optional,enabled:true,onRecord:jest.fn(),onReset:jest.fn(),onToggle:jest.fn()};const legacy=soundCard(props,document);legacy.querySelector('img')!.setAttribute('loading','lazy');const result=render(<SoundCard {...props}/>);const actual=result.container.firstElementChild!.cloneNode(true);actual.normalize();legacy.normalize();expect(tree(actual)).toEqual(tree(legacy));result.unmount();
 }
});
test('actions are distinct and disabled controls cannot dispatch',()=>{
 const onRecord=jest.fn(),onReset=jest.fn(),onToggle=jest.fn();const result=render(<SoundCard {...defaults} count={3} optional enabled onRecord={onRecord} onReset={onReset} onToggle={onToggle}/>);
 fireEvent.click(result.getByRole('button',{name:'Record Trigger pull sample'}));fireEvent.click(result.getByRole('button',{name:'Reset learned Trigger pull sounds'}));fireEvent.click(result.getByRole('checkbox'));expect(onRecord).toHaveBeenCalledTimes(1);expect(onReset).toHaveBeenCalledTimes(1);expect(onToggle).toHaveBeenCalledWith(false);
 result.rerender(<SoundCard {...defaults} count={10} locked onRecord={onRecord} onReset={onReset}/>);for(const button of result.getAllByRole('button'))fireEvent.click(button);expect(onRecord).toHaveBeenCalledTimes(1);expect(onReset).toHaveBeenCalledTimes(1);
});
