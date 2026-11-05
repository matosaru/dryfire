import {extractFeatures} from './audio.js';

/** Candidate-only version 3 vector. This module stays outside startup bundles. */
export function extractSpectralFeatures(samples,sampleRate){
 if(!(samples instanceof Float32Array)||!samples.length||!Number.isFinite(sampleRate)||sampleRate<1000)throw new TypeError('Expected Float32Array PCM samples and a valid sample rate.');
 const width=Math.min(samples.length,Math.floor(sampleRate*.8)),frame=Math.max(64,Math.floor(sampleRate*.01));
 let loudest=0,energy=0;
 for(let start=0;start+frame<=samples.length;start+=frame){let sum=0;for(let i=start;i<start+frame;i++)sum+=samples[i]**2;if(sum>energy){energy=sum;loudest=start;}}
 const eventStart=Math.max(0,Math.min(samples.length-width,loudest-Math.floor(width*.35))),event=samples.subarray(eventStart,eventStart+width),base=extractFeatures(event,sampleRate);
 const size=Math.min(event.length,Math.max(128,Math.floor(sampleRate*.04)));
 let peakIndex=0,peakValue=0;
 for(let i=0;i<event.length;i+=1)if(Math.abs(event[i])>peakValue){peakValue=Math.abs(event[i]);peakIndex=i;}
 const start=Math.max(0,Math.min(event.length-size,peakIndex-Math.floor(size*.25))),window=event.subarray(start,start+size),nyquist=sampleRate/2;
 const power=[250,500,1000,2000,3000,4000,6000,8000].map(value=>Math.min(value,nyquist*.9)).map(frequency=>{
  let real=0,imaginary=0;
  for(let i=0;i<window.length;i+=1){const hann=window.length>1?.5-.5*Math.cos(2*Math.PI*i/(window.length-1)):1,angle=2*Math.PI*frequency*i/sampleRate;real+=window[i]*hann*Math.cos(angle);imaginary-=window[i]*hann*Math.sin(angle);}
  return real*real+imaginary*imaginary;
 });
 const total=power.reduce((sum,value)=>sum+value,0)||1;
 return[...base,...power.map(value=>Math.log1p(value/total*1000))];
}
