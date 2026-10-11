import { createEventDetector } from '../src/eventDetector.js';

const rate = 8000;
function feed(detector, seconds, events = [], chunkSize = 256, ambient = 0) {
  const audio = new Float32Array(Math.round(seconds * rate));
  for (let i = 0; i < audio.length; i++) {
    const t = i / rate;
    audio[i] = Math.sin(2 * Math.PI * 400 * t) * ambient;
    for (const [start, duration, gain = 0.36] of events) {
      if (t >= start && t < start + duration) audio[i] += gain * Math.sin(2 * Math.PI * 750 * t);
    }
  }
  for (let start = 0; start < audio.length; start += chunkSize) {
    detector.push(audio.slice(start, Math.min(audio.length, start + chunkSize)));
  }
}

describe('automatic sound segmentation', () => {
  test('capture onset timestamps stay independent of callback chunk sizes', () => {
    const results = [128, 256, 2048].map(chunkSize => {
      const found = [];
      const detector = createEventDetector(rate, (_pcm, _rate, timing) => found.push(timing));
      const audio = new Float32Array(rate);
      for (let i = 1600; i < 2400; i++) audio[i] = 0.35 * Math.sin(i / 3);
      for (let i = 0; i < audio.length; i += chunkSize) detector.push(audio.slice(i, i + chunkSize), rate * 4 + i);
      return found;
    });
    expect(results[0]).toHaveLength(1);
    expect(results[0][0].onsetMs).toBe(4200);
    expect(results[1]).toEqual(results[0]);
    expect(results[2]).toEqual(results[0]);
  });

  test('reset discards unfinished audio; reset never revives a stopped detector', () => {
    const found = [];
    const detector = createEventDetector(rate, pcm => found.push(pcm));
    feed(detector, 0.25, [[0.2, 0.05]]);
    detector.reset();
    feed(detector, 0.5);
    expect(found).toHaveLength(0);
    feed(detector, 1, [[0.2, 0.1]]);
    expect(found).toHaveLength(1);
    detector.stop();
    detector.reset();
    feed(detector, 1, [[0.2, 0.1]]);
    expect(found).toHaveLength(1);
  });

  test('does not emit events for quiet room tone', () => {
    const found = [];
    const detector = createEventDetector(rate, pcm => found.push(pcm));
    feed(detector, 3, [], 256, 0.001);
    expect(found).toHaveLength(0);
  });

  test('captures a short transient and includes the preceding buffer', () => {
    const found = [];
    const detector = createEventDetector(rate, (pcm, sampleRate) => found.push({ pcm, sampleRate }));
    feed(detector, 2, [[0.7, 0.09]]);
    expect(found).toHaveLength(1);
    expect(found[0].sampleRate).toBe(rate);
    expect(found[0].pcm.length).toBeGreaterThan(rate * 0.27);
    expect(found[0].pcm.length).toBeLessThan(rate * 1.4);
    expect(Math.max(...found[0].pcm)).toBeGreaterThan(0.2);
  });

  test('segments two events with enough silence, without repeated detections', () => {
    const found = [];
    const detector = createEventDetector(rate, pcm => found.push(pcm));
    feed(detector, 3.5, [[0.5, 0.08], [2.1, 0.10]]);
    expect(found).toHaveLength(2);
  });

  test('continuously detects a four-action sequence with short pauses', () => {
    const found = [];
    const detector = createEventDetector(rate, pcm => found.push(pcm));
    feed(detector, 3.1, [
      [0.40, 0.055], [0.86, 0.075], [1.34, 0.05], [1.80, 0.09],
    ], 512);
    expect(found).toHaveLength(4);
    expect(found.every(pcm => pcm.length >= rate * 0.1)).toBe(true);
  });

  test('chunk size does not affect segmentation count', () => {
    const events = [[0.3, 0.055], [0.75, 0.09], [1.22, 0.04], [1.7, 0.09]];
    const counts = [128, 256, 2048].map(size => {
      let count = 0;
      const detector = createEventDetector(rate, () => { count += 1; });
      feed(detector, 2.3, events, size);
      return count;
    });
    expect(counts).toEqual([4, 4, 4]);
  });

  test('stopping releases buffered audio without emitting a late event', () => {
    const found = [];
    const detector = createEventDetector(rate, pcm => found.push(pcm));
    feed(detector, 0.3, [[0.15, 0.1]]);
    detector.stop();
    feed(detector, 2, [[0.8, 0.08]]);
    expect(found).toHaveLength(0);
  });
});
