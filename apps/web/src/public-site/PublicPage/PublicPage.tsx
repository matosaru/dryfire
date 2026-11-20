import {AppShell} from '@dryfire/ui/AppShell';
import {MarketingOverview} from '../MarketingOverview';
import {EmailContact} from '../../pages/ContactPage/EmailContact.tsx';
import {useLocaleMessages} from '../../localization/runtime.ts';
import type {ReactNode} from 'react';

type Guide={id:string;title:string;purpose:string;measures:string;steps:string[];expect:string;requires:string};
export type PublicRoute={id:string;path:string;title:string;heading:string;description:string;guide?:Guide;locale?:'en'|'de'|'nl'};
export type PublicPageProps={route:PublicRoute;routes:PublicRoute[]};

function Panel({title,children}:{title:string;children:ReactNode}){return <section className="public-panel"><h2>{title}</h2>{children}</section>;}

export function PublicPage({route}:PublicPageProps){
 const {t,locale}=useLocaleMessages('public-site');
 const {t:guideText}=useLocaleMessages('practice-guide');
 const {t:helpText}=useLocaleMessages('help');
 const {t:common}=useLocaleMessages('common');
 const guide=route.guide;
 const localizedPath=(path:string)=>locale==='en'?path:`/${locale}${path==='/'?'/':path}`;
 const routeKey=`routes.${route.id}`;
 const guideKey=`manuals.${route.id}`;
 const baseRoutePath=route.path.replace(/^\/(?:de|nl)(?=\/)/,'');
 const modePath=guide?localizedPath('/'+baseRoutePath.slice(1).replace('-guide/','/')):'/';
 const links={home:localizedPath('/'),learn:localizedPath('/learn/'),drills:localizedPath('/drills/'),history:localizedPath('/history/'),about:localizedPath('/about/'),contact:localizedPath('/contact/'),settings:localizedPath('/settings/')};
 const labels={
  navigation:{home:common('navigation.home'),learn:common('navigation.learn'),drills:common('navigation.drills'),history:common('navigation.history')},
  navigationLabel:common('navigation.label'),
  header:{home:common('header.home'),about:common('header.about'),contact:common('header.contact'),settings:common('header.settings'),information:common('header.information'),beta:common('header.beta')},
 };
 return <AppShell view={['about','contact'].includes(route.id)?route.id:'public'} status={common('header.beta')} labels={labels} links={links}>
  <nav className="public-top-links" aria-label={t('navigation.aria')}><a href={localizedPath('/')}>{t('navigation.home')}</a><a href={localizedPath('/practice-modes/')}>{t('navigation.practiceModes')}</a><a href={localizedPath('/help/')}>{t('navigation.help')}</a></nav>
  <article id="public-content" className="public-article"><p className="public-kicker">{t(guide?'kicker.guide':'kicker.beta')}</p><h1>{t(`${routeKey}.heading`)}</h1><p className="public-intro">{t(`${routeKey}.description`)}</p>
  {route.id==='home'&&<MarketingOverview/>}
  {route.id==='practice'&&<Panel title={t('practice.title')}><MarketingOverview variant="links"/></Panel>}
  {guide&&<><Panel title={t('guide.measures')}><p>{guideText(`${guideKey}.measures`)}</p></Panel><p><a href={`/guide-examples/${guide.id}.gif`}>{t('guide.example')}</a></p><p className="muted small">{t('guide.exampleNote')}</p><Panel title={t('guide.how')}><ol>{guideText(`${guideKey}.steps`).split('\n').filter(Boolean).map(step=><li key={step}>{step}</li>)}</ol></Panel><Panel title={t('guide.goodToKnow')}><p>{guideText(`${guideKey}.expect`)}</p><p>{guideText(`${guideKey}.requires`)}</p></Panel><a className="button primary public-start" href={modePath}>{t('practice.configure')}</a><p className="muted small">{t('practice.configurationNote')}</p></>}
  {route.id==='sequence'&&<><Panel title={t('sequence.builtIn')}><ul><li>{t('sequence.rackTrigger')}</li><li>{t('sequence.magazineTrigger')}</li><li>{t('sequence.drawMagazineTrigger')}</li></ul><p>{t('sequence.distinctSounds')}</p></Panel><Panel title={t('sequence.repetition')}><ol><li>{t('sequence.stepOne')}</li><li>{t('sequence.stepTwo')}</li><li>{t('sequence.stepThree')}</li></ol><p>{t('sequence.timing')}</p></Panel><a className="button primary public-start" href={localizedPath('/drills/')}>{t('sequence.choose')}</a></>}
  {route.id==='calibration'&&<><Panel title={t('calibration.record')}><ol><li>{t('calibration.stepOne')}</li><li>{t('calibration.stepTwo')}</li><li>{t('calibration.stepThree')}</li><li>{t('calibration.stepFour')}</li></ol></Panel><Panel title={t('calibration.before')}><p>{t('calibration.beforeBody')}</p></Panel><Panel title={t('calibration.missed')}><p>{t('calibration.missedBody')}</p></Panel><a className="button primary public-start" href={localizedPath('/learn/')}>{t('calibration.openLearn')}</a></>}
  {route.id==='help'&&<><Panel title={helpText('microphone.title')}><p>{helpText('microphone.body')}</p><a href={localizedPath('/trigger-click-calibration-guide/')}>{helpText('microphone.guideLink')}</a></Panel><Panel title={helpText('soundCheck.title')}><p>{helpText('soundCheck.body')}</p><a href={localizedPath('/learn/')}>{helpText('soundCheck.learnLink')}</a></Panel><Panel title={helpText('startSound.title')}><p>{helpText('startSound.body')}</p></Panel><Panel title={helpText('iphone.title')}><ol><li>{helpText('iphone.stepOne')}</li><li>{helpText('iphone.stepTwo')}</li><li>{helpText('iphone.stepThree')}</li></ol><p>{helpText('iphone.note')}</p></Panel><Panel title={helpText('backup.title')}><p>{helpText('backup.body')}</p><a href={localizedPath('/settings/')}>{helpText('backup.settingsLink')}</a></Panel></>}
  {route.id==='about'&&<><Panel title={t('about.feedback')}><p>{t('about.feedbackBody')}</p><a href={localizedPath('/contact/')}>{t('about.contact')}</a></Panel><Panel title={t('about.included')}><p>{t('about.includedBody')}</p><p>{t('about.limits')}</p></Panel></>}
  {route.id==='contact'&&<Panel title={t('contact.email')}><p>{t('contact.prompt')}</p><EmailContact/><p>{t('contact.privacy')}</p></Panel>}
  <Panel title={t('responsibility.title')}><p>{t('responsibility.body')}</p></Panel>
  <nav className="public-related" aria-label={t('related.aria')}><a href={localizedPath('/sequence-drills-guide/')}>{t('related.sequence')}</a><a href={localizedPath('/trigger-click-calibration-guide/')}>{t('related.calibration')}</a></nav>
  </article>
 </AppShell>;
}
