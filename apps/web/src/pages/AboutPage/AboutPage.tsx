import { PageHeading } from '@dryfire/ui/PageHeading';
import { InformationCard } from '@dryfire/ui/InformationCard';

export interface AboutPageProps { full?: boolean; onBack?: () => void }

export function AboutPage({ full = false, onBack }: AboutPageProps) {
  return <>
    <PageHeading id="about-title" title="About" onBack={onBack} />
    <div className="about-intro">
      <img className="brand-logo" src="/logo.svg" width="64" height="64" alt="" />
      <p className="about-name">Dry Fire With Ease</p><p className="muted small">Sound trainer · Beta · v0.8.0</p>
      <h3>Dry-fire practice,<br />made simple.</h3>
      <p>Use your device's microphone to recognize your learned trigger click, time your repetitions and review your progress.</p>
    </div>
    <InformationCard id="aboutBetaTitle" title="Feedback welcome">
      <p>This app is in beta. All feedback and suggestions are welcome. Visit Contact to share an idea or report a problem.</p>
    </InformationCard>
    <InformationCard id="aboutRoutineTitle" title="A simple practice routine">
      <ol><li>Learn your trigger click.</li><li>Choose a practice mode or drill.</li><li>Follow the start signal and review your saved results.</li></ol>
      <p id="aboutFeatureSummary">{full
        ? 'Keep separate profiles for up to five guns, create custom drills and view timing trends. Other sound categories are optional unless your drill uses them.'
        : 'Learn your trigger click, choose a built-in practice mode and review saved timing results. Other sound categories are optional unless your drill uses them.'}</p>
    </InformationCard>
    <InformationCard id="aboutDataTitle" title="Saved on your device">
      <p>No account is required. Your profiles, learned sound features, drills and history stay in this browser. Use Settings → Export backup to keep a recovery copy before changing device or clearing browser data.</p>
    </InformationCard>
    <section className="about-limits" aria-labelledby="aboutSafetyTitle">
      <h3 id="aboutSafetyTitle">Practice responsibly</h3>
      <p className="muted small">Complete the safety check before recording or practice. Sound recognition is experimental. It cannot verify an unloaded firearm, aim or safe handling, and is not a calibrated measurement instrument.</p>
    </section>
  </>;
}
