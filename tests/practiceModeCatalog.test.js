/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import { readFileSync } from 'node:fs';
import { PRACTICE_MODES, practiceMode, practiceDefinition } from '../src/practiceSession.js';
import { renderPracticeCatalog } from '../apps/web/src/app/renderPracticeCatalog.tsx';
const legacy=JSON.parse(readFileSync(new URL('./fixtures/practice-modes.json',import.meta.url),'utf8'));

test('the runtime mode catalog retains released IDs and lookup identity while UI copy comes from catalogs', () => {
  expect(PRACTICE_MODES).toEqual(legacy.map(({id})=>({id})));
  expect(Object.isFrozen(PRACTICE_MODES)).toBe(true);
  for(const [index,value] of legacy.entries()) expect(practiceMode(value.id)).toBe(PRACTICE_MODES[index]);
  const template=document.createElement('div');template.innerHTML=renderPracticeCatalog(PRACTICE_MODES);
  expect([...template.querySelectorAll('.preset-card')].map(card=>[card.querySelector('h3').textContent,card.querySelector('p').textContent])).toEqual(legacy.map(({title,description})=>[title,description]));
  for(const value of ['unknown','Single','',null,undefined]) expect(practiceMode(value)).toBeUndefined();
});

test('the runtime definition port preserves the same allowed IDs and stored titles', () => {
  for(const value of legacy) expect(practiceDefinition(value.id)).toEqual({id:value.id,title:value.title});
  for(const value of ['unknown','Single','',null,undefined]) expect(practiceDefinition(value)).toBeUndefined();
});
