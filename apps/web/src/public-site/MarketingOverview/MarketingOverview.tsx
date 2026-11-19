import type {ReactNode} from 'react';
import {InformationCard} from '@dryfire/ui/InformationCard';
// @ts-expect-error Shared runtime mode registry remains JavaScript.
import {PRACTICE_MODES} from '../../../../../src/practiceModes.js';
import {guidePathFor} from '../../../../../src/appPaths.js';
import {useLocaleMessages} from '../../localization/runtime.ts';
export type MarketingOverviewProps={full?:boolean;variant?:'overview'|'links';afterIntro?:ReactNode;namespace?:'about'|'public-site'};
/** Retained marketing content, shared by About and the public mode directory. */
export function MarketingOverview({full=false,variant='overview',afterIntro,namespace='about'}:MarketingOverviewProps){
 const {t}=useLocaleMessages(namespace);
 const links=<div className="marketing-mode-list">{PRACTICE_MODES.map((mode:{id:string;title:string;description:string})=><a key={mode.id} href={guidePathFor(mode.id)} data-app-route=""><strong>{t(`modes.${mode.id}.title`)}</strong><span>{t(`modes.${mode.id}.description`)}</span><span>{t('modes.readGuide')}</span></a>)}</div>;
 if(variant==='links')return links;
 return <>
  <div className="about-intro"><img className="brand-logo" src="/logo.svg" width="64" height="64" alt=""/><p className="about-name">Dry Fire With Ease</p><p className="muted small">{t('intro.version')}</p><h3>{t('intro.headlineOne')}<br/>{t('intro.headlineTwo')}</h3><p>{t('intro.description')}</p></div>
  {afterIntro}
  <InformationCard id="aboutRoutineTitle" title={t('routine.title')}><ol><li>{t('routine.stepOne')}</li><li>{t('routine.stepTwo')}</li><li>{t('routine.stepThree')}</li></ol><p id="aboutFeatureSummary" data-full-summary={t('features.full')}>{t(full?'features.full':'features.free')}</p><p>{t('routine.note')}</p><a className="button primary wide-action marketing-start" href="/" data-app-route="">{t('routine.openApp')}</a></InformationCard>
  <InformationCard id="aboutModesTitle" title={t('modes.title')}>{links}</InformationCard>
 </>;
}
