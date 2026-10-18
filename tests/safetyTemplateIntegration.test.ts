/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import '@dryfire/testing/setup';
import {jest} from '@jest/globals';
import {renderPageTemplates} from '../tools/page-templates.mjs';
import {createSafetyGate} from '../src/safetyGate.js';

function setup() {
  document.body.innerHTML=renderPageTemplates('{{app}}');
  const dialog=document.getElementById('safetyModal') as HTMLDialogElement;
  const checkbox=document.getElementById('safetyModalAck') as HTMLInputElement;
  const confirmButton=document.getElementById('safetyConfirmBtn') as HTMLButtonElement;
  const cancelButton=document.getElementById('safetyCancelBtn') as HTMLButtonElement;
  const inline=document.getElementById('safetyAck') as HTMLInputElement;
  dialog.showModal=()=>{dialog.open=true;};
  dialog.close=()=>{dialog.open=false;dialog.dispatchEvent(new Event('close'));};
  let owner='gun-a';const onError=jest.fn(),action=jest.fn<()=>Promise<void>>(async()=>{});
  const gate=createSafetyGate({dialog,checkbox,confirmButton,cancelButton,isConfirmed:()=>inline.checked,
    confirmState:()=>{inline.checked=true;},identity:()=>owner,onError});
  const acknowledge=()=>{checkbox.checked=true;checkbox.dispatchEvent(new Event('change'));};
  return {gate,dialog,checkbox,confirmButton,cancelButton,inline,onError,action,acknowledge,changeOwner:()=>{owner='gun-b';}};
}

test('the actual compiled modal focuses its acknowledgement and resumes a capture exactly once',async()=>{
  const s=setup();expect(s.gate.ensure(s.action)).toBe(false);
  expect(s.dialog.open).toBe(true);expect(s.checkbox).toHaveFocus();expect(s.confirmButton).toBeDisabled();
  s.confirmButton.click();expect(s.action).not.toHaveBeenCalled();
  s.acknowledge();expect(s.confirmButton).toBeEnabled();
  s.confirmButton.click();s.confirmButton.click();await Promise.resolve();
  expect(s.inline).toBeChecked();expect(s.dialog.open).toBe(false);expect(s.action).toHaveBeenCalledTimes(1);
  expect(s.gate.ensure(s.action)).toBe(true);expect(s.action).toHaveBeenCalledTimes(1);
});

test.each(['button','escape','navigation','changed-gun','late-changed-gun'])('%s cancels pending intent without capture',async how=>{
  const s=setup();s.gate.ensure(s.action);
  if(how==='button')s.cancelButton.click();
  if(how==='escape'){s.dialog.dispatchEvent(new Event('cancel'));s.dialog.close();}
  if(how==='navigation')s.gate.cancel();
  if(how==='changed-gun')s.changeOwner();
  s.acknowledge();s.confirmButton.click();
  if(how==='late-changed-gun')s.changeOwner();
  await Promise.resolve();expect(s.action).not.toHaveBeenCalled();
});

test('a rejected capture reports the failure after closing; a later request gets a fresh acknowledgement',async()=>{
  const s=setup();s.action.mockRejectedValueOnce(new Error('microphone denied'));
  s.gate.ensure(s.action);s.gate.ensure(jest.fn());s.acknowledge();s.confirmButton.click();
  await new Promise(resolve=>setTimeout(resolve,0));
  expect(s.dialog.open).toBe(false);expect(s.onError).toHaveBeenCalledWith(expect.objectContaining({message:'microphone denied'}));
  s.inline.checked=false;s.gate.ensure(s.action);expect(s.checkbox).not.toBeChecked();expect(s.confirmButton).toBeDisabled();
  s.gate.cancel();s.gate.cancel();
});
