import { PageHeading } from '@dryfire/ui/PageHeading';
import { InformationCard } from '@dryfire/ui/InformationCard';

export interface ContactPageProps { onBack?: () => void }

export function ContactPage({ onBack }: ContactPageProps) {
  return <>
    <PageHeading id="contact-title" title="Contact" backLabel="Back" onBack={onBack} />
    <InformationCard id="contactEmailTitle" title="Get in touch" className="about-contact">
      <p>Have a question, feedback or a bug to report? We'd like to hear from you.</p>
      <a className="about-email" href="mailto:easydryfire@gmail.com">easydryfire@gmail.com</a>
      <p className="muted small">Opens your email app. You can also copy the address.</p>
    </InformationCard>
  </>;
}
