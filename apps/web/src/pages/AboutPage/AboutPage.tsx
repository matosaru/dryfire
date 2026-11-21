import {MarketingOverview} from '../../public-site/MarketingOverview';
import { PageHeading } from '@dryfire/ui/PageHeading';
import { InformationCard } from '@dryfire/ui/InformationCard';
import {useLocaleMessages} from '../../localization/runtime.ts';

export interface AboutPageProps { full?: boolean; onBack?: () => void }

export function AboutPage({ full = false, onBack }: AboutPageProps) {
  const {t}=useLocaleMessages('about');
  const {t:common}=useLocaleMessages('common');
  return <>
    <PageHeading id="about-title" title={t('page.title')} backLabel={common('navigation.back')} onBack={onBack} />
    <MarketingOverview full={full} namespace="about" afterIntro={<InformationCard id="aboutBetaTitle" title={t('feedback.title')}><p>{t('feedback.description')}</p></InformationCard>} />
    <InformationCard id="aboutDataTitle" title={t('saved.title')}>
      <p>{t('saved.description')}</p>
    </InformationCard>
    <section className="about-limits" aria-labelledby="aboutSafetyTitle">
      <h3 id="aboutSafetyTitle">{t('safety.title')}</h3>
      <p className="muted small">{t('safety.description')}</p>
    </section>
  </>;
}
