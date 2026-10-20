import { NUMBER_INPUTS, parseNumberInput } from '../src/inputLimits.js';
test.each(Object.keys(NUMBER_INPUTS))('%s accepts approved boundaries and rejects invalid numeric input', id => {
  const { min, max, step } = NUMBER_INPUTS[id];
  expect(parseNumberInput(String(min), id)).toBe(min);
  expect(parseNumberInput(max, id)).toBe(max);
  for (const value of ['', ' ', NaN, Infinity, 'not a number', min - step, max + step, min + step / 2, null, true]) {
    expect(() => parseNumberInput(value, id)).toThrow(TypeError);
  }
});
test('unregistered numeric fields fail closed rather than accepting an unbounded value', () => {
  expect(() => parseNumberInput(1, 'unregistered')).toThrow('Unknown numeric input.');
});
