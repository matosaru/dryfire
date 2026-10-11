// Test-only Web Audio boundary. The real app renders/processes this synthetic input.
// No test module is bundled into dist and no physical microphone is requested.
export function installSyntheticMedia() {
  Math.random = () => 0.5;
  const nodes = [];
  const cues = [];
  const parameter = () => ({ value: 0, setValueAtTime() {}, linearRampToValueAtTime() {}, exponentialRampToValueAtTime() {} });
  const connector = () => ({ connect() {}, disconnect() {} });
  class Context {
    constructor() { this.sampleRate = 48000; this.state = 'running'; this.origin = performance.now(); this.destination = connector(); this.audioWorklet = { addModule: async () => {} }; }
    get currentTime() { return (performance.now() - this.origin) / 1000; }
    async resume() { this.state = 'running'; }
    async close() { this.state = 'closed'; }
    createMediaStreamSource() { return connector(); }
    createGain() { return { ...connector(), gain: parameter() }; }
    createOscillator() { return { ...connector(), frequency: parameter(), start: () => cues.push(this.currentTime * 1000), stop() {} }; }
  }
  window.AudioContext = Context;
  window.AudioWorkletNode = class {
    constructor(context) { this.context = context; this.port = { onmessage: null, postMessage() {}, close() {} }; nodes.push(this); }
    connect() { queueMicrotask(() => { if (window.__visualAudioAutoReady !== false) window.__visualAudio.ready(); }); }
    disconnect() {}
  };
  const media = {
    getSupportedConstraints: () => ({ noiseSuppression: true, autoGainControl: true, echoCancellation: true }),
    getUserMedia: async constraints => {
      const track = { readyState: 'live', onended: null, stop() { this.readyState = 'ended'; }, getSettings: () => ({ noiseSuppression: constraints.audio.noiseSuppression, autoGainControl: constraints.audio.autoGainControl }) };
      return { getTracks: () => [track], getAudioTracks: () => [track] };
    },
  };
  Object.defineProperty(navigator, 'mediaDevices', { configurable: true, value: media });
  Object.defineProperty(navigator, 'vibrate', { configurable: true, value: () => true });
  window.__visualAudio = {
    cues,
    inputActive() { return nodes.some(node => !!node.port.onmessage); },
    nowMs() { return [...nodes].reverse().find(n => n.port.onmessage).context.currentTime * 1000; },
    ready() {
      const node = [...nodes].reverse().find(n => n.port.onmessage);
      if (!node) throw new Error('No active synthetic microphone');
      node.port.onmessage({ data: { samples: new Float32Array(Math.round(node.context.sampleRate * .12)),
        startFrame: Math.max(0, Math.round((node.context.currentTime - .12) * node.context.sampleRate)) } });
    },
    emit(label = 'trigger', onsetMs) {
      const node = [...nodes].reverse().find(n => n.port.onmessage);
      if (!node) throw new Error('No active synthetic microphone');
      const spec = { trigger: [2800, .065, .12], rack: [810, .085, .23], draw: [170, .045, .18], reload: [420, .16, .27], unknown: [16000, .6, .20] }[label];
      const sr = node.context.sampleRate, [frequency, amplitude, duration] = spec;
      const samples = new Float32Array(Math.round(sr * (.2 + duration + .4)));
      for (let i = 0; i < Math.round(sr * duration); i++) samples[Math.round(sr * .2) + i] = Math.sin(2 * Math.PI * frequency * i / sr) * amplitude;
      const start = onsetMs === undefined ? node.context.currentTime - samples.length / sr : onsetMs / 1000 - .2;
      node.port.onmessage({ data: { samples, startFrame: Math.max(0, Math.round(start * sr)) } });
    },
  };
}
