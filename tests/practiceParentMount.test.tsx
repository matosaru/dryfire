/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {act,fireEvent} from '@testing-library/react';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {mountPracticePage} from '../apps/web/src/app/practicePage';
import {mountRetainedPage} from '../apps/web/src/app/retainedPage';
import {RetainedNode} from '@dryfire/ui/RetainedNode';
function fixture(){document.body.innerHTML='<input id="outside"><div id="practiceView">'+readFileSync(new URL('./fixtures/session-pages/practice.html',import.meta.url),'utf8')+'</div>';return document.getElementById('practiceView')!;}
test('parent owns title/context/steps/guide while retaining exact forms and child hosts, draft/focus and native listeners',()=>{
 const host=fixture(),form=host.querySelector<HTMLFormElement>('#practiceConfigForm')!,input=host.querySelector<HTMLInputElement>('#practiceRepetitions')!,run=host.querySelector('#practiceRun'),review=host.querySelector('#practiceReview'),change=jest.fn(),back=jest.fn(),guide=jest.fn();form.addEventListener('input',change);input.value='';input.focus();let view!:ReturnType<typeof mountPracticePage>;act(()=>{view=mountPracticePage(host,{onBack:back,onGuide:guide});});expect(document.activeElement).toBe(input);expect(host.querySelector('#practiceConfigForm')).toBe(form);expect(host.querySelector('#practiceRun')).toBe(run);expect(host.querySelector('#practiceReview')).toBe(review);act(()=>view.update({title:'Par-time practice',gunName:'<script>',contextHidden:true,guideHidden:true,steps:[{text:'Trigger pull',className:'preset-chip'}]}));expect(input.value).toBe('');expect(host.querySelector('.gun-context')).toHaveClass('hidden');expect(host.querySelector('.gun-context-name')).toHaveTextContent('<script>');expect(host.querySelector('#practiceSteps')).toHaveTextContent('Trigger pull');expect(host.querySelector('#practiceGuideLink')).toHaveClass('hidden');fireEvent.input(input);expect(change).toHaveBeenCalledTimes(1);fireEvent.click(host.querySelector('#practiceBackBtn')!);fireEvent.click(host.querySelector('#practiceGuideLink')!);expect(back).toHaveBeenCalledTimes(1);expect(guide).toHaveBeenCalledTimes(1);act(()=>view.dispose());act(()=>view.dispose());act(()=>view.update({title:'Ignored'}));expect(host.childNodes).toHaveLength(0);
});
test('heading focus/tabindex and unrelated focus are preserved without stealing focus on updates',()=>{
 const host=fixture(),title=host.querySelector<HTMLElement>('#practice-title')!;title.setAttribute('tabindex','-1');title.focus();let view!:ReturnType<typeof mountPracticePage>;act(()=>{view=mountPracticePage(host,{});});expect(document.activeElement?.id).toBe('practice-title');expect(document.activeElement).toHaveAttribute('tabindex','-1');document.getElementById('outside')!.focus();act(()=>view.update({title:'Changed'}));expect(document.activeElement?.id).toBe('outside');act(()=>view.dispose());
});
test('generic retained parent skips unchanged updates and restores nodes/listeners/focus after failed render',()=>{
 const host=fixture(),form=host.querySelector<HTMLFormElement>('#practiceConfigForm')!,input=form.querySelector<HTMLInputElement>('input')!,draw=jest.fn(({title}:{title:string})=><><h2>{title}</h2><RetainedNode node={form}/></>);document.getElementById('outside')!.focus();let view!:ReturnType<typeof mountRetainedPage<{title:string}>>;act(()=>{view=mountRetainedPage(host,{title:'One'},draw,'data-test');});const count=draw.mock.calls.length;act(()=>view.update({title:'One'}));expect(draw).toHaveBeenCalledTimes(count);act(()=>view.dispose());
 const restored=fixture(),before=[...restored.childNodes],active=restored.querySelector<HTMLInputElement>('input')!,click=jest.fn();active.addEventListener('click',click);active.focus();const env=globalThis as typeof globalThis&{IS_REACT_ACT_ENVIRONMENT?:boolean},previous=env.IS_REACT_ACT_ENVIRONMENT;env.IS_REACT_ACT_ENVIRONMENT=false;try{expect(()=>mountRetainedPage(restored,{title:{invalid:true} as unknown as string},props=><p>{props.title}</p>,'data-test')).toThrow();}finally{env.IS_REACT_ACT_ENVIRONMENT=previous;}expect([...restored.childNodes]).toEqual(before);expect(document.activeElement).toBe(active);active.click();expect(click).toHaveBeenCalledTimes(1);
});
