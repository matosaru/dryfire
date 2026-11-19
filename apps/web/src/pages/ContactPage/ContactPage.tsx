import { PageHeading } from '@dryfire/ui/PageHeading';
import { InformationCard } from '@dryfire/ui/InformationCard';
import {CONTACT_EMAIL,EmailContact} from './EmailContact.tsx';
import {useLocaleMessages} from '../../localization/runtime.ts';

export interface ContactPageProps { onBack?: () => void }

export function ContactPage({ onBack }: ContactPageProps) {
  const {t}=useLocaleMessages('contact');
  return <>
    <PageHeading id="contact-title" title={t('page.title')} backLabel={t('page.back')} onBack={onBack} />
    <InformationCard id="contactEmailTitle" title={t('card.title')} className="about-contact">
      <p>{t('card.description')}</p>
      <EmailContact labels={{copy:t('email.copy'),copied:t('email.copied'),unavailable:t('email.unavailable',{email:CONTACT_EMAIL}),hint:t('email.hint')}} />
      <p className="muted small">{t('privacy')}</p>
    </InformationCard>
  </>;
}
