import {MarketingOverview} from '../../public-site/MarketingOverview';
import { PageHeading } from '@dryfire/ui/PageHeading';
import { InformationCard } from '@dryfire/ui/InformationCard';

export interface AboutPageProps { full?: boolean; onBack?: () => void }

export function AboutPage({ full = false, onBack }: AboutPageProps) {
  return <>
    <PageHeading id="about-title" title="About" onBack={onBack} />
    <MarketingOverview full={full} afterIntro={<InformationCard id="aboutBetaTitle" title="Feedback welcome"><p>This app is in beta. All feedback and suggestions are welcome. Visit Contact to share an idea or report a problem.</p></InformationCard>} />
    <InformationCard id="aboutDataTitle" title="Saved on your device">
      <p>No account is required. Your profiles, learned sound features, drills and history stay in this browser. Use Settings → Export backup to keep a recovery copy before changing device or clearing browser data.</p>
    </InformationCard>
    <section className="about-limits" aria-labelledby="aboutSafetyTitle">
      <h3 id="aboutSafetyTitle">Practice responsibly</h3>
      <p className="muted small">Complete the safety check before recording or practice. Sound recognition is experimental. It cannot verify an unloaded firearm, aim or safe handling, and is not a calibrated measurement instrument.</p>
    </section>
  </>;
}
