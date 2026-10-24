let Processor, messages;
beforeAll(async () => {
  globalThis.AudioWorkletProcessor = class { constructor() { this.port = { postMessage: (...args) => messages.push(args) }; } };
  globalThis.registerProcessor = (name, ctor) => { expect(name).toBe('pcm-capture'); Processor = ctor; };
  await import('../workers/pcm-capture.worklet.js');
});
afterAll(() => { delete globalThis.AudioWorkletProcessor; delete globalThis.registerProcessor; delete globalThis.currentFrame; });
beforeEach(() => { messages = []; globalThis.currentFrame = 0; });

test('outputs silence and transfers one complete PCM buffer with its capture frame', () => {
  const capture = new Processor();
  const output = new Float32Array(1024).fill(1);
  const samples = Float32Array.from({ length: 1024 }, (_, i) => i / 1024);
  expect(capture.process([[samples]], [[output]])).toBe(true);
  expect(output.every(value => value === 0)).toBe(true);
  expect(messages).toHaveLength(1);
  expect(messages[0][0]).toEqual({ samples, startFrame: 0 });
  expect(messages[0][1]).toEqual([messages[0][0].samples.buffer]);
});

test('partial frames accumulate, while missing input discards an incomplete event', () => {
  const capture = new Processor();
  capture.process([[new Float32Array(512).fill(0.25)]], []);
  expect(messages).toHaveLength(0);
  globalThis.currentFrame = 512;
  capture.process([], []);
  globalThis.currentFrame = 1024;
  capture.process([[new Float32Array(1024).fill(0.5)]], []);
  expect(messages).toHaveLength(1);
  expect(messages[0][0].startFrame).toBe(1024);
  expect(messages[0][0].samples.every(value => value === 0.5)).toBe(true);
});

test('a capture discontinuity resets partial PCM instead of inventing a continuous onset', () => {
  const capture = new Processor();
  capture.process([[new Float32Array(512).fill(0.25)]], []);
  globalThis.currentFrame = 2048;
  capture.process([[new Float32Array(512).fill(0.5)]], []);
  globalThis.currentFrame = 2560;
  capture.process([[new Float32Array(512).fill(0.75)]], []);
  expect(messages).toHaveLength(1);
  expect(messages[0][0].startFrame).toBe(2048);
  expect([...messages[0][0].samples.slice(0,512)]).toEqual(Array(512).fill(0.5));
  expect([...messages[0][0].samples.slice(512)]).toEqual(Array(512).fill(0.75));
});
