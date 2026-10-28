/** @jest-environment jsdom */
import '@dryfire/testing/setup';
import {act,screen} from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import {jest} from '@jest/globals';
import {readFileSync} from 'node:fs';
import {mountChrome} from './chromePages.tsx';
import {createChromeBridge, type ChromeRenderer, type ChromeSnapshot} from './chromeBridge.ts';
const fixture=readFileSync(new URL('../../../../tests/fixtures/legacy-shell.html',import.meta.url),'utf8');
const initial={view:'home',status:'Ready',navigationDisabled:false};
beforeEach(()=>{document.body.innerHTML=fixture.replace('{{pages}}','<input id="draft" value="saved" />');});

test('Strict Mode chrome preserves other owners and keyboard focus, with exactly one navigation handler',async()=>{
  const onNavigate=jest.fn();
  const bridge=createChromeBridge(document,onNavigate);
  const draft=document.getElementById('draft') as HTMLInputElement;
  draft.value='invalid draft';draft.setSelectionRange(2,5);
  const main=document.getElementById('pageContent'), badge=document.getElementById('previewModeBadge');
  document.getElementById('contactBtn')!.focus();document.getElementById('contactBtn')!.dataset.tooltipDismissed='true';
  act(()=>{bridge.view('practice');bridge.status('Microphone connected');bridge.enhance(mountChrome);bridge.enhance(mountChrome);});
  expect(screen.getByRole('link',{name:'Contact'})).toHaveFocus();expect(screen.getByRole('link',{name:'Contact'})).toHaveAttribute('data-tooltip-dismissed','true');
  expect(document.getElementById('draft')).toBe(draft);expect(draft.value).toBe('invalid draft');
  expect([draft.selectionStart,draft.selectionEnd]).toEqual([2,5]);
  expect(document.getElementById('pageContent')).toBe(main);expect(document.getElementById('previewModeBadge')).toBe(badge);
  expect(screen.getByRole('button',{name:'Drills'})).toHaveAttribute('aria-current','page');
  await userEvent.click(screen.getByRole('link',{name:'About'}));
  await userEvent.click(screen.getByRole('button',{name:'Settings'}));
  await userEvent.click(screen.getByRole('button',{name:'Home'}));
  expect(onNavigate.mock.calls).toEqual([['about'],['settings'],['home']]);
  act(()=>{bridge.view('settings');bridge.status('Listening');bridge.navigationDisabled(true);});
  expect(screen.getByRole('button',{name:'Settings'})).toHaveAttribute('aria-current','page');
  expect(document.getElementById('statusPill')).toHaveTextContent('Listening');
  for(const button of document.querySelectorAll('.tab'))expect(button).toBeDisabled();
  act(()=>{bridge.dispose();bridge.dispose();});
});

test('a non-chrome focused draft survives connecting and repeated unchanged renderer updates',()=>{
  const draft=document.getElementById('draft') as HTMLInputElement;draft.focus();draft.value='unfinished';
  let renderer:ChromeRenderer;
  act(()=>{renderer=mountChrome({doc:document,initial,onNavigate:jest.fn()});});
  const settings=document.getElementById('settingsShortcut');
  act(()=>{renderer.update(initial);renderer.update({...initial,status:'Recording'});});
  expect(draft).toHaveFocus();expect(draft.value).toBe('unfinished');expect(document.getElementById('settingsShortcut')).toBe(settings);
  act(()=>{renderer.dispose();renderer.dispose();renderer.update({...initial,view:'settings'});});
  expect(document.querySelector('header.hero')).toBeEmptyDOMElement();
});

test('focused glyph buttons reconnect by route and missing mounts fail without replacing any content',()=>{
  screen.getByRole('button',{name:'Learn'}).focus();let renderer:ChromeRenderer;
  act(()=>{renderer=mountChrome({doc:document,initial,onNavigate:jest.fn()});});
  expect(screen.getByRole('button',{name:'Learn'})).toHaveFocus();act(()=>renderer.dispose());
  document.body.innerHTML=fixture;document.querySelector('.tabs')!.remove();
  const header=document.querySelector('header.hero')!.innerHTML;
  expect(()=>mountChrome({doc:document,initial,onNavigate:jest.fn()})).toThrow('mounts are missing');
  expect(document.querySelector('header.hero')!.innerHTML).toBe(header);
});

test('a failed React commit restores native nodes, focus and fallback events for retry',async()=>{
  const onNavigate=jest.fn(), bridge=createChromeBridge(document,onNavigate);
  const button=document.getElementById('contactBtn')!;button.focus();
  const invalid={...initial,status:{invalid:true}} as unknown as ChromeSnapshot;
  const environment=globalThis as typeof globalThis & {IS_REACT_ACT_ENVIRONMENT?:boolean};
  const previous=environment.IS_REACT_ACT_ENVIRONMENT;
  environment.IS_REACT_ACT_ENVIRONMENT=false;
  try {expect(()=>bridge.enhance(options=>mountChrome({...options,initial:invalid}))).toThrow();}
  finally {environment.IS_REACT_ACT_ENVIRONMENT=previous;}
  expect(document.getElementById('contactBtn')).toBe(button);expect(button).toHaveFocus();
  await userEvent.click(button);expect(onNavigate.mock.calls).toEqual([['contact']]);
  act(()=>bridge.enhance(mountChrome));
  await userEvent.click(screen.getByRole('link',{name:'Contact'}));
  expect(onNavigate.mock.calls).toEqual([['contact'],['contact']]);
  act(()=>bridge.dispose());
});
