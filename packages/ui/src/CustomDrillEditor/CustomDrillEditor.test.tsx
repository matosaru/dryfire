/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,fireEvent,cleanup} from '@testing-library/react';
import {renderToStaticMarkup} from 'react-dom/server';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {CustomDrillEditor} from './CustomDrillEditor.tsx';
afterEach(cleanup);
function tree(node:Node):unknown{if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;if(!(node instanceof Element))return null;return[node.tagName,[...node.attributes].map(a=>[a.name,a.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];}
test('complete form prerender preserves the released editor attributes and native validation',()=>{const original=document.createElement('div'),actual=document.createElement('div');const fixture=readFileSync(new URL('../../../../tests/fixtures/legacy-drills-page.html',import.meta.url),'utf8');original.innerHTML=fixture.slice(fixture.indexOf('<form id="customDrillForm"'),fixture.indexOf('</form>')+7);actual.innerHTML=renderToStaticMarkup(<CustomDrillEditor/>);expect(tree(actual)).toEqual(tree(original));});
test('ordered/repeated actions, boundary buttons and distinct form actions keep explicit callbacks',()=>{const onAdd=jest.fn(),onCancel=jest.fn(),onStep=jest.fn(),onSubmit=jest.fn((event:React.FormEvent<HTMLFormElement>)=>event.preventDefault());const result=render(<CustomDrillEditor hidden={false} title="Edit drill" nameValue="Saved draft" actionValue="trigger" stepLabels={['draw','trigger','trigger']} onAdd={onAdd} onCancel={onCancel} onStep={onStep} onSubmit={onSubmit}/>);expect(result.getByLabelText('Drill name')).toHaveValue('Saved draft');expect(result.getByLabelText('Add a sound')).toHaveValue('trigger');expect(result.getByRole('button',{name:'Move up action 1'})).toBeDisabled();expect(result.getByRole('button',{name:'Move down action 3'})).toBeDisabled();fireEvent.click(result.getByRole('button',{name:'Move up action 2'}));fireEvent.click(result.getByRole('button',{name:'Move down action 1'}));fireEvent.click(result.getByRole('button',{name:'Remove action 3'}));fireEvent.click(result.getByRole('button',{name:'+ Add Action'}));fireEvent.click(result.getByRole('button',{name:'Cancel'}));fireEvent.submit(result.container.querySelector('form')!);expect(onStep.mock.calls).toEqual([[1,'up'],[0,'down'],[2,'remove']]);expect(onAdd).toHaveBeenCalledTimes(1);expect(onCancel).toHaveBeenCalledTimes(1);expect(onSubmit).toHaveBeenCalledTimes(1);});
test('record limits and empty sequences disable their appropriate actions',()=>{const result=render(<CustomDrillEditor hidden={false} addDisabled saveDisabled/>);expect(result.getByRole('button',{name:'+ Add Action'})).toBeDisabled();expect(result.getByRole('button',{name:'Save Drill'})).toBeDisabled();});
