/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {render,fireEvent,cleanup} from '@testing-library/react';
import {jest} from '@jest/globals';
// @ts-expect-error The pre-migration factory is the independent DOM oracle.
import {drillCard} from '../../../../src/uiComponents.js';
import {DrillCard} from './DrillCard.tsx';
afterEach(cleanup);
function tree(node:Node):unknown{if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;if(!(node instanceof Element))return null;return[node.tagName,[...node.attributes].map(a=>[a.name,a.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];}
test('single and repeated-action sequences preserve native card order, labels and attributes',()=>{for(const steps of [['trigger'],['draw','reload','trigger'],['trigger','trigger']]){const props={drill:{id:'preset',title:'Saved preset',steps},index:0,titleFor:(label:string)=>label,onChoose:jest.fn()};const legacy=drillCard(props,document),result=render(<DrillCard {...props}/>);expect(tree(result.container.firstElementChild!)).toEqual(tree(legacy));result.unmount();}});
test('choose and saved-preset edit callbacks remain distinct',()=>{const onChoose=jest.fn(),onEdit=jest.fn();const result=render(<DrillCard drill={{id:'saved',title:'Saved preset',steps:['trigger']}} onChoose={onChoose} onEdit={onEdit}/>);fireEvent.click(result.getByRole('button',{name:'▶ Start Drill'}));fireEvent.click(result.getByRole('button',{name:'Edit sequence'}));expect(onChoose).toHaveBeenCalledTimes(1);expect(onEdit).toHaveBeenCalledTimes(1);});

test('catalog cards expose one title/description and no repeated action strip',()=>{
 const result=render(<DrillCard drill={{id:'sequence',title:'Rack then trigger',steps:['rack','trigger']}}/>);
 expect(result.getByRole('heading',{name:'Rack then trigger'})).toBeVisible();
 expect(result.getByText('2-action sound sequence.')).toBeVisible();
 expect(result.container.querySelector('.preset-steps,.preset-chip')).toBeNull();
 expect(result.container.querySelector('.drill-target')).toHaveAttribute('aria-hidden','true');
});
