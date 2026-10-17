import { readFileSync } from 'node:fs';
import { PRACTICE_MODES, practiceMode, practiceDefinition } from '../src/practiceSession.js';
const legacy=JSON.parse(readFileSync(new URL('./fixtures/practice-modes.json',import.meta.url),'utf8'));

test('the public catalog retains every released identifier, title, description, order and lookup identity', () => {
  expect(PRACTICE_MODES).toEqual(legacy);
  expect(Object.isFrozen(PRACTICE_MODES)).toBe(true);
  for(const [index,value] of legacy.entries()) expect(practiceMode(value.id)).toBe(PRACTICE_MODES[index]);
  for(const value of ['unknown','Single','',null,undefined]) expect(practiceMode(value)).toBeUndefined();
});

test('the runtime definition port preserves the same allowed IDs and stored titles', () => {
  for(const value of legacy) expect(practiceDefinition(value.id)).toEqual({id:value.id,title:value.title});
  for(const value of ['unknown','Single','',null,undefined]) expect(practiceDefinition(value)).toBeUndefined();
});
