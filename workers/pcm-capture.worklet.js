/* Web Audio capture is output-muted by its caller. This worker sends PCM only
 * to the same page, never to a remote service, and does not save recordings. */
class PcmCaptureProcessor extends AudioWorkletProcessor {
  constructor() {
    super();
    this.size = 1024;
    this.buffer = new Float32Array(this.size);
    this.used = 0;
    this.startFrame = 0;
  }
  process(inputs, outputs) {
    for (const output of outputs) for (const channel of output) channel.fill(0);
    const input = inputs[0]?.[0];
    if (!input) { this.used = 0; return true; }
    let i = 0;
    while (i < input.length) {
      if (this.used && this.startFrame + this.used !== currentFrame + i) this.used = 0;
      if (this.used === 0) this.startFrame = currentFrame + i;
      const length = Math.min(input.length - i, this.size - this.used);
      this.buffer.set(input.subarray(i, i + length), this.used);
      this.used += length;
      i += length;
      if (this.used === this.size) {
        const pcm = this.buffer;
        this.port.postMessage({ samples: pcm, startFrame: this.startFrame }, [pcm.buffer]);
        this.buffer = new Float32Array(this.size);
        this.used = 0;
      }
    }
    return true;
  }
}
registerProcessor('pcm-capture', PcmCaptureProcessor);
