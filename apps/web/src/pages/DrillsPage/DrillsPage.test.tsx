/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {render,fireEvent,cleanup,screen,act} from '@testing-library/react';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {renderDrillsPage} from '../../app/renderDrillsPage.tsx';
import {DrillsPage} from './DrillsPage.tsx';
import {loadLocale} from '../../localization/runtime.ts';
afterEach(cleanup);
function tree(node:Node):unknown{if(node.nodeType===Node.TEXT_NODE)return node.textContent?.replace(/\s+/g,' ').trim()||null;if(!(node instanceof Element))return null;return[node.tagName,[...node.attributes].map(a=>[a.name,a.value]).sort(),[...node.childNodes].map(tree).filter(Boolean)];}
test('complete typed page and retained editor template preserve the released structure',()=>{const native=document.createElement('div'),actual=document.createElement('div');native.innerHTML=readFileSync(new URL('../../../../../tests/fixtures/legacy-drills-page.html',import.meta.url),'utf8').replace('{{practiceCatalog}}','<div id="practiceCatalog"></div>');actual.innerHTML=renderDrillsPage('<div id="practiceCatalog"></div>');expect(tree(actual)).toEqual(tree(native));});
test('collections and separate navigation/actions remain feature-owned while empty and hidden states render',()=>{const onBack=jest.fn(),onCollection=jest.fn(),onCreate=jest.fn();const card={drill:{id:'saved',title:'Saved preset',steps:['trigger']},titleFor:(label:string)=>label};const result=render(<DrillsPage builtIns={[card]} customs={[card]} customSelected createHidden={false} gunName="Owned gun" onBack={onBack} onCollection={onCollection} onCreate={onCreate}/>);for(const name of ['Back to previous screen','Built-in Drills','Custom','+ Create Custom Drill'])fireEvent.click(result.getByRole('button',{name}));expect(onBack).toHaveBeenCalledTimes(1);expect(onCollection.mock.calls).toEqual([[false],[true]]);expect(onCreate).toHaveBeenCalledTimes(1);expect(result.container.querySelector('#drillCatalog')).toHaveClass('hidden');expect(result.container.querySelector('#customDrillCatalog')).not.toHaveClass('hidden');result.rerender(<DrillsPage emptyCustom collectionHidden customTabHidden contextHidden/>);expect(result.getByText(/No custom drills for this gun yet/)).toBeInTheDocument();expect(result.container.querySelector('.segmented-control')).toHaveClass('hidden');expect(result.container.querySelector('#customDrillsTab')).toHaveClass('hidden');expect(result.container.querySelector('.gun-context')).toHaveClass('hidden');});
test('drill section copy follows Dutch while callbacks and identifiers remain stable',async()=>{
 await act(async()=>{await loadLocale('nl');});const onCollection=jest.fn();const view=render(<DrillsPage createHidden={false} onCollection={onCollection}/>);
 expect(screen.getByRole('heading',{name:'Oefeningen'})).toBeVisible();
 expect(screen.getByRole('heading',{name:'Groep trekkerbeweging'})).toBeVisible();
 expect(screen.getByText('Kies een ingebouwde of eerder opgeslagen reeks. Alleen de geluiden in de reeks zijn nodig.')).toBeVisible();
 view.rerender(<DrillsPage sequenceFull createHidden={false} onCollection={onCollection}/>);
 expect(view.getByText('Deze oefeningen gebruiken alleen de geluiden in de reeks. Maak je eigen oefening of kies een ingebouwde reeks.')).toBeVisible();
 view.rerender(<DrillsPage createHidden={false} onCollection={onCollection}/>);
 fireEvent.click(screen.getByRole('button',{name:'Ingebouwde oefeningen'}));expect(onCollection).toHaveBeenCalledWith(false);
 expect(screen.getByRole('button',{name:'+ Eigen oefening maken'})).toBeVisible();
 expect(screen.getByRole('heading',{name:'Een keer de trekker overhalen'})).toBeVisible();
 expect(screen.getAllByRole('button',{name:'▶ Oefening starten'})).toHaveLength(4);
 expect(screen.getByText('Reactietijd voor één klik na elk startsignaal.')).toBeVisible();
 await act(async()=>{await loadLocale('en');});
});

test('built-in and saved drill cards localize actions while keeping saved names as user data',async()=>{
 await act(async()=>{await loadLocale('nl');});
 const builtIn={drill:{id:'rack-trigger',title:'Rack slide → Trigger pull',steps:['rack','trigger']}};
 const saved={drill:{id:'custom-one',title:'My range sequence',steps:['draw','trigger']},onEdit:jest.fn()};
 const view=render(<DrillsPage builtIns={[builtIn]} customs={[saved]} createHidden/>);
 expect(screen.getByRole('heading',{name:'Slede doorladen → trekker overhalen'})).toBeVisible();
 expect(screen.getAllByRole('button',{name:'▶ Oefening starten'})).toHaveLength(6);
 view.rerender(<DrillsPage builtIns={[builtIn]} customs={[saved]} customSelected createHidden/>);
 expect(screen.getByRole('heading',{name:'My range sequence'})).toBeVisible();
 expect(screen.getAllByRole('button',{name:'▶ Oefening starten'})).toHaveLength(6);
 expect(screen.getByRole('button',{name:'Reeks bewerken'})).toBeVisible();
 expect(screen.getAllByText('Geluidenreeks met 2 stappen.')).toHaveLength(2);
 await act(async()=>{await loadLocale('en');});
});
