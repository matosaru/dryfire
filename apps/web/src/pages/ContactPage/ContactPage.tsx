import './ContactPage.css';
import { PageHeading } from '@dryfire/ui/PageHeading';
import { InformationCard } from '@dryfire/ui/InformationCard';
import {EmailContact} from './EmailContact.tsx';

export interface ContactPageProps { onBack?: () => void }

export function ContactPage({ onBack }: ContactPageProps) {
  return <>
    <PageHeading id="contact-title" title="Contact" backLabel="Back" onBack={onBack} />
    <InformationCard id="contactEmailTitle" title="Get in touch" className="about-contact">
      <p>Have a question, feedback or a bug to report? We'd like to hear from you.</p>
      <EmailContact />
      <p className="muted small">The email link opens your configured email app. Do not send private backups or raw recordings unless you deliberately choose to share them.</p>
    </InformationCard>
  </>;
}
