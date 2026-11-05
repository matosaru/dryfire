import {classify} from './classifier.js';
import {extractSpectralFeatures} from './spectralFeatures.js';

/** Candidate-only decision for labelled Sound Check; never drives practice. */
export function recognizeRecordingV3(examples,samples,sampleRate,{enabledLabels,negativeExamples=[]}={}){
 const compatible=examples.filter(row=>row.spectralFeatureVersion===3&&row.spectralFeatures?.length===23).map(row=>({...row,features:row.spectralFeatures}));
 if(compatible.length<3)return null;
 const negatives=negativeExamples.filter(row=>row.spectralFeatureVersion===3&&row.spectralFeatures?.length===23).map(row=>({...row,features:row.spectralFeatures}));
 return classify(compatible,extractSpectralFeatures(samples,sampleRate),{enabledLabels,negativeExamples:negatives});
}
