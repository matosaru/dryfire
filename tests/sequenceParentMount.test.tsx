/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {act,fireEvent} from '@testing-library/react';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {mountSequencePage} from '../apps/web/src/app/sequencePage';
function fixture(){document.body.innerHTML='<input id="outside"><div id="sessionView">'+readFileSync(new URL('./fixtures/session-pages/session.html',import.meta.url),'utf8')+'</div>';return document.getElementById('sessionView')!;}
test('parent owns title/context/steps/guide while retaining exact forms and child hosts, draft/focus and native listeners',()=>{
 const host=fixture(),form=host.querySelector<HTMLFormElement>('#sessionConfigForm')!,input=host.querySelector<HTMLInputElement>('#sessionRepetitions')!,run=host.querySelector('#sessionRun'),review=host.querySelector('#sessionReview'),change=jest.fn(),back=jest.fn(),guide=jest.fn();form.addEventListener('input',change);input.value='';input.focus();let view!:ReturnType<typeof mountSequencePage>;act(()=>{view=mountSequencePage(host,{onBack:back,onGuide:guide});});expect(document.activeElement).toBe(input);expect(host.querySelector('#sessionConfigForm')).toBe(form);expect(host.querySelector('#sessionRun')).toBe(run);expect(host.querySelector('#sessionReview')).toBe(review);act(()=>view.update({title:'Par-time practice',gunName:'<script>',contextHidden:true,guideHidden:true,steps:[{text:'Trigger pull',className:'preset-chip'}]}));expect(input.value).toBe('');expect(host.querySelector('.gun-context')).toHaveClass('hidden');expect(host.querySelector('.gun-context-name')).toHaveTextContent('<script>');expect(host.querySelector('#sessionSteps')).toHaveTextContent('Trigger pull');expect(host.querySelector('#sessionGuideLink')).toHaveClass('hidden');fireEvent.input(input);expect(change).toHaveBeenCalledTimes(1);fireEvent.click(host.querySelector('#sessionBackBtn')!);fireEvent.click(host.querySelector('#sessionGuideLink')!);expect(back).toHaveBeenCalledTimes(1);expect(guide).toHaveBeenCalledTimes(1);act(()=>view.dispose());act(()=>view.dispose());act(()=>view.update({title:'Ignored'}));expect(host.childNodes).toHaveLength(0);
});
test('heading focus/tabindex and unrelated focus are preserved without stealing focus on updates',()=>{
 const host=fixture(),title=host.querySelector<HTMLElement>('#session-title')!;title.setAttribute('tabindex','-1');title.focus();let view!:ReturnType<typeof mountSequencePage>;act(()=>{view=mountSequencePage(host,{});});expect(document.activeElement?.id).toBe('session-title');expect(document.activeElement).toHaveAttribute('tabindex','-1');document.getElementById('outside')!.focus();act(()=>view.update({title:'Changed'}));expect(document.activeElement?.id).toBe('outside');act(()=>view.dispose());
});
