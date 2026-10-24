import type {ReactNode} from 'react';
import {InformationCard} from '@dryfire/ui/InformationCard';
// @ts-expect-error Shared runtime mode registry remains JavaScript.
import {PRACTICE_MODES} from '../../../../../src/practiceModes.js';
// @ts-expect-error Shared runtime route registry remains JavaScript.
import {guidePathFor} from '../../../../../src/appPaths.js';
import {aboutFeatureSummary} from '../../pages/AboutPage/AboutPage.copy';
export type MarketingOverviewProps={full?:boolean;variant?:'overview'|'links';afterIntro?:ReactNode};
/** Retained marketing content, shared by About and the public mode directory. */
export function MarketingOverview({full=false,variant='overview',afterIntro}:MarketingOverviewProps){
 const links=<div className="marketing-mode-list">{PRACTICE_MODES.map((mode:{id:string;title:string;description:string})=><a key={mode.id} href={guidePathFor(mode.id)} data-app-route=""><strong>{mode.title}</strong><span>{mode.description}</span><span>Read the guide</span></a>)}</div>;
 if(variant==='links')return links;
 return <>
  <div className="about-intro"><img className="brand-logo" src="/logo.svg" width="64" height="64" alt=""/><p className="about-name">Dry Fire With Ease</p><p className="muted small">Sound trainer · Beta · v0.8.0</p><h3>Dry-fire practice,<br/>made simple.</h3><p>Use your device's microphone to recognize your learned trigger click, time your repetitions and review your progress.</p></div>
  {afterIntro}
  <InformationCard id="aboutRoutineTitle" title="A simple practice routine"><ol><li>Add a gun and learn its trigger click.</li><li>Choose a practice mode or drill.</li><li>Follow the start signal and review your saved results.</li></ol><p id="aboutFeatureSummary" data-full-summary={aboutFeatureSummary(true)}>{aboutFeatureSummary(full)}</p><p>No account or payment details are required. The free app creates up to two guns and keeps compatible existing profiles.</p><a className="button primary wide-action marketing-start" href="/" data-app-route="">Open the free app</a></InformationCard>
  <InformationCard id="aboutModesTitle" title="Four ways to practice">{links}</InformationCard>
 </>;
}
