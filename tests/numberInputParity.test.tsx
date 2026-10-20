/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import { readFileSync } from 'node:fs';
import { configureNumberInputs } from './fixtures/legacy-number-input-initializer.js';
import { renderNumberInput } from '../apps/web/src/app/renderNumberInput.tsx';
const fields = JSON.parse(readFileSync(new URL('./fixtures/legacy-number-inputs.json', import.meta.url), 'utf8')) as Record<string,string>[];
const attributes=(node: Element)=>[...node.attributes].map(attr=>[attr.name,attr.value]).sort();

test.each(fields)('prerendered $id matches the existing initialized input and hint', field => {
  const old=document.createElement('label');
  const input=document.createElement('input');
  for (const [key,value] of Object.entries(field)) input.setAttribute(key,value);
  if (field.id !== 'maxResults') input.required=true;
  old.append(input); document.body.append(old); configureNumberInputs(document);
  const next=document.createElement('label'); next.innerHTML=renderNumberInput(field.id,field.value,field.name);
  expect([...next.children].map(attributes)).toEqual([...old.children].map(attributes));
  expect(next.textContent).toBe(old.textContent);
  expect((next.firstElementChild as HTMLInputElement).value).toBe(input.value);
  old.remove();
});

test('unregistered numeric controls fail the build rather than silently losing validation',()=>{
  expect(()=>renderNumberInput('unknown','1')).toThrow('Unknown numeric control');
});
