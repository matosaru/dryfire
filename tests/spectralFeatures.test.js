import {extractSpectralFeatures,analyzeRecording} from '../src/audio.js';

const rate=16000;
function tone(frequency,amplitude=.08){const data=new Float32Array(rate*.8);for(let i=0;i<data.length;i++)data[i]=amplitude*Math.sin(2*Math.PI*frequency*i/rate);return data;}

test('version-three spectral features are finite, bounded and frequency-sensitive',()=>{
 const low=extractSpectralFeatures(tone(500),rate),high=extractSpectralFeatures(tone(3500),rate);
 expect(low).toHaveLength(23);expect(high).toHaveLength(23);
 expect(low.every(Number.isFinite)).toBe(true);expect(high.every(Number.isFinite)).toBe(true);
 expect(low.slice(15)).not.toEqual(high.slice(15));
 expect(analyzeRecording(tone(1000),rate).spectralFeatures).toHaveLength(23);
});

test('spectral extraction validates PCM and sample rate',()=>{
 expect(()=>extractSpectralFeatures([],rate)).toThrow(TypeError);
 expect(()=>extractSpectralFeatures(new Float32Array(20),800)).toThrow(TypeError);
});
