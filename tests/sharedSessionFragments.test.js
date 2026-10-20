/**
 * @jest-environment jsdom
 * @jest-environment-options {"customExportConditions":["node","node-addons"]}
 */
import {renderSessionFragments} from '@dryfire/testing/session-fragments';
import {readFileSync} from 'node:fs';
import {serialize,deserialize} from 'node:v8';
import {guideCases,guideScenario,nativeExampleMarkup,guideDigest} from './helpers/guidePresentation.js';
const baseline=JSON.parse(readFileSync(new URL('./fixtures/session-fragments/guide-signatures.json',import.meta.url),'utf8'));
const originalClone=globalThis.structuredClone;
beforeAll(()=>{globalThis.structuredClone=value=>deserialize(serialize(value));});
afterAll(()=>{globalThis.structuredClone=originalClone;});
test.each(guideCases)('%s original shared presentation matches the pre-extraction complete-frame characterization',name=>{const {guide,scenario}=guideScenario(name),doc=document.implementation.createHTMLDocument('');doc.body.innerHTML=nativeExampleMarkup();expect(guideDigest(doc,guide,scenario)).toEqual(baseline.cases[name]);});

test.each(guideCases)('%s typed shared live/example fragments preserve every characterized engine frame',name=>{const {guide,scenario}=guideScenario(name),doc=document.implementation.createHTMLDocument('');const fragments=renderSessionFragments();doc.body.innerHTML='<div id="practiceGuideExample">'+['examplePracticeRun','examplePracticeReview','exampleSessionRun','exampleSessionReview'].map(key=>fragments[key]).join('')+'</div>';expect(guideDigest(doc,guide,scenario)).toEqual(baseline.cases[name]);});
