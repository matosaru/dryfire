/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,fireEvent,cleanup} from '@testing-library/react';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {renderDrillsPage} from '../../app/renderDrillsPage.tsx';
import {DrillsPage} from './DrillsPage.tsx';
afterEach(cleanup);
function tree(node:Node):unknown{if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;if(!(node instanceof Element))return null;return[node.tagName,[...node.attributes].map(a=>[a.name,a.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];}
test('complete typed page and retained editor template preserve the released structure',()=>{const native=document.createElement('div'),actual=document.createElement('div');native.innerHTML=readFileSync(new URL('../../../../../tests/fixtures/legacy-drills-page.html',import.meta.url),'utf8').replace('{{practiceCatalog}}','<div id="practiceCatalog"></div>');actual.innerHTML=renderDrillsPage('<div id="practiceCatalog"></div>');expect(tree(actual)).toEqual(tree(native));});
test('collections and separate navigation/actions remain feature-owned while empty and hidden states render',()=>{const onBack=jest.fn(),onCollection=jest.fn(),onCreate=jest.fn(),onFree=jest.fn();const card={drill:{id:'saved',title:'Saved preset',steps:['trigger']},titleFor:(label:string)=>label};const result=render(<DrillsPage builtIns={[card]} customs={[card]} customSelected createHidden={false} gunName="Owned gun" onBack={onBack} onCollection={onCollection} onCreate={onCreate} onFree={onFree}/>);for(const name of ['Back to previous screen','Built-in Drills','Custom','+ Create Custom Drill','Start free listening →'])fireEvent.click(result.getByRole('button',{name}));expect(onBack).toHaveBeenCalledTimes(1);expect(onCollection.mock.calls).toEqual([[false],[true]]);expect(onCreate).toHaveBeenCalledTimes(1);expect(onFree).toHaveBeenCalledTimes(1);expect(result.container.querySelector('#drillCatalog')).toHaveClass('hidden');expect(result.container.querySelector('#customDrillCatalog')).not.toHaveClass('hidden');result.rerender(<DrillsPage emptyCustom collectionHidden customTabHidden contextHidden/>);expect(result.getByText(/No custom drills for this gun yet/)).toBeInTheDocument();expect(result.container.querySelector('.segmented-control')).toHaveClass('hidden');expect(result.container.querySelector('#customDrillsTab')).toHaveClass('hidden');expect(result.container.querySelector('.gun-context')).toHaveClass('hidden');});
